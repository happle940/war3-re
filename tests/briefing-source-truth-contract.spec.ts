/**
 * Briefing Source Truth Contract (Task 71)
 *
 * Proves briefing reflects real source, source changes update briefing
 * truthfully, and return-to-menu clears stale briefing data.
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

test.describe('Briefing Source Truth', () => {
  test.setTimeout(120000)

  test('briefing reflects default procedural source', async ({ page }) => {
    await waitForBoot(page)
    const result = await page.evaluate(async () => {
      document.getElementById('menu-start-button')!.dispatchEvent(new Event('click'))
      await new Promise(r => setTimeout(r, 50))
      return document.getElementById('briefing-map-source')!.textContent
    })
    expect(result).toContain('程序化地图')
  })

  test('briefing reflects simulated parsed source truthfully', async ({ page }) => {
    await waitForBoot(page)
    const result = await page.evaluate(async () => {
      const g = (window as any).__war3Game
      const getMapSourceLabel = (window as any).__getMapSourceLabel as () => string

      g.currentMapSource = {
        kind: 'parsed',
        mapData: { terrain: { width: 96, height: 96, tileset: 'F' }, info: null, unitPositions: [] },
      }
      // Sync menu label
      document.getElementById('menu-map-source-label')!.textContent = getMapSourceLabel()

      document.getElementById('menu-start-button')!.dispatchEvent(new Event('click'))
      await new Promise(r => setTimeout(r, 50))

      return document.getElementById('briefing-map-source')!.textContent
    })
    expect(result).toContain('W3X')
    expect(result).toContain('96')
  })

  test('return-to-menu does not leave stale briefing data', async ({ page }) => {
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

      // Open briefing again
      document.getElementById('menu-start-button')!.dispatchEvent(new Event('click'))
      await new Promise(r => setTimeout(r, 50))

      return {
        source: document.getElementById('briefing-map-source')!.textContent,
        mode: document.getElementById('briefing-mode')!.textContent,
      }
    })
    expect(result.source).toContain('程序化地图')
    expect(result.mode).toContain('遭遇战')
  })
})
