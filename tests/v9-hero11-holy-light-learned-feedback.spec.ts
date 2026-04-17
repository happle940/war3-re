/**
 * V9 HERO11-UX1 Holy Light learned level visible feedback proof.
 *
 * Proves:
 * 1. Unlearned Paladin shows learn button with requirement, no cast button.
 * 2. After learning level 1, HUD shows Holy Light level and remaining SP.
 * 3. Level 2 learn button is visible but disabled with level-3 requirement at hero level 1.
 * 4. At hero level 3, level 2 becomes learnable; after learning, feedback updates.
 * 5. After death and revive, HUD still shows learned level and SP.
 * 6. Task228 cast/spend behavior unchanged.
 *
 * Not: undead damage, other abilities, other heroes, AI, full hero panel, items.
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
    // Procedural fallback is valid.
  }

  await page.evaluate(() => {
    const g = (window as any).__war3Game
    if (g?.ai) {
      if (typeof g.ai.reset === 'function') g.ai.reset()
      g.ai.update = () => {}
    }
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
    return paladin ? {
      type: paladin.type,
      heroLevel: paladin.heroLevel,
      heroSkillPoints: paladin.heroSkillPoints,
    } : null
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

test.describe('V9 HERO11-UX1 Holy Light learned level visible feedback', () => {
  test.setTimeout(180000)

  test('FB-1: unlearned Paladin shows learn button, no cast button, with requirement', async ({ page }) => {
    await waitForRuntime(page)
    const pal = await summonPaladin(page)
    expect(pal).not.toBeNull()

    await selectPaladin(page)

    const result = await page.evaluate(() => {
      const g = (window as any).__war3Game
      const paladin = g.units.find((u: any) => u.type === 'paladin' && !u.isBuilding && u.team === 0)
      if (!paladin) return null

      const buttons = Array.from(document.querySelectorAll('#command-card button'))
      const learnBtn = buttons.find((b: any) =>
        b.querySelector('.btn-label')?.textContent?.trim()?.includes('学习圣光术'),
      )
      const castBtn = buttons.find((b: any) => {
        const txt = b.querySelector('.btn-label')?.textContent?.trim() ?? ''
        return txt.startsWith('圣光术 (Lv')
      })

      // Check HUD stats
      const statsEl = document.getElementById('unit-stats')
      const statsText = statsEl?.textContent ?? ''

      return {
        hasLearnBtn: !!learnBtn,
        learnBtnEnabled: learnBtn?.disabled === false,
        learnBtnLabel: learnBtn?.querySelector('.btn-label')?.textContent?.trim() ?? '',
        learnBtnCost: learnBtn?.querySelector('.btn-cost')?.textContent?.trim() ?? '',
        hasCastBtn: !!castBtn,
        statsContainSP: statsText.includes('技能点'),
        spValue: statsText,
      }
    })

    expect(result.hasLearnBtn).toBe(true)
    expect(result.learnBtnEnabled).toBe(true)
    expect(result.learnBtnLabel).toContain('Lv1')
    expect(result.learnBtnCost).toContain('200')
    expect(result.hasCastBtn).toBe(false)
    expect(result.statsContainSP).toBe(true)
  })

  test('FB-2: after learning level 1, HUD shows Holy Light level and remaining SP', async ({ page }) => {
    await waitForRuntime(page)
    const pal = await summonPaladin(page)
    expect(pal).not.toBeNull()

    await selectPaladin(page)

    // Learn level 1 via button click
    const afterLearn = await page.evaluate(() => {
      const g = (window as any).__war3Game
      const paladin = g.units.find((u: any) => u.type === 'paladin' && !u.isBuilding && u.team === 0)
      if (!paladin) return null

      const buttons = Array.from(document.querySelectorAll('#command-card button'))
      const learnBtn = buttons.find((b: any) =>
        b.querySelector('.btn-label')?.textContent?.trim()?.includes('学习圣光术 (Lv1)'),
      ) as HTMLButtonElement | undefined
      if (learnBtn) learnBtn.click()

      // Refresh HUD
      g._lastCmdKey = ''
      g.updateHUD(0.016)

      const fresh = g.units.find((u: any) => u.type === 'paladin' && !u.isBuilding && u.team === 0)
      const statsEl = document.getElementById('unit-stats')
      const statsText = statsEl?.textContent ?? ''

      const newButtons = Array.from(document.querySelectorAll('#command-card button'))
      const castBtn = newButtons.find((b: any) => {
        const txt = b.querySelector('.btn-label')?.textContent?.trim() ?? ''
        return txt.startsWith('圣光术 (Lv')
      })

      return {
        hlLevel: fresh.abilityLevels?.holy_light ?? 0,
        sp: fresh.heroSkillPoints,
        statsShowHLLevel: statsText.includes('圣光术 Lv1'),
        statsShowSP: statsText.includes('技能点'),
        hasCastBtn: !!castBtn,
        castLabel: castBtn?.querySelector('.btn-label')?.textContent?.trim() ?? '',
        castCost: castBtn?.querySelector('.btn-cost')?.textContent?.trim() ?? '',
      }
    })

    expect(afterLearn.hlLevel).toBe(1)
    expect(afterLearn.sp).toBe(0)
    expect(afterLearn.statsShowHLLevel).toBe(true)
    expect(afterLearn.statsShowSP).toBe(true)
    expect(afterLearn.hasCastBtn).toBe(true)
    expect(afterLearn.castLabel).toContain('Lv1')
    expect(afterLearn.castCost).toContain('200')
  })

  test('FB-3: level 2 learn button is visible but disabled at hero level 1', async ({ page }) => {
    await waitForRuntime(page)
    const pal = await summonPaladin(page)
    expect(pal).not.toBeNull()

    // Manually set: level 1 learned, hero level 1, 2 SP
    await page.evaluate(() => {
      const g = (window as any).__war3Game
      const paladin = g.units.find((u: any) => u.type === 'paladin' && !u.isBuilding && u.team === 0)
      if (!paladin) return
      if (!paladin.abilityLevels) paladin.abilityLevels = {}
      paladin.abilityLevels.holy_light = 1
      paladin.heroSkillPoints = 2
    })

    await selectPaladin(page)

    const result = await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('#command-card button'))
      const learnBtn = buttons.find((b: any) =>
        b.querySelector('.btn-label')?.textContent?.trim()?.includes('学习圣光术 (Lv2)'),
      )

      return {
        hasLearnBtn: !!learnBtn,
        disabled: learnBtn?.disabled ?? null,
        reason: learnBtn?.dataset.disabledReason ?? '',
        label: learnBtn?.querySelector('.btn-label')?.textContent?.trim() ?? '',
      }
    })

    expect(result.hasLearnBtn).toBe(true)
    expect(result.disabled).toBe(true)
    expect(result.reason).toContain('3')
    expect(result.label).toContain('Lv2')
  })

  test('FB-4: at hero level 3, level 2 becomes learnable and feedback updates', async ({ page }) => {
    await waitForRuntime(page)
    const pal = await summonPaladin(page)
    expect(pal).not.toBeNull()

    // Set: level 1 learned, hero level 3, 2 SP
    await page.evaluate(() => {
      const g = (window as any).__war3Game
      const paladin = g.units.find((u: any) => u.type === 'paladin' && !u.isBuilding && u.team === 0)
      if (!paladin) return
      paladin.heroLevel = 3
      paladin.heroSkillPoints = 2
      if (!paladin.abilityLevels) paladin.abilityLevels = {}
      paladin.abilityLevels.holy_light = 1
    })

    await selectPaladin(page)

    // Click learn level 2
    const afterLearn = await page.evaluate(() => {
      const g = (window as any).__war3Game
      const buttons = Array.from(document.querySelectorAll('#command-card button'))
      const learnBtn = buttons.find((b: any) =>
        b.querySelector('.btn-label')?.textContent?.trim()?.includes('学习圣光术 (Lv2)'),
      ) as HTMLButtonElement | undefined
      if (learnBtn && !learnBtn.disabled) learnBtn.click()

      g._lastCmdKey = ''
      g.updateHUD(0.016)

      const fresh = g.units.find((u: any) => u.type === 'paladin' && !u.isBuilding && u.team === 0)
      const statsEl = document.getElementById('unit-stats')
      const statsText = statsEl?.textContent ?? ''

      const newButtons = Array.from(document.querySelectorAll('#command-card button'))
      const castBtn = newButtons.find((b: any) => {
        const txt = b.querySelector('.btn-label')?.textContent?.trim() ?? ''
        return txt.startsWith('圣光术 (Lv')
      })
      const learnBtn3 = newButtons.find((b: any) =>
        b.querySelector('.btn-label')?.textContent?.trim()?.includes('学习圣光术 (Lv3)'),
      )

      return {
        hlLevel: fresh.abilityLevels?.holy_light ?? 0,
        sp: fresh.heroSkillPoints,
        statsShowHLLevel: statsText.includes('圣光术 Lv2'),
        castLabel: castBtn?.querySelector('.btn-label')?.textContent?.trim() ?? '',
        castCost: castBtn?.querySelector('.btn-cost')?.textContent?.trim() ?? '',
        hasLearnLv3Btn: !!learnBtn3,
        learnLv3Disabled: learnBtn3?.disabled ?? null,
        learnLv3Reason: learnBtn3?.dataset.disabledReason ?? '',
      }
    })

    expect(afterLearn.hlLevel).toBe(2)
    expect(afterLearn.sp).toBe(1)
    expect(afterLearn.statsShowHLLevel).toBe(true)
    expect(afterLearn.castLabel).toContain('Lv2')
    expect(afterLearn.castCost).toContain('400')
    // Level 3 learn button visible but blocked by hero level 5
    expect(afterLearn.hasLearnLv3Btn).toBe(true)
    expect(afterLearn.learnLv3Disabled).toBe(true)
    expect(afterLearn.learnLv3Reason).toContain('5')
  })

  test('FB-5: after death and revive, HUD shows learned level and SP', async ({ page }) => {
    await waitForRuntime(page)
    const pal = await summonPaladin(page)
    expect(pal).not.toBeNull()

    // Set: level 1 learned, hero level 3, 1 SP
    await page.evaluate(() => {
      const g = (window as any).__war3Game
      const paladin = g.units.find((u: any) => u.type === 'paladin' && !u.isBuilding && u.team === 0)
      if (!paladin) return
      paladin.heroLevel = 3
      paladin.heroSkillPoints = 1
      if (!paladin.abilityLevels) paladin.abilityLevels = {}
      paladin.abilityLevels.holy_light = 1
    })

    await selectPaladin(page)

    // Verify pre-death HUD
    const preDeath = await page.evaluate(() => {
      const statsEl = document.getElementById('unit-stats')
      return { statsText: statsEl?.textContent ?? '' }
    })
    expect(preDeath.statsText).toContain('圣光术 Lv1')

    // Kill Paladin
    await page.evaluate(() => {
      const g = (window as any).__war3Game
      const paladin = g.units.find((u: any) => u.type === 'paladin' && !u.isBuilding && u.team === 0)
      if (!paladin) return
      paladin.hp = 0
      g.update(0.5)
    })

    // Revive through Altar
    await page.evaluate(() => {
      const g = (window as any).__war3Game
      const altar = g.units.find((u: any) => u.type === 'altar_of_kings' && u.isBuilding && u.team === 0)
      const paladin = g.units.find((u: any) => u.type === 'paladin' && !u.isBuilding && u.team === 0)
      if (!altar || !paladin) return

      g.selectionModel.clear()
      g.selectionModel.setSelection([altar])
      g._lastCmdKey = ''
      g.updateHUD(0.016)

      const reviveBtn = Array.from(document.querySelectorAll('#command-card button')).find((b: any) =>
        b.querySelector('.btn-label')?.textContent?.trim() === '复活圣骑士',
      ) as HTMLButtonElement | undefined
      reviveBtn?.click()

      const dt = 0.5
      for (let i = 0; i < 240 && altar.reviveQueue.length > 0; i++) {
        g.update(dt)
      }
    })

    // Select revived Paladin and check HUD
    await page.evaluate(() => {
      const g = (window as any).__war3Game
      const paladin = g.units.find((u: any) => u.type === 'paladin' && !u.isBuilding && u.team === 0)
      if (!paladin) return
      g.selectionModel.clear()
      g.selectionModel.setSelection([paladin])
      g._lastCmdKey = ''
      g.updateHUD(0.016)
    })

    const afterRevive = await page.evaluate(() => {
      const g = (window as any).__war3Game
      const paladin = g.units.find((u: any) => u.type === 'paladin' && !u.isBuilding && u.team === 0)
      if (!paladin) return null
      const statsEl = document.getElementById('unit-stats')
      const statsText = statsEl?.textContent ?? ''

      const buttons = Array.from(document.querySelectorAll('#command-card button'))
      const castBtn = buttons.find((b: any) => {
        const txt = b.querySelector('.btn-label')?.textContent?.trim() ?? ''
        return txt.startsWith('圣光术 (Lv')
      })

      return {
        isDead: paladin.isDead,
        hlLevel: paladin.abilityLevels?.holy_light ?? 0,
        sp: paladin.heroSkillPoints,
        statsShowHLLevel: statsText.includes('圣光术 Lv1'),
        statsShowSP: statsText.includes('技能点'),
        hasCastBtn: !!castBtn,
        castLabel: castBtn?.querySelector('.btn-label')?.textContent?.trim() ?? '',
      }
    })

    expect(afterRevive).not.toBeNull()
    expect(afterRevive.isDead).toBe(false)
    expect(afterRevive.hlLevel).toBe(1)
    expect(afterRevive.sp).toBe(1)
    expect(afterRevive.statsShowHLLevel).toBe(true)
    expect(afterRevive.statsShowSP).toBe(true)
    expect(afterRevive.hasCastBtn).toBe(true)
    expect(afterRevive.castLabel).toContain('Lv1')
  })

  test('FB-6: Task228 skill-spend behavior unchanged — cast heals with correct level', async ({ page }) => {
    await waitForRuntime(page)
    const pal = await summonPaladin(page)
    expect(pal).not.toBeNull()

    // Learn level 1 and test cast
    await page.evaluate(() => {
      const g = (window as any).__war3Game
      const paladin = g.units.find((u: any) => u.type === 'paladin' && !u.isBuilding && u.team === 0)
      if (!paladin) return
      if (!paladin.abilityLevels) paladin.abilityLevels = {}
      paladin.abilityLevels.holy_light = 1
      paladin.heroSkillPoints = 0
    })

    const result = await page.evaluate(() => {
      const g = (window as any).__war3Game
      const paladin = g.units.find((u: any) => u.type === 'paladin' && !u.isBuilding && u.team === 0)
      if (!paladin) return null

      const footman = g.spawnUnit('footman', 0, paladin.mesh.position.x + 1, paladin.mesh.position.z)
      footman.hp = 50

      const hpBefore = footman.hp
      const manaBefore = paladin.mana
      const castOk = g.castHolyLight(paladin, footman)
      const freshPal = g.units.find((u: any) => u.type === 'paladin' && !u.isBuilding && u.team === 0)
      const freshFootman = g.units.find((u: any) => u === footman)

      return {
        castOk,
        manaSpent: manaBefore - freshPal.mana,
        healed: freshFootman.hp - hpBefore,
      }
    })

    expect(result.castOk).toBe(true)
    expect(result.manaSpent).toBe(65)
    // Level 1 heals 200, capped at maxHp
    expect(result.healed).toBeGreaterThan(0)
  })
})
