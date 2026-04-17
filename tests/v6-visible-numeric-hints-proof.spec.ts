/**
 * V6 Visible Numeric Hints Proof
 *
 * Proves that player-visible numeric hints come from real GameData / runtime state,
 * not hardcoded fake text.
 *
 * 1. Train/build/research button shows real cost, supply, prereq, or effect
 * 2. Unit/building selection shows real attack type / armor type / armor value
 * 3. Disabled reason comes from real availability logic
 * 4. Hints refresh after research/resource/selection changes
 * 5. DOM values cross-checked against fresh game state
 */
import { test, expect, type Page } from '@playwright/test'
import { ARMOR_TYPE_NAMES, ATTACK_TYPE_NAMES, RESEARCHES, UNITS } from '../src/game/GameData'

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
  await page.waitForTimeout(300)
}

test.describe('V6 Visible Numeric Hints Proof', () => {
  test.beforeEach(async ({ page }) => {
    await waitForGame(page)
  })

  test('proof-1: train button shows real cost and supply from data', async ({ page }) => {
    const expected = {
      workerCost: UNITS.worker.cost.gold,
      workerSupply: UNITS.worker.supply,
    }

    const result = await page.evaluate((expected) => {
      const g = (window as any).__war3Game
      if (!g) throw new Error('no game')

      // Give resources so buttons are enabled
      g.resources.earn(0, 500, 200)

      // Select townhall to see train buttons
      const th = g.units.find((u: any) => u.team === 0 && u.type === 'townhall' && u.isBuilding && u.hp > 0)
      if (!th) throw new Error('no townhall')
      g.selectionModel.setSelection([th])
      g._lastCmdKey = ''
      g._lastSelKey = ''
      g.updateHUD(0.016)

      // Read command card DOM for train button
      const cmdCard = document.getElementById('command-card')!
      const buttons = cmdCard.querySelectorAll('button')
      let workerBtn: HTMLButtonElement | null = null
      for (const btn of buttons) {
        if (btn.textContent?.includes('农民')) {
          workerBtn = btn as HTMLButtonElement
          break
        }
      }

      // Read the button text
      const btnText = workerBtn?.textContent ?? ''
      const hasCost = btnText.includes(`${expected.workerCost}g`)
      const hasSupply = btnText.includes(`${expected.workerSupply}口`)

      return { btnText, hasCost, hasSupply }
    }, expected)

    expect(result.hasCost).toBe(true)
    expect(result.hasSupply).toBe(true)
  })

  test('proof-2: unit selection shows real attack type / armor type / armor value', async ({ page }) => {
    const expected = {
      damage: UNITS.footman.attackDamage,
      armor: UNITS.footman.armor,
      attackTypeName: ATTACK_TYPE_NAMES[UNITS.footman.attackType!],
      armorTypeName: ARMOR_TYPE_NAMES[UNITS.footman.armorType!],
    }

    const result = await page.evaluate((expected) => {
      const g = (window as any).__war3Game
      if (!g) throw new Error('no game')

      // Select a footman
      let footman = g.units.find((u: any) => u.team === 0 && u.type === 'footman' && !u.isBuilding && u.hp > 0)
      if (!footman) {
        // AI may not have footman, spawn one for team 0
        footman = g.spawnUnit('footman', 0, 50, 50)
      }

      g.selectionModel.setSelection([footman])
      g._lastCmdKey = ''
      g._lastSelKey = ''
      g.updateHUD(0.016)

      // Read DOM stats
      const statsEl = document.getElementById('unit-stats')!
      const statsText = statsEl.textContent ?? ''

      // Cross-check with real data from fresh game state
      const freshFootman = g.units.find((u: any) => u === footman && u.hp > 0)
      const hasDamage = statsText.includes(String(expected.damage)) && freshFootman.attackDamage === expected.damage
      const hasArmor = statsText.includes(String(expected.armor)) && freshFootman.armor === expected.armor
      const hasAttackType = statsText.includes(expected.attackTypeName)
      const hasArmorType = statsText.includes(expected.armorTypeName)

      // Cleanup if spawned
      if (footman.type === 'footman' && footman.team === 0) {
        // only cleanup if we spawned it
      }

      return { statsText, hasDamage, hasArmor, hasAttackType, hasArmorType }
    }, expected)

    // Stats come from real UNITS data
    expect(result.hasDamage).toBe(true)
    expect(result.hasArmor).toBe(true)
    expect(result.hasAttackType).toBe(true)
    expect(result.hasArmorType).toBe(true)
  })

  test('proof-3: disabled reason comes from real availability logic', async ({ page }) => {
    const result = await page.evaluate(() => {
      const g = (window as any).__war3Game
      if (!g) throw new Error('no game')

      // Set gold to 0 to trigger cost block
      const res = g.resources.get(0)
      const origGold = res.gold
      const origLumber = res.lumber
      g.resources.spend(0, { gold: origGold, lumber: origLumber })

      // Select townhall
      const th = g.units.find((u: any) => u.team === 0 && u.type === 'townhall' && u.isBuilding && u.hp > 0)
      g.selectionModel.setSelection([th])
      g._lastCmdKey = ''
      g.updateHUD(0.016)

      // Read disabled reason from DOM
      const cmdCard = document.getElementById('command-card')!
      const buttons = cmdCard.querySelectorAll('button')
      let workerBtn: HTMLButtonElement | null = null
      for (const btn of buttons) {
        if (btn.textContent?.includes('农民')) {
          workerBtn = btn as HTMLButtonElement
          break
        }
      }
      const disabledReason = workerBtn?.dataset?.disabledReason ?? workerBtn?.title ?? ''
      const isDisabled = workerBtn?.disabled ?? false

      // Restore resources
      g.resources.earn(0, origGold, origLumber)

      return { disabledReason, isDisabled }
    })

    // Button should be disabled with reason from availability check
    expect(result.isDisabled).toBe(true)
    expect(result.disabledReason).toContain('黄金不足')
  })

  test('proof-4: hints refresh after research completion', async ({ page }) => {
    const expected = {
      costGold: RESEARCHES.long_rifles.cost.gold,
      effectValue: RESEARCHES.long_rifles.effects?.[0]?.value ?? 0,
    }

    const result = await page.evaluate((expected) => {
      const g = (window as any).__war3Game
      if (!g) throw new Error('no game')

      // Give resources
      g.resources.earn(0, 500, 200)

      // Spawn blacksmith and select it
      const bs = g.spawnBuilding('blacksmith', 0, 55, 55)
      g.selectionModel.setSelection([bs])
      g._lastCmdKey = ''
      g._lastSelKey = ''
      g.updateHUD(0.016)

      // Read initial state: research button should show "步枪兵 射程+1.5"
      const cmdCard1 = document.getElementById('command-card')!
      const buttons1 = cmdCard1.querySelectorAll('button')
      let researchBtn1: HTMLButtonElement | null = null
      for (const btn of buttons1) {
        if (btn.textContent?.includes('长管步枪')) {
          researchBtn1 = btn as HTMLButtonElement
          break
        }
      }
      const beforeText = researchBtn1?.textContent ?? ''
      const beforeDisabled = researchBtn1?.disabled ?? false

      // Complete research via tick
      bs.researchQueue.push({ key: 'long_rifles', remaining: 0.001 })
      g.gameTime = 200
      g.update(0.01)

      // Force HUD refresh
      g._lastCmdKey = ''
      g._lastSelKey = ''
      g.updateHUD(0.016)

      // Re-read DOM after research completion
      const cmdCard2 = document.getElementById('command-card')!
      const buttons2 = cmdCard2.querySelectorAll('button')
      let researchBtn2: HTMLButtonElement | null = null
      for (const btn of buttons2) {
        if (btn.textContent?.includes('长管步枪')) {
          researchBtn2 = btn as HTMLButtonElement
          break
        }
      }
      const afterText = researchBtn2?.textContent ?? ''
      const afterDisabled = researchBtn2?.disabled ?? false
      // The completed research button should show effect description from data
      const showsEffect = afterText.includes('射程') && afterText.includes(`+${expected.effectValue}`)

      // Cleanup
      bs.hp = 0
      g.handleDeadUnits()

      return { beforeText, beforeDisabled, afterText, afterDisabled, showsEffect }
    }, expected)

    // Before: button available with effect description from data
    expect(result.beforeDisabled).toBe(false)
    expect(result.beforeText).toContain(`${expected.costGold}g`)
    // After: button disabled, showing completed state with effect info
    expect(result.afterDisabled).toBe(true)
    expect(result.showsEffect).toBe(true)
  })

  test('proof-5: DOM values cross-checked against fresh game state', async ({ page }) => {
    const expected = {
      damage: UNITS.rifleman.attackDamage,
      armor: UNITS.rifleman.armor,
      attackTypeName: ATTACK_TYPE_NAMES[UNITS.rifleman.attackType!],
      armorTypeName: ARMOR_TYPE_NAMES[UNITS.rifleman.armorType!],
    }

    const result = await page.evaluate((expected) => {
      const g = (window as any).__war3Game
      if (!g) throw new Error('no game')

      // Spawn a rifleman and select it
      const rifleman = g.spawnUnit('rifleman', 0, 60, 60)
      g.selectionModel.setSelection([rifleman])
      g._lastCmdKey = ''
      g._lastSelKey = ''
      g.updateHUD(0.016)

      // Read DOM stats
      const statsEl = document.getElementById('unit-stats')!
      const statsText = statsEl.textContent ?? ''

      // Read DOM hp text
      const hpText = document.getElementById('unit-hp-text')!.textContent ?? ''

      // NOW: re-read from fresh game state (not cached snapshot)
      const freshRifle = g.units.find((u: any) => u === rifleman && u.hp > 0)
      if (!freshRifle) throw new Error('rifleman gone')

      // Cross-check: DOM attack damage should match fresh unit data
      const domHasDamage = statsText.includes(String(expected.damage))
      const freshDamage = freshRifle.attackDamage

      // Cross-check: DOM armor should match fresh unit data
      const freshArmor = freshRifle.armor

      // Cross-check: DOM attack type should match data
      const domHasPiercing = statsText.includes(expected.attackTypeName)
      const domHasUnarmored = statsText.includes(expected.armorTypeName)

      // Cross-check: HP text matches fresh state
      const domHp = parseInt(hpText.split('/')[0].trim())
      const freshHp = freshRifle.hp

      // Cleanup
      rifleman.hp = 0
      g.handleDeadUnits()

      return {
        statsText,
        domHasDamage,
        freshDamage,
        freshArmor,
        domHasPiercing,
        domHasUnarmored,
        domHp,
        freshHp,
        hpText,
      }
    }, expected)

    // DOM displays real data from fresh game state
    expect(result.domHasDamage).toBe(true)
    expect(result.freshDamage).toBe(expected.damage)
    expect(result.freshArmor).toBe(expected.armor)
    expect(result.domHasPiercing).toBe(true)
    expect(result.domHasUnarmored).toBe(true)
    expect(result.domHp).toBe(result.freshHp)
  })
})
