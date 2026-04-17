/**
 * V9 HERO14-IMPL1A Resurrection learn surface runtime proof.
 *
 * Proves:
 * 1. Paladin can learn Resurrection Lv1 at hero level 6 with 1 skill point.
 * 2. Level, skill point, and dead-state gates produce clear disabled reasons.
 * 3. Learning consumes exactly 1 skill point and maxes at one level.
 * 4. Learned Resurrection persists through HERO9 Altar revive.
 * 5. Post-IMPL1C, learned Resurrection exposes a cast button; this file still
 *    only proves the learn gate and persistence behavior.
 *
 * Not: cast effect, corpse records, target selection, mana/cooldown spend,
 * HUD/status text, particles, sounds, AI, other heroes, complete Paladin.
 */
import { test, expect, type Page } from '@playwright/test'
import { HERO_ABILITY_LEVELS, HERO_REVIVE_RULES, UNITS } from '../src/game/GameData'

const BASE_RUNTIME = 'http://127.0.0.1:4173/?runtimeTest=1'
const RES = HERO_ABILITY_LEVELS.resurrection
const PALADIN_REVIVE_TIME = Math.round(Math.min(
  UNITS.paladin.trainTime * HERO_REVIVE_RULES.timeFactor,
  UNITS.paladin.trainTime * HERO_REVIVE_RULES.timeMaxFactor,
  HERO_REVIVE_RULES.timeHardCap,
))

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
    ;(window as any).__getCommandButton = (label: string) =>
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

