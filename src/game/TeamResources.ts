import { UNITS, BUILDINGS } from './GameData'

/** 单个阵营的资源快照 */
export interface ResourceSnapshot {
  gold: number
  lumber: number
}

/** 消耗条件 */
export interface Cost {
  gold: number
  lumber: number
}

/**
 * per-team 资源管理器
 *
 * 管理每个阵营的金币/木材。
 * Game.ts 通过此模块操作资源，不再直接持有 gold/lumber 字段。
 */
export class TeamResources {
  private teams = new Map<number, ResourceSnapshot>()

  /** 初始化某阵营的起始资源 */
  init(team: number, gold: number, lumber: number) {
    this.teams.set(team, { gold, lumber })
  }

  /** 获取快照（只读） */
  get(team: number): ResourceSnapshot {
    const r = this.teams.get(team)
    if (!r) throw new Error(`TeamResources: team ${team} not initialized`)
    return { gold: r.gold, lumber: r.lumber }
  }

  /** 能否支付 */
  canAfford(team: number, cost: Cost): boolean {
    const r = this.teams.get(team)
    if (!r) return false
    return r.gold >= cost.gold && r.lumber >= cost.lumber
  }

  /** 扣除资源（调用方应先 canAfford） */
  spend(team: number, cost: Cost) {
    const r = this.teams.get(team)
    if (!r) return
    r.gold -= cost.gold
    r.lumber -= cost.lumber
  }

  /** 增加资源 */
  earn(team: number, gold: number, lumber: number) {
    const r = this.teams.get(team)
    if (!r) return
    r.gold += gold
    r.lumber += lumber
  }

  /** 计算某阵营的人口供需（基于传入的单位列表）
   *  只有建造完成的建筑才提供 supply。
   */
  computeSupply(team: number, units: { team: number; type: string; isBuilding: boolean; buildProgress: number }[]): { used: number; total: number } {
    let used = 0
    let total = 10 // townhall 基础给 10
    for (const u of units) {
      if (u.team !== team) continue
      if (u.isBuilding) {
        // 只有建造完成的建筑才提供人口
        if (u.buildProgress >= 1) {
          total += BUILDINGS[u.type]?.supply ?? 0
        }
      } else {
        used += UNITS[u.type]?.supply ?? 0
      }
    }
    return { used, total }
  }

  /** 清理所有阵营数据（地图切换时） */
  reset() {
    this.teams.clear()
  }
}
