import * as THREE from 'three'
import type { QueuedCommand, Unit } from '../UnitTypes'
import { UnitState } from '../GameData'
import { clearGatherTarget } from './ResourceHarvestSystem'

export function clearActiveUnitOrder(unit: Unit) {
  unit.state = UnitState.Idle
  unit.attackTarget = null
  unit.moveTarget = null
  unit.gatherType = null
  unit.resourceTarget = null
  unit.goldLoopSlotMine = null
  unit.goldStandMine = null
  unit.waypoints = []
  unit.moveQueue = []
  unit.attackMoveTarget = null
}

export function finishAttackMoveOrder(unit: Unit) {
  unit.state = UnitState.Idle
  unit.attackMoveTarget = null
  unit.attackTarget = null
  unit.moveTarget = null
  unit.waypoints = []
}

export function clearPreviousUnitOrder(unit: Unit) {
  unit.previousState = null
  unit.previousGatherType = null
  unit.previousResourceTarget = null
  unit.previousMoveTarget = null
  unit.previousWaypoints = []
  unit.previousMoveQueue = []
  unit.previousAttackMoveTarget = null
}

export function enqueueQueuedCommand(unit: Unit, command: QueuedCommand): QueuedCommand | null {
  unit.moveQueue.push(command)
  if (unit.state === UnitState.Idle && unit.moveQueue.length > 0) {
    return unit.moveQueue.shift()!
  }
  return null
}

export function prepareQueuedCommandExecution(unit: Unit) {
  unit.gatherType = null
  clearGatherTarget(unit)
  unit.buildTarget = null
  unit.carryAmount = 0
  unit.attackTarget = null
}

export function executeQueuedMovementCommand(
  unit: Unit,
  command: QueuedCommand,
  actions: {
    planMove(unit: Unit, target: THREE.Vector3): void
    planAttackMove(unit: Unit, target: THREE.Vector3): void
  },
) {
  prepareQueuedCommandExecution(unit)

  switch (command.type) {
    case 'move':
      unit.state = UnitState.Moving
      unit.moveTarget = null
      actions.planMove(unit, command.target)
      return
    case 'attackMove':
      unit.state = UnitState.AttackMove
      unit.attackMoveTarget = command.target.clone()
      unit.moveTarget = null
      actions.planAttackMove(unit, command.target)
      return
  }
}
