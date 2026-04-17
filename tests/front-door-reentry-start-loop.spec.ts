/**
 * Front-Door Re-entry Start Loop Contract
 *
 * Proves that after returning to menu, the front door can start the next
 * session again through the same truthful source path, and no stale state
 * leaks into the restarted session.
 */
import { test, expect, type Page } from '@playwright/test'

const BASE_NORMAL = 'http://127.0.0.1:4173/'

async function waitForBoot(page: Page) {
  const consoleErrors: string[] = []
  page.on('console', (msg) => {
    if (msg.type() === 'error') consoleErrors.push(msg.text())
  })
  ;(page as any).__consoleErrors = consoleErrors

  await page.goto(BASE_NORMAL, { waitUntil: 'domcontentloaded' })
  await page.waitForFunction(() => {
    const game = (window as any).__war3Game
    if (!game) return false
    const canvas = document.getElementById('game-canvas')
    if (!canvas) return false
    if (!game.renderer) return false
    const el = game.renderer.domElement
    if (el.width === 0 || el.height === 0) return false
    if (!Array.isArray(game.units) || game.units.length === 0) return false
    return true
  }, { timeout: 15000 })
  await page.waitForTimeout(500)
}

test.describe('Front-Door Re-entry Start Loop', () => {
  test.setTimeout(120000)

  test('menu shows correct source after return-to-menu', async ({ page }) => {
    await waitForBoot(page)

    const result = await page.evaluate(async () => {
      const g = (window as any).__war3Game
      const menuSourceLabel = document.getElementById('menu-map-source-label')!
      const menuStartBtn = document.getElementById('menu-start-button') as HTMLButtonElement
      const briefingStartBtn = document.getElementById('briefing-start-button') as HTMLButtonElement
      const returnToMenu = (window as any).__returnToMenu as () => void
      const getMapSourceLabel = (window as any).__getMapSourceLabel as () => string

      // Start → briefing → play → pause → return to menu
      menuStartBtn.click()
      await new Promise(r => setTimeout(r, 50))
      briefingStartBtn.click()
      await new Promise(r => setTimeout(r, 50))
      g.pauseGame()
      returnToMenu()
      await new Promise(r => setTimeout(r, 100))

      const sourceLabel = menuSourceLabel.textContent
      const derivedLabel = getMapSourceLabel()
      const sourceKind = g.currentMapSource?.kind

      return { sourceLabel, derivedLabel, sourceKind }
    })

    expect(result.sourceKind).toBe('procedural')
    expect(result.sourceLabel).toBe(result.derivedLabel)
    expect(result.sourceLabel).toContain('程序化地图')
  })

  test('starting again from front door re-enters play cleanly', async ({ page }) => {
    await waitForBoot(page)

    const result = await page.evaluate(async () => {
      const g = (window as any).__war3Game
      const menuShell = document.getElementById('menu-shell')!
      const menuStartBtn = document.getElementById('menu-start-button') as HTMLButtonElement
      const briefingStartBtn = document.getElementById('briefing-start-button') as HTMLButtonElement
      const returnToMenu = (window as any).__returnToMenu as () => void

      // Start → briefing → play → pause → return to menu
      menuStartBtn.click()
      await new Promise(r => setTimeout(r, 50))
      briefingStartBtn.click()
      await new Promise(r => setTimeout(r, 50))
      g.pauseGame()
      returnToMenu()
      await new Promise(r => setTimeout(r, 100))

      // Now start again: menu → briefing → play
      menuStartBtn.click()
      await new Promise(r => setTimeout(r, 50))
      briefingStartBtn.click()
      await new Promise(r => setTimeout(r, 50))

      const isPlaying = g.phase.isPlaying()
      const menuHidden = menuShell.hidden
      const hasUnits = Array.isArray(g.units) && g.units.length > 0

      return { isPlaying, menuHidden, hasUnits }
    })

    expect(result.isPlaying).toBe(true)
    expect(result.menuHidden).toBe(true)
    expect(result.hasUnits).toBe(true)
  })

  test('stale menu/pause/results state does not leak into restarted session', async ({ page }) => {
    await waitForBoot(page)

    const result = await page.evaluate(async () => {
      const g = (window as any).__war3Game
      const menuShell = document.getElementById('menu-shell')!
      const pauseShell = document.getElementById('pause-shell')!
      const resultsShell = document.getElementById('results-shell')!
      const menuStartBtn = document.getElementById('menu-start-button') as HTMLButtonElement
      const briefingStartBtn = document.getElementById('briefing-start-button') as HTMLButtonElement
      const returnToMenu = (window as any).__returnToMenu as () => void

      // Full cycle: start → briefing → play → pause → return → start again
      menuStartBtn.click()
      await new Promise(r => setTimeout(r, 50))
      briefingStartBtn.click()
      await new Promise(r => setTimeout(r, 50))

      g.pauseGame()
      returnToMenu()
      await new Promise(r => setTimeout(r, 100))

      menuStartBtn.click()
      await new Promise(r => setTimeout(r, 50))
      briefingStartBtn.click()
      await new Promise(r => setTimeout(r, 50))

      const menuHidden = menuShell.hidden
      const pauseHidden = pauseShell.hidden
      const resultsHidden = resultsShell.hidden
      const isPlaying = g.phase.isPlaying()
      const isPaused = g.isPaused()
      const isGameOver = g.phase.isGameOver()
      const matchResult = g.getMatchResult()
      const gameTimeSmall = g.gameTime < 1

      return {
        menuHidden, pauseHidden, resultsHidden,
        isPlaying, isPaused, isGameOver, matchResult, gameTimeSmall,
      }
    })

    // Only gameplay active, all shells hidden
    expect(result.menuHidden).toBe(true)
    expect(result.pauseHidden).toBe(true)
    expect(result.resultsHidden).toBe(true)
    expect(result.isPlaying).toBe(true)
    expect(result.isPaused).toBe(false)
    expect(result.isGameOver).toBe(false)
    expect(result.matchResult).toBeNull()
    expect(result.gameTimeSmall).toBe(true)
  })
})
