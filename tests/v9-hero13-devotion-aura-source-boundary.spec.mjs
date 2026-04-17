/**
 * V9 HERO13-SRC1 Devotion Aura source boundary static proof.
 *
 * Proves:
 *   1. Source boundary doc references HERO13-CONTRACT1 / Task 238.
 *   2. Source hierarchy uses Blizzard Classic as primary source.
 *   3. Devotion Aura recorded as passive: no mana, no cooldown, no cast.
 *   4. Level values: armor +1.5/+3/+4.5, AoE 90, hero levels 1/3/5.
 *   5. Project mapping describes AoE and armor mapping.
 *   6. Post-IMPL1 production code reads devotion_aura only for minimal passive runtime.
 *   7. Source boundary denies complete Paladin, hero system, Human, V9 release.
 */
import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync, existsSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
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

describe('HERO13-SRC1 Devotion Aura source boundary', () => {
  const doc = read('docs/V9_HERO13_DEVOTION_AURA_SOURCE_BOUNDARY.zh-CN.md')
  const valueSection = sectionBetween(doc, '## 2. 采纳值', '## 3. 行为规则')
  const mappingSection = sectionBetween(doc, '## 4. 项目映射', '## 5. 不修改生产代码')
  const deferredSection = sectionBetween(doc, '## 6. 明确延后', '## 7. 合同声明')

  // ── 1. Doc references ──

  it('SRC13-1: references HERO13-CONTRACT1 / Task 238', () => {
    assert.ok(doc.includes('Task 238') && doc.includes('CONTRACT1'), 'missing CONTRACT1 reference')
  })

  it('SRC13-2: references accepted Paladin baseline', () => {
    assert.ok(doc.includes('HERO9') || doc.includes('HERO12'), 'missing baseline reference')
  })

  // ── 2. Source hierarchy ──

  it('SRC13-3: primary source is Blizzard Classic Battle.net', () => {
    assert.ok(doc.includes('classic.battle.net'), 'missing Blizzard Classic primary source')
  })

  it('SRC13-4: mentions Liquipedia as cross-check', () => {
    assert.ok(doc.includes('liquipedia') || doc.includes('Liquipedia'), 'missing Liquipedia cross-check')
  })

  // ── 3. Passive definition ──

  it('SRC13-5: states no mana cost', () => {
    assert.ok(valueSection.includes('无') || valueSection.includes('不适用'), 'must state no mana')
  })

  it('SRC13-6: states no cooldown', () => {
    assert.ok(valueSection.includes('不适用') || valueSection.includes('无') && valueSection.includes('冷却'), 'must state no cooldown')
  })

  it('SRC13-7: states no command-card cast', () => {
    assert.ok(valueSection.includes('无命令卡') || valueSection.includes('自动生效'), 'must state passive/no cast')
  })

  it('SRC13-8: states unlimited duration (passive)', () => {
    assert.ok(valueSection.includes('无限') || valueSection.includes('被动持续'), 'must state unlimited duration')
  })

  // ── 4. Level values ──

  it('SRC13-9: level 1 armor bonus +1.5', () => {
    assert.ok(doc.includes('+1.5'), 'missing level 1 armor +1.5')
  })

  it('SRC13-10: level 2 armor bonus +3', () => {
    assert.ok(doc.includes('+3'), 'missing level 2 armor +3')
  })

  it('SRC13-11: level 3 armor bonus +4.5', () => {
    assert.ok(doc.includes('+4.5'), 'missing level 3 armor +4.5')
  })

  it('SRC13-12: AoE radius 90 for all levels', () => {
    const aoeMatches = valueSection.match(/90/g)
    assert.ok(aoeMatches && aoeMatches.length >= 3, 'AoE 90 must appear for all 3 levels')
  })

  it('SRC13-13: hero level requirements 1/3/5', () => {
    assert.ok(valueSection.includes('1') && valueSection.includes('3') && valueSection.includes('5'), 'missing hero level requirements')
  })

  it('SRC13-14: targets include Air / Ground / Friend / Self', () => {
    assert.ok(doc.includes('Air') && doc.includes('Ground') && doc.includes('Friend') && doc.includes('Self'), 'missing target types')
  })

  // ── 5. Project mapping ──

  it('SRC13-15: project mapping describes AoE conversion', () => {
    assert.ok(mappingSection.includes('90'), 'mapping must reference AoE value 90')
    assert.ok(mappingSection.includes('80 War3 单位') && mappingSection.includes('8.0'), 'mapping must reference accepted HERO range scale')
    assert.ok(mappingSection.includes('9.0'), 'mapping must map AoE 90 to project scale 9.0')
    assert.ok(mappingSection.includes('比例') || mappingSection.includes('映射'), 'mapping must describe conversion approach')
  })

  it('SRC13-16: armor mapping states temporary, not permanent', () => {
    assert.ok(mappingSection.includes('临时') || mappingSection.includes('不永久'), 'armor must be temporary')
  })

  it('SRC13-17: stacking boundary avoids multi-source invention', () => {
    assert.ok(doc.includes('不重复累计') || doc.includes('不叠加'), 'must document same-source stacking guard')
    assert.ok(doc.includes('多来源叠加规则未定') || doc.includes('未来多英雄/多来源必须另开来源边界'), 'must defer multi-source stacking')
    assert.ok(!doc.includes('多个 Paladin（如果存在）的 Devotion Aura 各自独立提供'), 'must not invent multi-Paladin stacking')
  })

  it('SRC13-17b: target mapping does not invent building coverage', () => {
    assert.ok(mappingSection.includes('Buildings') || mappingSection.includes('Structures'), 'must mention building/structure boundary')
    assert.ok(mappingSection.includes('不得把建筑加入受影响目标'), 'must forbid building expansion without another source boundary')
    assert.ok(!mappingSection.includes('IMPL1 根据来源意图决定'), 'implementation slice must not decide building coverage ad hoc')
  })

  // ── 6. Behavior rules ──

  it('SRC13-18: states aura stops on source death', () => {
    assert.ok(doc.includes('死亡') && doc.includes('失去'), 'must state death stops aura')
  })

  it('SRC13-19: states units gain armor entering range', () => {
    assert.ok(doc.includes('进入范围') && doc.includes('获得'), 'must state gain on enter')
  })

  it('SRC13-20: states units lose armor leaving range', () => {
    assert.ok(doc.includes('离开范围') && doc.includes('失去'), 'must state lose on leave')
  })

  it('SRC13-21: explicitly excludes substitute effects', () => {
    assert.ok(
      doc.includes('治疗') &&
      doc.includes('伤害吸收') &&
      doc.includes('无敌') &&
      doc.includes('攻击力'),
      'must exclude heal/damage-absorb/invuln/attack substitutes'
    )
  })

  // ── 7. Production code boundary (post-IMPL1) ──

  it('SRC13-22: GameData.ts has devotion_aura in HERO_ABILITY_LEVELS but not in ABILITIES', () => {
    const gd = read('src/game/GameData.ts')
    assert.ok(gd.includes('devotion_aura:'), 'HERO_ABILITY_LEVELS must have devotion_aura post-DATA1')
    const abilitiesSection = gd.substring(gd.indexOf('export const ABILITIES'), gd.indexOf('export const HERO_REVIVE_RULES'))
    assert.ok(!abilitiesSection.includes('devotion_aura'), 'ABILITIES must not have devotion_aura')
  })

  it('SRC13-23: Game.ts has passive runtime + learn + HUD feedback, no cast button', () => {
    const game = read('src/game/Game.ts')
    assert.ok(game.includes('updateDevotionAura'), 'Game.ts must contain passive aura runtime')
    assert.ok(game.includes('HERO_ABILITY_LEVELS.devotion_aura'), 'Game.ts must read devotion_aura data')
    assert.ok(game.includes('学习虔诚光环'), 'IMPL2 must expose learn surface')
    assert.ok(game.includes('虔诚光环 Lv'), 'UX1 must show DA level in HUD')
    assert.ok(game.includes('虔诚光环 +'), 'UX1 must show aura armor bonus on affected units')
    assert.ok(!game.includes('castDevotionAura'), 'must not have cast method (passive only)')
    assert.ok(!game.includes('ABILITIES.devotion_aura'), 'must not use ABILITIES.devotion_aura')
  })

  // ── 8. Denials ──

  it('SRC13-24: denies complete Paladin', () => {
    assert.ok(doc.includes('完整圣骑士'), 'must deny complete Paladin')
  })

  it('SRC13-25: denies complete hero system', () => {
    assert.ok(doc.includes('完整英雄系统'), 'must deny complete hero system')
  })

  it('SRC13-26: denies complete Human', () => {
    assert.ok(doc.includes('完整人族'), 'must deny complete Human')
  })

  it('SRC13-27: denies V9 release', () => {
    assert.ok(doc.includes('V9 发布'), 'must deny V9 release')
  })

  it('SRC13-28: lists Resurrection as deferred', () => {
    assert.ok(deferredSection.includes('Resurrection'), 'must list Resurrection deferred')
  })

  it('SRC13-29: lists other heroes as deferred', () => {
    assert.ok(
      deferredSection.includes('Archmage') && deferredSection.includes('Mountain King'),
      'must list other heroes deferred'
    )
  })
})
