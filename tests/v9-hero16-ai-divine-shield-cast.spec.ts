/**
 * V9 HERO16-AI4 AI Divine Shield self-preservation runtime proof.
 *
 * Proves the AI uses the existing Game.ts Divine Shield cast path, without
 * opening Resurrection AI, other heroes, items, shops, assets, or broad AI
 * tactics.
 */
import { test, expect, type Page } from '@playwright/test'

const BASE = 'http://127.0.0.1:4173/?runtimeTest=1'

async function waitForRuntime(page: Page) {
  await page.goto(BASE, { waitUntil: 'domcontentloaded' })
  await page.waitForFunction(() => {
    const game = (window as any).__war3Game
    const canvas = document.getElementById('game-canvas')
    return !!game && !!canvas && Array.isArray(game.units) && game.units.length > 0
  }, { timeout: 15000 })
  await page.waitForTimeout(300)
}

test.describe('V9 HERO16-AI4 AI Divine Shield self-preservation', () => {
  test.setTimeout(150000)

  test('AI4-1: AI casts learned Divine Shield on low HP Paladin using player-path numbers', async ({ page }) => {
    await waitForRuntime(page)

    const result = await page.evaluate(() => {
      const g = (window as any).__war3Game
      const ai = g.ai
      if (!ai) return { hasAI: false }

      const paladin = g.spawnUnit('paladin', 1, 30, 30)
      paladin.abilityLevels = { divine_shield: 1 }
      paladin.heroSkillPoints = 0
      paladin.mana = 255
      paladin.hp = Math.max(1, Math.floor(paladin.maxHp * 0.3))
      paladin.divineShieldUntil = 0
      paladin.divineShieldCooldownUntil = 0
      paladin.isDead = false

      const beforeMana = paladin.mana
      const beforeActive = paladin.divineShieldUntil
      const beforeCooldown = paladin.divineShieldCooldownUntil
      const gameTime = g.gameTime

      ai.update(1.0)

      return {
        hasAI: true,
        manaSpent: beforeMana - paladin.mana,
        activeBefore: beforeActive,
        cooldownBefore: beforeCooldown,
        activeRemaining: paladin.divineShieldUntil - gameTime,
        cooldownRemaining: paladin.divineShieldCooldownUntil - gameTime,
        learned: paladin.abilityLevels.divine_shield,
        holyLight: paladin.abilityLevels.holy_light ?? 0,
        resurrection: paladin.abilityLevels.resurrection ?? 0,
      }
    })

    expect(result.hasAI).toBe(true)
    expect(result.learned).toBe(1)
    expect(result.manaSpent).toBe(25)
    expect(result.activeBefore).toBe(0)
    expect(result.cooldownBefore).toBe(0)
    expect(result.activeRemaining).toBeCloseTo(15, 1)
    expect(result.cooldownRemaining).toBeCloseTo(35, 1)
    expect(result.holyLight).toBe(0)
    expect(result.resurrection).toBe(0)
  })

  test('AI4-2: AI does not cast Divine Shield while Paladin HP is still high', async ({ page }) => {
    await waitForRuntime(page)

    const result = await page.evaluate(() => {
      const g = (window as any).__war3Game
      const ai = g.ai
      if (!ai) return { hasAI: false }

      const paladin = g.spawnUnit('paladin', 1, 30, 30)
      paladin.abilityLevels = { divine_shield: 1 }
      paladin.heroSkillPoints = 0
      paladin.mana = 255
      paladin.hp = Math.floor(paladin.maxHp * 0.8)
      paladin.divineShieldUntil = 0
      paladin.divineShieldCooldownUntil = 0

      const before = {
        mana: paladin.mana,
        active: paladin.divineShieldUntil,
        cooldown: paladin.divineShieldCooldownUntil,
      }

      ai.update(1.0)

      return {
        hasAI: true,
        before,
        after: {
          mana: paladin.mana,
          active: paladin.divineShieldUntil,
          cooldown: paladin.divineShieldCooldownUntil,
        },
      }
    })

    expect(result.hasAI).toBe(true)
    expect(result.after.mana).toBe(result.before.mana)
    expect(result.after.active).toBe(result.before.active)
    expect(result.after.cooldown).toBe(result.before.cooldown)
  })

  test('AI4-3: AI respects unlearned, dead, low-mana, and cooldown gates', async ({ page }) => {
    await waitForRuntime(page)

    const result = await page.evaluate(() => {
      const g = (window as any).__war3Game
      const ai = g.ai
      if (!ai) return { hasAI: false }

      const paladin = g.spawnUnit('paladin', 1, 30, 30)

      const runBlockedCase = (setup: () => void) => {
        paladin.isDead = false
        paladin.hp = Math.max(1, Math.floor(paladin.maxHp * 0.3))
        paladin.heroSkillPoints = 0
        paladin.mana = 255
        paladin.divineShieldUntil = 0
        paladin.divineShieldCooldownUntil = 0
        paladin.abilityLevels = { divine_shield: 1 }
        setup()

        const beforeMana = paladin.mana
        const beforeActive = paladin.divineShieldUntil
        const beforeCooldown = paladin.divineShieldCooldownUntil
        ai.update(1.0)

        return {
          manaChanged: paladin.mana !== beforeMana,
          activeChanged: paladin.divineShieldUntil !== beforeActive,
          cooldownChanged: paladin.divineShieldCooldownUntil !== beforeCooldown,
        }
      }

      return {
        hasAI: true,
        unlearned: runBlockedCase(() => { paladin.abilityLevels = {} }),
        dead: runBlockedCase(() => { paladin.isDead = true }),
        lowMana: runBlockedCase(() => { paladin.mana = 10 }),
        cooldown: runBlockedCase(() => { paladin.divineShieldCooldownUntil = g.gameTime + 10 }),
      }
    })

    expect(result.hasAI).toBe(true)
    for (const blocked of [result.unlearned, result.dead, result.lowMana, result.cooldown]) {
      expect(blocked.manaChanged).toBe(false)
      expect(blocked.activeChanged).toBe(false)
      expect(blocked.cooldownChanged).toBe(false)
    }
  })
})
