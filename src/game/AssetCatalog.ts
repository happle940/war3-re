/**
 * AssetCatalog — 统一管理所有游戏资产的 key、路径、元数据
 *
 * 设计原则：
 * - 每个 key 映射到一个 glTF 路径 + fallback 策略
 * - 路径都是相对于 public/ 的 URL 路径
 * - 新增资产只需在此添加条目
 */

export type AssetKind = 'unit' | 'building' | 'nature'

export interface AssetEntry {
  /** 唯一 key（同 unit/building type） */
  key: string
  /** 资产类别 */
  kind: AssetKind
  /** glTF 文件路径（相对于 public/） */
  path: string
  /** 模型缩放（glTF → 游戏世界） */
  scale: number
  /** 模型 Y 轴偏移（glTF → 游戏世界） */
  offsetY: number
}

const CATALOG: AssetEntry[] = [
  // ===== 单位 =====
  // worker: 使用 RTS 增强版 proxy（glTF 是高面数角色模型，RTS 镜头下不可读）
  { key: 'footman',  kind: 'unit',     path: 'assets/models/units/footman.glb',    scale: 1.0, offsetY: 0 },
  // ===== 建筑 =====
  { key: 'townhall', kind: 'building', path: 'assets/models/buildings/townhall.glb', scale: 1.65, offsetY: 0 },
  { key: 'barracks', kind: 'building', path: 'assets/models/buildings/barracks.glb', scale: 1.0, offsetY: 0 },
  { key: 'farm',     kind: 'building', path: 'assets/models/buildings/farm.glb',     scale: 1.0, offsetY: 0 },
  { key: 'tower',    kind: 'building', path: 'assets/models/buildings/tower.glb',    scale: 1.0, offsetY: 0 },
  { key: 'goldmine', kind: 'building', path: 'assets/models/buildings/goldmine.glb', scale: 1.0, offsetY: 0 },
  // ===== 自然 =====
  { key: 'pine_tree', kind: 'nature',  path: 'assets/models/nature/pine_tree.glb',  scale: 1.0, offsetY: 0 },
]

const byKey = new Map<string, AssetEntry>()
for (const entry of CATALOG) {
  byKey.set(entry.key, entry)
}

export function getAssetEntry(key: string): AssetEntry | undefined {
  return byKey.get(key)
}

export function getAllAssetEntries(): readonly AssetEntry[] {
  return CATALOG
}
