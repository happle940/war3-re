/**
 * V9 HN3-DATA4 Rally Call Ability Data Seed Proof
 *
 * Static proof that verifies:
 * 1. ABILITIES.rally_call exists with all required fields.
 * 2. Rally Call data references existing RALLY_CALL_* constants.
 * 3. Game.ts still keeps current Rally Call runtime and does not read ABILITIES.rally_call.
 * 4. HN3 docs no longer claim Rally Call is unseeded.
 */
import { readFileSync } from 'node:fs'
import { test } from 'node:test'
import assert from 'node:assert/strict'

const gameData = readFileSync(new URL('../src/game/GameData.ts', import.meta.url), 'utf8')
const game = readFileSync(new URL('../src/game/Game.ts', import.meta.url), 'utf8')
const packet = readFileSync(new URL('../docs/V9_ABILITY_NUMERIC_MODEL_PACKET.zh-CN.md', import.meta.url), 'utf8')

function extractConstNumber(source, name) {
  const match = source.match(new RegExp(`export const ${name}\\s*=\\s*([0-9.]+)`))
  assert.ok(match, `${name} must exist`)
  return Number(match[1])
}

function extractObjectBody(source, label) {
  const start = source.indexOf(label)
  assert.ok(start >= 0, `${label} must exist`)
  const bodyStart = source.indexOf('{', start)
  assert.ok(bodyStart >= 0, `${label} must have object body`)
  let depth = 0
  for (let i = bodyStart; i < source.length; i += 1) {
    if (source[i] === '{') depth += 1
    if (source[i] === '}') depth -= 1
    if (depth === 0) return source.slice(bodyStart + 1, i)
  }
  assert.fail(`${label} body must close`)
}

test('RCALL-1: ABILITIES.rally_call exists with required fields', () => {
  const body = extractObjectBody(gameData, 'rally_call:')
  const required = [
    "key: 'rally_call'",
    "name: '集结号令'",
    "ownerType: 'player_non_building_unit'",
    'cost: {}',
    'cooldown: RALLY_CALL_COOLDOWN',
    'range: RALLY_CALL_RADIUS',
    "teams: 'ally'",
    'alive: true',
    "excludeTypes: ['building']",
    "effectType: 'flatDamageBonus'",
    'effectValue: RALLY_CALL_DAMAGE_BONUS',
    'duration: RALLY_CALL_DURATION',
    "stackingRule: 'refresh'",
  ]

  for (const snippet of required) {
    assert.ok(body.includes(snippet), `rally_call must include ${snippet}`)
  }
})

test('RCALL-2: Rally Call data references the existing constants and values', () => {
  assert.equal(extractConstNumber(gameData, 'RALLY_CALL_COOLDOWN'), 30)
  assert.equal(extractConstNumber(gameData, 'RALLY_CALL_RADIUS'), 6.0)
  assert.equal(extractConstNumber(gameData, 'RALLY_CALL_DAMAGE_BONUS'), 5)
  assert.equal(extractConstNumber(gameData, 'RALLY_CALL_DURATION'), 8)

  const body = extractObjectBody(gameData, 'rally_call:')
  assert.ok(!body.includes('cooldown: 30'), 'cooldown must not be hardcoded')
  assert.ok(!body.includes('range: 6.0'), 'range must not be hardcoded')
  assert.ok(!body.includes('effectValue: 5'), 'effect value must not be hardcoded')
  assert.ok(!body.includes('duration: 8'), 'duration must not be hardcoded')
})

test('RCALL-3: Game.ts is compatible with current Rally Call migration stage', () => {
  const body = extractObjectBody(game, 'triggerRallyCall(source: Unit): boolean')
  if (game.includes('ABILITIES.rally_call')) {
    assert.ok(body.includes('const rc = ABILITIES.rally_call'), 'migrated runtime must read rally_call data')
    assert.ok(body.includes('rc.duration'), 'migrated runtime must read duration from data')
    assert.ok(body.includes('rc.range'), 'migrated runtime must read range from data')
    assert.ok(body.includes('rc.cooldown'), 'migrated runtime must read cooldown from data')
    assert.ok(game.includes('rawDamage += ABILITIES.rally_call.effectValue'), 'migrated damage bonus must read effectValue from data')
  } else {
    assert.ok(body.includes('RALLY_CALL_DURATION'), 'seed-only runtime must still read RALLY_CALL_DURATION')
    assert.ok(body.includes('RALLY_CALL_RADIUS'), 'seed-only runtime must still read RALLY_CALL_RADIUS')
    assert.ok(body.includes('RALLY_CALL_COOLDOWN'), 'seed-only runtime must still read RALLY_CALL_COOLDOWN')
    assert.ok(game.includes('rawDamage += RALLY_CALL_DAMAGE_BONUS'), 'seed-only damage bonus must still come from current constant path')
  }
})

test('RCALL-4: HN3 packet reflects Rally Call seed without opening new gameplay', () => {
  assert.ok(packet.includes('Task 137 已在 `GameData.ts` 落盘 `ABILITIES.rally_call` 数据种子'))
  assert.ok(
    packet.includes('Rally Call runtime 仍保持现有 RALLY_CALL_* 常量读取') ||
      packet.includes('Rally Call runtime 已迁移为读取 ABILITIES.rally_call'),
    'packet must describe either Task137 seed-only state or later Task139 migrated state',
  )
  assert.ok(
    packet.includes('| Mortar AOE | 未落盘 |') || packet.includes('ABILITIES.mortar_aoe'),
    'packet must be compatible with either Task137-only or later Task138 state',
  )
  assert.ok(!packet.includes('Rally Call 和 Mortar AOE 尚未落盘'), 'packet must not retain stale Rally Call unseeded conclusion')
})
