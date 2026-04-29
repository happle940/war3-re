import type { MapRuntime } from '../../map/MapRuntime'
import type { Unit } from '../UnitTypes'

export type MinimapRenderState = {
  mapRuntime: MapRuntime
  units: readonly Unit[]
  cameraTarget: { x: number; z: number }
  cameraZoom: number
  showFog?: boolean
  visibility?: {
    isVisiblePoint: (x: number, z: number) => boolean
    isExploredPoint: (x: number, z: number) => boolean
  }
  objectives?: readonly {
    key: string
    tone: string
    targetX: number | null
    targetZ: number | null
  }[]
}

export class MinimapPresenter {
  constructor(private readonly canvas: HTMLCanvasElement | null) {}

  render(state: MinimapRenderState) {
    if (!this.canvas) return

    const ctx = this.canvas.getContext('2d')!
    const w = this.canvas.width
    const h = this.canvas.height
    const sx = w / state.mapRuntime.width
    const sz = h / state.mapRuntime.height

    ctx.fillStyle = '#111'
    ctx.fillRect(0, 0, w, h)

    const imageData = ctx.createImageData(w, h)
    state.mapRuntime.renderMinimap(imageData.data, w, h)
    ctx.putImageData(imageData, 0, 0)

    for (const unit of state.units) {
      if (state.visibility && unit.team !== 0 &&
        !state.visibility.isVisiblePoint(unit.mesh.position.x, unit.mesh.position.z)) {
        continue
      }
      ctx.fillStyle = unit.team === 0 ? '#4488ff' : unit.team === 1 ? '#ff4444' : '#ffd700'
      const px = unit.mesh.position.x * sx
      const pz = unit.mesh.position.z * sz
      const size = unit.isBuilding ? 3 : 2
      ctx.fillRect(px - size / 2, pz - size / 2, size, size)
    }

    const objectiveColor = (tone: string) => {
      if (tone === 'base') return '#7fb7ff'
      if (tone === 'economy') return '#f1dc8d'
      if (tone === 'lumber') return '#7fcf6f'
      if (tone === 'map') return '#72d18c'
      if (tone === 'shop') return '#75d6d6'
      if (tone === 'attack') return '#ff7a5f'
      return '#eee1b5'
    }

    for (const objective of state.objectives ?? []) {
      if (objective.targetX === null || objective.targetZ === null) continue
      if (state.visibility && !state.visibility.isExploredPoint(objective.targetX, objective.targetZ)) continue
      const px = objective.targetX * sx
      const pz = objective.targetZ * sz
      ctx.save()
      ctx.strokeStyle = objectiveColor(objective.tone)
      ctx.lineWidth = objective.key === 'enemyBase' ? 2 : 1.5
      ctx.beginPath()
      ctx.arc(px, pz, objective.key === 'enemyBase' ? 5 : 4, 0, Math.PI * 2)
      ctx.stroke()
      ctx.restore()
    }

    if (state.showFog && state.visibility) {
      const cellW = Math.max(1, Math.ceil(w / state.mapRuntime.width))
      const cellH = Math.max(1, Math.ceil(h / state.mapRuntime.height))
      for (let z = 0; z < state.mapRuntime.height; z++) {
        for (let x = 0; x < state.mapRuntime.width; x++) {
          const visible = state.visibility.isVisiblePoint(x + 0.5, z + 0.5)
          if (visible) continue
          const explored = state.visibility.isExploredPoint(x + 0.5, z + 0.5)
          ctx.fillStyle = explored ? 'rgba(0,0,0,0.32)' : 'rgba(0,0,0,0.74)'
          ctx.fillRect(Math.floor(x * sx), Math.floor(z * sz), cellW, cellH)
        }
      }
    }

    ctx.strokeStyle = '#fff'
    ctx.lineWidth = 1
    ctx.strokeRect(
      (state.cameraTarget.x - state.cameraZoom) * sx,
      (state.cameraTarget.z - state.cameraZoom) * sz,
      state.cameraZoom * 2 * sx,
      state.cameraZoom * 2 * sz,
    )
  }

  getWorldPointFromEvent(e: MouseEvent, mapRuntime: MapRuntime) {
    if (!this.canvas) return null

    const rect = this.canvas.getBoundingClientRect()
    const cx = e.clientX - rect.left
    const cy = e.clientY - rect.top
    return {
      x: (cx / this.canvas.width) * mapRuntime.width,
      z: (cy / this.canvas.height) * mapRuntime.height,
    }
  }
}
