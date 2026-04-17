/**
 * V9 HERO13-CLOSE1 Devotion Aura branch closure inventory static proof.
 *
 * Proves:
 *   1. Closure doc references all HERO13 slice docs and proof files.
 *   2. Closure doc lists what the player can now do.
 *   3. Closure doc denies Resurrection, other heroes, AI, items, shops, Tavern,
 *      assets, second race, air, multiplayer, complete Paladin, complete hero system,
 *      complete Human, and V9 release.
 *   4. Production code still reads from HERO_ABILITY_LEVELS, not ABILITIES.devotion_aura.
 *   5. No cast method, no command-card cast button for DA (passive only).
 *   6. Existing HERO13 contract/source/data proofs remain valid.
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

function sectionBetween(text, startHeading, endHeading) {
  const start = text.indexOf(startHeading)
  assert.ok(start >= 0, `missing section: ${startHeading}`)
  const end = text.indexOf(endHeading, start + startHeading.length)
  assert.ok(end > start, `missing section end: ${endHeading}`)
  return text.slice(start, end)
}

describe('HERO13-CLOSE1 Devotion Aura branch closure inventory', () => {
  const closure = read('docs/V9_HERO13_DEVOTION_AURA_CLOSURE.zh-CN.md')
  const gd = read('src/game/GameData.ts')
  const game = read('src/game/Game.ts')
  const capabilitySection = sectionBetween(closure, '## 3. 玩家当前能力', '## 4. 明确延后')
  const deferredSection = sectionBetween(closure, '## 4. 明确延后', '## 5. 合同声明')
  const contractSection = closure.slice(closure.indexOf('## 5. 合同声明'))

  // ── 1. References all slice docs ──

  it('CL13-0: uses closure wording, not package wording', () => {
    assert.ok(closure.includes('分支收口盘点'), 'closure title must use 收口盘点')
    assert.ok(!closure.includes('分支配包盘点'), 'closure title must not use 配包盘点')
  })

  it('CL13-1: references CONTRACT1 (Task 238)', () => {
    assert.ok(closure.includes('CONTRACT1') && closure.includes('Task 238'), 'missing CONTRACT1 reference')
  })

  it('CL13-2: references SRC1 (Task 239)', () => {
    assert.ok(closure.includes('SRC1') && closure.includes('Task 239'), 'missing SRC1 reference')
  })

  it('CL13-3: references DATA1 (Task 240)', () => {
    assert.ok(closure.includes('DATA1') && closure.includes('Task 240'), 'missing DATA1 reference')
  })

  it('CL13-4: references IMPL1 (Task 241)', () => {
    assert.ok(closure.includes('IMPL1') && closure.includes('Task 241'), 'missing IMPL1 reference')
  })

  it('CL13-5: references IMPL2 (Task 242)', () => {
    assert.ok(closure.includes('IMPL2') && closure.includes('Task 242'), 'missing IMPL2 reference')
  })

  it('CL13-6: references UX1 (Task 243)', () => {
    assert.ok(closure.includes('UX1') && closure.includes('Task 243'), 'missing UX1 reference')
  })

  // ── 2. References proof files ──

  it('CL13-7: lists contract proof file', () => {
    assert.ok(closure.includes('v9-hero13-devotion-aura-contract.spec.mjs'), 'missing contract proof file')
  })

  it('CL13-8: lists source boundary proof file', () => {
    assert.ok(closure.includes('v9-hero13-devotion-aura-source-boundary.spec.mjs'), 'missing source proof file')
  })

  it('CL13-9: lists data seed proof file', () => {
    assert.ok(closure.includes('v9-hero13-devotion-aura-data-seed.spec.mjs'), 'missing data proof file')
  })

  it('CL13-10: lists passive runtime proof file', () => {
    assert.ok(closure.includes('v9-hero13-devotion-aura-runtime.spec.ts'), 'missing runtime proof file')
  })

  it('CL13-11: lists learn runtime proof file', () => {
    assert.ok(closure.includes('v9-hero13-devotion-aura-learn-runtime.spec.ts'), 'missing learn proof file')
  })

  it('CL13-12: lists visible feedback proof file', () => {
    assert.ok(closure.includes('v9-hero13-devotion-aura-visible-feedback.spec.ts'), 'missing feedback proof file')
  })

  it('CL13-12b: lists closure proof file', () => {
    assert.ok(closure.includes('v9-hero13-devotion-aura-closure.spec.mjs'), 'missing closure proof file')
  })

  // ── 3. Player capabilities ──

  it('CL13-13: states player can learn Devotion Aura', () => {
    assert.ok(closure.includes('学习') && closure.includes('Devotion Aura'), 'must state learn capability')
  })

  it('CL13-14: states passive armor aura for self and friendly non-building units', () => {
    assert.ok(closure.includes('被动') && closure.includes('护甲'), 'must state passive armor aura')
    assert.ok(closure.includes('自身') || closure.includes('自我'), 'must state self-apply')
    assert.ok(closure.includes('友方') && closure.includes('非建筑'), 'must state friendly non-building targets')
  })

  it('CL13-15: states HUD shows learned level', () => {
    assert.ok(capabilitySection.includes('虔诚光环 Lv'), 'must reference DA level HUD text')
  })

  it('CL13-16: states HUD shows aura bonus on affected units', () => {
    assert.ok(capabilitySection.includes('虔诚光环 +') && capabilitySection.includes('护甲'), 'must reference aura bonus HUD text')
  })

  it('CL13-17: states no mana, no cooldown, no cast button', () => {
    assert.ok(closure.includes('无') && (closure.includes('施放按钮') || closure.includes('无需')), 'must state no cast button')
    assert.ok(closure.includes('无魔力') || closure.includes('无') && closure.includes('魔力消耗'), 'must state no mana')
    assert.ok(closure.includes('无冷却') || closure.includes('无') && closure.includes('冷却'), 'must state no cooldown')
  })

  it('CL13-18: states aura removed on death', () => {
    assert.ok(closure.includes('死亡') && closure.includes('失去'), 'must state aura removal on death')
  })

  it('CL13-19: states no stacking', () => {
    assert.ok(closure.includes('不叠加') || closure.includes('不重复累计'), 'must state no stacking')
  })

  it('CL13-20: states enemy unaffected', () => {
    assert.ok(closure.includes('敌方') && closure.includes('不受'), 'must state enemy unaffected')
  })

  // ── 4. Explicit denials ──

  it('CL13-21: denies Resurrection', () => {
    assert.ok(deferredSection.includes('Resurrection'), 'must deny Resurrection in deferred section')
  })

  it('CL13-22: denies other heroes', () => {
    assert.ok(deferredSection.includes('Archmage') && deferredSection.includes('Mountain King'), 'must deny other heroes in deferred section')
  })

  it('CL13-23: denies AI hero strategy', () => {
    assert.ok(deferredSection.includes('AI 英雄策略'), 'must deny AI strategy in deferred section')
  })

  it('CL13-24: denies items/shops/Tavern', () => {
    assert.ok(deferredSection.includes('物品') && deferredSection.includes('商店') && deferredSection.includes('Tavern'), 'must deny items/shops/Tavern in deferred section')
  })

  it('CL13-25: denies assets', () => {
    assert.ok(deferredSection.includes('资产') || deferredSection.includes('美术'), 'must deny assets in deferred section')
  })

  it('CL13-26: denies second race', () => {
    assert.ok(deferredSection.includes('第二种族'), 'must deny second race in deferred section')
  })

  it('CL13-27: denies air', () => {
    assert.ok(deferredSection.includes('空军'), 'must deny air in deferred section')
  })

  it('CL13-28: denies multiplayer', () => {
    assert.ok(deferredSection.includes('多人联机'), 'must deny multiplayer in deferred section')
  })

  it('CL13-29: denies complete Paladin', () => {
    assert.ok(deferredSection.includes('完整圣骑士') && contractSection.includes('完整圣骑士'), 'must deny complete Paladin in deferred and contract sections')
  })

  it('CL13-30: denies complete hero system', () => {
    assert.ok(deferredSection.includes('完整英雄系统') && contractSection.includes('完整英雄系统'), 'must deny complete hero system in deferred and contract sections')
  })

  it('CL13-31: denies complete Human', () => {
    assert.ok(deferredSection.includes('完整人族') && contractSection.includes('完整人族'), 'must deny complete Human in deferred and contract sections')
  })

  it('CL13-32: denies V9 release', () => {
    assert.ok(deferredSection.includes('V9 发布') && contractSection.includes('V9 发布'), 'must deny V9 release in deferred and contract sections')
  })

  // ── 5. Production code boundary ──

  it('CL13-33: GameData.ts has HERO_ABILITY_LEVELS.devotion_aura but no ABILITIES.devotion_aura', () => {
    assert.ok(gd.includes('HERO_ABILITY_LEVELS') && gd.includes('devotion_aura:'), 'missing HERO_ABILITY_LEVELS.devotion_aura')
    const abilitiesSection = gd.substring(gd.indexOf('export const ABILITIES'), gd.indexOf('export const HERO_REVIVE_RULES'))
    assert.ok(!abilitiesSection.includes('devotion_aura'), 'ABILITIES must not have devotion_aura')
  })

  it('CL13-34: Game.ts has passive runtime + learn + HUD feedback, no cast method', () => {
    assert.ok(game.includes('updateDevotionAura'), 'must have passive aura runtime')
    assert.ok(game.includes('HERO_ABILITY_LEVELS.devotion_aura'), 'must read devotion_aura data')
    assert.ok(game.includes('armorBonus'), 'must read armorBonus from data')
    assert.ok(game.includes('auraRadius'), 'must read auraRadius from data')
    assert.ok(game.includes('学习虔诚光环'), 'must have learn surface')
    assert.ok(game.includes('虔诚光环 Lv'), 'must show DA level in HUD')
    assert.ok(game.includes('虔诚光环 +'), 'must show aura bonus in HUD')
    assert.ok(!game.includes('castDevotionAura'), 'must not have cast method (passive only)')
    assert.ok(!game.includes('ABILITIES.devotion_aura'), 'must not use ABILITIES.devotion_aura')
  })

  it('CL13-35: GameData.ts devotion_aura has correct level values from SRC1', () => {
    assert.ok(gd.includes('armorBonus: 1.5'), 'missing level 1 armor bonus')
    assert.ok(gd.includes('armorBonus: 3,'), 'missing level 2 armor bonus')
    assert.ok(gd.includes('armorBonus: 4.5'), 'missing level 3 armor bonus')
    assert.ok(gd.includes('auraRadius: 9.0'), 'missing auraRadius 9.0')
  })

  // ── 6. Existing proofs still referenceable ──

  it('CL13-36: contract proof file exists', () => {
    assert.ok(existsSync(resolve(ROOT, 'tests/v9-hero13-devotion-aura-contract.spec.mjs')), 'contract proof missing')
  })

  it('CL13-37: source boundary proof file exists', () => {
    assert.ok(existsSync(resolve(ROOT, 'tests/v9-hero13-devotion-aura-source-boundary.spec.mjs')), 'source proof missing')
  })

  it('CL13-38: data seed proof file exists', () => {
    assert.ok(existsSync(resolve(ROOT, 'tests/v9-hero13-devotion-aura-data-seed.spec.mjs')), 'data proof missing')
  })

  it('CL13-39: runtime proof file exists', () => {
    assert.ok(existsSync(resolve(ROOT, 'tests/v9-hero13-devotion-aura-runtime.spec.ts')), 'runtime proof missing')
  })

  it('CL13-40: learn runtime proof file exists', () => {
    assert.ok(existsSync(resolve(ROOT, 'tests/v9-hero13-devotion-aura-learn-runtime.spec.ts')), 'learn proof missing')
  })

  it('CL13-41: visible feedback proof file exists', () => {
    assert.ok(existsSync(resolve(ROOT, 'tests/v9-hero13-devotion-aura-visible-feedback.spec.ts')), 'feedback proof missing')
  })

  // ── 7. All slice docs exist ──

  it('CL13-42: CONTRACT1 doc exists', () => {
    assert.ok(existsSync(resolve(ROOT, 'docs/V9_HERO13_DEVOTION_AURA_CONTRACT.zh-CN.md')), 'contract doc missing')
  })

  it('CL13-43: SRC1 doc exists', () => {
    assert.ok(existsSync(resolve(ROOT, 'docs/V9_HERO13_DEVOTION_AURA_SOURCE_BOUNDARY.zh-CN.md')), 'source doc missing')
  })

  it('CL13-44: DATA1 doc exists', () => {
    assert.ok(existsSync(resolve(ROOT, 'docs/V9_HERO13_DEVOTION_AURA_DATA_SEED.zh-CN.md')), 'data doc missing')
  })

  it('CL13-45: IMPL1 doc exists', () => {
    assert.ok(existsSync(resolve(ROOT, 'docs/V9_HERO13_DEVOTION_AURA_RUNTIME_SLICE.zh-CN.md')), 'impl1 doc missing')
  })

  it('CL13-46: IMPL2 doc exists', () => {
    assert.ok(existsSync(resolve(ROOT, 'docs/V9_HERO13_DEVOTION_AURA_LEARN_SLICE.zh-CN.md')), 'impl2 doc missing')
  })

  it('CL13-47: UX1 doc exists', () => {
    assert.ok(existsSync(resolve(ROOT, 'docs/V9_HERO13_DEVOTION_AURA_VISIBLE_FEEDBACK.zh-CN.md')), 'ux1 doc missing')
  })
})
