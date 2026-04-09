import * as THREE from 'three'
import { Terrain, TileType } from './Terrain'
import type { W3ETerrain } from './W3XParser'

/**
 * 当前地图的统一查询接口
 *
 * 无论加载的是旧程序化地形还是 W3X 真实地图，
 * 游戏代码都通过这里查询地图信息。
 * 消除"部分读旧 Terrain、部分读 w3xTerrain"的分裂问题。
 */
export class MapRuntime {
  private terrain: Terrain
  private w3x: W3ETerrain | null = null
  private heightScale = 3.0

  constructor(terrain: Terrain) {
    this.terrain = terrain
  }

  /** 加载 W3X 地形数据后调用，此后所有查询基于 W3X */
  loadW3X(w3x: W3ETerrain) {
    this.w3x = w3x
  }

  /** 重置回旧程序化地形（用于 cleanup） */
  reset() {
    this.w3x = null
  }

  // ===== 地图尺寸 =====

  get width(): number {
    return this.w3x ? this.w3x.width : this.terrain.width
  }

  get height(): number {
    return this.w3x ? this.w3x.height : this.terrain.height
  }

  // ===== 高度查询 =====

  getHeight(wx: number, wz: number): number {
    if (this.w3x) {
      const x = Math.floor(wx)
      const z = Math.floor(wz)
      if (x < 0 || x >= this.w3x.width || z < 0 || z >= this.w3x.height) return 0
      return this.w3x.groundHeight[z * this.w3x.width + x] * this.heightScale
    }
    return this.terrain.getHeight(wx, wz)
  }

  // ===== 地块信息 =====

  getTileInfo(wx: number, wz: number): { tx: number; tz: number; name: string } {
    const tx = Math.floor(wx)
    const tz = Math.floor(wz)

    if (this.w3x) {
      const x = Math.max(0, Math.min(tx, this.w3x.width - 1))
      const z = Math.max(0, Math.min(tz, this.w3x.height - 1))
      const idx = z * this.w3x.width + x
      const gt = this.w3x.groundType[idx] % 16
      const isWater = (this.w3x.flags[idx] & 0x04) !== 0
      const name = isWater ? '水' : TILE_NAMES[gt] ?? `地块${gt}`
      return { tx, tz, name }
    }

    const tile = this.terrain.getTile(tx, tz)
    const names = ['草地', '深草', '泥地', '石头', '水', '沙地', '压实地面', '矿区']
    return { tx, tz, name: names[tile] ?? '?' }
  }

  // ===== 小地图数据 =====

  /** 生成小地图的像素数据（RGBA），写入目标 Uint8ClampedArray */
  renderMinimap(buf: Uint8ClampedArray, imgW: number, imgH: number) {
    const mw = this.width
    const mh = this.height

    if (this.w3x) {
      // W3X 小地图：基于 groundType + flags
      for (let py = 0; py < imgH; py++) {
        for (let px = 0; px < imgW; px++) {
          const mx = Math.floor((px / imgW) * mw)
          const mz = Math.floor((py / imgH) * mh)
          const idx = Math.min(mz, mh - 1) * mw + Math.min(mx, mw - 1)
          const isBoundary = (this.w3x.flags[idx] & 0x40) !== 0
          const isWater = (this.w3x.flags[idx] & 0x04) !== 0
          const gt = this.w3x.groundType[idx] % 16
          const color = isBoundary ? [0x1a, 0x1a, 0x2e] : isWater ? [0x3a, 0x7a, 0xb8] : TILE_COLORS[gt]
          const off = (py * imgW + px) * 4
          buf[off] = color[0]; buf[off + 1] = color[1]; buf[off + 2] = color[2]; buf[off + 3] = 255
        }
      }
    } else {
      // 旧程序化地形小地图（war3 风格增强对比）
      const colorMap: Record<number, number[]> = {
        [TileType.Grass]: [0x5a, 0x9a, 0x48],
        [TileType.DarkGrass]: [0x2e, 0x54, 0x24],
        [TileType.Dirt]: [0x9a, 0x80, 0x58],
        [TileType.LightDirt]: [0xc8, 0xa8, 0x70],  // 更亮：建筑区更醒目
        [TileType.Stone]: [0x8a, 0x80, 0x70],
        [TileType.DarkStone]: [0x60, 0x60, 0x55],  // 矿区稍亮，更可辨
        [TileType.Water]: [0x2a, 0x55, 0x80],
        [TileType.Sand]: [0xc2, 0xb2, 0x80],
      }
      for (let py = 0; py < imgH; py++) {
        for (let px = 0; px < imgW; px++) {
          const mx = Math.floor((px / imgW) * this.terrain.width)
          const mz = Math.floor((py / imgH) * this.terrain.height)
          const tile = this.terrain.getTile(mx, mz)
          const c = colorMap[tile] ?? [0x4a, 0x7c, 0x3f]
          const off = (py * imgW + px) * 4
          buf[off] = c[0]; buf[off + 1] = c[1]; buf[off + 2] = c[2]; buf[off + 3] = 255
        }
      }
    }
  }

