/**
 * V9 HN4-IMPL3 Back to Work Runtime Proof
 *
 * Proves:
 * 1. ABILITIES.back_to_work exists with ownerType militia, morphTarget worker
 * 2. Selecting Militia shows "返回工作" button, no Defend
 * 3. Clicking "返回工作" immediately reverts to Worker with UNITS.worker stats
 * 4. Auto-expiration revert still works
 * 5. Worker "紧急动员" and existing abilities unaffected
 * 6. No Defend implementation exists
 */
import { test, expect, type Page } from '@playwright/test'
import { readFileSync } from 'node:fs'
import { ABILITIES, UNITS } from '../src/game/GameData'

const BASE = 'http://127.0.0.1:4173/?runtimeTest=1'
const gameSource = readFileSync(new URL('../src/game/Game.ts', import.meta.url), 'utf8')

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
    // Procedural fallback
  }
  await page.waitForTimeout(300)
}

test.describe('V9 HN4-IMPL3 Back to Work Runtime', () => {
  test.setTimeout(120000)
  test.beforeEach(async ({ page }) => {
    await waitForGame(page)
  })

  test('proof-1: source reads Back to Work data and keeps Militia separate from Defend', () => {
    expect(gameSource).toContain('ABILITIES.call_to_arms')
    expect(gameSource).toContain('ABILITIES.back_to_work')
    expect(gameSource).toContain('btw.morphTarget')
    expect(gameSource).toContain('backToWork')
    expect(gameSource).toContain('ABILITIES.defend')
    expect(gameSource).toContain('defendActive')
  })

  test('proof-2: Militia shows 返回工作 button, no Defend', async ({ page }) => {
    const result = await page.evaluate(() => {
      const g = (window as any).__war3Game
      if (!g) throw new Error('no game')

      const hall = g.units.find((u: any) => u.type === 'townhall' && u.team === 0 && u.hp > 0)
      if (!hall) throw new Error('no townhall')

      const worker = g.spawnUnit('worker', 0, hall.mesh.position.x + 1, hall.mesh.position.z + 1)
      g.morphToMilitia(worker)

      g.selectionModel.setSelection([worker])
      g._lastCmdKey = ''
      g.updateCommandCard()

      const cmdCard = document.getElementById('command-card')!
      const allText = cmdCard.textContent ?? ''
      const hasBackToWork = allText.includes('返回工作')
      const hasDefend = allText.includes('防御姿态') || allText.includes('Defend')

      // Cleanup
      worker.hp = 0
      g.handleDeadUnits()

      return { hasBackToWork, hasDefend }
    })

    expect(result.hasBackToWork).toBe(true)
    expect(result.hasDefend).toBe(false)
  })

  test('proof-3: clicking 返回工作 reverts Militia to Worker immediately', async ({ page }) => {
    const result = await page.evaluate(() => {
      const g = (window as any).__war3Game
      if (!g) throw new Error('no game')

      const hall = g.units.find((u: any) => u.type === 'townhall' && u.team === 0 && u.hp > 0)
      if (!hall) throw new Error('no townhall')

      const worker = g.spawnUnit('worker', 0, hall.mesh.position.x + 1, hall.mesh.position.z + 1)
      g.morphToMilitia(worker)

      // Confirm it's militia
      const asMilitia = g.units.find((u: any) => u === worker)
      const militiaType = asMilitia?.type
      const hadExpiry = asMilitia?.morphExpiresAt > 0

      g.selectionModel.setSelection([worker])
      g._lastCmdKey = ''
      g.updateCommandCard()
      const btn = Array.from(document.querySelectorAll('#command-card button'))
        .find((b: any) => b.textContent?.includes('返回工作')) as HTMLButtonElement | undefined
      const clickedButton = !!btn && !btn.disabled
      btn?.click()

      // Read fresh state
      const fresh = g.units.find((u: any) => u === worker && u.hp > 0)

      // Cleanup
      worker.hp = 0
      g.handleDeadUnits()

      return {
        militiaType,
        hadExpiry,
        revertedType: fresh?.type,
        revertedArmor: fresh?.armor,
        revertedAttack: fresh?.attackDamage,
        revertedSpeed: fresh?.speed,
        morphExpiresAt: fresh?.morphExpiresAt,
        morphOriginalType: fresh?.morphOriginalType,
        clickedButton,
      }
    })

    expect(result.militiaType).toBe('militia')
    expect(result.hadExpiry).toBe(true)
    expect(result.clickedButton).toBe(true)
    expect(result.revertedType).toBe('worker')
    expect(result.revertedArmor).toBe(UNITS.worker.armor)
    expect(result.revertedAttack).toBe(UNITS.worker.attackDamage)
    expect(result.revertedSpeed).toBe(UNITS.worker.speed)
    expect(result.morphExpiresAt).toBe(0)
    expect(result.morphOriginalType).toBeNull()
  })

  test('proof-4: auto-expiration revert still works', async ({ page }) => {
    const result = await page.evaluate(() => {
      const g = (window as any).__war3Game
      if (!g) throw new Error('no game')

      const hall = g.units.find((u: any) => u.type === 'townhall' && u.team === 0 && u.hp > 0)
      if (!hall) throw new Error('no townhall')

      const worker = g.spawnUnit('worker', 0, hall.mesh.position.x + 1, hall.mesh.position.z + 1)
      g.morphToMilitia(worker)

      const expiresAt = g.units.find((u: any) => u === worker)?.morphExpiresAt ?? 0
      g.gameTime = expiresAt + 1
      g.updateUnits(0.016)

      const fresh = g.units.find((u: any) => u === worker && u.hp > 0)

      // Cleanup
      worker.hp = 0
      g.handleDeadUnits()

      return { type: fresh?.type, attack: fresh?.attackDamage }
    })

    expect(result.type).toBe('worker')
    expect(result.attack).toBe(UNITS.worker.attackDamage)
  })

  test('proof-5: Worker 紧急动员 and existing abilities unaffected', async ({ page }) => {
    const result = await page.evaluate(() => {
      const g = (window as any).__war3Game
      if (!g) throw new Error('no game')

      // Worker near hall sees 紧急动员
      const hall = g.units.find((u: any) => u.type === 'townhall' && u.team === 0 && u.hp > 0)
      if (!hall) throw new Error('no townhall')

      const worker = g.spawnUnit('worker', 0, hall.mesh.position.x + 1, hall.mesh.position.z + 1)
      g.selectionModel.setSelection([worker])
      g._lastCmdKey = ''
      g.updateCommandCard()

      const cmdCard = document.getElementById('command-card')!
      const hasCTA = Array.from(cmdCard.querySelectorAll('button'))
        .some((b: any) => b.textContent?.includes('紧急动员'))

      // Rally Call still works
      const footman = g.spawnUnit('footman', 0, 50, 50)
      const buddy = g.spawnUnit('footman', 0, 50.5, 50)
      const rallyOk = g.triggerRallyCall(footman)

      // Cleanup
      worker.hp = 0; footman.hp = 0; buddy.hp = 0
      g.handleDeadUnits()

      return { hasCTA, rallyOk }
    })

    expect(result.hasCTA).toBe(true)
    expect(result.rallyOk).toBe(true)
  })

  test('proof-6: ABILITIES.back_to_work seed has correct fields', () => {
    const btw = ABILITIES.back_to_work
    expect(btw).toBeDefined()
    expect(btw.ownerType).toBe('militia')
    expect(btw.morphTarget).toBe('worker')
    expect(btw.effectType).toBe('morph')
    expect(btw.duration).toBe(0)
    expect(btw.cooldown).toBe(0)
  })
})
