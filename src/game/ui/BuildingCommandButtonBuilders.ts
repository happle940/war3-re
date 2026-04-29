import { BUILDINGS, ITEMS, RESEARCHES, UNITS } from '../GameData'
import type { ItemKey, ResearchDef } from '../GameData'
import type { Unit } from '../UnitTypes'
import type { CommandCardButtonSpec } from './CommandCardPresenter'
import {
  getBuildingUpgradeCommandMetadata,
  getResearchCommandMetadata,
  getShopItemCommandMetadata,
  getTrainingCommandMetadata,
} from './HumanCommandRouteMetadata'

type ResourceCost = { gold: number; lumber: number }
type Availability = { ok: boolean; reason: string }
type SupplySnapshot = { used: number; total: number }
type HeroReviveQuote = { gold: number; lumber: number; totalDuration: number }

export type BuildingCommandButtonContext = {
  primary: Unit
  selectedUnits: readonly Unit[]
  units: Unit[]
  playerTeam: number
  getTrainAvailability: (unitType: string, team: number) => Availability
  getCostBlockReason: (team: number, cost: ResourceCost) => string
  getQueuedSupply: (team: number) => number
  getSupply: (team: number) => SupplySnapshot
  hasCompletedResearch: (researchKey: string, team: number) => boolean
  getResearchAvailability: (researchKey: string, team: number) => Availability
  getHeroReviveQuote: (deadHero: Unit) => HeroReviveQuote | null
  trainUnit: (building: Unit, unitType: string) => void
  enterRallyMode: (building: Unit) => void
  startReviveHero: (altar: Unit, heroKey: string) => void
  startBuildingUpgrade: (building: Unit, targetKey: string) => void
  startResearch: (building: Unit, researchKey: string) => void
  getShopItemAvailability: (shop: Unit, itemKey: ItemKey) => Availability
  purchaseShopItem: (shop: Unit, itemKey: ItemKey) => void
}

export function buildBuildingCommandButtons(ctx: BuildingCommandButtonContext): CommandCardButtonSpec[] {
  const { primary, playerTeam } = ctx
  const buttons: CommandCardButtonSpec[] = []
  const buildingDef = BUILDINGS[primary.type]

  if (buildingDef?.trains && primary.buildProgress >= 1) {
    buttons.push(...buildUnitTrainingButtons(ctx, buildingDef.trains))
  }

  if (buildingDef?.trains && primary.buildProgress >= 1) {
    buttons.push(...buildHeroSummonButtons(ctx, buildingDef.trains))
  }

  if (buildingDef?.trains && primary.buildProgress >= 1) {
    buttons.push(...buildHeroReviveButtons(ctx, buildingDef.trains))
  }

  const upgradeTarget = buildingDef?.upgradeTo
  if (upgradeTarget && primary.isBuilding && primary.buildProgress >= 1 && !primary.upgradeQueue) {
    const upgradeDef = BUILDINGS[upgradeTarget]
    if (upgradeDef) {
      const upgradeCost = upgradeDef.cost
      const costReason = ctx.getCostBlockReason(playerTeam, upgradeCost)
      const metadata = getBuildingUpgradeCommandMetadata(upgradeTarget)
      buttons.push({
        label: '升级主城',
        cost: `${upgradeCost.gold}g ${upgradeCost.lumber}w · ${upgradeDef.buildTime}s`,
        iconKey: `building:${upgradeTarget}`,
        enabled: !costReason,
        disabledReason: costReason,
        route: metadata?.route,
        hotkey: metadata?.hotkey,
        onClick: () => {
          ctx.startBuildingUpgrade(primary, upgradeTarget)
        },
      })
    }
  }

  if (primary.isBuilding && primary.buildProgress >= 1 && primary.upgradeQueue) {
    const targetDef = BUILDINGS[primary.upgradeQueue.targetType]
    const remaining = Math.ceil(primary.upgradeQueue.remaining)
    const metadata = getBuildingUpgradeCommandMetadata(primary.upgradeQueue.targetType)
    buttons.push({
      label: `升级${targetDef?.name ?? '中'}…`,
      cost: `${remaining}秒`,
      iconKey: `building:${primary.upgradeQueue.targetType}`,
      enabled: false,
      disabledReason: `正在升级${targetDef?.name ?? ''}`,
      route: metadata?.route,
      hotkey: metadata?.hotkey,
      onClick: () => {},
    })
  }

  if (buildingDef?.researches && primary.buildProgress >= 1) {
    buttons.push(...buildResearchButtons(ctx, buildingDef.researches))
  }

  if (buildingDef?.shopItems && primary.buildProgress >= 1) {
    buttons.push(...buildShopButtons(ctx, buildingDef.shopItems))
  }

  return buttons
}

