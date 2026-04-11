/**
 * Unit Visibility Regression Pack
 *
 * Runtime-proof checks for the class of bugs where a worker exists in game
 * state and its health bar is visible, but the body becomes unreadable or
 * effectively invisible after map/asset refresh.
 */
import { test, expect, type Page } from '@playwright/test'

const BASE = 'http://127.0.0.1:4173'

async function waitForGame(page: Page) {
  const consoleErrors: string[] = []
  page.on('console', (msg) => {
    if (msg.type() === 'error') consoleErrors.push(msg.text())
  })

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
  }, { timeout: 15000 })

  await page.waitForTimeout(500)

  const criticalErrors = consoleErrors.filter(
    (msg) => !msg.includes('Failed to load resource') && !msg.includes('404'),
  )
  expect(criticalErrors).toEqual([])
}

type UnitVisualSnapshot = {
  ok: boolean
  reason?: string
  workerCount?: number
  workers?: Array<{
    type: string
    team: number
    visibleMeshCount: number
    opaqueMeshCount: number
    minOpacity: number
    minWorldScale: number
    bbox: {
      width: number
      height: number
      depth: number
      minY: number
      maxY: number
    }
    screen: {
      widthPx: number
      heightPx: number
      inViewport: boolean
      centerX: number
      centerY: number
    }
    healthBar: {
      exists: boolean
      y: number | null
      aboveBody: boolean
      gap: number | null
    }
    healthBarY: number | null
  }>
}

async function collectWorkerVisualSnapshot(page: Page): Promise<UnitVisualSnapshot> {
  return page.evaluate(() => {
    const g = (window as any).__war3Game
    if (!g) return { ok: false, reason: 'missing __war3Game' }

    const workers = g.units.filter(
      (u: any) => u.type === 'worker' && u.team === 0 && u.hp > 0 && !u.isBuilding,
    )
    if (workers.length === 0) return { ok: false, reason: 'no live player workers' }

    function materialStats(material: any) {
      const mats = Array.isArray(material) ? material : [material]
      const visible = mats.some((mat) => mat && mat.visible !== false)
      const opacities = mats
        .filter((mat) => mat && mat.visible !== false)
        .map((mat) => (typeof mat.opacity === 'number' ? mat.opacity : 1))
      return {
        visible,
        minOpacity: opacities.length > 0 ? Math.min(...opacities) : 0,
      }
    }

    function unitStats(unit: any) {
      unit.mesh.updateWorldMatrix(true, true)
      const Vector3 = unit.mesh.position.constructor
      const corners: any[] = []
      const projected: any[] = []
      let visibleMeshCount = 0
      let opaqueMeshCount = 0
      let minOpacity = 1
      let minWorldScale = Number.POSITIVE_INFINITY

      unit.mesh.traverse((child: any) => {
        if (!child?.isMesh || child.visible === false || !child.geometry) return
        const mat = materialStats(child.material)
        if (!mat.visible) return

        visibleMeshCount++
        minOpacity = Math.min(minOpacity, mat.minOpacity)
        if (mat.minOpacity >= 0.2) opaqueMeshCount++

        const scale = new Vector3()
        child.getWorldScale(scale)
        minWorldScale = Math.min(minWorldScale, scale.x, scale.y, scale.z)

        if (!child.geometry.boundingBox) child.geometry.computeBoundingBox()
        const box = child.geometry.boundingBox
        if (!box) return

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
          corners.push(p)
          projected.push(p.clone().project(g.camera))
        }
      })

      if (corners.length === 0) {
        return {
          type: unit.type,
          team: unit.team,
          visibleMeshCount,
          opaqueMeshCount,
          minOpacity: 0,
          minWorldScale: 0,
          bbox: { width: 0, height: 0, depth: 0, minY: 0, maxY: 0 },
          screen: { widthPx: 0, heightPx: 0, inViewport: false, centerX: 0, centerY: 0 },
          healthBar: { exists: false, y: null, aboveBody: false, gap: null },
          healthBarY: typeof unit.mesh.userData.healthBarY === 'number' ? unit.mesh.userData.healthBarY : null,
        }
      }

      const minX = Math.min(...corners.map((p) => p.x))
      const maxX = Math.max(...corners.map((p) => p.x))
      const minY = Math.min(...corners.map((p) => p.y))
      const maxY = Math.max(...corners.map((p) => p.y))
      const minZ = Math.min(...corners.map((p) => p.z))
      const maxZ = Math.max(...corners.map((p) => p.z))

      const minScreenX = Math.min(...projected.map((p) => p.x))
      const maxScreenX = Math.max(...projected.map((p) => p.x))
      const minScreenY = Math.min(...projected.map((p) => p.y))
      const maxScreenY = Math.max(...projected.map((p) => p.y))
      const screenWidth = Math.abs(maxScreenX - minScreenX) * window.innerWidth / 2
      const screenHeight = Math.abs(maxScreenY - minScreenY) * window.innerHeight / 2
      const center = unit.mesh.position.clone().project(g.camera)

      const bars = g.healthBars?.get(unit)
      const healthBarY = bars?.bg?.parent?.position?.y ?? null

      return {
        type: unit.type,
        team: unit.team,
        visibleMeshCount,
        opaqueMeshCount,
        minOpacity,
        minWorldScale: Number.isFinite(minWorldScale) ? minWorldScale : 0,
        bbox: {
          width: maxX - minX,
          height: maxY - minY,
          depth: maxZ - minZ,
          minY,
          maxY,
        },
        screen: {
          widthPx: screenWidth,
          heightPx: screenHeight,
          inViewport: maxScreenX >= -1 && minScreenX <= 1 && maxScreenY >= -1 && minScreenY <= 1,
          centerX: center.x,
          centerY: center.y,
        },
        healthBar: {
          exists: !!bars,
          y: healthBarY,
          aboveBody: typeof healthBarY === 'number' ? healthBarY > maxY : false,
          gap: typeof healthBarY === 'number' ? healthBarY - maxY : null,
        },
        healthBarY: typeof unit.mesh.userData.healthBarY === 'number' ? unit.mesh.userData.healthBarY : null,
      }
    }

    return {
      ok: true,
      workerCount: workers.length,
      workers: workers.map(unitStats),
    }
  })
}

