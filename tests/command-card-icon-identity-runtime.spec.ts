/**
 * R7/R14 command-card icon identity runtime proof.
 *
 * The command card must expose stable visual identity for War3-like actions:
 * build, train, research, shop, inventory items, hero abilities, and base
 * unit commands. This proves the runtime buttons carry icon keys and render
 * non-empty icon canvases instead of remaining text-only controls.
 */
import { test, expect, type Page } from '@playwright/test'

const BASE_RUNTIME = 'http://127.0.0.1:4173/?runtimeTest=1'

async function waitForRuntime(page: Page) {
  const consoleErrors: string[] = []
  const pageErrors: string[] = []
  ;(page as any).__consoleErrors = consoleErrors
  ;(page as any).__pageErrors = pageErrors
  page.on('console', (msg) => {
    if (msg.type() === 'error') consoleErrors.push(msg.text())
  })
  page.on('pageerror', err => pageErrors.push(err.message))

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
    // Procedural fallback is valid for command-card identity tests.
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

test.describe('Command-card icon identity', () => {
  test.setTimeout(120000)

  test('worker build and base unit commands expose stable icon keys and pixels', async ({ page }) => {
    await waitForRuntime(page)

    const result = await page.evaluate(() => {
      const g = (window as any).__war3Game
      g.resources.earn(0, 5000, 5000)

      const readButton = (label: string) => {
        const btn = Array.from(document.querySelectorAll('#command-card button')).find((button: any) =>
          button.querySelector('.btn-label')?.textContent?.trim() === label,
        ) as HTMLButtonElement | undefined
        const canvas = btn?.querySelector('.btn-icon-canvas') as HTMLCanvasElement | undefined
        const ctx = canvas?.getContext('2d')
        const pixels = ctx && canvas
          ? Array.from(ctx.getImageData(0, 0, canvas.width, canvas.height).data)
          : []
        let litPixels = 0
        for (let i = 0; i < pixels.length; i += 4) {
          if (pixels[i + 3] > 0 && pixels[i] + pixels[i + 1] + pixels[i + 2] > 45) litPixels++
        }
        return {
          exists: !!btn,
          iconKey: btn?.dataset.iconKey ?? '',
          canvasIconKey: canvas?.dataset.iconKey ?? '',
          hasIconNode: !!canvas,
          title: btn?.title ?? '',
          litPixels,
        }
      }

      const worker = g.units.find((u: any) => u.team === 0 && u.type === 'worker' && !u.isBuilding && u.hp > 0)
      g.selectionModel.clear()
      g.selectionModel.setSelection([worker])
      g._lastCmdKey = ''
      g.updateHUD(0.016)
      const workerButtons = {
        farm: readButton('农场'),
        blacksmith: readButton('铁匠铺'),
        workshop: readButton('车间'),
        vault: readButton('奥术宝库'),
        callToArms: readButton('紧急动员'),
      }

      const footman = g.spawnUnit('footman', 0, 26, 26)
      g.selectionModel.clear()
      g.selectionModel.setSelection([footman])
      g._lastCmdKey = ''
      g._lastSelKey = ''
      g.updateHUD(0.016)
      const unitButtons = {
        stop: readButton('停止'),
        hold: readButton('驻守'),
        attackMove: readButton('攻击移动'),
        defend: readButton('防御姿态'),
      }

      return { workerButtons, unitButtons }
    })

    expect(result.workerButtons.farm).toMatchObject({
      exists: true,
      iconKey: 'building:farm',
      canvasIconKey: 'building:farm',
      hasIconNode: true,
    })
    expect(result.workerButtons.blacksmith.iconKey).toBe('building:blacksmith')
    expect(result.workerButtons.workshop.iconKey).toBe('building:workshop')
    expect(result.workerButtons.vault.iconKey).toBe('building:arcane_vault')
    expect(result.workerButtons.callToArms.iconKey).toBe('ability:call_to_arms')
    expect(result.unitButtons.stop.iconKey).toBe('command:stop')
    expect(result.unitButtons.hold.iconKey).toBe('command:hold')
    expect(result.unitButtons.attackMove.iconKey).toBe('command:attack_move')
    expect(result.unitButtons.defend.iconKey).toBe('ability:defend')
    for (const button of [
      ...Object.values(result.workerButtons),
      ...Object.values(result.unitButtons),
    ] as any[]) {
      expect(button.title).toContain('图标：')
      expect(button.litPixels).toBeGreaterThan(20)
    }
  })

  test('buildings render training, upgrade, research, and shop item icon identity', async ({ page }) => {
    await waitForRuntime(page)

    const result = await page.evaluate(() => {
      const g = (window as any).__war3Game
      g.resources.earn(0, 7000, 7000)
      const readButton = (label: string) => {
        const btn = Array.from(document.querySelectorAll('#command-card button')).find((button: any) =>
          button.querySelector('.btn-label')?.textContent?.trim() === label,
        ) as HTMLButtonElement | undefined
        const canvas = btn?.querySelector('.btn-icon-canvas') as HTMLCanvasElement | undefined
        return {
          exists: !!btn,
          iconKey: btn?.dataset.iconKey ?? '',
          canvasIconKey: canvas?.dataset.iconKey ?? '',
          hasIconNode: !!canvas,
        }
      }
      const readForSelection = (selected: any, labels: string[]) => {
        g.selectionModel.clear()
        g.selectionModel.setSelection([selected])
        g._lastCmdKey = ''
        g._lastSelKey = ''
        g.updateHUD(0.016)
        return Object.fromEntries(labels.map(label => [label, readButton(label)]))
      }

      const townhall = g.units.find((u: any) => u.team === 0 && u.type === 'townhall' && u.isBuilding)
      const barracks = g.spawnBuilding('barracks', 0, 28, 28)
      const blacksmith = g.spawnBuilding('blacksmith', 0, 31, 28)
      const vault = g.spawnBuilding('arcane_vault', 0, 34, 28)
      g.spawnUnit('paladin', 0, 34.5, 28.5)

      return {
        townhall: readForSelection(townhall, ['农民', '升级主城', '集结点']),
        barracks: readForSelection(barracks, ['步兵', '步枪兵', '骑士', '集结点']),
        blacksmith: readForSelection(blacksmith, ['长管步枪', '铁剑', '黑火药', '铁甲']),
        vault: readForSelection(vault, ['治疗药水', '魔法药水', '速度之靴', '回城卷轴']),
      }
    })

    expect(result.townhall['农民']).toMatchObject({ exists: true, iconKey: 'unit:worker', hasIconNode: true })
    expect(result.townhall['升级主城'].iconKey).toBe('building:keep')
    expect(result.townhall['集结点'].iconKey).toBe('command:rally_point')
    expect(result.barracks['步兵'].iconKey).toBe('unit:footman')
    expect(result.barracks['步枪兵'].iconKey).toBe('unit:rifleman')
    expect(result.barracks['骑士'].iconKey).toBe('unit:knight')
    expect(result.blacksmith['长管步枪'].iconKey).toBe('research:long_rifles')
    expect(result.blacksmith['铁剑'].iconKey).toBe('research:iron_forged_swords')
    expect(result.blacksmith['黑火药'].iconKey).toBe('research:black_gunpowder')
    expect(result.blacksmith['铁甲'].iconKey).toBe('research:iron_plating')
    expect(result.vault['治疗药水'].iconKey).toBe('item:healing_potion')
    expect(result.vault['魔法药水'].iconKey).toBe('item:mana_potion')
    expect(result.vault['速度之靴'].iconKey).toBe('item:boots_of_speed')
    expect(result.vault['回城卷轴'].iconKey).toBe('item:scroll_of_town_portal')
    for (const group of Object.values(result) as any[]) {
      for (const button of Object.values(group) as any[]) {
        expect(button.exists).toBe(true)
        expect(button.hasIconNode).toBe(true)
        expect(button.canvasIconKey).toBe(button.iconKey)
      }
    }
  })

  test('hero ability and inventory buttons share the icon contract', async ({ page }) => {
    await waitForRuntime(page)

    const result = await page.evaluate(() => {
      const g = (window as any).__war3Game
      const readButton = (label: string) => {
        const btn = Array.from(document.querySelectorAll('#command-card button')).find((button: any) =>
          button.querySelector('.btn-label')?.textContent?.trim() === label,
        ) as HTMLButtonElement | undefined
        const canvas = btn?.querySelector('.btn-icon-canvas') as HTMLCanvasElement | undefined
        return {
          exists: !!btn,
          iconKey: btn?.dataset.iconKey ?? '',
          canvasIconKey: canvas?.dataset.iconKey ?? '',
          hasIconNode: !!canvas,
        }
      }

      const paladin = g.spawnUnit('paladin', 0, 24, 24)
      paladin.heroLevel = 3
      paladin.heroSkillPoints = 3
      paladin.mana = paladin.maxMana
      paladin.inventoryItems = ['healing_potion', 'scroll_of_town_portal']

      g.selectionModel.clear()
      g.selectionModel.setSelection([paladin])
      g._lastCmdKey = ''
      g._lastSelKey = ''
      g.updateHUD(0.016)
      const paladinInitial = {
        learnHolyLight: readButton('学习圣光术 (Lv1)'),
        learnDivineShield: readButton('学习神圣护盾 (Lv1)'),
        potion: readButton('治疗药水'),
        townPortal: readButton('回城卷轴'),
      }

      paladin.abilityLevels = {
        ...(paladin.abilityLevels ?? {}),
        holy_light: 1,
        divine_shield: 1,
        resurrection: 1,
      }
      g._lastCmdKey = ''
      g._lastSelKey = ''
      g.updateHUD(0.016)
      const paladinLearned = {
        holyLight: readButton('圣光术 (Lv1)'),
        divineShield: readButton('神圣护盾 (Lv1)'),
        resurrection: readButton('复活'),
      }

      const archmage = g.spawnUnit('archmage', 0, 27, 24)
      archmage.heroLevel = 6
      archmage.heroSkillPoints = 4
      archmage.mana = archmage.maxMana
      archmage.abilityLevels = {
        ...(archmage.abilityLevels ?? {}),
        water_elemental: 1,
        blizzard: 1,
        mass_teleport: 1,
      }
      g.selectionModel.clear()
      g.selectionModel.setSelection([archmage])
      g._lastCmdKey = ''
      g._lastSelKey = ''
      g.updateHUD(0.016)
      const archmageButtons = {
        water: readButton('召唤水元素 (Lv1)'),
        blizzard: readButton('暴风雪 (Lv1)'),
        teleport: readButton('群体传送'),
      }

      return { paladinInitial, paladinLearned, archmageButtons }
    })

    expect(result.paladinInitial.learnHolyLight.iconKey).toBe('ability:holy_light')
    expect(result.paladinInitial.learnDivineShield.iconKey).toBe('ability:divine_shield')
    expect(result.paladinInitial.potion.iconKey).toBe('item:healing_potion')
    expect(result.paladinInitial.townPortal.iconKey).toBe('item:scroll_of_town_portal')
    expect(result.paladinLearned.holyLight.iconKey).toBe('ability:holy_light')
    expect(result.paladinLearned.divineShield.iconKey).toBe('ability:divine_shield')
    expect(result.paladinLearned.resurrection.iconKey).toBe('ability:resurrection')
    expect(result.archmageButtons.water.iconKey).toBe('ability:water_elemental')
    expect(result.archmageButtons.blizzard.iconKey).toBe('ability:blizzard')
    expect(result.archmageButtons.teleport.iconKey).toBe('ability:mass_teleport')
    for (const group of Object.values(result) as any[]) {
      for (const button of Object.values(group) as any[]) {
        expect(button.exists).toBe(true)
        expect(button.hasIconNode).toBe(true)
        expect(button.canvasIconKey).toBe(button.iconKey)
      }
    }
  })
})
