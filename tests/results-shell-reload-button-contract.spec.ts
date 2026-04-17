/**
 * Results Shell Reload Button Contract
 *
 * Deterministic runtime proof that the results-shell action button is wired to
 * the real current-map reload seam:
 *   1. loadMap(syntheticMap) establishes a cached current source
 *   2. terminal state exposes the reload button in results shell
 *   3. clicking the button returns to playing through reloadCurrentMap()
 *   4. terminal surfaces clear and the map signature stays the same
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

test.describe('Results Shell Reload Button Contract', () => {
  test.setTimeout(60000)

  test('results-shell reload button is enabled on the procedural path', async ({ page }) => {
    await waitForGame(page)

    const state = await page.evaluate(() => {
      const g = (window as any).__war3Game
      const stallAt = g.constructor.STALL_VERDICT_SECONDS as number
      g.gameTime = stallAt - 0.05
      g.update(0.1)

      const resultsShell = document.getElementById('results-shell') as HTMLElement
      const reloadButton = document.getElementById('results-reload-button') as HTMLButtonElement

      return {
        phase: g.phase.get(),
        result: g.getMatchResult(),
        resultsHidden: resultsShell.hidden,
        buttonDisabled: reloadButton.disabled,
      }
    })

    expect(state.phase, 'terminal state should still use game_over').toBe('game_over')
    expect(state.result, 'procedural runtime path should still resolve a stall verdict').toBe('stall')
    expect(state.resultsHidden, 'results shell should be visible in terminal state').toBe(false)
    expect(state.buttonDisabled, 'reload button should be enabled on the procedural path').toBe(false)
  })

  test('results-shell button reloads the cached current map source', async ({ page }) => {
    await waitForGame(page)

    const loadSignature = await page.evaluate(() => {
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

      return {
        mapWidth: g.terrain.width,
        mapHeight: g.terrain.height,
        unitsLength: g.units.length,
        gold: g.resources.get(0).gold,
        lumber: g.resources.get(0).lumber,
        townhallCount: g.units.filter((u: any) => u.type === 'townhall').length,
      }
    })

    expect(loadSignature.mapWidth, 'synthetic map width should be cached').toBe(64)
    expect(loadSignature.mapHeight, 'synthetic map height should be cached').toBe(64)
    expect(loadSignature.unitsLength, 'synthetic map should create a playable unit set').toBeGreaterThan(0)
    expect(loadSignature.townhallCount, 'synthetic map should create both townhalls').toBe(2)
    expect(loadSignature.gold, 'synthetic map should initialize gold').toBe(500)
    expect(loadSignature.lumber, 'synthetic map should initialize lumber').toBe(200)

    const terminalState = await page.evaluate(() => {
      const g = (window as any).__war3Game
      const stallAt = g.constructor.STALL_VERDICT_SECONDS as number
      g.gameTime = stallAt - 0.05
      g.update(0.1)

      const overlay = document.getElementById('game-over-overlay')
      const resultsShell = document.getElementById('results-shell') as HTMLElement
      const reloadButton = document.getElementById('results-reload-button') as HTMLButtonElement

      return {
        phase: g.phase.get(),
        result: g.getMatchResult(),
        resultsHidden: resultsShell.hidden,
        resultsAriaHidden: resultsShell.getAttribute('aria-hidden'),
        buttonDisabled: reloadButton.disabled,
        buttonText: reloadButton.textContent ?? '',
        overlayVisible: overlay ? overlay.style.display !== 'none' : null,
      }
    })

    expect(terminalState.phase, 'terminal state should use game_over').toBe('game_over')
    expect(terminalState.result, 'terminal state should be stall').toBe('stall')
    expect(terminalState.resultsHidden, 'results shell should be visible in terminal state').toBe(false)
    expect(terminalState.resultsAriaHidden, 'results shell should be announced visible').toBe('false')
    expect(terminalState.buttonDisabled, 'reload button should be enabled when a current source exists').toBe(false)
    expect(terminalState.buttonText, 'reload button label should be explicit').toBe('重新加载当前地图')
    expect(terminalState.overlayVisible, 'game-over overlay should be visible in terminal state').toBe(true)

    await page.locator('#results-reload-button').click()

    const after = await page.evaluate(() => {
      const g = (window as any).__war3Game
      const overlay = document.getElementById('game-over-overlay')
      const resultsShell = document.getElementById('results-shell') as HTMLElement
      const resultsMessage = document.getElementById('results-shell-message')
      const res0 = g.resources.get(0)
      return {
        phase: g.phase.get(),
        result: g.getMatchResult(),
        mapWidth: g.terrain.width,
        mapHeight: g.terrain.height,
        unitsLength: g.units.length,
        gold: res0.gold,
        lumber: res0.lumber,
        pauseHidden: (document.getElementById('pause-shell') as HTMLElement).hidden,
        resultsHidden: resultsShell.hidden,
        overlayVisible: overlay ? overlay.style.display !== 'none' : null,
        overlayClass: overlay?.className ?? '',
        overlayText: document.getElementById('game-over-text')?.textContent ?? '',
        resultsText: resultsMessage?.textContent ?? '',
      }
    })

    expect(after.phase, 'button click should return the game to playing').toBe('playing')
    expect(after.result, 'button click should clear the terminal verdict').toBeNull()
    expect(after.mapWidth, 'button click should preserve the cached map width').toBe(loadSignature.mapWidth)
    expect(after.mapHeight, 'button click should preserve the cached map height').toBe(loadSignature.mapHeight)
    expect(after.unitsLength, 'button click should preserve the playable unit set size').toBe(loadSignature.unitsLength)
    expect(after.gold, 'button click should preserve the initial gold value').toBe(loadSignature.gold)
    expect(after.lumber, 'button click should preserve the initial lumber value').toBe(loadSignature.lumber)
    expect(after.pauseHidden, 'pause shell should stay hidden after reload').toBe(true)
    expect(after.resultsHidden, 'results shell should hide after reload').toBe(true)
    expect(after.overlayVisible, 'game-over overlay should clear after reload').toBe(false)
    expect(after.overlayClass, 'game-over overlay classes should clear after reload').toBe('')
    expect(after.overlayText, 'game-over overlay text should clear after reload').toBe('')
    expect(after.resultsText, 'results shell text should clear after reload').toBe('')
  })
})
