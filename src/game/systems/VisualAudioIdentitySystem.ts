import { getAllAssetEntries } from '../AssetCatalog'
import { BUILDINGS, ITEMS, UNITS, UnitState } from '../GameData'
import type { AssetStatus } from '../AssetLoader'
import type { FeedbackEffectSnapshot } from '../FeedbackEffects'
import type { Unit } from '../UnitTypes'
import type { AudioCueKind, AudioCueSnapshot } from './AudioCueSystem'
import {
  buildBattlefieldPerceptionSnapshot,
} from './BattlefieldPerceptionSystem'
import type {
  BattlefieldPerceptionSnapshot,
} from './BattlefieldPerceptionSystem'
import {
  buildPresentationAssetReadinessSnapshot,
} from './PresentationAssetReadinessSystem'
import type {
  PresentationAssetReadinessSnapshot,
} from './PresentationAssetReadinessSystem'
import type {
  HeroAbilityPresentationSnapshot,
} from './HeroAbilityPresentationSystem'
import type { ResultPresentationSnapshot } from './ResultPresentationSystem'
import type { ResurrectionReadabilitySnapshot } from './ResurrectionReadabilitySystem'
import type { UnitPresentationSnapshot } from './UnitPresentationSystem'

export interface VisualAudioIdentityCheck {
  key: string
  label: string
  completed: boolean
  detail: string
}

export interface VisualAudioIdentitySnapshot {
  milestone: 'R14'
  completed: boolean
  completedCount: number
  totalCount: number
  verdict: string
  assetCount: number
  loadedAssetCount: number
  feedbackCueCount: number
  presentationCheckCount: number
  perceptionCheckCount: number
  assetReadinessCheckCount: number
  activeEffectCount: number
  combatFeedbackCount: number
  unitPresentation: UnitPresentationSnapshot
  presentation: BattlefieldPresentationSnapshot
  perception: BattlefieldPerceptionSnapshot
  assetReadiness: PresentationAssetReadinessSnapshot
  resultPresentation: ResultPresentationSnapshot
  checks: VisualAudioIdentityCheck[]
}

export interface BattlefieldPresentationCheck {
  key: string
  label: string
  completed: boolean
  detail: string
}

export interface BattlefieldPresentationSnapshot {
  completed: boolean
  completedCount: number
  totalCount: number
  verdict: string
  selectedCount: number
  selectionRingCount: number
  healthBarCount: number
  activeEffectCount: number
  combatFeedbackCount: number
  abilityPreviewRingCount: number
  abilityEffectBurstCount: number
  abilityTargetMarkerCount: number
  abilityValidTargetMarkerCount: number
  abilityInvalidTargetMarkerCount: number
  corpseMarkerCount: number
  eligibleCorpseMarkerCount: number
  resurrectionRadiusRingCount: number
  statusEffectCount: number
  animatedUnitCount: number
  availableClipUnitCount: number
  clipBackedUnitCount: number
  proceduralFallbackUnitCount: number
  movingUnitCount: number
  attackingUnitCount: number
  castingUnitCount: number
  totalAnimationTicks: number
  unitPresentation: UnitPresentationSnapshot
  checks: BattlefieldPresentationCheck[]
}

const RUNTIME_ASSET_KEYS = [
  'worker',
  'footman',
  'rifleman',
  'mortar_team',
  'priest',
  'sorceress',
  'knight',
  'paladin',
  'archmage',
  'mountain_king',
  'water_elemental',
  'forest_troll',
  'ogre_warrior',
  'townhall',
  'barracks',
  'farm',
  'tower',
  'goldmine',
  'altar_of_kings',
  'arcane_vault',
  'arcane_sanctum',
  'workshop',
  'lumber_mill',
  'keep',
  'castle',
  'pine_tree',
  'tome_of_experience',
  'healing_potion',
  'mana_potion',
  'boots_of_speed',
] as const

function hasDom(id: string) {
  return !!document.getElementById(id)
}

