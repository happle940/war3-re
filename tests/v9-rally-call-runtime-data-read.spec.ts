/**
 * V9 Rally Call Runtime Data-Read Migration Proof
 *
 * Proves that after migrating triggerRallyCall and dealDamage to read from
 * ABILITIES.rally_call, all user-visible behavior is unchanged:
 *
 * 1. Game.ts reads cooldown, range, duration, effectValue from ABILITIES.rally_call
 * 2. Rally Call still rejects buildings, enemies, cooldown, non-player sources
 * 3. Friendly non-building units in range still get the same duration buff
 * 4. Attacks during buff still add the same damage bonus
 */
import { test, expect, type Page } from '@playwright/test'
import { readFileSync } from 'node:fs'
import { ABILITIES } from '../src/game/GameData'
import {
  RALLY_CALL_DURATION,
  RALLY_CALL_COOLDOWN,
  RALLY_CALL_RADIUS,
  RALLY_CALL_DAMAGE_BONUS,
} from '../src/game/GameData'

const BASE = 'http://127.0.0.1:4173/?runtimeTest=1'
const gameSource = readFileSync(new URL('../src/game/Game.ts', import.meta.url), 'utf8')

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

test.describe('V9 Rally Call Runtime Data-Read Migration', () => {
  test.beforeEach(async ({ page }) => {
    await waitForGame(page)
  })

  test('proof-1: Game.ts reads Rally Call runtime values from ABILITIES.rally_call', () => {
    expect(gameSource).toContain('const rc = ABILITIES.rally_call')
    expect(gameSource).toContain('now + rc.duration')
    expect(gameSource).toContain('dist > rc.range')
    expect(gameSource).toContain('now + rc.cooldown')
    expect(gameSource).toContain('rawDamage += ABILITIES.rally_call.effectValue')
  })

  test('proof-2: ABILITIES.rally_call seed matches legacy constants', () => {
    const rc = ABILITIES.rally_call
    expect(rc.cooldown).toBe(RALLY_CALL_COOLDOWN)
    expect(rc.range).toBe(RALLY_CALL_RADIUS)
    expect(rc.duration).toBe(RALLY_CALL_DURATION)
    expect(rc.effectValue).toBe(RALLY_CALL_DAMAGE_BONUS)
  })

  test('proof-3: rejects building, enemy, cooldown, non-player source', async ({ page }) => {
    const result = await page.evaluate(() => {
      const g = (window as any).__war3Game
      if (!g) throw new Error('no game')

      // Building source: rejected
      const building = g.units.find((u: any) => u.isBuilding && u.team === 0 && u.hp > 0)
      const buildingResult = building ? g.triggerRallyCall(building) : 'no-building'

      // Enemy source: rejected
      const enemy = g.spawnUnit('footman', 1, 30, 30)
      const enemyResult = g.triggerRallyCall(enemy)

      // Valid player source with cooldown: rejected
      const source = g.spawnUnit('footman', 0, 30, 31)
      const buddy = g.spawnUnit('footman', 0, 30, 31.5)
      g.triggerRallyCall(source) // first trigger succeeds
      const cooldownResult = g.triggerRallyCall(source) // second blocked by cooldown

      // Cleanup
      enemy.hp = 0; source.hp = 0; buddy.hp = 0
      g.handleDeadUnits()

      return { buildingResult, enemyResult, cooldownResult }
    })

    expect(result.buildingResult).toBe(false)
    expect(result.enemyResult).toBe(false)
    expect(result.cooldownResult).toBe(false)
  })

  test('proof-4: friendly non-building units in range get buff with correct duration', async ({ page }) => {
    const result = await page.evaluate(() => {
      const g = (window as any).__war3Game
      if (!g) throw new Error('no game')

      const source = g.spawnUnit('footman', 0, 40, 40)
      const nearBuddy = g.spawnUnit('footman', 0, 41, 40)   // distance ~1
      const farBuddy = g.spawnUnit('footman', 0, 50, 50)    // far outside radius
      const enemyNear = g.spawnUnit('footman', 1, 40.5, 40) // enemy near — excluded

      const gameNow = g.gameTime
      const triggered = g.triggerRallyCall(source)

      // Read fresh state
      const freshSource = g.units.find((u: any) => u === source)
      const freshNear = g.units.find((u: any) => u === nearBuddy)
      const freshFar = g.units.find((u: any) => u === farBuddy)
      const freshEnemy = g.units.find((u: any) => u === enemyNear)

      const sourceDuration = freshSource ? freshSource.rallyCallBoostUntil - gameNow : -1
      const nearDuration = freshNear ? freshNear.rallyCallBoostUntil - gameNow : -1
      const farBoost = freshFar ? freshFar.rallyCallBoostUntil : -1
      const enemyBoost = freshEnemy ? freshEnemy.rallyCallBoostUntil : -1

      // Cleanup
      source.hp = 0; nearBuddy.hp = 0; farBuddy.hp = 0; enemyNear.hp = 0
      g.handleDeadUnits()

      return { triggered, gameNow, sourceDuration, nearDuration, farBoost, enemyBoost }
    })

    expect(result.triggered).toBe(true)
    // Source and near buddy got buff with duration matching the data seed.
    expect(result.sourceDuration).toBeCloseTo(ABILITIES.rally_call.duration, 1)
    expect(result.nearDuration).toBeCloseTo(ABILITIES.rally_call.duration, 1)
    // Far unit and enemy NOT buffed
    expect(result.farBoost).toBe(0)
    expect(result.enemyBoost).toBe(0)
  })

  test('proof-5: damage bonus during buff matches ABILITIES.rally_call.effectValue', async ({ page }) => {
    const result = await page.evaluate(() => {
      const g = (window as any).__war3Game
      if (!g) throw new Error('no game')

      const attacker = g.spawnUnit('footman', 0, 50, 50)
      const buddy = g.spawnUnit('footman', 0, 50, 50.5)
      const targetWorker = g.spawnUnit('worker', 1, 50, 51) // worker: armor=0, Unarmored

      // Measure base damage WITHOUT buff
      const hpBeforeNoBuff = targetWorker.hp
      g.dealDamage(attacker, targetWorker)
      const baseDmg = hpBeforeNoBuff - targetWorker.hp

      // Heal target for next test
      targetWorker.hp = targetWorker.maxHp

      // Trigger Rally Call and measure damage WITH buff
      g.triggerRallyCall(buddy)
      const freshAttacker = g.units.find((u: any) => u === attacker && u.hp > 0)
      const isBuffed = freshAttacker ? freshAttacker.rallyCallBoostUntil > g.gameTime : false

      const hpBeforeBuff = targetWorker.hp
      g.dealDamage(freshAttacker ?? attacker, targetWorker)
      const buffDmg = hpBeforeBuff - targetWorker.hp

      const bonusDelta = buffDmg - baseDmg

      // Cleanup
      attacker.hp = 0; buddy.hp = 0; targetWorker.hp = 0
      g.handleDeadUnits()

      return { baseDmg, buffDmg, bonusDelta, isBuffed }
    })

    // Attacker got the buff
    expect(result.isBuffed).toBe(true)
    // Base damage: footman(13) vs worker Unarmored(1.0x), armor=0 → 13
    expect(result.baseDmg).toBe(13)
    // Buffed damage: 13 + ABILITIES.rally_call.effectValue
    expect(result.buffDmg).toBe(13 + ABILITIES.rally_call.effectValue)
    // The delta matches the data seed value
    expect(result.bonusDelta).toBe(ABILITIES.rally_call.effectValue)
  })

  test('proof-6: cooldown duration matches ABILITIES.rally_call.cooldown', async ({ page }) => {
    const result = await page.evaluate(() => {
      const g = (window as any).__war3Game
      if (!g) throw new Error('no game')

      const source = g.spawnUnit('footman', 0, 60, 60)
      const buddy = g.spawnUnit('footman', 0, 60, 60.5)

      const gameNow = g.gameTime
      g.triggerRallyCall(source)

      const freshSource = g.units.find((u: any) => u === source && u.hp > 0)
      const cooldownDuration = freshSource ? freshSource.rallyCallCooldownUntil - gameNow : -1

      // Cleanup
      source.hp = 0; buddy.hp = 0
      g.handleDeadUnits()

      return { cooldownDuration }
    })

    expect(result.cooldownDuration).toBeCloseTo(ABILITIES.rally_call.cooldown, 1)
  })

  test('proof-7: range cutoff matches ABILITIES.rally_call.range', async ({ page }) => {
    const result = await page.evaluate((radius: number) => {
      const g = (window as any).__war3Game
      if (!g) throw new Error('no game')

      const source = g.spawnUnit('footman', 0, 70, 70)
      // Spawn buddy just inside range (distance slightly less than radius)
      const justInside = g.spawnUnit('footman', 0, 70 + radius * 0.99, 70)
      // Spawn buddy just outside range (distance slightly more than radius)
      const justOutside = g.spawnUnit('footman', 0, 70 + radius * 1.01, 70)

      g.triggerRallyCall(source)

      const freshInside = g.units.find((u: any) => u === justInside)
      const freshOutside = g.units.find((u: any) => u === justOutside)

      const insideGotBuff = freshInside ? freshInside.rallyCallBoostUntil > g.gameTime : false
      const outsideGotBuff = freshOutside ? freshOutside.rallyCallBoostUntil > 0 : true

      // Cleanup
      source.hp = 0; justInside.hp = 0; justOutside.hp = 0
      g.handleDeadUnits()

      return { insideGotBuff, outsideGotBuff }
    }, ABILITIES.rally_call.range)

    expect(result.insideGotBuff).toBe(true)
    expect(result.outsideGotBuff).toBe(false)
  })
})
