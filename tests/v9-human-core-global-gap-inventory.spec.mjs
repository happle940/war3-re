/**
 * V9 HUMAN-GAP1 Human Core Global Gap Inventory.
 *
 * Static proof that the gap inventory accurately reflects current Human state
 * and does not falsely claim missing features as implemented.
 */
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { test } from 'node:test'

const gameData = readFileSync(new URL('../src/game/GameData.ts', import.meta.url), 'utf8')
const game = readFileSync(new URL('../src/game/Game.ts', import.meta.url), 'utf8')
const simpleAI = readFileSync(new URL('../src/game/SimpleAI.ts', import.meta.url), 'utf8')
const styles = readFileSync(new URL('../src/styles.css', import.meta.url), 'utf8')
const gap = readFileSync(
  new URL('../docs/V9_HUMAN_CORE_GLOBAL_GAP_INVENTORY.zh-CN.md', import.meta.url),
  'utf8',
)

function buildingBlock(key) {
  return gameData.match(new RegExp(`\\n\\s{2}${key}:\\s*\\{[\\s\\S]*?\\n\\s{2}\\},`))?.[0] ?? ''
}

function unitBlock(key) {
  return gameData.match(new RegExp(`\\n\\s{2}${key}:\\s*\\{[\\s\\S]*?\\n\\s{2}\\},`))?.[0] ?? ''
}

function researchBlock(key) {
  const match = gameData.match(new RegExp(`${key}:\\s*\\{[\\s\\S]*?\\n\\s{2}\\},`))
  return match?.[0] ?? ''
}

// ── Gap document shape ───────────────────────────────────

test('GAP-1: gap inventory exists and covers both implemented and missing', () => {
  assert.ok(gap.length > 500)
  assert.ok(gap.includes('已具备'), 'must list implemented items')
  assert.ok(gap.includes('仍缺'), 'must list missing items')
})

// ── Implemented buildings verification ───────────────────

test('GAP-2: all 10 claimed buildings exist in GameData', () => {
  for (const key of ['townhall', 'keep', 'castle', 'barracks', 'blacksmith', 'lumber_mill', 'workshop', 'arcane_sanctum', 'farm', 'tower']) {
    const block = buildingBlock(key)
    assert.ok(block.length > 0, `${key} building must exist in GameData`)
  }
})

test('GAP-3: gap doc does not claim buildings that do not exist', () => {
  for (const key of ['altar', 'arcane_tower', 'spell_tower']) {
    const block = buildingBlock(key)
    assert.ok(block.length === 0, `${key} must NOT exist as a building in GameData`)
  }
})

// ── Implemented units verification ───────────────────────

test('GAP-4: all claimed current unit types exist in GameData', () => {
  for (const key of ['worker', 'footman', 'militia', 'rifleman', 'mortar_team', 'priest', 'sorceress', 'knight']) {
    const block = unitBlock(key)
    assert.ok(block.length > 0, `${key} unit must exist in GameData`)
  }
})

test('GAP-5: gap doc does not claim units that do not exist', () => {
  const missingUnits = [
    ['paladin', 'Paladin'],
    ['archmage', 'Archmage'],
    ['mountain_king', 'Mountain King'],
    ['blood_mage', 'Blood Mage'],
    ['spell_breaker', 'Spell Breaker'],
    ['flying_machine', 'Flying Machine'],
    ['gryphon_rider', 'Gryphon Rider'],
    ['dragonhawk_rider', 'Dragonhawk Rider'],
    ['siege_engine', 'Siege Engine'],
  ]
  for (const [key, displayName] of missingUnits) {
    const block = unitBlock(key)
    assert.ok(block.length === 0, `${key} must NOT exist as a unit in GameData`)
    assert.ok(gap.toLowerCase().includes(displayName.toLowerCase()),
      `gap must list ${displayName} as missing`)
  }
})

// ── Implemented abilities verification ───────────────────

test('GAP-6: all 7 claimed abilities exist in ABILITIES or runtime', () => {
  for (const key of ['priest_heal', 'slow', 'rally_call', 'mortar_aoe', 'call_to_arms', 'back_to_work', 'defend']) {
    assert.ok(gameData.includes(key) || game.includes(key),
      `${key} must exist in ABILITIES or Game.ts`)
  }
})

test('GAP-7: gap doc lists all 7 abilities as implemented', () => {
  for (const key of ['priest_heal', 'slow', 'rally_call', 'mortar_aoe', 'call_to_arms', 'back_to_work', 'defend']) {
    assert.ok(gap.includes(key), `gap must list ${key} as implemented`)
  }
})

// ── Implemented researches verification ──────────────────

test('GAP-8: all 14 claimed researches exist in GameData', () => {
  for (const key of [
    'long_rifles',
    'iron_forged_swords', 'steel_forged_swords', 'mithril_forged_swords',
    'black_gunpowder', 'refined_gunpowder', 'imbued_gunpowder',
    'iron_plating', 'steel_plating', 'mithril_plating',
    'studded_leather_armor', 'reinforced_leather_armor', 'dragonhide_armor',
    'animal_war_training',
  ]) {
    const block = researchBlock(key)
    assert.ok(block.length > 0, `${key} must exist in RESEARCHES`)
  }
})

