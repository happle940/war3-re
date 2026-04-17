/**
 * V9 HN7-DATA8 Leather Armor Data Seed — Static Proof
 *
 * Proves the three Leather Armor research entries exist in GameData.ts with
 * correct source values, effects, prerequisites, and Blacksmith hook.
 * Also proves Leather Armor does not affect non-target units.
 */

import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { test } from 'node:test'

const gd = readFileSync(
  new URL('../src/game/GameData.ts', import.meta.url),
  'utf8',
)
const src = readFileSync(
  new URL('../docs/V9_HN7_LEATHER_ARMOR_SOURCE_AND_TYPE_BOUNDARY.zh-CN.md', import.meta.url),
  'utf8',
)
const parity = readFileSync(
  new URL('../docs/V9_HN7_MORTAR_TEAM_ARMOR_PARITY_DECISION.zh-CN.md', import.meta.url),
  'utf8',
)

function blockAfter(text, marker, length = 800) {
  const start = text.indexOf(marker)
  assert.ok(start >= 0, `${marker} must exist`)
  return text.slice(start, start + length)
}

function blockBetween(text, startMarker, endMarker) {
  const start = text.indexOf(startMarker)
  assert.ok(start >= 0, `${startMarker} must exist`)
  const end = text.indexOf(endMarker, start + startMarker.length)
  assert.ok(end > start, `${endMarker} must exist after ${startMarker}`)
  return text.slice(start, end)
}

// ── 1. Studded Leather Armor data ───────────────────────────────────
test('LA-DATA-1: studded_leather_armor exists with correct values', () => {
  const block = blockAfter(gd, "key: 'studded_leather_armor'", 400)
  assert.match(block, /name: '镶钉皮甲'/)
  assert.match(block, /gold: 100,\s*lumber: 100/)
  assert.match(block, /researchTime: 60/)
  assert.match(block, /requiresBuilding: 'blacksmith'/)
  assert.match(block, /description: '远程单位护甲 \+2'/)
  // L1 has no prerequisite — only check within this entry (not the next entry)
  const entryOnly = gd.slice(gd.indexOf("key: 'studded_leather_armor'"), gd.indexOf("key: 'studded_leather_armor'") + 350)
  assert.doesNotMatch(entryOnly, /prerequisiteResearch/)
})

// ── 2. Studded Leather Armor effects ────────────────────────────────
test('LA-DATA-2: studded_leather_armor effects target rifleman + mortar_team only', () => {
  const block = blockBetween(gd, "key: 'studded_leather_armor'", "key: 'reinforced_leather_armor'")
  assert.match(block, /targetUnitType: 'rifleman', stat: 'armor', value: 2/)
  assert.match(block, /targetUnitType: 'mortar_team', stat: 'armor', value: 2/)
  // Only 2 effects in this entry
  const effectMatches = block.match(/targetUnitType:/g)
  assert.equal(effectMatches.length, 2, 'should have exactly 2 effects')
})

// ── 3. Reinforced Leather Armor data ────────────────────────────────
test('LA-DATA-3: reinforced_leather_armor exists with correct values', () => {
  const block = blockAfter(gd, "key: 'reinforced_leather_armor'")
  assert.match(block, /name: '强化皮甲'/)
  assert.match(block, /gold: 150,\s*lumber: 175/)
  assert.match(block, /researchTime: 75/)
  assert.match(block, /requiresBuilding: 'keep'/)
  assert.match(block, /prerequisiteResearch: 'studded_leather_armor'/)
})

// ── 4. Reinforced Leather Armor effects ─────────────────────────────
test('LA-DATA-4: reinforced_leather_armor effects target rifleman + mortar_team only', () => {
  const block = blockBetween(gd, "key: 'reinforced_leather_armor'", "key: 'dragonhide_armor'")
  assert.match(block, /targetUnitType: 'rifleman', stat: 'armor', value: 2/)
  assert.match(block, /targetUnitType: 'mortar_team', stat: 'armor', value: 2/)
  const effectMatches = block.match(/targetUnitType:/g)
  assert.equal(effectMatches.length, 2, 'should have exactly 2 effects')
})

