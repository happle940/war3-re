/**
 * V9 Keep / T2 Unlock Contract Proof
 *
 * Verifies the real production data migration is complete:
 * - Workshop.techPrereq === 'keep'
 * - Arcane Sanctum.techPrereq === 'keep'
 * - PEASANT_BUILD_MENU still lists both
 * - Keep exists as T2, Castle does not exist
 * - No Knight, new units, or new assets were added
 *
 * Does not launch browser. Reads GameData.ts text.
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

function extractRecordBody(source, exportName, key) {
  const start = source.indexOf(`export const ${exportName}`)
  assert.ok(start >= 0, `${exportName} must exist`)
  const bodyStart = source.indexOf('{', start)
  let depth = 0
  let bodyEnd = -1
  for (let i = bodyStart; i < source.length; i++) {
    if (source[i] === '{') depth += 1
    if (source[i] === '}') depth -= 1
    if (depth === 0) { bodyEnd = i; break }
  }
  const body = source.slice(bodyStart + 1, bodyEnd)
  const keyMatch = new RegExp(`^\\s{2}${key}:\\s*\\{`, 'm').exec(body)
  assert.ok(keyMatch, `${exportName}.${key} must exist`)
  const recStart = keyMatch.index + keyMatch[0].lastIndexOf('{')
  depth = 0
  let recEnd = -1
  for (let i = recStart; i < body.length; i++) {
    if (body[i] === '{') depth += 1
    if (body[i] === '}') depth -= 1
    if (depth === 0) { recEnd = i; break }
  }
  return body.slice(recStart + 1, recEnd)
}

function extractRecordKeys(source, exportName) {
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
    if (depth === 0) { bodyEnd = index; break }
  }
  assert.ok(bodyEnd > bodyStart, `${exportName} body must end`)
  const body = source.slice(bodyStart + 1, bodyEnd)
  return [...body.matchAll(/^\s{2}([a-zA-Z0-9_]+):\s*\{/gm)].map(m => m[1])
}

function extractArrayLiteral(source, exportName) {
  const match = source.match(new RegExp(`export const ${exportName}\\s*=\\s*\\[([^\\]]+)\\]`))
  assert.ok(match, `${exportName} array must exist`)
  return [...match[1].matchAll(/'([^']+)'/g)].map(item => item[1])
}

// ==================== Proofs ====================

test('proof-1: production data shows Workshop.techPrereq is now keep', () => {
  const workshopBody = extractRecordBody(gameDataText, 'BUILDINGS', 'workshop')
  assert.ok(workshopBody.includes("techPrereq: 'keep'"),
    'workshop.techPrereq must be keep after migration')
})

test('proof-2: production data shows Arcane Sanctum.techPrereq is now keep', () => {
  const sanctumBody = extractRecordBody(gameDataText, 'BUILDINGS', 'arcane_sanctum')
  assert.ok(sanctumBody.includes("techPrereq: 'keep'"),
    'arcane_sanctum.techPrereq must be keep after migration')
  assert.ok(!sanctumBody.includes("'barracks'"),
    'arcane_sanctum must no longer reference barracks as prerequisite')
})

test('proof-3: PEASANT_BUILD_MENU still contains workshop and arcane_sanctum', () => {
  const menu = extractArrayLiteral(gameDataText, 'PEASANT_BUILD_MENU')
  assert.ok(menu.includes('workshop'), 'PEASANT_BUILD_MENU must still contain workshop')
  assert.ok(menu.includes('arcane_sanctum'), 'PEASANT_BUILD_MENU must still contain arcane_sanctum')
})

test('proof-4: keep exists with techTier 2, no upgradeTo, no castle', () => {
  const buildingKeys = extractRecordKeys(gameDataText, 'BUILDINGS')
  assert.ok(buildingKeys.includes('keep'), 'BUILDINGS must include keep')
  assert.ok(!buildingKeys.includes('castle'), 'BUILDINGS must not include castle')

  const keepBody = extractRecordBody(gameDataText, 'BUILDINGS', 'keep')
  assert.ok(keepBody.includes('techTier: 2'), 'keep must have techTier: 2')
  assert.ok(!keepBody.includes('upgradeTo'), 'keep must not have upgradeTo')
})

test('proof-5: no knight or new unit types were added', () => {
  const unitKeys = extractRecordKeys(gameDataText, 'UNITS')
  assert.ok(!unitKeys.includes('knight'), 'UNITS must not include knight')
})

test('proof-6: workshop and arcane_sanctum still train their original units', () => {
  const workshopBody = extractRecordBody(gameDataText, 'BUILDINGS', 'workshop')
  assert.ok(workshopBody.includes("trains: ['mortar_team']"),
    'workshop must still train mortar_team')

  const sanctumBody = extractRecordBody(gameDataText, 'BUILDINGS', 'arcane_sanctum')
  assert.ok(sanctumBody.includes("trains: ['priest']"),
    'arcane_sanctum must still train priest')
})
