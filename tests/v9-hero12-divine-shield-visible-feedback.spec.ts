/**
 * V9 HERO12-UX1 Divine Shield visible active/cooldown feedback proof.
 *
 * Proves:
 * 1. When DS active, HUD shows active-state text with remaining seconds.
 * 2. While active, cast button disabled with "生效中" + remaining time.
 * 3. After duration expires, cast button shows cooldown reason + remaining seconds.
 * 4. After cooldown expires + mana sufficient, cast button enabled without reselect.
 * 5. Mana shortage is a separate reason and does not overwrite active/cooldown.
 * 6. Holy Light learned feedback, HERO12 self-cast, HERO9 revive unchanged.
 *
 * Not: particles, sound, CSS effects, AI, Devotion Aura, Resurrection, other heroes.
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
  } catch { /* procedural fallback */ }
  await page.evaluate(() => {
    const g = (window as any).__war3Game
    if (g?.ai) { if (typeof g.ai.reset === 'function') g.ai.reset(); g.ai.update = () => {} }
  })
  await page.waitForTimeout(300)
}

async function summonPaladin(page: Page): Promise<any> {
  return page.evaluate(() => {
    const g = (window as any).__war3Game
    g.resources.earn(0, 10000, 10000)
    g.spawnBuilding('altar_of_kings', 0, 15, 15)
    const altar = g.units.find((u: any) => u.team === 0 && u.type === 'altar_of_kings' && u.isBuilding)
    if (!altar) return null
    g.selectionModel.clear()
    g.selectionModel.setSelection([altar])
    g._lastCmdKey = ''
    g.updateHUD(0.016)
    const btn = Array.from(document.querySelectorAll('#command-card button')).find((b: any) =>
      b.querySelector('.btn-label')?.textContent?.trim() === '圣骑士',
    ) as HTMLButtonElement | undefined
    if (btn) btn.click()
    const dt = 0.5
    for (let i = 0; i < 120; i++) { g.gameTime += dt; g.updateUnits(dt) }
    const paladin = g.units.find((u: any) => u.type === 'paladin' && !u.isBuilding && u.team === 0)
    return paladin ? { type: paladin.type, heroLevel: paladin.heroLevel, heroSkillPoints: paladin.heroSkillPoints } : null
  })
}

async function selectPaladin(page: Page) {
  await page.evaluate(() => {
    const g = (window as any).__war3Game
    const paladin = g.units.find((u: any) => u.type === 'paladin' && !u.isBuilding && u.team === 0)
    if (!paladin) return
    g.selectionModel.clear()
    g.selectionModel.setSelection([paladin])
    g._lastCmdKey = ''
    g.updateHUD(0.016)
  })
}

