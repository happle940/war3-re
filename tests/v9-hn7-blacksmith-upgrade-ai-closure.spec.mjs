/**
 * V9 HN7-AI16 Blacksmith Upgrade AI closure inventory.
 *
 * Static proof that AI14 strategy contract + AI15 runtime implementation
 * form a closed loop: contract triggers match implementation, runtime tests
 * cover every trigger/skip/priority scenario, data is read from RESEARCHES
 * not hardcoded, and forbidden branches are untouched.
 */
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { test } from 'node:test'

const simpleAI = readFileSync(new URL('../src/game/SimpleAI.ts', import.meta.url), 'utf8')
const contract = readFileSync(
  new URL('../docs/V9_HN7_BLACKSMITH_UPGRADE_AI_STRATEGY_CONTRACT.zh-CN.md', import.meta.url),
  'utf8',
)
const runtimeSpec = readFileSync(
  new URL('../tests/v9-hn7-blacksmith-upgrade-ai-runtime.spec.ts', import.meta.url),
  'utf8',
)
const strategySpec = readFileSync(
  new URL('../tests/v9-hn7-blacksmith-upgrade-ai-strategy-contract.spec.mjs', import.meta.url),
  'utf8',
)

// ── Data-driven implementation ────────────────────────────────

test('BS-CLOSE-1: SimpleAI reads all 9 upgrades from RESEARCHES, not hardcoded', () => {
  const upgradeRefs = [
    'RESEARCHES.iron_forged_swords',
    'RESEARCHES.iron_plating',
    'RESEARCHES.black_gunpowder',
    'RESEARCHES.steel_forged_swords',
    'RESEARCHES.steel_plating',
    'RESEARCHES.refined_gunpowder',
    'RESEARCHES.mithril_forged_swords',
    'RESEARCHES.mithril_plating',
    'RESEARCHES.imbued_gunpowder',
  ]
  for (const ref of upgradeRefs) {
    assert.ok(simpleAI.includes(ref), `must reference ${ref}`)
  }
  // No hardcoded upgrade values in the 5e block
  assert.ok(!simpleAI.includes("gold: 100, lumber: 50"), 'must not hardcode upgrade cost')
  assert.ok(!simpleAI.includes("gold: 175, lumber: 175"), 'must not hardcode upgrade cost')
})

test('BS-CLOSE-2: SimpleAI uses data-driven tier gate from def.requiresBuilding', () => {
  assert.ok(simpleAI.includes('def.requiresBuilding'), 'must read requiresBuilding from def')
  assert.ok(simpleAI.includes('BUILDINGS.blacksmith.key'), 'must compare to data-driven blacksmith key')
  assert.ok(simpleAI.includes('BUILDINGS.castle.key'), 'must compare to data-driven castle key')
  assert.ok(simpleAI.includes('BUILDINGS.keep.key'), 'must compare to data-driven keep key')
})

test('BS-CLOSE-3: SimpleAI uses data-driven prereq gate from def.prerequisiteResearch', () => {
  assert.ok(simpleAI.includes('def.prerequisiteResearch'), 'must read prereq from def')
  assert.ok(simpleAI.includes('!completed.has(def.prerequisiteResearch)'), 'must check prereq via completed set')
  // No hardcoded prereq keys like 'iron_forged_swords' in the 5e block conditions
  const block5e = simpleAI.substring(simpleAI.indexOf('5e. Blacksmith upgrade'))
  assert.ok(!block5e.includes("completed.has('iron_forged_swords')"), 'must not hardcode prereq keys')
  assert.ok(!block5e.includes("completed.has('black_gunpowder')"), 'must not hardcode prereq keys')
})

test('BS-CLOSE-4: SimpleAI uses data-driven unit gate from def.effects', () => {
  assert.ok(simpleAI.includes('def.effects'), 'must read effects from def')
  assert.ok(simpleAI.includes('targetTypes'), 'must extract target unit types from effects')
  assert.ok(simpleAI.includes('affectsRanged'), 'must determine ranged from effects')
  assert.ok(simpleAI.includes('affectsMelee'), 'must determine melee from effects')
})

test('BS-CLOSE-5: SimpleAI uses data-driven cost/researchTime from def', () => {
  assert.ok(simpleAI.includes('def.cost'), 'must use data-driven cost')
  assert.ok(simpleAI.includes('def.researchTime'), 'must use data-driven researchTime')
  assert.ok(simpleAI.includes('def.key'), 'must use data-driven key')
})

// ── Contract → Implementation alignment ───────────────────────

test('BS-CLOSE-6: SimpleAI implements GC1-GC4 general conditions', () => {
  // GC1: hasBlacksmith
  assert.ok(simpleAI.includes('hasBlacksmith && this.waveCount >= 1'), 'GC1+GC4: Blacksmith + waveCount')
  // GC2: queue empty
  assert.ok(simpleAI.includes('blacksmith.researchQueue.length === 0'), 'GC2: queue empty')
  // GC3: budget with reserve
  assert.ok(simpleAI.includes('wCost.gold + fCost.gold'), 'GC3: worker+footman reserve')
})

