/**
 * R7/R10 proof for Human upgrade impact and combat-result reasons.
 *
 * Research upgrades must be visible as numeric battle value, not only as
 * completed command-card states.
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
    // Procedural fallback is sufficient for this numeric/result proof.
  }

  await page.evaluate(() => {
    const g = (window as any).__war3Game
    if (g?.ai) {
      if (typeof g.ai.reset === 'function') g.ai.reset()
      g.ai.update = () => {}
    }
  })
}

test.describe('Human upgrade impact result feedback', () => {
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

  test('route panel and results explain upgrade value as combat reasons', async ({ page }) => {
    await waitForRuntime(page)

    const result = await page.evaluate(() => {
      const g = (window as any).__war3Game
      const completeResearch = (building: any, key: string) => {
        if (!building.completedResearches.includes(key)) building.completedResearches.push(key)
        if (typeof g.applyResearchEffects === 'function') g.applyResearchEffects(key, 0)
      }

      g.spawnUnit('footman', 0, 32, 34)
      g.spawnUnit('rifleman', 0, 34, 34)
      g.spawnUnit('mortar_team', 0, 36, 34)
      g.spawnUnit('knight', 0, 38, 34)
      const blacksmith = g.spawnBuilding('blacksmith', 0, 42, 34)
      const barracks = g.spawnBuilding('barracks', 0, 44, 34)

      completeResearch(blacksmith, 'long_rifles')
      completeResearch(blacksmith, 'black_gunpowder')
      completeResearch(blacksmith, 'iron_plating')
      completeResearch(blacksmith, 'studded_leather_armor')
      completeResearch(barracks, 'animal_war_training')

      g._lastHumanRouteKey = ''
      g.updateHUD(0.016)
      if (typeof g.renderHumanRoutePanel === 'function') g.renderHumanRoutePanel(true)
      const route = g.getHumanRouteSnapshot()
      const techSummaryBeforeResult = document.getElementById('human-route-tech-summary')?.textContent ?? ''
      const upgradeRow = document.querySelector(
        '#human-route-unlock-list .human-route-unlock-item[data-key="t3-upgrade-chains"]',
      ) as HTMLElement | null

      for (const hall of g.units.filter((unit: any) => unit.team === 1 && unit.type === 'townhall' && unit.isBuilding)) {
        hall.hp = 0
      }
      for (let i = 0; i < 10; i++) g.update(0.05)

      const resultPresentation = g.getResultPresentationSnapshot()
      const cardData = Array.from(document.querySelectorAll('#results-stat-grid .result-stat-card')).map((card: any) => ({
        key: card.dataset.key,
        tone: card.dataset.tone,
        label: card.querySelector('.result-stat-label')?.textContent ?? '',
        value: card.querySelector('.result-stat-value')?.textContent ?? '',
        detail: card.querySelector('.result-stat-detail')?.textContent ?? '',
      }))

      return {
        matchResult: g.getMatchResult(),
        techSummaryBeforeResult,
        upgradeRowCounter: upgradeRow?.dataset.counter ?? '',
        upgradeImpact: route.upgradeImpact,
        resultPresentation,
        resultSummary: document.getElementById('results-shell-summary')?.textContent ?? '',
        cardData,
      }
    })

    expect(result.matchResult).toBe('victory')
    expect(result.techSummaryBeforeResult).toContain('科技 5/14')
    expect(result.upgradeRowCounter).toContain('科技 5/14')
    expect(result.upgradeRowCounter).toContain('下一项')

    expect(result.upgradeImpact.completedResearchCount).toBe(5)
    expect(result.upgradeImpact.totalTrackedResearchCount).toBe(14)
    expect(result.upgradeImpact.damageDeltaTotal).toBeGreaterThanOrEqual(2)
    expect(result.upgradeImpact.armorDeltaTotal).toBeGreaterThanOrEqual(4)
    expect(result.upgradeImpact.maxHpDeltaTotal).toBeGreaterThanOrEqual(100)
    expect(result.upgradeImpact.rangeDeltaTotal).toBeGreaterThanOrEqual(1.5)
    expect(result.upgradeImpact.battleReason).toContain('攻击')
    expect(result.upgradeImpact.battleReason).toContain('射程')

    expect(result.resultPresentation.cardCount).toBeGreaterThanOrEqual(8)
    expect(result.resultPresentation.combatReasonCount).toBe(1)
    expect(result.resultPresentation.upgradeImpactCount).toBe(5)
    expect(result.resultPresentation.checks.find((check: any) => check.key === 'combat-reason-layer')!.completed).toBe(true)

    const combatCard = result.cardData.find((card: any) => card.key === 'combat-reason')
    const techCard = result.cardData.find((card: any) => card.key === 'tech-impact')
    expect(combatCard?.value ?? '').toContain('混')
    expect(combatCard?.detail ?? '').toContain('混编')
    expect(techCard?.value ?? '').toBe('5/14')
    expect(techCard?.detail ?? '').toContain('科技 5/14')
    expect(result.resultSummary).toContain('战斗读法')
    expect(result.resultSummary).toContain('科技收益')

    expect((page as any).__consoleErrors).toEqual([])
    expect((page as any).__pageErrors).toEqual([])
  })
})
