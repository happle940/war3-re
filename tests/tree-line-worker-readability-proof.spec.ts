import { test, expect, type Page } from '@playwright/test'
import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname } from 'node:path'

const BASE = 'http://127.0.0.1:4173/?runtimeTest=1'
const SCREENSHOT_PATH = '/Users/zhaocong/Documents/war3-re/artifacts/asset-intake/preview/tree-line-worker-readability-a1-001.png'
const METRICS_PATH = '/Users/zhaocong/Documents/war3-re/artifacts/asset-intake/preview/tree-line-worker-readability-a1-001.json'

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
    // Procedural fallback is a valid runtime path when a map asset is absent.
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

test.describe('Tree Line Worker Readability Proof', () => {
  test.setTimeout(120000)

  test('selected worker remains readable at the harvest edge of the tree line', async ({ page }) => {
    await waitForGame(page)

    const metrics: any = await page.evaluate(async () => {
      const g = (window as any).__war3Game
      await new Promise(resolve => window.setTimeout(resolve, 300))

      const Vec3 = g.units[0].mesh.position.constructor
      const camera = g.camera
      const viewport = {
        width: window.innerWidth,
        height: window.innerHeight,
      }

      function screenBBox(obj: any) {
        obj.updateWorldMatrix(true, true)
        const points: any[] = []
        let visibleMeshCount = 0

        obj.traverse((child: any) => {
          if (!child?.isMesh || child.visible === false || !child.geometry) return
          visibleMeshCount++
          child.geometry.computeBoundingBox?.()
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
            const projected = new Vec3(x, y, z).applyMatrix4(child.matrixWorld).project(camera)
            points.push({
              sx: (projected.x + 1) * viewport.width / 2,
              sy: (-projected.y + 1) * viewport.height / 2,
              ndcX: projected.x,
              ndcY: projected.y,
              ndcZ: projected.z,
            })
          }
        })

        if (points.length === 0) {
          return {
            left: 0,
            right: 0,
            top: 0,
            bottom: 0,
            widthPx: 0,
            heightPx: 0,
            areaPx: 0,
            onScreen: false,
            visibleMeshCount,
            center: null,
          }
        }

        const left = Math.min(...points.map(p => p.sx))
        const right = Math.max(...points.map(p => p.sx))
        const top = Math.min(...points.map(p => p.sy))
        const bottom = Math.max(...points.map(p => p.sy))
        const centerProjected = obj.position.clone().project(camera)
        const center = {
          sx: (centerProjected.x + 1) * viewport.width / 2,
          sy: (-centerProjected.y + 1) * viewport.height / 2,
          ndcX: centerProjected.x,
          ndcY: centerProjected.y,
          ndcZ: centerProjected.z,
        }

        const widthPx = Math.max(0, right - left)
        const heightPx = Math.max(0, bottom - top)
        return {
          left,
          right,
          top,
          bottom,
          widthPx,
          heightPx,
          areaPx: widthPx * heightPx,
          onScreen: right >= 0 && left <= viewport.width && bottom >= 0 && top <= viewport.height && center.ndcZ < 1,
          visibleMeshCount,
          center,
        }
      }

      function overlapArea(a: any, b: any) {
        const left = Math.max(a.left, b.left)
        const right = Math.min(a.right, b.right)
        const top = Math.max(a.top, b.top)
        const bottom = Math.min(a.bottom, b.bottom)
        return Math.max(0, right - left) * Math.max(0, bottom - top)
      }

      const base = g.units.find((u: any) => u.team === 0 && u.type === 'townhall' && u.hp > 0)?.mesh.position
      const trees = [...(g.treeManager?.entries ?? [])]
        .filter((entry: any) => entry.remainingLumber > 0)
        .sort((a: any, b: any) => {
          if (!base) return 0
          return a.mesh.position.distanceTo(base) - b.mesh.position.distanceTo(base)
        })

      let picked: any = null
      for (const entry of trees) {
        const workerTile = { x: entry.tx, z: entry.tz + 1 }
        if (!g.pathingGrid.isBlocked(workerTile.x, workerTile.z)) {
          picked = { source: 'existing-tree-line', entry, workerTile }
          break
        }
      }

      if (!picked) {
        for (let x = 28; x < 46 && !picked; x++) {
          for (let z = 28; z < 46; z++) {
            if (g.pathingGrid.isBlocked(x, z)) continue
            if (g.pathingGrid.isBlocked(x, z + 1)) continue
            const tree = g.createSingleTree()
            tree.userData.isTree = true
            const height = typeof g.getWorldHeight === 'function' ? g.getWorldHeight(x, z) : 0
            tree.position.set(x + 0.5, height, z + 0.5)
            g.scene.add(tree)
            const entry = g.treeManager.register(tree, x, z, 50)
            picked = { source: 'controlled-tree-line-fallback', entry, workerTile: { x, z: z + 1 } }
            break
          }
        }
      }

      if (!picked) return { ok: false, reason: 'no harvest edge tile found' }

      const worker = g.spawnUnit('worker', 0, picked.workerTile.x, picked.workerTile.z)
      worker.gatherType = 'lumber'
      worker.resourceTarget = { type: 'tree', entry: picked.entry }
      worker.state = 3
      worker.gatherTimer = 999
      worker.moveTarget = null
      worker.waypoints = []

      g.selectionModel.clear()
      g.clearSelectionRings()
      g.selectionModel.setSelection([worker])
      g.createSelectionRing(worker)

      const targetX = (worker.mesh.position.x + picked.entry.mesh.position.x) / 2
      const targetZ = (worker.mesh.position.z + picked.entry.mesh.position.z) / 2
      g.cameraCtrl.distance = 16
      g.cameraCtrl.setTarget(targetX, targetZ)

      await new Promise(resolve => window.setTimeout(resolve, 300))

      const workerScreen = screenBBox(worker.mesh)
      const treeScreen = screenBBox(picked.entry.mesh)
      const ring = g.selectionRings?.[0]
      const ringScreen = ring ? screenBBox(ring) : null
      const overlap = overlapArea(workerScreen, treeScreen)
      const workerTreeOverlapRatio = workerScreen.areaPx > 0 ? overlap / workerScreen.areaPx : 1

      return {
        ok: true,
        source: picked.source,
        treeTile: { x: picked.entry.tx, z: picked.entry.tz },
        workerTile: picked.workerTile,
        workerSouthOfTree: picked.workerTile.z > picked.entry.tz,
        treeRemainingLumber: picked.entry.remainingLumber,
        treeTileBlocked: g.pathingGrid.isBlocked(picked.entry.tx, picked.entry.tz),
        workerTileBlocked: g.pathingGrid.isBlocked(picked.workerTile.x, picked.workerTile.z),
        selectedCount: g.selectionModel.count,
        ringCount: g.selectionRings?.length ?? 0,
        workerScreen,
        treeScreen,
        ringScreen,
        workerTreeOverlapRatio,
        workerCenterBelowTreeCenter: workerScreen.center && treeScreen.center
          ? workerScreen.center.sy > treeScreen.center.sy
          : false,
        camera: {
          distance: g.cameraCtrl.distance,
          target: g.cameraCtrl.getTarget?.(),
        },
        viewport,
      }
    })

    await page.waitForTimeout(500)
    mkdirSync(dirname(SCREENSHOT_PATH), { recursive: true })
    await page.locator('#game-canvas').screenshot({ path: SCREENSHOT_PATH })
    writeFileSync(METRICS_PATH, JSON.stringify(metrics, null, 2))

    expect(metrics.ok, metrics.reason ?? 'worker readability setup failed').toBe(true)
    expect(metrics.source).toBe('existing-tree-line')
    expect(metrics.workerSouthOfTree).toBe(true)
    expect(metrics.treeTileBlocked).toBe(true)
    expect(metrics.workerTileBlocked).toBe(false)
    expect(metrics.selectedCount).toBe(1)
    expect(metrics.ringCount).toBe(1)
    expect(metrics.workerScreen.onScreen).toBe(true)
    expect(metrics.treeScreen.onScreen).toBe(true)
    expect(metrics.ringScreen?.onScreen).toBe(true)
    expect(metrics.workerScreen.visibleMeshCount).toBeGreaterThanOrEqual(6)
    expect(metrics.workerScreen.widthPx).toBeGreaterThanOrEqual(12)
    expect(metrics.workerScreen.heightPx).toBeGreaterThanOrEqual(24)
    expect(metrics.ringScreen.widthPx).toBeGreaterThanOrEqual(10)
    expect(metrics.workerCenterBelowTreeCenter).toBe(true)
    expect(metrics.workerTreeOverlapRatio).toBeLessThan(0.65)
    expect(severeConsoleErrors(page)).toHaveLength(0)
  })
})
