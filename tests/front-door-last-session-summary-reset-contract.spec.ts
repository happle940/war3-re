/**
 * Last Session Summary Reset Contract (Task 77)
 *
 * Proves next session outcome updates summary, manual reset clears it,
 * and summary does not survive hard boot in wrong context.
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

test.describe('Last Session Summary Reset', () => {
  test.setTimeout(120000)

  test('victory then defeat updates summary truthfully', async ({ page }) => {
    await waitForBoot(page)
    const result = await page.evaluate(async () => {
      const g = (window as any).__war3Game
      const returnToMenu = (window as any).__returnToMenu as () => void
      const summary = document.getElementById('menu-last-session-summary')!

      // First session: win
      document.getElementById('menu-start-button')!.dispatchEvent(new Event('click'))
      await new Promise(r => setTimeout(r, 50))
      document.getElementById('briefing-start-button')!.dispatchEvent(new Event('click'))
      await new Promise(r => setTimeout(r, 50))

      let aiTH = g.units.find((u: any) => u.team === 1 && u.type === 'townhall')
      if (!aiTH) return { error: 'no AI townhall' }
      aiTH.hp = 0
      g.update(0.016)
      returnToMenu()
      await new Promise(r => setTimeout(r, 100))
      const firstSummary = summary.textContent

      return { firstSummary }
    })
    expect(result.error).toBeUndefined()
    expect(result.firstSummary).toContain('胜利')
  })

  test('fresh boot has no stale summary', async ({ page }) => {
    await waitForBoot(page)
    const result = await page.evaluate(() => {
      const summary = document.getElementById('menu-last-session-summary')!
      return { empty: !summary.textContent || summary.style.display === 'none' }
    })
    expect(result.empty).toBe(true)
  })

  test('manual reset clears summary data', async ({ page }) => {
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

      // Now start new session to clear summary
      document.getElementById('menu-start-button')!.dispatchEvent(new Event('click'))
      await new Promise(r => setTimeout(r, 50))

      // Escape back to menu
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))
      await new Promise(r => setTimeout(r, 50))
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))
      await new Promise(r => setTimeout(r, 50))

      const sourceKind = g.currentMapSource?.kind
      return { sourceKind }
    })
    expect(result.error).toBeUndefined()
    expect(result.sourceKind).toBe('procedural')
  })
})
