import * as THREE from 'three'
import { BUILDINGS } from '../GameData'
import type { Unit } from '../UnitTypes'
import { disposeObject3DDeep } from '../../utils/dispose'

export type HealthBarRecord = {
  bg: THREE.Mesh
  fill: THREE.Mesh
}

export class HealthBarRenderer {
  constructor(
    private readonly scene: THREE.Scene,
    private readonly camera: THREE.Camera,
    private readonly bars: Map<Unit, HealthBarRecord>,
  ) {}

  create(unit: Unit) {
    const group = new THREE.Group()
    const barWidth = unit.isBuilding ? 2.0 : unit.type === 'worker' ? 0.95 : 1.2
    const barHeight = unit.type === 'worker' ? 0.10 : 0.14

    const borderGeo = new THREE.PlaneGeometry(barWidth + 0.1, barHeight + 0.1)
    const borderMat = new THREE.MeshBasicMaterial({ color: 0xb09030, side: THREE.DoubleSide, depthTest: false })
    const border = new THREE.Mesh(borderGeo, borderMat)
    group.add(border)

    const bgGeo = new THREE.PlaneGeometry(barWidth, barHeight)
    const bgMat = new THREE.MeshBasicMaterial({ color: 0x1a1208, side: THREE.DoubleSide, depthTest: false })
    const bg = new THREE.Mesh(bgGeo, bgMat)
    bg.position.z = 0.001
    group.add(bg)

    const fillGeo = new THREE.PlaneGeometry(barWidth, barHeight)
    const fillMat = new THREE.MeshBasicMaterial({ color: 0x00cc00, side: THREE.DoubleSide, depthTest: false })
    const fill = new THREE.Mesh(fillGeo, fillMat)
    fill.position.z = 0.002
    group.add(fill)

    group.position.copy(unit.mesh.position)
    group.position.y += this.getHeight(unit)

    this.scene.add(group)
    this.bars.set(unit, { bg, fill })
  }

  update(units: readonly Unit[]) {
    const toDelete: Unit[] = []
    for (const [unit, bars] of this.bars) {
      if (!units.includes(unit)) {
        toDelete.push(unit)
        continue
      }

      const pct = Math.max(0, unit.hp / unit.maxHp)
      const yPos = this.getHeight(unit)

      bars.bg.parent!.position.copy(unit.mesh.position)
      bars.bg.parent!.position.y += yPos
      bars.bg.parent!.quaternion.copy(this.camera.quaternion)

      const halfWidth = unit.isBuilding ? 0.9 : 0.55
      bars.fill.scale.x = pct
      bars.fill.position.x = -(1 - pct) * halfWidth

      const fillMat = bars.fill.material as THREE.MeshBasicMaterial
      fillMat.color.setHex(pct > 0.6 ? 0x00cc00 : pct > 0.3 ? 0xcccc00 : 0xcc0000)
    }

    for (const unit of toDelete) {
      this.remove(unit)
    }
  }

  remove(unit: Unit) {
    const bars = this.bars.get(unit)
    if (!bars) return false

    disposeObject3DDeep(bars.bg.parent!)
    this.bars.delete(unit)
    return true
  }

  flashHit(unit: Unit) {
    const bars = this.bars.get(unit)
    if (!bars) return

    const borderObj = bars.bg.parent?.children[0]
    if (!(borderObj instanceof THREE.Mesh)) return

    const borderMat = borderObj.material as THREE.MeshBasicMaterial | undefined
    if (!borderMat?.color) return

    const origBorder = borderMat.color.getHex()
    borderMat.color.setHex(0xffffff)
    setTimeout(() => { borderMat.color.setHex(origBorder) }, 150)
  }

  private getHeight(unit: Unit): number {
    if (unit.isBuilding) {
      return (BUILDINGS[unit.type]?.size ?? 1) * 0.5 + 0.5
    }

    const visualHeight = unit.mesh.userData.healthBarY
    return typeof visualHeight === 'number' ? visualHeight : 1.6
  }
}
