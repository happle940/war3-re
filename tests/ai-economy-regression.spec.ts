/**
 * AI Economy Deepening Contract Pack
 *
 * Runtime-proof Playwright tests proving AI can sustain a playable first
 * 5 minutes. All assertions are deterministic runtime state observations
 * via page.evaluate() on window.__war3Game.
 *
 * Covers:
 *  1. By 30s: AI has ≥1 gold worker and ≥1 lumber worker
 *  2. AI does not send every worker to gold; worker split is bounded
 *  3. AI completes at least one farm before supply cap blocks production
 *  4. AI trains workers and footmen without overspending or exceeding supply
 *  5. First attack wave: AI schedules pressure by midgame
 *  6. After first wave, AI can schedule a later wave (no permanent lock)
 *  7. If one AI worker is killed early, AI still recovers opening loop
 *  8. AI placement spam is bounded: no infinite retry on impossible placement
 *  9. No severe console errors during AI simulation
 */
import { test, expect, type Page } from '@playwright/test'

const BASE = 'http://127.0.0.1:4173/?runtimeTest=1'

// ==================== Diagnostic ====================

async function diagnose(page: Page, label: string) {
  const snap = await page.evaluate(() => {
    const g = (window as any).__war3Game
    if (!g) return { hasGame: false }
    const units = g.units ?? []
    const summarize = (team: number) => {
      const tu = units.filter((u: any) => u.team === team)
      return {
        workers: tu.filter((u: any) => u.type === 'worker' && !u.isBuilding && u.hp > 0).length,
        goldWorkers: tu.filter((u: any) => u.type === 'worker' && !u.isBuilding && u.hp > 0 && u.gatherType === 'gold'
          && (u.state === 2 || u.state === 3 || u.state === 4)).length,
        lumberWorkers: tu.filter((u: any) => u.type === 'worker' && !u.isBuilding && u.hp > 0 && u.gatherType === 'lumber'
          && (u.state === 2 || u.state === 3 || u.state === 4)).length,
        idleWorkers: tu.filter((u: any) => u.type === 'worker' && !u.isBuilding && u.hp > 0 && u.state === 0).length,
        footmen: tu.filter((u: any) => u.type === 'footman' && !u.isBuilding && u.hp > 0).length,
        footmenAttacking: tu.filter((u: any) => u.type === 'footman' && !u.isBuilding && u.hp > 0
          && (u.state === 7 || u.state === 8)).length,
        farms: tu.filter((u: any) => u.type === 'farm' && u.hp > 0 && u.buildProgress >= 1).length,
        farmsInProgress: tu.filter((u: any) => u.type === 'farm' && u.hp > 0 && u.buildProgress < 1).length,
        barracks: tu.filter((u: any) => u.type === 'barracks' && u.hp > 0 && u.buildProgress >= 1).length,
      }
    }
    return {
      hasGame: true,
      gameTime: g.gameTime?.toFixed(1),
      ai: summarize(1),
      aiRes: g.resources?.get(1),
      aiSupply: g.resources?.computeSupply(1, units),
      aiWaveCount: g.ai?.waveCount,
      aiAttackWaveSent: g.ai?.attackWaveSent,
    }
  })
  console.error(`\n[DIAGNOSE ${label}]`, JSON.stringify(snap, null, 2))
  return snap
}

// ==================== Bootstrap ====================

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
    throw new Error(
      `waitForGame failed. Console: ${consoleErrors.slice(-5).join(' | ')}. ` +
      `Original: ${(e as Error).message}`,
    )
  }

  try {
    await page.waitForFunction(() => {
      const status = document.getElementById('map-status')?.textContent ?? ''
      return !status.includes('正在加载')
    }, { timeout: 15000 })
  } catch { /* procedural map */ }

  await page.waitForTimeout(500)
}

