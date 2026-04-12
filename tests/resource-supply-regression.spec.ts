/**
 * Resource/Supply Regression Pack 01
 *
 * Runtime-proof Playwright tests for resource, supply, training, and AI
 * spending contracts. Uses deterministic page.evaluate() assertions on
 * __war3Game state.
 *
 * Covers:
 *  1. computeSupply counts only completed buildings
 *  2. trainUnit refuses training when supply is capped (no resource deduction)
 *  3. Successful training deducts resources exactly once
 *  4. Worker return-gold/lumber increases team resources, clears carry
 *  5a. Stop via real command path does not duplicate carried resources
 *  5b. Move override via real command path drops carried resources
 *  6. AI does not queue/train beyond available supply
 *  7. AI farm supply applies only after completion
 *  8. Multi-building training cannot overspend resources
 */
import { test, expect, type Page } from '@playwright/test'

const BASE = 'http://127.0.0.1:4173/?runtimeTest=1'

// ==================== Diagnostic ====================

async function diagnose(page: Page, label: string) {
  const snap = await page.evaluate(() => {
    const g = (window as any).__war3Game
    if (!g) return { hasGame: false }
    const units = g.units ?? []
    const res0 = g.resources?.get(0)
    return {
      hasGame: true,
      gameTime: g.gameTime?.toFixed(2),
      totalUnits: units.length,
      gold: res0?.gold,
      lumber: res0?.lumber,
      supply: g.resources?.computeSupply(0, units),
    }
  })
  console.error(`\n[DIAGNOSE ${label}]`, JSON.stringify(snap, null, 2))
  return snap
}

// ==================== Bootstrap ====================

async function waitForGame(page: Page) {
  const consoleErrors: string[] = []
  page.on('console', (msg) => {
    if (msg.type() === 'error') consoleErrors.push(msg.text())
  })
  ;(page as any).__consoleErrors = consoleErrors

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

  // Wait for map load to settle (W3X async replacement)
  try {
    await page.waitForFunction(() => {
      const status = document.getElementById('map-status')?.textContent ?? ''
      return !status.includes('正在加载')
    }, { timeout: 15000 })
  } catch { /* no map-status element — procedural map, that's fine */ }

  await page.waitForTimeout(300)
}

/** Advance game time by calling g.update(dt) in evaluate */
async function advanceGameTime(page: Page, targetGameSeconds: number, stepDt: number = 0.016) {
  await page.evaluate(({ target, dt }) => {
    const g = (window as any).__war3Game
    if (!g) return
    let remaining = target
    const maxIter = Math.ceil(target / dt) + 100
    let iter = 0
    while (remaining > 0 && iter < maxIter) {
      const step = Math.min(dt, remaining)
      g.update(step)
      remaining -= step
      iter++
    }
  }, { target: targetGameSeconds, dt: stepDt })
}

// ==================== TEST SUITE ====================

