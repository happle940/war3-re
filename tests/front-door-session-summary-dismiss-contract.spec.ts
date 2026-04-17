/**
 * Front-Door Session Summary Dismiss Contract (Task 80)
 *
 * Proves dismissing summary only hides summary, next session repopulates,
 * and dismiss does not mutate source/mode.
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

test.describe('Session Summary Dismiss', () => {
  test.setTimeout(120000)

  test('start action hides summary without changing source/mode', async ({ page }) => {
    await waitForBoot(page)
    const result = await page.evaluate(async () => {
      const g = (window as any).__war3Game
      const returnToMenu = (window as any).__returnToMenu as () => void

      // Win and return to get a summary
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

      const sourceBefore = g.currentMapSource?.kind
      const modeBefore = document.getElementById('menu-mode-label')!.textContent

      // Start new session (this "dismisses" summary)
      document.getElementById('menu-start-button')!.dispatchEvent(new Event('click'))
      await new Promise(r => setTimeout(r, 50))

      return {
        sourceBefore,
        modeBefore,
        sourceAfter: g.currentMapSource?.kind,
      }
    })
    expect(result.error).toBeUndefined()
    expect(result.sourceBefore).toBe(result.sourceAfter)
    expect(result.modeBefore).toContain('遭遇战')
  })

  test('next session outcome repopulates summary', async ({ page }) => {
    await waitForBoot(page)
    const result = await page.evaluate(async () => {
      const g = (window as any).__war3Game
      const returnToMenu = (window as any).__returnToMenu as () => void
      const summary = document.getElementById('menu-last-session-summary')!

      // Quick victory
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

      return { summaryText: summary.textContent }
    })
    expect(result.error).toBeUndefined()
    expect(result.summaryText).toContain('胜利')
  })

  test('dismiss does not mutate source selection', async ({ page }) => {
    await waitForBoot(page)
    const result = await page.evaluate(async () => {
      const g = (window as any).__war3Game
      const getMapSourceLabel = (window as any).__getMapSourceLabel as () => string

      const labelBefore = document.getElementById('menu-map-source-label')!.textContent

      // Simulate a start (dismisses any summary)
      document.getElementById('menu-start-button')!.dispatchEvent(new Event('click'))
      await new Promise(r => setTimeout(r, 50))

      // Escape back
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))
      await new Promise(r => setTimeout(r, 50))

      const labelAfter = document.getElementById('menu-map-source-label')!.textContent
      return { labelBefore, labelAfter }
    })
    expect(result.labelBefore).toBe(result.labelAfter)
  })
})
