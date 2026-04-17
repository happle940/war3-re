/**
 * V9 HN7-IMPL5 Steel / Mithril runtime smoke.
 *
 * Proves:
 * 1. Blacksmith command card shows 钢剑 / 秘银剑
 * 2. Steel disabled without Keep or Iron; enabled with both
 * 3. Mithril disabled without Castle or Steel; enabled with both
 * 4. Steel deducts 175/175; Mithril deducts 250/300
 * 5. Iron + Steel + Mithril cumulative: existing melee units get +3 attackDamage
 * 6. Newly spawned melee units inherit cumulative +3
 * 7. Non-melee units unaffected
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

test.describe('V9 HN7 Steel / Mithril runtime smoke', () => {
  test.setTimeout(120000)

  test('SM-1: Command card shows 钢剑 and 秘银剑 when requirements met', async ({ page }) => {
    await waitForGame(page)

    const result = await page.evaluate(() => {
      const g = (window as any).__war3Game

      // Spawn required buildings
      const bs = g.spawnBuilding('blacksmith', 0, 40, 40)
      bs.buildProgress = 1
      const keep = g.spawnBuilding('keep', 0, 44, 40)
      keep.buildProgress = 1
      const castle = g.spawnBuilding('castle', 0, 48, 40)
      castle.buildProgress = 1
      g.resources.earn(0, 5000, 5000)

      // Complete Iron first (prerequisite for Steel)
      bs.researchQueue.push({ key: 'iron_forged_swords', remaining: 0.001 })
      g.gameTime = 100
      g.update(0.01)

      g.selectionModel.setSelection([bs])
      g._lastCmdKey = ''
      g.updateHUD(0.016)

      const cmdCard = document.getElementById('command-card')!
      const buttons = Array.from(cmdCard.querySelectorAll('button'))
      const steelBtn = buttons.find(b => b.textContent?.includes('钢剑'))
      const mithrilBtn = buttons.find(b => b.textContent?.includes('秘银剑'))

      return {
        steelFound: !!steelBtn,
        mithrilFound: !!mithrilBtn,
        steelDisabled: steelBtn?.disabled ?? true,
        mithrilDisabled: mithrilBtn?.disabled ?? true,
      }
    })

    expect(result.steelFound).toBe(true)
    expect(result.mithrilFound).toBe(true)
    // Steel should be available (Iron done, Keep exists)
    expect(result.steelDisabled).toBe(false)
    // Mithril should be disabled (Steel not done yet)
    expect(result.mithrilDisabled).toBe(true)
  })

  test('SM-2: Steel disabled without Keep; enabled with Keep + Iron', async ({ page }) => {
    await waitForGame(page)

    const result = await page.evaluate(() => {
      const g = (window as any).__war3Game
      const avail = g.getResearchAvailability('steel_forged_swords', 0)
      return { ok: avail.ok, reason: avail.reason }
    })

    // No blacksmith, no keep, no iron → blocked
    expect(result.ok).toBe(false)

    const result2 = await page.evaluate(() => {
      const g = (window as any).__war3Game

      // Add blacksmith but no keep — Iron can't start without blacksmith either
      const bs = g.spawnBuilding('blacksmith', 0, 60, 60)
      bs.buildProgress = 1
      g.resources.earn(0, 5000, 5000)

      // Complete Iron
      bs.researchQueue.push({ key: 'iron_forged_swords', remaining: 0.001 })
      g.gameTime = 200
      g.update(0.01)

      // Check Steel without Keep
      const withoutKeep = g.getResearchAvailability('steel_forged_swords', 0)

      // Now add Keep
      const keep = g.spawnBuilding('keep', 0, 64, 60)
      keep.buildProgress = 1
      const withKeep = g.getResearchAvailability('steel_forged_swords', 0)

      return {
        withoutKeepOk: withoutKeep.ok,
        withoutKeepReason: withoutKeep.reason,
        withKeepOk: withKeep.ok,
      }
    })

    expect(result2.withoutKeepOk).toBe(false)
    expect(result2.withoutKeepReason).toContain('主城')
    expect(result2.withKeepOk).toBe(true)
  })

  test('SM-3: Mithril disabled without Castle; enabled with Castle + Steel', async ({ page }) => {
    await waitForGame(page)

    const result = await page.evaluate(() => {
      const g = (window as any).__war3Game

      const bs = g.spawnBuilding('blacksmith', 0, 66, 66)
      bs.buildProgress = 1
      const keep = g.spawnBuilding('keep', 0, 70, 66)
      keep.buildProgress = 1
      g.resources.earn(0, 5000, 5000)

      // Complete Iron + Steel
      bs.researchQueue.push({ key: 'iron_forged_swords', remaining: 0.001 })
      g.gameTime = 300
      g.update(0.01)
      bs.researchQueue.push({ key: 'steel_forged_swords', remaining: 0.001 })
      g.update(0.01)

      // Check Mithril without Castle
      const withoutCastle = g.getResearchAvailability('mithril_forged_swords', 0)

      // Add Castle
      const castle = g.spawnBuilding('castle', 0, 74, 66)
      castle.buildProgress = 1
      const withCastle = g.getResearchAvailability('mithril_forged_swords', 0)

      return {
        withoutCastleOk: withoutCastle.ok,
        withoutCastleReason: withoutCastle.reason,
        withCastleOk: withCastle.ok,
      }
    })

    expect(result.withoutCastleOk).toBe(false)
    expect(result.withoutCastleReason).toContain('城堡')
    expect(result.withCastleOk).toBe(true)
  })

  test('SM-4: Steel deducts 175/175; Mithril deducts 250/300', async ({ page }) => {
    await waitForGame(page)

    const result = await page.evaluate(() => {
      const g = (window as any).__war3Game

      const bs = g.spawnBuilding('blacksmith', 0, 76, 76)
      bs.buildProgress = 1
      const keep = g.spawnBuilding('keep', 0, 80, 76)
      keep.buildProgress = 1
      const castle = g.spawnBuilding('castle', 0, 84, 76)
      castle.buildProgress = 1
      g.resources.earn(0, 5000, 5000)

      // Complete Iron
      bs.researchQueue.push({ key: 'iron_forged_swords', remaining: 0.001 })
      g.gameTime = 400
      g.update(0.01)

      // Start Steel
      const beforeSteel = g.resources.get(0)
      g.startResearch(bs, 'steel_forged_swords')
      const afterSteel = g.resources.get(0)
      const steelCost = { gold: beforeSteel.gold - afterSteel.gold, lumber: beforeSteel.lumber - afterSteel.lumber }

      // Complete Steel
      bs.researchQueue[0].remaining = 0.001
      g.update(0.01)

      // Start Mithril
      const beforeMithril = g.resources.get(0)
      g.startResearch(bs, 'mithril_forged_swords')
      const afterMithril = g.resources.get(0)
      const mithrilCost = { gold: beforeMithril.gold - afterMithril.gold, lumber: beforeMithril.lumber - afterMithril.lumber }

      return { steelCost, mithrilCost }
    })

    expect(result.steelCost.gold).toBe(175)
    expect(result.steelCost.lumber).toBe(175)
    expect(result.mithrilCost.gold).toBe(250)
    expect(result.mithrilCost.lumber).toBe(300)
  })

  test('SM-5: Iron + Steel + Mithril cumulative +3 on existing melee units', async ({ page }) => {
    await waitForGame(page)

    const result = await page.evaluate(() => {
      const g = (window as any).__war3Game

      // Spawn melee units BEFORE any research
      const footman = g.spawnUnit('footman', 0, 86, 86)
      const militia = g.spawnUnit('militia', 0, 87, 86)
      const knight = g.spawnUnit('knight', 0, 88, 86)

      const base = {
        footman: footman.attackDamage,
        militia: militia.attackDamage,
        knight: knight.attackDamage,
      }

      // Setup buildings and complete all three levels
      const bs = g.spawnBuilding('blacksmith', 0, 86, 82)
      bs.buildProgress = 1
      const keep = g.spawnBuilding('keep', 0, 90, 82)
      keep.buildProgress = 1
      const castle = g.spawnBuilding('castle', 0, 94, 82)
      castle.buildProgress = 1
      g.resources.earn(0, 5000, 5000)

      // Complete Iron
      bs.researchQueue.push({ key: 'iron_forged_swords', remaining: 0.001 })
      g.gameTime = 500
      g.update(0.01)

      // Complete Steel
      bs.researchQueue.push({ key: 'steel_forged_swords', remaining: 0.001 })
      g.update(0.01)

      // Complete Mithril
      bs.researchQueue.push({ key: 'mithril_forged_swords', remaining: 0.001 })
      g.update(0.01)

      const after = {
        footman: g.units.find((u: any) => u === footman && u.hp > 0)?.attackDamage ?? -1,
        militia: g.units.find((u: any) => u === militia && u.hp > 0)?.attackDamage ?? -1,
        knight: g.units.find((u: any) => u === knight && u.hp > 0)?.attackDamage ?? -1,
      }

      return { base, after }
    })

    expect(result.after.footman).toBe(result.base.footman + 3)
    expect(result.after.militia).toBe(result.base.militia + 3)
    expect(result.after.knight).toBe(result.base.knight + 3)
  })

  test('SM-6: Newly spawned melee units inherit cumulative +3', async ({ page }) => {
    await waitForGame(page)

    const footmanBase = UNITS.footman.attackDamage
    const knightBase = UNITS.knight.attackDamage

    const result = await page.evaluate(() => {
      const g = (window as any).__war3Game

      const bs = g.spawnBuilding('blacksmith', 0, 96, 96)
      bs.buildProgress = 1
      const keep = g.spawnBuilding('keep', 0, 100, 96)
      keep.buildProgress = 1
      const castle = g.spawnBuilding('castle', 0, 104, 96)
      castle.buildProgress = 1
      g.resources.earn(0, 5000, 5000)

      // Complete all three levels
      bs.researchQueue.push({ key: 'iron_forged_swords', remaining: 0.001 })
      g.gameTime = 600
      g.update(0.01)
      bs.researchQueue.push({ key: 'steel_forged_swords', remaining: 0.001 })
      g.update(0.01)
      bs.researchQueue.push({ key: 'mithril_forged_swords', remaining: 0.001 })
      g.update(0.01)

      // Spawn new units after all researches complete
      const newFootman = g.spawnUnit('footman', 0, 106, 96)
      const newKnight = g.spawnUnit('knight', 0, 106, 98)

      return {
        footmanDamage: newFootman.attackDamage,
        knightDamage: newKnight.attackDamage,
      }
    })

    expect(result.footmanDamage).toBe(footmanBase + 3)
    expect(result.knightDamage).toBe(knightBase + 3)
  })

  test('SM-7: Non-melee units unaffected by melee upgrades', async ({ page }) => {
    await waitForGame(page)

    const rifleBase = UNITS.rifleman.attackDamage
    const priestBase = UNITS.priest.attackDamage

    const result = await page.evaluate(() => {
      const g = (window as any).__war3Game

      // Spawn non-melee BEFORE any research
      const rifleman = g.spawnUnit('rifleman', 0, 108, 108)
      const priest = g.spawnUnit('priest', 0, 109, 108)

      const base = {
        rifleman: rifleman.attackDamage,
        priest: priest.attackDamage,
      }

      // Complete all three melee levels
      const bs = g.spawnBuilding('blacksmith', 0, 108, 104)
      bs.buildProgress = 1
      const keep = g.spawnBuilding('keep', 0, 112, 104)
      keep.buildProgress = 1
      const castle = g.spawnBuilding('castle', 0, 116, 104)
      castle.buildProgress = 1
      g.resources.earn(0, 5000, 5000)

      bs.researchQueue.push({ key: 'iron_forged_swords', remaining: 0.001 })
      g.gameTime = 700
      g.update(0.01)
      bs.researchQueue.push({ key: 'steel_forged_swords', remaining: 0.001 })
      g.update(0.01)
      bs.researchQueue.push({ key: 'mithril_forged_swords', remaining: 0.001 })
      g.update(0.01)

      // Spawn NEW non-melee after all researches
      const newRifle = g.spawnUnit('rifleman', 0, 118, 108)

      const after = {
        rifleman: g.units.find((u: any) => u === rifleman && u.hp > 0)?.attackDamage ?? -1,
        priest: g.units.find((u: any) => u === priest && u.hp > 0)?.attackDamage ?? -1,
        newRifleman: newRifle.attackDamage,
      }

      return { base, after }
    })

    // Existing non-melee unchanged
    expect(result.after.rifleman).toBe(result.base.rifleman)
    expect(result.after.priest).toBe(result.base.priest)
    // Newly spawned non-melee unchanged
    expect(result.after.newRifleman).toBe(rifleBase)
  })
})
