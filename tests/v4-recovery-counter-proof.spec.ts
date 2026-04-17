/**
 * V4-R1 Recovery / Counter Proof Pack
 *
 * Focused regression proving recovery pathways exist after damage.
 * AI disabled to isolate player recovery mechanics.
 *
 * IMPORTANT: g.handleDeadUnits() reassigns this.units to a new array.
 * All post-death/post-training reads MUST use g.units fresh, not a cached const.
 */
import { test, expect, type Page } from '@playwright/test'

const BASE = 'http://127.0.0.1:4173/?runtimeTest=1'

async function waitForGame(page: Page) {
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
  } catch { /* procedural fallback valid */ }
  await page.waitForTimeout(500)
}

async function disableAI(page: Page) {
  await page.evaluate(() => {
    const g = (window as any).__war3Game
    if (g?.ai) {
      if (typeof g.ai.reset === 'function') g.ai.reset()
      g.ai.update = () => {}
    }
  })
}

test.describe('V4-R1 Recovery / Counter Proof', () => {
  test.setTimeout(120000)

  test('damaged fixture: player workers killed and TH damaged', async ({ page }) => {
    await waitForGame(page)
    await disableAI(page)

    const result = await page.evaluate(() => {
      const g = (window as any).__war3Game
      const workers = g.units.filter(
        (u: any) => u.team === 0 && u.type === 'worker' && u.hp > 0,
      )
      const th = g.units.find(
        (u: any) => u.team === 0 && u.type === 'townhall' && u.hp > 0,
      )
      const before = { workers: workers.length, thHp: th?.hp, thMax: th?.maxHp }

      for (let i = 0; i < 3 && i < workers.length; i++) workers[i].hp = 0
      if (th) th.hp = Math.round(th.maxHp * 0.4)
      for (let i = 0; i < 10; i++) g.update(0.016)

      // Re-read g.units after handleDeadUnits
      const afterWorkers = g.units.filter(
        (u: any) => u.team === 0 && u.type === 'worker' && u.hp > 0,
      ).length
      const afterTH = g.units.find(
        (u: any) => u.team === 0 && u.type === 'townhall' && u.hp > 0,
      )

      return { before, after: { workers: afterWorkers, thHp: afterTH?.hp, thMax: afterTH?.maxHp } }
    })

    expect(result.before.workers).toBe(5)
    expect(result.after.workers, '3 workers killed').toBe(2)
    expect(result.after.thHp, 'TH damaged').toBeLessThan(result.after.thMax * 0.5)
    expect(result.after.thHp, 'TH alive').toBeGreaterThan(0)
  })

  test('economic recovery: train workers, gather resumes', async ({ page }) => {
    await waitForGame(page)
    await disableAI(page)

    const result = await page.evaluate(() => {
      const g = (window as any).__war3Game
      const th = g.units.find(
        (u: any) => u.team === 0 && u.type === 'townhall' && u.hp > 0,
      )
      const gm = g.units.find(
        (u: any) => u.type === 'goldmine' && u.hp > 0,
      )
      if (!th || !gm) return null

      // Kill 3 workers
      const workers = g.units.filter(
        (u: any) => u.team === 0 && u.type === 'worker' && u.hp > 0,
      )
      for (let i = 0; i < 3 && i < workers.length; i++) workers[i].hp = 0
      for (let i = 0; i < 10; i++) g.update(0.016)

      // Re-read after death cleanup
      const preWorkers = g.units.filter(
        (u: any) => u.team === 0 && u.type === 'worker' && u.hp > 0,
      ).length

      // Train 3 replacement workers
      g.issueCommand([], { type: 'train', building: th, unitType: 'worker', trainTime: 12 })
      g.issueCommand([], { type: 'train', building: th, unitType: 'worker', trainTime: 12 })
      g.issueCommand([], { type: 'train', building: th, unitType: 'worker', trainTime: 12 })

      // Set gold rally
      g.issueCommand([], {
        type: 'setRally', building: th,
        target: gm.mesh.position, rallyTarget: gm,
      })

      // Advance 50s for training
      let remaining = 50
      while (remaining > 0) {
        const step = Math.min(0.016, remaining)
        g.update(step)
        remaining -= 0.016
      }

      // Re-read g.units after training spawns new units
      const postWorkers = g.units.filter(
        (u: any) => u.team === 0 && u.type === 'worker' && u.hp > 0,
      ).length
      const gathering = g.units.filter(
        (u: any) => u.team === 0 && u.type === 'worker' && u.hp > 0
          && (u.state === 2 || u.state === 3 || u.state === 4),
      ).length

      return { preWorkers, postWorkers, gathering }
    })

    expect(result).not.toBeNull()
    expect(result!.preWorkers).toBe(2)
    expect(result!.postWorkers, '>=4 workers after training').toBeGreaterThanOrEqual(4)
    expect(result!.gathering, '>=1 worker gathering').toBeGreaterThanOrEqual(1)
  })

  test('military counter: train footmen, attack-move toward AI base', async ({ page }) => {
    await waitForGame(page)
    await disableAI(page)

    const result = await page.evaluate(() => {
      const g = (window as any).__war3Game
      const bk = g.units.find(
        (u: any) => u.team === 0 && u.type === 'barracks' && u.hp > 0 && u.buildProgress >= 1,
      )
      if (!bk) return null

      const aiTH = g.units.find(
        (u: any) => u.team === 1 && u.type === 'townhall' && u.hp > 0,
      )
      const Vector3 = g.units[0].mesh.position.constructor
      const aiPos = aiTH ? aiTH.mesh.position.clone() : new Vector3(50, 0, 50)

      // Train 3 footmen
      g.issueCommand([], { type: 'train', building: bk, unitType: 'footman', trainTime: 16 })
      g.issueCommand([], { type: 'train', building: bk, unitType: 'footman', trainTime: 16 })
      g.issueCommand([], { type: 'train', building: bk, unitType: 'footman', trainTime: 16 })

      // Advance for training
      let remaining = 55
      while (remaining > 0) {
        const step = Math.min(0.016, remaining)
        g.update(step)
        remaining -= 0.016
      }

      // Re-read g.units — new footmen are in the new array
      const footmen = g.units.filter(
        (u: any) => u.team === 0 && u.type === 'footman' && u.hp > 0,
      )

      if (footmen.length > 0) {
        g.issueCommand(footmen, { type: 'attackMove', target: aiPos })
        for (const f of footmen) g.planPath(f, aiPos)
      }

      remaining = 10
      while (remaining > 0) {
        const step = Math.min(0.016, remaining)
        g.update(step)
        remaining -= 0.016
      }

      // Re-read g.units
      const alive = g.units.filter(
        (u: any) => u.team === 0 && u.type === 'footman' && u.hp > 0,
      )
      const inAction = alive.filter(
        (u: any) => u.state === 1 || u.state === 7 || u.state === 8,
      ).length

      return { trained: footmen.length, alive: alive.length, inAction }
    })

    expect(result).not.toBeNull()
    expect(result!.trained, '>=2 footmen trained').toBeGreaterThanOrEqual(2)
    expect(result!.alive, '>=2 footmen alive').toBeGreaterThanOrEqual(2)
    expect(result!.inAction, '>=1 moving/attacking').toBeGreaterThanOrEqual(1)
  })

  test('command surface integrity: selection/placement/command-card clean after recovery', async ({ page }) => {
    await waitForGame(page)
    await disableAI(page)

    const result = await page.evaluate(() => {
      const g = (window as any).__war3Game

      // Kill 2 workers
      const workers = g.units.filter(
        (u: any) => u.team === 0 && u.type === 'worker' && u.hp > 0,
      )
      for (let i = 0; i < 2 && i < workers.length; i++) workers[i].hp = 0
      for (let i = 0; i < 10; i++) g.update(0.016)

      // Select survivor — re-read g.units
      const survivors = g.units.filter(
        (u: any) => u.team === 0 && u.type === 'worker' && u.hp > 0,
      )
      if (survivors.length === 0) return null

      g.selectionModel.setSelection([survivors[0]])
      g.update(0.016)

      const afterSelect = {
        hasSelection: g.selectionModel.hasSelection,
        primaryType: g.selectionModel.primary?.type,
      }

      // Clear
      g.selectionModel.clear()
      g.sel.clearSelectionRings()
      g.update(0.016)

      const clean = {
        selectionEmpty: !g.selectionModel.hasSelection,
        placementOff: !g.placementMode,
        attackMoveOff: !g.attackMoveMode,
      }

      // Re-select — re-read g.units
      const allWorkers = g.units.filter(
        (u: any) => u.team === 0 && u.type === 'worker' && u.hp > 0,
      )
      if (allWorkers.length > 0) {
        g.selectionModel.add(allWorkers[0])
        g.update(0.016)
      }

      return {
        afterSelect,
        clean,
        reselect: {
          canReselect: g.selectionModel.hasSelection,
          type: g.selectionModel.primary?.type,
        },
      }
    })

    expect(result).not.toBeNull()
    expect(result!.afterSelect.hasSelection, 'can select during damage').toBe(true)
    expect(result!.afterSelect.primaryType, 'selected worker').toBe('worker')
    expect(result!.clean.selectionEmpty, 'selection cleared').toBe(true)
    expect(result!.clean.placementOff, 'placement off').toBe(true)
    expect(result!.clean.attackMoveOff, 'attack-move off').toBe(true)
    expect(result!.reselect.canReselect, 'can reselect').toBe(true)
    expect(result!.reselect.type, 'reselected worker').toBe('worker')
  })

  test('V4-R1 comprehensive recovery audit', async ({ page }) => {
    await waitForGame(page)
    await disableAI(page)

    const result = await page.evaluate(() => {
      const g = (window as any).__war3Game
      const th = g.units.find(
        (u: any) => u.team === 0 && u.type === 'townhall' && u.hp > 0,
      )
      const bk = g.units.find(
        (u: any) => u.team === 0 && u.type === 'barracks' && u.hp > 0 && u.buildProgress >= 1,
      )
      const gm = g.units.find(
        (u: any) => u.type === 'goldmine' && u.hp > 0,
      )
      const aiTH = g.units.find(
        (u: any) => u.team === 1 && u.type === 'townhall' && u.hp > 0,
      )
      if (!th || !bk || !gm) return null

      // Phase 1: Damage
      const workers = g.units.filter(
        (u: any) => u.team === 0 && u.type === 'worker' && u.hp > 0,
      )
      for (let i = 0; i < 3 && i < workers.length; i++) workers[i].hp = 0
      for (let i = 0; i < 10; i++) g.update(0.016)

      const damaged = g.units.filter(
        (u: any) => u.team === 0 && u.type === 'worker' && u.hp > 0,
      ).length

      // Phase 2: Recovery
      g.issueCommand([], { type: 'train', building: th, unitType: 'worker', trainTime: 12 })
      g.issueCommand([], { type: 'train', building: th, unitType: 'worker', trainTime: 12 })
      g.issueCommand([], { type: 'train', building: bk, unitType: 'footman', trainTime: 16 })
      g.issueCommand([], {
        type: 'setRally', building: th,
        target: gm.mesh.position, rallyTarget: gm,
      })

      let remaining = 50
      while (remaining > 0) { const s = Math.min(0.016, remaining); g.update(s); remaining -= s }

      // Re-read g.units
      const recovered = g.units.filter(
        (u: any) => u.team === 0 && u.type === 'worker' && u.hp > 0,
      ).length
      const gathering = g.units.filter(
        (u: any) => u.team === 0 && u.type === 'worker' && u.hp > 0
          && (u.state === 2 || u.state === 3 || u.state === 4),
      ).length
      const footmen = g.units.filter(
        (u: any) => u.team === 0 && u.type === 'footman' && u.hp > 0,
      )

      // Phase 3: Counter
      if (footmen.length > 0 && aiTH) {
        g.issueCommand(footmen, { type: 'attackMove', target: aiTH.mesh.position.clone() })
        for (const f of footmen) g.planPath(f, aiTH.mesh.position)
      }

      remaining = 15
      while (remaining > 0) { const s = Math.min(0.016, remaining); g.update(s); remaining -= s }

      // Re-read g.units
      const counterAlive = g.units.filter(
        (u: any) => u.team === 0 && u.type === 'footman' && u.hp > 0,
      )
      const inAction = counterAlive.filter(
        (u: any) => u.state === 1 || u.state === 7 || u.state === 8,
      ).length

      return {
        damaged, recovered, gathering,
        footmenTrained: footmen.length,
        counterAlive: counterAlive.length,
        counterInAction: inAction,
        placementOff: !g.placementMode,
        attackMoveOff: !g.attackMoveMode,
      }
    })

    expect(result).not.toBeNull()

    const audit: Record<string, { passed: boolean; note: string }> = {
      damage: { passed: result!.damaged < 5, note: `${result!.damaged} workers after damage` },
      recovery: { passed: result!.recovered > result!.damaged, note: `${result!.damaged} → ${result!.recovered}` },
      gather: { passed: result!.gathering > 0, note: `${result!.gathering} gathering` },
      military: { passed: result!.footmenTrained > 0, note: `${result!.footmenTrained} footmen` },
      counter: { passed: result!.counterInAction > 0 || result!.counterAlive > 0, note: `${result!.counterInAction} in action` },
      surfaces: { passed: result!.placementOff && result!.attackMoveOff, note: 'clean' },
    }

    for (const [k, a] of Object.entries(audit)) {
      expect(a.passed, `${k}: ${a.note}`).toBe(true)
    }

    console.log('[V4-R1 CLOSEOUT AUDIT]', JSON.stringify({ audit, result }, null, 2))
  })
})
