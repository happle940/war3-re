import { HERO_XP_RULES } from '../GameData'
import type { Unit } from '../UnitTypes'

export function addHeroXp(hero: Unit, xpGain: number) {
  if (xpGain <= 0) return
  if ((hero.heroLevel ?? 1) >= HERO_XP_RULES.maxHeroLevel) return

  hero.heroXP = (hero.heroXP ?? 0) + xpGain
  applyHeroLevelUps(hero)
}

function applyHeroLevelUps(hero: Unit) {
  while (true) {
    const currentLevel = hero.heroLevel ?? 1
    if (currentLevel >= HERO_XP_RULES.maxHeroLevel) return

    const nextLevel = currentLevel + 1
    const threshold = HERO_XP_RULES.xpThresholdsByLevel[nextLevel]
    if (threshold === undefined) return
    if ((hero.heroXP ?? 0) < threshold) return

    hero.heroLevel = nextLevel
    hero.heroSkillPoints = (hero.heroSkillPoints ?? 0) + HERO_XP_RULES.skillPointsPerLevel
  }
}
