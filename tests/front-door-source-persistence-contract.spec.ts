/**
 * Front-Door Source Persistence Contract (Task 73)
 *
 * Proves source survives navigation through secondary shells,
 * return-to-menu restores truthful state, and manual reset clears it.
 */
import { test, expect, type Page } from '@playwright/test'

const BASE_NORMAL = 'http://127.0.0.1:4173/'

async function waitForBoot(page: Page) {
  await page.goto(BASE_NORMAL, { waitUntil: 'domcontentloaded' })
  await page.waitForFunction(() => {
    const game = (window as any).__war3Game
    if (!game || !game.renderer) return false
    if (game.renderer.domElement.width === 0) return false
    if (!Array.isArray(game.units) || game.units.length === 0) return false
    return true
  }, { timeout: 15000 })
  await page.waitForTimeout(500)
}

test.describe('Front-Door Source Persistence', () => {
  test.setTimeout(120000)

  test('source survives help navigation', async ({ page }) => {
    await waitForBoot(page)
    const result = await page.evaluate(async () => {
      const g = (window as any).__war3Game
      const sourceBefore = g.currentMapSource?.kind

      document.getElementById('menu-help-button')!.dispatchEvent(new Event('click'))
      await new Promise(r => setTimeout(r, 50))
      document.getElementById('help-close-button')!.dispatchEvent(new Event('click'))
      await new Promise(r => setTimeout(r, 50))

      return {
        sourceBefore,
        sourceAfter: g.currentMapSource?.kind,
        label: document.getElementById('menu-map-source-label')!.textContent,
      }
    })
    expect(result.sourceBefore).toBe(result.sourceAfter)
  })

  test('return-to-menu restores last truthful state', async ({ page }) => {
    await waitForBoot(page)
    const result = await page.evaluate(async () => {
      const g = (window as any).__war3Game
      const returnToMenu = (window as any).__returnToMenu as () => void

      document.getElementById('menu-start-button')!.dispatchEvent(new Event('click'))
      await new Promise(r => setTimeout(r, 50))
      document.getElementById('briefing-start-button')!.dispatchEvent(new Event('click'))
      await new Promise(r => setTimeout(r, 50))

      g.pauseGame()
      returnToMenu()
      await new Promise(r => setTimeout(r, 100))

      return {
        sourceKind: g.currentMapSource?.kind,
        label: document.getElementById('menu-map-source-label')!.textContent,
      }
    })
    expect(result.sourceKind).toBe('procedural')
    expect(result.label).toContain('程序化地图')
  })

  test('manual reset clears persisted source', async ({ page }) => {
    await waitForBoot(page)
    const result = await page.evaluate(async () => {
      const g = (window as any).__war3Game
      const getMapSourceLabel = (window as any).__getMapSourceLabel as () => string

      g.currentMapSource = {
        kind: 'parsed',
        mapData: { terrain: { width: 64, height: 64, tileset: 'A' }, info: null, unitPositions: [] },
      }
      document.getElementById('menu-map-source-label')!.textContent = getMapSourceLabel()

      // Enable the reset button (mirrors updateResetButton logic for parsed source)
      const resetBtn = document.getElementById('menu-reset-map-button') as HTMLButtonElement
      resetBtn.disabled = false

      // Reset
      document.getElementById('menu-reset-map-button')!.dispatchEvent(new Event('click'))
      await new Promise(r => setTimeout(r, 100))

      return {
        sourceKind: g.currentMapSource?.kind,
        label: document.getElementById('menu-map-source-label')!.textContent,
      }
    })
    expect(result.sourceKind).toBe('procedural')
    expect(result.label).toContain('程序化地图')
  })
})
