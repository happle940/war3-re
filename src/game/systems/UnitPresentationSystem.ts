import * as THREE from 'three'
import { UnitState } from '../GameData'
import type { Unit } from '../UnitTypes'

export type UnitPresentationState =
  | 'idle'
  | 'moving'
  | 'attacking'
  | 'casting'
  | 'status'
  | 'dead'
  | 'building'

export type UnitPresentationStateCounts = Record<UnitPresentationState, number>

export interface UnitPresentationEntry {
  meshId: number
  type: string
  team: number
  state: UnitPresentationState
  animated: boolean
  presentationRoute: UnitPresentationRoute
  clipName: string | null
}

export type UnitPresentationRoute =
  | 'clip'
  | 'procedural-no-clips'
  | 'procedural-no-matching-clip'
  | 'static-building'

export interface UnitPresentationSnapshot {
  animatedUnitCount: number
  aliveUnitCount: number
  availableClipUnitCount: number
  clipBackedUnitCount: number
  proceduralFallbackUnitCount: number
  movingUnitCount: number
  attackingUnitCount: number
  castingUnitCount: number
  statusAnimatedCount: number
  buildingUnitCount: number
  deathPoseCount: number
  totalAnimationTicks: number
  availableClipNames: string[]
  stateCounts: UnitPresentationStateCounts
  entries: UnitPresentationEntry[]
}

interface PresentationBase {
  y: number
  rotationZ: number
  scaleX: number
  scaleY: number
  scaleZ: number
}

interface AnimationRuntime {
  root: THREE.Object3D
  mixer: THREE.AnimationMixer
  currentAction: THREE.AnimationAction | null
  currentClipName: string | null
}

const PRESENTATION_BASE_KEY = 'war3PresentationBase'

const CLIP_HINTS: Record<UnitPresentationState, string[]> = {
  idle: ['idle', 'stand'],
  moving: ['walk', 'run', 'move'],
  attacking: ['attack', 'swing', 'shoot', 'strike'],
  casting: ['cast', 'spell', 'channel', 'ability'],
  status: ['cast', 'spell', 'channel', 'buff', 'ability'],
  dead: ['death', 'die', 'dead'],
  building: [],
}

function emptyStateCounts(): UnitPresentationStateCounts {
  return {
    idle: 0,
    moving: 0,
    attacking: 0,
    casting: 0,
    status: 0,
    dead: 0,
    building: 0,
  }
}

function emptySnapshot(): UnitPresentationSnapshot {
  return {
    animatedUnitCount: 0,
    aliveUnitCount: 0,
    availableClipUnitCount: 0,
    clipBackedUnitCount: 0,
    proceduralFallbackUnitCount: 0,
    movingUnitCount: 0,
    attackingUnitCount: 0,
    castingUnitCount: 0,
    statusAnimatedCount: 0,
    buildingUnitCount: 0,
    deathPoseCount: 0,
    totalAnimationTicks: 0,
    availableClipNames: [],
    stateCounts: emptyStateCounts(),
    entries: [],
  }
}

function getPresentationRoot(unit: Unit): THREE.Object3D {
  return unit.mesh.children[0] ?? unit.mesh
}

function ensureBase(root: THREE.Object3D): PresentationBase {
  const existing = root.userData[PRESENTATION_BASE_KEY] as PresentationBase | undefined
  if (existing) return existing
  const base: PresentationBase = {
    y: root.position.y,
    rotationZ: root.rotation.z,
    scaleX: root.scale.x,
    scaleY: root.scale.y,
    scaleZ: root.scale.z,
  }
  root.userData[PRESENTATION_BASE_KEY] = base
  return base
}

function getUnitAnimationClips(unit: Unit): THREE.AnimationClip[] {
  const clips = unit.mesh.userData.assetAnimations
  if (!Array.isArray(clips)) return []
  return clips.filter((clip): clip is THREE.AnimationClip =>
    !!clip &&
    typeof clip.name === 'string' &&
    typeof clip.duration === 'number' &&
    Array.isArray(clip.tracks),
  )
}

function normalizeClipName(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]/g, '')
}

