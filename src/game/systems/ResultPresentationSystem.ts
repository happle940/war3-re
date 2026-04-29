import type { Unit } from '../UnitTypes'
import type { AIPressureSnapshot } from './AIPressureSystem'
import { buildHumanCombatProfileSnapshot } from './HumanCombatProfileSystem'
import { buildHumanUpgradeImpactSnapshot } from './HumanUpgradeImpactSystem'
import type { MatchResult } from './MatchOutcomeSystem'
import {
  buildSkirmishCompletionSnapshot,
  countCompletedObjectives,
  formatGameTime,
} from './SkirmishProgressSystem'
import type {
  MatchTelemetry,
  SkirmishFlowStepView,
  SkirmishObjectiveView,
} from './SkirmishProgressSystem'

export type ResultPresentationTone = 'victory' | 'defeat' | 'stall' | 'neutral' | 'warning'

export interface ResultPresentationCard {
  key: string
  label: string
  value: string
  tone: ResultPresentationTone
  detail: string
}

export interface ResultPresentationObjective {
  key: string
  label: string
  icon: string
  completed: boolean
  progressText: string
  tone: string
}

export interface ResultPresentationCheck {
  key: string
  label: string
  completed: boolean
  detail: string
}

export interface ResultPresentationSnapshot {
  resultActive: boolean
  completed: boolean
  completedCount: number
  totalCount: number
  verdict: string
  resultLabel: string
  outcomeTone: ResultPresentationTone
  completedObjectiveCount: number
  totalObjectiveCount: number
  flowCompletedCount: number
  flowTotalCount: number
  cardCount: number
  objectiveChipCount: number
  flowStepCount: number
  combatReasonCount: number
  upgradeImpactCount: number
  cards: ResultPresentationCard[]
  objectives: ResultPresentationObjective[]
  flowSteps: SkirmishFlowStepView[]
  checks: ResultPresentationCheck[]
}

function resultLabel(result: MatchResult | null) {
  if (result === 'victory') return '胜利'
  if (result === 'defeat') return '失败'
  if (result === 'stall') return '僵局'
  return '未结束'
}

function toneForResult(result: MatchResult | null): ResultPresentationTone {
  if (result === 'victory' || result === 'defeat' || result === 'stall') return result
  return 'neutral'
}

function countAliveByTeam(units: readonly Unit[], team: number) {
  const alive = units.filter(unit => unit.team === team && unit.hp > 0 && !unit.isDead)
  return {
    units: alive.filter(unit => !unit.isBuilding).length,
    buildings: alive.filter(unit => unit.isBuilding).length,
  }
}

