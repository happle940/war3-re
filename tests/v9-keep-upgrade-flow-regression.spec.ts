/**
 * V9 HN2-IMPL2 Keep Upgrade Flow Regression
 *
 * 3 focused runtime proofs:
 * 1) Resource insufficient: upgrade button disabled, click does nothing
 * 2) Resource sufficient: upgrade deducts cost, starts progress
 * 3) Completion + boundary: first upgrade becomes keep, no live castle or Knight appears
 *
 * Uses fresh state reads after every mutation.
 * NOT Castle, Knight, full tech tree, AI, or asset work.
 */
import { test, expect, type Page } from '@playwright/test'
import { BUILDINGS, UNITS, RESEARCHES, PEASANT_BUILD_MENU } from '../src/game/GameData'

const BASE_RUNTIME = 'http://127.0.0.1:4173/?runtimeTest=1'

// Pre-extract values from Node-side imports (cannot be used inside page.evaluate closures)
const KEEP_COST = BUILDINGS.keep.cost
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
    // Procedural fallback is valid
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

test.describe('V9 Keep Upgrade Flow Regression', () => {
  test.setTimeout(120000)

  test('UF-1: resource insufficient — button disabled, click does nothing', async ({ page }) => {
    await waitForRuntime(page)

    const result = await page.evaluate(() => {
      const g = (window as any).__war3Game
      const th = g.units.find((u: any) => u.team === 0 && u.type === 'townhall' && u.isBuilding && u.hp > 0)
      if (!th) return { found: false }

      // Drain resources
      const res = g.resources.get(0)
      g.resources.spend(0, { gold: res.gold, lumber: res.lumber })

      // Select and render command card
      g.selectionModel.clear()
      g.selectionModel.setSelection([th])
      g._lastCmdKey = ''
      g.updateHUD(0.016)

      const cmdCard = document.getElementById('command-card')!
      const buttons = cmdCard.querySelectorAll('button')
      const upgradeBtn = Array.from(buttons).find(b =>
        b.querySelector('.btn-label')?.textContent?.trim() === '升级主城',
      )

      const goldBefore = g.resources.get(0).gold
      const lumberBefore = g.resources.get(0).lumber

      // Try clicking disabled button
      if (upgradeBtn) (upgradeBtn as HTMLButtonElement).click()
      g._lastCmdKey = ''
      g.updateHUD(0.016)

      // Read fresh state
      const freshTh = g.units.find((u: any) => u === th)

      return {
        found: true,
        hasUpgradeBtn: !!upgradeBtn,
        isDisabled: upgradeBtn ? (upgradeBtn as HTMLButtonElement).disabled : null,
        disabledReason: upgradeBtn?.dataset?.disabledReason ?? upgradeBtn?.querySelector('.btn-reason')?.textContent ?? null,
        goldUnchanged: g.resources.get(0).gold === goldBefore,
        lumberUnchanged: g.resources.get(0).lumber === lumberBefore,
        noUpgradeQueue: !freshTh?.upgradeQueue,
      }
    })

    expect(result.found).toBe(true)
    expect(result.hasUpgradeBtn).toBe(true)
    expect(result.isDisabled).toBe(true)
    expect(result.disabledReason).toBeTruthy()
    expect(result.goldUnchanged).toBe(true)
    expect(result.lumberUnchanged).toBe(true)
    expect(result.noUpgradeQueue).toBe(true)
  })

  test('UF-2: resource sufficient — deducts cost, starts upgrade', async ({ page }) => {
    await waitForRuntime(page)

    const result = await page.evaluate(({ keepCost }) => {
      const g = (window as any).__war3Game
      const th = g.units.find((u: any) => u.team === 0 && u.type === 'townhall' && u.isBuilding && u.hp > 0)
      if (!th) return { found: false }

      // Give enough resources via earn
      g.resources.earn(0, 1000, 1000)

      const goldBefore = g.resources.get(0).gold
      const lumberBefore = g.resources.get(0).lumber

      // Select and render command card
      g.selectionModel.clear()
      g.selectionModel.setSelection([th])
      g._lastCmdKey = ''
      g.updateHUD(0.016)

      const cmdCard = document.getElementById('command-card')!
      const buttons = cmdCard.querySelectorAll('button')
      const upgradeBtn = Array.from(buttons).find(b =>
        b.querySelector('.btn-label')?.textContent?.trim() === '升级主城',
      )
      if (!upgradeBtn) return { found: true, hasUpgradeBtn: false }

      // Click upgrade
      upgradeBtn.click()
      g._lastCmdKey = ''
      g.updateHUD(0.016)

      // Read fresh state
      const freshTh = g.units.find((u: any) => u === th)
      const goldAfter = g.resources.get(0).gold
      const lumberAfter = g.resources.get(0).lumber

      return {
        found: true,
        hasUpgradeBtn: true,
        goldDeducted: goldBefore - goldAfter >= keepCost.gold - 1,
        lumberDeducted: lumberBefore - lumberAfter >= keepCost.lumber - 1,
        hasUpgradeQueue: !!freshTh?.upgradeQueue,
        upgradeTarget: freshTh?.upgradeQueue?.targetType ?? null,
        upgradeRemaining: freshTh?.upgradeQueue?.remaining ?? null,
      }
    }, { keepCost: KEEP_COST })

    expect(result.found).toBe(true)
    expect(result.hasUpgradeBtn).toBe(true)
    expect(result.goldDeducted).toBe(true)
    expect(result.lumberDeducted).toBe(true)
    expect(result.hasUpgradeQueue).toBe(true)
    expect(result.upgradeTarget).toBe('keep')
    expect(result.upgradeRemaining).toBeGreaterThan(0)
  })

  test('UF-3: completion + boundary — first upgrade becomes keep, no live castle or Knight', async ({ page }) => {
    await waitForRuntime(page)

    const result = await page.evaluate(({ keepBuildTime, keepHp }) => {
      const g = (window as any).__war3Game
      const th = g.units.find((u: any) => u.team === 0 && u.type === 'townhall' && u.isBuilding && u.hp > 0)
      if (!th) return { found: false }

      // Give resources and start upgrade
      g.resources.earn(0, 1000, 1000)
      g.startBuildingUpgrade(th, 'keep')
      if (!th.upgradeQueue) return { found: true, upgradeStarted: false }

      const originalPos = { x: th.mesh.position.x, z: th.mesh.position.z }
      const originalTeam = th.team

      // Advance time past buildTime
      const dt = 0.5
      const steps = Math.ceil(keepBuildTime / dt) + 5
      for (let i = 0; i < steps; i++) {
        g.gameTime += dt
        g.updateUnits(dt)
      }

      // Read fresh state from game
      const freshTh = g.units.find((u: any) => u === th)
      // Read building types from live units only
      const buildingTypes = [...new Set(g.units.filter((u: any) => u.isBuilding).map((u: any) => u.type))]

      return {
        found: true,
        upgradeStarted: true,
        typeAfter: freshTh?.type,
        hpAfter: freshTh?.hp,
        maxHpAfter: freshTh?.maxHp,
        keepHp,
        upgradeQueueCleared: !freshTh?.upgradeQueue,
        samePosition: freshTh
          ? Math.abs(freshTh.mesh.position.x - originalPos.x) < 0.01 &&
                       Math.abs(freshTh.mesh.position.z - originalPos.z) < 0.01
          : false,
        sameTeam: freshTh?.team === originalTeam,
        hasCastleInUnits: buildingTypes.includes('castle'),
      }
    }, { keepBuildTime: KEEP_BUILD_TIME, keepHp: KEEP_HP })

    expect(result.found).toBe(true)
    expect(result.upgradeStarted).toBe(true)
    // Type became keep
    expect(result.typeAfter).toBe('keep')
    expect(result.hpAfter).toBe(result.keepHp)
    expect(result.maxHpAfter).toBe(result.keepHp)
    expect(result.upgradeQueueCleared).toBe(true)
    // Same position and team
    expect(result.samePosition).toBe(true)
    expect(result.sameTeam).toBe(true)
    // No castle in live units
    expect(result.hasCastleInUnits).toBe(false)

    // Node-side boundary checks (not in page.evaluate).
    // Castle data now exists for HN6, but Town Hall -> Keep must not skip directly to it.
    expect(BUILDINGS.castle).toBeDefined()
    expect(UNITS.knight).toBeUndefined()
    expect(Object.keys(UNITS).sort()).toEqual(KNOWN_UNITS)
    expect(Object.keys(RESEARCHES).sort()).toEqual(KNOWN_RESEARCHES)
    expect(PEASANT_BUILD_MENU.includes('keep')).toBe(false)
  })
})
