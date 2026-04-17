/**
 * V6 Human Rally Call Identity Proof
 *
 * Proves:
 * 1. Command card exposes the ability only when a valid player-owned Human source is selected
 * 2. Triggering writes real runtime state; at least one nearby friendly gets a measurable buff
 * 3. Effect has finite duration and cleanup removes it from all affected units
 * 4. Cooldown / invalid source blocks repeat spam with visible disabled reason
 * 5. Feedback is visible through state text and command-card state, bound to runtime state
 * 6. Reload / fresh start does not keep old rally-call state
 */
import { test, expect, type Page } from '@playwright/test'
import { RALLY_CALL_DURATION, RALLY_CALL_COOLDOWN, RALLY_CALL_RADIUS, RALLY_CALL_DAMAGE_BONUS } from '../src/game/GameData'

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

test.describe('V6 Human Rally Call Identity Proof', () => {
  test.beforeEach(async ({ page }) => {
    await waitForGame(page)
  })

  test('proof-1: command card shows Rally Call only for valid player units', async ({ page }) => {
    const result = await page.evaluate(() => {
      const g = (window as any).__war3Game
      if (!g) throw new Error('no game')

      const results: Record<string, boolean> = {}

      // Test 1: Select player footman → should show Rally Call
      const footman = g.spawnUnit('footman', 0, 30, 30)
      g.selectionModel.setSelection([footman])
      g._lastCmdKey = ''
      g.updateHUD(0.016)
      const cmdCard1 = document.getElementById('command-card')!
      const hasRallyForFootman = Array.from(cmdCard1.querySelectorAll('button'))
        .some(b => b.textContent?.includes('集结号令'))
      results.playerFootman = hasRallyForFootman

      // Test 2: Select worker → should NOT show Rally Call (workers excluded)
      const worker = g.spawnUnit('worker', 0, 30, 31)
      g.selectionModel.setSelection([worker])
      g._lastCmdKey = ''
      g.updateHUD(0.016)
      const cmdCard2 = document.getElementById('command-card')!
      const hasRallyForWorker = Array.from(cmdCard2.querySelectorAll('button'))
        .some(b => b.textContent?.includes('集结号令'))
      results.playerWorker = hasRallyForWorker

      // Test 3: Select enemy unit → should NOT show Rally Call
      const enemy = g.spawnUnit('footman', 1, 30, 32)
      g.selectionModel.setSelection([enemy])
      g._lastCmdKey = ''
      g.updateHUD(0.016)
      const cmdCard3 = document.getElementById('command-card')!
      const hasRallyForEnemy = Array.from(cmdCard3.querySelectorAll('button'))
        .some(b => b.textContent?.includes('集结号令'))
      results.enemyUnit = hasRallyForEnemy

      // Cleanup
      footman.hp = 0; worker.hp = 0; enemy.hp = 0
      g.handleDeadUnits()

      return results
    })

    expect(result.playerFootman).toBe(true)   // valid: player footman
    expect(result.playerWorker).toBe(false)    // excluded: worker
    expect(result.enemyUnit).toBe(false)       // excluded: enemy
  })

  test('proof-2: triggering writes real runtime state, nearby units get buff', async ({ page }) => {
    const result = await page.evaluate(() => {
      const g = (window as any).__war3Game
      if (!g) throw new Error('no game')

      // Spawn source + nearby friendlies
      const source = g.spawnUnit('footman', 0, 35, 35)
      const buddy1 = g.spawnUnit('footman', 0, 36, 35) // 1 tile away — within radius
      const buddy2 = g.spawnUnit('footman', 0, 35, 36) // 1 tile away — within radius
      const farUnit = g.spawnUnit('footman', 0, 45, 45) // far away — outside radius

      // All should start with no buff
      const beforeSource = source.rallyCallBoostUntil
      const beforeBuddy1 = buddy1.rallyCallBoostUntil
      const beforeFar = farUnit.rallyCallBoostUntil

      // Trigger
      const triggered = g.triggerRallyCall(source)

      // Read fresh state
      const freshSource = g.units.find((u: any) => u === source)
      const freshBuddy1 = g.units.find((u: any) => u === buddy1)
      const freshBuddy2 = g.units.find((u: any) => u === buddy2)
      const freshFar = g.units.find((u: any) => u === farUnit)

      // Cleanup
      source.hp = 0; buddy1.hp = 0; buddy2.hp = 0; farUnit.hp = 0
      g.handleDeadUnits()

      return {
        triggered,
        beforeSource, beforeBuddy1, beforeFar,
        sourceBoost: freshSource?.rallyCallBoostUntil ?? 0,
        buddy1Boost: freshBuddy1?.rallyCallBoostUntil ?? 0,
        buddy2Boost: freshBuddy2?.rallyCallBoostUntil ?? 0,
        farBoost: freshFar?.rallyCallBoostUntil ?? 0,
        gameTime: g.gameTime,
      }
    })

    expect(result.triggered).toBe(true)
    expect(result.beforeSource).toBe(0)
    expect(result.beforeBuddy1).toBe(0)
    // Nearby units got buffed
    expect(result.sourceBoost).toBeGreaterThan(result.gameTime)
    expect(result.buddy1Boost).toBeGreaterThan(result.gameTime)
    expect(result.buddy2Boost).toBeGreaterThan(result.gameTime)
    // Far unit NOT buffed
    expect(result.farBoost).toBe(0)
  })

  test('proof-3: finite duration and cleanup removes buff', async ({ page }) => {
    const result = await page.evaluate(async () => {
      const g = (window as any).__war3Game
      if (!g) throw new Error('no game')

      const source = g.spawnUnit('footman', 0, 40, 40)
      const buddy = g.spawnUnit('footman', 0, 40, 41)

      g.triggerRallyCall(source)

      const boostUntil = g.units.find((u: any) => u === buddy)!.rallyCallBoostUntil
      const gameNow = g.gameTime

      // Buff should expire after RALLY_CALL_DURATION seconds
      // Simulate time passing beyond duration
      g.gameTime = boostUntil + 1

      // Re-read fresh state after time passes
      const freshBuddy = g.units.find((u: any) => u === buddy && u.hp > 0)
      const isExpired = freshBuddy ? freshBuddy.rallyCallBoostUntil <= g.gameTime : true

      // Verify damage bonus is no longer applied: attack a target with armor=0
      const target = g.spawnUnit('worker', 1, 40, 42)  // worker has armor=0
      const hpBefore = target.hp
      g.dealDamage(buddy, target)
      const dmgAfterExpiry = hpBefore - target.hp

      // Cleanup
      source.hp = 0; buddy.hp = 0; target.hp = 0
      g.handleDeadUnits()

      return { boostUntil, gameNow, isExpired, dmgAfterExpiry }
    })

    // Buff was set with correct duration
    expect(result.boostUntil - result.gameNow).toBeCloseTo(RALLY_CALL_DURATION, 1)
    // After expiry, buff is gone
    expect(result.isExpired).toBe(true)
    // Damage is normal (no buff bonus)
    // footman base damage = 13, Normal vs Unarmored = 1.0x, worker armor=0 → 13
    expect(result.dmgAfterExpiry).toBe(13)
  })

  test('proof-4: cooldown blocks repeat spam with visible disabled reason', async ({ page }) => {
    const result = await page.evaluate(() => {
      const g = (window as any).__war3Game
      if (!g) throw new Error('no game')

      const source = g.spawnUnit('footman', 0, 50, 50)
      const buddy = g.spawnUnit('footman', 0, 50, 51)

      // First trigger: should succeed
      const first = g.triggerRallyCall(source)
      const cooldownUntil = source.rallyCallCooldownUntil

      // Second trigger: should fail (cooldown)
      const second = g.triggerRallyCall(source)

      // Select source and check command card
      g.selectionModel.setSelection([source])
      g._lastCmdKey = ''
      g.updateHUD(0.016)

      const cmdCard = document.getElementById('command-card')!
      const buttons = cmdCard.querySelectorAll('button')
      let rallyBtn: HTMLButtonElement | null = null
      for (const btn of buttons) {
        if (btn.textContent?.includes('集结号令')) {
          rallyBtn = btn as HTMLButtonElement
          break
        }
      }

      const isDisabled = rallyBtn?.disabled ?? false
      const disabledReason = rallyBtn?.dataset?.disabledReason ?? rallyBtn?.title ?? ''

      // Cleanup
      source.hp = 0; buddy.hp = 0
      g.handleDeadUnits()

      return { first, second, cooldownUntil, isDisabled, disabledReason, gameTime: g.gameTime }
    })

    expect(result.first).toBe(true)
    expect(result.second).toBe(false)
    expect(result.cooldownUntil).toBeGreaterThan(result.gameTime)
    expect(result.isDisabled).toBe(true)
    expect(result.disabledReason).toContain('冷却')
  })

  test('proof-5: feedback visible through state text bound to runtime', async ({ page }) => {
    const result = await page.evaluate((dmgBonus: number) => {
      const g = (window as any).__war3Game
      if (!g) throw new Error('no game')

      const source = g.spawnUnit('footman', 0, 55, 55)
      const buddy = g.spawnUnit('footman', 0, 55, 56)

      // Select buddy BEFORE buff
      g.selectionModel.setSelection([buddy])
      g._lastSelKey = ''
      g.updateHUD(0.016)
      const stateBefore = document.getElementById('unit-state')!.textContent ?? ''

      // Trigger rally call
      g.triggerRallyCall(source)

      // Force HUD refresh
      g._lastSelKey = ''
      g.updateHUD(0.016)
      const stateAfter = document.getElementById('unit-state')!.textContent ?? ''

      // Cross-check with fresh state
      const freshBuddy = g.units.find((u: any) => u === buddy && u.hp > 0)
      const hasBuff = freshBuddy ? freshBuddy.rallyCallBoostUntil > g.gameTime : false

      // Also verify command card shows the ability info
      g.selectionModel.setSelection([source])
      g._lastCmdKey = ''
      g.updateHUD(0.016)
      const cmdCard = document.getElementById('command-card')!
      const rallyBtn = Array.from(cmdCard.querySelectorAll('button'))
        .find(b => b.textContent?.includes('集结号令'))
      const showsDamageBonus = rallyBtn?.textContent?.includes(`${dmgBonus}`) ?? false

      // Cleanup
      source.hp = 0; buddy.hp = 0
      g.handleDeadUnits()

      return { stateBefore, stateAfter, hasBuff, showsDamageBonus }
    }, RALLY_CALL_DAMAGE_BONUS)

    // Before: no rally call text
    expect(result.stateBefore).not.toContain('集结号令')
    // After: state text shows the buff
    expect(result.stateAfter).toContain('集结号令')
    // DOM matches runtime state
    expect(result.hasBuff).toBe(true)
    // Command card shows real damage bonus value
    expect(result.showsDamageBonus).toBe(true)
  })

  test('proof-6: reload/fresh start does not keep old rally-call state', async ({ page }) => {
    const result = await page.evaluate(() => {
      const g = (window as any).__war3Game
      if (!g) throw new Error('no game')

      // Setup: trigger rally call with active buffs
      const source = g.spawnUnit('footman', 0, 60, 60)
      const buddy = g.spawnUnit('footman', 0, 60, 61)
      g.triggerRallyCall(source)

      const hadBuffBefore = buddy.rallyCallBoostUntil > 0
      const hadCooldownBefore = source.rallyCallCooldownUntil > 0

      // Simulate map reload via disposeAllUnits
      g.disposeAllUnits()

      // Fresh state: no units with rally state
      const freshUnits = g.units
      const anyBuff = freshUnits.some((u: any) => u.rallyCallBoostUntil > 0)
      const anyCooldown = freshUnits.some((u: any) => u.rallyCallCooldownUntil > 0)

      // Spawn new units on clean state
      const newUnit = g.spawnUnit('footman', 0, 60, 60)
      const newBuff = newUnit.rallyCallBoostUntil
      const newCooldown = newUnit.rallyCallCooldownUntil

      // Cleanup
      newUnit.hp = 0
      g.handleDeadUnits()

      return { hadBuffBefore, hadCooldownBefore, anyBuff, anyCooldown, newBuff, newCooldown }
    })

    // Before cleanup: buff was active
    expect(result.hadBuffBefore).toBe(true)
    expect(result.hadCooldownBefore).toBe(true)
    // After cleanup: no residual state
    expect(result.anyBuff).toBe(false)
    expect(result.anyCooldown).toBe(false)
    // New units start clean
    expect(result.newBuff).toBe(0)
    expect(result.newCooldown).toBe(0)
  })
})
