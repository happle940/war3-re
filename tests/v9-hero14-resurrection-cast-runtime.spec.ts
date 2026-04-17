/**
 * V9 HERO14-IMPL1C Resurrection minimal no-target cast runtime proof.
 *
 * Proves:
 * 1. Learned living Paladin gets a no-target cast button.
 * 2. Unlearned, dead, low-mana, cooldown, and no-corpse states are blocked.
 * 3. Cast consumes mana once, starts cooldown once, and revives source-bounded records.
 * 4. Target selection is deterministic oldest-first, maxTargets-limited, and preserves overflow.
 * 5. Enemy, hero, building, and out-of-range records are not consumed.
 * 6. Revived units use spawnUnit defaults at the recorded death position.
 * 7. HERO9 Altar revive remains separate from Resurrection.
 *
 * Not: particles, sounds, AI hero strategy, other heroes, items, shops, Tavern,
 * second race, air, multiplayer, complete Paladin, complete hero system, complete Human.
 */
import { test, expect, type Page } from '@playwright/test'
import { HERO_ABILITY_LEVELS, UNITS } from '../src/game/GameData'

const BASE_RUNTIME = 'http://127.0.0.1:4173/?runtimeTest=1'
const RES = HERO_ABILITY_LEVELS.resurrection
const RES_L1 = RES.levels[0]

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
    // Procedural fallback is valid for this runtime suite.
  }

  await page.evaluate(() => {
    const g = (window as any).__war3Game
    ;(window as any).__getCommandButton = (label: string) =>
      Array.from(document.querySelectorAll('#command-card button')).find((b: any) =>
        b.querySelector('.btn-label')?.textContent?.trim() === label,
      ) as HTMLButtonElement | undefined
    if (g?.ai) {
      if (typeof g.ai.reset === 'function') g.ai.reset()
      g.ai.update = () => {}
    }
  })
  await page.waitForTimeout(300)
}

