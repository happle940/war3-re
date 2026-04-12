import * as THREE from 'three'
import { disposeObject3DDeep } from '../utils/dispose'
import { BUILDINGS, UnitState } from './GameData'
import type { Unit } from './Game'
import type { SelectionModel } from './SelectionModel'
import type { FeedbackEffects } from './FeedbackEffects'

/**
 * Selection visual & query controller
 *
 * Owns the pure-display and query helpers previously inlined in Game.ts:
 *   - selection ring creation, clearing, syncing, and per-frame animation
 *   - screen-space unit visibility test
 *   - hit resolution helpers (findUnitByObject, resolveHitUnits, resolveClickSelectionTarget)
 *   - box-select visual rendering
 *
 * Does NOT own:
 *   - selection decisions (handleClick, finishBoxSelect logic, shift toggle)
 *   - input state (isDragging, shiftHeld, lastClickTime)
 *   - HUD cache keys (_lastCmdKey, _lastSelKey)
 *   - control group save/recall orchestration
 *   - command dispatch
 */
export class SelectionController {
  private scene: THREE.Scene
  private camera: THREE.PerspectiveCamera
  private selectionModel: SelectionModel
  private feedback: FeedbackEffects

  /** @internal Exposed for backward-compatible test shims on Game */
  readonly selectionRings: THREE.Mesh[] = []
  private selectionRingPhase = 0
  /** @internal Exposed for backward-compatible test shims on Game */
  readonly selBoxEl: HTMLDivElement

  constructor(deps: {
    scene: THREE.Scene
    camera: THREE.PerspectiveCamera
    selectionModel: SelectionModel
    feedback: FeedbackEffects
    selBoxEl: HTMLDivElement
  }) {
    this.scene = deps.scene
    this.camera = deps.camera
    this.selectionModel = deps.selectionModel
    this.feedback = deps.feedback
    this.selBoxEl = deps.selBoxEl
  }

  // ==================== Unit Lookup Helpers ====================

  /** Walk the parent chain to find which Unit owns this Object3D. */
  findUnitByObject(hitObj: THREE.Object3D, allUnits: readonly Unit[]): Unit | undefined {
    let obj: THREE.Object3D | null = hitObj
    while (obj) {
      const found = allUnits.find((u) => u.mesh === obj)
      if (found) return found
      obj = obj.parent
    }
    return undefined
  }

  /** Deduplicate all unit hits resolved from a raycast hit list. */
  resolveHitUnits(hits: readonly THREE.Intersection<THREE.Object3D>[], allUnits: readonly Unit[]): Unit[] {
    const hitUnits: Unit[] = []
    const seen = new Set<Unit>()
    for (const hit of hits) {
      const unit = this.findUnitByObject(hit.object, allUnits)
      if (unit && !seen.has(unit)) {
        hitUnits.push(unit)
        seen.add(unit)
      }
    }
    return hitUnits
  }

  /**
   * Left-click selection priority:
   * if a goldmine is only blocked by workers already mining that same mine,
   * prefer the mine so crowded mining does not make the resource node
   * effectively unselectable.
   */
  resolveClickSelectionTarget(hitUnits: readonly Unit[]): Unit | undefined {
    if (hitUnits.length === 0) return undefined
    const first = hitUnits[0]
    const goldmineIdx = hitUnits.findIndex((u) => u.type === 'goldmine')
    if (goldmineIdx <= 0) return first

    const mine = hitUnits[goldmineIdx]
    const blockers = hitUnits.slice(0, goldmineIdx)
    const blockersAreMiningWorkers = blockers.every((u) =>
      u.type === 'worker' &&
      u.gatherType === 'gold' &&
      (u.state === UnitState.MovingToGather
        || u.state === UnitState.Gathering
        || u.state === UnitState.MovingToReturn) &&
      u.resourceTarget?.type === 'goldmine' &&
      u.resourceTarget.mine === mine,
    )

    return blockersAreMiningWorkers ? mine : first
  }

  // ==================== Screen-Space Query ====================

