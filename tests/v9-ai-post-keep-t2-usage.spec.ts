/**
 * V9 HN2-AI11 AI Post-Keep T2 Usage Proof
 *
 * Proves the AI uses T2 content (Workshop, Arcane Sanctum) after Keep upgrade:
 * 1. Without Keep, AI does not build Workshop / Arcane Sanctum
 * 2. With Keep, AI builds Workshop / Arcane Sanctum through tryBuildBuilding
 * 3. AI trains Mortar Team from completed Workshop
 * 4. AI trains Priest from completed Arcane Sanctum
 * 5. Priest uses existing V7 caster system; no new heal AI
 * 6. No Castle / Knight / new content
 *
 * Uses fresh state reads after every mutation.
 */
import { test, expect, type Page } from '@playwright/test'
import { BUILDINGS, UNITS } from '../src/game/GameData'

const BASE_RUNTIME = 'http://127.0.0.1:4173/?runtimeTest=1'

// Pre-extract values for use in page.evaluate closures
const KEEP_HP = BUILDINGS.keep.hp
const MORTAR_COST = UNITS.mortar_team.cost
const MORTAR_TRAIN_TIME = UNITS.mortar_team.trainTime
const PRIEST_COST = UNITS.priest.cost
const PRIEST_TRAIN_TIME = UNITS.priest.trainTime
const PRIEST_ATTACK = UNITS.priest.attackDamage

async function waitForRuntime(page: Page) {
  await page.goto(BASE_RUNTIME, { waitUntil: 'domcontentloaded' })
  await page.waitForFunction(() => {
    const game = (window as any).__war3Game
    if (!game || !game.renderer) return false
    if (!Array.isArray(game.units) || game.units.length === 0) return false
    return game.renderer.domElement.width > 0
  }, { timeout: 15000 })
  try {
    await page.waitForFunction(() => {
      const status = document.getElementById('map-status')?.textContent ?? ''
      return !status.includes('正在加载')
    }, { timeout: 15000 })
  } catch {
    // Procedural fallback
  }
  await page.evaluate(() => {
    const g = (window as any).__war3Game
    if (g?.ai) {
      if (typeof g.ai.reset === 'function') g.ai.reset()
      g.ai.update = () => {}
    }
  })
  await page.waitForTimeout(300)
}

