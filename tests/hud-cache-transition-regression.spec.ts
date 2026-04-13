/**
 * HUD Command-Card Cache Transition Regression
 *
 * Focused proof that continuous selection transitions do not leave the
 * command card in a stale state. The _lastCmdKey cache must correctly
 * invalidate when the player cycles through worker → townhall → barracks
 * → unfinished building → cancel → death → empty selection.
 *
 * This gap was chosen because a stale HUD can make internally correct
 * game state look broken to the player, directly affecting M4 control
 * fairness and M6 smoke readability.
 */
import { test, expect, type Page } from '@playwright/test'

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
    // Procedural fallback is valid for these contract tests.
  }
  await page.waitForTimeout(300)
}

/** Read the current command card state from DOM */
function readCommandCardJS() {
  const g = (window as any).__war3Game
  const buttons = [...document.querySelectorAll('#command-card button')]
  const slots = [...document.querySelectorAll('#command-card .cmd-slot')]
  const labels = buttons.map((b: any) => b.querySelector('.btn-label')?.textContent?.trim() ?? '')
  const disabledReasons = buttons.map((b: any) => b.dataset.disabledReason ?? '')
  const disabledStates = buttons.map((b: any) => b.disabled)
  return {
    buttonCount: buttons.length,
    slotCount: slots.length,
    labels,
    disabledReasons,
    disabledStates,
    unitName: document.getElementById('unit-name')?.textContent ?? '',
    totalSlots: buttons.length + slots.filter((s: any) => !s.querySelector || s.querySelector('button') === null).length,
  }
}

function selectAndRefresh(g: any, units: any[]) {
  g.selectionModel.clear()
  g.selectionModel.setSelection(units)
  g.updateHUD(0.016)
}

