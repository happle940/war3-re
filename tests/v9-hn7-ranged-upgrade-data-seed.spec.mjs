/**
 * V9 HN7-DATA5 ranged weapon upgrade data seed proof.
 *
 * Static proof that Human Gunpowder upgrades are data-seeded only.
 */
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { test } from 'node:test'

const gameData = readFileSync(new URL('../src/game/GameData.ts', import.meta.url), 'utf8')
const game = readFileSync(new URL('../src/game/Game.ts', import.meta.url), 'utf8')
const sourcePacket = readFileSync(
  new URL('../docs/V9_HN7_RANGED_UPGRADE_SOURCE_PACKET.zh-CN.md', import.meta.url),
  'utf8',
)

function researchBlock(key) {
  const match = gameData.match(new RegExp(`${key}:\\s*\\{[\\s\\S]*?\\n\\s{2}\\},`))
  return match?.[0] ?? ''
}

const blackBlock = researchBlock('black_gunpowder')
const refinedBlock = researchBlock('refined_gunpowder')
const imbuedBlock = researchBlock('imbued_gunpowder')

test('RANGED-DATA5-1: Black / Refined / Imbued Gunpowder data exists', () => {
  assert.ok(blackBlock.includes("key: 'black_gunpowder'"))
  assert.ok(blackBlock.includes("name: '黑火药'"))
  assert.ok(refinedBlock.includes("key: 'refined_gunpowder'"))
  assert.ok(refinedBlock.includes("name: '精炼火药'"))
  assert.ok(imbuedBlock.includes("key: 'imbued_gunpowder'"))
  assert.ok(imbuedBlock.includes("name: '附魔火药'"))
})

test('RANGED-DATA5-2: Black Gunpowder values match SRC5', () => {
  assert.ok(sourcePacket.includes('key: black_gunpowder'))
  assert.ok(sourcePacket.includes('cost: 100 gold / 50 lumber'))
  assert.ok(sourcePacket.includes('researchTime: 60'))
  assert.ok(blackBlock.includes('cost: { gold: 100, lumber: 50 }'))
  assert.ok(blackBlock.includes('researchTime: 60'))
  assert.ok(blackBlock.includes("requiresBuilding: 'blacksmith'"))
  assert.ok(!blackBlock.includes('prerequisiteResearch'), 'Black Gunpowder is the first tier')
})

test('RANGED-DATA5-3: Refined Gunpowder values and ordered prerequisite match SRC5', () => {
  assert.ok(sourcePacket.includes('key: refined_gunpowder'))
  assert.ok(sourcePacket.includes('cost: 175 gold / 175 lumber'))
  assert.ok(sourcePacket.includes('researchTime: 75'))
  assert.ok(refinedBlock.includes('cost: { gold: 175, lumber: 175 }'))
  assert.ok(refinedBlock.includes('researchTime: 75'))
  assert.ok(refinedBlock.includes("requiresBuilding: 'keep'"))
  assert.ok(refinedBlock.includes("prerequisiteResearch: 'black_gunpowder'"))
})

test('RANGED-DATA5-4: Imbued Gunpowder values and ordered prerequisite match SRC5', () => {
  assert.ok(sourcePacket.includes('key: imbued_gunpowder'))
  assert.ok(sourcePacket.includes('cost: 250 gold / 300 lumber'))
  assert.ok(sourcePacket.includes('researchTime: 90'))
  assert.ok(imbuedBlock.includes('cost: { gold: 250, lumber: 300 }'))
  assert.ok(imbuedBlock.includes('researchTime: 90'))
  assert.ok(imbuedBlock.includes("requiresBuilding: 'castle'"))
  assert.ok(imbuedBlock.includes("prerequisiteResearch: 'refined_gunpowder'"))
})

test('RANGED-DATA5-5: each tier uses incremental +1 effects for current ranged units', () => {
  for (const [label, block] of [
    ['Black', blackBlock],
    ['Refined', refinedBlock],
    ['Imbued', imbuedBlock],
  ]) {
    for (const unit of ['rifleman', 'mortar_team']) {
      const expected = `{ type: ResearchEffectType.FlatDelta, targetUnitType: '${unit}', stat: 'attackDamage', value: 1 }`
      assert.ok(block.includes(expected), `${label} must add +1 attackDamage to ${unit}`)
    }
    assert.ok(!block.includes('value: 2'), `${label} must not encode dice bonus 2 as flat delta`)
    assert.ok(!block.includes('value: 3'), `${label} must not encode dice bonus 3 as flat delta`)
  }
})

test('RANGED-DATA5-6: unavailable War3 units are not seeded as effect targets', () => {
  for (const block of [blackBlock, refinedBlock, imbuedBlock]) {
    assert.ok(!block.includes("targetUnitType: 'siege_engine'"))
    assert.ok(!block.includes("targetUnitType: 'flying_machine'"))
  }
})

test('RANGED-DATA5-7: Blacksmith exposes Long Rifles, melee chain, and ranged chain', () => {
  assert.ok(
    gameData.includes(
      "researches: ['long_rifles', 'iron_forged_swords', 'steel_forged_swords', 'mithril_forged_swords', 'black_gunpowder', 'refined_gunpowder', 'imbued_gunpowder']",
    ),
  )
})

test('RANGED-DATA5-8: melee chain and Long Rifles remain intact', () => {
  for (const key of ['long_rifles', 'iron_forged_swords', 'steel_forged_swords', 'mithril_forged_swords']) {
    assert.ok(gameData.includes(`key: '${key}'`), `${key} must remain after DATA5`)
  }
})

test('RANGED-DATA5-9: runtime code has no Gunpowder special cases', () => {
  for (const key of ['black_gunpowder', 'refined_gunpowder', 'imbued_gunpowder']) {
    assert.ok(!game.includes(key), `${key} must remain data-driven`)
  }
})

test('RANGED-DATA5-10: unrelated HN7 branches are still absent', () => {
  for (const forbidden of [
    'animal_war_training',
    'steel_plating',
    'mithril_plating',
    'dragonhide_armor',
    'siege_engine',
    'flying_machine',
    'paladin',
    'archmage',
  ]) {
    assert.ok(!gameData.includes(forbidden), `${forbidden} must not be added by DATA5`)
  }
})
