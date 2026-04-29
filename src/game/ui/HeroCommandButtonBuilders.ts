import {
  ABILITIES,
  HERO_ABILITY_LEVELS,
  WATER_ELEMENTAL_SUMMON_LEVELS,
} from '../GameData'
import type { HeroAbilityLevelDef } from '../GameData'
import type { Unit } from '../UnitTypes'
import type { CommandCardButtonSpec } from './CommandCardPresenter'
import {
  makeActiveMeter,
  makeChannelMeter,
  makeCooldownMeter,
  makeManaRequirement,
} from './CommandButtonStatus'
import {
  getHeroAbilityLearnState,
  learnHeroAbility,
} from '../systems/HeroAbilityLearning'

type HeroLearnLevel = { requiredHeroLevel: number }

type BaseHeroButtonContext = {
  primary: Unit
  gameTime: number
  markDirty: () => void
  activeAbilityKey?: string
}

export type PaladinButtonContext = BaseHeroButtonContext & {
  units: Unit[]
  castHolyLight: (caster: Unit, target: Unit) => boolean
  castDivineShield: (caster: Unit) => boolean
  castResurrection: (caster: Unit) => boolean
  hasResurrectionTargets: (caster: Unit, levelData: HeroAbilityLevelDef) => boolean
}

export type ArchmageButtonContext = BaseHeroButtonContext & {
  enterWaterElementalTargetMode: (caster: Unit) => void
  enterBlizzardTargetMode: (caster: Unit) => void
  enterMassTeleportTargetMode: (caster: Unit) => void
  isBlizzardChanneling: (caster: Unit) => boolean
  isMassTeleportPending: (caster: Unit) => boolean
  getBlizzardChannelRemaining: (caster: Unit) => number
  getMassTeleportPendingRemaining: (caster: Unit) => number
}

export type MountainKingButtonContext = BaseHeroButtonContext & {
  enterStormBoltTargetMode: (caster: Unit) => void
  castThunderClap: (caster: Unit) => boolean
  castAvatar: (caster: Unit) => boolean
}

function createHeroLearnButton<TLevel extends HeroLearnLevel>(
  hero: Unit,
  abilityKey: string,
  levels: readonly TLevel[],
  maxLevel: number,
  abilityName: string,
  costText: (nextData: TLevel) => string,
  markDirty: () => void,
  hotkey?: string,
): CommandCardButtonSpec | null {
  const learnState = getHeroAbilityLearnState(hero, abilityKey, levels, maxLevel)
  if (!learnState.nextData) return null
  return {
    label: `学习${abilityName} (Lv${learnState.nextLevel})`,
    cost: costText(learnState.nextData),
    iconKey: `ability:${abilityKey}`,
    enabled: learnState.canLearn,
    disabledReason: learnState.reason,
    onClick: () => {
      if (learnHeroAbility(hero, abilityKey, levels, maxLevel)) {
        markDirty()
      }
    },
    hotkey,
  }
}

function pushHeroLearnButton<TLevel extends HeroLearnLevel>(
  buttons: CommandCardButtonSpec[],
  ctx: BaseHeroButtonContext,
  abilityKey: string,
  levels: readonly TLevel[],
  maxLevel: number,
  abilityName: string,
  costText: (nextData: TLevel) => string,
  hotkey?: string,
) {
  const button = createHeroLearnButton(
    ctx.primary,
    abilityKey,
    levels,
    maxLevel,
    abilityName,
    costText,
    ctx.markDirty,
    hotkey,
  )
  if (button) buttons.push(button)
}

