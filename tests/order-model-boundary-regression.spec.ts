/**
 * Order Model Boundary Regression Test
 *
 * Proves that the exposed test hook `g.issueCommand(...)` exercises the
 * same GameCommand dispatcher as production command paths for move/stop/attackMove.
 *
 * This is NOT a duplicate of combat-control or command-regression packs.
 * It specifically tests the dispatcher equivalence boundary:
 *   g.issueCommand → dispatchGameCommand → unit state changes
 *
 * Contracts:
 *  1. move command sets Moving state, clears attackTarget/gather, clears previous chain
 *  2. stop command sets Idle state, clears all targets and previous chain
 *  3. attackMove sets AttackMove state, clears previous chain, clears suppression
 *  4. Commands skip buildings (isBuilding guard)
 *  5. Order dispatch is deterministic: same input → same output fields
 */
import { test, expect, type Page } from '@playwright/test'

const BASE = 'http://127.0.0.1:4173/?runtimeTest=1'

const S = {
  Idle: 0,
  Moving: 1,
  MovingToGather: 2,
  Gathering: 3,
  MovingToReturn: 4,
  MovingToBuild: 5,
  Building: 6,
  Attacking: 7,
  AttackMove: 8,
  HoldPosition: 9,
} as const

async function diagnose(page: Page, label: string) {
  const snap = await page.evaluate(() => {
    const g = (window as any).__war3Game
    if (!g) return { hasGame: false }
    const units = g.units ?? []
    return {
      hasGame: true,
      gameTime: g.gameTime?.toFixed?.(2),
      totalUnits: units.length,
      unitSummaries: units.slice(0, 20).map((u: any) => ({
        type: u.type,
        team: u.team,
        state: u.state,
        isBuilding: u.isBuilding,
        moveTarget: !!u.moveTarget,
        attackTarget: !!u.attackTarget,
      })),
    }
  })
  console.error(`\n[DIAGNOSE ${label}]`, JSON.stringify(snap, null, 2))
  return snap
}

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
      const c = game.renderer.domElement
      if (c.width === 0 || c.height === 0) return false
      return true
    }, { timeout: 15000 })
  } catch (e) {
    const snap = await diagnose(page, 'waitForGame-fail')
    throw new Error(
      `waitForGame failed. Console: ${consoleErrors.slice(-5).join(' | ')}. ` +
      `Original: ${(e as Error).message}`,
    )
  }

  await page.waitForTimeout(300)
}

