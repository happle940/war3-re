/**
 * R7/R14 selection HUD inventory and command-state runtime proof.
 *
 * Selection HUD item slots and command-card disabled/cooldown/completed/passive
 * states must be visible runtime surfaces, not hidden text-only metadata.
 */
import { test, expect, type Page } from '@playwright/test'

const BASE_RUNTIME = 'http://127.0.0.1:4173/?runtimeTest=1'

async function waitForRuntime(page: Page) {
  const consoleErrors: string[] = []
  ;(page as any).__consoleErrors = consoleErrors
  page.on('console', (msg) => {
    if (msg.type() === 'error') consoleErrors.push(msg.text())
  })

  await page.goto(BASE_RUNTIME, { waitUntil: 'domcontentloaded' })
  await page.waitForFunction(() => {
    const game = (window as any).__war3Game
    if (!game || !game.renderer) return false
    if (!Array.isArray(game.units) || game.units.length === 0) return false
    return game.renderer.domElement.width > 0 && game.renderer.domElement.height > 0
  }, { timeout: 15000 })
  try {
    await page.waitForFunction(() => {
      const status = document.getElementById('map-status')?.textContent ?? ''
      return !status.includes('正在加载')
    }, { timeout: 15000 })
  } catch {
    // Procedural fallback is valid for HUD identity tests.
  }
  await page.evaluate(() => {
    const g = (window as any).__war3Game
    if (g?.ai) {
      if (typeof g.ai.reset === 'function') g.ai.reset()
      g.ai.update = () => {}
    }
  })
  await page.waitForTimeout(250)
}

