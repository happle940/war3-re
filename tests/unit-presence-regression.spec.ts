/**
 * Unit Presence Regression Pack
 *
 * Baseline proof for small-unit physical presence. This is not full physics;
 * it prevents exact stacking and same-target collapse while respecting existing
 * building/tree blocker semantics.
 */
import { test, expect, type Page } from '@playwright/test'

const BASE = 'http://127.0.0.1:4173'

const S = {
  Idle: 0,
  Moving: 1,
  MovingToGather: 2,
} as const

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
    // Procedural fallback is valid for these contract tests.
  }
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

test.describe('Unit Presence Regression', () => {
  test.setTimeout(120000)

  test('starting workers are outside blocker footprints and not exactly stacked', async ({ page }) => {
    await waitForGame(page)

    const result = await page.evaluate(() => {
      const g = (window as any).__war3Game
      if (!g) return { ok: false, reason: 'no game' }
      const workers = g.units.filter((u: any) => u.team === 0 && u.type === 'worker' && u.hp > 0).slice(0, 5)
      const blockedWorkers = workers.filter((u: any) => {
        const tx = Math.floor(u.mesh.position.x)
        const tz = Math.floor(u.mesh.position.z)
        return g.pathingGrid.isBlocked(tx, tz)
      })
      let minDist = Infinity
      for (let i = 0; i < workers.length; i++) {
        for (let j = i + 1; j < workers.length; j++) {
          const a = workers[i].mesh.position
          const b = workers[j].mesh.position
          const d = Math.hypot(a.x - b.x, a.z - b.z)
          minDist = Math.min(minDist, d)
        }
      }
      return {
        ok: true,
        workerCount: workers.length,
        blockedCount: blockedWorkers.length,
        minDist,
      }
    })

    expect(result.ok).toBe(true)
    expect(result.workerCount).toBeGreaterThanOrEqual(5)
    expect(result.blockedCount).toBe(0)
    expect(result.minDist).toBeGreaterThan(0.5)
    expect(severeConsoleErrors(page)).toHaveLength(0)
  })

  test('exactly overlapping units separate deterministically without teleporting', async ({ page }) => {
    await waitForGame(page)

    const result = await page.evaluate(({ idle }) => {
      const g = (window as any).__war3Game
      if (!g) return { ok: false, reason: 'no game' }
      const units = [
        g.spawnUnit('worker', 0, 34, 34),
        g.spawnUnit('worker', 0, 34, 34),
        g.spawnUnit('worker', 0, 34, 34),
      ]
      for (const u of units) {
        u.state = idle
        u.moveTarget = null
        u.waypoints = []
      }
      const origin = { x: units[0].mesh.position.x, z: units[0].mesh.position.z }
      for (let i = 0; i < 20; i++) g.update(0.016)

      let minDist = Infinity
      let maxDisplacement = 0
      let blockedCount = 0
      for (let i = 0; i < units.length; i++) {
        const p = units[i].mesh.position
        maxDisplacement = Math.max(maxDisplacement, Math.hypot(p.x - origin.x, p.z - origin.z))
        if (g.pathingGrid.isBlocked(Math.floor(p.x), Math.floor(p.z))) blockedCount++
        for (let j = i + 1; j < units.length; j++) {
          const q = units[j].mesh.position
          minDist = Math.min(minDist, Math.hypot(p.x - q.x, p.z - q.z))
        }
      }
      return { ok: true, minDist, maxDisplacement, blockedCount }
    }, { idle: S.Idle })

    expect(result.ok).toBe(true)
    expect(result.minDist).toBeGreaterThan(0.2)
    expect(result.maxDisplacement).toBeLessThan(2)
    expect(result.blockedCount).toBe(0)
    expect(severeConsoleErrors(page)).toHaveLength(0)
  })

  test('same-target group movement ends with separated units', async ({ page }) => {
    await waitForGame(page)

    const result = await page.evaluate(({ moving }) => {
      const g = (window as any).__war3Game
      if (!g) return { ok: false, reason: 'no game' }
      const units = [
        g.spawnUnit('worker', 0, 30, 31),
        g.spawnUnit('worker', 0, 31, 31),
        g.spawnUnit('worker', 0, 32, 31),
        g.spawnUnit('worker', 0, 33, 31),
      ]
      const target = new units[0].mesh.position.constructor(38, 0, 35)
      target.y = g.getWorldHeight(target.x, target.z)
      for (const u of units) u.state = moving
      g.planPathForUnits(units, target)
      for (let i = 0; i < 260; i++) g.update(0.05)

      let minDist = Infinity
      let blockedCount = 0
      for (let i = 0; i < units.length; i++) {
        const p = units[i].mesh.position
        if (g.pathingGrid.isBlocked(Math.floor(p.x), Math.floor(p.z))) blockedCount++
        for (let j = i + 1; j < units.length; j++) {
          const q = units[j].mesh.position
          minDist = Math.min(minDist, Math.hypot(p.x - q.x, p.z - q.z))
        }
      }
      return { ok: true, minDist, blockedCount }
    }, { moving: S.Moving })

    expect(result.ok).toBe(true)
    expect(result.minDist).toBeGreaterThan(0.35)
    expect(result.blockedCount).toBe(0)
    expect(severeConsoleErrors(page)).toHaveLength(0)
  })

  test('gold gatherers do not collapse into one exact point near the mine', async ({ page }) => {
    await waitForGame(page)

    const result = await page.evaluate(({ movingToGather }) => {
      const g = (window as any).__war3Game
      if (!g) return { ok: false, reason: 'no game' }

      let mineTile: { tx: number; tz: number } | null = null
      for (let tx = 24; tx <= 50 && !mineTile; tx++) {
        for (let tz = 24; tz <= 50 && !mineTile; tz++) {
          if (g.placementValidator.canPlace(tx, tz, 3)?.ok) mineTile = { tx, tz }
        }
      }
      if (!mineTile) return { ok: false, reason: 'no open mine tile' }

      const mine = g.spawnBuilding('goldmine', -1, mineTile.tx, mineTile.tz)
      const starts: { x: number; z: number }[] = []
      for (let tx = mineTile.tx - 5; tx <= mineTile.tx - 2 && starts.length < 4; tx++) {
        for (let tz = mineTile.tz; tz <= mineTile.tz + 3 && starts.length < 4; tz++) {
          if (!g.pathingGrid.isBlocked(tx, tz)) starts.push({ x: tx, z: tz })
        }
      }
      if (starts.length < 4) return { ok: false, reason: 'not enough free starts', starts }

      const workers = starts.map((p) => g.spawnUnit('worker', 0, p.x, p.z))
      for (const u of workers) {
        u.state = movingToGather
        u.gatherType = 'gold'
        u.resourceTarget = { type: 'goldmine', mine }
      }
      g.planPathForUnits(workers, mine.mesh.position)
      for (let i = 0; i < 100; i++) g.update(0.05)

      let minDist = Infinity
      let blockedCount = 0
      for (let i = 0; i < workers.length; i++) {
        const p = workers[i].mesh.position
        if (g.pathingGrid.isBlocked(Math.floor(p.x), Math.floor(p.z))) blockedCount++
        for (let j = i + 1; j < workers.length; j++) {
          const q = workers[j].mesh.position
          minDist = Math.min(minDist, Math.hypot(p.x - q.x, p.z - q.z))
        }
      }
      return { ok: true, minDist, blockedCount }
    }, { movingToGather: S.MovingToGather })

    expect(result.ok).toBe(true)
    expect(result.minDist).toBeGreaterThan(0.25)
    expect(result.blockedCount).toBe(0)
    expect(severeConsoleErrors(page)).toHaveLength(0)
  })
})
