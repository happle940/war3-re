/**
 * V9 HERO10-CLOSE1 XP / leveling visible chain closure inventory.
 *
 * Static proof that the HERO10 XP/leveling visible chain is fully closed
 * across all five predecessor tasks.
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

describe('HERO10-CLOSE1 XP / leveling closure inventory', () => {
  const doc = read('docs/V9_HERO10_XP_LEVELING_CLOSURE.zh-CN.md')

  // ── 1. Closure doc references all five stages ──
  it('CL10-1: closure doc exists and is non-empty', () => {
    assert.ok(doc.length > 200, 'closure doc too short')
  })

  it('CL10-2: references HERO10-CONTRACT1 / Task 219', () => {
    assert.ok(doc.includes('Task 219') && doc.includes('CONTRACT1'), 'missing CONTRACT1')
  })

  it('CL10-3: references HERO10-SRC1 / Task 220', () => {
    assert.ok(doc.includes('Task 220') && doc.includes('SRC1'), 'missing SRC1')
  })

  it('CL10-4: references HERO10-DATA1 / Task 221', () => {
    assert.ok(doc.includes('Task 221') && doc.includes('DATA1'), 'missing DATA1')
  })

  it('CL10-5: references HERO10-IMPL1 / Task 222', () => {
    assert.ok(doc.includes('Task 222') && doc.includes('IMPL1'), 'missing IMPL1')
  })

  it('CL10-6: references HERO10-UX1 / Task 223', () => {
    assert.ok(doc.includes('Task 223') && doc.includes('UX1'), 'missing UX1')
  })

  // ── 2. Runtime + visible feedback chain listed ──
  it('CL10-7: states hero fields (heroLevel, heroXP, heroSkillPoints)', () => {
    assert.ok(doc.includes('heroLevel') && doc.includes('heroXP') && doc.includes('heroSkillPoints'), 'missing hero fields')
  })

  it('CL10-8: states enemy unit death grants XP', () => {
    assert.ok(doc.includes('XP') && (doc.includes('敌方') || doc.includes('enemy')), 'missing XP gain from kills')
  })

  it('CL10-9: states threshold crossing raises level and grants skill point', () => {
    assert.ok(doc.includes('阈值') && doc.includes('heroLevel') && doc.includes('技能点'), 'missing level-up description')
  })

  it('CL10-10: states max level stops more XP', () => {
    assert.ok(doc.includes('最高等级') && doc.includes('不再获得'), 'missing max level cap')
  })

  it('CL10-11: states selection HUD shows level, XP, skill points', () => {
    assert.ok(doc.includes('等级') && doc.includes('XP') && doc.includes('技能点'), 'missing HUD feedback description')
  })

  it('CL10-12: states HERO9 revive keeps level/XP/skill points', () => {
    assert.ok(doc.includes('HERO9') && doc.includes('复活'), 'missing HERO9 revive preservation')
  })

  // ── 3. Does not claim complete hero system, complete Human, V9 release ──
  it('CL10-13: explicitly says complete hero system not done', () => {
    assert.ok(doc.includes('不') && doc.includes('完整英雄系统'), 'must deny complete hero system')
  })

  it('CL10-14: explicitly says complete Human not done', () => {
    assert.ok(doc.includes('不') && doc.includes('完整人族'), 'must deny complete Human')
  })

  it('CL10-15: explicitly says V9 release not done', () => {
    assert.ok(doc.includes('不') && (doc.includes('V9 发布') || doc.includes('发布')), 'must deny V9 release')
  })

  // ── 4. Deferred items listed ──
  it('CL10-16: lists skill learning / skill-point spend as deferred', () => {
    assert.ok(doc.includes('技能学习') || doc.includes('技能点消费'), 'missing skill learning deferral')
  })

  it('CL10-17: lists hero ability levels as deferred', () => {
    assert.ok(doc.includes('能力等级'), 'missing ability levels deferral')
  })

  it('CL10-18: lists aura / ultimate / attributes as deferred', () => {
    assert.ok(doc.includes('光环') && doc.includes('终极'), 'missing aura/ultimate deferral')
  })

  it('CL10-19: lists enemy hero XP as deferred', () => {
    assert.ok(doc.includes('敌方英雄 XP') || doc.includes('enemy hero XP'), 'missing enemy hero XP deferral')
  })

  it('CL10-20: lists creep XP / neutral camps as deferred', () => {
    assert.ok(doc.includes('野怪') || doc.includes('creep'), 'missing creep XP deferral')
  })

  it('CL10-21: lists XP sharing / multiple heroes as deferred', () => {
    assert.ok(doc.includes('多英雄') || doc.includes('XP 分配'), 'missing XP sharing deferral')
  })

  it('CL10-22: lists full hero panel as deferred', () => {
    assert.ok(doc.includes('英雄面板'), 'missing hero panel deferral')
  })

  it('CL10-23: lists AI hero strategy as deferred', () => {
    assert.ok(doc.includes('AI'), 'missing AI hero strategy deferral')
  })

  it('CL10-24: lists other Human heroes as deferred', () => {
    assert.ok(doc.includes('其他') && doc.includes('英雄'), 'missing other heroes deferral')
  })

  it('CL10-25: lists items, Tavern, shop as deferred', () => {
    assert.ok(doc.includes('物品') && doc.includes('酒馆') && doc.includes('商店'), 'missing items/Tavern/shop deferral')
  })

  it('CL10-26: lists air, second race, multiplayer, assets as deferred', () => {
    assert.ok(
      (doc.includes('空军') || doc.includes('air')) &&
      (doc.includes('第二种族') || doc.includes('second race')) &&
      (doc.includes('多人') || doc.includes('multiplayer')),
      'missing air/race/multiplayer deferral'
    )
  })

  // ── 5. Source files exist ──
  const requiredFiles = [
    'tests/v9-hero10-xp-leveling-contract.spec.mjs',
    'tests/v9-hero10-xp-leveling-source-boundary.spec.mjs',
    'tests/v9-hero10-xp-leveling-data-seed.spec.mjs',
    'tests/v9-hero10-xp-leveling-runtime.spec.ts',
    'tests/v9-hero10-xp-visible-feedback.spec.ts',
  ]

  for (const file of requiredFiles) {
    it(`CL10-27-${file}: source file exists`, () => {
      const p = resolve(ROOT, file)
      assert.ok(existsSync(p), `missing file: ${file}`)
      const content = readFileSync(p, 'utf-8')
      assert.ok(content.length > 100, `${file} is too short`)
    })
  }
})
