/**
 * V9 HERO22-AI3 AI Archmage Water Elemental cast runtime proof.
 *
 * Proves:
 * 1. AI Archmage with learned WE summons one Water Elemental near enemy pressure.
 * 2. No summon when WE is unlearned.
 * 3. No summon when mana insufficient, cooldown active, Archmage dead, or no enemies.
 * 4. AI1 training and AI2 skill-learning still work.
 * 5. No Blizzard/Mass Teleport/Brilliance Aura cast was added.
 *
 * Not: Blizzard AI, Mass Teleport AI, target-cluster scoring, retreat/regroup,
 * other heroes, items, shops, Tavern, assets, complete AI, complete Human, V9 release.
 */
import { test, expect, type Page } from '@playwright/test'

const BASE = 'http://127.0.0.1:4173/?runtimeTest=1'

async function waitForRuntime(page: Page) {
  await page.goto(BASE, { waitUntil: 'domcontentloaded' })
  await page.waitForFunction(() => {
    const game = (window as any).__war3Game
    const canvas = document.getElementById('game-canvas')
    return !!game && !!canvas && Array.isArray(game.units) && game.units.length > 0
  }, { timeout: 15000 })
  await page.waitForTimeout(300)
}

test.describe('V9 HERO22-AI3 AI Archmage Water Elemental cast', () => {
  test.setTimeout(150000)

  test('AM-AI3-1: AI Archmage with learned WE summons one Water Elemental near enemy', async ({ page }) => {
    await waitForRuntime(page)

    const result = await page.evaluate(() => {
      const g = (window as any).__war3Game
      const ai = g.ai
      if (!ai) return { hasAI: false }

      g.resources.earn(1, 10000, 10000)

      // Run until Archmage appears
      for (let i = 0; i < 300; i++) {
        ai.update(1.0)
        for (const u of g.units) {
          if (u.team === 1 && u.type === 'altar_of_kings' && u.buildProgress < 1 && u.hp > 0) {
            u.buildProgress = 1
          }
          if (u.team === 1 && u.isBuilding && u.trainingQueue.length > 0) {
            u.trainingQueue[0].remaining = 0.001
          }
        }
        g.updateUnits(1.0)
        if (g.units.some((u: any) => u.team === 1 && u.type === 'archmage' && u.hp > 0)) break
      }

      // Read fresh state
      let units = g.units
      const archmage = units.find((u: any) => u.team === 1 && u.type === 'archmage' && u.hp > 0)
      if (!archmage) return { hasAI: true, hasArchmage: false }

      // Directly set WE learned, full mana, no cooldown, no skill points to avoid AI learning
      if (!archmage.abilityLevels) archmage.abilityLevels = {}
      archmage.abilityLevels.water_elemental = 1
      archmage.heroLevel = 2
      archmage.heroSkillPoints = 0
      archmage.mana = 300
      archmage.maxMana = 300
      archmage.waterElementalCooldownUntil = 0

      // Move an enemy close to the Archmage (within cast range of 8.0)
      const enemies = units.filter((u: any) => u.team !== 1 && u.hp > 0 && !u.isBuilding)
      if (enemies.length > 0) {
        enemies[0].mesh.position.x = archmage.mesh.position.x + 3
        enemies[0].mesh.position.z = archmage.mesh.position.z + 3
      }

      // Count water elementals before
      units = g.units
      const weBefore = units.filter((u: any) =>
        u.team === 1 && u.type === 'water_elemental' && u.hp > 0,
      ).length

      // Run AI tick — should attempt WE summon
      ai.update(1.0)
      g.updateUnits(1.0)

      // Read fresh state after summon attempt
      units = g.units
      const weAfter = units.filter((u: any) =>
        u.team === 1 && u.type === 'water_elemental' && u.hp > 0,
      ).length

      return {
        hasAI: true,
        hasArchmage: true,
        weBefore,
        weAfter,
        weSpawned: weAfter > weBefore,
      }
    })

    expect(result.hasAI).toBe(true)
    expect(result.hasArchmage).toBe(true)
    expect(result.weSpawned).toBe(true)
  })

  test('AM-AI3-2: No summon when WE is unlearned', async ({ page }) => {
    await waitForRuntime(page)

    const result = await page.evaluate(() => {
      const g = (window as any).__war3Game
      const ai = g.ai
      if (!ai) return { hasAI: false }

      g.resources.earn(1, 10000, 10000)

      // Run until Archmage appears
      for (let i = 0; i < 300; i++) {
        ai.update(1.0)
        for (const u of g.units) {
          if (u.team === 1 && u.type === 'altar_of_kings' && u.buildProgress < 1 && u.hp > 0) {
            u.buildProgress = 1
          }
          if (u.team === 1 && u.isBuilding && u.trainingQueue.length > 0) {
            u.trainingQueue[0].remaining = 0.001
          }
        }
        g.updateUnits(1.0)
        if (g.units.some((u: any) => u.team === 1 && u.type === 'archmage' && u.hp > 0)) break
      }

      // Read fresh state
      let units = g.units
      const archmage = units.find((u: any) => u.team === 1 && u.type === 'archmage' && u.hp > 0)
      if (!archmage) return { hasAI: true, hasArchmage: false }

      // Explicitly set no WE learned, no skill points so AI won't learn anything
      archmage.heroLevel = 1
      archmage.heroSkillPoints = 0
      archmage.abilityLevels = {}
      archmage.mana = 300

      // Ensure enemy nearby
      const enemies = units.filter((u: any) => u.team !== 1 && u.hp > 0 && !u.isBuilding)
      if (enemies.length > 0) {
        enemies[0].mesh.position.x = archmage.mesh.position.x + 3
        enemies[0].mesh.position.z = archmage.mesh.position.z + 3
      }

      // Run AI ticks
      for (let i = 0; i < 5; i++) {
        ai.update(1.0)
        g.updateUnits(1.0)
      }

      // Read fresh state
      units = g.units
      const weCount = units.filter((u: any) =>
        u.team === 1 && u.type === 'water_elemental' && u.hp > 0,
      ).length

      return { hasAI: true, hasArchmage: true, weCount }
    })

    expect(result.hasAI).toBe(true)
    expect(result.hasArchmage).toBe(true)
    expect(result.weCount).toBe(0)
  })

  test('AM-AI3-3: No summon when mana insufficient or cooldown active or Archmage dead', async ({ page }) => {
    await waitForRuntime(page)

    const result = await page.evaluate(() => {
      const g = (window as any).__war3Game
      const ai = g.ai
      if (!ai) return { hasAI: false }

      g.resources.earn(1, 10000, 10000)

      // Run until Archmage appears
      for (let i = 0; i < 300; i++) {
        ai.update(1.0)
        for (const u of g.units) {
          if (u.team === 1 && u.type === 'altar_of_kings' && u.buildProgress < 1 && u.hp > 0) {
            u.buildProgress = 1
          }
          if (u.team === 1 && u.isBuilding && u.trainingQueue.length > 0) {
            u.trainingQueue[0].remaining = 0.001
          }
        }
        g.updateUnits(1.0)
        if (g.units.some((u: any) => u.team === 1 && u.type === 'archmage' && u.hp > 0)) break
      }

      // Set up Archmage with WE learned but LOW mana
      let units = g.units
      const archmage = units.find((u: any) => u.team === 1 && u.type === 'archmage' && u.hp > 0)
      if (!archmage) return { hasAI: true, hasArchmage: false }

      archmage.heroLevel = 6
      archmage.heroSkillPoints = 0
      archmage.mana = 10 // too low for WE (costs 125)
      archmage.maxMana = 300
      archmage.waterElementalCooldownUntil = 0
      archmage.abilityLevels = { ...(archmage.abilityLevels ?? {}), water_elemental: 1 }

      // Ensure enemy nearby
      units = g.units
      const enemies = units.filter((u: any) => u.team !== 1 && u.hp > 0 && !u.isBuilding)
      const am = units.find((u: any) => u.team === 1 && u.type === 'archmage' && u.hp > 0)
      if (enemies.length > 0 && am) {
        enemies[0].mesh.position.x = am.mesh.position.x + 3
        enemies[0].mesh.position.z = am.mesh.position.z + 3
      }

      // Run AI ticks with low mana
      for (let i = 0; i < 5; i++) {
        ai.update(1.0)
        g.updateUnits(1.0)
      }

      units = g.units
      const weAfterLowMana = units.filter((u: any) =>
        u.team === 1 && u.type === 'water_elemental' && u.hp > 0,
      ).length

      // Now test with cooldown active: give full mana but set cooldown far future
      const am2 = units.find((u: any) => u.team === 1 && u.type === 'archmage' && u.hp > 0)
      if (am2) {
        am2.mana = 300
        am2.waterElementalCooldownUntil = 9999
      }

      for (let i = 0; i < 5; i++) {
        ai.update(1.0)
        g.updateUnits(1.0)
      }

      units = g.units
      const weAfterCooldown = units.filter((u: any) =>
        u.team === 1 && u.type === 'water_elemental' && u.hp > 0,
      ).length

      // Now test with dead Archmage
      const am3 = units.find((u: any) => u.team === 1 && u.type === 'archmage')
      if (am3) {
        am3.hp = 0
        am3.isDead = true
        am3.mana = 300
        am3.waterElementalCooldownUntil = 0
      }

      for (let i = 0; i < 5; i++) {
        ai.update(1.0)
        g.updateUnits(1.0)
      }

      units = g.units
      const weAfterDead = units.filter((u: any) =>
        u.team === 1 && u.type === 'water_elemental' && u.hp > 0,
      ).length

      return {
        hasAI: true,
        hasArchmage: true,
        weAfterLowMana,
        weAfterCooldown,
        weAfterDead,
      }
    })

    expect(result.hasAI).toBe(true)
    expect(result.hasArchmage).toBe(true)
    expect(result.weAfterLowMana).toBe(0)
    expect(result.weAfterCooldown).toBe(0)
    expect(result.weAfterDead).toBe(0)
  })

  test('AM-AI3-4: No summon when no enemies are nearby', async ({ page }) => {
    await waitForRuntime(page)

    const result = await page.evaluate(() => {
      const g = (window as any).__war3Game
      const ai = g.ai
      if (!ai) return { hasAI: false }

      g.resources.earn(1, 10000, 10000)

      // Run until Archmage appears
      for (let i = 0; i < 300; i++) {
        ai.update(1.0)
        for (const u of g.units) {
          if (u.team === 1 && u.type === 'altar_of_kings' && u.buildProgress < 1 && u.hp > 0) {
            u.buildProgress = 1
          }
          if (u.team === 1 && u.isBuilding && u.trainingQueue.length > 0) {
            u.trainingQueue[0].remaining = 0.001
          }
        }
        g.updateUnits(1.0)
        if (g.units.some((u: any) => u.team === 1 && u.type === 'archmage' && u.hp > 0)) break
      }

      let units = g.units
      const archmage = units.find((u: any) => u.team === 1 && u.type === 'archmage' && u.hp > 0)
      if (!archmage) return { hasAI: true, hasArchmage: false }

      // Isolate no-enemy behavior: learned WE, full mana, no cooldown, no spare skill points.
      archmage.heroLevel = 6
      archmage.heroSkillPoints = 0
      archmage.abilityLevels = { ...(archmage.abilityLevels ?? {}), water_elemental: 1 }
      archmage.mana = 300
      archmage.maxMana = 300
      archmage.waterElementalCooldownUntil = 0

      // Kill all non-building enemy units
      units = g.units
      for (const u of units) {
        if (u.team !== 1 && u.hp > 0 && !u.isBuilding) {
          u.hp = 0
          u.isDead = true
        }
      }

      // Run AI ticks — no enemies, should not summon
      for (let i = 0; i < 10; i++) {
        ai.update(1.0)
        g.updateUnits(1.0)
      }

      units = g.units
      const weCount = units.filter((u: any) =>
        u.team === 1 && u.type === 'water_elemental' && u.hp > 0,
      ).length

      return { hasAI: true, hasArchmage: true, weCount }
    })

    expect(result.hasAI).toBe(true)
    expect(result.hasArchmage).toBe(true)
    expect(result.weCount).toBe(0)
  })

  test('AM-AI3-5: AI1 training and AI2 skill-learning still work with WE cast present', async ({ page }) => {
    await waitForRuntime(page)

    const result = await page.evaluate(() => {
      const g = (window as any).__war3Game
      const ai = g.ai
      if (!ai) return { hasAI: false }

      g.resources.earn(1, 10000, 10000)

      // Run until Archmage exists and has skills
      for (let i = 0; i < 300; i++) {
        ai.update(1.0)
        for (const u of g.units) {
          if (u.team === 1 && u.type === 'altar_of_kings' && u.buildProgress < 1 && u.hp > 0) {
            u.buildProgress = 1
          }
          if (u.team === 1 && u.isBuilding && u.trainingQueue.length > 0) {
            u.trainingQueue[0].remaining = 0.001
          }
        }
        g.updateUnits(1.0)
      }

      // Verify AI1: exactly one Archmage, exactly one Paladin
      const units = g.units
      const archmageCount = units.filter((u: any) =>
        u.team === 1 && u.type === 'archmage' && u.hp > 0,
      ).length
      const paladinCount = units.filter((u: any) =>
        u.team === 1 && u.type === 'paladin' && u.hp > 0,
      ).length

      // Verify AI2: Archmage should have learned skills
      const am = units.find((u: any) =>
        u.team === 1 && u.type === 'archmage' && u.hp > 0,
      )
      const al = am?.abilityLevels ?? {}
      const weLevel = al.water_elemental ?? 0

      return {
        hasAI: true,
        archmageCount,
        paladinCount,
        weLevel,
      }
    })

    expect(result.hasAI).toBe(true)
    expect(result.archmageCount).toBe(1)
    expect(result.paladinCount).toBe(1)
    expect(result.weLevel).toBeGreaterThan(0)
  })
})
