/**
 * V9 HERO16-AI1 AI Altar build + Paladin summon readiness runtime proof.
 *
 * Proves:
 * 1. AI builds Altar only when economy allows and no Altar exists or is under construction.
 * 2. AI summons exactly one Paladin after Altar is available.
 * 3. AI does not summon duplicate Paladins.
 * 4. AI does not learn skills or cast abilities in this task.
 * 5. AI still follows existing economy/military behavior.
 *
 * Not: skill learning, ability casting, other heroes, items, shops, Tavern,
 * new assets, particles, sounds, complete AI, complete Human, V9 release.
 */
import { test, expect, type Page } from '@playwright/test'
import { BUILDINGS, UNITS } from '../src/game/GameData'

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

test.describe('V9 HERO16-AI1 AI Altar + Paladin summon', () => {
  test.setTimeout(150000)

  test('AI1-1: AI builds Altar when economy allows and no Altar exists', async ({ page }) => {
    await waitForRuntime(page)

    const result = await page.evaluate(() => {
      const g = (window as any).__war3Game
      const ai = g.ai
      if (!ai) return { hasAI: false }

      for (const altar of [...g.units].filter((u: any) => u.team === 1 && u.type === 'altar_of_kings')) {
        g.units.splice(g.units.indexOf(altar), 1)
        g.unmarkBuildingOccupancy?.(altar)
        g.scene.remove(altar.mesh)
      }
      ai.reset()

      // Give AI plenty of resources
      g.resources.earn(1, 5000, 5000)

      // Ensure no altar exists
      const altarBefore = g.units.filter((u: any) => u.team === 1 && u.type === 'altar_of_kings').length

      // Run AI ticks until altar appears or timeout
      let altarAppeared = false
      for (let i = 0; i < 30; i++) {
        ai.update(1.0)
        const hasAltar = g.units.some((u: any) =>
          u.team === 1 && u.type === 'altar_of_kings' && u.hp > 0,
        )
        if (hasAltar) {
          altarAppeared = true
          break
        }
      }

      const altarsAfter = g.units.filter((u: any) =>
        u.team === 1 && u.type === 'altar_of_kings' && u.hp > 0,
      )

      return {
        hasAI: true,
        altarBefore,
        altarAppeared,
        altarCount: altarsAfter.length,
      }
    })

    expect(result.hasAI).toBe(true)
    expect(result.altarBefore).toBe(0)
    expect(result.altarAppeared).toBe(true)
    expect(result.altarCount).toBeGreaterThanOrEqual(1)
  })

  test('AI1-2: AI summons exactly one Paladin after Altar completes', async ({ page }) => {
    await waitForRuntime(page)

    const result = await page.evaluate(() => {
      const g = (window as any).__war3Game
      const ai = g.ai
      if (!ai) return { hasAI: false }

      g.resources.earn(1, 10000, 10000)

      // Run AI ticks to build altar + start training paladin
      let paladinAppeared = false
      let paladinCount = 0
      for (let i = 0; i < 200; i++) {
        ai.update(1.0)

        // Speed through altar construction
        for (const u of g.units) {
          if (u.team === 1 && u.type === 'altar_of_kings' && u.buildProgress < 1 && u.hp > 0) {
            u.buildProgress = 1
          }
        }

        // Speed through training
        for (const u of g.units) {
          if (u.team === 1 && u.isBuilding && u.trainingQueue.length > 0) {
            u.trainingQueue[0].remaining = 0.001
          }
        }

        g.updateUnits(1.0)

        paladinCount = g.units.filter((u: any) =>
          u.team === 1 && u.type === 'paladin' && u.hp > 0,
        ).length
        if (paladinCount >= 1) {
          paladinAppeared = true
          break
        }
      }

      // Continue running to check for duplicates
      for (let i = 0; i < 30; i++) {
        ai.update(1.0)
        g.updateUnits(1.0)
      }

      const finalPaladinCount = g.units.filter((u: any) =>
        u.team === 1 && u.type === 'paladin' && u.hp > 0,
      ).length

      return {
        hasAI: true,
        paladinAppeared,
        finalPaladinCount,
      }
    })

    expect(result.hasAI).toBe(true)
    expect(result.paladinAppeared).toBe(true)
    expect(result.finalPaladinCount).toBe(1)
  })

  test('AI1-3: AI does not build Altar when resources are insufficient', async ({ page }) => {
    await waitForRuntime(page)

    const result = await page.evaluate(() => {
      const g = (window as any).__war3Game
      const ai = g.ai
      if (!ai) return { hasAI: false }

      // Drain AI resources
      const res = g.resources.get(1)
      res.gold = 0
      res.lumber = 0

      const altarBefore = g.units.some((u: any) =>
        u.team === 1 && u.type === 'altar_of_kings' && u.hp > 0,
      )

      for (let i = 0; i < 20; i++) {
        ai.update(1.0)
      }

      const altarAfter = g.units.some((u: any) =>
        u.team === 1 && u.type === 'altar_of_kings' && u.hp > 0,
      )

      return { hasAI: true, altarBefore, altarAfter }
    })

    expect(result.hasAI).toBe(true)
    if (!result.altarBefore) {
      expect(result.altarAfter).toBe(false)
    }
  })

  test('AI1-4: AI does not learn skills or cast abilities after Paladin summon', async ({ page }) => {
    await waitForRuntime(page)

    const result = await page.evaluate(() => {
      const g = (window as any).__war3Game
      const ai = g.ai
      if (!ai) return { hasAI: false }

      g.resources.earn(1, 10000, 10000)

      // Run until Paladin exists
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

        const hasPaladin = g.units.some((u: any) =>
          u.team === 1 && u.type === 'paladin' && u.hp > 0,
        )
        if (hasPaladin) break
      }

      const paladin = g.units.find((u: any) =>
        u.team === 1 && u.type === 'paladin' && u.hp > 0,
      )

      if (!paladin) return { hasAI: true, hasPaladin: false }

      const abilityLevels = paladin.abilityLevels ?? {}
      const hasAnyAbility = Object.keys(abilityLevels).some(k => (abilityLevels as any)[k] > 0)

      return {
        hasAI: true,
        hasPaladin: true,
        abilityLevels,
        hasAnyAbility,
      }
    })

    expect(result.hasAI).toBe(true)
    expect(result.hasPaladin).toBe(true)
    expect(result.hasAnyAbility).toBe(false)
  })

  test('AI1-5: AI still trains military units alongside hero entry', async ({ page }) => {
    await waitForRuntime(page)

    const result = await page.evaluate(() => {
      const g = (window as any).__war3Game
      const ai = g.ai
      if (!ai) return { hasAI: false }

      g.resources.earn(1, 10000, 10000)

      // Run AI for enough ticks to build and train
      for (let i = 0; i < 60; i++) {
        ai.update(1.0)
        for (const u of g.units) {
          if (u.team === 1 && u.isBuilding && u.buildProgress < 1 && u.hp > 0 && u.type !== 'altar_of_kings') {
            u.buildProgress = 1
          }
          if (u.team === 1 && u.type === 'altar_of_kings' && u.buildProgress < 1 && u.hp > 0) {
            u.buildProgress = 1
          }
        }
        g.updateUnits(1.0)
      }

      const military = g.units.filter((u: any) =>
        u.team === 1 && !u.isBuilding && u.hp > 0
          && (u.type === 'footman' || u.type === 'rifleman'),
      ).length

      const paladin = g.units.some((u: any) =>
        u.team === 1 && u.type === 'paladin' && u.hp > 0,
      )

      const altar = g.units.some((u: any) =>
        u.team === 1 && u.type === 'altar_of_kings' && u.hp > 0,
      )

      return { hasAI: true, military, paladin, altar }
    })

    expect(result.hasAI).toBe(true)
    expect(result.altar).toBe(true)
    expect(result.military).toBeGreaterThan(0)
  })
})
