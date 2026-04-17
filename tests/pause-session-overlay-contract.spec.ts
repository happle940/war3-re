/**
 * Pause/Session Overlay Contract Pack
 *
 * Deterministic runtime proof that pause mode behaves like a real session overlay:
 *   1. pausing enters paused/session-overlay state
 *   2. gameplay input on the canvas is suppressed while paused
 *   3. clicks inside #pause-shell remain observable while paused
 *   4. resume returns to playing and restores canvas input
 *   5. the pause-shell resume button drives the real resume path
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

test.describe('Pause/Session Overlay Contract', () => {
  test.setTimeout(60000)

  test('pause blocks canvas input, keeps pause-shell clickable, and resume restores play', async ({ page }) => {
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
      const panel = pauseShell.querySelector('.page-shell-panel') as HTMLElement | null
      const rect = canvas.getBoundingClientRect()
      const unitMeshes = g.units.map((u: any) => u.mesh)

      const state = (window as any).__pauseContractState ?? ((window as any).__pauseContractState = {
        installed: false,
        canvasMouseDowns: 0,
        canvasMouseUps: 0,
        shellClicks: 0,
      })
      state.canvasMouseDowns = 0
      state.canvasMouseUps = 0
      state.shellClicks = 0

      if (!state.installed) {
        canvas.addEventListener('mousedown', () => { state.canvasMouseDowns += 1 })
        canvas.addEventListener('mouseup', () => { state.canvasMouseUps += 1 })
        pauseShell.addEventListener('click', () => { state.shellClicks += 1 })
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
        shellHidden: pauseShell.hidden,
        shellAriaHidden: pauseShell.getAttribute('aria-hidden'),
        selectedCount: g.selectionModel.count,
        selectedType: g.selectionModel.primary?.type ?? null,
        probe,
        panelPoint: panel
          ? {
              x: panel.getBoundingClientRect().left + panel.getBoundingClientRect().width / 2,
              y: panel.getBoundingClientRect().top + panel.getBoundingClientRect().height / 2,
            }
          : null,
      }
    })

    expect(setup.error).toBeUndefined()
    expect(setup.phase, 'pause should move the game into paused phase').toBe('paused')
    expect(setup.paused, 'pause should set the paused flag').toBe(true)
    expect(setup.shellHidden, 'pause shell should be visible while paused').toBe(false)
    expect(setup.shellAriaHidden, 'pause shell should be announced as visible').toBe('false')
    expect(setup.selectedCount, 'preselected unit should remain selected through pause').toBe(1)

    const pausedCanvas = await page.evaluate(({ x, y }) => {
      const canvas = document.getElementById('game-canvas') as HTMLCanvasElement
      const state = (window as any).__pauseContractState
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
        selectedCount: g.selectionModel.count,
        ringCount: g.selectionRings.length,
      }
    }, setup.probe)

    expect(pausedCanvas.canvasMouseDowns, 'paused canvas mousedown should be blocked at capture').toBe(0)
    expect(pausedCanvas.canvasMouseUps, 'paused canvas mouseup should be blocked at capture').toBe(0)
    expect(pausedCanvas.selectedCount, 'paused canvas click should not change gameplay state').toBe(1)
    expect(pausedCanvas.ringCount, 'paused canvas click should not change selection visuals').toBe(1)

    await page.mouse.click(setup.panelPoint.x, setup.panelPoint.y)
    const shellClicks = await page.evaluate(() => (window as any).__pauseContractState.shellClicks)
    expect(shellClicks, 'clicks inside pause shell should be observable while paused').toBe(1)

    const resumed = await page.evaluate(() => {
      const g = (window as any).__war3Game
      g.resumeGame()
      const pauseShell = document.getElementById('pause-shell') as HTMLElement
      return {
        phase: g.phase.get(),
        paused: g.isPaused(),
        shellHidden: pauseShell.hidden,
        shellAriaHidden: pauseShell.getAttribute('aria-hidden'),
      }
    })

    expect(resumed.phase, 'resume should return the game to playing').toBe('playing')
    expect(resumed.paused, 'resume should clear the paused flag').toBe(false)
    expect(resumed.shellHidden, 'pause shell should hide after resume').toBe(true)
    expect(resumed.shellAriaHidden, 'pause shell should announce hidden after resume').toBe('true')

    const playingCanvas = await page.evaluate(({ x, y }) => {
      const canvas = document.getElementById('game-canvas') as HTMLCanvasElement
      const state = (window as any).__pauseContractState
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
        selectedCount: g.selectionModel.count,
        ringCount: g.selectionRings.length,
      }
    }, setup.probe)

    expect(playingCanvas.canvasMouseDowns, 'canvas mousedown should reach gameplay again after resume').toBe(1)
    expect(playingCanvas.canvasMouseUps, 'canvas mouseup should reach gameplay again after resume').toBe(1)
    expect(playingCanvas.selectedCount, 'resume should restore canvas-driven gameplay input').toBe(0)
    expect(playingCanvas.ringCount, 'resume should clear the selection after the empty-ground click').toBe(0)
  })

  test('pause-shell resume button returns the game to playing', async ({ page }) => {
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

      const pauseShell = document.getElementById('pause-shell') as HTMLElement
      const resumeButton = document.getElementById('pause-resume-button') as HTMLButtonElement

      return {
        phase: g.phase.get(),
        paused: g.isPaused(),
        shellHidden: pauseShell.hidden,
        buttonText: resumeButton.textContent ?? '',
      }
    })

    expect(setup.error).toBeUndefined()
    expect(setup.phase, 'setup should enter paused phase before button click').toBe('paused')
    expect(setup.paused, 'setup should start paused before button click').toBe(true)
    expect(setup.shellHidden, 'pause shell should be visible before button click').toBe(false)
    expect(setup.buttonText, 'pause shell should expose a resume button').toBe('继续')

    await page.locator('#pause-resume-button').click()

    const after = await page.evaluate(() => {
      const g = (window as any).__war3Game
      const pauseShell = document.getElementById('pause-shell') as HTMLElement
      return {
        phase: g.phase.get(),
        paused: g.isPaused(),
        shellHidden: pauseShell.hidden,
        shellAriaHidden: pauseShell.getAttribute('aria-hidden'),
      }
    })

    expect(after.phase, 'resume button should route through the real resume path').toBe('playing')
    expect(after.paused, 'resume button should clear the paused flag').toBe(false)
    expect(after.shellHidden, 'resume button should hide the pause shell').toBe(true)
    expect(after.shellAriaHidden, 'resume button should mark the shell hidden').toBe('true')
  })
})
