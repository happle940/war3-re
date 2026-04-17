/**
 * V9 HERO14-IMPL1B Resurrection dead-unit record substrate runtime proof.
 *
 * Proves:
 * 1. Non-building, non-hero, controllable team-0/team-1 ground unit death creates a record.
 * 2. Record contains team, type, x, z, diedAt.
 * 3. Neutral / non-controllable teams are not recorded.
 * 4. Buildings are not recorded.
 * 5. Heroes are not recorded.
 * 6. No duplicate records for the same death event.
 * 7. Records cleared on match reload/reset.
 * 8. HERO9 Altar revive behavior unchanged.
 *
 * Not: Resurrection cast, resurrect effects, target selection, mana/cooldown,
 * HUD/status text, particles, sounds, AI, other heroes, complete Paladin.
 */
import { test, expect, type Page } from '@playwright/test'

const BASE_RUNTIME = 'http://127.0.0.1:4173/?runtimeTest=1'

async function waitForRuntime(page: Page) {
  await page.goto(BASE_RUNTIME, { waitUntil: 'domcontentloaded' })
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
  } catch { /* procedural fallback */ }
  await page.evaluate(() => {
    const g = (window as any).__war3Game
    if (g?.ai) { if (typeof g.ai.reset === 'function') g.ai.reset(); g.ai.update = () => {} }
  })
  await page.waitForTimeout(300)
}

test.describe('V9 HERO14-IMPL1B Resurrection dead-unit record substrate', () => {
  test.setTimeout(120000)

  test('DR-1: records eligible player/AI non-building non-hero deaths and clears on reset', async ({ page }) => {
    await waitForRuntime(page)
    const result = await page.evaluate(() => {
      const g = (window as any).__war3Game
      g.deadUnitRecords = []

      const footman = g.spawnUnit('footman', 0, 20, 20)
      const secondFootman = g.spawnUnit('footman', 0, 21, 21)
      const rifleman = g.spawnUnit('rifleman', 0, 22, 22)
      const enemy = g.spawnUnit('footman', 1, 24, 24)
      const neutral = g.spawnUnit('footman', -1, 24, 26)
      const building = g.spawnBuilding('barracks', 0, 25, 25)
      const hero = g.spawnUnit('paladin', 0, 27, 27)

      footman.hp = 0
      secondFootman.hp = 0
      rifleman.hp = 0
      enemy.hp = 0
      neutral.hp = 0
      if (building) building.hp = 0
      hero.hp = 0

      g.handleDeadUnits()
      const afterFirstPass = g.deadUnitRecords.map((r: any) => ({ ...r }))
      const survivingEnemy = g.units.some((u: any) => u === enemy)
      const heroMarkedDead = hero.isDead === true

      g.handleDeadUnits()
      const afterSecondPass = g.deadUnitRecords.map((r: any) => ({ ...r }))
      const noCastSurface = Array.from(document.querySelectorAll('#command-card button')).every((b: any) => {
        const label = b.querySelector('.btn-label')?.textContent?.trim() ?? ''
        return !label.includes('复活') || label.includes('学习')
      })

      const resetOk = typeof g.reloadCurrentMap === 'function' ? g.reloadCurrentMap() : false
      const afterReset = g.deadUnitRecords.length

      return {
        records: afterFirstPass,
        recordCountAfterSecondPass: afterSecondPass.length,
        resetOk,
        afterReset,
        survivingEnemy,
        survivingNeutral: g.units.some((u: any) => u === neutral),
        heroMarkedDead,
        noCastSurface,
      }
    })

    expect(result.records).toHaveLength(4)
    expect(result.records.map((r: any) => `${r.team}:${r.type}`).sort()).toEqual([
      '0:footman',
      '0:footman',
      '0:rifleman',
      '1:footman',
    ])
    for (const record of result.records) {
      expect([0, 1]).toContain(record.team)
      expect(typeof record.x).toBe('number')
      expect(typeof record.z).toBe('number')
      expect(typeof record.diedAt).toBe('number')
    }
    expect(result.recordCountAfterSecondPass).toBe(4)
    expect(result.survivingEnemy).toBe(false)
    expect(result.survivingNeutral).toBe(false)
    expect(result.heroMarkedDead).toBe(true)
    expect(result.noCastSurface).toBe(true)
    expect(result.resetOk).toBe(true)
    expect(result.afterReset).toBe(0)
  })

  test('DR-2: HERO9 dead Paladin and Altar revive remain separate from dead-unit records', async ({ page }) => {
    await waitForRuntime(page)
    const result = await page.evaluate(() => {
      const g = (window as any).__war3Game
      g.deadUnitRecords = []
      g.resources.earn(0, 10000, 10000)
      const altar = g.spawnBuilding('altar_of_kings', 0, 15, 15)
      const paladin = g.spawnUnit('paladin', 0, 18, 15)

      paladin.hp = 0
      g.handleDeadUnits()
      const deadOk = paladin.isDead === true && paladin.mesh.visible === false
      const noHeroRecord = !g.deadUnitRecords.some((r: any) => r.type === 'paladin')

      g.startReviveHero(altar, 'paladin')
      const queueStarted = altar.reviveQueue.length === 1
      if (queueStarted) {
        altar.reviveQueue[0].remaining = 0.001
        g.updateUnits(0.1)
      }

      return {
        deadOk,
        queueStarted,
        aliveOk: paladin.isDead === false && paladin.hp > 0 && paladin.mesh.visible === true,
        noHeroRecord,
        recordCount: g.deadUnitRecords.length,
      }
    })
    expect(result.deadOk).toBe(true)
    expect(result.queueStarted).toBe(true)
    expect(result.aliveOk).toBe(true)
    expect(result.noHeroRecord).toBe(true)
    expect(result.recordCount).toBe(0)
  })
})