test.describe('HUD Command-Card Cache Transitions', () => {
  test.setTimeout(120000)

  test('worker → townhall → barracks transition shows correct command cards', async ({ page }) => {
    await waitForGame(page)

    const result = await page.evaluate(() => {
      const g = (window as any).__war3Game
      // Ensure resources sufficient for building
      g.resources.earn(0, 5000, 5000)

      // STEP 1: Select worker → should show build buttons (Farm, Barracks, Tower)
      const worker = g.units.find((u: any) => u.team === 0 && u.type === 'worker' && !u.isBuilding && u.hp > 0)
      if (!worker) return { error: 'no worker' }
      selectAndRefresh(g, [worker])
      const step1 = readCommandCardJS()

      // STEP 2: Select townhall → should show train buttons (Worker + Rally)
      const th = g.units.find((u: any) => u.team === 0 && u.type === 'townhall' && u.isBuilding && u.hp > 0 && u.buildProgress >= 1)
      if (!th) return { error: 'no townhall' }
      selectAndRefresh(g, [th])
      const step2 = readCommandCardJS()

      // STEP 3: Select barracks → should show train buttons (Footman + Rally)
      const bk = g.units.find((u: any) => u.team === 0 && u.type === 'barracks' && u.isBuilding && u.hp > 0 && u.buildProgress >= 1)
      if (!bk) return { error: 'no completed barracks' }
      selectAndRefresh(g, [bk])
      const step3 = readCommandCardJS()

      // STEP 4: Select worker again → should show build buttons again
      selectAndRefresh(g, [worker])
      const step4 = readCommandCardJS()

      return { step1, step2, step3, step4 }

      function selectAndRefresh(game: any, units: any[]) {
        game.selectionModel.clear()
        game.selectionModel.setSelection(units)
        game.updateHUD(0.016)
      }

      function readCommandCardJS() {
        const buttons = [...document.querySelectorAll('#command-card button')]
        const slots = [...document.querySelectorAll('#command-card .cmd-slot')]
        const labels = buttons.map((b: any) => b.querySelector('.btn-label')?.textContent?.trim() ?? '')
        const disabledReasons = buttons.map((b: any) => b.dataset.disabledReason ?? '')
        const disabledStates = buttons.map((b: any) => b.disabled)
        return {
          buttonCount: buttons.length,
          labels,
          disabledReasons,
          disabledStates,
        }
      }
    })

    expect(result.error).toBeUndefined()

    // Step 1: Worker shows build menu (Farm, Barracks, Tower)
    expect(result.step1.labels, 'worker should show build buttons').toContain('农场')
    expect(result.step1.labels, 'worker should show barracks button').toContain('兵营')
    expect(result.step1.labels, 'worker should show tower button').toContain('箭塔')
    expect(result.step1.labels, 'worker should NOT show footman').not.toContain('步兵')

    // Step 2: Townhall shows train Worker
    expect(result.step2.labels, 'townhall should show worker train').toContain('农民')
    expect(result.step2.labels, 'townhall should NOT show build buttons').not.toContain('农场')
    expect(result.step2.labels, 'townhall should show rally').toContain('集结点')

    // Step 3: Barracks shows train Footman
    expect(result.step3.labels, 'barracks should show footman train').toContain('步兵')
    expect(result.step3.labels, 'barracks should NOT show worker train').not.toContain('农民')
    expect(result.step3.labels, 'barracks should show rally').toContain('集结点')

    // Step 4: Back to worker shows build buttons again (no stale TH/BK state)
    expect(result.step4.labels, 'worker round-trip should show build buttons').toContain('农场')
    expect(result.step4.labels, 'worker round-trip should NOT show footman').not.toContain('步兵')
    expect(result.step4.labels, 'worker round-trip should NOT show 农民 train').not.toContain('农民')
  })

  test('selecting unfinished building shows cancel, completed does not', async ({ page }) => {
    await waitForGame(page)

    const result = await page.evaluate(() => {
      const g = (window as any).__war3Game
      g.resources.earn(0, 5000, 5000)

      // Spawn a building at buildProgress = 0 (under construction)
      const farm = g.spawnBuilding('farm', 0, 50, 50)
      farm.buildProgress = 0

      // Step 1: Select unfinished farm → should show cancel
      g.selectionModel.clear()
      g.selectionModel.setSelection([farm])
      g.updateHUD(0.016)
      const step1 = readCommandCardJS()

      // Step 2: Complete the farm → should no longer show cancel
      farm.buildProgress = 1
      g.updateHUD(0.016)
      const step2 = readCommandCardJS()

      return { step1, step2 }

      function readCommandCardJS() {
        const buttons = [...document.querySelectorAll('#command-card button')]
        const labels = buttons.map((b: any) => b.querySelector('.btn-label')?.textContent?.trim() ?? '')
        return { labels }
      }
    })

    // Step 1: Under-construction farm shows cancel button
    expect(result.step1.labels, 'unfinished building should show cancel').toContain('取消')

    // Step 2: Completed farm does NOT show cancel
    expect(result.step2.labels, 'completed farm should NOT show cancel').not.toContain('取消')
  })

  test('cancel construction clears command card, empty selection shows no buttons', async ({ page }) => {
    await waitForGame(page)

    const result = await page.evaluate(() => {
      const g = (window as any).__war3Game
      g.resources.earn(0, 5000, 5000)

      // Spawn an under-construction building
      const farm = g.spawnBuilding('farm', 0, 50, 50)
      farm.buildProgress = 0.3
      // Mark occupancy so cancel can release it
      if (g.occupancy && farm._occupancyTiles) {
        // Occupancy already set by spawnBuilding
      }

      // Select the farm
      g.selectionModel.clear()
      g.selectionModel.setSelection([farm])
      g.updateHUD(0.016)
      const step1 = readCommandCardJS()

      // Cancel construction
      g.cancelConstruction(farm)
      g.updateHUD(0.016)
      const step2 = readCommandCardJS()

      // Clear selection → empty
      g.selectionModel.clear()
      g.updateHUD(0.016)
      const step3 = readCommandCardJS()

      return { step1, step2, step3 }

      function readCommandCardJS() {
        const buttons = [...document.querySelectorAll('#command-card button')]
        const labels = buttons.map((b: any) => b.querySelector('.btn-label')?.textContent?.trim() ?? '')
        const unitName = document.getElementById('unit-name')?.textContent ?? ''
        return { labels, unitName, buttonCount: buttons.length }
      }
    })

    // Step 1: Selected under-construction farm shows cancel
    expect(result.step1.labels).toContain('取消')

    // Step 2: After cancel, selection was cleared → empty command card
    expect(result.step2.buttonCount, 'after cancel, command card should be empty').toBe(0)

    // Step 3: Empty selection still shows empty command card
    expect(result.step3.buttonCount, 'empty selection should have no buttons').toBe(0)
    expect(result.step3.unitName, 'empty selection should show no unit name').toContain('未选择')
  })

  test('killing selected unit clears command card without stale buttons', async ({ page }) => {
    await waitForGame(page)

    const result = await page.evaluate(() => {
      const g = (window as any).__war3Game
      g.resources.earn(0, 5000, 5000)

      // Select barracks
      const bk = g.units.find((u: any) => u.team === 0 && u.type === 'barracks' && u.isBuilding && u.hp > 0 && u.buildProgress >= 1)
      if (!bk) return { error: 'no barracks' }

      g.selectionModel.clear()
      g.selectionModel.setSelection([bk])
      g.sel.clearSelectionRings()
      g.sel.createSelectionRing(bk)
      g.updateHUD(0.016)
      const step1 = readCommandCardJS()

      // Kill the barracks
      bk.hp = 0
      g.update(0.016) // handleDeadUnits runs inside update
      g.updateHUD(0.016)
      const step2 = readCommandCardJS()

      return { step1, step2 }

      function readCommandCardJS() {
        const buttons = [...document.querySelectorAll('#command-card button')]
        const labels = buttons.map((b: any) => b.querySelector('.btn-label')?.textContent?.trim() ?? '')
        return { labels, buttonCount: buttons.length }
      }
    })

    expect(result.error).toBeUndefined()

    // Step 1: Selected barracks shows footman + rally
    expect(result.step1.labels).toContain('步兵')
    expect(result.step1.labels).toContain('集结点')

    // Step 2: After death, command card is cleared (no stale footman/rally buttons)
    expect(result.step2.buttonCount, 'after death, no stale command buttons').toBe(0)
    expect(result.step2.labels, 'after death, no stale footman button').not.toContain('步兵')
  })

  test('resource/supply change without reselection updates disabled reasons', async ({ page }) => {
    await waitForGame(page)

    const result = await page.evaluate(() => {
      const g = (window as any).__war3Game

      // Fill supply to cap
      let spawned = 0
      while (g.resources.computeSupply(0, g.units).used < g.resources.computeSupply(0, g.units).total) {
        g.spawnUnit('worker', 0, 35 + spawned, 35)
        spawned++
        if (spawned > 60) break
      }

      // Give gold but not enough for training at supply cap
      g.resources.earn(0, 5000, 5000)

      // Select barracks
      const bk = g.units.find((u: any) => u.team === 0 && u.type === 'barracks' && u.isBuilding && u.hp > 0 && u.buildProgress >= 1)
      if (!bk) return { error: 'no barracks' }

      g.selectionModel.clear()
      g.selectionModel.setSelection([bk])
      g.updateHUD(0.016)
      const step1 = readCommandCardJS()

      // Complete a farm to increase supply
      const farm = g.spawnBuilding('farm', 0, 48, 48)
      farm.buildProgress = 1
      g.updateHUD(0.016)
      const step2 = readCommandCardJS()

      // Drain gold to 0 — footman should now show gold reason
      const r = g.resources.get(0)
      g.resources.spend(0, { gold: r.gold, lumber: 0 })
      g.updateHUD(0.016)
      const step3 = readCommandCardJS()

      return { step1, step2, step3 }

      function readCommandCardJS() {
        const buttons = [...document.querySelectorAll('#command-card button')]
        const labels = buttons.map((b: any) => b.querySelector('.btn-label')?.textContent?.trim() ?? '')
        const disabledReasons = buttons.map((b: any) => b.dataset.disabledReason ?? '')
        const disabledStates = buttons.map((b: any) => b.disabled)
        return { labels, disabledReasons, disabledStates }
      }
    })

    expect(result.error).toBeUndefined()

    // Step 1: Supply-capped → footman disabled with supply reason
    const footmanIdx1 = result.step1.labels.indexOf('步兵')
    expect(footmanIdx1, 'footman button should exist at step 1').toBeGreaterThanOrEqual(0)
    expect(result.step1.disabledStates[footmanIdx1], 'footman should be disabled at supply cap').toBe(true)
    expect(result.step1.disabledReasons[footmanIdx1], 'footman reason should mention supply').toContain('人口')

    // Step 2: Farm completed → supply increased → footman enabled
    const footmanIdx2 = result.step2.labels.indexOf('步兵')
    expect(footmanIdx2, 'footman button should exist at step 2').toBeGreaterThanOrEqual(0)
    expect(result.step2.disabledStates[footmanIdx2], 'footman should be enabled after supply increase').toBe(false)
    expect(result.step2.disabledReasons[footmanIdx2], 'footman reason should be empty when enabled').toBe('')

    // Step 3: Gold drained → footman disabled with gold reason (not stale supply reason)
    const footmanIdx3 = result.step3.labels.indexOf('步兵')
    expect(footmanIdx3, 'footman button should exist at step 3').toBeGreaterThanOrEqual(0)
    expect(result.step3.disabledStates[footmanIdx3], 'footman should be disabled with no gold').toBe(true)
    expect(result.step3.disabledReasons[footmanIdx3], 'footman reason should show gold, not stale supply').toContain('黄金不足')
  })
})
