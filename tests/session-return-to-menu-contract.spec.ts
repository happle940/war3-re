/**
 * Session Return-To-Menu Contract
 *
 * Proves that a live session can return to the front door through a truthful
 * seam from pause/results, that the menu becomes the active state, and that
 * stale pause/results state does not leak into the menu shell.
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

test.describe('Session Return To Menu', () => {
  test.setTimeout(120000)

  test('live session returns to front door through pause shell', async ({ page }) => {
    await waitForBoot(page)

    const result = await page.evaluate(async () => {
      const g = (window as any).__war3Game
      const menuShell = document.getElementById('menu-shell')!
      const pauseShell = document.getElementById('pause-shell')!
      const resultsShell = document.getElementById('results-shell')!
      const menuStartBtn = document.getElementById('menu-start-button') as HTMLButtonElement
      const briefingStartBtn = document.getElementById('briefing-start-button') as HTMLButtonElement
      const returnToMenu = (window as any).__returnToMenu as () => void

      // Start the game from menu → briefing → play
      menuStartBtn.click()
      await new Promise(r => setTimeout(r, 50))
      briefingStartBtn.click()
      await new Promise(r => setTimeout(r, 50))

      // Now in playing state — pause
      g.pauseGame()
      await new Promise(r => setTimeout(r, 50))

      const pauseVisible = !pauseShell.hidden
      const menuHiddenBeforeReturn = menuShell.hidden

      // Return to menu from pause
      returnToMenu()
      await new Promise(r => setTimeout(r, 100))

      const menuVisibleAfterReturn = !menuShell.hidden
      const pauseHiddenAfterReturn = pauseShell.hidden
      const resultsHiddenAfterReturn = resultsShell.hidden
      const isPaused = g.isPaused()
      const isPlaying = g.phase.isPlaying()

      return {
        pauseVisible,
        menuHiddenBeforeReturn,
        menuVisibleAfterReturn,
        pauseHiddenAfterReturn,
        resultsHiddenAfterReturn,
        isPaused,
        isPlaying,
      }
    })

    // Before return: pause visible, menu hidden
    expect(result.pauseVisible).toBe(true)
    expect(result.menuHiddenBeforeReturn).toBe(true)

    // After return: menu visible, pause/results hidden, game paused
    expect(result.menuVisibleAfterReturn).toBe(true)
    expect(result.pauseHiddenAfterReturn).toBe(true)
    expect(result.resultsHiddenAfterReturn).toBe(true)
    expect(result.isPaused).toBe(true)
    expect(result.isPlaying).toBe(false)
  })

  test('live session returns to front door through results shell', async ({ page }) => {
    await waitForBoot(page)

    const result = await page.evaluate(async () => {
      const g = (window as any).__war3Game
      const menuShell = document.getElementById('menu-shell')!
      const pauseShell = document.getElementById('pause-shell')!
      const resultsShell = document.getElementById('results-shell')!
      const menuStartBtn = document.getElementById('menu-start-button') as HTMLButtonElement
      const briefingStartBtn = document.getElementById('briefing-start-button') as HTMLButtonElement
      const returnToMenu = (window as any).__returnToMenu as () => void

      // Start game from menu → briefing → play
      menuStartBtn.click()
      await new Promise(r => setTimeout(r, 50))
      briefingStartBtn.click()
      await new Promise(r => setTimeout(r, 50))

      // Trigger victory
      const aiTH = g.units.find((u: any) => u.team === 1 && u.type === 'townhall')
      if (!aiTH) return { error: 'no AI townhall' }
      aiTH.hp = 0
      g.update(0.016)
      await new Promise(r => setTimeout(r, 50))

      const resultsVisible = !resultsShell.hidden
      const menuHiddenBeforeReturn = menuShell.hidden

      // Return to menu from results
      returnToMenu()
      await new Promise(r => setTimeout(r, 100))

      const menuVisibleAfterReturn = !menuShell.hidden
      const pauseHiddenAfterReturn = pauseShell.hidden
      const resultsHiddenAfterReturn = resultsShell.hidden
      const isPaused = g.isPaused()
      const isPlaying = g.phase.isPlaying()
      const isGameOver = g.phase.isGameOver()
      const matchResult = g.getMatchResult()

      return {
        resultsVisible,
        menuHiddenBeforeReturn,
        menuVisibleAfterReturn,
        pauseHiddenAfterReturn,
        resultsHiddenAfterReturn,
        isPaused,
        isPlaying,
        isGameOver,
        matchResult,
      }
    })

    expect(result.error).toBeUndefined()
    expect(result.resultsVisible).toBe(true)
    expect(result.menuHiddenBeforeReturn).toBe(true)

    // After return: menu visible, all other shells hidden
    expect(result.menuVisibleAfterReturn).toBe(true)
    expect(result.pauseHiddenAfterReturn).toBe(true)
    expect(result.resultsHiddenAfterReturn).toBe(true)
    expect(result.isPaused).toBe(true)
    expect(result.isPlaying).toBe(false)
    expect(result.isGameOver).toBe(false)

    // Stale match result cleared
    expect(result.matchResult).toBeNull()
  })

  test('stale pause/results state does not leak into menu shell', async ({ page }) => {
    await waitForBoot(page)

    const result = await page.evaluate(async () => {
      const g = (window as any).__war3Game
      const menuShell = document.getElementById('menu-shell')!
      const pauseShell = document.getElementById('pause-shell')!
      const resultsShell = document.getElementById('results-shell')!
      const menuSourceLabel = document.getElementById('menu-map-source-label')!
      const menuStartBtn = document.getElementById('menu-start-button') as HTMLButtonElement
      const briefingStartBtn = document.getElementById('briefing-start-button') as HTMLButtonElement
      const returnToMenu = (window as any).__returnToMenu as () => void
      const getMapSourceLabel = (window as any).__getMapSourceLabel as () => string

      // Play → pause → return to menu
      menuStartBtn.click()
      await new Promise(r => setTimeout(r, 50))
      briefingStartBtn.click()
      await new Promise(r => setTimeout(r, 50))
      g.pauseGame()
      returnToMenu()
      await new Promise(r => setTimeout(r, 100))

      // Verify clean menu state
      const menuVisible = !menuShell.hidden
      const pauseHidden = pauseShell.hidden
      const resultsHidden = resultsShell.hidden
      const isPaused = g.isPaused()
      const isPlaying = g.phase.isPlaying()
      const isGameOver = g.phase.isGameOver()
      const matchResult = g.getMatchResult()
      const sourceLabel = menuSourceLabel.textContent
      const derivedLabel = getMapSourceLabel()
      const gameTimeSmall = g.gameTime < 1

      return {
        menuVisible, pauseHidden, resultsHidden,
        isPaused, isPlaying, isGameOver,
        matchResult, sourceLabel, derivedLabel, gameTimeSmall,
      }
    })

    // Menu is the only visible shell
    expect(result.menuVisible).toBe(true)
    expect(result.pauseHidden).toBe(true)
    expect(result.resultsHidden).toBe(true)

    // Game is frozen
    expect(result.isPaused).toBe(true)
    expect(result.isPlaying).toBe(false)
    expect(result.isGameOver).toBe(false)

    // No stale state leaks
    expect(result.matchResult).toBeNull()
    expect(result.gameTimeSmall).toBe(true)

    // Source label is truthful
    expect(result.sourceLabel).toBe(result.derivedLabel)
    expect(result.sourceLabel).toContain('程序化地图')
  })
})
