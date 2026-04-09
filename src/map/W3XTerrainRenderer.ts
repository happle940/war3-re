import * as THREE from 'three'
import { W3ETerrain, ParsedMap } from './W3XParser'

/**
 * W3X 地形渲染器 v2
 *
 * 使用 Canvas 生成程序化纹理图集 + splatmap 混合：
 * - 每种地块类型有独立的纹理图案（草叶、泥土颗粒、石面等）
 * - 高分辨率混合贴图实现平滑的地块过渡
 * - 法线贴图模拟表面凹凸
 * - 8x 地图分辨率的高度网格，平滑插值
 * - 边缘水面
 */

// ===== 地块类型纹理参数 =====
interface TileTexDef {
  baseColor: number       // 基础颜色
  darkColor: number       // 暗色（阴影/深度）
  brightColor: number     // 亮色（高光/细节）
  pattern: 'grass' | 'dirt' | 'stone' | 'sand' | 'water'
}

const TILE_DEFS: Record<string, TileTexDef[]> = {
  'default': [
    { baseColor: 0x8b7355, darkColor: 0x6b5540, brightColor: 0xa09070, pattern: 'dirt' },      // 0: 泥地
    { baseColor: 0x3a6630, darkColor: 0x2a5020, brightColor: 0x4a8040, pattern: 'grass' },     // 1: 深草
    { baseColor: 0x9b8565, darkColor: 0x7b6a50, brightColor: 0xb09a78, pattern: 'dirt' },      // 2: 浅泥地
    { baseColor: 0x7b9b5a, darkColor: 0x5a7a40, brightColor: 0x90b06a, pattern: 'grass' },     // 3: 浅草
    { baseColor: 0x5a9c3f, darkColor: 0x3a7a25, brightColor: 0x70b855, pattern: 'grass' },     // 4: 草地
    { baseColor: 0x808060, darkColor: 0x606048, brightColor: 0x9a9a78, pattern: 'stone' },     // 5: 石地
    { baseColor: 0x3a6a2f, darkColor: 0x2a5520, brightColor: 0x4a8040, pattern: 'grass' },     // 6: 暗草
    { baseColor: 0x8a9b65, darkColor: 0x6a7a50, brightColor: 0xa0b580, pattern: 'grass' },     // 7: 稀草地
    { baseColor: 0x5a7a40, darkColor: 0x406030, brightColor: 0x709058, pattern: 'grass' },     // 8: 灌木
    { baseColor: 0x7a9a55, darkColor: 0x5a7a40, brightColor: 0x92b46a, pattern: 'grass' },     // 9: 原野
    { baseColor: 0x6a7a45, darkColor: 0x506030, brightColor: 0x809060, pattern: 'dirt' },      // 10: 苔地
    { baseColor: 0x9aaa65, darkColor: 0x7a8a50, brightColor: 0xb0c080, pattern: 'grass' },     // 11: 高草
    { baseColor: 0x3a6a35, darkColor: 0x2a5528, brightColor: 0x4a8048, pattern: 'grass' },     // 12: 森林
    { baseColor: 0x5a7a40, darkColor: 0x406030, brightColor: 0x709058, pattern: 'grass' },     // 13: 草原
    { baseColor: 0x9a8a50, darkColor: 0x7a7040, brightColor: 0xb0a068, pattern: 'dirt' },      // 14: 干草
    { baseColor: 0x7a6a45, darkColor: 0x5a5035, brightColor: 0x908060, pattern: 'dirt' },      // 15: 稀泥
  ],
}

// ===== 程序化纹理图集生成 =====

const ATLAS_TILE_SIZE = 64  // 每个地块纹理的像素尺寸
const ATLAS_COLS = 16       // 图集列数

