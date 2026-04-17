/**
 * V8 Demo Path Smoke Pack
 *
 * Proves that a normal visitor can open the demo, start a session,
 * return/restart from pause/results, and see scope coverage info.
 * This is an external path smoke — not content, AI, or asset expansion.
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

test.describe('V8 Demo Path Smoke', () => {
  test.setTimeout(120000)

  test('entry page is not blank and game initializes', async ({ page }) => {
    await waitForBoot(page)

    const state = await page.evaluate(() => {
      const canvas = document.getElementById('game-canvas')!
      const menuShell = document.getElementById('menu-shell')!
      const game = (window as any).__war3Game
      const rect = canvas.getBoundingClientRect()

      return {
        canvasWidth: rect.width,
        canvasHeight: rect.height,
        menuVisible: !menuShell.hidden,
        hasGame: !!game,
        hasUnits: Array.isArray(game.units) && game.units.length > 0,
        hasRenderer: !!game.renderer,
        mapStatus: document.getElementById('map-status')?.textContent ?? '',
      }
    })

    expect(state.canvasWidth, 'canvas must have width').toBeGreaterThan(0)
    expect(state.canvasHeight, 'canvas must have height').toBeGreaterThan(0)
    expect(state.hasGame, 'game instance must exist').toBe(true)
    expect(state.hasUnits, 'game must have units').toBe(true)
    expect(state.hasRenderer, 'game must have renderer').toBe(true)
    expect(state.menuVisible, 'menu shell must be visible on normal boot').toBe(true)
    expect(state.mapStatus, 'map status must be non-empty').toBeTruthy()
  })

  test('user can start a playable demo session', async ({ page }) => {
    await waitForBoot(page)

    const result = await page.evaluate(async () => {
      const g = (window as any).__war3Game
      const menuShell = document.getElementById('menu-shell')!
      const briefingShell = document.getElementById('briefing-shell')!
      const menuStartBtn = document.getElementById('menu-start-button') as HTMLButtonElement
      const briefingStartBtn = document.getElementById('briefing-start-button') as HTMLButtonElement

      // Step 1: click menu start → briefing
      menuStartBtn.click()
      await new Promise(r => setTimeout(r, 50))

      const briefingVisible = !briefingShell.hidden
      const menuHiddenAfterStart = menuShell.hidden

      // Step 2: click briefing start → gameplay
      briefingStartBtn.click()
      await new Promise(r => setTimeout(r, 50))

      const isPlaying = g.phase.isPlaying()
      const isPaused = g.isPaused()
      const briefingHidden = briefingShell.hidden
      const menuHiddenAfterPlay = menuShell.hidden
      const units = g.units
      const playerWorkers = units.filter(
        (u: any) => u.team === 0 && u.type === 'worker' && !u.isBuilding && u.hp > 0,
      )
      const playerTH = units.filter(
        (u: any) => u.team === 0 && u.type === 'townhall' && u.isBuilding && u.hp > 0,
      )
      const goldmine = units.filter(
        (u: any) => u.type === 'goldmine' && u.hp > 0,
      )

      return {
        briefingVisible,
        menuHiddenAfterStart,
        isPlaying,
        isPaused,
        briefingHidden,
        menuHiddenAfterPlay,
        playerWorkers: playerWorkers.length,
        playerTH: playerTH.length,
        goldmine: goldmine.length,
      }
    })

    // Briefing appeared after menu start
    expect(result.briefingVisible, 'briefing must appear after menu start').toBe(true)
    expect(result.menuHiddenAfterStart, 'menu must hide after start').toBe(true)

    // Game is playing after briefing start
    expect(result.isPlaying, 'game must be playing after briefing start').toBe(true)
    expect(result.isPaused, 'game must not be paused after briefing start').toBe(false)
    expect(result.briefingHidden, 'briefing must hide after play').toBe(true)
    expect(result.menuHiddenAfterPlay, 'menu must stay hidden during play').toBe(true)

    // Playable content exists
    expect(result.playerWorkers, 'must have player workers').toBeGreaterThanOrEqual(3)
    expect(result.playerTH, 'must have player townhall').toBeGreaterThanOrEqual(1)
    expect(result.goldmine, 'must have goldmine').toBeGreaterThanOrEqual(1)
  })

  test('user can return to menu from pause and restart', async ({ page }) => {
    await waitForBoot(page)

    const result = await page.evaluate(async () => {
      const g = (window as any).__war3Game
      const menuShell = document.getElementById('menu-shell')!
      const pauseShell = document.getElementById('pause-shell')!
      const menuStartBtn = document.getElementById('menu-start-button') as HTMLButtonElement
      const briefingStartBtn = document.getElementById('briefing-start-button') as HTMLButtonElement
      const pauseReturnBtn = document.getElementById('pause-return-menu-button') as HTMLButtonElement

      // Start session: menu → briefing → play
      menuStartBtn.click()
      await new Promise(r => setTimeout(r, 50))
      briefingStartBtn.click()
      await new Promise(r => setTimeout(r, 50))

      // Pause
      g.pauseGame()
      await new Promise(r => setTimeout(r, 50))

      const pauseVisible = !pauseShell.hidden

      // Return to menu via button
      pauseReturnBtn.click()
      await new Promise(r => setTimeout(r, 100))

      const menuVisibleAfterReturn = !menuShell.hidden
      const pauseHiddenAfterReturn = pauseShell.hidden
      const isPausedAfterReturn = g.isPaused()

      // Restart: menu → briefing → play again
      menuStartBtn.click()
      await new Promise(r => setTimeout(r, 50))
      briefingStartBtn.click()
      await new Promise(r => setTimeout(r, 50))

      const isPlayingAfterRestart = g.phase.isPlaying()
      const menuHiddenAfterRestart = menuShell.hidden

      return {
        pauseVisible,
        menuVisibleAfterReturn,
        pauseHiddenAfterReturn,
        isPausedAfterReturn,
        isPlayingAfterRestart,
        menuHiddenAfterRestart,
      }
    })

    // Pause appeared
    expect(result.pauseVisible, 'pause shell must appear').toBe(true)

    // Return to menu worked
    expect(result.menuVisibleAfterReturn, 'menu must appear after return').toBe(true)
    expect(result.pauseHiddenAfterReturn, 'pause must hide after return').toBe(true)
    expect(result.isPausedAfterReturn, 'game must be paused at menu').toBe(true)

    // Restart worked
    expect(result.isPlayingAfterRestart, 'game must be playing after restart').toBe(true)
    expect(result.menuHiddenAfterRestart, 'menu must hide after restart').toBe(true)
  })

  test('user can return to menu from results shell', async ({ page }) => {
    await waitForBoot(page)

    const result = await page.evaluate(async () => {
      const g = (window as any).__war3Game
      const menuShell = document.getElementById('menu-shell')!
      const resultsShell = document.getElementById('results-shell')!
      const menuStartBtn = document.getElementById('menu-start-button') as HTMLButtonElement
      const briefingStartBtn = document.getElementById('briefing-start-button') as HTMLButtonElement
      const resultsReturnBtn = document.getElementById('results-return-menu-button') as HTMLButtonElement

      // Start session
      menuStartBtn.click()
      await new Promise(r => setTimeout(r, 50))
      briefingStartBtn.click()
      await new Promise(r => setTimeout(r, 50))

      // Trigger victory by killing AI townhall
      const aiTH = g.units.find((u: any) => u.team === 1 && u.type === 'townhall')
      if (!aiTH) return { error: 'no AI townhall' }
      aiTH.hp = 0
      g.update(0.016)
      await new Promise(r => setTimeout(r, 50))

      const resultsVisible = !resultsShell.hidden
      const resultsMessage = document.getElementById('results-shell-message')?.textContent ?? ''

      // Return to menu from results
      resultsReturnBtn.click()
      await new Promise(r => setTimeout(r, 100))

      const menuVisibleAfterReturn = !menuShell.hidden
      const resultsHiddenAfterReturn = resultsShell.hidden
      const isPausedAfterReturn = g.isPaused()

      return {
        resultsVisible,
        resultsMessage,
        menuVisibleAfterReturn,
        resultsHiddenAfterReturn,
        isPausedAfterReturn,
      }
    })

    expect(result.error).toBeUndefined()
    expect(result.resultsVisible, 'results shell must appear after victory').toBe(true)
    expect(result.resultsMessage, 'results must have a message').toBeTruthy()
    expect(result.menuVisibleAfterReturn, 'menu must appear after results return').toBe(true)
    expect(result.resultsHiddenAfterReturn, 'results must hide after return').toBe(true)
    expect(result.isPausedAfterReturn, 'game must be paused at menu').toBe(true)
  })

  test('scope notice is visible and readable on entry', async ({ page }) => {
    await waitForBoot(page)

    const result = await page.evaluate(() => {
      const scopeNotice = document.getElementById('menu-scope-notice')
      if (!scopeNotice) return { exists: false }

      const paragraphs = scopeNotice.querySelectorAll('p')
      const text = scopeNotice.textContent ?? ''
      const rect = scopeNotice.getBoundingClientRect()

      return {
        exists: true,
        visible: rect.width > 0 && rect.height > 0,
        paragraphCount: paragraphs.length,
        hasPlayable: text.includes('可玩'),
        hasNotImplemented: text.includes('尚未') || text.includes('未实现'),
        hasFeedback: text.includes('反馈'),
        hasFeedbackRoute: text.includes('Issue') && text.includes('维护者') && text.includes('复现步骤'),
        hasShortSlice: text.includes('短局切片'),
        hasMissingLongScope: text.includes('完整科技树') && text.includes('战役') && text.includes('多人'),
        hasNoCompleteWar3Boundary: text.includes('不是完整 War3'),
        hasNoPublicReleaseBoundary: text.includes('不是公开发布'),
        fullText: text,
      }
    })

    expect(result.exists, 'scope notice element must exist').toBe(true)
    expect(result.visible, 'scope notice must be visible').toBe(true)
    expect(result.paragraphCount, 'scope notice must have content paragraphs').toBeGreaterThanOrEqual(2)
    expect(result.hasPlayable, 'scope notice must mention playable content').toBe(true)
    expect(result.hasNotImplemented, 'scope notice must mention not-implemented features').toBe(true)
    expect(result.hasFeedback, 'scope notice must mention feedback path').toBe(true)
    expect(result.hasFeedbackRoute, 'scope notice must explain where structured feedback goes').toBe(true)
    expect(result.hasShortSlice, 'scope notice must frame current play as a short slice').toBe(true)
    expect(result.hasMissingLongScope, 'scope notice must name major missing long-scope systems').toBe(true)
    expect(result.hasNoCompleteWar3Boundary, 'scope notice must reject complete War3 framing').toBe(true)
    expect(result.hasNoPublicReleaseBoundary, 'scope notice must reject public release framing').toBe(true)
  })
})
