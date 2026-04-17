/**
 * V3-BG1 Base Spatial Grammar Closeout Proof
 *
 * Focused regression that proves the default battlefield layout has
 * measurable, explainable spatial relationships between TH, goldmine,
 * treeline, and exits, and that military buildings (barracks, farm, tower)
 * do not break the mine-line or exit corridor grammar.
 *
 * This is the V3-BG1 gate closeout pack — conclusions bind to specific
 * measured quantities, not vague "map needs tuning" claims.
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

/** Collect core building positions and sizes */
async function collectBaseSnapshot(page: Page) {
  return page.evaluate(() => {
    const g = (window as any).__war3Game
    const buildings = {
      th: g.units.find((u: any) => u.team === 0 && u.type === 'townhall' && u.hp > 0),
      mine: g.units.find((u: any) => u.type === 'goldmine' && u.hp > 0),
      barracks: g.units.find((u: any) => u.team === 0 && u.type === 'barracks' && u.hp > 0),
      farms: g.units.filter((u: any) => u.team === 0 && u.type === 'farm' && u.hp > 0),
      towers: g.units.filter((u: any) => u.team === 0 && u.type === 'tower' && u.hp > 0),
    }
    const sizes: Record<string, number> = { townhall: 4, goldmine: 3, barracks: 3, farm: 2, tower: 2 }
    const pos = (u: any) => ({ x: u.mesh.position.x, z: u.mesh.position.z })

    const snap: any = {}
    for (const [key, val] of Object.entries(buildings)) {
      if (Array.isArray(val)) {
        snap[key] = val.map((u: any) => ({ pos: pos(u), size: sizes[u.type] ?? 1 }))
      } else if (val) {
        snap[key] = { pos: pos(val), size: sizes[val.type] ?? 1 }
      }
    }

    // Treeline
    const trees = g.treeManager?.entries ?? []
    snap.treeCount = trees.length
    snap.nearestTreeDist = Infinity
    if (snap.th && trees.length > 0) {
      for (const t of trees) {
        const d = Math.hypot(t.mesh.position.x - snap.th.pos.x, t.mesh.position.z - snap.th.pos.z)
        if (d < snap.nearestTreeDist) snap.nearestTreeDist = d
      }
    }

    return snap
  })
}

/** Check if a corridor between two rectangles is blocked by a third rectangle */
function rectsOverlap(
  ax: number, az: number, aw: number, ah: number,
  bx: number, bz: number, bw: number, bh: number,
): boolean {
  return ax < bx + bw && ax + aw > bx && az < bz + bh && az + ah > bz
}

