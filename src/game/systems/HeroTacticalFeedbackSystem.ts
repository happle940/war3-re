import { HERO_ABILITY_LEVELS, UNITS, WATER_ELEMENTAL_SUMMON_LEVELS } from '../GameData'
import type { HeroAbilityLevelDef, WaterElementalSummonLevel } from '../GameData'
import type { Unit } from '../UnitTypes'
import { WATER_ELEMENTAL_CAST_RANGE } from './ArchmageAbilitySystem'
import { isSpellImmune } from './AvatarSystem'
import { getResurrectionEligibleRecordIndices } from './PaladinAbilitySystem'
import type { DeadUnitRecord } from './PaladinAbilitySystem'
import { selectThunderClapTargets } from './ThunderClapSystem'

export type HeroAbilityTargetKind = 'self' | 'friendly-unit' | 'enemy-unit' | 'ground' | 'corpse' | 'passive'
export type HeroAbilityStatus = 'ready' | 'blocked' | 'active' | 'passive'
export type HeroAbilityBlocker =
  | 'dead'
  | 'mana'
  | 'cooldown'
  | 'active'
  | 'channeling'
  | 'pending'
  | 'no-target'

export interface HeroAbilityReadiness {
  heroType: string
  abilityKey: string
  label: string
  level: number
  status: HeroAbilityStatus
  targetKind: HeroAbilityTargetKind
  targetHint: string
  detail: string
  reason: string
  manaCost: number
  cooldown: number
  range: number
  areaRadius?: number
  requiresCursor?: boolean
  blocker?: HeroAbilityBlocker
}

export interface HeroTacticalFeedbackSnapshot {
  abilityCount: number
  readyAbilityCount: number
  blockedAbilityCount: number
  activeAbilityCount: number
  passiveAbilityCount: number
  targetHintCount: number
  cooldownVisibleCount: number
  targetKinds: HeroAbilityTargetKind[]
  hasResurrection: boolean
  resurrectionReady: boolean
  resurrectionDetail: string
  abilities: HeroAbilityReadiness[]
}

function alive(unit: Unit) {
  return unit.hp > 0 && !unit.isDead
}

function learnedLevel(hero: Unit, abilityKey: string) {
  return Math.max(0, hero.abilityLevels?.[abilityKey] ?? 0)
}

function getHeroLevelData(hero: Unit, abilityKey: string): HeroAbilityLevelDef | null {
  const abilityDef = HERO_ABILITY_LEVELS[abilityKey]
  if (!abilityDef) return null
  const level = learnedLevel(hero, abilityKey)
  if (level < 1) return null
  return abilityDef.levels[Math.min(level, abilityDef.maxLevel) - 1] ?? null
}

function getWaterElementalLevelData(hero: Unit): WaterElementalSummonLevel | null {
  const level = learnedLevel(hero, 'water_elemental')
  if (level < 1) return null
  return WATER_ELEMENTAL_SUMMON_LEVELS[Math.min(level, WATER_ELEMENTAL_SUMMON_LEVELS.length) - 1] ?? null
}

function dist(a: Unit, b: Unit) {
  return a.mesh.position.distanceTo(b.mesh.position)
}

function hasFriendlyUnitTarget(hero: Unit, units: readonly Unit[], range: number, requireInjured = false) {
  return units.some(unit => {
    if (unit === hero) return false
    if (unit.team !== hero.team) return false
    if (unit.isBuilding || !alive(unit)) return false
    if (requireInjured && unit.hp >= unit.maxHp) return false
    return dist(hero, unit) <= range
  })
}

function hasFriendlyTeleportTarget(hero: Unit, units: readonly Unit[]) {
  return units.some(unit => unit !== hero && unit.team === hero.team && alive(unit))
}

function hasEnemyUnitTarget(hero: Unit, units: readonly Unit[], range: number, gameTime: number) {
  return units.some(unit => {
    if (unit.team === hero.team) return false
    if (unit.isBuilding || !alive(unit)) return false
    if (isSpellImmune(unit, gameTime)) return false
    return dist(hero, unit) <= range
  })
}