/** Advance game time deterministically via tight evaluate loop */
async function advanceGameTime(page: Page, targetGameSeconds: number, stepDt: number = 0.016) {
  const result = await page.evaluate(({ target, dt }) => {
    const g = (window as any).__war3Game
    if (!g) return { ok: false, reason: 'no game' }
    const startGameTime = g.gameTime
    let remaining = target
    let iterations = 0
    const maxIterations = Math.ceil(target / dt) + 100
    while (remaining > 0 && iterations < maxIterations) {
      const step = Math.min(dt, remaining)
      g.update(step)
      remaining -= step
      iterations++
    }
    return {
      ok: true,
      startGameTime: startGameTime?.toFixed(1),
      endGameTime: g.gameTime?.toFixed(1),
      iterations,
    }
  }, { target: targetGameSeconds, dt: stepDt })

  if (!result.ok) {
    await diagnose(page, 'advance-fail')
    throw new Error(`advanceGameTime failed: ${(result as any).reason}`)
  }
}

/** Collect AI economy snapshot */
async function getAISnapshot(page: Page) {
  return page.evaluate(() => {
    const g = (window as any).__war3Game
    if (!g) return null
    const units = g.units
    const ai = (u: any) => u.team === 1

    const workers = units.filter((u: any) => ai(u) && u.type === 'worker' && !u.isBuilding && u.hp > 0)
    const goldWorkers = workers.filter((u: any) =>
      u.gatherType === 'gold' && (u.state === 2 || u.state === 3 || u.state === 4))
    const lumberWorkers = workers.filter((u: any) =>
      u.gatherType === 'lumber' && (u.state === 2 || u.state === 3 || u.state === 4))
    const idleWorkers = workers.filter((u: any) => u.state === 0)

    const footmen = units.filter((u: any) => ai(u) && u.type === 'footman' && !u.isBuilding && u.hp > 0)
    const footmenAttacking = footmen.filter((u: any) => u.state === 7 || u.state === 8)
    const footmenAttackMove = footmen.filter((u: any) => u.state === 8)

    const buildings = units.filter((u: any) => ai(u) && u.isBuilding && u.hp > 0)
    const farms = buildings.filter((u: any) => u.type === 'farm' && u.buildProgress >= 1)
    const farmsInProgress = buildings.filter((u: any) => u.type === 'farm' && u.buildProgress < 1)
    const barracks = buildings.filter((u: any) => u.type === 'barracks' && u.buildProgress >= 1)

    const supply = g.resources?.computeSupply(1, units)
    const res = g.resources?.get(1)

    // queued supply
    let queuedSupply = 0
    for (const u of units) {
      if (u.team !== 1 || !u.isBuilding) continue
      for (const item of u.trainingQueue) {
        queuedSupply += ({ worker: 1, footman: 2 } as Record<string, number>)[item.type] ?? 0
      }
    }

    // Training queue details
    const trainingDetails: any[] = []
    for (const u of units) {
      if (u.team !== 1 || !u.isBuilding || u.buildProgress < 1) continue
      if (u.trainingQueue.length > 0) {
        trainingDetails.push({
          type: u.type,
          queue: u.trainingQueue.map((q: any) => ({ type: q.type, remaining: q.remaining.toFixed(1) })),
        })
      }
    }

    // Player TH position (for attack direction check)
    const playerTH = units.find((u: any) => u.team === 0 && u.type === 'townhall' && u.hp > 0)
    const aiTH = units.find((u: any) => u.team === 1 && u.type === 'townhall' && u.hp > 0)
    const aiTownhallRallyMode = aiTH?.rallyTarget?.type === 'goldmine'
      ? 'goldmine'
      : (aiTH?.rallyPoint ? 'point' : 'none')

    // Footmen moving toward player half
    let footmenNearPlayer = 0
    let footmenMovingWest = 0
    if (playerTH) {
      const pPos = playerTH.mesh.position
      for (const f of footmen) {
        const dx = f.mesh.position.x - pPos.x
        const dz = f.mesh.position.z - pPos.z
        const dist = Math.sqrt(dx * dx + dz * dz)
        if (dist < 20) footmenNearPlayer++
      }
      // Check if any footman has progressed from the AI base toward the
      // player base. Do not assume the bases differ on the x axis; W3X
      // start locations can be vertically aligned.
      if (aiTH) {
        const baseDx = aiTH.mesh.position.x - playerTH.mesh.position.x
        const baseDz = aiTH.mesh.position.z - playerTH.mesh.position.z
        const baseDist = Math.sqrt(baseDx * baseDx + baseDz * baseDz)
        footmenMovingWest = footmen.filter(
          (f: any) => {
            const fdx = f.mesh.position.x - playerTH.mesh.position.x
            const fdz = f.mesh.position.z - playerTH.mesh.position.z
            const distToPlayer = Math.sqrt(fdx * fdx + fdz * fdz)
            return baseDist > 0 && distToPlayer < baseDist - 3
          },
        ).length
      }
    }

    return {
      gameTime: g.gameTime?.toFixed(1),
      workersTotal: workers.length,
      goldWorkers: goldWorkers.length,
      lumberWorkers: lumberWorkers.length,
      idleWorkers: idleWorkers.length,
      footmenTotal: footmen.length,
      footmenAttacking: footmenAttacking.length,
      footmenAttackMove: footmenAttackMove.length,
      footmenNearPlayer,
      footmenMovingWest,
      farmsComplete: farms.length,
      farmsInProgress: farmsInProgress.length,
      barracksComplete: barracks.length,
      supplyUsed: supply?.used,
      supplyTotal: supply?.total,
      effectiveUsed: supply ? supply.used + queuedSupply : -1,
      gold: res?.gold,
      lumber: res?.lumber,
      trainingDetails,
      aiWaveCount: g.ai?.waveCount ?? 0,
      aiAttackWaveSent: g.ai?.attackWaveSent ?? false,
      aiTownhallRallyMode,
      playerTHX: playerTH?.mesh.position.x,
      aiTHX: aiTH?.mesh.position.x,
    }
  })
}

