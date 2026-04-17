/**
 * V9 HERO12-SRC1 Divine Shield source boundary static proof.
 *
 * Proves:
 *   1. Source boundary doc exists with correct source hierarchy.
 *   2. Adopted Divine Shield values match Blizzard Classic data.
 *   3. Behavior rules documented (invulnerability, cannot deactivate, duration expiry).
 *   4. Project mapping describes runtime mapping without implementing it.
 *   5. Post-DATA1/IMPL1B production code follows the source boundary without widening scope.
 *   6. Source boundary does not claim runtime or release completion.
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

describe('HERO12-SRC1 Divine Shield source boundary', () => {
  const doc = read('docs/V9_HERO12_DIVINE_SHIELD_SOURCE_BOUNDARY.zh-CN.md')

  // ── 1. Doc exists with source hierarchy ──

  it('SRC12-1: doc exists and references HERO12-CONTRACT1 / Task 231', () => {
    assert.ok(doc.includes('Task 231') && doc.includes('CONTRACT1'), 'missing CONTRACT1 reference')
  })

  it('SRC12-2: source hierarchy uses Blizzard Classic as primary source', () => {
    assert.ok(doc.includes('classic.battle.net'), 'missing Blizzard Classic primary source')
  })

  it('SRC12-3: mentions Liquipedia as cross-check', () => {
    assert.ok(doc.includes('liquipedia') || doc.includes('Liquipedia'), 'missing Liquipedia cross-check')
  })

  // ── 2. Adopted values match Blizzard Classic ──

  it('SRC12-4: level 1 duration 15, cooldown 35, mana 25, reqHero 1', () => {
    assert.ok(
      doc.includes('15s') && doc.includes('35s') && doc.includes('25') && doc.includes('所需英雄等级') && doc.includes('1'),
      'level 1 values mismatch'
    )
  })

  it('SRC12-5: level 2 duration 30, cooldown 50, mana 25, reqHero 3', () => {
    assert.ok(
      doc.includes('30s') && doc.includes('50s') && doc.includes('所需英雄等级') && doc.includes('3'),
      'level 2 values mismatch'
    )
  })

  it('SRC12-6: level 3 duration 45, cooldown 65, mana 25, reqHero 5', () => {
    assert.ok(
      doc.includes('45s') && doc.includes('65s') && doc.includes('所需英雄等级') && doc.includes('5'),
      'level 3 values mismatch'
    )
  })

  it('SRC12-7: mana cost is 25 across all levels', () => {
    const tableSection = doc.substring(doc.indexOf('采纳值'))
    const manaRows = tableSection.match(/25/g)
    assert.ok(manaRows && manaRows.length >= 3, 'mana must be 25 for all 3 levels')
  })

  it('SRC12-8: target is Self / Personal for all levels', () => {
    assert.ok(
      doc.includes('Self') || doc.includes('自身'),
      'must specify Self/Personal targeting'
    )
  })

  it('SRC12-9: effect is Invulnerability', () => {
    assert.ok(
      doc.includes('Invulnerability') || doc.includes('无敌'),
      'must specify Invulnerability effect'
    )
  })

  // ── 3. Behavior rules documented ──

  it('SRC12-10: states Divine Shield is invulnerability spell', () => {
    assert.ok(
      doc.includes('无敌') || doc.includes('invulnerability') || doc.includes('Invulnerability'),
      'must define invulnerability behavior'
    )
  })

  it('SRC12-11: states Divine Shield cannot be deactivated', () => {
    assert.ok(
      doc.includes('不可') && (doc.includes('取消') || doc.includes('关闭') || doc.includes('deactivate')),
      'must state cannot be deactivated'
    )
  })

  it('SRC12-12: states duration expiry restores normal state', () => {
    assert.ok(
      doc.includes('到期') || doc.includes('恢复'),
      'must state duration expiry behavior'
    )
  })

  // ── 4. Project mapping describes runtime mapping ──

  it('SRC12-13: project mapping uses null or self-cast marker for range', () => {
    assert.ok(
      doc.includes('null') || doc.includes('自身施放') || doc.includes('self-cast'),
      'must describe self-cast range mapping'
    )
  })

  it('SRC12-14: target rule described as self-only', () => {
    assert.ok(
      doc.includes('self') || doc.includes('Self') || doc.includes('自身'),
      'must describe self-only targeting'
    )
  })

  it('SRC12-15: effect described as temporary invulnerability and excludes substitute effects', () => {
    assert.ok(
      doc.includes('临时无敌') || doc.includes('invulnerability') || doc.includes('Invulnerability'),
      'must describe as temporary invulnerability'
    )
    assert.ok(
      doc.includes('不是护甲加成') &&
        doc.includes('治疗') &&
        doc.includes('伤害吸收') &&
        doc.includes('光环') &&
        doc.includes('眩晕'),
      'must explicitly exclude armor/heal/damage-absorb/aura/stun substitutions'
    )
  })

  // ── 5. Production boundary after DATA1/IMPL1B ──

  it('SRC12-16: states DATA1/IMPL1 remain closed', () => {
    assert.ok(
      doc.includes('不修改') || doc.includes('DATA1') && doc.includes('IMPL1'),
      'must state no runtime changes'
    )
  })

  it('SRC12-17: GameData.ts has divine_shield in HERO_ABILITY_LEVELS (post-DATA1) but not in ABILITIES', () => {
    const gd = read('src/game/GameData.ts')
    const abilitiesSection = gd.substring(gd.indexOf('export const ABILITIES'), gd.indexOf('export const HERO_REVIVE_RULES'))
    assert.ok(!abilitiesSection.includes('divine_shield'), 'ABILITIES must not have divine_shield runtime entry')
    assert.ok(gd.includes('HERO_ABILITY_LEVELS') && gd.includes('divine_shield:'), 'HERO_ABILITY_LEVELS must have divine_shield post-DATA1')
  })

  it('SRC12-18: Game.ts exposes staged learn + self-cast runtime, still no ABILITIES.divine_shield or wider hero branch', () => {
    const game = read('src/game/Game.ts')
    assert.ok(game.includes('学习神圣护盾'), 'IMPL1A should expose the learn surface')
    assert.ok(game.includes('abilityLevels.divine_shield'), 'IMPL1A should store learned Divine Shield level')
    assert.ok(game.includes('castDivineShield'), 'IMPL1B should expose self-cast runtime')
    assert.ok(game.includes('HERO_ABILITY_LEVELS.divine_shield'), 'IMPL1B should read the hero level table')
    assert.ok(game.includes('divineShieldUntil'), 'IMPL1B should track active duration')
    assert.ok(game.includes('divineShieldCooldownUntil'), 'IMPL1B should track cooldown duration')
    const forbiddenTokens = [
      'isInvulnerable',
      'invulnerabilityUntil',
      'ABILITIES.divine_shield',
      'Devotion Aura',
      'Resurrection',
      'archmage',
      'mountain_king',
      'blood_mage',
    ]
    for (const token of forbiddenTokens) {
      assert.ok(!game.includes(token), `Game.ts must not contain out-of-scope Divine Shield token: ${token}`)
    }
  })

  it('SRC12-18b: Divine Shield data seed keeps invulnerability as data only', () => {
    const gd = read('src/game/GameData.ts')
    const dsSection = gd.substring(gd.indexOf('divine_shield:'), gd.indexOf('// ===== 建造菜单'))
    assert.ok(dsSection.includes("effectType: 'invulnerability'"), 'divine_shield must be invulnerability data')
    assert.ok(dsSection.includes('effectValue: 0') && dsSection.includes('undeadDamage: 0'), 'non-numeric effect placeholders must be 0')
  })

  // ── 6. Does not claim runtime or release completion ──

  it('SRC12-19: denies complete hero system', () => {
    assert.ok(doc.includes('不') && doc.includes('完整英雄系统'), 'must deny complete hero system')
  })

  it('SRC12-20: denies complete Human', () => {
    assert.ok(doc.includes('不') && doc.includes('完整人族'), 'must deny complete Human')
  })

  it('SRC12-21: denies V9 release', () => {
    assert.ok(doc.includes('不') && doc.includes('V9 发布'), 'must deny V9 release')
  })

  // ── 7. Deferred items ──

  it('SRC12-22: lists Devotion Aura as deferred', () => {
    assert.ok(doc.includes('Devotion Aura') || doc.includes('光环'), 'missing Devotion Aura deferral')
  })

  it('SRC12-23: lists Resurrection as deferred', () => {
    assert.ok(doc.includes('Resurrection') || doc.includes('终极'), 'missing Resurrection deferral')
  })

  it('SRC12-24: lists other heroes as deferred', () => {
    assert.ok(
      (doc.includes('Archmage') || doc.includes('大法师')) &&
      (doc.includes('Mountain King') || doc.includes('山丘之王')),
      'missing other heroes deferral'
    )
  })
})
