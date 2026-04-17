/**
 * V9 HN7-AI14 Blacksmith Upgrade AI strategy contract proof.
 *
 * Static proof that the contract covers three upgrade chains, trigger conditions,
 * budget boundaries, retry boundaries, forbidden branches, implementation scope,
 * data consistency, and current AI state.
 */
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { test } from 'node:test'

const contract = readFileSync(
  new URL('../docs/V9_HN7_BLACKSMITH_UPGRADE_AI_STRATEGY_CONTRACT.zh-CN.md', import.meta.url),
  'utf8',
)
const gameData = readFileSync(new URL('../src/game/GameData.ts', import.meta.url), 'utf8')

// ── Contract structure ────────────────────────────────────────

test('BS-AI-1: contract defines three upgrade chains', () => {
  assert.ok(contract.includes('近战武器链'), 'must define melee chain')
  assert.ok(contract.includes('远程火药链'), 'must define ranged chain')
  assert.ok(contract.includes('护甲 Plating 链'), 'must define plating chain')
})

test('BS-AI-2: contract names all 9 research keys', () => {
  for (const key of [
    'iron_forged_swords', 'steel_forged_swords', 'mithril_forged_swords',
    'black_gunpowder', 'refined_gunpowder', 'imbued_gunpowder',
    'iron_plating', 'steel_plating', 'mithril_plating',
  ]) {
    assert.ok(contract.includes(key), `contract must include ${key}`)
  }
})

// ── Trigger conditions ────────────────────────────────────────

test('BS-AI-3: contract defines general conditions GC1-GC4', () => {
  assert.ok(contract.includes('GC1'), 'must define GC1: Blacksmith complete')
  assert.ok(contract.includes('GC2'), 'must define GC2: queue empty')
  assert.ok(contract.includes('GC3'), 'must define GC3: budget sufficient')
  assert.ok(contract.includes('GC4'), 'must define GC4: waveCount >= 1')
})

test('BS-AI-4: contract defines melee chain conditions MC1-MC4', () => {
  assert.ok(contract.includes('MC1'), 'MC1: not completed')
  assert.ok(contract.includes('MC2'), 'MC2: prerequisite done')
  assert.ok(contract.includes('MC3'), 'MC3: townhall tier')
  assert.ok(contract.includes('MC4'), 'MC4: has melee units')
  assert.ok(contract.includes("myUnits('footman')"), 'must check footman')
  assert.ok(contract.includes("myUnits('knight')"), 'must check knight')
})

test('BS-AI-5: contract defines ranged chain conditions RC1-RC5', () => {
  assert.ok(contract.includes('RC1'), 'RC1: not completed')
  assert.ok(contract.includes('RC2'), 'RC2: prerequisite done')
  assert.ok(contract.includes('RC3'), 'RC3: townhall tier')
  assert.ok(contract.includes('RC4'), 'RC4: Long Rifles done')
  assert.ok(contract.includes('RC5'), 'RC5: has ranged units')
  assert.ok(contract.includes("long_rifles"), 'must reference Long Rifles prerequisite')
  assert.ok(contract.includes("myUnits('rifleman')"), 'must check rifleman')
  assert.ok(contract.includes("myUnits('mortar_team')"), 'must check mortar_team')
})

test('BS-AI-6: contract defines plating chain conditions PC1-PC4', () => {
  assert.ok(contract.includes('PC1'), 'PC1: not completed')
  assert.ok(contract.includes('PC2'), 'PC2: prerequisite done')
  assert.ok(contract.includes('PC3'), 'PC3: townhall tier')
  assert.ok(contract.includes('PC4'), 'PC4: has melee units')
})

// ── Budget boundaries ─────────────────────────────────────────

test('BS-AI-7: contract defines budget boundaries with production reserve', () => {
  assert.ok(contract.includes('P1'), 'must define worker reserve')
  assert.ok(contract.includes('P2'), 'must define footman reserve')
  assert.ok(contract.includes('P3'), 'must define waveCount gate')
  assert.ok(contract.includes('UNITS.worker.cost'), 'must reference worker cost')
  assert.ok(contract.includes('UNITS.footman.cost'), 'must reference footman cost')
})

