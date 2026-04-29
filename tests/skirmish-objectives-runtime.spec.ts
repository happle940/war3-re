/**
 * Short skirmish objective runtime proof.
 *
 * Verifies that the player-facing short-match objective tracker is derived
 * from real runtime state and that results/menu summaries reuse the same
 * telemetry instead of hardcoded prose.
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

test.describe('Short skirmish objectives runtime', () => {
  test.setTimeout(120000)

  test('HUD objective tracker reflects live skirmish progress', async ({ page }) => {
    await waitForGame(page)

    const result = await page.evaluate(() => {
      const g = (window as any).__war3Game
      g.updateHUD(0.016)

      const initialObjectives = g.getSkirmishObjectiveSnapshot()
      const initialDom = Array.from(document.querySelectorAll('#objective-list .objective-item')).map((item: any) => ({
        key: item.dataset.key,
        complete: item.dataset.complete,
        text: item.textContent,
      }))

      g.spawnUnit('footman', 0, 24, 22)
      g.spawnUnit('rifleman', 0, 25, 22)
      const hero = g.spawnUnit('paladin', 0, 27, 28)

      const creep = g.units.find((u: any) => u.team === 2 && u.type === 'forest_troll' && u.hp > 0)
      if (!creep) return { error: 'missing creep' }
      hero.mesh.position.set(creep.mesh.position.x, creep.mesh.position.y, creep.mesh.position.z)
      creep.hp = 1
      g.dealDamage(hero, creep)
      g.update(0.016)
      g.update(0.016)

      const shop = g.spawnBuilding('arcane_vault', 0, hero.mesh.position.x, hero.mesh.position.z)
      g.resources.earn(0, 1000, 1000)
      const bought = g.purchaseShopItem(shop, 'mana_potion')

      const aiTownHall = g.units.find((u: any) => u.team === 1 && u.type === 'townhall')
      if (!aiTownHall) return { error: 'missing ai townhall' }
      aiTownHall.hp = 0
      g.update(0.016)
      g.updateHUD(0.016)

      const finalObjectives = g.getSkirmishObjectiveSnapshot()
      const finalDom = Array.from(document.querySelectorAll('#objective-list .objective-item')).map((item: any) => ({
        key: item.dataset.key,
        complete: item.dataset.complete,
        text: item.textContent,
      }))
      const telemetry = g.getMatchTelemetry()

      return {
        initialObjectives,
        initialDom,
        finalObjectives,
        finalDom,
        telemetry,
        bought,
        matchResult: g.getMatchResult(),
      }
    })

    expect(result.error).toBeUndefined()
    expect(result.initialObjectives.length).toBe(7)
    expect(result.initialDom.length).toBe(7)
    expect(result.initialDom.some((item: any) => item.key === 'economy')).toBe(true)
    expect(result.bought).toBe(true)
    expect(result.matchResult).toBe('victory')
    expect(result.telemetry.neutralCreepsDefeated).toBeGreaterThanOrEqual(1)
    expect(result.telemetry.playerItemsPurchased).toBe(1)
    expect(result.telemetry.enemyBuildingsDestroyed).toBeGreaterThanOrEqual(1)
    expect(result.finalObjectives.every((objective: any) => objective.completed)).toBe(true)
    expect(result.finalDom.every((item: any) => item.complete === 'true')).toBe(true)
    expect(result.finalDom.map((item: any) => item.text).join(' ')).toContain('压制敌基')

    expect((page as any).__consoleErrors).toEqual([])
    expect((page as any).__pageErrors).toEqual([])
  })

  test('result and menu summaries reuse objective telemetry', async ({ page }) => {
    await waitForGame(page)

    const result = await page.evaluate(() => {
      const g = (window as any).__war3Game
      const hero = g.spawnUnit('paladin', 0, 27, 28)
      const creep = g.units.find((u: any) => u.team === 2 && u.hp > 0)
      if (!creep) return { error: 'missing creep' }
      hero.mesh.position.set(creep.mesh.position.x, creep.mesh.position.y, creep.mesh.position.z)
      creep.hp = 1
      g.dealDamage(hero, creep)
      g.update(0.016)
      g.update(0.016)

      const aiTownHall = g.units.find((u: any) => u.team === 1 && u.type === 'townhall')
      if (!aiTownHall) return { error: 'missing ai townhall' }
      aiTownHall.hp = 0
      g.update(0.016)

      const summary = (document.getElementById('results-shell-summary') as HTMLElement).textContent ?? ''
      const menuSummary = g.getLastSessionMenuSummary()
      return {
        summary,
        menuSummary,
        result: g.getMatchResult(),
      }
    })

    expect(result.error).toBeUndefined()
    expect(result.result).toBe('victory')
    expect(result.summary).toContain('时长')
    expect(result.summary).toContain('目标')
    expect(result.summary).toContain('我方 单位:')
    expect(result.summary).toContain('敌方 单位:')
    expect(result.summary).toContain('资源 金+')
    expect(result.summary).toContain('身份 野怪:')
    expect(result.menuSummary).toContain('上次结果：胜利')
    expect(result.menuSummary).toContain('目标')
    expect(result.menuSummary).toContain('野怪')

    expect((page as any).__consoleErrors).toEqual([])
    expect((page as any).__pageErrors).toEqual([])
  })

  test('reload resets objective telemetry for the next session', async ({ page }) => {
    await waitForGame(page)

    const result = await page.evaluate(() => {
      const g = (window as any).__war3Game
      const hero = g.spawnUnit('paladin', 0, 27, 28)
      const shop = g.spawnBuilding('arcane_vault', 0, hero.mesh.position.x, hero.mesh.position.z)
      g.resources.earn(0, 1000, 1000)
      const bought = g.purchaseShopItem(shop, 'healing_potion')
      const before = g.getMatchTelemetry()

      const reloaded = g.reloadCurrentMap()
      g.updateHUD(0.016)

      const after = g.getMatchTelemetry()
      const objectives = g.getSkirmishObjectiveSnapshot()
      const shopObjective = objectives.find((objective: any) => objective.key === 'shop')

      return {
        bought,
        before,
        reloaded,
        after,
        shopObjective,
        objectiveCount: objectives.length,
      }
    })

    expect(result.bought).toBe(true)
    expect(result.before.playerItemsPurchased).toBe(1)
    expect(result.reloaded).toBe(true)
    expect(result.after.playerItemsPurchased).toBe(0)
    expect(result.after.neutralCreepsDefeated).toBe(0)
    expect(result.after.enemyBuildingsDestroyed).toBe(0)
    expect(result.objectiveCount).toBe(7)
    expect(result.shopObjective.completed).toBe(false)

    expect((page as any).__consoleErrors).toEqual([])
    expect((page as any).__pageErrors).toEqual([])
  })
})
