/**
 * V9 HN7-DATA3 Iron Forged Swords Level 1 data seed proof.
 *
 * Static proof that the first Human melee upgrade is data-seeded only.
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
const sourcePacket = readFileSync(
  new URL('../docs/V9_HN7_MELEE_UPGRADE_SOURCE_PACKET.zh-CN.md', import.meta.url),
  'utf8',
)

const researchMatch = gameData.match(/iron_forged_swords:\s*\{[\s\S]*?\n\s{2}\},/)
const researchBlock = researchMatch?.[0] ?? ''

test('MELEE-DATA-1: iron_forged_swords research data exists', () => {
  assert.ok(researchMatch, 'iron_forged_swords research block must exist')
  assert.ok(researchBlock.includes("key: 'iron_forged_swords'"), 'key must match source packet')
  assert.ok(researchBlock.includes("name: '铁剑'"), 'display name must be Chinese and stable')
})

test('MELEE-DATA-2: source packet cost and time are used exactly', () => {
  assert.ok(sourcePacket.includes('cost: 100 gold / 50 lumber'), 'source packet must state cost')
  assert.ok(researchBlock.includes('cost: { gold: 100, lumber: 50 }'), 'GameData cost must match source packet')
  assert.ok(sourcePacket.includes('researchTime: 60'), 'source packet must state time')
  assert.ok(researchBlock.includes('researchTime: 60'), 'GameData time must match source packet')
})

test('MELEE-DATA-3: research requires Blacksmith and has no ordered prerequisite', () => {
  assert.ok(researchBlock.includes("requiresBuilding: 'blacksmith'"), 'must require Blacksmith')
  assert.ok(!researchBlock.includes('prerequisiteResearch'), 'Level 1 must not require a prior research')
})

test('MELEE-DATA-4: current melee units get attackDamage +1', () => {
  for (const unit of ['footman', 'militia', 'knight']) {
    const expected = `{ type: ResearchEffectType.FlatDelta, targetUnitType: '${unit}', stat: 'attackDamage', value: 1 }`
    assert.ok(researchBlock.includes(expected), `${unit} must receive attackDamage +1`)
  }
})

test('MELEE-DATA-5: non-melee current units are not affected', () => {
  for (const unit of ['rifleman', 'mortar_team', 'priest', 'sorceress', 'worker']) {
    assert.ok(!researchBlock.includes(`targetUnitType: '${unit}'`), `${unit} must not be affected`)
  }
})

test('MELEE-DATA-6: Blacksmith exposes Long Rifles and all melee upgrades', () => {
  assert.ok(
    gameData.includes("researches: ['long_rifles', 'iron_forged_swords', 'steel_forged_swords', 'mithril_forged_swords']"),
    'blacksmith research list must expose all four researches',
  )
})

test('MELEE-DATA-7: Long Rifles data remains unchanged', () => {
  const longRiflesMatch = gameData.match(/long_rifles:\s*\{[\s\S]*?\n\s*\},\n\s*iron_forged_swords:/)
  assert.ok(longRiflesMatch, 'long_rifles block must still precede iron_forged_swords')
  const body = longRiflesMatch[0]
  assert.ok(body.includes("cost: { gold: 175, lumber: 50 }"), 'Long Rifles cost unchanged')
  assert.ok(body.includes('researchTime: 20'), 'Long Rifles time unchanged')
  assert.ok(body.includes("targetUnitType: 'rifleman'"), 'Long Rifles still affects Rifleman')
  assert.ok(body.includes("stat: 'attackRange'"), 'Long Rifles still changes attackRange')
  assert.ok(body.includes('value: 1.5'), 'Long Rifles range value unchanged')
})

test('MELEE-DATA-8: unrelated branches are still absent', () => {
  for (const forbidden of [
    'ranged_upgrade',
    'armor_upgrade',
    'animal_war_training',
  ]) {
    assert.ok(!gameData.includes(forbidden), `${forbidden} must not be added by DATA4`)
  }
})

test('MELEE-DATA-9: runtime code was not specialized for iron_forged_swords', () => {
  assert.ok(!game.includes('iron_forged_swords'), 'Game.ts must not contain Iron Forged Swords special cases')
})

test('MELEE-DATA-10: source packet still blocks higher-level extrapolation', () => {
  assert.ok(sourcePacket.includes('不写入 Steel Forged Swords'), 'Steel remains blocked')
  assert.ok(sourcePacket.includes('不写入 Mithril Forged Swords'), 'Mithril remains blocked')
  assert.ok(sourcePacket.includes('不伪造二、三级成本和时间'), 'later-level values must not be fabricated')
})
