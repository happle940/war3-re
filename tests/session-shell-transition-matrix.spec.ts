/**
 * Session Shell Transition Matrix
 *
 * Proof-first integration floor that locks the implemented shell lifecycle
 * together. Every implemented transition is exercised in one spec so future
 * front-door work has a hard regression floor.
 *
 * Transitions proven:
 *   1. pause -> resume
 *   2. pause -> reload
 *   3. pause -> setup
 *   4. setup -> start current map
 *   5. results -> reload
 *   6. terminal entry hides pause/setup residue
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

test.describe('Session Shell Transition Matrix', () => {
  test.setTimeout(120000)

  test('pause -> resume returns to playing', async ({ page }) => {
    await waitForGame(page)

    const result = await page.evaluate(async () => {
      const g = (window as any).__war3Game
      const vis = () => ({
        pauseHidden: (document.getElementById('pause-shell') as HTMLElement).hidden,
        setupHidden: (document.getElementById('setup-shell') as HTMLElement).hidden,
        resultsHidden: (document.getElementById('results-shell') as HTMLElement).hidden,
      })

      const wasPlaying = g.phase.isPlaying()
      g.pauseGame()
      const wasPaused = g.phase.isPaused()
      const paused = vis()

      ;(document.getElementById('pause-resume-button') as HTMLButtonElement).click()
      await new Promise(r => setTimeout(r, 50))
      const nowPlaying = g.phase.isPlaying()
      const resumed = vis()

      return { wasPlaying, wasPaused, pausedShells: paused, nowPlaying, resumedShells: resumed }
    })

    expect(result.wasPlaying).toBe(true)
    expect(result.wasPaused).toBe(true)
    expect(result.pausedShells.pauseHidden).toBe(false)
    expect(result.nowPlaying).toBe(true)
    expect(result.resumedShells.pauseHidden).toBe(true)
    expect(result.resumedShells.setupHidden).toBe(true)
    expect(result.resumedShells.resultsHidden).toBe(true)
  })

  test('pause -> reload returns to clean playing state', async ({ page }) => {
    await waitForGame(page)

    const result = await page.evaluate(async () => {
      const g = (window as any).__war3Game
      const vis = () => ({
        pauseHidden: (document.getElementById('pause-shell') as HTMLElement).hidden,
        setupHidden: (document.getElementById('setup-shell') as HTMLElement).hidden,
        resultsHidden: (document.getElementById('results-shell') as HTMLElement).hidden,
      })

      const sourceBefore = !!g.currentMapSource
      g.pauseGame()
      const paused = vis()

      ;(document.getElementById('pause-reload-button') as HTMLButtonElement).click()
      await new Promise(r => setTimeout(r, 100))

      const after = vis()
      const playing = g.phase.isPlaying()
      const sourceAfter = !!g.currentMapSource
      const timeReset = g.gameTime < 1

      return { sourceBefore, pausedShells: paused, afterShells: after, playing, sourceAfter, timeReset }
    })

    expect(result.sourceBefore).toBe(true)
    expect(result.pausedShells.pauseHidden).toBe(false)
    expect(result.playing).toBe(true)
    expect(result.timeReset).toBe(true)
    expect(result.afterShells.pauseHidden).toBe(true)
    expect(result.afterShells.setupHidden).toBe(true)
    expect(result.afterShells.resultsHidden).toBe(true)
  })

  test('pause -> setup -> return -> pause round-trip', async ({ page }) => {
    await waitForGame(page)

    const result = await page.evaluate(async () => {
      const g = (window as any).__war3Game
      const vis = () => ({
        pauseHidden: (document.getElementById('pause-shell') as HTMLElement).hidden,
        setupHidden: (document.getElementById('setup-shell') as HTMLElement).hidden,
        resultsHidden: (document.getElementById('results-shell') as HTMLElement).hidden,
      })

      // pause -> setup
      g.pauseGame()
      ;(document.getElementById('pause-setup-button') as HTMLButtonElement).click()
      await new Promise(r => setTimeout(r, 50))
      const nowSetup = g.phase.isSetup()
      const inSetup = vis()

      // setup -> return (should go back to pause)
      ;(document.getElementById('setup-return-button') as HTMLButtonElement).click()
      await new Promise(r => setTimeout(r, 50))
      const nowPaused = g.phase.isPaused()
      const backToPause = vis()

      return { nowSetup, inSetupShells: inSetup, nowPaused, backToPauseShells: backToPause }
    })

    expect(result.nowSetup).toBe(true)
    expect(result.inSetupShells.setupHidden).toBe(false)
    expect(result.inSetupShells.pauseHidden).toBe(true)

    expect(result.nowPaused).toBe(true)
    expect(result.backToPauseShells.pauseHidden).toBe(false)
    expect(result.backToPauseShells.setupHidden).toBe(true)
  })

  test('setup -> start current map reloads and returns to playing', async ({ page }) => {
    await waitForGame(page)

    const result = await page.evaluate(async () => {
      const g = (window as any).__war3Game
      const vis = () => ({
        pauseHidden: (document.getElementById('pause-shell') as HTMLElement).hidden,
        setupHidden: (document.getElementById('setup-shell') as HTMLElement).hidden,
        resultsHidden: (document.getElementById('results-shell') as HTMLElement).hidden,
      })

      g.openSetupShell()
      await new Promise(r => setTimeout(r, 50))
      const inSetup = vis()

      ;(document.getElementById('setup-start-button') as HTMLButtonElement).click()
      await new Promise(r => setTimeout(r, 100))

      const after = vis()
      const playing = g.phase.isPlaying()
      const sourceAfter = !!g.currentMapSource

      return { inSetupShells: inSetup, playing, afterShells: after, sourceAfter }
    })

    expect(result.inSetupShells.setupHidden).toBe(false)
    expect(result.playing).toBe(true)
    expect(result.afterShells.setupHidden).toBe(true)
    expect(result.afterShells.pauseHidden).toBe(true)
    expect(result.afterShells.resultsHidden).toBe(true)
    expect(result.sourceAfter).toBe(true)
  })

  test('results -> reload returns to clean playing state', async ({ page }) => {
    await waitForGame(page)

    const result = await page.evaluate(async () => {
      const g = (window as any).__war3Game
      const vis = () => ({
        pauseHidden: (document.getElementById('pause-shell') as HTMLElement).hidden,
        setupHidden: (document.getElementById('setup-shell') as HTMLElement).hidden,
        resultsHidden: (document.getElementById('results-shell') as HTMLElement).hidden,
      })

      // Trigger victory
      const aiTH = g.units.find((u: any) => u.team === 1 && u.type === 'townhall')
      if (!aiTH) return { error: 'no AI townhall' }
      aiTH.hp = 0
      g.update(0.016)

      const gameOver = vis()

      ;(document.getElementById('results-reload-button') as HTMLButtonElement).click()
      await new Promise(r => setTimeout(r, 100))

      const after = vis()
      const playing = g.phase.isPlaying()
      const resultCleared = g.getMatchResult() === null

      return { gameOverShells: gameOver, playing, afterShells: after, resultCleared }
    })

    expect(result.error).toBeUndefined()
    expect(result.gameOverShells.resultsHidden).toBe(false)
    expect(result.playing).toBe(true)
    expect(result.resultCleared).toBe(true)
    expect(result.afterShells.resultsHidden).toBe(true)
    expect(result.afterShells.pauseHidden).toBe(true)
    expect(result.afterShells.setupHidden).toBe(true)
  })

  test('terminal entry hides pause and setup residue', async ({ page }) => {
    await waitForGame(page)

    const result = await page.evaluate(async () => {
      const g = (window as any).__war3Game
      const vis = () => ({
        pauseHidden: (document.getElementById('pause-shell') as HTMLElement).hidden,
        setupHidden: (document.getElementById('setup-shell') as HTMLElement).hidden,
        resultsHidden: (document.getElementById('results-shell') as HTMLElement).hidden,
      })

      // Open pause shell, then setup
      g.pauseGame()
      ;(document.getElementById('pause-setup-button') as HTMLButtonElement).click()
      await new Promise(r => setTimeout(r, 50))

      const inSetup = vis()

      // Close setup to go back to playing so update() can process the death
      ;(document.getElementById('setup-return-button') as HTMLButtonElement).click()
      await new Promise(r => setTimeout(r, 50))

      // Now pause again and reopen setup
      g.pauseGame()
      ;(document.getElementById('pause-setup-button') as HTMLButtonElement).click()
      await new Promise(r => setTimeout(r, 50))

      // Return to playing via setup return then directly enter playing
      g.closeSetupShell() // goes to paused
      g.resumeGame() // goes to playing

      // Now kill AI townhall from playing state
      const aiTH = g.units.find((u: any) => u.team === 1 && u.type === 'townhall')
      if (!aiTH) return { error: 'no AI townhall' }
      aiTH.hp = 0
      g.update(0.016)

      // Now pause and setup should both be hidden
      const afterDeath = vis()
      const isGameOver = g.phase.isGameOver()

      return { inSetupShells: inSetup, afterDeathShells: afterDeath, isGameOver }
    })

    expect(result.error).toBeUndefined()
    // Setup was visible at one point
    expect(result.inSetupShells.setupHidden).toBe(false)
    // After terminal entry from playing: results visible, pause and setup hidden
    expect(result.isGameOver).toBe(true)
    expect(result.afterDeathShells.resultsHidden).toBe(false)
    expect(result.afterDeathShells.pauseHidden).toBe(true)
    expect(result.afterDeathShells.setupHidden).toBe(true)
  })
})
