import * as THREE from 'three'
import type { Unit } from './Game'
import { BUILDINGS } from './GameData'
import { disposeObject3DDeep } from '../utils/dispose'

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
  private damageNumberGeo: THREE.PlaneGeometry | null = null

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

  // ==================== Build complete effect ====================

  playBuildCompleteEffect(unit: Unit) {
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
      setTimeout(() => {
        for (const entry of flashMats) {
          entry.color.setHex(entry.orig)
        }
      }, 100)
    }
  }

  // ==================== Damage numbers ====================

  spawnDamageNumber(target: Unit, damage: number) {
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
}