function assertWorkerVisibility(snapshot: UnitVisualSnapshot, label: string) {
  expect(snapshot.ok, `${label}: ${snapshot.reason ?? 'snapshot failed'}`).toBe(true)
  expect(snapshot.workerCount, `${label}: expected workers to exist`).toBeGreaterThanOrEqual(5)

  for (const [idx, worker] of snapshot.workers!.entries()) {
    const prefix = `${label}: worker[${idx}] team=${worker.team}`

    expect(worker.visibleMeshCount, `${prefix}: no visible renderable meshes`).toBeGreaterThanOrEqual(6)
    expect(worker.opaqueMeshCount, `${prefix}: body is mostly transparent`).toBeGreaterThanOrEqual(5)
    expect(worker.minOpacity, `${prefix}: material opacity too low`).toBeGreaterThanOrEqual(0.2)
    expect(worker.minWorldScale, `${prefix}: visual scale collapsed`).toBeGreaterThan(0.05)

    expect(worker.screen.inViewport, `${prefix}: player worker is outside the default camera viewport`).toBe(true)
    expect(Math.abs(worker.screen.centerX), `${prefix}: player worker center is horizontally offscreen`).toBeLessThanOrEqual(1)
    expect(Math.abs(worker.screen.centerY), `${prefix}: player worker center is vertically offscreen`).toBeLessThanOrEqual(1)

    expect(worker.bbox.height, `${prefix}: world height below RTS readability floor`).toBeGreaterThanOrEqual(1.55)
    expect(worker.bbox.width, `${prefix}: world width below RTS readability floor`).toBeGreaterThanOrEqual(0.7)
    expect(worker.bbox.depth, `${prefix}: world depth below RTS readability floor`).toBeGreaterThanOrEqual(0.45)

    expect(worker.screen.heightPx, `${prefix}: projected body height too small at default camera`).toBeGreaterThanOrEqual(18)
    expect(worker.screen.widthPx, `${prefix}: projected body width too small at default camera`).toBeGreaterThanOrEqual(8)

    expect(worker.healthBar.exists, `${prefix}: missing health bar`).toBe(true)
    expect(worker.healthBar.aboveBody, `${prefix}: health bar is not above body bbox`).toBe(true)
    expect(worker.healthBar.gap, `${prefix}: health bar too far from body`).toBeLessThanOrEqual(0.75)
    expect(worker.healthBarY, `${prefix}: missing worker-specific healthBarY anchor`).toBeGreaterThanOrEqual(1.8)
  }
}

