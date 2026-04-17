/**
 * V9 HN4-CLOSE6 Militia / Back to Work / Defend Closure Inventory
 *
 * Proves:
 * 1. All three HN4 abilities have data seeds in GameData.ts
 * 2. All three HN4 abilities have runtime entries in Game.ts
 * 3. Command card exposes all three ability buttons to correct owner types
 * 4. No AI Defend/Slow, no assets, no heroes, no items, no Spell Breaker/Knight
 * 5. HN4 contract doc confirms completion and lists no remaining items
 * 6. Expansion packet lists next branch candidate but does not implement it
 */
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { test } from 'node:test'

const gameData = readFileSync(new URL('../src/game/GameData.ts', import.meta.url), 'utf8')
const game = readFileSync(new URL('../src/game/Game.ts', import.meta.url), 'utf8')
const contract = readFileSync(new URL('../docs/V9_HN4_MILITIA_DEFEND_CONTRACT.zh-CN.md', import.meta.url), 'utf8')
const expansion = readFileSync(new URL('../docs/V9_HUMAN_NUMERIC_EXPANSION_PACKET.zh-CN.md', import.meta.url), 'utf8')

test('CLOSE-1: all three HN4 ability data seeds exist in GameData.ts', () => {
  assert.ok(gameData.includes("key: 'call_to_arms'"), 'ABILITIES.call_to_arms must exist')
  assert.ok(gameData.includes("key: 'back_to_work'"), 'ABILITIES.back_to_work must exist')
  assert.ok(gameData.includes("key: 'defend'"), 'ABILITIES.defend must exist')
  assert.ok(gameData.includes("key: 'militia'"), 'UNITS.militia must exist')
})

test('CLOSE-2: all three HN4 abilities have runtime entries in Game.ts', () => {
  // Call to Arms / Militia
  assert.ok(game.includes('morphToMilitia'), 'Game.ts must have morphToMilitia runtime')
  assert.ok(game.includes('revertMilitia'), 'Game.ts must have revertMilitia runtime')
  assert.ok(game.includes('updateMilitiaExpiration'), 'Game.ts must have militia expiration check')
  assert.ok(game.includes('ABILITIES.call_to_arms'), 'Game.ts must read ABILITIES.call_to_arms')
  // Back to Work
  assert.ok(game.includes('backToWork'), 'Game.ts must have backToWork runtime')
  assert.ok(game.includes('ABILITIES.back_to_work'), 'Game.ts must read ABILITIES.back_to_work')
  // Defend
  assert.ok(game.includes('setDefend'), 'Game.ts must have setDefend runtime')
  assert.ok(game.includes('toggleDefend'), 'Game.ts must have toggleDefend runtime')
  assert.ok(game.includes('ABILITIES.defend'), 'Game.ts must read ABILITIES.defend')
  assert.ok(game.includes('defendActive'), 'Game.ts must track defendActive state')
})

test('CLOSE-3: command card exposes buttons for correct owner types via data-driven labels', () => {
  // 紧急动员 for Worker near townhall/keep — reads cta.name from ABILITIES.call_to_arms
  assert.ok(game.includes('cta.name'), 'command card must use cta.name for Call to Arms')
  assert.ok(gameData.includes("name: '紧急动员'"), 'call_to_arms data must have 紧急动员 name')
  // 返回工作 for Militia — reads btw.name from ABILITIES.back_to_work
  assert.ok(game.includes('btw.name'), 'command card must use btw.name for Back to Work')
  assert.ok(gameData.includes("name: '返回工作'"), 'back_to_work data must have 返回工作 name')
  // 防御姿态 for Footman — reads defend.name from ABILITIES.defend
  assert.ok(game.includes('defend.name'), 'command card must use defend.name for Defend')
  assert.ok(gameData.includes("name: '防御姿态'"), 'defend data must have 防御姿态 name')
})

test('CLOSE-4: no AI Defend/Slow, no heroes, no Spell Breaker/Knight, and no HN5 over-expansion', () => {
  // HN5 may now add Sorceress data/training/manual Slow after HN4 closes.
  // HN4 closure still forbids AI usage and broader Human tech over-expansion.
  assert.ok(!gameData.includes("key: 'spell_breaker'"), 'no Spell Breaker unit data')
  assert.ok(!gameData.includes("key: 'knight'"), 'no Knight unit data')
  // No hero data
  assert.ok(!gameData.includes("key: 'paladin'"), 'no Paladin hero data')
  assert.ok(!gameData.includes("key: 'archmage'"), 'no Archmage hero data')
  assert.ok(!gameData.includes("key: 'mountain_king'"), 'no Mountain King hero data')
  // No item system
  assert.ok(!gameData.includes("key: 'item'"), 'no item data')
  // AI does not use Defend
  const ai = readFileSync(new URL('../src/game/SimpleAI.ts', import.meta.url), 'utf8')
  assert.ok(!ai.includes('defend'), 'AI must not use Defend')
  assert.ok(!ai.includes('Defend'), 'AI must not reference Defend')
  assert.ok(!ai.includes('slow'), 'AI must not use Slow')
  assert.ok(!ai.includes('Slow'), 'AI must not reference Slow')
  assert.ok(!game.includes('attackSpeedMultiplier'), 'Game.ts must not add Slow attack speed debuff yet')
})

test('CLOSE-5: HN4 contract confirms completion', () => {
  assert.ok(contract.includes('Task 148'), 'contract must mention Task 148 completion')
  assert.ok(contract.includes('6.6'), 'contract must have section 6.6 for remaining items')
  assert.ok(contract.includes('三个能力最小 runtime 均已完成'), 'contract must state all three runtimes complete')
  assert.ok(contract.includes('Defend runtime') && contract.includes('Task 148'), 'contract must confirm Defend runtime done')
  assert.ok(contract.includes('下一步'), 'contract must state next steps')
})

test('CLOSE-6: expansion packet lists next branch candidate but does not implement', () => {
  assert.ok(expansion.includes('HN4'), 'expansion packet must reference HN4')
  assert.ok(expansion.includes('Task148'), 'expansion packet must reference Task 148')
  // Must list candidates but not claim implementation
  assert.ok(expansion.includes('下一分支'), 'expansion must mention next branch')
  // Must not claim complete Human
  assert.ok(!expansion.includes('Human 完成'), 'must not claim complete Human')
  assert.ok(!expansion.includes('全部 Human'), 'must not claim all Human complete')
})
