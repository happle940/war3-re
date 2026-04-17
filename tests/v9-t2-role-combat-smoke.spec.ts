/**
 * V9 HN2-ROLE14 T2 role combat smoke.
 *
 * Focus: prove the current Keep-era T2 roles are real runtime behavior:
 * - Mortar Team uses the current GameData damage/range/Siege contract and AOE filter.
 * - Priest uses the current GameData mana/Heal contract and target filters.
 */
import { test, expect, type Page } from '@playwright/test'
import {
  ArmorType,
  AttackType,
  DAMAGE_MULTIPLIER_TABLE,
  MORTAR_AOE_FALLOFF,
  MORTAR_AOE_RADIUS,
  PRIEST_HEAL_AMOUNT,
  PRIEST_HEAL_MANA_COST,
  PRIEST_MANA,
  PRIEST_MANA_REGEN,
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

test.describe('V9 T2 role combat smoke', () => {
  test.setTimeout(120000)

  test('RC-1: T2 role data contract is explicit and distinct', async () => {
    expect(UNITS.mortar_team.attackDamage).toBe(42)
    expect(UNITS.mortar_team.attackRange).toBe(6.5)
    expect(UNITS.mortar_team.attackCooldown).toBe(2.5)
    expect(UNITS.mortar_team.attackType).toBe(AttackType.Siege)
    expect(UNITS.mortar_team.armorType).toBe(ArmorType.Unarmored)
    expect(MORTAR_AOE_RADIUS).toBe(2.0)
    expect(MORTAR_AOE_FALLOFF).toBe(0.5)

    expect(PRIEST_MANA).toBe(200)
    expect(PRIEST_MANA_REGEN).toBe(0.5)
    expect(UNITS.priest.attackType).toBe(AttackType.Normal)
    expect(UNITS.priest.armorType).toBe(ArmorType.Unarmored)

    expect(DAMAGE_MULTIPLIER_TABLE[`${AttackType.Siege}_${ArmorType.Medium}`]).toBe(0.75)
    expect(DAMAGE_MULTIPLIER_TABLE[`${AttackType.Normal}_${ArmorType.Medium}`]).toBe(1.0)
  })

  test('RC-2: Mortar Team applies Siege AOE to enemies while sparing allies and goldmines', async ({ page }) => {
    await waitForGame(page)

    const result = await page.evaluate(() => {
      const g = (window as any).__war3Game
      if (!g) throw new Error('no game')

      const mortar = g.spawnUnit('mortar_team', 0, 40, 40)
      const primary = g.spawnUnit('footman', 1, 46, 40)
      const splashEnemy = g.spawnUnit('footman', 1, 47, 40)
      const farEnemy = g.spawnUnit('footman', 1, 51, 40)
      const ally = g.spawnUnit('footman', 0, 47, 41)
      const mine = g.spawnBuilding('goldmine', -1, 47, 39)

      const hpBefore = {
        primary: primary.hp,
        splashEnemy: splashEnemy.hp,
        farEnemy: farEnemy.hp,
        ally: ally.hp,
        mine: mine.hp,
      }

      g.dealDamage(mortar, primary)

      const damage = {
        primary: hpBefore.primary - primary.hp,
        splashEnemy: hpBefore.splashEnemy - splashEnemy.hp,
        farEnemy: hpBefore.farEnemy - farEnemy.hp,
        ally: hpBefore.ally - ally.hp,
        mine: hpBefore.mine - mine.hp,
      }

      for (const unit of [mortar, primary, splashEnemy, farEnemy, ally]) unit.hp = 0
      g.handleDeadUnits()
      g.removeTestUnit(mine)

      return {
        attackDamage: mortar.attackDamage,
        attackRange: mortar.attackRange,
        damage,
        remainingSpawnedUnits: [mortar, primary, splashEnemy, farEnemy, ally, mine]
          .filter((unit: any) => g.units.includes(unit)).length,
      }
    })

    expect(result.attackDamage).toBe(UNITS.mortar_team.attackDamage)
    expect(result.attackRange).toBe(UNITS.mortar_team.attackRange)
    expect(result.damage.primary).toBeGreaterThan(0)
    expect(result.damage.splashEnemy).toBeGreaterThan(0)
    expect(result.damage.splashEnemy).toBeLessThan(result.damage.primary)
    expect(result.damage.farEnemy).toBe(0)
    expect(result.damage.ally).toBe(0)
    expect(result.damage.mine).toBe(0)
    expect(result.remainingSpawnedUnits).toBe(0)
  })

  test('RC-3: Priest Heal consumes mana, restores HP, and rejects invalid targets', async ({ page }) => {
    await waitForGame(page)

    const result = await page.evaluate(() => {
      const g = (window as any).__war3Game
      if (!g) throw new Error('no game')

      const priest = g.spawnUnit('priest', 0, 38, 38)
      const ally = g.spawnUnit('footman', 0, 38, 39)
      const enemy = g.spawnUnit('footman', 1, 39, 38)
      const farAlly = g.spawnUnit('footman', 0, 55, 55)

      ally.hp -= 50
      enemy.hp -= 50
      farAlly.hp -= 50

      const manaBefore = priest.mana
      const hpBefore = ally.hp
      const normalHeal = g.castHeal(priest, ally)
      const afterNormalHeal = {
        allyHp: ally.hp,
        priestMana: priest.mana,
        cooldown: priest.healCooldownUntil,
      }

      ally.hp -= 25
      const cooldownHeal = g.castHeal(priest, ally)

      priest.healCooldownUntil = 0
      priest.mana = 2
      const noManaHeal = g.castHeal(priest, ally)

      priest.mana = 200
      ally.hp = ally.maxHp
      const fullHpHeal = g.castHeal(priest, ally)
      const enemyHeal = g.castHeal(priest, enemy)
      const rangeHeal = g.castHeal(priest, farAlly)

      for (const unit of [priest, ally, enemy, farAlly]) unit.hp = 0
      g.handleDeadUnits()

      return {
        initialMana: manaBefore,
        maxMana: priest.maxMana,
        manaRegen: priest.manaRegen,
        normalHeal,
        hpRestored: afterNormalHeal.allyHp - hpBefore,
        manaSpent: manaBefore - afterNormalHeal.priestMana,
        cooldownSet: afterNormalHeal.cooldown > 0,
        cooldownHeal,
        noManaHeal,
        fullHpHeal,
        enemyHeal,
        rangeHeal,
      }
    })

    expect(result.initialMana).toBe(PRIEST_MANA)
    expect(result.maxMana).toBe(PRIEST_MANA)
    expect(result.manaRegen).toBe(PRIEST_MANA_REGEN)
    expect(result.normalHeal).toBe(true)
    expect(result.hpRestored).toBe(PRIEST_HEAL_AMOUNT)
    expect(result.manaSpent).toBe(PRIEST_HEAL_MANA_COST)
    expect(result.cooldownSet).toBe(true)
    expect(result.cooldownHeal).toBe(false)
    expect(result.noManaHeal).toBe(false)
    expect(result.fullHpHeal).toBe(false)
    expect(result.enemyHeal).toBe(false)
    expect(result.rangeHeal).toBe(false)
  })
})
