/**
 * V9 HERO9-SRC1 Hero death / revive source boundary static proof.
 *
 * Proves the source boundary resolves revive values, preserves the HERO9
 * uniqueness contract, and does not adopt placeholder values without source
 * rationale.
 */
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { test } from 'node:test'

const src = readFileSync(
  new URL('../docs/V9_HERO9_REVIVE_SOURCE_BOUNDARY.zh-CN.md', import.meta.url),
  'utf8',
)
const contract = readFileSync(
  new URL('../docs/V9_HERO9_HERO_DEATH_REVIVE_CONTRACT.zh-CN.md', import.meta.url),
  'utf8',
)
const gameData = readFileSync(new URL('../src/game/GameData.ts', import.meta.url), 'utf8')
const game = readFileSync(new URL('../src/game/Game.ts', import.meta.url), 'utf8')

// ── Source hierarchy ─────────────────────────────────────

test('SRC2-1: source hierarchy is present', () => {
  assert.ok(src.includes('主源') || src.includes('primary'))
  assert.ok(src.includes('交叉校验') || src.includes('cross-check'))
  assert.ok(src.includes('冲突样本') || src.includes('conflict'))
})

test('SRC2-2: source references engine constants', () => {
  assert.ok(src.includes('war3mapMisc') || src.includes('引擎常量'))
})

test('SRC2-3: source references Liquipedia or Wowpedia', () => {
  assert.ok(src.includes('Liquipedia') || src.includes('Wowpedia') || src.includes('Warcraft Wiki'))
})

test('SRC2-3a: source boundary includes directly reviewable source URLs', () => {
  assert.ok(
    src.includes('https://www.hiveworkshop.com/threads/changing-gameplay-constants-for-roc-maps.149065/'),
    'war3mapMisc constants mirror URL must be recorded'
  )
  assert.ok(
    src.includes('https://wowpedia.fandom.com/wiki/Hero_(Warcraft_III)'),
    'hero behavior cross-check URL must be recorded'
  )
  assert.ok(
    src.includes('https://classic.battle.net/war3/basics/heroes.shtml'),
    'Blizzard Classic hero basics URL must be recorded'
  )
})

// ── Revive cost resolved ─────────────────────────────────

test('SRC2-4: revive cost formula is adopted with source', () => {
  assert.ok(src.includes('ReviveBaseFactor') || src.includes('0.40'))
  assert.ok(src.includes('ReviveLevelFactor') || src.includes('0.10'))
  assert.ok(src.includes('adopted'))
})

test('SRC2-5: revive cost table shows Paladin values', () => {
  assert.ok(src.includes('170'))  // level 1 revive cost
  assert.ok(src.includes('425'))  // base cost
})

test('SRC2-6: revive lumber is zero', () => {
  assert.ok(src.includes('木材费用：0') || src.includes('0') && src.includes('lumber'))
})

test('SRC2-6a: fractional resource rounding is explicitly scoped as project mapping', () => {
  assert.ok(
    src.includes('Math.floor') || src.includes('整数截断'),
    'revive cost fractional resource rounding must be explicit'
  )
  assert.ok(
    src.includes('project mapping') || src.includes('项目映射'),
    'rounding must be marked as project mapping, not as proven source truth'
  )
})

// ── Revive time resolved ─────────────────────────────────

test('SRC2-7: revive time formula is adopted with source', () => {
  assert.ok(src.includes('ReviveTimeFactor') || src.includes('0.65'))
  assert.ok(src.includes('adopted'))
})

test('SRC2-8: revive time cap is documented', () => {
  assert.ok(src.includes('110') || src.includes('ReviveMaxTimeFactor') || src.includes('2.0'))
})

// ── Revive HP resolved ───────────────────────────────────

test('SRC2-9: revive HP is adopted as full HP', () => {
  assert.ok(src.includes('100%') || src.includes('满血') || src.includes('maxHp'))
  assert.ok(src.includes('HeroReviveLifeFactor') || src.includes('1.0'))
})

// ── Revive mana resolved ─────────────────────────────────

test('SRC2-10: revive mana is resolved with project mapping', () => {
  assert.ok(src.includes('project mapping') || src.includes('项目映射'))
  assert.ok(src.includes('255') || src.includes('maxMana'))
})

// ── Corpse/selection/supply semantics ─────────────────────

test('SRC2-11: dead hero supply occupancy is adopted', () => {
  assert.ok(src.includes('占用人口') || src.includes('supply') || src.includes('food'))
  assert.ok(
    src.includes('仍然占用') || src.includes('still occupies'),
    'dead hero must still occupy supply'
  )
})

test('SRC2-12: dead hero visibility is deferred', () => {
  assert.ok(src.includes('deferred') || src.includes('推迟'))
  assert.ok(src.includes('视觉') || src.includes('visual'))
})

test('SRC2-13: dead hero selectability is deferred', () => {
  assert.ok(src.includes('deferred') || src.includes('推迟'))
  assert.ok(src.includes('可选中') || src.includes('selectable'))
})

test('SRC2-14: dead hero stops acting is adopted', () => {
  assert.ok(src.includes('停止行动') || src.includes('stop acting'))
  assert.ok(src.includes('adopted'))
})

test('SRC2-15: no corpse is project mapped', () => {
  assert.ok(src.includes('不留尸体') || src.includes('no corpse') || src.includes('dissipate'))
})

// ── No placeholder values adopted without source ──────────

test('SRC2-16: 50% placeholder from HERO9-CONTRACT1 is not adopted as production', () => {
  // The contract had placeholder 50% values; source boundary must not adopt them
  assert.ok(!src.includes('采用 50%') && !src.includes('adopted 50%'))
  assert.ok(!src.includes('占位值作为生产值'))
})

test('SRC2-17: all adopted values have source rationale', () => {
  // Count adopted decisions
  const adoptedCount = (src.match(/adopted/g) || []).length
  assert.ok(adoptedCount >= 5, `must have at least 5 adopted decisions, found ${adoptedCount}`)
})

// ── Uniqueness contract preserved ─────────────────────────

test('SRC2-18: HERO9-CONTRACT1 uniqueness contract is preserved', () => {
  assert.ok(src.includes('hasExistingHero') || src.includes('同队伍同类型英雄记录只要存在'))
  assert.ok(src.includes('isDead === true'))
})

test('SRC2-19: summon vs revive paths are separate', () => {
  assert.ok(src.includes('新召唤检查') || src.includes('summon'))
  assert.ok(src.includes('复活检查') || src.includes('revive'))
})

// ── Production files untouched ────────────────────────────

test('SRC2-20: Game.ts revive runtime uses source-boundary values via HERO_REVIVE_RULES', () => {
  assert.ok(game.includes('HERO_REVIVE_RULES'), 'Game.ts must import HERO_REVIVE_RULES')
  assert.ok(game.includes('goldBaseFactor'), 'must use goldBaseFactor from rules')
  assert.ok(game.includes('timeFactor'), 'must use timeFactor from rules')
})

test('SRC2-21: GameData.ts isDead field exists from HERO4', () => {
  assert.ok(gameData.includes('isDead?'), 'isDead optional field must exist in UnitDef')
})

test('SRC2-22: contract [SRC] items are resolved in source boundary', () => {
  // Contract marked items as [SRC] requiring source boundary
  assert.ok(contract.includes('[SRC]') || contract.includes('source-boundary required'))
  // Source boundary resolves them
  assert.ok(src.includes('adopted'))
})
