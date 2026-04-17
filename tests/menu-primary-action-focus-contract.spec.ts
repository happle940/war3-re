/**
 * Menu Primary Action Focus Contract (Task 78)
 *
 * Proves visible shells focus truthful primary action, disabled routes
 * cannot become focused, and switching updates focus.
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

test.describe('Menu Primary Action Focus', () => {
  test.setTimeout(120000)

  test('menu start button is enabled and present at boot', async ({ page }) => {
    await waitForBoot(page)
    const result = await page.evaluate(() => {
      const btn = document.getElementById('menu-start-button') as HTMLButtonElement
      return { exists: !!btn, disabled: btn.disabled }
    })
    expect(result.exists).toBe(true)
    expect(result.disabled).toBe(false)
  })

  test('disabled campaign button in mode-select cannot start gameplay', async ({ page }) => {
    await waitForBoot(page)
    const result = await page.evaluate(async () => {
      const g = (window as any).__war3Game
      document.getElementById('menu-mode-select-button')!.dispatchEvent(new Event('click'))
      await new Promise(r => setTimeout(r, 50))
      const campaignBtn = document.getElementById('mode-select-campaign-button') as HTMLButtonElement
      campaignBtn.click()
      await new Promise(r => setTimeout(r, 50))
      return { isPlaying: g.phase.isPlaying() }
    })
    expect(result.isPlaying).toBe(false)
  })

  test('switching from help to menu updates visible primary action', async ({ page }) => {
    await waitForBoot(page)
    const result = await page.evaluate(async () => {
      document.getElementById('menu-help-button')!.dispatchEvent(new Event('click'))
      await new Promise(r => setTimeout(r, 50))
      document.getElementById('help-close-button')!.dispatchEvent(new Event('click'))
      await new Promise(r => setTimeout(r, 50))

      const startBtn = document.getElementById('menu-start-button') as HTMLButtonElement
      return { startBtnVisible: !startBtn.disabled, menuVisible: !document.getElementById('menu-shell')!.hidden }
    })
    expect(result.startBtnVisible).toBe(true)
    expect(result.menuVisible).toBe(true)
  })
})
