/**
 * Menu Shell Mode Truth Boundary Contract (Task 63)
 *
 * Proves the menu names the current mode truthfully, no fake branches exist,
 * and the mode stays aligned with the real start path.
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

test.describe('Menu Shell Mode Truth', () => {
  test.setTimeout(120000)

  test('menu names current playable entry truthfully', async ({ page }) => {
    await waitForBoot(page)
    const label = await page.evaluate(() => {
      return document.getElementById('menu-mode-label')!.textContent
    })
    expect(label).toBe('模式：遭遇战')
  })

  test('no fake mode-select branch implied by visible shell', async ({ page }) => {
    await waitForBoot(page)
    const result = await page.evaluate(() => {
      const campaignBtn = document.getElementById('mode-select-campaign-button') as HTMLButtonElement
      return { exists: !!campaignBtn, disabled: campaignBtn?.disabled }
    })
    // Campaign button exists but is disabled
    expect(result.exists).toBe(true)
    expect(result.disabled).toBe(true)
  })

  test('mode stays aligned with start path after return-to-menu', async ({ page }) => {
    await waitForBoot(page)
    const result = await page.evaluate(async () => {
      const g = (window as any).__war3Game
      const returnToMenu = (window as any).__returnToMenu as () => void
      const menuStartBtn = document.getElementById('menu-start-button') as HTMLButtonElement
      const briefingStartBtn = document.getElementById('briefing-start-button') as HTMLButtonElement

      // Start → briefing → gameplay
      menuStartBtn.click()
      await new Promise(r => setTimeout(r, 50))
      briefingStartBtn.click()
      await new Promise(r => setTimeout(r, 50))

      g.pauseGame()
      returnToMenu()
      await new Promise(r => setTimeout(r, 100))

      return document.getElementById('menu-mode-label')!.textContent
    })
    expect(result).toBe('模式：遭遇战')
  })
})
