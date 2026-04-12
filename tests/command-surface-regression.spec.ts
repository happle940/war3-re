/**
 * Command Surface Regression Matrix
 *
 * Proves that the player-facing command semantics produce War3-like behavior
 * across the combination of: selected unit + target/action + command-card state.
 *
 * Matrix coverage:
 *   Right-click target:
 *     1. Worker + unfinished own building -> resume via handleRightClick + g.update()
 *     2. Worker + goldmine -> gather command, resourceTarget set
 *     3. Non-worker + goldmine -> move near mine, no gather state
 *     4. Combat unit + enemy -> attack command, attackTarget set
 *     5. Unit + ground -> move command, stale gather/build/attack cleared
 *     6. Unit + own completed building -> move near, no build/attack
 *
 *   Command-card state:
 *     7. Worker card shows Farm/Barracks/Tower build buttons; disabled with reason when broke
 *     8. Unfinished building shows Cancel; click releases footprint + clears builder
 *     9. Barracks at supply cap -> Footman disabled with 人口 reason
 *    10. Tower HUD shows readable weapon stats (attackDamage or range or cooldown)
 *
 * Proof rules:
 *   - Setup may spawn entities directly.
 *   - Behavior under test MUST use live-like paths:
 *     handleRightClick(), command-card button click, KeyboardEvent, g.update().
 *   - No updateBuildProgress() or assignBuilderToConstruction() as tested path.
 *   - No "canvas exists / no console error" smoke assertions.
 *   - 3D click targets use the clickFound raycast scan pattern from m4 spec.
 */
import { test, expect, type Page } from '@playwright/test'

const BASE = 'http://127.0.0.1:4173/?runtimeTest=1'

// ==================== Helpers ====================

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
    // Procedural fallback
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

/**
 * Scan NDC offsets around a projected position until raycaster's first
 * hit resolves to the target unit. Returns true and leaves mouseNDC set.
 * Uses the same parent-chain resolution as Game.ts findUnitByObject.
 */
async function clickUnitViaRaycast(page: Page, targetIdx: number): Promise<boolean> {
  return page.evaluate((tIdx) => {
    const g = (window as any).__war3Game
    const target = g.units[tIdx]
    if (!target) return false

    g.camera.updateMatrixWorld(true)
    g.scene.updateMatrixWorld(true)

    const allMeshes = g.units.map((u: any) => u.mesh)
    const resolveUnit = (hitObj: any) => {
      let obj = hitObj
      while (obj) {
        const found = g.units.find((u: any) => u.mesh === obj)
        if (found) return found
        obj = obj.parent
      }
      return null
    }

    for (const yOff of [0.25, 0.5, 0.85, 1.2, 1.6]) {
      const probe = target.mesh.position.clone()
      probe.y += yOff
      probe.project(g.camera)
      for (const dx of [0, -0.02, 0.02, -0.04, 0.04, -0.08, 0.08]) {
        for (const dy of [0, -0.02, 0.02, -0.04, 0.04, -0.08, 0.08]) {
          g.mouseNDC.set(probe.x + dx, probe.y + dy)
          g.raycaster.setFromCamera(g.mouseNDC, g.camera)
          const hits = g.raycaster.intersectObjects(allMeshes, true)
          const first = hits.length > 0 ? resolveUnit(hits[0].object) : null
          if (first === target) {
            g.shiftHeld = false
            return true
          }
        }
      }
    }
    return false
  }, targetIdx)
}

/**
 * Find ground NDC that doesn't hit any unit or tree. Returns true if found.
 */
async function findGroundNDC(page: Page): Promise<boolean> {
  return page.evaluate(() => {
    const g = (window as any).__war3Game
    const allMeshes = g.units.map((u: any) => u.mesh)
    for (const [nx, ny] of [[0.0, -0.3], [0.1, -0.2], [-0.1, -0.4], [0.2, -0.1], [-0.2, -0.3]]) {
      g.mouseNDC.set(nx, ny)
      g.raycaster.setFromCamera(g.mouseNDC, g.camera)
      const hits = g.raycaster.intersectObjects(allMeshes, true)
      if (hits.length === 0) {
        const groundHits = g.raycaster.intersectObject(g.terrain.groundPlane)
        if (groundHits.length > 0) {
          const pt = groundHits[0].point
          const tree = g.treeManager.findNearest(pt, 2)
          if (!tree) return true
        }
      }
    }
    return false
  })
}

// ==================== Test Suite ====================

