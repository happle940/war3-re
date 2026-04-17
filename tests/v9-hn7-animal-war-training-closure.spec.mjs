/**
 * V9 HN7-CLOSE10 Animal War Training closure inventory.
 *
 * Proves AWT minimal chain is closed:
 * 1. SRC7 source packet fixes AWT values and single-level nature.
 * 2. MODEL8 adds requiresBuildings for multi-building prerequisites.
 * 3. DATA7 seeds RESEARCHES.animal_war_training with correct values.
 * 4. IMPL9 proves runtime consumption via Barracks command card, prerequisites,
 *    cost, and Knight maxHp effect.
 * 5. No Leather Armor, AI upgrade strategy, heroes, air, items, or assets.
 */
import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'
import { test } from 'node:test'

const gameData = readFileSync(new URL('../src/game/GameData.ts', import.meta.url), 'utf8')
const game = readFileSync(new URL('../src/game/Game.ts', import.meta.url), 'utf8')
const sourcePacket = readFileSync(
  new URL('../docs/V9_HN7_ANIMAL_WAR_TRAINING_SOURCE_PACKET.zh-CN.md', import.meta.url),
  'utf8',
)
const expansionPacket = readFileSync(
  new URL('../docs/V9_HUMAN_NUMERIC_EXPANSION_PACKET.zh-CN.md', import.meta.url),
  'utf8',
)
const evidenceLedger = readFileSync(
  new URL('../docs/V9_MAINTENANCE_EXPANSION_EVIDENCE_LEDGER.zh-CN.md', import.meta.url),
  'utf8',
)
const remainingGates = readFileSync(
  new URL('../docs/V9_MAINTENANCE_EXPANSION_REMAINING_GATES.zh-CN.md', import.meta.url),
  'utf8',
)

// ── SRC7: source reconciliation ──────────────────────────────

test('AWT-CLOSE-1: source packet exists and fixes adopted values', () => {
  for (const expected of [
    'cost: 125 gold / 125 lumber',
    'researchTime: 40',
    'requiresBuilding: barracks',
    'buildingPrerequisites: castle + lumber_mill + blacksmith',
    'knight maxHp +100',
  ]) {
    assert.ok(sourcePacket.includes(expected), `${expected} must be sourced`)
  }
})

test('AWT-CLOSE-2: source packet documents single-level nature', () => {
  assert.ok(sourcePacket.includes('一次性单级升级'), 'must document single-level')
  assert.ok(sourcePacket.includes('没有 Level 2 / Level 3'), 'must reject multi-tier')
})

test('AWT-CLOSE-3: source packet records patch history without adopting old values', () => {
  assert.ok(sourcePacket.includes('1.10'), '1.10 history must exist')
  assert.ok(sourcePacket.includes('1.12'), '1.12 history must exist')
  assert.ok(sourcePacket.includes('1.31.0'), '1.31.0 current must exist')
  assert.ok(!sourcePacket.includes('3-source consensus'), 'must not fabricate consensus')
})

// ── MODEL8: multi-building prerequisite model ────────────────

test('AWT-CLOSE-4: ResearchDef has requiresBuildings field', () => {
  const unitDefMatch = gameData.match(/export interface ResearchDef \{[\s\S]*?\n\}/)
  assert.ok(unitDefMatch, 'ResearchDef interface must exist')
  assert.ok(unitDefMatch[0].includes('requiresBuildings?: string[]'),
    'ResearchDef must have requiresBuildings?: string[]')
})

test('AWT-CLOSE-5: getResearchAvailability checks requiresBuildings', () => {
  assert.ok(game.includes('def.requiresBuildings'), 'Game.ts must check requiresBuildings')
  assert.ok(game.includes('missing.push(bDef?.name'), 'must list missing building Chinese names')
})

// ── DATA7: data seed ────────────────────────────────────────

test('AWT-CLOSE-6: RESEARCHES.animal_war_training has correct values', () => {
  const match = gameData.match(/animal_war_training:\s*\{[\s\S]*?\n\s{2}\},/)
  const block = match?.[0] ?? ''
  for (const expected of [
    "key: 'animal_war_training'",
    "name: '动物作战训练'",
    'gold: 125, lumber: 125',
    'researchTime: 40',
    "requiresBuilding: 'barracks'",
    "'castle', 'lumber_mill', 'blacksmith'",
    "targetUnitType: 'knight', stat: 'maxHp', value: 100",
  ]) {
    assert.ok(block.includes(expected), `${expected} must be in AWT block`)
  }
})

