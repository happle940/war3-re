/**
 * V9 Baseline Replay Smoke Pack
 *
 * Replays the minimum critical path from V8 demo smoke and V8 RC smoke,
 * proving the V8 candidate baseline is reproducible, cleanable, and
 * explainable at V9 start.
 *
 * This is NOT new content, AI strategy, asset work, or expansion direction.
 * It is a baseline replay: "what V8 proved still holds."
 *
 * Known gaps (NOT regressions — these were already missing in V8):
 *   - No hero / shop / neutral / campaign / multiplayer / ladder / replay
 *   - Visual assets are S0 fallback / project proxy, not final art
 *   - AI uses accepted composition rules but has limited variety
 *   - Only Human race is playable
 *
 * What would be a regression (must fail this test):
 *   - Entry page blank or crashed
 *   - Menu / briefing / play / pause / return path broken
 *   - V7 content (lumber mill, tower, arcane sanctum, workshop) disconnected
 *   - V7 combat models (heal ally-only, mortar AOE filter) broken
 *   - Stale state leak between sessions
 *   - Cleanup leaving behind units, outlines, health bars, or renderer state
 */
import { test, expect, type Page } from '@playwright/test'
import {
  AttackType,
  BUILDINGS,
  MORTAR_AOE_RADIUS,
  PEASANT_BUILD_MENU,
  UNITS,
} from '../src/game/GameData'

const BASE_NORMAL = 'http://127.0.0.1:4173/'
const BASE_RUNTIME = 'http://127.0.0.1:4173/?runtimeTest=1'

