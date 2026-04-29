import * as THREE from 'three'
import type { PathingGrid } from '../PathingGrid'
import { findPath, pathToWorldWaypoints } from '../PathFinder'
import type { Unit } from '../UnitTypes'

export type WorldHeightReader = (wx: number, wz: number) => number

/** 为单个单位计算 A* 路径并设置 waypoints + moveTarget.
 * @returns true = 有移动目标（路径或直线 fallback），false = 已在最佳可达位置 */
export function planUnitPath(
  unit: Unit,
  target: THREE.Vector3,
  pathingGrid: PathingGrid,
  getWorldHeight: WorldHeightReader,
): boolean {
  if (unit.isBuilding) return false

  const startTx = Math.floor(unit.mesh.position.x)
  const startTz = Math.floor(unit.mesh.position.z)
  const goalTx = Math.floor(target.x)
  const goalTz = Math.floor(target.z)

  const tilePath = findPath(startTx, startTz, goalTx, goalTz, pathingGrid)
  const waypoints = pathToWorldWaypoints(tilePath, getWorldHeight)

  if (waypoints === null) {
    unit.waypoints = []
    unit.moveTarget = target.clone()
    unit.moveTarget.y = getWorldHeight(target.x, target.z)
    return true
  }

  if (waypoints.length > 0) {
    unit.waypoints = waypoints
    unit.moveTarget = unit.waypoints.shift()!
    return true
  }

  const sameTileDistance = Math.hypot(
    unit.mesh.position.x - target.x,
    unit.mesh.position.z - target.z,
  )
  if (!pathingGrid.isBlocked(goalTx, goalTz) && sameTileDistance > 0.1) {
    unit.waypoints = []
    unit.moveTarget = target.clone()
    unit.moveTarget.y = getWorldHeight(target.x - 0.5, target.z - 0.5)
    return true
  }

  unit.waypoints = []
  unit.moveTarget = null
  return false
}
