import { UNITS } from '../GameData'
import type { Unit } from '../UnitTypes'
import type { AIPressureSnapshot } from './AIPressureSystem'
import { buildHumanCombatProfileSnapshot } from './HumanCombatProfileSystem'
import { buildHumanUpgradeImpactSnapshot } from './HumanUpgradeImpactSystem'
import type { MatchResult } from './MatchOutcomeSystem'

export type SkirmishObjectiveKey =
  | 'economy'
  | 'barracks'
  | 'army'
  | 'hero'
  | 'creepItem'
  | 'shop'
  | 'enemyBase'

export interface MatchTelemetry {
  playerGoldGathered: number
  playerLumberGathered: number
  aiGoldGathered: number
  aiLumberGathered: number
  playerUnitsTrained: number
  playerHeroesTrained: number
  playerBuildingsCompleted: number
  playerItemsCollected: number
  playerItemsPurchased: number
  playerItemsUsed: number
  enemyUnitsDefeated: number
  enemyBuildingsDestroyed: number
  neutralCreepsDefeated: number
  playerUnitsLost: number
  playerBuildingsLost: number
}

export interface SkirmishObjectiveView {
  key: SkirmishObjectiveKey
  label: string
  icon: string
  tone: 'economy' | 'build' | 'army' | 'hero' | 'map' | 'shop' | 'attack'
  completed: boolean
  progressText: string
  progressValue: number
  detail: string
}

export type SkirmishFlowStepKey =
  | 'economy'
  | 'production'
  | 'army'
  | 'hero'
  | 'mapControl'
  | 'shop'
  | 'aiPressure'
  | 'decisiveBattle'
  | 'result'

export interface SkirmishFlowStepView {
  key: SkirmishFlowStepKey
  label: string
  completed: boolean
  detail: string
}

export interface SkirmishCompletionSnapshot {
  milestone: 'R10'
  completed: boolean
  completedCount: number
  totalCount: number
  verdict: string
  nextAction: string
  flowLine: string
  steps: SkirmishFlowStepView[]
}

export function createMatchTelemetry(): MatchTelemetry {
  return {
    playerGoldGathered: 0,
    playerLumberGathered: 0,
    aiGoldGathered: 0,
    aiLumberGathered: 0,
    playerUnitsTrained: 0,
    playerHeroesTrained: 0,
    playerBuildingsCompleted: 0,
    playerItemsCollected: 0,
    playerItemsPurchased: 0,
    playerItemsUsed: 0,
    enemyUnitsDefeated: 0,
    enemyBuildingsDestroyed: 0,
    neutralCreepsDefeated: 0,
    playerUnitsLost: 0,
    playerBuildingsLost: 0,
  }
}

export function recordResourceDeposit(
  telemetry: MatchTelemetry,
  team: number,
  gold: number,
  lumber: number,
) {
  if (team === 0) {
    telemetry.playerGoldGathered += gold
    telemetry.playerLumberGathered += lumber
  } else if (team === 1) {
    telemetry.aiGoldGathered += gold
    telemetry.aiLumberGathered += lumber
  }
}

export function recordTrainedUnit(telemetry: MatchTelemetry, team: number, unitType: string) {
  if (team !== 0) return
  telemetry.playerUnitsTrained += 1
  if (UNITS[unitType]?.isHero) telemetry.playerHeroesTrained += 1
}

export function recordCompletedBuilding(telemetry: MatchTelemetry, team: number) {
  if (team === 0) telemetry.playerBuildingsCompleted += 1
}

export function recordUnitDeath(telemetry: MatchTelemetry, unit: Unit) {
  if (unit.team === 0) {
    if (unit.isBuilding) telemetry.playerBuildingsLost += 1
    else telemetry.playerUnitsLost += 1
    return
  }
  if (unit.team === 1) {
    if (unit.isBuilding) telemetry.enemyBuildingsDestroyed += 1
    else telemetry.enemyUnitsDefeated += 1
    return
  }
  if (UNITS[unit.type]?.isCreep) {
    telemetry.neutralCreepsDefeated += 1
  }
}

