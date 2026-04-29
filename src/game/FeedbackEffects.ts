import * as THREE from 'three'
import type { Unit } from './UnitTypes'
import { BUILDINGS } from './GameData'
import { disposeObject3DDeep } from '../utils/dispose'

export interface FeedbackEffectSnapshot {
  activeMoveIndicators: number
  activeImpactRings: number
  activeQueueIndicators: number
  activeAbilityEffectBursts: number
  activeAbilityPreviewRings: number
  activeAbilityTargetMarkers: number
  activeAbilityValidTargetMarkers: number
  activeAbilityInvalidTargetMarkers: number
  activeCorpseMarkers: number
  activeEligibleCorpseMarkers: number
  activeResurrectionRadiusRings: number
  totalMoveIndicators: number
  totalAttackMoveIndicators: number
  totalImpactRings: number
  totalDamageNumbers: number
  totalSelectionFlashes: number
  totalHitFlashes: number
  totalBuildCompleteEffects: number
  totalAbilityEffectBursts: number
  totalAbilityPreviewRefreshes: number
  totalAbilityPreviewRingsShown: number
  totalAbilityTargetMarkersShown: number
  totalCorpseMarkerRefreshes: number
}

export type AbilityEffectTone =
  | 'heal'
  | 'shield'
  | 'summon'
  | 'area'
  | 'teleport'
  | 'stun'
  | 'buff'
  | 'debuff'
  | 'resurrection'

/**
 * Feedback and effect helpers extracted from Game.ts.
 *
 * Responsibilities:
 * - move indicators (green ring, yellow queued, red attack-move)
 * - impact rings (hit/build feedback rings)
 * - build-complete visual feedback (scale bounce, emissive flash, rising ring)
 * - hit flash (white flash on damage)
 * - selection flash (brief white flash on unit select)
 * - floating damage numbers
 * - carry indicator (worker resource pack color/visibility)
 * - queue indicators (diamond markers for queued move targets)
 * - ability preview rings and target markers (hero spell range, target area, active targeting)
 * - resurrection corpse markers and radius rings
 *
 * This module owns no gameplay state. It only produces disposable visual
 * effects and reads unit/scene state through injected references.
 */
export class FeedbackEffects {
  private scene: THREE.Scene
  private camera: THREE.PerspectiveCamera
  private getWorldHeight: (wx: number, wz: number) => number

  private moveIndicators: { mesh: THREE.Mesh; life: number }[] = []
  private impactRings: { mesh: THREE.Mesh; life: number; maxLife: number }[] = []
  private queueIndicators: THREE.Mesh[] = []
  private queueIndicatorGeo: THREE.PlaneGeometry | null = null
  private abilityEffectBursts: Array<{
    mesh: THREE.Mesh
    life: number
    maxLife: number
    tone: AbilityEffectTone
  }> = []
  private abilityPreviewRings: THREE.Mesh[] = []
  private abilityPreviewRingGeo: THREE.RingGeometry | null = null
  private abilityTargetMarkers: THREE.Mesh[] = []
  private abilityTargetMarkerGeo: THREE.CircleGeometry | null = null
  private corpseMarkers: THREE.Mesh[] = []
  private corpseMarkerGeo: THREE.RingGeometry | null = null
  private resurrectionRadiusRings: THREE.Mesh[] = []
  private damageNumberGeo: THREE.PlaneGeometry | null = null
  private totalMoveIndicators = 0
  private totalAttackMoveIndicators = 0
  private totalImpactRings = 0
  private totalDamageNumbers = 0
  private totalSelectionFlashes = 0
  private totalHitFlashes = 0
  private totalBuildCompleteEffects = 0
  private totalAbilityEffectBursts = 0
  private totalAbilityPreviewRefreshes = 0
  private totalAbilityPreviewRingsShown = 0
  private totalAbilityTargetMarkersShown = 0
  private totalCorpseMarkerRefreshes = 0

