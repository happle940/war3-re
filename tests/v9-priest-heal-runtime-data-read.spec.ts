/**
 * V9 HN3-IMPL3 Priest Heal runtime data-read migration.
 *
 * Proves:
 * - castHeal reads ABILITIES.priest_heal instead of direct PRIEST_HEAL_* constants.
 * - Heal runtime behavior stays unchanged: HP restored, mana spent, cooldown, range.
 * - Invalid targets remain rejected: enemy, full HP, out of range, no mana.
 * - Priest auto-heal consumes the same ability data path.
 */
import { readFileSync } from 'node:fs'
import { test, expect, type Page } from '@playwright/test'
import { ABILITIES } from '../src/game/GameData'

const BASE = 'http://127.0.0.1:4173/?runtimeTest=1'
const HEAL = ABILITIES.priest_heal
const HEAL_EXPECTED = {
  manaCost: HEAL.cost.mana ?? 0,
  cooldown: HEAL.cooldown,
  range: HEAL.range,
  amount: HEAL.effectValue,
}

async function waitForGame(page: Page) {
  const consoleErrors: string[] = []
  page.on('console', (msg) => {
    if (msg.type() === 'error') consoleErrors.push(msg.text())
  })
  ;(page as any).__consoleErrors = consoleErrors

  await page.goto(BASE, { waitUntil: 'domcontentloaded' })
  await page.waitForFunction(() => {
    const canvas = document.getElementById('game-canvas')
    const game = (window as any).__war3Game
    if (!canvas || !game || !game.renderer) return false
    if (!Array.isArray(game.units) || game.units.length === 0) return false
    return game.renderer.domElement.width > 0
  }, { timeout: 15000 })

  try {
    await page.waitForFunction(() => {
      const status = document.getElementById('map-status')?.textContent ?? ''
      return !status.includes('正在加载')
    }, { timeout: 15000 })
  } catch {
    // Procedural fallback is valid in runtime-test mode.
  }

  await page.evaluate(() => {
    const g = (window as any).__war3Game
    if (g?.ai) {
      if (typeof g.ai.reset === 'function') g.ai.reset()
      g.ai.update = () => {}
    }
  })
  await page.waitForTimeout(300)
}

