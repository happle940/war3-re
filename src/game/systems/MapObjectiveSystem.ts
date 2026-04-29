import { GOLDMINE_GOLD, TREE_LUMBER, UNITS } from '../GameData'
import type { TreeEntry } from '../TreeManager'
import type { Unit } from '../UnitTypes'
import type { AIPressureSnapshot } from './AIPressureSystem'

export type MapObjectiveKey =
  | 'playerBase'
  | 'goldline'
  | 'treeLine'
  | 'creepCamp'
  | 'playerShop'
  | 'enemyBase'

export type MapObjectiveTone = 'base' | 'economy' | 'lumber' | 'map' | 'shop' | 'attack'

export interface MapObjectiveView {
  key: MapObjectiveKey
  label: string
  icon: string
  tone: MapObjectiveTone
  status: string
  progressValue: number
  targetX: number | null
  targetZ: number | null
  distanceText: string
  detail: string
}

export interface BattlefieldReadabilityCheck {
  key: string
  label: string
  completed: boolean
  detail: string
}

export interface BattlefieldReadabilitySnapshot {
  milestone: 'R11'
  completed: boolean
  completedCount: number
  totalCount: number
  verdict: string
  checks: BattlefieldReadabilityCheck[]
}

const MAIN_HALL_TYPES = new Set(['townhall', 'keep', 'castle'])

function alive(unit: Unit) {
  return unit.hp > 0 && !unit.isDead
}

function distance(a: Unit, b: Unit) {
  return a.mesh.position.distanceTo(b.mesh.position)
}

function distanceText(from: Unit | null, to: Unit | null) {
  if (!from || !to) return '--'
  return `${Math.round(distance(from, to))}格`
}

function positionOf(unit: Unit | null) {
  if (!unit) return { targetX: null, targetZ: null }
  return {
    targetX: unit.mesh.position.x,
    targetZ: unit.mesh.position.z,
  }
}

function treePosition(tree: TreeEntry | null) {
  if (!tree) return { targetX: null, targetZ: null }
  return {
    targetX: tree.mesh.position.x,
    targetZ: tree.mesh.position.z,
  }
}

function pointDistance(a: { x: number; z: number }, b: { x: number; z: number }) {
  return Math.hypot(a.x - b.x, a.z - b.z)
}

function treeDistanceText(from: Unit | null, to: TreeEntry | null) {
  if (!from || !to) return '--'
  return `${Math.round(from.mesh.position.distanceTo(to.mesh.position))}格`
}

function mainHall(units: readonly Unit[], team: number) {
  return units.find(unit =>
    unit.team === team &&
    unit.isBuilding &&
    MAIN_HALL_TYPES.has(unit.type) &&
    alive(unit),
  ) ?? null
}

function nearestTo(units: readonly Unit[], from: Unit | null, predicate: (unit: Unit) => boolean) {
  const candidates = units.filter(unit => predicate(unit) && alive(unit))
  if (candidates.length === 0) return null
  if (!from) return candidates[0]
  return candidates.sort((a, b) => distance(from, a) - distance(from, b))[0]
}

function nearestTreeTo(trees: readonly TreeEntry[], from: Unit | null) {
  const candidates = trees.filter(tree => tree.remainingLumber > 0)
  if (candidates.length === 0) return null
  if (!from) return candidates[0]
  return candidates.sort((a, b) =>
    from.mesh.position.distanceTo(a.mesh.position) -
    from.mesh.position.distanceTo(b.mesh.position),
  )[0]
}

function shopHintPosition(playerHall: Unit | null) {
  if (!playerHall) return { targetX: null, targetZ: null }
  return {
    targetX: playerHall.mesh.position.x + 7,
    targetZ: playerHall.mesh.position.z + 1,
  }
}

