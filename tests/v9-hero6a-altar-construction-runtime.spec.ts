/**
 * V9 HERO6A-IMPL1 Altar construction runtime exposure proof.
 *
 * Proves:
 * 1. Worker build menu exposes Altar of Kings button.
 * 2. Selecting a completed Altar does NOT show Paladin train/summon buttons.
 * 3. Barracks Footman train button still works (isHero guard doesn't break ordinary training).
 * 4. No Paladin unit is spawned by the Altar construction slice.
 *
 * Not Paladin summon, Holy Light, hero uniqueness, revive, XP, AI, or visuals.
 */
import { test, expect, type Page } from '@playwright/test'
import { BUILDINGS } from '../src/game/GameData'

const BASE_RUNTIME = 'http://127.0.0.1:4173/?runtimeTest=1'
const ALTAR_COST = BUILDINGS.altar_of_kings.cost
const ALTAR_SIZE = BUILDINGS.altar_of_kings.size

async function waitForRuntime(page: Page) {
  await page.goto(BASE_RUNTIME, { waitUntil: 'domcontentloaded' })
  await page.waitForFunction(() => {
    const game = (window as any).__war3Game
    const canvas = document.getElementById('game-canvas')
    return !!game && !!canvas && Array.isArray(game.units) && game.units.length > 0
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

test.describe('V9 HERO6A Altar construction runtime exposure', () => {
  test.setTimeout(120000)

  test('ALTAR-RT1: worker build menu shows Altar of Kings button', async ({ page }) => {
    await waitForRuntime(page)

    const result = await page.evaluate(({ altarSize }) => {
      const g = (window as any).__war3Game
      const worker = g.units.find((u: any) => u.team === 0 && u.type === 'worker' && !u.isBuilding)
      if (!worker) return { found: false }

      g.resources.earn(0, 5000, 5000)
      g.selectionModel.clear()
      g.selectionModel.setSelection([worker])
      g._lastCmdKey = ''
      g.updateHUD(0.016)

      const buttons = Array.from(document.querySelectorAll('#command-card button'))
      const altarBtn = buttons.find((b: any) =>
        b.querySelector('.btn-label')?.textContent?.trim() === '国王祭坛',
      ) as HTMLButtonElement | undefined

      return {
        found: true,
        hasAltarButton: !!altarBtn,
        disabled: altarBtn?.disabled ?? null,
        cost: altarBtn?.querySelector('.btn-cost')?.textContent ?? '',
      }
    }, { altarCost: ALTAR_COST })

    expect(result.found).toBe(true)
    expect(result.hasAltarButton).toBe(true)
    expect(result.disabled).toBe(false)
    expect(result.cost).toContain('180g')
    expect(result.cost).toContain('50w')
  })

  test('ALTAR-RT2: completed Altar does not show Paladin train button', async ({ page }) => {
    await waitForRuntime(page)

    const result = await page.evaluate(() => {
      const g = (window as any).__war3Game

      // Spawn a completed Altar directly
      g.spawnBuilding('altar_of_kings', 0, 15, 15)
      const altar = g.units.find((u: any) => u.team === 0 && u.type === 'altar_of_kings' && u.isBuilding)
      if (!altar) return { found: false }

      g.resources.earn(0, 5000, 5000)
      g.selectionModel.clear()
      g.selectionModel.setSelection([altar])
      g._lastCmdKey = ''
      g.updateHUD(0.016)

      const buttons = Array.from(document.querySelectorAll('#command-card button'))
      const labels = buttons.map((b: any) => b.querySelector('.btn-label')?.textContent?.trim() ?? '')
      const paladinBtn = buttons.find((b: any) =>
        b.querySelector('.btn-label')?.textContent?.trim() === '圣骑士',
      )
      const holyLightBtn = buttons.find((b: any) =>
        b.querySelector('.btn-label')?.textContent?.trim() === '圣光术',
      )

      return {
        found: true,
        buttonLabels: labels,
        hasPaladinButton: !!paladinBtn,
        hasHolyLightButton: !!holyLightBtn,
      }
    })

    expect(result.found).toBe(true)
    expect(result.hasPaladinButton).toBe(false)
    expect(result.hasHolyLightButton).toBe(false)
  })

  test('ALTAR-RT3: Barracks Footman training still works through generic trains path', async ({ page }) => {
    await waitForRuntime(page)

    const result = await page.evaluate(() => {
      const g = (window as any).__war3Game
      const barracks = g.units.find((u: any) => u.team === 0 && u.type === 'barracks' && u.isBuilding)
      if (!barracks) return { found: false }

      g.resources.earn(0, 5000, 5000)
      g.selectionModel.clear()
      g.selectionModel.setSelection([barracks])
      g._lastCmdKey = ''
      g.updateHUD(0.016)

      const buttons = Array.from(document.querySelectorAll('#command-card button'))
      const footmanBtn = buttons.find((b: any) =>
        b.querySelector('.btn-label')?.textContent?.trim() === '步兵',
      ) as HTMLButtonElement | undefined

      if (!footmanBtn) return { found: true, hasFootmanButton: false }

      const footmanCountBefore = g.units.filter((u: any) => u.team === 0 && u.type === 'footman' && !u.isBuilding).length

      footmanBtn.click()

      const queueAfterClick = barracks.trainingQueue.map((item: any) => ({ type: item.type }))

      // Fast-forward training
      const dt = 0.5
      for (let i = 0; i < 60; i++) {
        g.gameTime += dt
        g.updateUnits(dt)
      }

      const footmanCountAfter = g.units.filter((u: any) => u.team === 0 && u.type === 'footman' && !u.isBuilding).length

      return {
        found: true,
        hasFootmanButton: true,
        disabledBeforeClick: footmanBtn.disabled,
        queueAfterClick,
        footmanCountBefore,
        footmanCountAfter,
        queueEmptyAfterTraining: barracks.trainingQueue.length === 0,
      }
    })

    expect(result.found).toBe(true)
    expect(result.hasFootmanButton).toBe(true)
    expect(result.disabledBeforeClick).toBe(false)
    expect(result.queueAfterClick).toHaveLength(1)
    expect(result.queueAfterClick[0].type).toBe('footman')
    expect(result.footmanCountAfter).toBe(result.footmanCountBefore + 1)
    expect(result.queueEmptyAfterTraining).toBe(true)
  })

  test('ALTAR-RT4: worker command path constructs altar_of_kings and no Paladin', async ({ page }) => {
    await waitForRuntime(page)

    const result = await page.evaluate(({ altarSize }) => {
      const g = (window as any).__war3Game
      const worker = g.units.find((u: any) => u.team === 0 && u.type === 'worker' && !u.isBuilding)
      if (!worker) return { found: false }

      g.resources.earn(0, 5000, 5000)

      const altarCountBefore = g.units.filter((u: any) => u.type === 'altar_of_kings').length
      const paladinCountBefore = g.units.filter((u: any) => u.type === 'paladin').length
      const resourcesBefore = g.resources.get(0)

      g.selectionModel.clear()
      g.selectionModel.setSelection([worker])
      g._lastCmdKey = ''
      g.updateHUD(0.016)

      const altarBtn = Array.from(document.querySelectorAll('#command-card button')).find((b: any) =>
        b.querySelector('.btn-label')?.textContent?.trim() === '国王祭坛',
      ) as HTMLButtonElement | undefined
      if (!altarBtn) return { found: true, error: 'no altar button' }
      if (altarBtn.disabled) return { found: true, error: 'altar button disabled' }

      altarBtn.click()
      const placementModeAfterClick = g.placementMode
      if (placementModeAfterClick !== 'altar_of_kings') {
        return { found: true, error: `wrong placement mode: ${placementModeAfterClick}` }
      }

      const candidates = [
        [22, 18], [24, 18], [22, 21], [25, 21], [28, 18], [18, 22], [30, 22],
      ]
      let chosen: [number, number] | null = null
      for (const [x, z] of candidates) {
        const ok = g.placementValidator.canPlace(x, z, altarSize).ok
        if (!ok) continue
        chosen = [x, z]
        break
      }
      if (!chosen || !g.ghostMesh) return { found: true, error: 'no valid placement' }

      const [x, z] = chosen
      g.ghostMesh.position.set(x + 0.5, g.getWorldHeight(x, z), z + 0.5)
      g.placeBuilding()

      const resourcesAfterPlace = g.resources.get(0)
      const placedAltar = g.units.find((u: any) =>
        u.type === 'altar_of_kings' &&
        u.team === 0 &&
        u.isBuilding &&
        Math.round(u.mesh.position.x - 0.5) === x &&
        Math.round(u.mesh.position.z - 0.5) === z
      )
      if (!placedAltar) return { found: true, error: 'altar was not placed' }

      let elapsed = 0
      while (elapsed < 100 && placedAltar.buildProgress < 1) {
        const dt = 0.25
        g.update(dt)
        elapsed += dt
      }
      // One extra tick lets the builder state machine observe the completed building.
      g.update(0.25)

      const altarCountAfter = g.units.filter((u: any) => u.type === 'altar_of_kings').length
      const paladinCountAfter = g.units.filter((u: any) => u.type === 'paladin').length

      g.selectionModel.clear()
      g.selectionModel.setSelection([placedAltar])
      g._lastCmdKey = ''
      g.updateHUD(0.016)
      const selectedAltarLabels = Array.from(document.querySelectorAll('#command-card button')).map((b: any) =>
        b.querySelector('.btn-label')?.textContent?.trim() ?? '',
      )

      return {
        found: true,
        placementModeAfterClick,
        altarCountBefore,
        altarCountAfter,
        paladinCountBefore,
        paladinCountAfter,
        resourcesBefore,
        resourcesAfterPlace,
        altarIsBuilding: placedAltar.isBuilding,
        altarBuildProgress: placedAltar.buildProgress,
        builderCleared: worker.buildTarget === null && worker.state === 0,
        selectedAltarLabels,
      }
    }, { altarSize: ALTAR_SIZE })

    expect(result.found).toBe(true)
    expect(result.error).toBeUndefined()
    expect(result.placementModeAfterClick).toBe('altar_of_kings')
    expect(result.altarCountAfter).toBe(result.altarCountBefore + 1)
    expect(result.paladinCountAfter).toBe(result.paladinCountBefore)
    expect(result.resourcesAfterPlace.gold).toBe(result.resourcesBefore.gold - ALTAR_COST.gold)
    expect(result.resourcesAfterPlace.lumber).toBe(result.resourcesBefore.lumber - ALTAR_COST.lumber)
    expect(result.altarIsBuilding).toBe(true)
    expect(result.altarBuildProgress).toBe(1)
    expect(result.builderCleared).toBe(true)
    expect(result.selectedAltarLabels).not.toContain('圣骑士')
  })
})
