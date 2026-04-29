/**
 * R7/R14 command-card cooldown, resource, and targeting feedback proof.
 *
 * Runtime buttons must expose structured meter/resource state, not only
 * Chinese disabled text in the label area.
 */
import { test, expect, type Page } from '@playwright/test'

const BASE_RUNTIME = 'http://127.0.0.1:4173/?runtimeTest=1'

async function waitForRuntime(page: Page) {
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
    // Procedural fallback is valid for command-card feedback tests.
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

test.describe('Command-card cooldown and cast feedback', () => {
  test.setTimeout(120000)

  test('ability buttons expose cooldown, active, and mana-deficit layers', async ({ page }) => {
    await waitForRuntime(page)

    const result = await page.evaluate(() => {
      const g = (window as any).__war3Game

      const readButton = (label: string) => {
        const btn = Array.from(document.querySelectorAll('#command-card button')).find((button: any) =>
          button.querySelector('.btn-label')?.textContent?.trim() === label,
        ) as HTMLButtonElement | undefined
        return {
          exists: !!btn,
          label,
          commandState: btn?.dataset.commandState ?? '',
          meterKind: btn?.dataset.meterKind ?? '',
          meterRemaining: Number(btn?.dataset.meterRemaining ?? 0),
          meterTotal: Number(btn?.dataset.meterTotal ?? 0),
          meterProgress: Number(btn?.dataset.meterProgress ?? 0),
          resourceKind: btn?.dataset.resourceKind ?? '',
          resourceCurrent: Number(btn?.dataset.resourceCurrent ?? 0),
          resourceRequired: Number(btn?.dataset.resourceRequired ?? 0),
          resourceDeficit: Number(btn?.dataset.resourceDeficit ?? 0),
          badge: btn?.querySelector('.btn-state-badge')?.textContent ?? '',
          meterLabel: btn?.querySelector('.btn-meter-label')?.textContent ?? '',
          resourceDebt: btn?.querySelector('.btn-resource-debt')?.textContent ?? '',
          title: btn?.title ?? '',
        }
      }

      const paladin = g.spawnUnit('paladin', 0, 28, 28)
      paladin.abilityLevels = {
        ...(paladin.abilityLevels ?? {}),
        holy_light: 1,
        divine_shield: 1,
      }
      paladin.mana = paladin.maxMana
      paladin.healCooldownUntil = g.gameTime + 3.2

      g.selectionModel.clear()
      g.selectionModel.setSelection([paladin])
      g._lastCmdKey = ''
      g._lastSelKey = ''
      g.updateHUD(0.016)
      const cooldown = readButton('圣光术 (Lv1)')

      paladin.healCooldownUntil = 0
      paladin.mana = 20
      g._lastCmdKey = ''
      g.updateHUD(0.016)
      const manaDeficit = readButton('圣光术 (Lv1)')

      paladin.mana = paladin.maxMana
      paladin.divineShieldUntil = g.gameTime + 7.4
      paladin.divineShieldCooldownUntil = g.gameTime + 25
      g._lastCmdKey = ''
      g.updateHUD(0.016)
      const active = readButton('神圣护盾 (Lv1)')

      return { cooldown, manaDeficit, active }
    })

    expect(result.cooldown).toMatchObject({
      exists: true,
      commandState: 'cooldown',
      meterKind: 'cooldown',
      meterTotal: 5,
      resourceKind: 'mana',
      resourceDeficit: 0,
      badge: '冷',
    })
    expect(result.cooldown.meterRemaining).toBeGreaterThan(2)
    expect(result.cooldown.meterProgress).toBeGreaterThan(0.4)
    expect(result.cooldown.meterLabel).toContain('s')

    expect(result.manaDeficit).toMatchObject({
      exists: true,
      commandState: 'resource',
      resourceKind: 'mana',
      resourceCurrent: 20,
      resourceRequired: 65,
      resourceDeficit: 45,
      badge: '缺',
      resourceDebt: '💧45',
    })
    expect(result.manaDeficit.title).toContain('法力不足')

    expect(result.active).toMatchObject({
      exists: true,
      commandState: 'active',
      meterKind: 'active',
      meterTotal: 15,
      badge: '效',
    })
    expect(result.active.meterRemaining).toBeGreaterThan(6)
    expect(result.active.meterLabel).toContain('s')
  })

  test('target-mode spells mark the originating command button as targeting', async ({ page }) => {
    await waitForRuntime(page)

    const result = await page.evaluate(() => {
      const g = (window as any).__war3Game
      const archmage = g.spawnUnit('archmage', 0, 34, 34)
      archmage.abilityLevels = {
        ...(archmage.abilityLevels ?? {}),
        water_elemental: 1,
      }
      archmage.mana = archmage.maxMana

      g.selectionModel.clear()
      g.selectionModel.setSelection([archmage])
      g._lastCmdKey = ''
      g._lastSelKey = ''
      g.updateHUD(0.016)

      const initial = Array.from(document.querySelectorAll('#command-card button')).find((button: any) =>
        button.querySelector('.btn-label')?.textContent?.trim() === '召唤水元素 (Lv1)',
      ) as HTMLButtonElement | undefined
      initial?.click()

      g.updateHUD(0.016)
      const targeting = Array.from(document.querySelectorAll('#command-card button')).find((button: any) =>
        button.querySelector('.btn-label')?.textContent?.trim() === '召唤水元素 (Lv1)',
      ) as HTMLButtonElement | undefined

      return {
        initialExists: !!initial,
        commandState: targeting?.dataset.commandState ?? '',
        targeting: targeting?.dataset.targeting ?? '',
        badge: targeting?.querySelector('.btn-state-badge')?.textContent ?? '',
        modeHint: document.getElementById('mode-hint')?.textContent ?? '',
      }
    })

    expect(result.initialExists).toBe(true)
    expect(result.commandState).toBe('targeting')
    expect(result.targeting).toBe('true')
    expect(result.badge).toBe('瞄')
    expect(result.modeHint).toContain('召唤水元素')
  })
})
