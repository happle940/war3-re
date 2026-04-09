import * as THREE from 'three'
import JSZip from 'jszip'

/**
 * W3X 地图解析器
 *
 * .w3x 文件本质上是一个ZIP压缩包，包含多个二进制文件：
 * - war3map.w3e: 地形/环境数据（高度图、地块类型、水面）
 * - war3map.w3i: 地图基本信息（玩家数量、地图大小）
 * - war3map.w3u: 自定义单位数据
 * - war3map.w3b: 自定义建筑数据
 * - war3map.w3d: 装饰物数据
 * - war3map.wpm: 寻路数据
 *
 * 本解析器专注于 w3e（地形）和 w3i（信息），
 * 提取：高度图、地块类型、水面高度、地图尺寸、玩家出生点。
 */

// ===== W3E 地形数据结构 =====
export interface W3ETerrain {
  width: number
  height: number
  tileset: string           // 地形主题 (A=LordaeronSummer, B=LordaeronFall, etc.)
  centerOffsetX: number
  centerOffsetY: number

  // 每个 tile 的数据 [row][col]
  groundHeight: Float32Array   // 地面高度
  waterLevel: Float32Array     // 水面高度
  groundType: Uint8Array       // 地面纹理类型
  variation: Uint8Array        // 纹理变体
  flags: Uint8Array            // 标志位（水/斜坡/边界等）
  layerHeight: Uint8Array      // 层高度（悬崖层级）
}

// ===== W3I 地图信息 =====
export interface W3IMapInfo {
  mapWidth: number
  mapHeight: number
  playerCount: number
  players: W3IPlayer[]
}

export interface W3IPlayer {
  id: number
  team: number
  startX: number
  startY: number
}

// ===== 解析后的完整地图 =====
export interface ParsedMap {
  terrain: W3ETerrain
  info: W3IMapInfo | null
  unitPositions: { x: number; y: number; type: string; player: number }[]
}

/**
 * 从 ArrayBuffer 解析 .w3x 文件
 */
export async function parseW3X(data: ArrayBuffer): Promise<ParsedMap> {
  const zip = await JSZip.loadAsync(data)

  // 解析地形
  const w3eFile = zip.file('war3map.w3e')
  let terrain: W3ETerrain
  if (w3eFile) {
    const w3eData = await w3eFile.async('arraybuffer')
    terrain = parseW3E(w3eData)
  } else {
    throw new Error('war3map.w3e not found in archive')
  }

  // 解析地图信息
  const w3iFile = zip.file('war3map.w3i')
  let info: W3IMapInfo | null = null
  if (w3iFile) {
    const w3iData = await w3iFile.async('arraybuffer')
    info = parseW3I(w3iData)
  }

  // 解析单位位置（从doo文件）
  const unitPositions: ParsedMap['unitPositions'] = []
  const dooFile = zip.file('war3map.doo')
  if (dooFile) {
    const dooData = await dooFile.async('arraybuffer')
    unitPositions.push(...parseUnits(dooData))
  }

  return { terrain, info, unitPositions }
}

/**
 * 解析 war3map.w3e 地形文件
 *
 * 格式文档参考：https://war3tools.info/formats/w3e
 */
function parseW3E(data: ArrayBuffer): W3ETerrain {
  const view = new DataView(data)
  let offset = 0

  // 文件头
  const magic = readChars(view, offset, 4)
  offset += 4
  if (magic !== 'W3E!') {
    throw new Error(`Invalid W3E magic: ${magic}`)
  }

  // 版本
  const version = view.getInt32(offset, true)
  offset += 4

  // 地形主题
  const tileset = readChars(view, offset, 1)
  offset += 1

  // 是否使用自定义贴图
  const customTileset = view.getInt32(offset, true)
  offset += 4

  // 地面贴图列表
  const groundTileCount = view.getInt32(offset, true)
  offset += 4
  const groundTiles: string[] = []
  for (let i = 0; i < groundTileCount; i++) {
    groundTiles.push(readChars(view, offset, 4))
    offset += 4
  }

  // 悬崖贴图列表
  const cliffTileCount = view.getInt32(offset, true)
  offset += 4
  for (let i = 0; i < cliffTileCount; i++) {
    offset += 4
  }

  // 地图尺寸
  const mapWidth = view.getInt32(offset, true)
  offset += 4
  const mapHeight = view.getInt32(offset, true)
  offset += 4

  // 中心偏移
  const centerOffsetX = view.getFloat32(offset, true)
  offset += 4
  const centerOffsetY = view.getFloat32(offset, true)
  offset += 4

  // 读取地形数据
  // 每个tile的基础大小：groundHeight(2) + waterLevel(2) + flags(1) + groundType(1) + variation(1) = 7
  // 部分版本额外有 cliff(1) = 8 bytes
  const tileCount = mapWidth * mapHeight
  const remainingBytes = view.byteLength - offset
  const bytesPerTile = Math.floor(remainingBytes / tileCount)

  const groundHeight = new Float32Array(tileCount)
  const waterLevel = new Float32Array(tileCount)
  const groundType = new Uint8Array(tileCount)
  const variation = new Uint8Array(tileCount)
  const flags = new Uint8Array(tileCount)
  const layerHeight = new Uint8Array(tileCount)

  for (let i = 0; i < tileCount; i++) {
    // 地面高度（0x0000-0x3FFF，0x2000=地面水平面）
    const rawGround = view.getUint16(offset, true)
    groundHeight[i] = (rawGround - 0x2000) / 512  // 转换为世界单位
    offset += 2

    // 水面高度
    const rawWater = view.getUint16(offset, true)
    waterLevel[i] = (rawWater - 0x2000) / 512
    offset += 2

    // 标志和类型
    const flagByte = view.getUint8(offset)
    flags[i] = flagByte
    offset += 1

    // 地面纹理类型
    groundType[i] = view.getUint8(offset)
    offset += 1

    // 纹理变体
    variation[i] = view.getUint8(offset)
    offset += 1

    // 悬崖变体（仅当 bytesPerTile >= 8 时存在）
    if (bytesPerTile >= 8) {
      const cliffByte = view.getUint8(offset)
      layerHeight[i] = cliffByte & 0x0F  // 低4位=层高度
      offset += 1
    }
  }

  return {
    width: mapWidth,
    height: mapHeight,
    tileset,
    centerOffsetX,
    centerOffsetY,
    groundHeight,
    waterLevel,
    groundType,
    variation,
    flags,
    layerHeight,
  }
}

