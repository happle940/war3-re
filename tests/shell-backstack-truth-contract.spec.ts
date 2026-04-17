/**
 * Shell Backstack Truth Contract (Task 69)
 *
 * Proves secondary shells return to their prior shell, nested transitions
 * don't strand overlays, and back semantics don't leak into gameplay.
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

function visState() {
  return {
    menu: !document.getElementById('menu-shell')!.hidden,
    help: !document.getElementById('help-shell')!.hidden,
    settings: !document.getElementById('settings-shell')!.hidden,
    modeSelect: !document.getElementById('mode-select-shell')!.hidden,
    briefing: !document.getElementById('briefing-shell')!.hidden,
  }
}

test.describe('Shell Backstack Truth', () => {
  test.setTimeout(120000)

  test('help returns to menu', async ({ page }) => {
    await waitForBoot(page)
    const result = await page.evaluate(async () => {
      const v = (window as any).__visState = () => ({
        menu: !document.getElementById('menu-shell')!.hidden,
        help: !document.getElementById('help-shell')!.hidden,
        settings: !document.getElementById('settings-shell')!.hidden,
        modeSelect: !document.getElementById('mode-select-shell')!.hidden,
      })

      document.getElementById('menu-help-button')!.dispatchEvent(new Event('click'))
      await new Promise(r => setTimeout(r, 50))
      const inHelp = v()

      document.getElementById('help-close-button')!.dispatchEvent(new Event('click'))
      await new Promise(r => setTimeout(r, 50))
      const afterClose = v()

      return { inHelp, afterClose }
    })
    expect(result.inHelp.help).toBe(true)
    expect(result.inHelp.menu).toBe(false)
    expect(result.afterClose.help).toBe(false)
    expect(result.afterClose.menu).toBe(true)
  })

  test('mode-select returns to menu', async ({ page }) => {
    await waitForBoot(page)
    const result = await page.evaluate(async () => {
      const v = () => ({
        menu: !document.getElementById('menu-shell')!.hidden,
        modeSelect: !document.getElementById('mode-select-shell')!.hidden,
      })
      document.getElementById('menu-mode-select-button')!.dispatchEvent(new Event('click'))
      await new Promise(r => setTimeout(r, 50))
      const inMode = v()
      document.getElementById('mode-select-back-button')!.dispatchEvent(new Event('click'))
      await new Promise(r => setTimeout(r, 50))
      const afterClose = v()
      return { inMode, afterClose }
    })
    expect(result.inMode.modeSelect).toBe(true)
    expect(result.afterClose.modeSelect).toBe(false)
    expect(result.afterClose.menu).toBe(true)
  })

  test('escape from briefing returns to menu without entering gameplay', async ({ page }) => {
    await waitForBoot(page)
    const result = await page.evaluate(async () => {
      const g = (window as any).__war3Game
      document.getElementById('menu-start-button')!.dispatchEvent(new Event('click'))
      await new Promise(r => setTimeout(r, 50))

      const briefingVisible = !document.getElementById('briefing-shell')!.hidden
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))
      await new Promise(r => setTimeout(r, 50))

      return {
        briefingVisible,
        briefingHiddenAfter: document.getElementById('briefing-shell')!.hidden,
        menuVisible: !document.getElementById('menu-shell')!.hidden,
        isPlaying: g.phase.isPlaying(),
      }
    })
    expect(result.briefingVisible).toBe(true)
    expect(result.briefingHiddenAfter).toBe(true)
    expect(result.menuVisible).toBe(true)
    expect(result.isPlaying).toBe(false)
  })
})
