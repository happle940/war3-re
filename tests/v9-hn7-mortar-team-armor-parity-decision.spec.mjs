/**
 * V9 HN7-MODEL10 Mortar Team Armor Parity Decision — Static Proof
 *
 * Proves the parity decision document exists, is self-consistent, aligns with
 * current GameData.ts mortar_team state, and does not conflict with MODEL9 contract.
 */

import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { test } from 'node:test'

const decision = readFileSync(
  new URL('../docs/V9_HN7_MORTAR_TEAM_ARMOR_PARITY_DECISION.zh-CN.md', import.meta.url),
  'utf8',
)
const contract = readFileSync(
  new URL('../docs/V9_HN7_MEDIUM_ARMOR_MIGRATION_CONTRACT.zh-CN.md', import.meta.url),
  'utf8',
)
const leatherBoundary = readFileSync(
  new URL('../docs/V9_HN7_LEATHER_ARMOR_SOURCE_AND_TYPE_BOUNDARY.zh-CN.md', import.meta.url),
  'utf8',
)
const gameData = readFileSync(new URL('../src/game/GameData.ts', import.meta.url), 'utf8')

function blockAfter(text, marker, length = 700) {
  const start = text.indexOf(marker)
  assert.ok(start >= 0, `${marker} must exist`)
  return text.slice(start, start + length)
}

// ── 1. Document exists and references prerequisites ─────────────────
test('PARITY-1: decision document exists and references prerequisites', () => {
  assert.match(decision, /Mortar Team Armor Parity Decision/)
  assert.match(decision, /HN7-MODEL9 已 accepted/)
  assert.match(decision, /不修改任何运行时代码/)
})

// ── 2. mortar_team is currently Unarmored ───────────────────────────
test('PARITY-2: mortar_team is currently ArmorType.Unarmored', () => {
  const mortarBlock = blockAfter(gameData, "key: 'mortar_team'")
  assert.match(mortarBlock, /armorType:\s*ArmorType\.Unarmored/)
  // Confirm decision doc states current state
  assert.match(decision, /ArmorType\.Unarmored/)
  assert.match(decision, /当前无甲/)
})

// ── 3. War3 original is Heavy, documented ───────────────────────────
test('PARITY-3: War3 original Mortar Team armorType is Heavy, documented', () => {
  assert.match(decision, /War3 原版 Mortar Team 的 armorType 是 \*\*Heavy\*\*/)
  assert.match(decision, /classic\.battle\.net/)
})

// ── 4. Three options analyzed ───────────────────────────────────────
test('PARITY-4: three options analyzed (Unarmored / Heavy / Medium)', () => {
  assert.match(decision, /选项 A.*保持 Unarmored/)
  assert.match(decision, /选项 B.*迁移到 Heavy/)
  assert.match(decision, /选项 C.*迁移到 Medium/)
  // Each option has damage multiplier table
  const optA = decision.indexOf('选项 A')
  const optB = decision.indexOf('选项 B')
  const optC = decision.indexOf('选项 C')
  assert.ok(optA > 0 && optB > optA && optC > optB, 'options must be ordered A, B, C')
})

// ── 5. Option B (Heavy) damage multipliers correct ──────────────────
test('PARITY-5: Option B Heavy damage multipliers correct', () => {
  // Piercing vs Heavy = 1.25x in current table
  assert.match(gameData, /\[`\$\{AttackType\.Piercing\}_\$\{ArmorType\.Heavy\}`\]:\s*1\.25/)
  // Decision doc must state Piercing 1.25x for Heavy
  assert.match(decision, /Piercing.*1\.25x.*增加 25%/)
  // Siege vs Heavy = 1.0x
  assert.match(gameData, /\[`\$\{AttackType\.Siege\}_\$\{ArmorType\.Heavy\}`\]:\s*1\.0/)
})

// ── 6. Option C (Medium) damage multipliers correct ─────────────────
test('PARITY-6: Option C Medium damage multipliers correct', () => {
  // Piercing vs Medium = 0.75x
  assert.match(gameData, /\[`\$\{AttackType\.Piercing\}_\$\{ArmorType\.Medium\}`\]:\s*0\.75/)
  // Siege vs Medium = 0.75x
  assert.match(gameData, /\[`\$\{AttackType\.Siege\}_\$\{ArmorType\.Medium\}`\]:\s*0\.75/)
  // Decision doc must note this is opposite to War3
  assert.match(decision, /方向完全相反/)
})

