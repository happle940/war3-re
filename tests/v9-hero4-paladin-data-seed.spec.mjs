/**
 * V9 HERO4-DATA2 Paladin data seed static proof.
 *
 * Proves the paladin unit entry exists in GameData with HERO2-SRC1 adopted
 * values, hero fields are in UnitDef, and no runtime/Holy Light leakage.
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

function unitBlock(key) {
  return gameData.match(new RegExp(`\\n\\s{2}${key}:\\s*\\{[\\s\\S]*?\\n\\s{2}\\},`))?.[0] ?? ''
}

function buildingBlock(key) {
  return gameData.match(new RegExp(`\\n\\s{2}${key}:\\s*\\{[\\s\\S]*?\\n\\s{2}\\},`))?.[0] ?? ''
}

// ── UnitDef hero fields ─────────────────────────────────

test('PAL-1: UnitDef has hero-specific optional fields', () => {
  assert.ok(gameData.includes('isHero?'))
  assert.ok(gameData.includes('heroLevel?'))
  assert.ok(gameData.includes('heroXP?'))
  assert.ok(gameData.includes('heroSkillPoints?'))
  assert.ok(gameData.includes('isDead?'))
})

// ── Paladin data fields ─────────────────────────────────

test('PAL-2: paladin exists in UNITS', () => {
  const block = unitBlock('paladin')
  assert.ok(block.length > 0, 'paladin must exist in UNITS')
})

test('PAL-3: paladin has correct key and name', () => {
  const block = unitBlock('paladin')
  assert.ok(block.includes("key: 'paladin'"))
  assert.ok(block.includes("name: '圣骑士'"))
})

test('PAL-4: paladin cost is 425 gold / 100 lumber', () => {
  const block = unitBlock('paladin')
  assert.ok(block.includes('cost: { gold: 425, lumber: 100 }'))
})

test('PAL-5: paladin trainTime is 55', () => {
  const block = unitBlock('paladin')
  assert.ok(block.includes('trainTime: 55'))
})

test('PAL-6: paladin hp is 650', () => {
  const block = unitBlock('paladin')
  assert.ok(block.includes('hp: 650'))
})

test('PAL-7: paladin speed is 3.0, supply is 5', () => {
  const block = unitBlock('paladin')
  assert.ok(block.includes('speed: 3.0'))
  assert.ok(block.includes('supply: 5'))
})

test('PAL-8: paladin attack stats: damage 24, range 1.0, cooldown 2.2', () => {
  const block = unitBlock('paladin')
  assert.ok(block.includes('attackDamage: 24'))
  assert.ok(block.includes('attackRange: 1.0'))
  assert.ok(block.includes('attackCooldown: 2.2'))
})

test('PAL-9: paladin armor is 4, sightRange is 10', () => {
  const block = unitBlock('paladin')
  assert.ok(block.includes('armor: 4'))
  assert.ok(block.includes('sightRange: 10'))
})

test('PAL-10: paladin attackType Normal, armorType Heavy', () => {
  const block = unitBlock('paladin')
  assert.ok(block.includes('attackType: AttackType.Normal'))
  assert.ok(block.includes('armorType: ArmorType.Heavy'))
})

test('PAL-11: paladin maxMana is 255', () => {
  const block = unitBlock('paladin')
  assert.ok(block.includes('maxMana: 255'))
})

test('PAL-12: paladin does not have manaRegen (not yet mapped)', () => {
  const block = unitBlock('paladin')
  assert.ok(!block.includes('manaRegen'), 'manaRegen must not be set until mapping established')
})

test('PAL-13: paladin hero fields: isHero, heroLevel, heroXP, heroSkillPoints, isDead', () => {
  const block = unitBlock('paladin')
  assert.ok(block.includes('isHero: true'))
  assert.ok(block.includes('heroLevel: 1'))
  assert.ok(block.includes('heroXP: 0'))
  assert.ok(block.includes('heroSkillPoints: 1'))
  assert.ok(block.includes('isDead: false'))
})

test('PAL-14: paladin canGather is false', () => {
  const block = unitBlock('paladin')
  assert.ok(block.includes('canGather: false'))
})

// ── Altar still references paladin ──────────────────────

test('PAL-15: BUILDINGS.altar_of_kings.trains still references paladin', () => {
  const block = buildingBlock('altar_of_kings')
  assert.ok(block.includes("trains: ['paladin']"))
})

// ── No runtime leakage ──────────────────────────────────

test('PAL-16: Game.ts may reference paladin through hero-specific path after HERO6B', () => {
  if (game.includes('paladin')) {
    assert.ok(game.includes('isHero'), 'paladin reference must be through hero-specific isHero path')
  }
})

test('PAL-17: SimpleAI does not reference paladin', () => {
  assert.ok(!simpleAI.includes('paladin'), 'SimpleAI must not reference paladin')
})

// ── Holy Light stage boundary ───────────────────────────

test('PAL-18: Holy Light runtime may exist after HERO7, using ABILITIES data', () => {
  if (gameData.includes("key: 'holy_light'")) {
    const block = gameData.match(/holy_light:\s*\{[\s\S]*?\n\s{2}\},/)?.[0] ?? ''
    assert.ok(block.includes("ownerType: 'paladin'"), 'holy_light must belong to paladin')
    assert.ok(block.includes("effectType: 'flatHeal'"), 'holy_light must remain a flatHeal data seed')
  }
  if (game.includes('holy_light')) {
    assert.ok(game.includes('ABILITIES.holy_light'), 'holy_light runtime must use ABILITIES data')
  }
  assert.ok(!simpleAI.includes('holy_light'), 'SimpleAI must not reference holy_light')
})

// ── Source boundary consistency ──────────────────────────

test('PAL-19: source boundary adopted values match paladin data', () => {
  assert.ok(src.includes('425'), 'source boundary must record 425 gold')
  assert.ok(src.includes('650'), 'source boundary must record 650 hp')
  assert.ok(src.includes('2.2'), 'source boundary must record 2.2 cooldown')
  assert.ok(src.includes('255'), 'source boundary must record 255 mana')
})

test('PAL-20: paladin is not in any existing building trains except altar', () => {
  const paladinInBarracks = gameData.match(/barracks:\s*\{[\s\S]*?trains:\s*\[[^\]]*\]/)?.[0] ?? ''
  assert.ok(!paladinInBarracks.includes('paladin'), 'barracks must not train paladin')
  const paladinInWorkshop = gameData.match(/workshop:\s*\{[\s\S]*?trains:\s*\[[^\]]*\]/)?.[0] ?? ''
  assert.ok(!paladinInWorkshop.includes('paladin'), 'workshop must not train paladin')
  const paladinInAS = gameData.match(/arcane_sanctum:\s*\{[\s\S]*?trains:\s*\[[^\]]*\]/)?.[0] ?? ''
  assert.ok(!paladinInAS.includes('paladin'), 'arcane_sanctum must not train paladin')
})