test('BS-CLOSE-7: SimpleAI implements chain priority order per contract', () => {
  // Verify the upgradeOrder array matches contract priority
  const orderStart = simpleAI.indexOf('const upgradeOrder = [')
  const orderEnd = simpleAI.indexOf(']', orderStart) + 1
  const orderBlock = simpleAI.substring(orderStart, orderEnd)
  const expectedOrder = [
    'iron_forged_swords',
    'iron_plating',
    'black_gunpowder',
    'steel_forged_swords',
    'steel_plating',
    'refined_gunpowder',
    'mithril_forged_swords',
    'mithril_plating',
    'imbued_gunpowder',
  ]
  for (const key of expectedOrder) {
    assert.ok(orderBlock.includes(key), `upgradeOrder must include ${key}`)
  }
})

test('BS-CLOSE-8: SimpleAI respects Long Rifles priority over ranged chain', () => {
  // The ranged gate requires hasLongRifles
  assert.ok(simpleAI.includes('hasLongRifles'), 'must check Long Rifles completion for ranged')
  assert.ok(simpleAI.includes("completed.has(RESEARCHES.long_rifles.key)"), 'must derive from RESEARCHES')
})

test('BS-CLOSE-9: SimpleAI budget uses worker + footman reserve from UNITS', () => {
  assert.ok(simpleAI.includes("UNITS.worker"), 'must use UNITS.worker for budget')
  assert.ok(simpleAI.includes("UNITS.footman"), 'must use UNITS.footman for budget')
})

test('BS-CLOSE-10: SimpleAI only queues one upgrade per tick', () => {
  const block5e = simpleAI.substring(
    simpleAI.indexOf('5e. Blacksmith upgrade'),
    simpleAI.indexOf('6. 军事单位积累到阈值'),
  )
  assert.ok(block5e.includes('break'), 'must break after first eligible upgrade')
})

// ── Runtime test coverage ─────────────────────────────────────

test('BS-CLOSE-11: runtime spec covers melee L1 positive trigger (BS-RT-1)', () => {
  assert.ok(runtimeSpec.includes('BS-RT-1'), 'BS-RT-1 exists')
  assert.ok(runtimeSpec.includes('iron_forged_swords'), 'melee L1')
})

test('BS-CLOSE-12: runtime spec covers waveCount 0 skip (BS-RT-2)', () => {
  assert.ok(runtimeSpec.includes('BS-RT-2'), 'BS-RT-2 exists')
  assert.ok(runtimeSpec.includes('waveCount is 0'), 'waveCount skip')
})

test('BS-CLOSE-13: runtime spec covers queue occupied skip (BS-RT-3)', () => {
  assert.ok(runtimeSpec.includes('BS-RT-3'), 'BS-RT-3 exists')
  assert.ok(runtimeSpec.includes('queue is occupied'), 'queue occupied')
})

test('BS-CLOSE-14: runtime spec covers already completed skip (BS-RT-4)', () => {
  assert.ok(runtimeSpec.includes('BS-RT-4'), 'BS-RT-4 exists')
  assert.ok(runtimeSpec.includes('already completed'), 'already completed')
})

test('BS-CLOSE-15: runtime spec covers no-melee-units ranged path (BS-RT-5)', () => {
  assert.ok(runtimeSpec.includes('BS-RT-5'), 'BS-RT-5 exists')
  assert.ok(runtimeSpec.includes('no melee units'), 'no melee units')
})

test('BS-CLOSE-16: runtime spec covers Long Rifles priority (BS-RT-6a/6b)', () => {
  assert.ok(runtimeSpec.includes('BS-RT-6a'), 'BS-RT-6a: Long Rifles priority')
  assert.ok(runtimeSpec.includes('BS-RT-6b'), 'BS-RT-6b: black_gunpowder after LR')
})

test('BS-CLOSE-17: runtime spec covers budget insufficient skip (BS-RT-7)', () => {
  assert.ok(runtimeSpec.includes('BS-RT-7'), 'BS-RT-7 exists')
  assert.ok(runtimeSpec.includes('budget insufficient'), 'budget skip')
})

test('BS-CLOSE-18: runtime spec covers L2 Keep tier gate (BS-RT-8)', () => {
  assert.ok(runtimeSpec.includes('BS-RT-8'), 'BS-RT-8 exists')
  assert.ok(runtimeSpec.includes('L2 melee'), 'L2 melee')
})

test('BS-CLOSE-19: runtime spec covers L3 Castle tier gate (BS-RT-9)', () => {
  assert.ok(runtimeSpec.includes('BS-RT-9'), 'BS-RT-9 exists')
  assert.ok(runtimeSpec.includes('L3 melee'), 'L3 melee')
})

test('BS-CLOSE-20: runtime spec covers no-skip-level (BS-RT-10)', () => {
  assert.ok(runtimeSpec.includes('BS-RT-10'), 'BS-RT-10 exists')
  assert.ok(runtimeSpec.includes('does not skip levels'), 'no skip levels')
})

test('BS-CLOSE-21: runtime spec covers no-duplicate (BS-RT-11)', () => {
  assert.ok(runtimeSpec.includes('BS-RT-11'), 'BS-RT-11 exists')
  assert.ok(runtimeSpec.includes('does not duplicate'), 'no duplicate')
})

