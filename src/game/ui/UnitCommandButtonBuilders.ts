import { ABILITIES, BUILDINGS, PEASANT_BUILD_MENU } from '../GameData'
import type { GameCommand } from '../GameCommand'
import type { Unit } from '../UnitTypes'
import type { CommandCardButtonSpec } from './CommandCardPresenter'
import {
  makeCooldownMeter,
  makeManaRequirement,
} from './CommandButtonStatus'
import {
  getBuildingCommandMetadata,
  getCallToArmsCommandMetadata,
} from './HumanCommandRouteMetadata'

type Availability = { ok: boolean; reason: string }

type BaseUnitCommandContext = {
  primary: Unit
  selectedUnits: readonly Unit[]
  units: Unit[]
  playerTeam: number
  markDirty: () => void
}

export type WorkerCommandButtonContext = BaseUnitCommandContext & {
  getBuildAvailability: (buildingType: string, team: number) => Availability
  enterPlacementMode: (buildingType: string) => void
  isMainHall: (unitType: string) => boolean
  morphToMilitia: (unit: Unit) => boolean
}

export type ConstructionCommandButtonContext = {
  primary: Unit
  cancelRefundRate: number
  cancelConstruction: (building: Unit) => boolean
}

export type BasicUnitCommandButtonContext = BaseUnitCommandContext & {
  gameTime: number
  issueCommand: (units: Unit[], command: GameCommand) => void
  suppressAggroFor: (units: Unit[]) => void
  enterAttackMoveMode: () => void
  triggerRallyCall: (source: Unit) => boolean
  setDefend: (unit: Unit, active: boolean) => boolean
  castHeal: (caster: Unit, target: Unit) => boolean
  backToWork: (unit: Unit) => boolean
  castSlow: (caster: Unit, target: Unit) => boolean
}

export function buildWorkerCommandButtons(ctx: WorkerCommandButtonContext): CommandCardButtonSpec[] {
  const { primary, playerTeam } = ctx
  const buttons: CommandCardButtonSpec[] = []
  if (primary.type !== 'worker') return buttons

  for (const buildingKey of PEASANT_BUILD_MENU) {
    const def = BUILDINGS[buildingKey]
    if (!def) continue
    const availability = ctx.getBuildAvailability(buildingKey, playerTeam)
    const metadata = getBuildingCommandMetadata(buildingKey)
    buttons.push({
      label: def.name,
      cost: `${def.cost.gold}g ${def.cost.lumber}w · ${def.buildTime}s`,
      iconKey: `building:${buildingKey}`,
      enabled: availability.ok,
      disabledReason: availability.reason,
      route: metadata?.route,
      hotkey: metadata?.hotkey,
      onClick: () => {
        if (ctx.getBuildAvailability(buildingKey, playerTeam).ok) {
          ctx.enterPlacementMode(buildingKey)
        }
      },
    })
  }

  const cta = ABILITIES.call_to_arms
  const nearHall = ctx.units.some(u =>
    ctx.isMainHall(u.type) &&
    u.team === playerTeam &&
    u.buildProgress >= 1 &&
    u.hp > 0 &&
    u.mesh.position.distanceTo(primary.mesh.position) <= cta.range
  )
  const callToArmsMetadata = getCallToArmsCommandMetadata()
  buttons.push({
    label: cta.name,
    cost: `${cta.duration}s`,
    iconKey: 'ability:call_to_arms',
    enabled: nearHall,
    disabledReason: nearHall ? '' : '需要靠近城镇大厅',
    onClick: () => {
      const selectedWorkers = ctx.selectedUnits.filter(
        (u) => u.type === 'worker' && u.team === playerTeam && !u.isBuilding,
      )
      for (const unit of selectedWorkers) {
        ctx.morphToMilitia(unit)
      }
      ctx.markDirty()
    },
    route: callToArmsMetadata.route,
    hotkey: callToArmsMetadata.hotkey,
  })

  return buttons
}