async function waitForBoot(page: Page, url: string = BASE_NORMAL) {
  const consoleErrors: string[] = []
  page.on('console', (msg) => {
    if (msg.type() === 'error') consoleErrors.push(msg.text())
  })
  ;(page as any).__consoleErrors = consoleErrors

  await page.goto(url, { waitUntil: 'domcontentloaded' })
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

test.describe('V9 Baseline Replay Smoke', () => {
  test.setTimeout(120000)

  // ===== V8 demo path replay =====

  test('BL-1: V8 demo entry path still works — menu, start, scope notice', async ({ page }) => {
    await waitForBoot(page)

    const result = await page.evaluate(async () => {
      const menuShell = document.getElementById('menu-shell')!
      const scopeNotice = document.getElementById('menu-scope-notice')!
      const menuStartBtn = document.getElementById('menu-start-button') as HTMLButtonElement
      const briefingStartBtn = document.getElementById('briefing-start-button') as HTMLButtonElement

      // Entry not blank: menu visible with scope notice
      const menuVisible = !menuShell.hidden
      const scopeRect = scopeNotice.getBoundingClientRect()
      const scopeText = scopeNotice.textContent ?? ''

      // Start session
      menuStartBtn.click()
      await new Promise(r => setTimeout(r, 50))
      briefingStartBtn.click()
      await new Promise(r => setTimeout(r, 50))

      const g = (window as any).__war3Game
      const isPlaying = g.phase.isPlaying()
      const units = g.units
      const playerWorkers = units.filter(
        (u: any) => u.team === 0 && u.type === 'worker' && !u.isBuilding && u.hp > 0,
      )

      return {
        menuVisible,
        scopeVisible: scopeRect.width > 0 && scopeRect.height > 0,
        scopeHasPlayable: scopeText.includes('可玩'),
        scopeHasMissing: scopeText.includes('尚未'),
        scopeHasFeedback: scopeText.includes('反馈'),
        scopeHasBoundary: scopeText.includes('不是完整 War3'),
        isPlaying,
        workerCount: playerWorkers.length,
      }
    })

    // Demo entry path
    expect(result.menuVisible).toBe(true)
    expect(result.scopeVisible).toBe(true)
    expect(result.scopeHasPlayable).toBe(true)
    expect(result.scopeHasMissing).toBe(true)
    expect(result.scopeHasFeedback).toBe(true)
    expect(result.scopeHasBoundary).toBe(true)
    expect(result.isPlaying).toBe(true)
    expect(result.workerCount).toBeGreaterThanOrEqual(3)
  })

  test('BL-2: V8 demo pause/return and results/return paths still work', async ({ page }) => {
    await waitForBoot(page)

    const result = await page.evaluate(async () => {
      const g = (window as any).__war3Game
      const menuShell = document.getElementById('menu-shell')!
      const pauseShell = document.getElementById('pause-shell')!
      const resultsShell = document.getElementById('results-shell')!
      const menuStartBtn = document.getElementById('menu-start-button') as HTMLButtonElement
      const briefingStartBtn = document.getElementById('briefing-start-button') as HTMLButtonElement
      const pauseReturnBtn = document.getElementById('pause-return-menu-button') as HTMLButtonElement

      // Start → briefing → play
      menuStartBtn.click()
      await new Promise(r => setTimeout(r, 50))
      briefingStartBtn.click()
      await new Promise(r => setTimeout(r, 50))

      // Pause → return to menu
      g.pauseGame()
      await new Promise(r => setTimeout(r, 50))
      const pauseVisible = !pauseShell.hidden

      pauseReturnBtn.click()
      await new Promise(r => setTimeout(r, 100))
      const menuAfterPauseReturn = !menuShell.hidden

      // Start again → trigger victory → return from results
      menuStartBtn.click()
      await new Promise(r => setTimeout(r, 50))
      briefingStartBtn.click()
      await new Promise(r => setTimeout(r, 50))

      // Read fresh units after restart
      const aiTH = g.units.find((u: any) => u.team === 1 && u.type === 'townhall')
      if (!aiTH) return { error: 'no AI townhall' }
      aiTH.hp = 0
      g.update(0.016)
      await new Promise(r => setTimeout(r, 50))

      const resultsVisible = !resultsShell.hidden
      const resultsReturnBtn = document.getElementById('results-return-menu-button') as HTMLButtonElement
      resultsReturnBtn.click()
      await new Promise(r => setTimeout(r, 100))

      const menuAfterResultsReturn = !menuShell.hidden
      const isPaused = g.isPaused()

      return {
        pauseVisible,
        menuAfterPauseReturn,
        resultsVisible,
        menuAfterResultsReturn,
        isPaused,
      }
    })

    expect(result.error).toBeUndefined()
    expect(result.pauseVisible).toBe(true)
    expect(result.menuAfterPauseReturn).toBe(true)
    expect(result.resultsVisible).toBe(true)
    expect(result.menuAfterResultsReturn).toBe(true)
    expect(result.isPaused).toBe(true)
  })

  // ===== V8 RC stability replay =====

  test('BL-3: V7 content data tables and training still connected', async ({ page }) => {
    // Static data
    expect(PEASANT_BUILD_MENU).toContain('lumber_mill')
    expect(PEASANT_BUILD_MENU).toContain('tower')
    expect(PEASANT_BUILD_MENU).toContain('arcane_sanctum')
    expect(PEASANT_BUILD_MENU).toContain('workshop')
    expect(BUILDINGS.tower.techPrereq).toBe('lumber_mill')
    expect(BUILDINGS.workshop.trains).toContain('mortar_team')
    expect(UNITS.mortar_team.attackType).toBe(AttackType.Siege)
    expect(MORTAR_AOE_RADIUS).toBeGreaterThan(0)

    // Runtime training
    await waitForRuntime(page)

    const result = await page.evaluate(() => {
      const g = (window as any).__war3Game
      if (!g) throw new Error('no game')

      g.resources.earn(0, 5000, 3000)
      g.spawnBuilding('farm', 0, 28, 28)
      g.spawnBuilding('barracks', 0, 31, 28)
      g.spawnBuilding('lumber_mill', 0, 34, 28)
      g.spawnBuilding('keep', 0, 25, 28)
      const sanctum = g.spawnBuilding('arcane_sanctum', 0, 37, 28)
      const workshop = g.spawnBuilding('workshop', 0, 40, 28)

      g.selectionModel.setSelection([sanctum])
      g._lastCmdKey = ''
      g.updateHUD(0.016)
      const priestBtn = [...document.querySelectorAll('#command-card button')].find(
        (b: any) => b.querySelector('.btn-label')?.textContent?.trim() === '牧师',
      ) as HTMLButtonElement | undefined
      priestBtn?.click()

      g.selectionModel.setSelection([workshop])
      g._lastCmdKey = ''
      g.updateHUD(0.016)
      const mortarBtn = [...document.querySelectorAll('#command-card button')].find(
        (b: any) => b.querySelector('.btn-label')?.textContent?.trim() === '迫击炮小队',
      ) as HTMLButtonElement | undefined
      mortarBtn?.click()

      return {
        priestQueued: sanctum.trainingQueue.length > 0,
        priestType: sanctum.trainingQueue[0]?.type ?? '',
        mortarQueued: workshop.trainingQueue.length > 0,
        mortarType: workshop.trainingQueue[0]?.type ?? '',
      }
    })

    expect(result.priestQueued).toBe(true)
    expect(result.priestType).toBe('priest')
    expect(result.mortarQueued).toBe(true)
    expect(result.mortarType).toBe('mortar_team')
  })

  test('BL-4: V7 combat models (heal filter, AOE filter) still correct', async ({ page }) => {
    await waitForRuntime(page)

    const result = await page.evaluate(() => {
      const g = (window as any).__war3Game
      if (!g) throw new Error('no game')

      // Heal: ally-only
      const priest = g.spawnUnit('priest', 0, 45, 45)
      const ally = g.spawnUnit('footman', 0, 45, 46)
      const enemy = g.spawnUnit('footman', 1, 45, 47)
      ally.hp -= 50
      const allyBefore = ally.hp
      const enemyBefore = enemy.hp
      const healAlly = g.castHeal(priest, ally)
      priest.healCooldownUntil = 0
      const healEnemy = g.castHeal(priest, enemy)

      // Mortar AOE: damage enemies, filter allies and goldmine
      const mortar = g.spawnUnit('mortar_team', 0, 50, 50)
      const primary = g.spawnUnit('footman', 1, 56, 50)
      const splashEnemy = g.spawnUnit('footman', 1, 57, 50)
      const allyNear = g.spawnUnit('footman', 0, 57, 51)
      const mine = g.spawnBuilding('goldmine', -1, 57, 49)
      const before = { primary: primary.hp, splash: splashEnemy.hp, ally: allyNear.hp, mine: mine.hp }
      g.dealDamage(mortar, primary)

      const proof = {
        healAlly, healEnemy,
        allyHealed: ally.hp > allyBefore,
        enemyNotHealed: enemy.hp === enemyBefore,
        primaryDamaged: primary.hp < before.primary,
        splashDamaged: splashEnemy.hp < before.splash,
        allyFiltered: allyNear.hp === before.ally,
        mineFiltered: mine.hp === before.mine,
      }

      for (const u of [priest, ally, enemy, mortar, primary, splashEnemy, allyNear]) { u.hp = 0 }
      g.handleDeadUnits()
      g.removeTestUnit(mine)

      return proof
    })

    expect(result.healAlly).toBe(true)
    expect(result.healEnemy).toBe(false)
    expect(result.allyHealed).toBe(true)
    expect(result.enemyNotHealed).toBe(true)
    expect(result.primaryDamaged).toBe(true)
    expect(result.splashDamaged).toBe(true)
    expect(result.allyFiltered).toBe(true)
    expect(result.mineFiltered).toBe(true)
  })

  test('BL-5: full session lifecycle + cleanup + recovery still clean', async ({ page }) => {
    await waitForRuntime(page)

    const result = await page.evaluate(() => {
      const g = (window as any).__war3Game
      if (!g) throw new Error('no game')

      // Create V7 content state
      g.spawnBuilding('lumber_mill', 0, 66, 66)
      g.spawnBuilding('arcane_sanctum', 0, 69, 66)
      g.spawnBuilding('workshop', 0, 72, 66)
      g.spawnUnit('priest', 0, 69, 69)
      g.spawnUnit('mortar_team', 0, 72, 69)

      // Cleanup
      g.disposeAllUnits()
      const afterDispose = {
        units: g.units.length,
        selected: g.selectionModel.units.length,
        outlines: g.outlineObjects.length,
        healthBars: g.healthBars.size,
      }

      // Recover to procedural start
      g.resetToProceduralStart()
      if (g.ai) {
        if (typeof g.ai.reset === 'function') g.ai.reset()
        g.ai.update = () => {}
      }

      return {
        afterDispose,
        recoveredUnits: g.units.length,
        hasTownhall: g.units.some((u: any) => u.team === 0 && u.type === 'townhall' && u.hp > 0),
        workerCount: g.units.filter((u: any) => u.team === 0 && u.type === 'worker' && u.hp > 0).length,
      }
    })

    // Cleanup was complete
    expect(result.afterDispose.units).toBe(0)
    expect(result.afterDispose.selected).toBe(0)
    expect(result.afterDispose.outlines).toBe(0)
    expect(result.afterDispose.healthBars).toBe(0)

    // Recovery worked
    expect(result.recoveredUnits).toBeGreaterThan(0)
    expect(result.hasTownhall).toBe(true)
    expect(result.workerCount).toBeGreaterThanOrEqual(5)
  })
})
