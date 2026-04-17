/**
 * V9 HN7-CLOSE12 Leather Armor closure inventory.
 *
 * Static proof that SRC8, MODEL9, MODEL10, DATA8, and IMPL11 form one closed
 * Leather Armor chain without opening heroes, air, items, assets, AI strategy,
 * or additional armor-type migration.
 */
import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'
import { test } from 'node:test'

const gameData = readFileSync(new URL('../src/game/GameData.ts', import.meta.url), 'utf8')
const game = readFileSync(new URL('../src/game/Game.ts', import.meta.url), 'utf8')
const styles = readFileSync(new URL('../src/styles.css', import.meta.url), 'utf8')
const closure = readFileSync(
  new URL('../docs/V9_HN7_LEATHER_ARMOR_CLOSURE_INVENTORY.zh-CN.md', import.meta.url),
  'utf8',
)
const sourceBoundary = readFileSync(
  new URL('../docs/V9_HN7_LEATHER_ARMOR_SOURCE_AND_TYPE_BOUNDARY.zh-CN.md', import.meta.url),
  'utf8',
)
const mediumContract = readFileSync(
  new URL('../docs/V9_HN7_MEDIUM_ARMOR_MIGRATION_CONTRACT.zh-CN.md', import.meta.url),
  'utf8',
)
const mortarDecision = readFileSync(
  new URL('../docs/V9_HN7_MORTAR_TEAM_ARMOR_PARITY_DECISION.zh-CN.md', import.meta.url),
  'utf8',
)
const expansionPacket = readFileSync(
  new URL('../docs/V9_HUMAN_NUMERIC_EXPANSION_PACKET.zh-CN.md', import.meta.url),
  'utf8',
)
const evidenceLedger = readFileSync(
  new URL('../docs/V9_MAINTENANCE_EXPANSION_EVIDENCE_LEDGER.zh-CN.md', import.meta.url),
  'utf8',
)
const remainingGates = readFileSync(
  new URL('../docs/V9_MAINTENANCE_EXPANSION_REMAINING_GATES.zh-CN.md', import.meta.url),
  'utf8',
)

function researchBlock(key) {
  const match = gameData.match(new RegExp(`${key}:\\s*\\{[\\s\\S]*?\\n\\s{2}\\},`))
  return match?.[0] ?? ''
}

function blacksmithBlock() {
  return gameData.match(/blacksmith:\s*\{[\s\S]*?\n\s{2}\},/)?.[0] ?? ''
}

function unitBlock(key) {
  return gameData.match(new RegExp(`\\n\\s{2}${key}:\\s*\\{[\\s\\S]*?\\n\\s{2}\\},`))?.[0] ?? ''
}

// ── Closure document shape ───────────────────────────────

test('LA-CLOSE12-1: closure document exists and names the full task chain', () => {
  assert.ok(closure.includes('SRC8 → MODEL9 → MODEL10 → DATA8 → IMPL11'))
  for (const task of ['Task 194', 'Task 195', 'Task 196', 'Task 197', 'Task 198']) {
    assert.ok(closure.includes(task), `${task} must be in closure inventory`)
  }
})

test('LA-CLOSE12-2: closure document records accepted proof counts', () => {
  for (const expected of ['18/18', '31/31', '67/67', 'runtime 4/4', '14/14']) {
    assert.ok(closure.includes(expected), `${expected} must be recorded`)
  }
})

// ── SRC8 source boundary ─────────────────────────────────

test('LA-CLOSE12-3: SRC8 source values are preserved in source and closure docs', () => {
  for (const expected of [
    'Studded Leather Armor',
    'Reinforced Leather Armor',
    'Dragonhide Armor',
    '100',
    '150',
    '200',
    'blacksmith',
    'keep',
    'castle',
  ]) {
    assert.ok(sourceBoundary.includes(expected), `source boundary must include ${expected}`)
  }
  for (const key of ['studded_leather_armor', 'reinforced_leather_armor', 'dragonhide_armor']) {
    assert.ok(closure.includes(key), `closure must map source names to ${key}`)
  }
})

test('LA-CLOSE12-4: source boundary records the historical pre-migration armor gap', () => {
  assert.ok(sourceBoundary.includes('迁移前'), 'source boundary must keep pre-migration wording')
  assert.ok(sourceBoundary.includes('Unarmored'), 'source boundary must record old Unarmored state')
  assert.ok(sourceBoundary.includes('Medium'), 'source boundary must record Medium gap')
})

