#!/usr/bin/env node

import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'

import { applyPlans, buildRefillPlan } from './queue-refill.mjs'
import { buildVersionTransitionReport } from './version-transition-orchestrator.mjs'
import { DEFAULT_CONFIG_PATH, DEFAULT_STATE_PATH, readVersionRuntimeState, writeVersionRuntimeState } from './version-runtime.mjs'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const ROOT_DIR = path.resolve(__dirname, '..')

const LIVE_QUEUE_CONFIG = {
  codex: {
    queueDoc: 'docs/CODEX_ACTIVE_QUEUE.md',
    heading: '## Current Codex Queue State',
    nonTerminalStatuses: new Set(['ready', 'active']),
  },
  glm: {
    queueDoc: 'docs/GLM_READY_TASK_QUEUE.md',
    heading: 'Current queue state:',
    nonTerminalStatuses: new Set(['ready', 'in_progress']),
  },
}

function parseArgs(argv) {
  const args = {
    command: 'plan',
    rootDir: ROOT_DIR,
    configPath: DEFAULT_CONFIG_PATH,
    statePath: DEFAULT_STATE_PATH,
    json: false,
  }
  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index]
    if (token === 'plan' || token === 'apply') {
      args.command = token
      continue
    }
    if (token === '--root') {
      args.rootDir = path.resolve(argv[index + 1] ?? args.rootDir)
      index += 1
      continue
    }
    if (token === '--config') {
      args.configPath = argv[index + 1] ?? args.configPath
      index += 1
      continue
    }
    if (token === '--state') {
      args.statePath = argv[index + 1] ?? args.statePath
      index += 1
      continue
    }
    if (token === '--json') {
      args.json = true
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

function normalizeStatus(status) {
  return String(status ?? '').replaceAll('`', '').trim().toLowerCase()
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

function setCardStatus(lines, title, status) {
  const bounds = findCardBounds(lines, title)
  if (!bounds) return false
  for (let index = bounds.start + 1; index < bounds.end; index += 1) {
    if (lines[index].trim().startsWith('Status:')) {
      lines[index] = `Status: \`${status}\`.`
      return true
    }
  }
  return false
}

function clearLaneLiveRows({ rootDir, lane }) {
  const config = LIVE_QUEUE_CONFIG[lane]
  const text = readText(rootDir, config.queueDoc)
  const lines = text.split('\n')
  const table = parseTableFromLines(lines, config.heading)
  const clearedTitles = table.rows
    .filter((row) => config.nonTerminalStatuses.has(normalizeStatus(row.Status)))
    .map((row) => String(row.Task ?? '').trim())

  if (clearedTitles.length === 0) {
    return { lane, queueDoc: config.queueDoc, clearedTitles: [] }
  }

  const nextRows = table.rows.filter((row) => !config.nonTerminalStatuses.has(normalizeStatus(row.Status)))
  const renderedTable = renderTable(table.headers, nextRows)
  lines.splice(table.start, table.end - table.start, ...renderedTable)
  for (const title of clearedTitles) {
    setCardStatus(lines, title, 'superseded')
  }

  writeText(rootDir, config.queueDoc, `${lines.join('\n').replace(/\n+$/, '\n')}`)
  return { lane, queueDoc: config.queueDoc, clearedTitles }
}

function buildCutoverDecision({ rootDir = ROOT_DIR, configPath = DEFAULT_CONFIG_PATH, statePath = DEFAULT_STATE_PATH } = {}) {
  const runtimeState = readVersionRuntimeState(rootDir, { configPath, statePath })
  const report = buildVersionTransitionReport({ rootDir, configPath })
  const transition = report.transitions.find((entry) => entry.isCurrentMilestone) ?? null

  if (!transition) {
    return {
      shouldActivate: false,
      reasonCode: 'no_current_transition',
      reason: `no transition entry matches current milestone ${report.currentMilestone}`,
      runtimeState,
      report,
      transition: null,
    }
  }

  if (transition.state !== 'cutover-ready') {
    return {
      shouldActivate: false,
      reasonCode: 'not_cutover_ready',
      reason: transition.reason,
      runtimeState,
      report,
      transition,
    }
  }

  if (runtimeState.currentMilestone !== transition.fromMilestone) {
    return {
      shouldActivate: false,
      reasonCode: 'runtime_state_out_of_sync',
      reason: `runtime state is ${runtimeState.currentMilestone}, not ${transition.fromMilestone}`,
      runtimeState,
      report,
      transition,
    }
  }

  if (
    runtimeState.currentMilestone === transition.toMilestone ||
    runtimeState.activationHistory.some((entry) => entry.transitionId === transition.id)
  ) {
    return {
      shouldActivate: false,
      reasonCode: 'already_activated',
      reason: `${transition.id} has already been activated`,
      runtimeState,
      report,
      transition,
    }
  }

  return {
    shouldActivate: true,
    reasonCode: 'cutover_ready',
    reason: `${transition.id} is ready to activate`,
    runtimeState,
    report,
    transition,
  }
}

function executeCutover({ rootDir = ROOT_DIR, configPath = DEFAULT_CONFIG_PATH, statePath = DEFAULT_STATE_PATH } = {}) {
  const decision = buildCutoverDecision({ rootDir, configPath, statePath })
  if (!decision.shouldActivate) {
    return {
      activated: false,
      reasonCode: decision.reasonCode,
      reason: decision.reason,
      runtimeState: decision.runtimeState,
      report: decision.report,
      transition: decision.transition,
    }
  }

  const activatedAt = new Date().toISOString()
  const transition = decision.transition
  const runtimeState = writeVersionRuntimeState(
    rootDir,
    {
      ...decision.runtimeState,
      currentVersion: transition.toVersion,
      currentMilestone: transition.toMilestone,
      activatedByTransitionId: transition.id,
      activatedAt,
      activationHistory: [
        ...decision.runtimeState.activationHistory,
        {
          transitionId: transition.id,
          fromVersion: transition.fromVersion,
          toVersion: transition.toVersion,
          fromMilestone: transition.fromMilestone,
          toMilestone: transition.toMilestone,
          activatedAt,
        },
      ],
    },
    { statePath },
  )

  const clearedQueues = Object.keys(LIVE_QUEUE_CONFIG).map((lane) => clearLaneLiveRows({ rootDir, lane }))
  const plans = ['codex', 'glm'].map((lane) => buildRefillPlan({ lane, rootDir }))
  applyPlans({ rootDir, plans })

  return {
    activated: true,
    reasonCode: 'activated',
    reason: `${transition.id} activated; ${transition.toVersion} is now the active milestone`,
    runtimeState,
    report: buildVersionTransitionReport({ rootDir, configPath }),
    transition,
    clearedQueues,
    seededQueues: plans.map((plan) => ({
      lane: plan.lane,
      runwayDoc: plan.runwayDoc,
      promoted: plan.promoted.map((task) => task.title),
    })),
  }
}

function runCli() {
  const args = parseArgs(process.argv.slice(2))
  const result =
    args.command === 'apply'
      ? executeCutover({ rootDir: args.rootDir, configPath: args.configPath, statePath: args.statePath })
      : buildCutoverDecision({ rootDir: args.rootDir, configPath: args.configPath, statePath: args.statePath })

  if (args.json) {
    console.log(JSON.stringify(result, null, 2))
    return
  }

  if (!('activated' in result) || !result.activated) {
    console.log(`${result.reasonCode}: ${result.reason}`)
    return
  }

  console.log(`${result.transition.id}: activated`)
  console.log(`Active milestone: ${result.runtimeState.currentMilestone}`)
  console.log(`Codex seeded: ${result.seededQueues.find((entry) => entry.lane === 'codex')?.promoted.join(', ') || 'none'}`)
  console.log(`GLM seeded: ${result.seededQueues.find((entry) => entry.lane === 'glm')?.promoted.join(', ') || 'none'}`)
}

if (process.argv[1] && path.resolve(process.argv[1]) === __filename) {
  runCli()
}

export {
  buildCutoverDecision,
  clearLaneLiveRows,
  executeCutover,
}
