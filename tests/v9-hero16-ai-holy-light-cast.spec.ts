/**
 * V9 HERO16-AI3 AI Holy Light defensive cast runtime proof.
 *
 * Proves the AI uses the existing Game.ts Holy Light cast path, without
 * opening Divine Shield AI, Resurrection AI, other heroes, items, shops,
 * assets, or broad AI tactics.
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

test.describe('V9 HERO16-AI3 AI Holy Light defensive cast', () => {
  test.setTimeout(150000)

  test('AI3-1: AI casts learned Holy Light on an injured friendly and uses player-path numbers', async ({ page }) => {
    await waitForRuntime(page)

    const result = await page.evaluate(() => {
      const g = (window as any).__war3Game
      const ai = g.ai
      if (!ai) return { hasAI: false }

      const paladin = g.spawnUnit('paladin', 1, 30, 30)
      paladin.abilityLevels = { holy_light: 1 }
      paladin.heroSkillPoints = 0
      paladin.mana = 255
      paladin.healCooldownUntil = 0
      paladin.isDead = false

      const footman = g.spawnUnit('footman', 1, 31, 30)
      footman.hp = Math.max(1, footman.maxHp - 250)

      const beforeHp = footman.hp
      const beforeMana = paladin.mana
      const beforeCooldown = paladin.healCooldownUntil
      const gameTime = g.gameTime

      ai.update(1.0)

      return {
        hasAI: true,
        healed: footman.hp - beforeHp,
        hpAfter: footman.hp,
        maxHp: footman.maxHp,
        manaSpent: beforeMana - paladin.mana,
        cooldownBefore: beforeCooldown,
        cooldownRemaining: paladin.healCooldownUntil - gameTime,
        learned: paladin.abilityLevels.holy_light,
        divine: paladin.abilityLevels.divine_shield ?? 0,
        resurrection: paladin.abilityLevels.resurrection ?? 0,
      }
    })

    expect(result.hasAI).toBe(true)
    expect(result.learned).toBe(1)
    expect(result.healed).toBeGreaterThan(0)
    expect(result.hpAfter).toBeLessThanOrEqual(result.maxHp)
    expect(result.manaSpent).toBe(65)
    expect(result.cooldownBefore).toBe(0)
    expect(result.cooldownRemaining).toBeCloseTo(5, 1)
    expect(result.divine).toBe(0)
    expect(result.resurrection).toBe(0)
  })

  test('AI3-2: AI does not cast Holy Light on self, enemies, buildings, full-health, or out-of-range units', async ({ page }) => {
    await waitForRuntime(page)

    const result = await page.evaluate(() => {
      const g = (window as any).__war3Game
      const ai = g.ai
      if (!ai) return { hasAI: false }

      const paladin = g.spawnUnit('paladin', 1, 30, 30)
      paladin.abilityLevels = { holy_light: 1 }
      paladin.heroSkillPoints = 0
      paladin.mana = 255
      paladin.healCooldownUntil = 0
      paladin.hp = Math.max(1, paladin.maxHp - 200)

      const enemy = g.spawnUnit('footman', 0, 31, 30)
      enemy.hp = Math.max(1, enemy.maxHp - 200)

      const fullFriend = g.spawnUnit('footman', 1, 32, 30)
      fullFriend.hp = fullFriend.maxHp

      const farFriend = g.spawnUnit('footman', 1, 80, 80)
      farFriend.hp = Math.max(1, farFriend.maxHp - 200)

      const farm = g.spawnBuilding('farm', 1, 33, 30)
      farm.buildProgress = 1
      farm.hp = Math.max(1, farm.maxHp - 200)

      const before = {
        selfHp: paladin.hp,
        enemyHp: enemy.hp,
        fullFriendHp: fullFriend.hp,
        farFriendHp: farFriend.hp,
        farmHp: farm.hp,
        mana: paladin.mana,
        cooldown: paladin.healCooldownUntil,
      }

      ai.update(1.0)

      return {
        hasAI: true,
        before,
        after: {
          selfHp: paladin.hp,
          enemyHp: enemy.hp,
          fullFriendHp: fullFriend.hp,
          farFriendHp: farFriend.hp,
          farmHp: farm.hp,
          mana: paladin.mana,
          cooldown: paladin.healCooldownUntil,
        },
      }
    })

    expect(result.hasAI).toBe(true)
    expect(result.after.selfHp).toBe(result.before.selfHp)
    expect(result.after.enemyHp).toBe(result.before.enemyHp)
    expect(result.after.fullFriendHp).toBe(result.before.fullFriendHp)
    expect(result.after.farFriendHp).toBe(result.before.farFriendHp)
    expect(result.after.farmHp).toBe(result.before.farmHp)
    expect(result.after.mana).toBe(result.before.mana)
    expect(result.after.cooldown).toBe(result.before.cooldown)
  })

  test('AI3-3: AI respects unlearned, dead, low-mana, and cooldown gates', async ({ page }) => {
    await waitForRuntime(page)

    const result = await page.evaluate(() => {
      const g = (window as any).__war3Game
      const ai = g.ai
      if (!ai) return { hasAI: false }

      const paladin = g.spawnUnit('paladin', 1, 30, 30)
      const target = g.spawnUnit('footman', 1, 31, 30)

      const runBlockedCase = (setup: () => void) => {
        paladin.isDead = false
        paladin.hp = paladin.maxHp
        paladin.heroSkillPoints = 0
        paladin.mana = 255
        paladin.healCooldownUntil = 0
        paladin.abilityLevels = { holy_light: 1 }
        target.hp = Math.max(1, target.maxHp - 220)
        setup()

        const beforeHp = target.hp
        const beforeMana = paladin.mana
        const beforeCooldown = paladin.healCooldownUntil
        ai.update(1.0)

        return {
          hpChanged: target.hp !== beforeHp,
          manaChanged: paladin.mana !== beforeMana,
          cooldownChanged: paladin.healCooldownUntil !== beforeCooldown,
        }
      }

      return {
        hasAI: true,
        unlearned: runBlockedCase(() => { paladin.abilityLevels = {} }),
        lowMana: runBlockedCase(() => { paladin.mana = 10 }),
        cooldown: runBlockedCase(() => { paladin.healCooldownUntil = g.gameTime + 10 }),
        dead: runBlockedCase(() => { paladin.isDead = true }),
      }
    })

    expect(result.hasAI).toBe(true)
    for (const blocked of [result.unlearned, result.lowMana, result.cooldown, result.dead]) {
      expect(blocked.hpChanged).toBe(false)
      expect(blocked.manaChanged).toBe(false)
      expect(blocked.cooldownChanged).toBe(false)
    }
  })
})
