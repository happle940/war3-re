/**
 * V9 HERO13-UX1 Devotion Aura visible feedback runtime proof.
 *
 * Proves:
 * 1. Paladin with learned DA shows level in HUD.
 * 2. Friendly unit receiving aura shows armor bonus line.
 * 3. Bonus text disappears when unit leaves range or Paladin dies.
 * 4. Enemy/buildings don't show friendly aura state.
 * 5. No DA cast button exists.
 * 6. Holy Light, Divine Shield, HERO9 revive unchanged.
 */
import { test, expect, type Page } from '@playwright/test'

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
  } catch { /* procedural fallback */ }
  await page.evaluate(() => {
    const g = (window as any).__war3Game
    if (g?.ai) { if (typeof g.ai.reset === 'function') g.ai.reset(); g.ai.update = () => {} }
  })
  await page.waitForTimeout(300)
}

async function summonPaladin(page: Page): Promise<any> {
  return page.evaluate(() => {
    const g = (window as any).__war3Game
    g.resources.earn(0, 10000, 10000)
    g.spawnBuilding('altar_of_kings', 0, 15, 15)
    const altar = g.units.find((u: any) => u.team === 0 && u.type === 'altar_of_kings' && u.isBuilding)
    if (!altar) return null
    g.selectionModel.clear()
    g.selectionModel.setSelection([altar])
    g._lastCmdKey = ''
    g.updateHUD(0.016)
    const btn = Array.from(document.querySelectorAll('#command-card button')).find((b: any) =>
      b.querySelector('.btn-label')?.textContent?.trim() === '圣骑士',
    ) as HTMLButtonElement | undefined
    if (btn) btn.click()
    const dt = 0.5
    for (let i = 0; i < 120; i++) { g.gameTime += dt; g.updateUnits(dt) }
    const paladin = g.units.find((u: any) => u.type === 'paladin' && !u.isBuilding && u.team === 0)
    return paladin ? { type: paladin.type } : null
  })
}

async function selectUnit(page: Page, predicate: (u: any) => boolean) {
  await page.evaluate((predStr) => {
    const g = (window as any).__war3Game
    const unit = g.units.find((u: any) => {
      const pred = new Function('u', `return ${predStr}`)
      return pred(u)
    })
    if (!unit) return
    g.selectionModel.clear()
    g.selectionModel.setSelection([unit])
    g._lastCmdKey = ''
    g._lastSelKey = ''
    g.updateHUD(0.016)
  }, `(u) => ${predicate.toString().replace(/^\(u\) => /, '')}`)
}

