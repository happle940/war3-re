/**
 * V9 HN7-IMPL6 ranged weapon upgrade runtime smoke.
 *
 * Proves:
 * 1. Blacksmith command card shows 黑火药 / 精炼火药 / 附魔火药
 * 2. Black Gunpowder enabled with Blacksmith; Refined disabled without Keep or Black; Imbued disabled without Castle or Refined
 * 3. Research deducts 100/50, 175/175, 250/300 respectively
 * 4. Three levels cumulative: existing rifleman + mortar_team get attackDamage +3
 * 5. Newly spawned rifleman + mortar_team inherit cumulative +3
 * 6. footman, militia, knight, priest, sorceress unaffected by ranged upgrades
 *
 * Does NOT modify GameData.ts or Game.ts.
 */
import { test, expect, type Page } from '@playwright/test'
import { UNITS } from '../src/game/GameData'

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
  } catch {
    // Procedural fallback is valid.
  }

  await page.evaluate(() => {
    const g = (window as any).__war3Game
    if (g?.ai) {
      if (typeof g.ai.reset === 'function') g.ai.reset()
      g.ai.update = () => {}
    }
  })
  await page.waitForTimeout(300)
}

test.describe('V9 HN7 ranged weapon upgrade runtime smoke', () => {
  test.setTimeout(120000)

  test('RU-1: Command card shows 黑火药 / 精炼火药 / 附魔火药', async ({ page }) => {
    await waitForGame(page)

    const result = await page.evaluate(() => {
      const g = (window as any).__war3Game

      const bs = g.spawnBuilding('blacksmith', 0, 40, 40)
      bs.buildProgress = 1
      const keep = g.spawnBuilding('keep', 0, 44, 40)
      keep.buildProgress = 1
      const castle = g.spawnBuilding('castle', 0, 48, 40)
      castle.buildProgress = 1
      g.resources.earn(0, 5000, 5000)

      // Complete Black Gunpowder first (prerequisite for Refined)
      bs.researchQueue.push({ key: 'black_gunpowder', remaining: 0.001 })
      g.gameTime = 100
      g.update(0.01)

      g.selectionModel.setSelection([bs])
      g._lastCmdKey = ''
      g.updateHUD(0.016)

      const cmdCard = document.getElementById('command-card')!
      const buttons = Array.from(cmdCard.querySelectorAll('button'))
      const blackBtn = buttons.find(b => b.textContent?.includes('黑火药'))
      const refinedBtn = buttons.find(b => b.textContent?.includes('精炼火药'))
      const imbuedBtn = buttons.find(b => b.textContent?.includes('附魔火药'))

      return {
        blackFound: !!blackBtn,
        refinedFound: !!refinedBtn,
        imbuedFound: !!imbuedBtn,
        blackDisabled: blackBtn?.disabled ?? true,
        refinedDisabled: refinedBtn?.disabled ?? true,
        imbuedDisabled: imbuedBtn?.disabled ?? true,
      }
    })

    expect(result.blackFound).toBe(true)
    expect(result.refinedFound).toBe(true)
    expect(result.imbuedFound).toBe(true)
    // Black already completed so should show; Refined available (Black done, Keep exists)
    expect(result.refinedDisabled).toBe(false)
    // Imbued should be disabled (Refined not done yet)
    expect(result.imbuedDisabled).toBe(true)
  })

  test('RU-2: Refined disabled without Keep; enabled with Keep + Black', async ({ page }) => {
    await waitForGame(page)

    // No buildings at all → blocked
    const result = await page.evaluate(() => {
      const g = (window as any).__war3Game
      const avail = g.getResearchAvailability('refined_gunpowder', 0)
      return { ok: avail.ok, reason: avail.reason }
    })
    expect(result.ok).toBe(false)

    // Blacksmith + Black Gunpowder done but no Keep → still blocked
    const result2 = await page.evaluate(() => {
      const g = (window as any).__war3Game
      const bs = g.spawnBuilding('blacksmith', 0, 60, 60)
      bs.buildProgress = 1
      g.resources.earn(0, 5000, 5000)

      // Complete Black Gunpowder
      bs.researchQueue.push({ key: 'black_gunpowder', remaining: 0.001 })
      g.gameTime = 200
      g.update(0.01)

      const avail = g.getResearchAvailability('refined_gunpowder', 0)
      return { ok: avail.ok, reason: avail.reason }
    })
    expect(result2.ok).toBe(false)
    expect(result2.reason).toContain('主城')

    // Blacksmith + Keep + Black done → available
    const result3 = await page.evaluate(() => {
      const g = (window as any).__war3Game
      const bs = g.spawnBuilding('blacksmith', 0, 70, 70)
      bs.buildProgress = 1
      const keep = g.spawnBuilding('keep', 0, 74, 70)
      keep.buildProgress = 1
      g.resources.earn(0, 5000, 5000)

      bs.researchQueue.push({ key: 'black_gunpowder', remaining: 0.001 })
      g.gameTime = 300
      g.update(0.01)

      const avail = g.getResearchAvailability('refined_gunpowder', 0)
      return { ok: avail.ok }
    })
    expect(result3.ok).toBe(true)
  })

  test('RU-2b: Refined disabled without Black Gunpowder; Imbued disabled without Castle or Refined', async ({ page }) => {
    await waitForGame(page)

    // Refined without Black Gunpowder completed (but has Keep)
    const noBlack = await page.evaluate(() => {
      const g = (window as any).__war3Game
      const bs = g.spawnBuilding('blacksmith', 0, 80, 80)
      bs.buildProgress = 1
      const keep = g.spawnBuilding('keep', 0, 84, 80)
      keep.buildProgress = 1
      g.resources.earn(0, 5000, 5000)

      const avail = g.getResearchAvailability('refined_gunpowder', 0)
      return { ok: avail.ok, reason: avail.reason }
    })
    expect(noBlack.ok).toBe(false)

    // Imbued without Castle (has Keep + Black + Refined)
    const noCastle = await page.evaluate(() => {
      const g = (window as any).__war3Game
      const bs = g.spawnBuilding('blacksmith', 0, 90, 90)
      bs.buildProgress = 1
      const keep = g.spawnBuilding('keep', 0, 94, 90)
      keep.buildProgress = 1
      g.resources.earn(0, 5000, 5000)

      bs.researchQueue.push({ key: 'black_gunpowder', remaining: 0.001 })
      g.gameTime = 400
      g.update(0.01)
      bs.researchQueue.push({ key: 'refined_gunpowder', remaining: 0.001 })
      g.update(0.01)

      const avail = g.getResearchAvailability('imbued_gunpowder', 0)
      return { ok: avail.ok, reason: avail.reason }
    })
    expect(noCastle.ok).toBe(false)
    expect(noCastle.reason).toContain('城堡')

    // Imbued enabled with Castle + Refined done
    const withCastle = await page.evaluate(() => {
      const g = (window as any).__war3Game
      const bs = g.spawnBuilding('blacksmith', 0, 100, 100)
      bs.buildProgress = 1
      const keep = g.spawnBuilding('keep', 0, 104, 100)
      keep.buildProgress = 1
      const castle = g.spawnBuilding('castle', 0, 108, 100)
      castle.buildProgress = 1
      g.resources.earn(0, 5000, 5000)

      bs.researchQueue.push({ key: 'black_gunpowder', remaining: 0.001 })
      g.gameTime = 500
      g.update(0.01)
      bs.researchQueue.push({ key: 'refined_gunpowder', remaining: 0.001 })
      g.update(0.01)

      const avail = g.getResearchAvailability('imbued_gunpowder', 0)
      return { ok: avail.ok }
    })
    expect(withCastle.ok).toBe(true)
  })

  test('RU-3: Research deducts 100/50, 175/175, 250/300', async ({ page }) => {
    await waitForGame(page)

    const result = await page.evaluate(() => {
      const g = (window as any).__war3Game

      const bs = g.spawnBuilding('blacksmith', 0, 110, 110)
      bs.buildProgress = 1
      const keep = g.spawnBuilding('keep', 0, 114, 110)
      keep.buildProgress = 1
      const castle = g.spawnBuilding('castle', 0, 118, 110)
      castle.buildProgress = 1
      g.resources.earn(0, 5000, 5000)

      // Start Black Gunpowder
      const beforeBlack = g.resources.get(0)
      g.startResearch(bs, 'black_gunpowder')
      const afterBlack = g.resources.get(0)
      const blackCost = { gold: beforeBlack.gold - afterBlack.gold, lumber: beforeBlack.lumber - afterBlack.lumber }

      // Complete Black
      bs.researchQueue[0].remaining = 0.001
      g.update(0.01)

      // Start Refined
      const beforeRefined = g.resources.get(0)
      g.startResearch(bs, 'refined_gunpowder')
      const afterRefined = g.resources.get(0)
      const refinedCost = { gold: beforeRefined.gold - afterRefined.gold, lumber: beforeRefined.lumber - afterRefined.lumber }

      // Complete Refined
      bs.researchQueue[0].remaining = 0.001
      g.update(0.01)

      // Start Imbued
      const beforeImbued = g.resources.get(0)
      g.startResearch(bs, 'imbued_gunpowder')
      const afterImbued = g.resources.get(0)
      const imbuedCost = { gold: beforeImbued.gold - afterImbued.gold, lumber: beforeImbued.lumber - afterImbued.lumber }

      return { blackCost, refinedCost, imbuedCost }
    })

    expect(result.blackCost.gold).toBe(100)
    expect(result.blackCost.lumber).toBe(50)
    expect(result.refinedCost.gold).toBe(175)
    expect(result.refinedCost.lumber).toBe(175)
    expect(result.imbuedCost.gold).toBe(250)
    expect(result.imbuedCost.lumber).toBe(300)
  })

  test('RU-4: Three levels cumulative +3 on existing rifleman and mortar_team', async ({ page }) => {
    await waitForGame(page)

    const result = await page.evaluate(() => {
      const g = (window as any).__war3Game

      // Spawn ranged units BEFORE any research
      const rifleman = g.spawnUnit('rifleman', 0, 120, 120)
      const mortar = g.spawnUnit('mortar_team', 0, 121, 120)

      const base = {
        rifleman: rifleman.attackDamage,
        mortar: mortar.attackDamage,
      }

      // Setup buildings
      const bs = g.spawnBuilding('blacksmith', 0, 120, 116)
      bs.buildProgress = 1
      const keep = g.spawnBuilding('keep', 0, 124, 116)
      keep.buildProgress = 1
      const castle = g.spawnBuilding('castle', 0, 128, 116)
      castle.buildProgress = 1
      g.resources.earn(0, 5000, 5000)

      // Complete Black Gunpowder
      bs.researchQueue.push({ key: 'black_gunpowder', remaining: 0.001 })
      g.gameTime = 600
      g.update(0.01)

      // Complete Refined Gunpowder
      bs.researchQueue.push({ key: 'refined_gunpowder', remaining: 0.001 })
      g.update(0.01)

      // Complete Imbued Gunpowder
      bs.researchQueue.push({ key: 'imbued_gunpowder', remaining: 0.001 })
      g.update(0.01)

      const after = {
        rifleman: g.units.find((u: any) => u === rifleman && u.hp > 0)?.attackDamage ?? -1,
        mortar: g.units.find((u: any) => u === mortar && u.hp > 0)?.attackDamage ?? -1,
      }

      return { base, after }
    })

    expect(result.after.rifleman).toBe(result.base.rifleman + 3)
    expect(result.after.mortar).toBe(result.base.mortar + 3)
  })

  test('RU-5: Newly spawned rifleman and mortar_team inherit cumulative +3', async ({ page }) => {
    await waitForGame(page)

    const rifleBase = UNITS.rifleman.attackDamage
    const mortarBase = UNITS.mortar_team.attackDamage

    const result = await page.evaluate((bases: { rifle: number; mortar: number }) => {
      const g = (window as any).__war3Game

      const bs = g.spawnBuilding('blacksmith', 0, 130, 130)
      bs.buildProgress = 1
      const keep = g.spawnBuilding('keep', 0, 134, 130)
      keep.buildProgress = 1
      const castle = g.spawnBuilding('castle', 0, 138, 130)
      castle.buildProgress = 1
      g.resources.earn(0, 5000, 5000)

      // Complete all three levels
      bs.researchQueue.push({ key: 'black_gunpowder', remaining: 0.001 })
      g.gameTime = 700
      g.update(0.01)
      bs.researchQueue.push({ key: 'refined_gunpowder', remaining: 0.001 })
      g.update(0.01)
      bs.researchQueue.push({ key: 'imbued_gunpowder', remaining: 0.001 })
      g.update(0.01)

      // Spawn new units after all researches complete
      const newRifle = g.spawnUnit('rifleman', 0, 140, 130)
      const newMortar = g.spawnUnit('mortar_team', 0, 140, 132)

      return {
        rifleDamage: newRifle.attackDamage,
        mortarDamage: newMortar.attackDamage,
      }
    }, { rifle: rifleBase, mortar: mortarBase })

    expect(result.rifleDamage).toBe(rifleBase + 3)
    expect(result.mortarDamage).toBe(mortarBase + 3)
  })

  test('RU-6: footman, militia, knight, priest, sorceress unaffected by ranged upgrades', async ({ page }) => {
    await waitForGame(page)

    const footmanBase = UNITS.footman.attackDamage
    const knightBase = UNITS.knight.attackDamage
    const priestBase = UNITS.priest.attackDamage
    const sorceressBase = UNITS.sorceress.attackDamage

    const result = await page.evaluate((bases: { footman: number; knight: number; priest: number; sorceress: number }) => {
      const g = (window as any).__war3Game

      // Spawn non-ranged units BEFORE any research
      const footman = g.spawnUnit('footman', 0, 142, 142)
      const militia = g.spawnUnit('militia', 0, 143, 142)
      const knight = g.spawnUnit('knight', 0, 144, 142)
      const priest = g.spawnUnit('priest', 0, 145, 142)
      const sorceress = g.spawnUnit('sorceress', 0, 146, 142)

      const base = {
        footman: footman.attackDamage,
        militia: militia.attackDamage,
        knight: knight.attackDamage,
        priest: priest.attackDamage,
        sorceress: sorceress.attackDamage,
      }

      // Setup buildings and complete all three ranged levels
      const bs = g.spawnBuilding('blacksmith', 0, 142, 138)
      bs.buildProgress = 1
      const keep = g.spawnBuilding('keep', 0, 146, 138)
      keep.buildProgress = 1
      const castle = g.spawnBuilding('castle', 0, 150, 138)
      castle.buildProgress = 1
      g.resources.earn(0, 5000, 5000)

      bs.researchQueue.push({ key: 'black_gunpowder', remaining: 0.001 })
      g.gameTime = 800
      g.update(0.01)
      bs.researchQueue.push({ key: 'refined_gunpowder', remaining: 0.001 })
      g.update(0.01)
      bs.researchQueue.push({ key: 'imbued_gunpowder', remaining: 0.001 })
      g.update(0.01)

      // Spawn NEW non-ranged units after all researches
      const newFootman = g.spawnUnit('footman', 0, 152, 142)
      const newPriest = g.spawnUnit('priest', 0, 152, 144)

      const after = {
        footman: g.units.find((u: any) => u === footman && u.hp > 0)?.attackDamage ?? -1,
        militia: g.units.find((u: any) => u === militia && u.hp > 0)?.attackDamage ?? -1,
        knight: g.units.find((u: any) => u === knight && u.hp > 0)?.attackDamage ?? -1,
        priest: g.units.find((u: any) => u === priest && u.hp > 0)?.attackDamage ?? -1,
        sorceress: g.units.find((u: any) => u === sorceress && u.hp > 0)?.attackDamage ?? -1,
        newFootman: newFootman.attackDamage,
        newPriest: newPriest.attackDamage,
      }

      return { base, after }
    }, { footman: footmanBase, knight: knightBase, priest: priestBase, sorceress: sorceressBase })

    // Existing non-ranged units unchanged
    expect(result.after.footman).toBe(result.base.footman)
    expect(result.after.militia).toBe(result.base.militia)
    expect(result.after.knight).toBe(result.base.knight)
    expect(result.after.priest).toBe(result.base.priest)
    expect(result.after.sorceress).toBe(result.base.sorceress)
    // Newly spawned non-ranged units unchanged
    expect(result.after.newFootman).toBe(footmanBase)
    expect(result.after.newPriest).toBe(priestBase)
  })
})
