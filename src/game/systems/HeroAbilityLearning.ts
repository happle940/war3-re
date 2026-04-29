import type { Unit } from '../UnitTypes'

export type LearnableHeroAbilityLevel = {
  requiredHeroLevel: number
}

export type HeroAbilityLearnState<TLevel extends LearnableHeroAbilityLevel> = {
  learnedLevel: number
  nextLevel: number
  nextData: TLevel | null
  canLearn: boolean
  reason: string
}

export function getHeroAbilityLearnState<TLevel extends LearnableHeroAbilityLevel>(
  hero: Unit,
  abilityKey: string,
  levels: readonly TLevel[],
  maxLevel = levels.length,
): HeroAbilityLearnState<TLevel> {
  const learnedLevel = hero.abilityLevels?.[abilityKey] ?? 0
  const nextLevel = learnedLevel + 1
  const nextData = learnedLevel < maxLevel ? (levels[nextLevel - 1] ?? null) : null
  if (!nextData) {
    return { learnedLevel, nextLevel, nextData: null, canLearn: false, reason: '' }
  }

  const skillPoints = hero.heroSkillPoints ?? 0
  const heroLevel = hero.heroLevel ?? 1
  if (hero.isDead) {
    return { learnedLevel, nextLevel, nextData, canLearn: false, reason: '已死亡' }
  }
  if (skillPoints <= 0) {
    return { learnedLevel, nextLevel, nextData, canLearn: false, reason: '无技能点' }
  }
  if (heroLevel < nextData.requiredHeroLevel) {
    return {
      learnedLevel,
      nextLevel,
      nextData,
      canLearn: false,
      reason: `需要英雄等级 ${nextData.requiredHeroLevel}`,
    }
  }

  return { learnedLevel, nextLevel, nextData, canLearn: true, reason: '' }
}

export function learnHeroAbility<TLevel extends LearnableHeroAbilityLevel>(
  hero: Unit,
  abilityKey: string,
  levels: readonly TLevel[],
  maxLevel = levels.length,
): boolean {
  const state = getHeroAbilityLearnState(hero, abilityKey, levels, maxLevel)
  if (!state.canLearn || !state.nextData) return false
  if (!hero.abilityLevels) hero.abilityLevels = {}
  hero.abilityLevels[abilityKey] = state.nextLevel
  hero.heroSkillPoints = (hero.heroSkillPoints ?? 1) - 1
  return true
}
