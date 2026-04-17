/**
 * V9 HN5-IMPL2 Sorceress training surface proof.
 *
 * Proves the next smallest playable step:
 * - Arcane Sanctum can train Sorceress through the normal command card queue.
 * - The trained Sorceress reads visible combat identity from GameData.
 * - Current HN5 stage may expose the manual Slow button after the later runtime slice.
 */
import { readFileSync } from 'node:fs'
import { test, expect, type Page } from '@playwright/test'
import {
  ABILITIES,
  ARMOR_TYPE_NAMES,
  ATTACK_TYPE_NAMES,
  AttackType,
  BUILDINGS,
  UNITS,
} from '../src/game/GameData'

const BASE = 'http://127.0.0.1:4173/?runtimeTest=1'
const gameSource = readFileSync(new URL('../src/game/Game.ts', import.meta.url), 'utf8')

const SORCERESS = UNITS.sorceress

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

test.describe('V9 HN5 Sorceress training surface', () => {
  test.setTimeout(120000)

  test.beforeEach(async ({ page }) => {
    await waitForGame(page)
  })

  test('H5T-1: data surface exposes Sorceress training, Magic display, and staged Slow runtime', () => {
    expect(BUILDINGS.arcane_sanctum.trains ?? []).toContain('priest')
    expect(BUILDINGS.arcane_sanctum.trains ?? []).toContain('sorceress')
    expect(SORCERESS.name).toBe('女巫')
    expect(SORCERESS.attackType).toBe(AttackType.Magic)
    expect(ATTACK_TYPE_NAMES[AttackType.Magic]).toBe('魔法')
    expect(ARMOR_TYPE_NAMES[SORCERESS.armorType!]).toBe('无甲')
    expect(ABILITIES.slow.ownerType).toBe('sorceress')
    expect(gameSource).toContain('ABILITIES.slow')
    expect(gameSource).toContain('castSlow')
    expect(gameSource).toContain('slowUntil')
  })

  test('H5T-2: Arcane Sanctum queues and completes Sorceress through command card', async ({ page }) => {
    const result = await page.evaluate(({ trainTime }) => {
      const g = (window as any).__war3Game
      if (!g) throw new Error('no game')

      g.resources.earn(0, 5000, 5000)
      g.spawnBuilding('farm', 0, 44, 50)
      g.spawnBuilding('farm', 0, 47, 50)
      const sanctum = g.spawnBuilding('arcane_sanctum', 0, 50, 50)

      g.selectionModel.clear()
      g.selectionModel.setSelection([sanctum])
      g._lastCmdKey = ''
      g.updateHUD(0.016)

      const labelsBefore = [...document.querySelectorAll('#command-card button')]
        .map((button) => button.querySelector('.btn-label')?.textContent?.trim() ?? '')
      const buttons = [...document.querySelectorAll('#command-card button')] as HTMLButtonElement[]
      const sorceressButton = buttons.find((button) =>
        button.querySelector('.btn-label')?.textContent?.trim() === '女巫',
      )

      const beforeQueue = sanctum.trainingQueue.length
      const beforeCount = g.units.filter((u: any) => u.team === 0 && u.type === 'sorceress' && u.hp > 0).length
      if (sorceressButton && !sorceressButton.disabled) {
        sorceressButton.click()
      }

      const queuedType = sanctum.trainingQueue[0]?.type ?? ''
      const queueAfterClick = sanctum.trainingQueue.length

      const dt = 0.5
      for (let i = 0; i < Math.ceil(trainTime / dt) + 4; i++) {
        g.gameTime += dt
        g.updateUnits(dt)
      }

      const sorceresses = g.units.filter((u: any) => u.team === 0 && u.type === 'sorceress' && u.hp > 0)
      const trained = sorceresses[sorceresses.length - 1]
      if (trained) {
        g.selectionModel.clear()
        g.selectionModel.setSelection([trained])
        g._lastCmdKey = ''
        g.updateHUD(0.016)
      }

      const unitName = document.getElementById('unit-name')?.textContent ?? ''
      const typeBadge = document.getElementById('unit-type-badge')?.textContent ?? ''
      const statsText = document.getElementById('unit-stats')?.textContent ?? ''
      const commandLabelsAfterSelect = [...document.querySelectorAll('#command-card button')]
        .map((button) => button.querySelector('.btn-label')?.textContent?.trim() ?? '')

      return {
        labelsBefore,
        buttonFound: !!sorceressButton,
        buttonEnabled: !!sorceressButton && !sorceressButton.disabled,
        queueAfterClick,
        beforeQueue,
        queuedType,
        countDelta: sorceresses.length - beforeCount,
        queueAfterFinish: sanctum.trainingQueue.length,
        unitName,
        typeBadge,
        statsText,
        commandLabelsAfterSelect,
      }
    }, { trainTime: SORCERESS.trainTime })

    expect(result.labelsBefore).toContain('牧师')
    expect(result.labelsBefore).toContain('女巫')
    expect(result.buttonFound).toBe(true)
    expect(result.buttonEnabled).toBe(true)
    expect(result.queueAfterClick).toBe(result.beforeQueue + 1)
    expect(result.queuedType).toBe('sorceress')
    expect(result.countDelta).toBe(1)
    expect(result.queueAfterFinish).toBe(0)
    expect(result.unitName).toBe('女巫')
    expect(result.typeBadge).toBe('法师')
    expect(result.statsText).toContain(`⚔ ${SORCERESS.attackDamage}`)
    expect(result.statsText).toContain(`🛡 ${SORCERESS.armor}`)
    expect(result.statsText).toContain(`🎯 ${SORCERESS.attackRange}`)
    expect(result.statsText).toContain('魔法')
    expect(result.statsText).toContain('无甲')
    expect(result.commandLabelsAfterSelect).toContain('减速')
  })
})
