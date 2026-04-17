/**
 * V9 HN7-MODEL9 Medium Armor Migration Contract — Static Proof
 *
 * Proves the contract document exists, is self-consistent, and aligns with
 * current GameData.ts armorType state and DAMAGE_MULTIPLIER_TABLE values.
 */

import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { test } from 'node:test'

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

// ── 1. Document exists and references prerequisite ──────────────────
test('MAM-CONTRACT-1: contract is docs-only and follows HN7-SRC8 boundary', () => {
  assert.match(contract, /Medium Armor Migration Contract/)
  assert.match(contract, /合同不修改代码/)
  assert.match(contract, /HN7-SRC8 已 accepted/)
  assert.match(leatherBoundary, /rifleman/)
  assert.match(leatherBoundary, /Unarmored/)
})

// ── 2. rifleman is the only migration target and may now be Medium ───
test('MAM-CONTRACT-2: rifleman is the only migration target and current data has migrated', () => {
  assert.match(contract, /本次明确目标/)
  assert.match(contract, /rifleman \| Unarmored \| Medium/)
  assert.match(contract, /默认只修改 `UNITS\.rifleman\.armorType`/)
  const riflemanBlock = blockAfter(gameData, "key: 'rifleman'")
  assert.match(riflemanBlock, /armorType:\s*ArmorType\.Medium/)
  assert.doesNotMatch(riflemanBlock, /armorType:\s*ArmorType\.Unarmored/)
})

// ── 3. mortar_team is risk item, not blind migration ────────────────
test('MAM-CONTRACT-3: mortar_team is a risk decision, not a blind Medium migration', () => {
  assert.match(contract, /兼容风险单位/)
  assert.match(contract, /不能直接当作无争议 Medium 迁移/)
  assert.match(contract, /默认不改/)
  assert.match(contract, /parity decision/)
  const mortarBlock = blockAfter(gameData, "key: 'mortar_team'")
  assert.match(mortarBlock, /armorType:\s*ArmorType\.Unarmored/)
  assert.doesNotMatch(mortarBlock, /armorType:\s*ArmorType\.Medium/)
})

// ── 4. Non-migration exclusions explicit ────────────────────────────
test('MAM-CONTRACT-4: excluded units are explicitly listed', () => {
  for (const key of ['worker', 'militia', 'footman', 'knight', 'priest', 'sorceress', 'tower']) {
    assert.match(contract, new RegExp(`\\| ${key} \\|`), `${key} must be listed`)
  }
  assert.match(contract, /footman \| Heavy/)
  assert.match(contract, /knight \| Heavy/)
  assert.match(contract, /tower \| Medium/)
})

// ── 5. DAMAGE_MULTIPLIER_TABLE already has Medium column ────────────
test('MAM-CONTRACT-5: damage multiplier table already supports Medium', () => {
  assert.match(gameData, /\[`\$\{AttackType\.Piercing\}_\$\{ArmorType\.Medium\}`\]:\s*0\.75/)
  assert.match(gameData, /\[`\$\{AttackType\.Siege\}_\$\{ArmorType\.Medium\}`\]:\s*0\.75/)
  assert.match(gameData, /\[`\$\{AttackType\.Normal\}_\$\{ArmorType\.Medium\}`\]:\s*1\.0/)
  assert.match(gameData, /\[`\$\{AttackType\.Piercing\}_\$\{ArmorType\.Unarmored\}`\]:\s*1\.0/)
  assert.match(contract, /DAMAGE_MULTIPLIER_TABLE/)
  assert.match(contract, /无需修改表本身/)
  assert.match(contract, /不修改 `DAMAGE_MULTIPLIER_TABLE` 的任何值/)
})

// ── 6. Research compatibility stays targetUnitType-driven ────────────
test('MAM-CONTRACT-6: research compatibility stays targetUnitType-driven', () => {
  assert.match(contract, /Long Rifles/)
  assert.match(contract, /Black Gunpowder/)
  assert.match(contract, /Plating/)
  assert.match(contract, /不受影响/)
  assert.match(gameData, /targetUnitType:\s*'rifleman', stat:\s*'attackRange'/)
  assert.match(gameData, /targetUnitType:\s*'mortar_team', stat:\s*'attackDamage'/)
  assert.match(gameData, /targetUnitType:\s*'knight', stat:\s*'armor'/)
})

