import * as THREE from 'three'

/** 地形贴片类型 */
export const enum TileType {
  Grass      = 0,
  DarkGrass  = 1,
  Dirt       = 2,
  Stone      = 3,
  Water      = 4,
  Sand       = 5,
  LightDirt  = 6,  // 基地核心压实地面（更亮）
  DarkStone  = 7,  // 矿区石质地面（更深）
}

/** 地形颜色表 — war3 暖色调，空间分区更可读 */
const TILE_COLORS: Record<number, number> = {
  [TileType.Grass]:     0x5a9a48,
  [TileType.DarkGrass]: 0x2e5424,
  [TileType.Dirt]:      0x9a8058,
  [TileType.LightDirt]: 0xc8a870,  // 更亮：建筑区更醒目
  [TileType.Stone]:     0x8a8070,
  [TileType.DarkStone]: 0x606058,  // 稍亮：矿区可辨
  [TileType.Water]:     0x2a5580,
  [TileType.Sand]:      0xc2b280,
}

/**
 * 地形系统
 *
 * 使用 InstancedMesh 高效渲染大量贴片。
 * 64x64 地图 = 4096 个实例，只有 1 次 draw call。
 */
export class Terrain {
  readonly width: number
  readonly height: number
  readonly mesh: THREE.InstancedMesh
  readonly tileData: Uint8Array

  /** 用于鼠标射线检测的不可见地面 */
  groundPlane: THREE.Mesh

  constructor(width: number, height: number) {
    this.width = width
    this.height = height
    this.tileData = new Uint8Array(width * height)

    this.generate()

    // ---- 创建 InstancedMesh ----
    const tileGeo = new THREE.PlaneGeometry(1, 1)
    tileGeo.rotateX(-Math.PI / 2) // 水平放置

    const tileMat = new THREE.MeshLambertMaterial({ color: 0xffffff })

    this.mesh = new THREE.InstancedMesh(tileGeo, tileMat, width * height)
    this.mesh.receiveShadow = true

    const dummy = new THREE.Object3D()
    const color = new THREE.Color()

    for (let z = 0; z < height; z++) {
      for (let x = 0; x < width; x++) {
        const idx = z * width + x

        // 简单起伏地形
        const h = this.getHeight(x, z)
        dummy.position.set(x + 0.5, h, z + 0.5)
        dummy.updateMatrix()
        this.mesh.setMatrixAt(idx, dummy.matrix)

        // 地块颜色
        color.setHex(TILE_COLORS[this.tileData[idx]] ?? 0x4a7c3f)
        // 加一点随机色彩变化（幅度减小，减少"测试板"感）
        color.offsetHSL(0, (Math.random() - 0.5) * 0.02, (Math.random() - 0.5) * 0.025)
        this.mesh.setColorAt(idx, color)
      }
    }

    this.mesh.instanceMatrix.needsUpdate = true
    if (this.mesh.instanceColor) this.mesh.instanceColor.needsUpdate = true

    // ---- 不可见地面（用于射线检测）----
    const groundGeo = new THREE.PlaneGeometry(width, height)
    groundGeo.rotateX(-Math.PI / 2)
    const groundMat = new THREE.MeshBasicMaterial({ visible: false })
    this.groundPlane = new THREE.Mesh(groundGeo, groundMat)
    this.groundPlane.position.set(width / 2, 0, height / 2)
  }

  /** 简单的正弦叠加地形高度 */
  getHeight(x: number, z: number): number {
    return (
      Math.sin(x * 0.1) * Math.cos(z * 0.1) * 0.3 +
      Math.sin(x * 0.05 + 1) * Math.cos(z * 0.07 + 2) * 0.5
    )
  }

