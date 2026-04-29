import type { Unit } from '../UnitTypes'
import { UNITS } from '../GameData'

export type RightClickUnitIntent =
  | 'gatherGold'
  | 'attack'
  | 'resumeConstruction'
  | 'moveToUnit'

export function selectRightClickUnitTarget(hitUnits: readonly Unit[], playerTeam: number): Unit | undefined {
  return hitUnits.find(unit => unit.type === 'goldmine') ??
    hitUnits.find(unit => unit.team === playerTeam && unit.isBuilding && unit.buildProgress < 1) ??
    hitUnits[0]
}

export function selectGoldmineTarget(hitUnits: readonly Unit[]): Unit | undefined {
  return hitUnits.find(unit => unit.type === 'goldmine')
}

export function getRightClickUnitIntent(target: Unit, playerTeam: number): RightClickUnitIntent {
  if (target.type === 'goldmine') return 'gatherGold'
  if (target.team !== playerTeam) return 'attack'
  if (target.isBuilding && target.buildProgress < 1) return 'resumeConstruction'
  return 'moveToUnit'
}

export function splitGatherCapableUnits(units: readonly Unit[]) {
  const gatherers: Unit[] = []
  const others: Unit[] = []
  for (const unit of units) {
    if (UNITS[unit.type]?.canGather) {
      gatherers.push(unit)
    } else {
      others.push(unit)
    }
  }
  return { gatherers, others }
}
