/**
 * Mining Saturation Regression
 *
 * Runtime-proof contract for the Human/Orc-style gold loop:
 * - a goldmine exposes at most 5 active gather slots
 * - overflow workers wait instead of creating >5 concurrent gatherers
 * - at the default Town Hall / Gold Mine spacing, the 5th worker still adds
 *   meaningful income while the 6th worker has sharply diminishing returns
 *
 * This spec intentionally measures the whole economy loop as a system:
 * distance to mine, worker speed, gather timing, return trip, and slot limit.
 */
import { test, expect, type Page } from '@playwright/test'

const BASE = 'http://127.0.0.1:4173/?runtimeTest=1'
const GOLDMINE_MAX_WORKERS = 5
const GOLD_PER_TRIP = 10

type ScenarioMetrics = {
  workers: number
  earnedGold: number
}

async function waitForGame(page: Page) {
  let consoleErrors = (page as any).__consoleErrors as string[] | undefined
  if (!consoleErrors) {
    consoleErrors = []
    page.on('console', (msg) => {
      if (msg.type() === 'error') consoleErrors!.push(msg.text())
    })
    ;(page as any).__consoleErrors = consoleErrors
  }

  await page.goto(BASE, { waitUntil: 'domcontentloaded' })

  try {
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
  } catch (e) {
    throw new Error(
      `waitForGame failed. Console: ${consoleErrors.slice(-5).join(' | ')}. ` +
      `Original: ${(e as Error).message}`,
    )
  }

  try {
    await page.waitForFunction(() => {
      const status = document.getElementById('map-status')?.textContent ?? ''
      return !status.includes('正在加载')
    }, { timeout: 15000 })
  } catch { /* runtimeTest fast path uses procedural map */ }

  await page.waitForTimeout(300)
}

async function measureGoldScenario(page: Page, activeCount: number, freshRuntime = true) {
  if (freshRuntime) await waitForGame(page)

  const result = await page.evaluate(({ activeCount }) => {
    const g = (window as any).__war3Game
    if (!g) return { ok: false, reason: 'no game' }

    const teamStore = g.resources.teams?.get?.(0)
    if (!teamStore) return { ok: false, reason: 'no team resources' }

    if (g.ai) {
      if (typeof g.ai.reset === 'function') g.ai.reset()
      g.ai.update = () => {}
    }

    const townhall = g.units.find((u: any) => u.team === 0 && u.type === 'townhall' && u.hp > 0)
    const mine = g.units.find((u: any) => u.type === 'goldmine' && u.hp > 0 && u.remainingGold > 0)
    if (!townhall || !mine) return { ok: false, reason: 'missing townhall or mine' }

    const workers: any[] = g.units
      .filter((u: any) => u.team === 0 && u.type === 'worker' && u.hp > 0)
      .slice(0, 5)

    while (workers.length < 6) {
      workers.push(g.spawnUnit('worker', 0, 10 + workers.length, 11))
    }

    const townhallPos = townhall.mesh.position.clone()
    const minePos = mine.mesh.position.clone()
    const thTx = Math.round(townhall.mesh.position.x - 0.5)
    const thTz = Math.round(townhall.mesh.position.z - 0.5)
    const openingWorkerOffsets = [
      { x: -1, z: 5 },
      { x: 0, z: 5 },
      { x: 1, z: 5 },
      { x: 2, z: 5 },
      { x: 3, z: 5 },
      { x: 4, z: 5 },
    ]

    const resetWorker = (worker: any, idx: number, active: boolean) => {
      const offset = openingWorkerOffsets[idx] ?? openingWorkerOffsets[openingWorkerOffsets.length - 1]
      const x = active ? thTx + offset.x + 0.5 : thTx + 16 + idx
      const z = active ? thTz + offset.z + 0.5 : thTz + 16
      worker.mesh.position.set(x, g.getWorldHeight(x - 0.5, z - 0.5), z)
      worker.mesh.rotation.set(0, 0, 0)
      worker.moveTarget = null
      worker.waypoints = []
      worker.moveQueue = []
      worker.attackTarget = null
      worker.attackMoveTarget = null
      worker.attackTimer = 0
      worker.buildTarget = null
      worker.previousState = null
      worker.previousGatherType = null
      worker.previousResourceTarget = null
      worker.previousMoveTarget = null
      worker.previousWaypoints = []
      worker.previousMoveQueue = []
      worker.previousAttackMoveTarget = null
      worker.aggroSuppressUntil = 0
      worker.carryAmount = 0
      worker.gatherTimer = 0
      worker.state = 0
      worker.gatherType = null
      worker.resourceTarget = null
      worker.goldLoopSlotMine = null
      worker.goldStandMine = null
    }

    teamStore.gold = 0
    teamStore.lumber = 0
    mine.remainingGold = 100000

    for (let i = 0; i < workers.length; i++) {
      resetWorker(workers[i], i, i < activeCount)
    }

    const activeWorkers = workers.slice(0, activeCount)
    if (activeWorkers.length > 0) {
      g.issueCommand(activeWorkers, {
        type: 'gather',
        resourceType: 'gold',
        target: minePos.clone(),
      })
      for (const worker of activeWorkers) {
        worker.resourceTarget = { type: 'goldmine', mine }
      }
      g.planPathForUnitsToBuildingInteraction(activeWorkers, mine)
    }

    for (let t = 0; t < 60; t += 0.05) {
      g.update(0.05)
    }

    return {
      ok: true,
      workers: activeCount,
      earnedGold: teamStore.gold,
      hallMineDistance: townhallPos.distanceTo(minePos),
      workerSpeed: workers[0]?.speed ?? null,
    }
  }, { activeCount })

  if (!result?.ok) await diagnose(page, `curve-scenario-${activeCount}-no-game`)
  return result
}

