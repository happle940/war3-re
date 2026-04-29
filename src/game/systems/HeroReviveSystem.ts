import { HERO_REVIVE_RULES, UNITS } from '../GameData'
import type { Unit } from '../UnitTypes'
import { expireAvatar } from './AvatarSystem'
import { clearActiveUnitOrder, clearPreviousUnitOrder } from './UnitOrderState'

export type HeroReviveQuote = {
  gold: number
  lumber: number
  totalDuration: number
}

export function getHeroReviveQuote(deadHero: Unit): HeroReviveQuote | null {
  const heroDef = UNITS[deadHero.type]
  if (!heroDef?.isHero) return null

  const level = deadHero.heroLevel ?? heroDef.heroLevel ?? 1
  const goldFactor = Math.min(
    HERO_REVIVE_RULES.goldBaseFactor + HERO_REVIVE_RULES.goldLevelFactor * (level - 1),
    HERO_REVIVE_RULES.goldMaxFactor,
  )
  const gold = Math.min(
    Math.floor(heroDef.cost.gold * goldFactor),
    HERO_REVIVE_RULES.goldHardCap,
  )
  const lumberFactor = HERO_REVIVE_RULES.lumberBaseFactor + HERO_REVIVE_RULES.lumberLevelFactor * (level - 1)
  const lumber = Math.floor(heroDef.cost.lumber * lumberFactor)
  const rawTime = heroDef.trainTime * level * HERO_REVIVE_RULES.timeFactor
  const cappedTime = Math.min(
    rawTime,
    heroDef.trainTime * HERO_REVIVE_RULES.timeMaxFactor,
    HERO_REVIVE_RULES.timeHardCap,
  )

  return { gold, lumber, totalDuration: Math.round(cappedTime) }
}

export function restoreHeroFromRevive(hero: Unit, gameTime: number) {
  expireAvatar(hero, gameTime, true)
  hero.isDead = false
  hero.hp = Math.min(hero.maxHp, Math.floor(hero.maxHp * HERO_REVIVE_RULES.lifeFactor))
  hero.mana = HERO_REVIVE_RULES.simplifiedManaMapping === 'maxMana'
    ? hero.maxMana
    : Math.min(hero.maxMana, Math.floor(hero.maxMana * HERO_REVIVE_RULES.manaStartFactor))

  clearActiveUnitOrder(hero)
  clearPreviousUnitOrder(hero)
  hero.buildTarget = null
  hero.slowUntil = 0
  hero.slowSpeedMultiplier = 1
  hero.attackSlowUntil = 0
  hero.attackSpeedMultiplier = 1
  hero.healCooldownUntil = 0
  hero.divineShieldUntil = 0
  hero.divineShieldCooldownUntil = 0
  hero.resurrectionCooldownUntil = 0
  hero.resurrectionLastRevivedCount = 0
  hero.resurrectionFeedbackUntil = 0
  hero.waterElementalCooldownUntil = 0
  hero.avatarUntil = 0
  hero.avatarCooldownUntil = 0
  hero.avatarAppliedHpBonus = 0
  hero.avatarAppliedArmorBonus = 0
  hero.avatarAppliedDamageBonus = 0
  hero.spellImmuneUntil = 0
  hero.abilityFeedbackText = ''
  hero.abilityFeedbackUntil = 0
  hero.inventoryItems = hero.inventoryItems ?? []
  hero.aggroSuppressUntil = Math.max(hero.aggroSuppressUntil, gameTime + 1)
  hero.mesh.visible = true
}
