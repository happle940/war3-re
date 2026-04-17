#!/usr/bin/env node

import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'

import { DEFAULT_CONFIG_PATH, DEFAULT_STATE_PATH, resolveMilestoneDocs } from './version-runtime.mjs'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const ROOT_DIR = path.resolve(__dirname, '..')

function readText(rootDir, relativePath) {
  return fs.readFileSync(path.join(rootDir, relativePath), 'utf8').replaceAll('\r\n', '\n')
}

function splitTableLine(line) {
  return line
    .trim()
    .split('|')
    .slice(1, -1)
    .map((cell) => cell.trim())
}

function parseMarkdownTableLines(tableLines) {
  if (tableLines.length < 2) return null
  const headers = splitTableLine(tableLines[0])
  const rows = tableLines.slice(2).map((line) => {
    const cells = splitTableLine(line)
    return Object.fromEntries(headers.map((header, index) => [header, cells[index] ?? '']))
  })
  return { headers, rows }
}

function lineIndex(lines, predicate) {
  for (let index = 0; index < lines.length; index += 1) {
    if (predicate(lines[index], index)) return index
  }
  return -1
}

function findSectionEnd(lines, headingIndex) {
  for (let index = headingIndex + 1; index < lines.length; index += 1) {
    if (/^##\s+/.test(lines[index].trim())) return index
  }
  return lines.length
}

function parseMarkdownTablesInRange(lines, start, endExclusive) {
  const tables = []
  let index = start
  while (index < endExclusive) {
    if (!lines[index].trim().startsWith('|')) {
      index += 1
      continue
    }

    let tableEnd = index
    while (tableEnd < endExclusive && lines[tableEnd].trim().startsWith('|')) {
      tableEnd += 1
    }

    const table = parseMarkdownTableLines(lines.slice(index, tableEnd))
    if (table) tables.push(table)
    index = tableEnd
  }

  return tables
}

function normalizeGateKey(value) {
  const raw = String(value ?? '').trim()
  const quoted = raw.match(/`([^`]+)`/)
  if (quoted) return quoted[1].trim()
  return raw.replaceAll('`', '').trim().split(/\s+/)[0] ?? ''
}

function normalizeStatus(status) {
  return String(status ?? '').replaceAll('`', '').trim().toLowerCase()
}

