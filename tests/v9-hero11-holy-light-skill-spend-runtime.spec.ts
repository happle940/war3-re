/**
 * V9 HERO11-IMPL1 Holy Light skill-point spend runtime proof.
 *
 * Proves:
 * 1. New Paladin has learn Holy Light action, cannot cast before learning.
 * 2. Learning level 1 consumes 1 skill point, enables level-1 Holy Light.
 * 3. Holy Light level 2 cannot be learned before Paladin level 3.
 * 4. After leveling to 3, learning level 2 heals 400.
 * 5. Learned Holy Light level and skill points persist through death/revive.
 * 6. HERO7 target legality still passes after learning.
 *
 * Not: undead damage runtime, other abilities, other heroes, AI, items, aura,
 * ultimate, full hero panel, command-card styling.
 */
import { test, expect, type Page } from '@playwright/test'
import { ABILITIES, UNITS, HERO_ABILITY_LEVELS, HERO_XP_RULES } from '../src/game/GameData'

const BASE_RUNTIME = 'http://127.0.0.1:4173/?runtimeTest=1'
const HL = ABILITIES.holy_light

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

/** Summon a Paladin through the Altar runtime path */
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
    return paladin ? {
      type: paladin.type,
      mana: paladin.mana,
      maxMana: paladin.maxMana,
      heroLevel: paladin.heroLevel,
      heroSkillPoints: paladin.heroSkillPoints,
      abilityLevels: paladin.abilityLevels,
    } : null
  })
}

/** Select paladin and refresh command card */
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

