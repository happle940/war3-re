/**
 * V9 HERO18-UX1 Water Elemental visible feedback minimal slice proof.
 *
 * Scope:
 * - Selected Archmage shows learned Water Elemental level in HUD stats.
 * - Command card disabled reason explains mana shortage and cooldown state.
 * - Target mode hint visible during WE placement and disappears on cancel.
 * - Selected Water Elemental shows remaining lifetime while alive.
 * - Feedback does not change game mechanics from Task269.
 */
import { test, expect, type Page } from '@playwright/test'
import {
  HERO_REVIVE_RULES,
  UNITS,
  WATER_ELEMENTAL_SUMMON_LEVELS,
} from '../src/game/GameData'

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
    // Procedural fallback is valid.
  }

  await page.evaluate(() => {
    const g = (window as any).__war3Game
    ;(window as any).__cmdButton = (label: string) =>
      Array.from(document.querySelectorAll('#command-card button')).find((b: any) =>
        b.querySelector('.btn-label')?.textContent?.trim() === label,
      ) as HTMLButtonElement | undefined
    ;(window as any).__cmdButtonIncludes = (fragment: string) =>
      Array.from(document.querySelectorAll('#command-card button')).find((b: any) =>
        b.querySelector('.btn-label')?.textContent?.includes(fragment),
      ) as HTMLButtonElement | undefined
    if (g?.ai) {
      if (typeof g.ai.reset === 'function') g.ai.reset()
      g.ai.update = () => {}
    }
  })
  await page.waitForTimeout(300)
}

