/**
 * V9 HERO14-UX1 Resurrection visible feedback minimal runtime proof.
 *
 * Proves:
 * 1. Learned Resurrection shows level in unit stats panel.
 * 2. After cast, text UI shows revived count and the existing floating number also receives the count.
 * 3. Resurrection cooldown shows remaining seconds in unit stats.
 * 4. Command button cooldown reason includes remaining seconds.
 * 5. Disabled reasons update correctly after HUD refresh.
 *
 * Not: particles, sounds, icons, assets, AI, other heroes, items, shops,
 * Tavern, second race, air, multiplayer, complete Paladin, complete hero
 * system, complete Human, V9 release.
 */
import { test, expect, type Page } from '@playwright/test'
import { HERO_ABILITY_LEVELS, UNITS } from '../src/game/GameData'

const BASE_RUNTIME = 'http://127.0.0.1:4173/?runtimeTest=1'
const RES = HERO_ABILITY_LEVELS.resurrection
const RES_L1 = RES.levels[0]

async function waitForRuntime(page: Page) {
  await page.goto(BASE_RUNTIME, { waitUntil: 'domcontentloaded' })
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
    // Procedural fallback is valid for this runtime suite.
  }

  await page.evaluate(() => {
    const g = (window as any).__war3Game
    ;(window as any).__getCommandButton = (label: string) =>
      Array.from(document.querySelectorAll('#command-card button')).find((b: any) =>
        b.querySelector('.btn-label')?.textContent?.trim() === label,
      ) as HTMLButtonElement | undefined
    if (g?.ai) {
      if (typeof g.ai.reset === 'function') g.ai.reset()
      g.ai.update = () => {}
    }
  })
  await page.waitForTimeout(300)
}

