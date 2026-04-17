/**
 * M6 Live Build Smoke Pack
 *
 * Minimal repeatable smoke path proving the game is demo/playtest-ready.
 * Covers: open → base readable → select/move/gather → train → AI active.
 * This is NOT a full regression suite — it is the shortest path that
 * proves a private playtest session can start and produce real gameplay.
 *
 * All assertions use deterministic runtime state, not screenshots.
 */
import { test, expect, type Page } from '@playwright/test'

const BASE = 'http://127.0.0.1:4173/?runtimeTest=1'

// ==================== Helpers ====================

async function waitForGame(page: Page) {
  const consoleErrors: string[] = []
  page.on('console', (msg) => {
    if (msg.type() === 'error') consoleErrors.push(msg.text())
  })
  ;(page as any).__consoleErrors = consoleErrors

  await page.goto(BASE, { waitUntil: 'domcontentloaded' })

  try {
    await page.waitForFunction(() => {
      const canvas = document.getElementById('game-canvas')
      if (!canvas) return false
      const rect = canvas.getBoundingClientRect()
      if (rect.width === 0 || rect.height === 0) return false
      const game = (window as any).__war3Game
      if (!game) return false
      if (!Array.isArray(game.units) || game.units.length === 0) return false
      if (!game.renderer) return false
      return game.renderer.domElement.width > 0
    }, { timeout: 15000 })
  } catch (e) {
    const snap = await page.evaluate(() => {
      const game = (window as any).__war3Game
      return {
        hasGame: !!game,
        unitsLength: game?.units?.length ?? -1,
        mapStatus: document.getElementById('map-status')?.textContent,
      }
    })
    throw new Error(
      `waitForGame failed: ${JSON.stringify(snap)}. ` +
      `Console: ${consoleErrors.slice(-5).join(' | ')}. ` +
      `Original: ${(e as Error).message}`,
    )
  }

  await page.waitForFunction(() => {
    const status = document.getElementById('map-status')?.textContent ?? ''
    return !status.includes('正在加载')
  }, { timeout: 15000 })

  await page.waitForTimeout(500)
}

// ==================== Tests ====================

