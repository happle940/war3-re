import {
  ARMOR_TYPE_NAMES,
  ATTACK_TYPE_NAMES,
  ArmorType,
  AttackType,
  UNITS,
  getTypeMultiplier,
} from '../GameData'
import type { Unit } from '../UnitTypes'
import { calculateArmorReduction } from './CombatMath'

export type HumanCompositionRole = 'frontline' | 'ranged' | 'support' | 'control' | 'siege' | 'late-frontline'
export type HumanCombatTier = 'T1' | 'T2' | 'T3'
export type HumanCounterVerdict = 'strong' | 'neutral' | 'poor'

export interface HumanCombatUnitProfile {
  unitKey: string
  label: string
  tier: HumanCombatTier
  role: HumanCompositionRole
  roleLabel: string
  liveCount: number
  attackTypeLabel: string
  armorTypeLabel: string
  dps: number
  range: number
  supply: number
  armor: number
  effectiveHp: number
  tacticalUse: string
  counterHint: string
  weaknessHint: string
}

export interface HumanCounterRuleView {
  key: string
  sourceUnitKey: string
  sourceLabel: string
  targetArmorTypeLabel: string
  multiplier: number
  verdict: HumanCounterVerdict
  label: string
  detail: string
}

export interface HumanCombatProfileSnapshot {
  profileCount: number
  liveProfileCount: number
  t2ProfileCount: number
  t3ProfileCount: number
  compositionCoverageCount: number
  totalCompositionRoleCount: number
  counterRuleCount: number
  counterAdvantageCount: number
  counterRiskCount: number
  strongestDpsUnitKey: string
  strongestDpsLabel: string
  highestEffectiveHpUnitKey: string
  highestEffectiveHpLabel: string
  longestRangeUnitKey: string
  longestRangeLabel: string
  recommendedMix: string
  missingRoles: string[]
  profiles: HumanCombatUnitProfile[]
  counters: HumanCounterRuleView[]
}

const HUMAN_COMBAT_UNITS = [
  'footman',
  'rifleman',
  'priest',
  'sorceress',
  'mortar_team',
  'knight',
] as const

const ROLE_LABELS: Record<HumanCompositionRole, string> = {
  frontline: '前排承伤',
  ranged: '远程集火',
  support: '治疗续航',
  control: '控制减速',
  siege: '破防攻城',
  'late-frontline': '三本重甲',
}

const COMPOSITION_ROLES: HumanCompositionRole[] = ['frontline', 'ranged', 'support', 'control', 'siege', 'late-frontline']

const UNIT_PROFILE_META: Record<typeof HUMAN_COMBAT_UNITS[number], {
  tier: HumanCombatTier
  role: HumanCompositionRole
  tacticalUse: string
  counterHint: string
  weaknessHint: string
}> = {
  footman: {
    tier: 'T1',
    role: 'frontline',
    tacticalUse: '用低科技前排保护步枪、英雄和法师进入输出位置',
    counterHint: 'Defend 后能承接穿刺压力，是 T1 阵线稳定器',
    weaknessHint: '缺少远程和治疗时容易被风筝或在持续战里掉线',
  },
  rifleman: {
    tier: 'T1',
    role: 'ranged',
    tacticalUse: '远程集火和练级效率核心，接 Long Rifles 后射程更稳定',
    counterHint: '穿刺对重甲有 1.25 倍，是处理重甲前排和野怪的主力',
    weaknessHint: '中甲被穿刺/攻城打折，缺前排时容易被贴脸',
  },
  priest: {
    tier: 'T2',
    role: 'support',
    tacticalUse: '治疗把短局从一次性交战变成可续航推进',
    counterHint: '让 Footman/Knight 承伤时间变长，放大前排价值',
    weaknessHint: '无甲低血量，需要前排和站位保护',
  },
  sorceress: {
    tier: 'T2',
    role: 'control',
    tacticalUse: 'Slow 降低敌方接战和撤退效率，给远程/攻城创造窗口',
    counterHint: '控制重甲近战和突进单位，保护后排输出',
    weaknessHint: '无甲低血量，单独作战价值低',
  },
  mortar_team: {
    tier: 'T2',
    role: 'siege',
    tacticalUse: '处理防御塔、建筑和密集阵型，迫使敌方不能站桩',
    counterHint: '射程和 AOE 让它成为破防推进核心',
    weaknessHint: '无甲低机动，必须被前排和控制保护',
  },
  knight: {
    tier: 'T3',
    role: 'late-frontline',
    tacticalUse: '三本后段的高速重甲前排，承担正面接战和保护后排',
    counterHint: '高有效血量配合 Priest/升级后形成稳定正面',
    weaknessHint: '仍怕被控制和集火，不能替代远程/攻城功能',
  },
}

