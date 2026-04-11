import * as THREE from 'three'
import type { Unit } from './Game'
import { UnitState } from './GameData'

/** Bounded controller for placement-mode state: mode key, ghost mesh, and workers. */
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
}
