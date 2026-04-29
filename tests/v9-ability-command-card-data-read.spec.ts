/**
 * V9 HN3-UX8 ability command-card data-read migration.
 *
 * Proves:
 * - Command-card builder/status UI reads existing ability values from ABILITIES.
 * - Command-card/status source no longer reads RALLY_CALL_* / PRIEST_HEAL_* constants directly.
 * - Rally Call and Priest Heal visible command-card values remain unchanged.
 * - Manual Heal still uses the ability range when selecting an injured friendly target.
 */
import { readFileSync } from 'node:fs'
import { test, expect, type Page } from '@playwright/test'
import { ABILITIES } from '../src/game/GameData'

const BASE = 'http://127.0.0.1:4173/?runtimeTest=1'
const gameSource = readFileSync(new URL('../src/game/Game.ts', import.meta.url), 'utf8')
const unitCommandSource = readFileSync(new URL('../src/game/ui/UnitCommandButtonBuilders.ts', import.meta.url), 'utf8')
const abilityUiSource = `${gameSource}\n${unitCommandSource}`

const RALLY = ABILITIES.rally_call
const HEAL = ABILITIES.priest_heal
const HEAL_EXPECTED = {
  manaCost: HEAL.cost.mana ?? 0,
  amount: HEAL.effectValue,
  range: HEAL.range,
}

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

test.describe('V9 ability command-card data-read migration', () => {
  test.setTimeout(120000)

  test.beforeEach(async ({ page }) => {
    await waitForGame(page)
  })

  test('proof-1: visible ability UI reads ABILITIES instead of legacy constants', async () => {
    expect(abilityUiSource).toContain('ABILITIES.rally_call.effectValue')
    expect(abilityUiSource).toContain('ABILITIES.rally_call.duration')
    expect(abilityUiSource).toContain('ABILITIES.priest_heal.cost.mana ?? 0')
    expect(abilityUiSource).toContain('ABILITIES.priest_heal.effectValue')
    expect(abilityUiSource).toContain('ABILITIES.priest_heal.range')

    expect(abilityUiSource).not.toMatch(/\bRALLY_CALL_(?:DURATION|COOLDOWN|RADIUS|DAMAGE_BONUS)\b/)
    expect(abilityUiSource).not.toMatch(/\bPRIEST_HEAL_(?:AMOUNT|MANA_COST|COOLDOWN|RANGE)\b/)
  })

  test('proof-2: Rally Call command card and selected-state text show ability data values', async ({ page }) => {
    const result = await page.evaluate((expected) => {
      const g = (window as any).__war3Game
      if (!g) throw new Error('no game')

      const source = g.spawnUnit('footman', 0, 80, 80)
      source.rallyCallBoostUntil = g.gameTime + expected.duration
      g.selectionModel.setSelection([source])
      g._lastCmdKey = ''
      g._lastSelKey = ''
      g.updateSelectionHUD()
      g.updateCommandCard()

      const buttons = Array.from(document.querySelectorAll('#command-card button'))
      const rallyButton = buttons.find((btn) => btn.textContent?.includes('集结号令')) as HTMLButtonElement | undefined
      const stateText = document.getElementById('unit-state')?.textContent ?? ''
      const buttonText = rallyButton?.textContent ?? ''

      source.hp = 0
      g.handleDeadUnits()

      return { buttonText, stateText }
    }, {
      effectValue: RALLY.effectValue,
      duration: RALLY.duration,
    })

    expect(result.buttonText).toContain('集结号令')
    expect(result.buttonText).toContain(`伤害+${RALLY.effectValue}`)
    expect(result.buttonText).toContain(`${RALLY.duration}s`)
    expect(result.stateText).toContain(`集结号令 +${RALLY.effectValue}伤害`)
  })

  test('proof-3: Priest Heal command card displays ability data and manual Heal uses ability range', async ({ page }) => {
    const result = await page.evaluate((expected) => {
      const g = (window as any).__war3Game
      if (!g) throw new Error('no game')

      const priest = g.spawnUnit('priest', 0, 90, 90)
      const nearAlly = g.spawnUnit('footman', 0, 90, 90 + expected.range * 0.75)
      const farAlly = g.spawnUnit('footman', 0, 90, 90 + expected.range * 1.25)
      priest.mana = expected.manaCost
      priest.healCooldownUntil = 0
      nearAlly.hp = nearAlly.maxHp - 50
      farAlly.hp = farAlly.maxHp - 50

      g.selectionModel.setSelection([priest])
      g._lastCmdKey = ''
      g.updateCommandCard()

      const buttons = Array.from(document.querySelectorAll('#command-card button'))
      const healButton = buttons.find((btn) => btn.textContent?.includes('治疗')) as HTMLButtonElement | undefined
      const buttonText = healButton?.textContent ?? ''

      const nearBefore = nearAlly.hp
      const farBefore = farAlly.hp
      healButton?.click()

      const data = {
        buttonText,
        nearRestored: nearAlly.hp - nearBefore,
        farRestored: farAlly.hp - farBefore,
        manaSpent: expected.manaCost - priest.mana,
      }

      for (const unit of [priest, nearAlly, farAlly]) unit.hp = 0
      g.handleDeadUnits()
      return data
    }, HEAL_EXPECTED)

    expect(result.buttonText).toContain('治疗')
    expect(result.buttonText).toContain(`💧${HEAL_EXPECTED.manaCost}`)
    expect(result.buttonText).toContain(`回复${HEAL_EXPECTED.amount}HP`)
    expect(result.nearRestored).toBe(HEAL_EXPECTED.amount)
    expect(result.farRestored).toBe(0)
    expect(result.manaSpent).toBe(HEAL_EXPECTED.manaCost)
  })
})
