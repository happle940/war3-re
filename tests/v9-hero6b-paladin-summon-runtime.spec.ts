/**
 * V9 HERO6B-IMPL2 Paladin hero summon runtime proof.
 *
 * Proves:
 * 1. Completed Altar shows hero-specific Paladin summon button.
 * 2. Clicking summon spends Paladin cost and queues one summon.
 * 3. After train time, exactly one Paladin exists with correct hero identity.
 * 4. A second Paladin cannot be queued while one is alive.
 * 5. After HERO7, Holy Light appears on Paladin but not on Altar.
 * 6. Barracks Footman training still works.
 *
 * Not revive, XP, leveling, skill points, AI, or visuals.
 */
import { test, expect, type Page } from '@playwright/test'
import { UNITS } from '../src/game/GameData'

const BASE_RUNTIME = 'http://127.0.0.1:4173/?runtimeTest=1'
const PALADIN_COST = UNITS.paladin.cost
const PALADIN_TRAIN_TIME = UNITS.paladin.trainTime

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

test.describe('V9 HERO6B Paladin hero summon runtime', () => {
  test.setTimeout(120000)

  test('PSUM-1: completed Altar shows Paladin summon button', async ({ page }) => {
    await waitForRuntime(page)

    const result = await page.evaluate(() => {
      const g = (window as any).__war3Game
      g.resources.earn(0, 5000, 5000)
      g.spawnBuilding('altar_of_kings', 0, 15, 15)

      const altar = g.units.find((u: any) => u.team === 0 && u.type === 'altar_of_kings' && u.isBuilding)
      if (!altar) return { found: false }

      g.selectionModel.clear()
      g.selectionModel.setSelection([altar])
      g._lastCmdKey = ''
      g.updateHUD(0.016)

      const buttons = Array.from(document.querySelectorAll('#command-card button'))
      const paladinBtn = buttons.find((b: any) =>
        b.querySelector('.btn-label')?.textContent?.trim() === '圣骑士',
      ) as HTMLButtonElement | undefined
      const holyLightBtn = buttons.find((b: any) =>
        b.querySelector('.btn-label')?.textContent?.trim() === '圣光术',
      )

      return {
        found: true,
        hasPaladinButton: !!paladinBtn,
        disabled: paladinBtn?.disabled ?? null,
        cost: paladinBtn?.querySelector('.btn-cost')?.textContent ?? '',
        hasHolyLightButton: !!holyLightBtn,
      }
    })

    expect(result.found).toBe(true)
    expect(result.hasPaladinButton).toBe(true)
    expect(result.disabled).toBe(false)
    expect(result.cost).toContain('425g')
    expect(result.cost).toContain('100w')
    expect(result.hasHolyLightButton).toBe(false)
  })

  test('PSUM-2: summon spends cost and queues Paladin', async ({ page }) => {
    await waitForRuntime(page)

    const result = await page.evaluate(({ paladinCost }) => {
      const g = (window as any).__war3Game
      g.resources.earn(0, 5000, 5000)
      g.spawnBuilding('altar_of_kings', 0, 15, 15)

      const altar = g.units.find((u: any) => u.team === 0 && u.type === 'altar_of_kings' && u.isBuilding)
      if (!altar) return { found: false }

      g.selectionModel.clear()
      g.selectionModel.setSelection([altar])
      g._lastCmdKey = ''
      g.updateHUD(0.016)

      const goldBefore = g.resources.get(0).gold
      const lumberBefore = g.resources.get(0).lumber

      const paladinBtn = Array.from(document.querySelectorAll('#command-card button')).find((b: any) =>
        b.querySelector('.btn-label')?.textContent?.trim() === '圣骑士',
      ) as HTMLButtonElement | undefined
      if (!paladinBtn) return { found: true, hasButton: false }

      paladinBtn.click()

      const goldAfter = g.resources.get(0).gold
      const lumberAfter = g.resources.get(0).lumber
      const queue = altar.trainingQueue.map((item: any) => ({ type: item.type, remaining: item.remaining }))

      return {
        found: true,
        hasButton: true,
        goldSpent: goldBefore - goldAfter,
        lumberSpent: lumberBefore - lumberAfter,
        queueLength: queue.length,
        queueItem: queue[0] ?? null,
        expectedCost: paladinCost,
      }
    }, { paladinCost: PALADIN_COST })

    expect(result.found).toBe(true)
    expect(result.hasButton).toBe(true)
    expect(result.goldSpent).toBe(result.expectedCost.gold)
    expect(result.lumberSpent).toBe(result.expectedCost.lumber)
    expect(result.queueLength).toBe(1)
    expect(result.queueItem.type).toBe('paladin')
    expect(result.queueItem.remaining).toBeGreaterThan(0)
  })

  test('PSUM-3: after train time exactly one Paladin with hero identity', async ({ page }) => {
    await waitForRuntime(page)

    const result = await page.evaluate(({ paladinTrainTime }) => {
      const g = (window as any).__war3Game
      g.resources.earn(0, 5000, 5000)
      g.spawnBuilding('altar_of_kings', 0, 15, 15)

      const altar = g.units.find((u: any) => u.team === 0 && u.type === 'altar_of_kings' && u.isBuilding)
      if (!altar) return { found: false }

      const paladinCountBefore = g.units.filter((u: any) => u.type === 'paladin' && !u.isBuilding).length

      g.selectionModel.clear()
      g.selectionModel.setSelection([altar])
      g._lastCmdKey = ''
      g.updateHUD(0.016)

      const paladinBtn = Array.from(document.querySelectorAll('#command-card button')).find((b: any) =>
        b.querySelector('.btn-label')?.textContent?.trim() === '圣骑士',
      ) as HTMLButtonElement | undefined
      if (!paladinBtn) return { found: true, hasButton: false }
      paladinBtn.click()

      // Fast-forward training
      const dt = 0.5
      for (let i = 0; i < Math.ceil(paladinTrainTime / dt) + 10; i++) {
        g.gameTime += dt
        g.updateUnits(dt)
      }

      const paladins = g.units.filter((u: any) => u.type === 'paladin' && !u.isBuilding)
      const paladin = paladins[0]
      const queueEmpty = altar.trainingQueue.length === 0

      return {
        found: true,
        hasButton: true,
        paladinCountBefore,
        paladinCountAfter: paladins.length,
        queueEmpty,
        paladin: paladin ? {
          type: paladin.type,
          hp: paladin.hp,
          maxHp: paladin.maxHp,
          speed: paladin.speed,
          mana: paladin.mana,
          maxMana: paladin.maxMana,
          isBuilding: paladin.isBuilding,
          attackDamage: paladin.attackDamage,
          armor: paladin.armor,
        } : null,
      }
    }, { paladinTrainTime: PALADIN_TRAIN_TIME })

    expect(result.found).toBe(true)
    expect(result.hasButton).toBe(true)
    expect(result.paladinCountAfter).toBe(result.paladinCountBefore + 1)
    expect(result.queueEmpty).toBe(true)
    expect(result.paladin).toMatchObject({
      type: 'paladin',
      hp: UNITS.paladin.hp,
      maxHp: UNITS.paladin.hp,
      speed: UNITS.paladin.speed,
      mana: UNITS.paladin.maxMana,
      maxMana: UNITS.paladin.maxMana,
      isBuilding: false,
      attackDamage: UNITS.paladin.attackDamage,
      armor: UNITS.paladin.armor,
    })
  })

  test('PSUM-4: second Paladin summon blocked while queued or alive across Altars', async ({ page }) => {
    await waitForRuntime(page)

    const result = await page.evaluate(({ paladinTrainTime }) => {
      const g = (window as any).__war3Game
      g.resources.earn(0, 10000, 10000)
      g.spawnBuilding('altar_of_kings', 0, 15, 15)
      g.spawnBuilding('altar_of_kings', 0, 20, 15)

      const altars = g.units.filter((u: any) => u.team === 0 && u.type === 'altar_of_kings' && u.isBuilding)
      const altar = altars[0]
      const secondAltar = altars[1]
      if (!altar || !secondAltar) return { found: false }

      // Summon first Paladin
      g.selectionModel.clear()
      g.selectionModel.setSelection([altar])
      g._lastCmdKey = ''
      g.updateHUD(0.016)

      const btn1 = Array.from(document.querySelectorAll('#command-card button')).find((b: any) =>
        b.querySelector('.btn-label')?.textContent?.trim() === '圣骑士',
      ) as HTMLButtonElement | undefined
      if (!btn1) return { found: true, hasButton: false }
      btn1.click()

      const queueCountBeforeDirect = altars.reduce(
        (sum: number, b: any) => sum + b.trainingQueue.filter((item: any) => item.type === 'paladin').length,
        0,
      )
      const goldBeforeDirect = g.resources.get(0).gold
      const lumberBeforeDirect = g.resources.get(0).lumber

      g.selectionModel.clear()
      g.selectionModel.setSelection([secondAltar])
      g._lastCmdKey = ''
      g.updateHUD(0.016)

      const queuedBtn = Array.from(document.querySelectorAll('#command-card button')).find((b: any) =>
        b.querySelector('.btn-label')?.textContent?.trim() === '圣骑士',
      ) as HTMLButtonElement | undefined

      // Direct method call must not bypass the hero uniqueness guard.
      g.trainUnit(secondAltar, 'paladin')

      const queueCountAfterDirect = altars.reduce(
        (sum: number, b: any) => sum + b.trainingQueue.filter((item: any) => item.type === 'paladin').length,
        0,
      )
      const goldAfterDirect = g.resources.get(0).gold
      const lumberAfterDirect = g.resources.get(0).lumber

      // Fast-forward
      const dt = 0.5
      for (let i = 0; i < Math.ceil(paladinTrainTime / dt) + 10; i++) {
        g.gameTime += dt
        g.updateUnits(dt)
      }

      const paladinCountAfterTraining = g.units.filter(
        (u: any) => u.team === 0 && u.type === 'paladin' && !u.isBuilding,
      ).length

      // Refresh command card on the second Altar.
      g.selectionModel.clear()
      g.selectionModel.setSelection([secondAltar])
      g._lastCmdKey = ''
      g.updateHUD(0.016)

      const btn2 = Array.from(document.querySelectorAll('#command-card button')).find((b: any) =>
        b.querySelector('.btn-label')?.textContent?.trim() === '圣骑士',
      ) as HTMLButtonElement | undefined

      return {
        found: true,
        hasButton: !!btn2,
        queuedDisabled: queuedBtn?.disabled ?? null,
        queuedReason: queuedBtn?.dataset.disabledReason ?? '',
        queueCountBeforeDirect,
        queueCountAfterDirect,
        directGoldSpent: goldBeforeDirect - goldAfterDirect,
        directLumberSpent: lumberBeforeDirect - lumberAfterDirect,
        paladinCountAfterTraining,
        secondDisabled: btn2?.disabled ?? null,
        secondReason: btn2?.dataset.disabledReason ?? '',
        secondTitle: btn2?.title ?? '',
      }
    }, { paladinTrainTime: PALADIN_TRAIN_TIME })

    expect(result.found).toBe(true)
    expect(result.hasButton).toBe(true)
    expect(result.queuedDisabled).toBe(true)
    expect(result.queuedReason).toContain('召唤')
    expect(result.queueCountBeforeDirect).toBe(1)
    expect(result.queueCountAfterDirect).toBe(1)
    expect(result.directGoldSpent).toBe(0)
    expect(result.directLumberSpent).toBe(0)
    expect(result.paladinCountAfterTraining).toBe(1)
    expect(result.secondDisabled).toBe(true)
    expect(result.secondReason).toContain('圣骑士')
  })

  test('PSUM-5: Holy Light appears only on Paladin command card after HERO7', async ({ page }) => {
    await waitForRuntime(page)

    const result = await page.evaluate(({ paladinTrainTime }) => {
      const g = (window as any).__war3Game
      g.resources.earn(0, 10000, 10000)
      g.spawnBuilding('altar_of_kings', 0, 15, 15)

      const altar = g.units.find((u: any) => u.team === 0 && u.type === 'altar_of_kings' && u.isBuilding)
      if (!altar) return { found: false }

      // Summon Paladin
      g.selectionModel.clear()
      g.selectionModel.setSelection([altar])
      g._lastCmdKey = ''
      g.updateHUD(0.016)

      const btn = Array.from(document.querySelectorAll('#command-card button')).find((b: any) =>
        b.querySelector('.btn-label')?.textContent?.trim() === '圣骑士',
      ) as HTMLButtonElement | undefined
      if (btn) btn.click()

      const dt = 0.5
      for (let i = 0; i < Math.ceil(paladinTrainTime / dt) + 10; i++) {
        g.gameTime += dt
        g.updateUnits(dt)
      }

      // Select Paladin
      const paladin = g.units.find((u: any) => u.type === 'paladin' && !u.isBuilding && u.team === 0)
      if (!paladin) return { found: true, noPaladin: true }

      g.selectionModel.clear()
      g.selectionModel.setSelection([paladin])
      g._lastCmdKey = ''
      g.updateHUD(0.016)

      const paladinButtons = Array.from(document.querySelectorAll('#command-card button'))
      const holyLightBtn = paladinButtons.find((b: any) =>
        b.querySelector('.btn-label')?.textContent?.trim() === '圣光术',
      )

      // Also check Altar
      g.selectionModel.clear()
      g.selectionModel.setSelection([altar])
      g._lastCmdKey = ''
      g.updateHUD(0.016)

      const altarButtons = Array.from(document.querySelectorAll('#command-card button'))
      const altarHolyLight = altarButtons.find((b: any) =>
        b.querySelector('.btn-label')?.textContent?.trim() === '圣光术',
      )

      return {
        found: true,
        noPaladin: false,
        paladinHasHolyLight: !!holyLightBtn,
        altarHasHolyLight: !!altarHolyLight,
      }
    }, { paladinTrainTime: PALADIN_TRAIN_TIME })

    expect(result.found).toBe(true)
    expect(result.noPaladin).toBeFalsy()
    expect(result.paladinHasHolyLight).toBe(true)
    expect(result.altarHasHolyLight).toBe(false)
  })

  test('PSUM-6: Barracks Footman training still works after hero path', async ({ page }) => {
    await waitForRuntime(page)

    const result = await page.evaluate(() => {
      const g = (window as any).__war3Game
      const barracks = g.units.find((u: any) => u.team === 0 && u.type === 'barracks' && u.isBuilding)
      if (!barracks) return { found: false }

      g.resources.earn(0, 5000, 5000)
      g.selectionModel.clear()
      g.selectionModel.setSelection([barracks])
      g._lastCmdKey = ''
      g.updateHUD(0.016)

      const footmanBtn = Array.from(document.querySelectorAll('#command-card button')).find((b: any) =>
        b.querySelector('.btn-label')?.textContent?.trim() === '步兵',
      ) as HTMLButtonElement | undefined
      if (!footmanBtn) return { found: true, hasFootmanButton: false }

      const footmanCountBefore = g.units.filter((u: any) => u.team === 0 && u.type === 'footman' && !u.isBuilding).length
      footmanBtn.click()

      const dt = 0.5
      for (let i = 0; i < 60; i++) {
        g.gameTime += dt
        g.updateUnits(dt)
      }

      const footmanCountAfter = g.units.filter((u: any) => u.team === 0 && u.type === 'footman' && !u.isBuilding).length

      return {
        found: true,
        hasFootmanButton: true,
        disabledBeforeClick: footmanBtn.disabled,
        footmanCountBefore,
        footmanCountAfter,
      }
    })

    expect(result.found).toBe(true)
    expect(result.hasFootmanButton).toBe(true)
    expect(result.disabledBeforeClick).toBe(false)
    expect(result.footmanCountAfter).toBe(result.footmanCountBefore + 1)
  })
})
