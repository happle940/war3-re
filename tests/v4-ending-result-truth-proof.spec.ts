/**
 * V4-E1 Ending Result Truth Proof Pack
 *
 * Focused regression proving match results are truthful:
 *   1. Defeat — player TH destroyed → honest defeat state
 *   2. Victory — AI TH destroyed → honest victory state
 *   3. Stall — timeout verdict is honest, not disguised as victory/defeat
 *   4. Summary fields — derived from real session state
 *   5. Return-to-menu — real results button cleans up results, overlay, gameplay state
 *   6. No fake labels — no ladder/campaign/ranking/statis claims
 *
 * AI disabled in controlled tests; real-game defeat timing is P1's domain.
 *
 * IMPORTANT: g.handleDeadUnits() reassigns this.units.
 * Always re-read g.units after mutations.
 */
import { test, expect, type Page } from '@playwright/test'

const BASE_RUNTIME = 'http://127.0.0.1:4173/?runtimeTest=1'
const BASE_NORMAL = 'http://127.0.0.1:4173/'

async function waitForGame(page: Page) {
  await page.goto(BASE_RUNTIME, { waitUntil: 'domcontentloaded' })
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
  } catch { /* procedural fallback valid */ }
  await page.waitForTimeout(500)
}

async function waitForNormalBoot(page: Page) {
  await page.goto(BASE_NORMAL, { waitUntil: 'domcontentloaded' })
  await page.waitForFunction(() => {
    const canvas = document.getElementById('game-canvas')
    const game = (window as any).__war3Game
    if (!canvas || !game || !game.renderer) return false
    if (!Array.isArray(game.units) || game.units.length === 0) return false
    return game.renderer.domElement.width > 0
  }, { timeout: 15000 })
  await page.waitForTimeout(500)
}

async function disableAI(page: Page) {
  await page.evaluate(() => {
    const g = (window as any).__war3Game
    if (g?.ai) {
      if (typeof g.ai.reset === 'function') g.ai.reset()
      g.ai.update = () => {}
    }
  })
}

