import { UnitState, UNITS } from '../GameData'
import type { Unit } from '../UnitTypes'

export function selectConstructionBuilder(
  savedWorkers: readonly Unit[],
  fallback: () => Unit | null,
): Unit | null {
  return savedWorkers[0] ?? fallback()
}

export function hasValidActiveBuilder(building: Unit, allUnits: readonly Unit[]): boolean {
  const existing = building.builder
  return !!existing &&
    allUnits.includes(existing) &&
    existing.hp > 0 &&
    existing.buildTarget === building &&
    (existing.state === UnitState.MovingToBuild || existing.state === UnitState.Building)
}

export function canAssignBuilderToConstruction(
  worker: Unit,
  building: Unit,
  allUnits: readonly Unit[],
): boolean {
  if (!allUnits.includes(worker) || !allUnits.includes(building)) return false
  if (worker.isBuilding || !UNITS[worker.type]?.canGather) return false
  if (!building.isBuilding || building.buildProgress >= 1 || building.hp <= 0) return false
  if (worker.team !== building.team) return false
  return !hasValidActiveBuilder(building, allUnits) || building.builder === worker
}