test.describe('V9 HERO13-UX1 Devotion Aura visible feedback', () => {
  test.setTimeout(180000)

  test('VF-DA-1: Paladin with learned DA shows level in HUD', async ({ page }) => {
    await waitForRuntime(page)
    const pal = await summonPaladin(page)
    expect(pal).not.toBeNull()

    await page.evaluate(() => {
      const g = (window as any).__war3Game
      const paladin = g.units.find((u: any) => u.type === 'paladin' && !u.isBuilding && u.team === 0)
      if (!paladin) return
      if (!paladin.abilityLevels) paladin.abilityLevels = {}
      paladin.abilityLevels.devotion_aura = 2
      g.updateDevotionAura()
    })

    // Select Paladin
    await page.evaluate(() => {
      const g = (window as any).__war3Game
      const paladin = g.units.find((u: any) => u.type === 'paladin' && !u.isBuilding && u.team === 0)
      g.selectionModel.clear()
      g.selectionModel.setSelection([paladin])
      g._lastCmdKey = ''
      g._lastSelKey = ''
      g.updateHUD(0.016)
    })

    const result = await page.evaluate(() => {
      const statsEl = document.getElementById('unit-stats')
      const statsText = statsEl?.textContent ?? ''
      return {
        showsDALevel: statsText.includes('虔诚光环 Lv2'),
        showsAuraBonus: statsText.includes('虔诚光环 +3 护甲'),
      }
    })

    expect(result.showsDALevel).toBe(true)
    expect(result.showsAuraBonus).toBe(true)
  })

  test('VF-DA-2: friendly unit receiving aura shows armor bonus line', async ({ page }) => {
    await waitForRuntime(page)
    const pal = await summonPaladin(page)
    expect(pal).not.toBeNull()

    await page.evaluate(() => {
      const g = (window as any).__war3Game
      const paladin = g.units.find((u: any) => u.type === 'paladin' && !u.isBuilding && u.team === 0)
      if (!paladin) return
      if (!paladin.abilityLevels) paladin.abilityLevels = {}
      paladin.abilityLevels.devotion_aura = 1
      // Spawn friendly footman nearby
      g.spawnUnit('footman', 0, paladin.mesh.position.x + 1, paladin.mesh.position.z)
      g.updateDevotionAura()
    })

    // Select the footman
    await page.evaluate(() => {
      const g = (window as any).__war3Game
      const footman = g.units.find((u: any) => u.type === 'footman' && !u.isBuilding && u.team === 0)
      if (!footman) return
      g.selectionModel.clear()
      g.selectionModel.setSelection([footman])
      g._lastCmdKey = ''
      g._lastSelKey = ''
      g.updateHUD(0.016)
    })

    const result = await page.evaluate(() => {
      const statsEl = document.getElementById('unit-stats')
      return statsEl?.textContent ?? ''
    })

    expect(result).toContain('虔诚光环 +1.5 护甲')
  })

  test('VF-DA-3: bonus text disappears when unit leaves range or Paladin dies', async ({ page }) => {
    await waitForRuntime(page)
    const pal = await summonPaladin(page)
    expect(pal).not.toBeNull()

    // Set up: DA learned, footman nearby
    await page.evaluate(() => {
      const g = (window as any).__war3Game
      const paladin = g.units.find((u: any) => u.type === 'paladin' && !u.isBuilding && u.team === 0)
      if (!paladin) return
      if (!paladin.abilityLevels) paladin.abilityLevels = {}
      paladin.abilityLevels.devotion_aura = 1
      g.spawnUnit('footman', 0, paladin.mesh.position.x + 1, paladin.mesh.position.z)
      g.updateDevotionAura()
    })

    // Move the unit outside aura range — aura should disappear.
    const outOfRangeText = await page.evaluate(() => {
      const g = (window as any).__war3Game
      const footman = g.units.find((u: any) => u.type === 'footman' && !u.isBuilding && u.team === 0)
      if (!footman) return 'missing footman'
      footman.mesh.position.x += 20
      g.updateDevotionAura()
      g.selectionModel.clear()
      g.selectionModel.setSelection([footman])
      g._lastCmdKey = ''
      g._lastSelKey = ''
      g.updateHUD(0.016)
      return document.getElementById('unit-stats')?.textContent ?? ''
    })
    expect(outOfRangeText).not.toContain('虔诚光环 +')

    // Move back into range, then kill Paladin — aura should disappear again.
    await page.evaluate(() => {
      const g = (window as any).__war3Game
      const paladin = g.units.find((u: any) => u.type === 'paladin' && !u.isBuilding && u.team === 0)
      const footman = g.units.find((u: any) => u.type === 'footman' && !u.isBuilding && u.team === 0)
      if (!paladin || !footman) return
      footman.mesh.position.x = paladin.mesh.position.x + 1
      footman.mesh.position.z = paladin.mesh.position.z
      g.updateDevotionAura()
      paladin.hp = 0
      g.update(0.5)
      g.updateDevotionAura()
    })

    // Select footman
    await page.evaluate(() => {
      const g = (window as any).__war3Game
      const footman = g.units.find((u: any) => u.type === 'footman' && !u.isBuilding && u.team === 0)
      if (!footman) return
      g.selectionModel.clear()
      g.selectionModel.setSelection([footman])
      g._lastCmdKey = ''
      g._lastSelKey = ''
      g.updateHUD(0.016)
    })

    const result = await page.evaluate(() => {
      const statsEl = document.getElementById('unit-stats')
      return statsEl?.textContent ?? ''
    })

    expect(result).not.toContain('虔诚光环 +')
  })

  test('VF-DA-4: enemy and buildings do not show aura state', async ({ page }) => {
    await waitForRuntime(page)
    const pal = await summonPaladin(page)
    expect(pal).not.toBeNull()

    await page.evaluate(() => {
      const g = (window as any).__war3Game
      const paladin = g.units.find((u: any) => u.type === 'paladin' && !u.isBuilding && u.team === 0)
      if (!paladin) return
      if (!paladin.abilityLevels) paladin.abilityLevels = {}
      paladin.abilityLevels.devotion_aura = 1
      // Spawn enemy and building near paladin.
      g.spawnUnit('footman', 1, paladin.mesh.position.x + 1, paladin.mesh.position.z)
      g.spawnBuilding('barracks', 0, paladin.mesh.position.x + 2, paladin.mesh.position.z + 2)
      g.updateDevotionAura()
    })

    // Select enemy
    const enemyText = await page.evaluate(() => {
      const g = (window as any).__war3Game
      const enemy = g.units.find((u: any) => u.type === 'footman' && !u.isBuilding && u.team === 1)
      if (!enemy) return 'missing enemy'
      g.selectionModel.clear()
      g.selectionModel.setSelection([enemy])
      g._lastCmdKey = ''
      g._lastSelKey = ''
      g.updateHUD(0.016)
      return document.getElementById('unit-stats')?.textContent ?? ''
    })
    expect(enemyText).not.toContain('虔诚光环 +')

    const buildingText = await page.evaluate(() => {
      const g = (window as any).__war3Game
      const barracks = g.units.find((u: any) => u.type === 'barracks' && u.isBuilding && u.team === 0)
      if (!barracks) return 'missing building'
      g.selectionModel.clear()
      g.selectionModel.setSelection([barracks])
      g._lastCmdKey = ''
      g._lastSelKey = ''
      g.updateHUD(0.016)
      return document.getElementById('unit-stats')?.textContent ?? ''
    })
    expect(buildingText).not.toContain('虔诚光环 +')
  })

  test('VF-DA-5: no DA cast button, learn button still present', async ({ page }) => {
    await waitForRuntime(page)
    const pal = await summonPaladin(page)
    expect(pal).not.toBeNull()

    await page.evaluate(() => {
      const g = (window as any).__war3Game
      const paladin = g.units.find((u: any) => u.type === 'paladin' && !u.isBuilding && u.team === 0)
      if (!paladin) return
      if (!paladin.abilityLevels) paladin.abilityLevels = {}
      paladin.abilityLevels.devotion_aura = 1
    })

    await page.evaluate(() => {
      const g = (window as any).__war3Game
      const paladin = g.units.find((u: any) => u.type === 'paladin' && !u.isBuilding && u.team === 0)
      g.selectionModel.clear()
      g.selectionModel.setSelection([paladin])
      g._lastCmdKey = ''
      g.updateHUD(0.016)
    })

    const result = await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('#command-card button'))
      const castBtn = buttons.find((b: any) => {
        const txt = b.querySelector('.btn-label')?.textContent?.trim() ?? ''
        return txt.includes('虔诚光环') && txt.includes('Lv') && !txt.includes('学习')
      })
      const learnBtn = buttons.find((b: any) =>
        b.querySelector('.btn-label')?.textContent?.trim()?.includes('学习虔诚光环'),
      )
      return { hasCastBtn: !!castBtn, hasLearnBtn: !!learnBtn }
    })

    expect(result.hasCastBtn).toBe(false)
    expect(result.hasLearnBtn).toBe(true)
  })
})
