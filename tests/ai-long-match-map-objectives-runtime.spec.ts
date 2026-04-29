/**
 * Long-match AI director and battlefield objective readability proof.
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

test.describe('AI long-match director and map objectives runtime', () => {
  test.setTimeout(120000)

  test('AI escalates into counterattack after defending and exposes director phase', async ({ page }) => {
    await waitForGame(page)

    const result = await page.evaluate(() => {
      const g = (window as any).__war3Game
      const ai = g.ai
      const aiTownHall = g.units.find((u: any) => u.team === 1 && u.type === 'townhall' && u.hp > 0)
      const playerTownHall = g.units.find((u: any) => u.team === 0 && u.type === 'townhall' && u.hp > 0)
      if (!ai || !aiTownHall || !playerTownHall) return { error: 'missing base runtime state' }

      const defenders = [
        g.spawnUnit('footman', 1, aiTownHall.mesh.position.x + 6, aiTownHall.mesh.position.z + 1),
        g.spawnUnit('rifleman', 1, aiTownHall.mesh.position.x + 7, aiTownHall.mesh.position.z + 1),
        g.spawnUnit('paladin', 1, aiTownHall.mesh.position.x + 8, aiTownHall.mesh.position.z + 1),
        g.spawnUnit('mountain_king', 1, aiTownHall.mesh.position.x + 9, aiTownHall.mesh.position.z + 1),
      ]
      const attacker = g.spawnUnit('footman', 0, aiTownHall.mesh.position.x + 2, aiTownHall.mesh.position.z + 1)
      aiTownHall.hp = Math.max(1, aiTownHall.maxHp - 80)

      ai.tickCount = 560
      ai.tickTimer = 0
      ai.waveCount = 3
      ai.attackWaveSize = 4
      ai.attackWaveSent = true
      ai.attackWaveSentTick = 520
      ai.update(1.1)
      const afterDefense = g.getAIPressureSnapshot()

      attacker.hp = 0
      aiTownHall.hp = aiTownHall.maxHp
      for (const unit of defenders) {
        unit.state = 0
        unit.attackMoveTarget = null
        unit.moveTarget = null
      }

      ai.tickCount = 600
      ai.tickTimer = 0
      ai.attackWaveSent = false
      ai.update(1.1)
      g.updateHUD(0.016)
      const afterCounter = g.getAIPressureSnapshot()
      const pressureText = document.getElementById('pressure-strip')?.textContent ?? ''

      return {
        afterDefense,
        afterCounter,
        pressureText,
        orders: defenders.map((unit: any) => ({
          hasAttackMoveTarget: !!unit.attackMoveTarget,
          targetDistanceToPlayerBase: unit.attackMoveTarget
            ? unit.attackMoveTarget.distanceTo(playerTownHall.mesh.position)
            : null,
        })),
      }
    })

    expect(result.error).toBeUndefined()
    expect(result.afterDefense.stage).toBe('defending')
    expect(result.afterDefense.directorPhase).toBe('assault')
    expect(result.afterCounter.stage).toBe('counterattacking')
    expect(result.afterCounter.counterAttackCount).toBeGreaterThanOrEqual(1)
    expect(result.afterCounter.waveCount).toBeGreaterThan(result.afterDefense.waveCount)
    expect(result.afterCounter.targetWaveSize).toBeGreaterThanOrEqual(5)
    expect(result.afterCounter.waveCooldownTicks).toBeLessThan(70)
    expect(result.pressureText).toContain('强攻')
    expect(result.orders.some((order: any) => order.hasAttackMoveTarget)).toBe(true)
    expect(result.afterCounter.lastCounterAttackTargetType).not.toBeNull()

    expect((page as any).__consoleErrors).toEqual([])
    expect((page as any).__pageErrors).toEqual([])
  })

  test('AI long-match tech path reaches Castle intent and Knight production', async ({ page }) => {
    await waitForGame(page)

    const result = await page.evaluate(() => {
      const g = (window as any).__war3Game
      const ai = g.ai
      const aiTownHall = g.units.find((u: any) => u.team === 1 && u.type === 'townhall' && u.hp > 0)
      if (!ai || !aiTownHall) return { error: 'missing ai townhall' }

      const baseX = aiTownHall.mesh.position.x
      const baseZ = aiTownHall.mesh.position.z
      const barracks = g.spawnBuilding('barracks', 1, baseX - 7, baseZ + 3)
      g.spawnBuilding('blacksmith', 1, baseX - 10, baseZ + 3)
      g.spawnBuilding('lumber_mill', 1, baseX - 13, baseZ + 3)
      for (let i = 0; i < 5; i++) g.spawnBuilding('farm', 1, baseX - 3 + i * 2, baseZ + 8)

      g.resources.earn(1, 5000, 5000)
      aiTownHall.type = 'keep'
      aiTownHall.upgradeQueue = null
      ai.waveCount = 4
      ai.tickCount = 720
      ai.tickTimer = 0
      ai.attackWaveSent = false
      ai.update(1.1)
      const castleUpgrade = aiTownHall.upgradeQueue ? { ...aiTownHall.upgradeQueue } : null

      aiTownHall.type = 'castle'
      aiTownHall.upgradeQueue = null
      barracks.trainingQueue.length = 0
      ai.tickCount = 760
      ai.tickTimer = 0
      ai.update(1.1)
      const barracksQueues = g.units
        .filter((u: any) => u.team === 1 && u.type === 'barracks')
        .map((u: any) => u.trainingQueue.map((item: any) => item.type))
      const snapshot = g.getAIPressureSnapshot()

      return { castleUpgrade, barracksQueues, snapshot }
    })

    expect(result.error).toBeUndefined()
    expect(result.castleUpgrade?.targetType).toBe('castle')
    expect(result.barracksQueues.flat()).toContain('knight')
    expect(result.snapshot.directorPhase).toBe('closing')
    expect(result.snapshot.targetWaveSize).toBeGreaterThanOrEqual(4)

    expect((page as any).__consoleErrors).toEqual([])
    expect((page as any).__pageErrors).toEqual([])
  })

  test('battlefield objective radar renders live map targets without blocking the playfield', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 })
    await waitForGame(page)

    const result = await page.evaluate(() => {
      const g = (window as any).__war3Game
      if (document.body.classList.contains('battlefield-focus-mode')) {
        ;(document.getElementById('battlefield-focus-toggle') as HTMLButtonElement | null)?.click()
      }
      g.updateHUD(0.016)
      const before = g.getMapObjectiveSnapshot()

      const playerTownHall = g.units.find((u: any) => u.team === 0 && u.type === 'townhall' && u.hp > 0)
      const shop = playerTownHall
        ? g.spawnBuilding('arcane_vault', 0, playerTownHall.mesh.position.x + 7, playerTownHall.mesh.position.z + 1)
        : null
      const creep = g.units.find((u: any) => u.team === 2 && u.hp > 0 && !u.isBuilding)
      if (creep) creep.hp = 0
      g.update(0.016)
      g.updateHUD(0.016)
      const after = g.getMapObjectiveSnapshot()

      const panel = document.getElementById('map-objective-radar') as HTMLElement
      const objectivePanel = document.getElementById('objective-tracker') as HTMLElement
      const bottomHud = document.getElementById('hud-bottom') as HTMLElement
      const minimap = document.getElementById('minimap-canvas') as HTMLCanvasElement
      const rect = panel.getBoundingClientRect()
      const objectiveRect = objectivePanel.getBoundingClientRect()
      const bottomRect = bottomHud.getBoundingClientRect()
      const minimapPixels = minimap
        .getContext('2d')!
        .getImageData(0, 0, minimap.width, minimap.height)
        .data
      let litPixels = 0
      for (let i = 0; i < minimapPixels.length; i += 4) {
        if (minimapPixels[i] + minimapPixels[i + 1] + minimapPixels[i + 2] > 120) litPixels++
      }

      return {
        before,
        after,
        shopType: shop?.type ?? null,
        domRows: Array.from(document.querySelectorAll('#map-objective-list .map-objective-item')).map((item: any) => ({
          key: item.dataset.key,
          tone: item.dataset.tone,
          text: item.textContent,
          width: (item.querySelector('.map-objective-rail-fill') as HTMLElement | null)?.style.width ?? '',
        })),
        geometry: {
          panel: { left: rect.left, top: rect.top, right: rect.right, bottom: rect.bottom, width: rect.width, height: rect.height },
          objectivePanel: { left: objectiveRect.left, top: objectiveRect.top, right: objectiveRect.right, bottom: objectiveRect.bottom },
          bottomTop: bottomRect.top,
          viewportW: window.innerWidth,
          viewportH: window.innerHeight,
        },
        litPixels,
      }
    })
    const screenshot = await page.screenshot({ fullPage: false })

    expect(result.before.map((objective: any) => objective.key)).toEqual([
      'playerBase',
      'goldline',
      'treeLine',
      'creepCamp',
      'playerShop',
      'enemyBase',
    ])
    expect(result.after.find((objective: any) => objective.key === 'playerShop')?.status).toContain('已建成')
    expect(result.after.find((objective: any) => objective.key === 'creepCamp')?.status).toMatch(/可练级|已清空/)
    expect(result.domRows.length).toBe(6)
    expect(result.domRows.every((row: any) => row.width.endsWith('%'))).toBe(true)
    expect(result.geometry.panel.left).toBeGreaterThanOrEqual(0)
    expect(result.geometry.panel.right).toBeLessThan(result.geometry.objectivePanel.left)
    expect(result.geometry.panel.bottom).toBeLessThan(result.geometry.bottomTop)
    expect(result.litPixels).toBeGreaterThan(100)
    expect(screenshot.length).toBeGreaterThan(5000)

    expect((page as any).__consoleErrors).toEqual([])
    expect((page as any).__pageErrors).toEqual([])
  })
})
