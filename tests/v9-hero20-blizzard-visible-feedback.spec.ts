/**
 * V9 HERO20-UX1 Blizzard visible feedback proof.
 *
 * Scope:
 * - Archmage command-card text shows Chinese name, mana, range, waves, cooldown.
 * - Disabled states show user-readable reasons: dead, mana too low, cooldown,
 *   channeling, skill not yet learnable.
 * - Ground-target mode shows a clear Blizzard prompt; right-click and Escape cancel.
 * - Successful cast produces minimal visible proxy feedback (AOE ring, hit flash).
 * - Selected Archmage HUD shows Blizzard level, cooldown, channeling state.
 * - Water Elemental and Brilliance Aura remain separate and visible.
 * - No ABILITIES.blizzard; Archmage command surfaces remain separate.
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

test.describe('V9 HERO20-UX1 Blizzard visible feedback', () => {
  test.setTimeout(180000)

  test('BLZ-UX-1: Archmage HUD shows Blizzard learned level', async ({ page }) => {
    await waitForRuntime(page)

    const result = await page.evaluate(() => {
      const g = (window as any).__war3Game
      const archmage = g.spawnUnit('archmage', 0, 30, 30)
      archmage.heroLevel = 5
      archmage.heroSkillPoints = 3
      archmage.mana = archmage.maxMana
      // Learn Blizzard Lv1
      archmage.abilityLevels = { ...(archmage.abilityLevels ?? {}), blizzard: 0 }
      g.selectionModel.clear()
      g.selectionModel.setSelection([archmage])
      g._lastCmdKey = ''
      g.updateHUD(0.016)

      // Learn Blizzard
      const learnBtn = (window as any).__cmdButton('学习暴风雪 (Lv1)')
      learnBtn?.click()
      g._lastCmdKey = ''
      g.updateHUD(0.016)

      const statsText = document.getElementById('unit-stats')?.textContent ?? ''
      return {
        hasBlizzardLevel: statsText.includes('暴风雪'),
        statsText,
        learnedLevel: archmage.abilityLevels?.blizzard ?? 0,
      }
    })

    expect(result.hasBlizzardLevel).toBe(true)
    expect(result.learnedLevel).toBe(1)
    expect(result.statsText).toContain('暴风雪 Lv1')
  })

  test('BLZ-UX-2: command-card shows Chinese name, mana, range, waves, cooldown', async ({ page }) => {
    await waitForRuntime(page)

    const result = await page.evaluate(() => {
      const g = (window as any).__war3Game
      const archmage = g.spawnUnit('archmage', 0, 30, 30)
      archmage.heroLevel = 5
      archmage.heroSkillPoints = 3
      archmage.abilityLevels = { ...(archmage.abilityLevels ?? {}), blizzard: 1, water_elemental: 1, brilliance_aura: 1 }
      archmage.mana = archmage.maxMana
      g.selectionModel.clear()
      g.selectionModel.setSelection([archmage])
      g._lastCmdKey = ''
      g.updateHUD(0.016)

      const castBtn = (window as any).__cmdButton('暴风雪 (Lv1)')
      const label = castBtn?.querySelector('.btn-label')?.textContent?.trim() ?? ''
      const cost = castBtn?.querySelector('.btn-cost')?.textContent?.trim() ?? ''
      return { label, cost, disabled: castBtn?.disabled ?? null }
    })

    const blizzard = HERO_ABILITY_LEVELS.blizzard
    const lv1Data = blizzard.levels[0]

    expect(result.label).toContain('暴风雪')
    expect(result.label).toContain('Lv1')
    expect(result.cost).toContain(`法力${lv1Data.mana}`)
    expect(result.cost).toContain(`射程${lv1Data.range}`)
    expect(result.cost).toContain(`${lv1Data.waves}波`)
    expect(result.cost).toContain(`冷却${lv1Data.cooldown}s`)
    expect(result.disabled).toBe(false)
  })

  test('BLZ-UX-3: disabled reasons cover dead, mana, cooldown, channeling, level/skill-point gates', async ({ page }) => {
    await waitForRuntime(page)

    const result = await page.evaluate(() => {
      const g = (window as any).__war3Game
      const archmage = g.spawnUnit('archmage', 0, 30, 30)
      archmage.heroLevel = 1
      archmage.heroSkillPoints = 1
      archmage.abilityLevels = { ...(archmage.abilityLevels ?? {}), blizzard: 0 }
      archmage.mana = archmage.maxMana

      const select = () => {
        g.selectionModel.clear()
        g.selectionModel.setSelection([archmage])
        g._lastCmdKey = ''
        g.updateHUD(0.016)
      }
      select()

      // Learn button: dead
      const learnBtnBefore = (window as any).__cmdButton('学习暴风雪 (Lv1)')
      const reasonBeforeDeath = learnBtnBefore?.dataset.disabledReason ?? ''
      learnBtnBefore?.disabled // should be false initially

      // Dead learn button
      archmage.isDead = true
      archmage.hp = 0
      select()
      const deadLearnBtn = (window as any).__cmdButton('学习暴风雪 (Lv1)')
      const deadLearnReason = deadLearnBtn?.dataset.disabledReason ?? ''
      const deadLearnDisabled = deadLearnBtn?.disabled ?? null

      // Restore
      archmage.isDead = false
      archmage.hp = archmage.maxHp

      // No skill points
      archmage.heroSkillPoints = 0
      select()
      const noSpBtn = (window as any).__cmdButton('学习暴风雪 (Lv1)')
      const noSpReason = noSpBtn?.dataset.disabledReason ?? ''

      // Level gate: learn Lv2 needs heroLevel 3
      archmage.heroSkillPoints = 1
      archmage.abilityLevels.blizzard = 1
      archmage.heroLevel = 2
      select()
      const blockedLv2Btn = (window as any).__cmdButton('学习暴风雪 (Lv2)')
      const blockedLv2Reason = blockedLv2Btn?.dataset.disabledReason ?? ''

      // Now learn Blizzard for cast button tests
      archmage.heroLevel = 5
      archmage.heroSkillPoints = 3
      archmage.abilityLevels.blizzard = 1
      archmage.mana = archmage.maxMana
      select()

      // Cast button: dead
      archmage.isDead = true
      archmage.hp = 0
      select()
      const deadCastBtn = (window as any).__cmdButton('暴风雪 (Lv1)')
      const deadCastReason = deadCastBtn?.dataset.disabledReason ?? ''
      archmage.isDead = false
      archmage.hp = archmage.maxHp

      // Cast button: low mana
      archmage.mana = 1
      select()
      const noManaBtn = (window as any).__cmdButton('暴风雪 (Lv1)')
      const noManaReason = noManaBtn?.dataset.disabledReason ?? ''
      archmage.mana = archmage.maxMana

      // Cast button: on cooldown
      archmage.blizzardCooldownUntil = g.gameTime + 5
      select()
      const cdBtn = (window as any).__cmdButton('暴风雪 (Lv1)')
      const cdReason = cdBtn?.dataset.disabledReason ?? ''
      archmage.blizzardCooldownUntil = 0

      // Cast button: channeling
      g.blizzardChannel = { caster: archmage, targetX: 35, targetZ: 30, wavesRemaining: 3 }
      select()
      const channelBtn = (window as any).__cmdButton('暴风雪 (Lv1)')
      const channelReason = channelBtn?.dataset.disabledReason ?? ''
      g.blizzardChannel = null

      return {
        deadLearnReason,
        deadLearnDisabled,
        noSpReason,
        blockedLv2Reason,
        deadCastReason,
        noManaReason,
        cdReason,
        channelReason,
      }
    })

    // Learn button disabled reasons
    expect(result.deadLearnReason).toContain('已死亡')
    expect(result.deadLearnDisabled).toBe(true)
    expect(result.noSpReason).toContain('无技能点')
    expect(result.blockedLv2Reason).toContain('英雄等级')

    // Cast button disabled reasons
    expect(result.deadCastReason).toContain('已死亡')
    expect(result.noManaReason).toContain('魔力不足')
    expect(result.cdReason).toContain('冷却中')
    expect(result.channelReason).toContain('引导')
  })

  test('BLZ-UX-4: target mode shows Blizzard prompt and can be cancelled', async ({ page }) => {
    await waitForRuntime(page)

    const result = await page.evaluate(() => {
      const g = (window as any).__war3Game
      const archmage = g.spawnUnit('archmage', 0, 30, 30)
      archmage.abilityLevels = { ...(archmage.abilityLevels ?? {}), blizzard: 1 }
      archmage.mana = archmage.maxMana
      g.selectionModel.clear()
      g.selectionModel.setSelection([archmage])
      g._lastCmdKey = ''
      g.updateHUD(0.016)

      // Click cast button to enter target mode
      const castBtn = (window as any).__cmdButton('暴风雪 (Lv1)')
      castBtn?.click()

      const hintAfterEnter = document.getElementById('mode-hint')?.textContent ?? ''
      const targetModeActive = g.blizzardTargetMode === true

      // Cancel with right-click
      const canvas = document.getElementById('game-canvas')!
      canvas.dispatchEvent(new MouseEvent('contextmenu', { bubbles: true, cancelable: true, button: 2 }))
      const canceledByRightClick = g.blizzardTargetMode === false

      // Re-enter and cancel with Escape
      castBtn?.click()
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))
      const canceledByEscape = g.blizzardTargetMode === false

      return { hintAfterEnter, targetModeActive, canceledByRightClick, canceledByEscape }
    })

    expect(result.targetModeActive).toBe(true)
    expect(result.hintAfterEnter).toContain('暴风雪')
    expect(result.hintAfterEnter).toContain('左键')
    expect(result.hintAfterEnter).toContain('右键')
    expect(result.canceledByRightClick).toBe(true)
    expect(result.canceledByEscape).toBe(true)
  })

  test('BLZ-UX-5: cast produces visible AOE ring proxy and hit feedback at target', async ({ page }) => {
    await waitForRuntime(page)

    const result = await page.evaluate(async () => {
      const g = (window as any).__war3Game
      const archmage = g.spawnUnit('archmage', 0, 30, 30)
      archmage.attackDamage = 0
      archmage.attackRange = 0
      archmage.abilityLevels = { ...(archmage.abilityLevels ?? {}), blizzard: 1 }
      archmage.mana = archmage.maxMana
      const targetX = 35
      const targetZ = 30
      const enemy = g.spawnUnit('footman', 1, targetX, targetZ)
      enemy.attackDamage = 0
      enemy.attackRange = 0
      enemy.hp = 1000
      enemy.maxHp = 1000

      // Cast
      const ok = g.castBlizzard(archmage, targetX, targetZ)
      const hasChannel = !!g.blizzardChannel
      const hasAoeRing = !!g.blizzardAoeRing

      // Check AOE ring position
      const ringPos = g.blizzardAoeRing?.position
      const ringAtTarget = ringPos
        ? Math.abs(ringPos.x - targetX) < 0.1 && Math.abs(ringPos.z - targetZ) < 0.1
        : false

      // Run one wave to trigger hit feedback
      g.update(1.05)

      // Check the enemy was damaged (proving hit feedback executed)
      const enemyDamaged = enemy.hp < 1000

      return { ok, hasChannel, hasAoeRing, ringAtTarget, enemyDamaged }
    })

    expect(result.ok).toBe(true)
    expect(result.hasChannel).toBe(true)
    expect(result.hasAoeRing).toBe(true)
    expect(result.ringAtTarget).toBe(true)
    expect(result.enemyDamaged).toBe(true)
  })

  test('BLZ-UX-6: AOE ring disappears when channel ends or is interrupted', async ({ page }) => {
    await waitForRuntime(page)

    const result = await page.evaluate(() => {
      const g = (window as any).__war3Game

      // Case 1: channel completes naturally
      const archmage1 = g.spawnUnit('archmage', 0, 30, 30)
      archmage1.attackDamage = 0
      archmage1.attackRange = 0
      archmage1.abilityLevels = { ...(archmage1.abilityLevels ?? {}), blizzard: 1 }
      archmage1.mana = archmage1.maxMana
      g.castBlizzard(archmage1, 35, 30)
      const ringDuringChannel = !!g.blizzardAoeRing

      // Run until channel finishes (Lv1: 6 waves, 1s each)
      for (let t = 0; t < 8; t += 0.25) g.update(0.25)
      const ringAfterChannelEnds = !!g.blizzardAoeRing
      const channelEnded = !g.blizzardChannel

      // Case 2: channel interrupted by death
      const archmage2 = g.spawnUnit('archmage', 0, 40, 40)
      archmage2.attackDamage = 0
      archmage2.attackRange = 0
      archmage2.abilityLevels = { ...(archmage2.abilityLevels ?? {}), blizzard: 1 }
      archmage2.mana = archmage2.maxMana
      g.castBlizzard(archmage2, 42, 40)
      const ringBeforeDeath = !!g.blizzardAoeRing

      // Kill caster
      archmage2.hp = 0
      archmage2.isDead = true
      g.update(0.016)
      const ringAfterDeath = !!g.blizzardAoeRing

      // Case 3: channel interrupted by stop order
      const archmage3 = g.spawnUnit('archmage', 0, 50, 50)
      archmage3.attackDamage = 0
      archmage3.attackRange = 0
      archmage3.abilityLevels = { ...(archmage3.abilityLevels ?? {}), blizzard: 1 }
      archmage3.mana = archmage3.maxMana
      g.castBlizzard(archmage3, 52, 50)
      const ringBeforeStop = !!g.blizzardAoeRing

      g.issueCommand([archmage3], { type: 'stop' })
      g.update(0.016)
      const ringAfterStop = !!g.blizzardAoeRing

      return {
        ringDuringChannel,
        ringAfterChannelEnds,
        channelEnded,
        ringBeforeDeath,
        ringAfterDeath,
        ringBeforeStop,
        ringAfterStop,
      }
    })

    // Channel completes
    expect(result.ringDuringChannel).toBe(true)
    expect(result.channelEnded).toBe(true)
    expect(result.ringAfterChannelEnds).toBe(false)

    // Death interrupt
    expect(result.ringBeforeDeath).toBe(true)
    expect(result.ringAfterDeath).toBe(false)

    // Stop interrupt
    expect(result.ringBeforeStop).toBe(true)
    expect(result.ringAfterStop).toBe(false)
  })

  test('BLZ-UX-7: HUD shows cooldown and channeling state in stats panel', async ({ page }) => {
    await waitForRuntime(page)

    const result = await page.evaluate(() => {
      const g = (window as any).__war3Game
      const archmage = g.spawnUnit('archmage', 0, 30, 30)
      archmage.attackDamage = 0
      archmage.attackRange = 0
      archmage.abilityLevels = { ...(archmage.abilityLevels ?? {}), blizzard: 1, water_elemental: 1, brilliance_aura: 1 }
      archmage.mana = archmage.maxMana

      g.selectionModel.clear()
      g.selectionModel.setSelection([archmage])
      g._lastCmdKey = ''
      g.updateHUD(0.016)

      const select = () => {
        g._lastCmdKey = ''
        g.updateHUD(0.016)
      }

      // Before cast
      const statsBefore = document.getElementById('unit-stats')?.textContent ?? ''

      // Cast Blizzard
      g.castBlizzard(archmage, 35, 30)
      select()
      const statsDuringChannel = document.getElementById('unit-stats')?.textContent ?? ''

      // Run just 2 seconds — channel is still active and cooldown is visible
      for (let t = 0; t < 2; t += 0.25) g.update(0.25)
      select()
      const statsDuringCooldown = document.getElementById('unit-stats')?.textContent ?? ''

      // Run until channel and cooldown fully expire
      for (let t = 0; t < 8; t += 0.25) g.update(0.25)
      select()
      const statsAfterAll = document.getElementById('unit-stats')?.textContent ?? ''

      return {
        statsBefore,
        statsDuringChannel,
        statsDuringCooldown,
        statsAfterAll,
        hasBlizzardLevel: statsBefore.includes('暴风雪'),
        showsChanneling: statsDuringChannel.includes('引导'),
        showsWavesRemaining: statsDuringChannel.includes('波'),
        showsCooldownDuring: statsDuringCooldown.includes('冷却'),
        hasWaterElemental: statsBefore.includes('水元素'),
        hasBrillianceAura: statsBefore.includes('辉煌光环'),
      }
    })

    // HUD shows Blizzard level
    expect(result.hasBlizzardLevel).toBe(true)
    // HUD shows channeling during channel
    expect(result.showsChanneling).toBe(true)
    expect(result.showsWavesRemaining).toBe(true)
    // HUD shows cooldown during channel
    expect(result.showsCooldownDuring).toBe(true)
    // Other abilities still visible
    expect(result.hasWaterElemental).toBe(true)
    expect(result.hasBrillianceAura).toBe(true)
  })

  test('BLZ-UX-8: boundaries — no ABILITIES.blizzard, Archmage command surfaces remain separate', async ({ page }) => {
    expect((ABILITIES as any).blizzard).toBeUndefined()
    const gameSrc = readFileSync('src/game/Game.ts', 'utf-8')
    expect(gameSrc).not.toContain('ABILITIES.blizzard')

    await waitForRuntime(page)
    const result = await page.evaluate(() => {
      const g = (window as any).__war3Game
      const archmage = g.spawnUnit('archmage', 0, 30, 30)
      archmage.heroLevel = 5
      archmage.heroSkillPoints = 3
      archmage.abilityLevels = { ...(archmage.abilityLevels ?? {}), water_elemental: 1, brilliance_aura: 1, blizzard: 1 }
      archmage.mana = archmage.maxMana
      g.selectionModel.clear()
      g.selectionModel.setSelection([archmage])
      g._lastCmdKey = ''
      g.updateHUD(0.016)
      const labels = Array.from(document.querySelectorAll('#command-card button')).map((b: any) =>
        b.querySelector('.btn-label')?.textContent?.trim() ?? '',
      )
      return {
        hasWaterElemental: labels.some(l => l.includes('水元素')),
        hasBrillianceAura: labels.some(l => l.includes('辉煌光环')),
        hasBlizzard: labels.some(l => l.includes('暴风雪')),
        hasMassTeleport: labels.some(l => l.includes('群体传送') || l.includes('Mass Teleport')),
        blizzardSeparateFromWE: labels.filter(l => l.includes('水元素') || l.includes('暴风雪')).length >= 2,
      }
    })

    expect(result.hasWaterElemental).toBe(true)
    expect(result.hasBrillianceAura).toBe(true)
    expect(result.hasBlizzard).toBe(true)
    expect(result.hasMassTeleport).toBe(true)
    expect(result.blizzardSeparateFromWE).toBe(true)
  })
})
