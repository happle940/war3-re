#!/usr/bin/env node

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const ROOT_DIR = path.resolve(__dirname, '..')

const DEFAULT_CONFIG_PATH = 'docs/VERSION_TRANSITIONS.json'
const DEFAULT_STATE_PATH = 'docs/VERSION_RUNTIME_STATE.json'
const LEGACY_V2_REMAINING_GATES_PATH = 'docs/V2_PAGE_PRODUCT_REMAINING_GATES.zh-CN.md'
const LEGACY_V2_EVIDENCE_LEDGER_PATH = 'docs/V2_PAGE_PRODUCT_EVIDENCE_LEDGER.zh-CN.md'
const LEGACY_V2_VERSION = 'V2'
const LEGACY_V2_MILESTONE = 'V2 credible page-product vertical slice'

function readText(rootDir, relativePath) {
  return fs.readFileSync(path.join(rootDir, relativePath), 'utf8').replaceAll('\r\n', '\n')
}

function readJson(rootDir, relativePath) {
  return JSON.parse(readText(rootDir, relativePath))
}

function fileExists(rootDir, relativePath) {
  return fs.existsSync(path.join(rootDir, relativePath))
}

function loadTransitionConfig(rootDir = ROOT_DIR, configPath = DEFAULT_CONFIG_PATH) {
  if (!fileExists(rootDir, configPath)) {
    return { version: 1, transitions: [] }
  }
  const config = readJson(rootDir, configPath)
  if (!Array.isArray(config.transitions)) {
    throw new Error(`Invalid transition config: missing transitions array in ${configPath}`)
  }
  return config
}

function extractLegacyCurrentMilestone(rootDir = ROOT_DIR) {
  if (!fileExists(rootDir, LEGACY_V2_REMAINING_GATES_PATH)) {
    return LEGACY_V2_MILESTONE
  }
  const text = readText(rootDir, LEGACY_V2_REMAINING_GATES_PATH)
  const match = text.match(/当前真实里程碑是：\s*```text\s*([\s\S]*?)```/)
  return match ? match[1].trim() : LEGACY_V2_MILESTONE
}

function inferVersionFromMilestone(config, milestone) {
  if (milestone === LEGACY_V2_MILESTONE) return LEGACY_V2_VERSION
  const directTo = config.transitions.find((entry) => entry.toMilestone === milestone)
  if (directTo) return directTo.toVersion
  const directFrom = config.transitions.find((entry) => entry.fromMilestone === milestone)
  if (directFrom) return directFrom.fromVersion
  return ''
}

function buildLegacyRuntimeState(rootDir = ROOT_DIR, configPath = DEFAULT_CONFIG_PATH) {
  const config = loadTransitionConfig(rootDir, configPath)
  const currentMilestone = extractLegacyCurrentMilestone(rootDir)
  const currentVersion = inferVersionFromMilestone(config, currentMilestone) || LEGACY_V2_VERSION
  return {
    version: 1,
    currentVersion,
    currentMilestone,
    activatedByTransitionId: null,
    activatedAt: null,
    activationHistory: [],
  }
}

function normalizeActivationHistory(entries) {
  return Array.isArray(entries)
    ? entries
        .filter((entry) => entry && typeof entry === 'object' && entry.transitionId)
        .map((entry) => ({
          transitionId: String(entry.transitionId),
          fromVersion: String(entry.fromVersion ?? ''),
          toVersion: String(entry.toVersion ?? ''),
          fromMilestone: String(entry.fromMilestone ?? ''),
          toMilestone: String(entry.toMilestone ?? ''),
          activatedAt: String(entry.activatedAt ?? ''),
        }))
    : []
}

function readVersionRuntimeState(rootDir = ROOT_DIR, { configPath = DEFAULT_CONFIG_PATH, statePath = DEFAULT_STATE_PATH } = {}) {
  const legacy = buildLegacyRuntimeState(rootDir, configPath)
  if (!fileExists(rootDir, statePath)) {
    return legacy
  }

  try {
    const parsed = readJson(rootDir, statePath)
    return {
      version: Number(parsed.version ?? 1),
      currentVersion: String(parsed.currentVersion ?? legacy.currentVersion),
      currentMilestone: String(parsed.currentMilestone ?? legacy.currentMilestone),
      activatedByTransitionId: parsed.activatedByTransitionId ? String(parsed.activatedByTransitionId) : null,
      activatedAt: parsed.activatedAt ? String(parsed.activatedAt) : null,
      activationHistory: normalizeActivationHistory(parsed.activationHistory),
    }
  } catch {
    return legacy
  }
}

function writeVersionRuntimeState(rootDir = ROOT_DIR, state, { statePath = DEFAULT_STATE_PATH } = {}) {
  const nextState = {
    version: Number(state?.version ?? 1),
    currentVersion: String(state?.currentVersion ?? ''),
    currentMilestone: String(state?.currentMilestone ?? ''),
    activatedByTransitionId: state?.activatedByTransitionId ? String(state.activatedByTransitionId) : null,
    activatedAt: state?.activatedAt ? String(state.activatedAt) : null,
    activationHistory: normalizeActivationHistory(state?.activationHistory),
  }
  const fullPath = path.join(rootDir, statePath)
  fs.mkdirSync(path.dirname(fullPath), { recursive: true })
  fs.writeFileSync(fullPath, `${JSON.stringify(nextState, null, 2)}\n`, 'utf8')
  return nextState
}

function resolveMilestoneDocs(rootDir = ROOT_DIR, { configPath = DEFAULT_CONFIG_PATH, statePath = DEFAULT_STATE_PATH } = {}) {
  const config = loadTransitionConfig(rootDir, configPath)
  const runtimeState = readVersionRuntimeState(rootDir, { configPath, statePath })
  const currentMilestone = runtimeState.currentMilestone || extractLegacyCurrentMilestone(rootDir)
  const currentVersion = runtimeState.currentVersion || inferVersionFromMilestone(config, currentMilestone) || LEGACY_V2_VERSION

  if (currentVersion === LEGACY_V2_VERSION || currentMilestone === LEGACY_V2_MILESTONE) {
    return {
      config,
      runtimeState,
      currentVersion: LEGACY_V2_VERSION,
      currentMilestone: LEGACY_V2_MILESTONE,
      remainingGatesPath: LEGACY_V2_REMAINING_GATES_PATH,
      evidenceLedgerPath: LEGACY_V2_EVIDENCE_LEDGER_PATH,
      source: 'legacy-v2',
    }
  }

  const sourceTransition = config.transitions.find((entry) => entry.toMilestone === currentMilestone)
  if (!sourceTransition) {
    throw new Error(`No transition artifact set found for active milestone ${currentMilestone}`)
  }

  return {
    config,
    runtimeState,
    currentVersion,
    currentMilestone,
    remainingGatesPath: sourceTransition.artifacts?.remainingGates,
    evidenceLedgerPath: sourceTransition.artifacts?.evidenceLedger,
    activatedByTransitionId: sourceTransition.id,
    source: 'transition-pack',
  }
}

export {
  DEFAULT_CONFIG_PATH,
  DEFAULT_STATE_PATH,
  LEGACY_V2_EVIDENCE_LEDGER_PATH,
  LEGACY_V2_MILESTONE,
  LEGACY_V2_REMAINING_GATES_PATH,
  LEGACY_V2_VERSION,
  buildLegacyRuntimeState,
  extractLegacyCurrentMilestone,
  inferVersionFromMilestone,
  loadTransitionConfig,
  readVersionRuntimeState,
  resolveMilestoneDocs,
  writeVersionRuntimeState,
}
