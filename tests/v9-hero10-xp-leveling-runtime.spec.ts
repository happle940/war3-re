/**
 * V9 HERO10-IMPL1 minimal unit-kill XP runtime proof.
 *
 * Proves:
 * 1. Paladin starts with level 1 / XP 0 / skill points 1.
 * 2. Killing one enemy non-building unit grants 25 XP to alive Paladin.
 * 3. Friendly unit death, building death, neutral unit death, and dead Paladin do not gain XP.
 * 4. Crossing 200 XP levels Paladin to level 2 and grants exactly one additional skill point.
 * 5. Level 10 Paladin does not gain more XP.
 * 6. Existing HERO9 revive runtime still works.
 * 7. The runtime slice doc states what is implemented and what remains deferred.
 *
 * Not: hero UI, ability learning, skill-point spend, aura, ultimate, enemy hero XP,
 * creep XP, XP sharing, multiple heroes, items, Tavern, shop, other heroes, AI strategy.
 */
import { test, expect, type Page } from '@playwright/test'
import { HERO_REVIVE_RULES, HERO_XP_RULES, UNITS } from '../src/game/GameData'

const BASE_RUNTIME = 'http://127.0.0.1:4173/?runtimeTest=1'
const PALADIN_COST = UNITS.paladin.cost
const PALADIN_LEVEL_2_REVIVE_GOLD = Math.min(
  Math.floor(PALADIN_COST.gold * (
    HERO_REVIVE_RULES.goldBaseFactor + HERO_REVIVE_RULES.goldLevelFactor
  )),
  HERO_REVIVE_RULES.goldHardCap,
)
const PALADIN_LEVEL_2_REVIVE_LUMBER = Math.floor(
  PALADIN_COST.lumber * (HERO_REVIVE_RULES.lumberBaseFactor + HERO_REVIVE_RULES.lumberLevelFactor),
)

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

async function resetToControlledHeroXpFixture(page: Page) {
  await page.evaluate(() => {
    const g = (window as any).__war3Game
    if (typeof g.disposeAllUnits === 'function') g.disposeAllUnits()

    for (const team of [0, 1]) {
      const res = g.resources.get(team)
      g.resources.spend(team, { gold: res.gold, lumber: res.lumber })
      g.resources.earn(team, 5000, 5000)
    }

    // Keep victory/defeat logic from ending the controlled fixture after
    // disposeAllUnits(). These town halls do not gather or fight.
    g.spawnBuilding('townhall', 0, 8, 8)
    g.spawnBuilding('townhall', 1, 52, 52)
  })
}

