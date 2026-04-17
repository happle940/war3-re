/**
 * V9 HERO13-DATA1 Devotion Aura level data seed static proof.
 *
 * Proves:
 *   1. HERO_ABILITY_LEVELS.devotion_aura exists with correct values.
 *   2. Holy Light and Divine Shield data unchanged.
 *   3. Game.ts consumes devotion_aura only after IMPL1 as passive runtime data.
 *   4. ABILITIES has no devotion_aura entry.
 *   5. Doc references SRC1 and keeps ABILITIES/UI out of the data seed.
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

function sectionBetween(text, start, end) {
  const startIndex = text.indexOf(start)
  assert.ok(startIndex >= 0, `missing start marker: ${start}`)
  const endIndex = text.indexOf(end, startIndex + start.length)
  assert.ok(endIndex > startIndex, `missing end marker: ${end}`)
  return text.slice(startIndex, endIndex)
}

describe('HERO13-DATA1 Devotion Aura level data seed', () => {
  const gd = read('src/game/GameData.ts')
  const doc = read('docs/V9_HERO13_DEVOTION_AURA_DATA_SEED.zh-CN.md')
  const game = read('src/game/Game.ts')
  const daSection = sectionBetween(gd, 'devotion_aura:', '// ===== 建造菜单')
  const abilitiesSection = sectionBetween(gd, 'export const ABILITIES', 'export const HERO_REVIVE_RULES')

  // ── 1. devotion_aura data exists ──

  it('D13-1: HERO_ABILITY_LEVELS has devotion_aura entry', () => {
    assert.ok(gd.includes('devotion_aura:'), 'missing devotion_aura entry')
  })

  it('D13-2: devotion_aura has maxLevel 3', () => {
    assert.ok(daSection.includes('maxLevel: 3'), 'missing maxLevel: 3')
  })

  // ── 2. Level values match SRC1 ──

  it('D13-3: level 1 — armorBonus 1.5, auraRadius 9.0, mana 0, cooldown 0, reqHero 1, armor_aura', () => {
    assert.ok(daSection.includes('level: 1'), 'missing level 1')
    assert.ok(daSection.includes('armorBonus: 1.5'), 'missing level 1 armorBonus 1.5')
    assert.ok(daSection.includes('auraRadius: 9.0'), 'missing auraRadius 9.0')
    assert.ok(daSection.includes('mana: 0') && daSection.includes('cooldown: 0'), 'level 1 must be passive')
    assert.ok(daSection.includes('requiredHeroLevel: 1'), 'missing requiredHeroLevel 1')
  })

  it('D13-4: level 2 — armorBonus 3, auraRadius 9.0, reqHero 3', () => {
    assert.ok(daSection.includes('level: 2'), 'missing level 2')
    assert.ok(daSection.includes('armorBonus: 3,'), 'missing level 2 armorBonus 3')
    assert.ok(daSection.includes('requiredHeroLevel: 3'), 'missing requiredHeroLevel 3')
  })

  it('D13-5: level 3 — armorBonus 4.5, auraRadius 9.0, reqHero 5', () => {
    assert.ok(daSection.includes('level: 3'), 'missing level 3')
    assert.ok(daSection.includes('armorBonus: 4.5'), 'missing level 3 armorBonus 4.5')
    assert.ok(daSection.includes('requiredHeroLevel: 5'), 'missing requiredHeroLevel 5')
  })

  it('D13-6: all levels have mana 0 and cooldown 0', () => {
    const manaZeros = daSection.match(/mana: 0/g)
    const cooldownZeros = daSection.match(/cooldown: 0/g)
    assert.ok(manaZeros && manaZeros.length >= 3, 'must have mana: 0 for all 3 levels')
    assert.ok(cooldownZeros && cooldownZeros.length >= 3, 'must have cooldown: 0 for all 3 levels')
  })

  it('D13-7: effectType is armor_aura for all levels', () => {
    const armorAuraCount = daSection.match(/armor_aura/g)
    assert.ok(armorAuraCount && armorAuraCount.length >= 3, 'must have effectType armor_aura for all 3 levels')
  })

  // ── 3. Holy Light and Divine Shield data unchanged ──

  it('D13-8: holy_light level 1 still has effectValue 200', () => {
    assert.ok(gd.includes('effectValue: 200, undeadDamage: 100, mana: 65'), 'holy_light level 1 changed')
  })

  it('D13-9: divine_shield level 1 still has duration 15 and cooldown 35', () => {
    assert.ok(gd.includes('mana: 25, cooldown: 35, range: 0, requiredHeroLevel: 1, duration: 15'), 'divine_shield level 1 changed')
  })

  // ── 4. ABILITIES unchanged ──

  it('D13-10: ABILITIES does not have devotion_aura entry', () => {
    assert.ok(!abilitiesSection.includes('devotion_aura'), 'ABILITIES must not have devotion_aura')
  })

  // ── 5. Game.ts runtime boundary (post-IMPL2) ──

  it('D13-11: Game.ts consumes devotion_aura as passive runtime data and learn surface after IMPL2', () => {
    assert.ok(game.includes('updateDevotionAura'), 'Game.ts must host minimal passive aura runtime post-IMPL1')
    assert.ok(game.includes('HERO_ABILITY_LEVELS.devotion_aura'), 'Game.ts must read HERO_ABILITY_LEVELS.devotion_aura')
    assert.ok(game.includes('armorBonus'), 'Game.ts must read armorBonus from data')
    assert.ok(game.includes('auraRadius'), 'Game.ts must read auraRadius from data')
    assert.ok(game.includes('学习虔诚光环'), 'Game.ts must expose Devotion Aura learn surface post-IMPL2')
    assert.ok(game.includes('虔诚光环 Lv'), 'UX1 must show DA level in HUD')
    assert.ok(game.includes('虔诚光环 +'), 'UX1 must show aura armor bonus on affected units')
    assert.ok(!game.includes('castDevotionAura'), 'Game.ts must not add Devotion Aura cast method')
  })

  // ── 6. Doc references ──

  it('D13-12: doc references Task 239 / SRC1', () => {
    assert.ok(doc.includes('Task 239') || doc.includes('SRC1'), 'doc must reference Task 239 or SRC1')
  })

  it('D13-13: doc states runtime unchanged', () => {
    assert.ok(doc.includes('运行时不变') || doc.includes('不消费'), 'doc must state runtime unchanged')
    assert.ok(doc.includes('Area of Effect 90') && doc.includes('9.0'), 'doc must preserve source-to-project radius mapping')
  })

  it('D13-14: doc denies complete Paladin', () => {
    assert.ok(doc.includes('完整圣骑士'), 'must deny complete Paladin')
  })

  it('D13-15: doc denies complete hero system', () => {
    assert.ok(doc.includes('完整英雄系统'), 'must deny complete hero system')
  })

  it('D13-16: doc denies complete Human', () => {
    assert.ok(doc.includes('完整人族'), 'must deny complete Human')
  })

  it('D13-17: doc denies V9 release', () => {
    assert.ok(doc.includes('V9 发布'), 'must deny V9 release')
  })
})
