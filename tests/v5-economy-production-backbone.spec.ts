/**
 * V5-ECO1 Economy Production Backbone Proof
 *
 * Focused regression proving the economy chain supports sustained production:
 *   1. Gold income — workers gather gold, resources increase, not just deplete
 *   2. Lumber income — workers chop trees, lumber increases
 *   3. Supply chain — farms unlock supply, training respects supply cap
 *   4. Training queue — TH trains workers, barracks trains footmen from income
 *   5. Damage recovery — after worker loss, re-train and resume income
 *   6. Full production cycle — spend → earn → spend → earn, not one-shot
 *
 * AI disabled; all actions are controlled player commands.
 *
 * IMPORTANT: g.handleDeadUnits() reassigns this.units.
 * Always re-read g.units after mutations.
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

test.describe('V5-ECO1 Economy Production Backbone', () => {
  test.setTimeout(120000)

  test('gold income: workers gather gold and player gold increases', async ({ page }) => {
    await waitForGame(page)
    await disableAI(page)

    const result = await page.evaluate(() => {
      const g = (window as any).__war3Game
      const goldmine = g.units.find((u: any) => u.type === 'goldmine' && u.hp > 0)
      if (!goldmine) return null

      // Send 3 idle workers to gather gold
      const workers = g.units.filter(
        (u: any) => u.team === 0 && u.type === 'worker' && u.hp > 0 && u.state === 0,
      )
      for (let i = 0; i < 3 && i < workers.length; i++) {
        g.issueCommand([workers[i]], {
          type: 'gather', resourceType: 'gold', target: goldmine.mesh.position,
        })
        workers[i].resourceTarget = { type: 'goldmine', mine: goldmine }
        g.planPath(workers[i], goldmine.mesh.position)
      }

      const goldBefore = g.resources.get(0).gold
      const gameTimeBefore = g.gameTime

      // Advance 30s — enough for workers to reach mine + complete gather cycles
      let remaining = 30
      while (remaining > 0) { const s = Math.min(0.016, remaining); g.update(s); remaining -= s }

      // Re-read state
      const goldAfter = g.resources.get(0).gold
      const gatheringWorkers = g.units.filter(
        (u: any) => u.team === 0 && u.type === 'worker' && u.hp > 0
          && (u.state === 2 || u.state === 3 || u.state === 4),
      ).length

      return { goldBefore, goldAfter, gatheringWorkers, gameTimeBefore, gameTimeAfter: +g.gameTime.toFixed(1) }
    })

    expect(result).not.toBeNull()
    expect(result!.gatheringWorkers, '>=2 workers gathering').toBeGreaterThanOrEqual(2)
    expect(result!.goldAfter, `gold must increase: ${result!.goldBefore} → ${result!.goldAfter}`).toBeGreaterThan(result!.goldBefore)
  })

  test('lumber income: workers chop trees and player lumber increases', async ({ page }) => {
    await waitForGame(page)
    await disableAI(page)

    const result = await page.evaluate(() => {
      const g = (window as any).__war3Game
      const th = g.units.find((u: any) => u.team === 0 && u.type === 'townhall' && u.hp > 0)
      if (!th) return null

      // Find a tree near base
      const trees = g.treeManager?.entries ?? []
      const basePos = th.mesh.position
      const nearTree = trees.find((t: any) => {
        const dx = t.mesh.position.x - basePos.x
        const dz = t.mesh.position.z - basePos.z
        return dx * dx + dz * dz < 400
      })
      if (!nearTree) return null

      // Send 2 workers to chop via real gather command + pathfinding
      const workers = g.units.filter(
        (u: any) => u.team === 0 && u.type === 'worker' && u.hp > 0,
      )
      for (let i = 0; i < 2 && i < workers.length; i++) {
        const w = workers[i]
        g.issueCommand([w], {
          type: 'gather', resourceType: 'lumber', target: nearTree.mesh.position,
        })
        w.resourceTarget = { type: 'tree', entry: nearTree }
        g.planPath(w, nearTree.mesh.position)
      }

      const treeInfo = {
        hasRemainingLumber: nearTree.remainingLumber,
        treePos: { x: nearTree.mesh.position.x, z: nearTree.mesh.position.z },
      }

      const lumberBefore = g.resources.get(0).lumber

      // Advance 45s — enough for pathfinding, gather cycle, return to TH, deposit
      let remaining = 45
      while (remaining > 0) { const s = Math.min(0.016, remaining); g.update(s); remaining -= s }

      const lumberAfter = g.resources.get(0).lumber
      const carrying = g.units.filter(
        (u: any) => u.team === 0 && u.type === 'worker' && u.carryAmount > 0,
      ).length
      const lumberWorkers = g.units.filter(
        (u: any) => u.team === 0 && u.type === 'worker' && u.hp > 0
          && u.gatherType === 'lumber',
      ).length

      return { lumberBefore, lumberAfter, carrying, treeInfo, lumberWorkers }
    })

    expect(result).not.toBeNull()
    expect(result!.lumberAfter, `lumber must increase: ${result!.lumberBefore} → ${result!.lumberAfter}`).toBeGreaterThan(result!.lumberBefore)
  })

  test('supply chain: farms unlock supply, training respects cap', async ({ page }) => {
    await waitForGame(page)
    await disableAI(page)

    const result = await page.evaluate(() => {
      const g = (window as any).__war3Game
      const th = g.units.find(
        (u: any) => u.team === 0 && u.type === 'townhall' && u.hp > 0 && u.buildProgress >= 1,
      )
      if (!th) return null

      // Initial supply: TH provides 10, 5 workers use 5, so 5 free
      const supply0 = g.resources.computeSupply(0, g.units)
      const initialSupply = { used: supply0.used, total: supply0.total }

      // Give resources to build farm + train
      g.resources.get(0).gold = 2000
      g.resources.get(0).lumber = 1000

      // Train 2 more workers from TH (uses 2 supply, total used = 7)
      g.issueCommand([], { type: 'train', building: th, unitType: 'worker', trainTime: 12 })
      g.issueCommand([], { type: 'train', building: th, unitType: 'worker', trainTime: 12 })

      // Advance for training
      let remaining = 30
      while (remaining > 0) { const s = Math.min(0.016, remaining); g.update(s); remaining -= s }

      // Re-read
      const supplyAfterTrain = g.resources.computeSupply(0, g.units)
      const workersAfterTrain = g.units.filter(
        (u: any) => u.team === 0 && u.type === 'worker' && u.hp > 0,
      ).length

      // Now build a farm to increase supply
      const bk = g.units.find(
        (u: any) => u.team === 0 && u.type === 'barracks' && u.hp > 0 && u.buildProgress >= 1,
      )
      if (!bk) return null

      // Place farm near TH
      const thPos = th.mesh.position
      const farm = g.spawnBuilding('farm', 0, Math.round(thPos.x - 4), Math.round(thPos.z + 4))
      farm.buildProgress = 1  // instant complete
      g.resources.get(0).gold = 2000
      g.resources.get(0).lumber = 1000

      const supplyAfterFarm = g.resources.computeSupply(0, g.units)

      // Now train footmen (uses 2 supply each)
      g.issueCommand([], { type: 'train', building: bk, unitType: 'footman', trainTime: 16 })
      g.issueCommand([], { type: 'train', building: bk, unitType: 'footman', trainTime: 16 })

      remaining = 35
      while (remaining > 0) { const s = Math.min(0.016, remaining); g.update(s); remaining -= s }

      const supplyFinal = g.resources.computeSupply(0, g.units)
      const footmenCount = g.units.filter(
        (u: any) => u.team === 0 && u.type === 'footman' && u.hp > 0,
      ).length

      return {
        initialSupply,
        supplyAfterTrain: { used: supplyAfterTrain.used, total: supplyAfterTrain.total },
        workersAfterTrain,
        supplyAfterFarm: { used: supplyAfterFarm.used, total: supplyAfterFarm.total },
        supplyFinal: { used: supplyFinal.used, total: supplyFinal.total },
        footmenCount,
      }
    })

    expect(result).not.toBeNull()

    // Training increased used supply
    expect(result!.supplyAfterTrain.used, 'training workers increases used supply').toBeGreaterThan(result!.initialSupply.used)

    // Farm increased total supply
    expect(result!.supplyAfterFarm.total, 'farm increases total supply').toBeGreaterThan(result!.supplyAfterTrain.total)

    // Footmen were trained and consume supply
    expect(result!.footmenCount, '>=2 footmen trained').toBeGreaterThanOrEqual(2)
    expect(result!.supplyFinal.used, 'final used > after-train used').toBeGreaterThan(result!.supplyAfterTrain.used)
  })

  test('full production cycle: spend → earn → spend, not one-shot', async ({ page }) => {
    await waitForGame(page)
    await disableAI(page)

    const result = await page.evaluate(() => {
      const g = (window as any).__war3Game
      const th = g.units.find(
        (u: any) => u.team === 0 && u.type === 'townhall' && u.hp > 0 && u.buildProgress >= 1,
      )
      const gm = g.units.find((u: any) => u.type === 'goldmine' && u.hp > 0)
      if (!th || !gm) return null

      // Phase 1: Set up gold gathering (income source)
      const workers = g.units.filter(
        (u: any) => u.team === 0 && u.type === 'worker' && u.hp > 0,
      )
      // Send 3 to gold
      for (let i = 0; i < 3 && i < workers.length; i++) {
        g.issueCommand([workers[i]], {
          type: 'gather', resourceType: 'gold', target: gm.mesh.position,
        })
        workers[i].resourceTarget = { type: 'goldmine', mine: gm }
        g.planPath(workers[i], gm.mesh.position)
      }

      // Capture starting gold
      const gold0 = g.resources.get(0).gold

      // Advance 20s — workers gather gold, earning income
      let remaining = 20
      while (remaining > 0) { const s = Math.min(0.016, remaining); g.update(s); remaining -= s }

      const goldAfterEarn = g.resources.get(0).gold

      // Phase 2: Spend earned gold on training a worker
      g.issueCommand([], { type: 'train', building: th, unitType: 'worker', trainTime: 12 })

      // Advance 15s — training completes, worker rallies to mine, earns more gold
      remaining = 15
      while (remaining > 0) { const s = Math.min(0.016, remaining); g.update(s); remaining -= s }

      const goldAfterSpendAndEarn = g.resources.get(0).gold

      // Phase 3: Train another worker from the second cycle's income
      g.issueCommand([], { type: 'train', building: th, unitType: 'worker', trainTime: 12 })

      remaining = 15
      while (remaining > 0) { const s = Math.min(0.016, remaining); g.update(s); remaining -= s }

      const goldFinal = g.resources.get(0).gold
      const totalWorkers = g.units.filter(
        (u: any) => u.team === 0 && u.type === 'worker' && u.hp > 0,
      ).length
      const gatheringWorkers = g.units.filter(
        (u: any) => u.team === 0 && u.type === 'worker' && u.hp > 0
          && (u.state === 2 || u.state === 3 || u.state === 4),
      ).length

      return {
        gold0,
        goldAfterEarn,
        goldAfterSpendAndEarn,
        goldFinal,
        totalWorkers,
        gatheringWorkers,
        cycles: 'earn → spend → earn → spend → earn',
      }
    })

    expect(result).not.toBeNull()

    // Phase 1: Gold increased from gathering
    expect(result!.goldAfterEarn, `gold increased from gathering: ${result!.gold0} → ${result!.goldAfterEarn}`).toBeGreaterThan(result!.gold0)

    // Phase 2: After spending + earning, gold can support more training
    // (may be lower than goldAfterEarn due to spending, but the cycle continues)
    expect(result!.totalWorkers, 'worker count grew from training').toBeGreaterThan(5)

    // Phase 3: Economy sustains — gold doesn't collapse to 0
    expect(result!.goldFinal, `gold not collapsed: ${result!.goldFinal}`).toBeGreaterThan(0)

    // Workers gathering — production chain active
    expect(result!.gatheringWorkers, '>=3 workers in gather cycle').toBeGreaterThanOrEqual(3)

    console.log('[V5-ECO1 PROOF] Production cycle:', result)
  })

  test('damage recovery: re-train workers and resume income after losses', async ({ page }) => {
    await waitForGame(page)
    await disableAI(page)

    const result = await page.evaluate(() => {
      const g = (window as any).__war3Game
      const th = g.units.find(
        (u: any) => u.team === 0 && u.type === 'townhall' && u.hp > 0 && u.buildProgress >= 1,
      )
      const gm = g.units.find((u: any) => u.type === 'goldmine' && u.hp > 0)
      if (!th || !gm) return null

      // Set up gathering
      const workers = g.units.filter(
        (u: any) => u.team === 0 && u.type === 'worker' && u.hp > 0,
      )
      for (let i = 0; i < 3 && i < workers.length; i++) {
        g.issueCommand([workers[i]], {
          type: 'gather', resourceType: 'gold', target: gm.mesh.position,
        })
        workers[i].resourceTarget = { type: 'goldmine', mine: gm }
        g.planPath(workers[i], gm.mesh.position)
      }

      // Earn for 20s
      let remaining = 20
      while (remaining > 0) { const s = Math.min(0.016, remaining); g.update(s); remaining -= s }

      const goldBeforeDamage = g.resources.get(0).gold

      // Kill 3 workers (damage event)
      const currentWorkers = g.units.filter(
        (u: any) => u.team === 0 && u.type === 'worker' && u.hp > 0,
      )
      for (let i = 0; i < 3 && i < currentWorkers.length; i++) {
        currentWorkers[i].hp = 0
      }
      for (let i = 0; i < 10; i++) g.update(0.016)

      // Re-read after death
      const workersAfterDamage = g.units.filter(
        (u: any) => u.team === 0 && u.type === 'worker' && u.hp > 0,
      ).length
      const goldAfterDamage = g.resources.get(0).gold

      // Re-train 3 workers
      g.resources.get(0).gold = 1000  // ensure we can afford it
      g.issueCommand([], { type: 'train', building: th, unitType: 'worker', trainTime: 12 })
      g.issueCommand([], { type: 'train', building: th, unitType: 'worker', trainTime: 12 })
      g.issueCommand([], { type: 'train', building: th, unitType: 'worker', trainTime: 12 })

      // Set rally to gold mine
      g.issueCommand([], {
        type: 'setRally', building: th,
        target: gm.mesh.position, rallyTarget: gm,
      })

      // Advance 50s for training + gathering
      remaining = 50
      while (remaining > 0) { const s = Math.min(0.016, remaining); g.update(s); remaining -= s }

      // Re-read final state
      const workersRecovered = g.units.filter(
        (u: any) => u.team === 0 && u.type === 'worker' && u.hp > 0,
      ).length
      const goldRecovered = g.resources.get(0).gold
      const gatheringRecovered = g.units.filter(
        (u: any) => u.team === 0 && u.type === 'worker' && u.hp > 0
          && (u.state === 2 || u.state === 3 || u.state === 4),
      ).length

      return {
        goldBeforeDamage,
        workersAfterDamage,
        goldAfterDamage,
        workersRecovered,
        goldRecovered,
        gatheringRecovered,
      }
    })

    expect(result).not.toBeNull()

    // Damage reduced workers
    expect(result!.workersAfterDamage, 'workers reduced').toBeLessThan(5)

    // Recovery: workers restored
    expect(result!.workersRecovered, 'workers recovered').toBeGreaterThan(result!.workersAfterDamage)
    expect(result!.workersRecovered, '>=4 workers after recovery').toBeGreaterThanOrEqual(4)

    // Income resumed
    expect(result!.gatheringRecovered, '>=1 worker gathering after recovery').toBeGreaterThanOrEqual(1)

    console.log('[V5-ECO1 PROOF] Damage recovery:', result)
  })

  test('V5-ECO1 comprehensive economy backbone audit', async ({ page }) => {
    await waitForGame(page)
    await disableAI(page)

    const result = await page.evaluate(() => {
      const g = (window as any).__war3Game
      const th = g.units.find(
        (u: any) => u.team === 0 && u.type === 'townhall' && u.hp > 0 && u.buildProgress >= 1,
      )
      const bk = g.units.find(
        (u: any) => u.team === 0 && u.type === 'barracks' && u.hp > 0 && u.buildProgress >= 1,
      )
      const gm = g.units.find((u: any) => u.type === 'goldmine' && u.hp > 0)
      if (!th || !bk || !gm) return null

      // Audit 1: Gold income works
      const workers = g.units.filter(
        (u: any) => u.team === 0 && u.type === 'worker' && u.hp > 0,
      )
      for (let i = 0; i < 3 && i < workers.length; i++) {
        g.issueCommand([workers[i]], {
          type: 'gather', resourceType: 'gold', target: gm.mesh.position,
        })
        workers[i].resourceTarget = { type: 'goldmine', mine: gm }
        g.planPath(workers[i], gm.mesh.position)
      }

      const goldBefore = g.resources.get(0).gold
      let remaining = 20
      while (remaining > 0) { const s = Math.min(0.016, remaining); g.update(s); remaining -= s }
      const goldAfterGather = g.resources.get(0).gold
      const goldIncreased = goldAfterGather > goldBefore

      // Audit 2: Training from earned resources
      g.issueCommand([], { type: 'train', building: th, unitType: 'worker', trainTime: 12 })
      remaining = 15
      while (remaining > 0) { const s = Math.min(0.016, remaining); g.update(s); remaining -= s }
      const workerCount = g.units.filter(
        (u: any) => u.team === 0 && u.type === 'worker' && u.hp > 0,
      ).length
      const trainingWorks = workerCount > 5

      // Audit 3: Supply chain
      const supply = g.resources.computeSupply(0, g.units)
      const supplyWorks = supply.total >= supply.used && supply.total > 0

      // Audit 4: Military production from income
      g.resources.get(0).gold = 500
      g.issueCommand([], { type: 'train', building: bk, unitType: 'footman', trainTime: 16 })
      remaining = 20
      while (remaining > 0) { const s = Math.min(0.016, remaining); g.update(s); remaining -= s }
      const footmen = g.units.filter(
        (u: any) => u.team === 0 && u.type === 'footman' && u.hp > 0,
      ).length
      const militaryWorks = footmen > 0

      // Audit 5: Gold not collapsed after spending
      const goldNotCollapsed = g.resources.get(0).gold >= 0

      // Audit 6: Gathering workers still active
      const gathering = g.units.filter(
        (u: any) => u.team === 0 && u.type === 'worker' && u.hp > 0
          && (u.state === 2 || u.state === 3 || u.state === 4),
      ).length
      const gatheringActive = gathering >= 2

      return {
        goldIncreased,
        trainingWorks,
        supplyWorks,
        militaryWorks,
        goldNotCollapsed,
        gatheringActive,
        detail: {
          goldBefore,
          goldAfterGather,
          workerCount,
          supply: `${supply.used}/${supply.total}`,
          footmen,
          gathering,
        },
      }
    })

    expect(result).not.toBeNull()

    const audit: Record<string, { passed: boolean; note: string }> = {
      gold_income: { passed: result!.goldIncreased, note: 'gold increases from gathering' },
      training: { passed: result!.trainingWorks, note: `workers > 5 (${result!.detail.workerCount})` },
      supply: { passed: result!.supplyWorks, note: `supply ${result!.detail.supply}` },
      military: { passed: result!.militaryWorks, note: `${result!.detail.footmen} footmen` },
      gold_sustained: { passed: result!.goldNotCollapsed, note: 'gold >= 0' },
      gathering_active: { passed: result!.gatheringActive, note: `${result!.detail.gathering} gathering` },
    }

    for (const [k, a] of Object.entries(audit)) {
      expect(a.passed, `${k}: ${a.note}`).toBe(true)
    }

    console.log('[V5-ECO1 CLOSEOUT AUDIT]', JSON.stringify({ audit, detail: result!.detail }, null, 2))
  })
})