function generateTileAtlas(palette: TileTexDef[]): THREE.CanvasTexture {
  const rows = Math.ceil(palette.length / ATLAS_COLS)
  const canvas = document.createElement('canvas')
  canvas.width = ATLAS_TILE_SIZE * ATLAS_COLS
  canvas.height = ATLAS_TILE_SIZE * rows
  const ctx = canvas.getContext('2d')!

  const rng = seededRandom(12345)

  for (let i = 0; i < palette.length; i++) {
    const def = palette[i]
    const col = i % ATLAS_COLS
    const row = Math.floor(i / ATLAS_COLS)
    const ox = col * ATLAS_TILE_SIZE
    const oy = row * ATLAS_TILE_SIZE

    // 先填基础色
    ctx.fillStyle = hexToCSS(def.baseColor)
    ctx.fillRect(ox, oy, ATLAS_TILE_SIZE, ATLAS_TILE_SIZE)

    // 根据类型绘制纹理图案
    switch (def.pattern) {
      case 'grass':
        drawGrassPattern(ctx, ox, oy, def, rng)
        break
      case 'dirt':
        drawDirtPattern(ctx, ox, oy, def, rng)
        break
      case 'stone':
        drawStonePattern(ctx, ox, oy, def, rng)
        break
      case 'sand':
        drawSandPattern(ctx, ox, oy, def, rng)
        break
      case 'water':
        drawWaterPattern(ctx, ox, oy, def, rng)
        break
    }
  }

  const tex = new THREE.CanvasTexture(canvas)
  tex.magFilter = THREE.LinearFilter
  tex.minFilter = THREE.LinearMipMapLinearFilter
  tex.generateMipmaps = true
  tex.wrapS = THREE.RepeatWrapping
  tex.wrapT = THREE.RepeatWrapping
  return tex
}

/** 草地纹理：细密的草叶笔触 */
function drawGrassPattern(ctx: CanvasRenderingContext2D, ox: number, oy: number, def: TileTexDef, rng: () => number) {
  const s = ATLAS_TILE_SIZE
  // 底层：密集的小点
  for (let i = 0; i < 300; i++) {
    const x = ox + rng() * s
    const y = oy + rng() * s
    const len = 2 + rng() * 4
    const angle = -Math.PI / 2 + (rng() - 0.5) * 0.6
    ctx.strokeStyle = hexToCSS(rng() > 0.5 ? def.brightColor : def.darkColor)
    ctx.globalAlpha = 0.3 + rng() * 0.4
    ctx.lineWidth = 0.5 + rng() * 0.8
    ctx.beginPath()
    ctx.moveTo(x, y)
    ctx.lineTo(x + Math.cos(angle) * len, y + Math.sin(angle) * len)
    ctx.stroke()
  }
  // 亮点：零星亮草叶
  for (let i = 0; i < 40; i++) {
    const x = ox + rng() * s
    const y = oy + rng() * s
    ctx.fillStyle = hexToCSS(def.brightColor)
    ctx.globalAlpha = 0.2 + rng() * 0.3
    ctx.fillRect(x, y, 1 + rng() * 2, 1 + rng())
  }
  // 暗色斑块
  for (let i = 0; i < 8; i++) {
    const x = ox + rng() * s
    const y = oy + rng() * s
    const r = 3 + rng() * 6
    ctx.fillStyle = hexToCSS(def.darkColor)
    ctx.globalAlpha = 0.15 + rng() * 0.15
    ctx.beginPath()
    ctx.ellipse(x, y, r, r * 0.7, rng() * Math.PI, 0, Math.PI * 2)
    ctx.fill()
  }
  ctx.globalAlpha = 1
}