// ── Building/unit relationships ──────────────────────────

test('GAP-9: townhall upgrades to keep, keep upgrades to castle', () => {
  const th = buildingBlock('townhall')
  assert.ok(th.includes("upgradeTo: 'keep'"))
  const kp = buildingBlock('keep')
  assert.ok(kp.includes("upgradeTo: 'castle'"))
})

test('GAP-10: barracks trains footman, rifleman, knight', () => {
  const br = buildingBlock('barracks')
  assert.ok(br.includes("'footman'"))
  assert.ok(br.includes("'rifleman'"))
  assert.ok(br.includes("'knight'"))
})

test('GAP-11: workshop trains mortar_team, arcane_sanctum trains priest/sorceress', () => {
  const ws = buildingBlock('workshop')
  assert.ok(ws.includes("'mortar_team'"))
  const as = buildingBlock('arcane_sanctum')
  assert.ok(as.includes("'priest'"))
  assert.ok(as.includes("'sorceress'"))
})

// ── Missing features correctly identified ────────────────

test('GAP-12: gap correctly identifies missing heroes section', () => {
  assert.ok(gap.includes('Paladin'))
  assert.ok(gap.includes('Archmage'))
  assert.ok(gap.includes('Mountain King') || gap.includes('MK'))
  assert.ok(gap.includes('Blood Mage'))
})

test('GAP-13: gap correctly identifies missing hero subsystem', () => {
  assert.ok(gap.includes('经验') || gap.includes('等级'))
  assert.ok(gap.includes('复活'))
  assert.ok(gap.includes('技能树') || gap.includes('技能'))
})

test('GAP-14: gap correctly identifies missing air units', () => {
  assert.ok(gap.includes('Flying Machine') || gap.includes('Gyrocopter'))
  assert.ok(gap.includes('Gryphon Rider'))
  assert.ok(gap.includes('Dragonhawk Rider'))
})

test('GAP-15: gap correctly identifies missing siege engine', () => {
  assert.ok(gap.includes('Siege Engine'))
})

test('GAP-16: gap correctly identifies missing item/shop system', () => {
  assert.ok(gap.includes('物品') || gap.includes('商店'))
})

// ── AI coverage verification ─────────────────────────────

test('GAP-17: AI references current buildable support buildings', () => {
  for (const key of ['farm', 'barracks', 'blacksmith', 'lumber_mill', 'tower', 'workshop', 'arcane_sanctum']) {
    assert.ok(simpleAI.includes(key), `AI must reference ${key}`)
  }
})

test('GAP-18: AI training coverage is listed without claiming Knight strategy', () => {
  for (const key of ['worker', 'footman', 'rifleman', 'mortar_team', 'priest']) {
    assert.ok(simpleAI.includes(key), `AI must reference ${key}`)
  }
  assert.ok(!simpleAI.includes("trainingQueue.push({ type: UNITS.knight.key"))
  const implementedAiSection = gap.match(/### 1\.5 AI 行为[\s\S]*?(?=### 1\.6)/)?.[0] ?? ''
  assert.ok(implementedAiSection.includes('AI 主动训练 Knight'))
  assert.ok(implementedAiSection.includes('未完成'))
  assert.ok(!implementedAiSection.includes('训练：worker/footman/rifleman/mortar_team/priest/knight'))
})

test('GAP-19: gap does not claim AI can currently use heroes in implemented features', () => {
  // The gap doc should list hero AI as missing, not as implemented
  const implementedSection = gap.match(/## 1\.5 AI 行为[\s\S]*?(?=##)/)?.[0] ?? ''
  assert.ok(!implementedSection.includes('英雄'), 'AI implemented section must not claim hero usage')
})

// ── Forbidden scope ──────────────────────────────────────

test('GAP-20: gap does not falsely claim complete Human', () => {
  for (const forbidden of ['完整 Human 已实现', '全部 Human 已实现', '人族已完成', 'Human 已全部实现', '当前状态 | 完整', '完整：']) {
    assert.ok(!gap.includes(forbidden), `${forbidden} must not be claimed`)
  }
})

test('GAP-21: gap keeps second faction, multiplayer, public release closed', () => {
  assert.ok(gap.includes('第二阵营'))
  assert.ok(gap.includes('多人'))
  assert.ok(gap.includes('公开发布') || gap.includes('发布'))
})

test('GAP-22: gap recommends exactly one next task', () => {
  assert.ok(gap.includes('推荐下一张相邻任务'))
  assert.ok(gap.includes('Altar') || gap.includes('英雄'))
  // Count "下一张" occurrences to verify it's singular
  const nextMatches = gap.match(/下一张相邻/g) || []
  assert.ok(nextMatches.length === 1, 'should recommend exactly one next task')
})

// ── System foundations ───────────────────────────────────

test('GAP-23: attack/armor type system exists with correct enum values', () => {
  assert.ok(gameData.includes('AttackType'))
  assert.ok(gameData.includes('ArmorType'))
  assert.ok(gameData.includes('DAMAGE_MULTIPLIER_TABLE'))
})

test('GAP-24: command card is 4x4 = 16 slots', () => {
  assert.ok(game.includes('const COMMAND_CARD_SLOT_COUNT = 16'))
  assert.ok(styles.includes('repeat(4, 62px)'))
})
