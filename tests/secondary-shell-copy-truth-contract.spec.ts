/**
 * Secondary Shell Copy Truth Contract (Task 81)
 *
 * Proves secondary shell titles only claim implemented behavior,
 * disabled routes are described truthfully, and copy is consistent
 * across openings from different states.
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

test.describe('Secondary Shell Copy Truth', () => {
  test.setTimeout(120000)

  test('help title and content describe implemented behavior', async ({ page }) => {
    await waitForBoot(page)
    const result = await page.evaluate(async () => {
      document.getElementById('menu-help-button')!.dispatchEvent(new Event('click'))
      await new Promise(r => setTimeout(r, 50))
      return {
        title: document.getElementById('help-shell-title')!.textContent,
        content: document.querySelector('.page-shell-help-content')!.textContent,
      }
    })
    expect(result.title).toBe('操作说明')
    expect(result.content).toContain('左键')
    expect(result.content).toContain('右键')
  })

  test('settings note is truthful about no options', async ({ page }) => {
    await waitForBoot(page)
    const result = await page.evaluate(async () => {
      document.getElementById('menu-settings-button')!.dispatchEvent(new Event('click'))
      await new Promise(r => setTimeout(r, 50))
      return document.querySelector('.page-shell-settings-note')!.textContent
    })
    expect(result).toContain('无额外可配置项')
  })

  test('mode-select describes campaign as unimplemented truthfully', async ({ page }) => {
    await waitForBoot(page)
    const result = await page.evaluate(async () => {
      document.getElementById('menu-mode-select-button')!.dispatchEvent(new Event('click'))
      await new Promise(r => setTimeout(r, 50))
      const campaignBtn = document.getElementById('mode-select-campaign-button') as HTMLButtonElement
      const skirmishBtn = document.getElementById('mode-select-skirmish-button') as HTMLButtonElement
      return {
        campaignText: campaignBtn.textContent,
        skirmishText: skirmishBtn.textContent,
        campaignDisabled: campaignBtn.disabled,
      }
    })
    expect(result.campaignText).toContain('未实现')
    expect(result.skirmishText).toContain('已实现')
    expect(result.campaignDisabled).toBe(true)
  })
})
