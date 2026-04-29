import { test, expect, type Page } from '@playwright/test'

const BASE_RUNTIME = 'http://127.0.0.1:4173/?runtimeTest=1'

async function waitForRuntime(page: Page) {
  await page.addInitScript(() => localStorage.removeItem('war3-re.session-preferences.v1'))
  await page.goto(BASE_RUNTIME, { waitUntil: 'domcontentloaded' })
  await page.waitForFunction(() => {
    const game = (window as any).__war3Game
    if (!game || !game.renderer) return false
    if (!Array.isArray(game.units) || game.units.length === 0) return false
    return game.renderer.domElement.width > 0
  }, { timeout: 15000 })
  try {
    await page.waitForFunction(() => {
      const status = document.getElementById('map-status')?.textContent ?? ''
      return !status.includes('正在加载')
    }, { timeout: 15000 })
  } catch {
    // Procedural fallback is enough for this route proof.
  }
  await page.evaluate(() => {
    const g = (window as any).__war3Game
    if (g?.ai) {
      if (typeof g.ai.reset === 'function') g.ai.reset()
      g.ai.update = () => {}
    }
  })
}

test.describe('Human tech rhythm runtime', () => {
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

  test('R7 exposes T1/T2/T3 tactical roles, timing phase, and next action feedback', async ({ page }) => {
    await waitForRuntime(page)

    const result = await page.evaluate(() => {
      const g = (window as any).__war3Game
      const removePlayerTypes = (types: string[]) => {
        for (const unit of g.units) {
          if (unit.team !== 0) continue
          if (!types.includes(unit.type)) continue
          unit.hp = 0
          unit.isDead = true
        }
        g.handleDeadUnits()
      }
      const completeResearch = (building: any, keys: string[]) => {
        for (const key of keys) {
          if (!building.completedResearches.includes(key)) {
            building.completedResearches.push(key)
          }
        }
      }
      const read = () => {
        g.updateHUD(0.016)
        const route = g.getHumanRouteSnapshot()
        const rows = Array.from(document.querySelectorAll('#human-route-unlock-list .human-route-unlock-item')).map((row: any) => ({
          key: row.dataset.key,
          state: row.dataset.state,
          role: row.dataset.role,
          action: row.dataset.action,
          progress: Number(row.dataset.progress ?? 0),
          roleText: row.querySelector('.human-route-unlock-role')?.textContent ?? '',
        }))
        return {
          phase: route.rhythm.phase,
          phaseLabel: route.rhythm.phaseLabel,
          recommendedFocus: route.rhythm.recommendedFocus,
          nextPowerSpike: route.rhythm.nextPowerSpike,
          roleCoverageCount: route.rhythm.roleCoverageCount,
          completeRoleCount: route.rhythm.completeRoleCount,
          unlocks: route.unlocks.map((unlock: any) => ({
            key: unlock.key,
            state: unlock.state,
            role: unlock.role,
            action: unlock.nextAction,
            impact: unlock.impact,
            progress: Math.round(unlock.progress * 100),
          })),
          techSummary: document.getElementById('human-route-tech-summary')?.textContent ?? '',
          rows,
        }
      }

      removePlayerTypes([
        'blacksmith',
        'lumber_mill',
        'workshop',
        'arcane_sanctum',
        'keep',
        'castle',
        'rifleman',
        'priest',
        'sorceress',
        'mortar_team',
        'knight',
      ])
      const opening = read()

      const blacksmith = g.spawnBuilding('blacksmith', 0, 44, 40)
      const rifleman = g.spawnUnit('rifleman', 0, 47, 40)
      const t1Active = read()

      completeResearch(blacksmith, ['long_rifles'])
      g.spawnBuilding('keep', 0, 40, 40)
      const t2Transition = read()

      g.spawnBuilding('arcane_sanctum', 0, 48, 40)
      g.spawnUnit('priest', 0, 50, 40)
      g.spawnUnit('sorceress', 0, 51, 40)
      g.spawnBuilding('workshop', 0, 52, 40)
      g.spawnUnit('mortar_team', 0, 54, 40)
      const t2Online = read()

      g.spawnBuilding('lumber_mill', 0, 56, 40)
      const castle = g.spawnBuilding('castle', 0, 40, 44)
      g.spawnUnit('knight', 0, 44, 44)
      const barracks = g.units.find((u: any) => u.team === 0 && u.type === 'barracks' && u.isBuilding && u.hp > 0)
        ?? g.spawnBuilding('barracks', 0, 48, 44)
      completeResearch(blacksmith, [
        'iron_forged_swords',
        'steel_forged_swords',
        'mithril_forged_swords',
        'black_gunpowder',
        'refined_gunpowder',
        'imbued_gunpowder',
        'iron_plating',
        'steel_plating',
        'mithril_plating',
        'studded_leather_armor',
        'reinforced_leather_armor',
        'dragonhide_armor',
      ])
      completeResearch(barracks, ['animal_war_training'])
      const t3Online = read()

      return {
        opening,
        t1Active,
        t2Transition,
        t2Online,
        t3Online,
        aliveRifleman: rifleman.hp > 0,
        castleType: castle.type,
      }
    })

    expect(result.opening.phase).toBe('opening')
    expect(result.opening.recommendedFocus).toContain('T1 步枪兵')
    expect(result.opening.unlocks.find((u: any) => u.key === 't2-caster-line')!.state).toBe('locked')
    expect(result.opening.techSummary).toContain('T1 开局运营')

    expect(result.aliveRifleman).toBe(true)
    expect(result.t1Active.phase).toBe('t1-army')
    expect(result.t1Active.unlocks.find((u: any) => u.key === 't1-rifleman')!.state).toBe('active')
    expect(result.t1Active.unlocks.find((u: any) => u.key === 't1-rifleman')!.role).toBe('远程火力')
    expect(result.t1Active.recommendedFocus).toContain('Long Rifles')

    expect(result.t2Transition.phase).toBe('t2-transition')
    expect(result.t2Transition.recommendedFocus).toContain('T2 法师线')
    expect(result.t2Transition.unlocks.find((u: any) => u.key === 't2-caster-line')!.action).toContain('奥秘圣殿')

    expect(result.t2Online.phase).toBe('t2-online')
    expect(result.t2Online.unlocks.find((u: any) => u.key === 't2-caster-line')!.state).toBe('complete')
    expect(result.t2Online.unlocks.find((u: any) => u.key === 't2-workshop-siege')!.state).toBe('complete')
    expect(result.t2Online.roleCoverageCount).toBeGreaterThanOrEqual(3)

    expect(result.castleType).toBe('castle')
    expect(result.t3Online.phase).toBe('t3-online')
    expect(result.t3Online.completeRoleCount).toBe(6)
    expect(result.t3Online.techSummary).toContain('角色 6/6')
    expect(result.t3Online.rows.every((row: any) => row.role.length > 0)).toBe(true)
    expect(result.t3Online.rows.every((row: any) => row.action.length > 0)).toBe(true)
    expect(result.t3Online.rows.some((row: any) => row.roleText.includes('骑士耐久'))).toBe(true)
    expect(result.t3Online.nextPowerSpike).toContain('Knight')
    expect((page as any).__consoleErrors).toEqual([])
    expect((page as any).__pageErrors).toEqual([])
  })
})
