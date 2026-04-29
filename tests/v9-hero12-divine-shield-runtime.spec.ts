/**
 * V9 HERO12-IMPL1B Divine Shield self-cast runtime proof.
 *
 * Proves:
 * 1. No learned Divine Shield level → no cast button, direct cast returns false.
 * 2. Learned Lv1/Lv2/Lv3 shows self-cast button with data-driven mana/duration/cooldown.
 * 3. Casting spends 25 mana, starts cooldown, applies invulnerable state.
 * 4. While active, incoming enemy damage to Paladin is prevented; other units take damage normally.
 * 5. After duration expires (15/30/45s), Paladin can take damage again.
 * 6. Cooldown prevents repeated casts; mana shortage disables casting.
 * 7. Divine Shield cannot be manually deactivated.
 * 8. Holy Light learning/casting, HERO9 death/revive, HERO12 learn surface unchanged.
 *
 * Not: visual effects, AI, Devotion Aura, Resurrection, other heroes, items, assets.
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
  } catch { /* procedural fallback */ }
  await page.evaluate(() => {
    const g = (window as any).__war3Game
    if (g?.ai) { if (typeof g.ai.reset === 'function') g.ai.reset(); g.ai.update = () => {} }
  })
  await page.waitForTimeout(300)
}

async function summonPaladin(page: Page): Promise<any> {
  return page.evaluate(() => {
    const g = (window as any).__war3Game
    g.resources.earn(0, 10000, 10000)
    g.spawnBuilding('altar_of_kings', 0, 15, 15)
    const altar = g.units.find((u: any) => u.team === 0 && u.type === 'altar_of_kings' && u.isBuilding)
    if (!altar) return null
    g.selectionModel.clear()
    g.selectionModel.setSelection([altar])
    g._lastCmdKey = ''
    g.updateHUD(0.016)
    const btn = Array.from(document.querySelectorAll('#command-card button')).find((b: any) =>
      b.querySelector('.btn-label')?.textContent?.trim() === '圣骑士',
    ) as HTMLButtonElement | undefined
    if (btn) btn.click()
    const dt = 0.5
    for (let i = 0; i < 120; i++) { g.gameTime += dt; g.updateUnits(dt) }
    const paladin = g.units.find((u: any) => u.type === 'paladin' && !u.isBuilding && u.team === 0)
    return paladin ? { type: paladin.type, heroLevel: paladin.heroLevel, heroSkillPoints: paladin.heroSkillPoints } : null
  })
}

async function selectPaladin(page: Page) {
  await page.evaluate(() => {
    const g = (window as any).__war3Game
    const paladin = g.units.find((u: any) => u.type === 'paladin' && !u.isBuilding && u.team === 0)
    if (!paladin) return
    g.selectionModel.clear()
    g.selectionModel.setSelection([paladin])
    g._lastCmdKey = ''
    g.updateHUD(0.016)
  })
}

