/**
 * V9 HN5-IMPL4 Slow runtime minimal proof.
 *
 * Proves:
 * - Slow runtime reads ABILITIES.slow.
 * - Sorceress can manually cast Slow on enemy non-buildings in range.
 * - Slow spends mana, reduces movement speed through the movement path, refreshes,
 *   and expires without mutating the unit's base speed.
 * - Command card behavior stays bounded: no mana disables, no target spends no mana,
 *   nearest valid enemy is targeted, non-Sorceress units do not show Slow.
 */
import { readFileSync } from 'node:fs'
import { test, expect, type Page } from '@playwright/test'
import { ABILITIES, UNITS } from '../src/game/GameData'

const BASE = 'http://127.0.0.1:4173/?runtimeTest=1'
const gameSource = readFileSync(new URL('../src/game/Game.ts', import.meta.url), 'utf8')
const aiSource = readFileSync(new URL('../src/game/SimpleAI.ts', import.meta.url), 'utf8')
const SLOW = ABILITIES.slow

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

test.describe('V9 HN5 Slow runtime minimal slice', () => {
  test.setTimeout(120000)

  test.beforeEach(async ({ page }) => {
    await waitForGame(page)
  })

  test('H5S-1: Slow runtime is data-read and bounded to the minimal slice', () => {
    expect(gameSource).toContain('castSlow(caster: Unit, target: Unit): boolean')
    expect(gameSource).toContain('const slowDef = ABILITIES.slow')
    expect(gameSource).toContain('slowUntil')
    expect(gameSource).toContain('slowSpeedMultiplier')
    expect(gameSource).toContain('getEffectiveMovementSpeed')
    expect(gameSource).not.toContain('autoCastSlow')
    expect(gameSource).not.toContain('attackSpeedMultiplier')
    expect(aiSource).not.toContain('slow')
    expect(aiSource).not.toContain('Slow')
  })

  test('H5S-2: castSlow spends mana, slows movement, refreshes duration, and expires cleanly', async ({ page }) => {
    const result = await page.evaluate(({ manaCost, duration, multiplier, range, baseSpeed }) => {
      const g = (window as any).__war3Game
      if (!g) throw new Error('no game')

      const sorceress = g.spawnUnit('sorceress', 0, 55, 55)
      const target = g.spawnUnit('footman', 1, 55 + Math.min(2, range - 1), 55)
      sorceress.mana = 120
      target.speed = baseSpeed
      const beforeTime = g.gameTime
      const beforeMana = sorceress.mana
      const beforeSpeed = target.speed

      const firstCast = g.castSlow(sorceress, target)
      const afterFirstMana = sorceress.mana
      const afterFirstUntil = target.slowUntil
      const afterFirstMultiplier = target.slowSpeedMultiplier
      const speedAfterCast = target.speed

      target.mesh.position.set(40, target.mesh.position.y, 40)
      target.moveTarget = { x: 40 + baseSpeed * 4, y: target.mesh.position.y, z: 40 }
      const xBeforeSlowMove = target.mesh.position.x
      g.updateUnitMovement(target, 1)
      const slowedDistance = target.mesh.position.x - xBeforeSlowMove

      target.mesh.position.set(55 + Math.min(2, range - 1), target.mesh.position.y, 55)
      target.moveTarget = null
      g.gameTime = beforeTime + 5
      const secondCast = g.castSlow(sorceress, target)
      const refreshedUntil = target.slowUntil
      const afterSecondMana = sorceress.mana

      g.gameTime = refreshedUntil + 0.01
      g.updateSlowExpiry()
      const expiredUntil = target.slowUntil
      const expiredMultiplier = target.slowSpeedMultiplier
      const speedAfterExpiry = target.speed

      target.mesh.position.set(45, target.mesh.position.y, 40)
      target.moveTarget = { x: 45 + baseSpeed * 4, y: target.mesh.position.y, z: 40 }
      const xBeforeNormalMove = target.mesh.position.x
      g.updateUnitMovement(target, 1)
      const normalDistance = target.mesh.position.x - xBeforeNormalMove

      return {
        firstCast,
        secondCast,
        manaSpentFirst: beforeMana - afterFirstMana,
        manaSpentTotal: beforeMana - afterSecondMana,
        firstDuration: afterFirstUntil - beforeTime,
        refreshedDuration: refreshedUntil - (beforeTime + 5),
        afterFirstMultiplier,
        speedAfterCast,
        beforeSpeed,
        slowedDistance,
        normalDistance,
        expiredUntil,
        expiredMultiplier,
        speedAfterExpiry,
        expected: { manaCost, duration, multiplier },
      }
    }, {
      manaCost: SLOW.cost.mana ?? 0,
      duration: SLOW.duration,
      multiplier: SLOW.speedMultiplier ?? 1,
      range: SLOW.range,
      baseSpeed: UNITS.footman.speed,
    })

    expect(result.firstCast).toBe(true)
    expect(result.secondCast).toBe(true)
    expect(result.manaSpentFirst).toBe(SLOW.cost.mana)
    expect(result.manaSpentTotal).toBe((SLOW.cost.mana ?? 0) * 2)
    expect(result.firstDuration).toBeCloseTo(SLOW.duration, 4)
    expect(result.refreshedDuration).toBeCloseTo(SLOW.duration, 4)
    expect(result.afterFirstMultiplier).toBe(SLOW.speedMultiplier)
    expect(result.speedAfterCast).toBe(result.beforeSpeed)
    expect(result.slowedDistance).toBeCloseTo(UNITS.footman.speed * (SLOW.speedMultiplier ?? 1), 3)
    expect(result.normalDistance).toBeCloseTo(UNITS.footman.speed, 3)
    expect(result.expiredUntil).toBe(0)
    expect(result.expiredMultiplier).toBe(1)
    expect(result.speedAfterExpiry).toBe(result.beforeSpeed)
  })

  test('H5S-3: command card disables on low mana, spends no mana without target, and targets nearest enemy', async ({ page }) => {
    const result = await page.evaluate(({ manaCost, range }) => {
      const g = (window as any).__war3Game
      if (!g) throw new Error('no game')

      for (const unit of g.units) {
        if (unit.team !== 0 && !unit.isBuilding) unit.hp = 0
      }

      const sorceress = g.spawnUnit('sorceress', 0, 50, 50)
      g.selectionModel.clear()
      g.selectionModel.setSelection([sorceress])

      sorceress.mana = manaCost - 1
      g._lastCmdKey = ''
      g._lastSelKey = ''
      g.updateHUD(0.016)
      const lowManaButton = [...document.querySelectorAll('#command-card button')]
        .find((button) => button.querySelector('.btn-label')?.textContent?.trim() === '减速') as HTMLButtonElement | undefined

      sorceress.mana = manaCost
      g._lastCmdKey = ''
      g._lastSelKey = ''
      g.updateHUD(0.016)
      const enabledButton = [...document.querySelectorAll('#command-card button')]
        .find((button) => button.querySelector('.btn-label')?.textContent?.trim() === '减速') as HTMLButtonElement | undefined
      enabledButton?.click()
      const manaAfterNoTarget = sorceress.mana

      const far = g.spawnUnit('footman', 1, 50 + Math.min(range - 1, 6), 50)
      const near = g.spawnUnit('footman', 1, 51, 50)
      g._lastCmdKey = ''
      g._lastSelKey = ''
      g.updateHUD(0.016)
      const targetButton = [...document.querySelectorAll('#command-card button')]
        .find((button) => button.querySelector('.btn-label')?.textContent?.trim() === '减速') as HTMLButtonElement | undefined
      targetButton?.click()

      return {
        lowManaFound: !!lowManaButton,
        lowManaDisabled: !!lowManaButton?.disabled,
        lowManaReason: lowManaButton?.textContent ?? '',
        enabledFound: !!enabledButton,
        enabledDisabled: !!enabledButton?.disabled,
        manaAfterNoTarget,
        manaAfterTarget: sorceress.mana,
        nearSlowed: near.slowUntil > g.gameTime,
        farSlowed: far.slowUntil > g.gameTime,
      }
    }, { manaCost: SLOW.cost.mana ?? 0, range: SLOW.range })

    expect(result.lowManaFound).toBe(true)
    expect(result.lowManaDisabled).toBe(true)
    expect(result.lowManaReason).toContain('魔力不足')
    expect(result.enabledFound).toBe(true)
    expect(result.enabledDisabled).toBe(false)
    expect(result.manaAfterNoTarget).toBe(SLOW.cost.mana)
    expect(result.manaAfterTarget).toBe(0)
    expect(result.nearSlowed).toBe(true)
    expect(result.farSlowed).toBe(false)
  })

  test('H5S-4: non-Sorceress units cannot cast or show Slow', async ({ page }) => {
    const result = await page.evaluate(({ manaCost }) => {
      const g = (window as any).__war3Game
      if (!g) throw new Error('no game')

      const priest = g.spawnUnit('priest', 0, 58, 58)
      const enemy = g.spawnUnit('footman', 1, 59, 58)
      priest.mana = manaCost
      const manaBefore = priest.mana
      const castResult = g.castSlow(priest, enemy)

      g.selectionModel.clear()
      g.selectionModel.setSelection([priest])
      g._lastCmdKey = ''
      g._lastSelKey = ''
      g.updateHUD(0.016)
      const labels = [...document.querySelectorAll('#command-card button')]
        .map((button) => button.querySelector('.btn-label')?.textContent?.trim() ?? '')

      return {
        castResult,
        manaAfter: priest.mana,
        manaBefore,
        enemySlowed: enemy.slowUntil > g.gameTime,
        labels,
      }
    }, { manaCost: SLOW.cost.mana ?? 0 })

    expect(result.castResult).toBe(false)
    expect(result.manaAfter).toBe(result.manaBefore)
    expect(result.enemySlowed).toBe(false)
    expect(result.labels).not.toContain(SLOW.name)
    expect(result.labels).toContain('治疗')
  })
})
