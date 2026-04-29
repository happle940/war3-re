/**
 * Hero ability feedback runtime proof.
 *
 * Proves successful hero ability actions write a short, player-visible HUD
 * confirmation on the casting hero.
 */
import { test, expect, type Page } from '@playwright/test'

const BASE = 'http://127.0.0.1:4173/?runtimeTest=1'

async function waitForGame(page: Page) {
  await page.goto(BASE, { waitUntil: 'domcontentloaded' })
  await page.waitForFunction(() => {
    const game = (window as any).__war3Game
    const canvas = document.getElementById('game-canvas')
    return !!game && !!canvas && Array.isArray(game.units) && game.units.length > 0
  }, { timeout: 15000 })

  try {
    await page.waitForFunction(() => {
      const status = document.getElementById('map-status')?.textContent ?? ''
      return !status.includes('正在加载')
    }, { timeout: 15000 })
  } catch {
    // Procedural fallback is valid for runtime tests.
  }

  await page.evaluate(() => {
    const g = (window as any).__war3Game
    if (g?.ai) {
      if (typeof g.ai.reset === 'function') g.ai.reset()
      g.ai.update = () => {}
    }
  })
}

test.describe('Hero ability feedback runtime', () => {
  test.setTimeout(90000)

  test('Paladin and Mountain King casts show caster HUD feedback', async ({ page }) => {
    await waitForGame(page)

    const result = await page.evaluate(() => {
      const g = (window as any).__war3Game

      const paladin = g.spawnUnit('paladin', 0, 30, 30)
      const footman = g.spawnUnit('footman', 0, 31, 30)
      paladin.abilityLevels = { holy_light: 1 }
      paladin.mana = 200
      footman.hp = 100
      footman.maxHp = 420
      g.castHolyLight(paladin, footman)
      g.selectionModel.clear()
      g.selectionModel.setSelection([paladin])
      g._lastCmdKey = ''
      g._lastSelKey = ''
      g.updateHUD(0.016)
      const paladinStats = document.getElementById('unit-stats')?.textContent ?? ''

      const mk = g.spawnUnit('mountain_king', 0, 40, 40)
      const enemyA = g.spawnUnit('footman', 1, 41, 40)
      const enemyB = g.spawnUnit('rifleman', 1, 41.5, 40)
      enemyA.hp = 420
      enemyA.maxHp = 420
      enemyB.hp = 420
      enemyB.maxHp = 420
      mk.abilityLevels = { thunder_clap: 1, avatar: 1, bash: 1 }
      mk.heroLevel = 6
      mk.mana = 500
      g.castThunderClap(mk)
      g.selectionModel.clear()
      g.selectionModel.setSelection([mk])
      g._lastCmdKey = ''
      g._lastSelKey = ''
      g.updateHUD(0.016)
      const clapStats = document.getElementById('unit-stats')?.textContent ?? ''

      mk.thunderClapCooldownUntil = 0
      const originalRandom = Math.random
      try {
        Math.random = () => 0
        g.dealDamage(mk, enemyA)
      } finally {
        Math.random = originalRandom
      }
      g._lastSelKey = ''
      g.updateHUD(0.016)
      const bashStats = document.getElementById('unit-stats')?.textContent ?? ''

      mk.avatarCooldownUntil = 0
      g.castAvatar(mk)
      g._lastSelKey = ''
      g.updateHUD(0.016)
      const avatarStats = document.getElementById('unit-stats')?.textContent ?? ''

      return { paladinStats, clapStats, bashStats, avatarStats, enemyBHp: enemyB.hp }
    })

    expect(result.paladinStats).toContain('技能 圣光术')
    expect(result.clapStats).toContain('技能 雷霆一击')
    expect(result.bashStats).toContain('技能 猛击')
    expect(result.avatarStats).toContain('技能 化身')
    expect(result.enemyBHp).toBeLessThan(420)
  })
})
