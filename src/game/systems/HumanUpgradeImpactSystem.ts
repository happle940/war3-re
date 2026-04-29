import {
  RESEARCHES,
  ResearchEffectType,
} from '../GameData'
import type { ResearchEffect } from '../GameData'
import type { Unit } from '../UnitTypes'

export type HumanUpgradeGroupKey =
  | 'rifle-range'
  | 'melee-attack'
  | 'ranged-attack'
  | 'melee-armor'
  | 'ranged-armor'
  | 'knight-durability'

export type HumanUpgradeStatKey = 'attackDamage' | 'armor' | 'maxHp' | 'attackRange'

export interface HumanUpgradeGroupView {
  key: HumanUpgradeGroupKey
  label: string
  completedCount: number
  totalCount: number
  complete: boolean
  progressLabel: string
  detail: string
  nextResearchKey: string | null
  nextResearchLabel: string
}

export interface HumanUpgradeImpactView {
  researchKey: string
  researchLabel: string
  targetUnitType: string
  stat: HumanUpgradeStatKey
  statLabel: string
  value: number
  liveTargetCount: number
  liveImpactValue: number
  detail: string
}

export interface HumanUpgradeImpactSnapshot {
  completedResearchCount: number
  totalTrackedResearchCount: number
  completedAttackResearchCount: number
  completedArmorResearchCount: number
  completedUtilityResearchCount: number
  liveAffectedUnitCount: number
  damageDeltaTotal: number
  armorDeltaTotal: number
  maxHpDeltaTotal: number
  rangeDeltaTotal: number
  strongestLiveImpactLabel: string
  battleReason: string
  nextUpgradeHint: string
  completedResearchKeys: string[]
  completedResearchLabels: string[]
  groups: HumanUpgradeGroupView[]
  impacts: HumanUpgradeImpactView[]
}

const UPGRADE_GROUPS: readonly {
  key: HumanUpgradeGroupKey
  label: string
  researchKeys: readonly string[]
}[] = [
  { key: 'rifle-range', label: '步枪射程', researchKeys: ['long_rifles'] },
  { key: 'melee-attack', label: '近战攻击', researchKeys: ['iron_forged_swords', 'steel_forged_swords', 'mithril_forged_swords'] },
  { key: 'ranged-attack', label: '远程火力', researchKeys: ['black_gunpowder', 'refined_gunpowder', 'imbued_gunpowder'] },
  { key: 'melee-armor', label: '重甲承伤', researchKeys: ['iron_plating', 'steel_plating', 'mithril_plating'] },
  { key: 'ranged-armor', label: '后排护甲', researchKeys: ['studded_leather_armor', 'reinforced_leather_armor', 'dragonhide_armor'] },
  { key: 'knight-durability', label: '骑士生命', researchKeys: ['animal_war_training'] },
]

const TRACKED_RESEARCH_KEYS = UPGRADE_GROUPS.flatMap(group => [...group.researchKeys])

const ATTACK_STATS = new Set<HumanUpgradeStatKey>(['attackDamage', 'attackRange'])
const ARMOR_STATS = new Set<HumanUpgradeStatKey>(['armor'])
const UTILITY_STATS = new Set<HumanUpgradeStatKey>(['maxHp'])

