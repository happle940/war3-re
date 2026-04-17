/**
 * V9 HERO12-CLOSE1 Divine Shield branch closure inventory static proof.
 *
 * Proves:
 *   1. Closure doc references all HERO12 slice docs and proof files.
 *   2. Closure doc lists what the player can now do.
 *   3. Closure doc denies Devotion Aura, Resurrection, other heroes, AI, items,
 *      shops, Tavern, assets, second race, air, multiplayer, complete hero system,
 *      complete Human, and V9 release.
 *   4. Production code still reads from HERO_ABILITY_LEVELS, not ABILITIES.divine_shield.
 *   5. Existing HERO12 contract/source/data proofs remain valid.
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

describe('HERO12-CLOSE1 Divine Shield branch closure inventory', () => {
  const closure = read('docs/V9_HERO12_DIVINE_SHIELD_CLOSURE.zh-CN.md')
  const gd = read('src/game/GameData.ts')
  const game = read('src/game/Game.ts')
  const capabilitySection = sectionBetween(closure, '## 3. 玩家当前能力', '## 4. 明确延后')
  const deferredSection = sectionBetween(closure, '## 4. 明确延后', '## 5. 合同声明')
  const contractSection = closure.slice(closure.indexOf('## 5. 合同声明'))

  // ── 1. References all slice docs ──

  it('CL12-0: uses closure wording, not package wording', () => {
    assert.ok(closure.includes('分支收口盘点'), 'closure title must use 收口盘点')
    assert.ok(!closure.includes('分支配包盘点'), 'closure title must not use 配包盘点')
  })

  it('CL12-1: references CONTRACT1 (Task 231)', () => {
    assert.ok(closure.includes('CONTRACT1') && closure.includes('Task 231'), 'missing CONTRACT1 reference')
  })

  it('CL12-2: references SRC1 (Task 232)', () => {
    assert.ok(closure.includes('SRC1') && closure.includes('Task 232'), 'missing SRC1 reference')
  })

  it('CL12-3: references DATA1 (Task 233)', () => {
    assert.ok(closure.includes('DATA1') && closure.includes('Task 233'), 'missing DATA1 reference')
  })

  it('CL12-4: references IMPL1A (Task 234)', () => {
    assert.ok(closure.includes('IMPL1A') && closure.includes('Task 234'), 'missing IMPL1A reference')
  })

  it('CL12-5: references IMPL1B (Task 235)', () => {
    assert.ok(closure.includes('IMPL1B') && closure.includes('Task 235'), 'missing IMPL1B reference')
  })

  it('CL12-6: references UX1 (Task 236)', () => {
    assert.ok(closure.includes('UX1') && closure.includes('Task 236'), 'missing UX1 reference')
  })

  // ── 2. References proof files ──

  it('CL12-7: lists contract proof file', () => {
    assert.ok(closure.includes('v9-hero12-divine-shield-contract.spec.mjs'), 'missing contract proof file')
  })

  it('CL12-8: lists source boundary proof file', () => {
    assert.ok(closure.includes('v9-hero12-divine-shield-source-boundary.spec.mjs'), 'missing source proof file')
  })

  it('CL12-9: lists data seed proof file', () => {
    assert.ok(closure.includes('v9-hero12-divine-shield-data-seed.spec.mjs'), 'missing data proof file')
  })

  it('CL12-10: lists learn runtime proof file', () => {
    assert.ok(closure.includes('v9-hero12-divine-shield-learn-runtime.spec.ts'), 'missing learn proof file')
  })

  it('CL12-11: lists self-cast runtime proof file', () => {
    assert.ok(closure.includes('v9-hero12-divine-shield-runtime.spec.ts'), 'missing runtime proof file')
  })

  it('CL12-12: lists visible feedback proof file', () => {
    assert.ok(closure.includes('v9-hero12-divine-shield-visible-feedback.spec.ts'), 'missing feedback proof file')
  })

  // ── 3. Player capabilities ──

  it('CL12-13: states player can learn Divine Shield', () => {
    assert.ok(closure.includes('学习') && closure.includes('Divine Shield'), 'must state learn capability')
  })

  it('CL12-14: states player can cast on self', () => {
    assert.ok(closure.includes('施放') && closure.includes('自身'), 'must state self-cast capability')
  })

  it('CL12-15: states active/cooldown feedback visible', () => {
    assert.ok(capabilitySection.includes('反馈'), 'must state feedback visibility')
    assert.ok(capabilitySection.includes('神圣护盾生效 Ns'), 'must name the actual HUD active text')
    assert.ok(capabilitySection.includes('生效中') && capabilitySection.includes('冷却中') && capabilitySection.includes('魔力不足'), 'must name command-card feedback states')
  })

  it('CL12-16: states damage prevention while active', () => {
    assert.ok(closure.includes('免疫') || closure.includes('阻止') || closure.includes('伤害'), 'must state damage prevention')
  })

  it('CL12-17: states duration expiry behavior', () => {
    assert.ok(closure.includes('过期') || closure.includes('恢复正常'), 'must state expiry behavior')
  })

  // ── 4. Explicit denials ──

  it('CL12-18: denies Devotion Aura', () => {
    assert.ok(deferredSection.includes('Devotion Aura'), 'must deny Devotion Aura in deferred section')
  })

  it('CL12-19: denies Resurrection', () => {
    assert.ok(deferredSection.includes('Resurrection'), 'must deny Resurrection in deferred section')
  })

  it('CL12-20: denies other heroes', () => {
    assert.ok(deferredSection.includes('Archmage') && deferredSection.includes('Mountain King'), 'must deny other heroes in deferred section')
  })

  it('CL12-21: denies AI hero strategy', () => {
    assert.ok(deferredSection.includes('AI 英雄策略'), 'must deny AI strategy in deferred section')
  })

  it('CL12-22: denies items/shops/Tavern', () => {
    assert.ok(deferredSection.includes('物品') && deferredSection.includes('商店') && deferredSection.includes('Tavern'), 'must deny items/shops/Tavern in deferred section')
  })

  it('CL12-23: denies assets', () => {
    assert.ok(deferredSection.includes('资产') || deferredSection.includes('美术'), 'must deny assets in deferred section')
  })

  it('CL12-24: denies second race', () => {
    assert.ok(deferredSection.includes('第二种族') || deferredSection.includes('second race'), 'must deny second race in deferred section')
  })

  it('CL12-25: denies air', () => {
    assert.ok(deferredSection.includes('空军') || deferredSection.includes('air'), 'must deny air in deferred section')
  })

  it('CL12-26: denies multiplayer', () => {
    assert.ok(deferredSection.includes('多人联机') || deferredSection.includes('multiplayer'), 'must deny multiplayer in deferred section')
  })

  it('CL12-27: denies complete hero system', () => {
    assert.ok(deferredSection.includes('完整英雄系统') && contractSection.includes('完整英雄系统'), 'must deny complete hero system in deferred and contract sections')
  })

  it('CL12-28: denies complete Human', () => {
    assert.ok(deferredSection.includes('完整人族') && contractSection.includes('完整人族'), 'must deny complete Human in deferred and contract sections')
  })

  it('CL12-29: denies V9 release', () => {
    assert.ok(deferredSection.includes('V9 发布') && contractSection.includes('V9 发布'), 'must deny V9 release in deferred and contract sections')
  })

  // ── 5. Production code boundary ──

  it('CL12-30: GameData.ts has HERO_ABILITY_LEVELS.divine_shield but no ABILITIES.divine_shield', () => {
    assert.ok(gd.includes('HERO_ABILITY_LEVELS') && gd.includes('divine_shield:'), 'missing HERO_ABILITY_LEVELS.divine_shield')
    const abilitiesSection = gd.substring(gd.indexOf('export const ABILITIES'), gd.indexOf('export const HERO_REVIVE_RULES'))
    assert.ok(!abilitiesSection.includes('divine_shield'), 'ABILITIES must not have divine_shield')
  })

  it('CL12-31: Game.ts has learn + cast + feedback but no isInvulnerable or ABILITIES.divine_shield', () => {
    assert.ok(game.includes('castDivineShield'), 'must have cast method')
    assert.ok(game.includes('divineShieldUntil'), 'must have active state tracking')
    assert.ok(game.includes('divineShieldCooldownUntil'), 'must have cooldown tracking')
    assert.ok(game.includes('学习神圣护盾'), 'must have learn surface')
    assert.ok(!game.includes('isInvulnerable'), 'must not have isInvulnerable')
    assert.ok(!game.includes('ABILITIES.divine_shield'), 'must not have ABILITIES.divine_shield')
  })

  // ── 6. Existing proofs still referenceable ──

  it('CL12-32: contract proof file exists', () => {
    assert.ok(existsSync(resolve(ROOT, 'tests/v9-hero12-divine-shield-contract.spec.mjs')), 'contract proof missing')
  })

  it('CL12-33: source boundary proof file exists', () => {
    assert.ok(existsSync(resolve(ROOT, 'tests/v9-hero12-divine-shield-source-boundary.spec.mjs')), 'source proof missing')
  })

  it('CL12-34: data seed proof file exists', () => {
    assert.ok(existsSync(resolve(ROOT, 'tests/v9-hero12-divine-shield-data-seed.spec.mjs')), 'data proof missing')
  })
})