test.describe('Resource/Supply Regression', () => {
  test.setTimeout(120000)

  // ----------------------------------------------------------
  // 1. computeSupply counts only completed buildings
  // ----------------------------------------------------------
  test('computeSupply counts only completed buildings, not under-construction', async ({ page }) => {
    await waitForGame(page)

    const result = await page.evaluate(() => {
      const g = (window as any).__war3Game
      if (!g) return null

      // Baseline supply: 10 base (townhall) + 5 workers × 1 supply = used 5
      const units = g.units
      const supplyBefore = g.resources.computeSupply(0, units)

      // Spawn a farm with buildProgress = 0 (under construction)
      const V3 = units[0].mesh.position.constructor
      const farm = g.spawnBuilding('farm', 0, 20, 20)
      farm.buildProgress = 0 // not complete
      // farm provides 6 supply when complete

      const supplyDuring = g.resources.computeSupply(0, units)

      // Now complete it
      farm.buildProgress = 1
      const supplyAfter = g.resources.computeSupply(0, units)

      return {
        supplyBefore,
        supplyDuring,
        supplyAfter,
        farmType: farm.type,
        farmSupply: 6, // from GameData
      }
    })

    if (!result) {
      await diagnose(page, 't1-no-game')
    }
    expect(result).not.toBeNull()

    // Under-construction farm should NOT increase total supply
    expect(
      result!.supplyDuring.total,
      `Under-construction farm should not add supply. Before total=${result!.supplyBefore.total}, During total=${result!.supplyDuring.total}`,
    ).toBe(result!.supplyBefore.total)

    // Completed farm SHOULD increase total supply by 6
    expect(
      result!.supplyAfter.total,
      `Completed farm should add 6 supply. Expected ${result!.supplyBefore.total + 6}, got ${result!.supplyAfter.total}`,
    ).toBe(result!.supplyBefore.total + 6)
  })

  // ----------------------------------------------------------
  // 2. trainUnit refuses training when supply is capped
  // ----------------------------------------------------------
  test('trainUnit refuses training when supply is capped and does not deduct resources', async ({ page }) => {
    await waitForGame(page)

    const result = await page.evaluate(() => {
      const g = (window as any).__war3Game
      if (!g) return null

      // Find player townhall
      const th = g.units.find((u: any) => u.team === 0 && u.type === 'townhall' && u.hp > 0 && u.buildProgress >= 1)
      if (!th) return { ok: false, reason: 'no townhall' }

      const supplyBefore = g.resources.computeSupply(0, g.units)
      const resBefore = g.resources.get(0)

      // Fill supply to cap by spawning units until we can't
      // Each worker costs 1 supply. Spawn until we hit cap.
      let spawned = 0
      while (true) {
        const sup = g.resources.computeSupply(0, g.units)
        if (sup.used >= sup.total) break
        g.spawnUnit('worker', 0, 25 + spawned, 25)
        spawned++
        if (spawned > 50) break // safety
      }

      const supplyAtCap = g.resources.computeSupply(0, g.units)

      // Give townhall enough resources for a worker (75g)
      g.resources.earn(0, 200, 0)
      const resAtCap = g.resources.get(0)

      // Try to train a worker via trainUnit (the real Game.ts path)
      g.trainUnit(th, 'worker')

      const supplyAfter = g.resources.computeSupply(0, g.units)
      const resAfter = g.resources.get(0)
      const queueLen = th.trainingQueue.length

      return {
        ok: true,
        supplyAtCap: { used: supplyAtCap.used, total: supplyAtCap.total },
        resBefore: resAtCap,
        resAfter,
        supplyAfter: { used: supplyAfter.used, total: supplyAfter.total },
        queueLen,
        spawned,
      }
    })

    if (!result || !result.ok) {
      await diagnose(page, 't2-no-game')
    }
    expect(result).not.toBeNull()
    expect(result!.ok).toBe(true)

    // Supply should be at cap
    expect(result!.supplyAtCap.used).toBeGreaterThanOrEqual(result!.supplyAtCap.total)

    // Resources should NOT be deducted (training refused)
    expect(
      result!.resAfter.gold,
      `Resources were deducted despite supply cap. Before: ${result!.resBefore.gold}, After: ${result!.resAfter.gold}`,
    ).toBe(result!.resBefore.gold)

    // Training queue should be empty (no training started)
    expect(
      result!.queueLen,
      `Training queue should be empty at supply cap, got ${result!.queueLen}`,
    ).toBe(0)
  })

  // ----------------------------------------------------------
  // 3. Successful training deducts resources exactly once
  // ----------------------------------------------------------
  test('successful training deducts gold/lumber exactly once and adds to queue', async ({ page }) => {
    await waitForGame(page)

    const result = await page.evaluate(() => {
      const g = (window as any).__war3Game
      if (!g) return null

      const th = g.units.find((u: any) => u.team === 0 && u.type === 'townhall' && u.hp > 0 && u.buildProgress >= 1)
      if (!th) return null

      // Ensure enough resources and supply headroom
      g.resources.earn(0, 500, 200)
      const resBefore = g.resources.get(0)
      const queueBefore = th.trainingQueue.length

      // Worker costs: 75 gold, 0 lumber, 12s train time
      g.trainUnit(th, 'worker')

      const resAfter = g.resources.get(0)
      const queueAfter = th.trainingQueue.length

      return {
        resBeforeGold: resBefore.gold,
        resAfterGold: resAfter.gold,
        goldDeducted: resBefore.gold - resAfter.gold,
        resBeforeLumber: resBefore.lumber,
        resAfterLumber: resAfter.lumber,
        lumberDeducted: resBefore.lumber - resAfter.lumber,
        queueBefore,
        queueAfter,
      }
    })

    if (!result) {
      await diagnose(page, 't3-no-game')
    }
    expect(result).not.toBeNull()

    // Gold should be deducted exactly 75 (worker cost)
    expect(result!.goldDeducted).toBe(75)
    expect(result!.lumberDeducted).toBe(0)

    // Queue should have exactly 1 new entry
    expect(result!.queueAfter).toBe(result!.queueBefore + 1)
  })

  // ----------------------------------------------------------
  // 4. Worker return-resource path increases team resources
  // ----------------------------------------------------------
  test('worker return-gold path increases team resources and clears carry', async ({ page }) => {
    await waitForGame(page)

    const result = await page.evaluate(() => {
      const g = (window as any).__war3Game
      if (!g) return null

      // Find player townhall and a goldmine
      const th = g.units.find((u: any) => u.team === 0 && u.type === 'townhall' && u.hp > 0)
      const mine = g.units.find((u: any) => u.type === 'goldmine' && u.hp > 0 && u.remainingGold > 0)
      if (!th || !mine) return null

      // Spawn a worker near the townhall
      const worker = g.spawnUnit('worker', 0, 15, 15)

      // Set up: worker is in MovingToReturn state carrying gold
      worker.state = 4 // MovingToReturn
      worker.gatherType = 'gold'
      worker.carryAmount = 10 // GOLD_PER_TRIP
      worker.resourceTarget = { type: 'goldmine', mine }
      // Move target = townhall position
      worker.moveTarget = th.mesh.position.clone()
      worker.waypoints = []

      const resBefore = g.resources.get(0)
      const carryBefore = worker.carryAmount
      const stateBefore = worker.state

      // Advance game until worker reaches townhall and returns resources
      // At speed 3.5, covering ~5 tiles takes ~1.5s, add buffer
      let returned = false
      for (let i = 0; i < 200; i++) { // ~3.2s
        g.update(0.016)
        if (worker.carryAmount === 0 && worker.state !== 4) {
          returned = true
          break
        }
      }

      const resAfter = g.resources.get(0)
      const carryAfter = worker.carryAmount

      return {
        resBeforeGold: resBefore.gold,
        resAfterGold: resAfter.gold,
        goldEarned: resAfter.gold - resBefore.gold,
        carryBefore,
        carryAfter,
        stateBefore,
        stateAfter: worker.state,
        returned,
        workerState: worker.state,
        workerGatherType: worker.gatherType,
      }
    })

    if (!result) {
      await diagnose(page, 't4-no-game')
    }
    expect(result).not.toBeNull()

    // Gold should have increased by the carry amount
    expect(
      result!.goldEarned,
      `Expected gold to increase by ${result!.carryBefore}, got increase of ${result!.goldEarned}`,
    ).toBe(result!.carryBefore)

    // Carry should be cleared
    expect(result!.carryAfter).toBe(0)

    // Worker should have transitioned away from MovingToReturn
    expect(result!.returned).toBe(true)
  })

  // ----------------------------------------------------------
  // 5a. Stop via real command path does not duplicate carried resources
  // ----------------------------------------------------------
  test('stop via real command path does not duplicate carried resources', async ({ page }) => {
    await waitForGame(page)

    const result = await page.evaluate(() => {
      const g = (window as any).__war3Game
      if (!g) return null

      const worker = g.spawnUnit('worker', 0, 18, 18)

      // Worker is carrying gold and moving to return
      worker.state = 4 // MovingToReturn
      worker.gatherType = 'gold'
      worker.carryAmount = 10
      const th = g.units.find(
        (u: any) => u.team === 0 && u.type === 'townhall' && u.hp > 0,
      )
      worker.moveTarget = th.mesh.position.clone()
      worker.resourceTarget = { type: 'goldmine', mine: g.units.find((u: any) => u.type === 'goldmine') }
      worker.waypoints = []

      const resBefore = g.resources.get(0)

      // Use the REAL command path: select worker, then dispatch keyboard 's'
      // This exercises: keydown handler → issueCommand(controllable, {type:'stop'})
      g.selectionModel.clear()
      g.selectionModel.add(worker)

      document.dispatchEvent(new KeyboardEvent('keydown', {
        key: 's',
        code: 'KeyS',
        bubbles: true,
      }))

      const resAfterStop = g.resources.get(0)
      const carryAfterStop = worker.carryAmount
      const stateAfterStop = worker.state

      // Now advance game-time — worker is idle with carryAmount=0
      // Resources should NOT change
      for (let i = 0; i < 60; i++) g.update(0.016) // ~1s

      const resAfterAdvance = g.resources.get(0)

      return {
        resBeforeGold: resBefore.gold,
        resAfterStopGold: resAfterStop.gold,
        resAfterAdvanceGold: resAfterAdvance.gold,
        carryAfterStop,
        stateAfterStop,
        gatherTypeAfter: worker.gatherType,
        resourceTargetAfter: !!worker.resourceTarget,
        previousStateAfter: worker.previousState,
      }
    })

    if (!result) {
      await diagnose(page, 't5a-no-game')
    }
    expect(result).not.toBeNull()

    // Resources should NOT have changed at stop (carry is dropped, not deposited)
    expect(result!.resAfterStopGold).toBe(result!.resBeforeGold)

    // Resources should NOT have changed after advancing (carry was dropped, not deposited)
    expect(result!.resAfterAdvanceGold).toBe(result!.resBeforeGold)

    // Carry should be 0
    expect(result!.carryAfterStop).toBe(0)

    // State should be Idle
    expect(result!.stateAfterStop).toBe(0)

    // All command fields should be cleared by the real issueCommand('stop') path
    expect(result!.gatherTypeAfter).toBeNull()
    expect(result!.resourceTargetAfter).toBeFalsy()
    expect(result!.previousStateAfter).toBeNull()
  })

  // ----------------------------------------------------------
  // 5b. Move override via real command path drops carried resources
  // ----------------------------------------------------------
  test('move override via real command path drops carried resources', async ({ page }) => {
    await waitForGame(page)

    const result = await page.evaluate(() => {
      const g = (window as any).__war3Game
      if (!g) return null

      const worker = g.spawnUnit('worker', 0, 18, 18)

      // Worker is carrying gold and moving to return
      worker.state = 4 // MovingToReturn
      worker.gatherType = 'gold'
      worker.carryAmount = 10
      const th = g.units.find(
        (u: any) => u.team === 0 && u.type === 'townhall' && u.hp > 0,
      )
      worker.moveTarget = th.mesh.position.clone()
      worker.resourceTarget = { type: 'goldmine', mine: g.units.find((u: any) => u.type === 'goldmine') }
      worker.waypoints = []

      const resBefore = g.resources.get(0)

      // Use the REAL command path: select worker, set mouseNDC to a ground point,
      // then call handleRightClick() which calls issueCommand(move).
      // This exercises the full path: handleRightClick → issueCommand(controllable, {type:'move'})
      g.selectionModel.clear()
      g.selectionModel.add(worker)
      g.shiftHeld = false

      // Position mouse NDC over open ground away from units/trees.
      // We need a point that (a) hits the ground plane and (b) is >2 world units
      // from any tree so handleRightClick issues 'move' instead of 'gather'.
      // Strategy: scan several NDC positions until we find tree-free ground.
      const testNDCs = [
        [0.0, -0.3], [0.1, -0.2], [-0.1, -0.4], [0.0, 0.0],
        [0.2, -0.1], [-0.2, -0.3], [0.15, -0.35], [-0.15, -0.15],
      ]
      let hitGround = false
      let groundTarget = null
      for (const [nx, ny] of testNDCs) {
        g.mouseNDC.set(nx, ny)
        g.raycaster.setFromCamera(g.mouseNDC, g.camera)
        const hits = g.raycaster.intersectObject(g.terrain.groundPlane)
        if (hits.length === 0) continue
        const pt = hits[0].point
        // Check no tree within 2 units (same threshold as handleRightClick)
        const nearestTree = g.treeManager.findNearest(pt, 2)
        if (!nearestTree) {
          hitGround = true
          groundTarget = pt
          break
        }
      }

      if (hitGround) {
        g.shiftHeld = false
        g.handleRightClick()
      }

      const resAfterMove = g.resources.get(0)
      const carryAfterMove = worker.carryAmount
      const stateAfterMove = worker.state
      const gatherTypeAfter = worker.gatherType
      const resourceTargetAfter = !!worker.resourceTarget

      // Advance game-time to verify no resource deposit happens
      for (let i = 0; i < 60; i++) g.update(0.016) // ~1s

      const resAfterAdvance = g.resources.get(0)

      return {
        hitGround,
        groundHitPoint: groundTarget ? { x: groundTarget.x.toFixed(1), z: groundTarget.z.toFixed(1) } : null,
        resBeforeGold: resBefore.gold,
        resAfterMoveGold: resAfterMove.gold,
        resAfterAdvanceGold: resAfterAdvance.gold,
        carryAfterMove,
        stateAfterMove,
        gatherTypeAfter,
        resourceTargetAfter,
        moveTargetSet: !!worker.moveTarget,
        moveQueueLen: worker.moveQueue?.length ?? 0,
      }
    })

    if (!result) {
      await diagnose(page, 't5b-no-game')
    }
    expect(result).not.toBeNull()

    // Raycaster must hit ground for handleRightClick to work
    expect(
      result!.hitGround,
      `Raycaster did not hit ground at NDC (0.0, -0.3). handleRightClick returned early without issuing move command.`,
    ).toBe(true)

    // Move command drops carryAmount to 0 (per issueCommand 'move': carryAmount = 0)
    expect(result!.carryAfterMove).toBe(0)

    // Resources should NOT change — carry was dropped, not deposited
    expect(result!.resAfterMoveGold).toBe(result!.resBeforeGold)
    expect(result!.resAfterAdvanceGold).toBe(result!.resBeforeGold)

    // Worker should be in Moving state with a real move target
    expect(result!.stateAfterMove).toBe(1) // Moving
    expect(result!.moveTargetSet).toBe(true)

    // Gather fields should be cleared by the real issueCommand('move') path
    expect(result!.gatherTypeAfter).toBeNull()
    expect(result!.resourceTargetAfter).toBe(false)
    expect(result!.moveQueueLen).toBe(0)
  })

  // ----------------------------------------------------------
  // 6. AI does not train beyond available supply
  // ----------------------------------------------------------
  test('AI does not queue/train units beyond available supply', async ({ page }) => {
    await waitForGame(page)

    // Advance 90 game-seconds to let AI produce
    await advanceGameTime(page, 90)

    const result = await page.evaluate(() => {
      const g = (window as any).__war3Game
      if (!g) return null

      const units = g.units
      const aiSupply = g.resources.computeSupply(1, units)

      // Count queued supply from training buildings
      let queuedSupply = 0
      for (const u of units) {
        if (u.team !== 1 || !u.isBuilding) continue
        for (const item of u.trainingQueue) {
          // Access UNITS data from the game
          const def = { worker: 1, footman: 2 }[item.type] ?? 0
          queuedSupply += def
        }
      }

      const aiWorkers = units.filter(
        (u: any) => u.team === 1 && u.type === 'worker' && !u.isBuilding && u.hp > 0,
      ).length
      const aiFootmen = units.filter(
        (u: any) => u.team === 1 && u.type === 'footman' && !u.isBuilding && u.hp > 0,
      ).length
      const aiFarms = units.filter(
        (u: any) => u.team === 1 && u.type === 'farm' && u.isBuilding && u.hp > 0 && u.buildProgress >= 1,
      ).length
      const aiFarmsInProgress = units.filter(
        (u: any) => u.team === 1 && u.type === 'farm' && u.isBuilding && u.hp > 0 && u.buildProgress < 1,
      ).length

      return {
        supplyUsed: aiSupply.used,
        supplyTotal: aiSupply.total,
        queuedSupply,
        effectiveUsed: aiSupply.used + queuedSupply,
        aiWorkers,
        aiFootmen,
        aiFarms,
        aiFarmsInProgress,
        gameTime: g.gameTime?.toFixed(1),
      }
    })

    if (!result) {
      await diagnose(page, 't6-no-game')
    }
    expect(result).not.toBeNull()

    // AI effective used (actual + queued) should not exceed total
    expect(
      result!.effectiveUsed,
      `AI supply overflow: used=${result!.supplyUsed} + queued=${result!.queuedSupply} = ${result!.effectiveUsed} > total=${result!.supplyTotal}`,
    ).toBeLessThanOrEqual(result!.supplyTotal)
  })

  // ----------------------------------------------------------
  // 7. AI farm supply applies only after completion
  // ----------------------------------------------------------
  test('AI farm construction increases supply only after completion', async ({ page }) => {
    await waitForGame(page)

    // Advance enough for AI to start building a farm but not complete it
    // Farm buildTime = 12s, AI tick interval = 1s
    // AI will start building a farm when supply < farmSupplyThreshold
    await advanceGameTime(page, 8) // Not enough to complete a 12s farm

    const result = await page.evaluate(() => {
      const g = (window as any).__war3Game
      if (!g) return null

      const units = g.units
      const aiFarmsInProgress = units.filter(
        (u: any) => u.team === 1 && u.type === 'farm' && u.isBuilding && u.hp > 0 && u.buildProgress < 1,
      )
      const aiFarmsComplete = units.filter(
        (u: any) => u.team === 1 && u.type === 'farm' && u.isBuilding && u.hp > 0 && u.buildProgress >= 1,
      )

      // Compute supply counting all AI farms (both complete and incomplete)
      const supplyStrict = g.resources.computeSupply(1, units)

      // Compute supply if we artificially counted incomplete farms too
      let totalIfAllComplete = 10 // base
      for (const u of units) {
        if (u.team !== 1) continue
        if (u.isBuilding) {
          // Count ALL farms regardless of buildProgress
          const supply = { farm: 6, townhall: 0, barracks: 0, tower: 0, goldmine: 0 }[u.type] ?? 0
          totalIfAllComplete += supply
        } else {
          // Count unit supply
          const sup = { worker: 1, footman: 2 }[u.type] ?? 0
          totalIfAllComplete -= sup // this is "used", we subtract from effective total
        }
      }

      return {
        supplyStrictTotal: supplyStrict.total,
        supplyStrictUsed: supplyStrict.used,
        aiFarmsInProgress: aiFarmsInProgress.length,
        aiFarmsComplete: aiFarmsComplete.length,
        farmsInProgressBuildProgress: aiFarmsInProgress.map(
          (f: any) => f.buildProgress?.toFixed(2),
        ),
        gameTime: g.gameTime?.toFixed(1),
        totalIfAllFarmsComplete: totalIfAllComplete + supplyStrict.used, // re-add used
      }
    })

    if (!result) {
      await diagnose(page, 't7-no-game')
    }
    expect(result).not.toBeNull()

    // If there are incomplete farms, the supply should NOT include them
    if (result!.aiFarmsInProgress > 0) {
      const expectedTotal = 10 + (result!.aiFarmsComplete * 6)
      expect(
        result!.supplyStrictTotal,
        `In-progress farms should not add supply. Got total=${result!.supplyStrictTotal}, expected=${expectedTotal}. In-progress: ${result!.aiFarmsInProgress}, Complete: ${result!.aiFarmsComplete}`,
      ).toBe(expectedTotal)
    }

    // Even if there are no in-progress farms at this exact moment,
    // the strict supply should only count completed farms
    const expectedFromComplete = 10 + (result!.aiFarmsComplete * 6)
    expect(result!.supplyStrictTotal).toBe(expectedFromComplete)
  })

  // ----------------------------------------------------------
  // 8. Multi-building training cannot overspend resources
  // ----------------------------------------------------------
  test('multi-building training cannot overspend when several barracks selected', async ({ page }) => {
    await waitForGame(page)

    const result = await page.evaluate(() => {
      const g = (window as any).__war3Game
      if (!g) return null

      // Find player barracks (already complete)
      const existingBarracks = g.units.find(
        (u: any) => u.team === 0 && u.type === 'barracks' && u.hp > 0 && u.buildProgress >= 1,
      )
      if (!existingBarracks) return { ok: false, reason: 'no barracks' }

      // Spawn a second barracks nearby, already complete
      const bk2 = g.spawnBuilding('barracks', 0, 8, 20)
      bk2.buildProgress = 1 // complete
      // Make its mesh fully opaque
      const mesh0 = bk2.mesh.children[0]
      if (mesh0?.material) mesh0.material.opacity = 1

      // Give player exactly enough for 1 footman (135 gold)
      // footman costs 135 gold, 0 lumber
      g.resources.spend(0, g.resources.get(0).cost || { gold: 0, lumber: 0 }) // reset not possible
      // Easier: set resources to exactly 200 gold
      const current = g.resources.get(0)
      // We can't set directly, so earn enough to reach 200
      // Footman costs 135 gold. 200 gold = enough for exactly 1 footman
      // earn up to 200 total
      const needed = 200 - current.gold
      if (needed > 0) g.resources.earn(0, needed, 0)
      if (needed < 0) g.resources.spend(0, { gold: -needed, lumber: 0 })

      const resBefore = g.resources.get(0)

      // Try to train footman in BOTH barracks (multi-building training)
      // This is the code path from command card:
      // for (const b of sameTypeBuildings) { this.trainUnit(b, 'footman') }
      const sameTypeBuildings = g.units.filter(
        (u: any) => u.team === 0 && u.isBuilding && u.type === 'barracks' && u.buildProgress >= 1,
      )

      const queueBefore1 = existingBarracks.trainingQueue.length
      const queueBefore2 = bk2.trainingQueue.length

      for (const b of sameTypeBuildings) {
        g.trainUnit(b, 'footman')
      }

      const resAfter = g.resources.get(0)
      const queueAfter1 = existingBarracks.trainingQueue.length
      const queueAfter2 = bk2.trainingQueue.length

      // Total gold spent
      const goldSpent = resBefore.gold - resAfter.gold

      // How many footmen were queued
      const footmenQueued = (queueAfter1 - queueBefore1) + (queueAfter2 - queueBefore2)

      return {
        ok: true,
        barracksCount: sameTypeBuildings.length,
        resBeforeGold: resBefore.gold,
        resAfterGold: resAfter.gold,
        goldSpent,
        resAfterNonNegative: resAfter.gold >= 0,
        footmenQueued,
        queue1Before: queueBefore1,
        queue1After: queueAfter1,
        queue2Before: queueBefore2,
        queue2After: queueAfter2,
      }
    })

    if (!result || !result.ok) {
      await diagnose(page, 't8-no-game')
    }
    expect(result).not.toBeNull()
    expect(result!.ok).toBe(true)

    // Resources must never go negative
    expect(
      result!.resAfterNonNegative,
      `Resources went negative: ${result!.resAfterGold}`,
    ).toBe(true)

    // Gold spent should be exactly 135 * number of footmen actually queued
    // (should be at most 1 footman since we only had 200 gold)
    expect(result!.goldSpent).toBe(135 * result!.footmenQueued)

    // Should have queued at most 1 footman (can't afford 2)
    expect(
      result!.footmenQueued,
      `Expected at most 1 footman queued with 200 gold, got ${result!.footmenQueued}`,
    ).toBeLessThanOrEqual(1)

    // If exactly 1 was queued, gold spent is 135
    if (result!.footmenQueued === 1) {
      expect(result!.goldSpent).toBe(135)
    }
  })
})
