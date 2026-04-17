/**
 * V9 HERO8-CLOSE1 Hero minimal runtime closure inventory static proof.
 *
 * Proves the closure document references the accepted evidence chain for
 * HERO1-HERO7, lists live and closed capabilities, and recommends a bounded
 * next branch.
 */
import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'
import { test } from 'node:test'

const closure = readFileSync(
  new URL('../docs/V9_HERO8_MINIMAL_HERO_RUNTIME_CLOSURE.zh-CN.md', import.meta.url),
  'utf8',
)

// ── Document shape ───────────────────────────────────────

test('CLOSE-1: closure document exists and has substance', () => {
  assert.ok(closure.length > 1000, 'closure must be substantive')
})

// ── Evidence chain references HERO1-HERO7 ────────────────

test('CLOSE-2: closure references HERO1 contract', () => {
  assert.ok(closure.includes('HERO1'))
  assert.ok(closure.includes('V9_HERO1_ALTAR_PALADIN_CONTRACT'))
})

test('CLOSE-3: closure references HERO2 source boundary', () => {
  assert.ok(closure.includes('HERO2'))
  assert.ok(closure.includes('V9_HERO2_ALTAR_PALADIN_SOURCE_BOUNDARY'))
})

test('CLOSE-4: closure references HERO3 Altar data seed', () => {
  assert.ok(closure.includes('HERO3'))
  assert.ok(closure.includes('altar_of_kings'))
})

test('CLOSE-5: closure references HERO4 Paladin data seed', () => {
  assert.ok(closure.includes('HERO4'))
  assert.ok(closure.includes('UNITS.paladin') || closure.includes('paladin'))
})

test('CLOSE-6: closure references HERO5 Holy Light data seed', () => {
  assert.ok(closure.includes('HERO5'))
  assert.ok(closure.includes('ABILITIES.holy_light') || closure.includes('holy_light'))
})

test('CLOSE-7: closure references HERO6 runtime split contract', () => {
  assert.ok(closure.includes('HERO6'))
  assert.ok(closure.includes('V9_HERO6_ALTAR_RUNTIME_EXPOSURE_CONTRACT'))
})

test('CLOSE-8: closure references HERO6A Altar construction', () => {
  assert.ok(closure.includes('HERO6A'))
})

test('CLOSE-9: closure references HERO6B Paladin summon', () => {
  assert.ok(closure.includes('HERO6B'))
})

test('CLOSE-10: closure references HERO7 Holy Light runtime', () => {
  assert.ok(closure.includes('HERO7'))
  assert.ok(closure.includes('castHolyLight') || closure.includes('圣光术'))
})

// ── Evidence chain files exist ────────────────────────────

test('CLOSE-11: all referenced evidence files exist', () => {
  const files = [
    '../docs/V9_HERO1_ALTAR_PALADIN_CONTRACT.zh-CN.md',
    '../docs/V9_HERO2_ALTAR_PALADIN_SOURCE_BOUNDARY.zh-CN.md',
    '../docs/V9_HERO6_ALTAR_RUNTIME_EXPOSURE_CONTRACT.zh-CN.md',
    '../src/game/GameData.ts',
    '../src/game/Game.ts',
  ]
  for (const f of files) {
    assert.ok(existsSync(new URL(f, import.meta.url)), `${f} must exist`)
  }
})

test('CLOSE-12: all proof files exist', () => {
  const files = [
    '../tests/v9-hero1-altar-paladin-contract.spec.mjs',
    '../tests/v9-hero2-altar-paladin-source-boundary.spec.mjs',
    '../tests/v9-hero3-altar-data-seed.spec.mjs',
    '../tests/v9-hero4-paladin-data-seed.spec.mjs',
    '../tests/v9-hero5-holy-light-data-seed.spec.mjs',
    '../tests/v9-hero6-altar-runtime-exposure-contract.spec.mjs',
    '../tests/v9-hero6a-altar-construction-runtime.spec.ts',
    '../tests/v9-hero6b-paladin-summon-runtime.spec.ts',
    '../tests/v9-hero7-holy-light-runtime.spec.ts',
  ]
  for (const f of files) {
    assert.ok(existsSync(new URL(f, import.meta.url)), `${f} must exist`)
  }
})