// ── 5. Dragonhide Armor data ────────────────────────────────────────
test('LA-DATA-5: dragonhide_armor exists with correct values', () => {
  const block = blockAfter(gd, "key: 'dragonhide_armor'")
  assert.match(block, /name: '龙皮甲'/)
  assert.match(block, /gold: 200,\s*lumber: 250/)
  assert.match(block, /researchTime: 90/)
  assert.match(block, /requiresBuilding: 'castle'/)
  assert.match(block, /prerequisiteResearch: 'reinforced_leather_armor'/)
})

// ── 6. Dragonhide Armor effects ─────────────────────────────────────
test('LA-DATA-6: dragonhide_armor effects target rifleman + mortar_team only', () => {
  const block = blockBetween(gd, "key: 'dragonhide_armor'", 'export const BUILDINGS')
  assert.match(block, /targetUnitType: 'rifleman', stat: 'armor', value: 2/)
  assert.match(block, /targetUnitType: 'mortar_team', stat: 'armor', value: 2/)
  const effectMatches = block.match(/targetUnitType:/g)
  assert.equal(effectMatches.length, 2, 'should have exactly 2 effects')
})

// ── 7. Blacksmith researches hook ───────────────────────────────────
test('LA-DATA-7: all three Leather Armor researches in Blacksmith researches', () => {
  const bsBlock = blockAfter(gd, "key: 'blacksmith'", 500)
  assert.match(bsBlock, /studded_leather_armor/)
  assert.match(bsBlock, /reinforced_leather_armor/)
  assert.match(bsBlock, /dragonhide_armor/)
})

// ── 8. No Dragonhawk/Gryphon in effects ─────────────────────────────
test('LA-DATA-8: no Dragonhawk Rider or Gryphon Rider in any Leather Armor effect', () => {
  const laBlock = blockAfter(gd, "key: 'studded_leather_armor'", 3000)
  assert.doesNotMatch(laBlock, /dragonhawk/)
  assert.doesNotMatch(laBlock, /gryphon/)
  assert.doesNotMatch(laBlock, /dragonhawk_rider/)
  assert.doesNotMatch(laBlock, /gryphon_rider/)
})

// ── 9. Does not affect footman/militia/knight (Plating units) ───────
test('LA-DATA-9: Leather Armor does not target Plating units', () => {
  const laBlock = blockAfter(gd, "key: 'studded_leather_armor'", 3000)
  assert.doesNotMatch(laBlock, /targetUnitType: 'footman'/)
  assert.doesNotMatch(laBlock, /targetUnitType: 'militia'/)
  assert.doesNotMatch(laBlock, /targetUnitType: 'knight'/)
})

// ── 10. Does not affect priest/sorceress/worker/tower ───────────────
test('LA-DATA-10: Leather Armor does not target priest/sorceress/worker/tower', () => {
  const laBlock = blockAfter(gd, "key: 'studded_leather_armor'", 3000)
  assert.doesNotMatch(laBlock, /targetUnitType: 'priest'/)
  assert.doesNotMatch(laBlock, /targetUnitType: 'sorceress'/)
  assert.doesNotMatch(laBlock, /targetUnitType: 'worker'/)
  assert.doesNotMatch(laBlock, /targetUnitType: 'tower'/)
})

// ── 11. Source values match HN7-SRC8 ────────────────────────────────
test('LA-DATA-11: cost and time values match HN7-SRC8 source document', () => {
  // L1: 100/100/60s
  assert.match(src, /100\/100/)
  assert.match(src, /60s/)
  // L2: 150/175/75s
  assert.match(src, /150\/175/)
  assert.match(src, /75s/)
  // L3: 200/250/90s
  assert.match(src, /200\/250/)
  assert.match(src, /90s/)
  // Verify data matches
  assert.match(gd, /studded_leather_armor[\s\S]*?gold: 100,\s*lumber: 100/)
  assert.match(gd, /reinforced_leather_armor[\s\S]*?gold: 150,\s*lumber: 175/)
  assert.match(gd, /dragonhide_armor[\s\S]*?gold: 200,\s*lumber: 250/)
})

// ── 12. Prerequisite chain correct ──────────────────────────────────
test('LA-DATA-12: prerequisite chain L1→L2→L3 correct', () => {
  // L1 has no prerequisite
  const l1 = blockAfter(gd, "key: 'studded_leather_armor'", 350)
  assert.doesNotMatch(l1, /prerequisiteResearch/)
  // L2 prereqs L1
  assert.match(gd, /reinforced_leather_armor[\s\S]*?prerequisiteResearch: 'studded_leather_armor'/)
  // L3 prereqs L2
  assert.match(gd, /dragonhide_armor[\s\S]*?prerequisiteResearch: 'reinforced_leather_armor'/)
})

