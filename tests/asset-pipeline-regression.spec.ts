/**
 * Asset Pipeline Contract Pack
 *
 * These tests protect the drop-in glTF replacement path. The important cases
 * run inside the browser through window.__war3Game so they exercise the live
 * built game bundle, not a separate Node-side module instance.
 */
import { test, expect, type Page } from '@playwright/test'

const BASE = 'http://127.0.0.1:4173/?runtimeTest=1'

async function waitForGame(page: Page) {
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
    // Procedural-only fallback is valid in tests that do not load W3X.
  }
  await page.waitForTimeout(300)
}

function collectLiveSnapshotsInPage() {
  const g = (window as any).__war3Game
  return g.units
    .filter((u: any) => u.hp > 0)
    .map((unit: any) => {
      unit.mesh.updateWorldMatrix(true, true)
      let visibleMeshCount = 0
      let minWorldScale = Number.POSITIVE_INFINITY
      unit.mesh.traverse((child: any) => {
        if (!child?.isMesh || child.visible === false) return
        visibleMeshCount++
        const scale = new unit.mesh.position.constructor()
        child.getWorldScale(scale)
        minWorldScale = Math.min(minWorldScale, scale.x, scale.y, scale.z)
      })
      return {
        type: unit.type,
        team: unit.team,
        isBuilding: unit.isBuilding,
        visibleMeshCount,
        minWorldScale: Number.isFinite(minWorldScale) ? minWorldScale : 0,
        position: { x: unit.mesh.position.x, y: unit.mesh.position.y, z: unit.mesh.position.z },
        rotationY: unit.mesh.rotation.y,
        directChildCount: unit.mesh.children.length,
      }
    })
}

