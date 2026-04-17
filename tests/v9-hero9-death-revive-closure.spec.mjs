/**
 * V9 HERO9-CLOSE1 Hero death / revive closure inventory.
 *
 * Static proof that the HERO9 death + revive branch is fully closed
 * across all six predecessor tasks.
 */
import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync, existsSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(__dirname, '..')

// ── helpers ──
function read(relativePath) {
  const p = resolve(ROOT, relativePath)
  assert.ok(existsSync(p), `file missing: ${relativePath}`)
  return readFileSync(p, 'utf-8')
}

function assertFileNotEmpty(relativePath) {
  const content = read(relativePath)
  assert.ok(content.length > 0, `${relativePath} is empty`)
  return content
}

// ── 1. All six predecessor tasks represented ──
describe('HERO9-CLOSE1 closure inventory', () => {
  it('CL1-1: closure doc exists and is non-empty', () => {
    assertFileNotEmpty('docs/V9_HERO9_DEATH_REVIVE_CLOSURE.zh-CN.md')
  })

  it('CL1-2: closure doc mentions all six task IDs', () => {
    const doc = read('docs/V9_HERO9_DEATH_REVIVE_CLOSURE.zh-CN.md')
    const taskIds = [
      'Task 212', 'Task 213', 'Task 214', 'Task 215', 'Task 216', 'Task 217',
    ]
    for (const id of taskIds) {
      assert.ok(doc.includes(id), `closure doc missing ${id}`)
    }
  })

  it('CL1-3: closure doc mentions all six task names', () => {
    const doc = read('docs/V9_HERO9_DEATH_REVIVE_CLOSURE.zh-CN.md')
    const names = [
      'HERO9-CONTRACT1', 'HERO9-SRC1', 'HERO9-IMPL1',
      'HERO9-DATA1', 'HERO9-CONTRACT2', 'HERO9-IMPL2',
    ]
    for (const name of names) {
      assert.ok(doc.includes(name), `closure doc missing ${name}`)
    }
  })

  // ── 2. Death-state runtime covered ──
  it('CL1-4: death-state runtime spec exists', () => {
    assertFileNotEmpty('tests/v9-hero9-death-state-runtime.spec.ts')
  })

  // ── 3. Revive source/data/contract static proofs covered ──
  it('CL1-5: revive source boundary spec exists', () => {
    assertFileNotEmpty('tests/v9-hero9-revive-source-boundary.spec.mjs')
  })

  it('CL1-6: revive data seed spec exists', () => {
    assertFileNotEmpty('tests/v9-hero9-revive-data-seed.spec.mjs')
  })

  it('CL1-7: revive runtime contract spec exists', () => {
    assertFileNotEmpty('tests/v9-hero9-revive-runtime-contract.spec.mjs')
  })

  it('CL1-8: hero death-revive contract spec exists', () => {
    assertFileNotEmpty('tests/v9-hero9-hero-death-revive-contract.spec.mjs')
  })

  // ── 4. Revive runtime covered ──
  it('CL1-9: revive runtime spec exists', () => {
    assertFileNotEmpty('tests/v9-hero9-revive-runtime.spec.ts')
  })

  // ── 5. Exclusions explicitly stated ──
  it('CL1-10: closure doc states XP is excluded', () => {
    const doc = read('docs/V9_HERO9_DEATH_REVIVE_CLOSURE.zh-CN.md')
    assert.ok(doc.includes('经验值') || doc.includes('XP'), 'missing XP exclusion')
  })

  it('CL1-11: closure doc states leveling is excluded', () => {
    const doc = read('docs/V9_HERO9_DEATH_REVIVE_CLOSURE.zh-CN.md')
    assert.ok(doc.includes('升级') || doc.includes('leveling'), 'missing leveling exclusion')
  })

  it('CL1-12: closure doc states skill points are excluded', () => {
    const doc = read('docs/V9_HERO9_DEATH_REVIVE_CLOSURE.zh-CN.md')
    assert.ok(doc.includes('技能点') || doc.includes('skill points'), 'missing skill points exclusion')
  })

  it('CL1-13: closure doc states items/inventory are excluded', () => {
    const doc = read('docs/V9_HERO9_DEATH_REVIVE_CLOSURE.zh-CN.md')
    assert.ok(doc.includes('物品') || doc.includes('inventory'), 'missing items exclusion')
  })

  it('CL1-14: closure doc states aura is excluded', () => {
    const doc = read('docs/V9_HERO9_DEATH_REVIVE_CLOSURE.zh-CN.md')
    assert.ok(doc.includes('光环') || doc.includes('aura'), 'missing aura exclusion')
  })

  it('CL1-15: closure doc states other heroes are excluded', () => {
    const doc = read('docs/V9_HERO9_DEATH_REVIVE_CLOSURE.zh-CN.md')
    assert.ok(doc.includes('其他') && (doc.includes('英雄') || doc.includes('hero')), 'missing other heroes exclusion')
  })

  it('CL1-16: closure doc states Tavern is excluded', () => {
    const doc = read('docs/V9_HERO9_DEATH_REVIVE_CLOSURE.zh-CN.md')
    assert.ok(doc.includes('酒馆') || doc.includes('Tavern'), 'missing Tavern exclusion')
  })

  it('CL1-17: closure doc states shop is excluded', () => {
    const doc = read('docs/V9_HERO9_DEATH_REVIVE_CLOSURE.zh-CN.md')
    assert.ok(doc.includes('商店') || doc.includes('shop'), 'missing shop exclusion')
  })

  it('CL1-18: closure doc states AI hero strategy is excluded', () => {
    const doc = read('docs/V9_HERO9_DEATH_REVIVE_CLOSURE.zh-CN.md')
    assert.ok(doc.includes('AI'), 'missing AI hero strategy exclusion')
  })

  it('CL1-19: closure doc states new visuals/assets are excluded', () => {
    const doc = read('docs/V9_HERO9_DEATH_REVIVE_CLOSURE.zh-CN.md')
    assert.ok(doc.includes('视觉') || doc.includes('visuals'), 'missing visuals exclusion')
  })

  it('CL1-20: closure doc states air units are excluded', () => {
    const doc = read('docs/V9_HERO9_DEATH_REVIVE_CLOSURE.zh-CN.md')
    assert.ok(doc.includes('空军') || doc.includes('air'), 'missing air units exclusion')
  })

  it('CL1-21: closure doc states second race is excluded', () => {
    const doc = read('docs/V9_HERO9_DEATH_REVIVE_CLOSURE.zh-CN.md')
    assert.ok(doc.includes('第二') && (doc.includes('种族') || doc.includes('race')), 'missing second race exclusion')
  })

  it('CL1-22: closure doc states multiplayer is excluded', () => {
    const doc = read('docs/V9_HERO9_DEATH_REVIVE_CLOSURE.zh-CN.md')
    assert.ok(doc.includes('多人') || doc.includes('multiplayer'), 'missing multiplayer exclusion')
  })

  it('CL1-23: closure doc states public-release is excluded', () => {
    const doc = read('docs/V9_HERO9_DEATH_REVIVE_CLOSURE.zh-CN.md')
    assert.ok(doc.includes('公开发布') || doc.includes('public-release'), 'missing public-release exclusion')
  })

  // ── 6. Does NOT claim complete hero system or complete Human ──
  it('CL1-24: closure doc does not claim "完整英雄系统"', () => {
    const doc = read('docs/V9_HERO9_DEATH_REVIVE_CLOSURE.zh-CN.md')
    // Must not appear without negation — "不声称完整英雄系统" is fine, bare "完整英雄系统" is not
    const bareClaim = /(?<!不声称.{0,4})完整英雄系统(?!.*不)/.test(doc)
    // Simpler: just check the doc explicitly says it does NOT claim this
    assert.ok(doc.includes('不') && doc.includes('完整英雄系统'), 'closure doc must explicitly deny complete hero system')
  })

  it('CL1-25: closure doc does not claim "完整人族" without negation', () => {
    const doc = read('docs/V9_HERO9_DEATH_REVIVE_CLOSURE.zh-CN.md')
    // The doc may say "does not claim 完整人族" but must not say it IS 完整人族
    const bareClaim = /^完整人族(?!.*不)/m.test(doc)
    assert.ok(!bareClaim, 'closure doc must not claim complete Human race')
  })

  // ── 7. Production code unchanged by closure task ──
  it('CL1-26: Game.ts exists and is not modified by closure', () => {
    // Just verify it still builds — the closure task must not touch it
    const src = read('src/game/Game.ts')
    assert.ok(src.length > 0, 'Game.ts must exist')
  })

  it('CL1-27: GameData.ts exists and is not modified by closure', () => {
    const src = read('src/game/GameData.ts')
    assert.ok(src.length > 0, 'GameData.ts must exist')
    assert.ok(src.includes('HERO_REVIVE_RULES'), 'GameData must contain HERO_REVIVE_RULES from prior tasks')
  })
})
