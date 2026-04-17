/**
 * Shell Visible-State Exclusivity Contract (Task 79)
 *
 * Proves only one menu-level shell is visible at a time, switching hides
 * previous, and return-to-menu clears stale combined visibility.
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

function countVisibleShells(): number {
  const ids = ['menu-shell', 'help-shell', 'settings-shell', 'mode-select-shell', 'briefing-shell']
  return ids.filter(id => !(document.getElementById(id) as HTMLElement).hidden).length
}

test.describe('Shell Visible-State Exclusivity', () => {
  test.setTimeout(120000)

  test('only one menu-level shell visible at a time', async ({ page }) => {
    await waitForBoot(page)
    const result = await page.evaluate(async () => {
      // Menu visible at boot
      const menuCount = (window as any).__countVisibleShells = () => {
        const ids = ['menu-shell', 'help-shell', 'settings-shell', 'mode-select-shell', 'briefing-shell']
        return ids.filter(id => !(document.getElementById(id) as HTMLElement).hidden).length
      }

      const atBoot = menuCount()

      document.getElementById('menu-help-button')!.dispatchEvent(new Event('click'))
      await new Promise(r => setTimeout(r, 50))
      const inHelp = menuCount()

      document.getElementById('help-close-button')!.dispatchEvent(new Event('click'))
      await new Promise(r => setTimeout(r, 50))
      const afterClose = menuCount()

      return { atBoot, inHelp, afterClose }
    })
    expect(result.atBoot).toBe(1)
    expect(result.inHelp).toBe(1)
    expect(result.afterClose).toBe(1)
  })

  test('switching between shells hides previous', async ({ page }) => {
    await waitForBoot(page)
    const result = await page.evaluate(async () => {
      const v = () => ({
        menu: !document.getElementById('menu-shell')!.hidden,
        help: !document.getElementById('help-shell')!.hidden,
        settings: !document.getElementById('settings-shell')!.hidden,
      })

      document.getElementById('menu-help-button')!.dispatchEvent(new Event('click'))
      await new Promise(r => setTimeout(r, 50))
      const inHelp = v()

      // Go back, then settings
      document.getElementById('help-close-button')!.dispatchEvent(new Event('click'))
      await new Promise(r => setTimeout(r, 50))
      document.getElementById('menu-settings-button')!.dispatchEvent(new Event('click'))
      await new Promise(r => setTimeout(r, 50))
      const inSettings = v()

      return { inHelp, inSettings }
    })
    expect(result.inHelp.help).toBe(true)
    expect(result.inHelp.menu).toBe(false)
    expect(result.inSettings.settings).toBe(true)
    expect(result.inSettings.help).toBe(false)
    expect(result.inSettings.menu).toBe(false)
  })

  test('return-to-menu clears stale combined visibility', async ({ page }) => {
    await waitForBoot(page)
    const result = await page.evaluate(async () => {
      const g = (window as any).__war3Game
      const returnToMenu = (window as any).__returnToMenu as () => void
      const v = () => {
        const ids = ['menu-shell', 'help-shell', 'settings-shell', 'mode-select-shell', 'briefing-shell', 'pause-shell', 'results-shell']
        return ids.filter(id => !(document.getElementById(id) as HTMLElement).hidden).length
      }

      document.getElementById('menu-start-button')!.dispatchEvent(new Event('click'))
      await new Promise(r => setTimeout(r, 50))
      document.getElementById('briefing-start-button')!.dispatchEvent(new Event('click'))
      await new Promise(r => setTimeout(r, 50))

      g.pauseGame()
      returnToMenu()
      await new Promise(r => setTimeout(r, 100))

      const visibleCount = v()
      const menuVisible = !document.getElementById('menu-shell')!.hidden

      return { visibleCount, menuVisible }
    })
    expect(result.visibleCount).toBe(1)
    expect(result.menuVisible).toBe(true)
  })
})
