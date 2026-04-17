/**
 * AssetCatalog — 统一管理所有游戏资产的 key、路径、元数据
 *
 * 设计原则：
 * - 每个 key 映射到一个 glTF 路径 + fallback 策略
 * - 路径都是相对于 public/ 的 URL 路径
 * - 新增资产只需在此添加条目
 *
 * V3.1 fallback manifest (asset-handoff-a1-s0-fallback-001):
 * - 九类 A1 battlefield target key 都有 fallback route
 * - Unit A1 real-model pass uses local CC0 intake files under public/assets
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

/**
 * Fallback manifest entry for asset-handoff-a1-s0-fallback-001.
 * Maps the nine A1 battlefield target keys to their runtime fallback routes.
 */
export interface FallbackManifestEntry {
  /** Target runtime key from asset-handoff-a1-s0-fallback-001 */
  targetKey: string
  /** Candidate ID from the handoff packet */
  candidateId: string
  /** Fallback ID */
  fallbackId: string
  /** Source class: always S0 for current V3.1 */
  sourceClass: 'S0'
  /** Runtime implementation: which factory/code path provides the fallback */
  runtimeRoute: 'project-proxy' | 'procedural-fallback' | 'pathing-grid-runtime'
  /** Whether this target has a glTF entry in the catalog */
  hasGltfEntry: boolean
  /** Whether the glTF file is loaded (determined at runtime) */
  gltfStatus: 'pending' | 'loaded' | 'failed' | 'not-in-catalog'
  /** Category from handoff packet */
  category: string
}

const CATALOG: AssetEntry[] = [
  // ===== 单位 =====
  { key: 'worker',      kind: 'unit', path: 'assets/models/vendor/poly-pizza/units/worker.glb',      scale: 1.12, offsetY: 0 },
  { key: 'footman',     kind: 'unit', path: 'assets/models/vendor/poly-pizza/units/footman.glb',     scale: 90.0, offsetY: 0 },
  { key: 'rifleman',    kind: 'unit', path: 'assets/models/vendor/poly-pizza/units/rifleman_adventurer.glb', scale: 1.12, offsetY: 0 },
  { key: 'mortar_team', kind: 'unit', path: 'assets/models/vendor/poly-pizza/units/mortar_team.glb', scale: 1.25, offsetY: 0 },
  { key: 'priest',      kind: 'unit', path: 'assets/models/vendor/poly-pizza/units/priest.glb',      scale: 0.42, offsetY: 0 },
  { key: 'militia',     kind: 'unit', path: 'assets/models/vendor/poly-pizza/units/militia.glb',     scale: 1.12, offsetY: 0 },
  { key: 'sorceress',   kind: 'unit', path: 'assets/models/vendor/poly-pizza/units/sorceress.glb',   scale: 0.38, offsetY: 0 },
  { key: 'knight',      kind: 'unit', path: 'assets/models/vendor/poly-pizza/units/knight.glb',      scale: 95.0, offsetY: 0 },
  { key: 'paladin',     kind: 'unit', path: 'assets/models/vendor/poly-pizza/units/paladin.glb',     scale: 1.12, offsetY: 0 },
  // ===== 建筑 =====
  { key: 'townhall', kind: 'building', path: 'assets/models/vendor/quaternius/ultimate-fantasy-rts/town-center.glb', scale: 2.5299, offsetY: 0 },
  { key: 'barracks', kind: 'building', path: 'assets/models/vendor/quaternius/ultimate-fantasy-rts/barracks.glb', scale: 1.4369, offsetY: 0 },
  { key: 'blacksmith', kind: 'building', path: 'assets/models/buildings/blacksmith.glb', scale: 1.0, offsetY: 0 },
  { key: 'farm',     kind: 'building', path: 'assets/models/vendor/quaternius/ultimate-fantasy-rts/farm.glb',        scale: 0.8123, offsetY: 0 },
  { key: 'tower',    kind: 'building', path: 'assets/models/vendor/quaternius/ultimate-fantasy-rts/watch-tower.glb', scale: 1.8461, offsetY: 0 },
  { key: 'goldmine', kind: 'building', path: 'assets/models/vendor/quaternius/ultimate-fantasy-rts/mine.glb',        scale: 1.7960, offsetY: 0 },
  { key: 'goldmine_accent', kind: 'building', path: 'assets/models/vendor/quaternius/ultimate-fantasy-rts/resource-gold.glb', scale: 1.15, offsetY: 0 },
  // ===== 自然 =====
  { key: 'pine_tree', kind: 'nature',  path: 'assets/models/nature/pine_tree.glb',  scale: 1.0, offsetY: 0 },
]

/**
 * V3.1 A1 fallback manifest — asset-handoff-a1-s0-fallback-001
 *
 * Maps the nine battlefield target keys to their deterministic S0 fallback routes.
 * Updated at catalog construction time with glTF status from AssetLoader.
 */
