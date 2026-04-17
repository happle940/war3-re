/**
 * Pause Shell Entry Hotkey Contract
 *
 * Deterministic runtime proof that Escape is a truthful pause-shell entry seam:
 *   1. live play with no active placement/attack-move/rally mode pauses on Escape
 *   2. the pause shell becomes visible and freezes the session
 *   3. resume still returns to playing
 *   4. if a gameplay mode is active, Escape cancels that mode first and does not pause on the same keypress
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

test.describe('Pause Shell Entry Hotkey Contract', () => {
  test.setTimeout(60000)

  test('Escape opens pause from live play and resume returns to playing', async ({ page }) => {
    await waitForGame(page)

    const setup = await page.evaluate(() => {
      const g = (window as any).__war3Game
      const selectedUnit = g.units.find((u: any) => u.team === 0 && !u.isBuilding && u.hp > 0)
      if (!selectedUnit) {
        return { error: 'no controllable unit' }
      }

      g.clearSelection()
      g.selectionModel.setSelection([selectedUnit])
      g.createSelectionRing(selectedUnit)

      return {
        phase: g.phase.get(),
        paused: g.isPaused(),
        setupOpen: typeof g.isSetupOpen === 'function' ? g.isSetupOpen() : false,
        placementMode: g.placementMode,
      }
    })

    expect(setup.error).toBeUndefined()
    expect(setup.phase, 'baseline should be live play before Escape').toBe('playing')
    expect(setup.paused, 'baseline should not start paused').toBe(false)
    expect(setup.setupOpen, 'baseline should not start in setup mode').toBe(false)
    expect(setup.placementMode, 'baseline should not start in placement mode').toBeNull()

    await page.keyboard.press('Escape')

    const paused = await page.evaluate(() => {
      const g = (window as any).__war3Game
      const pauseShell = document.getElementById('pause-shell') as HTMLElement
      return {
        phase: g.phase.get(),
        paused: g.isPaused(),
        shellHidden: pauseShell.hidden,
        shellAriaHidden: pauseShell.getAttribute('aria-hidden'),
        placementMode: g.placementMode,
      }
    })

    expect(paused.phase, 'Escape should open the pause shell from live play').toBe('paused')
    expect(paused.paused, 'Escape should set the paused flag').toBe(true)
    expect(paused.shellHidden, 'pause shell should become visible').toBe(false)
    expect(paused.shellAriaHidden, 'pause shell should announce visible').toBe('false')
    expect(paused.placementMode, 'Escape from live play should not enter placement mode').toBeNull()

    await page.locator('#pause-resume-button').click()

    const resumed = await page.evaluate(() => {
      const g = (window as any).__war3Game
      const pauseShell = document.getElementById('pause-shell') as HTMLElement
      return {
        phase: g.phase.get(),
        paused: g.isPaused(),
        shellHidden: pauseShell.hidden,
        shellAriaHidden: pauseShell.getAttribute('aria-hidden'),
      }
    })

    expect(resumed.phase, 'resume path should return the game to playing').toBe('playing')
    expect(resumed.paused, 'resume path should clear the paused flag').toBe(false)
    expect(resumed.shellHidden, 'pause shell should hide after resume').toBe(true)
    expect(resumed.shellAriaHidden, 'pause shell should announce hidden after resume').toBe('true')
  })

  test('Escape cancels placement mode before pausing, and a second Escape pauses', async ({ page }) => {
    await waitForGame(page)

    const setup = await page.evaluate(() => {
      const g = (window as any).__war3Game
      const selectedUnit = g.units.find((u: any) => u.team === 0 && !u.isBuilding && u.hp > 0)
      if (!selectedUnit) {
        return { error: 'no controllable unit' }
      }

      g.clearSelection()
      g.selectionModel.setSelection([selectedUnit])
      g.createSelectionRing(selectedUnit)
      g.enterPlacementMode('farm')

      return {
        phase: g.phase.get(),
        paused: g.isPaused(),
        placementMode: g.placementMode,
        shellHidden: (document.getElementById('pause-shell') as HTMLElement).hidden,
      }
    })

    expect(setup.error).toBeUndefined()
    expect(setup.phase, 'placement setup should still be live play').toBe('playing')
    expect(setup.paused, 'placement setup should not start paused').toBe(false)
    expect(setup.placementMode, 'placement mode should be active before Escape').toBe('farm')
    expect(setup.shellHidden, 'pause shell should still be hidden before Escape').toBe(true)

    await page.keyboard.press('Escape')

    const afterCancel = await page.evaluate(() => {
      const g = (window as any).__war3Game
      const pauseShell = document.getElementById('pause-shell') as HTMLElement
      return {
        phase: g.phase.get(),
        paused: g.isPaused(),
        placementMode: g.placementMode,
        shellHidden: pauseShell.hidden,
        shellAriaHidden: pauseShell.getAttribute('aria-hidden'),
      }
    })

    expect(afterCancel.phase, 'first Escape should only cancel placement mode').toBe('playing')
    expect(afterCancel.paused, 'first Escape should not pause when placement mode is active').toBe(false)
    expect(afterCancel.placementMode, 'first Escape should clear placement mode').toBeNull()
    expect(afterCancel.shellHidden, 'pause shell should remain hidden after canceling placement').toBe(true)
    expect(afterCancel.shellAriaHidden, 'pause shell should remain announced hidden after canceling placement').toBe('true')

    await page.keyboard.press('Escape')

    const paused = await page.evaluate(() => {
      const g = (window as any).__war3Game
      const pauseShell = document.getElementById('pause-shell') as HTMLElement
      return {
        phase: g.phase.get(),
        paused: g.isPaused(),
        shellHidden: pauseShell.hidden,
        shellAriaHidden: pauseShell.getAttribute('aria-hidden'),
      }
    })

    expect(paused.phase, 'second Escape should pause once no mode is active').toBe('paused')
    expect(paused.paused, 'second Escape should set paused after mode cancel').toBe(true)
    expect(paused.shellHidden, 'pause shell should become visible after the second Escape').toBe(false)
    expect(paused.shellAriaHidden, 'pause shell should announce visible after the second Escape').toBe('false')
  })
})
