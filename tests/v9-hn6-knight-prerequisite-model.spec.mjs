/**
 * V9 HN6-PREREQ3 Knight multi-prerequisite model proof.
 *
 * Proves:
 * 1. UnitDef has techPrereqs?: string[] field alongside existing techPrereq
 * 2. Existing single-prerequisite uses stay on techPrereq
 * 3. Model can express Castle + Blacksmith + Lumber Mill combination
 * 4. UNITS.knight is the first allowed plural-prerequisite unit data seed
 * 5. Game.ts consumes techPrereqs through the generic training gate after HN6-IMPL5
 * 6. Contract documents the multi-prereq model and its implications
 */
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { test } from 'node:test'

const gameData = readFileSync(new URL('../src/game/GameData.ts', import.meta.url), 'utf8')
const game = readFileSync(new URL('../src/game/Game.ts', import.meta.url), 'utf8')
const contract = readFileSync(new URL('../docs/V9_HN6_CASTLE_KNIGHT_CONTRACT.zh-CN.md', import.meta.url), 'utf8')

test('PREREQ-1: UnitDef declares techPrereqs?: string[] alongside techPrereq', () => {
  // Both fields must exist in UnitDef interface
  const unitDefMatch = gameData.match(/export interface UnitDef \{[\s\S]*?\n\}/)
  assert.ok(unitDefMatch, 'UnitDef interface must exist')
  const unitDefBody = unitDefMatch[0]
  assert.ok(unitDefBody.includes('techPrereq?: string'), 'UnitDef must have single techPrereq')
  assert.ok(unitDefBody.includes('techPrereqs?: string[]'), 'UnitDef must have plural techPrereqs')
})

test('PREREQ-2: existing single-prerequisite uses stay on techPrereq; only knight uses techPrereqs', () => {
  // Rifleman requires blacksmith (single)
  assert.ok(gameData.includes("techPrereq: 'blacksmith'"), 'rifleman techPrereq must be blacksmith')
  // T2 production buildings still use a single Keep gate
  assert.ok(gameData.includes("techPrereq: 'keep'"), 'T2 building gates must still use single prereq')
  // Sorceress requires arcane_sanctum (single)
  assert.ok(gameData.includes("techPrereq: 'arcane_sanctum'"), 'arcane sanctum units unchanged')
  const unitBodies = [...gameData.matchAll(/^\s{2}([a-z_]+): \{([\s\S]*?)^\s{2}\},/gm)]
  const techPrereqsUsers = unitBodies
    .filter(([, , body]) => body.includes('techPrereqs:'))
    .map(([, key]) => key)
  assert.deepEqual(techPrereqsUsers, ['knight'], 'only knight should use techPrereqs in this data seed')
})

test('PREREQ-3: model can express Castle + Blacksmith + Lumber Mill', () => {
  // The field exists and is typed as string[] — enough to express the combination
  assert.ok(gameData.includes('techPrereqs?: string[]'), 'string[] type can hold multiple prereqs')
  // Verify the three target building types all exist
  assert.ok(gameData.includes("key: 'castle'"), 'castle must exist in BUILDINGS')
  assert.ok(gameData.includes("key: 'blacksmith'"), 'blacksmith must exist in BUILDINGS')
  assert.ok(gameData.includes("key: 'lumber_mill'"), 'lumber_mill must exist in BUILDINGS')
})

test('PREREQ-4: Knight data seed exists with techPrereqs', () => {
  assert.ok(gameData.includes("key: 'knight'"), 'knight unit data must exist')
  assert.ok(gameData.includes("techPrereqs: ['castle', 'blacksmith', 'lumber_mill']"),
    'knight must use multi-prereq model')
})

test('PREREQ-5: Game.ts consumes techPrereqs for training prerequisite gate', () => {
  assert.ok(game.includes('techPrereqs'), 'Game.ts must reference techPrereqs')
  assert.ok(game.includes('def.techPrereqs'), 'Game.ts must check def.techPrereqs in training')
})

test('PREREQ-6: contract documents multi-prereq model and Knight prerequisite', () => {
  // Contract must reference the multi-prereq requirement
  assert.ok(contract.includes('Castle + Blacksmith + Lumber Mill'), 'contract must specify Knight prereqs')
  assert.ok(contract.includes('techPrereq') || contract.includes('前置'), 'contract must reference prereq model')
})
