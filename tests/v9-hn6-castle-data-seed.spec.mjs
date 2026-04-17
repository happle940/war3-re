/**
 * V9 HN6-DATA1 Castle data seed proof.
 *
 * Proves:
 * 1. BUILDINGS.castle exists with contract-aligned fields
 * 2. BUILDINGS.keep.upgradeTo points to 'castle'
 * 3. Castle is T3, trains only worker, no Knight/T3 units
 * 4. Game.ts keeps Castle runtime generic, without Castle-specific branches
 * 5. Later Knight data seed exists, but runtime/training is still closed
 */
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { test } from 'node:test'

const gameData = readFileSync(new URL('../src/game/GameData.ts', import.meta.url), 'utf8')
const game = readFileSync(new URL('../src/game/Game.ts', import.meta.url), 'utf8')

function extractObjectBody(source, key) {
  const needle = `${key}: {`
  const start = source.indexOf(needle)
  assert.notEqual(start, -1, `${key} block must exist`)

  let depth = 0
  let bodyStart = source.indexOf('{', start)
  for (let i = bodyStart; i < source.length; i++) {
    if (source[i] === '{') depth++
    if (source[i] === '}') depth--
    if (depth === 0) return source.slice(bodyStart, i + 1)
  }
  throw new Error(`unterminated ${key} block`)
}

test('CD-1: BUILDINGS.castle exists with contract-aligned fields', () => {
  const body = extractObjectBody(gameData, 'castle')

  assert.ok(body.includes("key: 'castle'"), 'castle key must exist')
  assert.ok(body.includes("name: '城堡'"), 'castle name must be present')
  assert.ok(body.includes('cost: { gold: 360, lumber: 210 }'), 'castle cost must match contract')
  assert.ok(body.includes('buildTime: 140'), 'castle buildTime must match contract')
  assert.ok(body.includes('hp: 2500'), 'castle hp must match contract')
  assert.ok(body.includes('supply: 0'), 'castle supply must be 0')
  assert.ok(body.includes('size: 4'), 'castle size must be 4')
  assert.ok(body.includes('techTier: 3'), 'castle must be T3')
  assert.ok(body.includes("trains: ['worker']"), 'castle must train only worker')
})

test('CD-2: BUILDINGS.keep.upgradeTo points to castle', () => {
  const keepBody = extractObjectBody(gameData, 'keep')
  assert.ok(keepBody.includes("upgradeTo: 'castle'"), 'keep must upgradeTo castle')
  assert.ok(keepBody.includes('techTier: 2'), 'keep must remain T2')
})

test('CD-3: Castle does not train Knight, heroes, air units or T3 buildings', () => {
  const body = extractObjectBody(gameData, 'castle')
  assert.ok(!body.includes('knight'), 'castle must not train knight')
  assert.ok(!body.includes('hero'), 'castle must not train heroes')
  assert.ok(!body.includes('gryphon'), 'castle must not train air units')
})

test('CD-4: Game.ts has Castle-aware main hall helpers but no Castle-specific upgrade branch', () => {
  // IMPL2: isMainHall now includes 'castle' so upgrade flow is generic
  assert.ok(game.includes('isMainHall'), 'Game.ts must have isMainHall helper')
  assert.ok(!game.includes("case 'castle'"), 'Game.ts must not have Castle-specific case branch')
  assert.ok(!game.includes("targetType === 'castle'"), 'Game.ts must not special-case Castle upgrade')
})

test('CD-5: Knight training runtime stays generic through techPrereqs', () => {
  assert.ok(gameData.includes("key: 'knight'"), 'Knight unit data must exist')
  assert.ok(gameData.includes("techPrereqs: ['castle', 'blacksmith', 'lumber_mill']"),
    'Knight must use multi-prereq')
  assert.ok(game.includes('def.techPrereqs'), 'Game.ts must consume generic techPrereqs')
  assert.ok(!game.includes("case 'knight'"), 'Game.ts must not add Knight-specific switch branch')
  assert.ok(!game.includes("targetType === 'knight'"), 'Game.ts must not special-case Knight')
})