export function buildMapObjectives(
  units: readonly Unit[],
  aiPressure?: AIPressureSnapshot | null,
  trees: readonly TreeEntry[] = [],
): MapObjectiveView[] {
  const playerHall = mainHall(units, 0)
  const enemyHall = mainHall(units, 1)
  const nearestMine = nearestTo(units, playerHall, unit => unit.type === 'goldmine' && unit.remainingGold > 0)
  const nearestTree = nearestTreeTo(trees, playerHall)
  const nearestCreep = nearestTo(units, playerHall, unit =>
    unit.team === 2 &&
    !unit.isBuilding &&
    !!UNITS[unit.type]?.isCreep,
  )
  const playerShop = nearestTo(units, playerHall, unit =>
    unit.team === 0 &&
    unit.isBuilding &&
    unit.type === 'arcane_vault' &&
    unit.buildProgress >= 1,
  )
  const activeGoldWorkers = units.filter(unit =>
    unit.team === 0 &&
    unit.type === 'worker' &&
    alive(unit) &&
    unit.gatherType === 'gold' &&
    unit.resourceTarget?.type === 'goldmine',
  ).length
  const aliveCreeps = units.filter(unit =>
    unit.team === 2 &&
    alive(unit) &&
    !unit.isBuilding &&
    !!UNITS[unit.type]?.isCreep,
  ).length
  const enemyHpPct = enemyHall
    ? Math.max(0, Math.round((enemyHall.hp / enemyHall.maxHp) * 100))
    : 0
  const playerHpPct = playerHall
    ? Math.max(0, Math.round((playerHall.hp / playerHall.maxHp) * 100))
    : 0
  const mineRemaining = nearestMine
    ? Math.max(0, nearestMine.remainingGold)
    : 0
  const playerHallPoint = playerHall
    ? { x: playerHall.mesh.position.x, z: playerHall.mesh.position.z }
    : null
  const nearbyTrees = playerHallPoint
    ? trees.filter(tree =>
      tree.remainingLumber > 0 &&
        pointDistance(playerHallPoint, { x: tree.mesh.position.x, z: tree.mesh.position.z }) <= 18,
    )
    : trees.filter(tree => tree.remainingLumber > 0)
  const nearbyTreeLumber = nearbyTrees.reduce((sum, tree) => sum + Math.max(0, tree.remainingLumber), 0)
  const shopTarget = playerShop
    ? positionOf(playerShop)
    : shopHintPosition(playerHall)

  return [
    {
      key: 'playerBase',
      label: '我方基地',
      icon: '⌂',
      tone: 'base',
      status: playerHall ? `${playerHpPct}% · ${aiPressure?.playerBaseThreatLabel ?? '安全'}` : '已失守',
      progressValue: playerHall ? playerHall.hp / playerHall.maxHp : 0,
      ...positionOf(playerHall),
      distanceText: '本阵',
      detail: '玩家主基地存活状态和 AI 压力预警',
    },
    {
      key: 'goldline',
      label: '金矿线',
      icon: '◆',
      tone: 'economy',
      status: nearestMine ? `${Math.min(activeGoldWorkers, 5)}/5矿工 · ${mineRemaining}金` : '无可见金矿',
      progressValue: nearestMine ? Math.max(0, Math.min(1, mineRemaining / GOLDMINE_GOLD)) : 0,
      ...positionOf(nearestMine),
      distanceText: distanceText(playerHall, nearestMine),
      detail: '最近金矿、剩余储量和当前采金饱和度',
    },
    {
      key: 'treeLine',
      label: '树线',
      icon: '♣',
      tone: 'lumber',
      status: nearestTree ? `${nearbyTrees.length}片 · ${nearbyTreeLumber}木` : '无可见树线',
      progressValue: nearestTree ? Math.max(0, Math.min(1, nearbyTreeLumber / (TREE_LUMBER * 18))) : 0,
      ...treePosition(nearestTree),
      distanceText: treeDistanceText(playerHall, nearestTree),
      detail: '最近可伐木树线，决定开局木材、农场和科技建筑节奏',
    },
    {
      key: 'creepCamp',
      label: '野怪营地',
      icon: '◇',
      tone: 'map',
      status: aliveCreeps > 0 ? `${aliveCreeps}只 · 可练级` : '已清空',
      progressValue: aliveCreeps > 0 ? 1 : 0,
      ...positionOf(nearestCreep),
      distanceText: distanceText(playerHall, nearestCreep),
      detail: '最近中立营地，用于英雄练级和物品掉落',
    },
    {
      key: 'playerShop',
      label: '商店补给',
      icon: '✚',
      tone: 'shop',
      status: playerShop ? '已建成' : '未建 · 建议基地侧翼',
      progressValue: playerShop ? 1 : 0,
      ...shopTarget,
      distanceText: playerShop
        ? distanceText(playerHall, playerShop)
        : playerHall && shopTarget.targetX !== null && shopTarget.targetZ !== null
          ? `${Math.round(Math.hypot(playerHall.mesh.position.x - shopTarget.targetX, playerHall.mesh.position.z - shopTarget.targetZ))}格`
          : '--',
      detail: 'Arcane Vault 是英雄药水和基础装备入口',
    },
    {
      key: 'enemyBase',
      label: '敌方基地',
      icon: '⌖',
      tone: 'attack',
      status: enemyHall ? `${enemyHpPct}% · AI ${aiPressure?.directorPhaseLabel ?? '开局'}` : '已摧毁',
      progressValue: enemyHall ? Math.max(0, Math.min(1, 1 - enemyHall.hp / enemyHall.maxHp)) : 1,
      ...positionOf(enemyHall),
      distanceText: distanceText(playerHall, enemyHall),
      detail: '最终进攻目标，压低敌方主基地血量即可形成胜势',
    },
  ]
}

