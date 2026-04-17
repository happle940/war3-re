/**
 * V9 HERO6-CONTRACT4 Altar runtime exposure contract static proof.
 *
 * Proves the contract exists, splits Altar construction from Paladin summon
 * and Holy Light runtime, documents generic trains leakage risk, and confirms
 * current runtime isolation.
 */
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { test } from 'node:test'

const gameData = readFileSync(new URL('../src/game/GameData.ts', import.meta.url), 'utf8')
const game = readFileSync(new URL('../src/game/Game.ts', import.meta.url), 'utf8')
const simpleAI = readFileSync(new URL('../src/game/SimpleAI.ts', import.meta.url), 'utf8')
const contract = readFileSync(
  new URL('../docs/V9_HERO6_ALTAR_RUNTIME_EXPOSURE_CONTRACT.zh-CN.md', import.meta.url),
  'utf8',
)

// ── Contract document shape ──────────────────────────────

test('HERO6-1: contract exists and covers all required sections', () => {
  assert.ok(contract.length > 500)
  assert.ok(contract.includes('Altar') || contract.includes('祭坛'))
  assert.ok(contract.includes('Paladin') || contract.includes('圣骑士'))
  assert.ok(contract.includes('Holy Light') || contract.includes('圣光术'))
  assert.ok(contract.includes('禁区'))
  assert.ok(contract.includes('泄漏'))
})

test('HERO6-2: contract defines HERO6A/6B/6C/6D split', () => {
  assert.ok(contract.includes('HERO6A'))
  assert.ok(contract.includes('HERO6B'))
  assert.ok(contract.includes('HERO6C'))
  assert.ok(contract.includes('HERO6D'))
})

// ── Data exists (HERO3/4/5 boundary) ────────────────────

test('HERO6-3: altar_of_kings data exists in BUILDINGS', () => {
  const block = gameData.match(/\n\s{2}altar_of_kings:\s*\{[\s\S]*?\n\s{2}\},/)?.[0] ?? ''
  assert.ok(block.length > 0, 'altar_of_kings must exist')
  assert.ok(block.includes("trains: ['paladin']"))
})

test('HERO6-4: paladin data exists in UNITS with isHero', () => {
  const block = gameData.match(/\n\s{2}paladin:\s*\{[\s\S]*?\n\s{2}\},/)?.[0] ?? ''
  assert.ok(block.length > 0, 'paladin must exist')
  assert.ok(block.includes('isHero: true'))
  assert.ok(block.includes('maxMana: 255'))
})

test('HERO6-5: holy_light data exists in ABILITIES', () => {
  const block = gameData.match(/\n\s{2}holy_light:\s*\{[\s\S]*?\n\s{2}\},/)?.[0] ?? ''
  assert.ok(block.length > 0, 'holy_light must exist')
  assert.ok(block.includes("ownerType: 'paladin'"))
})

// ── PEASANT_BUILD_MENU: HERO6A opened altar ──────────────

test('HERO6-6: PEASANT_BUILD_MENU includes altar_of_kings after HERO6A', () => {
  const menuMatch = gameData.match(/PEASANT_BUILD_MENU\s*=\s*\[([^\]]*)\]/)?.[0] ?? ''
  assert.ok(menuMatch.length > 0, 'PEASANT_BUILD_MENU must exist')
  assert.ok(menuMatch.includes('altar_of_kings'), 'altar must be in build menu after HERO6A')
})

// ── Runtime isolation ────────────────────────────────────

test('HERO6-7: Game.ts does not reference altar_of_kings', () => {
  assert.ok(!game.includes('altar_of_kings'), 'Game.ts must not reference altar_of_kings')
})

test('HERO6-8: Game.ts may reference paladin through hero-specific path after HERO6B', () => {
  // After HERO6B, hero-specific summon path reads heroKey from data
  // After HERO7, Holy Light runtime may reference holy_light via ABILITIES
  if (game.includes('paladin')) {
    assert.ok(game.includes('isHero'), 'paladin reference must be through isHero hero-specific path')
  }
})

test('HERO6-9: Game.ts may reference holy_light through ABILITIES after HERO7', () => {
  if (game.includes('holy_light')) {
    assert.ok(game.includes('ABILITIES.holy_light'), 'holy_light reference must be through ABILITIES data')
  }
})

test('HERO6-10: SimpleAI does not reference altar_of_kings', () => {
  assert.ok(!simpleAI.includes('altar_of_kings'), 'SimpleAI must not reference altar')
})

// ── isHero guard in generic trains path ──────────────────

test('HERO6-10b: Game.ts generic trains path skips isHero units', () => {
  // The generic trains command-card loop must guard against isHero units
  const guardPattern = /isHero.*continue|if\s*\(\s*uDef\.isHero\s*\)\s*continue/
  assert.ok(guardPattern.test(game), 'generic trains path must skip isHero units')
})

// ── Contract documents trains leakage risk ────────────────

