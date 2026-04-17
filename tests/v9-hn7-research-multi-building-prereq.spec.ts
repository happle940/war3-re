/**
 * V9 HN7-MODEL8 Research multi-building prerequisite model.
 *
 * Uses the runtime-test-only `window.__war3Researches` hook to inject a
 * temporary research definition without adding product data.
 */
import { test, expect, type Page } from '@playwright/test'
import { RESEARCHES } from '../src/game/GameData'

const BASE = 'http://127.0.0.1:4173/?runtimeTest=1'
const TEST_KEY = '_test_multi_prereq'

async function waitForGame(page: Page) {
  await page.goto(BASE, { waitUntil: 'domcontentloaded' })
  await page.waitForFunction(() => {
    const canvas = document.getElementById('game-canvas')
    const game = (window as any).__war3Game
    const researches = (window as any).__war3Researches
    if (!canvas || !game || !game.renderer || !researches) return false
    if (!Array.isArray(game.units) || game.units.length === 0) return false
    return game.renderer.domElement.width > 0
  }, { timeout: 15000 })

  await page.evaluate((key) => {
    const researches = (window as any).__war3Researches
    delete researches[key]
    researches[key] = {
      key,
      name: '测试多前置',
      cost: { gold: 100, lumber: 100 },
      researchTime: 10,
      description: 'runtime test only',
      requiresBuilding: 'barracks',
      requiresBuildings: ['castle', 'lumber_mill', 'blacksmith'],
    }

    const g = (window as any).__war3Game
    if (g?.ai) {
      if (typeof g.ai.reset === 'function') g.ai.reset()
      g.ai.update = () => {}
    }
  }, TEST_KEY)
}

