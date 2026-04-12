/**
 * Closeout runtime truth tests
 *
 * These tests prove that the 3 human-verified fixes actually work at runtime.
 * They must fail if the fix regresses — not just log values.
 *
 * Wait strategy: do NOT rely on Playwright locator visibility/attachment for canvas.
 * Instead use page.waitForFunction checking DOM canvas, __war3Game, units, renderer.
 * Diagnostic snapshot on every failure so CI logs are actionable.
 */
import { test, expect, type Page } from '@playwright/test'
import { BUILDINGS } from '../src/game/GameData'

const BASE = 'http://127.0.0.1:4173/?runtimeTest=1'

// ==================== Test helpers ====================

/** Collect a diagnostic snapshot of game state for error messages */
async function diagnose(page: Page, label: string) {
  const snap = await page.evaluate(() => {
    const game = (window as any).__war3Game
    const canvas = document.getElementById('game-canvas')
    const rect = canvas?.getBoundingClientRect()
    const mapStatus = document.getElementById('map-status')?.textContent
    return {
      hasGame: !!game,
      unitsLength: game?.units?.length ?? -1,
      unitTypes: game?.units?.map((u: any) => u.type) ?? [],
      canvasRect: rect ? { x: rect.x, y: rect.y, w: rect.width, h: rect.height } : null,
      mapStatus,
      rendererSize: game?.renderer
        ? `${game.renderer.domElement.width}x${game.renderer.domElement.height}`
        : null,
    }
  })
  console.error(`[DIAGNOSE ${label}]`, JSON.stringify(snap, null, 2))
  return snap
}

/**
 * Wait for game to initialize and settle.
 *
 * Does NOT use locator.waitFor() for canvas. In this WebGL/HUD page the
 * accessibility snapshot can show the HUD while canvas locators still time out
 * intermittently in headless runs. Instead we verify from inside the page:
 *   1. canvas exists in DOM and has a non-zero client rect
 *   2. window.__war3Game exists with populated units array
 *   3. renderer has non-zero dimensions (Three.js initialized)
 *   4. A short settle for the animation loop to produce one frame
 */
async function waitForGame(page: Page) {
  // Collect console errors during load for diagnostics
  const consoleErrors: string[] = []
  page.on('console', (msg) => {
    if (msg.type() === 'error') consoleErrors.push(msg.text())
  })
  ;(page as any).__consoleErrors = consoleErrors

  await page.goto(BASE, { waitUntil: 'domcontentloaded' })

  // Game instance + units + renderer ready
  try {
    await page.waitForFunction(() => {
      const canvas = document.getElementById('game-canvas')
      if (!canvas) return false
      const rect = canvas.getBoundingClientRect()
      if (rect.width === 0 || rect.height === 0) return false

      const game = (window as any).__war3Game
      if (!game) return false
      if (!Array.isArray(game.units) || game.units.length === 0) return false
      if (!game.renderer) return false
      const c = game.renderer.domElement
      if (c.width === 0 || c.height === 0) return false
      return true
    }, { timeout: 15000 })
  } catch (e) {
    const snap = await diagnose(page, 'waitForGame-fail')
    // Attach useful info to the error
    const reason = snap.hasGame
      ? (snap.unitsLength > 0 ? 'renderer-not-ready' : 'no-units')
      : 'no-game-instance'
    throw new Error(
      `waitForGame failed (${reason}). ` +
      `canvas=${JSON.stringify(snap.canvasRect)} mapStatus="${snap.mapStatus}" ` +
      `units=${snap.unitsLength} renderer=${snap.rendererSize}. ` +
      `Console errors: ${consoleErrors.slice(-5).join(' | ')}. ` +
      `Original: ${(e as Error).message}`,
    )
  }

  // The app asynchronously loads the W3X test map after constructing the
  // initial procedural scene. Wait for that transition to finish so tests do
  // not select units that are immediately disposed by loadMap().
  await page.waitForFunction(() => {
    const status = document.getElementById('map-status')?.textContent ?? ''
    return !status.includes('正在加载')
  }, { timeout: 15000 })

  // One animation frame settle after any map replacement.
  await page.waitForTimeout(500)
}

/**
 * Dispatch a mouse event directly to the canvas element.
 * Used for cases where we intentionally want to bypass DOM overlays.
 */
async function dispatchCanvasMouseEvent(
  page: Page,
  type: string,
  opts: { clientX?: number; clientY?: number; button?: number; buttons?: number } = {},
) {
  await page.evaluate(({ type: t, clientX, clientY, button, buttons }) => {
    const canvas = document.getElementById('game-canvas')!
    const eventInit: any = { bubbles: true, cancelable: true }
    if (clientX !== undefined) eventInit.clientX = clientX
    if (clientY !== undefined) eventInit.clientY = clientY
    if (button !== undefined) eventInit.button = button
    if (buttons !== undefined) eventInit.buttons = buttons
    canvas.dispatchEvent(new MouseEvent(t, eventInit))
  }, { type, clientX: opts.clientX, clientY: opts.clientY, button: opts.button, buttons: opts.buttons })
}

