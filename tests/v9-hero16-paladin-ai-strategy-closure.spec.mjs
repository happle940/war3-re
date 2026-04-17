/**
 * V9 HERO16-CLOSE1 Paladin AI strategy closure static proof.
 *
 * Proves:
 *   1. Closure doc covers Task254-Task260.
 *   2. Closure doc references all HERO16 AI proof files.
 *   3. Closure doc states actual current Paladin AI capabilities.
 *   4. SimpleAI delegates active ability casts through Game.ts wrappers.
 *   5. Closure doc denies complete AI / hero system / Human / V9 release.
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

function assertIncludesAll(text, tokens, label) {
  for (const token of tokens) {
    assert.ok(text.includes(token), `${label} missing: ${token}`)
  }
}

describe('HERO16-CLOSE1 Paladin AI strategy closure', () => {
  const doc = read('docs/V9_HERO16_PALADIN_AI_STRATEGY_CLOSURE.zh-CN.md')

  it('CLOSE16-1: closure doc covers Task254 through Task260', () => {
    assertIncludesAll(doc, ['Task 254', 'Task 255', 'Task 256', 'Task 257', 'Task 258', 'Task 259', 'Task 260'], 'task chain')
  })

  it('CLOSE16-2: closure doc references the HERO16 contract proof', () => {
    assert.ok(doc.includes('tests/v9-hero16-paladin-ai-strategy-contract.spec.mjs'), 'missing strategy contract proof')
  })

  it('CLOSE16-3: closure doc references all runtime proof files', () => {
    assertIncludesAll(doc, [
      'tests/v9-hero16-ai-altar-paladin-summon.spec.ts',
      'tests/v9-hero16-ai-paladin-skill-learning.spec.ts',
      'tests/v9-hero16-ai-holy-light-cast.spec.ts',
      'tests/v9-hero16-ai-divine-shield-cast.spec.ts',
      'tests/v9-hero16-ai-resurrection-cast.spec.ts',
    ], 'runtime proof')
  })

  it('CLOSE16-4: closure doc states Altar and Paladin AI capability', () => {
    assertIncludesAll(doc, ['建造 Altar of Kings', '召唤一个 Paladin', '唯一性'], 'altar/paladin capability')
  })

  it('CLOSE16-5: closure doc states the skill-learning order', () => {
    assert.ok(doc.includes('Holy Light -> Divine Shield -> Devotion Aura -> Resurrection'), 'missing skill order')
  })

  it('CLOSE16-6: closure doc states Holy Light defensive cast boundary', () => {
    assertIncludesAll(doc, ['Holy Light', '受伤友方', '法力', '冷却', '范围'], 'Holy Light boundary')
  })

  it('CLOSE16-7: closure doc states Divine Shield low-HP self-preservation boundary', () => {
    assertIncludesAll(doc, ['Divine Shield', '低生命', '持续时间', '无敌'], 'Divine Shield boundary')
  })

  it('CLOSE16-8: closure doc states Devotion Aura is passive', () => {
    assertIncludesAll(doc, ['Devotion Aura', '被动技能', '不主动施放'], 'Devotion Aura boundary')
  })

  it('CLOSE16-9: closure doc states Resurrection cast and legal record boundary', () => {
    assertIncludesAll(doc, ['Resurrection', 'deadUnitRecords', '过滤', '复活数量'], 'Resurrection boundary')
  })

  it('CLOSE16-10: SimpleAI delegates active Paladin casts through context methods', () => {
    const ai = read('src/game/SimpleAI.ts')
    assertIncludesAll(ai, [
      'this.ctx.castHolyLight(paladin, target)',
      'this.ctx.castDivineShield(paladin)',
      'this.ctx.castResurrection(paladin)',
    ], 'SimpleAI delegation')
  })

  it('CLOSE16-11: Game.ts wrappers delegate to existing cast paths', () => {
    const game = read('src/game/Game.ts')
    assertIncludesAll(game, [
      'aiCastHolyLight(caster: Unit, target: Unit): boolean',
      'return this.castHolyLight(caster, target)',
      'aiCastDivineShield(caster: Unit): boolean',
      'return this.castDivineShield(caster)',
      'aiCastResurrection(caster: Unit): boolean',
      'return this.castResurrection(caster)',
    ], 'Game.ts wrapper delegation')
  })

  it('CLOSE16-12: closure doc states SimpleAI owns intent and Game.ts owns formulas', () => {
    assertIncludesAll(doc, ['只做意图选择', 'Game.ts', 'mana', 'cooldown', 'target rule', 'heal', 'revive'], 'delegation statement')
  })

  it('CLOSE16-13: closure doc aligns historical no-AI wording with current HERO16 state', () => {
    assertIncludesAll(doc, ['Task254', 'Task255', 'Task259', '完整 AI 英雄策略仍延后', 'Paladin 最小 AI 链路'], 'historical wording alignment')
  })

  it('CLOSE16-14: closure doc defers other heroes and higher AI strategy', () => {
    assertIncludesAll(doc, ['Archmage', 'Mountain King', 'Blood Mage', '侦查', '撤退', '编队', '威胁评估'], 'deferred AI scope')
  })

  it('CLOSE16-15: closure doc defers items, shops, Tavern, assets, air, campaign, second race and multiplayer', () => {
    assertIncludesAll(doc, ['物品', '商店', 'Tavern', '图标', '声音', '粒子', '空军', '战役', '第二种族', '多人联机'], 'deferred product scope')
  })

  it('CLOSE16-16: closure doc denies complete AI, hero system, Human and V9 release', () => {
    assertIncludesAll(doc, ['完整 AI 已完成', '完整英雄系统已完成', '完整人族已完成', 'V9 已发布'], 'contract denial')
  })

  it('CLOSE16-17: closure doc confirms no new runtime behavior in this closeout task', () => {
    assert.ok(doc.includes('不新增运行时行为'), 'closure task must be documentation/proof only')
  })
})