function buildUnitTrainingButtons(
  ctx: BuildingCommandButtonContext,
  trainKeys: readonly string[],
): CommandCardButtonSpec[] {
  const { primary, playerTeam } = ctx
  const buttons: CommandCardButtonSpec[] = []
  const sameTypeBuildings = ctx.selectedUnits.filter(
    u => u.team === playerTeam && u.isBuilding && u.type === primary.type && u.buildProgress >= 1,
  )

  for (const unitKey of trainKeys) {
    const unitDef = UNITS[unitKey]
    if (!unitDef) continue
    if (unitDef.isHero) continue
    const availability = ctx.getTrainAvailability(unitKey, playerTeam)
    const metadata = getTrainingCommandMetadata(unitKey)
    buttons.push({
      label: unitDef.name,
      cost: `${unitDef.cost.gold}g${unitDef.cost.lumber > 0 ? ` ${unitDef.cost.lumber}w` : ''} (${unitDef.supply}口) · ${unitDef.trainTime}s`,
      iconKey: `unit:${unitKey}`,
      enabled: availability.ok,
      disabledReason: availability.reason,
      route: metadata?.route,
      hotkey: metadata?.hotkey,
      onClick: () => {
        for (const building of sameTypeBuildings) {
          ctx.trainUnit(building, unitKey)
        }
      },
    })
  }

  buttons.push({
    label: '集结点',
    cost: '—',
    iconKey: 'command:rally_point',
    onClick: () => { ctx.enterRallyMode(primary) },
    hotkey: 'Y',
  })

  return buttons
}

function buildHeroSummonButtons(
  ctx: BuildingCommandButtonContext,
  trainKeys: readonly string[],
): CommandCardButtonSpec[] {
  const { primary, playerTeam } = ctx
  const buttons: CommandCardButtonSpec[] = []

  for (const heroKey of trainKeys) {
    const heroDef = UNITS[heroKey]
    if (!heroDef || !heroDef.isHero) continue
    const hasExistingHero = ctx.units.some(
      u => u.team === playerTeam && u.type === heroKey && !u.isBuilding,
    )
    const hasQueuedHero = ctx.units.some(
      u => u.team === playerTeam && u.isBuilding && u.trainingQueue.some(item => item.type === heroKey),
    )
    const resourceReason = ctx.getCostBlockReason(playerTeam, heroDef.cost)
    const supply = ctx.getSupply(playerTeam)
    const queuedSupply = ctx.getQueuedSupply(playerTeam)
    const supplyBlocked = supply.used + queuedSupply + heroDef.supply > supply.total
    let disabledReason = ''
    if (hasExistingHero) {
      const isDeadHero = ctx.units.find(
        u => u.team === playerTeam && u.type === heroKey && !u.isBuilding,
      )?.isDead
      disabledReason = isDeadHero ? `${heroDef.name}已阵亡（需复活）` : `${heroDef.name}已存活`
    }
    else if (hasQueuedHero) disabledReason = '正在召唤'
    else if (resourceReason) disabledReason = resourceReason
    else if (supplyBlocked) disabledReason = '人口不足'

    const metadata = getTrainingCommandMetadata(heroKey)
    buttons.push({
      label: heroDef.name,
      cost: `${heroDef.cost.gold}g${heroDef.cost.lumber > 0 ? ` ${heroDef.cost.lumber}w` : ''} · ${heroDef.trainTime}s`,
      iconKey: `unit:${heroKey}`,
      enabled: !disabledReason,
      disabledReason,
      route: metadata?.route,
      hotkey: metadata?.hotkey,
      onClick: () => {
        ctx.trainUnit(primary, heroKey)
      },
    })
  }

  return buttons
}

