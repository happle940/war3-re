import { UNITS } from '../GameData'
import type { FeedbackEffectSnapshot } from '../FeedbackEffects'
import type { Unit } from '../UnitTypes'
import type { AudioCueSnapshot } from './AudioCueSystem'
import type { UnitPresentationSnapshot } from './UnitPresentationSystem'

export interface BattlefieldPerceptionCheck {
  key: string
  label: string
  completed: boolean
  detail: string
}

export interface BattlefieldPerceptionSnapshot {
  completed: boolean
  completedCount: number
  totalCount: number
  verdict: string
  commandSignalCount: number
  combatSignalCount: number
  abilitySignalCount: number
  deathSignalCount: number
  constructionSignalCount: number
  actionStateSignalCount: number
  audioKindCount: number
  checks: BattlefieldPerceptionCheck[]
}

function alive(unit: Unit) {
  return unit.hp > 0 && !unit.isDead
}

export function buildBattlefieldPerceptionSnapshot(input: {
  units: readonly Unit[]
  audio: AudioCueSnapshot
  feedback: FeedbackEffectSnapshot
  unitPresentation: UnitPresentationSnapshot
  selectedCount: number
  selectionRingCount: number
  healthBarCount: number
  deadRecordCount: number
}): BattlefieldPerceptionSnapshot {
  const aliveUnits = input.units.filter(alive)
  const liveHeroes = aliveUnits.filter(unit => !unit.isBuilding && !!UNITS[unit.type]?.isHero).length
  const heroFeedbackCount = aliveUnits.filter(unit =>
    !!UNITS[unit.type]?.isHero &&
    !!unit.abilityFeedbackText &&
    unit.abilityFeedbackUntil > 0,
  ).length
  const commandSignalCount = input.feedback.totalMoveIndicators +
    input.feedback.totalAttackMoveIndicators +
    input.feedback.totalSelectionFlashes +
    input.feedback.activeQueueIndicators
  const combatSignalCount = input.feedback.totalImpactRings +
    input.feedback.totalDamageNumbers +
    input.feedback.totalHitFlashes +
    input.unitPresentation.attackingUnitCount
  const abilitySignalCount = heroFeedbackCount +
    input.feedback.totalAbilityEffectBursts +
    input.unitPresentation.castingUnitCount +
    input.unitPresentation.statusAnimatedCount
  const deathSignalCount = input.deadRecordCount +
    input.unitPresentation.deathPoseCount +
    Number(input.audio.kinds.includes('death'))
  const constructionSignalCount = input.feedback.totalBuildCompleteEffects +
    Number(input.audio.kinds.includes('construction'))
  const actionStateSignalCount = input.unitPresentation.movingUnitCount +
    input.unitPresentation.attackingUnitCount +
    input.unitPresentation.castingUnitCount +
    input.unitPresentation.statusAnimatedCount +
    input.unitPresentation.deathPoseCount
  const audioKindCount = input.audio.kinds.length

  const checks: BattlefieldPerceptionCheck[] = [
    {
      key: 'command-confirmation',
      label: '命令确认',
      completed: input.selectedCount > 0 &&
        input.selectionRingCount >= input.selectedCount &&
        commandSignalCount > 0,
      detail: `选中 ${input.selectedCount}，选择环 ${input.selectionRingCount}，命令信号 ${commandSignalCount}`,
    },
    {
      key: 'combat-impact',
      label: '战斗命中',
      completed: input.healthBarCount > 0 &&
        combatSignalCount > 0 &&
        (input.audio.kinds.includes('combat') || input.feedback.totalImpactRings > 0),
      detail: `血条 ${input.healthBarCount}，战斗信号 ${combatSignalCount}，combat cue ${input.audio.kinds.includes('combat') ? '有' : '无'}`,
    },
    {
      key: 'ability-moment',
      label: '技能瞬间',
      completed: abilitySignalCount > 0 && input.audio.kinds.includes('ability'),
      detail: `英雄 ${liveHeroes}，技能/状态信号 ${abilitySignalCount}`,
    },
    {
      key: 'death-readability',
      label: '死亡反馈',
      completed: deathSignalCount > 0,
      detail: `死亡记录 ${input.deadRecordCount}，死亡姿态 ${input.unitPresentation.deathPoseCount}，death cue ${input.audio.kinds.includes('death') ? '有' : '无'}`,
    },
    {
      key: 'construction-feedback',
      label: '建造反馈',
      completed: constructionSignalCount > 0,
      detail: `完工特效 ${input.feedback.totalBuildCompleteEffects}，construction cue ${input.audio.kinds.includes('construction') ? '有' : '无'}`,
    },
    {
      key: 'action-state-coverage',
      label: '动作状态覆盖',
      completed: actionStateSignalCount > 0 &&
        input.unitPresentation.animatedUnitCount > 0 &&
        input.unitPresentation.totalAnimationTicks > 0,
      detail: `动作状态 ${actionStateSignalCount}，可动 ${input.unitPresentation.animatedUnitCount}，tick ${input.unitPresentation.totalAnimationTicks}`,
    },
    {
      key: 'audio-palette',
      label: '音效语义覆盖',
      completed: audioKindCount >= 5 &&
        input.audio.kinds.includes('command') &&
        input.audio.kinds.includes('ability'),
      detail: `cue 类型 ${input.audio.kinds.join('/') || '无'}`,
    },
  ]

  const completedCount = checks.filter(check => check.completed).length
  const completed = completedCount === checks.length
  return {
    completed,
    completedCount,
    totalCount: checks.length,
    verdict: completed ? '玩家感知反馈闭环' : '玩家感知反馈仍有缺口',
    commandSignalCount,
    combatSignalCount,
    abilitySignalCount,
    deathSignalCount,
    constructionSignalCount,
    actionStateSignalCount,
    audioKindCount,
    checks,
  }
}
