/**
 * V9 HN6-IMPL2 Keep -> Castle upgrade runtime proof.
 *
 * Proves:
 * 1. Keep shows the Castle upgrade button and blocks it when resources are insufficient.
 * 2. With resources, Keep starts an upgrade queue targeting Castle and spends Castle cost.
 * 3. Upgrade completion turns the same building into Castle and keeps worker/rally surface.
 *    Knight remains a Barracks training surface, not a Castle button.
 *
 * Not AI Castle, full T3 unlock, heroes, items, air, or assets.
 */
import { test, expect, type Page } from '@playwright/test'
import { BUILDINGS, UNITS } from '../src/game/GameData'

const BASE_RUNTIME = 'http://127.0.0.1:4173/?runtimeTest=1'
const KEEP_BUILD_TIME = BUILDINGS.keep.buildTime
const CASTLE_COST = BUILDINGS.castle.cost
const CASTLE_BUILD_TIME = BUILDINGS.castle.buildTime
const CASTLE_HP = BUILDINGS.castle.hp

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

test.describe('V9 HN6 Keep -> Castle upgrade runtime', () => {
  test.setTimeout(120000)

  test('KC-1: upgraded Keep exposes Castle upgrade and blocks it without resources', async ({ page }) => {
    await waitForRuntime(page)

    const result = await page.evaluate(({ keepBuildTime }) => {
      const g = (window as any).__war3Game
      const th = g.units.find((u: any) => u.team === 0 && u.type === 'townhall' && u.isBuilding && u.hp > 0)
      if (!th) return { found: false }

      g.resources.earn(0, 2000, 2000)
      g.startBuildingUpgrade(th, 'keep')
      const dt = 0.5
      for (let i = 0; i < Math.ceil(keepBuildTime / dt) + 5; i++) {
        g.gameTime += dt
        g.updateUnits(dt)
      }

      const keep = g.units.find((u: any) => u === th)
      if (keep?.type !== 'keep') return { found: true, isKeep: false }

      const res = g.resources.get(0)
      g.resources.spend(0, { gold: res.gold, lumber: res.lumber })

      g.selectionModel.clear()
      g.selectionModel.setSelection([keep])
      g._lastCmdKey = ''
      g.updateHUD(0.016)

      const cmdCard = document.getElementById('command-card')!
      const buttons = Array.from(cmdCard.querySelectorAll('button'))
      const upgradeBtn = buttons.find(b => b.querySelector('.btn-label')?.textContent?.trim() === '升级主城')

      if (upgradeBtn) (upgradeBtn as HTMLButtonElement).click()
      g._lastCmdKey = ''
      g.updateHUD(0.016)

      return {
        found: true,
        isKeep: true,
        hasUpgradeBtn: !!upgradeBtn,
        isDisabled: upgradeBtn ? (upgradeBtn as HTMLButtonElement).disabled : null,
        disabledReason: upgradeBtn?.dataset.disabledReason ?? '',
        noUpgradeQueue: !keep.upgradeQueue,
      }
    }, { keepBuildTime: KEEP_BUILD_TIME })

    expect(result.found).toBe(true)
    expect(result.isKeep).toBe(true)
    expect(result.hasUpgradeBtn).toBe(true)
    expect(result.isDisabled).toBe(true)
    expect(result.disabledReason).toBeTruthy()
    expect(result.noUpgradeQueue).toBe(true)
  })

  test('KC-2: resource sufficient Keep upgrade spends Castle cost and targets castle', async ({ page }) => {
    await waitForRuntime(page)

    const result = await page.evaluate(({ keepBuildTime, castleCost }) => {
      const g = (window as any).__war3Game
      const th = g.units.find((u: any) => u.team === 0 && u.type === 'townhall' && u.isBuilding && u.hp > 0)
      if (!th) return { found: false }

      g.resources.earn(0, 2500, 2500)
      g.startBuildingUpgrade(th, 'keep')
      const dt = 0.5
      for (let i = 0; i < Math.ceil(keepBuildTime / dt) + 5; i++) {
        g.gameTime += dt
        g.updateUnits(dt)
      }

      const keep = g.units.find((u: any) => u === th)
      if (keep?.type !== 'keep') return { found: true, isKeep: false }

      const goldBefore = g.resources.get(0).gold
      const lumberBefore = g.resources.get(0).lumber

      g.selectionModel.clear()
      g.selectionModel.setSelection([keep])
      g._lastCmdKey = ''
      g.updateHUD(0.016)

      const cmdCard = document.getElementById('command-card')!
      const upgradeBtn = Array.from(cmdCard.querySelectorAll('button'))
        .find(b => b.querySelector('.btn-label')?.textContent?.trim() === '升级主城')
      if (!upgradeBtn) return { found: true, isKeep: true, hasUpgradeBtn: false }

      upgradeBtn.click()
      g._lastCmdKey = ''
      g.updateHUD(0.016)

      return {
        found: true,
        isKeep: true,
        hasUpgradeBtn: true,
        goldDeducted: goldBefore - g.resources.get(0).gold >= castleCost.gold - 1,
        lumberDeducted: lumberBefore - g.resources.get(0).lumber >= castleCost.lumber - 1,
        upgradeTarget: keep.upgradeQueue?.targetType ?? null,
        upgradeRemaining: keep.upgradeQueue?.remaining ?? 0,
      }
    }, { keepBuildTime: KEEP_BUILD_TIME, castleCost: CASTLE_COST })

    expect(result.found).toBe(true)
    expect(result.isKeep).toBe(true)
    expect(result.hasUpgradeBtn).toBe(true)
    expect(result.goldDeducted).toBe(true)
    expect(result.lumberDeducted).toBe(true)
    expect(result.upgradeTarget).toBe('castle')
    expect(result.upgradeRemaining).toBeGreaterThan(0)
  })

  test('KC-3: completion becomes Castle, keeps worker/rally, and does not expose Knight on Castle', async ({ page }) => {
    await waitForRuntime(page)

    const result = await page.evaluate(({ keepBuildTime, castleBuildTime, castleHp }) => {
      const g = (window as any).__war3Game
      const th = g.units.find((u: any) => u.team === 0 && u.type === 'townhall' && u.isBuilding && u.hp > 0)
      if (!th) return { found: false }

      g.resources.earn(0, 4000, 4000)
      g.startBuildingUpgrade(th, 'keep')
      let dt = 0.5
      for (let i = 0; i < Math.ceil(keepBuildTime / dt) + 5; i++) {
        g.gameTime += dt
        g.updateUnits(dt)
      }

      const keep = g.units.find((u: any) => u === th)
      if (keep?.type !== 'keep') return { found: true, isKeep: false }

      const originalPos = { x: keep.mesh.position.x, z: keep.mesh.position.z }
      const originalTeam = keep.team
      g.startBuildingUpgrade(keep, 'castle')
      if (!keep.upgradeQueue) return { found: true, isKeep: true, castleStarted: false }

      dt = 0.5
      for (let i = 0; i < Math.ceil(castleBuildTime / dt) + 5; i++) {
        g.gameTime += dt
        g.updateUnits(dt)
      }

      const castle = g.units.find((u: any) => u === th)
      const matchBeforeCheck = typeof g.getMatchResult === 'function' ? g.getMatchResult() : null
      const liveMainHalls = g.units
        .filter((u: any) => u.team === 0 && u.isBuilding && u.hp > 0 &&
          ['townhall', 'keep', 'castle'].includes(u.type))
        .map((u: any) => ({ type: u.type, team: u.team, hp: u.hp, isBuilding: u.isBuilding }))
      if (typeof g.checkGameOver === 'function') g.checkGameOver()

      g.selectionModel.clear()
      g.selectionModel.setSelection([castle])
      g._lastCmdKey = ''
      g.updateHUD(0.016)

      const cmdCard = document.getElementById('command-card')!
      const labels = Array.from(cmdCard.querySelectorAll('button'))
        .map(b => b.querySelector('.btn-label')?.textContent?.trim() ?? '')

      return {
        found: true,
        isKeep: true,
        castleStarted: true,
        typeAfter: castle?.type,
        hpAfter: castle?.hp,
        maxHpAfter: castle?.maxHp,
        castleHp,
        upgradeQueueCleared: !castle?.upgradeQueue,
        samePosition: castle
          ? Math.abs(castle.mesh.position.x - originalPos.x) < 0.01 &&
            Math.abs(castle.mesh.position.z - originalPos.z) < 0.01
          : false,
        sameTeam: castle?.team === originalTeam,
        hasWorkerBtn: labels.includes('农民'),
        hasRallyBtn: labels.includes('集结点'),
        hasUpgradeBtn: labels.includes('升级主城'),
        hasKnightBtn: labels.includes('骑士'),
        matchBeforeCheck,
        matchResult: typeof g.getMatchResult === 'function' ? g.getMatchResult() : null,
        liveMainHalls,
      }
    }, { keepBuildTime: KEEP_BUILD_TIME, castleBuildTime: CASTLE_BUILD_TIME, castleHp: CASTLE_HP })

    expect(result.found).toBe(true)
    expect(result.isKeep).toBe(true)
    expect(result.castleStarted).toBe(true)
    expect(result.typeAfter).toBe('castle')
    expect(result.hpAfter).toBe(result.castleHp)
    expect(result.maxHpAfter).toBe(result.castleHp)
    expect(result.upgradeQueueCleared).toBe(true)
    expect(result.samePosition).toBe(true)
    expect(result.sameTeam).toBe(true)
    expect(result.hasWorkerBtn).toBe(true)
    expect(result.hasRallyBtn).toBe(true)
    expect(result.hasUpgradeBtn).toBe(false)
    expect(result.hasKnightBtn).toBe(false)
    expect(result.matchResult, JSON.stringify(result)).toBe(null)

    expect(UNITS.knight).toBeDefined()
    expect(BUILDINGS.castle.trains).not.toContain('knight')
  })
})
