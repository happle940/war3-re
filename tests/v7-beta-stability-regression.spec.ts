/**
 * V7 Beta Stability Regression Pack
 *
 * This pack is a stability aggregator. The focused Task 107/108/109/110 specs
 * prove each feature in depth; this file proves the accepted V7 content can
 * coexist in one runtime without breaking command paths, combat, HUD, or cleanup.
 */
import { test, expect, type Page } from '@playwright/test'
import {
  AttackType,
  BUILDINGS,
  MORTAR_AOE_RADIUS,
  PEASANT_BUILD_MENU,
  PRIEST_HEAL_AMOUNT,
  PRIEST_HEAL_MANA_COST,
  PRIEST_MANA,
  UNITS,
} from '../src/game/GameData'

const BASE = 'http://127.0.0.1:4173/?runtimeTest=1'

async function waitForGame(page: Page) {
  const consoleErrors: string[] = []
  page.on('console', (msg) => {
    if (msg.type() === 'error') consoleErrors.push(msg.text())
  })
  ;(page as any).__consoleErrors = consoleErrors

  await page.goto(BASE, { waitUntil: 'domcontentloaded' })
  await page.waitForFunction(() => {
    const canvas = document.getElementById('game-canvas')
    const game = (window as any).__war3Game
    if (!canvas || !game || !game.renderer) return false
    if (!Array.isArray(game.units) || game.units.length === 0) return false
    return game.renderer.domElement.width > 0
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

test.describe('V7 Beta Stability Regression', () => {
  test.beforeEach(async ({ page }) => {
    await waitForGame(page)
  })

  test('proof-1: accepted V7 content is connected through data tables', async () => {
    expect(PEASANT_BUILD_MENU).toContain('lumber_mill')
    expect(PEASANT_BUILD_MENU).toContain('tower')
    expect(PEASANT_BUILD_MENU).toContain('arcane_sanctum')
    expect(PEASANT_BUILD_MENU).toContain('workshop')

    expect(BUILDINGS.tower.techPrereq).toBe('lumber_mill')
    expect(BUILDINGS.arcane_sanctum.techPrereq).toBe('keep')
    expect(BUILDINGS.arcane_sanctum.trains).toContain('priest')
    expect(BUILDINGS.workshop.trains).toContain('mortar_team')

    expect(UNITS.priest.techPrereq).toBe('arcane_sanctum')
    expect(UNITS.priest.supply).toBe(2)
    expect(PRIEST_MANA).toBeGreaterThan(0)
    expect(PRIEST_HEAL_AMOUNT).toBeGreaterThan(0)
    expect(PRIEST_HEAL_MANA_COST).toBeGreaterThan(0)

    expect(UNITS.mortar_team.attackType).toBe(AttackType.Siege)
    expect(MORTAR_AOE_RADIUS).toBeGreaterThan(0)
  })

  test('proof-2: accepted V7 training command paths coexist in one runtime', async ({ page }) => {
    const result = await page.evaluate(() => {
      const g = (window as any).__war3Game
      if (!g) throw new Error('no game')

      g.resources.earn(0, 5000, 3000)
      g.spawnBuilding('farm', 0, 28, 28)
      g.spawnBuilding('barracks', 0, 31, 28)
      g.spawnBuilding('lumber_mill', 0, 34, 28)
      const sanctum = g.spawnBuilding('arcane_sanctum', 0, 37, 28)
      const workshop = g.spawnBuilding('workshop', 0, 40, 28)

      const towerAvailability = g.getBuildAvailability('tower', 0)
      const priestAvailability = g.getTrainAvailability('priest', 0)
      const mortarAvailability = g.getTrainAvailability('mortar_team', 0)

      g.selectionModel.setSelection([sanctum])
      g._lastCmdKey = ''
      g.updateHUD(0.016)
      const priestButton = [...document.querySelectorAll('#command-card button')].find(
        (button) => button.querySelector('.btn-label')?.textContent?.trim() === '牧师',
      ) as HTMLButtonElement | undefined
      const priestQueueBefore = sanctum.trainingQueue.length
      priestButton?.click()

      g.selectionModel.setSelection([workshop])
      g._lastCmdKey = ''
      g.updateHUD(0.016)
      const mortarButton = [...document.querySelectorAll('#command-card button')].find(
        (button) => button.querySelector('.btn-label')?.textContent?.trim() === '迫击炮小队',
      ) as HTMLButtonElement | undefined
      const mortarQueueBefore = workshop.trainingQueue.length
      mortarButton?.click()

      return {
        towerOk: towerAvailability.ok,
        priestOk: priestAvailability.ok,
        mortarOk: mortarAvailability.ok,
        priestButtonFound: !!priestButton,
        priestButtonEnabled: !!priestButton && !priestButton.disabled,
        priestQueueBefore,
        priestQueueAfter: sanctum.trainingQueue.length,
        priestQueuedType: sanctum.trainingQueue[0]?.type ?? '',
        mortarButtonFound: !!mortarButton,
        mortarButtonEnabled: !!mortarButton && !mortarButton.disabled,
        mortarQueueBefore,
        mortarQueueAfter: workshop.trainingQueue.length,
        mortarQueuedType: workshop.trainingQueue[0]?.type ?? '',
      }
    })

    expect(result.towerOk).toBe(true)
    expect(result.priestOk).toBe(true)
    expect(result.mortarOk).toBe(true)
    expect(result.priestButtonFound).toBe(true)
    expect(result.priestButtonEnabled).toBe(true)
    expect(result.priestQueueAfter).toBe(result.priestQueueBefore + 1)
    expect(result.priestQueuedType).toBe('priest')
    expect(result.mortarButtonFound).toBe(true)
    expect(result.mortarButtonEnabled).toBe(true)
    expect(result.mortarQueueAfter).toBe(result.mortarQueueBefore + 1)
    expect(result.mortarQueuedType).toBe('mortar_team')
  })

  test('proof-3: V7 combat models coexist without breaking target filters', async ({ page }) => {
    const result = await page.evaluate(() => {
      const g = (window as any).__war3Game
      if (!g) throw new Error('no game')

      const priest = g.spawnUnit('priest', 0, 45, 45)
      const ally = g.spawnUnit('footman', 0, 45, 46)
      const enemyInHealRange = g.spawnUnit('footman', 1, 45, 47)
      ally.hp -= 50
      enemyInHealRange.hp -= 50

      const allyBefore = ally.hp
      const enemyBeforeHeal = enemyInHealRange.hp
      const healAlly = g.castHeal(priest, ally)
      priest.healCooldownUntil = 0
      const healEnemy = g.castHeal(priest, enemyInHealRange)

      const mortar = g.spawnUnit('mortar_team', 0, 50, 50)
      const primary = g.spawnUnit('footman', 1, 56, 50)
      const splashEnemy = g.spawnUnit('footman', 1, 57, 50)
      const allyNearSplash = g.spawnUnit('footman', 0, 57, 51)
      const mine = g.spawnBuilding('goldmine', -1, 57, 49)

      const before = {
        primary: primary.hp,
        splashEnemy: splashEnemy.hp,
        allyNearSplash: allyNearSplash.hp,
        mine: mine.hp,
      }
      g.dealDamage(mortar, primary)

      const proof = {
        healAlly,
        healEnemy,
        allyHealed: ally.hp > allyBefore,
        enemyNotHealed: enemyInHealRange.hp === enemyBeforeHeal,
        primaryDamaged: primary.hp < before.primary,
        splashEnemyDamaged: splashEnemy.hp < before.splashEnemy,
        allyFiltered: allyNearSplash.hp === before.allyNearSplash,
        mineFiltered: mine.hp === before.mine,
      }

      for (const unit of [priest, ally, enemyInHealRange, mortar, primary, splashEnemy, allyNearSplash]) {
        unit.hp = 0
      }
      g.handleDeadUnits()
      g.removeTestUnit(mine)

      return proof
    })

    expect(result.healAlly).toBe(true)
    expect(result.healEnemy).toBe(false)
    expect(result.allyHealed).toBe(true)
    expect(result.enemyNotHealed).toBe(true)
    expect(result.primaryDamaged).toBe(true)
    expect(result.splashEnemyDamaged).toBe(true)
    expect(result.allyFiltered).toBe(true)
    expect(result.mineFiltered).toBe(true)
  })

  test('proof-4: V7 player-visible HUD and command state survive selection swaps', async ({ page }) => {
    const result = await page.evaluate(() => {
      const g = (window as any).__war3Game
      if (!g) throw new Error('no game')

      const priest = g.spawnUnit('priest', 0, 60, 60)
      const mortar = g.spawnUnit('mortar_team', 0, 61, 60)

      g.selectionModel.setSelection([priest])
      g._lastCmdKey = ''
      g._lastSelKey = ''
      g.updateHUD(0.016)
      const priestName = document.getElementById('unit-name')?.textContent ?? ''
      const priestStats = document.getElementById('unit-stats')?.textContent ?? ''
      const healButton = [...document.querySelectorAll('#command-card button')].find(
        (button) => button.querySelector('.btn-label')?.textContent?.trim() === '治疗',
      ) as HTMLButtonElement | undefined

      priest.mana = 0
      g._lastCmdKey = ''
      g.updateHUD(0.016)
      const healNoManaReason = [...document.querySelectorAll('#command-card button')]
        .find((button) => button.querySelector('.btn-label')?.textContent?.trim() === '治疗')
        ?.getAttribute('data-disabled-reason') ?? ''

      g.selectionModel.setSelection([mortar])
      g._lastCmdKey = ''
      g._lastSelKey = ''
      g.updateHUD(0.016)
      const mortarName = document.getElementById('unit-name')?.textContent ?? ''
      const mortarStats = document.getElementById('unit-stats')?.textContent ?? ''

      priest.hp = 0
      mortar.hp = 0
      g.handleDeadUnits()

      return {
        priestName,
        priestStatsHasMana: priestStats.includes('💧'),
        healButtonFound: !!healButton,
        healButtonEnabledInitially: !!healButton && !healButton.disabled,
        healNoManaReason,
        mortarName,
        mortarStatsHasAttack: mortarStats.includes('42'),
      }
    })

    expect(result.priestName).toBe('牧师')
    expect(result.priestStatsHasMana).toBe(true)
    expect(result.healButtonFound).toBe(true)
    expect(result.healButtonEnabledInitially).toBe(true)
    expect(result.healNoManaReason).toContain('魔力')
    expect(result.mortarName).toBe('迫击炮小队')
    expect(result.mortarStatsHasAttack).toBe(true)
  })

  test('proof-5: V7-created runtime state can be cleaned and procedural start can recover', async ({ page }) => {
    const result = await page.evaluate(() => {
      const g = (window as any).__war3Game
      if (!g) throw new Error('no game')

      g.spawnBuilding('lumber_mill', 0, 66, 66)
      g.spawnBuilding('arcane_sanctum', 0, 69, 66)
      g.spawnBuilding('workshop', 0, 72, 66)
      const priest = g.spawnUnit('priest', 0, 69, 69)
      g.spawnUnit('mortar_team', 0, 72, 69)

      g.selectionModel.setSelection([priest])
      g._lastCmdKey = ''
      g._lastSelKey = ''
      g.updateHUD(0.016)

      g.disposeAllUnits()
      const afterDispose = {
        units: g.units.length,
        selected: g.selectionModel.units.length,
        outlines: g.outlineObjects.length,
        healthBars: g.healthBars.size,
      }

      g.resetToProceduralStart()
      if (g.ai) {
        if (typeof g.ai.reset === 'function') g.ai.reset()
        g.ai.update = () => {}
      }

      return {
        afterDispose,
        recoveredUnits: g.units.length,
        hasTownhall: g.units.some((u: any) => u.team === 0 && u.type === 'townhall' && u.hp > 0),
        workerCount: g.units.filter((u: any) => u.team === 0 && u.type === 'worker' && u.hp > 0).length,
      }
    })

    expect(result.afterDispose.units).toBe(0)
    expect(result.afterDispose.selected).toBe(0)
    expect(result.afterDispose.outlines).toBe(0)
    expect(result.afterDispose.healthBars).toBe(0)
    expect(result.recoveredUnits).toBeGreaterThan(0)
    expect(result.hasTownhall).toBe(true)
    expect(result.workerCount).toBeGreaterThanOrEqual(5)
  })
})
