import {
  BUILDINGS,
  HERO_ABILITY_LEVELS,
  ITEMS,
  PEASANT_BUILD_MENU,
  RESEARCHES,
  UNITS,
  WATER_ELEMENTAL_SUMMON_LEVELS,
} from '../GameData'
import type { Unit } from '../UnitTypes'
import {
  buildHumanCombatProfileSnapshot,
} from './HumanCombatProfileSystem'
import type { HumanCombatProfileSnapshot } from './HumanCombatProfileSystem'
import {
  buildHumanUpgradeImpactSnapshot,
} from './HumanUpgradeImpactSystem'
import type { HumanUpgradeImpactSnapshot } from './HumanUpgradeImpactSystem'

export type HumanRouteTone = 'economy' | 'army' | 'hero' | 'tech' | 'support' | 'late'
export type HumanRouteUnlockState = 'locked' | 'ready' | 'active' | 'complete'
export type HumanRouteRhythmPhase = 'opening' | 't1-army' | 't2-transition' | 't2-online' | 'castle-transition' | 't3-online'

export interface HumanRouteStepView {
  key: string
  label: string
  icon: string
  tone: HumanRouteTone
  completed: boolean
  liveProgress: number
  status: string
  detail: string
}

export type HumanRouteTechTier = 'townhall' | 'keep' | 'castle'

export interface HumanRouteUnlockView {
  key: string
  label: string
  icon: string
  tier: 'T1' | 'T2' | 'T3'
  tone: HumanRouteTone
  state: HumanRouteUnlockState
  available: boolean
  dataReady: boolean
  progress: number
  status: string
  blockedBy: string[]
  role: string
  nextAction: string
  impact: string
  detail: string
}

export interface HumanRouteTierSummary {
  currentTier: HumanRouteTechTier
  currentTierLabel: string
  completedTechBuildings: string[]
  productionLineCount: number
  availableUnlockCount: number
  totalUnlockCount: number
  nextActions: string[]
}

export interface HumanRouteRhythmSummary {
  phase: HumanRouteRhythmPhase
  phaseLabel: string
  roleCoverageCount: number
  completeRoleCount: number
  readyRoleCount: number
  totalRoleCount: number
  recommendedFocus: string
  nextPowerSpike: string
}

export interface HumanRouteSnapshot {
  milestone: 'R7'
  completed: boolean
  completedCount: number
  totalCount: number
  verdict: string
  tier: HumanRouteTierSummary
  unitKeys: string[]
  buildingKeys: string[]
  heroKeys: string[]
  researchKeys: string[]
  itemKeys: string[]
  steps: HumanRouteStepView[]
  unlocks: HumanRouteUnlockView[]
  rhythm: HumanRouteRhythmSummary
  combat: HumanCombatProfileSnapshot
  upgradeImpact: HumanUpgradeImpactSnapshot
}

function hasAll<T extends string>(source: Record<string, unknown>, keys: readonly T[]) {
  return keys.every(key => !!source[key])
}

function completedBuilding(units: readonly Unit[], type: string) {
  return units.some(unit =>
    unit.team === 0 &&
    unit.type === type &&
    unit.isBuilding &&
    unit.buildProgress >= 1 &&
    unit.hp > 0,
  )
}

function aliveUnit(units: readonly Unit[], type: string) {
  return units.some(unit =>
    unit.team === 0 &&
    unit.type === type &&
    !unit.isBuilding &&
    unit.hp > 0 &&
    !unit.isDead,
  )
}

function completedResearch(units: readonly Unit[], key: string) {
  return units.some(unit =>
    unit.team === 0 &&
    unit.isBuilding &&
    unit.completedResearches.includes(key),
  )
}

function missingBuildings(units: readonly Unit[], keys: readonly string[]) {
  return keys.filter(key => !completedBuilding(units, key))
}

function missingResearches(units: readonly Unit[], keys: readonly string[]) {
  return keys.filter(key => !completedResearch(units, key))
}

