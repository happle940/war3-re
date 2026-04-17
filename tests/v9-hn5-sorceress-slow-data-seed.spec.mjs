/**
 * V9 HN5-DATA1 Sorceress + Slow data seed proof.
 *
 * HN5 has now advanced past the first data seed. Sorceress is trainable and
 * the current runtime slice wires only manual Slow movement reduction.
 */
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { test } from 'node:test'

const gameData = readFileSync(new URL('../src/game/GameData.ts', import.meta.url), 'utf8')
const game = readFileSync(new URL('../src/game/Game.ts', import.meta.url), 'utf8')
const contract = readFileSync(new URL('../docs/V9_HN5_SORCERESS_SLOW_CONTRACT.zh-CN.md', import.meta.url), 'utf8')
const expansion = readFileSync(new URL('../docs/V9_HUMAN_NUMERIC_EXPANSION_PACKET.zh-CN.md', import.meta.url), 'utf8')

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

test('H5D-1: UNITS.sorceress exists with contract-aligned combat identity', () => {
  const body = extractObjectBody(gameData, 'sorceress')

  assert.ok(body.includes("key: 'sorceress'"), 'sorceress key must exist')
  assert.ok(body.includes("name: '女巫'"), 'sorceress name must be present')
  assert.ok(body.includes('cost: { gold: 155, lumber: 25 }'), 'sorceress cost must match contract')
  assert.ok(body.includes('trainTime: 30'), 'sorceress train time must match contract')
  assert.ok(body.includes('hp: 305'), 'sorceress hp must match contract')
  assert.ok(body.includes('supply: 2'), 'sorceress supply must match contract')
  assert.ok(body.includes('attackDamage: 11'), 'sorceress must keep weak ranged attack damage')
  assert.ok(body.includes('attackRange: 5.5'), 'sorceress must keep ranged attack')
  assert.ok(body.includes('attackCooldown: 1.6'), 'sorceress attack cadence must be explicit')
  assert.ok(body.includes('attackType: AttackType.Magic'), 'sorceress must use Magic attack type')
  assert.ok(body.includes('armorType: ArmorType.Unarmored'), 'sorceress must use Unarmored armor type')
  assert.ok(body.includes("techPrereq: 'arcane_sanctum'"), 'sorceress must remain tied to Arcane Sanctum')
})

test('H5D-2: AttackType.Magic has display and multiplier placeholders', () => {
  assert.ok(gameData.includes('AttackType { Normal, Piercing, Siege, Magic }'), 'AttackType must include Magic')
  assert.ok(gameData.includes("'魔法'"), 'Magic attack type must have a visible name')
  assert.ok(gameData.includes('AttackType.Magic}_${ArmorType.Medium}`]:    1.0'), 'Magic vs Medium placeholder must exist')
  assert.ok(gameData.includes('AttackType.Magic}_${ArmorType.Heavy}`]:     1.0'), 'Magic vs Heavy placeholder must exist')
  assert.ok(gameData.includes('AttackType.Magic}_${ArmorType.Unarmored}`]: 1.0'), 'Magic vs Unarmored placeholder must exist')
})

test('H5D-3: ABILITIES.slow exists as data-only enemy speed debuff', () => {
  const body = extractObjectBody(gameData, 'slow')

  assert.ok(body.includes("key: 'slow'"), 'slow key must exist')
  assert.ok(body.includes("name: '减速'"), 'slow name must be present')
  assert.ok(body.includes("ownerType: 'sorceress'"), 'slow owner must be sorceress')
  assert.ok(body.includes('cost: { mana: 40 }'), 'slow mana cost must match contract')
  assert.ok(body.includes('range: 8'), 'slow range must match contract')
  assert.ok(body.includes("teams: 'enemy'"), 'slow must target enemies')
  assert.ok(body.includes('alive: true'), 'slow must target living units')
  assert.ok(body.includes("effectType: 'speedDebuff'"), 'slow effect type must be speedDebuff')
  assert.ok(body.includes('duration: 20'), 'slow duration must match contract')
  assert.ok(body.includes("stackingRule: 'refresh'"), 'slow must refresh')
  assert.ok(body.includes('speedMultiplier: 0.4'), 'slow speed multiplier must match contract')
})

test('H5D-4: Sorceress training is enabled from Arcane Sanctum and Slow runtime remains bounded', () => {
  const sanctum = extractObjectBody(gameData, 'arcane_sanctum')
  assert.ok(sanctum.includes("sorceress"), 'Arcane Sanctum must train sorceress')
  assert.ok(game.includes('castSlow'), 'Game.ts must implement manual castSlow runtime')
  assert.ok(game.includes('const slowDef = ABILITIES.slow'), 'Slow runtime must read ability data')
  assert.ok(game.includes('slowUntil'), 'Slow runtime must track expiry')
  assert.ok(game.includes('slowSpeedMultiplier'), 'Slow runtime must apply movement multiplier')
  assert.ok(game.includes('slowAutoCastEnabled'), 'Game.ts must implement the minimal Slow auto-cast toggle')
  assert.ok(game.includes('slowAutoCastCooldownUntil'), 'Game.ts must guard auto-cast repeat mana spend')
  assert.ok(!game.includes('attackSpeedMultiplier'), 'Game.ts must not implement Slow attack speed debuff yet')
})

test('H5D-5: docs describe HN5 staging and keep post-minimal Slow work bounded', () => {
  assert.ok(contract.includes('Task 151') || contract.includes('HN5-DATA1'), 'contract must track HN5 data seed progress')
  assert.ok(expansion.includes('Task151') || expansion.includes('HN5-DATA1'), 'expansion packet must track HN5 data seed progress')
  assert.ok(expansion.includes('Task152') || expansion.includes('训练'), 'expansion packet must track the training-surface step')
  assert.ok(expansion.includes('Task154') || expansion.includes('Slow runtime'), 'expansion packet must track the minimal Slow runtime step')
  assert.ok(expansion.includes('Task155') || expansion.includes('auto-cast'), 'expansion packet must track the minimal Slow auto-cast step')
  assert.ok(expansion.includes('AI') || expansion.includes('攻击速度减益'), 'expansion packet must keep later Slow work bounded')
})
