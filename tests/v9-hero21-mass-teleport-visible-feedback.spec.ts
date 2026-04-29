/**
 * V9 HERO21-UX1 Mass Teleport visible feedback proof.
 *
 * Scope:
 * - Unit panel shows learned Mass Teleport level.
 * - Command card shows disabled reasons for blocked casts.
 * - Target mode hint is player-readable.
 * - Pending state shows remaining delay time.
 * - Cooldown shows remaining time in unit panel and command button.
 * - Completion produces lightweight existing feedback (impact ring, no damage number).
 * - Invalid targets do not produce success feedback.
 * - Existing WE/BA/Blizzard UI remains intact.
 * - Mass Teleport remains HERO_ABILITY_LEVELS-driven, not ABILITIES-driven.
 */
import { test, expect, type Page } from '@playwright/test'
import { readFileSync } from 'node:fs'
import {
  ABILITIES,
  HERO_ABILITY_LEVELS,
} from '../src/game/GameData'

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
    ;(window as any).__cmdButton = (label: string) =>
      Array.from(document.querySelectorAll('#command-card button')).find((b: any) =>
        b.querySelector('.btn-label')?.textContent?.trim() === label,
      ) as HTMLButtonElement | undefined
    ;(window as any).__cmdButtonIncludes = (fragment: string) =>
      Array.from(document.querySelectorAll('#command-card button')).find((b: any) =>
        b.querySelector('.btn-label')?.textContent?.includes(fragment),
      ) as HTMLButtonElement | undefined
    if (g?.ai) {
      if (typeof g.ai.reset === 'function') g.ai.reset()
      g.ai.update = () => {}
    }
  })
  await page.waitForTimeout(300)
}

