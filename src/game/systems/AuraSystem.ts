import { HERO_ABILITY_LEVELS } from '../GameData'
import type { HeroAbilityLevelDef } from '../GameData'
import type { Unit } from '../UnitTypes'

function isAlive(unit: Unit): boolean {
  return !unit.isDead && unit.hp > 0
}

function getLearnedLevelData(
  unit: Unit,
  abilityKey: 'devotion_aura' | 'brilliance_aura',
): HeroAbilityLevelDef | null {
  const learnedLevel = unit.abilityLevels?.[abilityKey] ?? 0
  if (learnedLevel < 1) return null
  const def = HERO_ABILITY_LEVELS[abilityKey]
  const castLevel = Math.min(learnedLevel, def.maxLevel)
  return def.levels[castLevel - 1] ?? null
}

function canReceiveFriendlyAura(source: Unit, target: Unit): boolean {
  if (target === source) return true
  if (!isAlive(target)) return false
  if (target.isBuilding) return false
  if (target.team !== source.team) return false
  return true
}

export function updateDevotionAura(units: readonly Unit[]): void {
  const bestBonusByUnit = new Map<Unit, number>()

  for (const unit of units) {
    if (unit.devotionAuraBonus > 0) {
      unit.armor -= unit.devotionAuraBonus
      unit.devotionAuraBonus = 0
    }
  }

  for (const paladin of units) {
    if (paladin.type !== 'paladin') continue
    if (!isAlive(paladin)) continue

    const levelData = getLearnedLevelData(paladin, 'devotion_aura')
    const bonus = levelData?.armorBonus ?? 0
    const radius = levelData?.auraRadius ?? 0
    if (bonus <= 0) continue

    for (const unit of units) {
      if (!canReceiveFriendlyAura(paladin, unit)) continue
      if (unit !== paladin && paladin.mesh.position.distanceTo(unit.mesh.position) > radius) continue
      bestBonusByUnit.set(unit, Math.max(bestBonusByUnit.get(unit) ?? 0, bonus))
    }
  }

  for (const [unit, bonus] of bestBonusByUnit) {
    unit.armor += bonus
    unit.devotionAuraBonus = bonus
  }
}

export function updateBrillianceAura(units: readonly Unit[]): void {
  const bestBonusByUnit = new Map<Unit, number>()

  for (const unit of units) {
    unit.brillianceAuraBonus = 0
  }

  for (const archmage of units) {
    if (archmage.type !== 'archmage') continue
    if (!isAlive(archmage)) continue

    const levelData = getLearnedLevelData(archmage, 'brilliance_aura')
    const bonus = levelData?.manaRegenBonus ?? 0
    const radius = levelData?.auraRadius ?? 0
    if (bonus <= 0) continue

    for (const unit of units) {
      if (!canReceiveFriendlyAura(archmage, unit)) continue
      if (unit !== archmage && unit.maxMana <= 0) continue
      if (unit !== archmage && archmage.mesh.position.distanceTo(unit.mesh.position) > radius) continue
      bestBonusByUnit.set(unit, Math.max(bestBonusByUnit.get(unit) ?? 0, bonus))
    }
  }

  for (const [unit, bonus] of bestBonusByUnit) {
    unit.brillianceAuraBonus = bonus
  }
}