test.describe('V9 Priest Heal runtime data-read migration', () => {
  test.setTimeout(120000)

  test('DR-1: castHeal source reads ABILITIES.priest_heal for runtime values', async () => {
    const source = readFileSync('src/game/Game.ts', 'utf8')
    const start = source.indexOf('castHeal(priest: Unit, target: Unit): boolean')
    const end = source.indexOf('/** 攻击移动完成', start)
    expect(start).toBeGreaterThanOrEqual(0)
    expect(end).toBeGreaterThan(start)

    const castHeal = source.slice(start, end)
    expect(castHeal).toContain('const healDef = ABILITIES.priest_heal')
    expect(castHeal).toContain('healDef.cost.mana')
    expect(castHeal).toContain('healDef.range')
    expect(castHeal).toContain('healDef.cooldown')
    expect(castHeal).toContain('healDef.effectValue')
    expect(castHeal).not.toContain('PRIEST_HEAL_MANA_COST')
    expect(castHeal).not.toContain('PRIEST_HEAL_RANGE')
    expect(castHeal).not.toContain('PRIEST_HEAL_COOLDOWN')
    expect(castHeal).not.toContain('PRIEST_HEAL_AMOUNT')
  })

  test('DR-2: direct castHeal restores HP, spends mana, and sets cooldown from ability data', async ({ page }) => {
    await waitForGame(page)

    const result = await page.evaluate((expected) => {
      const g = (window as any).__war3Game
      if (!g) throw new Error('no game')

      const priest = g.spawnUnit('priest', 0, 60, 60)
      const ally = g.spawnUnit('footman', 0, 60, 61)
      priest.mana = expected.manaCost
      priest.healCooldownUntil = 0
      ally.hp = ally.maxHp - 50

      const beforeTime = g.gameTime
      const beforeHp = ally.hp
      const beforeMana = priest.mana
      const ok = g.castHeal(priest, ally)

      const data = {
        ok,
        hpRestored: ally.hp - beforeHp,
        manaSpent: beforeMana - priest.mana,
        cooldownDelta: priest.healCooldownUntil - beforeTime,
        priestRemainingMana: priest.mana,
      }

      for (const unit of [priest, ally]) unit.hp = 0
      g.handleDeadUnits()
      return data
    }, HEAL_EXPECTED)

    expect(result.ok).toBe(true)
    expect(result.hpRestored).toBe(HEAL_EXPECTED.amount)
    expect(result.manaSpent).toBe(HEAL_EXPECTED.manaCost)
    expect(result.priestRemainingMana).toBe(0)
    expect(result.cooldownDelta).toBeCloseTo(HEAL_EXPECTED.cooldown, 5)
  })

  test('DR-3: direct castHeal still rejects invalid targets', async ({ page }) => {
    await waitForGame(page)

    const result = await page.evaluate((expected) => {
      const g = (window as any).__war3Game
      if (!g) throw new Error('no game')

      const priest = g.spawnUnit('priest', 0, 62, 62)
      const ally = g.spawnUnit('footman', 0, 62, 63)
      const enemy = g.spawnUnit('footman', 1, 63, 62)
      const farAlly = g.spawnUnit('footman', 0, 62 + expected.range + 4, 62)
      ally.hp = ally.maxHp - 50
      enemy.hp = enemy.maxHp - 50
      farAlly.hp = farAlly.maxHp - 50

      priest.mana = expected.manaCost
      priest.healCooldownUntil = 0
      const goodHeal = g.castHeal(priest, ally)

      ally.hp = Math.max(1, ally.hp - expected.amount)
      const cooldownHeal = g.castHeal(priest, ally)

      priest.healCooldownUntil = 0
      priest.mana = expected.manaCost - 1
      const noManaHeal = g.castHeal(priest, ally)

      priest.mana = expected.manaCost
      ally.hp = ally.maxHp
      const fullHpHeal = g.castHeal(priest, ally)

      const enemyHeal = g.castHeal(priest, enemy)
      const rangeHeal = g.castHeal(priest, farAlly)

      for (const unit of [priest, ally, enemy, farAlly]) unit.hp = 0
      g.handleDeadUnits()

      return { goodHeal, cooldownHeal, noManaHeal, fullHpHeal, enemyHeal, rangeHeal }
    }, HEAL_EXPECTED)

    expect(result.goodHeal).toBe(true)
    expect(result.cooldownHeal).toBe(false)
    expect(result.noManaHeal).toBe(false)
    expect(result.fullHpHeal).toBe(false)
    expect(result.enemyHeal).toBe(false)
    expect(result.rangeHeal).toBe(false)
  })

  test('DR-4: priest auto-heal uses the same ability values', async ({ page }) => {
    await waitForGame(page)

    const result = await page.evaluate((expected) => {
      const g = (window as any).__war3Game
      if (!g) throw new Error('no game')

      const priest = g.spawnUnit('priest', 0, 64, 64)
      const ally = g.spawnUnit('footman', 0, 64, 65)
      priest.mana = expected.manaCost
      priest.healCooldownUntil = 0
      ally.hp = ally.maxHp - 60

      const beforeTime = g.gameTime
      const beforeHp = ally.hp
      const beforeMana = priest.mana
      g.updateCasterAbilities(0)

      const data = {
        hpRestored: ally.hp - beforeHp,
        manaSpent: beforeMana - priest.mana,
        cooldownDelta: priest.healCooldownUntil - beforeTime,
      }

      for (const unit of [priest, ally]) unit.hp = 0
      g.handleDeadUnits()
      return data
    }, HEAL_EXPECTED)

    expect(result.hpRestored).toBe(HEAL_EXPECTED.amount)
    expect(result.manaSpent).toBe(HEAL_EXPECTED.manaCost)
    expect(result.cooldownDelta).toBeCloseTo(HEAL_EXPECTED.cooldown, 5)
  })
})
