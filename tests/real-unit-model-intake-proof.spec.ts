import { test, expect, type Page } from '@playwright/test'
import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname } from 'node:path'

const BASE = 'http://127.0.0.1:4173/?runtimeTest=1'
const SCREENSHOT_PATH = '/Users/zhaocong/Documents/war3-re/artifacts/asset-intake/preview/real-unit-model-lineup-a1-001.png'
const METRICS_PATH = '/Users/zhaocong/Documents/war3-re/artifacts/asset-intake/preview/real-unit-model-lineup-a1-001.json'

const UNIT_TYPES = [
  'worker',
  'footman',
  'rifleman',
  'mortar_team',
  'priest',
  'militia',
  'sorceress',
  'knight',
  'paladin',
]

async function waitForGameAndUnitModels(page: Page) {
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

  await page.waitForFunction(() => {
    const game = (window as any).__war3Game
    return game?.units?.some((u: any) =>
      u.type === 'worker' &&
      !u.isBuilding &&
      u.mesh?.userData?.visualRoute === 'real-gltf-unit-model',
    )
  }, { timeout: 30000 })
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

test.describe('Real Unit Model Intake Proof', () => {
  test.setTimeout(120000)

  test('all human units use local real GLB models instead of block placeholders', async ({ page }) => {
    await waitForGameAndUnitModels(page)

    const metrics: any = await page.evaluate(async (unitTypes) => {
      const g = (window as any).__war3Game
      g.refreshVisualsAfterAssetLoad?.()

      const spawned = unitTypes.map((type: string, idx: number) => {
        const unit = g.spawnUnit(type, 0, 20 + idx * 2.2, 29)
        unit.state = 0
        unit.moveTarget = null
        unit.waypoints = []
        unit.attackTarget = null
        return unit
      })

      const centerX = spawned.reduce((sum: number, u: any) => sum + u.mesh.position.x, 0) / spawned.length
      const centerZ = spawned.reduce((sum: number, u: any) => sum + u.mesh.position.z, 0) / spawned.length
      for (const entry of g.treeManager?.entries ?? []) {
        const pos = entry.mesh?.position
        if (!pos) continue
        if (Math.abs(pos.x - centerX) <= 13 && Math.abs(pos.z - centerZ) <= 8) {
          entry.mesh.visible = false
        }
      }
      g.cameraCtrl.distance = 17
      g.cameraCtrl.setTarget(centerX, centerZ)
      g.cameraCtrl.update?.(0)
      await new Promise(resolve => window.setTimeout(resolve, 500))

      function summarize(unit: any) {
        unit.mesh.updateWorldMatrix(true, true)
        const Vector3 = unit.mesh.position.constructor
        const corners: any[] = []
        const projected: any[] = []
        const meshNames: string[] = []
        let visibleMeshCount = 0
        let materialCount = 0

        unit.mesh.traverse((child: any) => {
          if (!child?.isMesh || child.visible === false || !child.geometry) return
          visibleMeshCount++
          meshNames.push(child.name ?? '')
          const mats = Array.isArray(child.material) ? child.material : [child.material]
          materialCount += mats.filter(Boolean).length
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

        const minX = Math.min(...corners.map((p: any) => p.x))
        const maxX = Math.max(...corners.map((p: any) => p.x))
        const minY = Math.min(...corners.map((p: any) => p.y))
        const maxY = Math.max(...corners.map((p: any) => p.y))
        const minZ = Math.min(...corners.map((p: any) => p.z))
        const maxZ = Math.max(...corners.map((p: any) => p.z))
        const minScreenX = Math.min(...projected.map((p: any) => p.x))
        const maxScreenX = Math.max(...projected.map((p: any) => p.x))
        const minScreenY = Math.min(...projected.map((p: any) => p.y))
        const maxScreenY = Math.max(...projected.map((p: any) => p.y))

        return {
          type: unit.type,
          visualRoute: unit.mesh.userData?.visualRoute ?? null,
          assetPath: unit.mesh.userData?.assetPath ?? null,
          healthBarY: unit.mesh.userData?.healthBarY ?? null,
          visibleMeshCount,
          materialCount,
          meshNames,
          hasRealModelCue: meshNames.some((name: string) =>
            name.startsWith('Farmer_') ||
            name.startsWith('Worker_') ||
            name.startsWith('Adventurer_') ||
            name.startsWith('Swat_') ||
            name.startsWith('King_') ||
            name.includes('warr_') ||
            name.includes('Prop_Cannon') ||
            name.includes('Monk') ||
            name.includes('Wizard') ||
            name.includes('Cleric') ||
            name.includes('Witch') ||
            name.includes('mesh_char_'),
          ),
          hasAdapterCue:
            meshNames.includes('unit-real-model-contact-shadow') &&
            meshNames.includes('unit-team-ownership-ring'),
          bbox: {
            width: maxX - minX,
            height: maxY - minY,
            depth: maxZ - minZ,
            minY,
            maxY,
          },
          screen: {
            widthPx: Math.abs(maxScreenX - minScreenX) * window.innerWidth / 2,
            heightPx: Math.abs(maxScreenY - minScreenY) * window.innerHeight / 2,
            inViewport: maxScreenX >= -1 && minScreenX <= 1 && maxScreenY >= -1 && minScreenY <= 1,
          },
        }
      }

      return {
        ok: true,
        units: spawned.map(summarize),
        camera: {
          distance: g.cameraCtrl.distance,
          target: g.cameraCtrl.getTarget?.(),
        },
      }
    }, UNIT_TYPES)

    mkdirSync(dirname(SCREENSHOT_PATH), { recursive: true })
    writeFileSync(METRICS_PATH, JSON.stringify(metrics, null, 2))
    await page.screenshot({ path: SCREENSHOT_PATH, fullPage: true })

    expect(metrics.ok).toBe(true)
    expect(metrics.units.map((u: any) => u.type)).toEqual(UNIT_TYPES)

    for (const unit of metrics.units) {
      const prefix = `${unit.type}`
      expect(unit.visualRoute, `${prefix}: should use real glTF route`).toBe('real-gltf-unit-model')
      expect(unit.assetPath, `${prefix}: should point at local Poly Pizza intake file`).toContain('assets/models/vendor/poly-pizza/units/')
      expect(unit.visibleMeshCount, `${prefix}: visible model mesh count collapsed`).toBeGreaterThanOrEqual(3)
      expect(unit.materialCount, `${prefix}: missing model materials`).toBeGreaterThanOrEqual(1)
      expect(unit.hasRealModelCue, `${prefix}: missing source-model mesh cue`).toBe(true)
      expect(unit.hasAdapterCue, `${prefix}: missing non-block RTS adapter cue`).toBe(true)
      expect(unit.bbox.height, `${prefix}: model too short to read`).toBeGreaterThanOrEqual(unit.type === 'mortar_team' ? 1.15 : 1.55)
      expect(unit.bbox.width, `${prefix}: model too narrow to read`).toBeGreaterThanOrEqual(0.35)
      expect(unit.bbox.depth, `${prefix}: model too flat to read`).toBeGreaterThanOrEqual(0.35)
      expect(unit.screen.inViewport, `${prefix}: lineup unit is offscreen`).toBe(true)
      expect(unit.screen.heightPx, `${prefix}: screen height too small`).toBeGreaterThanOrEqual(16)
      expect(unit.healthBarY, `${prefix}: missing health bar anchor`).toBeGreaterThan(1)
    }

    expect(severeConsoleErrors(page)).toHaveLength(0)
  })
})