const FALLBACK_MANIFEST: FallbackManifestEntry[] = [
  {
    targetKey: 'bf-unit-worker',
    candidateId: 'a1-s0-worker-fallback',
    fallbackId: 'fallback-readable-worker-proxy',
    sourceClass: 'S0',
    runtimeRoute: 'project-proxy',
    hasGltfEntry: true,
    gltfStatus: 'pending',
    category: 'worker',
  },
  {
    targetKey: 'bf-unit-footman',
    candidateId: 'a1-s0-footman-fallback',
    fallbackId: 'fallback-readable-footman-proxy',
    sourceClass: 'S0',
    runtimeRoute: 'procedural-fallback',
    hasGltfEntry: true,
    gltfStatus: 'pending', // updated at runtime
    category: 'footman',
  },
  {
    targetKey: 'bf-building-town-hall',
    candidateId: 'a1-s0-townhall-fallback',
    fallbackId: 'fallback-readable-th-proxy',
    sourceClass: 'S0',
    runtimeRoute: 'project-proxy',
    hasGltfEntry: true,
    gltfStatus: 'pending',
    category: 'townhall',
  },
  {
    targetKey: 'bf-building-barracks',
    candidateId: 'a1-s0-barracks-fallback',
    fallbackId: 'fallback-readable-barracks-proxy',
    sourceClass: 'S0',
    runtimeRoute: 'procedural-fallback',
    hasGltfEntry: true,
    gltfStatus: 'pending',
    category: 'barracks',
  },
  {
    targetKey: 'bf-building-farm',
    candidateId: 'a1-s0-farm-fallback',
    fallbackId: 'fallback-readable-farm-proxy',
    sourceClass: 'S0',
    runtimeRoute: 'procedural-fallback',
    hasGltfEntry: true,
    gltfStatus: 'pending',
    category: 'farm',
  },
  {
    targetKey: 'bf-building-tower',
    candidateId: 'a1-s0-tower-fallback',
    fallbackId: 'fallback-readable-tower-proxy',
    sourceClass: 'S0',
    runtimeRoute: 'procedural-fallback',
    hasGltfEntry: true,
    gltfStatus: 'pending',
    category: 'tower',
  },
  {
    targetKey: 'bf-resource-goldmine',
    candidateId: 'a1-s0-goldmine-fallback',
    fallbackId: 'fallback-readable-goldmine-proxy',
    sourceClass: 'S0',
    runtimeRoute: 'procedural-fallback',
    hasGltfEntry: true,
    gltfStatus: 'pending',
    category: 'goldmine',
  },
  {
    targetKey: 'bf-terrain-tree-line',
    candidateId: 'a1-s0-tree-line-fallback',
    fallbackId: 'fallback-readable-tree-line-proxy',
    sourceClass: 'S0',
    runtimeRoute: 'procedural-fallback',
    hasGltfEntry: true,
    gltfStatus: 'pending',
    category: 'trees / tree line',
  },
  {
    targetKey: 'bf-terrain-aid',
    candidateId: 'a1-s0-terrain-aid-fallback',
    fallbackId: 'fallback-readable-terrain-aid-proxy',
    sourceClass: 'S0',
    runtimeRoute: 'pathing-grid-runtime',
    hasGltfEntry: false,
    gltfStatus: 'not-in-catalog',
    category: 'terrain readability aids',
  },
]

const byKey = new Map<string, AssetEntry>()
for (const entry of CATALOG) {
  byKey.set(entry.key, entry)
}

const fallbackByKey = new Map<string, FallbackManifestEntry>()
for (const entry of FALLBACK_MANIFEST) {
  fallbackByKey.set(entry.targetKey, entry)
}

export function getAssetEntry(key: string): AssetEntry | undefined {
  return byKey.get(key)
}

export function getAllAssetEntries(): readonly AssetEntry[] {
  return CATALOG
}

export function getFallbackManifestEntry(targetKey: string): FallbackManifestEntry | undefined {
  return fallbackByKey.get(targetKey)
}

export function getAllFallbackManifestEntries(): readonly FallbackManifestEntry[] {
  return FALLBACK_MANIFEST
}

export function getFallbackManifestCount(): { total: number; legalProxy: number; fallback: number; hybrid: number; blocked: number } {
  let legalProxy = 0
  let fallback = 0
  let hybrid = 0
  let blocked = 0
  for (const entry of FALLBACK_MANIFEST) {
    if (entry.runtimeRoute === 'project-proxy') legalProxy++
    else if (entry.runtimeRoute === 'procedural-fallback') fallback++
    else if (entry.runtimeRoute === 'pathing-grid-runtime') fallback++
    else blocked++
  }
  return { total: FALLBACK_MANIFEST.length, legalProxy, fallback, hybrid, blocked }
}