/** 泥地纹理：颗粒+裂纹 */
function drawDirtPattern(ctx: CanvasRenderingContext2D, ox: number, oy: number, def: TileTexDef, rng: () => number) {
  const s = ATLAS_TILE_SIZE
  // 颗粒噪点
  for (let i = 0; i < 500; i++) {
    const x = ox + rng() * s
    const y = oy + rng() * s
    ctx.fillStyle = hexToCSS(rng() > 0.5 ? def.brightColor : def.darkColor)
    ctx.globalAlpha = 0.2 + rng() * 0.3
    ctx.fillRect(x, y, 1 + rng() * 2, 1 + rng())
  }
  // 小石子
  for (let i = 0; i < 15; i++) {
    const x = ox + rng() * s
    const y = oy + rng() * s
    ctx.fillStyle = hexToCSS(def.darkColor)
    ctx.globalAlpha = 0.3 + rng() * 0.3
    ctx.beginPath()
    ctx.ellipse(x, y, 1 + rng() * 2, 1 + rng() * 1.5, rng() * Math.PI, 0, Math.PI * 2)
    ctx.fill()
  }
  // 纹理裂纹
  for (let i = 0; i < 5; i++) {
    let x = ox + rng() * s
    let y = oy + rng() * s
    ctx.strokeStyle = hexToCSS(def.darkColor)
    ctx.globalAlpha = 0.15 + rng() * 0.1
    ctx.lineWidth = 0.5
    ctx.beginPath()
    ctx.moveTo(x, y)
    for (let j = 0; j < 4; j++) {
      x += (rng() - 0.5) * 10
      y += rng() * 8
      ctx.lineTo(x, y)
    }
    ctx.stroke()
  }
  ctx.globalAlpha = 1
}

/** 石头纹理：块面+暗线 */
function drawStonePattern(ctx: CanvasRenderingContext2D, ox: number, oy: number, def: TileTexDef, rng: () => number) {
  const s = ATLAS_TILE_SIZE
  // 块面
  for (let i = 0; i < 12; i++) {
    const x = ox + rng() * s
    const y = oy + rng() * s
    const w = 6 + rng() * 14
    const h = 4 + rng() * 10
    ctx.fillStyle = hexToCSS(rng() > 0.4 ? def.brightColor : def.darkColor)
    ctx.globalAlpha = 0.2 + rng() * 0.25
    ctx.fillRect(x, y, w, h)
  }
  // 暗线分割
  for (let i = 0; i < 8; i++) {
    ctx.strokeStyle = hexToCSS(def.darkColor)
    ctx.globalAlpha = 0.3 + rng() * 0.2
    ctx.lineWidth = 0.5 + rng()
    ctx.beginPath()
    const x = ox + rng() * s
    const y = oy + rng() * s
    ctx.moveTo(x, y)
    ctx.lineTo(x + (rng() - 0.5) * 20, y + rng() * 15)
    ctx.stroke()
  }
  // 零星亮点
  for (let i = 0; i < 20; i++) {
    const x = ox + rng() * s
    const y = oy + rng() * s
    ctx.fillStyle = hexToCSS(def.brightColor)
    ctx.globalAlpha = 0.15 + rng() * 0.2
    ctx.fillRect(x, y, 1 + rng() * 2, 1 + rng())
  }
  ctx.globalAlpha = 1
}

/** 沙地纹理 */
function drawSandPattern(ctx: CanvasRenderingContext2D, ox: number, oy: number, def: TileTexDef, rng: () => number) {
  const s = ATLAS_TILE_SIZE
  for (let i = 0; i < 400; i++) {
    const x = ox + rng() * s
    const y = oy + rng() * s
    ctx.fillStyle = hexToCSS(rng() > 0.5 ? def.brightColor : def.darkColor)
    ctx.globalAlpha = 0.15 + rng() * 0.25
    ctx.fillRect(x, y, 1, 1)
  }
  ctx.globalAlpha = 1
}

/** 水面纹理 */
function drawWaterPattern(ctx: CanvasRenderingContext2D, ox: number, oy: number, def: TileTexDef, rng: () => number) {
  const s = ATLAS_TILE_SIZE
  for (let i = 0; i < 20; i++) {
    const x = ox + rng() * s
    const y = oy + rng() * s
    ctx.strokeStyle = hexToCSS(def.brightColor)
    ctx.globalAlpha = 0.2 + rng() * 0.2
    ctx.lineWidth = 0.5 + rng()
    ctx.beginPath()
    ctx.moveTo(x, y)
    ctx.quadraticCurveTo(x + 5, y + 3 * (rng() - 0.5), x + 10, y)
    ctx.stroke()
  }
  ctx.globalAlpha = 1
}

// ===== Splatmap 生成 =====

