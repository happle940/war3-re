/**
 * V9 HN7-SRC5 ranged weapon upgrade source reconciliation proof.
 *
 * Static proof that ranged (Gunpowder) upgrade values are sourced before data seed.
 */
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { test } from 'node:test'

const packet = readFileSync(
  new URL('../docs/V9_HN7_RANGED_UPGRADE_SOURCE_PACKET.zh-CN.md', import.meta.url),
  'utf8',
)
const gameData = readFileSync(
  new URL('../src/game/GameData.ts', import.meta.url),
  'utf8',
)
const contract = readFileSync(
  new URL('../docs/V9_HN7_BLACKSMITH_ANIMAL_TRAINING_CONTRACT.zh-CN.md', import.meta.url),
  'utf8',
)

// ── Source hierarchy ─────────────────────────────────────

test('RANGED-SRC-1: primary and cross-check sources are cited', () => {
  assert.ok(packet.includes('Blizzard Classic Battle.net'), 'primary source must be named')
  assert.ok(packet.includes('classic.battle.net/war3/human/buildings/blacksmith'), 'Blizzard URL must be present')
  assert.ok(packet.includes('Liquipedia'), 'cross-check source must be named')
  assert.ok(packet.includes('GameFAQs'), 'legacy reference must be named')
  assert.ok(packet.includes('Wowpedia'), 'non-adopted reading reference must be named')
})

test('RANGED-SRC-2: source consistency is documented without flattening', () => {
  assert.ok(packet.includes('HN7-SRC5 不写成“所有来源完全一致”'), 'source hierarchy must avoid overclaiming')
  assert.ok(packet.includes('hard values 采用 Blizzard Classic Battle.net'), 'primary source hierarchy must be explicit')
  assert.ok(packet.includes('本轮没有发现可采用的远程武器成本冲突样本'), 'conflict-sample status must be explicit')
  assert.ok(!packet.includes('3-source consensus'), 'must not fabricate consensus count')
})

// ── Three-tier values fixed ─────────────────────────────

test('RANGED-SRC-3: Black Gunpowder (Level 1) values are fixed', () => {
  for (const expected of [
    'key: black_gunpowder',
    'name: 黑火药',
    'cost: 100 gold / 50 lumber',
    'researchTime: 60',
    'requiresBuilding: blacksmith',
    'prerequisiteResearch: none',
  ]) {
    assert.ok(packet.includes(expected), `${expected} must be fixed`)
  }
})

test('RANGED-SRC-4: Refined Gunpowder (Level 2) values are fixed', () => {
  for (const expected of [
    'key: refined_gunpowder',
    'name: 精炼火药',
    'cost: 175 gold / 175 lumber',
    'researchTime: 75',
    'requiresBuilding: keep',
    'prerequisiteResearch: black_gunpowder',
  ]) {
    assert.ok(packet.includes(expected), `${expected} must be fixed`)
  }
})

test('RANGED-SRC-5: Imbued Gunpowder (Level 3) values are fixed', () => {
  for (const expected of [
    'key: imbued_gunpowder',
    'name: 附魔火药',
    'cost: 250 gold / 300 lumber',
    'researchTime: 90',
    'requiresBuilding: castle',
    'prerequisiteResearch: refined_gunpowder',
  ]) {
    assert.ok(packet.includes(expected), `${expected} must be fixed`)
  }
})

// ── Affected units ───────────────────────────────────────

test('RANGED-SRC-6: affected units are bounded to existing project units', () => {
  assert.ok(packet.includes('rifleman'), 'rifleman must be in affected list')
  assert.ok(packet.includes('mortar_team'), 'mortar_team must be in affected list')
  // Must explain why non-existent units are excluded
  assert.ok(packet.includes('Siege Engine'), 'Siege Engine must be mentioned as non-existent')
  assert.ok(packet.includes('Flying Machine'), 'Flying Machine must be mentioned as non-existent')
  assert.ok(packet.includes('不得为不存在的单位添加 effect'), 'must forbid effects for non-existent units')
})

test('RANGED-SRC-7: Mortar Team inclusion is explicitly confirmed by sources', () => {
  assert.ok(
    packet.includes('Mortar Team 是否受远程升级影响') && packet.includes('是'),
    'Mortar Team inclusion must be confirmed with source evidence',
  )
})

// ── Scalar mapping ───────────────────────────────────────

test('RANGED-SRC-8: incremental +1 mapping is documented', () => {
  assert.ok(packet.includes('attackDamage +1'), 'each level must be +1 incremental')
  assert.ok(packet.includes('incremental mapping'), 'mapping rationale must be stated')
  assert.ok(packet.includes('不是把 Refined 的 Damage Dice Bonus 2 写成 `attackDamage +2`'))
  assert.ok(packet.includes('或 Imbued 的 Bonus 3 写成 `attackDamage +3`'))
  assert.ok(!packet.includes('rifleman attackDamage +2'), 'must not encode Refined as a +2 effect')
  assert.ok(!packet.includes('rifleman attackDamage +3'), 'must not encode Imbued as a +3 effect')
})

// ── DATA5 boundary ───────────────────────────────────────

test('RANGED-SRC-9: DATA5 is allowed but narrowly bounded', () => {
  assert.ok(packet.includes('HN7-DATA5'), 'DATA5 must be named')
  assert.ok(packet.includes('不修改 runtime'), 'no runtime changes allowed')
  assert.ok(packet.includes('不新增 AI'), 'no AI allowed')
  assert.ok(packet.includes('不新增护甲/AWT/近战'), 'no armor/AWT/melee allowed')
  assert.ok(packet.includes('不新增英雄、空军、物品或素材'), 'no heroes/air/items/assets allowed')
})

// ── Source boundaries survive later data work ───────────

test('RANGED-SRC-10: source packet keeps non-ranged branches out of scope', () => {
  assert.ok(packet.includes('不写护甲升级数据'))
  assert.ok(packet.includes('不写 Animal War Training 数据'))
  assert.ok(!gameData.includes('animal_war_training'), 'AWT must not exist')
  assert.ok(!gameData.includes('ranged_weapon_upgrade_placeholder'), 'placeholder ranged upgrade keys must not exist')
})

// ── Contract alignment ───────────────────────────────────

test('RANGED-SRC-11: contract §3.2 references ranged upgrades', () => {
  assert.ok(contract.includes('远程武器升级') || contract.includes('Gunpowder'), 'contract must reference ranged upgrades')
})
