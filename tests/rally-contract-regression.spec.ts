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
    // procedural map path is valid
  }

  await page.waitForTimeout(300)
}

function severeConsoleErrors(page: Page): string[] {
  const errors = ((page as any).__consoleErrors ?? []) as string[]
  return errors.filter(e =>
    !e.includes('404') &&
    !e.includes('favicon') &&
    !e.includes('Failed to load resource') &&
    !e.includes('Test map load failed') &&
    !e.includes('net::'),
  )
}

test.describe('Rally Contract Regression', () => {
  test.setTimeout(120000)

  test('goldmine rally still spawns a worker into the gold loop', async ({ page }) => {
    await waitForGame(page)

    const result = await page.evaluate(() => {
      const g = (window as any).__war3Game
      if (!g) return { ok: false, reason: 'no game' }

      if (g.ai) g.ai.update = () => {}

      const teamStore = g.resources.teams?.get?.(0)
      const townhall = g.units.find((u: any) => u.team === 0 && u.type === 'townhall' && u.hp > 0)
      const mine = g.units.find((u: any) => u.type === 'goldmine' && u.hp > 0 && u.remainingGold > 0)
      if (!teamStore || !townhall || !mine) return { ok: false, reason: 'missing setup' }

      teamStore.gold = 999
      teamStore.lumber = 999
      townhall.trainingQueue = []

      const workerCountBefore = g.units.filter((u: any) => u.team === 0 && u.type === 'worker' && u.hp > 0).length

      g.issueCommand([], {
        type: 'setRally',
        building: townhall,
        target: mine.mesh.position.clone(),
        rallyTarget: mine,
      })

      g.trainUnit(townhall, 'worker')

      let spawned: any = null
      for (let i = 0; i < 1200; i++) {
        g.update(0.016)
        const workers = g.units.filter((u: any) => u.team === 0 && u.type === 'worker' && u.hp > 0)
        if (workers.length > workerCountBefore) {
          spawned = workers[workers.length - 1]
          break
        }
      }

      return {
        ok: true,
        spawned: !!spawned,
        state: spawned?.state ?? null,
        gatherType: spawned?.gatherType ?? null,
        hasMoveTarget: !!spawned?.moveTarget,
        resourceTargetType: spawned?.resourceTarget?.type ?? null,
        mineMatches: spawned?.resourceTarget?.type === 'goldmine'
          ? spawned.resourceTarget.mine === mine
          : false,
        rallyTargetType: townhall.rallyTarget?.type ?? null,
      }
    })

    expect(result.ok).toBe(true)
    expect(result.spawned).toBe(true)
    expect(result.gatherType).toBe('gold')
    expect(result.resourceTargetType).toBe('goldmine')
    expect(result.mineMatches).toBe(true)
    expect(result.hasMoveTarget).toBe(true)
    expect(result.rallyTargetType).toBe('goldmine')
    expect(severeConsoleErrors(page)).toHaveLength(0)
  })

  test('clearRally removes fake rally and next trained worker spawns idle', async ({ page }) => {
    await waitForGame(page)

    const result = await page.evaluate(() => {
      const g = (window as any).__war3Game
      if (!g) return { ok: false, reason: 'no game' }

      if (g.ai) g.ai.update = () => {}

      const teamStore = g.resources.teams?.get?.(0)
      const townhall = g.units.find((u: any) => u.team === 0 && u.type === 'townhall' && u.hp > 0)
      const mine = g.units.find((u: any) => u.type === 'goldmine' && u.hp > 0 && u.remainingGold > 0)
      if (!teamStore || !townhall || !mine) return { ok: false, reason: 'missing setup' }

      teamStore.gold = 999
      teamStore.lumber = 999
      townhall.trainingQueue = []

      g.issueCommand([], {
        type: 'setRally',
        building: townhall,
        target: mine.mesh.position.clone(),
        rallyTarget: mine,
      })
      g.issueCommand([], { type: 'clearRally', building: townhall })

      const workerCountBefore = g.units.filter((u: any) => u.team === 0 && u.type === 'worker' && u.hp > 0).length
      g.trainUnit(townhall, 'worker')

      let spawned: any = null
      for (let i = 0; i < 1200; i++) {
        g.update(0.016)
        const workers = g.units.filter((u: any) => u.team === 0 && u.type === 'worker' && u.hp > 0)
        if (workers.length > workerCountBefore) {
          spawned = workers[workers.length - 1]
          break
        }
      }

      return {
        ok: true,
        spawned: !!spawned,
        rallyPointCleared: townhall.rallyPoint === null,
        rallyTargetCleared: townhall.rallyTarget === null,
        state: spawned?.state ?? null,
        hasMoveTarget: !!spawned?.moveTarget,
        gatherType: spawned?.gatherType ?? null,
        resourceTarget: !!spawned?.resourceTarget,
        queueLen: spawned?.moveQueue?.length ?? -1,
      }
    })

    expect(result.ok).toBe(true)
    expect(result.spawned).toBe(true)
    expect(result.rallyPointCleared).toBe(true)
    expect(result.rallyTargetCleared).toBe(true)
    expect(result.state).toBe(0)
    expect(result.hasMoveTarget).toBe(false)
    expect(result.gatherType).toBeNull()
    expect(result.resourceTarget).toBe(false)
    expect(result.queueLen).toBe(0)
    expect(severeConsoleErrors(page)).toHaveLength(0)
  })
})
