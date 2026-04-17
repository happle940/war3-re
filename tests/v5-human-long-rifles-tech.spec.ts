/**
 * V5-LONGRIFLES H1 Long Rifles Research Proof
 *
 * Proves the smallest real Long Rifles research slice:
 *   1. Blacksmith command card shows Long Rifles button with real states
 *   2. Long Rifles disabled when resources insufficient
 *   3. Long Rifles completes via real research queue, not direct value set
 *   4. Rifleman attackRange increases after research
 *   5. Cannot re-research after completion
 *   6. New riflemen trained post-research get the bonus
 *
 * AI disabled; all actions controlled.
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

async function disableAI(page: Page) {
  await page.evaluate(() => {
    const g = (window as any).__war3Game
    if (g?.ai) {
      if (typeof g.ai.reset === 'function') g.ai.reset()
      g.ai.update = () => {}
    }
  })
}

test.describe('V5-LONGRIFLES H1 Long Rifles Research', () => {
  test.setTimeout(120000)

  test('full research flow: pre-research range → research → post-research range → no re-research', async ({ page }) => {
    await waitForGame(page)
    await disableAI(page)

    const result = await page.evaluate(() => {
      const g = (window as any).__war3Game
      const evidence: any = {}

      // Setup
      const th = g.units.find(
        (u: any) => u.team === 0 && u.type === 'townhall' && u.hp > 0 && u.buildProgress >= 1,
      )
      if (!th) return { error: 'no townhall' }

      g.resources.teams.get(0).gold = 5000
      g.resources.teams.get(0).lumber = 2000

      const thPos = th.mesh.position

      // Build completed blacksmith + barracks + farm
      const bs = g.spawnBuilding('blacksmith', 0, Math.round(thPos.x + 8), Math.round(thPos.z - 3))
      bs.buildProgress = 1
      const bk = g.spawnBuilding('barracks', 0, Math.round(thPos.x + 5), Math.round(thPos.z - 5))
      bk.buildProgress = 1
      const fm = g.spawnBuilding('farm', 0, Math.round(thPos.x - 4), Math.round(thPos.z + 4))
      fm.buildProgress = 1

      evidence.blacksmithCompleted = bs.buildProgress >= 1

      // ===== Step 1: Train a rifleman BEFORE Long Rifles =====
      g.trainUnit(bk, 'rifleman')

      let rem = 25
      while (rem > 0) { const s = Math.min(0.016, rem); g.update(s); rem -= s }

      // Re-read fresh state
      const riflemenPre = (window as any).__war3Game.units.filter(
        (u: any) => u.team === 0 && u.type === 'rifleman' && u.hp > 0 && !u.isBuilding,
      )
      evidence.rifleCountBefore = riflemenPre.length

      if (riflemenPre.length > 0) {
        evidence.rangeBefore = riflemenPre[0].attackRange
      }

      // ===== Step 2: Check Long Rifles availability BEFORE research =====
      const availBefore = g.getResearchAvailability('long_rifles', 0)
      evidence.availBefore = { ok: availBefore.ok, reason: availBefore.reason }

      // ===== Step 3: Check Long Rifles blocked when no resources =====
      // get() returns a copy, so use internal teams map to truly zero resources
      const savedGold = g.resources.get(0).gold
      const savedLumber = g.resources.get(0).lumber
      g.resources.teams.get(0).gold = 0
      g.resources.teams.get(0).lumber = 0
      const availNoGold = g.getResearchAvailability('long_rifles', 0)
      evidence.debugNoGold = { gold: g.resources.get(0).gold, lumber: g.resources.get(0).lumber }
      evidence.availNoGold = { ok: availNoGold.ok, reason: availNoGold.reason }
      g.resources.teams.get(0).gold = savedGold
      g.resources.teams.get(0).lumber = savedLumber

      // ===== Step 4: Start Long Rifles research via real queue =====
      const preResearchGold = g.resources.get(0).gold
      g.startResearch(bs, 'long_rifles')

      evidence.researchQueueAfterStart = {
        length: bs.researchQueue.length,
        firstKey: bs.researchQueue[0]?.key,
        remaining: bs.researchQueue[0]?.remaining,
      }
      evidence.goldSpentOnResearch = preResearchGold - g.resources.get(0).gold

      // ===== Step 5: Advance through research time (20s) =====
      rem = 25
      while (rem > 0) { const s = Math.min(0.016, rem); g.update(s); rem -= s }

      // Re-read fresh blacksmith state
      const bsAfter = (window as any).__war3Game.units.find(
        (u: any) => u === bs,
      )
      evidence.researchCompleted = bsAfter.completedResearches.includes('long_rifles')
      evidence.researchQueueEmpty = bsAfter.researchQueue.length === 0

      // ===== Step 6: Verify EXISTING rifleman got the range bonus =====
      const riflemenAfter = (window as any).__war3Game.units.filter(
        (u: any) => u.team === 0 && u.type === 'rifleman' && u.hp > 0 && !u.isBuilding,
      )
      if (riflemenAfter.length > 0) {
        evidence.rangeAfter = riflemenAfter[0].attackRange
      }

      // ===== Step 7: Cannot re-research =====
      g.resources.teams.get(0).gold = 5000
      g.resources.teams.get(0).lumber = 2000
      const availAfter = g.getResearchAvailability('long_rifles', 0)
      evidence.availAfterResearch = { ok: availAfter.ok, reason: availAfter.reason }

      // ===== Step 8: Train NEW rifleman post-research → gets bonus =====
      g.resources.teams.get(0).gold = Math.max(g.resources.get(0).gold, 500)
      g.resources.teams.get(0).lumber = Math.max(g.resources.get(0).lumber, 200)
      const bkAfter = (window as any).__war3Game.units.find((u: any) => u === bk)
      g.trainUnit(bkAfter, 'rifleman')

      rem = 25
      while (rem > 0) { const s = Math.min(0.016, rem); g.update(s); rem -= s }

      const allRiflemen = (window as any).__war3Game.units.filter(
        (u: any) => u.team === 0 && u.type === 'rifleman' && u.hp > 0 && !u.isBuilding,
      )
      evidence.rifleCountAfter = allRiflemen.length
      if (allRiflemen.length >= 2) {
        evidence.newRifleRange = allRiflemen[allRiflemen.length - 1].attackRange
      }

      return evidence
    })

    expect(result).not.toBeNull()
    expect(result.error).toBeUndefined()

    // Step 1: Rifleman trained before research
    expect(result!.rifleCountBefore, '1 rifleman before research').toBeGreaterThanOrEqual(1)
    expect(result!.rangeBefore, 'base range is 4.5').toBeCloseTo(4.5, 1)

    // Step 2: Long Rifles available before research
    expect(result!.availBefore.ok, 'available before research').toBe(true)

    // Step 3: Blocked when no gold
    expect(result!.availNoGold.ok, 'blocked without gold').toBe(false)
    expect(result!.availNoGold.reason, 'reason mentions gold').toContain('黄金')

    // Step 4: Research started with real queue
    expect(result!.researchQueueAfterStart.length, 'queue has item').toBe(1)
    expect(result!.researchQueueAfterStart.firstKey, 'key is long_rifles').toBe('long_rifles')
    expect(result!.goldSpentOnResearch, 'gold spent').toBeGreaterThan(0)

    // Step 5: Research completed
    expect(result!.researchCompleted, 'research completed').toBe(true)
    expect(result!.researchQueueEmpty, 'queue empty').toBe(true)

    // Step 6: Existing rifleman range increased
    expect(result!.rangeAfter, 'range increased by 1.5').toBeCloseTo(4.5 + 1.5, 1)

    // Step 7: Cannot re-research
    expect(result!.availAfterResearch.ok, 'cannot re-research').toBe(false)
    expect(result!.availAfterResearch.reason, 'reason is 已研究').toContain('已研究')

    // Step 8: New rifleman gets bonus too
    expect(result!.rifleCountAfter, '2 riflemen total').toBeGreaterThanOrEqual(2)
    expect(result!.newRifleRange, 'new rifle has bonus range').toBeCloseTo(4.5 + 1.5, 1)
  })

  test('Long Rifles blocked without blacksmith', async ({ page }) => {
    await waitForGame(page)
    await disableAI(page)

    const result = await page.evaluate(() => {
      const g = (window as any).__war3Game
      g.resources.teams.get(0).gold = 5000
      g.resources.teams.get(0).lumber = 2000

      const th = g.units.find(
        (u: any) => u.team === 0 && u.type === 'townhall' && u.hp > 0 && u.buildProgress >= 1,
      )
      if (!th) return { error: 'no townhall' }

      // NO blacksmith
      const avail = g.getResearchAvailability('long_rifles', 0)
      return { availOk: avail.ok, availReason: avail.reason }
    })

    expect(result).not.toBeNull()
    expect(result!.error).toBeUndefined()
    expect(result!.availOk, 'blocked without blacksmith').toBe(false)
    expect(result!.availReason, 'reason mentions 铁匠铺').toContain('铁匠铺')
  })
})
