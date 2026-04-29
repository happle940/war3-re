import type { MapRuntime } from '../map/MapRuntime'
import type { Unit } from './UnitTypes'

/**
 * 建筑占用网格
 *
 * 记录哪些 tile 被建筑占用，用于：
 * - 建筑放置合法性校验
 * - 未来 A* 的 blocker 查询
 * - 建筑死亡/地图切换时释放占用
 *
 * 设计原则：
 * - Grid 大小 = MapRuntime 大小
 * - 每个 tile 有一个引用计数（允许同一 tile 被多个逻辑占用）
 * - 建筑创建时 mark，死亡时 unmark
 * - 地图切换时 reset
 */
export class OccupancyGrid {
  private grid: Uint8Array
  private width: number
  private height: number

  constructor(width: number, height: number) {
    this.width = width
    this.height = height
    this.grid = new Uint8Array(width * height)
  }

  /** 调整网格大小（地图切换时） */
  resize(width: number, height: number) {
    this.width = width
    this.height = height
    this.grid = new Uint8Array(width * height)
  }

  /** 清空所有占用 */
  reset() {
    this.grid.fill(0)
  }

  /** 标记某 tile 被占用 */
  mark(tx: number, tz: number) {
    if (tx < 0 || tz < 0 || tx >= this.width || tz >= this.height) return
    this.grid[tz * this.width + tx]++
  }

  /** 取消某 tile 的占用 */
  unmark(tx: number, tz: number) {
    if (tx < 0 || tz < 0 || tx >= this.width || tz >= this.height) return
    const idx = tz * this.width + tx
    if (this.grid[idx] > 0) this.grid[idx]--
  }

  /** 查询某 tile 是否被建筑占用 */
  isOccupied(tx: number, tz: number): boolean {
    if (tx < 0 || tz < 0 || tx >= this.width || tz >= this.height) return true
    return this.grid[tz * this.width + tx] > 0
  }

  get gridWidth() { return this.width }
  get gridHeight() { return this.height }
}

/**
 * 建筑放置合法性校验
 *
 * 统一入口：玩家和 AI 都用这套逻辑判断"能不能放"。
 * 以后可以加更多规则（坡度、相邻建筑等），不改调用方。
 */
export class PlacementValidator {
  private occupancy: OccupancyGrid
  private mapRuntime: MapRuntime

  constructor(occupancy: OccupancyGrid, mapRuntime: MapRuntime) {
    this.occupancy = occupancy
    this.mapRuntime = mapRuntime
  }

  /** 当 occupancy 或 mapRuntime 引用变化时调用 */
  updateReferences(occupancy: OccupancyGrid, mapRuntime: MapRuntime) {
    this.occupancy = occupancy
    this.mapRuntime = mapRuntime
  }

  /**
   * 检查建筑能否放在指定位置
   *
   * @param tx 左下角 tile X（整数）
   * @param tz 左下角 tile Z（整数）
   * @param size 建筑占地尺寸（来自 BuildingDef.size）
   * @returns 合法性结果
   */
  canPlace(tx: number, tz: number, size: number): PlacementResult {
    // 检查每个被占用的 tile
    for (let dx = 0; dx < Math.ceil(size); dx++) {
      for (let dz = 0; dz < Math.ceil(size); dz++) {
        const cx = tx + dx
        const cz = tz + dz

        // 边界检查
        if (cx < 0 || cz < 0 || cx >= this.occupancy.gridWidth || cz >= this.occupancy.gridHeight) {
          return { ok: false, reason: 'out_of_bounds' }
        }

        // 已有建筑占用
        if (this.occupancy.isOccupied(cx, cz)) {
          return { ok: false, reason: 'occupied' }
        }

        // 地形不可放置（使用机器可读接口，不依赖字符串）
        if (!this.mapRuntime.isBuildableTerrain(cx, cz)) {
          return { ok: false, reason: 'water' }
        }
      }
    }

    return { ok: true, reason: 'ok' }
  }
}

export interface PlacementResult {
  ok: boolean
  reason: 'ok' | 'out_of_bounds' | 'occupied' | 'water'
}
