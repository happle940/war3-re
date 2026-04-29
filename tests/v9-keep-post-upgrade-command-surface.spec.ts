/**
 * V9 HN2-IMPL3 Keep Post-Upgrade Command Surface
 *
 * After Town Hall upgrades to Keep, selecting it shows worker training,
 * rally point, and the current Castle upgrade surface. Knight is a tech-gated
 * Barracks unit seed, not a direct Keep/Castle command-card route.
 */
import { test, expect, type Page } from '@playwright/test'
import { BUILDINGS, UNITS, RESEARCHES, PEASANT_BUILD_MENU } from '../src/game/GameData'

const BASE_RUNTIME = 'http://127.0.0.1:4173/?runtimeTest=1'
const KEEP_BUILD_TIME = BUILDINGS.keep.buildTime
const KEEP_HP = BUILDINGS.keep.hp
const KNOWN_UNITS = Object.keys(UNITS).sort()
const KNOWN_RESEARCHES = Object.keys(RESEARCHES).sort()

async function waitForRuntime(page: Page) {
  const consoleErrors: string[] = []
  page.on('console', (msg) => {
    if (msg.type() === 'error') consoleErrors.push(msg.text())
  })
  ;(page as any).__consoleErrors = consoleErrors
  await page.goto(BASE_RUNTIME, { waitUntil: 'domcontentloaded' })
  await page.waitForFunction(() => {
    const game = (window as any).__war3Game
    if (!game || !game.renderer) return false
    if (!Array.isArray(game.units) || game.units.length === 0) return false
    return game.renderer.domElement.width > 0
  }, { timeout: 15000 })
  try {
    await page.waitForFunction(() => {
      const status = document.getElementById('map-status')?.textContent ?? ''
      return !status.includes('正在加载')
    }, { timeout: 15000 })
  } catch { /* procedural fallback */ }
  await page.evaluate(() => {
    const g = (window as any).__war3Game
    if (g?.ai) {
      if (typeof g.ai.reset === 'function') g.ai.reset()
      g.ai.update = () => {}
    }
  })
  await page.waitForTimeout(300)
}