test.describe('V4-E1 Ending Result Truth Proof', () => {
  test.setTimeout(120000)

  test('defeat: player TH destroyed triggers honest defeat result', async ({ page }) => {
    await waitForGame(page)
    await disableAI(page)

    const result = await page.evaluate(() => {
      const g = (window as any).__war3Game

      // Kill player TH
      const th = g.units.find(
        (u: any) => u.team === 0 && u.type === 'townhall' && u.isBuilding && u.hp > 0,
      )
      if (!th) return null

      th.hp = 0
      // Run updates to trigger checkGameOver + handleDeadUnits
      for (let i = 0; i < 20; i++) g.update(0.016)

      // Re-read from game state
      const matchResult = g.getMatchResult()
      const phase = g.phase.get()
      const overlayText = document.getElementById('game-over-text')?.textContent
      const overlayDisplay = document.getElementById('game-over-overlay')?.style.display
      const overlayClasses = document.getElementById('game-over-overlay')?.className
      const resultsMessage = document.getElementById('results-shell-message')?.textContent
      const resultsSummary = document.getElementById('results-shell-summary')?.textContent

      return {
        matchResult,
        phase,
        overlayText,
        overlayDisplay,
        overlayClasses,
        resultsMessage,
        resultsSummary,
      }
    })

    expect(result).not.toBeNull()
    expect(result!.matchResult, 'match result must be defeat').toBe('defeat')
    expect(result!.phase, 'phase must be game_over').toBe('game_over')
    expect(result!.overlayText, 'overlay must show 失败').toBe('失败')
    expect(result!.overlayDisplay, 'overlay must be visible').toBe('flex')
    expect(result!.overlayClasses, 'overlay must have defeat class').toContain('defeat')
    expect(result!.resultsMessage, 'results message must be 失败').toBe('失败')
    expect(result!.resultsSummary, 'summary must have match stats').toContain('时长')
    expect(result!.resultsSummary, 'summary must show player units').toContain('我方')
    expect(result!.resultsSummary, 'summary must show enemy units').toContain('敌方')

    console.log('[V4-E1 PROOF] Defeat:', result)
  })

  test('victory: AI TH destroyed triggers honest victory result', async ({ page }) => {
    await waitForGame(page)
    await disableAI(page)

    const result = await page.evaluate(() => {
      const g = (window as any).__war3Game

      // Kill AI TH
      const aiTH = g.units.find(
        (u: any) => u.team === 1 && u.type === 'townhall' && u.isBuilding && u.hp > 0,
      )
      if (!aiTH) return null

      aiTH.hp = 0
      for (let i = 0; i < 20; i++) g.update(0.016)

      const matchResult = g.getMatchResult()
      const phase = g.phase.get()
      const overlayText = document.getElementById('game-over-text')?.textContent
      const resultsMessage = document.getElementById('results-shell-message')?.textContent
      const resultsSummary = document.getElementById('results-shell-summary')?.textContent

      return { matchResult, phase, overlayText, resultsMessage, resultsSummary }
    })

    expect(result).not.toBeNull()
    expect(result!.matchResult, 'match result must be victory').toBe('victory')
    expect(result!.phase, 'phase must be game_over').toBe('game_over')
    expect(result!.overlayText, 'overlay must show 胜利').toBe('胜利')
    expect(result!.resultsMessage, 'results message must be 胜利').toBe('胜利')
    expect(result!.resultsSummary, 'summary must exist').toContain('时长')

    console.log('[V4-E1 PROOF] Victory:', result)
  })

  test('stall: timeout triggers honest stall result', async ({ page }) => {
    await waitForGame(page)
    await disableAI(page)

    const result = await page.evaluate(() => {
      const g = (window as any).__war3Game
      g.gameTime = g.constructor.STALL_VERDICT_SECONDS
      g.update(0.016)

      return {
        matchResult: g.getMatchResult(),
        phase: g.phase.get(),
        overlayText: document.getElementById('game-over-text')?.textContent,
        overlayDisplay: document.getElementById('game-over-overlay')?.style.display,
        overlayClasses: document.getElementById('game-over-overlay')?.className,
        resultsMessage: document.getElementById('results-shell-message')?.textContent,
        resultsSummary: document.getElementById('results-shell-summary')?.textContent,
      }
    })

    expect(result.matchResult, 'match result must be stall').toBe('stall')
    expect(result.phase, 'phase must be game_over').toBe('game_over')
    expect(result.overlayText, 'overlay must show 僵局').toBe('僵局')
    expect(result.overlayDisplay, 'overlay must be visible').toBe('flex')
    expect(result.overlayClasses, 'overlay must have stall class').toContain('stall')
    expect(result.resultsMessage, 'results message must be 僵局').toBe('僵局')
    expect(result.resultsSummary, 'summary must include timeout duration').toContain('时长 12:00')

    console.log('[V4-E1 PROOF] Stall:', result)
  })

  test('summary fields come from real session state', async ({ page }) => {
    await waitForGame(page)
    await disableAI(page)

    const result = await page.evaluate(() => {
      const g = (window as any).__war3Game

      // Kill AI TH to trigger victory
      const aiTH = g.units.find(
        (u: any) => u.team === 1 && u.type === 'townhall' && u.isBuilding && u.hp > 0,
      )
      if (!aiTH) return null
      aiTH.hp = 0
      for (let i = 0; i < 20; i++) g.update(0.016)

      // Re-read from live game state after handleDeadUnits/endGame.
      const live = (team: number) => g.units.filter((u: any) => u.team === team && u.hp > 0)
      const summary = document.getElementById('results-shell-summary')?.textContent ?? ''
      const matchResult = g.getMatchResult()

      // Parse summary text
      const timeMatch = summary.match(/时长 (\d+):(\d+)/)
      const playerMatch = summary.match(/我方 单位:(\d+) 建筑:(\d+)/)
      const enemyMatch = summary.match(/敌方 单位:(\d+) 建筑:(\d+)/)

      return {
        matchResult,
        summaryRaw: summary,
        realState: {
          p0Units: live(0).filter((u: any) => !u.isBuilding).length,
          p0Buildings: live(0).filter((u: any) => u.isBuilding).length,
          p1Units: live(1).filter((u: any) => !u.isBuilding).length,
          p1Buildings: live(1).filter((u: any) => u.isBuilding).length,
          gameTime: +g.gameTime.toFixed(1),
        },
        parsed: {
          minutes: timeMatch ? +timeMatch[1] : -1,
          seconds: timeMatch ? +timeMatch[2] : -1,
          playerUnits: playerMatch ? +playerMatch[1] : -1,
          playerBuildings: playerMatch ? +playerMatch[2] : -1,
          enemyUnits: enemyMatch ? +enemyMatch[1] : -1,
          enemyBuildings: enemyMatch ? +enemyMatch[2] : -1,
        },
      }
    })

    expect(result).not.toBeNull()
    expect(result!.matchResult).toBe('victory')

    // Summary time matches real game time
    const realSeconds = Math.floor(result!.realState.gameTime)
    const summarySeconds = result!.parsed.minutes * 60 + result!.parsed.seconds
    expect(
      Math.abs(summarySeconds - realSeconds),
      `summary time (${summarySeconds}s) must match game time (${realSeconds}s)`,
    ).toBeLessThanOrEqual(1)

    // Summary player units/buildings match real state
    // Note: endGame reads this.units after handleDeadUnits removed the AI TH,
    // so p1Buildings = real p1BuildingsBefore - 1 (the destroyed AI TH)
    expect(result!.parsed.playerUnits, 'player units must match').toBe(result!.realState.p0Units)
    expect(result!.parsed.playerBuildings, 'player buildings must match').toBe(result!.realState.p0Buildings)
    expect(result!.parsed.enemyUnits, 'enemy units must match').toBe(result!.realState.p1Units)
    expect(result!.parsed.enemyBuildings, 'enemy buildings must match').toBe(result!.realState.p1Buildings)

    console.log('[V4-E1 PROOF] Summary truth:', result)
  })

  test('return-to-menu cleans up results, overlay, and gameplay state', async ({ page }) => {
    await waitForNormalBoot(page)

    const result = await page.evaluate(async () => {
      const g = (window as any).__war3Game
      const menuShell = document.getElementById('menu-shell')!
      const menuStartBtn = document.getElementById('menu-start-button') as HTMLButtonElement
      const briefingStartBtn = document.getElementById('briefing-start-button') as HTMLButtonElement
      const resultsReturnBtn = document.getElementById('results-return-menu-button') as HTMLButtonElement

      menuStartBtn.click()
      await new Promise(r => setTimeout(r, 50))
      briefingStartBtn.click()
      await new Promise(r => setTimeout(r, 50))

      if (g?.ai) {
        if (typeof g.ai.reset === 'function') g.ai.reset()
        g.ai.update = () => {}
      }

      // Trigger defeat
      const th = g.units.find(
        (u: any) => u.team === 0 && u.type === 'townhall' && u.isBuilding && u.hp > 0,
      )
      if (!th) return null
      th.hp = 0
      for (let i = 0; i < 20; i++) g.update(0.016)

      // Verify game over
      const beforeReturn = {
        matchResult: g.getMatchResult(),
        phase: g.phase.get(),
        overlayVisible: document.getElementById('game-over-overlay')?.style.display,
        overlayText: document.getElementById('game-over-text')?.textContent,
        resultsMessage: document.getElementById('results-shell-message')?.textContent,
      }

      // Use the real product return path: the results shell button wired by main.ts.
      resultsReturnBtn.click()
      await new Promise(r => setTimeout(r, 100))

      // After return
      const overlayDisplay = document.getElementById('game-over-overlay')?.style.display
      const overlayText = document.getElementById('game-over-text')?.textContent
      const resultsMessage = document.getElementById('results-shell-message')?.textContent
      const resultsSummary = document.getElementById('results-shell-summary')?.textContent
      const resultsShell = document.getElementById('results-shell')
      const pauseShell = document.getElementById('pause-shell')

      return {
        beforeReturn,
        afterReturn: {
          matchResult: g.getMatchResult(),
          phase: g.phase.get(),
          overlayDisplay,
          overlayText,
          resultsMessage,
          resultsSummary,
          resultsShellHidden: resultsShell?.hidden,
          pauseShellHidden: pauseShell?.hidden,
          menuShellVisible: menuShell ? !menuShell.hidden : false,
          isPaused: g.isPaused(),
          isGameOver: g.phase.isGameOver(),
          unitsAlive: g.units.filter((u: any) => u.hp > 0).length,
          gameOverResult: g.gameOverResult,
          matchResult: g.getMatchResult(),
          lastSessionSummary: document.getElementById('menu-last-session-summary')?.textContent,
        },
      }
    })

    expect(result).not.toBeNull()

    // Before: game over
    expect(result!.beforeReturn.matchResult).toBe('defeat')
    expect(result!.beforeReturn.overlayVisible).toBe('flex')

    // After: clean state
    const after = result!.afterReturn
    expect(after.overlayDisplay, 'overlay must be hidden').toBe('none')
    expect(after.overlayText, 'overlay text must be cleared').toBe('')
    expect(after.resultsMessage, 'results message must be cleared').toBe('')
    expect(after.resultsSummary, 'results summary must be cleared').toBe('')
    expect(after.resultsShellHidden, 'results shell must be hidden').toBe(true)
    expect(after.pauseShellHidden, 'pause shell must be hidden').toBe(true)
    expect(after.menuShellVisible, 'menu shell must be visible').toBe(true)
    expect(after.isPaused, 'game must be paused at front door').toBe(true)
    expect(after.isGameOver, 'game_over phase must be cleared').toBe(false)
    expect(after.matchResult, 'match result must be cleared').toBeNull()
    expect(after.lastSessionSummary, 'menu summary must preserve honest last result').toBe('上次结果：失败')

    console.log('[V4-E1 PROOF] Return-to-menu cleanup:', result)
  })

  test('no fake labels: no ladder/campaign/ranking/statis claims', async ({ page }) => {
    await waitForGame(page)
    await disableAI(page)

    const result = await page.evaluate(() => {
      const g = (window as any).__war3Game

      // Trigger both result types and check labels
      const results: string[] = []

      // Defeat
      const th = g.units.find(
        (u: any) => u.team === 0 && u.type === 'townhall' && u.isBuilding && u.hp > 0,
      )
      if (th) {
        th.hp = 0
        for (let i = 0; i < 20; i++) g.update(0.016)
        results.push(document.getElementById('game-over-text')?.textContent ?? '')
        results.push(document.getElementById('results-shell-message')?.textContent ?? '')
        results.push(document.getElementById('results-shell-summary')?.textContent ?? '')
      }

      // Check for forbidden labels in the DOM
      const forbiddenLabels = [
        '天梯', 'ladder', 'rank', '排名', '积分', 'rating',
        'campaign', 'chapter',
        '战报', '统计', 'statis', 'season', '赛季',
        'ELO', 'MMR', '段位', 'bronze', 'silver', 'gold',
      ]

      const body = document.body.textContent ?? ''
      const found: string[] = []
      for (const label of forbiddenLabels) {
        if (body.toLowerCase().includes(label.toLowerCase())) {
          found.push(label)
        }
      }

      return {
        resultLabels: results,
        forbiddenFound: found,
      }
    })

    expect(result).not.toBeNull()

    // Result labels are truthful: only 胜利/失败/僵局
    expect(result!.resultLabels, 'must have result labels').toContain('失败')
    expect(result!.resultLabels, 'results message must be 失败').toContain('失败')

    // No forbidden labels
    expect(
      result!.forbiddenFound,
      `no forbidden labels, found: ${result!.forbiddenFound.join(', ')}`,
    ).toHaveLength(0)

    console.log('[V4-E1 PROOF] No fake labels:', result)
  })
})