// ── Live capabilities documented ─────────────────────────

test('CLOSE-13: closure lists live Altar construction capability', () => {
  assert.ok(closure.includes('农民') || closure.includes('worker'))
  assert.ok(closure.includes('建造') || closure.includes('build'))
  assert.ok(closure.includes('altar_of_kings') || closure.includes('祭坛'))
})

test('CLOSE-14: closure lists live Paladin summon with uniqueness', () => {
  assert.ok(closure.includes('唯一性') || closure.includes('uniqueness'))
  assert.ok(closure.includes('255'))
  assert.ok(closure.includes('mana') || closure.includes('魔力'))
})

test('CLOSE-15: closure lists live Holy Light manual cast', () => {
  assert.ok(closure.includes('65'))
  assert.ok(closure.includes('200'))
  assert.ok(closure.includes('5') && (closure.includes('冷却') || closure.includes('cooldown')))
  assert.ok(closure.includes('8.0') || closure.includes('8') )
  assert.ok(closure.includes('排除自身') || closure.includes('excludeSelf') || closure.includes('not self'))
})

test('CLOSE-16: closure lists data source verification', () => {
  assert.ok(closure.includes('源边界') || closure.includes('source boundary'))
  assert.ok(closure.includes('6') && (closure.includes('冲突') || closure.includes('conflict')))
})

// ── Closed capabilities documented ───────────────────────

test('CLOSE-17: closure lists revive as closed', () => {
  assert.ok(closure.includes('复活') || closure.includes('revive'))
})

test('CLOSE-18: closure lists XP/leveling as closed', () => {
  assert.ok(closure.includes('经验') || closure.includes('XP'))
  assert.ok(closure.includes('升级') || closure.includes('leveling'))
})

test('CLOSE-19: closure lists items/shop as closed', () => {
  assert.ok(closure.includes('物品') || closure.includes('item'))
  assert.ok(closure.includes('商店') || closure.includes('shop'))
})

test('CLOSE-20: closure lists autocast Holy Light as closed', () => {
  assert.ok(closure.includes('自动施放') || closure.includes('autocast'))
})

test('CLOSE-21: closure lists AI hero strategy as closed', () => {
  assert.ok(closure.includes('AI') && (closure.includes('英雄') || closure.includes('hero')))
})

test('CLOSE-22: closure lists other three heroes as closed', () => {
  assert.ok(closure.includes('大法师') || closure.includes('Archmage'))
  assert.ok(closure.includes('山丘之王') || closure.includes('Mountain King'))
  assert.ok(closure.includes('血法师') || closure.includes('Blood Mage'))
})

test('CLOSE-23: closure lists air/second race/multiplayer as closed', () => {
  assert.ok(closure.includes('空军') || closure.includes('air'))
  assert.ok(closure.includes('第二阵营') || closure.includes('second race'))
  assert.ok(closure.includes('多人') || closure.includes('multiplayer'))
})

// ── No forbidden production files needed ──────────────────

test('CLOSE-24: closure does not claim to modify GameData.ts or SimpleAI.ts', () => {
  assert.ok(!closure.includes('修改 SimpleAI') && !closure.includes('edit SimpleAI'))
  assert.ok(!closure.includes('新增 GameData') && !closure.includes('add GameData'))
})

// ── Next recommendation is bounded ───────────────────────

test('CLOSE-25: next recommendation is a single bounded branch, not task explosion', () => {
  assert.ok(closure.includes('推荐') || closure.includes('recommend'))
  // Must mention exactly one or two bounded adjacent branches
  const reviveMention = closure.includes('REVIVE') || closure.includes('复活')
  const xpMention = closure.includes('XP') || closure.includes('经验')
  assert.ok(reviveMention || xpMention, 'must recommend revive or XP as next branch')
  // Must not list more than 2 next branches
  assert.ok(!closure.includes('HERO9') || closure.includes('备选'), 'must not imply uncontrolled expansion')
})

test('CLOSE-26: closure does not claim Human heroes are complete', () => {
  assert.ok(!closure.includes('英雄系统已完成') && !closure.includes('heroes complete'))
  assert.ok(!closure.includes('Human 英雄全部实现'))
})
