/**
 * Pre-Match Briefing Truth Contract (Task 66)
 *
 * Proves the front-door start passes through a briefing shell, it shows
 * truthful info, and no briefing state leaks.
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

test.describe('Pre-Match Briefing Truth', () => {
  test.setTimeout(120000)

  test('start passes through briefing before live play', async ({ page }) => {
    await waitForBoot(page)
    const result = await page.evaluate(async () => {
      const menuStartBtn = document.getElementById('menu-start-button') as HTMLButtonElement
      menuStartBtn.click()
      await new Promise(r => setTimeout(r, 50))
      const briefingShell = document.getElementById('briefing-shell')!
      const menuShell = document.getElementById('menu-shell')!
      return {
        briefingVisible: !briefingShell.hidden,
        menuHidden: menuShell.hidden,
        hasStartBtn: !!document.getElementById('briefing-start-button'),
      }
    })
    expect(result.briefingVisible).toBe(true)
    expect(result.menuHidden).toBe(true)
    expect(result.hasStartBtn).toBe(true)
  })

  test('briefing shows truthful map and mode info', async ({ page }) => {
    await waitForBoot(page)
    const result = await page.evaluate(async () => {
      const menuStartBtn = document.getElementById('menu-start-button') as HTMLButtonElement
      menuStartBtn.click()
      await new Promise(r => setTimeout(r, 50))
      return {
        source: document.getElementById('briefing-map-source')!.textContent,
        mode: document.getElementById('briefing-mode')!.textContent,
      }
    })
    expect(result.source).toContain('程序化地图')
    expect(result.mode).toContain('遭遇战')
  })

  test('briefing state does not leak into next session', async ({ page }) => {
    await waitForBoot(page)
    const result = await page.evaluate(async () => {
      const menuStartBtn = document.getElementById('menu-start-button') as HTMLButtonElement
      menuStartBtn.click()
      await new Promise(r => setTimeout(r, 50))
      const briefingStartBtn = document.getElementById('briefing-start-button') as HTMLButtonElement
      briefingStartBtn.click()
      await new Promise(r => setTimeout(r, 50))
      return {
        briefingHidden: document.getElementById('briefing-shell')!.hidden,
        isPlaying: (window as any).__war3Game.phase.isPlaying(),
      }
    })
    expect(result.briefingHidden).toBe(true)
    expect(result.isPlaying).toBe(true)
  })
})
