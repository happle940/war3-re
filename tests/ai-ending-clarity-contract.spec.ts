/**
 * AI Ending Clarity Contract
 *
 * Deterministic runtime proof that end-state semantics stay crisp:
 *   1. destroying the player's townhall still yields defeat
 *   2. destroying the AI townhall still yields victory
 *   3. a long-lived standstill with both townhalls alive yields stall
 */
import { test, expect, type Page } from '@playwright/test'

const BASE = 'http://127.0.0.1:4173/?runtimeTest=1'

async function waitForGame(page: Page) {
  const consoleErrors: string[] = []
  page.on('console', (msg) => {
    if (msg.type() === 'error') consoleErrors.push(msg.text())
  })
  ;(page as any).__consoleErrors = consoleErrors

  await page.goto(BASE, { waitUntil: 'domcontentloaded' })

  await page.waitForFunction(() => {
    const canvas = document.getElementById('game-canvas')
    if (!canvas) return false
    const rect = canvas.getBoundingClientRect()
    if (rect.width === 0 || rect.height === 0) return false
    const game = (window as any).__war3Game
    if (!game) return false
    if (!Array.isArray(game.units) || game.units.length === 0) return false
    if (!game.renderer) return false
    return game.renderer.domElement.width > 0
  }, { timeout: 15000 })

  await page.waitForFunction(() => {
    const status = document.getElementById('map-status')?.textContent ?? ''
    return !status.includes('正在加载')
  }, { timeout: 15000 }).catch(() => {})

  await page.waitForTimeout(500)
}

async function getOverlayState(page: Page) {
  return page.evaluate(() => {
    const overlay = document.getElementById('game-over-overlay')
    const textEl = document.getElementById('game-over-text')
    const resultsShell = document.getElementById('results-shell')
    const resultsMessage = document.getElementById('results-shell-message')
    return {
      overlayVisible: overlay ? overlay.style.display !== 'none' : null,
      overlayClass: overlay?.className ?? '',
      overlayText: textEl?.textContent ?? '',
      resultsHidden: resultsShell ? resultsShell.hidden : null,
      resultsAriaHidden: resultsShell?.getAttribute('aria-hidden') ?? null,
      resultsText: resultsMessage?.textContent ?? '',
    }
  })
}

test.describe('AI Ending Clarity Contract', () => {
  test.setTimeout(60000)

  test('destroying the player townhall still yields defeat', async ({ page }) => {
    await waitForGame(page)

    const result = await page.evaluate(() => {
      const g = (window as any).__war3Game
      const playerTH = g.units.find((u: any) => u.team === 0 && u.type === 'townhall' && u.isBuilding)
      if (!playerTH) return { error: 'no player townhall' }

      const before = g.getMatchResult()
      playerTH.hp = 0
      for (let i = 0; i < 10; i++) g.update(0.05)

      return {
        before,
        after: g.getMatchResult(),
        phase: g.phase.get(),
      }
    })

    const overlay = await getOverlayState(page)

    expect(result.error).toBeUndefined()
    expect(result.before, 'match should be unresolved before player TH death').toBeNull()
    expect(result.after, 'player TH death should still resolve to defeat').toBe('defeat')
    expect(result.phase, 'terminal state should use the GameOver phase').toBe('game_over')
    expect(overlay.overlayVisible, 'defeat should show the overlay').toBe(true)
    expect(overlay.overlayClass, 'defeat should mark the overlay class').toContain('defeat')
    expect(overlay.overlayText, 'defeat should stay legible on the overlay').toBe('失败')
    expect(overlay.resultsHidden, 'results shell should become visible for defeat').toBe(false)
    expect(overlay.resultsText, 'results shell should mirror defeat').toBe('失败')
  })

  test('destroying the AI townhall still yields victory', async ({ page }) => {
    await waitForGame(page)

    const result = await page.evaluate(() => {
      const g = (window as any).__war3Game
      const aiTH = g.units.find((u: any) => u.team === 1 && u.type === 'townhall' && u.isBuilding)
      if (!aiTH) return { error: 'no AI townhall' }

      const before = g.getMatchResult()
      aiTH.hp = 0
      for (let i = 0; i < 10; i++) g.update(0.05)

      return {
        before,
        after: g.getMatchResult(),
        phase: g.phase.get(),
      }
    })

    const overlay = await getOverlayState(page)

    expect(result.error).toBeUndefined()
    expect(result.before, 'match should be unresolved before AI TH death').toBeNull()
    expect(result.after, 'AI TH death should still resolve to victory').toBe('victory')
    expect(result.phase, 'terminal state should use the GameOver phase').toBe('game_over')
    expect(overlay.overlayVisible, 'victory should show the overlay').toBe(true)
    expect(overlay.overlayClass, 'victory should mark the overlay class').toContain('victory')
    expect(overlay.overlayText, 'victory should stay legible on the overlay').toBe('胜利')
    expect(overlay.resultsHidden, 'results shell should become visible for victory').toBe(false)
    expect(overlay.resultsText, 'results shell should mirror victory').toBe('胜利')
  })

  test('a standstill with both townhalls alive yields stall', async ({ page }) => {
    await waitForGame(page)

    const result = await page.evaluate(() => {
      const g = (window as any).__war3Game
      const playerTH = g.units.find((u: any) => u.team === 0 && u.type === 'townhall' && u.isBuilding)
      const aiTH = g.units.find((u: any) => u.team === 1 && u.type === 'townhall' && u.isBuilding)
      if (!playerTH) return { error: 'no player townhall' }
      if (!aiTH) return { error: 'no AI townhall' }

      const stallAt = g.constructor.STALL_VERDICT_SECONDS
      const before = g.getMatchResult()
      g.gameTime = stallAt - 0.05
      g.update(0.1)

      return {
        before,
        after: g.getMatchResult(),
        phase: g.phase.get(),
        stallAt,
      }
    })

    const overlay = await getOverlayState(page)

    expect(result.error).toBeUndefined()
    expect(result.before, 'stall should not pre-exist before the threshold').toBeNull()
    expect(result.after, 'surviving both townhalls past the cap should resolve to stall').toBe('stall')
    expect(result.phase, 'stall should still use the GameOver phase').toBe('game_over')
    expect(overlay.overlayVisible, 'stall should show the overlay').toBe(true)
    expect(overlay.overlayClass, 'stall should mark the overlay class').toContain('stall')
    expect(overlay.overlayText, 'stall should stay legible on the overlay').toBe('僵局')
    expect(overlay.resultsHidden, 'results shell should become visible for stall').toBe(false)
    expect(overlay.resultsText, 'results shell should mirror stall').toBe('僵局')
  })
})
