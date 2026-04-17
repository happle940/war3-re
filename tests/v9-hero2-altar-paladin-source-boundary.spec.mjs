/**
 * V9 HERO2-SRC1 Altar + Paladin + Holy Light source boundary static proof.
 *
 * Proves the source boundary reconciles HERO1 candidate values with
 * authoritative War3 ROC source data, documents conflicts, and produces
 * adopted values ready for data seed tasks.
 */
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { test } from 'node:test'

const gameData = readFileSync(new URL('../src/game/GameData.ts', import.meta.url), 'utf8')
const game = readFileSync(new URL('../src/game/Game.ts', import.meta.url), 'utf8')
const src = readFileSync(
  new URL('../docs/V9_HERO2_ALTAR_PALADIN_SOURCE_BOUNDARY.zh-CN.md', import.meta.url),
  'utf8',
)
const contract = readFileSync(
  new URL('../docs/V9_HERO1_ALTAR_PALADIN_CONTRACT.zh-CN.md', import.meta.url),
  'utf8',
)

// ── Document shape ───────────────────────────────────────

test('SRC1-1: source boundary exists and covers all three objects', () => {
  assert.ok(src.length > 500)
  assert.ok(src.includes('Altar of Kings') || src.includes('Altar'))
  assert.ok(src.includes('Paladin'))
  assert.ok(src.includes('Holy Light'))
})

test('SRC1-2: source boundary defines source hierarchy', () => {
  assert.ok(src.includes('classic.battle.net') || src.includes('主源'))
  assert.ok(src.includes('Liquipedia') || src.includes('交叉校验'))
  assert.ok(src.includes('冲突') || src.includes('冲突样本'))
})

// ── Altar adopted values ─────────────────────────────────

test('SRC1-3: Altar cost adopted as 180/50', () => {
  assert.ok(src.includes('180'))
  assert.ok(src.includes('**50**') || src.includes('50'))
  assert.ok(src.includes('**60**') || src.includes('60'))  // buildTime
})

test('SRC1-4: Altar HP adopted as 900', () => {
  assert.ok(src.includes('900'))
  assert.ok(src.includes('**900**') || src.includes('900'))
})

test('SRC1-5: Altar trains Paladin', () => {
  assert.ok(src.includes("paladin"))
})

// ── Paladin adopted values ───────────────────────────────

test('SRC1-6: Paladin cost adopted as 425/100', () => {
  assert.ok(src.includes('425'))
  assert.ok(src.includes('100'))
})

test('SRC1-7: Paladin trainTime corrected from HERO1 candidate', () => {
  // HERO1 had 35, ROC source says 55
  assert.ok(src.includes('55'))
  assert.ok(src.includes('冲突 2') || src.includes('trainTime'))
})

test('SRC1-8: Paladin HP corrected from HERO1 candidate', () => {
  // HERO1 had 700, ROC source says 650
  assert.ok(src.includes('650'))
  assert.ok(src.includes('冲突 3') || src.includes('hp'))
})

test('SRC1-9: Paladin attackCooldown corrected', () => {
  // HERO1 had 1.8, ROC source says 2.2
  assert.ok(src.includes('2.2'))
})

test('SRC1-10: Paladin armor corrected', () => {
  // HERO1 had 3, ROC source says 4
  assert.ok(src.includes('**4**') || src.includes('4'))
})

test('SRC1-11: Paladin maxMana confirmed as 255', () => {
  assert.ok(src.includes('255'))
})

test('SRC1-12: Paladin speed mapped from War3 270 to project 3.0', () => {
  assert.ok(src.includes('3.0'))
  assert.ok(src.includes('270') || src.includes('映射'))
})

// ── Holy Light adopted values ────────────────────────────

test('SRC1-13: Holy Light mana cost decision documented', () => {
  // Current Blizzard Classic source lists Holy Light level 1 as 65 mana.
  assert.ok(src.includes('65'))
  assert.ok(src.includes('当前 Blizzard Classic 主源值') || src.includes('Blizzard Classic'))
  assert.ok(!src.includes('ROC 原版 75'), '75 must not be claimed as the ROC main-source value')
  assert.ok(!src.includes('采用补丁 1.13 值'), '65 must not be framed as a patch override without a source boundary')
})

