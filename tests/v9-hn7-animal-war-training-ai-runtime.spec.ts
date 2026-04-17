/**
 * V9 HN7-AI12 Animal War Training AI implementation runtime proof.
 *
 * Proves AI researches AWT only when the strategy contract conditions are met:
 * - Castle + Barracks + Lumber Mill + Blacksmith + AWT not done + queue empty + Knight present
 * - Budget boundary: reserves worker + footman cost
 * - Skip scenarios: missing buildings, no Knight, AWT already done, insufficient resources
 * - No duplicate research
 */
import { test, expect, type Page } from '@playwright/test'
import { BUILDINGS, RESEARCHES, UNITS } from '../src/game/GameData'

const BASE = 'http://127.0.0.1:4173/?runtimeTest=1'
const AWT_KEY = RESEARCHES.animal_war_training.key
const AWT_COST = RESEARCHES.animal_war_training.cost
const AWT_TIME = RESEARCHES.animal_war_training.researchTime
const CASTLE_HP = BUILDINGS.castle.hp
const WORKER_GOLD = UNITS.worker.cost.gold
const FOOTMAN_GOLD = UNITS.footman.cost.gold

type AwtAiScenario = {
  mainType?: 'keep' | 'castle'
  hasBlacksmith?: boolean
  hasLumberMill?: boolean
  knightOnMap?: boolean
  knightInTraining?: boolean
  queueOccupied?: boolean
  alreadyCompleted?: boolean
  gold?: number
  lumber?: number
  ticks?: number
}

async function waitForGame(page: Page) {
  await page.goto(BASE, { waitUntil: 'domcontentloaded' })
  await page.waitForFunction(() => {
    const canvas = document.getElementById('game-canvas')
    const game = (window as any).__war3Game
    if (!canvas || !game || !game.renderer) return false
    if (!Array.isArray(game.units) || game.units.length === 0) return false
    return game.renderer.domElement.width > 0
  }, { timeout: 15000 })

  await page.evaluate(() => {
    const g = (window as any).__war3Game
    if (g?.ai) {
      if (typeof g.ai.reset === 'function') g.ai.reset()
      g.ai.update = () => {}
    }
  })
  await page.waitForTimeout(300)
}

async function runAwtAiScenario(page: Page, scenario: AwtAiScenario = {}) {
  return page.evaluate(({ scenario, constants }) => {
    const g = (window as any).__war3Game
    const team = 1
    const mainTypes = ['townhall', 'keep', 'castle']

    const setResources = (gold: number, lumber: number) => {
      const before = g.resources.get(team)
      if (before.gold > gold) g.resources.spend(team, { gold: before.gold - gold, lumber: 0 })
      if (before.lumber > lumber) g.resources.spend(team, { gold: 0, lumber: before.lumber - lumber })

      const afterSpend = g.resources.get(team)
      if (afterSpend.gold < gold) g.resources.earn(team, gold - afterSpend.gold, 0)
      if (afterSpend.lumber < lumber) g.resources.earn(team, 0, lumber - afterSpend.lumber)
    }

    const killBuildings = (type: string) => {
      for (const unit of g.units) {
        if (unit.team === team && unit.type === type && unit.isBuilding && unit.hp > 0) {
          unit.hp = 0
        }
      }
      g.handleDeadUnits()
    }

    const ensureBuilding = (type: string, dx: number, dz: number) => {
      let building = g.units.find(
        (u: any) => u.team === team && u.type === type && u.isBuilding && u.hp > 0,
      )
      if (!building) {
        building = g.spawnBuilding(type, team, hall.mesh.position.x + dx, hall.mesh.position.z + dz)
      }
      building.buildProgress = 1
      building.hp = Math.max(building.hp, 1)
      return building
    }

    if (typeof g.ai.reset === 'function') g.ai.reset()
    const mainType = scenario.mainType ?? 'castle'
    const hall = g.units.find(
      (u: any) => u.team === team && mainTypes.includes(u.type) && u.isBuilding && u.hp > 0,
    )
    if (!hall) return { error: 'no AI main hall' }

    hall.type = mainType
    hall.maxHp = mainType === 'castle' ? constants.castleHp : hall.maxHp
    hall.hp = hall.maxHp
    hall.buildProgress = 1
    hall.upgradeQueue = null

    const barracks = ensureBuilding('barracks', -5, 5)
    barracks.trainingQueue = []
    barracks.researchQueue = []
    barracks.completedResearches = []

    if (scenario.hasBlacksmith ?? true) {
      ensureBuilding('blacksmith', -8, 2)
    } else {
      killBuildings('blacksmith')
    }

    if (scenario.hasLumberMill ?? true) {
      ensureBuilding('lumber_mill', -8, -2)
    } else {
      killBuildings('lumber_mill')
    }

    for (let i = 0; i < 4; i++) {
      ensureBuilding('farm', 2 + i * 2, 6)
    }

    for (const knight of g.units.filter((u: any) => u.team === team && u.type === 'knight' && !u.isBuilding)) {
      knight.hp = 0
    }
    g.handleDeadUnits()

    if (scenario.knightOnMap ?? true) {
      g.spawnUnit('knight', team, hall.mesh.position.x + 3, hall.mesh.position.z + 3)
    }
    if (scenario.knightInTraining) {
      barracks.trainingQueue.push({ type: 'knight', remaining: 10 })
    }
    if (scenario.queueOccupied) {
      barracks.researchQueue.push({ key: 'some_other_research', remaining: 10 })
    }
    if (scenario.alreadyCompleted) {
      barracks.completedResearches.push(constants.awtKey)
    }

    setResources(scenario.gold ?? 5000, scenario.lumber ?? 5000)

    const before = g.resources.get(team)
    const spendCalls: { team: number; gold: number; lumber: number }[] = []
    const originalSpend = g.resources.spend.bind(g.resources)
    g.resources.spend = (spendTeam: number, cost: { gold: number; lumber: number }) => {
      spendCalls.push({ team: spendTeam, gold: cost.gold, lumber: cost.lumber })
      return originalSpend(spendTeam, cost)
    }

    g.ai.waveCount = 3
    for (let i = 0; i < (scenario.ticks ?? 1); i++) {
      g.ai.tickTimer = 0
      g.ai.tick()
    }
    g.resources.spend = originalSpend

    const after = g.resources.get(team)
    const awtSpend = spendCalls.filter(
      (call) => call.team === team && call.gold === constants.awtCost.gold && call.lumber === constants.awtCost.lumber,
    )

    return {
      queueLength: barracks.researchQueue.length,
      queueKey: barracks.researchQueue[0]?.key ?? '',
      queueRemaining: barracks.researchQueue[0]?.remaining ?? 0,
      completedResearches: [...barracks.completedResearches],
      trainingQueue: barracks.trainingQueue.map((item: any) => item.type),
      spentGold: before.gold - after.gold,
      spentLumber: before.lumber - after.lumber,
      awtSpendCount: awtSpend.length,
      firstResearchKey: barracks.researchQueue[0]?.key ?? '',
    }
  }, {
    scenario,
    constants: {
      awtKey: AWT_KEY,
      awtCost: AWT_COST,
      awtTime: AWT_TIME,
      castleHp: CASTLE_HP,
    },
  })
}

