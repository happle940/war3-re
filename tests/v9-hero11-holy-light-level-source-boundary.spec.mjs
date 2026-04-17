/**
 * V9 HERO11-SRC1 Holy Light level / skill-learning source boundary proof.
 *
 * This is a static source-boundary check. It must not prove runtime behavior.
 */
import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(__dirname, '..')

function read(relativePath) {
  const path = resolve(ROOT, relativePath)
  assert.ok(existsSync(path), `missing file: ${relativePath}`)
  return readFileSync(path, 'utf8')
}

function section(text, start, end) {
  const from = text.indexOf(start)
  assert.notEqual(from, -1, `missing section start: ${start}`)
  const to = end ? text.indexOf(end, from + start.length) : -1
  return text.slice(from, to === -1 ? undefined : to)
}

describe('HERO11-SRC1 Holy Light level source boundary', () => {
  const doc = read('docs/V9_HERO11_HOLY_LIGHT_LEVEL_SOURCE_BOUNDARY.zh-CN.md')
  const gameData = read('src/game/GameData.ts')
  const contract = read('docs/V9_HERO11_SKILL_LEARNING_CONTRACT.zh-CN.md')

  it('SRC11-1: doc exists and references Task225 / HERO11-CONTRACT1', () => {
    assert.ok(doc.length > 500, 'source boundary doc is too short')
    assert.ok(doc.includes('Task 225'), 'must reference Task225')
    assert.ok(doc.includes('HERO11-CONTRACT1'), 'must reference HERO11-CONTRACT1')
    assert.ok(contract.includes('HERO11-SRC1'), 'contract must point to this source-boundary step')
  })

  it('SRC11-2: source hierarchy uses Classic Paladin and Hero Basics as primary sources', () => {
    const sourceSection = section(doc, '## 1. 来源层级', '## 2.')
    assert.ok(sourceSection.includes('classic.hiveworkshop.com/war3/human/units/paladin.shtml'))
    assert.ok(sourceSection.includes('classic.hiveworkshop.com/war3/basics/heroes.shtml'))
    assert.ok(sourceSection.includes('Liquipedia'), 'must keep Liquipedia as cross-check')
    assert.ok(sourceSection.includes('冲突处理'), 'must define conflict handling')
    assert.ok(sourceSection.includes('主来源为准'), 'must prefer primary sources on conflict')
  })

  it('SRC11-3: adopted Holy Light values are source-bound for levels 1/2/3', () => {
    const valueSection = section(doc, '## 2. Holy Light 等级数值', '## 3.')
    for (const value of ['200', '400', '600', '100', '200', '300']) {
      assert.ok(valueSection.includes(value), `missing value ${value}`)
    }
    assert.ok(valueSection.includes('65'), 'mana must stay 65')
    assert.ok(valueSection.includes('5s'), 'cooldown must stay 5s')
    assert.ok(valueSection.includes('80 War3 单位'), 'source range must be recorded as 80 War3 units')
    assert.ok(valueSection.includes('8.0'), 'project range mapping must be 8.0')
  })

  it('SRC11-4: Holy Light learn gates are 1 / 3 / 5 and not guessed', () => {
    const skillSection = section(doc, '## 3. 技能学习规则', '## 4.')
    assert.ok(skillSection.includes('Level 1 / 3 / 5'), 'must record exact Holy Light level gates')
    assert.ok(skillSection.includes('heroLevel >= 1 / 3 / 5'), 'must map gates to project heroLevel checks')
    assert.ok(skillSection.includes('不能在任意英雄等级提前消费技能点'), 'must forbid any-level spend')
  })

  it('SRC11-5: skill-point and ultimate rules remain source-bounded', () => {
    const skillSection = section(doc, '## 3. 技能学习规则', '## 4.')
    assert.ok(skillSection.includes('新英雄起始 1 技能点'), 'must keep initial skill-point rule')
    assert.ok(skillSection.includes('每次升级获得 1 技能点'), 'must keep level-up skill-point rule')
    assert.ok(skillSection.includes('3 个等级'), 'normal abilities must have three levels')
    assert.ok(skillSection.includes('等级 6'), 'ultimate unlock level must be recorded')
    assert.ok(skillSection.includes('只有 1 个等级'), 'ultimate must be recorded as one level')
    assert.ok(skillSection.includes('本边界不实现终极技能'), 'ultimate must stay deferred')
  })

  it('SRC11-6: unsupported HERO1 candidate values are rejected', () => {
    const conflictSection = section(doc, '### 2.3 HERO1 候选值处理', '## 3.')
    assert.ok(conflictSection.includes('350/500'), 'must mention the old candidate values')
    assert.ok(conflictSection.includes('不被采纳'), 'must reject unsupported candidate values')
    assert.ok(conflictSection.includes('200/400/600'), 'must state adopted source values')
  })

  it('SRC11-7: HERO11-DATA1 mapping is data-only and preserves current runtime baseline', () => {
    const mappingSection = section(doc, '## 4. 项目映射', '## 5.')
    assert.ok(mappingSection.includes('HERO_ABILITY_LEVELS'), 'must recommend a data shape')
    assert.ok(mappingSection.includes('requiredHeroLevel: 1'))
    assert.ok(mappingSection.includes('requiredHeroLevel: 3'))
    assert.ok(mappingSection.includes('requiredHeroLevel: 5'))
    assert.ok(mappingSection.includes('DATA1/IMPL1 之前不进入运行时'))
    assert.ok(mappingSection.includes('不修改 `GameData.ts`'))
    assert.ok(mappingSection.includes('等级 1 runtime 行为'), 'must preserve level-1 runtime baseline')
  })

  it('SRC11-8: GameData level-1 ABILITIES unchanged; HERO_ABILITY_LEVELS seeded post-DATA1', () => {
    const holyLight = section(gameData, 'holy_light:', '// ===== 英雄复活规则')
    assert.ok(holyLight.includes("key: 'holy_light'"))
    assert.ok(holyLight.includes('cost: { mana: 65 }'))
    assert.ok(holyLight.includes('cooldown: 5'))
    assert.ok(holyLight.includes('range: 8.0'))
    assert.ok(holyLight.includes('effectValue: 200'))
    // DATA1 has now seeded HERO_ABILITY_LEVELS — verify it matches SRC1 adopted values
    assert.ok(gameData.includes('HERO_ABILITY_LEVELS'), 'DATA1 must have seeded HERO_ABILITY_LEVELS')
    assert.ok(gameData.includes('effectValue: 200, undeadDamage: 100'), 'level 1 SRC1 values')
    assert.ok(gameData.includes('effectValue: 400, undeadDamage: 200'), 'level 2 SRC1 values')
    assert.ok(gameData.includes('effectValue: 600, undeadDamage: 300'), 'level 3 SRC1 values')
  })

  it('SRC11-9: source boundary does not claim runtime or release completion', () => {
    assert.ok(doc.includes('不') && doc.includes('完整英雄系统'), 'must deny complete hero system')
    assert.ok(doc.includes('不') && doc.includes('完整人族'), 'must deny complete Human')
    assert.ok(doc.includes('不') && doc.includes('V9 发布'), 'must deny V9 release')
    assert.ok(doc.includes('不 修改生产代码') || doc.includes('不修改生产代码'), 'must state no production-code change')
    assert.ok(doc.includes('HERO11-DATA1'), 'next task must be HERO11-DATA1')
  })
})