function buildBattlefieldPresentationSnapshot(input: {
  units: readonly Unit[]
  audio: AudioCueSnapshot
  feedback: FeedbackEffectSnapshot
  unitPresentation: UnitPresentationSnapshot
  heroAbilityPresentation: HeroAbilityPresentationSnapshot
  resurrectionReadability: ResurrectionReadabilitySnapshot
  resultPresentation: ResultPresentationSnapshot
  selectedCount: number
  selectionRingCount: number
  healthBarCount: number
  minimapReady: boolean
  objectiveRadarReady: boolean
  fogReady: boolean
}): BattlefieldPresentationSnapshot {
  const aliveUnits = input.units.filter(unit => unit.hp > 0 && !unit.isDead)
  const combatUnits = aliveUnits.filter(unit =>
    unit.attackTarget ||
    unit.state === UnitState.Attacking ||
    unit.state === UnitState.AttackMove,
  ).length
  const statusEffectCount = aliveUnits.filter(unit =>
    unit.divineShieldUntil > 0 ||
    unit.avatarUntil > 0 ||
    unit.stunUntil > 0 ||
    unit.slowUntil > 0 ||
    unit.summonExpireAt > 0 ||
    unit.rallyCallBoostUntil > 0 ||
    unit.defendActive,
  ).length
  const heroFeedbackCount = aliveUnits.filter(unit =>
    !!UNITS[unit.type]?.isHero &&
    !!unit.abilityFeedbackText &&
    unit.abilityFeedbackUntil > 0,
  ).length
  const activeEffectCount = input.feedback.activeMoveIndicators +
    input.feedback.activeImpactRings +
    input.feedback.activeQueueIndicators +
    input.feedback.activeAbilityEffectBursts +
    input.feedback.activeAbilityPreviewRings +
    input.feedback.activeAbilityTargetMarkers +
    input.feedback.activeCorpseMarkers +
    input.feedback.activeResurrectionRadiusRings
  const combatFeedbackCount = input.feedback.totalImpactRings +
    input.feedback.totalDamageNumbers +
    input.feedback.totalHitFlashes
  const commandFeedbackCount = input.feedback.totalMoveIndicators +
    input.feedback.totalSelectionFlashes
  const hasResurrectionContext = input.resurrectionReadability.selectedPaladinCount > 0 &&
    input.resurrectionReadability.friendlyCorpseCount > 0

  const checks: BattlefieldPresentationCheck[] = [
    {
      key: 'selection-command-language',
      label: '选中与命令反馈',
      completed: input.selectedCount > 0 &&
        input.selectionRingCount >= input.selectedCount &&
        commandFeedbackCount > 0,
      detail: `选中 ${input.selectedCount}，选择环 ${input.selectionRingCount}，命令反馈 ${commandFeedbackCount}`,
    },
    {
      key: 'combat-hit-language',
      label: '攻击命中反馈',
      completed: input.healthBarCount > 0 &&
        combatFeedbackCount > 0 &&
        (combatUnits > 0 || input.feedback.totalImpactRings > 0),
      detail: `血条 ${input.healthBarCount}，命中反馈 ${combatFeedbackCount}，交战单位 ${combatUnits}`,
    },
    {
      key: 'ability-state-language',
      label: '技能状态反馈',
      completed: (statusEffectCount > 0 || heroFeedbackCount > 0) &&
        input.audio.kinds.includes('ability') &&
        input.feedback.totalAbilityEffectBursts > 0,
      detail: `状态 ${statusEffectCount}，英雄提示 ${heroFeedbackCount}，技能特效 ${input.feedback.totalAbilityEffectBursts}，ability cue ${input.audio.kinds.includes('ability') ? '有' : '无'}`,
    },
    {
      key: 'ability-effect-language',
      label: '技能瞬间特效',
      completed: input.feedback.totalAbilityEffectBursts > 0 &&
        input.feedback.totalAbilityEffectBursts >= input.audio.kinds.filter(kind => kind === 'ability').length,
      detail: `技能爆发 ${input.feedback.activeAbilityEffectBursts}/${input.feedback.totalAbilityEffectBursts}`,
    },
    {
      key: 'ability-targeting-language',
      label: '施法预览语言',
      completed: input.heroAbilityPresentation.rangePreviewCount > 0 &&
        input.heroAbilityPresentation.cursorHintCount > 0 &&
        input.heroAbilityPresentation.activeTargetReasonCount >= 0,
      detail: `距离 ${input.heroAbilityPresentation.rangePreviewCount}，范围 ${input.heroAbilityPresentation.areaPreviewCount}，光标 ${input.heroAbilityPresentation.cursorHintCount}，主动目标 ${input.heroAbilityPresentation.activeTargetLegalCount}/${input.heroAbilityPresentation.activeTargetInvalidCount}，目标标记 ${input.feedback.activeAbilityValidTargetMarkers}/${input.feedback.activeAbilityInvalidTargetMarkers}`,
    },
    {
      key: 'resurrection-corpse-language',
      label: '复活尸体语言',
      completed: !hasResurrectionContext ||
        (input.resurrectionReadability.completed &&
          input.feedback.activeCorpseMarkers >= input.resurrectionReadability.visibleCorpseMarkerCount &&
          input.feedback.activeResurrectionRadiusRings >= input.resurrectionReadability.resurrectionRadiusCount),
      detail: `尸体 marker ${input.feedback.activeCorpseMarkers}/${input.resurrectionReadability.visibleCorpseMarkerCount}，可复活 ${input.feedback.activeEligibleCorpseMarkers}/${input.resurrectionReadability.visibleEligibleCorpseMarkerCount}，范围 ${input.feedback.activeResurrectionRadiusRings}/${input.resurrectionReadability.resurrectionRadiusCount}`,
    },
    {
      key: 'unit-motion-language',
      label: '单位动作语言',
      completed: input.unitPresentation.aliveUnitCount > 0 &&
        input.unitPresentation.animatedUnitCount > 0 &&
        input.unitPresentation.totalAnimationTicks > 0,
      detail: `可动单位 ${input.unitPresentation.animatedUnitCount}/${input.unitPresentation.aliveUnitCount}，tick ${input.unitPresentation.totalAnimationTicks}`,
    },
    {
      key: 'action-state-language',
      label: '操作状态可读',
      completed: input.unitPresentation.movingUnitCount > 0 ||
        input.unitPresentation.attackingUnitCount > 0 ||
        input.unitPresentation.castingUnitCount > 0 ||
        input.unitPresentation.statusAnimatedCount > 0,
      detail: `移动 ${input.unitPresentation.movingUnitCount}，攻击 ${input.unitPresentation.attackingUnitCount}，施法 ${input.unitPresentation.castingUnitCount}，状态 ${input.unitPresentation.statusAnimatedCount}`,
    },
    {
      key: 'animation-source-contract',
      label: '动作来源可观测',
      completed: input.unitPresentation.animatedUnitCount > 0 &&
        input.unitPresentation.clipBackedUnitCount + input.unitPresentation.proceduralFallbackUnitCount >=
          input.unitPresentation.animatedUnitCount,
      detail: `clip ${input.unitPresentation.clipBackedUnitCount}，fallback ${input.unitPresentation.proceduralFallbackUnitCount}，可用 clips 单位 ${input.unitPresentation.availableClipUnitCount}`,
    },
    {
      key: 'battlefield-navigation-layer',
      label: '战场导航层',
      completed: input.minimapReady &&
        input.objectiveRadarReady &&
        input.fogReady &&
        hasDom('objective-tracker'),
      detail: `小地图 ${input.minimapReady ? '有' : '无'}，雷达 ${input.objectiveRadarReady ? '有' : '无'}，Fog ${input.fogReady ? '有' : '无'}`,
    },
    {
      key: 'presentation-budget',
      label: '表现预算可观测',
      completed: input.feedback.totalMoveIndicators >= 0 &&
        input.feedback.totalImpactRings >= 0 &&
        input.healthBarCount <= Math.max(1, aliveUnits.length + 4),
      detail: `活动特效 ${activeEffectCount}，累计移动 ${input.feedback.totalMoveIndicators}，累计命中 ${input.feedback.totalImpactRings}，技能爆发 ${input.feedback.totalAbilityEffectBursts}，技能预览 ${input.feedback.totalAbilityPreviewRingsShown}，目标标记 ${input.feedback.totalAbilityTargetMarkersShown}，尸体刷新 ${input.feedback.totalCorpseMarkerRefreshes}`,
    },
  ]

  const completedCount = checks.filter(check => check.completed).length
  const completed = completedCount === checks.length
  return {
    completed,
    completedCount,
    totalCount: checks.length,
    verdict: completed ? '战场表现反馈闭环' : '战场表现反馈仍有缺口',
    selectedCount: input.selectedCount,
    selectionRingCount: input.selectionRingCount,
    healthBarCount: input.healthBarCount,
    activeEffectCount,
    combatFeedbackCount,
    abilityPreviewRingCount: input.feedback.activeAbilityPreviewRings,
    abilityEffectBurstCount: input.feedback.activeAbilityEffectBursts,
    abilityTargetMarkerCount: input.feedback.activeAbilityTargetMarkers,
    abilityValidTargetMarkerCount: input.feedback.activeAbilityValidTargetMarkers,
    abilityInvalidTargetMarkerCount: input.feedback.activeAbilityInvalidTargetMarkers,
    corpseMarkerCount: input.feedback.activeCorpseMarkers,
    eligibleCorpseMarkerCount: input.feedback.activeEligibleCorpseMarkers,
    resurrectionRadiusRingCount: input.feedback.activeResurrectionRadiusRings,
    statusEffectCount,
    animatedUnitCount: input.unitPresentation.animatedUnitCount,
    availableClipUnitCount: input.unitPresentation.availableClipUnitCount,
    clipBackedUnitCount: input.unitPresentation.clipBackedUnitCount,
    proceduralFallbackUnitCount: input.unitPresentation.proceduralFallbackUnitCount,
    movingUnitCount: input.unitPresentation.movingUnitCount,
    attackingUnitCount: input.unitPresentation.attackingUnitCount,
    castingUnitCount: input.unitPresentation.castingUnitCount,
    totalAnimationTicks: input.unitPresentation.totalAnimationTicks,
    unitPresentation: input.unitPresentation,
    checks,
  }
}

