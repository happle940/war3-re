import { BUILDINGS } from '../GameData'
import type { Unit } from '../UnitTypes'

export function advanceBuildingUpgrade(unit: Unit, dt: number) {
  if (!unit.upgradeQueue) return false

  unit.upgradeQueue.remaining -= dt
  if (unit.upgradeQueue.remaining > 0) return false

  const targetKey = unit.upgradeQueue.targetType
  const targetDef = BUILDINGS[targetKey]
  unit.upgradeQueue = null
  if (!targetDef) return false

  unit.type = targetKey
  unit.maxHp = targetDef.hp
  unit.hp = targetDef.hp
  return true
}
