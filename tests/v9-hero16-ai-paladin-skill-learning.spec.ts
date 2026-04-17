/**
 * V9 HERO16-AI2 AI Paladin skill-learning priority runtime proof.
 *
 * Proves:
 * 1. AI learns Holy Light first when Paladin has skill points.
 * 2. AI learns Divine Shield, then Devotion Aura, then Resurrection in order.
 * 3. AI respects hero level gates (requiredHeroLevel).
 * 4. AI does not learn when dead, no skill points, or level gate not met.
 * 5. AI does not cast abilities in this task.
 * 6. Task255 Altar+summon behavior still works.
 *
 * Not: ability casting, other heroes, items, shops, Tavern, assets,
 * complete AI, complete Human, V9 release.
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

test.describe('V9 HERO16-AI2 AI Paladin skill-learning priority', () => {
  test.setTimeout(150000)

  test('AI2-1: AI learns Holy Light first with skill points', async ({ page }) => {
    await waitForRuntime(page)

    const result = await page.evaluate(() => {
      const g = (window as any).__war3Game
      const ai = g.ai
      if (!ai) return { hasAI: false }

      g.resources.earn(1, 10000, 10000)

      // Run until Paladin exists
      let paladin = null
      for (let i = 0; i < 300; i++) {
        ai.update(1.0)
        for (const u of g.units) {
          if (u.team === 1 && u.type === 'altar_of_kings' && u.buildProgress < 1 && u.hp > 0) u.buildProgress = 1
          if (u.team === 1 && u.isBuilding && u.trainingQueue.length > 0) u.trainingQueue[0].remaining = 0.001
        }
        g.updateUnits(1.0)
        paladin = g.units.find((u: any) => u.team === 1 && u.type === 'paladin' && u.hp > 0)
        if (paladin) break
      }

      if (!paladin) return { hasAI: true, hasPaladin: false }

      // Give skill points
      paladin.heroSkillPoints = 1
      paladin.heroLevel = 1
      paladin.abilityLevels = {}

      const beforeHL = paladin.abilityLevels.holy_light ?? 0
      ai.update(1.0)
      const afterHL = paladin.abilityLevels.holy_light ?? 0
      const afterDS = paladin.abilityLevels.divine_shield ?? 0
      const afterSP = paladin.heroSkillPoints ?? 0

      return { hasAI: true, hasPaladin: true, beforeHL, afterHL, afterDS, afterSP }
    })

    expect(result.hasAI).toBe(true)
    expect(result.hasPaladin).toBe(true)
    expect(result.beforeHL).toBe(0)
    expect(result.afterHL).toBe(1)
    expect(result.afterDS).toBe(0)
    expect(result.afterSP).toBe(0)
  })

  test('AI2-2: AI learns Divine Shield after Holy Light maxed at current level gate', async ({ page }) => {
    await waitForRuntime(page)

    const result = await page.evaluate(() => {
      const g = (window as any).__war3Game
      const ai = g.ai
      if (!ai) return { hasAI: false }

      g.resources.earn(1, 10000, 10000)

      let paladin = null
      for (let i = 0; i < 300; i++) {
        ai.update(1.0)
        for (const u of g.units) {
          if (u.team === 1 && u.type === 'altar_of_kings' && u.buildProgress < 1 && u.hp > 0) u.buildProgress = 1
          if (u.team === 1 && u.isBuilding && u.trainingQueue.length > 0) u.trainingQueue[0].remaining = 0.001
        }
        g.updateUnits(1.0)
        paladin = g.units.find((u: any) => u.team === 1 && u.type === 'paladin' && u.hp > 0)
        if (paladin) break
      }

      if (!paladin) return { hasAI: true, hasPaladin: false }

      // HL L1 learned, level 1, next HL needs level 3. So DS should be learned next.
      paladin.heroSkillPoints = 1
      paladin.heroLevel = 1
      paladin.abilityLevels = { holy_light: 1 }

      ai.update(1.0)

      return {
        hasAI: true,
        hasPaladin: true,
        hl: paladin.abilityLevels.holy_light ?? 0,
        ds: paladin.abilityLevels.divine_shield ?? 0,
        da: paladin.abilityLevels.devotion_aura ?? 0,
        sp: paladin.heroSkillPoints ?? 0,
      }
    })

    expect(result.hasAI).toBe(true)
    expect(result.hasPaladin).toBe(true)
    expect(result.hl).toBe(1)  // HL stays at 1 (can't learn L2 until heroLevel 3)
    expect(result.ds).toBe(1)  // DS learned instead
    expect(result.da).toBe(0)
    expect(result.sp).toBe(0)
  })

  test('AI2-3: AI learns Devotion Aura after Divine Shield', async ({ page }) => {
    await waitForRuntime(page)

    const result = await page.evaluate(() => {
      const g = (window as any).__war3Game
      const ai = g.ai
      if (!ai) return { hasAI: false }

      g.resources.earn(1, 10000, 10000)

      let paladin = null
      for (let i = 0; i < 300; i++) {
        ai.update(1.0)
        for (const u of g.units) {
          if (u.team === 1 && u.type === 'altar_of_kings' && u.buildProgress < 1 && u.hp > 0) u.buildProgress = 1
          if (u.team === 1 && u.isBuilding && u.trainingQueue.length > 0) u.trainingQueue[0].remaining = 0.001
        }
        g.updateUnits(1.0)
        paladin = g.units.find((u: any) => u.team === 1 && u.type === 'paladin' && u.hp > 0)
        if (paladin) break
      }

      if (!paladin) return { hasAI: true, hasPaladin: false }

      // HL1 + DS1 learned, heroLevel 1 → next HL needs 3, next DS needs 3, DA1 available at 1
      paladin.heroSkillPoints = 1
      paladin.heroLevel = 1
      paladin.abilityLevels = { holy_light: 1, divine_shield: 1 }

      ai.update(1.0)

      return {
        hasAI: true,
        hasPaladin: true,
        hl: paladin.abilityLevels.holy_light ?? 0,
        ds: paladin.abilityLevels.divine_shield ?? 0,
        da: paladin.abilityLevels.devotion_aura ?? 0,
        sp: paladin.heroSkillPoints ?? 0,
      }
    })

    expect(result.hasAI).toBe(true)
    expect(result.hasPaladin).toBe(true)
    expect(result.hl).toBe(1)
    expect(result.ds).toBe(1)
    expect(result.da).toBe(1)  // DA learned after HL+DS at L1
    expect(result.sp).toBe(0)
  })

  test('AI2-4: AI learns Resurrection at hero level 6', async ({ page }) => {
    await waitForRuntime(page)

    const result = await page.evaluate(() => {
      const g = (window as any).__war3Game
      const ai = g.ai
      if (!ai) return { hasAI: false }

      g.resources.earn(1, 10000, 10000)

      let paladin = null
      for (let i = 0; i < 300; i++) {
        ai.update(1.0)
        for (const u of g.units) {
          if (u.team === 1 && u.type === 'altar_of_kings' && u.buildProgress < 1 && u.hp > 0) u.buildProgress = 1
          if (u.team === 1 && u.isBuilding && u.trainingQueue.length > 0) u.trainingQueue[0].remaining = 0.001
        }
        g.updateUnits(1.0)
        paladin = g.units.find((u: any) => u.team === 1 && u.type === 'paladin' && u.hp > 0)
        if (paladin) break
      }

      if (!paladin) return { hasAI: true, hasPaladin: false }

      // All three basic skills at max, heroLevel 6, 1 skill point → Resurrection
      paladin.heroSkillPoints = 1
      paladin.heroLevel = 6
      paladin.abilityLevels = { holy_light: 3, divine_shield: 3, devotion_aura: 3 }

      ai.update(1.0)

      return {
        hasAI: true,
        hasPaladin: true,
        hl: paladin.abilityLevels.holy_light ?? 0,
        ds: paladin.abilityLevels.divine_shield ?? 0,
        da: paladin.abilityLevels.devotion_aura ?? 0,
        res: paladin.abilityLevels.resurrection ?? 0,
        sp: paladin.heroSkillPoints ?? 0,
      }
    })

    expect(result.hasAI).toBe(true)
    expect(result.hasPaladin).toBe(true)
    expect(result.res).toBe(1)
    expect(result.sp).toBe(0)
  })

  test('AI2-5: AI does not learn when dead, no skill points, or level gate not met', async ({ page }) => {
    await waitForRuntime(page)

    const result = await page.evaluate(() => {
      const g = (window as any).__war3Game
      const ai = g.ai
      if (!ai) return { hasAI: false }

      g.resources.earn(1, 10000, 10000)

      let paladin = null
      for (let i = 0; i < 300; i++) {
        ai.update(1.0)
        for (const u of g.units) {
          if (u.team === 1 && u.type === 'altar_of_kings' && u.buildProgress < 1 && u.hp > 0) u.buildProgress = 1
          if (u.team === 1 && u.isBuilding && u.trainingQueue.length > 0) u.trainingQueue[0].remaining = 0.001
        }
        g.updateUnits(1.0)
        paladin = g.units.find((u: any) => u.team === 1 && u.type === 'paladin' && u.hp > 0)
        if (paladin) break
      }

      if (!paladin) return { hasAI: true, hasPaladin: false }

      // Test 1: no skill points
      paladin.heroSkillPoints = 0
      paladin.heroLevel = 1
      paladin.abilityLevels = {}
      ai.update(1.0)
      const noSP = { ...paladin.abilityLevels }

      // Test 2: dead
      paladin.heroSkillPoints = 1
      paladin.isDead = true
      paladin.abilityLevels = {}
      ai.update(1.0)
      const deadLearn = { ...paladin.abilityLevels }
      paladin.isDead = false

      // Test 3: level gate not met (Resurrection needs level 6)
      paladin.heroSkillPoints = 1
      paladin.heroLevel = 5
      paladin.abilityLevels = { holy_light: 3, divine_shield: 3, devotion_aura: 3 }
      ai.update(1.0)
      const levelGateRes = paladin.abilityLevels.resurrection ?? 0

      return { hasAI: true, hasPaladin: true, noSP, deadLearn, levelGateRes }
    })

    expect(result.hasAI).toBe(true)
    expect(result.hasPaladin).toBe(true)
    expect(result.noSP.holy_light ?? 0).toBe(0)
    expect(result.deadLearn.holy_light ?? 0).toBe(0)
    expect(result.levelGateRes).toBe(0)
  })

  test('AI2-6: AI does not cast abilities after learning skills', async ({ page }) => {
    await waitForRuntime(page)

    const result = await page.evaluate(() => {
      const g = (window as any).__war3Game
      const ai = g.ai
      if (!ai) return { hasAI: false }

      g.resources.earn(1, 10000, 10000)

      let paladin = null
      for (let i = 0; i < 300; i++) {
        ai.update(1.0)
        for (const u of g.units) {
          if (u.team === 1 && u.type === 'altar_of_kings' && u.buildProgress < 1 && u.hp > 0) u.buildProgress = 1
          if (u.team === 1 && u.isBuilding && u.trainingQueue.length > 0) u.trainingQueue[0].remaining = 0.001
        }
        g.updateUnits(1.0)
        paladin = g.units.find((u: any) => u.team === 1 && u.type === 'paladin' && u.hp > 0)
        if (paladin) break
      }

      if (!paladin) return { hasAI: true, hasPaladin: false }

      // Set up with skills learned and mana
      paladin.heroLevel = 6
      paladin.heroSkillPoints = 0
      paladin.mana = 500
      paladin.abilityLevels = { holy_light: 3, divine_shield: 3, devotion_aura: 3, resurrection: 1 }

      // Create an injured unit
      const injured = g.spawnUnit('footman', 1, 12, 10)
      injured.hp = 10

      // Run several AI ticks
      for (let i = 0; i < 10; i++) {
        ai.update(1.0)
      }

      // Check that nothing was cast (cooldowns should be 0 if nothing was cast)
      const hlCooldown = paladin.healCooldownUntil ?? 0
      const dsActive = paladin.divineShieldUntil ?? 0
      const resCooldown = paladin.resurrectionCooldownUntil ?? 0

      return {
        hasAI: true,
        hasPaladin: true,
        hlCooldown,
        dsActive,
        resCooldown,
      }
    })

    expect(result.hasAI).toBe(true)
    expect(result.hasPaladin).toBe(true)
    expect(result.hlCooldown).toBe(0)
    expect(result.dsActive).toBe(0)
    expect(result.resCooldown).toBe(0)
  })
})
