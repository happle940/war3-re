import * as THREE from 'three'
import { GOLDMINE_MAX_WORKERS, UnitState } from '../GameData'
import type { Unit } from '../UnitTypes'

export function isResourceLoopState(unit: Unit): boolean {
  return unit.state === UnitState.MovingToGather ||
    unit.state === UnitState.Gathering ||
    unit.state === UnitState.MovingToReturn
}

export function isAssignedToGoldLoop(unit: Unit, mine: Unit): boolean {
  return unit.hp > 0 &&
    unit.gatherType === 'gold' &&
    unit.resourceTarget?.type === 'goldmine' &&
    unit.resourceTarget.mine === mine &&
    isResourceLoopState(unit)
}

export function hasGoldLoopSlot(unit: Unit, mine: Unit): boolean {
  return unit.goldLoopSlotMine === mine && isAssignedToGoldLoop(unit, mine)
}

export function reserveGoldLoopSlot(
  unit: Unit,
  mine: Unit,
  units: readonly Unit[],
  maxWorkers = GOLDMINE_MAX_WORKERS,
): boolean {
  if (hasGoldLoopSlot(unit, mine)) return true

  const reservedLoopWorkers = units.filter(other =>
    other !== unit && hasGoldLoopSlot(other, mine),
  ).length

  if (reservedLoopWorkers >= maxWorkers) return false
  unit.goldLoopSlotMine = mine
  return true
}

export function hasSuppressedResourceLoopCollision(unit: Unit): boolean {
  const rt = unit.resourceTarget
  if (unit.gatherType === 'gold' && rt?.type === 'goldmine') {
    return hasGoldLoopSlot(unit, rt.mine) && isResourceLoopState(unit)
  }
  if (unit.gatherType === 'lumber' && rt?.type === 'tree') {
    return isResourceLoopState(unit)
  }
  return false
}

export function chooseGoldWorkerStandPoint(
  unit: Unit,
  mine: Unit,
  units: readonly Unit[],
  candidates: readonly THREE.Vector3[],
): THREE.Vector3 | null {
  if (candidates.length === 0) return null

  const peers = units
    .filter(other => isAssignedToGoldLoop(other, mine))
    .sort((a, b) => units.indexOf(a) - units.indexOf(b))
  if (!peers.includes(unit)) peers.push(unit)

  const used = new Set<number>()
  let target = candidates[0]
  for (const peer of peers) {
    const peerPos = peer.mesh.position
    let bestIndex = 0
    let bestDist = Infinity
    for (let i = 0; i < candidates.length; i++) {
      if (used.has(i) && used.size < candidates.length) continue
      const c = candidates[i]
      const d = Math.hypot(c.x - peerPos.x, c.z - peerPos.z)
      if (d < bestDist) {
        bestDist = d
        bestIndex = i
      }
    }
    used.add(bestIndex)
    if (peer === unit) {
      target = candidates[bestIndex]
      break
    }
  }

  return target.clone()
}
