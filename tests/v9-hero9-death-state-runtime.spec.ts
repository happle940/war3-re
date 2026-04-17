/**
 * V9 HERO9-IMPL1 Hero death-state runtime proof.
 *
 * Proves:
 * 1. Dead Paladin stays in units with isDead=true, hp=0.
 * 2. Dead Paladin stops actions, movement, attack.
 * 3. Other units clear attack targets pointing at dead Paladin.
 * 4. Dead Paladin is not auto-acquired as target.
 * 5. Dead Paladin blocks new summon from Altar command card.
 * 6. Direct trainUnit cannot bypass dead-hero uniqueness guard.
 * 7. Dead Paladin cannot cast Holy Light.
 * 8. Normal unit death cleanup still removes non-hero units.
 */
import { test, expect, type Page } from '@playwright/test'
import { UNITS } from '../src/game/GameData'

const BASE_RUNTIME = 'http://127.0.0.1:4173/?runtimeTest=1'
const PALADIN_TRAIN_TIME = UNITS.paladin.trainTime

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
async function summonPaladin(page: Page): Promise<boolean> {
  return page.evaluate(({ trainTime }) => {
    const g = (window as any).__war3Game
    g.resources.earn(0, 10000, 10000)
    g.spawnBuilding('altar_of_kings', 0, 15, 15)
    const altar = g.units.find((u: any) => u.team === 0 && u.type === 'altar_of_kings' && u.isBuilding)
    if (!altar) return false

    g.selectionModel.clear()
    g.selectionModel.setSelection([altar])
    g._lastCmdKey = ''
    g.updateHUD(0.016)
    const btn = Array.from(document.querySelectorAll('#command-card button')).find((b: any) =>
      b.querySelector('.btn-label')?.textContent?.trim() === '圣骑士',
    ) as HTMLButtonElement | undefined
    if (btn) btn.click()

    const dt = 0.5
    for (let i = 0; i < Math.ceil(trainTime / dt) + 10; i++) { g.gameTime += dt; g.updateUnits(dt) }

    return !!g.units.find((u: any) => u.type === 'paladin' && !u.isBuilding && u.team === 0)
  }, { trainTime: PALADIN_TRAIN_TIME })
}

