import { HERO_ABILITY_LEVELS, UNITS } from '../GameData'
import type { HeroAbilityLevelDef } from '../GameData'
import type { Unit } from '../UnitTypes'
import { isSpellImmune } from './AvatarSystem'

export type ThunderClapImpact = {
  target: Unit
  damage: number
  slowDuration: number
  speedMultiplier: number
}

export type ThunderClapCastResult = {
  levelData: HeroAbilityLevelDef
  impacts: ThunderClapImpact[]
}

export function getThunderClapSlowDuration(target: Unit, levelData: HeroAbilityLevelDef): number {
  return UNITS[target.type]?.isHero
    ? (levelData.heroDuration ?? levelData.duration ?? 3)
    : (levelData.duration ?? 5)
}

export function selectThunderClapTargets(
  units: readonly Unit[],
  caster: Unit,
  radius: number,
  gameTime = 0,
): Unit[] {
  return units.filter(unit => {
    if (unit === caster) return false
    if (unit.isDead || unit.hp <= 0) return false
    if (unit.team === caster.team) return false
    if (unit.isBuilding) return false
    if (isSpellImmune(unit, gameTime)) return false
    if (!unit.mesh?.position || !caster.mesh?.position) return false
    return unit.mesh.position.distanceTo(caster.mesh.position) <= radius
  })
}

export function castThunderClap(
  caster: Unit,
  units: readonly Unit[],
  gameTime: number,
): ThunderClapCastResult | null {
  const learnedLevel = caster.abilityLevels?.thunder_clap ?? 0
  if (learnedLevel < 1) return null
  if (caster.type !== 'mountain_king') return null
  if (caster.isDead || caster.hp <= 0) return null
  if (gameTime < caster.thunderClapCooldownUntil) return null

  const abilityDef = HERO_ABILITY_LEVELS.thunder_clap
  const levelData = abilityDef.levels[Math.min(learnedLevel, abilityDef.maxLevel) - 1]
  if (!levelData) return null
  if (caster.mana < levelData.mana) return null

  const targets = selectThunderClapTargets(units, caster, levelData.areaRadius ?? 0, gameTime)
  if (targets.length === 0) return null

  caster.mana -= levelData.mana
  caster.thunderClapCooldownUntil = gameTime + levelData.cooldown

  const speedMultiplier = levelData.speedMultiplier ?? 1
  return {
    levelData,
    impacts: targets.map(target => {
      const slowDuration = getThunderClapSlowDuration(target, levelData)
      target.hp -= levelData.effectValue
      target.slowUntil = Math.max(target.slowUntil, gameTime + slowDuration)
      target.slowSpeedMultiplier = Math.min(target.slowSpeedMultiplier || 1, speedMultiplier)
      target.attackSlowUntil = Math.max(target.attackSlowUntil, gameTime + slowDuration)
      target.attackSpeedMultiplier = Math.min(target.attackSpeedMultiplier || 1, speedMultiplier)
      return {
        target,
        damage: levelData.effectValue,
        slowDuration,
        speedMultiplier,
      }
    }),
  }
}