test.describe('Asset Pipeline Contracts', () => {
  test.setTimeout(120000)

  test('browser-side fake asset contract covers clone isolation, team color isolation, and refresh scale', async ({ page }) => {
    await waitForGame(page)

    const result = await page.evaluate(() => {
      const g = (window as any).__war3Game
      return g.__testRunAssetPipelineContracts()
    })

    expect(result.sourceMaterialCount, 'fixture must use material array with two materials').toBe(2)
    expect(result.cloneMaterialCount, 'clone must retain both fixture materials').toBe(2)
    expect(result.materialArrayIsolated, 'cloned Mesh.material arrays must be distinct objects').toBe(true)
    expect(result.materialObjectsIsolated, 'cloned material objects must not be shared').toBe(true)

    expect(result.teamBlue, 'team 0 fake footman should apply blue team_color').toBe(0x4488ff)
    expect(result.teamRed, 'team 1 fake footman should apply red team_color').toBe(0xff4444)
    expect(result.teamMaterialObjectsIsolated, 'team-color materials must not be shared between clones').toBe(true)
    expect(result.factoryScale, 'factory clone should preserve injected asset scale').toBeCloseTo(2.5, 3)

    expect(result.refresh.ok, result.refresh.reason ?? 'refresh contract failed').toBe(true)
    expect(result.refresh.oldScale, 'test must start from a deliberately wrong fallback scale').toBeCloseTo(0.2, 3)
    expect(result.refresh.replacementScale, 'refresh must use replacement asset scale, not fallback scale').toBeCloseTo(2.5, 3)
    expect(result.refresh.scaleAfterDealDamage, 'dealDamage attack animation must preserve asset scale multiplier').toBeCloseTo(2.875, 3)
    expect(result.refresh.oldRootStillInScene, 'refresh must remove old visual root from scene').toBe(false)
    expect(result.refresh.sharedOldChildCount, 'refresh must not leave old visual children under new root').toBe(0)
    expect(result.refresh.directChildCount, 'replacement fixture should have one root child, no duplicate old+new roots').toBe(1)
    expect(result.refresh.renderableMeshCount, 'replacement fixture should have exactly one renderable mesh').toBe(1)
    expect(result.refresh.flashHitError, 'flashHit must tolerate nested Material[] fixture').toBeNull()
    expect(result.refresh.dealDamageError, 'dealDamage must tolerate nested Material[] fixture').toBeNull()
  })

  test('missing asset path still creates visible fallback visuals for required types', async ({ page }) => {
    await waitForGame(page)

    const summaries = await page.evaluate(() => {
      const g = (window as any).__war3Game
      return [
        { type: 'worker', isBuilding: false, summary: g.__testCreateAssetVisualSummary('worker', false, 0) },
        { type: 'footman', isBuilding: false, summary: g.__testCreateAssetVisualSummary('footman', false, 0) },
        { type: 'townhall', isBuilding: true, summary: g.__testCreateAssetVisualSummary('townhall', true, 0) },
        { type: 'barracks', isBuilding: true, summary: g.__testCreateAssetVisualSummary('barracks', true, 0) },
        { type: 'farm', isBuilding: true, summary: g.__testCreateAssetVisualSummary('farm', true, 0) },
        { type: 'tower', isBuilding: true, summary: g.__testCreateAssetVisualSummary('tower', true, 0) },
        { type: 'goldmine', isBuilding: true, summary: g.__testCreateAssetVisualSummary('goldmine', true, 0) },
      ]
    })

    for (const item of summaries) {
      expect(item.summary.visibleMeshCount, `${item.type}: no visible renderable meshes`).toBeGreaterThanOrEqual(1)
      expect(item.summary.bboxHeight, `${item.type}: visual height collapsed`).toBeGreaterThan(0.2)
      expect(item.summary.bboxWidth, `${item.type}: visual width collapsed`).toBeGreaterThan(0.2)
      expect(item.summary.bboxDepth, `${item.type}: visual depth collapsed`).toBeGreaterThan(0.2)
      expect(item.summary.scale.x, `${item.type}: root scale collapsed`).toBeGreaterThan(0.05)
      expect(item.summary.scale.y, `${item.type}: root scale collapsed`).toBeGreaterThan(0.05)
      expect(item.summary.scale.z, `${item.type}: root scale collapsed`).toBeGreaterThan(0.05)
    }
  })

  test('explicit refresh preserves live entity position and rotation', async ({ page }) => {
    await waitForGame(page)

    const { before, after } = await page.evaluate((collectSrc) => {
      const collect = new Function(`return (${collectSrc})`)()
      const g = (window as any).__war3Game
      const before = collect()
      g.refreshVisualsAfterAssetLoad()
      const after = collect()
      return { before, after }
    }, collectLiveSnapshotsInPage.toString())

    expect(after.length, 'refresh should not remove gameplay entities').toBeGreaterThanOrEqual(before.length)
    for (let i = 0; i < before.length; i++) {
      const b = before[i]
      const a = after.find(candidate =>
        candidate.type === b.type &&
        candidate.team === b.team &&
        candidate.isBuilding === b.isBuilding &&
        Math.abs(candidate.position.x - b.position.x) < 0.001 &&
        Math.abs(candidate.position.z - b.position.z) < 0.001,
      )
      expect(a, `${b.type}[${i}]: missing after refresh`).toBeTruthy()
      if (!a) continue
      expect(a.type, `entity ${i}: type changed`).toBe(b.type)
      expect(a.team, `entity ${i}: team changed`).toBe(b.team)
      expect(a.isBuilding, `entity ${i}: building flag changed`).toBe(b.isBuilding)
      expect(a.position.x, `${b.type}[${i}]: x shifted`).toBeCloseTo(b.position.x, 3)
      expect(a.position.y, `${b.type}[${i}]: y shifted`).toBeCloseTo(b.position.y, 3)
      expect(a.position.z, `${b.type}[${i}]: z shifted`).toBeCloseTo(b.position.z, 3)
      expect(a.rotationY, `${b.type}[${i}]: rotation shifted`).toBeCloseTo(b.rotationY, 3)
      expect(a.visibleMeshCount, `${b.type}[${i}]: visual lost all meshes`).toBeGreaterThanOrEqual(1)
      expect(a.minWorldScale, `${b.type}[${i}]: world scale collapsed`).toBeGreaterThan(0.05)
    }
  })

  test('startup and explicit refresh produce no severe console errors', async ({ page }) => {
    const consoleErrors: string[] = []
    page.on('console', msg => {
      if (msg.type() === 'error') consoleErrors.push(msg.text())
    })

    await waitForGame(page)
    await page.evaluate(() => {
      const g = (window as any).__war3Game
      g.refreshVisualsAfterAssetLoad()
      for (let i = 0; i < 30; i++) g.update(0.016)
    })
    await page.waitForTimeout(500)

    const severe = consoleErrors.filter(e =>
      !e.includes('404') &&
      !e.includes('favicon') &&
      !e.includes('Failed to load resource') &&
      !e.includes('Test map load failed') &&
      !e.includes('net::'),
    )
    expect(severe, severe.join('\n')).toHaveLength(0)
  })
})
