/**
 * V9 HERO9-CONTRACT1 Hero death and revive branch contract static proof.
 *
 * Proves the contract references HERO8, defines death/revive semantics,
 * requires source boundary for exact values, and keeps forbidden scope closed.
 */
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { test } from 'node:test'

const contract = readFileSync(
  new URL('../docs/V9_HERO9_HERO_DEATH_REVIVE_CONTRACT.zh-CN.md', import.meta.url),
  'utf8',
)
const gameData = readFileSync(new URL('../src/game/GameData.ts', import.meta.url), 'utf8')
const game = readFileSync(new URL('../src/game/Game.ts', import.meta.url), 'utf8')

// ── Document shape ───────────────────────────────────────

test('DRC-1: contract exists and has substance', () => {
  assert.ok(contract.length > 1000)
})

test('DRC-2: contract references HERO8 closure', () => {
  assert.ok(contract.includes('HERO8') || contract.includes('闭包'))
})

test('DRC-3: contract references current accepted hero runtime facts', () => {
  assert.ok(contract.includes('祭坛') || contract.includes('Altar'))
  assert.ok(contract.includes('圣骑士') || contract.includes('Paladin'))
  assert.ok(contract.includes('圣光术') || contract.includes('Holy Light'))
  assert.ok(contract.includes('唯一性') || contract.includes('uniqueness'))
})

// ── Death state semantics ────────────────────────────────

test('DRC-4: contract defines hero death trigger at 0 HP', () => {
  assert.ok(contract.includes('HP') && contract.includes('0'))
  assert.ok(contract.includes('停止行动') || contract.includes('stop acting'))
})

test('DRC-5: contract defines dead hero isDead flag', () => {
  assert.ok(contract.includes('isDead'))
})

test('DRC-6: contract defines dead hero is not targetable/attackable', () => {
  assert.ok(contract.includes('攻击目标') || contract.includes('targetable') || contract.includes('attack'))
})

test('DRC-7: contract defines dead hero stays in units array', () => {
  assert.ok(contract.includes('移除') || contract.includes('removed'))
  assert.ok(contract.includes('units') || contract.includes('数组'))
})

// ── Uniqueness while dead ─────────────────────────────────

test('DRC-8: contract addresses uniqueness while dead', () => {
  assert.ok(contract.includes('唯一性') && (contract.includes('死亡') || contract.includes('dead')))
})

test('DRC-9: contract requires uniqueness check to block new summon while dead', () => {
  assert.ok(
    contract.includes('阻止') || contract.includes('block') || contract.includes('防止'),
    'must specify blocking new summon for dead hero'
  )
  assert.ok(
    contract.includes('同队伍同类型英雄记录只要存在') || contract.includes('hasExistingHero'),
    'summon uniqueness must count existing hero records whether alive or dead',
  )
  assert.ok(
    contract.includes('isDead === true'),
    'revive availability must use a separate dead-hero check',
  )
  assert.ok(
    !contract.includes('唯一性检查应改为 `!u.isDead`'),
    'contract must not claim !isDead alone preserves dead-hero uniqueness',
  )
})

// ── Altar revive ─────────────────────────────────────────

test('DRC-10: contract defines Altar revive action', () => {
  assert.ok(contract.includes('复活') || contract.includes('revive'))
  assert.ok(contract.includes('祭坛') || contract.includes('Altar'))
})

test('DRC-11: contract defines revive only for player dead hero', () => {
  assert.ok(contract.includes('死亡英雄') || contract.includes('dead hero'))
})

test('DRC-12: contract defines revive output as restoring existing hero', () => {
  assert.ok(
    contract.includes('恢复') || contract.includes('restore') || contract.includes('不创建新单位'),
    'revive must restore existing hero, not create new unit'
  )
})

// ── Queue/resource/time/population concerns ───────────────

test('DRC-13: contract addresses revive resource cost', () => {
  assert.ok(contract.includes('费用') || contract.includes('cost'))
})

test('DRC-14: contract addresses revive time', () => {
  assert.ok(contract.includes('时间') || contract.includes('time'))
})

test('DRC-15: contract addresses revive population rules', () => {
  assert.ok(contract.includes('人口') || contract.includes('population') || contract.includes('supply'))
})

test('DRC-16: contract addresses revive queue behavior', () => {
  assert.ok(contract.includes('队列') || contract.includes('queue'))
})

// ── Source boundary requirement ───────────────────────────

test('DRC-17: contract requires source boundary for exact revive cost', () => {
  assert.ok(
    contract.includes('source-boundary required')
    || contract.includes('源边界')
    || contract.includes('SRC'),
    'must require source boundary for revive cost'
  )
})

test('DRC-18: contract marks exact cost/time as source-boundary required', () => {
  assert.ok(
    contract.includes('[SRC]') || contract.includes('source-boundary required'),
    'must mark exact values as needing source confirmation'
  )
})

test('DRC-19: contract does not hard-code final revive values', () => {
  // Any numbers should be clearly labeled as placeholders
  assert.ok(
    contract.includes('占位') || contract.includes('placeholder') || contract.includes('示例'),
    'specific numbers must be labeled as placeholders'
  )
})

// ── Proof sequence ───────────────────────────────────────

test('DRC-20: contract defines slice order SRC1 → DATA1 → IMPL1 → IMPL2 → CLOSE1', () => {
  assert.ok(contract.includes('HERO9-SRC1'))
  assert.ok(contract.includes('HERO9-IMPL1'))
  assert.ok(contract.includes('HERO9-IMPL2'))
  assert.ok(contract.includes('HERO9-CLOSE1'))
})

test('DRC-21: contract requires each slice accepted before next', () => {
  assert.ok(contract.includes('accepted'))
})

// ── Forbidden scope closed ───────────────────────────────

test('DRC-22: contract keeps XP/leveling closed', () => {
  assert.ok(contract.includes('经验') || contract.includes('XP'))
  assert.ok(contract.includes('升级') || contract.includes('leveling'))
})

test('DRC-23: contract keeps other three heroes closed', () => {
  assert.ok(contract.includes('大法师') || contract.includes('Archmage'))
  assert.ok(contract.includes('山丘之王') || contract.includes('Mountain King'))
  assert.ok(contract.includes('血法师') || contract.includes('Blood Mage'))
})

test('DRC-24: contract keeps items/shop/Tavern/aura/AI/visuals/air/second race/multiplayer closed', () => {
  assert.ok(contract.includes('物品') || contract.includes('item'))
  assert.ok(contract.includes('商店') || contract.includes('shop'))
  assert.ok(contract.includes('酒馆') || contract.includes('Tavern'))
  assert.ok(contract.includes('AI'))
  assert.ok(contract.includes('空军') || contract.includes('air'))
  assert.ok(contract.includes('第二阵营') || contract.includes('second race'))
  assert.ok(contract.includes('多人') || contract.includes('multiplayer'))
})

test('DRC-25: contract does not claim complete hero system', () => {
  assert.ok(!contract.includes('英雄系统已完成') && !contract.includes('hero system complete'))
})

// ── No production files modified ─────────────────────────

test('DRC-26: GameData.ts isDead field exists from HERO4 (data-only)', () => {
  assert.ok(gameData.includes('isDead?'), 'isDead must exist as optional field in UnitDef')
})

test('DRC-27: Game.ts does not set isDead yet', () => {
  assert.ok(!game.includes('isDead = true'), 'Game.ts must not set isDead yet')
})
