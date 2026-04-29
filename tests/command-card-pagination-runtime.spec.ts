/**
 * Command card pagination runtime proof.
 *
 * Proves overflow commands are not silently dropped when a command surface grows
 * beyond the fixed 4x4 card.
 */
import { test, expect, type Page } from '@playwright/test'

const BASE = 'http://127.0.0.1:4173/?runtimeTest=1'

async function waitForGame(page: Page) {
  await page.goto(BASE, { waitUntil: 'domcontentloaded' })
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
    // Procedural fallback is valid for runtime tests.
  }
}

test.describe('Command card pagination runtime', () => {
  test.setTimeout(60000)

  test('overflow command cards expose a page button and preserve late button clicks', async ({ page }) => {
    await waitForGame(page)

    const result = await page.evaluate(() => {
      const g = (window as any).__war3Game
      const clicked: number[] = []
      const specs = Array.from({ length: 20 }, (_, index) => ({
        label: `动作 ${index + 1}`,
        cost: '测试',
        onClick: () => { clicked.push(index + 1) },
      }))

      g.commandCardPresenter.clear()
      g.commandCardPresenter.resetPage()
      g.commandCardPresenter.renderButtons(specs)

      const firstLabels = Array.from(document.querySelectorAll('#command-card button')).map((b: any) =>
        b.querySelector('.btn-label')?.textContent?.trim() ?? '',
      )
      const pageButton = Array.from(document.querySelectorAll('#command-card button')).find((b: any) =>
        b.classList.contains('cmd-page-button'),
      ) as HTMLButtonElement | undefined
      pageButton?.click()

      const secondLabels = Array.from(document.querySelectorAll('#command-card button')).map((b: any) =>
        b.querySelector('.btn-label')?.textContent?.trim() ?? '',
      )
      const lateButton = Array.from(document.querySelectorAll('#command-card button')).find((b: any) =>
        b.querySelector('.btn-label')?.textContent?.trim() === '动作 16',
      ) as HTMLButtonElement | undefined
      lateButton?.click()

      return {
        firstLabels,
        secondLabels,
        clicked,
        buttonCount: document.querySelectorAll('#command-card button').length,
        slotCount: document.querySelectorAll('#command-card .cmd-slot').length,
      }
    })

    expect(result.firstLabels).toContain('动作 15')
    expect(result.firstLabels).toContain('更多 1/2')
    expect(result.firstLabels).not.toContain('动作 16')
    expect(result.secondLabels).toContain('动作 16')
    expect(result.secondLabels).toContain('动作 20')
    expect(result.secondLabels).toContain('返回 2/2')
    expect(result.clicked).toEqual([16])
    expect(result.buttonCount + result.slotCount).toBe(16)
  })
})
