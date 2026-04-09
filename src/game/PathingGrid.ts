import type { MapRuntime } from '../map/MapRuntime'
import type { OccupancyGrid } from './OccupancyGrid'
import type { TreeManager } from './TreeManager'

/**
 * 统一导航 blocker 查询入口
 *
 * 整合地图边界、水面、建筑占用、树木为单一 isBlocked() 查询。
 * A* 和其他空间查询都通过这里，不直接散读 MapRuntime / OccupancyGrid / TreeManager。
 *
 * 已整合：地图边界 + 水面 + 建筑占用 + 树木
 * 未整合：迷雾（独立 FogOfWar 层）、单位碰撞（独立 CollisionSystem）
 */
export class PathingGrid {
  private mapRuntime: MapRuntime
  private occupancy: OccupancyGrid
  private treeManager: TreeManager | null = null

  constructor(mapRuntime: MapRuntime, occupancy: OccupancyGrid) {
    this.mapRuntime = mapRuntime
    this.occupancy = occupancy
  }

  updateReferences(mapRuntime: MapRuntime, occupancy: OccupancyGrid) {
    this.mapRuntime = mapRuntime
    this.occupancy = occupancy
  }

  /** 设置树木管理器（树木 blocker 层） */
  setTreeManager(tm: TreeManager) {
    this.treeManager = tm
  }

  get width(): number { return this.mapRuntime.width }
  get height(): number { return this.mapRuntime.height }

  /** tile 坐标是否在地图内 */
  isInside(tx: number, tz: number): boolean {
    return this.mapRuntime.isInsideBounds(tx, tz)
  }

  /** tile 地形是否可通行（不含建筑/树木占用） */
  isTerrainWalkable(tx: number, tz: number): boolean {
    return this.mapRuntime.isWalkableTerrain(tx, tz)
  }

  /** tile 地形是否可放建筑 */
  isTerrainBuildable(tx: number, tz: number): boolean {
    return this.mapRuntime.isBuildableTerrain(tx, tz)
  }

  /** tile 是否被建筑占用 */
  isOccupied(tx: number, tz: number): boolean {
    return this.occupancy.isOccupied(tx, tz)
  }

  /** tile 是否有树木 */
  isTreeTile(tx: number, tz: number): boolean {
    if (!this.treeManager) return false
    return this.treeManager.isTreeTile(tx, tz)
  }

  /**
   * 统一 blocker 查询：某 tile 是否不可通行
   *
   * 整合：地图边界 + 水面 + 边界标记 + 建筑占用 + 树木
   * 这是 A* 和 pathing 的唯一查询入口
   */
  isBlocked(tx: number, tz: number): boolean {
    if (!this.isInside(tx, tz)) return true
    if (!this.isTerrainWalkable(tx, tz)) return true
    if (this.isOccupied(tx, tz)) return true
    if (this.isTreeTile(tx, tz)) return true
    return false
  }
}
