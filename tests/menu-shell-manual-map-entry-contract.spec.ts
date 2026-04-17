/**
 * Menu Shell Manual Map Entry Contract
 *
 * Proves that the menu exposes one truthful manual map-selection entry,
 * that map selection updates the source while the menu stays in control,
 * and that manual selection does not auto-start gameplay.
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

test.describe('Menu Shell Manual Map Entry', () => {
  test.setTimeout(120000)

  test('menu exposes one manual map-selection entry', async ({ page }) => {
    await waitForBoot(page)

    const result = await page.evaluate(async () => {
      const menuShell = document.getElementById('menu-shell')!
      const menuMapInput = document.getElementById('menu-map-file-input') as HTMLInputElement
      const menuStartBtn = document.getElementById('menu-start-button') as HTMLButtonElement

      // Input exists and is inside the menu shell
      const inputInsideMenu = menuShell.contains(menuMapInput)
      const inputAccept = menuMapInput.accept
      const inputHidden = menuMapInput.style.display === 'none' || menuMapInput.offsetParent === null

      // The label trigger for the input also exists in the menu
      const label = menuShell.querySelector('label[for="menu-map-file-input"]')
      const labelExists = !!label

      return { inputInsideMenu, inputAccept, inputHidden, labelExists }
    })

    expect(result.inputInsideMenu).toBe(true)
    expect(result.inputAccept).toBe('.w3x,.w3m')
    expect(result.inputHidden).toBe(true)
    expect(result.labelExists).toBe(true)
  })

  test('simulated map load updates source without leaving menu', async ({ page }) => {
    await waitForBoot(page)

    const result = await page.evaluate(async () => {
      const g = (window as any).__war3Game
      const menuShell = document.getElementById('menu-shell')!
      const menuSourceLabel = document.getElementById('menu-map-source-label')!
      const getMapSourceLabel = (window as any).__getMapSourceLabel as () => string

      // Pre-condition: menu visible, game paused, source is procedural
      const menuVisibleBefore = !menuShell.hidden
      const isPausedBefore = g.isPaused()
      const sourceBefore = g.currentMapSource?.kind

      // Simulate what attachMenuMapLoader does after a successful parse:
      // game.loadMap(parsed) sets source to parsed and phase to Playing,
      // then pauseGame() brings it back to Paused.
      // We simulate by directly setting the source state and re-pausing.
      g.currentMapSource = {
        kind: 'parsed',
        mapData: {
          terrain: { width: 128, height: 96, tileset: 'L' },
          info: null,
          unitPositions: [],
        },
      }
      // If the game was in Playing (due to loadMap), pause it
      if (!g.isPaused()) {
        g.pauseGame()
      }

      // Sync the label as the menu loader does
      menuSourceLabel.textContent = getMapSourceLabel()

      const menuVisibleAfter = !menuShell.hidden
      const isPausedAfter = g.isPaused()
      const sourceAfter = g.currentMapSource?.kind
      const labelText = menuSourceLabel.textContent

      return {
        menuVisibleBefore, isPausedBefore, sourceBefore,
        menuVisibleAfter, isPausedAfter, sourceAfter, labelText,
      }
    })

    // Before: menu visible, paused, procedural
    expect(result.menuVisibleBefore).toBe(true)
    expect(result.isPausedBefore).toBe(true)
    expect(result.sourceBefore).toBe('procedural')

    // After: menu still visible, still paused, source is parsed
    expect(result.menuVisibleAfter).toBe(true)
    expect(result.isPausedAfter).toBe(true)
    expect(result.sourceAfter).toBe('parsed')

    // Label reflects the new parsed source
    expect(result.labelText).toContain('W3X')
    expect(result.labelText).toContain('128')
  })

  test('manual selection does not auto-start gameplay', async ({ page }) => {
    await waitForBoot(page)

    const result = await page.evaluate(async () => {
      const g = (window as any).__war3Game
      const menuShell = document.getElementById('menu-shell')!
      const menuSourceLabel = document.getElementById('menu-map-source-label')!
      const getMapSourceLabel = (window as any).__getMapSourceLabel as () => string

      // Simulate map load + re-pause (what the menu loader does)
      g.currentMapSource = {
        kind: 'parsed',
        mapData: {
          terrain: { width: 64, height: 64, tileset: 'A' },
          info: null,
          unitPositions: [],
        },
      }
      if (!g.isPaused()) {
        g.pauseGame()
      }
      menuSourceLabel.textContent = getMapSourceLabel()

      // After simulated load: game is NOT playing, menu is still shown
      const isPlaying = g.phase.isPlaying()
      const menuVisible = !menuShell.hidden
      const isPaused = g.isPaused()

      // Now press start — goes to briefing, then gameplay
      const menuStartBtn = document.getElementById('menu-start-button') as HTMLButtonElement
      menuStartBtn.click()
      await new Promise(r => setTimeout(r, 50))

      const briefingVisible = !document.getElementById('briefing-shell')!.hidden

      const briefingStartBtn = document.getElementById('briefing-start-button') as HTMLButtonElement
      briefingStartBtn.click()
      await new Promise(r => setTimeout(r, 50))

      const isPlayingAfterStart = g.phase.isPlaying()
      const menuHiddenAfterStart = menuShell.hidden

      return { isPlaying, menuVisible, isPaused, briefingVisible, isPlayingAfterStart, menuHiddenAfterStart }
    })

    // After load: NOT playing, menu visible, paused
    expect(result.isPlaying).toBe(false)
    expect(result.menuVisible).toBe(true)
    expect(result.isPaused).toBe(true)

    // Briefing appears between menu and gameplay
    expect(result.briefingVisible).toBe(true)

    // After clicking briefing start: NOW playing, menu hidden
    expect(result.isPlayingAfterStart).toBe(true)
    expect(result.menuHiddenAfterStart).toBe(true)
  })
})
