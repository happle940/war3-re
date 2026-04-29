/**
 * V9 HERO22-AI5 AI Archmage Blizzard cast runtime proof.
 *
 * Proves:
 * 1. AI Archmage with Blizzard learned, enough mana, no cooldown, no active channel,
 *    and at least 3 clustered enemy units can start a Blizzard channel.
 * 2. No cast when Blizzard is unlearned.
 * 3. No cast when mana insufficient, cooldown active, Archmage dead, or no valid cluster.
 * 4. No cast into a friendly-dense zone (FRIENDLY_MAX_IN_ZONE exceeded).
 * 5. No cast for a single enemy (below ENEMY_CLUSTER_MIN = 3).
 * 6. AI1 / AI2 / AI3 tests remain green (checked via separate spec files).
 *
 * Not: Mass Teleport AI, retreat/regroup, scouting, focus fire, full target scoring,
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

test.describe('V9 HERO22-AI5 AI Archmage Blizzard cast', () => {
  test.setTimeout(150000)

  test('AM-AI5-1: AI Archmage with Blizzard learned can start channel on enemy cluster', async ({ page }) => {
    await waitForRuntime(page)

    const result = await page.evaluate(async () => {
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

      // Set up: Blizzard learned, full mana, no cooldown, no skill points
      if (!archmage.abilityLevels) archmage.abilityLevels = {}
      archmage.abilityLevels.blizzard = 1
      archmage.heroLevel = 3
      archmage.heroSkillPoints = 0
      archmage.mana = 300
      archmage.maxMana = 300
      archmage.blizzardCooldownUntil = 0

      // Place 4 enemy units close together (cluster) within range
      units = g.units
      const enemies = units.filter((u: any) => u.team !== 1 && u.hp > 0 && !u.isBuilding)
      let placed = 0
      for (const e of enemies) {
        if (placed >= 4) break
        e.mesh.position.x = archmage.mesh.position.x + 4
        e.mesh.position.z = archmage.mesh.position.z + (placed - 1.5) * 0.5
        placed++
      }

      if (placed < 3) return { hasAI: true, hasArchmage: true, enoughEnemies: false }

      // Run AI tick — should attempt Blizzard
      ai.update(1.0)
      g.updateUnits(1.0)

      // Check for active blizzard channel
      const hasChannel = !!g.blizzardChannel && g.blizzardChannel.caster === archmage

      return {
        hasAI: true,
        hasArchmage: true,
        enoughEnemies: true,
        hasChannel,
      }
    })

    expect(result.hasAI).toBe(true)
    expect(result.hasArchmage).toBe(true)
    expect(result.enoughEnemies).toBe(true)
    expect(result.hasChannel).toBe(true)
  })

  test('AM-AI5-2: No cast when Blizzard is unlearned', async ({ page }) => {
    await waitForRuntime(page)

    const result = await page.evaluate(async () => {
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

      // Explicitly: no Blizzard learned, no skill points to learn anything
      archmage.heroLevel = 3
      archmage.heroSkillPoints = 0
      archmage.abilityLevels = { ...(archmage.abilityLevels ?? {}), water_elemental: 1 }
      delete archmage.abilityLevels.blizzard
      archmage.mana = 300
      archmage.blizzardCooldownUntil = 0

      // Place enemy cluster
      units = g.units
      const enemies = units.filter((u: any) => u.team !== 1 && u.hp > 0 && !u.isBuilding)
      let placed = 0
      for (const e of enemies) {
        if (placed >= 4) break
        e.mesh.position.x = archmage.mesh.position.x + 4
        e.mesh.position.z = archmage.mesh.position.z + (placed - 1.5) * 0.5
        placed++
      }

      // Run AI ticks
      for (let i = 0; i < 5; i++) {
        ai.update(1.0)
        g.updateUnits(1.0)
      }

      const hasChannel = !!g.blizzardChannel

      return { hasAI: true, hasArchmage: true, hasChannel }
    })

    expect(result.hasAI).toBe(true)
    expect(result.hasArchmage).toBe(true)
    expect(result.hasChannel).toBe(false)
  })

  test('AM-AI5-3: No cast when mana insufficient, cooldown active, or Archmage dead', async ({ page }) => {
    await waitForRuntime(page)

    const result = await page.evaluate(async () => {
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

      // Set up Archmage with Blizzard learned
      let units = g.units
      const archmage = units.find((u: any) => u.team === 1 && u.type === 'archmage' && u.hp > 0)
      if (!archmage) return { hasAI: true, hasArchmage: false }

      if (!archmage.abilityLevels) archmage.abilityLevels = {}
      archmage.abilityLevels.blizzard = 1
      archmage.heroLevel = 3
      archmage.heroSkillPoints = 0
      archmage.maxMana = 300

      // Place enemy cluster
      units = g.units
      const enemies = units.filter((u: any) => u.team !== 1 && u.hp > 0 && !u.isBuilding)
      const am = units.find((u: any) => u.team === 1 && u.type === 'archmage' && u.hp > 0)
      let placed = 0
      for (const e of enemies) {
        if (placed >= 4) break
        if (am) {
          e.mesh.position.x = am.mesh.position.x + 4
          e.mesh.position.z = am.mesh.position.z + (placed - 1.5) * 0.5
        }
        placed++
      }

      // --- Test 1: Low mana ---
      archmage.mana = 10 // too low for Blizzard (costs 75)
      archmage.blizzardCooldownUntil = 0

      for (let i = 0; i < 5; i++) {
        ai.update(1.0)
        g.updateUnits(1.0)
      }

      const channelAfterLowMana = !!g.blizzardChannel

      // --- Test 2: Cooldown active ---
      units = g.units
      const am2 = units.find((u: any) => u.team === 1 && u.type === 'archmage' && u.hp > 0)
      if (am2) {
        am2.mana = 300
        am2.blizzardCooldownUntil = 9999
      }

      for (let i = 0; i < 5; i++) {
        ai.update(1.0)
        g.updateUnits(1.0)
      }

      const channelAfterCooldown = !!g.blizzardChannel

      // --- Test 3: Dead Archmage ---
      units = g.units
      const am3 = units.find((u: any) => u.team === 1 && u.type === 'archmage')
      if (am3) {
        am3.hp = 0
        am3.isDead = true
        am3.mana = 300
        am3.blizzardCooldownUntil = 0
      }

      for (let i = 0; i < 5; i++) {
        ai.update(1.0)
        g.updateUnits(1.0)
      }

      const channelAfterDead = !!g.blizzardChannel

      return {
        hasAI: true,
        hasArchmage: true,
        channelAfterLowMana,
        channelAfterCooldown,
        channelAfterDead,
      }
    })

    expect(result.hasAI).toBe(true)
    expect(result.hasArchmage).toBe(true)
    expect(result.channelAfterLowMana).toBe(false)
    expect(result.channelAfterCooldown).toBe(false)
    expect(result.channelAfterDead).toBe(false)
  })

  test('AM-AI5-4: No cast into friendly-dense zone', async ({ page }) => {
    await waitForRuntime(page)

    const result = await page.evaluate(async () => {
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

      // Set up Blizzard learned, full mana, no cooldown
      if (!archmage.abilityLevels) archmage.abilityLevels = {}
      archmage.abilityLevels.blizzard = 1
      archmage.heroLevel = 3
      archmage.heroSkillPoints = 0
      archmage.mana = 300
      archmage.maxMana = 300
      archmage.blizzardCooldownUntil = 0

      // Place 4 enemy units in a cluster within range
      units = g.units
      const enemies = units.filter((u: any) => u.team !== 1 && u.hp > 0 && !u.isBuilding)
      const clusterX = archmage.mesh.position.x + 4
      const clusterZ = archmage.mesh.position.z
      let placed = 0
      for (const e of enemies) {
        if (placed >= 4) break
        e.mesh.position.x = clusterX
        e.mesh.position.z = clusterZ + (placed - 1.5) * 0.5
        placed++
      }

      // Place 3 friendly non-building units near the same cluster (exceeds FRIENDLY_MAX_IN_ZONE = 2)
      units = g.units
      const friendlies = units.filter(
        (u: any) => u.team === 1 && u.hp > 0 && !u.isBuilding && u.type !== 'archmage' && u.type !== 'goldmine',
      )
      let friendlyPlaced = 0
      for (const f of friendlies) {
        if (friendlyPlaced >= 3) break
        f.mesh.position.x = clusterX + 1
        f.mesh.position.z = clusterZ + friendlyPlaced * 0.5
        friendlyPlaced++
      }

      // Run AI ticks — should NOT cast Blizzard due to friendly density
      for (let i = 0; i < 5; i++) {
        ai.update(1.0)
        g.updateUnits(1.0)
      }

      const hasChannel = !!g.blizzardChannel

      return { hasAI: true, hasArchmage: true, hasChannel }
    })

    expect(result.hasAI).toBe(true)
    expect(result.hasArchmage).toBe(true)
    expect(result.hasChannel).toBe(false)
  })

  test('AM-AI5-5: No cast for single enemy (below ENEMY_CLUSTER_MIN)', async ({ page }) => {
    await waitForRuntime(page)

    const result = await page.evaluate(async () => {
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

      // Set up Blizzard learned, full mana, no cooldown
      if (!archmage.abilityLevels) archmage.abilityLevels = {}
      archmage.abilityLevels.blizzard = 1
      archmage.heroLevel = 3
      archmage.heroSkillPoints = 0
      archmage.mana = 300
      archmage.maxMana = 300
      archmage.blizzardCooldownUntil = 0

      // Kill all enemy non-building units except 1 (below cluster min of 3)
      units = g.units
      let surviving = 0
      for (const u of units) {
        if (u.team !== 1 && u.hp > 0 && !u.isBuilding) {
          if (surviving < 1) {
            // Keep one, move it within range
            u.mesh.position.x = archmage.mesh.position.x + 4
            u.mesh.position.z = archmage.mesh.position.z
            surviving++
          } else {
            u.hp = 0
            u.isDead = true
          }
        }
      }

      // Run AI ticks — should NOT cast Blizzard (only 1 enemy)
      for (let i = 0; i < 5; i++) {
        ai.update(1.0)
        g.updateUnits(1.0)
      }

      const hasChannel = !!g.blizzardChannel

      return { hasAI: true, hasArchmage: true, hasChannel }
    })

    expect(result.hasAI).toBe(true)
    expect(result.hasArchmage).toBe(true)
    expect(result.hasChannel).toBe(false)
  })
})
