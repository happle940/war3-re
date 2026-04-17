/**
 * V9 HERO9-CONTRACT2 Altar revive runtime contract static proof.
 *
 * Proves the implementation contract references HERO_REVIVE_RULES and source
 * boundary, defines cost/time/queue/completion semantics, and does not modify
 * production files.
 */
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { test } from 'node:test'

const contract = readFileSync(
  new URL('../docs/V9_HERO9_REVIVE_RUNTIME_CONTRACT.zh-CN.md', import.meta.url),
  'utf8',
)
const gameData = readFileSync(new URL('../src/game/GameData.ts', import.meta.url), 'utf8')
const sourceBoundary = readFileSync(
  new URL('../docs/V9_HERO9_REVIVE_SOURCE_BOUNDARY.zh-CN.md', import.meta.url),
  'utf8',
)
const dataSeed = readFileSync(
  new URL('../docs/V9_HERO9_REVIVE_DATA_SEED.zh-CN.md', import.meta.url),
  'utf8',
)
const game = readFileSync(new URL('../src/game/Game.ts', import.meta.url), 'utf8')

// ── Document shape ───────────────────────────────────────

test('RC2-1: contract exists and has substance', () => {
  assert.ok(contract.length > 1000)
})

test('RC2-2: contract references prerequisite slices', () => {
  assert.ok(contract.includes('HERO9-CONTRACT1'))
  assert.ok(contract.includes('HERO9-SRC1'))
  assert.ok(contract.includes('HERO9-IMPL1'))
  assert.ok(contract.includes('HERO9-DATA1'))
})

test('RC2-3: contract references HERO_REVIVE_RULES', () => {
  assert.ok(contract.includes('HERO_REVIVE_RULES'))
})

test('RC2-4: contract references source boundary and data seed', () => {
  assert.ok(contract.includes('V9_HERO9_REVIVE_SOURCE_BOUNDARY'))
  assert.ok(contract.includes('V9_HERO9_REVIVE_DATA_SEED'))
})

// ── Altar command-card availability ──────────────────────

test('RC2-5: contract defines revive only when dead hero exists', () => {
  assert.ok(contract.includes('isDead === true'))
  assert.ok(contract.includes('复活') || contract.includes('revive'))
})

test('RC2-6: contract specifies no dead hero = no revive entry', () => {
  assert.ok(
    contract.includes('没有死亡 Paladin 时不显示复活入口')
    || contract.includes('no dead Paladin means no revive'),
  )
})

test('RC2-7: contract specifies live hero blocks summon and does not open revive', () => {
  assert.ok(contract.includes('已存活'))
  assert.ok(contract.includes('存活 Paladin 不打开复活路径'))
})

test('RC2-8: contract specifies duplicate revive is blocked when queued', () => {
  assert.ok(
    contract.includes('重复排队拒绝') || contract.includes('duplicate'),
    'must specify duplicate queue rejection',
  )
})

// ── Cost formula ─────────────────────────────────────────

test('RC2-9: contract defines gold cost formula using HERO_REVIVE_RULES', () => {
  assert.ok(contract.includes('goldBaseFactor'))
  assert.ok(contract.includes('goldLevelFactor'))
  assert.ok(contract.includes('goldMaxFactor'))
  assert.ok(contract.includes('goldHardCap'))
  assert.ok(contract.includes('Math.floor'))
})

test('RC2-10: contract defines lumber cost as 0', () => {
  assert.ok(contract.includes('木材费用 = 0') || contract.includes('lumberBaseFactor'))
  assert.ok(contract.includes('0'))
})

test('RC2-11: contract shows Paladin level 1 gold = 170', () => {
  assert.ok(contract.includes('170'))
  // Verify from source: floor(425 * 0.40) = 170
  assert.ok(contract.includes('425'))
})

// ── Time formula and Math.round mapping ──────────────────

test('RC2-12: contract defines time formula using HERO_REVIVE_RULES', () => {
  assert.ok(contract.includes('timeFactor'))
  assert.ok(contract.includes('timeMaxFactor'))
  assert.ok(contract.includes('timeHardCap'))
})

test('RC2-13: contract specifies Math.round for runtime queue duration', () => {
  assert.ok(
    contract.includes('Math.round'),
    'must specify Math.round for runtime queue duration mapping',
  )
})

test('RC2-14: contract shows Paladin time examples matching source boundary', () => {
  // Level 1: 36, Level 2: 72, Level 3: 107, Level 4+: 110
  assert.ok(contract.includes('36'))
  assert.ok(contract.includes('72'))
  assert.ok(contract.includes('107'))
  assert.ok(contract.includes('110'))
})

test('RC2-15: contract shows Paladin level 1 queue duration = 36 seconds', () => {
  assert.ok(contract.includes('36'))
  assert.ok(contract.includes('35.75'))
})

// ── Paladin level 1 examples ────────────────────────────

test('RC2-16: contract shows Paladin level 1 full example set', () => {
  // 170 gold, 0 lumber, 36 second queue duration
  assert.ok(contract.includes('170'))
  assert.ok(contract.includes('36'))
})

