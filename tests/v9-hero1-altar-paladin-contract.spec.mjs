/**
 * V9 HERO1 Altar + Paladin branch contract static proof.
 *
 * Proves the contract is well-formed, compatible with existing systems,
 * and does not open forbidden scope.
 */
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { test } from 'node:test'

const gameData = readFileSync(new URL('../src/game/GameData.ts', import.meta.url), 'utf8')
const game = readFileSync(new URL('../src/game/Game.ts', import.meta.url), 'utf8')
const contract = readFileSync(
  new URL('../docs/V9_HERO1_ALTAR_PALADIN_CONTRACT.zh-CN.md', import.meta.url),
  'utf8',
)
const gap = readFileSync(
  new URL('../docs/V9_HUMAN_CORE_GLOBAL_GAP_INVENTORY.zh-CN.md', import.meta.url),
  'utf8',
)

// ── Contract document shape ──────────────────────────────

test('HERO1-1: contract exists and covers all required sections', () => {
  assert.ok(contract.length > 500)
  assert.ok(contract.includes('Altar'), 'must cover Altar')
  assert.ok(contract.includes('Paladin'), 'must cover Paladin')
  assert.ok(contract.includes('Holy Light'), 'must cover Holy Light')
  assert.ok(contract.includes('复活'), 'must cover revival')
  assert.ok(contract.includes('后续切片'), 'must cover slice order')
  assert.ok(contract.includes('禁区'), 'must cover forbidden scope')
})

test('HERO1-2: contract defines Altar data fields', () => {
  assert.ok(contract.includes('altar_of_kings'))
  assert.ok(contract.includes("name | `'国王祭坛'`") || contract.includes('国王祭坛'))
  assert.ok(contract.includes('trains') || contract.includes('paladin'))
  assert.ok(contract.includes('180') && contract.includes('50'), 'cost must be defined')
  assert.ok(contract.includes('候选参考值'), 'exact values must be marked as candidate references')
})

test('HERO1-3: contract defines Paladin hero fields', () => {
  assert.ok(contract.includes("'paladin'"))
  assert.ok(contract.includes('圣骑士'))
  assert.ok(contract.includes('isHero'))
  assert.ok(contract.includes('heroLevel'))
  assert.ok(contract.includes('heroXP'))
  assert.ok(contract.includes('heroSkillPoints'))
  assert.ok(contract.includes('isDead'))
  assert.ok(contract.includes('reviveCost'))
})

test('HERO1-4: contract defines Holy Light ability', () => {
  assert.ok(contract.includes('holy_light'))
  assert.ok(contract.includes('圣光术'))
  assert.ok(contract.includes('flatHeal'), 'must use existing flatHeal effect type')
  assert.ok(contract.includes('mana'))
  assert.ok(contract.includes('targetRule'))
})

test('HERO1-5: contract defines revival mechanism', () => {
  assert.ok(contract.includes('isDead'))
  assert.ok(contract.includes('reviveCost'))
  assert.ok(contract.includes('复活'))
})

// ── Compatibility with existing systems ──────────────────

test('HERO1-6: contract references existing UnitDef interface fields', () => {
  // Verify UnitDef has the fields Paladin needs
  assert.ok(gameData.includes('interface UnitDef'), 'UnitDef must exist')
  assert.ok(gameData.includes('maxMana'), 'UnitDef must have maxMana')
  assert.ok(gameData.includes('manaRegen'), 'UnitDef must have manaRegen')
})

test('HERO1-7: contract references existing AbilityDef interface', () => {
  assert.ok(gameData.includes('interface AbilityDef'), 'AbilityDef must exist')
  assert.ok(gameData.includes('targetRule'), 'AbilityDef must have targetRule')
  assert.ok(gameData.includes('effectType'), 'AbilityDef must have effectType')
  assert.ok(gameData.includes('flatHeal'), 'flatHeal effect type must exist in runtime')
})

test('HERO1-8: contract references existing BuildingDef interface', () => {
  assert.ok(gameData.includes('interface BuildingDef'), 'BuildingDef must exist')
  assert.ok(gameData.includes('trains'), 'BuildingDef must have trains')
})

test('HERO1-9: Holy Light targetRule matches priest_heal pattern', () => {
  // Verify priest_heal exists and uses ally/injured targeting
  assert.ok(gameData.includes("teams: 'ally'"), 'ally targeting must exist')
  assert.ok(gameData.includes("includeCondition: 'injured'"), 'injured condition must exist')
  // Contract must specify same pattern
  assert.ok(contract.includes('ally'))
  assert.ok(contract.includes('injured'))
})

