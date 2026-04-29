import type {
  CommandCardMeterSpec,
  CommandCardResourceSpec,
} from './CommandCardPresenter'
import type { Unit } from '../UnitTypes'

export function makeCooldownMeter(
  cooldownUntil: number,
  gameTime: number,
  total: number,
  label = '冷却',
): CommandCardMeterSpec | undefined {
  return makeTimedMeter('cooldown', cooldownUntil, gameTime, total, label)
}

export function makeActiveMeter(
  activeUntil: number,
  gameTime: number,
  total: number,
  label = '生效',
): CommandCardMeterSpec | undefined {
  return makeTimedMeter('active', activeUntil, gameTime, total, label)
}

export function makeChannelMeter(
  remaining: number,
  total: number,
  label = '引导',
): CommandCardMeterSpec | undefined {
  if (remaining <= 0 || total <= 0) return undefined
  return {
    kind: 'channel',
    remaining,
    total,
    label,
  }
}

export function makeManaRequirement(
  unit: Unit,
  required: number,
): CommandCardResourceSpec | undefined {
  if (required <= 0) return undefined
  return {
    kind: 'mana',
    current: Math.max(0, Math.floor(unit.mana)),
    required,
    label: '法力',
  }
}

function makeTimedMeter(
  kind: CommandCardMeterSpec['kind'],
  until: number,
  gameTime: number,
  total: number,
  label: string,
): CommandCardMeterSpec | undefined {
  const remaining = Math.max(0, until - gameTime)
  if (remaining <= 0 || total <= 0) return undefined
  return {
    kind,
    remaining,
    total,
    label,
  }
}
