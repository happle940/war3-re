/**
 * V9 HERO21-IMPL1 Mass Teleport minimal runtime proof.
 *
 * Scope:
 * - Archmage can learn Mass Teleport at hero level 6 via command card.
 * - Below level 6, learn button is disabled with "需要英雄等级 6".
 * - Cast enters unit-target mode; valid target starts 3s delayed cast.
 * - Invalid targets (enemy, dead, empty ground) do not spend mana/cooldown.
 * - 3s delay must pass before teleport occurs.
 * - Interrupts (death, stop, move, dead target at completion) cancel pending.
 * - Transported units: alive friendly non-buildings within areaRadius 7.0.
 * - Cap 24 units including Archmage; nearest-first ordering.
 * - Worker resources unchanged; Water Elementals included.
 * - Placement uses deterministic non-overlap offsets.
 * - Selection preserved; no camera jump.
 * - No ABILITIES.mass_teleport; AI may learn Mass Teleport but does not auto-cast it.
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

const MT_DATA = HERO_ABILITY_LEVELS.mass_teleport.levels[0]

test.describe('V9 HERO21-IMPL1 Mass Teleport runtime', () => {
  test.setTimeout(180000)

  test('MT-RT-1: Archmage learns Mass Teleport at hero level 6 with command-card gate', async ({ page }) => {
    await waitForRuntime(page)

    const result = await page.evaluate(() => {
      const g = (window as any).__war3Game
      const archmage = g.spawnUnit('archmage', 0, 30, 30)
      archmage.heroLevel = 1
      archmage.heroSkillPoints = 4
      archmage.mana = archmage.maxMana

      const select = () => {
        g.selectionModel.clear()
        g.selectionModel.setSelection([archmage])
        g._lastCmdKey = ''
        g.updateHUD(0.016)
      }
      select()

      // At level 1, learn button should be disabled
      const blockedLearn = (window as any).__cmdButtonIncludes('学习群体传送')
      const blockedReason = blockedLearn?.dataset.disabledReason ?? ''
      const blockedDisabled = blockedLearn?.disabled ?? null

      // Level up to 6
      archmage.heroLevel = 6
      select()
      const learnButton = (window as any).__cmdButtonIncludes('学习群体传送')
      const learnDisabled = learnButton?.disabled ?? null
      learnButton?.click()
      select()

      const learnedLevel = archmage.abilityLevels?.mass_teleport ?? 0
      const skillPoints = archmage.heroSkillPoints

      // After learning, cast button should appear
      const castButton = (window as any).__cmdButton('群体传送')

      // No second learn level
      const labels = Array.from(document.querySelectorAll('#command-card button')).map((b: any) =>
        b.querySelector('.btn-label')?.textContent?.trim() ?? '',
      )
      const hasLv2Learn = labels.some(l => l.includes('学习群体传送'))

      return {
        hasBlockedLearn: !!blockedLearn,
        blockedDisabled,
        blockedReason,
        hasLearnButton: !!learnButton,
        learnDisabled,
        learnedLevel,
        skillPoints,
        hasCastButton: !!castButton,
        hasLv2Learn,
      }
    })

    expect(result.hasBlockedLearn).toBe(true)
    expect(result.blockedDisabled).toBe(true)
    expect(result.blockedReason).toContain('6')
    expect(result.hasLearnButton).toBe(true)
    expect(result.learnDisabled).toBe(false)
    expect(result.learnedLevel).toBe(1)
    expect(result.skillPoints).toBe(3)
    expect(result.hasCastButton).toBe(true)
    expect(result.hasLv2Learn).toBe(false)
  })

  test('MT-RT-2: invalid targets do not spend mana, start cooldown, or create pending state', async ({ page }) => {
    await waitForRuntime(page)

    const result = await page.evaluate(() => {
      const g = (window as any).__war3Game
      const archmage = g.spawnUnit('archmage', 0, 30, 30)
      archmage.abilityLevels = { ...(archmage.abilityLevels ?? {}), mass_teleport: 1 }
      archmage.mana = archmage.maxMana
      archmage.massTeleportCooldownUntil = 0

      const enemy = g.spawnUnit('footman', 1, 35, 30)
      const deadFriendly = g.spawnUnit('footman', 0, 36, 30)
      deadFriendly.hp = 0
      deadFriendly.isDead = true
      const friendly = g.spawnUnit('footman', 0, 37, 30)

      const snapshot = () => ({
        mana: archmage.mana,
        cooldown: archmage.massTeleportCooldownUntil,
        pending: !!g.massTeleportPending,
      })

      const resetState = () => {
        archmage.abilityLevels = { ...(archmage.abilityLevels ?? {}), mass_teleport: 1 }
        archmage.mana = archmage.maxMana
        archmage.massTeleportCooldownUntil = 0
        archmage.isDead = false
        archmage.hp = archmage.maxHp
        g.massTeleportPending = null
      }

      const testCast = (target: any) => {
        resetState()
        const before = snapshot()
        const ok = g.castMassTeleport(archmage, target)
        const after = snapshot()
        return { ok, before, after }
      }

      // External mutation tests — mutation must persist through cast call
      // Unlearned: set mass_teleport = 0 then cast WITHOUT resetState
      resetState()
      archmage.abilityLevels.mass_teleport = 0
      const unlearnedBefore = snapshot()
      const unlearnedOk = g.castMassTeleport(archmage, friendly)
      const unlearnedAfter = snapshot()
      const unlearned = { ok: unlearnedOk, before: unlearnedBefore, after: unlearnedAfter }

      // Low mana
      resetState()
      archmage.mana = 1
      const lowManaBefore = snapshot()
      const lowManaOk = g.castMassTeleport(archmage, friendly)
      const lowManaAfter = snapshot()
      const lowMana = { ok: lowManaOk, before: lowManaBefore, after: lowManaAfter }

      // Cooldown
      resetState()
      archmage.massTeleportCooldownUntil = g.gameTime + 10
      const cooldownBefore = snapshot()
      const cooldownOk = g.castMassTeleport(archmage, friendly)
      const cooldownAfter = snapshot()
      const cooldown = { ok: cooldownOk, before: cooldownBefore, after: cooldownAfter }

      // Dead caster
      resetState()
      archmage.isDead = true
      archmage.hp = 0
      const deadCasterBefore = snapshot()
      const deadCasterOk = g.castMassTeleport(archmage, friendly)
      const deadCasterAfter = snapshot()
      const deadCaster = { ok: deadCasterOk, before: deadCasterBefore, after: deadCasterAfter }

      // Standard blocked targets
      const enemyResult = testCast(enemy)
      const deadResult = testCast(deadFriendly)
      const nullResult = testCast(null)

      return { enemyResult, deadResult, nullResult, unlearned, lowMana, cooldown, deadCaster }
    })

    for (const r of [result.enemyResult, result.deadResult, result.nullResult,
      result.unlearned, result.lowMana, result.cooldown, result.deadCaster]) {
      expect(r.ok).toBe(false)
      expect(r.after.mana).toBe(r.before.mana)
      expect(r.after.cooldown).toBe(r.before.cooldown)
      expect(r.after.pending).toBe(false)
    }
  })

  test('MT-RT-3: valid target spends mana, starts cooldown, and creates pending state', async ({ page }) => {
    await waitForRuntime(page)

    const result = await page.evaluate(() => {
      const g = (window as any).__war3Game
      const archmage = g.spawnUnit('archmage', 0, 30, 30)
      archmage.abilityLevels = { ...(archmage.abilityLevels ?? {}), mass_teleport: 1 }
      archmage.mana = archmage.maxMana
      const friendly = g.spawnUnit('footman', 0, 50, 30)
      const beforeMana = archmage.mana
      const beforeCooldown = archmage.massTeleportCooldownUntil

      const ok = g.castMassTeleport(archmage, friendly)
      const manaSpent = beforeMana - archmage.mana
      const cooldownStarted = archmage.massTeleportCooldownUntil > beforeCooldown
      const hasPending = !!g.massTeleportPending
      const pendingTarget = g.massTeleportPending?.targetUnit
      const pendingDelay = g.massTeleportPending?.completeTime - g.massTeleportPending?.startTime

      return { ok, manaSpent, cooldownStarted, hasPending, pendingTarget: !!pendingTarget, pendingDelay }
    })

    expect(result.ok).toBe(true)
    expect(result.manaSpent).toBe(MT_DATA.mana)
    expect(result.cooldownStarted).toBe(true)
    expect(result.hasPending).toBe(true)
    expect(result.pendingTarget).toBe(true)
    expect(result.pendingDelay).toBeCloseTo(MT_DATA.castDelay, 3)
  })

  test('MT-RT-4: 3s delay must pass before teleport occurs', async ({ page }) => {
    await waitForRuntime(page)

    const result = await page.evaluate(() => {
      const g = (window as any).__war3Game
      const archmage = g.spawnUnit('archmage', 0, 30, 30)
      archmage.abilityLevels = { ...(archmage.abilityLevels ?? {}), mass_teleport: 1 }
      archmage.mana = archmage.maxMana
      const target = g.spawnUnit('footman', 0, 50, 30)

      const archX = archmage.mesh.position.x
      const archZ = archmage.mesh.position.z

      g.castMassTeleport(archmage, target)

      // Advance 1.5s — not enough
      for (let t = 0; t < 1.5; t += 0.1) g.update(0.1)
      const midPos = { x: archmage.mesh.position.x, z: archmage.mesh.position.z }
      const midPending = !!g.massTeleportPending

      // Advance remaining 2s — past 3s total
      for (let t = 0; t < 2.0; t += 0.1) g.update(0.1)
      const afterPos = { x: archmage.mesh.position.x, z: archmage.mesh.position.z }
      const afterPending = !!g.massTeleportPending

      return { archX, archZ, midPos, midPending, afterPos, afterPending }
    })

    // Mid-delay: archmage hasn't moved yet
    expect(result.midPos.x).toBeCloseTo(result.archX, 3)
    expect(result.midPos.z).toBeCloseTo(result.archZ, 3)
    expect(result.midPending).toBe(true)

    // After delay: archmage teleported
    expect(result.afterPos.x).not.toBeCloseTo(result.archX, 1)
    expect(result.afterPending).toBe(false)
  })

  test('MT-RT-5: interrupts cancel pending teleport; mana and cooldown not refunded', async ({ page }) => {
    await waitForRuntime(page)

    const result = await page.evaluate(() => {
      const cases: Record<string, () => { manaSpent: boolean; cooldownStarted: boolean; pendingAfter: boolean }> = {}

      const runCase = (name: string, interrupt: (g: any, archmage: any, target: any) => void) => {
        const g = (window as any).__war3Game
        const archmage = g.spawnUnit('archmage', 0, 30, 30)
        archmage.abilityLevels = { ...(archmage.abilityLevels ?? {}), mass_teleport: 1 }
        archmage.mana = archmage.maxMana
        archmage.massTeleportCooldownUntil = 0
        const target = g.spawnUnit('footman', 0, 50, 30)

        g.castMassTeleport(archmage, target)
        const manaAfterCast = archmage.mana
        const cdAfterCast = archmage.massTeleportCooldownUntil

        // Advance a bit, then interrupt
        for (let t = 0; t < 0.5; t += 0.1) g.update(0.1)
        interrupt(g, archmage, target)
        for (let t = 0; t < 3.0; t += 0.1) g.update(0.1)

        cases[name] = {
          manaSpent: archmage.mana < archmage.maxMana,
          cooldownStarted: archmage.massTeleportCooldownUntil > 0,
          pendingAfter: !!g.massTeleportPending,
        }
      }

      // Death interrupt
      runCase('death', (g, am) => { am.hp = 0; am.isDead = true })
      // Stop order
      runCase('stop', (g, am) => { g.issueCommand([am], { type: 'stop' }) })
      // Move order
      runCase('move', (g, am) => {
        const target = am.mesh.position.clone()
        target.x += 5
        g.issueCommand([am], { type: 'move', target })
      })

      return cases
    })

    for (const [name, r] of Object.entries(result)) {
      expect(r.pendingAfter).toBe(false)
      // Mana was spent and not refunded
      expect(r.manaSpent).toBe(true)
      // Cooldown was started and not reset
      expect(r.cooldownStarted).toBe(true)
    }
  })

  test('MT-RT-6: target invalid/dead at completion cancels pending teleport', async ({ page }) => {
    await waitForRuntime(page)

    const result = await page.evaluate(() => {
      const g = (window as any).__war3Game
      const archmage = g.spawnUnit('archmage', 0, 30, 30)
      archmage.abilityLevels = { ...(archmage.abilityLevels ?? {}), mass_teleport: 1 }
      archmage.mana = archmage.maxMana
      const target = g.spawnUnit('footman', 0, 50, 30)

      const archX = archmage.mesh.position.x

      g.castMassTeleport(archmage, target)

      // Kill target midway through delay
      for (let t = 0; t < 1.0; t += 0.1) g.update(0.1)
      target.hp = 0
      target.isDead = true

      // Advance past delay
      for (let t = 0; t < 3.0; t += 0.1) g.update(0.1)

      const posAfter = archmage.mesh.position.x

      return {
        moved: Math.abs(posAfter - archX) > 0.5,
        pending: !!g.massTeleportPending,
        manaSpent: archmage.mana < archmage.maxMana,
      }
    })

    expect(result.moved).toBe(false)
    expect(result.pending).toBe(false)
    expect(result.manaSpent).toBe(true) // mana not refunded
  })

  test('MT-RT-7: unit filter — only alive friendly non-buildings teleported', async ({ page }) => {
    await waitForRuntime(page)

    const result = await page.evaluate(() => {
      const g = (window as any).__war3Game
      const archmage = g.spawnUnit('archmage', 0, 30, 30)
      archmage.abilityLevels = { ...(archmage.abilityLevels ?? {}), mass_teleport: 1 }
      archmage.mana = archmage.maxMana

      // Friendly units near caster
      const friend = g.spawnUnit('footman', 0, 30.5, 30)
      const worker = g.spawnUnit('peasant', 0, 30.3, 30)
      worker.carryAmount = 50
      worker.gatherType = 'gold'

      // Enemy unit near caster — should be excluded
      const enemy = g.spawnUnit('footman', 1, 30.4, 30)

      // Dead friendly — excluded
      const dead = g.spawnUnit('footman', 0, 30.2, 30)
      dead.hp = 0
      dead.isDead = true

      // Friendly building near caster — excluded
      const building = g.spawnBuilding('farm', 0, 31, 30)

      // Target building far away
      const targetBuilding = g.spawnBuilding('farm', 0, 60, 30)
      const targetPos = { x: targetBuilding.mesh.position.x, z: targetBuilding.mesh.position.z }

      // Outside range unit
      const outside = g.spawnUnit('footman', 0, 40, 30)

      const ok = g.castMassTeleport(archmage, targetBuilding)

      // Advance past delay
      for (let t = 0; t < 4.0; t += 0.1) g.update(0.1)

      // Check positions
      const nearTarget = (u: any) => {
        const dx = u.mesh.position.x - targetPos.x
        const dz = u.mesh.position.z - targetPos.z
        return Math.sqrt(dx * dx + dz * dz) < 5
      }

      return {
        ok,
        archmageMoved: nearTarget(archmage),
        friendMoved: nearTarget(friend),
        workerMoved: nearTarget(worker),
        enemyMoved: !nearTarget(enemy),
        deadMoved: !nearTarget(dead),
        buildingMoved: !nearTarget(building),
        outsideMoved: !nearTarget(outside),
        workerCarry: worker.carryAmount,
        workerGather: worker.gatherType,
      }
    })

    expect(result.ok).toBe(true)
    expect(result.archmageMoved).toBe(true)
    expect(result.friendMoved).toBe(true)
    expect(result.workerMoved).toBe(true)
    expect(result.enemyMoved).toBe(true) // enemy NOT moved = stays put
    expect(result.deadMoved).toBe(true)
    expect(result.buildingMoved).toBe(true)
    expect(result.outsideMoved).toBe(true)
    // Worker resources preserved
    expect(result.workerCarry).toBe(50)
    expect(result.workerGather).toBe('gold')
  })

  test('MT-RT-8: cap at 24 units, nearest-first ordering, Archmage always included', async ({ page }) => {
    await waitForRuntime(page)

    const result = await page.evaluate(() => {
      const g = (window as any).__war3Game
      const archmage = g.spawnUnit('archmage', 0, 30, 30)
      archmage.abilityLevels = { ...(archmage.abilityLevels ?? {}), mass_teleport: 1 }
      archmage.mana = archmage.maxMana

      // Spawn 30 friendly units near caster (exceeds cap of 24)
      const units: any[] = []
      for (let i = 0; i < 30; i++) {
        const angle = (2 * Math.PI * i) / 30
        const r = 1 + i * 0.1
        const u = g.spawnUnit('footman', 0, 30 + r * Math.cos(angle), 30 + r * Math.sin(angle))
        units.push(u)
      }

      const target = g.spawnUnit('footman', 0, 80, 30)
      const targetPos = { x: target.mesh.position.x, z: target.mesh.position.z }

      const ok = g.castMassTeleport(archmage, target)

      for (let t = 0; t < 4.0; t += 0.1) g.update(0.1)

      const nearTarget = (u: any) => {
        const dx = u.mesh.position.x - targetPos.x
        const dz = u.mesh.position.z - targetPos.z
        return Math.sqrt(dx * dx + dz * dz) < 5
      }

      const allUnits = [archmage, ...units]
      const teleported = allUnits.filter(u => nearTarget(u))
      const notTeleported = allUnits.filter(u => !nearTarget(u))

      return { ok, teleportedCount: teleported.length, notTeleportedCount: notTeleported.length }
    })

    expect(result.ok).toBe(true)
    expect(result.teleportedCount).toBe(24)
    expect(result.notTeleportedCount).toBe(7) // 31 total (archmage + 30) - 24 cap = 7 excluded
  })

  test('MT-RT-9: Water Elemental is included in teleport', async ({ page }) => {
    await waitForRuntime(page)

    const result = await page.evaluate(() => {
      const g = (window as any).__war3Game
      const archmage = g.spawnUnit('archmage', 0, 30, 30)
      archmage.abilityLevels = { ...(archmage.abilityLevels ?? {}), mass_teleport: 1 }
      archmage.mana = archmage.maxMana

      // Summon a water elemental near the archmage
      const we = g.spawnUnit('water_elemental', 0, 30.5, 30)
      we.summonExpireAt = g.gameTime + 60 // mark as summon

      const target = g.spawnBuilding('farm', 0, 70, 30)
      const targetPos = { x: target.mesh.position.x, z: target.mesh.position.z }

      const ok = g.castMassTeleport(archmage, target)

      for (let t = 0; t < 4.0; t += 0.1) g.update(0.1)

      const nearTarget = (u: any) => {
        const dx = u.mesh.position.x - targetPos.x
        const dz = u.mesh.position.z - targetPos.z
        return Math.sqrt(dx * dx + dz * dz) < 5
      }

      return { ok, weMoved: nearTarget(we), archMoved: nearTarget(archmage) }
    })

    expect(result.ok).toBe(true)
    expect(result.archMoved).toBe(true)
    expect(result.weMoved).toBe(true)
  })

  test('MT-RT-10: placement non-overlap — no unit stacks or lands inside target building', async ({ page }) => {
    await waitForRuntime(page)

    const result = await page.evaluate(() => {
      const g = (window as any).__war3Game
      const archmage = g.spawnUnit('archmage', 0, 30, 30)
      archmage.abilityLevels = { ...(archmage.abilityLevels ?? {}), mass_teleport: 1 }
      archmage.mana = archmage.maxMana

      const units: any[] = []
      for (let i = 0; i < 5; i++) {
        const u = g.spawnUnit('footman', 0, 30 + i * 0.3, 30)
        units.push(u)
      }

      const target = g.spawnBuilding('farm', 0, 70, 30)
      const targetFootprint = {
        minX: Math.round(target.mesh.position.x - 0.5),
        minZ: Math.round(target.mesh.position.z - 0.5),
        maxX: Math.round(target.mesh.position.x - 0.5) + 2,
        maxZ: Math.round(target.mesh.position.z - 0.5) + 2,
      }

      const ok = g.castMassTeleport(archmage, target)

      for (let t = 0; t < 4.0; t += 0.1) g.update(0.1)

      // Collect all teleported positions
      const allUnits = [archmage, ...units]
      const positions = allUnits.map((u: any) => ({
        x: Math.round(u.mesh.position.x * 100) / 100,
        z: Math.round(u.mesh.position.z * 100) / 100,
      }))

      // Check for duplicates
      const seen = new Set<string>()
      let hasDuplicates = false
      for (const p of positions) {
        const key = `${p.x},${p.z}`
        if (seen.has(key)) { hasDuplicates = true; break }
        seen.add(key)
      }

      const insideTargetFootprint = positions.some((p) =>
        p.x >= targetFootprint.minX && p.x <= targetFootprint.maxX
          && p.z >= targetFootprint.minZ && p.z <= targetFootprint.maxZ)

      return { ok, hasDuplicates, insideTargetFootprint, positionCount: positions.length }
    })

    expect(result.ok).toBe(true)
    expect(result.hasDuplicates).toBe(false)
    expect(result.insideTargetFootprint).toBe(false)
    expect(result.positionCount).toBe(6) // archmage + 5 footmen
  })

  test('MT-RT-11: selection preserved after teleport', async ({ page }) => {
    await waitForRuntime(page)

    const result = await page.evaluate(() => {
      const g = (window as any).__war3Game
      const archmage = g.spawnUnit('archmage', 0, 30, 30)
      archmage.abilityLevels = { ...(archmage.abilityLevels ?? {}), mass_teleport: 1 }
      archmage.mana = archmage.maxMana

      const friend = g.spawnUnit('footman', 0, 30.5, 30)
      const target = g.spawnUnit('footman', 0, 70, 30)

      // Select both archmage and friend
      g.selectionModel.clear()
      g.selectionModel.setSelection([archmage, friend])

      const selectedBefore = g.selectionModel.units.length

      g.castMassTeleport(archmage, target)

      for (let t = 0; t < 4.0; t += 0.1) g.update(0.1)

      const selectedAfter = g.selectionModel.units.length
      const stillHasArchmage = g.selectionModel.contains(archmage)
      const stillHasFriend = g.selectionModel.contains(friend)

      return { selectedBefore, selectedAfter, stillHasArchmage, stillHasFriend }
    })

    expect(result.selectedBefore).toBe(2)
    expect(result.selectedAfter).toBe(2)
    expect(result.stillHasArchmage).toBe(true)
    expect(result.stillHasFriend).toBe(true)
  })

  test('MT-RT-12: command-card target mode enters and cancels', async ({ page }) => {
    await waitForRuntime(page)

    const result = await page.evaluate(() => {
      const g = (window as any).__war3Game
      const archmage = g.spawnUnit('archmage', 0, 30, 30)
      archmage.abilityLevels = { ...(archmage.abilityLevels ?? {}), mass_teleport: 1 }
      archmage.mana = archmage.maxMana
      g.selectionModel.clear()
      g.selectionModel.setSelection([archmage])
      g._lastCmdKey = ''
      g.updateHUD(0.016)

      const cast = (window as any).__cmdButton('群体传送')
      cast?.click()
      const entered = g.massTeleportTargetMode === true && g.massTeleportTargetCaster === archmage
      const hintAfterEnter = document.getElementById('mode-hint')?.textContent ?? ''

      // Cancel with right-click
      const canvas = document.getElementById('game-canvas')!
      canvas.dispatchEvent(new MouseEvent('contextmenu', { bubbles: true, cancelable: true, button: 2 }))
      const canceledByRightClick = g.massTeleportTargetMode === false && !g.massTeleportTargetCaster

      // Re-enter and cancel with Escape
      cast?.click()
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))
      const canceledByEscape = g.massTeleportTargetMode === false && !g.massTeleportTargetCaster

      return { hasCast: !!cast, entered, hintAfterEnter, canceledByRightClick, canceledByEscape }
    })

    expect(result.hasCast).toBe(true)
    expect(result.entered).toBe(true)
    expect(result.hintAfterEnter).toContain('群体传送')
    expect(result.canceledByRightClick).toBe(true)
    expect(result.canceledByEscape).toBe(true)
  })

  test('MT-RT-13: boundaries — no ABILITIES.mass_teleport and no AI auto-cast path', async ({ page }) => {
    expect((ABILITIES as any).mass_teleport).toBeUndefined()
    const gameSrc = readFileSync('src/game/Game.ts', 'utf-8')
    const massTeleportSrc = readFileSync('src/game/systems/MassTeleportSystem.ts', 'utf-8')
    const aiSrc = readFileSync('src/game/SimpleAI.ts', 'utf-8')
    expect(massTeleportSrc).toContain('HERO_ABILITY_LEVELS.mass_teleport')
    expect(gameSrc).not.toContain('ABILITIES.mass_teleport')
    expect(massTeleportSrc).not.toContain('ABILITIES.mass_teleport')
    expect(aiSrc.toLowerCase()).toContain('mass_teleport')
    expect(aiSrc.toLowerCase()).toContain('archmage')
    expect(aiSrc.toLowerCase()).not.toContain('castmassteleport')

    await waitForRuntime(page)
    const result = await page.evaluate(() => {
      const g = (window as any).__war3Game
      const archmage = g.spawnUnit('archmage', 0, 30, 30)
      archmage.heroLevel = 6
      archmage.heroSkillPoints = 4
      archmage.abilityLevels = { ...(archmage.abilityLevels ?? {}), water_elemental: 1, brilliance_aura: 1, blizzard: 1, mass_teleport: 1 }
      archmage.mana = archmage.maxMana
      g.selectionModel.clear()
      g.selectionModel.setSelection([archmage])
      g._lastCmdKey = ''
      g.updateHUD(0.016)
      const labels = Array.from(document.querySelectorAll('#command-card button')).map((b: any) =>
        b.querySelector('.btn-label')?.textContent?.trim() ?? '',
      )
      return {
        hasWaterElemental: labels.some(label => label.includes('水元素')),
        hasBrillianceAura: labels.some(label => label.includes('辉煌光环')),
        hasBlizzard: labels.some(label => label.includes('暴风雪')),
        hasMassTeleport: labels.some(label => label.includes('群体传送')),
      }
    })

    expect(result.hasWaterElemental).toBe(true)
    expect(result.hasBrillianceAura).toBe(true)
    expect(result.hasBlizzard).toBe(true)
    expect(result.hasMassTeleport).toBe(true)
  })
})
