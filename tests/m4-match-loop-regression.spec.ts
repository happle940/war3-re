/**
 * M4 Victory/Defeat Loop Pack
 *
 * Deterministic runtime proof that the match has real terminal endpoints:
 *   1. Destroying the player's townhall triggers defeat.
 *   2. Destroying the AI's townhall triggers victory.
 *   3. End-state HUD overlay becomes visible and stays stable.
 *   4. The match loop stops advancing game time after terminal state.
 */
import { test, expect, type Page } from '@playwright/test'

const BASE = 'http://127.0.0.1:4173/?runtimeTest=1'

// ==================== Helpers ====================

async function waitForGame(page: Page) {
  const consoleErrors: string[] = []
  page.on('console', (msg) => {
    if (msg.type() === 'error') consoleErrors.push(msg.text())
  })
  ;(page as any).__consoleErrors = consoleErrors

  await page.goto(BASE, { waitUntil: 'domcontentloaded' })

  try {
    await page.waitForFunction(() => {
      const canvas = document.getElementById('game-canvas')
      if (!canvas) return false
      const rect = canvas.getBoundingClientRect()
      if (rect.width === 0 || rect.height === 0) return false
      const game = (window as any).__war3Game
      if (!game) return false
      if (!Array.isArray(game.units) || game.units.length === 0) return false
      if (!game.renderer) return false
      return game.renderer.domElement.width > 0
    }, { timeout: 15000 })
  } catch (e) {
    const snap = await page.evaluate(() => {
      const game = (window as any).__war3Game
      return {
        hasGame: !!game,
        unitsLength: game?.units?.length ?? -1,
        mapStatus: document.getElementById('map-status')?.textContent,
      }
    })
    throw new Error(
      `waitForGame failed: ${JSON.stringify(snap)}. ` +
      `Console: ${consoleErrors.slice(-5).join(' | ')}. ` +
      `Original: ${(e as Error).message}`,
    )
  }

  await page.waitForFunction(() => {
    const status = document.getElementById('map-status')?.textContent ?? ''
    return !status.includes('正在加载')
  }, { timeout: 15000 })

  await page.waitForTimeout(500)
}

// ==================== Tests ====================

test.describe('M4 Victory/Defeat Loop', () => {
  test.setTimeout(60000)

  test('destroying player townhall triggers defeat state', async ({ page }) => {
    await waitForGame(page)

    // Verify player TH exists, then kill it
    const result = await page.evaluate(() => {
      const g = (window as any).__war3Game
      const th = g.units.find((u: any) => u.team === 0 && u.type === 'townhall' && u.isBuilding)
      if (!th) return { error: 'no player townhall' }

      // Record pre-kill state
      const beforeResult = g.getMatchResult()

      // Kill the townhall
      th.hp = 0

      // Advance game to trigger handleDeadUnits + checkGameOver
      for (let i = 0; i < 10; i++) g.update(0.05)

      return {
        beforeResult,
        afterResult: g.getMatchResult(),
        phase: g.phase.get(),
      }
    })

    expect(result.error).toBeUndefined()
    expect(result.beforeResult, 'match result should be null before TH death').toBeNull()
    expect(result.afterResult, 'match result should be defeat after player TH dies').toBe('defeat')
    expect(result.phase, 'phase should be game_over').toBe('game_over')
  })

  test('destroying AI townhall triggers victory state', async ({ page }) => {
    await waitForGame(page)

    const result = await page.evaluate(() => {
      const g = (window as any).__war3Game
      const aiTH = g.units.find((u: any) => u.team === 1 && u.type === 'townhall' && u.isBuilding)
      if (!aiTH) return { error: 'no AI townhall' }

      const beforeResult = g.getMatchResult()

      // Kill the AI townhall
      aiTH.hp = 0

      // Advance game
      for (let i = 0; i < 10; i++) g.update(0.05)

      return {
        beforeResult,
        afterResult: g.getMatchResult(),
        phase: g.phase.get(),
      }
    })

    expect(result.error).toBeUndefined()
    expect(result.beforeResult, 'match result should be null before AI TH death').toBeNull()
    expect(result.afterResult, 'match result should be victory after AI TH dies').toBe('victory')
    expect(result.phase, 'phase should be game_over').toBe('game_over')
  })

  test('end-state HUD overlay becomes visible and stays stable', async ({ page }) => {
    await waitForGame(page)

    const result = await page.evaluate(() => {
      const g = (window as any).__war3Game

      // Pre-check: overlay should be hidden
      const overlay = document.getElementById('game-over-overlay')
      const textEl = document.getElementById('game-over-text')
      const beforeVisible = overlay ? overlay.style.display !== 'none' : null

      // Kill AI TH to trigger victory
      const aiTH = g.units.find((u: any) => u.team === 1 && u.type === 'townhall' && u.isBuilding)
      if (!aiTH) return { error: 'no AI townhall' }
      aiTH.hp = 0
      for (let i = 0; i < 10; i++) g.update(0.05)

      const afterVisible = overlay ? overlay.style.display !== 'none' : null
      const afterClass = overlay?.className ?? ''
      const afterText = textEl?.textContent ?? ''

      // Advance more frames to check stability
      for (let i = 0; i < 20; i++) g.update(0.05)

      const stableVisible = overlay ? overlay.style.display !== 'none' : null
      const stableText = textEl?.textContent ?? ''
      const stableClass = overlay?.className ?? ''

      return {
        beforeVisible,
        afterVisible,
        afterClass,
        afterText,
        stableVisible,
        stableText,
        stableClass,
      }
    })

    expect(result.error).toBeUndefined()
    expect(result.beforeVisible, 'overlay should be hidden before game over').toBeFalsy()
    expect(result.afterVisible, 'overlay should be visible after victory').toBe(true)
    expect(result.afterText, 'overlay text should say victory').toContain('胜利')
    expect(result.afterClass, 'overlay should have victory class').toContain('victory')
    // Stability: stays visible and text doesn't change
    expect(result.stableVisible, 'overlay should remain visible after more frames').toBe(true)
    expect(result.stableText, 'overlay text should stay stable').toBe(result.afterText)
    expect(result.stableClass, 'overlay class should stay stable').toBe(result.afterClass)
  })

  test('match loop stops advancing game time after terminal state', async ({ page }) => {
    await waitForGame(page)

    const result = await page.evaluate(() => {
      const g = (window as any).__war3Game

      // Kill AI TH
      const aiTH = g.units.find((u: any) => u.team === 1 && u.type === 'townhall' && u.isBuilding)
      if (!aiTH) return { error: 'no AI townhall' }
      aiTH.hp = 0
      for (let i = 0; i < 10; i++) g.update(0.05)

      // Record time at terminal state
      const timeAtTerminal = g.gameTime

      // Try to advance more
      for (let i = 0; i < 50; i++) g.update(0.05)

      const timeAfterAdvance = g.gameTime

      return {
        timeAtTerminal,
        timeAfterAdvance,
        timeFrozen: timeAfterAdvance === timeAtTerminal,
        phase: g.phase.get(),
      }
    })

    expect(result.error).toBeUndefined()
    expect(result.phase, 'phase should be game_over').toBe('game_over')
    expect(result.timeFrozen, 'game time should freeze after game over').toBe(true)
  })
})
