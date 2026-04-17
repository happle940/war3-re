import { test, expect, type Page } from '@playwright/test'
import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname } from 'node:path'

const BASE = 'http://127.0.0.1:4173/?runtimeTest=1'
const SCREENSHOT_PATH = '/Users/zhaocong/Documents/war3-re/artifacts/asset-intake/preview/goldmine-gold-readability-a1-002.png'
const METRICS_PATH = '/Users/zhaocong/Documents/war3-re/artifacts/asset-intake/preview/goldmine-gold-readability-a1-002.json'

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

test.describe('Goldmine Gold Readability Proof', () => {
  test.setTimeout(120000)

  test('goldmine has reinforced gold cues without changing resource behavior', async ({ page }) => {
    await waitForGame(page)

    const metrics: any = await page.evaluate(async () => {
      const g = (window as any).__war3Game
      await new Promise(resolve => window.setTimeout(resolve, 500))
      g.refreshVisualsAfterAssetLoad()

      const mine = g.units.find((u: any) => u.type === 'goldmine' && u.hp > 0)
      if (!mine) return { ok: false, reason: 'no goldmine' }

      g.cameraCtrl.distance = 16
      g.cameraCtrl.setTarget(mine.mesh.position.x, mine.mesh.position.z)
      await new Promise(resolve => window.setTimeout(resolve, 300))

      const Vec3 = mine.mesh.position.constructor
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
              ndcZ: projected.z,
            })
          }
        })

        if (points.length === 0) {
          return { widthPx: 0, heightPx: 0, areaPx: 0, onScreen: false, visibleMeshCount }
        }

        const left = Math.min(...points.map(p => p.sx))
        const right = Math.max(...points.map(p => p.sx))
        const top = Math.min(...points.map(p => p.sy))
        const bottom = Math.max(...points.map(p => p.sy))
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
          onScreen: right >= 0 && left <= viewport.width && bottom >= 0 && top <= viewport.height,
          visibleMeshCount,
        }
      }

      const meshes: any[] = []
      const accentRoots: any[] = []
      const readabilityCueMeshes: any[] = []
      const goldNamedMeshes: string[] = []
      mine.mesh.traverse((child: any) => {
        if (child?.isMesh) {
          meshes.push(child)
          const mats = Array.isArray(child.material) ? child.material : [child.material]
          const hasGoldMat = mats.some((mat: any) => mat?.name === 'goldmine_readability_gold')
          if (hasGoldMat || String(child.name ?? '').includes('goldmine-gold-readability')) {
            goldNamedMeshes.push(child.name ?? '(unnamed)')
          }
        }
        if (typeof child?.name === 'string' && child.name.startsWith('goldmine-resource-gold-accent')) {
          accentRoots.push(child)
        }
      })

      const cue = mine.mesh.getObjectByName('goldmine-gold-readability-cue')
      cue?.traverse((child: any) => {
        if (child.isMesh) readabilityCueMeshes.push(child)
      })

      const mineTile = {
        x: Math.floor(mine.mesh.position.x),
        z: Math.floor(mine.mesh.position.z),
      }
      const adjacent = [
        { x: mineTile.x - 2, z: mineTile.z },
        { x: mineTile.x + 2, z: mineTile.z },
        { x: mineTile.x, z: mineTile.z - 2 },
        { x: mineTile.x, z: mineTile.z + 2 },
      ]

      return {
        ok: true,
        type: mine.type,
        remainingGold: mine.remainingGold,
        isBuilding: mine.isBuilding,
        screen: screenBBox(mine.mesh),
        visualMeshCount: meshes.length,
        accentRootCount: accentRoots.length,
        readabilityCueMeshCount: readabilityCueMeshes.length,
        goldNamedMeshCount: goldNamedMeshes.length,
        goldNamedMeshes,
        openAdjacentTiles: adjacent.filter((p) => !g.pathingGrid.isBlocked(p.x, p.z)).length,
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

    expect(metrics.ok, metrics.reason ?? 'goldmine readability proof setup failed').toBe(true)
    expect(metrics.type).toBe('goldmine')
    expect(metrics.isBuilding).toBe(true)
    expect(metrics.remainingGold).toBeGreaterThan(0)
    expect(metrics.screen.onScreen).toBe(true)
    expect(metrics.screen.widthPx).toBeGreaterThanOrEqual(80)
    expect(metrics.screen.heightPx).toBeGreaterThanOrEqual(50)
    expect(metrics.visualMeshCount).toBeGreaterThanOrEqual(13)
    expect(metrics.accentRootCount).toBeGreaterThanOrEqual(4)
    expect(metrics.readabilityCueMeshCount).toBeGreaterThanOrEqual(3)
    expect(metrics.goldNamedMeshCount).toBeGreaterThanOrEqual(3)
    expect(metrics.openAdjacentTiles).toBeGreaterThanOrEqual(1)
    expect(severeConsoleErrors(page)).toHaveLength(0)
  })
})
