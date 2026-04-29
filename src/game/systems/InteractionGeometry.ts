import { BUILD_RANGE, BUILDINGS, GATHER_RANGE, LUMBER_GATHER_RANGE } from '../GameData'
import type { TreeEntry } from '../TreeManager'
import type { Unit } from '../UnitTypes'

export type BuildingFootprint = {
  tx: number
  tz: number
  size: number
  minX: number
  minZ: number
  maxX: number
  maxZ: number
}

export function isResourceTargetValid(unit: Unit) {
  const target = unit.resourceTarget
  if (!target) return false

  if (target.type === 'tree') {
    return target.entry.remainingLumber > 0
  }
  if (target.type === 'goldmine') {
    return target.mine.hp > 0 && target.mine.remainingGold > 0
  }
  return false
}

export function getBuildingFootprint(target: Unit): BuildingFootprint {
  const size = Math.ceil(BUILDINGS[target.type]?.size ?? 1)
  const tx = Math.round(target.mesh.position.x - 0.5)
  const tz = Math.round(target.mesh.position.z - 0.5)
  return {
    tx,
    tz,
    size,
    minX: tx,
    minZ: tz,
    maxX: tx + size,
    maxZ: tz + size,
  }
}

export function distanceToBuildingFootprint(unit: Unit, target: Unit) {
  const footprint = getBuildingFootprint(target)
  const x = unit.mesh.position.x
  const z = unit.mesh.position.z
  const dx = x < footprint.minX ? footprint.minX - x : x > footprint.maxX ? x - footprint.maxX : 0
  const dz = z < footprint.minZ ? footprint.minZ - z : z > footprint.maxZ ? z - footprint.maxZ : 0
  return Math.sqrt(dx * dx + dz * dz)
}

export function distanceToTreeFootprint(unit: Unit, tree: TreeEntry) {
  const x = unit.mesh.position.x
  const z = unit.mesh.position.z
  const dx = x < tree.tx ? tree.tx - x : x > tree.tx + 1 ? x - (tree.tx + 1) : 0
  const dz = z < tree.tz ? tree.tz - z : z > tree.tz + 1 ? z - (tree.tz + 1) : 0
  return Math.sqrt(dx * dx + dz * dz)
}

export function hasReachedGatherInteraction(unit: Unit) {
  const target = unit.resourceTarget
  if (!target) return false

  if (target.type === 'tree') {
    return distanceToTreeFootprint(unit, target.entry) <= LUMBER_GATHER_RANGE
  }
  if (target.type === 'goldmine') {
    return distanceToBuildingFootprint(unit, target.mine) <= GATHER_RANGE
  }
  return false
}

export function hasReachedDropoffHall(unit: Unit, hall: Unit | null) {
  if (!hall) return false
  return distanceToBuildingFootprint(unit, hall) <= GATHER_RANGE
}

export function hasReachedBuildInteraction(unit: Unit, target: Unit) {
  return distanceToBuildingFootprint(unit, target) <= BUILD_RANGE
}
