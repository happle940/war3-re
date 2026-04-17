/**
 * V9 HN4-IMPL5 Defend Runtime Proof
 *
 * Proves:
 * 1. Footman command card shows data-driven Defend toggle
 * 2. Toggle reduces speed and can restore it
 * 3. Piercing damage is reduced while Defend is active
 * 4. Normal and Siege damage are not reduced by Defend
 * 5. Non-Footman units do not show Defend
 */
import { test, expect, type Page } from '@playwright/test'
import { ABILITIES, ArmorType, AttackType, getTypeMultiplier, UNITS } from '../src/game/GameData'

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
  await page.waitForTimeout(300)
}

function expectedDamage(attackerType: string, targetType: string, defend = false) {
  const attacker = UNITS[attackerType]
  const target = UNITS[targetType]
  const typeMultiplier = getTypeMultiplier(attacker.attackType ?? AttackType.Normal, target.armorType ?? ArmorType.Medium)
  const armorReduction = target.armor > 0
    ? (target.armor * 0.06) / (1 + 0.06 * target.armor)
    : 0
  const defendMultiplier = defend && attacker.attackType === ABILITIES.defend.affectedAttackType
    ? (ABILITIES.defend.damageReduction ?? 1)
    : 1
  return Math.max(1, Math.round(attacker.attackDamage * typeMultiplier * defendMultiplier * (1 - armorReduction)))
}

