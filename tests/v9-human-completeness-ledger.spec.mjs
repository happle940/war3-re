/**
 * V9 Human Completeness Ledger Consistency Proof
 *
 * Proves that docs/HUMAN_RACE_CAPABILITY_BOARD.zh-CN.md no longer marks
 * implemented units/buildings/research as "missing". Cross-references
 * GameData.ts as the source of truth.
 *
 * This is a consistency proof, not gameplay implementation.
 */
import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const BOARD_PATH = path.join(__dirname, '..', 'docs', 'HUMAN_RACE_CAPABILITY_BOARD.zh-CN.md')
const GAME_DATA_PATH = path.join(__dirname, '..', 'src', 'game', 'GameData.ts')

// ==================== Helpers ====================

const boardText = fs.readFileSync(BOARD_PATH, 'utf8')
const gameDataText = fs.readFileSync(GAME_DATA_PATH, 'utf8')

function extractRecordKeys(source, exportName) {
  const start = source.indexOf(`export const ${exportName}`)
  assert.ok(start >= 0, `${exportName} export must exist`)
  const bodyStart = source.indexOf('{', start)
  assert.ok(bodyStart >= 0, `${exportName} body must start`)

  let depth = 0
  let bodyEnd = -1
  for (let index = bodyStart; index < source.length; index += 1) {
    const char = source[index]
    if (char === '{') depth += 1
    if (char === '}') depth -= 1
    if (depth === 0) {
      bodyEnd = index
      break
    }
  }

  assert.ok(bodyEnd > bodyStart, `${exportName} body must end`)
  const body = source.slice(bodyStart + 1, bodyEnd)
  return [...body.matchAll(/^\s{2}([a-zA-Z0-9_]+):\s*\{/gm)].map((match) => match[1])
}

function extractArrayLiteral(source, exportName) {
  const match = source.match(new RegExp(`export const ${exportName}\\s*=\\s*\\[([^\\]]+)\\]`))
  assert.ok(match, `${exportName} array must exist`)
  return [...match[1].matchAll(/'([^']+)'/g)].map((item) => item[1])
}

function assertSourceIncludes(fragment, message) {
  assert.ok(gameDataText.includes(fragment), message)
}

function assertNotMarkedMissing(board, item) {
  const row = board
    .split('\n')
    .find((line) => line.toLowerCase().includes(item.toLowerCase()) && line.trim().startsWith('|'))
  assert.ok(row, `${item} must appear in the board`)
  assert.ok(!/\|\s*缺失(?:，| |$)/.test(row), `${item} should not be marked as missing: ${row}`)
}

const unitKeys = extractRecordKeys(gameDataText, 'UNITS')
const buildingKeys = extractRecordKeys(gameDataText, 'BUILDINGS')
const buildMenu = extractArrayLiteral(gameDataText, 'PEASANT_BUILD_MENU')

// ==================== Tests ====================

test('proof-1: GameData.ts objects match board "当前已有" classification', () => {
  // Units that exist in GameData.ts
  assert.ok(unitKeys.includes('worker'), 'worker must exist')
  assert.ok(unitKeys.includes('footman'), 'footman must exist')
  assert.ok(unitKeys.includes('rifleman'), 'rifleman must exist')
  assert.ok(unitKeys.includes('mortar_team'), 'mortar_team must exist')
  assert.ok(unitKeys.includes('priest'), 'priest must exist')

  // Buildings that exist
  assert.ok(buildingKeys.includes('townhall'), 'townhall must exist')
  assert.ok(buildingKeys.includes('barracks'), 'barracks must exist')
  assert.ok(buildingKeys.includes('farm'), 'farm must exist')
  assert.ok(buildingKeys.includes('tower'), 'tower must exist')
  assert.ok(buildingKeys.includes('goldmine'), 'goldmine must exist')
  assert.ok(buildingKeys.includes('blacksmith'), 'blacksmith must exist')
  assert.ok(buildingKeys.includes('lumber_mill'), 'lumber_mill must exist')
  assert.ok(buildingKeys.includes('workshop'), 'workshop must exist')
  assert.ok(buildingKeys.includes('arcane_sanctum'), 'arcane_sanctum must exist')

  // Board §1 must list these as "已有"
  const section1 = boardText.substring(
    boardText.indexOf('当前代码里的可玩人族内容'),
    boardText.indexOf('因此：V9'),
  )
  for (const unit of ['worker', 'footman', 'rifleman', 'mortar_team', 'priest']) {
    assert.ok(section1.includes(unit), `§1 must list ${unit} as 已有`)
  }
  for (const building of ['blacksmith', 'lumber_mill', 'workshop', 'arcane_sanctum']) {
    assert.ok(section1.includes(building), `§1 must list ${building} as 已有`)
  }
})

test('proof-2: board does NOT mark implemented items as missing', () => {
  // These items are implemented but the old board called them "缺失"
  const implementedItems = [
    'rifleman',
    'blacksmith',
    'lumber_mill',
    'workshop',
    'mortar_team',
    'arcane_sanctum',
    'priest',
    'long_rifles',
  ]

  for (const item of implementedItems) {
    assertNotMarkedMissing(boardText, item)
  }
})

test('proof-3: board still marks truly missing items as missing', () => {
  const stillMissingRows = [
    ['Militia', /Militia[\s\S]*?\|\s*缺失\s*\|/],
    ['Back to Work', /Back to Work/],
    ['Defend', /Defend[\s\S]*?未成系统/],
    ['Knight', /Knight[\s\S]*?\|\s*缺失/],
    ['Sorceress', /Sorceress[\s\S]*?\|\s*缺失/],
    ['Spell Breaker', /Spell Breaker[\s\S]*?\|\s*缺失/],
    ['Flying Machine', /Flying Machine[\s\S]*?\|\s*缺失/],
    ['Siege Engine', /Siege Engine[\s\S]*?\|\s*缺失/],
    ['Gryphon', /Gryphon[\s\S]*?\|\s*缺失/],
    ['Dragonhawk', /Dragonhawk[\s\S]*?\|\s*缺失/],
    ['Altar', /Altar of Kings[\s\S]*?\|\s*缺失/],
    ['Arcane Vault', /Arcane Vault[\s\S]*?\|\s*缺失/],
  ]

  for (const [item, pattern] of stillMissingRows) {
    assert.match(boardText, pattern, `board must still mark ${item} as missing/gap`)
  }
})

test('proof-4: PEASANT_BUILD_MENU and BUILDINGS.trains match board claims', () => {
  // Board claims PEASANT_BUILD_MENU includes these
  assert.ok(buildMenu.includes('blacksmith'),
    'PEASANT_BUILD_MENU must include blacksmith')
  assert.ok(buildMenu.includes('lumber_mill'),
    'PEASANT_BUILD_MENU must include lumber_mill')
  assert.ok(buildMenu.includes('tower'),
    'PEASANT_BUILD_MENU must include tower')
  assert.ok(buildMenu.includes('workshop'),
    'PEASANT_BUILD_MENU must include workshop')
  assert.ok(buildMenu.includes('arcane_sanctum'),
    'PEASANT_BUILD_MENU must include arcane_sanctum')

  // Board claims Barracks trains rifleman
  assertSourceIncludes("trains: ['footman', 'rifleman']", 'Barracks must train rifleman')
  // Board claims Workshop trains mortar_team
  assertSourceIncludes("trains: ['mortar_team']", 'Workshop must train mortar_team')
  // Board claims Arcane Sanctum trains priest
  assertSourceIncludes("trains: ['priest']", 'Arcane Sanctum must train priest')
  // Board claims Tower requires lumber_mill
  assertSourceIncludes("techPrereq: 'lumber_mill'", 'Tower must require lumber_mill')
})

test('proof-5: task output follows HN1-HN4 sequence from expansion packet', () => {
  // Read the expansion packet to verify HN1-HN4 ordering exists
  const packetPath = path.join(__dirname, '..', 'docs', 'V9_HUMAN_NUMERIC_EXPANSION_PACKET.zh-CN.md')
  const packetText = fs.readFileSync(packetPath, 'utf8')

  // HN1 must come before HN2
  const hn1Index = packetText.indexOf('HN1')
  const hn2Index = packetText.indexOf('HN2')
  const hn3Index = packetText.indexOf('HN3')
  const hn4Index = packetText.indexOf('HN4')

  assert.ok(hn1Index > 0, 'expansion packet must define HN1')
  assert.ok(hn2Index > hn1Index, 'HN2 must come after HN1')
  assert.ok(hn3Index > hn2Index, 'HN3 must come after HN2')
  assert.ok(hn4Index > hn3Index, 'HN4 must come after HN3')

  // Auto-refill rule: must limit refill to 1 GLM + 1 Codex
  assert.ok(packetText.includes('自动补货'), 'expansion packet must define auto-refill rules')
  assert.ok(packetText.includes('1 个 GLM'), 'refill must limit to 1 GLM task')
  assert.ok(packetText.includes('1 个 Codex'), 'refill must limit to 1 Codex task')
})
