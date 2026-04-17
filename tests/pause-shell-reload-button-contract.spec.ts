/**
 * Pause Shell Reload Button Contract
 *
 * Deterministic runtime proof that the pause shell exposes the real reload seam:
 *   1. procedural current source can be reloaded from pause
 *   2. parsed current source can be reloaded from pause
 *   3. clicking the button returns the game to a clean playing baseline
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

  await page.waitForTimeout(500)
}

test.describe('Pause Shell Reload Button Contract', () => {
  test.setTimeout(60000)

  test('pause-shell reload button restores the procedural baseline', async ({ page }) => {
    await waitForGame(page)

    const baseline = await page.evaluate(() => {
      const g = (window as any).__war3Game
      if (g.ai) {
        if (typeof g.ai.reset === 'function') g.ai.reset()
        g.ai.update = () => {}
      }
      const ok = g.reloadCurrentMap()
      if (g.ai) {
        if (typeof g.ai.reset === 'function') g.ai.reset()
        g.ai.update = () => {}
      }
      const res0 = g.resources.get(0)
      return {
        ok,
        phase: g.phase.get(),
        result: g.getMatchResult(),
        gameTime: g.gameTime,
        selectionCount: g.selectionModel.units.length,
        terrainWidth: g.terrain.width,
        terrainHeight: g.terrain.height,
        unitsLength: g.units.length,
        gold: res0.gold,
        lumber: res0.lumber,
      }
    })

    expect(baseline.ok, 'procedural path should expose reloadCurrentMap').toBe(true)
    expect(baseline.phase, 'baseline should be playing').toBe('playing')
    expect(baseline.result, 'baseline should not be terminal').toBeNull()

    const disturbed = await page.evaluate(() => {
      const g = (window as any).__war3Game
      const workers = g.units.filter((u: any) => u.type === 'worker' && u.team === 0 && u.hp > 0)
      const selected = workers[0]
      const doomed = workers[1]
      g.selectionModel.setSelection([selected])
      g.gameTime = 41
      g.resources.spend(0, { gold: 120, lumber: 40 })
      doomed.hp = 0
      g.removeTestUnit(doomed)
      g.pauseGame()

      const pauseShell = document.getElementById('pause-shell') as HTMLElement
      const reloadButton = document.getElementById('pause-reload-button') as HTMLButtonElement

      return {
        phase: g.phase.get(),
        paused: g.isPaused(),
        shellHidden: pauseShell.hidden,
        buttonDisabled: reloadButton.disabled,
      }
    })

    expect(disturbed.phase, 'disturbance should end in paused phase').toBe('paused')
    expect(disturbed.paused, 'pause should set the paused flag').toBe(true)
    expect(disturbed.shellHidden, 'pause shell should be visible while paused').toBe(false)
    expect(disturbed.buttonDisabled, 'pause reload button should be enabled on procedural source').toBe(false)

    await page.locator('#pause-reload-button').click()

    const after = await page.evaluate(() => {
      const g = (window as any).__war3Game
      if (g.ai) {
        if (typeof g.ai.reset === 'function') g.ai.reset()
        g.ai.update = () => {}
      }
      const res0 = g.resources.get(0)
      const pauseShell = document.getElementById('pause-shell') as HTMLElement
      return {
        phase: g.phase.get(),
        paused: g.isPaused(),
        result: g.getMatchResult(),
        gameTime: g.gameTime,
        selectionCount: g.selectionModel.units.length,
        terrainWidth: g.terrain.width,
        terrainHeight: g.terrain.height,
        unitsLength: g.units.length,
        gold: res0.gold,
        lumber: res0.lumber,
        shellHidden: pauseShell.hidden,
        shellAriaHidden: pauseShell.getAttribute('aria-hidden'),
      }
    })

    expect(after.phase, 'reload should return to playing').toBe('playing')
    expect(after.paused, 'reload should clear the paused flag').toBe(false)
    expect(after.result, 'reload should clear the terminal result').toBeNull()
    expect(after.gameTime, 'reload should restart near zero game time').toBeLessThan(1)
    expect(after.selectionCount, 'reload should clear selection').toBe(0)
    expect(after.terrainWidth, 'reload should preserve procedural terrain width').toBe(baseline.terrainWidth)
    expect(after.terrainHeight, 'reload should preserve procedural terrain height').toBe(baseline.terrainHeight)
    expect(after.unitsLength, 'reload should restore the procedural unit signature').toBe(baseline.unitsLength)
    expect(after.gold, 'reload should restore player gold').toBe(baseline.gold)
    expect(after.lumber, 'reload should restore player lumber').toBe(baseline.lumber)
    expect(after.shellHidden, 'pause shell should hide after reload').toBe(true)
    expect(after.shellAriaHidden, 'pause shell should announce hidden after reload').toBe('true')
  })

  test('pause-shell reload button restores the parsed-map baseline', async ({ page }) => {
    await waitForGame(page)

    const baseline = await page.evaluate(() => {
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
      if (g.ai) {
        if (typeof g.ai.reset === 'function') g.ai.reset()
        g.ai.update = () => {}
      }
      const res0 = g.resources.get(0)
      return {
        phase: g.phase.get(),
        result: g.getMatchResult(),
        gameTime: g.gameTime,
        selectionCount: g.selectionModel.units.length,
        terrainWidth: g.terrain.width,
        terrainHeight: g.terrain.height,
        unitsLength: g.units.length,
        gold: res0.gold,
        lumber: res0.lumber,
      }
    })

    expect(baseline.phase, 'parsed baseline should be playing').toBe('playing')
    expect(baseline.result, 'parsed baseline should not be terminal').toBeNull()

    const disturbed = await page.evaluate(() => {
      const g = (window as any).__war3Game
      const workers = g.units.filter((u: any) => u.type === 'worker' && u.team === 0 && u.hp > 0)
      const selected = workers[0]
      const doomed = workers[1]
      g.selectionModel.setSelection([selected])
      g.gameTime = 29
      g.resources.spend(0, { gold: 90, lumber: 20 })
      doomed.hp = 0
      g.removeTestUnit(doomed)
      g.pauseGame()

      const pauseShell = document.getElementById('pause-shell') as HTMLElement
      const reloadButton = document.getElementById('pause-reload-button') as HTMLButtonElement

      return {
        phase: g.phase.get(),
        paused: g.isPaused(),
        shellHidden: pauseShell.hidden,
        buttonDisabled: reloadButton.disabled,
      }
    })

    expect(disturbed.phase, 'disturbance should end in paused phase').toBe('paused')
    expect(disturbed.paused, 'pause should set the paused flag').toBe(true)
    expect(disturbed.shellHidden, 'pause shell should be visible while paused').toBe(false)
    expect(disturbed.buttonDisabled, 'pause reload button should be enabled on parsed source').toBe(false)

    await page.locator('#pause-reload-button').click()

    const after = await page.evaluate(() => {
      const g = (window as any).__war3Game
      if (g.ai) {
        if (typeof g.ai.reset === 'function') g.ai.reset()
        g.ai.update = () => {}
      }
      const res0 = g.resources.get(0)
      const pauseShell = document.getElementById('pause-shell') as HTMLElement
      return {
        phase: g.phase.get(),
        paused: g.isPaused(),
        result: g.getMatchResult(),
        gameTime: g.gameTime,
        selectionCount: g.selectionModel.units.length,
        terrainWidth: g.terrain.width,
        terrainHeight: g.terrain.height,
        unitsLength: g.units.length,
        gold: res0.gold,
        lumber: res0.lumber,
        shellHidden: pauseShell.hidden,
        shellAriaHidden: pauseShell.getAttribute('aria-hidden'),
      }
    })

    expect(after.phase, 'reload should return to playing').toBe('playing')
    expect(after.paused, 'reload should clear the paused flag').toBe(false)
    expect(after.result, 'reload should clear the terminal result').toBeNull()
    expect(after.gameTime, 'reload should restart near zero game time').toBeLessThan(1)
    expect(after.selectionCount, 'reload should clear selection').toBe(0)
    expect(after.terrainWidth, 'reload should preserve parsed terrain width').toBe(baseline.terrainWidth)
    expect(after.terrainHeight, 'reload should preserve parsed terrain height').toBe(baseline.terrainHeight)
    expect(after.unitsLength, 'reload should restore the parsed unit signature').toBe(baseline.unitsLength)
    expect(after.gold, 'reload should restore player gold').toBe(baseline.gold)
    expect(after.lumber, 'reload should restore player lumber').toBe(baseline.lumber)
    expect(after.shellHidden, 'pause shell should hide after reload').toBe(true)
    expect(after.shellAriaHidden, 'pause shell should announce hidden after reload').toBe('true')
  })
})
