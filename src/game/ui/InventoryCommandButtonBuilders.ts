import { ITEMS } from '../GameData'
import type { Unit } from '../UnitTypes'
import type { CommandCardButtonSpec } from './CommandCardPresenter'

export type InventoryButtonContext = {
  primary: Unit
  useInventoryItem: (hero: Unit, index: number) => boolean
  markDirty: () => void
}

export function buildHeroInventoryCommandButtons(ctx: InventoryButtonContext): CommandCardButtonSpec[] {
  const inventory = ctx.primary.inventoryItems ?? []
  return inventory.map((itemType, index) => {
    const item = ITEMS[itemType as keyof typeof ITEMS] ?? {
      name: itemType,
      description: '物品',
      kind: 'passive',
    }
    const isPassive = item.kind === 'passive'
    const isDead = ctx.primary.isDead || ctx.primary.hp <= 0
    let disabledReason = ''
    if (isDead) disabledReason = '英雄已死亡'
    else if (isPassive) disabledReason = '被动已生效'
    return {
      label: item.name,
      cost: item.description,
      iconKey: `item:${itemType}`,
      hotkey: String(index + 1),
      enabled: !disabledReason,
      disabledReason,
      onClick: () => {
        if (ctx.useInventoryItem(ctx.primary, index)) {
          ctx.markDirty()
        }
      },
    }
  })
}
