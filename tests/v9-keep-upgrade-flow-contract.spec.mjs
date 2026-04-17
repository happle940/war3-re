/**
 * V9 Keep Upgrade Flow Contract Draft Proof
 *
 * Guards the next adjacent task after the Keep data seed:
 * Town Hall may later upgrade to Keep, but this must not open Castle,
 * Knights, full tech tree, assets, or AI strategy work.
 */
import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const CONTRACT_PATH = path.join(__dirname, '..', 'docs', 'V9_KEEP_UPGRADE_FLOW_CONTRACT_DRAFT.zh-CN.md')
const GAME_DATA_PATH = path.join(__dirname, '..', 'src', 'game', 'GameData.ts')
const GAME_COMMAND_PATH = path.join(__dirname, '..', 'src', 'game', 'GameCommand.ts')
const GAME_TS_PATH = path.join(__dirname, '..', 'src', 'game', 'Game.ts')
const contractText = fs.readFileSync(CONTRACT_PATH, 'utf8')
const gameDataText = fs.readFileSync(GAME_DATA_PATH, 'utf8')
const gameCommandText = fs.readFileSync(GAME_COMMAND_PATH, 'utf8')
const gameText = fs.readFileSync(GAME_TS_PATH, 'utf8')

function extractBraceBlock(text, startPattern) {
  const match = startPattern.exec(text)
  assert.ok(match, `start pattern must exist: ${startPattern}`)
  const bodyStart = text.indexOf('{', match.index)
  assert.ok(bodyStart >= 0, 'brace block must start')
  let depth = 0
  for (let index = bodyStart; index < text.length; index += 1) {
    const char = text[index]
    if (char === '{') depth += 1
    if (char === '}') depth -= 1
    if (depth === 0) return text.slice(bodyStart, index + 1)
  }
  assert.fail(`brace block never ended: ${startPattern}`)
}

function extractArrayLiteral(text, startPattern) {
  const match = startPattern.exec(text)
  assert.ok(match, `array pattern must exist: ${startPattern}`)
  const start = text.indexOf('[', match.index)
  const end = text.indexOf(']', start)
  assert.ok(start >= 0 && end > start, 'array literal must exist')
  return text.slice(start, end + 1)
}

test('proof-1: upgrade flow draft waits for Task120 Codex acceptance', () => {
  assert.ok(contractText.includes('Task 120'), 'draft must name Task120 as prerequisite')
  assert.ok(/Codex accepted/.test(contractText), 'draft must require Codex accepted, not worker completed')
  assert.ok(contractText.includes("BUILDINGS.townhall.upgradeTo === 'keep'"),
    'draft must depend on townhall -> keep seed')
  assert.ok(contractText.includes('BUILDINGS.keep.techTier === 2'),
    'draft must depend on keep techTier seed')
})

test('proof-2: draft scopes exactly Town Hall to Keep upgrade flow', () => {
  assert.ok(contractText.includes('HN2-IMPL2'), 'draft must name the next adjacent slice')
  assert.ok(contractText.includes('Town Hall to Keep upgrade flow'),
    'draft must scope the next slice to Town Hall -> Keep')
  assert.ok(contractText.includes('升级主城'), 'draft must include a player-visible upgrade action')
  assert.ok(contractText.includes('资源不足'), 'draft must require resource-gated disabled state')
  assert.ok(contractText.includes('type') && contractText.includes('keep'),
    'draft must require the building type to become keep')
})

test('proof-3: draft allows only narrow runtime files and proof', () => {
  assert.ok(contractText.includes('GameCommand'), 'draft may allow a narrow command')
  assert.ok(contractText.includes('Game.ts'), 'draft may allow command-card/update-loop wiring')
  assert.ok(contractText.includes('focused runtime proof'), 'draft must require focused runtime proof')
  assert.ok(contractText.includes('tests/v9-keep-upgrade-flow-regression.spec.ts'),
    'draft must name the future runtime proof')
})

