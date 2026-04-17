/**
 * V9 HN3-DATA2 Priest Heal Ability Data Seed Proof
 *
 * Static proof that verifies:
 * 1. AbilityDef interface exists in GameData.ts
 * 2. ABILITIES.priest_heal exists with all required fields
 * 3. ABILITIES.priest_heal values match existing PRIEST_HEAL_* constants
 * 4. Game.ts is compatible with either the seed-only stage or the later runtime migration
 * 5. Runtime code does not couple to the AbilityDef type shape
 */
import { readFileSync } from 'node:fs'
import { test } from 'node:test'
import assert from 'node:assert/strict'

const gameData = readFileSync(new URL('../src/game/GameData.ts', import.meta.url), 'utf8')
const game = readFileSync(new URL('../src/game/Game.ts', import.meta.url), 'utf8')

function extractConstNumber(source, name) {
  const match = source.match(new RegExp(`export const ${name}\\s*=\\s*([0-9.]+)`))
  assert.ok(match, `${name} must exist`)
  return Number(match[1])
}

function extractAbilitiesEntry(source) {
  const start = source.indexOf('export const ABILITIES')
  assert.ok(start >= 0, 'ABILITIES export must exist')
  const bodyStart = source.indexOf('{', start)
  let depth = 0
  let bodyEnd = -1
  for (let i = bodyStart; i < source.length; i++) {
    if (source[i] === '{') depth++
    if (source[i] === '}') depth--
    if (depth === 0) { bodyEnd = i; break }
  }
  return source.slice(bodyStart + 1, bodyEnd)
}

test('DS-1: AbilityDef interface exists with all required fields', () => {
  assert.ok(gameData.includes('export interface AbilityDef'), 'AbilityDef interface must exist')
  for (const field of ['key:', 'name:', 'ownerType:', 'cost:', 'cooldown:', 'range:', 'targetRule:', 'effectType:', 'effectValue:', 'duration:', 'stackingRule:']) {
    assert.ok(gameData.includes(field), `AbilityDef must have ${field} field`)
  }
})

test('DS-2: ABILITIES.priest_heal exists with all required fields', () => {
  const abilities = extractAbilitiesEntry(gameData)
  assert.ok(abilities.includes('priest_heal:'), 'ABILITIES must have priest_heal entry')

  // Extract the priest_heal body
  const phStart = abilities.indexOf('priest_heal:')
  assert.ok(phStart >= 0, 'priest_heal entry must exist')
  const phBodyStart = abilities.indexOf('{', phStart)
  let depth = 0
  let phBodyEnd = -1
  for (let i = phBodyStart; i < abilities.length; i++) {
    if (abilities[i] === '{') depth++
    if (abilities[i] === '}') depth--
    if (depth === 0) { phBodyEnd = i; break }
  }
  const phBody = abilities.slice(phBodyStart + 1, phBodyEnd)

  // Check all required fields present
  const requiredFields = [
    "key: 'priest_heal'",
    "name: '治疗'",
    "ownerType: 'priest'",
    'cost: { mana: PRIEST_HEAL_MANA_COST }',
    'cooldown: PRIEST_HEAL_COOLDOWN',
    'range: PRIEST_HEAL_RANGE',
    "teams: 'ally'",
    'alive: true',
    "excludeTypes: []",
    "includeCondition: 'injured'",
    "effectType: 'flatHeal'",
    'effectValue: PRIEST_HEAL_AMOUNT',
    'duration: 0',
    "stackingRule: 'none'",
  ]
  for (const field of requiredFields) {
    assert.ok(phBody.includes(field), `priest_heal must include ${field}`)
  }
})

test('DS-3: ABILITIES.priest_heal values match existing PRIEST_HEAL_* constants', () => {
  const healAmount = extractConstNumber(gameData, 'PRIEST_HEAL_AMOUNT')
  const healManaCost = extractConstNumber(gameData, 'PRIEST_HEAL_MANA_COST')
  const healCooldown = extractConstNumber(gameData, 'PRIEST_HEAL_COOLDOWN')
  const healRange = extractConstNumber(gameData, 'PRIEST_HEAL_RANGE')

  // The ABILITIES entry references the constants by name, so verify the constants exist
  // and the ABILITIES entry uses them (not hardcoded numbers)
  assert.ok(gameData.includes('effectValue: PRIEST_HEAL_AMOUNT'), 'must reference PRIEST_HEAL_AMOUNT')
  assert.ok(gameData.includes('mana: PRIEST_HEAL_MANA_COST'), 'must reference PRIEST_HEAL_MANA_COST')
  assert.ok(gameData.includes('cooldown: PRIEST_HEAL_COOLDOWN'), 'must reference PRIEST_HEAL_COOLDOWN')
  assert.ok(gameData.includes('range: PRIEST_HEAL_RANGE'), 'must reference PRIEST_HEAL_RANGE')

  // Verify constant values are as expected
  assert.equal(healAmount, 25)
  assert.equal(healManaCost, 5)
  assert.equal(healCooldown, 2.0)
  assert.equal(healRange, 4.0)
})

test('DS-4: Game.ts castHeal is compatible with current migration stage', () => {
  const castHealIdx = game.indexOf('castHeal(priest: Unit, target: Unit): boolean')
  assert.ok(castHealIdx >= 0, 'castHeal must exist')
  const castHealBody = game.slice(castHealIdx, castHealIdx + 1200)

  if (castHealBody.includes('ABILITIES.priest_heal')) {
    assert.ok(castHealBody.includes('healDef.cost.mana'), 'migrated castHeal must read ability mana cost')
    assert.ok(castHealBody.includes('healDef.cooldown'), 'migrated castHeal must read ability cooldown')
    assert.ok(castHealBody.includes('healDef.effectValue'), 'migrated castHeal must read ability effect value')
    assert.ok(castHealBody.includes('healDef.range'), 'migrated castHeal must read ability range')
  } else {
    assert.ok(castHealBody.includes('PRIEST_HEAL_MANA_COST'), 'seed-only castHeal must still use PRIEST_HEAL_MANA_COST')
    assert.ok(castHealBody.includes('PRIEST_HEAL_COOLDOWN'), 'seed-only castHeal must still use PRIEST_HEAL_COOLDOWN')
    assert.ok(castHealBody.includes('PRIEST_HEAL_AMOUNT'), 'seed-only castHeal must still use PRIEST_HEAL_AMOUNT')
    assert.ok(castHealBody.includes('PRIEST_HEAL_RANGE'), 'seed-only castHeal must still use PRIEST_HEAL_RANGE')
  }
})

test('DS-5: runtime code does not couple to AbilityDef type internals', () => {
  assert.ok(!game.includes('AbilityDef'), 'Game.ts must not reference AbilityDef')
  assert.equal((gameData.match(/priest_heal:/g) ?? []).length, 1, 'GameData must define one priest_heal seed')
})
