/**
 * V9 HN7-IMPL9 Animal War Training runtime smoke.
 *
 * Proves existing research runtime can consume AWT data without bespoke AWT code.
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

  await page.evaluate(() => {
    const g = (window as any).__war3Game
    if (g?.ai) {
      if (typeof g.ai.reset === 'function') g.ai.reset()
      g.ai.update = () => {}
    }
  })
  await page.waitForTimeout(300)
}

test.describe('V9 HN7 Animal War Training runtime smoke', () => {
  test.setTimeout(120000)

  test('AWTR-1: Barracks command card shows AWT and missing prerequisite reason', async ({ page }) => {
    await waitForGame(page)

    const result = await page.evaluate(() => {
      const g = (window as any).__war3Game
      g.resources.earn(0, 5000, 5000)

      const barracks = g.spawnBuilding('barracks', 0, 40, 40)
      barracks.buildProgress = 1

      g.selectionModel.setSelection([barracks])
      g._lastCmdKey = ''
      g.updateHUD(0.016)

      const buttons = Array.from(document.querySelectorAll('#command-card button')) as HTMLButtonElement[]
      const awtButton = buttons.find(b => b.textContent?.includes('动物作战训练'))
      const availability = g.getResearchAvailability('animal_war_training', 0)

      return {
        found: !!awtButton,
        disabled: awtButton?.disabled ?? false,
        buttonText: awtButton?.textContent ?? '',
        availability,
      }
    })

    expect(result.found).toBe(true)
    expect(result.disabled).toBe(true)
    expect(result.buttonText).toContain('动物作战训练')
    expect(result.availability.ok).toBe(false)
    expect(result.availability.reason).toContain('城堡')
    expect(result.availability.reason).toContain('伐木场')
    expect(result.availability.reason).toContain('铁匠铺')
  })

  test('AWTR-2: all prerequisites allow research and deduct 125/125 into queue', async ({ page }) => {
    await waitForGame(page)

    const result = await page.evaluate(() => {
      const g = (window as any).__war3Game
      g.resources.earn(0, 5000, 5000)

      const barracks = g.spawnBuilding('barracks', 0, 50, 50)
      barracks.buildProgress = 1
      for (const [type, x] of [
        ['castle', 54],
        ['lumber_mill', 58],
        ['blacksmith', 62],
      ] as const) {
        const building = g.spawnBuilding(type, 0, x, 50)
        building.buildProgress = 1
      }

      const availability = g.getResearchAvailability('animal_war_training', 0)
      const before = g.resources.get(0)
      g.startResearch(barracks, 'animal_war_training')
      const after = g.resources.get(0)

      return {
        availability,
        queueLength: barracks.researchQueue.length,
        queueKey: barracks.researchQueue[0]?.key,
        spentGold: before.gold - after.gold,
        spentLumber: before.lumber - after.lumber,
      }
    })

    expect(result.availability.ok).toBe(true)
    expect(result.queueLength).toBe(1)
    expect(result.queueKey).toBe('animal_war_training')
    expect(result.spentGold).toBe(125)
    expect(result.spentLumber).toBe(125)
  })

  test('AWTR-3: completing AWT adds maxHp and hp to existing Knight through queue tick', async ({ page }) => {
    await waitForGame(page)

    const result = await page.evaluate(() => {
      const g = (window as any).__war3Game
      g.resources.earn(0, 5000, 5000)

      const knight = g.spawnUnit('knight', 0, 60, 60)
      const footman = g.spawnUnit('footman', 0, 61, 60)
      const rifleman = g.spawnUnit('rifleman', 0, 62, 60)
      const before = {
        knightHp: knight.hp,
        knightMaxHp: knight.maxHp,
        footmanMaxHp: footman.maxHp,
        riflemanMaxHp: rifleman.maxHp,
      }

      const barracks = g.spawnBuilding('barracks', 0, 60, 56)
      barracks.buildProgress = 1
      for (const [type, x] of [
        ['castle', 64],
        ['lumber_mill', 68],
        ['blacksmith', 72],
      ] as const) {
        const building = g.spawnBuilding(type, 0, x, 56)
        building.buildProgress = 1
      }

      g.startResearch(barracks, 'animal_war_training')
      barracks.researchQueue[0].remaining = 0.001
      g.update(1)

      return {
        completed: barracks.completedResearches.includes('animal_war_training'),
        knightHp: knight.hp,
        knightMaxHp: knight.maxHp,
        footmanMaxHp: footman.maxHp,
        riflemanMaxHp: rifleman.maxHp,
        before,
      }
    })

    expect(result.completed).toBe(true)
    expect(result.knightHp).toBe(result.before.knightHp + 100)
    expect(result.knightMaxHp).toBe(result.before.knightMaxHp + 100)
    expect(result.footmanMaxHp).toBe(result.before.footmanMaxHp)
    expect(result.riflemanMaxHp).toBe(result.before.riflemanMaxHp)
  })

  test('AWTR-4: newly trained Knight inherits AWT, non-Knight units remain unchanged', async ({ page }) => {
    await waitForGame(page)

    const result = await page.evaluate((baseKnightHp: number) => {
      const g = (window as any).__war3Game
      g.resources.earn(0, 10000, 10000)

      const barracks = g.spawnBuilding('barracks', 0, 70, 70)
      barracks.buildProgress = 1
      for (const [type, x] of [
        ['castle', 74],
        ['lumber_mill', 78],
        ['blacksmith', 82],
      ] as const) {
        const building = g.spawnBuilding(type, 0, x, 70)
        building.buildProgress = 1
      }
      for (let i = 0; i < 4; i++) {
        const farm = g.spawnBuilding('farm', 0, 70 + i * 2, 74)
        farm.buildProgress = 1
      }

      const sorceress = g.spawnUnit('sorceress', 0, 68, 70)
      const priest = g.spawnUnit('priest', 0, 69, 70)
      const before = {
        sorceressMaxHp: sorceress.maxHp,
        priestMaxHp: priest.maxHp,
      }

      g.startResearch(barracks, 'animal_war_training')
      barracks.researchQueue[0].remaining = 0.001
      g.update(1)

      g.trainUnit(barracks, 'knight')
      const queued = barracks.trainingQueue.find((item: any) => item.type === 'knight')
      if (queued) queued.remaining = 0.001
      g.update(1)

      const trainedKnight = g.units
        .filter((u: any) => u.type === 'knight' && u.team === 0 && !u.isBuilding)
        .at(-1)

      return {
        trainedKnightMaxHp: trainedKnight?.maxHp ?? 0,
        trainedKnightHp: trainedKnight?.hp ?? 0,
        expectedKnightMaxHp: baseKnightHp + 100,
        sorceressMaxHp: sorceress.maxHp,
        priestMaxHp: priest.maxHp,
        before,
      }
    }, UNITS.knight.hp)

    expect(result.trainedKnightMaxHp).toBe(result.expectedKnightMaxHp)
    expect(result.trainedKnightHp).toBe(result.expectedKnightMaxHp)
    expect(result.sorceressMaxHp).toBe(result.before.sorceressMaxHp)
    expect(result.priestMaxHp).toBe(result.before.priestMaxHp)
  })
})