function liveProgress(count: number, target: number) {
  return Math.max(0, Math.min(1, count / Math.max(1, target)))
}

function unlockState(ready: boolean, active: boolean, complete: boolean): HumanRouteUnlockState {
  if (complete) return 'complete'
  if (active) return 'active'
  if (ready) return 'ready'
  return 'locked'
}

function researchCount(units: readonly Unit[], keys: readonly string[]) {
  return keys.filter(key => completedResearch(units, key)).length
}

function firstMissingBuildingAction(units: readonly Unit[], keys: readonly string[], fallback: string) {
  const missing = missingBuildings(units, keys)
  if (missing.length === 0) return fallback
  return `补 ${missing.map(key => BUILDINGS[key]?.name ?? key).join('/')}`
}

function firstMissingResearchAction(units: readonly Unit[], keys: readonly string[], fallback: string) {
  const missing = missingResearches(units, keys)
  if (missing.length === 0) return fallback
  return `研究 ${missing.slice(0, 2).map(key => RESEARCHES[key]?.name ?? key).join('/')}`
}

function stateLabel(state: HumanRouteUnlockState) {
  if (state === 'complete') return '成型'
  if (state === 'active') return '运转'
  if (state === 'ready') return '可接'
  return '锁定'
}

export function buildHumanRouteSnapshot(units: readonly Unit[]): HumanRouteSnapshot {
  const workerCore = ['worker'] as const
  const buildingCore = [
    'townhall',
    'farm',
    'barracks',
    'blacksmith',
    'lumber_mill',
    'workshop',
    'arcane_sanctum',
    'altar_of_kings',
    'arcane_vault',
    'keep',
    'castle',
  ] as const
  const armyCore = ['footman', 'rifleman', 'mortar_team', 'priest', 'sorceress', 'knight', 'militia'] as const
  const heroCore = ['paladin', 'archmage', 'mountain_king'] as const
  const researchCore = [
    'long_rifles',
    'iron_forged_swords',
    'steel_forged_swords',
    'mithril_forged_swords',
    'black_gunpowder',
    'refined_gunpowder',
    'imbued_gunpowder',
    'iron_plating',
    'steel_plating',
    'mithril_plating',
    'studded_leather_armor',
    'reinforced_leather_armor',
    'dragonhide_armor',
    'animal_war_training',
  ] as const
  const heroAbilityCore = [
    'holy_light',
    'divine_shield',
    'devotion_aura',
    'resurrection',
    'brilliance_aura',
    'blizzard',
    'mass_teleport',
    'storm_bolt',
    'thunder_clap',
    'bash',
    'avatar',
  ] as const
  const itemCore = ['healing_potion', 'mana_potion', 'boots_of_speed', 'scroll_of_town_portal'] as const

  const liveWorkers = units.filter(unit => unit.team === 0 && unit.type === 'worker' && unit.hp > 0).length
  const liveCombat = armyCore.filter(key => aliveUnit(units, key)).length
  const liveHeroes = heroCore.filter(key => aliveUnit(units, key)).length
  const liveBuildings = buildingCore.filter(key => completedBuilding(units, key)).length
  const liveResearch = researchCore.filter(key => completedResearch(units, key)).length
  const completedTechBuildings = ['townhall', 'keep', 'castle', 'blacksmith', 'lumber_mill', 'arcane_sanctum', 'workshop']
    .filter(key => completedBuilding(units, key))
  const currentTier: HumanRouteTechTier = completedBuilding(units, 'castle')
    ? 'castle'
    : completedBuilding(units, 'keep')
      ? 'keep'
      : 'townhall'
  const currentTierLabel = currentTier === 'castle' ? 'T3 Castle' : currentTier === 'keep' ? 'T2 Keep' : 'T1 Town Hall'
  const productionLineCount = ['barracks', 'altar_of_kings', 'arcane_sanctum', 'workshop', currentTier]
    .filter(key => completedBuilding(units, key)).length

  const steps: HumanRouteStepView[] = [
    {
      key: 'economy',
      label: '经济与人口',
      icon: '农',
      tone: 'economy',
      completed: hasAll(UNITS, workerCore) && hasAll(BUILDINGS, ['townhall', 'farm', 'lumber_mill']),
      liveProgress: liveProgress(
        Number(completedBuilding(units, 'townhall')) +
          Number(completedBuilding(units, 'farm')) +
          Number(completedBuilding(units, 'lumber_mill')) +
          Math.min(liveWorkers, 5),
        8,
      ),
      status: `农民${liveWorkers} / 主基地${completedBuilding(units, 'townhall') ? '在线' : '缺失'}`,
      detail: '农民、主基地、农场、伐木场定义了人族开局经济和人口路线',
    },
    {
      key: 'barracks',
      label: '兵营主线',
      icon: '兵',
      tone: 'army',
      completed: hasAll(BUILDINGS, ['barracks', 'blacksmith']) && hasAll(UNITS, ['footman', 'rifleman']),
      liveProgress: liveProgress(
        Number(completedBuilding(units, 'barracks')) +
          Number(completedBuilding(units, 'blacksmith')) +
          Number(aliveUnit(units, 'footman')) +
          Number(aliveUnit(units, 'rifleman')),
        4,
      ),
      status: `步兵${aliveUnit(units, 'footman') ? '有' : '未出'} / 步枪${aliveUnit(units, 'rifleman') ? '有' : '未出'}`,
      detail: 'Footman 到 Rifleman 是当前人族基础军队的主轴',
    },
    {
      key: 'hero',
      label: '三英雄',
      icon: '英',
      tone: 'hero',
      completed: hasAll(BUILDINGS, ['altar_of_kings']) &&
        hasAll(UNITS, heroCore) &&
        hasAll(HERO_ABILITY_LEVELS, heroAbilityCore) &&
        WATER_ELEMENTAL_SUMMON_LEVELS.length >= 3,
      liveProgress: liveProgress(Number(completedBuilding(units, 'altar_of_kings')) + liveHeroes, 4),
      status: `英雄${liveHeroes}/3`,
      detail: 'Paladin / Archmage / Mountain King 已进入同一祭坛和技能路线',
    },
    {
      key: 'support',
      label: '商店与法师',
      icon: '辅',
      tone: 'support',
      completed: hasAll(BUILDINGS, ['arcane_vault', 'arcane_sanctum']) &&
        hasAll(UNITS, ['priest', 'sorceress']) &&
        hasAll(ITEMS, itemCore),
      liveProgress: liveProgress(
        Number(completedBuilding(units, 'arcane_vault')) +
          Number(completedBuilding(units, 'arcane_sanctum')) +
          Number(aliveUnit(units, 'priest')) +
          Number(aliveUnit(units, 'sorceress')),
        4,
      ),
      status: `商店${completedBuilding(units, 'arcane_vault') ? '在线' : '未建'} / 法师${aliveUnit(units, 'priest') || aliveUnit(units, 'sorceress') ? '已出' : '未出'}`,
      detail: 'Arcane Vault、Priest、Sorceress 把补给、治疗和控制接回短局',
    },
    {
      key: 'tech',
      label: '铁匠铺科技',
      icon: '科',
      tone: 'tech',
      completed: hasAll(RESEARCHES, researchCore),
      liveProgress: liveProgress(liveResearch, researchCore.length),
      status: `已研究${liveResearch}/${researchCore.length}`,
      detail: '武器、护甲、射程、攻城、皮甲和骑士生命值升级都由数据驱动研究模型承载',
    },
    {
      key: 'late',
      label: '二三本后段',
      icon: '三',
      tone: 'late',
      completed: hasAll(BUILDINGS, ['keep', 'castle', 'workshop']) && hasAll(UNITS, ['mortar_team', 'knight']),
      liveProgress: liveProgress(
        Number(completedBuilding(units, 'keep')) +
          Number(completedBuilding(units, 'castle')) +
          Number(completedBuilding(units, 'workshop')) +
          Number(aliveUnit(units, 'mortar_team')) +
          Number(aliveUnit(units, 'knight')),
        5,
      ),
      status: `后段建筑${liveBuildings}/${buildingCore.length}`,
      detail: 'Keep/Castle、Workshop、Mortar、Knight 构成当前后段路线基线',
    },
  ]

  const fullMeleeChain = ['iron_forged_swords', 'steel_forged_swords', 'mithril_forged_swords'] as const
  const fullRangedChain = ['black_gunpowder', 'refined_gunpowder', 'imbued_gunpowder'] as const
  const fullPlatingChain = ['iron_plating', 'steel_plating', 'mithril_plating'] as const
  const fullLeatherChain = ['studded_leather_armor', 'reinforced_leather_armor', 'dragonhide_armor'] as const
  const fullUpgradeChain = [
    ...fullMeleeChain,
    ...fullRangedChain,
    ...fullPlatingChain,
    ...fullLeatherChain,
  ] as const
  const t1RifleReady = completedBuilding(units, 'barracks') && completedBuilding(units, 'blacksmith')
  const t1RifleActive = t1RifleReady && aliveUnit(units, 'rifleman')
  const t1RifleComplete = t1RifleActive && completedResearch(units, 'long_rifles')
  const t2CasterReady = completedBuilding(units, 'keep') && completedBuilding(units, 'arcane_sanctum')
  const t2CasterActive = t2CasterReady && (aliveUnit(units, 'priest') || aliveUnit(units, 'sorceress'))
  const t2CasterComplete = t2CasterReady && aliveUnit(units, 'priest') && aliveUnit(units, 'sorceress')
  const t2SiegeReady = completedBuilding(units, 'keep') && completedBuilding(units, 'workshop')
  const t2SiegeActive = t2SiegeReady && aliveUnit(units, 'mortar_team')
  const t3KnightReady = completedBuilding(units, 'castle') &&
    completedBuilding(units, 'blacksmith') &&
    completedBuilding(units, 'lumber_mill')
  const t3KnightActive = t3KnightReady && aliveUnit(units, 'knight')
  const upgradeChainCount = researchCount(units, fullUpgradeChain)
  const upgradeChainReady = completedBuilding(units, 'blacksmith')
  const upgradeChainActive = upgradeChainCount > 0
  const upgradeChainComplete = upgradeChainCount === fullUpgradeChain.length
  const animalReady = completedBuilding(units, 'castle') &&
    completedBuilding(units, 'barracks') &&
    completedBuilding(units, 'lumber_mill') &&
    completedBuilding(units, 'blacksmith')
  const animalComplete = animalReady && completedResearch(units, 'animal_war_training')

  const unlocks: HumanRouteUnlockView[] = [
    {
      key: 't1-rifleman',
      label: 'T1 步枪兵',
      icon: '枪',
      tier: 'T1',
      tone: 'army',
      state: unlockState(t1RifleReady, t1RifleActive, t1RifleComplete),
      available: t1RifleActive,
      dataReady: hasAll(BUILDINGS, ['barracks', 'blacksmith']) && hasAll(UNITS, ['rifleman']),
      progress: liveProgress(
        Number(completedBuilding(units, 'barracks')) +
          Number(completedBuilding(units, 'blacksmith')) +
          Number(aliveUnit(units, 'rifleman')) +
          Number(completedResearch(units, 'long_rifles')),
        4,
      ),
      status: `${stateLabel(unlockState(t1RifleReady, t1RifleActive, t1RifleComplete))} · ${aliveUnit(units, 'rifleman') ? '已出场' : `缺 ${missingBuildings(units, ['barracks', 'blacksmith']).join('/') || '训练'}`}`,
      blockedBy: missingBuildings(units, ['barracks', 'blacksmith']),
      role: '远程火力',
      nextAction: !t1RifleReady
        ? firstMissingBuildingAction(units, ['barracks', 'blacksmith'], '训练 Rifleman')
        : !aliveUnit(units, 'rifleman')
          ? '训练 Rifleman'
          : completedResearch(units, 'long_rifles')
            ? '保持远程输出'
            : '研究 Long Rifles',
      impact: '让 T1 部队从近战承伤过渡到远程集火，打开更安全的野怪和防守节奏',
      detail: 'Blacksmith 解锁 Rifleman，让人族从 Footman 过渡到远程火力',
    },
    {
      key: 't2-caster-line',
      label: 'T2 法师线',
      icon: '法',
      tier: 'T2',
      tone: 'support',
      state: unlockState(t2CasterReady, t2CasterActive, t2CasterComplete),
      available: t2CasterComplete,
      dataReady: hasAll(BUILDINGS, ['keep', 'arcane_sanctum']) && hasAll(UNITS, ['priest', 'sorceress']),
      progress: liveProgress(
        Number(completedBuilding(units, 'keep')) +
          Number(completedBuilding(units, 'arcane_sanctum')) +
          Number(aliveUnit(units, 'priest')) +
          Number(aliveUnit(units, 'sorceress')),
        4,
      ),
      status: `${stateLabel(unlockState(t2CasterReady, t2CasterActive, t2CasterComplete))} · ${completedBuilding(units, 'keep') ? 'Keep' : '缺Keep'} / ${completedBuilding(units, 'arcane_sanctum') ? '圣殿' : '缺圣殿'} / 法师${aliveUnit(units, 'priest') || aliveUnit(units, 'sorceress') ? '已出' : '未出'}`,
      blockedBy: missingBuildings(units, ['keep', 'arcane_sanctum']),
      role: '治疗与控制',
      nextAction: !t2CasterReady
        ? firstMissingBuildingAction(units, ['keep', 'arcane_sanctum'], '训练 Priest/Sorceress')
        : !aliveUnit(units, 'priest')
          ? '训练 Priest'
          : !aliveUnit(units, 'sorceress')
            ? '训练 Sorceress'
            : '维持治疗+减速支援',
      impact: '把 T2 从纯出兵升级为续航和控制，让短局交战不只比数量',
      detail: 'Keep 后接 Arcane Sanctum，打开 Priest 治疗和 Sorceress 控制',
    },
    {
      key: 't2-workshop-siege',
      label: 'T2 车间攻城',
      icon: '车',
      tier: 'T2',
      tone: 'army',
      state: unlockState(t2SiegeReady, t2SiegeActive, t2SiegeActive),
      available: t2SiegeActive,
      dataReady: hasAll(BUILDINGS, ['keep', 'workshop']) && hasAll(UNITS, ['mortar_team']),
      progress: liveProgress(
        Number(completedBuilding(units, 'keep')) +
          Number(completedBuilding(units, 'workshop')) +
          Number(aliveUnit(units, 'mortar_team')),
        3,
      ),
      status: `${stateLabel(unlockState(t2SiegeReady, t2SiegeActive, t2SiegeActive))} · ${completedBuilding(units, 'workshop') ? '车间' : '缺车间'} / 迫击炮${aliveUnit(units, 'mortar_team') ? '已出' : '未出'}`,
      blockedBy: missingBuildings(units, ['keep', 'workshop']),
      role: '破防攻城',
      nextAction: !t2SiegeReady
        ? firstMissingBuildingAction(units, ['keep', 'workshop'], '训练 Mortar Team')
        : aliveUnit(units, 'mortar_team')
          ? '保护迫击炮推进'
          : '训练 Mortar Team',
      impact: '给玩家处理塔、防守建筑和密集阵型的选择，不再只靠 Footman/Rifleman 正面硬打',
      detail: 'Workshop 和 Mortar Team 让玩家能处理建筑、防御塔和站位密集目标',
    },
    {
      key: 't3-knight-line',
      label: 'T3 骑士线',
      icon: '骑',
      tier: 'T3',
      tone: 'late',
      state: unlockState(t3KnightReady, t3KnightActive, t3KnightActive),
      available: t3KnightActive,
      dataReady: hasAll(BUILDINGS, ['castle', 'blacksmith', 'lumber_mill']) && hasAll(UNITS, ['knight']),
      progress: liveProgress(
        Number(completedBuilding(units, 'castle')) +
          Number(completedBuilding(units, 'blacksmith')) +
          Number(completedBuilding(units, 'lumber_mill')) +
          Number(aliveUnit(units, 'knight')),
        4,
      ),
      status: `${stateLabel(unlockState(t3KnightReady, t3KnightActive, t3KnightActive))} · ${completedBuilding(units, 'castle') ? 'Castle' : '缺Castle'} / 骑士${aliveUnit(units, 'knight') ? '已出' : '未出'}`,
      blockedBy: missingBuildings(units, ['castle', 'blacksmith', 'lumber_mill']),
      role: '重甲前排',
      nextAction: !t3KnightReady
        ? firstMissingBuildingAction(units, ['castle', 'blacksmith', 'lumber_mill'], '训练 Knight')
        : aliveUnit(units, 'knight')
          ? '用 Knight 接战保护后排'
          : '训练 Knight',
      impact: '把三本转型落到可承伤的机动前排，支撑法师和迫击炮输出',
      detail: 'Castle + Blacksmith + Lumber Mill 是当前 Knight 的完整运行时前置',
    },
    {
      key: 't3-upgrade-chains',
      label: 'T3 攻防科技链',
      icon: '攻',
      tier: 'T3',
      tone: 'tech',
      state: unlockState(upgradeChainReady, upgradeChainActive, upgradeChainComplete),
      available: upgradeChainComplete,
      dataReady: hasAll(RESEARCHES, [
        ...fullUpgradeChain,
      ]),
      progress: liveProgress(upgradeChainCount, fullUpgradeChain.length),
      status: `${stateLabel(unlockState(upgradeChainReady, upgradeChainActive, upgradeChainComplete))} · 攻防链 ${upgradeChainCount}/12`,
      blockedBy: missingResearches(units, fullUpgradeChain),
      role: '数值成长',
      nextAction: upgradeChainComplete
        ? '攻防链已满'
        : !upgradeChainReady
          ? firstMissingBuildingAction(units, ['blacksmith'], '研究攻防科技')
          : firstMissingResearchAction(units, fullUpgradeChain, '继续研究攻防科技'),
      impact: '让 T1/T2/T3 单位随局势成长，避免后期只靠新增单位而没有升级曲线',
      detail: '近战、远程、板甲、皮甲各有 T1/T2/T3 链路，避免科技只停在一层数据种子',
    },
    {
      key: 't3-animal-war-training',
      label: 'T3 骑士生命科技',
      icon: '兽',
      tier: 'T3',
      tone: 'late',
      state: unlockState(animalReady, animalComplete, animalComplete),
      available: animalComplete,
      dataReady: hasAll(RESEARCHES, ['animal_war_training']),
      progress: liveProgress(
        Number(completedBuilding(units, 'castle')) +
          Number(completedBuilding(units, 'barracks')) +
          Number(completedBuilding(units, 'lumber_mill')) +
          Number(completedBuilding(units, 'blacksmith')) +
          Number(completedResearch(units, 'animal_war_training')),
        5,
      ),
      status: `${stateLabel(unlockState(animalReady, animalComplete, animalComplete))} · ${completedResearch(units, 'animal_war_training') ? '已研究' : '未研究'}`,
      blockedBy: [
        ...missingBuildings(units, ['castle', 'barracks', 'lumber_mill', 'blacksmith']),
        ...missingResearches(units, ['animal_war_training']),
      ],
      role: '骑士耐久',
      nextAction: animalComplete
        ? 'Knight 生命科技在线'
        : !animalReady
          ? firstMissingBuildingAction(units, ['castle', 'barracks', 'lumber_mill', 'blacksmith'], '研究 Animal War Training')
          : '研究 Animal War Training',
      impact: '让 Knight 从能造变成能承担后段正面压力，是三本强度闭环',
      detail: 'Animal War Training 是当前 Knight 后段强度的关键闭环',
    },
  ]

  const completedCount = steps.filter(step => step.completed).length
  const combat = buildHumanCombatProfileSnapshot(units)
  const upgradeImpact = buildHumanUpgradeImpactSnapshot(units)
  const availableUnlockCount = unlocks.filter(unlock => unlock.available && unlock.dataReady).length
  const roleCoverageCount = unlocks.filter(unlock => unlock.state === 'active' || unlock.state === 'complete').length
  const completeRoleCount = unlocks.filter(unlock => unlock.state === 'complete').length
  const readyRoleCount = unlocks.filter(unlock => unlock.state === 'ready').length
  const incompleteUnlock = unlocks.find(unlock => unlock.state !== 'complete')
  const phase: HumanRouteRhythmPhase = currentTier === 'castle'
    ? completeRoleCount >= 4 ? 't3-online' : 'castle-transition'
    : currentTier === 'keep'
      ? (t2CasterActive || t2SiegeActive) ? 't2-online' : 't2-transition'
      : t1RifleActive ? 't1-army' : 'opening'
  const phaseLabel = {
    opening: 'T1 开局运营',
    't1-army': 'T1 远程过渡',
    't2-transition': 'T2 转型窗口',
    't2-online': 'T2 支援/攻城在线',
    'castle-transition': 'T3 城堡转型',
    't3-online': 'T3 混编成型',
  }[phase]
  const recommendedFocus = incompleteUnlock
    ? `${incompleteUnlock.label}: ${incompleteUnlock.nextAction}`
    : '推进敌基或争夺地图目标'
  const nextPowerSpike = incompleteUnlock
    ? `${incompleteUnlock.label} -> ${incompleteUnlock.impact}`
    : 'Knight 前排、法师支援、迫击炮破防和攻防链已形成当前后段强度'
  const nextActions = unlocks
    .filter(unlock => !unlock.available)
    .slice(0, 3)
    .map(unlock => `${unlock.label}: ${unlock.nextAction}`)
  const completed = completedCount === steps.length &&
    availableUnlockCount === unlocks.length &&
    PEASANT_BUILD_MENU.includes('altar_of_kings') &&
    BUILDINGS.arcane_vault.shopItems?.includes('scroll_of_town_portal') === true

  return {
    milestone: 'R7',
    completed,
    completedCount: completedCount + availableUnlockCount,
    totalCount: steps.length + unlocks.length,
    verdict: completed ? '完整 Human 路线闭环' : 'Human 路线仍有缺口',
    tier: {
      currentTier,
      currentTierLabel,
      completedTechBuildings,
      productionLineCount,
      availableUnlockCount,
      totalUnlockCount: unlocks.length,
      nextActions,
    },
    unitKeys: [...workerCore, ...armyCore, ...heroCore],
    buildingKeys: [...buildingCore],
    heroKeys: [...heroCore],
    researchKeys: [...researchCore],
    itemKeys: [...itemCore],
    steps,
    unlocks,
    rhythm: {
      phase,
      phaseLabel,
      roleCoverageCount,
      completeRoleCount,
      readyRoleCount,
      totalRoleCount: unlocks.length,
      recommendedFocus,
      nextPowerSpike,
    },
    combat,
    upgradeImpact,
  }
}
