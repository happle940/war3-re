/**
 * V9 HN2-NUM12 T2 numeric ledger alignment proof.
 *
 * Static proof only: reads GameData.ts and the ledger docs as text.
 * This avoids importing TypeScript/const-enum runtime code from Node.
 */
import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT_DIR = path.join(__dirname, '..')
const GAME_DATA_PATH = path.join(ROOT_DIR, 'src', 'game', 'GameData.ts')
const LEDGER_PATH = path.join(ROOT_DIR, 'docs', 'V6_HUMAN_NUMERIC_LEDGER.zh-CN.md')
const PARITY_PATH = path.join(ROOT_DIR, 'docs', 'HUMAN_RACE_PARITY_AND_NUMERIC_SYSTEM.zh-CN.md')

const gameDataText = fs.readFileSync(GAME_DATA_PATH, 'utf8').replaceAll('\r\n', '\n')
const ledgerText = fs.readFileSync(LEDGER_PATH, 'utf8').replaceAll('\r\n', '\n')
const parityText = fs.readFileSync(PARITY_PATH, 'utf8').replaceAll('\r\n', '\n')

function extractExportBody(source, exportName) {
  const start = source.indexOf(`export const ${exportName}`)
  assert.ok(start >= 0, `${exportName} export must exist`)
  const bodyStart = source.indexOf('{', start)
  assert.ok(bodyStart >= 0, `${exportName} body must start`)

  let depth = 0
  for (let index = bodyStart; index < source.length; index += 1) {
    if (source[index] === '{') depth += 1
    if (source[index] === '}') depth -= 1
    if (depth === 0) return source.slice(bodyStart + 1, index)
  }

  assert.fail(`${exportName} body must end`)
}

function extractRecordBody(source, exportName, key) {
  const body = extractExportBody(source, exportName)
  const keyMatch = new RegExp(`^\\s{2}${key}:\\s*\\{`, 'm').exec(body)
  assert.ok(keyMatch, `${exportName}.${key} must exist`)

  const recordStart = keyMatch.index + keyMatch[0].lastIndexOf('{')
  let depth = 0
  for (let index = recordStart; index < body.length; index += 1) {
    if (body[index] === '{') depth += 1
    if (body[index] === '}') depth -= 1
    if (depth === 0) return body.slice(recordStart + 1, index)
  }

  assert.fail(`${exportName}.${key} body must end`)
}

