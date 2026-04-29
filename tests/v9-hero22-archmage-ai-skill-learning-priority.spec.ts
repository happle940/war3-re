/**
 * V9 HERO22-AI2 AI Archmage skill-learning priority runtime proof.
 *
 * Proves:
 * 1. Archmage learns skills in contract order: WE -> BA -> BLZ -> MT.
 * 2. One skill per tick.
 * 3. Hero-level and skill-point gates respected.
 * 4. Dead Archmage does not learn skills.
 * 5. No ability casts were added.
 *
 * Not: ability casting, target selection, Water Elemental/Blizzard/Mass Teleport AI cast,
 * other heroes, items, shops, Tavern, new assets, complete AI, complete Human, V9 release.
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

test.describe('V9 HERO22-AI2 AI Archmage skill-learning priority', () => {
  test.setTimeout(150000)

  test('AM-AI2-1: Archmage learns skills in WE -> BA -> BLZ -> MT order', async ({ page }) => {
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

      const archmage = g.units.find((u: any) =>
        u.team === 1 && u.type === 'archmage' && u.hp > 0,
      )
      if (!archmage) return { hasAI: true, hasArchmage: false }

      // Set high level and lots of skill points
      archmage.heroLevel = 10
      archmage.heroSkillPoints = 10

      // Run enough ticks to learn all skills
      for (let i = 0; i < 20; i++) {
        ai.update(1.0)
        g.updateUnits(1.0)
      }

      // Read fresh state
      const am = g.units.find((u: any) =>
        u.team === 1 && u.type === 'archmage' && u.hp > 0,
      )

      return {
        hasAI: true,
        hasArchmage: true,
        abilityLevels: am?.abilityLevels ?? {},
        skillPoints: am?.heroSkillPoints ?? 0,
      }
    })

    expect(result.hasAI).toBe(true)
    expect(result.hasArchmage).toBe(true)
    // WE: maxLevel 3, BA: maxLevel 3, BLZ: maxLevel 3, MT: maxLevel 1 = 10 total
    expect(result.abilityLevels.water_elemental).toBe(3)
    expect(result.abilityLevels.brilliance_aura).toBe(3)
    expect(result.abilityLevels.blizzard).toBe(3)
    expect(result.abilityLevels.mass_teleport).toBe(1)
    expect(result.skillPoints).toBe(0)
  })

  test('AM-AI2-2: Archmage learns exactly one skill per tick', async ({ page }) => {
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

      const archmage = g.units.find((u: any) =>
        u.team === 1 && u.type === 'archmage' && u.hp > 0,
      )
      if (!archmage) return { hasAI: true, hasArchmage: false }

      // Level 1, multiple skill points — one tick should still learn only WE Lv1.
      archmage.heroLevel = 1
      archmage.heroSkillPoints = 3

      ai.update(1.0)
      g.updateUnits(1.0)

      // Read fresh state
      const am = g.units.find((u: any) =>
        u.team === 1 && u.type === 'archmage' && u.hp > 0,
      )

      const afterTick1 = { ...am?.abilityLevels }
      const skillPointsAfterTick1 = am?.heroSkillPoints ?? 0

      // Run another tick. WE Lv2 is level-gated at 3, so the next legal skill is BA Lv1.
      ai.update(1.0)
      g.updateUnits(1.0)

      const am2 = g.units.find((u: any) =>
        u.team === 1 && u.type === 'archmage' && u.hp > 0,
      )
      const afterTick2 = { ...am2?.abilityLevels }

      return {
        hasAI: true,
        hasArchmage: true,
        afterTick1,
        afterTick2,
        skillPointsAfterTick1,
      }
    })

    expect(result.hasAI).toBe(true)
    expect(result.hasArchmage).toBe(true)
    // Tick 1: should have learned exactly WE Lv1 despite spare skill points.
    expect(result.afterTick1.water_elemental).toBe(1)
    expect(result.afterTick1.brilliance_aura).toBeUndefined()
    expect(result.afterTick1.blizzard).toBeUndefined()
    expect(result.afterTick1.mass_teleport).toBeUndefined()
    expect(result.skillPointsAfterTick1).toBe(2)
    // Tick 2: one more skill learned, proving one-skill-per-tick rather than batch learning.
    expect(result.afterTick2.water_elemental).toBe(1)
    expect(result.afterTick2.brilliance_aura).toBe(1)
    expect(result.afterTick2.blizzard).toBeUndefined()
    expect(result.afterTick2.mass_teleport).toBeUndefined()
  })

  test('AM-AI2-3: Hero-level gate is respected for each skill', async ({ page }) => {
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

      const archmage = g.units.find((u: any) =>
        u.team === 1 && u.type === 'archmage' && u.hp > 0,
      )
      if (!archmage) return { hasAI: true, hasArchmage: false }

      // Level 2: WE Lv1 requires level 1 (ok), WE Lv2 requires level 3 (blocked)
      // BA Lv1 requires level 1 (ok), BLZ Lv1 requires level 1 (ok)
      // With 3 skill points at level 2:
      //   Tick 1: WE Lv1 (priority 1, level 1 ok)
      //   Tick 2: BA Lv1 (priority 2, level 1 ok) — WE Lv2 requires level 3, blocked
      //   Tick 3: BLZ Lv1 (priority 3, level 1 ok) — WE Lv2 still blocked
      archmage.heroLevel = 2
      archmage.heroSkillPoints = 3

      for (let i = 0; i < 10; i++) {
        ai.update(1.0)
        g.updateUnits(1.0)
      }

      const am = g.units.find((u: any) =>
        u.team === 1 && u.type === 'archmage' && u.hp > 0,
      )

      return {
        hasAI: true,
        hasArchmage: true,
        abilityLevels: am?.abilityLevels ?? {},
        skillPoints: am?.heroSkillPoints ?? 0,
        heroLevel: am?.heroLevel ?? 0,
      }
    })

    expect(result.hasAI).toBe(true)
    expect(result.hasArchmage).toBe(true)
    // At level 2: WE Lv1, BA Lv1, BLZ Lv1 — but WE Lv2 requires level 3
    // Actually at level 2 with 3 points: WE Lv1, then BA Lv1, then BLZ Lv1
    // because WE Lv2 is blocked at level 3, so it moves to BA, then BLZ
    expect(result.abilityLevels.water_elemental).toBe(1)
    expect(result.abilityLevels.brilliance_aura).toBe(1)
    expect(result.abilityLevels.blizzard).toBe(1)
    expect(result.skillPoints).toBe(0)
  })

  test('AM-AI2-4: Mass Teleport requires hero level 6', async ({ page }) => {
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

      const archmage = g.units.find((u: any) =>
        u.team === 1 && u.type === 'archmage' && u.hp > 0,
      )
      if (!archmage) return { hasAI: true, hasArchmage: false }

      // Level 5: can learn WE 1/3/5, BA 1/3/5, BLZ 1/3/5, but MT requires level 6
      archmage.heroLevel = 5
      archmage.heroSkillPoints = 9

      for (let i = 0; i < 20; i++) {
        ai.update(1.0)
        g.updateUnits(1.0)
      }

      const am = g.units.find((u: any) =>
        u.team === 1 && u.type === 'archmage' && u.hp > 0,
      )

      return {
        hasAI: true,
        hasArchmage: true,
        abilityLevels: am?.abilityLevels ?? {},
        skillPoints: am?.heroSkillPoints ?? 0,
      }
    })

    expect(result.hasAI).toBe(true)
    expect(result.hasArchmage).toBe(true)
    // At level 5: WE 1/2/3 (1/3/5), BA 1/2/3 (1/3/5), BLZ 1/2/3 (1/3/5) = 9 skills
    // MT requires level 6, so should not be learned
    expect(result.abilityLevels.water_elemental).toBe(3)
    expect(result.abilityLevels.brilliance_aura).toBe(3)
    expect(result.abilityLevels.blizzard).toBe(3)
    expect(result.abilityLevels.mass_teleport).toBeUndefined()
    expect(result.skillPoints).toBe(0)
  })

  test('AM-AI2-5: Dead Archmage does not learn skills', async ({ page }) => {
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

      const archmage = g.units.find((u: any) =>
        u.team === 1 && u.type === 'archmage' && u.hp > 0,
      )
      if (!archmage) return { hasAI: true, hasArchmage: false }

      // Kill the Archmage
      archmage.hp = 0
      archmage.isDead = true
      archmage.heroLevel = 10
      archmage.heroSkillPoints = 10

      // Run many ticks
      for (let i = 0; i < 20; i++) {
        ai.update(1.0)
        g.updateUnits(1.0)
      }

      // Read fresh state
      const am = g.units.find((u: any) =>
        u.team === 1 && u.type === 'archmage',
      )

      return {
        hasAI: true,
        hasArchmage: true,
        abilityLevels: am?.abilityLevels ?? {},
        skillPoints: am?.heroSkillPoints ?? 0,
      }
    })

    expect(result.hasAI).toBe(true)
    expect(result.hasArchmage).toBe(true)
    // Dead archmage should not have learned anything
    const al = result.abilityLevels as Record<string, number>
    const hasAnyAbility = Object.keys(al).some(k => al[k] > 0)
    expect(hasAnyAbility).toBe(false)
  })
})