test.describe('V3-BG1 Base Spatial Grammar Closeout', () => {
  test.setTimeout(180000)

  test('TH-mine-treeline-exit relationships are measurable and structured', async ({ page }) => {
    await waitForGame(page)
    const snap = await collectBaseSnapshot(page)

    // Must have core buildings
    expect(snap.th).toBeDefined()
    expect(snap.mine).toBeDefined()

    // 1. TH → Mine distance and direction
    const thMineDist = Math.hypot(
      snap.mine.pos.x - snap.th.pos.x,
      snap.mine.pos.z - snap.th.pos.z,
    )
    // Mine must be within opening economy range
    expect(thMineDist, 'TH-mine distance must be < 10 for opening economy').toBeLessThan(10)
    // Mine must be far enough that footprints don't overlap
    const thMineGap = thMineDist - snap.th.size / 2 - snap.mine.size / 2
    expect(thMineGap, 'TH-mine edge gap must be positive (no overlap)').toBeGreaterThan(0)

    // 2. Mine is NE of TH (the designed spatial grammar)
    const mineNE = snap.mine.pos.x > snap.th.pos.x && snap.mine.pos.z < snap.th.pos.z
    expect(mineNE, 'Goldmine must be NE of Town Hall (designed grammar)').toBe(true)

    // 3. Treeline present and outside TH footprint
    expect(snap.treeCount, 'Treeline must be present').toBeGreaterThan(50)
    expect(snap.nearestTreeDist, 'Nearest tree outside TH footprint').toBeGreaterThan(snap.th.size / 2 + 0.5)

    // 4. At least one open exit direction from TH
    const exitResult = await page.evaluate(() => {
      const g = (window as any).__war3Game
      const th = g.units.find((u: any) => u.team === 0 && u.type === 'townhall' && u.hp > 0)
      if (!th) return { openExits: 0 }
      const thTX = Math.round(th.mesh.position.x - 0.5)
      const thTZ = Math.round(th.mesh.position.z - 0.5)
      const dirs = [
        { dx: 1, dz: 0 }, { dx: -1, dz: 0 },
        { dx: 0, dz: 1 }, { dx: 0, dz: -1 },
        { dx: 1, dz: 1 }, { dx: 1, dz: -1 },
        { dx: -1, dz: 1 }, { dx: -1, dz: -1 },
      ]
      let openExits = 0
      for (const d of dirs) {
        let open = 0
        for (let s = 5; s < 10; s++) {
          const tx = thTX + d.dx * s
          const tz = thTZ + d.dz * s
          if (tx < 0 || tx >= 64 || tz < 0 || tz >= 64) continue
          if (!g.pathingGrid.isBlocked(tx, tz)) open++
        }
        if (open >= 3) openExits++
      }
      return { openExits }
    })
    expect(exitResult.openExits, 'At least one open exit direction from TH').toBeGreaterThanOrEqual(1)

    // Emit measurement summary for audit
    console.log('[V3-BG1 AUDIT] TH-mine spatial grammar:', {
      thMineDist: thMineDist.toFixed(2),
      thMineGap: thMineGap.toFixed(2),
      mineNE,
      treeCount: snap.treeCount,
      nearestTreeDist: snap.nearestTreeDist.toFixed(2),
      openExits: exitResult.openExits,
    })
  })

  test('barracks does not break the TH-mine gather corridor or exit grammar', async ({ page }) => {
    await waitForGame(page)
    const snap = await collectBaseSnapshot(page)

    expect(snap.th).toBeDefined()
    expect(snap.mine).toBeDefined()
    expect(snap.barracks).toBeDefined()

    // 1. Barracks center is outside the TH-mine bounding rectangle (with margin)
    const xMin = Math.min(snap.th.pos.x, snap.mine.pos.x)
    const xMax = Math.max(snap.th.pos.x, snap.mine.pos.x)
    const zMin = Math.min(snap.th.pos.z, snap.mine.pos.z)
    const zMax = Math.max(snap.th.pos.z, snap.mine.pos.z)
    const margin = 1
    const bkInCorridor = (
      snap.barracks.pos.x >= xMin - margin && snap.barracks.pos.x <= xMax + margin &&
      snap.barracks.pos.z >= zMin - margin && snap.barracks.pos.z <= zMax + margin
    )
    expect(bkInCorridor, 'Barracks must not be in the TH-mine gather corridor').toBe(false)

    // 2. Barracks forms a distinct direction from mine (angle > 30°)
    const thToMine = { x: snap.mine.pos.x - snap.th.pos.x, z: snap.mine.pos.z - snap.th.pos.z }
    const thToBk = { x: snap.barracks.pos.x - snap.th.pos.x, z: snap.barracks.pos.z - snap.th.pos.z }
    const dot = thToMine.x * thToBk.x + thToMine.z * thToBk.z
    const lenM = Math.hypot(thToMine.x, thToMine.z)
    const lenB = Math.hypot(thToBk.x, thToBk.z)
    const cosA = lenM > 0 && lenB > 0 ? dot / (lenM * lenB) : 0
    const angleDeg = Math.acos(Math.max(-1, Math.min(1, cosA))) * 180 / Math.PI
    expect(angleDeg, 'Barracks must be in a distinct direction from mine (>30°)').toBeGreaterThan(30)

    // 3. Barracks does not block TH-mine pathing (A* path must exist; trees may
    //    block the direct line but the game navigates around them — the barracks
    //    specifically must not be an additional blocker in the corridor)
    const pathResult = await page.evaluate(() => {
      const g = (window as any).__war3Game
      const th = g.units.find((u: any) => u.team === 0 && u.type === 'townhall' && u.hp > 0)
      const mine = g.units.find((u: any) => u.type === 'goldmine' && u.hp > 0)
      const bar = g.units.find((u: any) => u.team === 0 && u.type === 'barracks' && u.hp > 0)
      if (!th || !mine || !bar) return { pathable: false, reason: 'missing buildings' }

      // Use the game's A* pathfinder to verify a path exists from TH to mine
      const { findPath } = (window as any).__war3PathFinder || {}
      if (findPath) {
        const sx = Math.floor(th.mesh.position.x)
        const sz = Math.floor(th.mesh.position.z)
        const ex = Math.floor(mine.mesh.position.x)
        const ez = Math.floor(mine.mesh.position.z)
        const path = findPath(sx, sz, ex, ez, g.pathingGrid)
        return { pathable: path !== null, pathLen: path?.length ?? -1 }
      }

      // Fallback without A*: check that barracks footprint tiles do NOT lie on
      // the direct TH-mine line (trees may block but that's not a barracks issue)
      const sx = Math.floor(th.mesh.position.x)
      const sz = Math.floor(th.mesh.position.z)
      const ex = Math.floor(mine.mesh.position.x)
      const ez = Math.floor(mine.mesh.position.z)
      const barTX = Math.round(bar.mesh.position.x - 0.5)
      const barTZ = Math.round(bar.mesh.position.z - 0.5)
      const barSize = 3
      let barOnLine = false
      const steps = Math.max(Math.abs(ex - sx), Math.abs(ez - sz)) * 2
      for (let i = 0; i <= steps; i++) {
        const t = i / steps
        const tx = Math.floor(sx + (ex - sx) * t)
        const tz = Math.floor(sz + (ez - sz) * t)
        if (tx >= barTX && tx < barTX + barSize && tz >= barTZ && tz < barTZ + barSize) {
          barOnLine = true
          break
        }
      }
      return { pathable: !barOnLine, barOnLine }
    })
    expect(pathResult.pathable, 'TH-mine path must not be blocked by barracks').toBe(true)

    console.log('[V3-BG1 AUDIT] Barracks spatial grammar:', {
      inCorridor: bkInCorridor,
      angleDeg: angleDeg.toFixed(1),
      pathable: pathResult.pathable,
    })
  })

  test('military buildings (barracks, farm, tower) preserve exit corridor grammar', async ({ page }) => {
    await waitForGame(page)
    const snap = await collectBaseSnapshot(page)

    expect(snap.th).toBeDefined()

    // Collect all player military buildings
    const militaryBuildings = [
      ...(snap.barracks ? [snap.barracks] : []),
      ...snap.farms,
      ...snap.towers,
    ]

    // Check S-SE exit corridor (designed open direction for expansion/rally)
    const exitResult = await page.evaluate(() => {
      const g = (window as any).__war3Game
      const th = g.units.find((u: any) => u.team === 0 && u.type === 'townhall' && u.hp > 0)
      if (!th) return { exitsOpen: 0, details: [] }
      const thTX = Math.round(th.mesh.position.x - 0.5)
      const thTZ = Math.round(th.mesh.position.z - 0.5)

      // S and SE are the designed exit directions (mine is NE)
      const exitDirs = [
        { dx: 1, dz: 1, name: 'SE' },
        { dx: 0, dz: 1, name: 'S' },
        { dx: -1, dz: 1, name: 'SW' },
        { dx: 1, dz: 0, name: 'E' },
      ]

      let exitsOpen = 0
      const details: any[] = []
      for (const dir of exitDirs) {
        let open = 0, blocked = 0
        for (let s = 5; s < 10; s++) {
          const tx = thTX + dir.dx * s
          const tz = thTZ + dir.dz * s
          if (tx < 0 || tx >= 64 || tz < 0 || tz >= 64) continue
          if (g.pathingGrid.isBlocked(tx, tz)) blocked++
          else open++
        }
        details.push({ name: dir.name, open, blocked })
        if (open > blocked) exitsOpen++
      }
      return { exitsOpen, details }
    })

    // At least 2 exit directions must remain open despite military buildings
    expect(exitResult.exitsOpen, 'At least 2 exit directions open after military buildings').toBeGreaterThanOrEqual(2)

    // Verify no military building is inside the TH footprint
    for (const b of militaryBuildings) {
      const distFromTH = Math.hypot(b.pos.x - snap.th.pos.x, b.pos.z - snap.th.pos.z)
      const minDist = (snap.th.size + b.size) / 2
      expect(
        distFromTH,
        `Military building at (${b.pos.x.toFixed(1)},${b.pos.z.toFixed(1)}) must not overlap TH`,
      ).toBeGreaterThan(minDist)
    }

    console.log('[V3-BG1 AUDIT] Exit corridor grammar:', {
      militaryBuildingCount: militaryBuildings.length,
      exitsOpen: exitResult.exitsOpen,
      details: exitResult.details,
    })
  })

  test('TH-to-mine gather path is not blocked by any starting structure', async ({ page }) => {
    await waitForGame(page)

    const result = await page.evaluate(() => {
      const g = (window as any).__war3Game
      const th = g.units.find((u: any) => u.team === 0 && u.type === 'townhall' && u.hp > 0)
      const mine = g.units.find((u: any) => u.type === 'goldmine' && u.hp > 0)
      if (!th || !mine) return { ok: false, reason: 'missing core buildings' }

      // Check every tile in the TH-GM corridor rectangle
      const thTX = Math.round(th.mesh.position.x - 0.5)
      const thTZ = Math.round(th.mesh.position.z - 0.5)
      const gmTX = Math.round(mine.mesh.position.x - 0.5)
      const gmTZ = Math.round(mine.mesh.position.z - 0.5)
      const thSize = 4, gmSize = 3

      // Corridor between TH north edge and GM south edge
      const zLow = Math.min(gmTZ + gmSize, thTZ)
      const zHigh = Math.max(gmTZ + gmSize, thTZ)
      const xLow = Math.min(thTX + thSize, gmTX) - 1
      const xHigh = Math.max(thTX + thSize, gmTX + gmSize) + 1

      const blocked: { x: number; z: number }[] = []
      let checked = 0
      for (let z = zLow; z < zHigh; z++) {
        for (let x = xLow; x <= xHigh; x++) {
          // Skip tiles inside TH or GM footprints
          const inTH = x >= thTX && x < thTX + thSize && z >= thTZ && z < thTZ + thSize
          const inGM = x >= gmTX && x < gmTX + gmSize && z >= gmTZ && z < gmTZ + gmSize
          if (inTH || inGM) continue
          if (x < 0 || x >= 64 || z < 0 || z >= 64) continue
          checked++
          if (g.pathingGrid.isBlocked(x, z)) blocked.push({ x, z })
        }
      }

      return { ok: true, blocked, checked, corridorClear: blocked.length === 0 }
    })

    expect(result.ok, result.reason || 'ok').toBe(true)
    expect(result.corridorClear,
      `TH-GM corridor blocked at: ${JSON.stringify(result.blocked)}`,
    ).toBe(true)

    console.log('[V3-BG1 AUDIT] TH-mine corridor:', {
      checked: result.checked,
      blocked: result.blocked.length,
      clear: result.corridorClear,
    })
  })

  test('V3-BG1 spatial grammar audit: all relationships bind to focused proof', async ({ page }) => {
    await waitForGame(page)

    const audit = await page.evaluate(() => {
      const g = (window as any).__war3Game
      const th = g.units.find((u: any) => u.team === 0 && u.type === 'townhall' && u.hp > 0)
      const mine = g.units.find((u: any) => u.type === 'goldmine' && u.hp > 0)
      const bar = g.units.find((u: any) => u.team === 0 && u.type === 'barracks' && u.hp > 0)
      const trees = g.treeManager?.entries ?? []
      if (!th || !mine || !bar) return { error: 'missing core buildings' }

      const thP = { x: th.mesh.position.x, z: th.mesh.position.z }
      const gmP = { x: mine.mesh.position.x, z: mine.mesh.position.z }
      const bkP = { x: bar.mesh.position.x, z: bar.mesh.position.z }

      // Focused measurements
      const thMineDist = Math.hypot(gmP.x - thP.x, gmP.z - thP.z)
      const thBkDist = Math.hypot(bkP.x - thP.x, bkP.z - thP.z)
      const mineBkDist = Math.hypot(bkP.x - gmP.x, bkP.z - gmP.z)
      const mineNE = gmP.x > thP.x && gmP.z < thP.z
      const barSW = bkP.x < thP.x && bkP.z > thP.z

      // Angle: mine vs barracks from TH
      const dotMB = (gmP.x - thP.x) * (bkP.x - thP.x) + (gmP.z - thP.z) * (bkP.z - thP.z)
      const lenM = Math.hypot(gmP.x - thP.x, gmP.z - thP.z)
      const lenB = Math.hypot(bkP.x - thP.x, bkP.z - thP.z)
      const angleDeg = Math.acos(Math.max(-1, Math.min(1, dotMB / (lenM * lenB)))) * 180 / Math.PI

      // Exit check
      const thTX = Math.round(thP.x - 0.5)
      const thTZ = Math.round(thP.z - 0.5)
      const exitDirs = [
        { dx: 1, dz: 1, name: 'SE' },
        { dx: 0, dz: 1, name: 'S' },
        { dx: -1, dz: 1, name: 'SW' },
        { dx: 1, dz: 0, name: 'E' },
      ]
      let openExits = 0
      for (const d of exitDirs) {
        let open = 0
        for (let s = 5; s < 10; s++) {
          const tx = thTX + d.dx * s
          const tz = thTZ + d.dz * s
          if (tx < 0 || tx >= 64 || tz < 0 || tz >= 64) continue
          if (!g.pathingGrid.isBlocked(tx, tz)) open++
        }
        if (open >= 3) openExits++
      }

      return {
        measurements: {
          thPos: thP,
          gmPos: gmP,
          bkPos: bkP,
          thMineDist: +thMineDist.toFixed(2),
          thBkDist: +thBkDist.toFixed(2),
          mineBkDist: +mineBkDist.toFixed(2),
          angleDeg: +angleDeg.toFixed(1),
        },
        grammar: {
          mineNE,
          barSW,
          mineCloser: thMineDist < thBkDist,
          noMineBarOverlap: mineBkDist > 3,
          treeLinePresent: trees.length > 50,
          openExits,
        },
        allHold: mineNE && barSW && thMineDist < thBkDist && mineBkDist > 3 && trees.length > 50 && openExits >= 2,
      }
    })

    expect(audit.error).toBeUndefined()
    expect(audit.allHold, 'All spatial grammar relationships must hold together').toBe(true)

    // Individual bindings for traceability
    expect(audit.grammar.mineNE, 'Mine must be NE of TH').toBe(true)
    expect(audit.grammar.barSW, 'Barracks must be SW of TH').toBe(true)
    expect(audit.grammar.mineCloser, 'Mine must be closer to TH than barracks').toBe(true)
    expect(audit.grammar.noMineBarOverlap, 'Mine-barracks gap must be > 3 tiles').toBe(true)
    expect(audit.grammar.treeLinePresent, 'Treeline must have > 50 trees').toBe(true)
    expect(audit.grammar.openExits, 'At least 2 open exit directions').toBeGreaterThanOrEqual(2)

    console.log('[V3-BG1 CLOSEOUT AUDIT]', JSON.stringify(audit, null, 2))
  })
})
