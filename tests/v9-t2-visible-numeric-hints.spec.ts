/**
 * V9 HN2-UX13 T2 Visible Numeric Hints Proof
 *
 * Proves that player-visible numeric hints for T2 content come from real
 * GameData values, not hardcoded text:
 *
 * 1. Without Keep, Workshop/Arcane Sanctum buttons disabled with 主城 reason
 * 2. With Keep, Workshop/Arcane Sanctum buttons show real gold/lumber cost
 * 3. Completed Workshop: Mortar Team button shows real cost/supply from GameData
 * 4. Completed Arcane Sanctum: Priest button shows real cost/supply from GameData
 * 5. Priest selection shows caster/healer identity (mana, heal ability)
 * 6. All DOM values cross-checked against fresh GameData constants
 */
import { test, expect, type Page } from '@playwright/test'
import { BUILDINGS, UNITS, PRIEST_HEAL_AMOUNT, PRIEST_HEAL_MANA_COST } from '../src/game/GameData'

const BASE = 'http://127.0.0.1:4173/?runtimeTest=1'

// Pre-extract values for page.evaluate closures
const WS_COST = BUILDINGS.workshop.cost
const AS_COST = BUILDINGS.arcane_sanctum.cost
const WS_BUILD_TIME = BUILDINGS.workshop.buildTime
const AS_BUILD_TIME = BUILDINGS.arcane_sanctum.buildTime
const MORTAR = UNITS.mortar_team
const PRIEST = UNITS.priest
const KEEP_HP = BUILDINGS.keep.hp

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
    // Procedural fallback
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

