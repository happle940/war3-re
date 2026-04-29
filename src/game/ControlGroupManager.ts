import type { Unit } from './UnitTypes'

/**
 * War3 风格控制组管理
 *
 * 功能：
 * - Ctrl+1..9 保存当前选择到编组
 * - 1..9 召回编组
 * - 召回时自动清理死亡/失效单位
 * - 最多 9 个编组
 */
export class ControlGroupManager {
  private groups: (Unit[] | null)[] = new Array(9).fill(null)

  /**
   * 保存单位列表到指定编组
   * @param slot 1-9
   * @param units 要保存的单位
   */
  save(slot: number, units: readonly Unit[]): void {
    if (slot < 1 || slot > 9) return
    // 存储引用的浅拷贝
    this.groups[slot - 1] = [...units]
  }

  /**
   * 召回编组
   * @param slot 1-9
   * @param validUnits 当前所有存活单位（用于清理死亡单位）
   * @returns 有效单位列表，如果编组不存在或全部失效则返回空数组
   */
  recall(slot: number, validUnits: Unit[]): Unit[] {
    if (slot < 1 || slot > 9) return []
    const group = this.groups[slot - 1]
    if (!group) return []

    // 清理失效单位
    const validSet = new Set(validUnits)
    const alive: Unit[] = []
    for (const u of group) {
      if (validSet.has(u) && u.hp > 0) {
        alive.push(u)
      }
    }

    // 更新存储（去掉死亡的）
    this.groups[slot - 1] = alive.length > 0 ? alive : null

    return alive
  }

  /**
   * 检查编组是否有存活单位
   */
  hasAliveUnits(slot: number, validUnits: Unit[]): boolean {
    if (slot < 1 || slot > 9) return false
    const group = this.groups[slot - 1]
    if (!group) return false

    const validSet = new Set(validUnits)
    return group.some(u => validSet.has(u) && u.hp > 0)
  }

  /**
   * 获取编组信息（用于 HUD 显示）
   * 返回编组中的单位数量，如果编组不存在返回 0
   */
  getCount(slot: number): number {
    if (slot < 1 || slot > 9) return 0
    return this.groups[slot - 1]?.length ?? 0
  }

  /**
   * 获取编组的类型摘要（用于 HUD 缩略显示）
   */
  getTypeSummary(slot: number): string {
    if (slot < 1 || slot > 9) return ''
    const group = this.groups[slot - 1]
    if (!group || group.length === 0) return ''

    const counts: Record<string, number> = {}
    for (const u of group) {
      counts[u.type] = (counts[u.type] ?? 0) + 1
    }
    return Object.entries(counts)
      .map(([type, count]) => `${type[0]}${count}`)
      .join('+')
  }
}