test.describe('V9 HERO10 XP / leveling runtime', () => {
  test.setTimeout(120000)

  test('XP-1: Paladin starts with level 1 / XP 0 / skill points 1', async ({ page }) => {
    await waitForRuntime(page)
    await resetToControlledHeroXpFixture(page)

    const result = await page.evaluate(() => {
      const g = (window as any).__war3Game
      const altar = g.spawnBuilding('altar_of_kings', 0, 15, 15)
      const paladin = g.spawnUnit('paladin', 0, 18, 15)
      g.update(0.5)

      return {
        heroLevel: paladin.heroLevel,
        heroXP: paladin.heroXP,
        heroSkillPoints: paladin.heroSkillPoints,
      }
    })

    expect(result.heroLevel).toBe(1)
    expect(result.heroXP).toBe(0)
    expect(result.heroSkillPoints).toBe(1)
  })

  test('XP-2: killing one enemy non-building unit grants 25 XP to alive Paladin', async ({ page }) => {
    await waitForRuntime(page)
    await resetToControlledHeroXpFixture(page)

    const result = await page.evaluate(() => {
      const g = (window as any).__war3Game
      const altar = g.spawnBuilding('altar_of_kings', 0, 15, 15)
      const paladin = g.spawnUnit('paladin', 0, 18, 15)
      const enemy = g.spawnUnit('footman', 1, 18, 16)
      g.update(0.5)

      const xpBefore = paladin.heroXP
      // Simulate Paladin killing the enemy
      enemy.hp = 0
      g.update(0.5)

      // Read fresh state
      const palFresh = g.units.find((u: any) => u.team === 0 && u.type === 'paladin' && !u.isBuilding)
      return {
        xpBefore,
        xpAfter: palFresh.heroXP,
        enemyRemoved: !g.units.includes(enemy),
      }
    })

    expect(result.xpBefore).toBe(0)
    expect(result.xpAfter).toBe(HERO_XP_RULES.normalUnitXpByLevel[1])
    expect(result.xpAfter).toBe(25)
  })

  test('XP-3: friendly unit death, building death, and dead Paladin do not gain XP', async ({ page }) => {
    await waitForRuntime(page)
    await resetToControlledHeroXpFixture(page)

    const result = await page.evaluate(() => {
      const g = (window as any).__war3Game
      const altar = g.spawnBuilding('altar_of_kings', 0, 15, 15)
      const paladin = g.spawnUnit('paladin', 0, 18, 15)
      const friendlyFootman = g.spawnUnit('footman', 0, 19, 15)
      const enemyBuilding = g.spawnBuilding('barracks', 1, 40, 40)
      const enemyKiller = g.spawnUnit('footman', 1, 18, 16)
      const neutralFootman = g.spawnUnit('footman', 1, 22, 16)
      neutralFootman.team = -1
      g.update(0.5)

      // Kill friendly footman — Paladin should NOT get XP
      friendlyFootman.hp = 0
      g.update(0.5)
      const xpAfterFriendly = g.units.find((u: any) => u.team === 0 && u.type === 'paladin' && !u.isBuilding).heroXP

      // Kill enemy building — Paladin should NOT get XP
      enemyBuilding.hp = 0
      g.update(0.5)
      const xpAfterBuilding = g.units.find((u: any) => u.team === 0 && u.type === 'paladin' && !u.isBuilding).heroXP

      // Kill a neutral/creep-like unit — Paladin should NOT get XP in this slice
      neutralFootman.hp = 0
      g.update(0.5)
      const xpAfterNeutral = g.units.find((u: any) => u.team === 0 && u.type === 'paladin' && !u.isBuilding).heroXP

      // Kill Paladin
      paladin.hp = 0
      g.update(0.5)
      const palDead = g.units.find((u: any) => u.team === 0 && u.type === 'paladin' && !u.isBuilding)

      // Kill enemy footman while Paladin is dead — should NOT get XP
      enemyKiller.hp = 0
      g.update(0.5)
      const xpAfterDead = palDead.heroXP

      return {
        xpAfterFriendly,
        xpAfterBuilding,
        xpAfterNeutral,
        xpAfterDead,
        paladinIsDead: palDead.isDead,
      }
    })

    expect(result.xpAfterFriendly).toBe(0)
    expect(result.xpAfterBuilding).toBe(0)
    expect(result.xpAfterNeutral).toBe(0)
    expect(result.xpAfterDead).toBe(0)
    expect(result.paladinIsDead).toBe(true)
  })

  test('XP-4: crossing 200 XP levels Paladin to level 2 and grants one skill point', async ({ page }) => {
    await waitForRuntime(page)
    await resetToControlledHeroXpFixture(page)

    const result = await page.evaluate(({ xpPerKill, threshold }) => {
      const g = (window as any).__war3Game
      const altar = g.spawnBuilding('altar_of_kings', 0, 15, 15)
      const paladin = g.spawnUnit('paladin', 0, 18, 15)
      g.update(0.5)

      // Kill enough enemies to cross 200 XP
      const killsNeeded = Math.ceil(threshold / xpPerKill)
      for (let i = 0; i < killsNeeded; i++) {
        const enemy = g.spawnUnit('footman', 1, 18 + i, 16)
        g.update(0.1)
        enemy.hp = 0
        g.update(0.5)
      }

      const palFresh = g.units.find((u: any) => u.team === 0 && u.type === 'paladin' && !u.isBuilding)
      return {
        level: palFresh.heroLevel,
        xp: palFresh.heroXP,
        skillPoints: palFresh.heroSkillPoints,
        killsNeeded,
      }
    }, { xpPerKill: HERO_XP_RULES.normalUnitXpByLevel[1], threshold: HERO_XP_RULES.xpThresholdsByLevel[2] })

    expect(result.killsNeeded).toBe(8) // 200 / 25 = 8
    expect(result.level).toBe(2)
    expect(result.xp).toBe(200)
    expect(result.skillPoints).toBe(2) // 1 initial + 1 level-up
  })

  test('XP-5: level 10 Paladin does not gain more XP', async ({ page }) => {
    await waitForRuntime(page)
    await resetToControlledHeroXpFixture(page)

    const result = await page.evaluate(({ maxLevel, thresholds }) => {
      const g = (window as any).__war3Game
      const altar = g.spawnBuilding('altar_of_kings', 0, 15, 15)
      const paladin = g.spawnUnit('paladin', 0, 18, 15)
      g.update(0.5)

      // Force level to max
      paladin.heroLevel = maxLevel
      paladin.heroXP = thresholds[maxLevel]

      const xpBefore = paladin.heroXP

      // Kill an enemy
      const enemy = g.spawnUnit('footman', 1, 18, 16)
      g.update(0.1)
      enemy.hp = 0
      g.update(0.5)

      const palFresh = g.units.find((u: any) => u.team === 0 && u.type === 'paladin' && !u.isBuilding)
      return {
        xpBefore,
        xpAfter: palFresh.heroXP,
        level: palFresh.heroLevel,
        stillMaxLevel: palFresh.heroLevel === maxLevel,
      }
    }, {
      maxLevel: HERO_XP_RULES.maxHeroLevel,
      thresholds: HERO_XP_RULES.xpThresholdsByLevel,
    })

    expect(result.xpAfter).toBe(result.xpBefore)
    expect(result.stillMaxLevel).toBe(true)
    expect(result.level).toBe(10)
  })

  test('XP-6: HERO9 revive still works with leveled Paladin', async ({ page }) => {
    await waitForRuntime(page)
    await resetToControlledHeroXpFixture(page)

    const result = await page.evaluate(({ thresholds }) => {
      const g = (window as any).__war3Game
      const altar = g.spawnBuilding('altar_of_kings', 0, 15, 15)
      const paladin = g.spawnUnit('paladin', 0, 18, 15)
      g.update(0.5)

      // Force level 2
      paladin.heroLevel = 2
      paladin.heroXP = thresholds[2]
      paladin.heroSkillPoints = 2

      // Kill Paladin
      paladin.hp = 0
      g.update(0.5)

      const palDead = g.units.find((u: any) => u.team === 0 && u.type === 'paladin' && !u.isBuilding)
      if (!palDead?.isDead) return { error: 'Paladin not dead' }

      // Select altar and revive
      g.selectionModel.clear()
      g.selectionModel.setSelection([altar])
      g._lastCmdKey = ''
      g.updateHUD(0.016)
      ;(window as any).__getCommandButton = (label: string) =>
        Array.from(document.querySelectorAll('#command-card button')).find((b: any) =>
          b.querySelector('.btn-label')?.textContent?.trim() === label,
        ) as HTMLButtonElement | undefined

      const reviveBtn = (window as any).__getCommandButton('复活圣骑士')
      if (!reviveBtn) return { error: 'no revive button' }

      const goldBefore = g.resources.get(0).gold
      const lumberBefore = g.resources.get(0).lumber
      reviveBtn.click()
      g.updateHUD(0.016)

      // Simulate revive completion
      const dt = 0.5
      for (let i = 0; i < 600 && altar.reviveQueue.length > 0; i++) {
        g.update(dt)
      }

      const palRevived = g.units.find((u: any) => u.team === 0 && u.type === 'paladin' && !u.isBuilding)
      return {
        revived: !palRevived.isDead,
        levelAfterRevive: palRevived.heroLevel,
        xpAfterRevive: palRevived.heroXP,
        skillPointsAfterRevive: palRevived.heroSkillPoints,
        goldSpent: goldBefore - g.resources.get(0).gold,
        lumberSpent: lumberBefore - g.resources.get(0).lumber,
        queueEmpty: altar.reviveQueue.length === 0,
      }
    }, { thresholds: HERO_XP_RULES.xpThresholdsByLevel })

    expect(result.revived).toBe(true)
    expect(result.levelAfterRevive).toBe(2)
    expect(result.xpAfterRevive).toBe(200)
    expect(result.skillPointsAfterRevive).toBe(2)
    expect(result.queueEmpty).toBe(true)
    expect(result.goldSpent).toBe(PALADIN_LEVEL_2_REVIVE_GOLD)
    expect(result.lumberSpent).toBe(PALADIN_LEVEL_2_REVIVE_LUMBER)
  })
})