export function buildBattlefieldReadabilitySnapshot(input: {
  objectives: readonly MapObjectiveView[]
  worldBeaconCount: number
  minimapTargetCount: number
}): BattlefieldReadabilitySnapshot {
  const requiredKeys: MapObjectiveKey[] = [
    'playerBase',
    'goldline',
    'treeLine',
    'creepCamp',
    'playerShop',
    'enemyBase',
  ]
  const byKey = new Map(input.objectives.map(objective => [objective.key, objective]))
  const targetsWithPosition = input.objectives.filter(objective =>
    objective.targetX !== null &&
    objective.targetZ !== null,
  ).length
  const checks: BattlefieldReadabilityCheck[] = [
    {
      key: 'hud-targets',
      label: 'HUD 战场目标齐全',
      completed: requiredKeys.every(key => byKey.has(key)),
      detail: `${input.objectives.length}/${requiredKeys.length}`,
    },
    {
      key: 'target-position',
      label: '目标都有地图位置',
      completed: targetsWithPosition >= 5,
      detail: `${targetsWithPosition}个可定位目标`,
    },
    {
      key: 'world-beacons',
      label: '主视角目标信标',
      completed: input.worldBeaconCount >= 5,
      detail: `${input.worldBeaconCount}个信标`,
    },
    {
      key: 'minimap-markers',
      label: '小地图目标圈',
      completed: input.minimapTargetCount >= 5,
      detail: `${input.minimapTargetCount}个目标圈`,
    },
    {
      key: 'resource-readability',
      label: '资源点可读',
      completed: !!byKey.get('goldline')?.status && !!byKey.get('treeLine')?.status,
      detail: `${byKey.get('goldline')?.status ?? '--'} / ${byKey.get('treeLine')?.status ?? '--'}`,
    },
    {
      key: 'combat-readability',
      label: '争夺目标可读',
      completed: !!byKey.get('creepCamp')?.status && !!byKey.get('enemyBase')?.status,
      detail: `${byKey.get('creepCamp')?.status ?? '--'} / ${byKey.get('enemyBase')?.status ?? '--'}`,
    },
  ]
  const completedCount = checks.filter(check => check.completed).length
  const completed = completedCount === checks.length
  return {
    milestone: 'R11',
    completed,
    completedCount,
    totalCount: checks.length,
    verdict: completed ? '完整战场可读闭环' : '战场可读性仍有缺口',
    checks,
  }
}

export function buildMapObjectiveStateKey(objectives: readonly MapObjectiveView[]): string {
  return objectives
    .map(objective => [
      objective.key,
      objective.status,
      objective.distanceText,
      Math.round(objective.progressValue * 100),
      Math.round(objective.targetX ?? -1),
      Math.round(objective.targetZ ?? -1),
    ].join(':'))
    .join('|')
}
