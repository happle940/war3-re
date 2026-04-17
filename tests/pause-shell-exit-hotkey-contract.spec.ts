/**
 * Pause Shell Exit Hotkey Contract
 *
 * Deterministic runtime proof that pause can be dismissed through keyboard
 * semantics while gameplay input stays blocked during the paused session:
 *   1. paused session blocks gameplay input
 *   2. Escape resumes from pause
 *   3. resume preserves the current map source and does not touch setup/results
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

test.describe('Pause Shell Exit Hotkey Contract', () => {
  test.setTimeout(60000)

  test('Escape resumes pause without reopening setup/results or changing the current map source', async ({ page }) => {
    await waitForGame(page)

    const setup = await page.evaluate(() => {
      const g = (window as any).__war3Game
      const selectedUnit = g.units.find((u: any) => u.team === 0 && !u.isBuilding && u.hp > 0)
      if (!selectedUnit) {
        return { error: 'no controllable unit' }
      }

      g.clearSelection()
      g.selectionModel.setSelection([selectedUnit])
      g.createSelectionRing(selectedUnit)
      g.pauseGame()

      const canvas = document.getElementById('game-canvas') as HTMLCanvasElement
      const pauseShell = document.getElementById('pause-shell') as HTMLElement
      const setupShell = document.getElementById('setup-shell') as HTMLElement
      const resultsShell = document.getElementById('results-shell') as HTMLElement
      const rect = canvas.getBoundingClientRect()
      const unitMeshes = g.units.map((u: any) => u.mesh)

      const state = (window as any).__pauseExitContractState ?? ((window as any).__pauseExitContractState = {
        installed: false,
        canvasMouseDowns: 0,
        canvasMouseUps: 0,
      })
      state.canvasMouseDowns = 0
      state.canvasMouseUps = 0

      if (!state.installed) {
        canvas.addEventListener('mousedown', () => { state.canvasMouseDowns += 1 })
        canvas.addEventListener('mouseup', () => { state.canvasMouseUps += 1 })
        state.installed = true
      }

      const candidates = [
        [0.16, 0.16], [0.16, 0.84], [0.84, 0.16], [0.84, 0.84],
        [0.28, 0.22], [0.72, 0.22], [0.28, 0.78], [0.72, 0.78],
        [0.50, 0.16], [0.50, 0.84], [0.16, 0.50], [0.84, 0.50],
      ]

      let probe = { x: rect.left + rect.width * 0.5, y: rect.top + rect.height * 0.5 }
      for (const [fx, fy] of candidates) {
        const x = rect.left + rect.width * fx
        const y = rect.top + rect.height * fy
        g.mouseNDC.x = (x / window.innerWidth) * 2 - 1
        g.mouseNDC.y = -(y / window.innerHeight) * 2 + 1
        g.raycaster.setFromCamera(g.mouseNDC, g.camera)
        const unitHits = g.raycaster.intersectObjects(unitMeshes, true)
        const groundHits = g.raycaster.intersectObject(g.terrain.groundPlane)
        if (unitHits.length === 0 && groundHits.length > 0) {
          probe = { x, y }
          break
        }
      }

      return {
        phase: g.phase.get(),
        paused: g.isPaused(),
        currentMapKind: g.currentMapSource?.kind ?? null,
        pauseHidden: pauseShell.hidden,
        pauseAriaHidden: pauseShell.getAttribute('aria-hidden'),
        setupHidden: setupShell.hidden,
        resultsHidden: resultsShell.hidden,
        probe,
        selectionCount: g.selectionModel.count,
      }
    })

    expect(setup.error).toBeUndefined()
    expect(setup.phase, 'pause setup should put the game into paused phase').toBe('paused')
    expect(setup.paused, 'pause setup should set paused true').toBe(true)
    expect(setup.currentMapKind, 'pause setup should preserve the current map source').toBe('procedural')
    expect(setup.pauseHidden, 'pause shell should be visible while paused').toBe(false)
    expect(setup.pauseAriaHidden, 'pause shell should announce visible while paused').toBe('false')
    expect(setup.setupHidden, 'setup shell should stay hidden while paused').toBe(true)
    expect(setup.resultsHidden, 'results shell should stay hidden while paused').toBe(true)
    expect(setup.selectionCount, 'pause should preserve the current selection').toBe(1)

    const pausedCanvas = await page.evaluate(({ x, y }) => {
      const canvas = document.getElementById('game-canvas') as HTMLCanvasElement
      const state = (window as any).__pauseExitContractState
      canvas.dispatchEvent(new MouseEvent('mousedown', {
        bubbles: true,
        cancelable: true,
        clientX: x,
        clientY: y,
        button: 0,
      }))
      canvas.dispatchEvent(new MouseEvent('mouseup', {
        bubbles: true,
        cancelable: true,
        clientX: x,
        clientY: y,
        button: 0,
      }))
      const g = (window as any).__war3Game
      return {
        canvasMouseDowns: state.canvasMouseDowns,
        canvasMouseUps: state.canvasMouseUps,
        selectionCount: g.selectionModel.count,
        ringCount: g.selectionRings.length,
      }
    }, setup.probe)

    expect(pausedCanvas.canvasMouseDowns, 'paused canvas mousedown should stay blocked').toBe(0)
    expect(pausedCanvas.canvasMouseUps, 'paused canvas mouseup should stay blocked').toBe(0)
    expect(pausedCanvas.selectionCount, 'paused canvas click should not change selection').toBe(1)
    expect(pausedCanvas.ringCount, 'paused canvas click should not change selection visuals').toBe(1)

    await page.keyboard.press('Escape')

    const resumed = await page.evaluate(() => {
      const g = (window as any).__war3Game
      const pauseShell = document.getElementById('pause-shell') as HTMLElement
      const setupShell = document.getElementById('setup-shell') as HTMLElement
      const resultsShell = document.getElementById('results-shell') as HTMLElement
      const res0 = g.resources.get(0)
      return {
        phase: g.phase.get(),
        paused: g.isPaused(),
        currentMapKind: g.currentMapSource?.kind ?? null,
        gameTime: g.gameTime,
        result: g.getMatchResult(),
        pauseHidden: pauseShell.hidden,
        pauseAriaHidden: pauseShell.getAttribute('aria-hidden'),
        setupHidden: setupShell.hidden,
        resultsHidden: resultsShell.hidden,
        selectionCount: g.selectionModel.count,
        gold: res0.gold,
        lumber: res0.lumber,
      }
    })

    expect(resumed.phase, 'Escape while paused should resume play').toBe('playing')
    expect(resumed.paused, 'Escape while paused should clear the paused flag').toBe(false)
    expect(resumed.currentMapKind, 'Escape should not clear the current map source').toBe('procedural')
    expect(resumed.gameTime, 'Escape should not reset the game clock').toBeGreaterThan(0)
    expect(resumed.result, 'Escape should not create or clear a terminal verdict').toBeNull()
    expect(resumed.pauseHidden, 'pause shell should hide after Escape resumes').toBe(true)
    expect(resumed.pauseAriaHidden, 'pause shell should announce hidden after Escape resumes').toBe('true')
    expect(resumed.setupHidden, 'setup shell should remain hidden after Escape resumes').toBe(true)
    expect(resumed.resultsHidden, 'results shell should remain hidden after Escape resumes').toBe(true)
    expect(resumed.selectionCount, 'resume should preserve the live selection state').toBe(1)
    expect(resumed.gold, 'resume should not alter player gold').toBe(500)
    expect(resumed.lumber, 'resume should not alter player lumber').toBe(200)
  })
})
