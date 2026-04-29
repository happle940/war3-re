import type { Unit } from '../UnitTypes'
import { HERO_ABILITY_LEVELS } from '../GameData'
import type { HeroAbilityLevelDef } from '../GameData'
import { getBuildingFootprint } from './InteractionGeometry'

export type MassTeleportPending = {
  caster: Unit
  targetUnit: Unit
  startTime: number
  completeTime: number
  levelData: HeroAbilityLevelDef
}

export function castMassTeleport(
  caster: Unit,
  targetUnit: Unit,
  gameTime: number,
  hasPendingForCaster: boolean,
): MassTeleportPending | null {
  const learnedLevel = caster.abilityLevels?.mass_teleport ?? 0
  if (learnedLevel < 1) return null
  if (caster.type !== 'archmage') return null
  if (caster.isDead || caster.hp <= 0) return null
  if (gameTime < caster.massTeleportCooldownUntil) return null
  if (hasPendingForCaster) return null

  const abilityDef = HERO_ABILITY_LEVELS.mass_teleport
  const levelData = abilityDef.levels[Math.min(learnedLevel, abilityDef.maxLevel) - 1]
  if (!levelData) return null
  if (caster.mana < levelData.mana) return null

  if (!targetUnit || targetUnit.isDead || targetUnit.hp <= 0) return null
  if (targetUnit.team !== caster.team) return null
  if (!targetUnit.mesh?.position) return null

  caster.mana -= levelData.mana
  caster.massTeleportCooldownUntil = gameTime + levelData.cooldown

  const castDelay = levelData.castDelay ?? 3
  return {
    caster,
    targetUnit,
    startTime: gameTime,
    completeTime: gameTime + castDelay,
    levelData,
  }
}

export function selectMassTeleportTransportedUnits(
  units: readonly Unit[],
  caster: Unit,
  radius: number,
  maxTargets: number,
): Unit[] {
  const candidates: { unit: Unit; dist: number }[] = []
  for (const unit of units) {
    if (unit.isDead || unit.hp <= 0) continue
    if (unit.team !== caster.team) continue
    if (unit.isBuilding) continue
    if (!unit.mesh?.position) continue
    const dx = unit.mesh.position.x - caster.mesh.position.x
    const dz = unit.mesh.position.z - caster.mesh.position.z
    const dist = Math.sqrt(dx * dx + dz * dz)
    if (dist <= radius) {
      candidates.push({ unit, dist })
    }
  }

  candidates.sort((a, b) => a.dist - b.dist)
  if (!candidates.some(candidate => candidate.unit === caster)) return []

  const transported: Unit[] = [caster]
  for (const candidate of candidates) {
    if (candidate.unit === caster) continue
    if (transported.length >= maxTargets) break
    transported.push(candidate.unit)
  }
  return transported
}

export function findMassTeleportPlacement(
  cx: number,
  cz: number,
  occupied: readonly { x: number; z: number }[],
  targetUnit: Unit,
  spacing = 0.8,
): { x: number; z: number } {
  const clear = (px: number, pz: number) => {
    for (const pos of occupied) {
      const dx = px - pos.x
      const dz = pz - pos.z
      if (dx * dx + dz * dz < spacing * spacing * 0.5) return false
    }

    if (targetUnit.isBuilding) {
      const footprint = getBuildingFootprint(targetUnit)
      const padding = spacing * 0.5
      return px < footprint.minX - padding
        || px > footprint.maxX + padding
        || pz < footprint.minZ - padding
        || pz > footprint.maxZ + padding
    }

    const dx = px - targetUnit.mesh.position.x
    const dz = pz - targetUnit.mesh.position.z
    return dx * dx + dz * dz >= spacing * spacing * 0.5
  }

  for (let ring = 0; ring < 30; ring++) {
    const pointsInRing = ring === 0 ? 1 : ring * 6
    for (let i = 0; i < pointsInRing; i++) {
      const angle = (2 * Math.PI * i) / pointsInRing
      const r = ring * spacing
      const px = cx + r * Math.cos(angle)
      const pz = cz + r * Math.sin(angle)
      if (clear(px, pz)) {
        return { x: px, z: pz }
      }
    }
  }

  if (targetUnit.isBuilding) {
    const footprint = getBuildingFootprint(targetUnit)
    return { x: footprint.maxX + spacing * (occupied.length + 1), z: cz }
  }

  return { x: cx + spacing * (occupied.length + 1), z: cz }
}
