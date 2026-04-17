/**
 * V9 HN5-CLOSE6 Sorceress / Slow closure inventory.
 *
 * Proves:
 * 1. UNITS.sorceress data seed exists with combat identity and mana fields.
 * 2. ABILITIES.slow data seed exists with speed debuff fields.
 * 3. Arcane Sanctum trains sorceress.
 * 4. Sorceress mana is data-driven (not hardcoded to priest).
 * 5. Manual Slow runtime exists (castSlow, command card, debuff, expiry).
 * 6. Auto-cast Slow toggle exists (slowAutoCastEnabled, findSlowAutoTarget).
 * 7. Existing proof files cover data seed, training, mana, manual Slow, auto Slow.
 * 8. No AI Slow, no attack speed debuff, no Invisibility, Polymorph, Spell Breaker,
 *    heroes, items, full buff/debuff framework, or asset import.
 * 9. HN5 contract and expansion packet reflect current state.
 */
import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'
import { test } from 'node:test'

const gameData = readFileSync(new URL('../src/game/GameData.ts', import.meta.url), 'utf8')
const game = readFileSync(new URL('../src/game/Game.ts', import.meta.url), 'utf8')
const ai = readFileSync(new URL('../src/game/SimpleAI.ts', import.meta.url), 'utf8')
const contract = readFileSync(new URL('../docs/V9_HN5_SORCERESS_SLOW_CONTRACT.zh-CN.md', import.meta.url), 'utf8')
const expansion = readFileSync(new URL('../docs/V9_HUMAN_NUMERIC_EXPANSION_PACKET.zh-CN.md', import.meta.url), 'utf8')

const proofFiles = [
  'tests/v9-hn5-sorceress-slow-contract.spec.mjs',
  'tests/v9-hn5-sorceress-slow-data-seed.spec.mjs',
  'tests/v9-hn5-sorceress-training-surface.spec.ts',
  'tests/v9-hn5-sorceress-mana-surface.spec.ts',
  'tests/v9-hn5-slow-runtime-minimal.spec.ts',
  'tests/v9-hn5-slow-autocast-minimal.spec.ts',
]

test('CLOSE-1: UNITS.sorceress data seed exists with combat identity and mana', () => {
  assert.ok(gameData.includes("key: 'sorceress'"), 'sorceress key must exist')
  assert.ok(gameData.includes("name: '女巫'"), 'sorceress name must exist')
  assert.ok(gameData.includes('attackType: AttackType.Magic'), 'sorceress must use Magic attack')
  assert.ok(gameData.includes('armorType: ArmorType.Unarmored'), 'sorceress must use Unarmored armor')
  assert.ok(gameData.includes('maxMana: 200'), 'sorceress must have maxMana')
  assert.ok(gameData.includes('manaRegen: 0.5'), 'sorceress must have manaRegen')
})

test('CLOSE-2: ABILITIES.slow data seed exists with speed debuff fields', () => {
  assert.ok(gameData.includes("key: 'slow'"), 'slow key must exist')
  assert.ok(gameData.includes("name: '减速'"), 'slow name must exist')
  assert.ok(gameData.includes("ownerType: 'sorceress'"), 'slow owner must be sorceress')
  assert.ok(gameData.includes('speedMultiplier: 0.4'), 'slow must define speedMultiplier')
  assert.ok(gameData.includes('duration: 20'), 'slow must define duration')
  assert.ok(gameData.includes("effectType: 'speedDebuff'"), 'slow must be speedDebuff type')
})

test('CLOSE-3: Arcane Sanctum trains sorceress, mana is data-driven', () => {
  assert.ok(gameData.includes("trains: ['priest', 'sorceress']"), 'Arcane Sanctum must train priest and sorceress')
  assert.ok(game.includes('mana: UNITS[type]?.maxMana ?? 0'), 'spawnUnit must read mana from UNITS data')
  assert.ok(game.includes('maxMana: UNITS[type]?.maxMana ?? 0'), 'spawnUnit must read maxMana from UNITS data')
  assert.ok(game.includes('manaRegen: UNITS[type]?.manaRegen ?? 0'), 'spawnUnit must read manaRegen from UNITS data')
  assert.ok(!game.includes("mana: type === 'priest'"), 'spawnUnit must not hardcode priest mana')
})

