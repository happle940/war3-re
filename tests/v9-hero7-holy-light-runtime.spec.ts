/**
 * V9 HERO7-IMPL1 Holy Light manual runtime proof.
 *
 * Proves:
 * 1. Paladin command card shows 圣光术 button.
 * 2. Clicking button heals injured ally, spends 65 mana, applies 5s cooldown.
 * 3. Direct cast also works: heals, spends mana, cooldown.
 * 4. Target filtering: self, enemy, building, full-health, out-of-range rejected.
 * 5. Disabled states: insufficient mana, cooldown shown on command card.
 * 6. Holy Light absent from Altar, Barracks, worker, Footman, Knight, Priest, Sorceress, enemy.
 *
 * Not revive, XP, leveling, autocast, AI, visuals, items, or other heroes.
 */
import { test, expect, type Page } from '@playwright/test'
import { ABILITIES, UNITS } from '../src/game/GameData'

const BASE_RUNTIME = 'http://127.0.0.1:4173/?runtimeTest=1'
const HL = ABILITIES.holy_light
const PALADIN_MAX_MANA = UNITS.paladin.maxMana

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
    return paladin ? { type: paladin.type, mana: paladin.mana, maxMana: paladin.maxMana } : null
  })
}

test.describe('V9 HERO7 Holy Light manual runtime', () => {
  test.setTimeout(120000)

  /** Learn Holy Light level 1 on the Paladin (IMPL1 requires learning before casting) */
  async function learnHolyLightLv1(page: Page) {
    await page.evaluate(() => {
      const g = (window as any).__war3Game
      const paladin = g.units.find((u: any) => u.type === 'paladin' && !u.isBuilding && u.team === 0)
      if (!paladin) return
      if (!paladin.abilityLevels) paladin.abilityLevels = {}
      paladin.abilityLevels.holy_light = 1
      paladin.heroSkillPoints = (paladin.heroSkillPoints ?? 1) - 1
    })
  }

  test('HL-RT1: Paladin command card shows Holy Light button with data values', async ({ page }) => {
    await waitForRuntime(page)
    const paladinExists = await summonPaladin(page)
    expect(paladinExists).not.toBeNull()

    // Learn Holy Light level 1 first (IMPL1: cast requires learned level)
    await learnHolyLightLv1(page)

    const result = await page.evaluate(() => {
      const g = (window as any).__war3Game
      const paladin = g.units.find((u: any) => u.type === 'paladin' && !u.isBuilding && u.team === 0)
      if (!paladin) return { found: false }

      g.selectionModel.clear()
      g.selectionModel.setSelection([paladin])
      g._lastCmdKey = ''
      g.updateHUD(0.016)

      const buttons = Array.from(document.querySelectorAll('#command-card button'))
      const hlBtn = buttons.find((b: any) => {
        const txt = b.querySelector('.btn-label')?.textContent?.trim() ?? ''
        return txt.startsWith('圣光术')
      }) as HTMLButtonElement | undefined

      return {
        found: true,
        hasHLButton: !!hlBtn,
        disabled: hlBtn?.disabled ?? null,
        cost: hlBtn?.querySelector('.btn-cost')?.textContent ?? '',
      }
    })

    expect(result.found).toBe(true)
    expect(result.hasHLButton).toBe(true)
    expect(result.disabled).toBe(false)
    expect(result.cost).toContain(`${HL.cost.mana}`)
    expect(result.cost).toContain(`${HL.effectValue}`)
  })

  test('HL-RT2: clicking command-card Holy Light button heals injured ally', async ({ page }) => {
    await waitForRuntime(page)
    const paladinExists = await summonPaladin(page)
    expect(paladinExists).not.toBeNull()

    // Learn Holy Light level 1 first (IMPL1)
    await learnHolyLightLv1(page)

    const result = await page.evaluate(() => {
      const g = (window as any).__war3Game
      const paladin = g.units.find((u: any) => u.type === 'paladin' && !u.isBuilding && u.team === 0)
      if (!paladin) return { found: false }

      // Create injured footman in range
      const footman = g.spawnUnit('footman', 0, paladin.mesh.position.x + 1, paladin.mesh.position.z)
      footman.hp = 50

      const manaBefore = paladin.mana
      const hpBefore = footman.hp

      // Click the Holy Light button on command card
      g.selectionModel.clear()
      g.selectionModel.setSelection([paladin])
      g._lastCmdKey = ''
      g.updateHUD(0.016)

      const hlBtn = Array.from(document.querySelectorAll('#command-card button')).find((b: any) => {
        const txt = b.querySelector('.btn-label')?.textContent?.trim() ?? ''
        return txt.startsWith('圣光术')
      }) as HTMLButtonElement | undefined
      if (!hlBtn) return { found: true, noButton: true }

      hlBtn.click()

      // Re-read fresh state after click
      const paladinFresh = g.units.find((u: any) => u.type === 'paladin' && !u.isBuilding && u.team === 0)
      const footmanFresh = g.units.find((u: any) => u === footman)

      return {
        found: true,
        noButton: false,
        manaBefore,
        manaAfter: paladinFresh.mana,
        manaSpent: manaBefore - paladinFresh.mana,
        hpBefore,
        hpAfter: footmanFresh.hp,
        healed: footmanFresh.hp - hpBefore,
        cooldownActive: paladinFresh.healCooldownUntil > g.gameTime,
      }
    })

    expect(result.found).toBe(true)
    expect(result.noButton).toBeFalsy()
    expect(result.manaSpent).toBe(HL.cost.mana)
    expect(result.healed).toBe(Math.min(HL.effectValue, UNITS.footman.hp - result.hpBefore))
    expect(result.cooldownActive).toBe(true)
  })

  test('HL-RT3: direct cast caps healing at target max HP', async ({ page }) => {
    await waitForRuntime(page)
    const paladinExists = await summonPaladin(page)
    expect(paladinExists).not.toBeNull()

    // Learn Holy Light level 1 first (IMPL1)
    await learnHolyLightLv1(page)

    const result = await page.evaluate(() => {
      const g = (window as any).__war3Game
      const paladin = g.units.find((u: any) => u.type === 'paladin' && !u.isBuilding && u.team === 0)
      if (!paladin) return { found: false }

      const footman = g.spawnUnit('footman', 0, paladin.mesh.position.x + 1, paladin.mesh.position.z)
      footman.hp = footman.maxHp - 30

      const manaBefore = paladin.mana
      const hpBefore = footman.hp

      const castResult = g.castHolyLight(paladin, footman)

      return {
        found: true,
        castResult,
        manaSpent: manaBefore - paladin.mana,
        healed: footman.hp - hpBefore,
        hpAfter: footman.hp,
        maxHp: footman.maxHp,
        cooldownApplied: paladin.healCooldownUntil > g.gameTime,
      }
    })

    expect(result.found).toBe(true)
    expect(result.castResult).toBe(true)
    expect(result.manaSpent).toBe(HL.cost.mana)
    expect(result.healed).toBe(30)
    expect(result.hpAfter).toBe(result.maxHp)
    expect(result.cooldownApplied).toBe(true)
  })

  test('HL-RT4: target filtering rejects self, enemy, building, full-health, out-of-range', async ({ page }) => {
    await waitForRuntime(page)
    const paladinExists = await summonPaladin(page)
    expect(paladinExists).not.toBeNull()

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
        paladinHpAfterSelf: paladin.hp,
      }
    })

    expect(result.found).toBe(true)
    expect(result.selfResult).toBe(false)
    expect(result.selfManaSpent).toBe(0)
    expect(result.paladinHpAfterSelf).toBe(100)
    expect(result.enemyResult).toBe(false)
    expect(result.buildingResult).toBe(false)
    expect(result.fullAllyResult).toBe(false)
    expect(result.rangeResult).toBe(false)
  })

  test('HL-RT5: insufficient mana and cooldown disable cast and command-card button', async ({ page }) => {
    await waitForRuntime(page)
    const paladinExists = await summonPaladin(page)
    expect(paladinExists).not.toBeNull()

    // Learn Holy Light level 1 first (IMPL1)
    await learnHolyLightLv1(page)

    const result = await page.evaluate(() => {
      const g = (window as any).__war3Game
      const paladin = g.units.find((u: any) => u.type === 'paladin' && !u.isBuilding && u.team === 0)
      if (!paladin) return { found: false }

      const footman = g.spawnUnit('footman', 0, paladin.mesh.position.x + 1, paladin.mesh.position.z)
      footman.hp = 50

      // First cast succeeds
      const cast1 = g.castHolyLight(paladin, footman)
      const cooldownActive = paladin.healCooldownUntil > g.gameTime

      g.selectionModel.clear()
      g.selectionModel.setSelection([paladin])
      g._lastCmdKey = ''
      g.updateHUD(0.016)
      const cooldownBtn = Array.from(document.querySelectorAll('#command-card button')).find((b: any) => {
        const txt = b.querySelector('.btn-label')?.textContent?.trim() ?? ''
        return txt.startsWith('圣光术')
      }) as HTMLButtonElement | undefined

      // Second cast blocked by cooldown
      footman.hp = 50
      const cast2 = g.castHolyLight(paladin, footman)

      // Insufficient mana (past cooldown)
      paladin.mana = 10
      g.gameTime = paladin.healCooldownUntil + 1
      const cast3 = g.castHolyLight(paladin, footman)

      // Command card shows disabled
      paladin.mana = 10
      g.selectionModel.clear()
      g.selectionModel.setSelection([paladin])
      g._lastCmdKey = ''
      g.updateHUD(0.016)

      const hlBtn = Array.from(document.querySelectorAll('#command-card button')).find((b: any) => {
        const txt = b.querySelector('.btn-label')?.textContent?.trim() ?? ''
        return txt.startsWith('圣光术')
      }) as HTMLButtonElement | undefined

      return {
        found: true,
        cast1,
        cooldownActive,
        cooldownBtnDisabled: cooldownBtn?.disabled ?? null,
        cooldownBtnReason: cooldownBtn?.dataset.disabledReason ?? '',
        cast2,
        cast3,
        hlBtnDisabled: hlBtn?.disabled ?? null,
        hlBtnReason: hlBtn?.dataset.disabledReason ?? '',
      }
    })

    expect(result.found).toBe(true)
    expect(result.cast1).toBe(true)
    expect(result.cooldownActive).toBe(true)
    expect(result.cooldownBtnDisabled).toBe(true)
    expect(result.cooldownBtnReason).toContain('冷却')
    expect(result.cast2).toBe(false)
    expect(result.cast3).toBe(false)
    expect(result.hlBtnDisabled).toBe(true)
    expect(result.hlBtnReason).toContain('魔力')
  })

  test('HL-RT6: Holy Light absent from all non-Paladin command cards', async ({ page }) => {
    await waitForRuntime(page)

    const result = await page.evaluate(() => {
      const g = (window as any).__war3Game
      g.resources.earn(0, 10000, 10000)

      // Spawn missing units to ensure concrete checks
      const knight = g.spawnUnit('knight', 0, 30, 30)
      const priest = g.spawnUnit('priest', 0, 31, 30)
      const sorceress = g.spawnUnit('sorceress', 0, 32, 30)
      const extraFootman = g.spawnUnit('footman', 0, 33, 30)
      const enemyFootman = g.spawnUnit('footman', 1, 40, 40)

      const results: Record<string, { checked: boolean; hasHL: boolean }> = {}

      // Check each spawned unit
      for (const [label, unit] of [
        ['worker', g.units.find((u: any) => u.team === 0 && u.type === 'worker' && !u.isBuilding)],
        ['footman', extraFootman],
        ['knight', knight],
        ['priest', priest],
        ['sorceress', sorceress],
        ['enemy_footman', enemyFootman],
      ] as [string, any][]) {
        if (!unit) { results[label] = { checked: false, hasHL: false }; continue }
        g.selectionModel.clear()
        g.selectionModel.setSelection([unit])
        g._lastCmdKey = ''
        g.updateHUD(0.016)
        const hlBtn = Array.from(document.querySelectorAll('#command-card button')).find((b: any) =>
          b.querySelector('.btn-label')?.textContent?.trim() === '圣光术',
        )
        results[label] = { checked: true, hasHL: !!hlBtn }
      }

      // Check buildings
      g.spawnBuilding('altar_of_kings', 0, 25, 25)
      const altar = g.units.find((u: any) => u.team === 0 && u.type === 'altar_of_kings' && u.isBuilding)
      if (altar) {
        g.selectionModel.clear()
        g.selectionModel.setSelection([altar])
        g._lastCmdKey = ''
        g.updateHUD(0.016)
        const hlBtn = Array.from(document.querySelectorAll('#command-card button')).find((b: any) =>
          b.querySelector('.btn-label')?.textContent?.trim() === '圣光术',
        )
        results['altar_of_kings'] = { checked: true, hasHL: !!hlBtn }
      }

      const barracks = g.units.find((u: any) => u.team === 0 && u.type === 'barracks' && u.isBuilding)
      if (barracks) {
        g.selectionModel.clear()
        g.selectionModel.setSelection([barracks])
        g._lastCmdKey = ''
        g.updateHUD(0.016)
        const hlBtn = Array.from(document.querySelectorAll('#command-card button')).find((b: any) =>
          b.querySelector('.btn-label')?.textContent?.trim() === '圣光术',
        )
        results['barracks'] = { checked: true, hasHL: !!hlBtn }
      }

      return results
    })

    for (const [type, check] of Object.entries(result)) {
      expect(check.checked).toBe(true)
      expect(check.hasHL).toBe(false)
    }
  })

  test('HL-RT7: Barracks Footman training still works after Holy Light addition', async ({ page }) => {
    await waitForRuntime(page)

    const result = await page.evaluate(() => {
      const g = (window as any).__war3Game
      const barracks = g.units.find((u: any) => u.team === 0 && u.type === 'barracks' && u.isBuilding)
      if (!barracks) return { found: false }

      g.resources.earn(0, 5000, 5000)
      g.selectionModel.clear()
      g.selectionModel.setSelection([barracks])
      g._lastCmdKey = ''
      g.updateHUD(0.016)

      const footmanBtn = Array.from(document.querySelectorAll('#command-card button')).find((b: any) =>
        b.querySelector('.btn-label')?.textContent?.trim() === '步兵',
      ) as HTMLButtonElement | undefined
      if (!footmanBtn) return { found: true, hasButton: false }

      const before = g.units.filter((u: any) => u.team === 0 && u.type === 'footman' && !u.isBuilding).length
      footmanBtn.click()

      const dt = 0.5
      for (let i = 0; i < 60; i++) { g.gameTime += dt; g.updateUnits(dt) }

      const after = g.units.filter((u: any) => u.team === 0 && u.type === 'footman' && !u.isBuilding).length

      return { found: true, hasButton: true, before, after }
    })

    expect(result.found).toBe(true)
    expect(result.hasButton).toBe(true)
    expect(result.after).toBe(result.before + 1)
  })
})