  /** 程序化生成地形数据 — war3 风格空间组织（v0.3 重建） */
  private generate() {
    for (let z = 0; z < this.height; z++) {
      for (let x = 0; x < this.width; x++) {
        const idx = z * this.width + x

        // 边缘用水（地图边界）
        const edgeDist = Math.min(x, z, this.width - 1 - x, this.height - 1 - z)
        if (edgeDist < 3) {
          this.tileData[idx] = TileType.Water
          continue
        }

        // 基础噪声层（减弱，让空间分区更主导）
        const n = Math.sin(x * 0.12) * Math.cos(z * 0.12) +
                  Math.sin(x * 0.06 + 3) * Math.cos(z * 0.08 + 5)
        if (n > 0.65)       this.tileData[idx] = TileType.Dirt
        else if (n > 0.35)  this.tileData[idx] = TileType.DarkGrass
        else if (n < -0.55) this.tileData[idx] = TileType.Sand
        else                this.tileData[idx] = TileType.Grass

        // ===== 玩家基地空间组织 =====
        // TH 中心 ≈ (11.5, 13.5)，tile 区域 (10-12, 12-14)
        // 金矿中心 ≈ (15.5, 10.5)，tile 区域 (14-16, 9-11)
        // 兵营中心 ≈ (7.5, 17.5)，tile 区域 (6-7, 16-17)

        // Town Hall 核心区：亮色压实地面（建筑基座）
        const dBase = Math.sqrt((x - 11) ** 2 + (z - 13) ** 2)
        if (dBase < 3.5) {
          this.tileData[idx] = TileType.LightDirt
        } else if (dBase < 5.5) {
          this.tileData[idx] = TileType.Dirt
        }

        // 金矿核心区：深石质地面（矿区）
        const dMine = Math.sqrt((x - 15) ** 2 + (z - 10) ** 2)
        if (dMine < 3) {
          this.tileData[idx] = TileType.DarkStone
        } else if (dMine < 4.5) {
          this.tileData[idx] = TileType.Stone
        } else if (dMine < 6) {
          if (this.tileData[idx] !== TileType.LightDirt) {
            this.tileData[idx] = TileType.Dirt
          }
        }

        // 基地 → 金矿资源路径（压实带，一眼看出 worker 往返路线）
        if (x >= 10 && x <= 16 && z >= 9 && z <= 13) {
          const pathDist = Math.abs(z - 11.5)
          if (pathDist < 1.5) {
            this.tileData[idx] = TileType.LightDirt
          } else if (pathDist < 2.5 && this.tileData[idx] === TileType.Grass) {
            this.tileData[idx] = TileType.Dirt
          }
        }

        // 基地 → 兵营军事通道（压实 Dirt）
        if (x >= 5 && x <= 11 && z >= 14 && z <= 18) {
          const pathDist = Math.abs(x - 8.5)
          if (pathDist < 1.5) {
            this.tileData[idx] = TileType.Dirt
          }
        }

        // 兵营区域（≈ 6.5, 16.5）：Dirt 压实
        const dRax = Math.sqrt((x - 6.5) ** 2 + (z - 16.5) ** 2)
        if (dRax < 3) {
          this.tileData[idx] = TileType.Dirt
        }

        // 集结空地 / 出口（城镇大厅南方 z > 18）：保持开阔
        if (z > 18 && z < 25 && x > 3 && x < 20) {
          if (this.tileData[idx] === TileType.DarkGrass) {
            this.tileData[idx] = TileType.Grass
          }
        }

        // 树林前沿过渡带（基地北侧和西侧）
        // DarkGrass 形成清晰的"树林边界"视觉暗示
        if ((x >= 12 && x <= 18 && z >= 5 && z <= 9) ||
            (x >= 0 && x <= 6 && z >= 5 && z <= 25)) {
          if (this.tileData[idx] === TileType.Grass || this.tileData[idx] === TileType.Dirt) {
            this.tileData[idx] = TileType.DarkGrass
          }
        }

        // ===== AI 基地区域（镜像语法）=====
        const dAiBase = Math.sqrt((x - 50) ** 2 + (z - 50) ** 2)
        if (dAiBase < 4) {
          this.tileData[idx] = TileType.LightDirt
        } else if (dAiBase < 7) {
          this.tileData[idx] = TileType.Dirt
        }
        // AI 矿区
        const dAiMine = Math.sqrt((x - 45.5) ** 2 + (z - 51.5) ** 2)
        if (dAiMine < 3) {
          this.tileData[idx] = TileType.DarkStone
        } else if (dAiMine < 5) {
          this.tileData[idx] = TileType.Stone
        }
        // AI 兵营区
        const dAiRax = Math.sqrt((x - 53.5) ** 2 + (z - 44.5) ** 2)
        if (dAiRax < 3) {
          this.tileData[idx] = TileType.Dirt
        }
      }
    }
  }

  /** 世界坐标 → 地块坐标 */
  worldToTile(wx: number, wz: number): [number, number] {
    return [Math.floor(wx), Math.floor(wz)]
  }

  /** 获取地块类型 */
  getTile(x: number, z: number): TileType {
    if (x < 0 || x >= this.width || z < 0 || z >= this.height) return TileType.Water
    return this.tileData[z * this.width + x]
  }
}
