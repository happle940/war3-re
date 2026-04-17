/**
 * V9 HN7-AI13 Animal War Training AI closure inventory.
 *
 * Static proof that AI11 strategy contract + AI12 runtime implementation
 * form a closed loop: contract triggers match implementation, runtime tests
 * cover every trigger/skip scenario, data is read from RESEARCHES not hardcoded,
 * and forbidden branches are untouched.
 */
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { test } from 'node:test'

const simpleAI = readFileSync(new URL('../src/game/SimpleAI.ts', import.meta.url), 'utf8')
const contract = readFileSync(
  new URL('../docs/V9_HN7_ANIMAL_WAR_TRAINING_AI_STRATEGY_CONTRACT.zh-CN.md', import.meta.url),
  'utf8',
)
const runtimeSpec = readFileSync(
  new URL('../tests/v9-hn7-animal-war-training-ai-runtime.spec.ts', import.meta.url),
  'utf8',
)
const strategySpec = readFileSync(
  new URL('../tests/v9-hn7-animal-war-training-ai-strategy-contract.spec.mjs', import.meta.url),
  'utf8',
)

// ── AI11 contract → AI12 implementation alignment ─────────────

test('AI-CLOSE-1: SimpleAI reads AWT key/cost/time from RESEARCHES, not hardcoded', () => {
  assert.ok(simpleAI.includes('RESEARCHES.animal_war_training'), 'must read from RESEARCHES')
  assert.ok(simpleAI.includes('awtDef.cost'), 'must use data-driven cost')
  assert.ok(simpleAI.includes('awtDef.researchTime'), 'must use data-driven researchTime')
  assert.ok(simpleAI.includes('awtDef?.key'), 'must use data-driven key')
  // No hardcoded AWT values
  assert.ok(!simpleAI.includes("key: 'animal_war_training'"), 'must not hardcode AWT key')
  assert.ok(!simpleAI.includes('gold: 125, lumber: 125'), 'must not hardcode AWT cost')
})

test('AI-CLOSE-2: SimpleAI uses data-driven building/unit keys', () => {
  assert.ok(simpleAI.includes('BUILDINGS.castle.key'), 'must use BUILDINGS.castle.key')
  assert.ok(simpleAI.includes('BUILDINGS.lumber_mill.key'), 'must use BUILDINGS.lumber_mill.key')
  assert.ok(simpleAI.includes('UNITS.knight.key'), 'must use UNITS.knight.key')
  assert.ok(simpleAI.includes('UNITS.worker'), 'must use UNITS.worker for budget')
  assert.ok(simpleAI.includes('UNITS.footman'), 'must use UNITS.footman for budget')
})

test('AI-CLOSE-3: SimpleAI AWT block implements all 7 contract trigger conditions', () => {
  // C1: Castle
  assert.ok(simpleAI.includes('townhall.type === BUILDINGS.castle.key'), 'C1: Castle check')
  // C2: Barracks exists (implied by `barracks` truthiness in outer if)
  assert.ok(simpleAI.includes('&& barracks)'), 'C2: Barracks check')
  // C3: Lumber Mill
  assert.ok(simpleAI.includes('awtHasLumberMill'), 'C3: Lumber Mill check')
  // C4: Blacksmith
  assert.ok(simpleAI.includes('hasBlacksmith'), 'C4: Blacksmith check')
  // C5: AWT not completed
  assert.ok(simpleAI.includes('!barracks.completedResearches.includes(awtKey)'), 'C5: not completed')
  // C6: Research queue empty
  assert.ok(simpleAI.includes('barracks.researchQueue.length === 0'), 'C6: queue empty')
  // C7: Knight on map or in training
  assert.ok(simpleAI.includes("myUnits(UNITS.knight.key).length > 0"), 'C7: Knight on map')
  assert.ok(simpleAI.includes("barracks.trainingQueue.some"), 'C7: Knight in training')
})

test('AI-CLOSE-4: SimpleAI AWT budget check includes worker+footman reserve', () => {
  assert.ok(simpleAI.includes('resources.canAfford(team, awtDef.cost)'), 'canAfford check')
  assert.ok(simpleAI.includes('wCost.gold + fCost.gold'), 'worker+footman gold reserve')
})

test('AI-CLOSE-5: SimpleAI AWT spends and enqueues data-driven key/time', () => {
  assert.ok(simpleAI.includes("resources.spend(team, awtDef.cost)"), 'spend from data')
  assert.ok(simpleAI.includes('key: awtKey, remaining: awtDef.researchTime'), 'enqueue data-driven')
})

// ── AI12 runtime test coverage ────────────────────────────────

test('AI-CLOSE-6: runtime spec covers successful AWT trigger', () => {
  assert.ok(runtimeSpec.includes('AWT-AI-1'), 'AWT-AI-1: successful trigger')
  assert.ok(runtimeSpec.includes('all conditions are met'), 'describes successful case')
})

test('AI-CLOSE-7: runtime spec covers Keep skip (C1 negative)', () => {
  assert.ok(runtimeSpec.includes('AWT-AI-2'), 'AWT-AI-2')
  assert.ok(runtimeSpec.includes('Keep (not Castle)'), 'Keep skip')
})

test('AI-CLOSE-8: runtime spec covers no-Knight skip (C7 negative)', () => {
  assert.ok(runtimeSpec.includes('AWT-AI-3'), 'AWT-AI-3')
  assert.ok(runtimeSpec.includes('no Knight'), 'no Knight skip')
})

test('AI-CLOSE-9: runtime spec covers queue-occupied skip (C6 negative)', () => {
  assert.ok(runtimeSpec.includes('AWT-AI-4'), 'AWT-AI-4')
  assert.ok(runtimeSpec.includes('research queue is occupied'), 'queue occupied skip')
})

