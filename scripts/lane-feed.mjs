#!/usr/bin/env node

import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import { execFileSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'

import { applyPlans, buildRefillPlan } from './queue-refill.mjs'
import { executeCutover } from './version-cutover.mjs'
import { dispatchTaskSynthesis } from './task-synthesis.mjs'
import { dispatchPreheatTask, dispatchVersionPreheat } from './version-preheat-runner.mjs'
import { buildVersionTransitionReport } from './version-transition-orchestrator.mjs'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const ROOT_DIR = path.resolve(__dirname, '..')
const RECENT_DISPATCH_GRACE_MS = Math.max(0, Number(process.env.WAR3_RECENT_DISPATCH_GRACE_SECONDS ?? 120)) * 1000
const SAME_TITLE_ATTEMPT_FREEZE_MS = Math.max(0, Number(process.env.WAR3_SAME_TITLE_FREEZE_SECONDS ?? 6 * 60 * 60)) * 1000
const POST_SETTLED_SYNTHESIS_PAUSE_MS = Math.max(0, Number(process.env.WAR3_POST_SETTLED_SYNTHESIS_PAUSE_SECONDS ?? 3 * 60)) * 1000
const LANE_FEED_LOCK_INIT_GRACE_SEC = Number(process.env.WAR3_LANE_FEED_LOCK_INIT_GRACE_SEC ?? 5)
const DEFAULT_CODEX_TASK_COOLDOWN_MS = Math.max(0, Number(process.env.CODEX_TASK_COOLDOWN_SECONDS ?? 60)) * 1000
const STALLED_NUDGE_COOLDOWN_MS = Math.max(0, Number(process.env.WAR3_STALLED_NUDGE_COOLDOWN_SECONDS ?? 10 * 60)) * 1000
const RUNNING_JOB_SOFT_LIMIT_MS = Math.max(0, Number(process.env.WAR3_RUNNING_JOB_SOFT_LIMIT_MINUTES ?? 20)) * 60 * 1000
const COMPANION_REFRESH_LIMIT = Math.max(5, Number(process.env.LANE_FEED_COMPANION_REFRESH_LIMIT ?? 15) || 15)
const QUEUED_PROMPT_ACTIONS = new Set(['queued_prompt', 'needs_submit'])

const LANE_CONFIG = {
  codex: {
    label: 'Codex',
    queueDoc: 'docs/CODEX_ACTIVE_QUEUE.md',
    queueHeading: '## Current Codex Queue State',
    currentStatus: 'active',
    completedStatus: 'done',
    readyStatus: 'ready',
    noteField: 'Why it matters',
    statusFile: 'logs/codex-watch-feed.json',
    watchScript: 'scripts/codex-watch.sh',
    cooldownMs: DEFAULT_CODEX_TASK_COOLDOWN_MS,
  },
  glm: {
    label: 'GLM',
    queueDoc: 'docs/GLM_READY_TASK_QUEUE.md',
    queueHeading: 'Current queue state:',
    currentStatus: 'in_progress',
    completedStatus: 'completed',
    readyStatus: 'ready',
    ownerField: 'Owner',
    ownerValue: 'GLM-style worker + Codex review',
    noteField: 'Notes',
    statusFile: 'logs/glm-watch-feed.json',
    watchScript: 'scripts/glm-watch.sh',
    cooldownMs: 0,
  },
}

function parseArgs(argv) {
  const args = { command: 'check', lane: null, rootDir: ROOT_DIR, json: false, dispatch: true }
  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index]
    if (token === 'check' || token === 'status') {
      args.command = token
      continue
    }
    if (token === '--lane') {
      args.lane = argv[index + 1] ?? args.lane
      index += 1
      continue
    }
    if (token === '--root') {
      args.rootDir = path.resolve(argv[index + 1] ?? args.rootDir)
      index += 1
      continue
    }
    if (token === '--json') {
      args.json = true
      continue
    }
    if (token === '--no-dispatch') {
      args.dispatch = false
      continue
    }
  }
  return args
}

function readText(rootDir, relativePath) {
  return fs.readFileSync(path.join(rootDir, relativePath), 'utf8').replaceAll('\r\n', '\n')
}

function writeText(rootDir, relativePath, text) {
  fs.writeFileSync(path.join(rootDir, relativePath), text, 'utf8')
}

function todayDate() {
  return new Date().toISOString().slice(0, 10)
}

function lineIndex(lines, predicate) {
  for (let index = 0; index < lines.length; index += 1) {
    if (predicate(lines[index], index)) return index
  }
  return -1
}

function splitTableLine(line) {
  return line
    .trim()
    .split('|')
    .slice(1, -1)
    .map((cell) => cell.trim())
}

function renderTable(headers, rows) {
  const headerLine = `| ${headers.join(' | ')} |`
  const separator = `| ${headers.map(() => '---').join(' | ')} |`
  const rowLines = rows.map((row) => `| ${headers.map((header) => row[header] ?? '').join(' | ')} |`)
  return [headerLine, separator, ...rowLines]
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

  return { start, end, headers, rows }
}

function normalizeTitle(title) {
  return String(title ?? '').replaceAll('`', '').trim()
}

function titlesEquivalent(left, right) {
  const a = normalizeTitle(left)
  const b = normalizeTitle(right)
  if (!a || !b) return false
  return a === b || a.endsWith(b) || b.endsWith(a)
}

function normalizeStatus(status) {
  return String(status ?? '').replaceAll('`', '').trim().toLowerCase()
}

function queueInsertionIndex(rows) {
  let insertAt = rows.length
  for (let index = rows.length - 1; index >= 0; index -= 1) {
    const status = normalizeStatus(rows[index].Status)
    if (status === 'ready' || status === 'active' || status === 'in_progress') {
      insertAt = index + 1
      break
    }
  }
  return insertAt
}

function findCardBounds(lines, title) {
  const heading = `### ${title}`
  const start = lineIndex(lines, (line) => line.trim() === heading)
  if (start === -1) return null
  let end = start + 1
  while (end < lines.length && !lines[end].startsWith('### ')) {
    end += 1
  }
  return { start, end }
}

function getCardText(lines, title) {
  const bounds = findCardBounds(lines, title)
  if (!bounds) return ''
  return lines.slice(bounds.start, bounds.end).join('\n').trim()
}

function stripCloseoutRequirements(cardText) {
  const lines = String(cardText ?? '').split('\n')
  const kept = []
  let skippingCloseoutBullets = false

  for (const line of lines) {
    const trimmed = line.trim()
    if (/^Closeout requirements:?$/i.test(trimmed)) {
      skippingCloseoutBullets = true
      continue
    }

    if (skippingCloseoutBullets) {
      if (!trimmed || trimmed.startsWith('- ')) {
        continue
      }
      skippingCloseoutBullets = false
    }

    kept.push(line)
  }

  return kept.join('\n').trim()
}

function extractGoalFromCard(cardText) {
  const lines = String(cardText ?? '').split('\n')
  const goalIndex = lineIndex(lines, (line) => line.trim() === 'Goal:')
  if (goalIndex === -1) return ''
  for (let index = goalIndex + 1; index < lines.length; index += 1) {
    const trimmed = lines[index].trim()
    if (!trimmed) continue
    if (/^(Allowed files|Must prove|Must satisfy|Must avoid|Verification|Done when|Closeout|Priority|Owner|Forbidden files|Follow-up):$/.test(trimmed)) {
      break
    }
    return trimmed
  }
  return ''
}

function extractPrerequisiteTitles(cardText) {
  return extractPrerequisites(cardText).map((prerequisite) => prerequisite.title)
}

function prerequisiteRequiredStatus(line) {
  return /(?:accepted|acceptance|codex accepted|codex verified|本地复核|复核通过|验收)/i.test(String(line ?? ''))
    ? 'accepted'
    : 'completed'
}

function cleanPrerequisiteTitle(text) {
  return String(text ?? '')
    .replace(/^- /, '')
    .replace(/\s+(?:completed|accepted)\.?$/i, '')
    .replace(/\s+已(?:完成|通过|验收|复核通过)。?$/, '')
    .replace(/[.。]$/, '')
    .trim()
}

function extractPrerequisites(cardText) {
  const lines = String(cardText ?? '').split('\n')
  const titles = []
  for (let index = 0; index < lines.length; index += 1) {
    const trimmed = lines[index].trim()
    if (!/^(?:Prerequisite|Requires completed GLM proof):/.test(trimmed)) continue

    const requiredStatus = prerequisiteRequiredStatus(trimmed)
    const inlineMatches = [...trimmed.matchAll(/`([^`]+)`/g)].map((match) => match[1].trim())
    if (inlineMatches.length > 0) {
      titles.push(...inlineMatches.map((title) => ({ title: cleanPrerequisiteTitle(title), requiredStatus })))
      continue
    }

    for (let next = index + 1; next < lines.length; next += 1) {
      const candidate = lines[next].trim()
      if (!candidate) continue
      if (/^(##|###)\s+/.test(candidate) || /^[A-Z][A-Za-z ]+:$/.test(candidate)) break
      const match = candidate.match(/`([^`]+)`/)
      titles.push({
        title: cleanPrerequisiteTitle(match?.[1] ?? candidate),
        requiredStatus: prerequisiteRequiredStatus(candidate) === 'accepted' ? 'accepted' : requiredStatus,
      })
      break
    }
  }

  const unique = new Map()
  for (const prerequisite of titles) {
    if (!prerequisite.title) continue
    const key = `${prerequisite.title}::${prerequisite.requiredStatus}`
    if (!unique.has(key)) unique.set(key, prerequisite)
  }
  return [...unique.values()]
}

