/**
 * Five-minute skirmish integrated runtime proof.
 *
 * This is a product-level smoke test for the current War3-like slice. It keeps
 * the browser fast path, but verifies the same objects a player exercises:
 * session reset, neutral creeps, hero XP, dropped items, inventory use, hero
 * ultimate feedback, AI economy, and a five-minute accelerated skirmish window.
 */
import { test, expect, type Page } from '@playwright/test'

const BASE_RUNTIME = 'http://127.0.0.1:4173/?runtimeTest=1'

async function waitForGame(page: Page) {
  const consoleErrors: string[] = []
  const pageErrors: string[] = []
  page.on('console', (msg) => {
    if (msg.type() === 'error') consoleErrors.push(msg.text())
  })
  page.on('pageerror', (err) => pageErrors.push(err.message))
  ;(page as any).__consoleErrors = consoleErrors
  ;(page as any).__pageErrors = pageErrors

  await page.goto(BASE_RUNTIME, { waitUntil: 'domcontentloaded' })
  await page.waitForFunction(() => {
    const game = (window as any).__war3Game
    if (!game || !game.renderer) return false
    if (game.renderer.domElement.width === 0 || game.renderer.domElement.height === 0) return false
    if (!Array.isArray(game.units) || game.units.length === 0) return false
    return typeof (window as any).__returnToMenu === 'function'
  }, { timeout: 15000 })

  try {
    await page.waitForFunction(() => {
      const status = document.getElementById('map-status')?.textContent ?? ''
      return !status.includes('正在加载')
    }, { timeout: 15000 })
  } catch {
    // Runtime-test procedural startup is valid.
  }
  await page.waitForTimeout(300)
}

