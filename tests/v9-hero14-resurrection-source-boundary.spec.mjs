/**
 * V9 HERO14-SRC1 Paladin Resurrection source-boundary static proof.
 *
 * Proves:
 *   1. Source boundary references HERO14 contract and accepted hero baselines.
 *   2. Blizzard Classic Battle.net is primary; Liquipedia is only a cross-check.
 *   3. Source values and ambiguities are recorded before data/runtime work.
 *   4. Project mapping stays explicit and limited.
 *   5. Production code is stage-aware after UX1: data + minimal cast runtime + text feedback exist, AI still does not.
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

function sectionBetween(text, startHeading, endHeading) {
  const start = text.indexOf(startHeading)
  assert.ok(start >= 0, `missing section: ${startHeading}`)
  const end = text.indexOf(endHeading, start + startHeading.length)
  assert.ok(end > start, `missing section end: ${endHeading}`)
  return text.slice(start, end)
}

describe('HERO14-SRC1 Resurrection source boundary', () => {
  const doc = read('docs/V9_HERO14_RESURRECTION_SOURCE_BOUNDARY.zh-CN.md')
  const sourceSection = sectionBetween(doc, '## 1. 来源层级', '## 2. 采纳值')
  const valuesSection = sectionBetween(doc, '## 2. 采纳值', '## 3. 行为规则')
  const behaviorSection = sectionBetween(doc, '## 3. 行为规则', '## 4. 项目映射')
  const mappingSection = sectionBetween(doc, '## 4. 项目映射', '## 5. 不修改生产代码')
  const noCodeSection = sectionBetween(doc, '## 5. 不修改生产代码', '## 6. 明确延后')
  const deferredSection = sectionBetween(doc, '## 6. 明确延后', '## 7. 合同声明')
  const contractSection = doc.slice(doc.indexOf('## 7. 合同声明'))

  it('SRC14-1: references Task245 / HERO14 contract prerequisite', () => {
    assert.ok(doc.includes('Task 245') && doc.includes('HERO14-CONTRACT1'), 'missing contract prerequisite')
  })

  it('SRC14-2: references HERO9 through HERO13 accepted baselines', () => {
    for (const token of ['HERO9', 'HERO10', 'HERO11', 'HERO12', 'HERO13']) {
      assert.ok(sourceSection.includes(token), `missing accepted baseline: ${token}`)
    }
  })

  it('SRC14-3: uses Blizzard Classic Battle.net as primary source', () => {
    assert.ok(sourceSection.includes('Blizzard Classic Battle.net'), 'missing Blizzard primary source')
    assert.ok(sourceSection.includes('https://classic.battle.net/war3/human/units/paladin.shtml'), 'missing primary URL')
    assert.ok(sourceSection.includes('唯一权威来源'), 'primary source must be authoritative')
  })

  it('SRC14-4: keeps Liquipedia as cross-check only', () => {
    assert.ok(sourceSection.includes('Liquipedia'), 'missing Liquipedia cross-check')
    assert.ok(sourceSection.includes('不得覆盖主源'), 'secondary source must not override primary source')
  })

  it('SRC14-5: records Resurrection as one-level ultimate', () => {
    assert.ok(valuesSection.includes('N/A') && valuesSection.includes('终极技能'), 'missing one-level ultimate mapping')
  })

  it('SRC14-6: records cooldown 240 seconds', () => {
    assert.ok(valuesSection.includes('Cooldown') && valuesSection.includes('240 秒'), 'missing cooldown 240')
  })

  it('SRC14-7: records primary mana 200 and secondary 150 as ambiguous', () => {
    assert.ok(valuesSection.includes('Mana Cost') && valuesSection.includes('200'), 'missing primary mana 200')
    assert.ok(valuesSection.includes('150'), 'missing secondary mana 150 cross-check')
    assert.ok(valuesSection.includes('source-ambiguous'), 'mana mismatch must be marked ambiguous')
  })

  it('SRC14-8: records range 40 and area of effect 90', () => {
    assert.ok(valuesSection.includes('Range') && valuesSection.includes('40'), 'missing range 40')
    assert.ok(valuesSection.includes('Area of Effect') && valuesSection.includes('90'), 'missing AoE 90')
  })

  it('SRC14-9: records targets as Ground, Dead, Friend', () => {
    assert.ok(valuesSection.includes('Ground, Dead, Friend'), 'missing source target set')
  })

  it('SRC14-10: records resurrects up to 6 units and level requirement 6', () => {
    assert.ok(valuesSection.includes('Resurrects up to 6 Units'), 'missing max unit count')
    assert.ok(valuesSection.includes('Hero Level Req') && valuesSection.includes('6'), 'missing hero level 6')
  })

  it('SRC14-11: records Active / No Target cast type', () => {
    assert.ok(valuesSection.includes('Active, No Target'), 'missing no-target cast type')
  })

  it('SRC14-12: marks resurrected HP / mana as source-unknown', () => {
    assert.ok(valuesSection.includes('Resurrected HP/Mana') && valuesSection.includes('source-unknown'), 'missing HP/mana unknown')
  })

  it('SRC14-13: marks corpse decay time as source-unknown', () => {
    assert.ok(valuesSection.includes('Corpse Decay Time') && valuesSection.includes('source-unknown'), 'missing corpse decay unknown')
  })

  it('SRC14-14: marks most-powerful sorting as source-ambiguous', () => {
    assert.ok(valuesSection.includes('Most Powerful') && valuesSection.includes('source-ambiguous'), 'missing most-powerful ambiguity')
  })

  it('SRC14-15: states Resurrection is active no-target ultimate behavior', () => {
    assert.ok(behaviorSection.includes('主动施放') && behaviorSection.includes('不需要点选目标'), 'missing active no-target behavior')
  })

  it('SRC14-16: separates HERO9 Altar revive from HERO14 Resurrection', () => {
    assert.ok(behaviorSection.includes('HERO9 Altar Revive'), 'missing HERO9 separation')
    assert.ok(behaviorSection.includes('HERO14 Resurrection'), 'missing HERO14 separation')
    assert.ok(behaviorSection.includes('Paladin 自身'), 'must discuss Paladin self revive boundary')
  })

  it('SRC14-17: keeps friendly hero corpse handling ambiguous', () => {
    assert.ok(behaviorSection.includes('友方英雄') && behaviorSection.includes('source-ambiguous'), 'missing friendly hero ambiguity')
  })

  it('SRC14-18: maps AoE 90 to 9.0 project units', () => {
    assert.ok(mappingSection.includes('AoE 90') && mappingSection.includes('9.0 项目单位'), 'missing AoE project mapping')
  })

  it('SRC14-19: maps range 40 to 4.0 project units', () => {
    assert.ok(mappingSection.includes('Range 40') && mappingSection.includes('4.0 项目单位'), 'missing range project mapping')
  })

  it('SRC14-20: maps max resurrected units directly to 6', () => {
    assert.ok(mappingSection.includes('主源值 6') && mappingSection.includes('项目值 6'), 'missing max-units mapping')
  })

  it('SRC14-21: maps dead friendly ground unit records without adding buildings or air', () => {
    assert.ok(mappingSection.includes('isDead === true') && mappingSection.includes('team === paladin.team'), 'missing dead friendly unit record mapping')
    assert.ok(mappingSection.includes('不得把建筑加入首轮受影响目标'), 'building exclusion must be explicit')
    assert.ok(mappingSection.includes('不得把空中单位加入受影响目标'), 'air exclusion must be explicit')
  })

  it('SRC14-22: declares no production code changes', () => {
    for (const token of ['GameData.ts', 'Game.ts', 'SimpleAI.ts', 'CSS', '资产']) {
      assert.ok(noCodeSection.includes(token), `missing no-code boundary: ${token}`)
    }
  })

  it('SRC14-23: defers data seed, runtime, command button, HUD, visuals, assets, and AI', () => {
    for (const token of ['HERO_ABILITY_LEVELS.resurrection', '运行时实现', '命令卡按钮', 'HUD', '视觉特效', '资产', 'AI 英雄策略']) {
      assert.ok(deferredSection.includes(token), `missing deferred item: ${token}`)
    }
  })

  it('SRC14-24: denies complete Paladin, hero system, Human, and V9 release', () => {
    for (const token of ['完整圣骑士', '完整英雄系统', '完整人族', 'V9 发布']) {
      assert.ok(deferredSection.includes(token), `missing deferred complete claim: ${token}`)
      assert.ok(contractSection.includes(token), `missing contract denial: ${token}`)
    }
  })

  it('SRC14-25: contract proof remains present', () => {
    const contract = read('docs/V9_HERO14_RESURRECTION_CONTRACT.zh-CN.md')
    assert.ok(contract.includes('HERO14-SRC1'), 'contract must still mention HERO14-SRC1')
    assert.ok(contract.includes('HERO14-DATA1'), 'contract must still mention HERO14-DATA1')
  })

  it('SRC14-26: contract static proof file remains present', () => {
    assert.ok(existsSync(resolve(ROOT, 'tests/v9-hero14-resurrection-contract.spec.mjs')), 'missing HERO14 contract proof')
  })

  it('SRC14-27: GameData.ts has HERO_ABILITY_LEVELS.resurrection data seed after DATA1', () => {
    const gd = read('src/game/GameData.ts')
    assert.ok(gd.includes('HERO_ABILITY_LEVELS'), 'baseline HERO_ABILITY_LEVELS missing')
    assert.ok(/HERO_ABILITY_LEVELS[\s\S]*resurrection\s*:/.test(gd), 'DATA1 should add HERO_ABILITY_LEVELS.resurrection')
    assert.ok(gd.includes('areaRadius: 9.0') && gd.includes('maxTargets: 6'), 'DATA1 should preserve source-boundary area/max target mapping')
  })

  it('SRC14-28: ABILITIES has no resurrection entry yet', () => {
    const gd = read('src/game/GameData.ts')
    const abilitiesStart = gd.indexOf('export const ABILITIES')
    assert.ok(abilitiesStart >= 0, 'missing ABILITIES section')
    const abilitiesEnd = gd.indexOf('// ===== 英雄复活规则', abilitiesStart)
    assert.ok(abilitiesEnd > abilitiesStart, 'missing ABILITIES end')
    const abilitiesSection = gd.slice(abilitiesStart, abilitiesEnd)
    assert.ok(!/resurrection\s*:/.test(abilitiesSection), 'must not add ABILITIES.resurrection')
  })

  it('SRC14-29: Game.ts has cast runtime + UX text feedback but no ABILITIES.resurrection or 群体复活', () => {
    const game = read('src/game/Game.ts')
    assert.ok(game.includes('学习复活'), 'must expose Resurrection learn button')
    assert.ok(game.includes('castResurrection'), 'castResurrection must exist post-IMPL1C')
    assert.ok(game.includes('deadUnitRecords'), 'IMPL1C should consume deadUnitRecords substrate')
    assert.ok(game.includes('areaRadius') && game.includes('maxTargets'), 'IMPL1C should read area/max target data')
    assert.ok(game.includes('复活术 Lv') && game.includes('刚复活') && game.includes('复活冷却'), 'UX1 should expose minimal text feedback')
    assert.ok(!game.includes('ABILITIES.resurrection'), 'must not use ABILITIES.resurrection')
    assert.ok(!game.includes('群体复活'), 'must not use 群体复活 wording')
  })

  it('SRC14-30: SimpleAI.ts has no Resurrection behavior yet', () => {
    const ai = read('src/game/SimpleAI.ts')
    assert.ok(!ai.includes('resurrection') && !ai.includes('Resurrection') && !ai.includes('群体复活'), 'SimpleAI must not include Resurrection behavior')
  })
})
