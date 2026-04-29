import { test, expect, type Page } from '@playwright/test'

const BASE_RUNTIME = 'http://127.0.0.1:4173/?runtimeTest=1'

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
  await page.goto(BASE_RUNTIME, { waitUntil: 'domcontentloaded' })
  await page.waitForFunction(() => {
    const game = (window as any).__war3Game
    return !!game &&
      !!game.renderer &&
      Array.isArray(game.units) &&
      game.units.length > 0 &&
      game.renderer.domElement.width > 0
  }, { timeout: 15000 })
  await page.waitForTimeout(300)
}

test.describe('Battlefield focus toggle runtime', () => {
  test.setTimeout(120000)

  test('default pure battlefield hides large information panels and can restore them', async ({ page }) => {
    await waitForGame(page)

    const before = await page.evaluate(() => {
      const ids = ['objective-tracker', 'map-objective-radar', 'human-route-panel', 'milestone-status-panel']
      return {
        hasFocusClass: document.body.classList.contains('battlefield-focus-mode'),
        settingChecked: (document.getElementById('setting-battlefield-focus') as HTMLInputElement).checked,
        buttonText: document.getElementById('battlefield-focus-toggle')?.textContent ?? '',
        buttonPressed: document.getElementById('battlefield-focus-toggle')?.getAttribute('aria-pressed') ?? '',
        visibleCount: ids.filter(id => getComputedStyle(document.getElementById(id)!).display !== 'none').length,
        objectiveBeaconCount: Array.from((window as any).__war3Game.scene.children).filter((obj: any) =>
          typeof obj.name === 'string' && obj.name.startsWith('map-objective-beacon:') && obj.visible
        ).length,
      }
    })

    expect(before.hasFocusClass).toBe(true)
    expect(before.settingChecked).toBe(true)
    expect(before.buttonText).toBe('显示面板')
    expect(before.buttonPressed).toBe('true')
    expect(before.visibleCount).toBe(0)
    expect(before.objectiveBeaconCount).toBe(0)

    await page.locator('#battlefield-focus-toggle').click()

    const restored = await page.evaluate(() => {
      const ids = ['objective-tracker', 'map-objective-radar', 'human-route-panel', 'milestone-status-panel']
      return {
        hasFocusClass: document.body.classList.contains('battlefield-focus-mode'),
        settingChecked: (document.getElementById('setting-battlefield-focus') as HTMLInputElement).checked,
        buttonText: document.getElementById('battlefield-focus-toggle')?.textContent ?? '',
        buttonPressed: document.getElementById('battlefield-focus-toggle')?.getAttribute('aria-pressed') ?? '',
        visibleCount: ids.filter(id => getComputedStyle(document.getElementById(id)!).display !== 'none').length,
        objectiveBeaconCount: Array.from((window as any).__war3Game.scene.children).filter((obj: any) =>
          typeof obj.name === 'string' && obj.name.startsWith('map-objective-beacon:') && obj.visible
        ).length,
      }
    })

    expect(restored.hasFocusClass).toBe(false)
    expect(restored.settingChecked).toBe(false)
    expect(restored.buttonText).toBe('纯战场')
    expect(restored.buttonPressed).toBe('false')
    expect(restored.visibleCount).toBe(4)
    expect(restored.objectiveBeaconCount).toBeGreaterThan(0)

    await page.keyboard.press('F9')

    const hiddenAgain = await page.evaluate(() => {
      const ids = ['objective-tracker', 'map-objective-radar', 'human-route-panel', 'milestone-status-panel']
      return {
        hasFocusClass: document.body.classList.contains('battlefield-focus-mode'),
        buttonText: document.getElementById('battlefield-focus-toggle')?.textContent ?? '',
        buttonPressed: document.getElementById('battlefield-focus-toggle')?.getAttribute('aria-pressed') ?? '',
        visibleCount: ids.filter(id => getComputedStyle(document.getElementById(id)!).display !== 'none').length,
      }
    })

    expect(hiddenAgain.hasFocusClass).toBe(true)
    expect(hiddenAgain.buttonText).toBe('显示面板')
    expect(hiddenAgain.buttonPressed).toBe('true')
    expect(hiddenAgain.visibleCount).toBe(0)
    expect((page as any).__consoleErrors).toEqual([])
    expect((page as any).__pageErrors).toEqual([])
  })
})