export function buildPaladinCommandButtons(ctx: PaladinButtonContext): CommandCardButtonSpec[] {
  const { primary, gameTime, markDirty } = ctx
  const buttons: CommandCardButtonSpec[] = []
  const hl = ABILITIES.holy_light
  const hlDef = HERO_ABILITY_LEVELS.holy_light
  const learnedLevel = primary.abilityLevels?.holy_light ?? 0

  pushHeroLearnButton(
    buttons,
    ctx,
    'holy_light',
    hlDef.levels,
    hlDef.maxLevel,
    '圣光术',
    (nextData) => `治疗${nextData.effectValue} 亡灵${nextData.undeadDamage}`,
    'L',
  )

  if (learnedLevel >= 1) {
    const displayLevel = Math.min(learnedLevel, hlDef.maxLevel)
    const levelData = hlDef.levels[displayLevel - 1]
    if (levelData) {
      const hlOnCooldown = primary.healCooldownUntil > gameTime
      const noMana = primary.mana < levelData.mana
      let hlReason = ''
      if (hlOnCooldown) hlReason = `冷却中 ${(primary.healCooldownUntil - gameTime).toFixed(1)}s`
      else if (noMana) hlReason = '魔力不足'
      buttons.push({
        label: `${hl.name} (Lv${displayLevel})`,
        cost: `💧${levelData.mana} 回复${levelData.effectValue}HP`,
        iconKey: 'ability:holy_light',
        enabled: !hlOnCooldown && !noMana,
        disabledReason: hlReason,
        meter: makeCooldownMeter(primary.healCooldownUntil, gameTime, levelData.cooldown, '圣光术冷却'),
        resource: makeManaRequirement(primary, levelData.mana),
        onClick: () => {
          const injuredFriendlies = ctx.units
            .filter(u => u.team === 0 && u.hp > 0 && !u.isBuilding && u.hp < u.maxHp
              && u !== primary
              && u.mesh.position.distanceTo(primary.mesh.position) <= levelData.range)
            .sort((a, b) => (a.hp / a.maxHp) - (b.hp / b.maxHp))
          if (injuredFriendlies.length > 0) {
            ctx.castHolyLight(primary, injuredFriendlies[0])
          }
          markDirty()
        },
        hotkey: 'E',
      })
    }
  }

  const dsDef = HERO_ABILITY_LEVELS.divine_shield
  if (dsDef) {
    const dsLearned = primary.abilityLevels?.divine_shield ?? 0
    pushHeroLearnButton(
      buttons,
      ctx,
      'divine_shield',
      dsDef.levels,
      dsDef.maxLevel,
      '神圣护盾',
      (nextData) => `无敌${nextData.duration}s 冷却${nextData.cooldown}s`,
      'D',
    )
    if (dsLearned >= 1) {
      const displayLevel = Math.min(dsLearned, dsDef.maxLevel)
      const levelData = dsDef.levels[displayLevel - 1]
      if (levelData) {
        const dsActive = primary.divineShieldUntil > gameTime
        const dsOnCooldown = primary.divineShieldCooldownUntil > gameTime
        const noMana = primary.mana < levelData.mana
        let dsReason = ''
        if (dsActive) dsReason = `生效中 ${(primary.divineShieldUntil - gameTime).toFixed(1)}s`
        else if (dsOnCooldown) dsReason = `冷却中 ${(primary.divineShieldCooldownUntil - gameTime).toFixed(1)}s`
        else if (noMana) dsReason = '魔力不足'
        buttons.push({
          label: `神圣护盾 (Lv${displayLevel})`,
          cost: `💧${levelData.mana} 无敌${levelData.duration ?? 0}s`,
          iconKey: 'ability:divine_shield',
          enabled: !dsActive && !dsOnCooldown && !noMana,
          disabledReason: dsReason,
          meter: makeActiveMeter(primary.divineShieldUntil, gameTime, levelData.duration ?? 0, '护盾生效') ??
            makeCooldownMeter(primary.divineShieldCooldownUntil, gameTime, levelData.cooldown, '护盾冷却'),
          resource: makeManaRequirement(primary, levelData.mana),
          onClick: () => {
            ctx.castDivineShield(primary)
            markDirty()
          },
          hotkey: 'D',
        })
      }
    }
  }

  const daDef = HERO_ABILITY_LEVELS.devotion_aura
  if (daDef) {
    pushHeroLearnButton(
      buttons,
      ctx,
      'devotion_aura',
      daDef.levels,
      daDef.maxLevel,
      '虔诚光环',
      (nextData) => `护甲+${nextData.armorBonus ?? 0} 半径${nextData.auraRadius ?? 0}`,
      'V',
    )
  }

  const resDef = HERO_ABILITY_LEVELS.resurrection
  if (resDef) {
    const resLearned = primary.abilityLevels?.resurrection ?? 0
    pushHeroLearnButton(
      buttons,
      ctx,
      'resurrection',
      resDef.levels,
      resDef.maxLevel,
      '复活',
      (nextData) => `复活最多${nextData.maxTargets ?? 0}个友方单位`,
      'R',
    )
    if (resLearned >= 1) {
      const levelData = resDef.levels[0]
      const isDead = !!primary.isDead
      const notEnoughMana = primary.mana < levelData.mana
      const onCooldown = gameTime < primary.resurrectionCooldownUntil
      const hasTargets = ctx.hasResurrectionTargets(primary, levelData)
      const canCast = !isDead && !notEnoughMana && !onCooldown && hasTargets
      let castReason = ''
      if (isDead) castReason = '已死亡'
      else if (notEnoughMana) castReason = '法力不足'
      else if (onCooldown) castReason = `冷却中 ${(primary.resurrectionCooldownUntil - gameTime).toFixed(1)}s`
      else if (!hasTargets) castReason = '无可复活单位'
      buttons.push({
        label: '复活',
        cost: `法力${levelData.mana} 复活≤${levelData.maxTargets ?? 6}单位`,
        iconKey: 'ability:resurrection',
        enabled: canCast,
        disabledReason: castReason,
        meter: makeCooldownMeter(primary.resurrectionCooldownUntil, gameTime, levelData.cooldown, '复活冷却'),
        resource: makeManaRequirement(primary, levelData.mana),
        onClick: () => {
          ctx.castResurrection(primary)
          markDirty()
        },
        hotkey: 'R',
      })
    }
  }

  return buttons
}