  /** Check whether a unit's position projects into the current viewport. */
  isUnitOnScreen(unit: Unit): boolean {
    const screenPos = new THREE.Vector3()
    screenPos.copy(unit.mesh.position).project(this.camera)
    const sx = (screenPos.x + 1) / 2 * window.innerWidth
    const sy = (-screenPos.y + 1) / 2 * window.innerHeight
    return sx >= -50 && sx <= window.innerWidth + 50 && sy >= -50 && sy <= window.innerHeight + 50
      && screenPos.z < 1
  }

  // ==================== Selection Rings ====================

  /** Create a visual selection ring for a unit (War3-style team-colored ring). */
  createSelectionRing(unit: Unit) {
    const radius = unit.isBuilding
      ? (BUILDINGS[unit.type]?.size ?? 1) * 0.55
      : unit.type === 'footman'
        ? 0.68
        : unit.type === 'worker'
          ? 0.62
          : 0.5
    const thickness = unit.isBuilding ? 0.15 : 0.1
    const ringGeo = new THREE.RingGeometry(radius - thickness, radius, 32)
    ringGeo.rotateX(-Math.PI / 2)
    const ringColor = unit.team === 0 ? 0x00ee66 : 0xff3333
    const ringMat = new THREE.MeshBasicMaterial({
      color: ringColor,
      side: THREE.DoubleSide,
      depthTest: false,
      transparent: true,
      opacity: 0.88,
    })
    const ring = new THREE.Mesh(ringGeo, ringMat)
    ring.position.copy(unit.mesh.position)
    ring.position.y = 0.05
    ring.renderOrder = 999
    this.scene.add(ring)
    this.selectionRings.push(ring)

    this.feedback.flashSelection(unit.mesh)
  }

  /** Clear all selection rings from the scene. */
  clearSelectionRings() {
    for (const ring of this.selectionRings) {
      disposeObject3DDeep(ring)
    }
    this.selectionRings.length = 0
  }

  /** Sync selection rings so their count matches the current selection model. */
  syncSelectionRings() {
    const selectedUnits = this.selectionModel.units
    while (this.selectionRings.length > selectedUnits.length) {
      const ring = this.selectionRings.pop()!
      disposeObject3DDeep(ring)
    }
    for (let i = this.selectionRings.length; i < selectedUnits.length; i++) {
      this.createSelectionRing(selectedUnits[i])
    }
  }

  /** Per-frame update: animate selection rings and queue indicators. */
  updateSelectionRings() {
    const selectedUnits = this.selectionModel.units
    this.selectionRingPhase += 0.05
    const pulse = 0.85 + 0.15 * Math.sin(this.selectionRingPhase)
    const opacityPulse = 0.75 + 0.13 * Math.sin(this.selectionRingPhase)

    for (let i = 0; i < selectedUnits.length; i++) {
      const ring = this.selectionRings[i]
      if (ring) {
        ring.position.x = selectedUnits[i].mesh.position.x
        ring.position.z = selectedUnits[i].mesh.position.z
        ring.position.y = selectedUnits[i].mesh.position.y + 0.05
        ring.scale.set(pulse, 1, pulse)
        const mat = ring.material as THREE.MeshBasicMaterial
        mat.opacity = opacityPulse
      }
    }
    this.feedback.updateQueueIndicators(selectedUnits)
  }

  /** Remove a selection ring at the given index (used when dead units are removed from selection). */
  removeSelectionRingAt(index: number) {
    if (index >= 0 && index < this.selectionRings.length) {
      disposeObject3DDeep(this.selectionRings[index])
      this.selectionRings.splice(index, 1)
    }
  }

  // ==================== Box Select Visual ====================

  /** Render the selection box rectangle on screen. */
  drawSelectionBox(startX: number, startY: number, endX: number, endY: number) {
    const x = Math.min(startX, endX)
    const y = Math.min(startY, endY)
    const w = Math.abs(endX - startX)
    const h = Math.abs(endY - startY)
    this.selBoxEl.style.display = 'block'
    this.selBoxEl.style.left = `${x}px`
    this.selBoxEl.style.top = `${y}px`
    this.selBoxEl.style.width = `${w}px`
    this.selBoxEl.style.height = `${h}px`
  }

  /** Hide the selection box. */
  hideSelectionBox() {
    this.selBoxEl.style.display = 'none'
  }
}
