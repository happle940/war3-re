import {
  BUILDINGS,
  HERO_ABILITY_LEVELS,
  HERO_REVIVE_RULES,
  HERO_XP_RULES,
  UNITS,
  WATER_ELEMENTAL_SUMMON_LEVELS,
} from '../GameData'
import type { Unit } from '../UnitTypes'
import {
  buildHeroTacticalFeedbackSnapshot,
} from './HeroTacticalFeedbackSystem'
import type {
  HeroAbilityReadiness,
  HeroTacticalFeedbackSnapshot,
} from './HeroTacticalFeedbackSystem'
import {
  buildHeroAbilityPresentationSnapshot,
} from './HeroAbilityPresentationSystem'
import type {
  ActiveHeroAbilityTargetMode,
  ActiveHeroAbilityTargetEvaluation,
  HeroAbilityPresentationSnapshot,
} from './HeroAbilityPresentationSystem'
import {
  buildResurrectionReadabilitySnapshot,
} from './ResurrectionReadabilitySystem'
import type {
  ResurrectionReadabilitySnapshot,
} from './ResurrectionReadabilitySystem'

export interface HeroMilestoneCheck {
  key: string
  label: string
  completed: boolean
  detail: string
}

export interface HeroMilestoneSnapshot {
  milestone: 'R8'
  completed: boolean
  completedCount: number
  totalCount: number
  verdict: string
  heroCount: number
  maxHeroLevel: number
  learnedAbilityCount: number
  activeFeedbackCount: number
  tacticalAbilityCount: number
  tacticalReadyCount: number
  tacticalBlockedCount: number
  tacticalTargetHintCount: number
  abilityPresentation: HeroAbilityPresentationSnapshot
  resurrectionReadability: ResurrectionReadabilitySnapshot
  tactical: HeroTacticalFeedbackSnapshot
  abilityReadiness: HeroAbilityReadiness[]
  checks: HeroMilestoneCheck[]
}

const HERO_KEYS = ['paladin', 'archmage', 'mountain_king'] as const
const PALADIN_ABILITIES = ['holy_light', 'divine_shield', 'devotion_aura', 'resurrection'] as const
const ARCHMAGE_ABILITIES = ['brilliance_aura', 'blizzard', 'mass_teleport'] as const
const MOUNTAIN_KING_ABILITIES = ['storm_bolt', 'thunder_clap', 'bash', 'avatar'] as const

function alive(unit: Unit) {
  return unit.hp > 0 && !unit.isDead
}

function heroUnits(units: readonly Unit[]) {
  return units.filter(unit => !unit.isBuilding && !!UNITS[unit.type]?.isHero)
}

function learnedCount(hero: Unit | undefined, keys: readonly string[]) {
  if (!hero) return 0
  return keys.filter(key => (hero.abilityLevels?.[key] ?? 0) > 0).length
}

function hasAllAbilityData(keys: readonly string[]) {
  return keys.every(key => !!HERO_ABILITY_LEVELS[key])
}