function setCardStatus(lines, title, status) {
  const bounds = findCardBounds(lines, title)
  if (!bounds) return false
  for (let index = bounds.start + 1; index < bounds.end; index += 1) {
    if (lines[index].trim().startsWith('Status:')) {
      const nextLine = `Status: \`${status}\`.`
      if (lines[index] !== nextLine) {
        lines[index] = nextLine
        return true
      }
      return false
    }
  }
  lines.splice(bounds.start + 1, 0, '', `Status: \`${status}\`.`, '')
  return true
}

function getCardStatus(lines, title) {
  const bounds = findCardBounds(lines, title)
  if (!bounds) return ''
  for (let index = bounds.start + 1; index < bounds.end; index += 1) {
    const match = lines[index].trim().match(/^Status:\s+`?([^`.]+)`?\./)
    if (match) return normalizeStatus(match[1])
  }
  return ''
}

function taskNumberFromTitle(title) {
  const match = normalizeTitle(title).match(/^Task\s+(\d+)\s+[—-]/i)
  return match ? Number(match[1]) : null
}

function cardPriorityNote(cardText) {
  const match = String(cardText ?? '').match(/^Priority:\s*(.+)$/m)
  if (!match) return '任务卡已存在但顶部表格漏登记；feed 已自动补表，避免队列断供。'
  return match[1].replaceAll('|', '/').trim()
}

function findActionableCardMissingTableRow({ lines, rows, config }) {
  const rowTitles = new Set(rows.map((row) => normalizeTitle(row.Task)).filter(Boolean))
  const rowTaskNumbers = rows.map((row) => taskNumberFromTitle(row.Task)).filter((value) => Number.isFinite(value))
  const maxRowTaskNumber = rowTaskNumbers.length ? Math.max(...rowTaskNumbers) : 0
  let best = null

  for (let index = 0; index < lines.length; index += 1) {
    const match = lines[index].trim().match(/^###\s+(.+)$/)
    if (!match) continue

    const title = normalizeTitle(match[1])
    if (!title || rowTitles.has(title)) continue

    const status = normalizeStatus(getCardStatus(lines, title))
    if (![config.readyStatus, config.currentStatus, 'active', 'in_progress'].includes(status)) continue

    const taskNumber = taskNumberFromTitle(title)
    if (!Number.isFinite(taskNumber) || taskNumber <= maxRowTaskNumber) continue

    const cardText = getCardText(lines, title)
    const candidate = {
      title,
      status: status === config.currentStatus || status === 'active' || status === 'in_progress'
        ? config.currentStatus
        : config.readyStatus,
      taskNumber,
      note: cardPriorityNote(cardText),
    }
    if (!best || candidate.taskNumber < best.taskNumber) best = candidate
  }

  return best
}

function repairLatestReadyCardMissingRow({ lane, rootDir }) {
  const config = LANE_CONFIG[lane]
  const text = readText(rootDir, config.queueDoc)
  const lines = text.split('\n')
  const table = parseTableFromLines(lines, config.queueHeading)
  const rows = table.rows.map((row) => ({ ...row }))
  const candidate = findActionableCardMissingTableRow({ lines, rows, config })
  if (!candidate) return null

  const row = {
    Task: candidate.title,
    Status: candidate.status,
    Owner: config.ownerValue ?? config.label,
    'Last update': todayDate(),
    Notes: candidate.note,
    'Why it matters': candidate.note,
  }

  rows.splice(queueInsertionIndex(rows), 0, row)
  setCardStatus(lines, candidate.title, candidate.status)
  writeQueueDoc({ rootDir, lane, lines, table, rows })
  return candidate
}

function isCompletedQueueStatus(status, lane) {
  const normalized = normalizeStatus(status)
  return normalized === normalizeStatus(LANE_CONFIG[lane]?.completedStatus) || normalized === 'done' || normalized === 'completed' || isAcceptedQueueStatus(status)
}

function isAcceptedQueueStatus(status) {
  return ['accepted', 'codex accepted', 'review accepted', 'verified', 'codex verified'].includes(normalizeStatus(status))
}

function queueStatusForTitle(rootDir, lane, title) {
  const config = LANE_CONFIG[lane]
  if (!config || !title) return ''

  try {
    const text = readText(rootDir, config.queueDoc)
    const lines = text.split('\n')
    const table = parseTableFromLines(lines, config.queueHeading)
    const row = table.rows.find((candidate) => titlesEquivalent(candidate.Task, title))
    const rowStatus = normalizeStatus(row?.Status)
    const cardStatus = getCardStatus(lines, title)
    if (isAcceptedQueueStatus(rowStatus) || isAcceptedQueueStatus(cardStatus)) return 'accepted'
    return rowStatus || cardStatus
  } catch {
    return ''
  }
}

function isQueueClosedForTitle(rootDir, lane, title) {
  const status = queueStatusForTitle(rootDir, lane, title)
  return isCompletedQueueStatus(status, lane) || ['blocked', 'superseded', 'failed'].includes(normalizeStatus(status))
}

function shouldBlockCancelledQueueStatus(status, lane) {
  const normalized = normalizeStatus(status)
  const currentStatus = normalizeStatus(LANE_CONFIG[lane]?.currentStatus)
  return !normalized || normalized === currentStatus || normalized === 'active' || normalized === 'in_progress'
}

function readPrerequisiteQueueRows(rootDir) {
  const rows = []
  for (const [lane, config] of Object.entries(LANE_CONFIG)) {
    try {
      const text = readText(rootDir, config.queueDoc)
      const table = parseTableFromLines(text.split('\n'), config.queueHeading)
      rows.push(
        ...table.rows.map((row) => ({
          lane,
          title: normalizeTitle(row.Task),
          status: normalizeStatus(row.Status),
        })),
      )
    } catch {
      // A missing cross-lane queue should not crash dispatch; the prerequisite stays unmet.
    }
  }
  return rows
}

function prerequisiteSatisfied(prerequisite, row) {
  if (!titlesEquivalent(row.title, prerequisite.title)) return false
  if (prerequisite.requiredStatus === 'accepted') return isAcceptedQueueStatus(row.status)
  return isCompletedQueueStatus(row.status, row.lane)
}

function formatMissingPrerequisite(prerequisite) {
  return prerequisite.requiredStatus === 'accepted' ? `${prerequisite.title} accepted` : prerequisite.title
}

function findMissingPrerequisites(rootDir, cardText) {
  const prerequisites = extractPrerequisites(cardText)
  if (prerequisites.length === 0) return []
  const queueRows = readPrerequisiteQueueRows(rootDir)
  return prerequisites.filter(
    (prerequisite) => !queueRows.some((row) => prerequisiteSatisfied(prerequisite, row)),
  ).map(formatMissingPrerequisite)
}

function readQueueTaskStatus({ lane, rootDir, title }) {
  const config = LANE_CONFIG[lane]
  if (!config) return ''

  try {
    const text = readText(rootDir, config.queueDoc)
    const lines = text.split('\n')
    const table = parseTableFromLines(lines, config.queueHeading)
    const row = table.rows.find((candidate) => titlesEquivalent(candidate.Task, title))
    const rowStatus = normalizeStatus(row?.Status)
    const cardStatus = getCardStatus(lines, title)
    if (isAcceptedQueueStatus(rowStatus) || isAcceptedQueueStatus(cardStatus)) return 'accepted'
    return rowStatus || cardStatus
  } catch {
    return ''
  }
}

function findCompletedJobAwaitingCodexReview({ lane, rootDir, jobs }) {
  if (lane !== 'glm') return null

  const reviewStatuses = new Set(['completed', 'blocked', 'failed'])
  const completedJobs = jobs
    .filter((job) => job.lane === lane && reviewStatuses.has(normalizeStatus(job.status)))
    .sort((left, right) => attemptTimestampMs(right) - attemptTimestampMs(left))

  const latestJob = completedJobs[0]
  if (!latestJob) return null

  const status = readQueueTaskStatus({ lane, rootDir, title: latestJob.title })
  if (!status || isAcceptedQueueStatus(status)) return null
  return {
    id: latestJob.id,
    title: normalizeTitle(latestJob.title),
    status: normalizeStatus(latestJob.status),
    completedAt: latestJob.completedAt ?? latestJob.updatedAt ?? latestJob.startedAt ?? latestJob.createdAt,
  }

  return null
}

function buildMissingRow(config, title, status, cardText) {
  const row = {
    Task: title,
    Status: status,
    'Last update': todayDate(),
  }
  if (config.ownerField) {
    row[config.ownerField] = config.ownerValue
  }
  row[config.noteField] = extractGoalFromCard(cardText) || 'auto-inserted from task card during lane sync'
  return row
}

function upsertRow(rows, headers, row) {
  const title = normalizeTitle(row.Task)
  const existingIndex = rows.findIndex((candidate) => normalizeTitle(candidate.Task) === title)
  if (existingIndex === -1) {
    rows.splice(queueInsertionIndex(rows), 0, Object.fromEntries(headers.map((header) => [header, row[header] ?? ''])))
    return true
  }
  rows[existingIndex] = {
    ...rows[existingIndex],
    ...row,
  }
  return true
}

function writeQueueDoc({ rootDir, lane, lines, table, rows }) {
  const rendered = renderTable(table.headers, rows)
  const nextLines = [...lines]
  nextLines.splice(table.start, table.end - table.start, ...rendered)
  const normalized = nextLines.join('\n').replace(/\n+$/, '\n')
  writeText(rootDir, LANE_CONFIG[lane].queueDoc, normalized)
}

function repairTaskCardMissingBlocks({ lane, rootDir }) {
  const config = LANE_CONFIG[lane]
  const text = readText(rootDir, config.queueDoc)
  const lines = text.split('\n')
  const table = parseTableFromLines(lines, config.queueHeading)
  const rows = table.rows.map((row) => ({ ...row }))
  let changed = false

  for (const row of rows) {
    if (normalizeStatus(row.Status) !== 'blocked') continue
    const note = String(row[config.noteField] ?? '')
    if (!note.includes('任务卡缺失，未派发') && !note.includes('Task card not found')) continue

    const title = normalizeTitle(row.Task)
    const cardText = getCardText(lines, title)
    if (!cardText) continue
    if (findMissingPrerequisites(rootDir, cardText).length > 0) continue

    const cardStatus = getCardStatus(lines, title)
    const restoredStatus =
      cardStatus && !['blocked', 'cancelled', 'superseded'].includes(normalizeStatus(cardStatus))
        ? cardStatus
        : config.readyStatus

    row.Status = restoredStatus
    row['Last update'] = todayDate()
    if (config.noteField) {
      const markerIndex = note.indexOf('任务卡缺失，未派发')
      row[config.noteField] = markerIndex >= 0 ? note.slice(0, markerIndex).trim() : note
    }
    setCardStatus(lines, title, restoredStatus)
    changed = true
  }

  if (changed) {
    writeQueueDoc({ rootDir, lane, lines, table, rows })
  }

  return changed
}

function refreshCompanionJobs({ lane, rootDir }) {
  const scriptPath = path.join(rootDir, 'scripts', 'dual-lane-companion.mjs')
  const raw = execFileSync('node', [scriptPath, 'refresh', '--lane', lane, '--limit', String(COMPANION_REFRESH_LIMIT), '--json'], {
    cwd: rootDir,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  })
  return JSON.parse(raw)
}

function parseTimestampMs(value) {
  const parsed = Date.parse(String(value ?? ''))
  return Number.isFinite(parsed) ? parsed : 0
}

function normalizePaneLine(line) {
  return String(line ?? '')
    .replace(/\x1B\][^\x07]*(?:\x07|\x1B\\)/g, '')
    .replace(/\x1B\[[0-9;?]*[ -/]*[@-~]/g, '')
    .replace(/^[\s|│┃╭╰╎>⏵⏺•\-]+/u, '')
    .trim()
}

function isQueuedPromptText(text) {
  const lines = String(text ?? '').split(/\r?\n/)
  const normalizedLines = lines.map(normalizePaneLine)
  if (normalizedLines.some((normalized) => {
    const canonical = normalized.replace(/^P\s*r\s*e\s*s\s*s/i, 'Press')
    return (
      /^Press up to edit queued messages\.?$/i.test(canonical) ||
      /^Press (?:enter|return) to send\.?$/i.test(canonical) ||
      /^Queued prompt\.?$/i.test(canonical) ||
      /^Message queued\.?$/i.test(canonical)
    )
  })) {
    return true
  }

  const lastJobPrompt = normalizedLines.findLastIndex((line) => /^(?:❯\s*)?\[DUAL_LANE_JOB\]\s*$/.test(line))
  if (lastJobPrompt === -1) return false

  const afterPrompt = normalizedLines.slice(lastJobPrompt + 1).filter(Boolean)
  const hasAgentProgressAfterPrompt = afterPrompt.some(isAgentProgressLine)
  return !hasAgentProgressAfterPrompt
}

function isAgentProgressLine(line) {
  return (
    /^[·✶✳✻✽✢⏺⎿◻✔\s]*(Scurrying|Thinking|Reading|Read |Searching|Searched|Explore\(|Task\(|researcher\(|Update\(|Edit\(|Write\(|Bash\(|Run\(|Running(?:\b|[.…])|Verifying|Writing|Implementing|Adding|Creating|Inspecting|Swirling|Twisting|[A-Z][A-Za-z]+[.…]\s*\()/i.test(line) ||
    /^JOB_(?:COMPLETE|BLOCKED):/.test(line)
  )
}

function isIdlePromptLine(line) {
  return (
    /^❯\s*$/.test(line) ||
    /^bypass permissions on\b/i.test(line)
  )
}

function isLiveClaudeStatusLine(line) {
  return (
    /^[·✶✳✻✽✢⏺\s]*[A-Z][A-Za-z]+[.…]\s*\(\s*\d+\s*(?:s|m|h)(?:\s+\d+\s*(?:s|m|h))*\s*(?:·[^)]*)?\)/i.test(line) ||
    /^[·✶✳✻✽✢⏺\s]*(?:Create|Update|Run|Write|Read|Fix|Add|Implement|Build|Test|Review|Inspect)\b[^.…()]{0,80}[.…]\s*\(\s*\d+\s*(?:s|m|h)(?:\s+\d+\s*(?:s|m|h))*\s*(?:·[^)]*)?\)/i.test(line) ||
    /^[·✶✳✻✽✢]\s*[A-Z][A-Za-z]+[.…]\s*$/i.test(line)
  )
}

function titleProgressTokens(title) {
  const generic = new Set([
    'task',
    'runtime',
    'contract',
    'implementation',
    'implement',
    'impl',
  ])
  return Array.from(
    new Set(
      String(title ?? '')
        .replace(/^Task\s+\d+\s*[—-]\s*/i, '')
        .split(/[^A-Za-z0-9_]+/)
        .map((token) => token.trim())
        .filter((token) => token.length >= 3)
        .filter((token) => !/^\d+$/.test(token))
        .filter((token) => !generic.has(token.toLowerCase())),
    ),
  )
}

function textMatchesTitleTokens(text, title) {
  const tokens = titleProgressTokens(title)
  if (!tokens.length) return false
  const normalized = String(text ?? '').toLowerCase()
  const matched = tokens.filter((token) => normalized.includes(token.toLowerCase()))
  const strongMatched = matched.filter((token) => /[A-Z]/.test(token) || /_/.test(token) || /\d/.test(token))
  return matched.length >= 2 || strongMatched.length >= 1
}

function hasLiveImplementingTaskPanel(normalizedLines, title) {
  if (!title) return false
  const recent = normalizedLines.slice(-100).filter(Boolean)
  const statusIndex = recent.findLastIndex((line) =>
    /^[·✶✳✻✽✢⏺\s]*Implementing\b[^.…()]{0,100}[.…]\s*\(\s*\d+\s*(?:s|m|h)(?:\s+\d+\s*(?:s|m|h))*\s*(?:·[^)]*)?\)/i.test(line),
  )
  if (statusIndex === -1) return false
  const afterStatus = recent.slice(statusIndex + 1)
  if (!afterStatus.some((line) => /(?:⎿\s*)?◼\s+/.test(line))) return false
  return textMatchesTitleTokens(recent.slice(statusIndex).join('\n'), title)
}

function hasLiveClaudeStatusLine(normalizedLines) {
  const recent = normalizedLines.slice(-80).filter(Boolean)
  const lastComplete = recent.findLastIndex((line) => /^JOB_(?:COMPLETE|BLOCKED):/.test(line))
  return recent.slice(lastComplete + 1).some(isLiveClaudeStatusLine)
}

function hasUnsettledAgentProgress(normalizedLines) {
  const lines = normalizedLines.filter(Boolean)
  const lastProgress = lines.findLastIndex(isAgentProgressLine)
  if (lastProgress === -1) return false
  const afterProgress = lines.slice(lastProgress + 1)
  return !afterProgress.some(isIdlePromptLine)
}

function hasActiveClaudeTaskPanel(normalizedLines) {
  const lines = normalizedLines.filter(Boolean)
  const lastComplete = lines.findLastIndex((line) => /^JOB_(?:COMPLETE|BLOCKED):/.test(line))
  const recent = lines.slice(Math.max(0, lastComplete + 1, lines.length - 80))
  const activeStatusIndex = recent.findLastIndex((line) =>
    /^[·✶✳✻✽✢⏺\s]*(?:Scurrying|Thinking|Reading|Searching|Verifying|Writing|Implementing|Adding|Creating|Inspecting|Calculating|Swirling|Twisting)\b/i.test(line)
    && /\([^)]*(?:tokens|s|m|h)[^)]*\)/i.test(line),
  )
  if (activeStatusIndex === -1) return false
  const afterStatus = recent.slice(activeStatusIndex + 1)
  const activeTaskIndex = afterStatus.findIndex((line) => /(?:⎿\s*)?[◼◻]\s+/.test(line))
  if (activeTaskIndex === -1) return false
  return !afterStatus.slice(activeTaskIndex + 1).some(isIdlePromptLine)
}

function hasCurrentClaudeChecklistProgress(normalizedLines) {
  const lines = normalizedLines.filter(Boolean)
  const lastComplete = lines.findLastIndex((line) => /^JOB_(?:COMPLETE|BLOCKED):/.test(line))
  const recent = lines.slice(Math.max(0, lastComplete + 1, lines.length - 80))
  const taskSummaryIndex = recent.findLastIndex((line) =>
    /\b\d+\s+tasks?\s+\([^)]*\b\d+\s+in progress\b/i.test(line),
  )
  if (taskSummaryIndex === -1) return false
  return recent.slice(taskSummaryIndex + 1).some((line) => /(?:⎿\s*)?◼\s+/.test(line))
}

function hasBackgroundClaudeWork(normalizedLines) {
  const recent = normalizedLines.slice(-120).filter(Boolean)
  const hasBackgroundTool = recent.some((line) =>
    /^(?:Explore|Task|researcher)\(/i.test(line) ||
    /ctrl\+b ctrl\+b/i.test(line),
  )
  const hasActiveBackgroundStatus = recent.some(isLiveClaudeStatusLine)
  return hasBackgroundTool && hasActiveBackgroundStatus
}

function hasRecentMarkerlessAgentProgress(normalizedLines) {
  const recent = normalizedLines.slice(-80).filter(Boolean)
  if (recent.some((line) => /Interrupted · What should Claude do instead|What should Claude do instead/i.test(line))) {
    return false
  }
  if (hasBackgroundClaudeWork(normalizedLines)) return true
  const lastIdlePrompt = recent.findLastIndex(isIdlePromptLine)
  const lastAgentSignal = recent.findLastIndex((line) =>
    isAgentProgressLine(line) ||
    isLiveClaudeStatusLine(line) ||
    /\b\d+\s+tasks?\s+\([^)]*\b\d+\s+in progress\b/i.test(line) ||
    /(?:⎿\s*)?[◼◻]\s+/.test(line),
  )
  if (lastIdlePrompt !== -1 && lastAgentSignal !== -1 && lastIdlePrompt > lastAgentSignal) {
    return false
  }
  if (hasLiveClaudeStatusLine(recent)) return true
  if (hasCurrentClaudeChecklistProgress(recent)) return true
  if (hasActiveClaudeTaskPanel(recent)) return true
  return hasUnsettledAgentProgress(recent)
}

function hasSubmittedLaneJobProgress(text, title) {
  const raw = String(text ?? '')
  const normalizedLines = raw.split(/\r?\n/).map(normalizePaneLine)
  const lastJobPrompt = normalizedLines.findLastIndex((line) => /^(?:❯\s*)?\[DUAL_LANE_JOB\]\s*$/.test(line))
  const afterPrompt = normalizedLines.slice(lastJobPrompt + 1)
  if (lastJobPrompt === -1) {
    if (title && raw.includes('TITLE:') && !raw.includes(`TITLE: ${title}`)) return false
    return hasRecentMarkerlessAgentProgress(normalizedLines)
  }
  if (title) {
    const promptTitleLine = afterPrompt.find((line) => line.startsWith('TITLE:'))
    const promptTitle = promptTitleLine ? normalizeTitle(promptTitleLine.replace(/^TITLE:\s*/, '')) : ''
    if (promptTitle && promptTitle !== normalizeTitle(title)) return false
  }
  return hasLiveImplementingTaskPanel(afterPrompt, title) || hasBackgroundClaudeWork(afterPrompt) || hasLiveClaudeStatusLine(afterPrompt) || hasCurrentClaudeChecklistProgress(afterPrompt) || hasActiveClaudeTaskPanel(afterPrompt) || hasUnsettledAgentProgress(afterPrompt)
}

function defaultCaptureRuntimeOutput({ lane, rootDir }) {
  const config = LANE_CONFIG[lane]
  if (!config) return ''
  const watchScript = path.join(rootDir, config.watchScript)
  if (!fs.existsSync(watchScript)) return ''
  try {
    return execFileSync(watchScript, ['capture'], {
      cwd: rootDir,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
      timeout: 5000,
    })
  } catch {
    return ''
  }
}

function detectQueuedPrompt({ lane, rootDir, captureRuntimeOutputImpl }) {
  const output = captureRuntimeOutputImpl({ lane, rootDir })
  return isQueuedPromptText(output)
}

function buildQueuedPromptPayload({ lane, taskTitle, job = null }) {
  const payload = buildStatusPayload({
    lane,
    state: 'needs_submit',
    action: 'queued_prompt',
    detail: job?.id
      ? `tracked ${lane} job appears queued but not submitted (${job.id}: ${job.title}); no new task dispatched until the prompt is submitted or the job settles`
      : `latest ${lane} dispatch appears queued but not submitted (${taskTitle}); no new task dispatched until the prompt is submitted or the job settles`,
  })
  payload.taskTitle = normalizeTitle(job?.title ?? taskTitle)
  if (job?.id) payload.jobId = job.id
  return payload
}

function attemptTimestampMs(job) {
  const status = normalizeStatus(job?.status)
  if (status === 'running' && !job?.completedAt) {
    return Math.max(
      parseTimestampMs(job?.updatedAt),
      parseTimestampMs(job?.startedAt),
      parseTimestampMs(job?.createdAt),
    )
  }
  return (
    parseTimestampMs(job?.completedAt) ||
    parseTimestampMs(job?.startedAt) ||
    parseTimestampMs(job?.createdAt) ||
    parseTimestampMs(job?.updatedAt)
  )
}

function formatDuration(seconds) {
  if (seconds < 60) return `${seconds}s`
  const minutes = Math.floor(seconds / 60)
  const remain = seconds % 60
  return remain ? `${minutes}m ${remain}s` : `${minutes}m`
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

function getLaneCooldown({ lane, jobs, previousStatus }) {
  const cooldownMs = LANE_CONFIG[lane]?.cooldownMs ?? 0
  if (!cooldownMs) {
    return { anchorMs: 0, remainingMs: 0 }
  }

  let anchorMs = 0
  for (const job of jobs) {
    if (job.lane !== lane || job.status !== 'completed') continue
    anchorMs = Math.max(anchorMs, parseTimestampMs(job.completedAt))
  }

  if (previousStatus?.action === 'cooldown') {
    anchorMs = Math.max(
      anchorMs,
      parseTimestampMs(previousStatus.cooldown_anchor_at ?? previousStatus.checked_at),
    )
  }

  if (!anchorMs) {
    return { anchorMs: 0, remainingMs: 0 }
  }

  return {
    anchorMs,
    remainingMs: Math.max(0, cooldownMs - (Date.now() - anchorMs)),
  }
}

function pickRunningJob(lane, jobs, actionableTitles) {
  return jobs.find(
    (job) =>
      job.lane === lane &&
      job.status === 'running' &&
      !job.completedAt &&
      actionableTitles.has(normalizeTitle(job.title)),
  ) ?? null
}

function pickAnyLaneRunningJob(lane, jobs, { rootDir = null } = {}) {
  const runningJobs = jobs.filter((job) => {
    if (job.lane !== lane || job.status !== 'running' || job.completedAt) return false
    if (rootDir && isQueueClosedForTitle(rootDir, lane, job.title)) return false
    return true
  })
  return (
    runningJobs.find((job) => normalizeTitle(job.summary ?? '') !== normalizeTitle('Dispatched to lane runtime.')) ??
    runningJobs[0] ??
    null
  )
}

function isStalledLaneJob(job) {
  if (!job || normalizeStatus(job.status) !== 'running' || job.completedAt) return false
  return normalizeStatus(job.phase) === 'stalled' || normalizeStatus(job.monitorState) === 'stalled'
}

function jobRunningAgeMs(job) {
  if (!job || normalizeStatus(job.status) !== 'running' || job.completedAt) return 0
  const startedMs = parseTimestampMs(job.startedAt) || parseTimestampMs(job.createdAt)
  if (!startedMs) return 0
  return Math.max(0, Date.now() - startedMs)
}

function isOverBudgetLaneJob(job) {
  return RUNNING_JOB_SOFT_LIMIT_MS > 0 && jobRunningAgeMs(job) >= RUNNING_JOB_SOFT_LIMIT_MS
}

function runningJobAttentionKind(job) {
  if (isStalledLaneJob(job)) return 'stalled'
  if (isOverBudgetLaneJob(job)) return 'over_budget'
  return ''
}

function companionJobPath(rootDir, jobId) {
  return path.join(rootDir, 'logs', 'dual-lane-companion', 'jobs', `${jobId}.json`)
}

function readCompanionJob(rootDir, jobId) {
  const filePath = companionJobPath(rootDir, jobId)
  if (!fs.existsSync(filePath)) return null
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'))
  } catch {
    return null
  }
}

function findLatestCompanionJobByTitle(rootDir, lane, title) {
  const statePath = path.join(rootDir, 'logs', 'dual-lane-companion', 'state.json')
  if (!fs.existsSync(statePath)) return null
  let state
  try {
    state = JSON.parse(fs.readFileSync(statePath, 'utf8'))
  } catch {
    return null
  }
  const normalizedTitle = normalizeTitle(title)
  const summaries = Array.isArray(state.jobs) ? state.jobs : []
  const match = summaries
    .filter((job) => job.lane === lane && normalizeTitle(job.title) === normalizedTitle)
    .sort((left, right) => String(right.createdAt ?? '').localeCompare(String(left.createdAt ?? '')))[0]
  return match ? readCompanionJob(rootDir, match.id) : null
}

function writeCompanionJob(rootDir, job) {
  if (!job?.id) return
  const filePath = companionJobPath(rootDir, job.id)
  fs.mkdirSync(path.dirname(filePath), { recursive: true })
  fs.writeFileSync(filePath, `${JSON.stringify(job, null, 2)}\n`, 'utf8')
}

function formatMaybeDuration(seconds) {
  const value = Number(seconds)
  if (!Number.isFinite(value) || value < 0) return 'unknown duration'
  return formatDuration(Math.floor(value))
}

function defaultRecoverStalledJob({ lane, rootDir, job }) {
  const attentionKind = runningJobAttentionKind(job)
  if (!attentionKind) return null
  const fullJob = readCompanionJob(rootDir, job.id) ?? job
  const lastNudgedMs = parseTimestampMs(fullJob.lastWatchdogNudgeAt)
  const remainingMs = lastNudgedMs ? STALLED_NUDGE_COOLDOWN_MS - (Date.now() - lastNudgedMs) : 0
  if (remainingMs > 0) {
    return {
      lane,
      state: attentionKind === 'stalled' ? 'stalled' : 'running_attention',
      action: 'watchdog_wait',
      detail: `tracked ${lane} job needs attention (${job.id}: ${job.title}); watchdog already nudged it, next nudge in ${formatDuration(Math.ceil(remainingMs / 1000))}`,
      taskTitle: normalizeTitle(job.title),
    }
  }

  const config = LANE_CONFIG[lane]
  const watchScript = path.join(rootDir, config.watchScript)
  if (!fs.existsSync(watchScript)) {
    return null
  }

  const progressReason = attentionKind === 'stalled'
    ? `The monitor reports no visible lane progress for ${formatMaybeDuration(job.monitorInactiveSeconds)}.`
    : `The job has been running for ${formatDuration(Math.ceil(jobRunningAgeMs(job) / 1000))}, above the soft limit of ${formatDuration(Math.ceil(RUNNING_JOB_SOFT_LIMIT_MS / 1000))}.`

  const prompt = [
    '[DUAL_LANE_WATCHDOG]',
    `JOB_ID: ${job.id}`,
    `LANE: ${lane}`,
    `TITLE: ${job.title}`,
    '',
    progressReason,
    'Do not start a new task.',
    'If you are still working, continue the current task and produce visible progress.',
    `If the task is complete, emit the exact line: JOB_COMPLETE: ${job.id}`,
    `If the task is blocked, emit the exact line: JOB_BLOCKED: ${job.id}`,
    'Keep the original task scope and allowed files.',
  ].join('\n')

  execFileSync(watchScript, ['send'], {
    cwd: rootDir,
    input: prompt,
    encoding: 'utf8',
    stdio: ['pipe', 'ignore', 'pipe'],
  })

  const now = new Date().toISOString()
  writeCompanionJob(rootDir, {
    ...fullJob,
    phase: 'nudged',
    lastWatchdogNudgeAt: now,
    summary: 'Watchdog nudge sent after monitor reported the lane stalled.',
  })

  return {
    lane,
    state: attentionKind === 'stalled' ? 'stalled' : 'running_attention',
    action: 'watchdog_nudged',
    detail: `tracked ${lane} job needs attention (${job.id}: ${job.title}); watchdog sent a status/closeout nudge`,
    taskTitle: normalizeTitle(job.title),
  }
}

function findRecentSameTitleAttempt(lane, jobs, title) {
  if (!SAME_TITLE_ATTEMPT_FREEZE_MS) return null
  const normalizedTitle = normalizeTitle(title)
  if (!normalizedTitle) return null
  const cutoffMs = Date.now() - SAME_TITLE_ATTEMPT_FREEZE_MS
  let latestAttempt = null

  for (const job of jobs) {
    if (job?.lane !== lane) continue
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

function syncLaneQueue({ lane, rootDir, jobs, provisionalTitle = null }) {
  const config = LANE_CONFIG[lane]
  const originalText = readText(rootDir, config.queueDoc)
  const lines = originalText.split('\n')
  const table = parseTableFromLines(lines, config.queueHeading)
  const rows = table.rows.map((row) => ({ ...row }))
  const actionableTitles = new Set(
    rows
      .filter((row) => ['ready', config.currentStatus, 'active', 'in_progress'].includes(normalizeStatus(row.Status)))
      .map((row) => normalizeTitle(row.Task)),
  )
  const runningJob = pickRunningJob(lane, jobs, actionableTitles)
  const completedJobs = jobs
    .filter((job) => job.lane === lane && job.status === 'completed' && job.completedAt)
    .sort((left, right) => String(right.completedAt).localeCompare(String(left.completedAt)))
  const completedTitles = new Set(completedJobs.map((job) => normalizeTitle(job.title)))
  const cancelledTitles = new Set(
    jobs
      .filter((job) => job.lane === lane && normalizeStatus(job.status) === 'cancelled' && job.completedAt)
      .map((job) => normalizeTitle(job.title)),
  )
  const provisionalTrackedTitle = normalizeTitle(provisionalTitle ?? '')
  const trackedCurrentTitle =
    !runningJob && provisionalTrackedTitle && completedTitles.has(provisionalTrackedTitle)
      ? ''
      : normalizeTitle(runningJob?.title ?? provisionalTitle ?? '')
  let changed = false

  if (runningJob) {
    const cardText = getCardText(lines, runningJob.title)
    if (!rows.some((row) => normalizeTitle(row.Task) === normalizeTitle(runningJob.title)) && cardText) {
      upsertRow(rows, table.headers, buildMissingRow(config, runningJob.title, config.currentStatus, cardText))
      changed = true
    }
  }

  for (const job of completedJobs) {
    const title = normalizeTitle(job.title)
    if (!title || !getCardText(lines, title)) continue
    if (setCardStatus(lines, title, config.completedStatus)) {
      changed = true
    }
  }

  for (const title of cancelledTitles) {
    if (!title || !getCardText(lines, title)) continue
    if (completedTitles.has(title) || isCompletedQueueStatus(getCardStatus(lines, title), lane)) continue
    const row = rows.find((candidate) => titlesEquivalent(candidate.Task, title))
    if (!shouldBlockCancelledQueueStatus(row?.Status, lane)) continue
    if (setCardStatus(lines, title, 'blocked')) {
      changed = true
    }
  }

  for (const row of rows) {
    const title = normalizeTitle(row.Task)
    const status = normalizeStatus(row.Status)

    if (title && isCompletedQueueStatus(status, lane)) {
      continue
    }

    if (title && cancelledTitles.has(title) && shouldBlockCancelledQueueStatus(status, lane)) {
      if (status !== 'blocked') {
        row.Status = 'blocked'
        row['Last update'] = todayDate()
        changed = true
      }
      continue
    }

    if (title && completedTitles.has(title) && trackedCurrentTitle !== title) {
      if (status !== config.completedStatus) {
        row.Status = config.completedStatus
        row['Last update'] = todayDate()
        changed = true
      }
      continue
    }

    if (status === config.currentStatus && trackedCurrentTitle !== title) {
      row.Status = config.readyStatus
      row['Last update'] = todayDate()
      changed = true
    }
  }

  if (trackedCurrentTitle) {
    for (const row of rows) {
      const title = normalizeTitle(row.Task)
      if (title === trackedCurrentTitle) {
        if (normalizeStatus(row.Status) !== config.currentStatus) {
          row.Status = config.currentStatus
          row['Last update'] = todayDate()
          changed = true
        }
        if (config.ownerField) {
          row[config.ownerField] = config.ownerValue
        }
      }
    }
  }

  if (changed) {
    const changedTitles = rows
      .filter((row) => {
        const title = normalizeTitle(row.Task)
        const status = normalizeStatus(row.Status)
        return completedTitles.has(title) || cancelledTitles.has(title) || title === trackedCurrentTitle || status === config.readyStatus
      })
      .map((row) => ({ title: normalizeTitle(row.Task), status: normalizeStatus(row.Status) }))

    for (const { title, status } of changedTitles) {
      setCardStatus(lines, title, status)
    }
    writeQueueDoc({ rootDir, lane, lines, table, rows })
  }

  return { changed, runningJob, provisionalTitle: trackedCurrentTitle && !runningJob ? trackedCurrentTitle : null }
}

function findDispatchCandidate(lane, rootDir, jobs = []) {
  const config = LANE_CONFIG[lane]
  const text = readText(rootDir, config.queueDoc)
  const lines = text.split('\n')
  const table = parseTableFromLines(lines, config.queueHeading)
  const rows = table.rows.map((row) => ({ ...row }))
  const candidates = [
    ...rows.filter((row) => normalizeStatus(row.Status) === config.currentStatus),
    ...rows.filter((row) => normalizeStatus(row.Status) === config.readyStatus),
  ]

  let frozenCandidate = null
  let waitingCandidate = null
  for (const row of candidates) {
    const title = normalizeTitle(row.Task)
    const missingPrerequisites = findMissingPrerequisites(rootDir, getCardText(lines, title))
    if (missingPrerequisites.length > 0) {
      if (!waitingCandidate) {
        waitingCandidate = {
          title,
          missingPrerequisites,
        }
      }
      continue
    }
    const recentAttempt = findRecentSameTitleAttempt(lane, jobs, title)
    if (!recentAttempt) return { row, frozenCandidate: null }
    if (recentAttempt.status === 'cancelled' && normalizeStatus(row.Status) === config.readyStatus) {
      return { row, frozenCandidate: null }
    }
    if (!frozenCandidate) {
      frozenCandidate = {
        title,
        status: recentAttempt.status,
        timestampMs: recentAttempt.timestampMs,
      }
    }
  }

  return { row: null, frozenCandidate, waitingCandidate }
}

function promoteCandidateToCurrent({ lane, rootDir, title }) {
  const config = LANE_CONFIG[lane]
  const text = readText(rootDir, config.queueDoc)
  const lines = text.split('\n')
  const table = parseTableFromLines(lines, config.queueHeading)
  const rows = table.rows.map((row) => ({ ...row }))
  let changed = false

  for (const row of rows) {
    const rowTitle = normalizeTitle(row.Task)
    const status = normalizeStatus(row.Status)
    if (status === config.currentStatus && rowTitle !== normalizeTitle(title)) {
      row.Status = config.readyStatus
      row['Last update'] = todayDate()
      changed = true
      setCardStatus(lines, rowTitle, config.readyStatus)
    }
    if (rowTitle === normalizeTitle(title) && status !== config.currentStatus) {
      row.Status = config.currentStatus
      row['Last update'] = todayDate()
      changed = true
      if (config.ownerField) row[config.ownerField] = config.ownerValue
      setCardStatus(lines, rowTitle, config.currentStatus)
    }
  }

  if (changed) {
    writeQueueDoc({ rootDir, lane, lines, table, rows })
  }
}

function markCandidateBlocked({ lane, rootDir, title, reason }) {
  const config = LANE_CONFIG[lane]
  const text = readText(rootDir, config.queueDoc)
  const lines = text.split('\n')
  const table = parseTableFromLines(lines, config.queueHeading)
  const rows = table.rows.map((row) => ({ ...row }))
  let changed = false

  for (const row of rows) {
    if (!titlesEquivalent(row.Task, title)) continue
    if (normalizeStatus(row.Status) !== 'blocked') {
      row.Status = 'blocked'
      row['Last update'] = todayDate()
      changed = true
    }
    if (reason && config.noteField && !String(row[config.noteField] ?? '').includes(reason)) {
      row[config.noteField] = `${row[config.noteField] || ''}${row[config.noteField] ? ' ' : ''}${reason}`.trim()
      changed = true
    }
  }

  if (changed) {
    setCardStatus(lines, title, 'blocked')
    writeQueueDoc({ rootDir, lane, lines, table, rows })
  }
}

function buildPromptFromCard({ lane, rootDir, title }) {
  const config = LANE_CONFIG[lane]
  const text = readText(rootDir, config.queueDoc)
  const lines = text.split('\n')
  const cardText = stripCloseoutRequirements(getCardText(lines, title))
  if (!cardText) {
    throw new Error(`Task card not found for ${title} in ${config.queueDoc}`)
  }

  return `Continue in ${rootDir}.

Implement the following ${config.label} queue task exactly as scoped below.

Source-of-truth rules:
- Dispatchability comes from the top '${config.queueHeading}' table in ${config.queueDoc}.
- Scope, allowed files, forbidden files, and verification come from the matching task card below.
- Keep the patch inside the allowed files.
- Update ${config.queueDoc} only if the task is actually completed, blocked, failed, superseded, or materially reclassified by evidence.
- If a follow-up task says a prerequisite must be \`accepted\`, worker \`completed\` / \`done\` is not enough. Only Codex local review should mark a task \`accepted\`.
- Runtime command safety: if runtime or Playwright verification is required, use \`./scripts/run-runtime-tests.sh ... --reporter=list\`. Do not run \`npx playwright test\`, \`npm exec playwright\`, \`vite preview\`, or browser processes directly.
- If the task forbids Playwright/runtime, do not start Playwright, Vite, or browser processes at all.
- Verification output safety: do not pipe verification commands through \`tail\`, \`grep\`, \`head\`, or other output truncation. If output is long, report the final summary after the full command completes.
- Runtime proof safety: if a test kills units, reloads a map, trains/rebuilds units, or triggers cleanup, read fresh state from \`window.__war3Game\` / \`g.units\` after the mutation. Do not keep using an old \`const units = g.units\` snapshot as proof.
- When a proof fails, first check whether the proof is reading stale game state or stale DOM before changing game balance or widening scope.

Queue task card:

${cardText}
`
}