export function buildResultPresentationSnapshot(input: {
  result: MatchResult | null
  gameTime: number
  units: readonly Unit[]
  telemetry: MatchTelemetry
  objectives: readonly SkirmishObjectiveView[]
  aiPressure?: AIPressureSnapshot | null
}): ResultPresentationSnapshot {
  const completion = buildSkirmishCompletionSnapshot({
    result: input.result,
    telemetry: input.telemetry,
    objectives: input.objectives,
    aiPressure: input.aiPressure,
  })
  const completedObjectiveCount = countCompletedObjectives(input.objectives)
  const p0 = countAliveByTeam(input.units, 0)
  const p1 = countAliveByTeam(input.units, 1)
  const resultActive = input.result !== null
  const pressure = input.aiPressure
  const humanCombat = buildHumanCombatProfileSnapshot(input.units)
  const humanUpgrade = buildHumanUpgradeImpactSnapshot(input.units)
  const cards: ResultPresentationCard[] = [
    {
      key: 'duration',
      label: '时长',
      value: formatGameTime(input.gameTime),
      tone: 'neutral',
      detail: completion.nextAction,
    },
    {
      key: 'objectives',
      label: '目标',
      value: `${completedObjectiveCount}/${input.objectives.length}`,
      tone: completedObjectiveCount === input.objectives.length ? 'victory' : 'warning',
      detail: completion.verdict,
    },
    {
      key: 'player',
      label: '我方',
      value: `U${p0.units} / B${p0.buildings}`,
      tone: input.result === 'defeat' ? 'warning' : 'neutral',
      detail: `损失 ${input.telemetry.playerUnitsLost}/${input.telemetry.playerBuildingsLost}`,
    },
    {
      key: 'enemy',
      label: '敌方',
      value: `U${p1.units} / B${p1.buildings}`,
      tone: input.result === 'victory' ? 'victory' : 'neutral',
      detail: `击败 ${input.telemetry.enemyUnitsDefeated}/${input.telemetry.enemyBuildingsDestroyed}`,
    },
    {
      key: 'map',
      label: '地图身份',
      value: `野${input.telemetry.neutralCreepsDefeated} / 物${input.telemetry.playerItemsCollected + input.telemetry.playerItemsPurchased}`,
      tone: input.telemetry.neutralCreepsDefeated > 0 ||
        input.telemetry.playerItemsCollected + input.telemetry.playerItemsPurchased > 0
        ? 'victory'
        : 'neutral',
      detail: `商店 ${input.telemetry.playerItemsPurchased}，使用 ${input.telemetry.playerItemsUsed}`,
    },
    {
      key: 'pressure',
      label: 'AI 压力',
      value: pressure ? `波${pressure.waveCount} / 峰${pressure.peakPressure}` : '--',
      tone: pressure && pressure.playerBaseThreatLevel !== 'quiet' ? 'warning' : 'neutral',
      detail: pressure
        ? `${pressure.directorPhaseLabel} · ${pressure.stageLabel} · ${pressure.playerBaseThreatLabel}`
        : '无压力记录',
    },
    {
      key: 'combat-reason',
      label: '战斗读法',
      value: `混${humanCombat.compositionCoverageCount}/${humanCombat.totalCompositionRoleCount} · 克${humanCombat.counterAdvantageCount}/${humanCombat.counterRuleCount}`,
      tone: humanCombat.compositionCoverageCount >= 4 ? 'victory' : 'warning',
      detail: `混编建议：${humanCombat.recommendedMix}；${humanCombat.strongestDpsLabel}；${humanCombat.highestEffectiveHpLabel}`,
    },
    {
      key: 'tech-impact',
      label: '科技收益',
      value: `${humanUpgrade.completedResearchCount}/${humanUpgrade.totalTrackedResearchCount}`,
      tone: humanUpgrade.completedResearchCount > 0 ? 'victory' : 'warning',
      detail: `${humanUpgrade.battleReason}；${humanUpgrade.nextUpgradeHint}`,
    },
  ]
  const objectives = input.objectives.map(objective => ({
    key: objective.key,
    label: objective.label,
    icon: objective.icon,
    completed: objective.completed,
    progressText: objective.progressText,
    tone: objective.tone,
  }))
  const checks: ResultPresentationCheck[] = [
    {
      key: 'result-card-layer',
      label: '结果数据卡',
      completed: !resultActive || cards.length >= 5,
      detail: `卡片 ${cards.length}`,
    },
    {
      key: 'objective-recap-layer',
      label: '目标复盘层',
      completed: !resultActive || objectives.length >= 5,
      detail: `目标 ${completedObjectiveCount}/${objectives.length}`,
    },
    {
      key: 'flow-recap-layer',
      label: '流程复盘层',
      completed: !resultActive || completion.steps.length >= 8,
      detail: `流程 ${completion.completedCount}/${completion.totalCount}`,
    },
    {
      key: 'pressure-recap-layer',
      label: '压力复盘层',
      completed: !resultActive || !!pressure || input.result === 'victory' || input.result === 'defeat',
      detail: pressure
        ? `波次 ${pressure.waveCount}，峰值 ${pressure.peakPressure}`
        : '无压力记录',
    },
    {
      key: 'combat-reason-layer',
      label: '战斗原因层',
      completed: !resultActive ||
        (humanCombat.profileCount >= 6 && humanUpgrade.totalTrackedResearchCount >= 14),
      detail: `${humanCombat.recommendedMix}；${humanUpgrade.battleReason}`,
    },
  ]
  const completedCount = checks.filter(check => check.completed).length
  const completed = completedCount === checks.length
  return {
    resultActive,
    completed,
    completedCount,
    totalCount: checks.length,
    verdict: completed ? '结果视觉复盘闭环' : '结果视觉复盘仍有缺口',
    resultLabel: resultLabel(input.result),
    outcomeTone: toneForResult(input.result),
    completedObjectiveCount,
    totalObjectiveCount: input.objectives.length,
    flowCompletedCount: completion.completedCount,
    flowTotalCount: completion.totalCount,
    cardCount: cards.length,
    objectiveChipCount: objectives.length,
    flowStepCount: completion.steps.length,
    combatReasonCount: cards.filter(card => card.key === 'combat-reason').length,
    upgradeImpactCount: humanUpgrade.completedResearchCount,
    cards,
    objectives,
    flowSteps: completion.steps,
    checks,
  }
}