// ── 7. Acceptance criteria includes controlled damage proof ─────────
test('MAM-CONTRACT-7: acceptance criteria includes controlled damage proof', () => {
  assert.match(contract, /受控伤害 proof/)
  assert.match(contract, /rifleman（Medium）受到 Piercing 攻击时，伤害为 0\.75x/)
  assert.match(contract, /rifleman（Medium）受到 Normal 攻击时，伤害为 1\.0x/)
  assert.match(contract, /footman（Heavy）受到 Piercing 攻击时，伤害仍为 1\.25x/)
})

// ── 8. Leather Armor gated behind migration ──────────────────────────
test('MAM-CONTRACT-8: Leather Armor remains gated behind migration and Mortar decision', () => {
  assert.match(contract, /armorType 迁移完成后，Leather Armor 数据种子任务才允许派发/)
  assert.match(contract, /这不等于两者都必须是 Medium/)
  assert.match(contract, /Dragonhawk Rider 和 Gryphon Rider 未实现时不能添加/)
  assert.match(gameData, /key: 'studded_leather_armor'/)
  assert.match(gameData, /targetUnitType: 'rifleman', stat: 'armor', value: 2/)
  assert.match(gameData, /targetUnitType: 'mortar_team', stat: 'armor', value: 2/)
  assert.doesNotMatch(gameData, /targetUnitType: 'dragonhawk_rider'/)
  assert.doesNotMatch(gameData, /targetUnitType: 'gryphon_rider'/)
})

// ── 9. Forbidden scope ──────────────────────────────────────────────
test('MAM-CONTRACT-9: forbidden actions keep scope narrow', () => {
  assert.match(contract, /不修改 `DAMAGE_MULTIPLIER_TABLE` 的任何值/)
  assert.match(contract, /不把 footman、knight、militia 改为 Medium/)
  assert.match(contract, /不把 worker、priest、sorceress 改为 Medium/)
  assert.match(contract, /不把 tower 从 Medium 改为其他类型/)
  assert.match(contract, /不新增 `studded_leather_armor`/)
  assert.match(contract, /不修改 `SimpleAI\.ts` 或 `Game\.ts`/)
  assert.match(contract, /不新增英雄、空军、物品、素材或完整三本战术/)
})

// ── 10. Implementation boundary allows only GameData rifleman ───────
test('MAM-CONTRACT-10: implementation boundary allows only GameData rifleman armorType', () => {
  assert.match(contract, /GameData\.ts/)
  assert.match(contract, /默认只修改 `UNITS\.rifleman\.armorType`/)
  assert.match(contract, /不修改[\s\S]*SimpleAI\.ts/)
  assert.match(contract, /Game\.ts/)
})

// ── 11. Damage multiplier impact analysis present ────────────────────
test('MAM-CONTRACT-11: damage multiplier impact analysis documented', () => {
  assert.match(contract, /受到 Piercing 伤害减少 25%/)
  assert.match(contract, /受到 Siege 伤害减少 25%/)
  assert.match(contract, /0\.75x/)
})

// ── 12. Next step safety ────────────────────────────────────────────
test('MAM-CONTRACT-12: next steps keep Leather Armor ordered after migration', () => {
  assert.match(contract, /Rifleman Medium armor migration implementation/)
  assert.match(contract, /Mortar Team armor parity decision/)
  assert.match(contract, /Leather Armor data seed/)
  assert.ok(
    contract.indexOf('Rifleman Medium armor migration implementation') <
      contract.indexOf('Leather Armor data seed'),
    'Leather Armor data seed must come after Rifleman migration',
  )
  assert.match(contract, /不能直接跳到英雄/)
})

// ── 13. Contract is docs-only (no code) ─────────────────────────────
test('MAM-CONTRACT-13: contract contains no implementation code', () => {
  assert.doesNotMatch(contract, /```typescript/)
  assert.doesNotMatch(contract, /import \{/)
  assert.match(contract, /合同不修改代码/)
})
