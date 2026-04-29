import type { Unit } from '../UnitTypes'
import { isSpellImmune } from './AvatarSystem'

export function selectBlizzardWaveTargets(
  units: readonly Unit[],
  caster: Unit,
  targetX: number,
  targetZ: number,
  radius: number,
  maxTargets: number,
  gameTime = 0,
): Unit[] {
  const targets: Unit[] = []
  for (const unit of units) {
    if (unit === caster) continue
    if (unit.isDead || unit.hp <= 0) continue
    if (unit.team === caster.team) continue
    if (isSpellImmune(unit, gameTime)) continue
    const dx = unit.mesh.position.x - targetX
    const dz = unit.mesh.position.z - targetZ
    if (Math.sqrt(dx * dx + dz * dz) <= radius) {
      targets.push(unit)
    }
    if (targets.length >= maxTargets) break
  }
  return targets
}

export function getBlizzardWaveDamage(target: Unit, baseDamage: number, buildingMultiplier: number): number {
  return target.isBuilding ? baseDamage * buildingMultiplier : baseDamage
}
