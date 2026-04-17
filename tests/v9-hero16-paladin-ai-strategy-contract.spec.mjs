/**
 * V9 HERO16-CONTRACT1 Paladin AI hero strategy boundary static proof.
 *
 * Proves:
 *   1. Contract references accepted HERO8-HERO15 closure proofs.
 *   2. Contract states current SimpleAI boundary truth (stage-aware: original baseline
 *      truth with annotations that AI1-AI5 have since been implemented).
 *   3. Contract defines phased future sequence (AI1-AI5).
 *   4. Contract states Devotion Aura is passive and needs no active cast strategy.
 *   5. Contract forbids other heroes, items, shops, Tavern, new assets, etc.
 *   6. SimpleAI.ts delegates ability math to Game.ts wrappers (no formula duplication).
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

describe('HERO16-CONTRACT1 Paladin AI hero strategy boundary', () => {
  const doc = read('docs/V9_HERO16_PALADIN_AI_STRATEGY_CONTRACT.zh-CN.md')

  // === Baseline references ===

  it('C16-1: references HERO8 minimal hero runtime closure', () => {
    assert.ok(doc.includes('HERO8') && doc.includes('v9-hero8-minimal-hero-runtime-closure'), 'missing HERO8 closure reference')
  })

  it('C16-2: references HERO9 death/revive closure', () => {
    assert.ok(doc.includes('HERO9') && doc.includes('v9-hero9-death-revive-closure'), 'missing HERO9 closure reference')
  })

  it('C16-3: references HERO10 XP/leveling closure', () => {
    assert.ok(doc.includes('HERO10') && doc.includes('v9-hero10-xp-leveling-closure'), 'missing HERO10 closure reference')
  })

  it('C16-4: references HERO11 skill learning closure', () => {
    assert.ok(doc.includes('HERO11') && doc.includes('v9-hero11-holy-light-skill-learning-closure'), 'missing HERO11 closure reference')
  })

  it('C16-5: references HERO12 Divine Shield closure', () => {
    assert.ok(doc.includes('HERO12') && doc.includes('v9-hero12-divine-shield-closure'), 'missing HERO12 closure reference')
  })

  it('C16-6: references HERO13 Devotion Aura closure', () => {
    assert.ok(doc.includes('HERO13') && doc.includes('v9-hero13-devotion-aura-closure'), 'missing HERO13 closure reference')
  })

  it('C16-7: references HERO14 Resurrection closure', () => {
    assert.ok(doc.includes('HERO14') && doc.includes('v9-hero14-resurrection-closure'), 'missing HERO14 closure reference')
  })

  it('C16-8: references HERO15 Paladin minimal kit closure', () => {
    assert.ok(doc.includes('HERO15') && doc.includes('v9-hero15-paladin-minimal-kit-closure'), 'missing HERO15 closure reference')
  })

  // === Current boundary truth ===

  it('C16-9: states baseline had no Altar build strategy (now AI1 implemented)', () => {
    assert.ok(doc.includes('不建造 Altar'), 'missing no Altar build baseline')
  })

  it('C16-10: states baseline had no Paladin summon strategy (now AI1 implemented)', () => {
    assert.ok(doc.includes('不召唤 Paladin'), 'missing no Paladin summon baseline')
  })

  it('C16-11: states baseline had no skill learning strategy (now AI2 implemented)', () => {
    assert.ok(doc.includes('不学习 Paladin 技能'), 'missing no skill learning baseline')
  })

  it('C16-12: states baseline had no Holy Light cast strategy (now AI3 implemented)', () => {
    assert.ok(doc.includes('不施放 Holy Light'), 'missing no Holy Light baseline')
  })

  it('C16-13: states baseline had no Divine Shield cast strategy (now AI4 implemented)', () => {
    assert.ok(doc.includes('不施放 Divine Shield'), 'missing no Divine Shield baseline')
  })

  it('C16-14: states baseline had no Resurrection cast strategy (now AI5 implemented)', () => {
    assert.ok(doc.includes('不施放 Resurrection'), 'missing no Resurrection baseline')
  })

  // === Phased sequence ===

  it('C16-15: defines HERO16-AI1 Altar build + Paladin summon readiness', () => {
    assert.ok(doc.includes('HERO16-AI1') && doc.includes('Altar') && doc.includes('召唤 Paladin'), 'missing AI1 phase')
  })

  it('C16-16: AI1 includes economy and uniqueness constraints', () => {
    assert.ok(doc.includes('经济') && doc.includes('唯一性'), 'missing AI1 economy/uniqueness constraints')
  })

  it('C16-17: defines HERO16-AI2 skill-learning priority', () => {
    assert.ok(doc.includes('HERO16-AI2') && doc.includes('技能学习'), 'missing AI2 phase')
  })

  it('C16-18: AI2 places Holy Light first in default priority', () => {
    assert.ok(doc.includes('Holy Light') && doc.includes('第一优先'), 'missing Holy Light first priority')
  })

  it('C16-19: defines HERO16-AI3 Holy Light defensive cast', () => {
    assert.ok(doc.includes('HERO16-AI3') && doc.includes('Holy Light') && doc.includes('治疗'), 'missing AI3 phase')
  })

  it('C16-20: AI3 limits to injured friendly units, mana, cooldown, range', () => {
    assert.ok(doc.includes('受伤友方单位') && doc.includes('法力充足') && doc.includes('冷却'), 'missing AI3 constraints')
  })

  it('C16-21: defines HERO16-AI4 Divine Shield self-preservation', () => {
    assert.ok(doc.includes('HERO16-AI4') && doc.includes('Divine Shield') && doc.includes('自保'), 'missing AI4 phase')
  })

  it('C16-22: AI4 limits to alive Paladin, learned level, low HP / combat pressure, mana, cooldown', () => {
    assert.ok(doc.includes('存活') && doc.includes('法力充足') && doc.includes('冷却'), 'missing AI4 constraints')
  })

  it('C16-23: defines HERO16-AI5 Resurrection cast', () => {
    assert.ok(doc.includes('HERO16-AI5') && doc.includes('Resurrection'), 'missing AI5 phase')
  })

  it('C16-24: AI5 limits to learned ultimate, level/mana/cooldown, dead-unit records, minimum corpse count', () => {
    assert.ok(doc.includes('deadUnitRecords') && doc.includes('法力') && doc.includes('冷却'), 'missing AI5 constraints')
  })

  it('C16-25: defines strict sequential order constraint AI1→AI2→AI3→AI4→AI5', () => {
    const phases = ['HERO16-AI1', 'HERO16-AI2', 'HERO16-AI3', 'HERO16-AI4', 'HERO16-AI5']
    const orderLine = doc.split('\n').find(line => phases.every(phase => line.includes(phase)))
    assert.ok(orderLine, 'missing order constraint line')
    for (let i = 0; i < phases.length - 1; i++) {
      assert.ok(orderLine.indexOf(phases[i]) < orderLine.indexOf(phases[i + 1]), `${phases[i]} must precede ${phases[i + 1]}`)
    }
  })

  it('C16-26: requires each predecessor stage to be accepted before next starts', () => {
    assert.ok(doc.includes('accepted'), 'missing accepted predecessor constraint')
  })

  // === Devotion Aura ===

  it('C16-27: states Devotion Aura is passive and needs no active cast strategy', () => {
    assert.ok(doc.includes('被动技能') && doc.includes('不需要主动施放策略'), 'missing Devotion Aura passive statement')
  })

  it('C16-28: states AI benefits from Devotion Aura automatically once learned', () => {
    assert.ok(doc.includes('自动获得'), 'missing auto-benefit statement')
  })

  // === Forbidden / deferred ===

  it('C16-29: defers other Human heroes AI, items, shops, Tavern, assets', () => {
    for (const token of ['Archmage', 'Mountain King', '物品', '商店', 'Tavern', '图标', '粒子', '声音']) {
      assert.ok(doc.includes(token), `missing deferral: ${token}`)
    }
  })

  it('C16-30: defers other three Human heroes AI', () => {
    for (const hero of ['Archmage', 'Mountain King', 'Blood Mage']) {
      assert.ok(doc.includes(hero), `missing hero deferral: ${hero}`)
    }
  })

  it('C16-31: defers items, shops, Tavern', () => {
    for (const token of ['物品', '商店', 'Tavern']) {
      assert.ok(doc.includes(token), `missing deferral: ${token}`)
    }
  })

  it('C16-32: defers new visual/audio assets', () => {
    assert.ok(doc.includes('图标') && doc.includes('声音') && doc.includes('粒子'), 'missing visual/audio deferral')
  })

  it('C16-33: defers omniscient enemy cheating', () => {
    assert.ok(doc.includes('全知') || doc.includes('作弊'), 'missing omniscient cheating deferral')
  })

  it('C16-34: denies complete AI strategy, hero system, Human, V9 release', () => {
    for (const token of ['完整 AI 策略', '完整英雄系统', '完整人族', 'V9 发布']) {
      assert.ok(doc.includes(token), `missing complete denial: ${token}`)
    }
  })

  // === Production code boundary ===

  it('C16-35: SimpleAI.ts contains the bounded Paladin AI chain', () => {
    const ai = read('src/game/SimpleAI.ts')
    for (const token of ['Summon Paladin', 'AI Paladin skill-learning priority', 'AI Paladin defensive Holy Light', 'AI Paladin Divine Shield self-preservation', 'AI Paladin Resurrection']) {
      assert.ok(ai.includes(token), `missing bounded Paladin AI marker: ${token}`)
    }
  })

  it('C16-36: Holy Light AI delegates cast math through Game.ts wrapper', () => {
    const ai = read('src/game/SimpleAI.ts')
    const game = read('src/game/Game.ts')
    assert.ok(ai.includes('this.ctx.castHolyLight(paladin, target)'), 'SimpleAI must delegate Holy Light cast')
    assert.ok(game.includes('aiCastHolyLight(caster: Unit, target: Unit): boolean'), 'Game.ts must expose AI Holy Light wrapper')
    assert.ok(game.includes('return this.castHolyLight(caster, target)'), 'AI Holy Light wrapper must delegate to castHolyLight')
  })

  it('C16-37: Divine Shield AI delegates cast math through Game.ts wrapper', () => {
    const ai = read('src/game/SimpleAI.ts')
    const game = read('src/game/Game.ts')
    assert.ok(ai.includes('this.ctx.castDivineShield(paladin)'), 'SimpleAI must delegate Divine Shield cast')
    assert.ok(game.includes('aiCastDivineShield(caster: Unit): boolean'), 'Game.ts must expose AI Divine Shield wrapper')
    assert.ok(game.includes('return this.castDivineShield(caster)'), 'AI Divine Shield wrapper must delegate to castDivineShield')
  })

  it('C16-38: Devotion Aura remains passive and has no active cast wrapper', () => {
    const ai = read('src/game/SimpleAI.ts')
    const game = read('src/game/Game.ts')
    assert.ok(ai.includes("'devotion_aura'"), 'SimpleAI should learn Devotion Aura in the skill order')
    assert.ok(!ai.includes('castDevotionAura'), 'SimpleAI must not actively cast passive Devotion Aura')
    assert.ok(!game.includes('aiCastDevotionAura'), 'Game.ts must not expose an active Devotion Aura wrapper')
  })

  it('C16-39: Resurrection AI delegates cast math through Game.ts wrapper', () => {
    const ai = read('src/game/SimpleAI.ts')
    const game = read('src/game/Game.ts')
    assert.ok(ai.includes('this.ctx.castResurrection(paladin)'), 'SimpleAI must delegate Resurrection cast')
    assert.ok(game.includes('aiCastResurrection(caster: Unit): boolean'), 'Game.ts must expose AI Resurrection wrapper')
    assert.ok(game.includes('return this.castResurrection(caster)'), 'AI Resurrection wrapper must delegate to castResurrection')
  })
})
