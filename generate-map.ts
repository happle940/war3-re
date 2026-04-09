/**
 * 生成一张模拟 Turtle Rock 的 .w3x 地图文件
 *
 * .w3x = ZIP(war3map.w3e + war3map.w3i)
 * W3E tile: 7 bytes = groundHeight(2) + waterLevel(2) + flags(1) + groundType(1) + variation(1)
 *           注意：没有 cliff/unknown 字段，简化版
 */
import JSZip from 'jszip'
import * as fs from 'fs'

const MAP_SIZE = 128
const BYTES_PER_TILE = 7

// ===== 生成 w3e 地形数据 =====
function generateW3E(): Buffer {
  // 计算 header 大小
  // magic(4) + version(4) + tileset(1) + custom(4) =
  // groundTileCount(4) + groundTiles(16*4) =
  // cliffTileCount(4) + cliffTiles(2*4) =
  // mapWidth(4) + mapHeight(4) + centerX(4) + centerY(4)
  const headerSize = 4 + 4 + 1 + 4 + 4 + 16*4 + 4 + 2*4 + 4 + 4 + 4 + 4  // = 109
  const tileDataSize = MAP_SIZE * MAP_SIZE * BYTES_PER_TILE
  const totalSize = headerSize + tileDataSize

  const buf = Buffer.alloc(totalSize)
  let off = 0

  // Magic
  buf.write('W3E!', off); off += 4
  // Version
  buf.writeInt32LE(11, off); off += 4
  // Tileset: A = Lordaeron Summer
  buf.write('A', off); off += 1
  // Custom tileset: no
  buf.writeInt32LE(0, off); off += 4

  // Ground tiles (16个)
  buf.writeInt32LE(16, off); off += 4
  const tileNames = [
    'Ldrt','Ldro','Ldrg','Lrok',
    'Lgrs','Lgrd','Lnic','Lsnw',
    'Lsno','Lice','Lsan','Lsca',
    'Lbit','Lgrh','Lshr','Lgrl'
  ]
  for (const name of tileNames) {
    buf.write(name, off, 4, 'ascii'); off += 4
  }

  // Cliff tiles (2个)
  buf.writeInt32LE(2, off); off += 4
  buf.write('CLdi', off, 4, 'ascii'); off += 4
  buf.write('CLsi', off, 4, 'ascii'); off += 4

  // Map dimensions
  buf.writeInt32LE(MAP_SIZE, off); off += 4
  buf.writeInt32LE(MAP_SIZE, off); off += 4

  // Center offset
  buf.writeFloatLE(0, off); off += 4
  buf.writeFloatLE(0, off); off += 4

  console.log(`Header size: ${off} (expected ${headerSize})`)

  // Terrain tiles: 7 bytes each
  // groundHeight(2) + waterLevel(2) + flags(1) + groundType(1) + variation(1)
  for (let z = 0; z < MAP_SIZE; z++) {
    for (let x = 0; x < MAP_SIZE; x++) {
      // 计算高度
      let height = 0x2000 // 默认水平面

      // 边缘水（周围3格内低于水平面）
      const edgeDist = Math.min(x, z, MAP_SIZE-1-x, MAP_SIZE-1-z)
      if (edgeDist < 4) {
        height = 0x2000 - (4 - edgeDist) * 150
      } else {
        // 起伏地形
        const hill1 = Math.sin(x * 0.05) * Math.cos(z * 0.05) * 150
        const hill2 = Math.sin(x * 0.02 + 1) * Math.cos(z * 0.03 + 2) * 200
        height += Math.round(hill1 + hill2)
      }

      // 4个角（出生点）平坦化
      const corners = [[12,12],[12,115],[115,12],[115,115]]
      for (const [cx, cz] of corners) {
        const dist = Math.sqrt((x-cx)**2 + (z-cz)**2)
        if (dist < 10) {
          height = 0x2000 + Math.round((10-dist) * 15)
        }
      }

      // Ground height (2 bytes)
      buf.writeUInt16LE(height & 0x3FFF, off); off += 2

      // Water level（边缘有水）(2 bytes)
      // 陆地: 水位远低于地面（不会显示水）
      // 水域: 水位高于地面（显示水）
      let waterLevel = 0x0000
      if (edgeDist < 3) {
        waterLevel = 0x2000 + 300
      }
      buf.writeUInt16LE(waterLevel & 0x3FFF, off); off += 2

      // Flags (1 byte)
      let flags = 0
      if (edgeDist < 1) flags |= 0x40 // boundary
      if (edgeDist < 3) flags |= 0x04 // water flag
      buf.writeUInt8(flags, off); off += 1

      // Ground texture type (1 byte)
      let groundType = 4 // grass
      if (edgeDist < 3) groundType = 2 // dirt near water
      else if (Math.random() < 0.3) groundType = 3 // light grass variation
      else if (Math.random() < 0.1) groundType = 5 // rocky
      for (const [cx, cz] of corners) {
        const d = Math.sqrt((x-cx)**2 + (z-cz)**2)
        if (d < 8) groundType = 0 // dirt at starting positions
      }
      buf.writeUInt8(groundType, off); off += 1

      // Variation (1 byte)
      buf.writeUInt8(Math.floor(Math.random() * 15), off); off += 1
    }
  }

  console.log(`Total written: ${off} (expected ${totalSize})`)
  return buf.subarray(0, off)
}

