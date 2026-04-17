/**
 * Front-Door Boot Gate Contract
 *
 * Proves that normal boot opens the menu shell instead of dropping straight
 * into gameplay, while runtime-test mode still bypasses the front door and
 * lands in a playable state.
 */
import { test, expect, type Page } from '@playwright/test'

const BASE_NORMAL = 'http://127.0.0.1:4173/'
const BASE_RUNTIME = 'http://127.0.0.1:4173/?runtimeTest=1'

async function waitForBoot(page: Page, url: string) {
  const consoleErrors: string[] = []
  page.on('console', (msg) => {
    if (msg.type() === 'error') consoleErrors.push(msg.text())
  })
  ;(page as any).__consoleErrors = consoleErrors

  await page.goto(url, { waitUntil: 'domcontentloaded' })
  await page.waitForFunction(() => {
    const canvas = document.getElementById('game-canvas')
    const game = (window as any).__war3Game
    if (!canvas || !game || !game.renderer) return false
    return game.renderer.domElement.width > 0
  }, { timeout: 15000 })
  await page.waitForTimeout(300)
}

test.describe('Front-Door Boot Gate', () => {
  test.setTimeout(120000)

  test('normal boot opens menu shell', async ({ page }) => {
    await waitForBoot(page, BASE_NORMAL)

    const result = await page.evaluate(() => {
      const menuShell = document.getElementById('menu-shell')!
      const setupShell = document.getElementById('setup-shell')!
      const pauseShell = document.getElementById('pause-shell')!
      const resultsShell = document.getElementById('results-shell')!
      const game = (window as any).__war3Game
      const mapStatus = document.getElementById('map-status')!.textContent ?? ''

      return {
        menuHidden: menuShell.hidden,
        menuAriaHidden: menuShell.getAttribute('aria-hidden'),
        setupHidden: setupShell.hidden,
        pauseHidden: pauseShell.hidden,
        resultsHidden: resultsShell.hidden,
        isPaused: game.isPaused(),
        isPlaying: game.phase.isPlaying(),
        mapStatus,
        hasGame: !!game,
        hasMapSource: !!game.currentMapSource,
      }
    })

    // Menu shell is visible
    expect(result.menuHidden).toBe(false)
    expect(result.menuAriaHidden).toBe('false')

    // Setup and results shells remain hidden
    // (pause-shell is visible because the game is paused, which is truthful)
    expect(result.setupHidden).toBe(true)
    expect(result.resultsHidden).toBe(true)

    // Game is paused (not playing) while menu is shown
    expect(result.isPaused).toBe(true)
    expect(result.isPlaying).toBe(false)

    // Game instance exists and has a map source
    expect(result.hasGame).toBe(true)
    expect(result.hasMapSource).toBe(true)

    // Map status is readable
    expect(result.mapStatus).toBeTruthy()
  })

  test('runtime-test mode bypasses front door', async ({ page }) => {
    await waitForBoot(page, BASE_RUNTIME)

    const result = await page.evaluate(() => {
      const menuShell = document.getElementById('menu-shell')!
      const game = (window as any).__war3Game

      return {
        menuHidden: menuShell.hidden,
        isPlaying: game.phase.isPlaying(),
        isPaused: game.isPaused(),
        hasUnits: Array.isArray(game.units) && game.units.length > 0,
        mapStatus: document.getElementById('map-status')!.textContent ?? '',
      }
    })

    // Menu shell stays hidden
    expect(result.menuHidden).toBe(true)

    // Game is playing (not paused)
    expect(result.isPlaying).toBe(true)
    expect(result.isPaused).toBe(false)

    // Units exist and game is live
    expect(result.hasUnits).toBe(true)

    // Map status shows runtime test mode
    expect(result.mapStatus).toContain('Runtime')
  })

  test('map-loader remains accessible from front door', async ({ page }) => {
    await waitForBoot(page, BASE_NORMAL)

    const result = await page.evaluate(() => {
      const mapInput = document.getElementById('map-file-input') as HTMLInputElement
      const mapStatus = document.getElementById('map-status')!

      return {
        hasMapInput: !!mapInput,
        mapInputAccept: mapInput?.accept ?? '',
        mapStatusVisible: mapStatus.offsetParent !== null,
        mapStatusText: mapStatus.textContent ?? '',
      }
    })

    expect(result.hasMapInput).toBe(true)
    expect(result.mapInputAccept).toContain('.w3x')
    expect(result.mapStatusVisible).toBe(true)
    expect(result.mapStatusText).toBeTruthy()
  })
})