export function buildHeroMilestoneSnapshot(input: {
  units: readonly Unit[]
  deadUnitRecords: readonly { team: number; type: string; x: number; z: number; diedAt: number }[]
  gameTime: number
  blizzardChannelActive: boolean
  blizzardChannelCaster: Unit | null
  massTeleportPendingActive: boolean
  massTeleportPendingCaster: Unit | null
  selectedUnits?: readonly Unit[]
  activeHeroTargetMode?: ActiveHeroAbilityTargetMode | null
  activeHeroTargetEvaluation?: ActiveHeroAbilityTargetEvaluation | null
  pointerGround?: { x: number; z: number } | null
}): HeroMilestoneSnapshot {
  const heroes = heroUnits(input.units)
  const liveHeroes = heroes.filter(alive)
  const playerHeroes = liveHeroes.filter(hero => hero.team === 0)
  const byType = new Map<string, Unit>()
  for (const hero of playerHeroes) {
    if (!byType.has(hero.type)) byType.set(hero.type, hero)
  }

  const maxHeroLevel = Math.max(1, ...heroes.map(hero => hero.heroLevel ?? 1))
  const learnedAbilityCount = heroes.reduce(
    (sum, hero) => sum + Object.values(hero.abilityLevels ?? {}).filter(level => level > 0).length,
    0,
  )
  const activeFeedbackCount = heroes.filter(hero =>
    (hero.abilityFeedbackText && hero.abilityFeedbackUntil > 0) ||
    hero.divineShieldUntil > 0 ||
    hero.resurrectionFeedbackUntil > 0 ||
    hero.avatarUntil > 0 ||
    hero.spellImmuneUntil > 0,
  ).length
  const summonCount = input.units.filter(unit => unit.type === 'water_elemental' && alive(unit)).length
  const anyReviveQueue = input.units.some(unit => unit.isBuilding && unit.reviveQueue.length > 0)
  const altarTrainsHeroes = HERO_KEYS.every(key => BUILDINGS.altar_of_kings.trains?.includes(key))

  const paladin = byType.get('paladin')
  const archmage = byType.get('archmage')
  const mountainKing = byType.get('mountain_king')
  const paladinLearned = learnedCount(paladin, PALADIN_ABILITIES)
  const archmageLearned = learnedCount(archmage, ['water_elemental', ...ARCHMAGE_ABILITIES])
  const mountainKingLearned = learnedCount(mountainKing, MOUNTAIN_KING_ABILITIES)
  const tactical = buildHeroTacticalFeedbackSnapshot({
    units: input.units,
    deadUnitRecords: input.deadUnitRecords,
    gameTime: input.gameTime,
    blizzardChannelCaster: input.blizzardChannelCaster,
    massTeleportPendingCaster: input.massTeleportPendingCaster,
  })
  const abilityPresentation = buildHeroAbilityPresentationSnapshot({
    tactical,
    selectedUnits: input.selectedUnits ?? [],
    activeTargetMode: input.activeHeroTargetMode ?? null,
    activeTargetEvaluation: input.activeHeroTargetEvaluation ?? null,
    pointerGround: input.pointerGround ?? null,
  })
  const resurrectionReadability = buildResurrectionReadabilitySnapshot({
    deadUnitRecords: input.deadUnitRecords,
    selectedUnits: input.selectedUnits ?? [],
  })
  const hasTargetKinds = (kinds: readonly string[]) =>
    kinds.every(kind => tactical.targetKinds.includes(kind as never))

  const checks: HeroMilestoneCheck[] = [
    {
      key: 'hero-roster',
      label: '三英雄入口',
      completed: altarTrainsHeroes && HERO_KEYS.every(key => !!UNITS[key]),
      detail: `祭坛英雄：${BUILDINGS.altar_of_kings.trains?.join(' / ') ?? '缺失'}`,
    },
    {
      key: 'xp-leveling',
      label: '经验与升级',
      completed: HERO_XP_RULES.maxHeroLevel >= 10 && maxHeroLevel > 1,
      detail: `最高等级 ${maxHeroLevel}，技能点规则 +${HERO_XP_RULES.skillPointsPerLevel}/级`,
    },
    {
      key: 'paladin-kit',
      label: '圣骑士技能链',
      completed: hasAllAbilityData(PALADIN_ABILITIES) && paladinLearned >= 3,
      detail: `已学习 ${paladinLearned}/${PALADIN_ABILITIES.length}：圣光、护盾、光环、复活`,
    },
    {
      key: 'archmage-kit',
      label: '大法师技能链',
      completed: hasAllAbilityData(ARCHMAGE_ABILITIES) &&
        WATER_ELEMENTAL_SUMMON_LEVELS.length >= 3 &&
        (archmageLearned >= 3 || summonCount > 0 || input.blizzardChannelActive || input.massTeleportPendingActive),
      detail: `已学习 ${archmageLearned}/4，水元素 ${summonCount}`,
    },
    {
      key: 'mountain-king-kit',
      label: '山丘之王技能链',
      completed: hasAllAbilityData(MOUNTAIN_KING_ABILITIES) &&
        (mountainKingLearned >= 3 || !!mountainKing?.avatarUntil || !!mountainKing?.stormBoltCooldownUntil),
      detail: `已学习 ${mountainKingLearned}/${MOUNTAIN_KING_ABILITIES.length}：锤、雷霆、猛击、化身`,
    },
    {
      key: 'death-revive-loop',
      label: '死亡 / 复活语义',
      completed: HERO_REVIVE_RULES.timeHardCap > 0 &&
        (input.deadUnitRecords.length > 0 || anyReviveQueue || heroes.some(hero => hero.isDead)),
      detail: `尸体记录 ${input.deadUnitRecords.length}，祭坛队列 ${anyReviveQueue ? '有' : '无'}`,
    },
    {
      key: 'tactical-feedback',
      label: '技能反馈',
      completed: activeFeedbackCount > 0 || input.blizzardChannelActive || input.massTeleportPendingActive || summonCount > 0,
      detail: `反馈英雄 ${activeFeedbackCount}，引导 ${input.blizzardChannelActive ? '有' : '无'}`,
    },
    {
      key: 'ability-readiness',
      label: '技能可用性矩阵',
      completed: tactical.abilityCount >= 10 &&
        tactical.targetHintCount >= 6 &&
        (tactical.readyAbilityCount + tactical.blockedAbilityCount + tactical.activeAbilityCount + tactical.passiveAbilityCount) === tactical.abilityCount,
      detail: `追踪 ${tactical.abilityCount} 个已学技能，可用 ${tactical.readyAbilityCount}，阻断 ${tactical.blockedAbilityCount}，生效 ${tactical.activeAbilityCount}`,
    },
    {
      key: 'target-legality',
      label: '目标合法性提示',
      completed: tactical.targetHintCount >= 6 &&
        hasTargetKinds(['self', 'friendly-unit', 'enemy-unit', 'ground', 'passive']),
      detail: `目标类型 ${tactical.targetKinds.join('/')}，提示 ${tactical.targetHintCount}`,
    },
    {
      key: 'ability-presentation',
      label: '施法预览语义',
      completed: abilityPresentation.completed,
      detail: `距离 ${abilityPresentation.rangePreviewCount}，范围 ${abilityPresentation.areaPreviewCount}，光标 ${abilityPresentation.cursorHintCount}`,
    },
    {
      key: 'revive-readability',
      label: '复活与冷却可读',
      completed: tactical.hasResurrection &&
        tactical.resurrectionReady &&
        (tactical.cooldownVisibleCount > 0 || tactical.activeAbilityCount > 0),
      detail: `复活 ${tactical.resurrectionDetail}，冷却提示 ${tactical.cooldownVisibleCount}`,
    },
    {
      key: 'resurrection-corpse-readability',
      label: '复活尸体可读',
      completed: resurrectionReadability.completed,
      detail: `尸体 ${resurrectionReadability.visibleCorpseMarkerCount}/${resurrectionReadability.corpseRecordCount}，可复活 ${resurrectionReadability.visibleEligibleCorpseMarkerCount}/${resurrectionReadability.eligibleCorpseCount}，范围 ${resurrectionReadability.resurrectionRadiusCount}`,
    },
  ]

  const completedCount = checks.filter(check => check.completed).length
  const completed = completedCount === checks.length
  return {
    milestone: 'R8',
    completed,
    completedCount,
    totalCount: checks.length,
    verdict: completed ? '完整英雄成局闭环' : '英雄成局仍有缺口',
    heroCount: heroes.length,
    maxHeroLevel,
    learnedAbilityCount,
    activeFeedbackCount,
    tacticalAbilityCount: tactical.abilityCount,
    tacticalReadyCount: tactical.readyAbilityCount,
    tacticalBlockedCount: tactical.blockedAbilityCount,
    tacticalTargetHintCount: tactical.targetHintCount,
    abilityPresentation,
    resurrectionReadability,
    tactical,
    abilityReadiness: tactical.abilities,
    checks,
  }
}