function defaultDispatchTask({ lane, rootDir, title, prompt }) {
  const scriptPath = path.join(rootDir, 'scripts', 'dual-lane-companion.mjs')
  execFileSync('node', [scriptPath, 'task', '--lane', lane, '--title', title], {
    cwd: rootDir,
    input: prompt,
    encoding: 'utf8',
    stdio: ['pipe', 'pipe', 'pipe'],
  })
}

function buildStatusPayload({ lane, state, action, detail }) {
  return {
    checked_at: new Date().toISOString().replace(/\.\d{3}Z$/, 'Z'),
    state,
    action,
    detail,
    lane,
  }
}

function synthesisProvedNoCurrentWork(reasonCode) {
  return ['no_adjacent_tasks', 'candidate_stock_exhausted'].includes(reasonCode)
}

function findCurrentTransition(rootDir, oracle) {
  try {
    const transitionReport = buildVersionTransitionReport({ rootDir, oracle })
    return transitionReport.transitions.find((entry) => entry.isCurrentMilestone) ?? null
  } catch {
    return null
  }
}

function buildPreheatDispatchPayload({
  lane,
  rootDir,
  companionJobs,
  dispatchPreheatTaskImpl,
  dispatchVersionPreheatImpl,
  detailPrefix,
}) {
  const preheatTask = dispatchPreheatTaskImpl({ rootDir, jobs: companionJobs })
  if (preheatTask.dispatched) {
    const payload = buildStatusPayload({
      lane,
      state: 'running',
      action: 'preheat_task_dispatched',
      detail: `${detailPrefix}; dispatched one next-version preheat task (${preheatTask.candidate?.title ?? 'preheat task'})`,
    })
    payload.taskTitle = preheatTask.payload?.title ?? preheatTask.candidate?.title ?? 'Codex version preheat task'
    if (preheatTask.payload?.jobId) {
      payload.jobId = preheatTask.payload.jobId
    }
    return payload
  }

  if (preheatTask.reasonCode === 'preheat_task_running') {
    return buildStatusPayload({
      lane,
      state: 'running',
      action: 'preheat_task_running',
      detail: `next-version preheat task is already running (${preheatTask.reason})`,
    })
  }

  if (preheatTask.reasonCode === 'candidate_recently_attempted') {
    return buildStatusPayload({
      lane,
      state: 'cooldown',
      action: 'preheat_task_cooldown',
      detail: preheatTask.reason,
    })
  }

  const preheatRefresh = dispatchVersionPreheatImpl({ rootDir })
  if (preheatRefresh.dispatched) {
    const payload = buildStatusPayload({
      lane,
      state: 'running',
      action: 'preheat_candidate_refresh_dispatched',
      detail: `${detailPrefix}; dispatched next-version preheat candidate refresh (${preheatRefresh.transition?.id ?? 'current transition'})`,
    })
    payload.taskTitle = preheatRefresh.payload?.title ?? `Codex version preheat — ${preheatRefresh.transition?.id ?? 'current transition'}`
    if (preheatRefresh.payload?.jobId) {
      payload.jobId = preheatRefresh.payload.jobId
    }
    return payload
  }

  return null
}