function extractStatusTokens(value) {
  const splitCompositeStatuses = (raw) =>
    String(raw ?? '')
      .split(/[\/,]/)
      .map((part) => normalizeStatus(part))
      .filter(Boolean)
  const matches = [...String(value ?? '').matchAll(/`([^`]+)`/g)].flatMap((match) => splitCompositeStatuses(match[1]))
  if (matches.length > 0) return [...new Set(matches)]
  const normalized = normalizeStatus(value)
  return normalized ? [normalized] : []
}

function extractCurrentMilestone(rootDir = ROOT_DIR, options = {}) {
  return resolveMilestoneDocs(rootDir, options).currentMilestone
}

function pickFirstRowValue(row, candidates) {
  for (const key of candidates) {
    if (key in row) return row[key]
  }
  return ''
}

function pickGateConclusion(row) {
  const direct = pickFirstRowValue(row, ['当前 V2 结论', '当前 V3 结论', '当前结论', '初始结论'])
  if (direct) return direct
  const versionedConclusionKey = Object.keys(row).find((key) => /^(当前|初始)\s+V\d+\s+结论$/i.test(key.trim()))
  return versionedConclusionKey ? row[versionedConclusionKey] : ''
}

function collectHeadingTables(lines, headingPattern) {
  const sections = []
  for (let index = 0; index < lines.length; index += 1) {
    const heading = lines[index].trim()
    if (!headingPattern.test(heading)) continue
    const tables = parseMarkdownTablesInRange(lines, index + 1, findSectionEnd(lines, index))
    if (tables.length > 0) sections.push({ heading, tables })
  }
  return sections
}

function classifyGateConclusion(value) {
  const text = String(value ?? '').toLowerCase()
  if (text.includes('conditional blocker')) return 'conditional'
  if (/\bv\d+\s+blocker\b/.test(text) || text.includes(' blocker')) return 'blocker'
  if (text.includes('closed-by-docs')) return 'docs-closed'
  if (text.includes('allowed residual')) return 'residual'
  if (text.includes('residual')) return 'residual'
  if (text.includes('user gate')) return 'user-gate'
  return 'other'
}

function parseRemainingGateDefinitions(rootDir, remainingGatesPath) {
  const text = readText(rootDir, remainingGatesPath)
  const lines = text.split('\n')
  const definitions = []
  const sections = collectHeadingTables(lines, /^##\s+/)

  for (const { heading, tables } of sections) {
    for (const table of tables) {
      for (const row of table.rows) {
        const gate = normalizeGateKey(row.Gate)
        const conclusion = pickGateConclusion(row)
        if (!gate || !conclusion) continue
        definitions.push({
          gate,
          section: heading,
          type: pickFirstRowValue(row, ['类型', 'Type', '类型 ']),
          conclusion,
          className: classifyGateConclusion(conclusion),
          closingEvidence: pickFirstRowValue(row, ['关闭证据']),
        })
      }
    }
  }

  return definitions
}

function readEvidenceLedgerStatuses(rootDir, evidenceLedgerPath) {
  const text = readText(rootDir, evidenceLedgerPath)
  const lines = text.split('\n')
  const statuses = new Map()
  const sections = collectHeadingTables(lines, /^##\s+.*evidence ledger$/i)

  for (const { tables } of sections) {
    for (const table of tables) {
      for (const row of table.rows) {
        const gate = normalizeGateKey(row.Gate)
        const statusValue = pickFirstRowValue(row, ['当前状态', 'Current status'])
        if (!gate || !statusValue) continue
        statuses.set(gate, extractStatusTokens(statusValue))
      }
    }
  }

  return statuses
}

function isOpenEngineeringStatus(status) {
  const normalized = normalizeStatus(status)
  if (!normalized) return false

  const directOpenStatuses = new Set([
    'open',
    'conditional-open',
    'preheat-open',
    'blocked',
    'insufficient-evidence',
    'partial-proof',
  ])
  if (directOpenStatuses.has(normalized)) return true
  if (normalized.startsWith('blocked-')) return true
  if (normalized.includes('pending-proof')) return true
  if (normalized.includes('evidence-gap')) return true
  if (normalized.includes('proof-missing')) return true
  if (normalized.endsWith('-missing')) return true
  return false
}

function gateNeedsEngineeringCloseout(definition, statuses) {
  if (definition.className === 'blocker') {
    return statuses.some((status) => isOpenEngineeringStatus(status)) || statuses.length === 0
  }
  if (definition.className === 'conditional') {
    return statuses.some((status) => isOpenEngineeringStatus(status))
  }
  return false
}

function buildMilestoneOracle(rootDir = ROOT_DIR, options = {}) {
  const milestoneContext = resolveMilestoneDocs(rootDir, options)
  const milestone = milestoneContext.currentMilestone
  const definitions = parseRemainingGateDefinitions(rootDir, milestoneContext.remainingGatesPath)
  const statusMap = readEvidenceLedgerStatuses(rootDir, milestoneContext.evidenceLedgerPath)

  const gates = definitions.map((definition) => {
    const statuses = statusMap.get(definition.gate) ?? []
    return {
      gate: definition.gate,
      section: definition.section,
      type: definition.type,
      conclusion: definition.conclusion,
      className: definition.className,
      closingEvidence: definition.closingEvidence,
      statuses,
      needsEngineeringCloseout: gateNeedsEngineeringCloseout(definition, statuses),
      userDecisionPending: statuses.includes('user-open'),
    }
  })

  const blockerGatesOpen = gates.filter((gate) => gate.className === 'blocker' && gate.needsEngineeringCloseout)
  const conditionalGatesOpen = gates.filter((gate) => gate.className === 'conditional' && gate.needsEngineeringCloseout)
  const userDecisionPending = gates.filter((gate) => gate.userDecisionPending)

  return {
    milestone,
    currentVersion: milestoneContext.currentVersion,
    docs: {
      remainingGates: milestoneContext.remainingGatesPath,
      evidenceLedger: milestoneContext.evidenceLedgerPath,
      source: milestoneContext.source,
      activatedByTransitionId: milestoneContext.activatedByTransitionId ?? milestoneContext.runtimeState?.activatedByTransitionId ?? null,
    },
    engineeringCloseoutReady: blockerGatesOpen.length === 0 && conditionalGatesOpen.length === 0,
    blockerGatesOpen,
    conditionalGatesOpen,
    userDecisionPending,
    gates,
  }
}

function runCli() {
  const args = process.argv.slice(2)
  const json = args.includes('--json')
  const rootArgIndex = args.indexOf('--root')
  const rootDir = rootArgIndex !== -1 ? path.resolve(args[rootArgIndex + 1] ?? ROOT_DIR) : ROOT_DIR
  const configArgIndex = args.indexOf('--config')
  const stateArgIndex = args.indexOf('--state')
  const configPath = configArgIndex !== -1 ? args[configArgIndex + 1] ?? DEFAULT_CONFIG_PATH : DEFAULT_CONFIG_PATH
  const statePath = stateArgIndex !== -1 ? args[stateArgIndex + 1] ?? DEFAULT_STATE_PATH : DEFAULT_STATE_PATH
  const oracle = buildMilestoneOracle(rootDir, { configPath, statePath })

  if (json) {
    console.log(JSON.stringify(oracle, null, 2))
    return
  }

  console.log(`Milestone: ${oracle.milestone}`)
  console.log(`Engineering closeout ready: ${oracle.engineeringCloseoutReady ? 'yes' : 'no'}`)
  console.log(`Open blockers: ${oracle.blockerGatesOpen.map((gate) => gate.gate).join(', ') || 'none'}`)
  console.log(`Open conditional gates: ${oracle.conditionalGatesOpen.map((gate) => gate.gate).join(', ') || 'none'}`)
  console.log(`User decision pending: ${oracle.userDecisionPending.map((gate) => gate.gate).join(', ') || 'none'}`)
}

if (process.argv[1] && path.resolve(process.argv[1]) === __filename) {
  runCli()
}

export {
  buildMilestoneOracle,
  extractCurrentMilestone,
  parseRemainingGateDefinitions,
  pickGateConclusion,
  readEvidenceLedgerStatuses,
}