/**
 * 生成 splatmap + 覆盖贴图
 * splatmap: R=主类型索引, G=主权重, B=次类型索引, A=次权重
 * coverMap: R=边界(255/0), G=水面(255/0), B/A=unused
 */
function generateSplatData(
  terrain: W3ETerrain,
  palette: TileTexDef[],
  texW: number,
  texH: number,
): { splatMap: Uint8Array; coverMap: Uint8Array; atlas: THREE.CanvasTexture } {
  const w = terrain.width
  const h = terrain.height
  const tileCount = palette.length

  const splatMap = new Uint8Array(texW * texH * 4)
  const coverMap = new Uint8Array(texW * texH * 4)

  for (let tz = 0; tz < texH; tz++) {
    for (let tx = 0; tx < texW; tx++) {
      // DataTexture flipY=false: 数据行 tz=0 映射到 UV v=0 (纹理底部)
      // PlaneGeometry UV: v=0 对应世界 z=h (最底部顶点)
      // 所以 tz=0 应该对应 world z=h, 即 fz = h * (1 - tz/texH)
      const fx = (tx / texW) * w
      const fz = h * (1 - tz / texH)
      const ix = Math.floor(fx)
      const iz = Math.floor(fz)

      const cx = Math.min(ix, w - 1)
      const cz = Math.min(iz, h - 1)
      const isBoundary = (terrain.flags[cz * w + cx] & 0x40) !== 0
      const isWater = (terrain.flags[cz * w + cx] & 0x04) !== 0

      // 收集周围地块影响
      const influences = new Map<number, number>()
      for (let dz = -1; dz <= 1; dz++) {
        for (let dx = -1; dx <= 1; dx++) {
          const nx = ix + dx
          const nz = iz + dz
          if (nx < 0 || nx >= w || nz < 0 || nz >= h) continue
          const tileType = terrain.groundType[nz * w + nx] % tileCount
          const dist = Math.sqrt((fx - nx - 0.5) ** 2 + (fz - nz - 0.5) ** 2)
          const weight = Math.max(0, 1 - dist * 0.85)
          const prev = influences.get(tileType) ?? 0
          influences.set(tileType, prev + weight)
        }
      }

      const sorted = [...influences.entries()]
        .sort((a, b) => b[1] - a[1])
        .slice(0, 2)

      const totalWeight = sorted.reduce((s, e) => s + e[1], 0) || 1

      const idx = (tz * texW + tx) * 4
      // 主类型 (0..tileCount-1 存为 0..255)
      splatMap[idx] = Math.round((sorted[0]?.[0] ?? 0) * 255 / Math.max(1, tileCount - 1))
      splatMap[idx + 1] = Math.round((sorted[0]?.[1] ?? 0) / totalWeight * 255)
      splatMap[idx + 2] = Math.round((sorted[1]?.[0] ?? 0) * 255 / Math.max(1, tileCount - 1))
      splatMap[idx + 3] = Math.round((sorted[1]?.[1] ?? 0) / totalWeight * 255)

      // 覆盖贴图
      coverMap[idx] = isBoundary ? 255 : 0
      coverMap[idx + 1] = isWater ? 255 : 0
    }
  }

  return { splatMap, coverMap, atlas: generateTileAtlas(palette) }
}

// ===== 着色器 =====

const TERRAIN_VERTEX_SHADER = `
varying vec2 vUv;
varying float vHeight;
varying vec3 vWorldPos;
varying vec3 vNormal;

void main() {
  vUv = uv;
  vHeight = position.y;
  vWorldPos = (modelMatrix * vec4(position, 1.0)).xyz;
  vNormal = normalMatrix * normal;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`

