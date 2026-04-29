/**
 * V9 HERO23-BASH1 Bash passive runtime proof.
 *
 * Proves:
 * 1. Mountain King can learn Bash and HUD shows the passive level.
 * 2. A forced Bash proc during a real attack damage path adds bonus damage and stun.
 * 3. Non-proc/failure paths do not mutate friendly or building targets.
 *
 * Not Avatar, Mountain King AI, final visuals, sound, or probability distribution testing.
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
  return page.evaluate((hasBash: boolean) => {
    const g = (window as any).__war3Game
    const mk = g.spawnUnit('mountain_king', 0, 30, 30)
    mk.heroLevel = 1
    mk.heroSkillPoints = hasBash ? 0 : 1
    mk.abilityLevels = hasBash ? { bash: 1 } : {}
    mk.attackTimer = 0
    return { mkId: mk.__id ?? g.units.indexOf(mk) }
  }, learned)
}

test.describe('V9 HERO23-BASH1 Bash passive runtime', () => {
  test.setTimeout(90000)

  test('BASH-RT-1: learning Bash consumes a skill point and shows passive HUD state', async ({ page }) => {
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
        b.querySelector('.btn-label')?.textContent?.includes('学习猛击'),
      ) as HTMLButtonElement | undefined
      learn?.click()
      g.updateHUD(0.016)

      const labels = Array.from(document.querySelectorAll('#command-card button')).map((b: any) =>
        b.querySelector('.btn-label')?.textContent?.trim() ?? '',
      )
      const stats = document.getElementById('unit-stats')?.textContent ?? ''
      return {
        learned: mk.abilityLevels?.bash ?? 0,
        skillPoints: mk.heroSkillPoints,
        hasPassiveCastButton: labels.some(label => label.startsWith('猛击 (Lv')),
        stats,
      }
    }, setup.mkId)

    expect(result.learned).toBe(1)
    expect(result.skillPoints).toBe(0)
    expect(result.hasPassiveCastButton).toBe(false)
    expect(result.stats).toContain('猛击 Lv1')
  })

  test('BASH-RT-2: forced proc adds Bash bonus damage and stun through the real attack path', async ({ page }) => {
    await waitForRuntime(page)
    const setup = await spawnReadyMountainKing(page, true)

    const result = await page.evaluate((mkId: number) => {
      const g = (window as any).__war3Game
      const mk = g.units[mkId]
      const baselineTarget = g.spawnUnit('footman', 1, mk.mesh.position.x + 1, mk.mesh.position.z)
      const bashTarget = g.spawnUnit('footman', 1, mk.mesh.position.x + 1, mk.mesh.position.z + 0.5)
      baselineTarget.hp = 600
      bashTarget.hp = 600

      const learned = mk.abilityLevels
      mk.abilityLevels = {}
      const baselineBefore = baselineTarget.hp
      g.dealDamage(mk, baselineTarget)
      const baselineDamage = baselineBefore - baselineTarget.hp

      mk.abilityLevels = learned
      const originalRandom = Math.random
      const bashBefore = bashTarget.hp
      try {
        Math.random = () => 0
        g.dealDamage(mk, bashTarget)
      } finally {
        Math.random = originalRandom
      }

      return {
        baselineDamage,
        bashDamage: bashBefore - bashTarget.hp,
        stunRemaining: bashTarget.stunUntil - g.gameTime,
        attackTimer: bashTarget.attackTimer,
      }
    }, setup.mkId)

    expect(result.baselineDamage).toBeGreaterThan(0)
    expect(result.bashDamage).toBe(result.baselineDamage + 25)
    expect(result.stunRemaining).toBeCloseTo(2)
    expect(result.attackTimer).toBe(2)
  })

  test('BASH-RT-3: failed proc and invalid targets do not receive Bash stun', async ({ page }) => {
    await waitForRuntime(page)
    const setup = await spawnReadyMountainKing(page, true)

    const result = await page.evaluate((mkId: number) => {
      const g = (window as any).__war3Game
      const mk = g.units[mkId]
      const enemy = g.spawnUnit('footman', 1, mk.mesh.position.x + 1, mk.mesh.position.z)
      const friendly = g.spawnUnit('footman', 0, mk.mesh.position.x + 1, mk.mesh.position.z + 0.5)
      const building = g.spawnBuilding('farm', 1, mk.mesh.position.x + 1, mk.mesh.position.z - 0.5)
      enemy.hp = 600
      friendly.hp = 600
      building.hp = 600

      const originalRandom = Math.random
      try {
        Math.random = () => 0.99
        g.dealDamage(mk, enemy)
        Math.random = () => 0
        g.dealDamage(mk, friendly)
        g.dealDamage(mk, building)
      } finally {
        Math.random = originalRandom
      }

      return {
        enemyStun: enemy.stunUntil,
        friendlyStun: friendly.stunUntil,
        buildingStun: building.stunUntil,
      }
    }, setup.mkId)

    expect(result.enemyStun).toBe(0)
    expect(result.friendlyStun).toBe(0)
    expect(result.buildingStun).toBe(0)
  })
})
