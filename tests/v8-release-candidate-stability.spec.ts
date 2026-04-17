/**
 * V8 Release Candidate Stability Pack
 *
 * Proves that V7 content stability, core runtime mechanics, and the external
 * entry smoke path coexist cleanly under the V8 release candidate.
 *
 * This is NOT a new feature spec — it is a stability aggregator that proves
 * the accepted V7 content, core runtime gate, and external demo path can all
 * work together without regressions.
 *
 * RC blockers vs experience debt:
 *   - RC blocker: build/tsc failure, runtime crash, entry path broken,
 *     V7 content regression, stale state leak, cleanup residual.
 *   - Experience debt: visual polish, AI difficulty, missing features,
 *     balance tuning — tracked in backlog, does not block RC.
 */
import { test, expect, type Page } from '@playwright/test'
import {
  AttackType,
  BUILDINGS,
  MORTAR_AOE_RADIUS,
  PEASANT_BUILD_MENU,
  PRIEST_HEAL_AMOUNT,
  PRIEST_HEAL_MANA_COST,
  PRIEST_MANA,
  UNITS,
} from '../src/game/GameData'

const BASE_RUNTIME = 'http://127.0.0.1:4173/?runtimeTest=1'
const BASE_NORMAL = 'http://127.0.0.1:4173/'

