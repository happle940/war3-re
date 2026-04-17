/**
 * V9 HN7-CLOSE8 Plating armor upgrade chain closure.
 *
 * Static proof that the Human Plating armor chain has source, data, runtime,
 * and boundary evidence. Also records the command-card capacity fix from IMPL7.
 */
import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'
import { test } from 'node:test'

const gameData = readFileSync(new URL('../src/game/GameData.ts', import.meta.url), 'utf8')
const game = readFileSync(new URL('../src/game/Game.ts', import.meta.url), 'utf8')
const styles = readFileSync(new URL('../src/styles.css', import.meta.url), 'utf8')
const sourcePacket = readFileSync(
  new URL('../docs/V9_HN7_ARMOR_UPGRADE_SOURCE_PACKET.zh-CN.md', import.meta.url),
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

// ── SRC6 source reconciliation ───────────────────────────

test('PL-CLOSE8-1: source packet covers Iron, Steel, and Mithril Plating', () => {
  for (const expected of [
    'key: iron_plating',
    'cost: 125 gold / 75 lumber',
    'key: steel_plating',
    'cost: 150 gold / 175 lumber',
    'key: mithril_plating',
    'cost: 175 gold / 275 lumber',
    'Blizzard Classic Battle.net',
  ]) {
    assert.ok(sourcePacket.includes(expected), `${expected} must be sourced`)
  }
})

test('PL-CLOSE8-2: source hierarchy preserves Blizzard as primary with Liquipedia cross-check', () => {
  assert.ok(
    sourcePacket.includes('HN7-SRC6 不写成"所有来源完全一致"'),
    'source hierarchy must avoid overclaiming consensus',
  )
  assert.ok(
    sourcePacket.includes('hard values \u91C7\u7528 Blizzard Classic Battle.net'),
    'Blizzard must be named as primary source',
  )
  assert.ok(sourcePacket.includes('Liquipedia'), 'cross-check source must be cited')
  assert.ok(!evidenceLedger.includes('3-source consensus'), 'must not fabricate consensus count')
})

// ── DATA6 data seeds ─────────────────────────────────────

test('PL-CLOSE8-3: data seeds cover all three Plating levels with correct values', () => {
  const expected = [
    ['iron_plating', 'cost: { gold: 125, lumber: 75 }', 'researchTime: 60'],
    ['steel_plating', 'cost: { gold: 150, lumber: 175 }', 'researchTime: 75'],
    ['mithril_plating', 'cost: { gold: 175, lumber: 275 }', 'researchTime: 90'],
  ]
  for (const [key, cost, time] of expected) {
    const block = researchBlock(key)
    assert.ok(block.includes(`key: '${key}'`), `${key} data must exist`)
    assert.ok(block.includes(cost), `${key} cost must be encoded`)
    assert.ok(block.includes(time), `${key} research time must be encoded`)
  }
})

test('PL-CLOSE8-4: each tier effects only footman / militia / knight with armor +2', () => {
  for (const key of ['iron_plating', 'steel_plating', 'mithril_plating']) {
    const block = researchBlock(key)
    for (const unit of ['footman', 'militia', 'knight']) {
      assert.ok(
        block.includes(`targetUnitType: '${unit}', stat: 'armor', value: 2`),
        `${key} must affect ${unit} with armor +2`,
      )
    }
  }
})

test('PL-CLOSE8-5: ordered prerequisites are encoded for higher levels', () => {
  const steel = researchBlock('steel_plating')
  const mithril = researchBlock('mithril_plating')
  assert.ok(steel.includes("requiresBuilding: 'keep'"))
  assert.ok(steel.includes("prerequisiteResearch: 'iron_plating'"))
  assert.ok(mithril.includes("requiresBuilding: 'castle'"))
  assert.ok(mithril.includes("prerequisiteResearch: 'steel_plating'"))
})

test('PL-CLOSE8-6: Blacksmith exposes all four research lines', () => {
  const blacksmith = gameData.match(/blacksmith:\s*\{[\s\S]*?\n\s{2}\},/)?.[0] ?? ''
  for (const key of [
    'long_rifles',
    'iron_forged_swords', 'steel_forged_swords', 'mithril_forged_swords',
    'black_gunpowder', 'refined_gunpowder', 'imbued_gunpowder',
    'iron_plating', 'steel_plating', 'mithril_plating',
  ]) {
    assert.ok(blacksmith.includes(`'${key}'`), `Blacksmith must expose ${key}`)
  }
})

// ── IMPL7 runtime smoke ──────────────────────────────────

test('PL-CLOSE8-7: runtime smoke file exists for Plating upgrades', () => {
  assert.ok(
    existsSync(new URL('../tests/v9-hn7-plating-upgrade-runtime.spec.ts', import.meta.url)),
  )
})

test('PL-CLOSE8-8: runtime covers buttons, prerequisites, costs, cumulative effect, and exclusions', () => {
  const runtime = readFileSync(
    new URL('../tests/v9-hn7-plating-upgrade-runtime.spec.ts', import.meta.url),
    'utf8',
  )
  for (const expected of [
    '铁甲', '钢甲', '秘银甲',
    'without Keep', 'without Castle',
    '125/75', '150/175', '175/275',
    'cumulative +6',
    'unaffected',
  ]) {
    assert.ok(runtime.includes(expected), `runtime must cover ${expected}`)
  }
})

// ── Command-card capacity fix ────────────────────────────

test('PL-CLOSE8-9: command-card capacity fix is recorded in docs', () => {
  assert.ok(game.includes('const COMMAND_CARD_SLOT_COUNT = 16'), 'Game.ts must define a 16-slot command card')
  assert.ok(game.includes('Math.min(buttons.length, COMMAND_CARD_SLOT_COUNT)'), 'rendering must use the shared slot cap')
  assert.ok(styles.includes('grid-template-columns: repeat(4, minmax(126px, 1fr))'), 'command card must use a 4-column grid')
  assert.ok(styles.includes('grid-template-rows: repeat(4, 36px)'), 'command card must use a 4-row grid')
  assert.ok(expansionPacket.includes('16 格命令卡'), 'expansion packet must record the 16-slot command-card fix')
  assert.ok(evidenceLedger.includes('16 fixed slots') || evidenceLedger.includes('16 格'), 'evidence ledger must record the 16-slot fix')
})

// ── No special cases in Game.ts ──────────────────────────

test('PL-CLOSE8-10: runtime code has no Plating special cases', () => {
  for (const key of ['iron_plating', 'steel_plating', 'mithril_plating']) {
    assert.ok(!game.includes(key), `${key} must remain data-driven`)
  }
})

// ── Boundary: no unrelated branches ──────────────────────

test('PL-CLOSE8-11: Plating effects stay isolated after later HN7 branches', () => {
  const platingBlocks = ['iron_plating', 'steel_plating', 'mithril_plating']
    .map(key => researchBlock(key))
    .join('\n')

  for (const forbidden of ['studded_leather', 'reinforced_leather', 'dragonhide', 'animal_war_training']) {
    assert.ok(!platingBlocks.includes(forbidden), `${forbidden} must not be mixed into Plating effects`)
  }

  for (const forbidden of ['gryphon', 'dragonhawk', 'spell_breaker', 'archmage']) {
    assert.ok(!gameData.includes(forbidden), `${forbidden} must still be absent from current GameData`)
  }
})

// ── Docs alignment ───────────────────────────────────────

test('PL-CLOSE8-12: docs record IMPL7 Codex takeover for command-card fix', () => {
  assert.ok(
    expansionPacket.includes('Codex 接管') && expansionPacket.includes('命令卡'),
    'expansion packet must record Codex takeover for command-card fix',
  )
  assert.ok(evidenceLedger.includes('Codex takeover'), 'evidence ledger must record Codex takeover')
})

test('PL-CLOSE8-13: remaining-gates doc has moved past Plating closure', () => {
  assert.ok(remainingGates.includes('HN7 已完成'), 'remaining gates must summarize completed HN7 work')
  assert.ok(remainingGates.includes('HERO11-IMPL1'), 'remaining gates must point to current HERO11 adjacent work')
})

test('PL-CLOSE8-14: evidence ledger records IMPL7 acceptance', () => {
  assert.ok(evidenceLedger.includes('HN7-IMPL7'), 'evidence ledger must record IMPL7')
  assert.ok(evidenceLedger.includes('7/7 pass'), 'evidence ledger must record runtime proof count')
})
