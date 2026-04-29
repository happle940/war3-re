/**
 * Complete-milestone proof for R15 external playtest readiness.
 */
import { test, expect, type Page } from '@playwright/test'

const BASE_NORMAL = 'http://127.0.0.1:4173/'

async function waitForGame(page: Page) {
  const consoleErrors: string[] = []
  const pageErrors: string[] = []
  page.on('console', (msg) => {
    if (msg.type() === 'error') consoleErrors.push(msg.text())
  })
  page.on('pageerror', (err) => pageErrors.push(err.message))
  ;(page as any).__consoleErrors = consoleErrors
  ;(page as any).__pageErrors = pageErrors

  await page.addInitScript(() => localStorage.removeItem('war3-re.session-preferences.v1'))
  await page.goto(BASE_NORMAL, { waitUntil: 'domcontentloaded' })
  await page.waitForFunction(() => {
    const game = (window as any).__war3Game
    if (!game || !game.renderer) return false
    if (!Array.isArray(game.units) || game.units.length === 0) return false
    return !document.getElementById('menu-shell')?.hidden &&
      game.renderer.domElement.width > 0
  }, { timeout: 15000 })
  await page.waitForTimeout(300)
}

test.describe('Complete R15 playtest readiness runtime', () => {
  test.setTimeout(120000)

  test('main menu exposes complete playtest readiness and a diagnostic feedback packet', async ({ page }) => {
    await waitForGame(page)

    await page.locator('#menu-playtest-button').click()
    await expect(page.locator('#playtest-shell')).toBeVisible()

    const result = await page.evaluate(() => {
      const g = (window as any).__war3Game
      g.renderPlaytestReadinessPanel(true)
      const snapshot = g.getPlaytestReadinessSnapshot()
      const rows = Array.from(document.querySelectorAll('#playtest-readiness-list .playtest-readiness-item'))
        .map((row: any) => ({
          key: row.dataset.key,
          complete: row.dataset.complete,
          text: row.textContent ?? '',
        }))
      const feedback = document.getElementById('playtest-feedback-packet') as HTMLTextAreaElement | null
      const status = document.getElementById('playtest-readiness-status') as HTMLElement | null
      const known = document.getElementById('playtest-known-issues') as HTMLElement | null
      const ops = document.getElementById('playtest-operational-summary') as HTMLElement | null

      return {
        snapshot,
        rows,
        feedbackPacket: feedback?.value ?? '',
        statusText: status?.textContent ?? '',
        statusComplete: status?.dataset.complete ?? '',
        knownText: known?.textContent ?? '',
        operationalText: ops?.textContent ?? '',
      }
    })

    expect(result.snapshot.milestone).toBe('R15')
    expect(result.snapshot.completed).toBe(true)
    expect(result.snapshot.completedCount).toBe(result.snapshot.totalCount)
    expect(result.snapshot.war3Gap.totalCount).toBeGreaterThanOrEqual(10)
    expect(result.snapshot.war3Gap.majorGapCount).toBeGreaterThanOrEqual(1)
    expect(result.snapshot.war3Gap.areas.map((area: any) => area.key)).toEqual(expect.arrayContaining([
      'front-door-shell',
      'first-minute-readability',
      'rts-control-trust',
      'economy-production',
      'combat-readable-outcome',
      'human-tech-depth',
      'heroes-abilities',
      'map-fog-neutral-items',
      'ai-opponent-depth',
      'visual-audio-identity',
      'product-playtest-release',
      'architecture-maintainability',
    ]))
    expect(result.statusComplete).toBe('true')
    expect(result.statusText).toContain('R15')
    expect(result.statusText).toContain('private-alpha-r15')
    expect(result.rows).toHaveLength(result.snapshot.totalCount)
    expect(result.rows.every(row => row.complete === 'true')).toBe(true)
    expect(result.knownText).toContain('KNOWN_ISSUES')
    expect(result.operationalText).toContain('WebGL')
    expect(result.snapshot.checks.map((check: any) => check.key)).toEqual(expect.arrayContaining([
      'performance-budget',
      'compatibility-matrix',
      'error-buffer',
      'feedback-triage',
      'result-recap-surface',
      'war3-gap-radar',
      'player-experience-signals',
    ]))
    expect(result.snapshot.compatibility.length).toBeGreaterThanOrEqual(4)
    expect(result.feedbackPacket).toContain('War3 RE playtest feedback packet')
    expect(result.feedbackPacket).toContain('Build: private-alpha-r15')
    expect(result.feedbackPacket).toContain('Browser:')
    expect(result.feedbackPacket).toContain('Runtime budget:')
    expect(result.feedbackPacket).toContain('Compatibility signals:')
    expect(result.feedbackPacket).toContain('Recent runtime errors:')
    expect(result.feedbackPacket).toContain('Map:')
    expect(result.feedbackPacket).toContain('Runtime milestone signals:')
    expect(result.feedbackPacket).toContain('War3 gap radar:')
    expect(result.feedbackPacket).toContain('Top War3 blockers:')
    expect(result.feedbackPacket).toContain('visual-audio-identity')
    expect(result.feedbackPacket).toContain('Playable alpha areas:')
    expect(result.feedbackPacket).toContain('Major gaps:')
    expect(result.feedbackPacket).toContain('R13')
    expect(result.feedbackPacket).toContain('R14')
    expect(result.feedbackPacket).toContain('解锁')
    expect(result.feedbackPacket).toContain('表现')
    expect(result.feedbackPacket).toContain('Human tech route')
    expect(result.feedbackPacket).toContain('Please report:')
    expect((page as any).__consoleErrors).toEqual([])
    expect((page as any).__pageErrors).toEqual([])
  })

  test('pause and result shells can open playtest info without losing recovery context', async ({ page }) => {
    await waitForGame(page)

    await page.locator('#menu-start-button').click()
    await page.locator('#briefing-start-button').click()
    await page.evaluate(() => (window as any).__war3Game.pauseGame())
    await expect(page.locator('#pause-shell')).toBeVisible()

    await page.locator('#pause-playtest-button').click()
    await expect(page.locator('#playtest-shell')).toBeVisible()
    expect(await page.locator('#playtest-feedback-packet').inputValue()).toContain('Result: in-progress')
    await page.locator('#playtest-close-button').click()
    await expect(page.locator('#pause-shell')).toBeVisible()

    const result = await page.evaluate(async () => {
      const g = (window as any).__war3Game
      const aiTownHall = g.units.find((u: any) => u.team === 1 && u.type === 'townhall' && u.hp > 0)
      if (!aiTownHall) return { error: 'missing ai townhall' }
      aiTownHall.hp = 0
      g.resumeGame()
      g.update(0.016)
      await new Promise(r => setTimeout(r, 50))
      return {
        matchResult: g.getMatchResult(),
        resultsVisible: !document.getElementById('results-shell')!.hidden,
      }
    })
    expect(result.error).toBeUndefined()
    expect(result.matchResult).toBe('victory')
    expect(result.resultsVisible).toBe(true)

    await page.locator('#results-playtest-button').click()
    await expect(page.locator('#playtest-shell')).toBeVisible()
    expect(await page.locator('#playtest-feedback-packet').inputValue()).toContain('Result: victory')
    await page.locator('#playtest-close-button').click()
    await expect(page.locator('#results-shell')).toBeVisible()
    expect((page as any).__consoleErrors).toEqual([])
    expect((page as any).__pageErrors).toEqual([])
  })

  test('refresh and copy controls keep the feedback packet current', async ({ page }) => {
    await waitForGame(page)

    await page.locator('#menu-playtest-button').click()
    await page.locator('#playtest-feedback-category').selectOption('performance')
    await page.locator('#playtest-feedback-severity').selectOption('major')
    await page.locator('#playtest-user-notes').fill('卡顿发生在第一次进攻波前，附带截图 proof-001')
    await page.locator('#playtest-refresh-button').click()
    expect(await page.locator('#playtest-feedback-packet').inputValue()).toContain('Build: private-alpha-r15')

    await page.locator('#playtest-copy-feedback-button').click()
    await page.waitForTimeout(100)
    const copyState = await page.locator('#playtest-copy-feedback-button').evaluate((el: any) => el.dataset.copyState ?? '')
    expect(['copied', 'unavailable', 'pending']).toContain(copyState)

    const packet = await page.locator('#playtest-feedback-packet').inputValue()
    expect(packet).toContain('Please report:')
    expect(packet).toContain('Completed runtime milestones:')
    expect(packet).toContain('Feedback category: performance')
    expect(packet).toContain('Feedback severity: major')
    expect(packet).toContain('proof-001')
    expect((page as any).__consoleErrors).toEqual([])
    expect((page as any).__pageErrors).toEqual([])
  })

  test('error buffer and recovery buttons are reflected in the playtest packet', async ({ page }) => {
    await waitForGame(page)

    await page.locator('#menu-start-button').click()
    await page.locator('#briefing-start-button').click()
    await page.evaluate(() => {
      const g = (window as any).__war3Game
      g.__testRecordPlaytestError('synthetic playtest runtime failure', 'r15-deepening-proof')
      g.pauseGame()
    })
    await page.locator('#pause-playtest-button').click()
    await expect(page.locator('#playtest-shell')).toBeVisible()

    const packet = await page.locator('#playtest-feedback-packet').inputValue()
    expect(packet).toContain('synthetic playtest runtime failure')
    await expect(page.locator('#playtest-error-list')).toContainText('synthetic playtest runtime failure')

    await page.locator('#playtest-return-menu-button').click()
    await expect(page.locator('#menu-shell')).toBeVisible()
    await page.locator('#menu-playtest-button').click()
    await expect(page.locator('#playtest-shell')).toBeVisible()
    await page.locator('#playtest-reload-button').click()
    await expect(page.locator('#menu-shell')).toBeVisible()
    expect((page as any).__consoleErrors).toEqual([])
    expect((page as any).__pageErrors).toEqual([])
  })
})
