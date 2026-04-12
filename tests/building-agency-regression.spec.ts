/**
 * Building Agency Regression Pack
 *
 * Runtime-proof Playwright tests for the player contract:
 * the worker selected before entering placement mode is the worker assigned
 * to build after the building is placed.
 *
 * The tests use page.evaluate() because the contract under test is the
 * placement/order state, not raycast accuracy. They still drive the real
 * Game.ts placement path: selectionModel -> enterPlacementMode() ->
 * ghostMesh position -> placeBuilding().
 */
import { test, expect, type Page } from '@playwright/test'

const BASE = 'http://127.0.0.1:4173/?runtimeTest=1'

const S = {
  Idle: 0,
  MovingToBuild: 5,
} as const

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
    // Procedural map fallback is valid for these contract tests.
  }
  await page.waitForTimeout(300)
}

async function diagnose(page: Page, label: string) {
  const snap = await page.evaluate(() => {
    const g = (window as any).__war3Game
    if (!g) return { hasGame: false }
    return {
      hasGame: true,
      gameTime: g.gameTime?.toFixed?.(2),
      placementMode: g.placementMode,
      placementWorkers: g.placementWorkers?.length ?? -1,
      selected: g.selectionModel?.units?.map((u: any) => ({
        idx: g.units.indexOf(u),
        type: u.type,
        hp: u.hp,
        state: u.state,
      })) ?? [],
      workers: g.units
        .map((u: any, idx: number) => ({ u, idx }))
        .filter(({ u }: any) => u.type === 'worker' && u.team === 0)
        .map(({ u, idx }: any) => ({
          idx,
          hp: u.hp,
          state: u.state,
          buildTargetType: u.buildTarget?.type ?? null,
          x: u.mesh.position.x,
          z: u.mesh.position.z,
        })),
    }
  })
  console.error(`\n[DIAGNOSE ${label}]`, JSON.stringify(snap, null, 2))
  return snap
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

test.describe('Building Placement Agency', () => {
  test.setTimeout(120000)

  test('single selected worker is the assigned builder even when another idle worker is nearer', async ({ page }) => {
    await waitForGame(page)

    const result = await page.evaluate(() => {
      const g = (window as any).__war3Game
      if (!g) return { ok: false, reason: 'no game' }

      g.resources.earn(0, 1000, 1000)
      const selected = g.spawnUnit('worker', 0, 30, 30)
      const nearerIdle = g.spawnUnit('worker', 0, 18, 18)
      selected.state = 0
      nearerIdle.state = 0

      g.selectionModel.clear()
      g.selectionModel.setSelection([selected])
      g.enterPlacementMode('farm')
      const savedBeforePlace = g.placementWorkers.map((w: any) => g.units.indexOf(w))

      const beforeCount = g.units.length
      let tile: { tx: number; tz: number } | null = null
      for (let tx = 18; tx <= 28 && !tile; tx++) {
        for (let tz = 18; tz <= 28 && !tile; tz++) {
          if (g.placementValidator.canPlace(tx, tz, 2)?.ok) tile = { tx, tz }
        }
      }
      if (!tile) return { ok: false, reason: 'no valid tile' }

      g.ghostMesh.position.set(tile.tx + 0.5, g.getWorldHeight(tile.tx, tile.tz) + 0.01, tile.tz + 0.5)
      g.placeBuilding()

      const building = g.units.slice(beforeCount).find((u: any) => u.type === 'farm' && u.team === 0)
      return {
        ok: true,
        selectedIdx: g.units.indexOf(selected),
        nearerIdx: g.units.indexOf(nearerIdle),
        savedBeforePlace,
        buildingExists: !!building,
        buildingBuilderIdx: building?.builder ? g.units.indexOf(building.builder) : -1,
        selectedBuildTargetIdx: selected.buildTarget ? g.units.indexOf(selected.buildTarget) : -1,
        nearerBuildTargetIdx: nearerIdle.buildTarget ? g.units.indexOf(nearerIdle.buildTarget) : -1,
        selectedState: selected.state,
        nearerState: nearerIdle.state,
        placementMode: g.placementMode,
        placementWorkersAfter: g.placementWorkers.length,
      }
    })

    if (!result.ok) await diagnose(page, 'single-selected-builder')
    expect(result.ok).toBe(true)
    expect(result.savedBeforePlace).toEqual([result.selectedIdx])
    expect(result.buildingExists).toBe(true)
    expect(result.buildingBuilderIdx).toBe(result.selectedIdx)
    expect(result.selectedBuildTargetIdx).toBeGreaterThanOrEqual(0)
    expect(result.nearerBuildTargetIdx).toBe(-1)
    expect(result.selectedState).toBe(S.MovingToBuild)
    expect(result.nearerState).toBe(S.Idle)
    expect(result.placementMode).toBeNull()
    expect(result.placementWorkersAfter).toBe(0)
    expect(severeConsoleErrors(page)).toHaveLength(0)
  })

  test('multiple selected workers use deterministic primary selection order', async ({ page }) => {
    await waitForGame(page)

    const result = await page.evaluate(() => {
      const g = (window as any).__war3Game
      if (!g) return { ok: false, reason: 'no game' }

      g.resources.earn(0, 1000, 1000)
      const primaryFar = g.spawnUnit('worker', 0, 34, 34)
      const secondaryNear = g.spawnUnit('worker', 0, 20, 20)
      primaryFar.state = 0
      secondaryNear.state = 0

      // Current rule: SelectionModel order defines primary; placementWorkers
      // preserves that order; placeBuilding chooses savedWorkers[0].
      g.selectionModel.clear()
      g.selectionModel.setSelection([primaryFar, secondaryNear])
      g.enterPlacementMode('farm')
      const savedBeforePlace = g.placementWorkers.map((w: any) => g.units.indexOf(w))

      const beforeCount = g.units.length
      let tile: { tx: number; tz: number } | null = null
      for (let tx = 19; tx <= 28 && !tile; tx++) {
        for (let tz = 19; tz <= 28 && !tile; tz++) {
          if (g.placementValidator.canPlace(tx, tz, 2)?.ok) tile = { tx, tz }
        }
      }
      if (!tile) return { ok: false, reason: 'no valid tile' }

      g.ghostMesh.position.set(tile.tx + 0.5, g.getWorldHeight(tile.tx, tile.tz) + 0.01, tile.tz + 0.5)
      g.placeBuilding()

      const building = g.units.slice(beforeCount).find((u: any) => u.type === 'farm' && u.team === 0)
      return {
        ok: true,
        primaryIdx: g.units.indexOf(primaryFar),
        secondaryIdx: g.units.indexOf(secondaryNear),
        savedBeforePlace,
        buildingBuilderIdx: building?.builder ? g.units.indexOf(building.builder) : -1,
        primaryBuildTargetIdx: primaryFar.buildTarget ? g.units.indexOf(primaryFar.buildTarget) : -1,
        secondaryBuildTargetIdx: secondaryNear.buildTarget ? g.units.indexOf(secondaryNear.buildTarget) : -1,
      }
    })

    if (!result.ok) await diagnose(page, 'multiple-selected-builder')
    expect(result.ok).toBe(true)
    expect(result.savedBeforePlace).toEqual([result.primaryIdx, result.secondaryIdx])
    expect(result.buildingBuilderIdx).toBe(result.primaryIdx)
    expect(result.primaryBuildTargetIdx).toBeGreaterThanOrEqual(0)
    expect(result.secondaryBuildTargetIdx).toBe(-1)
    expect(severeConsoleErrors(page)).toHaveLength(0)
  })

  test('invalid selected worker falls back to nearest living idle worker without crashing', async ({ page }) => {
    await waitForGame(page)

    const result = await page.evaluate(() => {
      const g = (window as any).__war3Game
      if (!g) return { ok: false, reason: 'no game' }

      g.resources.earn(0, 1000, 1000)
      const deadSelected = g.spawnUnit('worker', 0, 20, 20)
      const fallbackNear = g.spawnUnit('worker', 0, 22, 20)
      const fallbackFar = g.spawnUnit('worker', 0, 36, 36)
      deadSelected.state = 0
      fallbackNear.state = 0
      fallbackFar.state = 0

      g.selectionModel.clear()
      g.selectionModel.setSelection([deadSelected])
      g.enterPlacementMode('farm')
      deadSelected.hp = 0
      const savedBeforePlace = g.placementWorkers.map((w: any) => g.units.indexOf(w))

      const beforeCount = g.units.length
      let tile: { tx: number; tz: number } | null = null
      for (let tx = 21; tx <= 28 && !tile; tx++) {
        for (let tz = 20; tz <= 28 && !tile; tz++) {
          if (g.placementValidator.canPlace(tx, tz, 2)?.ok) tile = { tx, tz }
        }
      }
      if (!tile) return { ok: false, reason: 'no valid tile' }

      let error: string | null = null
      try {
        g.ghostMesh.position.set(tile.tx + 0.5, g.getWorldHeight(tile.tx, tile.tz) + 0.01, tile.tz + 0.5)
        g.placeBuilding()
      } catch (e) {
        error = e instanceof Error ? e.message : String(e)
      }

      const building = g.units.slice(beforeCount).find((u: any) => u.type === 'farm' && u.team === 0)
      return {
        ok: true,
        error,
        deadIdx: g.units.indexOf(deadSelected),
        fallbackNearIdx: g.units.indexOf(fallbackNear),
        fallbackFarIdx: g.units.indexOf(fallbackFar),
        savedBeforePlace,
        buildingExists: !!building,
        buildingBuilderIdx: building?.builder ? g.units.indexOf(building.builder) : -1,
        deadBuildTargetIdx: deadSelected.buildTarget ? g.units.indexOf(deadSelected.buildTarget) : -1,
        fallbackNearBuildTargetIdx: fallbackNear.buildTarget ? g.units.indexOf(fallbackNear.buildTarget) : -1,
        fallbackFarBuildTargetIdx: fallbackFar.buildTarget ? g.units.indexOf(fallbackFar.buildTarget) : -1,
        placementWorkersAfter: g.placementWorkers.length,
      }
    })

    if (!result.ok || result.error) await diagnose(page, 'invalid-selected-fallback')
    expect(result.ok).toBe(true)
    expect(result.error).toBeNull()
    expect(result.savedBeforePlace).toEqual([result.deadIdx])
    expect(result.buildingExists).toBe(true)
    expect(result.buildingBuilderIdx).toBe(result.fallbackNearIdx)
    expect(result.deadBuildTargetIdx).toBe(-1)
    expect(result.fallbackNearBuildTargetIdx).toBeGreaterThanOrEqual(0)
    expect(result.fallbackFarBuildTargetIdx).toBe(-1)
    expect(result.placementWorkersAfter).toBe(0)
    expect(severeConsoleErrors(page)).toHaveLength(0)
  })

  test('placement workers are cleared on cancel/exit placement mode', async ({ page }) => {
    await waitForGame(page)

    const result = await page.evaluate(() => {
      const g = (window as any).__war3Game
      if (!g) return { ok: false, reason: 'no game' }

      const worker = g.spawnUnit('worker', 0, 32, 30)
      g.selectionModel.clear()
      g.selectionModel.setSelection([worker])
      g.enterPlacementMode('farm')
      const beforeExit = g.placementWorkers.map((w: any) => g.units.indexOf(w))
      g.exitPlacementMode()
      return {
        ok: true,
        workerIdx: g.units.indexOf(worker),
        beforeExit,
        placementMode: g.placementMode,
        placementWorkersAfter: g.placementWorkers.length,
        ghostGone: g.ghostMesh === null,
      }
    })

    if (!result.ok) await diagnose(page, 'cancel-clears-placement-workers')
    expect(result.ok).toBe(true)
    expect(result.beforeExit).toEqual([result.workerIdx])
    expect(result.placementMode).toBeNull()
    expect(result.placementWorkersAfter).toBe(0)
    expect(result.ghostGone).toBe(true)
    expect(severeConsoleErrors(page)).toHaveLength(0)
  })

  test('shift-style appended selection is remembered in selection order before placement', async ({ page }) => {
    await waitForGame(page)

    const result = await page.evaluate(() => {
      const g = (window as any).__war3Game
      if (!g) return { ok: false, reason: 'no game' }

      const first = g.spawnUnit('worker', 0, 31, 31)
      const appended = g.spawnUnit('worker', 0, 32, 31)
      g.selectionModel.clear()
      g.selectionModel.add(first)
      // This mirrors Shift+box/Shift+append semantics at the SelectionModel
      // layer. The separate selection-input pack covers the real mouse path.
      g.selectionModel.add(appended)
      g.enterPlacementMode('farm')
      const savedBeforeExit = g.placementWorkers.map((w: any) => g.units.indexOf(w))
      g.exitPlacementMode()
      return {
        ok: true,
        firstIdx: g.units.indexOf(first),
        appendedIdx: g.units.indexOf(appended),
        savedBeforeExit,
        selectedAfterEnter: g.selectionModel.count,
        placementWorkersAfter: g.placementWorkers.length,
      }
    })

    if (!result.ok) await diagnose(page, 'shift-style-selection')
    expect(result.ok).toBe(true)
    expect(result.savedBeforeExit).toEqual([result.firstIdx, result.appendedIdx])
    expect(result.selectedAfterEnter).toBe(0)
    expect(result.placementWorkersAfter).toBe(0)
    expect(severeConsoleErrors(page)).toHaveLength(0)
  })
})