test.describe('Five-minute skirmish integrated runtime', () => {
  test.setTimeout(180000)

  test('reload clears stale dropped world items before a new session starts', async ({ page }) => {
    await waitForGame(page)

    const result = await page.evaluate(() => {
      const g = (window as any).__war3Game
      const marker = g.units.find((u: any) => u.team === 0 && u.type === 'townhall')
      if (!marker) return { error: 'missing player townhall' }

      const item = g.dropWorldItem('healing_potion', marker.mesh.position)
      const beforeCount = g.worldItems.length
      const wasInSceneBefore = g.scene.children.includes(item.mesh)

      const reloaded = g.reloadCurrentMap()

      return {
        reloaded,
        beforeCount,
        wasInSceneBefore,
        afterCount: g.worldItems.length,
        nextWorldItemId: g.nextWorldItemId,
        stillInSceneAfter: g.scene.children.includes(item.mesh),
        gameTimeAfterReload: g.gameTime,
        sourceKind: g.currentMapSource?.kind,
      }
    })

    expect(result.error).toBeUndefined()
    expect(result.reloaded).toBe(true)
    expect(result.beforeCount).toBe(1)
    expect(result.wasInSceneBefore).toBe(true)
    expect(result.afterCount).toBe(0)
    expect(result.nextWorldItemId).toBe(1)
    expect(result.stillInSceneAfter).toBe(false)
    expect(result.gameTimeAfterReload).toBe(0)
    expect(result.sourceKind).toBe('procedural')
  })

  test('accelerated five-minute skirmish keeps core systems coherent', async ({ page }) => {
    await waitForGame(page)

    const result: any = await page.evaluate(() => {
      const g = (window as any).__war3Game
      const menuShell = document.getElementById('menu-shell')!
      const resultsShell = document.getElementById('results-shell')!

      const initialUnits = g.units.length
      const initialAiGold = g.resources.get(1).gold
      const initialAiLumber = g.resources.get(1).lumber
      const initialCreeps = g.units.filter((u: any) => u.team === 2 && u.hp > 0).length

      const avatarHero = g.spawnUnit('mountain_king', 0, 27, 18)
      avatarHero.heroLevel = 6
      avatarHero.heroXP = 0
      avatarHero.heroSkillPoints = 0
      avatarHero.abilityLevels = {
        storm_bolt: 1,
        thunder_clap: 1,
        bash: 1,
        avatar: 1,
      }
      avatarHero.maxMana = Math.max(avatarHero.maxMana ?? 0, 300)
      avatarHero.mana = avatarHero.maxMana

      const avatarCast = g.aiCastAvatar(avatarHero)
      const avatarActiveAfterCast = (avatarHero.avatarUntil ?? 0) > g.gameTime

      const itemHero = g.spawnUnit('paladin', 0, 27, 18)
      itemHero.heroLevel = 1
      itemHero.heroXP = 0
      itemHero.heroSkillPoints = 0

      const ogre = g.units.find((u: any) => u.team === 2 && u.type === 'ogre_warrior' && u.hp > 0)
      if (!ogre) return { error: 'missing ogre creep' }
      itemHero.mesh.position.set(ogre.mesh.position.x, ogre.mesh.position.y, ogre.mesh.position.z)
      ogre.hp = 1
      g.dealDamage(itemHero, ogre)
      g.update(0.016)
      g.update(0.016)

      const inventoryAfterPickup = [...(itemHero.inventoryItems ?? [])]
      const xpAfterCreep = itemHero.heroXP ?? 0
      const creepsAfterKill = g.units.filter((u: any) => u.team === 2 && u.hp > 0).length

      itemHero.isDead = false
      itemHero.maxHp = Math.max(itemHero.maxHp, 700)
      itemHero.hp = Math.max(1, itemHero.maxHp - 300)
      g.selectionModel.clear()
      g.selectionModel.setSelection([itemHero])
      g._lastCmdKey = ''
      g._lastSelKey = ''
      g.updateHUD(0.016)

      const potionButton = Array.from(document.querySelectorAll('#command-card button')).find((button: any) =>
        button.querySelector('.btn-label')?.textContent?.trim() === '治疗药水',
      ) as HTMLButtonElement | undefined
      const hpBeforePotion = itemHero.hp
      const usedPotion = g.useInventoryItem(itemHero, 0)
      g._lastCmdKey = ''
      g._lastSelKey = ''
      g.updateHUD(0.016)
      const hpAfterPotion = itemHero.hp
      const inventoryAfterPotion = [...(itemHero.inventoryItems ?? [])]

      const shop = g.spawnBuilding('arcane_vault', 0, itemHero.mesh.position.x, itemHero.mesh.position.z)
      g.resources.earn(0, 1000, 0)
      itemHero.maxMana = Math.max(itemHero.maxMana, 250)
      itemHero.mana = 20
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
      const speedBeforeBoots = itemHero.speed
      const boughtManaPotion = clickShopButton('魔法药水')
      const boughtBoots = clickShopButton('速度之靴')
      const speedAfterBoots = itemHero.speed
      g.selectionModel.setSelection([itemHero])
      g._lastCmdKey = ''
      g._lastSelKey = ''
      g.updateHUD(0.016)
      const manaButton = Array.from(document.querySelectorAll('#command-card button')).find((candidate: any) =>
        candidate.querySelector('.btn-label')?.textContent?.trim() === '魔法药水',
      ) as HTMLButtonElement | undefined
      const manaBeforeShopPotion = itemHero.mana
      manaButton?.click()
      const manaAfterShopPotion = itemHero.mana
      const inventoryAfterShopUse = [...(itemHero.inventoryItems ?? [])]

      const startGameTime = g.gameTime
      const dt = 0.25
      for (let i = 0; i < 1200; i++) {
        const playerTownHall = g.units.find((u: any) => u.team === 0 && u.type === 'townhall' && u.hp > 0)
        const aiTownHall = g.units.find((u: any) => u.team === 1 && u.type === 'townhall' && u.hp > 0)
        if (playerTownHall) {
          playerTownHall.maxHp = Math.max(playerTownHall.maxHp, 5000)
          playerTownHall.hp = Math.max(playerTownHall.hp, 4500)
        }
        if (aiTownHall) {
          aiTownHall.maxHp = Math.max(aiTownHall.maxHp, 5000)
          aiTownHall.hp = Math.max(aiTownHall.hp, 4500)
        }
        g.update(dt)
      }

      const endGameTime = g.gameTime
      const aiUnits = g.units.filter((u: any) => u.team === 1 && !u.isBuilding && u.hp > 0)
      const playerTownHallAlive = g.units.some((u: any) => u.team === 0 && u.type === 'townhall' && u.hp > 0)
      const aiTownHallAlive = g.units.some((u: any) => u.team === 1 && u.type === 'townhall' && u.hp > 0)
      const aiRes = g.resources.get(1)
      return {
        initialUnits,
        initialCreeps,
        avatarCast,
        avatarActiveAfterCast,
        inventoryAfterPickup,
        xpAfterCreep,
        creepsAfterKill,
        hadPotionButton: !!potionButton,
        usedPotion,
        hpBeforePotion,
        hpAfterPotion,
        inventoryAfterPotion,
        boughtManaPotion,
        boughtBoots,
        speedBeforeBoots,
        speedAfterBoots,
        hadManaButton: !!manaButton,
        manaBeforeShopPotion,
        manaAfterShopPotion,
        inventoryAfterShopUse,
        startGameTime,
        endGameTime,
        advancedSeconds: endGameTime - startGameTime,
        totalUnitsAfter: g.units.length,
        aiUnitsAfter: aiUnits.length,
        aiGoldChanged: aiRes.gold !== initialAiGold,
        aiLumberChanged: aiRes.lumber !== initialAiLumber,
        playerTownHallAlive,
        aiTownHallAlive,
        matchResult: g.getMatchResult(),
        menuHidden: menuShell.hidden,
        resultsHidden: resultsShell.hidden,
      }
    })

    expect(result.error).toBeUndefined()
    expect(result.initialUnits).toBeGreaterThan(0)
    expect(result.initialCreeps).toBeGreaterThanOrEqual(4)
    expect(result.avatarCast).toBe(true)
    expect(result.avatarActiveAfterCast).toBe(true)
    expect(result.inventoryAfterPickup).toContain('healing_potion')
    expect(result.xpAfterCreep).toBeGreaterThan(0)
    expect(result.creepsAfterKill).toBeLessThan(result.initialCreeps)
    expect(result.hadPotionButton).toBe(true)
    expect(result.usedPotion).toBe(true)
    expect(result.hpAfterPotion).toBeGreaterThan(result.hpBeforePotion)
    expect(result.inventoryAfterPotion).toEqual([])
    expect(result.boughtManaPotion).toBe(true)
    expect(result.boughtBoots).toBe(true)
    expect(result.speedAfterBoots).toBeGreaterThan(result.speedBeforeBoots)
    expect(result.hadManaButton).toBe(true)
    expect(result.manaAfterShopPotion).toBeGreaterThan(result.manaBeforeShopPotion)
    expect(result.inventoryAfterShopUse).toEqual(['boots_of_speed'])
    expect(result.advancedSeconds).toBeGreaterThanOrEqual(300)
    expect(result.totalUnitsAfter).toBeGreaterThan(0)
    expect(result.aiUnitsAfter).toBeGreaterThan(0)
    expect(result.aiGoldChanged || result.aiLumberChanged).toBe(true)
    expect(result.playerTownHallAlive).toBe(true)
    expect(result.aiTownHallAlive).toBe(true)
    expect(result.matchResult).toBeNull()
    expect(result.menuHidden).toBe(true)
    expect(result.resultsHidden).toBe(true)

    expect((page as any).__consoleErrors).toEqual([])
    expect((page as any).__pageErrors).toEqual([])
  })
})
