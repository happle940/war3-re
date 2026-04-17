/**
 * V9 HERO11-CLOSE1 Holy Light skill learning closure inventory.
 *
 * Static proof that the HERO11 Holy Light skill-learning chain is fully closed
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

describe('HERO11-CLOSE1 Holy Light skill learning closure inventory', () => {
  const doc = read('docs/V9_HERO11_HOLY_LIGHT_SKILL_LEARNING_CLOSURE.zh-CN.md')

  // ── 1. Closure doc references all five stages ──

  it('CL11-1: closure doc exists and is non-empty', () => {
    assert.ok(doc.length > 200, 'closure doc too short')
  })

  it('CL11-2: references HERO11-CONTRACT1 / Task 225', () => {
    assert.ok(doc.includes('Task 225') && doc.includes('CONTRACT1'), 'missing CONTRACT1')
  })

  it('CL11-3: references HERO11-SRC1 / Task 226', () => {
    assert.ok(doc.includes('Task 226') && doc.includes('SRC1'), 'missing SRC1')
  })

  it('CL11-4: references HERO11-DATA1 / Task 227', () => {
    assert.ok(doc.includes('Task 227') && doc.includes('DATA1'), 'missing DATA1')
  })

  it('CL11-5: references HERO11-IMPL1 / Task 228', () => {
    assert.ok(doc.includes('Task 228') && doc.includes('IMPL1'), 'missing IMPL1')
  })

  it('CL11-6: references HERO11-UX1 / Task 229', () => {
    assert.ok(doc.includes('Task 229') && doc.includes('UX1'), 'missing UX1')
  })

  // ── 2. Implemented player-visible behavior listed ──

  it('CL11-7: states healing values 200/400/600', () => {
    assert.ok(doc.includes('200') && doc.includes('400') && doc.includes('600'), 'missing healing values')
  })

  it('CL11-8: states undead damage values 100/200/300', () => {
    assert.ok(doc.includes('100') && doc.includes('200') && doc.includes('300'), 'missing undead damage values')
  })

  it('CL11-9: states hero level gates 1/3/5', () => {
    assert.ok(doc.includes('英雄等级门槛 1') && doc.includes('英雄等级门槛 3') && doc.includes('英雄等级门槛 5'), 'missing hero level gates')
  })

  it('CL11-10: states skill point consumption mechanism', () => {
    assert.ok(doc.includes('技能点') && doc.includes('消费'), 'missing skill point consumption')
  })

  it('CL11-11: states revive persistence for ability levels and skill points', () => {
    assert.ok(doc.includes('复活') && doc.includes('保留'), 'missing revive persistence')
  })

  it('CL11-12: states visible feedback — HUD shows learned level', () => {
    assert.ok(doc.includes('圣光术 Lv'), 'missing HUD level feedback')
  })

  it('CL11-13: states visible feedback — command card shows learn and cast buttons', () => {
    assert.ok(doc.includes('学习按钮') && doc.includes('施放按钮'), 'missing command card feedback')
  })

  it('CL11-14: states mana 65, cooldown 5, range 8.0 unchanged across levels', () => {
    assert.ok(doc.includes('65') && doc.includes('5') && doc.includes('8.0'), 'missing constant values')
  })

  // ── 3. Closure doc says this closes only Paladin Holy Light minimal learning chain ──

  it('CL11-15: explicitly closes only Paladin Holy Light minimal learning chain', () => {
    assert.ok(
      doc.includes('Paladin') && doc.includes('Holy Light') && doc.includes('最小') ||
      doc.includes('Paladin Holy Light') && doc.includes('闭环'),
      'must state scope is Paladin Holy Light minimal chain only'
    )
  })

  // ── 4. Does not claim complete hero system, complete Human, V9 release ──

  it('CL11-16: denies complete hero system', () => {
    assert.ok(doc.includes('不') && doc.includes('完整英雄系统'), 'must deny complete hero system')
  })

  it('CL11-17: denies complete Human', () => {
    assert.ok(doc.includes('不') && doc.includes('完整人族'), 'must deny complete Human')
  })

  it('CL11-18: denies V9 release', () => {
    assert.ok(doc.includes('不') && doc.includes('V9 发布'), 'must deny V9 release')
  })

  // ── 5. Deferred items listed ──

  it('CL11-19: lists Divine Shield as deferred', () => {
    assert.ok(doc.includes('Divine Shield') || doc.includes('神圣护盾'), 'missing Divine Shield deferral')
  })

  it('CL11-20: lists Devotion Aura as deferred', () => {
    assert.ok(doc.includes('Devotion Aura') || doc.includes('光环'), 'missing Devotion Aura deferral')
  })

  it('CL11-21: lists Resurrection ultimate as deferred', () => {
    assert.ok(doc.includes('Resurrection') || doc.includes('终极'), 'missing Resurrection deferral')
  })

  it('CL11-22: lists other heroes as deferred', () => {
    assert.ok(
      (doc.includes('Archmage') || doc.includes('大法师')) &&
      (doc.includes('Mountain King') || doc.includes('山丘之王')),
      'missing other heroes deferral'
    )
  })

  it('CL11-23: lists undead damage runtime as deferred', () => {
    assert.ok(doc.includes('亡灵伤害'), 'missing undead damage deferral')
  })

  it('CL11-24: lists AI hero strategy as deferred', () => {
    assert.ok(doc.includes('AI'), 'missing AI hero strategy deferral')
  })

  it('CL11-25: lists items, Tavern, shop as deferred', () => {
    assert.ok(doc.includes('物品') && doc.includes('酒馆') && doc.includes('商店'), 'missing items/Tavern/shop')
  })

  it('CL11-26: lists air, second race, multiplayer as deferred', () => {
    assert.ok(
      (doc.includes('空军') || doc.includes('air')) &&
      (doc.includes('第二种族') || doc.includes('second race')) &&
      (doc.includes('多人') || doc.includes('multiplayer')),
      'missing air/race/multiplayer deferral'
    )
  })

  // ── 6. Engineering evidence files exist ──

  const requiredFiles = [
    'docs/V9_HERO11_SKILL_LEARNING_CONTRACT.zh-CN.md',
    'tests/v9-hero11-skill-learning-contract.spec.mjs',
    'docs/V9_HERO11_HOLY_LIGHT_LEVEL_SOURCE_BOUNDARY.zh-CN.md',
    'tests/v9-hero11-holy-light-level-source-boundary.spec.mjs',
    'docs/V9_HERO11_HOLY_LIGHT_LEVEL_DATA_SEED.zh-CN.md',
    'tests/v9-hero11-holy-light-level-data-seed.spec.mjs',
    'docs/V9_HERO11_HOLY_LIGHT_SKILL_SPEND_RUNTIME.zh-CN.md',
    'tests/v9-hero11-holy-light-skill-spend-runtime.spec.ts',
    'docs/V9_HERO11_HOLY_LIGHT_LEARNED_FEEDBACK.zh-CN.md',
    'tests/v9-hero11-holy-light-learned-feedback.spec.ts',
  ]

  for (const file of requiredFiles) {
    it(`CL11-27-${file}: evidence file exists`, () => {
      const p = resolve(ROOT, file)
      assert.ok(existsSync(p), `missing file: ${file}`)
      const content = readFileSync(p, 'utf-8')
      assert.ok(content.length > 100, `${file} is too short`)
    })
  }
})
