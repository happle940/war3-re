/**
 * Terminal Shell Reset Contract
 *
 * Deterministic runtime proof that terminal shells reset cleanly:
 *   1. a terminal state hides the pause shell and reflects result state
 *   2. results / overlay surfaces still match the terminal verdict
 *   3. loadMap() clears the terminal surfaces and returns the game to playing
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
    if (!canvas) return false
    const rect = canvas.getBoundingClientRect()
    if (rect.width === 0 || rect.height === 0) return false
    const game = (window as any).__war3Game
    if (!game) return false
    if (!Array.isArray(game.units) || game.units.length === 0) return false
    if (!game.renderer) return false
    return game.renderer.domElement.width > 0
  }, { timeout: 15000 })

  await page.waitForFunction(() => {
    const status = document.getElementById('map-status')?.textContent ?? ''
    return !status.includes('正在加载')
  }, { timeout: 15000 }).catch(() => {})

  await page.waitForTimeout(500)
}

async function createTerminalState(page: Page) {
  return page.evaluate(() => {
    const g = (window as any).__war3Game
    const stallAt = g.constructor.STALL_VERDICT_SECONDS as number
    g.gameTime = stallAt - 0.05
    g.update(0.1)

    const overlay = document.getElementById('game-over-overlay')
    const textEl = document.getElementById('game-over-text')
    const pauseShell = document.getElementById('pause-shell') as HTMLElement
    const resultsShell = document.getElementById('results-shell') as HTMLElement
    const resultsMessage = document.getElementById('results-shell-message')

    return {
      phase: g.phase.get(),
      result: g.getMatchResult(),
      pauseHidden: pauseShell.hidden,
      pauseAriaHidden: pauseShell.getAttribute('aria-hidden'),
      resultsHidden: resultsShell.hidden,
      resultsAriaHidden: resultsShell.getAttribute('aria-hidden'),
      overlayVisible: overlay ? overlay.style.display !== 'none' : null,
      overlayClass: overlay?.className ?? '',
      overlayText: textEl?.textContent ?? '',
      resultsText: resultsMessage?.textContent ?? '',
    }
  })
}

async function reloadMap(page: Page) {
  return page.evaluate(() => {
    const g = (window as any).__war3Game
    const w = 64
    const h = 64
    const tileCount = w * h
    const terrain = {
      width: w,
      height: h,
      tileset: 'A',
      centerOffsetX: 0,
      centerOffsetY: 0,
      groundHeight: new Float32Array(tileCount),
      waterLevel: new Float32Array(tileCount),
      groundType: new Uint8Array(tileCount),
      variation: new Uint8Array(tileCount),
      flags: new Uint8Array(tileCount),
      layerHeight: new Uint8Array(tileCount),
    }

    const mapData = {
      terrain,
      info: {
        mapWidth: w * 128,
        mapHeight: h * 128,
        playerCount: 2,
        players: [
          { id: 0, team: 0, startX: 1536, startY: 1536 },
          { id: 1, team: 1, startX: 5632, startY: 5632 },
        ],
      },
      unitPositions: [],
    }

    g.loadMap(mapData)

    const overlay = document.getElementById('game-over-overlay')
    const textEl = document.getElementById('game-over-text')
    const pauseShell = document.getElementById('pause-shell') as HTMLElement
    const resultsShell = document.getElementById('results-shell') as HTMLElement
    const resultsMessage = document.getElementById('results-shell-message')

    return {
      phase: g.phase.get(),
      result: g.getMatchResult(),
      pauseHidden: pauseShell.hidden,
      pauseAriaHidden: pauseShell.getAttribute('aria-hidden'),
      resultsHidden: resultsShell.hidden,
      resultsAriaHidden: resultsShell.getAttribute('aria-hidden'),
      overlayVisible: overlay ? overlay.style.display !== 'none' : null,
      overlayClass: overlay?.className ?? '',
      overlayText: textEl?.textContent ?? '',
      resultsText: resultsMessage?.textContent ?? '',
      unitCount: g.units.length,
      selectedCount: g.selectionModel.count,
    }
  })
}

test.describe('Terminal Shell Reset Contract', () => {
  test.setTimeout(60000)

  test('terminal state keeps pause shell hidden and reflects the result', async ({ page }) => {
    await waitForGame(page)

    const terminal = await createTerminalState(page)

    expect(terminal.phase, 'terminal state should use game_over').toBe('game_over')
    expect(terminal.result, 'terminal result should resolve to a verdict').toBe('stall')
    expect(terminal.pauseHidden, 'pause shell must stay hidden in terminal state').toBe(true)
    expect(terminal.pauseAriaHidden, 'pause shell must stay hidden in terminal state').toBe('true')
    expect(terminal.resultsHidden, 'results shell should be visible in terminal state').toBe(false)
    expect(terminal.resultsAriaHidden, 'results shell should be announced visible in terminal state').toBe('false')
    expect(terminal.overlayVisible, 'game-over overlay should be visible in terminal state').toBe(true)
    expect(terminal.overlayClass, 'game-over overlay should reflect the verdict').toContain('stall')
    expect(terminal.overlayText, 'game-over overlay text should reflect the verdict').toBe('僵局')
    expect(terminal.resultsText, 'results shell should mirror the verdict').toBe('僵局')
  })

  test('loadMap clears terminal overlays and returns to playing', async ({ page }) => {
    await waitForGame(page)

    const before = await createTerminalState(page)
    const after = await reloadMap(page)

    expect(before.result, 'precondition should establish a terminal verdict').toBe('stall')
    expect(before.resultsHidden, 'precondition should expose the results shell').toBe(false)
    expect(after.phase, 'loadMap should return the game to playing').toBe('playing')
    expect(after.result, 'loadMap should clear the terminal verdict').toBeNull()
    expect(after.pauseHidden, 'pause shell should be hidden after reload').toBe(true)
    expect(after.resultsHidden, 'results shell should be hidden after reload').toBe(true)
    expect(after.resultsAriaHidden, 'results shell should be announced hidden after reload').toBe('true')
    expect(after.overlayVisible, 'game-over overlay should be cleared after reload').toBe(false)
    expect(after.overlayClass, 'game-over overlay classes should be cleared after reload').toBe('')
    expect(after.overlayText, 'game-over overlay text should be cleared after reload').toBe('')
    expect(after.resultsText, 'results shell text should be cleared after reload').toBe('')
    expect(after.unitCount, 'reload should spawn a playable set of units').toBeGreaterThan(0)
    expect(after.selectedCount, 'reload should reset selection state').toBe(0)
  })
})
