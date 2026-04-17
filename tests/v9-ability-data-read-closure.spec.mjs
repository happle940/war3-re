/**
 * V9 HN3-CLOSE9 Ability Data-Read Closure Inventory
 *
 * Static proof that HN3 ability data-read migration is complete:
 *
 * 1. ABILITIES.priest_heal, rally_call, mortar_aoe all exist in GameData.ts
 * 2. Game.ts runtime / UI paths read from ABILITIES
 * 3. Game.ts no longer reads RALLY_CALL_* / PRIEST_HEAL_* / MORTAR_AOE_* constants
 * 4. HN3 docs do not promise new skills, units, heroes, items, or complete systems
 */
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { test } from 'node:test'

const gameData = readFileSync(new URL('../src/game/GameData.ts', import.meta.url), 'utf8')
const game = readFileSync(new URL('../src/game/Game.ts', import.meta.url), 'utf8')
const packet = readFileSync(new URL('../docs/V9_ABILITY_NUMERIC_MODEL_PACKET.zh-CN.md', import.meta.url), 'utf8')
const expansion = readFileSync(new URL('../docs/V9_HUMAN_NUMERIC_EXPANSION_PACKET.zh-CN.md', import.meta.url), 'utf8')

test('CLOSE-1: all three ABILITIES seeds exist in GameData.ts', () => {
  assert.ok(gameData.includes('priest_heal:'), 'GameData.ts must have ABILITIES.priest_heal')
  assert.ok(gameData.includes('rally_call:'), 'GameData.ts must have ABILITIES.rally_call')
  assert.ok(gameData.includes('mortar_aoe:'), 'GameData.ts must have ABILITIES.mortar_aoe')
})

test('CLOSE-2: Game.ts runtime / UI reads ABILITIES for all three samples', () => {
  // Priest Heal runtime
  assert.ok(game.includes('ABILITIES.priest_heal'), 'Game.ts must read ABILITIES.priest_heal')
  // Rally Call runtime + UI
  assert.ok(game.includes('ABILITIES.rally_call'), 'Game.ts must read ABILITIES.rally_call')
  // Mortar AOE runtime
  assert.ok(game.includes('ABILITIES.mortar_aoe'), 'Game.ts must read ABILITIES.mortar_aoe')
})

test('CLOSE-3: Game.ts no longer reads legacy ability constants as runtime/UI source', () => {
  // These constants must NOT appear anywhere in Game.ts
  const forbidden = [
    'RALLY_CALL_DURATION',
    'RALLY_CALL_COOLDOWN',
    'RALLY_CALL_RADIUS',
    'RALLY_CALL_DAMAGE_BONUS',
    'PRIEST_HEAL_AMOUNT',
    'PRIEST_HEAL_MANA_COST',
    'PRIEST_HEAL_COOLDOWN',
    'PRIEST_HEAL_RANGE',
    'MORTAR_AOE_RADIUS',
    'MORTAR_AOE_FALLOFF',
  ]
  for (const constant of forbidden) {
    assert.ok(!game.includes(constant), `Game.ts must not reference ${constant}`)
  }
})

test('CLOSE-4: HN3 docs do not promise new skills, units, heroes, items, or complete systems', () => {
  // The packet must explicitly block new gameplay scope expansion
  assert.ok(packet.includes('Sorceress'), 'packet must mention Sorceress as blocked')
  assert.ok(packet.includes('Spell Breaker'), 'packet must mention Spell Breaker as blocked')
  assert.ok(packet.includes('英雄'), 'packet must mention heroes as blocked')
  assert.ok(packet.includes('物品'), 'packet must mention items as blocked')
  assert.ok(packet.includes('buff/debuff'), 'packet must block complete buff/debuff system')

  // The expansion packet must point next work to HN4 branch, not unbounded expansion
  assert.ok(expansion.includes('V9-HN4'), 'expansion must reference HN4 as next branch')
  assert.ok(expansion.includes('不建议第一张就做'), 'expansion must constrain early HN4 choices')
})
