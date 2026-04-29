import { HERO_ABILITY_LEVELS, WATER_ELEMENTAL_SUMMON_LEVELS } from '../GameData'
import type { HeroAbilityLevelDef, WaterElementalSummonLevel } from '../GameData'
import type { Unit } from '../UnitTypes'

export const WATER_ELEMENTAL_CAST_RANGE = 8.0
export const WATER_ELEMENTAL_DEFAULT_SIGHT_RANGE = 8.0
export const WATER_ELEMENTAL_DEFAULT_ATTACK_COOLDOWN = 1.5
export const WATER_ELEMENTAL_DEFAULT_SUPPLY = 0

export type WaterElementalSummonResult = {
  levelData: WaterElementalSummonLevel
  targetX: number
  targetZ: number
  expiresAt: number
}

export type BlizzardChannel = {
  caster: Unit
  targetX: number
  targetZ: number
  startTime: number
  nextWaveTime: number
  wavesRemaining: number
  waveInterval: number
  levelData: HeroAbilityLevelDef
}

export function castSummonWaterElemental(
  archmage: Unit,
  targetX: number,
  targetZ: number,
  gameTime: number,
  isTileBlocked: (tileX: number, tileZ: number) => boolean,
): WaterElementalSummonResult | null {
  if (!Number.isFinite(targetX) || !Number.isFinite(targetZ)) return null
  const learnedLevel = archmage.abilityLevels?.water_elemental ?? 0
  if (learnedLevel < 1) return null
  if (archmage.type !== 'archmage') return null
  if (archmage.isDead || archmage.hp <= 0) return null
  if (gameTime < archmage.waterElementalCooldownUntil) return null

  const levelData = WATER_ELEMENTAL_SUMMON_LEVELS[Math.min(learnedLevel, WATER_ELEMENTAL_SUMMON_LEVELS.length) - 1]
  if (!levelData) return null
  if (archmage.mana < levelData.mana) return null

  const dx = targetX - archmage.mesh.position.x
  const dz = targetZ - archmage.mesh.position.z
  if (Math.sqrt(dx * dx + dz * dz) > WATER_ELEMENTAL_CAST_RANGE) return null

  const tileX = Math.floor(targetX)
  const tileZ = Math.floor(targetZ)
  if (isTileBlocked(tileX, tileZ)) return null

  archmage.mana -= levelData.mana
  archmage.waterElementalCooldownUntil = gameTime + levelData.cooldown

  return {
    levelData,
    targetX,
    targetZ,
    expiresAt: gameTime + levelData.duration,
  }
}

export function applyWaterElementalSummonStats(
  waterElemental: Unit,
  summon: WaterElementalSummonResult,
): void {
  const { levelData } = summon
  waterElemental.hp = levelData.summonedHp
  waterElemental.maxHp = levelData.summonedHp
  waterElemental.attackDamage = levelData.summonedAttackDamage
  waterElemental.attackRange = levelData.summonedAttackRange
  waterElemental.attackCooldown = WATER_ELEMENTAL_DEFAULT_ATTACK_COOLDOWN
  waterElemental.armor = levelData.summonedArmor
  waterElemental.speed = levelData.summonedSpeed
  waterElemental.summonExpireAt = summon.expiresAt
}

export function castArchmageBlizzard(
  archmage: Unit,
  targetX: number,
  targetZ: number,
  gameTime: number,
  hasActiveChannel: boolean,
): BlizzardChannel | null {
  if (!Number.isFinite(targetX) || !Number.isFinite(targetZ)) return null
  const learnedLevel = archmage.abilityLevels?.blizzard ?? 0
  if (learnedLevel < 1) return null
  if (archmage.type !== 'archmage') return null
  if (archmage.isDead || archmage.hp <= 0) return null
  if (gameTime < archmage.blizzardCooldownUntil) return null
  if (hasActiveChannel) return null

  const abilityDef = HERO_ABILITY_LEVELS.blizzard
  const levelData = abilityDef.levels[Math.min(learnedLevel, abilityDef.maxLevel) - 1]
  if (!levelData) return null
  if (archmage.mana < levelData.mana) return null

  const dx = targetX - archmage.mesh.position.x
  const dz = targetZ - archmage.mesh.position.z
  if (Math.sqrt(dx * dx + dz * dz) > levelData.range) return null

  archmage.mana -= levelData.mana
  archmage.blizzardCooldownUntil = gameTime + levelData.cooldown

  const waveInterval = (levelData.duration ?? 6) / (levelData.waves ?? 6)
  return {
    caster: archmage,
    targetX,
    targetZ,
    startTime: gameTime,
    nextWaveTime: gameTime + waveInterval,
    wavesRemaining: levelData.waves ?? 6,
    waveInterval,
    levelData,
  }
}