test.describe('V9 HERO21-UX1 Mass Teleport visible feedback', () => {
  test.setTimeout(180000)

  test('UX-1: selected Archmage shows learned Mass Teleport level in unit panel', async ({ page }) => {
    await waitForRuntime(page)

    const result = await page.evaluate(() => {
      const g = (window as any).__war3Game
      const archmage = g.spawnUnit('archmage', 0, 30, 30)
      archmage.abilityLevels = { ...(archmage.abilityLevels ?? {}), mass_teleport: 1 }
      g.selectionModel.clear()
      g.selectionModel.setSelection([archmage])
      g._lastCmdKey = ''
      g.updateHUD(0.016)

      const stats = document.getElementById('unit-stats')?.textContent ?? ''
      return { hasMassTeleport: stats.includes('群体传送') }
    })

    expect(result.hasMassTeleport).toBe(true)
  })

  test('UX-2: command card shows disabled reasons for blocked Mass Teleport casts', async ({ page }) => {
    await waitForRuntime(page)

    const result = await page.evaluate(() => {
      const g = (window as any).__war3Game
      const archmage = g.spawnUnit('archmage', 0, 30, 30)
      archmage.heroLevel = 5
      archmage.heroSkillPoints = 4
      archmage.mana = archmage.maxMana

      const select = () => {
        g.selectionModel.clear()
        g.selectionModel.setSelection([archmage])
        g._lastCmdKey = ''
        g.updateHUD(0.016)
      }

      // At hero level 5, learn button should be disabled with hero level reason
      select()
      const learnBefore = (window as any).__cmdButtonIncludes('学习群体传送')
      const learnBeforeReason = learnBefore?.dataset.disabledReason ?? ''

      // Level up to 6 and learn the ability
      archmage.heroLevel = 6
      select()
      const learnNow = (window as any).__cmdButtonIncludes('学习群体传送')
      learnNow?.click()
      select()

      // Now test cast button blocked states
      // Low mana
      archmage.mana = 1
      select()
      const lowManaBtn = (window as any).__cmdButton('群体传送')
      const lowManaReason = lowManaBtn?.dataset.disabledReason ?? ''

      // Cooldown
      archmage.mana = archmage.maxMana
      archmage.massTeleportCooldownUntil = g.gameTime + 10
      select()
      const cooldownBtn = (window as any).__cmdButton('群体传送')
      const cooldownReason = cooldownBtn?.dataset.disabledReason ?? ''

      // Dead
      archmage.massTeleportCooldownUntil = 0
      archmage.isDead = true
      archmage.hp = 0
      select()
      const deadBtn = (window as any).__cmdButton('群体传送')
      const deadReason = deadBtn?.dataset.disabledReason ?? ''

      // Pending
      archmage.isDead = false
      archmage.hp = archmage.maxHp
      archmage.mana = archmage.maxMana
      archmage.massTeleportCooldownUntil = 0
      const friendly = g.spawnUnit('footman', 0, 50, 30)
      g.castMassTeleport(archmage, friendly)
      select()
      const pendingBtn = (window as any).__cmdButton('群体传送')
      const pendingReason = pendingBtn?.dataset.disabledReason ?? ''

      return { learnBeforeReason, lowManaReason, cooldownReason, deadReason, pendingReason }
    })

    expect(result.learnBeforeReason).toContain('6')
    expect(result.lowManaReason).toContain('魔力')
    expect(result.cooldownReason).toContain('冷却')
    expect(result.deadReason).toContain('死亡')
    expect(result.pendingReason).toContain('传送')
  })

  test('UX-3: target mode shows clear hint for friendly unit/building click and cancel', async ({ page }) => {
    await waitForRuntime(page)

    const result = await page.evaluate(() => {
      const g = (window as any).__war3Game
      const archmage = g.spawnUnit('archmage', 0, 30, 30)
      archmage.abilityLevels = { ...(archmage.abilityLevels ?? {}), mass_teleport: 1 }
      archmage.mana = archmage.maxMana
      g.selectionModel.clear()
      g.selectionModel.setSelection([archmage])
      g._lastCmdKey = ''
      g.updateHUD(0.016)

      const cast = (window as any).__cmdButton('群体传送')
      cast?.click()
      const hint = document.getElementById('mode-hint')?.textContent ?? ''

      return { hint }
    })

    expect(result.hint).toContain('群体传送')
    expect(result.hint).toContain('左键')
    expect(result.hint).toContain('友方')
    expect(result.hint).toContain('右键')
  })

  test('UX-4: pending state shows readable preparing label with remaining time', async ({ page }) => {
    await waitForRuntime(page)

    const result = await page.evaluate(() => {
      const g = (window as any).__war3Game
      const archmage = g.spawnUnit('archmage', 0, 30, 30)
      archmage.abilityLevels = { ...(archmage.abilityLevels ?? {}), mass_teleport: 1 }
      archmage.mana = archmage.maxMana
      const target = g.spawnUnit('footman', 0, 50, 30)

      g.castMassTeleport(archmage, target)

      // Advance a bit to ensure HUD updates
      for (let t = 0; t < 0.5; t += 0.016) g.update(0.016)

      g.selectionModel.clear()
      g.selectionModel.setSelection([archmage])
      g._lastCmdKey = ''
      g.updateHUD(0.016)

      const stats = document.getElementById('unit-stats')?.textContent ?? ''
      const hasPreparing = stats.includes('传送准备中')
      const hasSeconds = stats.match(/传送准备中\s+(\d+)s/)

      return { hasPreparing, secondsMatch: hasSeconds ? hasSeconds[1] : '' }
    })

    expect(result.hasPreparing).toBe(true)
    expect(result.secondsMatch).toBeTruthy()
    expect(Number(result.secondsMatch)).toBeGreaterThan(0)
  })

  test('UX-5: cooldown shows remaining time in unit panel', async ({ page }) => {
    await waitForRuntime(page)

    const result = await page.evaluate(() => {
      const g = (window as any).__war3Game
      const archmage = g.spawnUnit('archmage', 0, 30, 30)
      archmage.abilityLevels = { ...(archmage.abilityLevels ?? {}), mass_teleport: 1 }
      archmage.mana = archmage.maxMana
      const target = g.spawnUnit('footman', 0, 50, 30)

      // Start and complete teleport to leave cooldown
      g.castMassTeleport(archmage, target)
      for (let t = 0; t < 4.0; t += 0.1) g.update(0.1)

      g.selectionModel.clear()
      g.selectionModel.setSelection([archmage])
      g._lastCmdKey = ''
      g.updateHUD(0.016)

      const stats = document.getElementById('unit-stats')?.textContent ?? ''
      const hasCooldown = stats.includes('群体传送冷却')
      const cooldownMatch = stats.match(/群体传送冷却\s+(\d+)s/)
      const castButton = (window as any).__cmdButton('群体传送')
      const buttonDisabled = castButton?.disabled ?? false
      const buttonReason = castButton?.dataset.disabledReason ?? ''

      return {
        hasCooldown,
        cooldownSeconds: cooldownMatch ? cooldownMatch[1] : '',
        buttonDisabled,
        buttonReason,
      }
    })

    expect(result.hasCooldown).toBe(true)
    expect(result.cooldownSeconds).toBeTruthy()
    expect(Number(result.cooldownSeconds)).toBeGreaterThan(0)
    expect(result.buttonDisabled).toBe(true)
    expect(result.buttonReason).toContain('冷却')
  })

  test('UX-6: completion produces lightweight feedback — impact ring at target', async ({ page }) => {
    // Verify executeMassTeleport produces an impact ring. No damage numbers.
    const gameSrc = readFileSync('src/game/Game.ts', 'utf-8')
    expect(gameSrc).toContain('this.feedback.spawnImpactRing(targetPos)')
    expect(gameSrc).not.toContain('this.feedback.spawnDamageNumber(caster, transported.length)')

    await waitForRuntime(page)
    const result = await page.evaluate(() => {
      const g = (window as any).__war3Game
      const archmage = g.spawnUnit('archmage', 0, 30, 30)
      archmage.abilityLevels = { ...(archmage.abilityLevels ?? {}), mass_teleport: 1 }
      archmage.mana = archmage.maxMana
      const friend = g.spawnUnit('footman', 0, 30.5, 30)
      const target = g.spawnUnit('footman', 0, 50, 30)

      // Track feedback calls
      let impactRingCalls = 0
      const origImpact = g.feedback.spawnImpactRing.bind(g.feedback)
      g.feedback.spawnImpactRing = (...args: any[]) => { impactRingCalls++; return origImpact(...args) }

      g.castMassTeleport(archmage, target)
      for (let t = 0; t < 4.0; t += 0.1) g.update(0.1)

      return { impactRingCalls }
    })

    expect(result.impactRingCalls).toBeGreaterThanOrEqual(1)
  })

  test('UX-7: invalid targets do not produce success feedback or spend resources', async ({ page }) => {
    await waitForRuntime(page)

    const result = await page.evaluate(() => {
      const g = (window as any).__war3Game
      const archmage = g.spawnUnit('archmage', 0, 30, 30)
      archmage.abilityLevels = { ...(archmage.abilityLevels ?? {}), mass_teleport: 1 }
      archmage.mana = archmage.maxMana
      const enemy = g.spawnUnit('footman', 1, 35, 30)
      // Suppress combat to avoid spurious impact rings
      enemy.attackDamage = 0
      enemy.attackRange = 0
      archmage.attackDamage = 0
      archmage.attackRange = 0

      const beforeMana = archmage.mana

      // Count impact rings only after we start tracking
      let impactRingCalls = 0
      const origImpact = g.feedback.spawnImpactRing.bind(g.feedback)
      g.feedback.spawnImpactRing = (...args: any[]) => { impactRingCalls++; return origImpact(...args) }

      const ok = g.castMassTeleport(archmage, enemy)
      // Advance briefly — no teleport should occur
      for (let t = 0; t < 0.5; t += 0.1) g.update(0.1)

      const pending = !!g.massTeleportPending

      return { ok, manaSpent: archmage.mana < beforeMana, impactRingCalls, pending }
    })

    expect(result.ok).toBe(false)
    expect(result.manaSpent).toBe(false)
    expect(result.pending).toBe(false)
    expect(result.impactRingCalls).toBe(0)
  })

  test('UX-8: existing WE/BA/Blizzard UI remains intact and correctly labeled', async ({ page }) => {
    await waitForRuntime(page)

    const result = await page.evaluate(() => {
      const g = (window as any).__war3Game
      const archmage = g.spawnUnit('archmage', 0, 30, 30)
      archmage.heroLevel = 6
      archmage.heroSkillPoints = 4
      archmage.abilityLevels = { ...(archmage.abilityLevels ?? {}), water_elemental: 1, brilliance_aura: 1, blizzard: 1, mass_teleport: 1 }
      archmage.mana = archmage.maxMana
      g.selectionModel.clear()
      g.selectionModel.setSelection([archmage])
      g._lastCmdKey = ''
      g.updateHUD(0.016)

      const labels = Array.from(document.querySelectorAll('#command-card button')).map((b: any) =>
        b.querySelector('.btn-label')?.textContent?.trim() ?? '',
      )

      const stats = document.getElementById('unit-stats')?.textContent ?? ''

      return {
        hasWaterElemental: labels.some(l => l.includes('水元素')),
        hasBrillianceAura: labels.some(l => l.includes('辉煌光环')),
        hasBlizzard: labels.some(l => l.includes('暴风雪')),
        hasMassTeleport: labels.some(l => l.includes('群体传送')),
        statsHaveWE: stats.includes('水元素'),
        statsHaveBA: stats.includes('辉煌光环'),
        statsHaveBlizzard: stats.includes('暴风雪'),
        statsHaveMT: stats.includes('群体传送'),
        // Verify MT is NOT labeled as WE/BA/Blizzard
        mtLabeledAsWE: labels.some(l => l.includes('群体传送') && l.includes('水元素')),
        mtLabeledAsBA: labels.some(l => l.includes('群体传送') && l.includes('辉煌光环')),
      }
    })

    expect(result.hasWaterElemental).toBe(true)
    expect(result.hasBrillianceAura).toBe(true)
    expect(result.hasBlizzard).toBe(true)
    expect(result.hasMassTeleport).toBe(true)
    expect(result.mtLabeledAsWE).toBe(false)
    expect(result.mtLabeledAsBA).toBe(false)
  })

  test('UX-9: Mass Teleport remains HERO_ABILITY_LEVELS-driven, not ABILITIES-driven', async ({ page }) => {
    expect((ABILITIES as any).mass_teleport).toBeUndefined()
    const gameSrc = readFileSync('src/game/Game.ts', 'utf-8')
    const massTeleportSrc = readFileSync('src/game/systems/MassTeleportSystem.ts', 'utf-8')
    expect(massTeleportSrc).toContain('HERO_ABILITY_LEVELS.mass_teleport')
    expect(gameSrc).not.toContain('ABILITIES.mass_teleport')
    expect(massTeleportSrc).not.toContain('ABILITIES.mass_teleport')
  })
})
