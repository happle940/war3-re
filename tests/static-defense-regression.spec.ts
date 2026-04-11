/**
 * Static Defense Regression Pack
 *
 * Runtime-proof contracts for arrow tower combat behavior.
 * Towers must acquire enemies, deal damage on cooldown, never chase,
 * clear dead targets, ignore allies/goldmines, and not attack while
 * under construction.
 */
import { test, expect, type Page } from '@playwright/test'

const BASE = 'http://127.0.0.1:4173'

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
    // Procedural fallback is fine for combat contracts.
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
      units: g.units.slice(0, 30).map((u: any, idx: number) => ({
        idx,
        type: u.type,
        team: u.team,
        hp: u.hp,
        state: u.state,
        isBuilding: u.isBuilding,
        attackDamage: u.attackDamage,
        attackRange: u.attackRange,
        attackCooldown: u.attackCooldown,
        buildProgress: u.buildProgress,
        attackTarget: u.attackTarget?.type ?? null,
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

test.describe('Static Defense Combat Contracts', () => {
  test.setTimeout(120000)

  test('completed tower damages enemy unit inside range over simulated time', async ({ page }) => {
    await waitForGame(page)

    const result = await page.evaluate(() => {
      const g = (window as any).__war3Game
      if (!g) return { ok: false, reason: 'no game' }

      // Spawn a completed tower at (40, 40) and an enemy footman nearby
      const tower = g.spawnBuilding('tower', 0, 40, 40)
      tower.buildProgress = 1
      const enemy = g.spawnUnit('footman', 1, 41, 40) // 1 tile away — well within range

      const enemyHpBefore = enemy.hp
      const towerDamage = tower.attackDamage
      const towerRange = tower.attackRange

      // Advance 10 game-seconds (enough for multiple attack cycles at 1.5s cooldown)
      for (let i = 0; i < 625; i++) g.update(0.016)

      return {
        ok: true,
        enemyHpBefore,
        enemyHpAfter: enemy.hp,
        enemyAlive: enemy.hp > 0,
        towerDamage,
        towerRange,
        towerAttackTarget: tower.attackTarget ? g.units.indexOf(tower.attackTarget) : -1,
      }
    })

    if (!result.ok) await diagnose(page, 'tower-damages-enemy')
    expect(result.ok).toBe(true)
    expect(result.towerDamage, 'Tower should have nonzero attackDamage').toBeGreaterThan(0)
    expect(result.towerRange, 'Tower should have nonzero attackRange').toBeGreaterThan(0)
    expect(result.enemyHpAfter, 'Enemy should have taken damage').toBeLessThan(result.enemyHpBefore)
    expect(severeConsoleErrors(page)).toHaveLength(0)
  })

  test('under-construction tower does not damage enemy', async ({ page }) => {
    await waitForGame(page)

    const result = await page.evaluate(() => {
      const g = (window as any).__war3Game
      if (!g) return { ok: false, reason: 'no game' }

      const tower = g.spawnBuilding('tower', 0, 40, 40)
      tower.buildProgress = 0.3 // under construction
      const enemy = g.spawnUnit('footman', 1, 41, 40)

      const enemyHpBefore = enemy.hp

      // Advance 10 game-seconds
      for (let i = 0; i < 625; i++) g.update(0.016)

      return {
        ok: true,
        enemyHpBefore,
        enemyHpAfter: enemy.hp,
        buildProgress: tower.buildProgress,
      }
    })

    if (!result.ok) await diagnose(page, 'under-construction-no-attack')
    expect(result.ok).toBe(true)
    expect(result.enemyHpAfter, 'Under-construction tower should not deal damage').toBe(result.enemyHpBefore)
    expect(severeConsoleErrors(page)).toHaveLength(0)
  })

  test('tower does not damage allied units', async ({ page }) => {
    await waitForGame(page)

    const result = await page.evaluate(() => {
      const g = (window as any).__war3Game
      if (!g) return { ok: false, reason: 'no game' }

      const tower = g.spawnBuilding('tower', 0, 40, 40)
      tower.buildProgress = 1
      // Allied footman (same team 0)
      const ally = g.spawnUnit('footman', 0, 41, 40)

      const allyHpBefore = ally.hp

      // Advance 10 game-seconds
      for (let i = 0; i < 625; i++) g.update(0.016)

      return {
        ok: true,
        allyHpBefore,
        allyHpAfter: ally.hp,
        towerAttackTarget: tower.attackTarget ? g.units.indexOf(tower.attackTarget) : -1,
      }
    })

    if (!result.ok) await diagnose(page, 'tower-no-friendly-fire')
    expect(result.ok).toBe(true)
    expect(result.allyHpAfter, 'Tower should not damage allied units').toBe(result.allyHpBefore)
    expect(result.towerAttackTarget, 'Tower should not target allies').toBe(-1)
    expect(severeConsoleErrors(page)).toHaveLength(0)
  })

  test('tower does not move or receive chase movement while attacking', async ({ page }) => {
    await waitForGame(page)

    const result = await page.evaluate(() => {
      const g = (window as any).__war3Game
      if (!g) return { ok: false, reason: 'no game' }

      const tower = g.spawnBuilding('tower', 0, 40, 40)
      tower.buildProgress = 1
      const enemy = g.spawnUnit('footman', 1, 42, 40) // 2 tiles away

      const posBefore = {
        x: tower.mesh.position.x,
        z: tower.mesh.position.z,
      }

      // Advance 10 game-seconds
      for (let i = 0; i < 625; i++) g.update(0.016)

      const posAfter = {
        x: tower.mesh.position.x,
        z: tower.mesh.position.z,
      }
      const distMoved = Math.sqrt(
        (posAfter.x - posBefore.x) ** 2 + (posAfter.z - posBefore.z) ** 2,
      )

      return {
        ok: true,
        posBefore,
        posAfter,
        distMoved: distMoved.toFixed(4),
        moveTarget: !!tower.moveTarget,
        waypointsLen: tower.waypoints?.length ?? 0,
        speed: tower.speed,
      }
    })

    if (!result.ok) await diagnose(page, 'tower-no-chase')
    expect(result.ok).toBe(true)
    expect(parseFloat(result.distMoved), 'Tower should not move').toBe(0)
    expect(result.moveTarget, 'Tower should not have a moveTarget').toBe(false)
    expect(result.waypointsLen, 'Tower should not have waypoints').toBe(0)
    expect(result.speed, 'Tower speed should be 0').toBe(0)
    expect(severeConsoleErrors(page)).toHaveLength(0)
  })

  test('after target death tower clears attackTarget and can acquire new enemy', async ({ page }) => {
    await waitForGame(page)

    const result = await page.evaluate(() => {
      const g = (window as any).__war3Game
      if (!g) return { ok: false, reason: 'no game' }

      const tower = g.spawnBuilding('tower', 0, 40, 40)
      tower.buildProgress = 1
      const enemy1 = g.spawnUnit('footman', 1, 41, 40)
      const enemy2 = g.spawnUnit('footman', 1, 43, 40)

      // Advance until tower acquires first target
      for (let i = 0; i < 200; i++) g.update(0.016)
      const hadTarget1 = tower.attackTarget === enemy1 || tower.attackTarget === enemy2
      const target1Type = tower.attackTarget?.type ?? null

      // Kill the current target
      if (tower.attackTarget) tower.attackTarget.hp = 0
      g.handleDeadUnits()

      const targetAfterDeath = tower.attackTarget ? g.units.indexOf(tower.attackTarget) : -1

      // Advance more so tower can acquire second target
      for (let i = 0; i < 200; i++) g.update(0.016)

      const acquiredNewTarget = tower.attackTarget !== null
      const newTargetType = tower.attackTarget?.type ?? null

      return {
        ok: true,
        hadTarget1,
        target1Type,
        targetAfterDeath,
        acquiredNewTarget,
        newTargetType,
        enemy2Hp: enemy2.hp,
      }
    })

    if (!result.ok) await diagnose(page, 'tower-reacquire')
    expect(result.ok).toBe(true)
    expect(result.hadTarget1, 'Tower should have acquired first target').toBe(true)
    expect(result.targetAfterDeath, 'Tower should clear dead target').toBe(-1)
    expect(result.acquiredNewTarget, 'Tower should acquire new target after first dies').toBe(true)
    expect(result.newTargetType, 'New target should be a footman').toBe('footman')
    expect(result.enemy2Hp, 'Tower should damage second target').toBeLessThan(420)
    expect(severeConsoleErrors(page)).toHaveLength(0)
  })

  test('tower ignores goldmine and non-combat resource targets', async ({ page }) => {
    await waitForGame(page)

    const result = await page.evaluate(() => {
      const g = (window as any).__war3Game
      if (!g) return { ok: false, reason: 'no game' }

      const tower = g.spawnBuilding('tower', 0, 40, 40)
      tower.buildProgress = 1

      // Find an enemy goldmine or place a goldmine-like building
      // Spawn an enemy farm (building, not a goldmine) near tower
      const enemyFarm = g.spawnBuilding('farm', 1, 41, 40)
      // Also ensure there's no enemy unit nearby to target instead
      // The goldmine from initial map setup should exist but is team -1 or neutral

      // Advance 10 game-seconds
      for (let i = 0; i < 625; i++) g.update(0.016)

      const towerTarget = tower.attackTarget ? g.units.indexOf(tower.attackTarget) : -1
      const farmHpAfter = enemyFarm.hp
      const farmHpMax = enemyFarm.maxHp

      return {
        ok: true,
        towerTarget,
        farmHpAfter,
        farmHpMax,
        farmDamaged: farmHpAfter < farmHpMax,
      }
    })

    if (!result.ok) await diagnose(page, 'tower-ignores-buildings')
    expect(result.ok).toBe(true)
    // Tower should not target buildings (farms, goldmines, etc.)
    expect(result.towerTarget, 'Tower should not target buildings').toBe(-1)
    expect(result.farmDamaged, 'Tower should not damage buildings').toBe(false)
    expect(severeConsoleErrors(page)).toHaveLength(0)
  })

  test('no severe console errors during tower combat', async ({ page }) => {
    await waitForGame(page)

    await page.evaluate(() => {
      const g = (window as any).__war3Game
      if (!g) return

      const tower = g.spawnBuilding('tower', 0, 40, 40)
      tower.buildProgress = 1
      const enemy = g.spawnUnit('footman', 1, 42, 40)

      // Run extended combat simulation (30 game-seconds)
      for (let i = 0; i < 1875; i++) g.update(0.016)

      // Kill target and run more
      if (enemy.hp > 0) enemy.hp = 0
      g.handleDeadUnits()
      for (let i = 0; i < 300; i++) g.update(0.016)

      // Spawn another enemy and let tower acquire it
      const enemy2 = g.spawnUnit('footman', 1, 43, 40)
      for (let i = 0; i < 1000; i++) g.update(0.016)
    })

    expect(severeConsoleErrors(page)).toHaveLength(0)
  })
})
