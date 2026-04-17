/**
 * M4 Player-Reported UX Reality Pack
 *
 * Converts user live-play complaints into runtime/DOM contracts.
 * Each test proves a specific player-reported issue is either:
 * - fixed (the system works as expected)
 * - already covered (existing tests prove it, this adds live-like proof)
 * - still open (test documents what's missing)
 *
 * Issues covered:
 * 1. Barracks construction stops halfway, feels impossible to resume.
 * 2. Arrow tower appears to have no attack in live play.
 * 3. Units do not have meaningful collision/body presence.
 * 4. Supply block makes unit production feel dead.
 * 5. Construction cancel is not discoverable or usable enough.
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

test.describe('M4 Player-Reported UX Reality', () => {
  test.setTimeout(120000)

  // ============================================================
  // Issue 1: Construction resume through right-click workflow
  // User complaint: "barracks construction stopped halfway, can't resume"
  //
  // Live-like proof:
  //   1. Spawn unfinished building + idle worker nearby
  //   2. Select worker
  //   3. Right-click the unfinished building via handleRightClick
  //   4. Advance g.update() — not private internals — until buildProgress increases
  //
  // Correction: uses g.update() loop (real game loop) instead of
  // g.updateBuildProgress() (private bypass).
  // ============================================================
  test('construction resume: right-clicking unfinished building with selected worker resumes progress', async ({ page }) => {
    await waitForGame(page)

    const result = await page.evaluate(() => {
      const g = (window as any).__war3Game
      if (!g) return { ok: false, reason: 'no game' }

      const Idle = 0

      // spawnUnit/spawnBuilding take tile coordinates and add +0.5 to world center.
      // Keep both objects inside the default camera view, with the worker outside
      // the farm footprint so the click path is realistic.
      const worker = g.spawnUnit('worker', 0, 15, 14)
      worker.state = Idle
      worker.moveTarget = null

      const farm = g.spawnBuilding('farm', 0, 17, 14)
      farm.buildProgress = 0.3
      farm.builder = null
      g.camera.updateMatrixWorld(true)
      g.scene.updateMatrixWorld(true)

      // Select the worker
      g.selectionModel.clear()
      g.clearSelectionRings()
      g.selectionModel.setSelection([worker])
      g.createSelectionRing(worker)

      // Right-click the unfinished farm via handleRightClick (live-like path).
      // handleRightClick uses intersectObjects()[0], so the test must find a point
      // whose first raycast hit resolves to the farm rather than merely hitting it
      // somewhere behind another object.
      g.shiftHeld = false
      const allUnitMeshes = g.units.map((u: any) => u.mesh)
      const resolveUnit = (hitObj: any) => {
        let obj = hitObj
        while (obj) {
          const found = g.units.find((u: any) => u.mesh === obj)
          if (found) return found
          obj = obj.parent
        }
        return null
      }

      let clickFound = false
      let clickNDC = { x: 0, y: 0 }
      let firstHitType = 'none'
      for (const yOffset of [0.25, 0.5, 0.85, 1.2, 1.6]) {
        const probe = farm.mesh.position.clone()
        probe.y += yOffset
        probe.project(g.camera)
        for (const dx of [0, -0.02, 0.02, -0.04, 0.04, -0.08, 0.08]) {
          for (const dy of [0, -0.02, 0.02, -0.04, 0.04, -0.08, 0.08]) {
            g.mouseNDC.set(probe.x + dx, probe.y + dy)
            g.raycaster.setFromCamera(g.mouseNDC, g.camera)
            const hits = g.raycaster.intersectObjects(allUnitMeshes, true)
            const firstUnit = hits.length > 0 ? resolveUnit(hits[0].object) : null
            if (firstUnit) firstHitType = firstUnit.type
            if (firstUnit === farm) {
              clickFound = true
              clickNDC = { x: g.mouseNDC.x, y: g.mouseNDC.y }
              break
            }
          }
          if (clickFound) break
        }
        if (clickFound) break
      }

      if (clickFound) {
        g.mouseNDC.set(clickNDC.x, clickNDC.y)
        g.handleRightClick()
      }

      const workerIdx = g.units.indexOf(worker)
      const farmIdx = g.units.indexOf(farm)
      const progressAtResume = farm.buildProgress

      const workerStateAfterClick = worker.state
      const workerBuildTargetAfterClick = worker.buildTarget ? g.units.indexOf(worker.buildTarget) : -1
      const farmBuilderAfterClick = farm.builder ? g.units.indexOf(farm.builder) : -1

      let progressIncreased = false
      let finalWorkerState = worker.state
      let finalWorkerBuildTarget = worker.buildTarget ? g.units.indexOf(worker.buildTarget) : -1
      let finalFarmBuilder = farm.builder ? g.units.indexOf(farm.builder) : -1
      let finalProgress = farm.buildProgress

      for (let i = 0; i < 500; i++) {
        g.update(0.016)
        if (farm.buildProgress > progressAtResume) {
          progressIncreased = true
          finalWorkerState = worker.state
          finalWorkerBuildTarget = worker.buildTarget ? g.units.indexOf(worker.buildTarget) : -1
          finalFarmBuilder = farm.builder ? g.units.indexOf(farm.builder) : -1
          finalProgress = farm.buildProgress
          break
        }
      }

      return {
        ok: true,
        clickFound,
        clickNDC,
        firstHitType,
        workerStateAfterClick,
        workerBuildTargetAfterClick,
        farmBuilderAfterClick,
        progressAtResume,
        finalProgress,
        progressIncreased,
        finalWorkerState,
        finalWorkerBuildTarget,
        finalFarmBuilder,
        workerIdx,
        farmIdx,
      }
    })

    expect(result.ok, 'game must load').toBe(true)
    expect(
      result.clickFound,
      `test must find a live-like clickable farm point; last first hit was "${result.firstHitType}"`,
    ).toBe(true)
    expect(result.workerBuildTargetAfterClick, 'right-click should assign the worker to the unfinished farm').toBe(result.farmIdx)
    expect(result.farmBuilderAfterClick, 'farm should remember the selected worker as builder').toBe(result.workerIdx)
    expect(result.progressIncreased, 'build progress must increase through real game loop after resume').toBe(true)
    expect(result.finalWorkerBuildTarget, 'worker should keep buildTarget pointing to the farm').toBe(result.farmIdx)
    expect(result.finalFarmBuilder, 'farm should keep the worker as builder').toBe(result.workerIdx)
    expect(
      [5, 6].includes(result.finalWorkerState),
      `worker should be in MovingToBuild(5) or Building(6), got ${result.finalWorkerState}`,
    ).toBe(true)
    expect(severeConsoleErrors(page)).toHaveLength(0)
  })

  // ============================================================
  // Issue 2: Tower live attack with visible feedback
  // User complaint: "arrow tower appears to have no attack"
  //
  // Proof: completed tower damages enemy + HUD shows readable stats.
  // Under-construction tower does not attack.
  // Uses unit-hp-text (actual DOM element ID) for HP feedback.
  // ============================================================
  test('tower live attack: completed tower damages enemy and HUD shows readable stats', async ({ page }) => {
    await waitForGame(page)

    const result = await page.evaluate(() => {
      const g = (window as any).__war3Game
      if (!g) return { ok: false, reason: 'no game' }

      const tower = g.spawnBuilding('tower', 0, 40, 40)
      tower.buildProgress = 1
      const enemy = g.spawnUnit('footman', 1, 41, 40)

      const enemyHpBefore = enemy.hp
      const towerDamage = tower.attackDamage
      const towerRange = tower.attackRange

      // Advance 10 game-seconds through real game loop
      for (let i = 0; i < 625; i++) g.update(0.016)

      const enemyHpAfter = enemy.hp

      // Select tower and read HUD
      g.selectionModel.clear()
      g.clearSelectionRings()
      g.selectionModel.setSelection([tower])
      g.createSelectionRing(tower)
      g.updateHUD(0.016)

      const unitName = document.getElementById('unit-name')?.textContent ?? ''
      const hpText = document.getElementById('unit-hp-text')?.textContent ?? ''

      return {
        ok: true,
        enemyHpBefore,
        enemyHpAfter,
        towerDamage,
        towerRange,
        unitName,
        hpText,
      }
    })

    expect(result.ok, 'game must load').toBe(true)
    expect(result.towerDamage, 'tower must have nonzero attackDamage').toBeGreaterThan(0)
    expect(result.towerRange, 'tower must have nonzero attackRange').toBeGreaterThan(0)
    expect(result.enemyHpAfter, 'enemy must take damage').toBeLessThan(result.enemyHpBefore)
    expect(result.unitName, 'HUD must show tower name when selected').toBeTruthy()
    expect(result.hpText, 'HUD must show HP text when tower selected').toBeTruthy()
    expect(severeConsoleErrors(page)).toHaveLength(0)
  })

  test('tower live attack: under-construction tower does not attack', async ({ page }) => {
    await waitForGame(page)

    const result = await page.evaluate(() => {
      const g = (window as any).__war3Game
      if (!g) return { ok: false, reason: 'no game' }

      const tower = g.spawnBuilding('tower', 0, 40, 40)
      tower.buildProgress = 0.5
      const enemy = g.spawnUnit('footman', 1, 41, 40)

      const enemyHpBefore = enemy.hp
      for (let i = 0; i < 625; i++) g.update(0.016)

      return {
        ok: true,
        enemyHpBefore,
        enemyHpAfter: enemy.hp,
      }
    })

    expect(result.ok).toBe(true)
    expect(result.enemyHpAfter, 'under-construction tower must not deal damage').toBe(result.enemyHpBefore)
    expect(severeConsoleErrors(page)).toHaveLength(0)
  })

  // ============================================================
  // Issue 3: Unit collision/body presence
  // User complaint: "units don't have meaningful collision"
  // Focused proof: two units ordered to same point don't overlap exactly
  // ============================================================
  test('unit body presence: two units moving to same point do not end in exact overlap', async ({ page }) => {
    await waitForGame(page)

    const result = await page.evaluate(() => {
      const g = (window as any).__war3Game
      if (!g) return { ok: false, reason: 'no game' }

      const u1 = g.spawnUnit('worker', 0, 30, 30)
      const u2 = g.spawnUnit('worker', 0, 32, 30)

      const Vector3 = u1.mesh.position.constructor
      const target = new Vector3(35, 0, 30)
      target.y = g.getWorldHeight(35, 30)

      g.planPathForUnits([u1, u2], target)
      for (let i = 0; i < 300; i++) g.update(0.016)

      const p1 = u1.mesh.position
      const p2 = u2.mesh.position
      const dist = Math.hypot(p1.x - p2.x, p1.z - p2.z)

      return {
        ok: true,
        dist: +dist.toFixed(4),
        bothAlive: u1.hp > 0 && u2.hp > 0,
        bothInUnits: g.units.includes(u1) && g.units.includes(u2),
      }
    })

    expect(result.ok).toBe(true)
    expect(result.dist, 'two units at same target must have nonzero separation').toBeGreaterThan(0.15)
    expect(result.bothAlive, 'both units must remain alive').toBe(true)
    expect(result.bothInUnits, 'both units must remain in game').toBe(true)
    expect(severeConsoleErrors(page)).toHaveLength(0)
  })

  // ============================================================
  // Issue 4: Supply-block feedback with recovery path
  // User complaint: "supply block makes production feel dead, no idea to build farm"
  //
  // Correct flow:
  //   1. Fill supply to cap
  //   2. Select barracks → assert footman button disabled with 人口 reason
  //   3. Select a worker → assert worker command card has enabled Farm/农场 build button
  //
  // Correction: Farm button is on the worker command card, not the barracks card.
  // ============================================================
  test('supply block: barracks shows supply-blocked footman and worker has farm build available', async ({ page }) => {
    await waitForGame(page)

    const result = await page.evaluate(() => {
      const g = (window as any).__war3Game
      if (!g) return { ok: false, reason: 'no game' }

      // Find completed barracks and a worker
      const barracks = g.units.find(
        (u: any) => u.team === 0 && u.type === 'barracks' && u.isBuilding && u.hp > 0 && u.buildProgress >= 1,
      )
      const worker = g.units.find(
        (u: any) => u.team === 0 && u.type === 'worker' && !u.isBuilding && u.hp > 0,
      )
      if (!barracks) return { ok: false, reason: 'no completed barracks' }
      if (!worker) return { ok: false, reason: 'no worker' }

      // Fill supply to cap
      let spawned = 0
      while (true) {
        const sup = g.resources.computeSupply(0, g.units)
        if (sup.used >= sup.total) break
        g.spawnUnit('worker', 0, 20 + spawned, 20)
        spawned++
        if (spawned > 30) break
      }

      g.resources.earn(0, 200, 50)

      // --- Step 1: Select barracks, read command card ---
      g.selectionModel.clear()
      g.clearSelectionRings()
      g.selectionModel.setSelection([barracks])
      g.createSelectionRing(barracks)
      g.updateHUD(0.016)

      const supply = g.resources.computeSupply(0, g.units)

      const barracksButtons = Array.from(document.querySelectorAll('#command-card button'))
      const barracksBtnData = barracksButtons.map((btn: any) => ({
        label: btn.textContent?.trim() ?? '',
        disabled: btn.disabled,
        disabledReason: btn.dataset.disabledReason ?? '',
        title: btn.title ?? '',
      }))

      const footmanBtn = barracksBtnData.find(b => b.label.includes('步兵'))

      // --- Step 2: Select worker, read command card for farm build ---
      g.selectionModel.clear()
      g.clearSelectionRings()
      g.selectionModel.setSelection([worker])
      g.createSelectionRing(worker)
      g.updateHUD(0.016)

      const workerButtons = Array.from(document.querySelectorAll('#command-card button'))
      const workerBtnData = workerButtons.map((btn: any) => ({
        label: btn.textContent?.trim() ?? '',
        disabled: btn.disabled,
        disabledReason: btn.dataset.disabledReason ?? '',
        title: btn.title ?? '',
      }))

      const farmBtn = workerBtnData.find(b => b.label.includes('农场'))

      return {
        ok: true,
        supplyUsed: supply.used,
        supplyTotal: supply.total,
        footmanBtn: footmanBtn ?? null,
        farmBtn: farmBtn ?? null,
      }
    })

    expect(result.ok, 'game must load with barracks and worker').toBe(true)
    expect(result.supplyUsed, 'supply must be at cap').toBeGreaterThanOrEqual(result.supplyTotal)

    // Barracks: footman disabled with supply reason
    expect(result.footmanBtn, 'footman button must exist in barracks command card').not.toBeNull()
    expect(result.footmanBtn.disabled, 'footman button must be disabled at supply cap').toBe(true)
    expect(
      result.footmanBtn.disabledReason.includes('人口') || result.footmanBtn.title.includes('人口'),
      `footman disabled reason must mention 人口, got: "${result.footmanBtn.disabledReason}" / "${result.footmanBtn.title}"`,
    ).toBe(true)

    // Worker: farm build route available (recovery path)
    expect(result.farmBtn, 'farm button must exist in worker command card').not.toBeNull()
    expect(result.farmBtn.disabled, 'farm button must be enabled when player has resources').toBe(false)
    expect(severeConsoleErrors(page)).toHaveLength(0)
  })

  // ============================================================
  // Issue 5: Construction cancel discoverability
  // User complaint: "construction cancel not discoverable or usable"
  //
  // Proof: select unfinished building → cancel button visible →
  //   click cancel → footprint released + refund + builder cleanup
  //
  // Correction: snapshot resources as primitives before click,
  // use numeric literals for state constants inside evaluate.
  // ============================================================
  test('construction cancel: selecting unfinished building exposes cancel command in command card', async ({ page }) => {
    await waitForGame(page)

    const result = await page.evaluate(() => {
      const g = (window as any).__war3Game
      if (!g) return { ok: false, reason: 'no game' }

      const Idle = 0

      // Give player resources and snapshot as primitives
      g.resources.earn(0, 200, 100)
      const beforeRes = g.resources.get(0)
      const goldBefore = beforeRes.gold
      const lumberBefore = beforeRes.lumber

      const farmSize = 2
      let farmTile: { x: number; z: number } | null = null
      for (let z = 20; z < 58 && !farmTile; z++) {
        for (let x = 20; x < 58; x++) {
          if (g.placementValidator.canPlace(x, z, farmSize).ok) {
            farmTile = { x, z }
            break
          }
        }
      }
      if (!farmTile) return { ok: false, reason: 'no clear farm tile' }

      // Spawn unfinished farm with a builder on a tile that was actually
      // placeable before the test building occupied it.
      const builder = g.spawnUnit('worker', 0, farmTile.x - 2, farmTile.z)
      const farm = g.spawnBuilding('farm', 0, farmTile.x, farmTile.z)
      farm.buildProgress = 0.4
      farm.builder = builder
      builder.buildTarget = farm
      builder.state = 6 // Building

      const canPlaceBefore = g.placementValidator.canPlace(farmTile.x, farmTile.z, farmSize).ok

      // Select unfinished building
      g.selectionModel.clear()
      g.clearSelectionRings()
      g.selectionModel.setSelection([farm])
      g.createSelectionRing(farm)
      g.updateHUD(0.016)

      // Find cancel button
      const buttons = Array.from(document.querySelectorAll('#command-card button'))
      const cancelBtn = buttons.find((btn: any) => (btn.textContent ?? '').includes('取消'))

      const hadCancelButton = !!cancelBtn
      if (cancelBtn) {
        ;(cancelBtn as HTMLButtonElement).click()
        g.updateHUD(0.016)
      }

      // Snapshot after-cancel resources as primitives
      const afterRes = g.resources.get(0)
      const goldAfter = afterRes.gold
      const lumberAfter = afterRes.lumber

      return {
        ok: true,
        hadCancelButton,
        goldBefore,
        goldAfter,
        goldRefund: goldAfter - goldBefore,
        lumberBefore,
        lumberAfter,
        farmStillExists: g.units.includes(farm),
        builderState: builder.state,
        builderBuildTarget: builder.buildTarget ? g.units.indexOf(builder.buildTarget) : -1,
        selectedCount: g.selectionModel.count,
        ringCount: g.selectionRings.length,
        farmTile,
        canPlaceBefore,
        canPlaceAfter: g.placementValidator.canPlace(farmTile.x, farmTile.z, farmSize).ok,
        unitName: document.getElementById('unit-name')?.textContent ?? '',
        Idle,
      }
    })

    expect(result.ok, 'game must load').toBe(true)
    expect(result.hadCancelButton, 'cancel button must appear when unfinished building is selected').toBe(true)
    expect(result.canPlaceBefore, `test farm tile should be occupied before cancel: ${JSON.stringify(result.farmTile)}`).toBe(false)

    // Post-cancel assertions
    expect(result.farmStillExists, 'farm must be removed after cancel').toBe(false)
    expect(result.goldRefund, 'partial gold refund must be issued').toBeGreaterThan(0)
    expect(result.builderState, 'builder must return to Idle').toBe(result.Idle)
    expect(result.builderBuildTarget, 'builder buildTarget must be cleared').toBe(-1)
    expect(result.selectedCount, 'selection must be cleared').toBe(0)
    expect(result.ringCount, 'selection rings must be cleared').toBe(0)
    expect(result.canPlaceAfter, 'footprint must be released for reuse').toBe(true)
    expect(result.unitName, 'unit name must reset to empty selection').toBe('未选择单位')
    expect(severeConsoleErrors(page)).toHaveLength(0)
  })
})
