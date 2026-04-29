import type { Vector3 } from 'three'

export interface PositionedCombatUnit {
  team: number
  hp: number
  type: string
  isBuilding: boolean
  mesh: { position: Vector3 }
}

export interface FindNearestEnemyOptions<T extends PositionedCombatUnit> {
  units: Iterable<T>
  source: T
  maxDistance: number
  includeBuildings?: boolean
  excludeGoldmines?: boolean
  shouldIgnore?: (source: T, target: T) => boolean
}

export function findNearestEnemyTarget<T extends PositionedCombatUnit>({
  units,
  source,
  maxDistance,
  includeBuildings = true,
  excludeGoldmines = true,
  shouldIgnore,
}: FindNearestEnemyOptions<T>): T | null {
  let nearest: T | null = null
  let nearestDistance = maxDistance

  for (const target of units) {
    if (target.team === source.team) continue
    if (target.hp <= 0) continue
    if (excludeGoldmines && target.type === 'goldmine') continue
    if (!includeBuildings && target.isBuilding) continue
    if (shouldIgnore?.(source, target)) continue

    const distance = source.mesh.position.distanceTo(target.mesh.position)
    if (distance < nearestDistance) {
      nearestDistance = distance
      nearest = target
    }
  }

  return nearest
}
