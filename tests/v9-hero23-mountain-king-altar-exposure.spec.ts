/**
 * V9 HERO23-EXPOSE1 Mountain King Altar training exposure runtime proof.
 *
 * Proves:
 * 1. Completed Altar shows Mountain King summon button alongside Paladin and Archmage.
 * 2. Clicking summon spends cost and queues one Mountain King.
 * 3. After train time, exactly one Mountain King exists with hero identity and correct mana.
 * 4. Second Mountain King blocked by hero uniqueness.
 * 5. Paladin and Archmage training/uniqueness not broken.
 * 6. No Mountain King ability buttons on the command card.
 *
 * Not abilities, AI, revive, XP, leveling, or visuals.
 */
import { test, expect, type Page } from '@playwright/test'
import { UNITS } from '../src/game/GameData'

const BASE_RUNTIME = 'http://127.0.0.1:4173/?runtimeTest=1'
const MK_COST = UNITS.mountain_king.cost
const MK_TRAIN_TIME = UNITS.mountain_king.trainTime

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

test.describe('V9 HERO23-EXPOSE1 Mountain King Altar training exposure', () => {
  test.setTimeout(120000)

  test('MKEXP-1: completed Altar shows Mountain King summon button', async ({ page }) => {
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
      const mkBtn = buttons.find((b: any) =>
        b.querySelector('.btn-label')?.textContent?.trim() === '山丘之王',
      ) as HTMLButtonElement | undefined
      const paladinBtn = buttons.find((b: any) =>
        b.querySelector('.btn-label')?.textContent?.trim() === '圣骑士',
      ) as HTMLButtonElement | undefined
      const archmageBtn = buttons.find((b: any) =>
        b.querySelector('.btn-label')?.textContent?.trim() === '大法师',
      ) as HTMLButtonElement | undefined

      return {
        found: true,
        hasMKButton: !!mkBtn,
        mkDisabled: mkBtn?.disabled ?? null,
        mkCost: mkBtn?.querySelector('.btn-cost')?.textContent ?? '',
        hasPaladinButton: !!paladinBtn,
        paladinDisabled: paladinBtn?.disabled ?? null,
        hasArchmageButton: !!archmageBtn,
        archmageDisabled: archmageBtn?.disabled ?? null,
      }
    })

    expect(result.found).toBe(true)
    expect(result.hasMKButton).toBe(true)
    expect(result.mkDisabled).toBe(false)
    expect(result.mkCost).toContain('425g')
    expect(result.mkCost).toContain('100w')
    expect(result.hasPaladinButton).toBe(true)
    expect(result.paladinDisabled).toBe(false)
    expect(result.hasArchmageButton).toBe(true)
    expect(result.archmageDisabled).toBe(false)
  })

  test('MKEXP-2: summon spends cost and queues Mountain King', async ({ page }) => {
    await waitForRuntime(page)

    const result = await page.evaluate(({ mkCost }) => {
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

      const mkBtn = Array.from(document.querySelectorAll('#command-card button')).find((b: any) =>
        b.querySelector('.btn-label')?.textContent?.trim() === '山丘之王',
      ) as HTMLButtonElement | undefined
      if (!mkBtn) return { found: true, hasButton: false }

      mkBtn.click()

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
        expectedCost: mkCost,
      }
    }, { mkCost: MK_COST })

    expect(result.found).toBe(true)
    expect(result.hasButton).toBe(true)
    expect(result.goldSpent).toBe(result.expectedCost.gold)
    expect(result.lumberSpent).toBe(result.expectedCost.lumber)
    expect(result.queueLength).toBe(1)
    expect(result.queueItem.type).toBe('mountain_king')
    expect(result.queueItem.remaining).toBeGreaterThan(0)
  })

  test('MKEXP-3: after train time exactly one Mountain King with hero identity and mana', async ({ page }) => {
    await waitForRuntime(page)

    const result = await page.evaluate(({ mkTrainTime }) => {
      const g = (window as any).__war3Game
      g.resources.earn(0, 5000, 5000)
      g.spawnBuilding('altar_of_kings', 0, 15, 15)

      const altar = g.units.find((u: any) => u.team === 0 && u.type === 'altar_of_kings' && u.isBuilding)
      if (!altar) return { found: false }

      g.selectionModel.clear()
      g.selectionModel.setSelection([altar])
      g._lastCmdKey = ''
      g.updateHUD(0.016)

      const mkBtn = Array.from(document.querySelectorAll('#command-card button')).find((b: any) =>
        b.querySelector('.btn-label')?.textContent?.trim() === '山丘之王',
      ) as HTMLButtonElement | undefined
      if (!mkBtn) return { found: true, hasButton: false }
      mkBtn.click()

      // Fast-forward training
      const dt = 0.5
      for (let i = 0; i < Math.ceil(mkTrainTime / dt) + 10; i++) {
        g.gameTime += dt
        g.updateUnits(dt)
      }

      const mks = g.units.filter((u: any) => u.type === 'mountain_king' && !u.isBuilding)
      const mk = mks[0]
      const queueEmpty = altar.trainingQueue.length === 0

      return {
        found: true,
        hasButton: true,
        mkCountAfter: mks.length,
        queueEmpty,
        mk: mk ? {
          type: mk.type,
          hp: mk.hp,
          maxHp: mk.maxHp,
          speed: mk.speed,
          mana: mk.mana,
          maxMana: mk.maxMana,
          isBuilding: mk.isBuilding,
          attackDamage: mk.attackDamage,
          armor: mk.armor,
          heroLevel: mk.heroLevel,
          heroSkillPoints: mk.heroSkillPoints,
        } : null,
      }
    }, { mkTrainTime: MK_TRAIN_TIME })

    expect(result.found).toBe(true)
    expect(result.hasButton).toBe(true)
    expect(result.mkCountAfter).toBe(1)
    expect(result.queueEmpty).toBe(true)
    expect(result.mk).toMatchObject({
      type: 'mountain_king',
      hp: UNITS.mountain_king.hp,
      maxHp: UNITS.mountain_king.hp,
      speed: UNITS.mountain_king.speed,
      mana: UNITS.mountain_king.maxMana,
      maxMana: UNITS.mountain_king.maxMana,
      isBuilding: false,
      attackDamage: UNITS.mountain_king.attackDamage,
      armor: UNITS.mountain_king.armor,
      heroLevel: 1,
      heroSkillPoints: 1,
    })
  })

  test('MKEXP-4: second Mountain King blocked by hero uniqueness', async ({ page }) => {
    await waitForRuntime(page)

    const result = await page.evaluate(({ mkTrainTime }) => {
      const g = (window as any).__war3Game
      g.resources.earn(0, 10000, 10000)
      g.spawnBuilding('altar_of_kings', 0, 15, 15)
      g.spawnBuilding('altar_of_kings', 0, 20, 15)

      const altars = g.units.filter((u: any) => u.team === 0 && u.type === 'altar_of_kings' && u.isBuilding)
      const altar = altars[0]
      const secondAltar = altars[1]
      if (!altar || !secondAltar) return { found: false }

      // Summon first Mountain King
      g.selectionModel.clear()
      g.selectionModel.setSelection([altar])
      g._lastCmdKey = ''
      g.updateHUD(0.016)

      const btn1 = Array.from(document.querySelectorAll('#command-card button')).find((b: any) =>
        b.querySelector('.btn-label')?.textContent?.trim() === '山丘之王',
      ) as HTMLButtonElement | undefined
      if (!btn1) return { found: true, hasButton: false }
      btn1.click()

      const queueCountBeforeDirect = altars.reduce(
        (sum: number, b: any) => sum + b.trainingQueue.filter((item: any) => item.type === 'mountain_king').length,
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
        b.querySelector('.btn-label')?.textContent?.trim() === '山丘之王',
      ) as HTMLButtonElement | undefined

      // Direct method call must not bypass the hero uniqueness guard.
      g.trainUnit(secondAltar, 'mountain_king')

      const queueCountAfterDirect = altars.reduce(
        (sum: number, b: any) => sum + b.trainingQueue.filter((item: any) => item.type === 'mountain_king').length,
        0,
      )
      const goldAfterDirect = g.resources.get(0).gold
      const lumberAfterDirect = g.resources.get(0).lumber

      // Fast-forward
      const dt = 0.5
      for (let i = 0; i < Math.ceil(mkTrainTime / dt) + 10; i++) {
        g.gameTime += dt
        g.updateUnits(dt)
      }

      const mkCountAfterTraining = g.units.filter(
        (u: any) => u.team === 0 && u.type === 'mountain_king' && !u.isBuilding,
      ).length

      // Refresh command card on the second Altar.
      g.selectionModel.clear()
      g.selectionModel.setSelection([secondAltar])
      g._lastCmdKey = ''
      g.updateHUD(0.016)

      const btn2 = Array.from(document.querySelectorAll('#command-card button')).find((b: any) =>
        b.querySelector('.btn-label')?.textContent?.trim() === '山丘之王',
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
        mkCountAfterTraining,
        secondDisabled: btn2?.disabled ?? null,
        secondReason: btn2?.dataset.disabledReason ?? '',
      }
    }, { mkTrainTime: MK_TRAIN_TIME })

    expect(result.found).toBe(true)
    expect(result.hasButton).toBe(true)
    expect(result.queuedDisabled).toBe(true)
    expect(result.queuedReason).toContain('召唤')
    expect(result.queueCountBeforeDirect).toBe(1)
    expect(result.queueCountAfterDirect).toBe(1)
    expect(result.directGoldSpent).toBe(0)
    expect(result.directLumberSpent).toBe(0)
    expect(result.mkCountAfterTraining).toBe(1)
    expect(result.secondDisabled).toBe(true)
    expect(result.secondReason).toContain('山丘之王')
  })

  test('MKEXP-5: Paladin and Archmage training/uniqueness not broken', async ({ page }) => {
    await waitForRuntime(page)

    const result = await page.evaluate(({ mkTrainTime }) => {
      const g = (window as any).__war3Game
      g.resources.earn(0, 10000, 10000)
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
      for (let i = 0; i < Math.ceil(mkTrainTime / dt) + 10; i++) {
        g.gameTime += dt
        g.updateUnits(dt)
      }

      const paladin = g.units.find((u: any) => u.type === 'paladin' && !u.isBuilding && u.team === 0)
      const paladinCount = g.units.filter((u: any) => u.type === 'paladin' && !u.isBuilding && u.team === 0).length

      // Check command card after Paladin exists
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

      const mkBtnAfter = Array.from(document.querySelectorAll('#command-card button')).find((b: any) =>
        b.querySelector('.btn-label')?.textContent?.trim() === '山丘之王',
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
        mkAvailableAfter: !!mkBtnAfter,
        mkDisabledAfter: mkBtnAfter?.disabled ?? null,
      }
    }, { mkTrainTime: MK_TRAIN_TIME })

    expect(result.found).toBe(true)
    expect(result.hasPaladinButton).toBe(true)
    expect(result.paladinExists).toBe(true)
    expect(result.paladinCount).toBe(1)
    expect(result.paladinDisabledAfter).toBe(true)
    expect(result.paladinReasonAfter).toContain('圣骑士')
    expect(result.archmageAvailableAfter).toBe(true)
    expect(result.archmageDisabledAfter).toBe(false)
    expect(result.mkAvailableAfter).toBe(true)
    expect(result.mkDisabledAfter).toBe(false)
  })

  test('MKEXP-6: Mountain King command card exposes accepted ability learning paths', async ({ page }) => {
    await waitForRuntime(page)

    const result = await page.evaluate(({ mkTrainTime }) => {
      const g = (window as any).__war3Game
      g.resources.earn(0, 5000, 5000)
      g.spawnBuilding('altar_of_kings', 0, 15, 15)

      const altar = g.units.find((u: any) => u.team === 0 && u.type === 'altar_of_kings' && u.isBuilding)
      if (!altar) return { found: false }

      // Summon Mountain King
      g.selectionModel.clear()
      g.selectionModel.setSelection([altar])
      g._lastCmdKey = ''
      g.updateHUD(0.016)

      const mkBtn = Array.from(document.querySelectorAll('#command-card button')).find((b: any) =>
        b.querySelector('.btn-label')?.textContent?.trim() === '山丘之王',
      ) as HTMLButtonElement | undefined
      if (!mkBtn) return { found: true, hasButton: false }
      mkBtn.click()

      const dt = 0.5
      for (let i = 0; i < Math.ceil(mkTrainTime / dt) + 10; i++) {
        g.gameTime += dt
        g.updateUnits(dt)
      }

      // Select Mountain King
      const mk = g.units.find((u: any) => u.type === 'mountain_king' && !u.isBuilding && u.team === 0)
      if (!mk) return { found: true, noMK: true }

      g.selectionModel.clear()
      g.selectionModel.setSelection([mk])
      g._lastCmdKey = ''
      g.updateHUD(0.016)

      const buttons = Array.from(document.querySelectorAll('#command-card button'))
      const labels = buttons.map((b: any) => b.querySelector('.btn-label')?.textContent?.trim() ?? '')

      return {
        found: true,
        noMK: false,
        labels,
        hasStormBolt: labels.some((l: string) => l.includes('风暴之锤') || l.includes('Storm Bolt')),
        hasThunderClap: labels.some((l: string) => l.includes('雷霆一击') || l.includes('Thunder Clap')),
        hasBash: labels.some((l: string) => l.includes('猛击') || l.includes('Bash')),
        hasAvatar: labels.some((l: string) => l.includes('化身') || l.includes('Avatar')),
      }
    }, { mkTrainTime: MK_TRAIN_TIME })

    expect(result.found).toBe(true)
    expect(result.noMK).toBeFalsy()
    expect(result.hasStormBolt).toBe(true)
    expect(result.hasThunderClap).toBe(true)
    expect(result.hasBash).toBe(true)
    expect(result.hasAvatar).toBe(true)
  })
})
