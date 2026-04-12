/**
 * Combat Control Regression Pack
 *
 * Runtime-proof contracts for player combat control semantics:
 * manual player commands must override automatic combat behavior.
 *
 * Covers:
 *  1. Move overrides Attacking + suppression prevents immediate re-aggro
 *  2. After suppression expires, Idle unit near enemy can auto-aggro
 *  3. Attack-move does NOT suppress aggro (auto-engages)
 *  4. Stop clears previousState chain + suppresses briefly
 *  5. Hold position acquires in range, does not chase
 *  6. Manual move after auto-aggro clears stale previousState
 *  7. Attack command clears suppression (offensive intent)
 */
import { test, expect, type Page } from '@playwright/test'

const BASE = 'http://127.0.0.1:4173/?runtimeTest=1'

// UnitState enum values (mirrored from GameData.ts)
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
      gameTime: g.gameTime?.toFixed?.(2),
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
        aggroSuppressUntil: u.aggroSuppressUntil?.toFixed?.(2),
        previousState: u.previousState,
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

// ==================== TEST SUITE ====================

test.describe('Combat Control Contracts', () => {
  test.setTimeout(120000)

  // ----------------------------------------------------------
  // Test 1: Move overrides Attacking + suppression window
  //
  // Contract: Unit in Attacking state receives normal right-click
  // ground move → becomes Moving, attackTarget cleared,
  // previousState cleared, has suppression window, does not
  // immediately reacquire.
  // ----------------------------------------------------------
  test('move command overrides Attacking and suppresses auto-aggro', async ({ page }) => {
    await waitForGame(page)

    const result = await page.evaluate(() => {
      const g = (window as any).__war3Game
      if (!g) return null
      const player = g.spawnUnit('footman', 0, 32, 32)
      const enemy = g.spawnUnit('footman', 1, 34, 32)
      enemy.attackDamage = 0 // keep the contract focused on player control, not duel outcome

      // Advance until player enters Attacking state via auto-aggro.
      for (let i = 0; i < 600; i++) {
        g.update(0.016)
        if (player.state === 7) break
      }
      const preAttack = {
        state: player.state,
        attackTarget: !!player.attackTarget,
        gameTime: g.gameTime,
      }

      const V3 = player.mesh.position.constructor
      const moveTarget = new V3(player.mesh.position.x - 5, 0, player.mesh.position.z)

      // Issue move command via real GameCommand dispatcher + same suppression helper
      // used by the right-click path.
      g.issueCommand([player], { type: 'move', target: moveTarget })
      g.planPath(player, moveTarget)
      g.suppressAggroFor([player], 1.5)

      const afterMove = {
        state: player.state,
        attackTarget: !!player.attackTarget,
        moveTarget: !!player.moveTarget,
        previousState: player.previousState,
        aggroSuppressUntil: player.aggroSuppressUntil,
        gameTime: g.gameTime,
      }

      // Advance ~0.8s — during suppression window, unit must NOT snap back.
      for (let i = 0; i < 50; i++) g.update(0.016)
      const afterAdvance = {
        state: player.state,
        attackTarget: !!player.attackTarget,
        aggroSuppressUntil: player.aggroSuppressUntil,
        gameTime: g.gameTime,
      }

      return { preAttack, afterMove, afterAdvance }
    })

    expect(result).not.toBeNull()
    expect(result!.preAttack.state, 'Unit should have entered Attacking').toBe(S.Attacking)
    expect(result!.afterMove.state).toBe(S.Moving)
    expect(result!.afterMove.attackTarget).toBe(false)
    expect(result!.afterMove.previousState).toBeNull()
    expect(
      result!.afterMove.aggroSuppressUntil,
      `aggroSuppressUntil (${result!.afterMove.aggroSuppressUntil?.toFixed(2)}) should be > gameTime (${result!.afterMove.gameTime?.toFixed(2)})`,
    ).toBeGreaterThan(result!.afterMove.gameTime)
    expect(
      result!.afterAdvance.state,
      `Unit snapped back to Attacking during suppression. State=${result!.afterAdvance.state}`,
    ).not.toBe(S.Attacking)
    expect(
      result!.afterAdvance.attackTarget,
      'Unit should not have attackTarget during suppression',
    ).toBe(false)
  })

  // ----------------------------------------------------------
  // Test 2: After suppression expires, auto-aggro re-engages
  //
  // Contract: once aggroSuppressUntil passes and unit is Idle
  // near an enemy, auto-aggro can trigger again.
  // ----------------------------------------------------------
  test('after suppression expires, idle unit near enemy can auto-aggro', async ({ page }) => {
    await waitForGame(page)

    const result = await page.evaluate(() => {
      const g = (window as any).__war3Game
      if (!g) return null

      // Spawn footman and enemy close together
      const player = g.spawnUnit('footman', 0, 32, 35)
      const enemy = g.spawnUnit('footman', 1, 34, 35)

      const V3 = player.mesh.position.constructor
      // Move command to a nearby point (unit will arrive quickly)
      const moveTarget = new V3(33, 0, 35)
      g.issueCommand([player], { type: 'move', target: moveTarget })
      g.planPath(player, moveTarget)
      g.suppressAggroFor([player], 1.5)

      const suppressUntil = player.aggroSuppressUntil

      // Advance past suppression + movement (2+ seconds)
      for (let i = 0; i < 300; i++) g.update(0.016) // ~4.8s

      return {
        suppressUntil: suppressUntil?.toFixed(2),
        gameTimeAfter: g.gameTime?.toFixed(2),
        state: player.state,
        attackTarget: !!player.attackTarget,
        enemyAlive: g.units.includes(enemy),
      }
    })

    expect(result).not.toBeNull()
    // After suppression expires and unit is near enemy, it should have re-engaged
    expect(
      result!.attackTarget || result!.state === S.Attacking,
      `After suppression expired, unit should have auto-aggro'd. State=${result!.state}, attackTarget=${result!.attackTarget}`,
    ).toBe(true)
  })

  // ----------------------------------------------------------
  // Test 3: Attack-move does NOT suppress aggro
  //
  // Contract: attack-move clears aggroSuppressUntil to 0 and
  // auto-engages enemies along the route.
  // ----------------------------------------------------------
  test('attack-move does not suppress aggro and auto-engages enemies', async ({ page }) => {
    await waitForGame(page)

    const result = await page.evaluate(() => {
      const g = (window as any).__war3Game
      if (!g) return null

      const player = g.spawnUnit('footman', 0, 30, 32)
      const enemy = g.spawnUnit('footman', 1, 34, 32)
      const V3 = player.mesh.position.constructor
      const amTarget = new V3(40, 0, 32)

      // First set suppression (simulating prior move command)
      player.aggroSuppressUntil = g.gameTime + 5

      // Issue attackMove via real path — should clear suppression
      g.issueCommand([player], { type: 'attackMove', target: amTarget })
      g.planAttackMovePath(player, amTarget)

      return {
        state: player.state,
        aggroSuppressUntil: player.aggroSuppressUntil,
        attackMoveTarget: !!player.attackMoveTarget,
        moveTarget: !!player.moveTarget || player.waypoints?.length > 0,
        previousState: player.previousState,
        gameTime: g.gameTime,
      }
    })

    expect(result).not.toBeNull()
    expect(result!.state).toBe(S.AttackMove)
    expect(
      result!.aggroSuppressUntil,
      `attackMove should clear aggroSuppressUntil to 0, got ${result!.aggroSuppressUntil}`,
    ).toBe(0)
    expect(result!.previousState).toBeNull()

    // Advance and verify unit engages the enemy
    const afterAdvance = await page.evaluate(() => {
      const g = (window as any).__war3Game
      const player = g.units.find((u: any) => u.team === 0 && u.type === 'footman' && u.state === 8)
      if (!player) return { found: false }
      for (let i = 0; i < 600; i++) {
        g.update(0.016)
        if (player.attackTarget) break
      }
      return {
        found: true,
        attackTarget: !!player.attackTarget,
        attackTargetTeam: player.attackTarget?.team,
        state: player.state,
      }
    })

    expect(afterAdvance.found).toBe(true)
    expect(
      afterAdvance.attackTarget,
      'Attack-move unit should have engaged enemy',
    ).toBe(true)
    expect(afterAdvance.attackTargetTeam).toBe(1)
  })

  // ----------------------------------------------------------
  // Test 4: Stop clears previousState chain + suppresses briefly
  //
  // Contract: stop command clears all previous* fields, sets
  // state to Idle, and suppresses auto-aggro briefly enough
  // that player sees stop take effect.
  // ----------------------------------------------------------
  test('stop clears previousState chain and suppresses auto-aggro briefly', async ({ page }) => {
    await waitForGame(page)

    const result = await page.evaluate(() => {
      const g = (window as any).__war3Game
      if (!g) return null

      const unit = g.spawnUnit('footman', 0, 30, 38)
      const enemy = g.spawnUnit('footman', 1, 31, 38) // 1 tile away

      const V3 = unit.mesh.position.constructor

      // Simulate auto-aggro having interrupted a gather:
      // set previousState chain as if unit was gathering before
      unit.state = 7
      unit.attackTarget = enemy
      unit.previousState = 3
      unit.previousGatherType = 'gold'
      unit.previousResourceTarget = { type: 'goldmine', mine: g.units[0] }
      unit.previousMoveTarget = new V3(15, 0, 15)
      unit.previousWaypoints = [new V3(12, 0, 12)]
      unit.previousMoveQueue = [{ type: 'move', target: new V3(10, 0, 10) }]
      unit.previousAttackMoveTarget = new V3(20, 0, 20)

      const before = {
        state: unit.state,
        attackTarget: !!unit.attackTarget,
        previousState: unit.previousState,
        previousGatherType: unit.previousGatherType,
        previousResourceTarget: !!unit.previousResourceTarget,
        previousMoveTarget: !!unit.previousMoveTarget,
        previousWaypointsLen: unit.previousWaypoints.length,
        previousMoveQueueLen: unit.previousMoveQueue.length,
        previousAttackMoveTarget: !!unit.previousAttackMoveTarget,
      }

      // Issue stop via real path
      g.issueCommand([unit], { type: 'stop' })
      g.suppressAggroFor([unit], 1.5)

      const after = {
        state: unit.state,
        attackTarget: !!unit.attackTarget,
        moveTarget: !!unit.moveTarget,
        moveQueueLen: unit.moveQueue.length,
        gatherType: unit.gatherType,
        resourceTarget: !!unit.resourceTarget,
        previousState: unit.previousState,
        previousGatherType: unit.previousGatherType,
        previousResourceTarget: !!unit.previousResourceTarget,
        previousMoveTarget: !!unit.previousMoveTarget,
        previousWaypointsLen: unit.previousWaypoints.length,
        previousMoveQueueLen: unit.previousMoveQueue.length,
        previousAttackMoveTarget: !!unit.previousAttackMoveTarget,
        aggroSuppressUntil: unit.aggroSuppressUntil,
        gameTime: g.gameTime,
      }

      return { before, after }
    })

    expect(result).not.toBeNull()

    // Verify before had populated state
    expect(result!.before.previousState).toBe(S.Gathering)
    expect(result!.before.previousGatherType).toBe('gold')
    expect(result!.before.previousResourceTarget).toBe(true)
    expect(result!.before.previousMoveTarget).toBe(true)

    // Verify after: everything cleared
    expect(result!.after.state).toBe(S.Idle)
    expect(result!.after.attackTarget).toBe(false)
    expect(result!.after.moveTarget).toBe(false)
    expect(result!.after.moveQueueLen).toBe(0)
    expect(result!.after.gatherType).toBeNull()
    expect(result!.after.resourceTarget).toBe(false)
    expect(result!.after.previousState).toBeNull()
    expect(result!.after.previousGatherType).toBeNull()
    expect(result!.after.previousResourceTarget).toBe(false)
    expect(result!.after.previousMoveTarget).toBe(false)
    expect(result!.after.previousWaypointsLen).toBe(0)
    expect(result!.after.previousMoveQueueLen).toBe(0)
    expect(result!.after.previousAttackMoveTarget).toBe(false)
    expect(
      result!.after.aggroSuppressUntil,
      'Stop should suppress auto-aggro',
    ).toBeGreaterThan(result!.after.gameTime)

    // Verify enemy nearby does not re-engage during suppression
    const afterAdvance = await page.evaluate(() => {
      const g = (window as any).__war3Game
      const unit = g.units.find((u: any) => u.team === 0 && u.type === 'footman' && u.state === 0)
      if (!unit) return { found: false }
      for (let i = 0; i < 30; i++) g.update(0.016) // ~0.5s
      return {
        found: true,
        state: unit.state,
        attackTarget: !!unit.attackTarget,
      }
    })

    expect(afterAdvance.found).toBe(true)
    expect(
      afterAdvance.state,
      `Unit should stay Idle during suppression, got state=${afterAdvance.state}`,
    ).toBe(S.Idle)
    expect(afterAdvance.attackTarget).toBe(false)
  })

  // ----------------------------------------------------------
  // Test 5: Hold position acquires in range, does not chase
  //
  // Contract: HoldPosition scans within attackRange+0.5,
  // acquires target, attacks, but drops target if it moves
  // beyond attack range (does not chase).
  // ----------------------------------------------------------
  test('hold position acquires in range but does not chase beyond range', async ({ page }) => {
    await waitForGame(page)

    const result = await page.evaluate(() => {
      const g = (window as any).__war3Game
      if (!g) return null

      // Footman at (30, 40), enemy at (31, 40) — 1 tile apart, within melee range
      const player = g.spawnUnit('footman', 0, 30, 40)
      const enemy = g.spawnUnit('footman', 1, 31, 40)
      enemy.attackDamage = 0
      enemy.hp = 9999
      player.attackDamage = 1
      player.attackCooldown = 100

      // Issue hold position
      g.issueCommand([player], { type: 'holdPosition' })

      const posBefore = { x: player.mesh.position.x, z: player.mesh.position.z }

      // Advance enough for hold position to acquire, but not long enough
      // for combat damage/death to become the thing under test.
      for (let i = 0; i < 40; i++) g.update(0.016) // ~0.64s

      const hadTarget = !!player.attackTarget

      // Now move enemy far away (simulate by teleporting)
      enemy.mesh.position.x = 50
      enemy.mesh.position.z = 40

      // Advance to let hold position re-evaluate
      for (let i = 0; i < 100; i++) g.update(0.016) // ~1.6s

      const posAfter = { x: player.mesh.position.x, z: player.mesh.position.z }
      const distMoved = Math.sqrt(
        (posAfter.x - posBefore.x) ** 2 + (posAfter.z - posBefore.z) ** 2,
      )

      return {
        state: player.state,
        hadTarget,
        attackTargetAfter: !!player.attackTarget,
        moveTarget: !!player.moveTarget,
        posBefore,
        posAfter,
        distMoved: distMoved.toFixed(3),
      }
    })

    expect(result).not.toBeNull()
    expect(result!.state).toBe(S.HoldPosition)
    expect(result!.hadTarget, 'Hold position should acquire target in range').toBe(true)
    expect(result!.attackTargetAfter, 'Hold position should drop target that moved out of range').toBe(false)
    expect(result!.moveTarget).toBe(false)
    expect(
      parseFloat(result!.distMoved),
      `Hold position unit chased ${result!.distMoved} tiles`,
    ).toBeLessThan(0.5)
  })

  // ----------------------------------------------------------
  // Test 6: Manual move after auto-aggro clears stale previousState
  //
  // Contract: after auto-aggro creates a previousState chain,
  // a player move command clears it completely. When the
  // move finishes and unit goes Idle, there is no stale
  // restore to the old gather state.
  // ----------------------------------------------------------
  test('manual move after auto-aggro clears stale previousState chain', async ({ page }) => {
    await waitForGame(page)

    const result = await page.evaluate(() => {
      const g = (window as any).__war3Game
      if (!g) return null

      const unit = g.spawnUnit('footman', 0, 32, 44)
      const V3 = unit.mesh.position.constructor

      // Simulate auto-aggro having created a previousState chain
      // (as if unit was Idle, then auto-aggro engaged)
      unit.state = 7
      unit.attackTarget = g.units.find((u: any) => u.team === 1)
      unit.previousState = 0
      unit.previousGatherType = null
      unit.previousResourceTarget = null
      unit.previousMoveTarget = null
      unit.previousWaypoints = []
      unit.previousMoveQueue = []
      unit.previousAttackMoveTarget = null

      const before = {
        state: unit.state,
        previousState: unit.previousState,
      }

      // Player issues move command
      const moveTarget = new V3(28, 0, 44)
      g.issueCommand([unit], { type: 'move', target: moveTarget })
      g.planPath(unit, moveTarget)
      g.suppressAggroFor([unit], 1.5)

      const after = {
        state: unit.state,
        attackTarget: !!unit.attackTarget,
        moveTarget: !!unit.moveTarget,
        previousState: unit.previousState,
        previousGatherType: unit.previousGatherType,
        previousResourceTarget: !!unit.previousResourceTarget,
        previousMoveTarget: !!unit.previousMoveTarget,
        previousWaypointsLen: unit.previousWaypoints.length,
        previousMoveQueueLen: unit.previousMoveQueue.length,
        previousAttackMoveTarget: !!unit.previousAttackMoveTarget,
        aggroSuppressUntil: unit.aggroSuppressUntil,
        gameTime: g.gameTime,
      }

      // Advance until move completes → unit becomes Idle
      for (let i = 0; i < 200; i++) g.update(0.016)

      // After arriving, there should be no stale previousState to restore
      const afterArrival = {
        state: unit.state,
        previousState: unit.previousState,
        attackTarget: !!unit.attackTarget,
      }

      return { before, after, afterArrival }
    })

    expect(result).not.toBeNull()

    // Before: had stale previousState
    expect(result!.before.previousState).toBe(S.Idle)

    // After move command: everything cleared
    expect(result!.after.state).toBe(S.Moving)
    expect(result!.after.attackTarget).toBe(false)
    expect(result!.after.previousState).toBeNull()
    expect(result!.after.previousGatherType).toBeNull()
    expect(result!.after.previousResourceTarget).toBe(false)
    expect(result!.after.previousMoveTarget).toBe(false)
    expect(result!.after.previousWaypointsLen).toBe(0)
    expect(result!.after.previousMoveQueueLen).toBe(0)
    expect(result!.after.previousAttackMoveTarget).toBe(false)

    // After arrival: no stale restore
    expect(result!.afterArrival.previousState).toBeNull()
    expect(
      [S.Idle, S.Moving].includes(result!.afterArrival.state),
      `After arrival state should be Idle or Moving (awaiting next queue), got ${result!.afterArrival.state}`,
    ).toBe(true)
  })

  // ----------------------------------------------------------
  // Test 7: Attack command clears suppression (offensive intent)
  //
  // Contract: explicit player attack command sets
  // aggroSuppressUntil = 0, representing offensive intent.
  // ----------------------------------------------------------
  test('attack command clears aggro suppression (offensive intent)', async ({ page }) => {
    await waitForGame(page)

    const result = await page.evaluate(() => {
      const g = (window as any).__war3Game
      if (!g) return null

      const unit = g.spawnUnit('footman', 0, 30, 48)
      const enemy = g.spawnUnit('footman', 1, 32, 48)

      // Set high suppression as if retreating
      unit.aggroSuppressUntil = g.gameTime + 10

      // Player right-clicks enemy → attack command
      g.issueCommand([unit], { type: 'attack', target: enemy })

      return {
        state: unit.state,
        attackTarget: !!unit.attackTarget,
        attackTargetTeam: unit.attackTarget?.team,
        aggroSuppressUntil: unit.aggroSuppressUntil,
        previousState: unit.previousState,
        gameTime: g.gameTime,
      }
    })

    expect(result).not.toBeNull()
    expect(result!.state).toBe(S.Attacking)
    expect(result!.attackTarget).toBe(true)
    expect(result!.attackTargetTeam).toBe(1)
    expect(
      result!.aggroSuppressUntil,
      `Attack command should clear aggroSuppressUntil to 0, got ${result!.aggroSuppressUntil}`,
    ).toBe(0)
    expect(result!.previousState).toBeNull()
  })

  // ----------------------------------------------------------
  // Test 8: Auto-aggro only fires for Idle/AttackMove, not Moving
  //
  // Contract: Moving units are never interrupted by auto-aggro.
  // This is the core war3 rule: player move priority > auto fight.
  // ----------------------------------------------------------
  test('auto-aggro does not interrupt Moving units', async ({ page }) => {
    await waitForGame(page)

    const result = await page.evaluate(() => {
      const g = (window as any).__war3Game
      if (!g) return null

      const player = g.spawnUnit('footman', 0, 30, 52)
      const enemy = g.spawnUnit('footman', 1, 31, 52) // right next to path
      const V3 = player.mesh.position.constructor

      // Move command past the enemy (long enough to still be moving)
      const moveTarget = new V3(40, 0, 52)
      g.issueCommand([player], { type: 'move', target: moveTarget })
      g.planPath(player, moveTarget)
      // No suppression needed — Moving units are excluded from auto-aggro
      // But set suppress to 0 to prove it's not the suppression doing it
      player.aggroSuppressUntil = 0

      // Advance 3 seconds — unit should still be Moving, not Attacking
      let snappedToAttacking = false
      for (let i = 0; i < 200; i++) {
        g.update(0.016)
        if (player.state === 7) {
          snappedToAttacking = true
          break
        }
      }

      return {
        state: player.state,
        snappedToAttacking,
        moveTarget: !!player.moveTarget,
        attackTarget: !!player.attackTarget,
        gameTime: g.gameTime?.toFixed(2),
        pos: { x: player.mesh.position.x.toFixed(1), z: player.mesh.position.z.toFixed(1) },
      }
    })

    expect(result).not.toBeNull()
    expect(
      result!.snappedToAttacking,
      'Moving unit should NOT be interrupted by auto-aggro even with aggroSuppressUntil=0',
    ).toBe(false)
    expect(result!.state).toBe(S.Moving)
    expect(result!.moveTarget).toBe(true)
  })
})
