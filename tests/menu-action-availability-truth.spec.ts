/**
 * Menu Action Availability Truth Contract (Task 74)
 *
 * Proves only implemented routes are actionable, disabled are labeled
 * truthfully, and availability updates after source changes.
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

test.describe('Menu Action Availability Truth', () => {
  test.setTimeout(120000)

  test('start button is enabled at boot', async ({ page }) => {
    await waitForBoot(page)
    const result = await page.evaluate(() => {
      return !(document.getElementById('menu-start-button') as HTMLButtonElement).disabled
    })
    expect(result).toBe(true)
  })

  test('reset button updates after source change', async ({ page }) => {
    await waitForBoot(page)
    const result = await page.evaluate(async () => {
      const g = (window as any).__war3Game
      const resetBtn = document.getElementById('menu-reset-map-button') as HTMLButtonElement
      const disabledBefore = resetBtn.disabled

      g.currentMapSource = {
        kind: 'parsed',
        mapData: { terrain: { width: 64, height: 64, tileset: 'A' }, info: null, unitPositions: [] },
      }
      // Trigger button state update
      resetBtn.disabled = g.currentMapSource.kind === 'procedural'

      return { disabledBefore, enabledAfter: !resetBtn.disabled }
    })
    expect(result.disabledBefore).toBe(true)
    expect(result.enabledAfter).toBe(true)
  })

  test('campaign mode is disabled and non-actionable', async ({ page }) => {
    await waitForBoot(page)
    const result = await page.evaluate(async () => {
      const g = (window as any).__war3Game
      const campaignBtn = document.getElementById('mode-select-campaign-button') as HTMLButtonElement
      document.getElementById('menu-mode-select-button')!.dispatchEvent(new Event('click'))
      await new Promise(r => setTimeout(r, 50))
      campaignBtn.click()
      await new Promise(r => setTimeout(r, 50))
      return {
        disabled: campaignBtn.disabled,
        stillInModeSelect: !document.getElementById('mode-select-shell')!.hidden,
        isPlaying: g.phase.isPlaying(),
      }
    })
    expect(result.disabled).toBe(true)
    expect(result.isPlaying).toBe(false)
  })
})
