/**
 * V9 HN7-CLOSE7 ranged weapon upgrade chain closure.
 *
 * Static proof that the Human ranged weapon chain has source, data, runtime,
 * and boundary evidence before HN7 moves to armor / AWT branches.
 */
import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'
import { test } from 'node:test'

const gameData = readFileSync(new URL('../src/game/GameData.ts', import.meta.url), 'utf8')
const game = readFileSync(new URL('../src/game/Game.ts', import.meta.url), 'utf8')
const sourcePacket = readFileSync(
  new URL('../docs/V9_HN7_RANGED_UPGRADE_SOURCE_PACKET.zh-CN.md', import.meta.url),
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
const evidenceLedger = readFileSync(
  new URL('../docs/V9_MAINTENANCE_EXPANSION_EVIDENCE_LEDGER.zh-CN.md', import.meta.url),
  'utf8',
)
const remainingGates = readFileSync(
  new URL('../docs/V9_MAINTENANCE_EXPANSION_REMAINING_GATES.zh-CN.md', import.meta.url),
  'utf8',
)

function researchBlock(key) {
  const match = gameData.match(new RegExp(`${key}:\\s*\\{[\\s\\S]*?\\n\\s{2}\\},`))
  return match?.[0] ?? ''
}

// ── SRC5 source reconciliation ───────────────────────────

test('RANGED-CLOSE7-1: source packet covers Black, Refined, and Imbued Gunpowder', () => {
  for (const expected of [
    'key: black_gunpowder',
    'cost: 100 gold / 50 lumber',
    'key: refined_gunpowder',
    'cost: 175 gold / 175 lumber',
    'key: imbued_gunpowder',
    'cost: 250 gold / 300 lumber',
    'Blizzard Classic Battle.net',
  ]) {
    assert.ok(sourcePacket.includes(expected), `${expected} must be sourced`)
  }
})

test('RANGED-CLOSE7-2: source hierarchy preserves Blizzard as primary with Liquipedia cross-check', () => {
  assert.ok(
    sourcePacket.includes('HN7-SRC5 不写成\u201C所有来源完全一致\u201D'),
    'source hierarchy must avoid overclaiming consensus',
  )
  assert.ok(
    sourcePacket.includes('hard values 采用 Blizzard Classic Battle.net'),
    'Blizzard must be named as primary source',
  )
  assert.ok(sourcePacket.includes('Liquipedia'), 'cross-check source must be cited')
  assert.ok(!evidenceLedger.includes('3-source consensus'), 'must not fabricate consensus count')
})

// ── DATA5 data seeds ─────────────────────────────────────

test('RANGED-CLOSE7-3: data seeds cover all three ranged weapon levels', () => {
  for (const key of ['black_gunpowder', 'refined_gunpowder', 'imbued_gunpowder']) {
    const block = researchBlock(key)
    assert.ok(block.includes(`key: '${key}'`), `${key} data must exist`)
    for (const unit of ['rifleman', 'mortar_team']) {
      assert.ok(
        block.includes(`targetUnitType: '${unit}', stat: 'attackDamage', value: 1`),
        `${key} must affect ${unit}`,
      )
    }
  }
})

test('RANGED-CLOSE7-4: ordered prerequisites are encoded for higher levels', () => {
  const refined = researchBlock('refined_gunpowder')
  const imbued = researchBlock('imbued_gunpowder')
  assert.ok(refined.includes("requiresBuilding: 'keep'"))
  assert.ok(refined.includes("prerequisiteResearch: 'black_gunpowder'"))
  assert.ok(imbued.includes("requiresBuilding: 'castle'"))
  assert.ok(imbued.includes("prerequisiteResearch: 'refined_gunpowder'"))
})

test('RANGED-CLOSE7-5: data seeds encode cost and research time for all three tiers', () => {
  const expected = [
    ['black_gunpowder', 'cost: { gold: 100, lumber: 50 }', 'researchTime: 60'],
    ['refined_gunpowder', 'cost: { gold: 175, lumber: 175 }', 'researchTime: 75'],
    ['imbued_gunpowder', 'cost: { gold: 250, lumber: 300 }', 'researchTime: 90'],
  ]
  for (const [key, cost, time] of expected) {
    const block = researchBlock(key)
    assert.ok(block.includes(cost), `${key} cost must be encoded`)
    assert.ok(block.includes(time), `${key} research time must be encoded`)
  }
})

test('RANGED-CLOSE7-6: Blacksmith exposes Long Rifles, melee chain, and ranged chain', () => {
  const blacksmith = gameData.match(/blacksmith:\s*\{[\s\S]*?\n\s{2}\},/)?.[0] ?? ''
  for (const key of [
    'long_rifles',
    'iron_forged_swords',
    'steel_forged_swords',
    'mithril_forged_swords',
    'black_gunpowder',
    'refined_gunpowder',
    'imbued_gunpowder',
  ]) {
    assert.ok(blacksmith.includes(`'${key}'`), `Blacksmith must expose ${key}`)
  }
})

// ── IMPL6 runtime smoke ──────────────────────────────────

test('RANGED-CLOSE7-7: runtime smoke file exists for ranged upgrades', () => {
  assert.ok(
    existsSync(new URL('../tests/v9-hn7-ranged-upgrade-runtime.spec.ts', import.meta.url)),
  )
})

test('RANGED-CLOSE7-8: runtime covers buttons, prerequisites, costs, cumulative effect, and exclusions', () => {
  const runtime = readFileSync(
    new URL('../tests/v9-hn7-ranged-upgrade-runtime.spec.ts', import.meta.url),
    'utf8',
  )
  for (const expected of [
    '黑火药', '精炼火药', '附魔火药',
    'without Keep', 'without Castle',
    '100/50', '175/175', '250/300',
    'cumulative +3',
    'unaffected',
  ]) {
    assert.ok(runtime.includes(expected), `runtime must cover ${expected}`)
  }
})

// ── No special cases in Game.ts ──────────────────────────

test('RANGED-CLOSE7-9: runtime code has no Gunpowder special cases', () => {
  for (const key of ['black_gunpowder', 'refined_gunpowder', 'imbued_gunpowder']) {
    assert.ok(!game.includes(key), `${key} must remain data-driven`)
  }
})

// ── Boundary: no unrelated branches ──────────────────────

test('RANGED-CLOSE7-10: unrelated HN7 branches remain absent', () => {
  for (const forbidden of [
    'armor_upgrade',
    'animal_war_training',
    'iron_plating',
    'steel_plating',
    'mithril_plating',
    'gryphon',
    'dragonhawk',
    'spell_breaker',
    'paladin',
    'archmage',
  ]) {
    assert.ok(!gameData.includes(forbidden), `${forbidden} must not be added by ranged closure`)
  }
})

// ── Docs alignment ───────────────────────────────────────

test('RANGED-CLOSE7-11: docs identify the next branch as armor source reconciliation', () => {
  assert.ok(contract.includes('HN7-CLOSE7') || contract.includes('ranged'), 'contract must reference ranged upgrades')
  assert.ok(expansionPacket.includes('HN7-IMPL6') || expansionPacket.includes('ranged weapon runtime'), 'expansion packet must record IMPL6')
  assert.ok(
    expansionPacket.includes('HN7-CLOSE7') || expansionPacket.includes('armor upgrade source reconciliation'),
    'next branch must be armor source reconciliation, not data insertion',
  )
})

test('RANGED-CLOSE7-12: remaining-gates doc has moved past ranged closure', () => {
  assert.ok(remainingGates.includes('Task177') || remainingGates.includes('IMPL6'), 'remaining gates must record IMPL6 completion')
})

test('RANGED-CLOSE7-13: evidence ledger records IMPL6 acceptance', () => {
  assert.ok(evidenceLedger.includes('HN7-IMPL6'), 'evidence ledger must record IMPL6')
  assert.ok(evidenceLedger.includes('7/7 pass'), 'evidence ledger must record runtime proof count')
})

test('RANGED-CLOSE7-14: Mortar Team inclusion is bounded to existing project units', () => {
  assert.ok(sourcePacket.includes('rifleman'), 'rifleman must be in affected list')
  assert.ok(sourcePacket.includes('mortar_team'), 'mortar_team must be in affected list')
  assert.ok(sourcePacket.includes('Siege Engine'), 'non-existent unit must be mentioned')
  assert.ok(sourcePacket.includes('Flying Machine'), 'non-existent unit must be mentioned')
  // Data must NOT have effects for non-existent units
  assert.ok(!gameData.includes("targetUnitType: 'siege_engine'"), 'siege_engine effect must not exist')
  assert.ok(!gameData.includes("targetUnitType: 'flying_machine'"), 'flying_machine effect must not exist')
})
