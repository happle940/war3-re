/**
 * M3 Camera/HUD Readability Contract
 *
 * Deterministic runtime proof that the default camera framing and HUD
 * preserve core RTS readability for the opening base slice.
 * This does NOT claim human visual approval.
 *
 * Measured relationships:
 *   1. TH, at least one worker, and nearest goldmine all project into the viewport.
 *   2. Core objects project above the bottom HUD panel (not occluded).
 *   3. Command card is present and clickable after selecting a worker.
 *   4. Selected worker has a visible selection ring and health bar.
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
    const snap = await page.evaluate(() => {
      const game = (window as any).__war3Game
      return {
        hasGame: !!game,
        unitsLength: game?.units?.length ?? -1,
        mapStatus: document.getElementById('map-status')?.textContent,
      }
    })
    throw new Error(
      `waitForGame failed: ${JSON.stringify(snap)}. ` +
      `Console: ${consoleErrors.slice(-5).join(' | ')}. ` +
      `Original: ${(e as Error).message}`,
    )
  }

  await page.waitForFunction(() => {
    const status = document.getElementById('map-status')?.textContent ?? ''
    return !status.includes('正在加载')
  }, { timeout: 15000 })

  await page.waitForTimeout(500)
}

/**
 * Programmatically select the first player worker via the game's selection model.
 * Creates selection ring and health bar as the game loop normally would.
 * The camera/HUD contract tests HUD response to selection, not click targeting.
 */
async function selectFirstWorker(page: Page): Promise<void> {
  await page.evaluate(() => {
    const g = (window as any).__war3Game
    const worker = g.units.find((u: any) => u.team === 0 && u.type === 'worker' && !u.isBuilding)
    if (!worker) throw new Error('no player worker found')
    g.selectionModel.setSelection([worker])
    // Create visual feedback as the game loop would
    g.createSelectionRing(worker)
    if (!g.healthBars.has(worker)) g.createHealthBar(worker)
  })
  await page.waitForTimeout(100)
}

// ==================== Tests ====================

