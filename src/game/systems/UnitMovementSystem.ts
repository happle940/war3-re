import * as THREE from 'three'
import type { Unit } from '../UnitTypes'

export type UnitMovementStepResult = 'noTarget' | 'arrived' | 'moving'

export function getEffectiveMovementSpeed(unit: Unit, gameTime: number): number {
  if (unit.stunUntil > gameTime) return 0
  if (unit.slowUntil > gameTime) {
    return unit.speed * unit.slowSpeedMultiplier
  }
  return unit.speed
}

export function advanceUnitMovement(
  unit: Unit,
  dt: number,
  gameTime: number,
  getWorldHeight: (wx: number, wz: number) => number,
): UnitMovementStepResult {
  if (!unit.moveTarget || unit.isBuilding) return 'noTarget'

  const pos = unit.mesh.position
  let dx = unit.moveTarget.x - pos.x
  let dz = unit.moveTarget.z - pos.z
  let dist = Math.sqrt(dx * dx + dz * dz)

  while (dist < 0.15 && unit.waypoints.length > 0) {
    unit.moveTarget = unit.waypoints.shift()!
    dx = unit.moveTarget.x - pos.x
    dz = unit.moveTarget.z - pos.z
    dist = Math.sqrt(dx * dx + dz * dz)
  }

  if (dist < 0.1) {
    pos.x = unit.moveTarget.x
    pos.z = unit.moveTarget.z
    unit.moveTarget = null
    return 'arrived'
  }

  const step = Math.min(getEffectiveMovementSpeed(unit, gameTime) * dt, dist)
  pos.x += (dx / dist) * step
  pos.z += (dz / dist) * step
  pos.y = getWorldHeight(pos.x - 0.5, pos.z - 0.5)
  unit.mesh.rotation.y = Math.atan2(dx, dz)
  return 'moving'
}
