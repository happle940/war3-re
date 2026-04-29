import { HERO_ABILITY_LEVELS, UNITS } from '../GameData'
import type { HeroAbilityLevelDef } from '../GameData'
import type { Unit } from '../UnitTypes'

export type DeadUnitRecord = {
  team: number
  type: string
  x: number
  z: number
  diedAt: number
}

export type HolyLightCastResult = {
  healed: number
}

export type ResurrectionCastResult = {
  revivedRecords: DeadUnitRecord[]
}

function getPaladinAbilityLevelData(
  paladin: Unit,
  abilityKey: 'holy_light' | 'divine_shield' | 'resurrection',
): HeroAbilityLevelDef | null {
  const learnedLevel = paladin.abilityLevels?.[abilityKey] ?? 0
  if (learnedLevel < 1) return null
  const abilityDef = HERO_ABILITY_LEVELS[abilityKey]
  const castLevel = Math.min(learnedLevel, abilityDef.maxLevel)
  return abilityDef.levels[castLevel - 1] ?? null
}

function canCastPaladinAbility(paladin: Unit): boolean {
  return paladin.type === 'paladin' && !paladin.isDead && paladin.hp > 0
}

export function castPaladinHolyLight(paladin: Unit, target: Unit, gameTime: number): HolyLightCastResult | null {
  const levelData = getPaladinAbilityLevelData(paladin, 'holy_light')
  if (!levelData) return null
  if (!canCastPaladinAbility(paladin)) return null
  if (target.team !== paladin.team) return null
  if (target === paladin) return null
  if (target.isBuilding) return null
  if (target.hp <= 0 || target.hp >= target.maxHp) return null
  if (paladin.mana < levelData.mana) return null
  if (gameTime < paladin.healCooldownUntil) return null
  if (paladin.mesh.position.distanceTo(target.mesh.position) > levelData.range) return null

  paladin.mana -= levelData.mana
  paladin.healCooldownUntil = gameTime + levelData.cooldown

  const before = target.hp
  target.hp = Math.min(target.maxHp, target.hp + levelData.effectValue)
  return { healed: target.hp - before }
}

export function castPaladinDivineShield(paladin: Unit, gameTime: number): boolean {
  const levelData = getPaladinAbilityLevelData(paladin, 'divine_shield')
  if (!levelData) return false
  if (!canCastPaladinAbility(paladin)) return false
  if (paladin.mana < levelData.mana) return false
  if (gameTime < paladin.divineShieldCooldownUntil) return false

  paladin.mana -= levelData.mana
  paladin.divineShieldUntil = gameTime + (levelData.duration ?? 0)
  paladin.divineShieldCooldownUntil = gameTime + levelData.cooldown
  return true
}

export function getResurrectionEligibleRecordIndices(
  deadUnitRecords: readonly DeadUnitRecord[],
  paladin: Unit,
  levelData: { areaRadius?: number; maxTargets?: number },
): number[] {
  const radius = levelData.areaRadius ?? 0
  const maxTargets = levelData.maxTargets ?? 0
  if (radius <= 0 || maxTargets <= 0) return []
  const radiusSq = radius * radius
  const px = paladin.mesh.position.x
  const pz = paladin.mesh.position.z

  return deadUnitRecords
    .map((rec, index) => ({ rec, index }))
    .filter(({ rec }) => {
      if (rec.team !== paladin.team) return false
      const unitDef = UNITS[rec.type]
      if (!unitDef || unitDef.isHero) return false
      const dx = rec.x - px
      const dz = rec.z - pz
      return dx * dx + dz * dz <= radiusSq
    })
    .sort((a, b) => (a.rec.diedAt - b.rec.diedAt) || (a.index - b.index))
    .slice(0, maxTargets)
    .map(({ index }) => index)
}

export function castPaladinResurrection(
  paladin: Unit,
  deadUnitRecords: DeadUnitRecord[],
  gameTime: number,
): ResurrectionCastResult | null {
  const levelData = getPaladinAbilityLevelData(paladin, 'resurrection')
  if (!levelData) return null
  if (!canCastPaladinAbility(paladin)) return null
  if (paladin.mana < levelData.mana) return null
  if (gameTime < paladin.resurrectionCooldownUntil) return null

  const eligible = getResurrectionEligibleRecordIndices(deadUnitRecords, paladin, levelData)
  if (eligible.length === 0) return null

  const revivedRecords = eligible.map(index => deadUnitRecords[index])
  paladin.mana -= levelData.mana
  paladin.resurrectionCooldownUntil = gameTime + levelData.cooldown
  paladin.resurrectionLastRevivedCount = revivedRecords.length
  paladin.resurrectionFeedbackUntil = gameTime + 5

  for (const index of [...eligible].sort((a, b) => b - a)) {
    deadUnitRecords.splice(index, 1)
  }

  return { revivedRecords }
}