test.describe('V9 HN4-IMPL5 Defend Runtime', () => {
  test.setTimeout(120000)

  test.beforeEach(async ({ page }) => {
    await waitForGame(page)
  })

  test('proof-1: Footman shows data-driven 防御姿态 button; non-Footman does not', async ({ page }) => {
    const result = await page.evaluate(() => {
      const g = (window as any).__war3Game
      const footman = g.spawnUnit('footman', 0, 40, 40)
      const worker = g.spawnUnit('worker', 0, 42, 40)

      g.selectionModel.setSelection([footman])
      g._lastCmdKey = ''
      g.updateCommandCard()
      const footmanText = document.getElementById('command-card')?.textContent ?? ''

      g.selectionModel.setSelection([worker])
      g._lastCmdKey = ''
      g.updateCommandCard()
      const workerText = document.getElementById('command-card')?.textContent ?? ''

      footman.hp = 0
      worker.hp = 0
      g.handleDeadUnits()

      return {
        footmanText,
        workerText,
      }
    })

    expect(result.footmanText).toContain(ABILITIES.defend.name)
    expect(result.footmanText).toContain(`${ABILITIES.defend.damageReduction}`)
    expect(result.workerText).not.toContain(ABILITIES.defend.name)
  })

  test('proof-2: clicking Defend toggles speed down and restores it', async ({ page }) => {
    const result = await page.evaluate(() => {
      const g = (window as any).__war3Game
      const footman = g.spawnUnit('footman', 0, 40, 40)
      const baseSpeed = footman.speed

      g.selectionModel.setSelection([footman])
      g._lastCmdKey = ''
      g.updateCommandCard()
      const firstButton = Array.from(document.querySelectorAll('#command-card button'))
        .find((b: any) => b.textContent?.includes('防御姿态')) as HTMLButtonElement | undefined
      firstButton?.click()
      const activeAfterFirstClick = footman.defendActive
      const speedAfterFirstClick = footman.speed

      g._lastCmdKey = ''
      g.updateCommandCard()
      const secondButton = Array.from(document.querySelectorAll('#command-card button'))
        .find((b: any) => b.textContent?.includes('防御姿态')) as HTMLButtonElement | undefined
      const secondLabel = secondButton?.textContent ?? ''
      secondButton?.click()
      const activeAfterSecondClick = footman.defendActive
      const speedAfterSecondClick = footman.speed

      footman.hp = 0
      g.handleDeadUnits()

      return {
        clickedFirst: !!firstButton,
        clickedSecond: !!secondButton,
        secondLabel,
        activeAfterFirstClick,
        speedAfterFirstClick,
        activeAfterSecondClick,
        speedAfterSecondClick,
        baseSpeed,
      }
    })

    expect(result.clickedFirst).toBe(true)
    expect(result.clickedSecond).toBe(true)
    expect(result.secondLabel).toContain('✓')
    expect(result.activeAfterFirstClick).toBe(true)
    expect(result.speedAfterFirstClick).toBeCloseTo(UNITS.footman.speed * (ABILITIES.defend.speedMultiplier ?? 1), 5)
    expect(result.activeAfterSecondClick).toBe(false)
    expect(result.speedAfterSecondClick).toBeCloseTo(result.baseSpeed, 5)
  })

  test('proof-3: Defend reduces Piercing damage using ABILITIES.defend', async ({ page }) => {
    const result = await page.evaluate(() => {
      const g = (window as any).__war3Game
      const attacker = g.spawnUnit('rifleman', 1, 46, 46)
      const target = g.spawnUnit('footman', 0, 46.5, 46)

      target.hp = target.maxHp
      g.setDefend(target, false)
      g.dealDamage(attacker, target)
      const normalDamage = target.maxHp - target.hp

      target.hp = target.maxHp
      g.setDefend(target, true)
      g.dealDamage(attacker, target)
      const defendedDamage = target.maxHp - target.hp

      attacker.hp = 0
      target.hp = 0
      g.handleDeadUnits()

      return { normalDamage, defendedDamage }
    })

    expect(result.normalDamage).toBe(expectedDamage('rifleman', 'footman', false))
    expect(result.defendedDamage).toBe(expectedDamage('rifleman', 'footman', true))
    expect(result.defendedDamage).toBeLessThan(result.normalDamage)
  })

  test('proof-4: Defend does not reduce Normal or Siege damage', async ({ page }) => {
    const result = await page.evaluate(() => {
      const g = (window as any).__war3Game
      const normalAttacker = g.spawnUnit('footman', 1, 48, 48)
      const siegeAttacker = g.spawnUnit('mortar_team', 1, 49, 48)
      const target = g.spawnUnit('footman', 0, 48.5, 48)

      target.hp = target.maxHp
      g.setDefend(target, false)
      g.dealDamage(normalAttacker, target)
      const normalOff = target.maxHp - target.hp

      target.hp = target.maxHp
      g.setDefend(target, true)
      g.dealDamage(normalAttacker, target)
      const normalOn = target.maxHp - target.hp

      target.hp = target.maxHp
      g.setDefend(target, false)
      g.dealDamage(siegeAttacker, target)
      const siegeOff = target.maxHp - target.hp

      target.hp = target.maxHp
      g.setDefend(target, true)
      g.dealDamage(siegeAttacker, target)
      const siegeOn = target.maxHp - target.hp

      normalAttacker.hp = 0
      siegeAttacker.hp = 0
      target.hp = 0
      g.handleDeadUnits()

      return { normalOff, normalOn, siegeOff, siegeOn }
    })

    expect(result.normalOn).toBe(result.normalOff)
    expect(result.siegeOn).toBe(result.siegeOff)
  })

  test('proof-5: Non-Footman types do not show Defend button', async ({ page }) => {
    const result = await page.evaluate(() => {
      const g = (window as any).__war3Game
      const types = ['priest', 'rifleman', 'mortar_team']
      const results: Record<string, boolean> = {}

      for (const type of types) {
        const unit = g.spawnUnit(type, 0, 55, 55)
        g.selectionModel.setSelection([unit])
        g._lastCmdKey = ''
        g.updateCommandCard()
        results[type] = (document.getElementById('command-card')?.textContent ?? '').includes('防御姿态')
        unit.hp = 0
      }
      g.handleDeadUnits()

      return results
    })

    for (const [type, hasDefend] of Object.entries(result)) {
      expect(hasDefend).toBe(false)
    }
  })

  test('proof-6: Militia / Back to Work / Call to Arms still work', async ({ page }) => {
    const result = await page.evaluate(() => {
      const g = (window as any).__war3Game

      // Call to Arms
      const hall = g.units.find((u: any) => u.type === 'townhall' && u.team === 0 && u.hp > 0)
      if (!hall) throw new Error('no townhall')
      const worker = g.spawnUnit('worker', 0, hall.mesh.position.x + 1, hall.mesh.position.z + 1)
      const morphed = g.morphToMilitia(worker)
      // Read type immediately after morph (before backToWork mutates same object)
      const militiaType = g.units.find((u: any) => u === worker && u.hp > 0)?.type

      // Back to Work
      const reverted = g.backToWork(worker)
      const workerType = g.units.find((u: any) => u === worker && u.hp > 0)?.type

      // Rally Call
      const footman = g.spawnUnit('footman', 0, 50, 50)
      const buddy = g.spawnUnit('footman', 0, 50.5, 50)
      const rallyOk = g.triggerRallyCall(footman)

      // Cleanup
      worker.hp = 0; footman.hp = 0; buddy.hp = 0
      g.handleDeadUnits()

      return { morphed, militiaType, reverted, workerType, rallyOk }
    })

    expect(result.morphed).toBe(true)
    expect(result.militiaType).toBe('militia')
    expect(result.reverted).toBe(true)
    expect(result.workerType).toBe('worker')
    expect(result.rallyOk).toBe(true)
  })
})
