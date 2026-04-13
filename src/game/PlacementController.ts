import * as THREE from 'three'
import type { Unit } from './Game'
import { UnitState, BUILDINGS } from './GameData'
import type { PlacementValidator } from './OccupancyGrid'

/**
 * Bounded controller for placement-mode state and preview helpers.
 *
 * Owns:
 *   - placement mode state (mode key, ghost mesh, saved workers)
 *   - ghost preview mesh creation (procedural fallback)
 *   - ghost position update and validation color feedback
 *
 * Does NOT own:
 *   - builder agency / worker selection / fallback
 *   - resource payment / refund
 *   - building entity creation / build progress
 *   - footprint / occupancy marking
 *   - right-click command semantics
 */
export class PlacementController {
  private modeKey: string | null = null
  private ghost: THREE.Group | null = null
  private workers: Unit[] = []

  get mode(): string | null {
    return this.modeKey
  }

  get currentGhost(): THREE.Group | null {
    return this.ghost
  }

  get currentWorkers(): readonly Unit[] {
    return this.workers
  }

  /** Store placement state. Caller is responsible for scene.add(ghost) and clearSelection. */
  begin(buildingKey: string, workers: Unit[], ghostMesh: THREE.Group): void {
    this.modeKey = buildingKey
    this.workers = workers
    this.ghost = ghostMesh
  }

  /** Remove ghost from scene and clear all state. Returns the ghost if caller needs further cleanup. */
  exit(scene: THREE.Scene): THREE.Group | null {
    const removed = this.ghost
    if (removed) {
      scene.remove(removed)
    }
    this.modeKey = null
    this.ghost = null
    this.workers = []
    return removed
  }

  /** Filter saved workers that are still alive, not building, and still in the unit list. */
  aliveWorkers(allUnits: readonly Unit[]): Unit[] {
    return this.workers.filter(
      (u) => u.hp > 0 && u.state !== UnitState.Building && allUnits.includes(u),
    )
  }

  /** Clear only the workers list (e.g. after they've been assigned). */
  clearWorkers(): void {
    this.workers = []
  }

  // ==================== Preview Mesh Creation ====================

  /** Create a procedural fallback ghost mesh for placement preview. */
  createGhostMesh(type: string): THREE.Group {
    const group = new THREE.Group()
    const def = BUILDINGS[type]
    const s = def?.size ?? 1

    // 主体
    const base = new THREE.Mesh(
      new THREE.BoxGeometry(s, s * 0.4, s),
      new THREE.MeshLambertMaterial({ color: 0x00ff00, transparent: true, opacity: 0.5 }),
    )
    base.position.y = s * 0.2
    group.add(base)

    // 地面指示框（绿色/红色，显示占地范围）
    const outlineGeo = new THREE.EdgesGeometry(new THREE.BoxGeometry(s + 0.1, 0.01, s + 0.1))
    const outlineMat = new THREE.LineBasicMaterial({ color: 0x00ff00, transparent: true, opacity: 0.8 })
    const outline = new THREE.LineSegments(outlineGeo, outlineMat)
    outline.position.y = 0.02
    group.add(outline)

    return group
  }

  // ==================== Preview Update + Validation Color ====================

  /**
   * Update ghost position from a terrain hit point and apply validation color.
   * Returns the snapped tile coordinates { tx, tz } if a hit was found, null otherwise.
   */
  updatePreview(
    groundHitPoint: THREE.Vector3 | null,
    getWorldHeight: (wx: number, wz: number) => number,
    validator: PlacementValidator,
  ): { tx: number; tz: number } | null {
    if (!this.mode || !this.ghost) return null
    if (!groundHitPoint) {
      this.ghost.visible = false
      return null
    }

    const tx = Math.round(groundHitPoint.x)
    const tz = Math.round(groundHitPoint.z)
    this.ghost.position.set(
      tx + 0.5,
      getWorldHeight(tx, tz) + 0.01,
      tz + 0.5,
    )
    this.ghost.visible = true

    // Validation color feedback: green = valid, red = invalid
    const def = BUILDINGS[this.mode]
    const valid = def && validator.canPlace(tx, tz, def.size).ok
    const color = valid ? 0x44ff44 : 0xff3333
    this.ghost.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        const mat = child.material as THREE.MeshLambertMaterial | THREE.LineBasicMaterial
        if ('color' in mat) mat.color.setHex(color)
      }
    })

    return { tx, tz }
  }
}