function makeDetail(data: { mana: number; cooldown: number; range: number; extra?: string }) {
  const range = Number.isFinite(data.range) ? data.range : '全图'
  const parts = [`法力 ${data.mana}`, `冷却 ${data.cooldown}s`, `距离 ${range}`]
  if (data.extra) parts.push(data.extra)
  return parts.join(' · ')
}

function buildStatus(input: {
  hero: Unit
  levelData: { mana: number; cooldown: number; range: number }
  gameTime: number
  cooldownUntil?: number
  activeUntil?: number
  channeling?: boolean
  pending?: boolean
  hasTarget?: boolean
}): { status: HeroAbilityStatus; reason: string; blocker?: HeroAbilityBlocker } {
  if (!alive(input.hero)) return { status: 'blocked', reason: '英雄已死亡', blocker: 'dead' }
  if ((input.activeUntil ?? 0) > input.gameTime) {
    return { status: 'active', reason: `生效中 ${Math.ceil((input.activeUntil ?? 0) - input.gameTime)}s`, blocker: 'active' }
  }
  if (input.channeling) return { status: 'active', reason: '正在引导', blocker: 'channeling' }
  if (input.pending) return { status: 'active', reason: '准备中', blocker: 'pending' }
  if ((input.cooldownUntil ?? 0) > input.gameTime) {
    return { status: 'blocked', reason: `冷却中 ${Math.ceil((input.cooldownUntil ?? 0) - input.gameTime)}s`, blocker: 'cooldown' }
  }
  if (input.hero.mana < input.levelData.mana) return { status: 'blocked', reason: '法力不足', blocker: 'mana' }
  if (input.hasTarget === false) return { status: 'blocked', reason: '当前无合法目标', blocker: 'no-target' }
  return { status: 'ready', reason: '可用' }
}

function pushHeroAbility(
  abilities: HeroAbilityReadiness[],
  input: Omit<HeroAbilityReadiness, 'level' | 'status' | 'reason' | 'blocker'> & {
    hero: Unit
    level: number
    status: HeroAbilityStatus
    reason: string
    blocker?: HeroAbilityBlocker
  },
) {
  abilities.push({
    heroType: input.heroType,
    abilityKey: input.abilityKey,
    label: input.label,
    level: input.level,
    status: input.status,
    targetKind: input.targetKind,
    targetHint: input.targetHint,
    detail: input.detail,
    reason: input.reason,
    manaCost: input.manaCost,
    cooldown: input.cooldown,
    range: input.range,
    areaRadius: input.areaRadius,
    requiresCursor: input.requiresCursor,
    blocker: input.blocker,
  })
}

function pushPassive(
  abilities: HeroAbilityReadiness[],
  hero: Unit,
  abilityKey: string,
  label: string,
  data: HeroAbilityLevelDef,
  extra: string,
) {
  pushHeroAbility(abilities, {
    hero,
    heroType: hero.type,
    abilityKey,
    label,
    level: learnedLevel(hero, abilityKey),
    status: 'passive',
    targetKind: 'passive',
    targetHint: '被动能力，学习后自动生效',
    detail: makeDetail({ mana: data.mana, cooldown: data.cooldown, range: data.range, extra }),
    reason: '被动生效',
    manaCost: data.mana,
    cooldown: data.cooldown,
    range: data.range,
  })
}

