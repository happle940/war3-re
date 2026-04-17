/**
 * V9 HERO14-CLOSE1 Resurrection branch closure static proof.
 *
 * Proves:
 *   1. Closure doc references all predecessor tasks (245-251).
 *   2. Closure doc lists every proof file.
 *   3. Closure doc states player capabilities accurately.
 *   4. Closure doc lists deferred boundaries.
 *   5. Production code boundaries remain: castResurrection exists, ABILITIES.resurrection does not,
 *      SimpleAI has no Resurrection behavior.
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

describe('HERO14-CLOSE1 Resurrection branch closure', () => {
  const closureDoc = read('docs/V9_HERO14_RESURRECTION_CLOSURE.zh-CN.md')

  it('CLOSE14-1: references Task245 contract predecessor', () => {
    assert.ok(closureDoc.includes('Task 245') && closureDoc.includes('CONTRACT1'), 'missing Task245 contract')
  })

  it('CLOSE14-2: references Task246 source boundary predecessor', () => {
    assert.ok(closureDoc.includes('Task 246') && closureDoc.includes('SRC1'), 'missing Task246 source')
  })

  it('CLOSE14-3: references Task247 data seed predecessor', () => {
    assert.ok(closureDoc.includes('Task 247') && closureDoc.includes('DATA1'), 'missing Task247 data')
  })

  it('CLOSE14-4: references Task248 learn predecessor', () => {
    assert.ok(closureDoc.includes('Task 248') && closureDoc.includes('IMPL1A'), 'missing Task248 learn')
  })

  it('CLOSE14-5: references Task249 dead-record substrate predecessor', () => {
    assert.ok(closureDoc.includes('Task 249') && closureDoc.includes('IMPL1B'), 'missing Task249 dead-record')
  })

  it('CLOSE14-6: references Task250 cast runtime predecessor', () => {
    assert.ok(closureDoc.includes('Task 250') && closureDoc.includes('IMPL1C'), 'missing Task250 cast runtime')
  })

  it('CLOSE14-7: references Task251 visible feedback predecessor', () => {
    assert.ok(closureDoc.includes('Task 251') && closureDoc.includes('UX1'), 'missing Task251 feedback')
  })

  it('CLOSE14-8: lists contract proof file', () => {
    assert.ok(closureDoc.includes('v9-hero14-resurrection-contract.spec.mjs'), 'missing contract proof')
  })

  it('CLOSE14-9: lists source-boundary proof file', () => {
    assert.ok(closureDoc.includes('v9-hero14-resurrection-source-boundary.spec.mjs'), 'missing source proof')
  })

  it('CLOSE14-10: lists data-seed proof file', () => {
    assert.ok(closureDoc.includes('v9-hero14-resurrection-data-seed.spec.mjs'), 'missing data seed proof')
  })

  it('CLOSE14-11: lists learn runtime proof file', () => {
    assert.ok(closureDoc.includes('v9-hero14-resurrection-learn-runtime.spec.ts'), 'missing learn proof')
  })

  it('CLOSE14-12: lists dead-record runtime proof file', () => {
    assert.ok(closureDoc.includes('v9-hero14-resurrection-dead-record-runtime.spec.ts'), 'missing dead-record proof')
  })

  it('CLOSE14-13: lists cast runtime proof file', () => {
    assert.ok(closureDoc.includes('v9-hero14-resurrection-cast-runtime.spec.ts'), 'missing cast proof')
  })

  it('CLOSE14-14: lists visible feedback proof file', () => {
    assert.ok(closureDoc.includes('v9-hero14-resurrection-visible-feedback.spec.ts'), 'missing feedback proof')
  })

  it('CLOSE14-15: states player can learn Resurrection at Paladin level 6', () => {
    assert.ok(closureDoc.includes('英雄等级 6') && closureDoc.includes('学习'), 'missing learn capability')
  })

  it('CLOSE14-16: states player can cast no-target Resurrection', () => {
    assert.ok(closureDoc.includes('施放') && closureDoc.includes('复活'), 'missing cast capability')
  })

  it('CLOSE14-17: states player can revive up to 6 eligible units', () => {
    assert.ok(closureDoc.includes('最多 6') || closureDoc.includes('maxTargets: 6'), 'missing max targets')
    assert.ok(closureDoc.includes('友方') && closureDoc.includes('普通'), 'missing eligible unit description')
  })

  it('CLOSE14-18: states player can see learned/cast/cooldown/revived-count feedback', () => {
    assert.ok(closureDoc.includes('冷却') && closureDoc.includes('复活数量'), 'missing feedback capability')
  })

  it('CLOSE14-19: defers ABILITIES.resurrection', () => {
    assert.ok(closureDoc.includes('ABILITIES.resurrection'), 'missing ABILITIES deferral')
  })

  it('CLOSE14-20: defers AI casting', () => {
    assert.ok(closureDoc.includes('AI') && closureDoc.includes('Resurrection'), 'missing AI deferral')
  })

  it('CLOSE14-21: defers particles, sounds, icons, assets', () => {
    assert.ok(closureDoc.includes('粒子') && closureDoc.includes('声音') && closureDoc.includes('素材'), 'missing visual/audio deferral')
  })

  it('CLOSE14-22: defers corpse decay timers', () => {
    assert.ok(closureDoc.includes('尸体存在时间') || closureDoc.includes('corpse decay'), 'missing corpse decay deferral')
  })

  it('CLOSE14-23: defers most-powerful sorting', () => {
    assert.ok(closureDoc.includes('most-powerful'), 'missing most-powerful deferral')
  })

  it('CLOSE14-24: defers other heroes, items, shops, Tavern', () => {
    for (const token of ['Archmage', '物品', '商店', 'Tavern']) {
      assert.ok(closureDoc.includes(token), `missing deferral: ${token}`)
    }
  })

  it('CLOSE14-25: defers complete Paladin, hero system, Human, V9 release', () => {
    for (const token of ['完整圣骑士', '完整英雄系统', '完整人族', 'V9 发布']) {
      assert.ok(closureDoc.includes(token), `missing complete denial: ${token}`)
    }
  })

  it('CLOSE14-26: denies complete Paladin / hero system / Human / V9 in contract section', () => {
    const contractSection = closureDoc.slice(closureDoc.indexOf('## 7. 合同声明'))
    for (const token of ['完整圣骑士', '完整英雄系统', '完整人族', 'V9']) {
      assert.ok(contractSection.includes(token), `missing contract denial: ${token}`)
    }
  })

  it('CLOSE14-27: Game.ts has castResurrection', () => {
    const game = read('src/game/Game.ts')
    assert.ok(game.includes('castResurrection'), 'missing castResurrection')
  })

  it('CLOSE14-28: Game.ts has minimal feedback text (复活术, 复活冷却, 刚复活)', () => {
    const game = read('src/game/Game.ts')
    assert.ok(game.includes('复活术'), 'missing 复活术 feedback')
    assert.ok(game.includes('复活冷却'), 'missing 复活冷却 feedback')
    assert.ok(game.includes('刚复活'), 'missing 刚复活 feedback')
  })

  it('CLOSE14-29: GameData.ts has HERO_ABILITY_LEVELS.resurrection', () => {
    const gd = read('src/game/GameData.ts')
    assert.ok(/HERO_ABILITY_LEVELS[\s\S]*resurrection\s*:/.test(gd), 'missing HERO_ABILITY_LEVELS.resurrection')
  })

  it('CLOSE14-30: ABILITIES has no resurrection entry', () => {
    const gd = read('src/game/GameData.ts')
    const abilitiesStart = gd.indexOf('export const ABILITIES')
    assert.ok(abilitiesStart >= 0, 'missing ABILITIES section')
    const abilitiesEnd = gd.indexOf('// ===== 英雄复活规则', abilitiesStart)
    assert.ok(abilitiesEnd > abilitiesStart, 'missing ABILITIES end')
    const abilitiesSection = gd.slice(abilitiesStart, abilitiesEnd)
    assert.ok(!/resurrection\s*:/.test(abilitiesSection), 'must not have ABILITIES.resurrection')
  })

  it('CLOSE14-31: SimpleAI.ts has no Resurrection behavior', () => {
    const ai = read('src/game/SimpleAI.ts')
    assert.ok(!ai.includes('resurrection') && !ai.includes('Resurrection') && !ai.includes('群体复活'), 'SimpleAI must not include Resurrection')
  })

  it('CLOSE14-32: all proof files exist on disk', () => {
    const proofFiles = [
      'tests/v9-hero14-resurrection-contract.spec.mjs',
      'tests/v9-hero14-resurrection-source-boundary.spec.mjs',
      'tests/v9-hero14-resurrection-data-seed.spec.mjs',
      'tests/v9-hero14-resurrection-learn-runtime.spec.ts',
      'tests/v9-hero14-resurrection-dead-record-runtime.spec.ts',
      'tests/v9-hero14-resurrection-cast-runtime.spec.ts',
      'tests/v9-hero14-resurrection-visible-feedback.spec.ts',
    ]
    for (const f of proofFiles) {
      assert.ok(existsSync(resolve(ROOT, f)), `missing proof file: ${f}`)
    }
  })

  it('CLOSE14-33: all doc files exist on disk', () => {
    const docFiles = [
      'docs/V9_HERO14_RESURRECTION_CONTRACT.zh-CN.md',
      'docs/V9_HERO14_RESURRECTION_SOURCE_BOUNDARY.zh-CN.md',
      'docs/V9_HERO14_RESURRECTION_DATA_SEED.zh-CN.md',
      'docs/V9_HERO14_RESURRECTION_LEARN_SLICE.zh-CN.md',
      'docs/V9_HERO14_RESURRECTION_DEAD_RECORD_SLICE.zh-CN.md',
      'docs/V9_HERO14_RESURRECTION_CAST_RUNTIME_SLICE.zh-CN.md',
      'docs/V9_HERO14_RESURRECTION_VISIBLE_FEEDBACK.zh-CN.md',
    ]
    for (const f of docFiles) {
      assert.ok(existsSync(resolve(ROOT, f)), `missing doc file: ${f}`)
    }
  })

  it('CLOSE14-34: proof count summary matches the current listed proof files', () => {
    assert.ok(closureDoc.includes('`tests/v9-hero14-resurrection-source-boundary.spec.mjs` | 30'), 'source proof count should be 30')
    assert.ok(closureDoc.includes('总计：93 个证明'), 'total proof count should be 93')
  })
})
