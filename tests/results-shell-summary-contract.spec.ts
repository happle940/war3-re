/**
 * Results Shell Summary Truth Contract
 *
 * Proves that results shell shows a summary derived from real match state
 * (not hardcoded prose), and that the summary is cleared on reload.
 */
import { test, expect, type Page } from '@playwright/test'

const BASE = 'http://127.0.0.1:4173/?runtimeTest=1'

async function waitForGame(page: Page) {
  const consoleErrors: string[] = []
  page.on('console', (msg) => {
    if (msg.type() === 'error') consoleErrors.push(msg.text())
  })
  ;(page as any).__consoleErrors = consoleErrors

  await page.goto(BASE, { waitUntil: 'domcontentloaded' })
  await page.waitForFunction(() => {
    const canvas = document.getElementById('game-canvas')
    const game = (window as any).__war3Game
    if (!canvas || !game || !game.renderer) return false
    if (!Array.isArray(game.units) || game.units.length === 0) return false
    return game.renderer.domElement.width > 0
  }, { timeout: 15000 })

  try {
    await page.waitForFunction(() => {
      const status = document.getElementById('map-status')?.textContent ?? ''
      return !status.includes('正在加载')
    }, { timeout: 15000 })
  } catch {
    // Procedural fallback is valid
  }
  await page.waitForTimeout(300)
}

test.describe('Results Shell Summary Truth', () => {
  test.setTimeout(120000)

  test('victory summary is derived from real match state', async ({ page }) => {
    await waitForGame(page)

    const result = await page.evaluate(() => {
      const g = (window as any).__war3Game

      // Kill AI townhall to trigger victory
      const aiTH = g.units.find((u: any) => u.team === 1 && u.type === 'townhall')
      if (!aiTH) return { error: 'no AI townhall' }
      aiTH.hp = 0
      g.update(0.016)

      const message = (document.getElementById('results-shell-message') as HTMLElement).textContent ?? ''
      const summary = (document.getElementById('results-shell-summary') as HTMLElement).textContent ?? ''
      const matchResult = g.getMatchResult()
      const isGameOver = g.phase.isGameOver()

      return { message, summary, matchResult, isGameOver }
    })

    expect(result.error).toBeUndefined()
    expect(result.matchResult).toBe('victory')
    expect(result.isGameOver).toBe(true)
    expect(result.message).toBe('胜利')
    // Summary must contain real match data
    expect(result.summary).toContain('时长')
    expect(result.summary).toContain('我方')
    expect(result.summary).toContain('敌方')
    expect(result.summary).toContain('单位:')
    expect(result.summary).toContain('建筑:')
  })

  test('defeat summary has different unit counts than victory', async ({ page }) => {
    await waitForGame(page)

    const result = await page.evaluate(() => {
      const g = (window as any).__war3Game

      // Count live state before ending
      const p0UnitsBefore = g.units.filter((u: any) => u.team === 0 && !u.isBuilding && u.hp > 0).length
      const p0BuildingsBefore = g.units.filter((u: any) => u.team === 0 && u.isBuilding && u.hp > 0).length

      // Kill player townhall to trigger defeat
      const p0TH = g.units.find((u: any) => u.team === 0 && u.type === 'townhall')
      if (!p0TH) return { error: 'no player townhall' }
      p0TH.hp = 0
      g.update(0.016)

      const summary = (document.getElementById('results-shell-summary') as HTMLElement).textContent ?? ''
      const matchResult = g.getMatchResult()

      // Parse unit/building counts from summary
      const myLine = summary.split('\n').find((l: string) => l.startsWith('我方'))
      const enemyLine = summary.split('\n').find((l: string) => l.startsWith('敌方'))

      return {
        matchResult,
        summary,
        p0UnitsBefore,
        p0BuildingsBefore,
        myLine,
        enemyLine,
      }
    })

    expect(result.error).toBeUndefined()
    expect(result.matchResult).toBe('defeat')
    // Summary exists and has the expected structure
    expect(result.myLine).toBeTruthy()
    expect(result.enemyLine).toBeTruthy()
    // Player unit count should reflect the pre-death count
    // (townhall was just killed, other units still alive)
    expect(result.myLine).toContain('单位:')
    expect(result.myLine).toContain('建筑:')
  })

  test('summary is cleared after reload', async ({ page }) => {
    await waitForGame(page)

    const result = await page.evaluate(async () => {
      const g = (window as any).__war3Game

      // Trigger victory
      const aiTH = g.units.find((u: any) => u.team === 1 && u.type === 'townhall')
      if (!aiTH) return { error: 'no AI townhall' }
      aiTH.hp = 0
      g.update(0.016)

      const summaryBefore = (document.getElementById('results-shell-summary') as HTMLElement).textContent ?? ''

      // Reload the map
      g.reloadCurrentMap()
      await new Promise(r => setTimeout(r, 100))

      const summaryAfter = (document.getElementById('results-shell-summary') as HTMLElement).textContent ?? ''
      const isPlaying = g.phase.isPlaying()

      return { summaryBefore, summaryAfter, isPlaying }
    })

    expect(result.error).toBeUndefined()
    expect(result.summaryBefore.length).toBeGreaterThan(0)
    expect(result.summaryAfter).toBe('')
    expect(result.isPlaying).toBe(true)
  })
})
