/**
 * V9 HERO19-IMPL1 Brilliance Aura minimal runtime proof.
 *
 * Scope:
 * - Archmage can learn Brilliance Aura Lv1/Lv2/Lv3 with hero-level gates.
 * - Brilliance Aura stays passive: no cast button, no mana cost, no cooldown.
 * - Learned Archmage grants data-driven mana regeneration to self and eligible nearby allies.
 * - Enemies, dead units, buildings, zero-mana units, and out-of-range units are excluded.
 * - Multiple sources do not stack; the highest learned bonus wins.
 */
import { test, expect, type Page } from '@playwright/test'
import { ABILITIES, HERO_ABILITY_LEVELS } from '../src/game/GameData'

const BASE_RUNTIME = 'http://127.0.0.1:4173/?runtimeTest=1'
const BA = HERO_ABILITY_LEVELS.brilliance_aura

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
    if (g?.ai) {
      if (typeof g.ai.reset === 'function') g.ai.reset()
      g.ai.update = () => {}
    }
  })
  await page.waitForTimeout(300)
}

test.describe('V9 HERO19-IMPL1 Brilliance Aura runtime', () => {
  test.setTimeout(180000)

  test('BA-RT-1: Archmage learns Lv1 from command card and activates passive self/ally mana aura', async ({ page }) => {
    await waitForRuntime(page)

    const result = await page.evaluate(() => {
      const g = (window as any).__war3Game
      const archmage = g.spawnUnit('archmage', 0, 30, 30)
      const priest = g.spawnUnit('priest', 0, 34, 30)
      const priestBaseRegen = priest.manaRegen
      archmage.heroLevel = 1
      archmage.heroSkillPoints = 1

      g.selectionModel.clear()
      g.selectionModel.setSelection([archmage])
      g._lastCmdKey = ''
      g.updateHUD(0.016)

      const learnBtn = (window as any).__cmdButton('学习辉煌光环 (Lv1)')
      const buttonCost = learnBtn?.querySelector('.btn-cost')?.textContent ?? ''
      learnBtn?.click()

      archmage.mana = 100
      const beforeMana = archmage.mana
      const baseRegen = archmage.manaRegen
      g.update(1.0)

      g._lastCmdKey = ''
      g.updateHUD(0.016)
      const labels = Array.from(document.querySelectorAll('#command-card button')).map((b: any) =>
        b.querySelector('.btn-label')?.textContent?.trim() ?? '',
      )

      return {
        hasLearnButton: !!learnBtn,
        learnEnabled: learnBtn?.disabled === false,
        buttonCost,
        learnedLevel: archmage.abilityLevels?.brilliance_aura ?? 0,
        heroSkillPoints: archmage.heroSkillPoints,
        selfBonus: archmage.brillianceAuraBonus,
        priestBonus: priest.brillianceAuraBonus,
        priestBaseRegen,
        priestRegenAfter: priest.manaRegen,
        beforeMana,
        afterMana: archmage.mana,
        baseRegen,
        hasCastButton: labels.some((label: string) => label.includes('辉煌光环') && !label.includes('学习')),
      }
    })

    const bonus = BA.levels[0].manaRegenBonus!
    expect(result.hasLearnButton).toBe(true)
    expect(result.learnEnabled).toBe(true)
    expect(result.buttonCost).toContain(`+${bonus}`)
    expect(result.learnedLevel).toBe(1)
    expect(result.heroSkillPoints).toBe(0)
    expect(result.selfBonus).toBeCloseTo(bonus, 5)
    expect(result.priestBonus).toBeCloseTo(bonus, 5)
    expect(result.priestRegenAfter).toBe(result.priestBaseRegen)
    expect(result.afterMana).toBeCloseTo(result.beforeMana + result.baseRegen + bonus, 5)
    expect(result.hasCastButton).toBe(false)
  })

  test('BA-RT-2: Lv2 and Lv3 respect hero-level gates 3 and 5', async ({ page }) => {
    await waitForRuntime(page)

    const result = await page.evaluate(() => {
      const g = (window as any).__war3Game
      const archmage = g.spawnUnit('archmage', 0, 30, 30)
      archmage.heroLevel = 1
      archmage.heroSkillPoints = 3

      const select = () => {
        g.selectionModel.clear()
        g.selectionModel.setSelection([archmage])
        g._lastCmdKey = ''
        g.updateHUD(0.016)
      }

      select()
      const learnLv1 = (window as any).__cmdButton('学习辉煌光环 (Lv1)')
      learnLv1?.click()
      select()

      archmage.heroLevel = 2
      select()
      const blockedLv2 = (window as any).__cmdButton('学习辉煌光环 (Lv2)')
      const blockedLv2Reason = blockedLv2?.dataset.disabledReason ?? ''

      archmage.heroLevel = 3
      select()
      const learnLv2 = (window as any).__cmdButton('学习辉煌光环 (Lv2)')
      learnLv2?.click()
      select()

      archmage.heroLevel = 4
      select()
      const blockedLv3 = (window as any).__cmdButton('学习辉煌光环 (Lv3)')
      const blockedLv3Reason = blockedLv3?.dataset.disabledReason ?? ''

      archmage.heroLevel = 5
      select()
      const learnLv3 = (window as any).__cmdButton('学习辉煌光环 (Lv3)')
      learnLv3?.click()
      select()

      const labels = Array.from(document.querySelectorAll('#command-card button')).map((b: any) =>
        b.querySelector('.btn-label')?.textContent?.trim() ?? '',
      )

      return {
        lv1Enabled: learnLv1?.disabled === false,
        blockedLv2Disabled: blockedLv2?.disabled ?? null,
        blockedLv2Reason,
        lv2Enabled: learnLv2?.disabled === false,
        blockedLv3Disabled: blockedLv3?.disabled ?? null,
        blockedLv3Reason,
        lv3Enabled: learnLv3?.disabled === false,
        learnedLevel: archmage.abilityLevels?.brilliance_aura ?? 0,
        heroSkillPoints: archmage.heroSkillPoints,
        hasLv4Learn: labels.includes('学习辉煌光环 (Lv4)'),
      }
    })

    expect(result.lv1Enabled).toBe(true)
    expect(result.blockedLv2Disabled).toBe(true)
    expect(result.blockedLv2Reason).toContain('英雄等级 3')
    expect(result.lv2Enabled).toBe(true)
    expect(result.blockedLv3Disabled).toBe(true)
    expect(result.blockedLv3Reason).toContain('英雄等级 5')
    expect(result.lv3Enabled).toBe(true)
    expect(result.learnedLevel).toBe(3)
    expect(result.heroSkillPoints).toBe(0)
    expect(result.hasLv4Learn).toBe(false)
  })

  test('BA-RT-3: aura filtering includes self and friendly mana units, excludes invalid targets', async ({ page }) => {
    await waitForRuntime(page)

    const result = await page.evaluate(() => {
      const g = (window as any).__war3Game
      const archmage = g.spawnUnit('archmage', 0, 30, 30)
      archmage.abilityLevels = { ...(archmage.abilityLevels ?? {}), brilliance_aura: 2 }

      const friendlyPriest = g.spawnUnit('priest', 0, 34, 30)
      const enemyPriest = g.spawnUnit('priest', 1, 34, 30)
      const footman = g.spawnUnit('footman', 0, 35, 30)
      const farm = g.spawnBuilding('farm', 0, 32, 30)
      const outOfRangePriest = g.spawnUnit('priest', 0, 50, 30)
      const deadPriest = g.spawnUnit('priest', 0, 33, 30)
      deadPriest.hp = 0
      deadPriest.isDead = true

      g.update(0.1)

      return {
        archmageBonus: archmage.brillianceAuraBonus,
        friendlyPriestBonus: friendlyPriest.brillianceAuraBonus,
        enemyPriestBonus: enemyPriest.brillianceAuraBonus,
        footmanBonus: footman.brillianceAuraBonus,
        footmanMaxMana: footman.maxMana,
        farmBonus: farm.brillianceAuraBonus,
        farmIsBuilding: farm.isBuilding,
        outOfRangePriestBonus: outOfRangePriest.brillianceAuraBonus,
        deadPriestBonus: deadPriest.brillianceAuraBonus,
      }
    })

    const bonus = BA.levels[1].manaRegenBonus!
    expect(result.archmageBonus).toBeCloseTo(bonus, 5)
    expect(result.friendlyPriestBonus).toBeCloseTo(bonus, 5)
    expect(result.enemyPriestBonus).toBe(0)
    expect(result.footmanMaxMana).toBe(0)
    expect(result.footmanBonus).toBe(0)
    expect(result.farmIsBuilding).toBe(true)
    expect(result.farmBonus).toBe(0)
    expect(result.outOfRangePriestBonus).toBe(0)
    expect(result.deadPriestBonus).toBe(0)
  })

  test('BA-RT-4: multiple Brilliance Aura sources use the highest bonus without stacking', async ({ page }) => {
    await waitForRuntime(page)

    const result = await page.evaluate(() => {
      const g = (window as any).__war3Game
      const lowArchmage = g.spawnUnit('archmage', 0, 30, 30)
      lowArchmage.abilityLevels = { ...(lowArchmage.abilityLevels ?? {}), brilliance_aura: 1 }
      const highArchmage = g.spawnUnit('archmage', 0, 34, 30)
      highArchmage.abilityLevels = { ...(highArchmage.abilityLevels ?? {}), brilliance_aura: 3 }
      const priest = g.spawnUnit('priest', 0, 32, 30)
      const baseRegen = priest.manaRegen

      g.update(0.1)

      return {
        priestBonus: priest.brillianceAuraBonus,
        priestManaRegenAfter: priest.manaRegen,
        baseRegen,
        lowArchmageBonus: lowArchmage.brillianceAuraBonus,
        highArchmageBonus: highArchmage.brillianceAuraBonus,
      }
    })

    const lv1 = BA.levels[0].manaRegenBonus!
    const lv3 = BA.levels[2].manaRegenBonus!
    expect(result.priestBonus).toBeCloseTo(lv3, 5)
    expect(result.priestBonus).not.toBeCloseTo(lv1 + lv3, 5)
    expect(result.priestManaRegenAfter).toBe(result.baseRegen)
    expect(result.lowArchmageBonus).toBeCloseTo(lv3, 5)
    expect(result.highArchmageBonus).toBeCloseTo(lv3, 5)
  })

  test('BA-RT-5: range/death removes bonus and mana regeneration caps at maxMana', async ({ page }) => {
    await waitForRuntime(page)

    const result = await page.evaluate(() => {
      const g = (window as any).__war3Game
      const archmage = g.spawnUnit('archmage', 0, 30, 30)
      archmage.abilityLevels = { ...(archmage.abilityLevels ?? {}), brilliance_aura: 3 }
      const priest = g.spawnUnit('priest', 0, 34, 30)
      priest.mana = priest.maxMana - 0.25

      g.update(1.0)
      const manaAfterCapTick = priest.mana
      const inRangeBonus = priest.brillianceAuraBonus

      priest.mesh.position.set(50, priest.mesh.position.y, 30)
      g.update(0.1)
      const outOfRangeBonus = priest.brillianceAuraBonus

      priest.mesh.position.set(34, priest.mesh.position.y, 30)
      archmage.hp = 0
      g.handleDeadUnits()
      g.update(0.1)

      return {
        maxMana: priest.maxMana,
        manaAfterCapTick,
        inRangeBonus,
        outOfRangeBonus,
        archmageDead: archmage.isDead === true,
        afterDeathBonus: priest.brillianceAuraBonus,
      }
    })

    const bonus = BA.levels[2].manaRegenBonus!
    expect(result.manaAfterCapTick).toBe(result.maxMana)
    expect(result.inRangeBonus).toBeCloseTo(bonus, 5)
    expect(result.outOfRangeBonus).toBe(0)
    expect(result.archmageDead).toBe(true)
    expect(result.afterDeathBonus).toBe(0)
  })

  test('BA-RT-6: Brilliance Aura remains outside generic active ABILITIES table', async () => {
    expect((ABILITIES as any).brilliance_aura).toBeUndefined()
  })
})
