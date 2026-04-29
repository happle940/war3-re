import type { Unit } from '../UnitTypes'
import { isMainHallType } from './TechPredicates'

export type MatchResult = 'victory' | 'defeat' | 'stall'

export function getMatchOutcome(units: readonly Unit[], gameTime: number, stallSeconds: number): MatchResult | null {
  const playerHasMainHall = units.some(
    unit => unit.team === 0 && isMainHallType(unit.type) && unit.isBuilding && unit.hp > 0,
  )
  if (!playerHasMainHall) return 'defeat'

  const aiHasMainHall = units.some(
    unit => unit.team === 1 && isMainHallType(unit.type) && unit.isBuilding && unit.hp > 0,
  )
  if (!aiHasMainHall) return 'victory'

  if (gameTime >= stallSeconds) return 'stall'
  return null
}
