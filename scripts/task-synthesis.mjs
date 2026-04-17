#!/usr/bin/env node

import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import { execFileSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'

import { buildMilestoneOracle } from './milestone-oracle.mjs'
import { evaluateTaskQuality } from './task-quality.mjs'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const ROOT_DIR = path.resolve(__dirname, '..')

const CANDIDATE_DOC = 'docs/TASK_SYNTHESIS_CANDIDATES.json'
const SYNTHESIS_MAX_AGE_MS = 6 * 60 * 60 * 1000
const SYNTHESIS_REDISPATCH_FREEZE_MS = Math.max(
  0,
  Number(process.env.WAR3_SYNTHESIS_REDISPATCH_FREEZE_SECONDS ?? 30 * 60),
) * 1000
const CANDIDATE_SAME_TITLE_FREEZE_MS = Math.max(
  0,
  Number(process.env.WAR3_SAME_TITLE_FREEZE_SECONDS ?? 6 * 60 * 60),
) * 1000

function readText(rootDir, relativePath) {
  return fs.readFileSync(path.join(rootDir, relativePath), 'utf8').replaceAll('\r\n', '\n')
}

function fileExists(rootDir, relativePath) {
  return fs.existsSync(path.join(rootDir, relativePath))
}

function run(command, args, options = {}) {
  return execFileSync(command, args, {
    cwd: ROOT_DIR,
    encoding: 'utf8',
    stdio: ['pipe', 'pipe', 'pipe'],
    ...options,
  }).trim()
}

function splitTableLine(line) {
  return line
    .trim()
    .split('|')
    .slice(1, -1)
    .map((cell) => cell.trim())
}

function lineIndex(lines, predicate) {
  for (let index = 0; index < lines.length; index += 1) {
    if (predicate(lines[index], index)) return index
  }
  return -1
}

function parseTableFromLines(lines, heading) {
  const headingIndex = lineIndex(lines, (line) => line.trim() === heading)
  if (headingIndex === -1) {
    throw new Error(`Heading not found: ${heading}`)
  }

  let start = headingIndex + 1
  while (start < lines.length && !lines[start].trim().startsWith('|')) {
    start += 1
  }
  if (start >= lines.length) {
    throw new Error(`Table not found after heading: ${heading}`)
  }

  let end = start
  while (end < lines.length && lines[end].trim().startsWith('|')) {
    end += 1
  }

  const tableLines = lines.slice(start, end)
  const headers = splitTableLine(tableLines[0])
  const rows = tableLines.slice(2).map((line) => {
    const cells = splitTableLine(line)
    return Object.fromEntries(headers.map((header, index) => [header, cells[index] ?? '']))
  })

  return { headers, rows }
}

function normalizeStatus(status) {
  return String(status ?? '').replaceAll('`', '').trim().toLowerCase()
}

function normalizeTitle(title) {
  return String(title ?? '').replaceAll('`', '').trim()
}

function parseTimestampMs(value) {
  const parsed = Date.parse(String(value ?? ''))
  return Number.isFinite(parsed) ? parsed : 0
}

function attemptTimestampMs(job) {
  if (normalizeStatus(job?.status) === 'running' && !job?.completedAt) {
    return Math.max(
      parseTimestampMs(job?.updatedAt),
      parseTimestampMs(job?.startedAt),
      parseTimestampMs(job?.createdAt),
    )
  }
  return (
    parseTimestampMs(job?.completedAt) ||
    parseTimestampMs(job?.updatedAt) ||
    parseTimestampMs(job?.startedAt) ||
    parseTimestampMs(job?.createdAt)
  )
}

function formatAttemptAge(timestampMs) {
  const ageSeconds = Math.max(0, Math.floor((Date.now() - timestampMs) / 1000))
  if (ageSeconds < 60) return `${ageSeconds}s ago`
  const ageMinutes = Math.floor(ageSeconds / 60)
  if (ageMinutes < 60) return `${ageMinutes}m ago`
  const ageHours = Math.floor(ageMinutes / 60)
  const remainMinutes = ageMinutes % 60
  return remainMinutes ? `${ageHours}h ${remainMinutes}m ago` : `${ageHours}h ago`
}

function findRecentSynthesisAttempt(jobs, title) {
  if (!SYNTHESIS_REDISPATCH_FREEZE_MS) return null
  const normalizedTitle = normalizeTitle(title)
  if (!normalizedTitle) return null

  const cutoffMs = Date.now() - SYNTHESIS_REDISPATCH_FREEZE_MS
  let latestAttempt = null
  for (const job of jobs) {
    if (normalizeTitle(job?.title) !== normalizedTitle) continue
    if (normalizeStatus(job?.status) === 'running' && !job?.completedAt) continue
    const timestampMs = attemptTimestampMs(job)
    if (!timestampMs || timestampMs < cutoffMs) continue
    if (!latestAttempt || timestampMs > latestAttempt.timestampMs) {
      latestAttempt = {
        title: normalizedTitle,
        status: normalizeStatus(job?.status) || 'completed',
        timestampMs,
      }
    }
  }
  return latestAttempt
}

function findRecentCandidateAttempt(jobs, lane, title) {
  if (!CANDIDATE_SAME_TITLE_FREEZE_MS) return null
  const normalizedTitle = normalizeTitle(title)
  if (!normalizedTitle) return null

  const cutoffMs = Date.now() - CANDIDATE_SAME_TITLE_FREEZE_MS
  let latestAttempt = null
  for (const job of jobs) {
    if (lane && job?.lane !== lane) continue
    if (normalizeTitle(job?.title) !== normalizedTitle) continue
    if (normalizeStatus(job?.status) === 'running' && !job?.completedAt) continue
    const timestampMs = attemptTimestampMs(job)
    if (!timestampMs || timestampMs < cutoffMs) continue
    if (!latestAttempt || timestampMs > latestAttempt.timestampMs) {
      latestAttempt = {
        title: normalizedTitle,
        status: normalizeStatus(job?.status) || 'completed',
        timestampMs,
      }
    }
  }
  return latestAttempt
}

function filterAvailableCandidates(tasks, { lane, openGates, companionJobs, rootDir }) {
  const readyOpenTasks = tasks.filter(
    (task) => openGates.has(task.gate) && task.status === 'ready' && candidatePrerequisiteSatisfied(task, lane, rootDir),
  )
  const available = readyOpenTasks.filter((task) => !findRecentCandidateAttempt(companionJobs, lane, task.title))
  return {
    readyOpenCount: readyOpenTasks.length,
    available,
  }
}

function readQueueSummary(rootDir, lane) {
  const config =
    lane === 'codex'
      ? {
          doc: 'docs/CODEX_ACTIVE_QUEUE.md',
          heading: '## Current Codex Queue State',
          readyStatus: 'ready',
          currentStatuses: new Set(['active']),
        }
      : {
          doc: 'docs/GLM_READY_TASK_QUEUE.md',
          heading: 'Current queue state:',
          readyStatus: 'ready',
          currentStatuses: new Set(['in_progress']),
        }
  const text = readText(rootDir, config.doc)
  const table = parseTableFromLines(text.split('\n'), config.heading)
  const ready = table.rows.filter((row) => normalizeStatus(row.Status) === config.readyStatus).length
  const current = table.rows.filter((row) => config.currentStatuses.has(normalizeStatus(row.Status))).length
  const titles = table.rows.map((row) => String(row.Task ?? '').trim()).filter(Boolean)
  return { ready, current, titles }
}

function completedQueueTitleExists(rootDir, lane, title) {
  const normalizedTitle = normalizeTitle(title)
  if (!normalizedTitle) return false
  const config =
    lane === 'codex'
      ? { doc: 'docs/CODEX_ACTIVE_QUEUE.md', heading: '## Current Codex Queue State' }
      : { doc: 'docs/GLM_READY_TASK_QUEUE.md', heading: 'Current queue state:' }

  try {
    const text = readText(rootDir, config.doc)
    const table = parseTableFromLines(text.split('\n'), config.heading)
    return table.rows.some(
      (row) => normalizeTitle(row.Task) === normalizedTitle && ['completed', 'done'].includes(normalizeStatus(row.Status)),
    )
  } catch {
    return false
  }
}

function candidatePrerequisiteSatisfied(task, lane, rootDir) {
  if (lane !== 'codex' || !task?.requiresCompletedTaskTitle) return true
  return completedQueueTitleExists(rootDir, 'glm', task.requiresCompletedTaskTitle)
}

function safeReadJson(rootDir, relativePath) {
  if (!fileExists(rootDir, relativePath)) return null
  try {
    return JSON.parse(readText(rootDir, relativePath))
  } catch {
    return null
  }
}

function isNonEmptyString(value) {
  return typeof value === 'string' && value.trim().length > 0
}

function containsChinese(value) {
  return /[\u3400-\u9fff]/u.test(String(value ?? ''))
}

function buildValidationOracle(payload, expectedMilestoneOrOracle = null) {
  if (expectedMilestoneOrOracle && typeof expectedMilestoneOrOracle === 'object') {
    return expectedMilestoneOrOracle
  }

  const milestone =
    typeof expectedMilestoneOrOracle === 'string' && expectedMilestoneOrOracle.trim()
      ? expectedMilestoneOrOracle.trim()
      : String(payload?.milestone ?? '').trim()
  const gates = [
    ...(Array.isArray(payload?.codex) ? payload.codex : []),
    ...(Array.isArray(payload?.glm) ? payload.glm : []),
  ]
    .map((task) => String(task?.gate ?? '').trim())
    .filter(Boolean)

  return {
    milestone,
    blockerGatesOpen: [...new Set(gates)].map((gate) => ({ gate, statuses: ['open'] })),
    conditionalGatesOpen: [],
  }
}

function validateSynthesisTask(task, lane, oracle = null) {
  if (!task || typeof task !== 'object') return { ok: false, reason: 'candidate is not an object' }
  const required = ['id', 'title', 'milestone', 'gate', 'summary', 'goal', 'proofTarget', 'whyNow', 'stopCondition']
  for (const field of required) {
    if (!isNonEmptyString(task[field])) {
      return { ok: false, reason: `candidate missing ${field}` }
    }
  }
  if (!containsChinese(task.title)) {
    return { ok: false, reason: 'candidate title must be clear Chinese' }
  }
  if (!containsChinese(task.summary)) {
    return { ok: false, reason: 'candidate summary must be clear Chinese' }
  }
  if (normalizeStatus(task.status ?? 'ready') !== 'ready') {
    return { ok: false, reason: 'candidate status is not ready' }
  }
  if (lane === 'codex') {
    if (!Array.isArray(task.files) || task.files.length === 0 || !task.files.every(isNonEmptyString)) {
      return { ok: false, reason: 'codex candidate missing files' }
    }
    if (!Array.isArray(task.requirements) || task.requirements.length === 0 || !task.requirements.every(isNonEmptyString)) {
      return { ok: false, reason: 'codex candidate missing requirements' }
    }
    if (task.requiresCompletedTaskTitle !== undefined && !isNonEmptyString(task.requiresCompletedTaskTitle)) {
      return { ok: false, reason: 'codex candidate has invalid prerequisite title' }
    }
  } else {
    if (!Array.isArray(task.writeScope) || task.writeScope.length === 0 || !task.writeScope.every(isNonEmptyString)) {
      return { ok: false, reason: 'glm candidate missing writeScope' }
    }
    if (!Array.isArray(task.mustProve) || task.mustProve.length === 0 || !task.mustProve.every(isNonEmptyString)) {
      return { ok: false, reason: 'glm candidate missing mustProve' }
    }
  }

  if (oracle) {
    const quality = evaluateTaskQuality(task, { lane, oracle, requireExplicitMetadata: true })
    if (!quality.eligible) {
      return { ok: false, reason: quality.reason }
    }
  }

  return { ok: true }
}

function validateSynthesisPayload(payload, expectedMilestoneOrOracle = null) {
  if (!payload || typeof payload !== 'object') {
    return { ok: false, reason: 'payload is not an object', codex: [], glm: [] }
  }

  const generatedAtMs = Date.parse(String(payload.generatedAt ?? ''))
  if (!Number.isFinite(generatedAtMs)) {
    return { ok: false, reason: 'generatedAt is missing or invalid', codex: [], glm: [] }
  }
  if (Date.now() - generatedAtMs > SYNTHESIS_MAX_AGE_MS) {
    return { ok: false, reason: 'generatedAt is stale', codex: [], glm: [] }
  }

  if (!isNonEmptyString(payload.milestone)) {
    return { ok: false, reason: 'milestone is missing', codex: [], glm: [] }
  }
  const validationOracle = buildValidationOracle(payload, expectedMilestoneOrOracle)
  if (validationOracle.milestone && payload.milestone.trim() !== validationOracle.milestone.trim()) {
    return { ok: false, reason: 'milestone does not match current oracle', codex: [], glm: [] }
  }

  const codex = Array.isArray(payload.codex) ? payload.codex : []
  const glm = Array.isArray(payload.glm) ? payload.glm : []
  for (const task of codex) {
    const verdict = validateSynthesisTask(task, 'codex', validationOracle)
    if (!verdict.ok) {
      return { ok: false, reason: `invalid codex candidate: ${verdict.reason}`, codex: [], glm: [] }
    }
  }
  for (const task of glm) {
    const verdict = validateSynthesisTask(task, 'glm', validationOracle)
    if (!verdict.ok) {
      return { ok: false, reason: `invalid glm candidate: ${verdict.reason}`, codex: [], glm: [] }
    }
  }

  return { ok: true, reason: 'ok', codex, glm, generatedAtMs }
}

function readSynthesisCandidates(rootDir = ROOT_DIR, lane = 'all') {
  const parsed = safeReadJson(rootDir, CANDIDATE_DOC)
  const normalized = parsed && typeof parsed === 'object'
    ? {
        generatedAt: parsed.generatedAt ?? null,
        milestone: parsed.milestone ?? null,
        codex: Array.isArray(parsed.codex) ? parsed.codex : [],
        glm: Array.isArray(parsed.glm) ? parsed.glm : [],
      }
    : { generatedAt: null, milestone: null, codex: [], glm: [] }
  if (lane === 'all') return normalized
  return {
    generatedAt: normalized.generatedAt,
    milestone: normalized.milestone,
    tasks: lane === 'codex' ? normalized.codex : normalized.glm,
  }
}

function buildSynthesisPrompt({ oracle, requestingLane }) {
  const generatedAtExample = new Date().toISOString()
  const oracleDocs = oracle?.docs ?? {}
  const currentGateDocs = [
    oracleDocs.remainingGates ?? 'docs/V2_PAGE_PRODUCT_REMAINING_GATES.zh-CN.md',
    oracleDocs.evidenceLedger ?? 'docs/V2_PAGE_PRODUCT_EVIDENCE_LEDGER.zh-CN.md',
    oracleDocs.bootstrapPacket,
    oracleDocs.codexRunway,
    oracleDocs.glmRunway,
  ].filter(Boolean)
  const readFirstDocs = [
    ...currentGateDocs,
    'docs/CODEX_ACTIVE_QUEUE.md',
    'docs/GLM_READY_TASK_QUEUE.md',
    'docs/TASK_CAPTURE_SYSTEM.zh-CN.md',
  ]
  const openGateLines = [...oracle.blockerGatesOpen, ...oracle.conditionalGatesOpen].map((gate) => {
    const statuses = gate.statuses.length > 0 ? gate.statuses.join(', ') : 'none'
    return `- ${gate.gate}: class=${gate.className}; statuses=${statuses}; closeout=${gate.closingEvidence}`
  })

  return [
    `Refresh \`${CANDIDATE_DOC}\` for the current milestone.`,
    '',
    'Read first:',
    ...readFirstDocs.map((doc) => `- \`${doc}\``),
    '',
    'Write only:',
    `- \`${CANDIDATE_DOC}\``,
    '',
    `Current milestone: ${oracle.milestone}`,
    `Requesting lane: ${requestingLane}`,
    '',
    'Still-open gates:',
    ...openGateLines,
    '',
    'Produce structured candidate tasks, not queue mutations.',
    '',
    'Hard rules:',
    '1. Only generate tasks for gates that are still open right now.',
    '2. Every task must explicitly attach to one gate and one milestone.',
    '3. Do not generate duplicates of active/ready live-queue work.',
    '4. Do not generate polish-only or next-milestone work.',
    '5. Prefer bounded GLM slices and integrating/review/governance Codex slices.',
    '6. Max 4 codex candidates and max 4 glm candidates.',
    '7. Every candidate must include `proofTarget`, `whyNow`, and `stopCondition`.',
    '8. Stay narrow: inspect only the live queue tables and the current milestone gate docs listed above; do not run broad repo-wide searches.',
    '9. Do not run shell commands with unquoted alternation patterns like ready|active.',
    '10. Finish as soon as the JSON file is valid; this is not a product task, only a candidate refresh task.',
    '11. `title` and `summary` must be written in clear Chinese that a non-engineer project owner can read directly.',
    '12. Prefer concise Chinese task names; avoid lane prefixes like Codex/GLM unless they are needed for disambiguation.',
    '13. `generatedAt` must be the real current UTC timestamp at write time, not a fixed calendar placeholder.',
    '14. If a Codex review/closeout candidate depends on a GLM proof pack for the same gate, add `requiresCompletedTaskTitle` with the exact GLM task title. Do not make proof review tasks dispatchable before their proof pack exists.',
    '',
    'Required JSON shape:',
    '```json',
    '{',
    `  "generatedAt": "${generatedAtExample}",`,
    `  "milestone": "${oracle.milestone}",`,
    '  "generator": { "lane": "codex", "mode": "task-synthesis" },',
    '  "codex": [',
    '    {',
    '      "id": "SYN-CODEX-PS1-01",',
    '      "title": "PS1 前门证据收口复核",',
    '      "status": "ready",',
    `      "milestone": "${oracle.milestone}",`,
    '      "gate": "PS1",',
    '      "summary": "把 PS1 的真实前门证据收成一次保守复核，明确现在能不能关 gate。",',
    '      "goal": "bounded goal",',
    '      "proofTarget": "which acceptance proof this closes",',
    '      "requiresCompletedTaskTitle": "PS1 前门基线证据复跑",',
    '      "whyNow": "why now instead of later",',
    '      "stopCondition": "what marks the task done",',
    '      "files": ["docs/example.md"],',
    '      "requirements": ["rule 1", "rule 2"]',
    '    }',
    '  ],',
    '  "glm": [',
    '    {',
    '      "id": "SYN-GLM-PS1-01",',
    '      "title": "PS1 前门基线证据复跑",',
    '      "status": "ready",',
    `      "milestone": "${oracle.milestone}",`,
    '      "gate": "PS1",',
    '      "summary": "补一轮当前候选版的 PS1 实测证据，确认普通入口和开始当前地图是否仍然成立。",',
    '      "goal": "bounded goal",',
    '      "proofTarget": "which acceptance proof this closes",',
    '      "whyNow": "why now instead of later",',
    '      "stopCondition": "what marks the task done",',
    '      "writeScope": ["src/main.ts", "tests/example.spec.ts"],',
    '      "mustProve": ["proof 1", "proof 2"]',
    '    }',
    '  ]',
    '}',
    '```',
    '',
    'Output valid JSON only into the file. Do not edit queue docs in this task.',
  ].join('\n')
}

function readCompanionJobs(rootDir) {
  const raw = run('node', [path.join(rootDir, 'scripts', 'dual-lane-companion.mjs'), 'refresh', '--lane', 'codex', '--limit', '8', '--json'])
  try {
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed)
      ? parsed.map((job) =>
          job?.status === 'running' && job?.completedAt
            ? {
                ...job,
                status: 'completed',
                phase: job.phase === 'running' ? 'done' : job.phase,
              }
            : job,
        )
      : []
  } catch {
    return []
  }
}