test.describe('Selection HUD inventory and command states', () => {
  test.setTimeout(120000)

  test('hero inventory renders six stable HUD slots with item icons and states', async ({ page }) => {
    await waitForRuntime(page)

    const result = await page.evaluate(() => {
      const g = (window as any).__war3Game
      const hero = g.spawnUnit('paladin', 0, 24, 24)
      hero.inventoryItems = [
        'healing_potion',
        'mana_potion',
        'boots_of_speed',
        'scroll_of_town_portal',
      ]

      g.selectionModel.clear()
      g.selectionModel.setSelection([hero])
      g._lastCmdKey = ''
      g._lastSelKey = ''
      g.updateHUD(0.016)

      const readSlot = (slot: Element) => {
        const canvas = slot.querySelector('.selection-inventory-icon') as HTMLCanvasElement | null
        const ctx = canvas?.getContext('2d')
        const pixels = ctx && canvas
          ? Array.from(ctx.getImageData(0, 0, canvas.width, canvas.height).data)
          : []
        let litPixels = 0
        for (let i = 0; i < pixels.length; i += 4) {
          if (pixels[i + 3] > 0 && pixels[i] + pixels[i + 1] + pixels[i + 2] > 45) litPixels++
        }
        return {
          slot: (slot as HTMLElement).dataset.slot ?? '',
          state: (slot as HTMLElement).dataset.state ?? '',
          itemKey: (slot as HTMLElement).dataset.itemKey ?? '',
          itemKind: (slot as HTMLElement).dataset.itemKind ?? '',
          title: (slot as HTMLElement).title,
          hotkey: slot.querySelector('.selection-inventory-hotkey')?.textContent ?? '',
          canvasIconKey: canvas?.dataset.iconKey ?? '',
          litPixels,
        }
      }

      const grid = document.querySelector('#unit-stats .selection-inventory-grid') as HTMLElement | null
      const slots = Array.from(document.querySelectorAll('#unit-stats .selection-inventory-slot')).map(readSlot)
      return {
        hasGrid: !!grid,
        itemCount: grid?.dataset.itemCount ?? '',
        slots,
        statsText: document.getElementById('unit-stats')?.textContent ?? '',
      }
    })

    expect(result.hasGrid).toBe(true)
    expect(result.itemCount).toBe('4')
    expect(result.slots).toHaveLength(6)
    expect(result.slots[0]).toMatchObject({
      slot: '1',
      state: 'usable',
      itemKey: 'healing_potion',
      itemKind: 'consumable',
      hotkey: '1',
      canvasIconKey: 'item:healing_potion',
    })
    expect(result.slots[1].canvasIconKey).toBe('item:mana_potion')
    expect(result.slots[2]).toMatchObject({
      state: 'passive',
      itemKey: 'boots_of_speed',
      itemKind: 'passive',
      canvasIconKey: 'item:boots_of_speed',
    })
    expect(result.slots[3].canvasIconKey).toBe('item:scroll_of_town_portal')
    expect(result.slots[4]).toMatchObject({ state: 'empty', itemKey: '', canvasIconKey: '' })
    expect(result.slots[5]).toMatchObject({ state: 'empty', itemKey: '', canvasIconKey: '' })
    for (const slot of result.slots.slice(0, 4)) {
      expect(slot.title).toContain(slot.slot)
      expect(slot.litPixels).toBeGreaterThan(20)
    }
    expect(result.statsText).toContain('物品 治疗药水、魔法药水、速度之靴、回城卷轴')
  })

  test('command card exposes blocked, cooldown, completed, and passive visual states', async ({ page }) => {
    await waitForRuntime(page)

    const result = await page.evaluate(() => {
      const g = (window as any).__war3Game
      g.resources.earn(0, 7000, 7000)

      const readButton = (label: string) => {
        const btn = Array.from(document.querySelectorAll('#command-card button')).find((button: any) =>
          button.querySelector('.btn-label')?.textContent?.trim() === label,
        ) as HTMLButtonElement | undefined
        return {
          exists: !!btn,
          label,
          commandState: btn?.dataset.commandState ?? '',
          disabledReason: btn?.dataset.disabledReason ?? '',
          badge: btn?.querySelector('.btn-state-badge')?.textContent ?? '',
          hasBadge: !!btn?.querySelector('.btn-state-badge'),
          iconKey: btn?.dataset.iconKey ?? '',
        }
      }

      const worker = g.units.find((u: any) => u.team === 0 && u.type === 'worker' && !u.isBuilding && u.hp > 0)
      g.selectionModel.clear()
      g.selectionModel.setSelection([worker])
      g._lastCmdKey = ''
      g._lastSelKey = ''
      g.updateHUD(0.016)
      const blocked = readButton('车间')

      const paladin = g.spawnUnit('paladin', 0, 24, 24)
      paladin.abilityLevels = {
        ...(paladin.abilityLevels ?? {}),
        holy_light: 1,
      }
      paladin.mana = paladin.maxMana
      paladin.healCooldownUntil = g.gameTime + 12
      paladin.inventoryItems = ['boots_of_speed']
      g.selectionModel.clear()
      g.selectionModel.setSelection([paladin])
      g._lastCmdKey = ''
      g._lastSelKey = ''
      g.updateHUD(0.016)
      const cooldown = readButton('圣光术 (Lv1)')
      const passive = readButton('速度之靴')

      const blacksmith = g.spawnBuilding('blacksmith', 0, 28, 28)
      blacksmith.completedResearches.push('long_rifles')
      g.selectionModel.clear()
      g.selectionModel.setSelection([blacksmith])
      g._lastCmdKey = ''
      g._lastSelKey = ''
      g.updateHUD(0.016)
      const complete = readButton('长管步枪 ✓')

      return { blocked, cooldown, passive, complete }
    })

    expect(result.blocked).toMatchObject({
      exists: true,
      commandState: 'blocked',
      badge: '锁',
      hasBadge: true,
      iconKey: 'building:workshop',
    })
    expect(result.blocked.disabledReason).toContain('主城')
    expect(result.cooldown).toMatchObject({
      exists: true,
      commandState: 'cooldown',
      badge: '冷',
      hasBadge: true,
      iconKey: 'ability:holy_light',
    })
    expect(result.cooldown.disabledReason).toContain('冷却')
    expect(result.passive).toMatchObject({
      exists: true,
      commandState: 'passive',
      badge: '被',
      hasBadge: true,
      iconKey: 'item:boots_of_speed',
    })
    expect(result.complete).toMatchObject({
      exists: true,
      commandState: 'complete',
      badge: '✓',
      hasBadge: true,
      iconKey: 'research:long_rifles',
    })
  })
})
