/**
 * V9 HN6-IMPL6 Knight combat identity smoke.
 *
 * Proves:
 * 1. Knight runtime identity matches data: hp, armor, speed, attackDamage, Normal/Heavy
 * 2. Knight survives longer than Footman under equal Normal-type attack pressure
 * 3. Knight deals more damage per hit than Footman
 * 4. Smoke does not depend on AI Knight, Animal War Training, heroes, air, items, or assets
 */
import { test, expect, type Page } from '@playwright/test'
import { UNITS, ArmorType, AttackType } from '../src/game/GameData'

const BASE = 'http://127.0.0.1:4173/?runtimeTest=1'
const KNIGHT = UNITS.knight
const FOOTMAN = UNITS.footman

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

test.describe('V9 HN6 Knight combat identity smoke', () => {
  test.setTimeout(120000)

  test('KCS-1: Knight runtime identity matches data definition', async ({ page }) => {
    await waitForGame(page)

    const result = await page.evaluate(() => {
      const g = (window as any).__war3Game
      const knight = g.spawnUnit('knight', 0, 50, 50)
      const footman = g.spawnUnit('footman', 0, 55, 50)
      g.selectionModel.clear()
      g.selectionModel.setSelection([knight])
      g._lastSelKey = ''
      g._lastCmdKey = ''
      g.updateHUD(0.016)
      const statsText = document.getElementById('unit-stats')?.textContent ?? ''

      return {
        knight: {
          hp: knight.hp,
          maxHp: knight.maxHp,
          armor: knight.armor,
          speed: knight.speed,
          attackDamage: knight.attackDamage,
          attackRange: knight.attackRange,
          attackCooldown: knight.attackCooldown,
          statsText,
          type: knight.type,
        },
        footman: {
          hp: footman.hp,
          maxHp: footman.maxHp,
          armor: footman.armor,
          speed: footman.speed,
          attackDamage: footman.attackDamage,
          type: footman.type,
        },
      }
    })

    // Knight identity
    expect(result.knight.hp).toBe(KNIGHT.hp)
    expect(result.knight.maxHp).toBe(KNIGHT.hp)
    expect(result.knight.armor).toBe(KNIGHT.armor)
    expect(result.knight.speed).toBe(KNIGHT.speed)
    expect(result.knight.attackDamage).toBe(KNIGHT.attackDamage)
    expect(KNIGHT.attackType).toBe(AttackType.Normal)
    expect(KNIGHT.armorType).toBe(ArmorType.Heavy)
    expect(result.knight.statsText).toContain('普通')
    expect(result.knight.statsText).toContain('重甲')
    expect(result.knight.type).toBe('knight')

    // Knight vs Footman: clearly distinct
    expect(result.knight.hp).toBeGreaterThan(result.footman.hp)
    expect(result.knight.armor).toBeGreaterThan(result.footman.armor)
    expect(result.knight.attackDamage).toBeGreaterThan(result.footman.attackDamage)
    expect(result.knight.speed).toBeGreaterThanOrEqual(result.footman.speed)
  })

  test('KCS-2: Knight survives longer than Footman under equal Normal attack pressure', async ({ page }) => {
    await waitForGame(page)

    const result = await page.evaluate(() => {
      const g = (window as any).__war3Game

      // Spawn a Knight and a Footman as targets
      const knight = g.spawnUnit('knight', 0, 50, 50)
      const footman = g.spawnUnit('footman', 0, 60, 50)

      // Spawn identical Normal-attack enemies for each target
      const attackerOnKnight = g.spawnUnit('footman', 1, 51, 50)
      const attackerOnFootman = g.spawnUnit('footman', 1, 61, 50)

      // Record initial HP
      const knightHpStart = knight.hp
      const footmanHpStart = footman.hp

      // Simulate combat: run several attack cycles
      const dt = 0.016
      const steps = 600 // ~10 seconds of game time
      let knightDied = false
      let footmanDied = false
      let knightDeathStep = -1
      let footmanDeathStep = -1

      for (let i = 0; i < steps; i++) {
        // Deal damage from attackers
        g.dealDamage(attackerOnKnight, knight)
        g.dealDamage(attackerOnFootman, footman)

        // Check deaths
        if (knight.hp <= 0 && !knightDied) {
          knightDied = true
          knightDeathStep = i
        }
        if (footman.hp <= 0 && !footmanDied) {
          footmanDied = true
          footmanDeathStep = i
        }

        // If both died, stop
        if (knightDied && footmanDied) break
      }

      // Re-read final state
      const g2 = (window as any).__war3Game
      const knightAfter = g2.units.find((u: any) => u === knight)
      const footmanAfter = g2.units.find((u: any) => u === footman)

      return {
        knightHpStart,
        footmanHpStart,
        knightHpFinal: knightAfter?.hp ?? 0,
        footmanHpFinal: footmanAfter?.hp ?? 0,
        knightDied,
        footmanDied,
        knightDeathStep,
        footmanDeathStep,
        knightArmor: knight.armor,
        footmanArmor: footman.armor,
      }
    })

    // Footman must die first or Knight must have significantly more remaining HP
    if (result.footmanDied && !result.knightDied) {
      // Clear win: Footman died, Knight survived
      expect(result.knightHpFinal).toBeGreaterThan(0)
    } else if (result.knightDied && result.footmanDied) {
      // Both died: Knight must have survived longer
      expect(result.knightDeathStep).toBeGreaterThan(result.footmanDeathStep)
    } else {
      // Neither died: Knight must have significantly more remaining HP
      const knightRemaining = result.knightHpFinal / result.knightHpStart
      const footmanRemaining = result.footmanHpFinal / result.footmanHpStart
      expect(knightRemaining).toBeGreaterThan(footmanRemaining)
    }
  })

  test('KCS-3: Knight deals more damage per hit than Footman', async ({ page }) => {
    await waitForGame(page)

    const result = await page.evaluate(() => {
      const g = (window as any).__war3Game

      // Two identical targets
      const targetForKnight = g.spawnUnit('footman', 1, 50, 55)
      const targetForFootman = g.spawnUnit('footman', 1, 60, 55)

      const targetForKnightHp = targetForKnight.hp
      const targetForFootmanHp = targetForFootman.hp

      // Knight and Footman attackers
      const knight = g.spawnUnit('knight', 0, 50, 50)
      const footman = g.spawnUnit('footman', 0, 60, 50)

      g.dealDamage(knight, targetForKnight)
      g.dealDamage(footman, targetForFootman)

      return {
        knightAttackDamage: knight.attackDamage,
        footmanAttackDamage: footman.attackDamage,
        targetForKnightHpBefore: targetForKnightHp,
        targetForFootmanHpBefore: targetForFootmanHp,
        targetForKnightHpAfter: targetForKnight.hp,
        targetForFootmanHpAfter: targetForFootman.hp,
        knightDamageDealt: targetForKnightHp - targetForKnight.hp,
        footmanDamageDealt: targetForFootmanHp - targetForFootman.hp,
      }
    })

    expect(result.knightAttackDamage).toBeGreaterThan(result.footmanAttackDamage)
    expect(result.knightDamageDealt).toBeGreaterThan(result.footmanDamageDealt)
  })
})
