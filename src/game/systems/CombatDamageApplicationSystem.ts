import { ABILITIES, AttackType } from '../GameData'
import type { CombatDamageResolution } from './CombatMath'
import { calculateAttackDamage, calculateCombatDamage } from './CombatMath'
import type { Unit } from '../UnitTypes'

export type SplashDamageApplication = {
  target: Unit
  damage: number
}

export function canApplyDirectAttackDamage(target: Unit, gameTime: number): boolean {
  return target.divineShieldUntil <= gameTime
}

export function resolveDirectAttackDamage(attacker: Unit, target: Unit, gameTime: number): CombatDamageResolution | null {
  if (!canApplyDirectAttackDamage(target, gameTime)) return null
  return calculateAttackDamage(attacker, target, gameTime)
}

export function shouldApplyMortarSplash(resolution: CombatDamageResolution): boolean {
  return resolution.attackType === AttackType.Siege && (ABILITIES.mortar_aoe.aoeRadius ?? 0) > 0
}

export function getMortarSplashApplications(
  units: readonly Unit[],
  attacker: Unit,
  primaryTarget: Unit,
  rawDamage: number,
  attackType: AttackType,
): SplashDamageApplication[] {
  const mortarAoe = ABILITIES.mortar_aoe
  const aoeRadius = mortarAoe.aoeRadius ?? 0
  const aoeFalloff = mortarAoe.aoeFalloff ?? 0
  const splashPos = primaryTarget.mesh.position
  const applications: SplashDamageApplication[] = []

  for (const unit of units) {
    if (unit === primaryTarget) continue
    if (unit === attacker) continue
    if (unit.team === attacker.team) continue
    if (unit.hp <= 0) continue
    if (unit.type === 'goldmine') continue

    const distance = splashPos.distanceTo(unit.mesh.position)
    if (distance > aoeRadius) continue

    const falloff = 1.0 - (1.0 - aoeFalloff) * (distance / aoeRadius)
    const damage = calculateCombatDamage({
      rawDamage,
      attackType,
      target: unit,
      damageScale: falloff,
      applyDefend: false,
    }).finalDamage
    applications.push({ target: unit, damage })
  }

  return applications
}