test('BS-AI-8: budget check does not starve worker or military training', () => {
  assert.ok(contract.includes('canAfford'), 'must use canAfford')
  assert.ok(contract.includes('饿死'), 'must reference anti-starvation')
})

// ── Retry boundaries ──────────────────────────────────────────

test('BS-AI-9: contract defines retry boundaries', () => {
  for (const scenario of [
    '升级已完成',
    '正在研究',
    '资源不足',
    '前置研究未完成',
    '缺建筑',
    '无对应单位',
    'waveCount',
  ]) {
    assert.ok(contract.includes(scenario), `retry boundary must cover: ${scenario}`)
  }
})

test('BS-AI-10: completed research is never retried', () => {
  assert.ok(contract.includes('永不重试'), 'completed research must never retry')
})

// ── Decision priority ─────────────────────────────────────────

test('BS-AI-11: contract defines chain priority order', () => {
  assert.ok(contract.includes('优先级'), 'must define priority')
  assert.ok(contract.includes('iron_forged_swords') && contract.includes('steel_plating'), 'must order chains')
  assert.ok(contract.includes('进攻波次'), 'must be above attack waves')
})

test('BS-AI-12: contract defines interaction with existing AI paths', () => {
  assert.ok(contract.includes('Long Rifles'), 'must reference Long Rifles')
  assert.ok(contract.includes('AWT'), 'must reference AWT')
  assert.ok(contract.includes('互不干扰'), 'must state no interference')
})

// ── Forbidden branches ────────────────────────────────────────

test('BS-AI-13: contract forbids Castle upgrade, Knight training in AI15', () => {
  assert.ok(contract.includes('不实现 Keep → Castle'), 'must forbid Castle upgrade')
  assert.ok(contract.includes('不实现 Knight 训练'), 'must forbid Knight training')
})

test('BS-AI-14: contract forbids Leather Armor, heroes, air, items, assets', () => {
  for (const forbidden of ['Leather Armor', '英雄', '空军', '物品', '素材']) {
    assert.ok(contract.includes(forbidden), `${forbidden} must be forbidden`)
  }
  assert.ok(contract.includes('不实现 Leather Armor'), 'must explicitly forbid Leather Armor')
})

test('BS-AI-15: contract forbids skipping levels', () => {
  assert.ok(contract.includes('跳级'), 'must mention level skipping')
  assert.ok(contract.includes('Level 1 → Level 2 → Level 3'), 'must require sequential order')
})

// ── Implementation boundary ───────────────────────────────────

test('BS-AI-16: contract defines allowed and forbidden files for AI15', () => {
  assert.ok(contract.includes('SimpleAI.ts'), 'must name SimpleAI.ts as allowed')
  assert.ok(contract.includes('GameData.ts'), 'must name GameData.ts as forbidden')
  assert.ok(contract.includes('Game.ts'), 'must name Game.ts as forbidden')
})

test('BS-AI-17: contract requires data-driven values from RESEARCHES', () => {
  assert.ok(contract.includes('RESEARCHES'), 'must reference data source')
  assert.ok(contract.includes('硬编码'), 'must mention hardcoded values as forbidden')
})

// ── Current AI state verification ─────────────────────────────

test('BS-AI-18: contract records current AI state without Blacksmith upgrades', () => {
  assert.ok(contract.includes('当前 AI 状态'), 'must record current AI state section')
  assert.ok(contract.includes('没有** 任何 Blacksmith 三段升级') || contract.includes('没有任何 Blacksmith 三段升级'),
    'must record no Blacksmith upgrade logic')
  assert.ok(contract.includes('Long Rifles'), 'must record existing Long Rifles')
  assert.ok(contract.includes('AWT'), 'must record existing AWT')
})

test('BS-AI-19: contract explicitly excludes Leather Armor from scope', () => {
  assert.ok(!contract.includes('leather_armor'), 'must not reference leather_armor key')
  assert.ok(contract.includes('不实现 Leather Armor'), 'must explicitly forbid Leather Armor implementation')
  assert.ok(contract.includes('本合同不涉及'), 'must state contract does not cover Leather Armor')
})

