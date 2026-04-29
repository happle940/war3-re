import type { AIOpponentSnapshot } from './AIOpponentMilestoneSystem'
import type { BattlefieldReadabilitySnapshot } from './MapObjectiveSystem'
import type { FoundationMilestoneSnapshot } from './FoundationMilestoneSystem'
import type { HeroMilestoneSnapshot } from './HeroMilestoneSystem'
import type { HumanRouteSnapshot } from './HumanRouteSystem'
import type { PlaytestMilestoneSignal } from './PlaytestReadinessSystem'
import type { SessionShellSnapshot } from './SessionMilestoneSystem'
import type { SkirmishCompletionSnapshot } from './SkirmishProgressSystem'
import type { VisualAudioIdentitySnapshot } from './VisualAudioIdentitySystem'
import type { War3IdentitySnapshot } from './War3IdentitySystem'

export interface RuntimeMilestoneSnapshots {
  foundation: FoundationMilestoneSnapshot
  r7: HumanRouteSnapshot
  r8: HeroMilestoneSnapshot
  r9: AIOpponentSnapshot
  r10: SkirmishCompletionSnapshot
  r11: BattlefieldReadabilitySnapshot
  r12: War3IdentitySnapshot
  r13: SessionShellSnapshot
  r14: VisualAudioIdentitySnapshot
}

export function buildPlaytestMilestoneSignals(
  snapshots: RuntimeMilestoneSnapshots,
): PlaytestMilestoneSignal[] {
  const { foundation, r7, r8, r9, r10, r11, r12, r13, r14 } = snapshots

  return [
    {
      key: 'R1-R6',
      label: '基础体验',
      completed: foundation.completed,
      summary: `${foundation.completedCount}/${foundation.totalCount} · ${foundation.verdict}`,
    },
    ...foundation.stages.map(stage => ({
      key: stage.key,
      label: stage.label,
      completed: stage.completed,
      summary: `${stage.completedCount}/${stage.totalCount} · ${stage.verdict}`,
    })),
    {
      key: 'R7',
      label: 'Human 路线',
      completed: r7.totalCount > 0,
      summary: `${r7.completedCount}/${r7.totalCount} · ${r7.tier.currentTierLabel} · ${r7.rhythm.phaseLabel} · 角色 ${r7.rhythm.roleCoverageCount}/${r7.rhythm.totalRoleCount} · 混编 ${r7.combat.compositionCoverageCount}/${r7.combat.totalCompositionRoleCount} · 克制 ${r7.combat.counterAdvantageCount}/${r7.combat.counterRuleCount} · 科技 ${r7.upgradeImpact.completedResearchCount}/${r7.upgradeImpact.totalTrackedResearchCount} · 解锁 ${r7.tier.availableUnlockCount}/${r7.tier.totalUnlockCount} · ${r7.verdict}`,
    },
    {
      key: 'R8',
      label: '英雄成长',
      completed: r8.totalCount > 0,
      summary: `${r8.completedCount}/${r8.totalCount} · Lv${r8.maxHeroLevel} · 技能判断 ${r8.tacticalTargetHintCount} · ${r8.verdict}`,
    },
    {
      key: 'R9',
      label: 'AI 推进',
      completed: r9.totalCount > 0,
      summary: `${r9.completedCount}/${r9.totalCount} · ${r9.directorPhase} · ${r9.verdict}`,
    },
    {
      key: 'R10',
      label: '短局闭环',
      completed: r10.totalCount > 0,
      summary: `${r10.completedCount}/${r10.totalCount} · ${r10.verdict}`,
    },
    {
      key: 'R11',
      label: '战场可读性',
      completed: r11.totalCount > 0,
      summary: `${r11.completedCount}/${r11.totalCount} · ${r11.verdict}`,
    },
    {
      key: 'R12',
      label: 'War3 身份',
      completed: r12.totalCount > 0,
      summary: `${r12.completedCount}/${r12.totalCount} · ${r12.verdict}`,
    },
    {
      key: 'R13',
      label: '产品壳层',
      completed: r13.totalCount > 0,
      summary: `${r13.completedCount}/${r13.totalCount} · ${r13.verdict}`,
    },
    {
      key: 'R14',
      label: '视听反馈',
      completed: r14.totalCount > 0,
      summary: `${r14.completedCount}/${r14.totalCount} · 资产 ${r14.loadedAssetCount}/${r14.assetCount} · 表现 ${r14.presentationCheckCount}/${r14.presentation.totalCount} · 感知 ${r14.perceptionCheckCount}/${r14.perception.totalCount} · 门禁 ${r14.assetReadiness.realClipStateCount}/${r14.assetReadiness.requiredClipStateCount}clip ${r14.assetReadiness.audioAssetCueKindCount}/${r14.assetReadiness.audioCueContractCount}音频 · 技能特效 ${r14.presentation.abilityEffectBurstCount} · 结果卡 ${r14.resultPresentation.cardCount}/${r14.resultPresentation.objectiveChipCount}/${r14.resultPresentation.flowStepCount} · 动作 clip ${r14.unitPresentation.clipBackedUnitCount}/fallback ${r14.unitPresentation.proceduralFallbackUnitCount} · ${r14.verdict}`,
    },
  ]
}