// ── 7. Leather Armor independence proven ────────────────────────────
test('PARITY-7: Leather Armor works by targetUnitType, independent of armorType', () => {
  assert.match(decision, /armorType 决策独立于 Leather Armor 效果目标/)
  assert.match(decision, /targetUnitType.*mortar_team/)
  assert.match(contract, /targetUnitType/)
  // Source boundary also confirms roster-based allocation
  assert.match(leatherBoundary, /按单位花名册分配/)
})

// ── 8. Black Gunpowder independence proven ──────────────────────────
test('PARITY-8: Black Gunpowder works by targetUnitType, independent of armorType', () => {
  assert.match(decision, /Black Gunpowder.*targetUnitType.*mortar_team/)
  assert.match(gameData, /targetUnitType:\s*'mortar_team', stat:\s*'attackDamage'/)
})

// ── 9. Plating non-impact documented ────────────────────────────────
test('PARITY-9: Plating does not affect mortar_team regardless of armorType', () => {
  assert.match(decision, /Plating.*footman.*militia.*knight/)
  assert.match(gameData, /targetUnitType:\s*'knight', stat:\s*'armor'/)
  // mortar_team not in any Plating targetUnitType
  const platingBlock = gameData.indexOf('iron_plating')
  assert.ok(platingBlock > 0)
  const platingSection = gameData.slice(platingBlock, platingBlock + 2000)
  assert.doesNotMatch(platingSection, /mortar_team/)
})

// ── 10. Recommended decision stated ─────────────────────────────────
test('PARITY-10: recommended decision is stated', () => {
  assert.match(decision, /推荐.*选项 A.*保持 Unarmored/)
})

// ── 11. Recommendation rationale includes all key factors ───────────
test('PARITY-11: recommendation rationale covers key factors', () => {
  assert.match(decision, /Leather Armor 不依赖 armorType/)
  assert.match(decision, /Heavy 迁移引入 Plating 歧义/)
  assert.match(decision, /Medium 迁移偏离 War3 太远/)
  assert.match(decision, /保持 Unarmored 是最安全的中间态/)
  assert.match(decision, /未来可按需迁移/)
})

// ── 12. Does not block Leather Armor data seed ──────────────────────
test('PARITY-12: decision does not block Leather Armor data seed', () => {
  assert.match(decision, /推荐决策不阻塞 Leather Armor 数据种子任务/)
  assert.match(decision, /targetUnitType.*rifleman.*mortar_team/)
})

// ── 13. No code modification ────────────────────────────────────────
test('PARITY-13: decision is docs-only, no code modification', () => {
  assert.doesNotMatch(decision, /```typescript/)
  assert.doesNotMatch(decision, /import \{/)
  assert.match(decision, /不修改.*GameData\.ts/)
  assert.match(decision, /不修改.*Game\.ts/)
  assert.match(decision, /不修改.*SimpleAI\.ts/)
})

// ── 14. Forbidden scope documented ──────────────────────────────────
test('PARITY-14: forbidden scope documented', () => {
  assert.match(decision, /不实际修改 `mortar_team\.armorType`/)
  assert.match(decision, /不新增 Leather Armor 数据/)
  assert.match(decision, /英雄、空军、物品/)
})

// ── 15. Consistent with MODEL9 contract ─────────────────────────────
test('PARITY-15: consistent with MODEL9 contract', () => {
  // MODEL9 says mortar_team is "兼容风险单位" needing parity decision
  assert.match(contract, /兼容风险单位/)
  assert.match(contract, /parity decision/)
  // This decision is that parity decision
  assert.match(decision, /parity decision|Parity Decision/)
})

// ── 16. mortar_team.armorType still Unarmored in GameData ───────────
test('PARITY-16: mortar_team.armorType is still Unarmored (not modified)', () => {
  const mortarBlock = blockAfter(gameData, "key: 'mortar_team'")
  assert.match(mortarBlock, /armorType:\s*ArmorType\.Unarmored/)
  assert.match(gameData, /key: 'studded_leather_armor'/)
  assert.match(gameData, /targetUnitType: 'mortar_team', stat: 'armor', value: 2/)
})

// ── 17. Next steps documented ───────────────────────────────────────
test('PARITY-17: next steps documented and safe', () => {
  assert.match(decision, /Rifleman Medium armor migration implementation/)
  assert.match(decision, /Leather Armor data seed/)
  assert.match(decision, /不能直接跳到英雄/)
})

// ── 18. Acceptance criteria present ─────────────────────────────────
test('PARITY-18: acceptance criteria present', () => {
  assert.match(decision, /4a\. 本决策不修改代码/)
  assert.match(decision, /4b\. 决策文档自洽/)
  assert.match(decision, /4c\. 与 HN7-SRC8/)
})