test.describe('V9 HN7-AI12 Animal War Training AI runtime', () => {
  test.setTimeout(120000)

  test('AWT-AI-1: AI researches AWT when all conditions are met', async ({ page }) => {
    await waitForGame(page)

    const result = await runAwtAiScenario(page)

    expect(result.error).toBeUndefined()
    expect(result.queueLength).toBe(1)
    expect(result.queueKey).toBe(AWT_KEY)
    expect(result.queueRemaining).toBe(AWT_TIME)
    expect(result.awtSpendCount).toBe(1)
    expect(result.completedResearches).not.toContain(AWT_KEY)
  })

  test('AWT-AI-2: AI skips AWT when main base is Keep (not Castle)', async ({ page }) => {
    await waitForGame(page)

    const result = await runAwtAiScenario(page, { mainType: 'keep' })

    expect(result.error).toBeUndefined()
    expect(result.queueLength).toBe(0)
    expect(result.awtSpendCount).toBe(0)
  })

  test('AWT-AI-3: AI skips AWT when no Knight exists', async ({ page }) => {
    await waitForGame(page)

    const result = await runAwtAiScenario(page, { knightOnMap: false })

    expect(result.error).toBeUndefined()
    expect(result.queueLength).toBe(0)
    expect(result.awtSpendCount).toBe(0)
  })

  test('AWT-AI-4: AI skips AWT when research queue is occupied', async ({ page }) => {
    await waitForGame(page)

    const result = await runAwtAiScenario(page, { queueOccupied: true })

    expect(result.error).toBeUndefined()
    expect(result.queueLength).toBe(1)
    expect(result.firstResearchKey).toBe('some_other_research')
    expect(result.awtSpendCount).toBe(0)
  })

  test('AWT-AI-5: AI skips AWT when already completed', async ({ page }) => {
    await waitForGame(page)

    const result = await runAwtAiScenario(page, { alreadyCompleted: true })

    expect(result.error).toBeUndefined()
    expect(result.queueLength).toBe(0)
    expect(result.completedResearches).toContain(AWT_KEY)
    expect(result.awtSpendCount).toBe(0)
  })

  test('AWT-AI-6: AI does not duplicate AWT research across ticks', async ({ page }) => {
    await waitForGame(page)

    const result = await runAwtAiScenario(page, { ticks: 2 })

    expect(result.error).toBeUndefined()
    expect(result.queueLength).toBe(1)
    expect(result.queueKey).toBe(AWT_KEY)
    expect(result.awtSpendCount).toBe(1)
  })

  test('AWT-AI-7: AI considers Knight in training queue as satisfying C7', async ({ page }) => {
    await waitForGame(page)

    const result = await runAwtAiScenario(page, { knightOnMap: false, knightInTraining: true })

    expect(result.error).toBeUndefined()
    expect(result.queueLength).toBe(1)
    expect(result.queueKey).toBe(AWT_KEY)
    expect(result.trainingQueue).toContain('knight')
    expect(result.awtSpendCount).toBe(1)
  })

  test('AWT-AI-8: AI skips AWT when gold is insufficient with production reserve', async ({ page }) => {
    await waitForGame(page)

    const result = await runAwtAiScenario(page, {
      gold: AWT_COST.gold + WORKER_GOLD + FOOTMAN_GOLD - 1,
      lumber: 500,
    })

    expect(result.error).toBeUndefined()
    expect(result.queueLength).toBe(0)
    expect(result.awtSpendCount).toBe(0)
  })
})