async function diagnose(page: Page, label: string) {
  const snap = await page.evaluate(() => {
    const g = (window as any).__war3Game
    if (!g) return { hasGame: false }
    const units = g.units ?? []
    const res0 = g.resources?.get(0)
    const townhall = units.find((u: any) => u.team === 0 && u.type === 'townhall' && u.hp > 0)
    const mine = units.find((u: any) => u.type === 'goldmine' && u.remainingGold > 0)
    return {
      hasGame: true,
      gameTime: g.gameTime?.toFixed(2),
      totalUnits: units.length,
      gold: res0?.gold,
      lumber: res0?.lumber,
      workerCount: units.filter((u: any) => u.team === 0 && u.type === 'worker' && u.hp > 0).length,
      townhall: townhall ? { x: townhall.mesh.position.x, z: townhall.mesh.position.z } : null,
      mine: mine ? { x: mine.mesh.position.x, z: mine.mesh.position.z, gold: mine.remainingGold } : null,
    }
  })
  console.error(`\n[DIAGNOSE ${label}]`, JSON.stringify(snap, null, 2))
  return snap
}

test.describe('Mining Saturation Regression', () => {
  test.setTimeout(180000)

  test('goldmine never exposes more than five simultaneous active gatherers', async ({ page }) => {
    await waitForGame(page)

    const result = await page.evaluate(({ maxWorkers }) => {
      const g = (window as any).__war3Game
      if (!g) return { ok: false, reason: 'no game' }

      const units = g.units
      const mine = units.find((u: any) => u.type === 'goldmine' && u.hp > 0 && u.remainingGold > 0)
      if (!mine) return { ok: false, reason: 'no goldmine' }

      const workers: any[] = units
        .filter((u: any) => u.team === 0 && u.type === 'worker' && u.hp > 0)
        .slice(0, 5)
      while (workers.length < 6) {
        workers.push(g.spawnUnit('worker', 0, 18 + workers.length, 11))
      }

      for (let i = 0; i < workers.length; i++) {
        const worker = workers[i]
        worker.mesh.position.set(16 + (i % 3) * 0.18, worker.mesh.position.y, 10.8 + Math.floor(i / 3) * 0.18)
        worker.moveTarget = null
        worker.waypoints = []
        worker.moveQueue = []
        worker.attackTarget = null
        worker.attackMoveTarget = null
        worker.buildTarget = null
        worker.gatherType = 'gold'
        worker.resourceTarget = { type: 'goldmine', mine }
        worker.carryAmount = 0
        worker.gatherTimer = 0
        worker.state = 2 // UnitState.MovingToGather
        worker.goldLoopSlotMine = null
        worker.goldStandMine = null
      }

      let maxGathering = 0
      let maxWaiting = 0
      let waitObserved = false

      for (let t = 0; t < 10; t += 0.1) {
        g.update(0.1)

        const gathering = workers.filter((u: any) =>
          u.hp > 0 &&
          u.gatherType === 'gold' &&
          u.state === 3 &&
          u.resourceTarget?.type === 'goldmine' &&
          u.resourceTarget.mine === mine,
        ).length

        const waiting = workers.filter((u: any) =>
          u.hp > 0 &&
          u.gatherType === 'gold' &&
          u.state === 2 &&
          !u.moveTarget &&
          u.resourceTarget?.type === 'goldmine' &&
          u.resourceTarget.mine === mine,
        ).length

        maxGathering = Math.max(maxGathering, gathering)
        maxWaiting = Math.max(maxWaiting, waiting)
        if (gathering >= maxWorkers && waiting > 0) waitObserved = true
      }

      return {
        ok: true,
        maxGathering,
        maxWaiting,
        waitObserved,
      }
    }, { maxWorkers: GOLDMINE_MAX_WORKERS })

    if (!result?.ok) await diagnose(page, 'slot-cap-no-game')
    expect(result).not.toBeNull()
    expect(result!.ok).toBe(true)
    expect(
      result!.maxGathering,
      `goldmine exposed ${result!.maxGathering} concurrent gatherers; cap should stay at ${GOLDMINE_MAX_WORKERS}`,
    ).toBeLessThanOrEqual(GOLDMINE_MAX_WORKERS)
    expect(
      result!.waitObserved,
      `overflow worker never entered visible wait state near the mine; maxWaiting=${result!.maxWaiting}`,
    ).toBe(true)
  })

  test('default economy scale approaches saturation at five gold workers', async ({ page }) => {
    await waitForGame(page)

    const scenarios: ScenarioMetrics[] = []
    let hallMineDistance = 0
    let workerSpeed = 0

    for (let n = 1; n <= 6; n++) {
      const result = await measureGoldScenario(page, n, false)
      expect(result).not.toBeNull()
      expect(result!.ok).toBe(true)
      scenarios.push({
        workers: result!.workers,
        earnedGold: result!.earnedGold,
      })
      hallMineDistance = result!.hallMineDistance
      workerSpeed = result!.workerSpeed
    }

    const byWorkers = new Map<number, number>(
      scenarios.map((item: ScenarioMetrics) => [item.workers, item.earnedGold]),
    )

    const gold4 = byWorkers.get(4) ?? -1
    const gold5 = byWorkers.get(5) ?? -1
    const gold6 = byWorkers.get(6) ?? -1
    const gain45 = gold5 - gold4
    const gain56 = gold6 - gold5

    expect(
      hallMineDistance,
      `unexpected hall-mine spacing: ${hallMineDistance}`,
    ).toBeGreaterThan(3)
    expect(
      workerSpeed,
      `worker speed missing from runtime snapshot`,
    ).toBeGreaterThan(0)

    for (let n = 2; n <= 6; n++) {
      const prev = byWorkers.get(n - 1) ?? -1
      const curr = byWorkers.get(n) ?? -1
      const samplingTolerance = n === 6 ? GOLD_PER_TRIP : 0
      expect(
        curr + samplingTolerance,
        `gold curve regressed: ${n} workers earned less than ${n - 1}. curve=${JSON.stringify(scenarios)}`,
      ).toBeGreaterThanOrEqual(prev)
    }

    expect(
      gain45,
      `5th worker should still materially increase income at default spacing. curve=${JSON.stringify(scenarios)}`,
    ).toBeGreaterThanOrEqual(40)

    expect(
      gain56,
      `6th worker should be near saturation, not open a fresh linear income step. curve=${JSON.stringify(scenarios)}`,
    ).toBeLessThanOrEqual(Math.max(20, Math.floor(gain45 * 0.5)))
  })

  test('default opening miners walk a visible route before entering the goldmine', async ({ page }) => {
    await waitForGame(page)

    const result = await page.evaluate(() => {
      const g = (window as any).__war3Game
      if (!g) return { ok: false, reason: 'no game' }

      if (g.ai) {
        if (typeof g.ai.reset === 'function') g.ai.reset()
        g.ai.update = () => {}
      }

      const townhall = g.units.find((u: any) => u.team === 0 && u.type === 'townhall' && u.hp > 0)
      const mine = g.units.find((u: any) => u.type === 'goldmine' && u.hp > 0 && u.remainingGold > 0)
      if (!townhall || !mine) return { ok: false, reason: 'missing townhall or mine' }

      const workers: any[] = g.units
        .filter((u: any) => u.team === 0 && u.type === 'worker' && u.hp > 0)
        .slice(0, 5)
      if (workers.length < 5) return { ok: false, reason: 'missing starting workers' }

      const thTx = Math.round(townhall.mesh.position.x - 0.5)
      const thTz = Math.round(townhall.mesh.position.z - 0.5)
      const openingWorkerOffsets = [
        { x: -1, z: 5 },
        { x: 0, z: 5 },
        { x: 1, z: 5 },
        { x: 2, z: 5 },
        { x: 3, z: 5 },
      ]

      const footprint = (building: any) => {
        const tx = Math.round(building.mesh.position.x - 0.5)
        const tz = Math.round(building.mesh.position.z - 0.5)
        const size = 3
        return { minX: tx, minZ: tz, maxX: tx + size, maxZ: tz + size }
      }
      const distanceToFootprint = (worker: any, building: any) => {
        const fp = footprint(building)
        const x = worker.mesh.position.x
        const z = worker.mesh.position.z
        const dx = x < fp.minX ? fp.minX - x : x > fp.maxX ? x - fp.maxX : 0
        const dz = z < fp.minZ ? fp.minZ - z : z > fp.maxZ ? z - fp.maxZ : 0
        return Math.sqrt(dx * dx + dz * dz)
      }

      const initialPositions: { x: number; z: number }[] = []
      workers.forEach((worker, idx) => {
        const offset = openingWorkerOffsets[idx]
        const x = thTx + offset.x + 0.5
        const z = thTz + offset.z + 0.5
        worker.mesh.position.set(x, g.getWorldHeight(x - 0.5, z - 0.5), z)
        worker.mesh.rotation.set(0, 0, 0)
        worker.moveTarget = null
        worker.waypoints = []
        worker.moveQueue = []
        worker.attackTarget = null
        worker.attackMoveTarget = null
        worker.buildTarget = null
        worker.carryAmount = 0
        worker.gatherTimer = 0
        worker.state = 0
        worker.gatherType = null
        worker.resourceTarget = null
        worker.goldLoopSlotMine = null
        worker.goldStandMine = null
        initialPositions.push({ x, z })
      })

      g.issueCommand(workers, {
        type: 'gather',
        resourceType: 'gold',
        target: mine.mesh.position.clone(),
      })
      for (const worker of workers) {
        worker.resourceTarget = { type: 'goldmine', mine }
      }
      g.planPathForUnitsToBuildingInteraction(workers, mine)

      const initialMovingWorkers = workers.filter((worker) =>
        worker.state === 2 &&
        worker.gatherType === 'gold' &&
        worker.resourceTarget?.type === 'goldmine' &&
        worker.resourceTarget.mine === mine &&
        !!worker.moveTarget,
      ).length

      const initialMineDistances = workers.map(worker => distanceToFootprint(worker, mine))
      const travelBeforeGather = new Array(workers.length).fill(null)
      const maxTravel = new Array(workers.length).fill(0)

      for (let t = 0; t < 15; t += 0.05) {
        g.update(0.05)
        workers.forEach((worker, idx) => {
          const start = initialPositions[idx]
          const dx = worker.mesh.position.x - start.x
          const dz = worker.mesh.position.z - start.z
          const travelled = Math.sqrt(dx * dx + dz * dz)
          maxTravel[idx] = Math.max(maxTravel[idx], travelled)
          if (travelBeforeGather[idx] === null && worker.state === 3) {
            travelBeforeGather[idx] = travelled
          }
        })
      }

      return {
        ok: true,
        workerSpeed: workers[0]?.speed ?? 0,
        initialMovingWorkers,
        minInitialMineDistance: Math.min(...initialMineDistances),
        minTravelBeforeGather: Math.min(...travelBeforeGather.filter((value) => value !== null)),
        maxTravel,
        travelBeforeGather,
        enteredGatherCount: travelBeforeGather.filter((value) => value !== null).length,
        states: workers.map((worker) => worker.state),
        hasMoveTarget: workers.map((worker) => !!worker.moveTarget),
        positions: workers.map((worker) => ({ x: worker.mesh.position.x, z: worker.mesh.position.z })),
      }
    })

    expect(result.ok, result.reason ?? 'opening mining trajectory proof failed').toBe(true)
    expect(result.workerSpeed, 'worker speed should use slow peasant scale, not cavalry scale').toBeLessThan(3)
    expect(result.initialMovingWorkers, 'all opening workers should start with a real mine path').toBe(5)
    expect(result.minInitialMineDistance, 'workers should not spawn inside the mine interaction range').toBeGreaterThan(2)
    expect(result.enteredGatherCount, `not all workers entered the mine: ${JSON.stringify(result)}`).toBe(5)
    expect(
      result.minTravelBeforeGather,
      `workers must visibly travel before disappearing into mine: ${JSON.stringify(result)}`,
    ).toBeGreaterThanOrEqual(2)
  })

  test('default opening workers path to standable mine edges and keep producing gold', async ({ page }) => {
    await waitForGame(page)

    const result = await page.evaluate(() => {
      const g = (window as any).__war3Game
      if (!g) return { ok: false, reason: 'no game' }

      if (g.ai) {
        if (typeof g.ai.reset === 'function') g.ai.reset()
        g.ai.update = () => {}
      }

      const teamStore = g.resources.teams?.get?.(0)
      const townhall = g.units.find((u: any) => u.team === 0 && u.type === 'townhall' && u.hp > 0)
      const mine = g.units.find((u: any) => u.type === 'goldmine' && u.hp > 0 && u.remainingGold > 0)
      if (!teamStore || !townhall || !mine) return { ok: false, reason: 'missing team resources, townhall, or mine' }

      const workers: any[] = g.units
        .filter((u: any) => u.team === 0 && u.type === 'worker' && u.hp > 0)
        .slice(0, 5)
      if (workers.length < 5) return { ok: false, reason: 'missing starting workers' }

      const thTx = Math.round((townhall?.mesh.position.x ?? 10.5) - 0.5)
      const thTz = Math.round((townhall?.mesh.position.z ?? 12.5) - 0.5)
      const openingWorkerOffsets = [
        { x: -1, z: 5 },
        { x: 0, z: 5 },
        { x: 1, z: 5 },
        { x: 2, z: 5 },
        { x: 3, z: 5 },
      ]

      const resetWorker = (worker: any, idx: number) => {
        const offset = openingWorkerOffsets[idx] ?? openingWorkerOffsets[openingWorkerOffsets.length - 1]
        const x = thTx + offset.x + 0.5
        const z = thTz + offset.z + 0.5
        worker.mesh.position.set(x, g.getWorldHeight(x - 0.5, z - 0.5), z)
        worker.moveTarget = null
        worker.waypoints = []
        worker.moveQueue = []
        worker.attackTarget = null
        worker.attackMoveTarget = null
        worker.buildTarget = null
        worker.carryAmount = 0
        worker.gatherTimer = 0
        worker.state = 0
        worker.gatherType = null
        worker.resourceTarget = null
        worker.goldLoopSlotMine = null
        worker.goldStandMine = null
      }

      teamStore.gold = 0
      mine.remainingGold = 100000

      workers.forEach(resetWorker)
      g.issueCommand(workers, {
        type: 'gather',
        resourceType: 'gold',
        target: mine.mesh.position.clone(),
      })
      for (const worker of workers) {
        worker.resourceTarget = { type: 'goldmine', mine }
      }
      g.planPathForUnitsToBuildingInteraction(workers, mine)

      const plannedBlockedTargets: any[] = []
      for (const worker of workers) {
        const points = [
          worker.moveTarget,
          ...(Array.isArray(worker.waypoints) ? worker.waypoints : []),
        ].filter(Boolean)
        for (const point of points) {
          const tx = Math.floor(point.x)
          const tz = Math.floor(point.z)
          if (g.pathingGrid?.isBlocked(tx, tz)) plannedBlockedTargets.push({ tx, tz })
        }
      }

      for (let t = 0; t < 90; t += 0.05) {
        g.update(0.05)
      }

      const stuckFarWorkers = workers.filter((worker) => {
        if (worker.resourceTarget?.type !== 'goldmine' || worker.resourceTarget.mine !== mine) return false
        if (worker.state !== 2 || worker.moveTarget) return false

        const size = 3
        const tx = Math.round(mine.mesh.position.x - 0.5)
        const tz = Math.round(mine.mesh.position.z - 0.5)
        const minX = tx
        const minZ = tz
        const maxX = tx + size
        const maxZ = tz + size
        const x = worker.mesh.position.x
        const z = worker.mesh.position.z
        const dx = x < minX ? minX - x : x > maxX ? x - maxX : 0
        const dz = z < minZ ? minZ - z : z > maxZ ? z - maxZ : 0
        return Math.sqrt(dx * dx + dz * dz) > 1.5
      }).length

      return {
        ok: true,
        earnedGold: teamStore.gold,
        plannedBlockedTargets,
        stuckFarWorkers,
        states: workers.map((worker) => worker.state),
      }
    })

    expect(result.ok, result.reason ?? 'opening mining setup failed').toBe(true)
    expect(result.plannedBlockedTargets, 'mine approach path should not target blocked building footprint tiles').toHaveLength(0)
    expect(result.stuckFarWorkers, `workers waiting away from mine edge: states=${JSON.stringify(result.states)}`).toBe(0)
    expect(result.earnedGold, 'five starting workers should keep returning gold instead of visually jamming near the mine').toBeGreaterThanOrEqual(80)
  })
})