// ── Data consistency: contract vs GameData ────────────────────

test('BS-AI-20: melee chain data matches GameData', () => {
  // Level 1: iron_forged_swords 100/50, requiresBuilding blacksmith
  assert.ok(gameData.includes("key: 'iron_forged_swords'"), 'melee L1 key')
  assert.ok(gameData.includes('gold: 100, lumber: 50'), 'melee L1 cost')
  // Level 2: steel_forged_swords 175/175, requiresBuilding keep, prerequisite iron_forged_swords
  assert.ok(gameData.includes("key: 'steel_forged_swords'"), 'melee L2 key')
  assert.ok(gameData.includes('gold: 175, lumber: 175'), 'melee L2 cost')
  assert.ok(gameData.includes("prerequisiteResearch: 'iron_forged_swords'"), 'melee L2 prerequisite')
  // Level 3: mithril_forged_swords 250/300, requiresBuilding castle, prerequisite steel_forged_swords
  assert.ok(gameData.includes("key: 'mithril_forged_swords'"), 'melee L3 key')
  assert.ok(gameData.includes('gold: 250, lumber: 300'), 'melee L3 cost')
  assert.ok(gameData.includes("prerequisiteResearch: 'steel_forged_swords'"), 'melee L3 prerequisite')
})

test('BS-AI-21: ranged chain data matches GameData', () => {
  // Level 1: black_gunpowder 100/50, requiresBuilding blacksmith
  assert.ok(gameData.includes("key: 'black_gunpowder'"), 'ranged L1 key')
  // Level 2: refined_gunpowder 175/175, requiresBuilding keep
  assert.ok(gameData.includes("key: 'refined_gunpowder'"), 'ranged L2 key')
  assert.ok(gameData.includes("prerequisiteResearch: 'black_gunpowder'"), 'ranged L2 prerequisite')
  // Level 3: imbued_gunpowder 250/300, requiresBuilding castle
  assert.ok(gameData.includes("key: 'imbued_gunpowder'"), 'ranged L3 key')
  assert.ok(gameData.includes("prerequisiteResearch: 'refined_gunpowder'"), 'ranged L3 prerequisite')
})

test('BS-AI-22: plating chain data matches GameData', () => {
  // Level 1: iron_plating 125/75, requiresBuilding blacksmith
  assert.ok(gameData.includes("key: 'iron_plating'"), 'plating L1 key')
  assert.ok(gameData.includes('gold: 125, lumber: 75'), 'plating L1 cost')
  // Level 2: steel_plating 150/175, requiresBuilding keep
  assert.ok(gameData.includes("key: 'steel_plating'"), 'plating L2 key')
  assert.ok(gameData.includes("prerequisiteResearch: 'iron_plating'"), 'plating L2 prerequisite')
  // Level 3: mithril_plating 175/275, requiresBuilding castle
  assert.ok(gameData.includes("key: 'mithril_plating'"), 'plating L3 key')
  assert.ok(gameData.includes("prerequisiteResearch: 'steel_plating'"), 'plating L3 prerequisite')
})

test('BS-AI-23: Blacksmith researches list contains all 10 upgrades in GameData', () => {
  const researches = [
    'long_rifles', 'iron_forged_swords', 'steel_forged_swords', 'mithril_forged_swords',
    'black_gunpowder', 'refined_gunpowder', 'imbued_gunpowder',
    'iron_plating', 'steel_plating', 'mithril_plating',
  ]
  for (const r of researches) {
    assert.ok(gameData.includes(`'${r}'`), `blacksmith researches must include ${r}`)
  }
})

// ── Next step boundary ────────────────────────────────────────

test('BS-AI-24: contract defines safe next continuation', () => {
  assert.ok(contract.includes('HN7-AI15'), 'must name AI15 as next')
  assert.ok(contract.includes('Leather Armor'), 'must mention Leather Armor as candidate')
  assert.ok(contract.includes('Castle 升级'), 'must mention Castle upgrade as candidate')
  assert.ok(contract.includes('不能直接开'), 'must forbid jumping to heroes/air/items')
})
