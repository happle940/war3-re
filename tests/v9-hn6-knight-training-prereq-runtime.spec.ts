/**
 * V9 HN6-IMPL5 Knight training prerequisite runtime proof.
 *
 * Proves:
 * 1. Barracks exposes Knight training but disables it with concrete missing-prereq reasons.
 * 2. Knight requires Castle + Blacksmith + Lumber Mill before the button becomes usable.
 * 3. Enabled Knight training uses the normal queue, spends resources, consumes supply,
 *    waits trainTime, and produces a real Knight unit.
 *
 * Not AI Knight, Animal War Training, heroes, air, items, full T3, or assets.
 */
import { test, expect, type Page } from '@playwright/test'
import { UNITS } from '../src/game/GameData'

const BASE_RUNTIME = 'http://127.0.0.1:4173/?runtimeTest=1'
const KNIGHT_COST = UNITS.knight.cost
const KNIGHT_TRAIN_TIME = UNITS.knight.trainTime

async function waitForRuntime(page: Page) {
  await page.goto(BASE_RUNTIME, { waitUntil: 'domcontentloaded' })
  await page.waitForFunction(() => {
    const game = (window as any).__war3Game
    const canvas = document.getElementById('game-canvas')
    return !!game && !!canvas && Array.isArray(game.units) && game.units.length > 0
  }, { timeout: 15000 })

  try {
    await page.waitForFunction(() => {
      const status = document.getElementById('map-status')?.textContent ?? ''
      return !status.includes('正在加载')
    }, { timeout: 15000 })
  } catch {
    // Procedural fallback is valid.
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

test.describe('V9 HN6 Knight training prerequisite gate', () => {
  test.setTimeout(120000)

  test('KTP-1: Barracks shows Knight disabled with the missing prerequisite reason', async ({ page }) => {
    await waitForRuntime(page)

    const result = await page.evaluate(() => {
      const g = (window as any).__war3Game
      const barracks = g.units.find((u: any) => u.team === 0 && u.type === 'barracks' && u.isBuilding)
      if (!barracks) return { found: false }

      g.resources.earn(0, 3000, 3000)

      function knightButtonSnapshot() {
        g.selectionModel.clear()
        g.selectionModel.setSelection([barracks])
        g._lastCmdKey = ''
        g.updateHUD(0.016)

        const buttons = Array.from(document.querySelectorAll('#command-card button'))
        const btn = buttons.find((b: any) => b.querySelector('.btn-label')?.textContent?.trim() === '骑士') as HTMLButtonElement | undefined
        return {
          hasKnightButton: !!btn,
          disabled: btn?.disabled ?? null,
          reason: btn?.dataset.disabledReason ?? '',
          title: btn?.title ?? '',
          cost: btn?.querySelector('.btn-cost')?.textContent ?? '',
        }
      }

      const noPrereqs = knightButtonSnapshot()
      g.spawnBuilding('castle', 0, 20, 12)
      g.spawnBuilding('blacksmith', 0, 24, 12)
      const missingLumberMill = knightButtonSnapshot()

      return { found: true, noPrereqs, missingLumberMill }
    })

    expect(result.found).toBe(true)
    expect(result.noPrereqs.hasKnightButton).toBe(true)
    expect(result.noPrereqs.disabled).toBe(true)
    expect(result.noPrereqs.reason).toContain('城堡')
    expect(result.noPrereqs.cost).toContain('245g')
    expect(result.missingLumberMill.hasKnightButton).toBe(true)
    expect(result.missingLumberMill.disabled).toBe(true)
    expect(result.missingLumberMill.reason).toContain('伐木场')
  })

  test('KTP-2: all prerequisites enable normal queued Knight training', async ({ page }) => {
    await waitForRuntime(page)

    const result = await page.evaluate(({ knightCost, knightTrainTime }) => {
      const g = (window as any).__war3Game
      const barracks = g.units.find((u: any) => u.team === 0 && u.type === 'barracks' && u.isBuilding)
      if (!barracks) return { found: false }

      g.spawnBuilding('castle', 0, 20, 12)
      g.spawnBuilding('blacksmith', 0, 24, 12)
      g.spawnBuilding('lumber_mill', 0, 28, 12)
      g.resources.earn(0, 3000, 3000)

      g.selectionModel.clear()
      g.selectionModel.setSelection([barracks])
      g._lastCmdKey = ''
      g.updateHUD(0.016)

      const buttons = Array.from(document.querySelectorAll('#command-card button'))
      const knightBtn = buttons.find((b: any) => b.querySelector('.btn-label')?.textContent?.trim() === '骑士') as HTMLButtonElement | undefined
      const goldBefore = g.resources.get(0).gold
      const lumberBefore = g.resources.get(0).lumber
      const supplyBefore = g.resources.computeSupply(0, g.units)
      const knightCountBefore = g.units.filter((u: any) => u.team === 0 && u.type === 'knight' && !u.isBuilding).length

      if (!knightBtn) return { found: true, hasButton: false }
      knightBtn.click()

      const queueAfterClick = barracks.trainingQueue.map((item: any) => ({ type: item.type, remaining: item.remaining }))
      const knightCountAfterClick = g.units.filter((u: any) => u.team === 0 && u.type === 'knight' && !u.isBuilding).length
      const goldAfterClick = g.resources.get(0).gold
      const lumberAfterClick = g.resources.get(0).lumber

      const dt = 0.5
      for (let i = 0; i < Math.ceil(knightTrainTime / dt) + 5; i++) {
        g.gameTime += dt
        g.updateUnits(dt)
      }

      const knights = g.units.filter((u: any) => u.team === 0 && u.type === 'knight' && !u.isBuilding)
      const newest = knights[knights.length - 1]
      const supplyAfter = g.resources.computeSupply(0, g.units)

      return {
        found: true,
        hasButton: true,
        disabledBeforeClick: knightBtn.disabled,
        reasonBeforeClick: knightBtn.dataset.disabledReason ?? '',
        queueAfterClick,
        goldSpentOnClick: goldBefore - goldAfterClick,
        lumberSpentOnClick: lumberBefore - lumberAfterClick,
        knightCountBefore,
        knightCountAfterClick,
        knightCountAfterTraining: knights.length,
        queueEmptyAfterTraining: barracks.trainingQueue.length === 0,
        supplyUsedBefore: supplyBefore.used,
        supplyUsedAfter: supplyAfter.used,
        newestKnight: newest ? {
          hp: newest.hp,
          maxHp: newest.maxHp,
          speed: newest.speed,
          attackDamage: newest.attackDamage,
          armor: newest.armor,
        } : null,
        expectedCost: knightCost,
      }
    }, { knightCost: KNIGHT_COST, knightTrainTime: KNIGHT_TRAIN_TIME })

    expect(result.found).toBe(true)
    expect(result.hasButton).toBe(true)
    expect(result.disabledBeforeClick).toBe(false)
    expect(result.reasonBeforeClick).toBe('')
    expect(result.queueAfterClick).toHaveLength(1)
    expect(result.queueAfterClick[0].type).toBe('knight')
    expect(result.goldSpentOnClick).toBe(result.expectedCost.gold)
    expect(result.lumberSpentOnClick).toBe(result.expectedCost.lumber)
    expect(result.knightCountAfterClick).toBe(result.knightCountBefore)
    expect(result.knightCountAfterTraining).toBe(result.knightCountBefore + 1)
    expect(result.queueEmptyAfterTraining).toBe(true)
    expect(result.supplyUsedAfter - result.supplyUsedBefore).toBe(UNITS.knight.supply)
    expect(result.newestKnight).toMatchObject({
      hp: UNITS.knight.hp,
      maxHp: UNITS.knight.hp,
      speed: UNITS.knight.speed,
      attackDamage: UNITS.knight.attackDamage,
      armor: UNITS.knight.armor,
    })
  })
})
