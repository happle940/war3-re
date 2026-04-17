/**
 * V9 HERO9-IMPL2 Altar revive runtime proof.
 *
 * Proves:
 * 1. No dead Paladin means no revive entry and normal summon remains available.
 * 2. Live Paladin blocks summon and does not open revive.
 * 3. Dead Paladin opens revive with HERO_REVIVE_RULES level-1 cost/time.
 * 4. Starting revive spends once, queues once, and duplicate clicks do not double-spend.
 * 5. Insufficient resources reject revive before spending or queueing.
 * 6. Queued revive is visible as "正在复活".
 * 7. Completion restores the same Paladin record, not a new unit.
 *
 * Not XP, leveling, skill points, items, other heroes, AI, Tavern, or visuals.
 */
import { test, expect, type Page } from '@playwright/test'
import { HERO_REVIVE_RULES, UNITS, UnitState } from '../src/game/GameData'

const BASE_RUNTIME = 'http://127.0.0.1:4173/?runtimeTest=1'
const PALADIN_COST = UNITS.paladin.cost
const PALADIN_REVIVE_GOLD = Math.min(
  Math.floor(PALADIN_COST.gold * HERO_REVIVE_RULES.goldBaseFactor),
  HERO_REVIVE_RULES.goldHardCap,
)
const PALADIN_REVIVE_LUMBER = 0
const PALADIN_REVIVE_TIME = Math.round(Math.min(
  UNITS.paladin.trainTime * HERO_REVIVE_RULES.timeFactor,
  UNITS.paladin.trainTime * HERO_REVIVE_RULES.timeMaxFactor,
  HERO_REVIVE_RULES.timeHardCap,
))

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
    ;(window as any).__getCommandButton = (label: string) =>
      Array.from(document.querySelectorAll('#command-card button')).find((b: any) =>
        b.querySelector('.btn-label')?.textContent?.trim() === label,
      ) as HTMLButtonElement | undefined
    if (g?.ai) {
      if (typeof g.ai.reset === 'function') g.ai.reset()
      g.ai.update = () => {}
    }
  })
  await page.waitForTimeout(300)
}

async function createDeadPaladinAtAltar(page: Page) {
  return page.evaluate(() => {
    const g = (window as any).__war3Game
    g.resources.earn(0, 5000, 5000)
    const altar = g.spawnBuilding('altar_of_kings', 0, 15, 15)
    const paladin = g.spawnUnit('paladin', 0, 18, 15)
    paladin.hp = 0
    g.update(0.5)

    return {
      hasAltar: !!altar,
      isDead: paladin.isDead === true,
      visible: paladin.mesh.visible,
      paladinCount: g.units.filter((u: any) => u.team === 0 && u.type === 'paladin' && !u.isBuilding).length,
    }
  })
}

