import { HERO_ABILITY_LEVELS } from '../GameData'
import type { HeroAbilityLevelDef } from '../GameData'
import type { Unit } from '../UnitTypes'

export type AvatarCastResult = {
  levelData: HeroAbilityLevelDef
  expiresAt: number
}

export function isSpellImmune(unit: Unit, gameTime: number): boolean {
  return unit.spellImmuneUntil > gameTime
}

export function castAvatar(caster: Unit, gameTime: number): AvatarCastResult | null {
  if (caster.type !== 'mountain_king') return null
  if (caster.isDead || caster.hp <= 0) return null
  if (caster.avatarUntil > gameTime) return null
  if (gameTime < caster.avatarCooldownUntil) return null

  const learnedLevel = caster.abilityLevels?.avatar ?? 0
  if (learnedLevel < 1) return null

  const abilityDef = HERO_ABILITY_LEVELS.avatar
  const levelData = abilityDef.levels[Math.min(learnedLevel, abilityDef.maxLevel) - 1]
  if (!levelData) return null
  if (caster.mana < levelData.mana) return null

  const hpBonus = levelData.hpBonus ?? 0
  const armorBonus = levelData.armorBonus ?? 0
  const damageBonus = levelData.damageBonus ?? 0
  const expiresAt = gameTime + (levelData.duration ?? 0)

  caster.mana -= levelData.mana
  caster.avatarCooldownUntil = gameTime + levelData.cooldown
  caster.avatarUntil = expiresAt
  caster.avatarAppliedHpBonus = hpBonus
  caster.avatarAppliedArmorBonus = armorBonus
  caster.avatarAppliedDamageBonus = damageBonus
  caster.maxHp += hpBonus
  caster.hp += hpBonus
  caster.armor += armorBonus
  caster.attackDamage += damageBonus
  if (levelData.spellImmunity) {
    caster.spellImmuneUntil = Math.max(caster.spellImmuneUntil, expiresAt)
  }

  return { levelData, expiresAt }
}

export function expireAvatar(unit: Unit, gameTime: number, force = false): boolean {
  if (unit.avatarUntil <= 0) return false
  if (!force && unit.avatarUntil > gameTime) return false

  unit.maxHp = Math.max(1, unit.maxHp - unit.avatarAppliedHpBonus)
  unit.hp = Math.min(unit.hp, unit.maxHp)
  unit.armor -= unit.avatarAppliedArmorBonus
  unit.attackDamage -= unit.avatarAppliedDamageBonus
  unit.avatarUntil = 0
  unit.avatarAppliedHpBonus = 0
  unit.avatarAppliedArmorBonus = 0
  unit.avatarAppliedDamageBonus = 0
  if (unit.spellImmuneUntil <= gameTime || force) {
    unit.spellImmuneUntil = 0
  }

  return true
}
