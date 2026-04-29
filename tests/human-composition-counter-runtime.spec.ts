/**
 * R7 Human composition and counter-profile proof.
 *
 * The Human route panel must explain why a unit mix matters: not just whether
 * Rifleman/Caster/Mortar/Knight are unlocked, but what roles and armor matchups
 * they cover for a War3-like short game.
 */
import { test, expect, type Page } from '@playwright/test'

const BASE_RUNTIME = 'http://127.0.0.1:4173/?runtimeTest=1'

async function waitForRuntime(page: Page) {
  await page.addInitScript(() => localStorage.removeItem('war3-re.session-preferences.v1'))
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
  } catch {
    // Procedural fallback is enough for composition/counter proof.
  }

  await page.evaluate(() => {
    const g = (window as any).__war3Game
    if (g?.ai) {
      if (typeof g.ai.reset === 'function') g.ai.reset()
      g.ai.update = () => {}
    }
  })
}

test.describe('Human composition and counter profiles', () => {
  test.setTimeout(120000)

  test.beforeEach(async ({ page }) => {
    const consoleErrors: string[] = []
    const pageErrors: string[] = []
    ;(page as any).__consoleErrors = consoleErrors
    ;(page as any).__pageErrors = pageErrors
    page.on('console', (msg) => {
      if (msg.type() === 'error') consoleErrors.push(msg.text())
    })
    page.on('pageerror', err => pageErrors.push(err.message))
  })

  test('R7 route panel exposes Human mixed army roles and armor-counter guidance', async ({ page }) => {
    await waitForRuntime(page)

    const result = await page.evaluate(() => {
      const g = (window as any).__war3Game
      const removePlayerCombat = () => {
        const combatTypes = ['footman', 'rifleman', 'priest', 'sorceress', 'mortar_team', 'knight']
        for (const unit of g.units) {
          if (unit.team !== 0 || !combatTypes.includes(unit.type)) continue
          unit.hp = 0
          unit.isDead = true
        }
        if (typeof g.handleDeadUnits === 'function') g.handleDeadUnits()
      }
      const read = () => {
        g._lastHumanRouteKey = ''
        g.updateHUD(0.016)
        if (typeof g.renderHumanRoutePanel === 'function') g.renderHumanRoutePanel(true)
        const route = g.getHumanRouteSnapshot()
        const rows = Array.from(document.querySelectorAll('#human-route-unlock-list .human-route-unlock-item')).map((row: any) => ({
          key: row.dataset.key,
          counter: row.dataset.counter,
          counterText: row.querySelector('.human-route-unlock-counter')?.textContent ?? '',
        }))
        return {
          profileCount: route.combat.profileCount,
          liveProfileCount: route.combat.liveProfileCount,
          t2ProfileCount: route.combat.t2ProfileCount,
          t3ProfileCount: route.combat.t3ProfileCount,
          compositionCoverageCount: route.combat.compositionCoverageCount,
          totalCompositionRoleCount: route.combat.totalCompositionRoleCount,
          counterRuleCount: route.combat.counterRuleCount,
          counterAdvantageCount: route.combat.counterAdvantageCount,
          counterRiskCount: route.combat.counterRiskCount,
          strongestDpsUnitKey: route.combat.strongestDpsUnitKey,
          highestEffectiveHpUnitKey: route.combat.highestEffectiveHpUnitKey,
          longestRangeUnitKey: route.combat.longestRangeUnitKey,
          recommendedMix: route.combat.recommendedMix,
          missingRoles: route.combat.missingRoles,
          counters: route.combat.counters,
          profiles: route.combat.profiles,
          techSummary: document.getElementById('human-route-tech-summary')?.textContent ?? '',
          techTitle: document.getElementById('human-route-tech-summary')?.getAttribute('title') ?? '',
          rows,
        }
      }

      removePlayerCombat()
      const empty = read()

      g.spawnUnit('footman', 0, 35, 36)
      g.spawnUnit('rifleman', 0, 36, 36)
      g.spawnUnit('priest', 0, 37, 36)
      g.spawnUnit('sorceress', 0, 38, 36)
      g.spawnUnit('mortar_team', 0, 39, 36)
      g.spawnUnit('knight', 0, 40, 36)
      const full = read()

      return { empty, full }
    })

    expect(result.empty.profileCount).toBe(6)
    expect(result.empty.liveProfileCount).toBe(0)
    expect(result.empty.recommendedMix).toContain('Rifleman')
    expect(result.empty.missingRoles).toContain('远程集火')

    expect(result.full.liveProfileCount).toBe(6)
    expect(result.full.t2ProfileCount).toBe(3)
    expect(result.full.t3ProfileCount).toBe(1)
    expect(result.full.compositionCoverageCount).toBe(6)
    expect(result.full.totalCompositionRoleCount).toBe(6)
    expect(result.full.recommendedMix).toContain('混编已具备')
    expect(result.full.strongestDpsUnitKey).toBe('knight')
    expect(result.full.highestEffectiveHpUnitKey).toBe('knight')
    expect(result.full.longestRangeUnitKey).toBe('mortar_team')

    expect(result.full.counterRuleCount).toBe(6)
    expect(result.full.counterAdvantageCount).toBe(1)
    expect(result.full.counterRiskCount).toBe(2)
    expect(result.full.counters.find((counter: any) => counter.key === 'rifleman-heavy')).toMatchObject({
      verdict: 'strong',
      multiplier: 1.25,
    })
    expect(result.full.counters.find((counter: any) => counter.key === 'rifleman-medium')).toMatchObject({
      verdict: 'poor',
      multiplier: 0.75,
    })
    expect(result.full.counters.find((counter: any) => counter.key === 'mortar-medium')).toMatchObject({
      verdict: 'poor',
      multiplier: 0.75,
    })

    expect(result.full.profiles.find((profile: any) => profile.unitKey === 'priest')!.roleLabel).toBe('治疗续航')
    expect(result.full.profiles.find((profile: any) => profile.unitKey === 'sorceress')!.roleLabel).toBe('控制减速')
    expect(result.full.techSummary).toContain('混编 6/6')
    expect(result.full.techSummary).toContain('克制 1/6')
    expect(result.full.techTitle).toContain('混编已具备')

    const rifleRow = result.full.rows.find((row: any) => row.key === 't1-rifleman')
    const siegeRow = result.full.rows.find((row: any) => row.key === 't2-workshop-siege')
    const upgradeRow = result.full.rows.find((row: any) => row.key === 't3-upgrade-chains')
    expect(rifleRow?.counter ?? '').toContain('穿刺')
    expect(rifleRow?.counterText ?? '').toContain('重甲')
    expect(siegeRow?.counterText ?? '').toContain('中甲')
    expect(upgradeRow?.counterText ?? '').toContain('DPS')
    expect(upgradeRow?.counterText ?? '').toContain('有效血量')

    expect((page as any).__consoleErrors).toEqual([])
    expect((page as any).__pageErrors).toEqual([])
  })
})
