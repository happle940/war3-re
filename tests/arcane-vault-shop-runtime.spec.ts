/**
 * Arcane Vault shop runtime proof.
 *
 * Covers the first Human shop slice: build-menu exposure, shop command-card
 * availability, consumable purchase/use, passive item application, and the
 * common blocked states a player sees during a skirmish.
 */
import { test, expect, type Page } from '@playwright/test'
import { BUILDINGS, ITEMS, PEASANT_BUILD_MENU } from '../src/game/GameData'

const BASE = 'http://127.0.0.1:4173/?runtimeTest=1'

async function waitForGame(page: Page) {
  await page.goto(BASE, { waitUntil: 'domcontentloaded' })
  await page.waitForFunction(() => {
    const game = (window as any).__war3Game
    if (!game || !game.renderer) return false
    if (game.renderer.domElement.width === 0 || game.renderer.domElement.height === 0) return false
    return Array.isArray(game.units) && game.units.length > 0
  }, { timeout: 15000 })

  try {
    await page.waitForFunction(() => {
      const status = document.getElementById('map-status')?.textContent ?? ''
      return !status.includes('正在加载')
    }, { timeout: 15000 })
  } catch {
    // Runtime-test procedural startup is valid.
  }
}

test.describe('Arcane Vault shop runtime', () => {
  test.setTimeout(90000)

  test('data exposes Arcane Vault as a buildable Human shop with purchasable items', async () => {
    expect(PEASANT_BUILD_MENU).toContain('arcane_vault')
    expect(BUILDINGS.arcane_vault.name).toBe('奥术宝库')
    expect(BUILDINGS.arcane_vault.shopItems).toEqual([
      'healing_potion',
      'mana_potion',
      'boots_of_speed',
      'scroll_of_town_portal',
    ])
    expect(ITEMS.healing_potion.purchasable).toBe(true)
    expect(ITEMS.mana_potion.manaAmount).toBe(150)
    expect(ITEMS.boots_of_speed.kind).toBe('passive')
    expect(ITEMS.scroll_of_town_portal.townPortal).toBe(true)
  })

  test('shop command card requires a nearby hero, then enables item purchase buttons', async ({ page }) => {
    await waitForGame(page)

    const result = await page.evaluate(() => {
      const readButtons = () => Array.from(document.querySelectorAll('#command-card button')).map((button: any) => ({
        label: button.querySelector('.btn-label')?.textContent?.trim() ?? '',
        cost: button.querySelector('.btn-cost')?.textContent?.trim() ?? '',
        reason: button.querySelector('.btn-reason')?.textContent?.trim() ?? '',
        disabled: !!button.disabled,
      }))
      const g = (window as any).__war3Game
      const shop = g.spawnBuilding('arcane_vault', 0, 24, 24)
      g.selectionModel.setSelection([shop])
      g._lastCmdKey = ''
      g._lastSelKey = ''
      g.updateHUD(0.016)

      const withoutHero = readButtons()
      const hero = g.spawnUnit('paladin', 0, 24.5, 24.5)
      hero.hp = hero.maxHp
      g._lastCmdKey = ''
      g.updateHUD(0.016)

      return {
        withoutHero,
        withHero: readButtons(),
      }
    })

    const blockedPotion = result.withoutHero.find((button: any) => button.label === '治疗药水')
    expect(blockedPotion?.disabled).toBe(true)
    expect(blockedPotion?.reason).toBe('需要英雄靠近')

    const enabledLabels = result.withHero.filter((button: any) => !button.disabled).map((button: any) => button.label)
    expect(enabledLabels).toContain('治疗药水')
    expect(enabledLabels).toContain('魔法药水')
    expect(enabledLabels).toContain('速度之靴')
  })

  test('healing potion can be purchased into hero inventory and consumed from command card', async ({ page }) => {
    await waitForGame(page)

    const result = await page.evaluate(() => {
      const g = (window as any).__war3Game
      const shop = g.spawnBuilding('arcane_vault', 0, 24, 24)
      const hero = g.spawnUnit('paladin', 0, 24.5, 24.5)
      hero.hp = Math.max(1, hero.maxHp - 300)
      g.resources.earn(0, 500, 0)

      g.selectionModel.setSelection([shop])
      g._lastCmdKey = ''
      g.updateHUD(0.016)
      const buyButton = Array.from(document.querySelectorAll('#command-card button')).find((button: any) =>
        button.querySelector('.btn-label')?.textContent?.trim() === '治疗药水',
      ) as HTMLButtonElement | undefined

      const goldBefore = g.resources.get(0).gold
      buyButton?.click()
      const goldAfterPurchase = g.resources.get(0).gold
      const inventoryAfterPurchase = [...hero.inventoryItems]

      g.selectionModel.setSelection([hero])
      g._lastCmdKey = ''
      g._lastSelKey = ''
      g.updateHUD(0.016)
      const useButton = Array.from(document.querySelectorAll('#command-card button')).find((button: any) =>
        button.querySelector('.btn-label')?.textContent?.trim() === '治疗药水',
      ) as HTMLButtonElement | undefined

      const hpBeforeUse = hero.hp
      useButton?.click()
      g._lastCmdKey = ''
      g._lastSelKey = ''
      g.updateHUD(0.016)

      return {
        hadBuyButton: !!buyButton,
        goldSpent: goldBefore - goldAfterPurchase,
        inventoryAfterPurchase,
        hadUseButton: !!useButton,
        hpBeforeUse,
        hpAfterUse: hero.hp,
        inventoryAfterUse: [...hero.inventoryItems],
        hudStats: document.getElementById('unit-stats')?.textContent ?? '',
      }
    })

    expect(result.hadBuyButton).toBe(true)
    expect(result.goldSpent).toBe(ITEMS.healing_potion.cost.gold)
    expect(result.inventoryAfterPurchase).toEqual(['healing_potion'])
    expect(result.hadUseButton).toBe(true)
    expect(result.hpAfterUse).toBeGreaterThan(result.hpBeforeUse)
    expect(result.inventoryAfterUse).toEqual([])
    expect(result.hudStats).toContain('技能 使用 治疗药水')
  })

  test('mana potion restores mana and speed boots apply a one-time passive bonus', async ({ page }) => {
    await waitForGame(page)

    const result = await page.evaluate(() => {
      const readButtons = () => Array.from(document.querySelectorAll('#command-card button')).map((button: any) => ({
        label: button.querySelector('.btn-label')?.textContent?.trim() ?? '',
        cost: button.querySelector('.btn-cost')?.textContent?.trim() ?? '',
        reason: button.querySelector('.btn-reason')?.textContent?.trim() ?? '',
        disabled: !!button.disabled,
      }))
      const g = (window as any).__war3Game
      const shop = g.spawnBuilding('arcane_vault', 0, 24, 24)
      const hero = g.spawnUnit('archmage', 0, 24.5, 24.5)
      hero.mana = 20
      g.resources.earn(0, 1000, 0)

      g.selectionModel.setSelection([shop])
      g._lastCmdKey = ''
      g.updateHUD(0.016)

      const clickShopButton = (label: string) => {
        const button = Array.from(document.querySelectorAll('#command-card button')).find((candidate: any) =>
          candidate.querySelector('.btn-label')?.textContent?.trim() === label,
        ) as HTMLButtonElement | undefined
        button?.click()
        g._lastCmdKey = ''
        g.updateHUD(0.016)
        return !!button
      }

      const boughtMana = clickShopButton('魔法药水')
      const speedBeforeBoots = hero.speed
      const boughtBoots = clickShopButton('速度之靴')
      const speedAfterBoots = hero.speed
      const secondBootsState = readButtons().find((button: any) => button.label === '速度之靴')

      g.selectionModel.setSelection([hero])
      g._lastCmdKey = ''
      g._lastSelKey = ''
      g.updateHUD(0.016)

      const manaButton = Array.from(document.querySelectorAll('#command-card button')).find((candidate: any) =>
        candidate.querySelector('.btn-label')?.textContent?.trim() === '魔法药水',
      ) as HTMLButtonElement | undefined
      const manaBeforeUse = hero.mana
      manaButton?.click()
      g._lastCmdKey = ''
      g._lastSelKey = ''
      g.updateHUD(0.016)

      return {
        boughtMana,
        boughtBoots,
        speedBeforeBoots,
        speedAfterBoots,
        secondBootsDisabled: secondBootsState?.disabled,
        secondBootsReason: secondBootsState?.reason,
        hadManaUseButton: !!manaButton,
        manaBeforeUse,
        manaAfterUse: hero.mana,
        inventoryAfterUse: [...hero.inventoryItems],
        hudStats: document.getElementById('unit-stats')?.textContent ?? '',
      }
    })

    expect(result.boughtMana).toBe(true)
    expect(result.boughtBoots).toBe(true)
    expect(result.speedAfterBoots).toBeCloseTo(result.speedBeforeBoots + (ITEMS.boots_of_speed.speedBonus ?? 0), 4)
    expect(result.secondBootsDisabled).toBe(true)
    expect(result.secondBootsReason).toBe('已拥有')
    expect(result.hadManaUseButton).toBe(true)
    expect(result.manaAfterUse).toBeGreaterThan(result.manaBeforeUse)
    expect(result.inventoryAfterUse).toEqual(['boots_of_speed'])
    expect(result.hudStats).toContain('速度之靴')
  })

  test('shop blocks purchases when the target hero inventory is full', async ({ page }) => {
    await waitForGame(page)

    const result = await page.evaluate(() => {
      const readButtons = () => Array.from(document.querySelectorAll('#command-card button')).map((button: any) => ({
        label: button.querySelector('.btn-label')?.textContent?.trim() ?? '',
        cost: button.querySelector('.btn-cost')?.textContent?.trim() ?? '',
        reason: button.querySelector('.btn-reason')?.textContent?.trim() ?? '',
        disabled: !!button.disabled,
      }))
      const g = (window as any).__war3Game
      const shop = g.spawnBuilding('arcane_vault', 0, 24, 24)
      const hero = g.spawnUnit('paladin', 0, 24.5, 24.5)
      hero.inventoryItems = [
        'healing_potion',
        'healing_potion',
        'healing_potion',
        'healing_potion',
        'healing_potion',
        'mana_potion',
      ]
      g.resources.earn(0, 1000, 0)

      g.selectionModel.setSelection([shop])
      g._lastCmdKey = ''
      g.updateHUD(0.016)

      return readButtons().find((button: any) => button.label === '治疗药水')
    })

    expect(result?.disabled).toBe(true)
    expect(result?.reason).toBe('背包已满')
  })
})