  private findEmissiveMaterial(root: THREE.Object3D): (THREE.Material & { emissive: THREE.Color }) | null {
    let found: (THREE.Material & { emissive: THREE.Color }) | null = null
    root.traverse((obj) => {
      if (found) return
      const mesh = obj as THREE.Mesh
      if (!mesh.isMesh) return
      const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material]
      for (const material of materials) {
        const maybe = material as THREE.Material & { emissive?: THREE.Color }
        if (maybe.emissive instanceof THREE.Color) {
          found = maybe as THREE.Material & { emissive: THREE.Color }
          return
        }
      }
    })
    return found
  }

  constructor(deps: {
    scene: THREE.Scene
    camera: THREE.PerspectiveCamera
    getWorldHeight: (wx: number, wz: number) => number
  }) {
    this.scene = deps.scene
    this.camera = deps.camera
    this.getWorldHeight = deps.getWorldHeight
  }

  // ==================== Move indicators ====================

  showMoveIndicator(wx: number, wz: number) {
    const h = this.getWorldHeight(wx - 0.5, wz - 0.5) + 0.1

    // 外圈（绿色 = 移动）
    const geo = new THREE.RingGeometry(0.3, 0.45, 20)
    geo.rotateX(-Math.PI / 2)
    const mat = new THREE.MeshBasicMaterial({
      color: 0x00cc44, side: THREE.DoubleSide, transparent: true, opacity: 0.85,
      depthTest: false,
    })
    const mesh = new THREE.Mesh(geo, mat)
    mesh.position.set(wx, h, wz)
    mesh.renderOrder = 999
    this.scene.add(mesh)
    this.moveIndicators.push({ mesh, life: 0.7 })

    // 中心圆点
    const dotGeo = new THREE.CircleGeometry(0.08, 8)
    dotGeo.rotateX(-Math.PI / 2)
    const dotMat = new THREE.MeshBasicMaterial({
      color: 0x00cc44, side: THREE.DoubleSide, transparent: true, opacity: 0.85,
      depthTest: false,
    })
    const dot = new THREE.Mesh(dotGeo, dotMat)
    dot.position.set(wx, h + 0.01, wz)
    dot.renderOrder = 999
    this.scene.add(dot)
    this.moveIndicators.push({ mesh: dot, life: 0.7 })
    this.totalMoveIndicators += 2
  }

  showQueuedMoveIndicator(wx: number, wz: number) {
    const h = this.getWorldHeight(wx - 0.5, wz - 0.5) + 0.1

    // 外圈（黄色 = 追加）
    const geo = new THREE.RingGeometry(0.25, 0.38, 16)
    geo.rotateX(-Math.PI / 2)
    const mat = new THREE.MeshBasicMaterial({
      color: 0xeedd44, side: THREE.DoubleSide, transparent: true, opacity: 0.8,
      depthTest: false,
    })
    const mesh = new THREE.Mesh(geo, mat)
    mesh.position.set(wx, h, wz)
    mesh.renderOrder = 999
    this.scene.add(mesh)
    this.moveIndicators.push({ mesh, life: 0.6 })
    this.totalMoveIndicators += 1
  }

  showAttackMoveIndicator(wx: number, wz: number) {
    const h = this.getWorldHeight(wx - 0.5, wz - 0.5) + 0.1

    // 外圈：红色
    const geo1 = new THREE.RingGeometry(0.3, 0.45, 20)
    geo1.rotateX(-Math.PI / 2)
    const mat1 = new THREE.MeshBasicMaterial({
      color: 0xcc2222, side: THREE.DoubleSide, transparent: true, opacity: 0.85,
      depthTest: false,
    })
    const mesh1 = new THREE.Mesh(geo1, mat1)
    mesh1.position.set(wx, h, wz)
    mesh1.renderOrder = 999
    this.scene.add(mesh1)
    this.moveIndicators.push({ mesh: mesh1, life: 0.7 })

    // 十字准心
    const crossMat = new THREE.MeshBasicMaterial({
      color: 0xcc2222, side: THREE.DoubleSide, transparent: true, opacity: 0.7,
      depthTest: false,
    })
    const hGeo = new THREE.PlaneGeometry(0.5, 0.05)
    hGeo.rotateX(-Math.PI / 2)
    const hMesh = new THREE.Mesh(hGeo, crossMat)
    hMesh.position.set(wx, h + 0.02, wz)
    hMesh.renderOrder = 999
    this.scene.add(hMesh)
    this.moveIndicators.push({ mesh: hMesh, life: 0.7 })

    const vGeo = new THREE.PlaneGeometry(0.05, 0.5)
    vGeo.rotateX(-Math.PI / 2)
    const vMesh = new THREE.Mesh(vGeo, crossMat.clone())
    vMesh.position.set(wx, h + 0.02, wz)
    vMesh.renderOrder = 999
    this.scene.add(vMesh)
    this.moveIndicators.push({ mesh: vMesh, life: 0.7 })
    this.totalMoveIndicators += 3
    this.totalAttackMoveIndicators += 1
  }

  updateMoveIndicators(dt: number) {
    for (let i = this.moveIndicators.length - 1; i >= 0; i--) {
      const ind = this.moveIndicators[i]
      ind.life -= dt
      const mat = ind.mesh.material as THREE.MeshBasicMaterial
      mat.opacity = Math.max(0, ind.life / 0.6)
      ind.mesh.scale.setScalar(1 + (1 - ind.life / 0.6) * 0.5)
      if (ind.life <= 0) {
        this.scene.remove(ind.mesh)
        ind.mesh.geometry.dispose()
        mat.dispose()
        this.moveIndicators.splice(i, 1)
      }
    }
  }

  // ==================== Impact rings ====================

  spawnImpactRing(position: THREE.Vector3) {
    const geo = new THREE.RingGeometry(0.0, 0.35, 16)
    geo.rotateX(-Math.PI / 2)
    const mat = new THREE.MeshBasicMaterial({
      color: 0xffdd44,
      transparent: true,
      opacity: 0.85,
      side: THREE.DoubleSide,
      depthTest: false,
    })
    const ring = new THREE.Mesh(geo, mat)
    ring.position.copy(position)
    ring.position.y = 0.08
    ring.renderOrder = 998
    this.scene.add(ring)
    this.impactRings.push({ mesh: ring, life: 0.28, maxLife: 0.28 })
    this.totalImpactRings += 1
  }

  updateImpactRings(dt: number) {
    for (let i = this.impactRings.length - 1; i >= 0; i--) {
      const ir = this.impactRings[i]
      ir.life -= dt
      if (ir.life <= 0) {
        this.scene.remove(ir.mesh)
        disposeObject3DDeep(ir.mesh)
        this.impactRings.splice(i, 1)
        continue
      }
      const t = 1 - (ir.life / ir.maxLife)
      const scale = 0.3 + t * 2.2
      ir.mesh.scale.set(scale, 1, scale)
      const mat = ir.mesh.material as THREE.MeshBasicMaterial
      mat.opacity = 0.85 * (1 - t * t)
    }
  }

  // ==================== Ability effect bursts ====================

  spawnAbilityEffectBurst(input: {
    x: number
    z: number
    tone: AbilityEffectTone
    radius?: number
    opacity?: number
    life?: number
  }) {
    const toneColor: Record<AbilityEffectTone, number> = {
      heal: 0x6fffb6,
      shield: 0xf6e27a,
      summon: 0x62d6ff,
      area: 0x7ac8ff,
      teleport: 0xb77dff,
      stun: 0xffcc4a,
      buff: 0xff9a4a,
      debuff: 0x8ad17a,
      resurrection: 0xf8e37d,
    }
    const radius = Math.max(0.25, input.radius ?? 0.9)
    const geo = new THREE.RingGeometry(radius * 0.45, radius, 32)
    geo.rotateX(-Math.PI / 2)
    const mat = new THREE.MeshBasicMaterial({
      color: toneColor[input.tone],
      side: THREE.DoubleSide,
      transparent: true,
      opacity: input.opacity ?? 0.82,
      depthTest: false,
    })
    const mesh = new THREE.Mesh(geo, mat)
    const height = this.getWorldHeight(input.x - 0.5, input.z - 0.5) + 0.18
    mesh.position.set(input.x, height, input.z)
    mesh.renderOrder = 1001
    this.scene.add(mesh)
    const life = input.life ?? 0.85
    this.abilityEffectBursts.push({ mesh, life, maxLife: life, tone: input.tone })
    this.totalAbilityEffectBursts += 1
  }

  updateAbilityEffectBursts(dt: number) {
    for (let i = this.abilityEffectBursts.length - 1; i >= 0; i--) {
      const effect = this.abilityEffectBursts[i]
      effect.life -= dt
      const t = 1 - Math.max(0, effect.life / effect.maxLife)
      const mat = effect.mesh.material as THREE.MeshBasicMaterial
      effect.mesh.scale.setScalar(1 + t * 1.6)
      mat.opacity = Math.max(0, 0.82 * (1 - t * t))
      if (effect.life <= 0) {
        this.scene.remove(effect.mesh)
        effect.mesh.geometry.dispose()
        mat.dispose()
        this.abilityEffectBursts.splice(i, 1)
      }
    }
  }

  // ==================== Build complete effect ====================

  playBuildCompleteEffect(unit: Unit) {
    this.totalBuildCompleteEffects += 1
    // Scale bounce: 1.0 → 1.12 → 1.0 (快速)
    unit.mesh.scale.setScalar(1.12)
    setTimeout(() => { if (unit.mesh) unit.mesh.scale.setScalar(1.0) }, 120)

    // 完工冲击环
    this.spawnImpactRing(unit.mesh.position)

    // Brightness flash only applies to materials that support emissive color.
    const mat = this.findEmissiveMaterial(unit.mesh)
    if (mat) {
      const origEmissive = mat.emissive.getHex()
      mat.emissive.setHex(0x443300)
      setTimeout(() => { if (mat) mat.emissive.setHex(origEmissive) }, 200)
    }

    // 完成光环：短暂向上扩散的圆环
    const ringGeo = new THREE.RingGeometry(0.3, 1.5, 24)
    ringGeo.rotateX(-Math.PI / 2)
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0xd4a846, side: THREE.DoubleSide, transparent: true, opacity: 0.8,
      depthTest: false,
    })
    const ring = new THREE.Mesh(ringGeo, ringMat)
    const bSize = BUILDINGS[unit.type]?.size ?? 1
    ring.position.copy(unit.mesh.position)
    ring.position.y += bSize * 0.3
    ring.renderOrder = 999
    this.scene.add(ring)
    // 光环动画：向上飘 + 淡出
    const startTime = performance.now()
    const animateRing = () => {
      const elapsed = (performance.now() - startTime) / 1000
      if (elapsed > 0.5) {
        this.scene.remove(ring)
        ringGeo.dispose()
        ringMat.dispose()
        return
      }
      ring.position.y += 0.03
      ringMat.opacity = 0.8 * (1 - elapsed / 0.5)
      ring.scale.setScalar(1 + elapsed * 1.5)
      requestAnimationFrame(animateRing)
    }
    requestAnimationFrame(animateRing)
  }

  // ==================== Hit flash ====================

  /** 受击闪白效果（war3 风格：白色闪烁，短暂明显） */
  flashHit(unit: Unit) {
    const flashMats: Array<{ color: THREE.Color; orig: number }> = []

    unit.mesh.traverse((obj) => {
      if (!(obj instanceof THREE.Mesh)) return
      const materials = Array.isArray(obj.material) ? obj.material : [obj.material]
      for (const mat of materials) {
        if (!mat) continue
        const colored = mat as THREE.Material & { color?: THREE.Color }
        if (colored.color && typeof colored.color.getHex === 'function') {
          flashMats.push({ color: colored.color, orig: colored.color.getHex() })
        }
      }
    })

    if (flashMats.length === 0) return
    this.totalHitFlashes += 1
    for (const entry of flashMats) {
      entry.color.setHex(0xffffff)
    }
    setTimeout(() => {
      for (const entry of flashMats) {
        entry.color.setHex(entry.orig)
      }
    }, 80)
  }

  // ==================== Selection flash ====================

  /** 选中闪光反馈（仅闪第一个有色材质） */
  flashSelection(mesh: THREE.Object3D) {
    const flashMats: Array<{ color: THREE.Color; orig: number }> = []
    mesh.traverse((child) => {
      if (flashMats.length > 0) return
      if (!(child instanceof THREE.Mesh)) return
      const materials = Array.isArray(child.material) ? child.material : [child.material]
      for (const mat of materials) {
        const maybeColored = mat as THREE.Material & { color?: THREE.Color }
        if (maybeColored.color && typeof maybeColored.color.getHex === 'function') {
          flashMats.push({ color: maybeColored.color, orig: maybeColored.color.getHex() })
          break
        }
      }
    })
    for (const entry of flashMats) {
      entry.color.setHex(0xffffff)
    }
    if (flashMats.length > 0) {
      this.totalSelectionFlashes += 1
      setTimeout(() => {
        for (const entry of flashMats) {
          entry.color.setHex(entry.orig)
        }
      }, 100)
    }
  }

  // ==================== Damage numbers ====================

  spawnDamageNumber(target: Unit, damage: number) {
    this.totalDamageNumbers += 1
    // 复用 geometry
    if (!this.damageNumberGeo) {
      this.damageNumberGeo = new THREE.PlaneGeometry(0.45, 0.28)
    }

    const canvas = document.createElement('canvas')
    canvas.width = 64
    canvas.height = 32
    const ctx = canvas.getContext('2d')!
    ctx.font = 'bold 22px monospace'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    // 黑色描边 + 黄色文字
    ctx.strokeStyle = '#000000'
    ctx.lineWidth = 3
    ctx.strokeText(`${damage}`, 32, 16)
    ctx.fillStyle = '#ffcc44'
    ctx.fillText(`${damage}`, 32, 16)

    const texture = new THREE.CanvasTexture(canvas)
    texture.minFilter = THREE.LinearFilter
    const mat = new THREE.MeshBasicMaterial({
      map: texture, transparent: true, depthTest: false, side: THREE.DoubleSide,
    })
    const mesh = new THREE.Mesh(this.damageNumberGeo, mat)

    // 定位在目标头顶
    const yPos = target.isBuilding ? (BUILDINGS[target.type]?.size ?? 1) * 0.5 + 1.0 : 2.0
    mesh.position.copy(target.mesh.position)
    mesh.position.y += yPos
    mesh.position.x += (Math.random() - 0.5) * 0.5
    mesh.renderOrder = 1000
    this.scene.add(mesh)

    // 向上飘 + 淡出
    const startTime = performance.now()
    const duration = 800
    const startY = mesh.position.y
    const animateDmg = () => {
      const elapsed = performance.now() - startTime
      if (elapsed > duration) {
        this.scene.remove(mesh)
        mat.dispose()
        texture.dispose()
        return
      }
      const t = elapsed / duration
      mesh.position.y = startY + t * 0.8
      mat.opacity = 1 - t
      // 朝向摄像机
      mesh.quaternion.copy(this.camera.quaternion)
      requestAnimationFrame(animateDmg)
    }
    requestAnimationFrame(animateDmg)
  }

  // ==================== Carry indicator ====================

  updateCarryIndicator(unit: Unit) {
    if (unit.type !== 'worker') return

    // 查找或创建 carry indicator（worker 背上的资源包）
    let indicator = unit.mesh.getObjectByName('carryIndicator') as THREE.Mesh | undefined
    const carrying = unit.carryAmount > 0 && unit.gatherType

    if (!carrying) {
      if (indicator) indicator.visible = false
      return
    }

    if (!indicator) {
      // 创建资源包 proxy（更大方块，远处可辨）
      const geo = new THREE.BoxGeometry(0.25, 0.22, 0.25)
      const mat = new THREE.MeshLambertMaterial({ color: 0xffdd00 })
      indicator = new THREE.Mesh(geo, mat)
      indicator.name = 'carryIndicator'
      // 放在 worker 肩膀上方（更高更显眼）
      indicator.position.set(0.15, 0.7, -0.1)
      unit.mesh.add(indicator)
    }

    indicator.visible = true
    // 根据 gatherType 切换颜色：gold = 金色, lumber = 木色
    const mat = indicator.material as THREE.MeshLambertMaterial
    if (unit.gatherType === 'gold') {
      mat.color.setHex(0xffdd00)
      mat.emissive.setHex(0x443300)
    } else {
      mat.color.setHex(0x8b6914)
      mat.emissive.setHex(0x1a1000)
    }
  }

  // ==================== Queue indicators ====================

  updateQueueIndicators(selectedUnits: readonly Unit[]) {
    // 收集所有选中单位的队列目标
    const targets: { pos: THREE.Vector3; isAttackMove: boolean }[] = []
    for (const u of selectedUnits) {
      if (!u.isBuilding) {
        for (const cmd of u.moveQueue) {
          targets.push({ pos: cmd.target, isAttackMove: cmd.type === 'attackMove' })
        }
      }
    }

    // 确保有足够的指示器 mesh
    if (!this.queueIndicatorGeo) {
      this.queueIndicatorGeo = new THREE.PlaneGeometry(0.28, 0.28)
    }

    // 添加缺失的
    while (this.queueIndicators.length < targets.length) {
      const mat = new THREE.MeshBasicMaterial({
        color: 0xddcc33, side: THREE.DoubleSide, transparent: true, opacity: 0.65,
        depthTest: false,
      })
      const mesh = new THREE.Mesh(this.queueIndicatorGeo, mat)
      mesh.rotation.x = -Math.PI / 2
      mesh.rotation.z = Math.PI / 4  // 菱形
      mesh.renderOrder = 998
      mesh.visible = false
      this.scene.add(mesh)
      this.queueIndicators.push(mesh)
    }

    // 更新位置和可见性
    for (let i = 0; i < this.queueIndicators.length; i++) {
      if (i < targets.length) {
        const t = targets[i]
        this.queueIndicators[i].position.set(t.pos.x, this.getWorldHeight(t.pos.x - 0.5, t.pos.z - 0.5) + 0.15, t.pos.z)
        this.queueIndicators[i].visible = true
        // 区分颜色：红色=attackMove, 黄色=普通move
        const mat = this.queueIndicators[i].material as THREE.MeshBasicMaterial
        mat.color.setHex(t.isAttackMove ? 0xcc3333 : 0xddcc33)
      } else {
        this.queueIndicators[i].visible = false
      }
    }
  }

  clearQueueIndicators() {
    for (const mesh of this.queueIndicators) {
      this.scene.remove(mesh)
      ;(mesh.material as THREE.Material).dispose()
    }
    this.queueIndicators = []
  }

  // ==================== Ability previews ====================

  updateAbilityPreviews(previews: readonly {
    kind?: string
    x: number
    z: number
    radius: number
    color: number
    opacity?: number
    legalityStatus?: string
  }[]) {
    if (!this.abilityPreviewRingGeo) {
      this.abilityPreviewRingGeo = new THREE.RingGeometry(0.96, 1.0, 48)
      this.abilityPreviewRingGeo.rotateX(-Math.PI / 2)
    }
    if (!this.abilityTargetMarkerGeo) {
      this.abilityTargetMarkerGeo = new THREE.CircleGeometry(0.16, 18)
      this.abilityTargetMarkerGeo.rotateX(-Math.PI / 2)
    }

    while (this.abilityPreviewRings.length < previews.length) {
      const mat = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.22,
        depthTest: false,
      })
      const mesh = new THREE.Mesh(this.abilityPreviewRingGeo, mat)
      mesh.renderOrder = 997
      mesh.visible = false
      this.scene.add(mesh)
      this.abilityPreviewRings.push(mesh)
    }

    for (let i = 0; i < this.abilityPreviewRings.length; i++) {
      const mesh = this.abilityPreviewRings[i]
      const preview = previews[i]
      if (!preview || preview.radius <= 0 || !Number.isFinite(preview.radius)) {
        mesh.visible = false
        continue
      }
      const mat = mesh.material as THREE.MeshBasicMaterial
      const height = this.getWorldHeight(preview.x - 0.5, preview.z - 0.5) + 0.12
      mesh.position.set(preview.x, height, preview.z)
      mesh.scale.set(preview.radius, 1, preview.radius)
      mat.color.setHex(preview.color)
      mat.opacity = preview.opacity ?? 0.22
      mesh.visible = true
    }

    const targetPreviews = previews.filter(preview => preview.kind === 'active-target')
    while (this.abilityTargetMarkers.length < targetPreviews.length) {
      const mat = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.86,
        depthTest: false,
      })
      const mesh = new THREE.Mesh(this.abilityTargetMarkerGeo, mat)
      mesh.renderOrder = 998
      mesh.visible = false
      this.scene.add(mesh)
      this.abilityTargetMarkers.push(mesh)
    }

    for (let i = 0; i < this.abilityTargetMarkers.length; i++) {
      const mesh = this.abilityTargetMarkers[i]
      const preview = targetPreviews[i]
      if (!preview) {
        mesh.visible = false
        mesh.userData.legalityStatus = ''
        continue
      }
      const mat = mesh.material as THREE.MeshBasicMaterial
      const height = this.getWorldHeight(preview.x - 0.5, preview.z - 0.5) + 0.18
      mesh.position.set(preview.x, height, preview.z)
      mesh.scale.setScalar(preview.legalityStatus === 'valid' ? 1.0 : 1.25)
      mat.color.setHex(preview.legalityStatus === 'valid' ? 0x58f080 : 0xff2f2f)
      mat.opacity = preview.legalityStatus === 'valid' ? 0.86 : 0.92
      mesh.userData.legalityStatus = preview.legalityStatus ?? 'valid'
      mesh.visible = true
    }

    if (previews.length > 0) {
      this.totalAbilityPreviewRefreshes += 1
      this.totalAbilityPreviewRingsShown += previews.length
    }
    if (targetPreviews.length > 0) {
      this.totalAbilityTargetMarkersShown += targetPreviews.length
    }
  }

  updateResurrectionReadability(input: {
    corpseMarkers: readonly {
      x: number
      z: number
      color: number
      opacity: number
      eligible: boolean
    }[]
    radiusRings: readonly {
      x: number
      z: number
      radius: number
      color: number
      opacity: number
    }[]
  }) {
    if (!this.corpseMarkerGeo) {
      this.corpseMarkerGeo = new THREE.RingGeometry(0.18, 0.32, 18)
      this.corpseMarkerGeo.rotateX(-Math.PI / 2)
    }
    if (!this.abilityPreviewRingGeo) {
      this.abilityPreviewRingGeo = new THREE.RingGeometry(0.96, 1.0, 48)
      this.abilityPreviewRingGeo.rotateX(-Math.PI / 2)
    }

    while (this.corpseMarkers.length < input.corpseMarkers.length) {
      const mat = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.5,
        depthTest: false,
      })
      const mesh = new THREE.Mesh(this.corpseMarkerGeo, mat)
      mesh.renderOrder = 996
      mesh.visible = false
      this.scene.add(mesh)
      this.corpseMarkers.push(mesh)
    }

    for (let i = 0; i < this.corpseMarkers.length; i++) {
      const mesh = this.corpseMarkers[i]
      const marker = input.corpseMarkers[i]
      if (!marker) {
        mesh.visible = false
        mesh.userData.eligible = false
        continue
      }
      const mat = mesh.material as THREE.MeshBasicMaterial
      const height = this.getWorldHeight(marker.x - 0.5, marker.z - 0.5) + 0.1
      mesh.position.set(marker.x, height, marker.z)
      mesh.scale.setScalar(marker.eligible ? 1.25 : 1.0)
      mat.color.setHex(marker.color)
      mat.opacity = marker.opacity
      mesh.userData.eligible = marker.eligible
      mesh.visible = true
    }

    while (this.resurrectionRadiusRings.length < input.radiusRings.length) {
      const mat = new THREE.MeshBasicMaterial({
        color: 0xf7e070,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.22,
        depthTest: false,
      })
      const mesh = new THREE.Mesh(this.abilityPreviewRingGeo, mat)
      mesh.renderOrder = 995
      mesh.visible = false
      this.scene.add(mesh)
      this.resurrectionRadiusRings.push(mesh)
    }

    for (let i = 0; i < this.resurrectionRadiusRings.length; i++) {
      const mesh = this.resurrectionRadiusRings[i]
      const ring = input.radiusRings[i]
      if (!ring || ring.radius <= 0 || !Number.isFinite(ring.radius)) {
        mesh.visible = false
        continue
      }
      const mat = mesh.material as THREE.MeshBasicMaterial
      const height = this.getWorldHeight(ring.x - 0.5, ring.z - 0.5) + 0.08
      mesh.position.set(ring.x, height, ring.z)
      mesh.scale.set(ring.radius, 1, ring.radius)
      mat.color.setHex(ring.color)
      mat.opacity = ring.opacity
      mesh.visible = true
    }

    if (input.corpseMarkers.length > 0 || input.radiusRings.length > 0) {
      this.totalCorpseMarkerRefreshes += 1
    }
  }

  getSnapshot(): FeedbackEffectSnapshot {
    const activeAbilityTargetMarkers = this.abilityTargetMarkers.filter(mesh => mesh.visible)
    const activeCorpseMarkers = this.corpseMarkers.filter(mesh => mesh.visible)
    return {
      activeMoveIndicators: this.moveIndicators.length,
      activeImpactRings: this.impactRings.length,
      activeQueueIndicators: this.queueIndicators.filter(mesh => mesh.visible).length,
      activeAbilityEffectBursts: this.abilityEffectBursts.length,
      activeAbilityPreviewRings: this.abilityPreviewRings.filter(mesh => mesh.visible).length,
      activeAbilityTargetMarkers: activeAbilityTargetMarkers.length,
      activeAbilityValidTargetMarkers: activeAbilityTargetMarkers.filter(mesh => mesh.userData.legalityStatus === 'valid').length,
      activeAbilityInvalidTargetMarkers: activeAbilityTargetMarkers.filter(mesh => mesh.userData.legalityStatus !== 'valid').length,
      activeCorpseMarkers: activeCorpseMarkers.length,
      activeEligibleCorpseMarkers: activeCorpseMarkers.filter(mesh => mesh.userData.eligible).length,
      activeResurrectionRadiusRings: this.resurrectionRadiusRings.filter(mesh => mesh.visible).length,
      totalMoveIndicators: this.totalMoveIndicators,
      totalAttackMoveIndicators: this.totalAttackMoveIndicators,
      totalImpactRings: this.totalImpactRings,
      totalDamageNumbers: this.totalDamageNumbers,
      totalSelectionFlashes: this.totalSelectionFlashes,
      totalHitFlashes: this.totalHitFlashes,
      totalBuildCompleteEffects: this.totalBuildCompleteEffects,
      totalAbilityEffectBursts: this.totalAbilityEffectBursts,
      totalAbilityPreviewRefreshes: this.totalAbilityPreviewRefreshes,
      totalAbilityPreviewRingsShown: this.totalAbilityPreviewRingsShown,
      totalAbilityTargetMarkersShown: this.totalAbilityTargetMarkersShown,
      totalCorpseMarkerRefreshes: this.totalCorpseMarkerRefreshes,
    }
  }
}