export function buildHeroTacticalFeedbackSnapshot(input: {
  units: readonly Unit[]
  deadUnitRecords: readonly DeadUnitRecord[]
  gameTime: number
  blizzardChannelCaster: Unit | null
  massTeleportPendingCaster: Unit | null
}): HeroTacticalFeedbackSnapshot {
  const abilities: HeroAbilityReadiness[] = []
  const playerHeroes = input.units.filter(unit => !unit.isBuilding && unit.team === 0 && alive(unit) && !!UNITS[unit.type]?.isHero)

  for (const hero of playerHeroes) {
    if (hero.type === 'paladin') {
      const holyLight = getHeroLevelData(hero, 'holy_light')
      if (holyLight) {
        const hasTarget = hasFriendlyUnitTarget(hero, input.units, holyLight.range, true)
        const status = buildStatus({
          hero,
          levelData: holyLight,
          gameTime: input.gameTime,
          cooldownUntil: hero.healCooldownUntil,
          hasTarget,
        })
        pushHeroAbility(abilities, {
          hero,
          heroType: hero.type,
          abilityKey: 'holy_light',
          label: '圣光术',
          level: learnedLevel(hero, 'holy_light'),
          status: status.status,
          targetKind: 'friendly-unit',
          targetHint: `治疗 ${holyLight.range} 距离内受伤友方非建筑单位`,
          detail: makeDetail({ mana: holyLight.mana, cooldown: holyLight.cooldown, range: holyLight.range, extra: `治疗 ${holyLight.effectValue}` }),
          reason: status.reason,
          blocker: status.blocker,
          manaCost: holyLight.mana,
          cooldown: holyLight.cooldown,
          range: holyLight.range,
          requiresCursor: true,
        })
      }

      const divineShield = getHeroLevelData(hero, 'divine_shield')
      if (divineShield) {
        const status = buildStatus({
          hero,
          levelData: divineShield,
          gameTime: input.gameTime,
          cooldownUntil: hero.divineShieldCooldownUntil,
          activeUntil: hero.divineShieldUntil,
        })
        pushHeroAbility(abilities, {
          hero,
          heroType: hero.type,
          abilityKey: 'divine_shield',
          label: '神圣护盾',
          level: learnedLevel(hero, 'divine_shield'),
          status: status.status,
          targetKind: 'self',
          targetHint: '自身瞬发防护',
          detail: makeDetail({ mana: divineShield.mana, cooldown: divineShield.cooldown, range: divineShield.range, extra: `无敌 ${divineShield.duration ?? 0}s` }),
          reason: status.reason,
          blocker: status.blocker,
          manaCost: divineShield.mana,
          cooldown: divineShield.cooldown,
          range: divineShield.range,
        })
      }

      const devotionAura = getHeroLevelData(hero, 'devotion_aura')
      if (devotionAura) {
        pushPassive(abilities, hero, 'devotion_aura', '虔诚光环', devotionAura, `护甲 +${devotionAura.armorBonus ?? 0} · 半径 ${devotionAura.auraRadius ?? 0}`)
      }

      const resurrection = getHeroLevelData(hero, 'resurrection')
      if (resurrection) {
        const eligible = getResurrectionEligibleRecordIndices(input.deadUnitRecords, hero, resurrection)
        const status = buildStatus({
          hero,
          levelData: resurrection,
          gameTime: input.gameTime,
          cooldownUntil: hero.resurrectionCooldownUntil,
          hasTarget: eligible.length > 0,
        })
        pushHeroAbility(abilities, {
          hero,
          heroType: hero.type,
          abilityKey: 'resurrection',
          label: '复活',
          level: learnedLevel(hero, 'resurrection'),
          status: status.status,
          targetKind: 'corpse',
          targetHint: `复活 ${resurrection.areaRadius ?? 0} 半径内最多 ${resurrection.maxTargets ?? 0} 个友方非英雄尸体`,
          detail: makeDetail({ mana: resurrection.mana, cooldown: resurrection.cooldown, range: resurrection.range, extra: `可复活 ${eligible.length}` }),
          reason: eligible.length > 0 ? status.reason : '无可复活单位',
          blocker: eligible.length > 0 ? status.blocker : 'no-target',
          manaCost: resurrection.mana,
          cooldown: resurrection.cooldown,
          range: resurrection.range,
          areaRadius: resurrection.areaRadius ?? 0,
        })
      }
    }

    if (hero.type === 'archmage') {
      const waterElemental = getWaterElementalLevelData(hero)
      if (waterElemental) {
        const status = buildStatus({
          hero,
          levelData: { mana: waterElemental.mana, cooldown: waterElemental.cooldown, range: WATER_ELEMENTAL_CAST_RANGE },
          gameTime: input.gameTime,
          cooldownUntil: hero.waterElementalCooldownUntil,
        })
        pushHeroAbility(abilities, {
          hero,
          heroType: hero.type,
          abilityKey: 'water_elemental',
          label: '召唤水元素',
          level: learnedLevel(hero, 'water_elemental'),
          status: status.status,
          targetKind: 'ground',
          targetHint: `在 ${WATER_ELEMENTAL_CAST_RANGE} 距离内选择未阻挡地面`,
          detail: makeDetail({ mana: waterElemental.mana, cooldown: waterElemental.cooldown, range: WATER_ELEMENTAL_CAST_RANGE, extra: `持续 ${waterElemental.duration}s` }),
          reason: status.reason,
          blocker: status.blocker,
          manaCost: waterElemental.mana,
          cooldown: waterElemental.cooldown,
          range: WATER_ELEMENTAL_CAST_RANGE,
          requiresCursor: true,
        })
      }

      const brilliance = getHeroLevelData(hero, 'brilliance_aura')
      if (brilliance) {
        pushPassive(abilities, hero, 'brilliance_aura', '辉煌光环', brilliance, `法力回复 +${brilliance.manaRegenBonus ?? 0}/s · 半径 ${brilliance.auraRadius ?? 0}`)
      }

      const blizzard = getHeroLevelData(hero, 'blizzard')
      if (blizzard) {
        const status = buildStatus({
          hero,
          levelData: blizzard,
          gameTime: input.gameTime,
          cooldownUntil: hero.blizzardCooldownUntil,
          channeling: input.blizzardChannelCaster === hero,
        })
        pushHeroAbility(abilities, {
          hero,
          heroType: hero.type,
          abilityKey: 'blizzard',
          label: '暴风雪',
          level: learnedLevel(hero, 'blizzard'),
          status: status.status,
          targetKind: 'ground',
          targetHint: `在 ${blizzard.range} 距离内选择地面，对 ${blizzard.areaRadius ?? 0} 半径造成多波伤害`,
          detail: makeDetail({ mana: blizzard.mana, cooldown: blizzard.cooldown, range: blizzard.range, extra: `${blizzard.waves ?? 0} 波` }),
          reason: status.reason,
          blocker: status.blocker,
          manaCost: blizzard.mana,
          cooldown: blizzard.cooldown,
          range: blizzard.range,
          areaRadius: blizzard.areaRadius ?? 0,
          requiresCursor: true,
        })
      }

      const massTeleport = getHeroLevelData(hero, 'mass_teleport')
      if (massTeleport) {
        const hasTarget = hasFriendlyTeleportTarget(hero, input.units)
        const status = buildStatus({
          hero,
          levelData: massTeleport,
          gameTime: input.gameTime,
          cooldownUntil: hero.massTeleportCooldownUntil,
          pending: input.massTeleportPendingCaster === hero,
          hasTarget,
        })
        pushHeroAbility(abilities, {
          hero,
          heroType: hero.type,
          abilityKey: 'mass_teleport',
          label: '群体传送',
          level: learnedLevel(hero, 'mass_teleport'),
          status: status.status,
          targetKind: 'friendly-unit',
          targetHint: `选择友方单位或建筑，${massTeleport.castDelay ?? 0}s 后传送周围最多 ${massTeleport.maxTargets ?? 0} 个单位`,
          detail: makeDetail({ mana: massTeleport.mana, cooldown: massTeleport.cooldown, range: massTeleport.range, extra: `半径 ${massTeleport.areaRadius ?? 0}` }),
          reason: status.reason,
          blocker: status.blocker,
          manaCost: massTeleport.mana,
          cooldown: massTeleport.cooldown,
          range: massTeleport.range,
          areaRadius: massTeleport.areaRadius ?? 0,
          requiresCursor: true,
        })
      }
    }

    if (hero.type === 'mountain_king') {
      const stormBolt = getHeroLevelData(hero, 'storm_bolt')
      if (stormBolt) {
        const hasTarget = hasEnemyUnitTarget(hero, input.units, stormBolt.range, input.gameTime)
        const status = buildStatus({
          hero,
          levelData: stormBolt,
          gameTime: input.gameTime,
          cooldownUntil: hero.stormBoltCooldownUntil,
          hasTarget,
        })
        pushHeroAbility(abilities, {
          hero,
          heroType: hero.type,
          abilityKey: 'storm_bolt',
          label: '风暴之锤',
          level: learnedLevel(hero, 'storm_bolt'),
          status: status.status,
          targetKind: 'enemy-unit',
          targetHint: `选择 ${stormBolt.range} 距离内敌方非建筑、非魔免单位`,
          detail: makeDetail({ mana: stormBolt.mana, cooldown: stormBolt.cooldown, range: stormBolt.range, extra: `伤害 ${stormBolt.effectValue}` }),
          reason: status.reason,
          blocker: status.blocker,
          manaCost: stormBolt.mana,
          cooldown: stormBolt.cooldown,
          range: stormBolt.range,
          requiresCursor: true,
        })
      }

      const thunderClap = getHeroLevelData(hero, 'thunder_clap')
      if (thunderClap) {
        const targets = selectThunderClapTargets(input.units, hero, thunderClap.areaRadius ?? 0, input.gameTime)
        const status = buildStatus({
          hero,
          levelData: thunderClap,
          gameTime: input.gameTime,
          cooldownUntil: hero.thunderClapCooldownUntil,
          hasTarget: targets.length > 0,
        })
        pushHeroAbility(abilities, {
          hero,
          heroType: hero.type,
          abilityKey: 'thunder_clap',
          label: '雷霆一击',
          level: learnedLevel(hero, 'thunder_clap'),
          status: status.status,
          targetKind: 'self',
          targetHint: `自身周围 ${thunderClap.areaRadius ?? 0} 半径敌方非建筑单位`,
          detail: makeDetail({ mana: thunderClap.mana, cooldown: thunderClap.cooldown, range: thunderClap.range, extra: `可命中 ${targets.length}` }),
          reason: targets.length > 0 ? status.reason : '周围无敌方单位',
          blocker: targets.length > 0 ? status.blocker : 'no-target',
          manaCost: thunderClap.mana,
          cooldown: thunderClap.cooldown,
          range: thunderClap.range,
          areaRadius: thunderClap.areaRadius ?? 0,
        })
      }

      const bash = getHeroLevelData(hero, 'bash')
      if (bash) {
        pushPassive(abilities, hero, 'bash', '猛击', bash, `${Math.round((bash.triggerChance ?? 0) * 100)}% 触发 · +${bash.bonusDamage ?? 0} 伤害`)
      }

      const avatar = getHeroLevelData(hero, 'avatar')
      if (avatar) {
        const status = buildStatus({
          hero,
          levelData: avatar,
          gameTime: input.gameTime,
          cooldownUntil: hero.avatarCooldownUntil,
          activeUntil: hero.avatarUntil,
        })
        pushHeroAbility(abilities, {
          hero,
          heroType: hero.type,
          abilityKey: 'avatar',
          label: '化身',
          level: learnedLevel(hero, 'avatar'),
          status: status.status,
          targetKind: 'self',
          targetHint: '自身终极变身，获得生命、护甲、伤害和魔免',
          detail: makeDetail({ mana: avatar.mana, cooldown: avatar.cooldown, range: avatar.range, extra: `持续 ${avatar.duration ?? 0}s` }),
          reason: status.reason,
          blocker: status.blocker,
          manaCost: avatar.mana,
          cooldown: avatar.cooldown,
          range: avatar.range,
        })
      }
    }
  }

  const targetKinds = [...new Set(abilities.map(ability => ability.targetKind))]
  const resurrection = abilities.find(ability => ability.abilityKey === 'resurrection')
  return {
    abilityCount: abilities.length,
    readyAbilityCount: abilities.filter(ability => ability.status === 'ready').length,
    blockedAbilityCount: abilities.filter(ability => ability.status === 'blocked').length,
    activeAbilityCount: abilities.filter(ability => ability.status === 'active').length,
    passiveAbilityCount: abilities.filter(ability => ability.status === 'passive').length,
    targetHintCount: abilities.filter(ability => ability.targetKind !== 'passive' && ability.targetHint.length > 0).length,
    cooldownVisibleCount: abilities.filter(ability => ability.blocker === 'cooldown').length,
    targetKinds,
    hasResurrection: !!resurrection,
    resurrectionReady: !resurrection || resurrection.status === 'ready' || resurrection.blocker === 'cooldown',
    resurrectionDetail: resurrection ? `${resurrection.status} · ${resurrection.reason} · ${resurrection.targetHint}` : '未学习复活',
    abilities,
  }
}