function readStatusFile(rootDir, lane) {
  const statusFile = path.join(rootDir, LANE_CONFIG[lane].statusFile)
  if (!fs.existsSync(statusFile)) return null
  try {
    return JSON.parse(fs.readFileSync(statusFile, 'utf8'))
  } catch {
    return null
  }
}

function wasRecentlyDispatched(previousStatus, candidateTitle) {
  if (!previousStatus) return false
  if (normalizeTitle(previousStatus.taskTitle) !== normalizeTitle(candidateTitle)) return false
  if (QUEUED_PROMPT_ACTIONS.has(normalizeStatus(previousStatus.action)) || QUEUED_PROMPT_ACTIONS.has(normalizeStatus(previousStatus.state))) {
    return true
  }
  if (!['dispatched', 'await_confirmation'].includes(normalizeStatus(previousStatus.action))) return false
  const checkedAt = Date.parse(previousStatus.checked_at ?? '')
  if (!Number.isFinite(checkedAt)) return false
  return Date.now() - checkedAt < RECENT_DISPATCH_GRACE_MS
}

function wasRecentlySettled(previousStatus) {
  if (!previousStatus) return false
  const action = normalizeStatus(previousStatus.action)
  if (!['tracked_job_settled', 'post_settle_queue_pause'].includes(action)) return false
  const settledAt = Date.parse(previousStatus.settled_at ?? previousStatus.checked_at ?? '')
  if (!Number.isFinite(settledAt)) return false
  return Date.now() - settledAt < POST_SETTLED_SYNTHESIS_PAUSE_MS
}