test.describe('V9 HERO14-IMPL1C Resurrection cast runtime', () => {
  test.setTimeout(150000)

  test('CAST-1: command button is stage-gated and explains blocked states', async ({ page }) => {
    await waitForRuntime(page)

    const result = await page.evaluate(() => {
      const g = (window as any).__war3Game
      g.deadUnitRecords = []
      const paladin = g.spawnUnit('paladin', 0, 10, 10)
      paladin.mana = 500
      paladin.heroLevel = 6

      g.selectionModel.clear()
      g.selectionModel.setSelection([paladin])
      g._lastCmdKey = ''
      g._lastSelKey = ''
      g.updateHUD(0.016)
      const beforeLearn = !!(window as any).__getCommandButton('复活')

      paladin.abilityLevels = { ...(paladin.abilityLevels ?? {}), resurrection: 1 }
      g.deadUnitRecords.push({ team: 0, type: 'footman', x: 11, z: 11, diedAt: 1 })
      g._lastCmdKey = ''
      g.updateHUD(0.016)
      const learnedBtn = (window as any).__getCommandButton('复活')

      paladin.isDead = true
      g._lastCmdKey = ''
      g.updateHUD(0.016)
      const deadBtn = (window as any).__getCommandButton('复活')

      paladin.isDead = false
      paladin.mana = 0
      g._lastCmdKey = ''
      g.updateHUD(0.016)
      const noManaBtn = (window as any).__getCommandButton('复活')

      paladin.mana = 500
      paladin.resurrectionCooldownUntil = g.gameTime + 100
      g._lastCmdKey = ''
      g.updateHUD(0.016)
      const cooldownBtn = (window as any).__getCommandButton('复活')

      paladin.resurrectionCooldownUntil = 0
      g.deadUnitRecords = []
      g._lastCmdKey = ''
      g.updateHUD(0.016)
      const noCorpseBtn = (window as any).__getCommandButton('复活')

      return {
        beforeLearn,
        learnedExists: !!learnedBtn,
        learnedEnabled: learnedBtn ? !learnedBtn.disabled : false,
        learnedCost: learnedBtn?.querySelector('.btn-cost')?.textContent?.trim() ?? '',
        deadReason: deadBtn?.dataset.disabledReason ?? '',
        noManaReason: noManaBtn?.dataset.disabledReason ?? '',
        cooldownReason: cooldownBtn?.dataset.disabledReason ?? '',
        noCorpseReason: noCorpseBtn?.dataset.disabledReason ?? '',
      }
    })

    expect(result.beforeLearn).toBe(false)
    expect(result.learnedExists).toBe(true)
    expect(result.learnedEnabled).toBe(true)
    expect(result.learnedCost).toContain(String(RES_L1.mana))
    expect(result.learnedCost).toContain(String(RES_L1.maxTargets))
    expect(result.deadReason).toContain('已死亡')
    expect(result.noManaReason).toContain('法力不足')
    expect(result.cooldownReason).toContain('冷却中')
    expect(result.noCorpseReason).toContain('无可复活单位')
  })

  test('CAST-2: cast revives oldest eligible records up to maxTargets and preserves leftovers', async ({ page }) => {
    await waitForRuntime(page)

    const result = await page.evaluate(() => {
      const g = (window as any).__war3Game
      g.deadUnitRecords = []
      const paladin = g.spawnUnit('paladin', 0, 10, 10)
      paladin.mana = 500
      paladin.abilityLevels = { ...(paladin.abilityLevels ?? {}), resurrection: 1 }

      const records = [
        { team: 0, type: 'footman', x: 12, z: 11, diedAt: 30 },
        { team: 0, type: 'rifleman', x: 11, z: 11, diedAt: 10 },
        { team: 0, type: 'footman', x: 13, z: 11, diedAt: 20 },
        { team: 0, type: 'footman', x: 14, z: 11, diedAt: 40 },
        { team: 0, type: 'rifleman', x: 15, z: 11, diedAt: 50 },
        { team: 0, type: 'footman', x: 16, z: 11, diedAt: 60 },
        { team: 0, type: 'rifleman', x: 17, z: 11, diedAt: 70 },
        { team: 0, type: 'footman', x: 40, z: 40, diedAt: 1 },
        { team: 1, type: 'footman', x: 11, z: 12, diedAt: 2 },
        { team: 0, type: 'paladin', x: 11, z: 13, diedAt: 3 },
        { team: 0, type: 'barracks', x: 11, z: 14, diedAt: 4 },
      ]
      g.deadUnitRecords.push(...records)

      const unitCountBefore = g.units.length
      const manaBefore = paladin.mana
      const castOk = g.castResurrection(paladin)
      const revived = g.units.slice(unitCountBefore).map((u: any) => ({
        type: u.type,
        team: u.team,
        x: Number(u.mesh.position.x.toFixed(1)),
        z: Number(u.mesh.position.z.toFixed(1)),
        hp: u.hp,
        maxHp: u.maxHp,
      }))

      return {
        castOk,
        manaConsumed: manaBefore - paladin.mana,
        cooldownRemaining: paladin.resurrectionCooldownUntil - g.gameTime,
        revived,
        remainingRecords: g.deadUnitRecords.map((r: any) => ({
          team: r.team,
          type: r.type,
          x: r.x,
          z: r.z,
          diedAt: r.diedAt,
        })),
      }
    })

    expect(result.castOk).toBe(true)
    expect(result.manaConsumed).toBe(RES_L1.mana)
    expect(result.cooldownRemaining).toBeCloseTo(RES_L1.cooldown, 0)
    expect(result.revived.map((u: any) => u.type)).toEqual([
      'rifleman',
      'footman',
      'footman',
      'footman',
      'rifleman',
      'footman',
    ])
    expect(result.revived.every((u: any) => u.team === 0 && u.hp === u.maxHp)).toBe(true)
    expect(result.revived.map((u: any) => u.x)).toEqual([11, 13, 12, 14, 15, 16])
    expect(result.remainingRecords.map((r: any) => `${r.team}:${r.type}:${r.x}:${r.z}`)).toEqual([
      '0:rifleman:17:11',
      '0:footman:40:40',
      '1:footman:11:12',
      '0:paladin:11:13',
      '0:barracks:11:14',
    ])
  })

  test('CAST-3: failed casts do not spend mana or start cooldown', async ({ page }) => {
    await waitForRuntime(page)

    const result = await page.evaluate(({ manaCost }) => {
      const g = (window as any).__war3Game
      g.deadUnitRecords = []
      const paladin = g.spawnUnit('paladin', 0, 10, 10)
      paladin.mana = 500
      paladin.abilityLevels = { ...(paladin.abilityLevels ?? {}), resurrection: 1 }

      const noRecord = g.castResurrection(paladin)
      const afterNoRecord = { mana: paladin.mana, cooldown: paladin.resurrectionCooldownUntil }

      g.deadUnitRecords.push({ team: 0, type: 'footman', x: 11, z: 11, diedAt: 1 })
      paladin.mana = manaCost - 1
      const noMana = g.castResurrection(paladin)
      const afterNoMana = { mana: paladin.mana, cooldown: paladin.resurrectionCooldownUntil }

      paladin.mana = 500
      paladin.resurrectionCooldownUntil = g.gameTime + 10
      const onCooldown = g.castResurrection(paladin)
      const afterCooldown = { mana: paladin.mana, cooldown: paladin.resurrectionCooldownUntil }

      return { noRecord, afterNoRecord, noMana, afterNoMana, onCooldown, afterCooldown }
    }, { manaCost: RES_L1.mana })

    expect(result.noRecord).toBe(false)
    expect(result.afterNoRecord.mana).toBe(500)
    expect(result.afterNoRecord.cooldown).toBe(0)
    expect(result.noMana).toBe(false)
    expect(result.afterNoMana.mana).toBe(RES_L1.mana - 1)
    expect(result.afterNoMana.cooldown).toBe(0)
    expect(result.onCooldown).toBe(false)
    expect(result.afterCooldown.mana).toBe(500)
    expect(result.afterCooldown.cooldown).toBeGreaterThan(0)
  })

  test('CAST-4: real dead-unit records can feed Resurrection once', async ({ page }) => {
    await waitForRuntime(page)

    const result = await page.evaluate(({ footmanHp }) => {
      const g = (window as any).__war3Game
      g.deadUnitRecords = []
      const paladin = g.spawnUnit('paladin', 0, 20, 20)
      paladin.mana = 500
      paladin.abilityLevels = { ...(paladin.abilityLevels ?? {}), resurrection: 1 }
      const footman = g.spawnUnit('footman', 0, 22, 20)
      const deathX = Number(footman.mesh.position.x.toFixed(1))
      const deathZ = Number(footman.mesh.position.z.toFixed(1))

      footman.hp = 0
      g.handleDeadUnits()
      const recordsAfterDeath = g.deadUnitRecords.length
      const castOk = g.castResurrection(paladin)
      const matchingRevived = g.units.find((u: any) =>
        u !== footman &&
        u.type === 'footman' &&
        u.team === 0 &&
        Number(u.mesh.position.x.toFixed(1)) === deathX &&
        Number(u.mesh.position.z.toFixed(1)) === deathZ &&
        u.hp === footmanHp,
      )
      const secondCast = g.castResurrection(paladin)

      return {
        recordsAfterDeath,
        castOk,
        matchingRevived: !!matchingRevived,
        recordCountAfterCast: g.deadUnitRecords.length,
        secondCast,
      }
    }, { footmanHp: UNITS.footman.hp })

    expect(result.recordsAfterDeath).toBe(1)
    expect(result.castOk).toBe(true)
    expect(result.matchingRevived).toBe(true)
    expect(result.recordCountAfterCast).toBe(0)
    expect(result.secondCast).toBe(false)
  })

  test('CAST-5: HERO9 Altar revive remains separate from Resurrection', async ({ page }) => {
    await waitForRuntime(page)

    const result = await page.evaluate(() => {
      const g = (window as any).__war3Game
      g.deadUnitRecords = []
      g.resources.earn(0, 10000, 10000)
      const altar = g.spawnBuilding('altar_of_kings', 0, 15, 15)
      const paladin = g.spawnUnit('paladin', 0, 18, 15)
      paladin.mana = 500
      paladin.abilityLevels = { ...(paladin.abilityLevels ?? {}), resurrection: 1 }

      paladin.hp = 0
      g.handleDeadUnits()
      const deadOk = paladin.isDead === true && paladin.mesh.visible === false
      const noHeroRecord = !g.deadUnitRecords.some((r: any) => r.type === 'paladin')
      const resCastFailed = !g.castResurrection(paladin)

      g.startReviveHero(altar, 'paladin')
      const queueStarted = altar.reviveQueue.length === 1
      if (queueStarted) {
        altar.reviveQueue[0].remaining = 0.001
        g.updateUnits(0.1)
      }

      return {
        deadOk,
        noHeroRecord,
        resCastFailed,
        queueStarted,
        altarRevived: paladin.isDead === false && paladin.hp > 0 && paladin.mesh.visible === true,
        learnedAfterRevive: paladin.abilityLevels?.resurrection ?? 0,
      }
    })

    expect(result.deadOk).toBe(true)
    expect(result.noHeroRecord).toBe(true)
    expect(result.resCastFailed).toBe(true)
    expect(result.queueStarted).toBe(true)
    expect(result.altarRevived).toBe(true)
    expect(result.learnedAfterRevive).toBe(1)
  })
})
