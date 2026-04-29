import * as THREE from 'three'
import type { Unit } from '../UnitTypes'

const FORMATION_SPACING = 0.7

export type FormationMoveTarget = {
  unit: Unit
  target: THREE.Vector3
}

export function getFormationMoveTargets(
  units: readonly Unit[],
  target: THREE.Vector3,
  isBlocked: (wx: number, wz: number) => boolean,
  spacing = FORMATION_SPACING,
): FormationMoveTarget[] {
  if (units.length <= 1) {
    return units
      .filter(unit => !unit.isBuilding)
      .map(unit => ({ unit, target }))
  }

  const targets: FormationMoveTarget[] = []
  const cols = Math.ceil(Math.sqrt(units.length))
  for (let i = 0; i < units.length; i++) {
    const unit = units[i]
    if (unit.isBuilding) continue

    const row = Math.floor(i / cols)
    const col = i % cols
    const offsetX = (col - (cols - 1) / 2) * spacing
    const offsetZ = (row - (Math.ceil(units.length / cols) - 1) / 2) * spacing

    const offsetTarget = new THREE.Vector3(
      target.x + offsetX,
      target.y,
      target.z + offsetZ,
    )

    targets.push({
      unit,
      target: isBlocked(offsetTarget.x, offsetTarget.z) ? target : offsetTarget,
    })
  }

  return targets
}