const TERRAIN_FRAGMENT_SHADER = `
uniform sampler2D uAtlas;
uniform sampler2D uSplatMap;
uniform sampler2D uCoverMap;
uniform float uTileCount;
uniform float uMapSize;

varying vec2 vUv;
varying float vHeight;
varying vec3 vWorldPos;
varying vec3 vNormal;

// 噪声函数
float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  float a = hash(i);
  float b = hash(i + vec2(1.0, 0.0));
  float c = hash(i + vec2(0.0, 1.0));
  float d = hash(i + vec2(1.0, 1.0));
  return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
}

float fbm(vec2 p) {
  float v = 0.0;
  v += noise(p * 1.0) * 0.5;
  v += noise(p * 2.0) * 0.25;
  v += noise(p * 4.0) * 0.125;
  v += noise(p * 8.0) * 0.0625;
  return v;
}

void main() {
  // 从 splatmap 读取混合信息
  vec4 splat = texture2D(uSplatMap, vUv);
  vec4 cover = texture2D(uCoverMap, vUv);

  bool isBoundary = cover.r > 0.5;
  bool isWater = cover.g > 0.5;

  // 解码主/次类型索引
  float idx1 = splat.r * (uTileCount - 1.0);
  float idx2 = splat.b * (uTileCount - 1.0);
  float w1 = splat.g;
  float w2 = splat.a;
  float totalW = w1 + w2;
  if (totalW < 0.001) totalW = 1.0;
  w1 /= totalW;
  w2 /= totalW;

  // 边界 → 深色
  if (isBoundary) {
    gl_FragColor = vec4(0.1, 0.1, 0.18, 1.0);
    return;
  }

  // UV 在 atlas 中的位置
  float atlasTileSize = 1.0 / 16.0;
  vec2 worldUV = vWorldPos.xz * 0.12;

  // 主类型纹理
  float col1 = mod(idx1, 16.0);
  float row1 = floor(idx1 / 16.0);
  vec2 uv1 = vec2(
    (col1 + fract(worldUV.x)) * atlasTileSize,
    (row1 + fract(worldUV.y)) * atlasTileSize
  );
  vec3 color1 = texture2D(uAtlas, uv1).rgb;

  // 次类型纹理
  float col2 = mod(idx2, 16.0);
  float row2 = floor(idx2 / 16.0);
  vec2 uv2 = vec2(
    (col2 + fract(worldUV.x)) * atlasTileSize,
    (row2 + fract(worldUV.y)) * atlasTileSize
  );
  vec3 color2 = texture2D(uAtlas, uv2).rgb;

  // 混合
  vec3 baseColor = mix(color2, color1, w1);

  // 水面着色
  if (isWater) {
    vec3 waterColor = vec3(0.22, 0.45, 0.72);
    baseColor = mix(baseColor, waterColor, 0.65);
    float wave = fbm(vWorldPos.xz * 0.3 + vHeight * 0.5);
    baseColor += vec3(0.05, 0.08, 0.1) * wave;
  }

  // 世界空间噪声细节
  vec2 detailCoord = vWorldPos.xz * 0.8;
  float detail = fbm(detailCoord);
  baseColor *= 0.88 + detail * 0.24;

  // 法线光照
  vec3 lightDir = normalize(vec3(0.5, 1.0, 0.3));
  float diffuse = max(dot(vNormal, lightDir), 0.0) * 0.35 + 0.65;
  baseColor *= diffuse;

  // 高度着色
  baseColor += vec3(0.015) * clamp(vHeight * 0.15, -0.08, 0.12);

  gl_FragColor = vec4(baseColor, 1.0);
}
`

// ===== 主渲染器 =====

export class W3XTerrainRenderer {
  readonly group = new THREE.Group()
  private mapData: ParsedMap | null = null
  private heightScale = 3.0

  renderFromW3X(mapData: ParsedMap): void {
    this.mapData = mapData
    this.clear()

    const terrain = mapData.terrain
    this.createTerrainMesh(terrain)
    this.createWaterPlane(terrain)
    if (mapData.info) {
      this.createStartMarkers(mapData.info)
    }
  }

