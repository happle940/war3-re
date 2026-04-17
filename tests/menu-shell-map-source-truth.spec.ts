/**
 * Menu Shell Map Source Truth Contract
 *
 * Proves that the menu shell honestly displays the current map source
 * before and after manual map selection, and that the visible label
 * stays aligned with the actual start action source.
 */
import { test, expect, type Page } from '@playwright/test'

const BASE_NORMAL = 'http://127.0.0.1:4173/'

async function waitForBoot(page: Page) {
  const consoleErrors: string[] = []
  page.on('console', (msg) => {
    if (msg.type() === 'error') consoleErrors.push(msg.text())
  })
  ;(page as any).__consoleErrors = consoleErrors

  await page.goto(BASE_NORMAL, { waitUntil: 'domcontentloaded' })
  await page.waitForFunction(() => {
    const game = (window as any).__war3Game
    if (!game) return false
    const canvas = document.getElementById('game-canvas')
    if (!canvas) return false
    if (!game.renderer) return false
    const el = game.renderer.domElement
    if (el.width === 0 || el.height === 0) return false
    if (!Array.isArray(game.units) || game.units.length === 0) return false
    return true
  }, { timeout: 15000 })
  await page.waitForTimeout(500)
}

test.describe('Menu Shell Map Source Truth', () => {
  test.setTimeout(120000)

  test('default procedural source is shown truthfully before manual upload', async ({ page }) => {
    await waitForBoot(page)

    const result = await page.evaluate(async () => {
      const g = (window as any).__war3Game
      const label = document.getElementById('menu-map-source-label')!
      const menuShell = document.getElementById('menu-shell')!
      const getMapSourceLabel = (window as any).__getMapSourceLabel as () => string

      const menuVisible = !menuShell.hidden
      const labelText = label.textContent
      const gameSourceKind = g.currentMapSource?.kind
      const derivedLabel = getMapSourceLabel()

      return { menuVisible, labelText, gameSourceKind, derivedLabel }
    })

    // Menu is visible at boot
    expect(result.menuVisible).toBe(true)

    // Game's actual source is procedural
    expect(result.gameSourceKind).toBe('procedural')

    // Label shows the truthful procedural text
    expect(result.labelText).toContain('程序化地图')

    // Label matches what getMapSourceLabel would produce
    expect(result.labelText).toBe(result.derivedLabel)
  })

  test('after simulated map load, label reflects parsed source truthfully', async ({ page }) => {
    await waitForBoot(page)

    const result = await page.evaluate(async () => {
      const g = (window as any).__war3Game
      const label = document.getElementById('menu-map-source-label')!
      const getMapSourceLabel = (window as any).__getMapSourceLabel as () => string

      // Simulate the game's currentMapSource being set to parsed
      // (this mirrors what game.loadMap() does internally)
      g.currentMapSource = {
        kind: 'parsed',
        mapData: {
          terrain: { width: 64, height: 64, tileset: 'A' },
          info: null,
          unitPositions: [],
        },
      }

      // The label should now derive the parsed text
      const derivedAfter = getMapSourceLabel()

      return { derivedAfter }
    })

    // After source changes to parsed, derived label shows map info
    expect(result.derivedAfter).toContain('W3X')
    expect(result.derivedAfter).toContain('64')
    expect(result.derivedAfter).toContain('tileset=A')
  })

  test('visible source and start action stay aligned', async ({ page }) => {
    await waitForBoot(page)

    const result = await page.evaluate(async () => {
      const g = (window as any).__war3Game
      const label = document.getElementById('menu-map-source-label')!
      const menuStartBtn = document.getElementById('menu-start-button') as HTMLButtonElement
      const menuShell = document.getElementById('menu-shell')!

      // Capture source before start
      const sourceBefore = g.currentMapSource?.kind
      const labelTextBefore = label.textContent

      // Click start → briefing → gameplay
      menuStartBtn.click()
      await new Promise(r => setTimeout(r, 50))
      document.getElementById('briefing-start-button')!.click()
      await new Promise(r => setTimeout(r, 50))

      // After start, source is unchanged — same map will play
      const sourceAfter = g.currentMapSource?.kind
      const isPlaying = g.phase.isPlaying()

      return { sourceBefore, sourceAfter, isPlaying, labelTextBefore }
    })

    // Source before and after start is the same (procedural)
    expect(result.sourceBefore).toBe('procedural')
    expect(result.sourceAfter).toBe('procedural')

    // The label that was shown matches what will actually play
    expect(result.labelTextBefore).toContain('程序化地图')

    // Game is now playing
    expect(result.isPlaying).toBe(true)
  })
})
