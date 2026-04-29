import { RESEARCHES, ResearchEffectType } from '../GameData'
import type { ResearchEffect } from '../GameData'
import type { Unit } from '../UnitTypes'

export function applyResearchEffectsToTeam(units: readonly Unit[], researchKey: string, team: number) {
  const researchDef = RESEARCHES[researchKey]
  if (!researchDef?.effects) return

  for (const effect of researchDef.effects) {
    for (const unit of units) {
      if (unit.type !== effect.targetUnitType) continue
      if (unit.team !== team) continue
      if (unit.isBuilding || unit.hp <= 0) continue
      applyFlatDeltaEffect(unit, effect)
    }
  }
}

export function applyCompletedResearchesToUnit(unit: Unit, units: readonly Unit[]) {
  const appliedResearches = new Set<string>()

  for (const building of units) {
    if (building.team !== unit.team || !building.isBuilding) continue

    for (const researchKey of building.completedResearches) {
      if (appliedResearches.has(researchKey)) continue
      appliedResearches.add(researchKey)

      const researchDef = RESEARCHES[researchKey]
      if (!researchDef?.effects) continue

      for (const effect of researchDef.effects) {
        if (effect.targetUnitType !== unit.type) continue
        applyFlatDeltaEffect(unit, effect)
      }
    }
  }
}

function applyFlatDeltaEffect(unit: Unit, effect: ResearchEffect) {
  if (effect.type !== ResearchEffectType.FlatDelta) return

  switch (effect.stat) {
    case 'attackRange':
      unit.attackRange += effect.value
      break
    case 'attackDamage':
      unit.attackDamage += effect.value
      break
    case 'armor':
      unit.armor += effect.value
      break
    case 'maxHp':
      unit.maxHp += effect.value
      unit.hp += effect.value
      break
  }
}
