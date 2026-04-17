/**
 * V9 HN6-DATA4 Knight data seed proof.
 *
 * Proves:
 * 1. UNITS.knight exists with contract-aligned fields
 * 2. Knight uses techPrereqs multi-prerequisite (castle + blacksmith + lumber_mill)
 * 3. Knight does not use single techPrereq
 * 4. Knight identity is distinct from Footman
 * 5. Barracks trains includes knight after HN6-IMPL5
 * 6. Game.ts consumes techPrereqs through the generic training gate
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

test('KD-1: UNITS.knight exists with contract-aligned fields', () => {
  const body = extractObjectBody(gameData, 'knight')

  assert.ok(body.includes("key: 'knight'"), 'knight key')
  assert.ok(body.includes("name: '骑士'"), 'knight name')
  assert.ok(body.includes('cost: { gold: 245, lumber: 60 }'), 'knight cost')
  assert.ok(body.includes('trainTime: 45'), 'knight trainTime')
  assert.ok(body.includes('hp: 835'), 'knight hp')
  assert.ok(body.includes('speed: 3.5'), 'knight speed')
  assert.ok(body.includes('supply: 4'), 'knight supply')
  assert.ok(body.includes('attackDamage: 34'), 'knight attackDamage')
  assert.ok(body.includes('attackRange: 1.0'), 'knight attackRange')
  assert.ok(body.includes('attackCooldown: 1.4'), 'knight attackCooldown')
  assert.ok(body.includes('armor: 5'), 'knight armor')
  assert.ok(body.includes('sightRange: 12'), 'knight sightRange')
  assert.ok(body.includes('canGather: false'), 'knight canGather')
  assert.ok(body.includes("description: '重甲近战单位，高生命高护甲'"), 'knight description')
  assert.ok(body.includes('AttackType.Normal'), 'knight attackType')
  assert.ok(body.includes('ArmorType.Heavy'), 'knight armorType')
})

test('KD-2: Knight uses techPrereqs multi-prerequisite', () => {
  const body = extractObjectBody(gameData, 'knight')
  assert.ok(body.includes("techPrereqs: ['castle', 'blacksmith', 'lumber_mill']"),
    'knight must use techPrereqs with all three buildings')
  assert.ok(body.includes('castle'), 'must require castle')
  assert.ok(body.includes('blacksmith'), 'must require blacksmith')
  assert.ok(body.includes('lumber_mill'), 'must require lumber_mill')
})

test('KD-3: Knight does not use single techPrereq', () => {
  const body = extractObjectBody(gameData, 'knight')
  assert.ok(!body.includes('techPrereq:'), 'knight must not use single techPrereq')
})

test('KD-4: Knight identity is distinct from Footman', () => {
  const knightBody = extractObjectBody(gameData, 'knight')
  const footmanBody = extractObjectBody(gameData, 'footman')

  // Extract numeric values
  const knightHp = knightBody.match(/hp: (\d+)/)?.[1]
  const footmanHp = footmanBody.match(/hp: (\d+)/)?.[1]
  assert.ok(Number(knightHp) > Number(footmanHp), 'knight hp must exceed footman hp')

  const knightArmor = knightBody.match(/armor: (\d+)/)?.[1]
  const footmanArmor = footmanBody.match(/armor: (\d+)/)?.[1]
  assert.ok(Number(knightArmor) > Number(footmanArmor), 'knight armor must exceed footman armor')

  const knightSupply = knightBody.match(/supply: (\d+)/)?.[1]
  const footmanSupply = footmanBody.match(/supply: (\d+)/)?.[1]
  assert.ok(Number(knightSupply) > Number(footmanSupply), 'knight supply must exceed footman supply')

  const knightDmg = knightBody.match(/attackDamage: (\d+)/)?.[1]
  const footmanDmg = footmanBody.match(/attackDamage: (\d+)/)?.[1]
  assert.ok(Number(knightDmg) > Number(footmanDmg), 'knight attackDamage must exceed footman')
})

test('KD-5: Barracks trains includes knight', () => {
  const barracksBody = extractObjectBody(gameData, 'barracks')
  assert.ok(barracksBody.includes('knight'), 'barracks trains must include knight')
})

test('KD-6: Game.ts consumes techPrereqs for multi-prereq gating', () => {
  assert.ok(game.includes('techPrereqs'), 'Game.ts must reference techPrereqs')
  assert.ok(game.includes('def.techPrereqs'), 'Game.ts must check def.techPrereqs')
})