test('HERO6-11: contract documents generic trains leakage risk', () => {
  assert.ok(contract.includes('trains') && contract.includes('泄漏'), 'must document trains leakage')
  assert.ok(contract.includes('isHero') || contract.includes('hero'), 'must mention isHero check')
  assert.ok(contract.includes('唯一性') || contract.includes('uniqueness'), 'must mention uniqueness')
})

test('HERO6-12: contract explains why trains data is unsafe for automatic runtime', () => {
  assert.ok(
    contract.includes('不可') && contract.includes('直接') && contract.includes('运行时'),
    'must explain trains data is not safe for direct runtime',
  )
  assert.ok(
    contract.includes('英雄专用路径') || contract.includes('hero-specific'),
    'must require hero-specific path',
  )
})

// ── Contract splits Altar construction from Paladin summon ─

test('HERO6-13: contract splits Altar construction (6A) from Paladin summon (6B)', () => {
  const hero6aIdx = contract.indexOf('HERO6A')
  const hero6bIdx = contract.indexOf('HERO6B')
  assert.ok(hero6aIdx > 0, 'HERO6A must exist')
  assert.ok(hero6bIdx > 0, 'HERO6B must exist')
  assert.ok(hero6aIdx < hero6bIdx, '6A must come before 6B')
  // 6A must mention build menu / construction
  const section6a = contract.substring(hero6aIdx, hero6bIdx)
  assert.ok(
    section6a.includes('建造菜单') || section6a.includes('PEASANT_BUILD_MENU') || section6a.includes('建造'),
    '6A must cover construction/build menu',
  )
})

test('HERO6-14: contract splits Paladin summon (6B) from Holy Light (6D/7)', () => {
  const hero6bIdx = contract.indexOf('HERO6B')
  const hero7Idx = contract.indexOf('HERO7')
  assert.ok(hero6bIdx > 0, 'HERO6B must exist')
  assert.ok(hero7Idx > 0, 'HERO7 must exist')
  assert.ok(hero6bIdx < hero7Idx, '6B must come before 7')
  // 6D must say Holy Light stays closed
  const hero6dIdx = contract.indexOf('HERO6D')
  assert.ok(hero6dIdx > 0, 'HERO6D must exist')
  const section6d = contract.substring(hero6dIdx, hero7Idx)
  assert.ok(
    section6d.includes('关闭') || section6d.includes('不开放') || section6d.includes('保持'),
    '6D must keep Holy Light closed',
  )
})

// ── Contract mentions hero constraints needed ─────────────

test('HERO6-15: contract lists missing hero constraints in generic trains path', () => {
  assert.ok(contract.includes('唯一性'), 'must document uniqueness constraint')
  assert.ok(contract.includes('复活') || contract.includes('revive'), 'must document revive constraint')
  assert.ok(contract.includes('mana') || contract.includes('Mana'), 'must document mana init')
})

test('HERO6-16: contract defines isHero runtime semantics', () => {
  assert.ok(contract.includes('isHero'))
  assert.ok(contract.includes('运行时语义') || contract.includes('runtime'))
})

// ── Contract keeps forbidden scope closed ─────────────────

test('HERO6-17: contract does not open Archmage/MK/Blood Mage', () => {
  const implSection = contract.match(/## 3\.[\s\S]*?(?=## 4)/)?.[0] ?? ''
  assert.ok(!implSection.includes('archmage'), 'Archmage not in HERO6 scope')
  assert.ok(!implSection.includes('mountain_king'), 'MK not in HERO6 scope')
  assert.ok(!implSection.includes('blood_mage'), 'Blood Mage not in HERO6 scope')
})

test('HERO6-18: contract keeps items/shop/air/second race/multiplayer closed', () => {
  assert.ok(contract.includes('禁区'))
  assert.ok(contract.includes('物品') || contract.includes('item'))
  assert.ok(contract.includes('空军') || contract.includes('air'))
  assert.ok(contract.includes('第二阵营') || contract.includes('second race'))
  assert.ok(contract.includes('多人') || contract.includes('multiplayer'))
})

// ── Contract references data-to-runtime mapping ──────────

test('HERO6-19: contract defines data-to-runtime mapping for hero fields', () => {
  assert.ok(
    contract.includes('currentMana') || contract.includes('maxMana'),
    'must define mana initialization mapping',
  )
  assert.ok(
    contract.includes('heroLevel') || contract.includes('heroSkillPoints'),
    'must define hero field initialization',
  )
})

// ── Slice order ──────────────────────────────────────────

test('HERO6-20: contract defines clear slice order after HERO6', () => {
  assert.ok(contract.includes('HERO6A'))
  assert.ok(contract.includes('HERO6B'))
  assert.ok(contract.includes('HERO6C'))
  assert.ok(contract.includes('HERO7'))
  assert.ok(contract.includes('HERO8'))
})

test('HERO6-21: contract requires each slice accepted before next', () => {
  assert.ok(contract.includes('accepted'))
})

// ── Verification checklist ───────────────────────────────

test('HERO6-22: contract includes verification checklist', () => {
  assert.ok(contract.includes('验证清单') || contract.includes('checklist'))
})
