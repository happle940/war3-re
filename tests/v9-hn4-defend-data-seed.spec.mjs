/**
 * V9 HN4-DATA4 Defend Ability Data Seed Static Proof
 *
 * Proves:
 * 1. ABILITIES.defend exists for footman
 * 2. Defend data expresses Piercing damage reduction and movement penalty
 * 3. Game.ts still has no Defend runtime or command-card implementation
 * 4. Existing Militia / Back to Work seeds remain intact
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

test('HND-1: AbilityDef can express Defend-specific numeric fields', () => {
  assert.ok(gameData.includes('affectedAttackType?: AttackType'), 'AbilityDef must type affectedAttackType with AttackType')
  assert.ok(gameData.includes('damageReduction?: number'), 'AbilityDef must expose damageReduction')
  assert.ok(gameData.includes('speedMultiplier?: number'), 'AbilityDef must expose speedMultiplier')
})

test('HND-2: ABILITIES.defend is a footman self toggle data seed', () => {
  const defend = objectBlock('defend: {')
  assert.ok(defend.includes("key: 'defend'"), 'defend key must exist')
  assert.ok(defend.includes("name: '防御姿态'"), 'defend visible name must be 防御姿态')
  assert.ok(defend.includes("ownerType: 'footman'"), 'defend must belong to footman')
  assert.ok(defend.includes("teams: 'self'"), 'defend must target self')
  assert.ok(defend.includes('alive: true'), 'defend requires alive owner')
  assert.ok(defend.includes("effectType: 'toggle'"), 'defend must be a toggle data seed')
  assert.ok(defend.includes('duration: 0'), 'defend must not have timed duration in data seed')
})

test('HND-3: Defend data expresses Piercing reduction and speed penalty', () => {
  const defend = objectBlock('defend: {')
  assert.ok(defend.includes('affectedAttackType: AttackType.Piercing'), 'defend must target Piercing attacks')
  assert.ok(defend.includes('damageReduction: 0.5'), 'defend must encode 50% damage multiplier')
  assert.ok(defend.includes('speedMultiplier: 0.5'), 'defend must encode 50% speed multiplier')
  assert.ok(defend.includes('cost: {}'), 'defend must not cost resources or mana')
  assert.ok(defend.includes('cooldown: 0'), 'defend must have no cooldown in data seed')
})

test('HND-4: Game.ts reads ABILITIES.defend for runtime', () => {
  assert.ok(game.includes('ABILITIES.defend'), 'Game.ts must read ABILITIES.defend')
  assert.ok(game.includes('defendActive'), 'Game.ts must use defendActive field')
  assert.ok(game.includes('defend.name'), 'Game.ts must expose Defend command-card label from ability data')
  assert.ok(game.includes('setDefend'), 'Game.ts must expose a Defend toggle path')
})

test('HND-5: existing HN4 morph seeds remain intact', () => {
  const callToArms = objectBlock('call_to_arms: {')
  const backToWork = objectBlock('back_to_work: {')
  assert.ok(callToArms.includes("morphTarget: 'militia'"), 'call_to_arms must still morph to militia')
  assert.ok(backToWork.includes("morphTarget: 'worker'"), 'back_to_work must still morph to worker')
  assert.ok(backToWork.includes("ownerType: 'militia'"), 'back_to_work must still belong to militia')
})
