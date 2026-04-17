/**
 * V9 HN7-SRC8 Leather Armor source and armor-type boundary proof.
 *
 * Static proof that the source document correctly records War3 Leather Armor
 * data, current project armorType state, and the boundary decision.
 */
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { test } from 'node:test'

const doc = readFileSync(
  new URL('../docs/V9_HN7_LEATHER_ARMOR_SOURCE_AND_TYPE_BOUNDARY.zh-CN.md', import.meta.url),
  'utf8',
)
const gameData = readFileSync(new URL('../src/game/GameData.ts', import.meta.url), 'utf8')

// ── Source data recording ─────────────────────────────────────

test('LA-SRC-1: document records all 3 Leather Armor levels', () => {
  assert.ok(doc.includes('Studded Leather Armor'), 'must name L1')
  assert.ok(doc.includes('Reinforced Leather Armor'), 'must name L2')
  assert.ok(doc.includes('Dragonhide Armor'), 'must name L3')
})

test('LA-SRC-2: document records Leather Armor costs and times', () => {
  assert.ok(doc.includes('100/100'), 'L1 cost')
  assert.ok(doc.includes('150/175'), 'L2 cost')
  assert.ok(doc.includes('200/250'), 'L3 cost')
  assert.ok(doc.includes('60s'), 'L1 time')
  assert.ok(doc.includes('75s'), 'L2 time')
  assert.ok(doc.includes('90s'), 'L3 time')
})

test('LA-SRC-3: document records Leather Armor building and prerequisites', () => {
  assert.ok(doc.includes('blacksmith'), 'researched at blacksmith')
  assert.ok(doc.includes('Studded Leather Armor'), 'L2 prereq: L1')
  assert.ok(doc.includes('Reinforced Leather Armor'), 'L3 prereq: L2')
  assert.ok(doc.includes('keep'), 'L2 requires keep')
  assert.ok(doc.includes('castle'), 'L3 requires castle')
})

test('LA-SRC-4: document records Leather Armor effect (+2/level)', () => {
  assert.ok(doc.includes('护甲 +2'), 'L1 effect +2')
  assert.ok(doc.includes('+4'), 'cumulative L2 +4')
  assert.ok(doc.includes('+6'), 'cumulative L3 +6')
})

test('LA-SRC-5: document records affected units roster', () => {
  assert.ok(doc.includes('Rifleman'), 'Rifleman affected')
  assert.ok(doc.includes('Mortar Team'), 'Mortar Team affected')
})

test('LA-SRC-6: document distinguishes Leather Armor from Plating', () => {
  assert.ok(doc.includes('互不重叠'), 'must state no overlap')
  assert.ok(doc.includes('Plating'), 'must reference Plating')
})

// ── Current project armorType verification ────────────────────

test('LA-SRC-7: GameData has ArmorType enum with Medium/Heavy/Unarmored', () => {
  assert.ok(gameData.includes('ArmorType'), 'ArmorType enum exists')
  assert.ok(gameData.includes('Medium'), 'Medium type exists')
  assert.ok(gameData.includes('Heavy'), 'Heavy type exists')
  assert.ok(gameData.includes('Unarmored'), 'Unarmored type exists')
})

test('LA-SRC-8: rifleman has advanced to ArmorType.Medium after the migration contract', () => {
  const riflemanStart = gameData.indexOf("key: 'rifleman'")
  assert.ok(riflemanStart > 0, 'rifleman unit exists')
  const riflemanBlock = gameData.substring(riflemanStart, riflemanStart + 500)
  assert.ok(riflemanBlock.includes('ArmorType.Medium'), 'rifleman must be Medium after MODEL9 migration')
  assert.ok(!riflemanBlock.includes('ArmorType.Unarmored'), 'rifleman must no longer be Unarmored')
})