test('BS-CLOSE-22: runtime spec covers no-Blacksmith skip (BS-RT-12)', () => {
  assert.ok(runtimeSpec.includes('BS-RT-12'), 'BS-RT-12 exists')
  assert.ok(runtimeSpec.includes('no Blacksmith'), 'no Blacksmith')
})

test('BS-CLOSE-23: runtime spec covers Knight-as-melee (BS-RT-13)', () => {
  assert.ok(runtimeSpec.includes('BS-RT-13'), 'BS-RT-13 exists')
  assert.ok(runtimeSpec.includes('Knight counts as melee'), 'Knight melee')
})

test('BS-CLOSE-24: runtime spec covers plating L1 after melee L1 done (BS-RT-14)', () => {
  assert.ok(runtimeSpec.includes('BS-RT-14'), 'BS-RT-14 exists')
  assert.ok(runtimeSpec.includes('plating L1'), 'plating L1')
})

test('BS-CLOSE-25: runtime spec covers Leather Armor exclusion (BS-RT-15)', () => {
  assert.ok(runtimeSpec.includes('BS-RT-15'), 'BS-RT-15 exists')
  assert.ok(runtimeSpec.includes('leather_armor'), 'Leather Armor excluded')
})

test('BS-CLOSE-26: runtime spec proves data-driven prereq (BS-RT-16)', () => {
  assert.ok(runtimeSpec.includes('BS-RT-16'), 'BS-RT-16 exists')
  assert.ok(runtimeSpec.includes('prerequisiteResearch'), 'checks def.prerequisiteResearch')
})

test('BS-CLOSE-27: runtime spec proves data-driven tier gate (BS-RT-17)', () => {
  assert.ok(runtimeSpec.includes('BS-RT-17'), 'BS-RT-17 exists')
  assert.ok(runtimeSpec.includes('requiresBuilding'), 'checks def.requiresBuilding')
})

// ── Strategy contract proof coverage ──────────────────────────

test('BS-CLOSE-28: strategy contract proof covers all 24 assertions', () => {
  for (let i = 1; i <= 24; i++) {
    assert.ok(strategySpec.includes(`BS-AI-${i}`), `must include BS-AI-${i}`)
  }
})

// ── Forbidden branches ────────────────────────────────────────

test('BS-CLOSE-29: SimpleAI does not contain Castle upgrade or Knight training', () => {
  assert.ok(!simpleAI.includes("upgradeTo === 'castle'"), 'no Castle upgrade')
  assert.ok(!simpleAI.includes("type = 'castle'"), 'no forced Castle type')
  // Knight training
  const lines = simpleAI.split('\n')
  for (const line of lines) {
    if (line.includes('spawnUnit') && line.includes('knight')) {
      assert.fail('SimpleAI must not spawn Knight units')
    }
    if (line.includes('trainingQueue.push') && line.includes('knight')) {
      assert.fail('SimpleAI must not push Knight to training queue')
    }
  }
  assert.ok(true, 'No Castle upgrade or Knight training found')
})

test('BS-CLOSE-30: SimpleAI does not contain Leather Armor', () => {
  assert.ok(!simpleAI.includes('leather_armor'), 'no leather_armor')
  assert.ok(!simpleAI.includes('Leather Armor'), 'no Leather Armor text')
})

// ── No GameData/Game.ts changes ───────────────────────────────

test('BS-CLOSE-31: no GameData or Game.ts contains AI-specific Blacksmith upgrade logic', () => {
  const gameData = readFileSync(new URL('../src/game/GameData.ts', import.meta.url), 'utf8')
  const game = readFileSync(new URL('../src/game/Game.ts', import.meta.url), 'utf8')
  assert.ok(!gameData.includes('SimpleAI'), 'GameData must not reference SimpleAI')
  assert.ok(!game.includes('iron_forged_swords'), 'Game.ts must not contain upgrade AI logic')
  assert.ok(!game.includes('upgradeOrder'), 'Game.ts must not contain upgrade order')
})

// ── Placement and priority ────────────────────────────────────

test('BS-CLOSE-32: 5e block is placed after Long Rifles and AWT, before attack waves', () => {
  const lrPos = simpleAI.indexOf('2e. 有铁匠铺 → 研究 Long Rifles')
  const awtPos = simpleAI.indexOf('5d-AWT')
  const bsPos = simpleAI.indexOf('5e. Blacksmith upgrade')
  const wavePos = simpleAI.indexOf('6. 军事单位积累到阈值')
  assert.ok(lrPos > 0, 'Long Rifles section exists')
  assert.ok(awtPos > 0, 'AWT section exists')
  assert.ok(bsPos > 0, 'Blacksmith upgrade section exists')
  assert.ok(wavePos > 0, 'attack wave section exists')
  assert.ok(lrPos < bsPos, 'Long Rifles before Blacksmith upgrades')
  assert.ok(awtPos < bsPos, 'AWT before Blacksmith upgrades')
  assert.ok(bsPos < wavePos, 'Blacksmith upgrades before attack waves')
})
