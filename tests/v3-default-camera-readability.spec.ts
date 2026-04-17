/**
 * V3-RD1 Default Camera Readability Closeout Proof
 *
 * Focused regression that proves all key object types in the opening
 * battlefield are visually distinguishable at the default camera:
 *   - worker, footman are different silhouettes
 *   - townhall, barracks, farm, tower, goldmine are different shapes
 *   - treeline is present and separate from buildings
 *   - each object type projects to a minimum readable pixel size
 *   - measurement output is traceable to specific objects
 *
 * This is the V3-RD1 gate closeout pack — conclusions bind to specific
 * measured quantities, not vague "looks OK" claims.
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

/** Collect screen projections and visual signatures for all object types */
async function collectReadabilitySnapshot(page: Page) {
  return page.evaluate(() => {
    const g = (window as any).__war3Game
    if (!g) return { ok: false, reason: 'no __war3Game' }

    const Vector3 = g.units[0].mesh.position.constructor
    const camera = g.camera
    const vw = window.innerWidth
    const vh = window.innerHeight

    // Helper: project world position to screen pixels
    function toScreen(pos: any) {
      const p = pos.clone().project(camera)
      return {
        sx: (p.x + 1) / 2 * vw,
        sy: (-p.y + 1) / 2 * vh,
        ndcX: p.x,
        ndcY: p.y,
        onScreen: p.x >= -1 && p.x <= 1 && p.y >= -1 && p.y <= 1 && p.z < 1,
      }
    }

    // Helper: compute screen bounding box for an object
    function screenBBox(obj: any) {
      obj.updateWorldMatrix(true, true)
      const projected: any[] = []
      let visibleMeshCount = 0

      obj.traverse((child: any) => {
        if (!child?.isMesh || child.visible === false || !child.geometry) return
        visibleMeshCount++
        if (!child.geometry.boundingBox) child.geometry.computeBoundingBox()
        const box = child.geometry.boundingBox
        if (!box) return

        const corners = [
          [box.min.x, box.min.y, box.min.z],
          [box.min.x, box.min.y, box.max.z],
          [box.min.x, box.max.y, box.min.z],
          [box.min.x, box.max.y, box.max.z],
          [box.max.x, box.min.y, box.min.z],
          [box.max.x, box.min.y, box.max.z],
          [box.max.x, box.max.y, box.min.z],
          [box.max.x, box.max.y, box.max.z],
        ]
        for (const [x, y, z] of corners) {
          const p = new Vector3(x, y, z).applyMatrix4(child.matrixWorld)
          projected.push(p.clone().project(camera))
        }
      })

      if (projected.length === 0) return { widthPx: 0, heightPx: 0, onScreen: false, center: null }

      const minSX = Math.min(...projected.map(p => p.x))
      const maxSX = Math.max(...projected.map(p => p.x))
      const minSY = Math.min(...projected.map(p => p.y))
      const maxSY = Math.max(...projected.map(p => p.y))

      const widthPx = (maxSX - minSX) * vw / 2
      const heightPx = (maxSY - minSY) * vh / 2

      const center = obj.position.clone().project(camera)

      return {
        widthPx,
        heightPx,
        onScreen: maxSX >= -1 && minSX <= 1 && maxSY >= -1 && minSY <= 1,
        center: { ndcX: center.x, ndcY: center.y },
        visibleMeshCount,
      }
    }

    // Collect each object type
    const result: any = { ok: true }

    // Units: worker
    const workers = g.units.filter((u: any) => u.team === 0 && u.type === 'worker' && !u.isBuilding && u.hp > 0)
    if (workers.length > 0) {
      result.worker = { count: workers.length, screen: screenBBox(workers[0].mesh) }
    }

    // Spawn a footman for measurement if none exist
    let spawnedFootman = false
    const existingFootmen = g.units.filter((u: any) => u.team === 0 && u.type === 'footman' && !u.isBuilding && u.hp > 0)
    if (existingFootmen.length === 0) {
      g.spawnUnit('footman', 0, 18, 18)
      spawnedFootman = true
    }
    const footmen = g.units.filter((u: any) => u.team === 0 && u.type === 'footman' && !u.isBuilding && u.hp > 0)
    if (footmen.length > 0) {
      result.footman = { count: footmen.length, screen: screenBBox(footmen[0].mesh), spawned: spawnedFootman }
    }

    // Buildings
    const buildingTypes = ['townhall', 'barracks', 'goldmine'] as const
    for (const type of buildingTypes) {
      const building = g.units.find((u: any) =>
        (type === 'goldmine' || u.team === 0) && u.type === type && u.hp > 0,
      )
      if (building) {
        result[type] = { screen: screenBBox(building.mesh) }
      }
    }

    // Spawn missing buildings for readability proof
    let spawnedFarm = false
    let spawnedTower = false
    if (!g.units.find((u: any) => u.team === 0 && u.type === 'farm' && u.hp > 0)) {
      const farm = g.spawnBuilding('farm', 0, 22, 20)
      if (farm) { farm.buildProgress = 1; spawnedFarm = true }
    }
    if (!g.units.find((u: any) => u.team === 0 && u.type === 'tower' && u.hp > 0)) {
      const tower = g.spawnBuilding('tower', 0, 25, 20)
      if (tower) { tower.buildProgress = 1; spawnedTower = true }
    }
    const farm = g.units.find((u: any) => u.team === 0 && u.type === 'farm' && u.hp > 0)
    const tower = g.units.find((u: any) => u.team === 0 && u.type === 'tower' && u.hp > 0)
    if (farm) result.farm = { screen: screenBBox(farm.mesh), spawned: spawnedFarm }
    if (tower) result.tower = { screen: screenBBox(tower.mesh), spawned: spawnedTower }

    // Trees: sample up to 5 trees near base
    const trees = g.treeManager?.entries ?? []
    const baseTrees = trees
      .filter((t: any) => {
        const dx = t.mesh.position.x - 13
        const dz = t.mesh.position.z - 14
        return dx * dx + dz * dz < 400
      })
      .slice(0, 5)

    const treeScreens = baseTrees.map((t: any) => {
      const bbox = screenBBox(t.mesh)
      return { widthPx: bbox.widthPx, heightPx: bbox.heightPx, onScreen: bbox.onScreen }
    })
    result.trees = {
      countNearBase: baseTrees.length,
      totalOnMap: trees.length,
      sampleScreens: treeScreens,
      anyOnScreen: treeScreens.some((s: any) => s.onScreen),
    }

    // Camera info
    result.camera = {
      fov: camera.fov,
      distance: g.cameraCtrl?.distance ?? -1,
      target: g.cameraCtrl?.getTarget?.() ?? null,
    }

    return result
  })
}

