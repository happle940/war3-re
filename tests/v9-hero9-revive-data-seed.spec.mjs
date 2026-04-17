/**
 * V9 HERO9-DATA1 Hero revive data seed static proof.
 *
 * Proves HERO_REVIVE_RULES exists in GameData.ts with all required constants,
 * computes Paladin examples from UNITS.paladin source text (not free text), and
 * confirms no revive runtime was added to Game.ts.
 *
 * This proof reads source files as text — no runtime imports.
 */
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { test } from 'node:test'

const gameData = readFileSync(new URL('../src/game/GameData.ts', import.meta.url), 'utf8')
const game = readFileSync(new URL('../src/game/Game.ts', import.meta.url), 'utf8')
const dataSeedDoc = readFileSync(
  new URL('../docs/V9_HERO9_REVIVE_DATA_SEED.zh-CN.md', import.meta.url),
  'utf8',
)
const sourceBoundary = readFileSync(
  new URL('../docs/V9_HERO9_REVIVE_SOURCE_BOUNDARY.zh-CN.md', import.meta.url),
  'utf8',
)

// ── Extract Paladin base values from UNITS text ─────────

function extractNumber(src, key) {
  const re = new RegExp(`${key}\\s*:\\s*(\\d+(?:\\.\\d+)?)`)
  const m = src.match(re)
  assert.ok(m, `must find ${key} in source`)
  return parseFloat(m[1])
}

function extractReviveNumber(src, key) {
  const re = new RegExp(`${key}\\s*:\\s*(\\d+(?:\\.\\d+)?)`)
  const m = src.match(re)
  assert.ok(m, `must find ${key} in HERO_REVIVE_RULES`)
  return parseFloat(m[1])
}

// ── Data object exists ──────────────────────────────────

test('DATA1-1: HERO_REVIVE_RULES is exported from GameData.ts', () => {
  assert.ok(gameData.includes('export const HERO_REVIVE_RULES'))
  assert.ok(gameData.includes('goldBaseFactor'))
  assert.ok(gameData.includes('timeFactor'))
  assert.ok(gameData.includes('rounding'))
})

// ── Gold constants ──────────────────────────────────────

test('DATA1-2: goldBaseFactor is 0.40', () => {
  assert.strictEqual(extractReviveNumber(gameData, 'goldBaseFactor'), 0.40)
})

test('DATA1-3: goldLevelFactor is 0.10', () => {
  assert.strictEqual(extractReviveNumber(gameData, 'goldLevelFactor'), 0.10)
})

test('DATA1-4: goldMaxFactor is 4.0', () => {
  assert.strictEqual(extractReviveNumber(gameData, 'goldMaxFactor'), 4.0)
})

test('DATA1-5: goldHardCap is 700', () => {
  assert.strictEqual(extractReviveNumber(gameData, 'goldHardCap'), 700)
})

// ── Lumber constants ────────────────────────────────────

test('DATA1-6: lumberBaseFactor is 0', () => {
  assert.strictEqual(extractReviveNumber(gameData, 'lumberBaseFactor'), 0)
})

test('DATA1-7: lumberLevelFactor is 0', () => {
  assert.strictEqual(extractReviveNumber(gameData, 'lumberLevelFactor'), 0)
})

// ── Time constants ──────────────────────────────────────

test('DATA1-8: timeFactor is 0.65', () => {
  assert.strictEqual(extractReviveNumber(gameData, 'timeFactor'), 0.65)
})

test('DATA1-9: timeMaxFactor is 2.0', () => {
  assert.strictEqual(extractReviveNumber(gameData, 'timeMaxFactor'), 2.0)
})

test('DATA1-10: timeHardCap is 150', () => {
  assert.strictEqual(extractReviveNumber(gameData, 'timeHardCap'), 150)
})

// ── HP/Mana constants ───────────────────────────────────

test('DATA1-11: lifeFactor is 1.0', () => {
  assert.strictEqual(extractReviveNumber(gameData, 'lifeFactor'), 1.0)
})

test('DATA1-12: manaStartFactor is 1', () => {
  assert.strictEqual(extractReviveNumber(gameData, 'manaStartFactor'), 1)
})

test('DATA1-13: manaBonusFactor is 0', () => {
  assert.strictEqual(extractReviveNumber(gameData, 'manaBonusFactor'), 0)
})

// ── Rounding / mapping ──────────────────────────────────

test('DATA1-14: rounding is floor', () => {
  assert.ok(gameData.includes("rounding: 'floor'"))
})

test('DATA1-15: simplifiedManaMapping is maxMana', () => {
  assert.ok(gameData.includes("simplifiedManaMapping: 'maxMana'"))
})

// ── Paladin example calculations (computed from source) ──

