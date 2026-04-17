/**
 * V9 HN6-CLOSE7 Castle / Knight closure inventory.
 *
 * Proves:
 * 1. HN6 proof files cover Castle data, Keep -> Castle, Knight prereqs,
 *    Knight data, Knight training, and Knight combat identity.
 * 2. Current data/runtime chain exposes Castle and Knight through the intended
 *    generic upgrade/training systems.
 * 3. Knight combat identity remains data/HUD driven, not a hardcoded runtime
 *    special case.
 * 4. HN6 still does not open AI Knight, AI Castle upgrade, Animal War Training,
 *    heroes, air units, items, asset import, or a full T3 tech tree.
 * 5. HN6 docs and ledgers mark the branch as a minimal closed chain.
 */
import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'
import { test } from 'node:test'

const gameData = readFileSync(new URL('../src/game/GameData.ts', import.meta.url), 'utf8')
const game = readFileSync(new URL('../src/game/Game.ts', import.meta.url), 'utf8')
const ai = readFileSync(new URL('../src/game/SimpleAI.ts', import.meta.url), 'utf8')
const contract = readFileSync(new URL('../docs/V9_HN6_CASTLE_KNIGHT_CONTRACT.zh-CN.md', import.meta.url), 'utf8')
const expansion = readFileSync(new URL('../docs/V9_HUMAN_NUMERIC_EXPANSION_PACKET.zh-CN.md', import.meta.url), 'utf8')
const remaining = readFileSync(new URL('../docs/V9_MAINTENANCE_EXPANSION_REMAINING_GATES.zh-CN.md', import.meta.url), 'utf8')
const ledger = readFileSync(new URL('../docs/V9_MAINTENANCE_EXPANSION_EVIDENCE_LEDGER.zh-CN.md', import.meta.url), 'utf8')

const proofFiles = [
  'tests/v9-hn6-castle-knight-contract.spec.mjs',
  'tests/v9-hn6-castle-data-seed.spec.mjs',
  'tests/v9-hn6-keep-castle-upgrade-runtime.spec.ts',
  'tests/v9-hn6-knight-prerequisite-model.spec.mjs',
  'tests/v9-hn6-knight-data-seed.spec.mjs',
  'tests/v9-hn6-knight-training-prereq-runtime.spec.ts',
  'tests/v9-hn6-knight-combat-smoke.spec.ts',
]

function extractObjectBody(source, key) {
  const needle = `${key}: {`
  const start = source.indexOf(needle)
  assert.notEqual(start, -1, `${key} block must exist`)

  let depth = 0
  const bodyStart = source.indexOf('{', start)
  for (let i = bodyStart; i < source.length; i++) {
    if (source[i] === '{') depth += 1
    if (source[i] === '}') depth -= 1
    if (depth === 0) return source.slice(bodyStart, i + 1)
  }
  throw new Error(`unterminated ${key} block`)
}

test('CLOSE-1: HN6 proof files cover every accepted stage', () => {
  for (const file of proofFiles) {
    const url = new URL(`../${file}`, import.meta.url)
    assert.ok(existsSync(url), `proof file ${file} must exist`)
  }
})

test('CLOSE-2: Castle data and Keep -> Castle upgrade chain are present', () => {
  const keepBody = extractObjectBody(gameData, 'keep')
  const castleBody = extractObjectBody(gameData, 'castle')

  assert.ok(keepBody.includes("upgradeTo: 'castle'"), 'Keep must upgrade to Castle')
  assert.ok(castleBody.includes("key: 'castle'"), 'Castle data must exist')
  assert.ok(castleBody.includes('techTier: 3'), 'Castle must be T3')
  assert.ok(castleBody.includes("trains: ['worker']"), 'Castle should only train worker in this slice')
  assert.ok(game.includes('isMainHall'), 'main-hall behavior must stay generic')
  assert.ok(game.includes("type === 'townhall' || type === 'keep' || type === 'castle'"),
    'Castle must be recognized by the generic main-hall helper')
  assert.ok(game.includes('startBuildingUpgrade'), 'generic building upgrade runtime must exist')
})