test('CLOSE-4: manual Slow runtime exists with cast, command card, debuff, expiry', () => {
  assert.ok(game.includes('castSlow'), 'Game.ts must have castSlow method')
  assert.ok(game.includes('const slowDef = ABILITIES.slow'), 'castSlow must read ABILITIES.slow')
  assert.ok(game.includes('slowUntil'), 'Game.ts must track slow expiry')
  assert.ok(game.includes('slowSpeedMultiplier'), 'Game.ts must track slow speed multiplier')
  assert.ok(game.includes('getEffectiveMovementSpeed'), 'movement must check slow state')
  assert.ok(game.includes('updateSlowExpiry'), 'Game.ts must handle slow expiry')
  // Command card shows Slow button for Sorceress
  assert.ok(game.includes("primary.type === 'sorceress'"), 'command card must check for sorceress')
  assert.ok(game.includes('this.castSlow(primary, enemies[0])'), 'command card must call castSlow')
})

test('CLOSE-5: auto-cast Slow toggle exists', () => {
  assert.ok(game.includes('slowAutoCastEnabled'), 'Game.ts must track auto-cast state')
  assert.ok(game.includes('slowAutoCastCooldownUntil'), 'Game.ts must track auto-cast cooldown')
  assert.ok(game.includes('findSlowAutoTarget'), 'Game.ts must have target finder')
  assert.ok(game.includes('this.castSlow(unit, bestAutoTarget)'), 'auto-cast must reuse castSlow')
  // Command card shows auto-cast toggle (uses slow.name + " (自动)" template)
  assert.ok(game.includes('(自动)'), 'command card must show auto-cast toggle with (自动) label')
  assert.ok(game.includes('slowAutoCastEnabled'), 'toggle must read slowAutoCastEnabled state')
})

test('CLOSE-6: proof files exist for all HN5 stages', () => {
  for (const file of proofFiles) {
    const url = new URL(`../${file}`, import.meta.url)
    assert.ok(existsSync(url), `proof file ${file} must exist`)
  }
})

test('CLOSE-7: no AI Slow, no attack speed debuff, no banned expansions', () => {
  assert.ok(!ai.includes('slow'), 'AI must not use Slow')
  assert.ok(!ai.includes('Slow'), 'AI must not reference Slow')
  assert.ok(!game.includes('attackSpeedMultiplier'), 'no attack speed debuff')
  assert.ok(!game.includes('BuffSystem'), 'no full buff/debuff framework')
  assert.ok(!game.includes('autoCastSlow'), 'no separate auto-cast constant')
  // No banned unit/ability data
  assert.ok(!gameData.includes("key: 'spell_breaker'"), 'no Spell Breaker')
  assert.ok(!gameData.includes("key: 'invisibility'"), 'no Invisibility ability')
  assert.ok(!gameData.includes("key: 'polymorph'"), 'no Polymorph ability')
  assert.ok(!gameData.includes("key: 'knight'"), 'no Knight unit')
  assert.ok(!gameData.includes("key: 'paladin'"), 'no Paladin hero')
  assert.ok(!gameData.includes("key: 'archmage'"), 'no Archmage hero')
  assert.ok(!gameData.includes("key: 'mountain_king'"), 'no Mountain King hero')
  assert.ok(!gameData.includes("key: 'item'"), 'no item system')
})

test('CLOSE-8: HN5 contract and expansion packet reflect current state', () => {
  // Contract must track progress through all HN5 stages
  assert.ok(contract.includes('HN5-DATA1') || contract.includes('Task 151'), 'contract must track data seed')
  assert.ok(contract.includes('HN5-IMPL2') || contract.includes('Task 152'), 'contract must track training surface')
  assert.ok(contract.includes('HN5-IMPL3') || contract.includes('Task 153'), 'contract must track mana surface')
  assert.ok(contract.includes('HN5-IMPL4') || contract.includes('Task 154'), 'contract must track Slow runtime')
  // Expansion packet must reference HN5 stages
  assert.ok(expansion.includes('Task154') || expansion.includes('Slow runtime'), 'expansion must reference Slow runtime')
  assert.ok(expansion.includes('Task155') || expansion.includes('auto-cast'), 'expansion must reference auto-cast toggle')
  // Must not claim complete Human or broader tech tree
  assert.ok(!expansion.includes('Human 完成'), 'must not claim complete Human')
  assert.ok(!expansion.includes('全部 Human'), 'must not claim all Human complete')
})