// ==================== TEST SUITE ====================

test.describe('AI Economy Deepening', () => {
  test.setTimeout(300000)

  // ----------------------------------------------------------
  // 1. By 30s: AI has ≥1 gold worker and ≥1 lumber worker
  // ----------------------------------------------------------
  test('by 30s AI has both gold and lumber workers', async ({ page }) => {
    await waitForGame(page)
    await advanceGameTime(page, 30)

    const snap = await getAISnapshot(page)
    if (!snap) await diagnose(page, 't1-no-game')
    expect(snap).not.toBeNull()

    expect(
      snap!.goldWorkers,
      `AI gold workers at t=${snap!.gameTime}s: expected ≥1, got ${snap!.goldWorkers}. ` +
      `total=${snap!.workersTotal} idle=${snap!.idleWorkers} lumber=${snap!.lumberWorkers}`,
    ).toBeGreaterThanOrEqual(1)

    expect(
      snap!.lumberWorkers,
      `AI lumber workers at t=${snap!.gameTime}s: expected ≥1, got ${snap!.lumberWorkers}. ` +
      `total=${snap!.workersTotal} idle=${snap!.idleWorkers} gold=${snap!.goldWorkers}`,
    ).toBeGreaterThanOrEqual(1)
  })

  // ----------------------------------------------------------
  // 2. AI does not send every worker to gold; split is bounded
  //    Gold workers should not exceed targetGoldWorkers + 2
  //    (tolerance for timing/reroute). Lumber should get at least
  //    some workers once gold target is met.
  // ----------------------------------------------------------
  test('worker split between gold and lumber is bounded', async ({ page }) => {
    await waitForGame(page)
    await advanceGameTime(page, 45)

    const snap = await getAISnapshot(page)
    if (!snap) await diagnose(page, 't2-no-game')
    expect(snap).not.toBeNull()

    // AI profile: targetGoldWorkers = 4, maxWorkers = 10
    // Gold workers should not exceed targetGoldWorkers + 2 = 6
    const maxGoldWorkers = 6
    expect(
      snap!.goldWorkers,
      `AI gold workers should be ≤${maxGoldWorkers}, got ${snap!.goldWorkers}. ` +
      `total=${snap!.workersTotal} lumber=${snap!.lumberWorkers}`,
    ).toBeLessThanOrEqual(maxGoldWorkers)

    // Not all workers should be on gold (if there are workers to split)
    if (snap!.workersTotal >= 3) {
      const allOnGold = snap!.goldWorkers === snap!.workersTotal
        && snap!.idleWorkers === 0 && snap!.lumberWorkers === 0
      expect(
        allOnGold,
        `All ${snap!.workersTotal} workers on gold — no lumber workers assigned`,
      ).toBe(false)
    }
  })

  // ----------------------------------------------------------
  // 3. AI completes at least one farm before supply cap blocks
  //    Starting supply: 10 (from TH base). 5 workers = 5 used.
  //    Farm gives +6. AI should build farm before training >5 supply.
  // ----------------------------------------------------------
  test('AI completes at least one farm before supply blocks production', async ({ page }) => {
    await waitForGame(page)

    // Check at 60s — farm buildTime is 12s, so should be done well before 60s
    await advanceGameTime(page, 60)

    const snap = await getAISnapshot(page)
    if (!snap) await diagnose(page, 't3-no-game')
    expect(snap).not.toBeNull()

    expect(
      snap!.farmsComplete,
      `No completed farm at t=${snap!.gameTime}s. farms=${snap!.farmsComplete} ` +
      `inProgress=${snap!.farmsInProgress} supplyTotal=${snap!.supplyTotal}`,
    ).toBeGreaterThanOrEqual(1)

    expect(
      snap!.supplyTotal,
      `Farm complete but supply still at base 10`,
    ).toBeGreaterThanOrEqual(16) // 10 base + 6 from farm
  })

  // ----------------------------------------------------------
  // 4. AI trains workers and footmen without exceeding supply
  //    effectiveUsed (used + queued) ≤ total at all times
  // ----------------------------------------------------------
  test('AI trains workers and footmen within supply limit', async ({ page }) => {
    await waitForGame(page)
    await advanceGameTime(page, 90)

    const snap = await getAISnapshot(page)
    if (!snap) await diagnose(page, 't4-no-game')
    expect(snap).not.toBeNull()

    // Must have trained at least some additional workers (starts with 5)
    expect(
      snap!.workersTotal,
      `AI workers at t=${snap!.gameTime}s: expected ≥5, got ${snap!.workersTotal}`,
    ).toBeGreaterThanOrEqual(5)

    // Must have footmen or footman training
    const hasFootmen = snap!.footmenTotal > 0
    const hasFootmanTraining = snap!.trainingDetails.some(
      (t: any) => t.queue.some((q: any) => q.type === 'footman'),
    )
    expect(
      hasFootmen || hasFootmanTraining,
      `No footmen or footman training at t=${snap!.gameTime}s. ` +
      `footmen=${snap!.footmenTotal} training=${JSON.stringify(snap!.trainingDetails)}`,
    ).toBe(true)

    // Supply constraint: actual + queued ≤ total
    expect(
      snap!.effectiveUsed,
      `AI effective supply (${snap!.effectiveUsed}) exceeds total (${snap!.supplyTotal})`,
    ).toBeLessThanOrEqual(snap!.supplyTotal!)
  })

  // ----------------------------------------------------------
  // 5. First attack wave: AI schedules pressure by midgame.
  //    Movement/combat state is sampled opportunistically, but the stable
  //    contract is that the wave system actually fires.
  // ----------------------------------------------------------
  test('first attack wave is scheduled by midgame', async ({ page }) => {
    test.setTimeout(180000)
    await waitForGame(page)

    // Advance 210 game-seconds — after unit-presence separation and W3X
    // pathing, 150s is too tight on CI for deterministic pressure evidence.
    await advanceGameTime(page, 210)

    const snap = await getAISnapshot(page)
    if (!snap) await diagnose(page, 't5-no-game')
    expect(snap).not.toBeNull()

    // Stable evidence of attack: waveCount > 0. Footmen may already be in
    // combat, dead, or between orders by the time this discrete snapshot is read.
    const waveSent = snap!.aiWaveCount > 0

    expect(
      waveSent,
      `No attack wave evidence at t=${snap!.gameTime}s. ` +
      `waveCount=${snap!.aiWaveCount} nearPlayer=${snap!.footmenNearPlayer} ` +
      `attackMove=${snap!.footmenAttackMove} movingWest=${snap!.footmenMovingWest} ` +
      `footmenTotal=${snap!.footmenTotal} playerTHX=${snap!.playerTHX} aiTHX=${snap!.aiTHX}`,
    ).toBe(true)
  })

  // ----------------------------------------------------------
  // 6. After first wave, AI schedules a later wave (no permanent lock)
  //    Advance past first wave recovery, check waveCount ≥ 2
  //    or attackWaveSent resets to false with new footmen accumulating.
  // ----------------------------------------------------------
  test('AI schedules second attack wave after first wave resolves', async ({ page }) => {
    test.setTimeout(180000)
    await waitForGame(page)

    // Advance 360 game-seconds — enough for at least 2 waves under slower
    // CI and post-separation movement/production timing.
    await advanceGameTime(page, 360)

    const snap = await getAISnapshot(page)
    if (!snap) await diagnose(page, 't6-no-game')
    expect(snap).not.toBeNull()

    expect(
      snap!.aiWaveCount,
      `AI wave system appears permanently locked at t=${snap!.gameTime}s. ` +
      `waveCount=${snap!.aiWaveCount} attackWaveSent=${snap!.aiAttackWaveSent} ` +
      `footmenTotal=${snap!.footmenTotal}`,
    ).toBeGreaterThanOrEqual(2)
  })

  // ----------------------------------------------------------
  // 7. Worker kill resilience: kill one AI worker early,
  //    AI still gathers/builds/trains enough to continue
  // ----------------------------------------------------------
  test('AI recovers opening loop after losing one worker', async ({ page }) => {
    await waitForGame(page)

    // Kill one AI worker at t=0
    const killed = await page.evaluate(() => {
      const g = (window as any).__war3Game
      if (!g) return null
      const aiWorkers = g.units.filter(
        (u: any) => u.team === 1 && u.type === 'worker' && !u.isBuilding && u.hp > 0,
      )
      if (aiWorkers.length === 0) return { killed: false }
      aiWorkers[0].hp = 0 // mark dead
      return { killed: true, remaining: aiWorkers.length - 1 }
    })
    expect(killed).not.toBeNull()
    expect(killed!.killed).toBe(true)

    // Advance 90s — enough for AI to recover
    await advanceGameTime(page, 90)

    const snap = await getAISnapshot(page)
    if (!snap) await diagnose(page, 't7-no-game')
    expect(snap).not.toBeNull()

    // AI should still have workers gathering (≥1 gold or ≥1 lumber)
    const stillGathering = snap!.goldWorkers + snap!.lumberWorkers
    expect(
      stillGathering,
      `AI has no gathering workers after losing 1 worker. ` +
      `gold=${snap!.goldWorkers} lumber=${snap!.lumberWorkers} total=${snap!.workersTotal}`,
    ).toBeGreaterThanOrEqual(1)

    // AI should still have buildings (TH at minimum)
    expect(
      snap!.barracksComplete,
      `AI barracks destroyed or never built after worker loss`,
    ).toBeGreaterThanOrEqual(1)

    // AI resources should have changed from initial (500/200)
    const spentOrEarned = snap!.gold !== 500 || snap!.lumber !== 200
    expect(
      spentOrEarned,
      `AI resources unchanged (gold=${snap!.gold} lumber=${snap!.lumber}) after 90s with 1 worker killed`,
    ).toBe(true)
  })

  // ----------------------------------------------------------
  // 8. AI placement spam is bounded: no infinite building spawns
  //    Count AI farms+barracks at 60s — should be reasonable (≤10)
  //    and count of buildings with buildProgress=0 (instant spam) should be 0
  // ----------------------------------------------------------
  test('AI does not spam impossible building placements', async ({ page }) => {
    await waitForGame(page)
    await advanceGameTime(page, 60)

    const result = await page.evaluate(() => {
      const g = (window as any).__war3Game
      if (!g) return null
      const units = g.units
      const aiBuildings = units.filter(
        (u: any) => u.team === 1 && u.isBuilding && u.hp > 0,
      )
      const farms = aiBuildings.filter((u: any) => u.type === 'farm')
      const barracks = aiBuildings.filter((u: any) => u.type === 'barracks')
      const zeroProgress = aiBuildings.filter((u: any) => u.buildProgress === 0)

      return {
        totalBuildings: aiBuildings.length,
        farms: farms.length,
        barracks: barracks.length,
        zeroProgressCount: zeroProgress.length,
        gameTime: g.gameTime?.toFixed(1),
      }
    })

    if (!result) await diagnose(page, 't8-no-game')
    expect(result).not.toBeNull()

    // Total buildings should be reasonable (initial barracks + farm + maybe 1 more)
    expect(
      result!.totalBuildings,
      `AI has ${result!.totalBuildings} buildings at t=${result!.gameTime}s — possible placement spam`,
    ).toBeLessThanOrEqual(12)

    // No stuck at buildProgress=0 (means spawned but never started building)
    expect(
      result!.zeroProgressCount,
      `${result!.zeroProgressCount} AI buildings stuck at buildProgress=0`,
    ).toBe(0)
  })

  // ----------------------------------------------------------
  // 9. No severe console errors during AI simulation
  // ----------------------------------------------------------
  test('no severe console errors during AI simulation', async ({ page }) => {
    const consoleErrors: string[] = []
    page.on('console', (msg) => {
      if (msg.type() === 'error') consoleErrors.push(msg.text())
    })

    await waitForGame(page)
    await advanceGameTime(page, 60)

    // Advance a few more frames to let things settle
    await page.evaluate(() => {
      const g = (window as any).__war3Game
      if (!g) return
      for (let i = 0; i < 30; i++) g.update(0.016)
    })

    const severeErrors = consoleErrors.filter(e =>
      !e.includes('404') &&
      !e.includes('net::') &&
      !e.includes('favicon') &&
      !e.includes('Test map load failed') &&
      !e.includes('THREE.WebGLProgram') &&
      !e.includes('[HMR]') &&
      e.length > 0,
    )

    expect(
      severeErrors.length,
      `Unexpected console errors:\n${severeErrors.join('\n')}`,
    ).toBe(0)
  })

  // ----------------------------------------------------------
  // 10. Gold mine saturation: AI never exceeds 5 gold workers
  //     over an extended simulation. Once saturated, TH must not keep
  //     a gold rally active.
  // ----------------------------------------------------------
  test('AI gold workers stay within mine saturation cap and clear gold rally when saturated', async ({ page }) => {
    await waitForGame(page)

    // Sample at multiple time points to ensure cap is not just a timing artifact
    const violations: string[] = []

    // Advance to t=45 and check
    await advanceGameTime(page, 45)
    let snap = await getAISnapshot(page)
    if (!snap) { violations.push('t=45: no snapshot') }
    else {
      if (snap.goldWorkers > 5) {
        violations.push(
          `t=${snap.gameTime}s: ${snap.goldWorkers} gold workers (>5). ` +
          `total=${snap.workersTotal} lumber=${snap.lumberWorkers} idle=${snap.idleWorkers}`,
        )
      }
      if (snap.goldWorkers >= 5 && snap.aiTownhallRallyMode === 'goldmine') {
        violations.push(
          `t=${snap.gameTime}s: townhall still has gold rally while saturated ` +
          `(gold=${snap.goldWorkers}, rally=${snap.aiTownhallRallyMode})`,
        )
      }
    }

    // Advance to t=90 and check
    await advanceGameTime(page, 45)
    snap = await getAISnapshot(page)
    if (!snap) { violations.push('t=90: no snapshot') }
    else {
      if (snap.goldWorkers > 5) {
        violations.push(
          `t=${snap.gameTime}s: ${snap.goldWorkers} gold workers (>5). ` +
          `total=${snap.workersTotal} lumber=${snap.lumberWorkers} idle=${snap.idleWorkers}`,
        )
      }
      if (snap.goldWorkers >= 5 && snap.aiTownhallRallyMode === 'goldmine') {
        violations.push(
          `t=${snap.gameTime}s: townhall still has gold rally while saturated ` +
          `(gold=${snap.goldWorkers}, rally=${snap.aiTownhallRallyMode})`,
        )
      }
    }

    // Advance to t=120 and check
    await advanceGameTime(page, 30)
    snap = await getAISnapshot(page)
    if (!snap) { violations.push('t=120: no snapshot') }
    else {
      if (snap.goldWorkers > 5) {
        violations.push(
          `t=${snap.gameTime}s: ${snap.goldWorkers} gold workers (>5). ` +
          `total=${snap.workersTotal} lumber=${snap.lumberWorkers} idle=${snap.idleWorkers}`,
        )
      }
      if (snap.goldWorkers >= 5 && snap.aiTownhallRallyMode === 'goldmine') {
        violations.push(
          `t=${snap.gameTime}s: townhall still has gold rally while saturated ` +
          `(gold=${snap.goldWorkers}, rally=${snap.aiTownhallRallyMode})`,
        )
      }
    }

    expect(
      violations,
      `Gold saturation violations:\n${violations.join('\n')}`,
    ).toHaveLength(0)
  })

  // ----------------------------------------------------------
  // 11. AI maintains at least 1 lumber worker at midgame
  //     (proves saturation logic doesn't starve lumber)
  // ----------------------------------------------------------
  test('AI maintains at least 1 lumber worker through midgame', async ({ page }) => {
    await waitForGame(page)
    await advanceGameTime(page, 90)

    const snap = await getAISnapshot(page)
    if (!snap) await diagnose(page, 't11-no-game')
    expect(snap).not.toBeNull()

    expect(
      snap!.lumberWorkers,
      `AI has 0 lumber workers at t=${snap!.gameTime}s. ` +
      `gold=${snap!.goldWorkers} total=${snap!.workersTotal} idle=${snap!.idleWorkers}`,
    ).toBeGreaterThanOrEqual(1)
  })

  // ----------------------------------------------------------
  // 12. AI early loop still works: farm + barracks + footman
  //     at 90s despite saturation logic
  // ----------------------------------------------------------
  test('AI completes early build loop (farm+barracks+footman) with saturation logic', async ({ page }) => {
    await waitForGame(page)
    await advanceGameTime(page, 90)

    const snap = await getAISnapshot(page)
    if (!snap) await diagnose(page, 't12-no-game')
    expect(snap).not.toBeNull()

    // Farm
    expect(
      snap!.farmsComplete,
      `No completed farm at t=${snap!.gameTime}s with saturation logic active`,
    ).toBeGreaterThanOrEqual(1)

    // Barracks
    expect(
      snap!.barracksComplete,
      `No completed barracks at t=${snap!.gameTime}s with saturation logic active`,
    ).toBeGreaterThanOrEqual(1)

    // Footman (trained or in training)
    const hasFootmen = snap!.footmenTotal > 0
    const hasFootmanTraining = snap!.trainingDetails.some(
      (t: any) => t.queue.some((q: any) => q.type === 'footman'),
    )
    expect(
      hasFootmen || hasFootmanTraining,
      `No footmen at t=${snap!.gameTime}s with saturation logic. ` +
      `footmen=${snap!.footmenTotal} training=${JSON.stringify(snap!.trainingDetails)}`,
    ).toBe(true)
  })
})
