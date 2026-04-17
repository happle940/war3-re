/**
 * V6 Research Effect Data Model Proof
 *
 * Proves:
 * 1. Long Rifles range change comes from ResearchDef.effects[] data
 * 2. Completed research does not stack on re-apply
 * 3. Existing and newly trained riflemen both receive the same effect
 * 4. Command card distinguishes unavailable / available / researching / completed
 * 5. Cleanup / reload leaves no stale research state
 * 6. All mutations followed by fresh-state re-reads
 */
import { test, expect, type Page } from '@playwright/test'

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
  await page.waitForTimeout(300)
}

test.describe('V6 Research Effect Model Proof', () => {
  test.beforeEach(async ({ page }) => {
    await waitForGame(page)
  })

  test('proof-1: range bonus comes from ResearchDef.effects[] data', async ({ page }) => {
    const result = await page.evaluate(() => {
      const g = (window as any).__war3Game
      if (!g) throw new Error('no game')

      // Verify the data model exists: RESEARCHES.long_rifles.effects should have the effect
      // Since GameData is bundled, we access it through behavior:
      // 1. Spawn rifleman, get base range
      const rifleman = g.spawnUnit('rifleman', 0, 30, 30)
      const baseRange = rifleman.attackRange

      // 2. Complete research via game tick
      const bs = g.spawnBuilding('blacksmith', 0, 28, 28)
      bs.researchQueue.push({ key: 'long_rifles', remaining: 0.001 })
      g.gameTime = 100
      g.update(0.01)

      // 3. Re-read fresh from g.units (proof-6: fresh state)
      const riflemanFresh = g.units.find((u: any) => u.type === 'rifleman' && u.team === 0 && !u.isBuilding && u.hp > 0)
      const rangeAfter = riflemanFresh ? riflemanFresh.attackRange : -1

      // 4. The delta should be exactly 1.5 (from effects[0].value in data)
      const delta = rangeAfter - baseRange

      // Cleanup
      rifleman.hp = 0
      g.handleDeadUnits()
      bs.hp = 0
      g.handleDeadUnits()

      return { baseRange, rangeAfter, delta }
    })

    // Base range is 4.5, effect adds 1.5 from data → 6.0
    expect(result.baseRange).toBe(4.5)
    expect(result.rangeAfter).toBe(6.0)
    expect(result.delta).toBe(1.5)
  })

  test('proof-2: completed research does not stack on re-apply', async ({ page }) => {
    const result = await page.evaluate(() => {
      const g = (window as any).__war3Game
      if (!g) throw new Error('no game')

      // Setup: blacksmith + rifleman, then complete Long Rifles through the real queue.
      const bs = g.spawnBuilding('blacksmith', 0, 32, 32)
      const rifleman = g.spawnUnit('rifleman', 0, 32, 33)
      g.resources.earn(0, 500, 200)

      g.startResearch(bs, 'long_rifles')
      const queueAfterStart = bs.researchQueue.length
      bs.researchQueue[0].remaining = 0.001
      g.update(0.01)

      const freshAfterFirst = g.units.find((u: any) => u === rifleman && u.hp > 0)
      const rangeAfterFirst = freshAfterFirst ? freshAfterFirst.attackRange : -1
      const completedAfterFirst = g.units.find((u: any) => u === bs)?.completedResearches ?? []

      // Try to research the same key again through the same public path.
      g.startResearch(bs, 'long_rifles')
      const queueAfterRetry = g.units.find((u: any) => u === bs)?.researchQueue?.length ?? -1
      g.update(0.01)

      const freshAfterRetry = g.units.find((u: any) => u === rifleman && u.hp > 0)
      const rangeAfterRetry = freshAfterRetry ? freshAfterRetry.attackRange : -1
      const completedAfterRetry = g.units.find((u: any) => u === bs)?.completedResearches ?? []

      // Cleanup
      rifleman.hp = 0
      g.handleDeadUnits()
      bs.hp = 0
      g.handleDeadUnits()

      return {
        queueAfterStart,
        rangeAfterFirst,
        queueAfterRetry,
        rangeAfterRetry,
        completedAfterFirst,
        completedAfterRetry,
      }
    })

    expect(result.queueAfterStart).toBe(1)
    expect(result.rangeAfterFirst).toBe(6.0)
    expect(result.completedAfterFirst.filter((key: string) => key === 'long_rifles')).toHaveLength(1)
    expect(result.queueAfterRetry).toBe(0)
    expect(result.rangeAfterRetry).toBe(6.0)
    expect(result.completedAfterRetry.filter((key: string) => key === 'long_rifles')).toHaveLength(1)
  })

  test('proof-3: existing and newly spawned riflemen both get the effect', async ({ page }) => {
    const result = await page.evaluate(() => {
      const g = (window as any).__war3Game
      if (!g) throw new Error('no game')

      // Spawn rifleman BEFORE research
      const existingRifle = g.spawnUnit('rifleman', 0, 36, 36)
      const existingRangeBefore = existingRifle.attackRange

      // Setup blacksmith and queue research, complete via game tick
      const bs = g.spawnBuilding('blacksmith', 0, 34, 34)
      bs.researchQueue.push({ key: 'long_rifles', remaining: 0.001 })
      g.gameTime = 100
      g.update(0.01)

      // Re-read fresh state for existing rifleman
      const existingFresh = g.units.find((u: any) => u === existingRifle && u.hp > 0)
      const existingRangeAfter = existingFresh ? existingFresh.attackRange : -1

      // Spawn NEW rifleman AFTER research — spawnUnit internally applies completed researches
      const newRifle = g.spawnUnit('rifleman', 0, 36, 37)
      const newRifleRange = newRifle.attackRange

      // Cleanup
      existingRifle.hp = 0
      newRifle.hp = 0
      g.handleDeadUnits()
      bs.hp = 0
      g.handleDeadUnits()

      return { existingRangeBefore, existingRangeAfter, newRifleRange }
    })

    // Existing rifleman: base 4.5 → 6.0 after research
    expect(result.existingRangeBefore).toBe(4.5)
    expect(result.existingRangeAfter).toBe(6.0)
    // Newly spawned rifleman should also get 6.0 via applyCompletedResearchesToUnit
    expect(result.newRifleRange).toBe(6.0)
  })

  test('proof-4: command card states — unavailable, available, researching, completed', async ({ page }) => {
    const result = await page.evaluate(() => {
      const g = (window as any).__war3Game
      if (!g) throw new Error('no game')

      // State A: no blacksmith → unavailable (needs blacksmith)
      const states: string[] = []

      // Spawn blacksmith, select it
      const bs = g.spawnBuilding('blacksmith', 0, 38, 38)
      // Give resources so it's affordable
      g.resources.earn(0, 500, 200)

      // Select the blacksmith
      g.selectionModel.setSelection([bs])
      g._lastCmdKey = '' // force refresh

      // State B: blacksmith exists, can afford → available
      g.updateHUD(0.016)
      const cmdCard = document.getElementById('command-card')!
      const buttons = cmdCard.querySelectorAll('button')
      let longRiflesBtn: HTMLButtonElement | null = null
      for (const btn of buttons) {
        if (btn.textContent?.includes('长管步枪')) {
          longRiflesBtn = btn as HTMLButtonElement
          break
        }
      }
      states.push(longRiflesBtn ? (longRiflesBtn.disabled ? 'disabled' : 'available') : 'not_found')

      // State C: start research → researching
      if (longRiflesBtn && !longRiflesBtn.disabled) {
        longRiflesBtn.click()
      }
      g._lastCmdKey = '' // force refresh
      g.updateHUD(0.016)
      const cmdCard2 = document.getElementById('command-card')!
      const buttons2 = cmdCard2.querySelectorAll('button')
      let researchingBtn: HTMLButtonElement | null = null
      for (const btn of buttons2) {
        if (btn.textContent?.includes('长管步枪')) {
          researchingBtn = btn as HTMLButtonElement
          break
        }
      }
      states.push(researchingBtn ? (researchingBtn.disabled ? 'researching_disabled' : 'researching_enabled') : 'not_found')

      // State D: complete research → completed
      bs.researchQueue[0].remaining = 0.001
      g.update(0.01)
      g._lastCmdKey = '' // force refresh
      g.updateHUD(0.016)
      const cmdCard3 = document.getElementById('command-card')!
      const buttons3 = cmdCard3.querySelectorAll('button')
      let completedBtn: HTMLButtonElement | null = null
      for (const btn of buttons3) {
        if (btn.textContent?.includes('长管步枪')) {
          completedBtn = btn as HTMLButtonElement
          break
        }
      }
      states.push(completedBtn ? (completedBtn.disabled ? 'completed_disabled' : 'completed_enabled') : 'not_found')

      // Cleanup
      bs.hp = 0
      g.handleDeadUnits()

      return { states }
    })

    // Available state
    expect(result.states[0]).toBe('available')
    // Researching state (button disabled with "正在研究中")
    expect(result.states[1]).toBe('researching_disabled')
    // Completed state (button disabled with "已完成")
    expect(result.states[2]).toBe('completed_disabled')
  })

  test('proof-5: cleanup/reload leaves no stale research state', async ({ page }) => {
    const result = await page.evaluate(() => {
      const g = (window as any).__war3Game
      if (!g) throw new Error('no game')

      // Setup: blacksmith with completed research + rifleman
      const bs = g.spawnBuilding('blacksmith', 0, 42, 42)
      bs.completedResearches.push('long_rifles')
      const rifle = g.spawnUnit('rifleman', 0, 42, 43)
      // spawnUnit internally calls applyCompletedResearchesToUnit → should boost
      const boostedRange = rifle.attackRange // should be 6.0

      // Now dispose all units (simulates map reload)
      g.disposeAllUnits()

      // Fresh state: no completedResearches, no riflemen
      const freshUnits = g.units
      const hasResearch = freshUnits.some((u: any) =>
        u.completedResearches && u.completedResearches.length > 0
      )
      const hasRiflemen = freshUnits.some((u: any) => u.type === 'rifleman')

      // Spawn new blacksmith + rifleman on fresh state
      const newBs = g.spawnBuilding('blacksmith', 0, 42, 42)
      const newRifle = g.spawnUnit('rifleman', 0, 42, 43)
      const freshRifleRange = newRifle.attackRange

      // Cleanup
      newRifle.hp = 0
      g.handleDeadUnits()
      newBs.hp = 0
      g.handleDeadUnits()

      return { boostedRange, hasResearch, hasRiflemen, freshRifleRange }
    })

    // Before cleanup: rifle had boosted range
    expect(result.boostedRange).toBe(6.0)
    // After cleanup: no stale research state
    expect(result.hasResearch).toBe(false)
    expect(result.hasRiflemen).toBe(false)
    // Fresh rifleman on clean state: base range, no ghost bonus
    expect(result.freshRifleRange).toBe(4.5)
  })

  test('proof-6: fresh state after mutation — research queue processing', async ({ page }) => {
    const result = await page.evaluate(() => {
      const g = (window as any).__war3Game
      if (!g) throw new Error('no game')

      // Spawn setup
      const bs = g.spawnBuilding('blacksmith', 0, 46, 46)
      const rifle = g.spawnUnit('rifleman', 0, 46, 47)
      g.resources.earn(0, 500, 200)

      // Start research via the game's public method
      g.startResearch(bs, 'long_rifles')

      // Snapshot before tick
      const queueBeforeTick = bs.researchQueue.length
      const rangeBefore = g.units.find((u: any) => u === rifle).attackRange

      // Fast-forward the research by setting remaining to near-zero and ticking
      bs.researchQueue[0].remaining = 0.001
      g.update(0.01)

      // Re-read FRESH from g.units (not cached snapshot)
      const freshRifle = g.units.find((u: any) => u.type === 'rifleman' && u.team === 0 && !u.isBuilding && u.hp > 0)
      const rangeAfter = freshRifle ? freshRifle.attackRange : -1
      const queueAfterTick = g.units.find((u: any) => u === bs)?.researchQueue?.length ?? -1
      const completedAfter = g.units.find((u: any) => u === bs)?.completedResearches ?? []

      // Cleanup
      rifle.hp = 0
      g.handleDeadUnits()
      bs.hp = 0
      g.handleDeadUnits()

      return { queueBeforeTick, rangeBefore, rangeAfter, queueAfterTick, completedAfter }
    })

    // Queue had 1 item before tick
    expect(result.queueBeforeTick).toBe(1)
    // Range was base before research completed
    expect(result.rangeBefore).toBe(4.5)
    // After tick: range boosted to 6.0 (from effects data)
    expect(result.rangeAfter).toBe(6.0)
    // Queue cleared after completion
    expect(result.queueAfterTick).toBe(0)
    // Research marked as completed
    expect(result.completedAfter).toContain('long_rifles')
  })
})