test('CLOSE-3: Knight data, multi-prereq gate, and Barracks training chain are present', () => {
  const unitDefMatch = gameData.match(/export interface UnitDef \{[\s\S]*?\n\}/)
  assert.ok(unitDefMatch, 'UnitDef interface must exist')
  assert.ok(unitDefMatch[0].includes('techPrereqs?: string[]'), 'UnitDef must support plural prereqs')

  const barracksBody = extractObjectBody(gameData, 'barracks')
  const knightBody = extractObjectBody(gameData, 'knight')
  assert.ok(barracksBody.includes("'knight'"), 'Barracks must train Knight')
  assert.ok(knightBody.includes("techPrereqs: ['castle', 'blacksmith', 'lumber_mill']"),
    'Knight must require Castle + Blacksmith + Lumber Mill')
  assert.ok(knightBody.includes('hp: 835'), 'Knight hp must match HN6 accepted identity')
  assert.ok(knightBody.includes('armor: 5'), 'Knight armor must match HN6 accepted identity')
  assert.ok(knightBody.includes('supply: 4'), 'Knight supply must match HN6 accepted identity')
  assert.ok(game.includes('def.techPrereqs'), 'Game.ts must consume plural prereqs generically')
  assert.ok(!game.includes("case 'knight'"), 'Knight must not need a special runtime switch branch')
})

test('CLOSE-4: Knight combat identity is data and HUD driven', () => {
  const knightBody = extractObjectBody(gameData, 'knight')
  assert.ok(knightBody.includes('attackDamage: 34'), 'Knight must keep high single-hit damage')
  assert.ok(knightBody.includes('attackType: AttackType.Normal'), 'Knight must use Normal attack')
  assert.ok(knightBody.includes('armorType: ArmorType.Heavy'), 'Knight must use Heavy armor')
  assert.ok(game.includes('ATTACK_TYPE_NAMES[def.attackType]'), 'HUD must display attack type from data')
  assert.ok(game.includes('ARMOR_TYPE_NAMES[def.armorType]'), 'HUD must display armor type from data')
  assert.ok(game.includes('getTypeMultiplier(atkType, armType)'), 'combat must use attack/armor type table')
})

test('CLOSE-5: HN6 does not open banned systems or broaden to full T3', () => {
  assert.ok(!gameData.includes("key: 'animal_war_training'"), 'no Animal War Training data')
  assert.ok(!gameData.includes("key: 'paladin'"), 'no Paladin hero')
  assert.ok(!gameData.includes("key: 'archmage'"), 'no Archmage hero')
  assert.ok(!gameData.includes("key: 'mountain_king'"), 'no Mountain King hero')
  assert.ok(!gameData.includes("key: 'blood_mage'"), 'no Blood Mage hero')
  assert.ok(!gameData.includes("key: 'gryphon_rider'"), 'no Gryphon Rider')
  assert.ok(!gameData.includes("key: 'dragonhawk_rider'"), 'no Dragonhawk Rider')
  assert.ok(!gameData.includes("key: 'gryphon_aviary'"), 'no Gryphon Aviary')
  assert.ok(!gameData.includes("key: 'arcane_vault'"), 'no Arcane Vault')
  assert.ok(!gameData.includes("key: 'item'"), 'no item system')
  assert.ok(!gameData.includes("key: 'siege_engine'"), 'no Siege Engine')
  assert.ok(!gameData.includes("key: 'forged_swords'"), 'no Blacksmith melee ladder')
  assert.ok(!gameData.includes("key: 'mithril_plating'"), 'no Blacksmith armor ladder')
  assert.ok(!ai.includes('knight'), 'AI must not train or reason about Knight')
  assert.ok(!ai.includes("upgradeTo === 'castle'"), 'AI must not perform Castle upgrade')
})

test('CLOSE-6: HN6 docs and ledgers mark the minimal chain as closed', () => {
  for (const task of ['Task157', 'Task158', 'Task159', 'Task160', 'Task161', 'Task162', 'Task163', 'Task164']) {
    assert.ok(contract.includes(task) || expansion.includes(task) || ledger.includes(task),
      `HN6 docs must mention ${task}`)
  }
  assert.ok(contract.includes('HN6 最小链路已闭环'), 'contract must mark HN6 closed')
  assert.ok(expansion.includes('HN6 最小链路闭环'), 'expansion packet must mark HN6 closed')
  assert.ok(remaining.includes('HN6 Castle / Knight closure inventory'), 'remaining gates must point to HN6 closeout')
  assert.ok(ledger.includes('V9 HN6-CLOSE7'), 'evidence ledger must include HN6 closeout')
  assert.ok(!expansion.includes('Human 完成'), 'must not claim complete Human')
  assert.ok(!expansion.includes('全部 Human'), 'must not claim all Human complete')
})
