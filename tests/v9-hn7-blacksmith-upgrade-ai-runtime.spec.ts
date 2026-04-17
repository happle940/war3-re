/**
 * V9 HN7-AI15 Blacksmith Upgrade AI implementation runtime proof.
 *
 * Proves AI researches Blacksmith upgrades per the strategy contract:
 * - Positive: melee L1 with footman, ranged L1 with Long Rifles + rifleman
 * - Negative: waveCount 0 skip, queue occupied skip, already completed skip, budget skip
 * - Tier gates: Keep for L2, Castle for L3
 * - No duplicate, no skip-level, no Leather Armor
 * - Data-driven: prereq and tier gates from RESEARCHES def, not hardcoded
 */
import { test, expect, type Page } from '@playwright/test'
import { BUILDINGS, RESEARCHES, UNITS } from '../src/game/GameData'

const BASE = 'http://127.0.0.1:4173/?runtimeTest=1'

const IFS = RESEARCHES.iron_forged_swords
const SS = RESEARCHES.steel_forged_swords
const MS = RESEARCHES.mithril_forged_swords
const BG = RESEARCHES.black_gunpowder
const RG = RESEARCHES.refined_gunpowder
const IG = RESEARCHES.imbued_gunpowder
const IP = RESEARCHES.iron_plating
const SP = RESEARCHES.steel_plating
const MP = RESEARCHES.mithril_plating
const LR = RESEARCHES.long_rifles

const W_COST = UNITS.worker.cost
const F_COST = UNITS.footman.cost

