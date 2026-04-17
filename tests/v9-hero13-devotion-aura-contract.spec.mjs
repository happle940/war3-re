/**
 * V9 HERO13-CONTRACT1 Paladin Devotion Aura branch contract static proof.
 *
 * Proves:
 *   1. Contract references HERO9/10/11/12 baseline.
 *   2. Contract defines safe branch order: SRC1 → DATA1 → IMPL1 → IMPL2 → UX1 → CLOSE1.
 *   3. Contract defines Devotion Aura as passive aura with no mana/cooldown/cast button.
 *   4. Contract states exact values must come from SRC1.
 *   5. Runtime proof obligations listed for IMPL1.
 *   6. Contract denies Resurrection, other heroes, AI, items, shops, Tavern, assets,
 *      second race, air, multiplayer, complete hero system, complete Human, V9 release.
 *   7. Post-IMPL1 production code remains within minimal passive runtime boundaries.
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

describe('HERO13-CONTRACT1 Paladin Devotion Aura branch contract', () => {
  const doc = read('docs/V9_HERO13_DEVOTION_AURA_CONTRACT.zh-CN.md')
  const definitionSection = sectionBetween(doc, '## 3. Devotion Aura 能力定义（合同级别）', '## 4. 运行时证明义务（IMPL1）')
  const deferredSection = sectionBetween(doc, '## 5. 明确延后', '## 6. 合同声明')
  const contractSection = doc.slice(doc.indexOf('## 6. 合同声明'))

  // ── 1. Baseline references ──

  it('C13-1: references HERO9 death/revive', () => {
    assert.ok(doc.includes('HERO9'), 'missing HERO9 reference')
  })

  it('C13-2: references HERO10 XP/leveling', () => {
    assert.ok(doc.includes('HERO10'), 'missing HERO10 reference')
  })

  it('C13-3: references HERO11 Holy Light learning', () => {
    assert.ok(doc.includes('HERO11'), 'missing HERO11 reference')
  })

  it('C13-4: references HERO12 Divine Shield closure', () => {
    assert.ok(doc.includes('HERO12'), 'missing HERO12 reference')
  })

  // ── 2. Branch order ──

  it('C13-5: defines HERO13-SRC1', () => {
    assert.ok(doc.includes('SRC1'), 'missing SRC1 definition')
  })

  it('C13-6: defines HERO13-DATA1', () => {
    assert.ok(doc.includes('DATA1'), 'missing DATA1 definition')
  })

  it('C13-7: defines HERO13-IMPL1', () => {
    assert.ok(doc.includes('IMPL1'), 'missing IMPL1 definition')
  })

  it('C13-8: defines HERO13-UX1', () => {
    assert.ok(doc.includes('UX1'), 'missing UX1 definition')
  })

  it('C13-9: defines HERO13-CLOSE1', () => {
    assert.ok(doc.includes('CLOSE1'), 'missing CLOSE1 definition')
  })

  it('C13-10: sequence order is SRC1 → DATA1 → IMPL1 → IMPL2 → UX1 → CLOSE1', () => {
    const seqLine = doc.split('\n').find(l => l.includes('顺序约束'))
    assert.ok(seqLine, 'missing sequence constraint line')
    const seqText = seqLine
    assert.ok(seqText.includes('SRC1') && seqText.includes('DATA1') && seqText.includes('IMPL1') && seqText.includes('IMPL2') && seqText.includes('UX1') && seqText.includes('CLOSE1'), 'sequence must list all stages')
    assert.ok(seqText.indexOf('SRC1') < seqText.indexOf('DATA1'), 'SRC1 must precede DATA1')
    assert.ok(seqText.indexOf('DATA1') < seqText.indexOf('IMPL1'), 'DATA1 must precede IMPL1')
    assert.ok(seqText.indexOf('IMPL1') < seqText.indexOf('IMPL2'), 'IMPL1 must precede IMPL2')
    assert.ok(seqText.indexOf('IMPL2') < seqText.indexOf('UX1'), 'IMPL2 must precede UX1')
    assert.ok(seqText.indexOf('UX1') < seqText.indexOf('CLOSE1'), 'UX1 must precede CLOSE1')
  })

  // ── 3. Passive aura definition ──

  it('C13-11: states no mana cost', () => {
    assert.ok(doc.includes('无法力') || doc.includes('无') && doc.includes('法力消耗'), 'must state no mana cost')
  })

  it('C13-12: states no cooldown', () => {
    assert.ok(doc.includes('无') && doc.includes('冷却'), 'must state no cooldown')
  })

  it('C13-13: states no cast button (passive)', () => {
    assert.ok(doc.includes('无') && (doc.includes('施放按钮') || doc.includes('命令卡')), 'must state no cast button')
  })

  it('C13-14: states friendly armor bonus', () => {
    assert.ok(definitionSection.includes('护甲加成'), 'must define armor bonus')
  })

  it('C13-15: states aura ends on death or out of range', () => {
    assert.ok(definitionSection.includes('死亡') && definitionSection.includes('范围'), 'must state aura removal conditions')
  })

  // ── 4. Values from SRC1 ──

  it('C13-16: states exact values must come from SRC1', () => {
    assert.ok(definitionSection.includes('SRC1') && (definitionSection.includes('来源边界') || definitionSection.includes('SRC1 来源')), 'must state values from SRC1')
    assert.ok(definitionSection.includes('受影响目标集合') && definitionSection.includes('叠加规则'), 'must defer affected targets and stacking rules to SRC1')
  })

  it('C13-17: does not hardcode armor bonus values', () => {
    assert.ok(!doc.includes('护甲 +1') && !doc.includes('护甲 +2') && !doc.includes('护甲 +3'), 'contract must not hardcode armor values')
  })

  it('C13-17b: does not hardcode affected unit class before SRC1', () => {
    assert.ok(!definitionSection.includes('非建筑单位'), 'contract must not decide non-building-only target set before SRC1')
  })

  // ── 5. Runtime proof obligations ──

  it('C13-18: lists source alive proof obligation', () => {
    assert.ok(doc.includes('RP-1') || doc.includes('存活'), 'must list alive proof obligation')
  })

  it('C13-19: lists source dead proof obligation', () => {
    assert.ok(doc.includes('RP-2') || (doc.includes('死亡') && doc.includes('失去')), 'must list dead proof obligation')
  })

  it('C13-20: lists range in/out proof obligation', () => {
    assert.ok(doc.includes('RP-3') || doc.includes('离开范围'), 'must list out-of-range proof obligation')
  })

  it('C13-21: lists enemy unaffected proof obligation', () => {
    assert.ok(doc.includes('RP-5') || (doc.includes('敌方') && doc.includes('不受')), 'must list enemy unaffected proof')
  })

  it('C13-22: lists no permanent armor mutation proof obligation', () => {
    assert.ok(doc.includes('RP-6') || doc.includes('不永久修改'), 'must list no permanent mutation proof')
  })

  it('C13-23: lists no stacking abuse proof obligation', () => {
    assert.ok(doc.includes('RP-7') || doc.includes('不重复累计'), 'must list no stacking proof')
  })

  it('C13-24: lists Holy Light non-regression proof obligation', () => {
    assert.ok(doc.includes('RP-8') || (doc.includes('Holy Light') && doc.includes('不受影响')), 'must list HL non-regression')
  })

  it('C13-25: lists Divine Shield non-regression proof obligation', () => {
    assert.ok(doc.includes('RP-9') || (doc.includes('Divine Shield') && doc.includes('不受影响')), 'must list DS non-regression')
  })

  // ── 6. Explicit denials ──

  it('C13-26: denies Resurrection', () => {
    assert.ok(deferredSection.includes('Resurrection'), 'must deny Resurrection in deferred section')
  })

  it('C13-27: denies other heroes', () => {
    assert.ok(deferredSection.includes('Archmage') && deferredSection.includes('Mountain King'), 'must deny other heroes in deferred section')
  })

  it('C13-28: denies AI hero strategy', () => {
    assert.ok(deferredSection.includes('AI 英雄策略'), 'must deny AI strategy in deferred section')
  })

  it('C13-29: denies items/shops/Tavern', () => {
    assert.ok(deferredSection.includes('物品') && deferredSection.includes('商店') && deferredSection.includes('Tavern'), 'must deny items/shops/Tavern in deferred section')
  })

  it('C13-30: denies assets, second race, air, multiplayer', () => {
    assert.ok(deferredSection.includes('资产') && deferredSection.includes('第二种族') && deferredSection.includes('空军') && deferredSection.includes('多人联机'), 'must deny assets/race/air/multi in deferred section')
  })

  it('C13-31: denies complete hero system', () => {
    assert.ok(deferredSection.includes('完整英雄系统') && contractSection.includes('完整英雄系统'), 'must deny complete hero system')
  })

  it('C13-32: denies complete Human', () => {
    assert.ok(deferredSection.includes('完整人族') && contractSection.includes('完整人族'), 'must deny complete Human')
  })

  it('C13-33: denies V9 release', () => {
    assert.ok(deferredSection.includes('V9 发布') && contractSection.includes('V9 发布'), 'must deny V9 release')
  })

  it('C13-34: denies complete Paladin', () => {
    assert.ok(contractSection.includes('完整圣骑士'), 'must deny complete Paladin in contract section')
  })

  // ── 7. Production code boundary (post-IMPL1) ──

  it('C13-35: GameData.ts has devotion_aura in HERO_ABILITY_LEVELS but not in ABILITIES', () => {
    const gd = read('src/game/GameData.ts')
    assert.ok(gd.includes('devotion_aura:'), 'HERO_ABILITY_LEVELS must have devotion_aura post-DATA1')
    const abilitiesSection = gd.substring(gd.indexOf('export const ABILITIES'), gd.indexOf('export const HERO_REVIVE_RULES'))
    assert.ok(!abilitiesSection.includes('devotion_aura'), 'ABILITIES must not have devotion_aura')
  })

  it('C13-36: Game.ts has passive runtime + learn + HUD feedback, no cast button', () => {
    const game = read('src/game/Game.ts')
    assert.ok(game.includes('updateDevotionAura'), 'Game.ts must contain passive aura runtime')
    assert.ok(game.includes('HERO_ABILITY_LEVELS.devotion_aura'), 'Game.ts must read devotion_aura data')
    assert.ok(game.includes('学习虔诚光环'), 'IMPL2 must expose learn surface')
    assert.ok(game.includes('虔诚光环 Lv'), 'UX1 must show DA level in HUD')
    assert.ok(game.includes('虔诚光环 +'), 'UX1 must show aura armor bonus on affected units')
    assert.ok(!game.includes('castDevotionAura'), 'must not have cast method (passive only)')
    assert.ok(!game.includes('ABILITIES.devotion_aura'), 'must not use ABILITIES.devotion_aura')
  })
})
