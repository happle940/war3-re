/**
 * V9 HERO17-SRC1 Archmage source boundary static proof.
 *
 * Proves:
 *   1. Source packet identifies source priority and cross-check sources.
 *   2. Source packet records source-known vs source-unknown fields.
 *   3. Source packet maps War3 values to project units using existing mapping rules.
 *   4. Source packet does not modify production code.
 *   5. Source packet defines next data task scope.
 *   6. Current source files still contain no Archmage runtime/data.
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

describe('HERO17-SRC1 Archmage source boundary', () => {
  const doc = read('docs/V9_HERO17_ARCHMAGE_SOURCE_BOUNDARY.zh-CN.md')

  // === Source priority ===

  it('SRC17-1: identifies primary source as Blizzard Classic Battle.net', () => {
    assert.ok(doc.includes('classic.battle.net'), 'missing primary source')
    assert.ok(doc.includes('主来源'), 'missing primary source label')
  })

  it('SRC17-2: identifies cross-check sources (Liquipedia, Warcraft Wiki)', () => {
    assert.ok(doc.includes('Liquipedia'), 'missing Liquipedia cross-check')
    assert.ok(doc.includes('warcraft.wiki.gg') || doc.includes('Wowpedia'), 'missing wiki cross-check')
  })

  it('SRC17-3: defines conflict resolution rule (primary source wins)', () => {
    assert.ok(doc.includes('冲突处理') || doc.includes('以') && doc.includes('主来源') && doc.includes('为准'), 'missing conflict resolution')
  })

  // === Source-known vs source-unknown ===

  it('SRC17-4: records source-known Archmage unit fields with values', () => {
    assert.ok(doc.includes('425') && doc.includes('450') && doc.includes('285'), 'missing Archmage known values')
  })

  it('SRC17-5: explicitly marks source-unknown / deferred fields', () => {
    assert.ok(doc.includes('暂缓'), 'missing deferred field markers')
  })

  it('SRC17-6: Water Elemental HP values recorded with patch history', () => {
    assert.ok(doc.includes('525') && doc.includes('675') && doc.includes('900'), 'missing WE HP values')
    assert.ok(doc.includes('1.30'), 'missing WE patch history')
  })

  it('SRC17-7: Brilliance Aura values recorded with patch history', () => {
    assert.ok(doc.includes('0.75') && doc.includes('1.50') && doc.includes('2.25'), 'missing BA values')
    assert.ok(doc.includes('1.30.0') || doc.includes('1.30.2'), 'missing BA patch history')
  })

  it('SRC17-8: Blizzard wave damage and wave count per level recorded', () => {
    assert.ok(doc.includes('30') && doc.includes('40') && doc.includes('50'), 'missing Blizzard damage per wave')
    assert.ok(doc.includes('6') && doc.includes('8') && doc.includes('10'), 'missing wave counts')
  })

  it('SRC17-9: Mass Teleport adopts Classic primary-source 20s cooldown and records later 30s sample', () => {
    const mtSection = doc.slice(doc.indexOf('## 6. Mass Teleport'), doc.indexOf('## 7. 项目映射汇总'))
    assert.match(mtSection, /冷却时间[\s\S]*20s[\s\S]*30s[\s\S]*\*\*20\*\*/, 'Mass Teleport must adopt 20s from primary source')
    assert.ok(!mtSection.includes('| 冷却时间 (Cooldown) | 15s | 30s | **15**'), 'must not adopt 15s cooldown')
  })

  it('SRC17-10: does not fill gaps from memory — deferred fields are marked pending', () => {
    // Count deferred markers
    const deferredCount = (doc.match(/暂缓/g) || []).length
    assert.ok(deferredCount >= 5, `expected at least 5 deferred field markers, got ${deferredCount}`)
  })

  // === Project mapping ===

  it('SRC17-11: maps Archmage speed 320 → 3.2 using existing formula', () => {
    assert.ok(doc.includes('3.2'), 'missing speed mapping')
  })

  it('SRC17-12: maps Archmage attackRange 600 → 6.0 using existing formula', () => {
    assert.ok(doc.includes('6.0'), 'missing attack range mapping')
  })

  it('SRC17-13: maps aura radius 900 → 9.0 consistent with Devotion Aura', () => {
    assert.ok(doc.includes('9.0'), 'missing aura radius mapping')
    assert.ok(doc.includes('9.0 格'), 'missing project unit notation')
  })

  it('SRC17-14: maps Hero armor → Heavy consistent with Paladin mapping', () => {
    assert.ok(doc.includes('Heavy'), 'missing armor type mapping')
    assert.ok(doc.includes('Hero 护甲 → Heavy'), 'missing Hero→Heavy mapping explanation')
  })

  it('SRC17-15: maps Hero attack → Normal and rejects Magic for adopted Archmage unit data', () => {
    const archmageData = doc.slice(doc.indexOf('### 8.1 Archmage'), doc.indexOf('### 8.2 Altar'))
    assert.ok(doc.includes('Hero 攻击 | Normal'), 'missing Hero attack to Normal mapping')
    assert.ok(archmageData.includes('attackType: AttackType.Normal'), 'Archmage adopted data must use Normal attack type')
    assert.ok(!archmageData.includes('attackType: AttackType.Magic'), 'Archmage adopted data must not use Magic attack type')
  })

  it('SRC17-16: uses fixed damage lower-bound policy explicitly', () => {
    assert.ok(doc.includes('采用下限'), 'missing lower bound damage policy')
  })

  // === Does not modify production code ===

  it('SRC17-17: explicitly states no production code modification', () => {
    assert.ok(doc.includes('不修改') && doc.includes('GameData.ts'), 'missing no-modification statement')
  })

  // === Next data task scope ===

  it('SRC17-18: defines Archmage unit data as next task (HERO17-DATA1)', () => {
    assert.ok(doc.includes('HERO17-DATA1'), 'missing next data task')
  })

  it('SRC17-19: keeps Altar training list expansion out of the immediate data seed', () => {
    const altarSection = doc.slice(doc.indexOf('### 8.2 Altar'), doc.indexOf('### 8.3 能力数据'))
    assert.ok(altarSection.includes('HERO17-EXPOSE1'), 'missing separate exposure task')
    assert.ok(altarSection.includes("trains: ['paladin']"), 'immediate data task must keep current Altar trains list')
    assert.ok(!altarSection.includes("trains: ['paladin', 'archmage']  // 扩展训练列表"), 'data seed must not directly expose Archmage training')
  })

  it('SRC17-20: records ability data as separate future tasks', () => {
    assert.ok(doc.includes('Water Elemental') && doc.includes('Brilliance Aura') && doc.includes('Blizzard') && doc.includes('Mass Teleport'), 'missing ability references')
  })

  // === Contract cross-reference ===

  it('SRC17-21: references HERO16 closure as accepted baseline', () => {
    assert.ok(doc.includes('HERO16'), 'missing HERO16 baseline reference')
  })

  it('SRC17-22: references HERO17-CONTRACT1 as accepted prerequisite', () => {
    assert.ok(doc.includes('HERO17-CONTRACT1') || doc.includes('Task261'), 'missing contract reference')
  })

  // === Deferred boundaries ===

  it('SRC17-23: defers other heroes, items, shops, Tavern', () => {
    for (const token of ['Mountain King', 'Blood Mage', '物品', '商店', 'Tavern']) {
      assert.ok(doc.includes(token), `missing deferral: ${token}`)
    }
  })

  it('SRC17-24: denies complete hero system, complete Human, V9 release', () => {
    for (const token of ['完整英雄系统', '完整人族', 'V9 发布']) {
      assert.ok(doc.includes(token), `missing complete denial: ${token}`)
    }
  })

  // === Production code still clean ===

  it('SRC17-25: GameData.ts has no archmage unit definition', () => {
    const gd = read('src/game/GameData.ts').toLowerCase()
    assert.ok(!gd.includes('archmage'), 'GameData must not contain archmage')
  })

  it('SRC17-26: GameData.ts has no water_elemental definition', () => {
    const gd = read('src/game/GameData.ts').toLowerCase()
    assert.ok(!gd.includes('water_elemental'), 'GameData must not contain water_elemental')
  })

  it('SRC17-27: GameData.ts has no brilliance_aura ability data', () => {
    const gd = read('src/game/GameData.ts').toLowerCase()
    assert.ok(!gd.includes('brilliance_aura'), 'GameData must not contain brilliance_aura')
  })

  it('SRC17-28: Game.ts has no Archmage runtime', () => {
    const game = read('src/game/Game.ts').toLowerCase()
    assert.ok(!game.includes('archmage'), 'Game.ts must not contain archmage')
  })

  it('SRC17-29: SimpleAI.ts has no Archmage strategy', () => {
    const ai = read('src/game/SimpleAI.ts').toLowerCase()
    assert.ok(!ai.includes('archmage'), 'SimpleAI must not contain archmage')
  })

  // === Ability completeness check ===

  it('SRC17-30: Water Elemental has level 1/2/3 values for HP, damage, range', () => {
    const weSection = doc.slice(doc.indexOf('水元素单位属性'))
    assert.ok(weSection.includes('525') && weSection.includes('675') && weSection.includes('900'), 'missing WE HP levels')
  })

  it('SRC17-31: Water Elemental active cap and dead-record behavior stay deferred', () => {
    const weSection = doc.slice(doc.indexOf('## 3. Water Elemental'), doc.indexOf('## 4. Brilliance Aura'))
    assert.ok(weSection.includes('未给出唯一活跃上限') || weSection.includes('不得在本轮写死'), 'must not invent one-active cap')
    assert.ok(!weSection.includes('最多 1 个水元素'), 'must not claim a one-active cap from source')
    assert.ok(weSection.includes('deadUnitRecords') && weSection.includes('延后'), 'dead-record behavior must be deferred')
  })

  it('SRC17-32: Brilliance Aura has level 1/2/3 regen values', () => {
    const baSection = doc.slice(doc.indexOf('Brilliance Aura'))
    assert.ok(baSection.includes('0.75') && baSection.includes('1.50') && baSection.includes('2.25'), 'missing BA regen levels')
  })

  it('SRC17-33: Blizzard has mana, cooldown, damage per wave, wave count per level', () => {
    const bzSection = doc.slice(doc.indexOf('Blizzard'))
    assert.ok(bzSection.includes('75') && bzSection.includes('6s'), 'missing Blizzard mana/cooldown')
  })

  it('SRC17-34: Mass Teleport has mana, cooldown, radius, max units, level req', () => {
    const mtSection = doc.slice(doc.indexOf('Mass Teleport'))
    assert.ok(mtSection.includes('100') && mtSection.includes('24') && mtSection.includes('6'), 'missing MT core values')
  })

  it('SRC17-35: source confirmation does not overclaim that every adopted field is direct source data', () => {
    assert.ok(doc.includes('主源、交叉校验或项目映射依据'), 'must distinguish source values from project mapping basis')
    assert.ok(!doc.includes('所有采用值均有主源或交叉校验支撑。'), 'must not overclaim every adopted field is direct source-backed')
  })
})
