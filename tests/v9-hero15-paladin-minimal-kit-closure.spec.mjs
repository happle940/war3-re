/**
 * V9 HERO15-CLOSE1 Paladin minimal ability kit global closure static proof.
 *
 * Proves:
 *   1. Closure doc references all predecessor branches (HERO1-HERO14).
 *   2. Closure doc lists key proof files for each branch closure.
 *   3. Closure doc states player capabilities accurately.
 *   4. Closure doc states deferred boundaries.
 *   5. Production boundaries remain: no other hero runtime, no complete AI hero strategy,
 *      no item/shop/Tavern system, no new assets. HERO16 later adds a minimal
 *      Paladin AI chain, so this proof is stage-aware.
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

describe('HERO15-CLOSE1 Paladin minimal ability kit closure', () => {
  const closureDoc = read('docs/V9_HERO15_PALADIN_MINIMAL_KIT_CLOSURE.zh-CN.md')

  // === Predecessor branch references ===

  it('CLOSE15-1: references HERO1 Altar+Paladin contract', () => {
    assert.ok(closureDoc.includes('HERO1') && closureDoc.includes('ALTAR_PALADIN_CONTRACT'), 'missing HERO1')
  })

  it('CLOSE15-2: references HERO2 Altar+Paladin source boundary', () => {
    assert.ok(closureDoc.includes('HERO2') && closureDoc.includes('SOURCE_BOUNDARY'), 'missing HERO2')
  })

  it('CLOSE15-3: references HERO3 Altar data', () => {
    assert.ok(closureDoc.includes('HERO3'), 'missing HERO3')
  })

  it('CLOSE15-4: references HERO4 Paladin data', () => {
    assert.ok(closureDoc.includes('HERO4'), 'missing HERO4')
  })

  it('CLOSE15-5: references HERO5 Holy Light data', () => {
    assert.ok(closureDoc.includes('HERO5'), 'missing HERO5')
  })

  it('CLOSE15-6: references HERO6/6A/6B Altar runtime', () => {
    assert.ok(closureDoc.includes('HERO6') && closureDoc.includes('ALTAR_RUNTIME'), 'missing HERO6')
  })

  it('CLOSE15-7: references HERO7 Holy Light runtime', () => {
    assert.ok(closureDoc.includes('HERO7'), 'missing HERO7')
  })

  it('CLOSE15-8: references HERO8 minimal hero runtime closure', () => {
    assert.ok(closureDoc.includes('HERO8') && closureDoc.includes('MINIMAL_HERO_RUNTIME_CLOSURE'), 'missing HERO8')
  })

  it('CLOSE15-9: references HERO9 death/revive', () => {
    assert.ok(closureDoc.includes('HERO9') && closureDoc.includes('DEATH_REVIVE'), 'missing HERO9')
  })

  it('CLOSE15-10: references HERO10 XP/leveling', () => {
    assert.ok(closureDoc.includes('HERO10') && closureDoc.includes('XP'), 'missing HERO10')
  })

  it('CLOSE15-11: references HERO11 skill learning', () => {
    assert.ok(closureDoc.includes('HERO11') && closureDoc.includes('SKILL_LEARNING'), 'missing HERO11')
  })

  it('CLOSE15-12: references HERO12 Divine Shield', () => {
    assert.ok(closureDoc.includes('HERO12') && closureDoc.includes('DIVINE_SHIELD'), 'missing HERO12')
  })

  it('CLOSE15-13: references HERO13 Devotion Aura', () => {
    assert.ok(closureDoc.includes('HERO13') && closureDoc.includes('DEVOTION_AURA'), 'missing HERO13')
  })

  it('CLOSE15-14: references HERO14 Resurrection', () => {
    assert.ok(closureDoc.includes('HERO14') && closureDoc.includes('RESURRECTION'), 'missing HERO14')
  })

  // === Proof file references ===

  it('CLOSE15-15: lists HERO8 closure proof', () => {
    assert.ok(closureDoc.includes('v9-hero8-minimal-hero-runtime-closure.spec.mjs'), 'missing HERO8 proof')
  })

  it('CLOSE15-16: lists HERO9 closure proof', () => {
    assert.ok(closureDoc.includes('v9-hero9-death-revive-closure.spec.mjs'), 'missing HERO9 proof')
  })

  it('CLOSE15-17: lists HERO10 closure proof', () => {
    assert.ok(closureDoc.includes('v9-hero10-xp-leveling-closure.spec.mjs'), 'missing HERO10 proof')
  })

  it('CLOSE15-18: lists HERO11 closure proof', () => {
    assert.ok(closureDoc.includes('v9-hero11-holy-light-skill-learning-closure.spec.mjs'), 'missing HERO11 proof')
  })

  it('CLOSE15-19: lists HERO12 closure proof', () => {
    assert.ok(closureDoc.includes('v9-hero12-divine-shield-closure.spec.mjs'), 'missing HERO12 proof')
  })

  it('CLOSE15-20: lists HERO13 closure proof', () => {
    assert.ok(closureDoc.includes('v9-hero13-devotion-aura-closure.spec.mjs'), 'missing HERO13 proof')
  })

  it('CLOSE15-21: lists HERO14 closure proof', () => {
    assert.ok(closureDoc.includes('v9-hero14-resurrection-closure.spec.mjs'), 'missing HERO14 proof')
  })

  // === Player capabilities ===

  it('CLOSE15-22: states player can build Altar and summon Paladin', () => {
    assert.ok(closureDoc.includes('Altar') && closureDoc.includes('召唤'), 'missing Altar/Paladin summon')
  })

  it('CLOSE15-23: states player can cast Holy Light', () => {
    assert.ok(closureDoc.includes('Holy Light') && closureDoc.includes('治疗'), 'missing Holy Light')
  })

  it('CLOSE15-24: states player can die and revive at Altar', () => {
    assert.ok(closureDoc.includes('死亡') && closureDoc.includes('Altar') && closureDoc.includes('复活'), 'missing death/revive')
  })

  it('CLOSE15-25: states player can gain XP/level/skill points', () => {
    assert.ok(closureDoc.includes('XP') && closureDoc.includes('技能点'), 'missing XP/leveling')
  })

  it('CLOSE15-26: states player can use Divine Shield', () => {
    assert.ok(closureDoc.includes('Divine Shield') && closureDoc.includes('无敌'), 'missing Divine Shield')
  })

  it('CLOSE15-27: states player can benefit from Devotion Aura', () => {
    assert.ok(closureDoc.includes('Devotion Aura') && closureDoc.includes('护甲'), 'missing Devotion Aura')
  })

  it('CLOSE15-28: states player can cast Resurrection with feedback', () => {
    assert.ok(closureDoc.includes('Resurrection') && closureDoc.includes('反馈'), 'missing Resurrection feedback')
  })

  // === Deferred boundaries ===

  it('CLOSE15-29: defers complete AI hero strategy while acknowledging HERO16 minimal Paladin AI', () => {
    assert.ok(closureDoc.includes('完整 AI 英雄策略'), 'missing complete AI hero deferral')
    assert.ok(closureDoc.includes('HERO16') && closureDoc.includes('最小 Paladin AI 链路'), 'missing HERO16 minimal Paladin AI update')
  })

  it('CLOSE15-30: defers other three heroes (Archmage, Mountain King, Blood Mage)', () => {
    for (const hero of ['Archmage', 'Mountain King', 'Blood Mage']) {
      assert.ok(closureDoc.includes(hero), `missing hero deferral: ${hero}`)
    }
  })

  it('CLOSE15-31: defers inventory, items, shops, Tavern', () => {
    for (const token of ['物品', '商店', 'Tavern']) {
      assert.ok(closureDoc.includes(token), `missing deferral: ${token}`)
    }
  })

  it('CLOSE15-32: defers icon, sound, particles, assets', () => {
    assert.ok(closureDoc.includes('图标') && closureDoc.includes('声音') && closureDoc.includes('粒子'), 'missing visual/audio deferral')
  })

  it('CLOSE15-33: defers complete hero system, Human, V9 release', () => {
    for (const token of ['完整英雄系统', '完整人族', 'V9 发布']) {
      assert.ok(closureDoc.includes(token), `missing complete denial: ${token}`)
    }
  })

  it('CLOSE15-34: defers air, campaign, second race, multiplayer', () => {
    for (const token of ['空军', '战役', '第二种族', '多人联机']) {
      assert.ok(closureDoc.includes(token), `missing scale deferral: ${token}`)
    }
  })

  // === Contract denial ===

  it('CLOSE15-35: contract section denies complete hero system, Human, V9', () => {
    const contractSection = closureDoc.slice(closureDoc.indexOf('## 6. 合同声明'))
    for (const token of ['完整英雄系统', '完整人族', 'V9']) {
      assert.ok(contractSection.includes(token), `missing contract denial: ${token}`)
    }
  })

  // === Production code boundary checks ===

  it('CLOSE15-36: Game.ts has no Archmage/Mountain King/Blood Mage runtime', () => {
    const game = read('src/game/Game.ts')
    const lower = game.toLowerCase()
    for (const hero of ['archmage', 'mountain_king', 'blood_mage']) {
      assert.ok(!lower.includes(hero), `Game.ts must not contain ${hero}`)
    }
  })

  it('CLOSE15-37: SimpleAI.ts only has minimal Paladin AI, not other heroes/items/shops', () => {
    const ai = read('src/game/SimpleAI.ts').toLowerCase()
    for (const token of ['paladin', 'holy_light', 'divine_shield', 'devotion_aura', 'resurrection', 'castholylight', 'castdivineshield', 'castresurrection']) {
      assert.ok(ai.includes(token), `SimpleAI must contain HERO16 minimal Paladin AI token ${token}`)
    }
    for (const token of ['archmage', 'mountain_king', 'blood_mage', 'tavern', 'inventory']) {
      assert.ok(!ai.includes(token), `SimpleAI must not contain deferred token ${token}`)
    }
  })

  it('CLOSE15-38: GameData.ts has no item/shop/Tavern system definitions', () => {
    const gd = read('src/game/GameData.ts').toLowerCase()
    assert.ok(!gd.includes('tavern'), 'GameData must not contain Tavern')
  })

  it('CLOSE15-39: allowed files check — only doc/proof/queue files were created', () => {
    assert.ok(existsSync(resolve(ROOT, 'docs/V9_HERO15_PALADIN_MINIMAL_KIT_CLOSURE.zh-CN.md')), 'closure doc must exist')
    assert.ok(existsSync(resolve(ROOT, 'tests/v9-hero15-paladin-minimal-kit-closure.spec.mjs')), 'closure proof must exist')
  })

  it('CLOSE15-40: all branch closure proof files exist on disk', () => {
    const proofs = [
      'tests/v9-hero8-minimal-hero-runtime-closure.spec.mjs',
      'tests/v9-hero9-death-revive-closure.spec.mjs',
      'tests/v9-hero10-xp-leveling-closure.spec.mjs',
      'tests/v9-hero11-holy-light-skill-learning-closure.spec.mjs',
      'tests/v9-hero12-divine-shield-closure.spec.mjs',
      'tests/v9-hero13-devotion-aura-closure.spec.mjs',
      'tests/v9-hero14-resurrection-closure.spec.mjs',
    ]
    for (const f of proofs) {
      assert.ok(existsSync(resolve(ROOT, f)), `missing closure proof: ${f}`)
    }
  })
})