export function buildArchmageCommandButtons(ctx: ArchmageButtonContext): CommandCardButtonSpec[] {
  const { primary, gameTime, markDirty } = ctx
  const buttons: CommandCardButtonSpec[] = []
  const weLevels = WATER_ELEMENTAL_SUMMON_LEVELS
  const weLearned = primary.abilityLevels?.water_elemental ?? 0

  pushHeroLearnButton(
    buttons,
    ctx,
    'water_elemental',
    weLevels,
    weLevels.length,
    '水元素',
    (nextData) => `💧${nextData.mana} HP${nextData.summonedHp} 攻击${nextData.summonedAttackDamage}`,
    'W',
  )

  if (weLearned >= 1) {
    const levelData = weLevels[Math.min(weLearned, weLevels.length) - 1]
    if (levelData) {
      const weOnCooldown = primary.waterElementalCooldownUntil > gameTime
      const noMana = primary.mana < levelData.mana
      const isDead = !!primary.isDead
      let weReason = ''
      if (isDead) weReason = '已死亡'
      else if (weOnCooldown) weReason = `冷却中 ${(primary.waterElementalCooldownUntil - gameTime).toFixed(1)}s`
      else if (noMana) weReason = '魔力不足'
      buttons.push({
        label: `召唤水元素 (Lv${Math.min(weLearned, weLevels.length)})`,
        cost: `💧${levelData.mana} 持续${levelData.duration}s`,
        iconKey: 'ability:water_elemental',
        enabled: !isDead && !weOnCooldown && !noMana,
        disabledReason: weReason,
        meter: makeCooldownMeter(primary.waterElementalCooldownUntil, gameTime, levelData.cooldown, '水元素冷却'),
        resource: makeManaRequirement(primary, levelData.mana),
        targeting: ctx.activeAbilityKey === 'water_elemental',
        onClick: () => {
          ctx.enterWaterElementalTargetMode(primary)
          markDirty()
        },
        hotkey: 'W',
      })
    }
  }

  const baDef = HERO_ABILITY_LEVELS.brilliance_aura
  pushHeroLearnButton(
    buttons,
    ctx,
    'brilliance_aura',
    baDef.levels,
    baDef.maxLevel,
    '辉煌光环',
    (nextData) => `被动 法力回复+${nextData.manaRegenBonus}/s 半径${nextData.auraRadius}`,
    'B',
  )

  const blizzardDef = HERO_ABILITY_LEVELS.blizzard
  const blizzardLearned = primary.abilityLevels?.blizzard ?? 0
  pushHeroLearnButton(
    buttons,
    ctx,
    'blizzard',
    blizzardDef.levels,
    blizzardDef.maxLevel,
    '暴风雪',
    (nextData) => `伤害${nextData.effectValue}/波 ${nextData.waves ?? 0}波 半径${nextData.areaRadius ?? 0}`,
    'Z',
  )

  if (blizzardLearned >= 1) {
    const displayLevel = Math.min(blizzardLearned, blizzardDef.maxLevel)
    const levelData = blizzardDef.levels[displayLevel - 1]
    if (levelData) {
      const isDead = !!primary.isDead
      const channeling = ctx.isBlizzardChanneling(primary)
      const onCooldown = primary.blizzardCooldownUntil > gameTime
      const noMana = primary.mana < levelData.mana
      const channelRemaining = channeling ? ctx.getBlizzardChannelRemaining(primary) : 0
      let castReason = ''
      if (isDead) castReason = '已死亡'
      else if (channeling) castReason = '正在引导'
      else if (onCooldown) castReason = `冷却中 ${(primary.blizzardCooldownUntil - gameTime).toFixed(1)}s`
      else if (noMana) castReason = '魔力不足'
      buttons.push({
        label: `暴风雪 (Lv${displayLevel})`,
        cost: `法力${levelData.mana} 射程${levelData.range} ${levelData.waves ?? 0}波 冷却${levelData.cooldown}s`,
        iconKey: 'ability:blizzard',
        enabled: !isDead && !channeling && !onCooldown && !noMana,
        disabledReason: castReason,
        meter: makeChannelMeter(channelRemaining, levelData.duration ?? 0, '暴风雪引导') ??
          makeCooldownMeter(primary.blizzardCooldownUntil, gameTime, levelData.cooldown, '暴风雪冷却'),
        resource: makeManaRequirement(primary, levelData.mana),
        targeting: ctx.activeAbilityKey === 'blizzard',
        onClick: () => {
          ctx.enterBlizzardTargetMode(primary)
          markDirty()
        },
        hotkey: 'Z',
      })
    }
  }

  const mtDef = HERO_ABILITY_LEVELS.mass_teleport
  const mtLearned = primary.abilityLevels?.mass_teleport ?? 0
  pushHeroLearnButton(
    buttons,
    ctx,
    'mass_teleport',
    mtDef.levels,
    mtDef.maxLevel,
    '群体传送',
    (nextData) => `传送 友方单位 半径${nextData.areaRadius} 上限${nextData.maxTargets}`,
    'T',
  )

  if (mtLearned >= 1) {
    const mtLevelData = mtDef.levels[0]
    if (mtLevelData) {
      const isDead = !!primary.isDead
      const pending = ctx.isMassTeleportPending(primary)
      const onCooldown = primary.massTeleportCooldownUntil > gameTime
      const noMana = primary.mana < mtLevelData.mana
      const pendingRemaining = pending ? ctx.getMassTeleportPendingRemaining(primary) : 0
      let castReason = ''
      if (isDead) castReason = '已死亡'
      else if (pending) castReason = '传送准备中'
      else if (onCooldown) castReason = `冷却中 ${(primary.massTeleportCooldownUntil - gameTime).toFixed(1)}s`
      else if (noMana) castReason = '魔力不足'
      buttons.push({
        label: `群体传送`,
        cost: `法力${mtLevelData.mana} 延迟${mtLevelData.castDelay}s 冷却${mtLevelData.cooldown}s`,
        iconKey: 'ability:mass_teleport',
        enabled: !isDead && !pending && !onCooldown && !noMana,
        disabledReason: castReason,
        meter: makeChannelMeter(pendingRemaining, mtLevelData.castDelay ?? 0, '传送准备') ??
          makeCooldownMeter(primary.massTeleportCooldownUntil, gameTime, mtLevelData.cooldown, '传送冷却'),
        resource: makeManaRequirement(primary, mtLevelData.mana),
        targeting: ctx.activeAbilityKey === 'mass_teleport',
        onClick: () => {
          ctx.enterMassTeleportTargetMode(primary)
          markDirty()
        },
        hotkey: 'T',
      })
    }
  }

  return buttons
}