export function buildHumanUpgradeImpactSnapshot(units: readonly Unit[]): HumanUpgradeImpactSnapshot {
  const completed = getCompletedPlayerResearches(units)
  const liveCombatUnits = units.filter(unit =>
    unit.team === 0 &&
    !unit.isBuilding &&
    unit.hp > 0 &&
    !unit.isDead,
  )
  const liveCountByType = new Map<string, number>()
  for (const unit of liveCombatUnits) {
    liveCountByType.set(unit.type, (liveCountByType.get(unit.type) ?? 0) + 1)
  }

  const impacts = buildUpgradeImpacts(completed, liveCountByType)
  const affectedTypes = new Set(impacts.filter(impact => impact.liveTargetCount > 0).map(impact => impact.targetUnitType))
  const completedResearchKeys = TRACKED_RESEARCH_KEYS.filter(key => completed.has(key))
  const completedResearchLabels = completedResearchKeys.map(key => RESEARCHES[key]?.name ?? key)
  const damageDeltaTotal = sumImpact(impacts, 'attackDamage')
  const armorDeltaTotal = sumImpact(impacts, 'armor')
  const maxHpDeltaTotal = sumImpact(impacts, 'maxHp')
  const rangeDeltaTotal = sumImpact(impacts, 'attackRange')
  const groups = UPGRADE_GROUPS.map(group => buildGroupView(group, completed))

  return {
    completedResearchCount: completedResearchKeys.length,
    totalTrackedResearchCount: TRACKED_RESEARCH_KEYS.length,
    completedAttackResearchCount: impacts.filter(impact => ATTACK_STATS.has(impact.stat)).length,
    completedArmorResearchCount: impacts.filter(impact => ARMOR_STATS.has(impact.stat)).length,
    completedUtilityResearchCount: impacts.filter(impact => UTILITY_STATS.has(impact.stat)).length,
    liveAffectedUnitCount: affectedTypes.size,
    damageDeltaTotal,
    armorDeltaTotal,
    maxHpDeltaTotal,
    rangeDeltaTotal,
    strongestLiveImpactLabel: strongestImpactLabel(impacts),
    battleReason: buildBattleReason({
      completedResearchCount: completedResearchKeys.length,
      totalTrackedResearchCount: TRACKED_RESEARCH_KEYS.length,
      damageDeltaTotal,
      armorDeltaTotal,
      maxHpDeltaTotal,
      rangeDeltaTotal,
      liveAffectedUnitCount: affectedTypes.size,
    }),
    nextUpgradeHint: buildNextUpgradeHint(groups),
    completedResearchKeys,
    completedResearchLabels,
    groups,
    impacts,
  }
}

function getCompletedPlayerResearches(units: readonly Unit[]) {
  const completed = new Set<string>()
  for (const unit of units) {
    if (unit.team !== 0 || !unit.isBuilding) continue
    for (const key of unit.completedResearches ?? []) {
      if (TRACKED_RESEARCH_KEYS.includes(key)) completed.add(key)
    }
  }
  return completed
}

function buildUpgradeImpacts(
  completed: Set<string>,
  liveCountByType: ReadonlyMap<string, number>,
): HumanUpgradeImpactView[] {
  const impacts: HumanUpgradeImpactView[] = []
  for (const researchKey of TRACKED_RESEARCH_KEYS) {
    if (!completed.has(researchKey)) continue
    const research = RESEARCHES[researchKey]
    if (!research?.effects) continue
    for (const effect of research.effects) {
      if (!isTrackedFlatEffect(effect)) continue
      const liveTargetCount = liveCountByType.get(effect.targetUnitType) ?? 0
      const liveImpactValue = effect.value * liveTargetCount
      impacts.push({
        researchKey,
        researchLabel: research.name,
        targetUnitType: effect.targetUnitType,
        stat: effect.stat,
        statLabel: statLabel(effect.stat),
        value: effect.value,
        liveTargetCount,
        liveImpactValue,
        detail: `${research.name}: ${effect.targetUnitType} ${statLabel(effect.stat)} +${formatNumber(effect.value)} ×${liveTargetCount}`,
      })
    }
  }
  return impacts
}

function isTrackedFlatEffect(effect: ResearchEffect): effect is ResearchEffect & { stat: HumanUpgradeStatKey } {
  return effect.type === ResearchEffectType.FlatDelta &&
    (effect.stat === 'attackDamage' ||
      effect.stat === 'armor' ||
      effect.stat === 'maxHp' ||
      effect.stat === 'attackRange')
}

