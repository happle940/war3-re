/**
 * V9 HN7-CLOSE6 melee weapon upgrade chain closure.
 *
 * Static proof that the Human melee weapon chain has source, data, runtime, and
 * boundary evidence before HN7 moves to ranged / armor / AWT branches.
 */
import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'
import { test } from 'node:test'

const gameData = readFileSync(new URL('../src/game/GameData.ts', import.meta.url), 'utf8')
const game = readFileSync(new URL('../src/game/Game.ts', import.meta.url), 'utf8')
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

test('MELEE-CLOSE6-1: source packets cover Iron, Steel, and Mithril', () => {
  for (const expected of [
    'key: iron_forged_swords',
    'cost: 100 gold / 50 lumber',
    'key: steel_forged_swords',
    'cost: 175 gold / 175 lumber',
    'key: mithril_forged_swords',
    'cost: 250 gold / 300 lumber',
    'Blizzard Classic Battle.net',
  ]) {
    assert.ok(sourcePacket.includes(expected), `${expected} must be sourced`)
  }
})

test('MELEE-CLOSE6-2: data seeds cover all three melee weapon levels', () => {
  for (const key of ['iron_forged_swords', 'steel_forged_swords', 'mithril_forged_swords']) {
    const block = researchBlock(key)
    assert.ok(block.includes(`key: '${key}'`), `${key} data must exist`)
    for (const unit of ['footman', 'militia', 'knight']) {
      assert.ok(block.includes(`targetUnitType: '${unit}', stat: 'attackDamage', value: 1`))
    }
  }
})

test('MELEE-CLOSE6-3: ordered prerequisites are encoded for higher levels', () => {
  const steel = researchBlock('steel_forged_swords')
  const mithril = researchBlock('mithril_forged_swords')
  assert.ok(steel.includes("requiresBuilding: 'keep'"))
  assert.ok(steel.includes("prerequisiteResearch: 'iron_forged_swords'"))
  assert.ok(mithril.includes("requiresBuilding: 'castle'"))
  assert.ok(mithril.includes("prerequisiteResearch: 'steel_forged_swords'"))
})

test('MELEE-CLOSE6-4: Blacksmith exposes Long Rifles plus all melee weapon upgrades', () => {
  const blacksmith = gameData.match(/blacksmith:\s*\{[\s\S]*?\n\s{2}\},/)?.[0] ?? ''
  for (const key of ['long_rifles', 'iron_forged_swords', 'steel_forged_swords', 'mithril_forged_swords']) {
    assert.ok(blacksmith.includes(`'${key}'`), `Blacksmith must expose ${key}`)
  }
})

test('MELEE-CLOSE6-5: runtime smoke files exist for Level 1 and higher levels', () => {
  assert.ok(existsSync(new URL('../tests/v9-hn7-iron-forged-swords-runtime.spec.ts', import.meta.url)))
  assert.ok(existsSync(new URL('../tests/v9-hn7-steel-mithril-runtime.spec.ts', import.meta.url)))
})

test('MELEE-CLOSE6-6: higher-level runtime covers buttons, costs, prerequisites, cumulative effect, and exclusions', () => {
  const runtime = readFileSync(
    new URL('../tests/v9-hn7-steel-mithril-runtime.spec.ts', import.meta.url),
    'utf8',
  )
  for (const expected of ['钢剑', '秘银剑', 'without Keep', 'without Castle', 'steelCost', 'mithrilCost', 'cumulative +3', 'Non-melee']) {
    assert.ok(runtime.includes(expected), `runtime must cover ${expected}`)
  }
})

test('MELEE-CLOSE6-7: runtime code has no melee-upgrade special cases', () => {
  for (const key of ['iron_forged_swords', 'steel_forged_swords', 'mithril_forged_swords']) {
    assert.ok(!game.includes(key), `${key} must remain data-driven`)
  }
})

test('MELEE-CLOSE6-8: unrelated HN7 branches remain absent', () => {
  for (const forbidden of [
    'ranged_upgrade',
    'armor_upgrade',
    'animal_war_training',
    'gryphon',
    'dragonhawk',
    'spell_breaker',
    'paladin',
    'archmage',
  ]) {
    assert.ok(!gameData.includes(forbidden), `${forbidden} must not be added by melee closure`)
  }
})

test('MELEE-CLOSE6-9: docs identify the next branch as source reconciliation, not data insertion', () => {
  assert.ok(contract.includes('HN7-CLOSE6'), 'contract must mention CLOSE6')
  assert.ok(expansionPacket.includes('HN7-CLOSE6'), 'expansion packet must mention CLOSE6')
  assert.ok(
    expansionPacket.includes('HN7-SRC5') || expansionPacket.includes('ranged weapon source reconciliation'),
    'next branch must be source reconciliation',
  )
})

test('MELEE-CLOSE6-10: source hierarchy is preserved, not flattened into fake consensus', () => {
  assert.ok(sourcePacket.includes('HN7-SRC4 采用 Blizzard Classic Battle.net Blacksmith 页面作为二、三级成本、时间和科技前置主源'))
  assert.ok(sourcePacket.includes('旧版冲突样本'), 'legacy conflict sample must remain explicit')
  assert.ok(sourcePacket.includes('不用于 HN7-DATA4'), 'conflicting legacy costs must not be adopted')
  assert.ok(!evidenceLedger.includes('3-source consensus'), 'ledger must not claim fake multi-source consensus')
})

test('MELEE-CLOSE6-11: data seeds encode cost and research time for all three tiers', () => {
  const expected = [
    ['iron_forged_swords', 'cost: { gold: 100, lumber: 50 }', 'researchTime: 60'],
    ['steel_forged_swords', 'cost: { gold: 175, lumber: 175 }', 'researchTime: 75'],
    ['mithril_forged_swords', 'cost: { gold: 250, lumber: 300 }', 'researchTime: 90'],
  ]

  for (const [key, cost, time] of expected) {
    const block = researchBlock(key)
    assert.ok(block.includes(cost), `${key} cost must be encoded`)
    assert.ok(block.includes(time), `${key} research time must be encoded`)
  }
})

test('MELEE-CLOSE6-12: Level 1 runtime smoke covers command card, cost, inheritance, and exclusions', () => {
  const runtime = readFileSync(
    new URL('../tests/v9-hn7-iron-forged-swords-runtime.spec.ts', import.meta.url),
    'utf8',
  )

  for (const expected of ['铁剑', '100 gold / 50 lumber', 'newFootman', 'newKnight', 'Non-melee']) {
    assert.ok(runtime.includes(expected), `Level 1 runtime must cover ${expected}`)
  }
})

test('MELEE-CLOSE6-13: accepted docs carry the exact closure evidence counts', () => {
  assert.ok(expansionPacket.includes('14/14 pass'), 'expansion packet must record closure proof count')
  assert.ok(evidenceLedger.includes('Combined chain closure + DATA4 + SRC4 + DATA3 + SRC3: 45/45 pass'))
  assert.ok(evidenceLedger.includes('State after: `accepted`'))
})

test('MELEE-CLOSE6-14: remaining-gates doc has moved past melee closure', () => {
  assert.ok(remainingGates.includes('Task174 已完成近战三段升级闭环盘点'))
  assert.ok(remainingGates.includes('Task178 已完成远程武器升级闭环盘点'))
  assert.ok(remainingGates.includes('Current adjacent work: HN7-SRC6'))
})