  /**
   * 创建地形网格
   */
  private createTerrainMesh(terrain: W3ETerrain) {
    const w = terrain.width
    const h = terrain.height
    const palette = TILE_DEFS['default']
    const tileCount = palette.length

    // ===== 1. 生成纹理图集和 splatmap =====
    const splatRes = Math.max(w, h) * 4  // 4x 分辨率
    const { splatMap, coverMap, atlas } = generateSplatData(terrain, palette, splatRes, splatRes)

    // 上传 splatmap
    const splatTexture = new THREE.DataTexture(splatMap, splatRes, splatRes, THREE.RGBAFormat)
    splatTexture.magFilter = THREE.LinearFilter
    splatTexture.minFilter = THREE.LinearMipMapLinearFilter
    splatTexture.generateMipmaps = true
    splatTexture.needsUpdate = true

    // 上传 covermap（不插值，保持 0/1）
    const coverTexture = new THREE.DataTexture(coverMap, splatRes, splatRes, THREE.RGBAFormat)
    coverTexture.magFilter = THREE.NearestFilter
    coverTexture.minFilter = THREE.NearestFilter
    coverTexture.needsUpdate = true

    // ===== 2. 创建高度网格 =====
    // 使用 2x 细分实现平滑的高度插值
    const segX = (w - 1) * 2
    const segZ = (h - 1) * 2
    const geometry = new THREE.PlaneGeometry(w, h, segX, segZ)
    geometry.rotateX(-Math.PI / 2)

    const positions = geometry.attributes.position
    const vertexCount = positions.count

    for (let i = 0; i < vertexCount; i++) {
      // PlaneGeometry rotateX(-PI/2) 后:
      // 顶点 (x, y, z) 在 mesh position (w/2, 0, h/2) 下对应世界坐标 (x+w/2, y, z+h/2)
      // 但 PlaneGeometry 原始的 y 坐标映射到 -z, 即 x=originX, z=-originY
      // 验证: v0 在 (-w/2, 0, -h/2) → world (0, 0, 0) → tile (0, 0)
      // 但实际 rotateX(-PI/2) 把原始 y 轴翻转到 -z, 所以:
      // 原始 (x=-w/2, y=h/2) → 旋转后 (x=-w/2, z=-h/2) → world (0, 0, 0)
      // 但 war3 terrain row z=0 是地图的顶部还是底部？
      // 关键：vz 映射是否与 splatmap 的 z 映射一致
      const vx = positions.getX(i) + w / 2
      const vz = positions.getZ(i) + h / 2

      // 双线性插值高度
      const fx = vx
      const fz = vz
      const x0 = Math.floor(fx)
      const z0 = Math.floor(fz)
      const x1 = Math.min(x0 + 1, w - 1)
      const z1 = Math.min(z0 + 1, h - 1)
      const tx = fx - x0
      const tz = fz - z0

      const cx0 = Math.max(0, Math.min(w - 1, x0))
      const cz0 = Math.max(0, Math.min(h - 1, z0))

      const h00 = terrain.groundHeight[cz0 * w + cx0]
      const h10 = terrain.groundHeight[cz0 * w + x1]
      const h01 = terrain.groundHeight[z1 * w + cx0]
      const h11 = terrain.groundHeight[z1 * w + x1]

      const height = (h00 * (1 - tx) * (1 - tz) + h10 * tx * (1 - tz) + h01 * (1 - tx) * tz + h11 * tx * tz)
      positions.setY(i, height * this.heightScale)
    }

    positions.needsUpdate = true
    geometry.computeVertexNormals()
    geometry.computeBoundingSphere()
    geometry.computeBoundingBox()

    // ===== 3. 着色器材质 =====
    const material = new THREE.ShaderMaterial({
      vertexShader: TERRAIN_VERTEX_SHADER,
      fragmentShader: TERRAIN_FRAGMENT_SHADER,
      uniforms: {
        uAtlas: { value: atlas },
        uSplatMap: { value: splatTexture },
        uCoverMap: { value: coverTexture },
        uTileCount: { value: tileCount },
        uMapSize: { value: w },
      },
      side: THREE.FrontSide,
    })

    const mesh = new THREE.Mesh(geometry, material)
    mesh.position.set(w / 2, 0, h / 2)
    this.group.add(mesh)

    // ===== 4. 地面射线检测平面 =====
    const groundGeo = new THREE.PlaneGeometry(w, h)
    groundGeo.rotateX(-Math.PI / 2)
    const groundMat = new THREE.MeshBasicMaterial({ visible: false })
    this.groundPlane = new THREE.Mesh(groundGeo, groundMat)
    this.groundPlane.position.set(w / 2, 0, h / 2)
    this.group.add(this.groundPlane)
  }