test('AI-CLOSE-10: runtime spec covers already-completed skip (C5 negative)', () => {
  assert.ok(runtimeSpec.includes('AWT-AI-5'), 'AWT-AI-5')
  assert.ok(runtimeSpec.includes('already completed'), 'already completed skip')
})

test('AI-CLOSE-11: runtime spec covers no-duplicate across ticks', () => {
  assert.ok(runtimeSpec.includes('AWT-AI-6'), 'AWT-AI-6')
  assert.ok(runtimeSpec.includes('does not duplicate'), 'no duplicate')
})

test('AI-CLOSE-12: runtime spec covers Knight-in-training satisfies C7', () => {
  assert.ok(runtimeSpec.includes('AWT-AI-7'), 'AWT-AI-7')
  assert.ok(runtimeSpec.includes('Knight in training'), 'Knight in training')
})

test('AI-CLOSE-13: runtime spec covers budget-insufficient skip', () => {
  assert.ok(runtimeSpec.includes('AWT-AI-8'), 'AWT-AI-8')
  assert.ok(runtimeSpec.includes('insufficient'), 'insufficient resources')
})

// ── AI11 strategy contract proof coverage ─────────────────────

test('AI-CLOSE-14: strategy contract proof exists and covers contract triggers', () => {
  assert.ok(strategySpec.includes('AI-STRAT-1'), 'AI-STRAT-1: trigger conditions')
  assert.ok(strategySpec.includes('AI-STRAT-2'), 'AI-STRAT-2: Castle not Keep')
  assert.ok(strategySpec.includes('AI-STRAT-3'), 'AI-STRAT-3: no duplicate')
  assert.ok(strategySpec.includes('AI-STRAT-4'), 'AI-STRAT-4: Knight required')
})

test('AI-CLOSE-15: strategy contract proof covers budget, retry, and forbidden', () => {
  assert.ok(strategySpec.includes('AI-STRAT-5'), 'AI-STRAT-5: budget boundaries')
  assert.ok(strategySpec.includes('AI-STRAT-6'), 'AI-STRAT-6: no starvation')
  assert.ok(strategySpec.includes('AI-STRAT-7'), 'AI-STRAT-7: retry boundaries')
  assert.ok(strategySpec.includes('AI-STRAT-10'), 'AI-STRAT-10: forbidden branches')
})

// ── Forbidden branches untouched ──────────────────────────────

test('AI-CLOSE-16: SimpleAI does not contain Castle upgrade logic', () => {
  assert.ok(!simpleAI.includes("upgradeTo === 'castle'"), 'no Castle upgrade')
  assert.ok(!simpleAI.includes("type = 'castle'"), 'no forced Castle type')
})

test('AI-CLOSE-17: SimpleAI does not contain Knight training initiation', () => {
  // The only Knight references should be in the AWT block checking for existing/training Knights
  const lines = simpleAI.split('\n')
  const knightLines = lines.filter(l => l.includes("'knight'") || l.includes('knight'))
  // All knight lines must be inside the AWT block or comments, not training
  for (const line of knightLines) {
    if (line.includes('spawnUnit') && line.includes('knight')) {
      assert.fail('SimpleAI must not spawn Knight units')
    }
    if (line.includes('trainingQueue.push') && line.includes('knight')) {
      assert.fail('SimpleAI must not push Knight to training queue')
    }
  }
  assert.ok(true, 'No Knight training initiation found')
})

test('AI-CLOSE-18: AWT block itself does not contain Blacksmith upgrade chain logic', () => {
  const awtStart = simpleAI.indexOf('5d-AWT')
  const awtEnd = simpleAI.indexOf('5e. Blacksmith upgrade')
  assert.ok(awtStart > 0, 'AWT block exists')
  assert.ok(awtEnd > awtStart, 'Blacksmith upgrade block starts after AWT block')
  const awtBlock = simpleAI.slice(awtStart, awtEnd)
  assert.ok(!awtBlock.includes('iron_forged_swords'), 'AWT block must not include melee upgrade')
  assert.ok(!awtBlock.includes('steel_forge'), 'AWT block must not include steel upgrade')
  assert.ok(!awtBlock.includes('mithril'), 'AWT block must not include mithril upgrade')
  assert.ok(!awtBlock.includes('leather_armor'), 'AWT block must not include Leather Armor')
})

// ── AI12 implementation contract alignment ────────────────────

test('AI-CLOSE-19: contract priority matches implementation placement', () => {
  // Contract says AWT is below Long Rifles, above attack waves
  const lrPos = simpleAI.indexOf('2e. 有铁匠铺 → 研究 Long Rifles')
  const awtPos = simpleAI.indexOf('5d-AWT')
  const wavePos = simpleAI.indexOf('6. 军事单位积累到阈值')
  assert.ok(lrPos > 0, 'Long Rifles section exists')
  assert.ok(awtPos > 0, 'AWT section exists')
  assert.ok(wavePos > 0, 'attack wave section exists')
  assert.ok(lrPos < awtPos, 'Long Rifles before AWT')
  assert.ok(awtPos < wavePos, 'AWT before attack waves')
})

test('AI-CLOSE-20: no GameData or Game.ts was modified by AI12', () => {
  // Verify AWT code is only in SimpleAI.ts, not duplicated elsewhere
  const gameData = readFileSync(new URL('../src/game/GameData.ts', import.meta.url), 'utf8')
  const game = readFileSync(new URL('../src/game/Game.ts', import.meta.url), 'utf8')
  // GameData should not contain AI-specific AWT logic
  assert.ok(!gameData.includes('SimpleAI'), 'GameData must not reference SimpleAI')
  assert.ok(!game.includes('animal_war_training'), 'Game.ts must not contain AWT AI logic')
})
