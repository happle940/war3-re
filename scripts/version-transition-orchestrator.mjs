#!/usr/bin/env node

import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'

import { buildMilestoneOracle } from './milestone-oracle.mjs'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const ROOT_DIR = path.resolve(__dirname, '..')
const DEFAULT_CONFIG_PATH = 'docs/VERSION_TRANSITIONS.json'

function readJson(rootDir, relativePath) {
  return JSON.parse(fs.readFileSync(path.join(rootDir, relativePath), 'utf8'))
}

function fileExists(rootDir, relativePath) {
  return fs.existsSync(path.join(rootDir, relativePath))
}

function parseArgs(argv) {
  const args = { rootDir: ROOT_DIR, configPath: DEFAULT_CONFIG_PATH, json: false }
  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index]
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
    if (token === '--json') {
      args.json = true
    }
  }
  return args
}

function loadTransitionConfig(rootDir = ROOT_DIR, configPath = DEFAULT_CONFIG_PATH) {
  const config = readJson(rootDir, configPath)
  if (!Array.isArray(config.transitions)) {
    throw new Error(`Invalid transition config: missing transitions array in ${configPath}`)
  }
  return config
}

function artifactStatus(rootDir, artifacts = {}) {
  const entries = Object.entries(artifacts).map(([name, relativePath]) => ({
    name,
    path: relativePath,
    exists: fileExists(rootDir, relativePath),
  }))
  return {
    entries,
    missing: entries.filter((entry) => !entry.exists),
    ready: entries.every((entry) => entry.exists),
  }
}

function currentEngineeringBlockerCount(oracle) {
  return (oracle.blockerGatesOpen?.length ?? 0) + (oracle.conditionalGatesOpen?.length ?? 0)
}

function summarizeGate(gate = {}) {
  return {
    gate: gate.gate ?? '',
    section: gate.section ?? '',
    type: gate.type ?? '',
    className: gate.className ?? '',
    statuses: Array.isArray(gate.statuses) ? gate.statuses : [],
    conclusion: gate.conclusion ?? '',
    needsEngineeringCloseout: Boolean(gate.needsEngineeringCloseout),
    userDecisionPending: Boolean(gate.userDecisionPending),
  }
}

function buildOracleSnapshot(oracle = {}) {
  return {
    milestone: oracle.milestone ?? '',
    engineeringCloseoutReady: Boolean(oracle.engineeringCloseoutReady),
    blockerCount: currentEngineeringBlockerCount(oracle),
    blockerGatesOpen: (oracle.blockerGatesOpen ?? []).map(summarizeGate),
    conditionalGatesOpen: (oracle.conditionalGatesOpen ?? []).map(summarizeGate),
    userDecisionPending: (oracle.userDecisionPending ?? []).map(summarizeGate),
  }
}