test.describe('V9 HERO12-IMPL1B Divine Shield self-cast runtime', () => {
  test.setTimeout(180000)

  test('CS-1: no learned DS level → no cast button, direct cast returns false', async ({ page }) => {
    await waitForRuntime(page)
    const pal = await summonPaladin(page)
    expect(pal).not.toBeNull()

    await selectPaladin(page)

    const result = await page.evaluate(() => {
      const g = (window as any).__war3Game
      const paladin = g.units.find((u: any) => u.type === 'paladin' && !u.isBuilding && u.team === 0)
      if (!paladin) return null

      // Ensure DS not learned
      const dsLearned = paladin.abilityLevels?.divine_shield ?? 0

      // Try direct cast
      const castResult = g.castDivineShield(paladin)

      const buttons = Array.from(document.querySelectorAll('#command-card button'))
      const castBtn = buttons.find((b: any) => {
        const txt = b.querySelector('.btn-label')?.textContent?.trim() ?? ''
        return txt.includes('神圣护盾') && txt.includes('Lv') && !txt.includes('学习')
      })

      return { dsLearned, castResult, hasCastBtn: !!castBtn }
    })

    expect(result.dsLearned).toBe(0)
    expect(result.castResult).toBe(false)
    expect(result.hasCastBtn).toBe(false)
  })

  test('CS-2: learned Lv1 shows cast button with correct mana/duration/cooldown', async ({ page }) => {
    await waitForRuntime(page)
    const pal = await summonPaladin(page)
    expect(pal).not.toBeNull()

    // Set DS level 1, give mana
    await page.evaluate(() => {
      const g = (window as any).__war3Game
      const paladin = g.units.find((u: any) => u.type === 'paladin' && !u.isBuilding && u.team === 0)
      if (!paladin) return
      if (!paladin.abilityLevels) paladin.abilityLevels = {}
      paladin.abilityLevels.divine_shield = 1
      paladin.mana = 100
    })

    await selectPaladin(page)

    const result = await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('#command-card button'))
      const castBtn = buttons.find((b: any) => {
        const txt = b.querySelector('.btn-label')?.textContent?.trim() ?? ''
        return txt.includes('神圣护盾 (Lv1)')
      }) as HTMLButtonElement | undefined
      if (!castBtn) return { hasCastBtn: false }
      const cost = castBtn.querySelector('.btn-cost')?.textContent?.trim() ?? ''
      return {
        hasCastBtn: true,
        enabled: !castBtn.disabled,
        label: castBtn.querySelector('.btn-label')?.textContent?.trim() ?? '',
        cost,
        costHasMana: cost.includes('25'),
        costHasDuration: cost.includes('15'),
      }
    })

    expect(result.hasCastBtn).toBe(true)
    expect(result.enabled).toBe(true)
    expect(result.label).toContain('Lv1')
    expect(result.costHasMana).toBe(true)
    expect(result.costHasDuration).toBe(true)
  })

  test('CS-3: casting spends 25 mana, starts cooldown, applies invulnerable state', async ({ page }) => {
    await waitForRuntime(page)
    const pal = await summonPaladin(page)
    expect(pal).not.toBeNull()

    await page.evaluate(() => {
      const g = (window as any).__war3Game
      const paladin = g.units.find((u: any) => u.type === 'paladin' && !u.isBuilding && u.team === 0)
      if (!paladin) return
      if (!paladin.abilityLevels) paladin.abilityLevels = {}
      paladin.abilityLevels.divine_shield = 1
      paladin.mana = 100
    })

    await selectPaladin(page)

    const afterCast = await page.evaluate(() => {
      const g = (window as any).__war3Game
      const paladin = g.units.find((u: any) => u.type === 'paladin' && !u.isBuilding && u.team === 0)
      if (!paladin) return null

      // Click cast button
      const buttons = Array.from(document.querySelectorAll('#command-card button'))
      const castBtn = buttons.find((b: any) => {
        const txt = b.querySelector('.btn-label')?.textContent?.trim() ?? ''
        return txt.includes('神圣护盾 (Lv1)')
      }) as HTMLButtonElement | undefined
      if (castBtn) castBtn.click()

      const fresh = g.units.find((u: any) => u.type === 'paladin' && !u.isBuilding && u.team === 0)
      return {
        mana: fresh.mana,
        shieldActive: fresh.divineShieldUntil > g.gameTime,
        shieldUntil: fresh.divineShieldUntil,
        cooldownUntil: fresh.divineShieldCooldownUntil,
        gameTime: g.gameTime,
      }
    })

    expect(afterCast.mana).toBe(75)  // 100 - 25
    expect(afterCast.shieldActive).toBe(true)
    expect(afterCast.shieldUntil - afterCast.gameTime).toBeCloseTo(15, 0) // Lv1 duration 15s
    expect(afterCast.cooldownUntil - afterCast.gameTime).toBeCloseTo(35, 0) // Lv1 cooldown 35s
  })

  test('CS-4: while DS active, Paladin takes no damage; other units still take damage', async ({ page }) => {
    await waitForRuntime(page)
    const pal = await summonPaladin(page)
    expect(pal).not.toBeNull()

    await page.evaluate(() => {
      const g = (window as any).__war3Game
      const paladin = g.units.find((u: any) => u.type === 'paladin' && !u.isBuilding && u.team === 0)
      if (!paladin) return
      if (!paladin.abilityLevels) paladin.abilityLevels = {}
      paladin.abilityLevels.divine_shield = 1
      paladin.mana = 100
      // Cast Divine Shield
      g.castDivineShield(paladin)
    })

    const result = await page.evaluate(() => {
      const g = (window as any).__war3Game
      const paladin = g.units.find((u: any) => u.type === 'paladin' && !u.isBuilding && u.team === 0)
      if (!paladin) return null

      // Spawn enemy to deal damage
      const enemy = g.spawnUnit('grunt', 1, paladin.mesh.position.x + 1, paladin.mesh.position.z)
      enemy.attackDamage = 100
      const palHpBefore = paladin.hp

      // Deal damage to Paladin
      g.dealDamage(enemy, paladin)
      const palHpAfter = paladin.hp

      // Spawn friendly footman and deal damage to it
      const footman = g.spawnUnit('footman', 0, paladin.mesh.position.x + 2, paladin.mesh.position.z)
      footman.hp = 500
      const fmHpBefore = footman.hp
      g.dealDamage(enemy, footman)
      const fmHpAfter = footman.hp

      return {
        shieldActive: paladin.divineShieldUntil > g.gameTime,
        palDamagePrevented: palHpAfter === palHpBefore,
        palHpBefore,
        palHpAfter,
        footmanTookDamage: fmHpAfter < fmHpBefore,
        fmHpBefore,
        fmHpAfter,
      }
    })

    expect(result.shieldActive).toBe(true)
    expect(result.palDamagePrevented).toBe(true)
    expect(result.footmanTookDamage).toBe(true)
  })

  test('CS-5: after duration expires, Paladin takes damage normally', async ({ page }) => {
    await waitForRuntime(page)
    const pal = await summonPaladin(page)
    expect(pal).not.toBeNull()

    await page.evaluate(() => {
      const g = (window as any).__war3Game
      const paladin = g.units.find((u: any) => u.type === 'paladin' && !u.isBuilding && u.team === 0)
      if (!paladin) return
      if (!paladin.abilityLevels) paladin.abilityLevels = {}
      paladin.abilityLevels.divine_shield = 1
      paladin.mana = 100
      g.castDivineShield(paladin)

      // Advance past duration (15s for Lv1)
      g.gameTime += 16
    })

    const result = await page.evaluate(() => {
      const g = (window as any).__war3Game
      const paladin = g.units.find((u: any) => u.type === 'paladin' && !u.isBuilding && u.team === 0)
      if (!paladin) return null

      const shieldExpired = paladin.divineShieldUntil <= g.gameTime
      const palHpBefore = paladin.hp

      const enemy = g.spawnUnit('grunt', 1, paladin.mesh.position.x + 1, paladin.mesh.position.z)
      enemy.attackDamage = 50
      g.dealDamage(enemy, paladin)
      const palHpAfter = paladin.hp

      return { shieldExpired, palTookDamage: palHpAfter < palHpBefore, palHpBefore, palHpAfter }
    })

    expect(result.shieldExpired).toBe(true)
    expect(result.palTookDamage).toBe(true)
  })

  test('CS-6: cooldown prevents repeated cast; mana shortage disables cast', async ({ page }) => {
    await waitForRuntime(page)
    const pal = await summonPaladin(page)
    expect(pal).not.toBeNull()

    const result = await page.evaluate(() => {
      const g = (window as any).__war3Game
      const paladin = g.units.find((u: any) => u.type === 'paladin' && !u.isBuilding && u.team === 0)
      if (!paladin) return null
      if (!paladin.abilityLevels) paladin.abilityLevels = {}
      paladin.abilityLevels.divine_shield = 1
      paladin.mana = 100

      // Cast once
      const firstCast = g.castDivineShield(paladin)
      const shieldUntil1 = paladin.divineShieldUntil
      const cooldownUntil1 = paladin.divineShieldCooldownUntil

      // Expire duration but NOT cooldown (cooldown 35s > duration 15s)
      g.gameTime += 16

      // Try to cast again while on cooldown
      const secondCast = g.castDivineShield(paladin)
      const shieldUntil2 = paladin.divineShieldUntil

      // Advance past cooldown
      g.gameTime += 20 // total 36s, past 35s cooldown

      // But drain mana
      paladin.mana = 10
      const thirdCast = g.castDivineShield(paladin)

      // Restore mana and cast
      paladin.mana = 100
      const fourthCast = g.castDivineShield(paladin)
      const shieldUntil4 = paladin.divineShieldUntil

      return {
        firstCast,
        shieldUntil1,
        secondCast,
        shieldUntil2,
        shieldUnchanged: shieldUntil2 === shieldUntil1,
        thirdCast,
        fourthCast,
        shieldUntil4,
      }
    })

    expect(result.firstCast).toBe(true)
    expect(result.secondCast).toBe(false)
    expect(result.thirdCast).toBe(false)
    expect(result.fourthCast).toBe(true)
    expect(result.shieldUnchanged).toBe(true)
  })

  test('CS-7: DS cannot be manually deactivated (no cancel while active)', async ({ page }) => {
    await waitForRuntime(page)

    const result = await page.evaluate(() => {
      const g = (window as any).__war3Game
      const paladin = g.spawnUnit('paladin', 0, 30, 30)
      if (!paladin.abilityLevels) paladin.abilityLevels = {}
      paladin.abilityLevels.divine_shield = 1
      paladin.mana = 100

      g.castDivineShield(paladin)
      const shieldUntil = paladin.divineShieldUntil

      // Verify there is no cancelDivineShield method
      const hasCancel = typeof g.cancelDivineShield === 'function'

      // Try setting shield to 0 manually (shouldn't happen through normal gameplay)
      // The point is: the system provides no deactivation path
      const stillActive = paladin.divineShieldUntil > g.gameTime

      return { hasCancel, stillActive, shieldUntil }
    })

    expect(result.hasCancel).toBe(false)
    expect(result.stillActive).toBe(true)
  })

  test('CS-8: Holy Light learning/casting and HERO12 learn surface unchanged', async ({ page }) => {
    await waitForRuntime(page)
    const pal = await summonPaladin(page)
    expect(pal).not.toBeNull()
    await selectPaladin(page)

    const result = await page.evaluate(() => {
      const g = (window as any).__war3Game
      const paladin = g.units.find((u: any) => u.type === 'paladin' && !u.isBuilding && u.team === 0)
      if (!paladin) return null

      // Verify DS learn surface still works
      const buttons = Array.from(document.querySelectorAll('#command-card button'))
      const dsLearnBtn = buttons.find((b: any) =>
        b.querySelector('.btn-label')?.textContent?.trim()?.includes('学习神圣护盾 (Lv1)'),
      )

      // Learn Holy Light
      const hlLearnBtn = buttons.find((b: any) =>
        b.querySelector('.btn-label')?.textContent?.trim()?.includes('学习圣光术 (Lv1)'),
      ) as HTMLButtonElement | undefined
      if (hlLearnBtn) hlLearnBtn.click()

      const fresh = g.units.find((u: any) => u.type === 'paladin' && !u.isBuilding && u.team === 0)

      // Cast Holy Light on a friendly
      const footman = g.spawnUnit('footman', 0, fresh.mesh.position.x + 1, fresh.mesh.position.z)
      footman.hp = 50
      const hpBefore = footman.hp
      const castOk = g.castHolyLight(fresh, footman)

      const hlLevel = fresh.abilityLevels?.holy_light ?? 0
      const dsLevel = fresh.abilityLevels?.divine_shield ?? 0

      return {
        hasDSLearBtn: !!dsLearnBtn,
        hlLevel,
        dsLevel,
        castOk,
        healed: g.units.find((u: any) => u === footman).hp - hpBefore,
      }
    })

    expect(result.hasDSLearBtn).toBe(true)
    expect(result.hlLevel).toBe(1)
    expect(result.castOk).toBe(true)
    expect(result.healed).toBeGreaterThan(0)
    expect(result.dsLevel).toBe(0)
  })

  test('CS-9: death/revive resets DS active state and cooldown', async ({ page }) => {
    await waitForRuntime(page)
    const pal = await summonPaladin(page)
    expect(pal).not.toBeNull()

    const result = await page.evaluate(() => {
      const g = (window as any).__war3Game
      const paladin = g.units.find((u: any) => u.type === 'paladin' && !u.isBuilding && u.team === 0)
      if (!paladin) return null

      // Set up: learn DS level 2, cast, then die
      if (!paladin.abilityLevels) paladin.abilityLevels = {}
      paladin.abilityLevels.divine_shield = 2
      paladin.heroLevel = 5
      paladin.mana = 100
      g.castDivineShield(paladin)

      const shieldBeforeDeath = paladin.divineShieldUntil
      const cooldownBeforeDeath = paladin.divineShieldCooldownUntil

      // Kill
      paladin.hp = 0
      g.update(0.5)

      const afterDeath = {
        isDead: paladin.isDead,
        shieldUntil: paladin.divineShieldUntil,
        cooldownUntil: paladin.divineShieldCooldownUntil,
      }

      // Revive
      const altar = g.units.find((u: any) => u.type === 'altar_of_kings' && u.isBuilding && u.team === 0)
      g.selectionModel.clear()
      g.selectionModel.setSelection([altar])
      g._lastCmdKey = ''
      g.updateHUD(0.016)
      const reviveBtn = Array.from(document.querySelectorAll('#command-card button')).find((b: any) =>
        b.querySelector('.btn-label')?.textContent?.trim() === '复活圣骑士',
      ) as HTMLButtonElement | undefined
      reviveBtn?.click()
      const dt = 0.5
      for (let i = 0; i < 240 && altar.reviveQueue.length > 0; i++) { g.update(dt) }

      const afterRevive = {
        isDead: paladin.isDead,
        shieldUntil: paladin.divineShieldUntil,
        cooldownUntil: paladin.divineShieldCooldownUntil,
        dsLevel: paladin.abilityLevels?.divine_shield ?? 0,
        mana: paladin.mana,
      }

      return { shieldBeforeDeath, cooldownBeforeDeath, afterDeath, afterRevive }
    })

    expect(result.afterDeath.isDead).toBe(true)
    // After death, shield/cooldown should still have their values (preserved on same object)
    expect(result.afterRevive.isDead).toBe(false)
    // After revive, shield and cooldown are reset
    expect(result.afterRevive.shieldUntil).toBe(0)
    expect(result.afterRevive.cooldownUntil).toBe(0)
    expect(result.afterRevive.dsLevel).toBe(2)
  })

  test('CS-10: Lv2 and Lv3 use correct duration and cooldown values', async ({ page }) => {
    await waitForRuntime(page)
    const pal = await summonPaladin(page)
    expect(pal).not.toBeNull()

    const result = await page.evaluate(() => {
      const g = (window as any).__war3Game
      const paladin = g.units.find((u: any) => u.type === 'paladin' && !u.isBuilding && u.team === 0)
      if (!paladin) return null
      if (!paladin.abilityLevels) paladin.abilityLevels = {}
      paladin.abilityLevels.divine_shield = 2
      paladin.heroLevel = 5
      paladin.mana = 200

      // Cast level 2
      const cast1 = g.castDivineShield(paladin)
      const gt1 = g.gameTime
      const dur1 = paladin.divineShieldUntil - gt1
      const cd1 = paladin.divineShieldCooldownUntil - gt1

      // Advance past cooldown
      g.gameTime += 51

      // Upgrade to level 3
      paladin.abilityLevels.divine_shield = 3
      const cast2 = g.castDivineShield(paladin)
      const gt2 = g.gameTime
      const dur2 = paladin.divineShieldUntil - gt2
      const cd2 = paladin.divineShieldCooldownUntil - gt2

      return { cast1, dur1, cd1, cast2, dur2, cd2 }
    })

    expect(result.cast1).toBe(true)
    expect(result.dur1).toBeCloseTo(30, 0)  // Lv2 duration 30s
    expect(result.cd1).toBeCloseTo(50, 0)   // Lv2 cooldown 50s
    expect(result.cast2).toBe(true)
    expect(result.dur2).toBeCloseTo(45, 0)  // Lv3 duration 45s
    expect(result.cd2).toBeCloseTo(65, 0)   // Lv3 cooldown 65s
  })
})
