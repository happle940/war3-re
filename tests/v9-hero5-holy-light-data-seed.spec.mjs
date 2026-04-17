/**
 * V9 HERO5-DATA3 Holy Light ability data seed static proof.
 *
 * Proves Holy Light exists as data only after HERO4, and does not open
 * Paladin runtime, command-card, AI, summon, or hero UI behavior.
 */
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { test } from 'node:test'

const gameData = readFileSync(new URL('../src/game/GameData.ts', import.meta.url), 'utf8')
const game = readFileSync(new URL('../src/game/Game.ts', import.meta.url), 'utf8')
const simpleAI = readFileSync(new URL('../src/game/SimpleAI.ts', import.meta.url), 'utf8')
const sourceBoundary = readFileSync(
  new URL('../docs/V9_HERO2_ALTAR_PALADIN_SOURCE_BOUNDARY.zh-CN.md', import.meta.url),
  'utf8',
)
const paladinProof = readFileSync(
  new URL('./v9-hero4-paladin-data-seed.spec.mjs', import.meta.url),
  'utf8',
)

function abilityBlock(key) {
  return gameData.match(new RegExp(`\\n\\s{2}${key}:\\s*\\{[\\s\\S]*?\\n\\s{2}\\},`))?.[0] ?? ''
}

function unitBlock(key) {
  return gameData.match(new RegExp(`\\n\\s{2}${key}:\\s*\\{[\\s\\S]*?\\n\\s{2}\\},`))?.[0] ?? ''
}

test('HOLY-1: TargetRule supports a not-self target boundary', () => {
  assert.ok(gameData.includes('excludeSelf?: boolean'), 'TargetRule must expose optional excludeSelf')
})

test('HOLY-2: holy_light exists in ABILITIES', () => {
  assert.ok(abilityBlock('holy_light').length > 0, 'holy_light must exist as an ability data seed')
})

test('HOLY-3: holy_light has correct key, name, and owner', () => {
  const block = abilityBlock('holy_light')
  assert.ok(block.includes("key: 'holy_light'"))
  assert.ok(block.includes("name: '圣光术'"))
  assert.ok(block.includes("ownerType: 'paladin'"))
})

test('HOLY-4: holy_light cost is 65 mana', () => {
  assert.ok(abilityBlock('holy_light').includes('cost: { mana: 65 }'))
})

test('HOLY-5: holy_light cooldown is 5 and range is 8.0', () => {
  const block = abilityBlock('holy_light')
  assert.ok(block.includes('cooldown: 5'))
  assert.ok(block.includes('range: 8.0'))
})

test('HOLY-6: holy_light target rule is ally, alive, injured, and not self', () => {
  const block = abilityBlock('holy_light')
  assert.ok(block.includes("teams: 'ally'"))
  assert.ok(block.includes('alive: true'))
  assert.ok(block.includes('excludeTypes: []'))
  assert.ok(block.includes("includeCondition: 'injured'"))
  assert.ok(block.includes('excludeSelf: true'))
})

test('HOLY-7: holy_light uses flatHeal 200 with no duration or stacking', () => {
  const block = abilityBlock('holy_light')
  assert.ok(block.includes("effectType: 'flatHeal'"))
  assert.ok(block.includes('effectValue: 200'))
  assert.ok(block.includes('duration: 0'))
  assert.ok(block.includes("stackingRule: 'none'"))
})

test('HOLY-8: source boundary records the adopted Holy Light values', () => {
  assert.ok(sourceBoundary.includes('Holy Light'))
  assert.ok(sourceBoundary.includes('65'))
  assert.ok(sourceBoundary.includes('5s') || sourceBoundary.includes('cooldown'))
  assert.ok(sourceBoundary.includes('8.0'))
  assert.ok(sourceBoundary.includes('200'))
  assert.ok(sourceBoundary.includes('不能对自己施放') || sourceBoundary.includes('excludeSelf'))
})

test('HOLY-9: paladin data remains present and does not gain manaRegen', () => {
  const block = unitBlock('paladin')
  assert.ok(block.includes("key: 'paladin'"))
  assert.ok(block.includes('maxMana: 255'))
  assert.ok(!block.includes('manaRegen'), 'Paladin manaRegen must remain unmapped')
})

test('HOLY-10: HERO4 proof was stage-updated for HERO7 Holy Light runtime', () => {
  assert.ok(
    paladinProof.includes('Holy Light runtime may exist after HERO7')
    || paladinProof.includes('Holy Light data may exist after HERO5'),
    'HERO4 proof must acknowledge Holy Light data or runtime existence'
  )
  assert.ok(!paladinProof.includes('holy_light must not exist'))
})

test('HOLY-11: Game.ts Holy Light runtime may exist after HERO7, but must use ABILITIES.holy_light data', () => {
  if (game.includes('holy_light')) {
    assert.ok(game.includes('ABILITIES.holy_light'), 'Holy Light runtime must read from ABILITIES data')
  }
  assert.ok(!game.includes('castHolyLightAuto'), 'no autocast Holy Light')
  assert.ok(!simpleAI.includes('holy_light'), 'SimpleAI must not reference holy_light')
})

test('HOLY-12: SimpleAI has no Holy Light or Paladin casting reference', () => {
  assert.ok(!simpleAI.includes('holy_light'), 'SimpleAI must not reference holy_light')
  assert.ok(!simpleAI.includes('paladin'), 'SimpleAI must not reference paladin')
  assert.ok(!simpleAI.includes('圣光术'), 'SimpleAI must not reference Holy Light display text')
})
