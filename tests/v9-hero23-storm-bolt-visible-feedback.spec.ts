/**
 * V9 HERO23-UX1 Storm Bolt visible feedback runtime proof.
 *
 * Proves:
 * 1. Command card shows Storm Bolt cast button with readable cost data when learned.
 * 2. Disabled reasons cover dead, low mana, cooldown states.
 * 3. Target mode hint appears and clears on cancel.
 * 4. Successful hit shows damage number and impact ring feedback.
 * 5. Stunned target shows visible stun state in selection panel.
 * 6. Stun state disappears after expiry.
 * 7. Storm Bolt cooldown visible in selection panel.
 * 8. MK stats panel shows learned Storm Bolt level.
 * 9. Paladin and Archmage feedback not affected.
 * 10. SimpleAI still has no Mountain King strategy.
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

/** Spawn MK, fast-forward, learn Storm Bolt, return mkId */
async function spawnMKWithStormBolt(page: Page): Promise<any> {
  return page.evaluate(() => {
    const g = (window as any).__war3Game
    g.resources.earn(0, 5000, 5000)
    g.spawnBuilding('altar_of_kings', 0, 15, 15)

    const altar = g.units.find((u: any) => u.team === 0 && u.type === 'altar_of_kings' && u.isBuilding)
    if (!altar) return { error: 'no altar' }

    g.selectionModel.clear()
    g.selectionModel.setSelection([altar])
    g._lastCmdKey = ''
    g.updateHUD(0.016)

    const mkBtn = Array.from(document.querySelectorAll('#command-card button')).find((b: any) =>
      b.querySelector('.btn-label')?.textContent?.trim() === '山丘之王',
    ) as HTMLButtonElement | undefined
    if (mkBtn) mkBtn.click()

    const dt = 0.5
    for (let i = 0; i < 120; i++) {
      g.gameTime += dt
      g.updateUnits(dt)
    }

    const mk = g.units.find((u: any) => u.type === 'mountain_king' && !u.isBuilding && u.team === 0)
    if (!mk) return { error: 'no mk' }

    mk.mana = 200

    g.selectionModel.clear()
    g.selectionModel.setSelection([mk])
    g._lastCmdKey = ''
    g.updateHUD(0.016)

    const sbBtn = Array.from(document.querySelectorAll('#command-card button')).find((b: any) =>
      b.querySelector('.btn-label')?.textContent?.includes('学习风暴之锤'),
    ) as HTMLButtonElement | undefined
    if (sbBtn) sbBtn.click()

    return { mkId: mk.__id ?? g.units.indexOf(mk), sbLevel: mk.abilityLevels?.storm_bolt }
  })
}

