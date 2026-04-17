/**
 * V9 HN7-DATA7 Animal War Training data seed proof.
 *
 * Static proof that RESEARCHES.animal_war_training exists with correct values
 * from the source packet, Barracks hook, multi-building prerequisites,
 * single-level boundary, and forbidden branches.
 */
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { test } from 'node:test'

const gameData = readFileSync(new URL('../src/game/GameData.ts', import.meta.url), 'utf8')
const sourcePacket = readFileSync(
  new URL('../docs/V9_HN7_ANIMAL_WAR_TRAINING_SOURCE_PACKET.zh-CN.md', import.meta.url),
  'utf8',
)

// ── Data values ──────────────────────────────────────────

test('AWT-DATA7-1: animal_war_training exists with correct key, name, cost, time', () => {
  for (const expected of [
    "key: 'animal_war_training'",
    "name: '动物作战训练'",
    'gold: 125, lumber: 125',
    'researchTime: 40',
    "'骑士生命值 +100'",
  ]) {
    assert.ok(gameData.includes(expected), `${expected} must be in GameData`)
  }
})

test('AWT-DATA7-2: requiresBuilding is barracks', () => {
  assert.ok(
    gameData.includes("requiresBuilding: 'barracks'") && gameData.includes('animal_war_training'),
    'requiresBuilding must be barracks',
  )
})

test('AWT-DATA7-3: requiresBuildings lists castle, lumber_mill, blacksmith', () => {
  const match = gameData.match(/animal_war_training:\s*\{[\s\S]*?\n\s{2}\},/)
  const block = match?.[0] ?? ''
  assert.ok(block.includes("'castle'"), 'must require castle')
  assert.ok(block.includes("'lumber_mill'"), 'must require lumber_mill')
  assert.ok(block.includes("'blacksmith'"), 'must require blacksmith')
})

test('AWT-DATA7-4: effect is knight maxHp +100', () => {
  const match = gameData.match(/animal_war_training:\s*\{[\s\S]*?\n\s{2}\},/)
  const block = match?.[0] ?? ''
  assert.ok(
    block.includes("targetUnitType: 'knight', stat: 'maxHp', value: 100"),
    'must apply maxHp +100 to knight',
  )
})

test('AWT-DATA7-5: only knight is affected — no dragonhawk, gryphon, or other units', () => {
  const match = gameData.match(/animal_war_training:\s*\{[\s\S]*?\n\s{2}\},/)
  const block = match?.[0] ?? ''
  for (const forbidden of ['dragonhawk', 'gryphon', 'flying_machine', 'siege_engine', 'spell_breaker']) {
    assert.ok(!block.includes(forbidden), `${forbidden} must not appear in AWT effects`)
  }
  // Only one effect row
  const effectRows = block.match(/targetUnitType:/g)
  assert.ok(effectRows?.length === 1, 'AWT must have exactly one effect row (knight only)')
})

// ── Barracks hook ────────────────────────────────────────

test('AWT-DATA7-6: Barracks researches includes animal_war_training', () => {
  const barracks = gameData.match(/barracks:\s*\{[\s\S]*?\n\s{2}\},/)?.[0] ?? ''
  assert.ok(
    barracks.includes("researches: ['animal_war_training']"),
    'Barracks must expose animal_war_training research',
  )
})

// ── Source alignment ─────────────────────────────────────

test('AWT-DATA7-7: data values match source packet fixed values', () => {
  // Source packet says: cost 125 gold / 125 lumber, researchTime 40, barracks, knight maxHp +100
  assert.ok(sourcePacket.includes('cost: 125 gold / 125 lumber'), 'source must have 125/125')
  assert.ok(sourcePacket.includes('researchTime: 40'), 'source must have 40s')
  assert.ok(sourcePacket.includes('requiresBuilding: barracks'), 'source must have barracks')
  assert.ok(sourcePacket.includes('knight maxHp +100'), 'source must have knight maxHp +100')
})

test('AWT-DATA7-8: data uses single-level structure — no level 2 or 3', () => {
  assert.ok(!gameData.includes('animal_war_training_level_2'), 'no level 2 key')
  assert.ok(!gameData.includes('animal_war_training_level_3'), 'no level 3 key')
  assert.ok(!gameData.includes('animal_war_training_2'), 'no alternate level 2 key')
  // No prerequisiteResearch for AWT (it's single-level, no chain)
  const match = gameData.match(/animal_war_training:\s*\{[\s\S]*?\n\s{2}\},/)
  const block = match?.[0] ?? ''
  assert.ok(!block.includes('prerequisiteResearch'), 'single-level must not have prerequisiteResearch')
})

// ── Forbidden branches ───────────────────────────────────

test('AWT-DATA7-9: no forbidden data added by DATA7', () => {
  for (const forbidden of [
    'gryphon', 'dragonhawk', 'flying_machine',
    'siege_engine', 'spell_breaker',
    'studded_leather', 'reinforced_leather', 'dragonhide',
    'animal_war_training_level',
  ]) {
    assert.ok(!gameData.includes(forbidden), `${forbidden} must not be added by DATA7`)
  }
})

test('AWT-DATA7-10: Game.ts was not modified — no AWT runtime code', () => {
  const game = readFileSync(new URL('../src/game/Game.ts', import.meta.url), 'utf8')
  assert.ok(!game.includes('animal_war_training'), 'Game.ts must not reference animal_war_training')
})