test.describe('V9 Keep Post-Upgrade Command Surface', () => {
  test.setTimeout(120000)

  test('PC-1: upgraded Keep shows worker + rally + Castle upgrade surface', async ({ page }) => {
    await waitForRuntime(page)

    const result = await page.evaluate(({ keepBuildTime, keepHp }) => {
      const g = (window as any).__war3Game
      const th = g.units.find((u: any) => u.team === 0 && u.type === 'townhall' && u.isBuilding && u.hp > 0)
      if (!th) return { found: false }

      // Give resources, start upgrade
      g.resources.earn(0, 1000, 1000)
      g.startBuildingUpgrade(th, 'keep')
      if (!th.upgradeQueue) return { found: true, upgradeStarted: false }

      // Advance past build time
      const dt = 0.5
      const steps = Math.ceil(keepBuildTime / dt) + 5
      for (let i = 0; i < steps; i++) {
        g.gameTime += dt
        g.updateUnits(dt)
      }

      // Read fresh state
      const freshKeep = g.units.find((u: any) => u === th)
      if (freshKeep?.type !== 'keep') return { found: true, upgradeStarted: true, isKeep: false }

      // Select and render command card
      g.selectionModel.clear()
      g.selectionModel.setSelection([freshKeep])
      g._lastCmdKey = ''
      g.updateHUD(0.016)

      const cmdCard = document.getElementById('command-card')!
      const buttons = cmdCard.querySelectorAll('button')
      const labels = Array.from(buttons).map(b => b.querySelector('.btn-label')?.textContent?.trim() ?? '')

      return {
        found: true,
        upgradeStarted: true,
        isKeep: true,
        typeIsKeep: freshKeep.type === 'keep',
        hasWorkerBtn: labels.includes('农民'),
        hasRallyBtn: labels.includes('集结点'),
        hasUpgradeBtn: labels.includes('升级主城'),
      }
    }, { keepBuildTime: KEEP_BUILD_TIME, keepHp: KEEP_HP })

    expect(result.found).toBe(true)
    expect(result.isKeep).toBe(true)
    expect(result.hasWorkerBtn).toBe(true)
    expect(result.hasRallyBtn).toBe(true)
    expect(result.hasUpgradeBtn).toBe(true)
  })

  test('PC-2: clicking worker from Keep starts training', async ({ page }) => {
    await waitForRuntime(page)

    const result = await page.evaluate(({ keepBuildTime }) => {
      const g = (window as any).__war3Game
      const th = g.units.find((u: any) => u.team === 0 && u.type === 'townhall' && u.isBuilding && u.hp > 0)
      if (!th) return { found: false }

      // Upgrade to Keep
      g.resources.earn(0, 2000, 2000)
      g.startBuildingUpgrade(th, 'keep')
      if (!th.upgradeQueue) return { found: true, upgradeStarted: false }

      const dt = 0.5
      const steps = Math.ceil(keepBuildTime / dt) + 5
      for (let i = 0; i < steps; i++) {
        g.gameTime += dt
        g.updateUnits(dt)
      }

      const freshKeep = g.units.find((u: any) => u === th)
      if (freshKeep?.type !== 'keep') return { found: true, isKeep: false }

      // Select and render
      g.selectionModel.clear()
      g.selectionModel.setSelection([freshKeep])
      g._lastCmdKey = ''
      g.updateHUD(0.016)

      const goldBefore = g.resources.get(0).gold

      // Click worker button
      const cmdCard = document.getElementById('command-card')!
      const buttons = cmdCard.querySelectorAll('button')
      const workerBtn = Array.from(buttons).find(b =>
        b.querySelector('.btn-label')?.textContent?.trim() === '农民',
      )
      if (!workerBtn) return { found: true, isKeep: true, hasWorkerBtn: false }

      workerBtn.click()
      g._lastCmdKey = ''
      g.updateHUD(0.016)

      // Read fresh state
      const afterKeep = g.units.find((u: any) => u === th)

      return {
        found: true,
        isKeep: true,
        hasWorkerBtn: true,
        goldDeducted: g.resources.get(0).gold < goldBefore,
        hasTrainingQueue: afterKeep?.trainingQueue?.length > 0,
        trainingType: afterKeep?.trainingQueue?.[0]?.type ?? null,
      }
    }, { keepBuildTime: KEEP_BUILD_TIME })

    expect(result.found).toBe(true)
    expect(result.isKeep).toBe(true)
    expect(result.hasWorkerBtn).toBe(true)
    expect(result.goldDeducted).toBe(true)
    expect(result.hasTrainingQueue).toBe(true)
    expect(result.trainingType).toBe('worker')
  })

  test('PC-3: boundary — Castle/Knight data exists, but no direct build-menu shortcut', async ({ page }) => {
    await waitForRuntime(page)

    // Node-side boundary checks
    expect(BUILDINGS.castle).toBeDefined()
    expect(BUILDINGS.keep.upgradeTo).toBe('castle')
    expect(UNITS.knight).toBeDefined()
    expect(UNITS.knight.techPrereqs).toEqual(['castle', 'blacksmith', 'lumber_mill'])
    expect(BUILDINGS.barracks.trains).toContain('knight')
    expect(Object.keys(UNITS).sort()).toEqual(KNOWN_UNITS)
    expect(Object.keys(RESEARCHES).sort()).toEqual(KNOWN_RESEARCHES)
    expect(PEASANT_BUILD_MENU.includes('keep')).toBe(false)
    expect(PEASANT_BUILD_MENU.includes('castle')).toBe(false)
    // Keep/Castle command surfaces remain town-hall-line only.
    expect(BUILDINGS.keep.trains).toEqual(['worker'])
    expect(BUILDINGS.castle.trains).toEqual(['worker'])
  })
})
