/**
 * V9 HN7 melee upgrade source packet proof.
 *
 * Static proof that DATA3 has a bounded, sourced Level 1 scope before GameData is changed.
 */
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { test } from 'node:test'

const packet = readFileSync(
  new URL('../docs/V9_HN7_MELEE_UPGRADE_SOURCE_PACKET.zh-CN.md', import.meta.url),
  'utf8',
)

test('MELEE-SRC-1: source packet exists and cites current and legacy references', () => {
  assert.ok(packet.includes('Liquipedia'), 'Liquipedia current reference must be cited')
  assert.ok(packet.includes('GameFAQs'), 'GameFAQs legacy cross-check must be cited')
  assert.ok(packet.includes('https://liquipedia.net/warcraft/Iron_Forged_Swords'), 'Liquipedia URL must be present')
  assert.ok(packet.includes('https://gamefaqs.gamespot.com/pc/589475-warcraft-iii-the-frozen-throne/faqs/24822'), 'GameFAQs URL must be present')
})

test('MELEE-SRC-2: DATA3 is limited to Iron Forged Swords Level 1', () => {
  assert.ok(packet.includes('key: iron_forged_swords'), 'Level 1 key must be fixed')
  assert.ok(packet.includes('cost: 100 gold / 50 lumber'), 'Level 1 cost must be fixed')
  assert.ok(packet.includes('researchTime: 60'), 'Level 1 research time must be fixed')
  assert.ok(packet.includes('requiresBuilding: blacksmith'), 'Blacksmith requirement must be fixed')
})

test('MELEE-SRC-3: scalar mapping uses Damage Dice Bonus 1 as attackDamage +1', () => {
  assert.ok(packet.includes('Damage Dice Bonus 1'), 'source dice bonus must be stated')
  assert.ok(packet.includes('attackDamage +1'), 'project scalar mapping must be stated')
  assert.ok(packet.includes('没有 War3 的攻击骰子'), 'dice-model limitation must be explicit')
})

test('MELEE-SRC-4: affected current Human units are bounded', () => {
  for (const unit of ['footman', 'militia', 'knight']) {
    assert.ok(packet.includes(`${unit} attackDamage +1`), `${unit} must receive Level 1 melee effect`)
  }
})

test('MELEE-SRC-5: uncertain later levels are explicitly blocked', () => {
  assert.ok(packet.includes('不写入 Steel Forged Swords'), 'Steel level must be blocked')
  assert.ok(packet.includes('不写入 Mithril Forged Swords'), 'Mithril level must be blocked')
  assert.ok(packet.includes('不伪造二、三级成本和时间'), 'uncertain higher-level values must not be fabricated')
})

test('MELEE-SRC-6: forbidden scope blocks unrelated expansion', () => {
  for (const forbidden of ['Animal War Training', 'Gryphon Rider', 'Dragonhawk Rider', 'Spell Breaker', 'AI 升级策略']) {
    assert.ok(packet.includes(forbidden), `${forbidden} must be explicitly out of DATA3 scope`)
  }
})