/**
 * 解析 war3map.w3i 地图信息
 */
function parseW3I(data: ArrayBuffer): W3IMapInfo {
  const view = new DataView(data)
  let offset = 0

  const magic = readChars(view, offset, 4)
  offset += 4

  const version = view.getInt32(offset, true)
  offset += 4

  // 跳过一些字段
  offset += 4 + 4 + 4  // mapWidth, mapHeight (in jass), flags

  const mapWidth = view.getInt32(offset, true)
  offset += 4
  const mapHeight = view.getInt32(offset, true)
  offset += 4

  // 跳到玩家数据
  offset += 4 * 8 // camera bounds
  offset += 4 + 128    // map name (length prefix + data)
  offset += 4 + 128    // map description (length prefix + data)
  offset += 4      // players count (recommended)
  offset += 4 + 128    // player name (length prefix + data)
  offset += 4 + 4 + 4 + 4 // various flags
  offset += 4 + 128    // player description (length prefix + data)

  // 玩家列表
  const playerCount = view.getInt32(offset, true)
  offset += 4

  const players: W3IPlayer[] = []
  for (let i = 0; i < playerCount; i++) {
    const pid = view.getInt32(offset, true)
    offset += 4
    const team = view.getInt32(offset, true)
    offset += 4
    const race = view.getInt32(offset, true)
    offset += 4
    offset += 4  // isComputer
    offset += 4  // start position flag
    const startX = view.getFloat32(offset, true)
    offset += 4
    const startY = view.getFloat32(offset, true)
    offset += 4
    offset += 4  // ally priorities flag
    offset += 4 * 16 // alliance matrix row

    players.push({ id: pid, team, startX, startY })
  }

  return { mapWidth, mapHeight, playerCount: players.length, players }
}

/**
 * 解析单位位置（简化版）
 */
function parseUnits(data: ArrayBuffer): ParsedMap['unitPositions'] {
  const units: ParsedMap['unitPositions'] = []
  const view = new DataView(data)
  let offset = 0

  const magic = readChars(view, offset, 4)
  offset += 4
  if (magic !== 'DOOD' && magic !== 'UNIT') return units

  const version = view.getInt32(offset, true)
  offset += 4

  // 未知字段
  offset += 4

  const count = view.getInt32(offset, true)
  offset += 4

  for (let i = 0; i < Math.min(count, 500); i++) { // 限制读取数量
    try {
      const typeId = readChars(view, offset, 4)
      offset += 4
      const x = view.getFloat32(offset, true)
      offset += 4
      const y = view.getFloat32(offset, true)
      offset += 4
      offset += 4 // z

      // 跳过剩余字段（简化处理）
      if (version === 11) {
        offset += 4 + 4 + 4 + 4 + 4 // flags, player, unknown, unknown, hp
        offset += 4 + 4 + 4 + 4 // mp, gold, targetAcquired, target
        offset += 4 // item table ptr
        const itemCount = view.getInt32(offset, true)
        offset += 4
        offset += itemCount * 8 // items
        offset += 4 // target
      }

      // 判断是否为建筑或单位
      const player = view.getInt32(offset - 64, true) // 近似位置
      units.push({ x, y, type: typeId, player: 0 })
    } catch {
      break
    }
  }

  return units
}

// ===== 辅助函数 =====

function readChars(view: DataView, offset: number, length: number): string {
  let str = ''
  for (let i = 0; i < length; i++) {
    str += String.fromCharCode(view.getUint8(offset + i))
  }
  return str
}

/**
 * 从 fetch 加载地图
 */
export async function loadMapFromURL(url: string): Promise<ParsedMap> {
  const response = await fetch(url)
  if (!response.ok) throw new Error(`Failed to load map: ${response.status}`)
  const data = await response.arrayBuffer()
  return parseW3X(data)
}

/**
 * 从文件输入加载地图
 */
export async function loadMapFromFile(file: File): Promise<ParsedMap> {
  const data = await file.arrayBuffer()
  return parseW3X(data)
}
