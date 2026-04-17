/**
 * V9 HERO12-CONTRACT1 Paladin Divine Shield branch contract static proof.
 *
 * Proves:
 *   1. Contract references HERO11 predecessors.
 *   2. Defines the branch sequence CONTRACT1 -> SRC1 -> DATA1 -> IMPL1 -> UX1 -> CLOSE1.
 *   3. Defines desired player-visible behavior at contract level.
 *   4. Requires SRC1 source boundary before any data or runtime change.
 *   5. Defines runtime proof obligations for future IMPL1.
 *   6. Explicitly excludes runtime implementation, data seeding, other abilities/heroes.
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

describe('HERO12-CONTRACT1 Paladin Divine Shield branch contract', () => {
  const doc = read('docs/V9_HERO12_DIVINE_SHIELD_CONTRACT.zh-CN.md')

  // ── 1. References HERO11 predecessors ──

  it('C12-1: references HERO11', () => {
    assert.ok(doc.includes('HERO11'), 'missing HERO11 reference')
  })

  it('C12-2: references HERO9 death/revive', () => {
    assert.ok(doc.includes('HERO9'), 'missing HERO9 reference')
  })

  it('C12-3: references HERO10 XP/leveling', () => {
    assert.ok(doc.includes('HERO10'), 'missing HERO10 reference')
  })

  it('C12-4: references Holy Light learning baseline', () => {
    assert.ok(doc.includes('Holy Light') && doc.includes('HERO11'), 'missing Holy Light baseline')
  })

  it('C12-5: references abilityLevels field', () => {
    assert.ok(doc.includes('abilityLevels'), 'missing abilityLevels reference')
  })

  // ── 2. Defines branch sequence ──

  it('C12-6: defines HERO12-SRC1', () => {
    assert.ok(doc.includes('HERO12-SRC1'), 'missing HERO12-SRC1')
  })

  it('C12-7: defines HERO12-DATA1', () => {
    assert.ok(doc.includes('HERO12-DATA1'), 'missing HERO12-DATA1')
  })

  it('C12-8: defines HERO12-IMPL1', () => {
    assert.ok(doc.includes('HERO12-IMPL1'), 'missing HERO12-IMPL1')
  })

  it('C12-9: defines HERO12-UX1', () => {
    assert.ok(doc.includes('HERO12-UX1'), 'missing HERO12-UX1')
  })

  it('C12-10: defines HERO12-CLOSE1', () => {
    assert.ok(doc.includes('HERO12-CLOSE1'), 'missing HERO12-CLOSE1')
  })

  it('C12-11: sequence order is SRC1 → DATA1 → IMPL1 → UX1 → CLOSE1', () => {
    const seqSection = doc.substring(doc.indexOf('安全实现序列'))
    const indices = {
      SRC1: seqSection.indexOf('HERO12-SRC1'),
      DATA1: seqSection.indexOf('HERO12-DATA1'),
      IMPL1: seqSection.indexOf('HERO12-IMPL1'),
      UX1: seqSection.indexOf('HERO12-UX1'),
      CLOSE1: seqSection.indexOf('HERO12-CLOSE1'),
    }
    assert.ok(indices.SRC1 < indices.DATA1, 'SRC1 must precede DATA1')
    assert.ok(indices.DATA1 < indices.IMPL1, 'DATA1 must precede IMPL1')
    assert.ok(indices.IMPL1 < indices.UX1, 'IMPL1 must precede UX1')
    assert.ok(indices.UX1 < indices.CLOSE1, 'UX1 must precede CLOSE1')
  })

  // ── 3. Defines desired player-visible behavior ──

  it('C12-12: defines Divine Shield as temporary invulnerability', () => {
    assert.ok(
      (doc.includes('无敌') || doc.includes('invulnerability') || doc.includes('不受伤害')),
      'must define Divine Shield as temporary invulnerability'
    )
  })

  it('C12-13: defines self-only targeting', () => {
    assert.ok(
      doc.includes('自身') || doc.includes('self'),
      'must define self-only targeting'
    )
  })

  it('C12-14: defines duration-based expiry', () => {
    assert.ok(
      doc.includes('持续时间') || doc.includes('duration'),
      'must define duration-based expiry'
    )
  })

  it('C12-15: defines mana cost and cooldown', () => {
    assert.ok(
      doc.includes('法力') && doc.includes('冷却'),
      'must define mana cost and cooldown'
    )
  })

  it('C12-16: defines skill-point spend mechanism', () => {
    assert.ok(
      doc.includes('技能点') && doc.includes('消费'),
      'must define skill-point spend mechanism'
    )
  })

  it('C12-17: defines death/revive persistence', () => {
    assert.ok(
      doc.includes('复活') && doc.includes('保留'),
      'must define death/revive persistence'
    )
  })

  // ── 4. Requires SRC1 before data/runtime ──

  it('C12-18: states numeric values must come from SRC1 source boundary', () => {
    assert.ok(
      doc.includes('SRC1') && (doc.includes('来源边界') || doc.includes('source boundary')),
      'must require SRC1 before data/runtime'
    )
  })

  it('C12-19: does not contain hardcoded Divine Shield numeric values in contract', () => {
    // Contract should not hardcode values like "150/300/450 damage" or specific durations
    // It should say values come from SRC1
    assert.ok(
      !doc.includes('effectValue:') && !doc.includes('duration:'),
      'contract must not hardcode Divine Shield numeric values'
    )
  })

  // ── 5. Defines runtime proof obligations ──

  it('C12-20: defines runtime proof obligations for IMPL1', () => {
    assert.ok(
      doc.includes('证明义务') || doc.includes('proof obligation') || doc.includes('证明项'),
      'must define runtime proof obligations'
    )
  })

  it('C12-21: lists learn gate proof obligation', () => {
    assert.ok(doc.includes('学习门槛') || doc.includes('requiredHeroLevel'), 'missing learn gate obligation')
  })

  it('C12-22: lists self-target proof obligation', () => {
    assert.ok(doc.includes('自身目标') || doc.includes('self-target'), 'missing self-target obligation')
  })

  it('C12-23: lists duration expiry proof obligation', () => {
    assert.ok(doc.includes('持续时间到期') || doc.includes('duration expiry'), 'missing duration expiry obligation')
  })

  it('C12-24: lists damage interaction proof obligation', () => {
    assert.ok(doc.includes('伤害交互') || doc.includes('damage'), 'missing damage interaction obligation')
  })

  it('C12-25: lists Holy Light non-regression proof obligation', () => {
    assert.ok(
      doc.includes('Holy Light') && (doc.includes('不退化') || doc.includes('不变')),
      'missing Holy Light non-regression obligation'
    )
  })

  // ── 6. Denies complete hero system, complete Human, V9 release ──

  it('C12-26: denies complete hero system', () => {
    assert.ok(doc.includes('不') && doc.includes('完整英雄系统'), 'must deny complete hero system')
  })

  it('C12-27: denies complete Human', () => {
    assert.ok(doc.includes('不') && doc.includes('完整人族'), 'must deny complete Human')
  })

  it('C12-28: denies V9 release', () => {
    assert.ok(doc.includes('不') && doc.includes('V9 发布'), 'must deny V9 release')
  })

  it('C12-29: denies runtime implementation', () => {
    assert.ok(doc.includes('不') && doc.includes('运行时行为'), 'must deny runtime implementation')
  })

  // ── 7. Deferred items listed ──

  it('C12-30: lists Devotion Aura as deferred', () => {
    assert.ok(doc.includes('Devotion Aura') || doc.includes('光环'), 'missing Devotion Aura deferral')
  })

  it('C12-31: lists Resurrection ultimate as deferred', () => {
    assert.ok(doc.includes('Resurrection') || doc.includes('终极'), 'missing Resurrection deferral')
  })

  it('C12-32: lists other heroes as deferred', () => {
    assert.ok(
      (doc.includes('Archmage') || doc.includes('大法师')) &&
      (doc.includes('Mountain King') || doc.includes('山丘之王')),
      'missing other heroes deferral'
    )
  })

  it('C12-33: lists AI hero strategy as deferred', () => {
    assert.ok(doc.includes('AI'), 'missing AI hero strategy deferral')
  })

  it('C12-34: lists items, Tavern, shop as deferred', () => {
    assert.ok(doc.includes('物品') && doc.includes('酒馆') && doc.includes('商店'), 'missing items/Tavern/shop')
  })

  it('C12-35: lists air, second race, multiplayer as deferred', () => {
    assert.ok(
      (doc.includes('空军') || doc.includes('air')) &&
      (doc.includes('第二种族') || doc.includes('second race')) &&
      (doc.includes('多人') || doc.includes('multiplayer')),
      'missing air/race/multiplayer deferral'
    )
  })

  // ── 8. Production code not modified ──

  it('C12-36: GameData.ts still has HERO_ABILITY_LEVELS', () => {
    const gd = read('src/game/GameData.ts')
    assert.ok(gd.includes('HERO_ABILITY_LEVELS'), 'GameData must still have HERO_ABILITY_LEVELS')
  })

  it('C12-37: Game.ts still has Holy Light skill-spend runtime', () => {
    const gt = read('src/game/Game.ts')
    assert.ok(gt.includes('HERO_ABILITY_LEVELS'), 'Game.ts must still have HERO_ABILITY_LEVELS import')
    assert.ok(gt.includes('abilityLevels'), 'Game.ts must still have abilityLevels')
  })
})
