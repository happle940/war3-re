/**
 * AssetLoader — 统一管理 glTF 加载与缓存
 *
 * 设计原则：
 * - 异步加载，不阻塞游戏启动
 * - 加载失败 → 静默 fallback，不崩溃
 * - 缓存 loaded scene，clone 使用
 * - 暴露 loadAll() 供 Game 启动时调用
 * - 暴露 get() 供 factory 查询已加载模型
 */

import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { getAllAssetEntries, type AssetEntry } from './AssetCatalog'

export type AssetStatus = 'pending' | 'loading' | 'loaded' | 'failed'

export interface LoadedAsset {
  entry: AssetEntry
  scene: THREE.Group
  status: AssetStatus
}

const cache = new Map<string, LoadedAsset>()
const gltfLoader = new GLTFLoader()

async function loadOne(entry: AssetEntry): Promise<void> {
  if (cache.has(entry.key)) return

  cache.set(entry.key, { entry, scene: new THREE.Group(), status: 'loading' })

  try {
    const gltf = await gltfLoader.loadAsync(entry.path)
    const scene = gltf.scene
    scene.scale.setScalar(entry.scale)
    scene.position.y = entry.offsetY

    scene.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.castShadow = true
        child.receiveShadow = true
      }
    })

    cache.set(entry.key, { entry, scene, status: 'loaded' })
  } catch {
    cache.set(entry.key, { entry, scene: new THREE.Group(), status: 'failed' })
  }
}

export async function loadAllAssets(): Promise<Map<string, AssetStatus>> {
  const all = getAllAssetEntries()
  await Promise.all(all.map(loadOne))
  const result = new Map<string, AssetStatus>()
  for (const [key, asset] of cache) {
    result.set(key, asset.status)
  }
  return result
}

/**
 * Deep-clone per-mesh materials (handles single and array materials).
 * Used by both getLoadedModel (production) and __testDeepCloneWithMaterials (tests).
 */
function deepCloneMaterials(group: THREE.Group): void {
  group.traverse((child) => {
    if (child instanceof THREE.Mesh && child.material) {
      if (Array.isArray(child.material)) {
        child.material = child.material.map((m: THREE.Material) => m.clone())
      } else {
        child.material = (child.material as THREE.Material).clone()
      }
    }
  })
}

/**
 * 获取已加载模型的独立克隆。
 * 对每个 Mesh 的材质做 .clone()，避免多实例共享材质导致串色。
 */
export function getLoadedModel(key: string): THREE.Group | null {
  const asset = cache.get(key)
  if (!asset || asset.status !== 'loaded') return null
  const clone = asset.scene.clone()
  deepCloneMaterials(clone)
  return clone
}

export function getAssetStatus(key: string): AssetStatus {
  return cache.get(key)?.status ?? 'pending'
}

// ==================== Test-only helpers ====================

/**
 * Deep-clone a Group with per-mesh material cloning.
 * Uses the same deepCloneMaterials() as getLoadedModel() so tests prove the real path.
 */
export function __testDeepCloneWithMaterials(source: THREE.Group): THREE.Group {
  const clone = source.clone()
  deepCloneMaterials(clone)
  return clone
}

/**
 * Inject a fake loaded asset into the cache for deterministic refresh testing.
 * Returns a cleanup function to remove it.
 */
export function __testInjectFakeAsset(
  key: string,
  scene: THREE.Group,
  scale: number,
  offsetY: number = 0,
  kind: AssetEntry['kind'] = 'unit',
): () => void {
  const previous = cache.get(key)
  scene.scale.setScalar(scale)
  scene.position.y = offsetY
  const entry: AssetEntry = { key, kind, path: '__test__', scale, offsetY }
  cache.set(key, { entry, scene, status: 'loaded' })
  return () => {
    if (previous) cache.set(key, previous)
    else cache.delete(key)
  }
}
