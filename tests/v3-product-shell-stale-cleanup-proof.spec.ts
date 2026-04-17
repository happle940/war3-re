/**
 * V3-PS2 Stale Cleanup Proof Pack
 *
 * Focused regression proving that return-to-menu + re-entry leaves zero
 * residual interaction state from the previous session:
 *   1. Selection + selection rings + health bars fully cleaned
 *   2. Placement ghost / build mode / attack-move / rally fully cleaned
 *   3. Command card resets to empty-slot default
 *   4. Results / pause / game-over overlays fully cleaned
 *   5. Multi-session stress: two full cycles leave nothing behind
 *
 * This is the V3-PS2 stale-cleanup gate closeout proof pack.
 * It does not close V3-PS1, V3-PS4, V3-PS5, V3-AV1, or V3-UA1.
 */
import { test, expect, type Page } from '@playwright/test'

const BASE = 'http://127.0.0.1:4173/'

async function waitForBoot(page: Page) {
  const consoleErrors: string[] = []
  page.on('console', (msg) => {
    if (msg.type() === 'error') consoleErrors.push(msg.text())
  })
  ;(page as any).__consoleErrors = consoleErrors

  await page.goto(BASE, { waitUntil: 'domcontentloaded' })
  await page.waitForFunction(() => {
    const game = (window as any).__war3Game
    if (!game) return false
    const canvas = document.getElementById('game-canvas')
    if (!canvas) return false
    if (!game.renderer) return false
    const el = game.renderer.domElement
    if (el.width === 0 || el.height === 0) return false
    if (!Array.isArray(game.units) || game.units.length === 0) return false
    return true
  }, { timeout: 15000 })
  await page.waitForTimeout(500)
}

async function startGameplay(page: Page) {
  await page.evaluate(async () => {
    const menuStartBtn = document.getElementById('menu-start-button') as HTMLButtonElement
    const briefingStartBtn = document.getElementById('briefing-start-button') as HTMLButtonElement
    menuStartBtn.click()
    await new Promise(r => setTimeout(r, 50))
    briefingStartBtn.click()
    await new Promise(r => setTimeout(r, 50))
  })
  // Wait for units to be available and game to be playing
  await page.waitForFunction(() => {
    const g = (window as any).__war3Game
    return g && g.phase.isPlaying() && Array.isArray(g.units) && g.units.length > 0
  }, { timeout: 5000 })
  await page.waitForTimeout(200)
}

