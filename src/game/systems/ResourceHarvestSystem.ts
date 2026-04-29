import * as THREE from 'three'
import { GOLD_GATHER_TIME, GOLD_PER_TRIP, LUMBER_GATHER_TIME, LUMBER_PER_TRIP, UnitState } from '../GameData'
import type { TreeEntry } from '../TreeManager'
import type { Unit } from '../UnitTypes'

export type ResourceDeposit = {
  gold: number
  lumber: number
}

export function getGatherDuration(gatherType: Unit['gatherType']): number {
  if (!gatherType) return 0
  return gatherType === 'gold' ? GOLD_GATHER_TIME : LUMBER_GATHER_TIME
}

export function startGatheringTrip(unit: Unit): boolean {
  if (unit.gatherType !== 'gold' && unit.gatherType !== 'lumber') return false
  unit.state = UnitState.Gathering
  unit.gatherTimer = getGatherDuration(unit.gatherType)
  return true
}

export function settleGatherTrip(unit: Unit, onTreeDepleted: (tree: TreeEntry) => void): number {
  const rt = unit.resourceTarget
  if (!rt) return 0

  if (unit.gatherType === 'lumber' && rt.type === 'tree') {
    const tree = rt.entry
    if (tree.remainingLumber <= 0) return 0

    tree.remainingLumber -= LUMBER_PER_TRIP
    if (tree.remainingLumber <= 0) {
      onTreeDepleted(tree)
    }
    return LUMBER_PER_TRIP
  }

  if (unit.gatherType === 'gold' && rt.type === 'goldmine') {
    const mine = rt.mine
    if (mine.hp <= 0 || mine.remainingGold <= 0) return 0

    const take = Math.min(GOLD_PER_TRIP, mine.remainingGold)
    mine.remainingGold -= take
    return take
  }

  return 0
}

export function clearGatherTarget(unit: Unit) {
  unit.resourceTarget = null
  unit.goldLoopSlotMine = null
  unit.goldStandMine = null
}

export function consumeCarriedResources(unit: Unit): ResourceDeposit | null {
  if (unit.carryAmount <= 0) return null
  const amount = unit.carryAmount
  unit.carryAmount = 0
  if (unit.gatherType === 'gold') return { gold: amount, lumber: 0 }
  if (unit.gatherType === 'lumber') return { gold: 0, lumber: amount }
  return null
}

export function findNearestGoldmine(origin: THREE.Vector3, units: readonly Unit[]): Unit | null {
  let best: Unit | null = null
  let bestDist = Infinity
  for (const unit of units) {
    if (unit.type !== 'goldmine' || unit.hp <= 0 || unit.remainingGold <= 0) continue
    const dist = origin.distanceTo(unit.mesh.position)
    if (dist < bestDist) {
      bestDist = dist
      best = unit
    }
  }
  return best
}

export function findNearestHarvestableTree(
  origin: THREE.Vector3,
  trees: readonly TreeEntry[],
  hasReachableApproach: (tree: TreeEntry) => boolean,
  maxDist: number = Infinity,
): TreeEntry | null {
  let best: TreeEntry | null = null
  let bestDist = maxDist
  for (const tree of trees) {
    if (tree.remainingLumber <= 0) continue
    const dist = origin.distanceTo(tree.mesh.position)
    if (dist >= bestDist) continue
    if (!hasReachableApproach(tree)) continue
    bestDist = dist
    best = tree
  }
  return best
}
