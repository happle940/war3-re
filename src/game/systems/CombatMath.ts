import {
  ABILITIES,
  ArmorType,
  AttackType,
  BUILDINGS,
  getTypeMultiplier,
  UNITS,
} from '../GameData'

export interface CombatDamageSource {
  type: string
  attackDamage: number
  rallyCallBoostUntil?: number
}

export interface CombatDamageTarget {
  type: string
  armor: number
  defendActive?: boolean
}

export interface CombatDamageResolution {
  rawDamage: number
  attackType: AttackType
  armorType: ArmorType
  typeMultiplier: number
  defendMultiplier: number
  armorReduction: number
  finalDamage: number
}

export function getRuntimeAttackType(type: string): AttackType {
  return UNITS[type]?.attackType ?? BUILDINGS[type]?.attackType ?? AttackType.Normal
}

export function getRuntimeArmorType(type: string): ArmorType {
  return UNITS[type]?.armorType ?? BUILDINGS[type]?.armorType ?? ArmorType.Medium
}

export function calculateArmorReduction(armor: number): number {
  return armor > 0 ? (armor * 0.06) / (1 + 0.06 * armor) : 0
}

export function calculateRawAttackDamage(attacker: CombatDamageSource, gameTime: number): number {
  const rallyBonus = (attacker.rallyCallBoostUntil ?? 0) > gameTime
    ? ABILITIES.rally_call.effectValue
    : 0
  return attacker.attackDamage + rallyBonus
}

export function calculateDefendMultiplier(target: CombatDamageTarget, attackType: AttackType): number {
  const defend = ABILITIES.defend
  const isDefendOwner = Array.isArray(defend.ownerType)
    ? defend.ownerType.includes(target.type)
    : target.type === defend.ownerType
  return target.defendActive && isDefendOwner && attackType === defend.affectedAttackType
    ? (defend.damageReduction ?? 1)
    : 1
}

export function calculateCombatDamage(input: {
  rawDamage: number
  attackType: AttackType
  target: CombatDamageTarget
  damageScale?: number
  applyDefend?: boolean
}): CombatDamageResolution {
  const armorType = getRuntimeArmorType(input.target.type)
  const typeMultiplier = getTypeMultiplier(input.attackType, armorType)
  const defendMultiplier = input.applyDefend === false
    ? 1
    : calculateDefendMultiplier(input.target, input.attackType)
  const armorReduction = calculateArmorReduction(input.target.armor)
  const scaledDamage = input.rawDamage * (input.damageScale ?? 1)
  const finalDamage = Math.max(1, Math.round(
    scaledDamage * typeMultiplier * defendMultiplier * (1 - armorReduction),
  ))

  return {
    rawDamage: input.rawDamage,
    attackType: input.attackType,
    armorType,
    typeMultiplier,
    defendMultiplier,
    armorReduction,
    finalDamage,
  }
}

export function calculateAttackDamage(
  attacker: CombatDamageSource,
  target: CombatDamageTarget,
  gameTime: number,
): CombatDamageResolution {
  const rawDamage = calculateRawAttackDamage(attacker, gameTime)
  return calculateCombatDamage({
    rawDamage,
    attackType: getRuntimeAttackType(attacker.type),
    target,
  })
}
