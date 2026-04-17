/**
 * V9 HERO17-CONTRACT1 Archmage branch boundary static proof.
 *
 * Proves:
 *   1. Contract references accepted HERO16 closure as baseline.
 *   2. Contract states Archmage is not implemented in GameData, Game, SimpleAI, etc.
 *   3. Contract defines phased future sequence (source -> data -> abilities -> closure).
 *   4. Contract forbids writing values without source boundary.
 *   5. Contract forbids runtime, models, icons, particles, sounds, items, shops, etc.
 *   6. Current source files still do not contain Archmage runtime or data.
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

describe('HERO17-CONTRACT1 Archmage branch boundary', () => {
  const doc = read('docs/V9_HERO17_ARCHMAGE_BRANCH_CONTRACT.zh-CN.md')

  // === Baseline references ===

  it('C17-1: references HERO16 Paladin AI strategy closure as baseline', () => {
    assert.ok(doc.includes('HERO16') && doc.includes('v9-hero16-paladin-ai-strategy-closure'), 'missing HERO16 closure reference')
  })

  it('C17-2: references HERO8-HERO15 Paladin branch closures', () => {
    assert.ok(doc.includes('HERO8') && doc.includes('HERO15'), 'missing HERO8-HERO15 range')
  })

  // === Current boundary truth ===

  it('C17-3: states Archmage is not implemented in GameData.ts', () => {
    assert.ok(doc.includes('GameData.ts') && doc.includes('不包含') && doc.includes('archmage'), 'missing GameData boundary')
  })

  it('C17-4: states Archmage is not implemented in Game.ts', () => {
    assert.ok(doc.includes('Game.ts') && doc.includes('不包含 Archmage'), 'missing Game.ts boundary')
  })

  it('C17-5: states Archmage is not implemented in SimpleAI.ts', () => {
    assert.ok(doc.includes('SimpleAI.ts') && doc.includes('Archmage'), 'missing SimpleAI boundary')
  })

  it('C17-6: states no command card, visual or audio assets for Archmage', () => {
    assert.ok(doc.includes('命令卡') && doc.includes('模型') && doc.includes('图标'), 'missing command card/visual boundary')
  })

  it('C17-7: states Altar of Kings only trains Paladin', () => {
    assert.ok(doc.includes('Altar of Kings') && doc.includes('Paladin'), 'missing Altar boundary')
  })

  it('C17-8: states this task does not change any boundary', () => {
    assert.ok(doc.includes('本任务不改变以上任何一项'), 'missing no-change statement')
  })

  // === Ability inventory ===

  it('C17-9: lists Water Elemental as summon ability', () => {
    assert.ok(doc.includes('Water Elemental') && doc.includes('召唤'), 'missing Water Elemental')
  })

  it('C17-10: lists Brilliance Aura as passive aura', () => {
    assert.ok(doc.includes('Brilliance Aura') && doc.includes('被动'), 'missing Brilliance Aura')
  })

  it('C17-11: lists Blizzard as AOE channel ability', () => {
    assert.ok(doc.includes('Blizzard') && doc.includes('AOE'), 'missing Blizzard')
  })

  it('C17-12: lists Mass Teleport as ultimate', () => {
    assert.ok(doc.includes('Mass Teleport') && doc.includes('终极'), 'missing Mass Teleport')
  })

  // === Phased sequence ===

  it('C17-13: defines source boundary as first phase', () => {
    assert.ok(doc.includes('HERO17-SRC1') && doc.includes('来源边界'), 'missing source boundary phase')
  })

  it('C17-14: defines data seed as second phase', () => {
    assert.ok(doc.includes('HERO17-DATA1') && doc.includes('数据种子'), 'missing data seed phase')
  })

  it('C17-15: defines Water Elemental branch (HERO18)', () => {
    assert.ok(doc.includes('HERO18') && doc.includes('Water Elemental'), 'missing WE branch')
  })

  it('C17-16: defines Brilliance Aura branch (HERO19)', () => {
    assert.ok(doc.includes('HERO19') && doc.includes('Brilliance Aura'), 'missing BA branch')
  })

  it('C17-17: defines Blizzard branch (HERO20)', () => {
    assert.ok(doc.includes('HERO20') && doc.includes('Blizzard'), 'missing BZ branch')
  })

  it('C17-18: defines Mass Teleport branch (HERO21)', () => {
    assert.ok(doc.includes('HERO21') && doc.includes('Mass Teleport'), 'missing MT branch')
  })

  it('C17-19: defines closure (HERO22)', () => {
    assert.ok(doc.includes('HERO22') && doc.includes('收口'), 'missing closure phase')
  })

  it('C17-20: requires each predecessor stage to be accepted', () => {
    assert.ok(doc.includes('accepted'), 'missing accepted predecessor constraint')
  })

  // === Forbidden ===

  it('C17-21: forbids writing values without source boundary', () => {
    assert.ok(doc.includes('无来源不写值'), 'missing source-first rule')
  })

  it('C17-22: forbids skipping phases', () => {
    assert.ok(doc.includes('不跳阶段'), 'missing no-skip rule')
  })

  it('C17-23: forbids runtime behavior, models, icons, particles, sounds', () => {
    for (const token of ['模型', '图标', '粒子', '声音']) {
      assert.ok(doc.includes(token), `missing visual/audio deferral: ${token}`)
    }
  })

  it('C17-24: forbids items, shops, Tavern', () => {
    for (const token of ['物品', '商店', 'Tavern']) {
      assert.ok(doc.includes(token), `missing system deferral: ${token}`)
    }
  })

  it('C17-25: forbids Mountain King and Blood Mage', () => {
    for (const hero of ['Mountain King', 'Blood Mage']) {
      assert.ok(doc.includes(hero), `missing hero deferral: ${hero}`)
    }
  })

  it('C17-26: denies complete hero system, complete Human, V9 release', () => {
    for (const token of ['完整英雄系统', '完整人族', 'V9 发布']) {
      assert.ok(doc.includes(token), `missing complete denial: ${token}`)
    }
  })

  // === Reuse principles ===

  it('C17-27: states reuse of hero framework from HERO10', () => {
    assert.ok(doc.includes('XP') && doc.includes('技能点') && doc.includes('复用'), 'missing hero framework reuse')
  })

  it('C17-28: states reuse of AIContext delegation pattern from HERO16', () => {
    assert.ok(doc.includes('AIContext') && doc.includes('委托'), 'missing AI delegation reuse')
  })

  it('C17-29: states passive aura pattern from Devotion Aura reusable for Brilliance Aura', () => {
    assert.ok(doc.includes('Devotion Aura') && doc.includes('Brilliance Aura') && doc.includes('复用'), 'missing aura reuse statement')
  })

  // === Production code boundary checks ===

  it('C17-30: GameData.ts has no archmage unit definition', () => {
    const gd = read('src/game/GameData.ts').toLowerCase()
    assert.ok(!gd.includes('archmage'), 'GameData must not contain archmage')
  })

  it('C17-31: GameData.ts has no water_elemental definition', () => {
    const gd = read('src/game/GameData.ts').toLowerCase()
    assert.ok(!gd.includes('water_elemental'), 'GameData must not contain water_elemental')
  })

  it('C17-32: GameData.ts has no brilliance_aura ability data', () => {
    const gd = read('src/game/GameData.ts').toLowerCase()
    assert.ok(!gd.includes('brilliance_aura'), 'GameData must not contain brilliance_aura')
  })

  it('C17-33: GameData.ts has no blizzard ability data', () => {
    const gd = read('src/game/GameData.ts').toLowerCase()
    // Avoid matching the word "blizzard" in comments - check for blizzard_ ability key pattern
    assert.ok(!gd.includes("'blizzard'") && !gd.includes('"blizzard"'), 'GameData must not contain blizzard ability key')
  })

  it('C17-34: GameData.ts has no mass_teleport ability data', () => {
    const gd = read('src/game/GameData.ts').toLowerCase()
    assert.ok(!gd.includes('mass_teleport'), 'GameData must not contain mass_teleport')
  })

  it('C17-35: Game.ts has no Archmage runtime', () => {
    const game = read('src/game/Game.ts').toLowerCase()
    assert.ok(!game.includes('archmage'), 'Game.ts must not contain archmage')
  })

  it('C17-36: SimpleAI.ts has no Archmage strategy', () => {
    const ai = read('src/game/SimpleAI.ts').toLowerCase()
    assert.ok(!ai.includes('archmage'), 'SimpleAI must not contain archmage')
  })
})
