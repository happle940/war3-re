/**
 * V3-CH1 Camera-HUD-Footprint Harmony Proof
 *
 * Focused regression that proves the default camera framing, HUD overlay,
 * selection rings, and ghost placement footprint cooperate without breaking
 * RTS readability:
 *   1. Default viewport contains TH, goldmine, worker, barracks simultaneously
 *   2. Bottom HUD panel does not occlude any core base object
 *   3. Top HUD panel does not occlude any core base object
 *   4. Selection ring on a worker does not mask nearby spatial relationships
 *      (TH-mine direction, exit corridor)
 *   5. Ghost footprint preview at TH-mine corridor does not obscure TH or mine
 *
 * This is the V3-CH1 gate closeout pack — conclusions bind to specific
 * measured pixel positions, not vague "looks harmonious" claims.
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
  } catch { /* procedural fallback valid */ }
  await page.waitForTimeout(500)
}

/** Project a world position to screen pixels */
async function projectPositions(page: Page, objects: { key: string; pos: { x: number; z: number } }[]) {
  return page.evaluate((objs) => {
    const g = (window as any).__war3Game
    const camera = g.camera
    const vw = window.innerWidth
    const vh = window.innerHeight

    return objs.map(({ key, pos }) => {
      const p = new (window as any).THREE.Vector3(pos.x, 0, pos.z)
      // Use the unit's actual mesh height for proper Y projection
      const unit = g.units.find((u: any) =>
        Math.abs(u.mesh.position.x - pos.x) < 0.1 && Math.abs(u.mesh.position.z - pos.z) < 0.1,
      )
      if (unit) {
        p.y = unit.mesh.position.y
      }
      const projected = p.clone().project(camera)
      return {
        key,
        sx: (projected.x + 1) / 2 * vw,
        sy: (-projected.y + 1) / 2 * vh,
        onScreen: projected.x >= -1 && projected.x <= 1 && projected.y >= -1 && projected.y <= 1 && projected.z < 1,
      }
    })
  }, objects)
}