test.describe('V9 HERO14-IMPL1A Resurrection learn surface', () => {
  test.setTimeout(180000)

  test('RES-LEARN-1: level gate blocks before 6, then learning consumes one skill point', async ({ page }) => {
    await waitForRuntime(page)

    const result = await page.evaluate(() => {
      const g = (window as any).__war3Game
      const paladin = g.spawnUnit('paladin', 0, 30, 30)
      paladin.heroLevel = 5
      paladin.heroSkillPoints = 1

      g.selectionModel.clear()
      g.selectionModel.setSelection([paladin])
      g._lastCmdKey = ''
      g.updateHUD(0.016)

      const blocked = (window as any).__getCommandButton('学习复活 (Lv1)')

      paladin.heroLevel = 6
      g._lastCmdKey = ''
      g.updateHUD(0.016)
      const learn = (window as any).__getCommandButton('学习复活 (Lv1)')
      learn?.click()
      g._lastCmdKey = ''
      g.updateHUD(0.016)

      const labels = Array.from(document.querySelectorAll('#command-card button')).map((b: any) =>
        b.querySelector('.btn-label')?.textContent?.trim() ?? '',
      )
      return {
        blockedExists: !!blocked,
        blockedDisabled: blocked?.disabled ?? null,
        blockedReason: blocked?.dataset.disabledReason ?? '',
        learnDisabled: learn?.disabled ?? null,
        learnedLevel: paladin.abilityLevels?.resurrection ?? 0,
        skillPoints: paladin.heroSkillPoints,
        hasSecondLearn: labels.includes('学习复活 (Lv2)'),
        hasCastButton: labels.some(label => label.includes('复活') && !label.includes('学习')),
      }
    })

    expect(result.blockedExists).toBe(true)
    expect(result.blockedDisabled).toBe(true)
    expect(result.blockedReason).toContain(`英雄等级 ${RES.levels[0].requiredHeroLevel}`)
    expect(result.learnDisabled).toBe(false)
    expect(result.learnedLevel).toBe(1)
    expect(result.skillPoints).toBe(0)
    expect(result.hasSecondLearn).toBe(false)
    expect(result.hasCastButton).toBe(true)
  })

  test('RES-LEARN-2: no skill point and dead-state gates are explicit', async ({ page }) => {
    await waitForRuntime(page)

    const result = await page.evaluate(() => {
      const g = (window as any).__war3Game
      const noSp = g.spawnUnit('paladin', 0, 30, 30)
      noSp.heroLevel = 6
      noSp.heroSkillPoints = 0

      g.selectionModel.clear()
      g.selectionModel.setSelection([noSp])
      g._lastCmdKey = ''
      g.updateHUD(0.016)
      const noSpBtn = (window as any).__getCommandButton('学习复活 (Lv1)')

      const dead = g.spawnUnit('paladin', 0, 34, 30)
      dead.heroLevel = 6
      dead.heroSkillPoints = 1
      dead.isDead = true
      dead.hp = 0

      g.selectionModel.clear()
      g.selectionModel.setSelection([dead])
      g._lastCmdKey = ''
      g.updateHUD(0.016)
      const deadBtn = (window as any).__getCommandButton('学习复活 (Lv1)')

      return {
        noSpDisabled: noSpBtn?.disabled ?? null,
        noSpReason: noSpBtn?.dataset.disabledReason ?? '',
        deadDisabled: deadBtn?.disabled ?? null,
        deadReason: deadBtn?.dataset.disabledReason ?? '',
      }
    })

    expect(result.noSpDisabled).toBe(true)
    expect(result.noSpReason).toContain('无技能点')
    expect(result.deadDisabled).toBe(true)
    expect(result.deadReason).toContain('已死亡')
  })

  test('RES-LEARN-3: learned Resurrection persists through HERO9 Altar revive and keeps cast surface', async ({ page }) => {
    await waitForRuntime(page)

    const result = await page.evaluate(({ reviveTime }) => {
      const g = (window as any).__war3Game
      g.resources.earn(0, 10000, 10000)
      const altar = g.spawnBuilding('altar_of_kings', 0, 15, 15)
      const paladin = g.spawnUnit('paladin', 0, 18, 15)
      paladin.heroLevel = 6
      paladin.heroSkillPoints = 1

      g.selectionModel.clear()
      g.selectionModel.setSelection([paladin])
      g._lastCmdKey = ''
      g.updateHUD(0.016)
      ;(window as any).__getCommandButton('学习复活 (Lv1)')?.click()
      const learnedBeforeDeath = paladin.abilityLevels?.resurrection ?? 0
      const spAfterLearn = paladin.heroSkillPoints

      paladin.hp = 0
      g.update(0.5)

      g.selectionModel.clear()
      g.selectionModel.setSelection([altar])
      g._lastCmdKey = ''
      g.updateHUD(0.016)
      ;(g as any).startReviveHero(altar, 'paladin')
      const queuedDuration = altar.reviveQueue[0]?.totalDuration ?? 0

      const dt = 0.5
      for (let i = 0; i < Math.ceil((queuedDuration || reviveTime) / dt) + 8 && altar.reviveQueue.length > 0; i++) {
        g.update(dt)
      }

      g.selectionModel.clear()
      g.selectionModel.setSelection([paladin])
      g._lastCmdKey = ''
      g.updateHUD(0.016)
      const labels = Array.from(document.querySelectorAll('#command-card button')).map((b: any) =>
        b.querySelector('.btn-label')?.textContent?.trim() ?? '',
      )

      return {
        learnedBeforeDeath,
        spAfterLearn,
        queueStarted: queuedDuration > 0,
        queuedDuration,
        sameRecordRevived: g.units.includes(paladin),
        isDead: paladin.isDead ?? false,
        hp: paladin.hp,
        learnedAfterRevive: paladin.abilityLevels?.resurrection ?? 0,
        hasLearnButtonAfterMax: labels.includes('学习复活 (Lv1)'),
        hasCastButton: labels.some(label => label.includes('复活') && !label.includes('学习')),
      }
    }, { reviveTime: PALADIN_REVIVE_TIME })

    expect(result.learnedBeforeDeath).toBe(1)
    expect(result.spAfterLearn).toBe(0)
    expect(result.queueStarted).toBe(true)
    expect(result.queuedDuration).toBeGreaterThanOrEqual(PALADIN_REVIVE_TIME)
    expect(result.sameRecordRevived).toBe(true)
    expect(result.isDead).toBe(false)
    expect(result.hp).toBe(UNITS.paladin.hp)
    expect(result.learnedAfterRevive).toBe(1)
    expect(result.hasLearnButtonAfterMax).toBe(false)
    expect(result.hasCastButton).toBe(true)
  })
})