function writeStatusFile(rootDir, lane, payload) {
  writeText(rootDir, LANE_CONFIG[lane].statusFile, `${JSON.stringify(payload, null, 2)}\n`)
}

function extractTrackedRunningJobId(detail, lane) {
  const match = String(detail ?? '').match(new RegExp(`tracked ${lane} job [^(]*\\(([^:]+):`))
  return match?.[1] ?? ''
}

function refreshCachedRunningStatus(rootDir, lane, payload, captureRuntimeOutputImpl = defaultCaptureRuntimeOutput) {
  if (payload?.state !== 'running' && payload?.action !== 'dispatched' && !payload?.jobId && !payload?.taskTitle) {
    return payload
  }
  const jobId = payload.jobId || extractTrackedRunningJobId(payload.detail, lane)
  const job = jobId
    ? readCompanionJob(rootDir, jobId)
    : payload.taskTitle
      ? findLatestCompanionJobByTitle(rootDir, lane, payload.taskTitle)
      : null
  if (job && isQueueClosedForTitle(rootDir, lane, job.title)) {
    const nextPayload = buildStatusPayload({
      lane,
      state: 'idle',
      action: 'tracked_job_queue_closed',
      detail: `tracked ${lane} job is stale because queue already closed it (${job.id}: ${job.title}); run check to continue`,
    })
    nextPayload.taskTitle = normalizeTitle(job.title)
    nextPayload.jobId = job.id
    writeStatusFile(rootDir, lane, nextPayload)
    return nextPayload
  }
  const runtimeOutput = captureRuntimeOutputImpl({ lane, rootDir })
  if (isQueuedPromptText(runtimeOutput)) {
    const nextPayload = buildQueuedPromptPayload({ lane, taskTitle: payload.taskTitle ?? job?.title ?? '', job })
    writeStatusFile(rootDir, lane, nextPayload)
    return nextPayload
  }
  const progressTitle = job?.title ?? payload.taskTitle ?? ''
  if (progressTitle && hasSubmittedLaneJobProgress(runtimeOutput, progressTitle)) {
    const nextPayload = buildStatusPayload({
      lane,
      state: 'running',
      action: 'runtime_progress_without_companion',
      detail: job
        ? `tracked ${lane} job shows runtime progress despite companion status ${job.status} (${job.id}: ${job.title})`
        : `runtime pane shows submitted work for ${progressTitle}`,
    })
    nextPayload.taskTitle = normalizeTitle(progressTitle)
    if (job?.id) nextPayload.jobId = job.id
    writeStatusFile(rootDir, lane, nextPayload)
    return nextPayload
  }
  if (!job) return payload
  if (normalizeStatus(job.status) === 'running' && !job.completedAt) {
    if (payload.state === 'running' && payload.jobId) return payload
    const nextPayload = buildStatusPayload({
      lane,
      state: 'running',
      action: 'none',
      detail: `tracked ${lane} job still running (${job.id}: ${job.title})`,
    })
    nextPayload.taskTitle = normalizeTitle(job.title)
    nextPayload.jobId = job.id
    writeStatusFile(rootDir, lane, nextPayload)
    return nextPayload
  }

  const nextPayload = buildStatusPayload({
    lane,
    state: 'idle',
    action: 'tracked_job_settled',
    detail: `tracked ${lane} job settled (${job.id}: ${job.title}) as ${job.status}; run check to continue`,
  })
  nextPayload.taskTitle = normalizeTitle(job.title)
  writeStatusFile(rootDir, lane, nextPayload)
  return nextPayload
}