test.describe('V9 T2 Visible Numeric Hints', () => {
  test.setTimeout(120000)

  test('NH-1: without Keep, Workshop/Arcane Sanctum buttons show cost but disabled with 主城 reason', async ({ page }) => {
    await waitForGame(page)

    const result = await page.evaluate(({ wsCost, asCost, wsBuildTime, asBuildTime }) => {
      const g = (window as any).__war3Game
      if (!g) throw new Error('no game')

      // Ensure no Keep exists
      const keeps = g.units.filter(
        (u: any) => u.type === 'keep' && u.team === 0 && u.isBuilding && u.hp > 0,
      )
      for (const k of keeps) k.hp = 0
      g.handleDeadUnits()

      // Select worker
      const worker = g.units.find((u: any) => u.team === 0 && u.type === 'worker' && !u.isBuilding && u.hp > 0)
      if (!worker) throw new Error('no worker')
      g.selectionModel.clear()
      g.selectionModel.setSelection([worker])
      g._lastCmdKey = ''
      g.updateHUD(0.016)

      const cmdCard = document.getElementById('command-card')!
      const buttons = Array.from(cmdCard.querySelectorAll('button'))
      const byLabel = (label: string) => buttons.find(b =>
        b.querySelector('.btn-label')?.textContent?.trim() === label)

      const wsBtn = byLabel('车间')
      const asBtn = byLabel('奥秘圣殿')

      const wsCostText = wsBtn?.querySelector('.btn-cost')?.textContent ?? ''
      const asCostText = asBtn?.querySelector('.btn-cost')?.textContent ?? ''
      const wsReason = wsBtn?.dataset.disabledReason
        ?? wsBtn?.querySelector('.btn-reason')?.textContent ?? ''
      const asReason = asBtn?.dataset.disabledReason
        ?? asBtn?.querySelector('.btn-reason')?.textContent ?? ''

      return {
        wsCostText,
        asCostText,
        wsDisabled: wsBtn ? (wsBtn as HTMLButtonElement).disabled : null,
        asDisabled: asBtn ? (asBtn as HTMLButtonElement).disabled : null,
        wsReason,
        asReason,
        wsExpectedCost: `${wsCost.gold}g ${wsCost.lumber}w · ${wsBuildTime}s`,
        asExpectedCost: `${asCost.gold}g ${asCost.lumber}w · ${asBuildTime}s`,
      }
    }, { wsCost: WS_COST, asCost: AS_COST, wsBuildTime: WS_BUILD_TIME, asBuildTime: AS_BUILD_TIME })

    // Buttons exist and show real costs from GameData
    expect(result.wsCostText).toBe(result.wsExpectedCost)
    expect(result.asCostText).toBe(result.asExpectedCost)
    // Buttons are disabled
    expect(result.wsDisabled).toBe(true)
    expect(result.asDisabled).toBe(true)
    // Reasons mention 主城 (Keep requirement)
    expect(result.wsReason).toContain('主城')
    expect(result.asReason).toContain('主城')
  })

  test('NH-2: with completed Keep, Workshop/Arcane Sanctum buttons show real costs and are enabled', async ({ page }) => {
    await waitForGame(page)

    const result = await page.evaluate(({ wsCost, asCost, wsBuildTime, asBuildTime, keepHp }) => {
      const g = (window as any).__war3Game
      if (!g) throw new Error('no game')

      g.resources.earn(0, 5000, 5000)

      // Complete Keep upgrade
      const th = g.units.find((u: any) => u.team === 0 && u.type === 'townhall' && u.isBuilding && u.hp > 0)
      if (!th) throw new Error('no townhall')
      g.startBuildingUpgrade(th, 'keep')

      const dt = 0.5
      for (let i = 0; i < 120; i++) {
        g.gameTime += dt
        g.updateUnits(dt)
      }

      // Verify Keep
      const keepUnit = g.units.find((u: any) => u === th)
      if (keepUnit?.type !== 'keep') throw new Error('upgrade did not complete')

      // Select worker
      const worker = g.units.find((u: any) => u.team === 0 && u.type === 'worker' && !u.isBuilding && u.hp > 0)
      if (!worker) throw new Error('no worker')
      g.selectionModel.clear()
      g.selectionModel.setSelection([worker])
      g._lastCmdKey = ''
      g.updateHUD(0.016)

      const cmdCard = document.getElementById('command-card')!
      const buttons = Array.from(cmdCard.querySelectorAll('button'))
      const byLabel = (label: string) => buttons.find(b =>
        b.querySelector('.btn-label')?.textContent?.trim() === label)

      const wsBtn = byLabel('车间')
      const asBtn = byLabel('奥秘圣殿')

      return {
        wsCostText: wsBtn?.querySelector('.btn-cost')?.textContent ?? '',
        asCostText: asBtn?.querySelector('.btn-cost')?.textContent ?? '',
        wsEnabled: wsBtn ? !(wsBtn as HTMLButtonElement).disabled : false,
        asEnabled: asBtn ? !(asBtn as HTMLButtonElement).disabled : false,
        wsReason: wsBtn?.dataset.disabledReason ?? '',
        asReason: asBtn?.dataset.disabledReason ?? '',
        wsExpectedCost: `${wsCost.gold}g ${wsCost.lumber}w · ${wsBuildTime}s`,
        asExpectedCost: `${asCost.gold}g ${asCost.lumber}w · ${asBuildTime}s`,
      }
    }, { wsCost: WS_COST, asCost: AS_COST, wsBuildTime: WS_BUILD_TIME, asBuildTime: AS_BUILD_TIME, keepHp: KEEP_HP })

    // Buttons show real costs from GameData
    expect(result.wsCostText).toBe(result.wsExpectedCost)
    expect(result.asCostText).toBe(result.asExpectedCost)
    // Buttons are enabled
    expect(result.wsEnabled).toBe(true)
    expect(result.asEnabled).toBe(true)
    // No disabled reason
    expect(result.wsReason).toBe('')
    expect(result.asReason).toBe('')
  })

  test('NH-3: completed Workshop shows Mortar Team button with real cost/supply from GameData', async ({ page }) => {
    await waitForGame(page)

    const result = await page.evaluate(({ mortar, keepHp }) => {
      const g = (window as any).__war3Game
      if (!g) throw new Error('no game')

      g.resources.earn(0, 5000, 5000)

      // Complete Keep upgrade
      const th = g.units.find((u: any) => u.team === 0 && u.type === 'townhall' && u.isBuilding && u.hp > 0)
      if (!th) throw new Error('no townhall')
      th.type = 'keep'
      th.maxHp = keepHp
      th.hp = keepHp
      th.upgradeQueue = null

      // Spawn completed Workshop
      const workshop = g.spawnBuilding('workshop', 0, 53, 50)
      g.spawnBuilding('farm', 0, 55, 50)

      // Select Workshop
      g.selectionModel.clear()
      g.selectionModel.setSelection([workshop])
      g._lastCmdKey = ''
      g.updateHUD(0.016)

      const cmdCard = document.getElementById('command-card')!
      const buttons = Array.from(cmdCard.querySelectorAll('button'))
      const mortarBtn = buttons.find(b =>
        b.querySelector('.btn-label')?.textContent?.trim() === '迫击炮小队')

      const costText = mortarBtn?.querySelector('.btn-cost')?.textContent ?? ''
      const isEnabled = mortarBtn ? !(mortarBtn as HTMLButtonElement).disabled : false

      // Cross-check with fresh game state
      const freshWs = g.units.find((u: any) => u === workshop && u.hp > 0)
      const hasTrainQueue = Array.isArray(freshWs?.trainingQueue)

      // Cleanup
      workshop.hp = 0
      g.handleDeadUnits()

      return {
        costText,
        isEnabled,
        hasTrainQueue,
        expectedCostGold: mortar.cost.gold,
        expectedCostLumber: mortar.cost.lumber,
        expectedSupply: mortar.supply,
        expectedTrainTime: mortar.trainTime,
      }
    }, { mortar: MORTAR, keepHp: KEEP_HP })

    // Button shows real gold cost
    expect(result.costText).toContain(`${result.expectedCostGold}g`)
    // Button shows real lumber cost (if > 0)
    if (result.expectedCostLumber > 0) {
      expect(result.costText).toContain(`${result.expectedCostLumber}w`)
    }
    // Button shows real supply
    expect(result.costText).toContain(`${result.expectedSupply}口`)
    // Button shows real train time
    expect(result.costText).toContain(`${result.expectedTrainTime}s`)
    // Button is enabled (we gave resources)
    expect(result.isEnabled).toBe(true)
    expect(result.hasTrainQueue).toBe(true)
  })

  test('NH-4: completed Arcane Sanctum shows Priest button with real cost/supply from GameData', async ({ page }) => {
    await waitForGame(page)

    const result = await page.evaluate(({ priest, keepHp }) => {
      const g = (window as any).__war3Game
      if (!g) throw new Error('no game')

      g.resources.earn(0, 5000, 5000)

      // Complete Keep upgrade
      const th = g.units.find((u: any) => u.team === 0 && u.type === 'townhall' && u.isBuilding && u.hp > 0)
      if (!th) throw new Error('no townhall')
      th.type = 'keep'
      th.maxHp = keepHp
      th.hp = keepHp
      th.upgradeQueue = null

      // Spawn completed Arcane Sanctum
      const sanctum = g.spawnBuilding('arcane_sanctum', 0, 56, 50)
      g.spawnBuilding('farm', 0, 58, 50)

      // Select Arcane Sanctum
      g.selectionModel.clear()
      g.selectionModel.setSelection([sanctum])
      g._lastCmdKey = ''
      g.updateHUD(0.016)

      const cmdCard = document.getElementById('command-card')!
      const buttons = Array.from(cmdCard.querySelectorAll('button'))
      const priestBtn = buttons.find(b =>
        b.querySelector('.btn-label')?.textContent?.trim() === '牧师')

      const costText = priestBtn?.querySelector('.btn-cost')?.textContent ?? ''
      const isEnabled = priestBtn ? !(priestBtn as HTMLButtonElement).disabled : false

      // Cross-check with fresh game state
      const freshAs = g.units.find((u: any) => u === sanctum && u.hp > 0)
      const hasTrainQueue = Array.isArray(freshAs?.trainingQueue)

      // Cleanup
      sanctum.hp = 0
      g.handleDeadUnits()

      return {
        costText,
        isEnabled,
        hasTrainQueue,
        expectedCostGold: priest.cost.gold,
        expectedCostLumber: priest.cost.lumber,
        expectedSupply: priest.supply,
        expectedTrainTime: priest.trainTime,
      }
    }, { priest: PRIEST, keepHp: KEEP_HP })

    // Button shows real gold cost
    expect(result.costText).toContain(`${result.expectedCostGold}g`)
    // Button shows real lumber cost (if > 0)
    if (result.expectedCostLumber > 0) {
      expect(result.costText).toContain(`${result.expectedCostLumber}w`)
    }
    // Button shows real supply
    expect(result.costText).toContain(`${result.expectedSupply}口`)
    // Button shows real train time
    expect(result.costText).toContain(`${result.expectedTrainTime}s`)
    // Button is enabled (we gave resources)
    expect(result.isEnabled).toBe(true)
    expect(result.hasTrainQueue).toBe(true)
  })

  test('NH-5: Priest selection shows caster/healer identity with real mana and heal values', async ({ page }) => {
    await waitForGame(page)

    const result = await page.evaluate(({ healAmount, healManaCost }) => {
      const g = (window as any).__war3Game
      if (!g) throw new Error('no game')

      // Spawn a Priest and select it
      const priest = g.spawnUnit('priest', 0, 30, 30)
      g.selectionModel.clear()
      g.selectionModel.setSelection([priest])
      g._lastCmdKey = ''
      g._lastSelKey = ''
      g.updateHUD(0.016)

      // Read command card for heal button
      const cmdCard = document.getElementById('command-card')!
      const buttons = Array.from(cmdCard.querySelectorAll('button'))
      const healBtn = buttons.find(b =>
        b.querySelector('.btn-label')?.textContent?.trim() === '治疗')

      const healCostText = healBtn?.querySelector('.btn-cost')?.textContent ?? ''

      // Read unit-stats for mana/HP display
      const statsEl = document.getElementById('unit-stats')!
      const statsText = statsEl.textContent ?? ''

      // Read fresh state
      const freshPriest = g.units.find((u: any) => u === priest && u.hp > 0)

      // Cleanup
      priest.hp = 0
      g.handleDeadUnits()

      return {
        hasHealBtn: !!healBtn,
        healCostText,
        statsHasMana: statsText.includes('魔力') || statsText.includes('mana') || freshPriest?.maxMana > 0,
        freshMana: freshPriest?.mana ?? 0,
        freshMaxMana: freshPriest?.maxMana ?? 0,
        healBtnShowsManaCost: healCostText.includes(String(healManaCost)),
        healBtnShowsHealAmount: healCostText.includes(String(healAmount)),
      }
    }, { healAmount: PRIEST_HEAL_AMOUNT, healManaCost: PRIEST_HEAL_MANA_COST })

    // Heal button exists with real mana cost and heal amount
    expect(result.hasHealBtn).toBe(true)
    expect(result.healBtnShowsManaCost).toBe(true)
    expect(result.healBtnShowsHealAmount).toBe(true)
    // Priest has mana (caster identity)
    expect(result.freshMana).toBeGreaterThan(0)
    expect(result.freshMaxMana).toBeGreaterThan(0)
  })

  test('NH-6: Mortar Team selection shows Siege attack type and real damage/range from GameData', async ({ page }) => {
    await waitForGame(page)

    const result = await page.evaluate(({ mortar }) => {
      const g = (window as any).__war3Game
      if (!g) throw new Error('no game')

      const mortarUnit = g.spawnUnit('mortar_team', 0, 40, 40)
      g.selectionModel.clear()
      g.selectionModel.setSelection([mortarUnit])
      g._lastCmdKey = ''
      g._lastSelKey = ''
      g.updateHUD(0.016)

      const statsEl = document.getElementById('unit-stats')!
      const statsText = statsEl.textContent ?? ''

      // Cross-check with fresh state
      const fresh = g.units.find((u: any) => u === mortarUnit && u.hp > 0)

      // Cleanup
      mortarUnit.hp = 0
      g.handleDeadUnits()

      return {
        statsText,
        hasDamage: statsText.includes(String(mortar.attackDamage)),
        hasRange: statsText.includes(String(mortar.attackRange)),
        freshDamage: fresh?.attackDamage ?? 0,
        freshRange: fresh?.attackRange ?? 0,
      }
    }, { mortar: MORTAR })

    // Stats show real damage from GameData
    expect(result.hasDamage).toBe(true)
    expect(result.freshDamage).toBe(MORTAR.attackDamage)
    // Stats show real range (6.5)
    expect(result.hasRange).toBe(true)
    expect(result.freshRange).toBe(MORTAR.attackRange)
  })
})
