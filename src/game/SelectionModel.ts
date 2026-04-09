import type { Unit } from './Game'

/**
 * War3 风格选择模型
 *
 * 负责：
 * - 维护当前选中单位列表（有序，first = primary）
 * - primary selection 语义：多选时第一个单位为 primary
 * - primary type 语义：primary 单位的类型决定命令卡
 * - Shift+click add/remove
 * - 双击同类选择（当前屏幕可见范围）
 *
 * 不负责：
 * - 选择圈渲染（Game.ts 负责）
 * - HUD 更新（Game.ts 负责）
 */
export class SelectionModel {
  private selected: Unit[] = []

  /** 当前选中单位列表（readonly，不要直接修改） */
  get units(): readonly Unit[] {
    return this.selected
  }

  /** 选中单位数量 */
  get count(): number {
    return this.selected.length
  }

  /** 是否有选中 */
  get hasSelection(): boolean {
    return this.selected.length > 0
  }

  /** Primary unit（多选时第一个，单选时唯一一个） */
  get primary(): Unit | null {
    return this.selected.length > 0 ? this.selected[0] : null
  }

  /** Primary type（决定命令卡显示什么） */
  get primaryType(): string | null {
    const p = this.primary
    return p ? p.type : null
  }

  /** 是否包含指定单位 */
  contains(unit: Unit): boolean {
    return this.selected.includes(unit)
  }

  /** 清除所有选择 */
  clear(): Unit[] {
    const prev = this.selected
    this.selected = []
    return prev
  }

  /** 设置选择（替换当前选择） */
  setSelection(units: Unit[]): void {
    this.selected = [...units]
  }

  /** 添加单位到选择（如果已在选择中则忽略） */
  add(unit: Unit): void {
    if (!this.selected.includes(unit)) {
      this.selected.push(unit)
    }
  }

  /** 从选择中移除单位 */
  remove(unit: Unit): void {
    const idx = this.selected.indexOf(unit)
    if (idx >= 0) {
      this.selected.splice(idx, 1)
    }
  }

  /**
   * Shift+click toggle 语义
   * - 如果单位已在选择中 → 移除
   * - 如果单位不在选择中 → 添加（仅友方可控单位）
   * 返回 true 表示是添加操作，false 表示移除操作
   */
  shiftToggle(unit: Unit, playerTeam: number): 'added' | 'removed' | 'rejected' {
    // 只允许友方单位
    if (unit.team !== playerTeam) return 'rejected'

    if (this.selected.includes(unit)) {
      // 移除：但不能移除到空（war3 允许，和普通 RTS 一致）
      // 但如果只剩一个且要移除，也允许（变为空选择）
      this.remove(unit)
      return 'removed'
    } else {
      this.add(unit)
      return 'added'
    }
  }

  /**
   * 批量 Shift+add：框选后 Shift 持有时追加
   */
  shiftAddUnits(units: Unit[]): void {
    for (const u of units) {
      this.add(u)
    }
  }

  /**
   * 双击同类选择：选中与 primary 同类型的所有单位
   * 保持 primary 在首位（确保 primary 语义不变）
   * @param allUnits 所有游戏单位
   * @param playerTeam 玩家阵营
   * @param isVisible 可选的可见性过滤（当前用屏幕范围）
   * @returns true 如果实际找到了同类单位并选中
   */
  selectSameType(allUnits: Unit[], playerTeam: number, isVisible?: (u: Unit) => boolean): boolean {
    const primary = this.primary
    if (!primary) return false

    const targetType = primary.type
    const sameType: Unit[] = [primary]  // 保证 primary 在首位

    for (const u of allUnits) {
      if (u === primary) continue  // 跳过 primary，已经加入
      if (u.team !== playerTeam) continue
      if (u.type !== targetType) continue
      if (u.hp <= 0) continue
      if (isVisible && !isVisible(u)) continue
      sameType.push(u)
    }

    if (sameType.length <= this.selected.length) {
      // 没有额外可添加的同类单位
      return false
    }

    this.selected = sameType
    return true
  }

  /**
   * 清理无效单位（死亡、不再存在于单位列表等）
 * 返回被清理的单位列表
   */
  cleanupInvalid(validUnits: Unit[]): Unit[] {
    const validSet = new Set(validUnits)
    const removed: Unit[] = []
    const kept: Unit[] = []
    for (const u of this.selected) {
      if (validSet.has(u) && u.hp > 0) {
        kept.push(u)
      } else {
        removed.push(u)
      }
    }
    this.selected = kept
    return removed
  }

  /**
   * 获取所有选中的非建筑可控单位
   */
  getControllable(playerTeam: number): Unit[] {
    return this.selected.filter(u => u.team === playerTeam && !u.isBuilding)
  }

  /**
   * 获取选中的建筑（用于建筑命令卡）
   */
  getBuildings(playerTeam: number): Unit[] {
    return this.selected.filter(u => u.team === playerTeam && u.isBuilding)
  }

  /**
   * Tab 子组切换：将选中单位按类型分组，将 primary 类型移到末尾
   * 使下一个类型子组成为 primary
   *
   * 例如：[worker, worker, footman, footman] → Tab → [footman, footman, worker, worker]
   *
   * @returns true 如果成功切换（有多种类型），false 如果只有一种类型
   */
  cycleSubgroup(): boolean {
    if (this.selected.length <= 1) return false

    // 收集不同的类型（保持出现顺序）
    const typeOrder: string[] = []
    for (const u of this.selected) {
      if (!typeOrder.includes(u.type)) {
        typeOrder.push(u.type)
      }
    }

    // 只有一种类型 → 无法切换
    if (typeOrder.length <= 1) return false

    // 将 primary 类型移到末尾，使下一个类型成为 primary
    const primaryType = this.selected[0].type
    const primaryGroup: Unit[] = []
    const otherGroups: Unit[] = []

    for (const u of this.selected) {
      if (u.type === primaryType) {
        primaryGroup.push(u)
      } else {
        otherGroups.push(u)
      }
    }

    this.selected = [...otherGroups, ...primaryGroup]
    return true
  }

  /**
   * 获取当前选择的类型分组信息
   * 返回每种类型的数量，按出现顺序排列
   */
  getTypeGroups(): { type: string; count: number }[] {
    const order: string[] = []
    const counts: Record<string, number> = {}
    for (const u of this.selected) {
      if (!order.includes(u.type)) {
        order.push(u.type)
      }
      counts[u.type] = (counts[u.type] ?? 0) + 1
    }
    return order.map(type => ({ type, count: counts[type] }))
  }
}
