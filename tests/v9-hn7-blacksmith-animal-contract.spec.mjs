/**
 * V9 HN7-PLAN1 Blacksmith / Animal War Training branch contract proof.
 *
 * Static proof that the contract exists and correctly:
 * 1. Defines three Blacksmith upgrade lines (melee / ranged / armor)
 * 2. Defines Animal War Training as a separate research
 * 3. Distinguishes Long Rifles as existing from new upgrades
 * 4. Tracks maxHp and prerequisiteResearch model support
 * 5. Marks all uncertain values as needing Codex source verification
 * 6. Does not add upgrade data, Animal War Training data, or AI strategy
 */
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { test } from 'node:test'

const contract = readFileSync(
  new URL('../docs/V9_HN7_BLACKSMITH_ANIMAL_TRAINING_CONTRACT.zh-CN.md', import.meta.url),
  'utf8',
)
const gameData = readFileSync(
  new URL('../src/game/GameData.ts', import.meta.url),
  'utf8',
)
const game = readFileSync(
  new URL('../src/game/Game.ts', import.meta.url),
  'utf8',
)

// ── Contract existence and scope ─────────────────────────

test('HN7C-1: Contract document exists and is non-empty', () => {
  assert.ok(contract.length > 500, 'HN7 contract must be substantial')
})

test('HN7C-2: Contract defines three Blacksmith upgrade lines', () => {
  assert.ok(contract.includes('近战'), 'melee upgrade line')
  assert.ok(contract.includes('远程'), 'ranged upgrade line')
  assert.ok(contract.includes('护甲'), 'armor upgrade line')
})

test('HN7C-3: Contract defines Animal War Training separately', () => {
  assert.ok(contract.includes('Animal War Training'), 'Animal War Training mentioned')
  assert.ok(contract.includes('animal_war_training'), 'key for Animal War Training')
})

test('HN7C-4: Contract distinguishes Long Rifles from new upgrades', () => {
  assert.ok(contract.includes('Long Rifles'), 'Long Rifles mentioned as existing')
  assert.ok(contract.includes('long_rifles'), 'long_rifles key referenced')
})

// ── Infrastructure gap identification ────────────────────

test('HN7C-5: Contract tracks ResearchEffect.stat maxHp support', () => {
  assert.ok(contract.includes('maxHp'), 'maxHp support must be discussed')
  assert.ok(contract.includes('HN7-IMPL1'), 'HN7-IMPL1 must be tracked')
})

test('HN7C-6: Contract tracks prerequisiteResearch model support', () => {
  assert.ok(
    contract.includes('prerequisiteResearch'),
    'prerequisiteResearch field discussed',
  )
})

// ── Current infrastructure is correct ────────────────────

test('HN7C-7: Current GameData has ResearchDef with FlatDelta model', () => {
  assert.ok(gameData.includes('ResearchEffectType'), 'ResearchEffectType exists')
  assert.ok(gameData.includes('FlatDelta'), 'FlatDelta effect type exists')
  assert.ok(gameData.includes('ResearchDef'), 'ResearchDef interface exists')
})

test('HN7C-8: Blacksmith researches include long_rifles and HN7 upgrades', () => {
  assert.ok(gameData.includes("'long_rifles'"), 'blacksmith must still include long_rifles')
  assert.ok(gameData.includes("'iron_forged_swords'"), 'blacksmith includes iron_forged_swords after HN7-DATA3')
})

test('HN7C-9: ResearchEffect.stat now includes maxHp after HN7-IMPL1', () => {
  assert.ok(
    gameData.includes("'maxHp'"),
    'maxHp must now be in the stat union after HN7-IMPL1',
  )
  assert.ok(
    gameData.includes("'attackRange'") && gameData.includes("'attackDamage'") && gameData.includes("'armor'"),
    'existing stat types must be preserved',
  )
})

test('HN7C-10: Current Game.ts applies FlatDelta to existing and new units', () => {
  assert.ok(game.includes('applyResearchEffects'), 'applyResearchEffects exists')
  assert.ok(
    game.includes('applyCompletedResearchesToUnit'),
    'applyCompletedResearchesToUnit exists',
  )
  assert.ok(game.includes('applyFlatDeltaEffect'), 'applyFlatDeltaEffect exists')
})

// ── Forbidden items not in contract scope ────────────────

test('HN7C-11: Contract lists forbidden items', () => {
  assert.ok(contract.includes('英雄'), 'heroes forbidden')
  assert.ok(contract.includes('空军'), 'air units forbidden')
  assert.ok(contract.includes('物品'), 'items forbidden')
  assert.ok(contract.includes('素材导入'), 'asset import forbidden')
  assert.ok(contract.includes('AI') && contract.includes('升级'), 'AI upgrade strategy forbidden')
})

// ── No placeholder / unrelated upgrade data was added ────

test('HN7C-12: Contract marks uncertain values for Codex verification', () => {
  assert.ok(
    contract.includes('需 Codex 源校验'),
    'uncertain values marked for Codex verification',
  )
})

test('HN7C-13: No placeholder ranged / armor upgrade data was added to GameData', () => {
  assert.ok(
    !gameData.includes("key: 'melee_upgrade"),
    'no melee upgrade data in GameData',
  )
  assert.ok(
    !gameData.includes("key: 'ranged_upgrade"),
    'no ranged upgrade data in GameData',
  )
  assert.ok(
    !gameData.includes("key: 'armor_upgrade"),
    'no armor upgrade data in GameData',
  )
  assert.ok(
    !gameData.includes("key: 'animal_war_training'"),
    'no Animal War Training data in GameData',
  )
})

test('HN7C-14: Game.ts has model support but no HN7 research data', () => {
  assert.ok(game.includes("case 'maxHp'"), 'maxHp model support may exist after HN7-IMPL1')
  assert.ok(game.includes('prerequisiteResearch'), 'prerequisiteResearch support exists after HN7-IMPL2')
  assert.ok(!game.includes('animal_war_training'), 'Game.ts must not reference Animal War Training')
})