function evaluateTransition(entry, { rootDir = ROOT_DIR, oracle } = {}) {
  const artifacts = artifactStatus(rootDir, entry.artifacts)
  const blockerCount = currentEngineeringBlockerCount(oracle)
  const threshold = Number(entry.preheatTrigger?.remainingEngineeringBlockersAtMost ?? 1)
  const isCurrentMilestone = oracle.milestone === entry.fromMilestone
  const oracleSnapshot = buildOracleSnapshot(oracle)

  let state = 'not-current'
  let reason = `current milestone is ${oracle.milestone}, not ${entry.fromMilestone}`

  if (isCurrentMilestone) {
    if (oracle.engineeringCloseoutReady) {
      if (artifacts.ready) {
        state = 'cutover-ready'
        reason = `current milestone is engineering-ready and ${entry.toVersion} transition pack is complete`
      } else {
        state = 'cutover-blocked'
        reason = `current milestone is engineering-ready, but ${artifacts.missing.length} transition artifacts are still missing`
      }
    } else if (artifacts.ready) {
      state = 'preheated-awaiting-closeout'
      reason = `${entry.toVersion} transition pack is complete; waiting for ${entry.fromVersion} engineering closeout`
    } else if (blockerCount <= threshold) {
      state = 'preheat-due'
      reason = `${entry.fromVersion} has ${blockerCount} engineering blocker(s), at or below preheat threshold ${threshold}`
    } else {
      state = 'preheat-not-needed-yet'
      reason = `${entry.fromVersion} still has ${blockerCount} engineering blocker(s), above preheat threshold ${threshold}`
    }
  }

  return {
    id: entry.id,
    fromVersion: entry.fromVersion,
    toVersion: entry.toVersion,
    fromMilestone: entry.fromMilestone,
    toMilestone: entry.toMilestone,
    isCurrentMilestone,
    blockerCount,
    threshold,
    engineeringCloseoutReady: oracle.engineeringCloseoutReady,
    templateReady: artifacts.ready,
    missingArtifacts: artifacts.missing,
    artifacts: artifacts.entries,
    handoffContract: entry.handoffContract ?? {},
    preheatInput: isCurrentMilestone
      ? {
          blockerCount,
          threshold,
          blockerGatesOpen: oracleSnapshot.blockerGatesOpen,
          conditionalGatesOpen: oracleSnapshot.conditionalGatesOpen,
          userDecisionPending: oracleSnapshot.userDecisionPending,
        }
      : null,
    mustCloseBeforeCutover: entry.mustCloseBeforeCutover ?? [],
    allowedResiduals: entry.allowedResiduals ?? [],
    seedQueues: entry.seedQueues ?? { codex: [], glm: [] },
    state,
    reason,
  }
}

function buildVersionTransitionReport({ rootDir = ROOT_DIR, configPath = DEFAULT_CONFIG_PATH, oracle = null } = {}) {
  const resolvedOracle = oracle ?? buildMilestoneOracle(rootDir)
  const oracleSnapshot = buildOracleSnapshot(resolvedOracle)
  const config = loadTransitionConfig(rootDir, configPath)
  const transitions = config.transitions.map((entry) => evaluateTransition(entry, { rootDir, oracle: resolvedOracle }))
  const currentTransition = transitions.find((entry) => entry.isCurrentMilestone) ?? null
  return {
    currentMilestone: resolvedOracle.milestone,
    engineeringCloseoutReady: resolvedOracle.engineeringCloseoutReady,
    blockerCount: currentEngineeringBlockerCount(resolvedOracle),
    oracleSnapshot,
    currentTransitionId: currentTransition?.id ?? '',
    transitions,
  }
}

function printSummary(report) {
  console.log(`Current milestone: ${report.currentMilestone}`)
  console.log(`Engineering closeout ready: ${report.engineeringCloseoutReady ? 'yes' : 'no'}`)
  console.log(`Engineering blocker count: ${report.blockerCount}`)
  console.log(`Open blockers: ${report.oracleSnapshot?.blockerGatesOpen?.map((gate) => gate.gate).join(', ') || 'none'}`)
  console.log(
    `Open conditional gates: ${report.oracleSnapshot?.conditionalGatesOpen?.map((gate) => gate.gate).join(', ') || 'none'}`,
  )
  console.log(`Pending user gates: ${report.oracleSnapshot?.userDecisionPending?.map((gate) => gate.gate).join(', ') || 'none'}`)
  for (const transition of report.transitions) {
    const missing = transition.missingArtifacts.length > 0 ? ` | missing=${transition.missingArtifacts.length}` : ''
    console.log(`${transition.id}: ${transition.state} | ${transition.reason}${missing}`)
  }
}

function runCli() {
  const args = parseArgs(process.argv.slice(2))
  const report = buildVersionTransitionReport({ rootDir: args.rootDir, configPath: args.configPath })
  if (args.json) {
    console.log(JSON.stringify(report, null, 2))
    return
  }
  printSummary(report)
}

if (process.argv[1] && path.resolve(process.argv[1]) === __filename) {
  runCli()
}

export {
  artifactStatus,
  buildOracleSnapshot,
  buildVersionTransitionReport,
  evaluateTransition,
  loadTransitionConfig,
  summarizeGate,
}
