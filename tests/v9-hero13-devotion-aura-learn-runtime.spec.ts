/**
 * V9 HERO13-IMPL2 Devotion Aura learn surface runtime proof.
 *
 * Proves:
 * 1. Paladin can learn Devotion Aura Lv1 from the command card.
 * 2. Learning consumes exactly one skill point and activates the passive aura runtime.
 * 3. Lv2/Lv3 respect hero level gates 3/5 and upgrade the data-driven armor bonus.
 * 4. Learned Devotion Aura persists through HERO9 death/revive.
 * 5. After UX1, this slice still exposes no Devotion Aura cast button while HUD status text is allowed.
 *
 * Not: cast buttons, particles, sounds, AI, building targets,
 * air units, other heroes, Resurrection, assets, complete hero system.
 */
import { test, expect, type Page } from '@playwright/test'
import { HERO_ABILITY_LEVELS } from '../src/game/GameData'

const BASE_RUNTIME = 'http://127.0.0.1:4173/?runtimeTest=1'
const DA = HERO_ABILITY_LEVELS.devotion_aura

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

test.describe('V9 HERO13-IMPL2 Devotion Aura learn surface', () => {
  test.setTimeout(180000)

  test('DA-LEARN-1: learn Lv1 consumes one skill point and activates passive armor aura', async ({ page }) => {
    await waitForRuntime(page)

    const result = await page.evaluate(() => {
      const g = (window as any).__war3Game
      const paladin = g.spawnUnit('paladin', 0, 30, 30)
      const footman = g.spawnUnit('footman', 0, 35, 30)
      const footmanBaseArmor = footman.armor

      g.selectionModel.clear()
      g.selectionModel.setSelection([paladin])
      g._lastCmdKey = ''
      g.updateHUD(0.016)

      const buttons = Array.from(document.querySelectorAll('#command-card button'))
      const learnBtn = buttons.find((b: any) =>
        b.querySelector('.btn-label')?.textContent?.trim() === '学习虔诚光环 (Lv1)',
      ) as HTMLButtonElement | undefined
      const hasCastButtonBefore = buttons.some((b: any) => {
        const label = b.querySelector('.btn-label')?.textContent?.trim() ?? ''
        return label.includes('虔诚光环') && !label.includes('学习')
      })

      learnBtn?.click()
      g.update(0.1)

      return {
        hasLearnButton: !!learnBtn,
        learnEnabled: learnBtn?.disabled === false,
        hasCastButtonBefore,
        heroSkillPoints: paladin.heroSkillPoints,
        learnedLevel: paladin.abilityLevels?.devotion_aura ?? 0,
        footmanBaseArmor,
        footmanArmorAfterAura: footman.armor,
        footmanAuraBonus: footman.devotionAuraBonus,
      }
    })

    const bonus = DA.levels[0].armorBonus!
    expect(result.hasLearnButton).toBe(true)
    expect(result.learnEnabled).toBe(true)
    expect(result.hasCastButtonBefore).toBe(false)
    expect(result.heroSkillPoints).toBe(0)
    expect(result.learnedLevel).toBe(1)
    expect(result.footmanArmorAfterAura).toBeCloseTo(result.footmanBaseArmor + bonus, 5)
    expect(result.footmanAuraBonus).toBeCloseTo(bonus, 5)
  })

  test('DA-LEARN-2: Lv2 is gated before hero level 3, then upgrades armor bonus at level 3', async ({ page }) => {
    await waitForRuntime(page)

    const result = await page.evaluate(() => {
      const g = (window as any).__war3Game
      const paladin = g.spawnUnit('paladin', 0, 30, 30)
      const footman = g.spawnUnit('footman', 0, 35, 30)
      const footmanBaseArmor = footman.armor
      paladin.abilityLevels = { ...(paladin.abilityLevels ?? {}), devotion_aura: 1 }
      paladin.heroLevel = 2
      paladin.heroSkillPoints = 1
      g.update(0.1)

      g.selectionModel.clear()
      g.selectionModel.setSelection([paladin])
      g._lastCmdKey = ''
      g.updateHUD(0.016)
      let buttons = Array.from(document.querySelectorAll('#command-card button'))
      const blockedLv2 = buttons.find((b: any) =>
        b.querySelector('.btn-label')?.textContent?.trim() === '学习虔诚光环 (Lv2)',
      ) as HTMLButtonElement | undefined

      paladin.heroLevel = 3
      g._lastCmdKey = ''
      g.updateHUD(0.016)
      buttons = Array.from(document.querySelectorAll('#command-card button'))
      const allowedLv2 = buttons.find((b: any) =>
        b.querySelector('.btn-label')?.textContent?.trim() === '学习虔诚光环 (Lv2)',
      ) as HTMLButtonElement | undefined
      allowedLv2?.click()
      g.update(0.1)

      return {
        blockedExists: !!blockedLv2,
        blockedDisabled: blockedLv2?.disabled ?? null,
        blockedReason: blockedLv2?.dataset.disabledReason ?? '',
        allowedDisabled: allowedLv2?.disabled ?? null,
        learnedLevel: paladin.abilityLevels?.devotion_aura ?? 0,
        heroSkillPoints: paladin.heroSkillPoints,
        footmanBaseArmor,
        footmanArmorAfterLv2: footman.armor,
      }
    })

    const bonus = DA.levels[1].armorBonus!
    expect(result.blockedExists).toBe(true)
    expect(result.blockedDisabled).toBe(true)
    expect(result.blockedReason).toContain('英雄等级 3')
    expect(result.allowedDisabled).toBe(false)
    expect(result.learnedLevel).toBe(2)
    expect(result.heroSkillPoints).toBe(0)
    expect(result.footmanArmorAfterLv2).toBeCloseTo(result.footmanBaseArmor + bonus, 5)
  })

  test('DA-LEARN-3: Lv3 is gated before hero level 5, then upgrades armor bonus at level 5', async ({ page }) => {
    await waitForRuntime(page)

    const result = await page.evaluate(() => {
      const g = (window as any).__war3Game
      const paladin = g.spawnUnit('paladin', 0, 30, 30)
      const footman = g.spawnUnit('footman', 0, 35, 30)
      const footmanBaseArmor = footman.armor
      paladin.abilityLevels = { ...(paladin.abilityLevels ?? {}), devotion_aura: 2 }
      paladin.heroLevel = 4
      paladin.heroSkillPoints = 1
      g.update(0.1)

      g.selectionModel.clear()
      g.selectionModel.setSelection([paladin])
      g._lastCmdKey = ''
      g.updateHUD(0.016)
      let buttons = Array.from(document.querySelectorAll('#command-card button'))
      const blockedLv3 = buttons.find((b: any) =>
        b.querySelector('.btn-label')?.textContent?.trim() === '学习虔诚光环 (Lv3)',
      ) as HTMLButtonElement | undefined

      paladin.heroLevel = 5
      g._lastCmdKey = ''
      g.updateHUD(0.016)
      buttons = Array.from(document.querySelectorAll('#command-card button'))
      const allowedLv3 = buttons.find((b: any) =>
        b.querySelector('.btn-label')?.textContent?.trim() === '学习虔诚光环 (Lv3)',
      ) as HTMLButtonElement | undefined
      allowedLv3?.click()
      g.update(0.1)

      return {
        blockedExists: !!blockedLv3,
        blockedDisabled: blockedLv3?.disabled ?? null,
        blockedReason: blockedLv3?.dataset.disabledReason ?? '',
        learnedLevel: paladin.abilityLevels?.devotion_aura ?? 0,
        heroSkillPoints: paladin.heroSkillPoints,
        footmanBaseArmor,
        footmanArmorAfterLv3: footman.armor,
      }
    })

    const bonus = DA.levels[2].armorBonus!
    expect(result.blockedExists).toBe(true)
    expect(result.blockedDisabled).toBe(true)
    expect(result.blockedReason).toContain('英雄等级 5')
    expect(result.learnedLevel).toBe(3)
    expect(result.heroSkillPoints).toBe(0)
    expect(result.footmanArmorAfterLv3).toBeCloseTo(result.footmanBaseArmor + bonus, 5)
  })

  test('DA-LEARN-4: learned level persists through death and Altar revive with UX HUD status copy', async ({ page }) => {
    await waitForRuntime(page)

    const result = await page.evaluate(() => {
      const g = (window as any).__war3Game
      g.resources.earn(0, 10000, 10000)
      const altar = g.spawnBuilding('altar_of_kings', 0, 15, 15)
      const paladin = g.spawnUnit('paladin', 0, 30, 30)
      paladin.heroSkillPoints = 1

      g.selectionModel.clear()
      g.selectionModel.setSelection([paladin])
      g._lastCmdKey = ''
      g.updateHUD(0.016)
      const learnBtn = Array.from(document.querySelectorAll('#command-card button')).find((b: any) =>
        b.querySelector('.btn-label')?.textContent?.trim() === '学习虔诚光环 (Lv1)',
      ) as HTMLButtonElement | undefined
      learnBtn?.click()

      paladin.hp = 0
      g.handleDeadUnits()
      const levelWhileDead = paladin.abilityLevels?.devotion_aura ?? 0

      g.startReviveHero(altar, 'paladin')
      altar.reviveQueue[0].remaining = 0.001
      g.update(0.1)

      g.selectionModel.clear()
      g.selectionModel.setSelection([paladin])
      g._lastCmdKey = ''
      g.updateHUD(0.016)
      const labels = Array.from(document.querySelectorAll('#command-card button')).map((b: any) =>
        b.querySelector('.btn-label')?.textContent?.trim() ?? '',
      )
      const statsText = document.querySelector('#unit-stats')?.textContent ?? ''

      return {
        levelWhileDead,
        revivedAlive: paladin.isDead === false && paladin.hp > 0,
        levelAfterRevive: paladin.abilityLevels?.devotion_aura ?? 0,
        hasCastButton: labels.some(label => label.includes('虔诚光环') && !label.includes('学习')),
        hasHudStatus: statsText.includes('虔诚光环 Lv'),
      }
    })

    expect(result.levelWhileDead).toBe(1)
    expect(result.revivedAlive).toBe(true)
    expect(result.levelAfterRevive).toBe(1)
    expect(result.hasCastButton).toBe(false)
    expect(result.hasHudStatus).toBe(true)
  })
})