test.describe('V9 HERO9 Altar revive runtime', () => {
  test.setTimeout(120000)

  test('REVIVE-1: no dead Paladin means no revive entry and summon remains available', async ({ page }) => {
    await waitForRuntime(page)

    const result = await page.evaluate(() => {
      const g = (window as any).__war3Game
      g.resources.earn(0, 5000, 5000)
      const altar = g.spawnBuilding('altar_of_kings', 0, 15, 15)
      g.selectionModel.clear()
      g.selectionModel.setSelection([altar])
      g._lastCmdKey = ''
      g.updateHUD(0.016)

      const summonBtn = (window as any).__getCommandButton('圣骑士')
      const reviveBtn = (window as any).__getCommandButton('复活圣骑士')
      return {
        hasSummon: !!summonBtn,
        summonDisabled: summonBtn?.disabled ?? null,
        hasRevive: !!reviveBtn,
      }
    })

    expect(result.hasSummon).toBe(true)
    expect(result.summonDisabled).toBe(false)
    expect(result.hasRevive).toBe(false)
  })

  test('REVIVE-2: live Paladin blocks summon and does not open revive', async ({ page }) => {
    await waitForRuntime(page)

    const result = await page.evaluate(() => {
      const g = (window as any).__war3Game
      g.resources.earn(0, 5000, 5000)
      const altar = g.spawnBuilding('altar_of_kings', 0, 15, 15)
      g.spawnUnit('paladin', 0, 18, 15)
      g.selectionModel.clear()
      g.selectionModel.setSelection([altar])
      g._lastCmdKey = ''
      g.updateHUD(0.016)

      const summonBtn = (window as any).__getCommandButton('圣骑士')
      const reviveBtn = (window as any).__getCommandButton('复活圣骑士')
      return {
        hasSummon: !!summonBtn,
        summonDisabled: summonBtn?.disabled ?? null,
        summonReason: summonBtn?.dataset.disabledReason ?? '',
        hasRevive: !!reviveBtn,
      }
    })

    expect(result.hasSummon).toBe(true)
    expect(result.summonDisabled).toBe(true)
    expect(result.summonReason).toContain('已存活')
    expect(result.hasRevive).toBe(false)
  })

  test('REVIVE-3: dead Paladin opens revive with level-1 cost and queue time', async ({ page }) => {
    await waitForRuntime(page)
    const setup = await createDeadPaladinAtAltar(page)
    expect(setup.isDead).toBe(true)
    expect(setup.visible).toBe(false)

    const result = await page.evaluate(() => {
      const g = (window as any).__war3Game
      const altar = g.units.find((u: any) => u.team === 0 && u.type === 'altar_of_kings' && u.isBuilding)
      g.selectionModel.clear()
      g.selectionModel.setSelection([altar])
      g._lastCmdKey = ''
      g.updateHUD(0.016)

      const summonBtn = (window as any).__getCommandButton('圣骑士')
      const reviveBtn = (window as any).__getCommandButton('复活圣骑士')
      return {
        summonDisabled: summonBtn?.disabled ?? null,
        summonReason: summonBtn?.dataset.disabledReason ?? '',
        hasRevive: !!reviveBtn,
        reviveDisabled: reviveBtn?.disabled ?? null,
        reviveCost: reviveBtn?.querySelector('.btn-cost')?.textContent ?? '',
      }
    })

    expect(result.summonDisabled).toBe(true)
    expect(result.summonReason).toContain('已阵亡')
    expect(result.hasRevive).toBe(true)
    expect(result.reviveDisabled).toBe(false)
    expect(result.reviveCost).toContain(`${PALADIN_REVIVE_GOLD}g`)
    expect(result.reviveCost).toContain(`${PALADIN_REVIVE_TIME}s`)
  })

  test('REVIVE-4: revive start spends once, queues once, and duplicate click is ignored', async ({ page }) => {
    await waitForRuntime(page)
    await createDeadPaladinAtAltar(page)

    const result = await page.evaluate(() => {
      const g = (window as any).__war3Game
      const altar = g.units.find((u: any) => u.team === 0 && u.type === 'altar_of_kings' && u.isBuilding)
      g.selectionModel.clear()
      g.selectionModel.setSelection([altar])
      g._lastCmdKey = ''
      g.updateHUD(0.016)

      const goldBefore = g.resources.get(0).gold
      const lumberBefore = g.resources.get(0).lumber
      const reviveBtn = (window as any).__getCommandButton('复活圣骑士')
      reviveBtn?.click()
      reviveBtn?.click()

      return {
        goldSpent: goldBefore - g.resources.get(0).gold,
        lumberSpent: lumberBefore - g.resources.get(0).lumber,
        queueLength: altar.reviveQueue.length,
        queueItem: altar.reviveQueue[0] ?? null,
        paladinCount: g.units.filter((u: any) => u.team === 0 && u.type === 'paladin' && !u.isBuilding).length,
      }
    })

    expect(result.goldSpent).toBe(PALADIN_REVIVE_GOLD)
    expect(result.lumberSpent).toBe(PALADIN_REVIVE_LUMBER)
    expect(result.queueLength).toBe(1)
    expect(result.queueItem.heroType).toBe('paladin')
    expect(result.queueItem.totalDuration).toBe(PALADIN_REVIVE_TIME)
    expect(result.paladinCount).toBe(1)
  })

  test('REVIVE-5: insufficient resources reject before spending or queueing', async ({ page }) => {
    await waitForRuntime(page)
    await createDeadPaladinAtAltar(page)

    const result = await page.evaluate(({ reviveGold }) => {
      const g = (window as any).__war3Game
      const altar = g.units.find((u: any) => u.team === 0 && u.type === 'altar_of_kings' && u.isBuilding)
      const res = g.resources.get(0)
      g.resources.spend(0, { gold: Math.max(0, res.gold - (reviveGold - 1)), lumber: 0 })

      g.selectionModel.clear()
      g.selectionModel.setSelection([altar])
      g._lastCmdKey = ''
      g.updateHUD(0.016)

      const goldBefore = g.resources.get(0).gold
      const reviveBtn = (window as any).__getCommandButton('复活圣骑士')
      ;(g as any).startReviveHero(altar, 'paladin')

      return {
        reviveDisabled: reviveBtn?.disabled ?? null,
        reviveReason: reviveBtn?.dataset.disabledReason ?? '',
        goldBefore,
        goldAfter: g.resources.get(0).gold,
        queueLength: altar.reviveQueue.length,
      }
    }, { reviveGold: PALADIN_REVIVE_GOLD })

    expect(result.reviveDisabled).toBe(true)
    expect(result.reviveReason).toContain('黄金不足')
    expect(result.goldAfter).toBe(result.goldBefore)
    expect(result.queueLength).toBe(0)
  })

  test('REVIVE-6: queued revive is visible as running revive state', async ({ page }) => {
    await waitForRuntime(page)
    await createDeadPaladinAtAltar(page)

    const result = await page.evaluate(() => {
      const g = (window as any).__war3Game
      const altar = g.units.find((u: any) => u.team === 0 && u.type === 'altar_of_kings' && u.isBuilding)
      g.selectionModel.clear()
      g.selectionModel.setSelection([altar])
      g._lastCmdKey = ''
      g.updateHUD(0.016)

      ;(window as any).__getCommandButton('复活圣骑士')?.click()
      g.updateHUD(0.016)

      const reviveBtn = (window as any).__getCommandButton('复活圣骑士')
      return {
        reviveDisabled: reviveBtn?.disabled ?? null,
        reviveReason: reviveBtn?.dataset.disabledReason ?? '',
        statsText: document.getElementById('unit-stats')?.textContent ?? '',
      }
    })

    expect(result.reviveDisabled).toBe(true)
    expect(result.reviveReason).toContain('正在复活')
    expect(result.statsText).toContain('复活')
    expect(result.statsText).toContain('圣骑士')
  })

  test('REVIVE-7: completion restores the same Paladin record near Altar', async ({ page }) => {
    await waitForRuntime(page)
    await createDeadPaladinAtAltar(page)

    const result = await page.evaluate(({ reviveTime, idleState }) => {
      const g = (window as any).__war3Game
      const altar = g.units.find((u: any) => u.team === 0 && u.type === 'altar_of_kings' && u.isBuilding)
      const paladin = g.units.find((u: any) => u.team === 0 && u.type === 'paladin' && !u.isBuilding)
      const enemy = g.spawnUnit('footman', 1, paladin.mesh.position.x + 2, paladin.mesh.position.z)
      paladin.attackTarget = enemy
      paladin.moveTarget = { x: 30, y: 0, z: 30 }
      paladin.gatherType = 'gold'
      paladin.resourceTarget = { type: 'goldmine', mine: g.units.find((u: any) => u.type === 'goldmine') }
      paladin.waypoints = [{ x: 31, y: 0, z: 31 }]
      paladin.moveQueue = [{ type: 'move', target: { x: 32, y: 0, z: 32 } }]
      paladin.attackMoveTarget = { x: 33, y: 0, z: 33 }
      paladin.mana = 0

      g.selectionModel.clear()
      g.selectionModel.setSelection([altar])
      g._lastCmdKey = ''
      g.updateHUD(0.016)
      const countBefore = g.units.filter((u: any) => u.team === 0 && u.type === 'paladin' && !u.isBuilding).length
      const indexBefore = g.units.indexOf(paladin)
      ;(window as any).__getCommandButton('复活圣骑士')?.click()

      const dt = 0.5
      for (let i = 0; i < Math.ceil(reviveTime / dt) + 8 && altar.reviveQueue.length > 0; i++) {
        g.update(dt)
      }

      const revived = g.units[indexBefore]
      const countAfter = g.units.filter((u: any) => u.team === 0 && u.type === 'paladin' && !u.isBuilding).length
      const distanceToAltar = revived.mesh.position.distanceTo(altar.mesh.position)

      return {
        sameRecord: revived === paladin,
        countBefore,
        countAfter,
        queueLength: altar.reviveQueue.length,
        isDead: revived.isDead ?? false,
        hp: revived.hp,
        mana: revived.mana,
        visible: revived.mesh.visible,
        state: revived.state,
        expectedIdleState: idleState,
        attackTargetCleared: revived.attackTarget === null,
        moveTargetCleared: revived.moveTarget === null,
        gatherType: revived.gatherType ?? null,
        resourceTargetCleared: revived.resourceTarget === null,
        waypointsLength: revived.waypoints.length,
        moveQueueLength: revived.moveQueue.length,
        attackMoveTargetCleared: revived.attackMoveTarget === null,
        distanceToAltar,
        selectedPaladin: g.selectedUnits.includes(revived),
        selectedAltar: g.selectedUnits.includes(altar),
        outlineRestored: g.outlineObjects.includes(revived.mesh),
        healthBarRestored: g.healthBars.has(revived),
      }
    }, { reviveTime: PALADIN_REVIVE_TIME, idleState: UnitState.Idle })

    expect(result.sameRecord).toBe(true)
    expect(result.countBefore).toBe(1)
    expect(result.countAfter).toBe(1)
    expect(result.queueLength).toBe(0)
    expect(result.isDead).toBe(false)
    expect(result.hp).toBe(UNITS.paladin.hp)
    expect(result.mana).toBe(UNITS.paladin.maxMana)
    expect(result.visible).toBe(true)
    expect(result.state).toBe(result.expectedIdleState)
    expect(result.attackTargetCleared).toBe(true)
    expect(result.moveTargetCleared).toBe(true)
    expect(result.gatherType).toBeNull()
    expect(result.resourceTargetCleared).toBe(true)
    expect(result.waypointsLength).toBe(0)
    expect(result.moveQueueLength).toBe(0)
    expect(result.attackMoveTargetCleared).toBe(true)
    expect(result.distanceToAltar).toBeLessThanOrEqual(3)
    expect(result.selectedPaladin).toBe(false)
    expect(result.selectedAltar).toBe(true)
    expect(result.outlineRestored).toBe(true)
    expect(result.healthBarRestored).toBe(true)
  })
})
