/**
 * Neutral creep camp runtime proof.
 *
 * Proves the default skirmish map has neutral PvE targets and that killing a
 * creep can reward nearby heroes without polluting player/AI resurrection corpses.
 */
import { test, expect, type Page } from '@playwright/test'

const BASE = 'http://127.0.0.1:4173/?runtimeTest=1'

async function waitForGame(page: Page) {
  await page.goto(BASE, { waitUntil: 'domcontentloaded' })
  await page.waitForFunction(() => {
    const game = (window as any).__war3Game
    const canvas = document.getElementById('game-canvas')
    return !!game && !!canvas && Array.isArray(game.units) && game.units.length > 0
  }, { timeout: 15000 })

  try {
    await page.waitForFunction(() => {
      const status = document.getElementById('map-status')?.textContent ?? ''
      return !status.includes('正在加载')
    }, { timeout: 15000 })
  } catch {
    // Procedural fallback is valid for runtime tests.
  }
}

test.describe('Neutral creep camp runtime', () => {
  test.setTimeout(60000)

  test('default runtime spawns anchored neutral creep camps', async ({ page }) => {
    await waitForGame(page)

    const result = await page.evaluate(() => {
      const g = (window as any).__war3Game
      const creeps = g.units.filter((u: any) => u.team === 2 && !u.isBuilding && u.hp > 0)
      return {
        count: creeps.length,
        types: [...new Set(creeps.map((u: any) => u.type))],
        states: [...new Set(creeps.map((u: any) => u.state))],
        hasPlayerTownhall: g.units.some((u: any) => u.team === 0 && u.type === 'townhall' && u.hp > 0),
        hasAiTownhall: g.units.some((u: any) => u.team === 1 && u.type === 'townhall' && u.hp > 0),
      }
    })

    expect(result.count).toBeGreaterThanOrEqual(5)
    expect(result.types).toContain('forest_troll')
    expect(result.types).toContain('ogre_warrior')
    expect(result.states).toEqual([9]) // UnitState.HoldPosition
    expect(result.hasPlayerTownhall).toBe(true)
    expect(result.hasAiTownhall).toBe(true)
  })

  test('nearby hero gains XP from a neutral creep kill without resurrection record pollution', async ({ page }) => {
    await waitForGame(page)

    const result = await page.evaluate(() => {
      const g = (window as any).__war3Game
      const creep = g.units.find((u: any) => u.team === 2 && u.type === 'forest_troll' && u.hp > 0)
      if (!creep) return { ok: false, reason: 'no creep' }

      const hero = g.spawnUnit('paladin', 0, creep.mesh.position.x, creep.mesh.position.z + 1)
      hero.heroLevel = 1
      hero.heroXP = 0
      hero.heroSkillPoints = 0
      const recordsBefore = g.deadUnitRecords.length

      creep.hp = 0
      g.handleDeadUnits()

      g.selectionModel.clear()
      g.selectionModel.setSelection([hero])
      g._lastSelKey = ''
      g.updateHUD(0.016)
      const stats = document.getElementById('unit-stats')?.textContent ?? ''

      return {
        ok: true,
        heroXP: hero.heroXP,
        recordsBefore,
        recordsAfter: g.deadUnitRecords.length,
        creepStillPresent: g.units.includes(creep),
        stats,
      }
    })

    expect(result.ok).toBe(true)
    expect(result.heroXP).toBeGreaterThan(0)
    expect(result.recordsAfter).toBe(result.recordsBefore)
    expect(result.creepStillPresent).toBe(false)
    expect(result.stats).toContain('XP')
  })
})
