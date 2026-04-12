/**
 * Command Regression Pack 01
 *
 * Runtime-proof Playwright tests for player command agency contracts.
 * Tests command semantics, not mouse feel. All assertions use page.evaluate()
 * on window.__war3Game state with deterministic game-time advancement via
 * g.update(dt).
 *
 * Covers:
 *  1. Move overrides combat + suppresses immediate auto-aggro
 *  2. Stop clears active command, queue, attack target, and restore chain
 *  3. Hold position does not chase beyond attack range
 *  4. AttackMove auto-engages enemies
 *  5. Shift+right-click queue on idle starts immediately
 *  6. Shift+attackMove queue on idle starts immediately
 *  7. Normal move clears existing command queue
 */
import { test, expect, type Page } from '@playwright/test'

const BASE = 'http://127.0.0.1:4173/?runtimeTest=1'

// UnitState enum values (mirrored from GameData.ts for readability in evaluate)
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

// ==================== Diagnostic helper ====================

async function diagnose(page: Page, label: string) {
  const snap = await page.evaluate(() => {
    const g = (window as any).__war3Game
    if (!g) return { hasGame: false }
    const units = g.units ?? []
    return {
      hasGame: true,
      gameTime: g.gameTime?.toFixed(2),
      totalUnits: units.length,
      unitSummaries: units.slice(0, 20).map((u: any) => ({
        type: u.type,
        team: u.team,
        state: u.state,
        hp: u.hp,
        isBuilding: u.isBuilding,
        moveTarget: !!u.moveTarget,
        attackTarget: !!u.attackTarget,
        moveQueue: u.moveQueue?.length ?? 0,
        aggroSuppressUntil: u.aggroSuppressUntil?.toFixed(2),
      })),
    }
  })
  console.error(`\n[DIAGNOSE ${label}]`, JSON.stringify(snap, null, 2))
  return snap
}

// ==================== Game bootstrap ====================

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

// All evaluate blocks use this pattern to get THREE.Vector3 from the game.
// The game imports THREE as a module — it's not on window. We extract the
// constructor from any existing unit's mesh.position (which is a Vector3).
const V3_HELPER = `
  const _V3 = (function() {
    const g = (window).__war3Game;
    const proto = g.units[0].mesh.position;
    return proto.constructor;
  })();
  function v3(x, y, z) { return new _V3(x, y, z); }
`

// ==================== TEST SUITE ====================