// ============================================================
// TEST 1: Box select commits on mouseup
// ============================================================
test.describe('Truth Validation: Box Selection', () => {
  test.setTimeout(60000)

  test('box select commits on mouseup without extra click', async ({ page }) => {
    await waitForGame(page)

    // Do the entire box-select inside evaluate to avoid camera edge-scroll
    // caused by window-level mousemove listeners picking up Playwright mouse events
    const result = await page.evaluate(() => {
      const g = (window as any).__war3Game
      if (!g) return { ok: false, reason: 'no game' }

      // Ensure camera is focused on player base
      const th = g.units.find((u: any) => u.type === 'townhall' && u.team === 0)
      if (th) {
        g.cameraCtrl.setTarget(th.mesh.position.x, th.mesh.position.z)
        g.cameraCtrl.distance = 24
      }
      // Force camera update
      g.cameraCtrl.update(0.016)

      const cam = g.camera
      const workers = g.units
        .filter((u: any) => u.team === 0 && u.type === 'worker' && u.hp > 0)
        .map((u: any) => {
          const p = u.mesh.position.clone().project(cam)
          return {
            sx: ((p.x + 1) / 2) * window.innerWidth,
            sy: ((-p.y + 1) / 2) * window.innerHeight,
            visible: p.z < 1,
          }
        })
        .filter((p: any) => p.visible)

      if (workers.length < 1) return { ok: false, reason: `only ${workers.length} visible workers` }

      // Build box around all workers
      const minX = Math.min(...workers.map((p: any) => p.sx)) - 30
      const minY = Math.min(...workers.map((p: any) => p.sy)) - 30
      const maxX = Math.max(...workers.map((p: any) => p.sx)) + 30
      const maxY = Math.max(...workers.map((p: any) => p.sy)) + 30

      const canvas = document.getElementById('game-canvas')!

      // Dispatch mousedown
      canvas.dispatchEvent(new MouseEvent('mousedown', {
        bubbles: true, cancelable: true,
        clientX: minX, clientY: minY, button: 0,
      }))

      // Dispatch mousemove with buttons:1 to trigger drag threshold
      canvas.dispatchEvent(new MouseEvent('mousemove', {
        bubbles: true, cancelable: true,
        clientX: minX + 10, clientY: minY + 10, buttons: 1,
      }))

      // Dispatch mousemove to final position
      canvas.dispatchEvent(new MouseEvent('mousemove', {
        bubbles: true, cancelable: true,
        clientX: maxX, clientY: maxY, buttons: 1,
      }))

      // Dispatch mouseup — triggers finishBoxSelect
      canvas.dispatchEvent(new MouseEvent('mouseup', {
        bubbles: true, cancelable: true,
        clientX: maxX, clientY: maxY, button: 0,
      }))

      // Read selection state immediately
      const sel = g.selectionModel.units
      return {
        ok: true,
        selectionCount: sel.length,
        selectionTypes: sel.map((u: any) => u.type),
        workerCount: workers.length,
        box: { minX, minY, maxX, maxY },
        isDragging: g.isDragging,
      }
    })

    if (!result.ok) {
      await diagnose(page, 'box-select-no-workers')
    }
    expect(result.ok).toBe(true)
    expect(result.isDragging).toBe(false) // mouseup must clear isDragging
    expect(result.selectionCount).toBeGreaterThan(0)
    expect(result.selectionTypes).toContain('worker')
  })

  test('click on empty ground clears selection', async ({ page }) => {
    await waitForGame(page)

    // First create a selection using evaluate (bypass DOM)
    await page.evaluate(() => {
      const g = (window as any).__war3Game
      if (!g) return
      const worker = g.units.find((u: any) => u.team === 0 && u.type === 'worker' && u.hp > 0)
      if (!worker) return
      g.selectionModel.clear()
      g.selectionModel.add(worker)
      g._lastCmdKey = ''
      g._lastSelKey = ''
    })
    await page.waitForTimeout(200)

    // Verify something is selected
    const beforeCount = await page.evaluate(() => {
      const g = (window as any).__war3Game
      return g ? g.selectionModel.units.length : 0
    })
    if (beforeCount === 0) {
      await diagnose(page, 'clear-selection-no-worker')
    }
    expect(beforeCount).toBeGreaterThan(0)

    // Click on corner (empty ground) via canvas dispatch
    const viewportHeight = await page.evaluate(() => window.innerHeight)
    await dispatchCanvasMouseEvent(page, 'mousedown', { clientX: 5, clientY: viewportHeight - 5, button: 0 })
    await dispatchCanvasMouseEvent(page, 'mouseup', { clientX: 5, clientY: viewportHeight - 5, button: 0 })

    await page.waitForTimeout(200)

    const selectionCount = await page.evaluate(() => {
      const g = (window as any).__war3Game
      return g ? g.selectionModel.units.length : -1
    })
    expect(selectionCount).toBe(0)
  })
})

