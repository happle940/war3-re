/**
 * V9 HERO14-DATA1 Paladin Resurrection data-seed static proof.
 *
 * Proves:
 *   1. GameData.ts carries the Resurrection data seed from Task246 source mapping.
 *   2. Data fields remain the source of truth after IMPL1C runtime wiring and UX1 feedback.
 *   3. Contract/source proofs are stage-aware after DATA1/IMPL1C/UX1.
 *   4. No ABILITIES entry, AI, or assets are added.
 */
import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(__dirname, '..')

function read(relativePath) {
  const p = resolve(ROOT, relativePath)
  assert.ok(existsSync(p), `file missing: ${relativePath}`)
  return readFileSync(p, 'utf-8')
}

function resurrectionBlock(gameData) {
  const match = gameData.match(/resurrection:\s*{\s*maxLevel:\s*1,\s*levels:\s*\[\s*{([^}]*)}/m)
  assert.ok(match, 'missing HERO_ABILITY_LEVELS.resurrection block')
  return match[1]
}

function abilitiesSection(gameData) {
  const start = gameData.indexOf('export const ABILITIES')
  assert.ok(start >= 0, 'missing ABILITIES section')
  const end = gameData.indexOf('// ===== 英雄复活规则', start)
  assert.ok(end > start, 'missing ABILITIES section end')
  return gameData.slice(start, end)
}

describe('HERO14-DATA1 Resurrection data seed', () => {
  const dataDoc = read('docs/V9_HERO14_RESURRECTION_DATA_SEED.zh-CN.md')
  const sourceDoc = read('docs/V9_HERO14_RESURRECTION_SOURCE_BOUNDARY.zh-CN.md')
  const gameData = read('src/game/GameData.ts')
  const block = resurrectionBlock(gameData)

  it('DATA14-1: references accepted contract and source-boundary predecessors', () => {
    assert.ok(dataDoc.includes('Task245') && dataDoc.includes('HERO14-CONTRACT1'), 'missing Task245 predecessor')
    assert.ok(dataDoc.includes('Task246') && dataDoc.includes('HERO14-SRC1'), 'missing Task246 predecessor')
  })

  it('DATA14-2: HeroAbilityLevelDef adds areaRadius and maxTargets optional fields', () => {
    assert.ok(gameData.includes('areaRadius?: number'), 'missing areaRadius optional field')
    assert.ok(gameData.includes('maxTargets?: number'), 'missing maxTargets optional field')
  })

  it('DATA14-3: HERO_ABILITY_LEVELS.resurrection exists with maxLevel 1', () => {
    assert.ok(/resurrection:\s*{\s*maxLevel:\s*1/.test(gameData), 'missing maxLevel 1')
  })

  it('DATA14-4: resurrection level is level 1 and requires hero level 6', () => {
    assert.ok(block.includes('level: 1'), 'missing level 1')
    assert.ok(block.includes('requiredHeroLevel: 6'), 'missing requiredHeroLevel 6')
  })

  it('DATA14-5: resurrection mana uses primary source value 200, not secondary 150', () => {
    assert.ok(block.includes('mana: 200'), 'missing mana 200')
    assert.ok(!block.includes('mana: 150'), 'must not adopt secondary-source mana 150')
    assert.ok(sourceDoc.includes('source-ambiguous') && sourceDoc.includes('150'), 'source ambiguity should remain documented')
  })

  it('DATA14-6: resurrection cooldown is 240 seconds', () => {
    assert.ok(block.includes('cooldown: 240'), 'missing cooldown 240')
  })

  it('DATA14-7: resurrection range maps source Range 40 to project 4.0', () => {
    assert.ok(block.includes('range: 4.0'), 'missing range 4.0')
    assert.ok(sourceDoc.includes('Range 40') && sourceDoc.includes('4.0 项目单位'), 'missing source mapping')
  })

  it('DATA14-8: resurrection areaRadius maps source AoE 90 to project 9.0', () => {
    assert.ok(block.includes('areaRadius: 9.0'), 'missing areaRadius 9.0')
    assert.ok(sourceDoc.includes('AoE 90') && sourceDoc.includes('9.0 项目单位'), 'missing AoE source mapping')
  })

  it('DATA14-9: resurrection maxTargets and effectValue use source max 6', () => {
    assert.ok(block.includes('maxTargets: 6'), 'missing maxTargets 6')
    assert.ok(block.includes('effectValue: 6'), 'missing effectValue 6')
  })

  it('DATA14-10: resurrection has no undead damage', () => {
    assert.ok(block.includes('undeadDamage: 0'), 'missing undeadDamage 0')
  })

  it('DATA14-11: resurrection effectType is data-only resurrection marker', () => {
    assert.ok(block.includes("effectType: 'resurrection'"), 'missing effectType resurrection')
  })

  it('DATA14-12: data doc lists source-unknown values still deferred', () => {
    for (const token of ['复活单位 HP / mana', '尸体存在时间', 'most powerful', '友方英雄尸体']) {
      assert.ok(dataDoc.includes(token), `missing deferred unknown: ${token}`)
    }
  })

  it('DATA14-13: ABILITIES still has no resurrection entry', () => {
    assert.ok(!/resurrection\s*:/.test(abilitiesSection(gameData)), 'must not add ABILITIES.resurrection')
  })

  it('DATA14-14: Game.ts has cast runtime + UX feedback but no ABILITIES.resurrection', () => {
    const game = read('src/game/Game.ts')
    assert.ok(game.includes('学习复活'), 'must expose Resurrection learn button')
    assert.ok(game.includes('castResurrection'), 'castResurrection must exist post-IMPL1C')
    assert.ok(game.includes('复活术 Lv') && game.includes('刚复活') && game.includes('复活冷却'), 'UX1 should expose minimal feedback')
    assert.ok(!game.includes('ABILITIES.resurrection'), 'must not use ABILITIES.resurrection')
    assert.ok(!game.includes('群体复活'), 'must not use 群体复活 wording')
  })

  it('DATA14-15: SimpleAI.ts has no Resurrection behavior', () => {
    const ai = read('src/game/SimpleAI.ts')
    assert.ok(!ai.includes('resurrection') && !ai.includes('Resurrection') && !ai.includes('群体复活'), 'SimpleAI must not include Resurrection behavior')
  })

  it('DATA14-16: source-boundary proof is stage-aware and still present', () => {
    const sourceProof = read('tests/v9-hero14-resurrection-source-boundary.spec.mjs')
    assert.ok(sourceProof.includes('after DATA1'), 'source proof should be stage-aware after DATA1')
  })

  it('DATA14-17: contract proof is stage-aware and still present', () => {
    const contractProof = read('tests/v9-hero14-resurrection-contract.spec.mjs')
    assert.ok(contractProof.includes('post-DATA1'), 'contract proof should be stage-aware after DATA1')
  })

  it('DATA14-18: data doc denies complete Paladin / hero system / Human / V9 release', () => {
    for (const token of ['完整圣骑士', '完整英雄系统', '完整人族', 'V9 已发布']) {
      assert.ok(dataDoc.includes(token), `missing denial: ${token}`)
    }
  })
})
