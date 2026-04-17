/**
 * V3 Battlefield Grammar Contract
 *
 * Contract-level proof that the battlefield spatial grammar holds:
 * TH, goldmine, tree-line, exit, barracks, and defense structures
 * form a coherent, WC3-like layout where no structure destroys
 * the mine-line or exit corridor grammar.
 *
 * This is a spatial grammar contract, not a balance or art verdict.
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
  } catch { /* procedural fallback valid */ }
  await page.waitForTimeout(500)
}

test.describe('V3 Battlefield Grammar Contract', () => {
  test.setTimeout(120000)

  test('TH-mine-gather path geometry is measurable and structured', async ({ page }) => {
    await waitForGame(page)

    const result = await page.evaluate(() => {
      const g = (window as any).__war3Game
      const th = g.units.find((u: any) => u.team === 0 && u.type === 'townhall' && u.hp > 0)
      const mine = g.units.find((u: any) => u.type === 'goldmine' && u.hp > 0)
      if (!th || !mine) return { ok: false, reason: 'missing TH or mine' }

      const thPos = th.mesh.position
      const minePos = mine.mesh.position

      // Mine is NE of TH
      const isNE = minePos.x > thPos.x && minePos.z < thPos.z

      // Edge-to-edge gap calculation
      const thHalf = 2  // size=4 → half=2
      const mineHalf = 1.5  // size=3 → half=1.5
      const dx = Math.abs(minePos.x - thPos.x)
      const dz = Math.abs(minePos.z - thPos.z)
      const gapX = dx - thHalf - mineHalf
      const gapZ = dz - thHalf - mineHalf
      // At least one axis has a positive gap (no overlap)
      const noOverlap = gapX > 0 || gapZ > 0
      // Gap is not too large (gather efficiency)
      const gapReasonable = Math.max(gapX, gapZ) < 6

      return { ok: true, isNE, noOverlap, gapReasonable, gapX, gapZ }
    })

    expect(result.ok).toBe(true)
    expect(result.isNE).toBe(true)
    expect(result.noOverlap).toBe(true)
    expect(result.gapReasonable).toBe(true)
  })

  test('barracks does not block TH-to-mine gather corridor', async ({ page }) => {
    await waitForGame(page)

    const result = await page.evaluate(() => {
      const g = (window as any).__war3Game
      const th = g.units.find((u: any) => u.team === 0 && u.type === 'townhall' && u.hp > 0)
      const mine = g.units.find((u: any) => u.type === 'goldmine' && u.hp > 0)
      const bar = g.units.find((u: any) => u.team === 0 && u.type === 'barracks' && u.hp > 0)
      if (!th || !mine || !bar) return { ok: false, reason: 'missing buildings' }

      // Check if barracks is outside the TH-mine rectangle
      const thPos = th.mesh.position
      const minePos = mine.mesh.position
      const barPos = bar.mesh.position

      // The TH-mine corridor is the bounding box between TH and GM
      const xMin = Math.min(thPos.x, minePos.x)
      const xMax = Math.max(thPos.x, minePos.x)
      const zMin = Math.min(thPos.z, minePos.z)
      const zMax = Math.max(thPos.z, minePos.z)

      // Barracks center should be outside this corridor (with margin)
      const inCorridor = barPos.x >= xMin - 1 && barPos.x <= xMax + 1
        && barPos.z >= zMin - 1 && barPos.z <= zMax + 1

      // Barracks should be in a distinct direction from mine
      const thToMine = { x: minePos.x - thPos.x, z: minePos.z - thPos.z }
      const thToBar = { x: barPos.x - thPos.x, z: barPos.z - thPos.z }
      const dot = thToMine.x * thToBar.x + thToMine.z * thToBar.z
      const lenMine = Math.hypot(thToMine.x, thToMine.z)
      const lenBar = Math.hypot(thToBar.x, thToBar.z)
      const cosAngle = lenMine > 0 && lenBar > 0 ? dot / (lenMine * lenBar) : 0
      const angleDeg = Math.acos(Math.max(-1, Math.min(1, cosAngle))) * 180 / Math.PI
      const distinctDirection = angleDeg > 30

      return { ok: true, inCorridor, distinctDirection, angleDeg }
    })

    expect(result.ok).toBe(true)
    // Barracks should not be in the gather corridor
    expect(result.inCorridor).toBe(false)
    expect(result.distinctDirection).toBe(true)
  })

  test('barracks does not block the base exit corridor', async ({ page }) => {
    await waitForGame(page)

    const result = await page.evaluate(() => {
      const g = (window as any).__war3Game
      const th = g.units.find((u: any) => u.team === 0 && u.type === 'townhall' && u.hp > 0)
      if (!th) return { ok: false, reason: 'no TH' }

      // Check exit directions from TH
      const thTileX = Math.round(th.mesh.position.x - 0.5)
      const thTileZ = Math.round(th.mesh.position.z - 0.5)

      // Exit directions (away from mine which is NE)
      const exitDirections = [
        { dx: 1, dz: 1, name: 'SE' },
        { dx: 0, dz: 1, name: 'S' },
        { dx: -1, dz: 1, name: 'SW' },
        { dx: 1, dz: 0, name: 'E' },
      ]

      let openExits = 0
      const exitDetails: { name: string; open: number; blocked: number }[] = []

      for (const dir of exitDirections) {
        let open = 0
        let blocked = 0
        for (let step = 5; step < 10; step++) {
          const tx = thTileX + dir.dx * step
          const tz = thTileZ + dir.dz * step
          if (tx < 0 || tx >= 64 || tz < 0 || tz >= 64) continue
          if (g.pathingGrid.isBlocked(tx, tz)) {
            blocked++
          } else {
            open++
          }
        }
        exitDetails.push({ name: dir.name, open, blocked })
        if (open > blocked) openExits++
      }

      return { ok: true, openExits, exitDetails }
    })

    expect(result.ok).toBe(true)
    // At least 2 exit directions should be open
    expect(result.openExits).toBeGreaterThanOrEqual(2)
  })

  test('tree line does not encroach into the core building footprints', async ({ page }) => {
    await waitForGame(page)

    const result = await page.evaluate(() => {
      const g = (window as any).__war3Game
      const buildings = g.units.filter((u: any) => u.team === 0 && u.isBuilding && u.hp > 0)
      const trees = g.treeManager?.entries ?? []
      if (buildings.length === 0 || trees.length === 0) {
        return { ok: false, reason: 'no buildings or trees' }
      }

      // Check no tree is inside any building footprint
      let encroachments = 0
      for (const tree of trees) {
        const tx = Math.floor(tree.mesh.position.x)
        const tz = Math.floor(tree.mesh.position.z)
        for (const b of buildings) {
          const bx = Math.round(b.mesh.position.x - 0.5)
          const bz = Math.round(b.mesh.position.z - 0.5)
          const size = b.type === 'townhall' ? 4 : b.type === 'barracks' ? 3
            : b.type === 'goldmine' ? 3 : b.type === 'farm' ? 2
            : b.type === 'tower' ? 2 : 1
          if (tx >= bx && tx < bx + size && tz >= bz && tz < bz + size) {
            encroachments++
          }
        }
      }

      return { ok: true, encroachments, treeCount: trees.length }
    })

    expect(result.ok).toBe(true)
    expect(result.encroachments).toBe(0)
  })

  test('spatial grammar summary: all relationships hold together', async ({ page }) => {
    await waitForGame(page)

    const result = await page.evaluate(() => {
      const g = (window as any).__war3Game
      const th = g.units.find((u: any) => u.team === 0 && u.type === 'townhall' && u.hp > 0)
      const mine = g.units.find((u: any) => u.type === 'goldmine' && u.hp > 0)
      const bar = g.units.find((u: any) => u.team === 0 && u.type === 'barracks' && u.hp > 0)
      if (!th || !mine || !bar) return { ok: false, reason: 'missing buildings' }

      const thPos = th.mesh.position
      const minePos = mine.mesh.position
      const barPos = bar.mesh.position

      const grammar = {
        mineNE: minePos.x > thPos.x && minePos.z < thPos.z,
        barSW: barPos.x < thPos.x && barPos.z > thPos.z,
        mineCloser: Math.hypot(minePos.x - thPos.x, minePos.z - thPos.z) <
          Math.hypot(barPos.x - thPos.x, barPos.z - thPos.z),
        noMineBarOverlap: Math.hypot(minePos.x - barPos.x, minePos.z - barPos.z) > 3,
        treeLinePresent: (g.treeManager?.entries?.length ?? 0) > 50,
      }

      return { ok: true, grammar, allHold: Object.values(grammar).every(Boolean) }
    })

    expect(result.ok).toBe(true)
    expect(result.allHold).toBe(true)
    expect(result.grammar.mineNE).toBe(true)
    expect(result.grammar.barSW).toBe(true)
    expect(result.grammar.mineCloser).toBe(true)
    expect(result.grammar.noMineBarOverlap).toBe(true)
    expect(result.grammar.treeLinePresent).toBe(true)
  })
})
