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
import { clone as cloneSkeleton } from 'three/examples/jsm/utils/SkeletonUtils.js'
import { getAllAssetEntries, type AssetEntry } from './AssetCatalog'

export type AssetStatus = 'pending' | 'loading' | 'loaded' | 'failed'

export interface LoadedAsset {
  entry: AssetEntry
  scene: THREE.Group
  status: AssetStatus
  animations: THREE.AnimationClip[]
}

const cache = new Map<string, LoadedAsset>()
const gltfLoader = new GLTFLoader()

async function loadOne(entry: AssetEntry): Promise<void> {
  if (cache.has(entry.key)) return

  cache.set(entry.key, { entry, scene: new THREE.Group(), status: 'loading', animations: [] })

  try {
    const gltf = await gltfLoader.loadAsync(entry.path)
    const scene = gltf.scene
    scene.scale.setScalar(entry.scale)
    scene.position.y = entry.offsetY
    scene.userData.assetKey = entry.key
    scene.userData.assetPath = entry.path
    scene.userData.assetScale = entry.scale

    applyStaticIdlePose(entry.key, scene, gltf.animations)

    scene.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.castShadow = true
        child.receiveShadow = true
      }
    })

    cache.set(entry.key, { entry, scene, status: 'loaded', animations: gltf.animations })
  } catch {
    cache.set(entry.key, { entry, scene: new THREE.Group(), status: 'failed', animations: [] })
  }
}

const IDLE_ANIMATION_HINTS: Record<string, string[]> = {
  worker: ['Idle_Neutral', 'Idle'],
  militia: ['Idle_Sword', 'Idle_Neutral', 'Idle'],
  rifleman: ['Idle_Gun', 'Idle_Gun_Pointing', 'Idle'],
  paladin: ['Idle_Sword', 'Idle_Neutral', 'Idle'],
}

function applyStaticIdlePose(key: string, scene: THREE.Group, clips: THREE.AnimationClip[]) {
  if (clips.length === 0) return

  const hints = IDLE_ANIMATION_HINTS[key] ?? ['Idle_Neutral', 'Idle_Sword', 'Idle_Gun', 'Idle']
  const clip =
    hints
      .map(hint => clips.find(candidate => candidate.name.includes(hint)))
      .find((candidate): candidate is THREE.AnimationClip => !!candidate) ??
    clips.find(candidate => candidate.name.toLowerCase().includes('idle')) ??
    clips[0]

  const mixer = new THREE.AnimationMixer(scene)
  const action = mixer.clipAction(clip)
  action.play()
  mixer.setTime(Math.min(clip.duration * 0.35, 0.6))
  scene.updateMatrixWorld(true)
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
  const clone = cloneSkeleton(asset.scene) as THREE.Group
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
  scene.userData.assetKey = key
  scene.userData.assetPath = '__test__'
  scene.userData.assetScale = scale
  const entry: AssetEntry = { key, kind, path: '__test__', scale, offsetY }
  cache.set(key, { entry, scene, status: 'loaded', animations: [] })
  return () => {
    if (previous) cache.set(key, previous)
    else cache.delete(key)
  }
}
