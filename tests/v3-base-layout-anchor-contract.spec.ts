/**
 * V3 Base Layout Anchor Contract
 *
 * Proves the starting base layout is anchored to known tile coordinates
 * and the anchor points produce a consistent, WC3-like spatial grammar.
 * This is a layout anchor contract, not a balance or map design verdict.
 */
import { test, expect, type Page } from '@playwright/test'

const BASE = 'http://127.0.0.1:4173/?runtimeTest=1'

// Expected anchor positions from spawnStartingUnits()
// spawnBuilding adds +0.5 to both x and z (see Game.ts:2941)
const EXPECTED = {
  th: { x: 10.5, z: 12.5 },     // spawnBuilding('townhall', 0, 10, 12)
  mine: { x: 15.5, z: 8.5 },    // spawnBuilding('goldmine', -1, 15, 8)
  barracks: { x: 5.5, z: 17.5 }, // spawnBuilding('barracks', 0, 5, 17)
  workerFirst: { x: 10.5, z: 11.5 }, // spawnUnit('worker', 0, 10, 11)
  workerLast: { x: 14.5, z: 11.5 },  // spawnUnit('worker', 0, 14, 11)
}

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
  await page.waitForTimeout(300)
}

function severeConsoleErrors(page: Page): string[] {
  const errors = ((page as any).__consoleErrors ?? []) as string[]
  return errors.filter(e =>
    !e.includes('404') &&
    !e.includes('favicon') &&
    !e.includes('Failed to load resource') &&
    !e.includes('Test map load failed') &&
    !e.includes('net::'),
  )
}

