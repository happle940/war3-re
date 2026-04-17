/**
 * V7 Workshop / Mortar Team combat model proof.
 *
 * Proves the V7 workshop slice is not just a renamed unit:
 * 1. Workshop and Mortar Team are wired through GameData.
 * 2. Workshop exposes a real train command and queues Mortar Team through the normal path.
 * 3. Mortar Team uses Siege attack data to trigger AOE splash with target filtering.
 */
import { test, expect, type Page } from '@playwright/test'
import { AttackType, BUILDINGS, MORTAR_AOE_RADIUS, PEASANT_BUILD_MENU, UNITS } from '../src/game/GameData'

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
    // Procedural fallback is valid.
  }

  await page.evaluate(() => {
    const g = (window as any).__war3Game
    if (g?.ai) {
      if (typeof g.ai.reset === 'function') g.ai.reset()
      g.ai.update = () => {}
    }
  })
  await page.waitForTimeout(300)
}

test.describe('V7 Workshop / Mortar combat model proof', () => {
  test.setTimeout(120000)

  test.beforeEach(async ({ page }) => {
    await waitForGame(page)
  })

  test('proof-1: workshop and mortar are connected through data tables', async () => {
    expect(PEASANT_BUILD_MENU).toContain('workshop')
    expect(BUILDINGS.workshop.name).toBe('车间')
    expect(BUILDINGS.workshop.trains).toContain('mortar_team')

    expect(UNITS.mortar_team.name).toBe('迫击炮小队')
    expect(UNITS.mortar_team.attackType).toBe(AttackType.Siege)
    expect(UNITS.mortar_team.attackRange).toBeGreaterThan(UNITS.rifleman.attackRange)
    expect(UNITS.mortar_team.attackCooldown).toBeGreaterThan(UNITS.footman.attackCooldown)
    expect(MORTAR_AOE_RADIUS).toBeGreaterThan(0)
  })

  test('proof-2: workshop command card trains mortar through the normal queue path', async ({ page }) => {
    const result = await page.evaluate(() => {
      const g = (window as any).__war3Game
      if (!g) throw new Error('no game')

      g.resources.earn(0, 1000, 1000)
      g.spawnBuilding('farm', 0, 30, 30)
      const workshop = g.spawnBuilding('workshop', 0, 33, 30)

      g.selectionModel.setSelection([workshop])
      g._lastCmdKey = ''
      g.updateHUD(0.016)

      const buttons = [...document.querySelectorAll('#command-card button')] as HTMLButtonElement[]
      const mortarButton = buttons.find((button) => (
        button.querySelector('.btn-label')?.textContent?.trim() === '迫击炮小队'
      ))

      const beforeQueue = workshop.trainingQueue.length
      const beforeResources = g.resources.get(0)
      mortarButton?.click()
      const afterResources = g.resources.get(0)

      return {
        found: !!mortarButton,
        enabled: !!mortarButton && !mortarButton.disabled,
        disabledReason: mortarButton?.dataset.disabledReason ?? '',
        costText: mortarButton?.querySelector('.btn-cost')?.textContent ?? '',
        beforeQueue,
        afterQueue: workshop.trainingQueue.length,
        queuedType: workshop.trainingQueue[0]?.type ?? '',
        remaining: workshop.trainingQueue[0]?.remaining ?? 0,
        spentGold: beforeResources.gold - afterResources.gold,
        spentLumber: beforeResources.lumber - afterResources.lumber,
      }
    })

    expect(result.found).toBe(true)
    expect(result.enabled).toBe(true)
    expect(result.disabledReason).toBe('')
    expect(result.costText).toContain('220g')
    expect(result.costText).toContain('80w')
    expect(result.afterQueue).toBe(result.beforeQueue + 1)
    expect(result.queuedType).toBe('mortar_team')
    expect(result.remaining).toBe(UNITS.mortar_team.trainTime)
    expect(result.spentGold).toBe(UNITS.mortar_team.cost.gold)
    expect(result.spentLumber).toBe(UNITS.mortar_team.cost.lumber)
  })

  test('proof-3: mortar siege hit applies AOE splash and filters allies/goldmines', async ({ page }) => {
    const result = await page.evaluate(() => {
      const g = (window as any).__war3Game
      if (!g) throw new Error('no game')

      const mortar = g.spawnUnit('mortar_team', 0, 40, 40)
      const primary = g.spawnUnit('footman', 1, 46, 40)
      const splashEnemy = g.spawnUnit('footman', 1, 47, 40)
      const farEnemy = g.spawnUnit('footman', 1, 51, 40)
      const ally = g.spawnUnit('footman', 0, 47, 41)
      const mine = g.spawnBuilding('goldmine', -1, 47, 39)

      const hpBefore = {
        primary: primary.hp,
        splashEnemy: splashEnemy.hp,
        farEnemy: farEnemy.hp,
        ally: ally.hp,
        mine: mine.hp,
      }

      g.dealDamage(mortar, primary)

      const damage = {
        primary: hpBefore.primary - primary.hp,
        splashEnemy: hpBefore.splashEnemy - splashEnemy.hp,
        farEnemy: hpBefore.farEnemy - farEnemy.hp,
        ally: hpBefore.ally - ally.hp,
        mine: hpBefore.mine - mine.hp,
      }

      for (const unit of [mortar, primary, splashEnemy, farEnemy, ally]) {
        unit.hp = 0
      }
      g.handleDeadUnits()
      g.removeTestUnit(mine)

      return {
        mortarType: mortar.type,
        attackDamage: mortar.attackDamage,
        attackRange: mortar.attackRange,
        splashRadius: 2,
        damage,
        remainingSpawnedUnits: [mortar, primary, splashEnemy, farEnemy, ally, mine]
          .filter((u: any) => g.units.includes(u)).length,
      }
    })

    expect(result.mortarType).toBe('mortar_team')
    expect(result.attackDamage).toBe(UNITS.mortar_team.attackDamage)
    expect(result.attackRange).toBe(UNITS.mortar_team.attackRange)
    expect(result.damage.primary).toBeGreaterThan(0)
    expect(result.damage.splashEnemy).toBeGreaterThan(0)
    expect(result.damage.splashEnemy).toBeLessThan(result.damage.primary)
    expect(result.damage.farEnemy).toBe(0)
    expect(result.damage.ally).toBe(0)
    expect(result.damage.mine).toBe(0)
    expect(result.remainingSpawnedUnits).toBe(0)
  })
})
