import * as THREE from 'three'
import type { PathingGrid } from './PathingGrid'

// 4 方向邻域（上/下/左/右，无对角线）
const DIRS_4: readonly [number, number][] = [
  [0, -1], [0, 1], [-1, 0], [1, 0],
]

/** 最大探索节点数（防止极端情况下的性能问题） */
const MAX_EXPLORED = 8192

/**
 * A* 寻路（4 方向）
 *
 * 输入：起点/终点 tile 坐标 + PathingGrid blocker 查询
 * 输出：tile 路径 [[tx,tz], ...] 去除起点、简化共线点，或 null
 *
 * 4 方向选择理由：
 * - 无对角穿角风险（8 方向需额外检查两个相邻 tile 是否同时可走）
 * - 实现简单、语义清晰
 * - 路径虽然不那么"斜"，但对 tile-based RTS 完全可接受
 * - 未来升级 8 方向：在 DIRS 中追加对角方向 + cost=√2，
 *   并在扩展时检查对角线两个正交邻居是否都非 blocked
 */
export function findPath(
  startTx: number, startTz: number,
  goalTx: number, goalTz: number,
  grid: PathingGrid,
): [number, number][] | null {
  const w = grid.width
  const h = grid.height

  if (!grid.isInside(startTx, startTz) || !grid.isInside(goalTx, goalTz)) return null
  if (grid.isBlocked(startTx, startTz)) return null

  // 如果目标 tile 被 blocked（建筑/水面），找最近的可行走 tile
  let gTx = goalTx
  let gTz = goalTz
  if (grid.isBlocked(goalTx, goalTz)) {
    const nearest = findNearestWalkable(goalTx, goalTz, grid)
    if (!nearest) return null
    gTx = nearest[0]
    gTz = nearest[1]
  }

  if (startTx === gTx && startTz === gTz) return []

  const size = w * h
  const gScore = new Float32Array(size).fill(Infinity)
  const fScore = new Float32Array(size).fill(Infinity)
  const parent = new Int32Array(size).fill(-1)
  const closed = new Uint8Array(size)

  const si = startTz * w + startTx
  const gi = gTz * w + gTx

  gScore[si] = 0
  fScore[si] = manhattan(startTx, startTz, gTx, gTz)

  const open: number[] = [si]
  let explored = 0

  while (open.length > 0 && explored < MAX_EXPLORED) {
    const ci = heapPop(open, fScore)
    if (ci === gi) {
      const raw = reconstructPath(parent, ci, w)
      return simplifyPath(raw)
    }
    if (closed[ci]) continue
    closed[ci] = 1
    explored++

    const cx = ci % w
    const cz = (ci - cx) / w

    for (const [dx, dz] of DIRS_4) {
      const nx = cx + dx
      const nz = cz + dz
      if (nx < 0 || nz < 0 || nx >= w || nz >= h) continue
      const ni = nz * w + nx
      if (closed[ni]) continue
      if (grid.isBlocked(nx, nz)) continue

      const ng = gScore[ci] + 1
      if (ng < gScore[ni]) {
        gScore[ni] = ng
        fScore[ni] = ng + manhattan(nx, nz, gTx, gTz)
        parent[ni] = ci
        heapPush(open, ni, fScore)
      }
    }
  }

  return null
}

/** Manhattan 距离（与 4 方向移动一致） */
function manhattan(x1: number, z1: number, x2: number, z2: number): number {
  return Math.abs(x1 - x2) + Math.abs(z1 - z2)
}

/** 从 goal 反向追踪 parent 重建路径 */
function reconstructPath(parent: Int32Array, goalIdx: number, width: number): [number, number][] {
  const path: [number, number][] = []
  let idx = goalIdx
  while (idx !== -1) {
    const x = idx % width
    const z = (idx - x) / width
    path.push([x, z])
    idx = parent[idx]
  }
  path.reverse()
  return path
}

/**
 * 路径简化：移除共线中间点（只保留转折点和起终点）
 *
 * 例如一条直线走 10 格 → 只保留起终点 2 个 waypoint
 */
function simplifyPath(path: [number, number][]): [number, number][] {
  if (path.length <= 2) return path

  const result: [number, number][] = [path[0]]
  for (let i = 1; i < path.length - 1; i++) {
    const prev = result[result.length - 1]
    const curr = path[i]
    const next = path[i + 1]
    const dx1 = curr[0] - prev[0]
    const dz1 = curr[1] - prev[1]
    const dx2 = next[0] - curr[0]
    const dz2 = next[1] - curr[1]
    if (dx1 !== dx2 || dz1 !== dz2) {
      result.push(curr)
    }
  }
  result.push(path[path.length - 1])
  return result
}

/**
 * 在目标 tile 周围找最近的可行走 tile（BFS 扩展环）
 *
 * 用于目标在建筑/水面上的情况（如右键点建筑）
 */
function findNearestWalkable(tx: number, tz: number, grid: PathingGrid, maxRadius = 5): [number, number] | null {
  if (!grid.isBlocked(tx, tz)) return [tx, tz]

  for (let r = 1; r <= maxRadius; r++) {
    for (let dx = -r; dx <= r; dx++) {
      for (let dz = -r; dz <= r; dz++) {
        if (Math.abs(dx) !== r && Math.abs(dz) !== r) continue
        const nx = tx + dx
        const nz = tz + dz
        if (grid.isInside(nx, nz) && !grid.isBlocked(nx, nz)) return [nx, nz]
      }
    }
  }

  return null
}

/**
 * 将 tile 路径转为世界坐标 waypoint 列表
 *
 * 跳过起点（单位已在该 tile），返回其余简化后的世界坐标点。
 * 如果寻路失败返回 null，调用方应 fallback 到直线移动。
 */
export function pathToWorldWaypoints(
  tilePath: [number, number][] | null,
  getHeight: (wx: number, wz: number) => number,
): THREE.Vector3[] | null {
  if (!tilePath) return null
  if (tilePath.length <= 1) return []

  return tilePath.slice(1).map(([tx, tz]) => {
    const wx = tx + 0.5
    const wz = tz + 0.5
    return new THREE.Vector3(wx, getHeight(wx - 0.5, wz - 0.5), wz)
  })
}

// ===== Binary Min-Heap（存储 flat index，按 fScore 排序）=====

function heapPush(heap: number[], idx: number, fScore: Float32Array) {
  heap.push(idx)
  let i = heap.length - 1
  while (i > 0) {
    const p = (i - 1) >> 1
    if (fScore[heap[i]] < fScore[heap[p]]) {
      const tmp = heap[i]; heap[i] = heap[p]; heap[p] = tmp
      i = p
    } else break
  }
}

function heapPop(heap: number[], fScore: Float32Array): number {
  const top = heap[0]
  const last = heap.pop()!
  if (heap.length > 0) {
    heap[0] = last
    let i = 0
    const n = heap.length
    while (true) {
      let s = i
      const l = 2 * i + 1
      const r = 2 * i + 2
      if (l < n && fScore[heap[l]] < fScore[heap[s]]) s = l
      if (r < n && fScore[heap[r]] < fScore[heap[s]]) s = r
      if (s !== i) {
        const tmp = heap[i]; heap[i] = heap[s]; heap[s] = tmp
        i = s
      } else break
    }
  }
  return top
}
