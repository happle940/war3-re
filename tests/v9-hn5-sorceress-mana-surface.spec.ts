/**
 * V9 HN5-IMPL3 Sorceress mana surface proof.
 *
 * Proves:
 * - caster mana is declared on UnitDef data, not hardcoded to Priest in Game.ts.
 * - Sorceress gets visible mana and mana regen from UNITS.sorceress.
 * - Priest still has mana and Heal command-card behavior.
 * - Current HN5 stage keeps Sorceress mana compatible with the manual Slow runtime slice.
 */
import { readFileSync } from 'node:fs'
import { test, expect, type Page } from '@playwright/test'
import { ABILITIES, UNITS } from '../src/game/GameData'

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

test.describe('V9 HN5 Sorceress mana surface', () => {
  test.setTimeout(120000)

  test.beforeEach(async ({ page }) => {
    await waitForGame(page)
  })

  test('H5M-1: caster mana is declared in UnitDef data and Game.ts reads it generically', () => {
    expect(UNITS.priest.maxMana).toBeGreaterThan(0)
    expect(UNITS.priest.manaRegen).toBeGreaterThan(0)
    expect(UNITS.sorceress.maxMana).toBeGreaterThan(0)
    expect(UNITS.sorceress.manaRegen).toBeGreaterThan(0)
    expect(gameSource).toContain('mana: UNITS[type]?.maxMana ?? 0')
    expect(gameSource).toContain('maxMana: UNITS[type]?.maxMana ?? 0')
    expect(gameSource).toContain('manaRegen: UNITS[type]?.manaRegen ?? 0')
    expect(gameSource).not.toContain("mana: type === 'priest'")
    expect(gameSource).not.toContain("maxMana: type === 'priest'")
    expect(gameSource).not.toContain("manaRegen: type === 'priest'")
    expect(gameSource).toContain('ABILITIES.slow')
    expect(gameSource).toContain('castSlow')
    expect(gameSource).toContain('slowUntil')
  })

  test('H5M-2: Sorceress has visible mana, regenerates from data, and exposes Slow from that mana pool', async ({ page }) => {
    const result = await page.evaluate(({ maxMana, manaRegen }) => {
      const g = (window as any).__war3Game
      if (!g) throw new Error('no game')

      const sorceress = g.spawnUnit('sorceress', 0, 60, 60)
      g.selectionModel.clear()
      g.selectionModel.setSelection([sorceress])
      g._lastCmdKey = ''
      g._lastSelKey = ''
      g.updateHUD(0.016)

      const initialStats = document.getElementById('unit-stats')?.textContent ?? ''
      const initialLabels = [...document.querySelectorAll('#command-card button')]
        .map((button) => button.querySelector('.btn-label')?.textContent?.trim() ?? '')

      sorceress.mana = Math.max(0, maxMana - 20)
      g.gameTime += 4
      g.updateCasterAbilities(4)
      g._lastSelKey = ''
      g.updateHUD(0.016)

      const regenStats = document.getElementById('unit-stats')?.textContent ?? ''
      const manaAfterRegen = sorceress.mana

      sorceress.mana = maxMana - 1
      g.gameTime += 20
      g.updateCasterAbilities(20)

      return {
        initialMana: sorceress.maxMana,
        maxMana: sorceress.maxMana,
        manaRegen: sorceress.manaRegen,
        initialStats,
        regenStats,
        manaAfterRegen,
        cappedMana: sorceress.mana,
        initialLabels,
        expectedAfterRegen: Math.min(maxMana, maxMana - 20 + manaRegen * 4),
      }
    }, { maxMana: UNITS.sorceress.maxMana ?? 0, manaRegen: UNITS.sorceress.manaRegen ?? 0 })

    expect(result.initialMana).toBe(UNITS.sorceress.maxMana)
    expect(result.maxMana).toBe(UNITS.sorceress.maxMana)
    expect(result.manaRegen).toBe(UNITS.sorceress.manaRegen)
    expect(result.initialStats).toContain(`💧 ${UNITS.sorceress.maxMana}/${UNITS.sorceress.maxMana}`)
    expect(result.manaAfterRegen).toBe(result.expectedAfterRegen)
    expect(result.regenStats).toContain(`💧 ${Math.floor(result.expectedAfterRegen)}/${UNITS.sorceress.maxMana}`)
    expect(result.cappedMana).toBe(UNITS.sorceress.maxMana)
    expect(result.initialLabels).toContain(ABILITIES.slow.name)
  })

  test('H5M-3: Priest still has mana and Heal while Slow remains Sorceress-only', async ({ page }) => {
    const result = await page.evaluate(() => {
      const g = (window as any).__war3Game
      if (!g) throw new Error('no game')

      const priest = g.spawnUnit('priest', 0, 65, 65)
      const ally = g.spawnUnit('footman', 0, 66, 65)
      ally.hp = Math.max(1, ally.maxHp - 50)

      g.selectionModel.clear()
      g.selectionModel.setSelection([priest])
      g._lastCmdKey = ''
      g._lastSelKey = ''
      g.updateHUD(0.016)

      const stats = document.getElementById('unit-stats')?.textContent ?? ''
      const labels = [...document.querySelectorAll('#command-card button')]
        .map((button) => button.querySelector('.btn-label')?.textContent?.trim() ?? '')

      return {
        priestMana: priest.mana,
        priestMaxMana: priest.maxMana,
        priestManaRegen: priest.manaRegen,
        stats,
        labels,
      }
    })

    expect(result.priestMana).toBe(UNITS.priest.maxMana)
    expect(result.priestMaxMana).toBe(UNITS.priest.maxMana)
    expect(result.priestManaRegen).toBe(UNITS.priest.manaRegen)
    expect(result.stats).toContain(`💧 ${UNITS.priest.maxMana}/${UNITS.priest.maxMana}`)
    expect(result.labels).toContain('治疗')
    expect(result.labels).not.toContain(ABILITIES.slow.name)
  })
})
