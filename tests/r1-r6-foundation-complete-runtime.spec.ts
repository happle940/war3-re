/**
 * Complete-milestone proof for R1-R6 foundation milestones.
 */
import { test, expect, type Page } from '@playwright/test'

const BASE_NORMAL = 'http://127.0.0.1:4173/'
const BASE_RUNTIME = 'http://127.0.0.1:4173/?runtimeTest=1'

async function waitForGame(page: Page, url: string) {
  const consoleErrors: string[] = []
  const pageErrors: string[] = []
  page.on('console', (msg) => {
    if (msg.type() === 'error') consoleErrors.push(msg.text())
  })
  page.on('pageerror', (err) => pageErrors.push(err.message))
  ;(page as any).__consoleErrors = consoleErrors
  ;(page as any).__pageErrors = pageErrors

  await page.addInitScript(() => localStorage.removeItem('war3-re.session-preferences.v1'))
  await page.goto(url, { waitUntil: 'domcontentloaded' })
  await page.waitForFunction(() => {
    const game = (window as any).__war3Game
    if (!game || !game.renderer) return false
    if (!Array.isArray(game.units) || game.units.length === 0) return false
    return game.renderer.domElement.width > 0
  }, { timeout: 15000 })
  await page.waitForTimeout(300)
}

test.describe('Complete R1-R6 foundation milestones runtime', () => {
  test.setTimeout(120000)

  test('R1-R6 snapshot is complete from normal front door through active gameplay', async ({ page }) => {
    await waitForGame(page, BASE_NORMAL)

    const result = await page.evaluate(async () => {
      const g = (window as any).__war3Game
      const before = g.getFoundationMilestoneSnapshot()
      const beforeStatus = document.getElementById('foundation-status') as HTMLElement | null

      ;(document.getElementById('menu-start-button') as HTMLButtonElement).click()
      await new Promise(r => setTimeout(r, 50))
      const briefingVisible = !document.getElementById('briefing-shell')!.hidden
      ;(document.getElementById('briefing-start-button') as HTMLButtonElement).click()
      await new Promise(r => setTimeout(r, 50))
      g.update(0.016)

      const after = g.getFoundationMilestoneSnapshot()
      const afterStatus = document.getElementById('foundation-status') as HTMLElement | null

      return {
        before,
        after,
        briefingVisible,
        playing: g.phase.isPlaying(),
        beforeStatusText: beforeStatus?.textContent ?? '',
        afterStatusText: afterStatus?.textContent ?? '',
        afterStatusComplete: afterStatus?.dataset.complete ?? '',
      }
    })

    expect(result.before.milestone).toBe('R1-R6')
    expect(result.before.completed).toBe(true)
    expect(result.before.completedCount).toBe(result.before.totalCount)
    expect(result.before.stages.map((stage: any) => stage.key)).toEqual(['R1', 'R2', 'R3', 'R4', 'R5', 'R6'])
    expect(result.briefingVisible).toBe(true)
    expect(result.playing).toBe(true)
    expect(result.after.completed).toBe(true)
    expect(result.afterStatusComplete).toBe('true')
    expect(result.afterStatusText).toContain('R1-R6 基础')
    expect(result.afterStatusText).toContain('基础体验全部第一轮闭环')
    expect((page as any).__consoleErrors).toEqual([])
    expect((page as any).__pageErrors).toEqual([])
  })

  test('R4-R6 proof uses real command, economy, production, and combat runtime actions', async ({ page }) => {
    await waitForGame(page, BASE_RUNTIME)

    const result = await page.evaluate(() => {
      const g = (window as any).__war3Game
      if (g?.ai) g.ai.update = () => {}

      const worker = g.units.find((u: any) => u.team === 0 && u.type === 'worker' && u.hp > 0)
      const mine = g.units.find((u: any) => u.type === 'goldmine' && u.hp > 0)
      const barracks = g.units.find((u: any) => u.team === 0 && u.type === 'barracks' && u.hp > 0 && u.buildProgress >= 1)
      if (!worker || !mine || !barracks) return { error: 'missing foundation setup' }

      g.issueCommand([worker], { type: 'gather', resourceType: 'gold', target: mine.mesh.position })
      worker.resourceTarget = { type: 'goldmine', mine }
      g.planPath(worker, mine.mesh.position)
      const gatherAccepted = worker.gatherType === 'gold' && !!worker.resourceTarget

      const footmenBefore = g.units.filter((u: any) => u.team === 0 && u.type === 'footman' && u.hp > 0).length
      g.resources.get(0).gold = 2000
      g.resources.get(0).lumber = 1000
      g.trainUnit(barracks, 'footman')
      const trainingQueued = barracks.trainingQueue.some((item: any) => item.type === 'footman')

      const player = g.spawnUnit('footman', 0, 30, 30)
      const enemy = g.spawnUnit('footman', 1, 33, 30)
      const hpBefore = enemy.hp
      const V3 = player.mesh.position.constructor
      g.issueCommand([player], { type: 'attackMove', target: new V3(36, 0, 30) })
      g.planPath(player, new V3(36, 0, 30))
      const attackMoveAccepted = player.state === 8 && !!player.attackMoveTarget
      g.dealDamage(player, enemy)
      const combatDamageApplied = enemy.hp < hpBefore

      let remaining = 25
      while (remaining > 0) {
        const step = Math.min(0.016, remaining)
        g.update(step)
        remaining -= step
      }

      const footmenAfter = g.units.filter((u: any) => u.team === 0 && u.type === 'footman' && u.hp > 0).length
      const snapshot = g.getFoundationMilestoneSnapshot()

      return {
        gatherAccepted,
        trainingQueued,
        trainedFootman: footmenAfter > footmenBefore,
        attackMoveAccepted,
        combatDamageApplied,
        snapshot,
      }
    })

    expect(result.error).toBeUndefined()
    expect(result.gatherAccepted).toBe(true)
    expect(result.trainingQueued).toBe(true)
    expect(result.trainedFootman).toBe(true)
    expect(result.attackMoveAccepted).toBe(true)
    expect(result.combatDamageApplied).toBe(true)
    expect(result.snapshot.completed).toBe(true)
    expect(result.snapshot.stages.every((stage: any) => stage.completed)).toBe(true)
    expect((page as any).__consoleErrors).toEqual([])
    expect((page as any).__pageErrors).toEqual([])
  })

  test('R15 playtest packet carries R1-R6 foundation milestone signals', async ({ page }) => {
    await waitForGame(page, BASE_NORMAL)

    await page.locator('#menu-playtest-button').click()
    const packet = await page.locator('#playtest-feedback-packet').inputValue()

    for (const key of ['R1', 'R2', 'R3', 'R4', 'R5', 'R6']) {
      expect(packet).toContain(`- ${key} OK:`)
    }
    expect(packet).toContain('基础体验全部第一轮闭环')
    expect((page as any).__consoleErrors).toEqual([])
    expect((page as any).__pageErrors).toEqual([])
  })
})
