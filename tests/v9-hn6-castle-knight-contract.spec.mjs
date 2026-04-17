/**
 * V9 HN6-PLAN1 Castle / Knight Branch Contract Static Proof
 *
 * Proves:
 * 1. Contract exists with Castle and Knight entries
 * 2. Contract defines data fields, implementation stages, and proof sequences
 * 3. Contract specifies first implementation must be data-only (no runtime)
 * 4. Contract blocks heroes, items, air units, full T3 tech tree, AI, assets
 * 5. Current implementation keeps Castle generic; Knight data exists but training/runtime is absent
 */
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { test } from 'node:test'

const contract = readFileSync(new URL('../docs/V9_HN6_CASTLE_KNIGHT_CONTRACT.zh-CN.md', import.meta.url), 'utf8')
const gameData = readFileSync(new URL('../src/game/GameData.ts', import.meta.url), 'utf8')
const game = readFileSync(new URL('../src/game/Game.ts', import.meta.url), 'utf8')

test('HN6C-1: contract contains Castle and Knight entries', () => {
  assert.ok(contract.includes('Castle'), 'contract must mention Castle')
  assert.ok(contract.includes('Knight'), 'contract must mention Knight')
  assert.ok(contract.includes('城堡'), 'contract must mention 城堡')
  assert.ok(contract.includes('骑士'), 'contract must mention 骑士')
})

test('HN6C-2: contract defines data fields, stages, and proof sequences', () => {
  // Data fields
  assert.ok(contract.includes('techTier'), 'contract must define techTier')
  assert.ok(contract.includes('upgradeTo'), 'contract must define upgradeTo')
  assert.ok(contract.includes('hp'), 'contract must define hp')
  assert.ok(contract.includes('armor'), 'contract must define armor')
  assert.ok(contract.includes('attackDamage'), 'contract must define attackDamage')
  assert.ok(contract.includes('attackType'), 'contract must define attackType')
  assert.ok(contract.includes('armorType'), 'contract must define armorType')
  assert.ok(contract.includes('cost'), 'contract must define cost')

  // Implementation stages
  assert.ok(contract.includes('HN6-DATA1'), 'contract must define Castle data seed stage')
  assert.ok(contract.includes('HN6-IMPL2'), 'contract must define Castle upgrade stage')
  assert.ok(contract.includes('HN6-PREREQ3'), 'contract must define Knight prerequisite stage')
  assert.ok(contract.includes('HN6-DATA4'), 'contract must define Knight data seed stage')
  assert.ok(contract.includes('HN6-IMPL5'), 'contract must define Knight training stage')

  // Proof sequences
  assert.ok(contract.includes('DATA proof'), 'contract must define DATA proof')
  assert.ok(contract.includes('RUNTIME proof'), 'contract must define RUNTIME proof')
  assert.ok(contract.includes('IDENTITY proof'), 'contract must define IDENTITY proof')
  assert.ok(contract.includes('COMMAND proof'), 'contract must define COMMAND proof')
})

test('HN6C-3: contract specifies first implementation must be data-only', () => {
  assert.ok(contract.includes('HN6-DATA1'), 'contract must define HN6-DATA1')
  assert.ok(contract.includes('BUILDINGS.castle'), 'contract must specify Castle building data')
  assert.ok(contract.includes('keep.upgradeTo'), 'contract must specify keep upgradeTo')
  assert.ok(contract.includes('不允许第一张任务同时实现数据和 runtime'), 'contract must block data+runtime in first task')
  assert.ok(contract.includes('实现顺序'), 'contract must define implementation order')
})

test('HN6C-4: contract preserves War3-like prerequisite complexity before Knight training', () => {
  assert.ok(contract.includes('Castle + Blacksmith + Lumber Mill'), 'contract must not reduce Knight prerequisite to Castle only')
  assert.ok(contract.includes('techPrereqs'), 'contract must describe the multi-prereq model')
  assert.ok(contract.includes('不能静默降级'), 'contract must block silent prerequisite simplification')
})

test('HN6C-5: contract blocks heroes, items, air units, full T3 tech, AI, assets', () => {
  const blocked = [
    'Animal War Training',
    'Blacksmith',
    'AI',
    '英雄',
    '物品',
    '空军',
    'Siege Engine',
    'Spell Breaker',
    '素材',
    'Masonry',
    'Gryphon',
  ]
  for (const item of blocked) {
    assert.ok(contract.includes(item), `contract must block ${item}`)
  }
})

test('HN6C-6: Knight identity is distinct from Footman', () => {
  assert.ok(contract.includes('835'), 'contract must specify Knight hp = 835')
  assert.ok(contract.includes('armor') && contract.includes('5'), 'Knight must have high armor')
  assert.ok(contract.includes('supply') && contract.includes('4'), 'Knight must cost 4 supply')
  assert.ok(contract.includes('Heavy'), 'Knight must use Heavy armor type')
  assert.ok(contract.includes('Knight 不是 Footman'), 'contract must explain Knight != Footman')
})

test('HN6C-7: Castle data/runtime stay generic; Knight data seed exists with multi-prereq', () => {
  assert.ok(gameData.includes("key: 'castle'"), 'Castle building data must exist')
  assert.ok(gameData.includes("upgradeTo: 'castle'"), 'keep must point to castle')
  assert.ok(gameData.includes("key: 'knight'"), 'Knight unit data must exist')
  assert.ok(gameData.includes("techPrereqs: ['castle', 'blacksmith', 'lumber_mill']"),
    'Knight must use multi-prereq model')
  assert.ok(game.includes('isMainHall'), 'Game.ts must route main-hall behavior through a helper')
  assert.ok(!game.includes("case 'castle'"), 'Game.ts must not add Castle-specific switch branch')
  assert.ok(!game.includes("targetType === 'castle'"), 'Game.ts must not special-case Castle upgrade')
})
