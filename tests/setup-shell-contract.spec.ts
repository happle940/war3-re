/**
 * Setup Shell Current Map Action Contract
 *
 * Deterministic runtime proof that setup-shell is a real session shell:
 *   1. setup-shell can be opened through a real game seam
 *   2. the shell exposes one truthful action: start current map
 *   3. clicking that action returns the game to playing
 *   4. current map source stays intact and session residuals clear
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

  await page.waitForTimeout(500)
}

test.describe('Setup Shell Current Map Action Contract', () => {
  test.setTimeout(60000)

  test('setup shell opens, exposes one action, and starts the current map truthfully', async ({ page }) => {
    await waitForGame(page)

    const opened = await page.evaluate(() => {
      const g = (window as any).__war3Game
      const selectedUnit = g.units.find((u: any) => u.team === 0 && !u.isBuilding && u.hp > 0)
      if (!selectedUnit) {
        return { error: 'no controllable unit' }
      }

      g.clearSelection()
      g.selectionModel.setSelection([selectedUnit])
      g.createSelectionRing(selectedUnit)
      g.gameTime = 31.25
      g.openSetupShell()

      const setupShell = document.getElementById('setup-shell') as HTMLElement
      const startButton = document.getElementById('setup-start-button') as HTMLButtonElement

      return {
        phase: g.phase.get(),
        currentMapKind: g.currentMapSource?.kind ?? null,
        gameTime: g.gameTime,
        setupHidden: setupShell.hidden,
        setupAriaHidden: setupShell.getAttribute('aria-hidden'),
        buttonDisabled: startButton.disabled,
        buttonText: startButton.textContent ?? '',
        selectionCount: g.selectionModel.units.length,
        ringCount: g.selectionRings.length,
      }
    })

    expect(opened.error).toBeUndefined()
    expect(opened.phase, 'setup shell should move the session into setup').toBe('setup')
    expect(opened.currentMapKind, 'setup shell should keep the current map source available').toBe('procedural')
    expect(opened.gameTime, 'opening setup shell should not reset the running clock yet').toBeCloseTo(31.25, 2)
    expect(opened.setupHidden, 'setup shell should be visible when opened').toBe(false)
    expect(opened.setupAriaHidden, 'setup shell should announce visible state').toBe('false')
    expect(opened.buttonDisabled, 'setup shell action should be enabled when a current map exists').toBe(false)
    expect(opened.buttonText, 'setup shell should expose the single truthful action label').toBe('开始当前地图')
    expect(opened.selectionCount, 'opening setup shell should not clear the current selection').toBe(1)
    expect(opened.ringCount, 'opening setup shell should not clear selection visuals yet').toBe(1)

    await page.locator('#setup-start-button').click()

    const after = await page.evaluate(() => {
      const g = (window as any).__war3Game
      const setupShell = document.getElementById('setup-shell') as HTMLElement
      const pauseShell = document.getElementById('pause-shell') as HTMLElement
      const resultsShell = document.getElementById('results-shell') as HTMLElement
      const overlay = document.getElementById('game-over-overlay')
      const res0 = g.resources.get(0)
      return {
        phase: g.phase.get(),
        currentMapKind: g.currentMapSource?.kind ?? null,
        gameTime: g.gameTime,
        result: g.getMatchResult(),
        selectionCount: g.selectionModel.units.length,
        ringCount: g.selectionRings.length,
        setupHidden: setupShell.hidden,
        setupAriaHidden: setupShell.getAttribute('aria-hidden'),
        pauseHidden: pauseShell.hidden,
        resultsHidden: resultsShell.hidden,
        overlayVisible: overlay ? overlay.style.display !== 'none' : null,
        overlayClass: overlay?.className ?? '',
        overlayText: document.getElementById('game-over-text')?.textContent ?? '',
        gold: res0.gold,
        lumber: res0.lumber,
      }
    })

    expect(after.phase, 'setup action should return the session to playing').toBe('playing')
    expect(after.currentMapKind, 'setup action should preserve the current map source').toBe('procedural')
    expect(after.gameTime, 'setup action should restart near zero game time').toBeLessThan(1)
    expect(after.result, 'setup action should clear any terminal verdict').toBeNull()
    expect(after.selectionCount, 'setup action should clear the current selection').toBe(0)
    expect(after.ringCount, 'setup action should clear selection visuals').toBe(0)
    expect(after.setupHidden, 'setup shell should hide after action').toBe(true)
    expect(after.setupAriaHidden, 'setup shell should announce hidden after action').toBe('true')
    expect(after.pauseHidden, 'pause shell should stay hidden after setup action').toBe(true)
    expect(after.resultsHidden, 'results shell should stay hidden after setup action').toBe(true)
    expect(after.overlayVisible, 'game-over overlay should stay hidden after setup action').toBe(false)
    expect(after.overlayClass, 'game-over overlay classes should stay cleared after setup action').toBe('')
    expect(after.overlayText, 'game-over overlay text should stay cleared after setup action').toBe('')
    expect(after.gold, 'setup action should keep the starting gold from the current map').toBe(500)
    expect(after.lumber, 'setup action should keep the starting lumber from the current map').toBe(200)
  })
})
