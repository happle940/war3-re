/**
 * V9 HN7-SRC7 Animal War Training source reconciliation proof.
 *
 * Static proof that AWT values and project mapping are sourced before data seed.
 */
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { test } from 'node:test'

const packet = readFileSync(
  new URL('../docs/V9_HN7_ANIMAL_WAR_TRAINING_SOURCE_PACKET.zh-CN.md', import.meta.url),
  'utf8',
)
const gameData = readFileSync(new URL('../src/game/GameData.ts', import.meta.url), 'utf8')

// ── Source hierarchy ─────────────────────────────────────

test('AWT-SRC-1: source hierarchy and reference links are explicit', () => {
  assert.ok(packet.includes('Liquipedia: Animal War Training'), 'primary source must be named')
  assert.ok(packet.includes('https://liquipedia.net/warcraft/Animal_War_Training'), 'Liquipedia URL must be present')
  assert.ok(packet.includes('Blizzard Classic Battle.net'), 'Classic Battle.net cross-check must be named')
  assert.ok(packet.includes('classic.battle.net/war3/human/units/knight'), 'Classic Knight URL must be present')
  assert.ok(packet.includes('Wowpedia / Fandom'), 'non-primary reading reference must be named')
})

test('AWT-SRC-2: source conflicts are documented without flattening', () => {
  assert.ok(packet.includes('HN7-SRC7 不写成"所有来源完全一致"'), 'must not claim flat source consensus')
  assert.ok(packet.includes('hard values 采用 Liquipedia Animal War Training 当前资料页'))
  assert.ok(packet.includes('旧成本 125/175 与当前值冲突'), 'Classic old cost conflict must be explicit')
  assert.ok(packet.includes('不采用旧版值'), 'old values must be recorded but not adopted')
  assert.ok(!packet.includes('3-source consensus'), 'must not fabricate consensus count')
})

// ── Adopted values ────────────────────────────────────────

test('AWT-SRC-3: adopted Animal War Training values are fixed', () => {
  for (const expected of [
    'key: animal_war_training',
    'name: 动物作战训练',
    'cost: 125 gold / 125 lumber',
    'researchTime: 40',
    'requiresBuilding: barracks',
    'prerequisiteResearch: none',
    'buildingPrerequisites: castle + lumber_mill + blacksmith',
    'knight maxHp +100',
  ]) {
    assert.ok(packet.includes(expected), `${expected} must be fixed`)
  }
})

test('AWT-SRC-4: AWT is single-level, not a three-tier chain', () => {
  assert.ok(packet.includes('一次性单级升级'), 'single-level nature must be documented')
  assert.ok(packet.includes('没有 Level 2 / Level 3'), 'must explicitly reject 3-tier shape')
  assert.ok(!packet.includes('animal_war_training_level_2'), 'must not invent level 2 key')
  assert.ok(!packet.includes('animal_war_training_level_3'), 'must not invent level 3 key')
})

test('AWT-SRC-5: patch history is recorded but old values are not adopted', () => {
  assert.ok(packet.includes('1.10 (TFT 原始)'), '1.10 history must be recorded')
  assert.ok(packet.includes('1.12 (2003-07-31)'), '1.12 history must be recorded')
  assert.ok(packet.includes('1.31.0 (2019-05-28)'), '1.31.0 current value must be recorded')
  assert.ok(packet.includes('150 | 250 | +150'), 'old 1.10 value must be visible as history')
  assert.ok(packet.includes('125 | 175 | +150'), 'old 1.12 value must be visible as history')
  assert.ok(packet.includes('125 | 125 | +100'), 'adopted current value must be visible')
})

// ── Affected-unit mapping ─────────────────────────────────

