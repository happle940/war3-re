/**
 * V9 HN7-IMPL4 Iron Forged Swords Level 1 runtime smoke.
 *
 * Proves:
 * 1. Blacksmith command card shows 铁剑 button when selected
 * 2. Research costs 100 gold / 50 lumber, deducts on start, enters queue
 * 3. Existing footman / militia / knight get attackDamage +1 after completion
 * 4. Newly spawned footman / knight inherit the +1 effect
 * 5. rifleman / mortar_team / priest / sorceress do NOT get the melee bonus
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

test.describe('V9 HN7 Iron Forged Swords Level 1 runtime smoke', () => {
  test.setTimeout(120000)

  test('IFS-1: Blacksmith command card shows 铁剑 button', async ({ page }) => {
    await waitForGame(page)

    const result = await page.evaluate(() => {
      const g = (window as any).__war3Game
      const bs = g.spawnBuilding('blacksmith', 0, 40, 40)
      bs.buildProgress = 1
      g.resources.earn(0, 500, 500)

      g.selectionModel.setSelection([bs])
      g._lastCmdKey = ''
      g.updateHUD(0.016)

      const cmdCard = document.getElementById('command-card')!
      const buttons = cmdCard.querySelectorAll('button')
      let ifsBtn: HTMLButtonElement | null = null
      for (const btn of buttons) {
        if (btn.textContent?.includes('铁剑')) {
          ifsBtn = btn as HTMLButtonElement
          break
        }
      }

      return {
        found: !!ifsBtn,
        disabled: ifsBtn?.disabled ?? true,
        text: ifsBtn?.textContent ?? '',
      }
    })

    expect(result.found).toBe(true)
    expect(result.disabled).toBe(false)
    expect(result.text).toContain('铁剑')
  })

  test('IFS-2: Research costs 100 gold / 50 lumber and deducts resources', async ({ page }) => {
    await waitForGame(page)

    const result = await page.evaluate(() => {
      const g = (window as any).__war3Game
      const bs = g.spawnBuilding('blacksmith', 0, 42, 42)
      bs.buildProgress = 1
      g.resources.earn(0, 300, 200)

      const before = g.resources.get(0)
      g.startResearch(bs, 'iron_forged_swords')
      const after = g.resources.get(0)

      return {
        goldDelta: before.gold - after.gold,
        lumberDelta: before.lumber - after.lumber,
        queueLen: bs.researchQueue.length,
        queueKey: bs.researchQueue[0]?.key ?? '',
      }
    })

    expect(result.queueLen).toBe(1)
    expect(result.queueKey).toBe('iron_forged_swords')
    expect(result.goldDelta).toBe(100)
    expect(result.lumberDelta).toBe(50)
  })

  test('IFS-3: Existing melee units get +1 attackDamage after completion', async ({ page }) => {
    await waitForGame(page)

    const result = await page.evaluate(() => {
      const g = (window as any).__war3Game

      const footman = g.spawnUnit('footman', 0, 44, 44)
      const militia = g.spawnUnit('militia', 0, 45, 44)
      const knight = g.spawnUnit('knight', 0, 46, 44)

      const base = {
        footman: footman.attackDamage,
        militia: militia.attackDamage,
        knight: knight.attackDamage,
      }

      const bs = g.spawnBuilding('blacksmith', 0, 42, 46)
      bs.buildProgress = 1
      g.resources.earn(0, 500, 500)
      bs.researchQueue.push({ key: 'iron_forged_swords', remaining: 0.001 })
      g.gameTime = 100
      g.update(0.01)

      const after = {
        footman: g.units.find((u: any) => u === footman && u.hp > 0)?.attackDamage ?? -1,
        militia: g.units.find((u: any) => u === militia && u.hp > 0)?.attackDamage ?? -1,
        knight: g.units.find((u: any) => u === knight && u.hp > 0)?.attackDamage ?? -1,
      }

      return { base, after }
    })

    expect(result.after.footman).toBe(result.base.footman + 1)
    expect(result.after.militia).toBe(result.base.militia + 1)
    expect(result.after.knight).toBe(result.base.knight + 1)
  })

  test('IFS-4: Newly spawned melee units inherit the +1 effect', async ({ page }) => {
    await waitForGame(page)

    const footmanBase = UNITS.footman.attackDamage
    const knightBase = UNITS.knight.attackDamage

    const result = await page.evaluate((bases: { footman: number; knight: number }) => {
      const g = (window as any).__war3Game

      const bs = g.spawnBuilding('blacksmith', 0, 48, 48)
      bs.buildProgress = 1
      g.resources.earn(0, 500, 500)
      bs.researchQueue.push({ key: 'iron_forged_swords', remaining: 0.001 })
      g.gameTime = 100
      g.update(0.01)

      const newFootman = g.spawnUnit('footman', 0, 50, 48)
      const newKnight = g.spawnUnit('knight', 0, 50, 50)

      return {
        footmanDamage: newFootman.attackDamage,
        knightDamage: newKnight.attackDamage,
      }
    }, { footman: footmanBase, knight: knightBase })

    expect(result.footmanDamage).toBe(footmanBase + 1)
    expect(result.knightDamage).toBe(knightBase + 1)
  })

  test('IFS-5: Non-melee existing units do NOT get the bonus', async ({ page }) => {
    await waitForGame(page)

    const result = await page.evaluate(() => {
      const g = (window as any).__war3Game

      const rifleman = g.spawnUnit('rifleman', 0, 52, 52)
      const mortar = g.spawnUnit('mortar_team', 0, 53, 52)
      const priest = g.spawnUnit('priest', 0, 54, 52)
      const sorceress = g.spawnUnit('sorceress', 0, 55, 52)

      const base = {
        rifleman: rifleman.attackDamage,
        mortar: mortar.attackDamage,
        priest: priest.attackDamage,
        sorceress: sorceress.attackDamage,
      }

      const bs = g.spawnBuilding('blacksmith', 0, 52, 50)
      bs.buildProgress = 1
      g.resources.earn(0, 500, 500)
      bs.researchQueue.push({ key: 'iron_forged_swords', remaining: 0.001 })
      g.gameTime = 100
      g.update(0.01)

      const after = {
        rifleman: g.units.find((u: any) => u === rifleman && u.hp > 0)?.attackDamage ?? -1,
        mortar: g.units.find((u: any) => u === mortar && u.hp > 0)?.attackDamage ?? -1,
        priest: g.units.find((u: any) => u === priest && u.hp > 0)?.attackDamage ?? -1,
        sorceress: g.units.find((u: any) => u === sorceress && u.hp > 0)?.attackDamage ?? -1,
      }

      return { base, after }
    })

    expect(result.after.rifleman).toBe(result.base.rifleman)
    expect(result.after.mortar).toBe(result.base.mortar)
    expect(result.after.priest).toBe(result.base.priest)
    expect(result.after.sorceress).toBe(result.base.sorceress)
  })

  test('IFS-6: Newly spawned non-melee units also do NOT inherit the bonus', async ({ page }) => {
    await waitForGame(page)

    const rifleBase = UNITS.rifleman.attackDamage
    const priestBase = UNITS.priest.attackDamage

    const result = await page.evaluate(() => {
      const g = (window as any).__war3Game

      const bs = g.spawnBuilding('blacksmith', 0, 56, 56)
      bs.buildProgress = 1
      g.resources.earn(0, 500, 500)
      bs.researchQueue.push({ key: 'iron_forged_swords', remaining: 0.001 })
      g.gameTime = 100
      g.update(0.01)

      const newRifle = g.spawnUnit('rifleman', 0, 58, 56)
      const newPriest = g.spawnUnit('priest', 0, 58, 58)

      return {
        rifleDamage: newRifle.attackDamage,
        priestDamage: newPriest.attackDamage,
      }
    })

    expect(result.rifleDamage).toBe(rifleBase)
    expect(result.priestDamage).toBe(priestBase)
  })
})
