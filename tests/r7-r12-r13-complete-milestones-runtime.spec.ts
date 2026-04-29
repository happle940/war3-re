/**
 * Complete-milestone proof for R7 Human route, R12 War3 identity, and R13 product shell.
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

  await page.goto(url, { waitUntil: 'domcontentloaded' })
  await page.waitForFunction(() => {
    const game = (window as any).__war3Game
    if (!game || !game.renderer) return false
    if (!Array.isArray(game.units) || game.units.length === 0) return false
    return game.renderer.domElement.width > 0
  }, { timeout: 15000 })
  await page.waitForTimeout(300)
}

test.describe('Complete R7/R12/R13 milestones runtime', () => {
  test.setTimeout(120000)

  test('R13 closes product shell from menu through settings, protection, briefing, pause, results, and re-entry', async ({ page }) => {
    await page.addInitScript(() => localStorage.removeItem('war3-re.session-preferences.v1'))
    await waitForGame(page, BASE_NORMAL)

    const result = await page.evaluate(async () => {
      const g = (window as any).__war3Game
      const menuVisible = !document.getElementById('menu-shell')!.hidden

      ;(document.getElementById('menu-settings-button') as HTMLButtonElement).click()
      await new Promise(r => setTimeout(r, 50))
      const settingsVisible = !document.getElementById('settings-shell')!.hidden
      const settingIds = [
        'setting-objective-beacons',
        'setting-minimap-fog',
        'setting-human-route-panel',
        'setting-close-protection',
      ]
      const settingsChecked = settingIds.every(id => (document.getElementById(id) as HTMLInputElement).checked)
      ;(document.getElementById('settings-close-button') as HTMLButtonElement).click()
      await new Promise(r => setTimeout(r, 50))

      ;(document.getElementById('menu-start-button') as HTMLButtonElement).click()
      await new Promise(r => setTimeout(r, 50))
      const briefingVisible = !document.getElementById('briefing-shell')!.hidden
      ;(document.getElementById('briefing-start-button') as HTMLButtonElement).click()
      await new Promise(r => setTimeout(r, 50))
      const playingAfterBriefing = !g.isPaused()

      g.pauseGame()
      await new Promise(r => setTimeout(r, 50))
      const pauseVisible = !document.getElementById('pause-shell')!.hidden

      const aiTownHall = g.units.find((u: any) => u.team === 1 && u.type === 'townhall' && u.hp > 0)
      aiTownHall.hp = 0
      g.resumeGame()
      g.update(0.016)
      await new Promise(r => setTimeout(r, 50))
      const resultsVisible = !document.getElementById('results-shell')!.hidden
      const summary = document.getElementById('results-shell-summary')!.textContent ?? ''
      const beforeUnload = new Event('beforeunload', { cancelable: true })
      window.dispatchEvent(beforeUnload)
      const snapshot = g.getSessionShellSnapshot()

      ;(document.getElementById('results-return-menu-button') as HTMLButtonElement).click()
      await new Promise(r => setTimeout(r, 50))
      const menuAfterResults = !document.getElementById('menu-shell')!.hidden
      const lastSummary = document.getElementById('menu-last-session-summary')!.textContent ?? ''

      return {
        menuVisible,
        settingsVisible,
        settingsChecked,
        briefingVisible,
        playingAfterBriefing,
        pauseVisible,
        resultsVisible,
        summary,
        beforeUnloadPrevented: beforeUnload.defaultPrevented,
        snapshot,
        menuAfterResults,
        lastSummary,
      }
    })

    expect(result.menuVisible).toBe(true)
    expect(result.settingsVisible).toBe(true)
    expect(result.settingsChecked).toBe(true)
    expect(result.briefingVisible).toBe(true)
    expect(result.playingAfterBriefing).toBe(true)
    expect(result.pauseVisible).toBe(true)
    expect(result.resultsVisible).toBe(true)
    expect(result.summary).toContain('短局闭环')
    expect(result.beforeUnloadPrevented).toBe(true)
    expect(result.snapshot.milestone).toBe('R13')
    expect(result.snapshot.completed).toBe(true)
    expect(result.menuAfterResults).toBe(true)
    expect(result.lastSummary).toContain('闭环')
    expect((page as any).__consoleErrors).toEqual([])
    expect((page as any).__pageErrors).toEqual([])
  })

  test('R12 closes Fog/recon, neutral, drop, shop, consumable, and town-portal identity loop', async ({ page }) => {
    await page.addInitScript(() => localStorage.removeItem('war3-re.session-preferences.v1'))
    await waitForGame(page, BASE_RUNTIME)

    const result = await page.evaluate(() => {
      const g = (window as any).__war3Game
      const hall = g.units.find((u: any) => u.team === 0 && u.type === 'townhall' && u.hp > 0)
      const creep = g.units.find((u: any) => u.team === 2 && u.hp > 0 && !u.isBuilding)
      const enemyHall = g.units.find((u: any) => u.team === 1 && u.type === 'townhall' && u.hp > 0)
      if (!hall || !creep || !enemyHall) return { error: 'missing identity setup' }

      const hero = g.spawnUnit('paladin', 0, hall.mesh.position.x + 4, hall.mesh.position.z + 4)
      const escort = g.spawnUnit('footman', 0, hero.mesh.position.x + 1, hero.mesh.position.z)
      const shop = g.spawnBuilding('arcane_vault', 0, hall.mesh.position.x + 7, hall.mesh.position.z + 1)
      g.resources.earn(0, 2000, 1000)

      hero.mesh.position.set(creep.mesh.position.x, creep.mesh.position.y, creep.mesh.position.z)
      creep.hp = 1
      g.dealDamage(hero, creep)
      g.update(0.016)
      const itemCountAfterDrop = g.worldItems.length

      hero.mesh.position.set(shop.mesh.position.x, shop.mesh.position.y, shop.mesh.position.z)
      const boughtPortal = g.purchaseShopItem(shop, 'scroll_of_town_portal')
      hero.mesh.position.set(enemyHall.mesh.position.x - 3, enemyHall.mesh.position.y, enemyHall.mesh.position.z - 3)
      escort.mesh.position.set(hero.mesh.position.x + 1, hero.mesh.position.y, hero.mesh.position.z)
      g.update(0.016)
      const exploredBeforePortal = g.getVisibilitySnapshot().exploredPct
      const portalIndex = hero.inventoryItems.indexOf('scroll_of_town_portal')
      const usedPortal = g.useInventoryItem(hero, portalIndex)
      g.update(0.016)
      const distanceToHallAfterPortal = hero.mesh.position.distanceTo(hall.mesh.position)
      const identity = g.getWar3IdentitySnapshot()
      g.updateHUD(0.016)
      g.updateMinimap()

      return {
        itemCountAfterDrop,
        boughtPortal,
        usedPortal,
        exploredBeforePortal,
        distanceToHallAfterPortal,
        identity,
        statusText: document.getElementById('war3-identity-status')?.textContent ?? '',
      }
    })

    expect(result.error).toBeUndefined()
    expect(result.itemCountAfterDrop).toBeGreaterThanOrEqual(1)
    expect(result.boughtPortal).toBe(true)
    expect(result.usedPortal).toBe(true)
    expect(result.distanceToHallAfterPortal).toBeLessThan(6)
    expect(result.exploredBeforePortal).toBeGreaterThan(0.15)
    expect(result.identity.milestone).toBe('R12')
    expect(result.identity.completed).toBe(true)
    expect(result.identity.worldItems.length).toBeGreaterThanOrEqual(1)
    expect(result.statusText).toContain('侦察')
    expect(result.statusText).toContain('完整 War3 身份闭环')
    expect((page as any).__consoleErrors).toEqual([])
    expect((page as any).__pageErrors).toEqual([])
  })

  test('R7 exposes a complete Human route across economy, army, heroes, tech, support, and late game', async ({ page }) => {
    await page.addInitScript(() => localStorage.removeItem('war3-re.session-preferences.v1'))
    await waitForGame(page, BASE_RUNTIME)

    const result = await page.evaluate(() => {
      const g = (window as any).__war3Game
      g.updateHUD(0.016)
      const feedbackBefore = g.getHumanRouteFeedbackSnapshot()
      const baseX = 22
      const baseZ = 18
      for (const [idx, building] of [
        'farm',
        'lumber_mill',
        'blacksmith',
        'altar_of_kings',
        'arcane_vault',
        'arcane_sanctum',
        'workshop',
        'keep',
        'castle',
      ].entries()) {
        g.spawnBuilding(building, 0, baseX + (idx % 3) * 4, baseZ + Math.floor(idx / 3) * 4)
      }
      for (const [idx, unit] of [
        'footman',
        'rifleman',
        'priest',
        'sorceress',
        'mortar_team',
        'knight',
        'paladin',
        'archmage',
        'mountain_king',
      ].entries()) {
        g.spawnUnit(unit, 0, baseX + 16 + (idx % 3), baseZ + Math.floor(idx / 3))
      }
      const blacksmith = g.units.find((u: any) => u.team === 0 && u.type === 'blacksmith')
      blacksmith.completedResearches.push(
        'long_rifles',
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
        'animal_war_training',
      )
      g.updateHUD(0.016)
      const route = g.getHumanRouteSnapshot()
      const routeFeedback = g.getHumanRouteFeedbackSnapshot()
      const audio = g.getAudioCueSnapshot()
      const rows = Array.from(document.querySelectorAll('#human-route-list .human-route-item')).map((row: any) => ({
        key: row.dataset.key,
        icon: row.querySelector('.human-route-icon')?.textContent ?? '',
        text: row.textContent,
        complete: row.dataset.complete,
        newlyCompleted: row.dataset.new,
      }))
      const unlockRows = Array.from(document.querySelectorAll('#human-route-unlock-list .human-route-unlock-item')).map((row: any) => ({
        key: row.dataset.key,
        tier: row.dataset.tier,
        state: row.dataset.state,
        role: row.dataset.role,
        action: row.dataset.action,
        progress: Number(row.dataset.progress ?? 0),
        icon: row.querySelector('.human-route-unlock-icon')?.textContent ?? '',
        roleText: row.querySelector('.human-route-unlock-role')?.textContent ?? '',
        text: row.textContent,
        complete: row.dataset.complete,
        newlyCompleted: row.dataset.new,
      }))
      return {
        route,
        feedbackBefore,
        routeFeedback,
        audio,
        panelHidden: document.getElementById('human-route-panel')!.hidden,
        techSummary: document.getElementById('human-route-tech-summary')!.textContent ?? '',
        techSummaryComplete: document.getElementById('human-route-tech-summary')!.dataset.complete ?? '',
        rows,
        unlockRows,
      }
    })

    expect(result.route.milestone).toBe('R7')
    expect(result.route.completed, JSON.stringify(result.route.steps)).toBe(true)
    expect(result.route.completedCount).toBe(result.route.totalCount)
    expect(result.route.heroKeys).toEqual(['paladin', 'archmage', 'mountain_king'])
    expect(result.route.itemKeys).toContain('scroll_of_town_portal')
    expect(result.route.tier.currentTierLabel).toBe('T3 Castle')
    expect(result.route.tier.availableUnlockCount).toBe(result.route.tier.totalUnlockCount)
    expect(result.route.tier.nextActions).toEqual([])
    expect(result.route.rhythm.phase).toBe('t3-online')
    expect(result.route.rhythm.phaseLabel).toBe('T3 混编成型')
    expect(result.route.rhythm.roleCoverageCount).toBe(result.route.rhythm.totalRoleCount)
    expect(result.route.rhythm.completeRoleCount).toBe(result.route.rhythm.totalRoleCount)
    expect(result.route.rhythm.recommendedFocus).toContain('推进')
    expect(result.route.rhythm.nextPowerSpike).toContain('Knight')
    expect(result.route.unlocks.map((unlock: any) => unlock.key)).toEqual([
      't1-rifleman',
      't2-caster-line',
      't2-workshop-siege',
      't3-knight-line',
      't3-upgrade-chains',
      't3-animal-war-training',
    ])
    expect(result.route.unlocks.every((unlock: any) => unlock.available && unlock.dataReady)).toBe(true)
    expect(result.route.unlocks.every((unlock: any) => unlock.state === 'complete')).toBe(true)
    expect(result.route.unlocks.map((unlock: any) => unlock.role)).toEqual([
      '远程火力',
      '治疗与控制',
      '破防攻城',
      '重甲前排',
      '数值成长',
      '骑士耐久',
    ])
    expect(result.panelHidden).toBe(false)
    expect(result.techSummaryComplete).toBe('true')
    expect(result.techSummary).toContain('T3 Castle')
    expect(result.techSummary).toContain('T3 混编成型')
    expect(result.techSummary).toContain('角色 6/6')
    expect(result.techSummary).toContain('解锁 6/6')
    expect(result.rows.map((row: any) => row.key)).toEqual([
      'economy',
      'barracks',
      'hero',
      'support',
      'tech',
      'late',
    ])
    expect(result.rows.every((row: any) => row.complete === 'true')).toBe(true)
    expect(result.rows.every((row: any) => row.icon.length > 0)).toBe(true)
    expect(result.unlockRows.map((row: any) => row.key)).toEqual(result.route.unlocks.map((unlock: any) => unlock.key))
    expect(result.unlockRows.every((row: any) => row.complete === 'true')).toBe(true)
    expect(result.unlockRows.every((row: any) => row.state === 'complete')).toBe(true)
    expect(result.unlockRows.every((row: any) => row.role.length > 0)).toBe(true)
    expect(result.unlockRows.every((row: any) => row.action.length > 0)).toBe(true)
    expect(result.unlockRows.every((row: any) => row.roleText.includes('·'))).toBe(true)
    expect(result.unlockRows.every((row: any) => row.progress === 100)).toBe(true)
    expect(result.unlockRows.every((row: any) => row.icon.length > 0)).toBe(true)
    expect(result.unlockRows.some((row: any) => row.newlyCompleted === 'true')).toBe(true)
    expect(result.routeFeedback.primed).toBe(true)
    expect(result.routeFeedback.completedKeyCount).toBeGreaterThanOrEqual(12)
    expect(result.routeFeedback.completionCueCount).toBeGreaterThan(result.feedbackBefore.completionCueCount)
    expect(result.routeFeedback.lastCompletedKeys.length).toBeGreaterThan(0)
    expect(result.audio.kinds).toContain('objective')
    expect((page as any).__consoleErrors).toEqual([])
    expect((page as any).__pageErrors).toEqual([])
  })
})