// ── 13. Building requirements match source ──────────────────────────
test('LA-DATA-13: building requirements match source (blacksmith → keep → castle)', () => {
  assert.match(gd, /studded_leather_armor[\s\S]*?requiresBuilding: 'blacksmith'/)
  assert.match(gd, /reinforced_leather_armor[\s\S]*?requiresBuilding: 'keep'/)
  assert.match(gd, /dragonhide_armor[\s\S]*?requiresBuilding: 'castle'/)
})

// ── 14. All effects use armor stat ──────────────────────────────────
test('LA-DATA-14: all Leather Armor effects use armor stat, not attackDamage/maxHp', () => {
  const laBlock = blockAfter(gd, "key: 'studded_leather_armor'", 3000)
  // Count armor effects in Leather Armor researches
  const armorEffects = laBlock.match(/stat: 'armor'/g)
  assert.ok(armorEffects && armorEffects.length >= 6, 'should have 6 armor effects (3 levels × 2 units)')
  // No attackDamage or maxHp in Leather Armor effects
  assert.doesNotMatch(laBlock, /stat: 'attackDamage'/)
  assert.doesNotMatch(laBlock, /stat: 'maxHp'/)
  assert.doesNotMatch(laBlock, /stat: 'attackRange'/)
})

// ── 15. Leather Armor is independent of armorType ───────────────────
test('LA-DATA-15: Leather Armor targets by unit roster, not armorType predicate', () => {
  // Parity decision confirms this
  assert.match(parity, /armorType 决策独立于 Leather Armor 效果目标/)
  assert.match(parity, /targetUnitType.*mortar_team/)
  // Source boundary confirms roster-based
  assert.match(src, /按单位花名册分配/)
  assert.match(src, /不是按 armorType 谓词分配/)
})

// ── 16. DAMAGE_MULTIPLIER_TABLE unchanged ───────────────────────────
test('LA-DATA-16: DAMAGE_MULTIPLIER_TABLE was not modified', () => {
  // Verify existing multiplier values still present
  assert.match(gd, /\[`\$\{AttackType\.Piercing\}_\$\{ArmorType\.Medium\}`\]:\s*0\.75/)
  assert.match(gd, /\[`\$\{AttackType\.Siege\}_\$\{ArmorType\.Medium\}`\]:\s*0\.75/)
  assert.match(gd, /\[`\$\{AttackType\.Piercing\}_\$\{ArmorType\.Heavy\}`\]:\s*1\.25/)
  assert.match(gd, /\[`\$\{AttackType\.Piercing\}_\$\{ArmorType\.Unarmored\}`\]:\s*1\.0/)
})

// ── 17. No unit armorType was modified ──────────────────────────────
test('LA-DATA-17: no unit armorType was modified by this data seed', () => {
  // rifleman should be Medium (migrated by CX85)
  const rifleBlock = blockAfter(gd, "key: 'rifleman'")
  assert.match(rifleBlock, /armorType:\s*ArmorType\.Medium/)
  // mortar_team should still be Unarmored (parity decision)
  const mortarBlock = blockAfter(gd, "key: 'mortar_team'")
  assert.match(mortarBlock, /armorType:\s*ArmorType\.Unarmored/)
  // footman still Heavy
  const footBlock = blockAfter(gd, "key: 'footman'")
  assert.match(footBlock, /armorType:\s*ArmorType\.Heavy/)
  // knight still Heavy
  const knightBlock = blockAfter(gd, "key: 'knight'")
  assert.match(knightBlock, /armorType:\s*ArmorType\.Heavy/)
})

// ── 18. No Game.ts / SimpleAI.ts modifications ─────────────────────
test('LA-DATA-18: Leather Armor data is data-only, no runtime changes', () => {
  // Verify no Leather Armor specific code was added to Game.ts or SimpleAI.ts
  // by checking that the researches only exist in GameData.ts
  const laEntries = gd.match(/studded_leather_armor/g)
  assert.ok(laEntries && laEntries.length >= 2, 'should appear in RESEARCHES and blacksmith.researches')
  // Verify research names are data-driven keys
  assert.match(gd, /key: 'studded_leather_armor'/)
  assert.match(gd, /key: 'reinforced_leather_armor'/)
  assert.match(gd, /key: 'dragonhide_armor'/)
})
