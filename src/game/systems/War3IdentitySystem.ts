import { BUILDINGS, ITEMS, UNITS } from '../GameData'
import type { ItemKey } from '../GameData'
import type { Unit } from '../UnitTypes'
import type { MapObjectiveView } from './MapObjectiveSystem'
import type { VisibilitySnapshot, VisibilitySystem } from './VisibilitySystem'

export interface WorldItemIdentityView {
  type: ItemKey
  explored: boolean
  visible: boolean
}

export interface War3IdentityCheck {
  key: string
  label: string
  completed: boolean
  detail: string
}

export interface War3IdentitySnapshot {
  milestone: 'R12'
  completed: boolean
  completedCount: number
  totalCount: number
  verdict: string
  visibility: VisibilitySnapshot
  scoutedObjectiveCount: number
  visibleEnemyCount: number
  visibleNeutralCount: number
  worldItems: WorldItemIdentityView[]
  checks: War3IdentityCheck[]
}

function alive(unit: Unit) {
  return unit.hp > 0 && !unit.isDead
}

function hasCompletedBuilding(units: readonly Unit[], team: number, type: string) {
  return units.some(unit =>
    unit.team === team &&
    unit.type === type &&
    unit.isBuilding &&
    unit.buildProgress >= 1 &&
    alive(unit),
  )
}

export function buildWar3IdentitySnapshot(input: {
  units: readonly Unit[]
  objectives: readonly MapObjectiveView[]
  visibilitySystem: VisibilitySystem
  worldItems: readonly { type: ItemKey; mesh: { position: { x: number; z: number } } }[]
}): War3IdentitySnapshot {
  const visibility = input.visibilitySystem.getSnapshot()
  const enemyUnits = input.units.filter(unit => unit.team === 1 && alive(unit))
  const neutralCreeps = input.units.filter(unit =>
    unit.team === 2 &&
    alive(unit) &&
    !unit.isBuilding &&
    !!UNITS[unit.type]?.isCreep,
  )
  const visibleEnemyCount = enemyUnits.filter(unit =>
    input.visibilitySystem.isVisiblePoint(unit.mesh.position.x, unit.mesh.position.z),
  ).length
  const visibleNeutralCount = neutralCreeps.filter(unit =>
    input.visibilitySystem.isVisiblePoint(unit.mesh.position.x, unit.mesh.position.z) ||
    input.visibilitySystem.isExploredPoint(unit.mesh.position.x, unit.mesh.position.z),
  ).length
  const scoutedObjectiveCount = input.objectives.filter(objective =>
    objective.targetX !== null &&
    objective.targetZ !== null &&
    input.visibilitySystem.isExploredPoint(objective.targetX, objective.targetZ),
  ).length
  const worldItems = input.worldItems.map(item => ({
    type: item.type,
    explored: input.visibilitySystem.isExploredPoint(item.mesh.position.x, item.mesh.position.z),
    visible: input.visibilitySystem.isVisiblePoint(item.mesh.position.x, item.mesh.position.z),
  }))
  const purchasable = Object.values(ITEMS).filter(item => item.purchasable)
  const hasHero = input.units.some(unit => unit.team === 0 && !!UNITS[unit.type]?.isHero && alive(unit))
  const hasShopRoute = (BUILDINGS.arcane_vault.shopItems?.length ?? 0) >= 4
  const hasPortal = !!ITEMS.scroll_of_town_portal &&
    BUILDINGS.arcane_vault.shopItems?.includes('scroll_of_town_portal') === true

  const checks: War3IdentityCheck[] = [
    {
      key: 'fog-recon',
      label: 'Fog / 侦察',
      completed: visibility.observerCount > 0 && visibility.visiblePct > 0 && visibility.exploredPct < 1,
      detail: `可见${Math.round(visibility.visiblePct * 100)}% / 已探索${Math.round(visibility.exploredPct * 100)}%`,
    },
    {
      key: 'neutral-camps',
      label: '野怪营地',
      completed: neutralCreeps.length > 0 && input.objectives.some(objective => objective.key === 'creepCamp'),
      detail: `存活野怪${neutralCreeps.length}，已侦察${visibleNeutralCount}`,
    },
    {
      key: 'world-items',
      label: '掉落物',
      completed: input.worldItems.length > 0 || Object.keys(ITEMS).includes('tome_of_experience'),
      detail: input.worldItems.length > 0
        ? `地面物品${input.worldItems.length}`
        : '野怪可掉落经验书/药水',
    },
    {
      key: 'shop-consumables',
      label: '商店/消耗品',
      completed: hasShopRoute && purchasable.length >= 4,
      detail: hasCompletedBuilding(input.units, 0, 'arcane_vault')
        ? `Arcane Vault 可购买${purchasable.map(item => item.name).join('、')}`
        : `商店链路已定义${hasHero ? '，英雄可购买' : '，等待英雄靠近'}`,
    },
    {
      key: 'town-portal',
      label: '回城语义',
      completed: hasPortal,
      detail: hasPortal ? '回城卷轴已进入商店和背包使用链路' : '缺少回城卷轴',
    },
    {
      key: 'objective-recon',
      label: '目标侦察',
      completed: scoutedObjectiveCount >= 3,
      detail: `已侦察目标${scoutedObjectiveCount}/${input.objectives.length}`,
    },
  ]

  const completedCount = checks.filter(check => check.completed).length
  const completed = completedCount === checks.length
  return {
    milestone: 'R12',
    completed,
    completedCount,
    totalCount: checks.length,
    verdict: completed ? '完整 War3 身份闭环' : 'War3 身份系统仍有缺口',
    visibility,
    scoutedObjectiveCount,
    visibleEnemyCount,
    visibleNeutralCount,
    worldItems,
    checks,
  }
}