test.describe('V9 HERO14-UX1 Resurrection visible feedback', () => {
  test.setTimeout(150000)

  test('FB-1: unit stats show learned Resurrection level', async ({ page }) => {
    await waitForRuntime(page)

    const result = await page.evaluate(() => {
      const g = (window as any).__war3Game
      g.deadUnitRecords = []
      const paladin = g.spawnUnit('paladin', 0, 10, 10)
      paladin.mana = 500
      paladin.heroLevel = 6

      g.selectionModel.clear()
      g.selectionModel.setSelection([paladin])
      g._lastSelKey = ''
      g.updateHUD(0.016)
      const statsBefore = document.getElementById('unit-stats')?.textContent ?? ''

      paladin.abilityLevels = { ...(paladin.abilityLevels ?? {}), resurrection: 1 }
      g._lastSelKey = ''
      g.updateHUD(0.016)
      const statsAfter = document.getElementById('unit-stats')?.textContent ?? ''

      return { statsBefore, statsAfter }
    })

    expect(result.statsBefore).not.toContain('复活术')
    expect(result.statsAfter).toContain('复活术')
    expect(result.statsAfter).toContain('Lv1')
  })

  test('FB-2: cast shows readable revived count after success', async ({ page }) => {
    await waitForRuntime(page)

    const result = await page.evaluate(() => {
      const g = (window as any).__war3Game
      g.deadUnitRecords = []
      const paladin = g.spawnUnit('paladin', 0, 10, 10)
      paladin.mana = 500
      paladin.abilityLevels = { ...(paladin.abilityLevels ?? {}), resurrection: 1 }

      const records = [
        { team: 0, type: 'footman', x: 11, z: 11, diedAt: 10 },
        { team: 0, type: 'rifleman', x: 12, z: 11, diedAt: 20 },
        { team: 0, type: 'footman', x: 13, z: 11, diedAt: 30 },
      ]
      g.deadUnitRecords.push(...records)

      const feedbackSpawns: number[] = []
      const origSpawn = g.feedback.spawnDamageNumber.bind(g.feedback)
      g.feedback.spawnDamageNumber = (unit: any, value: number) => {
        feedbackSpawns.push(value)
        origSpawn(unit, value)
      }

      const castOk = g.castResurrection(paladin)

      g.selectionModel.clear()
      g.selectionModel.setSelection([paladin])
      g._lastSelKey = ''
      g._lastCmdKey = ''
      g.updateHUD(0.016)
      const statsAfterCast = document.getElementById('unit-stats')?.textContent ?? ''

      return { castOk, feedbackSpawns, statsAfterCast }
    })

    expect(result.castOk).toBe(true)
    expect(result.feedbackSpawns).toEqual([3])
    expect(result.statsAfterCast).toContain('刚复活 3 个单位')
  })

  test('FB-3: unit stats show Resurrection cooldown with remaining seconds', async ({ page }) => {
    await waitForRuntime(page)

    const result = await page.evaluate(({ cooldown }) => {
      const g = (window as any).__war3Game
      g.deadUnitRecords = []
      const paladin = g.spawnUnit('paladin', 0, 10, 10)
      paladin.mana = 500
      paladin.abilityLevels = { ...(paladin.abilityLevels ?? {}), resurrection: 1 }
      g.deadUnitRecords.push({ team: 0, type: 'footman', x: 11, z: 11, diedAt: 1 })

      g.selectionModel.clear()
      g.selectionModel.setSelection([paladin])
      g._lastSelKey = ''
      g.updateHUD(0.016)
      const statsBeforeCast = document.getElementById('unit-stats')?.textContent ?? ''

      g.castResurrection(paladin)

      g._lastSelKey = ''
      g.updateHUD(0.016)
      const statsAfterCast = document.getElementById('unit-stats')?.textContent ?? ''

      const cooldownMatch = statsAfterCast.match(/复活冷却\s+(\d+)s/)

      return { statsBeforeCast, statsAfterCast, cooldownMatch, cooldown }
    }, { cooldown: RES_L1.cooldown })

    expect(result.statsBeforeCast).not.toContain('复活冷却')
    expect(result.statsAfterCast).toContain('复活冷却')
    expect(result.cooldownMatch).not.toBeNull()
    if (result.cooldownMatch) {
      const remaining = parseInt(result.cooldownMatch[1], 10)
      expect(remaining).toBeGreaterThan(0)
      expect(remaining).toBeLessThanOrEqual(result.cooldown)
    }
  })

  test('FB-4: command button shows cooldown seconds in disabled reason', async ({ page }) => {
    await waitForRuntime(page)

    const result = await page.evaluate(() => {
      const g = (window as any).__war3Game
      g.deadUnitRecords = []
      const paladin = g.spawnUnit('paladin', 0, 10, 10)
      paladin.mana = 500
      paladin.abilityLevels = { ...(paladin.abilityLevels ?? {}), resurrection: 1 }
      g.deadUnitRecords.push({ team: 0, type: 'footman', x: 11, z: 11, diedAt: 1 })

      g.castResurrection(paladin)

      g.selectionModel.clear()
      g.selectionModel.setSelection([paladin])
      g._lastCmdKey = ''
      g._lastSelKey = ''
      g.updateHUD(0.016)

      const btn = (window as any).__getCommandButton('复活')
      const reason = btn?.dataset.disabledReason ?? ''

      g.gameTime += 5
      g.updateHUD(0.016)
      const refreshedReason = (window as any).__getCommandButton('复活')?.dataset.disabledReason ?? ''

      const secondsMatch = reason.match(/([\d.]+)s/)

      return { reason, refreshedReason, hasSeconds: !!secondsMatch }
    })

    expect(result.reason).toContain('冷却中')
    expect(result.refreshedReason).toContain('冷却中')
    expect(result.refreshedReason).not.toBe(result.reason)
    expect(result.hasSeconds).toBe(true)
  })

  test('FB-5: disabled reasons update after state change', async ({ page }) => {
    await waitForRuntime(page)

    const result = await page.evaluate(() => {
      const g = (window as any).__war3Game
      g.deadUnitRecords = []
      const paladin = g.spawnUnit('paladin', 0, 10, 10)
      paladin.mana = 500
      paladin.abilityLevels = { ...(paladin.abilityLevels ?? {}), resurrection: 1 }
      g.deadUnitRecords.push({ team: 0, type: 'footman', x: 11, z: 11, diedAt: 1 })

      g.selectionModel.clear()
      g.selectionModel.setSelection([paladin])

      // Low mana state
      paladin.mana = 0
      g._lastCmdKey = ''
      g._lastSelKey = ''
      g.updateHUD(0.016)
      const lowManaReason = (window as any).__getCommandButton('复活')?.dataset.disabledReason ?? ''

      // Restore mana, put on cooldown
      paladin.mana = 500
      paladin.resurrectionCooldownUntil = g.gameTime + 120
      g._lastCmdKey = ''
      g.updateHUD(0.016)
      const cooldownReason = (window as any).__getCommandButton('复活')?.dataset.disabledReason ?? ''

      // Clear cooldown, remove corpses
      paladin.resurrectionCooldownUntil = 0
      g.deadUnitRecords = []
      g._lastCmdKey = ''
      g.updateHUD(0.016)
      const noCorpseReason = (window as any).__getCommandButton('复活')?.dataset.disabledReason ?? ''

      return { lowManaReason, cooldownReason, noCorpseReason }
    })

    expect(result.lowManaReason).toContain('法力不足')
    expect(result.cooldownReason).toContain('冷却中')
    expect(result.noCorpseReason).toContain('无可复活单位')
  })
})
