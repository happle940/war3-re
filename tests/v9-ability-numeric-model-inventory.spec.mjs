import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { test } from 'node:test'

const gameData = readFileSync(new URL('../src/game/GameData.ts', import.meta.url), 'utf8')
const game = readFileSync(new URL('../src/game/Game.ts', import.meta.url), 'utf8')
const packet = readFileSync(new URL('../docs/V9_ABILITY_NUMERIC_MODEL_PACKET.zh-CN.md', import.meta.url), 'utf8')

function includesAll(text, required, label) {
  for (const item of required) {
    assert.ok(text.includes(item), `${label} missing ${item}`)
  }
}

function match(text, pattern, label) {
  assert.match(text, pattern, label)
}

test('ANM-1: current source exposes the three ability/effect numeric samples', () => {
  includesAll(gameData, [
    'export const PRIEST_HEAL_AMOUNT = 25',
    'export const PRIEST_HEAL_MANA_COST = 5',
    'export const PRIEST_HEAL_COOLDOWN = 2.0',
    'export const PRIEST_HEAL_RANGE = 4.0',
    'export const RALLY_CALL_DURATION = 8',
    'export const RALLY_CALL_COOLDOWN = 30',
    'export const RALLY_CALL_RADIUS = 6.0',
    'export const RALLY_CALL_DAMAGE_BONUS = 5',
    'export const MORTAR_AOE_RADIUS = 2.0',
    'export const MORTAR_AOE_FALLOFF = 0.5',
    'attackType: AttackType.Siege',
  ], 'GameData.ts')
})

test('ANM-2: Priest Heal implementation covers cost, cooldown, range, target rule, and effect value', () => {
  includesAll(game, [
    'castHeal(priest: Unit, target: Unit): boolean',
    'const healDef = ABILITIES.priest_heal',
    "priest.type !== 'priest'",
    'target.team !== priest.team',
    'const manaCost = healDef.cost.mana ?? 0',
    'priest.mana < manaCost',
    'this.gameTime < priest.healCooldownUntil',
    'target.hp <= 0 || target.hp >= target.maxHp',
    'healDef.range',
    'priest.mana -= manaCost',
    'priest.healCooldownUntil = this.gameTime + healDef.cooldown',
    'target.hp = Math.min(target.maxHp, target.hp + healDef.effectValue)',
  ], 'Game.ts Priest Heal')
})

test('ANM-3: Rally Call and Mortar AOE implementations expose duration, filters, and effect rules', () => {
  includesAll(game, [
    'triggerRallyCall(source: Unit): boolean',
    'source.isBuilding || source.team !== 0',
    'this.gameTime < source.rallyCallCooldownUntil',
    'const rc = ABILITIES.rally_call',
    'rc.duration',
    'rc.range',
    'u.team !== source.team || u.isBuilding || u.hp <= 0',
    'u.rallyCallBoostUntil = buffEnd',
    'source.rallyCallCooldownUntil = now + rc.cooldown',
    'ABILITIES.rally_call.effectValue',
    'private dealAoeSplash(attacker: Unit, primaryTarget: Unit, rawDamage: number, atkType: AttackType)',
    'const ma = ABILITIES.mortar_aoe',
    'const aoeRadius = ma.aoeRadius',
    'const aoeFalloff = ma.aoeFalloff',
    'unit.team === attacker.team',
    "unit.type === 'goldmine'",
    'dist > aoeRadius',
    '1.0 - aoeFalloff',
    'rawDamage * falloff * typeMultiplier',
  ], 'Game.ts Rally Call / Mortar AOE')
})

test('ANM-4: HN3 packet maps each sample to the same minimal ability/effect fields', () => {
  includesAll(packet, [
    'Priest Heal（治疗）',
    'Rally Call（集结号令）',
    'Mortar AOE（攻城溅射）',
    'key',
    'ownerType',
    'cost',
    'cooldown',
    'range',
    'targetRule',
    'effectType',
    'effectValue',
    'duration',
    'stackingRule',
    'flatHeal',
    'flatDamageBonus',
    'aoeSplashDamage',
  ], 'HN3 packet')

  match(packet, /Priest Heal[\s\S]*PRIEST_HEAL_MANA_COST[\s\S]*PRIEST_HEAL_COOLDOWN[\s\S]*PRIEST_HEAL_RANGE[\s\S]*PRIEST_HEAL_AMOUNT/, 'Priest Heal mapping is incomplete')
  match(packet, /Rally Call[\s\S]*RALLY_CALL_COOLDOWN[\s\S]*RALLY_CALL_RADIUS[\s\S]*RALLY_CALL_DAMAGE_BONUS[\s\S]*RALLY_CALL_DURATION/, 'Rally Call mapping is incomplete')
  match(packet, /Mortar AOE[\s\S]*AttackType\.Siege[\s\S]*MORTAR_AOE_RADIUS[\s\S]*MORTAR_AOE_FALLOFF[\s\S]*enemy/, 'Mortar AOE mapping is incomplete')
})

test('ANM-5: HN3 packet explicitly blocks new gameplay and points the next task to migration', () => {
  includesAll(packet, [
    '不改运行时代码',
    '不新增能力',
    '不实现完整 ability 系统',
    '新增 Sorceress / Spell Breaker',
    '新增英雄 / 物品 / 召唤物',
    '新增 buff/debuff 运行时系统',
    '修改当前三个样本的运行时行为',
    'HN3 后续第一张实现任务必须是',
    'Priest Heal** 最适合先迁移',
  ], 'HN3 packet boundaries')
})
