/**
 * V5-COUNTER1 Counter and Composition Backbone Proof
 *
 * The proof is intentionally bounded. It does not claim a complete combat
 * model; it proves the current runtime already has measurable unit quality,
 * armor, army-composition, and static-defense differences that can support
 * strategy work in V5.
 */
import { test, expect, type Page } from '@playwright/test'
import { UNITS } from '../src/game/GameData'

const BASE = 'http://127.0.0.1:4173/?runtimeTest=1'

async function waitForGame(page: Page) {
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
  } catch { /* procedural fallback is valid */ }
  await page.waitForTimeout(500)
}

async function disableAI(page: Page) {
  await page.evaluate(() => {
    const g = (window as any).__war3Game
    if (g?.ai) {
      if (typeof g.ai.reset === 'function') g.ai.reset()
      g.ai.update = () => {}
    }
  })
}

test.describe('V5-COUNTER1 counter and composition backbone', () => {
  test.setTimeout(120000)

  test('unit quality: footman is measurably different from worker', async ({ page }) => {
    await waitForGame(page)
    await disableAI(page)

    const result = await page.evaluate(() => {
      const g = (window as any).__war3Game
      const th = g.units.find((u: any) => u.team === 0 && u.type === 'townhall' && u.hp > 0)
      if (!th) return null
      const p = th.mesh.position
      const footman = g.spawnUnit('footman', 0, p.x + 7, p.z)
      const worker = g.spawnUnit('worker', 1, p.x + 8, p.z)
      return {
        footman: {
          hp: footman.hp,
          damage: footman.attackDamage,
          cooldown: footman.attackCooldown,
          armor: footman.armor,
        },
        worker: {
          hp: worker.hp,
          damage: worker.attackDamage,
          cooldown: worker.attackCooldown,
          armor: worker.armor,
        },
      }
    })

    expect(result).not.toBeNull()
    expect(result!.footman.hp).toBeGreaterThan(result!.worker.hp)
    expect(result!.footman.damage).toBeGreaterThan(result!.worker.damage)
    expect(result!.footman.armor).toBeGreaterThan(result!.worker.armor)
    expect(UNITS.footman.supply).toBeGreaterThan(UNITS.worker.supply)
    expect(UNITS.footman.canGather).toBe(false)
    expect(UNITS.worker.canGather).toBe(true)
  })

  test('armor: worker damage is reduced by footman armor in real combat ticks', async ({ page }) => {
    await waitForGame(page)
    await disableAI(page)

    const result = await page.evaluate(() => {
      const g = (window as any).__war3Game
      const th = g.units.find((u: any) => u.team === 0 && u.type === 'townhall' && u.hp > 0)
      if (!th) return null
      const p = th.mesh.position

      const targetFootman = g.spawnUnit('footman', 0, p.x + 7, p.z)
      const targetWorker = g.spawnUnit('worker', 0, p.x + 7, p.z + 2)
      const attackerA = g.spawnUnit('worker', 1, p.x + 7.4, p.z)
      const attackerB = g.spawnUnit('worker', 1, p.x + 7.4, p.z + 2)

      const startFootmanHp = targetFootman.hp
      const startWorkerHp = targetWorker.hp
      g.issueCommand([attackerA], { type: 'attack', target: targetFootman })
      g.issueCommand([attackerB], { type: 'attack', target: targetWorker })
      attackerA.attackTimer = 0
      attackerB.attackTimer = 0

      let remaining = 1.7
      while (remaining > 0) {
        const step = Math.min(0.016, remaining)
        g.update(step)
        remaining -= step
      }

      return {
        footmanArmor: targetFootman.armor,
        workerArmor: targetWorker.armor,
        footmanDamageTaken: startFootmanHp - targetFootman.hp,
        workerDamageTaken: startWorkerHp - targetWorker.hp,
      }
    })

    expect(result).not.toBeNull()
    expect(result!.footmanArmor).toBe(2)
    expect(result!.workerArmor).toBe(0)
    expect(result!.footmanDamageTaken).toBeGreaterThan(0)
    expect(result!.workerDamageTaken).toBeGreaterThan(0)
    expect(result!.footmanDamageTaken).toBeLessThan(result!.workerDamageTaken)
  })

  test('army composition: military units remove economic units faster than workers do', async ({ page }) => {
    await waitForGame(page)
    await disableAI(page)

    const result = await page.evaluate(() => {
      const g = (window as any).__war3Game
      const th = g.units.find((u: any) => u.team === 0 && u.type === 'townhall' && u.hp > 0)
      if (!th) return null
      const p = th.mesh.position

      const runScenario = (attackerType: 'footman' | 'worker', originZ: number) => {
        const attackers: any[] = []
        const defenders: any[] = []
        for (let i = 0; i < 3; i++) attackers.push(g.spawnUnit(attackerType, 0, p.x + 7, p.z + originZ + i * 0.4))
        for (let i = 0; i < 4; i++) defenders.push(g.spawnUnit('worker', 1, p.x + 7.5, p.z + originZ + i * 0.35))

        const defenderHpBefore = defenders.reduce((sum: number, u: any) => sum + u.hp, 0)
        for (let i = 0; i < attackers.length; i++) {
          g.issueCommand([attackers[i]], { type: 'attack', target: defenders[Math.min(i, defenders.length - 1)] })
          attackers[i].attackTimer = 0
        }
        for (let i = 0; i < defenders.length; i++) {
          g.issueCommand([defenders[i]], { type: 'attack', target: attackers[Math.min(i, attackers.length - 1)] })
          defenders[i].attackTimer = 0
        }

        let remaining = 18
        while (remaining > 0) {
          const step = Math.min(0.016, remaining)
          g.update(step)
          remaining -= step
        }

        const liveDefenders = defenders.filter((u: any) => g.units.includes(u) && u.hp > 0)
        const defenderHpAfter = liveDefenders.reduce((sum: number, u: any) => sum + u.hp, 0)
        return {
          attackerType,
          damageToWorkers: defenderHpBefore - defenderHpAfter,
          defendersAlive: liveDefenders.length,
        }
      }

      const workerAttack = runScenario('worker', 0)
      const footmanAttack = runScenario('footman', 5)
      return { workerAttack, footmanAttack }
    })

    expect(result).not.toBeNull()
    expect(result!.footmanAttack.damageToWorkers).toBeGreaterThan(result!.workerAttack.damageToWorkers)
    expect(result!.footmanAttack.defendersAlive).toBeLessThanOrEqual(result!.workerAttack.defendersAlive)
  })

  test('static defense composition: tower support measurably changes the fight', async ({ page }) => {
    await waitForGame(page)
    await disableAI(page)

    const result = await page.evaluate(() => {
      const g = (window as any).__war3Game
      const th = g.units.find((u: any) => u.team === 0 && u.type === 'townhall' && u.hp > 0)
      if (!th) return null
      const p = th.mesh.position

      const runScenario = (withTower: boolean, originZ: number) => {
        const playerFootman = g.spawnUnit('footman', 0, p.x + 7, p.z + originZ)
        const enemyA = g.spawnUnit('footman', 1, p.x + 7.5, p.z + originZ - 0.35)
        const enemyB = g.spawnUnit('footman', 1, p.x + 7.5, p.z + originZ + 0.35)
        const enemies = [enemyA, enemyB]
        let tower: any = null
        if (withTower) {
          tower = g.spawnBuilding('tower', 0, p.x + 7, p.z + originZ + 1.6)
          tower.buildProgress = 1
          tower.attackTimer = 0
        }

        const enemyHpBefore = enemies.reduce((sum: number, u: any) => sum + u.hp, 0)
        g.issueCommand([playerFootman], { type: 'attack', target: enemyA })
        g.issueCommand(enemies, { type: 'attack', target: playerFootman })
        playerFootman.attackTimer = 0
        enemyA.attackTimer = 0
        enemyB.attackTimer = 0

        let remaining = 18
        while (remaining > 0) {
          const step = Math.min(0.016, remaining)
          g.update(step)
          remaining -= step
        }

        const liveEnemies = enemies.filter((u: any) => g.units.includes(u) && u.hp > 0)
        const enemyHpAfter = liveEnemies.reduce((sum: number, u: any) => sum + u.hp, 0)
        return {
          withTower,
          towerDamage: tower?.attackDamage ?? 0,
          enemyDamageTaken: enemyHpBefore - enemyHpAfter,
          enemiesAlive: liveEnemies.length,
          playerFootmanAlive: g.units.includes(playerFootman) && playerFootman.hp > 0,
        }
      }

      const withoutTower = runScenario(false, 0)
      const withTower = runScenario(true, 5)
      return { withoutTower, withTower }
    })

    expect(result).not.toBeNull()
    expect(result!.withTower.towerDamage).toBeGreaterThan(0)
    expect(result!.withTower.enemyDamageTaken).toBeGreaterThan(result!.withoutTower.enemyDamageTaken)
    expect(result!.withTower.enemiesAlive).toBeLessThanOrEqual(result!.withoutTower.enemiesAlive)
  })

  test('V5-COUNTER1 audit: current runtime has a bounded strategy backbone', async ({ page }) => {
    await waitForGame(page)
    await disableAI(page)

    const result = await page.evaluate(() => {
      const g = (window as any).__war3Game
      const th = g.units.find((u: any) => u.team === 0 && u.type === 'townhall' && u.hp > 0)
      if (!th) return null
      const p = th.mesh.position

      const footman = g.spawnUnit('footman', 0, p.x + 7, p.z)
      const worker = g.spawnUnit('worker', 1, p.x + 8, p.z)
      const tower = g.spawnBuilding('tower', 0, p.x + 7, p.z + 2)
      tower.buildProgress = 1

      const compositionLog = [
        {
          phase: 'DATA',
          relation: 'footman_vs_worker',
          hpDelta: footman.hp - worker.hp,
          damageDelta: footman.attackDamage - worker.attackDamage,
          armorDelta: footman.armor - worker.armor,
        },
        {
          phase: 'STATIC_DEFENSE',
          relation: 'tower_support',
          towerDamage: tower.attackDamage,
          towerRange: tower.attackRange,
        },
      ]

      return {
        compositionLog,
        audit: {
          unitQuality: footman.hp > worker.hp && footman.attackDamage > worker.attackDamage,
          armorDifference: footman.armor > worker.armor,
          staticDefense: tower.attackDamage > 0 && tower.attackRange > footman.attackRange,
        },
      }
    })

    expect(result).not.toBeNull()
    expect(result!.compositionLog).toHaveLength(2)
    for (const [key, passed] of Object.entries(result!.audit)) {
      expect(passed, `${key} should pass`).toBe(true)
    }
    expect(UNITS.footman.canGather).toBe(false)
    expect(UNITS.worker.canGather).toBe(true)
  })
})