function extractRecordKeys(source, exportName) {
  return [...extractExportBody(source, exportName).matchAll(/^\s{2}([a-zA-Z0-9_]+):\s*\{/gm)].map((match) => match[1])
}

function extractArrayLiteral(source, exportName) {
  const match = source.match(new RegExp(`export const ${exportName}\\s*=\\s*\\[([^\\]]+)\\]`))
  assert.ok(match, `${exportName} array must exist`)
  return [...match[1].matchAll(/'([^']+)'/g)].map((item) => item[1])
}

function numberField(recordBody, field) {
  const match = recordBody.match(new RegExp(`${field}:\\s*([0-9.]+)`))
  assert.ok(match, `${field} must exist in record body`)
  return Number(match[1])
}

function costFields(recordBody) {
  const match = recordBody.match(/cost:\s*\{\s*gold:\s*([0-9.]+),\s*lumber:\s*([0-9.]+)\s*\}/)
  assert.ok(match, 'cost must exist in record body')
  return { gold: Number(match[1]), lumber: Number(match[2]) }
}

function stringArrayField(recordBody, field) {
  const match = recordBody.match(new RegExp(`${field}:\\s*\\[([^\\]]+)\\]`))
  assert.ok(match, `${field} array must exist in record body`)
  return [...match[1].matchAll(/'([^']+)'/g)].map((item) => item[1])
}

function optionalStringField(recordBody, field) {
  return recordBody.match(new RegExp(`${field}:\\s*'([^']+)'`))?.[1] ?? ''
}

function findLedgerRow(label) {
  const row = ledgerText.split('\n').find((line) => line.trim().startsWith('|') && line.includes(label))
  assert.ok(row, `ledger row must exist for ${label}`)
  return row
}

function assertRowIncludes(row, fragments) {
  for (const fragment of fragments) {
    assert.ok(row.includes(fragment), `row must include "${fragment}": ${row}`)
  }
}

function expectedCostFragment(body) {
  const cost = costFields(body)
  return `gold ${cost.gold} / lumber ${cost.lumber}`
}

function expectedSupplyFragment(kind, body) {
  const supply = numberField(body, 'supply')
  return kind === 'building' ? `provides ${supply}` : `uses ${supply}`
}

function expectedAttackFragment(body) {
  return `damage ${numberField(body, 'attackDamage')} / cooldown ${numberField(body, 'attackCooldown')}`
}

test('proof-1: Keep ledger row matches GameData.ts', () => {
  const keep = extractRecordBody(gameDataText, 'BUILDINGS', 'keep')
  const row = findLedgerRow('Keep / keep')

  assertRowIncludes(row, [
    expectedCostFragment(keep),
    expectedSupplyFragment('building', keep),
    `${numberField(keep, 'hp')}`,
    `${numberField(keep, 'buildTime')}s`,
    `techTier: ${numberField(keep, 'techTier')}`,
    "upgradeTo` 不存在",
    'trains worker',
  ])
  assert.equal(optionalStringField(keep, 'upgradeTo'), '', 'Keep must not upgrade to Castle yet')
  assert.deepEqual(stringArrayField(keep, 'trains'), ['worker'])
})

test('proof-2: Workshop and Arcane Sanctum ledger rows match GameData.ts', () => {
  const buildingCases = [
    ['workshop', 'Workshop / workshop', 'mortar_team'],
    ['arcane_sanctum', 'Arcane Sanctum / arcane_sanctum', 'priest'],
  ]

  for (const [key, label, trainedUnit] of buildingCases) {
    const body = extractRecordBody(gameDataText, 'BUILDINGS', key)
    const row = findLedgerRow(label)

    assertRowIncludes(row, [
      expectedCostFragment(body),
      expectedSupplyFragment('building', body),
      `${numberField(body, 'hp')}`,
      `${numberField(body, 'buildTime')}s`,
      `techPrereq: ${optionalStringField(body, 'techPrereq')}`,
      `trains ${trainedUnit === 'mortar_team' ? 'Mortar Team' : 'Priest'}`,
    ])
    assert.equal(optionalStringField(body, 'techPrereq'), 'keep', `${key} must be Keep-gated`)
    assert.ok(stringArrayField(body, 'trains').includes(trainedUnit), `${key} must train ${trainedUnit}`)
  }
})

test('proof-3: Mortar Team and Priest ledger rows match GameData.ts', () => {
  const unitCases = [
    ['mortar_team', 'Mortar Team / mortar_team', 'attackType: Siege', 'armorType: Unarmored', 'Workshop trains'],
    ['priest', 'Priest / priest', 'attackType: Normal', 'armorType: Unarmored', 'Arcane Sanctum trains'],
  ]

  for (const [key, label, attackTypeFragment, armorTypeFragment, prereqFragment] of unitCases) {
    const body = extractRecordBody(gameDataText, 'UNITS', key)
    const row = findLedgerRow(label)

    assertRowIncludes(row, [
      expectedCostFragment(body),
      expectedSupplyFragment('unit', body),
      `${numberField(body, 'hp')}`,
      expectedAttackFragment(body),
      `${numberField(body, 'attackRange')}`,
      `${numberField(body, 'trainTime')}s`,
      prereqFragment,
      attackTypeFragment,
      armorTypeFragment,
    ])
  }

  const priest = extractRecordBody(gameDataText, 'UNITS', 'priest')
  assert.equal(optionalStringField(priest, 'techPrereq'), 'arcane_sanctum')
  assert.ok(ledgerText.includes('mana/maxMana/manaRegen/healCooldownUntil'), 'Priest ledger must name caster fields')
})

test('proof-4: T2 build menu and current limitations are both documented', () => {
  const buildMenu = extractArrayLiteral(gameDataText, 'PEASANT_BUILD_MENU')
  assert.ok(buildMenu.includes('workshop'), 'PEASANT_BUILD_MENU must include workshop')
  assert.ok(buildMenu.includes('arcane_sanctum'), 'PEASANT_BUILD_MENU must include arcane_sanctum')

  const buildingKeys = extractRecordKeys(gameDataText, 'BUILDINGS')
  const unitKeys = extractRecordKeys(gameDataText, 'UNITS')

  assert.ok(!buildingKeys.includes('castle'), 'Castle must not exist yet')
  assert.ok(!buildingKeys.includes('gryphon_aviary'), 'Gryphon Aviary must not exist yet')
  for (const missingUnit of ['knight', 'sorceress', 'spell_breaker', 'flying_machine', 'siege_engine', 'gryphon_rider']) {
    assert.ok(!unitKeys.includes(missingUnit), `${missingUnit} must not exist yet`)
  }

  for (const documentedGap of [
    'Castle',
    'Knight',
    'Sorceress',
    'Spell Breaker',
    'Flying Machine',
    'Siege Engine',
    'Gryphon Aviary',
    '英雄',
    '物品/商店',
    '当前二本是 War3 Human T2 的最小可行切片，不是完整二本',
  ]) {
    assert.ok(ledgerText.includes(documentedGap), `ledger must document current gap: ${documentedGap}`)
  }
})

test('proof-5: parity contract has a V9 row that says T2 is aligned but incomplete', () => {
  const row = parityText.split('\n').find((line) => line.trim().startsWith('| V9 |'))
  assert.ok(row, 'parity contract must include a V9 row')
  assertRowIncludes(row, [
    'Keep 升级 + T2 最小切片',
    'Workshop / Arcane Sanctum',
    'Mortar Team / Priest',
    '数值账本已同步',
    'T2 数值已对齐 GameData.ts',
    'Castle / Knight',
    '完整法师/工程/空军/英雄仍缺失',
  ])
})
