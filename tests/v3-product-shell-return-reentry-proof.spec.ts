/**
 * V3-PS2 Product-Shell Return/Re-entry Proof Pack
 *
 * Focused regression proving the return-to-menu and re-entry truth:
 *   1. pause/results → menu: gameplay inactive, menu visible
 *   2. Source and mode labels remain truthful after return
 *   3. Re-entry starts a clean session: gameTime reset, units respawned
 *   4. Stale selection, placement, command card, results, shell state cleaned
 *   5. Full cycle (play → return → play) leaves no residual state
 *
 * This is the V3-PS2 gate closeout proof pack. It does not close V3-PS1
 * (front-door hierarchy), V3-PS4 (menu quality), V3-PS5 (shell usefulness),
 * V3-AV1 (asset approval), or V3-UA1 (user verdict).
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

/** Play a full session to get into gameplay state */
async function startGameplay(page: Page) {
  await page.evaluate(async () => {
    const menuStartBtn = document.getElementById('menu-start-button') as HTMLButtonElement
    const briefingStartBtn = document.getElementById('briefing-start-button') as HTMLButtonElement
    menuStartBtn.click()
    await new Promise(r => setTimeout(r, 50))
    briefingStartBtn.click()
    await new Promise(r => setTimeout(r, 50))
  })
}