export function buildVisualAudioIdentitySnapshot(input: {
  units: readonly Unit[]
  audio: AudioCueSnapshot
  getAssetStatus: (key: string) => AssetStatus
  getAssetAnimationClipNames: (key: string) => readonly string[]
  getAudioCueAssetPath?: (kind: AudioCueKind) => string | null
  feedback: FeedbackEffectSnapshot
  unitPresentation: UnitPresentationSnapshot
  heroAbilityPresentation: HeroAbilityPresentationSnapshot
  resurrectionReadability: ResurrectionReadabilitySnapshot
  resultPresentation: ResultPresentationSnapshot
  selectedCount: number
  selectionRingCount: number
  healthBarCount: number
  deadRecordCount: number
  minimapReady: boolean
  objectiveRadarReady: boolean
  fogReady: boolean
}): VisualAudioIdentitySnapshot {
  const catalog = getAllAssetEntries()
  const catalogKeys = new Set(catalog.map(entry => entry.key))
  const runtimeAssetsPresent = RUNTIME_ASSET_KEYS.filter(key => catalogKeys.has(key)).length
  const loadedAssetCount = RUNTIME_ASSET_KEYS.filter(key => input.getAssetStatus(key) === 'loaded').length
  const heroFeedback = input.units.filter(unit =>
    !!UNITS[unit.type]?.isHero &&
    !!unit.abilityFeedbackText &&
    unit.abilityFeedbackUntil > 0,
  ).length
  const worldFeedbackObjects = input.units.filter(unit =>
    unit.divineShieldUntil > 0 ||
    unit.avatarUntil > 0 ||
    unit.stunUntil > 0 ||
    unit.slowUntil > 0 ||
    unit.summonExpireAt > 0,
  ).length
  const purchasableItems = Object.values(ITEMS).filter(item => item.purchasable).length
  const completedBuildings = input.units.filter(unit =>
    unit.isBuilding &&
    unit.hp > 0 &&
    unit.buildProgress >= 1 &&
    !!BUILDINGS[unit.type],
  ).length
  const presentation = buildBattlefieldPresentationSnapshot({
    units: input.units,
    audio: input.audio,
    feedback: input.feedback,
    unitPresentation: input.unitPresentation,
    heroAbilityPresentation: input.heroAbilityPresentation,
    resurrectionReadability: input.resurrectionReadability,
    resultPresentation: input.resultPresentation,
    selectedCount: input.selectedCount,
    selectionRingCount: input.selectionRingCount,
    healthBarCount: input.healthBarCount,
    minimapReady: input.minimapReady,
    objectiveRadarReady: input.objectiveRadarReady,
    fogReady: input.fogReady,
  })
  const perception = buildBattlefieldPerceptionSnapshot({
    units: input.units,
    audio: input.audio,
    feedback: input.feedback,
    unitPresentation: input.unitPresentation,
    selectedCount: input.selectedCount,
    selectionRingCount: input.selectionRingCount,
    healthBarCount: input.healthBarCount,
    deadRecordCount: input.deadRecordCount,
  })
  const assetReadiness = buildPresentationAssetReadinessSnapshot({
    getAssetAnimationClipNames: input.getAssetAnimationClipNames,
    getAudioCueAssetPath: input.getAudioCueAssetPath,
  })

  const checks: VisualAudioIdentityCheck[] = [
    {
      key: 'asset-baseline',
      label: '合法低模资产基线',
      completed: runtimeAssetsPresent === RUNTIME_ASSET_KEYS.length && catalog.length >= RUNTIME_ASSET_KEYS.length,
      detail: `catalog ${runtimeAssetsPresent}/${RUNTIME_ASSET_KEYS.length}，已加载 ${loadedAssetCount}`,
    },
    {
      key: 'readable-categories',
      label: '单位/建筑/物品类别',
      completed: ['paladin', 'archmage', 'mountain_king', 'arcane_vault', 'forest_troll', 'healing_potion']
        .every(key => catalogKeys.has(key)),
      detail: `建筑 ${completedBuildings}，可购道具 ${purchasableItems}`,
    },
    {
      key: 'hud-skin',
      label: 'War3-like HUD 皮肤',
      completed: hasDom('hud-top') &&
        hasDom('objective-tracker') &&
        hasDom('map-objective-radar') &&
        hasDom('human-route-panel') &&
        hasDom('milestone-status-panel'),
      detail: '资源栏、目标、战场雷达、人族路线、里程碑状态都在同一 HUD 语言',
    },
    {
      key: 'ability-visual-feedback',
      label: '技能视觉反馈',
      completed: heroFeedback > 0 || worldFeedbackObjects > 0,
      detail: `英雄反馈 ${heroFeedback}，战场状态 ${worldFeedbackObjects}`,
    },
    {
      key: 'audio-cue-bus',
      label: '音效 cue 总线',
      completed: input.audio.enabled && input.audio.cueCount > 0,
      detail: `cue ${input.audio.cueCount}，类型 ${input.audio.kinds.join('/') || '无'}`,
    },
    {
      key: 'result-and-pressure-cues',
      label: '目标 / 压力 / 结果反馈',
      completed: input.audio.kinds.includes('objective') ||
        input.audio.kinds.includes('pressure') ||
        input.audio.kinds.includes('result'),
      detail: input.audio.lastCue ? `最近 ${input.audio.lastCue.label}` : '尚未触发 cue',
    },
    {
      key: 'result-visual-recap',
      label: '结果视觉复盘',
      completed: !input.resultPresentation.resultActive || input.resultPresentation.completed,
      detail: `结果 ${input.resultPresentation.resultLabel}，卡片 ${input.resultPresentation.cardCount}，目标 ${input.resultPresentation.completedObjectiveCount}/${input.resultPresentation.totalObjectiveCount}，流程 ${input.resultPresentation.flowCompletedCount}/${input.resultPresentation.flowTotalCount}`,
    },
  ]

  const completedCount = checks.filter(check => check.completed).length +
    presentation.completedCount +
    perception.completedCount +
    assetReadiness.completedCount
  const totalCount = checks.length +
    presentation.totalCount +
    perception.totalCount +
    assetReadiness.totalCount
  const completed = completedCount === totalCount
  return {
    milestone: 'R14',
    completed,
    completedCount,
    totalCount,
    verdict: completed ? '完整视觉 / 音频身份闭环' : '视觉 / 音频身份仍有缺口',
    assetCount: catalog.length,
    loadedAssetCount,
    feedbackCueCount: input.audio.cueCount,
    presentationCheckCount: presentation.completedCount,
    perceptionCheckCount: perception.completedCount,
    assetReadinessCheckCount: assetReadiness.completedCount,
    activeEffectCount: presentation.activeEffectCount,
    combatFeedbackCount: presentation.combatFeedbackCount,
    unitPresentation: input.unitPresentation,
    presentation,
    perception,
    assetReadiness,
    resultPresentation: input.resultPresentation,
    checks,
  }
}
