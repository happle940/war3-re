/**
 * AI pressure and objective-feedback runtime proof.
 *
 * Covers the short-match pressure curve milestone: AI goal state, creep/shop
 * understanding, wave cadence, objective-panel sync, and result summary reuse.
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

test.describe('AI pressure and objective feedback runtime', () => {
  test.setTimeout(120000)

  test('AI understands shop, creep objective, wave cadence, and pressure summary', async ({ page }) => {
    await waitForGame(page)

    const result = await page.evaluate(() => {
      const g = (window as any).__war3Game
      const ai = g.ai
      const aiTownHall = g.units.find((u: any) => u.team === 1 && u.type === 'townhall' && u.hp > 0)
      const playerTownHall = g.units.find((u: any) => u.team === 0 && u.type === 'townhall' && u.hp > 0)
      if (!ai || !aiTownHall || !playerTownHall) return { error: 'missing base runtime state' }

      const hero = g.spawnUnit('paladin', 1, aiTownHall.mesh.position.x + 3, aiTownHall.mesh.position.z + 3)
      g.spawnUnit('footman', 1, hero.mesh.position.x + 1, hero.mesh.position.z)
      g.spawnUnit('footman', 1, hero.mesh.position.x + 2, hero.mesh.position.z)
      g.spawnBuilding('arcane_vault', 1, hero.mesh.position.x + 0.5, hero.mesh.position.z + 0.5)
      g.resources.earn(1, 2000, 2000)

      ai.tickCount = 194
      ai.tickTimer = 0
      ai.waveCount = 0
      ai.attackWaveSent = false
      ai.creepIntentSent = false
      ai.update(1.1)
      g.updateHUD(0.016)
      const afterCreepShop = g.getAIPressureSnapshot()
      const heroInventoryAfterShop = [...(hero.inventoryItems ?? [])]
      const pressureDomAfterCreep = {
        stage: document.getElementById('pressure-stage')?.textContent ?? '',
        wave: document.getElementById('pressure-wave')?.textContent ?? '',
        next: document.getElementById('pressure-next')?.textContent ?? '',
        meterWidth: (document.getElementById('pressure-meter-fill') as HTMLElement | null)?.style.width ?? '',
      }

      ai.tickCount = 300
      ai.tickTimer = 0
      ai.attackWaveSent = false
      ai.update(1.1)
      g.updateHUD(0.016)
      const afterWave = g.getAIPressureSnapshot()
      const pressureDomAfterWave = {
        stage: document.getElementById('pressure-stage')?.textContent ?? '',
        wave: document.getElementById('pressure-wave')?.textContent ?? '',
        next: document.getElementById('pressure-next')?.textContent ?? '',
      }

      aiTownHall.hp = 0
      g.update(0.016)
      const summary = document.getElementById('results-shell-summary')?.textContent ?? ''

      return {
        afterCreepShop,
        afterWave,
        heroInventoryAfterShop,
        pressureDomAfterCreep,
        pressureDomAfterWave,
        summary,
        result: g.getMatchResult(),
      }
    })

    expect(result.error).toBeUndefined()
    expect(result.afterCreepShop.shopPurchases).toBeGreaterThanOrEqual(1)
    expect(result.afterCreepShop.creepCampAttempts).toBeGreaterThanOrEqual(1)
    expect(result.heroInventoryAfterShop).toContain('boots_of_speed')
    expect(result.pressureDomAfterCreep.stage).toContain('AI')
    expect(result.pressureDomAfterCreep.meterWidth).not.toBe('0%')
    expect(result.afterWave.waveCount).toBeGreaterThanOrEqual(1)
    expect(result.afterWave.firstWaveAt).not.toBeNull()
    expect(result.afterWave.peakPressure).toBeGreaterThan(0)
    expect(result.pressureDomAfterWave.wave).toContain('波次')
    expect(result.result).toBe('victory')
    expect(result.summary).toContain('AI 压力')
    expect(result.summary).toContain('波次:')
    expect(result.summary).toContain('峰值:')

    expect((page as any).__consoleErrors).toEqual([])
    expect((page as any).__pageErrors).toEqual([])
  })

  test('objective panel renders icon, progress rail, completion pulse, and pressure strip', async ({ page }) => {
    await waitForGame(page)

    const result = await page.evaluate(() => {
      const g = (window as any).__war3Game
      if (document.body.classList.contains('battlefield-focus-mode')) {
        ;(document.getElementById('battlefield-focus-toggle') as HTMLButtonElement | null)?.click()
      }
      g.updateHUD(0.016)

      const initialItems = Array.from(document.querySelectorAll('#objective-list .objective-item')).map((item: any) => ({
        key: item.dataset.key,
        tone: item.dataset.tone,
        complete: item.dataset.complete,
        aria: item.getAttribute('aria-label'),
        hasIcon: !!item.querySelector('.objective-icon'),
        hasRail: !!item.querySelector('.objective-rail-fill'),
        width: (item.querySelector('.objective-rail-fill') as HTMLElement | null)?.style.width ?? '',
      }))

      g.spawnUnit('footman', 0, 24, 22)
      g.spawnUnit('rifleman', 0, 25, 22)
      g.spawnUnit('paladin', 0, 27, 28)
      g.updateHUD(0.016)

      const updatedItems = Array.from(document.querySelectorAll('#objective-list .objective-item')).map((item: any) => ({
        key: item.dataset.key,
        complete: item.dataset.complete,
        className: item.className,
        text: item.textContent,
      }))

      const panel = document.getElementById('objective-tracker') as HTMLElement
      const pressure = document.getElementById('pressure-strip') as HTMLElement
      const rect = panel.getBoundingClientRect()
      const pressureRect = pressure.getBoundingClientRect()
      return {
        initialItems,
        updatedItems,
        pressureText: pressure.textContent ?? '',
        panelRect: {
          top: rect.top,
          right: window.innerWidth - rect.right,
          width: rect.width,
          height: rect.height,
          viewportW: window.innerWidth,
          viewportH: window.innerHeight,
        },
        pressureHeight: pressureRect.height,
      }
    })

    expect(result.initialItems.length).toBe(7)
    expect(result.initialItems.every((item: any) => item.hasIcon && item.hasRail)).toBe(true)
    expect(result.initialItems.every((item: any) => typeof item.aria === 'string' && item.aria.length > 0)).toBe(true)
    expect(result.initialItems.map((item: any) => item.tone)).toEqual([
      'economy',
      'build',
      'army',
      'hero',
      'map',
      'shop',
      'attack',
    ])
    expect(result.updatedItems.some((item: any) => item.className.includes('objective-item--new'))).toBe(true)
    expect(result.updatedItems.some((item: any) => item.key === 'army' && item.complete === 'true')).toBe(true)
    expect(result.pressureText).toContain('AI')
    expect(result.pressureText).toContain('波次')
    expect(result.panelRect.top).toBeGreaterThanOrEqual(40)
    expect(result.panelRect.right).toBeGreaterThanOrEqual(0)
    expect(result.panelRect.width).toBeLessThanOrEqual(310)
    expect(result.panelRect.height).toBeLessThan(result.panelRect.viewportH * 0.48)
    expect(result.pressureHeight).toBeGreaterThan(20)

    expect((page as any).__consoleErrors).toEqual([])
    expect((page as any).__pageErrors).toEqual([])
  })

  test('objective and pressure overlay remains readable in a desktop screenshot', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 })
    await waitForGame(page)

    const geometry = await page.evaluate(() => {
      const g = (window as any).__war3Game
      if (document.body.classList.contains('battlefield-focus-mode')) {
        ;(document.getElementById('battlefield-focus-toggle') as HTMLButtonElement | null)?.click()
      }
      g.updateHUD(0.016)
      const panel = document.getElementById('objective-tracker') as HTMLElement
      const topHud = document.getElementById('hud-top') as HTMLElement
      const bottomHud = document.getElementById('hud-bottom') as HTMLElement
      const panelRect = panel.getBoundingClientRect()
      const topRect = topHud.getBoundingClientRect()
      const bottomRect = bottomHud.getBoundingClientRect()
      return {
        panel: {
          left: panelRect.left,
          top: panelRect.top,
          right: panelRect.right,
          bottom: panelRect.bottom,
          width: panelRect.width,
          height: panelRect.height,
        },
        topBottom: topRect.bottom,
        bottomTop: bottomRect.top,
        itemCount: document.querySelectorAll('#objective-list .objective-item').length,
        pressureMeterWidth: (document.getElementById('pressure-meter-fill') as HTMLElement).style.width,
      }
    })
    const screenshot = await page.screenshot({ fullPage: false })

    expect(screenshot.length).toBeGreaterThan(5000)
    expect(geometry.itemCount).toBe(7)
    expect(geometry.panel.top).toBeGreaterThanOrEqual(geometry.topBottom)
    expect(geometry.panel.bottom).toBeLessThanOrEqual(geometry.bottomTop)
    expect(geometry.panel.right).toBeLessThanOrEqual(1280)
    expect(geometry.panel.left).toBeGreaterThanOrEqual(0)
    expect(geometry.pressureMeterWidth).toMatch(/%$/)

    expect((page as any).__consoleErrors).toEqual([])
    expect((page as any).__pageErrors).toEqual([])
  })
})