function getLaneFeedLockDir(rootDir, lane) {
  return path.join(rootDir, 'logs', `.lane-feed-${lane}.lockdir`)
}

function lockAgeSeconds(lockDir) {
  const stats = fs.statSync(lockDir)
  return Math.max(0, Math.floor((Date.now() - stats.mtimeMs) / 1000))
}

function processExists(pid) {
  if (!pid) return false
  try {
    process.kill(pid, 0)
    return true
  } catch {
    return false
  }
}

function tryAcquireLaneFeedLock(rootDir, lane) {
  const lockDir = getLaneFeedLockDir(rootDir, lane)
  fs.mkdirSync(path.dirname(lockDir), { recursive: true })

  for (let attempt = 0; attempt < 2; attempt += 1) {
    try {
      fs.mkdirSync(lockDir)
      fs.writeFileSync(path.join(lockDir, 'pid'), `${process.pid}\n`, 'utf8')
      fs.writeFileSync(path.join(lockDir, 'lane'), `${lane}\n`, 'utf8')
      fs.writeFileSync(path.join(lockDir, 'started_at'), `${Math.floor(Date.now() / 1000)}\n`, 'utf8')
      return {
        acquired: true,
        release() {
          fs.rmSync(lockDir, { recursive: true, force: true })
        },
      }
    } catch (error) {
      if (error?.code !== 'EEXIST') throw error

      let holderPid = ''
      try {
        holderPid = fs.readFileSync(path.join(lockDir, 'pid'), 'utf8').trim()
      } catch {
        holderPid = ''
      }

      if (holderPid && !processExists(Number(holderPid))) {
        fs.rmSync(lockDir, { recursive: true, force: true })
        continue
      }

      if (!holderPid) {
        const ageSeconds = lockAgeSeconds(lockDir)
        if (ageSeconds >= LANE_FEED_LOCK_INIT_GRACE_SEC) {
          fs.rmSync(lockDir, { recursive: true, force: true })
          continue
        }
        return { acquired: false, reason: `lock is still initializing (${ageSeconds}s old)` }
      }

      return { acquired: false, reason: `lock held by pid ${holderPid}` }
    }
  }

  return { acquired: false, reason: 'lock acquisition exhausted retries' }
}

