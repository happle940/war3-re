/**
 * Mode-Select Disabled Branch Rationale Contract (Task 76)
 *
 * Proves unavailable branches are disabled with truthful wording,
 * activating disabled branch can't corrupt state, and implemented
 * branch is visually clear.
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

test.describe('Mode-Select Disabled Branches', () => {
  test.setTimeout(120000)

  test('unavailable branches have truthful disabled wording', async ({ page }) => {
    await waitForBoot(page)
    const result = await page.evaluate(async () => {
      document.getElementById('menu-mode-select-button')!.dispatchEvent(new Event('click'))
      await new Promise(r => setTimeout(r, 50))
      const btn = document.getElementById('mode-select-campaign-button') as HTMLButtonElement
      return { text: btn.textContent, disabled: btn.disabled }
    })
    expect(result.text).toContain('未实现')
    expect(result.disabled).toBe(true)
  })

  test('clicking disabled branch does not corrupt shell state', async ({ page }) => {
    await waitForBoot(page)
    const result = await page.evaluate(async () => {
      const g = (window as any).__war3Game
      document.getElementById('menu-mode-select-button')!.dispatchEvent(new Event('click'))
      await new Promise(r => setTimeout(r, 50))
      const btn = document.getElementById('mode-select-campaign-button') as HTMLButtonElement
      btn.click()
      await new Promise(r => setTimeout(r, 50))
      return {
        stillInModeSelect: !document.getElementById('mode-select-shell')!.hidden,
        isPlaying: g.phase.isPlaying(),
        isPaused: g.isPaused(),
      }
    })
    expect(result.stillInModeSelect).toBe(true)
    expect(result.isPlaying).toBe(false)
    expect(result.isPaused).toBe(true)
  })

  test('implemented branch is visually clear as enabled', async ({ page }) => {
    await waitForBoot(page)
    const result = await page.evaluate(async () => {
      document.getElementById('menu-mode-select-button')!.dispatchEvent(new Event('click'))
      await new Promise(r => setTimeout(r, 50))
      const btn = document.getElementById('mode-select-skirmish-button') as HTMLButtonElement
      return { text: btn.textContent, enabled: !btn.disabled }
    })
    expect(result.text).toContain('已实现')
    expect(result.enabled).toBe(true)
  })
})
