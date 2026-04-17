/**
 * V9 HN7-DATA4 Steel / Mithril melee upgrade data seed proof.
 *
 * Static proof that higher-level Human melee upgrades are data-seeded only.
 */
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { test } from 'node:test'

const gameData = readFileSync(new URL('../src/game/GameData.ts', import.meta.url), 'utf8')
const game = readFileSync(new URL('../src/game/Game.ts', import.meta.url), 'utf8')
const sourcePacket = readFileSync(
  new URL('../docs/V9_HN7_MELEE_UPGRADE_SOURCE_PACKET.zh-CN.md', import.meta.url),
  'utf8',
)

function researchBlock(key) {
  const match = gameData.match(new RegExp(`${key}:\\s*\\{[\\s\\S]*?\\n\\s{2}\\},`))
  return match?.[0] ?? ''
}

const steelBlock = researchBlock('steel_forged_swords')
const mithrilBlock = researchBlock('mithril_forged_swords')

test('MELEE-DATA4-1: Steel and Mithril research data exists', () => {
  assert.ok(steelBlock.includes("key: 'steel_forged_swords'"), 'steel key must exist')
  assert.ok(steelBlock.includes("name: '钢剑'"), 'steel display name must exist')
  assert.ok(mithrilBlock.includes("key: 'mithril_forged_swords'"), 'mithril key must exist')
  assert.ok(mithrilBlock.includes("name: '秘银剑'"), 'mithril display name must exist')
})

test('MELEE-DATA4-2: Steel values match SRC4', () => {
  assert.ok(sourcePacket.includes('cost: 175 gold / 175 lumber'))
  assert.ok(sourcePacket.includes('researchTime: 75'))
  assert.ok(steelBlock.includes('cost: { gold: 175, lumber: 175 }'))
  assert.ok(steelBlock.includes('researchTime: 75'))
  assert.ok(steelBlock.includes("requiresBuilding: 'keep'"))
  assert.ok(steelBlock.includes("prerequisiteResearch: 'iron_forged_swords'"))
})

test('MELEE-DATA4-3: Mithril values match SRC4', () => {
  assert.ok(sourcePacket.includes('cost: 250 gold / 300 lumber'))
  assert.ok(sourcePacket.includes('researchTime: 90'))
  assert.ok(mithrilBlock.includes('cost: { gold: 250, lumber: 300 }'))
  assert.ok(mithrilBlock.includes('researchTime: 90'))
  assert.ok(mithrilBlock.includes("requiresBuilding: 'castle'"))
  assert.ok(mithrilBlock.includes("prerequisiteResearch: 'steel_forged_swords'"))
})

test('MELEE-DATA4-4: Steel and Mithril use incremental +1 effects', () => {
  for (const [label, block] of [['Steel', steelBlock], ['Mithril', mithrilBlock]]) {
    for (const unit of ['footman', 'militia', 'knight']) {
      const expected = `{ type: ResearchEffectType.FlatDelta, targetUnitType: '${unit}', stat: 'attackDamage', value: 1 }`
      assert.ok(block.includes(expected), `${label} must add +1 attackDamage to ${unit}`)
    }
    assert.ok(!block.includes('value: 2'), `${label} must not encode dice bonus 2 as a flat delta`)
    assert.ok(!block.includes('value: 3'), `${label} must not encode dice bonus 3 as a flat delta`)
  }
})

test('MELEE-DATA4-5: Blacksmith exposes Long Rifles and all melee weapon upgrades', () => {
  assert.ok(
    gameData.includes("researches: ['long_rifles', 'iron_forged_swords', 'steel_forged_swords', 'mithril_forged_swords']"),
    'blacksmith research list must expose Long Rifles, Iron, Steel, and Mithril',
  )
})

test('MELEE-DATA4-6: Level 1 remains unchanged', () => {
  const ironBlock = researchBlock('iron_forged_swords')
  assert.ok(ironBlock.includes('cost: { gold: 100, lumber: 50 }'))
  assert.ok(ironBlock.includes('researchTime: 60'))
  assert.ok(ironBlock.includes("requiresBuilding: 'blacksmith'"))
  assert.ok(!ironBlock.includes('prerequisiteResearch'), 'Iron must remain the first level')
})

test('MELEE-DATA4-7: unrelated branches are still absent', () => {
  for (const forbidden of [
    'ranged_upgrade',
    'armor_upgrade',
    'animal_war_training',
    'gryphon',
    'dragonhawk',
    'spell_breaker',
    'paladin',
    'archmage',
  ]) {
    assert.ok(!gameData.includes(forbidden), `${forbidden} must not be added by DATA4`)
  }
})

test('MELEE-DATA4-8: runtime code has no Steel / Mithril special case', () => {
  assert.ok(!game.includes('steel_forged_swords'), 'Game.ts must not special-case Steel')
  assert.ok(!game.includes('mithril_forged_swords'), 'Game.ts must not special-case Mithril')
})

test('MELEE-DATA4-9: SRC4 still documents the narrow DATA4 boundary', () => {
  assert.ok(sourcePacket.includes('允许下一张任务进入 `HN7-DATA4 — Steel / Mithril melee upgrade data seed`'))
  assert.ok(sourcePacket.includes('不修改 runtime'))
  assert.ok(sourcePacket.includes('不新增远程/护甲/AWT'))
  assert.ok(sourcePacket.includes('不新增英雄、空军、物品或素材'))
})