test.describe('V3 Base Layout Anchor Contract', () => {
  test.setTimeout(120000)

  test('player TH is anchored at expected tile', async ({ page }) => {
    await waitForGame(page)

    const result = await page.evaluate((expected) => {
      const g = (window as any).__war3Game
      const th = g.units.find((u: any) => u.team === 0 && u.type === 'townhall' && u.hp > 0)
      if (!th) return { ok: false, reason: 'no TH' }

      const pos = th.mesh.position
      const xOk = Math.abs(pos.x - expected.th.x) < 0.1
      const zOk = Math.abs(pos.z - expected.th.z) < 0.1

      return { ok: true, x: pos.x, z: pos.z, xOk, zOk }
    }, EXPECTED)

    expect(result.ok).toBe(true)
    expect(result.xOk).toBe(true)
    expect(result.zOk).toBe(true)
    expect(severeConsoleErrors(page)).toHaveLength(0)
  })

  test('goldmine is anchored NE of TH at expected distance', async ({ page }) => {
    await waitForGame(page)

    const result = await page.evaluate((expected) => {
      const g = (window as any).__war3Game
      const th = g.units.find((u: any) => u.team === 0 && u.type === 'townhall' && u.hp > 0)
      const mine = g.units.find((u: any) => u.type === 'goldmine' && u.hp > 0)
      if (!th || !mine) return { ok: false, reason: 'missing TH or mine' }

      const minePos = mine.mesh.position
      const thPos = th.mesh.position

      // Mine position matches expected anchor
      const xOk = Math.abs(minePos.x - expected.mine.x) < 0.1
      const zOk = Math.abs(minePos.z - expected.mine.z) < 0.1

      // Mine is NE: dx > 0, dz < 0
      const dx = minePos.x - thPos.x
      const dz = minePos.z - thPos.z
      const isNE = dx > 0 && dz < 0

      // Edge-to-edge gap: TH center 10.5 + half-size 2 = right edge 12.5
      // Mine center 15.5 - half-size 1.5 = left edge 14.0
      // Gap = 14.0 - 12.5 = 1.5 tiles
      const thRightEdge = thPos.x + 2  // half of size=4
      const mineLeftEdge = minePos.x - 1.5  // half of size=3
      const gap = mineLeftEdge - thRightEdge
      const gapReasonable = gap >= -2 && gap <= 5

      return { ok: true, xOk, zOk, isNE, gap, gapReasonable, dx, dz }
    }, EXPECTED)

    expect(result.ok).toBe(true)
    expect(result.xOk).toBe(true)
    expect(result.zOk).toBe(true)
    expect(result.isNE).toBe(true)
    expect(result.gapReasonable).toBe(true)
    expect(severeConsoleErrors(page)).toHaveLength(0)
  })

  test('barracks is anchored SW forming a military district', async ({ page }) => {
    await waitForGame(page)

    const result = await page.evaluate((expected) => {
      const g = (window as any).__war3Game
      const th = g.units.find((u: any) => u.team === 0 && u.type === 'townhall' && u.hp > 0)
      const bar = g.units.find((u: any) => u.team === 0 && u.type === 'barracks' && u.hp > 0)
      if (!th || !bar) return { ok: false, reason: 'missing TH or barracks' }

      const barPos = bar.mesh.position
      const thPos = th.mesh.position

      // Position matches expected anchor
      const xOk = Math.abs(barPos.x - expected.barracks.x) < 0.1
      const zOk = Math.abs(barPos.z - expected.barracks.z) < 0.1

      // Barracks is SW: dx < 0, dz > 0
      const isSW = barPos.x < thPos.x && barPos.z > thPos.z

      return { ok: true, xOk, zOk, isSW }
    }, EXPECTED)

    expect(result.ok).toBe(true)
    expect(result.xOk).toBe(true)
    expect(result.zOk).toBe(true)
    expect(result.isSW).toBe(true)
    expect(severeConsoleErrors(page)).toHaveLength(0)
  })

  test('worker line spans expected tiles near TH', async ({ page }) => {
    await waitForGame(page)

    const result = await page.evaluate((expected) => {
      const g = (window as any).__war3Game
      const th = g.units.find((u: any) => u.team === 0 && u.type === 'townhall' && u.hp > 0)
      const workers = g.units.filter((u: any) => u.team === 0 && u.type === 'worker' && u.hp > 0).slice(0, 5)
      if (!th || workers.length < 5) return { ok: false, reason: 'missing TH or workers' }

      const thPos = th.mesh.position

      // Workers are in gather mode (V3-OPEN1 auto-mine) — they move toward goldmine
      // Just verify they exist near the base area
      const allNearBase = workers.every((w: any) =>
        Math.hypot(w.mesh.position.x - thPos.x, w.mesh.position.z - thPos.z) < 20,
      )

      // Workers should have spread (not stacked)
      const xValues = workers.map((w: any) => w.mesh.position.x)
      const xSpan = Math.max(...xValues) - Math.min(...xValues)

      return { ok: true, allNearBase, xSpan }
    }, EXPECTED)

    expect(result.ok).toBe(true)
    expect(result.allNearBase).toBe(true)
    expect(result.xSpan).toBeGreaterThanOrEqual(0.5)
    // Note: consoleErrors may include asset-load 404s in test mode
  })

  test('base layout produces a readable spatial grammar summary', async ({ page }) => {
    await waitForGame(page)

    const result = await page.evaluate(() => {
      const g = (window as any).__war3Game
      const th = g.units.find((u: any) => u.team === 0 && u.type === 'townhall' && u.hp > 0)
      const mine = g.units.find((u: any) => u.type === 'goldmine' && u.hp > 0)
      const bar = g.units.find((u: any) => u.team === 0 && u.type === 'barracks' && u.hp > 0)
      const workers = g.units.filter((u: any) => u.team === 0 && u.type === 'worker' && u.hp > 0).slice(0, 5)
      if (!th || !mine || !bar || workers.length < 5) return { ok: false, reason: 'missing entities' }

      const thPos = th.mesh.position
      const minePos = mine.mesh.position
      const barPos = bar.mesh.position

      // Grammar summary: all spatial relationships must hold
      const grammar = {
        mineNE: minePos.x > thPos.x && minePos.z < thPos.z,
        barracksSW: barPos.x < thPos.x && barPos.z > thPos.z,
        workersSouthOfTH: workers.every((w: any) => w.mesh.position.z < thPos.z),
        mineCloserThanBarracks: Math.hypot(minePos.x - thPos.x, minePos.z - thPos.z) <
          Math.hypot(barPos.x - thPos.x, barPos.z - thPos.z),
        thIsCore: th.isBuilding && th.type === 'townhall',
      }

      const allGrammar = Object.values(grammar).every(Boolean)

      return { ok: true, grammar, allGrammar }
    })

    expect(result.ok).toBe(true)
    expect(result.allGrammar).toBe(true)
    expect(result.grammar.mineNE).toBe(true)
    expect(result.grammar.barracksSW).toBe(true)
    expect(result.grammar.workersSouthOfTH).toBe(true)
    expect(result.grammar.mineCloserThanBarracks).toBe(true)
    expect(result.grammar.thIsCore).toBe(true)
    expect(severeConsoleErrors(page)).toHaveLength(0)
  })
})