  /**
   * 水面：只在边缘水域放窄条
   */
  private createWaterPlane(terrain: W3ETerrain) {
    const w = terrain.width
    const h = terrain.height

    let maxWaterY = -Infinity
    let hasWater = false
    for (let i = 0; i < terrain.waterLevel.length; i++) {
      if ((terrain.flags[i] & 0x04) && terrain.waterLevel[i] > terrain.groundHeight[i]) {
        maxWaterY = Math.max(maxWaterY, terrain.waterLevel[i])
        hasWater = true
      }
    }
    if (!hasWater) return

    const waterY = maxWaterY * this.heightScale
    const stripWidth = 4
    const waterMat = new THREE.MeshBasicMaterial({
      color: 0x2266aa,
      transparent: true,
      opacity: 0.35,
      side: THREE.DoubleSide,
    })

    const strips = [
      { geo: new THREE.PlaneGeometry(w + 2, stripWidth), pos: [w / 2, waterY, stripWidth / 2] },
      { geo: new THREE.PlaneGeometry(w + 2, stripWidth), pos: [w / 2, waterY, h - stripWidth / 2] },
      { geo: new THREE.PlaneGeometry(stripWidth, h - stripWidth * 2), pos: [stripWidth / 2, waterY, h / 2] },
      { geo: new THREE.PlaneGeometry(stripWidth, h - stripWidth * 2), pos: [w - stripWidth / 2, waterY, h / 2] },
    ]

    for (const s of strips) {
      s.geo.rotateX(-Math.PI / 2)
      const mesh = new THREE.Mesh(s.geo, waterMat)
      mesh.position.set(s.pos[0], s.pos[1], s.pos[2])
      this.group.add(mesh)
    }
  }

  /**
   * 玩家起始位置标记
   */
  private createStartMarkers(info: { players: { id: number; team: number; startX: number; startY: number }[] }) {
    const teamColors = [0x4488ff, 0xff4444, 0x44ff44, 0xffff44]

    for (const player of info.players) {
      const wx = player.startX / 128
      const wz = player.startY / 128

      const marker = new THREE.Group()
      const ringGeo = new THREE.RingGeometry(1.5, 2.0, 32)
      ringGeo.rotateX(-Math.PI / 2)
      const ringMat = new THREE.MeshBasicMaterial({
        color: teamColors[player.team % teamColors.length],
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.6,
      })
      marker.add(new THREE.Mesh(ringGeo, ringMat))

      const pillarGeo = new THREE.CylinderGeometry(0.1, 0.1, 3, 8)
      const pillarMat = new THREE.MeshBasicMaterial({
        color: teamColors[player.team % teamColors.length],
        transparent: true,
        opacity: 0.4,
      })
      const pillar = new THREE.Mesh(pillarGeo, pillarMat)
      pillar.position.y = 1.5
      marker.add(pillar)

      marker.position.set(wx, 0.1, wz)
      this.group.add(marker)
    }
  }

  groundPlane: THREE.Mesh | null = null

  clear() {
    while (this.group.children.length > 0) {
      const child = this.group.children[0]
      this.group.remove(child)
      if (child instanceof THREE.Mesh) {
        child.geometry.dispose()
        if (child.material instanceof THREE.Material) child.material.dispose()
      }
    }
    this.groundPlane = null
  }

  getMapSize(): [number, number] {
    if (!this.mapData) return [64, 64]
    return [this.mapData.terrain.width, this.mapData.terrain.height]
  }
}

// ===== 工具函数 =====

function seededRandom(seed: number) {
  let s = seed
  return () => { s = (s * 16807) % 2147483647; return s / 2147483647 }
}

function hexToCSS(hex: number): string {
  const r = (hex >> 16) & 0xFF
  const g = (hex >> 8) & 0xFF
  const b = hex & 0xFF
  return `rgb(${r},${g},${b})`
}
