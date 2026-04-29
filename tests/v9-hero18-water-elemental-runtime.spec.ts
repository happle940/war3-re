/**
 * V9 HERO18-IMPL1 Water Elemental minimal summon runtime proof.
 *
 * Scope:
 * - Archmage can learn Water Elemental Lv1/Lv2/Lv3 with hero-level gates.
 * - Learned level survives hero death and Altar revive.
 * - Cast reads WATER_ELEMENTAL_SUMMON_LEVELS for mana/cooldown/duration/stats.
 * - Failure paths do not spend mana, start cooldown, or create summons.
 * - Killed/expired summons do not enter Resurrection deadUnitRecords.
 * - Paladin command/cast surface and GameData boundaries remain intact.
 */
import { test, expect, type Page } from '@playwright/test'
import {
  HERO_REVIVE_RULES,
  UNITS,
  WATER_ELEMENTAL_SUMMON_LEVELS,
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

function archmageReviveTime() {
  return Math.round(Math.min(
    UNITS.archmage.trainTime * HERO_REVIVE_RULES.timeFactor,
    UNITS.archmage.trainTime * HERO_REVIVE_RULES.timeMaxFactor,
    HERO_REVIVE_RULES.timeHardCap,
  ))
}

test.describe('V9 HERO18-IMPL1 Water Elemental runtime', () => {
  test.setTimeout(180000)

  test('WE-RT-1: Archmage learns Lv1/Lv2/Lv3 from command card with source hero-level gates', async ({ page }) => {
    await waitForRuntime(page)

    const result = await page.evaluate(() => {
      const g = (window as any).__war3Game
      const archmage = g.spawnUnit('archmage', 0, 30, 30)
      archmage.heroLevel = 1
      archmage.heroSkillPoints = 3
      archmage.mana = archmage.maxMana

      const select = () => {
        g.selectionModel.clear()
        g.selectionModel.setSelection([archmage])
        g._lastCmdKey = ''
        g.updateHUD(0.016)
      }
      select()

      const learnLv1 = (window as any).__cmdButton('学习水元素 (Lv1)')
      const lv1Cost = learnLv1?.querySelector('.btn-cost')?.textContent ?? ''
      learnLv1?.click()
      select()

      const blockedLv2 = (window as any).__cmdButton('学习水元素 (Lv2)')
      const blockedLv2Reason = blockedLv2?.dataset.disabledReason ?? ''

      archmage.heroLevel = 3
      select()
      const learnLv2 = (window as any).__cmdButton('学习水元素 (Lv2)')
      learnLv2?.click()
      select()

      archmage.heroLevel = 5
      select()
      const learnLv3 = (window as any).__cmdButton('学习水元素 (Lv3)')
      learnLv3?.click()
      select()

      const labels = Array.from(document.querySelectorAll('#command-card button')).map((b: any) =>
        b.querySelector('.btn-label')?.textContent?.trim() ?? '',
      )
      const castButton = (window as any).__cmdButton('召唤水元素 (Lv3)')

      return {
        lv1Button: !!learnLv1,
        lv1Disabled: learnLv1?.disabled ?? null,
        lv1Cost,
        afterLv1: 1,
        blockedLv2Disabled: blockedLv2?.disabled ?? null,
        blockedLv2Reason,
        lv2ButtonEnabled: learnLv2?.disabled === false,
        lv3ButtonEnabled: learnLv3?.disabled === false,
        learnedLevel: archmage.abilityLevels?.water_elemental ?? 0,
        skillPoints: archmage.heroSkillPoints,
        hasLv4Learn: labels.includes('学习水元素 (Lv4)'),
        hasCastButton: !!castButton,
      }
    })

    expect(result.lv1Button).toBe(true)
    expect(result.lv1Disabled).toBe(false)
    expect(result.lv1Cost).toContain(String(WATER_ELEMENTAL_SUMMON_LEVELS[0].mana))
    expect(result.blockedLv2Disabled).toBe(true)
    expect(result.blockedLv2Reason).toContain(String(WATER_ELEMENTAL_SUMMON_LEVELS[1].requiredHeroLevel))
    expect(result.lv2ButtonEnabled).toBe(true)
    expect(result.lv3ButtonEnabled).toBe(true)
    expect(result.learnedLevel).toBe(3)
    expect(result.skillPoints).toBe(0)
    expect(result.hasLv4Learn).toBe(false)
    expect(result.hasCastButton).toBe(true)
  })

  test('WE-RT-2: learned Water Elemental survives Archmage death and Altar revive', async ({ page }) => {
    await waitForRuntime(page)

    const result = await page.evaluate(({ reviveTime }) => {
      const g = (window as any).__war3Game
      g.resources.earn(0, 10000, 10000)
      const altar = g.spawnBuilding('altar_of_kings', 0, 14, 14)
      const archmage = g.spawnUnit('archmage', 0, 18, 14)
      archmage.heroLevel = 3
      archmage.heroSkillPoints = 0
      archmage.abilityLevels = { ...(archmage.abilityLevels ?? {}), water_elemental: 2 }

      archmage.hp = 0
      g.update(0.5)
      const dead = archmage.isDead === true
      const levelWhileDead = archmage.abilityLevels?.water_elemental ?? 0

      ;(g as any).startReviveHero(altar, 'archmage')
      const queuedDuration = altar.reviveQueue[0]?.totalDuration ?? 0
      const dt = 0.5
      for (let i = 0; i < Math.ceil((queuedDuration || reviveTime) / dt) + 8 && altar.reviveQueue.length > 0; i++) {
        g.update(dt)
      }

      return {
        dead,
        levelWhileDead,
        queueStarted: queuedDuration > 0,
        sameRecord: g.units.includes(archmage),
        isDeadAfterRevive: archmage.isDead === true,
        visibleAfterRevive: archmage.mesh.visible === true,
        hpAfterRevive: archmage.hp,
        manaAfterRevive: archmage.mana,
        levelAfterRevive: archmage.abilityLevels?.water_elemental ?? 0,
      }
    }, { reviveTime: archmageReviveTime() })

    expect(result.dead).toBe(true)
    expect(result.levelWhileDead).toBe(2)
    expect(result.queueStarted).toBe(true)
    expect(result.sameRecord).toBe(true)
    expect(result.isDeadAfterRevive).toBe(false)
    expect(result.visibleAfterRevive).toBe(true)
    expect(result.hpAfterRevive).toBeGreaterThan(0)
    expect(result.manaAfterRevive).toBe(UNITS.archmage.maxMana)
    expect(result.levelAfterRevive).toBe(2)
  })

  test('WE-RT-3: cast creates one controllable summon with source-confirmed Lv2 stats', async ({ page }) => {
    await waitForRuntime(page)
    const levelData = WATER_ELEMENTAL_SUMMON_LEVELS[1]

    const result = await page.evaluate(({ learnedLevel }) => {
      const g = (window as any).__war3Game
      const archmage = g.spawnUnit('archmage', 0, 30, 30)
      archmage.abilityLevels = { ...(archmage.abilityLevels ?? {}), water_elemental: learnedLevel }
      archmage.mana = archmage.maxMana
      const beforeMana = archmage.mana

      const ok = g.castSummonWaterElemental(archmage, archmage.mesh.position.x + 2, archmage.mesh.position.z + 2)
      const summons = g.units.filter((u: any) => u.type === 'water_elemental')
      const we = summons[0]

      return {
        ok,
        count: summons.length,
        manaSpent: beforeMana - archmage.mana,
        cooldownRemaining: archmage.waterElementalCooldownUntil - g.gameTime,
        summon: we ? {
          team: we.team,
          isBuilding: we.isBuilding,
          hp: we.hp,
          maxHp: we.maxHp,
          attackDamage: we.attackDamage,
          attackRange: we.attackRange,
          armor: we.armor,
          speed: we.speed,
          expiresIn: we.summonExpireAt - g.gameTime,
          alive: we.hp > 0,
        } : null,
      }
    }, { learnedLevel: 2 })

    expect(result.ok).toBe(true)
    expect(result.count).toBe(1)
    expect(result.manaSpent).toBe(levelData.mana)
    expect(result.cooldownRemaining).toBeCloseTo(levelData.cooldown, 1)
    expect(result.summon).toMatchObject({
      team: 0,
      isBuilding: false,
      hp: levelData.summonedHp,
      maxHp: levelData.summonedHp,
      attackDamage: levelData.summonedAttackDamage,
      attackRange: levelData.summonedAttackRange,
      armor: levelData.summonedArmor,
      speed: levelData.summonedSpeed,
      alive: true,
    })
    expect(result.summon?.expiresIn).toBeCloseTo(levelData.duration, 1)
  })

  test('WE-RT-4: invalid casts do not spend mana, start cooldown, or create summons', async ({ page }) => {
    await waitForRuntime(page)

    const result = await page.evaluate(() => {
      const g = (window as any).__war3Game
      const archmage = g.spawnUnit('archmage', 0, 30, 30)
      archmage.abilityLevels = { ...(archmage.abilityLevels ?? {}), water_elemental: 1 }
      archmage.mana = archmage.maxMana
      const altar = g.spawnBuilding('altar_of_kings', 0, 32, 30)

      const snapshot = () => ({
        mana: archmage.mana,
        cooldown: archmage.waterElementalCooldownUntil,
        summons: g.units.filter((u: any) => u.type === 'water_elemental').length,
      })
      const runBlocked = (mutate: () => void, targetX = archmage.mesh.position.x + 2, targetZ = archmage.mesh.position.z + 2) => {
        archmage.abilityLevels = { ...(archmage.abilityLevels ?? {}), water_elemental: 1 }
        archmage.mana = archmage.maxMana
        archmage.waterElementalCooldownUntil = 0
        archmage.isDead = false
        archmage.hp = archmage.maxHp
        g.units = g.units.filter((u: any) => u.type !== 'water_elemental')
        mutate()
        const before = snapshot()
        const ok = g.castSummonWaterElemental(archmage, targetX, targetZ)
        const after = snapshot()
        return { ok, before, after }
      }

      const unlearned = runBlocked(() => { archmage.abilityLevels.water_elemental = 0 })
      const lowMana = runBlocked(() => { archmage.mana = 1 })
      const cooldown = runBlocked(() => { archmage.waterElementalCooldownUntil = g.gameTime + 10 })
      const dead = runBlocked(() => { archmage.isDead = true; archmage.hp = 0 })
      const outOfRange = runBlocked(() => {}, archmage.mesh.position.x + 50, archmage.mesh.position.z + 50)
      const blocked = runBlocked(() => {}, altar.mesh.position.x, altar.mesh.position.z)

      return { unlearned, lowMana, cooldown, dead, outOfRange, blocked }
    })

    for (const entry of Object.values(result) as any[]) {
      expect(entry.ok).toBe(false)
      expect(entry.after.mana).toBe(entry.before.mana)
      expect(entry.after.cooldown).toBe(entry.before.cooldown)
      expect(entry.after.summons).toBe(entry.before.summons)
    }
  })

  test('WE-RT-5: killed and expired water elementals do not enter deadUnitRecords', async ({ page }) => {
    await waitForRuntime(page)

    const result = await page.evaluate(() => {
      const g = (window as any).__war3Game
      g.deadUnitRecords = []
      const archmage = g.spawnUnit('archmage', 0, 30, 30)
      archmage.abilityLevels = { ...(archmage.abilityLevels ?? {}), water_elemental: 1 }
      archmage.mana = archmage.maxMana

      g.castSummonWaterElemental(archmage, archmage.mesh.position.x + 2, archmage.mesh.position.z + 2)
      const killed = g.units.find((u: any) => u.type === 'water_elemental')
      if (!killed) return { ok: false, reason: 'missing killed summon' }
      killed.hp = 0
      g.update(0.5)
      const recordsAfterKill = g.deadUnitRecords.filter((r: any) => r.type === 'water_elemental').length

      archmage.waterElementalCooldownUntil = 0
      archmage.mana = archmage.maxMana
      g.castSummonWaterElemental(archmage, archmage.mesh.position.x + 3, archmage.mesh.position.z + 2)
      const expiring = g.units.find((u: any) => u.type === 'water_elemental')
      if (!expiring) return { ok: false, reason: 'missing expiring summon' }
      const expiresIn = expiring.summonExpireAt - g.gameTime
      for (let i = 0; i < Math.ceil((expiresIn + 1) * 2); i++) {
        g.update(0.5)
      }
      const recordsAfterExpire = g.deadUnitRecords.filter((r: any) => r.type === 'water_elemental').length
      const remainingSummons = g.units.filter((u: any) => u.type === 'water_elemental').length

      return {
        ok: true,
        recordsAfterKill,
        recordsAfterExpire,
        remainingSummons,
      }
    })

    expect(result.ok).toBe(true)
    expect(result.recordsAfterKill).toBe(0)
    expect(result.recordsAfterExpire).toBe(0)
    expect(result.remainingSummons).toBe(0)
  })

  test('WE-RT-6: command-card cast button enters and cancels ground-target mode', async ({ page }) => {
    await waitForRuntime(page)

    const result = await page.evaluate(() => {
      const g = (window as any).__war3Game
      const archmage = g.spawnUnit('archmage', 0, 30, 30)
      archmage.abilityLevels = { ...(archmage.abilityLevels ?? {}), water_elemental: 1 }
      archmage.mana = archmage.maxMana
      g.selectionModel.clear()
      g.selectionModel.setSelection([archmage])
      g._lastCmdKey = ''
      g.updateHUD(0.016)

      const cast = (window as any).__cmdButton('召唤水元素 (Lv1)')
      const castCost = cast?.querySelector('.btn-cost')?.textContent ?? ''
      cast?.click()
      const entered = g.weTargetMode === true && g.weTargetCaster === archmage
      const hintAfterEnter = document.getElementById('mode-hint')?.textContent ?? ''

      const canvas = document.getElementById('game-canvas')!
      canvas.dispatchEvent(new MouseEvent('contextmenu', { bubbles: true, cancelable: true, button: 2 }))
      const canceledByRightClick = g.weTargetMode === false && !g.weTargetCaster

      cast?.click()
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))
      const canceledByEscape = g.weTargetMode === false && !g.weTargetCaster

      return { hasCast: !!cast, disabled: cast?.disabled ?? null, castCost, entered, hintAfterEnter, canceledByRightClick, canceledByEscape }
    })

    expect(result.hasCast).toBe(true)
    expect(result.disabled).toBe(false)
    expect(result.castCost).toContain(String(WATER_ELEMENTAL_SUMMON_LEVELS[0].mana))
    expect(result.entered).toBe(true)
    expect(result.hintAfterEnter).toContain('召唤水元素')
    expect(result.canceledByRightClick).toBe(true)
    expect(result.canceledByEscape).toBe(true)
  })

  test('WE-RT-7: Paladin remains separate and no runtime-facing GameData Water Elemental unit entry exists', async ({ page }) => {
    expect((UNITS as any).water_elemental).toBeUndefined()

    await waitForRuntime(page)
    const result = await page.evaluate(() => {
      const g = (window as any).__war3Game
      const paladin = g.spawnUnit('paladin', 0, 30, 30)
      paladin.abilityLevels = { ...(paladin.abilityLevels ?? {}), holy_light: 1 }
      paladin.mana = paladin.maxMana
      g.selectionModel.clear()
      g.selectionModel.setSelection([paladin])
      g._lastCmdKey = ''
      g.updateHUD(0.016)

      const labels = Array.from(document.querySelectorAll('#command-card button')).map((b: any) =>
        b.querySelector('.btn-label')?.textContent?.trim() ?? '',
      )
      const footman = g.spawnUnit('footman', 0, paladin.mesh.position.x + 1, paladin.mesh.position.z)
      footman.hp = 10
      const holyLightOk = g.castHolyLight(paladin, footman)

      return {
        hasHolyLight: labels.some(label => label.includes('圣光术')),
        hasWaterElemental: labels.some(label => label.includes('水元素')),
        holyLightOk,
        footmanHp: footman.hp,
      }
    })

    expect(result.hasHolyLight).toBe(true)
    expect(result.hasWaterElemental).toBe(false)
    expect(result.holyLightOk).toBe(true)
    expect(result.footmanHp).toBeGreaterThan(10)
  })
})