function buildDispatchDecision({ rootDir = ROOT_DIR, requestingLane = 'codex' } = {}) {
  const oracle = buildMilestoneOracle(rootDir)
  const codexQueue = readQueueSummary(rootDir, 'codex')
  const glmQueue = readQueueSummary(rootDir, 'glm')
  const companionJobs = readCompanionJobs(rootDir)
  const synthesisTitle = `Codex task synthesis — ${oracle.milestone}`
  const synthesisJob = companionJobs.find(
    (job) => job.status === 'running' && normalizeTitle(job.title).startsWith('Codex task synthesis'),
  )
  const recentSynthesisAttempt = findRecentSynthesisAttempt(companionJobs, synthesisTitle)
  const codexRunningJob = companionJobs.find((job) => job.status === 'running')
  const candidateDoc = readSynthesisCandidates(rootDir, 'all')
  const candidateValidation = validateSynthesisPayload(candidateDoc, oracle)
  const openGates = new Set([...oracle.blockerGatesOpen, ...oracle.conditionalGatesOpen].map((gate) => gate.gate))
  const codexCandidates = candidateValidation.ok
    ? filterAvailableCandidates(candidateValidation.codex, { lane: 'codex', openGates, companionJobs, rootDir })
    : { readyOpenCount: 0, available: [] }
  const glmCandidates = candidateValidation.ok
    ? filterAvailableCandidates(candidateValidation.glm, { lane: 'glm', openGates, companionJobs, rootDir })
    : { readyOpenCount: 0, available: [] }
  const codexCandidateCount = codexCandidates.available.length
  const glmCandidateCount = glmCandidates.available.length
  const requestingCandidateCount =
    requestingLane === 'glm'
      ? glmCandidateCount
      : codexCandidateCount
  const requestingReadyOpenCount =
    requestingLane === 'glm'
      ? glmCandidates.readyOpenCount
      : codexCandidates.readyOpenCount

  if (oracle.engineeringCloseoutReady) {
    return {
      shouldDispatch: false,
      reasonCode: 'milestone_closed',
      reason: 'milestone engineering blockers already closed',
      oracle,
      codexQueue,
      glmQueue,
    }
  }
  if (synthesisJob) {
    return {
      shouldDispatch: false,
      reasonCode: 'synthesis_running',
      reason: `task synthesis already running (${synthesisJob.id})`,
      oracle,
      codexQueue,
      glmQueue,
    }
  }
  if (requestingLane !== 'codex' && codexRunningJob) {
    return {
      shouldDispatch: false,
      reasonCode: 'codex_busy',
      reason: `codex lane busy with ${codexRunningJob.title}`,
      oracle,
      codexQueue,
      glmQueue,
    }
  }
  if (candidateValidation.ok && requestingCandidateCount > 0) {
    return {
      shouldDispatch: false,
      reasonCode: 'candidate_stock_ready',
      reason: `candidate stock already available for ${requestingLane} lane`,
      oracle,
      codexQueue,
      glmQueue,
      candidateValidation,
    }
  }
  if (candidateValidation.ok && requestingReadyOpenCount > 0 && requestingCandidateCount === 0) {
    return {
      shouldDispatch: false,
      reasonCode: 'candidate_stock_exhausted',
      reason: `candidate stock for ${requestingLane} only contains tasks already attempted recently`,
      oracle,
      codexQueue,
      glmQueue,
      candidateValidation,
    }
  }
  if (candidateValidation.ok && requestingCandidateCount === 0) {
    return {
      shouldDispatch: false,
      reasonCode: 'no_adjacent_tasks',
      reason: `candidate refresh already proved there are no adjacent ${requestingLane} tasks to add yet`,
      oracle,
      codexQueue,
      glmQueue,
      candidateValidation,
    }
  }
  if (recentSynthesisAttempt) {
    return {
      shouldDispatch: false,
      reasonCode: 'recent_synthesis_attempt',
      reason: `recent task synthesis already ran for ${oracle.milestone} (${recentSynthesisAttempt.status} ${formatAttemptAge(recentSynthesisAttempt.timestampMs)})`,
      oracle,
      codexQueue,
      glmQueue,
      candidateValidation,
    }
  }

  return {
    shouldDispatch: true,
    reasonCode: 'dispatch_needed',
    reason: candidateValidation.ok
      ? 'candidate stock below floor and codex lane can refresh synthesis'
      : `candidate stock invalid or empty (${candidateValidation.reason})`,
    oracle,
    codexQueue,
    glmQueue,
    candidateValidation,
  }
}

