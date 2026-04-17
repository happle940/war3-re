/**
 * V9 HERO14-CONTRACT1 Paladin Resurrection branch contract static proof.
 *
 * Proves:
 *   1. Contract is grounded in HERO9/10/11/12/13 accepted baselines.
 *   2. Contract defines the safe HERO14 branch order.
 *   3. Contract keeps source values and target rules in HERO14-SRC1.
 *   4. Contract lists runtime proof obligations and remains stage-aware after UX1.
 *   5. Contract still denies assets/AI/complete hero expansion.
 *   6. Current production code has minimal Resurrection cast + text feedback, but no ABILITIES entry.
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

describe('HERO14-CONTRACT1 Paladin Resurrection branch contract', () => {
  const doc = read('docs/V9_HERO14_RESURRECTION_CONTRACT.zh-CN.md')
  const baselineSection = sectionBetween(doc, '## 1. 基线引用', '## 2. 分支顺序')
  const orderSection = sectionBetween(doc, '## 2. 分支顺序', '## 3. Resurrection 能力定义（合同级别）')
  const definitionSection = sectionBetween(doc, '## 3. Resurrection 能力定义（合同级别）', '## 4. 运行时证明义务（IMPL1）')
  const proofSection = sectionBetween(doc, '## 4. 运行时证明义务（IMPL1）', '## 5. 明确延后')
  const deferredSection = sectionBetween(doc, '## 5. 明确延后', '## 6. 合同声明')
  const contractSection = doc.slice(doc.indexOf('## 6. 合同声明'))
  const currentSection = doc.slice(doc.indexOf('## 8. 当前阶段更新（HERO14-UX1）'))

  it('C14-1: references HERO9 death / Altar revive baseline', () => {
    assert.ok(baselineSection.includes('HERO9') && baselineSection.includes('Altar revive'), 'missing HERO9 Altar revive baseline')
  })

  it('C14-2: references HERO10 XP / skill-point baseline', () => {
    assert.ok(baselineSection.includes('HERO10') && baselineSection.includes('技能点'), 'missing HERO10 skill-point baseline')
  })

  it('C14-3: references HERO11 Holy Light baseline', () => {
    assert.ok(baselineSection.includes('HERO11') && baselineSection.includes('Holy Light'), 'missing HERO11 baseline')
  })

  it('C14-4: references HERO12 Divine Shield baseline', () => {
    assert.ok(baselineSection.includes('HERO12') && baselineSection.includes('Divine Shield'), 'missing HERO12 baseline')
  })

  it('C14-5: references HERO13 Devotion Aura closure', () => {
    assert.ok(baselineSection.includes('HERO13') && baselineSection.includes('Devotion Aura'), 'missing HERO13 baseline')
  })

  it('C14-6: defines every HERO14 branch stage', () => {
    for (const stage of ['HERO14-SRC1', 'HERO14-DATA1', 'HERO14-IMPL1', 'HERO14-UX1', 'HERO14-CLOSE1']) {
      assert.ok(orderSection.includes(stage), `missing ${stage}`)
    }
  })

  it('C14-7: branch order is SRC1 before DATA1 before IMPL1 before UX1 before CLOSE1', () => {
    const seqLine = orderSection.split('\n').find(line => line.includes('顺序约束'))
    assert.ok(seqLine, 'missing order constraint line')
    const stages = ['HERO14-SRC1', 'HERO14-DATA1', 'HERO14-IMPL1', 'HERO14-UX1', 'HERO14-CLOSE1']
    for (let i = 0; i < stages.length - 1; i += 1) {
      assert.ok(seqLine.indexOf(stages[i]) < seqLine.indexOf(stages[i + 1]), `${stages[i]} must precede ${stages[i + 1]}`)
    }
  })

  it('C14-8: requires each predecessor stage to be accepted before the next starts', () => {
    assert.ok(orderSection.includes('accepted'), 'missing accepted predecessor constraint')
  })

  it('C14-9: defines Resurrection as Paladin ultimate at contract level', () => {
    assert.ok(definitionSection.includes('终极技能') && definitionSection.includes('Paladin'), 'missing Paladin ultimate definition')
  })

  it('C14-10: requires learning through the hero skill system', () => {
    assert.ok(definitionSection.includes('学习') && definitionSection.includes('英雄技能系统'), 'missing hero skill learning requirement')
  })

  it('C14-11: defers exact source values to HERO14-SRC1', () => {
    for (const token of ['法力消耗', '冷却时间', '施法范围', '复活单位的 HP', '目标过滤器']) {
      assert.ok(definitionSection.includes(token), `missing deferred value: ${token}`)
    }
    assert.ok(definitionSection.includes('HERO14-SRC1'), 'values must come from HERO14-SRC1')
  })

  it('C14-12: defers corpse / dead-record and Altar revive interaction rules to HERO14-SRC1', () => {
    assert.ok(definitionSection.includes('尸体') || definitionSection.includes('死亡记录'), 'missing corpse/dead-record rule')
    assert.ok(definitionSection.includes('Altar revive') && definitionSection.includes('HERO14-SRC1'), 'missing Altar revive source-boundary deferral')
  })

  it('C14-13: keeps target rules source-boundary owned', () => {
    assert.ok(definitionSection.includes('已死亡的友方单位'), 'must define dead friendly unit intent')
    assert.ok(definitionSection.includes('精确目标集合') && definitionSection.includes('来源边界确认'), 'target filter must remain in source boundary')
  })

  it('C14-14: prevents duplicate resurrection at contract level', () => {
    assert.ok(definitionSection.includes('不能') && definitionSection.includes('重复复活'), 'missing duplicate resurrection constraint')
  })

  it('C14-15: lists learn gate proof obligation', () => {
    assert.ok(proofSection.includes('RP-1') && proofSection.includes('施放按钮'), 'missing learn/button proof obligation')
  })

  it('C14-16: lists cost and cooldown proof obligations', () => {
    assert.ok(proofSection.includes('RP-2') && proofSection.includes('法力'), 'missing mana cost proof')
    assert.ok(proofSection.includes('RP-3') && proofSection.includes('冷却'), 'missing cooldown proof')
  })

  it('C14-17: lists target-set and enemy/building exclusion proof obligations', () => {
    assert.ok(proofSection.includes('RP-4') && proofSection.includes('已死亡友方单位'), 'missing dead friendly target proof')
    assert.ok(proofSection.includes('RP-5') && proofSection.includes('敌方') && proofSection.includes('建筑'), 'missing enemy/building exclusion proof')
  })

  it('C14-18: lists duplicate resurrection and Altar revive interaction proofs', () => {
    assert.ok(proofSection.includes('RP-6') && proofSection.includes('重复复活'), 'missing duplicate proof')
    assert.ok(proofSection.includes('RP-7') && proofSection.includes('Altar revive'), 'missing Altar revive interaction proof')
  })

  it('C14-19: lists Paladin death-record handling proof', () => {
    assert.ok(proofSection.includes('RP-8') && proofSection.includes('Paladin'), 'missing dead Paladin record proof')
  })

  it('C14-20: lists Holy Light / Divine Shield / Devotion Aura non-regression proofs', () => {
    assert.ok(proofSection.includes('Holy Light'), 'missing Holy Light non-regression proof')
    assert.ok(proofSection.includes('Divine Shield'), 'missing Divine Shield non-regression proof')
    assert.ok(proofSection.includes('Devotion Aura'), 'missing Devotion Aura non-regression proof')
  })

  it('C14-21: denies production code, data seed, runtime, command button, and HUD in this task', () => {
    for (const token of ['生产代码修改', 'GameData.ts', 'Game.ts', '命令卡按钮', 'HUD']) {
      assert.ok(deferredSection.includes(token), `missing deferred task boundary: ${token}`)
    }
  })

  it('C14-22: denies AI, assets, other heroes, items, shops, Tavern, second race, air, and multiplayer', () => {
    for (const token of ['AI 英雄策略', '资产', 'Archmage', 'Mountain King', 'Blood Mage', '物品', '商店', 'Tavern', '第二种族', '空军', '多人联机']) {
      assert.ok(deferredSection.includes(token), `missing explicit denial: ${token}`)
    }
  })

  it('C14-23: denies complete Paladin, complete hero system, complete Human, and V9 release', () => {
    for (const token of ['完整圣骑士', '完整英雄系统', '完整人族', 'V9 发布']) {
      assert.ok(deferredSection.includes(token), `missing deferred complete claim: ${token}`)
      assert.ok(contractSection.includes(token), `missing contract denial: ${token}`)
    }
  })

  it('C14-24: current stage declares minimal feedback and keeps ABILITIES.resurrection denied', () => {
    assert.ok(currentSection.includes('HERO14-UX1'), 'missing current UX1 stage marker')
    assert.ok(currentSection.includes('最小可见反馈'), 'missing current feedback statement')
    assert.ok(currentSection.includes('复活术 Lv1'), 'missing learned feedback statement')
    assert.ok(currentSection.includes('刚复活 N 个单位'), 'missing revived-count feedback statement')
    assert.ok(currentSection.includes('不添加') && currentSection.includes('ABILITIES.resurrection'), 'missing ABILITIES denial')
  })

  it('C14-25: current stage allows HUD text feedback but still denies particles, sounds, assets, and AI behavior claims', () => {
    for (const token of ['复活冷却 Ns', '冷却中 N.Ns']) {
      assert.ok(currentSection.includes(token), `missing current implementation token: ${token}`)
    }
    for (const token of ['粒子', '声音', '图标 / 资产', 'AI 行为']) {
      assert.ok(currentSection.includes(token), `missing current denial: ${token}`)
    }
  })

  it('C14-26: GameData.ts has HERO_ABILITY_LEVELS.resurrection data seed (post-DATA1) but no ABILITIES.resurrection', () => {
    const gd = read('src/game/GameData.ts')
    assert.ok(gd.includes('HERO_ABILITY_LEVELS'), 'baseline HERO_ABILITY_LEVELS missing')
    assert.ok(gd.includes('resurrection:'), 'HERO_ABILITY_LEVELS.resurrection must exist post-DATA1')
    const abilitiesStart = gd.indexOf('export const ABILITIES')
    assert.ok(abilitiesStart >= 0, 'missing ABILITIES section')
    const abilitiesEnd = gd.indexOf('// ===== 英雄复活规则', abilitiesStart)
    assert.ok(abilitiesEnd > abilitiesStart, 'missing ABILITIES section end')
    const abilitiesSection = gd.slice(abilitiesStart, abilitiesEnd)
    assert.ok(!/resurrection\s*:/.test(abilitiesSection), 'ABILITIES must not have resurrection')
  })

  it('C14-27: ABILITIES has no resurrection ability entry yet', () => {
    const gd = read('src/game/GameData.ts')
    const abilitiesStart = gd.indexOf('export const ABILITIES')
    assert.ok(abilitiesStart >= 0, 'missing ABILITIES section')
    const abilitiesEnd = gd.indexOf('// ===== 英雄复活规则', abilitiesStart)
    assert.ok(abilitiesEnd > abilitiesStart, 'missing ABILITIES section end')
    const abilitiesSection = gd.slice(abilitiesStart, abilitiesEnd)
    assert.ok(!/resurrection\s*:/.test(abilitiesSection), 'must not add ABILITIES.resurrection in contract task')
  })

  it('C14-28: Game.ts has cast runtime (post-IMPL1C) but no ABILITIES.resurrection', () => {
    const game = read('src/game/Game.ts')
    assert.ok(game.includes('HERO_ABILITY_LEVELS.resurrection'), 'must read resurrection level data')
    assert.ok(game.includes('castResurrection'), 'castResurrection must exist post-IMPL1C')
    assert.ok(!game.includes('ABILITIES.resurrection'), 'must not use ABILITIES.resurrection')
  })

  it('C14-29: Game.ts has Resurrection learn + cast + minimal HUD feedback copy', () => {
    const game = read('src/game/Game.ts')
    assert.ok(game.includes('学习复活'), 'must expose Resurrection learn button')
    assert.ok(game.includes('复活'), 'must expose Resurrection cast button copy')
    assert.ok(game.includes('复活术 Lv'), 'must expose learned level feedback')
    assert.ok(game.includes('刚复活'), 'must expose readable revived count feedback')
    assert.ok(game.includes('复活冷却'), 'must expose cooldown feedback')
    assert.ok(!game.includes('群体复活'), 'must not use 群体复活 wording')
  })

  it('C14-30: existing Altar revive remains distinct from Resurrection ability branch', () => {
    const game = read('src/game/Game.ts')
    assert.ok(game.includes('复活${heroDef.name}'), 'existing HERO9 Altar revive button template should still exist')
    assert.ok(game.includes('startReviveHero') && game.includes('castResurrection'), 'Altar revive and Paladin Resurrection must remain separate methods')
  })
})
