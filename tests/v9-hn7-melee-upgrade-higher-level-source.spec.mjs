/**
 * V9 HN7-SRC4 Steel / Mithril source reconciliation proof.
 *
 * Static proof only: this verifies that higher-level melee upgrade values and
 * boundaries are sourced before any Steel / Mithril data is written.
 */
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { test } from 'node:test'

const packet = readFileSync(
  new URL('../docs/V9_HN7_MELEE_UPGRADE_SOURCE_PACKET.zh-CN.md', import.meta.url),
  'utf8',
)
const game = readFileSync(new URL('../src/game/Game.ts', import.meta.url), 'utf8')

test('HN7-SRC4-1: source packet records authoritative and conflicting sources', () => {
  assert.ok(packet.includes('https://classic.battle.net/war3/human/buildings/blacksmith.shtml'))
  assert.ok(packet.includes('Blizzard Classic Battle.net'), 'primary source must be named')
  assert.ok(packet.includes('https://gamefaqs.gamespot.com/pc/256222-warcraft-iii-reign-of-chaos/faqs/18219'))
  assert.ok(packet.includes('旧版冲突样本'), 'conflicting legacy source must be recorded')
})

test('HN7-SRC4-2: Steel Forged Swords values are fixed for DATA4', () => {
  for (const expected of [
    'key: steel_forged_swords',
    'name: 钢剑',
    'cost: 175 gold / 175 lumber',
    'researchTime: 75',
    'requiresBuilding: keep',
    'prerequisiteResearch: iron_forged_swords',
  ]) {
    assert.ok(packet.includes(expected), `${expected} must be fixed`)
  }
})

test('HN7-SRC4-3: Mithril Forged Swords values are fixed for DATA4', () => {
  for (const expected of [
    'key: mithril_forged_swords',
    'name: 秘银剑',
    'cost: 250 gold / 300 lumber',
    'researchTime: 90',
    'requiresBuilding: castle',
    'prerequisiteResearch: steel_forged_swords',
  ]) {
    assert.ok(packet.includes(expected), `${expected} must be fixed`)
  }
})

test('HN7-SRC4-4: current scalar mapping is incremental +1 per level', () => {
  assert.ok(packet.includes('每一级新增一个增量 +1'))
  assert.ok(packet.includes('不能把 Steel 的 `Damage Dice Bonus 2` 直接写成单条 `attackDamage +2`'))
  assert.ok(packet.includes('不能把 Mithril 的 `Damage Dice Bonus 3` 写成单条 `attackDamage +3`'))
  for (const unit of ['footman', 'militia', 'knight']) {
    assert.ok(packet.includes(`${unit} attackDamage +1`), `${unit} must be in bounded current unit set`)
  }
})

test('HN7-SRC4-5: DATA4 is allowed but narrowly bounded', () => {
  assert.ok(packet.includes('允许下一张任务进入 `HN7-DATA4 — Steel / Mithril melee upgrade data seed`'))
  assert.ok(packet.includes('不修改 runtime'))
  assert.ok(packet.includes('不新增 AI'))
  assert.ok(packet.includes('不新增远程/护甲/AWT'))
  assert.ok(packet.includes('不新增英雄、空军、物品或素材'))
})

test('HN7-SRC4-6: source proof stays data-only and runtime-neutral', () => {
  assert.ok(packet.includes('但必须只做以下事情'), 'DATA4 boundary must be narrow')
  for (const forbidden of ['steel_forged_swords', 'mithril_forged_swords']) {
    assert.ok(!game.includes(forbidden), `${forbidden} runtime special case must not exist before DATA4`)
  }
})
