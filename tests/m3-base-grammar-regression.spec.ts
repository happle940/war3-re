/**
 * M3 Base Grammar Measurement Pack
 *
 * Deterministic runtime proof that the default player-0 base layout has
 * readable RTS spatial grammar. This does NOT claim human visual approval.
 *
 * Measured relationships:
 *   1. Player 0 has exactly one townhall, one goldmine reference, one barracks.
 *   2. Goldmine is close enough for opening economy but does not overlap TH.
 *   3. Barracks is in a distinct production lane (not inside TH/GM cluster).
 *   4. Nearest tree line is present and reachable but not inside core footprints.
 *   5. There is at least one open exit/approach band from the base center.
 */
import { test, expect, type Page } from '@playwright/test'
import { BUILDINGS } from '../src/game/GameData'

const BASE = 'http://127.0.0.1:4173/?runtimeTest=1'

// ==================== Helpers ====================

async function diagnose(page: Page, label: string) {
  const snap = await page.evaluate(() => {
    const game = (window as any).__war3Game
    return {
      hasGame: !!game,
      unitsLength: game?.units?.length ?? -1,
      unitTypes: game?.units?.map((u: any) => u.type) ?? [],
    }
  })
  console.error(`[DIAGNOSE ${label}]`, JSON.stringify(snap, null, 2))
  return snap
}

async function waitForGame(page: Page) {
  const consoleErrors: string[] = []
  page.on('console', (msg) => {
    if (msg.type() === 'error') consoleErrors.push(msg.text())
  })
  ;(page as any).__consoleErrors = consoleErrors

  await page.goto(BASE, { waitUntil: 'domcontentloaded' })

  try {
    await page.waitForFunction(() => {
      const canvas = document.getElementById('game-canvas')
      if (!canvas) return false
      const rect = canvas.getBoundingClientRect()
      if (rect.width === 0 || rect.height === 0) return false
      const game = (window as any).__war3Game
      if (!game) return false
      if (!Array.isArray(game.units) || game.units.length === 0) return false
      if (!game.renderer) return false
      const c = game.renderer.domElement
      if (c.width === 0 || c.height === 0) return false
      return true
    }, { timeout: 15000 })
  } catch (e) {
    await diagnose(page, 'waitForGame-fail')
    throw e
  }

  await page.waitForFunction(() => {
    const status = document.getElementById('map-status')?.textContent ?? ''
    return !status.includes('正在加载')
  }, { timeout: 15000 })

  await page.waitForTimeout(500)
}

// ==================== Tests ====================