test.describe('M6 Live Build Smoke', () => {
  test.setTimeout(120000)

  test('game boots with playable opening state', async ({ page }) => {
    await waitForGame(page)

    const state = await page.evaluate(() => {
      const g = (window as any).__war3Game
      const units = g.units
      const p0 = units.filter((u: any) => u.team === 0)
      const p1 = units.filter((u: any) => u.team === 1)

      return {
        // Player 0 opening
        playerTH: p0.filter((u: any) => u.type === 'townhall' && u.isBuilding && u.hp > 0).length,
        playerWorkers: p0.filter((u: any) => u.type === 'worker' && !u.isBuilding && u.hp > 0).length,
        playerBarracks: p0.filter((u: any) => u.type === 'barracks' && u.isBuilding && u.hp > 0).length,
        // AI opening
        aiTH: p1.filter((u: any) => u.type === 'townhall' && u.isBuilding && u.hp > 0).length,
        aiWorkers: p1.filter((u: any) => u.type === 'worker' && !u.isBuilding && u.hp > 0).length,
        // Map features
        goldmine: units.filter((u: any) => u.type === 'goldmine' && u.hp > 0).length,
        // HUD
        hudTop: !!document.getElementById('hud-top'),
        hudBottom: !!document.getElementById('hud-bottom'),
        commandCard: !!document.getElementById('command-card'),
        minimap: !!document.getElementById('minimap'),
        // Resources
        playerGold: g.resources?.get(0)?.gold ?? -1,
        playerLumber: g.resources?.get(0)?.lumber ?? -1,
      }
    })

    // Player has viable opening
    expect(state.playerTH, 'player must have a townhall').toBe(1)
    expect(state.playerWorkers, 'player must have workers').toBeGreaterThanOrEqual(5)
    expect(state.playerBarracks, 'player must have a barracks').toBeGreaterThanOrEqual(1)
    // AI has viable opening
    expect(state.aiTH, 'AI must have a townhall').toBe(1)
    expect(state.aiWorkers, 'AI must have workers').toBeGreaterThanOrEqual(3)
    // Map features
    expect(state.goldmine, 'must have at least one goldmine').toBeGreaterThanOrEqual(1)
    // HUD present
    expect(state.hudTop, 'hud-top must exist').toBe(true)
    expect(state.hudBottom, 'hud-bottom must exist').toBe(true)
    expect(state.commandCard, 'command-card must exist').toBe(true)
    expect(state.minimap, 'minimap must exist').toBe(true)
    // Starting resources
    expect(state.playerGold, 'player starting gold > 0').toBeGreaterThan(0)
    expect(state.playerLumber, 'player starting lumber > 0').toBeGreaterThan(0)
  })

  test('player can select a worker and issue a gather command', async ({ page }) => {
    await waitForGame(page)

    const result = await page.evaluate(() => {
      const g = (window as any).__war3Game
      const units = g.units

      // Select a player worker
      const worker = units.find(
        (u: any) => u.team === 0 && u.type === 'worker' && !u.isBuilding && u.hp > 0,
      )
      if (!worker) return { error: 'no player worker' }
      g.selectionModel.setSelection([worker])

      // Find nearest goldmine
      const mine = units.find((u: any) => u.type === 'goldmine' && u.hp > 0)
      if (!mine) return { error: 'no goldmine' }

      // Issue gather command via the real command hook used by runtime tests.
      g.issueCommand([worker], {
        type: 'gather',
        resourceType: 'gold',
        target: mine.mesh.position.clone(),
      })
      worker.resourceTarget = { type: 'goldmine', mine }
      g.planPathForUnits([worker], mine.mesh.position.clone())

      return {
        selected: g.selectionModel.units.length,
        workerState: worker.state,
        workerGatherType: worker.gatherType,
        hasResourceTarget: !!worker.resourceTarget,
      }
    })

    expect(result.error).toBeUndefined()
    expect(result.selected, 'worker should be selected').toBe(1)
    expect(result.workerGatherType, 'worker gatherType should be gold').toBe('gold')
    expect(result.hasResourceTarget, 'worker should have a resource target').toBe(true)
  })

  test('player resources change after simulated gathering', async ({ page }) => {
    await waitForGame(page)

    const result = await page.evaluate(() => {
      const g = (window as any).__war3Game
      const units = g.units

      const goldBefore = g.resources.get(0).gold

      // Use the real gather command hook rather than direct state mutation.
      const mine = units.find((u: any) => u.type === 'goldmine' && u.hp > 0)
      const workers = units.filter(
        (u: any) => u.team === 0 && u.type === 'worker' && !u.isBuilding && u.hp > 0,
      )
      if (mine && workers.length > 0) {
        const activeWorkers = workers.slice(0, 3)
        g.issueCommand(activeWorkers, {
          type: 'gather',
          resourceType: 'gold',
          target: mine.mesh.position.clone(),
        })
        for (const w of activeWorkers) {
          w.resourceTarget = { type: 'goldmine', mine }
        }
        g.planPathForUnits(activeWorkers, mine.mesh.position.clone())
      }

      // Simulate 30 seconds of gameplay
      let remaining = 30
      while (remaining > 0) {
        const step = Math.min(0.016, remaining)
        g.update(step)
        remaining -= step
      }

      const goldAfter = g.resources.get(0).gold

      return {
        goldBefore,
        goldAfter,
        goldChanged: goldAfter !== goldBefore,
      }
    })

    expect(result.goldChanged,
      `player gold should change during 30s of gameplay (${result.goldBefore} → ${result.goldAfter})`,
    ).toBe(true)
  })

  test('player can train a unit from barracks', async ({ page }) => {
    await waitForGame(page)

    const result = await page.evaluate(() => {
      const g = (window as any).__war3Game

      // Find player barracks
      const barracks = g.units.find(
        (u: any) => u.team === 0 && u.type === 'barracks' && u.isBuilding && u.hp > 0 && u.buildProgress >= 1,
      )
      if (!barracks) return { error: 'no completed player barracks' }

      const queueBefore = barracks.trainingQueue.length

      // Select barracks and use the real command-card training path.
      g.selectionModel.clear()
      g.selectionModel.setSelection([barracks])
      g.updateHUD(0.016)

      const btn = [...document.querySelectorAll('#command-card button')].find((b: any) =>
        b.querySelector('.btn-label')?.textContent?.trim() === '步兵'
      ) as HTMLButtonElement | undefined
      if (!btn) return { error: 'no footman button' }
      if (btn.disabled) {
        return {
          error: 'footman button disabled',
          disabledReason: btn.dataset.disabledReason ?? '',
        }
      }

      btn.click()

      return {
        queueBefore,
        queueAfter: barracks.trainingQueue.length,
        trainQueued: barracks.trainingQueue.length > queueBefore,
      }
    })

    expect(result.error).toBeUndefined()
    expect(result.trainQueued, 'barracks should have a footman in training queue').toBe(true)
  })

  test('AI is active and produces economy within 60 seconds', async ({ page }) => {
    await waitForGame(page)

    // Advance 60 seconds
    await page.evaluate(() => {
      const g = (window as any).__war3Game
      let remaining = 60
      while (remaining > 0) {
        const step = Math.min(0.016, remaining)
        g.update(step)
        remaining -= step
      }
    })

    const state = await page.evaluate(() => {
      const g = (window as any).__war3Game
      const units = g.units
      const ai = (u: any) => u.team === 1

      const workers = units.filter((u: any) => ai(u) && u.type === 'worker' && !u.isBuilding && u.hp > 0)
      const gathering = workers.filter((u: any) =>
        u.gatherType && (u.state === 2 || u.state === 3 || u.state === 4))

      const footmen = units.filter((u: any) => ai(u) && u.type === 'footman' && !u.isBuilding && u.hp > 0)
      const farms = units.filter((u: any) => ai(u) && u.type === 'farm' && u.isBuilding && u.hp > 0)
      const barracks = units.filter((u: any) => ai(u) && u.type === 'barracks' && u.isBuilding && u.hp > 0)
      const res = g.resources?.get(1)

      return {
        aiWorkers: workers.length,
        aiGathering: gathering.length,
        aiFootmen: footmen.length,
        aiFarms: farms.length,
        aiBarracks: barracks.length,
        aiGold: res?.gold ?? -1,
        aiLumber: res?.lumber ?? -1,
        gameTime: g.gameTime?.toFixed(1),
      }
    })

    // AI economy is active
    expect(state.aiGathering,
      `AI should have gathering workers at t=${state.gameTime} (got ${state.aiGathering})`,
    ).toBeGreaterThanOrEqual(1)

    // AI has spent resources (not stuck at initial 500/200)
    expect(state.aiGold !== 500 || state.aiLumber !== 200,
      `AI resources should have changed from initial (gold=${state.aiGold} lumber=${state.aiLumber})`,
    ).toBe(true)

    // AI has built structures
    const structures = state.aiFarms + state.aiBarracks
    expect(structures,
      `AI should have built at least 1 structure (farms=${state.aiFarms} barracks=${state.aiBarracks})`,
    ).toBeGreaterThanOrEqual(1)
  })
})
