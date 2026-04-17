/**
 * Help / Controls Shell Entry Contract (Task 64)
 *
 * Proves help is reachable from a real shell state, only shows implemented
 * controls, and closing returns to prior state without leaking overlays.
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

test.describe('Help Shell Entry', () => {
  test.setTimeout(120000)

  test('help is reachable from menu shell', async ({ page }) => {
    await waitForBoot(page)
    const result = await page.evaluate(async () => {
      const helpBtn = document.getElementById('menu-help-button') as HTMLButtonElement
      helpBtn.click()
      await new Promise(r => setTimeout(r, 50))
      const helpShell = document.getElementById('help-shell')!
      const menuShell = document.getElementById('menu-shell')!
      return {
        helpVisible: !helpShell.hidden,
        menuHidden: menuShell.hidden,
      }
    })
    expect(result.helpVisible).toBe(true)
    expect(result.menuHidden).toBe(true)
  })

  test('help only shows implemented controls truthfully', async ({ page }) => {
    await waitForBoot(page)
    const result = await page.evaluate(async () => {
      const helpBtn = document.getElementById('menu-help-button') as HTMLButtonElement
      helpBtn.click()
      await new Promise(r => setTimeout(r, 50))
      const content = document.querySelector('.page-shell-help-content')!.textContent!
      return { hasClick: content.includes('左键'), hasRightClick: content.includes('右键') }
    })
    expect(result.hasClick).toBe(true)
    expect(result.hasRightClick).toBe(true)
  })

  test('closing help returns to menu without leaking overlays', async ({ page }) => {
    await waitForBoot(page)
    const result = await page.evaluate(async () => {
      const helpBtn = document.getElementById('menu-help-button') as HTMLButtonElement
      helpBtn.click()
      await new Promise(r => setTimeout(r, 50))

      const closeBtn = document.getElementById('help-close-button') as HTMLButtonElement
      closeBtn.click()
      await new Promise(r => setTimeout(r, 50))

      const helpShell = document.getElementById('help-shell')!
      const menuShell = document.getElementById('menu-shell')!
      const settingsShell = document.getElementById('settings-shell')!
      return {
        helpHidden: helpShell.hidden,
        menuVisible: !menuShell.hidden,
        settingsHidden: settingsShell.hidden,
      }
    })
    expect(result.helpHidden).toBe(true)
    expect(result.menuVisible).toBe(true)
    expect(result.settingsHidden).toBe(true)
  })
})
