import { UnitState } from '../GameData'
import type { Unit } from '../UnitTypes'

export function isCasterAutoCastState(state: UnitState): boolean {
  return state === UnitState.Idle ||
    state === UnitState.Attacking ||
    state === UnitState.AttackMove ||
    state === UnitState.HoldPosition
}

export function findPriestAutoHealTarget(
  priest: Unit,
  units: readonly Unit[],
  range: number,
): Unit | null {
  let bestTarget: Unit | null = null
  let bestMissing = 0

  for (const other of units) {
    if (other.team !== priest.team || other.hp <= 0 || other.isBuilding) continue
    if (other.hp >= other.maxHp) continue
    const distance = priest.mesh.position.distanceTo(other.mesh.position)
    if (distance > range) continue
    const missing = other.maxHp - other.hp
    if (missing > bestMissing) {
      bestMissing = missing
      bestTarget = other
    }
  }

  return bestTarget
}

export function findSlowAutoCastTarget(
  caster: Unit,
  units: readonly Unit[],
  range: number,
  gameTime: number,
): Unit | null {
  let bestTarget: Unit | null = null
  let bestPriority = Number.POSITIVE_INFINITY
  let bestDistance = Number.POSITIVE_INFINITY

  for (const other of units) {
    if (other.team === caster.team || other.hp <= 0 || other.isBuilding) continue
    const distance = caster.mesh.position.distanceTo(other.mesh.position)
    if (distance > range) continue

    let priority = 0
    if (other.slowUntil > gameTime) {
      const remaining = other.slowUntil - gameTime
      if (remaining > 3) continue
      priority = 1
    }

    if (priority < bestPriority || (priority === bestPriority && distance < bestDistance)) {
      bestTarget = other
      bestPriority = priority
      bestDistance = distance
    }
  }

  return bestTarget
}