function selectClipForState(clips: readonly THREE.AnimationClip[], state: UnitPresentationState): THREE.AnimationClip | null {
  const hints = CLIP_HINTS[state]
  if (hints.length === 0) return null
  const named = clips.map(clip => ({ clip, normalized: normalizeClipName(clip.name) }))
  for (const hint of hints) {
    const normalizedHint = normalizeClipName(hint)
    const match = named.find(candidate => candidate.normalized.includes(normalizedHint))
    if (match) return match.clip
  }
  return null
}

function resetPose(root: THREE.Object3D, base: PresentationBase) {
  root.position.y = base.y
  root.rotation.z = base.rotationZ
  root.scale.set(base.scaleX, base.scaleY, base.scaleZ)
}

function classifyUnit(unit: Unit, gameTime: number): UnitPresentationState {
  if (unit.isDead || unit.hp <= 0) return 'dead'
  if (unit.isBuilding) return 'building'
  if (unit.abilityFeedbackUntil > gameTime) {
    return 'casting'
  }
  if (
    unit.divineShieldUntil > gameTime ||
    unit.avatarUntil > gameTime ||
    unit.stunUntil > gameTime ||
    unit.slowUntil > gameTime ||
    unit.rallyCallBoostUntil > gameTime ||
    unit.defendActive
  ) {
    return 'status'
  }
  if (unit.attackTarget || unit.state === UnitState.Attacking || unit.state === UnitState.AttackMove) {
    return 'attacking'
  }
  if (
    unit.state === UnitState.Moving ||
    unit.state === UnitState.MovingToGather ||
    unit.state === UnitState.MovingToReturn ||
    unit.state === UnitState.MovingToBuild ||
    !!unit.moveTarget ||
    unit.waypoints.length > 0
  ) {
    return 'moving'
  }
  return 'idle'
}

function stateIsAnimated(state: UnitPresentationState) {
  return state !== 'building'
}

function applyPose(root: THREE.Object3D, base: PresentationBase, state: UnitPresentationState, time: number, phase: number) {
  resetPose(root, base)

  const t = time + phase
  if (state === 'building') return
  if (state === 'dead') {
    root.position.y = base.y - 0.04
    root.rotation.z = base.rotationZ + 0.28
    root.scale.set(base.scaleX * 0.98, base.scaleY * 0.98, base.scaleZ * 0.98)
    return
  }
  if (state === 'moving') {
    root.position.y = base.y + Math.abs(Math.sin(t * 12)) * 0.045
    root.rotation.z = base.rotationZ + Math.sin(t * 10) * 0.055
    return
  }
  if (state === 'attacking') {
    const swing = Math.max(0, Math.sin(t * 18))
    root.position.y = base.y + swing * 0.025
    root.rotation.z = base.rotationZ + Math.sin(t * 18) * 0.085
    root.scale.set(base.scaleX * (1 + swing * 0.035), base.scaleY, base.scaleZ * (1 - swing * 0.025))
    return
  }
  if (state === 'casting' || state === 'status') {
    root.position.y = base.y + 0.03 + Math.sin(t * 7) * 0.012
    root.rotation.z = base.rotationZ + Math.sin(t * 5) * 0.035
    return
  }
  root.position.y = base.y + Math.sin(t * 2.4) * 0.01
}

export class UnitPresentationSystem {
  private totalAnimationTicks = 0
  private lastSnapshot: UnitPresentationSnapshot = emptySnapshot()
  private runtimes = new WeakMap<Unit, AnimationRuntime>()

  private getRuntime(unit: Unit): AnimationRuntime {
    const existing = this.runtimes.get(unit)
    if (existing && existing.root === unit.mesh) return existing
    const runtime: AnimationRuntime = {
      root: unit.mesh,
      mixer: new THREE.AnimationMixer(unit.mesh),
      currentAction: null,
      currentClipName: null,
    }
    this.runtimes.set(unit, runtime)
    return runtime
  }

  private stopRuntime(runtime: AnimationRuntime) {
    if (!runtime.currentAction) return
    runtime.currentAction.stop()
    runtime.currentAction = null
    runtime.currentClipName = null
  }

