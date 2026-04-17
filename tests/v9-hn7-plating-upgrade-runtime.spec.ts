/**
 * V9 HN7-IMPL7 Plating armor upgrade runtime smoke.
 *
 * Proves:
 * 1. Blacksmith command card shows 铁甲 / 钢甲 / 秘银甲
 * 2. Steel disabled without Keep or Iron; Mithril disabled without Castle or Steel
 * 3. Research deducts 125/75, 150/175, 175/275 respectively
 * 4. Three levels cumulative: existing footman / militia / knight get armor +6
 * 5. Newly spawned footman / knight inherit cumulative +6
 * 6. rifleman / mortar_team / priest / sorceress / worker unaffected
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

test.describe('V9 HN7 Plating armor upgrade runtime smoke', () => {
  test.setTimeout(120000)

  test('PL-1: Command card shows 铁甲 / 钢甲 / 秘银甲 when Blacksmith selected', async ({ page }) => {
    await waitForGame(page)

    const result = await page.evaluate(() => {
      const g = (window as any).__war3Game

      const bs = g.spawnBuilding('blacksmith', 0, 40, 40)
      bs.buildProgress = 1
      g.resources.earn(0, 5000, 5000)

      g.selectionModel.setSelection([bs])
      g._lastCmdKey = ''
      g.updateHUD(0.016)

      const cmdCard = document.getElementById('command-card')!
      const buttons = Array.from(cmdCard.querySelectorAll('button'))
      const ironBtn = buttons.find(b => b.textContent?.includes('铁甲'))
      const steelBtn = buttons.find(b => b.textContent?.includes('钢甲'))
      const mithrilBtn = buttons.find(b => b.textContent?.includes('秘银甲'))

      return {
        ironFound: !!ironBtn,
        steelFound: !!steelBtn,
        mithrilFound: !!mithrilBtn,
        ironDisabled: ironBtn?.disabled ?? true,
        steelDisabled: steelBtn?.disabled ?? false,
        mithrilDisabled: mithrilBtn?.disabled ?? false,
        labels: buttons.map(b => b.querySelector('.btn-label')?.textContent?.trim() ?? ''),
      }
    })

    expect(result.ironFound).toBe(true)
    expect(result.steelFound).toBe(true)
    expect(result.mithrilFound).toBe(true)
    expect(result.ironDisabled).toBe(false)
    expect(result.steelDisabled).toBe(true)
    expect(result.mithrilDisabled).toBe(true)
    expect(result.labels).toContain('铁甲')
    expect(result.labels).toContain('钢甲')
    expect(result.labels).toContain('秘银甲')
  })

  test('PL-2: Steel disabled without Keep or Iron; enabled with both', async ({ page }) => {
    await waitForGame(page)

    // No buildings → blocked
    const noBuildings = await page.evaluate(() => {
      const g = (window as any).__war3Game
      const avail = g.getResearchAvailability('steel_plating', 0)
      return { ok: avail.ok }
    })
    expect(noBuildings.ok).toBe(false)

    // Blacksmith + Iron done but no Keep → blocked; adding Keep opens Steel.
    const gate = await page.evaluate(() => {
      const g = (window as any).__war3Game
      const bs = g.spawnBuilding('blacksmith', 0, 60, 60)
      bs.buildProgress = 1
      g.resources.earn(0, 5000, 5000)

      g.startResearch(bs, 'iron_plating')
      const queued = bs.researchQueue.find((r: any) => r.key === 'iron_plating')
      if (queued?.key === 'iron_plating') queued.remaining = 0.001
      g.gameTime = 200
      g.update(1)

      const withoutKeep = g.getResearchAvailability('steel_plating', 0)
      const keep = g.spawnBuilding('keep', 0, 64, 60)
      keep.buildProgress = 1
      const withKeep = g.getResearchAvailability('steel_plating', 0)

      return {
        withoutKeepOk: withoutKeep.ok,
        withoutKeepReason: withoutKeep.reason,
        withKeepOk: withKeep.ok,
        ironDone: bs.completedResearches.includes('iron_plating'),
      }
    })
    expect(gate.ironDone).toBe(true)
    expect(gate.withoutKeepOk).toBe(false)
    expect(gate.withoutKeepReason).toContain('主城')
    expect(gate.withKeepOk).toBe(true)
  })

  test('PL-3: Mithril disabled without Castle or Steel; enabled with both', async ({ page }) => {
    await waitForGame(page)

    // No buildings → blocked
    const noBuildings = await page.evaluate(() => {
      const g = (window as any).__war3Game
      const avail = g.getResearchAvailability('mithril_plating', 0)
      return { ok: avail.ok }
    })
    expect(noBuildings.ok).toBe(false)

    // Keep + Iron + Steel done but no Castle → blocked; adding Castle opens Mithril.
    const gate = await page.evaluate(() => {
      const g = (window as any).__war3Game
      const bs = g.spawnBuilding('blacksmith', 0, 80, 80)
      bs.buildProgress = 1
      const keep = g.spawnBuilding('keep', 0, 84, 80)
      keep.buildProgress = 1
      g.resources.earn(0, 5000, 5000)

      g.startResearch(bs, 'iron_plating')
      let queued = bs.researchQueue.find((r: any) => r.key === 'iron_plating')
      if (queued?.key === 'iron_plating') queued.remaining = 0.001
      g.gameTime = 400
      g.update(1)
      g.startResearch(bs, 'steel_plating')
      queued = bs.researchQueue.find((r: any) => r.key === 'steel_plating')
      if (queued?.key === 'steel_plating') queued.remaining = 0.001
      g.update(1)

      const withoutCastle = g.getResearchAvailability('mithril_plating', 0)
      const castle = g.spawnBuilding('castle', 0, 88, 80)
      castle.buildProgress = 1
      const withCastle = g.getResearchAvailability('mithril_plating', 0)

      return {
        withoutCastleOk: withoutCastle.ok,
        withoutCastleReason: withoutCastle.reason,
        withCastleOk: withCastle.ok,
        ironDone: bs.completedResearches.includes('iron_plating'),
        steelDone: bs.completedResearches.includes('steel_plating'),
      }
    })
    expect(gate.ironDone).toBe(true)
    expect(gate.steelDone).toBe(true)
    expect(gate.withoutCastleOk).toBe(false)
    expect(gate.withoutCastleReason).toContain('城堡')
    expect(gate.withCastleOk).toBe(true)
  })

  test('PL-4: Research deducts 125/75, 150/175, 175/275', async ({ page }) => {
    await waitForGame(page)

    const result = await page.evaluate(() => {
      const g = (window as any).__war3Game

      const bs = g.spawnBuilding('blacksmith', 0, 100, 100)
      bs.buildProgress = 1
      const keep = g.spawnBuilding('keep', 0, 104, 100)
      keep.buildProgress = 1
      const castle = g.spawnBuilding('castle', 0, 108, 100)
      castle.buildProgress = 1
      g.resources.earn(0, 5000, 5000)

      // Start Iron Plating
      const beforeIron = g.resources.get(0)
      g.startResearch(bs, 'iron_plating')
      const afterIron = g.resources.get(0)
      const ironCost = { gold: beforeIron.gold - afterIron.gold, lumber: beforeIron.lumber - afterIron.lumber }

      // Complete Iron
      bs.researchQueue[0].remaining = 0.001
      g.update(1)

      // Start Steel
      const beforeSteel = g.resources.get(0)
      g.startResearch(bs, 'steel_plating')
      const afterSteel = g.resources.get(0)
      const steelCost = { gold: beforeSteel.gold - afterSteel.gold, lumber: beforeSteel.lumber - afterSteel.lumber }

      // Complete Steel
      bs.researchQueue[0].remaining = 0.001
      g.update(1)

      // Start Mithril
      const beforeMithril = g.resources.get(0)
      g.startResearch(bs, 'mithril_plating')
      const afterMithril = g.resources.get(0)
      const mithrilCost = { gold: beforeMithril.gold - afterMithril.gold, lumber: beforeMithril.lumber - afterMithril.lumber }

      return { ironCost, steelCost, mithrilCost }
    })

    expect(result.ironCost.gold).toBe(125)
    expect(result.ironCost.lumber).toBe(75)
    expect(result.steelCost.gold).toBe(150)
    expect(result.steelCost.lumber).toBe(175)
    expect(result.mithrilCost.gold).toBe(175)
    expect(result.mithrilCost.lumber).toBe(275)
  })

  test('PL-5: Three levels cumulative +6 on existing footman / militia / knight', async ({ page }) => {
    await waitForGame(page)

    const result = await page.evaluate(() => {
      const g = (window as any).__war3Game

      // Spawn Heavy armor units BEFORE any research
      const footman = g.spawnUnit('footman', 0, 110, 110)
      const militia = g.spawnUnit('militia', 0, 111, 110)
      const knight = g.spawnUnit('knight', 0, 112, 110)

      const base = {
        footman: footman.armor,
        militia: militia.armor,
        knight: knight.armor,
      }

      // Setup buildings
      const bs = g.spawnBuilding('blacksmith', 0, 110, 106)
      bs.buildProgress = 1
      const keep = g.spawnBuilding('keep', 0, 114, 106)
      keep.buildProgress = 1
      const castle = g.spawnBuilding('castle', 0, 118, 106)
      castle.buildProgress = 1
      g.resources.earn(0, 5000, 5000)

      const completeResearch = (key: string) => {
        g.startResearch(bs, key)
        const queued = bs.researchQueue.find((r: any) => r.key === key)
        if (queued?.key !== key) return false
        queued.remaining = 0.001
        g.update(1)
        return bs.completedResearches.includes(key)
      }

      // Complete all three levels through the real research entry.
      g.gameTime = 600
      const done = [
        completeResearch('iron_plating'),
        completeResearch('steel_plating'),
        completeResearch('mithril_plating'),
      ]

      const after = {
        footman: g.units.find((u: any) => u === footman && u.hp > 0)?.armor ?? -1,
        militia: g.units.find((u: any) => u === militia && u.hp > 0)?.armor ?? -1,
        knight: g.units.find((u: any) => u === knight && u.hp > 0)?.armor ?? -1,
      }

      return { base, after, done }
    })

    expect(result.done).toEqual([true, true, true])
    expect(result.after.footman).toBe(result.base.footman + 6)
    expect(result.after.militia).toBe(result.base.militia + 6)
    expect(result.after.knight).toBe(result.base.knight + 6)
  })

  test('PL-6: Newly spawned footman / knight inherit cumulative +6', async ({ page }) => {
    await waitForGame(page)

    const footmanBase = UNITS.footman.armor
    const knightBase = UNITS.knight.armor

    const result = await page.evaluate((bases: { footman: number; knight: number }) => {
      const g = (window as any).__war3Game

      const bs = g.spawnBuilding('blacksmith', 0, 120, 120)
      bs.buildProgress = 1
      const keep = g.spawnBuilding('keep', 0, 124, 120)
      keep.buildProgress = 1
      const castle = g.spawnBuilding('castle', 0, 128, 120)
      castle.buildProgress = 1
      g.resources.earn(0, 5000, 5000)

      const completeResearch = (key: string) => {
        g.startResearch(bs, key)
        const queued = bs.researchQueue.find((r: any) => r.key === key)
        if (queued?.key !== key) return false
        queued.remaining = 0.001
        g.update(1)
        return bs.completedResearches.includes(key)
      }

      // Complete all three levels through the real research entry.
      g.gameTime = 700
      const done = [
        completeResearch('iron_plating'),
        completeResearch('steel_plating'),
        completeResearch('mithril_plating'),
      ]

      // Spawn new units after all researches complete
      const newFootman = g.spawnUnit('footman', 0, 130, 120)
      const newKnight = g.spawnUnit('knight', 0, 130, 122)

      return {
        footmanArmor: newFootman.armor,
        knightArmor: newKnight.armor,
        done,
      }
    }, { footman: footmanBase, knight: knightBase })

    expect(result.done).toEqual([true, true, true])
    expect(result.footmanArmor).toBe(footmanBase + 6)
    expect(result.knightArmor).toBe(knightBase + 6)
  })

  test('PL-7: Non-Heavy units unaffected by Plating', async ({ page }) => {
    await waitForGame(page)

    const rifleBase = UNITS.rifleman.armor
    const priestBase = UNITS.priest.armor
    const workerBase = UNITS.worker.armor

    const result = await page.evaluate((bases: { rifle: number; priest: number; worker: number }) => {
      const g = (window as any).__war3Game

      // Spawn non-Heavy BEFORE any research
      const rifleman = g.spawnUnit('rifleman', 0, 132, 132)
      const mortar = g.spawnUnit('mortar_team', 0, 133, 132)
      const priest = g.spawnUnit('priest', 0, 134, 132)
      const sorceress = g.spawnUnit('sorceress', 0, 135, 132)
      const worker = g.spawnUnit('worker', 0, 136, 132)

      const base = {
        rifleman: rifleman.armor,
        mortar: mortar.armor,
        priest: priest.armor,
        sorceress: sorceress.armor,
        worker: worker.armor,
      }

      // Setup buildings and complete all three Plating levels
      const bs = g.spawnBuilding('blacksmith', 0, 132, 128)
      bs.buildProgress = 1
      const keep = g.spawnBuilding('keep', 0, 136, 128)
      keep.buildProgress = 1
      const castle = g.spawnBuilding('castle', 0, 140, 128)
      castle.buildProgress = 1
      g.resources.earn(0, 5000, 5000)

      const attempts: any[] = []
      const completeResearch = (key: string) => {
        const before = g.getResearchAvailability(key, 0)
        g.startResearch(bs, key)
        const queued = bs.researchQueue.find((r: any) => r.key === key)
        if (queued?.key !== key) {
          attempts.push({
            key,
            before,
            queued: false,
            queueKeys: bs.researchQueue.map((r: any) => r.key),
            completed: bs.completedResearches.slice(),
            resources: g.resources.get(0),
          })
          return false
        }
        queued.remaining = 0.001
        g.update(1)
        const done = bs.completedResearches.includes(key)
        attempts.push({
          key,
          before,
          queued: true,
          done,
          queueKeys: bs.researchQueue.map((r: any) => r.key),
          completed: bs.completedResearches.slice(),
          resources: g.resources.get(0),
        })
        return done
      }

      g.gameTime = 650
      const done = [
        completeResearch('iron_plating'),
        completeResearch('steel_plating'),
        completeResearch('mithril_plating'),
      ]

      // Spawn NEW non-Heavy after all researches
      const newRifle = g.spawnUnit('rifleman', 0, 142, 132)
      const newPriest = g.spawnUnit('priest', 0, 142, 134)

      const after = {
        rifleman: g.units.find((u: any) => u === rifleman && u.hp > 0)?.armor ?? -1,
        mortar: g.units.find((u: any) => u === mortar && u.hp > 0)?.armor ?? -1,
        priest: g.units.find((u: any) => u === priest && u.hp > 0)?.armor ?? -1,
        sorceress: g.units.find((u: any) => u === sorceress && u.hp > 0)?.armor ?? -1,
        worker: g.units.find((u: any) => u === worker && u.hp > 0)?.armor ?? -1,
        newRifle: newRifle.armor,
        newPriest: newPriest.armor,
      }

      return { base, after, done, attempts }
    }, { rifle: rifleBase, priest: priestBase, worker: workerBase })

    expect(result.done, JSON.stringify(result.attempts, null, 2)).toEqual([true, true, true])
    // Existing non-Heavy unchanged
    expect(result.after.rifleman).toBe(result.base.rifleman)
    expect(result.after.mortar).toBe(result.base.mortar)
    expect(result.after.priest).toBe(result.base.priest)
    expect(result.after.sorceress).toBe(result.base.sorceress)
    expect(result.after.worker).toBe(result.base.worker)
    // Newly spawned non-Heavy unchanged
    expect(result.after.newRifle).toBe(rifleBase)
    expect(result.after.newPriest).toBe(priestBase)
  })
})
