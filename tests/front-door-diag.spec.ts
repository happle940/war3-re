import { test, expect, type Page } from '@playwright/test'

const BASE_NORMAL = 'http://127.0.0.1:4173/'

test.describe('Front Door Diagnostics', () => {
  test.setTimeout(30000)

  test('non-runtimeTest boot state', async ({ page }) => {
    const logs: string[] = []
    page.on('console', (msg) => logs.push(`${msg.type()}: ${msg.text()}`))

    await page.goto(BASE_NORMAL, { waitUntil: 'domcontentloaded' })
    await page.waitForTimeout(3000)

    const state = await page.evaluate(() => {
      return {
        hasGame: !!(window as any).__war3Game,
        hasRenderer: !!(window as any).__war3Game?.renderer,
        canvasW: (window as any).__war3Game?.renderer?.domElement?.width ?? -1,
        unitsLen: (window as any).__war3Game?.units?.length ?? -1,
        menuHidden: (document.getElementById('menu-shell') as HTMLElement).hidden,
        mapStatus: document.getElementById('map-status')?.textContent ?? '',
      }
    })

    console.log('STATE:', JSON.stringify(state))
    console.log('ERRORS:', logs.filter(l => l.startsWith('error:')).join('\n'))
    expect(state.hasGame).toBe(true)
  })
})
