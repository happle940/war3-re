/**
 * V9 HN7-CLOSE13 Human Blacksmith/Barracks branch global closure.
 *
 * Static proof that the accumulated HN7 upgrade work is a coherent branch
 * closure, not a claim that all Human / heroes / air / items / assets are done.
 */
import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'
import { test } from 'node:test'

const gameData = readFileSync(new URL('../src/game/GameData.ts', import.meta.url), 'utf8')
const game = readFileSync(new URL('../src/game/Game.ts', import.meta.url), 'utf8')
const styles = readFileSync(new URL('../src/styles.css', import.meta.url), 'utf8')
const simpleAI = readFileSync(new URL('../src/game/SimpleAI.ts', import.meta.url), 'utf8')
const closure = readFileSync(
  new URL('../docs/V9_HN7_BLACKSMITH_BRANCH_GLOBAL_CLOSURE.zh-CN.md', import.meta.url),
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
const laneStatus = readFileSync(
  new URL('../docs/DUAL_LANE_STATUS.zh-CN.md', import.meta.url),
  'utf8',
)

function researchBlock(key) {
  const match = gameData.match(new RegExp(`${key}:\\s*\\{[\\s\\S]*?\\n\\s{2}\\},`))
  return match?.[0] ?? ''
}

function buildingBlock(key) {
  return gameData.match(new RegExp(`\\n\\s{2}${key}:\\s*\\{[\\s\\S]*?\\n\\s{2}\\},`))?.[0] ?? ''
}

const blacksmithResearches = [
  'long_rifles',
  'iron_forged_swords',
  'steel_forged_swords',
  'mithril_forged_swords',
  'black_gunpowder',
  'refined_gunpowder',
  'imbued_gunpowder',
  'iron_plating',
  'steel_plating',
  'mithril_plating',
  'studded_leather_armor',
  'reinforced_leather_armor',
  'dragonhide_armor',
]

// ── Document shape ───────────────────────────────────────

test('BS-GLOBAL-1: global closure document names all HN7 subchains', () => {
  for (const expected of [
    '近战武器三段',
    '远程火药三段',
    'Plating 三段',
    'Long Rifles',
    'Animal War Training',
    'Blacksmith 升级 AI',
    'Leather Armor 三段',
  ]) {
    assert.ok(closure.includes(expected), `${expected} must be in global closure`)
  }
})

test('BS-GLOBAL-2: global closure does not claim complete Human', () => {
  for (const forbidden of ['完整 Human 已完成', '全部 Human 已完成', '人族全部完成']) {
    assert.ok(!closure.includes(forbidden), `${forbidden} must not be claimed`)
  }
  assert.ok(closure.includes('未打开'), 'closure must include unopened scope')
})

// ── Blacksmith / Barracks data surface ────────────────────

test('BS-GLOBAL-3: Blacksmith exposes exactly 13 current researches', () => {
  const blacksmith = buildingBlock('blacksmith')
  const researchesMatch = blacksmith.match(/researches:\s*\[([\s\S]*?)\]/)
  assert.ok(researchesMatch, 'Blacksmith researches array must exist')
  const keys = [...researchesMatch[1].matchAll(/'([^']+)'/g)].map(match => match[1])
  assert.deepEqual(keys, blacksmithResearches)
})

test('BS-GLOBAL-4: Barracks exposes Animal War Training as its only current research', () => {
  const barracks = buildingBlock('barracks')
  assert.ok(barracks.includes("researches: ['animal_war_training']"))
})

test('BS-GLOBAL-5: Long Rifles remains a single Rifleman range research', () => {
  const block = researchBlock('long_rifles')
  assert.ok(block.includes('cost: { gold: 175, lumber: 50 }'))
  assert.ok(block.includes('researchTime: 20'))
  assert.ok(block.includes("targetUnitType: 'rifleman', stat: 'attackRange', value: 1.5"))
})

// ── Three-level chains ────────────────────────────────────

test('BS-GLOBAL-6: melee chain values, prerequisites, and targets are encoded', () => {
  const expected = [
    ['iron_forged_swords', 'cost: { gold: 100, lumber: 50 }', 'researchTime: 60', null],
    ['steel_forged_swords', 'cost: { gold: 175, lumber: 175 }', 'researchTime: 75', "prerequisiteResearch: 'iron_forged_swords'"],
    ['mithril_forged_swords', 'cost: { gold: 250, lumber: 300 }', 'researchTime: 90', "prerequisiteResearch: 'steel_forged_swords'"],
  ]
  for (const [key, cost, time, prereq] of expected) {
    const block = researchBlock(key)
    assert.ok(block.includes(cost), `${key} cost`)
    assert.ok(block.includes(time), `${key} time`)
    if (prereq) assert.ok(block.includes(prereq), `${key} prereq`)
    for (const unit of ['footman', 'militia', 'knight']) {
      assert.ok(block.includes(`targetUnitType: '${unit}', stat: 'attackDamage', value: 1`))
    }
  }
})

test('BS-GLOBAL-7: ranged chain values, prerequisites, and targets are encoded', () => {
  const expected = [
    ['black_gunpowder', 'cost: { gold: 100, lumber: 50 }', 'researchTime: 60', null],
    ['refined_gunpowder', 'cost: { gold: 175, lumber: 175 }', 'researchTime: 75', "prerequisiteResearch: 'black_gunpowder'"],
    ['imbued_gunpowder', 'cost: { gold: 250, lumber: 300 }', 'researchTime: 90', "prerequisiteResearch: 'refined_gunpowder'"],
  ]
  for (const [key, cost, time, prereq] of expected) {
    const block = researchBlock(key)
    assert.ok(block.includes(cost), `${key} cost`)
    assert.ok(block.includes(time), `${key} time`)
    if (prereq) assert.ok(block.includes(prereq), `${key} prereq`)
    for (const unit of ['rifleman', 'mortar_team']) {
      assert.ok(block.includes(`targetUnitType: '${unit}', stat: 'attackDamage', value: 1`))
    }
  }
})

test('BS-GLOBAL-8: Plating chain values, prerequisites, and targets are encoded', () => {
  const expected = [
    ['iron_plating', 'cost: { gold: 125, lumber: 75 }', 'researchTime: 60', null],
    ['steel_plating', 'cost: { gold: 150, lumber: 175 }', 'researchTime: 75', "prerequisiteResearch: 'iron_plating'"],
    ['mithril_plating', 'cost: { gold: 175, lumber: 275 }', 'researchTime: 90', "prerequisiteResearch: 'steel_plating'"],
  ]
  for (const [key, cost, time, prereq] of expected) {
    const block = researchBlock(key)
    assert.ok(block.includes(cost), `${key} cost`)
    assert.ok(block.includes(time), `${key} time`)
    if (prereq) assert.ok(block.includes(prereq), `${key} prereq`)
    for (const unit of ['footman', 'militia', 'knight']) {
      assert.ok(block.includes(`targetUnitType: '${unit}', stat: 'armor', value: 2`))
    }
  }
})

test('BS-GLOBAL-9: Leather Armor chain values, prerequisites, and targets are encoded', () => {
  const expected = [
    ['studded_leather_armor', 'cost: { gold: 100, lumber: 100 }', 'researchTime: 60', null],
    ['reinforced_leather_armor', 'cost: { gold: 150, lumber: 175 }', 'researchTime: 75', "prerequisiteResearch: 'studded_leather_armor'"],
    ['dragonhide_armor', 'cost: { gold: 200, lumber: 250 }', 'researchTime: 90', "prerequisiteResearch: 'reinforced_leather_armor'"],
  ]
  for (const [key, cost, time, prereq] of expected) {
    const block = researchBlock(key)
    assert.ok(block.includes(cost), `${key} cost`)
    assert.ok(block.includes(time), `${key} time`)
    if (prereq) assert.ok(block.includes(prereq), `${key} prereq`)
    for (const unit of ['rifleman', 'mortar_team']) {
      assert.ok(block.includes(`targetUnitType: '${unit}', stat: 'armor', value: 2`))
    }
  }
})

test('BS-GLOBAL-10: L2 chains require Keep and L3 chains require Castle', () => {
  for (const key of [
    'steel_forged_swords',
    'refined_gunpowder',
    'steel_plating',
    'reinforced_leather_armor',
  ]) {
    assert.ok(researchBlock(key).includes("requiresBuilding: 'keep'"), `${key} must require Keep`)
  }
  for (const key of [
    'mithril_forged_swords',
    'imbued_gunpowder',
    'mithril_plating',
    'dragonhide_armor',
  ]) {
    assert.ok(researchBlock(key).includes("requiresBuilding: 'castle'"), `${key} must require Castle`)
  }
})

test('BS-GLOBAL-11: AWT remains single-level Barracks research with multi-building prereq', () => {
  const block = researchBlock('animal_war_training')
  assert.ok(block.includes('cost: { gold: 125, lumber: 125 }'))
  assert.ok(block.includes('researchTime: 40'))
  assert.ok(block.includes("requiresBuilding: 'barracks'"))
  assert.ok(block.includes("'castle', 'lumber_mill', 'blacksmith'"))
  assert.ok(block.includes("targetUnitType: 'knight', stat: 'maxHp', value: 100"))
})

// ── Shared model capabilities ────────────────────────────

test('BS-GLOBAL-12: research model supports ordered and multi-building prerequisites', () => {
  assert.ok(gameData.includes('prerequisiteResearch?: string'))
  assert.ok(gameData.includes('requiresBuildings?: string[]'))
  assert.ok(game.includes('def.prerequisiteResearch'))
  assert.ok(game.includes('def.requiresBuildings'))
})

test('BS-GLOBAL-13: research effect model supports maxHp for AWT', () => {
  assert.ok(gameData.includes("'attackRange' | 'attackDamage' | 'armor' | 'maxHp'"))
  assert.ok(game.includes("case 'maxHp'") || game.includes("effect.stat === 'maxHp'"))
})

test('BS-GLOBAL-14: command card capacity is 16 slots / 4x4 grid', () => {
  assert.ok(game.includes('const COMMAND_CARD_SLOT_COUNT = 16'))
  assert.ok(styles.includes('grid-template-columns: repeat(4, 62px)'))
  assert.ok(styles.includes('grid-template-rows: repeat(4, 44px)'))
  assert.ok(closure.includes('13 个研究按钮可全部显示'))
})

// ── Evidence index ───────────────────────────────────────

test('BS-GLOBAL-15: closure proof files exist for all HN7 subchains', () => {
  for (const file of [
    '../tests/v9-hn7-melee-upgrade-chain-closure.spec.mjs',
    '../tests/v9-hn7-ranged-upgrade-chain-closure.spec.mjs',
    '../tests/v9-hn7-plating-upgrade-chain-closure.spec.mjs',
    '../tests/v9-hn7-animal-war-training-closure.spec.mjs',
    '../tests/v9-hn7-animal-war-training-ai-closure.spec.mjs',
    '../tests/v9-hn7-blacksmith-upgrade-ai-closure.spec.mjs',
    '../tests/v9-hn7-leather-armor-closure.spec.mjs',
  ]) {
    assert.ok(existsSync(new URL(file, import.meta.url)), `${file} must exist`)
  }
})

test('BS-GLOBAL-16: runtime proof files exist for the implemented chains', () => {
  for (const file of [
    '../tests/v9-hn7-iron-forged-swords-runtime.spec.ts',
    '../tests/v9-hn7-steel-mithril-runtime.spec.ts',
    '../tests/v9-hn7-ranged-upgrade-runtime.spec.ts',
    '../tests/v9-hn7-plating-upgrade-runtime.spec.ts',
    '../tests/v9-hn7-animal-war-training-runtime.spec.ts',
    '../tests/v9-hn7-blacksmith-upgrade-ai-runtime.spec.ts',
    '../tests/v9-hn7-leather-armor-runtime.spec.ts',
  ]) {
    assert.ok(existsSync(new URL(file, import.meta.url)), `${file} must exist`)
  }
})

// ── AI boundary ──────────────────────────────────────────

test('BS-GLOBAL-17: SimpleAI covers Blacksmith upgrades and AWT but not Leather Armor', () => {
  for (const ref of [
    'RESEARCHES.iron_forged_swords',
    'RESEARCHES.iron_plating',
    'RESEARCHES.black_gunpowder',
    'RESEARCHES.animal_war_training',
  ]) {
    assert.ok(simpleAI.includes(ref), `SimpleAI must include ${ref}`)
  }
  assert.ok(!simpleAI.includes('studded_leather_armor'))
  assert.ok(!simpleAI.includes('reinforced_leather_armor'))
  assert.ok(!simpleAI.includes('dragonhide_armor'))
  assert.ok(closure.includes('AI Castle/Knight strategy **未单独完成**'))
})

test('BS-GLOBAL-18: SimpleAI does not initiate Castle upgrade or Knight training strategy', () => {
  assert.ok(!simpleAI.includes("upgradeTo === 'castle'"), 'AI must not have Castle upgrade strategy')
  for (const line of simpleAI.split('\n')) {
    assert.ok(!(line.includes('trainingQueue.push') && line.includes('knight')), 'AI must not enqueue Knight training')
    assert.ok(!(line.includes('spawnUnit') && line.includes('knight')), 'AI must not spawn Knight as strategy')
  }
})

// ── Unopened scope ───────────────────────────────────────

test('BS-GLOBAL-19: GameData still has no heroes, air branch, item shop, second race, or multiplayer data', () => {
  for (const forbidden of [
    'archmage',
    'paladin',
    'mountain_king',
    'blood_mage',
    'gryphon',
    'dragonhawk',
    'flying_machine',
    'arcane_vault',
    'orc_',
    'undead_',
    'night_elf',
    'multiplayer',
  ]) {
    assert.ok(!gameData.includes(forbidden), `${forbidden} must not exist in GameData`)
  }
})

test('BS-GLOBAL-20: closure document names safe next directions only', () => {
  for (const expected of [
    'AI Castle/Knight strategy',
    'Hero branch contract',
    'Human global closure',
    'Mortar Team Heavy parity',
  ]) {
    assert.ok(closure.includes(expected), `${expected} must be a safe next option`)
  }
})

test('BS-GLOBAL-21: project status records HN7-CLOSE13 accepted and moves to gap inventory', () => {
  assert.ok(remainingGates.includes('HN7-CLOSE13 Human Blacksmith branch global closure'))
  assert.ok(laneStatus.includes('Task 200 — V9 HN7-CLOSE13 Human Blacksmith branch global closure'))
  assert.ok(laneStatus.includes('Human 核心缺口盘点'))
  assert.ok(expansionPacket.includes('Task200 / HN7-CLOSE13'))
  assert.ok(expansionPacket.includes('HUMAN-GAP1'))
})

test('BS-GLOBAL-22: evidence ledger records Leather closure before global closure', () => {
  assert.ok(evidenceLedger.includes('HN7-CLOSE12 accepted'))
  assert.ok(evidenceLedger.includes('HN7-CLOSE13 Human Blacksmith branch global closure'))
})
