/**
 * V9 HN5-PLAN1 Sorceress / Slow Branch Contract Static Proof
 *
 * Proves:
 * 1. Contract exists with Sorceress and Slow entries
 * 2. Contract defines minimal data fields, runtime behavior, and proof sequences
 * 3. Contract specifies first implementation task must be data-only
 * 4. Contract blocks heroes, items, Spell Breaker, full buff/debuff, AI, assets
 * 5. Current implementation still follows the staged Slow contract boundary
 */
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { test } from 'node:test'

const contract = readFileSync(new URL('../docs/V9_HN5_SORCERESS_SLOW_CONTRACT.zh-CN.md', import.meta.url), 'utf8')
const gameData = readFileSync(new URL('../src/game/GameData.ts', import.meta.url), 'utf8')
const game = readFileSync(new URL('../src/game/Game.ts', import.meta.url), 'utf8')

test('H5C-1: contract contains Sorceress and Slow entries', () => {
  assert.ok(contract.includes('Sorceress'), 'contract must mention Sorceress')
  assert.ok(contract.includes('Slow'), 'contract must mention Slow')
  assert.ok(contract.includes('女巫'), 'contract must mention 女巫')
  assert.ok(contract.includes('减速'), 'contract must describe Slow as 减速')
})

test('H5C-2: contract defines data fields, runtime behavior, and proof sequences', () => {
  // Data fields
  assert.ok(contract.includes("sorceress"), 'contract must define sorceress unit')
  assert.ok(contract.includes('hp'), 'contract must define hp')
  assert.ok(contract.includes('attackDamage'), 'contract must define a weak magic attack')
  assert.ok(contract.includes('attackRange'), 'contract must define ranged attack')
  assert.ok(contract.includes('mana'), 'contract must define mana cost')
  assert.ok(contract.includes('duration'), 'contract must define duration')
  assert.ok(contract.includes('speedMultiplier'), 'contract must define speedMultiplier')

  // Runtime behavior
  assert.ok(contract.includes('命令卡'), 'contract must reference command card')
  assert.ok(contract.includes('施放'), 'contract must describe cast behavior')
  assert.ok(contract.includes('Arcane Sanctum'), 'contract must reference training building')

  // Proof sequences
  assert.ok(contract.includes('DATA proof'), 'contract must define DATA proof')
  assert.ok(contract.includes('RUNTIME proof'), 'contract must define RUNTIME proof')
  assert.ok(contract.includes('IDENTITY proof'), 'contract must define IDENTITY proof')
  assert.ok(contract.includes('COMMAND proof'), 'contract must define COMMAND proof')
})

test('H5C-3: contract specifies first implementation must be data seed only', () => {
  assert.ok(contract.includes('HN5-DATA1'), 'contract must define HN5-DATA1')
  assert.ok(contract.includes('UNITS.sorceress'), 'contract must specify sorceress unit data')
  assert.ok(contract.includes('ABILITIES.slow'), 'contract must specify slow ability data')
  assert.ok(contract.includes('不允许第一张任务同时实现数据和 runtime'), 'contract must block data+runtime in first task')
  assert.ok(contract.includes('实现顺序'), 'contract must define implementation order')
})

test('H5C-4: contract blocks heroes, items, Spell Breaker, full buff/debuff, AI, assets', () => {
  const blocked = [
    'Spell Breaker',
    '英雄系统',
    '物品',
    '第二阵营',
    '素材导入',
    '完整 buff/debuff',
    'AI 战术重写',
    'Invisibility',
    'Polymorph',
    'Knight',
  ]
  for (const item of blocked) {
    assert.ok(contract.includes(item), `contract must block ${item}`)
  }
})

test('H5C-5: GameData.ts has data seeds; Game.ts has bounded manual and auto-cast Slow runtime', () => {
  assert.ok(gameData.includes("key: 'sorceress'"), 'GameData.ts must have sorceress data seed')
  assert.ok(gameData.includes("key: 'slow'"), 'GameData.ts must have slow data seed')
  assert.ok(game.includes('castSlow'), 'Game.ts must have minimal manual castSlow runtime')
  assert.ok(game.includes('const slowDef = ABILITIES.slow'), 'Slow runtime must read ABILITIES.slow')
  assert.ok(game.includes('slowUntil'), 'Slow runtime must track expiry')
  assert.ok(game.includes('slowSpeedMultiplier'), 'Slow runtime must track movement multiplier')
  assert.ok(game.includes('slowAutoCastEnabled'), 'Slow auto-cast toggle state must exist')
  assert.ok(game.includes('slowAutoCastCooldownUntil'), 'Slow auto-cast must have a repeat-spend guard')
  assert.ok(game.includes('findSlowAutoTarget'), 'Slow auto-cast target filter must be isolated')
  assert.ok(!game.includes('attackSpeedMultiplier'), 'Slow runtime must not add attack speed debuff yet')
  assert.ok(!game.includes('BuffSystem'), 'Slow runtime must not add a full buff system yet')
})