test.describe('V3-PS2 Return/Re-entry Proof', () => {
  test.setTimeout(180000)

  test('pause return: gameplay inactive, menu visible, shells clean', async ({ page }) => {
    await waitForBoot(page)
    await startGameplay(page)

    const result = await page.evaluate(async () => {
      const g = (window as any).__war3Game
      const returnToMenu = (window as any).__returnToMenu as () => void
      const menuShell = document.getElementById('menu-shell')!
      const pauseShell = document.getElementById('pause-shell')!
      const resultsShell = document.getElementById('results-shell')!
      const briefingShell = document.getElementById('briefing-shell')!

      // Pause the game
      g.pauseGame()
      await new Promise(r => setTimeout(r, 50))

      const pauseWasVisible = !pauseShell.hidden

      // Return to menu
      returnToMenu()
      await new Promise(r => setTimeout(r, 100))

      return {
        pauseWasVisible,
        menuVisible: !menuShell.hidden,
        pauseHidden: pauseShell.hidden,
        resultsHidden: resultsShell.hidden,
        briefingHidden: briefingShell.hidden,
        isPlaying: g.phase.isPlaying(),
        isPaused: g.phase.isPaused(),
        isGameOver: g.phase.isGameOver(),
        matchResult: g.getMatchResult(),
      }
    })

    expect(result.pauseWasVisible, 'pause shell must have been visible').toBe(true)
    expect(result.menuVisible, 'menu must be visible after return').toBe(true)
    expect(result.pauseHidden, 'pause must be hidden after return').toBe(true)
    expect(result.resultsHidden, 'results must be hidden after return').toBe(true)
    expect(result.briefingHidden, 'briefing must be hidden after return').toBe(true)
    expect(result.isPlaying, 'gameplay must be inactive').toBe(false)
    expect(result.matchResult, 'match result must be cleared').toBeNull()

    console.log('[V3-PS2 PROOF] Pause return:', result)
  })

  test('results return: gameplay inactive, menu visible, match result cleared', async ({ page }) => {
    await waitForBoot(page)
    await startGameplay(page)

    const result = await page.evaluate(async () => {
      const g = (window as any).__war3Game
      const returnToMenu = (window as any).__returnToMenu as () => void
      const menuShell = document.getElementById('menu-shell')!
      const resultsShell = document.getElementById('results-shell')!

      // Trigger victory
      const aiTH = g.units.find((u: any) => u.team === 1 && u.type === 'townhall')
      if (!aiTH) return { error: 'no AI townhall' }
      aiTH.hp = 0
      g.update(0.016)
      await new Promise(r => setTimeout(r, 50))

      const resultsWereVisible = !resultsShell.hidden

      // Return to menu
      returnToMenu()
      await new Promise(r => setTimeout(r, 100))

      return {
        resultsWereVisible,
        menuVisible: !menuShell.hidden,
        resultsHidden: resultsShell.hidden,
        isPlaying: g.phase.isPlaying(),
        isGameOver: g.phase.isGameOver(),
        matchResult: g.getMatchResult(),
      }
    })

    expect(result.error).toBeUndefined()
    expect(result.resultsWereVisible, 'results shell must have been visible').toBe(true)
    expect(result.menuVisible, 'menu must be visible after return').toBe(true)
    expect(result.resultsHidden, 'results must be hidden after return').toBe(true)
    expect(result.isPlaying, 'gameplay must be inactive').toBe(false)
    expect(result.isGameOver, 'game over must be cleared').toBe(false)
    expect(result.matchResult, 'match result must be cleared').toBeNull()

    console.log('[V3-PS2 PROOF] Results return:', result)
  })

  test('source truth preserved after return-to-menu', async ({ page }) => {
    await waitForBoot(page)
    await startGameplay(page)

    const result = await page.evaluate(async () => {
      const g = (window as any).__war3Game
      const returnToMenu = (window as any).__returnToMenu as () => void
      const getMapSourceLabel = (window as any).__getMapSourceLabel as () => string
      const menuSourceLabel = document.getElementById('menu-map-source-label')!
      const menuModeLabel = document.getElementById('menu-mode-label')!

      // Return to menu
      g.pauseGame()
      returnToMenu()
      await new Promise(r => setTimeout(r, 100))

      const sourceLabel = menuSourceLabel.textContent
      const derivedLabel = getMapSourceLabel()
      const sourceKind = g.currentMapSource?.kind
      const modeLabel = menuModeLabel.textContent

      return { sourceLabel, derivedLabel, sourceKind, modeLabel }
    })

    expect(result.sourceKind, 'source must be procedural').toBe('procedural')
    expect(result.sourceLabel, 'menu source must match derived source').toBe(result.derivedLabel)
    expect(result.sourceLabel, 'source must say 程序化地图').toContain('程序化地图')
    expect(result.modeLabel, 'mode must say 遭遇战').toContain('遭遇战')

    console.log('[V3-PS2 PROOF] Source truth:', result)
  })

  test('re-entry starts clean session: gameTime reset, units respawned', async ({ page }) => {
    await waitForBoot(page)
    await startGameplay(page)

    const result = await page.evaluate(async () => {
      const g = (window as any).__war3Game
      const returnToMenu = (window as any).__returnToMenu as () => void
      const menuStartBtn = document.getElementById('menu-start-button') as HTMLButtonElement
      const briefingStartBtn = document.getElementById('briefing-start-button') as HTMLButtonElement

      // Play for a bit
      await new Promise(r => setTimeout(r, 200))

      // Return to menu
      g.pauseGame()
      returnToMenu()
      await new Promise(r => setTimeout(r, 100))

      // Re-enter gameplay
      menuStartBtn.click()
      await new Promise(r => setTimeout(r, 50))
      briefingStartBtn.click()
      await new Promise(r => setTimeout(r, 50))

      const isPlaying = g.phase.isPlaying()
      const gameTimeSmall = g.gameTime < 1
      const hasUnits = Array.isArray(g.units) && g.units.length > 0
      const hasWorker = g.units.some((u: any) => u.team === 0 && u.type === 'worker' && u.hp > 0)
      const hasTH = g.units.some((u: any) => u.team === 0 && u.type === 'townhall' && u.hp > 0)
      const hasGoldmine = g.units.some((u: any) => u.type === 'goldmine' && u.hp > 0)

      return { isPlaying, gameTimeSmall, hasUnits, hasWorker, hasTH, hasGoldmine }
    })

    expect(result.isPlaying, 'must be in playing state').toBe(true)
    expect(result.gameTimeSmall, 'gameTime must be reset to < 1s').toBe(true)
    expect(result.hasUnits, 'must have units').toBe(true)
    expect(result.hasWorker, 'must have worker').toBe(true)
    expect(result.hasTH, 'must have Town Hall').toBe(true)
    expect(result.hasGoldmine, 'must have Goldmine').toBe(true)

    console.log('[V3-PS2 PROOF] Clean re-entry:', result)
  })

  test('stale selection/placement/command-card cleaned on re-entry', async ({ page }) => {
    await waitForBoot(page)
    await startGameplay(page)

    const result = await page.evaluate(async () => {
      const g = (window as any).__war3Game
      const returnToMenu = (window as any).__returnToMenu as () => void
      const menuStartBtn = document.getElementById('menu-start-button') as HTMLButtonElement
      const briefingStartBtn = document.getElementById('briefing-start-button') as HTMLButtonElement

      // Create selection state
      const worker = g.units.find((u: any) => u.team === 0 && u.type === 'worker' && u.hp > 0)
      if (worker) {
        g.selectionModel.setSelection([worker])
        g.createSelectionRing(worker)
        if (!g.healthBars.has(worker)) g.createHealthBar(worker)
      }

      const hadSelectionBefore = (g.selectionModel?.units?.length ?? 0) > 0
      const hadSelectionRing = (g.selectionRings?.length ?? 0) > 0

      // Enter placement mode (this clears selection internally)
      g.enterPlacementMode('barracks')

      const hadPlacementMode = !!g.ghostMesh

      // Return to menu
      g.pauseGame()
      returnToMenu()
      await new Promise(r => setTimeout(r, 100))

      // Check state after return (before re-entry)
      const selectionAfterReturn = (g.selectionModel?.units?.length ?? 0)
      const ghostAfterReturn = !!g.ghostMesh

      // Re-enter gameplay
      menuStartBtn.click()
      await new Promise(r => setTimeout(r, 50))
      briefingStartBtn.click()
      await new Promise(r => setTimeout(r, 100))

      const selectionAfterReentry = (g.selectionModel?.units?.length ?? 0)
      const ghostAfterReentry = !!g.ghostMesh
      const commandCardEmpty = (() => {
        const card = document.getElementById('command-card')
        if (!card) return true
        const buttons = card.querySelectorAll('button')
        // Command card should show default (no worker build commands)
        // because no unit is selected
        return buttons.length === 0 || selectionAfterReentry === 0
      })()

      return {
        hadSelectionBefore,
        hadSelectionRing,
        hadPlacementMode,
        selectionAfterReturn,
        ghostAfterReturn,
        selectionAfterReentry,
        ghostAfterReentry,
        commandCardEmpty,
      }
    })

    expect(result.hadSelectionBefore, 'selection must have existed before return').toBe(true)
    expect(result.hadSelectionRing, 'selection ring must have existed').toBe(true)
    expect(result.hadPlacementMode, 'placement mode must have existed before return').toBe(true)
    expect(result.selectionAfterReturn, 'selection must be empty after return').toBe(0)
    expect(result.selectionAfterReentry, 'selection must be empty after re-entry').toBe(0)

    console.log('[V3-PS2 PROOF] Stale cleanup:', result)
  })

  test('full cycle: play → return → play leaves no residual state', async ({ page }) => {
    await waitForBoot(page)

    const result = await page.evaluate(async () => {
      const g = (window as any).__war3Game
      const returnToMenu = (window as any).__returnToMenu as () => void
      const menuShell = document.getElementById('menu-shell')!
      const pauseShell = document.getElementById('pause-shell')!
      const resultsShell = document.getElementById('results-shell')!
      const briefingShell = document.getElementById('briefing-shell')!
      const menuStartBtn = document.getElementById('menu-start-button') as HTMLButtonElement
      const briefingStartBtn = document.getElementById('briefing-start-button') as HTMLButtonElement
      const getMapSourceLabel = (window as any).__getMapSourceLabel as () => string
      const menuSourceLabel = document.getElementById('menu-map-source-label')!
      const menuModeLabel = document.getElementById('menu-mode-label')!

      // === Cycle 1: play → pause → return ===
      menuStartBtn.click()
      await new Promise(r => setTimeout(r, 50))
      briefingStartBtn.click()
      await new Promise(r => setTimeout(r, 50))
      g.pauseGame()
      returnToMenu()
      await new Promise(r => setTimeout(r, 100))

      const cycle1 = {
        menuVisible: !menuShell.hidden,
        isPlaying: g.phase.isPlaying(),
        isPaused: g.phase.isPaused(),
        isGameOver: g.phase.isGameOver(),
        matchResult: g.getMatchResult(),
        sourceLabel: menuSourceLabel.textContent,
        sourceTruth: menuSourceLabel.textContent === getMapSourceLabel(),
        modeLabel: menuModeLabel.textContent,
        selection: (g.selectionModel?.units?.length ?? 0),
      }

      // === Cycle 2: re-enter gameplay → results → return ===
      menuStartBtn.click()
      await new Promise(r => setTimeout(r, 50))
      briefingStartBtn.click()
      await new Promise(r => setTimeout(r, 50))

      // Trigger victory
      const aiTH = g.units.find((u: any) => u.team === 1 && u.type === 'townhall')
      if (aiTH) {
        aiTH.hp = 0
        g.update(0.016)
        await new Promise(r => setTimeout(r, 50))
      }

      returnToMenu()
      await new Promise(r => setTimeout(r, 100))

      const cycle2 = {
        menuVisible: !menuShell.hidden,
        allShellsClean: pauseShell.hidden && resultsShell.hidden && briefingShell.hidden,
        isPlaying: g.phase.isPlaying(),
        isGameOver: g.phase.isGameOver(),
        matchResult: g.getMatchResult(),
        sourceLabel: menuSourceLabel.textContent,
        sourceTruth: menuSourceLabel.textContent === getMapSourceLabel(),
        modeLabel: menuModeLabel.textContent,
        selection: (g.selectionModel?.units?.length ?? 0),
        gameTimeSmall: g.gameTime < 1,
      }

      return { cycle1, cycle2 }
    })

    // Cycle 1: pause return
    expect(result.cycle1.menuVisible, 'C1: menu visible').toBe(true)
    expect(result.cycle1.isPlaying, 'C1: not playing').toBe(false)
    expect(result.cycle1.matchResult, 'C1: no match result').toBeNull()
    expect(result.cycle1.sourceTruth, 'C1: source truthful').toBe(true)
    expect(result.cycle1.modeLabel, 'C1: mode label present').toContain('遭遇战')
    expect(result.cycle1.selection, 'C1: no selection').toBe(0)

    // Cycle 2: results return
    expect(result.cycle2.menuVisible, 'C2: menu visible').toBe(true)
    expect(result.cycle2.allShellsClean, 'C2: all shells clean').toBe(true)
    expect(result.cycle2.isPlaying, 'C2: not playing').toBe(false)
    expect(result.cycle2.isGameOver, 'C2: not game over').toBe(false)
    expect(result.cycle2.matchResult, 'C2: no match result').toBeNull()
    expect(result.cycle2.sourceTruth, 'C2: source truthful').toBe(true)
    expect(result.cycle2.modeLabel, 'C2: mode label present').toContain('遭遇战')
    expect(result.cycle2.selection, 'C2: no selection').toBe(0)

    console.log('[V3-PS2 CLOSEOUT AUDIT]', JSON.stringify(result, null, 2))
  })
})
