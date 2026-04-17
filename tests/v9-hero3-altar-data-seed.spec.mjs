/**
 * V9 HERO3-DATA1 Altar of Kings data seed static proof.
 *
 * Proves the altar_of_kings building entry exists in GameData with
 * HERO2-SRC1 adopted values, and no Paladin/Holy Light/runtime leakage.
 */
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { test } from 'node:test'

const gameData = readFileSync(new URL('../src/game/GameData.ts', import.meta.url), 'utf8')
const game = readFileSync(new URL('../src/game/Game.ts', import.meta.url), 'utf8')
const simpleAI = readFileSync(new URL('../src/game/SimpleAI.ts', import.meta.url), 'utf8')
const src = readFileSync(
  new URL('../docs/V9_HERO2_ALTAR_PALADIN_SOURCE_BOUNDARY.zh-CN.md', import.meta.url),
  'utf8',
)

function buildingBlock(key) {
  return gameData.match(new RegExp(`\\n\\s{2}${key}:\\s*\\{[\\s\\S]*?\\n\\s{2}\\},`))?.[0] ?? ''
}

// ── Altar data fields ───────────────────────────────────

test('ALTAR-1: altar_of_kings exists in BUILDINGS', () => {
  const block = buildingBlock('altar_of_kings')
  assert.ok(block.length > 0, 'altar_of_kings must exist in BUILDINGS')
})

test('ALTAR-2: altar_of_kings has correct key and name', () => {
  const block = buildingBlock('altar_of_kings')
  assert.ok(block.includes("key: 'altar_of_kings'"))
  assert.ok(block.includes("name: '国王祭坛'"))
})

test('ALTAR-3: altar_of_kings cost is 180 gold / 50 lumber', () => {
  const block = buildingBlock('altar_of_kings')
  assert.ok(block.includes('cost: { gold: 180, lumber: 50 }'))
})

test('ALTAR-4: altar_of_kings buildTime is 60', () => {
  const block = buildingBlock('altar_of_kings')
  assert.ok(block.includes('buildTime: 60'))
})

test('ALTAR-5: altar_of_kings hp is 900', () => {
  const block = buildingBlock('altar_of_kings')
  assert.ok(block.includes('hp: 900'))
})

test('ALTAR-6: altar_of_kings supply is 0, size is 3', () => {
  const block = buildingBlock('altar_of_kings')
  assert.ok(block.includes('supply: 0'))
  assert.ok(block.includes('size: 3'))
})

test('ALTAR-7: altar_of_kings armor is 5 and armorType is Heavy (Fortified mapping)', () => {
  const block = buildingBlock('altar_of_kings')
  assert.ok(block.includes('armor: 5'))
  assert.ok(block.includes('armorType: ArmorType.Heavy'))
})

test('ALTAR-8: altar_of_kings trains only paladin (future contract data)', () => {
  const block = buildingBlock('altar_of_kings')
  assert.ok(block.includes("trains: ['paladin']"))
})

test('ALTAR-9: altar_of_kings has clear hero altar description', () => {
  const block = buildingBlock('altar_of_kings')
  assert.ok(block.includes("description: '英雄祭坛"))
})

// ── Paladin / Holy Light not leaked ─────────────────────

test('ALTAR-10: Paladin data may exist after HERO4, runtime may exist after HERO6B', () => {
  if (gameData.includes("key: 'paladin'")) {
    const block = gameData.match(/paladin:\s*\{[\s\S]*?\n\s{2}\},/)?.[0] ?? ''
    assert.ok(block.includes('isHero: true'), 'paladin must be a hero')
  }
})

test('ALTAR-11: Holy Light data may exist after HERO5, runtime may exist after HERO7', () => {
  if (gameData.includes("key: 'holy_light'")) {
    const block = gameData.match(/holy_light:\s*\{[\s\S]*?\n\s{2}\},/)?.[0] ?? ''
    assert.ok(block.includes('flatHeal'), 'holy_light must use flatHeal')
  }
  if (game.includes('holy_light')) {
    assert.ok(game.includes('ABILITIES.holy_light'), 'holy_light runtime must reference ABILITIES data')
  }
})

// ── Worker build menu not changed ───────────────────────

test('ALTAR-12: worker buildable does not include altar_of_kings', () => {
  const workerBlock = gameData.match(/worker:\s*\{[\s\S]*?\n\s{2}\},/)?.[0] ?? ''
  assert.ok(!workerBlock.includes('altar_of_kings'))
  // Also check BuildingDef buildable arrays
  const buildableMatch = gameData.match(/buildable:\s*\[([^\]]*)\]/g) || []
  for (const m of buildableMatch) {
    assert.ok(!m.includes('altar_of_kings'), `buildable must not include altar: ${m}`)
  }
})

// ── No runtime changes ──────────────────────────────────

test('ALTAR-13: Game.ts may reference altar_of_kings through data lookups after HERO6A', () => {
  // After HERO6A, altar_of_kings is in PEASANT_BUILD_MENU but Game.ts uses BUILDINGS[key] lookups
  if (game.includes('altar_of_kings')) {
    assert.ok(game.includes('BUILDINGS'), 'altar_of_kings reference must be through BUILDINGS data')
  }
})

test('ALTAR-14: SimpleAI does not reference altar_of_kings', () => {
  assert.ok(!simpleAI.includes('altar_of_kings'), 'SimpleAI must not reference altar_of_kings')
})

// ── Source boundary consistency ──────────────────────────

test('ALTAR-15: source boundary still records Altar adopted values', () => {
  assert.ok(src.includes('altar_of_kings'))
  assert.ok(src.includes('180'))
  assert.ok(src.includes('900'))
})

test('ALTAR-16: source boundary says Altar data comes after SRC1', () => {
  assert.ok(src.includes('HERO3') || src.includes('Altar data seed'))
})
