/**
 * Complete-milestone proof for R10 short skirmish closure and R11 battlefield readability.
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

test.describe('Complete R10/R11 milestones runtime', () => {
  test.setTimeout(120000)

  test('R10 closes a full playable skirmish loop from opening to result and reload reset', async ({ page }) => {
    await waitForGame(page)

    const result = await page.evaluate(() => {
      const g = (window as any).__war3Game
      const ai = g.ai
      const playerTownHall = g.units.find((u: any) => u.team === 0 && u.type === 'townhall' && u.hp > 0)
      const aiTownHall = g.units.find((u: any) => u.team === 1 && u.type === 'townhall' && u.hp > 0)
      if (!ai || !playerTownHall || !aiTownHall) return { error: 'missing base runtime state' }

      g.updateHUD(0.016)
      const hero = g.spawnUnit('paladin', 0, playerTownHall.mesh.position.x + 4, playerTownHall.mesh.position.z + 5)
      g.spawnUnit('footman', 0, playerTownHall.mesh.position.x + 5, playerTownHall.mesh.position.z + 5)
      g.spawnUnit('rifleman', 0, playerTownHall.mesh.position.x + 6, playerTownHall.mesh.position.z + 5)

      const creep = g.units.find((u: any) => u.team === 2 && u.hp > 0 && !u.isBuilding)
      if (!creep) return { error: 'missing creep' }
      hero.mesh.position.set(creep.mesh.position.x, creep.mesh.position.y, creep.mesh.position.z)
      creep.hp = 1
      g.dealDamage(hero, creep)
      g.update(0.016)
      g.update(0.016)

      const shop = g.spawnBuilding(
        'arcane_vault',
        0,
        playerTownHall.mesh.position.x + 7,
        playerTownHall.mesh.position.z + 1,
      )
      hero.mesh.position.set(shop.mesh.position.x, shop.mesh.position.y, shop.mesh.position.z)
      g.resources.earn(0, 1000, 1000)
      const bought = g.purchaseShopItem(shop, 'healing_potion')

      g.spawnUnit('footman', 1, playerTownHall.mesh.position.x + 2, playerTownHall.mesh.position.z + 1)
      ai.tickCount = 560
      ai.tickTimer = 0
      ai.waveCount = 3
      ai.attackWaveSize = 4
      ai.attackWaveSent = true
      ai.attackWaveSentTick = 520
      ai.update(1.1)
      g.updateHUD(0.016)

      aiTownHall.hp = 0
      g.update(0.016)
      g.updateHUD(0.016)
      const closure = g.getSkirmishCompletionSnapshot()
      const resultPresentation = g.getResultPresentationSnapshot()
      const summary = document.getElementById('results-shell-summary')?.textContent ?? ''
      const resultVisualComplete = document.getElementById('results-visual-summary')?.getAttribute('data-complete') ?? ''
      const menuSummary = g.getLastSessionMenuSummary()
      const resultBeforeReload = g.getMatchResult()
      const reloaded = g.reloadCurrentMap()
      g.updateHUD(0.016)
      const afterReloadClosure = g.getSkirmishCompletionSnapshot()

      return {
        bought,
        closure,
        resultPresentation,
        summary,
        resultVisualComplete,
        menuSummary,
        resultBeforeReload,
        reloaded,
        afterReloadClosure,
      }
    })

    expect(result.error).toBeUndefined()
    expect(result.bought).toBe(true)
    expect(result.resultBeforeReload).toBe('victory')
    expect(result.closure.milestone).toBe('R10')
    for (const step of result.closure.steps) {
      expect(step.completed, `${step.key}: ${step.detail}`).toBe(true)
    }
    expect(result.closure.completed).toBe(true)
    expect(result.closure.completedCount).toBe(result.closure.totalCount)
    expect(result.closure.flowLine).toContain('经济启动')
    expect(result.closure.flowLine).toContain('AI 压力')
    expect(result.closure.flowLine).toContain('结果闭合')
    expect(result.summary).toContain('短局闭环 完整短局闭环')
    expect(result.summary).toContain('流程')
    expect(result.summary).toContain('可以重开复盘')
    expect(result.resultPresentation.completed).toBe(true)
    expect(result.resultPresentation.cardCount).toBeGreaterThanOrEqual(6)
    expect(result.resultPresentation.objectiveChipCount).toBeGreaterThanOrEqual(7)
    expect(result.resultPresentation.flowStepCount).toBeGreaterThanOrEqual(9)
    expect(result.resultVisualComplete).toBe('true')
    expect(result.menuSummary).toContain('闭环 完整')
    expect(result.reloaded).toBe(true)
    expect(result.afterReloadClosure.completed).toBe(false)
    expect(result.afterReloadClosure.steps.find((step: any) => step.key === 'result')?.completed).toBe(false)

    expect((page as any).__consoleErrors).toEqual([])
    expect((page as any).__pageErrors).toEqual([])
  })

  test('R11 presents the battlefield consistently in world view, HUD, and minimap', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 })
    await waitForGame(page)

    const result = await page.evaluate(() => {
      const g = (window as any).__war3Game
      if (document.body.classList.contains('battlefield-focus-mode')) {
        ;(document.getElementById('battlefield-focus-toggle') as HTMLButtonElement | null)?.click()
      }
      g.updateHUD(0.016)
      g.updateMinimap()

      const objectives = g.getMapObjectiveSnapshot()
      const readability = g.getBattlefieldReadabilitySnapshot()
      const beaconObjects: any[] = []
      g.scene.traverse((obj: any) => {
        if (typeof obj.name === 'string' && obj.name.startsWith('map-objective-beacon:')) {
          beaconObjects.push({
            name: obj.name,
            key: obj.userData?.mapObjectiveKey ?? null,
            status: obj.userData?.mapObjectiveStatus ?? null,
            visible: obj.visible,
          })
        }
      })

      const radar = document.getElementById('map-objective-radar') as HTMLElement
      const objectivePanel = document.getElementById('objective-tracker') as HTMLElement
      const bottomHud = document.getElementById('hud-bottom') as HTMLElement
      const radarRect = radar.getBoundingClientRect()
      const objectiveRect = objectivePanel.getBoundingClientRect()
      const bottomRect = bottomHud.getBoundingClientRect()
      const minimap = document.getElementById('minimap-canvas') as HTMLCanvasElement
      const pixels = minimap.getContext('2d')!.getImageData(0, 0, minimap.width, minimap.height).data
      let markerPixels = 0
      for (let i = 0; i < pixels.length; i += 4) {
        if (pixels[i] + pixels[i + 1] + pixels[i + 2] > 120) markerPixels++
      }

      return {
        objectives,
        readability,
        beaconObjects,
        domText: radar.textContent ?? '',
        geometry: {
          radar: { left: radarRect.left, top: radarRect.top, right: radarRect.right, bottom: radarRect.bottom },
          objective: { left: objectiveRect.left, top: objectiveRect.top, right: objectiveRect.right, bottom: objectiveRect.bottom },
          bottomTop: bottomRect.top,
          viewportW: window.innerWidth,
          viewportH: window.innerHeight,
        },
        markerPixels,
      }
    })
    const screenshot = await page.screenshot({ fullPage: false })

    expect(result.objectives.map((objective: any) => objective.key)).toEqual([
      'playerBase',
      'goldline',
      'treeLine',
      'creepCamp',
      'playerShop',
      'enemyBase',
    ])
    expect(result.objectives.every((objective: any) => objective.targetX !== null && objective.targetZ !== null)).toBe(true)
    expect(result.domText).toContain('金矿线')
    expect(result.domText).toContain('树线')
    expect(result.domText).toContain('敌方基地')
    expect(result.readability.milestone).toBe('R11')
    expect(result.readability.completed).toBe(true)
    expect(result.readability.completedCount).toBe(result.readability.totalCount)
    expect(result.beaconObjects.filter((obj: any) => obj.visible && obj.key).length).toBeGreaterThanOrEqual(6)
    expect(result.markerPixels).toBeGreaterThan(100)
    expect(result.geometry.radar.left).toBeGreaterThanOrEqual(0)
    expect(result.geometry.radar.right).toBeLessThan(result.geometry.objective.left)
    expect(result.geometry.radar.bottom).toBeLessThan(result.geometry.bottomTop)
    expect(screenshot.length).toBeGreaterThan(5000)

    expect((page as any).__consoleErrors).toEqual([])
    expect((page as any).__pageErrors).toEqual([])
  })
})
