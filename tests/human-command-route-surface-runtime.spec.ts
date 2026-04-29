/**
 * R7/R4 Human command-card route surface runtime proof.
 *
 * Human route language must reach the actual command card, not only the route
 * panel. This proves build/train/research/upgrade buttons expose tier, role,
 * hotkey, and still keep their runtime disabled reasons.
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
    return game.renderer.domElement.width > 0
  }, { timeout: 15000 })
  try {
    await page.waitForFunction(() => {
      const status = document.getElementById('map-status')?.textContent ?? ''
      return !status.includes('正在加载')
    }, { timeout: 15000 })
  } catch {
    // Procedural fallback is valid for route-surface tests.
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

test.describe('Human command-card route surface', () => {
  test.setTimeout(120000)

  test('worker build menu exposes T1/T2/Hero route roles and keeps prerequisite reasons', async ({ page }) => {
    await waitForRuntime(page)

    const result = await page.evaluate(() => {
      const g = (window as any).__war3Game
      g.resources.earn(0, 5000, 5000)
      for (const unit of g.units) {
        if (unit.team === 0 && unit.type === 'keep' && unit.isBuilding) unit.hp = 0
      }
      g.handleDeadUnits()

      const worker = g.units.find((u: any) => u.team === 0 && u.type === 'worker' && !u.isBuilding && u.hp > 0)
      if (!worker) return { error: 'no worker' }

      g.selectionModel.clear()
      g.selectionModel.setSelection([worker])
      g._lastCmdKey = ''
      g.updateHUD(0.016)

      const readButton = (label: string) => {
        const btn = Array.from(document.querySelectorAll('#command-card button')).find((button: any) =>
          button.querySelector('.btn-label')?.textContent?.trim() === label,
        ) as HTMLButtonElement | undefined
        return {
          exists: !!btn,
          disabled: btn?.disabled ?? null,
          reason: btn?.dataset.disabledReason ?? '',
          routeKey: btn?.dataset.routeKey ?? '',
          tier: btn?.dataset.routeTier ?? '',
          role: btn?.dataset.routeRole ?? '',
          focus: btn?.dataset.routeFocus ?? '',
          routeText: btn?.querySelector('.btn-route')?.textContent ?? '',
          hotkey: btn?.querySelector('.btn-hotkey')?.textContent ?? '',
          title: btn?.title ?? '',
        }
      }

      return {
        blacksmith: readButton('铁匠铺'),
        workshop: readButton('车间'),
        sanctum: readButton('奥秘圣殿'),
        altar: readButton('国王祭坛'),
        callToArms: readButton('紧急动员'),
      }
    })

    expect(result.error).toBeUndefined()
    expect(result.blacksmith).toMatchObject({
      exists: true,
      routeKey: 'human-t1-rifle-tech',
      tier: 'T1',
      role: '远程火力',
      hotkey: 'S',
    })
    expect(result.workshop.exists).toBe(true)
    expect(result.workshop.disabled).toBe(true)
    expect(result.workshop.reason).toContain('主城')
    expect(result.workshop.routeKey).toBe('human-t2-workshop-siege')
    expect(result.workshop.routeText).toContain('T2')
    expect(result.workshop.routeText).toContain('破防攻城')
    expect(result.workshop.title).toContain('需要主城')
    expect(result.sanctum).toMatchObject({
      exists: true,
      disabled: true,
      routeKey: 'human-t2-caster-line',
      tier: 'T2',
      role: '治疗与控制',
      hotkey: 'A',
    })
    expect(result.sanctum.reason).toContain('主城')
    expect(result.altar).toMatchObject({
      exists: true,
      routeKey: 'human-hero-opening',
      tier: '英雄',
      role: '首发英雄',
      hotkey: 'H',
    })
    expect(result.callToArms.routeKey).toBe('human-t1-call-to-arms')
    expect(result.callToArms.role).toBe('紧急防守')
  })

  test('town hall, barracks, workshop, and sanctum training buttons carry route roles', async ({ page }) => {
    await waitForRuntime(page)

    const result = await page.evaluate(() => {
      const g = (window as any).__war3Game
      g.resources.earn(0, 7000, 7000)
      for (let i = 0; i < 4; i++) {
        const farm = g.spawnBuilding('farm', 0, 42 + i * 2, 44)
        farm.buildProgress = 1
      }

      const readForSelection = (selected: any, labels: string[]) => {
        g.selectionModel.clear()
        g.selectionModel.setSelection([selected])
        g._lastCmdKey = ''
        g.updateHUD(0.016)
        const rows: Record<string, any> = {}
        for (const label of labels) {
          const btn = Array.from(document.querySelectorAll('#command-card button')).find((button: any) =>
            button.querySelector('.btn-label')?.textContent?.trim() === label,
          ) as HTMLButtonElement | undefined
          rows[label] = {
            exists: !!btn,
            disabled: btn?.disabled ?? null,
            reason: btn?.dataset.disabledReason ?? '',
            routeKey: btn?.dataset.routeKey ?? '',
            tier: btn?.dataset.routeTier ?? '',
            role: btn?.dataset.routeRole ?? '',
            hotkey: btn?.querySelector('.btn-hotkey')?.textContent ?? '',
            text: btn?.textContent ?? '',
          }
        }
        return rows
      }

      const townhall = g.units.find((u: any) => u.team === 0 && u.type === 'townhall' && u.isBuilding && u.hp > 0)
      const keep = g.spawnBuilding('keep', 0, 48, 44)
      keep.buildProgress = 1
      const barracks = g.spawnBuilding('barracks', 0, 52, 44)
      barracks.buildProgress = 1
      const workshop = g.spawnBuilding('workshop', 0, 56, 44)
      workshop.buildProgress = 1
      const sanctum = g.spawnBuilding('arcane_sanctum', 0, 60, 44)
      sanctum.buildProgress = 1

      return {
        townhall: townhall ? readForSelection(townhall, ['农民', '升级主城']) : { error: 'no townhall' },
        keep: readForSelection(keep, ['升级主城']),
        barracks: readForSelection(barracks, ['步兵', '步枪兵', '骑士']),
        workshop: readForSelection(workshop, ['迫击炮小队']),
        sanctum: readForSelection(sanctum, ['牧师', '女巫']),
      }
    })

    expect(result.townhall.error).toBeUndefined()
    expect(result.townhall['农民']).toMatchObject({
      exists: true,
      routeKey: 'human-economy-worker',
      tier: '经济',
      role: '采集/建造',
      hotkey: 'P',
    })
    expect(result.townhall['升级主城']).toMatchObject({
      exists: true,
      routeKey: 'human-t2-keep-transition',
      tier: 'T2',
      role: '二本转型',
      hotkey: 'U',
    })
    expect(result.keep['升级主城']).toMatchObject({
      exists: true,
      routeKey: 'human-t3-castle-transition',
      tier: 'T3',
      role: '三本成型',
    })
    expect(result.barracks['步兵']).toMatchObject({
      exists: true,
      routeKey: 'human-t1-frontline',
      tier: 'T1',
      role: '近战前排',
    })
    expect(result.barracks['步枪兵'].routeKey).toBe('human-t1-rifleman')
    expect(result.barracks['步枪兵'].role).toBe('远程火力')
    expect(result.barracks['步枪兵'].reason).toContain('铁匠铺')
    expect(result.barracks['骑士'].routeKey).toBe('human-t3-knight-frontline')
    expect(result.barracks['骑士'].tier).toBe('T3')
    expect(result.barracks['骑士'].reason).toContain('城堡')
    expect(result.workshop['迫击炮小队']).toMatchObject({
      exists: true,
      routeKey: 'human-t2-workshop-siege',
      tier: 'T2',
      role: '破防攻城',
      hotkey: 'M',
    })
    expect(result.sanctum['牧师']).toMatchObject({
      exists: true,
      routeKey: 'human-t2-priest-support',
      tier: 'T2',
      role: '治疗支援',
      hotkey: 'P',
    })
    expect(result.sanctum['女巫']).toMatchObject({
      exists: true,
      routeKey: 'human-t2-sorceress-control',
      tier: 'T2',
      role: '控制减速',
      hotkey: 'S',
    })
  })

  test('blacksmith research and shop buttons expose route metadata without hiding completion state', async ({ page }) => {
    await waitForRuntime(page)

    const result = await page.evaluate(() => {
      const g = (window as any).__war3Game
      g.resources.earn(0, 7000, 7000)
      const blacksmith = g.spawnBuilding('blacksmith', 0, 44, 52)
      blacksmith.buildProgress = 1
      blacksmith.completedResearches.push('long_rifles')
      const keep = g.spawnBuilding('keep', 0, 48, 52)
      keep.buildProgress = 1
      const vault = g.spawnBuilding('arcane_vault', 0, 52, 52)
      vault.buildProgress = 1

      const readForSelection = (selected: any, labels: string[]) => {
        g.selectionModel.clear()
        g.selectionModel.setSelection([selected])
        g._lastCmdKey = ''
        g.updateHUD(0.016)
        const rows: Record<string, any> = {}
        for (const label of labels) {
          const btn = Array.from(document.querySelectorAll('#command-card button')).find((button: any) =>
            button.querySelector('.btn-label')?.textContent?.trim() === label,
          ) as HTMLButtonElement | undefined
          rows[label] = {
            exists: !!btn,
            disabled: btn?.disabled ?? null,
            reason: btn?.dataset.disabledReason ?? '',
            routeKey: btn?.dataset.routeKey ?? '',
            tier: btn?.dataset.routeTier ?? '',
            role: btn?.dataset.routeRole ?? '',
            focus: btn?.dataset.routeFocus ?? '',
            hotkey: btn?.querySelector('.btn-hotkey')?.textContent ?? '',
            text: btn?.textContent ?? '',
            title: btn?.title ?? '',
          }
        }
        return rows
      }

      return {
        blacksmith: readForSelection(blacksmith, ['长管步枪 ✓', '钢剑', '黑火药', '动物作战训练']),
        vault: readForSelection(vault, ['治疗药水', '魔法药水', '速度之靴', '回城卷轴']),
      }
    })

    expect(result.blacksmith['长管步枪 ✓']).toMatchObject({
      exists: true,
      disabled: true,
      reason: '已研究',
      routeKey: 'human-t1-rifleman',
      tier: 'T1',
      role: '远程火力',
      hotkey: 'L',
    })
    expect(result.blacksmith['长管步枪 ✓'].text).toContain('已研究')
    expect(result.blacksmith['钢剑']).toMatchObject({
      exists: true,
      routeKey: 'human-melee-attack-2',
      tier: 'T2',
      role: '近战输出',
      hotkey: 'G',
    })
    expect(result.blacksmith['钢剑'].reason).toContain('铁剑')
    expect(result.blacksmith['黑火药']).toMatchObject({
      exists: true,
      routeKey: 'human-ranged-attack-1',
      tier: 'T1',
      role: '远程/攻城火力',
      hotkey: 'P',
    })
    expect(result.blacksmith['动物作战训练'].exists).toBe(false)
    expect(result.vault['治疗药水']).toMatchObject({
      exists: true,
      routeKey: 'human-shop-healing',
      tier: '商店',
      role: '生命续航',
      hotkey: 'H',
    })
    expect(result.vault['回城卷轴']).toMatchObject({
      exists: true,
      routeKey: 'human-shop-town-portal',
      tier: '商店',
      role: '回城保护',
      hotkey: 'T',
    })
    expect((page as any).__consoleErrors).toEqual([])
    expect((page as any).__pageErrors).toEqual([])
  })
})