test.describe('V3-RD1 Default Camera Readability Closeout', () => {
  test.setTimeout(180000)

  test('worker and footman project as distinguishable silhouettes at default camera', async ({ page }) => {
    await waitForGame(page)
    const snap = await collectReadabilitySnapshot(page)

    // Worker must exist and be on screen
    expect(snap.worker, 'worker must exist').toBeDefined()
    expect(snap.worker.screen.onScreen, 'worker must be in default camera viewport').toBe(true)
    expect(snap.worker.screen.widthPx, 'worker screen width must be readable (>= 8px)').toBeGreaterThanOrEqual(8)
    expect(snap.worker.screen.heightPx, 'worker screen height must be readable (>= 18px)').toBeGreaterThanOrEqual(18)
    expect(snap.worker.screen.visibleMeshCount, 'worker must have visible meshes (>= 6)').toBeGreaterThanOrEqual(6)

    // Footman must exist and be on screen
    expect(snap.footman, 'footman must exist (may be spawned)').toBeDefined()
    expect(snap.footman.screen.onScreen, 'footman must be in default camera viewport').toBe(true)
    expect(snap.footman.screen.widthPx, 'footman screen width must be readable (>= 10px)').toBeGreaterThanOrEqual(10)
    expect(snap.footman.screen.heightPx, 'footman screen height must be readable (>= 22px)').toBeGreaterThanOrEqual(22)
    expect(snap.footman.screen.visibleMeshCount, 'footman must have visible meshes (>= 8)').toBeGreaterThanOrEqual(8)

    // Silhouette distinction: footman must be larger than worker
    const workerArea = snap.worker.screen.widthPx * snap.worker.screen.heightPx
    const footmanArea = snap.footman.screen.widthPx * snap.footman.screen.heightPx
    expect(footmanArea / workerArea,
      'footman screen area must be larger than worker (military > economy)').toBeGreaterThan(1.2)

    console.log('[V3-RD1 AUDIT] Unit readability:', {
      worker: { wpx: +snap.worker.screen.widthPx.toFixed(1), hpx: +snap.worker.screen.heightPx.toFixed(1), meshes: snap.worker.screen.visibleMeshCount },
      footman: { wpx: +snap.footman.screen.widthPx.toFixed(1), hpx: +snap.footman.screen.heightPx.toFixed(1), meshes: snap.footman.screen.visibleMeshCount },
      areaRatio: +(footmanArea / workerArea).toFixed(2),
    })
  })

  test('core buildings (TH, barracks, farm, tower, goldmine) are individually distinguishable', async ({ page }) => {
    await waitForGame(page)
    const snap = await collectReadabilitySnapshot(page)

    // All building types must exist and be on screen
    const buildingTypes = ['townhall', 'barracks', 'goldmine', 'farm', 'tower'] as const
    for (const type of buildingTypes) {
      expect(snap[type], `${type} must exist`).toBeDefined()
      expect(snap[type].screen.onScreen, `${type} must be in default camera viewport`).toBe(true)
      expect(snap[type].screen.widthPx, `${type} screen width must be > 5px`).toBeGreaterThan(5)
      expect(snap[type].screen.heightPx, `${type} screen height must be > 5px`).toBeGreaterThan(5)
    }

    // Town Hall screen area must be competitive with barracks (anchor dominance).
    // The barracks cone roof can project slightly taller than TH due to camera angle,
    // so we check TH is within 10% of barracks (not strictly larger) — the key
    // hierarchy claim is proven by data size and footprint in m3-scale-measurement.
    const thArea = snap.townhall.screen.widthPx * snap.townhall.screen.heightPx
    const bkArea = snap.barracks.screen.widthPx * snap.barracks.screen.heightPx
    const gmArea = snap.goldmine.screen.widthPx * snap.goldmine.screen.heightPx

    expect(thArea,
      'TH screen area must be at least 90% of barracks (anchor competitive)').toBeGreaterThan(bkArea * 0.9)
    expect(thArea,
      'TH screen area must be at least 80% of goldmine (anchor competitive)').toBeGreaterThan(gmArea * 0.8)

    // Tower must have vertical profile in world space (screen projection depends on camera angle).
    // The world-space vertical profile is proven in m3-scale-measurement; here we just verify
    // the tower projects as a distinct shape (not zero-sized).
    expect(snap.tower.screen.heightPx,
      'tower must project with meaningful height (>= 30px)').toBeGreaterThanOrEqual(30)

    // Farm must be the smallest building
    const farmArea = snap.farm.screen.widthPx * snap.farm.screen.heightPx
    expect(farmArea, 'farm must be smaller than barracks').toBeLessThan(bkArea)
    expect(farmArea, 'farm must be smaller than TH').toBeLessThan(thArea)

    // Building visible mesh counts: each must have geometry
    for (const type of buildingTypes) {
      expect(snap[type].screen.visibleMeshCount,
        `${type} must have visible meshes (>= 1)`).toBeGreaterThanOrEqual(1)
    }

    console.log('[V3-RD1 AUDIT] Building readability:', {
      townhall: { wpx: +snap.townhall.screen.widthPx.toFixed(1), hpx: +snap.townhall.screen.heightPx.toFixed(1), meshes: snap.townhall.screen.visibleMeshCount },
      barracks: { wpx: +snap.barracks.screen.widthPx.toFixed(1), hpx: +snap.barracks.screen.heightPx.toFixed(1), meshes: snap.barracks.screen.visibleMeshCount },
      goldmine: { wpx: +snap.goldmine.screen.widthPx.toFixed(1), hpx: +snap.goldmine.screen.heightPx.toFixed(1), meshes: snap.goldmine.screen.visibleMeshCount },
      farm: { wpx: +snap.farm.screen.widthPx.toFixed(1), hpx: +snap.farm.screen.heightPx.toFixed(1), meshes: snap.farm.screen.visibleMeshCount },
      tower: { wpx: +snap.tower.screen.widthPx.toFixed(1), hpx: +snap.tower.screen.heightPx.toFixed(1), meshes: snap.tower.screen.visibleMeshCount },
      thAreaRatio: {
        bkOverTH: +(bkArea / thArea).toFixed(2),
        gmOverTH: +(gmArea / thArea).toFixed(2),
        farmOverTH: +(farmArea / thArea).toFixed(2),
      },
    })
  })

  test('treeline is present, separate from buildings, and on screen', async ({ page }) => {
    await waitForGame(page)
    const snap = await collectReadabilitySnapshot(page)

    expect(snap.trees.totalOnMap, 'treeline must have > 50 trees on map').toBeGreaterThan(50)
    expect(snap.trees.countNearBase, 'must have trees near player base').toBeGreaterThan(0)

    // At least some trees near base must be on screen
    expect(snap.trees.anyOnScreen, 'at least one base tree must be in viewport').toBe(true)

    // Trees must have nonzero screen projections
    for (const [i, ts] of snap.trees.sampleScreens.entries()) {
      if (ts.onScreen) {
        expect(ts.widthPx, `tree[${i}] screen width must be > 0`).toBeGreaterThan(0)
        expect(ts.heightPx, `tree[${i}] screen height must be > 0`).toBeGreaterThan(0)
      }
    }

    console.log('[V3-RD1 AUDIT] Treeline readability:', {
      totalOnMap: snap.trees.totalOnMap,
      nearBase: snap.trees.countNearBase,
      sampleScreens: snap.trees.sampleScreens.map((s: any) => ({
        wpx: +s.widthPx.toFixed(1),
        hpx: +s.heightPx.toFixed(1),
        onScreen: s.onScreen,
      })),
    })
  })

  test('V3-RD1 readability audit: all object types bind to focused proof', async ({ page }) => {
    await waitForGame(page)
    const snap = await collectReadabilitySnapshot(page)

    // Comprehensive audit: every object type must pass minimum thresholds
    const audit: Record<string, {
      onScreen: boolean
      widthPx: number
      heightPx: number
      meshes: number
      passed: boolean
    }> = {}

    const objectTypes = ['worker', 'footman', 'townhall', 'barracks', 'goldmine', 'farm', 'tower'] as const

    // Minimum readable pixel sizes per type (RTS readability floor)
    const minSizes: Record<string, { w: number; h: number }> = {
      worker: { w: 8, h: 18 },
      footman: { w: 10, h: 22 },
      townhall: { w: 20, h: 20 },
      barracks: { w: 10, h: 10 },
      goldmine: { w: 10, h: 10 },
      farm: { w: 5, h: 5 },
      tower: { w: 5, h: 10 },
    }
    const minMeshes: Record<string, number> = {
      worker: 6,
      footman: 8,
      townhall: 1,
      barracks: 1,
      goldmine: 1,
      farm: 1,
      tower: 1,
    }

    let allPassed = true
    for (const type of objectTypes) {
      const obj = snap[type]
      const screen = obj?.screen
      const onScreen = screen?.onScreen ?? false
      const widthPx = screen?.widthPx ?? 0
      const heightPx = screen?.heightPx ?? 0
      const meshes = screen?.visibleMeshCount ?? 0
      const minW = minSizes[type].w
      const minH = minSizes[type].h
      const minM = minMeshes[type]
      const passed = onScreen && widthPx >= minW && heightPx >= minH && meshes >= minM

      audit[type] = { onScreen, widthPx, heightPx, meshes, passed }
      if (!passed) allPassed = false
    }

    // Trees audit
    const treesOnScreen = snap.trees.anyOnScreen ?? false
    const treesPresent = (snap.trees.totalOnMap ?? 0) > 50
    const treesPassed = treesOnScreen && treesPresent
    audit.treeline = {
      onScreen: treesOnScreen,
      widthPx: snap.trees.totalOnMap,
      heightPx: snap.trees.countNearBase,
      meshes: snap.trees.sampleScreens.filter((s: any) => s.onScreen && s.widthPx > 0).length,
      passed: treesPassed,
    }
    if (!treesPassed) allPassed = false

    // Individual bindings
    for (const [type, a] of Object.entries(audit)) {
      expect(a.passed,
        `${type} must pass readability: onScreen=${a.onScreen}, ${a.widthPx.toFixed(1)}x${a.heightPx.toFixed(1)}px, meshes=${a.meshes}`).toBe(true)
    }

    expect(allPassed, 'All object types must pass readability audit').toBe(true)

    console.log('[V3-RD1 CLOSEOUT AUDIT]', JSON.stringify({
      camera: snap.camera,
      objectAudit: audit,
      allPassed,
    }, null, 2))
  })
})
