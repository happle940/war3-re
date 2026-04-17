#!/usr/bin/env node

import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import { execFileSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'

import { buildVersionTransitionReport } from './version-transition-orchestrator.mjs'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const ROOT_DIR = path.resolve(__dirname, '..')

const PREHEAT_DOC = 'docs/VERSION_PREHEAT_CANDIDATES.json'
const PREHEAT_MAX_AGE_MS = 6 * 60 * 60 * 1000
const PREHEAT_SAME_TITLE_FREEZE_MS = Math.max(0, Number(process.env.WAR3_SAME_TITLE_FREEZE_SECONDS ?? 6 * 60 * 60)) * 1000
const SHARED_PREHEAT_SUPPORT_FILES = [
  'docs/VERSION_TRANSITIONS.json',
  'docs/VERSION_TRANSITION_PROTOCOL.zh-CN.md',
  'docs/PROJECT_MASTER_ROADMAP.zh-CN.md',
  'docs/TASK_CAPTURE_SYSTEM.zh-CN.md',
  'docs/VERSION_TRANSITION_PROCESS_LOG.zh-CN.md',
]

function readText(rootDir, relativePath) {
  return fs.readFileSync(path.join(rootDir, relativePath), 'utf8').replaceAll('\r\n', '\n')
}

function fileExists(rootDir, relativePath) {
  return fs.existsSync(path.join(rootDir, relativePath))
}

function safeReadJson(rootDir, relativePath) {
  if (!fileExists(rootDir, relativePath)) return null
  try {
    return JSON.parse(readText(rootDir, relativePath))
  } catch {
    return null
  }
}

function run(rootDir, command, args, options = {}) {
  return execFileSync(command, args, {
    cwd: rootDir,
    encoding: 'utf8',
    stdio: ['pipe', 'pipe', 'pipe'],
    ...options,
  }).trim()
}

function isNonEmptyString(value) {
  return typeof value === 'string' && value.trim().length > 0
}

function containsChinese(value) {
  return /[\u3400-\u9fff]/u.test(String(value ?? ''))
}

function normalizeTitle(title) {
  return String(title ?? '').replaceAll('`', '').replace(/\s+/g, ' ').trim().toLowerCase()
}

function taskTimestampMs(task) {
  const timestamp = Date.parse(String(task?.completedAt ?? task?.startedAt ?? task?.createdAt ?? ''))
  return Number.isFinite(timestamp) ? timestamp : 0
}

function currentTransitionFromReport(report) {
  return report.transitions.find((transition) => transition.isCurrentMilestone) ?? null
}

function transitionNeedsPreheatPack(transition) {
  return ['preheat-due', 'cutover-blocked'].includes(String(transition?.state ?? ''))
}

function allowedPreheatFiles(transition) {
  return new Set([
    ...transition.missingArtifacts.map((artifact) => artifact.path),
    ...SHARED_PREHEAT_SUPPORT_FILES,
  ])
}

function allowedArtifactTargets(transition) {
  return new Set(transition.missingArtifacts.map((artifact) => artifact.name))
}

function validatePreheatTask(task, transition) {
  if (!task || typeof task !== 'object') return { ok: false, reason: 'candidate is not an object' }

  const required = ['id', 'title', 'status', 'transitionId', 'milestone', 'summary', 'goal', 'whyNow', 'stopCondition']
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
  if (String(task.status).trim().toLowerCase() !== 'ready') {
    return { ok: false, reason: 'candidate status is not ready' }
  }
  if (task.transitionId !== transition.id) {
    return { ok: false, reason: 'candidate transitionId does not match current transition' }
  }
  if (task.milestone !== transition.toMilestone) {
    return { ok: false, reason: 'candidate milestone does not match next milestone' }
  }
  if (!Array.isArray(task.artifactTargets) || task.artifactTargets.length === 0 || !task.artifactTargets.every(isNonEmptyString)) {
    return { ok: false, reason: 'candidate missing artifactTargets' }
  }
  if (!Array.isArray(task.files) || task.files.length === 0 || !task.files.every(isNonEmptyString)) {
    return { ok: false, reason: 'candidate missing files' }
  }
  if (!Array.isArray(task.requirements) || task.requirements.length === 0 || !task.requirements.every(isNonEmptyString)) {
    return { ok: false, reason: 'candidate missing requirements' }
  }

  const allowedTargets = allowedArtifactTargets(transition)
  if (!task.artifactTargets.every((target) => allowedTargets.has(target))) {
    return { ok: false, reason: 'candidate artifactTargets exceed current missing artifacts' }
  }

  const allowedFiles = allowedPreheatFiles(transition)
  if (!task.files.every((file) => allowedFiles.has(file))) {
    return { ok: false, reason: 'candidate files exceed current preheat scope' }
  }

  return { ok: true }
}

function buildPreheatTaskPrompt({ candidate, report, transition }) {
  return [
    `Implement the following next-version preheat task exactly as scoped below.`,
    '',
    'This is not a current live-queue task. It is a bounded transition-pack preparation slice.',
    '',
    `Current milestone: ${report.currentMilestone}`,
    `Current transition: ${transition.id}`,
    `Next milestone: ${transition.toMilestone}`,
    '',
    'Current blocker snapshot:',
    ...transition.preheatInput.blockerGatesOpen.map((gate) => `- ${gate.gate}: ${gate.conclusion}`),
    ...(transition.preheatInput.blockerGatesOpen.length === 0 ? ['- none'] : []),
    '',
    'Handoff contract:',
    `- fromVersionOutcome: ${transition.handoffContract.fromVersionOutcome ?? ''}`,
    `- toVersionFocus: ${transition.handoffContract.toVersionFocus ?? ''}`,
    `- mustStayInFromVersion: ${(transition.handoffContract.mustStayInFromVersion ?? []).join(' | ') || 'none'}`,
    `- allowedCarryover: ${(transition.handoffContract.allowedCarryover ?? []).join(' | ') || 'none'}`,
    `- residualRouting: ${(transition.handoffContract.residualRouting ?? []).join(' | ') || 'none'}`,
    `- netNewBlockers: ${(transition.handoffContract.netNewBlockers ?? []).join(' | ') || 'none'}`,
    '',
    'Preheat task:',
    '',
    `Title: ${candidate.title}`,
    `Summary: ${candidate.summary}`,
    `Goal: ${candidate.goal}`,
    `Why now: ${candidate.whyNow}`,
    `Stop condition: ${candidate.stopCondition}`,
    `Artifact targets: ${candidate.artifactTargets.join(', ')}`,
    '',
    'Allowed files:',
    ...candidate.files.map((file) => `- ${file}`),
    '',
    'Requirements:',
    ...candidate.requirements.map((requirement, index) => `${index + 1}. ${requirement}`),
    '',
    'Hard rules:',
    '1. Only touch the allowed files.',
    '2. Do not activate the next milestone.',
    '3. Do not edit current live queues.',
    '4. Keep the work bounded to transition-pack preparation.',
    '5. Keep all user-facing notes and task wording in clear Chinese.',
  ].join('\n')
}

function validatePreheatPayload(payload, report) {
  if (!payload || typeof payload !== 'object') {
    return { ok: false, reason: 'payload is not an object', codex: [] }
  }

  const generatedAtMs = Date.parse(String(payload.generatedAt ?? ''))
  if (!Number.isFinite(generatedAtMs)) {
    return { ok: false, reason: 'generatedAt is missing or invalid', codex: [] }
  }
  if (Date.now() - generatedAtMs > PREHEAT_MAX_AGE_MS) {
    return { ok: false, reason: 'generatedAt is stale', codex: [] }
  }

  const transition = currentTransitionFromReport(report)
  if (!transition) {
    return { ok: false, reason: 'no current transition', codex: [] }
  }

  if (payload.transitionId !== transition.id) {
    return { ok: false, reason: 'transitionId does not match current transition', codex: [] }
  }
  if (payload.currentMilestone !== report.currentMilestone) {
    return { ok: false, reason: 'currentMilestone does not match current report', codex: [] }
  }
  if (payload.nextMilestone !== transition.toMilestone) {
    return { ok: false, reason: 'nextMilestone does not match current transition', codex: [] }
  }
  if (payload.state !== transition.state) {
    return { ok: false, reason: 'state does not match current transition', codex: [] }
  }

  const codex = Array.isArray(payload.codex) ? payload.codex : []
  if (transition.missingArtifacts.length > 0 && codex.length === 0) {
    return { ok: false, reason: 'missing artifacts exist but payload has no codex tasks', codex: [] }
  }

  for (const task of codex) {
    const verdict = validatePreheatTask(task, transition)
    if (!verdict.ok) {
      return { ok: false, reason: `invalid preheat candidate: ${verdict.reason}`, codex: [] }
    }
  }

  return { ok: true, reason: 'ok', codex, generatedAtMs }
}

function readPreheatCandidates(rootDir = ROOT_DIR) {
  const parsed = safeReadJson(rootDir, PREHEAT_DOC)
  return parsed && typeof parsed === 'object'
    ? parsed
    : {
        generatedAt: null,
        transitionId: null,
        currentMilestone: null,
        nextMilestone: null,
        state: null,
        codex: [],
      }
}

function readCompanionJobs(rootDir = ROOT_DIR) {
  const raw = run(rootDir, 'node', [path.join(rootDir, 'scripts', 'dual-lane-companion.mjs'), 'refresh', '--lane', 'codex', '--limit', '8', '--json'])
  try {
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function buildPreheatPrompt({ report, transition }) {
  const generatedAtExample = new Date().toISOString()
  const blockerLines = transition.preheatInput.blockerGatesOpen.map(
    (gate) => `- ${gate.gate}: statuses=${gate.statuses.join(', ') || 'none'} | conclusion=${gate.conclusion}`,
  )
  const conditionalLines = transition.preheatInput.conditionalGatesOpen.map(
    (gate) => `- ${gate.gate}: statuses=${gate.statuses.join(', ') || 'none'} | conclusion=${gate.conclusion}`,
  )
  const userLines = transition.preheatInput.userDecisionPending.map(
    (gate) => `- ${gate.gate}: statuses=${gate.statuses.join(', ') || 'none'} | conclusion=${gate.conclusion}`,
  )
  const missingArtifactLines = transition.missingArtifacts.map((artifact) => `- ${artifact.name}: ${artifact.path}`)

  return [
    `Refresh \`${PREHEAT_DOC}\` for the current preheat transition.`,
    '',
    'Read first:',
    '- `docs/VERSION_TRANSITION_PROTOCOL.zh-CN.md`',
    '- `docs/VERSION_TRANSITIONS.json`',
    '- current milestone remaining gates / evidence ledger from the oracle source',
    '',
    'Write only:',
    `- \`${PREHEAT_DOC}\``,
    '',
    `Current milestone: ${report.currentMilestone}`,
    `Current transition: ${transition.id}`,
    `From version: ${transition.fromVersion}`,
    `To version: ${transition.toVersion}`,
    `Next milestone: ${transition.toMilestone}`,
    `Transition state: ${transition.state}`,
    '',
    'Current blocker snapshot:',
    ...(blockerLines.length > 0 ? blockerLines : ['- none']),
    '',
    'Current conditional snapshot:',
    ...(conditionalLines.length > 0 ? conditionalLines : ['- none']),
    '',
    'Current user-open snapshot:',
    ...(userLines.length > 0 ? userLines : ['- none']),
    '',
    'Missing transition artifacts:',
    ...(missingArtifactLines.length > 0 ? missingArtifactLines : ['- none']),
    '',
    'Handoff contract:',
    `- northStar: ${transition.handoffContract.northStar ?? ''}`,
    `- fromVersionOutcome: ${transition.handoffContract.fromVersionOutcome ?? ''}`,
    `- toVersionFocus: ${transition.handoffContract.toVersionFocus ?? ''}`,
    `- mustStayInFromVersion: ${(transition.handoffContract.mustStayInFromVersion ?? []).join(' | ') || 'none'}`,
    `- allowedCarryover: ${(transition.handoffContract.allowedCarryover ?? []).join(' | ') || 'none'}`,
    `- residualRouting: ${(transition.handoffContract.residualRouting ?? []).join(' | ') || 'none'}`,
    `- netNewBlockers: ${(transition.handoffContract.netNewBlockers ?? []).join(' | ') || 'none'}`,
    '',
    'Produce structured preheat tasks only. Do not activate the next milestone. Do not edit live queues.',
    '',
    'Hard rules:',
    '1. Only generate Codex tasks that build or sync the next-version transition pack.',
    '2. Every task must target one or more currently missing transition artifacts.',
    '3. Files must stay within the missing artifact files or shared preheat support docs.',
    '4. Do not generate gameplay implementation, UI polish, or current-milestone closeout work.',
    '5. Do not say the next milestone is already active.',
    '6. Max 4 codex tasks.',
    '7. `title` and `summary` must be clear Chinese for a non-engineer project owner.',
    '8. Every task must explain why it matters now, before cutover.',
    '9. Keep tasks bounded enough that one Codex task can finish one preheat slice safely.',
    '10. `generatedAt` must be the real current UTC time when writing the file.',
    '',
    'Required JSON shape:',
    '```json',
    '{',
    `  "generatedAt": "${generatedAtExample}",`,
    `  "transitionId": "${transition.id}",`,
    `  "currentMilestone": "${report.currentMilestone}",`,
    `  "nextMilestone": "${transition.toMilestone}",`,
    `  "state": "${transition.state}",`,
    '  "generator": { "lane": "codex", "mode": "version-preheat" },',
    '  "preheatInput": {',
    `    "blockerCount": ${transition.preheatInput.blockerCount},`,
    `    "threshold": ${transition.preheatInput.threshold}`,
    '  },',
    '  "handoffContract": {',
    `    "northStar": "${String(transition.handoffContract.northStar ?? '').replaceAll('"', '\\"')}",`,
    `    "fromVersionOutcome": "${String(transition.handoffContract.fromVersionOutcome ?? '').replaceAll('"', '\\"')}",`,
    `    "toVersionFocus": "${String(transition.handoffContract.toVersionFocus ?? '').replaceAll('"', '\\"')}"`,
    '  },',
    '  "codex": [',
    '    {',
    `      "id": "PREHEAT-${transition.id}-01",`,
    `      "title": "${transition.toVersion} 交接模板补齐",`,
    '      "status": "ready",',
    `      "transitionId": "${transition.id}",`,
    `      "milestone": "${transition.toMilestone}",`,
    '      "summary": "把下一版本的 gate 与证据台账模板补齐，让它能在当前版本 closeout 后立即接棒。",',
    '      "goal": "bounded goal",',
    '      "whyNow": "why now",',
    '      "stopCondition": "what marks the task done",',
    '      "artifactTargets": ["remainingGates", "evidenceLedger"],',
    `      "files": ["${transition.missingArtifacts[0]?.path ?? 'docs/example.md'}"],`,
    '      "requirements": ["rule 1", "rule 2"]',
    '    }',
    '  ]',
    '}',
    '```',
    '',
    'Output valid JSON only into the file. Do not touch any other file in this task.',
  ].join('\n')
}

function buildPreheatDispatchDecision({ rootDir = ROOT_DIR, jobs = null } = {}) {
  const report = buildVersionTransitionReport({ rootDir })
  const transition = currentTransitionFromReport(report)
  if (!transition) {
    return {
      shouldDispatch: false,
      reasonCode: 'no_current_transition',
      reason: 'no current transition matched the current milestone',
      report,
      transition: null,
    }
  }

  if (!transitionNeedsPreheatPack(transition)) {
    return {
      shouldDispatch: false,
      reasonCode: 'not_preheat_due',
      reason: `current transition is ${transition.state}, not preheat-due or cutover-blocked`,
      report,
      transition,
    }
  }

  const companionJobs = Array.isArray(jobs) ? jobs : readCompanionJobs(rootDir)
  const preheatJob = companionJobs.find(
    (job) => job.status === 'running' && String(job.title ?? '').startsWith('Codex version preheat'),
  )
  if (preheatJob) {
    return {
      shouldDispatch: false,
      reasonCode: 'preheat_generation_running',
      reason: `version preheat already running (${preheatJob.id})`,
      report,
      transition,
    }
  }

  const preheatCandidates = readPreheatCandidates(rootDir)
  const validation = validatePreheatPayload(preheatCandidates, report)
  if (validation.ok && validation.codex.length > 0) {
    return {
      shouldDispatch: false,
      reasonCode: 'candidate_stock_ready',
      reason: 'fresh preheat candidate stock already exists',
      report,
      transition,
      validation,
    }
  }

  return {
    shouldDispatch: true,
    reasonCode: 'dispatch_needed',
    reason: validation.ok ? 'preheat candidate stock is empty' : `preheat candidate stock invalid or empty (${validation.reason})`,
    report,
    transition,
    validation,
  }
}

function dispatchVersionPreheat({ rootDir = ROOT_DIR } = {}) {
  const decision = buildPreheatDispatchDecision({ rootDir })
  if (!decision.shouldDispatch) {
    return {
      dispatched: false,
      reasonCode: decision.reasonCode,
      reason: decision.reason,
      report: decision.report,
      transition: decision.transition,
    }
  }

  const prompt = buildPreheatPrompt({ report: decision.report, transition: decision.transition })
  const title = `Codex version preheat — ${decision.transition.id}`
  const raw = run(
    rootDir,
    'node',
    [path.join(rootDir, 'scripts', 'dual-lane-companion.mjs'), 'task', '--lane', 'codex', '--title', title, '--json'],
    { input: prompt },
  )

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
    report: decision.report,
    transition: decision.transition,
    payload,
  }
}

function buildPreheatTaskDecision({ rootDir = ROOT_DIR, jobs = null } = {}) {
  const report = buildVersionTransitionReport({ rootDir })
  const transition = currentTransitionFromReport(report)
  if (!transition) {
    return {
      shouldDispatch: false,
      reasonCode: 'no_current_transition',
      reason: 'no current transition matched the current milestone',
      report,
      transition: null,
    }
  }

  if (!transitionNeedsPreheatPack(transition)) {
    return {
      shouldDispatch: false,
      reasonCode: 'not_preheat_due',
      reason: `current transition is ${transition.state}, not preheat-due or cutover-blocked`,
      report,
      transition,
    }
  }

  const payload = readPreheatCandidates(rootDir)
  const validation = validatePreheatPayload(payload, report)
  if (!validation.ok) {
    return {
      shouldDispatch: false,
      reasonCode: 'candidate_stock_invalid',
      reason: `preheat candidate stock invalid or empty (${validation.reason})`,
      report,
      transition,
      validation,
    }
  }

  if (validation.codex.length === 0) {
    return {
      shouldDispatch: false,
      reasonCode: 'candidate_stock_empty',
      reason: 'preheat candidate stock is empty',
      report,
      transition,
      validation,
    }
  }

  const companionJobs = Array.isArray(jobs) ? jobs : readCompanionJobs(rootDir)
  const runningJob = companionJobs.find(
    (job) => job.status === 'running' && validation.codex.some((candidate) => normalizeTitle(candidate.title) === normalizeTitle(job.title)),
  )
  if (runningJob) {
    return {
      shouldDispatch: false,
      reasonCode: 'preheat_task_running',
      reason: `preheat task already running (${runningJob.id})`,
      report,
      transition,
      validation,
    }
  }

  const now = Date.now()
  for (const candidate of validation.codex) {
    const match = companionJobs.find((job) => normalizeTitle(job.title) === normalizeTitle(candidate.title) && job.status !== 'running')
    const timestampMs = taskTimestampMs(match)
    if (match && timestampMs > 0 && now - timestampMs < PREHEAT_SAME_TITLE_FREEZE_MS) {
      continue
    }
    return {
      shouldDispatch: true,
      reasonCode: 'dispatch_ready',
      reason: 'current milestone has no adjacent queue work; safe to promote one preheat task',
      report,
      transition,
      validation,
      candidate,
    }
  }

  return {
    shouldDispatch: false,
    reasonCode: 'candidate_recently_attempted',
    reason: 'all preheat candidates were attempted recently',
    report,
    transition,
    validation,
  }
}

function dispatchPreheatTask({ rootDir = ROOT_DIR, jobs = null } = {}) {
  const decision = buildPreheatTaskDecision({ rootDir, jobs })
  if (!decision.shouldDispatch) {
    return {
      dispatched: false,
      reasonCode: decision.reasonCode,
      reason: decision.reason,
      report: decision.report,
      transition: decision.transition,
      candidate: decision.candidate ?? null,
    }
  }

  const prompt = buildPreheatTaskPrompt({
    candidate: decision.candidate,
    report: decision.report,
    transition: decision.transition,
  })
  const raw = run(
    rootDir,
    'node',
    [path.join(rootDir, 'scripts', 'dual-lane-companion.mjs'), 'task', '--lane', 'codex', '--title', decision.candidate.title, '--json'],
    { input: prompt },
  )

  let payload
  try {
    payload = JSON.parse(raw)
  } catch {
    payload = { lane: 'codex', status: 'running', title: decision.candidate.title, raw }
  }

  return {
    dispatched: true,
    reasonCode: decision.reasonCode,
    reason: decision.reason,
    report: decision.report,
    transition: decision.transition,
    candidate: decision.candidate,
    payload,
  }
}

function runCli() {
  const args = process.argv.slice(2)
  const command = args[0] ?? 'plan'
  const json = args.includes('--json')
  const rootIndex = args.indexOf('--root')
  const rootDir = rootIndex !== -1 ? path.resolve(args[rootIndex + 1] ?? ROOT_DIR) : ROOT_DIR

  if (command === 'read') {
    const payload = readPreheatCandidates(rootDir)
    console.log(json ? JSON.stringify(payload, null, 2) : `${payload.transitionId ?? 'no-transition'} ${payload.generatedAt ?? 'not-generated'}`)
    return
  }

  if (command === 'dispatch') {
    const payload = dispatchVersionPreheat({ rootDir })
    console.log(json ? JSON.stringify(payload, null, 2) : `${payload.dispatched ? 'dispatched' : 'skipped'}: ${payload.reason}`)
    return
  }

  if (command === 'dispatch-task') {
    const payload = dispatchPreheatTask({ rootDir })
    console.log(json ? JSON.stringify(payload, null, 2) : `${payload.dispatched ? 'dispatched' : 'skipped'}: ${payload.reason}`)
    return
  }

  const payload = buildPreheatDispatchDecision({ rootDir })
  console.log(json ? JSON.stringify(payload, null, 2) : `${payload.shouldDispatch ? 'dispatch' : 'skip'}: ${payload.reason}`)
}

if (process.argv[1] && path.resolve(process.argv[1]) === __filename) {
  runCli()
}

export {
  PREHEAT_DOC,
  PREHEAT_MAX_AGE_MS,
  SHARED_PREHEAT_SUPPORT_FILES,
  buildPreheatDispatchDecision,
  buildPreheatTaskDecision,
  buildPreheatPrompt,
  buildPreheatTaskPrompt,
  dispatchPreheatTask,
  dispatchVersionPreheat,
  readPreheatCandidates,
  validatePreheatPayload,
  validatePreheatTask,
}