test('HERO1-10: Paladin and Holy Light runtime may exist after HERO7, but must use data', () => {
  // After HERO4, paladin data can exist in GameData
  if (gameData.includes("key: 'paladin'")) {
    const paladinBlock = gameData.match(/paladin:\s*\{[\s\S]*?\n\s{2}\},/)?.[0] ?? ''
    assert.ok(paladinBlock.includes('isHero: true'), 'paladin must be a hero unit')
    assert.ok(paladinBlock.includes('maxMana: 255'), 'paladin must have maxMana')
  }
  // After HERO6B/7, Game.ts may reference paladin/holy_light through hero-specific paths
  if (gameData.includes("key: 'holy_light'")) {
    const holyLightBlock = gameData.match(/holy_light:\s*\{[\s\S]*?\n\s{2}\},/)?.[0] ?? ''
    assert.ok(holyLightBlock.includes("ownerType: 'paladin'"), 'holy_light must belong to paladin')
    assert.ok(holyLightBlock.includes("effectType: 'flatHeal'"), 'holy_light must remain a flatHeal data seed')
  }
  assert.ok(!game.includes('holy_light') || game.includes('ABILITIES.holy_light'), 'holy_light in Game.ts must reference ABILITIES data')
})

test('HERO1-11: Altar contract remains compatible after later data seed', () => {
  assert.ok(contract.includes('HERO3'), 'contract must route Altar data through HERO3')
  if (gameData.includes("altar_of_kings")) {
    assert.ok(gameData.includes("key: 'altar_of_kings'"))
  }
})

test('HERO1-12: Paladin values are candidate references, not approved source data', () => {
  assert.ok(contract.includes('425'), 'Paladin gold cost ~425')
  assert.ok(contract.includes('100'), 'Paladin lumber cost ~100')
  assert.ok(contract.includes('HERO2-SRC1'), 'source boundary must happen before data seed')
  assert.ok(!contract.includes('War3 ROC 原版造价'), 'contract must not claim unverified exact source values')
})

// ── Existing research does not target Paladin ────────────

test('HERO1-13: Blacksmith researches do not target paladin', () => {
  for (const key of ['iron_forged_swords', 'steel_forged_swords', 'mithril_forged_swords',
    'black_gunpowder', 'refined_gunpowder', 'imbued_gunpowder',
    'iron_plating', 'steel_plating', 'mithril_plating',
    'studded_leather_armor', 'reinforced_leather_armor', 'dragonhide_armor',
    'animal_war_training']) {
    const match = gameData.match(new RegExp(`${key}:\\s*\\{[\\s\\S]*?\\n\\s{2}\\},`))
    const block = match?.[0] ?? ''
    assert.ok(!block.includes('paladin'), `${key} must not target paladin`)
  }
})

// ── Slice order ──────────────────────────────────────────

test('HERO1-14: contract defines clear slice order', () => {
  assert.ok(contract.includes('HERO2-SRC1'))
  assert.ok(contract.includes('HERO3'))
  assert.ok(contract.includes('HERO4'))
  assert.ok(contract.includes('HERO5'))
  assert.ok(contract.includes('HERO6'))
  assert.ok(contract.includes('HERO7'))
  assert.ok(contract.includes('HERO8'))
})

test('HERO1-15: slice order follows source -> data -> runtime -> proof pattern', () => {
  const hero2Idx = contract.indexOf('HERO2-SRC1')
  const hero3Idx = contract.indexOf('HERO3')
  const hero6Idx = contract.indexOf('HERO6')
  const hero8Idx = contract.indexOf('HERO8')
  assert.ok(hero2Idx < hero3Idx, 'source boundary must come before data seed')
  assert.ok(hero3Idx < hero6Idx, 'data seed must come before runtime')
  assert.ok(hero6Idx < hero8Idx, 'runtime must come before proof')
})

test('HERO1-16: contract specifies each slice requires previous accepted', () => {
  assert.ok(contract.includes('accepted'))
})

// ── Forbidden scope ──────────────────────────────────────

test('HERO1-17: contract does not open Archmage/MK/Blood Mage', () => {
  // These heroes may be mentioned as "future" but not as part of this contract
  const implSection = contract.match(/## 2\.[\s\S]*?(?=## 3)/)?.[0] ?? ''
  assert.ok(!implSection.includes('archmage'), 'Archmage not in Paladin implementation')
  assert.ok(!implSection.includes('mountain_king'), 'MK not in Paladin implementation')
})

test('HERO1-18: contract keeps items/shop closed', () => {
  assert.ok(!contract.includes('商店已实现') && !contract.includes('物品已实现'))
})

test('HERO1-19: contract keeps air, second race, multiplayer, public release closed', () => {
  assert.ok(contract.includes('空军') || contract.includes('air'))
  assert.ok(contract.includes('第二阵营') || contract.includes('second race'))
  assert.ok(contract.includes('多人') || contract.includes('multiplayer'))
})

test('HERO1-20: contract does not claim heroes are implemented', () => {
  // The implementation sections must not claim Paladin/Altar/Holy Light are done
  const contractLower = contract.toLowerCase()
  for (const forbidden of ['paladin 已实现', 'altar 已实现', 'holy light 已实现', '英雄系统已实现']) {
    assert.ok(!contractLower.includes(forbidden.toLowerCase()), `${forbidden} must not be claimed`)
  }
})

// ── Gap inventory consistency ────────────────────────────

test('HERO1-21: gap inventory still lists Paladin as missing', () => {
  assert.ok(gap.includes('Paladin'))
  assert.ok(!gap.includes('Paladin 已实现'))
})
