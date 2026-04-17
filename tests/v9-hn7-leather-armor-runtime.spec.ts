/**
 * V9 HN7-IMPL11 Leather Armor runtime smoke.
 *
 * Proves the DATA8 Leather Armor entries are consumed by the real runtime:
 * command card visibility, prerequisite gates, cumulative armor effects, and
 * non-target exclusions.
 */
import { test, expect, type Page } from '@playwright/test'
import { ArmorType, UNITS } from '../src/game/GameData'

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
    // Procedural fallback is valid in runtime-test mode.
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

test.describe('V9 HN7 Leather Armor runtime smoke', () => {
  test.setTimeout(120000)

  test('LA-RT-1: Blacksmith command card shows Leather Armor buttons', async ({ page }) => {
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
      const labels = buttons.map(b => b.querySelector('.btn-label')?.textContent?.trim() ?? '')

      // All three Leather Armor researches must be available via data check
      const studdedAvail = g.getResearchAvailability('studded_leather_armor', 0)
      const reinforcedAvail = g.getResearchAvailability('reinforced_leather_armor', 0)
      const dragonhideAvail = g.getResearchAvailability('dragonhide_armor', 0)

      return {
        buttonCount: buttons.length,
        labels,
        studdedOnCard: labels.includes('镶钉皮甲'),
        reinforcedOnCard: labels.includes('强化皮甲'),
        dragonhideOnCard: labels.includes('龙皮甲'),
        studdedAvail: studdedAvail.ok,
        reinforcedAvail: reinforcedAvail.ok,
        dragonhideAvail: dragonhideAvail.ok,
        reinforcedReason: reinforcedAvail.reason,
        dragonhideReason: dragonhideAvail.reason,
      }
    })

    expect(result.buttonCount).toBeGreaterThanOrEqual(13)
    expect(result.studdedOnCard).toBe(true)
    expect(result.reinforcedOnCard).toBe(true)
    expect(result.dragonhideOnCard).toBe(true)
    expect(result.studdedAvail).toBe(true)
    expect(result.reinforcedAvail).toBe(false)
    expect(result.dragonhideAvail).toBe(false)
    expect(result.reinforcedReason.length).toBeGreaterThan(0)
    expect(result.dragonhideReason.length).toBeGreaterThan(0)
  })

  test('LA-RT-2: Leather Armor prerequisite gates progress L1 -> L2 -> L3', async ({ page }) => {
    await waitForGame(page)

    const result = await page.evaluate(() => {
      const g = (window as any).__war3Game

      const noBlacksmith = g.getResearchAvailability('studded_leather_armor', 0)

      const bs = g.spawnBuilding('blacksmith', 0, 60, 60)
      bs.buildProgress = 1
      g.resources.earn(0, 5000, 5000)

      const l1WithBlacksmith = g.getResearchAvailability('studded_leather_armor', 0)
      const l2BeforeL1 = g.getResearchAvailability('reinforced_leather_armor', 0)

      g.startResearch(bs, 'studded_leather_armor')
      bs.researchQueue[0].remaining = 0.001
      g.update(1)

      const l2NoKeep = g.getResearchAvailability('reinforced_leather_armor', 0)
      const keep = g.spawnBuilding('keep', 0, 64, 60)
      keep.buildProgress = 1
      const l2WithKeep = g.getResearchAvailability('reinforced_leather_armor', 0)

      g.startResearch(bs, 'reinforced_leather_armor')
      bs.researchQueue[0].remaining = 0.001
      g.update(1)

      const l3NoCastle = g.getResearchAvailability('dragonhide_armor', 0)
      const castle = g.spawnBuilding('castle', 0, 68, 60)
      castle.buildProgress = 1
      const l3WithCastle = g.getResearchAvailability('dragonhide_armor', 0)

      return {
        noBlacksmith,
        l1WithBlacksmith,
        l2BeforeL1,
        l2NoKeep,
        l2WithKeep,
        l3NoCastle,
        l3WithCastle,
        completed: bs.completedResearches.slice(),
      }
    })

    expect(result.noBlacksmith.ok).toBe(false)
    expect(result.l1WithBlacksmith.ok).toBe(true)
    expect(result.l2BeforeL1.ok).toBe(false)
    expect(result.l2NoKeep.ok).toBe(false)
    expect(result.l2NoKeep.reason).toContain('主城')
    expect(result.l2WithKeep.ok).toBe(true)
    expect(result.l3NoCastle.ok).toBe(false)
    expect(result.l3NoCastle.reason).toContain('城堡')
    expect(result.l3WithCastle.ok).toBe(true)
    expect(result.completed).toEqual(['studded_leather_armor', 'reinforced_leather_armor'])
  })

  test('LA-RT-3: Three Leather Armor levels give existing and new targets cumulative +6 armor', async ({ page }) => {
    await waitForGame(page)

    const result = await page.evaluate(() => {
      const g = (window as any).__war3Game

      const rifleman = g.spawnUnit('rifleman', 0, 80, 80)
      const mortar = g.spawnUnit('mortar_team', 0, 82, 80)
      const base = {
        rifleman: rifleman.armor,
        mortar: mortar.armor,
      }

      const bs = g.spawnBuilding('blacksmith', 0, 80, 76)
      bs.buildProgress = 1
      const keep = g.spawnBuilding('keep', 0, 84, 76)
      keep.buildProgress = 1
      const castle = g.spawnBuilding('castle', 0, 88, 76)
      castle.buildProgress = 1
      g.resources.earn(0, 5000, 5000)

      for (const key of ['studded_leather_armor', 'reinforced_leather_armor', 'dragonhide_armor']) {
        g.startResearch(bs, key)
        bs.researchQueue[0].remaining = 0.001
        g.update(1)
      }

      const done = [
        bs.completedResearches.includes('studded_leather_armor'),
        bs.completedResearches.includes('reinforced_leather_armor'),
        bs.completedResearches.includes('dragonhide_armor'),
      ]

      const done2 = done

      const newRifleman = g.spawnUnit('rifleman', 0, 90, 80)
      const newMortar = g.spawnUnit('mortar_team', 0, 92, 80)

      return {
        base,
        after: {
          rifleman: rifleman.armor,
          mortar: mortar.armor,
          newRifleman: newRifleman.armor,
          newMortar: newMortar.armor,
        },
        done,
      }
    })

    expect(result.done).toEqual([true, true, true])
    expect(result.after.rifleman).toBe(result.base.rifleman + 6)
    expect(result.after.mortar).toBe(result.base.mortar + 6)
    expect(result.after.newRifleman).toBe(UNITS.rifleman.armor + 6)
    expect(result.after.newMortar).toBe(UNITS.mortar_team.armor + 6)
    expect(UNITS.rifleman.armorType).toBe(ArmorType.Medium)
    expect(UNITS.mortar_team.armorType).toBe(ArmorType.Unarmored)
  })

  test('LA-RT-4: Leather Armor does not affect non-target units or tower armor', async ({ page }) => {
    await waitForGame(page)

    const result = await page.evaluate(() => {
      const g = (window as any).__war3Game

      const footman = g.spawnUnit('footman', 0, 100, 100)
      const militia = g.spawnUnit('militia', 0, 101, 100)
      const knight = g.spawnUnit('knight', 0, 102, 100)
      const priest = g.spawnUnit('priest', 0, 103, 100)
      const sorceress = g.spawnUnit('sorceress', 0, 104, 100)
      const worker = g.spawnUnit('worker', 0, 105, 100)
      const tower = g.spawnBuilding('tower', 0, 106, 100)
      tower.buildProgress = 1

      const base = {
        footman: footman.armor,
        militia: militia.armor,
        knight: knight.armor,
        priest: priest.armor,
        sorceress: sorceress.armor,
        worker: worker.armor,
        tower: tower.armor,
      }

      const bs = g.spawnBuilding('blacksmith', 0, 100, 96)
      bs.buildProgress = 1
      const keep = g.spawnBuilding('keep', 0, 104, 96)
      keep.buildProgress = 1
      const castle = g.spawnBuilding('castle', 0, 108, 96)
      castle.buildProgress = 1
      g.resources.earn(0, 5000, 5000)

      for (const key of ['studded_leather_armor', 'reinforced_leather_armor', 'dragonhide_armor']) {
        g.startResearch(bs, key)
        bs.researchQueue[0].remaining = 0.001
        g.update(1)
      }

      return {
        base,
        after: {
          footman: footman.armor,
          militia: militia.armor,
          knight: knight.armor,
          priest: priest.armor,
          sorceress: sorceress.armor,
          worker: worker.armor,
          tower: tower.armor,
        },
      }
    })

    expect(result.after).toEqual(result.base)
  })
})
