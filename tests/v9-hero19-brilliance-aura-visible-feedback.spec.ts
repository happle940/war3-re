/**
 * V9 HERO19-UX1 Brilliance Aura visible feedback minimal slice proof.
 *
 * Scope:
 * - Selected Archmage with learned Brilliance Aura shows `辉煌光环 LvN`.
 * - Affected friendly mana unit shows `辉煌光环 +X.XX 法力回复`.
 * - Units outside radius, enemy, building, dead, or zero-mana show no false BA bonus.
 * - Command card learn button shows Lv1/Lv2/Lv3 with disabled reasons.
 * - Brilliance Aura has no cast button, no target mode, no mana cost, no cooldown.
 * - Water Elemental, Devotion Aura, and Archmage training surfaces remain intact.
 * - Current SimpleAI Archmage strategy does not expose Brilliance Aura as an active cast surface.
 */
import { test, expect, type Page } from '@playwright/test'
import {
  ABILITIES,
  HERO_ABILITY_LEVELS,
  UNITS,
} from '../src/game/GameData'

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

test.describe('V9 HERO19-UX1 Brilliance Aura visible feedback', () => {
  test.setTimeout(180000)

  test('BA-UX1: selected Archmage shows learned Brilliance Aura level in HUD stats', async ({ page }) => {
    await waitForRuntime(page)

    const result = await page.evaluate(() => {
      const g = (window as any).__war3Game
      const archmage = g.spawnUnit('archmage', 0, 30, 30)
      archmage.heroLevel = 1
      archmage.heroSkillPoints = 1

      // Select before learning
      g.selectionModel.clear()
      g.selectionModel.setSelection([archmage])
      g._lastCmdKey = ''
      g.updateHUD(0.016)
      const statsBefore = document.getElementById('unit-stats')?.textContent ?? ''

      // Learn Brilliance Aura Lv1
      const learnBtn = (window as any).__cmdButton('学习辉煌光环 (Lv1)')
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
        learnedLevel: archmage.abilityLevels?.brilliance_aura ?? 0,
      }
    })

    expect(result.hasLearnBtn).toBe(true)
    expect(result.learnedLevel).toBe(1)
    expect(result.statsBefore).not.toContain('辉煌光环')
    expect(result.statsAfter).toContain('辉煌光环 Lv1')
  })

  test('BA-UX2: affected friendly mana unit shows BA bonus; invalid units show none', async ({ page }) => {
    await waitForRuntime(page)

    const result = await page.evaluate(() => {
      const g = (window as any).__war3Game
      const archmage = g.spawnUnit('archmage', 0, 30, 30)
      archmage.abilityLevels = { ...(archmage.abilityLevels ?? {}), brilliance_aura: 1 }

      // Friendly priest in range
      const priest = g.spawnUnit('priest', 0, 34, 30)
      // Enemy priest in range
      const enemyPriest = g.spawnUnit('priest', 1, 34.5, 30)
      // Friendly footman (zero mana) in range
      const footman = g.spawnUnit('footman', 0, 35, 30)
      // Friendly building in range
      const tower = g.spawnBuilding('tower', 0, 32, 30)
      // Friendly priest out of range
      const farPriest = g.spawnUnit('priest', 0, 50, 50)
      // Dead friendly priest in range
      const deadPriest = g.spawnUnit('priest', 0, 33, 30)
      deadPriest.hp = 0
      deadPriest.isDead = true

      g.update(0.1)

      // Check priest HUD
      g.selectionModel.clear()
      g.selectionModel.setSelection([priest])
      g._lastCmdKey = ''
      g.updateHUD(0.016)
      const priestStats = document.getElementById('unit-stats')?.textContent ?? ''

      // Check enemy priest HUD
      g.selectionModel.clear()
      g.selectionModel.setSelection([enemyPriest])
      g._lastCmdKey = ''
      g.updateHUD(0.016)
      const enemyPriestStats = document.getElementById('unit-stats')?.textContent ?? ''

      // Check footman HUD
      g.selectionModel.clear()
      g.selectionModel.setSelection([footman])
      g._lastCmdKey = ''
      g.updateHUD(0.016)
      const footmanStats = document.getElementById('unit-stats')?.textContent ?? ''

      // Check far priest HUD
      g.selectionModel.clear()
      g.selectionModel.setSelection([farPriest])
      g._lastCmdKey = ''
      g.updateHUD(0.016)
      const farPriestStats = document.getElementById('unit-stats')?.textContent ?? ''

      // Check building HUD
      g.selectionModel.clear()
      g.selectionModel.setSelection([tower])
      g._lastCmdKey = ''
      g.updateHUD(0.016)
      const towerStats = document.getElementById('unit-stats')?.textContent ?? ''

      // Check dead priest HUD
      g.selectionModel.clear()
      g.selectionModel.setSelection([deadPriest])
      g._lastCmdKey = ''
      g.updateHUD(0.016)
      const deadPriestStats = document.getElementById('unit-stats')?.textContent ?? ''

      // Check archmage HUD
      g.selectionModel.clear()
      g.selectionModel.setSelection([archmage])
      g._lastCmdKey = ''
      g.updateHUD(0.016)
      const archmageStats = document.getElementById('unit-stats')?.textContent ?? ''

      return {
        priestBonus: priest.brillianceAuraBonus,
        priestStats,
        enemyPriestBonus: enemyPriest.brillianceAuraBonus,
        enemyPriestStats,
        footmanBonus: footman.brillianceAuraBonus,
        footmanStats,
        farPriestBonus: farPriest.brillianceAuraBonus,
        farPriestStats,
        towerBonus: tower.brillianceAuraBonus,
        towerStats,
        deadPriestBonus: deadPriest.brillianceAuraBonus,
        deadPriestStats,
        archmageStats,
        archmageBonus: archmage.brillianceAuraBonus,
      }
    })

    const bonus = BA.levels[0].manaRegenBonus!
    // Priest in range shows BA bonus in HUD and data
    expect(result.priestBonus).toBeCloseTo(bonus, 5)
    expect(result.priestStats).toContain('辉煌光环 +')
    expect(result.priestStats).toContain('法力回复')
    // Archmage shows both level and bonus
    expect(result.archmageStats).toContain('辉煌光环 Lv1')
    expect(result.archmageStats).toContain('法力回复')
    // Enemy priest: no bonus
    expect(result.enemyPriestBonus).toBe(0)
    expect(result.enemyPriestStats).not.toContain('辉煌光环')
    // Footman: no bonus
    expect(result.footmanBonus).toBe(0)
    expect(result.footmanStats).not.toContain('辉煌光环')
    // Far priest: no bonus
    expect(result.farPriestBonus).toBe(0)
    expect(result.farPriestStats).not.toContain('辉煌光环')
    // Building and dead unit: no false bonus
    expect(result.towerBonus).toBe(0)
    expect(result.towerStats).not.toContain('辉煌光环')
    expect(result.deadPriestBonus).toBe(0)
    expect(result.deadPriestStats).not.toContain('辉煌光环')
  })

  test('BA-UX3: command card learn button shows Lv1/Lv2/Lv3 with disabled reasons', async ({ page }) => {
    await waitForRuntime(page)

    const result = await page.evaluate(() => {
      const g = (window as any).__war3Game
      const archmage = g.spawnUnit('archmage', 0, 30, 30)
      archmage.heroLevel = 1
      archmage.heroSkillPoints = 1

      const select = () => {
        g.selectionModel.clear()
        g.selectionModel.setSelection([archmage])
        g._lastCmdKey = ''
        g.updateHUD(0.016)
      }

      // --- Learn Lv1 ---
      select()
      const learn1 = (window as any).__cmdButton('学习辉煌光环 (Lv1)')
      const learn1Cost = learn1?.querySelector('.btn-cost')?.textContent ?? ''
      learn1?.click()
      select()

      // --- No skill points: Lv2 blocked ---
      const noSpBtn = (window as any).__cmdButton('学习辉煌光环 (Lv2)')
      const noSpReason = noSpBtn?.dataset.disabledReason ?? ''

      // Give skill points but hero level too low
      archmage.heroLevel = 2
      archmage.heroSkillPoints = 1
      select()
      const lvlGateBtn = (window as any).__cmdButton('学习辉煌光环 (Lv2)')
      const lvlGateReason = lvlGateBtn?.dataset.disabledReason ?? ''

      // Dead hero cannot learn while a next level exists
      archmage.heroLevel = 3
      archmage.heroSkillPoints = 1
      archmage.isDead = true
      select()
      const deadBtn = (window as any).__cmdButton('学习辉煌光环 (Lv2)')
      const deadReason = deadBtn?.dataset.disabledReason ?? ''
      const deadDisabled = deadBtn?.disabled ?? false

      // Meet hero level 3 and learn Lv2
      archmage.isDead = false
      archmage.heroLevel = 3
      archmage.heroSkillPoints = 1
      select()
      const learn2 = (window as any).__cmdButton('学习辉煌光环 (Lv2)')
      learn2?.click()
      select()

      // Learn Lv3 blocked at hero level 4
      archmage.heroSkillPoints = 1
      archmage.heroLevel = 4
      select()
      const blocked3 = (window as any).__cmdButton('学习辉煌光环 (Lv3)')
      const blocked3Reason = blocked3?.dataset.disabledReason ?? ''

      // Learn Lv3 at hero level 5
      archmage.heroLevel = 5
      select()
      const learn3 = (window as any).__cmdButton('学习辉煌光环 (Lv3)')
      learn3?.click()
      select()

      // No Lv4 button
      const labels = Array.from(document.querySelectorAll('#command-card button')).map((b: any) =>
        b.querySelector('.btn-label')?.textContent?.trim() ?? '',
      )
      const hasLv4 = labels.includes('学习辉煌光环 (Lv4)')

      return {
        hasLearn1: !!learn1,
        learn1Enabled: learn1?.disabled === false,
        learn1Cost,
        noSpReason,
        lvlGateReason,
        deadReason,
        deadDisabled,
        hasLearn2: !!learn2,
        blocked3Reason,
        hasLearn3: !!learn3,
        hasLv4,
        learnedLevel: archmage.abilityLevels?.brilliance_aura ?? 0,
      }
    })

    expect(result.hasLearn1).toBe(true)
    expect(result.learn1Enabled).toBe(true)
    expect(result.learn1Cost).toContain('被动')
    expect(result.noSpReason).toContain('无技能点')
    expect(result.lvlGateReason).toContain('英雄等级 3')
    expect(result.deadReason).toContain('已死亡')
    expect(result.deadDisabled).toBe(true)
    expect(result.hasLearn2).toBe(true)
    expect(result.blocked3Reason).toContain('英雄等级 5')
    expect(result.hasLearn3).toBe(true)
    expect(result.hasLv4).toBe(false)
    expect(result.learnedLevel).toBe(3)
  })

  test('BA-UX3b: dead hero learn button shows death disabled reason', async ({ page }) => {
    await waitForRuntime(page)

    const result = await page.evaluate(() => {
      const g = (window as any).__war3Game
      const archmage = g.spawnUnit('archmage', 0, 30, 30)
      archmage.heroLevel = 1
      archmage.heroSkillPoints = 1

      // Kill hero before learning
      archmage.isDead = true

      g.selectionModel.clear()
      g.selectionModel.setSelection([archmage])
      g._lastCmdKey = ''
      g.updateHUD(0.016)

      const deadBtn = (window as any).__cmdButton('学习辉煌光环 (Lv1)')
      return {
        hasBtn: !!deadBtn,
        disabled: deadBtn?.disabled ?? false,
        reason: deadBtn?.dataset.disabledReason ?? '',
      }
    })

    expect(result.hasBtn).toBe(true)
    expect(result.disabled).toBe(true)
    expect(result.reason).toContain('已死亡')
  })

  test('BA-UX4: Brilliance Aura has no cast button, no target mode, no mana cost, no cooldown', async ({ page }) => {
    await waitForRuntime(page)

    const result = await page.evaluate(() => {
      const g = (window as any).__war3Game
      const archmage = g.spawnUnit('archmage', 0, 30, 30)
      archmage.heroLevel = 1
      archmage.heroSkillPoints = 1

      g.selectionModel.clear()
      g.selectionModel.setSelection([archmage])
      g._lastCmdKey = ''
      g.updateHUD(0.016)
      const learnBtn = (window as any).__cmdButton('学习辉煌光环 (Lv1)')
      learnBtn?.click()

      // After learning, check for cast button
      g.selectionModel.clear()
      g.selectionModel.setSelection([archmage])
      g._lastCmdKey = ''
      g.updateHUD(0.016)

      const labels = Array.from(document.querySelectorAll('#command-card button')).map((b: any) =>
        b.querySelector('.btn-label')?.textContent?.trim() ?? '',
      )
      const hasCastButton = labels.some(l => l.includes('辉煌光环') && !l.includes('学习'))

      return {
        hasCastButton,
        hasTargetMode: !!g.weTargetMode || !!g.baTargetMode,
      }
    })

    // Static check: no ABILITIES.brilliance_aura
    expect((ABILITIES as any).brilliance_aura).toBeUndefined()

    // BA levels have mana=0, cooldown=0
    for (const lv of BA.levels) {
      expect(lv.mana).toBe(0)
      expect(lv.cooldown).toBe(0)
    }

    expect(result.hasCastButton).toBe(false)
    expect(result.hasTargetMode).toBe(false)
  })

  test('BA-UX5: Water Elemental, Devotion Aura, and Archmage training surfaces remain intact', async ({ page }) => {
    await waitForRuntime(page)

    const result = await page.evaluate(() => {
      const g = (window as any).__war3Game

      // Paladin with Devotion Aura
      const paladin = g.spawnUnit('paladin', 0, 20, 20)
      paladin.abilityLevels = { ...(paladin.abilityLevels ?? {}), devotion_aura: 1, holy_light: 1 }
      paladin.mana = paladin.maxMana

      // Check Devotion Aura HUD
      g.selectionModel.clear()
      g.selectionModel.setSelection([paladin])
      g._lastCmdKey = ''
      g.updateHUD(0.016)
      const paladinStats = document.getElementById('unit-stats')?.textContent ?? ''

      // Archmage with both WE and BA
      const archmage = g.spawnUnit('archmage', 0, 20, 21)
      archmage.abilityLevels = {
        ...(archmage.abilityLevels ?? {}),
        water_elemental: 1,
        brilliance_aura: 1,
      }
      archmage.mana = archmage.maxMana

      g.update(0.1)

      g.selectionModel.clear()
      g.selectionModel.setSelection([archmage])
      g._lastCmdKey = ''
      g.updateHUD(0.016)
      const archmageStats = document.getElementById('unit-stats')?.textContent ?? ''

      const labels = Array.from(document.querySelectorAll('#command-card button')).map((b: any) =>
        b.querySelector('.btn-label')?.textContent?.trim() ?? '',
      )

      // Cast Water Elemental
      const weOk = g.castSummonWaterElemental(archmage, 20, 22)
      const we = g.units.find((u: any) => u.type === 'water_elemental')

      // Holy Light
      const injuredFootman = g.spawnUnit('footman', 0, 20.5, 20.5)
      injuredFootman.hp = 10
      const hlOk = g.castHolyLight(paladin, injuredFootman)

      return {
        paladinStats,
        hasDALevel: paladinStats.includes('虔诚光环 Lv'),
        archmageStats,
        hasWELevel: archmageStats.includes('水元素 Lv'),
        hasBALevel: archmageStats.includes('辉煌光环 Lv'),
        hasWECastBtn: labels.some(l => l.includes('召唤水元素')),
        weOk,
        hasWE: !!we,
        hlOk,
        footmanHealed: injuredFootman.hp > 10,
      }
    })

    expect(result.hasDALevel).toBe(true)
    expect(result.hasWELevel).toBe(true)
    expect(result.hasBALevel).toBe(true)
    expect(result.hasWECastBtn).toBe(true)
    expect(result.weOk).toBe(true)
    expect(result.hasWE).toBe(true)
    expect(result.hlOk).toBe(true)
    expect(result.footmanHealed).toBe(true)
  })

  test('BA-UX6: SimpleAI keeps Brilliance Aura passive even with Archmage strategy present', async ({ page }) => {
    expect((UNITS as any).brilliance_aura).toBeUndefined()
    expect((ABILITIES as any).brilliance_aura).toBeUndefined()

    await waitForRuntime(page)
    const result = await page.evaluate(() => {
      const g = (window as any).__war3Game
      const aiSurface = [
        ...Object.keys(g.ai ?? {}),
        ...Object.getOwnPropertyNames(Object.getPrototypeOf(g.ai ?? {})),
      ].join(' ').toLowerCase()
      return {
        aiHasArchmageStrategy: aiSurface.includes('archmage'),
        aiHasBrillianceActiveSurface: aiSurface.includes('castbrilliance')
          || aiSurface.includes('cast_brilliance')
          || aiSurface.includes('brilliancecast'),
      }
    })

    expect(result.aiHasArchmageStrategy).toBe(true)
    expect(result.aiHasBrillianceActiveSurface).toBe(false)
  })

  test('BA-UX7: feedback does not change mana regen values, radius, or stacking mechanics', async ({ page }) => {
    await waitForRuntime(page)

    const result = await page.evaluate(() => {
      const g = (window as any).__war3Game
      const archmageA = g.spawnUnit('archmage', 0, 30, 30)
      archmageA.abilityLevels = { ...(archmageA.abilityLevels ?? {}), brilliance_aura: 1 }
      const archmageB = g.spawnUnit('archmage', 0, 30, 31)
      archmageB.abilityLevels = { ...(archmageB.abilityLevels ?? {}), brilliance_aura: 3 }
      const priest = g.spawnUnit('priest', 0, 30, 30.5)
      priest.mana = 0
      const baseRegen = priest.manaRegen

      g.update(0.1)

      return {
        priestBonus: priest.brillianceAuraBonus,
        priestManaRegen: priest.manaRegen,
        baseRegen,
        archmageABonus: archmageA.brillianceAuraBonus,
        archmageBBonus: archmageB.brillianceAuraBonus,
      }
    })

    const lv1 = BA.levels[0].manaRegenBonus!
    const lv3 = BA.levels[2].manaRegenBonus!
    // Highest wins, no stacking
    expect(result.priestBonus).toBeCloseTo(lv3, 5)
    expect(result.priestBonus).not.toBeCloseTo(lv1 + lv3, 5)
    // Base mana regen not mutated
    expect(result.priestManaRegen).toBe(result.baseRegen)
  })
})