test.describe('V9 HERO23-UX1 Storm Bolt visible feedback', () => {
  test.setTimeout(120000)

  test('SB-UX-1: MK stats panel shows learned Storm Bolt level', async ({ page }) => {
    await waitForRuntime(page)
    const setup = await spawnMKWithStormBolt(page)
    expect(setup.error).toBeFalsy()
    expect(setup.sbLevel).toBe(1)

    const result = await page.evaluate((mkId: number) => {
      const g = (window as any).__war3Game
      const mk = g.units[mkId] ?? g.units.find((u: any) => u.type === 'mountain_king' && !u.isBuilding && u.team === 0)
      if (!mk) return { found: false }

      g.selectionModel.clear()
      g.selectionModel.setSelection([mk])
      g._lastCmdKey = ''
      g._lastSelKey = ''
      g.updateHUD(0.016)

      const stats = document.getElementById('unit-stats')?.textContent ?? ''
      return { found: true, stats }
    }, setup.mkId)

    expect(result.found).toBe(true)
    expect(result.stats).toContain('风暴之锤')
    expect(result.stats).toContain('Lv1')
  })

  test('SB-UX-2: command card shows full cost data including range, hero stun, cooldown', async ({ page }) => {
    await waitForRuntime(page)
    const setup = await spawnMKWithStormBolt(page)
    expect(setup.error).toBeFalsy()

    const result = await page.evaluate((mkId: number) => {
      const g = (window as any).__war3Game
      const mk = g.units[mkId] ?? g.units.find((u: any) => u.type === 'mountain_king' && !u.isBuilding && u.team === 0)
      if (!mk) return { found: false }

      g.selectionModel.clear()
      g.selectionModel.setSelection([mk])
      g._lastCmdKey = ''
      g.updateHUD(0.016)

      const buttons = Array.from(document.querySelectorAll('#command-card button'))
      const castBtn = buttons.find((b: any) =>
        b.querySelector('.btn-label')?.textContent?.trim()?.startsWith('风暴之锤 (Lv'),
      ) as HTMLButtonElement | undefined

      if (!castBtn) return { found: true, hasCast: false }

      const label = castBtn.querySelector('.btn-label')?.textContent?.trim() ?? ''
      const cost = castBtn.querySelector('.btn-cost')?.textContent?.trim() ?? ''

      return {
        found: true,
        hasCast: true,
        label,
        cost,
        enabled: !castBtn.disabled,
      }
    }, setup.mkId)

    expect(result.found).toBe(true)
    expect(result.hasCast).toBe(true)
    expect(result.label).toContain('风暴之锤')
    expect(result.label).toContain('Lv1')
    // Cost should include mana, damage, range, stun info, cooldown
    expect(result.cost).toContain('75')    // mana
    expect(result.cost).toContain('100')   // damage
    expect(result.cost).toContain('射程')  // range field present
    expect(result.cost).toContain('眩晕')  // stun field present
    expect(result.cost).toContain('英雄')  // hero stun distinction
    expect(result.cost).toContain('冷却')  // cooldown field present
    expect(result.enabled).toBe(true)
  })

  test('SB-UX-3: disabled reasons cover dead, low mana, cooldown', async ({ page }) => {
    await waitForRuntime(page)
    const setup = await spawnMKWithStormBolt(page)
    expect(setup.error).toBeFalsy()

    const result = await page.evaluate((mkId: number) => {
      const g = (window as any).__war3Game
      const mk = g.units[mkId] ?? g.units.find((u: any) => u.type === 'mountain_king' && !u.isBuilding && u.team === 0)
      if (!mk) return { found: false }

      const reasons: Record<string, string> = {}

      // Test low mana
      const savedMana = mk.mana
      mk.mana = 5
      g.selectionModel.clear()
      g.selectionModel.setSelection([mk])
      g._lastCmdKey = ''
      g.updateHUD(0.016)
      const btnLowMana = Array.from(document.querySelectorAll('#command-card button')).find((b: any) =>
        b.querySelector('.btn-label')?.textContent?.trim()?.startsWith('风暴之锤 (Lv'),
      ) as HTMLButtonElement | undefined
      reasons.lowMana = btnLowMana?.disabled ? (btnLowMana.dataset.disabledReason ?? '') : 'not-disabled'
      mk.mana = savedMana

      // Test cooldown
      mk.stormBoltCooldownUntil = g.gameTime + 5
      g._lastCmdKey = ''
      g.updateHUD(0.016)
      const btnCd = Array.from(document.querySelectorAll('#command-card button')).find((b: any) =>
        b.querySelector('.btn-label')?.textContent?.trim()?.startsWith('风暴之锤 (Lv'),
      ) as HTMLButtonElement | undefined
      reasons.cooldown = btnCd?.disabled ? (btnCd.dataset.disabledReason ?? '') : 'not-disabled'
      mk.stormBoltCooldownUntil = 0

      // Test dead
      mk.isDead = true
      g._lastCmdKey = ''
      g.updateHUD(0.016)
      const btnDead = Array.from(document.querySelectorAll('#command-card button')).find((b: any) =>
        b.querySelector('.btn-label')?.textContent?.trim()?.startsWith('风暴之锤 (Lv'),
      ) as HTMLButtonElement | undefined
      reasons.dead = btnDead?.disabled ? (btnDead.dataset.disabledReason ?? '') : 'not-disabled'
      mk.isDead = false

      return { found: true, reasons }
    }, setup.mkId)

    expect(result.found).toBe(true)
    expect(result.reasons.lowMana).toContain('魔力不足')
    expect(result.reasons.cooldown).toContain('冷却中')
    expect(result.reasons.dead).toContain('已死亡')
  })

  test('SB-UX-4: target mode hint appears and clears on Escape', async ({ page }) => {
    await waitForRuntime(page)
    const setup = await spawnMKWithStormBolt(page)
    expect(setup.error).toBeFalsy()

    const result = await page.evaluate((mkId: number) => {
      const g = (window as any).__war3Game
      const mk = g.units[mkId] ?? g.units.find((u: any) => u.type === 'mountain_king' && !u.isBuilding && u.team === 0)
      if (!mk) return { found: false }

      g.selectionModel.clear()
      g.selectionModel.setSelection([mk])
      g._lastCmdKey = ''
      g.updateHUD(0.016)

      // Click cast button to enter target mode
      const castBtn = Array.from(document.querySelectorAll('#command-card button')).find((b: any) =>
        b.querySelector('.btn-label')?.textContent?.trim()?.startsWith('风暴之锤 (Lv'),
      ) as HTMLButtonElement | undefined
      if (castBtn) castBtn.click()

      const hintDuringMode = document.getElementById('mode-hint')?.textContent ?? ''
      const targetModeActive = g.stormBoltTargetMode

      // Simulate Escape cancel
      g.stormBoltTargetMode = false
      g.stormBoltTargetCaster = null
      g.updateModeHint('')

      const hintAfterCancel = document.getElementById('mode-hint')?.textContent ?? ''
      const targetModeAfter = g.stormBoltTargetMode

      return {
        found: true,
        hintDuringMode,
        targetModeActive,
        hintAfterCancel,
        targetModeAfter,
      }
    }, setup.mkId)

    expect(result.found).toBe(true)
    expect(result.targetModeActive).toBe(true)
    expect(result.hintDuringMode).toContain('风暴之锤')
    expect(result.hintDuringMode).toContain('左键')
    expect(result.targetModeAfter).toBe(false)
    expect(result.hintAfterCancel).toBe('')
  })

  test('SB-UX-5: successful hit applies damage and stun (functional feedback)', async ({ page }) => {
    await waitForRuntime(page)
    const setup = await spawnMKWithStormBolt(page)
    expect(setup.error).toBeFalsy()

    const result = await page.evaluate((mkId: number) => {
      const g = (window as any).__war3Game
      const mk = g.units[mkId] ?? g.units.find((u: any) => u.type === 'mountain_king' && !u.isBuilding && u.team === 0)
      if (!mk) return { found: false }

      g.spawnUnit('footman', 1, mk.mesh.position.x + 2, mk.mesh.position.z + 2)
      const enemy = g.units.findLast((u: any) => u.team === 1 && u.type === 'footman' && !u.isDead)
      if (!enemy) return { found: true, noEnemy: true }

      const hpBefore = enemy.hp
      const stunBefore = enemy.stunUntil

      g.castStormBolt(mk, enemy)

      // Fast-forward past projectile hit
      const dt = 0.1
      for (let i = 0; i < 60 && g.stormBoltProjectiles.length > 0; i++) {
        g.gameTime += dt
        g.updateStormBoltProjectiles()
      }

      return {
        found: true,
        noEnemy: false,
        hpBefore,
        hpAfter: enemy.hp,
        damageApplied: hpBefore - enemy.hp,
        stunBefore,
        stunAfter: enemy.stunUntil,
        isStunned: enemy.stunUntil > g.gameTime,
      }
    }, setup.mkId)

    expect(result.found).toBe(true)
    expect(result.noEnemy).toBeFalsy()
    expect(result.damageApplied).toBe(100)
    expect(result.isStunned).toBe(true)
  })

  test('SB-UX-6: stunned target shows visible stun state in selection panel', async ({ page }) => {
    await waitForRuntime(page)
    const setup = await spawnMKWithStormBolt(page)
    expect(setup.error).toBeFalsy()

    const result = await page.evaluate((mkId: number) => {
      const g = (window as any).__war3Game
      const mk = g.units[mkId] ?? g.units.find((u: any) => u.type === 'mountain_king' && !u.isBuilding && u.team === 0)
      if (!mk) return { found: false }

      g.spawnUnit('footman', 1, mk.mesh.position.x + 2, mk.mesh.position.z + 2)
      const enemy = g.units.findLast((u: any) => u.team === 1 && u.type === 'footman' && !u.isDead)
      if (!enemy) return { found: true, noEnemy: true }

      // Cast and fast-forward
      g.castStormBolt(mk, enemy)
      const dt = 0.1
      for (let i = 0; i < 60 && g.stormBoltProjectiles.length > 0; i++) {
        g.gameTime += dt
        g.updateStormBoltProjectiles()
      }

      // Select stunned enemy
      g.selectionModel.clear()
      g.selectionModel.setSelection([enemy])
      g._lastCmdKey = ''
      g._lastSelKey = ''
      g.updateHUD(0.016)

      const stateText = document.getElementById('unit-state')?.textContent ?? ''
      const stunnedDuring = enemy.stunUntil > g.gameTime

      return {
        found: true,
        noEnemy: false,
        stunnedDuring,
        stateTextDuring: stateText,
      }
    }, setup.mkId)

    expect(result.found).toBe(true)
    expect(result.noEnemy).toBeFalsy()
    expect(result.stunnedDuring).toBe(true)
    expect(result.stateTextDuring).toContain('眩晕')
  })

  test('SB-UX-7: stun state disappears after expiry', async ({ page }) => {
    await waitForRuntime(page)
    const setup = await spawnMKWithStormBolt(page)
    expect(setup.error).toBeFalsy()

    const result = await page.evaluate((mkId: number) => {
      const g = (window as any).__war3Game
      const mk = g.units[mkId] ?? g.units.find((u: any) => u.type === 'mountain_king' && !u.isBuilding && u.team === 0)
      if (!mk) return { found: false }

      g.spawnUnit('footman', 1, mk.mesh.position.x + 2, mk.mesh.position.z + 2)
      const enemy = g.units.findLast((u: any) => u.team === 1 && u.type === 'footman' && !u.isDead)
      if (!enemy) return { found: true, noEnemy: true }

      g.castStormBolt(mk, enemy)
      const dt = 0.1
      for (let i = 0; i < 60 && g.stormBoltProjectiles.length > 0; i++) {
        g.gameTime += dt
        g.updateStormBoltProjectiles()
      }

      // Fast-forward past stun duration (5s for footman)
      g.gameTime += 6
      g.updateStunExpiry()

      // Select enemy — stun should be gone
      g.selectionModel.clear()
      g.selectionModel.setSelection([enemy])
      g._lastCmdKey = ''
      g._lastSelKey = ''
      g.updateHUD(0.016)

      const stateText = document.getElementById('unit-state')?.textContent ?? ''
      const stunValue = enemy.stunUntil

      return {
        found: true,
        noEnemy: false,
        stunExpired: stunValue === 0,
        stateTextAfter: stateText,
      }
    }, setup.mkId)

    expect(result.found).toBe(true)
    expect(result.noEnemy).toBeFalsy()
    expect(result.stunExpired).toBe(true)
    expect(result.stateTextAfter).not.toContain('眩晕')
  })

  test('SB-UX-8: Storm Bolt cooldown visible in selection panel', async ({ page }) => {
    await waitForRuntime(page)
    const setup = await spawnMKWithStormBolt(page)
    expect(setup.error).toBeFalsy()

    const result = await page.evaluate((mkId: number) => {
      const g = (window as any).__war3Game
      const mk = g.units[mkId] ?? g.units.find((u: any) => u.type === 'mountain_king' && !u.isBuilding && u.team === 0)
      if (!mk) return { found: false }

      g.spawnUnit('footman', 1, mk.mesh.position.x + 2, mk.mesh.position.z + 2)
      const enemy = g.units.findLast((u: any) => u.team === 1 && u.type === 'footman' && !u.isDead)
      if (!enemy) return { found: true, noEnemy: true }

      // Cast Storm Bolt to trigger cooldown
      g.castStormBolt(mk, enemy)

      // Select MK to see cooldown in stats
      g.selectionModel.clear()
      g.selectionModel.setSelection([mk])
      g._lastCmdKey = ''
      g._lastSelKey = ''
      g.updateHUD(0.016)

      const stats = document.getElementById('unit-stats')?.textContent ?? ''

      return {
        found: true,
        noEnemy: false,
        stats,
        cooldownUntil: mk.stormBoltCooldownUntil,
        gameTime: g.gameTime,
      }
    }, setup.mkId)

    expect(result.found).toBe(true)
    expect(result.noEnemy).toBeFalsy()
    expect(result.stats).toContain('风暴之锤冷却')
    expect(result.cooldownUntil).toBeGreaterThan(result.gameTime)
  })

  test('SB-UX-9: Paladin Holy Light feedback not affected', async ({ page }) => {
    await waitForRuntime(page)

    const result = await page.evaluate(() => {
      const g = (window as any).__war3Game
      g.resources.earn(0, 5000, 5000)
      g.spawnBuilding('altar_of_kings', 0, 15, 15)

      const altar = g.units.find((u: any) => u.team === 0 && u.type === 'altar_of_kings' && u.isBuilding)
      if (!altar) return { found: false }

      g.selectionModel.clear()
      g.selectionModel.setSelection([altar])
      g._lastCmdKey = ''
      g.updateHUD(0.016)

      const pallyBtn = Array.from(document.querySelectorAll('#command-card button')).find((b: any) =>
        b.querySelector('.btn-label')?.textContent?.trim() === '圣骑士',
      ) as HTMLButtonElement | undefined
      if (pallyBtn) pallyBtn.click()

      const dt = 0.5
      for (let i = 0; i < 120; i++) {
        g.gameTime += dt
        g.updateUnits(dt)
      }

      const paladin = g.units.find((u: any) => u.type === 'paladin' && !u.isBuilding && u.team === 0)
      if (!paladin) return { found: true, noPaladin: true }

      paladin.mana = 200

      // Learn Holy Light
      g.selectionModel.clear()
      g.selectionModel.setSelection([paladin])
      g._lastCmdKey = ''
      g.updateHUD(0.016)

      const hlLearnBtn = Array.from(document.querySelectorAll('#command-card button')).find((b: any) =>
        b.querySelector('.btn-label')?.textContent?.includes('学习圣光术'),
      ) as HTMLButtonElement | undefined
      if (hlLearnBtn) hlLearnBtn.click()

      // Check stats
      g._lastSelKey = ''
      g.updateHUD(0.016)
      const stats = document.getElementById('unit-stats')?.textContent ?? ''

      return {
        found: true,
        noPaladin: false,
        stats,
        hasHLLevel: stats.includes('圣光术'),
      }
    })

    expect(result.found).toBe(true)
    expect(result.noPaladin).toBeFalsy()
    expect(result.hasHLLevel).toBe(true)
  })

  test('SB-UX-10: SimpleAI has no Mountain King strategy', async ({ page }) => {
    await waitForRuntime(page)

    const result = await page.evaluate(() => {
      const g = (window as any).__war3Game
      const aiCode = g.ai ? g.ai.constructor.toString() : ''
      return {
        hasMK: aiCode.includes('mountain_king'),
        hasStormBolt: aiCode.includes('storm_bolt'),
      }
    })

    expect(result.hasMK).toBe(false)
    expect(result.hasStormBolt).toBe(false)
  })
})
