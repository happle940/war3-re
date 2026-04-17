/**
 * V9 HN2-IMPL7 AI Town Hall -> Keep upgrade readiness.
 *
 * These focused runtime checks keep the scope narrow:
 * AI may use the existing Town Hall -> Keep upgrade path, but this task does
 * not lock T2 buildings behind Keep and does not add Castle, Knights, assets,
 * or a full AI T2 build strategy.
 */
import { test, expect, type Page } from '@playwright/test'

import { BUILDINGS } from '../src/game/GameData'

const BASE_RUNTIME = 'http://127.0.0.1:4173/?runtimeTest=1'

type FixtureOptions = {
  gold: number
  lumber: number
  waveCount?: number
  includeBarracks?: boolean
  includeBlacksmith?: boolean
  isolateSpend?: boolean
  workerCount?: number
}

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
    // Procedural fallback is enough for this focused proof.
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

async function prepareAiKeepFixture(page: Page, options: FixtureOptions) {
  return page.evaluate((opts) => {
    const g = (window as any).__war3Game
    const team = 1
    if (!g?.ai) return { ok: false, reason: 'missing ai' }

    g.ai.reset()

    const hall = g.units.find(
      (u: any) => u.team === team && u.type === 'townhall' && u.isBuilding && u.hp > 0 && u.buildProgress >= 1,
    )
    if (!hall) return { ok: false, reason: 'missing ai townhall' }
    hall.upgradeQueue = null

    const setResources = (gold: number, lumber: number) => {
      const current = g.resources.get(team)
      g.resources.earn(team, gold - current.gold, lumber - current.lumber)
    }

    const completeBuilding = (type: string, offsetX: number, offsetZ: number) => {
      let building = g.units.find(
        (u: any) => u.team === team && u.type === type && u.isBuilding && u.hp > 0,
      )
      if (!building) {
        building = g.spawnBuilding(type, team, hall.mesh.position.x + offsetX, hall.mesh.position.z + offsetZ)
      }
      building.buildProgress = 1
      building.hp = Math.max(building.hp, building.maxHp ?? 1, 1)
      return building
    }

    const ensureWorkers = (count: number) => {
      let workers = g.units.filter((u: any) => u.team === team && u.type === 'worker' && !u.isBuilding && u.hp > 0)
      while (workers.length < count) {
        const worker = g.spawnUnit(
          'worker',
          team,
          hall.mesh.position.x + 2 + workers.length * 0.5,
          hall.mesh.position.z - 3,
        )
        worker.hp = Math.max(worker.hp, worker.maxHp ?? 1, 1)
        workers = g.units.filter((u: any) => u.team === team && u.type === 'worker' && !u.isBuilding && u.hp > 0)
      }
    }

    for (let index = 0; index < 4; index += 1) {
      completeBuilding('farm', -8 + index * 2, -7)
    }

    const barracks = opts.includeBarracks === false ? null : completeBuilding('barracks', 6, 6)
    const blacksmith = opts.includeBlacksmith === false ? null : completeBuilding('blacksmith', -6, 6)

    if (opts.isolateSpend) {
      ensureWorkers(opts.workerCount ?? 10)
      completeBuilding('lumber_mill', -10, 1)
      completeBuilding('workshop', 9, 1)
      completeBuilding('tower', -10, -4)
      completeBuilding('tower', -7, -4)
      if (blacksmith) {
        blacksmith.completedResearches = Array.from(new Set([...(blacksmith.completedResearches ?? []), 'long_rifles']))
        blacksmith.researchQueue = []
      }
      if (barracks) {
        barracks.trainingQueue = [
          { type: 'footman', remaining: 10 },
          { type: 'footman', remaining: 10 },
        ]
      }
      const workshop = g.units.find((u: any) => u.team === team && u.type === 'workshop' && u.isBuilding && u.hp > 0)
      if (workshop) {
        workshop.trainingQueue = [
          { type: 'mortar_team', remaining: 10 },
          { type: 'mortar_team', remaining: 10 },
        ]
      }
    }

    setResources(opts.gold, opts.lumber)
    g.ai.waveCount = opts.waveCount ?? 2
    g.ai.attackWaveSent = false
    g.ai.tickTimer = 0
    g.ai.tickInterval = 1

    return {
      ok: true,
      townhallId: hall.id,
      resources: g.resources.get(team),
      hasBarracks: !!barracks,
      hasBlacksmith: !!blacksmith,
    }
  }, options)
}

