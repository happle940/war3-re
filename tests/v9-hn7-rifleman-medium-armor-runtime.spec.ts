/**
 * V9 HN7-MODEL9 Rifleman Medium armor migration runtime proof.
 *
 * Proves:
 * 1. Rifleman is now the only Human combat unit migrated to Medium.
 * 2. Piercing vs Rifleman uses the Medium 0.75 multiplier.
 * 3. Normal vs Rifleman remains 1.0.
 * 4. Existing Heavy / research targeting contracts do not regress.
 */
import { test, expect, type Page } from '@playwright/test'
import {
  ArmorType,
  AttackType,
  DAMAGE_MULTIPLIER_TABLE,
  RESEARCHES,
  UNITS,
} from '../src/game/GameData'

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

test.describe('V9 HN7 Rifleman Medium armor migration', () => {
  test.setTimeout(120000)

  test('RM-1: only Rifleman is migrated to Medium; Mortar remains pending', () => {
    expect(UNITS.rifleman.armorType).toBe(ArmorType.Medium)
    expect(UNITS.mortar_team.armorType).toBe(ArmorType.Unarmored)
    expect(UNITS.footman.armorType).toBe(ArmorType.Heavy)
    expect(UNITS.knight.armorType).toBe(ArmorType.Heavy)
    expect(DAMAGE_MULTIPLIER_TABLE[`${AttackType.Piercing}_${ArmorType.Medium}`]).toBe(0.75)
    expect(DAMAGE_MULTIPLIER_TABLE[`${AttackType.Siege}_${ArmorType.Medium}`]).toBe(0.75)
    expect(DAMAGE_MULTIPLIER_TABLE[`${AttackType.Normal}_${ArmorType.Medium}`]).toBe(1.0)
  })

  test('RM-2: Piercing vs Rifleman now uses Medium 0.75 instead of Unarmored 1.0', async ({ page }) => {
    await waitForGame(page)

    const result = await page.evaluate(() => {
      const g = (window as any).__war3Game
      if (!g) throw new Error('no game')

      const attacker = g.spawnUnit('rifleman', 0, 30, 30)
      const mediumTarget = g.spawnUnit('rifleman', 1, 34, 30)
      const unarmoredTarget = g.spawnUnit('worker', 1, 34, 32)

      const mediumBefore = mediumTarget.hp
      g.dealDamage(attacker, mediumTarget)
      const damageToMedium = mediumBefore - mediumTarget.hp

      const unarmoredBefore = unarmoredTarget.hp
      g.dealDamage(attacker, unarmoredTarget)
      const damageToUnarmored = unarmoredBefore - unarmoredTarget.hp

      for (const unit of [attacker, mediumTarget, unarmoredTarget]) unit.hp = 0
      g.handleDeadUnits()

      return { damageToMedium, damageToUnarmored }
    })

    expect(result.damageToMedium).toBe(14)
    expect(result.damageToUnarmored).toBe(19)
    expect(result.damageToMedium).toBeLessThan(result.damageToUnarmored)
  })

  test('RM-3: Normal vs Rifleman remains 1.0 with armor 0', async ({ page }) => {
    await waitForGame(page)

    const result = await page.evaluate(() => {
      const g = (window as any).__war3Game
      if (!g) throw new Error('no game')

      const worker = g.spawnUnit('worker', 0, 40, 40)
      const rifleman = g.spawnUnit('rifleman', 1, 41, 40)

      const before = rifleman.hp
      g.dealDamage(worker, rifleman)
      const damage = before - rifleman.hp

      worker.hp = 0
      rifleman.hp = 0
      g.handleDeadUnits()

      return { damage }
    })

    expect(result.damage).toBe(5)
  })

  test('RM-4: Heavy and existing research targeting contracts do not regress', () => {
    expect(DAMAGE_MULTIPLIER_TABLE[`${AttackType.Piercing}_${ArmorType.Heavy}`]).toBe(1.25)
    expect(RESEARCHES.long_rifles.effects).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ targetUnitType: 'rifleman', stat: 'attackRange', value: 1.5 }),
      ]),
    )
    expect(RESEARCHES.black_gunpowder.effects).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ targetUnitType: 'rifleman', stat: 'attackDamage', value: 1 }),
        expect.objectContaining({ targetUnitType: 'mortar_team', stat: 'attackDamage', value: 1 }),
      ]),
    )
    expect(RESEARCHES.iron_plating.effects).not.toEqual(
      expect.arrayContaining([
        expect.objectContaining({ targetUnitType: 'rifleman' }),
        expect.objectContaining({ targetUnitType: 'mortar_team' }),
      ]),
    )
  })
})
