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

test.describe('Goldmine Accent Composition', () => {
  test.setTimeout(120000)

  test('resource-gold accent is visual-only and goldmine remains gatherable', async ({ page }) => {
    await waitForGame(page)

    const result: any = await page.evaluate(async () => {
      const g = (window as any).__war3Game
      await new Promise(resolve => window.setTimeout(resolve, 500))
      g.refreshVisualsAfterAssetLoad()

      const mine = g.units.find((u: any) => u.type === 'goldmine' && u.hp > 0)
      if (!mine) return { ok: false, reason: 'no goldmine' }

      mine.mesh.updateWorldMatrix(true, true)
      const meshes: any[] = []
      mine.mesh.traverse((child: any) => {
        if (child.isMesh) meshes.push(child)
      })

      const accent = mine.mesh.getObjectByName('goldmine-resource-gold-accent')
      const accentMeshes: any[] = []
      accent?.traverse((child: any) => {
        if (child.isMesh) accentMeshes.push(child)
      })
      const accentRoots: any[] = []
      mine.mesh.traverse((child: any) => {
        if (typeof child.name === 'string' && child.name.startsWith('goldmine-resource-gold-accent')) {
          accentRoots.push(child)
        }
      })
      const readabilityCue = mine.mesh.getObjectByName('goldmine-gold-readability-cue')
      const readabilityCueMeshes: any[] = []
      readabilityCue?.traverse((child: any) => {
        if (child.isMesh) readabilityCueMeshes.push(child)
      })

      const Vec3 = mine.mesh.position.constructor
      const min = { x: Infinity, y: Infinity, z: Infinity }
      const max = { x: -Infinity, y: -Infinity, z: -Infinity }
      for (const mesh of meshes) {
        mesh.geometry.computeBoundingBox?.()
        const box = mesh.geometry.boundingBox
        if (!box) continue
        for (const x of [box.min.x, box.max.x]) {
          for (const y of [box.min.y, box.max.y]) {
            for (const z of [box.min.z, box.max.z]) {
              const p = new Vec3(x, y, z).applyMatrix4(mesh.matrixWorld)
              min.x = Math.min(min.x, p.x)
              min.y = Math.min(min.y, p.y)
              min.z = Math.min(min.z, p.z)
              max.x = Math.max(max.x, p.x)
              max.y = Math.max(max.y, p.y)
              max.z = Math.max(max.z, p.z)
            }
          }
        }
      }

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
      const openAdjacentTiles = adjacent.filter((p) => !g.pathingGrid.isBlocked(p.x, p.z)).length

      return {
        ok: true,
        type: mine.type,
        isBuilding: mine.isBuilding,
        remainingGold: mine.remainingGold,
        visualMeshCount: meshes.length,
        hasAccent: !!accent,
        accentMeshCount: accentMeshes.length,
        accentRootCount: accentRoots.length,
        hasReadabilityCue: !!readabilityCue,
        readabilityCueMeshCount: readabilityCueMeshes.length,
        bboxWidth: max.x - min.x,
        bboxDepth: max.z - min.z,
        bboxHeight: max.y - min.y,
        openAdjacentTiles,
      }
    })

    expect(result.ok, result.reason ?? 'goldmine composition audit failed').toBe(true)
    expect(result.type).toBe('goldmine')
    expect(result.isBuilding).toBe(true)
    expect(result.remainingGold).toBeGreaterThan(0)
    expect(result.visualMeshCount).toBeGreaterThanOrEqual(13)
    expect(result.hasAccent).toBe(true)
    expect(result.accentMeshCount).toBeGreaterThanOrEqual(1)
    expect(result.accentRootCount).toBeGreaterThanOrEqual(4)
    expect(result.hasReadabilityCue).toBe(true)
    expect(result.readabilityCueMeshCount).toBeGreaterThanOrEqual(3)
    expect(result.bboxWidth).toBeGreaterThan(0.5)
    expect(result.bboxDepth).toBeGreaterThan(0.5)
    expect(result.bboxHeight).toBeGreaterThan(0.5)
    expect(result.openAdjacentTiles).toBeGreaterThanOrEqual(1)
    expect(severeConsoleErrors(page)).toHaveLength(0)
  })
})
