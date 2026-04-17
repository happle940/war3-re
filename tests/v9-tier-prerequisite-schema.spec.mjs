/**
 * V9 HN2 Tier and Prerequisite Schema Boundary Proof
 *
 * Reads current GameData.ts prerequisite/production facts and validates
 * them against known V5–V7 accepted truths. Defines the schema boundary
 * for future Keep/Castle/Knight/caster-training without implementing any
 * new gameplay.
 *
 * Uses text parsing to avoid const enum import issues in Node strip-only mode.
 */
import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const GAME_DATA_PATH = path.join(__dirname, '..', 'src', 'game', 'GameData.ts')
const gameDataText = fs.readFileSync(GAME_DATA_PATH, 'utf8')

// ==================== Helpers ====================

function extractRecordKeys(source, exportName) {
  const body = extractExportBody(source, exportName)
  return [...body.matchAll(/^\s{2}([a-zA-Z0-9_]+):\s*\{/gm)].map((match) => match[1])
}

function extractExportBody(source, exportName) {
  const start = source.indexOf(`export const ${exportName}`)
  assert.ok(start >= 0, `${exportName} export must exist`)
  const bodyStart = source.indexOf('{', start)
  assert.ok(bodyStart >= 0, `${exportName} body must start`)

  let depth = 0
  let bodyEnd = -1
  for (let index = bodyStart; index < source.length; index += 1) {
    const char = source[index]
    if (char === '{') depth += 1
    if (char === '}') depth -= 1
    if (depth === 0) {
      bodyEnd = index
      break
    }
  }

  assert.ok(bodyEnd > bodyStart, `${exportName} body must end`)
  return source.slice(bodyStart + 1, bodyEnd)
}

function extractRecordBody(source, exportName, key) {
  const body = extractExportBody(source, exportName)
  const keyMatch = new RegExp(`^\\s{2}${key}:\\s*\\{`, 'm').exec(body)
  assert.ok(keyMatch, `${exportName}.${key} record must exist`)

  const recordStart = keyMatch.index + keyMatch[0].lastIndexOf('{')
  let depth = 0
  let recordEnd = -1
  for (let index = recordStart; index < body.length; index += 1) {
    const char = body[index]
    if (char === '{') depth += 1
    if (char === '}') depth -= 1
    if (depth === 0) {
      recordEnd = index
      break
    }
  }

  assert.ok(recordEnd > recordStart, `${exportName}.${key} record must end`)
  return body.slice(recordStart + 1, recordEnd)
}

function extractArrayLiteral(source, exportName) {
  const match = source.match(new RegExp(`export const ${exportName}\\s*=\\s*\\[([^\\]]+)\\]`))
  assert.ok(match, `${exportName} array must exist`)
  return [...match[1].matchAll(/'([^']+)'/g)].map((item) => item[1])
}

function assertRecordIncludes(exportName, key, fragment, message) {
  assert.ok(extractRecordBody(gameDataText, exportName, key).includes(fragment), message)
}

function assertRecordExcludes(exportName, key, fragment, message) {
  assert.ok(!extractRecordBody(gameDataText, exportName, key).includes(fragment), message)
}

// ==================== proof-1: prerequisite facts ====================

test('proof-1: current prerequisite facts are readable', () => {
  // Rifleman requires Blacksmith
  assertRecordIncludes('UNITS', 'rifleman', "techPrereq: 'blacksmith'", 'Rifleman must require Blacksmith')

  // Tower requires Lumber Mill
  assertRecordIncludes('BUILDINGS', 'tower', "techPrereq: 'lumber_mill'", 'Tower must require Lumber Mill')

  // Arcane Sanctum requires Barracks
  assertRecordIncludes('BUILDINGS', 'arcane_sanctum', "techPrereq: 'barracks'", 'Arcane Sanctum must require Barracks')

  // Priest requires Arcane Sanctum
  assertRecordIncludes('UNITS', 'priest', "techPrereq: 'arcane_sanctum'", 'Priest must require Arcane Sanctum')

  // Long Rifles requires Blacksmith
  assertRecordIncludes('RESEARCHES', 'long_rifles', "requiresBuilding: 'blacksmith'", 'Long Rifles must require Blacksmith')

  // No prerequisite on footman, worker, mortar_team, barracks, townhall, farm, blacksmith, lumber_mill, workshop
  for (const key of ['footman', 'worker', 'mortar_team']) {
    assertRecordExcludes('UNITS', key, 'techPrereq', `${key} must not gain a unit prerequisite in this schema task`)
  }
  for (const key of ['barracks', 'townhall', 'blacksmith', 'lumber_mill', 'workshop', 'farm']) {
    assertRecordExcludes('BUILDINGS', key, 'techPrereq', `${key} must not gain a building prerequisite in this schema task`)
  }
})

// ==================== proof-2: production facts ====================

test('proof-2: current production facts are readable', () => {
  // Barracks trains Footman + Rifleman
  assertRecordIncludes('BUILDINGS', 'barracks', "trains: ['footman', 'rifleman']", 'Barracks must train footman and rifleman')

  // Workshop trains Mortar Team
  assertRecordIncludes('BUILDINGS', 'workshop', "trains: ['mortar_team']", 'Workshop must train mortar_team')

  // Arcane Sanctum trains Priest
  assertRecordIncludes('BUILDINGS', 'arcane_sanctum', "trains: ['priest']", 'Arcane Sanctum must train priest')

  // Town Hall trains Worker
  assertRecordIncludes('BUILDINGS', 'townhall', "trains: ['worker']", 'Town Hall must train worker')

  // Blacksmith researches Long Rifles
  assertRecordIncludes('BUILDINGS', 'blacksmith', "researches: ['long_rifles']", 'Blacksmith must research long_rifles')

  // PEASANT_BUILD_MENU contains all buildable buildings
  const expectedMenu = ['farm', 'barracks', 'blacksmith', 'lumber_mill', 'tower', 'workshop', 'arcane_sanctum']
  const buildMenu = extractArrayLiteral(gameDataText, 'PEASANT_BUILD_MENU')
  assert.deepEqual(buildMenu, expectedMenu,
    'PEASANT_BUILD_MENU must match expected array')
})

// ==================== proof-3: schema packet exists and defines fields ====================

test('proof-3: schema packet defines future tier/prereq fields', () => {
  const packetPath = path.join(__dirname, '..', 'docs', 'V9_TIER_PREREQUISITE_SCHEMA_PACKET.zh-CN.md')
  assert.ok(fs.existsSync(packetPath), 'schema packet file must exist')

  const packet = fs.readFileSync(packetPath, 'utf8')

  // Must define the new fields needed for Keep/Castle/Knight/caster
  const requiredSections = [
    'techTier',
    'upgradeTo',
    'researchLevel',
    'unitUnlock',
    'buildingUnlock',
  ]
  for (const section of requiredSections) {
    assert.ok(packet.includes(section),
      `schema packet must define ${section}`)
  }

  // Must reference Keep / Castle
  assert.ok(packet.includes('Keep'), 'schema packet must reference Keep')
  assert.ok(packet.includes('Castle'), 'schema packet must reference Castle')
  assert.ok(packet.includes("townhall.upgradeTo = 'keep'"),
    'schema packet must define townhall -> keep as the next upgrade')
  assert.ok(!packet.includes("keep.upgradeTo = 'castle'") &&
            !packet.includes("`upgradeTo: 'castle'`"),
    'schema packet must not instruct HN2-IMPL1 to wire keep -> castle before Castle exists')
  assert.ok(/keep[^]*?不加[^]*?upgradeTo/.test(packet),
    'schema packet must state keep does not get upgradeTo in HN2-IMPL1')

  // Must reference Knight / Sorceress / Spell Breaker as future targets
  assert.ok(packet.includes('Knight'), 'schema packet must reference Knight')
  assert.ok(packet.includes('Sorceress'), 'schema packet must reference Sorceress')
  assert.ok(packet.includes('Spell Breaker'), 'schema packet must reference Spell Breaker')
})

// ==================== proof-4: no new gameplay implemented ====================

test('proof-4: no new gameplay content beyond schema doc', () => {
  // Verify no new unit types beyond the known five
  const knownUnits = ['worker', 'footman', 'rifleman', 'mortar_team', 'priest']
  const actualUnits = extractRecordKeys(gameDataText, 'UNITS')
  assert.deepEqual(actualUnits.sort(), knownUnits.sort(),
    'no new unit types should be added by this task')

  // Verify no new building types beyond the known nine plus the allowed HN2 keep seed.
  const allowedBuildings = ['townhall', 'barracks', 'farm', 'tower', 'goldmine',
                            'blacksmith', 'lumber_mill', 'workshop', 'arcane_sanctum', 'keep']
  const actualBuildings = extractRecordKeys(gameDataText, 'BUILDINGS')
  const unexpectedBuildings = actualBuildings.filter((key) => !allowedBuildings.includes(key))
  assert.deepEqual(unexpectedBuildings, [],
    'no building types beyond current V7 plus the HN2 keep seed are allowed')
  assert.ok(!actualBuildings.includes('castle'),
    'Castle must not be added by the HN2 schema/seed steps')

  // Verify no new researches beyond long_rifles
  const knownResearches = ['long_rifles']
  const actualResearches = extractRecordKeys(gameDataText, 'RESEARCHES')
  assert.deepEqual(actualResearches.sort(), knownResearches.sort(),
    'no new research types should be added by this task')
})

// ==================== proof-5: HN2 remains anchored and does not widen ====================

test('proof-5: schema packet anchors HN2 without widening into HN3 or full tech tree', () => {
  const packetPath = path.join(__dirname, '..', 'docs', 'V9_TIER_PREREQUISITE_SCHEMA_PACKET.zh-CN.md')
  const packet = fs.readFileSync(packetPath, 'utf8')

  // Must reference HN2-IMPL1
  assert.ok(packet.includes('HN2-IMPL1'), 'schema packet must reference HN2-IMPL1')

  // Must not reassign Keep to HN3
  assert.ok(!packet.includes('HN3 — Keep') && !packet.includes('HN3: Keep'),
    'schema packet must not reuse HN3 for Keep; HN3 is reserved for ability numeric model seed')

  // Must NOT propose full tech tree or multiple branches at once
  const forbidden = ['完整科技树', '所有英雄', '全量实现', '全科技树']
  for (const phrase of forbidden) {
    assert.ok(!packet.includes(phrase),
      `schema packet must not propose "${phrase}"`)
  }
})