export function buildMountainKingCommandButtons(ctx: MountainKingButtonContext): CommandCardButtonSpec[] {
  const { primary, gameTime, markDirty } = ctx
  const buttons: CommandCardButtonSpec[] = []
  const sbDef = HERO_ABILITY_LEVELS.storm_bolt
  if (sbDef) {
    const sbLearned = primary.abilityLevels?.storm_bolt ?? 0
    pushHeroLearnButton(
      buttons,
      ctx,
      'storm_bolt',
      sbDef.levels,
      sbDef.maxLevel,
      '风暴之锤',
      (nextData) => `伤害${nextData.effectValue} 眩晕${nextData.stunDuration ?? 0}s`,
      'T',
    )
    if (sbLearned >= 1) {
      const displayLevel = Math.min(sbLearned, sbDef.maxLevel)
      const levelData = sbDef.levels[displayLevel - 1]
      if (levelData) {
        const isDead = !!primary.isDead
        const onCooldown = primary.stormBoltCooldownUntil > gameTime
        const noMana = primary.mana < levelData.mana
        let sbReason = ''
        if (isDead) sbReason = '已死亡'
        else if (onCooldown) sbReason = `冷却中 ${(primary.stormBoltCooldownUntil - gameTime).toFixed(1)}s`
        else if (noMana) sbReason = '魔力不足'
        buttons.push({
          label: `风暴之锤 (Lv${displayLevel})`,
          cost: `💧${levelData.mana} 伤害${levelData.effectValue} 射程${levelData.range} 眩晕${levelData.stunDuration ?? 0}s(英雄${levelData.heroStunDuration ?? 0}s) 冷却${levelData.cooldown}s`,
          iconKey: 'ability:storm_bolt',
          enabled: !isDead && !onCooldown && !noMana,
          disabledReason: sbReason,
          meter: makeCooldownMeter(primary.stormBoltCooldownUntil, gameTime, levelData.cooldown, '风暴之锤冷却'),
          resource: makeManaRequirement(primary, levelData.mana),
          targeting: ctx.activeAbilityKey === 'storm_bolt',
          onClick: () => {
            ctx.enterStormBoltTargetMode(primary)
            markDirty()
          },
          hotkey: 'T',
        })
      }
    }
  }

  const tcDef = HERO_ABILITY_LEVELS.thunder_clap
  if (tcDef) {
    const tcLearned = primary.abilityLevels?.thunder_clap ?? 0
    pushHeroLearnButton(
      buttons,
      ctx,
      'thunder_clap',
      tcDef.levels,
      tcDef.maxLevel,
      '雷霆一击',
      (nextData) => `伤害${nextData.effectValue} 范围${nextData.areaRadius ?? 0}`,
      'C',
    )
    if (tcLearned >= 1) {
      const displayLevel = Math.min(tcLearned, tcDef.maxLevel)
      const levelData = tcDef.levels[displayLevel - 1]
      if (levelData) {
        const isDead = !!primary.isDead
        const onCooldown = primary.thunderClapCooldownUntil > gameTime
        const noMana = primary.mana < levelData.mana
        let reason = ''
        if (isDead) reason = '已死亡'
        else if (onCooldown) reason = `冷却中 ${(primary.thunderClapCooldownUntil - gameTime).toFixed(1)}s`
        else if (noMana) reason = '魔力不足'
        buttons.push({
          label: `雷霆一击 (Lv${displayLevel})`,
          cost: `💧${levelData.mana} 伤害${levelData.effectValue} 范围${levelData.areaRadius ?? 0} 减速${Math.round((1 - (levelData.speedMultiplier ?? 1)) * 100)}% ${levelData.duration ?? 0}s(英雄${levelData.heroDuration ?? 0}s) 冷却${levelData.cooldown}s`,
          iconKey: 'ability:thunder_clap',
          enabled: !isDead && !onCooldown && !noMana,
          disabledReason: reason,
          meter: makeCooldownMeter(primary.thunderClapCooldownUntil, gameTime, levelData.cooldown, '雷霆一击冷却'),
          resource: makeManaRequirement(primary, levelData.mana),
          onClick: () => {
            ctx.castThunderClap(primary)
            markDirty()
          },
          hotkey: 'C',
        })
      }
    }
  }

  const bashDef = HERO_ABILITY_LEVELS.bash
  if (bashDef) {
    pushHeroLearnButton(
      buttons,
      ctx,
      'bash',
      bashDef.levels,
      bashDef.maxLevel,
      '猛击',
      (nextData) => `被动 ${Math.round((nextData.triggerChance ?? 0) * 100)}% +${nextData.bonusDamage ?? 0}伤害`,
      'B',
    )
  }

  const avatarDef = HERO_ABILITY_LEVELS.avatar
  if (avatarDef) {
    const avatarLearned = primary.abilityLevels?.avatar ?? 0
    pushHeroLearnButton(
      buttons,
      ctx,
      'avatar',
      avatarDef.levels,
      avatarDef.maxLevel,
      '化身',
      (nextData) => `终极 +${nextData.armorBonus ?? 0}甲 +${nextData.hpBonus ?? 0}HP +${nextData.damageBonus ?? 0}攻`,
      'V',
    )
    if (avatarLearned >= 1) {
      const levelData = avatarDef.levels[0]
      if (levelData) {
        const isDead = !!primary.isDead
        const active = primary.avatarUntil > gameTime
        const onCooldown = primary.avatarCooldownUntil > gameTime
        const noMana = primary.mana < levelData.mana
        let reason = ''
        if (isDead) reason = '已死亡'
        else if (active) reason = `生效中 ${(primary.avatarUntil - gameTime).toFixed(1)}s`
        else if (onCooldown) reason = `冷却中 ${(primary.avatarCooldownUntil - gameTime).toFixed(1)}s`
        else if (noMana) reason = '魔力不足'
        buttons.push({
          label: '化身',
          cost: `💧${levelData.mana} +${levelData.hpBonus ?? 0}HP +${levelData.armorBonus ?? 0}甲 +${levelData.damageBonus ?? 0}攻 ${levelData.duration ?? 0}s`,
          iconKey: 'ability:avatar',
          enabled: !isDead && !active && !onCooldown && !noMana,
          disabledReason: reason,
          meter: makeActiveMeter(primary.avatarUntil, gameTime, levelData.duration ?? 0, '化身生效') ??
            makeCooldownMeter(primary.avatarCooldownUntil, gameTime, levelData.cooldown, '化身冷却'),
          resource: makeManaRequirement(primary, levelData.mana),
          onClick: () => {
            ctx.castAvatar(primary)
            markDirty()
          },
          hotkey: 'V',
        })
      }
    }
  }

  return buttons
}