test('AWT-CLOSE-7: AWT effect targets only knight', () => {
  const match = gameData.match(/animal_war_training:\s*\{[\s\S]*?\n\s{2}\},/)
  const block = match?.[0] ?? ''
  const effectRows = block.match(/targetUnitType:/g)
  assert.ok(effectRows?.length === 1, 'AWT must have exactly one effect row')
  for (const forbidden of ['dragonhawk', 'gryphon', 'flying_machine', 'siege_engine']) {
    assert.ok(!block.includes(forbidden), `${forbidden} must not appear in AWT effects`)
  }
})

test('AWT-CLOSE-8: Barracks researches includes animal_war_training', () => {
  const barracks = gameData.match(/barracks:\s*\{[\s\S]*?\n\s{2}\},/)?.[0] ?? ''
  assert.ok(barracks.includes("researches: ['animal_war_training']"),
    'Barracks must expose animal_war_training')
})

// ── IMPL9: runtime smoke ────────────────────────────────────

test('AWT-CLOSE-9: runtime smoke file exists and covers AWT behavior', () => {
  const runtimePath = new URL('../tests/v9-hn7-animal-war-training-runtime.spec.ts', import.meta.url)
  assert.ok(existsSync(runtimePath), 'runtime smoke file must exist')
  const runtime = readFileSync(runtimePath, 'utf8')
  for (const expected of [
    '动物作战训练',
    '125',
    'maxHp',
    'knight',
  ]) {
    assert.ok(runtime.includes(expected), `runtime must cover ${expected}`)
  }
})

test('AWT-CLOSE-10: Game.ts has no AWT-specific runtime code', () => {
  assert.ok(!game.includes('animal_war_training'), 'AWT must be fully data-driven')
  assert.ok(game.includes('def.requiresBuildings'), 'generic multi-building check exists')
  assert.ok(game.includes('applyFlatDeltaEffect'), 'generic research effect applier exists')
  assert.ok(game.includes("stat: 'maxHp'") || game.includes('maxHp'), 'maxHp stat support exists')
})

// ── Boundary: no unrelated branches ─────────────────────────

test('AWT-CLOSE-11: Leather Armor, AI, heroes, air, items, assets remain absent', () => {
  for (const forbidden of [
    'studded_leather', 'reinforced_leather', 'dragonhide',
    'gryphon', 'dragonhawk', 'flying_machine',
    'siege_engine', 'spell_breaker',
    'paladin', 'archmage', 'mountain_king', 'blood_mage',
    'arcane_vault', 'gryphon_aviary',
  ]) {
    assert.ok(!gameData.includes(forbidden), `${forbidden} must not be in project data`)
  }
  // AWT source packet must name the forbidden branches
  for (const expected of ['Leather Armor', 'AI 升级策略', '英雄', '空军', '物品', '素材']) {
    assert.ok(sourcePacket.includes(expected), `${expected} must remain out of scope in source`)
  }
})

// ── Docs alignment ───────────────────────────────────────────

test('AWT-CLOSE-12: docs record the full SRC7 -> MODEL8 -> DATA7 -> IMPL9 chain', () => {
  for (const task of ['Task183', 'Task184', 'Task185', 'Task186']) {
    assert.ok(
      expansionPacket.includes(task) || evidenceLedger.includes(task),
      `docs must mention ${task}`,
    )
  }
  assert.ok(evidenceLedger.includes('HN7-SRC7'), 'ledger must have SRC7 entry')
  assert.ok(evidenceLedger.includes('HN7-MODEL8'), 'ledger must have MODEL8 entry')
  assert.ok(evidenceLedger.includes('HN7-DATA7'), 'ledger must have DATA7 entry')
  assert.ok(evidenceLedger.includes('HN7-IMPL9'), 'ledger must have IMPL9 entry')
})

test('AWT-CLOSE-13: remaining gates and ledger agree that CLOSE10 is closed', () => {
  assert.ok(remainingGates.includes('Task186'), 'remaining gates must record Task186')
  assert.ok(remainingGates.includes('HN7-IMPL9'), 'remaining gates must reference IMPL9')
  assert.ok(evidenceLedger.includes('HN7-CLOSE10 is accepted'), 'ledger must close CLOSE10')
  assert.ok(remainingGates.includes('Current adjacent work: HN7-'), 'remaining gates must move to next adjacent HN7 work')
  assert.ok(
    !remainingGates.includes('Current adjacent work: HN7-CLOSE10'),
    'remaining gates must not leave CLOSE10 as current after closure',
  )
})

test('AWT-CLOSE-14: docs do not claim complete Human or full T3', () => {
  assert.ok(!expansionPacket.includes('Human 完成'), 'must not claim complete Human')
  assert.ok(!expansionPacket.includes('全部 Human'), 'must not claim all Human complete')
  assert.ok(!expansionPacket.includes('完整三本'), 'must not claim full T3')
})
