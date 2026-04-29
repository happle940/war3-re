/**
 * World item drop / pickup runtime proof.
 *
 * Proves neutral creeps can drop a visible world item and a nearby hero can
 * pick it up for an immediate gameplay effect.
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

test.describe('World item drop / pickup runtime', () => {
  test.setTimeout(60000)

  test('neutral creep death drops a tome and hero pickup grants XP feedback', async ({ page }) => {
    await waitForGame(page)

    const result = await page.evaluate(() => {
      const g = (window as any).__war3Game
      const creep = g.units.find((u: any) => u.team === 2 && u.type === 'forest_troll' && u.hp > 0)
      if (!creep) return { ok: false, reason: 'no creep' }

      const hero = g.spawnUnit('paladin', 0, creep.mesh.position.x, creep.mesh.position.z + 1)
      hero.heroLevel = 1
      hero.heroXP = 0
      hero.heroSkillPoints = 0

      const itemCountBefore = g.worldItems.length
      creep.hp = 0
      g.handleDeadUnits()
      const item = g.worldItems[g.worldItems.length - 1]
      const itemCountAfterDrop = g.worldItems.length
      const xpAfterKill = hero.heroXP

      hero.mesh.position.copy(item.mesh.position)
      g.updateWorldItemPickups()
      g.selectionModel.clear()
      g.selectionModel.setSelection([hero])
      g._lastSelKey = ''
      g.updateHUD(0.016)
      const stats = document.getElementById('unit-stats')?.textContent ?? ''

      return {
        ok: true,
        itemCountBefore,
        itemCountAfterDrop,
        itemType: item?.type ?? '',
        xpAfterKill,
        xpAfterPickup: hero.heroXP,
        itemCountAfterPickup: g.worldItems.length,
        stats,
      }
    })

    expect(result.ok).toBe(true)
    expect(result.itemCountAfterDrop).toBe(result.itemCountBefore + 1)
    expect(result.itemType).toBe('tome_of_experience')
    expect(result.xpAfterPickup).toBe(result.xpAfterKill + 100)
    expect(result.itemCountAfterPickup).toBe(result.itemCountBefore)
    expect(result.stats).toContain('技能 拾取 经验之书')
  })
})
