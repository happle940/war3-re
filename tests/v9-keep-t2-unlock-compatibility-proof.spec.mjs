/**
 * V9 Keep / T2 Unlock Compatibility Proof
 *
 * Post-migration proof: verifies the real production data has been migrated
 * and V7 content remains reachable through Keep-gated buildings.
 *
 * Does not launch browser. Only reads GameData.ts text.
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
    if (depth === 0) { bodyEnd = index; break }
  }
  assert.ok(bodyEnd > bodyStart, `${exportName} body must end`)
  return source.slice(bodyStart + 1, bodyEnd)
}

function extractRecordKeys(source, exportName) {
  const body = extractExportBody(source, exportName)
  return [...body.matchAll(/^\s{2}([a-zA-Z0-9_]+):\s*\{/gm)].map(m => m[1])
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
    if (depth === 0) { recordEnd = index; break }
  }
  assert.ok(recordEnd > recordStart, `${exportName}.${key} record must end`)
  return body.slice(recordStart + 1, recordEnd)
}

function extractArrayLiteral(source, exportName) {
  const match = source.match(new RegExp(`export const ${exportName}\\s*=\\s*\\[([^\\]]+)\\]`))
  assert.ok(match, `${exportName} array must exist`)
  return [...match[1].matchAll(/'([^']+)'/g)].map(item => item[1])
}

// ==================== Proofs ====================

test('proof-1: PEASANT_BUILD_MENU contains workshop and arcane_sanctum', () => {
  const menu = extractArrayLiteral(gameDataText, 'PEASANT_BUILD_MENU')
  assert.ok(menu.includes('workshop'), 'PEASANT_BUILD_MENU must contain workshop')
  assert.ok(menu.includes('arcane_sanctum'), 'PEASANT_BUILD_MENU must contain arcane_sanctum')
})

test('proof-2: workshop.techPrereq is now keep', () => {
  const workshopBody = extractRecordBody(gameDataText, 'BUILDINGS', 'workshop')
  assert.ok(workshopBody.includes("techPrereq: 'keep'"),
    'workshop.techPrereq must be keep after migration')
})

test('proof-3: arcane_sanctum.techPrereq is now keep', () => {
  const sanctumBody = extractRecordBody(gameDataText, 'BUILDINGS', 'arcane_sanctum')
  assert.ok(sanctumBody.includes("techPrereq: 'keep'"),
    'arcane_sanctum.techPrereq must be keep after migration')
})

test('proof-4: keep exists, techTier 2, trains worker, no upgradeTo', () => {
  const buildingKeys = extractRecordKeys(gameDataText, 'BUILDINGS')
  assert.ok(buildingKeys.includes('keep'), 'BUILDINGS must include keep')

  const keepBody = extractRecordBody(gameDataText, 'BUILDINGS', 'keep')
  assert.ok(keepBody.includes('techTier: 2'), 'keep must have techTier: 2')
  assert.ok(keepBody.includes("trains: ['worker']"), 'keep must train worker')
  assert.ok(!keepBody.includes('upgradeTo'), 'keep must not have upgradeTo')
})

test('proof-5: castle does not exist', () => {
  const buildingKeys = extractRecordKeys(gameDataText, 'BUILDINGS')
  assert.ok(!buildingKeys.includes('castle'), 'BUILDINGS must not include castle')
})

test('proof-6: V7 content data tables still intact — mortar, priest, heal constants', () => {
  // Workshop still trains mortar_team
  const workshopBody = extractRecordBody(gameDataText, 'BUILDINGS', 'workshop')
  assert.ok(workshopBody.includes("trains: ['mortar_team']"),
    'workshop must still train mortar_team')

  // Arcane Sanctum still trains priest
  const sanctumBody = extractRecordBody(gameDataText, 'BUILDINGS', 'arcane_sanctum')
  assert.ok(sanctumBody.includes("trains: ['priest']"),
    'arcane_sanctum must still train priest')

  // Mortar team still has siege attack type
  const mortarBody = extractRecordBody(gameDataText, 'UNITS', 'mortar_team')
  assert.ok(mortarBody.includes('AttackType.Siege'), 'mortar_team must still be Siege')

  // Priest still references arcane_sanctum
  const priestBody = extractRecordBody(gameDataText, 'UNITS', 'priest')
  assert.ok(priestBody.includes("techPrereq: 'arcane_sanctum'"),
    'priest must still require arcane_sanctum')

  // Heal constants still exist
  assert.ok(gameDataText.includes('PRIEST_HEAL_AMOUNT'), 'PRIEST_HEAL_AMOUNT must exist')
  assert.ok(gameDataText.includes('PRIEST_HEAL_MANA_COST'), 'PRIEST_HEAL_MANA_COST must exist')
  assert.ok(gameDataText.includes('PRIEST_HEAL_COOLDOWN'), 'PRIEST_HEAL_COOLDOWN must exist')
})
