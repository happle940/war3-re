/**
 * Command Card State Regression Pack
 *
 * Runtime-proof tests for visible command availability. The contract is that
 * blocked RTS commands expose a deterministic reason instead of silently doing
 * nothing when clicked.
 */
import { test, expect, type Page } from '@playwright/test'

const BASE = 'http://127.0.0.1:4173/?runtimeTest=1'

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
    // Procedural fallback is valid for these contract tests.
  }
  await page.waitForTimeout(300)
}

function severeConsoleErrors(page: Page): string[] {
  const errors = ((page as any).__consoleErrors ?? []) as string[]
  return errors.filter(e =>
    !e.includes('404') &&
    !e.includes('favicon') &&
    !e.includes('Failed to load resource') &&
    !e.includes('Test map load failed') &&
    !e.includes('net::'),
  )
}

test.describe('Command Card State Regression', () => {
  test.setTimeout(120000)

  test('supply-capped train command shows visible reason and does not spend or queue', async ({ page }) => {
    await waitForGame(page)

    const result = await page.evaluate(() => {
      const g = (window as any).__war3Game
      const th = g.units.find((u: any) => u.team === 0 && u.type === 'townhall' && u.buildProgress >= 1)
      if (!th) return { ok: false, reason: 'no townhall' }

      const setResources = (gold: number, lumber: number) => {
        const r = g.resources.get(0)
        if (r.gold < gold) g.resources.earn(0, gold - r.gold, 0)
        if (r.gold > gold) g.resources.spend(0, { gold: r.gold - gold, lumber: 0 })
        const afterGold = g.resources.get(0)
        if (afterGold.lumber < lumber) g.resources.earn(0, 0, lumber - afterGold.lumber)
        if (afterGold.lumber > lumber) g.resources.spend(0, { gold: 0, lumber: afterGold.lumber - lumber })
      }
      setResources(1000, 1000)

      let spawned = 0
      while (g.resources.computeSupply(0, g.units).used < g.resources.computeSupply(0, g.units).total) {
        g.spawnUnit('worker', 0, 32 + spawned, 32)
        spawned++
        if (spawned > 60) break
      }

      g.selectionModel.clear()
      g.selectionModel.setSelection([th])
      g.updateHUD(0.016)

      const btn = [...document.querySelectorAll('#command-card button')].find((b: any) =>
        b.querySelector('.btn-label')?.textContent?.trim() === '农民'
      ) as HTMLButtonElement | undefined
      const before = { res: g.resources.get(0), queue: th.trainingQueue.length }
      btn?.click()
      const after = { res: g.resources.get(0), queue: th.trainingQueue.length }

      return {
        ok: true,
        disabled: btn?.disabled ?? false,
        reason: btn?.dataset.disabledReason ?? '',
        visibleText: btn?.textContent ?? '',
        before,
        after,
      }
    })

    expect(result.ok).toBe(true)
    expect(result.disabled).toBe(true)
    expect(`${result.reason} ${result.visibleText}`).toContain('人口')
    expect(result.after.queue).toBe(result.before.queue)
    expect(result.after.res.gold).toBe(result.before.res.gold)
  })

  test('insufficient-gold train command shows reason and does not queue', async ({ page }) => {
    await waitForGame(page)

    const result = await page.evaluate(() => {
      const g = (window as any).__war3Game
      const th = g.units.find((u: any) => u.team === 0 && u.type === 'townhall' && u.buildProgress >= 1)
      if (!th) return { ok: false, reason: 'no townhall' }
      const r = g.resources.get(0)
      if (r.gold > 0) g.resources.spend(0, { gold: r.gold, lumber: 0 })
      const afterGold = g.resources.get(0)
      if (afterGold.lumber < 1000) g.resources.earn(0, 0, 1000 - afterGold.lumber)

      g.selectionModel.clear()
      g.selectionModel.setSelection([th])
      g.updateHUD(0.016)

      const btn = [...document.querySelectorAll('#command-card button')].find((b: any) =>
        b.querySelector('.btn-label')?.textContent?.trim() === '农民'
      ) as HTMLButtonElement | undefined
      const beforeQueue = th.trainingQueue.length
      btn?.click()
      return {
        ok: true,
        disabled: btn?.disabled ?? false,
        reason: btn?.dataset.disabledReason ?? '',
        visibleText: btn?.textContent ?? '',
        beforeQueue,
        afterQueue: th.trainingQueue.length,
      }
    })

    expect(result.ok).toBe(true)
    expect(result.disabled).toBe(true)
    expect(`${result.reason} ${result.visibleText}`).toContain('黄金不足')
    expect(result.afterQueue).toBe(result.beforeQueue)
  })

  test('insufficient-lumber build command shows reason and does not enter placement mode', async ({ page }) => {
    await waitForGame(page)

    const result = await page.evaluate(() => {
      const g = (window as any).__war3Game
      const worker = g.units.find((u: any) => u.team === 0 && u.type === 'worker' && u.hp > 0)
      if (!worker) return { ok: false, reason: 'no worker' }
      const r = g.resources.get(0)
      if (r.gold < 1000) g.resources.earn(0, 1000 - r.gold, 0)
      const afterGold = g.resources.get(0)
      if (afterGold.lumber > 0) g.resources.spend(0, { gold: 0, lumber: afterGold.lumber })

      g.selectionModel.clear()
      g.selectionModel.setSelection([worker])
      g.updateHUD(0.016)

      const btn = [...document.querySelectorAll('#command-card button')].find((b: any) =>
        b.querySelector('.btn-label')?.textContent?.trim() === '农场'
      ) as HTMLButtonElement | undefined
      btn?.click()
      return {
        ok: true,
        disabled: btn?.disabled ?? false,
        reason: btn?.dataset.disabledReason ?? '',
        visibleText: btn?.textContent ?? '',
        placementMode: g.placementMode,
      }
    })

    expect(result.ok).toBe(true)
    expect(result.disabled).toBe(true)
    expect(`${result.reason} ${result.visibleText}`).toContain('木材不足')
    expect(result.placementMode).toBeNull()
  })

  test('sufficient train command is enabled and queues normally', async ({ page }) => {
    await waitForGame(page)

    const result = await page.evaluate(() => {
      const g = (window as any).__war3Game
      const th = g.units.find((u: any) => u.team === 0 && u.type === 'townhall' && u.buildProgress >= 1)
      if (!th) return { ok: false, reason: 'no townhall' }
      const r = g.resources.get(0)
      if (r.gold < 1000) g.resources.earn(0, 1000 - r.gold, 0)
      if (r.lumber < 1000) g.resources.earn(0, 0, 1000 - r.lumber)

      g.selectionModel.clear()
      g.selectionModel.setSelection([th])
      g.updateHUD(0.016)

      const btn = [...document.querySelectorAll('#command-card button')].find((b: any) =>
        b.querySelector('.btn-label')?.textContent?.trim() === '农民'
      ) as HTMLButtonElement | undefined
      const before = { res: g.resources.get(0), queue: th.trainingQueue.length }
      btn?.click()
      const after = { res: g.resources.get(0), queue: th.trainingQueue.length }
      return {
        ok: true,
        disabled: btn?.disabled ?? true,
        reason: btn?.dataset.disabledReason ?? '',
        before,
        after,
      }
    })

    expect(result.ok).toBe(true)
    expect(result.disabled).toBe(false)
    expect(result.reason).toBe('')
    expect(result.after.queue).toBe(result.before.queue + 1)
    expect(result.after.res.gold).toBe(result.before.res.gold - 75)
  })

  test('command card refreshes when completed farm increases supply', async ({ page }) => {
    await waitForGame(page)

    const result = await page.evaluate(() => {
      const g = (window as any).__war3Game
      const th = g.units.find((u: any) => u.team === 0 && u.type === 'townhall' && u.buildProgress >= 1)
      if (!th) return { ok: false, reason: 'no townhall' }
      const r = g.resources.get(0)
      if (r.gold < 1000) g.resources.earn(0, 1000 - r.gold, 0)
      if (r.lumber < 1000) g.resources.earn(0, 0, 1000 - r.lumber)
      let spawned = 0
      while (g.resources.computeSupply(0, g.units).used < g.resources.computeSupply(0, g.units).total) {
        g.spawnUnit('worker', 0, 35 + spawned, 35)
        spawned++
        if (spawned > 60) break
      }

      g.selectionModel.clear()
      g.selectionModel.setSelection([th])
      g.updateHUD(0.016)
      const beforeBtn = [...document.querySelectorAll('#command-card button')].find((b: any) =>
        b.querySelector('.btn-label')?.textContent?.trim() === '农民'
      ) as HTMLButtonElement | undefined

      const farm = g.spawnBuilding('farm', 0, 45, 45)
      farm.buildProgress = 0
      g.updateHUD(0.016)
      const duringBtn = [...document.querySelectorAll('#command-card button')].find((b: any) =>
        b.querySelector('.btn-label')?.textContent?.trim() === '农民'
      ) as HTMLButtonElement | undefined

      farm.buildProgress = 1
      g.updateHUD(0.016)
      const afterBtn = [...document.querySelectorAll('#command-card button')].find((b: any) =>
        b.querySelector('.btn-label')?.textContent?.trim() === '农民'
      ) as HTMLButtonElement | undefined

      return {
        ok: true,
        beforeDisabled: beforeBtn?.disabled ?? false,
        duringDisabled: duringBtn?.disabled ?? false,
        afterDisabled: afterBtn?.disabled ?? true,
        afterReason: afterBtn?.dataset.disabledReason ?? '',
      }
    })

    expect(result.ok).toBe(true)
    expect(result.beforeDisabled).toBe(true)
    expect(result.duringDisabled).toBe(true)
    expect(result.afterDisabled).toBe(false)
    expect(result.afterReason).toBe('')
  })

  test('command card refreshes when resources change without reselection', async ({ page }) => {
    await waitForGame(page)

    const result = await page.evaluate(() => {
      const g = (window as any).__war3Game
      const worker = g.units.find((u: any) => u.team === 0 && u.type === 'worker' && u.hp > 0)
      if (!worker) return { ok: false, reason: 'no worker' }
      const r = g.resources.get(0)
      if (r.gold < 1000) g.resources.earn(0, 1000 - r.gold, 0)
      const afterGold = g.resources.get(0)
      if (afterGold.lumber > 0) g.resources.spend(0, { gold: 0, lumber: afterGold.lumber })

      g.selectionModel.clear()
      g.selectionModel.setSelection([worker])
      g.updateHUD(0.016)
      const beforeBtn = [...document.querySelectorAll('#command-card button')].find((b: any) =>
        b.querySelector('.btn-label')?.textContent?.trim() === '农场'
      ) as HTMLButtonElement | undefined

      g.resources.earn(0, 0, 1000)
      g.updateHUD(0.016)
      const afterBtn = [...document.querySelectorAll('#command-card button')].find((b: any) =>
        b.querySelector('.btn-label')?.textContent?.trim() === '农场'
      ) as HTMLButtonElement | undefined

      return {
        ok: true,
        beforeDisabled: beforeBtn?.disabled ?? false,
        beforeReason: beforeBtn?.dataset.disabledReason ?? '',
        afterDisabled: afterBtn?.disabled ?? true,
        afterReason: afterBtn?.dataset.disabledReason ?? '',
      }
    })

    expect(result.ok).toBe(true)
    expect(result.beforeDisabled).toBe(true)
    expect(result.beforeReason).toContain('木材不足')
    expect(result.afterDisabled).toBe(false)
    expect(result.afterReason).toBe('')
  })

  test('no severe console errors', async ({ page }) => {
    await waitForGame(page)
    await page.waitForTimeout(1000)
    expect(severeConsoleErrors(page)).toEqual([])
  })
})
