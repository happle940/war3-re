/**
 * V9 HN7-SRC6 Plating armor upgrade source reconciliation proof.
 *
 * Static proof that Plating (armor) upgrade values are sourced before data seed.
 */
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { test } from 'node:test'

const packet = readFileSync(
  new URL('../docs/V9_HN7_ARMOR_UPGRADE_SOURCE_PACKET.zh-CN.md', import.meta.url),
  'utf8',
)
const contract = readFileSync(
  new URL('../docs/V9_HN7_BLACKSMITH_ANIMAL_TRAINING_CONTRACT.zh-CN.md', import.meta.url),
  'utf8',
)

// ── Source hierarchy ─────────────────────────────────────

test('ARMOR-SRC-1: primary and cross-check sources are cited', () => {
  assert.ok(packet.includes('Blizzard Classic Battle.net'), 'primary source must be named')
  assert.ok(packet.includes('classic.battle.net/war3/human/buildings/blacksmith'), 'Blizzard URL must be present')
  assert.ok(packet.includes('Liquipedia'), 'cross-check source must be named')
  assert.ok(packet.includes('Wowpedia'), 'non-adopted reading reference must be named')
})

test('ARMOR-SRC-2: source consistency is documented without flattening', () => {
  assert.ok(packet.includes('HN7-SRC6 不写成"所有来源完全一致"'), 'source hierarchy must avoid overclaiming')
  assert.ok(packet.includes('hard values 采用 Blizzard Classic Battle.net'), 'primary source hierarchy must be explicit')
  assert.ok(packet.includes('本轮没有发现可采用的护甲升级成本冲突样本'), 'conflict-sample status must be explicit')
  assert.ok(!packet.includes('3-source consensus'), 'must not fabricate consensus count')
})

// ── Three-tier values fixed ─────────────────────────────

test('ARMOR-SRC-3: Iron Plating (Level 1) values are fixed', () => {
  for (const expected of [
    'key: iron_plating',
    'name: 铁甲',
    'cost: 125 gold / 75 lumber',
    'researchTime: 60',
    'requiresBuilding: blacksmith',
    'prerequisiteResearch: none',
  ]) {
    assert.ok(packet.includes(expected), `${expected} must be fixed`)
  }
})

test('ARMOR-SRC-4: Steel Plating (Level 2) values are fixed', () => {
  for (const expected of [
    'key: steel_plating',
    'name: 钢甲',
    'cost: 150 gold / 175 lumber',
    'researchTime: 75',
    'requiresBuilding: keep',
    'prerequisiteResearch: iron_plating',
  ]) {
    assert.ok(packet.includes(expected), `${expected} must be fixed`)
  }
})

test('ARMOR-SRC-5: Mithril Plating (Level 3) values are fixed', () => {
  for (const expected of [
    'key: mithril_plating',
    'name: 秘银甲',
    'cost: 175 gold / 275 lumber',
    'researchTime: 90',
    'requiresBuilding: castle',
    'prerequisiteResearch: steel_plating',
  ]) {
    assert.ok(packet.includes(expected), `${expected} must be fixed`)
  }
})

// ── Affected units ───────────────────────────────────────

test('ARMOR-SRC-6: affected units are bounded to existing project units', () => {
  assert.ok(packet.includes('footman'), 'footman must be in affected list')
  assert.ok(packet.includes('militia'), 'militia must be in affected list')
  assert.ok(packet.includes('knight'), 'knight must be in affected list')
  // Must explain why non-existent units are excluded
  assert.ok(packet.includes('Spell Breaker'), 'Spell Breaker must be mentioned as non-existent')
  assert.ok(packet.includes('Siege Engine'), 'Siege Engine must be mentioned as non-existent')
  assert.ok(packet.includes('Flying Machine'), 'Flying Machine must be mentioned as non-existent')
})

test('ARMOR-SRC-7: Priest and Sorceress exclusion is documented', () => {
  assert.ok(
    packet.includes('Priest') && packet.includes('Sorceress') && packet.includes('Unarmored'),
    'Priest and Sorceress must be documented as Unarmored and not affected',
  )
})

// ── Scalar mapping ───────────────────────────────────────

test('ARMOR-SRC-8: incremental +2 mapping is documented', () => {
  assert.ok(packet.includes('armor +2'), 'each level must be +2 incremental')
  assert.ok(packet.includes('incremental mapping'), 'mapping rationale must be stated')
  assert.ok(!packet.includes('armor: +4'), 'must not encode Steel as a single +4 effect')
  assert.ok(!packet.includes('armor: +6'), 'must not encode Mithril as a single +6 effect')
})

// ── Two armor lines documented ───────────────────────────

test('ARMOR-SRC-9: Leather Armor line is recorded but not in DATA6 scope', () => {
  assert.ok(packet.includes('Leather Armor'), 'Leather Armor line must be documented')
  assert.ok(packet.includes('Studded Leather Armor'), 'Studded Leather Armor must be named')
  assert.ok(packet.includes('Reinforced Leather Armor'), 'Reinforced Leather Armor must be named')
  assert.ok(packet.includes('Dragonhide Armor'), 'Dragonhide Armor must be named')
  assert.ok(packet.includes('不在 HN7-DATA6 实施'), 'must explicitly exclude Leather from DATA6')
})

// ── DATA6 boundary ───────────────────────────────────────

test('ARMOR-SRC-10: DATA6 is allowed but narrowly bounded', () => {
  assert.ok(packet.includes('HN7-DATA6'), 'DATA6 must be named')
  assert.ok(packet.includes('不修改 runtime'), 'no runtime changes allowed')
  assert.ok(packet.includes('不新增 AI'), 'no AI allowed')
  assert.ok(packet.includes('不新增近战 / 远程 / AWT'), 'no melee/ranged/AWT allowed')
  assert.ok(packet.includes('不写 Leather Armor 线数据'), 'no Leather Armor data allowed')
})

// ── Source-only boundary ────────────────────────────────

test('ARMOR-SRC-11: SRC6 stayed source-only and handed data work to DATA6', () => {
  assert.ok(packet.includes('HN7-DATA6 允许边界'), 'source packet must hand data seed to DATA6')
  assert.ok(packet.includes('`RESEARCHES.iron_plating`'), 'DATA6 allowed work must name iron_plating')
  assert.ok(packet.includes('`RESEARCHES.steel_plating`'), 'DATA6 allowed work must name steel_plating')
  assert.ok(packet.includes('`RESEARCHES.mithril_plating`'), 'DATA6 allowed work must name mithril_plating')
  assert.ok(packet.includes('不修改 runtime'), 'SRC6 must not authorize runtime work')
  assert.ok(packet.includes('不写 Leather Armor 线数据'), 'SRC6 must not authorize Leather Armor data')
  assert.ok(packet.includes('不写 Animal War Training 数据'), 'SRC6 must not authorize AWT data')
})

// ── Contract alignment ───────────────────────────────────

test('ARMOR-SRC-12: contract §3.3 references armor upgrades', () => {
  assert.ok(contract.includes('护甲升级') || contract.includes('Plating'), 'contract must reference armor upgrades')
})
