/**
 * V9 HN3-DATA5 Mortar AOE Ability Data Seed Proof
 *
 * Static proof that verifies:
 * 1. ABILITIES.mortar_aoe exists with all required fields.
 * 2. Mortar AOE data references existing MORTAR_AOE_* constants and unit data.
 * 3. Game.ts keeps the existing splash filters while either staying seed-only or reading ABILITIES.mortar_aoe after Task140.
 * 4. HN3 docs reflect that all three current samples have data seeds, with Mortar AOE runtime migration recorded after Task140.
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

test('MAOE-1: ABILITIES.mortar_aoe exists with required passive AOE fields', () => {
  const body = extractObjectBody(gameData, 'mortar_aoe:')
  const required = [
    "key: 'mortar_aoe'",
    "name: '迫击炮溅射'",
    "ownerType: 'mortar_team'",
    'cost: {}',
    'cooldown: UNITS.mortar_team.attackCooldown',
    'range: MORTAR_AOE_RADIUS',
    "teams: 'enemy'",
    'alive: true',
    "excludeTypes: ['building', 'primaryTarget', 'attacker']",
    "includeCondition: 'within_aoe_radius'",
    "effectType: 'passiveAoeSplashFalloffDamage'",
    'effectValue: UNITS.mortar_team.attackDamage',
    'duration: 0',
    "stackingRule: 'none'",
    'aoeRadius: MORTAR_AOE_RADIUS',
    'aoeFalloff: MORTAR_AOE_FALLOFF',
  ]

  for (const snippet of required) {
    assert.ok(body.includes(snippet), `mortar_aoe must include ${snippet}`)
  }
})

test('MAOE-2: Mortar AOE data references existing constants instead of hardcoded AOE values', () => {
  assert.equal(extractConstNumber(gameData, 'MORTAR_AOE_RADIUS'), 2.0)
  assert.equal(extractConstNumber(gameData, 'MORTAR_AOE_FALLOFF'), 0.5)

  const body = extractObjectBody(gameData, 'mortar_aoe:')
  assert.ok(!body.includes('range: 2.0'), 'range must not be hardcoded')
  assert.ok(!body.includes('aoeRadius: 2.0'), 'aoe radius must not be hardcoded')
  assert.ok(!body.includes('aoeFalloff: 0.5'), 'aoe falloff must not be hardcoded')
  assert.ok(!body.includes('effectValue: 42'), 'effect value must come from existing unit data')
  assert.ok(!body.includes('cooldown: 2.5'), 'cooldown must come from existing unit data')
})

test('MAOE-3: Game.ts keeps Mortar AOE filters and uses the current stage data source', () => {
  const body = extractObjectBody(game, 'dealAoeSplash(attacker: Unit, primaryTarget: Unit, rawDamage: number, atkType: AttackType)')
  assert.ok(body.includes('unit.team === attacker.team'), 'runtime still filters same-team units')
  assert.ok(body.includes('unit.hp <= 0'), 'runtime still filters dead units')
  assert.ok(body.includes("unit.type === 'goldmine'"), 'runtime still filters goldmines')

  if (game.includes('ABILITIES.mortar_aoe')) {
    assert.ok(game.includes('atkType === AttackType.Siege'), 'runtime still triggers from Siege attack type')
    assert.ok(game.includes('ABILITIES.mortar_aoe.aoeRadius'), 'runtime trigger must read ability radius')
    assert.ok(body.includes('const ma = ABILITIES.mortar_aoe'), 'runtime must bind mortar ability data')
    assert.ok(body.includes('const aoeRadius = ma.aoeRadius'), 'runtime must read migrated AOE radius')
    assert.ok(body.includes('const aoeFalloff = ma.aoeFalloff'), 'runtime must read migrated AOE falloff')
    assert.ok(body.includes('dist > aoeRadius'), 'runtime must use migrated radius boundary')
    assert.ok(body.includes('1.0 - aoeFalloff'), 'runtime must use migrated falloff')
    return
  }

  assert.ok(game.includes('atkType === AttackType.Siege && MORTAR_AOE_RADIUS > 0'), 'seed-only runtime triggers from Siege attack type')
  assert.ok(body.includes('MORTAR_AOE_RADIUS'), 'seed-only runtime reads legacy radius constant')
  assert.ok(body.includes('MORTAR_AOE_FALLOFF'), 'seed-only runtime reads legacy falloff constant')
})

test('MAOE-4: HN3 packet reflects Mortar AOE seed without opening new gameplay', () => {
  assert.ok(packet.includes('Task 138 已在 `GameData.ts` 落盘 `ABILITIES.mortar_aoe` 数据种子'))
  assert.ok(packet.includes('Priest Heal、Rally Call 和 Mortar AOE 数据种子已落盘到 GameData.ts。'))
  assert.ok(packet.includes('Task 140 已把 Mortar AOE runtime 迁移为读取 `ABILITIES.mortar_aoe`'))
  assert.ok(!packet.includes('| Mortar AOE | 未落盘 |'), 'packet must not retain stale Mortar AOE unseeded row')
  assert.ok(packet.includes('不能顺手新增 Sorceress、Spell Breaker、英雄、物品或完整 buff/projectile 系统'))
})
