/**
 * V9 HERO11-CONTRACT1 Hero skill learning / Holy Light level branch contract.
 *
 * Static proof that the contract is well-formed and bounded.
 * Does NOT verify runtime behavior.
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

describe('HERO11-CONTRACT1 skill learning contract', () => {
  const doc = read('docs/V9_HERO11_SKILL_LEARNING_CONTRACT.zh-CN.md')

  // ── 1. References accepted HERO7-HERO10 ──
  it('C11-1: references HERO7', () => {
    assert.ok(doc.includes('HERO7'), 'missing HERO7 reference')
  })

  it('C11-2: references HERO9', () => {
    assert.ok(doc.includes('HERO9'), 'missing HERO9 reference')
  })

  it('C11-3: references HERO10', () => {
    assert.ok(doc.includes('HERO10'), 'missing HERO10 reference')
  })

  it('C11-4: mentions Holy Light level 1 baseline', () => {
    assert.ok(doc.includes('圣光') && doc.includes('等级 1'), 'missing Holy Light level 1 baseline')
  })

  // ── 2. Skill points visible but not spendable ──
  it('C11-5: states skill points are visible but not currently spendable', () => {
    assert.ok(
      doc.includes('技能点') && doc.includes('可见') && doc.includes('没有消费路径'),
      'must state skill points are visible but not spendable'
    )
  })

  it('C11-6: mentions heroSkillPoints field', () => {
    assert.ok(doc.includes('heroSkillPoints'), 'missing heroSkillPoints field mention')
  })

  // ── 3. Defines explicit spend, Holy Light target, revive persistence, regression ──
  it('C11-7: defines explicit spend through command-card or hero panel', () => {
    assert.ok(
      doc.includes('命令卡') || doc.includes('command-card'),
      'must define explicit spend mechanism'
    )
  })

  it('C11-8: spending one point increases ability level by 1', () => {
    assert.ok(
      doc.includes('能力等级') && doc.includes('1'),
      'must define one point = one level'
    )
  })

  it('C11-9: Holy Light is the first target', () => {
    assert.ok(
      doc.includes('Holy Light') && doc.includes('第一个'),
      'must state Holy Light is first target'
    )
  })

  it('C11-10: learned ability level must survive death and revive', () => {
    assert.ok(
      doc.includes('复活') && doc.includes('保留') && doc.includes('等级'),
      'must state ability levels survive revive'
    )
  })

  it('C11-11: defines HERO7 Holy Light regression boundary', () => {
    assert.ok(doc.includes('HERO7') && doc.includes('回归'), 'missing HERO7 regression boundary')
  })

  it('C11-12: defines HERO9 death/revive regression boundary', () => {
    assert.ok(doc.includes('HERO9') && doc.includes('回归'), 'missing HERO9 regression boundary')
  })

  it('C11-13: defines HERO10 XP/leveling regression boundary', () => {
    assert.ok(doc.includes('HERO10') && doc.includes('回归'), 'missing HERO10 regression boundary')
  })

  // ── 4. Implementation sequence ──
  it('C11-14: defines HERO11-SRC1', () => {
    assert.ok(doc.includes('HERO11-SRC1'), 'missing HERO11-SRC1')
  })

  it('C11-15: defines HERO11-DATA1', () => {
    assert.ok(doc.includes('HERO11-DATA1'), 'missing HERO11-DATA1')
  })

  it('C11-16: defines HERO11-IMPL1', () => {
    assert.ok(doc.includes('HERO11-IMPL1'), 'missing HERO11-IMPL1')
  })

  it('C11-17: defines HERO11-UX1', () => {
    assert.ok(doc.includes('HERO11-UX1'), 'missing HERO11-UX1')
  })

  it('C11-18: defines HERO11-CLOSE1', () => {
    assert.ok(doc.includes('HERO11-CLOSE1'), 'missing HERO11-CLOSE1')
  })

  it('C11-19: sequence order is SRC1 → DATA1 → IMPL1 → UX1 → CLOSE1', () => {
    const seqSection = doc.substring(doc.indexOf('安全实现序列'))
    const indices = {
      SRC1: seqSection.indexOf('HERO11-SRC1'),
      DATA1: seqSection.indexOf('HERO11-DATA1'),
      IMPL1: seqSection.indexOf('HERO11-IMPL1'),
      UX1: seqSection.indexOf('HERO11-UX1'),
      CLOSE1: seqSection.indexOf('HERO11-CLOSE1'),
    }
    assert.ok(indices.SRC1 < indices.DATA1, 'SRC1 must precede DATA1')
    assert.ok(indices.DATA1 < indices.IMPL1, 'DATA1 must precede IMPL1')
    assert.ok(indices.IMPL1 < indices.UX1, 'IMPL1 must precede UX1')
    assert.ok(indices.UX1 < indices.CLOSE1, 'UX1 must precede CLOSE1')
  })

  // ── 5. Denies complete hero system, complete Human, V9 release ──
  it('C11-20: denies complete hero system', () => {
    assert.ok(doc.includes('不') && doc.includes('完整英雄系统'), 'must deny complete hero system')
  })

  it('C11-21: denies complete Human', () => {
    assert.ok(doc.includes('不') && doc.includes('完整人族'), 'must deny complete Human')
  })

  it('C11-22: denies V9 release', () => {
    assert.ok(doc.includes('不') && doc.includes('V9 发布'), 'must deny V9 release')
  })

  // ── 6. Deferred items listed ──
  it('C11-23: lists Divine Shield as deferred', () => {
    assert.ok(doc.includes('Divine Shield') || doc.includes('神圣护盾'), 'missing Divine Shield deferral')
  })

  it('C11-24: lists Devotion Aura as deferred', () => {
    assert.ok(doc.includes('Devotion Aura') || doc.includes('光环'), 'missing Devotion Aura deferral')
  })

  it('C11-25: lists Resurrection ultimate as deferred', () => {
    assert.ok(doc.includes('Resurrection') || doc.includes('终极'), 'missing Resurrection deferral')
  })

  it('C11-26: lists other heroes as deferred', () => {
    assert.ok(
      (doc.includes('Archmage') || doc.includes('大法师')) &&
      (doc.includes('Mountain King') || doc.includes('山丘之王')),
      'missing other heroes deferral'
    )
  })

  it('C11-27: lists enemy hero XP as deferred', () => {
    assert.ok(doc.includes('敌方英雄 XP') || doc.includes('enemy hero XP'), 'missing enemy hero XP deferral')
  })

  it('C11-28: lists creep XP as deferred', () => {
    assert.ok(doc.includes('野怪') || doc.includes('creep'), 'missing creep XP deferral')
  })

  it('C11-29: lists items, Tavern, shop as deferred', () => {
    assert.ok(doc.includes('物品') && doc.includes('酒馆') && doc.includes('商店'), 'missing items/Tavern/shop')
  })

  it('C11-30: lists AI hero strategy as deferred', () => {
    assert.ok(doc.includes('AI'), 'missing AI hero strategy deferral')
  })

  it('C11-31: lists air, second race, multiplayer as deferred', () => {
    assert.ok(
      (doc.includes('空军') || doc.includes('air')) &&
      (doc.includes('第二种族') || doc.includes('second race')) &&
      (doc.includes('多人') || doc.includes('multiplayer')),
      'missing air/race/multiplayer deferral'
    )
  })

  // ── 7. Production code not modified (content expectations) ──
  it('C11-32: GameData.ts still exists', () => {
    const gd = read('src/game/GameData.ts')
    assert.ok(gd.includes('HERO_XP_RULES'), 'GameData must still have HERO_XP_RULES')
  })

  it('C11-33: Game.ts still exists', () => {
    const gt = read('src/game/Game.ts')
    assert.ok(gt.includes('HERO_XP_RULES'), 'Game.ts must still have HERO_XP_RULES import')
  })

  // ── 8. HERO10 closure still exists ──
  it('C11-34: HERO10 closure doc still exists', () => {
    const closure = read('docs/V9_HERO10_XP_LEVELING_CLOSURE.zh-CN.md')
    assert.ok(closure.length > 200, 'HERO10 closure must still exist')
  })
})