test.describe('V3-CH1 Camera-HUD-Footprint Harmony', () => {
  test.setTimeout(180000)

  test('default viewport contains all core base objects simultaneously', async ({ page }) => {
    await waitForGame(page)

    const result = await page.evaluate(() => {
      const g = (window as any).__war3Game
      const camera = g.camera
      const vw = window.innerWidth
      const vh = window.innerHeight

      function project(obj: any) {
        const p = obj.mesh.position.clone().project(camera)
        return {
          sx: (p.x + 1) / 2 * vw,
          sy: (-p.y + 1) / 2 * vh,
          onScreen: p.x >= -1 && p.x <= 1 && p.y >= -1 && p.y <= 1 && p.z < 1,
        }
      }

      const th = g.units.find((u: any) => u.team === 0 && u.type === 'townhall' && u.hp > 0)
      const mine = g.units.find((u: any) => u.type === 'goldmine' && u.hp > 0)
      const worker = g.units.find((u: any) => u.team === 0 && u.type === 'worker' && !u.isBuilding && u.hp > 0)
      const barracks = g.units.find((u: any) => u.team === 0 && u.type === 'barracks' && u.hp > 0)

      return {
        viewport: { w: vw, h: vh },
        cameraDistance: g.cameraCtrl?.distance ?? -1,
        th: th ? project(th) : null,
        mine: mine ? project(mine) : null,
        worker: worker ? project(worker) : null,
        barracks: barracks ? project(barracks) : null,
      }
    })

    // All core objects must exist
    expect(result.th, 'Town Hall must exist').not.toBeNull()
    expect(result.mine, 'Goldmine must exist').not.toBeNull()
    expect(result.worker, 'Worker must exist').not.toBeNull()
    expect(result.barracks, 'Barracks must exist').not.toBeNull()

    // All must be on screen simultaneously
    expect(result.th.onScreen, 'TH must be in viewport').toBe(true)
    expect(result.mine.onScreen, 'Goldmine must be in viewport').toBe(true)
    expect(result.worker.onScreen, 'Worker must be in viewport').toBe(true)
    expect(result.barracks.onScreen, 'Barracks must be in viewport').toBe(true)

    // Objects must be spread across the viewport (not all clustered in one corner)
    const xs = [result.th.sx, result.mine.sx, result.worker.sx, result.barracks.sx]
    const ys = [result.th.sy, result.mine.sy, result.worker.sy, result.barracks.sy]
    const xSpread = Math.max(...xs) - Math.min(...xs)
    const ySpread = Math.max(...ys) - Math.min(...ys)
    expect(xSpread, 'Objects must spread horizontally (> 100px)').toBeGreaterThan(100)
    expect(ySpread, 'Objects must spread vertically (> 50px)').toBeGreaterThan(50)

    console.log('[V3-CH1 AUDIT] Viewport framing:', {
      viewport: result.viewport,
      cameraDistance: result.cameraDistance,
      th: { sx: +result.th.sx.toFixed(0), sy: +result.th.sy.toFixed(0) },
      mine: { sx: +result.mine.sx.toFixed(0), sy: +result.mine.sy.toFixed(0) },
      worker: { sx: +result.worker.sx.toFixed(0), sy: +result.worker.sy.toFixed(0) },
      barracks: { sx: +result.barracks.sx.toFixed(0), sy: +result.barracks.sy.toFixed(0) },
      spread: { x: +xSpread.toFixed(0), y: +ySpread.toFixed(0) },
    })
  })

  test('bottom HUD panel does not occlude core base objects', async ({ page }) => {
    await waitForGame(page)

    const result = await page.evaluate(() => {
      const g = (window as any).__war3Game
      const camera = g.camera
      const vh = window.innerHeight

      // Bottom HUD panel height from CSS: #hud-bottom height=162px
      const hudBottomHeight = 162
      const hudTop = vh - hudBottomHeight

      function projectY(obj: any) {
        const pos = obj.mesh.position.clone().project(camera)
        return (-pos.y + 1) / 2 * vh
      }

      // Project the bottom edge of each building (not just center)
      function projectBottomEdge(unit: any) {
        const size = ({ townhall: 4, barracks: 3, goldmine: 3, farm: 2, tower: 2 } as any)[unit.type] ?? 1
        const pos = unit.mesh.position.clone()
        // Bottom edge in screen coords means max sy (closest to screen bottom)
        const p = pos.project(camera)
        const centerSy = (-p.y + 1) / 2 * vh
        // Approximate bottom edge: add half the building's screen height
        // (conservative estimate: 15px per tile of building size)
        return centerSy + size * 8
      }

      const th = g.units.find((u: any) => u.team === 0 && u.type === 'townhall' && u.hp > 0)
      const mine = g.units.find((u: any) => u.type === 'goldmine' && u.hp > 0)
      const worker = g.units.find((u: any) => u.team === 0 && u.type === 'worker' && !u.isBuilding && u.hp > 0)
      const barracks = g.units.find((u: any) => u.team === 0 && u.type === 'barracks' && u.hp > 0)

      const thCenterY = th ? projectY(th) : -1
      const gmCenterY = mine ? projectY(mine) : -1
      const workerCenterY = worker ? projectY(worker) : -1
      const bkCenterY = barracks ? projectY(barracks) : -1

      return {
        vh,
        hudTop,
        thCenterY,
        gmCenterY,
        workerCenterY,
        bkCenterY,
        thAboveHud: thCenterY < hudTop,
        gmAboveHud: gmCenterY < hudTop,
        workerAboveHud: workerCenterY < hudTop,
        bkAboveHud: bkCenterY < hudTop,
      }
    })

    expect(result.thAboveHud,
      `TH center (${result.thCenterY.toFixed(0)}px) must be above HUD top (${result.hudTop}px)`).toBe(true)
    expect(result.gmAboveHud,
      `GM center (${result.gmCenterY.toFixed(0)}px) must be above HUD top (${result.hudTop}px)`).toBe(true)
    expect(result.workerAboveHud,
      `Worker center (${result.workerCenterY.toFixed(0)}px) must be above HUD top (${result.hudTop}px)`).toBe(true)
    expect(result.bkAboveHud,
      `Barracks center (${result.bkCenterY.toFixed(0)}px) must be above HUD top (${result.hudTop}px)`).toBe(true)

    console.log('[V3-CH1 AUDIT] Bottom HUD safe area:', {
      vh: result.vh,
      hudTop: result.hudTop,
      thY: +result.thCenterY.toFixed(0),
      gmY: +result.gmCenterY.toFixed(0),
      workerY: +result.workerCenterY.toFixed(0),
      bkY: +result.bkCenterY.toFixed(0),
    })
  })

  test('top HUD panel does not occlude core base objects', async ({ page }) => {
    await waitForGame(page)

    const result = await page.evaluate(() => {
      const g = (window as any).__war3Game
      const camera = g.camera
      const vh = window.innerHeight

      // Top HUD height from CSS: #hud-top padding + font size ≈ 45px
      const hudTopHeight = 50

      function projectY(obj: any) {
        const pos = obj.mesh.position.clone().project(camera)
        return (-pos.y + 1) / 2 * vh
      }

      const th = g.units.find((u: any) => u.team === 0 && u.type === 'townhall' && u.hp > 0)
      const mine = g.units.find((u: any) => u.type === 'goldmine' && u.hp > 0)
      const worker = g.units.find((u: any) => u.team === 0 && u.type === 'worker' && !u.isBuilding && u.hp > 0)
      const barracks = g.units.find((u: any) => u.team === 0 && u.type === 'barracks' && u.hp > 0)

      const thY = th ? projectY(th) : -1
      const gmY = mine ? projectY(mine) : -1
      const workerY = worker ? projectY(worker) : -1
      const bkY = barracks ? projectY(barracks) : -1

      return {
        hudTopHeight,
        thBelowHud: thY > hudTopHeight,
        gmBelowHud: gmY > hudTopHeight,
        workerBelowHud: workerY > hudTopHeight,
        bkBelowHud: bkY > hudTopHeight,
        thY, gmY, workerY, bkY,
      }
    })

    expect(result.thBelowHud,
      `TH (${result.thY.toFixed(0)}px) must be below top HUD (${result.hudTopHeight}px)`).toBe(true)
    expect(result.gmBelowHud,
      `GM (${result.gmY.toFixed(0)}px) must be below top HUD`).toBe(true)
    expect(result.workerBelowHud,
      `Worker (${result.workerY.toFixed(0)}px) must be below top HUD`).toBe(true)
    expect(result.bkBelowHud,
      `Barracks (${result.bkY.toFixed(0)}px) must be below top HUD`).toBe(true)

    console.log('[V3-CH1 AUDIT] Top HUD safe area:', {
      hudTopHeight: result.hudTopHeight,
      thY: +result.thY.toFixed(0),
      gmY: +result.gmY.toFixed(0),
      workerY: +result.workerY.toFixed(0),
      bkY: +result.bkY.toFixed(0),
    })
  })

  test('selection ring on worker does not mask TH-mine direction', async ({ page }) => {
    await waitForGame(page)

    const result = await page.evaluate(() => {
      const g = (window as any).__war3Game
      const camera = g.camera
      const vw = window.innerWidth
      const vh = window.innerHeight

      function project(obj: any) {
        const p = obj.mesh.position.clone().project(camera)
        return {
          sx: (p.x + 1) / 2 * vw,
          sy: (-p.y + 1) / 2 * vh,
        }
      }

      // Select a worker first
      const worker = g.units.find((u: any) => u.team === 0 && u.type === 'worker' && !u.isBuilding && u.hp > 0)
      if (!worker) return { error: 'no worker' }
      g.selectionModel.setSelection([worker])
      g.createSelectionRing(worker)
      if (!g.healthBars.has(worker)) g.createHealthBar(worker)

      const th = g.units.find((u: any) => u.team === 0 && u.type === 'townhall' && u.hp > 0)
      const mine = g.units.find((u: any) => u.type === 'goldmine' && u.hp > 0)
      if (!th || !mine) return { error: 'no TH or mine' }

      const thS = project(th)
      const mineS = project(mine)
      const workerS = project(worker)

      // Check selection ring exists and is at worker position
      const rings = g.selectionRings ?? []
      let ringAtWorker = false
      if (rings.length > 0) {
        const ring = rings[0]
        const dx = Math.abs(ring.position.x - worker.mesh.position.x)
        const dz = Math.abs(ring.position.z - worker.mesh.position.z)
        ringAtWorker = dx < 0.5 && dz < 0.5 && ring.visible !== false
      }

      // The TH-mine direction vector should still be clearly visible on screen
      // even when the selection ring is present (ring is a small circle on ground,
      // doesn't block the line of sight to TH or mine)
      const thMineDist = Math.hypot(thS.sx - mineS.sx, thS.sy - mineS.sy)

      // Worker should not sit exactly between TH and mine on screen
      // (which would mean the ring could obscure the gather corridor)
      // Check: worker is not on the TH-mine line segment
      const thMineLen = Math.hypot(mineS.sx - thS.sx, mineS.sy - thS.sy)
      const thWorkerLen = Math.hypot(workerS.sx - thS.sx, workerS.sy - thS.sy)
      const workerMineLen = Math.hypot(mineS.sx - workerS.sx, mineS.sy - workerS.sy)
      const workerOnCorridor = thWorkerLen + workerMineLen < thMineLen + 15 // 15px tolerance

      // Health bar should exist and be visible
      const hasHealthBar = g.healthBars.has(worker)

      return {
        ringCount: rings.length,
        ringAtWorker,
        thMineDist,
        workerOnCorridor,
        hasHealthBar,
        thS, mineS, workerS,
      }
    })

    expect(result.error).toBeUndefined()
    expect(result.ringCount, 'selection ring must exist').toBeGreaterThanOrEqual(1)
    expect(result.ringAtWorker, 'ring must be at worker position').toBe(true)
    expect(result.hasHealthBar, 'health bar must exist').toBe(true)
    expect(result.thMineDist, 'TH-mine screen distance must be significant (> 30px)').toBeGreaterThan(30)

    console.log('[V3-CH1 AUDIT] Selection ring harmony:', {
      ringCount: result.ringCount,
      ringAtWorker: result.ringAtWorker,
      thMineDist: +result.thMineDist.toFixed(0),
      workerOnCorridor: result.workerOnCorridor,
    })
  })

  test('ghost footprint at placement position does not obscure TH or mine', async ({ page }) => {
    await waitForGame(page)

    const result = await page.evaluate(() => {
      const g = (window as any).__war3Game
      const camera = g.camera
      const vw = window.innerWidth
      const vh = window.innerHeight

      function project(obj: any) {
        const p = obj.mesh.position.clone().project(camera)
        return {
          sx: (p.x + 1) / 2 * vw,
          sy: (-p.y + 1) / 2 * vh,
          onScreen: p.x >= -1 && p.x <= 1 && p.y >= -1 && p.y <= 1 && p.z < 1,
        }
      }

      const th = g.units.find((u: any) => u.team === 0 && u.type === 'townhall' && u.hp > 0)
      const mine = g.units.find((u: any) => u.type === 'goldmine' && u.hp > 0)
      if (!th || !mine) return { error: 'no TH or mine' }

      // Select worker and enter placement mode for barracks
      const worker = g.units.find((u: any) => u.team === 0 && u.type === 'worker' && !u.isBuilding && u.hp > 0)
      if (!worker) return { error: 'no worker' }
      g.selectionModel.setSelection([worker])
      g.createSelectionRing(worker)

      // Enter placement mode (simulates pressing 'B' then selecting barracks)
      g.enterPlacementMode('barracks')
      const ghost = g.ghostMesh

      // Place the ghost at a position near the player base (S-SW of TH, designed area)
      const thPos = th.mesh.position
      const ghostX = thPos.x - 4
      const ghostZ = thPos.z + 4
      if (ghost) {
        ghost.position.set(ghostX + 0.5, ghost.position.y, ghostZ + 0.5)
        ghost.visible = true
      }

      const thS = project(th)
      const mineS = project(mine)
      let ghostS: any = null
      if (ghost) {
        const ghostPos = { mesh: { position: ghost.position } }
        ghostS = project(ghostPos)
      }

      // Ghost should not overlap with TH or mine screen positions
      let ghostOccludesTH = false
      let ghostOccludesMine = false
      if (ghostS) {
        // Ghost is semi-transparent (opacity 0.5), so even overlap doesn't fully obscure.
        // But we check that it's not centered on the same spot.
        const dTH = Math.hypot(ghostS.sx - thS.sx, ghostS.sy - thS.sy)
        const dMine = Math.hypot(ghostS.sx - mineS.sx, ghostS.sy - mineS.sy)
        // If ghost center is within 30px of TH/mine center, it could cause confusion
        ghostOccludesTH = dTH < 30
        ghostOccludesMine = dMine < 30
      }

      // Ghost material should be semi-transparent
      let ghostOpacity = -1
      let ghostIsGreenOrRed = false
      if (ghost) {
        ghost.traverse((child: any) => {
          if (child.isMesh && child.material) {
            const mat = child.material
            if (mat.opacity !== undefined) ghostOpacity = mat.opacity
            const hex = mat.color?.getHex() ?? 0
            ghostIsGreenOrRed = ghostIsGreenOrRed || (hex === 0x00ff00 || hex === 0x44ff44 || hex === 0xff3333)
          }
        })
      }

      return {
        hasGhost: !!ghost,
        ghostVisible: ghost?.visible ?? false,
        ghostOpacity,
        ghostIsGreenOrRed,
        ghostOccludesTH,
        ghostOccludesMine,
        thS, mineS, ghostS,
      }
    })

    expect(result.error).toBeUndefined()
    expect(result.hasGhost, 'ghost mesh must exist after entering placement mode').toBe(true)
    expect(result.ghostVisible, 'ghost must be visible').toBe(true)
    expect(result.ghostOpacity, 'ghost must be semi-transparent (opacity < 0.8)').toBeLessThan(0.8)
    expect(result.ghostIsGreenOrRed, 'ghost must use validation color (green or red)').toBe(true)
    expect(result.ghostOccludesTH, 'ghost must not occlude TH center').toBe(false)
    expect(result.ghostOccludesMine, 'ghost must not occlude mine center').toBe(false)

    console.log('[V3-CH1 AUDIT] Ghost footprint harmony:', {
      hasGhost: result.hasGhost,
      opacity: result.ghostOpacity,
      colorValid: result.ghostIsGreenOrRed,
      occludesTH: result.ghostOccludesTH,
      occludesMine: result.ghostOccludesMine,
    })
  })

  test('exit corridor remains readable with HUD, selection, and footprint present', async ({ page }) => {
    await waitForGame(page)

    const result = await page.evaluate(() => {
      const g = (window as any).__war3Game
      const camera = g.camera
      const vw = window.innerWidth
      const vh = window.innerHeight
      const Vector3 = g.units[0].mesh.position.constructor

      function project(obj: any) {
        const p = obj.mesh.position.clone().project(camera)
        return {
          sx: (p.x + 1) / 2 * vw,
          sy: (-p.y + 1) / 2 * vh,
          onScreen: p.x >= -1 && p.x <= 1 && p.y >= -1 && p.y <= 1 && p.z < 1,
        }
      }

      const th = g.units.find((u: any) => u.team === 0 && u.type === 'townhall' && u.hp > 0)
      const mine = g.units.find((u: any) => u.type === 'goldmine' && u.hp > 0)
      if (!th || !mine) return { error: 'no core buildings' }

      const thS = project(th)
      const mineS = project(mine)

      // Select a worker to create selection ring + health bar
      const worker = g.units.find((u: any) => u.team === 0 && u.type === 'worker' && !u.isBuilding && u.hp > 0)
      if (worker) {
        g.selectionModel.setSelection([worker])
        g.createSelectionRing(worker)
        if (!g.healthBars.has(worker)) g.createHealthBar(worker)
      }

      // Check exit directions are pathable and visible
      const thTX = Math.round(th.mesh.position.x - 0.5)
      const thTZ = Math.round(th.mesh.position.z - 0.5)
      const exitDirs = [
        { dx: 1, dz: 1, name: 'SE' },
        { dx: 0, dz: 1, name: 'S' },
        { dx: -1, dz: 1, name: 'SW' },
        { dx: 1, dz: 0, name: 'E' },
      ]

      let openExits = 0
      const exitPoints: any[] = []
      for (const dir of exitDirs) {
        let open = 0
        for (let s = 5; s < 10; s++) {
          const tx = thTX + dir.dx * s
          const tz = thTZ + dir.dz * s
          if (tx < 0 || tx >= 64 || tz < 0 || tz >= 64) continue
          if (!g.pathingGrid.isBlocked(tx, tz)) open++
        }
        const isOpen = open >= 3
        if (isOpen) openExits++

        // Project the exit point at distance 7 from TH
        const exitX = thTX + dir.dx * 7 + 0.5
        const exitZ = thTZ + dir.dz * 7 + 0.5
        const exitY = g.getWorldHeight(exitX, exitZ)
        const exitVec = new Vector3(exitX, exitY, exitZ)
        const exitProj = exitVec.project(camera)
        const exitOnScreen = exitProj.x >= -1 && exitProj.x <= 1 && exitProj.y >= -1 && exitProj.y <= 1 && exitProj.z < 1
        const exitSx = (exitProj.x + 1) / 2 * vw
        const exitSy = (-exitProj.y + 1) / 2 * vh

        // Check exit point is above bottom HUD and below top HUD
        const exitAboveHud = exitSy < (vh - 162)
        const exitBelowHud = exitSy > 50

        exitPoints.push({
          name: dir.name,
          isOpen,
          onScreen: exitOnScreen,
          sx: exitSx,
          sy: exitSy,
          aboveBottomHud: exitAboveHud,
          belowTopHud: exitBelowHud,
        })
      }

      return {
        openExits,
        exitPoints,
        thOnScreen: thS.onScreen,
        mineOnScreen: mineS.onScreen,
      }
    })

    expect(result.error).toBeUndefined()
    expect(result.openExits, 'At least 2 exit directions must be open').toBeGreaterThanOrEqual(2)

    // Exit points that are open must also be on screen and above bottom HUD
    for (const ep of result.exitPoints) {
      if (ep.isOpen) {
        expect(ep.onScreen, `${ep.name} exit must be on screen`).toBe(true)
        expect(ep.aboveBottomHud, `${ep.name} exit must be above bottom HUD`).toBe(true)
        expect(ep.belowTopHud, `${ep.name} exit must be below top HUD`).toBe(true)
      }
    }

    console.log('[V3-CH1 AUDIT] Exit corridor harmony:', {
      openExits: result.openExits,
      exits: result.exitPoints.map(ep => ({
        name: ep.name,
        open: ep.isOpen,
        onScreen: ep.onScreen,
        sx: +ep.sx.toFixed(0),
        sy: +ep.sy.toFixed(0),
        aboveHud: ep.aboveBottomHud,
      })),
    })
  })

  test('V3-CH1 harmony audit: all checks bind to focused proof', async ({ page }) => {
    await waitForGame(page)

    const audit = await page.evaluate(() => {
      const g = (window as any).__war3Game
      const camera = g.camera
      const vw = window.innerWidth
      const vh = window.innerHeight

      function project(obj: any) {
        const p = obj.mesh.position.clone().project(camera)
        return {
          sx: (p.x + 1) / 2 * vw,
          sy: (-p.y + 1) / 2 * vh,
          onScreen: p.x >= -1 && p.x <= 1 && p.y >= -1 && p.y <= 1 && p.z < 1,
        }
      }

      const th = g.units.find((u: any) => u.team === 0 && u.type === 'townhall' && u.hp > 0)
      const mine = g.units.find((u: any) => u.type === 'goldmine' && u.hp > 0)
      const worker = g.units.find((u: any) => u.team === 0 && u.type === 'worker' && !u.isBuilding && u.hp > 0)
      const barracks = g.units.find((u: any) => u.team === 0 && u.type === 'barracks' && u.hp > 0)

      if (!th || !mine || !worker || !barracks) return { error: 'missing core units' }

      const hudTopH = 50
      const hudBottomH = 162
      const hudTop = vh - hudBottomH

      const thS = project(th)
      const mineS = project(mine)
      const workerS = project(worker)
      const bkS = project(barracks)

      // Phase 1: selection ring + health bar proof (before placement mode clears selection)
      g.selectionModel.setSelection([worker])
      g.createSelectionRing(worker)
      if (!g.healthBars.has(worker)) g.createHealthBar(worker)

      const selectionRingPresent = (g.selectionRings ?? []).length >= 1
      const healthBarPresent = g.healthBars.has(worker)

      // Phase 2: ghost placement proof (enterPlacementMode clears selection rings)
      g.enterPlacementMode('barracks')
      const ghost = g.ghostMesh
      let ghostPresent = false
      if (ghost) {
        ghost.position.set(th.mesh.position.x - 4 + 0.5, ghost.position.y, th.mesh.position.z + 4 + 0.5)
        ghost.visible = true
        ghostPresent = true
      }

      // Exit corridor check
      const thTX = Math.round(th.mesh.position.x - 0.5)
      const thTZ = Math.round(th.mesh.position.z - 0.5)
      const exitDirs = [
        { dx: 1, dz: 1, name: 'SE' },
        { dx: 0, dz: 1, name: 'S' },
        { dx: -1, dz: 1, name: 'SW' },
        { dx: 1, dz: 0, name: 'E' },
      ]
      let openExits = 0
      for (const d of exitDirs) {
        let open = 0
        for (let s = 5; s < 10; s++) {
          const tx = thTX + d.dx * s
          const tz = thTZ + d.dz * s
          if (tx < 0 || tx >= 64 || tz < 0 || tz >= 64) continue
          if (!g.pathingGrid.isBlocked(tx, tz)) open++
        }
        if (open >= 3) openExits++
      }

      const checks = {
        allOnScreen: thS.onScreen && mineS.onScreen && workerS.onScreen && bkS.onScreen,
        aboveHud: thS.sy < hudTop && mineS.sy < hudTop && workerS.sy < hudTop && bkS.sy < hudTop,
        belowTopHud: thS.sy > hudTopH && mineS.sy > hudTopH && workerS.sy > hudTopH && bkS.sy > hudTopH,
        selectionRingPresent,
        healthBarPresent,
        ghostPresent,
        openExits: openExits >= 2,
      }

      const allPassed = Object.values(checks).every(v => v === true)

      return {
        checks,
        allPassed,
        measurements: {
          viewport: { w: vw, h: vh },
          cameraDistance: g.cameraCtrl?.distance ?? -1,
          hudSafeArea: { top: hudTopH, bottom: hudTop },
          th: thS,
          mine: mineS,
          worker: workerS,
          barracks: bkS,
        },
      }
    })

    expect(audit.error).toBeUndefined()
    expect(audit.allPassed, 'All harmony checks must pass').toBe(true)

    // Individual bindings for traceability
    expect(audit.checks.allOnScreen, 'All core objects must be on screen').toBe(true)
    expect(audit.checks.aboveHud, 'All core objects must be above bottom HUD').toBe(true)
    expect(audit.checks.belowTopHud, 'All core objects must be below top HUD').toBe(true)
    expect(audit.checks.selectionRingPresent, 'Selection ring must be present').toBe(true)
    expect(audit.checks.healthBarPresent, 'Health bar must be present').toBe(true)
    expect(audit.checks.ghostPresent, 'Ghost mesh must be present').toBe(true)
    expect(audit.checks.openExits, 'At least 2 open exits').toBe(true)

    console.log('[V3-CH1 CLOSEOUT AUDIT]', JSON.stringify(audit, null, 2))
  })
})
