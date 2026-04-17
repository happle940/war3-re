/**
 * Menu Shell Start Current Map Contract
 *
 * Proves that the front-door menu exposes one real start action that enters
 * active play through the real boot path (menu → briefing → gameplay),
 * and the menu stops being the active shell after gameplay starts.
 */
import { test, expect, type Page } from '@playwright/test'

const BASE_NORMAL = 'http://127.0.0.1:4173/'

async function waitForBoot(page: Page) {
  const consoleErrors: string[] = []
  page.on('console', (msg) => {
    if (msg.type() === 'error') consoleErrors.push(msg.text())
  })
  ;(page as any).__consoleErrors = consoleErrors

  await page.goto(BASE_NORMAL, { waitUntil: 'domcontentloaded' })
  await page.waitForFunction(() => {
    const game = (window as any).__war3Game
    if (!game) return false
    const canvas = document.getElementById('game-canvas')
    if (!canvas) return false
    if (!game.renderer) return false
    const el = game.renderer.domElement
    if (el.width === 0 || el.height === 0) return false
    if (!Array.isArray(game.units) || game.units.length === 0) return false
    return true
  }, { timeout: 15000 })
  await page.waitForTimeout(500)
}

/** Click menu start → briefing start to enter gameplay */
async function startGameplay(page: Page) {
  return page.evaluate(async () => {
    const menuStartBtn = document.getElementById('menu-start-button') as HTMLButtonElement
    menuStartBtn.click()
    await new Promise(r => setTimeout(r, 50))

    const briefingStartBtn = document.getElementById('briefing-start-button') as HTMLButtonElement
    briefingStartBtn.click()
    await new Promise(r => setTimeout(r, 50))
  })
}

test.describe('Menu Shell Start Current Map', () => {
  test.setTimeout(120000)

  test('menu start button enters active play', async ({ page }) => {
    await waitForBoot(page)

    const result = await page.evaluate(async () => {
      const g = (window as any).__war3Game
      const menuShell = document.getElementById('menu-shell')!
      const menuStartBtn = document.getElementById('menu-start-button') as HTMLButtonElement

      // Pre-condition: menu visible, game paused
      const menuVisibleBefore = !menuShell.hidden
      const isPausedBefore = g.isPaused()

      // Click start → goes to briefing
      menuStartBtn.click()
      await new Promise(r => setTimeout(r, 50))

      // Briefing is visible, not yet playing
      const briefingVisible = !document.getElementById('briefing-shell')!.hidden

      // Click briefing start → enters gameplay
      const briefingStartBtn = document.getElementById('briefing-start-button') as HTMLButtonElement
      briefingStartBtn.click()
      await new Promise(r => setTimeout(r, 50))

      const menuHiddenAfter = menuShell.hidden
      const briefingHiddenAfter = document.getElementById('briefing-shell')!.hidden
      const isPlayingAfter = g.phase.isPlaying()
      const isPausedAfter = g.isPaused()
      const hasUnits = Array.isArray(g.units) && g.units.length > 0
      const hasMapSource = !!g.currentMapSource

      return {
        menuVisibleBefore,
        isPausedBefore,
        briefingVisible,
        menuHiddenAfter,
        briefingHiddenAfter,
        isPlayingAfter,
        isPausedAfter,
        hasUnits,
        hasMapSource,
      }
    })

    // Pre-condition: menu was visible, game was paused
    expect(result.menuVisibleBefore).toBe(true)
    expect(result.isPausedBefore).toBe(true)

    // Briefing appears between menu and gameplay
    expect(result.briefingVisible).toBe(true)

    // After briefing start: menu hidden, briefing hidden, game playing
    expect(result.menuHiddenAfter).toBe(true)
    expect(result.briefingHiddenAfter).toBe(true)
    expect(result.isPlayingAfter).toBe(true)
    expect(result.isPausedAfter).toBe(false)

    // Game state is live
    expect(result.hasUnits).toBe(true)
    expect(result.hasMapSource).toBe(true)
  })

  test('menu start action uses the real current-map/procedural seam', async ({ page }) => {
    await waitForBoot(page)

    const result = await page.evaluate(async () => {
      const g = (window as any).__war3Game

      // The game has a procedural current-map source from boot
      const sourceBefore = g.currentMapSource?.kind

      // Start through briefing
      document.getElementById('menu-start-button')!.click()
      await new Promise(r => setTimeout(r, 50))
      document.getElementById('briefing-start-button')!.click()
      await new Promise(r => setTimeout(r, 50))

      // Source is still the same procedural source (not replaced or cleared)
      const sourceAfter = g.currentMapSource?.kind
      const isPlaying = g.phase.isPlaying()

      return { sourceBefore, sourceAfter, isPlaying }
    })

    expect(result.sourceBefore).toBe('procedural')
    expect(result.sourceAfter).toBe('procedural')
    expect(result.isPlaying).toBe(true)
  })

  test('menu is not re-visible after game ends', async ({ page }) => {
    await waitForBoot(page)

    const result = await page.evaluate(async () => {
      const g = (window as any).__war3Game
      const menuShell = document.getElementById('menu-shell')!

      // Start the game through briefing
      document.getElementById('menu-start-button')!.click()
      await new Promise(r => setTimeout(r, 50))
      document.getElementById('briefing-start-button')!.click()
      await new Promise(r => setTimeout(r, 50))

      // Trigger victory
      const aiTH = g.units.find((u: any) => u.team === 1 && u.type === 'townhall')
      if (!aiTH) return { error: 'no AI townhall' }
      aiTH.hp = 0
      g.update(0.016)

      const menuHiddenAfterGameOver = menuShell.hidden
      const isGameOver = g.phase.isGameOver()

      return { menuHiddenAfterGameOver, isGameOver }
    })

    expect(result.error).toBeUndefined()
    expect(result.isGameOver).toBe(true)
    expect(result.menuHiddenAfterGameOver).toBe(true)
  })
})
