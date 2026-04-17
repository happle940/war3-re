/**
 * V9 HERO16-AI5 AI Resurrection cast runtime proof.
 *
 * Proves the AI uses the existing Game.ts Resurrection cast path, without
 * copying target filtering, mana, cooldown, range, max-target, or revive math
 * into SimpleAI.
 */
import { test, expect, type Page } from '@playwright/test'
import { HERO_ABILITY_LEVELS, UNITS } from '../src/game/GameData'

const BASE = 'http://127.0.0.1:4173/?runtimeTest=1'
const RES_L1 = HERO_ABILITY_LEVELS.resurrection.levels[0]

async function waitForRuntime(page: Page) {
  await page.goto(BASE, { waitUntil: 'domcontentloaded' })
  await page.waitForFunction(() => {
    const game = (window as any).__war3Game
    const canvas = document.getElementById('game-canvas')
    return !!game && !!canvas && Array.isArray(game.units) && game.units.length > 0
  }, { timeout: 15000 })
  await page.evaluate(() => {
    const g = (window as any).__war3Game
    if (g?.ai && typeof g.ai.reset === 'function') g.ai.reset()
    if (g) g.deadUnitRecords = []
  })
  await page.waitForTimeout(300)
}

test.describe('V9 HERO16-AI5 AI Resurrection cast', () => {
  test.setTimeout(150000)

  test('AI5-1: AI casts learned Resurrection through the player-path numbers', async ({ page }) => {
    await waitForRuntime(page)

    const result = await page.evaluate(() => {
      const g = (window as any).__war3Game
      const ai = g.ai
      if (!ai) return { hasAI: false }

      const store = g.resources.teams?.get?.(1)
      if (store) {
        store.gold = 0
        store.lumber = 0
      }

      const paladin = g.spawnUnit('paladin', 1, 30, 30)
      paladin.heroLevel = 6
      paladin.heroSkillPoints = 0
      paladin.mana = 500
      paladin.resurrectionCooldownUntil = 0
      paladin.abilityLevels = { resurrection: 1 }

      const px = paladin.mesh.position.x
      const pz = paladin.mesh.position.z
      g.deadUnitRecords = [
        { team: 1, type: 'footman', x: px + 1, z: pz + 1, diedAt: 20 },
        { team: 1, type: 'rifleman', x: px + 2, z: pz + 1, diedAt: 10 },
        { team: 0, type: 'footman', x: px + 1, z: pz + 2, diedAt: 1 },
        { team: 1, type: 'footman', x: px + 50, z: pz + 50, diedAt: 2 },
        { team: 1, type: 'paladin', x: px + 1, z: pz + 3, diedAt: 3 },
        { team: 1, type: 'farm', x: px + 1, z: pz + 4, diedAt: 4 },
      ]

      const unitCountBefore = g.units.length
      const manaBefore = paladin.mana
      const gameTime = g.gameTime
      ai.update(1.0)

      const revived = g.units.slice(unitCountBefore).map((u: any) => ({
        team: u.team,
        type: u.type,
        x: Number(u.mesh.position.x.toFixed(1)),
        z: Number(u.mesh.position.z.toFixed(1)),
        hp: u.hp,
        maxHp: u.maxHp,
      }))

      return {
        hasAI: true,
        manaSpent: manaBefore - paladin.mana,
        cooldownRemaining: paladin.resurrectionCooldownUntil - gameTime,
        revivedCount: paladin.resurrectionLastRevivedCount ?? 0,
        revived,
        remainingRecords: g.deadUnitRecords.map((r: any) => `${r.team}:${r.type}:${r.x}:${r.z}`),
        learnedHolyLight: paladin.abilityLevels.holy_light ?? 0,
        learnedDivineShield: paladin.abilityLevels.divine_shield ?? 0,
      }
    })

    expect(result.hasAI).toBe(true)
    expect(result.manaSpent).toBe(RES_L1.mana)
    expect(result.cooldownRemaining).toBeCloseTo(RES_L1.cooldown, 1)
    expect(result.revivedCount).toBe(2)
    expect(result.revived.map((u: any) => u.type)).toEqual(['rifleman', 'footman'])
    expect(result.revived.every((u: any) => u.team === 1 && u.hp === u.maxHp)).toBe(true)
    expect(result.remainingRecords).toEqual([
      '0:footman:31.5:32.5',
      '1:footman:80.5:80.5',
      '1:paladin:31.5:33.5',
      '1:farm:31.5:34.5',
    ])
    expect(result.learnedHolyLight).toBe(0)
    expect(result.learnedDivineShield).toBe(0)
  })

  test('AI5-2: AI ignores enemy, hero, building, out-of-range, and empty records', async ({ page }) => {
    await waitForRuntime(page)

    const result = await page.evaluate(() => {
      const g = (window as any).__war3Game
      const ai = g.ai
      if (!ai) return { hasAI: false }

      const store = g.resources.teams?.get?.(1)
      if (store) {
        store.gold = 0
        store.lumber = 0
      }

      const paladin = g.spawnUnit('paladin', 1, 30, 30)
      paladin.heroLevel = 6
      paladin.heroSkillPoints = 0
      paladin.mana = 500
      paladin.resurrectionCooldownUntil = 0
      paladin.abilityLevels = { resurrection: 1 }

      const px = paladin.mesh.position.x
      const pz = paladin.mesh.position.z
      g.deadUnitRecords = [
        { team: 0, type: 'footman', x: px + 1, z: pz + 1, diedAt: 1 },
        { team: 1, type: 'footman', x: px + 50, z: pz + 50, diedAt: 2 },
        { team: 1, type: 'paladin', x: px + 1, z: pz + 1, diedAt: 3 },
        { team: 1, type: 'farm', x: px + 1, z: pz + 1, diedAt: 4 },
      ]

      const before = {
        mana: paladin.mana,
        cooldown: paladin.resurrectionCooldownUntil,
        recordCount: g.deadUnitRecords.length,
        unitCount: g.units.length,
      }

      ai.update(1.0)

      return {
        hasAI: true,
        before,
        after: {
          mana: paladin.mana,
          cooldown: paladin.resurrectionCooldownUntil,
          recordCount: g.deadUnitRecords.length,
          unitCount: g.units.length,
        },
      }
    })

    expect(result.hasAI).toBe(true)
    expect(result.after.mana).toBe(result.before.mana)
    expect(result.after.cooldown).toBe(result.before.cooldown)
    expect(result.after.recordCount).toBe(result.before.recordCount)
    expect(result.after.unitCount).toBe(result.before.unitCount)
  })

  test('AI5-3: AI respects unlearned, dead, low-mana, cooldown, and no-record gates', async ({ page }) => {
    await waitForRuntime(page)

    const result = await page.evaluate(({ manaCost }) => {
      const g = (window as any).__war3Game
      const ai = g.ai
      if (!ai) return { hasAI: false }

      const store = g.resources.teams?.get?.(1)
      if (store) {
        store.gold = 0
        store.lumber = 0
      }

      const paladin = g.spawnUnit('paladin', 1, 30, 30)
      const px = paladin.mesh.position.x
      const pz = paladin.mesh.position.z

      const runBlockedCase = (setup: () => void) => {
        paladin.isDead = false
        paladin.hp = paladin.maxHp
        paladin.heroLevel = 6
        paladin.heroSkillPoints = 0
        paladin.mana = 500
        paladin.resurrectionCooldownUntil = 0
        paladin.resurrectionLastRevivedCount = 0
        paladin.abilityLevels = { resurrection: 1 }
        g.deadUnitRecords = [{ team: 1, type: 'footman', x: px + 1, z: pz + 1, diedAt: g.gameTime }]
        setup()

        const before = {
          mana: paladin.mana,
          cooldown: paladin.resurrectionCooldownUntil,
          recordCount: g.deadUnitRecords.length,
          unitCount: g.units.length,
        }
        ai.update(1.0)
        return {
          manaChanged: paladin.mana !== before.mana,
          cooldownChanged: paladin.resurrectionCooldownUntil !== before.cooldown,
          recordCountChanged: g.deadUnitRecords.length !== before.recordCount,
          unitCountChanged: g.units.length !== before.unitCount,
        }
      }

      return {
        hasAI: true,
        unlearned: runBlockedCase(() => { paladin.abilityLevels = {} }),
        dead: runBlockedCase(() => { paladin.isDead = true }),
        lowMana: runBlockedCase(() => { paladin.mana = manaCost - 1 }),
        cooldown: runBlockedCase(() => { paladin.resurrectionCooldownUntil = g.gameTime + 10 }),
        noRecords: runBlockedCase(() => { g.deadUnitRecords = [] }),
      }
    }, { manaCost: RES_L1.mana })

    expect(result.hasAI).toBe(true)
    for (const blocked of [result.unlearned, result.dead, result.lowMana, result.cooldown, result.noRecords]) {
      expect(blocked.manaChanged).toBe(false)
      expect(blocked.cooldownChanged).toBe(false)
      expect(blocked.recordCountChanged).toBe(false)
      expect(blocked.unitCountChanged).toBe(false)
    }
  })

  test('AI5-4: real team-1 dead-unit records feed AI Resurrection once', async ({ page }) => {
    await waitForRuntime(page)

    const result = await page.evaluate(({ manaCost, cooldown, footmanHp }) => {
      const g = (window as any).__war3Game
      const ai = g.ai
      if (!ai) return { hasAI: false }

      const store = g.resources.teams?.get?.(1)
      if (store) {
        store.gold = 0
        store.lumber = 0
      }

      g.deadUnitRecords = []
      const paladin = g.spawnUnit('paladin', 1, 30, 30)
      paladin.heroLevel = 6
      paladin.heroSkillPoints = 0
      paladin.mana = 500
      paladin.resurrectionCooldownUntil = 0
      paladin.abilityLevels = { resurrection: 1 }

      const footman = g.spawnUnit('footman', 1, 31, 30)
      const neutral = g.spawnUnit('footman', -1, 32, 30)
      const deathX = Number(footman.mesh.position.x.toFixed(1))
      const deathZ = Number(footman.mesh.position.z.toFixed(1))

      footman.hp = 0
      neutral.hp = 0
      g.handleDeadUnits()
      const recordsAfterDeath = g.deadUnitRecords.map((r: any) => ({ ...r }))

      const beforeMana = paladin.mana
      const gameTime = g.gameTime
      ai.update(1.0)

      const matchingRevived = g.units.find((u: any) =>
        u !== footman &&
        u.type === 'footman' &&
        u.team === 1 &&
        Number(u.mesh.position.x.toFixed(1)) === deathX &&
        Number(u.mesh.position.z.toFixed(1)) === deathZ &&
        u.hp === footmanHp,
      )

      const afterFirst = {
        manaSpent: beforeMana - paladin.mana,
        cooldownRemaining: paladin.resurrectionCooldownUntil - gameTime,
        recordCount: g.deadUnitRecords.length,
        matchingRevived: !!matchingRevived,
      }

      const manaBeforeSecond = paladin.mana
      ai.update(1.0)

      return {
        hasAI: true,
        recordsAfterDeath,
        afterFirst,
        secondCastSpentMana: manaBeforeSecond - paladin.mana,
        expected: { manaCost, cooldown },
      }
    }, { manaCost: RES_L1.mana, cooldown: RES_L1.cooldown, footmanHp: UNITS.footman.hp })

    expect(result.hasAI).toBe(true)
    expect(result.recordsAfterDeath).toEqual([
      expect.objectContaining({ team: 1, type: 'footman' }),
    ])
    expect(result.afterFirst.manaSpent).toBe(result.expected.manaCost)
    expect(result.afterFirst.cooldownRemaining).toBeCloseTo(result.expected.cooldown, 1)
    expect(result.afterFirst.matchingRevived).toBe(true)
    expect(result.afterFirst.recordCount).toBe(0)
    expect(result.secondCastSpentMana).toBe(0)
  })
})
