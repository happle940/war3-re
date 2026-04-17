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

test.describe('Tree Line Lumber Gate', () => {
  test.setTimeout(120000)

  test('spawned tree line stays visible, registered, and path-blocking', async ({ page }) => {
    await waitForGame(page)

    const result: any = await page.evaluate(async () => {
      const g = (window as any).__war3Game
      await new Promise(resolve => window.setTimeout(resolve, 300))

      const trees = g.treeManager?.entries ?? []
      if (trees.length === 0) return { ok: false, reason: 'no trees' }

      const sample = trees.find((entry: any) => entry.remainingLumber > 0) ?? trees[0]
      const meshes: any[] = []
      sample.mesh.traverse((child: any) => {
        if (child.isMesh) meshes.push(child)
      })
      const nearest = g.treeManager.findNearest(sample.mesh.position, 0.1)

      return {
        ok: true,
        totalTrees: trees.length,
        sampleMeshCount: meshes.length,
        hasUserDataTree: sample.mesh.userData?.isTree === true,
        remainingLumber: sample.remainingLumber,
        treeTile: g.treeManager.isTreeTile(sample.tx, sample.tz),
        pathBlocked: g.pathingGrid.isBlocked(sample.tx, sample.tz),
        nearestIsSample: nearest === sample,
      }
    })

    expect(result.ok, result.reason ?? 'tree line registration audit failed').toBe(true)
    expect(result.totalTrees).toBeGreaterThan(50)
    expect(result.sampleMeshCount).toBeGreaterThan(0)
    expect(result.hasUserDataTree).toBe(true)
    expect(result.remainingLumber).toBeGreaterThan(0)
    expect(result.treeTile).toBe(true)
    expect(result.pathBlocked).toBe(true)
    expect(result.nearestIsSample).toBe(true)
    expect(severeConsoleErrors(page)).toHaveLength(0)
  })

  test('lumber depletion removes a tree and releases its pathing blocker', async ({ page }) => {
    await waitForGame(page)

    const result: any = await page.evaluate(async () => {
      const g = (window as any).__war3Game
      await new Promise(resolve => window.setTimeout(resolve, 300))

      if (typeof g.createSingleTree !== 'function') {
        return { ok: false, reason: 'createSingleTree unavailable' }
      }

      let tile: { x: number, z: number } | null = null
      for (let x = 28; x < 46 && !tile; x++) {
        for (let z = 28; z < 46; z++) {
          if (g.pathingGrid.isBlocked(x, z)) continue
          if (g.pathingGrid.isBlocked(x + 1, z)) continue
          tile = { x, z }
          break
        }
      }
      if (!tile) return { ok: false, reason: 'no open tile' }

      const beforeCount = g.treeManager.entries.length
      const initiallyBlocked = g.pathingGrid.isBlocked(tile.x, tile.z)

      const tree = g.createSingleTree()
      tree.userData.isTree = true
      const height = typeof g.getWorldHeight === 'function' ? g.getWorldHeight(tile.x, tile.z) : 0
      tree.position.set(tile.x + 0.5, height, tile.z + 0.5)
      g.scene.add(tree)
      const entry = g.treeManager.register(tree, tile.x, tile.z, 10)
      const blockedAfterRegister = g.pathingGrid.isBlocked(tile.x, tile.z)
      const treeTileAfterRegister = g.treeManager.isTreeTile(tile.x, tile.z)

      const worker = g.spawnUnit('worker', 0, tile.x + 1, tile.z)
      worker.gatherType = 'lumber'
      worker.resourceTarget = { type: 'tree', entry }
      worker.state = 3
      worker.gatherTimer = 0.01
      worker.carryAmount = 0
      worker.moveTarget = null
      worker.waypoints = []

      g.update(0.02)

      const entryStillExists = g.treeManager.entries.includes(entry)
      const treeTileAfterDeplete = g.treeManager.isTreeTile(tile.x, tile.z)
      const blockedAfterDeplete = g.pathingGrid.isBlocked(tile.x, tile.z)

      return {
        ok: true,
        beforeCount,
        afterCount: g.treeManager.entries.length,
        initiallyBlocked,
        blockedAfterRegister,
        treeTileAfterRegister,
        entryStillExists,
        treeTileAfterDeplete,
        blockedAfterDeplete,
        workerCarry: worker.carryAmount,
        workerState: worker.state,
        workerGatherType: worker.gatherType,
      }
    })

    expect(result.ok, result.reason ?? 'tree depletion blocker audit failed').toBe(true)
    expect(result.initiallyBlocked).toBe(false)
    expect(result.blockedAfterRegister).toBe(true)
    expect(result.treeTileAfterRegister).toBe(true)
    expect(result.entryStillExists).toBe(false)
    expect(result.treeTileAfterDeplete).toBe(false)
    expect(result.blockedAfterDeplete).toBe(false)
    expect(result.afterCount).toBe(result.beforeCount)
    expect(result.workerCarry).toBe(10)
    expect(result.workerState).toBe(4)
    expect(result.workerGatherType).toBe('lumber')
    expect(severeConsoleErrors(page)).toHaveLength(0)
  })
})
