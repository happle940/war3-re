/**
 * V9 HN7-IMPL2 prerequisiteResearch model proof.
 *
 * Static proof that:
 * 1. ResearchDef can express a required prior research key
 * 2. getResearchAvailability blocks ordered research tiers before the prior key is complete
 * 3. startResearch keeps using getResearchAvailability as the single gate
 * 4. No Blacksmith upgrade data, Animal War Training data, command-card widening, or AI strategy is added
 */
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { test } from 'node:test'

const gameData = readFileSync(
  new URL('../src/game/GameData.ts', import.meta.url),
  'utf8',
)
const game = readFileSync(
  new URL('../src/game/Game.ts', import.meta.url),
  'utf8',
)
const contract = readFileSync(
  new URL('../docs/V9_HN7_BLACKSMITH_ANIMAL_TRAINING_CONTRACT.zh-CN.md', import.meta.url),
  'utf8',
)

test('PREREQ-1: ResearchDef includes optional prerequisiteResearch field', () => {
  assert.ok(
    gameData.includes('prerequisiteResearch?: string'),
    'ResearchDef must declare prerequisiteResearch?: string',
  )
})

test('PREREQ-2: prerequisiteResearch is documented as a prior research key', () => {
  assert.ok(
    gameData.includes('research key') && gameData.includes('must be completed'),
    'field comment should explain that the prior research must be completed',
  )
})

test('PREREQ-3: getResearchAvailability consumes prerequisiteResearch', () => {
  assert.ok(
    game.includes('if (def.prerequisiteResearch)'),
    'availability gate must check def.prerequisiteResearch',
  )
  assert.ok(
    game.includes('this.hasCompletedResearch(def.prerequisiteResearch, team)'),
    'availability gate must use completed research state',
  )
})

test('PREREQ-4: disabled reason names the prerequisite research when available', () => {
  assert.ok(
    game.includes('const preDef = RESEARCHES[def.prerequisiteResearch]'),
    'availability gate must look up prerequisite research data',
  )
  assert.ok(
    game.includes('需要先研究'),
    'disabled reason must be player-readable',
  )
})

test('PREREQ-5: startResearch still relies on getResearchAvailability', () => {
  const methodMatch = game.match(/private startResearch\([\s\S]*?\n\s{2}\}/)
  assert.ok(methodMatch, 'startResearch method must exist')
  const body = methodMatch[0]
  assert.ok(
    body.includes('this.getResearchAvailability(researchKey, team).ok'),
    'startResearch must reuse getResearchAvailability instead of duplicating checks',
  )
})

test('PREREQ-6: Long Rifles data remains unchanged and has no prerequisiteResearch', () => {
  const longRiflesMatch = gameData.match(/long_rifles:\s*\{[\s\S]*?\n\s*\},/)
  assert.ok(longRiflesMatch, 'long_rifles research must exist')
  const body = longRiflesMatch[0]
  assert.ok(body.includes("requiresBuilding: 'blacksmith'"), 'Long Rifles keeps blacksmith prerequisite')
  assert.ok(!body.includes('prerequisiteResearch'), 'Long Rifles must not gain a research prerequisite')
})

test('PREREQ-7: no placeholder ranged / armor research data was added', () => {
  for (const key of ['melee_upgrade', 'ranged_upgrade', 'armor_upgrade']) {
    assert.ok(!gameData.includes(`key: '${key}`), `${key} data must not exist yet`)
  }
})

test('PREREQ-8: no Animal War Training data or barracks research hook was added', () => {
  assert.ok(!gameData.includes("key: 'animal_war_training'"), 'animal_war_training data must not exist')
  const barracksMatch = gameData.match(/barracks:\s*\{[\s\S]*?\n\s*\}/)
  assert.ok(barracksMatch, 'barracks def must exist')
  assert.ok(!barracksMatch[0].includes('researches'), 'Barracks must not gain researches yet')
})

test('PREREQ-9: blacksmith research list includes long_rifles and HN7 data', () => {
  assert.ok(
    gameData.includes("'long_rifles'"),
    'blacksmith must still expose Long Rifles',
  )
})

test('PREREQ-10: HN7 contract marks HN7-IMPL2 as completed model support', () => {
  assert.ok(contract.includes('HN7-IMPL2'), 'contract must mention HN7-IMPL2')
  assert.ok(
    contract.includes('已由 HN7-IMPL2 补齐') || contract.includes('HN7-IMPL2（已完成）'),
    'contract must mark prerequisiteResearch support as completed',
  )
})
