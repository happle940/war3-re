/**
 * V9 HN4-PLAN1 Militia / Defend Branch Contract Static Proof
 *
 * Proves:
 * 1. Contract contains Militia, Back to Work, Defend entries
 * 2. Contract defines minimal data fields, runtime behavior, and proof sequence
 * 3. Contract specifies first implementation task must be one minimal slice
 * 4. Contract blocks heroes, items, second faction, asset import, full tech tree
 * 5. Defend remains absent until its dedicated implementation slice
 */
import assert from 'node:assert/strict'
import { readFileSync, statSync } from 'node:fs'
import { test } from 'node:test'

const contract = readFileSync(new URL('../docs/V9_HN4_MILITIA_DEFEND_CONTRACT.zh-CN.md', import.meta.url), 'utf8')
const gameTs = readFileSync(new URL('../src/game/Game.ts', import.meta.url), 'utf8')
const gameDataTs = readFileSync(new URL('../src/game/GameData.ts', import.meta.url), 'utf8')

test('HNC-1: contract contains all three ability entries', () => {
  assert.ok(contract.includes('Militia'), 'contract must mention Militia')
  assert.ok(contract.includes('Back to Work'), 'contract must mention Back to Work')
  assert.ok(contract.includes('Defend'), 'contract must mention Defend')
})

test('HNC-2: contract defines minimal data fields, runtime behavior, and proof sequence for each ability', () => {
  // Militia data fields
  assert.ok(contract.includes('morphTarget'), 'contract must define morphTarget for Militia')
  assert.ok(contract.includes("militia"), 'contract must reference militia unit type')
  assert.ok(contract.includes('duration'), 'contract must define duration')
  assert.ok(contract.includes('attackDamage'), 'contract must define attackDamage')

  // Runtime behavior descriptions
  assert.ok(contract.includes('变身'), 'contract must describe morph behavior')
  assert.ok(contract.includes('命令卡'), 'contract must reference command card behavior')

  // Proof sequences
  assert.ok(contract.includes('DATA proof'), 'contract must define DATA proof')
  assert.ok(contract.includes('RUNTIME proof'), 'contract must define RUNTIME proof')
  assert.ok(contract.includes('IDENTITY proof'), 'contract must define IDENTITY proof')
  assert.ok(contract.includes('COMMAND proof'), 'contract must define COMMAND proof')
})

test('HNC-3: contract specifies first implementation must be one minimal slice', () => {
  assert.ok(contract.includes('一个'), 'contract must limit to one slice')
  assert.ok(contract.includes('不允许第一张任务同时实现两个能力'), 'contract must explicitly block multi-ability first task')
  assert.ok(contract.includes('优先级'), 'contract must specify priority order')
})

test('HNC-4: contract explicitly blocks heroes, items, second faction, assets, full tech tree', () => {
  const blocked = [
    '英雄',
    '物品',
    '第二阵营',
    '素材导入',
    '全科技树',
    'AI 战术重写',
    'Sorceress',
    'Spell Breaker',
  ]
  for (const item of blocked) {
    assert.ok(contract.includes(item), `contract must block ${item}`)
  }
})

test('HNC-5: Defend data seed and runtime exist in Game.ts', () => {
  // Militia runtime added in Task 145; back_to_work added in Task 146; defend data seed added in Task 147.
  // Defend runtime (toggle, command card, damage reduction) added in Task 148.
  assert.ok(gameTs.includes('ABILITIES.defend'), 'Game.ts must read ABILITIES.defend')
  assert.ok(gameTs.includes('defendActive'), 'Game.ts must track defendActive state')
  assert.ok(gameTs.includes('defend.name'), 'Game.ts must expose Defend command card label from ability data')
  assert.ok(gameTs.includes('setDefend'), 'Game.ts must expose Defend toggle path')
  assert.ok(gameDataTs.includes("key: 'defend'"), 'GameData.ts must contain defend data seed')
  assert.ok(gameDataTs.includes('affectedAttackType: AttackType.Piercing'), 'defend seed must target Piercing attacks')
})