test.describe('V9 AI Keep Upgrade Readiness', () => {
  test.setTimeout(120000)

  test('KU-1: controlled AI conditions start Town Hall -> Keep upgrade', async ({ page }) => {
    await waitForRuntime(page)
    const keepCost = BUILDINGS.keep.cost
    const prepared = await prepareAiKeepFixture(page, {
      gold: keepCost.gold + 500,
      lumber: keepCost.lumber + 200,
      isolateSpend: true,
    })
    expect(prepared.ok).toBe(true)

    const result = await page.evaluate(() => {
      const g = (window as any).__war3Game
      g.ai.tick()
      const hall = g.units.find((u: any) => u.team === 1 && u.type === 'townhall' && u.isBuilding && u.hp > 0)
      return {
        hasUpgradeQueue: !!hall?.upgradeQueue,
        targetType: hall?.upgradeQueue?.targetType ?? null,
      }
    })

    expect(result.hasUpgradeQueue).toBe(true)
    expect(result.targetType).toBe('keep')
  })

  test('KU-2: AI pays the exact real BUILDINGS.keep.cost when starting the upgrade', async ({ page }) => {
    await waitForRuntime(page)
    const keepCost = BUILDINGS.keep.cost
    const startGold = keepCost.gold + 500
    const startLumber = keepCost.lumber + 200
    const prepared = await prepareAiKeepFixture(page, {
      gold: startGold,
      lumber: startLumber,
      isolateSpend: true,
      workerCount: 10,
    })
    expect(prepared.ok).toBe(true)

    const result = await page.evaluate((expectedKeepCost) => {
      const g = (window as any).__war3Game
      const before = g.resources.get(1)
      const spendCalls: { team: number, gold: number, lumber: number }[] = []
      const originalSpend = g.resources.spend.bind(g.resources)
      g.resources.spend = (team: number, cost: { gold: number, lumber: number }) => {
        spendCalls.push({ team, gold: cost.gold, lumber: cost.lumber })
        return originalSpend(team, cost)
      }
      g.ai.tick()
      g.resources.spend = originalSpend
      const after = g.resources.get(1)
      const hall = g.units.find((u: any) => u.team === 1 && u.type === 'townhall' && u.isBuilding && u.hp > 0)
      return {
        upgradeStarted: hall?.upgradeQueue?.targetType === 'keep',
        keepSpend: spendCalls.find(
          (call) => call.team === 1 && call.gold === expectedKeepCost.gold && call.lumber === expectedKeepCost.lumber,
        ) ?? null,
        spendCalls,
        goldDelta: before.gold - after.gold,
        lumberDelta: before.lumber - after.lumber,
      }
    }, keepCost)

    expect(result.upgradeStarted).toBe(true)
    expect(result.keepSpend).toEqual({ team: 1, gold: keepCost.gold, lumber: keepCost.lumber })
    expect(result.goldDelta).toBeGreaterThanOrEqual(keepCost.gold)
    expect(result.lumberDelta).toBeGreaterThanOrEqual(keepCost.lumber)
  })

  test('KU-3: time progression converts the same AI main base into Keep', async ({ page }) => {
    await waitForRuntime(page)
    const keepCost = BUILDINGS.keep.cost
    const prepared = await prepareAiKeepFixture(page, {
      gold: keepCost.gold + 500,
      lumber: keepCost.lumber + 200,
      isolateSpend: true,
    })
    expect(prepared.ok).toBe(true)

    const result = await page.evaluate((upgradeTime) => {
      const g = (window as any).__war3Game
      const hall = g.units.find((u: any) => u.team === 1 && u.type === 'townhall' && u.isBuilding && u.hp > 0)
      g.ai.tick()
      const started = hall?.upgradeQueue?.targetType === 'keep'
      let remaining = upgradeTime + 2
      while (remaining > 0) {
        const step = Math.min(0.05, remaining)
        g.update(step)
        remaining -= step
      }
      return {
        started,
        finalType: hall?.type ?? null,
        upgradeQueue: hall?.upgradeQueue ?? null,
      }
    }, BUILDINGS.keep.buildTime)

    expect(result.started).toBe(true)
    expect(result.finalType).toBe('keep')
    expect(result.upgradeQueue).toBeNull()
  })

  test('KU-4: after upgrade, AI still recognizes Keep as main base for worker/rally logic', async ({ page }) => {
    await waitForRuntime(page)

    const result = await page.evaluate(() => {
      const g = (window as any).__war3Game
      const team = 1
      g.ai.reset()

      const hall = g.units.find(
        (u: any) => u.team === team && u.type === 'townhall' && u.isBuilding && u.hp > 0 && u.buildProgress >= 1,
      )
      if (!hall) return { ok: false, reason: 'missing townhall' }

      hall.type = 'keep'
      hall.maxHp = Math.max(hall.maxHp ?? 0, 2000)
      hall.hp = hall.maxHp
      hall.upgradeQueue = null
      hall.trainingQueue = []
      hall.rallyPoint = null
      hall.rallyTarget = null

      const current = g.resources.get(team)
      g.resources.earn(team, 700 - current.gold, 400 - current.lumber)
      for (let index = 0; index < 4; index += 1) {
        const farm = g.spawnBuilding('farm', team, hall.mesh.position.x - 8 + index * 2, hall.mesh.position.z - 7)
        farm.buildProgress = 1
        farm.hp = Math.max(farm.hp, farm.maxHp ?? 1, 1)
      }

      g.ai.waveCount = 2
      g.ai.tickTimer = 0
      g.ai.tick()

      const keep = g.units.find((u: any) => u.team === team && u.type === 'keep' && u.isBuilding && u.hp > 0)
      return {
        ok: true,
        keepFound: !!keep,
        hasWorkerInQueue: (keep?.trainingQueue ?? []).some((item: any) => item.type === 'worker'),
        rallyTargetType: keep?.rallyTarget?.type ?? null,
        hasRallyPoint: !!keep?.rallyPoint,
      }
    })

    expect(result.ok).toBe(true)
    expect(result.keepFound).toBe(true)
    expect(result.hasWorkerInQueue || result.rallyTargetType === 'goldmine' || result.hasRallyPoint).toBe(true)
  })

  test('KU-5: AI does not open Keep upgrade before the pressure gate or without prerequisites', async ({ page }) => {
    await waitForRuntime(page)
    const keepCost = BUILDINGS.keep.cost

    const prepared = await prepareAiKeepFixture(page, {
      gold: keepCost.gold + 500,
      lumber: keepCost.lumber + 200,
      waveCount: 0,
      isolateSpend: true,
    })
    expect(prepared.ok).toBe(true)

    const result = await page.evaluate(() => {
      const g = (window as any).__war3Game
      const hall = () => g.units.find((u: any) => u.team === 1 && u.type === 'townhall' && u.isBuilding && u.hp > 0)

      g.ai.waveCount = 0
      g.ai.tick()
      const noWave0 = !hall()?.upgradeQueue

      g.ai.waveCount = 1
      g.ai.tick()
      const noWave1 = !hall()?.upgradeQueue

      for (const blacksmith of g.units.filter((u: any) => u.team === 1 && u.type === 'blacksmith')) {
        blacksmith.hp = 0
      }
      g.ai.waveCount = 2
      g.ai.tick()
      const noBlacksmith = !hall()?.upgradeQueue

      return { noWave0, noWave1, noBlacksmith }
    })

    expect(result.noWave0).toBe(true)
    expect(result.noWave1).toBe(true)
    expect(result.noBlacksmith).toBe(true)
  })

  test('KU-6: production data reflects accepted Keep/T2 migration boundaries', () => {
    expect(BUILDINGS.workshop.techPrereq).toBe('keep')
    expect(BUILDINGS.arcane_sanctum.techPrereq).toBe('keep')
    expect('castle' in BUILDINGS).toBe(false)
    expect(BUILDINGS.keep.upgradeTo).toBeUndefined()
    expect(BUILDINGS.townhall.upgradeTo).toBe('keep')
    expect(BUILDINGS.keep.techTier).toBe(2)
    expect(BUILDINGS.keep.trains).toContain('worker')
  })
})
