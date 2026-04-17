/**
 * V7 Arcane Sanctum + Priest Caster Proof
 *
 * Proves:
 * 1. Arcane Sanctum and Priest are connected through GameData.
 * 2. Arcane Sanctum build gate requires a completed Barracks.
 * 3. Arcane Sanctum trains Priest through the normal command card queue path.
 * 4. Priest has mana, maxMana, manaRegen from GameData constants.
 * 5. Heal ability: mana cost, cooldown, HP change, range limit.
 * 6. Heal blocked when: cooldown, no mana, full HP, enemy target, out of range.
 * 7. Mana regenerates over time.
 * 8. Command card shows heal button with availability state.
 * 9. HUD stats show mana for Priest.
 */
import { test, expect, type Page } from '@playwright/test'
import { BUILDINGS, PEASANT_BUILD_MENU, UNITS } from '../src/game/GameData'

const BASE = 'http://127.0.0.1:4173/?runtimeTest=1'

async function waitForGame(page: Page) {
  const consoleErrors: string[] = []
  page.on('console', (msg) => {
    if (msg.type() === 'error') consoleErrors.push(msg.text())
  })
  ;(page as any).__consoleErrors = consoleErrors

  await page.goto(BASE, { waitUntil: 'domcontentloaded' })
  await page.waitForFunction(() => {
    const canvas = document.getElementById('game-canvas')
    const game = (window as any).__war3Game
    if (!canvas || !game || !game.renderer) return false
    if (!Array.isArray(game.units) || game.units.length === 0) return false
    return game.renderer.domElement.width > 0
  }, { timeout: 15000 })

  try {
    await page.waitForFunction(() => {
      const status = document.getElementById('map-status')?.textContent ?? ''
      return !status.includes('正在加载')
    }, { timeout: 15000 })
  } catch {
    // Procedural fallback is valid.
  }
  await page.waitForTimeout(300)
}