test.describe('V9 AI Post-Keep T2 Usage', () => {
  test.setTimeout(120000)

  test('AT-1: without Keep, AI does not build Workshop or Arcane Sanctum', async ({ page }) => {
    await waitForRuntime(page)

    const result = await page.evaluate(() => {
      const g = (window as any).__war3Game
      const team = 1

      // Ensure no Keep exists on team 1
      const keeps = g.units.filter(
        (u: any) => u.team === team && u.type === 'keep' && u.isBuilding && u.hp > 0,
      )
      for (const k of keeps) k.hp = 0
      g.handleDeadUnits()

      // Give resources and prerequisites
      g.resources.earn(team, 5000, 5000)
      const hall = g.units.find(
        (u: any) => u.team === team && u.type === 'townhall' && u.isBuilding && u.hp > 0 && u.buildProgress >= 1,
      )
      if (!hall) return { error: 'no townhall' }

      // Set up post-opening state with barracks + blacksmith
      const barracks = g.spawnBuilding('barracks', team, hall.mesh.position.x + 5, hall.mesh.position.z + 5)
      const blacksmith = g.spawnBuilding('blacksmith', team, hall.mesh.position.x - 5, hall.mesh.position.z + 5)

      // Count T2 buildings before
      const t2Types = ['workshop', 'arcane_sanctum']
      const beforeCount = t2Types.reduce((sum, t) =>
        sum + g.units.filter((u: any) => u.team === team && u.type === t && u.hp > 0).length, 0)

      // Tick AI multiple times with post-opening state
      g.ai.waveCount = 2
      g.ai.attackWaveSent = false
      for (let i = 0; i < 10; i++) {
        g.ai.tickTimer = 0
        g.ai.tick()
        // Complete any non-T2 buildings under construction (farms etc.)
        for (const b of g.units.filter((u: any) => u.team === team && u.isBuilding && u.hp > 0)) {
          if (!t2Types.includes(b.type) && b.buildProgress < 1) {
            b.buildProgress = 1
          }
        }
      }

      // Read fresh state
      const afterCount = t2Types.reduce((sum, t) =>
        sum + g.units.filter((u: any) => u.team === team && u.type === t && u.hp > 0).length, 0)

      // Verify no Keep exists
      const hasKeep = g.units.some(
        (u: any) => u.team === team && u.type === 'keep' && u.isBuilding && u.hp > 0,
      )

      // Cleanup
      barracks.hp = 0
      blacksmith.hp = 0
      g.handleDeadUnits()

      return { beforeCount, afterCount, hasKeep }
    })

    expect(result.error).toBeUndefined()
    expect(result.hasKeep).toBe(false)
    expect(result.afterCount).toBe(result.beforeCount)
  })

  test('AT-2: with completed Keep, AI builds Workshop and Arcane Sanctum through tryBuildBuilding', async ({ page }) => {
    await waitForRuntime(page)

    const result = await page.evaluate(({ keepHp }) => {
      const g = (window as any).__war3Game
      const team = 1

      g.ai.reset()
      g.resources.earn(team, 10000, 10000)

      const hall = g.units.find(
        (u: any) => u.team === team && u.type === 'townhall' && u.isBuilding && u.hp > 0 && u.buildProgress >= 1,
      )
      if (!hall) return { error: 'no townhall' }

      // Convert townhall to keep (simulate completed upgrade)
      hall.type = 'keep'
      hall.maxHp = keepHp
      hall.hp = keepHp
      hall.upgradeQueue = null

      // Set up prerequisites
      g.spawnBuilding('barracks', team, hall.mesh.position.x + 5, hall.mesh.position.z + 5)
      g.spawnBuilding('blacksmith', team, hall.mesh.position.x - 5, hall.mesh.position.z + 5)

      // Ensure idle workers
      let workers = g.units.filter((u: any) => u.team === team && u.type === 'worker' && !u.isBuilding && u.hp > 0)
      while (workers.length < 5) {
        g.spawnUnit('worker', team, hall.mesh.position.x + 2 + workers.length, hall.mesh.position.z - 3)
        workers = g.units.filter((u: any) => u.team === team && u.type === 'worker' && !u.isBuilding && u.hp > 0)
      }
      // Set workers to idle
      for (const w of workers) {
        w.state = 0 // UnitState.Idle
        w.moveTarget = null
        w.waypoints = []
      }

      // Count T2 buildings before
      const t2Types = ['workshop', 'arcane_sanctum']
      const beforeCount = t2Types.reduce((sum, t) =>
        sum + g.units.filter((u: any) => u.team === team && u.type === t && u.hp > 0).length, 0)

      // Tick AI multiple times
      g.ai.waveCount = 2
      g.ai.attackWaveSent = false
      for (let i = 0; i < 15; i++) {
        g.ai.tickTimer = 0
        g.ai.tick()
        // Complete non-T2 buildings to unlock more decisions
        for (const b of g.units.filter((u: any) => u.team === team && u.isBuilding && u.hp > 0)) {
          if (!t2Types.includes(b.type) && b.buildProgress < 1) {
            b.buildProgress = 1
          }
        }
        // Re-idle workers so they can be used for building
        for (const w of g.units.filter((u: any) => u.team === team && u.type === 'worker' && !u.isBuilding && u.hp > 0)) {
          w.state = 0
          w.moveTarget = null
          w.waypoints = []
        }
      }

      // Read fresh state
      const t2Buildings = g.units.filter(
        (u: any) => u.team === team && t2Types.includes(u.type) && u.hp > 0,
      )
      const workshopBuilding = t2Buildings.find((u: any) => u.type === 'workshop')
      const sanctumBuilding = t2Buildings.find((u: any) => u.type === 'arcane_sanctum')

      const afterCount = t2Buildings.length

      return {
        beforeCount,
        afterCount,
        hasWorkshop: !!workshopBuilding,
        hasSanctum: !!sanctumBuilding,
        workshopProgress: workshopBuilding?.buildProgress ?? null,
        workshopHasBuilder: !!workshopBuilding?.builder,
        sanctumProgress: sanctumBuilding?.buildProgress ?? null,
        sanctumHasBuilder: !!sanctumBuilding?.builder,
      }
    }, { keepHp: KEEP_HP })

    expect(result.error).toBeUndefined()
    expect(result.afterCount).toBeGreaterThan(result.beforeCount)
    expect(result.hasWorkshop).toBe(true)
    expect(result.hasSanctum).toBe(true)
    expect(result.workshopProgress).toBeLessThan(1)
    expect(result.sanctumProgress).toBeLessThan(1)
    expect(result.workshopHasBuilder).toBe(true)
    expect(result.sanctumHasBuilder).toBe(true)
  })

  test('AT-3: AI trains Mortar Team from completed Workshop with resource and supply checks', async ({ page }) => {
    await waitForRuntime(page)

    const result = await page.evaluate(({ keepHp, expectedCost, expectedTrainTime }) => {
      const g = (window as any).__war3Game
      const team = 1

      g.resources.earn(team, 5000, 5000)
      const hall = g.units.find(
        (u: any) => u.team === team && u.type === 'townhall' && u.isBuilding && u.hp > 0 && u.buildProgress >= 1,
      )
      if (!hall) return { error: 'no townhall' }

      // Spawn completed Keep + Workshop as fixture for training proof
      hall.type = 'keep'
      hall.maxHp = keepHp
      hall.hp = keepHp
      hall.upgradeQueue = null

      g.spawnBuilding('farm', team, hall.mesh.position.x - 3, hall.mesh.position.z - 5)
      const workshop = g.spawnBuilding('workshop', team, hall.mesh.position.x + 8, hall.mesh.position.z + 3)

      // Read fresh state
      const freshWs = g.units.find((u: any) => u === workshop && u.hp > 0)
      if (!freshWs) return { error: 'workshop not found' }

      const queueBefore = freshWs.trainingQueue.length
      const resBefore = g.resources.get(team)
      const spendCalls: any[] = []
      const originalSpend = g.resources.spend.bind(g.resources)
      g.resources.spend = (spendTeam: number, cost: any) => {
        spendCalls.push({ team: spendTeam, gold: cost.gold, lumber: cost.lumber })
        return originalSpend(spendTeam, cost)
      }

      // Tick AI
      g.ai.waveCount = 2
      g.ai.tickTimer = 0
      g.ai.tick()
      g.resources.spend = originalSpend

      // Read fresh state
      const freshWsAfter = g.units.find((u: any) => u === workshop && u.hp > 0)
      const resAfter = g.resources.get(team)
      const trainEntry = freshWsAfter?.trainingQueue?.[queueBefore] ?? null
      const mortarSpend = spendCalls.find(
        (call) => call.team === team && call.gold === expectedCost.gold && call.lumber === expectedCost.lumber,
      )

      // Cleanup
      workshop.hp = 0
      g.handleDeadUnits()

      return {
        queueBefore,
        queueAfter: freshWsAfter?.trainingQueue?.length ?? -1,
        queuedType: trainEntry?.type ?? '',
        queuedRemaining: trainEntry?.remaining ?? 0,
        spentGold: resBefore.gold - resAfter.gold,
        spentLumber: resBefore.lumber - resAfter.lumber,
        hasExactSpend: !!mortarSpend,
        expectedCostGold: expectedCost.gold,
        expectedCostLumber: expectedCost.lumber,
        expectedTrainTime,
      }
    }, { keepHp: KEEP_HP, expectedCost: MORTAR_COST, expectedTrainTime: MORTAR_TRAIN_TIME })

    expect(result.error).toBeUndefined()
    expect(result.queueAfter).toBeGreaterThan(result.queueBefore)
    expect(result.queuedType).toBe('mortar_team')
    expect(result.queuedRemaining).toBe(result.expectedTrainTime)
    expect(result.spentGold).toBeGreaterThanOrEqual(result.expectedCostGold)
    expect(result.spentLumber).toBeGreaterThanOrEqual(result.expectedCostLumber)
    expect(result.hasExactSpend).toBe(true)
  })

  test('AT-4: AI trains Priest from completed Arcane Sanctum with resource and supply checks', async ({ page }) => {
    await waitForRuntime(page)

    const result = await page.evaluate(({ keepHp, expectedCost, expectedTrainTime }) => {
      const g = (window as any).__war3Game
      const team = 1

      g.resources.earn(team, 5000, 5000)
      const hall = g.units.find(
        (u: any) => u.team === team && u.type === 'townhall' && u.isBuilding && u.hp > 0 && u.buildProgress >= 1,
      )
      if (!hall) return { error: 'no townhall' }

      // Spawn completed Keep + Arcane Sanctum as fixture for training proof
      hall.type = 'keep'
      hall.maxHp = keepHp
      hall.hp = keepHp
      hall.upgradeQueue = null

      g.spawnBuilding('farm', team, hall.mesh.position.x - 3, hall.mesh.position.z - 5)
      const sanctum = g.spawnBuilding('arcane_sanctum', team, hall.mesh.position.x - 8, hall.mesh.position.z + 3)

      // Read fresh state
      const freshAs = g.units.find((u: any) => u === sanctum && u.hp > 0)
      if (!freshAs) return { error: 'sanctum not found' }

      const queueBefore = freshAs.trainingQueue.length
      const resBefore = g.resources.get(team)
      const spendCalls: any[] = []
      const originalSpend = g.resources.spend.bind(g.resources)
      g.resources.spend = (spendTeam: number, cost: any) => {
        spendCalls.push({ team: spendTeam, gold: cost.gold, lumber: cost.lumber })
        return originalSpend(spendTeam, cost)
      }

      // Tick AI
      g.ai.waveCount = 2
      g.ai.tickTimer = 0
      g.ai.tick()
      g.resources.spend = originalSpend

      // Read fresh state
      const freshAsAfter = g.units.find((u: any) => u === sanctum && u.hp > 0)
      const resAfter = g.resources.get(team)
      const trainEntry = freshAsAfter?.trainingQueue?.[queueBefore] ?? null
      const priestSpend = spendCalls.find(
        (call) => call.team === team && call.gold === expectedCost.gold && call.lumber === expectedCost.lumber,
      )

      // Cleanup
      sanctum.hp = 0
      g.handleDeadUnits()

      return {
        queueBefore,
        queueAfter: freshAsAfter?.trainingQueue?.length ?? -1,
        queuedType: trainEntry?.type ?? '',
        queuedRemaining: trainEntry?.remaining ?? 0,
        spentGold: resBefore.gold - resAfter.gold,
        spentLumber: resBefore.lumber - resAfter.lumber,
        hasExactSpend: !!priestSpend,
        expectedCostGold: expectedCost.gold,
        expectedCostLumber: expectedCost.lumber,
        expectedTrainTime,
      }
    }, { keepHp: KEEP_HP, expectedCost: PRIEST_COST, expectedTrainTime: PRIEST_TRAIN_TIME })

    expect(result.error).toBeUndefined()
    expect(result.queueAfter).toBeGreaterThan(result.queueBefore)
    expect(result.queuedType).toBe('priest')
    expect(result.queuedRemaining).toBe(result.expectedTrainTime)
    expect(result.spentGold).toBeGreaterThanOrEqual(result.expectedCostGold)
    expect(result.spentLumber).toBeGreaterThanOrEqual(result.expectedCostLumber)
    expect(result.hasExactSpend).toBe(true)
  })

  test('AT-5: Priest uses existing V7 caster system — no new heal AI', async ({ page }) => {
    await waitForRuntime(page)

    const result = await page.evaluate(({ expectedAttackDamage }) => {
      const g = (window as any).__war3Game
      if (!g) throw new Error('no game')

      // Spawn priest and verify it has the V7 caster properties
      const priest = g.spawnUnit('priest', 1, 30, 30)
      const fresh = g.units.find((u: any) => u === priest && u.hp > 0)
      if (!fresh) throw new Error('priest not found')

      const data = {
        hasMana: fresh.mana > 0,
        hasMaxMana: fresh.maxMana > 0,
        hasManaRegen: fresh.manaRegen > 0,
        hasHealCooldown: fresh.healCooldownUntil !== undefined,
        attackDamage: fresh.attackDamage,
        expectedAttackDamage,
      }

      priest.hp = 0
      g.handleDeadUnits()

      return data
    }, { expectedAttackDamage: PRIEST_ATTACK })

    expect(result.hasMana).toBe(true)
    expect(result.hasMaxMana).toBe(true)
    expect(result.hasManaRegen).toBe(true)
    expect(result.hasHealCooldown).toBe(true)
    expect(result.attackDamage).toBe(result.expectedAttackDamage)
  })

  test('AT-6: boundary — no Castle, Knight, or new content', () => {
    expect(BUILDINGS.castle).toBeUndefined()
    expect((UNITS as Record<string, unknown>)['knight']).toBeUndefined()
    expect(BUILDINGS.workshop.techPrereq).toBe('keep')
    expect(BUILDINGS.arcane_sanctum.techPrereq).toBe('keep')
    expect(BUILDINGS.keep.trains).toContain('worker')
  })

  test('AT-7: T2 training respects supply when Workshop and Arcane Sanctum are complete', async ({ page }) => {
    await waitForRuntime(page)

    const result = await page.evaluate(({ keepHp }) => {
      const g = (window as any).__war3Game
      const team = 1

      g.resources.earn(team, 5000, 5000)
      const hall = g.units.find(
        (u: any) => u.team === team && u.type === 'townhall' && u.isBuilding && u.hp > 0 && u.buildProgress >= 1,
      )
      if (!hall) return { error: 'no townhall' }

      hall.type = 'keep'
      hall.maxHp = keepHp
      hall.hp = keepHp
      hall.upgradeQueue = null

      const workshop = g.spawnBuilding('workshop', team, hall.mesh.position.x + 8, hall.mesh.position.z + 3)
      const sanctum = g.spawnBuilding('arcane_sanctum', team, hall.mesh.position.x - 8, hall.mesh.position.z + 3)

      for (let i = 0; i < 5; i++) {
        g.spawnUnit('footman', team, hall.mesh.position.x + 2 + i, hall.mesh.position.z + 6)
      }

      const supplyBefore = g.resources.computeSupply(team, g.units)
      const wsQueueBefore = workshop.trainingQueue.length
      const asQueueBefore = sanctum.trainingQueue.length

      g.ai.waveCount = 2
      g.ai.tickTimer = 0
      g.ai.tick()

      const freshWs = g.units.find((u: any) => u === workshop && u.hp > 0)
      const freshAs = g.units.find((u: any) => u === sanctum && u.hp > 0)

      return {
        supplyBefore,
        wsQueueBefore,
        wsQueueAfter: freshWs?.trainingQueue?.length ?? -1,
        asQueueBefore,
        asQueueAfter: freshAs?.trainingQueue?.length ?? -1,
      }
    }, { keepHp: KEEP_HP })

    expect(result.error).toBeUndefined()
    expect(result.supplyBefore.used).toBeGreaterThanOrEqual(result.supplyBefore.total)
    expect(result.wsQueueAfter).toBe(result.wsQueueBefore)
    expect(result.asQueueAfter).toBe(result.asQueueBefore)
  })
})
