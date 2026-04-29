/**
 * AI defense/recomposition and player pressure-warning runtime proof.
 */
import { test, expect, type Page } from '@playwright/test'

const BASE_RUNTIME = 'http://127.0.0.1:4173/?runtimeTest=1'

async function waitForGame(page: Page) {
  const consoleErrors: string[] = []
  const pageErrors: string[] = []
  page.on('console', (msg) => {
    if (msg.type() === 'error') consoleErrors.push(msg.text())
  })
  page.on('pageerror', (err) => pageErrors.push(err.message))
  ;(page as any).__consoleErrors = consoleErrors
  ;(page as any).__pageErrors = pageErrors

  await page.goto(BASE_RUNTIME, { waitUntil: 'domcontentloaded' })
  await page.waitForFunction(() => {
    const game = (window as any).__war3Game
    if (!game || !game.renderer) return false
    if (!Array.isArray(game.units) || game.units.length === 0) return false
    return game.renderer.domElement.width > 0
  }, { timeout: 15000 })
  await page.waitForTimeout(300)
}

test.describe('AI defense and pressure warning runtime', () => {
  test.setTimeout(90000)

  test('AI recalls combat units to defend its base and records regroup pressure', async ({ page }) => {
    await waitForGame(page)

    const result = await page.evaluate(() => {
      const g = (window as any).__war3Game
      const ai = g.ai
      const aiTownHall = g.units.find((u: any) => u.team === 1 && u.type === 'townhall' && u.hp > 0)
      if (!ai || !aiTownHall) return { error: 'missing ai townhall' }

      const defender = g.spawnUnit('footman', 1, aiTownHall.mesh.position.x + 9, aiTownHall.mesh.position.z + 1)
      const hero = g.spawnUnit('paladin', 1, aiTownHall.mesh.position.x + 10, aiTownHall.mesh.position.z + 1)
      const attacker = g.spawnUnit('footman', 0, aiTownHall.mesh.position.x + 2, aiTownHall.mesh.position.z + 1)
      aiTownHall.hp = Math.max(1, aiTownHall.maxHp - 120)

      ai.tickCount = 420
      ai.tickTimer = 0
      ai.waveCount = 1
      ai.attackWaveSent = true
      ai.attackWaveSentTick = 390
      ai.update(1.1)
      g.updateHUD(0.016)

      const snapshot = g.getAIPressureSnapshot()
      const stageText = document.getElementById('pressure-stage')?.textContent ?? ''
      return {
        snapshot,
        stageText,
        defenderOrder: {
          state: defender.state,
          hasAttackMoveTarget: !!defender.attackMoveTarget,
          targetDistance: defender.attackMoveTarget
            ? defender.attackMoveTarget.distanceTo(attacker.mesh.position)
            : null,
        },
        heroOrder: {
          hasAttackMoveTarget: !!hero.attackMoveTarget,
        },
      }
    })

    expect(result.error).toBeUndefined()
    expect(result.snapshot.stage).toBe('defending')
    expect(result.snapshot.defenseResponses).toBeGreaterThanOrEqual(1)
    expect(result.snapshot.regroupCount).toBeGreaterThanOrEqual(1)
    expect(result.snapshot.lastDefenseTargetType).toBe('townhall')
    expect(result.stageText).toContain('防守')
    expect(result.defenderOrder.hasAttackMoveTarget).toBe(true)
    expect(result.heroOrder.hasAttackMoveTarget).toBe(true)
    expect(result.defenderOrder.targetDistance).toBeLessThan(0.1)

    expect((page as any).__consoleErrors).toEqual([])
    expect((page as any).__pageErrors).toEqual([])
  })

  test('player pressure alert escalates and result summary preserves pressure debrief', async ({ page }) => {
    await waitForGame(page)

    const result = await page.evaluate(() => {
      const g = (window as any).__war3Game
      const ai = g.ai
      const playerTownHall = g.units.find((u: any) => u.team === 0 && u.type === 'townhall' && u.hp > 0)
      const aiTownHall = g.units.find((u: any) => u.team === 1 && u.type === 'townhall' && u.hp > 0)
      if (!ai || !playerTownHall || !aiTownHall) return { error: 'missing base runtime state' }

      g.spawnUnit('footman', 1, playerTownHall.mesh.position.x + 2, playerTownHall.mesh.position.z + 1)
      ai.tickCount = 360
      ai.tickTimer = 0
      ai.waveCount = 1
      ai.attackWaveSent = true
      ai.attackWaveSentTick = 350
      ai.update(1.1)
      g.updateHUD(0.016)
      const nearSnapshot = g.getAIPressureSnapshot()
      const nearAlert = {
        text: document.getElementById('pressure-alert')?.textContent ?? '',
        level: (document.getElementById('pressure-alert') as HTMLElement | null)?.dataset.alert ?? '',
      }

      playerTownHall.hp = Math.max(1, playerTownHall.maxHp - 240)
      ai.tickTimer = 0
      ai.update(1.1)
      g.updateHUD(0.016)
      const siegeSnapshot = g.getAIPressureSnapshot()
      const siegeAlert = {
        text: document.getElementById('pressure-alert')?.textContent ?? '',
        level: (document.getElementById('pressure-alert') as HTMLElement | null)?.dataset.alert ?? '',
      }

      aiTownHall.hp = 0
      g.update(0.016)
      const summary = document.getElementById('results-shell-summary')?.textContent ?? ''
      const menuSummary = g.getLastSessionMenuSummary()

      return {
        nearSnapshot,
        nearAlert,
        siegeSnapshot,
        siegeAlert,
        summary,
        menuSummary,
        result: g.getMatchResult(),
      }
    })

    expect(result.error).toBeUndefined()
    expect(result.nearSnapshot.playerBaseThreatLevel).toBe('attack')
    expect(result.nearAlert.level).toBe('attack')
    expect(result.nearAlert.text).toContain('接近基地')
    expect(result.siegeSnapshot.playerBaseThreatLevel).toBe('siege')
    expect(result.siegeAlert.level).toBe('siege')
    expect(result.siegeAlert.text).toContain('基地')
    expect(result.result).toBe('victory')
    expect(result.summary).toContain('AI 复盘')
    expect(result.summary).toContain('防守:')
    expect(result.summary).toContain('重组:')
    expect(result.summary).toContain('预警:')
    expect(result.menuSummary).toContain('AI防守')

    expect((page as any).__consoleErrors).toEqual([])
    expect((page as any).__pageErrors).toEqual([])
  })
})
