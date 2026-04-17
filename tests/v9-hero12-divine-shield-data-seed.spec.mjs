/**
 * V9 HERO12-DATA1 Divine Shield level data seed static proof.
 *
 * Proves:
 *   1. HERO_ABILITY_LEVELS.divine_shield exists with correct values.
 *   2. Holy Light data unchanged.
 *   3. Post-IMPL1B Game.ts may consume the level table for self-cast runtime, but not ABILITIES.divine_shield.
 *   4. Doc references SRC1 and states DATA1 itself did not add runtime behavior.
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

describe('HERO12-DATA1 Divine Shield level data seed', () => {
  const gd = read('src/game/GameData.ts')
  const doc = read('docs/V9_HERO12_DIVINE_SHIELD_DATA_SEED.zh-CN.md')
  const game = read('src/game/Game.ts')

  // ── 1. divine_shield data exists ──

  it('D12-1: HERO_ABILITY_LEVELS has divine_shield entry', () => {
    assert.ok(gd.includes('divine_shield:'), 'missing divine_shield entry')
  })

  it('D12-2: divine_shield has maxLevel 3', () => {
    const dsSection = gd.substring(gd.indexOf('divine_shield:'))
    assert.ok(dsSection.includes('maxLevel: 3'), 'missing maxLevel: 3')
  })

  // ── 2. Level values match SRC1 ──

  it('D12-3: level 1 — duration 15, cooldown 35, mana 25, range 0, reqHero 1, invulnerability', () => {
    assert.ok(
      gd.includes("level: 1, effectValue: 0, undeadDamage: 0, mana: 25, cooldown: 35, range: 0, requiredHeroLevel: 1, duration: 15, effectType: 'invulnerability'"),
      'level 1 data mismatch'
    )
  })

  it('D12-4: level 2 — duration 30, cooldown 50, mana 25, range 0, reqHero 3, invulnerability', () => {
    assert.ok(
      gd.includes("level: 2, effectValue: 0, undeadDamage: 0, mana: 25, cooldown: 50, range: 0, requiredHeroLevel: 3, duration: 30, effectType: 'invulnerability'"),
      'level 2 data mismatch'
    )
  })

  it('D12-5: level 3 — duration 45, cooldown 65, mana 25, range 0, reqHero 5, invulnerability', () => {
    assert.ok(
      gd.includes("level: 3, effectValue: 0, undeadDamage: 0, mana: 25, cooldown: 65, range: 0, requiredHeroLevel: 5, duration: 45, effectType: 'invulnerability'"),
      'level 3 data mismatch'
    )
  })

  // ── 3. Holy Light data unchanged ──

  it('D12-6: holy_light level 1 still has effectValue 200', () => {
    assert.ok(gd.includes('effectValue: 200, undeadDamage: 100, mana: 65, cooldown: 5, range: 8.0, requiredHeroLevel: 1'), 'holy_light level 1 changed')
  })

  it('D12-7: holy_light level 2 still has effectValue 400', () => {
    assert.ok(gd.includes('effectValue: 400, undeadDamage: 200, mana: 65, cooldown: 5, range: 8.0, requiredHeroLevel: 3'), 'holy_light level 2 changed')
  })

  it('D12-8: holy_light level 3 still has effectValue 600', () => {
    assert.ok(gd.includes('effectValue: 600, undeadDamage: 300, mana: 65, cooldown: 5, range: 8.0, requiredHeroLevel: 5'), 'holy_light level 3 changed')
  })

  // ── 4. No ABILITIES.divine_shield runtime entry ──

  it('D12-9: ABILITIES does not have divine_shield entry', () => {
    const abilitiesSection = gd.substring(gd.indexOf('export const ABILITIES'), gd.indexOf('export const HERO_REVIVE_RULES'))
    assert.ok(!abilitiesSection.includes('divine_shield'), 'ABILITIES must not have divine_shield')
  })

  // ── 5. Runtime boundary after IMPL1B ──

  it('D12-10: Game.ts has staged learn + self-cast runtime, still no ABILITIES.divine_shield or wider hero branch', () => {
    assert.ok(game.includes('学习神圣护盾'), 'IMPL1A should expose the learn surface')
    assert.ok(game.includes('abilityLevels.divine_shield'), 'IMPL1A should store learned level')
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

  // ── 6. Doc references SRC1 and states runtime unchanged ──

  it('D12-11: doc references Task 232 / SRC1', () => {
    assert.ok(doc.includes('Task 232') || doc.includes('SRC1'), 'doc must reference Task 232 or SRC1')
  })

  it('D12-12: doc states runtime unchanged', () => {
    assert.ok(
      doc.includes('运行时不变') || doc.includes('不接运行时') || doc.includes('不消费'),
      'doc must state runtime unchanged'
    )
  })

  it('D12-13: doc denies complete hero system', () => {
    assert.ok(doc.includes('不') && doc.includes('完整英雄系统'), 'must deny complete hero system')
  })

  it('D12-14: doc denies complete Human', () => {
    assert.ok(doc.includes('不') && doc.includes('完整人族'), 'must deny complete Human')
  })

  it('D12-15: doc denies V9 release', () => {
    assert.ok(doc.includes('不') && doc.includes('V9 发布'), 'must deny V9 release')
  })

  it('D12-16: doc lists Divine Shield runtime as deferred', () => {
    assert.ok(doc.includes('IMPL1'), 'must list IMPL1 as deferred')
  })
})