test.describe('V7 Arcane Sanctum + Priest Caster Proof', () => {
  test.beforeEach(async ({ page }) => {
    await waitForGame(page)
  })

  test('proof-1: arcane_sanctum and priest are connected through data tables', async () => {
    expect(PEASANT_BUILD_MENU).toContain('arcane_sanctum')
    expect(BUILDINGS.arcane_sanctum.name).toBe('奥秘圣殿')
    expect(BUILDINGS.arcane_sanctum.techPrereq).toBe('keep')
    expect(BUILDINGS.arcane_sanctum.trains).toContain('priest')

    expect(UNITS.priest.name).toBe('牧师')
    expect(UNITS.priest.techPrereq).toBe('arcane_sanctum')
    expect(UNITS.priest.cost).toEqual({ gold: 145, lumber: 25 })
    expect(UNITS.priest.supply).toBe(2)
  })

  test('proof-2: arcane_sanctum build gate requires completed Keep', async ({ page }) => {
    const result = await page.evaluate(() => {
      const g = (window as any).__war3Game
      if (!g) throw new Error('no game')

      // Check arcane_sanctum can be spawned
      const as = g.spawnBuilding('arcane_sanctum', 0, 30, 30)
      const fresh = g.units.find((u: any) => u === as && u.hp > 0)
      if (!fresh) throw new Error('arcane_sanctum not found after spawn')

      const spawnedData = {
        type: fresh.type,
        maxHp: fresh.maxHp,
        isBuilding: fresh.isBuilding,
        buildProgress: fresh.buildProgress,
      }

      // Check build availability before Keep (kill all keeps, dispose)
      as.hp = 0
      g.handleDeadUnits()
      g.disposeAllUnits()
      const availNoKeep = g.getBuildAvailability('arcane_sanctum', 0)

      // Spawn Keep then check
      const keep = g.spawnBuilding('keep', 0, 35, 35)
      const availWithKeep = g.getBuildAvailability('arcane_sanctum', 0)

      // Cleanup
      keep.hp = 0
      g.handleDeadUnits()

      return {
        ...spawnedData,
        availNoKeepOk: availNoKeep.ok,
        availNoKeepReason: availNoKeep.reason,
        availWithKeepOk: availWithKeep.ok,
      }
    })

    expect(result.type).toBe('arcane_sanctum')
    expect(result.maxHp).toBe(800)
    expect(result.isBuilding).toBe(true)
    expect(result.buildProgress).toBe(1)
    // Requires Keep
    expect(result.availNoKeepOk).toBe(false)
    expect(result.availNoKeepReason).toContain('主城')
    expect(result.availWithKeepOk).toBe(true)
  })

  test('proof-3: arcane_sanctum command card trains priest through normal queue path', async ({ page }) => {
    const result = await page.evaluate(() => {
      const g = (window as any).__war3Game
      if (!g) throw new Error('no game')

      g.resources.earn(0, 1000, 1000)
      g.spawnBuilding('farm', 0, 29, 30)
      g.spawnBuilding('barracks', 0, 32, 30)
      g.spawnBuilding('keep', 0, 33, 33)
      const sanctum = g.spawnBuilding('arcane_sanctum', 0, 36, 30)

      const trainAvail = g.getTrainAvailability('priest', 0)
      g.selectionModel.setSelection([sanctum])
      g._lastCmdKey = ''
      g.updateHUD(0.016)

      const buttons = [...document.querySelectorAll('#command-card button')] as HTMLButtonElement[]
      const priestButton = buttons.find((button) => (
        button.querySelector('.btn-label')?.textContent?.trim() === '牧师'
      ))

      const beforeQueue = sanctum.trainingQueue.length
      const beforeResources = g.resources.get(0)
      priestButton?.click()
      const afterResources = g.resources.get(0)
      const afterQueue = sanctum.trainingQueue.length
      const queuedType = sanctum.trainingQueue[0]?.type ?? ''
      const remaining = sanctum.trainingQueue[0]?.remaining ?? 0

      sanctum.hp = 0
      g.handleDeadUnits()

      return {
        trainAvailOk: trainAvail.ok,
        trainAvailReason: trainAvail.reason,
        found: !!priestButton,
        enabled: !!priestButton && !priestButton.disabled,
        disabledReason: priestButton?.dataset.disabledReason ?? '',
        costText: priestButton?.querySelector('.btn-cost')?.textContent ?? '',
        beforeQueue,
        afterQueue,
        queuedType,
        remaining,
        spentGold: beforeResources.gold - afterResources.gold,
        spentLumber: beforeResources.lumber - afterResources.lumber,
      }
    })

    expect(result.trainAvailOk).toBe(true)
    expect(result.trainAvailReason).toBe('')
    expect(result.found).toBe(true)
    expect(result.enabled).toBe(true)
    expect(result.disabledReason).toBe('')
    expect(result.costText).toContain('145g')
    expect(result.costText).toContain('25w')
    expect(result.afterQueue).toBe(result.beforeQueue + 1)
    expect(result.queuedType).toBe('priest')
    expect(result.remaining).toBe(UNITS.priest.trainTime)
    expect(result.spentGold).toBe(UNITS.priest.cost.gold)
    expect(result.spentLumber).toBe(UNITS.priest.cost.lumber)
  })

  test('proof-4: priest unit has mana, maxMana, manaRegen from constants', async ({ page }) => {
    const result = await page.evaluate(() => {
      const g = (window as any).__war3Game
      if (!g) throw new Error('no game')

      // Spawn arcane_sanctum (prereq for priest training)
      const as = g.spawnBuilding('arcane_sanctum', 0, 37, 37)

      // Spawn priest directly
      const priest = g.spawnUnit('priest', 0, 38, 38)

      // Read fresh state
      const fresh = g.units.find((u: any) => u === priest && u.hp > 0)
      if (!fresh) throw new Error('priest not found after spawn')

      const data = {
        type: fresh.type,
        maxHp: fresh.maxHp,
        mana: fresh.mana,
        maxMana: fresh.maxMana,
        manaRegen: fresh.manaRegen,
        healCooldownUntil: fresh.healCooldownUntil,
        isBuilding: fresh.isBuilding,
        attackDamage: fresh.attackDamage,
      }

      // Cleanup
      priest.hp = 0
      as.hp = 0
      g.handleDeadUnits()

      return data
    })

    expect(result.type).toBe('priest')
    expect(result.maxHp).toBe(290)
    expect(result.mana).toBe(200)
    expect(result.maxMana).toBe(200)
    expect(result.manaRegen).toBe(0.5)
    expect(result.healCooldownUntil).toBe(0)
    expect(result.isBuilding).toBe(false)
    expect(result.attackDamage).toBe(8)
  })

  test('proof-5: heal — mana cost, cooldown, HP change, range limit', async ({ page }) => {
    const result = await page.evaluate(() => {
      const g = (window as any).__war3Game
      if (!g) throw new Error('no game')

      const as = g.spawnBuilding('arcane_sanctum', 0, 40, 40)
      const priest = g.spawnUnit('priest', 0, 40.5, 40.5)
      const footman = g.spawnUnit('footman', 0, 40.5, 41.5) // ~1 tile away, within heal range

      // Damage the footman
      const originalHp = footman.hp
      footman.hp -= 50

      // Cast heal
      const beforeMana = priest.mana
      const beforeHealCd = priest.healCooldownUntil
      const healResult = g.castHeal(priest, footman)

      // Read fresh state
      const freshPriest = g.units.find((u: any) => u === priest && u.hp > 0)
      const freshFootman = g.units.find((u: any) => u === footman && u.hp > 0)

      const data = {
        healResult,
        hpBeforeHeal: originalHp - 50,
        hpAfterHeal: freshFootman.hp,
        manaBefore: beforeMana,
        manaAfter: freshPriest.mana,
        healCooldownBefore: beforeHealCd,
        healCooldownAfter: freshPriest.healCooldownUntil,
        hpRestored: freshFootman.hp - (originalHp - 50),
      }

      // Cleanup
      priest.hp = 0
      footman.hp = 0
      as.hp = 0
      g.handleDeadUnits()

      return data
    })

    expect(result.healResult).toBe(true)
    // HP increased by heal amount (25), but capped at maxHp
    expect(result.hpRestored).toBe(25)
    // Mana was deducted
    expect(result.manaAfter).toBe(result.manaBefore - 5)
    // Cooldown was set
    expect(result.healCooldownAfter).toBeGreaterThan(result.healCooldownBefore)
  })

  test('proof-6: heal blocked — cooldown, no mana, full HP, enemy, out of range', async ({ page }) => {
    const result = await page.evaluate(() => {
      const g = (window as any).__war3Game
      if (!g) throw new Error('no game')

      const as = g.spawnBuilding('arcane_sanctum', 0, 42, 42)
      const priest = g.spawnUnit('priest', 0, 42.5, 42.5)
      const footman = g.spawnUnit('footman', 0, 42.5, 43.5)
      const enemyFootman = g.spawnUnit('footman', 1, 43.5, 42.5)
      const farFootman = g.spawnUnit('footman', 0, 55.5, 55.5) // out of heal range

      // Damage footman
      footman.hp -= 50

      // A: Heal succeeds normally
      const normalHeal = g.castHeal(priest, footman)

      // B: Heal blocked by cooldown
      footman.hp -= 25 // re-damage
      const cooldownHeal = g.castHeal(priest, footman)

      // C: Clear cooldown, drain mana → blocked by no mana
      priest.healCooldownUntil = 0
      priest.mana = 2 // less than PRIEST_HEAL_MANA_COST (5)
      const noManaHeal = g.castHeal(priest, footman)

      // D: Restore mana, target at full HP → blocked
      priest.mana = 200
      footman.hp = footman.maxHp
      const fullHpHeal = g.castHeal(priest, footman)

      // E: Enemy target → blocked
      enemyFootman.hp -= 50
      const enemyHeal = g.castHeal(priest, enemyFootman)

      // F: Out of range → blocked
      farFootman.hp -= 50
      const rangeHeal = g.castHeal(priest, farFootman)

      // Cleanup
      priest.hp = 0
      footman.hp = 0
      enemyFootman.hp = 0
      farFootman.hp = 0
      as.hp = 0
      g.handleDeadUnits()

      return {
        normalHeal,
        cooldownHeal,
        noManaHeal,
        fullHpHeal,
        enemyHeal,
        rangeHeal,
      }
    })

    expect(result.normalHeal).toBe(true)
    expect(result.cooldownHeal).toBe(false)
    expect(result.noManaHeal).toBe(false)
    expect(result.fullHpHeal).toBe(false)
    expect(result.enemyHeal).toBe(false)
    expect(result.rangeHeal).toBe(false)
  })

  test('proof-7: mana regenerates over time', async ({ page }) => {
    const result = await page.evaluate(() => {
      const g = (window as any).__war3Game
      if (!g) throw new Error('no game')

      const as = g.spawnBuilding('arcane_sanctum', 0, 44, 44)
      const priest = g.spawnUnit('priest', 0, 44.5, 44.5)

      // Drain mana
      priest.mana = 10

      // Simulate 10 seconds of mana regen
      const manaBefore = priest.mana
      g.updateCasterAbilities(10)
      const freshPriest = g.units.find((u: any) => u === priest && u.hp > 0)
      const manaAfter = freshPriest.mana

      // Simulate enough time to reach max
      g.updateCasterAbilities(1000)
      const manaAfterLong = g.units.find((u: any) => u === priest && u.hp > 0).mana

      // Cleanup
      priest.hp = 0
      as.hp = 0
      g.handleDeadUnits()

      return {
        manaBefore,
        manaAfter,
        manaAfterLong,
        maxMana: freshPriest.maxMana,
        manaRegen: freshPriest.manaRegen,
      }
    })

    expect(result.manaBefore).toBe(10)
    // 10 seconds * 0.5 regen = +5 mana
    expect(result.manaAfter).toBe(15)
    // Should cap at maxMana (200)
    expect(result.manaAfterLong).toBe(result.maxMana)
  })

  test('proof-8: command card shows heal button with availability state', async ({ page }) => {
    const result = await page.evaluate(() => {
      const g = (window as any).__war3Game
      if (!g) throw new Error('no game')

      const as = g.spawnBuilding('arcane_sanctum', 0, 46, 46)
      const priest = g.spawnUnit('priest', 0, 46.5, 46.5)

      // Phase A: Full mana, no cooldown → heal should be enabled
      g.selectionModel.setSelection([priest])
      g._lastCmdKey = ''
      g.updateHUD(0.016)

      const cmdCard = document.getElementById('command-card')!
      let healEnabled = false
      let healFound = false
      let healReason = ''
      let healCost = ''
      for (const btn of cmdCard.querySelectorAll('button')) {
        const label = btn.querySelector('.btn-label')?.textContent?.trim() ?? ''
        if (label === '治疗') {
          healFound = true
          healEnabled = !btn.disabled
          healReason = btn.dataset.disabledReason ?? ''
          healCost = btn.querySelector('.btn-cost')?.textContent?.trim() ?? ''
        }
      }

      // Phase B: Drain mana → heal should be disabled
      priest.mana = 0
      g._lastCmdKey = ''
      g.updateHUD(0.016)

      let healEnabledNoMana = false
      let healReasonNoMana = ''
      for (const btn of cmdCard.querySelectorAll('button')) {
        const label = btn.querySelector('.btn-label')?.textContent?.trim() ?? ''
        if (label === '治疗') {
          healEnabledNoMana = !btn.disabled
          healReasonNoMana = btn.dataset.disabledReason ?? ''
        }
      }

      // Phase C: On cooldown → heal disabled with cooldown reason
      priest.mana = 200
      priest.healCooldownUntil = g.gameTime + 5
      g._lastCmdKey = ''
      g.updateHUD(0.016)

      let healEnabledCooldown = false
      let healReasonCooldown = ''
      for (const btn of cmdCard.querySelectorAll('button')) {
        const label = btn.querySelector('.btn-label')?.textContent?.trim() ?? ''
        if (label === '治疗') {
          healEnabledCooldown = !btn.disabled
          healReasonCooldown = btn.dataset.disabledReason ?? ''
        }
      }

      // Cleanup
      priest.hp = 0
      as.hp = 0
      g.handleDeadUnits()

      return {
        healFound,
        healEnabled,
        healCost,
        healReason,
        healEnabledNoMana,
        healReasonNoMana,
        healEnabledCooldown,
        healReasonCooldown,
      }
    })

    // Phase A: heal available
    expect(result.healFound).toBe(true)
    expect(result.healEnabled).toBe(true)
    expect(result.healReason).toBe('')
    expect(result.healCost).toContain('💧')

    // Phase B: no mana
    expect(result.healEnabledNoMana).toBe(false)
    expect(result.healReasonNoMana).toContain('魔力')

    // Phase C: cooldown
    expect(result.healEnabledCooldown).toBe(false)
    expect(result.healReasonCooldown).toContain('冷却')
  })

  test('proof-9: HUD stats show mana for priest', async ({ page }) => {
    const result = await page.evaluate(() => {
      const g = (window as any).__war3Game
      if (!g) throw new Error('no game')

      const as = g.spawnBuilding('arcane_sanctum', 0, 48, 48)
      const priest = g.spawnUnit('priest', 0, 48.5, 48.5)

      // Select priest
      g.selectionModel.setSelection([priest])
      g._lastSelKey = ''
      g.updateHUD(0.016)

      const statsEl = document.getElementById('unit-stats')!
      const statsText = statsEl.textContent ?? ''

      // Also check badge and name
      const badge = document.getElementById('unit-type-badge')?.textContent ?? ''
      const name = document.getElementById('unit-name')?.textContent ?? ''

      // Drain some mana to see it change
      priest.mana = 137
      g._lastSelKey = ''
      g.updateHUD(0.016)

      const statsAfterDrain = document.getElementById('unit-stats')!.textContent ?? ''

      // Cleanup
      priest.hp = 0
      as.hp = 0
      g.handleDeadUnits()

      return {
        statsHasMana: statsText.includes('💧'),
        badge,
        name,
        statsAfterDrainHas137: statsAfterDrain.includes('137'),
        statsAfterDrainHasMax: statsAfterDrain.includes('200'),
      }
    })

    expect(result.name).toBe('牧师')
    expect(result.badge).toBe('治疗')
    expect(result.statsHasMana).toBe(true)
    expect(result.statsAfterDrainHas137).toBe(true)
    expect(result.statsAfterDrainHasMax).toBe(true)
  })
})
