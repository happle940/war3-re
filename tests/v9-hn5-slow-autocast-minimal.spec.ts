/**
 * V9 HN5-IMPL5 Slow auto-cast minimal proof.
 *
 * Proves:
 * - Sorceress has a visible Slow auto-cast toggle.
 * - Auto-cast reuses castSlow and ABILITIES.slow data.
 * - Enabled auto-cast spends mana on a valid enemy target.
 * - It does not repeatedly spend mana while the target is already slowed.
 * - Disabled auto-cast and insufficient mana do not cast.
 */
import { readFileSync } from 'node:fs'
import { test, expect, type Page } from '@playwright/test'
import { ABILITIES } from '../src/game/GameData'

const BASE = 'http://127.0.0.1:4173/?runtimeTest=1'
const gameSource = readFileSync(new URL('../src/game/Game.ts', import.meta.url), 'utf8')
const aiSource = readFileSync(new URL('../src/game/SimpleAI.ts', import.meta.url), 'utf8')
const SLOW = ABILITIES.slow

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

test.describe('V9 HN5 Slow auto-cast minimal toggle', () => {
  test.setTimeout(120000)

  test.beforeEach(async ({ page }) => {
    await waitForGame(page)
  })

  test('H5A-1: auto-cast is a bounded Sorceress-only layer over manual Slow', () => {
    expect(gameSource).toContain('slowAutoCastEnabled')
    expect(gameSource).toContain('slowAutoCastCooldownUntil')
    expect(gameSource).toContain('findSlowAutoTarget')
    expect(gameSource).toContain('this.castSlow(unit, bestAutoTarget)')
    expect(gameSource).toContain('const slowDef = ABILITIES.slow')
    expect(gameSource).not.toContain('attackSpeedMultiplier')
    expect(gameSource).not.toContain('BuffSystem')
    expect(aiSource).not.toContain('slow')
    expect(aiSource).not.toContain('Slow')
  })

  test('H5A-2: command card toggles Slow auto-cast state visibly', async ({ page }) => {
    const result = await page.evaluate(() => {
      const g = (window as any).__war3Game
      if (!g) throw new Error('no game')

      const sorceress = g.spawnUnit('sorceress', 0, 52, 52)
      g.selectionModel.clear()
      g.selectionModel.setSelection([sorceress])
      g._lastCmdKey = ''
      g._lastSelKey = ''
      g.updateHUD(0.016)

      const beforeButtons = [...document.querySelectorAll('#command-card button')]
      const beforeLabels = beforeButtons.map((button) =>
        button.querySelector('.btn-label')?.textContent?.trim() ?? '',
      )
      const toggle = beforeButtons.find((button) =>
        button.querySelector('.btn-label')?.textContent?.trim() === '减速 (自动)',
      ) as HTMLButtonElement | undefined
      toggle?.click()

      g._lastCmdKey = ''
      g._lastSelKey = ''
      g.updateHUD(0.016)
      const afterLabels = [...document.querySelectorAll('#command-card button')]
        .map((button) => button.querySelector('.btn-label')?.textContent?.trim() ?? '')

      return {
        beforeLabels,
        afterLabels,
        enabledAfterClick: sorceress.slowAutoCastEnabled,
      }
    })

    expect(result.beforeLabels).toContain('减速')
    expect(result.beforeLabels).toContain('减速 (自动)')
    expect(result.enabledAfterClick).toBe(true)
    expect(result.afterLabels).toContain('减速 (自动) ✓')
  })

  test('H5A-3: enabled auto-cast spends once, skips already slowed targets, and refreshes near expiry', async ({ page }) => {
    const result = await page.evaluate(({ manaCost, duration }) => {
      const g = (window as any).__war3Game
      if (!g) throw new Error('no game')

      for (const unit of g.units) {
        if (unit.team !== 0 && !unit.isBuilding) unit.hp = 0
      }

      const sorceress = g.spawnUnit('sorceress', 0, 56, 56)
      const target = g.spawnUnit('footman', 1, 57, 56)
      sorceress.slowAutoCastEnabled = true
      sorceress.mana = manaCost * 3

      const beforeMana = sorceress.mana
      const beforeTime = g.gameTime
      g.updateCasterAbilities(0)
      const manaAfterFirst = sorceress.mana
      const firstUntil = target.slowUntil
      const cooldownAfterFirst = sorceress.slowAutoCastCooldownUntil

      g.gameTime = beforeTime + 1.5
      g.updateCasterAbilities(0)
      const manaAfterAlreadySlowed = sorceress.mana
      const untilAfterAlreadySlowed = target.slowUntil

      g.gameTime = firstUntil - 2.5
      sorceress.slowAutoCastCooldownUntil = 0
      g.updateCasterAbilities(0)
      const manaAfterRefresh = sorceress.mana
      const refreshedUntil = target.slowUntil

      return {
        firstSpent: beforeMana - manaAfterFirst,
        targetSlowed: firstUntil > beforeTime,
        firstDuration: firstUntil - beforeTime,
        cooldownAfterFirst,
        manaAfterAlreadySlowed,
        untilAfterAlreadySlowed,
        manaAfterFirst,
        firstUntil,
        refreshSpent: manaAfterAlreadySlowed - manaAfterRefresh,
        refreshedDuration: refreshedUntil - (firstUntil - 2.5),
      }
    }, { manaCost: SLOW.cost.mana ?? 0, duration: SLOW.duration })

    expect(result.firstSpent).toBe(SLOW.cost.mana)
    expect(result.targetSlowed).toBe(true)
    expect(result.firstDuration).toBeCloseTo(SLOW.duration, 4)
    expect(result.cooldownAfterFirst).toBeGreaterThan(0)
    expect(result.manaAfterAlreadySlowed).toBe(result.manaAfterFirst)
    expect(result.untilAfterAlreadySlowed).toBe(result.firstUntil)
    expect(result.refreshSpent).toBe(SLOW.cost.mana)
    expect(result.refreshedDuration).toBeCloseTo(SLOW.duration, 4)
  })

  test('H5A-4: disabled auto-cast and insufficient mana do not cast', async ({ page }) => {
    const result = await page.evaluate(({ manaCost }) => {
      const g = (window as any).__war3Game
      if (!g) throw new Error('no game')

      for (const unit of g.units) {
        if (unit.team !== 0 && !unit.isBuilding) unit.hp = 0
      }

      const disabledSorceress = g.spawnUnit('sorceress', 0, 60, 60)
      const disabledTarget = g.spawnUnit('footman', 1, 61, 60)
      disabledSorceress.slowAutoCastEnabled = false
      disabledSorceress.mana = manaCost
      g.updateCasterAbilities(0)

      const poorSorceress = g.spawnUnit('sorceress', 0, 62, 60)
      const poorTarget = g.spawnUnit('footman', 1, 63, 60)
      poorSorceress.slowAutoCastEnabled = true
      poorSorceress.mana = manaCost - 1
      g.updateCasterAbilities(0)

      return {
        disabledMana: disabledSorceress.mana,
        disabledTargetSlowed: disabledTarget.slowUntil > g.gameTime,
        poorMana: poorSorceress.mana,
        poorTargetSlowed: poorTarget.slowUntil > g.gameTime,
      }
    }, { manaCost: SLOW.cost.mana ?? 0 })

    expect(result.disabledMana).toBe(SLOW.cost.mana)
    expect(result.disabledTargetSlowed).toBe(false)
    expect(result.poorMana).toBe((SLOW.cost.mana ?? 0) - 1)
    expect(result.poorTargetSlowed).toBe(false)
  })
})