export function recordItemCollected(telemetry: MatchTelemetry, team: number) {
  if (team === 0) telemetry.playerItemsCollected += 1
}

export function recordItemPurchased(telemetry: MatchTelemetry, team: number) {
  if (team === 0) telemetry.playerItemsPurchased += 1
}

export function recordItemUsed(telemetry: MatchTelemetry, team: number) {
  if (team === 0) telemetry.playerItemsUsed += 1
}

export function buildSkirmishObjectives(
  units: readonly Unit[],
  telemetry: MatchTelemetry,
  matchResult: MatchResult | null,
  aiPressure?: AIPressureSnapshot | null,
): SkirmishObjectiveView[] {
  const playerAlive = units.filter(u => u.team === 0 && u.hp > 0 && !u.isDead)
  const playerBuildings = playerAlive.filter(u => u.isBuilding && u.buildProgress >= 1)
  const playerUnits = playerAlive.filter(u => !u.isBuilding)
  const playerHeroes = playerUnits.filter(u => !!UNITS[u.type]?.isHero)
  const armyCount = playerUnits.filter(u => {
    if (UNITS[u.type]?.isHero) return true
    return u.type !== 'worker' && u.type !== 'militia'
  }).length
  const activeGoldWorkers = playerUnits.filter(u =>
    u.type === 'worker' &&
    u.gatherType === 'gold' &&
    !!u.resourceTarget,
  ).length
  const completedBarracks = playerBuildings.filter(u => u.type === 'barracks').length
  const completedVault = playerBuildings.some(u => u.type === 'arcane_vault')
  const aiTownHall = units.find(u => u.team === 1 && u.type === 'townhall' && u.isBuilding)
  const aiTownHallHpPct = aiTownHall ? Math.max(0, Math.round((aiTownHall.hp / aiTownHall.maxHp) * 100)) : 0
  const enemyBasePressured = matchResult === 'victory' ||
    telemetry.enemyBuildingsDestroyed > 0 ||
    (!!aiTownHall && aiTownHall.hp < aiTownHall.maxHp)

  return [
    {
      key: 'economy',
      label: '启动经济',
      icon: '◆',
      tone: 'economy',
      completed: activeGoldWorkers >= 5 || telemetry.playerGoldGathered >= 50,
      progressText: `${Math.min(activeGoldWorkers, 5)}/5 矿工`,
      progressValue: Math.min(1, Math.max(activeGoldWorkers / 5, telemetry.playerGoldGathered / 50)),
      detail: `金+${telemetry.playerGoldGathered} 木+${telemetry.playerLumberGathered}`,
    },
    {
      key: 'barracks',
      label: '建立兵营',
      icon: '⌂',
      tone: 'build',
      completed: completedBarracks > 0,
      progressText: completedBarracks > 0 ? '已完成' : '未完成',
      progressValue: completedBarracks > 0 ? 1 : 0,
      detail: '训练 Footman / Rifleman 的基础入口',
    },
    {
      key: 'army',
      label: '组织部队',
      icon: '⚔',
      tone: 'army',
      completed: armyCount >= 3 || telemetry.playerUnitsTrained >= 3,
      progressText: `${Math.min(Math.max(armyCount, telemetry.playerUnitsTrained), 3)}/3 战斗单位`,
      progressValue: Math.min(1, Math.max(armyCount, telemetry.playerUnitsTrained) / 3),
      detail: '至少形成可出门的小队',
    },
    {
      key: 'hero',
      label: '召唤英雄',
      icon: '★',
      tone: 'hero',
      completed: playerHeroes.length > 0 || telemetry.playerHeroesTrained > 0,
      progressText: playerHeroes.length > 0 ? `${playerHeroes.length} 名英雄` : '未召唤',
      progressValue: playerHeroes.length > 0 || telemetry.playerHeroesTrained > 0 ? 1 : 0,
      detail: '英雄应成为练级和技能节奏核心',
    },
    {
      key: 'creepItem',
      label: '练级拾物',
      icon: '◇',
      tone: 'map',
      completed: telemetry.neutralCreepsDefeated > 0 || telemetry.playerItemsCollected > 0,
      progressText: `野怪 ${telemetry.neutralCreepsDefeated} / 物品 ${telemetry.playerItemsCollected}`,
      progressValue: Math.min(1, Math.max(telemetry.neutralCreepsDefeated, telemetry.playerItemsCollected)),
      detail: '清理中立营地并拾取掉落',
    },
    {
      key: 'shop',
      label: '商店补给',
      icon: '✚',
      tone: 'shop',
      completed: telemetry.playerItemsPurchased > 0,
      progressText: telemetry.playerItemsPurchased > 0 ? `购买 ${telemetry.playerItemsPurchased}` : completedVault ? '商店已建' : '未购买',
      progressValue: telemetry.playerItemsPurchased > 0 ? 1 : completedVault ? 0.5 : 0,
      detail: '英雄靠近 Arcane Vault 购买药水或装备',
    },
    {
      key: 'enemyBase',
      label: '压制敌基',
      icon: '⌖',
      tone: 'attack',
      completed: matchResult === 'victory',
      progressText: matchResult === 'victory'
        ? '已摧毁'
        : enemyBasePressured
          ? `主基地 ${aiTownHallHpPct}%`
          : aiPressure && aiPressure.waveCount > 0
            ? `AI 波次 ${aiPressure.waveCount}`
            : '未接战',
      progressValue: matchResult === 'victory'
        ? 1
        : aiTownHall
          ? Math.min(1, Math.max(0, 1 - aiTownHall.hp / aiTownHall.maxHp))
          : 0,
      detail: aiPressure
        ? `最终目标是摧毁 AI 主基地；AI 当前：${aiPressure.stageLabel}`
        : '最终目标是摧毁 AI 主基地',
    },
  ]
}

