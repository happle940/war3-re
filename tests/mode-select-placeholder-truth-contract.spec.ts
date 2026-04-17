/**
 * Mode Select Placeholder Truth Contract (Task 67)
 *
 * Proves mode-select is reachable, only skirmish is actionable, campaign is
 * disabled truthfully, and choosing skirmish returns to menu.
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

test.describe('Mode Select Placeholder Truth', () => {
  test.setTimeout(120000)

  test('front door enters mode-select shell', async ({ page }) => {
    await waitForBoot(page)
    const result = await page.evaluate(async () => {
      const btn = document.getElementById('menu-mode-select-button') as HTMLButtonElement
      btn.click()
      await new Promise(r => setTimeout(r, 50))
      return {
        modeSelectVisible: !document.getElementById('mode-select-shell')!.hidden,
        menuHidden: document.getElementById('menu-shell')!.hidden,
      }
    })
    expect(result.modeSelectVisible).toBe(true)
    expect(result.menuHidden).toBe(true)
  })

  test('unimplemented modes are disabled truthfully', async ({ page }) => {
    await waitForBoot(page)
    const result = await page.evaluate(async () => {
      const btn = document.getElementById('menu-mode-select-button') as HTMLButtonElement
      btn.click()
      await new Promise(r => setTimeout(r, 50))
      const campaignBtn = document.getElementById('mode-select-campaign-button') as HTMLButtonElement
      const skirmishBtn = document.getElementById('mode-select-skirmish-button') as HTMLButtonElement
      return {
        campaignDisabled: campaignBtn.disabled,
        skirmishEnabled: !skirmishBtn.disabled,
      }
    })
    expect(result.campaignDisabled).toBe(true)
    expect(result.skirmishEnabled).toBe(true)
  })

  test('choosing skirmish returns to menu without auto-start', async ({ page }) => {
    await waitForBoot(page)
    const result = await page.evaluate(async () => {
      const g = (window as any).__war3Game
      const btn = document.getElementById('menu-mode-select-button') as HTMLButtonElement
      btn.click()
      await new Promise(r => setTimeout(r, 50))
      const skirmishBtn = document.getElementById('mode-select-skirmish-button') as HTMLButtonElement
      skirmishBtn.click()
      await new Promise(r => setTimeout(r, 50))
      return {
        menuVisible: !document.getElementById('menu-shell')!.hidden,
        modeSelectHidden: document.getElementById('mode-select-shell')!.hidden,
        isPlaying: g.phase.isPlaying(),
        isPaused: g.isPaused(),
      }
    })
    expect(result.menuVisible).toBe(true)
    expect(result.modeSelectHidden).toBe(true)
    expect(result.isPlaying).toBe(false)
    expect(result.isPaused).toBe(true)
  })
})
