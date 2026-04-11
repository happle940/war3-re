/**
 * Construction Lifecycle Regression Pack
 *
 * Runtime-proof contracts for Warcraft-like construction lifecycle baseline:
 * interrupted construction stays resumable, valid workers can resume it, and
 * cancel removes the building with deterministic cleanup/refund behavior.
 */
import { test, expect, type Page } from '@playwright/test'

const BASE = 'http://127.0.0.1:4173'

const S = {
  Idle: 0,
  MovingToBuild: 5,
  Building: 6,
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
    // Procedural fallback is valid for construction lifecycle contracts.
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
      selectedCount: g.selectionModel?.count ?? -1,
      ringCount: g.selectionRings?.length ?? -1,
      resources: g.resources?.get(0),
      units: g.units.slice(0, 40).map((u: any, idx: number) => ({
        idx,
        type: u.type,
        team: u.team,
        hp: u.hp,
        state: u.state,
        isBuilding: u.isBuilding,
        buildProgress: u.buildProgress,
        buildTargetType: u.buildTarget?.type ?? null,
        builderType: u.builder?.type ?? null,
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

test.describe('Construction Lifecycle Contracts', () => {
  test.setTimeout(120000)

  test('stopping an active builder leaves construction resumable', async ({ page }) => {
    await waitForGame(page)

    const result = await page.evaluate(() => {
      const g = (window as any).__war3Game
      if (!g) return { ok: false, reason: 'no game' }

      const builder = g.spawnUnit('worker', 0, 34, 34)
      const farm = g.spawnBuilding('farm', 0, 37, 34)
      farm.buildProgress = 0.25
      farm.builder = builder
      builder.buildTarget = farm
      builder.state = 6
      builder.moveTarget = null

      g.updateBuildProgress(farm, 1)
      const progressAfterBuildTick = farm.buildProgress

      g.selectionModel.clear()
      g.selectionModel.setSelection([builder])
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 's', bubbles: true }))

      return {
        ok: true,
        farmStillExists: g.units.includes(farm),
        progressAfterBuildTick,
        progressAfterStop: farm.buildProgress,
        builderState: builder.state,
        builderBuildTarget: builder.buildTarget ? g.units.indexOf(builder.buildTarget) : -1,
        farmCanBeResumed: farm.buildProgress > 0 && farm.buildProgress < 1 && g.units.includes(farm),
      }
    })

    if (!result.ok) await diagnose(page, 'stop-builder-resumable')
    expect(result.ok).toBe(true)
    expect(result.farmStillExists).toBe(true)
    expect(result.progressAfterBuildTick).toBeGreaterThan(0.25)
    expect(result.progressAfterStop).toBe(result.progressAfterBuildTick)
    expect(result.builderState).toBe(S.Idle)
    expect(result.builderBuildTarget).toBe(-1)
    expect(result.farmCanBeResumed).toBe(true)
    expect(severeConsoleErrors(page)).toHaveLength(0)
  })

  test('a valid worker can resume interrupted construction', async ({ page }) => {
    await waitForGame(page)

    const result = await page.evaluate(() => {
      const g = (window as any).__war3Game
      if (!g) return { ok: false, reason: 'no game' }

      const worker = g.spawnUnit('worker', 0, 40, 40)
      const farm = g.spawnBuilding('farm', 0, 42, 40)
      farm.buildProgress = 0.4
      farm.builder = null
      worker.state = 0
      worker.buildTarget = null

      const assigned = g.assignBuilderToConstruction(worker, farm)
      worker.moveTarget = null
      g.updateUnitState(worker, 0.016)
      g.updateBuildProgress(farm, 1)

      return {
        ok: true,
        assigned,
        workerState: worker.state,
        workerBuildTarget: worker.buildTarget ? g.units.indexOf(worker.buildTarget) : -1,
        farmIdx: g.units.indexOf(farm),
        farmBuilderIdx: farm.builder ? g.units.indexOf(farm.builder) : -1,
        workerIdx: g.units.indexOf(worker),
        progressAfterResume: farm.buildProgress,
      }
    })

    if (!result.ok) await diagnose(page, 'worker-resume')
    expect(result.ok).toBe(true)
    expect(result.assigned).toBe(true)
    expect(result.workerState).toBe(S.Building)
    expect(result.workerBuildTarget).toBe(result.farmIdx)
    expect(result.farmBuilderIdx).toBe(result.workerIdx)
    expect(result.progressAfterResume).toBeGreaterThan(0.4)
    expect(severeConsoleErrors(page)).toHaveLength(0)
  })

  test('canceling under-construction building removes it and releases occupancy', async ({ page }) => {
    await waitForGame(page)

    const result = await page.evaluate(() => {
      const g = (window as any).__war3Game
      if (!g) return { ok: false, reason: 'no game' }

      let tile: { tx: number; tz: number } | null = null
      for (let tx = 44; tx <= 58 && !tile; tx++) {
        for (let tz = 30; tz <= 45 && !tile; tz++) {
          if (g.placementValidator.canPlace(tx, tz, 2)?.ok) tile = { tx, tz }
        }
      }
      if (!tile) return { ok: false, reason: 'no valid tile' }

      const before = g.placementValidator.canPlace(tile.tx, tile.tz, 2)
      const farm = g.spawnBuilding('farm', 0, tile.tx, tile.tz)
      farm.buildProgress = 0.5
      const during = g.placementValidator.canPlace(tile.tx, tile.tz, 2)
      const canceled = g.cancelConstruction(farm)
      const after = g.placementValidator.canPlace(tile.tx, tile.tz, 2)

      return {
        ok: true,
        canceled,
        beforeOk: before.ok,
        duringOk: during.ok,
        duringReason: during.reason,
        afterOk: after.ok,
        afterReason: after.reason,
        farmStillInUnits: g.units.includes(farm),
      }
    })

    if (!result.ok) await diagnose(page, 'cancel-release-occupancy')
    expect(result.ok).toBe(true)
    expect(result.beforeOk).toBe(true)
    expect(result.duringOk).toBe(false)
    expect(result.duringReason).toBe('occupied')
    expect(result.canceled).toBe(true)
    expect(result.afterOk).toBe(true)
    expect(result.afterReason).toBe('ok')
    expect(result.farmStillInUnits).toBe(false)
    expect(severeConsoleErrors(page)).toHaveLength(0)
  })

  test('cancel refund is deterministic and cannot be duplicated', async ({ page }) => {
    await waitForGame(page)

    const result = await page.evaluate(() => {
      const g = (window as any).__war3Game
      if (!g) return { ok: false, reason: 'no game' }

      const farmCost = { gold: 80, lumber: 20 }
      const expectedRefund = { gold: 60, lumber: 15 } // floor(75% of total cost)

      g.resources.earn(0, 500, 500)
      const before = g.resources.get(0)
      g.resources.spend(0, farmCost)
      const afterSpend = g.resources.get(0)

      const farm = g.spawnBuilding('farm', 0, 48, 48)
      farm.buildProgress = 0.5
      const firstCancel = g.cancelConstruction(farm)
      const afterFirstCancel = g.resources.get(0)
      const secondCancel = g.cancelConstruction(farm)
      const afterSecondCancel = g.resources.get(0)

      return {
        ok: true,
        before,
        afterSpend,
        expectedRefund,
        firstCancel,
        afterFirstCancel,
        secondCancel,
        afterSecondCancel,
      }
    })

    if (!result.ok) await diagnose(page, 'cancel-refund')
    expect(result.ok).toBe(true)
    expect(result.afterSpend.gold).toBe(result.before.gold - 80)
    expect(result.afterSpend.lumber).toBe(result.before.lumber - 20)
    expect(result.firstCancel).toBe(true)
    expect(result.afterFirstCancel.gold).toBe(result.afterSpend.gold + result.expectedRefund.gold)
    expect(result.afterFirstCancel.lumber).toBe(result.afterSpend.lumber + result.expectedRefund.lumber)
    expect(result.secondCancel).toBe(false)
    expect(result.afterSecondCancel).toEqual(result.afterFirstCancel)
    expect(severeConsoleErrors(page)).toHaveLength(0)
  })

  test('cancel command on selected construction leaves selection and HUD valid', async ({ page }) => {
    await waitForGame(page)

    const result = await page.evaluate(() => {
      const g = (window as any).__war3Game
      if (!g) return { ok: false, reason: 'no game' }

      const farm = g.spawnBuilding('farm', 0, 52, 52)
      farm.buildProgress = 0.35
      g.selectionModel.clear()
      g.clearSelectionRings()
      g.selectionModel.setSelection([farm])
      g.createSelectionRing(farm)
      g.updateHUD(0.016)

      const buttonsBefore = Array.from(document.querySelectorAll('#command-card button'))
        .map((btn: any) => btn.textContent ?? '')
      const cancelButton = Array.from(document.querySelectorAll('#command-card button'))
        .find((btn: any) => (btn.textContent ?? '').includes('取消')) as HTMLButtonElement | undefined
      cancelButton?.click()
      g.updateHUD(0.016)

      return {
        ok: true,
        hadCancelButton: !!cancelButton,
        buttonsBefore,
        farmStillInUnits: g.units.includes(farm),
        selectedCount: g.selectionModel.count,
        ringCount: g.selectionRings.length,
        commandChildren: document.querySelectorAll('#command-card > *').length,
        unitName: document.getElementById('unit-name')?.textContent ?? '',
      }
    })

    if (!result.ok || !result.hadCancelButton) await diagnose(page, 'cancel-selected-hud')
    expect(result.ok).toBe(true)
    expect(result.hadCancelButton).toBe(true)
    expect(result.buttonsBefore.some((text: string) => text.includes('取消'))).toBe(true)
    expect(result.farmStillInUnits).toBe(false)
    expect(result.selectedCount).toBe(0)
    expect(result.ringCount).toBe(0)
    expect(result.commandChildren).toBe(8)
    expect(result.unitName).toBe('未选择单位')
    expect(severeConsoleErrors(page)).toHaveLength(0)
  })

  test('canceling construction clears builder state and buildTarget', async ({ page }) => {
    await waitForGame(page)

    const result = await page.evaluate(() => {
      const g = (window as any).__war3Game
      if (!g) return { ok: false, reason: 'no game' }

      const builder = g.spawnUnit('worker', 0, 55, 55)
      const farm = g.spawnBuilding('farm', 0, 57, 55)
      farm.buildProgress = 0.5
      farm.builder = builder
      builder.buildTarget = farm
      builder.state = 6
      builder.moveTarget = farm.mesh.position.clone()
      builder.waypoints = [farm.mesh.position.clone()]

      const canceled = g.cancelConstruction(farm)

      return {
        ok: true,
        canceled,
        farmStillInUnits: g.units.includes(farm),
        builderState: builder.state,
        builderBuildTarget: builder.buildTarget ? g.units.indexOf(builder.buildTarget) : -1,
        builderMoveTarget: !!builder.moveTarget,
        builderWaypoints: builder.waypoints.length,
        builderResourceTarget: !!builder.resourceTarget,
      }
    })

    if (!result.ok) await diagnose(page, 'cancel-builder-cleanup')
    expect(result.ok).toBe(true)
    expect(result.canceled).toBe(true)
    expect(result.farmStillInUnits).toBe(false)
    expect(result.builderState).toBe(S.Idle)
    expect(result.builderBuildTarget).toBe(-1)
    expect(result.builderMoveTarget).toBe(false)
    expect(result.builderWaypoints).toBe(0)
    expect(result.builderResourceTarget).toBe(false)
    expect(severeConsoleErrors(page)).toHaveLength(0)
  })
})