export function buildConstructionCommandButtons(ctx: ConstructionCommandButtonContext): CommandCardButtonSpec[] {
  const { primary } = ctx
  const buttons: CommandCardButtonSpec[] = []
  if (!primary.isBuilding || primary.buildProgress >= 1) return buttons

  const def = BUILDINGS[primary.type]
  const refundGold = Math.floor((def?.cost.gold ?? 0) * ctx.cancelRefundRate)
  const refundLumber = Math.floor((def?.cost.lumber ?? 0) * ctx.cancelRefundRate)
  buttons.push({
    label: '取消',
    cost: `返还 ${refundGold}g ${refundLumber}w`,
    iconKey: 'command:cancel',
    onClick: () => { ctx.cancelConstruction(primary) },
    hotkey: 'C',
  })

  return buttons
}

export function buildBasicUnitCommandButtons(ctx: BasicUnitCommandButtonContext): CommandCardButtonSpec[] {
  const { primary, playerTeam } = ctx
  const buttons: CommandCardButtonSpec[] = []
  if (primary.isBuilding || primary.type === 'worker') return buttons

  buttons.push({
    label: '停止',
    cost: '—',
    iconKey: 'command:stop',
    onClick: () => {
      const selectedUnits = ctx.selectedUnits.filter((u) => u.team === playerTeam && !u.isBuilding)
      ctx.issueCommand(selectedUnits, { type: 'stop' })
      ctx.suppressAggroFor(selectedUnits)
    },
    hotkey: 'S',
  })
  buttons.push({
    label: '驻守',
    cost: '—',
    iconKey: 'command:hold',
    onClick: () => {
      ctx.issueCommand(
        ctx.selectedUnits.filter((u) => u.team === playerTeam && !u.isBuilding),
        { type: 'holdPosition' },
      )
    },
    hotkey: 'H',
  })
  buttons.push({
    label: '攻击移动',
    cost: '—',
    iconKey: 'command:attack_move',
    onClick: () => { ctx.enterAttackMoveMode() },
    hotkey: 'A',
  })

  buttons.push(...buildRallyCallButtons(ctx))
  buttons.push(...buildDefendButtons(ctx))
  buttons.push(...buildPriestHealButtons(ctx))
  buttons.push(...buildBackToWorkButtons(ctx))
  buttons.push(...buildSorceressSlowButtons(ctx))

  return buttons
}

function buildRallyCallButtons(ctx: BasicUnitCommandButtonContext): CommandCardButtonSpec[] {
  const { primary } = ctx
  const rallyOnCooldown = primary.rallyCallCooldownUntil > ctx.gameTime
  const rallyReason = rallyOnCooldown
    ? `冷却中 ${(primary.rallyCallCooldownUntil - ctx.gameTime).toFixed(0)}s`
    : ''
  return [{
    label: '集结号令',
    cost: `伤害+${ABILITIES.rally_call.effectValue} ${ABILITIES.rally_call.duration}s`,
    iconKey: 'ability:rally_call',
    enabled: !rallyOnCooldown,
    disabledReason: rallyReason,
    meter: makeCooldownMeter(primary.rallyCallCooldownUntil, ctx.gameTime, ABILITIES.rally_call.cooldown, '集结冷却'),
    onClick: () => {
      const selectedUnits = ctx.selectedUnits.filter((u) => u.team === ctx.playerTeam && !u.isBuilding)
      for (const unit of selectedUnits) {
        ctx.triggerRallyCall(unit)
      }
      ctx.markDirty()
    },
    hotkey: 'R',
  }]
}

function buildDefendButtons(ctx: BasicUnitCommandButtonContext): CommandCardButtonSpec[] {
  const { primary } = ctx
  const defend = ABILITIES.defend
  const isDefendOwner = (unit: Unit) => Array.isArray(defend.ownerType)
    ? defend.ownerType.includes(unit.type)
    : unit.type === defend.ownerType
  if (!isDefendOwner(primary)) return []

  const nextActive = !primary.defendActive
  return [{
    label: primary.defendActive ? `${defend.name} ✓` : defend.name,
    cost: `穿刺伤害×${defend.damageReduction ?? 1} 移速×${defend.speedMultiplier ?? 1}`,
    iconKey: 'ability:defend',
    onClick: () => {
      const selectedDefendUnits = ctx.selectedUnits.filter((u) => isDefendOwner(u))
      for (const unit of selectedDefendUnits) {
        ctx.setDefend(unit, nextActive)
      }
      ctx.markDirty()
    },
    hotkey: 'D',
  }]
}

