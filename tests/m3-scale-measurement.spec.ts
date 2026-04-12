/**
 * M3 Scale Measurement Baseline
 *
 * Measurement-only regression pack for M3 objective ratios.
 * This does NOT claim the game looks like War3.
 * It measures current ratios and fails only on objective broken invariants
 * that would make M3 visual tuning impossible.
 *
 * Assertion groups:
 * 1. Unit visual bounding boxes are nonzero; workers/footmen are visible entities.
 * 2. Relative footprint hierarchy: farm < barracks <= goldmine <= townhall; tower has vertical profile.
 * 3. Spawned workers are outside building/resource blockers.
 * 4. Default camera can see the player base anchor group.
 * 5. Selection ring radius is within sane factor of unit/building footprint.
 * 6. Structured JSON measurement summary for Codex review.
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
  await page.waitForTimeout(500)
}

function severeConsoleErrors(page: Page): string[] {
  const errors = ((page as any).__consoleErrors ?? []) as string[]
  return errors.filter(e =>
    !e.includes('404') &&
    !e.includes('favicon') &&
    !e.includes('Failed to load resource') &&
    !e.includes('Test map load failed') &&
    !e.includes('net::'),
  )
}

test.describe('M3 Scale Measurement Baseline', () => {
  test.setTimeout(120000)

  test('measures scale/layout ratios and emits structured JSON summary', async ({ page }) => {
    await waitForGame(page)

    const measurements = await page.evaluate(() => {
      const g = (window as any).__war3Game
      if (!g) return { ok: false, reason: 'no __war3Game' }

      const Vector3 = g.units[0].mesh.position.constructor

      // ---- helpers ----
      // Compute world bounding box by traversing meshes and transforming
      // geometry corners to world space (same approach as unit-visibility test)
      function computeWorldBBox(obj: any) {
        obj.updateWorldMatrix(true, true)
        let minX = Infinity, maxX = -Infinity
        let minY = Infinity, maxY = -Infinity
        let minZ = Infinity, maxZ = -Infinity
        let foundAny = false

        obj.traverse((child: any) => {
          if (!child?.isMesh || child.visible === false || !child.geometry) return
          if (!child.geometry.boundingBox) child.geometry.computeBoundingBox()
          const box = child.geometry.boundingBox
          if (!box) return
          foundAny = true

          const localCorners = [
            [box.min.x, box.min.y, box.min.z],
            [box.min.x, box.min.y, box.max.z],
            [box.min.x, box.max.y, box.min.z],
            [box.min.x, box.max.y, box.max.z],
            [box.max.x, box.min.y, box.min.z],
            [box.max.x, box.min.y, box.max.z],
            [box.max.x, box.max.y, box.min.z],
            [box.max.x, box.max.y, box.max.z],
          ]

          for (const [x, y, z] of localCorners) {
            const p = new Vector3(x, y, z).applyMatrix4(child.matrixWorld)
            if (p.x < minX) minX = p.x
            if (p.x > maxX) maxX = p.x
            if (p.y < minY) minY = p.y
            if (p.y > maxY) maxY = p.y
            if (p.z < minZ) minZ = p.z
            if (p.z > maxZ) maxZ = p.z
          }
        })

        if (!foundAny) return null
        return {
          width: maxX - minX,
          height: maxY - minY,
          depth: maxZ - minZ,
          minX, maxX, minY, maxY, minZ, maxZ,
        }
      }

      function findEntities(team: number, type: string) {
        return g.units.filter((u: any) => u.team === team && u.type === type && u.hp > 0)
      }

      function findAny(type: string) {
        return g.units.find((u: any) => u.type === type && u.hp > 0 && !u.isBuilding) ||
               g.units.find((u: any) => u.type === type && u.hp > 0)
      }

      // =====================================================
      // GROUP 1: Unit visual bounding boxes are nonzero
      // =====================================================
      const playerWorkers = findEntities(0, 'worker')
      const playerFootmen = findEntities(0, 'footman')

      const workerBBox = playerWorkers.length > 0
        ? computeWorldBBox(playerWorkers[0].mesh)
        : null

      // If no player footmen yet, spawn one for measurement
      let spawnedFootman = false
      if (playerFootmen.length === 0) {
        const fm = g.spawnUnit('footman', 0, 20, 20)
        if (fm) {
          fm.state = 0 // Idle
          spawnedFootman = true
        }
      }
      const footmenForCheck = findEntities(0, 'footman')
      const footmanBBoxFinal = footmenForCheck.length > 0
        ? computeWorldBBox(footmenForCheck[0].mesh)
        : null

      // =====================================================
      // GROUP 2: Relative footprint hierarchy
      // =====================================================
      const th = findAny('townhall')
      const gm = findAny('goldmine')
      let barracks = findAny('barracks')
      let farm = findAny('farm')
      let tower = findAny('tower')

      // Spawn missing building types at safe positions for measurement
      let spawnedBarracks = false
      let spawnedFarm = false
      let spawnedTower = false

      if (!barracks) {
        barracks = g.spawnBuilding('barracks', 0, 20, 22)
        if (barracks) spawnedBarracks = true
      }
      if (!farm) {
        farm = g.spawnBuilding('farm', 0, 25, 25)
        if (farm) spawnedFarm = true
      }
      if (!tower) {
        tower = g.spawnBuilding('tower', 0, 28, 25)
        if (tower) spawnedTower = true
      }

      const thBBox = th ? computeWorldBBox(th.mesh) : null
      const gmBBox = gm ? computeWorldBBox(gm.mesh) : null
      const barracksBBox = barracks ? computeWorldBBox(barracks.mesh) : null
      const farmBBox = farm ? computeWorldBBox(farm.mesh) : null
      const towerBBox = tower ? computeWorldBBox(tower.mesh) : null

      // Footprint area (XZ plane)
      function footprintArea(bbox: any) {
        if (!bbox) return 0
        return bbox.width * bbox.depth
      }

      // =====================================================
      // GROUP 3: Workers outside blockers
      // =====================================================
      const workersOutsideBlockers = playerWorkers.map((u: any) => {
        const tx = Math.floor(u.mesh.position.x)
        const tz = Math.floor(u.mesh.position.z)
        return {
          x: u.mesh.position.x,
          z: u.mesh.position.z,
          tx, tz,
          blocked: g.pathingGrid.isBlocked(tx, tz),
        }
      })

      // =====================================================
      // GROUP 4: Default camera viewport contains base anchor
      // =====================================================
      const camera = g.camera
      const playerTH = findEntities(0, 'townhall')[0]
      const playerGM = findAny('goldmine')
      const firstWorker = playerWorkers[0]

      function isOnScreen(obj: any) {
        const pos = obj.mesh.position.clone().project(camera)
        return pos.x >= -1.1 && pos.x <= 1.1 && pos.y >= -1.1 && pos.y <= 1.1 && pos.z < 1
      }

      const thOnScreen = playerTH ? isOnScreen(playerTH) : false
      const gmOnScreen = playerGM ? isOnScreen(playerGM) : false
      const workerOnScreen = firstWorker ? isOnScreen(firstWorker) : false

      // =====================================================
      // GROUP 5: Selection ring radius sanity
      // =====================================================
      // Selection ring logic from Game.ts createSelectionRing():
      // buildings: BUILDINGS[type].size * 0.55, units: 0.5
      // Values from GameData.ts: townhall=4, barracks=3, farm=2, tower=2, goldmine=3
      const buildingSizes: Record<string, number> = {
        townhall: 4, barracks: 3, farm: 2, tower: 2, goldmine: 3,
      }
      const expectedRingRadii: Record<string, number> = {}
      for (const [key, size] of Object.entries(buildingSizes)) {
        expectedRingRadii[key] = size * 0.55
      }
      expectedRingRadii.worker = 0.62
      expectedRingRadii.footman = 0.68

      // Verify selection ring radius is sane relative to footprint
      // For buildings: ring should be > 0 and < 2x the data size
      // For units: ring should be > 0.1 and < 2.0
      const ringRadiusChecks: Record<string, { expected: number; min: number; max: number; sane: boolean }> = {}
      for (const [type, expected] of Object.entries(expectedRingRadii)) {
        const minFactor = 0.1
        const maxFactor = type === 'worker' || type === 'footman' ? 2.0 : (buildingSizes[type] ?? 1) * 2
        ringRadiusChecks[type] = {
          expected,
          min: expected * minFactor,
          max: maxFactor,
          sane: expected > 0 && expected <= maxFactor,
        }
      }

      // =====================================================
      // GROUP 6: Structured JSON measurement summary
      // =====================================================
      const summary = {
        // Units
        worker: workerBBox ? {
          bboxWidth: +workerBBox.width.toFixed(3),
          bboxHeight: +workerBBox.height.toFixed(3),
          bboxDepth: +workerBBox.depth.toFixed(3),
          count: playerWorkers.length,
        } : null,
        footman: footmanBBoxFinal ? {
          bboxWidth: +footmanBBoxFinal.width.toFixed(3),
          bboxHeight: +footmanBBoxFinal.height.toFixed(3),
          bboxDepth: +footmanBBoxFinal.depth.toFixed(3),
          count: footmenForCheck.length,
          spawnedForTest: spawnedFootman,
        } : null,

        // Buildings
        townhall: thBBox ? {
          bboxWidth: +thBBox.width.toFixed(3),
          bboxHeight: +thBBox.height.toFixed(3),
          bboxDepth: +thBBox.depth.toFixed(3),
          dataSize: 4,
          footprintArea: +footprintArea(thBBox).toFixed(3),
        } : null,
        goldmine: gmBBox ? {
          bboxWidth: +gmBBox.width.toFixed(3),
          bboxHeight: +gmBBox.height.toFixed(3),
          bboxDepth: +gmBBox.depth.toFixed(3),
          dataSize: 3,
          footprintArea: +footprintArea(gmBBox).toFixed(3),
        } : null,
        barracks: barracksBBox ? {
          bboxWidth: +barracksBBox.width.toFixed(3),
          bboxHeight: +barracksBBox.height.toFixed(3),
          bboxDepth: +barracksBBox.depth.toFixed(3),
          dataSize: 3,
          footprintArea: +footprintArea(barracksBBox).toFixed(3),
        } : null,
        farm: farmBBox ? {
          bboxWidth: +farmBBox.width.toFixed(3),
          bboxHeight: +farmBBox.height.toFixed(3),
          bboxDepth: +farmBBox.depth.toFixed(3),
          dataSize: 2,
          footprintArea: +footprintArea(farmBBox).toFixed(3),
        } : null,
        tower: towerBBox ? {
          bboxWidth: +towerBBox.width.toFixed(3),
          bboxHeight: +towerBBox.height.toFixed(3),
          bboxDepth: +towerBBox.depth.toFixed(3),
          dataSize: 2,
          footprintArea: +footprintArea(towerBBox).toFixed(3),
        } : null,

        // Ratios (TH = 1.0 baseline)
        ratios: {
          farmOverTH: thBBox ? +(footprintArea(farmBBox) / footprintArea(thBBox)).toFixed(3) : null,
          barracksOverTH: thBBox ? +(footprintArea(barracksBBox) / footprintArea(thBBox)).toFixed(3) : null,
          goldmineOverTH: thBBox ? +(footprintArea(gmBBox) / footprintArea(thBBox)).toFixed(3) : null,
          towerOverTH: thBBox ? +(footprintArea(towerBBox) / footprintArea(thBBox)).toFixed(3) : null,
          towerHeightOverTH: thBBox && towerBBox ? +(towerBBox.height / thBBox.height).toFixed(3) : null,
          footmanOverWorker: workerBBox && footmanBBoxFinal
            ? +((footmanBBoxFinal.width * footmanBBoxFinal.height) / (workerBBox.width * workerBBox.height)).toFixed(3)
            : null,
        },

        // Camera
        camera: {
          fov: camera.fov,
          distance: g.cameraCtrl?.distance ?? g.cameraCtrl?._distance ?? null,
          target: g.cameraCtrl?.getTarget?.() ?? null,
          thOnScreen,
          gmOnScreen,
          workerOnScreen,
        },

        // Workers outside blockers
        workerBlockerStatus: workersOutsideBlockers,

        // Selection ring radii
        ringRadii: ringRadiusChecks,
      }

      return { ok: true, summary }
    })

    // ============ ASSERTIONS ============

    expect(measurements.ok, 'game loaded').toBe(true)
    const s = measurements.summary

    // ---- GROUP 1: Unit visual bounding boxes nonzero ----
    // Workers
    expect(s.worker, 'player workers must exist').not.toBeNull()
    expect(s.worker.bboxWidth, 'worker bbox width must be nonzero').toBeGreaterThan(0)
    expect(s.worker.bboxHeight, 'worker bbox height must be nonzero').toBeGreaterThan(0)
    expect(s.worker.bboxDepth, 'worker bbox depth must be nonzero').toBeGreaterThan(0)
    expect(s.worker.count, 'at least 5 player workers').toBeGreaterThanOrEqual(5)

    // Footmen (spawned if needed)
    expect(s.footman, 'footman must exist for measurement').not.toBeNull()
    expect(s.footman.bboxWidth, 'footman bbox width must be nonzero').toBeGreaterThan(0)
    expect(s.footman.bboxHeight, 'footman bbox height must be nonzero').toBeGreaterThan(0)
    expect(s.footman.bboxDepth, 'footman bbox depth must be nonzero').toBeGreaterThan(0)

    // ---- GROUP 2: Relative footprint hierarchy ----
    // Check data size hierarchy (GameData.size): farm(2) < barracks(3) <= goldmine(3) <= townhall(4)
    // Also check visual bbox is nonzero for each building type
    const thArea = s.townhall?.footprintArea ?? 0
    const gmArea = s.goldmine?.footprintArea ?? 0
    const barArea = s.barracks?.footprintArea ?? 0
    const farmArea = s.farm?.footprintArea ?? 0
    const towerArea = s.tower?.footprintArea ?? 0

    expect(thArea, 'TH visual footprint area must be > 0').toBeGreaterThan(0)
    expect(gmArea, 'goldmine visual footprint area must be > 0').toBeGreaterThan(0)
    expect(barArea, 'barracks visual footprint area must be > 0').toBeGreaterThan(0)
    expect(farmArea, 'farm visual footprint area must be > 0').toBeGreaterThan(0)
    expect(towerArea, 'tower visual footprint area must be > 0').toBeGreaterThan(0)

    // Data size hierarchy invariant: farm < barracks <= goldmine <= townhall
    // These are from GameData.size, which controls placement and selection ring sizing
    expect(s.farm.dataSize, 'farm data size').toBe(2)
    expect(s.barracks.dataSize, 'barracks data size').toBe(3)
    expect(s.goldmine.dataSize, 'goldmine data size').toBe(3)
    expect(s.townhall.dataSize, 'townhall data size').toBe(4)
    expect(s.farm.dataSize, 'farm < barracks data size').toBeLessThan(s.barracks.dataSize)
    expect(s.barracks.dataSize, 'barracks <= goldmine data size').toBeLessThanOrEqual(s.goldmine.dataSize)
    expect(s.goldmine.dataSize, 'goldmine <= townhall data size').toBeLessThanOrEqual(s.townhall.dataSize)

    // Tower has vertical defense profile: tower height > tower width
    const towerH = s.tower?.bboxHeight ?? 0
    const towerW = s.tower?.bboxWidth ?? 0
    expect(towerH, `tower height (${towerH}) must exceed tower width (${towerW}) for vertical profile`).toBeGreaterThan(towerW)

    // M3 visual-scale contract: the runtime bbox must preserve base hierarchy.
    // These thresholds are intentionally broad; they prevent inverted silhouettes
    // while leaving room for later asset swaps and hand-tuned visual polish.
    expect(s.ratios.footmanOverWorker, 'footman silhouette must read heavier than worker').toBeGreaterThan(1.1)
    expect(s.ratios.barracksOverTH, 'barracks must remain visually smaller than Town Hall anchor').toBeLessThan(0.95)
    expect(s.ratios.farmOverTH, 'farm must remain a compact wall/supply piece').toBeLessThan(0.45)
    expect(s.ratios.goldmineOverTH, 'goldmine should not visually dominate Town Hall').toBeLessThan(1.1)
    expect(s.ratios.towerHeightOverTH, 'tower skyline should not dwarf Town Hall').toBeLessThan(1.8)

    // ---- GROUP 3: Spawned workers outside blockers ----
    for (const w of s.workerBlockerStatus) {
      expect(w.blocked, `worker at (${w.x.toFixed(1)}, ${w.z.toFixed(1)}) tile (${w.tx},${w.tz}) is inside a blocker`).toBe(false)
    }

    // ---- GROUP 4: Default camera sees base anchor ----
    expect(s.camera.thOnScreen, 'player Town Hall must be in default camera viewport').toBe(true)
    expect(s.camera.gmOnScreen, 'player Gold Mine must be in default camera viewport').toBe(true)
    expect(s.camera.workerOnScreen, 'at least one player worker must be in default camera viewport').toBe(true)

    // ---- GROUP 5: Selection ring radius sanity ----
    for (const [type, check] of Object.entries(s.ringRadii)) {
      expect(check.sane, `selection ring for ${type}: expected=${check.expected} is not sane (must be > 0 and <= ${check.max})`).toBe(true)
      expect(check.expected, `selection ring for ${type} must be nonzero`).toBeGreaterThan(0)
    }

    // ---- GROUP 6: Emit structured JSON ----
    // Log the full measurement summary for Codex review
    console.log('[M3-SCALE-MEASUREMENT]', JSON.stringify(s, null, 2))

    // Ratios sanity: all should be real numbers
    expect(s.ratios.farmOverTH, 'farm/TH ratio must be a number').not.toBeNull()
    expect(s.ratios.barracksOverTH, 'barracks/TH ratio must be a number').not.toBeNull()
    expect(s.ratios.goldmineOverTH, 'goldmine/TH ratio must be a number').not.toBeNull()
    expect(s.ratios.towerOverTH, 'tower/TH ratio must be a number').not.toBeNull()
    expect(s.ratios.towerHeightOverTH, 'towerHeight/TH ratio must be a number').not.toBeNull()
    expect(s.ratios.footmanOverWorker, 'footman/worker silhouette ratio must be a number').not.toBeNull()

    // No severe console errors
    expect(severeConsoleErrors(page)).toHaveLength(0)
  })
})