test.describe('M3 Base Grammar', () => {
  test.setTimeout(60000)

  test('player 0 base has one townhall, one goldmine-area building, one barracks', async ({ page }) => {
    await waitForGame(page)

    const counts = await page.evaluate(() => {
      const g = (window as any).__war3Game
      const p0 = g.units.filter((u: any) => u.team === 0)
      return {
        townhall: p0.filter((u: any) => u.type === 'townhall').length,
        barracks: p0.filter((u: any) => u.type === 'barracks').length,
        workers: p0.filter((u: any) => u.type === 'worker').length,
        goldmine: g.units.filter((u: any) => u.type === 'goldmine').length,
      }
    })

    expect(counts.townhall).toBe(1)
    expect(counts.barracks).toBe(1)
    expect(counts.workers).toBeGreaterThanOrEqual(5)
    expect(counts.goldmine).toBeGreaterThanOrEqual(1)
  })

  test('goldmine is close to townhall but footprints do not overlap', async ({ page }) => {
    await waitForGame(page)

    const result = await page.evaluate(() => {
      const g = (window as any).__war3Game
      const th = g.units.find((u: any) => u.team === 0 && u.type === 'townhall')
      const gm = g.units.find((u: any) => u.type === 'goldmine')
      if (!th || !gm) return { error: 'missing th or gm' }

      const thPos = { x: th.mesh.position.x, z: th.mesh.position.z }
      const gmPos = { x: gm.mesh.position.x, z: gm.mesh.position.z }
      const dist = Math.sqrt((thPos.x - gmPos.x) ** 2 + (thPos.z - gmPos.z) ** 2)

      // Footprint half-extents in world units (size / 2)
      const thHalf = (th.isBuilding ? 4 : 1) * 0.5  // townhall size=4
      const gmHalf = (gm.isBuilding ? 3 : 1) * 0.5  // goldmine size=3

      // Overlap check: center distance < sum of half-extents means overlap
      const sumHalf = thHalf + gmHalf

      // Expected: TH center ~(12.5, 14.5), GM center ~(16.5, 9.5)
      // Distance should be ~5.4, sumHalf = 3.5, so gap = ~1.9 tiles
      return {
        thPos,
        gmPos,
        dist,
        sumHalf,
        noOverlap: dist > sumHalf,
        // Economy range: goldmine should be within 10 tiles for viable opening
        closeEnough: dist < 10,
      }
    })

    expect(result.error).toBeUndefined()
    expect(result.noOverlap).toBe(true)
    expect(result.closeEnough).toBe(true)
  })

  test('barracks is in a distinct production lane from townhall-goldmine axis', async ({ page }) => {
    await waitForGame(page)

    const result = await page.evaluate(() => {
      const g = (window as any).__war3Game
      const th = g.units.find((u: any) => u.team === 0 && u.type === 'townhall')
      const gm = g.units.find((u: any) => u.type === 'goldmine')
      const bk = g.units.find((u: any) => u.team === 0 && u.type === 'barracks')
      if (!th || !gm || !bk) return { error: 'missing buildings' }

      const thPos = { x: th.mesh.position.x, z: th.mesh.position.z }
      const gmPos = { x: gm.mesh.position.x, z: gm.mesh.position.z }
      const bkPos = { x: bk.mesh.position.x, z: bk.mesh.position.z }

      // TH→GM direction vector
      const dxGM = gmPos.x - thPos.x
      const dzGM = gmPos.z - thPos.z
      const lenGM = Math.sqrt(dxGM * dxGM + dzGM * dzGM)

      // TH→BK direction vector
      const dxBK = bkPos.x - thPos.x
      const dzBK = bkPos.z - thPos.z
      const lenBK = Math.sqrt(dxBK * dxBK + dzBK * dzBK)

      // Angle between TH→GM and TH→BK (dot product)
      // If angle > 45°, barracks is in a distinct lane
      const dot = (dxGM * dxBK + dzGM * dzBK) / (lenGM * lenBK)
      const angleDeg = Math.acos(Math.max(-1, Math.min(1, dot))) * 180 / Math.PI

      // Barracks should not overlap TH footprint
      const thHalf = 4 * 0.5  // townhall size=4
      const bkHalf = 3 * 0.5  // barracks size=3
      const noOverlap = lenBK > (thHalf + bkHalf)

      // Barracks distance: not too far, not too close
      const reasonableDistance = lenBK > 3 && lenBK < 20

      return {
        thPos,
        gmPos,
        bkPos,
        angleDeg,
        distTHtoBK: lenBK,
        noOverlap,
        reasonableDistance,
        distinctLane: angleDeg > 45,
      }
    })

    expect(result.error).toBeUndefined()
    expect(result.noOverlap).toBe(true)
    expect(result.reasonableDistance).toBe(true)
    expect(result.distinctLane).toBe(true)
  })

  test('nearest tree line is present and reachable but not inside core building footprints', async ({ page }) => {
    await waitForGame(page)

    const result = await page.evaluate(() => {
      const g = (window as any).__war3Game
      const th = g.units.find((u: any) => u.team === 0 && u.type === 'townhall')
      if (!th) return { error: 'no th' }

      // Get all tree entries
      const trees: any[] = g.treeManager?.entries ?? []
      if (trees.length === 0) return { error: 'no trees', treeCount: 0 }

      const thPos = { x: th.mesh.position.x, z: th.mesh.position.z }
      const thHalf = 4 * 0.5  // townhall size=4

      // Find nearest tree to TH
      let nearestDist = Infinity
      let nearestTree: any = null
      for (const t of trees) {
        const dx = t.mesh.position.x - thPos.x
        const dz = t.mesh.position.z - thPos.z
        const d = Math.sqrt(dx * dx + dz * dz)
        if (d < nearestDist) {
          nearestDist = d
          nearestTree = t
        }
      }

      // Nearest tree should be outside TH footprint (with margin)
      // TH half-extent = 2.0, tree is 1x1 so +0.5 margin
      const outsideFootprint = nearestDist > (thHalf + 0.5)

      // Nearest tree should be reachable: within reasonable lumber range
      const reachable = nearestDist < 15

      // Count trees within reasonable lumber range of TH
      const treesInRange = trees.filter((t: any) => {
        const dx = t.mesh.position.x - thPos.x
        const dz = t.mesh.position.z - thPos.z
        return Math.sqrt(dx * dx + dz * dz) < 20
      }).length

      return {
        treeCount: trees.length,
        nearestDist,
        outsideFootprint,
        reachable,
        treesInRange,
        thPos,
      }
    })

    expect(result.error).toBeUndefined()
    expect(result.treeCount).toBeGreaterThan(0)
    expect(result.outsideFootprint).toBe(true)
    expect(result.reachable).toBe(true)
    // Need a meaningful tree line, not just 1-2 scattered trees
    expect(result.treesInRange).toBeGreaterThan(10)
  })

  test('base has at least one open exit/approach band not blocked by starting buildings', async ({ page }) => {
    await waitForGame(page)

    const result = await page.evaluate(() => {
      const g = (window as any).__war3Game
      const th = g.units.find((u: any) => u.team === 0 && u.type === 'townhall')
      if (!th) return { error: 'no th' }

      const thPos = { x: th.mesh.position.x, z: th.mesh.position.z }
      const thTileX = Math.round(thPos.x - 0.5)
      const thTileZ = Math.round(thPos.z - 0.5)

      // Check 4 cardinal directions + 4 diagonals from TH center
      // Each direction: check tiles from TH edge outward to 8 tiles away
      const directions = [
        { dx: 1, dz: 0, name: 'east' },
        { dx: -1, dz: 0, name: 'west' },
        { dx: 0, dz: 1, name: 'south' },
        { dx: 0, dz: -1, name: 'north' },
        { dx: 1, dz: 1, name: 'southeast' },
        { dx: 1, dz: -1, name: 'northeast' },
        { dx: -1, dz: 1, name: 'southwest' },
        { dx: -1, dz: -1, name: 'northwest' },
      ]

      const thSize = 4
      const openBands: string[] = []

      for (const dir of directions) {
        // Start checking from TH edge outward
        let consecutiveOpen = 0
        let maxConsecutiveOpen = 0
        for (let step = thSize; step < thSize + 8; step++) {
          const checkTX = thTileX + Math.round(dir.dx * step)
          const checkTZ = thTileZ + Math.round(dir.dz * step)
          if (checkTX < 0 || checkTX >= 64 || checkTZ < 0 || checkTZ >= 64) break
          const blocked = g.pathingGrid?.isBlocked(checkTX, checkTZ) ?? false
          if (!blocked) {
            consecutiveOpen++
            if (consecutiveOpen > maxConsecutiveOpen) maxConsecutiveOpen = consecutiveOpen
          } else {
            consecutiveOpen = 0
          }
        }
        // Open band = at least 4 consecutive unblocked tiles outward from TH edge
        if (maxConsecutiveOpen >= 4) {
          openBands.push(dir.name)
        }
      }

      return {
        thPos,
        openBands,
        openBandCount: openBands.length,
        hasExit: openBands.length > 0,
      }
    })

    expect(result.error).toBeUndefined()
    expect(result.hasExit).toBe(true)
    // At least one clear exit direction
    expect(result.openBandCount).toBeGreaterThanOrEqual(1)
  })

  test('TH-to-goldmine gather corridor is not pinched by trees or starting buildings', async ({ page }) => {
    await waitForGame(page)

    const result = await page.evaluate(() => {
      const g = (window as any).__war3Game
      const th = g.units.find((u: any) => u.team === 0 && u.type === 'townhall')
      const gm = g.units.find((u: any) => u.type === 'goldmine')
      if (!th || !gm) return { error: 'missing th or gm' }

      const thPos = { x: th.mesh.position.x, z: th.mesh.position.z }
      const gmPos = { x: gm.mesh.position.x, z: gm.mesh.position.z }

      // TH footprint: size 4, anchor tile (10,12), occupies tiles (10..13, 12..15)
      // GM footprint: size 3, anchor tile (18,8), occupies tiles (18..20, 8..10)
      // The gather corridor is the rectangular band between TH north edge (z=12)
      // and GM south edge (z=10), spanning from the TH east edge toward the GM east edge.
      // But the full corridor should cover the direct line from TH center to GM center.

      // Collect all blocked tiles in the corridor band between TH and GM
      const thTileX = Math.round(thPos.x - 0.5)
      const thTileZ = Math.round(thPos.z - 0.5)
      const gmTileX = Math.round(gmPos.x - 0.5)
      const gmTileZ = Math.round(gmPos.z - 0.5)
      const thSize = 4
      const gmSize = 3

      // The corridor: tiles between TH north edge and GM south edge
      // TH occupies z=[thTileZ, thTileZ+thSize), GM occupies z=[gmTileZ, gmTileZ+gmSize)
      // Corridor z range: from GM south edge (gmTileZ + gmSize) to TH north edge (thTileZ)
      // But since GM is NE of TH, gmTileZ < thTileZ
      const corridorZMin = gmTileZ + gmSize   // GM south edge
      const corridorZMax = thTileZ             // TH north edge
      // x range: from TH east edge to GM east edge (the full overlap band)
      const corridorXMin = thTileX + thSize    // TH east edge
      const corridorXMax = gmTileX + gmSize    // GM east edge

      const blockedTiles: { x: number; z: number }[] = []
      const totalChecked: number[] = []

      for (let z = corridorZMin; z < corridorZMax; z++) {
        for (let x = corridorXMin - 2; x <= corridorXMax; x++) {
          // Only check tiles not already occupied by TH or GM
          const inTH = x >= thTileX && x < thTileX + thSize && z >= thTileZ && z < thTileZ + thSize
          const inGM = x >= gmTileX && x < gmTileX + gmSize && z >= gmTileZ && z < gmTileZ + gmSize
          if (inTH || inGM) continue

          if (x < 0 || x >= 64 || z < 0 || z >= 64) continue
          totalChecked.push(x * 1000 + z)
          const blocked = g.pathingGrid?.isBlocked(x, z) ?? false
          if (blocked) {
            blockedTiles.push({ x, z })
          }
        }
      }

      return {
        thPos,
        gmPos,
        thTile: { x: thTileX, z: thTileZ },
        gmTile: { x: gmTileX, z: gmTileZ },
        corridorZRange: [corridorZMin, corridorZMax],
        corridorXRange: [corridorXMin, corridorXMax],
        blockedTileCount: blockedTiles.length,
        blockedTiles,
        totalCorridorTiles: totalChecked.length,
        corridorClear: blockedTiles.length === 0,
      }
    })

    expect(result.error).toBeUndefined()

    // The TH-GM corridor should not have any blocked tiles from trees
    expect(
      result.blockedTileCount,
      `TH-GM corridor should be clear, but found ${result.blockedTileCount} blocked tiles at ${JSON.stringify(result.blockedTiles)}`,
    ).toBe(0)
  })
})
