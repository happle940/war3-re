import { CHASE_RANGE, UnitState } from '../GameData'
import type { Unit } from '../UnitTypes'

export type LostCombatTargetAction = 'resumeAttackMove' | 'restorePreviousOrder' | 'holdPosition' | 'none'

export function isCombatState(state: UnitState): boolean {
  return state === UnitState.Attacking ||
    state === UnitState.AttackMove ||
    state === UnitState.HoldPosition
}

export function isUnitStunned(unit: Unit, gameTime: number): boolean {
  return unit.stunUntil > gameTime
}

export function getLostCombatTargetAction(unit: Unit): LostCombatTargetAction {
  if (unit.state === UnitState.AttackMove) return 'resumeAttackMove'
  if (unit.state === UnitState.HoldPosition) return 'holdPosition'
  if (unit.state === UnitState.Attacking) return 'restorePreviousOrder'
  return 'none'
}

export function isCombatTargetValid(target: Unit | null, allUnits: readonly Unit[]): target is Unit {
  return !!target && target.hp > 0 && allUnits.includes(target)
}

export function shouldDropHoldPositionTarget(unit: Unit, target: Unit): boolean {
  return unit.state === UnitState.HoldPosition &&
    unit.mesh.position.distanceTo(target.mesh.position) > unit.attackRange + 0.3
}

export function shouldDropChaseTarget(unit: Unit, target: Unit): LostCombatTargetAction {
  const distance = unit.mesh.position.distanceTo(target.mesh.position)
  if (unit.state === UnitState.AttackMove && distance > CHASE_RANGE) return 'resumeAttackMove'
  if (unit.state !== UnitState.AttackMove && unit.state !== UnitState.HoldPosition && distance > CHASE_RANGE) {
    return 'restorePreviousOrder'
  }
  return 'none'
}

export function isAttackTargetInRange(unit: Unit, target: Unit): boolean {
  return unit.mesh.position.distanceTo(target.mesh.position) <= unit.attackRange + 0.3
}

export function setUnitChaseTarget(unit: Unit, target: Unit) {
  if (unit.waypoints.length === 0) {
    unit.moveTarget = target.mesh.position.clone()
  }
}

export function stopUnitForAttack(unit: Unit) {
  unit.moveTarget = null
  unit.waypoints = []
}

export function faceUnitTarget(unit: Unit, target: Unit) {
  unit.mesh.rotation.y = Math.atan2(
    target.mesh.position.x - unit.mesh.position.x,
    target.mesh.position.z - unit.mesh.position.z,
  )
}

export function tickAttackCooldown(unit: Unit, dt: number, gameTime = 0): boolean {
  unit.attackTimer -= dt
  if (unit.attackTimer > 0) return false
  const attackSpeedMultiplier = unit.attackSlowUntil > gameTime
    ? Math.max(0.1, unit.attackSpeedMultiplier)
    : 1
  unit.attackTimer = unit.attackCooldown / attackSpeedMultiplier
  return true
}

export function isStaticDefenseReady(unit: Unit): boolean {
  return unit.isBuilding &&
    unit.attackDamage > 0 &&
    unit.buildProgress >= 1 &&
    unit.hp > 0
}

export function isStaticDefenseTargetValid(unit: Unit, target: Unit | null, allUnits: readonly Unit[]): target is Unit {
  if (!target || target.hp <= 0 || !allUnits.includes(target)) return false
  return unit.mesh.position.distanceTo(target.mesh.position) <= unit.attackRange
}

export function shouldAutoAggroUnit(unit: Unit, gameTime: number): boolean {
  if (unit.isBuilding || unit.hp <= 0 || unit.isDead || unit.attackTarget) return false
  if (unit.state !== UnitState.Idle && unit.state !== UnitState.AttackMove) return false
  return gameTime >= unit.aggroSuppressUntil
}

export function shouldIgnoreOpeningWorkerAggro(
  unit: Unit,
  other: Unit,
  gameTime: number,
  graceTime: number,
): boolean {
  return unit.team !== 0 &&
    unit.state === UnitState.AttackMove &&
    gameTime < graceTime &&
    other.team === 0 &&
    other.type === 'worker'
}

export function beginAutoAggro(unit: Unit, target: Unit) {
  unit.attackTarget = target
  if (unit.state === UnitState.AttackMove) {
    stopUnitForAttack(unit)
    return
  }

  unit.previousState = unit.state
  unit.previousGatherType = unit.gatherType
  unit.previousResourceTarget = unit.resourceTarget
  unit.previousMoveTarget = unit.moveTarget ? unit.moveTarget.clone() : null
  unit.previousWaypoints = [...unit.waypoints]
  unit.previousMoveQueue = [...unit.moveQueue]
  unit.previousAttackMoveTarget = unit.attackMoveTarget ? unit.attackMoveTarget.clone() : null
  unit.state = UnitState.Attacking
  stopUnitForAttack(unit)
}
