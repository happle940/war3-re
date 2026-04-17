/**
 * V9 HERO13-IMPL1 Devotion Aura minimal passive aura runtime proof.
 *
 * Proves:
 * 1. Learned Devotion Aura grants data-driven armor to Paladin self and friendly units in radius 9.0.
 * 2. Enemies and buildings are unaffected.
 * 3. Leaving range removes the bonus, entering range grants it, and repeated ticks do not stack.
 * 4. Existing research armor remains intact under and after the temporary aura bonus.
 * 5. Paladin death stops the aura; revive restores it only after the Paladin is alive again.
 * 6. After UX1, Devotion Aura remains passive: HUD feedback may exist, but no cast button is exposed.
 *
 * Not: cast buttons, particles, sounds, AI,
 * buildings as aura targets, air units, other heroes, Resurrection, assets.
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

test.describe('V9 HERO13-IMPL1 Devotion Aura minimal passive aura runtime', () => {
  test.setTimeout(180000)

  test('AURA-1: learned Lv1 grants armor to self and nearby friendly unit, not enemy or building', async ({ page }) => {
    await waitForRuntime(page)

    const result = await page.evaluate(() => {
      const g = (window as any).__war3Game
      const paladin = g.spawnUnit('paladin', 0, 30, 30)
      paladin.abilityLevels = { ...(paladin.abilityLevels ?? {}), devotion_aura: 1 }
      const footman = g.spawnUnit('footman', 0, 35, 30)
      const enemy = g.spawnUnit('footman', 1, 34, 30)
      const farm = g.spawnBuilding('farm', 0, 32, 30)

      const before = {
        paladin: paladin.armor,
        footman: footman.armor,
        enemy: enemy.armor,
        farm: farm.armor,
      }

      g.update(0.1)

      return {
        before,
        after: {
          paladin: paladin.armor,
          footman: footman.armor,
          enemy: enemy.armor,
          farm: farm.armor,
        },
        flags: {
          paladinBonus: paladin.devotionAuraBonus,
          footmanBonus: footman.devotionAuraBonus,
          enemyBonus: enemy.devotionAuraBonus,
          farmBonus: farm.devotionAuraBonus,
        },
      }
    })

    const bonus = DA.levels[0].armorBonus!
    expect(result.after.paladin).toBeCloseTo(result.before.paladin + bonus, 5)
    expect(result.after.footman).toBeCloseTo(result.before.footman + bonus, 5)
    expect(result.after.enemy).toBe(result.before.enemy)
    expect(result.after.farm).toBe(result.before.farm)
    expect(result.flags.paladinBonus).toBeCloseTo(bonus, 5)
    expect(result.flags.footmanBonus).toBeCloseTo(bonus, 5)
    expect(result.flags.enemyBonus).toBe(0)
    expect(result.flags.farmBonus).toBe(0)
  })

  test('AURA-2: Lv2 range changes remove/reapply bonus and repeated ticks do not stack', async ({ page }) => {
    await waitForRuntime(page)

    const result = await page.evaluate(() => {
      const g = (window as any).__war3Game
      const paladin = g.spawnUnit('paladin', 0, 30, 30)
      paladin.abilityLevels = { ...(paladin.abilityLevels ?? {}), devotion_aura: 2 }
      const footman = g.spawnUnit('footman', 0, 35, 30)
      const baseArmor = footman.armor

      g.update(0.1)
      const firstTickArmor = footman.armor
      g.update(0.1)
      const secondTickArmor = footman.armor

      footman.mesh.position.set(50, footman.mesh.position.y, 30)
      g.update(0.1)
      const outOfRangeArmor = footman.armor
      const outOfRangeBonus = footman.devotionAuraBonus

      footman.mesh.position.set(38, footman.mesh.position.y, 30)
      g.update(0.1)
      const reenteredArmor = footman.armor
      const reenteredBonus = footman.devotionAuraBonus

      return {
        baseArmor,
        firstTickArmor,
        secondTickArmor,
        outOfRangeArmor,
        outOfRangeBonus,
        reenteredArmor,
        reenteredBonus,
      }
    })

    const bonus = DA.levels[1].armorBonus!
    expect(result.firstTickArmor).toBeCloseTo(result.baseArmor + bonus, 5)
    expect(result.secondTickArmor).toBeCloseTo(result.baseArmor + bonus, 5)
    expect(result.outOfRangeArmor).toBeCloseTo(result.baseArmor, 5)
    expect(result.outOfRangeBonus).toBe(0)
    expect(result.reenteredArmor).toBeCloseTo(result.baseArmor + bonus, 5)
    expect(result.reenteredBonus).toBeCloseTo(bonus, 5)
  })

  test('AURA-3: existing armor research remains after temporary aura removal', async ({ page }) => {
    await waitForRuntime(page)

    const result = await page.evaluate(() => {
      const g = (window as any).__war3Game
      g.resources.earn(0, 10000, 10000)
      const blacksmith = g.spawnBuilding('blacksmith', 0, 42, 42)
      const footman = g.spawnUnit('footman', 0, 35, 30)
      const baseArmor = footman.armor

      g.startResearch(blacksmith, 'iron_plating')
      blacksmith.researchQueue[0].remaining = 0.001
      g.update(0.1)
      const researchedArmor = footman.armor

      const paladin = g.spawnUnit('paladin', 0, 30, 30)
      paladin.abilityLevels = { ...(paladin.abilityLevels ?? {}), devotion_aura: 1 }
      g.update(0.1)
      const auraArmor = footman.armor

      footman.mesh.position.set(50, footman.mesh.position.y, 30)
      g.update(0.1)
      const restoredArmor = footman.armor

      return { baseArmor, researchedArmor, auraArmor, restoredArmor }
    })

    const bonus = DA.levels[0].armorBonus!
    expect(result.researchedArmor).toBeCloseTo(result.baseArmor + 2, 5)
    expect(result.auraArmor).toBeCloseTo(result.researchedArmor + bonus, 5)
    expect(result.restoredArmor).toBeCloseTo(result.researchedArmor, 5)
  })

  test('AURA-4: Paladin death stops aura, revive restores it after alive again', async ({ page }) => {
    await waitForRuntime(page)

    const result = await page.evaluate(() => {
      const g = (window as any).__war3Game
      g.resources.earn(0, 10000, 10000)
      const altar = g.spawnBuilding('altar_of_kings', 0, 15, 15)
      const paladin = g.spawnUnit('paladin', 0, 30, 30)
      paladin.abilityLevels = { ...(paladin.abilityLevels ?? {}), devotion_aura: 3 }
      const footman = g.spawnUnit('footman', 0, 35, 30)
      const baseArmor = footman.armor

      g.update(0.1)
      const aliveAuraArmor = footman.armor

      paladin.hp = 0
      g.handleDeadUnits()
      g.update(0.1)
      const afterDeathArmor = footman.armor
      const afterDeathBonus = footman.devotionAuraBonus

      g.startReviveHero(altar, 'paladin')
      altar.reviveQueue[0].remaining = 0.001
      g.update(0.1)
      footman.mesh.position.set(paladin.mesh.position.x + 1, footman.mesh.position.y, paladin.mesh.position.z)
      g.update(0.1)

      return {
        baseArmor,
        aliveAuraArmor,
        afterDeathArmor,
        afterDeathBonus,
        revivedAlive: paladin.isDead === false && paladin.hp > 0,
        learnedLevel: paladin.abilityLevels?.devotion_aura ?? 0,
        afterReviveArmor: footman.armor,
        afterReviveBonus: footman.devotionAuraBonus,
      }
    })

    const bonus = DA.levels[2].armorBonus!
    expect(result.aliveAuraArmor).toBeCloseTo(result.baseArmor + bonus, 5)
    expect(result.afterDeathArmor).toBeCloseTo(result.baseArmor, 5)
    expect(result.afterDeathBonus).toBe(0)
    expect(result.revivedAlive).toBe(true)
    expect(result.learnedLevel).toBe(3)
    expect(result.afterReviveArmor).toBeCloseTo(result.baseArmor + bonus, 5)
    expect(result.afterReviveBonus).toBeCloseTo(bonus, 5)
  })

  test('AURA-5: passive aura still has no cast button after UX feedback is added', async ({ page }) => {
    await waitForRuntime(page)

    const result = await page.evaluate(() => {
      const g = (window as any).__war3Game
      const paladin = g.spawnUnit('paladin', 0, 30, 30)
      paladin.abilityLevels = { ...(paladin.abilityLevels ?? {}), devotion_aura: 1 }

      g.selectionModel.clear()
      g.selectionModel.setSelection([paladin])
      g._lastCmdKey = ''
      g.updateHUD(0.016)

      const buttonLabels = Array.from(document.querySelectorAll('#command-card button')).map((b: any) =>
        b.querySelector('.btn-label')?.textContent?.trim() ?? '',
      )
      const statsText = document.querySelector('#unit-stats')?.textContent ?? ''

      return {
        buttonLabels,
        statsText,
        hasDevotionCastButton: buttonLabels.some(label =>
          (label.includes('虔诚') || label.includes('Devotion')) && !label.includes('学习'),
        ),
        hasPassiveHudFeedback: statsText.includes('虔诚光环 Lv'),
      }
    })

    expect(result.hasDevotionCastButton).toBe(false)
    expect(result.hasPassiveHudFeedback).toBe(true)
  })
})
