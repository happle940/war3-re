import * as THREE from 'three'
import { disposeObject3DDeep } from '../utils/dispose'

/**
 * 树木运行时条目
 *
 * 每棵树持有：mesh 引用、tile 坐标、剩余木材量。
 * 将来扩展：树种、大小、重生计时器等都可以加在这里。
 */
export interface TreeEntry {
  mesh: THREE.Group
  tx: number
  tz: number
  remainingLumber: number
}

/**
 * 统一树木运行时
 *
 * 职责：
 * - 注册 / 移除树木（tile 级 blocker + mesh 引用）
 * - 查询某 tile 是否有树
 * - 查询最近的可用树木
 * - 树木耗尽时释放 mesh + blocker
 * - 地图切换时全量重置
 *
 * 消费者：
 * - PathingGrid.isBlocked() 查询 isTreeTile()
 * - Game.handleRightClick / startGatherNearest 通过 findNearest() 查目标
 * - updateUnitState(Gathering) 通过 findNearest() 扣减木材并触发耗尽
 *
 * 未来扩展方式：
 * - 树种：在 TreeEntry 加 species 字段，spawn 时填入
 * - 重生：加 respawnTimer，在 update 中倒计时后重新 register
 * - 完整 war3 数值：remainingLumber 可从地图数据读取（doo 解析）
 * - 中立建筑/商店：与 TreeManager 同级的 NeutralBuildingManager
 */
export class TreeManager {
  private trees: TreeEntry[] = []
  private treeGrid: Uint8Array
  private width: number
  private height: number

  constructor(width: number, height: number) {
    this.width = width
    this.height = height
    this.treeGrid = new Uint8Array(width * height)
  }

  /** 注册一棵树，返回 TreeEntry（后续可用于扣减/移除） */
  register(mesh: THREE.Group, tx: number, tz: number, lumber: number): TreeEntry {
    const entry: TreeEntry = { mesh, tx, tz, remainingLumber: lumber }
    this.trees.push(entry)
    if (tx >= 0 && tz >= 0 && tx < this.width && tz < this.height) {
      this.treeGrid[tz * this.width + tx]++  // 引用计数：同 tile 多棵树不会互相覆盖
    }
    return entry
  }

  /** 移除一棵树（释放 blocker，不释放 mesh——调用方负责 dispose） */
  remove(entry: TreeEntry) {
    const idx = this.trees.indexOf(entry)
    if (idx >= 0) this.trees.splice(idx, 1)
    if (entry.tx >= 0 && entry.tz >= 0 && entry.tx < this.width && entry.tz < this.height) {
      const gi = entry.tz * this.width + entry.tx
      if (this.treeGrid[gi] > 0) this.treeGrid[gi]--  // 引用计数递减，不会误清同 tile 其他树
    }
  }

  /** 通过 mesh 引用查找 TreeEntry（用于验证资源目标是否仍有效） */
  getEntryByMesh(mesh: THREE.Group): TreeEntry | null {
    return this.trees.find((t) => t.mesh === mesh) ?? null
  }

  /** 查询某 tile 是否有树 */
  isTreeTile(tx: number, tz: number): boolean {
    if (tx < 0 || tz < 0 || tx >= this.width || tz >= this.height) return false
    return this.treeGrid[tz * this.width + tx] > 0
  }

  /** 查找距某位置最近的可用树木（有木材的） */
  findNearest(pos: THREE.Vector3, maxDist: number = Infinity): TreeEntry | null {
    let best: TreeEntry | null = null
    let bestDist = maxDist
    for (const t of this.trees) {
      if (t.remainingLumber <= 0) continue
      const d = pos.distanceTo(t.mesh.position)
      if (d < bestDist) {
        bestDist = d
        best = t
      }
    }
    return best
  }

  /** 调整网格大小（地图切换时） */
  resize(width: number, height: number) {
    this.width = width
    this.height = height
    this.treeGrid = new Uint8Array(width * height)
    this.trees = []
  }

  /** 全量重置（地图切换时调用，不 dispose mesh——调用方负责） */
  reset() {
    this.treeGrid.fill(0)
    this.trees = []
  }

  /** 清理所有树木 mesh（地图切换时 dispose 旧场景） */
  disposeAll() {
    for (const t of this.trees) {
      disposeObject3DDeep(t.mesh)
    }
    this.reset()
  }

  get entries(): readonly TreeEntry[] { return this.trees }
}
