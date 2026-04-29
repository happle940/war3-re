/**
 * Session shell real-button re-entry runtime proof.
 *
 * Verifies the player-facing loop through actual UI buttons, while keeping the
 * runtime-test fast path available for battlefield specs:
 *   live play -> pause/results -> return to menu -> briefing -> play again.
 */
import { test, expect, type Page } from '@playwright/test'

const BASE_RUNTIME = 'http://127.0.0.1:4173/?runtimeTest=1'

async function waitForBoot(page: Page) {
  const consoleErrors: string[] = []
  page.on('console', (msg) => {
    if (msg.type() === 'error') consoleErrors.push(msg.text())
  })
  ;(page as any).__consoleErrors = consoleErrors

  await page.goto(BASE_RUNTIME, { waitUntil: 'domcontentloaded' })
  await page.waitForFunction(() => {
    const game = (window as any).__war3Game
    if (!game || !game.renderer) return false
    if (game.renderer.domElement.width === 0) return false
    if (!Array.isArray(game.units) || game.units.length === 0) return false
    return typeof (window as any).__returnToMenu === 'function'
  }, { timeout: 15000 })
  await page.waitForTimeout(300)
}

test.describe('Session shell real-button re-entry runtime', () => {
  test.setTimeout(120000)

  test('pause return button reopens menu and starts a clean session again', async ({ page }) => {
    await waitForBoot(page)

    const result = await page.evaluate(async () => {
      const g = (window as any).__war3Game
      const menuShell = document.getElementById('menu-shell')!
      const pauseShell = document.getElementById('pause-shell')!
      const resultsShell = document.getElementById('results-shell')!
      const briefingShell = document.getElementById('briefing-shell')!
      const menuStartBtn = document.getElementById('menu-start-button') as HTMLButtonElement
      const briefingStartBtn = document.getElementById('briefing-start-button') as HTMLButtonElement
      const pauseReturnBtn = document.getElementById('pause-return-menu-button') as HTMLButtonElement

      const initialPlaying = g.phase.isPlaying()
      const initialMenuHidden = menuShell.hidden

      g.pauseGame()
      await new Promise(r => setTimeout(r, 50))
      const pauseVisibleBeforeReturn = !pauseShell.hidden

      pauseReturnBtn.click()
      await new Promise(r => setTimeout(r, 100))

      const menuVisibleAfterReturn = !menuShell.hidden
      const pauseHiddenAfterReturn = pauseShell.hidden
      const resultsHiddenAfterReturn = resultsShell.hidden
      const pausedAfterReturn = g.isPaused()
      const playingAfterReturn = g.phase.isPlaying()
      const timeAfterReturn = g.gameTime

      menuStartBtn.click()
      await new Promise(r => setTimeout(r, 50))
      const briefingVisible = !briefingShell.hidden
      briefingStartBtn.click()
      await new Promise(r => setTimeout(r, 80))

      return {
        initialPlaying,
        initialMenuHidden,
        pauseVisibleBeforeReturn,
        menuVisibleAfterReturn,
        pauseHiddenAfterReturn,
        resultsHiddenAfterReturn,
        pausedAfterReturn,
        playingAfterReturn,
        timeAfterReturn,
        briefingVisible,
        menuHiddenAfterRestart: menuShell.hidden,
        briefingHiddenAfterRestart: briefingShell.hidden,
        playingAfterRestart: g.phase.isPlaying(),
        pausedAfterRestart: g.isPaused(),
        gameTimeAfterRestart: g.gameTime,
        hasUnitsAfterRestart: Array.isArray(g.units) && g.units.length > 0,
      }
    })

    expect(result.initialPlaying).toBe(true)
    expect(result.initialMenuHidden).toBe(true)
    expect(result.pauseVisibleBeforeReturn).toBe(true)
    expect(result.menuVisibleAfterReturn).toBe(true)
    expect(result.pauseHiddenAfterReturn).toBe(true)
    expect(result.resultsHiddenAfterReturn).toBe(true)
    expect(result.pausedAfterReturn).toBe(true)
    expect(result.playingAfterReturn).toBe(false)
    expect(result.timeAfterReturn).toBeLessThan(0.25)
    expect(result.briefingVisible).toBe(true)
    expect(result.menuHiddenAfterRestart).toBe(true)
    expect(result.briefingHiddenAfterRestart).toBe(true)
    expect(result.playingAfterRestart).toBe(true)
    expect(result.pausedAfterRestart).toBe(false)
    expect(result.gameTimeAfterRestart).toBeLessThan(0.5)
    expect(result.hasUnitsAfterRestart).toBe(true)
  })

  test('results return button preserves last result summary and clears game-over state before restart', async ({ page }) => {
    await waitForBoot(page)

    const result = await page.evaluate(async () => {
      const g = (window as any).__war3Game
      const menuShell = document.getElementById('menu-shell')!
      const pauseShell = document.getElementById('pause-shell')!
      const resultsShell = document.getElementById('results-shell')!
      const summary = document.getElementById('menu-last-session-summary')!
      const menuStartBtn = document.getElementById('menu-start-button') as HTMLButtonElement
      const briefingStartBtn = document.getElementById('briefing-start-button') as HTMLButtonElement
      const resultsReturnBtn = document.getElementById('results-return-menu-button') as HTMLButtonElement

      const aiTownHall = g.units.find((u: any) => u.team === 1 && u.type === 'townhall')
      if (!aiTownHall) return { error: 'missing AI townhall' }
      aiTownHall.hp = 0
      g.update(0.016)
      await new Promise(r => setTimeout(r, 80))

      const resultsVisibleBeforeReturn = !resultsShell.hidden
      const matchResultBeforeReturn = g.getMatchResult()

      resultsReturnBtn.click()
      await new Promise(r => setTimeout(r, 100))

      const menuVisibleAfterReturn = !menuShell.hidden
      const resultsHiddenAfterReturn = resultsShell.hidden
      const pauseHiddenAfterReturn = pauseShell.hidden
      const matchResultAfterReturn = g.getMatchResult()
      const gameOverAfterReturn = g.phase.isGameOver()
      const summaryAfterReturn = summary.textContent ?? ''

      menuStartBtn.click()
      await new Promise(r => setTimeout(r, 50))
      briefingStartBtn.click()
      await new Promise(r => setTimeout(r, 80))

      return {
        resultsVisibleBeforeReturn,
        matchResultBeforeReturn,
        menuVisibleAfterReturn,
        resultsHiddenAfterReturn,
        pauseHiddenAfterReturn,
        matchResultAfterReturn,
        gameOverAfterReturn,
        summaryAfterReturn,
        playingAfterRestart: g.phase.isPlaying(),
        menuHiddenAfterRestart: menuShell.hidden,
        gameTimeAfterRestart: g.gameTime,
      }
    })

    expect(result.error).toBeUndefined()
    expect(result.resultsVisibleBeforeReturn).toBe(true)
    expect(result.matchResultBeforeReturn).toBe('victory')
    expect(result.menuVisibleAfterReturn).toBe(true)
    expect(result.resultsHiddenAfterReturn).toBe(true)
    expect(result.pauseHiddenAfterReturn).toBe(true)
    expect(result.matchResultAfterReturn).toBeNull()
    expect(result.gameOverAfterReturn).toBe(false)
    expect(result.summaryAfterReturn).toContain('上次结果：胜利')
    expect(result.playingAfterRestart).toBe(true)
    expect(result.menuHiddenAfterRestart).toBe(true)
    expect(result.gameTimeAfterRestart).toBeLessThan(0.5)
  })
})