// ===== 生成 w3i 地图信息 =====
function generateW3I(): Buffer {
  const buf = Buffer.alloc(2048)
  let off = 0

  buf.write('W3I!', off); off += 4
  buf.writeInt32LE(18, off); off += 4 // version

  // Map width/height in jass
  buf.writeInt32LE(MAP_SIZE, off); off += 4
  buf.writeInt32LE(MAP_SIZE, off); off += 4

  // Flags
  buf.writeInt32LE(1, off); off += 4 // melee map

  // Map width/height
  buf.writeInt32LE(MAP_SIZE, off); off += 4
  buf.writeInt32LE(MAP_SIZE, off); off += 4

  // Camera bounds (4 pairs of left/right/top/bottom, skip)
  off += 4 * 8

  // Map name (null-terminated string with length prefix)
  buf.writeInt32LE(14, off); off += 4 // length
  buf.write('(4)TestMap', off, 11, 'utf8'); off += 128

  // Map description
  buf.writeInt32LE(1, off); off += 4
  off += 128

  // Players suggested
  buf.writeInt32LE(4, off); off += 4

  // Player name
  buf.writeInt32LE(1, off); off += 4
  off += 128

  // Unknown fields
  off += 4 + 4 + 4 + 4

  // Description
  buf.writeInt32LE(1, off); off += 4
  off += 128

  // Player data
  buf.writeInt32LE(4, off); off += 4

  const startPositions = [
    { x: 13*128, y: 13*128, team: 0 },
    { x: 13*128, y: 116*128, team: 1 },
    { x: 116*128, y: 13*128, team: 2 },
    { x: 116*128, y: 116*128, team: 3 },
  ]

  for (let i = 0; i < 4; i++) {
    const p = startPositions[i]
    buf.writeInt32LE(i, off); off += 4    // player id
    buf.writeInt32LE(p.team, off); off += 4 // team
    buf.writeInt32LE(1, off); off += 4     // race (human=1)
    buf.writeInt32LE(1, off); off += 4     // is computer
    buf.writeInt32LE(1, off); off += 4     // start position fixed
    buf.writeFloatLE(p.x, off); off += 4  // start X
    buf.writeFloatLE(p.y, off); off += 4  // start Y
    buf.writeInt32LE(0, off); off += 4     // ally priorities flag
    off += 4 * 16 // alliance matrix
  }

  return buf.subarray(0, off)
}

// ===== 主程序 =====
async function main() {
  const zip = new JSZip()

  zip.file('war3map.w3e', generateW3E())
  zip.file('war3map.w3i', generateW3I())

  const data = await zip.generateAsync({ type: 'nodebuffer' })
  fs.writeFileSync('public/maps/turtle_rock_test.w3x', data)

  console.log(`Generated map: public/maps/turtle_rock_test.w3x (${data.length} bytes)`)
  console.log(`  Size: ${MAP_SIZE}x${MAP_SIZE}`)
  console.log(`  Players: 4 (corners)`)
  console.log(`  Tileset: A (Lordaeron Summer)`)
}

main().catch(console.error)
