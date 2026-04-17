/**
 * Procedural Reload Source Contract
 *
 * Focused runtime proof that the default procedural opening is a replayable
 * current source:
 *   1. reloadCurrentMap() is available on the procedural startup path
 *   2. disturbing state does not change the source contract
 *   3. reloadCurrentMap() restores the procedural baseline
 */
import { test, expect, type Page } from '@playwright/test'

const BASE = 'http://127.0.0.1:4173/?runtimeTest=1'

async function waitForGame(page: Page) {
  const consoleErrors: string[] = []
  page.on('console', (msg) => {
    if (msg.type() === 'error') consoleErrors.push(msg.text())
  })
  ;(page as any).__consoleErrors = consoleErrors

  await page.goto(BASE, { waitUntil: 'domcontentloaded' })

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

  await page.waitForTimeout(500)
}

test.describe('Procedural Reload Source Contract', () => {
  test.setTimeout(60000)

  test('reloadCurrentMap replays the procedural opening and restores the baseline', async ({ page }) => {
    await waitForGame(page)

    const baseline = await page.evaluate(() => {
      const g = (window as any).__war3Game
      if (g.ai) {
        if (typeof g.ai.reset === 'function') g.ai.reset()
        g.ai.update = () => {}
      }
      const reloaded = g.reloadCurrentMap()
      if (g.ai) {
        if (typeof g.ai.reset === 'function') g.ai.reset()
        g.ai.update = () => {}
      }
      const res0 = g.resources.get(0)
      const res1 = g.resources.get(1)

      const count = (type: string, team?: number) =>
        g.units.filter((u: any) => u.type === type && (team === undefined || u.team === team)).length

      return {
        ok: typeof g.reloadCurrentMap === 'function',
        reloaded,
        phase: g.phase.get(),
        result: g.getMatchResult(),
        gameTime: g.gameTime,
        selectionCount: g.selectionModel.units.length,
        terrainWidth: g.terrain.width,
        terrainHeight: g.terrain.height,
        unitsLength: g.units.length,
        townhallCount: count('townhall'),
        goldmineCount: count('goldmine'),
        barracksCount: count('barracks'),
        workerCount: count('worker'),
        playerWorkerCount: count('worker', 0),
        aiWorkerCount: count('worker', 1),
        gold: res0.gold,
        lumber: res0.lumber,
        aiGold: res1.gold,
        aiLumber: res1.lumber,
      }
    })

    expect(baseline.ok, 'procedural startup should expose reloadCurrentMap').toBe(true)
    expect(baseline.reloaded, 'procedural startup should replay through the same seam').toBe(true)
    expect(baseline.phase, 'procedural baseline should be playing').toBe('playing')
    expect(baseline.result, 'procedural baseline should not be terminal').toBeNull()
    expect(baseline.terrainWidth, 'procedural baseline should use the default terrain width').toBe(64)
    expect(baseline.terrainHeight, 'procedural baseline should use the default terrain height').toBe(64)
    expect(baseline.unitsLength, 'procedural baseline should have a playable starting army').toBeGreaterThanOrEqual(16)
    expect(baseline.townhallCount, 'procedural baseline should keep both townhalls').toBeGreaterThanOrEqual(2)
    expect(baseline.goldmineCount, 'procedural baseline should keep both goldmines').toBeGreaterThanOrEqual(2)
    expect(baseline.barracksCount, 'procedural baseline should keep both barracks').toBeGreaterThanOrEqual(2)
    expect(baseline.workerCount, 'procedural baseline should keep the starting workers').toBeGreaterThanOrEqual(10)
    expect(baseline.playerWorkerCount, 'procedural baseline should keep player workers').toBeGreaterThanOrEqual(5)
    expect(baseline.aiWorkerCount, 'procedural baseline should keep AI workers').toBeGreaterThanOrEqual(5)
    expect(baseline.gold, 'procedural baseline should initialize player gold').toBe(500)
    expect(baseline.lumber, 'procedural baseline should initialize player lumber').toBe(200)
    expect(baseline.aiGold, 'procedural baseline should expose a valid AI gold value').toBeGreaterThanOrEqual(0)
    expect(baseline.aiLumber, 'procedural baseline should expose a valid AI lumber value').toBeGreaterThanOrEqual(0)

    const disturbed = await page.evaluate(() => {
      const g = (window as any).__war3Game
      const workers = g.units.filter((u: any) => u.type === 'worker' && u.team === 0 && u.hp > 0)
      const selected = workers[0]
      const doomed = workers[1]
      const before0 = g.resources.get(0)
      const before1 = g.resources.get(1)

      g.selectionModel.setSelection([selected])
      g.gameTime = 37.5
      g.resources.spend(0, { gold: 123, lumber: 45 })
      g.resources.spend(1, { gold: 77, lumber: 19 })

      doomed.hp = 0
      g.removeTestUnit(doomed)

      const res0 = g.resources.get(0)
      const res1 = g.resources.get(1)

      return {
        phase: g.phase.get(),
        result: g.getMatchResult(),
        gameTime: g.gameTime,
        selectionCount: g.selectionModel.units.length,
        unitsLength: g.units.length,
        workerCount: g.units.filter((u: any) => u.type === 'worker').length,
        before0,
        before1,
        gold: res0.gold,
        lumber: res0.lumber,
        aiGold: res1.gold,
        aiLumber: res1.lumber,
      }
    })

    expect(disturbed.phase, 'disturbance should keep the session playing').toBe('playing')
    expect(disturbed.result, 'disturbance should not produce a terminal verdict').toBeNull()
    expect(disturbed.gameTime, 'disturbance should advance game time').toBeGreaterThan(0)
    expect(disturbed.selectionCount, 'disturbance should leave an active selection').toBe(1)
    expect(disturbed.unitsLength, 'disturbance should remove one unit from the baseline').toBe(baseline.unitsLength - 1)
    expect(disturbed.workerCount, 'disturbance should reduce the worker count by one').toBe(baseline.workerCount - 1)
    expect(disturbed.gold, 'disturbance should alter player gold').toBe(disturbed.before0.gold - 123)
    expect(disturbed.lumber, 'disturbance should alter player lumber').toBe(disturbed.before0.lumber - 45)
    expect(disturbed.aiGold, 'disturbance should alter AI gold').toBe(disturbed.before1.gold - 77)
    expect(disturbed.aiLumber, 'disturbance should alter AI lumber').toBe(disturbed.before1.lumber - 19)

    const reload = await page.evaluate(() => {
      const g = (window as any).__war3Game
      const ok = g.reloadCurrentMap()
      if (g.ai) {
        if (typeof g.ai.reset === 'function') g.ai.reset()
        g.ai.update = () => {}
      }
      const res0 = g.resources.get(0)
      const res1 = g.resources.get(1)

      const count = (type: string, team?: number) =>
        g.units.filter((u: any) => u.type === type && (team === undefined || u.team === team)).length

      return {
        ok,
        phase: g.phase.get(),
        result: g.getMatchResult(),
        gameTime: g.gameTime,
        selectionCount: g.selectionModel.units.length,
        terrainWidth: g.terrain.width,
        terrainHeight: g.terrain.height,
        unitsLength: g.units.length,
        townhallCount: count('townhall'),
        goldmineCount: count('goldmine'),
        barracksCount: count('barracks'),
        workerCount: count('worker'),
        playerWorkerCount: count('worker', 0),
        aiWorkerCount: count('worker', 1),
        gold: res0.gold,
        lumber: res0.lumber,
        aiGold: res1.gold,
        aiLumber: res1.lumber,
      }
    })

    expect(reload.ok, 'reloadCurrentMap should be available on the procedural path').toBe(true)
    expect(reload.phase, 'reloadCurrentMap should restore playing').toBe('playing')
    expect(reload.result, 'reloadCurrentMap should clear the terminal result').toBeNull()
    expect(reload.gameTime, 'reloadCurrentMap should reset game time').toBe(0)
    expect(reload.selectionCount, 'reloadCurrentMap should clear the selection').toBe(0)
    expect(reload.terrainWidth, 'reloadCurrentMap should preserve the procedural terrain width').toBe(baseline.terrainWidth)
    expect(reload.terrainHeight, 'reloadCurrentMap should preserve the procedural terrain height').toBe(baseline.terrainHeight)
    expect(reload.unitsLength, 'reloadCurrentMap should restore the full procedural army').toBe(baseline.unitsLength)
    expect(reload.townhallCount, 'reloadCurrentMap should restore both townhalls').toBe(baseline.townhallCount)
    expect(reload.goldmineCount, 'reloadCurrentMap should restore both goldmines').toBe(baseline.goldmineCount)
    expect(reload.barracksCount, 'reloadCurrentMap should restore both barracks').toBe(baseline.barracksCount)
    expect(reload.workerCount, 'reloadCurrentMap should restore all workers').toBe(baseline.workerCount)
    expect(reload.playerWorkerCount, 'reloadCurrentMap should restore player workers').toBe(baseline.playerWorkerCount)
    expect(reload.aiWorkerCount, 'reloadCurrentMap should restore AI workers').toBe(baseline.aiWorkerCount)
    expect(reload.gold, 'reloadCurrentMap should restore player gold').toBe(baseline.gold)
    expect(reload.lumber, 'reloadCurrentMap should restore player lumber').toBe(baseline.lumber)
    expect(reload.aiGold, 'reloadCurrentMap should restore AI gold').toBe(baseline.aiGold)
    expect(reload.aiLumber, 'reloadCurrentMap should restore AI lumber').toBe(baseline.aiLumber)
  })
})