export function buildHumanCombatProfileSnapshot(units: readonly Unit[]): HumanCombatProfileSnapshot {
  const profiles = HUMAN_COMBAT_UNITS.map(unitKey => buildUnitProfile(units, unitKey))
  const liveRoles = new Set(profiles.filter(profile => profile.liveCount > 0).map(profile => profile.role))
  const missingRoles = COMPOSITION_ROLES
    .filter(role => !liveRoles.has(role))
    .map(role => ROLE_LABELS[role])
  const liveProfiles = profiles.filter(profile => profile.liveCount > 0)
  const counters = buildCounterRules()
  const strongestDps = maxBy(profiles, profile => profile.dps)
  const highestEffectiveHp = maxBy(profiles, profile => profile.effectiveHp)
  const longestRange = maxBy(profiles, profile => profile.range)

  return {
    profileCount: profiles.length,
    liveProfileCount: liveProfiles.length,
    t2ProfileCount: profiles.filter(profile => profile.tier === 'T2').length,
    t3ProfileCount: profiles.filter(profile => profile.tier === 'T3').length,
    compositionCoverageCount: liveRoles.size,
    totalCompositionRoleCount: COMPOSITION_ROLES.length,
    counterRuleCount: counters.length,
    counterAdvantageCount: counters.filter(counter => counter.verdict === 'strong').length,
    counterRiskCount: counters.filter(counter => counter.verdict === 'poor').length,
    strongestDpsUnitKey: strongestDps.unitKey,
    strongestDpsLabel: `${strongestDps.label} ${strongestDps.dps.toFixed(1)} DPS`,
    highestEffectiveHpUnitKey: highestEffectiveHp.unitKey,
    highestEffectiveHpLabel: `${highestEffectiveHp.label} 有效血量 ${Math.round(highestEffectiveHp.effectiveHp)}`,
    longestRangeUnitKey: longestRange.unitKey,
    longestRangeLabel: `${longestRange.label} 射程 ${longestRange.range}`,
    recommendedMix: buildRecommendedMix(liveRoles),
    missingRoles,
    profiles,
    counters,
  }
}

function buildUnitProfile(
  units: readonly Unit[],
  unitKey: typeof HUMAN_COMBAT_UNITS[number],
): HumanCombatUnitProfile {
  const def = UNITS[unitKey]
  const meta = UNIT_PROFILE_META[unitKey]
  const liveCount = units.filter(unit =>
    unit.team === 0 &&
    unit.type === unitKey &&
    !unit.isBuilding &&
    unit.hp > 0 &&
    !unit.isDead,
  ).length
  const dps = def.attackCooldown > 0 ? def.attackDamage / def.attackCooldown : 0
  const armorReduction = calculateArmorReduction(def.armor)
  const effectiveHp = armorReduction >= 1 ? def.hp : def.hp / Math.max(0.1, 1 - armorReduction)

  return {
    unitKey,
    label: def.name,
    tier: meta.tier,
    role: meta.role,
    roleLabel: ROLE_LABELS[meta.role],
    liveCount,
    attackTypeLabel: ATTACK_TYPE_NAMES[def.attackType ?? AttackType.Normal],
    armorTypeLabel: ARMOR_TYPE_NAMES[def.armorType ?? ArmorType.Medium],
    dps: Math.round(dps * 10) / 10,
    range: def.attackRange,
    supply: def.supply,
    armor: def.armor,
    effectiveHp: Math.round(effectiveHp),
    tacticalUse: meta.tacticalUse,
    counterHint: meta.counterHint,
    weaknessHint: meta.weaknessHint,
  }
}

function buildCounterRules(): HumanCounterRuleView[] {
  return [
    counterRule('rifleman-heavy', 'rifleman', ArmorType.Heavy, 'strong', '穿刺克重甲'),
    counterRule('rifleman-medium', 'rifleman', ArmorType.Medium, 'poor', '穿刺打中甲效率下降'),
    counterRule('mortar-medium', 'mortar_team', ArmorType.Medium, 'poor', '攻城不适合打中甲主力'),
    counterRule('mortar-unarmored', 'mortar_team', ArmorType.Unarmored, 'neutral', '攻城打无甲按基础效率'),
    counterRule('sorceress-heavy-control', 'sorceress', ArmorType.Heavy, 'neutral', '伤害普通，价值在 Slow 控制重甲接战'),
    counterRule('knight-heavy-frontline', 'knight', ArmorType.Heavy, 'neutral', '正面不是倍率克制，靠血量/护甲/治疗承压'),
  ]
}

function counterRule(
  key: string,
  sourceUnitKey: typeof HUMAN_COMBAT_UNITS[number],
  armorType: ArmorType,
  verdict: HumanCounterVerdict,
  label: string,
): HumanCounterRuleView {
  const source = UNITS[sourceUnitKey]
  const multiplier = getTypeMultiplier(source.attackType ?? AttackType.Normal, armorType)
  const targetArmorTypeLabel = ARMOR_TYPE_NAMES[armorType]
  return {
    key,
    sourceUnitKey,
    sourceLabel: source.name,
    targetArmorTypeLabel,
    multiplier,
    verdict,
    label,
    detail: `${source.name} ${ATTACK_TYPE_NAMES[source.attackType ?? AttackType.Normal]} -> ${targetArmorTypeLabel} ×${multiplier}`,
  }
}

function buildRecommendedMix(liveRoles: Set<HumanCompositionRole>) {
  if (!liveRoles.has('ranged')) return '先补 Rifleman，建立 T1 远程火力'
  if (!liveRoles.has('frontline')) return '补 Footman 或 Militia，给远程单位前排'
  if (!liveRoles.has('support')) return 'T2 后补 Priest，把交战变成可续航推进'
  if (!liveRoles.has('control')) return '补 Sorceress，用 Slow 控制敌方接战'
  if (!liveRoles.has('siege')) return '补 Mortar Team，打开破塔和密集阵型处理能力'
  if (!liveRoles.has('late-frontline')) return 'T3 后补 Knight，形成重甲前排保护后排'
  return 'Knight + Priest/Sorceress + Mortar + Rifleman 混编已具备当前后段骨架'
}

function maxBy<T>(items: readonly T[], score: (item: T) => number): T {
  return items.reduce((best, item) => score(item) > score(best) ? item : best, items[0])
}