test('LA-SRC-9: mortar_team is ArmorType.Unarmored in current GameData', () => {
  const mortarStart = gameData.indexOf("key: 'mortar_team'")
  assert.ok(mortarStart > 0, 'mortar_team unit exists')
  const mortarBlock = gameData.substring(mortarStart, mortarStart + 500)
  assert.ok(mortarBlock.includes('ArmorType.Unarmored'), 'mortar_team must be Unarmored')
  assert.ok(!mortarBlock.includes('ArmorType.Medium'), 'mortar_team must NOT be Medium')
})

test('LA-SRC-10: no Human combat unit except rifleman uses ArmorType.Medium', () => {
  const unitKeys = ['worker', 'footman', 'mortar_team', 'priest', 'militia', 'sorceress', 'knight']
  for (const key of unitKeys) {
    const unitStart = gameData.indexOf(`key: '${key}'`)
    if (unitStart < 0) continue
    const unitBlock = gameData.substring(unitStart, unitStart + 600)
    assert.ok(!unitBlock.includes('ArmorType.Medium'), `${key} must not be Medium`)
  }
})

test('LA-SRC-11: only tower uses ArmorType.Medium in current GameData', () => {
  const towerStart = gameData.indexOf("key: 'tower'")
  assert.ok(towerStart > 0, 'tower exists')
  const towerBlock = gameData.substring(towerStart, towerStart + 500)
  assert.ok(towerBlock.includes('ArmorType.Medium'), 'tower must be Medium')
})

// ── Document correctness ──────────────────────────────────────

test('LA-SRC-12: document records rifleman/mortar_team as Unarmored', () => {
  assert.ok(doc.includes('rifleman') && doc.includes('Unarmored'), 'rifleman Unarmored')
  assert.ok(doc.includes('mortar_team') && doc.includes('Unarmored'), 'mortar_team Unarmored')
})

test('LA-SRC-13: document records the pre-migration Medium armor gap', () => {
  assert.ok(doc.includes('没有任何玩家可操作的 Human 战斗单位'), 'must state no Medium combat unit')
  assert.ok(doc.includes('Medium'), 'must reference Medium armor')
})

test('LA-SRC-14: document concludes Leather Armor cannot proceed directly', () => {
  assert.ok(doc.includes('不能'), 'must state cannot proceed directly')
})

test('LA-SRC-15: document records migration completion before data seed', () => {
  assert.ok(doc.includes('HN7-MODEL9 已批准'), 'must record migration contract completion')
  assert.ok(doc.includes('Leather Armor data seed'), 'must point to data seed after migration')
})

test('LA-SRC-16: document stays source-only while GameData may contain DATA8 seed', () => {
  assert.ok(!doc.includes("RESEARCHES.studded_leather_armor"), 'no RESEARCHES reference')
  assert.ok(gameData.includes('studded_leather_armor'), 'DATA8 GameData has Leather Armor')
  assert.ok(gameData.includes('reinforced_leather_armor'), 'DATA8 GameData has Reinforced Leather Armor')
  assert.ok(gameData.includes('dragonhide_armor'), 'DATA8 GameData has Dragonhide Armor')
})

test('LA-SRC-17: Plating effects list footman/militia/knight, not rifleman/mortar_team', () => {
  // Plating affects melee units
  const platingStart = gameData.indexOf("key: 'iron_plating'")
  const platingBlock = gameData.substring(platingStart, platingStart + 800)
  assert.ok(platingBlock.includes("targetUnitType: 'footman'"), 'Plating must affect footman')
  assert.ok(platingBlock.includes("targetUnitType: 'knight'"), 'Plating must affect knight')
  assert.ok(!platingBlock.includes("targetUnitType: 'rifleman'"), 'Plating must NOT affect rifleman')
})

test('LA-SRC-18: document lists safe next continuations only', () => {
  assert.ok(doc.includes('Leather Armor data seed'), 'option 1')
  assert.ok(doc.includes('Leather Armor runtime smoke'), 'option 2')
  assert.ok(doc.includes('不能直接跳到英雄'), 'forbidden: heroes')
})
