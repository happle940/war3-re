/**
 * V9 HN4-DATA1 Militia Data Seed Static Proof
 *
 * Proves:
 * 1. UNITS.militia exists with correct fields (canGather: false, Normal, Heavy)
 * 2. ABILITIES.call_to_arms exists with morphTarget: 'militia', duration: 45
 * 3. Game.ts reads Call to Arms / Back to Work ability data for runtime
 * 4. ABILITIES has back_to_work and may now have defend data seed
 * 5. Existing HN3 ability seeds still exist
 */
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { test } from 'node:test'

const gameData = readFileSync(new URL('../src/game/GameData.ts', import.meta.url), 'utf8')
const game = readFileSync(new URL('../src/game/Game.ts', import.meta.url), 'utf8')

function objectBlock(marker) {
  const start = gameData.indexOf(marker)
  assert.notEqual(start, -1, `${marker} block must exist`)
  const end = gameData.indexOf('\n  },', start)
  assert.notEqual(end, -1, `${marker} block must close`)
  return gameData.slice(start, end)
}

test('MDS-1: UNITS.militia exists with correct data fields', () => {
  const militia = objectBlock('militia: {')
  assert.ok(militia.includes("key: 'militia'"), 'GameData must have UNITS.militia')
  assert.ok(militia.includes("name: '民兵'"), 'militia name must be 民兵')
  assert.ok(militia.includes('hp: 230'), 'militia hp must be 230')
  assert.ok(militia.includes('attackDamage: 12'), 'militia attackDamage must be 12')
  assert.ok(militia.includes('armor: 2'), 'militia armor must be 2')
  assert.ok(militia.includes('canGather: false'), 'militia cannot gather')
  assert.ok(militia.includes('attackType: AttackType.Normal'), 'militia must be Normal attack')
  assert.ok(militia.includes('armorType: ArmorType.Heavy'), 'militia must be Heavy armor')
})

test('MDS-2: ABILITIES.call_to_arms exists with morphTarget and duration', () => {
  const callToArms = objectBlock('call_to_arms: {')
  assert.ok(callToArms.includes("key: 'call_to_arms'"), 'GameData must have ABILITIES.call_to_arms')
  assert.ok(callToArms.includes("name: '紧急动员'"), 'call_to_arms name must be 紧急动员')
  assert.ok(callToArms.includes("ownerType: 'worker'"), 'call_to_arms must be owned by worker')
  assert.ok(callToArms.includes("morphTarget: 'militia'"), 'call_to_arms must morph to militia')
  assert.ok(callToArms.includes('duration: 45'), 'call_to_arms duration must be 45')
  assert.ok(callToArms.includes('range: BUILDINGS.townhall.size * 2'), 'call_to_arms range must encode townhall-near trigger range')
  assert.ok(callToArms.includes("effectType: 'morph'"), 'call_to_arms effectType must be morph')
  assert.ok(callToArms.includes("stackingRule: 'none'"), 'call_to_arms stacking must be none')
})

test('MDS-3: Game.ts reads ABILITIES.call_to_arms and UNITS.militia for runtime', () => {
  assert.ok(game.includes('ABILITIES.call_to_arms'), 'Game.ts must read ABILITIES.call_to_arms')
  assert.ok(game.includes('cta.morphTarget'), 'Game.ts must read morphTarget from ability')
  assert.ok(game.includes('UNITS[cta.morphTarget'), 'Game.ts must read militia stats from UNITS')
  assert.ok(game.includes('cta.duration'), 'Game.ts must read duration from ability')
  assert.ok(game.includes('cta.range'), 'Game.ts must read range from ability')
  assert.ok(game.includes('ABILITIES.back_to_work'), 'Game.ts must read ABILITIES.back_to_work')
  assert.ok(game.includes('btw.morphTarget'), 'Game.ts must read back_to_work morphTarget')
  assert.ok(game.includes('backToWork'), 'Game.ts must expose a Back to Work runtime path')
})

test('MDS-4: ABILITIES has back_to_work and defend data seeds', () => {
  const backToWork = objectBlock('back_to_work: {')
  assert.ok(backToWork.includes("key: 'back_to_work'"), 'back_to_work seed must exist')
  assert.ok(backToWork.includes("name: '返回工作'"), 'back_to_work name must be 返回工作')
  assert.ok(backToWork.includes("ownerType: 'militia'"), 'back_to_work must be owned by militia')
  assert.ok(backToWork.includes("morphTarget: 'worker'"), 'back_to_work must morph to worker')
  assert.ok(backToWork.includes("effectType: 'morph'"), 'back_to_work effectType must be morph')
  assert.ok(backToWork.includes('duration: 0'), 'back_to_work duration must be 0')
  const defend = objectBlock('defend: {')
  assert.ok(defend.includes("key: 'defend'"), 'defend seed must exist after Task147')
  assert.ok(defend.includes("ownerType: 'footman'"), 'defend must be owned by footman')
  assert.ok(defend.includes('affectedAttackType: AttackType.Piercing'), 'defend must target Piercing attacks')
})

test('MDS-5: existing HN3 ability seeds still exist', () => {
  assert.ok(gameData.includes("key: 'priest_heal'"), 'priest_heal must still exist')
  assert.ok(gameData.includes("key: 'rally_call'"), 'rally_call must still exist')
  assert.ok(gameData.includes("key: 'mortar_aoe'"), 'mortar_aoe must still exist')
})
