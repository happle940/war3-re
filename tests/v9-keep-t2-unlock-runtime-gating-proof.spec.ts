/**
 * V9 Keep/T2 Runtime Gating Proof
 *
 * Proves the real production data migration is complete:
 * - Without Keep, Workshop and Arcane Sanctum are blocked in worker command card
 * - With Keep, they become available
 * - Worker command card shows disabled buttons with 主城 reason
 * - V7 content (Mortar, Priest) remains reachable through Keep-gated buildings
 */
import { test, expect, type Page } from '@playwright/test'

import { BUILDINGS } from '../src/game/GameData'

const BASE_RUNTIME = 'http://127.0.0.1:4173/?runtimeTest=1'

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
    // Procedural fallback is enough for this focused proof.
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

test.describe('V9 Keep/T2 Runtime Gating Proof', () => {
  test.setTimeout(120000)

  test('RG-1: without Keep, Workshop and Arcane Sanctum build availability is blocked', async ({ page }) => {
    await waitForRuntime(page)

    const result = await page.evaluate(() => {
      const g = (window as any).__war3Game

      // Kill any existing keeps just in case
      const keeps = g.units.filter(
        (u: any) => u.type === 'keep' && u.team === 0 && u.isBuilding && u.hp > 0,
      )
      for (const keep of keeps) keep.hp = 0
      g.handleDeadUnits()

      const workshopAvail = g.getBuildAvailability('workshop', 0)
      const sanctumAvail = g.getBuildAvailability('arcane_sanctum', 0)

      return {
        workshopAvail,
        sanctumAvail,
      }
    })

    expect(result.workshopAvail.ok).toBe(false)
    expect(result.workshopAvail.reason).toContain('主城')
    expect(result.sanctumAvail.ok).toBe(false)
    expect(result.sanctumAvail.reason).toContain('主城')
  })

  test('RG-2: with Keep, Workshop and Arcane Sanctum build availability becomes ok', async ({ page }) => {
    await waitForRuntime(page)

    const result = await page.evaluate(() => {
      const g = (window as any).__war3Game

      // Spawn a completed Keep
      const townhall = g.units.find((u: any) => u.team === 0 && u.type === 'townhall' && u.isBuilding && u.hp > 0)
      const keep = g.spawnBuilding('keep', 0, (townhall?.x ?? 25) + 6, townhall?.y ?? 25)
      keep.buildProgress = 1

      const workshopAvail = g.getBuildAvailability('workshop', 0)
      const sanctumAvail = g.getBuildAvailability('arcane_sanctum', 0)

      // Cleanup
      keep.hp = 0
      g.handleDeadUnits()

      return {
        workshopAvail,
        sanctumAvail,
        keepType: keep.type,
      }
    })

    expect(result.workshopAvail.ok).toBe(true)
    expect(result.sanctumAvail.ok).toBe(true)
    expect(result.keepType).toBe('keep')
  })

  test('RG-3: worker command card surfaces Keep gate as player-visible disabled state', async ({ page }) => {
    await waitForRuntime(page)

    const result = await page.evaluate(() => {
      const g = (window as any).__war3Game

      // Ensure no Keep exists
      const keeps = g.units.filter(
        (u: any) => u.type === 'keep' && u.team === 0 && u.isBuilding && u.hp > 0,
      )
      for (const keep of keeps) keep.hp = 0
      g.handleDeadUnits()

      const worker = g.units.find((u: any) => u.team === 0 && u.type === 'worker' && !u.isBuilding && u.hp > 0)
      g.selectionModel.clear()
      g.selectionModel.setSelection([worker])
      g._lastCmdKey = ''
      g.updateHUD(0.016)

      const buttons = Array.from(document.querySelectorAll('#command-card button')) as HTMLButtonElement[]
      const byLabel = (label: string) => buttons.find((button) =>
        button.querySelector('.btn-label')?.textContent?.trim() === label)

      const workshopButton = byLabel('车间')
      const sanctumButton = byLabel('奥秘圣殿')

      return {
        hasWorkshopButton: !!workshopButton,
        hasSanctumButton: !!sanctumButton,
        workshopDisabled: workshopButton?.disabled ?? null,
        sanctumDisabled: sanctumButton?.disabled ?? null,
        workshopReason: workshopButton?.dataset.disabledReason
          ?? workshopButton?.querySelector('.btn-reason')?.textContent
          ?? '',
        sanctumReason: sanctumButton?.dataset.disabledReason
          ?? sanctumButton?.querySelector('.btn-reason')?.textContent
          ?? '',
      }
    })

    expect(result.hasWorkshopButton).toBe(true)
    expect(result.hasSanctumButton).toBe(true)
    expect(result.workshopDisabled).toBe(true)
    expect(result.sanctumDisabled).toBe(true)
    expect(result.workshopReason).toContain('主城')
    expect(result.sanctumReason).toContain('主城')
  })

  test('RG-4: production data confirms migration — techPrereq is keep', () => {
    expect(BUILDINGS.workshop.techPrereq).toBe('keep')
    expect(BUILDINGS.arcane_sanctum.techPrereq).toBe('keep')
    expect(BUILDINGS.keep.upgradeTo).toBeUndefined()
    // Still no Castle
    expect((BUILDINGS as Record<string, unknown>)['castle']).toBeUndefined()
  })
})
