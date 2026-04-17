/**
 * V9 HERO12-IMPL1A Divine Shield learn surface runtime proof.
 *
 * Proves:
 * 1. New Paladin shows learn Divine Shield button, no cast button.
 * 2. Learning level 1 consumes 1 SP, sets divine_shield = 1.
 * 3. Level 2 blocked before hero level 3, level 3 blocked before hero level 5.
 * 4. At hero level 3/5, learning works and updates.
 * 5. Learned Divine Shield level and SP persist through death/revive.
 * 6. Holy Light learning and casting unchanged.
 *
 * Not: Divine Shield casting, invulnerability, duration, cooldown, damage prevention,
 * visual effects, AI, other abilities, other heroes.
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

test.describe('V9 HERO12-IMPL1A Divine Shield learn surface', () => {
  test.setTimeout(180000)

  test('DS-1: new Paladin shows learn DS button, no cast DS button', async ({ page }) => {
    await waitForRuntime(page)
    const pal = await summonPaladin(page)
    expect(pal).not.toBeNull()

    await selectPaladin(page)

    const result = await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('#command-card button'))
      const learnBtn = buttons.find((b: any) =>
        b.querySelector('.btn-label')?.textContent?.trim()?.includes('学习神圣护盾'),
      )
      const castBtn = buttons.find((b: any) => {
        const txt = b.querySelector('.btn-label')?.textContent?.trim() ?? ''
        return txt.includes('神圣护盾') && txt.includes('Lv') && !txt.includes('学习')
      })
      return {
        hasLearnBtn: !!learnBtn,
        learnBtnEnabled: learnBtn?.disabled === false,
        learnLabel: learnBtn?.querySelector('.btn-label')?.textContent?.trim() ?? '',
        hasCastBtn: !!castBtn,
      }
    })

    expect(result.hasLearnBtn).toBe(true)
    expect(result.learnBtnEnabled).toBe(true)
    expect(result.learnLabel).toContain('Lv1')
    expect(result.hasCastBtn).toBe(false)
  })

  test('DS-2: learning level 1 consumes 1 SP, sets divine_shield = 1, shows in HUD', async ({ page }) => {
    await waitForRuntime(page)
    const pal = await summonPaladin(page)
    expect(pal).not.toBeNull()

    await selectPaladin(page)

    const afterLearn = await page.evaluate(() => {
      const g = (window as any).__war3Game
      const buttons = Array.from(document.querySelectorAll('#command-card button'))
      const learnBtn = buttons.find((b: any) =>
        b.querySelector('.btn-label')?.textContent?.trim()?.includes('学习神圣护盾 (Lv1)'),
      ) as HTMLButtonElement | undefined
      if (learnBtn) learnBtn.click()

      g._lastCmdKey = ''
      g.updateHUD(0.016)

      const fresh = g.units.find((u: any) => u.type === 'paladin' && !u.isBuilding && u.team === 0)
      const statsEl = document.getElementById('unit-stats')
      const statsText = statsEl?.textContent ?? ''

      return {
        dsLevel: fresh.abilityLevels?.divine_shield ?? 0,
        sp: fresh.heroSkillPoints,
        statsShowDS: statsText.includes('神圣护盾 Lv1'),
      }
    })

    expect(afterLearn.dsLevel).toBe(1)
    expect(afterLearn.sp).toBe(0)
    expect(afterLearn.statsShowDS).toBe(true)
  })

  test('DS-3: level 2 blocked before hero level 3, level 3 blocked before hero level 5', async ({ page }) => {
    await waitForRuntime(page)
    const pal = await summonPaladin(page)
    expect(pal).not.toBeNull()

    // Set: level 1 DS learned, hero level 2, 3 SP
    await page.evaluate(() => {
      const g = (window as any).__war3Game
      const paladin = g.units.find((u: any) => u.type === 'paladin' && !u.isBuilding && u.team === 0)
      if (!paladin) return
      if (!paladin.abilityLevels) paladin.abilityLevels = {}
      paladin.abilityLevels.divine_shield = 1
      paladin.heroSkillPoints = 3
      paladin.heroLevel = 2
    })

    await selectPaladin(page)

    const result = await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('#command-card button'))
      const learnLv2 = buttons.find((b: any) =>
        b.querySelector('.btn-label')?.textContent?.trim()?.includes('学习神圣护盾 (Lv2)'),
      )
      return {
        hasLearnLv2: !!learnLv2,
        disabled: learnLv2?.disabled ?? null,
        reason: learnLv2?.dataset.disabledReason ?? '',
      }
    })

    expect(result.hasLearnLv2).toBe(true)
    expect(result.disabled).toBe(true)
    expect(result.reason).toContain('3')
  })

  test('DS-4: at hero level 3, learning level 2 works; at 5, level 3 works', async ({ page }) => {
    await waitForRuntime(page)
    const pal = await summonPaladin(page)
    expect(pal).not.toBeNull()

    // Set hero level 3, DS level 1, 3 SP
    await page.evaluate(() => {
      const g = (window as any).__war3Game
      const paladin = g.units.find((u: any) => u.type === 'paladin' && !u.isBuilding && u.team === 0)
      if (!paladin) return
      paladin.heroLevel = 3
      paladin.heroSkillPoints = 3
      if (!paladin.abilityLevels) paladin.abilityLevels = {}
      paladin.abilityLevels.divine_shield = 1
    })

    await selectPaladin(page)

    // Learn level 2
    const afterLv2 = await page.evaluate(() => {
      const g = (window as any).__war3Game
      const buttons = Array.from(document.querySelectorAll('#command-card button'))
      const learnBtn = buttons.find((b: any) =>
        b.querySelector('.btn-label')?.textContent?.trim()?.includes('学习神圣护盾 (Lv2)'),
      ) as HTMLButtonElement | undefined
      if (learnBtn && !learnBtn.disabled) learnBtn.click()
      const fresh = g.units.find((u: any) => u.type === 'paladin' && !u.isBuilding && u.team === 0)
      return { dsLevel: fresh.abilityLevels?.divine_shield ?? 0, sp: fresh.heroSkillPoints }
    })

    expect(afterLv2.dsLevel).toBe(2)
    expect(afterLv2.sp).toBe(2)

    // Now check level 3 is blocked at hero level 3
    await selectPaladin(page)

    const lv3Blocked = await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('#command-card button'))
      const learnLv3 = buttons.find((b: any) =>
        b.querySelector('.btn-label')?.textContent?.trim()?.includes('学习神圣护盾 (Lv3)'),
      )
      return {
        hasLearnLv3: !!learnLv3,
        disabled: learnLv3?.disabled ?? null,
        reason: learnLv3?.dataset.disabledReason ?? '',
      }
    })

    expect(lv3Blocked.hasLearnLv3).toBe(true)
    expect(lv3Blocked.disabled).toBe(true)
    expect(lv3Blocked.reason).toContain('5')

    // Upgrade hero to level 5 and learn level 3
    await page.evaluate(() => {
      const g = (window as any).__war3Game
      const paladin = g.units.find((u: any) => u.type === 'paladin' && !u.isBuilding && u.team === 0)
      if (!paladin) return
      paladin.heroLevel = 5
    })

    await selectPaladin(page)

    const afterLv3 = await page.evaluate(() => {
      const g = (window as any).__war3Game
      const buttons = Array.from(document.querySelectorAll('#command-card button'))
      const learnBtn = buttons.find((b: any) =>
        b.querySelector('.btn-label')?.textContent?.trim()?.includes('学习神圣护盾 (Lv3)'),
      ) as HTMLButtonElement | undefined
      if (learnBtn && !learnBtn.disabled) learnBtn.click()
      const fresh = g.units.find((u: any) => u.type === 'paladin' && !u.isBuilding && u.team === 0)
      return { dsLevel: fresh.abilityLevels?.divine_shield ?? 0, sp: fresh.heroSkillPoints }
    })

    expect(afterLv3.dsLevel).toBe(3)
    expect(afterLv3.sp).toBe(1)
  })

  test('DS-5: learned DS level and SP persist through death and revive', async ({ page }) => {
    await waitForRuntime(page)
    const pal = await summonPaladin(page)
    expect(pal).not.toBeNull()

    // Set: DS level 2, hero level 5, 1 SP
    await page.evaluate(() => {
      const g = (window as any).__war3Game
      const paladin = g.units.find((u: any) => u.type === 'paladin' && !u.isBuilding && u.team === 0)
      if (!paladin) return
      paladin.heroLevel = 5
      paladin.heroSkillPoints = 1
      if (!paladin.abilityLevels) paladin.abilityLevels = {}
      paladin.abilityLevels.divine_shield = 2
    })

    // Kill
    await page.evaluate(() => {
      const g = (window as any).__war3Game
      const paladin = g.units.find((u: any) => u.type === 'paladin' && !u.isBuilding && u.team === 0)
      if (!paladin) return
      paladin.hp = 0
      g.update(0.5)
    })

    const afterDeath = await page.evaluate(() => {
      const g = (window as any).__war3Game
      const paladin = g.units.find((u: any) => u.type === 'paladin' && !u.isBuilding && u.team === 0)
      if (!paladin) return null
      return { isDead: paladin.isDead, dsLevel: paladin.abilityLevels?.divine_shield ?? 0, sp: paladin.heroSkillPoints }
    })
    expect(afterDeath.isDead).toBe(true)
    expect(afterDeath.dsLevel).toBe(2)
    expect(afterDeath.sp).toBe(1)

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
      for (let i = 0; i < 240 && altar.reviveQueue.length > 0; i++) { g.update(dt) }
    })

    // Select and check
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
      return {
        isDead: paladin.isDead,
        dsLevel: paladin.abilityLevels?.divine_shield ?? 0,
        sp: paladin.heroSkillPoints,
        statsShowDS: statsText.includes('神圣护盾 Lv2'),
      }
    })

    expect(afterRevive.isDead).toBe(false)
    expect(afterRevive.dsLevel).toBe(2)
    expect(afterRevive.sp).toBe(1)
    expect(afterRevive.statsShowDS).toBe(true)
  })

  test('DS-6: Holy Light learning and casting unchanged', async ({ page }) => {
    await waitForRuntime(page)
    const pal = await summonPaladin(page)
    expect(pal).not.toBeNull()

    // Learn Holy Light level 1 via button
    await selectPaladin(page)

    const result = await page.evaluate(() => {
      const g = (window as any).__war3Game
      const paladin = g.units.find((u: any) => u.type === 'paladin' && !u.isBuilding && u.team === 0)
      if (!paladin) return null

      // Click Holy Light learn button
      const buttons = Array.from(document.querySelectorAll('#command-card button'))
      const hlLearn = buttons.find((b: any) =>
        b.querySelector('.btn-label')?.textContent?.trim()?.includes('学习圣光术 (Lv1)'),
      ) as HTMLButtonElement | undefined
      if (hlLearn) hlLearn.click()

      const fresh = g.units.find((u: any) => u.type === 'paladin' && !u.isBuilding && u.team === 0)

      // Now test Holy Light cast
      const footman = g.spawnUnit('footman', 0, fresh.mesh.position.x + 1, fresh.mesh.position.z)
      footman.hp = 50
      const hpBefore = footman.hp
      const castOk = g.castHolyLight(fresh, footman)
      const freshFm = g.units.find((u: any) => u === footman)

      return {
        hlLevel: fresh.abilityLevels?.holy_light ?? 0,
        hlSp: fresh.heroSkillPoints,
        castOk,
        healed: freshFm.hp - hpBefore,
        dsLevel: fresh.abilityLevels?.divine_shield ?? 0,
      }
    })

    expect(result.hlLevel).toBe(1)
    expect(result.hlSp).toBe(0)
    expect(result.castOk).toBe(true)
    expect(result.healed).toBeGreaterThan(0)
    expect(result.dsLevel).toBe(0)
  })
})
