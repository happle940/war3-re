/**
 * V9 HERO20-IMPL1 Blizzard minimal runtime proof.
 *
 * Scope:
 * - Archmage can learn Blizzard Lv1/Lv2/Lv3 through command card gates.
 * - Cast reads HERO_ABILITY_LEVELS.blizzard for mana, cooldown, range, waves, damage,
 *   maxTargets, and building damage multiplier.
 * - Failure paths do not spend mana, start cooldown, or create a channel.
 * - Channel stops on death and player stop/move orders.
 * - ABILITIES.blizzard remains outside this task; AI may separately use Blizzard intent.
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

test.describe('V9 HERO20-IMPL1 Blizzard runtime', () => {
  test.setTimeout(180000)

  test('BLZ-RT-1: Archmage learns Lv1/Lv2/Lv3 with command-card hero-level gates', async ({ page }) => {
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

      const learnLv1 = (window as any).__cmdButton('学习暴风雪 (Lv1)')
      const lv1Cost = learnLv1?.querySelector('.btn-cost')?.textContent ?? ''
      learnLv1?.click()
      select()

      const blockedLv2 = (window as any).__cmdButton('学习暴风雪 (Lv2)')
      const blockedLv2Reason = blockedLv2?.dataset.disabledReason ?? ''

      archmage.heroLevel = 3
      select()
      const learnLv2 = (window as any).__cmdButton('学习暴风雪 (Lv2)')
      learnLv2?.click()
      select()

      archmage.heroLevel = 5
      select()
      const learnLv3 = (window as any).__cmdButton('学习暴风雪 (Lv3)')
      learnLv3?.click()
      select()

      const labels = Array.from(document.querySelectorAll('#command-card button')).map((b: any) =>
        b.querySelector('.btn-label')?.textContent?.trim() ?? '',
      )
      const castButton = (window as any).__cmdButton('暴风雪 (Lv3)')

      return {
        lv1Button: !!learnLv1,
        lv1Disabled: learnLv1?.disabled ?? null,
        lv1Cost,
        blockedLv2Disabled: blockedLv2?.disabled ?? null,
        blockedLv2Reason,
        lv2ButtonEnabled: learnLv2?.disabled === false,
        lv3ButtonEnabled: learnLv3?.disabled === false,
        learnedLevel: archmage.abilityLevels?.blizzard ?? 0,
        skillPoints: archmage.heroSkillPoints,
        hasLv4Learn: labels.includes('学习暴风雪 (Lv4)'),
        hasCastButton: !!castButton,
      }
    })

    const blizzard = HERO_ABILITY_LEVELS.blizzard
    expect(result.lv1Button).toBe(true)
    expect(result.lv1Disabled).toBe(false)
    expect(result.lv1Cost).toContain(String(blizzard.levels[0].effectValue))
    expect(result.blockedLv2Disabled).toBe(true)
    expect(result.blockedLv2Reason).toContain(String(blizzard.levels[1].requiredHeroLevel))
    expect(result.lv2ButtonEnabled).toBe(true)
    expect(result.lv3ButtonEnabled).toBe(true)
    expect(result.learnedLevel).toBe(3)
    expect(result.skillPoints).toBe(0)
    expect(result.hasLv4Learn).toBe(false)
    expect(result.hasCastButton).toBe(true)
  })

  test('BLZ-RT-2: invalid casts do not spend mana, start cooldown, or create a channel', async ({ page }) => {
    await waitForRuntime(page)

    const result = await page.evaluate(() => {
      const g = (window as any).__war3Game
      const archmage = g.spawnUnit('archmage', 0, 30, 30)
      archmage.attackDamage = 0
      archmage.attackRange = 0
      archmage.abilityLevels = { ...(archmage.abilityLevels ?? {}), blizzard: 1 }
      archmage.mana = archmage.maxMana
      const targetX = archmage.mesh.position.x + 4
      const targetZ = archmage.mesh.position.z

      const snapshot = () => ({
        mana: archmage.mana,
        cooldown: archmage.blizzardCooldownUntil,
        channel: !!g.blizzardChannel,
      })
      const runBlocked = (mutate: () => void, x = targetX, z = targetZ) => {
        archmage.abilityLevels = { ...(archmage.abilityLevels ?? {}), blizzard: 1 }
        archmage.mana = archmage.maxMana
        archmage.blizzardCooldownUntil = 0
        archmage.isDead = false
        archmage.hp = archmage.maxHp
        g.blizzardChannel = null
        mutate()
        const before = snapshot()
        const ok = g.castBlizzard(archmage, x, z)
        const after = snapshot()
        return { ok, before, after }
      }

      const unlearned = runBlocked(() => { archmage.abilityLevels.blizzard = 0 })
      const lowMana = runBlocked(() => { archmage.mana = 1 })
      const cooldown = runBlocked(() => { archmage.blizzardCooldownUntil = g.gameTime + 10 })
      const dead = runBlocked(() => { archmage.isDead = true; archmage.hp = 0 })
      const outOfRange = runBlocked(() => {}, targetX + 100, targetZ)

      archmage.abilityLevels.blizzard = 1
      archmage.mana = archmage.maxMana
      archmage.blizzardCooldownUntil = 0
      g.blizzardChannel = null
      const firstOk = g.castBlizzard(archmage, targetX, targetZ)
      const afterFirstMana = archmage.mana
      const secondOk = g.castBlizzard(archmage, targetX, targetZ)
      const afterSecondMana = archmage.mana

      return { unlearned, lowMana, cooldown, dead, outOfRange, firstOk, secondOk, afterFirstMana, afterSecondMana }
    })

    for (const blocked of [result.unlearned, result.lowMana, result.cooldown, result.dead, result.outOfRange]) {
      expect(blocked.ok).toBe(false)
      expect(blocked.after.mana).toBe(blocked.before.mana)
      expect(blocked.after.cooldown).toBe(blocked.before.cooldown)
      expect(blocked.after.channel).toBe(false)
    }
    expect(result.firstOk).toBe(true)
    expect(result.secondOk).toBe(false)
    expect(result.afterSecondMana).toBe(result.afterFirstMana)
  })

  test('BLZ-RT-3: successful cast reads source data for mana, cooldown, waves, damage, and building multiplier', async ({ page }) => {
    await waitForRuntime(page)
    const levelData = HERO_ABILITY_LEVELS.blizzard.levels[1]

    const result = await page.evaluate(() => {
      const g = (window as any).__war3Game
      const archmage = g.spawnUnit('archmage', 0, 30, 30)
      archmage.attackDamage = 0
      archmage.attackRange = 0
      archmage.abilityLevels = { ...(archmage.abilityLevels ?? {}), blizzard: 2 }
      archmage.mana = archmage.maxMana
      const targetX = 35
      const targetZ = 30
      const enemy = g.spawnUnit('footman', 1, targetX, targetZ)
      const friendly = g.spawnUnit('footman', 0, targetX + 0.5, targetZ)
      const outside = g.spawnUnit('footman', 1, targetX + 5, targetZ)
      const building = g.spawnBuilding('farm', 1, targetX, targetZ + 1)
      for (const u of g.units) {
        u.attackDamage = 0
        u.attackRange = 0
        u.attackTarget = null
        u.aggroSuppressUntil = g.gameTime + 999
      }
      const before = {
        mana: archmage.mana,
        enemyHp: enemy.hp,
        friendlyHp: friendly.hp,
        outsideHp: outside.hp,
        buildingHp: building.hp,
      }
      const ok = g.castBlizzard(archmage, targetX, targetZ)
      const channelAfterCast = {
        exists: !!g.blizzardChannel,
        wavesRemaining: g.blizzardChannel?.wavesRemaining ?? 0,
        interval: g.blizzardChannel?.waveInterval ?? 0,
      }
      const cooldownAfterCast = archmage.blizzardCooldownUntil - g.gameTime
      for (let t = 0; t < 9; t += 0.25) g.update(0.25)
      return {
        ok,
        manaSpent: before.mana - archmage.mana,
        cooldownAfterCast,
        channelAfterCast,
        channelAfterFinish: !!g.blizzardChannel,
        enemyDamage: before.enemyHp - enemy.hp,
        friendlyDamage: before.friendlyHp - friendly.hp,
        outsideDamage: before.outsideHp - outside.hp,
        buildingDamage: before.buildingHp - building.hp,
      }
    })

    expect(result.ok).toBe(true)
    expect(result.manaSpent).toBe(levelData.mana)
    expect(result.cooldownAfterCast).toBeCloseTo(levelData.cooldown, 3)
    expect(result.channelAfterCast).toMatchObject({
      exists: true,
      wavesRemaining: levelData.waves,
    })
    expect(result.channelAfterCast.interval).toBeCloseTo(levelData.duration! / levelData.waves!, 3)
    expect(result.channelAfterFinish).toBe(false)
    expect(result.enemyDamage).toBe(levelData.effectValue * levelData.waves!)
    expect(result.friendlyDamage).toBe(0)
    expect(result.outsideDamage).toBe(0)
    expect(result.buildingDamage).toBe(levelData.effectValue * levelData.waves! * levelData.buildingDamageMultiplier!)
  })

  test('BLZ-RT-4: each wave respects maxTargets from HERO_ABILITY_LEVELS.blizzard', async ({ page }) => {
    await waitForRuntime(page)
    const levelData = HERO_ABILITY_LEVELS.blizzard.levels[0]

    const result = await page.evaluate(() => {
      const g = (window as any).__war3Game
      const archmage = g.spawnUnit('archmage', 0, 30, 30)
      archmage.attackDamage = 0
      archmage.attackRange = 0
      archmage.abilityLevels = { ...(archmage.abilityLevels ?? {}), blizzard: 1 }
      archmage.mana = archmage.maxMana
      const targetX = 35
      const targetZ = 30
      const enemies = Array.from({ length: 6 }, (_, i) => {
        const u = g.spawnUnit('footman', 1, targetX + (i % 3) * 0.2, targetZ + Math.floor(i / 3) * 0.2)
        u.attackDamage = 0
        u.attackRange = 0
        u.hp = 1000
        u.maxHp = 1000
        return u
      })
      const before = enemies.map((u: any) => u.hp)
      const ok = g.castBlizzard(archmage, targetX, targetZ)
      g.update(1.05)
      const damaged = enemies.filter((u: any, i: number) => before[i] - u.hp > 0).length
      const damageValues = enemies.map((u: any, i: number) => before[i] - u.hp)
      return { ok, damaged, damageValues }
    })

    expect(result.ok).toBe(true)
    expect(result.damaged).toBe(levelData.maxTargets)
    expect(result.damageValues.filter((value: number) => value === levelData.effectValue)).toHaveLength(levelData.maxTargets!)
    expect(result.damageValues.filter((value: number) => value === 0)).toHaveLength(1)
  })

  test('BLZ-RT-5: channel stops on death, stop order, and move order before the next wave', async ({ page }) => {
    await waitForRuntime(page)

    const result = await page.evaluate(() => {
      const g = (window as any).__war3Game
      const runCase = (kind: 'death' | 'stop' | 'move') => {
        const archmage = g.spawnUnit('archmage', 0, 30, 30)
        archmage.attackDamage = 0
        archmage.attackRange = 0
        archmage.abilityLevels = { ...(archmage.abilityLevels ?? {}), blizzard: 1 }
        archmage.mana = archmage.maxMana
        const enemy = g.spawnUnit('footman', 1, 35, 30)
        enemy.attackDamage = 0
        enemy.attackRange = 0
        enemy.hp = 1000
        enemy.maxHp = 1000
        const beforeHp = enemy.hp
        const ok = g.castBlizzard(archmage, 35, 30)
        if (kind === 'death') {
          archmage.hp = 0
          archmage.isDead = true
        } else if (kind === 'stop') {
          g.issueCommand([archmage], { type: 'stop' })
        } else {
          const target = archmage.mesh.position.clone()
          target.x += 1
          g.issueCommand([archmage], { type: 'move', target })
        }
        g.update(1.1)
        return {
          ok,
          damage: beforeHp - enemy.hp,
          channelAfter: !!g.blizzardChannel,
        }
      }
      return {
        death: runCase('death'),
        stop: runCase('stop'),
        move: runCase('move'),
      }
    })

    for (const current of [result.death, result.stop, result.move]) {
      expect(current.ok).toBe(true)
      expect(current.damage).toBe(0)
      expect(current.channelAfter).toBe(false)
    }
  })

  test('BLZ-RT-6: command-card cast button enters and cancels Blizzard target mode', async ({ page }) => {
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

      const cast = (window as any).__cmdButton('暴风雪 (Lv1)')
      const castCost = cast?.querySelector('.btn-cost')?.textContent ?? ''
      cast?.click()
      const entered = g.blizzardTargetMode === true && g.blizzardTargetCaster === archmage
      const hintAfterEnter = document.getElementById('mode-hint')?.textContent ?? ''

      const canvas = document.getElementById('game-canvas')!
      canvas.dispatchEvent(new MouseEvent('contextmenu', { bubbles: true, cancelable: true, button: 2 }))
      const canceledByRightClick = g.blizzardTargetMode === false && !g.blizzardTargetCaster

      cast?.click()
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))
      const canceledByEscape = g.blizzardTargetMode === false && !g.blizzardTargetCaster

      return { hasCast: !!cast, disabled: cast?.disabled ?? null, castCost, entered, hintAfterEnter, canceledByRightClick, canceledByEscape }
    })

    expect(result.hasCast).toBe(true)
    expect(result.disabled).toBe(false)
    expect(result.castCost).toContain(String(HERO_ABILITY_LEVELS.blizzard.levels[0].mana))
    expect(result.entered).toBe(true)
    expect(result.hintAfterEnter).toContain('暴风雪')
    expect(result.canceledByRightClick).toBe(true)
    expect(result.canceledByEscape).toBe(true)
  })

  test('BLZ-RT-7: source boundaries stay clean and Water Elemental / Brilliance Aura remain separate', async ({ page }) => {
    expect((ABILITIES as any).blizzard).toBeUndefined()
    const gameSrc = readFileSync('src/game/Game.ts', 'utf-8')
    const archmageAbilitySrc = readFileSync('src/game/systems/ArchmageAbilitySystem.ts', 'utf-8')
    const aiSrc = readFileSync('src/game/SimpleAI.ts', 'utf-8')
    expect(archmageAbilitySrc).toContain('HERO_ABILITY_LEVELS.blizzard')
    expect(gameSrc).not.toContain('ABILITIES.blizzard')
    expect(archmageAbilitySrc).not.toContain('ABILITIES.blizzard')
    expect(gameSrc).toContain('interruptChanneledCastsForOrder')
    expect(aiSrc.toLowerCase()).toContain('blizzard')
    expect(aiSrc.toLowerCase()).toContain('archmage')

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
      const buttons = Array.from(document.querySelectorAll('#command-card button')) as HTMLButtonElement[]
      const labels = buttons.map((b: any) => b.querySelector('.btn-label')?.textContent?.trim() ?? '')
      const massTeleportButton = buttons.find((b: any) =>
        b.querySelector('.btn-label')?.textContent?.includes('群体传送'),
      )
      return {
        hasWaterElemental: labels.some(label => label.includes('水元素')),
        hasBrillianceAura: labels.some(label => label.includes('辉煌光环')),
        hasBlizzard: labels.some(label => label.includes('暴风雪')),
        hasMassTeleport: labels.some(label => label.includes('群体传送') || label.includes('Mass Teleport')),
        massTeleportDisabled: massTeleportButton?.disabled ?? null,
        massTeleportReason: massTeleportButton?.dataset.disabledReason ?? '',
      }
    })

    expect(result.hasWaterElemental).toBe(true)
    expect(result.hasBrillianceAura).toBe(true)
    expect(result.hasBlizzard).toBe(true)
    expect(result.hasMassTeleport).toBe(true)
    expect(result.massTeleportDisabled).toBe(true)
    expect(result.massTeleportReason).toContain('英雄等级 6')
  })
})
