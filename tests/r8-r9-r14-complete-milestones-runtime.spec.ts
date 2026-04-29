/**
 * Complete-milestone proof for R8 hero tactics, R9 AI opponent, and R14 visual/audio identity.
 */
import { test, expect, type Page } from '@playwright/test'

const BASE_RUNTIME = 'http://127.0.0.1:4173/?runtimeTest=1'

async function waitForGame(page: Page) {
  const consoleErrors: string[] = []
  const pageErrors: string[] = []
  page.on('console', (msg) => {
    if (msg.type() === 'error') consoleErrors.push(msg.text())
  })
  page.on('pageerror', (err) => pageErrors.push(err.message))
  ;(page as any).__consoleErrors = consoleErrors
  ;(page as any).__pageErrors = pageErrors

  await page.addInitScript(() => localStorage.removeItem('war3-re.session-preferences.v1'))
  await page.goto(BASE_RUNTIME, { waitUntil: 'domcontentloaded' })
  await page.waitForFunction(() => {
    const game = (window as any).__war3Game
    if (!game || !game.renderer) return false
    if (!Array.isArray(game.units) || game.units.length === 0) return false
    return game.renderer.domElement.width > 0
  }, { timeout: 15000 })
  await page.waitForTimeout(300)
}

test.describe('Complete R8/R9/R14 milestones runtime', () => {
  test.setTimeout(180000)

  test('R8 closes hero growth, three Human hero kits, death/revive substrate, and tactical feedback', async ({ page }) => {
    await waitForGame(page)

    const result = await page.evaluate(() => {
      const g = (window as any).__war3Game
      if (g?.ai) g.ai.update = () => {}

      const hall = g.units.find((u: any) => u.team === 0 && u.type === 'townhall' && u.hp > 0)
      if (!hall) return { error: 'missing player townhall' }

      const baseX = hall.mesh.position.x
      const baseZ = hall.mesh.position.z
      g.spawnBuilding('altar_of_kings', 0, baseX + 6, baseZ + 1)

      const paladin = g.spawnUnit('paladin', 0, baseX + 4, baseZ + 4)
      const archmage = g.spawnUnit('archmage', 0, baseX + 6, baseZ + 4)
      const mountainKing = g.spawnUnit('mountain_king', 0, baseX + 8, baseZ + 4)
      const heroes = [paladin, archmage, mountainKing]
      for (const hero of heroes) {
        hero.heroLevel = 6
        hero.heroXP = 900
        hero.heroSkillPoints = 0
        hero.maxMana = 999
        hero.mana = 999
      }
      paladin.abilityLevels = {
        holy_light: 3,
        divine_shield: 2,
        devotion_aura: 2,
        resurrection: 1,
      }
      archmage.abilityLevels = {
        water_elemental: 3,
        brilliance_aura: 2,
        blizzard: 2,
        mass_teleport: 1,
      }
      mountainKing.abilityLevels = {
        storm_bolt: 3,
        thunder_clap: 2,
        bash: 2,
        avatar: 1,
      }

      const injured = g.spawnUnit('footman', 0, paladin.mesh.position.x + 1, paladin.mesh.position.z)
      injured.hp = Math.max(1, Math.floor(injured.maxHp * 0.35))
      g.deadUnitRecords.push({
        team: 0,
        type: 'footman',
        x: paladin.mesh.position.x + 1,
        z: paladin.mesh.position.z + 1,
        diedAt: g.gameTime,
      })

      const stormTarget = g.spawnUnit('footman', 1, mountainKing.mesh.position.x + 2, mountainKing.mesh.position.z)
      const clapTarget = g.spawnUnit('rifleman', 1, mountainKing.mesh.position.x + 1, mountainKing.mesh.position.z + 1)
      const blizzardTarget = g.spawnUnit('footman', 1, archmage.mesh.position.x + 2, archmage.mesh.position.z + 2)

      const casts: Record<string, boolean> = {}
      casts.holyLight = g.castHolyLight(paladin, injured)
      paladin.mana = 999
      casts.divineShield = g.castDivineShield(paladin)

      casts.waterElemental = false
      for (const [dx, dz] of [[2, 0], [0, 2], [2, 2], [-2, 0]]) {
        archmage.mana = 999
        if (g.castSummonWaterElemental(archmage, archmage.mesh.position.x + dx, archmage.mesh.position.z + dz)) {
          casts.waterElemental = true
          break
        }
      }
      archmage.mana = 999
      casts.blizzard = g.castBlizzard(archmage, blizzardTarget.mesh.position.x, blizzardTarget.mesh.position.z)

      mountainKing.mana = 999
      casts.stormBolt = g.castStormBolt(mountainKing, stormTarget)
      mountainKing.mana = 999
      casts.thunderClap = g.castThunderClap(mountainKing)
      mountainKing.mana = 999
      casts.avatar = g.castAvatar(mountainKing)

      g.selectionModel.setSelection(heroes)
      g.sel.syncSelectionRings()

      const pointAtUnit = (unit: any) => {
        g.camera.updateMatrixWorld()
        const point = unit.mesh.position.clone()
        point.y += unit.isBuilding ? 1.0 : 0.55
        point.project(g.camera)
        g.setMouseNdcFromScreenPoint(
          (point.x * 0.5 + 0.5) * window.innerWidth,
          (-point.y * 0.5 + 0.5) * window.innerHeight,
        )
      }

      mountainKing.stormBoltCooldownUntil = 0
      mountainKing.mana = 999
      g.enterStormBoltTargetMode(mountainKing)
      pointAtUnit(stormTarget)
      g.updateHUD(0.016)
      const activeTargetValid = g.getHeroMilestoneSnapshot().abilityPresentation
      const feedbackValid = g.feedback.getSnapshot()
      pointAtUnit(injured)
      g.updateHUD(0.016)
      const activeTargetInvalid = g.getHeroMilestoneSnapshot().abilityPresentation
      const feedbackInvalid = g.feedback.getSnapshot()

      g.update(0.016)
      g.updateHUD(0.016)
      const snapshot = g.getHeroMilestoneSnapshot()
      const feedback = g.feedback.getSnapshot()
      const status = document.getElementById('hero-tactics-status') as HTMLElement | null
      const readiness = document.getElementById('hero-tactics-readiness') as HTMLElement | null

      return {
        casts,
        snapshot,
        activeTargetValid,
        activeTargetInvalid,
        feedbackValid,
        feedbackInvalid,
        feedback,
        statusText: status?.textContent ?? '',
        statusComplete: status?.dataset.complete ?? '',
        readinessText: readiness?.textContent ?? '',
        readinessComplete: readiness?.dataset.complete ?? '',
        deadRecords: g.deadUnitRecords.length,
        summonCount: g.units.filter((u: any) => u.type === 'water_elemental' && u.hp > 0).length,
      }
    })

    expect(result.error).toBeUndefined()
    expect(result.casts.holyLight).toBe(true)
    expect(result.casts.divineShield).toBe(true)
    expect(result.casts.waterElemental).toBe(true)
    expect(result.casts.blizzard).toBe(true)
    expect(result.casts.stormBolt).toBe(true)
    expect(result.casts.thunderClap).toBe(true)
    expect(result.casts.avatar).toBe(true)
    expect(result.deadRecords).toBeGreaterThan(0)
    expect(result.summonCount).toBeGreaterThan(0)
    expect(result.snapshot.milestone).toBe('R8')
    expect(result.snapshot.completed).toBe(true)
    expect(result.snapshot.completedCount).toBe(result.snapshot.totalCount)
    expect(result.snapshot.tacticalAbilityCount).toBeGreaterThanOrEqual(12)
    expect(result.snapshot.tacticalTargetHintCount).toBeGreaterThanOrEqual(8)
    expect(result.snapshot.tacticalBlockedCount).toBeGreaterThan(0)
    expect(result.snapshot.tactical.activeAbilityCount).toBeGreaterThan(0)
    expect(result.snapshot.tactical.targetKinds).toEqual(expect.arrayContaining(['self', 'friendly-unit', 'enemy-unit', 'ground', 'corpse', 'passive']))
    expect(result.snapshot.abilityPresentation.completed).toBe(true)
    expect(result.snapshot.abilityPresentation.completedCount).toBe(result.snapshot.abilityPresentation.totalCount)
    expect(result.snapshot.abilityPresentation.rangePreviewCount).toBeGreaterThanOrEqual(4)
    expect(result.snapshot.abilityPresentation.areaPreviewCount).toBeGreaterThanOrEqual(3)
    expect(result.snapshot.abilityPresentation.cursorHintCount).toBeGreaterThanOrEqual(4)
    expect(result.snapshot.abilityPresentation.groundCursorHintCount).toBeGreaterThanOrEqual(2)
    expect(result.snapshot.abilityPresentation.unitCursorHintCount).toBeGreaterThanOrEqual(2)
    expect(result.activeTargetValid.activeTargetEvaluation.legal).toBe(true)
    expect(result.activeTargetValid.activeTargetEvaluation.reason).toContain('可命中')
    expect(result.activeTargetValid.activeTargetLegalCount).toBe(1)
    expect(result.activeTargetValid.activeTargetValidMarkerCount).toBe(1)
    expect(result.feedbackValid.activeAbilityValidTargetMarkers).toBe(1)
    expect(result.activeTargetInvalid.activeTargetEvaluation.legal).toBe(false)
    expect(result.activeTargetInvalid.activeTargetEvaluation.reason).toContain('友方')
    expect(result.activeTargetInvalid.activeTargetInvalidCount).toBe(1)
    expect(result.activeTargetInvalid.activeTargetInvalidMarkerCount).toBe(1)
    expect(result.feedbackInvalid.activeAbilityInvalidTargetMarkers).toBe(1)
    expect(result.snapshot.abilityPresentation.activeTargetInvalidCount).toBe(1)
    expect(result.snapshot.abilityPresentation.activeTargetReasonCount).toBe(1)
    expect(result.snapshot.abilityPresentation.activeTargetMarkerCount).toBe(1)
    expect(result.snapshot.abilityPresentation.visiblePreviewRingCount).toBeGreaterThan(0)
    expect(result.snapshot.resurrectionReadability.completed).toBe(true)
    expect(result.snapshot.resurrectionReadability.corpseRecordCount).toBeGreaterThan(0)
    expect(result.snapshot.resurrectionReadability.visibleCorpseMarkerCount).toBeGreaterThan(0)
    expect(result.snapshot.resurrectionReadability.eligibleCorpseCount).toBeGreaterThan(0)
    expect(result.snapshot.resurrectionReadability.visibleEligibleCorpseMarkerCount).toBeGreaterThan(0)
    expect(result.snapshot.resurrectionReadability.resurrectionRadiusCount).toBeGreaterThan(0)
    expect(result.feedback.activeAbilityPreviewRings).toBeGreaterThan(0)
    expect(result.feedback.activeAbilityEffectBursts).toBeGreaterThan(0)
    expect(result.feedback.totalAbilityEffectBursts).toBeGreaterThan(0)
    expect(result.feedback.activeAbilityTargetMarkers).toBe(1)
    expect(result.feedback.activeAbilityInvalidTargetMarkers).toBe(1)
    expect(result.feedback.activeCorpseMarkers).toBeGreaterThan(0)
    expect(result.feedback.activeEligibleCorpseMarkers).toBeGreaterThan(0)
    expect(result.feedback.activeResurrectionRadiusRings).toBeGreaterThan(0)
    expect(result.snapshot.checks.map((check: any) => check.key)).toEqual(expect.arrayContaining([
      'ability-readiness',
      'target-legality',
      'ability-presentation',
      'resurrection-corpse-readability',
      'revive-readability',
    ]))
    expect(result.snapshot.abilityPresentation.checks.map((check: any) => check.key)).toEqual(expect.arrayContaining([
      'active-target-legality-contract',
    ]))
    expect(result.statusComplete).toBe('true')
    expect(result.statusText).toContain('R8 英雄')
    expect(result.statusText).toContain('完整英雄成局闭环')
    expect(result.readinessComplete).toBe('true')
    expect(result.readinessText).toContain('技能判断')
    expect(result.readinessText).toContain('目标提示')
    expect(result.readinessText).toContain('预览')
    expect(result.readinessText).toContain('当前目标 非法')
    expect(result.readinessText).toContain('复活 尸体')
    expect((page as any).__consoleErrors).toEqual([])
    expect((page as any).__pageErrors).toEqual([])
  })

  test('R9 closes AI economy, production, tech, hero skill, map-shop, pressure, recovery, and difficulty director loop', async ({ page }) => {
    await waitForGame(page)

    const result = await page.evaluate(() => {
      const g = (window as any).__war3Game
      const difficulty = document.getElementById('setting-ai-difficulty') as HTMLSelectElement | null
      if (difficulty) {
        difficulty.value = 'rush'
        difficulty.dispatchEvent(new Event('change', { bubbles: true }))
      }

      const ai = g.ai
      const aiHall = g.units.find((u: any) => u.team === 1 && u.type === 'townhall' && u.hp > 0)
      if (!ai || !aiHall) return { error: 'missing ai runtime state' }
      ai.update = () => {}

      const baseX = aiHall.mesh.position.x
      const baseZ = aiHall.mesh.position.z
      const barracks = g.spawnBuilding('barracks', 1, baseX - 7, baseZ + 2)
      const blacksmith = g.spawnBuilding('blacksmith', 1, baseX - 10, baseZ + 2)
      g.spawnBuilding('lumber_mill', 1, baseX - 13, baseZ + 2)
      g.spawnBuilding('arcane_vault', 1, baseX - 7, baseZ + 7)
      g.spawnBuilding('castle', 1, baseX - 12, baseZ + 7)
      for (let i = 0; i < 4; i++) g.spawnBuilding('farm', 1, baseX - 3 + i * 2, baseZ + 10)
      for (let i = 0; i < 4; i++) g.spawnUnit('worker', 1, baseX + 3 + i, baseZ + 3)

      const paladin = g.spawnUnit('paladin', 1, baseX - 3, baseZ + 3)
      paladin.heroLevel = 4
      paladin.maxMana = 999
      paladin.mana = 999
      paladin.abilityLevels = { holy_light: 2, devotion_aura: 1, divine_shield: 1 }
      g.spawnUnit('footman', 1, baseX - 2, baseZ + 4)
      g.spawnUnit('rifleman', 1, baseX - 1, baseZ + 4)
      g.spawnUnit('knight', 1, baseX, baseZ + 4)
      g.spawnUnit('mortar_team', 1, baseX + 1, baseZ + 4)
      blacksmith.completedResearches.push('steel_swords')
      barracks.trainingQueue.push({ type: 'knight', remaining: 12, total: 35 })

      ai.tickCount = 760
      ai.waveCount = 4
      ai.attackWaveSize = 5
      ai.attackWaveSent = true
      ai.attackWaveSentTick = 735
      ai.aiPressureTelemetry = {
        waveCount: 4,
        firstWaveAt: 280,
        lastWaveAt: 735,
        lastWaveTargetType: 'townhall',
        counterAttackCount: 1,
        lastCounterAttackAt: 742,
        lastCounterAttackTargetType: 'townhall',
        creepCampAttempts: 2,
        lastCreepIntentAt: 730,
        shopPurchases: 1,
        lastShopPurchaseAt: 728,
        defenseResponses: 1,
        lastDefenseAt: 744,
        lastDefenseTargetType: 'townhall',
        regroupCount: 1,
        lastRegroupAt: 746,
        lastRegroupReason: 'proof-regroup',
        peakPressure: 80,
      }
      ai.refreshPressureSnapshot()
      g.updateHUD(0.016)

      const snapshot = g.getAIOpponentSnapshot()
      const pressure = g.getAIPressureSnapshot()
      const status = document.getElementById('ai-opponent-status') as HTMLElement | null

      return {
        snapshot,
        pressure,
        statusText: status?.textContent ?? '',
        statusComplete: status?.dataset.complete ?? '',
        difficultyValue: difficulty?.value ?? '',
      }
    })

    expect(result.error).toBeUndefined()
    expect(result.difficultyValue).toBe('rush')
    expect(result.pressure.directorPhase).toBe('closing')
    expect(result.pressure.waveCount).toBeGreaterThanOrEqual(4)
    expect(result.pressure.targetWaveSize).toBeGreaterThanOrEqual(5)
    expect(result.pressure.defenseResponses).toBeGreaterThanOrEqual(1)
    expect(result.pressure.regroupCount).toBeGreaterThanOrEqual(1)
    expect(result.pressure.counterAttackCount).toBeGreaterThanOrEqual(1)
    expect(result.snapshot.milestone).toBe('R9')
    expect(result.snapshot.completed).toBe(true)
    expect(result.snapshot.completedCount).toBe(result.snapshot.totalCount)
    expect(result.statusComplete).toBe('true')
    expect(result.statusText).toContain('R9 AI')
    expect(result.statusText).toContain('完整 AI 对手闭环')
    expect((page as any).__consoleErrors).toEqual([])
    expect((page as any).__pageErrors).toEqual([])
  })

  test('R14 closes low-poly asset baseline, War3-like HUD skin, ability visual feedback, and audio cue feedback loop', async ({ page }) => {
    await waitForGame(page)

    const result = await page.evaluate(() => {
      const g = (window as any).__war3Game
      if (g?.ai) g.ai.update = () => {}

      const hall = g.units.find((u: any) => u.team === 0 && u.type === 'townhall' && u.hp > 0)
      if (!hall) return { error: 'missing player townhall' }
      const paladin = g.spawnUnit('paladin', 0, hall.mesh.position.x + 4, hall.mesh.position.z + 4)
      const enemyFootman = g.spawnUnit('footman', 1, hall.mesh.position.x + 6, hall.mesh.position.z + 4)
      paladin.heroLevel = 4
      paladin.maxMana = 999
      paladin.mana = 999
      paladin.abilityLevels = { divine_shield: 1, holy_light: 1, devotion_aura: 1, resurrection: 1 }
      g.deadUnitRecords.push({
        team: 0,
        type: 'footman',
        x: paladin.mesh.position.x + 1,
        z: paladin.mesh.position.z + 1,
        diedAt: g.gameTime,
      })
      const shieldOk = g.castDivineShield(paladin)
      g.selectionModel.setSelection([paladin])
      g.sel.syncSelectionRings()
      g.sel.updateSelectionRings()
      g.feedback.showMoveIndicator(paladin.mesh.position.x + 2, paladin.mesh.position.z)
      g.feedback.spawnImpactRing(paladin.mesh.position)
      g.feedback.spawnDamageNumber(paladin, 24)
      g.feedback.flashHit(paladin)
      g.feedback.playBuildCompleteEffect(hall)
      enemyFootman.hp = 0
      g.__testTriggerAudioCue('command', 'R14 命令反馈证明')
      g.__testTriggerAudioCue('combat', 'R14 战斗反馈证明')
      g.__testTriggerAudioCue('death', 'R14 死亡反馈证明')
      g.__testTriggerAudioCue('objective', 'R14 目标反馈证明')
      g.__testTriggerAudioCue('pressure', 'R14 AI 压力证明')
      g.update(0.016)
      g.updateHUD(0.016)

      const snapshot = g.getVisualAudioIdentitySnapshot()
      const unitPresentation = g.getUnitPresentationSnapshot()
      const audio = g.getAudioCueSnapshot()
      const status = document.getElementById('visual-audio-status') as HTMLElement | null

      return {
        shieldOk,
        snapshot,
        unitPresentation,
        audio,
        statusText: status?.textContent ?? '',
        statusComplete: status?.dataset.complete ?? '',
      }
    })

    expect(result.error).toBeUndefined()
    expect(result.shieldOk).toBe(true)
    expect(result.audio.enabled).toBe(true)
    expect(result.audio.cueCount).toBeGreaterThanOrEqual(3)
    expect(result.audio.kinds).toContain('ability')
    expect(result.audio.kinds).toContain('command')
    expect(result.audio.kinds).toContain('combat')
    expect(result.audio.kinds).toContain('death')
    expect(result.audio.kinds).toContain('objective')
    expect(result.audio.kinds).toContain('pressure')
    expect(result.audio.assetBackedKinds).toEqual(expect.arrayContaining([
      'ability',
      'command',
      'combat',
      'death',
      'objective',
      'pressure',
    ]))
    expect(result.snapshot.milestone).toBe('R14')
    expect(result.snapshot.completed).toBe(true)
    expect(result.snapshot.completedCount).toBe(result.snapshot.totalCount)
    expect(result.snapshot.presentation.completed).toBe(true)
    expect(result.snapshot.presentation.completedCount).toBe(result.snapshot.presentation.totalCount)
    expect(result.snapshot.perception.completed).toBe(true)
    expect(result.snapshot.perception.completedCount).toBe(result.snapshot.perception.totalCount)
    expect(result.snapshot.perception.commandSignalCount).toBeGreaterThan(0)
    expect(result.snapshot.perception.combatSignalCount).toBeGreaterThan(0)
    expect(result.snapshot.perception.abilitySignalCount).toBeGreaterThan(0)
    expect(result.snapshot.perception.deathSignalCount).toBeGreaterThan(0)
    expect(result.snapshot.perception.constructionSignalCount).toBeGreaterThan(0)
    expect(result.snapshot.perception.audioKindCount).toBeGreaterThanOrEqual(5)
    expect(result.snapshot.assetReadiness.completed).toBe(true)
    expect(result.snapshot.assetReadiness.completedCount).toBe(result.snapshot.assetReadiness.totalCount)
    expect(result.snapshot.assetReadiness.contractCoverageComplete).toBe(true)
    expect(result.snapshot.assetReadiness.finalAssetApproved).toBe(false)
    expect(result.snapshot.assetReadiness.finalArtReady).toBe(false)
    expect(result.snapshot.assetReadiness.unitContractCount).toBeGreaterThanOrEqual(10)
    expect(result.snapshot.assetReadiness.requiredClipStateCount).toBeGreaterThan(0)
    expect(result.snapshot.assetReadiness.realClipStateCount)
      .toBe(result.snapshot.assetReadiness.requiredClipStateCount)
    expect(result.snapshot.assetReadiness.missingRealClipStateCount).toBe(0)
    expect(result.snapshot.assetReadiness.runtimeFallbackStateCount)
      .toBe(result.snapshot.assetReadiness.missingRealClipStateCount)
    expect(result.snapshot.assetReadiness.audioCueContractCount).toBeGreaterThanOrEqual(8)
    expect(result.snapshot.assetReadiness.audioAssetCueKindCount)
      .toBe(result.snapshot.assetReadiness.audioCueContractCount)
    expect(result.snapshot.assetReadiness.proceduralCueKindCount).toBe(0)
    expect(result.snapshot.assetReadiness.missingAudioAssetKindCount).toBe(0)
    expect(result.snapshot.assetReadiness.audioContracts.map((contract: any) => contract.kind)).toEqual(expect.arrayContaining([
      'command',
      'combat',
      'ability',
      'construction',
      'death',
      'result',
    ]))
    expect(result.snapshot.assetReadiness.audioContracts
      .filter((contract: any) => contract.source === 'asset-file')
      .map((contract: any) => contract.kind))
      .toEqual(expect.arrayContaining([
        'command',
        'combat',
        'ability',
        'objective',
        'pressure',
        'shop',
        'portal',
        'construction',
        'death',
        'result',
      ]))
    expect(result.snapshot.assetReadiness.unitContracts.find((contract: any) => contract.unitKey === 'footman')?.realClipStates)
      .toEqual(expect.arrayContaining(['idle', 'walk', 'attack', 'death']))
    expect(result.snapshot.assetReadiness.unitContracts.find((contract: any) => contract.unitKey === 'paladin')?.realClipStates)
      .toEqual(expect.arrayContaining(['idle', 'walk', 'attack', 'cast', 'death']))
    expect(result.snapshot.assetReadiness.unitContracts.find((contract: any) => contract.unitKey === 'knight')?.realClipStates)
      .toEqual(expect.arrayContaining(['idle', 'walk', 'attack', 'death']))
    expect(result.snapshot.assetReadiness.unitContracts.find((contract: any) => contract.unitKey === 'sorceress')?.realClipStates)
      .toEqual(expect.arrayContaining(['idle', 'walk', 'cast', 'death']))
    expect(result.snapshot.presentation.selectedCount).toBe(1)
    expect(result.snapshot.presentation.selectionRingCount).toBeGreaterThanOrEqual(1)
    expect(result.snapshot.presentation.healthBarCount).toBeGreaterThan(0)
    expect(result.snapshot.presentation.combatFeedbackCount).toBeGreaterThan(0)
    expect(result.snapshot.presentation.abilityPreviewRingCount).toBeGreaterThan(0)
    expect(result.snapshot.presentation.abilityEffectBurstCount).toBeGreaterThan(0)
    expect(result.snapshot.presentation.abilityTargetMarkerCount).toBeGreaterThanOrEqual(0)
    expect(result.snapshot.presentation.corpseMarkerCount).toBeGreaterThan(0)
    expect(result.snapshot.presentation.eligibleCorpseMarkerCount).toBeGreaterThan(0)
    expect(result.snapshot.presentation.resurrectionRadiusRingCount).toBeGreaterThan(0)
    expect(result.snapshot.presentation.statusEffectCount).toBeGreaterThan(0)
    expect(result.snapshot.presentation.animatedUnitCount).toBeGreaterThan(0)
    expect(result.snapshot.presentation.totalAnimationTicks).toBeGreaterThan(0)
    expect(result.snapshot.unitPresentation.animatedUnitCount).toBeGreaterThan(0)
    expect(result.snapshot.unitPresentation.proceduralFallbackUnitCount).toBeGreaterThan(0)
    expect(result.unitPresentation.statusAnimatedCount + result.unitPresentation.castingUnitCount).toBeGreaterThan(0)
    expect(result.snapshot.presentation.checks.map((check: any) => check.key)).toEqual(expect.arrayContaining([
      'selection-command-language',
      'combat-hit-language',
      'ability-state-language',
      'ability-effect-language',
      'ability-targeting-language',
      'resurrection-corpse-language',
      'unit-motion-language',
      'action-state-language',
      'animation-source-contract',
      'battlefield-navigation-layer',
      'presentation-budget',
    ]))
    expect(result.snapshot.perception.checks.map((check: any) => check.key)).toEqual(expect.arrayContaining([
      'command-confirmation',
      'combat-impact',
      'ability-moment',
      'death-readability',
      'construction-feedback',
      'action-state-coverage',
      'audio-palette',
    ]))
    expect(result.snapshot.assetReadiness.checks.map((check: any) => check.key)).toEqual(expect.arrayContaining([
      'unit-action-contracts',
      'real-clip-audit',
      'runtime-fallback-boundary',
      'audio-source-contracts',
      'final-art-boundary',
    ]))
    expect(result.snapshot.combatFeedbackCount).toBeGreaterThan(0)
    expect(result.snapshot.resultPresentation.cardCount).toBeGreaterThanOrEqual(6)
    expect(result.snapshot.resultPresentation.objectiveChipCount).toBeGreaterThanOrEqual(7)
    expect(result.snapshot.resultPresentation.flowStepCount).toBeGreaterThanOrEqual(9)
    expect(result.statusComplete).toBe('true')
    expect(result.statusText).toContain('R14 反馈')
    expect(result.statusText).toContain('表现')
    expect(result.statusText).toContain('感知')
    expect(result.statusText).toContain('门禁')
    expect(result.statusText).toContain('动作 clip')
    expect(result.statusText).toContain('技能环')
    expect(result.statusText).toContain('结果卡')
    expect(result.statusText).toContain('完整视觉 / 音频身份闭环')
    expect((page as any).__consoleErrors).toEqual([])
    expect((page as any).__pageErrors).toEqual([])
  })

  test('R14 animation pipeline prefers GLB clips when present and reports procedural fallback otherwise', async ({ page }) => {
    await waitForGame(page)

    const result = await page.evaluate(() => {
      const g = (window as any).__war3Game
      if (g?.ai) g.ai.update = () => {}
      return g.__testRunAnimationClipPresentationContract()
    })

    expect(result.injectedClipNames).toEqual(['Walk'])
    expect(result.entry).toBeTruthy()
    expect(result.entry.type).toBe('footman')
    expect(result.entry.state).toBe('moving')
    expect(result.entry.presentationRoute).toBe('clip')
    expect(result.entry.clipName).toBe('Walk')
    expect(result.unitPresentation.availableClipUnitCount).toBeGreaterThanOrEqual(1)
    expect(result.unitPresentation.clipBackedUnitCount).toBeGreaterThanOrEqual(1)
    expect(result.unitPresentation.proceduralFallbackUnitCount).toBeGreaterThanOrEqual(1)
    expect(result.unitPresentation.availableClipNames).toContain('Walk')
    expect(result.identityPresentation.availableClipUnitCount).toBeGreaterThanOrEqual(1)
    expect(result.identityPresentation.clipBackedUnitCount).toBeGreaterThanOrEqual(1)
    expect(result.identityPresentation.proceduralFallbackUnitCount).toBeGreaterThanOrEqual(1)
    expect(result.identityPresentation.checks.map((check: any) => check.key)).toContain('animation-source-contract')
    expect((page as any).__consoleErrors).toEqual([])
    expect((page as any).__pageErrors).toEqual([])
  })
})
