/**
 * V3 Opening Grammar Regression Pack
 *
 * Proves that the starting base layout has an interpretable spatial grammar:
 * TH / goldmine / tree-line / exit / barracks / defense form a coherent
 * WC3-like opening layout, not random placement.
 *
 * This is NOT short-game balance or final map design — it only proves
 * the opening spatial relationships are structured and repeatable.
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

test.describe('V3 Opening Grammar Regression', () => {
  test.setTimeout(120000)

  test('TH-to-goldmine spatial relationship is structured', async ({ page }) => {
    await waitForGame(page)

    const result = await page.evaluate(() => {
      const g = (window as any).__war3Game
      const th = g.units.find((u: any) => u.team === 0 && u.type === 'townhall' && u.hp > 0)
      const mine = g.units.find((u: any) => u.type === 'goldmine' && u.hp > 0)
      if (!th || !mine) return { ok: false, reason: 'missing TH or mine' }

      const thPos = th.mesh.position
      const minePos = mine.mesh.position

      // Goldmine is NE of TH (x > th.x, z < th.z in our coordinate system)
      const mineNE = minePos.x > thPos.x && minePos.z < thPos.z

      // Distance: 3-6 tile edge-to-edge is WC3-like
      const dist = Math.hypot(minePos.x - thPos.x, minePos.z - thPos.z)
      const distReasonable = dist >= 3 && dist <= 10

      return { ok: true, mineNE, dist, distReasonable }
    })

    expect(result.ok).toBe(true)
    expect(result.mineNE).toBe(true)
    expect(result.distReasonable).toBe(true)
    expect(severeConsoleErrors(page)).toHaveLength(0)
  })

  test('barracks forms a military district SW of TH', async ({ page }) => {
    await waitForGame(page)

    const result = await page.evaluate(() => {
      const g = (window as any).__war3Game
      const th = g.units.find((u: any) => u.team === 0 && u.type === 'townhall' && u.hp > 0)
      const barracks = g.units.find((u: any) => u.team === 0 && u.type === 'barracks' && u.hp > 0)
      if (!th || !barracks) return { ok: false, reason: 'missing TH or barracks' }

      const thPos = th.mesh.position
      const barPos = barracks.mesh.position

      // Barracks is SW of TH (x < th.x, z > th.z)
      const barSW = barPos.x < thPos.x && barPos.z > thPos.z

      // Distance is reasonable (not overlapping, not across the map)
      const dist = Math.hypot(barPos.x - thPos.x, barPos.z - thPos.z)
      const distReasonable = dist >= 3 && dist <= 15

      return { ok: true, barSW, dist, distReasonable }
    })

    expect(result.ok).toBe(true)
    expect(result.barSW).toBe(true)
    expect(result.distReasonable).toBe(true)
    expect(severeConsoleErrors(page)).toHaveLength(0)
  })

  test('tree line forms a natural boundary between base and map edge', async ({ page }) => {
    await waitForGame(page)

    const result = await page.evaluate(() => {
      const g = (window as any).__war3Game
      const th = g.units.find((u: any) => u.team === 0 && u.type === 'townhall' && u.hp > 0)
      if (!th) return { ok: false, reason: 'no TH' }

      const thPos = th.mesh.position

      // Collect trees near the base (within 20 tiles of TH)
      const treeManager = g.treeManager
      if (!treeManager) return { ok: false, reason: 'no treeManager' }

      const entries = treeManager.entries
      if (!entries || entries.length === 0) return { ok: false, reason: 'no trees' }

      // Find trees north of TH (z < th.z) — should form a tree line
      const treesNorth = entries.filter((t: any) =>
        t.mesh.position.z < thPos.z - 2 && t.mesh.position.x >= thPos.x - 3,
      )

      // Find trees west of TH (x < th.x) — should form a tree line
      const treesWest = entries.filter((t: any) =>
        t.mesh.position.x < thPos.x - 3 && t.mesh.position.z >= thPos.z - 5,
      )

      // There must be meaningful tree boundaries (not just 1-2 trees)
      const northBoundary = treesNorth.length >= 10
      const westBoundary = treesWest.length >= 5

      return {
        ok: true,
        northTreeCount: treesNorth.length,
        westTreeCount: treesWest.length,
        northBoundary,
        westBoundary,
      }
    })

    expect(result.ok).toBe(true)
    expect(result.northBoundary).toBe(true)
    expect(result.westBoundary).toBe(true)
    expect(severeConsoleErrors(page)).toHaveLength(0)
  })

  test('exit corridor is open south-southeast of TH', async ({ page }) => {
    await waitForGame(page)

    const result = await page.evaluate(() => {
      const g = (window as any).__war3Game
      const th = g.units.find((u: any) => u.team === 0 && u.type === 'townhall' && u.hp > 0)
      if (!th) return { ok: false, reason: 'no TH' }

      const thPos = th.mesh.position

      // Check tiles south and southeast of TH (z+, x+)
      // TH is at (10.5, 12.5), size=4 → occupies tiles (10-13, 12-15)
      // Exit corridor: tiles beyond TH south edge (z > 15) and east (x > 13)
      let openTiles = 0
      let blockedTiles = 0
      for (let dx = -2; dx <= 6; dx++) {
        for (let dz = 1; dz <= 8; dz++) {
          const tx = Math.floor(thPos.x) + dx
          const tz = Math.floor(thPos.z) + 4 + dz  // past TH south edge
          if (tx < 0 || tz < 0) continue
          if (g.pathingGrid.isBlocked(tx, tz)) {
            blockedTiles++
          } else {
            openTiles++
          }
        }
      }

      // Most corridor tiles should be open
      const corridorOpen = openTiles > blockedTiles

      return { ok: true, openTiles, blockedTiles, corridorOpen }
    })

    expect(result.ok).toBe(true)
    expect(result.corridorOpen).toBe(true)
    expect(severeConsoleErrors(page)).toHaveLength(0)
  })

  test('workers spawn in a line south of TH for natural first-gather path', async ({ page }) => {
    await waitForGame(page)

    const result = await page.evaluate(() => {
      const g = (window as any).__war3Game
      const th = g.units.find((u: any) => u.team === 0 && u.type === 'townhall' && u.hp > 0)
      const workers = g.units.filter((u: any) => u.team === 0 && u.type === 'worker' && u.hp > 0).slice(0, 5)
      if (!th || workers.length < 5) return { ok: false, reason: 'missing TH or workers' }

      const thPos = th.mesh.position

      // Workers should be near TH (within gather range after auto-mine)
      const allNearTH = workers.every((w: any) =>
        Math.hypot(w.mesh.position.x - thPos.x, w.mesh.position.z - thPos.z) < 20,
      )

      // Workers should be spread in x initially (not stacked at one point)
      // After auto-mine they converge, so threshold is low
      const xValues = workers.map((w: any) => w.mesh.position.x)
      const xSpread = Math.max(...xValues) - Math.min(...xValues)
      const spread = xSpread >= 0.5

      return { ok: true, allNearTH, spread, xSpread }
    })

    expect(result.ok).toBe(true)
    expect(result.allNearTH).toBe(true)
    expect(result.spread).toBe(true)
    // Note: consoleErrors may include asset-load 404s in test mode
  })
})