export function countCompletedObjectives(objectives: readonly SkirmishObjectiveView[]): number {
  return objectives.filter(o => o.completed).length
}

function objectiveDone(objectives: readonly SkirmishObjectiveView[], key: SkirmishObjectiveKey) {
  return objectives.some(objective => objective.key === key && objective.completed)
}

function objectiveByKey(objectives: readonly SkirmishObjectiveView[], key: SkirmishObjectiveKey) {
  return objectives.find(objective => objective.key === key) ?? null
}

export function buildSkirmishCompletionSnapshot(input: {
  result: MatchResult | null
  telemetry: MatchTelemetry
  objectives: readonly SkirmishObjectiveView[]
  aiPressure?: AIPressureSnapshot | null
}): SkirmishCompletionSnapshot {
  const enemyBase = objectiveByKey(input.objectives, 'enemyBase')
  const hasPressure = !!input.aiPressure && (
    input.aiPressure.waveCount > 0 ||
    input.aiPressure.defenseResponses > 0 ||
    input.aiPressure.counterAttackCount > 0 ||
    input.aiPressure.pressure > 0 ||
    input.aiPressure.stage !== 'opening' ||
    input.aiPressure.directorPhase !== 'opening' ||
    input.aiPressure.playerBaseThreatLevel !== 'quiet'
  )
  const hasDecisiveBattle = input.result !== null ||
    input.telemetry.enemyBuildingsDestroyed > 0 ||
    input.telemetry.enemyUnitsDefeated > 0 ||
    input.telemetry.playerBuildingsLost > 0 ||
    (enemyBase?.progressValue ?? 0) > 0

  const steps: SkirmishFlowStepView[] = [
    {
      key: 'economy',
      label: '经济启动',
      completed: objectiveDone(input.objectives, 'economy'),
      detail: `金+${input.telemetry.playerGoldGathered} 木+${input.telemetry.playerLumberGathered}`,
    },
    {
      key: 'production',
      label: '生产入口',
      completed: objectiveDone(input.objectives, 'barracks'),
      detail: objectiveByKey(input.objectives, 'barracks')?.progressText ?? '未完成',
    },
    {
      key: 'army',
      label: '部队成形',
      completed: objectiveDone(input.objectives, 'army'),
      detail: objectiveByKey(input.objectives, 'army')?.progressText ?? '未组织',
    },
    {
      key: 'hero',
      label: '英雄入局',
      completed: objectiveDone(input.objectives, 'hero'),
      detail: objectiveByKey(input.objectives, 'hero')?.progressText ?? '未召唤',
    },
    {
      key: 'mapControl',
      label: '地图争夺',
      completed: objectiveDone(input.objectives, 'creepItem'),
      detail: objectiveByKey(input.objectives, 'creepItem')?.progressText ?? '未触达',
    },
    {
      key: 'shop',
      label: '商店补给',
      completed: objectiveDone(input.objectives, 'shop'),
      detail: objectiveByKey(input.objectives, 'shop')?.progressText ?? '未购买',
    },
    {
      key: 'aiPressure',
      label: 'AI 压力',
      completed: hasPressure,
      detail: input.aiPressure
        ? `${input.aiPressure.directorPhaseLabel}/${input.aiPressure.stageLabel} · 波次${input.aiPressure.waveCount}`
        : '无压力记录',
    },
    {
      key: 'decisiveBattle',
      label: '决战接触',
      completed: hasDecisiveBattle,
      detail: enemyBase?.progressText ?? '未接战',
    },
    {
      key: 'result',
      label: '结果闭合',
      completed: input.result !== null,
      detail: resultLabel(input.result),
    },
  ]

  const completedCount = steps.filter(step => step.completed).length
  const firstOpen = steps.find(step => !step.completed)
  const completed = completedCount === steps.length
  const verdict = completed
    ? '完整短局闭环'
    : input.result
      ? '有结果但流程未完整触达'
      : '短局进行中'
  const nextAction = firstOpen
    ? `下一步：${firstOpen.label}`
    : input.result
      ? '可以重开复盘'
      : '推进决战'
  const flowLine = steps
    .map(step => `${step.completed ? '✓' : '·'}${step.label}`)
    .join(' → ')

  return {
    milestone: 'R10',
    completed,
    completedCount,
    totalCount: steps.length,
    verdict,
    nextAction,
    flowLine,
    steps,
  }
}

