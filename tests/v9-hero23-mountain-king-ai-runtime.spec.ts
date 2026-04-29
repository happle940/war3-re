/**
 * V9 HERO23-AI-MK1 Mountain King AI runtime proof.
 *
 * Proves:
 * 1. SimpleAI can queue Mountain King after prior hero slots are handled.
 * 2. SimpleAI learns Mountain King abilities by the shared strategy helper.
 * 3. SimpleAI can cast Avatar, Storm Bolt, and Thunder Clap through Game runtime wrappers.
 *
 * Not full build-order balance, long-match win rate, or advanced focus-fire micro.
 */
import { test, expect, type Page } from '@playwright/test'

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
    // Procedural fallback is valid for runtime tests.
  }
}

test.describe('V9 HERO23-AI-MK1 Mountain King AI runtime', () => {
  test.setTimeout(90000)

  test('MKAI-RT-1: AI queues Mountain King from a ready Altar after prior heroes are handled', async ({ page }) => {
    await waitForRuntime(page)

    const result = await page.evaluate(() => {
      const g = (window as any).__war3Game
      if (typeof g.ai.reset === 'function') g.ai.reset()
      g.resources.earn(1, 5000, 5000)

      const altar = g.spawnBuilding('altar_of_kings', 1, 60, 60)
      altar.buildProgress = 1
      altar.trainingQueue = []
      for (let i = 0; i < 4; i++) {
        const farm = g.spawnBuilding('farm', 1, 62 + i, 60)
        farm.buildProgress = 1
      }

      g.ai.paladinSummoned = true
      g.ai.archmageSummoned = true
      g.ai.mountainKingSummoned = false
      g.ai.tick()

      return {
        queued: altar.trainingQueue.map((item: any) => item.type),
        mountainKingSummoned: g.ai.mountainKingSummoned,
      }
    })

    expect(result.queued).toContain('mountain_king')
    expect(result.mountainKingSummoned).toBe(true)
  })

  test('MKAI-RT-2: AI learns Mountain King skills in runtime tick order', async ({ page }) => {
    await waitForRuntime(page)

    const result = await page.evaluate(() => {
      const g = (window as any).__war3Game
      if (typeof g.ai.reset === 'function') g.ai.reset()
      const mk = g.spawnUnit('mountain_king', 1, 45, 45)
      mk.heroLevel = 6
      mk.heroSkillPoints = 4
      mk.abilityLevels = {}

      for (let i = 0; i < 4; i++) g.ai.tick()

      return {
        stormBolt: mk.abilityLevels.storm_bolt ?? 0,
        thunderClap: mk.abilityLevels.thunder_clap ?? 0,
        bash: mk.abilityLevels.bash ?? 0,
        avatar: mk.abilityLevels.avatar ?? 0,
        skillPoints: mk.heroSkillPoints,
      }
    })

    expect(result.stormBolt).toBe(1)
    expect(result.thunderClap).toBe(1)
    expect(result.bash).toBe(1)
    expect(result.avatar).toBe(1)
    expect(result.skillPoints).toBe(0)
  })

  test('MKAI-RT-3: AI casts Avatar, Storm Bolt, and Thunder Clap through Game wrappers', async ({ page }) => {
    await waitForRuntime(page)

    const result = await page.evaluate(() => {
      const g = (window as any).__war3Game
      if (typeof g.ai.reset === 'function') g.ai.reset()
      const mk = g.spawnUnit('mountain_king', 1, 45, 45)
      mk.heroLevel = 6
      mk.heroSkillPoints = 0
      mk.abilityLevels = { avatar: 1, storm_bolt: 1, thunder_clap: 1 }
      mk.mana = 600
      mk.maxMana = 600
      mk.maxHp = 700
      mk.hp = 300
      mk.avatarCooldownUntil = 0
      mk.stormBoltCooldownUntil = 0
      mk.thunderClapCooldownUntil = 0

      const enemyHero = g.spawnUnit('paladin', 0, 48, 45)
      enemyHero.heroLevel = 2
      enemyHero.hp = 500
      enemyHero.maxHp = 700
      const enemyA = g.spawnUnit('footman', 0, 46, 45)
      const enemyB = g.spawnUnit('rifleman', 0, 46.5, 45)
      enemyA.hp = 420
      enemyB.hp = 420

      g.ai.tick()

      return {
        mana: mk.mana,
        avatarActive: mk.avatarUntil > g.gameTime,
        stormBoltCooldown: mk.stormBoltCooldownUntil > g.gameTime,
        thunderClapCooldown: mk.thunderClapCooldownUntil > g.gameTime,
        enemyAHp: enemyA.hp,
        enemyBHp: enemyB.hp,
        enemyHeroHp: enemyHero.hp,
        projectileCount: g.stormBoltProjectiles?.length ?? 0,
      }
    })

    expect(result.mana).toBeLessThan(600)
    expect(result.avatarActive).toBe(true)
    expect(result.stormBoltCooldown).toBe(true)
    expect(result.thunderClapCooldown).toBe(true)
    expect(result.enemyAHp).toBeLessThan(420)
    expect(result.enemyBHp).toBeLessThan(420)
    expect(result.projectileCount).toBeGreaterThanOrEqual(1)
  })
})