function runLaneCheck({
  lane,
  rootDir = ROOT_DIR,
  jobs = null,
  dispatch = true,
  dispatchTask = defaultDispatchTask,
  dispatchSynthesis = dispatchTaskSynthesis,
  dispatchPreheatTaskImpl = dispatchPreheatTask,
  dispatchVersionPreheatImpl = dispatchVersionPreheat,
  executeCutoverImpl = executeCutover,
  recoverStalledJobImpl = defaultRecoverStalledJob,
  captureRuntimeOutputImpl = defaultCaptureRuntimeOutput,
}) {
  if (!LANE_CONFIG[lane]) {
    throw new Error(`Unknown lane: ${lane}`)
  }

  const previousStatus = readStatusFile(rootDir, lane)
  const provisionalTitle = wasRecentlyDispatched(previousStatus, previousStatus?.taskTitle ?? '')
    ? normalizeTitle(previousStatus.taskTitle)
    : null
  const companionJobs = jobs ?? refreshCompanionJobs({ lane, rootDir })
  const syncResult = syncLaneQueue({ lane, rootDir, jobs: companionJobs, provisionalTitle })
  const refillPlan = buildRefillPlan({ lane, rootDir })
  applyPlans({ rootDir, plans: [refillPlan] })
  repairTaskCardMissingBlocks({ lane, rootDir })
  repairLatestReadyCardMissingRow({ lane, rootDir })
  const laneRunningJob = pickAnyLaneRunningJob(lane, companionJobs, { rootDir })

  if (laneRunningJob) {
    if (detectQueuedPrompt({ lane, rootDir, captureRuntimeOutputImpl })) {
      const payload = buildQueuedPromptPayload({ lane, taskTitle: laneRunningJob.title, job: laneRunningJob })
      writeStatusFile(rootDir, lane, payload)
      return payload
    }

    const attentionKind = runningJobAttentionKind(laneRunningJob)
    if (attentionKind) {
      const recovery = dispatch ? recoverStalledJobImpl({ lane, rootDir, job: laneRunningJob }) : null
      const payload = buildStatusPayload(
        recovery ?? {
          lane,
          state: attentionKind === 'stalled' ? 'stalled' : 'running_attention',
          action: attentionKind === 'stalled' ? 'lane_job_stalled' : 'lane_job_over_budget',
          detail: `tracked ${lane} job needs attention (${laneRunningJob.id}: ${laneRunningJob.title}); no new task dispatched until it is recovered or cancelled`,
        },
      )
      payload.taskTitle = normalizeTitle(laneRunningJob.title)
      writeStatusFile(rootDir, lane, payload)
      return payload
    }

    const payload = buildStatusPayload({
      lane,
      state: 'running',
      action: 'none',
      detail: `tracked ${lane} job still running (${laneRunningJob.id}: ${laneRunningJob.title})`,
    })
    writeStatusFile(rootDir, lane, payload)
    return payload
  }

  if (syncResult.provisionalTitle) {
    if (detectQueuedPrompt({ lane, rootDir, captureRuntimeOutputImpl })) {
      const payload = buildQueuedPromptPayload({ lane, taskTitle: syncResult.provisionalTitle })
      writeStatusFile(rootDir, lane, payload)
      return payload
    }

    const payload = buildStatusPayload({
      lane,
      state: 'running',
      action: 'await_confirmation',
      detail: `waiting for ${lane} companion to confirm ${syncResult.provisionalTitle}`,
    })
    payload.taskTitle = syncResult.provisionalTitle
    writeStatusFile(rootDir, lane, payload)
    return payload
  }

  const reviewWaitJob = findCompletedJobAwaitingCodexReview({ lane, rootDir, jobs: companionJobs })
  if (reviewWaitJob) {
    const payload = buildStatusPayload({
      lane,
      state: 'waiting',
      action: 'codex_review_wait',
      detail: `holding next ${lane} dispatch; ${reviewWaitJob.title} is ${reviewWaitJob.status} and still needs Codex local review before another GLM implementation task starts`,
    })
    payload.taskTitle = reviewWaitJob.title
    payload.jobId = reviewWaitJob.id
    payload.settled_at = reviewWaitJob.completedAt
    writeStatusFile(rootDir, lane, payload)
    return payload
  }

  const candidateDecision = findDispatchCandidate(lane, rootDir, companionJobs)
  if (!candidateDecision.row) {
    if (candidateDecision.frozenCandidate) {
      const runtimeOutput = captureRuntimeOutputImpl({ lane, rootDir })
      if (isQueuedPromptText(runtimeOutput)) {
        const payload = buildQueuedPromptPayload({ lane, taskTitle: candidateDecision.frozenCandidate.title })
        writeStatusFile(rootDir, lane, payload)
        return payload
      }
      if (hasSubmittedLaneJobProgress(runtimeOutput, candidateDecision.frozenCandidate.title)) {
        promoteCandidateToCurrent({ lane, rootDir, title: candidateDecision.frozenCandidate.title })
        const payload = buildStatusPayload({
          lane,
          state: 'running',
          action: 'runtime_progress_without_companion',
          detail: `holding ${candidateDecision.frozenCandidate.title}; runtime pane shows submitted work despite companion reporting ${candidateDecision.frozenCandidate.status}`,
        })
        payload.taskTitle = candidateDecision.frozenCandidate.title
        payload.cooldown_anchor_at = new Date(candidateDecision.frozenCandidate.timestampMs).toISOString()
        writeStatusFile(rootDir, lane, payload)
        return payload
      }
      const payload = buildStatusPayload({
        lane,
        state: 'cooldown',
        action: 'same_title_freeze',
        detail: `holding ${candidateDecision.frozenCandidate.title}; recent ${lane} attempt is still frozen (${candidateDecision.frozenCandidate.status} ${formatAttemptAge(candidateDecision.frozenCandidate.timestampMs)})`,
      })
      payload.taskTitle = candidateDecision.frozenCandidate.title
      payload.cooldown_anchor_at = new Date(candidateDecision.frozenCandidate.timestampMs).toISOString()
      writeStatusFile(rootDir, lane, payload)
      return payload
    }

    if (candidateDecision.waitingCandidate) {
      const payload = buildStatusPayload({
        lane,
        state: 'waiting',
        action: 'prerequisite_wait',
        detail: `holding ${candidateDecision.waitingCandidate.title}; waiting for completed prerequisite: ${candidateDecision.waitingCandidate.missingPrerequisites.join(', ')}`,
      })
      payload.taskTitle = candidateDecision.waitingCandidate.title
      payload.missingPrerequisites = candidateDecision.waitingCandidate.missingPrerequisites
      writeStatusFile(rootDir, lane, payload)
      return payload
    }

    const currentTransition = findCurrentTransition(rootDir, refillPlan.oracle)
    if (dispatch && lane === 'codex' && currentTransition?.state === 'preheat-due') {
      const preheatPayload = buildPreheatDispatchPayload({
        lane,
        rootDir,
        companionJobs,
        dispatchPreheatTaskImpl,
        dispatchVersionPreheatImpl,
        detailPrefix: `${currentTransition.toVersion} preheat is due while ${currentTransition.fromVersion} has ${currentTransition.blockerCount} engineering blocker(s) left`,
      })
      if (preheatPayload) {
        writeStatusFile(rootDir, lane, preheatPayload)
        return preheatPayload
      }
    }

    if (refillPlan.frozen) {
      if (dispatch && lane === 'codex' && currentTransition?.state === 'cutover-ready') {
        const cutover = executeCutoverImpl({ rootDir })
        if (cutover.activated) {
          const payload = buildStatusPayload({
            lane,
            state: 'idle',
            action: 'transition_cutover_done',
            detail: `${currentTransition.id} activated; ${cutover.runtimeState.currentMilestone} is now active`,
          })
          payload.transition = {
            id: currentTransition.id,
            fromVersion: currentTransition.fromVersion,
            toVersion: currentTransition.toVersion,
            state: 'cutover-done',
            reason: cutover.reason,
            activeMilestone: cutover.runtimeState.currentMilestone,
          }
          writeStatusFile(rootDir, lane, payload)
          return payload
        }
      }
      if (dispatch && lane === 'codex' && currentTransition?.state === 'cutover-blocked') {
        const preheatPayload = buildPreheatDispatchPayload({
          lane,
          rootDir,
          companionJobs,
          dispatchPreheatTaskImpl,
          dispatchVersionPreheatImpl,
          detailPrefix: `${currentTransition.fromVersion} engineering closeout is complete, but ${currentTransition.toVersion} transition pack is missing artifacts`,
        })
        if (preheatPayload) {
          writeStatusFile(rootDir, lane, preheatPayload)
          return preheatPayload
        }
      }
      const payload = currentTransition
        ? buildStatusPayload({
            lane,
            state: currentTransition.state === 'cutover-ready' ? 'idle' : 'blocked',
            action: currentTransition.state === 'cutover-ready' ? 'transition_cutover_ready' : 'transition_cutover_blocked',
            detail:
              currentTransition.state === 'cutover-ready'
                ? `${currentTransition.fromVersion} engineering closeout is complete; ${currentTransition.toVersion} transition pack is ready`
                : `${currentTransition.fromVersion} engineering closeout is complete, but ${currentTransition.toVersion} transition pack is still missing ${currentTransition.missingArtifacts.length} artifact(s)`,
          })
        : buildStatusPayload({
            lane,
            state: 'idle',
            action: 'milestone_ready_no_transition',
            detail: `current milestone is engineering-closed (${refillPlan.oracle?.milestone ?? 'current milestone'}), but no version transition entry matched it`,
          })
      if (currentTransition) {
        payload.transition = {
          id: currentTransition.id,
          fromVersion: currentTransition.fromVersion,
          toVersion: currentTransition.toVersion,
          state: currentTransition.state,
          reason: currentTransition.reason,
          missingArtifacts: currentTransition.missingArtifacts.map((artifact) => artifact.path),
        }
      }
      writeStatusFile(rootDir, lane, payload)
      return payload
    }

    if (wasRecentlySettled(previousStatus)) {
      const payload = buildStatusPayload({
        lane,
        state: 'idle',
        action: 'post_settle_queue_pause',
        detail: `recent ${lane} job just settled; pausing task synthesis briefly so queue docs can be updated`,
      })
      payload.taskTitle = normalizeTitle(previousStatus.taskTitle ?? '')
      payload.settled_at = previousStatus.settled_at ?? previousStatus.checked_at
      writeStatusFile(rootDir, lane, payload)
      return payload
    }

    const synthesis = dispatchSynthesis({ rootDir, requestingLane: lane })
    if (synthesis.dispatched) {
      const payload = buildStatusPayload({
        lane,
        state: 'running',
        action: 'task_synthesis_dispatched',
        detail: `live queue empty; dispatched codex task synthesis for ${lane} lane`,
      })
      if (synthesis.payload?.jobId) {
        payload.taskTitle = synthesis.payload.title ?? `Codex task synthesis — ${synthesis.oracle?.milestone ?? 'current milestone'}`
      }
      writeStatusFile(rootDir, lane, payload)
      return payload
    }

    if (lane === 'codex' && synthesisProvedNoCurrentWork(synthesis.reasonCode)) {
      const preheatPayload = buildPreheatDispatchPayload({
        lane,
        rootDir,
        companionJobs,
        dispatchPreheatTaskImpl,
        dispatchVersionPreheatImpl,
        detailPrefix: 'current milestone has no adjacent queue work',
      })
      if (preheatPayload) {
        writeStatusFile(rootDir, lane, preheatPayload)
        return preheatPayload
      }
    }

    const payload = buildStatusPayload({
      lane,
      state: 'idle',
      action: 'queue_empty',
      detail: `no dispatchable ${lane} task remains in the live queue | synthesis skipped: ${synthesis.reason}`,
    })
    writeStatusFile(rootDir, lane, payload)
    return payload
  }

  const candidate = candidateDecision.row
  const candidateTitle = normalizeTitle(candidate.Task)
  const cooldown = dispatch ? getLaneCooldown({ lane, jobs: companionJobs, previousStatus }) : null
  if (dispatch && cooldown && cooldown.remainingMs > 0) {
    const payload = buildStatusPayload({
      lane,
      state: 'cooldown',
      action: 'cooldown',
      detail: `${lane} cooldown active; dispatch ${candidateTitle} in ${formatDuration(Math.ceil(cooldown.remainingMs / 1000))}`,
    })
    payload.taskTitle = candidateTitle
    payload.cooldown_anchor_at = new Date(cooldown.anchorMs).toISOString()
    writeStatusFile(rootDir, lane, payload)
    return payload
  }

  if (!dispatch) {
    const payload = buildStatusPayload({
      lane,
      state: 'ready',
      action: 'planned',
      detail: `next ${lane} task is ${candidateTitle}`,
    })
    payload.taskTitle = candidateTitle
    writeStatusFile(rootDir, lane, payload)
    return payload
  }

  let prompt
  try {
    prompt = buildPromptFromCard({ lane, rootDir, title: candidateTitle })
  } catch (error) {
    const reason = `任务卡缺失，未派发：${error.message}`
    markCandidateBlocked({ lane, rootDir, title: candidateTitle, reason })
    const payload = buildStatusPayload({
      lane,
      state: 'blocked',
      action: 'task_card_missing',
      detail: reason,
    })
    payload.taskTitle = candidateTitle
    writeStatusFile(rootDir, lane, payload)
    return payload
  }

  promoteCandidateToCurrent({ lane, rootDir, title: candidateTitle })
  dispatchTask({ lane, rootDir, title: candidateTitle, prompt })
  const dispatchedJob = findLatestCompanionJobByTitle(rootDir, lane, candidateTitle)

  if (detectQueuedPrompt({ lane, rootDir, captureRuntimeOutputImpl })) {
    const payload = buildQueuedPromptPayload({ lane, taskTitle: candidateTitle, job: dispatchedJob })
    writeStatusFile(rootDir, lane, payload)
    return payload
  }

  const payload = buildStatusPayload({
    lane,
    state: dispatchedJob && normalizeStatus(dispatchedJob.status) === 'running' && !dispatchedJob.completedAt ? 'running' : 'ready',
    action: 'dispatched',
    detail: `dispatched ${candidateTitle}`,
  })
  payload.taskTitle = candidateTitle
  if (dispatchedJob?.id) payload.jobId = dispatchedJob.id
  writeStatusFile(rootDir, lane, payload)
  return payload
}