function buildPriestHealButtons(ctx: BasicUnitCommandButtonContext): CommandCardButtonSpec[] {
  const { primary } = ctx
  if (primary.type !== 'priest') return []

  const healOnCooldown = primary.healCooldownUntil > ctx.gameTime
  const noMana = primary.mana < (ABILITIES.priest_heal.cost.mana ?? 0)
  const healReason = healOnCooldown
    ? `治疗冷却中 ${(primary.healCooldownUntil - ctx.gameTime).toFixed(1)}s`
    : noMana
      ? '魔力不足'
      : ''

  return [{
    label: '治疗',
    cost: `💧${ABILITIES.priest_heal.cost.mana ?? 0} 回复${ABILITIES.priest_heal.effectValue}HP`,
    iconKey: 'ability:priest_heal',
    enabled: !healOnCooldown && !noMana,
    disabledReason: healReason,
    meter: makeCooldownMeter(primary.healCooldownUntil, ctx.gameTime, ABILITIES.priest_heal.cooldown, '治疗冷却'),
    resource: makeManaRequirement(primary, ABILITIES.priest_heal.cost.mana ?? 0),
    onClick: () => {
      const injuredFriendlies = ctx.units
        .filter(u => u.team === ctx.playerTeam && u.hp > 0 && !u.isBuilding && u.hp < u.maxHp
          && u.mesh.position.distanceTo(primary.mesh.position) <= ABILITIES.priest_heal.range)
        .sort((a, b) => (a.hp / a.maxHp) - (b.hp / b.maxHp))
      if (injuredFriendlies.length > 0) {
        ctx.castHeal(primary, injuredFriendlies[0])
      }
      ctx.markDirty()
    },
    hotkey: 'E',
  }]
}

function buildBackToWorkButtons(ctx: BasicUnitCommandButtonContext): CommandCardButtonSpec[] {
  const { primary } = ctx
  const btw = ABILITIES.back_to_work
  const isBackToWorkOwner = (unit: Unit) => Array.isArray(btw.ownerType)
    ? btw.ownerType.includes(unit.type)
    : unit.type === btw.ownerType
  if (!isBackToWorkOwner(primary) || primary.morphExpiresAt <= 0) return []

  return [{
    label: btw.name,
    cost: '',
    iconKey: 'ability:back_to_work',
    onClick: () => {
      const selectedUnits = ctx.selectedUnits.filter((u) => isBackToWorkOwner(u) && u.morphExpiresAt > 0)
      for (const unit of selectedUnits) {
        ctx.backToWork(unit)
      }
      ctx.markDirty()
    },
    hotkey: 'B',
  }]
}

function buildSorceressSlowButtons(ctx: BasicUnitCommandButtonContext): CommandCardButtonSpec[] {
  const { primary } = ctx
  if (primary.type !== 'sorceress') return []

  const slow = ABILITIES.slow
  const noMana = primary.mana < (slow.cost.mana ?? 0)
  const nextAutoCast = !primary.slowAutoCastEnabled
  return [
    {
      label: slow.name,
      cost: `💧${slow.cost.mana ?? 0} 移速×${slow.speedMultiplier ?? 1} ${slow.duration}s`,
      iconKey: 'ability:slow',
      enabled: !noMana,
      disabledReason: noMana ? '魔力不足' : '',
      resource: makeManaRequirement(primary, slow.cost.mana ?? 0),
      onClick: () => {
        const enemies = ctx.units
          .filter(u => u.team !== primary.team && u.hp > 0 && !u.isBuilding
            && u.mesh.position.distanceTo(primary.mesh.position) <= slow.range)
          .sort((a, b) =>
            a.mesh.position.distanceTo(primary.mesh.position)
            - b.mesh.position.distanceTo(primary.mesh.position))
        if (enemies.length > 0) {
          ctx.castSlow(primary, enemies[0])
        }
        ctx.markDirty()
      },
      hotkey: 'W',
    },
    {
      label: primary.slowAutoCastEnabled ? `${slow.name} (自动) ✓` : `${slow.name} (自动)`,
      cost: nextAutoCast ? '开启自动施法' : '关闭自动施法',
      iconKey: 'ability:slow_autocast',
      enabled: true,
      onClick: () => {
        const selectedSorceresses = ctx.selectedUnits.filter((u) => u.type === 'sorceress')
        for (const unit of selectedSorceresses) {
          unit.slowAutoCastEnabled = nextAutoCast
        }
        ctx.markDirty()
      },
      hotkey: 'Q',
    },
  ]
}