test.describe('V3-PS2 Stale Cleanup Proof', () => {
  test.setTimeout(180000)

  test('selection state fully cleaned: model, rings, health bars after return + re-entry', async ({ page }) => {
    await waitForBoot(page)
    await startGameplay(page)

    const result = await page.evaluate(async () => {
      const g = (window as any).__war3Game
      const returnToMenu = (window as any).__returnToMenu as () => void
      const menuStartBtn = document.getElementById('menu-start-button') as HTMLButtonElement
      const briefingStartBtn = document.getElementById('briefing-start-button') as HTMLButtonElement

      // === Create rich selection state ===
      const workers = g.units.filter((u: any) => u.team === 0 && u.type === 'worker' && u.hp > 0)
      const worker = workers[0]
      const th = g.units.find((u: any) => u.team === 0 && u.type === 'townhall' && u.hp > 0)

      // Select worker + create ring + health bar
      if (worker) {
        g.selectionModel.setSelection([worker])
        g.createSelectionRing(worker)
        if (!g.healthBars.has(worker)) g.createHealthBar(worker)
      }

      const hadSelection = (g.selectionModel?.units?.length ?? 0) > 0
      const hadRings = (g.selectionRings?.length ?? 0) > 0
      const hadHealthBar = worker ? g.healthBars.has(worker) : false

      // === Return to menu ===
      g.pauseGame()
      returnToMenu()
      await new Promise(r => setTimeout(r, 100))

      const afterReturn = {
        selectionCount: (g.selectionModel?.units?.length ?? 0),
        ringsCount: (g.selectionRings?.length ?? 0),
        oldWorkerHealthBarGone: worker ? !g.healthBars.has(worker) : true,
      }

      // === Re-enter gameplay ===
      menuStartBtn.click()
      await new Promise(r => setTimeout(r, 50))
      briefingStartBtn.click()
      await new Promise(r => setTimeout(r, 500))

      // Find the new worker (different object identity from session 1)
      const newWorkers = g.units.filter((u: any) => u.team === 0 && u.type === 'worker' && u.hp > 0)

      const afterReentry = {
        selectionCount: (g.selectionModel?.units?.length ?? 0),
        ringsCount: (g.selectionRings?.length ?? 0),
        healthBarsFromOldSession: worker ? g.healthBars.has(worker) : true,
        hasNewUnits: newWorkers.length > 0,
      }

      return { hadSelection, hadRings, hadHealthBar, afterReturn, afterReentry }
    })

    // Pre-conditions: we actually created state
    expect(result.hadSelection, 'must have had selection before return').toBe(true)
    expect(result.hadRings, 'must have had selection ring').toBe(true)
    expect(result.hadHealthBar, 'must have had health bar').toBe(true)

    // After return: everything cleaned
    expect(result.afterReturn.selectionCount, 'selection must be empty after return').toBe(0)
    expect(result.afterReturn.ringsCount, 'rings must be empty after return').toBe(0)
    expect(result.afterReturn.oldWorkerHealthBarGone, 'old session health bar must be gone after return').toBe(true)

    // After re-entry: still clean, no old-session artifacts
    expect(result.afterReentry.selectionCount, 'selection must be empty after re-entry').toBe(0)
    expect(result.afterReentry.ringsCount, 'rings must be empty after re-entry').toBe(0)
    expect(result.afterReentry.healthBarsFromOldSession, 'old-session health bar must not exist').toBe(false)
    expect(result.afterReentry.hasNewUnits, 'new session must have units').toBe(true)

    console.log('[V3-PS2 STALE] Selection cleanup:', JSON.stringify(result, null, 2))
  })

  test('placement/mode state fully cleaned: ghost, build mode, attack-move, rally after return + re-entry', async ({ page }) => {
    await waitForBoot(page)
    await startGameplay(page)

    const result = await page.evaluate(async () => {
      const g = (window as any).__war3Game
      const returnToMenu = (window as any).__returnToMenu as () => void
      const menuStartBtn = document.getElementById('menu-start-button') as HTMLButtonElement
      const briefingStartBtn = document.getElementById('briefing-start-button') as HTMLButtonElement

      // === Create placement state ===
      const hadPlacementMode = !!g.placement?.mode
      g.enterPlacementMode('barracks')
      const hasGhost = !!g.ghostMesh
      const hasBuildMode = !!g.placement?.mode

      // === Return to menu ===
      g.pauseGame()
      returnToMenu()
      await new Promise(r => setTimeout(r, 100))

      const afterReturn = {
        ghostExists: !!g.ghostMesh,
        buildModeActive: !!g.placement?.mode,
        attackMoveMode: !!g.attackMoveMode,
        rallyMode: !!g.rallyMode,
        rallyBuilding: !!g.rallyBuilding,
      }

      // === Re-enter gameplay ===
      menuStartBtn.click()
      await new Promise(r => setTimeout(r, 50))
      briefingStartBtn.click()
      await new Promise(r => setTimeout(r, 200))

      const afterReentry = {
        ghostExists: !!g.ghostMesh,
        buildModeActive: !!g.placement?.mode,
        attackMoveMode: !!g.attackMoveMode,
        rallyMode: !!g.rallyMode,
        rallyBuilding: !!g.rallyBuilding,
      }

      return { hadPlacementMode, hasGhost, hasBuildMode, afterReturn, afterReentry }
    })

    // Pre-conditions: we actually created placement state
    expect(result.hasGhost, 'must have had ghost mesh').toBe(true)
    expect(result.hasBuildMode, 'must have had build mode active').toBe(true)

    // After return: all modes cleaned
    expect(result.afterReturn.ghostExists, 'ghost must not exist after return').toBe(false)
    expect(result.afterReturn.buildModeActive, 'build mode must be off after return').toBe(false)
    expect(result.afterReturn.attackMoveMode, 'attack-move must be off after return').toBe(false)
    expect(result.afterReturn.rallyMode, 'rally mode must be off after return').toBe(false)
    expect(result.afterReturn.rallyBuilding, 'rally building must be null after return').toBe(false)

    // After re-entry: still clean
    expect(result.afterReentry.ghostExists, 'ghost must not exist after re-entry').toBe(false)
    expect(result.afterReentry.buildModeActive, 'build mode must be off after re-entry').toBe(false)
    expect(result.afterReentry.attackMoveMode, 'attack-move must be off after re-entry').toBe(false)
    expect(result.afterReentry.rallyMode, 'rally mode must be off after re-entry').toBe(false)
    expect(result.afterReentry.rallyBuilding, 'rally building must be null after re-entry').toBe(false)

    console.log('[V3-PS2 STALE] Mode cleanup:', JSON.stringify(result, null, 2))
  })

  test('command card resets to empty-slot default after return + re-entry', async ({ page }) => {
    await waitForBoot(page)
    await startGameplay(page)

    const result = await page.evaluate(async () => {
      const g = (window as any).__war3Game
      const returnToMenu = (window as any).__returnToMenu as () => void
      const menuStartBtn = document.getElementById('menu-start-button') as HTMLButtonElement
      const briefingStartBtn = document.getElementById('briefing-start-button') as HTMLButtonElement

      // === Select worker to populate command card with build buttons ===
      const worker = g.units.find((u: any) => u.team === 0 && u.type === 'worker' && u.hp > 0)
      if (worker) {
        g.selectionModel.setSelection([worker])
        g.createSelectionRing(worker)
      }
      await new Promise(r => setTimeout(r, 50))

      const cardBefore = document.getElementById('command-card')!
      const buttonsBefore = cardBefore.querySelectorAll('button')
      const slotsBefore = cardBefore.querySelectorAll('.cmd-slot')
      const hadBuildButtons = buttonsBefore.length > 0

      // === Return to menu ===
      g.pauseGame()
      returnToMenu()
      await new Promise(r => setTimeout(r, 100))

      // === Re-enter gameplay ===
      menuStartBtn.click()
      await new Promise(r => setTimeout(r, 50))
      briefingStartBtn.click()
      await new Promise(r => setTimeout(r, 500))

      // Force a command card refresh by nudging selection
      g.update(0.016)
      await new Promise(r => setTimeout(r, 50))

      // Check command card state after re-entry (no unit selected)
      const cardAfter = document.getElementById('command-card')!
      const buttonsAfter = cardAfter.querySelectorAll('button')
      const slotsAfter = cardAfter.querySelectorAll('.cmd-slot')

      // The command card should show 12 empty slots (no selection = default state)
      return {
        hadBuildButtons,
        buttonsBeforeCount: buttonsBefore.length,
        slotsAfterCount: slotsAfter.length,
        buttonsAfterCount: buttonsAfter.length,
        noSelection: (g.selectionModel?.units?.length ?? 0) === 0,
      }
    })

    // Pre-condition: worker selection produced build buttons
    expect(result.hadBuildButtons, 'must have had build buttons when worker selected').toBe(true)

    // After re-entry: command card shows default empty slots
    expect(result.noSelection, 'must have no selection after re-entry').toBe(true)
    expect(result.buttonsAfterCount, 'command card must have no action buttons').toBe(0)
    expect(result.slotsAfterCount, 'command card must show 12 empty slots').toBe(12)

    console.log('[V3-PS2 STALE] Command card cleanup:', JSON.stringify(result, null, 2))
  })

  test('overlay shells cleaned: pause, results, game-over overlays after return', async ({ page }) => {
    await waitForBoot(page)
    await startGameplay(page)

    const result = await page.evaluate(async () => {
      const g = (window as any).__war3Game
      const returnToMenu = (window as any).__returnToMenu as () => void

      // === Trigger victory to show results ===
      const aiTH = g.units.find((u: any) => u.team === 1 && u.type === 'townhall')
      if (!aiTH) return { error: 'no AI townhall' }
      aiTH.hp = 0
      g.update(0.016)
      await new Promise(r => setTimeout(r, 50))

      const resultsShell = document.getElementById('results-shell')!
      const gameOverOverlay = (window as any).__war3Game.elGameOverOverlay as HTMLElement

      const beforeReturn = {
        resultsVisible: !resultsShell.hidden,
        gameOverOverlayShown: gameOverOverlay?.style.display !== 'none',
        matchResult: g.getMatchResult(),
        isGameOver: g.phase.isGameOver(),
      }

      // === Return to menu ===
      returnToMenu()
      await new Promise(r => setTimeout(r, 100))

      const pauseShell = document.getElementById('pause-shell')!
      const briefingShell = document.getElementById('briefing-shell')!
      const menuShell = document.getElementById('menu-shell')!

      const afterReturn = {
        menuVisible: !menuShell.hidden,
        pauseHidden: pauseShell.hidden,
        resultsHidden: resultsShell.hidden,
        briefingHidden: briefingShell.hidden,
        gameOverOverlayHidden: gameOverOverlay?.style.display === 'none',
        matchResult: g.getMatchResult(),
        isGameOver: g.phase.isGameOver(),
        isPlaying: g.phase.isPlaying(),
      }

      return { beforeReturn, afterReturn }
    })

    expect(result.error).toBeUndefined()

    // Pre-conditions: results were showing
    expect(result.beforeReturn.resultsVisible, 'results must have been visible').toBe(true)
    expect(result.beforeReturn.isGameOver, 'must have been game over').toBe(true)
    expect(result.beforeReturn.matchResult, 'must have had match result').toBeTruthy()

    // After return: all overlays cleaned
    expect(result.afterReturn.menuVisible, 'menu must be visible').toBe(true)
    expect(result.afterReturn.pauseHidden, 'pause must be hidden').toBe(true)
    expect(result.afterReturn.resultsHidden, 'results must be hidden').toBe(true)
    expect(result.afterReturn.briefingHidden, 'briefing must be hidden').toBe(true)
    expect(result.afterReturn.gameOverOverlayHidden, 'game-over overlay must be hidden').toBe(true)
    expect(result.afterReturn.matchResult, 'match result must be cleared').toBeNull()
    expect(result.afterReturn.isGameOver, 'game over flag must be cleared').toBe(false)
    expect(result.afterReturn.isPlaying, 'must not be playing').toBe(false)

    console.log('[V3-PS2 STALE] Overlay cleanup:', JSON.stringify(result, null, 2))
  })

  test('multi-session stress: two cycles with selection + placement leave nothing behind', async ({ page }) => {
    await waitForBoot(page)

    const result = await page.evaluate(async () => {
      const g = (window as any).__war3Game
      const returnToMenu = (window as any).__returnToMenu as () => void
      const menuStartBtn = document.getElementById('menu-start-button') as HTMLButtonElement
      const briefingStartBtn = document.getElementById('briefing-start-button') as HTMLButtonElement

      const cycles: any[] = []

      for (let i = 0; i < 2; i++) {
        // Start session
        menuStartBtn.click()
        await new Promise(r => setTimeout(r, 50))
        briefingStartBtn.click()
        await new Promise(r => setTimeout(r, 300))

        // Create heavy interaction state
        const worker = g.units.find((u: any) => u.team === 0 && u.type === 'worker' && u.hp > 0)
        // Capture old worker reference to verify its health bar is cleaned
        const oldWorker = worker
        if (worker) {
          g.selectionModel.setSelection([worker])
          g.createSelectionRing(worker)
          // Health bar is auto-created by spawn; just record it exists
        }

        // Capture selection state BEFORE enterPlacementMode (which clears selection)
        const hadSelection = (g.selectionModel?.units?.length ?? 0) > 0
        const hadRings = (g.selectionRings?.length ?? 0) > 0

        g.enterPlacementMode('barracks')

        const beforeReturn = {
          selection: hadSelection ? 1 : 0,
          rings: hadRings ? 1 : 0,
          ghost: !!g.ghostMesh,
          buildMode: !!g.placement?.mode,
          gameTime: g.gameTime,
        }

        // Return
        g.pauseGame()
        returnToMenu()
        await new Promise(r => setTimeout(r, 100))

        const afterReturn = {
          selection: (g.selectionModel?.units?.length ?? 0),
          rings: (g.selectionRings?.length ?? 0),
          oldWorkerHealthBarGone: oldWorker ? !g.healthBars.has(oldWorker) : true,
          ghost: !!g.ghostMesh,
          buildMode: !!g.placement?.mode,
          attackMove: !!g.attackMoveMode,
          rally: !!g.rallyMode,
          gameTime: g.gameTime,
          matchResult: g.getMatchResult(),
          isGameOver: g.phase.isGameOver(),
          isPlaying: g.phase.isPlaying(),
          menuVisible: !document.getElementById('menu-shell')!.hidden,
          pauseHidden: document.getElementById('pause-shell')!.hidden,
          resultsHidden: document.getElementById('results-shell')!.hidden,
        }

        cycles.push({ beforeReturn, afterReturn })
      }

      return cycles
    })

    // Verify both cycles
    for (let i = 0; i < result.length; i++) {
      const cycle = result[i]
      const label = `C${i + 1}`

      // Pre-conditions
      expect(cycle.beforeReturn.selection, `${label}: must have had selection`).toBeGreaterThan(0)
      expect(cycle.beforeReturn.rings, `${label}: must have had rings`).toBeGreaterThan(0)
      expect(cycle.beforeReturn.ghost, `${label}: must have had ghost`).toBe(true)

      // Post-cleanup
      expect(cycle.afterReturn.selection, `${label}: selection must be 0`).toBe(0)
      expect(cycle.afterReturn.rings, `${label}: rings must be 0`).toBe(0)
      expect(cycle.afterReturn.oldWorkerHealthBarGone, `${label}: old session health bars must be gone`).toBe(true)
      expect(cycle.afterReturn.ghost, `${label}: ghost must not exist`).toBe(false)
      expect(cycle.afterReturn.buildMode, `${label}: build mode must be off`).toBe(false)
      expect(cycle.afterReturn.attackMove, `${label}: attack-move must be off`).toBe(false)
      expect(cycle.afterReturn.rally, `${label}: rally must be off`).toBe(false)
      expect(cycle.afterReturn.matchResult, `${label}: match result must be null`).toBeNull()
      expect(cycle.afterReturn.isGameOver, `${label}: must not be game over`).toBe(false)
      expect(cycle.afterReturn.isPlaying, `${label}: must not be playing`).toBe(false)
      expect(cycle.afterReturn.menuVisible, `${label}: menu must be visible`).toBe(true)
      expect(cycle.afterReturn.pauseHidden, `${label}: pause must be hidden`).toBe(true)
      expect(cycle.afterReturn.resultsHidden, `${label}: results must be hidden`).toBe(true)
    }

    console.log('[V3-PS2 STALE] Multi-session stress:', JSON.stringify(result, null, 2))
  })

  test('V3-PS2 stale cleanup comprehensive audit: all checks pass', async ({ page }) => {
    await waitForBoot(page)
    await startGameplay(page)

    const audit = await page.evaluate(async () => {
      const g = (window as any).__war3Game
      const returnToMenu = (window as any).__returnToMenu as () => void
      const menuStartBtn = document.getElementById('menu-start-button') as HTMLButtonElement
      const briefingStartBtn = document.getElementById('briefing-start-button') as HTMLButtonElement
      const checks: Record<string, boolean> = {}

      // Create max interaction state
      const worker = g.units.find((u: any) => u.team === 0 && u.type === 'worker' && u.hp > 0)
      if (worker) {
        g.selectionModel.setSelection([worker])
        g.createSelectionRing(worker)
        if (!g.healthBars.has(worker)) g.createHealthBar(worker)
      }
      g.enterPlacementMode('barracks')

      // Return + re-enter
      g.pauseGame()
      returnToMenu()
      await new Promise(r => setTimeout(r, 100))
      menuStartBtn.click()
      await new Promise(r => setTimeout(r, 50))
      briefingStartBtn.click()
      await new Promise(r => setTimeout(r, 500))

      // Force a game update to flush command card rendering
      g.update(0.016)
      await new Promise(r => setTimeout(r, 50))

      // 1. Selection model empty
      checks.selectionEmpty = (g.selectionModel?.units?.length ?? 0) === 0

      // 2. Selection rings empty
      checks.ringsEmpty = (g.selectionRings?.length ?? 0) === 0

      // 3. Health bars from old session gone
      checks.oldHealthBarsGone = worker ? !g.healthBars.has(worker) : true

      // 4. Ghost mesh gone
      checks.ghostGone = !g.ghostMesh

      // 5. Build mode off
      checks.buildModeOff = !g.placement?.mode

      // 6. Attack-move off
      checks.attackMoveOff = !g.attackMoveMode

      // 7. Rally mode off
      checks.rallyOff = !g.rallyMode

      // 8. Command card shows empty slots (no action buttons)
      const card = document.getElementById('command-card')!
      checks.commandCardDefault = card.querySelectorAll('button').length === 0

      // 9. Match result cleared
      checks.matchResultCleared = g.getMatchResult() === null

      // 10. Game over cleared
      checks.gameOverCleared = !g.phase.isGameOver()

      // 11. Pause shell hidden
      checks.pauseShellHidden = document.getElementById('pause-shell')!.hidden

      // 12. Results shell hidden
      checks.resultsShellHidden = document.getElementById('results-shell')!.hidden

      // 13. Game time reset
      checks.gameTimeReset = g.gameTime < 1

      // 14. New session has units
      checks.hasUnits = g.units.length > 0

      return checks
    })

    for (const [check, passed] of Object.entries(audit)) {
      expect(passed, `${check} must be true`).toBe(true)
    }

    const allPassed = Object.values(audit).every(Boolean)
    expect(allPassed, 'All stale cleanup checks must pass').toBe(true)

    console.log('[V3-PS2 STALE CLOSEOUT AUDIT]', JSON.stringify(audit, null, 2))
  })
})