  // ===== 机器可读地块查询 =====

  /** tile 坐标是否在地图边界内 */
  isInsideBounds(tx: number, tz: number): boolean {
    return tx >= 0 && tz >= 0 && tx < this.width && tz < this.height
  }

  /** tile 是否是水面（越界视为不可通行） */
  isWaterTile(tx: number, tz: number): boolean {
    if (!this.isInsideBounds(tx, tz)) return true
    if (this.w3x) {
      const idx = tz * this.w3x.width + tx
      return (this.w3x.flags[idx] & 0x04) !== 0
    }
    return this.terrain.getTile(tx, tz) === TileType.Water
  }

  /** tile 是否是地图边界（W3X flag 0x40） */
  isBoundaryTile(tx: number, tz: number): boolean {
    if (!this.isInsideBounds(tx, tz)) return true
    if (this.w3x) {
      const idx = tz * this.w3x.width + tx
      return (this.w3x.flags[idx] & 0x40) !== 0
    }
    return false
  }

  /** tile 地形是否可通行（不含建筑占用，仅地形语义） */
  isWalkableTerrain(tx: number, tz: number): boolean {
    if (!this.isInsideBounds(tx, tz)) return false
    return !this.isWaterTile(tx, tz) && !this.isBoundaryTile(tx, tz)
  }

  /** tile 地形是否可放建筑（当前等同可通行，未来可分化坡度等规则） */
  isBuildableTerrain(tx: number, tz: number): boolean {
    return this.isWalkableTerrain(tx, tz)
  }

  // ===== 坐标转换 =====

  worldToTile(wx: number, wz: number): [number, number] {
    return [Math.floor(wx), Math.floor(wz)]
  }
}

// W3X 地块颜色（RGB 三元组）
const TILE_COLORS: Record<number, number[]> = {
  0: [0x8b, 0x73, 0x55],  // 泥地
  1: [0x3a, 0x66, 0x30],  // 深草
  2: [0x9b, 0x85, 0x65],  // 浅泥地
  3: [0x7b, 0x9b, 0x5a],  // 浅草
  4: [0x5a, 0x9c, 0x3f],  // 草地
  5: [0x80, 0x80, 0x60],  // 石地
  6: [0x3a, 0x6a, 0x2f],  // 暗草
  7: [0x8a, 0x9b, 0x65],  // 稀草地
  8: [0x5a, 0x7a, 0x40],  // 灌木
  9: [0x7a, 0x9a, 0x55],  // 原野
  10: [0x6a, 0x7a, 0x45], // 苔地
  11: [0x9a, 0xaa, 0x65], // 高草
  12: [0x3a, 0x6a, 0x35], // 森林
  13: [0x5a, 0x7a, 0x40], // 草原
  14: [0x9a, 0x8a, 0x50], // 干草
  15: [0x7a, 0x6a, 0x45], // 稀泥
}

const TILE_NAMES: Record<number, string> = {
  0: '泥地', 1: '深草', 2: '浅泥地', 3: '浅草',
  4: '草地', 5: '石地', 6: '暗草', 7: '稀草地',
  8: '灌木', 9: '原野', 10: '苔地', 11: '高草',
  12: '森林', 13: '草原', 14: '干草', 15: '稀泥',
}
