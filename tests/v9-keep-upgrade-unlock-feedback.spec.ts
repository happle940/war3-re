/**
 * V9 HN2-UX9 Keep Upgrade and T2 Unlock Feedback
 *
 * Proves player-visible feedback for Keep upgrade and T2 unlock:
 * 1. Upgrade-in-progress shows "升级主城…" with remaining time, no duplicate upgrade button
 * 2. Without Keep, worker command card shows Workshop/Arcane Sanctum disabled with 主城 reason
 * 3. With Keep, Workshop/Arcane Sanctum become available
 * 4. Keep still trains worker, no Castle/Knight/new content
 *
 * Uses fresh state reads after every mutation.
 */
import { test, expect, type Page } from '@playwright/test'
import {
  BUILDINGS,
  UNITS,
  PEASANT_BUILD_MENU,
} from '../src/game/GameData'

const BASE_RUNTIME = 'http://127.0.0.1:4173/?runtimeTest=1'

const KEEP_BUILD_TIME = BUILDINGS.keep.buildTime

async function waitForRuntime(page: Page) {
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

test.describe('V9 Keep Upgrade and T2 Unlock Feedback', () => {
  test.setTimeout(120000)

  test('UF-1: upgrading Town Hall shows upgrade-in-progress feedback with no duplicate upgrade button', async ({ page }) => {
    await waitForRuntime(page)

    const result = await page.evaluate(({ keepBuildTime }) => {
      const g = (window as any).__war3Game
      const th = g.units.find((u: any) => u.team === 0 && u.type === 'townhall' && u.isBuilding && u.hp > 0)
      if (!th) return { found: false }

      // Start upgrade
      g.resources.earn(0, 1000, 1000)
      g.startBuildingUpgrade(th, 'keep')

      // Read fresh state
      const freshTh = g.units.find((u: any) => u === th)
      if (!freshTh?.upgradeQueue) return { found: true, upgradeStarted: false }

      // Select and render command card
      g.selectionModel.clear()
      g.selectionModel.setSelection([freshTh])
      g._lastCmdKey = ''
      g.updateHUD(0.016)

      const cmdCard = document.getElementById('command-card')!
      const buttons = Array.from(cmdCard.querySelectorAll('button'))

      // Find upgrade-in-progress button
      const progressBtn = buttons.find(b =>
        b.querySelector('.btn-label')?.textContent?.trim()?.includes('升级主城…'),
      )

      // Find any "升级主城" clickable button (should NOT exist)
      const upgradeBtn = buttons.find(b => {
        const label = b.querySelector('.btn-label')?.textContent?.trim() ?? ''
        return label === '升级主城'
      })

      // Check for duplicate upgrade triggers
      const progressLabel = progressBtn?.querySelector('.btn-label')?.textContent?.trim() ?? ''
      const progressCost = progressBtn?.querySelector('.btn-cost')?.textContent?.trim() ?? ''
      const progressReason = progressBtn?.dataset.disabledReason
        ?? progressBtn?.querySelector('.btn-reason')?.textContent
        ?? ''

      return {
        found: true,
        upgradeStarted: true,
        hasProgressBtn: !!progressBtn,
        progressBtnDisabled: progressBtn ? (progressBtn as HTMLButtonElement).disabled : null,
        progressLabel,
        progressCost,
        progressReason,
        hasUpgradeBtn: !!upgradeBtn,
        upgradeQueueActive: !!freshTh.upgradeQueue,
        upgradeRemaining: freshTh.upgradeQueue.remaining,
        keepBuildTime,
      }
    }, { keepBuildTime: KEEP_BUILD_TIME })

    expect(result.found).toBe(true)
    expect(result.upgradeStarted).toBe(true)
    // Upgrade-in-progress button exists
    expect(result.hasProgressBtn).toBe(true)
    expect(result.progressBtnDisabled).toBe(true)
    // Label shows upgrading status with Chinese
    expect(result.progressLabel).toContain('升级主城…')
    // Cost shows remaining seconds
    expect(result.progressCost).toContain('秒')
    // Reason mentions upgrading
    expect(result.progressReason).toContain('正在升级')
    // No clickable "升级主城" button
    expect(result.hasUpgradeBtn).toBe(false)
    // Upgrade queue is active
    expect(result.upgradeQueueActive).toBe(true)
  })

  test('UF-2: during upgrade, advancing time updates progress display', async ({ page }) => {
    await waitForRuntime(page)

    const result = await page.evaluate(({ keepBuildTime }) => {
      const g = (window as any).__war3Game
      const th = g.units.find((u: any) => u.team === 0 && u.type === 'townhall' && u.isBuilding && u.hp > 0)
      if (!th) return { found: false }

      g.resources.earn(0, 1000, 1000)
      g.startBuildingUpgrade(th, 'keep')

      // Select and get initial display
      g.selectionModel.clear()
      g.selectionModel.setSelection([th])
      g._lastCmdKey = ''
      g.updateHUD(0.016)

      const cmdCard = document.getElementById('command-card')!
      const getProgressCost = () => {
        const btns = Array.from(cmdCard.querySelectorAll('button'))
        const btn = btns.find(b =>
          b.querySelector('.btn-label')?.textContent?.trim()?.includes('升级主城…'),
        )
        return btn?.querySelector('.btn-cost')?.textContent?.trim() ?? ''
      }

      const costBefore = getProgressCost()
      const secondsBefore = Number.parseInt(costBefore, 10)

      // Advance 10 seconds
      const dt = 0.5
      for (let i = 0; i < 20; i++) {
        g.gameTime += dt
        g.updateUnits(dt)
      }

      // Force HUD refresh
      g._lastCmdKey = ''
      g.updateHUD(0.016)

      const costAfter = getProgressCost()
      const secondsAfter = Number.parseInt(costAfter, 10)

      // Read fresh state
      const freshTh = g.units.find((u: any) => u === th)

      return {
        found: true,
        costBefore,
        costAfter,
        secondsBefore,
        secondsAfter,
        stillUpgrading: !!freshTh?.upgradeQueue,
        remainingBefore: keepBuildTime,
      }
    }, { keepBuildTime: KEEP_BUILD_TIME })

    expect(result.found).toBe(true)
    // Both show seconds
    expect(result.costBefore).toContain('秒')
    expect(result.costAfter).toContain('秒')
    expect(Number.isFinite(result.secondsBefore)).toBe(true)
    expect(Number.isFinite(result.secondsAfter)).toBe(true)
    expect(result.secondsAfter).toBeLessThan(result.secondsBefore)
    // Still upgrading (only 10 of 45 seconds passed)
    expect(result.stillUpgrading).toBe(true)
  })

  test('UF-3: without Keep, worker command card shows Workshop and Arcane Sanctum disabled with 主城 reason', async ({ page }) => {
    await waitForRuntime(page)

    const result = await page.evaluate(() => {
      const g = (window as any).__war3Game

      // Ensure no Keep exists
      const keeps = g.units.filter(
        (u: any) => u.type === 'keep' && u.team === 0 && u.isBuilding && u.hp > 0,
      )
      for (const k of keeps) k.hp = 0
      g.handleDeadUnits()

      // Select a worker
      const worker = g.units.find((u: any) => u.team === 0 && u.type === 'worker' && !u.isBuilding && u.hp > 0)
      if (!worker) return { found: false }

      g.selectionModel.clear()
      g.selectionModel.setSelection([worker])
      g._lastCmdKey = ''
      g.updateHUD(0.016)

      const cmdCard = document.getElementById('command-card')!
      const buttons = Array.from(cmdCard.querySelectorAll('button'))
      const byLabel = (label: string) => buttons.find(b =>
        b.querySelector('.btn-label')?.textContent?.trim() === label)

      const workshopBtn = byLabel('车间')
      const sanctumBtn = byLabel('奥秘圣殿')

      return {
        found: true,
        hasWorkshopBtn: !!workshopBtn,
        hasSanctumBtn: !!sanctumBtn,
        workshopDisabled: workshopBtn ? (workshopBtn as HTMLButtonElement).disabled : null,
        sanctumDisabled: sanctumBtn ? (sanctumBtn as HTMLButtonElement).disabled : null,
        workshopReason: workshopBtn?.dataset.disabledReason
          ?? workshopBtn?.querySelector('.btn-reason')?.textContent
          ?? '',
        sanctumReason: sanctumBtn?.dataset.disabledReason
          ?? sanctumBtn?.querySelector('.btn-reason')?.textContent
          ?? '',
      }
    })

    expect(result.found).toBe(true)
    expect(result.hasWorkshopBtn).toBe(true)
    expect(result.hasSanctumBtn).toBe(true)
    expect(result.workshopDisabled).toBe(true)
    expect(result.sanctumDisabled).toBe(true)
    expect(result.workshopReason).toContain('主城')
    expect(result.sanctumReason).toContain('主城')
  })

  test('UF-4: with completed Keep, Workshop and Arcane Sanctum become available', async ({ page }) => {
    await waitForRuntime(page)

    const result = await page.evaluate(() => {
      const g = (window as any).__war3Game

      // Complete a Keep upgrade
      const th = g.units.find((u: any) => u.team === 0 && u.type === 'townhall' && u.isBuilding && u.hp > 0)
      if (!th) return { found: false }

      g.resources.earn(0, 1000, 1000)
      g.startBuildingUpgrade(th, 'keep')

      // Fast-forward to completion
      const dt = 0.5
      for (let i = 0; i < 120; i++) {
        g.gameTime += dt
        g.updateUnits(dt)
      }

      // Read fresh state
      const keepUnit = g.units.find((u: any) => u === th)
      if (keepUnit?.type !== 'keep') return { found: true, upgradeFailed: true }

      // Select a worker
      const worker = g.units.find((u: any) => u.team === 0 && u.type === 'worker' && !u.isBuilding && u.hp > 0)
      if (!worker) return { found: true, noWorker: true }

      g.selectionModel.clear()
      g.selectionModel.setSelection([worker])
      g._lastCmdKey = ''
      g.updateHUD(0.016)

      const cmdCard = document.getElementById('command-card')!
      const buttons = Array.from(cmdCard.querySelectorAll('button'))
      const byLabel = (label: string) => buttons.find(b =>
        b.querySelector('.btn-label')?.textContent?.trim() === label)

      const workshopBtn = byLabel('车间')
      const sanctumBtn = byLabel('奥秘圣殿')

      return {
        found: true,
        keepType: keepUnit.type,
        hasWorkshopBtn: !!workshopBtn,
        hasSanctumBtn: !!sanctumBtn,
        workshopEnabled: workshopBtn ? !(workshopBtn as HTMLButtonElement).disabled : null,
        sanctumEnabled: sanctumBtn ? !(sanctumBtn as HTMLButtonElement).disabled : null,
        workshopReason: workshopBtn?.dataset.disabledReason ?? '',
        sanctumReason: sanctumBtn?.dataset.disabledReason ?? '',
      }
    })

    expect(result.found).toBe(true)
    expect(result.keepType).toBe('keep')
    expect(result.hasWorkshopBtn).toBe(true)
    expect(result.hasSanctumBtn).toBe(true)
    expect(result.workshopEnabled).toBe(true)
    expect(result.sanctumEnabled).toBe(true)
    expect(result.workshopReason).toBe('')
    expect(result.sanctumReason).toBe('')
  })

  test('UF-5: Keep still trains worker, no Castle/Knight/new content', async ({ page }) => {
    // Static data checks (run in Node, not browser)
    expect(BUILDINGS.keep.trains).toContain('worker')
    expect(BUILDINGS.castle).toBeUndefined()
    expect((UNITS as Record<string, unknown>)['knight']).toBeUndefined()
    expect(PEASANT_BUILD_MENU).toContain('workshop')
    expect(PEASANT_BUILD_MENU).toContain('arcane_sanctum')
  })
})