function dispatchTaskSynthesis({ rootDir = ROOT_DIR, requestingLane = 'codex' } = {}) {
  const decision = buildDispatchDecision({ rootDir, requestingLane })
  if (!decision.shouldDispatch) {
    return {
      dispatched: false,
      reasonCode: decision.reasonCode,
      reason: decision.reason,
      oracle: decision.oracle,
    }
  }

  const prompt = buildSynthesisPrompt({ oracle: decision.oracle, requestingLane })
  const title = `Codex task synthesis — ${decision.oracle.milestone}`
  const raw = run('node', [path.join(rootDir, 'scripts', 'dual-lane-companion.mjs'), 'task', '--lane', 'codex', '--title', title, '--json'], {
    input: prompt,
  })

  let payload
  try {
    payload = JSON.parse(raw)
  } catch {
    payload = { lane: 'codex', status: 'running', title, raw }
  }

  return {
    dispatched: true,
    reasonCode: decision.reasonCode,
    reason: decision.reason,
    oracle: decision.oracle,
    payload,
  }
}

function runCli() {
  const args = process.argv.slice(2)
  const command = args[0] ?? 'plan'
  const json = args.includes('--json')
  const requestingLaneIndex = args.indexOf('--requesting-lane')
  const requestingLane = requestingLaneIndex !== -1 ? args[requestingLaneIndex + 1] ?? 'codex' : 'codex'
  const rootIndex = args.indexOf('--root')
  const rootDir = rootIndex !== -1 ? path.resolve(args[rootIndex + 1] ?? ROOT_DIR) : ROOT_DIR

  if (command === 'read') {
    const payload = readSynthesisCandidates(rootDir, 'all')
    console.log(json ? JSON.stringify(payload, null, 2) : `${payload.milestone ?? 'no milestone'} ${payload.generatedAt ?? 'not-generated'}`)
    return
  }

  if (command === 'dispatch') {
    const payload = dispatchTaskSynthesis({ rootDir, requestingLane })
    console.log(json ? JSON.stringify(payload, null, 2) : `${payload.dispatched ? 'dispatched' : 'skipped'}: ${payload.reason}`)
    return
  }

  const payload = buildDispatchDecision({ rootDir, requestingLane })
  console.log(json ? JSON.stringify(payload, null, 2) : `${payload.shouldDispatch ? 'dispatch' : 'skip'}: ${payload.reason}`)
}

if (process.argv[1] && path.resolve(process.argv[1]) === __filename) {
  runCli()
}

export {
  CANDIDATE_DOC,
  buildDispatchDecision,
  buildSynthesisPrompt,
  dispatchTaskSynthesis,
  readSynthesisCandidates,
  validateSynthesisPayload,
  validateSynthesisTask,
}