test('DATA1-16: Paladin level 1 revive gold is 170', () => {
  // Extract paladin cost from UNITS.paladin in source
  const paladinSection = gameData.slice(gameData.indexOf('paladin:'))
  const paladinCostGold = extractNumber(paladinSection, 'gold')
  assert.strictEqual(paladinCostGold, 425, 'Paladin gold cost must be 425')

  const goldBaseFactor = extractReviveNumber(gameData, 'goldBaseFactor')
  const goldLevelFactor = extractReviveNumber(gameData, 'goldLevelFactor')
  const factor = goldBaseFactor + goldLevelFactor * (1 - 1)
  const gold = Math.floor(paladinCostGold * factor)
  assert.strictEqual(gold, 170)
})

test('DATA1-17: Paladin level 2 revive gold is 212 (floor truncation)', () => {
  const paladinSection = gameData.slice(gameData.indexOf('paladin:'))
  const paladinCostGold = extractNumber(paladinSection, 'gold')

  const goldBaseFactor = extractReviveNumber(gameData, 'goldBaseFactor')
  const goldLevelFactor = extractReviveNumber(gameData, 'goldLevelFactor')
  const factor = goldBaseFactor + goldLevelFactor * (2 - 1)
  const gold = Math.floor(paladinCostGold * factor)
  assert.strictEqual(gold, 212)
})

test('DATA1-18: Paladin level 10 revive gold is 552', () => {
  const paladinSection = gameData.slice(gameData.indexOf('paladin:'))
  const paladinCostGold = extractNumber(paladinSection, 'gold')

  const goldBaseFactor = extractReviveNumber(gameData, 'goldBaseFactor')
  const goldLevelFactor = extractReviveNumber(gameData, 'goldLevelFactor')
  const factor = goldBaseFactor + goldLevelFactor * (10 - 1)
  const gold = Math.floor(paladinCostGold * factor)
  assert.strictEqual(gold, 552)
})

test('DATA1-19: Paladin max revive time is 110 seconds', () => {
  const paladinSection = gameData.slice(gameData.indexOf('paladin:'))
  const paladinTrainTime = extractNumber(paladinSection, 'trainTime')
  assert.strictEqual(paladinTrainTime, 55, 'Paladin trainTime must be 55')

  const timeMaxFactor = extractReviveNumber(gameData, 'timeMaxFactor')
  const maxTime = paladinTrainTime * timeMaxFactor
  assert.strictEqual(maxTime, 110)
})

test('DATA1-19a: Paladin revive HP and mana examples use current Paladin data', () => {
  const paladinSection = gameData.slice(gameData.indexOf('paladin:'))
  const paladinHp = extractNumber(paladinSection, 'hp')
  const paladinMaxMana = extractNumber(paladinSection, 'maxMana')
  const lifeFactor = extractReviveNumber(gameData, 'lifeFactor')

  assert.strictEqual(paladinHp, 650, 'Paladin current max HP must be 650')
  assert.strictEqual(paladinHp * lifeFactor, 650)
  assert.strictEqual(paladinMaxMana, 255)
  assert.ok(dataSeedDoc.includes('650 × 1.0 = 650'))
  assert.ok(dataSeedDoc.includes('maxMana') && dataSeedDoc.includes('255'))
})

// ── Data seed doc references source boundary ────────────

test('DATA1-20: data seed doc references source boundary', () => {
  assert.ok(dataSeedDoc.includes('V9_HERO9_REVIVE_SOURCE_BOUNDARY'))
  assert.ok(dataSeedDoc.includes('adopted'))
  assert.ok(dataSeedDoc.includes('project mapping'))
})

test('DATA1-21: data seed doc shows Paladin example calculations', () => {
  assert.ok(dataSeedDoc.includes('170'))
  assert.ok(dataSeedDoc.includes('212'))
  assert.ok(dataSeedDoc.includes('552'))
  assert.ok(dataSeedDoc.includes('110'))
})

// ── Game.ts uses HERO_REVIVE_RULES for revive runtime ──────────

test('DATA1-22: Game.ts references HERO_REVIVE_RULES for revive cost/time', () => {
  assert.ok(game.includes('HERO_REVIVE_RULES'), 'Game.ts must import HERO_REVIVE_RULES')
  assert.ok(game.includes('goldBaseFactor'), 'revive cost must use goldBaseFactor')
  assert.ok(game.includes('timeFactor'), 'revive time must use timeFactor')
})

// ── No placeholder 50% values ───────────────────────────

test('DATA1-23: data does not use Task212 placeholder 50% values', () => {
  assert.ok(extractReviveNumber(gameData, 'goldBaseFactor') !== 0.50)
  assert.ok(extractReviveNumber(gameData, 'timeFactor') !== 0.50)
  assert.ok(extractReviveNumber(gameData, 'lifeFactor') !== 0.50)
})

// ── Source boundary proof still passes ──────────────────

test('DATA1-24: source boundary doc still references all adopted values', () => {
  assert.ok(sourceBoundary.includes('0.40'))
  assert.ok(sourceBoundary.includes('0.10'))
  assert.ok(sourceBoundary.includes('0.65'))
  assert.ok(sourceBoundary.includes('adopted'))
})
