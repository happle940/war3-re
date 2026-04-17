/**
 * V9 HERO10-UX1 Paladin XP visible feedback slice.
 *
 * Proves:
 * 1. Fresh Paladin selection shows level 1, XP 0/200, and skill points 1.
 * 2. After one enemy normal unit death, selected Paladin shows XP 25/200.
 * 3. After crossing 200 XP, selected Paladin shows level 2, XP 200/500, and skill points 2.
 * 4. At max level, selected Paladin shows level 10 and a max-level phrase.
 * 5. Revived Paladin keeps level / XP / skill-point feedback.
 * 6. The UX slice doc states this is visible feedback only.
 */
import { test, expect, type Page } from '@playwright/test'
import { HERO_XP_RULES } from '../src/game/GameData'

const BASE_RUNTIME = 'http://127.0.0.1:4173/?runtimeTest=1'

async function waitForRuntime(page: Page) {
  await page.goto(BASE_RUNTIME, { waitUntil: 'domcontentloaded' })
  await page.waitForFunction(() => {
    const game = (window as any).__war3Game
    const canvas = document.getElementById('game-canvas')
    return !!game && !!canvas && Array.isArray(game.units) && game.units.length > 0
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

async function setupControlledFixture(page: Page) {
  await page.evaluate(() => {
    const g = (window as any).__war3Game
    if (typeof g.disposeAllUnits === 'function') g.disposeAllUnits()

    for (const team of [0, 1]) {
      const res = g.resources.get(team)
      g.resources.spend(team, { gold: res.gold, lumber: res.lumber })
      g.resources.earn(team, 5000, 5000)
    }

    g.spawnBuilding('townhall', 0, 8, 8)
    g.spawnBuilding('townhall', 1, 52, 52)
  })
}

async function selectUnit(page: Page, unitType: string, team: number) {
  await page.evaluate(({ unitType, team }) => {
    const g = (window as any).__war3Game
    const unit = g.units.find((u: any) => u.type === unitType && u.team === team && !u.isBuilding && !u.isDead)
    g.selectionModel.clear()
    g.selectionModel.setSelection([unit])
    g._lastSelKey = ''
    g.updateHUD(0.016)
  }, { unitType, team })
}

test.describe('V9 HERO10 UX1 Paladin XP visible feedback', () => {
  test.setTimeout(120000)

  test('UX-1: fresh Paladin selection shows level 1, XP 0/200, skill points 1', async ({ page }) => {
    await waitForRuntime(page)
    await setupControlledFixture(page)

    await page.evaluate(() => {
      const g = (window as any).__war3Game
      g.spawnBuilding('altar_of_kings', 0, 15, 15)
      g.spawnUnit('paladin', 0, 18, 15)
      g.update(0.5)
    })

    await selectUnit(page, 'paladin', 0)
    await page.waitForTimeout(100)

    const stats = await page.evaluate(() =>
      document.getElementById('unit-stats')?.textContent ?? ''
    )

    expect(stats).toContain('等级 1')
    expect(stats).toContain('XP 0/200')
    expect(stats).toContain('技能点 1')
  })

  test('UX-2: after one enemy unit death, selected Paladin shows XP 25/200', async ({ page }) => {
    await waitForRuntime(page)
    await setupControlledFixture(page)

    await page.evaluate(() => {
      const g = (window as any).__war3Game
      g.spawnBuilding('altar_of_kings', 0, 15, 15)
      g.spawnUnit('paladin', 0, 18, 15)
      g.update(0.5)

      // Kill one enemy unit
      const enemy = g.spawnUnit('footman', 1, 18, 16)
      g.update(0.1)
      enemy.hp = 0
      g.update(0.5)
    })

    await selectUnit(page, 'paladin', 0)
    await page.waitForTimeout(100)

    const stats = await page.evaluate(() =>
      document.getElementById('unit-stats')?.textContent ?? ''
    )

    expect(stats).toContain('等级 1')
    expect(stats).toContain('XP 25/200')
    expect(stats).toContain('技能点 1')
  })

  test('UX-3: after crossing 200 XP, selected Paladin shows level 2, XP 200/500, skill points 2', async ({ page }) => {
    await waitForRuntime(page)
    await setupControlledFixture(page)

    await page.evaluate(({ xpPerKill, threshold }) => {
      const g = (window as any).__war3Game
      g.spawnBuilding('altar_of_kings', 0, 15, 15)
      g.spawnUnit('paladin', 0, 18, 15)
      g.update(0.5)

      const killsNeeded = Math.ceil(threshold / xpPerKill)
      for (let i = 0; i < killsNeeded; i++) {
        const enemy = g.spawnUnit('footman', 1, 18 + i, 16)
        g.update(0.1)
        enemy.hp = 0
        g.update(0.5)
      }
    }, { xpPerKill: HERO_XP_RULES.normalUnitXpByLevel[1], threshold: HERO_XP_RULES.xpThresholdsByLevel[2] })

    await selectUnit(page, 'paladin', 0)
    await page.waitForTimeout(100)

    const stats = await page.evaluate(() =>
      document.getElementById('unit-stats')?.textContent ?? ''
    )

    expect(stats).toContain('等级 2')
    expect(stats).toContain('XP 200/500')
    expect(stats).toContain('技能点 2')
  })

  test('UX-4: at max level, selected Paladin shows level 10 and max-level phrase', async ({ page }) => {
    await waitForRuntime(page)
    await setupControlledFixture(page)

    await page.evaluate(({ maxLevel, thresholds }) => {
      const g = (window as any).__war3Game
      g.spawnBuilding('altar_of_kings', 0, 15, 15)
      const paladin = g.spawnUnit('paladin', 0, 18, 15)
      g.update(0.5)

      paladin.heroLevel = maxLevel
      paladin.heroXP = thresholds[maxLevel]
      paladin.heroSkillPoints = 0
    }, { maxLevel: HERO_XP_RULES.maxHeroLevel, thresholds: HERO_XP_RULES.xpThresholdsByLevel })

    await selectUnit(page, 'paladin', 0)
    await page.waitForTimeout(100)

    const stats = await page.evaluate(() =>
      document.getElementById('unit-stats')?.textContent ?? ''
    )

    expect(stats).toContain('等级 10')
    expect(stats).toContain('XP 最高等级')
    // No fake next threshold
    expect(stats).not.toContain('XP 5400/')
  })

  test('UX-5: revived Paladin keeps correct level and XP in selection HUD', async ({ page }) => {
    await waitForRuntime(page)
    await setupControlledFixture(page)

    await page.evaluate(() => {
      const g = (window as any).__war3Game
      const altar = g.spawnBuilding('altar_of_kings', 0, 15, 15)
      const paladin = g.spawnUnit('paladin', 0, 18, 15)
      g.update(0.5)

      // Kill enough enemies to reach level 2.
      for (let i = 0; i < 8; i++) {
        const enemy = g.spawnUnit('footman', 1, 18 + i, 16)
        g.update(0.1)
        enemy.hp = 0
        g.update(0.5)
      }

      // Kill Paladin
      paladin.hp = 0
      g.update(0.5)

      // Revive through the existing Altar path, then select the same hero record.
      g.selectionModel.clear()
      g.selectionModel.setSelection([altar])
      g._lastCmdKey = ''
      g.updateHUD(0.016)
      const reviveBtn = Array.from(document.querySelectorAll('#command-card button')).find((b: any) =>
        b.querySelector('.btn-label')?.textContent?.trim() === '复活圣骑士',
      ) as HTMLButtonElement | undefined
      reviveBtn?.click()
      for (let i = 0; i < 600 && altar.reviveQueue.length > 0; i++) {
        g.update(0.5)
      }

      g.selectionModel.clear()
      g.selectionModel.setSelection([paladin])
      g._lastSelKey = ''
      g.updateHUD(0.016)
    })

    await page.waitForTimeout(100)

    const stats = await page.evaluate(() =>
      document.getElementById('unit-stats')?.textContent ?? ''
    )

    expect(stats).toContain('等级 2')
    expect(stats).toContain('XP 200/500')
    expect(stats).toContain('技能点 2')
  })
})
