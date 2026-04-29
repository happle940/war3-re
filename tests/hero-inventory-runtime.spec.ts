/**
 * Hero inventory runtime proof.
 *
 * Proves a hero can pick up an inventory item, see it in HUD/command card,
 * and consume it through the command card.
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

test.describe('Hero inventory runtime', () => {
  test.setTimeout(60000)

  test('hero picks up a healing potion and uses it from the command card', async ({ page }) => {
    await waitForGame(page)

    const result = await page.evaluate(() => {
      const g = (window as any).__war3Game
      const hero = g.spawnUnit('paladin', 0, 32, 32)
      hero.hp = 200
      hero.maxHp = 700

      g.dropWorldItem('healing_potion', hero.mesh.position)
      g.updateWorldItemPickups()

      g.selectionModel.clear()
      g.selectionModel.setSelection([hero])
      g._lastCmdKey = ''
      g._lastSelKey = ''
      g.updateHUD(0.016)

      const statsAfterPickup = document.getElementById('unit-stats')?.textContent ?? ''
      const potionButton = Array.from(document.querySelectorAll('#command-card button')).find((b: any) =>
        b.querySelector('.btn-label')?.textContent?.trim() === '治疗药水',
      ) as HTMLButtonElement | undefined
      const hpBeforeUse = hero.hp
      potionButton?.click()
      g._lastCmdKey = ''
      g._lastSelKey = ''
      g.updateHUD(0.016)

      return {
        inventoryAfterPickup: ['healing_potion'],
        actualInventoryAfterUse: [...hero.inventoryItems],
        hadPotionButton: !!potionButton,
        hpBeforeUse,
        hpAfterUse: hero.hp,
        statsAfterPickup,
        statsAfterUse: document.getElementById('unit-stats')?.textContent ?? '',
      }
    })

    expect(result.statsAfterPickup).toContain('物品 治疗药水')
    expect(result.hadPotionButton).toBe(true)
    expect(result.hpAfterUse).toBe(result.hpBeforeUse + 250)
    expect(result.actualInventoryAfterUse).toEqual([])
    expect(result.statsAfterUse).toContain('技能 使用 治疗药水')
  })
})
