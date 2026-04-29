/**
 * V9 HERO17-EXPOSE1 Archmage Altar training exposure runtime proof.
 *
 * Proves:
 * 1. Completed Altar shows Archmage summon button alongside Paladin.
 * 2. Clicking summon spends Archmage cost and queues one summon.
 * 3. After train time, exactly one Archmage exists with hero identity and correct mana.
 * 4. Second Archmage blocked by hero uniqueness (button disabled + direct call).
 * 5. Paladin training/uniqueness is not broken by Archmage exposure.
 * 6. Archmage command card exposes the currently accepted Water Elemental and Brilliance Aura paths.
 *
 * Not abilities, AI, revive, XP, leveling, or visuals.
 */
import { test, expect, type Page } from '@playwright/test'
import { UNITS } from '../src/game/GameData'

const BASE_RUNTIME = 'http://127.0.0.1:4173/?runtimeTest=1'
const ARCHMAGE_COST = UNITS.archmage.cost
const ARCHMAGE_TRAIN_TIME = UNITS.archmage.trainTime

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

test.describe('V9 HERO17-EXPOSE1 Archmage Altar training exposure', () => {
  test.setTimeout(120000)

  test('AEXP-1: completed Altar shows Archmage summon button', async ({ page }) => {
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
      const archmageBtn = buttons.find((b: any) =>
        b.querySelector('.btn-label')?.textContent?.trim() === '大法师',
      ) as HTMLButtonElement | undefined
      const paladinBtn = buttons.find((b: any) =>
        b.querySelector('.btn-label')?.textContent?.trim() === '圣骑士',
      ) as HTMLButtonElement | undefined

      return {
        found: true,
        hasArchmageButton: !!archmageBtn,
        archmageDisabled: archmageBtn?.disabled ?? null,
        archmageCost: archmageBtn?.querySelector('.btn-cost')?.textContent ?? '',
        hasPaladinButton: !!paladinBtn,
        paladinDisabled: paladinBtn?.disabled ?? null,
      }
    })

    expect(result.found).toBe(true)
    expect(result.hasArchmageButton).toBe(true)
    expect(result.archmageDisabled).toBe(false)
    expect(result.archmageCost).toContain('425g')
    expect(result.archmageCost).toContain('100w')
    expect(result.hasPaladinButton).toBe(true)
    expect(result.paladinDisabled).toBe(false)
  })

  test('AEXP-2: summon spends cost and queues Archmage', async ({ page }) => {
    await waitForRuntime(page)

    const result = await page.evaluate(({ archmageCost }) => {
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

      const archmageBtn = Array.from(document.querySelectorAll('#command-card button')).find((b: any) =>
        b.querySelector('.btn-label')?.textContent?.trim() === '大法师',
      ) as HTMLButtonElement | undefined
      if (!archmageBtn) return { found: true, hasButton: false }

      archmageBtn.click()

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
        expectedCost: archmageCost,
      }
    }, { archmageCost: ARCHMAGE_COST })

    expect(result.found).toBe(true)
    expect(result.hasButton).toBe(true)
    expect(result.goldSpent).toBe(result.expectedCost.gold)
    expect(result.lumberSpent).toBe(result.expectedCost.lumber)
    expect(result.queueLength).toBe(1)
    expect(result.queueItem.type).toBe('archmage')
    expect(result.queueItem.remaining).toBeGreaterThan(0)
  })

  test('AEXP-3: after train time exactly one Archmage with hero identity and mana', async ({ page }) => {
    await waitForRuntime(page)

    const result = await page.evaluate(({ archmageTrainTime }) => {
      const g = (window as any).__war3Game
      g.resources.earn(0, 5000, 5000)
      g.spawnBuilding('altar_of_kings', 0, 15, 15)

      const altar = g.units.find((u: any) => u.team === 0 && u.type === 'altar_of_kings' && u.isBuilding)
      if (!altar) return { found: false }

      g.selectionModel.clear()
      g.selectionModel.setSelection([altar])
      g._lastCmdKey = ''
      g.updateHUD(0.016)

      const archmageBtn = Array.from(document.querySelectorAll('#command-card button')).find((b: any) =>
        b.querySelector('.btn-label')?.textContent?.trim() === '大法师',
      ) as HTMLButtonElement | undefined
      if (!archmageBtn) return { found: true, hasButton: false }
      archmageBtn.click()

      // Fast-forward training
      const dt = 0.5
      for (let i = 0; i < Math.ceil(archmageTrainTime / dt) + 10; i++) {
        g.gameTime += dt
        g.updateUnits(dt)
      }

      const archmages = g.units.filter((u: any) => u.type === 'archmage' && !u.isBuilding)
      const archmage = archmages[0]
      const queueEmpty = altar.trainingQueue.length === 0

      return {
        found: true,
        hasButton: true,
        archmageCountAfter: archmages.length,
        queueEmpty,
        archmage: archmage ? {
          type: archmage.type,
          hp: archmage.hp,
          maxHp: archmage.maxHp,
          speed: archmage.speed,
          mana: archmage.mana,
          maxMana: archmage.maxMana,
          isBuilding: archmage.isBuilding,
          attackDamage: archmage.attackDamage,
          armor: archmage.armor,
        } : null,
      }
    }, { archmageTrainTime: ARCHMAGE_TRAIN_TIME })

    expect(result.found).toBe(true)
    expect(result.hasButton).toBe(true)
    expect(result.archmageCountAfter).toBe(1)
    expect(result.queueEmpty).toBe(true)
    expect(result.archmage).toMatchObject({
      type: 'archmage',
      hp: UNITS.archmage.hp,
      maxHp: UNITS.archmage.hp,
      speed: UNITS.archmage.speed,
      mana: UNITS.archmage.maxMana,
      maxMana: UNITS.archmage.maxMana,
      isBuilding: false,
      attackDamage: UNITS.archmage.attackDamage,
      armor: UNITS.archmage.armor,
    })
  })

  test('AEXP-4: second Archmage blocked by hero uniqueness', async ({ page }) => {
    await waitForRuntime(page)

    const result = await page.evaluate(({ archmageTrainTime }) => {
      const g = (window as any).__war3Game
      g.resources.earn(0, 10000, 10000)
      g.spawnBuilding('altar_of_kings', 0, 15, 15)
      g.spawnBuilding('altar_of_kings', 0, 20, 15)

      const altars = g.units.filter((u: any) => u.team === 0 && u.type === 'altar_of_kings' && u.isBuilding)
      const altar = altars[0]
      const secondAltar = altars[1]
      if (!altar || !secondAltar) return { found: false }

      // Summon first Archmage
      g.selectionModel.clear()
      g.selectionModel.setSelection([altar])
      g._lastCmdKey = ''
      g.updateHUD(0.016)

      const btn1 = Array.from(document.querySelectorAll('#command-card button')).find((b: any) =>
        b.querySelector('.btn-label')?.textContent?.trim() === '大法师',
      ) as HTMLButtonElement | undefined
      if (!btn1) return { found: true, hasButton: false }
      btn1.click()

      const queueCountBeforeDirect = altars.reduce(
        (sum: number, b: any) => sum + b.trainingQueue.filter((item: any) => item.type === 'archmage').length,
        0,
      )
      const goldBeforeDirect = g.resources.get(0).gold
      const lumberBeforeDirect = g.resources.get(0).lumber

      // Try from second Altar
      g.selectionModel.clear()
      g.selectionModel.setSelection([secondAltar])
      g._lastCmdKey = ''
      g.updateHUD(0.016)

      const queuedBtn = Array.from(document.querySelectorAll('#command-card button')).find((b: any) =>
        b.querySelector('.btn-label')?.textContent?.trim() === '大法师',
      ) as HTMLButtonElement | undefined

      // Direct method call must not bypass the hero uniqueness guard.
      g.trainUnit(secondAltar, 'archmage')

      const queueCountAfterDirect = altars.reduce(
        (sum: number, b: any) => sum + b.trainingQueue.filter((item: any) => item.type === 'archmage').length,
        0,
      )
      const goldAfterDirect = g.resources.get(0).gold
      const lumberAfterDirect = g.resources.get(0).lumber

      // Fast-forward
      const dt = 0.5
      for (let i = 0; i < Math.ceil(archmageTrainTime / dt) + 10; i++) {
        g.gameTime += dt
        g.updateUnits(dt)
      }

      const archmageCountAfterTraining = g.units.filter(
        (u: any) => u.team === 0 && u.type === 'archmage' && !u.isBuilding,
      ).length

      // Refresh command card on the second Altar.
      g.selectionModel.clear()
      g.selectionModel.setSelection([secondAltar])
      g._lastCmdKey = ''
      g.updateHUD(0.016)

      const btn2 = Array.from(document.querySelectorAll('#command-card button')).find((b: any) =>
        b.querySelector('.btn-label')?.textContent?.trim() === '大法师',
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
        archmageCountAfterTraining,
        secondDisabled: btn2?.disabled ?? null,
        secondReason: btn2?.dataset.disabledReason ?? '',
      }
    }, { archmageTrainTime: ARCHMAGE_TRAIN_TIME })

    expect(result.found).toBe(true)
    expect(result.hasButton).toBe(true)
    expect(result.queuedDisabled).toBe(true)
    expect(result.queuedReason).toContain('召唤')
    expect(result.queueCountBeforeDirect).toBe(1)
    expect(result.queueCountAfterDirect).toBe(1)
    expect(result.directGoldSpent).toBe(0)
    expect(result.directLumberSpent).toBe(0)
    expect(result.archmageCountAfterTraining).toBe(1)
    expect(result.secondDisabled).toBe(true)
    expect(result.secondReason).toContain('大法师')
  })

  test('AEXP-5: Paladin training and uniqueness not broken by Archmage exposure', async ({ page }) => {
    await waitForRuntime(page)

    const result = await page.evaluate(({ archmageTrainTime }) => {
      const g = (window as any).__war3Game
      g.resources.earn(0, 10000, 10000)
      // Build extra farms to ensure enough supply for both heroes (5 supply each)
      g.spawnBuilding('farm', 0, 17, 17)
      g.spawnBuilding('farm', 0, 19, 17)
      g.spawnBuilding('altar_of_kings', 0, 15, 15)

      const altar = g.units.find((u: any) => u.team === 0 && u.type === 'altar_of_kings' && u.isBuilding)
      if (!altar) return { found: false }

      // Summon Paladin
      g.selectionModel.clear()
      g.selectionModel.setSelection([altar])
      g._lastCmdKey = ''
      g.updateHUD(0.016)

      const paladinBtn = Array.from(document.querySelectorAll('#command-card button')).find((b: any) =>
        b.querySelector('.btn-label')?.textContent?.trim() === '圣骑士',
      ) as HTMLButtonElement | undefined
      if (!paladinBtn) return { found: true, hasPaladinButton: false }
      paladinBtn.click()

      const dt = 0.5
      for (let i = 0; i < Math.ceil(archmageTrainTime / dt) + 10; i++) {
        g.gameTime += dt
        g.updateUnits(dt)
      }

      const paladin = g.units.find((u: any) => u.type === 'paladin' && !u.isBuilding && u.team === 0)
      const paladinCount = g.units.filter((u: any) => u.type === 'paladin' && !u.isBuilding && u.team === 0).length

      // Check that second Paladin button is now disabled
      g.selectionModel.clear()
      g.selectionModel.setSelection([altar])
      g._lastCmdKey = ''
      g.updateHUD(0.016)

      const paladinBtnAfter = Array.from(document.querySelectorAll('#command-card button')).find((b: any) =>
        b.querySelector('.btn-label')?.textContent?.trim() === '圣骑士',
      ) as HTMLButtonElement | undefined

      const archmageBtnAfter = Array.from(document.querySelectorAll('#command-card button')).find((b: any) =>
        b.querySelector('.btn-label')?.textContent?.trim() === '大法师',
      ) as HTMLButtonElement | undefined

      return {
        found: true,
        hasPaladinButton: true,
        paladinExists: !!paladin,
        paladinCount,
        paladinDisabledAfter: paladinBtnAfter?.disabled ?? null,
        paladinReasonAfter: paladinBtnAfter?.dataset.disabledReason ?? '',
        archmageAvailableAfter: !!archmageBtnAfter,
        archmageDisabledAfter: archmageBtnAfter?.disabled ?? null,
        archmageDisabledReason: archmageBtnAfter?.dataset.disabledReason ?? '',
      }
    }, { archmageTrainTime: ARCHMAGE_TRAIN_TIME })

    expect(result.found).toBe(true)
    expect(result.hasPaladinButton).toBe(true)
    expect(result.paladinExists).toBe(true)
    expect(result.paladinCount).toBe(1)
    expect(result.paladinDisabledAfter).toBe(true)
    expect(result.paladinReasonAfter).toContain('圣骑士')
    expect(result.archmageAvailableAfter).toBe(true)
    expect(result.archmageDisabledAfter).toBe(false)
  })

  test('AEXP-6: Archmage command card exposes the accepted ability paths', async ({ page }) => {
    await waitForRuntime(page)

    const result = await page.evaluate(({ archmageTrainTime }) => {
      const g = (window as any).__war3Game
      g.resources.earn(0, 5000, 5000)
      g.spawnBuilding('altar_of_kings', 0, 15, 15)

      const altar = g.units.find((u: any) => u.team === 0 && u.type === 'altar_of_kings' && u.isBuilding)
      if (!altar) return { found: false }

      // Summon Archmage
      g.selectionModel.clear()
      g.selectionModel.setSelection([altar])
      g._lastCmdKey = ''
      g.updateHUD(0.016)

      const archmageBtn = Array.from(document.querySelectorAll('#command-card button')).find((b: any) =>
        b.querySelector('.btn-label')?.textContent?.trim() === '大法师',
      ) as HTMLButtonElement | undefined
      if (!archmageBtn) return { found: true, hasButton: false }
      archmageBtn.click()

      const dt = 0.5
      for (let i = 0; i < Math.ceil(archmageTrainTime / dt) + 10; i++) {
        g.gameTime += dt
        g.updateUnits(dt)
      }

      // Select Archmage
      const archmage = g.units.find((u: any) => u.type === 'archmage' && !u.isBuilding && u.team === 0)
      if (!archmage) return { found: true, noArchmage: true }

      g.selectionModel.clear()
      g.selectionModel.setSelection([archmage])
      g._lastCmdKey = ''
      g.updateHUD(0.016)

      const buttons = Array.from(document.querySelectorAll('#command-card button'))
      const labels = buttons.map((b: any) => b.querySelector('.btn-label')?.textContent?.trim() ?? '')

      return {
        found: true,
        noArchmage: false,
        labels,
        hasWaterElemental: labels.some((l: string) => l.includes('水元素') || l.includes('Water Elemental')),
        hasBrillianceAura: labels.some((l: string) => l.includes('辉煌光环') || l.includes('Brilliance Aura')),
        hasBlizzard: labels.some((l: string) => l.includes('暴风雪') || l.includes('Blizzard')),
        hasMassTeleport: labels.some((l: string) => l.includes('群体传送') || l.includes('Mass Teleport')),
      }
    }, { archmageTrainTime: ARCHMAGE_TRAIN_TIME })

    expect(result.found).toBe(true)
    expect(result.noArchmage).toBeFalsy()
    expect(result.hasWaterElemental).toBe(true)
    expect(result.hasBrillianceAura).toBe(true)
    expect(result.hasBlizzard).toBe(true)
    expect(result.hasMassTeleport).toBe(true)
  })
})