test.describe('V9 HERO18-UX1 Water Elemental visible feedback', () => {
  test.setTimeout(180000)

  test('UX1-1: selected Archmage shows learned Water Elemental level in HUD stats', async ({ page }) => {
    await waitForRuntime(page)

    const result = await page.evaluate(() => {
      const g = (window as any).__war3Game
      const archmage = g.spawnUnit('archmage', 0, 30, 30)
      archmage.heroLevel = 1
      archmage.heroSkillPoints = 1
      archmage.mana = archmage.maxMana

      // Select before learning — should NOT show WE level
      g.selectionModel.clear()
      g.selectionModel.setSelection([archmage])
      g._lastCmdKey = ''
      g.updateHUD(0.016)
      const statsBefore = document.getElementById('unit-stats')?.textContent ?? ''

      // Learn Water Elemental Lv1
      const learnBtn = (window as any).__cmdButton('学习水元素 (Lv1)')
      learnBtn?.click()

      // Re-select to refresh HUD
      g.selectionModel.clear()
      g.selectionModel.setSelection([archmage])
      g._lastCmdKey = ''
      g.updateHUD(0.016)
      const statsAfter = document.getElementById('unit-stats')?.textContent ?? ''

      return {
        hasLearnBtn: !!learnBtn,
        statsBefore,
        statsAfter,
        learnedLevel: archmage.abilityLevels?.water_elemental ?? 0,
      }
    })

    expect(result.hasLearnBtn).toBe(true)
    expect(result.learnedLevel).toBe(1)
    // Before learning, no WE level shown
    expect(result.statsBefore).not.toContain('水元素')
    // After learning, WE level shown in stats
    expect(result.statsAfter).toContain('水元素 Lv1')
  })

  test('UX1-2: command card clearly explains mana shortage and cooldown state', async ({ page }) => {
    await waitForRuntime(page)

    const result = await page.evaluate(() => {
      const g = (window as any).__war3Game
      const archmage = g.spawnUnit('archmage', 0, 30, 30)
      archmage.heroLevel = 1
      archmage.heroSkillPoints = 1
      archmage.mana = archmage.maxMana

      // Learn Lv1
      g.selectionModel.clear()
      g.selectionModel.setSelection([archmage])
      g._lastCmdKey = ''
      g.updateHUD(0.016)
      const learnBtn = (window as any).__cmdButton('学习水元素 (Lv1)')
      learnBtn?.click()

      // --- Mana shortage scenario ---
      archmage.mana = 1
      g.selectionModel.clear()
      g.selectionModel.setSelection([archmage])
      g._lastCmdKey = ''
      g.updateHUD(0.016)
      const manaBtn = (window as any).__cmdButton('召唤水元素 (Lv1)')
      const manaDisabled = manaBtn?.disabled ?? false
      const manaReason = manaBtn?.dataset.disabledReason ?? ''
      const manaBtnText = manaBtn?.querySelector('.btn-reason')?.textContent ?? ''

      // --- Cooldown scenario ---
      archmage.mana = archmage.maxMana
      archmage.waterElementalCooldownUntil = g.gameTime + 15
      g.selectionModel.clear()
      g.selectionModel.setSelection([archmage])
      g._lastCmdKey = ''
      g.updateHUD(0.016)
      const cdBtn = (window as any).__cmdButton('召唤水元素 (Lv1)')
      const cdDisabled = cdBtn?.disabled ?? false
      const cdReason = cdBtn?.dataset.disabledReason ?? ''
      const cdBtnText = cdBtn?.querySelector('.btn-reason')?.textContent ?? ''

      return {
        hasManaBtn: !!manaBtn,
        manaDisabled,
        manaReason,
        manaBtnText,
        cdDisabled,
        cdReason,
        cdBtnText,
      }
    })

    // Mana shortage
    expect(result.hasManaBtn).toBe(true)
    expect(result.manaDisabled).toBe(true)
    expect(result.manaReason).toContain('魔力不足')
    expect(result.manaBtnText).toContain('魔力不足')

    // Cooldown
    expect(result.cdDisabled).toBe(true)
    expect(result.cdReason).toContain('冷却中')
    expect(result.cdBtnText).toContain('冷却中')
  })

  test('UX1-3: selected Archmage shows WE cooldown remaining in HUD stats', async ({ page }) => {
    await waitForRuntime(page)

    const result = await page.evaluate(() => {
      const g = (window as any).__war3Game
      const archmage = g.spawnUnit('archmage', 0, 30, 30)
      archmage.heroLevel = 1
      archmage.heroSkillPoints = 1
      archmage.mana = archmage.maxMana

      // Learn and cast
      g.selectionModel.clear()
      g.selectionModel.setSelection([archmage])
      g._lastCmdKey = ''
      g.updateHUD(0.016)
      const learnBtn = (window as any).__cmdButton('学习水元素 (Lv1)')
      learnBtn?.click()
      g.castSummonWaterElemental(archmage, archmage.mesh.position.x + 2, archmage.mesh.position.z + 2)

      // Select and read HUD
      g.selectionModel.clear()
      g.selectionModel.setSelection([archmage])
      g._lastCmdKey = ''
      g.updateHUD(0.016)
      const stats = document.getElementById('unit-stats')?.textContent ?? ''

      return {
        stats,
        cooldownUntil: archmage.waterElementalCooldownUntil,
        gameTime: g.gameTime,
      }
    })

    expect(result.stats).toContain('水元素冷却')
    expect(result.cooldownUntil).toBeGreaterThan(result.gameTime)
  })

  test('UX1-4: target mode hint visible during WE placement and disappears on cancel', async ({ page }) => {
    await waitForRuntime(page)

    const result = await page.evaluate(() => {
      const g = (window as any).__war3Game
      const archmage = g.spawnUnit('archmage', 0, 30, 30)
      archmage.heroLevel = 1
      archmage.heroSkillPoints = 1
      archmage.mana = archmage.maxMana

      g.selectionModel.clear()
      g.selectionModel.setSelection([archmage])
      g._lastCmdKey = ''
      g.updateHUD(0.016)

      // Learn
      const learnBtn = (window as any).__cmdButton('学习水元素 (Lv1)')
      learnBtn?.click()

      // Enter target mode
      g.selectionModel.clear()
      g.selectionModel.setSelection([archmage])
      g._lastCmdKey = ''
      g.updateHUD(0.016)
      const castBtn = (window as any).__cmdButton('召唤水元素 (Lv1)')
      castBtn?.click()
      const hintOn = document.getElementById('mode-hint')?.textContent ?? ''
      const hintVisible = document.getElementById('mode-hint')?.style.display !== 'none'

      // Cancel with right-click
      const canvas = document.getElementById('game-canvas')!
      canvas.dispatchEvent(new MouseEvent('contextmenu', { bubbles: true, cancelable: true, button: 2 }))
      const hintOff = document.getElementById('mode-hint')?.textContent ?? ''
      const hintHidden = document.getElementById('mode-hint')?.style.display === 'none'

      return { hintOn, hintVisible, hintOff, hintHidden }
    })

    expect(result.hintOn).toContain('召唤水元素')
    expect(result.hintVisible).toBe(true)
    expect(result.hintHidden).toBe(true)
  })

  test('UX1-5: selected Water Elemental shows remaining lifetime while alive', async ({ page }) => {
    await waitForRuntime(page)
    const levelData = WATER_ELEMENTAL_SUMMON_LEVELS[0]

    const result = await page.evaluate(({ duration }) => {
      const g = (window as any).__war3Game
      const archmage = g.spawnUnit('archmage', 0, 30, 30)
      archmage.abilityLevels = { ...(archmage.abilityLevels ?? {}), water_elemental: 1 }
      archmage.mana = archmage.maxMana

      g.castSummonWaterElemental(archmage, archmage.mesh.position.x + 2, archmage.mesh.position.z + 2)

      // Re-read fresh state after summon
      const we = g.units.find((u: any) => u.type === 'water_elemental')
      if (!we) return { ok: false, reason: 'no water elemental' }

      // Select the WE
      g.selectionModel.clear()
      g.selectionModel.setSelection([we])
      g._lastCmdKey = ''
      g.updateHUD(0.016)

      const stats = document.getElementById('unit-stats')?.textContent ?? ''
      const hpText = document.getElementById('unit-hp-text')?.textContent ?? ''
      const hpFill = document.getElementById('unit-hp-fill')?.style.width ?? ''
      const name = document.getElementById('unit-name')?.textContent ?? ''

      // Advance time to near expiration
      const expiresIn = we.summonExpireAt - g.gameTime
      for (let i = 0; i < Math.ceil((expiresIn - 5) * 2); i++) {
        g.update(0.5)
      }
      g.selectionModel.clear()
      g.selectionModel.setSelection([we])
      g._lastCmdKey = ''
      g.updateHUD(0.016)
      const statsLate = document.getElementById('unit-stats')?.textContent ?? ''

      return {
        ok: true,
        stats,
        hpText,
        hpFill,
        name,
        statsLate,
        expiresIn,
        summonExpireAt: we.summonExpireAt,
      }
    }, { duration: levelData.duration })

    expect(result.ok).toBe(true)
    expect(result.name).toBe('水元素')
    expect(result.stats).toContain('召唤物')
    // Stats include combat stats
    expect(result.stats).toContain('⚔')
    expect(result.stats).toContain('🛡')
    // Stats show remaining lifetime
    expect(result.stats).toContain('剩余')
    // HP shown
    expect(result.hpText).toContain(String(levelData.summonedHp))
    expect(result.hpFill).not.toBe('0%')
    // After advancing near expiration, still shows remaining time (decreased)
    expect(result.statsLate).toContain('剩余')
  })

  test('UX1-6: feedback does not change mana cost, cooldown, duration, stats, or dead-record behavior', async ({ page }) => {
    // Static check outside browser context
    expect((UNITS as any).water_elemental).toBeUndefined()

    await waitForRuntime(page)
    const levelData = WATER_ELEMENTAL_SUMMON_LEVELS[0]

    const result = await page.evaluate(() => {
      const g = (window as any).__war3Game
      g.deadUnitRecords = []
      const archmage = g.spawnUnit('archmage', 0, 30, 30)
      archmage.abilityLevels = { ...(archmage.abilityLevels ?? {}), water_elemental: 1 }
      archmage.mana = archmage.maxMana
      const beforeMana = archmage.mana

      // Cast
      const ok = g.castSummonWaterElemental(archmage, archmage.mesh.position.x + 2, archmage.mesh.position.z + 2)
      const manaSpent = beforeMana - archmage.mana
      const cooldownRemaining = archmage.waterElementalCooldownUntil - g.gameTime

      // Re-read fresh state after summon
      const summons = g.units.filter((u: any) => u.type === 'water_elemental')
      const we = summons[0]

      return {
        ok,
        manaSpent,
        cooldownRemaining,
        summonCount: summons.length,
        summonHp: we?.hp ?? 0,
        summonAttackDamage: we?.attackDamage ?? 0,
        summonExpireIn: we ? we.summonExpireAt - g.gameTime : 0,
        deadRecords: g.deadUnitRecords.filter((r: any) => r.type === 'water_elemental').length,
      }
    })

    expect(result.ok).toBe(true)
    expect(result.manaSpent).toBe(levelData.mana)
    expect(result.cooldownRemaining).toBeCloseTo(levelData.cooldown, 1)
    expect(result.summonCount).toBe(1)
    expect(result.summonHp).toBe(levelData.summonedHp)
    expect(result.summonAttackDamage).toBe(levelData.summonedAttackDamage)
    expect(result.summonExpireIn).toBeCloseTo(levelData.duration, 1)
    expect(result.deadRecords).toBe(0)
  })

  test('UX1-7: Water Elemental stays summon-only, not a trainable unit', async () => {
    expect((UNITS as any).water_elemental).toBeUndefined()
    expect(WATER_ELEMENTAL_SUMMON_LEVELS.length).toBeGreaterThan(0)
  })
})