// ── MODEL9/MODEL10 armor-type decisions ──────────────────

test('LA-CLOSE12-5: rifleman is the only Medium migration target in current data', () => {
  const rifleman = unitBlock('rifleman')
  assert.ok(rifleman.includes('armorType: ArmorType.Medium'))
  assert.ok(mediumContract.includes('rifleman'), 'MODEL9 must name rifleman')
  assert.ok(mediumContract.includes('默认只迁移 `rifleman`'), 'MODEL9 must keep migration narrow')

  for (const unit of ['worker', 'footman', 'militia', 'knight', 'mortar_team', 'priest', 'sorceress']) {
    assert.ok(!unitBlock(unit).includes('armorType: ArmorType.Medium'), `${unit} must not be Medium`)
  }
})

test('LA-CLOSE12-6: mortar_team stays Unarmored by explicit decision', () => {
  const mortar = unitBlock('mortar_team')
  assert.ok(mortar.includes('armorType: ArmorType.Unarmored'))
  assert.ok(mortarDecision.includes('保持 Unarmored') || mortarDecision.includes('Keep Unarmored'))
  assert.ok(mortarDecision.includes('War3') && mortarDecision.includes('Heavy'))
  assert.ok(closure.includes('不把 Mortar Team 改成 Heavy'))
})

test('LA-CLOSE12-7: Leather Armor remains targetUnitType-based, not armorType-based', () => {
  for (const key of ['studded_leather_armor', 'reinforced_leather_armor', 'dragonhide_armor']) {
    const block = researchBlock(key)
    assert.ok(block.includes("targetUnitType: 'rifleman', stat: 'armor', value: 2"))
    assert.ok(block.includes("targetUnitType: 'mortar_team', stat: 'armor', value: 2"))
    assert.ok(!block.includes('armorType'), `${key} must not use armorType predicates`)
  }
  assert.ok(mortarDecision.includes('targetUnitType'), 'MODEL10 must explain targetUnitType coverage')
  assert.ok(closure.includes('targetUnitType'), 'closure must explain targetUnitType coverage')
})

// ── DATA8 data seed ──────────────────────────────────────

test('LA-CLOSE12-8: DATA8 has all three research rows with source values', () => {
  const expected = [
    ['studded_leather_armor', 'cost: { gold: 100, lumber: 100 }', 'researchTime: 60'],
    ['reinforced_leather_armor', 'cost: { gold: 150, lumber: 175 }', 'researchTime: 75'],
    ['dragonhide_armor', 'cost: { gold: 200, lumber: 250 }', 'researchTime: 90'],
  ]
  for (const [key, cost, time] of expected) {
    const block = researchBlock(key)
    assert.ok(block.includes(`key: '${key}'`), `${key} must exist`)
    assert.ok(block.includes(cost), `${key} cost must match source`)
    assert.ok(block.includes(time), `${key} time must match source`)
  }
})

test('LA-CLOSE12-9: DATA8 prerequisite chain is encoded L1 -> L2 -> L3', () => {
  const studded = researchBlock('studded_leather_armor')
  const reinforced = researchBlock('reinforced_leather_armor')
  const dragonhide = researchBlock('dragonhide_armor')
  assert.ok(studded.includes("requiresBuilding: 'blacksmith'"))
  assert.ok(!studded.includes('prerequisiteResearch'))
  assert.ok(reinforced.includes("requiresBuilding: 'keep'"))
  assert.ok(reinforced.includes("prerequisiteResearch: 'studded_leather_armor'"))
  assert.ok(dragonhide.includes("requiresBuilding: 'castle'"))
  assert.ok(dragonhide.includes("prerequisiteResearch: 'reinforced_leather_armor'"))
})

test('LA-CLOSE12-10: Blacksmith exposes 13 current research buttons including Leather Armor', () => {
  const blacksmith = blacksmithBlock()
  const researchesMatch = blacksmith.match(/researches:\s*\[([\s\S]*?)\]/)
  assert.ok(researchesMatch, 'Blacksmith researches array must exist')
  const researchKeys = [...researchesMatch[1].matchAll(/'([^']+)'/g)].map(match => match[1])
  assert.equal(researchKeys.length, 13)
  for (const key of ['studded_leather_armor', 'reinforced_leather_armor', 'dragonhide_armor']) {
    assert.ok(researchKeys.includes(key), `Blacksmith must expose ${key}`)
  }
})

