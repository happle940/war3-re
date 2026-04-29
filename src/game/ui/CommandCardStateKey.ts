import { BUILDINGS, SHOP_PURCHASE_RANGE, UNITS } from '../GameData'
import type { ResourceSnapshot } from '../TeamResources'
import type { Unit } from '../UnitTypes'

type SupplySnapshot = { used: number; total: number }
type BlizzardChannelState = { caster: Unit; wavesRemaining: number } | null
type MassTeleportPendingState = { caster: Unit; completeTime: number } | null

export type CommandCardStateKeyContext = {
  primary: Unit | null
  units: Unit[]
  playerTeam: number
  gameTime: number
  resources: ResourceSnapshot
  supply: SupplySnapshot
  queuedSupply: number
  blizzardChannel: BlizzardChannelState
  massTeleportPending: MassTeleportPendingState
}

export function buildCommandCardStateKey(ctx: CommandCardStateKeyContext): string {
  const {
    primary,
    units,
    playerTeam,
    gameTime,
    resources,
    supply,
    queuedSupply,
    blizzardChannel,
    massTeleportPending,
  } = ctx

  if (!primary) return ''

  const bpKey = primary.buildProgress < 1 ? Math.floor(primary.buildProgress * 100) : 100
  const primaryQueueKey = primary.trainingQueue
    .map(item => `${item.type}:${Math.ceil(item.remaining * 10)}`)
    .join('|')
  const primaryReviveKey = primary.reviveQueue
    .map(item => `${item.heroType}:${Math.ceil(item.remaining * 10)}`)
    .join('|')
  const prereqKey = units
    .filter(u => u.team === playerTeam && u.isBuilding && u.buildProgress >= 1 && u.hp > 0)
    .map(u => u.type)
    .sort()
    .join(',')
  const researchKey = units
    .filter(u => u.team === playerTeam && u.isBuilding)
    .flatMap(u => [
      ...u.completedResearches,
      ...u.researchQueue.map(r => `${r.key}:${Math.ceil(r.remaining * 10)}`),
    ])
    .sort()
    .join(',')
  const rallyCooldownKey = !primary.isBuilding && primary.team === playerTeam
    ? Math.ceil(primary.rallyCallCooldownUntil * 10)
    : 0
  const cmdManaKey = primary.maxMana > 0 ? Math.floor(primary.mana) : -1
  const cmdHealCdKey = primary.healCooldownUntil > gameTime
    ? Math.ceil(primary.healCooldownUntil * 10)
    : 0
  const upgradeKey = primary.upgradeQueue
    ? `upg:${primary.upgradeQueue.targetType}:${Math.ceil(primary.upgradeQueue.remaining * 10)}`
    : ''
  const heroReviveStateKey = BUILDINGS[primary.type]?.trains
    ? BUILDINGS[primary.type]!.trains!
      .filter(heroKey => UNITS[heroKey]?.isHero)
      .map(heroKey => {
        const hero = units.find(u => u.team === primary.team && u.type === heroKey && !u.isBuilding)
        return `${heroKey}:${hero ? (hero.isDead ? 'dead' : 'live') : 'none'}:${hero?.hp ?? 0}:${hero?.mana ?? 0}:${hero?.heroLevel ?? 1}`
      })
      .join('|')
    : ''
  const morphKey = primary.morphExpiresAt ? `morph:${Math.ceil(primary.morphExpiresAt * 10)}` : ''
  const defendKey = primary.defendActive ? 'defend:1' : 'defend:0'
  const heroCommandKey = UNITS[primary.type]?.isHero
    ? `hero:${primary.heroLevel ?? 1}:${primary.heroSkillPoints ?? 0}:${JSON.stringify(primary.abilityLevels ?? {})}:${(primary.inventoryItems ?? []).join(',')}:${primary.isDead ? 'dead' : 'live'}`
    : ''
  const divineShieldKey = primary.type === 'paladin'
    ? `ds:${Math.ceil(Math.max(0, primary.divineShieldUntil - gameTime) * 10)}:${Math.ceil(Math.max(0, primary.divineShieldCooldownUntil - gameTime) * 10)}`
    : ''
  const resurrectionKey = primary.type === 'paladin'
    ? `res:${Math.ceil(Math.max(0, primary.resurrectionCooldownUntil - gameTime) * 10)}:${primary.resurrectionLastRevivedCount}:${Math.ceil(Math.max(0, primary.resurrectionFeedbackUntil - gameTime) * 10)}`
    : ''
  const waterElementalKey = primary.type === 'archmage'
    ? `we:${Math.ceil(Math.max(0, primary.waterElementalCooldownUntil - gameTime) * 10)}`
    : ''
  const baKey = primary.type === 'archmage'
    ? `ba:${primary.abilityLevels?.brilliance_aura ?? 0}`
    : ''
  const blizzardKey = primary.type === 'archmage'
    ? `blz:${primary.abilityLevels?.blizzard ?? 0}:${Math.ceil(Math.max(0, primary.blizzardCooldownUntil - gameTime) * 10)}:${blizzardChannel?.caster === primary ? blizzardChannel.wavesRemaining : 0}`
    : ''
  const mtKey = primary.type === 'archmage'
    ? `mt:${primary.abilityLevels?.mass_teleport ?? 0}:${Math.ceil(Math.max(0, primary.massTeleportCooldownUntil - gameTime) * 10)}:${massTeleportPending?.caster === primary ? Math.ceil((massTeleportPending.completeTime - gameTime) * 10) : 0}`
    : ''
  const stormBoltKey = primary.type === 'mountain_king'
    ? `sb:${primary.abilityLevels?.storm_bolt ?? 0}:${Math.ceil(Math.max(0, primary.stormBoltCooldownUntil - gameTime) * 10)}`
    : ''
  const avatarKey = primary.type === 'mountain_king'
    ? `av:${primary.abilityLevels?.avatar ?? 0}:${Math.ceil(Math.max(0, primary.avatarUntil - gameTime) * 10)}:${Math.ceil(Math.max(0, primary.avatarCooldownUntil - gameTime) * 10)}`
    : ''
  const shopKey = BUILDINGS[primary.type]?.shopItems
    ? units
      .filter(u => u.team === playerTeam && !u.isBuilding && !u.isDead && u.hp > 0 && !!UNITS[u.type]?.isHero)
      .map((hero) => {
        const distance = Math.ceil(primary.mesh.position.distanceTo(hero.mesh.position) * 10)
        const nearby = distance <= Math.ceil(SHOP_PURCHASE_RANGE * 10) ? 'near' : 'far'
        return `${hero.type}:${nearby}:${distance}:${hero.hp}:${hero.mana}:${(hero.inventoryItems ?? []).join(',')}`
      })
      .sort()
      .join('|')
    : ''

  return [
    primary.type,
    primary.team,
    bpKey,
    resources.gold,
    resources.lumber,
    supply.used,
    supply.total,
    queuedSupply,
    primaryQueueKey,
    primaryReviveKey,
    heroReviveStateKey,
    prereqKey,
    researchKey,
    rallyCooldownKey,
    cmdManaKey,
    cmdHealCdKey,
    upgradeKey,
    morphKey,
    defendKey,
    heroCommandKey,
    divineShieldKey,
    resurrectionKey,
    waterElementalKey,
    baKey,
    blizzardKey,
    mtKey,
    stormBoltKey,
    avatarKey,
    shopKey,
  ].join(':')
}