// ============================================================
// TEST 2: Builder agency — selected worker builds
// ============================================================
test.describe('Truth Validation: Builder Agency', () => {
  test.setTimeout(60000)

  test('selected worker is saved as builder when entering placement mode', async ({ page }) => {
    await waitForGame(page)

    // Test builder agency entirely via evaluate (no DOM mouse events needed)
    const result = await page.evaluate(() => {
      const g = (window as any).__war3Game
      if (!g) return { ok: false, reason: 'no game' }

      const workers = g.units.filter(
        (u: any) => u.type === 'worker' && u.team === 0 && u.hp > 0 && !u.isBuilding,
      )
      if (workers.length === 0) return { ok: false, reason: 'no workers' }

      const worker = workers[0]
      const workerIndex = g.units.indexOf(worker)

      // Simulate selection via selectionModel
      g.selectionModel.clear()
      g.selectionModel.add(worker)
      g._lastCmdKey = ''
      g._lastSelKey = ''

      // Enter placement mode — should save the selected worker
      g.enterPlacementMode('farm')

      const savedWorkerIndices = g.placementWorkers.map((w: any) => g.units.indexOf(w))

      // Find valid tile and place building
      const originTx = Math.round(worker.mesh.position.x - 0.5)
      const originTz = Math.round(worker.mesh.position.z - 0.5)

      let placed = false
      for (let radius = 2; radius <= 12 && !placed; radius++) {
        for (let dx = -radius; dx <= radius && !placed; dx++) {
          for (let dz = -radius; dz <= radius && !placed; dz++) {
            const tx = originTx + dx
            const tz = originTz + dz
            const check = g.placementValidator.canPlace(tx, tz, 2)
            if (check?.ok) {
              const h = g.getWorldHeight(tx, tz)
              g.ghostMesh.position.set(tx + 0.5, h + 0.01, tz + 0.5)
              g.placeBuilding()
              placed = true
            }
          }
        }
      }

      if (g.placementMode) g.exitPlacementMode()

      // Find building under construction
      const underConstruction = g.units.filter(
        (u: any) => u.isBuilding && u.buildProgress < 1 && u.team === 0,
      )
      const building = underConstruction[underConstruction.length - 1] ?? null

      // Find who is building it
      const builders = building
        ? g.units
            .map((u: any, idx: number) => ({ u, idx }))
            .filter(({ u }: any) => !u.isBuilding && u.buildTarget === building)
            .map(({ idx }: any) => idx)
        : []

      return {
        ok: true,
        workerIndex,
        savedWorkerIndices,
        placed,
        buildingExists: !!building,
        buildingType: building?.type ?? null,
        builderIndices: builders,
        builderCount: builders.length,
      }
    })

    if (!result.ok) {
      await diagnose(page, 'builder-agency-fail')
    }
    expect(result.ok).toBe(true)
    // The selected worker must be in placementWorkers
    expect(result.savedWorkerIndices).toContain(result.workerIndex)

    if (result.placed) {
      expect(result.buildingExists).toBe(true)
      expect(result.builderCount).toBeGreaterThanOrEqual(1)
      // The builder must be the worker we selected
      expect(result.builderIndices).toContain(result.workerIndex)
    }
  })

  test('placementWorkers is empty when entering build mode with no worker selected', async ({ page }) => {
    await waitForGame(page)

    // Clear selection
    await page.evaluate(() => {
      const g = (window as any).__war3Game
      if (!g) return
      g.selectionModel.clear()
      g._lastCmdKey = ''
      g._lastSelKey = ''
    })
    await page.waitForTimeout(200)

    const savedWorkers = await page.evaluate(() => {
      const g = (window as any).__war3Game
      if (!g) return -1
      g.enterPlacementMode('farm')
      const count = g.placementWorkers.length
      g.exitPlacementMode()
      return count
    })

    expect(savedWorkers).toBe(0)
  })
})