test.describe('V9 HN7-MODEL8 Research multi-building prerequisite model', () => {
  test.setTimeout(90000)

  test('MBP-1: runtime test hook injects a temporary research without product data', async ({ page }) => {
    expect(RESEARCHES[TEST_KEY]).toBeUndefined()
    expect(RESEARCHES.animal_war_training).toBeUndefined()

    await waitForGame(page)
    const result = await page.evaluate((key) => {
      const researches = (window as any).__war3Researches
      return {
        hasHook: !!researches,
        testRequiresBuilding: researches[key]?.requiresBuilding,
        testRequiresBuildings: researches[key]?.requiresBuildings,
        hasAnimalWarTraining: !!researches.animal_war_training,
      }
    }, TEST_KEY)

    expect(result.hasHook).toBe(true)
    expect(result.testRequiresBuilding).toBe('barracks')
    expect(result.testRequiresBuildings).toEqual(['castle', 'lumber_mill', 'blacksmith'])
    expect(result.hasAnimalWarTraining).toBe(false)
  })

  test('MBP-2: missing multi-building prerequisites are all listed in player text', async ({ page }) => {
    await waitForGame(page)

    const result = await page.evaluate((key) => {
      const g = (window as any).__war3Game
      g.resources.earn(0, 10000, 10000)

      const barracks = g.spawnBuilding('barracks', 0, 40, 40)
      barracks.buildProgress = 1

      const allMissing = g.getResearchAvailability(key, 0)

      const blacksmith = g.spawnBuilding('blacksmith', 0, 44, 40)
      blacksmith.buildProgress = 1
      const onePresent = g.getResearchAvailability(key, 0)

      return {
        allMissingOk: allMissing.ok,
        allMissingReason: allMissing.reason,
        onePresentOk: onePresent.ok,
        onePresentReason: onePresent.reason,
      }
    }, TEST_KEY)

    expect(result.allMissingOk).toBe(false)
    expect(result.allMissingReason).toContain('城堡')
    expect(result.allMissingReason).toContain('伐木场')
    expect(result.allMissingReason).toContain('铁匠铺')

    expect(result.onePresentOk).toBe(false)
    expect(result.onePresentReason).toContain('城堡')
    expect(result.onePresentReason).toContain('伐木场')
    expect(result.onePresentReason).not.toContain('铁匠铺')
  })

  test('MBP-3: all required buildings present makes the temporary research available', async ({ page }) => {
    await waitForGame(page)

    const result = await page.evaluate((key) => {
      const g = (window as any).__war3Game
      g.resources.earn(0, 10000, 10000)

      for (const [type, x] of [
        ['barracks', 40],
        ['blacksmith', 44],
        ['lumber_mill', 48],
        ['castle', 52],
      ] as const) {
        const building = g.spawnBuilding(type, 0, x, 50)
        building.buildProgress = 1
      }

      const avail = g.getResearchAvailability(key, 0)
      return { ok: avail.ok, reason: avail.reason }
    }, TEST_KEY)

    expect(result.ok).toBe(true)
    expect(result.reason).toBe('')
  })

  test('MBP-4: startResearch reuses multi-building availability before spending resources', async ({ page }) => {
    await waitForGame(page)

    const result = await page.evaluate((key) => {
      const g = (window as any).__war3Game
      g.resources.earn(0, 10000, 10000)

      const blockedBarracks = g.spawnBuilding('barracks', 0, 40, 60)
      blockedBarracks.buildProgress = 1
      const beforeBlocked = g.resources.get(0)
      g.startResearch(blockedBarracks, key)
      const afterBlocked = g.resources.get(0)
      const blockedQueueLength = blockedBarracks.researchQueue.length

      for (const [type, x] of [
        ['blacksmith', 44],
        ['lumber_mill', 48],
        ['castle', 52],
      ] as const) {
        const building = g.spawnBuilding(type, 0, x, 60)
        building.buildProgress = 1
      }
      const beforeAllowed = g.resources.get(0)
      g.startResearch(blockedBarracks, key)
      const afterAllowed = g.resources.get(0)

      return {
        blockedQueueLength,
        blockedSpent: beforeBlocked.gold !== afterBlocked.gold || beforeBlocked.lumber !== afterBlocked.lumber,
        allowedQueueKey: blockedBarracks.researchQueue[0]?.key,
        allowedGoldSpent: beforeAllowed.gold - afterAllowed.gold,
        allowedLumberSpent: beforeAllowed.lumber - afterAllowed.lumber,
      }
    }, TEST_KEY)

    expect(result.blockedQueueLength).toBe(0)
    expect(result.blockedSpent).toBe(false)
    expect(result.allowedQueueKey).toBe(TEST_KEY)
    expect(result.allowedGoldSpent).toBe(100)
    expect(result.allowedLumberSpent).toBe(100)
  })

  test('MBP-5: existing single-building research remains unchanged', async ({ page }) => {
    await waitForGame(page)

    const result = await page.evaluate(() => {
      const g = (window as any).__war3Game
      g.resources.earn(0, 10000, 10000)

      const blacksmith = g.spawnBuilding('blacksmith', 0, 60, 70)
      blacksmith.buildProgress = 1

      const noKeep = g.getResearchAvailability('steel_plating', 0)
      blacksmith.completedResearches.push('iron_plating')
      const stillNoKeep = g.getResearchAvailability('steel_plating', 0)

      const keep = g.spawnBuilding('keep', 0, 64, 70)
      keep.buildProgress = 1
      const withKeep = g.getResearchAvailability('steel_plating', 0)

      return {
        noKeepOk: noKeep.ok,
        noKeepReason: noKeep.reason,
        stillNoKeepOk: stillNoKeep.ok,
        stillNoKeepReason: stillNoKeep.reason,
        withKeepOk: withKeep.ok,
      }
    })

    expect(result.noKeepOk).toBe(false)
    expect(result.noKeepReason).toContain('主城')
    expect(result.stillNoKeepOk).toBe(false)
    expect(result.stillNoKeepReason).toContain('主城')
    expect(result.withKeepOk).toBe(true)
  })
})
