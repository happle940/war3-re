/**
 * Death/Cleanup Regression Pack
 *
 * Runtime-proof contracts for forced death cleanup. These tests assert real
 * Game.ts state after setting hp=0 and invoking the runtime cleanup path.
 */
import { test, expect, type Page } from '@playwright/test'

const BASE = 'http://127.0.0.1:4173/?runtimeTest=1'

const S = {
  Idle: 0,
  MovingToGather: 2,
  Gathering: 3,
  Building: 6,
  Attacking: 7,
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
    // Procedural fallback is fine for cleanup contracts.
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
      units: g.units.slice(0, 30).map((u: any, idx: number) => ({
        idx,
        type: u.type,
        team: u.team,
        hp: u.hp,
        state: u.state,
        isBuilding: u.isBuilding,
        attackTargetType: u.attackTarget?.type ?? null,
        buildTargetType: u.buildTarget?.type ?? null,
        resourceTargetType: u.resourceTarget?.type ?? null,
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

test.describe('Death/Cleanup Contracts', () => {
  test.setTimeout(120000)

  test('killing a selected unit removes selection, ring, healthbar, outline, and scene mesh refs', async ({ page }) => {
    await waitForGame(page)

    const result = await page.evaluate(() => {
      const g = (window as any).__war3Game
      if (!g) return { ok: false, reason: 'no game' }

      const unit = g.spawnUnit('worker', 0, 35, 35)
      g.selectionModel.clear()
      g.clearSelectionRings()
      g.selectionModel.setSelection([unit])
      g.createSelectionRing(unit)

      const unitIdx = g.units.indexOf(unit)
      const mesh = unit.mesh
      const ring = g.selectionRings[0]
      const hadHealthbar = g.healthBars.has(unit)
      const hadOutline = g.outlineObjects.includes(mesh)
      const sceneHadMesh = g.scene.children.includes(mesh)
      const sceneHadRing = g.scene.children.includes(ring)

      unit.hp = 0
      g.handleDeadUnits()

      return {
        ok: true,
        unitIdx,
        hadHealthbar,
        hadOutline,
        sceneHadMesh,
        sceneHadRing,
        stillInUnits: g.units.includes(unit),
        stillSelected: g.selectionModel.contains(unit),
        selectedCount: g.selectionModel.count,
        ringCount: g.selectionRings.length,
        stillHasHealthbar: g.healthBars.has(unit),
        stillInOutline: g.outlineObjects.includes(mesh),
        meshStillInScene: g.scene.children.includes(mesh),
        ringStillInScene: g.scene.children.includes(ring),
      }
    })

    if (!result.ok) await diagnose(page, 'selected-unit-cleanup')
    expect(result.ok).toBe(true)
    expect(result.hadHealthbar).toBe(true)
    expect(result.hadOutline).toBe(true)
    expect(result.sceneHadMesh).toBe(true)
    expect(result.sceneHadRing).toBe(true)
    expect(result.stillInUnits).toBe(false)
    expect(result.stillSelected).toBe(false)
    expect(result.selectedCount).toBe(0)
    expect(result.ringCount).toBe(0)
    expect(result.stillHasHealthbar).toBe(false)
    expect(result.stillInOutline).toBe(false)
    expect(result.meshStillInScene).toBe(false)
    expect(result.ringStillInScene).toBe(false)
    expect(severeConsoleErrors(page)).toHaveLength(0)
  })

  test('killing an attack target clears attacker target and exits attacking state', async ({ page }) => {
    await waitForGame(page)

    const result = await page.evaluate(() => {
      const g = (window as any).__war3Game
      if (!g) return { ok: false, reason: 'no game' }

      const attacker = g.spawnUnit('footman', 0, 36, 36)
      const target = g.spawnUnit('footman', 1, 38, 36)
      attacker.attackTarget = target
      attacker.state = 7

      target.hp = 0
      g.handleDeadUnits()

      return {
        ok: true,
        targetRemoved: !g.units.includes(target),
        attackTarget: attacker.attackTarget ? g.units.indexOf(attacker.attackTarget) : -1,
        attackerState: attacker.state,
        attackerMoveTarget: !!attacker.moveTarget,
      }
    })

    if (!result.ok) await diagnose(page, 'attack-target-cleanup')
    expect(result.ok).toBe(true)
    expect(result.targetRemoved).toBe(true)
    expect(result.attackTarget).toBe(-1)
    expect(result.attackerState).toBe(S.Idle)
    expect(result.attackerMoveTarget).toBe(false)
    expect(severeConsoleErrors(page)).toHaveLength(0)
  })

  test('killing a building releases its footprint for future placement', async ({ page }) => {
    await waitForGame(page)

    const result = await page.evaluate(() => {
      const g = (window as any).__war3Game
      if (!g) return { ok: false, reason: 'no game' }

      let tile: { tx: number; tz: number } | null = null
      for (let tx = 40; tx <= 60 && !tile; tx++) {
        for (let tz = 40; tz <= 60 && !tile; tz++) {
          if (g.placementValidator.canPlace(tx, tz, 2)?.ok) tile = { tx, tz }
        }
      }
      if (!tile) return { ok: false, reason: 'no valid tile' }

      const beforePlace = g.placementValidator.canPlace(tile.tx, tile.tz, 2)
      const farm = g.spawnBuilding('farm', 0, tile.tx, tile.tz)
      const duringPlace = g.placementValidator.canPlace(tile.tx, tile.tz, 2)

      farm.hp = 0
      g.handleDeadUnits()

      const afterDeath = g.placementValidator.canPlace(tile.tx, tile.tz, 2)
      return {
        ok: true,
        tx: tile.tx,
        tz: tile.tz,
        beforeOk: beforePlace.ok,
        duringOk: duringPlace.ok,
        duringReason: duringPlace.reason,
        afterOk: afterDeath.ok,
        afterReason: afterDeath.reason,
        farmRemoved: !g.units.includes(farm),
      }
    })

    if (!result.ok) await diagnose(page, 'building-footprint-release')
    expect(result.ok).toBe(true)
    expect(result.beforeOk).toBe(true)
    expect(result.duringOk).toBe(false)
    expect(result.duringReason).toBe('occupied')
    expect(result.afterOk).toBe(true)
    expect(result.afterReason).toBe('ok')
    expect(result.farmRemoved).toBe(true)
    expect(severeConsoleErrors(page)).toHaveLength(0)
  })

  test('killing an under-construction building clears builder state and buildTarget', async ({ page }) => {
    await waitForGame(page)

    const result = await page.evaluate(() => {
      const g = (window as any).__war3Game
      if (!g) return { ok: false, reason: 'no game' }

      const builder = g.spawnUnit('worker', 0, 42, 42)
      const farm = g.spawnBuilding('farm', 0, 45, 45)
      farm.buildProgress = 0.25
      farm.builder = builder
      builder.buildTarget = farm
      builder.state = 6
      builder.moveTarget = farm.mesh.position.clone()

      farm.hp = 0
      g.handleDeadUnits()

      return {
        ok: true,
        farmRemoved: !g.units.includes(farm),
        builderState: builder.state,
        builderBuildTarget: builder.buildTarget ? g.units.indexOf(builder.buildTarget) : -1,
        builderMoveTarget: !!builder.moveTarget,
        builderResourceTarget: !!builder.resourceTarget,
      }
    })

    if (!result.ok) await diagnose(page, 'under-construction-cleanup')
    expect(result.ok).toBe(true)
    expect(result.farmRemoved).toBe(true)
    expect(result.builderBuildTarget).toBe(-1)
    expect(result.builderState).toBe(S.Idle)
    expect(result.builderMoveTarget).toBe(false)
    expect(result.builderResourceTarget).toBe(false)
    expect(severeConsoleErrors(page)).toHaveLength(0)
  })

  test('invalid resource target is cleared by gather state recovery without crashing', async ({ page }) => {
    await waitForGame(page)

    const result = await page.evaluate(() => {
      const g = (window as any).__war3Game
      if (!g) return { ok: false, reason: 'no game' }

      for (const u of g.units) {
        if (u.type === 'goldmine') u.remainingGold = 0
      }

      const worker = g.spawnUnit('worker', 0, 46, 46)
      const mine = g.units.find((u: any) => u.type === 'goldmine')
      if (!mine) return { ok: false, reason: 'no goldmine' }

      worker.gatherType = 'gold'
      worker.resourceTarget = { type: 'goldmine', mine }
      worker.state = 2
      worker.moveTarget = null

      let error: string | null = null
      try {
        g.updateUnitState(worker, 0.016)
      } catch (e) {
        error = e instanceof Error ? e.message : String(e)
      }

      return {
        ok: true,
        error,
        workerState: worker.state,
        resourceTarget: worker.resourceTarget ? worker.resourceTarget.type : null,
        gatherType: worker.gatherType,
      }
    })

    if (!result.ok || result.error) await diagnose(page, 'resource-target-cleanup')
    expect(result.ok).toBe(true)
    expect(result.error).toBeNull()
    expect(result.workerState).toBe(S.Idle)
    expect(result.resourceTarget).toBeNull()
    expect(result.gatherType).toBe('gold')
    expect(severeConsoleErrors(page)).toHaveLength(0)
  })
})