function buildGroupView(
  group: typeof UPGRADE_GROUPS[number],
  completed: ReadonlySet<string>,
): HumanUpgradeGroupView {
  const completedKeys = group.researchKeys.filter(key => completed.has(key))
  const nextResearchKey = group.researchKeys.find(key => !completed.has(key)) ?? null
  const nextResearchLabel = nextResearchKey ? RESEARCHES[nextResearchKey]?.name ?? nextResearchKey : '已完成'
  return {
    key: group.key,
    label: group.label,
    completedCount: completedKeys.length,
    totalCount: group.researchKeys.length,
    complete: completedKeys.length === group.researchKeys.length,
    progressLabel: `${completedKeys.length}/${group.researchKeys.length}`,
    detail: completedKeys.length > 0
      ? `${completedKeys.map(key => RESEARCHES[key]?.name ?? key).join('、')} 已研究`
      : `下一项 ${nextResearchLabel}`,
    nextResearchKey,
    nextResearchLabel,
  }
}

function sumImpact(impacts: readonly HumanUpgradeImpactView[], stat: HumanUpgradeStatKey) {
  return impacts
    .filter(impact => impact.stat === stat)
    .reduce((total, impact) => total + impact.liveImpactValue, 0)
}

function strongestImpactLabel(impacts: readonly HumanUpgradeImpactView[]) {
  const liveImpacts = impacts.filter(impact => impact.liveTargetCount > 0)
  if (liveImpacts.length === 0) return '当前场上暂无直接受益单位'
  const strongest = liveImpacts.reduce((best, impact) =>
    Math.abs(impact.liveImpactValue) > Math.abs(best.liveImpactValue) ? impact : best,
  )
  return `${strongest.researchLabel}：${strongest.targetUnitType} ${strongest.statLabel} +${formatNumber(strongest.value)} ×${strongest.liveTargetCount}`
}

function buildBattleReason(input: {
  completedResearchCount: number
  totalTrackedResearchCount: number
  damageDeltaTotal: number
  armorDeltaTotal: number
  maxHpDeltaTotal: number
  rangeDeltaTotal: number
  liveAffectedUnitCount: number
}) {
  const parts = [
    input.damageDeltaTotal > 0 ? `攻击 +${formatNumber(input.damageDeltaTotal)}` : '',
    input.armorDeltaTotal > 0 ? `护甲 +${formatNumber(input.armorDeltaTotal)}` : '',
    input.maxHpDeltaTotal > 0 ? `生命 +${formatNumber(input.maxHpDeltaTotal)}` : '',
    input.rangeDeltaTotal > 0 ? `射程 +${formatNumber(input.rangeDeltaTotal)}` : '',
  ].filter(Boolean)
  if (parts.length === 0) {
    return input.completedResearchCount > 0
      ? `科技 ${input.completedResearchCount}/${input.totalTrackedResearchCount}，但当前场上缺少直接受益单位`
      : `科技 0/${input.totalTrackedResearchCount}，尚无攻防/射程/生命收益`
  }
  return `科技 ${input.completedResearchCount}/${input.totalTrackedResearchCount}，${parts.join('，')}，覆盖 ${input.liveAffectedUnitCount} 类单位`
}

function buildNextUpgradeHint(groups: readonly HumanUpgradeGroupView[]) {
  const firstOpen = groups.find(group => !group.complete)
  if (!firstOpen) return '攻防、射程和骑士生命科技已完成当前链路'
  return `${firstOpen.label}: 下一项 ${firstOpen.nextResearchLabel}`
}

function statLabel(stat: HumanUpgradeStatKey) {
  switch (stat) {
    case 'attackDamage':
      return '攻击'
    case 'armor':
      return '护甲'
    case 'maxHp':
      return '生命'
    case 'attackRange':
      return '射程'
  }
}

function formatNumber(value: number) {
  return Number.isInteger(value) ? String(value) : value.toFixed(1)
}
