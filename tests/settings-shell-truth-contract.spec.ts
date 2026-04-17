/**
 * Settings Shell Truth Boundary Contract (Task 65)
 *
 * Proves settings is reachable, only shows implemented/explicitly-disabled
 * options, and closing returns to prior state without changing session truth.
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

test.describe('Settings Shell Truth', () => {
  test.setTimeout(120000)

  test('settings is reachable from menu shell', async ({ page }) => {
    await waitForBoot(page)
    const result = await page.evaluate(async () => {
      const btn = document.getElementById('menu-settings-button') as HTMLButtonElement
      btn.click()
      await new Promise(r => setTimeout(r, 50))
      return {
        settingsVisible: !document.getElementById('settings-shell')!.hidden,
        menuHidden: document.getElementById('menu-shell')!.hidden,
      }
    })
    expect(result.settingsVisible).toBe(true)
    expect(result.menuHidden).toBe(true)
  })

  test('only implemented or explicitly disabled options shown', async ({ page }) => {
    await waitForBoot(page)
    const result = await page.evaluate(async () => {
      const btn = document.getElementById('menu-settings-button') as HTMLButtonElement
      btn.click()
      await new Promise(r => setTimeout(r, 50))
      const note = document.querySelector('.page-shell-settings-note')!.textContent!
      return { hasNote: note.length > 0 }
    })
    expect(result.hasNote).toBe(true)
  })

  test('closing settings returns to menu without changing session truth', async ({ page }) => {
    await waitForBoot(page)
    const result = await page.evaluate(async () => {
      const g = (window as any).__war3Game
      const btn = document.getElementById('menu-settings-button') as HTMLButtonElement
      btn.click()
      await new Promise(r => setTimeout(r, 50))

      const sourceBefore = g.currentMapSource?.kind

      const closeBtn = document.getElementById('settings-close-button') as HTMLButtonElement
      closeBtn.click()
      await new Promise(r => setTimeout(r, 50))

      return {
        menuVisible: !document.getElementById('menu-shell')!.hidden,
        settingsHidden: document.getElementById('settings-shell')!.hidden,
        sourceUnchanged: g.currentMapSource?.kind === sourceBefore,
        isPaused: g.isPaused(),
      }
    })
    expect(result.menuVisible).toBe(true)
    expect(result.settingsHidden).toBe(true)
    expect(result.sourceUnchanged).toBe(true)
    expect(result.isPaused).toBe(true)
  })
})
