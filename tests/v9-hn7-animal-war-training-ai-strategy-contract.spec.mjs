/**
 * V9 HN7-AI11 Animal War Training AI strategy contract proof.
 *
 * Static proof that the AWT AI strategy contract covers trigger conditions,
 * budget boundaries, retry boundaries, forbidden branches, and implementation scope.
 */
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { test } from 'node:test'

const contract = readFileSync(
  new URL('../docs/V9_HN7_ANIMAL_WAR_TRAINING_AI_STRATEGY_CONTRACT.zh-CN.md', import.meta.url),
  'utf8',
)
const gameData = readFileSync(new URL('../src/game/GameData.ts', import.meta.url), 'utf8')

// ── Trigger conditions ───────────────────────────────────────

test('AI-STRAT-1: contract defines all 7 trigger conditions', () => {
  for (const condition of [
    'C1', 'C2', 'C3', 'C4', 'C5', 'C6', 'C7',
    'Castle', 'Barracks', 'Lumber Mill', 'Blacksmith',
    'AWT 未完成',
    '研究队列为空',
    'Knight',
  ]) {
    assert.ok(contract.includes(condition), `contract must include ${condition}`)
  }
})

test('AI-STRAT-2: C1 requires Castle (not just Keep)', () => {
  assert.ok(contract.includes("townhall.type === 'castle'"), 'must require Castle type')
  assert.ok(contract.includes('只是 Keep 时 AWT 前置不满足'), 'must explain Keep is not enough')
})

test('AI-STRAT-3: C5 and C6 prevent duplicate research', () => {
  assert.ok(contract.includes("completedResearches.includes('animal_war_training')"),
    'must check completed researches')
  assert.ok(contract.includes('researchQueue.length === 0'),
    'must check empty research queue')
})

test('AI-STRAT-4: C7 requires at least one Knight before AWT', () => {
  assert.ok(contract.includes("myUnits('knight')"), 'must check existing Knights')
  assert.ok(contract.includes('没有 Knight 时无意义'), 'must explain why Knight is needed')
})

// ── Budget boundaries ────────────────────────────────────────

test('AI-STRAT-5: contract defines budget boundaries with production reserve', () => {
  assert.ok(contract.includes('125'), 'must reference AWT cost')
  assert.ok(contract.includes('P1'), 'must define worker reserve')
  assert.ok(contract.includes('P2'), 'must define footman reserve')
  assert.ok(contract.includes('workerCost'), 'must compute worker cost')
  assert.ok(contract.includes('footmanCost'), 'must compute footman cost')
})

test('AI-STRAT-6: budget check does not starve worker or military training', () => {
  assert.ok(contract.includes('canAfford'), 'must use canAfford')
  assert.ok(contract.includes('饿死'), 'must reference anti-starvation')
})

// ── Retry boundaries ─────────────────────────────────────────

test('AI-STRAT-7: contract defines retry boundaries for all failure modes', () => {
  for (const scenario of [
    'AWT 已完成',
    'AWT 正在研究',
    '资源不足',
    '缺建筑',
    '无 Knight',
    'Barracks 不存在',
  ]) {
    assert.ok(contract.includes(scenario), `retry boundary must cover: ${scenario}`)
  }
})

test('AI-STRAT-8: completed research is never retried', () => {
  assert.ok(contract.includes('永不重试'), 'completed research must never retry')
})

// ── Decision priority ────────────────────────────────────────

test('AI-STRAT-9: contract defines decision priority in tick order', () => {
  assert.ok(contract.includes('优先级'), 'must define priority')
  assert.ok(contract.includes('Long Rifles'), 'must reference existing Long Rifles research')
  assert.ok(contract.includes('供给'), 'supply must be higher priority')
  assert.ok(contract.includes('农民'), 'worker training must be higher priority')
})

// ── Forbidden branches ───────────────────────────────────────

test('AI-STRAT-10: contract forbids Keep->Castle upgrade in AI12', () => {
  assert.ok(contract.includes('不实现 Keep → Castle'), 'must forbid Castle upgrade')
  assert.ok(contract.includes('不实现 Knight 训练'), 'must forbid Knight training')
  assert.ok(contract.includes('不实现 Blacksmith 三段升级'), 'must forbid melee/ranged/armor chains')
})

test('AI-STRAT-11: contract forbids Leather Armor, heroes, air, items, assets', () => {
  for (const forbidden of ['Leather Armor', '英雄', '空军', '物品', '素材', '完整三本战术']) {
    assert.ok(contract.includes(forbidden), `${forbidden} must be forbidden`)
  }
})

// ── Implementation boundary ──────────────────────────────────

test('AI-STRAT-12: contract defines allowed and forbidden files for AI12', () => {
  assert.ok(contract.includes('SimpleAI.ts'), 'must name SimpleAI.ts as allowed')
  assert.ok(contract.includes('GameData.ts'), 'must name GameData.ts as forbidden')
  assert.ok(contract.includes('Game.ts'), 'must name Game.ts as forbidden')
})

test('AI-STRAT-13: contract requires data-driven values from RESEARCHES', () => {
  assert.ok(contract.includes('RESEARCHES.animal_war_training'), 'must reference data source')
  assert.ok(contract.includes('硬编码'), 'must mention hardcoded values as forbidden')
})

// ── Current AI state verification ────────────────────────────

test('AI-STRAT-14: contract records the AI11 baseline without freezing AI12', () => {
  assert.ok(contract.includes('当前 AI 状态'), 'must record the AI11 baseline section')
  assert.ok(contract.includes('没有**任何 AWT 相关代码') || contract.includes('**没有** 任何 AWT 相关代码'),
    'must record that AI11 starts without AWT code')
  assert.ok(contract.includes('没有** Knight 训练') || contract.includes('**没有** Knight 训练'),
    'must record that Knight training is outside AI11')
  assert.ok(contract.includes('不实现 Keep → Castle'), 'must keep Castle upgrade outside AI12')
})

// ── Data consistency ─────────────────────────────────────────

test('AI-STRAT-15: GameData AWT data matches contract trigger conditions', () => {
  // AWT requires Building: barracks
  assert.ok(gameData.includes("requiresBuilding: 'barracks'"), 'AWT must require barracks')
  // AWT requires Buildings: castle, lumber_mill, blacksmith
  assert.ok(gameData.includes("'castle', 'lumber_mill', 'blacksmith'"),
    'AWT must require castle+lumber_mill+blacksmith')
  // AWT cost: 125/125
  assert.ok(gameData.includes('gold: 125, lumber: 125'), 'AWT cost must be 125/125')
  // AWT effect: knight maxHp +100
  assert.ok(gameData.includes("targetUnitType: 'knight', stat: 'maxHp', value: 100"),
    'AWT must affect knight maxHp')
})

// ── Next step boundary ───────────────────────────────────────

test('AI-STRAT-16: contract defines safe next continuation', () => {
  assert.ok(contract.includes('HN7-AI12'), 'must name AI12 as next')
  assert.ok(contract.includes('Leather Armor'), 'must mention Leather Armor as candidate')
  assert.ok(contract.includes('AI Blacksmith'), 'must mention Blacksmith upgrade as candidate')
  assert.ok(contract.includes('不能直接开'), 'must forbid jumping to heroes/air/items')
})