test.describe('Unit Visibility Regression', () => {
  test.setTimeout(120000)

  test('worker bodies are readable at default camera after map and asset settle', async ({ page }) => {
    await waitForGame(page)

    const initial = await collectWorkerVisualSnapshot(page)
    assertWorkerVisibility(initial, 'initial-settle')

    // Asset loading is asynchronous. Wait past the refresh window and assert
    // workers did not collapse to health bars or zero-scale visuals.
    await page.waitForTimeout(2000)
    const postAssetSettle = await collectWorkerVisualSnapshot(page)
    assertWorkerVisibility(postAssetSettle, 'post-asset-settle')
  })

  test('worker visibility stays valid after explicit asset-refresh hook', async ({ page }) => {
    await waitForGame(page)

    const result = await page.evaluate(() => {
      const g = (window as any).__war3Game
      if (!g || typeof g.refreshVisualsAfterAssetLoad !== 'function') {
        return { ok: false, reason: 'refreshVisualsAfterAssetLoad unavailable' }
      }

      const beforeWorkers = g.units
        .filter((u: any) => u.type === 'worker' && u.hp > 0 && !u.isBuilding)
        .map((u: any) => ({
          meshId: u.mesh.id,
          scale: { x: u.mesh.scale.x, y: u.mesh.scale.y, z: u.mesh.scale.z },
          childCount: u.mesh.children.length,
        }))

      g.refreshVisualsAfterAssetLoad()

      const afterWorkers = g.units
        .filter((u: any) => u.type === 'worker' && u.hp > 0 && !u.isBuilding)
        .map((u: any) => ({
          meshId: u.mesh.id,
          scale: { x: u.mesh.scale.x, y: u.mesh.scale.y, z: u.mesh.scale.z },
          childCount: u.mesh.children.length,
        }))

      return { ok: true, beforeWorkers, afterWorkers }
    })

    expect(result.ok, result.reason).toBe(true)
    expect(result.beforeWorkers.length).toBeGreaterThanOrEqual(5)
    expect(result.afterWorkers.length).toBe(result.beforeWorkers.length)

    for (let i = 0; i < result.afterWorkers.length; i++) {
      expect(result.afterWorkers[i].childCount, `worker[${i}] lost visual children after refresh`).toBeGreaterThanOrEqual(6)
      expect(result.afterWorkers[i].scale.x, `worker[${i}] x scale changed unexpectedly`).toBe(result.beforeWorkers[i].scale.x)
      expect(result.afterWorkers[i].scale.y, `worker[${i}] y scale changed unexpectedly`).toBe(result.beforeWorkers[i].scale.y)
      expect(result.afterWorkers[i].scale.z, `worker[${i}] z scale changed unexpectedly`).toBe(result.beforeWorkers[i].scale.z)
    }

    const snapshot = await collectWorkerVisualSnapshot(page)
    assertWorkerVisibility(snapshot, 'explicit-refresh')
  })
})
