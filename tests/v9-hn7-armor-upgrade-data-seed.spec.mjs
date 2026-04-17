/**
 * V9 HN7-DATA6 Plating armor upgrade data seed proof.
 *
 * Static proof that Plating armor upgrade data is correctly seeded and bounded.
 */
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { test } from 'node:test'

const gameData = readFileSync(new URL('../src/game/GameData.ts', import.meta.url), 'utf8')
const game = readFileSync(new URL('../src/game/Game.ts', import.meta.url), 'utf8')
const sourcePacket = readFileSync(
  new URL('../docs/V9_HN7_ARMOR_UPGRADE_SOURCE_PACKET.zh-CN.md', import.meta.url),
  'utf8',
)

function researchBlock(key) {
  const match = gameData.match(new RegExp(`${key}:\\s*\\{[\\s\\S]*?\\n\\s{2}\\},`))
  return match?.[0] ?? ''
}

// ── Data exists with correct values ──────────────────────

test('ARMOR-DATA6-1: Iron Plating data matches SRC6', () => {
  const block = researchBlock('iron_plating')
  for (const expected of [
    "key: 'iron_plating'",
    "name: '铁甲'",
    'cost: { gold: 125, lumber: 75 }',
    'researchTime: 60',
    "requiresBuilding: 'blacksmith'",
  ]) {
    assert.ok(block.includes(expected), `${expected} must be present`)
  }
  // No prerequisiteResearch for Level 1
  assert.ok(!block.includes('prerequisiteResearch'), 'Iron Plating must have no prerequisite')
  // Effects: footman, militia, knight armor +2
  for (const unit of ['footman', 'militia', 'knight']) {
    assert.ok(
      block.includes(`targetUnitType: '${unit}', stat: 'armor', value: 2`),
      `${unit} must get armor +2`,
    )
  }
})

test('ARMOR-DATA6-2: Steel Plating data matches SRC6', () => {
  const block = researchBlock('steel_plating')
  for (const expected of [
    "key: 'steel_plating'",
    "name: '钢甲'",
    'cost: { gold: 150, lumber: 175 }',
    'researchTime: 75',
    "requiresBuilding: 'keep'",
    "prerequisiteResearch: 'iron_plating'",
  ]) {
    assert.ok(block.includes(expected), `${expected} must be present`)
  }
  for (const unit of ['footman', 'militia', 'knight']) {
    assert.ok(
      block.includes(`targetUnitType: '${unit}', stat: 'armor', value: 2`),
      `${unit} must get armor +2`,
    )
  }
})

test('ARMOR-DATA6-3: Mithril Plating data matches SRC6', () => {
  const block = researchBlock('mithril_plating')
  for (const expected of [
    "key: 'mithril_plating'",
    "name: '秘银甲'",
    'cost: { gold: 175, lumber: 275 }',
    'researchTime: 90',
    "requiresBuilding: 'castle'",
    "prerequisiteResearch: 'steel_plating'",
  ]) {
    assert.ok(block.includes(expected), `${expected} must be present`)
  }
  for (const unit of ['footman', 'militia', 'knight']) {
    assert.ok(
      block.includes(`targetUnitType: '${unit}', stat: 'armor', value: 2`),
      `${unit} must get armor +2`,
    )
  }
})

// ── No out-of-scope effects ──────────────────────────────

test('ARMOR-DATA6-4: no Plating effects on non-Heavy units', () => {
  for (const key of ['iron_plating', 'steel_plating', 'mithril_plating']) {
    const block = researchBlock(key)
    for (const forbidden of [
      'rifleman', 'mortar_team', 'priest', 'sorceress', 'worker',
      'siege_engine', 'flying_machine', 'spell_breaker',
    ]) {
      assert.ok(!block.includes(`targetUnitType: '${forbidden}'`), `${key} must not affect ${forbidden}`)
    }
  }
})

// ── No Leather Armor / AWT data ──────────────────────────

test('ARMOR-DATA6-5: Leather Armor and AWT remain absent', () => {
  for (const forbidden of [
    'studded_leather', 'reinforced_leather', 'dragonhide',
    'animal_war_training',
  ]) {
    assert.ok(!gameData.includes(forbidden), `${forbidden} must not exist`)
  }
})

// ── Blacksmith research list ─────────────────────────────

test('ARMOR-DATA6-6: Blacksmith exposes all research lines', () => {
  const blacksmith = gameData.match(/blacksmith:\s*\{[\s\S]*?\n\s{2}\},/)?.[0] ?? ''
  // Long Rifles
  assert.ok(blacksmith.includes("'long_rifles'"), 'Long Rifles must remain')
  // Melee chain
  for (const key of ['iron_forged_swords', 'steel_forged_swords', 'mithril_forged_swords']) {
    assert.ok(blacksmith.includes(`'${key}'`), `${key} must remain`)
  }
  // Ranged chain
  for (const key of ['black_gunpowder', 'refined_gunpowder', 'imbued_gunpowder']) {
    assert.ok(blacksmith.includes(`'${key}'`), `${key} must remain`)
  }
  // Plating chain
  for (const key of ['iron_plating', 'steel_plating', 'mithril_plating']) {
    assert.ok(blacksmith.includes(`'${key}'`), `${key} must be added`)
  }
})

// ── Game.ts no special cases ─────────────────────────────

test('ARMOR-DATA6-7: Game.ts has no Plating special cases', () => {
  for (const key of ['iron_plating', 'steel_plating', 'mithril_plating']) {
    assert.ok(!game.includes(key), `${key} must remain data-driven`)
  }
})

// ── Source packet alignment ──────────────────────────────

test('ARMOR-DATA6-8: data values align with source packet', () => {
  const checks = [
    ['iron_plating', 'cost: 125 gold / 75 lumber', 'researchTime: 60', 'requiresBuilding: blacksmith', null],
    ['steel_plating', 'cost: 150 gold / 175 lumber', 'researchTime: 75', 'requiresBuilding: keep', 'prerequisiteResearch: iron_plating'],
    ['mithril_plating', 'cost: 175 gold / 275 lumber', 'researchTime: 90', 'requiresBuilding: castle', 'prerequisiteResearch: steel_plating'],
  ]
  for (const [key, costStr, timeStr, buildingStr, prereqStr] of checks) {
    const block = researchBlock(key)
    assert.ok(sourcePacket.includes(`key: ${key}`), `source packet must name ${key}`)
    assert.ok(sourcePacket.includes(costStr), `source packet must contain ${costStr}`)
    assert.ok(sourcePacket.includes(timeStr), `source packet must contain ${timeStr}`)
    assert.ok(sourcePacket.includes(buildingStr), `source packet must contain ${buildingStr}`)
    assert.ok(block.includes(`key: '${key}'`), `${key} must be seeded`)
    if (prereqStr) {
      assert.ok(sourcePacket.includes(prereqStr), `source packet must contain ${prereqStr}`)
      assert.ok(block.includes(prereqStr.replace(': ', ": '") + "'"), `${key} must keep ordered prerequisite`)
    } else {
      assert.ok(sourcePacket.includes('prerequisiteResearch: none'), 'source packet must declare Level 1 has no prerequisite')
      assert.ok(!block.includes('prerequisiteResearch'), `${key} must not have an ordered prerequisite`)
    }
  }
})

// ── Melee / ranged / Long Rifles intact ──────────────────

test('ARMOR-DATA6-9: existing research data remains intact', () => {
  for (const key of ['long_rifles', 'iron_forged_swords', 'black_gunpowder']) {
    const block = researchBlock(key)
    assert.ok(block.length > 0, `${key} must still exist`)
  }
})
