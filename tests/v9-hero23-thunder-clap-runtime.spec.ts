/**
 * V9 HERO23-THUNDER3 Thunder Clap minimal runtime proof.
 *
 * Proves:
 * 1. Mountain King can learn Thunder Clap and gets a cast button.
 * 2. Successful cast spends mana, starts cooldown, and damages/slows valid enemies.
 * 3. Failure paths have no side effects.
 * 4. Cooldown and slowed target state are visible in the HUD.
 *
 * Not Bash, Avatar, Mountain King AI, air-unit filtering, final visuals, or sound.
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
  return page.evaluate((hasThunderClap: boolean) => {
    const g = (window as any).__war3Game
    const mk = g.spawnUnit('mountain_king', 0, 30, 30)
    mk.heroLevel = 1
    mk.heroSkillPoints = hasThunderClap ? 0 : 1
    mk.abilityLevels = hasThunderClap ? { thunder_clap: 1 } : {}
    mk.mana = 200
    mk.maxMana = Math.max(mk.maxMana ?? 0, 200)
    mk.thunderClapCooldownUntil = 0
    return { mkId: mk.__id ?? g.units.indexOf(mk) }
  }, learned)
}

test.describe('V9 HERO23-THUNDER3 Thunder Clap minimal runtime', () => {
  test.setTimeout(90000)

  test('TC-RT-1: learning Thunder Clap exposes a cast button and stats label', async ({ page }) => {
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
        b.querySelector('.btn-label')?.textContent?.includes('学习雷霆一击'),
      ) as HTMLButtonElement | undefined
      learn?.click()
      g.updateHUD(0.016)

      const labels = Array.from(document.querySelectorAll('#command-card button')).map((b: any) =>
        b.querySelector('.btn-label')?.textContent?.trim() ?? '',
      )
      const stats = document.getElementById('unit-stats')?.textContent ?? ''
      return {
        learned: mk.abilityLevels?.thunder_clap ?? 0,
        hasCast: labels.some(label => label.startsWith('雷霆一击 (Lv1)')),
        stats,
      }
    }, setup.mkId)

    expect(result.learned).toBe(1)
    expect(result.hasCast).toBe(true)
    expect(result.stats).toContain('雷霆一击 Lv1')
  })

  test('TC-RT-2: successful Thunder Clap damages and slows only nearby enemy non-buildings', async ({ page }) => {
    await waitForRuntime(page)
    const setup = await spawnReadyMountainKing(page, true)

    const result = await page.evaluate((mkId: number) => {
      const g = (window as any).__war3Game
      const mk = g.units[mkId]
      const enemy = g.spawnUnit('footman', 1, mk.mesh.position.x + 1, mk.mesh.position.z)
      const enemyHero = g.spawnUnit('paladin', 1, mk.mesh.position.x + 1, mk.mesh.position.z)
      const friendly = g.spawnUnit('footman', 0, mk.mesh.position.x + 1, mk.mesh.position.z + 1)
      const farm = g.spawnBuilding('farm', 1, mk.mesh.position.x + 1, mk.mesh.position.z - 1)
      const farEnemy = g.spawnUnit('footman', 1, mk.mesh.position.x + 6, mk.mesh.position.z)

      enemy.hp = 420
      enemyHero.hp = 500
      friendly.hp = 420
      farm.hp = 420
      farEnemy.hp = 420
      const manaBefore = mk.mana
      const castTime = g.gameTime
      const ok = g.castThunderClap(mk)

      return {
        ok,
        manaDelta: manaBefore - mk.mana,
        cooldown: mk.thunderClapCooldownUntil - castTime,
        enemyHp: enemy.hp,
        enemySlowRemaining: enemy.slowUntil - castTime,
        enemyAttackSlowRemaining: enemy.attackSlowUntil - castTime,
        enemyMoveMultiplier: enemy.slowSpeedMultiplier,
        enemyAttackMultiplier: enemy.attackSpeedMultiplier,
        enemyHeroHp: enemyHero.hp,
        enemyHeroSlowRemaining: enemyHero.slowUntil - castTime,
        friendlyHp: friendly.hp,
        farmHp: farm.hp,
        farEnemyHp: farEnemy.hp,
      }
    }, setup.mkId)

    expect(result.ok).toBe(true)
    expect(result.manaDelta).toBe(90)
    expect(result.cooldown).toBe(6)
    expect(result.enemyHp).toBe(360)
    expect(result.enemySlowRemaining).toBeCloseTo(5)
    expect(result.enemyAttackSlowRemaining).toBeCloseTo(5)
    expect(result.enemyMoveMultiplier).toBe(0.5)
    expect(result.enemyAttackMultiplier).toBe(0.5)
    expect(result.enemyHeroHp).toBe(440)
    expect(result.enemyHeroSlowRemaining).toBeCloseTo(3)
    expect(result.friendlyHp).toBe(420)
    expect(result.farmHp).toBe(420)
    expect(result.farEnemyHp).toBe(420)
  })

  test('TC-RT-3: failure paths do not spend mana or start cooldown', async ({ page }) => {
    await waitForRuntime(page)
    const setup = await spawnReadyMountainKing(page, true)

    const result = await page.evaluate((mkId: number) => {
      const g = (window as any).__war3Game
      const mk = g.units[mkId]
      const friendly = g.spawnUnit('footman', 0, mk.mesh.position.x + 1, mk.mesh.position.z)

      const noTargetManaBefore = mk.mana
      const noTarget = g.castThunderClap(mk)
      const noTargetManaAfter = mk.mana
      const noTargetCooldown = mk.thunderClapCooldownUntil

      const enemy = g.spawnUnit('footman', 1, mk.mesh.position.x + 1, mk.mesh.position.z)
      mk.mana = 10
      const lowMana = g.castThunderClap(mk)

      mk.mana = 200
      mk.thunderClapCooldownUntil = g.gameTime + 6
      const cooldown = g.castThunderClap(mk)

      return {
        friendlyHp: friendly.hp,
        noTarget,
        noTargetManaBefore,
        noTargetManaAfter,
        noTargetCooldown,
        lowMana,
        cooldown,
        enemyHp: enemy.hp,
      }
    }, setup.mkId)

    expect(result.friendlyHp).toBeGreaterThan(0)
    expect(result.noTarget).toBe(false)
    expect(result.noTargetManaAfter).toBe(result.noTargetManaBefore)
    expect(result.noTargetCooldown).toBe(0)
    expect(result.lowMana).toBe(false)
    expect(result.cooldown).toBe(false)
    expect(result.enemyHp).toBeGreaterThan(0)
  })

  test('TC-RT-4: HUD shows Thunder Clap cooldown and slowed target state', async ({ page }) => {
    await waitForRuntime(page)
    const setup = await spawnReadyMountainKing(page, true)

    const result = await page.evaluate((mkId: number) => {
      const g = (window as any).__war3Game
      const mk = g.units[mkId]
      const enemy = g.spawnUnit('footman', 1, mk.mesh.position.x + 1, mk.mesh.position.z)
      g.castThunderClap(mk)

      g.selectionModel.clear()
      g.selectionModel.setSelection([mk])
      g._lastCmdKey = ''
      g.updateHUD(0.016)
      const mkStats = document.getElementById('unit-stats')?.textContent ?? ''

      g.selectionModel.clear()
      g.selectionModel.setSelection([enemy])
      g.updateHUD(0.016)
      const enemyStats = document.getElementById('unit-stats')?.textContent ?? ''

      return { mkStats, enemyStats }
    }, setup.mkId)

    expect(result.mkStats).toContain('雷霆一击冷却')
    expect(result.enemyStats).toContain('减速')
  })
})