test.describe('V9 HERO11-IMPL1 Holy Light skill-point spend runtime', () => {
  test.setTimeout(180000)

  test('SP-1: new Paladin has learn button, no cast button, cannot cast', async ({ page }) => {
    await waitForRuntime(page)
    const pal = await summonPaladin(page)
    expect(pal).not.toBeNull()
    expect(pal.heroSkillPoints).toBe(1)
    expect(pal.abilityLevels?.holy_light ?? 0).toBe(0)

    await selectPaladin(page)

    const result = await page.evaluate(() => {
      const g = (window as any).__war3Game
      const paladin = g.units.find((u: any) => u.type === 'paladin' && !u.isBuilding && u.team === 0)
      if (!paladin) return { found: false }

      // Create injured ally to test cast rejection
      const footman = g.spawnUnit('footman', 0, paladin.mesh.position.x + 1, paladin.mesh.position.z)
      footman.hp = 50

      // Try to cast — should fail because no level learned
      const castResult = g.castHolyLight(paladin, footman)

      // Check command card buttons
      const buttons = Array.from(document.querySelectorAll('#command-card button'))
      const learnBtn = buttons.find((b: any) =>
        b.querySelector('.btn-label')?.textContent?.trim()?.includes('学习圣光术'),
      )
      const castBtn = buttons.find((b: any) => {
          const txt = b.querySelector('.btn-label')?.textContent?.trim() ?? ''
          return txt.startsWith('圣光术 (Lv')
        })

      return {
        found: true,
        castResult,
        hasLearnBtn: !!learnBtn,
        learnBtnEnabled: learnBtn?.disabled === false,
        hasCastBtn: !!castBtn,
      }
    })

    expect(result.found).toBe(true)
    expect(result.castResult).toBe(false)
    expect(result.hasLearnBtn).toBe(true)
    expect(result.learnBtnEnabled).toBe(true)
    expect(result.hasCastBtn).toBe(false)
  })

  test('SP-2: learning level 1 consumes 1 SP, enables level-1 Holy Light', async ({ page }) => {
    await waitForRuntime(page)
    const pal = await summonPaladin(page)
    expect(pal).not.toBeNull()
    expect(pal.heroSkillPoints).toBe(1)

    await selectPaladin(page)

    // Click the learn button
    const afterLearn = await page.evaluate(() => {
      const g = (window as any).__war3Game
      const paladin = g.units.find((u: any) => u.type === 'paladin' && !u.isBuilding && u.team === 0)
      if (!paladin) return null

      // Find and click learn button
      const buttons = Array.from(document.querySelectorAll('#command-card button'))
      const learnBtn = buttons.find((b: any) =>
        b.querySelector('.btn-label')?.textContent?.trim()?.includes('学习圣光术'),
      ) as HTMLButtonElement | undefined
      if (learnBtn) learnBtn.click()

      // Re-read fresh state
      const fresh = g.units.find((u: any) => u.type === 'paladin' && !u.isBuilding && u.team === 0)
      return {
        sp: fresh.heroSkillPoints,
        hlLevel: fresh.abilityLevels?.holy_light ?? 0,
      }
    })

    expect(afterLearn).not.toBeNull()
    expect(afterLearn.sp).toBe(0)
    expect(afterLearn.hlLevel).toBe(1)

    // Now test Holy Light actually works
    await selectPaladin(page)

    const castResult = await page.evaluate(() => {
      const g = (window as any).__war3Game
      const paladin = g.units.find((u: any) => u.type === 'paladin' && !u.isBuilding && u.team === 0)
      if (!paladin) return null

      const footman = g.spawnUnit('footman', 0, paladin.mesh.position.x + 1, paladin.mesh.position.z)
      footman.hp = 50

      const manaBefore = paladin.mana
      const hpBefore = footman.hp
      const castOk = g.castHolyLight(paladin, footman)
      const fresh = g.units.find((u: any) => u.type === 'paladin' && !u.isBuilding && u.team === 0)
      const freshFootman = g.units.find((u: any) => u === footman)

      return {
        castOk,
        manaSpent: manaBefore - fresh.mana,
        healed: freshFootman.hp - hpBefore,
        hpAfter: freshFootman.hp,
      }
    })

    expect(castResult).not.toBeNull()
    expect(castResult.castOk).toBe(true)
    expect(castResult.manaSpent).toBe(65)
    // Level 1 heals 200, but footman only had 50 missing from full
    const expectedHeal = Math.min(200, (UNITS.footman as any).hp - 50)
    expect(castResult.healed).toBe(expectedHeal)
  })

  test('SP-3: level 2 cannot be learned before Paladin level 3', async ({ page }) => {
    await waitForRuntime(page)
    const pal = await summonPaladin(page)
    expect(pal).not.toBeNull()

    // Learn level 1 first
    await selectPaladin(page)
    await page.evaluate(() => {
      const g = (window as any).__war3Game
      const paladin = g.units.find((u: any) => u.type === 'paladin' && !u.isBuilding && u.team === 0)
      if (!paladin) return
      if (!paladin.abilityLevels) paladin.abilityLevels = {}
      paladin.abilityLevels.holy_light = 1
      // Give skill points but keep at level 1
      paladin.heroSkillPoints = 2
      g._lastCmdKey = ''
      g.updateHUD(0.016)
    })

    await selectPaladin(page)

    const result = await page.evaluate(() => {
      const g = (window as any).__war3Game
      const paladin = g.units.find((u: any) => u.type === 'paladin' && !u.isBuilding && u.team === 0)
      if (!paladin) return null

      const buttons = Array.from(document.querySelectorAll('#command-card button'))
      const learnBtn = buttons.find((b: any) =>
        b.querySelector('.btn-label')?.textContent?.trim()?.includes('学习圣光术 (Lv2)'),
      ) as HTMLButtonElement | undefined

      return {
        hasLearnBtn: !!learnBtn,
        disabled: learnBtn?.disabled ?? null,
        reason: learnBtn?.dataset.disabledReason ?? '',
        sp: paladin.heroSkillPoints,
        heroLevel: paladin.heroLevel,
      }
    })

    expect(result).not.toBeNull()
    expect(result.hasLearnBtn).toBe(true)
    expect(result.disabled).toBe(true)
    expect(result.reason).toContain('3')
    expect(result.sp).toBe(2)
    expect(result.heroLevel).toBe(1)
  })

  test('SP-4: at level 3, learning level 2 heals 400', async ({ page }) => {
    await waitForRuntime(page)
    const pal = await summonPaladin(page)
    expect(pal).not.toBeNull()

    // Manually set Paladin to level 3 with level 1 learned and 2 SP
    await page.evaluate(() => {
      const g = (window as any).__war3Game
      const paladin = g.units.find((u: any) => u.type === 'paladin' && !u.isBuilding && u.team === 0)
      if (!paladin) return
      paladin.heroLevel = 3
      paladin.heroSkillPoints = 2
      if (!paladin.abilityLevels) paladin.abilityLevels = {}
      paladin.abilityLevels.holy_light = 1
      g._lastCmdKey = ''
      g.updateHUD(0.016)
    })

    await selectPaladin(page)

    // Click learn level 2
    const afterLearn = await page.evaluate(() => {
      const g = (window as any).__war3Game
      const buttons = Array.from(document.querySelectorAll('#command-card button'))
      const learnBtn = buttons.find((b: any) =>
        b.querySelector('.btn-label')?.textContent?.trim()?.includes('学习圣光术 (Lv2)'),
      ) as HTMLButtonElement | undefined
      if (learnBtn && !learnBtn.disabled) learnBtn.click()

      const fresh = g.units.find((u: any) => u.type === 'paladin' && !u.isBuilding && u.team === 0)
      return {
        sp: fresh.heroSkillPoints,
        hlLevel: fresh.abilityLevels?.holy_light ?? 0,
      }
    })

    expect(afterLearn.sp).toBe(1)
    expect(afterLearn.hlLevel).toBe(2)

    // Now cast and verify 400 heal
    await selectPaladin(page)

    const castResult = await page.evaluate(() => {
      const g = (window as any).__war3Game
      const paladin = g.units.find((u: any) => u.type === 'paladin' && !u.isBuilding && u.team === 0)
      if (!paladin) return null

      // Give the target enough missing HP so level 2 proves a full 400 heal.
      const footman = g.spawnUnit('footman', 0, paladin.mesh.position.x + 1, paladin.mesh.position.z)
      footman.maxHp = 700
      footman.hp = 50

      const manaBefore = paladin.mana
      const hpBefore = footman.hp
      const castOk = g.castHolyLight(paladin, footman)
      const freshFootman = g.units.find((u: any) => u === footman)
      const freshPal = g.units.find((u: any) => u.type === 'paladin' && !u.isBuilding && u.team === 0)

      return {
        castOk,
        manaSpent: manaBefore - freshPal.mana,
        healed: freshFootman.hp - hpBefore,
        hpAfter: freshFootman.hp,
        maxHp: freshFootman.maxHp,
      }
    })

    expect(castResult.castOk).toBe(true)
    expect(castResult.manaSpent).toBe(65)
    expect(castResult.healed).toBe(400)
  })

  test('SP-5: learned level and SP persist through death and revive', async ({ page }) => {
    await waitForRuntime(page)
    const pal = await summonPaladin(page)
    expect(pal).not.toBeNull()

    // Learn level 1, set level 3 with 1 SP remaining
    const setup = await page.evaluate(() => {
      const g = (window as any).__war3Game
      const paladin = g.units.find((u: any) => u.type === 'paladin' && !u.isBuilding && u.team === 0)
      if (!paladin) return null
      paladin.heroLevel = 3
      paladin.heroSkillPoints = 2
      if (!paladin.abilityLevels) paladin.abilityLevels = {}
      paladin.abilityLevels.holy_light = 1
      return { sp: paladin.heroSkillPoints, hlLevel: paladin.abilityLevels.holy_light }
    })
    expect(setup.hlLevel).toBe(1)
    expect(setup.sp).toBe(2)

    // Kill the Paladin through the normal death pass.
    await page.evaluate(() => {
      const g = (window as any).__war3Game
      const paladin = g.units.find((u: any) => u.type === 'paladin' && !u.isBuilding && u.team === 0)
      if (!paladin) return
      paladin.hp = 0
      g.update(0.5)
      g._lastCmdKey = ''
    })

    // Check state after death
    const afterDeath = await page.evaluate(() => {
      const g = (window as any).__war3Game
      const paladin = g.units.find((u: any) => u.type === 'paladin' && !u.isBuilding && u.team === 0)
      if (!paladin) return null
      return {
        isDead: paladin.isDead,
        hlLevel: paladin.abilityLevels?.holy_light ?? 0,
        sp: paladin.heroSkillPoints,
        heroLevel: paladin.heroLevel,
      }
    })
    expect(afterDeath.isDead).toBe(true)
    expect(afterDeath.hlLevel).toBe(1)
    expect(afterDeath.sp).toBe(2)

    // Revive through the Altar queue path, not by mutating hero fields directly.
    const afterRevive = await page.evaluate(() => {
      const g = (window as any).__war3Game
      const altar = g.units.find((u: any) => u.type === 'altar_of_kings' && u.isBuilding && u.team === 0)
      const paladin = g.units.find((u: any) => u.type === 'paladin' && !u.isBuilding && u.team === 0)
      if (!altar || !paladin) return null

      g.selectionModel.clear()
      g.selectionModel.setSelection([altar])
      g._lastCmdKey = ''
      g.updateHUD(0.016)

      const reviveBtn = Array.from(document.querySelectorAll('#command-card button')).find((b: any) =>
        b.querySelector('.btn-label')?.textContent?.trim() === '复活圣骑士',
      ) as HTMLButtonElement | undefined
      const hpBeforeRevive = paladin.hp
      const recordIndex = g.units.indexOf(paladin)
      reviveBtn?.click()
      const queued = altar.reviveQueue.length

      const dt = 0.5
      for (let i = 0; i < 240 && altar.reviveQueue.length > 0; i++) {
        g.update(dt)
      }

      const revived = g.units[recordIndex]
      return {
        hadReviveButton: !!reviveBtn,
        reviveButtonEnabled: reviveBtn?.disabled === false,
        queued,
        sameRecord: revived === paladin,
        queueLength: altar.reviveQueue.length,
        hpBeforeRevive,
        isDead: revived.isDead,
        visible: revived.mesh.visible,
        hlLevel: revived.abilityLevels?.holy_light ?? 0,
        sp: revived.heroSkillPoints,
        heroLevel: revived.heroLevel,
      }
    })
    expect(afterRevive).not.toBeNull()
    if (!afterRevive) throw new Error('revive result missing')
    expect(afterRevive.hadReviveButton).toBe(true)
    expect(afterRevive.reviveButtonEnabled).toBe(true)
    expect(afterRevive.queued).toBe(1)
    expect(afterRevive.sameRecord).toBe(true)
    expect(afterRevive.queueLength).toBe(0)
    expect(afterRevive.hpBeforeRevive).toBe(0)
    expect(afterRevive.isDead).toBe(false)
    expect(afterRevive.visible).toBe(true)
    expect(afterRevive.hlLevel).toBe(1)
    expect(afterRevive.sp).toBe(2)
    expect(afterRevive.heroLevel).toBe(3)
  })

  test('SP-6: HERO7 target legality still passes after learning', async ({ page }) => {
    await waitForRuntime(page)
    const pal = await summonPaladin(page)
    expect(pal).not.toBeNull()

    // Learn Holy Light level 1
    await page.evaluate(() => {
      const g = (window as any).__war3Game
      const paladin = g.units.find((u: any) => u.type === 'paladin' && !u.isBuilding && u.team === 0)
      if (!paladin) return
      if (!paladin.abilityLevels) paladin.abilityLevels = {}
      paladin.abilityLevels.holy_light = 1
      paladin.heroSkillPoints = 0
    })

    const result = await page.evaluate(() => {
      const g = (window as any).__war3Game
      const paladin = g.units.find((u: any) => u.type === 'paladin' && !u.isBuilding && u.team === 0)
      if (!paladin) return { found: false }

      paladin.hp = 100

      // Self
      const manaBefore = paladin.mana
      const selfResult = g.castHolyLight(paladin, paladin)
      const selfManaSpent = manaBefore - paladin.mana

      // Enemy
      const enemy = g.spawnUnit('footman', 1, paladin.mesh.position.x + 1, paladin.mesh.position.z)
      enemy.hp = 50
      const enemyResult = g.castHolyLight(paladin, enemy)

      // Building
      const barracks = g.units.find((u: any) => u.team === 0 && u.type === 'barracks' && u.isBuilding)
      let buildingResult = true
      if (barracks) {
        const savedHp = barracks.hp
        barracks.hp = Math.max(1, barracks.maxHp - 200)
        buildingResult = g.castHolyLight(paladin, barracks)
        barracks.hp = savedHp
      }

      // Full-health ally
      const fullAlly = g.spawnUnit('footman', 0, paladin.mesh.position.x + 2, paladin.mesh.position.z)
      const fullAllyResult = g.castHolyLight(paladin, fullAlly)

      // Out-of-range injured ally
      const farAlly = g.spawnUnit('footman', 0, paladin.mesh.position.x + 20, paladin.mesh.position.z)
      farAlly.hp = 50
      const rangeResult = g.castHolyLight(paladin, farAlly)

      return {
        found: true,
        selfResult,
        selfManaSpent,
        enemyResult,
        buildingResult,
        fullAllyResult,
        rangeResult,
      }
    })

    expect(result.found).toBe(true)
    expect(result.selfResult).toBe(false)
    expect(result.selfManaSpent).toBe(0)
    expect(result.enemyResult).toBe(false)
    expect(result.buildingResult).toBe(false)
    expect(result.fullAllyResult).toBe(false)
    expect(result.rangeResult).toBe(false)
  })
})