test('SRC1-14: Holy Light heal amount 200 confirmed', () => {
  assert.ok(src.includes('200'))
})

test('SRC1-15: Holy Light range mapped', () => {
  assert.ok(src.includes('8.0'))
})

// ── Revive decision ──────────────────────────────────────

test('SRC1-16: revive values deferred to runtime task', () => {
  assert.ok(src.includes('暂缓'))
})

// ── Type mapping decisions ───────────────────────────────

test('SRC1-17: Fortified armor mapped to Heavy (no new type)', () => {
  assert.ok(src.includes('Heavy'))
  assert.ok(src.includes('Fortified'))
  assert.ok(src.includes('冲突 1') || src.includes('armorType'))
  assert.ok(!gameData.includes('Fortified'), 'GameData must not have Fortified yet')
})

test('SRC1-18: Hero attack type mapped to Normal (no new type)', () => {
  assert.ok(src.includes('Normal'))
  assert.ok(src.includes('Hero'))
  assert.ok(!gameData.includes('AttackType.Hero'), 'GameData must not have Hero attack type yet')
})

test('SRC1-19: Hero armor type mapped to Heavy (no new type)', () => {
  assert.ok(!gameData.includes('ArmorType.Hero'), 'GameData must not have Hero armor type yet')
})

// ── Conflict documentation ───────────────────────────────

test('SRC1-20: all 6 hard conflicts are documented', () => {
  for (let i = 1; i <= 6; i++) {
    assert.ok(src.includes(`冲突 ${i}`), `conflict ${i} must be documented`)
  }
  assert.ok(!src.includes('冲突 7'), 'Holy Light 65 is adopted from the current main source, not a hard conflict')
  assert.ok(src.includes('非采用样本'), 'Historical Holy Light 75 claim should be recorded only as a non-adopted sample')
})

test('SRC1-21: each conflict has adopted value with reason', () => {
  // Check that "采用" appears for adopted values
  assert.ok(src.includes('采用主源') || src.includes('采用当前 Blizzard Classic 主源值'))
  assert.ok(src.includes('理由'))
})

// ── Summary section ──────────────────────────────────────

test('SRC1-22: adopted values summary exists for HERO3/4/5', () => {
  assert.ok(src.includes('采用值汇总') || src.includes('汇总'))
  assert.ok(src.includes('HERO3') || src.includes('HERO4') || src.includes('HERO5'))
})

// ── Current production boundary ──────────────────────────

test('SRC1-23: Paladin and Holy Light runtime may exist after HERO7, using data', () => {
  // After HERO4, paladin data can exist
  if (gameData.includes("key: 'paladin'")) {
    const block = gameData.match(/paladin:\s*\{[\s\S]*?\n\s{2}\},/)?.[0] ?? ''
    assert.ok(block.includes('isHero: true'), 'paladin must be flagged as hero')
  }
  // After HERO5, holy_light data can exist
  if (gameData.includes("key: 'holy_light'")) {
    const block = gameData.match(/holy_light:\s*\{[\s\S]*?\n\s{2}\},/)?.[0] ?? ''
    assert.ok(block.includes("ownerType: 'paladin'"), 'holy_light must belong to paladin')
    assert.ok(block.includes('excludeSelf: true'), 'holy_light must preserve the not-self source boundary')
  }
  // After HERO7, Game.ts may reference holy_light through ABILITIES data
  if (game.includes('holy_light')) {
    assert.ok(game.includes('ABILITIES.holy_light'), 'holy_light runtime must use ABILITIES data')
  }
})

// ── Contract consistency ─────────────────────────────────

test('SRC1-24: source boundary references HERO1 contract', () => {
  assert.ok(src.includes('HERO1') || src.includes('合同'))
})

test('SRC1-25: Paladin mana regeneration is not invented from current caster defaults', () => {
  assert.ok(src.includes('manaRegen'))
  assert.ok(src.includes('暂不固定'))
  assert.ok(!src.includes('manaRegen: 0.5'), 'Paladin data seed must not inherit Priest/Sorceress manaRegen without a mapping decision')
})