  private playClip(unit: Unit, clip: THREE.AnimationClip, state: UnitPresentationState, dt: number) {
    const runtime = this.getRuntime(unit)
    if (runtime.currentClipName !== clip.name) {
      if (runtime.currentAction) runtime.currentAction.stop()
      const action = runtime.mixer.clipAction(clip)
      action.enabled = true
      if (state === 'dead') {
        action.setLoop(THREE.LoopOnce, 1)
        action.clampWhenFinished = true
      } else {
        action.setLoop(THREE.LoopRepeat, Infinity)
        action.clampWhenFinished = false
      }
      action.reset()
      action.play()
      runtime.currentAction = action
      runtime.currentClipName = clip.name
    }
    runtime.mixer.update(Math.max(0, dt))
  }

  update(units: readonly Unit[], dt: number, gameTime: number) {
    const stateCounts = emptyStateCounts()
    const entries: UnitPresentationEntry[] = []
    const availableClipNames = new Set<string>()
    let animatedUnitCount = 0
    let aliveUnitCount = 0
    let availableClipUnitCount = 0
    let clipBackedUnitCount = 0
    let proceduralFallbackUnitCount = 0
    let movingUnitCount = 0
    let attackingUnitCount = 0
    let castingUnitCount = 0
    let statusAnimatedCount = 0
    let buildingUnitCount = 0
    let deathPoseCount = 0

    for (const unit of units) {
      const state = classifyUnit(unit, gameTime)
      const animated = stateIsAnimated(state)
      const root = getPresentationRoot(unit)
      const base = ensureBase(root)
      const clips = getUnitAnimationClips(unit)
      const clip = selectClipForState(clips, state)
      const phase = unit.mesh.id * 0.37
      let presentationRoute: UnitPresentationRoute = 'static-building'
      let clipName: string | null = null

      if (clips.length > 0) {
        availableClipUnitCount += 1
        for (const availableClip of clips) availableClipNames.add(availableClip.name)
      }

      if (clip) {
        resetPose(root, base)
        this.playClip(unit, clip, state, dt)
        presentationRoute = 'clip'
        clipName = clip.name
        clipBackedUnitCount += 1
      } else {
        const runtime = this.runtimes.get(unit)
        if (runtime) this.stopRuntime(runtime)
        applyPose(root, base, state, gameTime, phase)
        if (state === 'building') presentationRoute = 'static-building'
        else {
          presentationRoute = clips.length > 0 ? 'procedural-no-matching-clip' : 'procedural-no-clips'
          proceduralFallbackUnitCount += 1
        }
      }

      stateCounts[state] += 1
      if (!unit.isDead && unit.hp > 0 && !unit.isBuilding) aliveUnitCount += 1
      if (animated) animatedUnitCount += 1
      if (state === 'moving') movingUnitCount += 1
      if (state === 'attacking') attackingUnitCount += 1
      if (state === 'casting') castingUnitCount += 1
      if (state === 'status') statusAnimatedCount += 1
      if (state === 'building') buildingUnitCount += 1
      if (state === 'dead') deathPoseCount += 1
      entries.push({
        meshId: unit.mesh.id,
        type: unit.type,
        team: unit.team,
        state,
        animated,
        presentationRoute,
        clipName,
      })
    }

    if (animatedUnitCount > 0 && dt > 0) this.totalAnimationTicks += 1

    this.lastSnapshot = {
      animatedUnitCount,
      aliveUnitCount,
      availableClipUnitCount,
      clipBackedUnitCount,
      proceduralFallbackUnitCount,
      movingUnitCount,
      attackingUnitCount,
      castingUnitCount,
      statusAnimatedCount,
      buildingUnitCount,
      deathPoseCount,
      totalAnimationTicks: this.totalAnimationTicks,
      availableClipNames: [...availableClipNames].sort(),
      stateCounts,
      entries,
    }
  }

  getSnapshot(): UnitPresentationSnapshot {
    return {
      ...this.lastSnapshot,
      availableClipNames: [...this.lastSnapshot.availableClipNames],
      stateCounts: { ...this.lastSnapshot.stateCounts },
      entries: this.lastSnapshot.entries.map(entry => ({ ...entry })),
    }
  }
}
