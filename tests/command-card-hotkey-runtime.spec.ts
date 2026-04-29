/**
 * R7/R4 command-card hotkey runtime proof.
 *
 * Visible command-card hotkeys must be executable through the keyboard, and
 * blocked commands must explain why instead of silently doing nothing.
 */
import { test, expect, type Page } from '@playwright/test'

const BASE_RUNTIME = 'http://127.0.0.1:4173/?runtimeTest=1'

async function waitForRuntime(page: Page) {
  const consoleErrors: string[] = []
  const pageErrors: string[] = []
  ;(page as any).__consoleErrors = consoleErrors
  ;(page as any).__pageErrors = pageErrors
  page.on('console', (msg) => {
    if (msg.type() === 'error') consoleErrors.push(msg.text())
  })
  page.on('pageerror', err => pageErrors.push(err.message))

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
    // Procedural fallback is valid for command-card hotkey tests.
  }
  await page.evaluate(() => {
    const g = (window as any).__war3Game
    if (g?.ai) {
      if (typeof g.ai.reset === 'function') g.ai.reset()
      g.ai.update = () => {}
    }
  })
  await page.waitForTimeout(250)
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

test.describe('Command-card keyboard hotkeys', () => {
  test.setTimeout(120000)

  test('disabled worker hotkey flashes blocked feedback and does not enter placement mode', async ({ page }) => {
    await waitForRuntime(page)

    const before = await page.evaluate(() => {
      const g = (window as any).__war3Game
      g.resources.earn(0, 5000, 5000)
      for (const unit of g.units) {
        if (unit.team === 0 && unit.type === 'keep' && unit.isBuilding) unit.hp = 0
        if (unit.team === 0 && unit.type === 'castle' && unit.isBuilding) unit.hp = 0
      }
      g.handleDeadUnits()

      const worker = g.units.find((u: any) => u.team === 0 && u.type === 'worker' && !u.isBuilding && u.hp > 0)
      if (!worker) return { error: 'no worker' }
      g.selectionModel.clear()
      g.selectionModel.setSelection([worker])
      g._lastCmdKey = ''
      g.updateHUD(0.016)

      const workshop = Array.from(document.querySelectorAll('#command-card button')).find((button: any) =>
        button.querySelector('.btn-label')?.textContent?.trim() === '车间',
      ) as HTMLButtonElement | undefined

      return {
        disabled: workshop?.disabled ?? null,
        reason: workshop?.dataset.disabledReason ?? '',
        hotkey: workshop?.dataset.hotkey ?? '',
        placementMode: g.placementMode,
      }
    })

    expect(before.error).toBeUndefined()
    expect(before.disabled).toBe(true)
    expect(before.reason).toContain('主城')
    expect(before.hotkey).toBe('W')

    await page.keyboard.press('w')
    await page.waitForTimeout(80)

    const after = await page.evaluate(() => {
      const hint = document.getElementById('mode-hint')!
      const g = (window as any).__war3Game
      return {
        placementMode: g.placementMode,
        hintText: hint.textContent ?? '',
        hintState: hint.dataset.state ?? '',
      }
    })

    expect(after.placementMode).toBeNull()
    expect(after.hintState).toBe('blocked')
    expect(after.hintText).toContain('W')
    expect(after.hintText).toContain('车间 不可用')
    expect(after.hintText).toContain('主城')
    expect(severeConsoleErrors(page)).toEqual([])
  })

  test('enabled worker hotkey enters the correct building placement mode', async ({ page }) => {
    await waitForRuntime(page)

    const before = await page.evaluate(() => {
      const g = (window as any).__war3Game
      g.resources.earn(0, 5000, 5000)
      const worker = g.units.find((u: any) => u.team === 0 && u.type === 'worker' && !u.isBuilding && u.hp > 0)
      if (!worker) return { error: 'no worker' }

      g.selectionModel.clear()
      g.selectionModel.setSelection([worker])
      g._lastCmdKey = ''
      g.updateHUD(0.016)

      const blacksmith = Array.from(document.querySelectorAll('#command-card button')).find((button: any) =>
        button.querySelector('.btn-label')?.textContent?.trim() === '铁匠铺',
      ) as HTMLButtonElement | undefined

      return {
        disabled: blacksmith?.disabled ?? null,
        hotkey: blacksmith?.dataset.hotkey ?? '',
        placementMode: g.placementMode,
      }
    })

    expect(before.error).toBeUndefined()
    expect(before.disabled).toBe(false)
    expect(before.hotkey).toBe('S')
    expect(before.placementMode).toBeNull()

    await page.keyboard.press('s')
    await page.waitForTimeout(80)

    const after = await page.evaluate(() => {
      const hint = document.getElementById('mode-hint')!
      const g = (window as any).__war3Game
      return {
        placementMode: g.placementMode,
        hintText: hint.textContent ?? '',
        hintState: hint.dataset.state ?? '',
      }
    })

    expect(after.placementMode).toBe('blacksmith')
    expect(after.hintState).toBe('ok')
    expect(after.hintText).toContain('S')
    expect(after.hintText).toContain('铁匠铺')
    expect(severeConsoleErrors(page)).toEqual([])
  })

  test('town hall P hotkey trains a worker instead of falling through to screenshot', async ({ page }) => {
    await waitForRuntime(page)

    const before = await page.evaluate(() => {
      const g = (window as any).__war3Game
      g.resources.earn(0, 5000, 5000)
      for (let i = 0; i < 4; i++) {
        const farm = g.spawnBuilding('farm', 0, 40 + i * 2, 42)
        farm.buildProgress = 1
      }
      const townhall = g.units.find((u: any) => u.team === 0 && u.type === 'townhall' && u.isBuilding && u.hp > 0)
      if (!townhall) return { error: 'no townhall' }

      g.selectionModel.clear()
      g.selectionModel.setSelection([townhall])
      g._lastCmdKey = ''
      g.updateHUD(0.016)

      const workerButton = Array.from(document.querySelectorAll('#command-card button')).find((button: any) =>
        button.querySelector('.btn-label')?.textContent?.trim() === '农民',
      ) as HTMLButtonElement | undefined

      return {
        queueBefore: townhall.trainingQueue.length,
        disabled: workerButton?.disabled ?? null,
        hotkey: workerButton?.dataset.hotkey ?? '',
      }
    })

    expect(before.error).toBeUndefined()
    expect(before.disabled).toBe(false)
    expect(before.hotkey).toBe('P')

    await page.keyboard.press('p')
    await page.waitForTimeout(80)

    const after = await page.evaluate(() => {
      const g = (window as any).__war3Game
      const hint = document.getElementById('mode-hint')!
      const townhall = g.units.find((u: any) => u.team === 0 && u.type === 'townhall' && u.isBuilding && u.hp > 0)
      return {
        queueAfter: townhall?.trainingQueue.length ?? -1,
        queuedType: townhall?.trainingQueue.at(-1)?.type ?? '',
        hintText: hint.textContent ?? '',
        hintState: hint.dataset.state ?? '',
      }
    })

    expect(after.queueAfter).toBe(before.queueBefore + 1)
    expect(after.queuedType).toBe('worker')
    expect(after.hintState).toBe('ok')
    expect(after.hintText).toContain('P')
    expect(after.hintText).toContain('农民')
    expect(severeConsoleErrors(page)).toEqual([])
  })

  test('barracks R hotkey explains missing Blacksmith and queues Rifleman once unlocked', async ({ page }) => {
    await waitForRuntime(page)

    const setup = await page.evaluate(() => {
      const g = (window as any).__war3Game
      g.resources.earn(0, 5000, 5000)
      for (let i = 0; i < 4; i++) {
        const farm = g.spawnBuilding('farm', 0, 42 + i * 2, 46)
        farm.buildProgress = 1
      }
      for (const unit of g.units) {
        if (unit.team === 0 && unit.type === 'blacksmith' && unit.isBuilding) unit.hp = 0
      }
      g.handleDeadUnits()

      const barracks = g.spawnBuilding('barracks', 0, 48, 46)
      barracks.buildProgress = 1
      g.selectionModel.clear()
      g.selectionModel.setSelection([barracks])
      g._lastCmdKey = ''
      g.updateHUD(0.016)

      const rifleman = Array.from(document.querySelectorAll('#command-card button')).find((button: any) =>
        button.querySelector('.btn-label')?.textContent?.trim() === '步枪兵',
      ) as HTMLButtonElement | undefined

      return {
        queueBefore: barracks.trainingQueue.length,
        disabled: rifleman?.disabled ?? null,
        reason: rifleman?.dataset.disabledReason ?? '',
        hotkey: rifleman?.dataset.hotkey ?? '',
      }
    })

    expect(setup.disabled).toBe(true)
    expect(setup.reason).toContain('铁匠铺')
    expect(setup.hotkey).toBe('R')

    await page.keyboard.press('r')
    await page.waitForTimeout(80)

    const blocked = await page.evaluate(() => {
      const g = (window as any).__war3Game
      const hint = document.getElementById('mode-hint')!
      const barracks = g.selectionModel.primary
      return {
        queueAfter: barracks?.trainingQueue.length ?? -1,
        hintText: hint.textContent ?? '',
        hintState: hint.dataset.state ?? '',
      }
    })

    expect(blocked.queueAfter).toBe(setup.queueBefore)
    expect(blocked.hintState).toBe('blocked')
    expect(blocked.hintText).toContain('步枪兵 不可用')
    expect(blocked.hintText).toContain('铁匠铺')

    const unlocked = await page.evaluate(() => {
      const g = (window as any).__war3Game
      const blacksmith = g.spawnBuilding('blacksmith', 0, 52, 46)
      blacksmith.buildProgress = 1
      g._lastCmdKey = ''
      g.updateHUD(0.016)
      const barracks = g.selectionModel.primary
      return {
        queueBefore: barracks?.trainingQueue.length ?? -1,
        buttonEnabled: !Array.from(document.querySelectorAll('#command-card button')).find((button: any) =>
          button.querySelector('.btn-label')?.textContent?.trim() === '步枪兵',
        )?.hasAttribute('disabled'),
      }
    })

    expect(unlocked.buttonEnabled).toBe(true)

    await page.keyboard.press('r')
    await page.waitForTimeout(80)

    const trained = await page.evaluate(() => {
      const g = (window as any).__war3Game
      const hint = document.getElementById('mode-hint')!
      const barracks = g.selectionModel.primary
      return {
        queueAfter: barracks?.trainingQueue.length ?? -1,
        queuedType: barracks?.trainingQueue.at(-1)?.type ?? '',
        hintText: hint.textContent ?? '',
        hintState: hint.dataset.state ?? '',
      }
    })

    expect(trained.queueAfter).toBe(unlocked.queueBefore + 1)
    expect(trained.queuedType).toBe('rifleman')
    expect(trained.hintState).toBe('ok')
    expect(trained.hintText).toContain('R')
    expect(trained.hintText).toContain('步枪兵')
    expect(severeConsoleErrors(page)).toEqual([])
  })

  test('command-card letter hotkeys do not steal numeric control groups', async ({ page }) => {
    await waitForRuntime(page)

    const unitIndexes = await page.evaluate(() => {
      const g = (window as any).__war3Game
      const a = g.spawnUnit('footman', 0, 30, 30)
      const b = g.spawnUnit('rifleman', 0, 32, 30)
      g.selectionModel.clear()
      g.selectionModel.setSelection([a, b])
      g._lastCmdKey = ''
      g.updateHUD(0.016)
      return [g.units.indexOf(a), g.units.indexOf(b)]
    })

    await page.keyboard.press('Control+1')

    const saved = await page.evaluate((indexes) => {
      const g = (window as any).__war3Game
      g.selectionModel.clear()
      g.updateHUD(0.016)
      return {
        selectedAfterClear: g.selectionModel.count,
        originalTypes: indexes.map((i: number) => g.units[i]?.type ?? ''),
      }
    }, unitIndexes)

    expect(saved.selectedAfterClear).toBe(0)
    expect(saved.originalTypes).toEqual(['footman', 'rifleman'])

    await page.keyboard.press('1')
    await page.waitForTimeout(80)

    const recalled = await page.evaluate(() => {
      const g = (window as any).__war3Game
      const hint = document.getElementById('mode-hint')!
      return {
        selectedCount: g.selectionModel.count,
        selectedTypes: g.selectionModel.units.map((u: any) => u.type).sort(),
        hintText: hint.textContent ?? '',
        hintState: hint.dataset.state ?? '',
      }
    })

    expect(recalled.selectedCount).toBe(2)
    expect(recalled.selectedTypes).toEqual(['footman', 'rifleman'])
    expect(recalled.hintText).toContain('编组 1')
    expect(recalled.hintState).toBe('')
    expect(severeConsoleErrors(page)).toEqual([])
  })
})
