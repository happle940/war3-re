import { HERO_ABILITY_LEVELS, UNITS } from '../GameData'
import type { HeroAbilityLevelDef } from '../GameData'
import type { Unit } from '../UnitTypes'

export type BashProcResult = {
  target: Unit
  levelData: HeroAbilityLevelDef
  bonusDamage: number
  stunDuration: number
}

export function getBashStunDuration(target: Unit, levelData: HeroAbilityLevelDef): number {
  return UNITS[target.type]?.isHero
    ? (levelData.heroStunDuration ?? 1)
    : (levelData.stunDuration ?? 2)
}

export function resolveBashProc(
  attacker: Unit,
  target: Unit,
  gameTime: number,
  random: () => number = Math.random,
): BashProcResult | null {
  if (attacker.type !== 'mountain_king') return null
  if (attacker.isDead || attacker.hp <= 0) return null
  if (target.isDead || target.hp <= 0) return null
  if (target.team === attacker.team) return null
  if (target.isBuilding) return null

  const learnedLevel = attacker.abilityLevels?.bash ?? 0
  if (learnedLevel < 1) return null

  const abilityDef = HERO_ABILITY_LEVELS.bash
  const levelData = abilityDef.levels[Math.min(learnedLevel, abilityDef.maxLevel) - 1]
  if (!levelData) return null

  const triggerChance = levelData.triggerChance ?? 0
  if (triggerChance <= 0 || random() >= triggerChance) return null

  const bonusDamage = levelData.bonusDamage ?? 0
  const stunDuration = getBashStunDuration(target, levelData)
  target.hp -= bonusDamage
  target.stunUntil = Math.max(target.stunUntil, gameTime + stunDuration)
  target.attackTimer = Math.max(target.attackTimer, stunDuration)

  return {
    target,
    levelData,
    bonusDamage,
    stunDuration,
  }
}
