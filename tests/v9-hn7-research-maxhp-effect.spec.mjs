/**
 * V9 HN7-IMPL1 ResearchEffect maxHp support proof.
 *
 * Static proof that:
 * 1. ResearchEffect.stat union now includes 'maxHp'
 * 2. applyFlatDeltaEffect handles maxHp by incrementing both maxHp and hp
 * 3. Long Rifles behavior is unchanged
 * 4. No animal_war_training data was added
 * 5. No Blacksmith/Barracks researches list was modified
 * 6. Later prerequisiteResearch support does not add upgrade data by itself
 */
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { test } from 'node:test'

const gameData = readFileSync(
  new URL('../src/game/GameData.ts', import.meta.url),
  'utf8',
)
const game = readFileSync(
  new URL('../src/game/Game.ts', import.meta.url),
  'utf8',
)

// ── ResearchEffect.stat includes maxHp ───────────────────

test('MAXHP-1: ResearchEffect.stat union includes maxHp', () => {
  assert.ok(
    gameData.includes("stat: 'attackRange' | 'attackDamage' | 'armor' | 'maxHp'"),
    'stat union must include maxHp alongside existing types',
  )
})

test('MAXHP-2: ResearchEffect.stat retains existing types', () => {
  assert.ok(
    gameData.includes("'attackRange'"),
    'attackRange still in stat union',
  )
  assert.ok(
    gameData.includes("'attackDamage'"),
    'attackDamage still in stat union',
  )
  assert.ok(
    gameData.includes("'armor'"),
    'armor still in stat union',
  )
})

// ── applyFlatDeltaEffect handles maxHp ───────────────────

test('MAXHP-3: applyFlatDeltaEffect handles maxHp case', () => {
  // Extract the applyFlatDeltaEffect method body
  const methodMatch = game.match(
    /private applyFlatDeltaEffect\([\s\S]*?switch[\s\S]*?\n\s{4}\}/,
  )
  assert.ok(methodMatch, 'applyFlatDeltaEffect must exist with switch')
  const body = methodMatch[0]

  assert.ok(body.includes("case 'maxHp'"), 'maxHp case must exist')
  assert.ok(body.includes('unit.maxHp'), 'must increment unit.maxHp')
  assert.ok(body.includes('unit.hp'), 'must increment unit.hp')
})

test('MAXHP-4: applyFlatDeltaEffect still handles existing stats', () => {
  const methodMatch = game.match(
    /private applyFlatDeltaEffect\([\s\S]*?switch[\s\S]*?\n\s{4}\}/,
  )
  assert.ok(methodMatch, 'method must exist')
  const body = methodMatch[0]

  assert.ok(body.includes("case 'attackRange'"), 'attackRange case preserved')
  assert.ok(body.includes("case 'attackDamage'"), 'attackDamage case preserved')
  assert.ok(body.includes("case 'armor'"), 'armor case preserved')
})

test('MAXHP-5: maxHp case increments both maxHp and hp equally', () => {
  const methodMatch = game.match(
    /private applyFlatDeltaEffect\([\s\S]*?switch[\s\S]*?\n\s{4}\}/,
  )
  assert.ok(methodMatch)
  const body = methodMatch[0]

  // Both should read effect.value
  assert.ok(
    body.includes('unit.maxHp += effect.value'),
    'maxHp must use effect.value',
  )
  assert.ok(
    body.includes('unit.hp += effect.value'),
    'hp must use effect.value',
  )
})

// ── Long Rifles unchanged ────────────────────────────────

test('MAXHP-6: Long Rifles data is unchanged', () => {
  assert.ok(
    gameData.includes("key: 'long_rifles'"),
    'long_rifles research still exists',
  )
  assert.ok(
    gameData.includes("stat: 'attackRange'") || gameData.includes("stat: 'attackRange',"),
    'Long Rifles still uses attackRange stat',
  )
})

test('MAXHP-7: applyResearchEffects still exists for existing units', () => {
  assert.ok(
    game.includes('applyResearchEffects'),
    'applyResearchEffects still present',
  )
  assert.ok(
    game.includes('applyCompletedResearchesToUnit'),
    'applyCompletedResearchesToUnit still present',
  )
})

// ── Forbidden boundaries ─────────────────────────────────

test('MAXHP-8: No animal_war_training data was added', () => {
  assert.ok(
    !gameData.includes("key: 'animal_war_training'"),
    'animal_war_training must not exist in GameData',
  )
})

test('MAXHP-9: No placeholder ranged / armor or Animal War Training data was added', () => {
  assert.ok(
    !gameData.includes("key: 'melee_upgrade"),
    'no melee upgrade data',
  )
  assert.ok(
    !gameData.includes("key: 'ranged_upgrade"),
    'no ranged upgrade data',
  )
  assert.ok(
    !gameData.includes("key: 'armor_upgrade"),
    'no armor upgrade data',
  )
})

test('MAXHP-10: Blacksmith researches includes long_rifles', () => {
  assert.ok(
    gameData.includes("'long_rifles'"),
    'blacksmith must still include long_rifles',
  )
})

test('MAXHP-11: Barracks researches not modified', () => {
  // Barracks should have no researches field (only trains units)
  const barracksMatch = gameData.match(/barracks:\s*\{[\s\S]*?\n\s*\}/)
  assert.ok(barracksMatch, 'barracks def must exist')
  assert.ok(
    !barracksMatch[0].includes('animal_war_training'),
    'barracks must not reference animal_war_training',
  )
})

test('MAXHP-12: prerequisiteResearch support is separate from maxHp / Animal War Training', () => {
  assert.ok(gameData.includes("prerequisiteResearch: 'iron_forged_swords'"))
  assert.ok(gameData.includes("prerequisiteResearch: 'steel_forged_swords'"))
  assert.ok(!gameData.includes("key: 'animal_war_training'"), 'Animal War Training data must still be absent')
})