test.describe('Command Surface Regression Matrix', () => {
  test.setTimeout(120000)

  // ============================================================
  // R1: Worker + unfinished own building -> resume construction
  // ============================================================
  test('right-click: worker on unfinished own building resumes construction via game loop', async ({ page }) => {
    await waitForGame(page)

    const result = await page.evaluate(async () => {
      const g = (window as any).__war3Game
      if (!g) return { ok: false, reason: 'no game' }

      const worker = g.spawnUnit('worker', 0, 15, 14)
      worker.state = 0 // Idle
      worker.moveTarget = null

      const farm = g.spawnBuilding('farm', 0, 17, 14)
      farm.buildProgress = 0.3
      farm.builder = null

      // Select worker
      g.selectionModel.clear()
      g.clearSelectionRings()
      g.selectionModel.setSelection([worker])
      g.createSelectionRing(worker)

      // Find clickable point on farm
      g.camera.updateMatrixWorld(true)
      g.scene.updateMatrixWorld(true)
      g.shiftHeld = false
      const allMeshes = g.units.map((u: any) => u.mesh)
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
      for (const yOff of [0.25, 0.5, 0.85, 1.2, 1.6]) {
        const probe = farm.mesh.position.clone()
        probe.y += yOff
        probe.project(g.camera)
        for (const dx of [0, -0.02, 0.02, -0.04, 0.04, -0.08, 0.08]) {
          for (const dy of [0, -0.02, 0.02, -0.04, 0.04, -0.08, 0.08]) {
            g.mouseNDC.set(probe.x + dx, probe.y + dy)
            g.raycaster.setFromCamera(g.mouseNDC, g.camera)
            const hits = g.raycaster.intersectObjects(allMeshes, true)
            const first = hits.length > 0 ? resolveUnit(hits[0].object) : null
            if (first === farm) { clickFound = true; break }
          }
          if (clickFound) break
        }
        if (clickFound) break
      }

      if (clickFound) g.handleRightClick()

      const progressAtResume = farm.buildProgress

      // Advance via real game loop
      let progressIncreased = false
      for (let i = 0; i < 500; i++) {
        g.update(0.016)
        if (farm.buildProgress > progressAtResume) {
          progressIncreased = true
          break
        }
      }

      return {
        ok: true,
        clickFound,
        progressAtResume,
        progressIncreased,
        workerState: worker.state,
        workerBuildTarget: worker.buildTarget ? g.units.indexOf(worker.buildTarget) : -1,
        farmBuilder: farm.builder ? g.units.indexOf(farm.builder) : -1,
        workerIdx: g.units.indexOf(worker),
        farmIdx: g.units.indexOf(farm),
      }
    })

    expect(result.ok).toBe(true)
    expect(result.clickFound, 'must find clickable farm point via raycaster').toBe(true)
    expect(result.workerBuildTarget, 'worker buildTarget should point to farm').toBe(result.farmIdx)
    expect(result.farmBuilder, 'farm builder should be worker').toBe(result.workerIdx)
    expect(result.progressIncreased, 'build progress must increase through g.update() loop').toBe(true)
    expect(
      [5, 6].includes(result.workerState),
      `worker should be MovingToBuild(5) or Building(6), got ${result.workerState}`,
    ).toBe(true)
    expect(severeConsoleErrors(page)).toHaveLength(0)
  })

  // ============================================================
  // R2: Worker + goldmine -> gather command, resourceTarget set
  // ============================================================
  test('right-click: worker on goldmine issues gather command with resourceTarget', async ({ page }) => {
    await waitForGame(page)

    const result = await page.evaluate(async () => {
      const g = (window as any).__war3Game
      if (!g) return { ok: false, reason: 'no game' }

      const mine = g.units.find((u: any) => u.type === 'goldmine' && u.hp > 0)
      if (!mine) return { ok: false, reason: 'no goldmine' }

      const worker = g.spawnUnit('worker', 0, 13, 10)
      worker.state = 0
      worker.moveTarget = null

      g.selectionModel.clear()
      g.clearSelectionRings()
      g.selectionModel.setSelection([worker])
      g.createSelectionRing(worker)

      const mineIdx = g.units.indexOf(mine)

      // Find clickable point on mine
      g.camera.updateMatrixWorld(true)
      g.scene.updateMatrixWorld(true)
      g.shiftHeld = false
      const allMeshes = g.units.map((u: any) => u.mesh)
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
      for (const yOff of [0.5, 1.0, 1.5, 2.0, 2.5]) {
        const probe = mine.mesh.position.clone()
        probe.y += yOff
        probe.project(g.camera)
        for (const dx of [0, -0.02, 0.02, -0.04, 0.04, -0.08, 0.08]) {
          for (const dy of [0, -0.02, 0.02, -0.04, 0.04, -0.08, 0.08]) {
            g.mouseNDC.set(probe.x + dx, probe.y + dy)
            g.raycaster.setFromCamera(g.mouseNDC, g.camera)
            const hits = g.raycaster.intersectObjects(allMeshes, true)
            const first = hits.length > 0 ? resolveUnit(hits[0].object) : null
            if (first === mine) { clickFound = true; break }
          }
          if (clickFound) break
        }
        if (clickFound) break
      }

      if (clickFound) g.handleRightClick()

      return {
        ok: true,
        clickFound,
        mineIdx,
        workerState: worker.state,
        workerGatherType: worker.gatherType,
        workerResourceTargetType: worker.resourceTarget?.type ?? null,
        workerResourceTargetMineIdx: worker.resourceTarget?.mine ? g.units.indexOf(worker.resourceTarget.mine) : -1,
      }
    })

    expect(result.ok).toBe(true)
    expect(result.clickFound, 'must find clickable goldmine point').toBe(true)
    expect(result.workerGatherType, 'worker should have gatherType gold').toBe('gold')
    expect(result.workerResourceTargetType, 'worker resourceTarget type should be goldmine').toBe('goldmine')
    expect(result.workerResourceTargetMineIdx, 'worker resourceTarget should point to the clicked mine').toBe(result.mineIdx)
    expect(severeConsoleErrors(page)).toHaveLength(0)
  })

  // ============================================================
  // R3: Non-worker + goldmine -> move near mine, no gather
  // ============================================================
  test('right-click: footman on goldmine issues move, not gather', async ({ page }) => {
    await waitForGame(page)

    const result = await page.evaluate(async () => {
      const g = (window as any).__war3Game
      if (!g) return { ok: false, reason: 'no game' }

      const mine = g.units.find((u: any) => u.type === 'goldmine' && u.hp > 0)
      if (!mine) return { ok: false, reason: 'no goldmine' }

      const footman = g.spawnUnit('footman', 0, 13, 10)
      footman.state = 0
      footman.moveTarget = null

      g.selectionModel.clear()
      g.clearSelectionRings()
      g.selectionModel.setSelection([footman])
      g.createSelectionRing(footman)

      g.camera.updateMatrixWorld(true)
      g.scene.updateMatrixWorld(true)
      g.shiftHeld = false
      const allMeshes = g.units.map((u: any) => u.mesh)
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
      for (const yOff of [0.5, 1.0, 1.5, 2.0, 2.5]) {
        const probe = mine.mesh.position.clone()
        probe.y += yOff
        probe.project(g.camera)
        for (const dx of [0, -0.02, 0.02, -0.04, 0.04, -0.08, 0.08]) {
          for (const dy of [0, -0.02, 0.02, -0.04, 0.04, -0.08, 0.08]) {
            g.mouseNDC.set(probe.x + dx, probe.y + dy)
            g.raycaster.setFromCamera(g.mouseNDC, g.camera)
            const hits = g.raycaster.intersectObjects(allMeshes, true)
            const first = hits.length > 0 ? resolveUnit(hits[0].object) : null
            if (first === mine) { clickFound = true; break }
          }
          if (clickFound) break
        }
        if (clickFound) break
      }

      if (clickFound) g.handleRightClick()

      return {
        ok: true,
        clickFound,
        footmanState: footman.state,
        footmanGatherType: footman.gatherType,
        footmanHasResourceTarget: !!footman.resourceTarget,
        footmanHasMoveTarget: !!footman.moveTarget,
      }
    })

    expect(result.ok).toBe(true)
    expect(result.clickFound, 'must find clickable goldmine point').toBe(true)
    expect(result.footmanGatherType, 'footman should NOT have gatherType').toBeNull()
    expect(result.footmanHasResourceTarget, 'footman should NOT have resourceTarget').toBe(false)
    expect(result.footmanHasMoveTarget, 'footman should have moveTarget (move to mine)').toBe(true)
    expect(result.footmanState, 'footman should be Moving(1)').toBe(1)
    expect(severeConsoleErrors(page)).toHaveLength(0)
  })

  // ============================================================
  // R4: Combat unit + enemy -> attack command, attackTarget set
  // ============================================================
  test('right-click: footman on enemy issues attack command', async ({ page }) => {
    await waitForGame(page)

    const result = await page.evaluate(async () => {
      const g = (window as any).__war3Game
      if (!g) return { ok: false, reason: 'no game' }

      const footman = g.spawnUnit('footman', 0, 14, 14)
      footman.state = 0
      footman.moveTarget = null

      const enemy = g.spawnUnit('footman', 1, 16, 14)

      g.selectionModel.clear()
      g.clearSelectionRings()
      g.selectionModel.setSelection([footman])
      g.createSelectionRing(footman)

      const enemyIdx = g.units.indexOf(enemy)

      g.camera.updateMatrixWorld(true)
      g.scene.updateMatrixWorld(true)
      g.shiftHeld = false
      const allMeshes = g.units.map((u: any) => u.mesh)
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
      for (const yOff of [0.25, 0.5, 0.85, 1.2, 1.6]) {
        const probe = enemy.mesh.position.clone()
        probe.y += yOff
        probe.project(g.camera)
        for (const dx of [0, -0.02, 0.02, -0.04, 0.04, -0.08, 0.08]) {
          for (const dy of [0, -0.02, 0.02, -0.04, 0.04, -0.08, 0.08]) {
            g.mouseNDC.set(probe.x + dx, probe.y + dy)
            g.raycaster.setFromCamera(g.mouseNDC, g.camera)
            const hits = g.raycaster.intersectObjects(allMeshes, true)
            const first = hits.length > 0 ? resolveUnit(hits[0].object) : null
            if (first === enemy) { clickFound = true; break }
          }
          if (clickFound) break
        }
        if (clickFound) break
      }

      if (clickFound) g.handleRightClick()

      return {
        ok: true,
        clickFound,
        enemyIdx,
        footmanState: footman.state,
        footmanAttackTarget: footman.attackTarget ? g.units.indexOf(footman.attackTarget) : -1,
        footmanHasMoveTarget: !!footman.moveTarget,
      }
    })

    expect(result.ok).toBe(true)
    expect(result.clickFound, 'must find clickable enemy point').toBe(true)
    expect(result.footmanAttackTarget, 'footman attackTarget should point to enemy').toBe(result.enemyIdx)
    expect(
      [7, 1].includes(result.footmanState),
      `footman should be Attacking(7) or Moving toward enemy(1), got ${result.footmanState}`,
    ).toBe(true)
    expect(severeConsoleErrors(page)).toHaveLength(0)
  })

  // ============================================================
  // R5: Unit + ground -> move command, stale gather/build/attack cleared
  // ============================================================
  test('right-click: unit on ground clears stale gather/build/attack state', async ({ page }) => {
    await waitForGame(page)

    const result = await page.evaluate(async () => {
      const g = (window as any).__war3Game
      if (!g) return { ok: false, reason: 'no game' }

      const worker = g.spawnUnit('worker', 0, 14, 14)
      // Set stale gather state
      worker.state = 3 // Gathering
      worker.gatherType = 'gold'
      worker.carryAmount = 5
      const mine = g.units.find((u: any) => u.type === 'goldmine')
      worker.resourceTarget = mine ? { type: 'goldmine', mine } : { type: 'goldmine' }
      worker.moveTarget = null

      g.selectionModel.clear()
      g.clearSelectionRings()
      g.selectionModel.setSelection([worker])
      g.createSelectionRing(worker)

      // Find clean ground NDC
      g.camera.updateMatrixWorld(true)
      g.scene.updateMatrixWorld(true)
      g.shiftHeld = false
      const allMeshes = g.units.map((u: any) => u.mesh)

      let groundFound = false
      for (const [nx, ny] of [[0.0, -0.3], [0.1, -0.2], [-0.1, -0.4], [0.2, -0.1], [-0.2, -0.3]]) {
        g.mouseNDC.set(nx, ny)
        g.raycaster.setFromCamera(g.mouseNDC, g.camera)
        const unitHits = g.raycaster.intersectObjects(allMeshes, true)
        if (unitHits.length > 0) continue
        const groundHits = g.raycaster.intersectObject(g.terrain.groundPlane)
        if (groundHits.length > 0) {
          const pt = groundHits[0].point
          const tree = g.treeManager.findNearest(pt, 2)
          if (!tree) { groundFound = true; break }
        }
      }

      if (groundFound) g.handleRightClick()

      return {
        ok: true,
        groundFound,
        workerState: worker.state,
        workerGatherType: worker.gatherType,
        workerCarryAmount: worker.carryAmount,
        workerHasResourceTarget: !!worker.resourceTarget,
        workerHasMoveTarget: !!worker.moveTarget,
      }
    })

    expect(result.ok).toBe(true)
    expect(result.groundFound, 'must find clear ground NDC point').toBe(true)
    expect(result.workerState, 'worker should be Moving(1)').toBe(1)
    expect(result.workerGatherType, 'gatherType should be cleared').toBeNull()
    expect(result.workerCarryAmount, 'carryAmount should be cleared').toBe(0)
    expect(result.workerHasResourceTarget, 'resourceTarget should be cleared').toBe(false)
    expect(result.workerHasMoveTarget, 'worker should have moveTarget').toBe(true)
    expect(severeConsoleErrors(page)).toHaveLength(0)
  })

  // ============================================================
  // R6: Unit + own completed building -> move near, no build/attack
  // ============================================================
  test('right-click: unit on own completed building moves near without triggering build/attack', async ({ page }) => {
    await waitForGame(page)

    const result = await page.evaluate(async () => {
      const g = (window as any).__war3Game
      if (!g) return { ok: false, reason: 'no game' }

      // Use completed barracks (exists from game start)
      const barracks = g.units.find(
        (u: any) => u.team === 0 && u.type === 'barracks' && u.isBuilding && u.buildProgress >= 1,
      )
      if (!barracks) return { ok: false, reason: 'no completed barracks' }

      const footman = g.spawnUnit('footman', 0, 8, 14)
      footman.state = 0
      footman.moveTarget = null
      footman.attackTarget = null

      g.selectionModel.clear()
      g.clearSelectionRings()
      g.selectionModel.setSelection([footman])
      g.createSelectionRing(footman)

      const bkIdx = g.units.indexOf(barracks)

      g.camera.updateMatrixWorld(true)
      g.scene.updateMatrixWorld(true)
      g.shiftHeld = false
      const allMeshes = g.units.map((u: any) => u.mesh)
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
      for (const yOff of [0.5, 1.0, 1.5, 2.0]) {
        const probe = barracks.mesh.position.clone()
        probe.y += yOff
        probe.project(g.camera)
        for (const dx of [0, -0.02, 0.02, -0.04, 0.04, -0.08, 0.08]) {
          for (const dy of [0, -0.02, 0.02, -0.04, 0.04, -0.08, 0.08]) {
            g.mouseNDC.set(probe.x + dx, probe.y + dy)
            g.raycaster.setFromCamera(g.mouseNDC, g.camera)
            const hits = g.raycaster.intersectObjects(allMeshes, true)
            const first = hits.length > 0 ? resolveUnit(hits[0].object) : null
            if (first === barracks) { clickFound = true; break }
          }
          if (clickFound) break
        }
        if (clickFound) break
      }

      if (clickFound) g.handleRightClick()

      return {
        ok: true,
        clickFound,
        bkIdx,
        footmanState: footman.state,
        footmanAttackTarget: footman.attackTarget ? g.units.indexOf(footman.attackTarget) : -1,
        footmanBuildTarget: footman.buildTarget ? g.units.indexOf(footman.buildTarget) : -1,
        footmanHasMoveTarget: !!footman.moveTarget,
      }
    })

    expect(result.ok).toBe(true)
    expect(result.clickFound, 'must find clickable barracks point').toBe(true)
    expect(result.footmanAttackTarget, 'footman should NOT attack own building').toBe(-1)
    expect(result.footmanBuildTarget, 'footman should NOT have buildTarget for completed building').toBe(-1)
    expect(result.footmanHasMoveTarget, 'footman should have moveTarget to building').toBe(true)
    expect(result.footmanState, 'footman should be Moving(1)').toBe(1)
    expect(severeConsoleErrors(page)).toHaveLength(0)
  })

  // ============================================================
  // C1: Worker card shows build buttons; disabled when broke
  // ============================================================
  test('command card: worker shows Farm/Barracks/Tower build buttons with resource gating', async ({ page }) => {
    await waitForGame(page)

    const result = await page.evaluate(() => {
      const g = (window as any).__war3Game
      if (!g) return { ok: false, reason: 'no game' }

      const worker = g.units.find((u: any) => u.team === 0 && u.type === 'worker' && u.hp > 0)
      if (!worker) return { ok: false, reason: 'no worker' }

      // --- Step 1: With resources, buttons should be enabled ---
      g.resources.earn(0, 500, 500)
      g.selectionModel.clear()
      g.clearSelectionRings()
      g.selectionModel.setSelection([worker])
      g.createSelectionRing(worker)
      g.updateHUD(0.016)

      const richButtons = Array.from(document.querySelectorAll('#command-card button'))
      const richData = richButtons.map((btn: any) => ({
        label: btn.querySelector('.btn-label')?.textContent?.trim() ?? '',
        disabled: btn.disabled,
        disabledReason: btn.dataset.disabledReason ?? '',
      }))

      const farmBtn = richData.find(b => b.label === '农场')
      const barracksBtn = richData.find(b => b.label === '兵营')
      const towerBtn = richData.find(b => b.label === '箭塔')

      // --- Step 2: With no resources, buttons should be disabled with reason ---
      g.resources.spend(0, { gold: g.resources.get(0).gold, lumber: g.resources.get(0).lumber })
      g.updateHUD(0.016)

      const poorButtons = Array.from(document.querySelectorAll('#command-card button'))
      const poorData = poorButtons.map((btn: any) => ({
        label: btn.querySelector('.btn-label')?.textContent?.trim() ?? '',
        disabled: btn.disabled,
        disabledReason: btn.dataset.disabledReason ?? '',
      }))

      const poorFarmBtn = poorData.find(b => b.label === '农场')

      return {
        ok: true,
        farmBtn: farmBtn ?? null,
        barracksBtn: barracksBtn ?? null,
        towerBtn: towerBtn ?? null,
        poorFarmBtn: poorFarmBtn ?? null,
      }
    })

    expect(result.ok).toBe(true)
    // Rich state: all build buttons exist and are enabled
    expect(result.farmBtn, 'farm button must exist').not.toBeNull()
    expect(result.barracksBtn, 'barracks button must exist').not.toBeNull()
    expect(result.towerBtn, 'tower button must exist').not.toBeNull()
    expect(result.farmBtn.disabled, 'farm should be enabled with resources').toBe(false)
    expect(result.barracksBtn.disabled, 'barracks should be enabled with resources').toBe(false)
    expect(result.towerBtn.disabled, 'tower should be enabled with resources').toBe(false)

    // Poor state: build button disabled with reason
    expect(result.poorFarmBtn, 'farm button must exist when poor').not.toBeNull()
    expect(result.poorFarmBtn.disabled, 'farm should be disabled with no resources').toBe(true)
    expect(
      result.poorFarmBtn.disabledReason.includes('黄金') || result.poorFarmBtn.disabledReason.includes('木材'),
      `disabled reason must mention resource, got: "${result.poorFarmBtn.disabledReason}"`,
    ).toBe(true)
    expect(severeConsoleErrors(page)).toHaveLength(0)
  })

  // ============================================================
  // C2: Unfinished building shows Cancel; click releases footprint
  // ============================================================
  test('command card: unfinished building cancel releases footprint and clears builder', async ({ page }) => {
    await waitForGame(page)

    const result = await page.evaluate(() => {
      const g = (window as any).__war3Game
      if (!g) return { ok: false, reason: 'no game' }

      g.resources.earn(0, 200, 100)

      const builder = g.spawnUnit('worker', 0, 22, 22)
      const farm = g.spawnBuilding('farm', 0, 24, 22)
      farm.buildProgress = 0.4
      farm.builder = builder
      builder.buildTarget = farm
      builder.state = 6 // Building

      // Select unfinished building
      g.selectionModel.clear()
      g.clearSelectionRings()
      g.selectionModel.setSelection([farm])
      g.createSelectionRing(farm)
      g.updateHUD(0.016)

      // Find and click cancel button
      const cancelBtn = Array.from(document.querySelectorAll('#command-card button'))
        .find((btn: any) => (btn.textContent ?? '').includes('取消')) as HTMLButtonElement | undefined

      const hadCancel = !!cancelBtn
      const canPlaceBefore = g.placementValidator.canPlace(24, 22, 2).ok

      if (cancelBtn) cancelBtn.click()
      g.updateHUD(0.016)

      const canPlaceAfter = g.placementValidator.canPlace(24, 22, 2).ok

      return {
        ok: true,
        hadCancel,
        canPlaceBefore,
        canPlaceAfter,
        farmStillExists: g.units.includes(farm),
        builderState: builder.state,
        builderBuildTarget: builder.buildTarget ? g.units.indexOf(builder.buildTarget) : -1,
      }
    })

    expect(result.ok).toBe(true)
    expect(result.hadCancel, 'cancel button must appear for unfinished building').toBe(true)
    expect(result.canPlaceBefore, 'footprint must be occupied before cancel').toBe(false)
    expect(result.farmStillExists, 'farm must be removed after cancel').toBe(false)
    expect(result.canPlaceAfter, 'footprint must be released after cancel').toBe(true)
    expect(result.builderState, 'builder must return to Idle(0)').toBe(0)
    expect(result.builderBuildTarget, 'builder buildTarget must be cleared').toBe(-1)
    expect(severeConsoleErrors(page)).toHaveLength(0)
  })

  // ============================================================
  // C3: Barracks at supply cap -> Footman disabled with 人口
  // ============================================================
  test('command card: barracks at supply cap shows disabled footman with 人口 reason', async ({ page }) => {
    await waitForGame(page)

    const result = await page.evaluate(() => {
      const g = (window as any).__war3Game
      if (!g) return { ok: false, reason: 'no game' }

      const barracks = g.units.find(
        (u: any) => u.team === 0 && u.type === 'barracks' && u.isBuilding && u.hp > 0 && u.buildProgress >= 1,
      )
      if (!barracks) return { ok: false, reason: 'no completed barracks' }

      // Fill supply to cap
      let spawned = 0
      while (true) {
        const sup = g.resources.computeSupply(0, g.units)
        if (sup.used >= sup.total) break
        g.spawnUnit('worker', 0, 25 + spawned, 25)
        spawned++
        if (spawned > 50) break
      }

      g.resources.earn(0, 500, 200)

      g.selectionModel.clear()
      g.clearSelectionRings()
      g.selectionModel.setSelection([barracks])
      g.createSelectionRing(barracks)
      g.updateHUD(0.016)

      const supply = g.resources.computeSupply(0, g.units)
      const buttons = Array.from(document.querySelectorAll('#command-card button'))
      const btnData = buttons.map((btn: any) => ({
        label: btn.querySelector('.btn-label')?.textContent?.trim() ?? btn.textContent?.trim() ?? '',
        disabled: btn.disabled,
        disabledReason: btn.dataset.disabledReason ?? '',
        title: btn.title ?? '',
      }))

      const footmanBtn = btnData.find(b => b.label.includes('步兵'))

      return {
        ok: true,
        supplyUsed: supply.used,
        supplyTotal: supply.total,
        footmanBtn: footmanBtn ?? null,
      }
    })

    expect(result.ok).toBe(true)
    expect(result.supplyUsed, 'supply must be at cap').toBeGreaterThanOrEqual(result.supplyTotal)
    expect(result.footmanBtn, 'footman button must exist in barracks card').not.toBeNull()
    expect(result.footmanBtn.disabled, 'footman must be disabled at supply cap').toBe(true)
    expect(
      result.footmanBtn.disabledReason.includes('人口') || result.footmanBtn.title.includes('人口'),
      `disabled reason must mention 人口, got: "${result.footmanBtn.disabledReason}" / "${result.footmanBtn.title}"`,
    ).toBe(true)
    expect(severeConsoleErrors(page)).toHaveLength(0)
  })

  // ============================================================
  // C4: Tower HUD shows readable weapon stats
  // If no weapon stats are displayed, this test FAILS and drives
  // a minimal Game.ts fix in updateSelectionHUD.
  // ============================================================
  test('command card: selected tower HUD shows readable weapon stats', async ({ page }) => {
    await waitForGame(page)

    const result = await page.evaluate(() => {
      const g = (window as any).__war3Game
      if (!g) return { ok: false, reason: 'no game' }

      const tower = g.spawnBuilding('tower', 0, 10, 8)
      tower.buildProgress = 1

      g.selectionModel.clear()
      g.clearSelectionRings()
      g.selectionModel.setSelection([tower])
      g.createSelectionRing(tower)
      g.updateHUD(0.016)

      const statsText = document.getElementById('unit-stats')?.textContent ?? ''
      const unitName = document.getElementById('unit-name')?.textContent ?? ''
      const hpText = document.getElementById('unit-hp-text')?.textContent ?? ''

      // Check for weapon stat patterns
      const hasAttackDamage = statsText.includes('⚔') || statsText.includes('攻击') || statsText.includes('伤害')
      const hasAttackRange = statsText.includes('射程') || statsText.includes('范围') || statsText.includes('距离')
      const hasAttackCooldown = statsText.includes('冷却') || statsText.includes('攻速') || statsText.includes('速度')

      return {
        ok: true,
        statsText,
        unitName,
        hpText,
        hasAttackDamage,
        hasAttackRange,
        hasAttackCooldown,
        hasAnyWeaponStat: hasAttackDamage || hasAttackRange || hasAttackCooldown,
      }
    })

    expect(result.ok).toBe(true)
    expect(result.unitName, 'tower name must be shown').toBeTruthy()
    expect(result.hpText, 'tower HP text must be shown').toBeTruthy()
    expect(result.hasAnyWeaponStat,
      `tower HUD must show at least one weapon stat (attack/range/cooldown). Got stats: "${result.statsText}"`,
    ).toBe(true)
    expect(severeConsoleErrors(page)).toHaveLength(0)
  })

  // ============================================================
  // R7: Crowded goldmine targetability
  // User complaint: "multiple workers mining, goldmine hard to click"
  //
  // Proof: 5 workers around a goldmine, right-click into the cluster
  // must resolve to goldmine (not worker) and issue gather.
  // Drives handleRightClick target priority fix.
  // ============================================================
  test('right-click: crowded goldmine resolves to goldmine, not to blocking worker', async ({ page }) => {
    await waitForGame(page)

    const result = await page.evaluate(async () => {
      const g = (window as any).__war3Game
      if (!g) return { ok: false, reason: 'no game' }

      // Find the existing goldmine or spawn one
      let mine = g.units.find((u: any) => u.type === 'goldmine' && u.hp > 0 && u.remainingGold > 0)
      if (!mine) {
        mine = g.spawnBuilding('goldmine', -1, 16, 8)
        mine.remainingGold = 10000
      }
      const mineIdx = g.units.indexOf(mine)
      const mx = mine.mesh.position.x
      const mz = mine.mesh.position.z

      // Spawn 5 workers tightly around the mine (simulating crowded mining)
      const offsets = [
        [1.2, 0], [-1.2, 0], [0, 1.2], [0, -1.2], [0.8, 0.8],
      ]
      for (const [ox, oz] of offsets) {
        const w = g.spawnUnit('worker', 0, mx + ox, mz + oz)
        // Put them in gathering state to simulate real mining crowd
        w.state = 3 // Gathering
        w.gatherType = 'gold'
        w.resourceTarget = { type: 'goldmine', mine }
      }

      // Spawn one more idle worker slightly further away, select it
      const idleWorker = g.spawnUnit('worker', 0, mx + 3, mz)
      idleWorker.state = 0
      idleWorker.moveTarget = null

      g.selectionModel.clear()
      g.clearSelectionRings()
      g.selectionModel.setSelection([idleWorker])
      g.createSelectionRing(idleWorker)

      // Right-click into the center of the goldmine (where workers are crowded)
      g.camera.updateMatrixWorld(true)
      g.scene.updateMatrixWorld(true)
      g.shiftHeld = false
      const allMeshes = g.units.map((u: any) => u.mesh)

      // Project mine center to screen, then right-click there
      const mineScreen = mine.mesh.position.clone()
      mineScreen.y += 1.5 // aim at mid-height of mine
      mineScreen.project(g.camera)

      let clickedMine = false
      // Try the mine projection point and offsets
      for (const dx of [0, -0.01, 0.01, -0.02, 0.02]) {
        for (const dy of [0, -0.01, 0.01, -0.02, 0.02]) {
          g.mouseNDC.set(mineScreen.x + dx, mineScreen.y + dy)
          g.raycaster.setFromCamera(g.mouseNDC, g.camera)
          // Don't check what we hit - just execute the click
          // The fix in handleRightClick should resolve goldmine from hit list
          g.handleRightClick()

          // Check if the command was gather (goldmine prioritized)
          if (idleWorker.gatherType === 'gold' && idleWorker.resourceTarget?.mine === mine) {
            clickedMine = true
            break
          }

          // Reset worker state for next attempt
          idleWorker.gatherType = null
          idleWorker.resourceTarget = null
          idleWorker.moveTarget = null
          idleWorker.state = 0
        }
        if (clickedMine) break
      }

      return {
        ok: true,
        clickedMine,
        mineIdx,
        idleWorkerGatherType: idleWorker.gatherType,
        idleWorkerResourceTargetType: idleWorker.resourceTarget?.type ?? null,
        idleWorkerResourceTargetMine: idleWorker.resourceTarget?.mine ? g.units.indexOf(idleWorker.resourceTarget.mine) : -1,
      }
    })

    expect(result.ok).toBe(true)
    expect(result.clickedMine,
      'right-clicking into crowded goldmine must resolve to goldmine gather, not move to worker',
    ).toBe(true)
    expect(result.idleWorkerGatherType, 'worker should have gatherType gold').toBe('gold')
    expect(result.idleWorkerResourceTargetType, 'worker resourceTarget type should be goldmine').toBe('goldmine')
    expect(result.idleWorkerResourceTargetMine, 'worker resourceTarget should point to the mine').toBe(result.mineIdx)
    expect(severeConsoleErrors(page)).toHaveLength(0)
  })
})
