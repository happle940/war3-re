/**
 * Briefing Continue Start Seam Contract (Task 70)
 *
 * Proves starting from front door enters briefing, explicit continue starts
 * gameplay, and return/rematch paths don't leak briefing state.
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

test.describe('Briefing Continue Start Seam', () => {
  test.setTimeout(120000)

  test('start enters briefing before live play', async ({ page }) => {
    await waitForBoot(page)
    const result = await page.evaluate(async () => {
      document.getElementById('menu-start-button')!.dispatchEvent(new Event('click'))
      await new Promise(r => setTimeout(r, 50))
      return {
        briefingVisible: !document.getElementById('briefing-shell')!.hidden,
        menuHidden: document.getElementById('menu-shell')!.hidden,
        isPlaying: (window as any).__war3Game.phase.isPlaying(),
      }
    })
    expect(result.briefingVisible).toBe(true)
    expect(result.menuHidden).toBe(true)
    expect(result.isPlaying).toBe(false)
  })

  test('continue enters gameplay cleanly', async ({ page }) => {
    await waitForBoot(page)
    const result = await page.evaluate(async () => {
      const g = (window as any).__war3Game
      document.getElementById('menu-start-button')!.dispatchEvent(new Event('click'))
      await new Promise(r => setTimeout(r, 50))
      document.getElementById('briefing-start-button')!.dispatchEvent(new Event('click'))
      await new Promise(r => setTimeout(r, 50))
      return {
        briefingHidden: document.getElementById('briefing-shell')!.hidden,
        isPlaying: g.phase.isPlaying(),
        hasUnits: Array.isArray(g.units) && g.units.length > 0,
      }
    })
    expect(result.briefingHidden).toBe(true)
    expect(result.isPlaying).toBe(true)
    expect(result.hasUnits).toBe(true)
  })

  test('return-to-menu after briefing start clears briefing state', async ({ page }) => {
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
        briefingHidden: document.getElementById('briefing-shell')!.hidden,
        menuVisible: !document.getElementById('menu-shell')!.hidden,
        isPaused: g.isPaused(),
      }
    })
    expect(result.briefingHidden).toBe(true)
    expect(result.menuVisible).toBe(true)
    expect(result.isPaused).toBe(true)
  })
})