test.describe('Order Model Boundary', () => {
  test.setTimeout(120000)

  // ----------------------------------------------------------------
  // Test 1: move command via issueCommand sets correct fields
  //
  // Contract: issueCommand({ type: 'move' }) on a unit with populated
  // previous-state fields clears them all and sets Moving.
  // ----------------------------------------------------------------
  test('move command via issueCommand clears all previous-chain fields', async ({ page }) => {
    await waitForGame(page)

    const result = await page.evaluate(() => {
      const g = (window as any).__war3Game
      if (!g) return null

      const unit = g.spawnUnit('footman', 0, 25, 25)
      const V3 = unit.mesh.position.constructor

      // Simulate a unit with full previous-state chain (as if interrupted by auto-aggro)
      unit.state = 7 // Attacking
      unit.attackTarget = g.units.find((u: any) => u.team === 1)
      unit.gatherType = 'gold'
      unit.resourceTarget = { type: 'goldmine', mine: g.units[0] }
      unit.carryAmount = 10
      unit.previousState = 3 // Gathering
      unit.previousGatherType = 'gold'
      unit.previousResourceTarget = { type: 'goldmine', mine: g.units[0] }
      unit.previousMoveTarget = new V3(15, 0, 15)
      unit.previousWaypoints = [new V3(12, 0, 12)]
      unit.previousMoveQueue = [{ type: 'move', target: new V3(10, 0, 10) }]
      unit.previousAttackMoveTarget = new V3(20, 0, 20)

      const before = {
        state: unit.state,
        attackTarget: !!unit.attackTarget,
        gatherType: unit.gatherType,
        carryAmount: unit.carryAmount,
        previousState: unit.previousState,
        previousGatherType: unit.previousGatherType,
        previousResourceTarget: !!unit.previousResourceTarget,
        previousMoveTarget: !!unit.previousMoveTarget,
        previousWaypointsLen: unit.previousWaypoints.length,
        previousMoveQueueLen: unit.previousMoveQueue.length,
        previousAttackMoveTarget: !!unit.previousAttackMoveTarget,
      }

      // Issue move via the test hook (same dispatcher as production)
      const target = new V3(30, 0, 25)
      g.issueCommand([unit], { type: 'move', target })

      const after = {
        state: unit.state,
        moveTarget: !!unit.moveTarget,
        moveTargetX: unit.moveTarget?.x,
        attackTarget: !!unit.attackTarget,
        gatherType: unit.gatherType,
        resourceTarget: !!unit.resourceTarget,
        carryAmount: unit.carryAmount,
        previousState: unit.previousState,
        previousGatherType: unit.previousGatherType,
        previousResourceTarget: !!unit.previousResourceTarget,
        previousMoveTarget: !!unit.previousMoveTarget,
        previousWaypointsLen: unit.previousWaypoints.length,
        previousMoveQueueLen: unit.previousMoveQueue.length,
        previousAttackMoveTarget: !!unit.previousAttackMoveTarget,
        aggroSuppressUntil: unit.aggroSuppressUntil,
      }

      return { before, after }
    })

    expect(result).not.toBeNull()

    // Verify before state was populated
    expect(result!.before.state).toBe(S.Attacking)
    expect(result!.before.attackTarget).toBe(true)
    expect(result!.before.gatherType).toBe('gold')
    expect(result!.before.carryAmount).toBe(10)
    expect(result!.before.previousState).toBe(S.Gathering)

    // Verify after: move command cleared everything
    expect(result!.after.state).toBe(S.Moving)
    expect(result!.after.moveTarget).toBe(true)
    expect(result!.after.moveTargetX).toBe(30)
    expect(result!.after.attackTarget).toBe(false)
    expect(result!.after.gatherType).toBeNull()
    expect(result!.after.resourceTarget).toBe(false)
    expect(result!.after.carryAmount).toBe(0)
    expect(result!.after.previousState).toBeNull()
    expect(result!.after.previousGatherType).toBeNull()
    expect(result!.after.previousResourceTarget).toBe(false)
    expect(result!.after.previousMoveTarget).toBe(false)
    expect(result!.after.previousWaypointsLen).toBe(0)
    expect(result!.after.previousMoveQueueLen).toBe(0)
    expect(result!.after.previousAttackMoveTarget).toBe(false)
    // aggroSuppressUntil is NOT changed by issueCommand — that's suppressAggroFor's job
    expect(result!.after.aggroSuppressUntil).toBe(0)
  })

  // ----------------------------------------------------------------
  // Test 2: stop command via issueCommand clears all fields
  //
  // Contract: issueCommand({ type: 'stop' }) clears every command
  // field including the restore chain.
  // ----------------------------------------------------------------
  test('stop command via issueCommand clears all command fields', async ({ page }) => {
    await waitForGame(page)

    const result = await page.evaluate(() => {
      const g = (window as any).__war3Game
      if (!g) return null

      const unit = g.spawnUnit('footman', 0, 28, 28)
      const V3 = unit.mesh.position.constructor

      // Populate all fields
      unit.state = 1 // Moving
      unit.moveTarget = new V3(35, 0, 28)
      unit.waypoints = [new V3(32, 0, 28)]
      unit.moveQueue = [{ type: 'move', target: new V3(40, 0, 28) }]
      unit.attackTarget = g.units.find((u: any) => u.team === 1)
      unit.attackMoveTarget = new V3(50, 0, 28)
      unit.gatherType = 'lumber'
      unit.resourceTarget = { type: 'tree', entry: {} }
      unit.buildTarget = g.units[1]
      unit.carryAmount = 5
      unit.previousState = 3
      unit.previousGatherType = 'gold'
      unit.previousResourceTarget = { type: 'goldmine', mine: g.units[0] }
      unit.previousMoveTarget = new V3(15, 0, 15)
      unit.previousWaypoints = [new V3(12, 0, 12)]
      unit.previousMoveQueue = [{ type: 'move', target: new V3(10, 0, 10) }]
      unit.previousAttackMoveTarget = new V3(20, 0, 20)

      g.issueCommand([unit], { type: 'stop' })

      return {
        state: unit.state,
        moveTarget: !!unit.moveTarget,
        waypointsLen: unit.waypoints.length,
        moveQueueLen: unit.moveQueue.length,
        attackTarget: !!unit.attackTarget,
        attackMoveTarget: !!unit.attackMoveTarget,
        gatherType: unit.gatherType,
        resourceTarget: !!unit.resourceTarget,
        buildTarget: !!unit.buildTarget,
        carryAmount: unit.carryAmount,
        previousState: unit.previousState,
        previousGatherType: unit.previousGatherType,
        previousResourceTarget: !!unit.previousResourceTarget,
        previousMoveTarget: !!unit.previousMoveTarget,
        previousWaypointsLen: unit.previousWaypoints.length,
        previousMoveQueueLen: unit.previousMoveQueue.length,
        previousAttackMoveTarget: !!unit.previousAttackMoveTarget,
      }
    })

    expect(result).not.toBeNull()
    expect(result!.state).toBe(S.Idle)
    expect(result!.moveTarget).toBe(false)
    expect(result!.waypointsLen).toBe(0)
    expect(result!.moveQueueLen).toBe(0)
    expect(result!.attackTarget).toBe(false)
    expect(result!.attackMoveTarget).toBe(false)
    expect(result!.gatherType).toBeNull()
    expect(result!.resourceTarget).toBe(false)
    expect(result!.buildTarget).toBe(false)
    expect(result!.carryAmount).toBe(0)
    expect(result!.previousState).toBeNull()
    expect(result!.previousGatherType).toBeNull()
    expect(result!.previousResourceTarget).toBe(false)
    expect(result!.previousMoveTarget).toBe(false)
    expect(result!.previousWaypointsLen).toBe(0)
    expect(result!.previousMoveQueueLen).toBe(0)
    expect(result!.previousAttackMoveTarget).toBe(false)
  })

  // ----------------------------------------------------------------
  // Test 3: attackMove via issueCommand clears suppression and previous chain
  //
  // Contract: issueCommand({ type: 'attackMove' }) sets AttackMove state,
  // clears aggroSuppressUntil to 0, and clears the previous chain.
  // This proves attackMove and regular move behave differently regarding
  // aggro suppression.
  // ----------------------------------------------------------------
  test('attackMove via issueCommand clears suppression and sets attackMoveTarget', async ({ page }) => {
    await waitForGame(page)

    const result = await page.evaluate(() => {
      const g = (window as any).__war3Game
      if (!g) return null

      const unit = g.spawnUnit('footman', 0, 30, 30)
      const V3 = unit.mesh.position.constructor

      // Unit with active suppression and previous state
      unit.aggroSuppressUntil = g.gameTime + 5
      unit.state = 7 // Attacking
      unit.attackTarget = g.units.find((u: any) => u.team === 1)
      unit.previousState = 1 // Moving
      unit.previousMoveTarget = new V3(25, 0, 30)
      unit.previousWaypoints = [new V3(24, 0, 30)]
      unit.previousMoveQueue = []
      unit.previousAttackMoveTarget = null

      const amTarget = new V3(40, 0, 30)
      g.issueCommand([unit], { type: 'attackMove', target: amTarget })

      return {
        state: unit.state,
        attackMoveTarget: !!unit.attackMoveTarget,
        attackMoveTargetX: unit.attackMoveTarget?.x,
        moveTarget: !!unit.moveTarget,
        attackTarget: !!unit.attackTarget,
        aggroSuppressUntil: unit.aggroSuppressUntil,
        previousState: unit.previousState,
        previousMoveTarget: !!unit.previousMoveTarget,
        previousWaypointsLen: unit.previousWaypoints.length,
        gatherType: unit.gatherType,
        carryAmount: unit.carryAmount,
      }
    })

    expect(result).not.toBeNull()
    expect(result!.state).toBe(S.AttackMove)
    expect(result!.attackMoveTarget).toBe(true)
    expect(result!.attackMoveTargetX).toBe(40)
    expect(result!.moveTarget).toBe(false) // moveTarget set by planAttackMovePath, not issueCommand
    expect(result!.attackTarget).toBe(false)
    expect(result!.aggroSuppressUntil).toBe(0) // attackMove clears suppression
    expect(result!.previousState).toBeNull()
    expect(result!.previousMoveTarget).toBe(false)
    expect(result!.previousWaypointsLen).toBe(0)
    expect(result!.gatherType).toBeNull()
    expect(result!.carryAmount).toBe(0)
  })

  // ----------------------------------------------------------------
  // Test 4: issueCommand skips buildings
  //
  // Contract: all commands with isBuilding guard skip buildings.
  // move/stop/attackMove should not change building state.
  // ----------------------------------------------------------------
  test('issueCommand skips buildings for move/stop/attackMove', async ({ page }) => {
    await waitForGame(page)

    const result = await page.evaluate(() => {
      const g = (window as any).__war3Game
      if (!g) return null

      // Find a player building
      const building = g.units.find((u: any) => u.team === 0 && u.isBuilding)
      if (!building) return { found: false }

      const V3 = building.mesh.position.constructor
      const originalState = building.state

      // Try all three commands on the building
      g.issueCommand([building], { type: 'move', target: new V3(50, 0, 50) })
      const afterMove = building.state

      g.issueCommand([building], { type: 'stop' })
      const afterStop = building.state

      g.issueCommand([building], { type: 'attackMove', target: new V3(50, 0, 50) })
      const afterAttackMove = building.state

      return {
        found: true,
        originalState,
        afterMove,
        afterStop,
        afterAttackMove,
      }
    })

    expect(result).not.toBeNull()
    expect(result!.found).toBe(true)
    expect(result!.afterMove).toBe(result!.originalState)
    expect(result!.afterStop).toBe(result!.originalState)
    expect(result!.afterAttackMove).toBe(result!.originalState)
  })

  // ----------------------------------------------------------------
  // Test 5: Deterministic field mapping for all three commands
  //
  // Contract: calling issueCommand twice with same input on a fresh
  // unit produces identical output fields (idempotent on clean state).
  // ----------------------------------------------------------------
  test('issueCommand is deterministic: same input produces same fields', async ({ page }) => {
    await waitForGame(page)

    const result = await page.evaluate(() => {
      const g = (window as any).__war3Game
      if (!g) return null

      const V3 = g.units[0].mesh.position.constructor

      // Two fresh units at same position
      const a = g.spawnUnit('footman', 0, 35, 35)
      const b = g.spawnUnit('footman', 0, 35, 35)

      const target = new V3(40, 0, 35)
      g.issueCommand([a], { type: 'move', target: target.clone() })
      g.issueCommand([b], { type: 'move', target: target.clone() })

      const fieldsA = {
        state: a.state,
        moveTargetX: a.moveTarget?.x,
        moveTargetZ: a.moveTarget?.z,
        attackTarget: !!a.attackTarget,
        gatherType: a.gatherType,
        carryAmount: a.carryAmount,
        previousState: a.previousState,
        moveQueueLen: a.moveQueue.length,
        aggroSuppressUntil: a.aggroSuppressUntil,
      }
      const fieldsB = {
        state: b.state,
        moveTargetX: b.moveTarget?.x,
        moveTargetZ: b.moveTarget?.z,
        attackTarget: !!b.attackTarget,
        gatherType: b.gatherType,
        carryAmount: b.carryAmount,
        previousState: b.previousState,
        moveQueueLen: b.moveQueue.length,
        aggroSuppressUntil: b.aggroSuppressUntil,
      }

      return { fieldsA, fieldsB, match: JSON.stringify(fieldsA) === JSON.stringify(fieldsB) }
    })

    expect(result).not.toBeNull()
    expect(result!.match, `Field mismatch: ${JSON.stringify(result!.fieldsA)} vs ${JSON.stringify(result!.fieldsB)}`).toBe(true)
    expect(result!.fieldsA.state).toBe(S.Moving)
  })
})