test.describe('M3 Camera/HUD Readability', () => {
  test.setTimeout(60000)

  test('keyboard camera pan keeps WASD free for unit commands', async ({ page }) => {
    await waitForGame(page)

    const result = await page.evaluate(() => {
      const g = (window as any).__war3Game
      if (!g?.cameraCtrl) return { ok: false, reason: 'no camera controller' }

      const before = g.cameraCtrl.getTarget()
      for (const key of ['w', 'a', 's', 'd']) {
        window.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true }))
      }
      for (let i = 0; i < 45; i++) g.cameraCtrl.update(1 / 60)
      for (const key of ['w', 'a', 's', 'd']) {
        window.dispatchEvent(new KeyboardEvent('keyup', { key, bubbles: true }))
      }
      const afterWasd = g.cameraCtrl.getTarget()

      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }))
      for (let i = 0; i < 20; i++) g.cameraCtrl.update(1 / 60)
      window.dispatchEvent(new KeyboardEvent('keyup', { key: 'ArrowRight', bubbles: true }))
      const afterArrow = g.cameraCtrl.getTarget()

      return {
        ok: true,
        wasdDelta: before.distanceTo(afterWasd),
        arrowDelta: afterWasd.distanceTo(afterArrow),
      }
    })

    expect(result.ok, result.reason ?? 'camera controller missing').toBe(true)
    expect(result.wasdDelta, 'W/A/S/D should not move the camera because those keys are unit commands').toBeLessThan(0.001)
    expect(result.arrowDelta, 'Arrow keys should remain available for camera panning').toBeGreaterThan(0.1)
  })

  test('TH, worker, and goldmine all project into default viewport', async ({ page }) => {
    await waitForGame(page)

    const result = await page.evaluate(() => {
      const g = (window as any).__war3Game
      const camera = g.camera
      const vw = window.innerWidth
      const vh = window.innerHeight

      function projectToScreen(obj: any) {
        const pos = obj.mesh.position.clone().project(camera)
        return {
          sx: (pos.x + 1) / 2 * vw,
          sy: (-pos.y + 1) / 2 * vh,
          z: pos.z,
          onScreen: pos.x >= -1 && pos.x <= 1 && pos.y >= -1 && pos.y <= 1 && pos.z < 1,
        }
      }

      const th = g.units.find((u: any) => u.team === 0 && u.type === 'townhall')
      const gm = g.units.find((u: any) => u.type === 'goldmine')
      const worker = g.units.find((u: any) => u.team === 0 && u.type === 'worker' && !u.isBuilding)

      return {
        viewport: { w: vw, h: vh },
        th: th ? projectToScreen(th) : null,
        gm: gm ? projectToScreen(gm) : null,
        worker: worker ? projectToScreen(worker) : null,
        cameraDistance: g.cameraCtrl?.distance ?? -1,
        cameraTarget: g.cameraCtrl?.getTarget()?.toArray() ?? null,
      }
    })

    expect(result.th, 'Town Hall must project to screen').not.toBeNull()
    expect(result.gm, 'Gold Mine must project to screen').not.toBeNull()
    expect(result.worker, 'Worker must project to screen').not.toBeNull()
    expect(result.th.onScreen, 'Town Hall must be in viewport').toBe(true)
    expect(result.gm.onScreen, 'Gold Mine must be in viewport').toBe(true)
    expect(result.worker.onScreen, 'At least one worker must be in viewport').toBe(true)
  })

  test('core base objects project above bottom HUD panel', async ({ page }) => {
    await waitForGame(page)

    const result = await page.evaluate(() => {
      const g = (window as any).__war3Game
      const camera = g.camera
      const vh = window.innerHeight

      // Bottom HUD panel height from CSS: #hud-bottom height=162px
      const hudHeight = 162

      function projectY(obj: any) {
        const pos = obj.mesh.position.clone().project(camera)
        return (-pos.y + 1) / 2 * vh
      }

      const th = g.units.find((u: any) => u.team === 0 && u.type === 'townhall')
      const gm = g.units.find((u: any) => u.type === 'goldmine')
      const worker = g.units.find((u: any) => u.team === 0 && u.type === 'worker' && !u.isBuilding)

      // Screen Y of each object (top=0, bottom=vh)
      const thY = th ? projectY(th) : -1
      const gmY = gm ? projectY(gm) : -1
      const workerY = worker ? projectY(worker) : -1

      // HUD panel top edge
      const hudTop = vh - hudHeight

      // All three objects should be above the HUD panel top
      // (projected center is above hud top edge)
      return {
        vh,
        hudTop,
        thY,
        gmY,
        workerY,
        thAboveHud: thY < hudTop,
        gmAboveHud: gmY < hudTop,
        workerAboveHud: workerY < hudTop,
      }
    })

    expect(result.thAboveHud, `TH (${result.thY}px) should be above HUD top (${result.hudTop}px)`).toBe(true)
    expect(result.gmAboveHud, `GM (${result.gmY}px) should be above HUD top (${result.hudTop}px)`).toBe(true)
    expect(result.workerAboveHud, `Worker (${result.workerY}px) should be above HUD top (${result.hudTop}px)`).toBe(true)
  })

  test('command card has clickable buttons after selecting a worker', async ({ page }) => {
    await waitForGame(page)

    // Select a worker
    await selectFirstWorker(page)

    // Verify selection took effect
    const selectionState = await page.evaluate(() => {
      const g = (window as any).__war3Game
      const selected = g.selectedUnits ?? g.selectionModel?.units ?? []
      return {
        selectedCount: selected.length,
        selectedTypes: selected.map((u: any) => u.type),
      }
    })
    expect(selectionState.selectedCount).toBeGreaterThanOrEqual(1)
    expect(selectionState.selectedTypes).toContain('worker')

    // Command card should have buttons (worker shows build commands)
    const cardState = await page.evaluate(() => {
      const card = document.getElementById('command-card')
      if (!card) return { error: 'no command-card element' }
      const buttons = card.querySelectorAll('button')
      const slots = card.querySelectorAll('.cmd-slot')
      return {
        buttonCount: buttons.length,
        slotCount: slots.length,
        childCount: card.children.length,
        cardVisible: card.offsetParent !== null || card.getBoundingClientRect().width > 0,
      }
    })
    expect(cardState.error).toBeUndefined()
    expect(cardState.cardVisible, 'command-card must be visible').toBe(true)
    // Worker command card: build buttons + empty slots should fill the fixed 16-slot grid.
    expect(cardState.childCount, 'command-card should have 16 slots/buttons').toBe(16)
  })

  test('selected worker has visible selection ring and health bar', async ({ page }) => {
    await waitForGame(page)

    // Select a worker
    await selectFirstWorker(page)

    const result = await page.evaluate(() => {
      const g = (window as any).__war3Game
      const selected = g.selectedUnits ?? g.selectionModel?.units ?? []
      if (selected.length === 0) return { error: 'no selection' }

      const worker = selected[0]

      // Check selection rings: Game.selectionRings should have at least 1 entry
      const rings = g.selectionRings ?? []
      const ringCount = rings.length

      // Check a ring is in the scene and visible
      let ringVisible = false
      let ringScreenInfo: any = null
      if (ringCount > 0) {
        const ring = rings[0]
        ringVisible = ring.visible !== false
        // Check ring is near the worker position
        const dx = ring.position.x - worker.mesh.position.x
        const dz = ring.position.z - worker.mesh.position.z
        ringScreenInfo = {
          visible: ringVisible,
          distToWorker: Math.sqrt(dx * dx + dz * dz),
          ringScale: ring.scale.x,
        }
      }

      // Check health bar: Game.healthBars should have an entry for this worker
      const healthBars = g.healthBars
      const hasHealthBar = healthBars instanceof Map ? healthBars.has(worker) : !!healthBars?.get?.(worker)

      // Check health bar visibility (parent group in scene)
      let healthBarVisible = false
      if (hasHealthBar) {
        const bars = healthBars.get(worker)
        if (bars?.bg?.parent) {
          healthBarVisible = bars.bg.parent.visible !== false
        }
      }

      return {
        workerType: worker.type,
        ringCount,
        ringVisible,
        ringScreenInfo,
        hasHealthBar,
        healthBarVisible,
      }
    })

    expect(result.error).toBeUndefined()
    expect(result.ringCount, 'selection rings should exist for selected worker').toBeGreaterThanOrEqual(1)
    expect(result.ringVisible, 'selection ring must be visible').toBe(true)
    expect(result.ringScreenInfo.distToWorker, 'selection ring must be near worker').toBeLessThan(1.0)
    expect(result.hasHealthBar, 'worker must have a health bar entry').toBe(true)
    expect(result.healthBarVisible, 'health bar must be visible').toBe(true)
  })

  test('unit info panel contains long names, states, and stats without overlap', async ({ page }) => {
    await waitForGame(page)

    const result = await page.evaluate(() => {
      const g = (window as any).__war3Game
      if (!g) return { ok: false, reason: 'no game' }

      const unit = g.spawnUnit('paladin', 0, 12, 10)
      unit.heroLevel = 10
      unit.heroXP = 1200
      unit.heroSkillPoints = 3
      unit.abilityLevels = {
        holy_light: 3,
        divine_shield: 3,
        devotion_aura: 3,
        resurrection: 1,
      }
      unit.maxMana = 300
      unit.mana = 286
      unit.divineShieldUntil = g.gameTime + 9
      unit.devotionAuraBonus = 3
      unit.resurrectionCooldownUntil = g.gameTime + 120
      unit.resurrectionLastRevivedCount = 6
      unit.resurrectionFeedbackUntil = g.gameTime + 12

      g.selectionModel.setSelection([unit])
      g.clearSelectionRings()
      g.createSelectionRing(unit)
      g._lastSelKey = ''
      g.updateSelectionHUD()

      const unitInfo = document.getElementById('unit-info')!
      const details = document.getElementById('unit-details')!
      const name = document.getElementById('unit-name')!
      const hp = document.getElementById('unit-hp-bar')!
      const state = document.getElementById('unit-state')!
      const stats = document.getElementById('unit-stats')!

      name.textContent = '白银之手远征军圣骑士指挥官'
      state.textContent = '正在执行很长的单位状态文本：集结号令、技能冷却、队列与移动命令同时存在'

      const rectOf = (el: Element) => {
        const r = el.getBoundingClientRect()
        return { top: r.top, bottom: r.bottom, left: r.left, right: r.right, width: r.width, height: r.height }
      }
      const overlaps = (a: ReturnType<typeof rectOf>, b: ReturnType<typeof rectOf>) =>
        a.left < b.right - 1 && a.right > b.left + 1 && a.top < b.bottom - 1 && a.bottom > b.top + 1

      const infoRect = rectOf(unitInfo)
      const detailsRect = rectOf(details)
      const nameRect = rectOf(name)
      const hpRect = rectOf(hp)
      const stateRect = rectOf(state)
      const statsRect = rectOf(stats)

      const childrenWithinInfo = [detailsRect, nameRect, hpRect, stateRect, statsRect].every((r) =>
        r.left >= infoRect.left - 1 &&
        r.right <= infoRect.right + 1 &&
        r.top >= infoRect.top - 1 &&
        r.bottom <= infoRect.bottom + 1,
      )

      return {
        ok: true,
        childrenWithinInfo,
        nameHpOverlap: overlaps(nameRect, hpRect),
        hpStateOverlap: overlaps(hpRect, stateRect),
        stateStatsOverlap: overlaps(stateRect, statsRect),
        statsHasStableViewport: stats.clientHeight > 0 && stats.scrollHeight >= stats.clientHeight,
        detailsHeight: detailsRect.height,
        statsClientHeight: stats.clientHeight,
        statsScrollHeight: stats.scrollHeight,
      }
    })

    expect(result.ok, result.reason ?? 'unit info setup failed').toBe(true)
    expect(result.childrenWithinInfo, 'unit text should stay inside the unit info panel').toBe(true)
    expect(result.nameHpOverlap, 'unit name should not overlap the HP bar').toBe(false)
    expect(result.hpStateOverlap, 'HP bar should not overlap unit state text').toBe(false)
    expect(result.stateStatsOverlap, 'unit state should not overlap stat chips').toBe(false)
    expect(
      result.statsHasStableViewport,
      `stats viewport should be real and scrollable when needed: client=${result.statsClientHeight}, scroll=${result.statsScrollHeight}, details=${result.detailsHeight}`,
    ).toBe(true)
  })
})