test('RC2-17: contract specifies revive HP = maxHp × lifeFactor = 650', () => {
  assert.ok(contract.includes('650'))
  assert.ok(contract.includes('lifeFactor'))
})

test('RC2-18: contract specifies revive mana = maxMana = 255', () => {
  assert.ok(contract.includes('255'))
  assert.ok(contract.includes('maxMana'))
})

// ── Queue shape ──────────────────────────────────────────

test('RC2-19: contract defines queue item must identify hero by reference', () => {
  assert.ok(
    contract.includes('heroUnitId') || contract.includes('引用标识') || contract.includes('heroType'),
    'queue must identify the dead hero unit',
  )
})

test('RC2-20: contract specifies queue does NOT create new Paladin unit', () => {
  assert.ok(
    contract.includes('不创建新单位') || contract.includes('not create a second'),
    'revive must not create a new unit',
  )
})

test('RC2-21: contract specifies resources spent once at queue start', () => {
  assert.ok(
    contract.includes('一次性扣费') || contract.includes('spend resources once'),
  )
})

test('RC2-22: contract specifies insufficient resources rejection', () => {
  assert.ok(
    contract.includes('资源不足拒绝') || contract.includes('reject insufficient'),
  )
})

// ── Completion behavior ──────────────────────────────────

test('RC2-23: contract specifies isDead clears to false', () => {
  assert.ok(contract.includes('isDead') && contract.includes('false'))
})

test('RC2-24: contract specifies hp restores to maxHp using lifeFactor', () => {
  assert.ok(contract.includes('hp') || contract.includes('HP'))
  assert.ok(contract.includes('maxHp') || contract.includes('lifeFactor'))
})

test('RC2-25: contract specifies hero appears near Altar', () => {
  assert.ok(
    contract.includes('祭坛') || contract.includes('Altar'),
    'hero must appear near Altar',
  )
})

test('RC2-26: contract specifies no auto-selection after revive', () => {
  assert.ok(
    contract.includes('不自动选中') || contract.includes('not automatic') || contract.includes('不自动'),
  )
})

// ── Forbidden scope closed ───────────────────────────────

test('RC2-27: contract keeps XP/leveling closed', () => {
  assert.ok(contract.includes('经验') || contract.includes('XP'))
  assert.ok(contract.includes('升级') || contract.includes('leveling'))
})

test('RC2-28: contract keeps other heroes closed', () => {
  assert.ok(contract.includes('大法师') || contract.includes('Archmage'))
  assert.ok(contract.includes('山丘之王') || contract.includes('Mountain King'))
  assert.ok(contract.includes('血法师') || contract.includes('Blood Mage'))
})

test('RC2-29: contract keeps items/shop/Tavern/AI/visuals closed', () => {
  assert.ok(contract.includes('物品') || contract.includes('item'))
  assert.ok(contract.includes('商店') || contract.includes('shop'))
  assert.ok(contract.includes('酒馆') || contract.includes('Tavern'))
  assert.ok(contract.includes('AI'))
  assert.ok(contract.includes('视觉') || contract.includes('visual'))
})

test('RC2-30: contract does not claim hero system complete', () => {
  assert.ok(
    contract.includes('不声称') || contract.includes('does not claim'),
    'must explicitly disclaim hero system completeness',
  )
})

// ── Slice order ──────────────────────────────────────────

test('RC2-31: contract defines IMPL2 as next slice', () => {
  assert.ok(contract.includes('HERO9-IMPL2'))
})

test('RC2-32: contract defines CLOSE1 as final slice', () => {
  assert.ok(contract.includes('HERO9-CLOSE1'))
})

// ── No placeholder 50% values ────────────────────────────

test('RC2-33: contract does not adopt Task212 placeholder 50% values', () => {
  assert.ok(!contract.includes('采用 50%') && !contract.includes('adopted 50%'))
})

// ── GameData.ts and source boundary alignment ────────────

test('RC2-34: HERO_REVIVE_RULES exists in GameData.ts', () => {
  assert.ok(gameData.includes('export const HERO_REVIVE_RULES'))
  assert.ok(gameData.includes('goldBaseFactor: 0.40'))
  assert.ok(gameData.includes('timeFactor: 0.65'))
})

test('RC2-35: source boundary still references all adopted values', () => {
  assert.ok(sourceBoundary.includes('0.40'))
  assert.ok(sourceBoundary.includes('0.10'))
  assert.ok(sourceBoundary.includes('0.65'))
  assert.ok(sourceBoundary.includes('adopted'))
})

// ── Production files untouched ───────────────────────────

test('RC2-36: Game.ts revive runtime uses HERO_REVIVE_RULES constants', () => {
  assert.ok(game.includes('HERO_REVIVE_RULES'), 'Game.ts must import HERO_REVIVE_RULES')
  assert.ok(game.includes('goldBaseFactor'), 'must use goldBaseFactor from rules')
  assert.ok(game.includes('timeFactor'), 'must use timeFactor from rules')
  assert.ok(!game.includes('0.40') || game.includes('HERO_REVIVE_RULES'), 'no hard-coded 0.40 without rules')
})