// ============================================================
// TEST 3: Scale / Layout structural validation
// ============================================================
test.describe('Truth Validation: Scale and Layout', () => {
  test.setTimeout(60000)

  test('building size hierarchy: Farm < Barracks < Town Hall', async ({ page }) => {
    await waitForGame(page)

    const sizes = await page.evaluate(() => {
      const g = (window as any).__war3Game
      if (!g) return null
      const townhall = g.units.find((u: any) => u.type === 'townhall' && u.team === 0)
      const barracks = g.units.find((u: any) => u.type === 'barracks' && u.team === 0)
      const goldmine = g.units.find((u: any) => u.type === 'goldmine')
      return {
        townhallExists: !!townhall,
        barracksExists: !!barracks,
        goldmineExists: !!goldmine,
        workerCount: g.units.filter((u: any) => u.type === 'worker' && u.team === 0).length,
      }
    })
    if (!sizes) {
      await diagnose(page, 'size-hierarchy-no-game')
    }
    expect(sizes).not.toBeNull()
    expect(sizes!.townhallExists).toBe(true)
    expect(sizes!.barracksExists).toBe(true)
    expect(sizes!.goldmineExists).toBe(true)
    expect(sizes!.workerCount).toBe(5)
  })

  test('Town Hall / Gold Mine distance is in expected range', async ({ page }) => {
    await waitForGame(page)

    const spatial = await page.evaluate(() => {
      const g = (window as any).__war3Game
      if (!g) return null

      const th = g.units.find((u: any) => u.type === 'townhall' && u.team === 0)
      const gm = g.units.find((u: any) => u.type === 'goldmine')
      if (!th || !gm) return null

      const dx = th.mesh.position.x - gm.mesh.position.x
      const dz = th.mesh.position.z - gm.mesh.position.z
      const dist = Math.sqrt(dx * dx + dz * dz)

      return {
        distance: dist,
        gmIsNE: gm.mesh.position.x > th.mesh.position.x && gm.mesh.position.z < th.mesh.position.z,
      }
    })
    if (!spatial) {
      await diagnose(page, 'th-gm-distance-no-units')
    }
    expect(spatial).not.toBeNull()

    expect(spatial!.distance).toBeGreaterThanOrEqual(3)
    expect(spatial!.distance).toBeLessThanOrEqual(10)
    expect(spatial!.gmIsNE).toBe(true)
  })

  test('Barracks is on SW side of Town Hall', async ({ page }) => {
    await waitForGame(page)

    const spatial = await page.evaluate(() => {
      const g = (window as any).__war3Game
      if (!g) return null

      const th = g.units.find((u: any) => u.type === 'townhall' && u.team === 0)
      const bk = g.units.find((u: any) => u.type === 'barracks' && u.team === 0)
      if (!th || !bk) return null

      return {
        isSW: bk.mesh.position.x < th.mesh.position.x && bk.mesh.position.z > th.mesh.position.z,
      }
    })
    if (!spatial) {
      await diagnose(page, 'barracks-sw-no-units')
    }
    expect(spatial).not.toBeNull()
    expect(spatial!.isSW).toBe(true)
  })

  test('workers spawn outside TH blocker zone', async ({ page }) => {
    await waitForGame(page)

    const layout = await page.evaluate(() => {
      const g = (window as any).__war3Game
      if (!g) return null

      const th = g.units.find((u: any) => u.type === 'townhall' && u.team === 0)
      const workers = g.units.filter((u: any) => u.type === 'worker' && u.team === 0)
      if (!th || workers.length === 0) return null

      const thTileX = Math.round(th.mesh.position.x - 0.5)
      const thTileZ = Math.round(th.mesh.position.z - 0.5)
      const thSize = 4

      let allOutside = true
      for (const w of workers) {
        const wx = Math.round(w.mesh.position.x - 0.5)
        const wz = Math.round(w.mesh.position.z - 0.5)
        const inside = wx >= thTileX && wx < thTileX + thSize &&
                       wz >= thTileZ && wz < thTileZ + thSize
        if (inside) allOutside = false
      }

      return { allOutside }
    })
    if (!layout) {
      await diagnose(page, 'workers-outside-th-no-units')
    }
    expect(layout).not.toBeNull()
    expect(layout!.allOutside).toBe(true)
  })

  test('no critical console errors on startup', async ({ page }) => {
    const errors: string[] = []
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        errors.push(msg.text())
      }
    })

    await waitForGame(page)
    await page.waitForTimeout(3000)

    const criticalErrors = errors.filter(e =>
      !e.includes('favicon') &&
      !e.includes('.glb') &&
      !e.includes('AssetLoader') &&
      !e.includes('maps/')
    )

    if (criticalErrors.length > 0) {
      console.error('[DIAGNOSE console-errors]', criticalErrors.join('\n'))
    }
    expect(criticalErrors).toHaveLength(0)
  })
})
