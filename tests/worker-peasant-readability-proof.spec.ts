import { test, expect, type Page } from '@playwright/test'
import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname } from 'node:path'

const BASE = 'http://127.0.0.1:4173/?runtimeTest=1'
const SCREENSHOT_PATH = '/Users/zhaocong/Documents/war3-re/artifacts/asset-intake/preview/worker-peasant-readability-a1-001.png'
const METRICS_PATH = '/Users/zhaocong/Documents/war3-re/artifacts/asset-intake/preview/worker-peasant-readability-a1-001.json'

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
    // Procedural fallback is valid when a map asset is unavailable.
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

test.describe('Worker Peasant Real Model Readability Proof', () => {
  test.setTimeout(120000)

  test('worker reads as a real farmer model with visible tools and team ownership', async ({ page }) => {
    await waitForGame(page)

    const metrics: any = await page.evaluate(async () => {
      const g = (window as any).__war3Game
      await new Promise(resolve => window.setTimeout(resolve, 300))

      let worker: any = null
      for (let x = 20; x < 32 && !worker; x++) {
        for (let z = 18; z < 30; z++) {
          if (g.pathingGrid?.isBlocked?.(x, z)) continue
          worker = g.spawnUnit('worker', 0, x, z)
          worker.state = 0
          worker.moveTarget = null
          worker.waypoints = []
          worker.gatherType = null
          worker.resourceTarget = null
          break
        }
      }
      worker ??= g.units.find((u: any) => u.type === 'worker' && u.team === 0 && u.hp > 0 && !u.isBuilding)
      if (!worker) return { ok: false, reason: 'no player worker' }

      g.selectionModel.clear()
      g.clearSelectionRings()
      g.selectionModel.setSelection([worker])
      g.createSelectionRing(worker)

      g.cameraCtrl.distance = 10
      g.cameraCtrl.setTarget(worker.mesh.position.x, worker.mesh.position.z)
      g.cameraCtrl.update?.(0)
      await new Promise(resolve => window.setTimeout(resolve, 300))

      const Vec3 = worker.mesh.position.constructor
      const camera = g.camera
      const viewport = {
        width: window.innerWidth,
        height: window.innerHeight,
      }

      function screenBBox(obj: any) {
        obj.updateWorldMatrix(true, true)
        const points: any[] = []
        const worldPoints: any[] = []
        let visibleMeshCount = 0
        const meshNames: string[] = []

        obj.traverse((child: any) => {
          if (!child?.isMesh || child.visible === false || !child.geometry) return
          visibleMeshCount++
          meshNames.push(child.name ?? '')
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
            const worldPoint = new Vec3(x, y, z).applyMatrix4(child.matrixWorld)
            const projected = worldPoint.clone().project(camera)
            worldPoints.push(worldPoint)
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
            meshNames,
            world: { width: 0, height: 0, depth: 0, minY: 0, maxY: 0 },
          }
        }

        const left = Math.min(...points.map(p => p.sx))
        const right = Math.max(...points.map(p => p.sx))
        const top = Math.min(...points.map(p => p.sy))
        const bottom = Math.max(...points.map(p => p.sy))
        const widthPx = Math.max(0, right - left)
        const heightPx = Math.max(0, bottom - top)
        const centerProjected = obj.position.clone().project(camera)
        const worldMinX = Math.min(...worldPoints.map((p: any) => p.x))
        const worldMaxX = Math.max(...worldPoints.map((p: any) => p.x))
        const worldMinY = Math.min(...worldPoints.map((p: any) => p.y))
        const worldMaxY = Math.max(...worldPoints.map((p: any) => p.y))
        const worldMinZ = Math.min(...worldPoints.map((p: any) => p.z))
        const worldMaxZ = Math.max(...worldPoints.map((p: any) => p.z))

        return {
          left,
          right,
          top,
          bottom,
          widthPx,
          heightPx,
          areaPx: widthPx * heightPx,
          onScreen: right >= 0 && left <= viewport.width && bottom >= 0 && top <= viewport.height && centerProjected.z < 1,
          visibleMeshCount,
          meshNames,
          world: {
            width: worldMaxX - worldMinX,
            height: worldMaxY - worldMinY,
            depth: worldMaxZ - worldMinZ,
            minY: worldMinY,
            maxY: worldMaxY,
          },
        }
      }

      const workerScreen = screenBBox(worker.mesh)
      const ring = g.selectionRings?.[0]
      const ringScreen = ring ? screenBBox(ring) : null
      const spriteNames: string[] = []
      let paintedTextureWidth = 0
      let paintedTextureHeight = 0
      worker.mesh.traverse((child: any) => {
        if (!child?.isSprite) return
        spriteNames.push(child.name ?? '')
        const image = child.material?.map?.image
        paintedTextureWidth = Math.max(paintedTextureWidth, image?.width ?? 0)
        paintedTextureHeight = Math.max(paintedTextureHeight, image?.height ?? 0)
      })
      const names = workerScreen.meshNames
      const teamCueCount = names.filter((name: string) =>
        name.includes('unit-team-') ||
        name.includes('team-') ||
        name === 'Farmer_Body',
      ).length
      const toolCueCount = names.filter((name: string) =>
        name.startsWith('worker-tool-') ||
        name.startsWith('worker-pickaxe-') ||
        name.startsWith('worker-hammer-') ||
        name.includes('real-model-pickaxe'),
      ).length
      const realFarmerMeshCount = names.filter((name: string) => name.startsWith('Farmer_')).length
      const groundingCueCount = names.filter((name: string) =>
        name === 'unit-real-model-contact-shadow' ||
        name === 'unit-team-ownership-ring',
      ).length

      return {
        ok: true,
        source: worker.mesh.position.x > 18 ? 'isolated-showcase-worker' : 'existing-player-worker',
        type: worker.type,
        team: worker.team,
        hp: worker.hp,
        selectedCount: g.selectionModel.count,
        ringCount: g.selectionRings?.length ?? 0,
        workerScreen,
        ringScreen,
        visualRoute: worker.mesh.userData?.visualRoute ?? null,
        paintedSprite: {
          count: spriteNames.length,
          names: spriteNames,
          textureWidth: paintedTextureWidth,
          textureHeight: paintedTextureHeight,
        },
        cueCounts: {
          team: teamCueCount,
          tool: toolCueCount,
          realFarmerMesh: realFarmerMeshCount,
          grounding: groundingCueCount,
        },
        hasPeasantCues: {
          realFarmerModel: realFarmerMeshCount >= 4,
          pickaxe:
            names.includes('worker-tool-real-model-pickaxe-head') &&
            names.includes('worker-tool-real-model-pickaxe-shaft'),
          teamOwnershipRing: names.includes('unit-team-ownership-ring'),
          contactShadow: names.includes('unit-real-model-contact-shadow'),
        },
        camera: {
          distance: g.cameraCtrl.distance,
          target: g.cameraCtrl.getTarget?.(),
        },
        viewport,
      }
    })

    await page.waitForTimeout(500)
    mkdirSync(dirname(SCREENSHOT_PATH), { recursive: true })
    writeFileSync(METRICS_PATH, JSON.stringify(metrics, null, 2))
    await page.screenshot({ path: SCREENSHOT_PATH, fullPage: true })

    expect(metrics.ok, metrics.reason ?? 'worker peasant proof setup failed').toBe(true)
    expect(metrics.type).toBe('worker')
    expect(metrics.team).toBe(0)
    expect(metrics.hp).toBeGreaterThan(0)
    expect(metrics.selectedCount).toBe(1)
    expect(metrics.ringCount).toBe(1)
    expect(metrics.workerScreen.onScreen).toBe(true)
    expect(metrics.ringScreen?.onScreen).toBe(true)
    expect(metrics.visualRoute).toBe('real-gltf-unit-model')
    expect(metrics.cueCounts.realFarmerMesh).toBeGreaterThanOrEqual(4)
    expect(metrics.workerScreen.visibleMeshCount).toBeGreaterThanOrEqual(8)
    expect(metrics.workerScreen.widthPx).toBeGreaterThanOrEqual(24)
    expect(metrics.workerScreen.heightPx).toBeGreaterThanOrEqual(48)
    expect(metrics.workerScreen.world.height).toBeGreaterThanOrEqual(1.65)
    expect(metrics.workerScreen.world.width).toBeGreaterThanOrEqual(0.75)
    expect(metrics.workerScreen.world.depth).toBeGreaterThanOrEqual(0.5)
    expect(metrics.cueCounts.team).toBeGreaterThanOrEqual(2)
    expect(metrics.cueCounts.tool).toBeGreaterThanOrEqual(3)
    expect(metrics.cueCounts.grounding).toBeGreaterThanOrEqual(2)
    expect(metrics.hasPeasantCues).toEqual({
      realFarmerModel: true,
      pickaxe: true,
      teamOwnershipRing: true,
      contactShadow: true,
    })
    expect(severeConsoleErrors(page)).toHaveLength(0)
  })
})