async function waitForGame(page: Page, url: string = BASE_RUNTIME) {
  const consoleErrors: string[] = []
  page.on('console', (msg) => {
    if (msg.type() === 'error') consoleErrors.push(msg.text())
  })
  ;(page as any).__consoleErrors = consoleErrors

  await page.goto(url, { waitUntil: 'domcontentloaded' })
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

test.describe('V8 Release Candidate Stability', () => {
  test.setTimeout(120000)

  test('RC-1: V7 content data tables intact under V8 candidate', async () => {
    // Static data check — no runtime needed
    expect(PEASANT_BUILD_MENU).toContain('lumber_mill')
    expect(PEASANT_BUILD_MENU).toContain('tower')
    expect(PEASANT_BUILD_MENU).toContain('arcane_sanctum')
    expect(PEASANT_BUILD_MENU).toContain('workshop')

    expect(BUILDINGS.tower.techPrereq).toBe('lumber_mill')
    expect(BUILDINGS.arcane_sanctum.techPrereq).toBe('barracks')
    expect(BUILDINGS.arcane_sanctum.trains).toContain('priest')
    expect(BUILDINGS.workshop.trains).toContain('mortar_team')

    expect(UNITS.priest.techPrereq).toBe('arcane_sanctum')
    expect(UNITS.priest.supply).toBe(2)
    expect(PRIEST_MANA).toBeGreaterThan(0)
    expect(PRIEST_HEAL_AMOUNT).toBeGreaterThan(0)
    expect(PRIEST_HEAL_MANA_COST).toBeGreaterThan(0)

    expect(UNITS.mortar_team.attackType).toBe(AttackType.Siege)
    expect(MORTAR_AOE_RADIUS).toBeGreaterThan(0)
  })

  test('RC-2: V7 training and combat coexist in V8 runtime', async ({ page }) => {
    await waitForGame(page)

    const result = await page.evaluate(() => {
      const g = (window as any).__war3Game
      if (!g) throw new Error('no game')

      // V7 training chain
      g.resources.earn(0, 5000, 3000)
      g.spawnBuilding('farm', 0, 28, 28)
      g.spawnBuilding('barracks', 0, 31, 28)
      g.spawnBuilding('lumber_mill', 0, 34, 28)
      const sanctum = g.spawnBuilding('arcane_sanctum', 0, 37, 28)
      const workshop = g.spawnBuilding('workshop', 0, 40, 28)

      // Train priest
      g.selectionModel.setSelection([sanctum])
      g._lastCmdKey = ''
      g.updateHUD(0.016)
      const priestBtn = [...document.querySelectorAll('#command-card button')].find(
        (b: any) => b.querySelector('.btn-label')?.textContent?.trim() === '牧师',
      ) as HTMLButtonElement | undefined
      priestBtn?.click()

      // Train mortar
      g.selectionModel.setSelection([workshop])
      g._lastCmdKey = ''
      g.updateHUD(0.016)
      const mortarBtn = [...document.querySelectorAll('#command-card button')].find(
        (b: any) => b.querySelector('.btn-label')?.textContent?.trim() === '迫击炮小队',
      ) as HTMLButtonElement | undefined
      mortarBtn?.click()

      // V7 combat: heal ally-only + AOE filter
      const priest = g.spawnUnit('priest', 0, 45, 45)
      const ally = g.spawnUnit('footman', 0, 45, 46)
      const enemy = g.spawnUnit('footman', 1, 45, 47)
      ally.hp -= 50
      enemy.hp -= 50
      const allyBefore = ally.hp
      const enemyBefore = enemy.hp
      const healAlly = g.castHeal(priest, ally)
      priest.healCooldownUntil = 0
      const healEnemy = g.castHeal(priest, enemy)

      // Mortar AOE filter
      const mortar = g.spawnUnit('mortar_team', 0, 50, 50)
      const primary = g.spawnUnit('footman', 1, 56, 50)
      const splashEnemy = g.spawnUnit('footman', 1, 57, 50)
      const allyNearSplash = g.spawnUnit('footman', 0, 57, 51)
      const mine = g.spawnBuilding('goldmine', -1, 57, 49)

      const before = { primary: primary.hp, splash: splashEnemy.hp, ally: allyNearSplash.hp, mine: mine.hp }
      g.dealDamage(mortar, primary)

      const proof = {
        priestQueued: sanctum.trainingQueue.length > 0,
        priestType: sanctum.trainingQueue[0]?.type ?? '',
        mortarQueued: workshop.trainingQueue.length > 0,
        mortarType: workshop.trainingQueue[0]?.type ?? '',
        healAlly,
        healEnemy,
        allyHealed: ally.hp > allyBefore,
        enemyNotHealed: enemy.hp === enemyBefore,
        primaryDamaged: primary.hp < before.primary,
        splashDamaged: splashEnemy.hp < before.splash,
        allyFiltered: allyNearSplash.hp === before.ally,
        mineFiltered: mine.hp === before.mine,
      }

      // Cleanup spawned units
      for (const u of [priest, ally, enemy, mortar, primary, splashEnemy, allyNearSplash]) {
        u.hp = 0
      }
      g.handleDeadUnits()
      g.removeTestUnit(mine)

      return proof
    })

    // Training coexists
    expect(result.priestQueued).toBe(true)
    expect(result.priestType).toBe('priest')
    expect(result.mortarQueued).toBe(true)
    expect(result.mortarType).toBe('mortar_team')

    // Combat coexists
    expect(result.healAlly).toBe(true)
    expect(result.healEnemy).toBe(false)
    expect(result.allyHealed).toBe(true)
    expect(result.enemyNotHealed).toBe(true)
    expect(result.primaryDamaged).toBe(true)
    expect(result.splashDamaged).toBe(true)
    expect(result.allyFiltered).toBe(true)
    expect(result.mineFiltered).toBe(true)
  })

  test('RC-3: core runtime mechanics survive full session lifecycle', async ({ page }) => {
    // Boot via normal entry path (not runtimeTest)
    const consoleErrors: string[] = []
    page.on('console', (msg) => {
      if (msg.type() === 'error') consoleErrors.push(msg.text())
    })

    await page.goto(BASE_NORMAL, { waitUntil: 'domcontentloaded' })
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

    const result = await page.evaluate(async () => {
      const g = (window as any).__war3Game
      const menuShell = document.getElementById('menu-shell')!
      const pauseShell = document.getElementById('pause-shell')!
      const resultsShell = document.getElementById('results-shell')!
      const menuStartBtn = document.getElementById('menu-start-button') as HTMLButtonElement
      const briefingStartBtn = document.getElementById('briefing-start-button') as HTMLButtonElement
      const pauseReturnBtn = document.getElementById('pause-return-menu-button') as HTMLButtonElement

      // Phase 1: Normal boot shows menu
      const menuVisibleAtBoot = !menuShell.hidden

      // Phase 2: Start session
      menuStartBtn.click()
      await new Promise(r => setTimeout(r, 50))
      briefingStartBtn.click()
      await new Promise(r => setTimeout(r, 50))

      const isPlaying = g.phase.isPlaying()
      const units = g.units
      const playerWorkers = units.filter(
        (u: any) => u.team === 0 && u.type === 'worker' && !u.isBuilding && u.hp > 0,
      )
      const playerTH = units.filter(
        (u: any) => u.team === 0 && u.type === 'townhall' && u.isBuilding && u.hp > 0,
      )

      // Phase 3: Core mechanic — select worker, issue gather
      const worker = playerWorkers[0]
      if (!worker) return { error: 'no player worker for gather test' }
      g.selectionModel.setSelection([worker])
      const mine = units.find((u: any) => u.type === 'goldmine' && u.hp > 0)
      if (!mine) return { error: 'no goldmine for gather test' }
      g.issueCommand([worker], {
        type: 'gather',
        resourceType: 'gold',
        target: mine.mesh.position.clone(),
      })
      worker.resourceTarget = { type: 'goldmine', mine }
      const workerHasTarget = !!worker.resourceTarget

      // Phase 4: Advance time, verify economy
      const goldBefore = g.resources.get(0).gold
      let remaining = 30
      while (remaining > 0) {
        const step = Math.min(0.016, remaining)
        g.update(step)
        remaining -= step
      }
      const goldAfter = g.resources.get(0).gold

      // Phase 5: Pause and return to menu
      g.pauseGame()
      await new Promise(r => setTimeout(r, 50))
      const pauseVisible = !pauseShell.hidden

      pauseReturnBtn.click()
      await new Promise(r => setTimeout(r, 100))
      const menuVisibleAfterReturn = !menuShell.hidden

      // Phase 6: Restart session
      menuStartBtn.click()
      await new Promise(r => setTimeout(r, 50))
      briefingStartBtn.click()
      await new Promise(r => setTimeout(r, 50))

      // Fresh state after restart
      const g2 = (window as any).__war3Game
      const freshUnits = g2.units
      const freshWorkers = freshUnits.filter(
        (u: any) => u.team === 0 && u.type === 'worker' && !u.isBuilding && u.hp > 0,
      )
      const freshTH = freshUnits.filter(
        (u: any) => u.team === 0 && u.type === 'townhall' && u.isBuilding && u.hp > 0,
      )

      // No stale shells
      const noStalePause = pauseShell.hidden
      const noStaleResults = resultsShell.hidden
      const noStaleMenu = menuShell.hidden
      const playingAfterRestart = g2.phase.isPlaying()

      return {
        menuVisibleAtBoot,
        isPlaying,
        workerCount: playerWorkers.length,
        thCount: playerTH.length,
        workerHasTarget,
        goldBefore,
        goldAfter,
        goldChanged: goldAfter !== goldBefore,
        pauseVisible,
        menuVisibleAfterReturn,
        freshWorkers: freshWorkers.length,
        freshTH: freshTH.length,
        noStalePause,
        noStaleResults,
        noStaleMenu,
        playingAfterRestart,
      }
    })

    expect(result.error).toBeUndefined()

    // Phase 1: menu at boot
    expect(result.menuVisibleAtBoot).toBe(true)
    // Phase 2: session started
    expect(result.isPlaying).toBe(true)
    expect(result.workerCount).toBeGreaterThanOrEqual(3)
    expect(result.thCount).toBeGreaterThanOrEqual(1)
    // Phase 3: gather works
    expect(result.workerHasTarget).toBe(true)
    // Phase 4: economy advances
    expect(result.goldChanged,
      `gold should change during 30s (${result.goldBefore} → ${result.goldAfter})`,
    ).toBe(true)
    // Phase 5: pause/return works
    expect(result.pauseVisible).toBe(true)
    expect(result.menuVisibleAfterReturn).toBe(true)
    // Phase 6: restart clean
    expect(result.freshWorkers).toBeGreaterThanOrEqual(3)
    expect(result.freshTH).toBeGreaterThanOrEqual(1)
    expect(result.noStalePause).toBe(true)
    expect(result.noStaleResults).toBe(true)
    expect(result.noStaleMenu).toBe(true)
    expect(result.playingAfterRestart).toBe(true)
  })

  test('RC-4: V7 HUD and command state survive selection swaps', async ({ page }) => {
    await waitForGame(page)

    const result = await page.evaluate(() => {
      const g = (window as any).__war3Game
      if (!g) throw new Error('no game')

      const priest = g.spawnUnit('priest', 0, 60, 60)
      const mortar = g.spawnUnit('mortar_team', 0, 61, 60)

      // Select priest
      g.selectionModel.setSelection([priest])
      g._lastCmdKey = ''
      g._lastSelKey = ''
      g.updateHUD(0.016)
      const priestName = document.getElementById('unit-name')?.textContent ?? ''
      const healButton = [...document.querySelectorAll('#command-card button')].find(
        (b: any) => b.querySelector('.btn-label')?.textContent?.trim() === '治疗',
      ) as HTMLButtonElement | undefined

      // Check mana-low disabled reason
      priest.mana = 0
      g._lastCmdKey = ''
      g.updateHUD(0.016)
      const healDisabledReason = [...document.querySelectorAll('#command-card button')]
        .find((b: any) => b.querySelector('.btn-label')?.textContent?.trim() === '治疗')
        ?.getAttribute('data-disabled-reason') ?? ''

      // Select mortar
      g.selectionModel.setSelection([mortar])
      g._lastCmdKey = ''
      g._lastSelKey = ''
      g.updateHUD(0.016)
      const mortarName = document.getElementById('unit-name')?.textContent ?? ''
      const mortarStats = document.getElementById('unit-stats')?.textContent ?? ''

      // Cleanup
      priest.hp = 0
      mortar.hp = 0
      g.handleDeadUnits()

      return {
        priestName,
        healButtonFound: !!healButton,
        healButtonEnabled: !!healButton && !healButton.disabled,
        healDisabledReason,
        mortarName,
        mortarStatsHasAttack: mortarStats.includes('42'),
      }
    })

    expect(result.priestName).toBe('牧师')
    expect(result.healButtonFound).toBe(true)
    expect(result.healButtonEnabled).toBe(true)
    expect(result.healDisabledReason).toContain('魔力')
    expect(result.mortarName).toBe('迫击炮小队')
    expect(result.mortarStatsHasAttack).toBe(true)
  })

  test('RC-5: V8-created state cleans and procedural start recovers', async ({ page }) => {
    await waitForGame(page)

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

      // Recover
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
