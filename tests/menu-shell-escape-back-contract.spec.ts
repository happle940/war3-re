/**
 * Secondary Shell Escape/Back Contract (Task 72)
 *
 * Proves escape closes secondary shells, doesn't affect gameplay,
 * and repeated back doesn't strand overlays.
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

test.describe('Secondary Shell Escape/Back', () => {
  test.setTimeout(120000)

  test('escape closes help and returns to menu', async ({ page }) => {
    await waitForBoot(page)
    const result = await page.evaluate(async () => {
      document.getElementById('menu-help-button')!.dispatchEvent(new Event('click'))
      await new Promise(r => setTimeout(r, 50))
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))
      await new Promise(r => setTimeout(r, 50))
      return {
        helpHidden: document.getElementById('help-shell')!.hidden,
        menuVisible: !document.getElementById('menu-shell')!.hidden,
      }
    })
    expect(result.helpHidden).toBe(true)
    expect(result.menuVisible).toBe(true)
  })

  test('escape from menu does not pause or start gameplay', async ({ page }) => {
    await waitForBoot(page)
    const result = await page.evaluate(async () => {
      const g = (window as any).__war3Game
      const wasPaused = g.isPaused()
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))
      await new Promise(r => setTimeout(r, 50))
      return {
        wasPaused,
        stillPaused: g.isPaused(),
        isPlaying: g.phase.isPlaying(),
      }
    })
    expect(result.wasPaused).toBe(true)
    expect(result.stillPaused).toBe(true)
    expect(result.isPlaying).toBe(false)
  })

  test('repeated escape does not strand overlays', async ({ page }) => {
    await waitForBoot(page)
    const result = await page.evaluate(async () => {
      // Open help → escape → escape again
      document.getElementById('menu-help-button')!.dispatchEvent(new Event('click'))
      await new Promise(r => setTimeout(r, 50))
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))
      await new Promise(r => setTimeout(r, 50))
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))
      await new Promise(r => setTimeout(r, 50))
      return {
        menuVisible: !document.getElementById('menu-shell')!.hidden,
        helpHidden: document.getElementById('help-shell')!.hidden,
        settingsHidden: document.getElementById('settings-shell')!.hidden,
      }
    })
    expect(result.menuVisible).toBe(true)
    expect(result.helpHidden).toBe(true)
    expect(result.settingsHidden).toBe(true)
  })
})