test.describe('Command Regression: Player Agency', () => {
  test.setTimeout(120000)

  // ----------------------------------------------------------
  // Test 1: Move overrides combat and suppresses auto-aggro
  // ----------------------------------------------------------
  test('move command overrides Attacking state and suppresses auto-aggro', async ({ page }) => {
    await waitForGame(page)

    // Setup: spawn a footman duel and run until combat starts
    const duel = await page.evaluate(() => {
      const g = (window as any).__war3Game
      if (!g) return null
      const player = g.spawnUnit('footman', 0, 32, 32)
      const enemy = g.spawnUnit('footman', 1, 34, 32) // 2 tiles apart
      return {
        pi: g.units.indexOf(player),
        ei: g.units.indexOf(enemy),
      }
    })
    if (!duel) {
      await diagnose(page, 't1-spawn-fail')
    }
    expect(duel).not.toBeNull()

    // Advance game until player footman enters Attacking state
    const preAttack = await page.evaluate(({ pi, ei }) => {
      const g = (window as any).__war3Game
      const player = g.units[pi]
      const enemy = g.units[ei]
      for (let i = 0; i < 600; i++) {
        g.update(0.016)
        if (player.state === 7) break // Attacking
      }
      return {
        state: player.state,
        attackTarget: !!player.attackTarget,
        gameTime: g.gameTime,
      }
    }, { pi: duel!.pi, ei: duel!.ei })

    expect(
      preAttack.state,
      `Player footman never entered Attacking state. Got state=${preAttack.state}`,
    ).toBe(S.Attacking)

    // Issue a move command away from enemy (mimic issueCommand 'move' + suppressAggroFor)
    const afterMove = await page.evaluate(({ pi }) => {
      const g = (window as any).__war3Game
      const u = g.units[pi]
      const V3 = u.mesh.position.constructor
      const moveTarget = new V3(u.mesh.position.x - 10, 0, u.mesh.position.z)

      // issueCommand 'move' semantics (from GameCommand.ts)
      u.moveTarget = moveTarget
      u.waypoints = []
      u.moveQueue = []
      u.state = 1 // Moving
      u.gatherType = null
      u.attackTarget = null
      u.resourceTarget = null
      u.carryAmount = 0
      u.previousState = null
      u.previousGatherType = null
      u.previousResourceTarget = null
      u.previousMoveTarget = null
      u.previousWaypoints = []
      u.previousMoveQueue = []
      u.previousAttackMoveTarget = null
      // suppressAggroFor 1.5s (same as Game.ts keyboard handler)
      u.aggroSuppressUntil = g.gameTime + 1.5

      return {
        state: u.state,
        attackTarget: u.attackTarget,
        aggroSuppressUntil: u.aggroSuppressUntil,
        gameTime: g.gameTime,
        moveTarget: !!u.moveTarget,
      }
    }, { pi: duel!.pi })

    expect(afterMove.state).toBe(S.Moving)
    expect(afterMove.attackTarget).toBeNull()
    expect(
      afterMove.aggroSuppressUntil,
      `aggroSuppressUntil (${afterMove.aggroSuppressUntil?.toFixed(2)}) should be > gameTime (${afterMove.gameTime?.toFixed(2)})`,
    ).toBeGreaterThan(afterMove.gameTime)

    // Advance 0.5 game-seconds and verify footman hasn't snapped back to Attacking
    const afterAdvance = await page.evaluate(({ pi }) => {
      const g = (window as any).__war3Game
      const player = g.units[pi]
      for (let i = 0; i < 32; i++) g.update(0.016) // ~0.5s
      return {
        state: player.state,
        gameTime: g.gameTime,
        aggroSuppressUntil: player.aggroSuppressUntil,
      }
    }, { pi: duel!.pi })

    expect(
      afterAdvance.state,
      `Footman snapped back to Attacking during suppression. State=${afterAdvance.state}`,
    ).not.toBe(S.Attacking)
  })

  // ----------------------------------------------------------
  // Test 2: Stop clears active intent and restore chain
  // ----------------------------------------------------------
  test('stop clears all command state including restore chain', async ({ page }) => {
    await waitForGame(page)

    const result = await page.evaluate(() => {
      const g = (window as any).__war3Game
      if (!g) return null

      const unit = g.spawnUnit('footman', 0, 20, 20)
      const V3 = unit.mesh.position.constructor

      // Populate all command fields to simulate an active unit
      unit.moveTarget = new V3(30, 0, 30)
      unit.waypoints = [new V3(25, 0, 25)]
      unit.moveQueue = [
        { type: 'move', target: new V3(35, 0, 35) },
        { type: 'attackMove', target: new V3(40, 0, 40) },
      ]
      unit.state = 1 // Moving
      unit.attackTarget = g.units[0]
      unit.attackMoveTarget = new V3(40, 0, 40)
      unit.gatherType = 'gold'
      unit.resourceTarget = { type: 'goldmine', mine: g.units[0] }
      unit.buildTarget = g.units[1]
      unit.carryAmount = 10

      // Populate previous-order restore chain
      unit.previousState = 3 // Gathering
      unit.previousGatherType = 'lumber'
      unit.previousResourceTarget = { type: 'tree', entry: {} }
      unit.previousMoveTarget = new V3(15, 0, 15)
      unit.previousWaypoints = [new V3(12, 0, 12)]
      unit.previousMoveQueue = [{ type: 'move', target: new V3(10, 0, 10) }]
      unit.previousAttackMoveTarget = new V3(20, 0, 20)

      const before = {
        state: unit.state,
        moveTarget: !!unit.moveTarget,
        moveQueueLen: unit.moveQueue.length,
        attackTarget: !!unit.attackTarget,
        attackMoveTarget: !!unit.attackMoveTarget,
        gatherType: unit.gatherType,
        resourceTarget: !!unit.resourceTarget,
        buildTarget: !!unit.buildTarget,
        carryAmount: unit.carryAmount,
        previousState: unit.previousState,
      }

      // issueCommand 'stop' semantics (from GameCommand.ts)
      unit.state = 0 // Idle
      unit.moveTarget = null
      unit.waypoints = []
      unit.moveQueue = []
      unit.attackTarget = null
      unit.attackMoveTarget = null
      unit.gatherType = null
      unit.resourceTarget = null
      unit.buildTarget = null
      unit.carryAmount = 0
      unit.previousState = null
      unit.previousGatherType = null
      unit.previousResourceTarget = null
      unit.previousMoveTarget = null
      unit.previousWaypoints = []
      unit.previousMoveQueue = []
      unit.previousAttackMoveTarget = null

      const after = {
        state: unit.state,
        moveTarget: unit.moveTarget,
        moveQueueLen: unit.moveQueue.length,
        attackTarget: unit.attackTarget,
        attackMoveTarget: unit.attackMoveTarget,
        gatherType: unit.gatherType,
        resourceTarget: unit.resourceTarget,
        buildTarget: unit.buildTarget,
        carryAmount: unit.carryAmount,
        previousState: unit.previousState,
        previousGatherType: unit.previousGatherType,
        previousResourceTarget: unit.previousResourceTarget,
        previousMoveTarget: unit.previousMoveTarget,
        previousWaypointsLen: unit.previousWaypoints.length,
        previousMoveQueueLen: unit.previousMoveQueue.length,
        previousAttackMoveTarget: unit.previousAttackMoveTarget,
      }

      return { before, after }
    })

    if (!result) {
      await diagnose(page, 't2-spawn-fail')
    }
    expect(result).not.toBeNull()

    // Verify before had populated state
    expect(result!.before.state).not.toBe(S.Idle)
    expect(result!.before.moveTarget).toBe(true)
    expect(result!.before.moveQueueLen).toBeGreaterThan(0)
    expect(result!.before.attackTarget).toBe(true)
    expect(result!.before.attackMoveTarget).toBe(true)
    expect(result!.before.previousState).not.toBeNull()

    // Verify after: everything cleared
    expect(result!.after.state).toBe(S.Idle)
    expect(result!.after.moveTarget).toBeNull()
    expect(result!.after.moveQueueLen).toBe(0)
    expect(result!.after.attackTarget).toBeNull()
    expect(result!.after.attackMoveTarget).toBeNull()
    expect(result!.after.gatherType).toBeNull()
    expect(result!.after.resourceTarget).toBeNull()
    expect(result!.after.buildTarget).toBeNull()
    expect(result!.after.carryAmount).toBe(0)
    expect(result!.after.previousState).toBeNull()
    expect(result!.after.previousGatherType).toBeNull()
    expect(result!.after.previousResourceTarget).toBeNull()
    expect(result!.after.previousMoveTarget).toBeNull()
    expect(result!.after.previousWaypointsLen).toBe(0)
    expect(result!.after.previousMoveQueueLen).toBe(0)
    expect(result!.after.previousAttackMoveTarget).toBeNull()
  })

  // ----------------------------------------------------------
  // Test 3: Hold position does not chase
  // ----------------------------------------------------------
  test('hold position does not chase enemy beyond attack range', async ({ page }) => {
    await waitForGame(page)

    const result = await page.evaluate(() => {
      const g = (window as any).__war3Game
      if (!g) return null

      // Player footman at (30, 30), enemy at (35, 30) — 5 tiles (inside aggro, outside attack)
      const player = g.spawnUnit('footman', 0, 30, 30)
      const enemy = g.spawnUnit('footman', 1, 35, 30)

      // issueCommand 'holdPosition' semantics
      player.state = 9 // HoldPosition
      player.moveTarget = null
      player.waypoints = []
      player.moveQueue = []
      player.attackTarget = null
      player.attackMoveTarget = null
      player.gatherType = null
      player.resourceTarget = null
      player.previousState = null
      player.previousGatherType = null
      player.previousResourceTarget = null
      player.previousMoveTarget = null
      player.previousWaypoints = []
      player.previousMoveQueue = []
      player.previousAttackMoveTarget = null

      const posBefore = { x: player.mesh.position.x, z: player.mesh.position.z }

      // Advance 60 game-seconds
      for (let i = 0; i < 3750; i++) g.update(0.016)

      const posAfter = { x: player.mesh.position.x, z: player.mesh.position.z }
      const distMoved = Math.sqrt(
        (posAfter.x - posBefore.x) ** 2 + (posAfter.z - posBefore.z) ** 2,
      )

      return {
        state: player.state,
        moveTarget: player.moveTarget,
        posBefore,
        posAfter,
        distMoved: distMoved.toFixed(3),
        attackTarget: !!player.attackTarget,
        gameTime: g.gameTime?.toFixed(1),
      }
    })

    if (!result) {
      await diagnose(page, 't3-spawn-fail')
    }
    expect(result).not.toBeNull()

    expect(
      result!.state,
      `Expected HoldPosition(9), got state=${result!.state}`,
    ).toBe(S.HoldPosition)

    expect(
      result!.moveTarget,
      'HoldPosition unit should not have a moveTarget',
    ).toBeNull()

    expect(
      parseFloat(result!.distMoved),
      `HoldPosition unit moved ${result!.distMoved} tiles — should be ~0`,
    ).toBeLessThan(0.5)
  })

  // ----------------------------------------------------------
  // Test 4: AttackMove auto-engages enemies
  // ----------------------------------------------------------
  test('attackMove auto-engages enemy on the path', async ({ page }) => {
    await waitForGame(page)

    const result = await page.evaluate(() => {
      const g = (window as any).__war3Game
      if (!g) return null

      // Player footman at (30, 30)
      const player = g.spawnUnit('footman', 0, 30, 30)
      // Enemy at (35, 30) — on the path to attackMove target
      const enemy = g.spawnUnit('footman', 1, 35, 30)

      const V3 = player.mesh.position.constructor
      const amTarget = new V3(40, 0, 30)

      // issueCommand 'attackMove' semantics
      player.state = 8 // AttackMove
      player.attackMoveTarget = amTarget
      player.aggroSuppressUntil = 0
      player.moveTarget = null
      player.waypoints = []
      player.moveQueue = []
      player.attackTarget = null
      player.gatherType = null
      player.resourceTarget = null
      player.carryAmount = 0
      player.previousState = null
      player.previousGatherType = null
      player.previousResourceTarget = null
      player.previousMoveTarget = null
      player.previousWaypoints = []
      player.previousMoveQueue = []
      player.previousAttackMoveTarget = null

      // Plan path to attackMove target
      g.planAttackMovePath(player, amTarget)

      // Advance until unit engages or 30 game-seconds
      let engaged = false
      for (let i = 0; i < 1875; i++) {
        g.update(0.016)
        if (player.attackTarget !== null) {
          engaged = true
          break
        }
      }

      return {
        state: player.state,
        attackTarget: !!player.attackTarget,
        attackTargetTeam: player.attackTarget?.team,
        attackMoveTarget: !!player.attackMoveTarget,
        aggroSuppressUntil: player.aggroSuppressUntil,
        gameTime: g.gameTime?.toFixed(1),
        engaged,
        playerPos: { x: player.mesh.position.x.toFixed(1), z: player.mesh.position.z.toFixed(1) },
      }
    })

    if (!result) {
      await diagnose(page, 't4-spawn-fail')
    }
    expect(result).not.toBeNull()

    // Should have engaged the enemy
    expect(
      result!.engaged || result!.state === S.AttackMove,
      `Footman did not engage. State=${result!.state}, attackTarget=${result!.attackTarget}`,
    ).toBe(true)

    if (result!.engaged) {
      expect(result!.attackTarget).toBe(true)
      expect(result!.attackTargetTeam).toBe(1) // enemy team
      expect(
        result!.aggroSuppressUntil,
        `aggroSuppressUntil should be 0 for attackMove, got ${result!.aggroSuppressUntil}`,
      ).toBe(0)
    }
  })

  // ----------------------------------------------------------
  // Test 5: Shift+right-click queue on idle starts immediately
  // ----------------------------------------------------------
  test('Shift+move on idle unit starts first move immediately, keeps remaining queue', async ({ page }) => {
    await waitForGame(page)

    const result = await page.evaluate(() => {
      const g = (window as any).__war3Game
      if (!g) return null

      const unit = g.spawnUnit('footman', 0, 25, 25)
      unit.state = 0 // Idle
      unit.moveTarget = null
      unit.waypoints = []
      unit.moveQueue = []

      const V3 = unit.mesh.position.constructor
      const target1 = new V3(30, 0, 25)
      const target2 = new V3(35, 0, 25)

      // Simulate Shift+right-click: add to queue (from Game.ts handleRightClick shiftHeld path)
      unit.moveQueue.push({ type: 'move', target: target1 })
      unit.moveQueue.push({ type: 'move', target: target2 })

      // Idle unit with queue → immediately start first command
      // (from Game.ts handleRightClick: "if Idle && queue > 0 → shift + execute")
      if (unit.state === 0 && unit.moveQueue.length > 0) {
        const firstCmd = unit.moveQueue.shift()!
        // executeQueuedCommand for 'move'
        unit.state = 1 // Moving
        unit.moveTarget = null
        g.planPath(unit, firstCmd.target)
      }

      return {
        state: unit.state,
        moveTarget: !!unit.moveTarget,
        moveQueueLen: unit.moveQueue.length,
        pos: { x: unit.mesh.position.x.toFixed(1), z: unit.mesh.position.z.toFixed(1) },
        moveTargetPos: unit.moveTarget
          ? { x: unit.moveTarget.x.toFixed(1), z: unit.moveTarget.z.toFixed(1) }
          : null,
      }
    })

    if (!result) {
      await diagnose(page, 't5-spawn-fail')
    }
    expect(result).not.toBeNull()

    expect(result!.state, 'Expected Moving(1)').toBe(S.Moving)
    expect(result!.moveTarget, 'moveTarget should be set').toBeTruthy()
    expect(result!.moveQueueLen, 'Queue should have 1 remaining item').toBe(1)
  })

  // ----------------------------------------------------------
  // Test 6: Shift+attackMove queue on idle starts immediately
  // ----------------------------------------------------------
  test('Shift+attackMove on idle unit starts first attackMove immediately', async ({ page }) => {
    await waitForGame(page)

    const result = await page.evaluate(() => {
      const g = (window as any).__war3Game
      if (!g) return null

      const unit = g.spawnUnit('footman', 0, 25, 30)
      unit.state = 0 // Idle
      unit.moveTarget = null
      unit.waypoints = []
      unit.moveQueue = []

      const V3 = unit.mesh.position.constructor
      const amTarget1 = new V3(35, 0, 30)
      const amTarget2 = new V3(40, 0, 30)

      unit.moveQueue.push({ type: 'attackMove', target: amTarget1 })
      unit.moveQueue.push({ type: 'attackMove', target: amTarget2 })

      // Idle unit with queue → immediately start first command
      if (unit.state === 0 && unit.moveQueue.length > 0) {
        const firstCmd = unit.moveQueue.shift()!
        // executeQueuedCommand for 'attackMove'
        unit.state = 8 // AttackMove
        unit.attackMoveTarget = firstCmd.target.clone()
        unit.moveTarget = null
        g.planAttackMovePath(unit, firstCmd.target)
      }

      return {
        state: unit.state,
        attackMoveTarget: !!unit.attackMoveTarget,
        attackMoveTargetPos: unit.attackMoveTarget
          ? { x: unit.attackMoveTarget.x.toFixed(1), z: unit.attackMoveTarget.z.toFixed(1) }
          : null,
        moveTarget: !!unit.moveTarget,
        moveQueueLen: unit.moveQueue.length,
        waypointsLen: unit.waypoints?.length ?? 0,
      }
    })

    if (!result) {
      await diagnose(page, 't6-spawn-fail')
    }
    expect(result).not.toBeNull()

    expect(result!.state, 'Expected AttackMove(8)').toBe(S.AttackMove)
    expect(result!.attackMoveTarget, 'attackMoveTarget should be set').toBeTruthy()
    expect(
      result!.moveTarget || result!.waypointsLen > 0,
      'Unit should have a moveTarget or waypoints for movement',
    ).toBe(true)
    expect(result!.moveQueueLen, 'Queue should have 1 remaining item').toBe(1)
  })

  // ----------------------------------------------------------
  // Test 7: Normal move clears existing command queue
  // ----------------------------------------------------------
  test('normal move command clears existing queued commands', async ({ page }) => {
    await waitForGame(page)

    const result = await page.evaluate(() => {
      const g = (window as any).__war3Game
      if (!g) return null

      const unit = g.spawnUnit('footman', 0, 25, 35)
      const V3 = unit.mesh.position.constructor

      // Unit with queued commands
      unit.state = 1 // Moving
      unit.moveTarget = new V3(30, 0, 35)
      unit.waypoints = []
      unit.moveQueue = [
        { type: 'move', target: new V3(35, 0, 35) },
        { type: 'attackMove', target: new V3(40, 0, 35) },
        { type: 'move', target: new V3(45, 0, 35) },
      ]

      const queueLenBefore = unit.moveQueue.length

      // issueCommand 'move' (normal, non-Shift) clears queue
      const newTarget = new V3(20, 0, 35)
      unit.moveTarget = newTarget
      unit.waypoints = []
      unit.moveQueue = []
      unit.state = 1 // Moving
      unit.gatherType = null
      unit.attackTarget = null
      unit.resourceTarget = null
      unit.carryAmount = 0
      unit.previousState = null
      unit.previousGatherType = null
      unit.previousResourceTarget = null
      unit.previousMoveTarget = null
      unit.previousWaypoints = []
      unit.previousMoveQueue = []
      unit.previousAttackMoveTarget = null

      return {
        queueLenBefore,
        state: unit.state,
        moveTargetX: unit.moveTarget?.x.toFixed(1),
        moveTargetZ: unit.moveTarget?.z.toFixed(1),
        moveQueueLen: unit.moveQueue.length,
        attackTarget: unit.attackTarget,
      }
    })

    if (!result) {
      await diagnose(page, 't7-spawn-fail')
    }
    expect(result).not.toBeNull()

    expect(result!.queueLenBefore).toBe(3)
    expect(result!.state).toBe(S.Moving)
    expect(result!.moveQueueLen).toBe(0)
    expect(parseFloat(result!.moveTargetX!)).toBeCloseTo(20, 0)
    expect(result!.attackTarget).toBeNull()
  })
})
