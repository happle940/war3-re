import { BUILDINGS, UNITS } from '../GameData'
import type { Unit } from '../UnitTypes'

export interface VisibilitySnapshot {
  width: number
  height: number
  visibleCells: number
  exploredCells: number
  visiblePct: number
  exploredPct: number
  observerCount: number
}

export class VisibilitySystem {
  private width: number
  private height: number
  private visible: Uint8Array
  private explored: Uint8Array
  private observerCount = 0

  constructor(width: number, height: number) {
    this.width = width
    this.height = height
    this.visible = new Uint8Array(width * height)
    this.explored = new Uint8Array(width * height)
  }

  resize(width: number, height: number) {
    this.width = Math.max(1, Math.floor(width))
    this.height = Math.max(1, Math.floor(height))
    this.visible = new Uint8Array(this.width * this.height)
    this.explored = new Uint8Array(this.width * this.height)
    this.observerCount = 0
  }

  reset() {
    this.visible.fill(0)
    this.explored.fill(0)
    this.observerCount = 0
  }

  update(units: readonly Unit[], team = 0) {
    this.visible.fill(0)
    this.observerCount = 0

    for (const unit of units) {
      if (unit.team !== team || unit.hp <= 0 || unit.isDead) continue
      this.observerCount++
      const sight = this.getSightRange(unit)
      this.markVisibleCircle(unit.mesh.position.x, unit.mesh.position.z, sight)
    }
  }

  isVisiblePoint(x: number, z: number) {
    return this.getCell(this.visible, x, z) > 0
  }

  isExploredPoint(x: number, z: number) {
    return this.getCell(this.explored, x, z) > 0
  }

  getSnapshot(): VisibilitySnapshot {
    let visibleCells = 0
    let exploredCells = 0
    for (let i = 0; i < this.visible.length; i++) {
      if (this.visible[i]) visibleCells++
      if (this.explored[i]) exploredCells++
    }
    const total = Math.max(1, this.width * this.height)
    return {
      width: this.width,
      height: this.height,
      visibleCells,
      exploredCells,
      visiblePct: visibleCells / total,
      exploredPct: exploredCells / total,
      observerCount: this.observerCount,
    }
  }

  private getSightRange(unit: Unit) {
    if (unit.isBuilding) {
      return unit.type === 'tower' ? 14 : BUILDINGS[unit.type] ? 10 : 8
    }
    return UNITS[unit.type]?.sightRange ?? 8
  }

  private markVisibleCircle(x: number, z: number, radius: number) {
    const minX = Math.max(0, Math.floor(x - radius))
    const maxX = Math.min(this.width - 1, Math.ceil(x + radius))
    const minZ = Math.max(0, Math.floor(z - radius))
    const maxZ = Math.min(this.height - 1, Math.ceil(z + radius))
    const r2 = radius * radius

    for (let cz = minZ; cz <= maxZ; cz++) {
      for (let cx = minX; cx <= maxX; cx++) {
        const dx = cx + 0.5 - x
        const dz = cz + 0.5 - z
        if (dx * dx + dz * dz > r2) continue
        const idx = cz * this.width + cx
        this.visible[idx] = 1
        this.explored[idx] = 1
      }
    }
  }

  private getCell(cells: Uint8Array, x: number, z: number) {
    const cx = Math.floor(x)
    const cz = Math.floor(z)
    if (cx < 0 || cz < 0 || cx >= this.width || cz >= this.height) return 0
    return cells[cz * this.width + cx]
  }
}
