/**
 * V9 HN2-PROOF10 Human T2 Production Path Smoke
 *
 * One focused runtime smoke proving the player-side T2 minimum path
 * chains together in a single fresh session:
 *
 * 1. No Keep → Workshop / Arcane Sanctum disabled (reason contains 主城)
 * 2. Town Hall → Keep upgrade via real upgrade path (not type-swap)
 * 3. Keep completed → worker command card unlocks Workshop / Arcane Sanctum
 * 4. Spawned Workshop trains Mortar Team through normal command card
 * 5. Spawned Arcane Sanctum trains Priest through normal command card
 * 6. No Castle / Knight / new content
 *
 * Uses fresh state reads after every mutation.
 * NOT Castle, Knight, full tech tree, AI strategy, or asset work.
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

test.describe('V9 Human T2 Production Path Smoke', () => {
  test.setTimeout(120000)

  test('PS-1: full T2 production path — upgrade, unlock, train', async ({ page }) => {
    await waitForRuntime(page)

    const result = await page.evaluate(({ keepBuildTime }) => {
      const g = (window as any).__war3Game

      // ===== Phase A: No Keep — T2 buildings disabled =====
      // Ensure no Keep exists
      const keeps = g.units.filter(
        (u: any) => u.type === 'keep' && u.team === 0 && u.isBuilding && u.hp > 0,
      )
      for (const k of keeps) k.hp = 0
      g.handleDeadUnits()

      const worker = g.units.find((u: any) => u.team === 0 && u.type === 'worker' && !u.isBuilding && u.hp > 0)
      if (!worker) return { error: 'no worker found' }

      g.selectionModel.clear()
      g.selectionModel.setSelection([worker])
      g._lastCmdKey = ''
      g.updateHUD(0.016)

      const cmdCard = document.getElementById('command-card')!
      const phaseAButtons = Array.from(cmdCard.querySelectorAll('button'))
      const byLabel = (btns: HTMLButtonElement[], label: string) =>
        btns.find(b => b.querySelector('.btn-label')?.textContent?.trim() === label)

      const wsBtnA = byLabel(phaseAButtons, '车间')
      const asBtnA = byLabel(phaseAButtons, '奥秘圣殿')

      const phaseA = {
        hasWorkshop: !!wsBtnA,
        hasSanctum: !!asBtnA,
        workshopDisabled: wsBtnA ? (wsBtnA as HTMLButtonElement).disabled : null,
        sanctumDisabled: asBtnA ? (asBtnA as HTMLButtonElement).disabled : null,
        workshopReason: wsBtnA?.dataset.disabledReason
          ?? wsBtnA?.querySelector('.btn-reason')?.textContent ?? '',
        sanctumReason: asBtnA?.dataset.disabledReason
          ?? asBtnA?.querySelector('.btn-reason')?.textContent ?? '',
      }

      // ===== Phase B: Upgrade Town Hall to Keep =====
      const th = g.units.find((u: any) => u.team === 0 && u.type === 'townhall' && u.isBuilding && u.hp > 0)
      if (!th) return { error: 'no townhall found' }

      g.resources.earn(0, 5000, 3000)
      g.startBuildingUpgrade(th, 'keep')

      // Read fresh state
      const freshTh = g.units.find((u: any) => u === th)
      if (!freshTh?.upgradeQueue) return { error: 'upgrade not started', phaseA }

      // Advance time past buildTime
      const dt = 0.5
      const steps = Math.ceil(keepBuildTime / dt) + 5
      for (let i = 0; i < steps; i++) {
        g.gameTime += dt
        g.updateUnits(dt)
      }

      // Read fresh state — verify Keep
      const upgradedTh = g.units.find((u: any) => u === th)
      if (upgradedTh?.type !== 'keep') {
        return {
          error: 'upgrade did not complete',
          phaseA,
          typeAfter: upgradedTh?.type,
          upgradeQueue: !!upgradedTh?.upgradeQueue,
        }
      }

      // ===== Phase C: Worker command card — T2 buildings now available =====
      // Re-find worker (fresh state)
      const freshWorker = g.units.find(
        (u: any) => u.team === 0 && u.type === 'worker' && !u.isBuilding && u.hp > 0,
      )
      if (!freshWorker) return { error: 'no worker after upgrade', phaseA }

      g.selectionModel.clear()
      g.selectionModel.setSelection([freshWorker])
      g._lastCmdKey = ''
      g.updateHUD(0.016)

      const phaseCButtons = Array.from(cmdCard.querySelectorAll('button'))
      const wsBtnC = byLabel(phaseCButtons, '车间')
      const asBtnC = byLabel(phaseCButtons, '奥秘圣殿')

      const phaseC = {
        hasWorkshop: !!wsBtnC,
        hasSanctum: !!asBtnC,
        workshopEnabled: wsBtnC ? !(wsBtnC as HTMLButtonElement).disabled : null,
        sanctumEnabled: asBtnC ? !(asBtnC as HTMLButtonElement).disabled : null,
        workshopReason: wsBtnC?.dataset.disabledReason ?? '',
        sanctumReason: asBtnC?.dataset.disabledReason ?? '',
      }

      // ===== Phase D: Train Mortar from Workshop =====
      g.resources.earn(0, 3000, 2000)
      g.spawnBuilding('farm', 0, 50, 50)
      const workshop = g.spawnBuilding('workshop', 0, 53, 50)

      g.selectionModel.clear()
      g.selectionModel.setSelection([workshop])
      g._lastCmdKey = ''
      g.updateHUD(0.016)

      const phaseDButtons = Array.from(cmdCard.querySelectorAll('button'))
      const mortarBtn = phaseDButtons.find(b =>
        b.querySelector('.btn-label')?.textContent?.trim() === '迫击炮小队',
      )

      const queueBeforeMortar = workshop.trainingQueue.length
      if (mortarBtn && !(mortarBtn as HTMLButtonElement).disabled) {
        mortarBtn.click()
      }

      // Read fresh state
      const freshWorkshop = g.units.find((u: any) => u === workshop && u.hp > 0)
      const phaseD = {
        hasMortarBtn: !!mortarBtn,
        mortarBtnEnabled: mortarBtn ? !(mortarBtn as HTMLButtonElement).disabled : false,
        queuedMortar: freshWorkshop?.trainingQueue.length === queueBeforeMortar + 1,
        mortarType: freshWorkshop?.trainingQueue[0]?.type ?? '',
      }

      // ===== Phase E: Train Priest from Arcane Sanctum =====
      const sanctum = g.spawnBuilding('arcane_sanctum', 0, 56, 50)

      g.selectionModel.clear()
      g.selectionModel.setSelection([sanctum])
      g._lastCmdKey = ''
      g.updateHUD(0.016)

      const phaseEButtons = Array.from(cmdCard.querySelectorAll('button'))
      const priestBtn = phaseEButtons.find(b =>
        b.querySelector('.btn-label')?.textContent?.trim() === '牧师',
      )

      const queueBeforePriest = sanctum.trainingQueue.length
      if (priestBtn && !(priestBtn as HTMLButtonElement).disabled) {
        priestBtn.click()
      }

      // Read fresh state
      const freshSanctum = g.units.find((u: any) => u === sanctum && u.hp > 0)
      const phaseE = {
        hasPriestBtn: !!priestBtn,
        priestBtnEnabled: priestBtn ? !(priestBtn as HTMLButtonElement).disabled : false,
        queuedPriest: freshSanctum?.trainingQueue.length === queueBeforePriest + 1,
        priestType: freshSanctum?.trainingQueue[0]?.type ?? '',
      }

      return { phaseA, phaseC, phaseD, phaseE }
    }, { keepBuildTime: KEEP_BUILD_TIME })

    // Phase A: Before Keep — T2 buildings disabled
    expect(result.error).toBeUndefined()
    expect(result.phaseA.hasWorkshop).toBe(true)
    expect(result.phaseA.hasSanctum).toBe(true)
    expect(result.phaseA.workshopDisabled).toBe(true)
    expect(result.phaseA.sanctumDisabled).toBe(true)
    expect(result.phaseA.workshopReason).toContain('主城')
    expect(result.phaseA.sanctumReason).toContain('主城')

    // Phase C: After Keep — T2 buildings available
    expect(result.phaseC.hasWorkshop).toBe(true)
    expect(result.phaseC.hasSanctum).toBe(true)
    expect(result.phaseC.workshopEnabled).toBe(true)
    expect(result.phaseC.sanctumEnabled).toBe(true)
    expect(result.phaseC.workshopReason).toBe('')
    expect(result.phaseC.sanctumReason).toBe('')

    // Phase D: Workshop trains Mortar
    expect(result.phaseD.hasMortarBtn).toBe(true)
    expect(result.phaseD.mortarBtnEnabled).toBe(true)
    expect(result.phaseD.queuedMortar).toBe(true)
    expect(result.phaseD.mortarType).toBe('mortar_team')

    // Phase E: Arcane Sanctum trains Priest
    expect(result.phaseE.hasPriestBtn).toBe(true)
    expect(result.phaseE.priestBtnEnabled).toBe(true)
    expect(result.phaseE.queuedPriest).toBe(true)
    expect(result.phaseE.priestType).toBe('priest')
  })

  test('PS-2: boundary — no Castle, Knight, or new content', () => {
    expect(BUILDINGS.castle).toBeUndefined()
    expect((UNITS as Record<string, unknown>)['knight']).toBeUndefined()
    expect(PEASANT_BUILD_MENU).toContain('workshop')
    expect(PEASANT_BUILD_MENU).toContain('arcane_sanctum')
    expect(BUILDINGS.keep.trains).toContain('worker')
    expect(BUILDINGS.workshop.techPrereq).toBe('keep')
    expect(BUILDINGS.arcane_sanctum.techPrereq).toBe('keep')
  })
})
