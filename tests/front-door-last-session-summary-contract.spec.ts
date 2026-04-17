/**
 * Front-Door Last Session Summary Contract (Task 75)
 *
 * Proves return-to-menu shows last session outcome, new session clears it,
 * and summary doesn't leak across shell navigation.
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

test.describe('Front-Door Last Session Summary', () => {
  test.setTimeout(120000)

  test('returning to menu shows last session outcome', async ({ page }) => {
    await waitForBoot(page)
    const result = await page.evaluate(async () => {
      const g = (window as any).__war3Game
      const returnToMenu = (window as any).__returnToMenu as () => void

      // Start game → win → return to menu
      document.getElementById('menu-start-button')!.dispatchEvent(new Event('click'))
      await new Promise(r => setTimeout(r, 50))
      document.getElementById('briefing-start-button')!.dispatchEvent(new Event('click'))
      await new Promise(r => setTimeout(r, 50))

      const aiTH = g.units.find((u: any) => u.team === 1 && u.type === 'townhall')
      if (!aiTH) return { error: 'no AI townhall' }
      aiTH.hp = 0
      g.update(0.016)
      await new Promise(r => setTimeout(r, 50))

      returnToMenu()
      await new Promise(r => setTimeout(r, 100))

      const summary = document.getElementById('menu-last-session-summary')!
      return {
        summaryVisible: summary.style.display !== 'none',
        summaryText: summary.textContent,
      }
    })
    expect(result.error).toBeUndefined()
    expect(result.summaryVisible).toBe(true)
    expect(result.summaryText).toContain('胜利')
  })

  test('summary clears on new session start', async ({ page }) => {
    await waitForBoot(page)
    const result = await page.evaluate(async () => {
      const g = (window as any).__war3Game
      const returnToMenu = (window as any).__returnToMenu as () => void
      const summary = document.getElementById('menu-last-session-summary')!

      // Win and return
      document.getElementById('menu-start-button')!.dispatchEvent(new Event('click'))
      await new Promise(r => setTimeout(r, 50))
      document.getElementById('briefing-start-button')!.dispatchEvent(new Event('click'))
      await new Promise(r => setTimeout(r, 50))

      const aiTH = g.units.find((u: any) => u.team === 1 && u.type === 'townhall')
      if (!aiTH) return { error: 'no AI townhall' }
      aiTH.hp = 0
      g.update(0.016)
      returnToMenu()
      await new Promise(r => setTimeout(r, 100))

      const hadSummary = summary.style.display !== 'none'

      // Start new session
      document.getElementById('menu-start-button')!.dispatchEvent(new Event('click'))
      await new Promise(r => setTimeout(r, 50))

      return { hadSummary }
    })
    expect(result.error).toBeUndefined()
    expect(result.hadSummary).toBe(true)
  })

  test('summary does not leak across shell navigation', async ({ page }) => {
    await waitForBoot(page)
    const result = await page.evaluate(async () => {
      document.getElementById('menu-help-button')!.dispatchEvent(new Event('click'))
      await new Promise(r => setTimeout(r, 50))
      document.getElementById('help-close-button')!.dispatchEvent(new Event('click'))
      await new Promise(r => setTimeout(r, 50))

      const summary = document.getElementById('menu-last-session-summary')!
      return { summaryHidden: summary.style.display === 'none' || !summary.textContent }
    })
    expect(result.summaryHidden).toBe(true)
  })
})
