/**
 * V9 HN2-IMPL1 Keep Tier Data Seed Proof
 *
 * Proves that BuildingDef supports techTier/upgradeTo, townhall is T1 with
 * upgradeTo='keep', keep exists as T2 seed without upgradeTo, and no Castle
 * or other new content is introduced.
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

function extractRecordKeys(source, exportName) {
  const body = extractExportBody(source, exportName)
  return [...body.matchAll(/^\s{2}([a-zA-Z0-9_]+):\s*\{/gm)].map((match) => match[1])
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

// ==================== proof-1: BuildingDef has techTier and upgradeTo ====================

test('proof-1: BuildingDef has techTier and upgradeTo fields', () => {
  // Extract BuildingDef interface body using brace-depth matching
  const defStart = gameDataText.indexOf('export interface BuildingDef')
  assert.ok(defStart >= 0, 'BuildingDef interface must exist')

  const bodyStart = gameDataText.indexOf('{', defStart)
  assert.ok(bodyStart >= 0, 'BuildingDef interface body must start')

  let depth = 0
  let bodyEnd = -1
  for (let index = bodyStart; index < gameDataText.length; index += 1) {
    const char = gameDataText[index]
    if (char === '{') depth += 1
    if (char === '}') depth -= 1
    if (depth === 0) {
      bodyEnd = index
      break
    }
  }
  assert.ok(bodyEnd > bodyStart, 'BuildingDef interface body must end')

  const defBody = gameDataText.substring(bodyStart + 1, bodyEnd)
  assert.ok(/techTier\?:\s*1\s*\|\s*2\s*\|\s*3/.test(defBody),
    'BuildingDef must have techTier?: 1 | 2 | 3')
  assert.ok(/upgradeTo\?:\s*string/.test(defBody),
    'BuildingDef must have upgradeTo?: string')
})

// ==================== proof-2: townhall is T1, upgradeTo keep, trains worker ====================

test('proof-2: townhall has techTier 1, upgradeTo keep, still trains worker', () => {
  assertRecordIncludes('BUILDINGS', 'townhall', 'techTier: 1',
    'townhall must have techTier: 1')
  assertRecordIncludes('BUILDINGS', 'townhall', "upgradeTo: 'keep'",
    'townhall must have upgradeTo: keep')
  assertRecordIncludes('BUILDINGS', 'townhall', "trains: ['worker']",
    'townhall must still train worker')
})

// ==================== proof-3: keep exists, T2, no upgradeTo ====================

test('proof-3: keep exists as T2 seed without upgradeTo', () => {
  const buildingKeys = extractRecordKeys(gameDataText, 'BUILDINGS')
  assert.ok(buildingKeys.includes('keep'), 'BUILDINGS must include keep')

  assertRecordIncludes('BUILDINGS', 'keep', 'techTier: 2',
    'keep must have techTier: 2')
  assertRecordIncludes('BUILDINGS', 'keep', "key: 'keep'",
    'keep must have key: keep')

  // keep must NOT have upgradeTo
  assertRecordExcludes('BUILDINGS', 'keep', 'upgradeTo',
    'keep must not have upgradeTo (Castle is not implemented)')

  // keep trains worker (HN2-IMPL3 post-upgrade command surface)
  assertRecordIncludes('BUILDINGS', 'keep', "trains: ['worker']",
    'keep must train worker for post-upgrade command surface')

  // keep must NOT have researches, unitUnlock, buildingUnlock
  assertRecordExcludes('BUILDINGS', 'keep', 'researches',
    'keep must not have researches in this seed')
  assertRecordExcludes('BUILDINGS', 'keep', 'unitUnlock',
    'keep must not have unitUnlock in this seed')
  assertRecordExcludes('BUILDINGS', 'keep', 'buildingUnlock',
    'keep must not have buildingUnlock in this seed')
})

// ==================== proof-4: no castle, no new units/researches ====================

test('proof-4: no castle, UNITS unchanged, RESEARCHES unchanged', () => {
  const buildingKeys = extractRecordKeys(gameDataText, 'BUILDINGS')
  assert.ok(!buildingKeys.includes('castle'), 'Castle must not exist in BUILDINGS')

  const unitKeys = extractRecordKeys(gameDataText, 'UNITS')
  assert.deepEqual(unitKeys.sort(), ['worker', 'footman', 'rifleman', 'mortar_team', 'priest'].sort(),
    'UNITS must be unchanged')

  const researchKeys = extractRecordKeys(gameDataText, 'RESEARCHES')
  assert.deepEqual(researchKeys, ['long_rifles'],
    'RESEARCHES must be unchanged')
})

// ==================== proof-5: PEASANT_BUILD_MENU excludes keep ====================

test('proof-5: PEASANT_BUILD_MENU does not include keep', () => {
  const buildMenu = extractArrayLiteral(gameDataText, 'PEASANT_BUILD_MENU')
  assert.ok(!buildMenu.includes('keep'),
    'PEASANT_BUILD_MENU must not include keep')

  // Verify original entries unchanged
  assert.deepEqual(buildMenu,
    ['farm', 'barracks', 'blacksmith', 'lumber_mill', 'tower', 'workshop', 'arcane_sanctum'],
    'PEASANT_BUILD_MENU must be unchanged')
})

// ==================== proof-6: V5-V7 prerequisite facts not regressed ====================

test('proof-6: V5-V7 prerequisite facts not regressed', () => {
  // Rifleman -> Blacksmith
  assertRecordIncludes('UNITS', 'rifleman', "techPrereq: 'blacksmith'",
    'Rifleman must still require Blacksmith')
  // Tower -> Lumber Mill
  assertRecordIncludes('BUILDINGS', 'tower', "techPrereq: 'lumber_mill'",
    'Tower must still require Lumber Mill')
  // Arcane Sanctum -> Barracks
  assertRecordIncludes('BUILDINGS', 'arcane_sanctum', "techPrereq: 'barracks'",
    'Arcane Sanctum must still require Barracks')
  // Priest -> Arcane Sanctum
  assertRecordIncludes('UNITS', 'priest', "techPrereq: 'arcane_sanctum'",
    'Priest must still require Arcane Sanctum')
  // Long Rifles -> Blacksmith
  assertRecordIncludes('RESEARCHES', 'long_rifles', "requiresBuilding: 'blacksmith'",
    'Long Rifles must still require Blacksmith')
  // Barracks trains unchanged
  assertRecordIncludes('BUILDINGS', 'barracks', "trains: ['footman', 'rifleman']",
    'Barracks must still train footman and rifleman')
})

// ==================== proof-7: no Castle implementation hint ====================

test('proof-7: no keep.upgradeTo=castle or Castle implementation hint', () => {
  const keepBody = extractRecordBody(gameDataText, 'BUILDINGS', 'keep')
  assert.ok(!keepBody.includes("upgradeTo: 'castle'"),
    'keep must not have upgradeTo pointing to castle')
  assert.ok(!keepBody.includes('castle'),
    'keep record must not reference castle at all')
})