function buildHeroReviveButtons(
  ctx: BuildingCommandButtonContext,
  trainKeys: readonly string[],
): CommandCardButtonSpec[] {
  const { primary, playerTeam } = ctx
  const buttons: CommandCardButtonSpec[] = []

  for (const heroKey of trainKeys) {
    const heroDef = UNITS[heroKey]
    if (!heroDef || !heroDef.isHero) continue
    const deadHero = ctx.units.find(
      u => u.team === playerTeam && u.type === heroKey && !u.isBuilding && u.isDead,
    )
    if (!deadHero) continue

    const reviveQuote = ctx.getHeroReviveQuote(deadHero)
    if (!reviveQuote) continue

    const isAlreadyQueued = ctx.units.some(
      u => u.team === primary.team && u.isBuilding && u.reviveQueue.some(rv => rv.heroType === heroKey),
    )

    let reviveDisabledReason = ''
    if (isAlreadyQueued) reviveDisabledReason = '正在复活'
    else {
      reviveDisabledReason = ctx.getCostBlockReason(playerTeam, {
        gold: reviveQuote.gold,
        lumber: reviveQuote.lumber,
      })
    }

    const metadata = getTrainingCommandMetadata(heroKey)
    buttons.push({
      label: `复活${heroDef.name}`,
      cost: `${reviveQuote.gold}g · ${reviveQuote.totalDuration}s`,
      iconKey: `unit:${heroKey}`,
      enabled: !reviveDisabledReason,
      disabledReason: reviveDisabledReason,
      route: metadata?.route,
      hotkey: metadata?.hotkey,
      onClick: () => {
        ctx.startReviveHero(primary, heroKey)
      },
    })
  }

  return buttons
}

function buildResearchButtons(
  ctx: BuildingCommandButtonContext,
  researchKeys: readonly string[],
): CommandCardButtonSpec[] {
  const { primary, playerTeam } = ctx
  const buttons: CommandCardButtonSpec[] = []

  for (const researchKey of researchKeys) {
    const researchDef = RESEARCHES[researchKey]
    if (!researchDef) continue
    const availability = ctx.getResearchAvailability(researchKey, playerTeam)
    const metadata = getResearchCommandMetadata(researchKey)

    if (ctx.hasCompletedResearch(researchKey, playerTeam)) {
      buttons.push({
        label: `${researchDef.name} ✓`,
        cost: describeCompletedResearchEffects(researchDef) || '已完成',
        iconKey: `research:${researchKey}`,
        enabled: false,
        disabledReason: '已研究',
        route: metadata?.route,
        hotkey: metadata?.hotkey,
        onClick: () => {},
      })
    } else {
      buttons.push({
        label: researchDef.name,
        cost: `${researchDef.cost.gold}g ${researchDef.cost.lumber}w · ${describeResearchEffects(researchDef)}`,
        iconKey: `research:${researchKey}`,
        enabled: availability.ok,
        disabledReason: availability.reason,
        route: metadata?.route,
        hotkey: metadata?.hotkey,
        onClick: () => {
          ctx.startResearch(primary, researchKey)
        },
      })
    }
  }

  return buttons
}

function describeCompletedResearchEffects(researchDef: ResearchDef) {
  return researchDef.effects
    ?.map(e => `${e.stat === 'attackRange' ? '射程' : e.stat} +${e.value}`)
    .join(', ') ?? ''
}

function describeResearchEffects(researchDef: ResearchDef) {
  return researchDef.effects
    ?.map((effect) => {
      const unitName = UNITS[effect.targetUnitType]?.name ?? effect.targetUnitType
      const statName = effect.stat === 'attackRange' ? '射程' : effect.stat
      return `${unitName} ${statName}+${effect.value}`
    })
    .join(', ') ?? researchDef.description
}

function buildShopButtons(
  ctx: BuildingCommandButtonContext,
  itemKeys: readonly ItemKey[],
): CommandCardButtonSpec[] {
  const buttons: CommandCardButtonSpec[] = []

  for (const itemKey of itemKeys) {
    const item = ITEMS[itemKey]
    if (!item) continue
    const availability = ctx.getShopItemAvailability(ctx.primary, itemKey)
    const metadata = getShopItemCommandMetadata(itemKey)
    buttons.push({
      label: item.name,
      cost: `${item.cost.gold}g${item.cost.lumber > 0 ? ` ${item.cost.lumber}w` : ''} · ${item.description}`,
      iconKey: `item:${itemKey}`,
      enabled: availability.ok,
      disabledReason: availability.reason,
      route: metadata?.route,
      hotkey: metadata?.hotkey,
      onClick: () => {
        ctx.purchaseShopItem(ctx.primary, itemKey)
      },
    })
  }

  return buttons
}
