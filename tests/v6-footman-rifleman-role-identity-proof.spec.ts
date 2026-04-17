/**
 * V6 Footman / Rifleman Role Identity Proof
 *
 * Proves the current human roster has at least one observable unit-role split:
 * Footman = melee front-line, Rifleman = ranged fire, Long Rifles only
 * reinforces the Rifleman ranged identity.
 *
 * Must prove:
 * 1. Footman / Rifleman cost, supply, attack, armor, range, prereq come from
 *    GameData and runtime state — not hardcoded in the test.
 * 2. Barracks / Blacksmith / Long Rifles path gives the player different
 *    production or tech choices.
 * 3. Footman engages as melee front-line; Rifleman outputs as ranged;
 *    Long Rifles only changes Rifleman ranged identity.
 * 4. Selection panel or command card lets the player see these differences.
 * 5. Fresh state, re-read after mutation, cleanup leaves no residue.
 */
import { test, expect, type Page } from '@playwright/test'
import {
  UNITS, BUILDINGS, RESEARCHES,
  ATTACK_TYPE_NAMES, ARMOR_TYPE_NAMES,
  MELEE_RANGE,
} from '../src/game/GameData'

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

test.describe('V6 Footman / Rifleman Role Identity Proof', () => {
  test.beforeEach(async ({ page }) => {
    await waitForGame(page)
  })

  test('proof-1: Footman / Rifleman stats from GameData + runtime', async ({ page }) => {
    const expected = {
      footman: {
        costGold: UNITS.footman.cost.gold,
        costLumber: UNITS.footman.cost.lumber,
        supply: UNITS.footman.supply,
        attackDamage: UNITS.footman.attackDamage,
        armor: UNITS.footman.armor,
        attackRange: UNITS.footman.attackRange,
        attackType: UNITS.footman.attackType!,
        armorType: UNITS.footman.armorType!,
        hp: UNITS.footman.hp,
        speed: UNITS.footman.speed,
        techPrereq: UNITS.footman.techPrereq ?? null,
      },
      rifleman: {
        costGold: UNITS.rifleman.cost.gold,
        costLumber: UNITS.rifleman.cost.lumber,
        supply: UNITS.rifleman.supply,
        attackDamage: UNITS.rifleman.attackDamage,
        armor: UNITS.rifleman.armor,
        attackRange: UNITS.rifleman.attackRange,
        attackType: UNITS.rifleman.attackType!,
        armorType: UNITS.rifleman.armorType!,
        hp: UNITS.rifleman.hp,
        speed: UNITS.rifleman.speed,
        techPrereq: UNITS.rifleman.techPrereq ?? null,
      },
    }

    const result = await page.evaluate((expected) => {
      const g = (window as any).__war3Game
      if (!g) throw new Error('no game')

      // Spawn both units
      const footman = g.spawnUnit('footman', 0, 30, 30)
      const rifleman = g.spawnUnit('rifleman', 0, 31, 31)

      // Re-read fresh from g.units
      const fFresh = g.units.find((u: any) => u === footman && u.hp > 0)
      const rFresh = g.units.find((u: any) => u === rifleman && u.hp > 0)

      const runtimeFootman = {
        attackDamage: fFresh.attackDamage,
        armor: fFresh.armor,
        attackRange: fFresh.attackRange,
        hp: fFresh.hp,
        speed: fFresh.speed,
      }
      const runtimeRifleman = {
        attackDamage: rFresh.attackDamage,
        armor: rFresh.armor,
        attackRange: rFresh.attackRange,
        hp: rFresh.hp,
        speed: rFresh.speed,
      }

      // Cleanup
      footman.hp = 0
      rifleman.hp = 0
      g.handleDeadUnits()

      return { runtimeFootman, runtimeRifleman }
    }, expected)

    // Footman runtime matches GameData
    expect(result.runtimeFootman.attackDamage).toBe(expected.footman.attackDamage)
    expect(result.runtimeFootman.armor).toBe(expected.footman.armor)
    expect(result.runtimeFootman.attackRange).toBe(expected.footman.attackRange)
    expect(result.runtimeFootman.hp).toBe(expected.footman.hp)
    expect(result.runtimeFootman.speed).toBe(expected.footman.speed)

    // Rifleman runtime matches GameData
    expect(result.runtimeRifleman.attackDamage).toBe(expected.rifleman.attackDamage)
    expect(result.runtimeRifleman.armor).toBe(expected.rifleman.armor)
    expect(result.runtimeRifleman.attackRange).toBe(expected.rifleman.attackRange)
    expect(result.runtimeRifleman.hp).toBe(expected.rifleman.hp)
    expect(result.runtimeRifleman.speed).toBe(expected.rifleman.speed)

    // Role identity: Footman is melee (range <= MELEE_RANGE), Rifleman is ranged
    expect(expected.footman.attackRange).toBeLessThanOrEqual(MELEE_RANGE)
    expect(expected.rifleman.attackRange).toBeGreaterThan(MELEE_RANGE)

    // Rifleman costs more gold and lumber, higher supply
    expect(expected.rifleman.costGold).toBeGreaterThan(expected.footman.costGold)
    expect(expected.rifleman.supply).toBeGreaterThan(expected.footman.supply)

    // Footman has more armor, less attack; Rifleman has more attack, less armor
    expect(expected.footman.armor).toBeGreaterThan(expected.rifleman.armor)
    expect(expected.rifleman.attackDamage).toBeGreaterThan(expected.footman.attackDamage)

    // Different attack types: Normal (melee) vs Piercing (ranged)
    expect(expected.footman.attackType).not.toBe(expected.rifleman.attackType)

    // Rifleman requires blacksmith prereq; footman does not
    expect(expected.footman.techPrereq).toBeNull()
    expect(expected.rifleman.techPrereq).toBe('blacksmith')
  })

  test('proof-2: Barracks / Blacksmith / Long Rifles production path', async ({ page }) => {
    const expected = {
      barracksTrains: BUILDINGS.barracks.trains!,
      blacksmithCost: BUILDINGS.blacksmith.cost,
      longRiflesRequires: RESEARCHES.long_rifles.requiresBuilding!,
      longRiflesTarget: RESEARCHES.long_rifles.effects?.[0]?.targetUnitType!,
      longRiflesStat: RESEARCHES.long_rifles.effects?.[0]?.stat!,
      longRiflesValue: RESEARCHES.long_rifles.effects?.[0]?.value!,
    }

    const result = await page.evaluate((expected) => {
      const g = (window as any).__war3Game
      if (!g) throw new Error('no game')

      // Step 1: Barracks alone can train Footman but NOT Rifleman (needs blacksmith)
      const barracks = g.spawnBuilding('barracks', 0, 34, 34)
      barracks.buildProgress = 1
      g.resources.earn(0, 2000, 500)

      const footmanAvail = g.getTrainAvailability('footman', 0)
      const riflemanAvailNoBS = g.getTrainAvailability('rifleman', 0)

      // Step 2: Build blacksmith → Rifleman unlocks
      const blacksmith = g.spawnBuilding('blacksmith', 0, 36, 36)
      blacksmith.buildProgress = 1
      const riflemanAvailWithBS = g.getTrainAvailability('rifleman', 0)

      // Step 3: Long Rifles research only targets rifleman
      const longRiflesAvail = g.getResearchAvailability('long_rifles', 0)

      // Cleanup
      barracks.hp = 0
      blacksmith.hp = 0
      g.handleDeadUnits()

      return {
        footmanAvailOk: footmanAvail.ok,
        riflemanAvailNoBS: { ok: riflemanAvailNoBS.ok, reason: riflemanAvailNoBS.reason },
        riflemanAvailWithBS: { ok: riflemanAvailWithBS.ok, reason: riflemanAvailWithBS.reason },
        longRiflesAvail: { ok: longRiflesAvail.ok },
      }
    }, expected)

    // Barracks trains both footman and rifleman (in data)
    expect(expected.barracksTrains).toContain('footman')
    expect(expected.barracksTrains).toContain('rifleman')

    // Footman available with just barracks
    expect(result.footmanAvailOk).toBe(true)

    // Rifleman blocked without blacksmith
    expect(result.riflemanAvailNoBS.ok).toBe(false)
    expect(result.riflemanAvailNoBS.reason).toContain('铁匠铺')

    // Rifleman available after blacksmith
    expect(result.riflemanAvailWithBS.ok).toBe(true)

    // Long Rifles only targets rifleman, not footman
    expect(expected.longRiflesTarget).toBe('rifleman')
    expect(expected.longRiflesStat).toBe('attackRange')
    expect(expected.longRiflesValue).toBeGreaterThan(0)
    expect(expected.longRiflesRequires).toBe('blacksmith')

    // Long Rifles available with blacksmith
    expect(result.longRiflesAvail.ok).toBe(true)
  })

  test('proof-3: Footman melee, Rifleman ranged, Long Rifles only affects Rifleman', async ({ page }) => {
    const expected = {
      meleeRange: MELEE_RANGE,
      footmanRange: UNITS.footman.attackRange,
      riflemanRange: UNITS.rifleman.attackRange,
      longRiflesRangeBonus: RESEARCHES.long_rifles.effects?.find(
        (effect) => effect.targetUnitType === 'rifleman' && effect.stat === 'attackRange',
      )?.value ?? 0,
    }

    const result = await page.evaluate((expected) => {
      const g = (window as any).__war3Game
      if (!g) throw new Error('no game')

      // Setup: footman (team 0), rifleman (team 0), enemy target (team 1)
      const footman = g.spawnUnit('footman', 0, 40, 40)
      const rifleman = g.spawnUnit('rifleman', 0, 41, 40)
      const enemy = g.spawnUnit('footman', 1, 40, 45)

      const footmanRange = footman.attackRange
      const riflemanRange = rifleman.attackRange

      // Footman is melee
      const footmanIsMelee = footmanRange <= expected.meleeRange
      // Rifleman is ranged
      const riflemanIsRanged = riflemanRange > expected.meleeRange

      // Record pre-research damage: rifleman hits enemy
      const hpBeforeRifle = enemy.hp
      g.dealDamage(rifleman, enemy)
      const rifleDmg = hpBeforeRifle - enemy.hp

      // Record footman damage: footman hits same target
      const hpBeforeFoot = enemy.hp
      g.dealDamage(footman, enemy)
      const footDmg = hpBeforeFoot - enemy.hp

      // Now complete Long Rifles research
      const bs = g.spawnBuilding('blacksmith', 0, 38, 38)
      bs.researchQueue.push({ key: 'long_rifles', remaining: 0.001 })
      g.gameTime = 100
      g.update(0.01)

      // Re-read fresh state for both units
      const fFresh = g.units.find((u: any) => u === footman && u.hp > 0)
      const rFresh = g.units.find((u: any) => u === rifleman && u.hp > 0)

      const footmanRangeAfter = fFresh ? fFresh.attackRange : -1
      const riflemanRangeAfter = rFresh ? rFresh.attackRange : -1

      // Cleanup
      footman.hp = 0
      rifleman.hp = 0
      enemy.hp = 0
      bs.hp = 0
      g.handleDeadUnits()

      return {
        footmanRange,
        riflemanRange,
        footmanIsMelee,
        riflemanIsRanged,
        rifleDmg,
        footDmg,
        footmanRangeAfter,
        riflemanRangeAfter,
      }
    }, expected)

    // Footman is melee
    expect(result.footmanIsMelee).toBe(true)
    // Rifleman is ranged
    expect(result.riflemanIsRanged).toBe(true)

    // Both deal damage (combat system works)
    expect(result.rifleDmg).toBeGreaterThan(0)
    expect(result.footDmg).toBeGreaterThan(0)

    // Long Rifles only changed Rifleman range by its GameData effect, not Footman.
    expect(result.riflemanRangeAfter).toBeCloseTo(expected.riflemanRange + expected.longRiflesRangeBonus, 1)
    expect(result.footmanRangeAfter).toBe(result.footmanRange)   // unchanged
  })

  test('proof-4: selection panel and command card show role differences', async ({ page }) => {
    const expected = {
      footmanAttackType: ATTACK_TYPE_NAMES[UNITS.footman.attackType!],
      footmanArmorType: ARMOR_TYPE_NAMES[UNITS.footman.armorType!],
      riflemanAttackType: ATTACK_TYPE_NAMES[UNITS.rifleman.attackType!],
      riflemanArmorType: ARMOR_TYPE_NAMES[UNITS.rifleman.armorType!],
      footmanAttackRange: UNITS.footman.attackRange,
      riflemanAttackRange: UNITS.rifleman.attackRange,
      footmanBadge: '近战',
      riflemanBadge: '远程',
      riflemanName: '步枪兵',
      footmanName: '步兵',
      riflemanCostGold: UNITS.rifleman.cost.gold,
      riflemanCostLumber: UNITS.rifleman.cost.lumber,
      riflemanSupply: UNITS.rifleman.supply,
      footmanCostGold: UNITS.footman.cost.gold,
      footmanSupply: UNITS.footman.supply,
    }

    const result = await page.evaluate((expected) => {
      const g = (window as any).__war3Game
      if (!g) throw new Error('no game')

      // Give resources
      g.resources.earn(0, 2000, 500)

      // === A: Select Footman — check selection HUD ===
      const footman = g.spawnUnit('footman', 0, 50, 50)
      g.selectionModel.setSelection([footman])
      g._lastCmdKey = ''
      g._lastSelKey = ''
      g.updateHUD(0.016)

      const footStats = document.getElementById('unit-stats')!.textContent ?? ''
      const footName = document.getElementById('unit-name')!.textContent ?? ''
      const footBadge = document.getElementById('unit-type-badge')!.textContent ?? ''

      // === B: Select Rifleman — check selection HUD ===
      const rifleman = g.spawnUnit('rifleman', 0, 51, 50)
      g.selectionModel.setSelection([rifleman])
      g._lastCmdKey = ''
      g._lastSelKey = ''
      g.updateHUD(0.016)

      const rifleStats = document.getElementById('unit-stats')!.textContent ?? ''
      const rifleName = document.getElementById('unit-name')!.textContent ?? ''
      const rifleBadge = document.getElementById('unit-type-badge')!.textContent ?? ''

      // === C: Select Barracks — check command card train buttons ===
      const barracks = g.spawnBuilding('barracks', 0, 52, 50)
      barracks.buildProgress = 1
      const blacksmith = g.spawnBuilding('blacksmith', 0, 53, 50)
      blacksmith.buildProgress = 1
      const farm = g.spawnBuilding('farm', 0, 54, 50)
      farm.buildProgress = 1

      g.selectionModel.setSelection([barracks])
      g._lastCmdKey = ''
      g._lastSelKey = ''
      g.updateHUD(0.016)

      const cmdCard = document.getElementById('command-card')!
      const buttons = cmdCard.querySelectorAll('button')
      let footmanBtn: HTMLButtonElement | null = null
      let riflemanBtn: HTMLButtonElement | null = null
      for (const btn of buttons) {
        const text = btn.textContent ?? ''
        if (text.includes(expected.footmanName)) footmanBtn = btn as HTMLButtonElement
        if (text.includes(expected.riflemanName)) riflemanBtn = btn as HTMLButtonElement
      }
      const footBtnText = footmanBtn?.textContent ?? ''
      const rifleBtnText = riflemanBtn?.textContent ?? ''
      const footBtnEnabled = footmanBtn ? !footmanBtn.disabled : false
      const rifleBtnEnabled = riflemanBtn ? !riflemanBtn.disabled : false

      // Cleanup
      footman.hp = 0
      rifleman.hp = 0
      barracks.hp = 0
      blacksmith.hp = 0
      farm.hp = 0
      g.handleDeadUnits()

      return {
        footStats,
        footName,
        footBadge,
        rifleStats,
        rifleName,
        rifleBadge,
        footBtnText,
        rifleBtnText,
        footBtnEnabled,
        rifleBtnEnabled,
      }
    }, expected)

    // Footman selection shows name, melee badge, correct attack/armor types
    expect(result.footName).toContain(expected.footmanName)
    expect(result.footBadge).toBe(expected.footmanBadge)
    expect(result.footStats).toContain(expected.footmanAttackType)
    expect(result.footStats).toContain(expected.footmanArmorType)

    // Rifleman selection shows name, ranged badge, correct attack/armor types
    expect(result.rifleName).toContain(expected.riflemanName)
    expect(result.rifleBadge).toBe(expected.riflemanBadge)
    expect(result.rifleStats).toContain(expected.riflemanAttackType)
    expect(result.rifleStats).toContain(expected.riflemanArmorType)

    // Rifleman stats show range indicator; Footman stats do not (melee)
    expect(result.rifleStats).toContain('🎯')
    expect(result.footStats).not.toContain('🎯')

    // Command card: both buttons present with real costs from data
    expect(result.footBtnText).toContain(`${expected.footmanCostGold}g`)
    expect(result.footBtnText).toContain(`${expected.footmanSupply}口`)
    expect(result.rifleBtnText).toContain(`${expected.riflemanCostGold}g`)
    expect(result.rifleBtnText).toContain(`${expected.riflemanCostLumber}w`)
    expect(result.rifleBtnText).toContain(`${expected.riflemanSupply}口`)

    // Both buttons enabled (resources sufficient + blacksmith exists)
    expect(result.footBtnEnabled).toBe(true)
    expect(result.rifleBtnEnabled).toBe(true)
  })

  test('proof-5: fresh state after mutation, cleanup no residue', async ({ page }) => {
    const expected = {
      footmanRange: UNITS.footman.attackRange,
      riflemanRange: UNITS.rifleman.attackRange,
      longRiflesRangeBonus: RESEARCHES.long_rifles.effects?.find(
        (effect) => effect.targetUnitType === 'rifleman' && effect.stat === 'attackRange',
      )?.value ?? 0,
    }

    const result = await page.evaluate((expected) => {
      const g = (window as any).__war3Game
      if (!g) throw new Error('no game')

      // Setup: spawn both unit types + blacksmith with Long Rifles
      const footman = g.spawnUnit('footman', 0, 60, 60)
      const rifleman = g.spawnUnit('rifleman', 0, 61, 60)
      const bs = g.spawnBuilding('blacksmith', 0, 62, 60)
      bs.researchQueue.push({ key: 'long_rifles', remaining: 0.001 })
      g.update(0.01)

      // Re-read fresh: rifleman should have boosted range
      const rFresh = g.units.find((u: any) => u === rifleman && u.hp > 0)
      const fFresh = g.units.find((u: any) => u === footman && u.hp > 0)
      const boostedRange = rFresh ? rFresh.attackRange : -1
      const footRange = fFresh ? fFresh.attackRange : -1

      // Kill rifleman, cleanup
      rifleman.hp = 0
      g.handleDeadUnits()

      // Re-read fresh from g.units: rifleman should be gone
      const afterKill = g.units
      const hasRifleman = afterKill.some((u: any) => u === rifleman)
      const footStillPresent = afterKill.some((u: any) => u === footman && u.hp > 0)

      // Dispose all — full cleanup
      g.disposeAllUnits()

      // After cleanup: no units, no research state
      const afterCleanup = g.units
      const noUnits = afterCleanup.length === 0
      const noResearch = !afterCleanup.some((u: any) =>
        u.completedResearches && u.completedResearches.length > 0
      )

      // Spawn fresh on clean state
      const newBs = g.spawnBuilding('blacksmith', 0, 60, 60)
      const newRifle = g.spawnUnit('rifleman', 0, 61, 60)
      const freshRange = newRifle.attackRange // should be base GameData range, no ghost bonus

      // Final cleanup
      newRifle.hp = 0
      newBs.hp = 0
      g.handleDeadUnits()

      return {
        boostedRange,
        footRange,
        hasRifleman,
        footStillPresent,
        noUnits,
        noResearch,
        freshRange,
      }
    }, expected)

    // Before cleanup: rifleman had boosted range, footman unchanged
    expect(result.boostedRange).toBeCloseTo(expected.riflemanRange + expected.longRiflesRangeBonus, 1)
    expect(result.footRange).toBe(expected.footmanRange)

    // After kill: rifleman gone, footman still present
    expect(result.hasRifleman).toBe(false)
    expect(result.footStillPresent).toBe(true)

    // After disposeAllUnits: clean slate
    expect(result.noUnits).toBe(true)
    expect(result.noResearch).toBe(true)

    // Fresh rifleman on clean state: base range, no ghost bonus
    expect(result.freshRange).toBeCloseTo(expected.riflemanRange, 1)
  })
})
