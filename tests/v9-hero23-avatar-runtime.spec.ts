/**
 * V9 HERO23-AVATAR1 Avatar runtime proof.
 *
 * Proves:
 * 1. Level 6 Mountain King can learn Avatar and gets a cast button.
 * 2. Cast spends mana, starts cooldown, grants temporary HP/armor/damage and HUD state.
 * 3. Avatar spell immunity blocks hostile Mountain King spells and expiry reverts stats.
 *
 * Not final transformation visuals, sound, dispel interactions, or full magic-immune targeting matrix.
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
    // Procedural fallback is valid for runtime tests.
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

async function spawnReadyMountainKing(page: Page, learned = false): Promise<{ mkId: number }> {
  return page.evaluate((hasAvatar: boolean) => {
    const g = (window as any).__war3Game
    const mk = g.spawnUnit('mountain_king', 0, 30, 30)
    mk.heroLevel = 6
    mk.heroSkillPoints = hasAvatar ? 0 : 1
    mk.abilityLevels = hasAvatar ? { avatar: 1 } : {}
    mk.mana = 300
    mk.maxMana = Math.max(mk.maxMana ?? 0, 300)
    mk.avatarUntil = 0
    mk.avatarCooldownUntil = 0
    return { mkId: mk.__id ?? g.units.indexOf(mk) }
  }, learned)
}

test.describe('V9 HERO23-AVATAR1 Avatar runtime', () => {
  test.setTimeout(90000)

  test('AVATAR-RT-1: learning Avatar exposes the self-cast ultimate button', async ({ page }) => {
    await waitForRuntime(page)
    const setup = await spawnReadyMountainKing(page, false)

    const result = await page.evaluate((mkId: number) => {
      const g = (window as any).__war3Game
      const mk = g.units[mkId]
      g.selectionModel.clear()
      g.selectionModel.setSelection([mk])
      g._lastCmdKey = ''
      g.updateHUD(0.016)

      const learn = Array.from(document.querySelectorAll('#command-card button')).find((b: any) =>
        b.querySelector('.btn-label')?.textContent?.includes('学习化身'),
      ) as HTMLButtonElement | undefined
      learn?.click()
      g.updateHUD(0.016)

      const labels = Array.from(document.querySelectorAll('#command-card button')).map((b: any) =>
        b.querySelector('.btn-label')?.textContent?.trim() ?? '',
      )
      const stats = document.getElementById('unit-stats')?.textContent ?? ''
      return {
        learned: mk.abilityLevels?.avatar ?? 0,
        skillPoints: mk.heroSkillPoints,
        hasCast: labels.includes('化身'),
        stats,
      }
    }, setup.mkId)

    expect(result.learned).toBe(1)
    expect(result.skillPoints).toBe(0)
    expect(result.hasCast).toBe(true)
    expect(result.stats).toContain('化身')
  })

  test('AVATAR-RT-2: cast applies temporary stats, cooldown, and HUD state', async ({ page }) => {
    await waitForRuntime(page)
    const setup = await spawnReadyMountainKing(page, true)

    const result = await page.evaluate((mkId: number) => {
      const g = (window as any).__war3Game
      const mk = g.units[mkId]
      const before = {
        hp: mk.hp,
        maxHp: mk.maxHp,
        armor: mk.armor,
        attackDamage: mk.attackDamage,
        mana: mk.mana,
      }

      g.selectionModel.clear()
      g.selectionModel.setSelection([mk])
      g._lastCmdKey = ''
      g.updateHUD(0.016)
      const cast = Array.from(document.querySelectorAll('#command-card button')).find((b: any) =>
        b.querySelector('.btn-label')?.textContent?.trim() === '化身',
      ) as HTMLButtonElement | undefined
      cast?.click()
      g.updateHUD(0.016)
      const stats = document.getElementById('unit-stats')?.textContent ?? ''

      return {
        before,
        after: {
          hp: mk.hp,
          maxHp: mk.maxHp,
          armor: mk.armor,
          attackDamage: mk.attackDamage,
          mana: mk.mana,
          avatarRemaining: mk.avatarUntil - g.gameTime,
          cooldownRemaining: mk.avatarCooldownUntil - g.gameTime,
          spellImmuneRemaining: mk.spellImmuneUntil - g.gameTime,
        },
        stats,
      }
    }, setup.mkId)

    expect(result.after.mana).toBe(result.before.mana - 150)
    expect(result.after.maxHp).toBe(result.before.maxHp + 500)
    expect(result.after.hp).toBe(result.before.hp + 500)
    expect(result.after.armor).toBe(result.before.armor + 5)
    expect(result.after.attackDamage).toBe(result.before.attackDamage + 20)
    expect(result.after.avatarRemaining).toBeCloseTo(60)
    expect(result.after.cooldownRemaining).toBeCloseTo(180)
    expect(result.after.spellImmuneRemaining).toBeCloseTo(60)
    expect(result.stats).toContain('化身生效')
    expect(result.stats).toContain('魔法免疫')
  })

  test('AVATAR-RT-3: spell immunity blocks hostile MK spells and expiry reverts stats', async ({ page }) => {
    await waitForRuntime(page)
    const setup = await spawnReadyMountainKing(page, true)

    const result = await page.evaluate((mkId: number) => {
      const g = (window as any).__war3Game
      const mk = g.units[mkId]
      const before = {
        maxHp: mk.maxHp,
        armor: mk.armor,
        attackDamage: mk.attackDamage,
      }
      const castOk = g.castAvatar(mk)
      const enemyBolt = g.spawnUnit('mountain_king', 1, mk.mesh.position.x + 1, mk.mesh.position.z)
      enemyBolt.abilityLevels = { storm_bolt: 1 }
      enemyBolt.mana = 300
      const boltManaBefore = enemyBolt.mana
      const boltOk = g.castStormBolt(enemyBolt, mk)

      const enemyClap = g.spawnUnit('mountain_king', 1, mk.mesh.position.x + 1, mk.mesh.position.z + 0.5)
      enemyClap.abilityLevels = { thunder_clap: 1 }
      enemyClap.mana = 300
      const clapManaBefore = enemyClap.mana
      const clapOk = g.castThunderClap(enemyClap)

      const active = {
        hp: mk.hp,
        maxHp: mk.maxHp,
        armor: mk.armor,
        attackDamage: mk.attackDamage,
        spellImmuneUntil: mk.spellImmuneUntil,
        boltOk,
        boltManaAfter: enemyBolt.mana,
        boltManaBefore,
        clapOk,
        clapManaAfter: enemyClap.mana,
        clapManaBefore,
      }

      g.gameTime = mk.avatarUntil + 0.1
      g.updateAvatarExpiry()
      return {
        castOk,
        before,
        active,
        expired: {
          hp: mk.hp,
          maxHp: mk.maxHp,
          armor: mk.armor,
          attackDamage: mk.attackDamage,
          avatarUntil: mk.avatarUntil,
          spellImmuneUntil: mk.spellImmuneUntil,
        },
      }
    }, setup.mkId)

    expect(result.castOk).toBe(true)
    expect(result.active.boltOk).toBe(false)
    expect(result.active.boltManaAfter).toBe(result.active.boltManaBefore)
    expect(result.active.clapOk).toBe(false)
    expect(result.active.clapManaAfter).toBe(result.active.clapManaBefore)
    expect(result.expired.maxHp).toBe(result.before.maxHp)
    expect(result.expired.hp).toBe(result.before.maxHp)
    expect(result.expired.armor).toBe(result.before.armor)
    expect(result.expired.attackDamage).toBe(result.before.attackDamage)
    expect(result.expired.avatarUntil).toBe(0)
    expect(result.expired.spellImmuneUntil).toBe(0)
  })
})