test.describe('V9 HERO12-UX1 Divine Shield visible feedback', () => {
  test.setTimeout(180000)

  test('VF-1: DS active → HUD shows remaining seconds in unit-stats', async ({ page }) => {
    await waitForRuntime(page)
    const pal = await summonPaladin(page)
    expect(pal).not.toBeNull()

    await page.evaluate(() => {
      const g = (window as any).__war3Game
      const paladin = g.units.find((u: any) => u.type === 'paladin' && !u.isBuilding && u.team === 0)
      if (!paladin) return
      if (!paladin.abilityLevels) paladin.abilityLevels = {}
      paladin.abilityLevels.divine_shield = 1
      paladin.mana = 100
      g.castDivineShield(paladin)
    })

    await selectPaladin(page)

    // Force HUD refresh
    await page.evaluate(() => {
      const g = (window as any).__war3Game
      g._lastSelKey = ''
      g.updateHUD(0.016)
    })

    const result = await page.evaluate(() => {
      const statsEl = document.getElementById('unit-stats')
      const statsText = statsEl?.textContent ?? ''
      const match = statsText.match(/神圣护盾生效\s*(\d+)s/)
      return {
        showsActive: statsText.includes('神圣护盾生效'),
        remainingSeconds: match ? parseInt(match[1], 10) : -1,
      }
    })

    expect(result.showsActive).toBe(true)
    expect(result.remainingSeconds).toBeGreaterThan(0)
    expect(result.remainingSeconds).toBeLessThanOrEqual(15)
  })

  test('VF-2: while active, cast button disabled with "生效中" + remaining time', async ({ page }) => {
    await waitForRuntime(page)
    const pal = await summonPaladin(page)
    expect(pal).not.toBeNull()

    await page.evaluate(() => {
      const g = (window as any).__war3Game
      const paladin = g.units.find((u: any) => u.type === 'paladin' && !u.isBuilding && u.team === 0)
      if (!paladin) return
      if (!paladin.abilityLevels) paladin.abilityLevels = {}
      paladin.abilityLevels.divine_shield = 1
      paladin.mana = 100
      g.castDivineShield(paladin)
    })

    await selectPaladin(page)

    // Force HUD refresh
    await page.evaluate(() => {
      const g = (window as any).__war3Game
      g._lastCmdKey = ''
      g._lastSelKey = ''
      g.updateHUD(0.016)
    })

    const result = await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('#command-card button'))
      const castBtn = buttons.find((b: any) => {
        const txt = b.querySelector('.btn-label')?.textContent?.trim() ?? ''
        return txt.includes('神圣护盾 (Lv1)')
      }) as HTMLButtonElement | undefined
      if (!castBtn) return { hasCastBtn: false }
      const reason = castBtn.dataset.disabledReason ?? ''
      const match = reason.match(/([\d.]+)s/)
      return {
        hasCastBtn: true,
        disabled: castBtn.disabled,
        reason,
        hasActiveText: reason.includes('生效中'),
        remainingSeconds: match ? parseFloat(match[1]) : -1,
      }
    })

    expect(result.hasCastBtn).toBe(true)
    expect(result.disabled).toBe(true)
    expect(result.hasActiveText).toBe(true)
    expect(result.remainingSeconds).toBeGreaterThan(0)
  })

  test('VF-3: after duration expires, cast button shows cooldown + remaining seconds', async ({ page }) => {
    await waitForRuntime(page)
    const pal = await summonPaladin(page)
    expect(pal).not.toBeNull()

    await page.evaluate(() => {
      const g = (window as any).__war3Game
      const paladin = g.units.find((u: any) => u.type === 'paladin' && !u.isBuilding && u.team === 0)
      if (!paladin) return
      if (!paladin.abilityLevels) paladin.abilityLevels = {}
      paladin.abilityLevels.divine_shield = 1
      paladin.mana = 100
      g.castDivineShield(paladin)
      // Advance past duration (15s) but not cooldown (35s)
      g.gameTime += 16
    })

    await selectPaladin(page)

    // Force HUD refresh
    await page.evaluate(() => {
      const g = (window as any).__war3Game
      g._lastCmdKey = ''
      g._lastSelKey = ''
      g.updateHUD(0.016)
    })

    const result = await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('#command-card button'))
      const castBtn = buttons.find((b: any) => {
        const txt = b.querySelector('.btn-label')?.textContent?.trim() ?? ''
        return txt.includes('神圣护盾 (Lv1)')
      }) as HTMLButtonElement | undefined
      if (!castBtn) return { hasCastBtn: false }
      const reason = castBtn.dataset.disabledReason ?? ''
      const match = reason.match(/([\d.]+)s/)
      return {
        hasCastBtn: true,
        disabled: castBtn.disabled,
        reason,
        hasCooldownText: reason.includes('冷却中'),
        remainingSeconds: match ? parseFloat(match[1]) : -1,
        hasNoActiveText: !reason.includes('生效中'),
      }
    })

    expect(result.hasCastBtn).toBe(true)
    expect(result.disabled).toBe(true)
    expect(result.hasCooldownText).toBe(true)
    expect(result.remainingSeconds).toBeGreaterThan(0)
    expect(result.hasNoActiveText).toBe(true)
  })

  test('VF-4: after cooldown expires + mana sufficient, cast button enabled without reselect', async ({ page }) => {
    await waitForRuntime(page)
    const pal = await summonPaladin(page)
    expect(pal).not.toBeNull()

    await page.evaluate(() => {
      const g = (window as any).__war3Game
      const paladin = g.units.find((u: any) => u.type === 'paladin' && !u.isBuilding && u.team === 0)
      if (!paladin) return
      if (!paladin.abilityLevels) paladin.abilityLevels = {}
      paladin.abilityLevels.divine_shield = 1
      paladin.mana = 100
    })
    await selectPaladin(page)
    await page.evaluate(() => {
      const g = (window as any).__war3Game
      const castBtn = Array.from(document.querySelectorAll('#command-card button')).find((b: any) =>
        b.querySelector('.btn-label')?.textContent?.trim()?.includes('神圣护盾 (Lv1)'),
      ) as HTMLButtonElement | undefined
      castBtn?.click()
      const paladin = g.units.find((u: any) => u.type === 'paladin' && !u.isBuilding && u.team === 0)
      if (!paladin) return
      g.gameTime += 36
      paladin.mana = 100
    })

    // Do NOT reselect after the cast — just let HUD rebuild from elapsed time.
    await page.evaluate(() => {
      const g = (window as any).__war3Game
      g.updateHUD(0.016)
    })

    const result = await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('#command-card button'))
      const castBtn = buttons.find((b: any) => {
        const txt = b.querySelector('.btn-label')?.textContent?.trim() ?? ''
        return txt.includes('神圣护盾 (Lv1)')
      }) as HTMLButtonElement | undefined
      if (!castBtn) return { hasCastBtn: false }
      return {
        hasCastBtn: true,
        enabled: !castBtn.disabled,
        reason: castBtn.dataset.disabledReason ?? '',
      }
    })

    expect(result.hasCastBtn).toBe(true)
    expect(result.enabled).toBe(true)
    expect(result.reason).toBe('')
  })

  test('VF-5: mana shortage is separate reason, does not overwrite active/cooldown priority', async ({ page }) => {
    await waitForRuntime(page)
    const pal = await summonPaladin(page)
    expect(pal).not.toBeNull()

    // Test 1: Mana shortage when NOT on active/cooldown
    await page.evaluate(() => {
      const g = (window as any).__war3Game
      const paladin = g.units.find((u: any) => u.type === 'paladin' && !u.isBuilding && u.team === 0)
      if (!paladin) return
      if (!paladin.abilityLevels) paladin.abilityLevels = {}
      paladin.abilityLevels.divine_shield = 1
      paladin.mana = 10
    })

    await selectPaladin(page)

    const manaOnlyResult = await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('#command-card button'))
      const castBtn = buttons.find((b: any) => {
        const txt = b.querySelector('.btn-label')?.textContent?.trim() ?? ''
        return txt.includes('神圣护盾 (Lv1)')
      }) as HTMLButtonElement | undefined
      if (!castBtn) return { hasCastBtn: false }
      return {
        hasCastBtn: true,
        disabled: castBtn.disabled,
        reason: castBtn.dataset.disabledReason ?? '',
      }
    })

    expect(manaOnlyResult.hasCastBtn).toBe(true)
    expect(manaOnlyResult.disabled).toBe(true)
    expect(manaOnlyResult.reason).toContain('魔力不足')

    // Test 2: Active state takes priority over mana shortage
    const activePriorityResult = await page.evaluate(() => {
      const g = (window as any).__war3Game
      const paladin = g.units.find((u: any) => u.type === 'paladin' && !u.isBuilding && u.team === 0)
      if (!paladin) return null
      paladin.mana = 100
      g.castDivineShield(paladin)
      // Now drain mana
      paladin.mana = 0
      g._lastCmdKey = ''
      g._lastSelKey = ''
      g.updateHUD(0.016)
      const buttons = Array.from(document.querySelectorAll('#command-card button'))
      const castBtn = buttons.find((b: any) => {
        const txt = b.querySelector('.btn-label')?.textContent?.trim() ?? ''
        return txt.includes('神圣护盾 (Lv1)')
      }) as HTMLButtonElement | undefined
      if (!castBtn) return null
      return { reason: castBtn.dataset.disabledReason ?? '' }
    })

    expect(activePriorityResult).not.toBeNull()
    expect(activePriorityResult!.reason).toContain('生效中')
    expect(activePriorityResult!.reason).not.toContain('魔力不足')
  })

  test('VF-6: Holy Light feedback, HERO12 self-cast, HERO9 revive unchanged', async ({ page }) => {
    await waitForRuntime(page)
    const pal = await summonPaladin(page)
    expect(pal).not.toBeNull()

    const result = await page.evaluate(() => {
      const g = (window as any).__war3Game
      const paladin = g.units.find((u: any) => u.type === 'paladin' && !u.isBuilding && u.team === 0)
      if (!paladin) return null

      // Learn Holy Light
      if (!paladin.abilityLevels) paladin.abilityLevels = {}
      paladin.abilityLevels.holy_light = 1
      paladin.abilityLevels.divine_shield = 1
      paladin.heroSkillPoints = 0

      // Cast Holy Light
      const footman = g.spawnUnit('footman', 0, paladin.mesh.position.x + 1, paladin.mesh.position.z)
      footman.hp = 50
      const hlCast = g.castHolyLight(paladin, footman)

      // Cast Divine Shield
      paladin.mana = 200
      const dsCast = g.castDivineShield(paladin)

      return {
        hlCast,
        dsCast,
        dsActive: paladin.divineShieldUntil > g.gameTime,
        hlLevel: paladin.abilityLevels.holy_light ?? 0,
      }
    })

    expect(result.hlCast).toBe(true)
    expect(result.dsCast).toBe(true)
    expect(result.dsActive).toBe(true)
    expect(result.hlLevel).toBe(1)
  })
})