test('AWT-SRC-6: War3 affected units and project affected units are separated', () => {
  assert.ok(packet.includes('Knight、Dragonhawk Rider、Gryphon Rider'), 'War3 affected units must be documented')
  assert.ok(packet.includes('当前项目中已存在且受 AWT 影响的单位：** `knight`'), 'project affected unit must be only knight')
  assert.ok(packet.includes('Dragonhawk Rider、Gryphon Rider。HN7-DATA7 不得为不存在的单位添加 effect 条目'))
})

test('AWT-SRC-7: non-affected project units are explicitly excluded', () => {
  for (const unit of ['footman', 'militia', 'rifleman', 'mortar_team', 'priest', 'sorceress', 'worker']) {
    assert.ok(packet.includes(unit), `${unit} must be explicitly excluded or bounded`)
  }
})

test('AWT-SRC-8: current GameData has knight but no War3 air units', () => {
  assert.ok(gameData.includes('knight: {'), 'project must currently have knight')
  assert.ok(gameData.includes("hp: 835"), 'current knight base hp must be documented against project state')
  assert.ok(!gameData.includes('gryphon'), 'SRC7 must not add Gryphon data')
  assert.ok(!gameData.includes('dragonhawk'), 'SRC7 must not add Dragonhawk data')
})

// ── Existing infrastructure and blocker ───────────────────

test('AWT-SRC-9: maxHp research effect support is acknowledged as existing infrastructure', () => {
  assert.ok(packet.includes("ResearchEffectType.FlatDelta"), 'FlatDelta must be named')
  assert.ok(packet.includes("stat: 'maxHp'"), 'maxHp stat must be named')
  assert.ok(packet.includes('同时增加 `unit.maxHp` 和 `unit.hp`'), 'runtime maxHp semantics must be acknowledged')
})

test('AWT-SRC-10: multi-building prerequisite gap blocks immediate data seed', () => {
  assert.ok(packet.includes('ResearchDef` 多建筑前置表达'), 'multi-building prerequisite gap must be documented')
  assert.ok(packet.includes('当前只有 `requiresBuilding?: string`'), 'current single-building limitation must be explicit')
  assert.ok(packet.includes('HN7-MODEL8 需要先解决的工程 blocker'), 'next blocker must be named')
  assert.ok(packet.includes('在这个 blocker 解决前，不应直接进入 HN7-DATA7'), 'data seed must not be next without model support')
})

// ── Next-work boundary ────────────────────────────────────

test('AWT-SRC-11: DATA7 is allowed only after model support and remains data-only', () => {
  assert.ok(packet.includes('HN7-DATA7'), 'DATA7 handoff must be named')
  assert.ok(packet.includes('`RESEARCHES.animal_war_training` 数据条目'), 'DATA7 allowed work must name the research key')
  assert.ok(packet.includes('需等 HN7-MODEL8 之后'), 'DATA7 must depend on model support')
})

test('AWT-SRC-12: source packet remains source-only — no runtime code changes', () => {
  assert.ok(packet.includes('不实现 AWT runtime、命令卡或效果应用'), 'source packet must not authorize runtime')
  assert.ok(packet.includes('不实现'), 'must clearly state no implementation in SRC7')
  // DATA7 now seeds the data; SRC7 proof only verifies no runtime was changed by source task
})

test('AWT-SRC-13: forbidden branches remain closed', () => {
  for (const expected of [
    'Leather Armor',
    'AI 升级策略',
    '英雄',
    '空军',
    '物品',
    '素材',
  ]) {
    assert.ok(packet.includes(expected), `${expected} must remain out of scope`)
  }
})

test('AWT-SRC-14: current project mapping does not widen HN7 scope', () => {
  assert.ok(packet.includes('AWT 与三段升级的对称性有限'), 'must not force AWT into Blacksmith 3-tier pattern')
  assert.ok(packet.includes('它是单级、在 Barracks 研究、影响 maxHp'), 'must describe the narrow current mapping')
  assert.ok(packet.includes('不为 `gryphon` / `dragonhawk` 添加单位或数据'), 'must forbid absent War3 air units')
})