function printStatus(rootDir, lane, captureRuntimeOutputImpl = defaultCaptureRuntimeOutput) {
  const statusFile = path.join(rootDir, LANE_CONFIG[lane].statusFile)
  if (!fs.existsSync(statusFile)) {
    const payload = buildStatusPayload({
      lane,
      state: 'unknown',
      action: 'none',
      detail: `no ${lane} feed status yet`,
    })
    writeStatusFile(rootDir, lane, payload)
    return payload
  }
  const payload = JSON.parse(fs.readFileSync(statusFile, 'utf8'))
  return refreshCachedRunningStatus(rootDir, lane, payload, captureRuntimeOutputImpl)
}

function runCli() {
  const args = parseArgs(process.argv.slice(2))
  if (!args.lane) {
    throw new Error('lane-feed requires --lane <codex|glm>')
  }

  let payload
  if (args.command === 'status') {
    payload = printStatus(args.rootDir, args.lane)
  } else {
    const lock = tryAcquireLaneFeedLock(args.rootDir, args.lane)
    if (!lock.acquired) {
      const previous = readStatusFile(args.rootDir, args.lane)
      payload = previous
        ? {
            ...previous,
            detail: `${previous.detail} | lane-feed lock: ${lock.reason}`,
          }
        : buildStatusPayload({
            lane: args.lane,
            state: 'running',
            action: 'lock_held',
            detail: `${args.lane} lane-feed skipped because ${lock.reason}`,
          })
    } else {
      try {
        payload = runLaneCheck({ lane: args.lane, rootDir: args.rootDir, dispatch: args.dispatch })
      } finally {
        lock.release()
      }
    }
  }

  if (args.json) {
    console.log(JSON.stringify(payload, null, 2))
    return
  }

  console.log(`${payload.state}: ${payload.action}: ${payload.detail}`)
}

if (process.argv[1] && path.resolve(process.argv[1]) === __filename) {
  runCli()
}

export {
  buildPromptFromCard,
  hasSubmittedLaneJobProgress,
  stripCloseoutRequirements,
  findDispatchCandidate,
  isQueuedPromptText,
  printStatus,
  runLaneCheck,
  syncLaneQueue,
  tryAcquireLaneFeedLock,
}
