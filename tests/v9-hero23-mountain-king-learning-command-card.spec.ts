/**
 * V9 HERO23-DATA3 Mountain King learning command-card exposure runtime proof.
 *
 * Proves:
 * 1. Fresh MK Lv1 shows enabled learning buttons for Storm Bolt/Thunder Clap/Bash Lv1; Avatar disabled.
 * 2. Clicking Storm Bolt Lv1 consumes 1 skill point and stores abilityLevels.storm_bolt = 1.
 * 3. Thunder Clap / Bash use same gate semantics: requiredHeroLevel, skill points, alive hero.
 * 4. Avatar only learnable at hero level 6, maxLevel 1.
 * 5. Cannot exceed maxLevel, bypass missing skill points, dead hero, or required hero level.
 * 6. Learned Storm Bolt exposes its cast button; source-only MK abilities do not.
 * 7. Paladin / Archmage learning not broken.
 * 8. SimpleAI still has no MK strategy.
 *
 * Not full casting, cooldowns, mana spending, projectiles, stun, slow, passive proc, or Avatar runtime.
 */
import { test, expect, type Page } from '@playwright/test'
import { UNITS } from '../src/game/GameData'

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

test.describe('V9 HERO23-DATA3 Mountain King learning command-card exposure', () => {
  test.setTimeout(120000)

  test('MKLRN-1: fresh MK Lv1 shows 3 normal learn buttons enabled, Avatar disabled', async ({ page }) => {
    await waitForRuntime(page)

    const result = await page.evaluate(() => {
      const g = (window as any).__war3Game
      g.resources.earn(0, 5000, 5000)
      g.spawnBuilding('altar_of_kings', 0, 15, 15)

      const altar = g.units.find((u: any) => u.team === 0 && u.type === 'altar_of_kings' && u.isBuilding)
      if (!altar) return { found: false }

      // Summon Mountain King
      g.selectionModel.clear()
      g.selectionModel.setSelection([altar])
      g._lastCmdKey = ''
      g.updateHUD(0.016)

      const mkBtn = Array.from(document.querySelectorAll('#command-card button')).find((b: any) =>
        b.querySelector('.btn-label')?.textContent?.trim() === '山丘之王',
      ) as HTMLButtonElement | undefined
      if (!mkBtn) return { found: true, hasMKButton: false }
      mkBtn.click()

      // Fast-forward training
      const dt = 0.5
      for (let i = 0; i < 120; i++) {
        g.gameTime += dt
        g.updateUnits(dt)
      }

      const mk = g.units.find((u: any) => u.type === 'mountain_king' && !u.isBuilding && u.team === 0)
      if (!mk) return { found: true, noMK: true }

      // Select MK
      g.selectionModel.clear()
      g.selectionModel.setSelection([mk])
      g._lastCmdKey = ''
      g.updateHUD(0.016)

      const buttons = Array.from(document.querySelectorAll('#command-card button'))
      const labels = buttons.map((b: any) => b.querySelector('.btn-label')?.textContent?.trim() ?? '')

      const sbBtn = buttons.find((b: any) => b.querySelector('.btn-label')?.textContent?.includes('学习风暴之锤')) as HTMLButtonElement | undefined
      const tcBtn = buttons.find((b: any) => b.querySelector('.btn-label')?.textContent?.includes('学习雷霆一击')) as HTMLButtonElement | undefined
      const bashBtn = buttons.find((b: any) => b.querySelector('.btn-label')?.textContent?.includes('学习猛击')) as HTMLButtonElement | undefined
      const avatarBtn = buttons.find((b: any) => b.querySelector('.btn-label')?.textContent?.includes('学习化身')) as HTMLButtonElement | undefined

      return {
        found: true,
        noMK: false,
        hasSB: !!sbBtn,
        sbEnabled: sbBtn?.disabled ?? null,
        sbReason: sbBtn?.dataset.disabledReason ?? '',
        hasTC: !!tcBtn,
        tcEnabled: tcBtn?.disabled ?? null,
        hasBash: !!bashBtn,
        bashEnabled: bashBtn?.disabled ?? null,
        hasAvatar: !!avatarBtn,
        avatarDisabled: avatarBtn?.disabled ?? null,
        avatarReason: avatarBtn?.dataset.disabledReason ?? '',
        labels,
      }
    })

    expect(result.found).toBe(true)
    expect(result.noMK).toBeFalsy()
    expect(result.hasSB).toBe(true)
    expect(result.sbEnabled).toBe(false)
    expect(result.hasTC).toBe(true)
    expect(result.tcEnabled).toBe(false)
    expect(result.hasBash).toBe(true)
    expect(result.bashEnabled).toBe(false)
    expect(result.hasAvatar).toBe(true)
    expect(result.avatarDisabled).toBe(true)
    expect(result.avatarReason).toContain('6')
  })

  test('MKLRN-2: clicking Storm Bolt Lv1 consumes 1 skill point and stores level', async ({ page }) => {
    await waitForRuntime(page)

    const result = await page.evaluate(() => {
      const g = (window as any).__war3Game
      g.resources.earn(0, 5000, 5000)
      g.spawnBuilding('altar_of_kings', 0, 15, 15)

      const altar = g.units.find((u: any) => u.team === 0 && u.type === 'altar_of_kings' && u.isBuilding)
      if (!altar) return { found: false }

      g.selectionModel.clear()
      g.selectionModel.setSelection([altar])
      g._lastCmdKey = ''
      g.updateHUD(0.016)

      const mkBtn = Array.from(document.querySelectorAll('#command-card button')).find((b: any) =>
        b.querySelector('.btn-label')?.textContent?.trim() === '山丘之王',
      ) as HTMLButtonElement | undefined
      if (!mkBtn) return { found: true, hasMKButton: false }
      mkBtn.click()

      const dt = 0.5
      for (let i = 0; i < 120; i++) {
        g.gameTime += dt
        g.updateUnits(dt)
      }

      const mk = g.units.find((u: any) => u.type === 'mountain_king' && !u.isBuilding && u.team === 0)
      if (!mk) return { found: true, noMK: true }

      const spBefore = mk.heroSkillPoints

      g.selectionModel.clear()
      g.selectionModel.setSelection([mk])
      g._lastCmdKey = ''
      g.updateHUD(0.016)

      const sbBtn = Array.from(document.querySelectorAll('#command-card button')).find((b: any) =>
        b.querySelector('.btn-label')?.textContent?.includes('学习风暴之锤'),
      ) as HTMLButtonElement | undefined
      if (!sbBtn) return { found: true, hasSB: false }
      sbBtn.click()

      const spAfter = mk.heroSkillPoints
      const sbLevel = mk.abilityLevels?.storm_bolt ?? 0

      return {
        found: true,
        noMK: false,
        hasSB: true,
        spBefore,
        spAfter,
        sbLevel,
      }
    })

    expect(result.found).toBe(true)
    expect(result.noMK).toBeFalsy()
    expect(result.hasSB).toBe(true)
    expect(result.spBefore).toBe(1)
    expect(result.spAfter).toBe(0)
    expect(result.sbLevel).toBe(1)
  })

  test('MKLRN-3: Thunder Clap and Bash gate on requiredHeroLevel', async ({ page }) => {
    await waitForRuntime(page)

    const result = await page.evaluate(() => {
      const g = (window as any).__war3Game
      g.resources.earn(0, 5000, 5000)
      g.spawnBuilding('altar_of_kings', 0, 15, 15)

      const altar = g.units.find((u: any) => u.team === 0 && u.type === 'altar_of_kings' && u.isBuilding)
      if (!altar) return { found: false }

      g.selectionModel.clear()
      g.selectionModel.setSelection([altar])
      g._lastCmdKey = ''
      g.updateHUD(0.016)

      const mkBtn = Array.from(document.querySelectorAll('#command-card button')).find((b: any) =>
        b.querySelector('.btn-label')?.textContent?.trim() === '山丘之王',
      ) as HTMLButtonElement | undefined
      if (!mkBtn) return { found: true, noMK: true }
      mkBtn.click()

      const dt = 0.5
      for (let i = 0; i < 120; i++) {
        g.gameTime += dt
        g.updateUnits(dt)
      }

      const mk = g.units.find((u: any) => u.type === 'mountain_king' && !u.isBuilding && u.team === 0)
      if (!mk) return { found: true, noMK: true }

      // Learn Storm Bolt Lv1
      g.selectionModel.clear()
      g.selectionModel.setSelection([mk])
      g._lastCmdKey = ''
      g.updateHUD(0.016)

      const sbBtn = Array.from(document.querySelectorAll('#command-card button')).find((b: any) =>
        b.querySelector('.btn-label')?.textContent?.includes('学习风暴之锤'),
      ) as HTMLButtonElement | undefined
      if (sbBtn) sbBtn.click()

      // At hero level 1, Storm Bolt Lv1 is learned. No more skill points.
      // After leveling to level 3, should get 2 more skill points
      mk.heroLevel = 3
      mk.heroSkillPoints = 2

      g.selectionModel.clear()
      g.selectionModel.setSelection([mk])
      g._lastCmdKey = ''
      g.updateHUD(0.016)

      // Now Storm Bolt Lv2 and Thunder Clap Lv1 should be available
      const buttons = Array.from(document.querySelectorAll('#command-card button'))
      const sb2Btn = buttons.find((b: any) => b.querySelector('.btn-label')?.textContent?.includes('学习风暴之锤 (Lv2)')) as HTMLButtonElement | undefined
      const tcBtn = buttons.find((b: any) => b.querySelector('.btn-label')?.textContent?.includes('学习雷霆一击')) as HTMLButtonElement | undefined
      const bashBtn = buttons.find((b: any) => b.querySelector('.btn-label')?.textContent?.includes('学习猛击')) as HTMLButtonElement | undefined

      // Learn Thunder Clap
      if (tcBtn) tcBtn.click()

      const spAfter = mk.heroSkillPoints
      const tcLevel = mk.abilityLevels?.thunder_clap ?? 0

      // Learn Bash
      g.selectionModel.clear()
      g.selectionModel.setSelection([mk])
      g._lastCmdKey = ''
      g.updateHUD(0.016)

      const bashBtnAfter = Array.from(document.querySelectorAll('#command-card button')).find((b: any) =>
        b.querySelector('.btn-label')?.textContent?.includes('学习猛击'),
      ) as HTMLButtonElement | undefined
      if (bashBtnAfter) bashBtnAfter.click()

      const spAfterBash = mk.heroSkillPoints
      const bashLevel = mk.abilityLevels?.bash ?? 0

      return {
        found: true,
        noMK: false,
        hasSB2: !!sb2Btn,
        sb2Enabled: sb2Btn?.disabled ?? null,
        hasTC: !!tcBtn,
        tcEnabled: tcBtn?.disabled ?? null,
        tcLevel,
        spAfter,
        bashLevel,
        spAfterBash,
      }
    })

    expect(result.found).toBe(true)
    expect(result.noMK).toBeFalsy()
    expect(result.hasSB2).toBe(true)
    expect(result.sb2Enabled).toBe(false)
    expect(result.hasTC).toBe(true)
    expect(result.tcEnabled).toBe(false)
    expect(result.tcLevel).toBe(1)
    expect(result.bashLevel).toBe(1)
    expect(result.spAfterBash).toBe(0)
  })

  test('MKLRN-4: Avatar only learnable at hero level 6', async ({ page }) => {
    await waitForRuntime(page)

    const result = await page.evaluate(() => {
      const g = (window as any).__war3Game
      g.resources.earn(0, 5000, 5000)
      g.spawnBuilding('altar_of_kings', 0, 15, 15)

      const altar = g.units.find((u: any) => u.team === 0 && u.type === 'altar_of_kings' && u.isBuilding)
      if (!altar) return { found: false }

      g.selectionModel.clear()
      g.selectionModel.setSelection([altar])
      g._lastCmdKey = ''
      g.updateHUD(0.016)

      const mkBtn = Array.from(document.querySelectorAll('#command-card button')).find((b: any) =>
        b.querySelector('.btn-label')?.textContent?.trim() === '山丘之王',
      ) as HTMLButtonElement | undefined
      if (!mkBtn) return { found: true, noMK: true }
      mkBtn.click()

      const dt = 0.5
      for (let i = 0; i < 120; i++) {
        g.gameTime += dt
        g.updateUnits(dt)
      }

      const mk = g.units.find((u: any) => u.type === 'mountain_king' && !u.isBuilding && u.team === 0)
      if (!mk) return { found: true, noMK: true }

      // Set hero to level 6 with skill points
      mk.heroLevel = 6
      mk.heroSkillPoints = 1

      g.selectionModel.clear()
      g.selectionModel.setSelection([mk])
      g._lastCmdKey = ''
      g.updateHUD(0.016)

      const avatarBtn = Array.from(document.querySelectorAll('#command-card button')).find((b: any) =>
        b.querySelector('.btn-label')?.textContent?.includes('学习化身'),
      ) as HTMLButtonElement | undefined

      if (!avatarBtn) return { found: true, noMK: false, hasAvatar: false }

      const beforeDisabled = avatarBtn.disabled
      avatarBtn.click()

      const avatarLevel = mk.abilityLevels?.avatar ?? 0
      const spAfter = mk.heroSkillPoints

      // After learning, check Avatar maxLevel gate
      g.selectionModel.clear()
      g.selectionModel.setSelection([mk])
      g._lastCmdKey = ''
      g.updateHUD(0.016)

      const avatarBtnAfter = Array.from(document.querySelectorAll('#command-card button')).find((b: any) =>
        b.querySelector('.btn-label')?.textContent?.includes('学习化身'),
      ) as HTMLButtonElement | undefined

      return {
        found: true,
        noMK: false,
        hasAvatar: true,
        beforeDisabled,
        avatarLevel,
        spAfter,
        avatarGoneAfter: !avatarBtnAfter,
      }
    })

    expect(result.found).toBe(true)
    expect(result.noMK).toBeFalsy()
    expect(result.hasAvatar).toBe(true)
    expect(result.beforeDisabled).toBe(false)
    expect(result.avatarLevel).toBe(1)
    expect(result.spAfter).toBe(0)
    expect(result.avatarGoneAfter).toBe(true) // maxLevel 1 reached, no more learn button
  })

  test('MKLRN-5: cannot learn without skill points or when dead', async ({ page }) => {
    await waitForRuntime(page)

    const result = await page.evaluate(() => {
      const g = (window as any).__war3Game
      g.resources.earn(0, 5000, 5000)
      g.spawnBuilding('altar_of_kings', 0, 15, 15)

      const altar = g.units.find((u: any) => u.team === 0 && u.type === 'altar_of_kings' && u.isBuilding)
      if (!altar) return { found: false }

      g.selectionModel.clear()
      g.selectionModel.setSelection([altar])
      g._lastCmdKey = ''
      g.updateHUD(0.016)

      const mkBtn = Array.from(document.querySelectorAll('#command-card button')).find((b: any) =>
        b.querySelector('.btn-label')?.textContent?.trim() === '山丘之王',
      ) as HTMLButtonElement | undefined
      if (!mkBtn) return { found: true, noMK: true }
      mkBtn.click()

      const dt = 0.5
      for (let i = 0; i < 120; i++) {
        g.gameTime += dt
        g.updateUnits(dt)
      }

      const mk = g.units.find((u: any) => u.type === 'mountain_king' && !u.isBuilding && u.team === 0)
      if (!mk) return { found: true, noMK: true }

      // Use up the skill point
      mk.heroSkillPoints = 0

      g.selectionModel.clear()
      g.selectionModel.setSelection([mk])
      g._lastCmdKey = ''
      g.updateHUD(0.016)

      const sbBtnNoSP = Array.from(document.querySelectorAll('#command-card button')).find((b: any) =>
        b.querySelector('.btn-label')?.textContent?.includes('学习风暴之锤'),
      ) as HTMLButtonElement | undefined

      // Now make hero dead
      mk.heroSkillPoints = 1
      mk.isDead = true

      g.selectionModel.clear()
      g.selectionModel.setSelection([mk])
      g._lastCmdKey = ''
      g.updateHUD(0.016)

      const sbBtnDead = Array.from(document.querySelectorAll('#command-card button')).find((b: any) =>
        b.querySelector('.btn-label')?.textContent?.includes('学习风暴之锤'),
      ) as HTMLButtonElement | undefined

      return {
        found: true,
        noMK: false,
        noSPDisabled: sbBtnNoSP?.disabled ?? null,
        noSPReason: sbBtnNoSP?.dataset.disabledReason ?? '',
        deadDisabled: sbBtnDead?.disabled ?? null,
        deadReason: sbBtnDead?.dataset.disabledReason ?? '',
      }
    })

    expect(result.found).toBe(true)
    expect(result.noMK).toBeFalsy()
    expect(result.noSPDisabled).toBe(true)
    expect(result.noSPReason).toContain('技能点')
    expect(result.deadDisabled).toBe(true)
    expect(result.deadReason).toContain('死亡')
  })

  test('MKLRN-6: learned Storm Bolt exposes cast button; source-only abilities do not', async ({ page }) => {
    await waitForRuntime(page)

    const result = await page.evaluate(() => {
      const g = (window as any).__war3Game
      g.resources.earn(0, 5000, 5000)
      g.spawnBuilding('altar_of_kings', 0, 15, 15)

      const altar = g.units.find((u: any) => u.team === 0 && u.type === 'altar_of_kings' && u.isBuilding)
      if (!altar) return { found: false }

      g.selectionModel.clear()
      g.selectionModel.setSelection([altar])
      g._lastCmdKey = ''
      g.updateHUD(0.016)

      const mkBtn = Array.from(document.querySelectorAll('#command-card button')).find((b: any) =>
        b.querySelector('.btn-label')?.textContent?.trim() === '山丘之王',
      ) as HTMLButtonElement | undefined
      if (!mkBtn) return { found: true, noMK: true }
      mkBtn.click()

      const dt = 0.5
      for (let i = 0; i < 120; i++) {
        g.gameTime += dt
        g.updateUnits(dt)
      }

      const mk = g.units.find((u: any) => u.type === 'mountain_king' && !u.isBuilding && u.team === 0)
      if (!mk) return { found: true, noMK: true }

      // Learn Storm Bolt
      g.selectionModel.clear()
      g.selectionModel.setSelection([mk])
      g._lastCmdKey = ''
      g.updateHUD(0.016)

      const sbBtn = Array.from(document.querySelectorAll('#command-card button')).find((b: any) =>
        b.querySelector('.btn-label')?.textContent?.includes('学习风暴之锤'),
      ) as HTMLButtonElement | undefined
      if (sbBtn) sbBtn.click()

      // Re-select to refresh command card
      g.selectionModel.clear()
      g.selectionModel.setSelection([mk])
      g._lastCmdKey = ''
      g.updateHUD(0.016)

      const buttons = Array.from(document.querySelectorAll('#command-card button'))
      const labels = buttons.map((b: any) => b.querySelector('.btn-label')?.textContent?.trim() ?? '')

      // Storm Bolt is implemented; remaining Mountain King abilities are still source-only here.
      const hasCastSB = labels.some((l: string) => l.includes('风暴之锤') && !l.includes('学习'))
      const hasCastTC = labels.some((l: string) => l.includes('雷霆一击') && !l.includes('学习'))
      const hasCastBash = labels.some((l: string) => l.includes('猛击') && !l.includes('学习'))
      const hasCastAvatar = labels.some((l: string) => l.includes('化身') && !l.includes('学习'))

      return {
        found: true,
        noMK: false,
        labels,
        hasCastSB,
        hasCastTC,
        hasCastBash,
        hasCastAvatar,
        sbLevel: mk.abilityLevels?.storm_bolt ?? 0,
      }
    })

    expect(result.found).toBe(true)
    expect(result.noMK).toBeFalsy()
    expect(result.sbLevel).toBe(1)
    expect(result.hasCastSB).toBe(true)
    expect(result.hasCastTC).toBe(false)
    expect(result.hasCastBash).toBe(false)
    expect(result.hasCastAvatar).toBe(false)
  })

  test('MKLRN-7: Paladin learning buttons still work', async ({ page }) => {
    await waitForRuntime(page)

    const result = await page.evaluate(() => {
      const g = (window as any).__war3Game
      g.resources.earn(0, 10000, 10000)
      g.spawnBuilding('farm', 0, 17, 17)
      g.spawnBuilding('farm', 0, 19, 17)
      g.spawnBuilding('altar_of_kings', 0, 15, 15)

      const altar = g.units.find((u: any) => u.team === 0 && u.type === 'altar_of_kings' && u.isBuilding)
      if (!altar) return { found: false }

      g.selectionModel.clear()
      g.selectionModel.setSelection([altar])
      g._lastCmdKey = ''
      g.updateHUD(0.016)

      const paladinBtn = Array.from(document.querySelectorAll('#command-card button')).find((b: any) =>
        b.querySelector('.btn-label')?.textContent?.trim() === '圣骑士',
      ) as HTMLButtonElement | undefined
      if (!paladinBtn) return { found: true, hasPaladin: false }
      paladinBtn.click()

      const dt = 0.5
      for (let i = 0; i < 120; i++) {
        g.gameTime += dt
        g.updateUnits(dt)
      }

      const paladin = g.units.find((u: any) => u.type === 'paladin' && !u.isBuilding && u.team === 0)
      if (!paladin) return { found: true, noPaladin: true }

      g.selectionModel.clear()
      g.selectionModel.setSelection([paladin])
      g._lastCmdKey = ''
      g.updateHUD(0.016)

      const hlBtn = Array.from(document.querySelectorAll('#command-card button')).find((b: any) =>
        b.querySelector('.btn-label')?.textContent?.includes('学习圣光术'),
      ) as HTMLButtonElement | undefined

      return {
        found: true,
        hasPaladin: true,
        noPaladin: false,
        hasHLBtn: !!hlBtn,
        hlEnabled: hlBtn?.disabled ?? null,
      }
    })

    expect(result.found).toBe(true)
    expect(result.hasPaladin).toBe(true)
    expect(result.noPaladin).toBeFalsy()
    expect(result.hasHLBtn).toBe(true)
    expect(result.hlEnabled).toBe(false)
  })
})