type BsScenario = {
  mainType?: 'townhall' | 'keep' | 'castle'
  waveCount?: number
  gold?: number
  lumber?: number
  hasBlacksmith?: boolean
  hasFootman?: boolean
  hasKnight?: boolean
  hasRifleman?: boolean
  hasMortar?: boolean
  queueOccupied?: boolean
  alreadyCompleted?: string[]
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

// Most scenarios start after Long Rifles has completed because Task191 keeps
// the existing Long Rifles path ahead of the three Blacksmith upgrade chains.
const LONG_RIFLES_DONE = [LR.key]
const LEVEL_1_DONE = [LR.key, IFS.key, IP.key, BG.key]
const LEVEL_2_DONE = [LR.key, IFS.key, IP.key, BG.key, SS.key, SP.key, RG.key]

async function runBsScenario(page: Page, scenario: BsScenario = {}) {
  return page.evaluate(({ scenario, constants }) => {
    const g = (window as any).__war3Game
    const team = 1

    const setResources = (gold: number, lumber: number) => {
      const before = g.resources.get(team)
      if (before.gold > gold) g.resources.spend(team, { gold: before.gold - gold, lumber: 0 })
      if (before.lumber > lumber) g.resources.spend(team, { gold: 0, lumber: before.lumber - lumber })
      const afterSpend = g.resources.get(team)
      if (afterSpend.gold < gold) g.resources.earn(team, gold - afterSpend.gold, 0)
      if (afterSpend.lumber < lumber) g.resources.earn(team, 0, lumber - afterSpend.lumber)
    }

    const killUnits = (type: string) => {
      for (const u of g.units) {
        if (u.team === team && u.type === type && u.isBuilding && u.hp > 0) {
          u.hp = 0
        }
      }
      g.handleDeadUnits()
    }

    const ensureBuilding = (type: string, dx: number, dz: number) => {
      let b = g.units.find(
        (u: any) => u.team === team && u.type === type && u.isBuilding && u.hp > 0,
      )
      if (!b) {
        b = g.spawnBuilding(type, team, hall.mesh.position.x + dx, hall.mesh.position.z + dz)
      }
      b.buildProgress = 1
      b.hp = Math.max(b.hp, 1)
      return b
    }

    const mainTypes = ['townhall', 'keep', 'castle']
    if (typeof g.ai.reset === 'function') g.ai.reset()

    const hall = g.units.find(
      (u: any) => u.team === team && mainTypes.includes(u.type) && u.isBuilding && u.hp > 0,
    )
    if (!hall) return { error: 'no AI main hall' }

    const mainType = scenario.mainType ?? 'keep'
    hall.type = mainType
    hall.buildProgress = 1
    hall.upgradeQueue = null
    if (mainType === 'castle') {
      hall.hp = constants.castleHp
      hall.maxHp = constants.castleHp
    }

    const barracks = ensureBuilding('barracks', -5, 5)
    barracks.trainingQueue = []
    barracks.researchQueue = []
    barracks.completedResearches = []

    let blacksmith: any = null
    if (scenario.hasBlacksmith ?? true) {
      blacksmith = ensureBuilding('blacksmith', -8, 2)
      blacksmith.researchQueue = []
      blacksmith.completedResearches = scenario.alreadyCompleted
        ? [...scenario.alreadyCompleted]
        : [constants.lrKey] // default: Long Rifles done so section 2e doesn't fire
      if (scenario.queueOccupied) {
        blacksmith.researchQueue.push({ key: 'some_other_research', remaining: 10 })
      }
    } else {
      killUnits('blacksmith')
    }

    ensureBuilding('lumber_mill', -8, -2)
    for (let i = 0; i < 4; i++) ensureBuilding('farm', 2 + i * 2, 6)

    // Kill all military units of this team
    for (const u of g.units) {
      if (u.team === team && !u.isBuilding && u.type !== 'worker' && u.hp > 0) {
        u.hp = 0
      }
    }
    g.handleDeadUnits()

    if (scenario.hasFootman ?? true) {
      g.spawnUnit('footman', team, hall.mesh.position.x + 3, hall.mesh.position.z + 3)
    }
    if (scenario.hasRifleman) {
      g.spawnUnit('rifleman', team, hall.mesh.position.x + 5, hall.mesh.position.z + 3)
    }
    if (scenario.hasMortar) {
      g.spawnUnit('mortar_team', team, hall.mesh.position.x + 7, hall.mesh.position.z + 3)
    }
    if (scenario.hasKnight) {
      g.spawnUnit('knight', team, hall.mesh.position.x + 9, hall.mesh.position.z + 3)
    }

    setResources(scenario.gold ?? 5000, scenario.lumber ?? 5000)

    const before = g.resources.get(team)
    const spendCalls: { gold: number; lumber: number }[] = []
    const originalSpend = g.resources.spend.bind(g.resources)
    g.resources.spend = (spendTeam: number, cost: { gold: number; lumber: number }) => {
      spendCalls.push({ gold: cost.gold, lumber: cost.lumber })
      return originalSpend(spendTeam, cost)
    }

    g.ai.waveCount = scenario.waveCount ?? 1
    for (let i = 0; i < (scenario.ticks ?? 1); i++) {
      g.ai.tickTimer = 0
      g.ai.tick()
    }
    g.resources.spend = originalSpend

    const after = g.resources.get(team)
    const researchQueue = blacksmith ? blacksmith.researchQueue.map((r: any) => r.key) : []
    const completedResearches = blacksmith ? [...blacksmith.completedResearches] : []

    return {
      queueLength: blacksmith ? blacksmith.researchQueue.length : 0,
      researchQueue,
      completedResearches,
      spentGold: before.gold - after.gold,
      spendCalls,
      error: undefined as string | undefined,
    }
  }, {
    scenario,
    constants: {
      castleHp: BUILDINGS.castle.hp,
      lrKey: LR.key,
    },
  })
}

test.describe('V9 HN7-AI15 Blacksmith Upgrade AI runtime', () => {
  test.setTimeout(120000)

  test('BS-RT-1: AI researches iron_forged_swords (melee L1) with footman present', async ({ page }) => {
    await waitForGame(page)
    const result = await runBsScenario(page, {
      mainType: 'keep',
      hasFootman: true,
      alreadyCompleted: LONG_RIFLES_DONE,
    })
    expect(result.error).toBeUndefined()
    expect(result.researchQueue).toContain(IFS.key)
    expect(result.queueLength).toBe(1)
  })

  test('BS-RT-2: AI skips all upgrades when waveCount is 0', async ({ page }) => {
    await waitForGame(page)
    const result = await runBsScenario(page, { waveCount: 0, hasFootman: true, alreadyCompleted: LONG_RIFLES_DONE })
    expect(result.error).toBeUndefined()
    expect(result.queueLength).toBe(0)
  })

  test('BS-RT-3: AI skips when Blacksmith research queue is occupied', async ({ page }) => {
    await waitForGame(page)
    const result = await runBsScenario(page, {
      queueOccupied: true,
      hasFootman: true,
      alreadyCompleted: LONG_RIFLES_DONE,
    })
    expect(result.error).toBeUndefined()
    expect(result.queueLength).toBe(1)
    expect(result.researchQueue[0]).toBe('some_other_research')
  })

  test('BS-RT-4: AI skips already completed upgrade', async ({ page }) => {
    await waitForGame(page)
    const result = await runBsScenario(page, {
      alreadyCompleted: [LR.key, IFS.key],
      hasFootman: true,
    })
    expect(result.error).toBeUndefined()
    // Should research iron_plating (next priority) instead
    expect(result.researchQueue).toContain(IP.key)
    expect(result.completedResearches).toContain(IFS.key)
  })

  test('BS-RT-5: AI skips melee upgrades when no melee units exist', async ({ page }) => {
    await waitForGame(page)
    const result = await runBsScenario(page, {
      hasFootman: false,
      hasRifleman: true,
      alreadyCompleted: LONG_RIFLES_DONE,
    })
    expect(result.error).toBeUndefined()
    // No melee units → skip melee+plating, but has ranged → research black_gunpowder
    expect(result.researchQueue).toContain(BG.key)
    expect(result.researchQueue).not.toContain(IFS.key)
  })

  test('BS-RT-6a: AI keeps Long Rifles priority before black_gunpowder', async ({ page }) => {
    await waitForGame(page)
    const resultNoLR = await runBsScenario(page, {
      hasFootman: false,
      hasRifleman: true,
      alreadyCompleted: [], // no long_rifles → section 2e will research it
    })
    expect(resultNoLR.error).toBeUndefined()
    expect(resultNoLR.researchQueue).toContain(LR.key)
    expect(resultNoLR.researchQueue).not.toContain(BG.key)
  })

  test('BS-RT-6b: AI researches black_gunpowder when Long Rifles is done and ranged units exist', async ({ page }) => {
    await waitForGame(page)
    const resultWithLR = await runBsScenario(page, {
      hasFootman: false,
      hasRifleman: true,
      alreadyCompleted: [LR.key],
    })
    expect(resultWithLR.error).toBeUndefined()
    expect(resultWithLR.researchQueue).toContain(BG.key)
  })

  test('BS-RT-7: AI skips upgrade when budget insufficient with reserve', async ({ page }) => {
    await waitForGame(page)
    const result = await runBsScenario(page, {
      hasFootman: true,
      gold: IFS.cost.gold + W_COST.gold + F_COST.gold - 1,
      lumber: 500,
      alreadyCompleted: LONG_RIFLES_DONE,
    })
    expect(result.error).toBeUndefined()
    expect(result.queueLength).toBe(0)
  })

  test('BS-RT-8: AI researches L2 melee after Keep upgrade and L1 done', async ({ page }) => {
    await waitForGame(page)
    const result = await runBsScenario(page, {
      mainType: 'keep',
      hasFootman: true,
      alreadyCompleted: [...LEVEL_1_DONE],
    })
    expect(result.error).toBeUndefined()
    // All L1 done → should research steel_forged_swords (L2 melee, priority 4)
    expect(result.researchQueue).toContain(SS.key)
  })

  test('BS-RT-9: AI researches L3 melee after Castle and L2 done', async ({ page }) => {
    await waitForGame(page)
    const result = await runBsScenario(page, {
      mainType: 'castle',
      hasFootman: true,
      alreadyCompleted: [...LEVEL_2_DONE],
    })
    expect(result.error).toBeUndefined()
    // All L1+L2 done → should research mithril_forged_swords (L3 melee, priority 7)
    expect(result.researchQueue).toContain(MS.key)
  })

  test('BS-RT-10: AI does not skip levels (no L2 without L1)', async ({ page }) => {
    await waitForGame(page)
    const result = await runBsScenario(page, {
      mainType: 'keep',
      hasFootman: true,
      // L1 not done → should not research L2
      alreadyCompleted: LONG_RIFLES_DONE,
    })
    expect(result.error).toBeUndefined()
    expect(result.researchQueue).not.toContain(SS.key)
    expect(result.researchQueue).not.toContain(SP.key)
    expect(result.researchQueue).not.toContain(RG.key)
  })

  test('BS-RT-11: AI does not duplicate research across ticks', async ({ page }) => {
    await waitForGame(page)
    const result = await runBsScenario(page, {
      hasFootman: true,
      ticks: 2,
      alreadyCompleted: LONG_RIFLES_DONE,
    })
    expect(result.error).toBeUndefined()
    // Should only have one research queued even after 2 ticks
    expect(result.queueLength).toBe(1)
    expect(result.researchQueue).toContain(IFS.key)
  })

  test('BS-RT-12: AI skips when no Blacksmith exists', async ({ page }) => {
    await waitForGame(page)
    const result = await runBsScenario(page, { hasBlacksmith: false, hasFootman: true })
    expect(result.error).toBeUndefined()
    expect(result.queueLength).toBe(0)
  })

  test('BS-RT-13: Knight counts as melee unit for melee/plating chains', async ({ page }) => {
    await waitForGame(page)
    const result = await runBsScenario(page, {
      hasFootman: false,
      hasKnight: true,
      alreadyCompleted: LONG_RIFLES_DONE,
    })
    expect(result.error).toBeUndefined()
    expect(result.researchQueue).toContain(IFS.key)
  })

  test('BS-RT-14: AI researches plating L1 when melee units but melee L1 already done', async ({ page }) => {
    await waitForGame(page)
    const result = await runBsScenario(page, {
      hasFootman: true,
      alreadyCompleted: [LR.key, IFS.key],
    })
    expect(result.error).toBeUndefined()
    expect(result.researchQueue).toContain(IP.key)
  })

  test('BS-RT-15: No Leather Armor key ever appears in research queue', async ({ page }) => {
    await waitForGame(page)
    const result = await runBsScenario(page, {
      mainType: 'castle',
      hasFootman: true,
      hasRifleman: true,
      alreadyCompleted: [
        ...LEVEL_2_DONE,
        MS.key, MP.key, IG.key,
      ],
    })
    expect(result.error).toBeUndefined()
    // All upgrades done → queue should be empty, no leather_armor
    expect(result.queueLength).toBe(0)
    expect(result.researchQueue).not.toContain('leather_armor')
  })

  test('BS-RT-16: data-driven prereq: steel_forged_swords requires iron_forged_swords via def', async ({ page }) => {
    await waitForGame(page)
    // Prove the prereq comes from RESEARCHES def, not hardcoded
    expect(SS.prerequisiteResearch).toBe(IFS.key)
    expect(SS.requiresBuilding).toBe('keep')

    // And that the AI respects it: without iron_forged_swords, no steel_forged_swords
    const result = await runBsScenario(page, {
      mainType: 'keep',
      hasFootman: true,
      alreadyCompleted: [LR.key, IP.key, BG.key], // IFS NOT done
    })
    expect(result.error).toBeUndefined()
    expect(result.researchQueue).toContain(IFS.key) // picks L1 melee, not L2
    expect(result.researchQueue).not.toContain(SS.key)
  })

  test('BS-RT-17: data-driven tier: imbued_gunpowder requiresBuilding castle via def', async ({ page }) => {
    await waitForGame(page)
    expect(IG.requiresBuilding).toBe('castle')
    expect(IG.prerequisiteResearch).toBe(RG.key)

    // With Keep (not Castle), L3 should not fire even when L2 done
    const result = await runBsScenario(page, {
      mainType: 'keep',
      hasRifleman: true,
      hasFootman: true,
      alreadyCompleted: [...LEVEL_2_DONE],
    })
    expect(result.error).toBeUndefined()
    // Should pick mithril_forged_swords or mithril_plating (melee L3), not ranged L3
    expect(result.researchQueue).not.toContain(IG.key)
  })
})
