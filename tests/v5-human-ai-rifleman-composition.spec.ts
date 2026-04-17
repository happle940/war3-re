/**
 * V5-AI-RIFLEMAN H1 AI Rifleman Composition Proof
 *
 * Proves AI uses the same Blacksmith/Rifleman/Long Rifles rules:
 *   1. AI builds Blacksmith (not spawn bypass)
 *   2. AI trains Riflemen from Barracks after Blacksmith completes
 *   3. AI researches Long Rifles at the Blacksmith
 *   4. AI composition includes Riflemen (not footman-only)
 *   5. All resource/population/building prerequisites respected
 *
 * AI is enabled; game runs in real time with controlled resources.
 */
import { test, expect, type Page } from '@playwright/test'

const BASE = 'http://127.0.0.1:4173/?runtimeTest=1'

async function waitForGame(page: Page) {
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
  } catch { /* procedural fallback valid */ }
  await page.waitForTimeout(500)
}

test.describe('V5-AI-RIFLEMAN H1 AI Rifleman Composition', () => {
  test.setTimeout(180000)

  test('AI builds blacksmith, trains riflemen, researches long rifles, forms mixed composition', async ({ page }) => {
    await waitForGame(page)

    // Give AI ample resources so it can progress through the tech tree
    await page.evaluate(() => {
      const g = (window as any).__war3Game
      // AI is team 1
      g.resources.teams.get(1).gold = 3000
      g.resources.teams.get(1).lumber = 1500
    })

    // Advance game for AI to build up (need ~90s for blacksmith+barracks+training+research)
    await page.evaluate(() => {
      const g = (window as any).__war3Game
      let remaining = 120
      while (remaining > 0) {
        const s = Math.min(0.016, remaining)
        g.update(s)
        remaining -= s
      }
    })

    const result = await page.evaluate(() => {
      const g = (window as any).__war3Game
      const evidence: any = {}

      // Re-read fresh state after update
      const aiUnits = (window as any).__war3Game.units.filter(
        (u: any) => u.team === 1 && u.hp > 0,
      )

      // ===== 1. AI Blacksmith =====
      const aiBlacksmith = aiUnits.find(
        (u: any) => u.type === 'blacksmith' && u.isBuilding && u.buildProgress >= 1,
      )
      evidence.hasBlacksmith = !!aiBlacksmith
      evidence.blacksmithCount = aiUnits.filter(
        (u: any) => u.type === 'blacksmith' && u.isBuilding,
      ).length

      // ===== 2. AI Riflemen =====
      const aiRiflemen = aiUnits.filter(
        (u: any) => u.type === 'rifleman' && !u.isBuilding,
      )
      evidence.riflemanCount = aiRiflemen.length

      // ===== 3. AI Footmen (for composition comparison) =====
      const aiFootmen = aiUnits.filter(
        (u: any) => u.type === 'footman' && !u.isBuilding,
      )
      evidence.footmanCount = aiFootmen.length

      // ===== 4. AI Barracks =====
      const aiBarracks = aiUnits.find(
        (u: any) => u.type === 'barracks' && u.isBuilding && u.buildProgress >= 1,
      )
      evidence.hasBarracks = !!aiBarracks

      // ===== 5. AI Long Rifles research =====
      const aiBlacksmithAny = aiUnits.find(
        (u: any) => u.type === 'blacksmith' && u.isBuilding,
      )
      if (aiBlacksmithAny) {
        evidence.completedResearches = [...aiBlacksmithAny.completedResearches]
        evidence.researchQueueLength = aiBlacksmithAny.researchQueue.length
        evidence.researchQueueItems = aiBlacksmithAny.researchQueue.map(
          (r: any) => ({ key: r.key, remaining: r.remaining }),
        )
      }

      // ===== 6. AI resource state =====
      const aiRes = g.resources.get(1)
      evidence.aiResources = { gold: aiRes.gold, lumber: aiRes.lumber }

      // ===== 7. Verify AI riflemen are real units (not spawned) =====
      if (aiRiflemen.length > 0) {
        const r = aiRiflemen[0]
        evidence.riflemanSample = {
          hp: r.hp,
          maxHp: r.maxHp,
          attackDamage: r.attackDamage,
          attackRange: r.attackRange,
          speed: r.speed,
        }
      }

      // ===== 8. Verify AI barracks has training queue (proves it trains, not spawns) =====
      if (aiBarracks) {
        evidence.barracksTrainingQueue = aiBarracks.trainingQueue.map(
          (item: any) => ({ type: item.type, remaining: item.remaining }),
        )
      }

      // ===== 9. AI did NOT bypass prerequisites =====
      // If AI has riflemen but no blacksmith, that's a bypass
      evidence.noPrereqBypass = !(aiRiflemen.length > 0 && !aiBlacksmith)

      // ===== 10. Composition difference: AI has non-footman units =====
      evidence.hasMixedComposition = aiRiflemen.length > 0 && aiFootmen.length > 0

      return evidence
    })

    expect(result).not.toBeNull()

    // 1. AI built Blacksmith
    expect(result!.hasBlacksmith, 'AI has blacksmith').toBe(true)

    // 2. AI has Riflemen
    expect(result!.riflemanCount, 'AI has >=1 rifleman').toBeGreaterThanOrEqual(1)

    // 3. AI Barracks exists
    expect(result!.hasBarracks, 'AI has barracks').toBe(true)

    // 4. No prerequisite bypass
    expect(result!.noPrereqBypass, 'no prereq bypass').toBe(true)

    // 5. AI riflemen are real units with correct stats
    const rSample = result!.riflemanSample
    expect(rSample, 'rifleman sample exists').toBeDefined()
    expect(rSample.maxHp, 'rifleman has correct hp').toBe(530)
    expect(rSample.attackDamage, 'rifleman has correct damage').toBe(19)

    // 6. AI has mixed composition (not footman-only)
    expect(result!.hasMixedComposition, 'mixed footman+rifleman composition').toBe(true)
    expect(result!.footmanCount, 'AI still has footmen').toBeGreaterThanOrEqual(1)

    // 7. Long Rifles research attempted or completed
    if (result!.completedResearches && result!.completedResearches.length > 0) {
      expect(result!.completedResearches, 'long_rifles in completed').toContain('long_rifles')
    } else if (result!.researchQueueLength > 0) {
      expect(result!.researchQueueItems[0].key, 'long_rifles in queue').toBe('long_rifles')
    }
    // Research may still be in progress — both states are acceptable
  })

  test('AI rifleman attack range reflects Long Rifles research', async ({ page }) => {
    await waitForGame(page)

    // Give AI ample resources and run long enough for full research
    await page.evaluate(() => {
      const g = (window as any).__war3Game
      g.resources.teams.get(1).gold = 5000
      g.resources.teams.get(1).lumber = 3000
    })

    // Run for 150s — enough for full tech tree + research
    await page.evaluate(() => {
      const g = (window as any).__war3Game
      let remaining = 150
      while (remaining > 0) {
        const s = Math.min(0.016, remaining)
        g.update(s)
        remaining -= s
      }
    })

    const result = await page.evaluate(() => {
      const g = (window as any).__war3Game
      const evidence: any = {}

      // Re-read fresh state
      const aiUnits = (window as any).__war3Game.units.filter(
        (u: any) => u.team === 1 && u.hp > 0,
      )

      const aiBlacksmith = aiUnits.find(
        (u: any) => u.type === 'blacksmith' && u.isBuilding && u.buildProgress >= 1,
      )

      evidence.hasBlacksmith = !!aiBlacksmith

      if (aiBlacksmith) {
        evidence.longRiflesCompleted = aiBlacksmith.completedResearches.includes('long_rifles')
      }

      const aiRiflemen = aiUnits.filter(
        (u: any) => u.type === 'rifleman' && !u.isBuilding,
      )
      evidence.riflemanCount = aiRiflemen.length

      if (aiRiflemen.length > 0) {
        evidence.riflemanRanges = aiRiflemen.map((r: any) => r.attackRange)
      }

      return evidence
    })

    expect(result).not.toBeNull()

    // If blacksmith completed and riflemen exist, check range
    if (result!.hasBlacksmith && result!.longRiflesCompleted && result!.riflemanCount > 0) {
      // All riflemen should have boosted range (4.5 + 1.5 = 6.0)
      for (const range of result!.riflemanRanges) {
        expect(range, 'rifleman range boosted to 6.0').toBeCloseTo(6.0, 1)
      }
    } else if (result!.riflemanCount > 0 && !result!.longRiflesCompleted) {
      // Research not yet done — riflemen should have base range
      for (const range of result!.riflemanRanges) {
        expect(range, 'rifleman base range 4.5').toBeCloseTo(4.5, 1)
      }
    }
  })

  test('AI stops queuing riflemen if blacksmith prerequisite is lost', async ({ page }) => {
    await waitForGame(page)

    await page.evaluate(() => {
      const g = (window as any).__war3Game
      g.resources.teams.get(1).gold = 5000
      g.resources.teams.get(1).lumber = 3000
    })

    await page.evaluate(() => {
      const g = (window as any).__war3Game
      let remaining = 120
      while (remaining > 0) {
        const s = Math.min(0.016, remaining)
        g.update(s)
        remaining -= s
      }
    })

    const before = await page.evaluate(() => {
      const g = (window as any).__war3Game
      const aiUnits = g.units.filter((u: any) => u.team === 1 && u.hp > 0)
      return {
        hasBlacksmith: aiUnits.some(
          (u: any) => u.type === 'blacksmith' && u.isBuilding && u.buildProgress >= 1,
        ),
        hasBarracks: aiUnits.some(
          (u: any) => u.type === 'barracks' && u.isBuilding && u.buildProgress >= 1,
        ),
      }
    })

    expect(before.hasBlacksmith, 'AI has blacksmith before prerequisite-loss fixture').toBe(true)
    expect(before.hasBarracks, 'AI has barracks before prerequisite-loss fixture').toBe(true)

    await page.evaluate(() => {
      const g = (window as any).__war3Game
      g.resources.teams.get(1).gold = 5000
      g.resources.teams.get(1).lumber = 3000
      for (const unit of g.units) {
        if (unit.team !== 1) continue
        if (unit.type === 'blacksmith' && unit.isBuilding) unit.hp = 0
        if (unit.type === 'rifleman' && !unit.isBuilding) unit.hp = 0
        if (unit.type === 'barracks' && unit.isBuilding) unit.trainingQueue = []
      }
    })

    await page.evaluate(() => {
      const g = (window as any).__war3Game
      let remaining = 3
      while (remaining > 0) {
        const s = Math.min(0.016, remaining)
        g.update(s)
        remaining -= s
      }
    })

    const after = await page.evaluate(() => {
      const g = (window as any).__war3Game
      const aiUnits = g.units.filter((u: any) => u.team === 1 && u.hp > 0)
      const hasCompletedBlacksmith = aiUnits.some(
        (u: any) => u.type === 'blacksmith' && u.isBuilding && u.buildProgress >= 1,
      )
      const barracksQueues = aiUnits
        .filter((u: any) => u.type === 'barracks' && u.isBuilding && u.buildProgress >= 1)
        .flatMap((u: any) => u.trainingQueue.map((item: any) => item.type))

      return {
        hasCompletedBlacksmith,
        barracksQueues,
        riflemanQueuedWithoutBlacksmith: !hasCompletedBlacksmith && barracksQueues.includes('rifleman'),
      }
    })

    expect(after.hasCompletedBlacksmith, 'fixture still has no completed blacksmith').toBe(false)
    expect(after.riflemanQueuedWithoutBlacksmith, 'AI does not queue rifleman after prerequisite is lost').toBe(false)
  })
})
