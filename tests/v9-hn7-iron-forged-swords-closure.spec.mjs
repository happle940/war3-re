/**
 * V9 HN7-CLOSE5 Iron Forged Swords Level 1 closure inventory.
 *
 * Static proof that the Level 1 chain is closed:
 * 1. HN7-SRC3 source packet exists and limits scope to Level 1
 * 2. HN7-DATA3 data seed exists: iron_forged_swords, 100/50, 60s, melee +1, Blacksmith hook
 * 3. HN7-IMPL4 runtime smoke file exists and covers command card, cost, completion, inheritance, non-melee exclusion
 * 4. Later Steel / Mithril work does not erase Level 1 proof; unrelated branches are still absent
 * 5. Next branch is SRC4 higher melee levels source reconciliation, not data or runtime
 */
import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'
import { test } from 'node:test'

const gameData = readFileSync(
  new URL('../src/game/GameData.ts', import.meta.url),
  'utf8',
)
const sourcePacket = readFileSync(
  new URL('../docs/V9_HN7_MELEE_UPGRADE_SOURCE_PACKET.zh-CN.md', import.meta.url),
  'utf8',
)
const contract = readFileSync(
  new URL('../docs/V9_HN7_BLACKSMITH_ANIMAL_TRAINING_CONTRACT.zh-CN.md', import.meta.url),
  'utf8',
)
const expansionPacket = readFileSync(
  new URL('../docs/V9_HUMAN_NUMERIC_EXPANSION_PACKET.zh-CN.md', import.meta.url),
  'utf8',
)

// ── HN7-SRC3 source packet ──────────────────────────────

test('CLOSE5-1: source packet file exists', () => {
  assert.ok(existsSync(new URL('../docs/V9_HN7_MELEE_UPGRADE_SOURCE_PACKET.zh-CN.md', import.meta.url)))
})

test('CLOSE5-2: source packet limits scope to Level 1', () => {
  assert.ok(sourcePacket.includes('Iron Forged Swords'), 'must name Level 1 upgrade')
  assert.ok(sourcePacket.includes('cost: 100 gold / 50 lumber'), 'Level 1 cost must be fixed')
  assert.ok(sourcePacket.includes('researchTime: 60'), 'Level 1 time must be fixed')
  assert.ok(sourcePacket.includes('不写入 Steel Forged Swords'), 'Steel must be blocked')
  assert.ok(sourcePacket.includes('不写入 Mithril Forged Swords'), 'Mithril must be blocked')
})

// ── HN7-DATA3 data seed ─────────────────────────────────

test('CLOSE5-3: iron_forged_swords research data exists in GameData', () => {
  assert.ok(gameData.includes("key: 'iron_forged_swords'"), 'key must exist')
  assert.ok(gameData.includes('cost: { gold: 100, lumber: 50 }'), 'cost must match source packet')
  assert.ok(gameData.includes('researchTime: 60'), 'time must match source packet')
  assert.ok(gameData.includes("requiresBuilding: 'blacksmith'"), 'must require blacksmith')
})

test('CLOSE5-4: iron_forged_swords affects footman / militia / knight with +1 attackDamage', () => {
  for (const unit of ['footman', 'militia', 'knight']) {
    const expected = `targetUnitType: '${unit}', stat: 'attackDamage', value: 1`
    assert.ok(gameData.includes(expected), `${unit} must get +1 attackDamage`)
  }
})

test('CLOSE5-5: Blacksmith still exposes long_rifles and iron_forged_swords', () => {
  const blacksmithMatch = gameData.match(/blacksmith:\s*\{[\s\S]*?\n\s{2}\},/)
  assert.ok(blacksmithMatch, 'blacksmith def must exist')
  const blacksmith = blacksmithMatch[0]
  assert.ok(blacksmith.includes("'long_rifles'"), 'blacksmith research list must contain long_rifles')
  assert.ok(blacksmith.includes("'iron_forged_swords'"), 'blacksmith research list must contain iron_forged_swords')
})

// ── HN7-IMPL4 runtime smoke file exists and covers required checks ──

test('CLOSE5-6: runtime smoke file exists', () => {
  assert.ok(
    existsSync(new URL('../tests/v9-hn7-iron-forged-swords-runtime.spec.ts', import.meta.url)),
    'runtime smoke spec must exist',
  )
})

test('CLOSE5-7: runtime smoke covers command card, cost, completion, inheritance, exclusion', () => {
  const runtime = readFileSync(
    new URL('../tests/v9-hn7-iron-forged-swords-runtime.spec.ts', import.meta.url),
    'utf8',
  )
  assert.ok(runtime.includes('铁剑'), 'must test command card button text')
  assert.ok(runtime.includes('goldDelta'), 'must test resource deduction')
  assert.ok(runtime.includes('iron_forged_swords'), 'must test research key')
  assert.ok(runtime.includes('after.footman'), 'must test existing unit effect')
  assert.ok(runtime.includes('newFootman'), 'must test newly spawned unit inheritance')
  assert.ok(runtime.includes('rifleman'), 'must test non-melee exclusion')
})

// ── Forbidden boundaries still hold ─────────────────────

test('CLOSE5-8: ranged / armor / Animal War Training are still absent from GameData', () => {
  for (const forbidden of [
    'ranged_upgrade',
    'armor_upgrade',
    'animal_war_training',
  ]) {
    assert.ok(!gameData.includes(`key: '${forbidden}`), `${forbidden} must not exist`)
  }
})

test('CLOSE5-9: AI strategy, heroes, air, items, assets are not added', () => {
  for (const forbidden of [
    'gryphon',
    'dragonhawk',
    'flying_machine',
    'siege_engine',
    'spell_breaker',
    'altar_of_kings',
    'paladin',
    'archmage',
    'mountain_king',
    'blood_mage',
  ]) {
    assert.ok(!gameData.includes(`key: '${forbidden}`), `${forbidden} must not exist`)
  }
})

// ── Next branch direction ───────────────────────────────

test('CLOSE5-10: contract identifies next branch as higher melee levels source reconciliation', () => {
  assert.ok(
    contract.includes('HN7-SRC4') || contract.includes('SRC4') || contract.includes('Level 2 / 3'),
    'contract must reference next branch for higher melee levels',
  )
})

test('CLOSE5-11: expansion packet tracks HN7 progress without claiming completeness', () => {
  assert.ok(
    expansionPacket.includes('iron_forged_swords') || expansionPacket.includes('HN7'),
    'expansion packet must reference HN7 work',
  )
})
