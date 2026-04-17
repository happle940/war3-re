/**
 * Current Map Reload Seam Contract
 *
 * Deterministic runtime proof that the current parsed map source can be replayed:
 *   1. loadMap(syntheticMap) caches a current source
 *   2. terminal state still reflects the active verdict
 *   3. reloadCurrentMap() returns the game to playing through the real loadMap path
 *   4. the reloaded map signature matches the same source
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

test.describe('Current Map Reload Seam Contract', () => {
  test.setTimeout(60000)

  test('reloadCurrentMap replays the cached parsed map source and clears terminal surfaces', async ({ page }) => {
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

      const res0 = g.resources.get(0)
      const townhalls = g.units.filter((u: any) => u.type === 'townhall')

      return {
        mapWidth: g.terrain.width,
        mapHeight: g.terrain.height,
        unitsLength: g.units.length,
        gold: res0.gold,
        lumber: res0.lumber,
        townhallCount: townhalls.length,
        result: g.getMatchResult(),
        phase: g.phase.get(),
      }
    })

    expect(loadSignature.phase, 'loadMap should finish in playing').toBe('playing')
    expect(loadSignature.result, 'loadMap should clear any terminal verdict').toBeNull()
    expect(loadSignature.mapWidth, 'loaded map width should match the cached source').toBe(64)
    expect(loadSignature.mapHeight, 'loaded map height should match the cached source').toBe(64)
    expect(loadSignature.unitsLength, 'loaded map should create a playable unit set').toBeGreaterThan(0)
    expect(loadSignature.townhallCount, 'loaded map should keep both townhalls present').toBe(2)
    expect(loadSignature.gold, 'loaded map should initialize gold').toBe(500)
    expect(loadSignature.lumber, 'loaded map should initialize lumber').toBe(200)

    const terminalState = await page.evaluate(() => {
      const g = (window as any).__war3Game
      const stallAt = g.constructor.STALL_VERDICT_SECONDS as number
      g.gameTime = stallAt - 0.05
      g.update(0.1)

      const overlay = document.getElementById('game-over-overlay')
      const pauseShell = document.getElementById('pause-shell') as HTMLElement
      const resultsShell = document.getElementById('results-shell') as HTMLElement
      const resultsMessage = document.getElementById('results-shell-message')

      return {
        phase: g.phase.get(),
        result: g.getMatchResult(),
        pauseHidden: pauseShell.hidden,
        resultsHidden: resultsShell.hidden,
        overlayVisible: overlay ? overlay.style.display !== 'none' : null,
        overlayClass: overlay?.className ?? '',
        overlayText: document.getElementById('game-over-text')?.textContent ?? '',
        resultsText: resultsMessage?.textContent ?? '',
      }
    })

    expect(terminalState.phase, 'terminal state should use game_over').toBe('game_over')
    expect(terminalState.result, 'terminal state should be a stall verdict').toBe('stall')
    expect(terminalState.pauseHidden, 'pause shell should be hidden in terminal state').toBe(true)
    expect(terminalState.resultsHidden, 'results shell should be visible in terminal state').toBe(false)
    expect(terminalState.overlayVisible, 'game-over overlay should be visible in terminal state').toBe(true)
    expect(terminalState.overlayClass, 'game-over overlay should reflect the stall verdict').toContain('stall')
    expect(terminalState.overlayText, 'game-over overlay should show stall text').toBe('僵局')
    expect(terminalState.resultsText, 'results shell should show stall text').toBe('僵局')

    const reloadResult = await page.evaluate(() => {
      const g = (window as any).__war3Game
      const ok = g.reloadCurrentMap()
      const res0 = g.resources.get(0)
      const overlay = document.getElementById('game-over-overlay')
      const pauseShell = document.getElementById('pause-shell') as HTMLElement
      const resultsShell = document.getElementById('results-shell') as HTMLElement
      const resultsMessage = document.getElementById('results-shell-message')

      return {
        ok,
        phase: g.phase.get(),
        result: g.getMatchResult(),
        mapWidth: g.terrain.width,
        mapHeight: g.terrain.height,
        unitsLength: g.units.length,
        gold: res0.gold,
        lumber: res0.lumber,
        pauseHidden: pauseShell.hidden,
        resultsHidden: resultsShell.hidden,
        overlayVisible: overlay ? overlay.style.display !== 'none' : null,
        overlayClass: overlay?.className ?? '',
        overlayText: document.getElementById('game-over-text')?.textContent ?? '',
        resultsText: resultsMessage?.textContent ?? '',
      }
    })

    expect(reloadResult.ok, 'reloadCurrentMap should be available once a map has been loaded').toBe(true)
    expect(reloadResult.phase, 'reloadCurrentMap should return to playing').toBe('playing')
    expect(reloadResult.result, 'reloadCurrentMap should clear the terminal verdict').toBeNull()
    expect(reloadResult.mapWidth, 'reload should preserve the same terrain width').toBe(loadSignature.mapWidth)
    expect(reloadResult.mapHeight, 'reload should preserve the same terrain height').toBe(loadSignature.mapHeight)
    expect(reloadResult.unitsLength, 'reload should reproduce the same playable unit set size').toBe(loadSignature.unitsLength)
    expect(reloadResult.gold, 'reload should restore the same initial gold value').toBe(loadSignature.gold)
    expect(reloadResult.lumber, 'reload should restore the same initial lumber value').toBe(loadSignature.lumber)
    expect(reloadResult.pauseHidden, 'pause shell should be hidden after reload').toBe(true)
    expect(reloadResult.resultsHidden, 'results shell should be hidden after reload').toBe(true)
    expect(reloadResult.overlayVisible, 'game-over overlay should be cleared after reload').toBe(false)
    expect(reloadResult.overlayClass, 'game-over overlay classes should be cleared after reload').toBe('')
    expect(reloadResult.overlayText, 'game-over overlay text should be cleared after reload').toBe('')
    expect(reloadResult.resultsText, 'results shell text should be cleared after reload').toBe('')
  })
})
