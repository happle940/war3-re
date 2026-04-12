import * as THREE from 'three'
import { UnitState, UNITS } from './GameData'
import type { Unit } from './Game'

// ===== 命令类型 =====

export type GameCommand =
  | { type: 'move'; target: THREE.Vector3 }
  | { type: 'attack'; target: Unit }
  | { type: 'gather'; resourceType: 'gold' | 'lumber'; target: THREE.Vector3 }
  | { type: 'build'; target: Unit }
  | { type: 'train'; building: Unit; unitType: string; trainTime: number }
  | { type: 'stop' }
  | { type: 'holdPosition' }
  | { type: 'attackMove'; target: THREE.Vector3 }
  | { type: 'setRally'; building: Unit; target: THREE.Vector3; rallyTarget?: Unit }
  | { type: 'clearRally'; building: Unit }

// ===== 命令分发器 =====

/**
 * 统一命令入口
 *
 * 所有玩家输入（以及未来 AI 输入）都通过 issueCommand() 执行。
 * 命令只做"最小写入"——设置目标/状态，不改变状态机循环逻辑。
 */
export function issueCommand(units: Unit[], cmd: GameCommand) {
  switch (cmd.type) {
    case 'move':
      for (const u of units) {
        if (u.isBuilding) continue
        u.moveTarget = cmd.target.clone()
        u.waypoints = []
        u.moveQueue = []  // 新的移动命令覆盖队列
        u.state = UnitState.Moving
        u.gatherType = null
        u.attackTarget = null
        u.resourceTarget = null
        u.carryAmount = 0  // 中断采集时丢弃携带资源
        u.previousState = null
        u.previousGatherType = null
        u.previousResourceTarget = null
        u.previousMoveTarget = null
        u.previousWaypoints = []
        u.previousMoveQueue = []
        u.previousAttackMoveTarget = null
      }
      break

    case 'attack':
      for (const u of units) {
        if (u.isBuilding) continue
        u.attackTarget = cmd.target
        u.state = UnitState.Attacking
        u.gatherType = null
        u.moveTarget = null
        u.waypoints = []
        u.moveQueue = []
        u.resourceTarget = null
        u.carryAmount = 0
        u.previousState = null
        u.previousGatherType = null
        u.previousResourceTarget = null
        u.previousMoveTarget = null
        u.previousWaypoints = []
        u.previousMoveQueue = []
        u.previousAttackMoveTarget = null
        u.aggroSuppressUntil = 0  // attack is offensive intent — clear suppression
      }
      break

    case 'gather':
      for (const u of units) {
        if (u.isBuilding) continue
        // 只有可采集单位才能接受 gather 命令
        if (!UNITS[u.type]?.canGather) continue
        u.gatherType = cmd.resourceType
        u.moveTarget = cmd.target.clone()
        u.waypoints = []
        u.moveQueue = []
        u.state = UnitState.MovingToGather
        u.attackTarget = null
        u.resourceTarget = null  // 调用方在 issueCommand 后立即设置具体资源目标
        u.previousState = null
        u.previousGatherType = null
        u.previousResourceTarget = null
        u.previousMoveTarget = null
        u.previousWaypoints = []
        u.previousMoveQueue = []
        u.previousAttackMoveTarget = null
      }
      break

    case 'build':
      for (const u of units) {
        if (u.isBuilding) continue
        u.buildTarget = cmd.target
        u.moveTarget = cmd.target.mesh.position.clone()
        u.waypoints = []
        u.moveQueue = []
        u.state = UnitState.MovingToBuild
        u.attackTarget = null
        u.gatherType = null
        u.resourceTarget = null
        u.carryAmount = 0
        u.previousState = null
        u.previousGatherType = null
        u.previousResourceTarget = null
        u.previousMoveTarget = null
        u.previousWaypoints = []
        u.previousMoveQueue = []
        u.previousAttackMoveTarget = null
      }
      break

    case 'train': {
      cmd.building.trainingQueue.push({ type: cmd.unitType, remaining: cmd.trainTime })
      break
    }

    case 'stop':
      for (const u of units) {
        if (u.isBuilding) continue
        u.state = UnitState.Idle
        u.moveTarget = null
        u.waypoints = []
        u.moveQueue = []
        u.attackTarget = null
        u.attackMoveTarget = null
        u.gatherType = null
        u.resourceTarget = null
        u.buildTarget = null
        u.carryAmount = 0  // stop 丢弃携带的资源
        // stop 明确切断恢复链
        u.previousState = null
        u.previousGatherType = null
        u.previousResourceTarget = null
        u.previousMoveTarget = null
        u.previousWaypoints = []
        u.previousMoveQueue = []
        u.previousAttackMoveTarget = null
      }
      break

    case 'holdPosition':
      for (const u of units) {
        if (u.isBuilding) continue
        u.state = UnitState.HoldPosition
        u.moveTarget = null
        u.waypoints = []
        u.moveQueue = []
        u.attackTarget = null
        u.attackMoveTarget = null
        u.gatherType = null
        u.resourceTarget = null
        // hold 明确切断恢复链
        u.previousState = null
        u.previousGatherType = null
        u.previousResourceTarget = null
        u.previousMoveTarget = null
        u.previousWaypoints = []
        u.previousMoveQueue = []
        u.previousAttackMoveTarget = null
      }
      break

    case 'attackMove':
      for (const u of units) {
        if (u.isBuilding) continue
        u.state = UnitState.AttackMove
        u.attackMoveTarget = cmd.target.clone()
        // moveTarget 由调用方通过 planAttackMovePath 设置
        u.moveTarget = null
        u.waypoints = []
        u.moveQueue = []
        u.attackTarget = null
        u.gatherType = null
        u.resourceTarget = null
        u.carryAmount = 0
        u.previousState = null
        u.previousGatherType = null
        u.previousResourceTarget = null
        u.previousMoveTarget = null
        u.previousWaypoints = []
        u.previousMoveQueue = []
        u.previousAttackMoveTarget = null
        u.aggroSuppressUntil = 0  // attackMove must auto-engage — clear suppression
      }
      break

    case 'setRally':
      cmd.building.rallyPoint = cmd.target.clone()
      cmd.building.rallyTarget = cmd.rallyTarget ?? null
      break

    case 'clearRally':
      cmd.building.rallyPoint = null
      cmd.building.rallyTarget = null
      break
  }
}
