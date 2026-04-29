/**
 * Lumber Resource Loop Regression
 *
 * Proves the worker resource loop at War3 scale:
 * - lumber workers interact with the edge of a tree tile, not the blocked tree center
 * - lumber workers suppress ordinary unit separation while actively harvesting/returning
 * - gold mines use a melee-map sized reserve, so the opening mine does not vanish in one minute
 */
import { test, expect, type Page } from '@playwright/test'
import { GOLDMINE_GOLD } from '../src/game/GameData'

const BASE = 'http://127.0.0.1:4173/?runtimeTest=1'

async function waitForGame(page: Page) {
  const consoleErrors: string[] = []
  page.on('console', (msg) => {
    if (msg.type() === 'error') consoleErrors.push(msg.text())
  })

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
  } catch { /* runtimeTest procedural fast path */ }

  await page.waitForTimeout(300)
}

test.describe('Lumber Resource Loop Regression', () => {
  test.setTimeout(180000)

  test('lumber worker returns resources and starts another tree trip', async ({ page }) => {
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
      const worker = g.units.find((u: any) => u.team === 0 && u.type === 'worker' && u.hp > 0)
      const trees = Array.from(g.treeManager?.entries ?? []) as any[]
      const tree = trees.find((t) => t.remainingLumber > 0 && (g.getTreeApproachCandidates?.(t)?.length ?? 0) > 0)
      if (!teamStore || !townhall || !worker || !tree) {
        return { ok: false, reason: 'missing resources, townhall, worker, or tree' }
      }

      const resetWorker = (w: any) => {
        w.moveTarget = null
        w.waypoints = []
        w.moveQueue = []
        w.attackTarget = null
        w.attackMoveTarget = null
        w.buildTarget = null
        w.carryAmount = 0
        w.gatherTimer = 0
        w.state = 0
        w.gatherType = null
        w.resourceTarget = null
        w.goldLoopSlotMine = null
        w.goldStandMine = null
      }

      for (const w of g.units.filter((u: any) => u.team === 0 && u.type === 'worker' && u.hp > 0)) {
        resetWorker(w)
      }

      const home = g.getBuildingApproachCandidates?.(townhall, 2)?.[0]
      if (home) {
        worker.mesh.position.set(home.x, g.getWorldHeight(home.x - 0.5, home.z - 0.5), home.z)
      }

      teamStore.lumber = 0
      tree.remainingLumber = Math.max(tree.remainingLumber, 100)

      g.issueCommand([worker], {
        type: 'gather',
        resourceType: 'lumber',
        target: tree.mesh.position.clone(),
      })
      worker.resourceTarget = { type: 'tree', entry: tree }
      g.planPathToTreeInteraction(worker, tree)

      const deposits: { t: number; lumber: number }[] = []
      let lastLumber = teamStore.lumber
      let stuckFarSamples = 0

      for (let i = 0; i < 1400; i++) {
        g.update(0.05)
        if (teamStore.lumber > lastLumber) {
          deposits.push({ t: Number(g.gameTime.toFixed(2)), lumber: teamStore.lumber })
          lastLumber = teamStore.lumber
        }
        if (worker.state === 2 && !worker.moveTarget && worker.resourceTarget?.type === 'tree'
          && !g.hasReachedGatherInteraction(worker)) {
          stuckFarSamples++
        }
      }

      return {
        ok: true,
        deposits,
        earnedLumber: teamStore.lumber,
        stuckFarSamples,
        finalState: worker.state,
        finalGatherType: worker.gatherType,
        finalCarry: worker.carryAmount,
        finalTreeLumber: tree.remainingLumber,
      }
    })

    expect(result.ok, result.reason ?? 'lumber loop setup failed').toBe(true)
    expect(result.deposits.length, `expected at least two lumber deposits: ${JSON.stringify(result)}`).toBeGreaterThanOrEqual(2)
    expect(result.earnedLumber).toBeGreaterThanOrEqual(20)
    expect(result.stuckFarSamples, `worker was stuck moving to a tree without a reachable interaction: ${JSON.stringify(result)}`).toBe(0)
  })

  test('multiple lumber workers use resource-loop no-collision while chopping', async ({ page }) => {
    await waitForGame(page)

    const result = await page.evaluate(() => {
      const g = (window as any).__war3Game
      if (!g) return { ok: false, reason: 'no game' }

      if (g.ai) {
        if (typeof g.ai.reset === 'function') g.ai.reset()
        g.ai.update = () => {}
      }

      const teamStore = g.resources.teams?.get?.(0)
      const workers = g.units.filter((u: any) => u.team === 0 && u.type === 'worker' && u.hp > 0).slice(0, 4)
      const trees = Array.from(g.treeManager?.entries ?? []) as any[]
      const tree = trees.find((t) => t.remainingLumber > 0 && (g.getTreeApproachCandidates?.(t)?.length ?? 0) >= 4)
      if (!teamStore || workers.length < 4 || !tree) {
        return { ok: false, reason: 'missing resources, four workers, or approachable tree' }
      }

      const approach = g.getTreeApproachCandidates(tree, 2)[0]
      for (const worker of workers) {
        worker.mesh.position.set(approach.x, g.getWorldHeight(approach.x - 0.5, approach.z - 0.5), approach.z)
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

      teamStore.lumber = 0
      tree.remainingLumber = Math.max(tree.remainingLumber, 1000)

      g.issueCommand(workers, {
        type: 'gather',
        resourceType: 'lumber',
        target: tree.mesh.position.clone(),
      })
      for (const worker of workers) {
        worker.resourceTarget = { type: 'tree', entry: tree }
      }
      g.planPathForUnitsToTreeInteraction(workers, tree)

      const initialSuppressed = workers.filter((worker) => g.hasSuppressedUnitCollision(worker)).length
      let maxSuppressed = initialSuppressed
      let stuckFarSamples = 0
      const stuckExamples: any[] = []

      for (let i = 0; i < 1200; i++) {
        g.update(0.05)
        maxSuppressed = Math.max(
          maxSuppressed,
          workers.filter((worker) => g.hasSuppressedUnitCollision(worker)).length,
        )
        for (const worker of workers) {
          if (worker.state === 2 && !worker.moveTarget && worker.resourceTarget?.type === 'tree'
            && !g.hasReachedGatherInteraction(worker)) {
            stuckFarSamples++
            if (stuckExamples.length < 8) {
              const rt = worker.resourceTarget.entry
              stuckExamples.push({
                t: Number(g.gameTime.toFixed(2)),
                idx: workers.indexOf(worker),
                pos: {
                  x: Number(worker.mesh.position.x.toFixed(2)),
                  z: Number(worker.mesh.position.z.toFixed(2)),
                },
                tile: {
                  x: Math.floor(worker.mesh.position.x),
                  z: Math.floor(worker.mesh.position.z),
                },
                tree: { tx: rt.tx, tz: rt.tz, remaining: rt.remainingLumber },
                distance: Number(g.distanceToTreeFootprint(worker, rt).toFixed(3)),
                candidates: g.getTreeApproachCandidates(rt).map((p: any) => ({
                  x: Number(p.x.toFixed(1)),
                  z: Number(p.z.toFixed(1)),
                })),
              })
            }
          }
        }
      }

      return {
        ok: true,
        initialSuppressed,
        maxSuppressed,
        earnedLumber: teamStore.lumber,
        stuckFarSamples,
        stuckExamples,
        states: workers.map((worker) => worker.state),
        carries: workers.map((worker) => worker.carryAmount),
      }
    })

    expect(result.ok, result.reason ?? 'multi-worker lumber setup failed').toBe(true)
    expect(result.maxSuppressed, `lumber workers should suppress unit collision in the active resource loop: ${JSON.stringify(result)}`).toBe(4)
    expect(result.earnedLumber, `four lumber workers should keep producing while no-collision is active: ${JSON.stringify(result)}`).toBeGreaterThanOrEqual(30)
    expect(result.stuckFarSamples, `lumber workers stuck outside tree interaction: ${JSON.stringify(result)}`).toBe(0)
  })

  test('goldmine reserve uses War3-scale capacity and survives the opening minute', async ({ page }) => {
    await waitForGame(page)

    const result = await page.evaluate(({ expectedGold }) => {
      const g = (window as any).__war3Game
      if (!g) return { ok: false, reason: 'no game' }

      if (g.ai) {
        if (typeof g.ai.reset === 'function') g.ai.reset()
        g.ai.update = () => {}
      }

      const teamStore = g.resources.teams?.get?.(0)
      const townhall = g.units.find((u: any) => u.team === 0 && u.type === 'townhall' && u.hp > 0)
      const workers = g.units.filter((u: any) => u.team === 0 && u.type === 'worker' && u.hp > 0).slice(0, 5)
      const mines = g.units.filter((u: any) => u.type === 'goldmine' && u.hp > 0 && u.remainingGold > 0)
      const mine = townhall && mines.length > 0
        ? mines.sort((a: any, b: any) =>
          townhall.mesh.position.distanceTo(a.mesh.position) - townhall.mesh.position.distanceTo(b.mesh.position),
        )[0]
        : null
      if (!teamStore || !townhall || workers.length < 5 || !mine) {
        return { ok: false, reason: 'missing resources, townhall, workers, or mine' }
      }

      const initialGold = mine.remainingGold
      teamStore.gold = 0

      const starts = g.getBuildingApproachCandidates(townhall, 2)
      workers.forEach((worker: any, idx: number) => {
        const start = starts[idx % starts.length]
        if (start) worker.mesh.position.set(start.x, g.getWorldHeight(start.x - 0.5, start.z - 0.5), start.z)
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

      for (let i = 0; i < 1200; i++) {
        g.update(0.05)
      }

      return {
        ok: true,
        expectedGold,
        initialGold,
        remainingGold: mine.remainingGold,
        earnedGold: teamStore.gold,
      }
    }, { expectedGold: GOLDMINE_GOLD })

    expect(result.ok, result.reason ?? 'goldmine reserve setup failed').toBe(true)
    expect(result.initialGold).toBe(GOLDMINE_GOLD)
    expect(result.remainingGold, `opening minute should not drain the mine: ${JSON.stringify(result)}`).toBeGreaterThan(GOLDMINE_GOLD * 0.9)
    expect(result.earnedGold, `five miners should still produce income from the larger mine: ${JSON.stringify(result)}`).toBeGreaterThan(0)
  })
})
