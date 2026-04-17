/**
 * Setup Shell Return Path Contract
 *
 * Proves that setup shell has one truthful way back to the prior session
 * state without forcing reload. The return path restores whichever phase
 * the user came from: Playing or Paused.
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
    // Procedural fallback is valid
  }
  await page.waitForTimeout(300)
}

test.describe('Setup Shell Return Path', () => {
  test.setTimeout(120000)

  test('return from setup entered via pause restores paused state', async ({ page }) => {
    await waitForGame(page)

    const result = await page.evaluate(async () => {
      const g = (window as any).__war3Game

      // Enter pause then setup (the live entry path from Task 53)
      g.pauseGame()
      ;(document.getElementById('pause-setup-button') as HTMLButtonElement).click()
      await new Promise(r => setTimeout(r, 50))

      const setupVisible = !(document.getElementById('setup-shell') as HTMLElement).hidden
      const pauseHidden = (document.getElementById('pause-shell') as HTMLElement).hidden

      // Click the return button
      ;(document.getElementById('setup-return-button') as HTMLButtonElement).click()
      await new Promise(r => setTimeout(r, 50))

      const setupHiddenAfter = (document.getElementById('setup-shell') as HTMLElement).hidden
      const pauseVisibleAfter = !(document.getElementById('pause-shell') as HTMLElement).hidden
      const isPaused = g.phase.isPaused()
      const isPlaying = g.phase.isPlaying()
      const mapSourcePreserved = !!g.currentMapSource

      return {
        setupVisible,
        pauseHidden,
        setupHiddenAfter,
        pauseVisibleAfter,
        isPaused,
        isPlaying,
        mapSourcePreserved,
      }
    })

    // Setup was visible, pause was hidden
    expect(result.setupVisible).toBe(true)
    expect(result.pauseHidden).toBe(true)

    // After return: setup hidden, pause visible (restored), phase is paused
    expect(result.setupHiddenAfter).toBe(true)
    expect(result.pauseVisibleAfter).toBe(true)
    expect(result.isPaused).toBe(true)
    expect(result.isPlaying).toBe(false)
    expect(result.mapSourcePreserved).toBe(true)
  })

  test('return from setup entered directly restores playing state', async ({ page }) => {
    await waitForGame(page)

    const result = await page.evaluate(async () => {
      const g = (window as any).__war3Game

      // Enter setup directly from playing
      g.openSetupShell()
      await new Promise(r => setTimeout(r, 50))

      const setupVisible = !(document.getElementById('setup-shell') as HTMLElement).hidden

      // Click return
      ;(document.getElementById('setup-return-button') as HTMLButtonElement).click()
      await new Promise(r => setTimeout(r, 50))

      const setupHiddenAfter = (document.getElementById('setup-shell') as HTMLElement).hidden
      const isPlaying = g.phase.isPlaying()
      const isPaused = g.phase.isPaused()
      const pauseHidden = (document.getElementById('pause-shell') as HTMLElement).hidden

      return {
        setupVisible,
        setupHiddenAfter,
        isPlaying,
        isPaused,
        pauseHidden,
      }
    })

    expect(result.setupVisible).toBe(true)
    expect(result.setupHiddenAfter).toBe(true)
    expect(result.isPlaying).toBe(true)
    expect(result.isPaused).toBe(false)
    expect(result.pauseHidden).toBe(true)
  })

  test('gameplay input remains blocked while in setup shell', async ({ page }) => {
    await waitForGame(page)

    const result = await page.evaluate(async () => {
      const g = (window as any).__war3Game

      // Enter setup
      g.openSetupShell()
      await new Promise(r => setTimeout(r, 50))

      const shouldBlockInSetup = g.shouldBlockGameplayInput()

      // Return to playing
      ;(document.getElementById('setup-return-button') as HTMLButtonElement).click()
      await new Promise(r => setTimeout(r, 50))

      const shouldBlockAfterReturn = g.shouldBlockGameplayInput()

      return {
        shouldBlockInSetup,
        shouldBlockAfterReturn,
      }
    })

    expect(result.shouldBlockInSetup).toBe(true)
    expect(result.shouldBlockAfterReturn).toBe(false)
  })
})