export function buildObjectiveStateKey(objectives: readonly SkirmishObjectiveView[]): string {
  return objectives
    .map(o => `${o.key}:${o.completed ? 1 : 0}:${o.progressText}`)
    .join('|')
}

export function formatGameTime(secondsTotal: number): string {
  const min = Math.floor(secondsTotal / 60).toString().padStart(2, '0')
  const sec = Math.floor(secondsTotal % 60).toString().padStart(2, '0')
  return `${min}:${sec}`
}

function countAliveByTeam(units: readonly Unit[], team: number) {
  const alive = units.filter(u => u.team === team && u.hp > 0 && !u.isDead)
  return {
    units: alive.filter(u => !u.isBuilding).length,
    buildings: alive.filter(u => u.isBuilding).length,
  }
}

function resultLabel(result: MatchResult | null): string {
  if (result === 'victory') return '胜利'
  if (result === 'defeat') return '失败'
  if (result === 'stall') return '僵局'
  return '未结束'
}

export function formatMatchResultSummary(input: {
  result: MatchResult
  gameTime: number
  units: readonly Unit[]
  telemetry: MatchTelemetry
  objectives: readonly SkirmishObjectiveView[]
  aiPressure?: AIPressureSnapshot | null
}): string {
  const p0 = countAliveByTeam(input.units, 0)
  const p1 = countAliveByTeam(input.units, 1)
  const completed = countCompletedObjectives(input.objectives)
  const doneLabels = input.objectives
    .filter(o => o.completed)
    .map(o => o.label)
    .slice(0, 4)
    .join('、') || '无'
  const completion = buildSkirmishCompletionSnapshot({
    result: input.result,
    telemetry: input.telemetry,
    objectives: input.objectives,
    aiPressure: input.aiPressure,
  })
  const humanCombat = buildHumanCombatProfileSnapshot(input.units)
  const humanUpgrade = buildHumanUpgradeImpactSnapshot(input.units)

  const lines = [
    `短局闭环 ${completion.verdict} ${completion.completedCount}/${completion.totalCount}`,
    `流程 ${completion.flowLine}`,
    completion.nextAction,
    `时长 ${formatGameTime(input.gameTime)}`,
    `目标 ${completed}/${input.objectives.length}: ${doneLabels}`,
    `我方 单位:${p0.units} 建筑:${p0.buildings} 损失:${input.telemetry.playerUnitsLost}/${input.telemetry.playerBuildingsLost}`,
    `敌方 单位:${p1.units} 建筑:${p1.buildings} 击败:${input.telemetry.enemyUnitsDefeated}/${input.telemetry.enemyBuildingsDestroyed}`,
    `资源 金+${input.telemetry.playerGoldGathered} 木+${input.telemetry.playerLumberGathered}`,
    `身份 野怪:${input.telemetry.neutralCreepsDefeated} 物品:${input.telemetry.playerItemsCollected} 商店:${input.telemetry.playerItemsPurchased}`,
    `战斗读法 混编:${humanCombat.compositionCoverageCount}/${humanCombat.totalCompositionRoleCount} 克制:${humanCombat.counterAdvantageCount}/${humanCombat.counterRuleCount} ${humanCombat.recommendedMix}`,
    `科技收益 ${humanUpgrade.battleReason}`,
  ]
  if (input.aiPressure) {
    const firstWave = input.aiPressure.firstWaveAt === null ? '--:--' : formatGameTime(input.aiPressure.firstWaveAt)
    lines.push(
      `AI 压力 ${input.aiPressure.difficultyLabel}/${input.aiPressure.directorPhaseLabel} 波次:${input.aiPressure.waveCount} 峰值:${input.aiPressure.peakPressure} 首波:${firstWave} 商店:${input.aiPressure.shopPurchases} 练级:${input.aiPressure.creepCampAttempts}`,
      `AI 复盘 阶段:${input.aiPressure.stageLabel} 防守:${input.aiPressure.defenseResponses} 反击:${input.aiPressure.counterAttackCount} 重组:${input.aiPressure.regroupCount} 预警:${input.aiPressure.playerBaseThreatLabel}`,
    )
  }
  return lines.join('\n')
}

export function formatMenuSessionSummary(input: {
  result: MatchResult
  gameTime: number
  telemetry: MatchTelemetry
  objectives: readonly SkirmishObjectiveView[]
  aiPressure?: AIPressureSnapshot | null
}): string {
  const completed = countCompletedObjectives(input.objectives)
  const closure = buildSkirmishCompletionSnapshot({
    result: input.result,
    telemetry: input.telemetry,
    objectives: input.objectives,
    aiPressure: input.aiPressure,
  })
  const ai = input.aiPressure
    ? ` · AI波次 ${input.aiPressure.waveCount} · AI防守 ${input.aiPressure.defenseResponses} · AI反击 ${input.aiPressure.counterAttackCount}`
    : ''
  return `上次结果：${resultLabel(input.result)} · ${formatGameTime(input.gameTime)} · 闭环 ${closure.completed ? '完整' : `${closure.completedCount}/${closure.totalCount}`} · 目标 ${completed}/${input.objectives.length} · 野怪 ${input.telemetry.neutralCreepsDefeated} · 物品 ${input.telemetry.playerItemsCollected + input.telemetry.playerItemsPurchased}${ai}`
}