test('proof-4: draft forbids Castle, new units, full unlocks, AI dependency, and assets', () => {
  const forbiddenSection = contractText.slice(
    contractText.indexOf('不允许做什么'),
    contractText.indexOf('验收证据'),
  )
  for (const phrase of [
    '不实现 `castle`',
    '不让 `keep.upgradeTo` 指向 `castle`',
    'Knight',
    'Sorceress',
    'Spell Breaker',
    '不把 `keep` 加入 `PEASANT_BUILD_MENU`',
    'unitUnlock',
    'buildingUnlock',
    'researchLevel',
    '不改 AI 策略',
    '不导入或替换素材',
  ]) {
    assert.ok(forbiddenSection.includes(phrase), `draft must forbid ${phrase}`)
  }
})

test('proof-5: draft preserves adjacent-task boundary language', () => {
  assert.ok(contractText.includes('相邻点'), 'draft must describe this as adjacent work')
  assert.ok(contractText.includes('不是 Castle / Knight / 完整科技树入口'),
    'draft must explicitly reject widening into the full tech tree')
  assert.ok(contractText.includes('不能在数据 seed 未验收前派发'),
    'draft must not be dispatchable before Task120 acceptance')
})

test('proof-6: current data keeps the upgrade adjacency at townhall -> keep only', () => {
  const townhallBlock = extractBraceBlock(gameDataText, /\btownhall:\s*{/)
  const keepBlock = extractBraceBlock(gameDataText, /\bkeep:\s*{/)
  const peasantMenu = extractArrayLiteral(gameDataText, /PEASANT_BUILD_MENU\s*=/)

  assert.ok(/techTier:\s*1/.test(townhallBlock), 'townhall must remain techTier 1')
  assert.ok(/upgradeTo:\s*'keep'/.test(townhallBlock), 'townhall must be the only seed pointing at keep')
  assert.ok(/techTier:\s*2/.test(keepBlock), 'keep must remain the T2 seed')
  assert.ok(!/upgradeTo\s*:/.test(keepBlock), 'keep must not point at castle yet')
  assert.ok(!/\bcastle\s*:/.test(gameDataText), 'BUILDINGS must not define castle in this slice')
  assert.ok(!peasantMenu.includes("'keep'") && !peasantMenu.includes('"keep"'),
    'workers must not build keep directly')
})

test('proof-7: explicit upgrade command stays separate from train and research queues', () => {
  assert.ok(gameCommandText.includes("type: 'upgradeBuilding'"),
    'GameCommand must expose a dedicated upgradeBuilding command')
  assert.ok(/upgradeBuilding'[^|]+building:\s*Unit[^|]+targetKey:\s*string[^|]+upgradeTime:\s*number/s.test(gameCommandText),
    'upgradeBuilding command must carry building, target key, and upgrade time')

  const upgradeCase = gameCommandText.slice(
    gameCommandText.indexOf("case 'upgradeBuilding'"),
    gameCommandText.indexOf('break', gameCommandText.indexOf("case 'upgradeBuilding'")),
  )
  assert.ok(upgradeCase.includes('upgradeQueue'), 'upgradeBuilding must write upgradeQueue')
  assert.ok(!upgradeCase.includes('trainingQueue'), 'upgradeBuilding must not fake a train command')
  assert.ok(!upgradeCase.includes('researchQueue'), 'upgradeBuilding must not fake a research command')
})

test('proof-8: runtime upgrade path follows the current building upgradeTo edge only', () => {
  const startUpgrade = extractBraceBlock(gameText, /private\s+startBuildingUpgrade\s*\(/)
  assert.ok(startUpgrade.includes('BUILDINGS[building.type]'),
    'startBuildingUpgrade must read the selected building definition')
  assert.ok(startUpgrade.includes('currentDef?.upgradeTo !== targetKey'),
    'startBuildingUpgrade must reject arbitrary upgrade targets')
  assert.ok(startUpgrade.includes('BUILDINGS[targetKey]'),
    'startBuildingUpgrade must read the target building data')
  assert.ok(startUpgrade.includes('this.resources.spend(team, targetDef.cost)'),
    'startBuildingUpgrade must spend the target building cost for the owning team')
})