// ── IMPL11 runtime proof ─────────────────────────────────

test('LA-CLOSE12-11: runtime smoke file exists and covers Leather Armor behavior', () => {
  const runtimePath = new URL('../tests/v9-hn7-leather-armor-runtime.spec.ts', import.meta.url)
  assert.ok(existsSync(runtimePath), 'runtime smoke file must exist')
  const runtime = readFileSync(runtimePath, 'utf8')
  for (const expected of [
    '镶钉皮甲',
    '强化皮甲',
    '龙皮甲',
    'cumulative +6',
    'newRifleman',
    'newMortar',
    'does not affect non-target units',
  ]) {
    assert.ok(runtime.includes(expected), `runtime must cover ${expected}`)
  }
})

test('LA-CLOSE12-12: command-card capacity is 16 slots / 4x4 grid', () => {
  assert.ok(game.includes('const COMMAND_CARD_SLOT_COUNT = 16'))
  assert.ok(game.includes('Math.min(buttons.length, COMMAND_CARD_SLOT_COUNT)'))
  assert.ok(styles.includes('grid-template-columns: repeat(4, 62px)'))
  assert.ok(styles.includes('grid-template-rows: repeat(4, 44px)'))
  assert.ok(closure.includes('16 格') || closure.includes('16 fixed'))
  assert.ok(closure.includes('13 个研究按钮'))
})

// ── Boundary / no special cases ──────────────────────────

test('LA-CLOSE12-13: Game.ts has no Leather Armor special-case runtime code', () => {
  for (const key of ['studded_leather_armor', 'reinforced_leather_armor', 'dragonhide_armor']) {
    assert.ok(!game.includes(key), `${key} must remain data-driven`)
  }
  assert.ok(game.includes('applyFlatDeltaEffect'), 'generic research effect applier must be present')
})

test('LA-CLOSE12-14: Leather Armor does not target unrelated units or buildings', () => {
  const leatherBlocks = ['studded_leather_armor', 'reinforced_leather_armor', 'dragonhide_armor']
    .map(key => researchBlock(key))
    .join('\n')
  for (const forbidden of [
    'footman',
    'militia',
    'knight',
    'priest',
    'sorceress',
    'worker',
    'tower',
    'gryphon',
    'dragonhawk',
    'flying_machine',
  ]) {
    assert.ok(!leatherBlocks.includes(`targetUnitType: '${forbidden}'`), `${forbidden} must not be targeted`)
  }
})

test('LA-CLOSE12-15: closure keeps heroes, air, items, assets, AI strategy, and Mortar Heavy closed', () => {
  for (const expected of [
    '不新增英雄',
    '不新增空军',
    '不新增物品',
    '不新增美术素材',
    '不新增 AI Castle/Knight 策略',
    '不把 Mortar Team 改成 Heavy',
  ]) {
    assert.ok(closure.includes(expected), `${expected} must remain forbidden`)
  }
})

// ── Docs alignment ───────────────────────────────────────

test('LA-CLOSE12-16: expansion packet and evidence ledger record IMPL11 acceptance', () => {
  assert.ok(expansionPacket.includes('Task198 / HN7-IMPL11'), 'expansion packet must record Task198')
  assert.ok(evidenceLedger.includes('HN7-IMPL11 accepted'), 'evidence ledger must accept IMPL11')
  assert.ok(evidenceLedger.includes('Leather Armor data is now proven in runtime'))
})

test('LA-CLOSE12-17: remaining gates moved from runtime smoke to closure inventory', () => {
  assert.ok(remainingGates.includes('HN7-CLOSE12 Leather Armor closure'))
  assert.ok(remainingGates.includes('HN7-CLOSE13 Human Blacksmith branch global closure are accepted'))
  assert.ok(remainingGates.includes('Human Blacksmith branch global closure'))
  assert.ok(!remainingGates.includes('Next adjacent task is Leather Armor runtime smoke'))
})

test('LA-CLOSE12-18: closure points to safe next work without claiming complete Human', () => {
  for (const expected of ['HN7/Human global closure', 'AI Castle/Knight strategy']) {
    assert.ok(closure.includes(expected), `${expected} must be a safe next option`)
  }
  assert.ok(!closure.includes('完整 Human 已完成'))
  assert.ok(!closure.includes('全部 Human 已完成'))
})
