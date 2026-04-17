/**
 * V9 HERO11-DATA1 Holy Light level data seed static proof.
 *
 * Proves:
 *   1. HERO_ABILITY_LEVELS exists in GameData.ts with correct shape.
 *   2. Holy Light levels 1/2/3 match SRC1 adopted values.
 *   3. Existing ABILITIES.holy_light remains level-1 compatible.
 *   4. Post-IMPL1, Game.ts imports/consumes HERO_ABILITY_LEVELS.
 *   5. Data-seed doc references Task 226 and describes phased runtime state.
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

// ── Extract inline map: "key: value" pairs from a code block ──
function extractInlineMap(src, startMarker, endMarker) {
  const start = src.indexOf(startMarker)
  const end = src.indexOf(endMarker, start + startMarker.length)
  assert.ok(start !== -1, `start marker "${startMarker}" not found`)
  assert.ok(end !== -1, `end marker "${endMarker}" not found`)
  const block = src.substring(start, end)
  const map = {}
  for (const line of block.split('\n')) {
    const m = line.match(/(\w+)\s*:\s*([^,}]+)/)
    if (m) map[m[1].trim()] = m[2].trim()
  }
  return map
}

describe('HERO11-DATA1 Holy Light level data seed', () => {
  const gd = read('src/game/GameData.ts')
  const doc = read('docs/V9_HERO11_HOLY_LIGHT_LEVEL_DATA_SEED.zh-CN.md')
  const game = read('src/game/Game.ts')

  // ── 1. HERO_ABILITY_LEVELS exists with correct shape ──

  it('D1-1: HERO_ABILITY_LEVELS export exists', () => {
    assert.ok(gd.includes('export const HERO_ABILITY_LEVELS'), 'missing HERO_ABILITY_LEVELS export')
  })

  it('D1-2: HeroAbilityLevelDef interface exists', () => {
    assert.ok(gd.includes('export interface HeroAbilityLevelDef'), 'missing HeroAbilityLevelDef interface')
  })

  it('D1-3: HeroAbilityLevelDef has level field', () => {
    assert.ok(gd.includes('level: number'), 'missing level field in HeroAbilityLevelDef')
  })

  it('D1-4: HeroAbilityLevelDef has effectValue field', () => {
    assert.ok(gd.includes('effectValue: number'), 'missing effectValue field')
  })

  it('D1-5: HeroAbilityLevelDef has undeadDamage field', () => {
    assert.ok(gd.includes('undeadDamage: number'), 'missing undeadDamage field')
  })

  it('D1-6: HeroAbilityLevelDef has mana field', () => {
    assert.ok(gd.includes('mana: number'), 'missing mana field')
  })

  it('D1-7: HeroAbilityLevelDef has cooldown field', () => {
    assert.ok(gd.includes('cooldown: number'), 'missing cooldown field')
  })

  it('D1-8: HeroAbilityLevelDef has range field', () => {
    assert.ok(gd.includes('range: number'), 'missing range field')
  })

  it('D1-9: HeroAbilityLevelDef has requiredHeroLevel field', () => {
    assert.ok(gd.includes('requiredHeroLevel: number'), 'missing requiredHeroLevel field')
  })

  it('D1-10: HERO_ABILITY_LEVELS has holy_light entry', () => {
    assert.ok(gd.includes('holy_light:'), 'missing holy_light entry')
  })

  it('D1-11: HERO_ABILITY_LEVELS has maxLevel 3', () => {
    assert.ok(gd.includes('maxLevel: 3'), 'missing maxLevel: 3')
  })

  // ── 2. Holy Light level values match SRC1 ──

  it('D1-12: Level 1 heal 200, undead 100, mana 65, cd 5, range 8.0, reqHero 1', () => {
    assert.ok(
      gd.includes('level: 1, effectValue: 200, undeadDamage: 100, mana: 65, cooldown: 5, range: 8.0, requiredHeroLevel: 1'),
      'level 1 data mismatch'
    )
  })

  it('D1-13: Level 2 heal 400, undead 200, mana 65, cd 5, range 8.0, reqHero 3', () => {
    assert.ok(
      gd.includes('level: 2, effectValue: 400, undeadDamage: 200, mana: 65, cooldown: 5, range: 8.0, requiredHeroLevel: 3'),
      'level 2 data mismatch'
    )
  })

  it('D1-14: Level 3 heal 600, undead 300, mana 65, cd 5, range 8.0, reqHero 5', () => {
    assert.ok(
      gd.includes('level: 3, effectValue: 600, undeadDamage: 300, mana: 65, cooldown: 5, range: 8.0, requiredHeroLevel: 5'),
      'level 3 data mismatch'
    )
  })

  // ── 3. ABILITIES.holy_light unchanged ──

  // Extract the ABILITIES.holy_light block (not HERO_ABILITY_LEVELS.holy_light)
  // by finding 'ABILITIES' first, then 'holy_light' inside it.
  function getAbilitiesHolyLightBlock() {
    const abilitiesStart = gd.indexOf('ABILITIES')
    assert.ok(abilitiesStart !== -1, 'ABILITIES constant not found')
    const hlStart = gd.indexOf('holy_light: {', abilitiesStart)
    // Find closing '},\n}' or '}\n}' for the holy_light entry
    let braceCount = 0
    let hlEnd = hlStart
    for (let i = hlStart; i < gd.length; i++) {
      if (gd[i] === '{') braceCount++
      if (gd[i] === '}') {
        braceCount--
        if (braceCount === 0) { hlEnd = i + 1; break }
      }
    }
    return gd.substring(hlStart, hlEnd)
  }

  it('D1-15: ABILITIES.holy_light effectValue still 200', () => {
    const block = getAbilitiesHolyLightBlock()
    assert.ok(block.includes('effectValue: 200'), 'ABILITIES.holy_light effectValue changed')
  })

  it('D1-16: ABILITIES.holy_light mana still 65', () => {
    const block = getAbilitiesHolyLightBlock()
    assert.ok(block.includes('mana: 65'), 'ABILITIES.holy_light mana changed')
  })

  it('D1-17: ABILITIES.holy_light cooldown still 5', () => {
    const block = getAbilitiesHolyLightBlock()
    assert.ok(block.includes('cooldown: 5'), 'ABILITIES.holy_light cooldown changed')
  })

  it('D1-18: ABILITIES.holy_light range still 8.0', () => {
    const block = getAbilitiesHolyLightBlock()
    assert.ok(block.includes('range: 8.0'), 'ABILITIES.holy_light range changed')
  })

  // ── 4. Game.ts consumes HERO_ABILITY_LEVELS (post-IMPL1) ──

  it('D1-19: Game.ts imports HERO_ABILITY_LEVELS and uses it for Holy Light levels', () => {
    assert.ok(game.includes('HERO_ABILITY_LEVELS'), 'Game.ts must import HERO_ABILITY_LEVELS post-IMPL1')
    assert.ok(game.includes('HERO_ABILITY_LEVELS.holy_light'), 'Game.ts must use holy_light level data')
  })

  // ── 5. Data-seed doc references Task 226 and describes phased runtime state ──

  it('D1-20: doc references Task 226 / SRC1', () => {
    assert.ok(doc.includes('Task 226') || doc.includes('SRC1'), 'doc must reference Task 226 or SRC1')
  })

  it('D1-21: doc describes runtime state', () => {
    assert.ok(
      doc.includes('运行时状态') || doc.includes('运行时不变'),
      'doc must describe runtime state'
    )
  })

  it('D1-22: doc denies complete hero system', () => {
    assert.ok(doc.includes('不') && doc.includes('完整英雄系统'), 'must deny complete hero system')
  })

  it('D1-23: doc denies complete Human', () => {
    assert.ok(doc.includes('不') && doc.includes('完整人族'), 'must deny complete Human')
  })

  it('D1-24: doc denies V9 release', () => {
    assert.ok(doc.includes('不') && doc.includes('V9 发布'), 'must deny V9 release')
  })

  it('D1-25: doc mentions skill spending / learning state', () => {
    assert.ok(doc.includes('技能点消费') || doc.includes('技能学习'), 'missing skill spending deferral')
  })

  it('D1-26: doc lists undead damage runtime as deferred', () => {
    assert.ok(doc.includes('亡灵伤害'), 'missing undead damage deferral')
  })

  it('D1-27: doc lists other Paladin skills as deferred', () => {
    assert.ok(doc.includes('其他圣骑士能力'), 'missing other Paladin skills deferral')
  })

  it('D1-28: doc lists other heroes as deferred', () => {
    assert.ok(doc.includes('其他英雄'), 'missing other heroes deferral')
  })

  it('D1-29: doc mentions command-card learn feedback', () => {
    assert.ok(doc.includes('命令卡'), 'missing command-card deferral')
  })

  it('D1-30: doc lists AI hero strategy as deferred', () => {
    assert.ok(doc.includes('AI'), 'missing AI deferral')
  })
})
