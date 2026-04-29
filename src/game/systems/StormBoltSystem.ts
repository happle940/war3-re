import { HERO_ABILITY_LEVELS, UNITS } from '../GameData'
import type { HeroAbilityLevelDef } from '../GameData'
import type { Unit } from '../UnitTypes'
import { isSpellImmune } from './AvatarSystem'

export type StormBoltProjectile = {
  caster: Unit
  target: Unit
  levelData: HeroAbilityLevelDef
  hitTime: number
}

export type StormBoltImpact = {
  target: Unit
  damage: number
  stunDuration: number
}

export function castStormBolt(caster: Unit, target: Unit, gameTime: number): StormBoltProjectile | null {
  const learnedLevel = caster.abilityLevels?.storm_bolt ?? 0
  if (learnedLevel < 1) return null
  if (caster.type !== 'mountain_king') return null
  if (caster.isDead || caster.hp <= 0) return null
  if (gameTime < caster.stormBoltCooldownUntil) return null

  const abilityDef = HERO_ABILITY_LEVELS.storm_bolt
  const levelData = abilityDef.levels[Math.min(learnedLevel, abilityDef.maxLevel) - 1]
  if (!levelData) return null
  if (caster.mana < levelData.mana) return null

  if (!target || target.isDead || target.hp <= 0) return null
  if (target.team === caster.team) return null
  if (target.isBuilding) return null
  if (isSpellImmune(target, gameTime)) return null
  if (!caster.mesh?.position || !target.mesh?.position) return null
  if (caster.mesh.position.distanceTo(target.mesh.position) > levelData.range) return null

  caster.mana -= levelData.mana
  caster.stormBoltCooldownUntil = gameTime + levelData.cooldown

  const projectileSpeed = 12.0
  const dist = caster.mesh.position.distanceTo(target.mesh.position)
  return {
    caster,
    target,
    levelData,
    hitTime: gameTime + dist / projectileSpeed,
  }
}

export function getStormBoltStunDuration(target: Unit, levelData: HeroAbilityLevelDef): number {
  const targetIsHero = !!UNITS[target.type]?.isHero
  return targetIsHero
    ? (levelData.heroStunDuration ?? 3)
    : (levelData.stunDuration ?? 5)
}

export function resolveStormBoltImpact(projectile: StormBoltProjectile, gameTime: number): StormBoltImpact | null {
  if (gameTime < projectile.hitTime) return null
  const { target, levelData } = projectile
  if (target.isDead || target.hp <= 0) return null
  if (isSpellImmune(target, gameTime)) return null

  const damage = levelData.effectValue
  const stunDuration = getStormBoltStunDuration(target, levelData)
  target.hp -= damage
  target.stunUntil = gameTime + stunDuration
  target.attackTimer = Math.max(target.attackTimer, stunDuration)

  return { target, damage, stunDuration }
}