test.describe('V9 HERO9 Hero death-state runtime', () => {
  test.setTimeout(120000)

  test('DEATH-1: dead Paladin stays in units with isDead=true, hp=0', async ({ page }) => {
    await waitForRuntime(page)
    const summoned = await summonPaladin(page)
    expect(summoned).toBe(true)

    const result = await page.evaluate(() => {
      const g = (window as any).__war3Game
      const paladin = g.units.find((u: any) => u.type === 'paladin' && !u.isBuilding && u.team === 0)
      if (!paladin) return { found: false }

      const unitsBefore = g.units.length
      paladin.hp = -5

      const dt = 0.5
      for (let i = 0; i < 10; i++) { g.gameTime += dt; g.update(dt) }

      // Read fresh state
      const paladinAfter = g.units.find((u: any) => u === paladin)
      const unitsAfter = g.units.length

      return {
        found: true,
        stillInUnits: !!paladinAfter,
        isDead: paladinAfter?.isDead ?? null,
        hp: paladinAfter?.hp ?? null,
        unitsCountChanged: unitsAfter - unitsBefore,
      }
    })

    expect(result.found).toBe(true)
    expect(result.stillInUnits).toBe(true)
    expect(result.isDead).toBe(true)
    expect(result.hp).toBe(0)
    expect(result.unitsCountChanged).toBe(0)
  })

  test('DEATH-2: dead Paladin stops actions and movement', async ({ page }) => {
    await waitForRuntime(page)
    const summoned = await summonPaladin(page)
    expect(summoned).toBe(true)

    const result = await page.evaluate(() => {
      const g = (window as any).__war3Game
      const paladin = g.units.find((u: any) => u.type === 'paladin' && !u.isBuilding && u.team === 0)
      if (!paladin) return { found: false }

      // Set paladin to attack state
      const enemy = g.spawnUnit('footman', 1, paladin.mesh.position.x + 2, paladin.mesh.position.z)
      paladin.attackTarget = enemy
      paladin.moveTarget = { x: 20, z: 20 }
      paladin.gatherType = 'gold'
      paladin.resourceTarget = { type: 'goldmine', mine: g.units.find((u: any) => u.type === 'goldmine') }
      paladin.waypoints = [{ x: 21, y: 0, z: 21 }]
      paladin.moveQueue = [{ type: 'move', target: { x: 22, y: 0, z: 22 } }]
      paladin.attackMoveTarget = { x: 23, y: 0, z: 23 }

      paladin.hp = 0
      const dt = 0.5
      for (let i = 0; i < 10; i++) { g.gameTime += dt; g.update(dt) }

      const p = g.units.find((u: any) => u === paladin)

      return {
        found: true,
        attackTargetCleared: p?.attackTarget === null,
        moveTargetCleared: p?.moveTarget === null,
        gatherType: p?.gatherType ?? null,
        resourceTargetCleared: p?.resourceTarget === null,
        waypointsLength: p?.waypoints?.length ?? -1,
        moveQueueLength: p?.moveQueue?.length ?? -1,
        attackMoveTargetCleared: p?.attackMoveTarget === null,
        state: p?.state,
      }
    })

    expect(result.found).toBe(true)
    expect(result.attackTargetCleared).toBe(true)
    expect(result.moveTargetCleared).toBe(true)
    expect(result.gatherType).toBeNull()
    expect(result.resourceTargetCleared).toBe(true)
    expect(result.waypointsLength).toBe(0)
    expect(result.moveQueueLength).toBe(0)
    expect(result.attackMoveTargetCleared).toBe(true)
    expect(result.state).toBe(0)
  })

  test('DEATH-3: other units clear attack targets pointing at dead Paladin', async ({ page }) => {
    await waitForRuntime(page)
    const summoned = await summonPaladin(page)
    expect(summoned).toBe(true)

    const result = await page.evaluate(() => {
      const g = (window as any).__war3Game
      const paladin = g.units.find((u: any) => u.type === 'paladin' && !u.isBuilding && u.team === 0)
      if (!paladin) return { found: false }

      // Create enemy footman targeting paladin
      const enemy = g.spawnUnit('footman', 1, paladin.mesh.position.x + 2, paladin.mesh.position.z)
      enemy.attackTarget = paladin

      paladin.hp = 0
      const dt = 0.5
      for (let i = 0; i < 10; i++) { g.gameTime += dt; g.update(dt) }

      const enemyAfter = g.units.find((u: any) => u === enemy)

      return {
        found: true,
        enemyClearedTarget: enemyAfter?.attackTarget !== paladin,
      }
    })

    expect(result.found).toBe(true)
    expect(result.enemyClearedTarget).toBe(true)
  })

  test('DEATH-4: dead Paladin is not auto-acquired as attack target', async ({ page }) => {
    await waitForRuntime(page)
    const summoned = await summonPaladin(page)
    expect(summoned).toBe(true)

    const result = await page.evaluate(() => {
      const g = (window as any).__war3Game
      const paladin = g.units.find((u: any) => u.type === 'paladin' && !u.isBuilding && u.team === 0)
      if (!paladin) return { found: false }

      paladin.hp = 0
      const dt = 0.5
      for (let i = 0; i < 10; i++) { g.gameTime += dt; g.update(dt) }

      // Create idle enemy footman near dead paladin
      const p = g.units.find((u: any) => u === paladin)
      const enemy = g.spawnUnit('footman', 1, p.mesh.position.x + 1, p.mesh.position.z)
      enemy.state = 0 // Idle

      // Run aggro check
      g.gameTime += dt
      g.update(dt)

      return {
        found: true,
        targetedDeadPaladin: enemy.attackTarget === paladin,
      }
    })

    expect(result.found).toBe(true)
    expect(result.targetedDeadPaladin).toBe(false)
  })

  test('DEATH-5: dead Paladin blocks new summon from Altar command card', async ({ page }) => {
    await waitForRuntime(page)
    const summoned = await summonPaladin(page)
    expect(summoned).toBe(true)

    const result = await page.evaluate(() => {
      const g = (window as any).__war3Game
      const paladin = g.units.find((u: any) => u.type === 'paladin' && !u.isBuilding && u.team === 0)
      if (!paladin) return { found: false }

      paladin.hp = 0
      const dt = 0.5
      for (let i = 0; i < 10; i++) { g.gameTime += dt; g.update(dt) }

      const altar = g.units.find((u: any) => u.team === 0 && u.type === 'altar_of_kings' && u.isBuilding)
      if (!altar) return { found: true, noAltar: true }

      g.resources.earn(0, 10000, 10000)
      g.selectionModel.clear()
      g.selectionModel.setSelection([altar])
      g._lastCmdKey = ''
      g.updateHUD(0.016)

      const btn = Array.from(document.querySelectorAll('#command-card button')).find((b: any) =>
        b.querySelector('.btn-label')?.textContent?.trim() === '圣骑士',
      ) as HTMLButtonElement | undefined

      return {
        found: true,
        noAltar: false,
        hasButton: !!btn,
        disabled: btn?.disabled ?? null,
        reason: btn?.dataset.disabledReason ?? '',
      }
    })

    expect(result.found).toBe(true)
    expect(result.noAltar).toBeFalsy()
    expect(result.hasButton).toBe(true)
    expect(result.disabled).toBe(true)
    expect(result.reason).toMatch(/圣骑士.*阵亡|圣骑士.*存活/)
  })

  test('DEATH-6: direct trainUnit cannot bypass dead-hero uniqueness guard', async ({ page }) => {
    await waitForRuntime(page)
    const summoned = await summonPaladin(page)
    expect(summoned).toBe(true)

    const result = await page.evaluate(() => {
      const g = (window as any).__war3Game
      const paladin = g.units.find((u: any) => u.type === 'paladin' && !u.isBuilding && u.team === 0)
      if (!paladin) return { found: false }

      paladin.hp = 0
      const dt = 0.5
      for (let i = 0; i < 10; i++) { g.gameTime += dt; g.update(dt) }

      const altar = g.units.find((u: any) => u.team === 0 && u.type === 'altar_of_kings' && u.isBuilding)
      if (!altar) return { found: true, noAltar: true }

      g.resources.earn(0, 10000, 10000)
      const goldBefore = g.resources.get(0).gold
      const paladinCountBefore = g.units.filter((u: any) => u.type === 'paladin').length

      g.trainUnit(altar, 'paladin')

      const goldAfter = g.resources.get(0).gold
      const paladinCountAfter = g.units.filter((u: any) => u.type === 'paladin').length
      const queueLength = altar.trainingQueue.length

      return {
        found: true,
        noAltar: false,
        goldSpent: goldBefore - goldAfter,
        paladinCountBefore,
        paladinCountAfter,
        queueLength,
      }
    })

    expect(result.found).toBe(true)
    expect(result.goldSpent).toBe(0)
    expect(result.paladinCountAfter).toBe(result.paladinCountBefore)
    expect(result.queueLength).toBe(0)
  })

  test('DEATH-7: dead Paladin cannot cast Holy Light', async ({ page }) => {
    await waitForRuntime(page)
    const summoned = await summonPaladin(page)
    expect(summoned).toBe(true)

    const result = await page.evaluate(() => {
      const g = (window as any).__war3Game
      const paladin = g.units.find((u: any) => u.type === 'paladin' && !u.isBuilding && u.team === 0)
      if (!paladin) return { found: false }

      // Create injured footman
      const footman = g.spawnUnit('footman', 0, paladin.mesh.position.x + 1, paladin.mesh.position.z)
      footman.hp = 50

      const manaBefore = paladin.mana

      // Kill paladin
      paladin.hp = 0
      const dt = 0.5
      for (let i = 0; i < 10; i++) { g.gameTime += dt; g.update(dt) }

      // Try to cast
      const castResult = g.castHolyLight(paladin, footman)

      const pAfter = g.units.find((u: any) => u === paladin)
      const fAfter = g.units.find((u: any) => u === footman)

      return {
        found: true,
        castResult,
        manaSpent: manaBefore - (pAfter?.mana ?? manaBefore),
        footmanHpAfter: fAfter?.hp ?? 50,
      }
    })

    expect(result.found).toBe(true)
    expect(result.castResult).toBe(false)
    expect(result.manaSpent).toBe(0)
    expect(result.footmanHpAfter).toBe(50)
  })

  test('DEATH-8: normal unit death cleanup still removes non-hero units', async ({ page }) => {
    await waitForRuntime(page)

    const result = await page.evaluate(() => {
      const g = (window as any).__war3Game
      const footman = g.spawnUnit('footman', 0, 25, 25)
      const unitsBefore = g.units.length

      footman.hp = 0
      const dt = 0.5
      for (let i = 0; i < 10; i++) { g.gameTime += dt; g.update(dt) }

      const unitsAfter = g.units.length
      const footmanExists = g.units.includes(footman)

      return {
        unitsBefore,
        unitsAfter,
        footmanExists,
        unitRemoved: !footmanExists,
      }
    })

    expect(result.unitRemoved).toBe(true)
    expect(result.unitsAfter).toBe(result.unitsBefore - 1)
  })
})
