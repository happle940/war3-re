/**
 * BuildingVisualFactory — 建筑视觉创建（glTF 优先，fallback 到程序几何体）
 *
 * 职责同 UnitVisualFactory，但针对建筑的特殊处理：
 * - 建筑不应用团队色到主体（建筑自身材质）
 * - goldmine 使用原创代理方案
 */

import * as THREE from 'three'
import { getLoadedModel } from './AssetLoader'
import { BUILDINGS } from './GameData'

const TEAM_COLORS = [0x4488ff, 0xff4444]

/**
 * 创建建筑视觉模型
 */
export function createBuildingVisual(type: string, team: number): THREE.Group {
  // 优先尝试 glTF
  const gltf = getLoadedModel(type)
  if (gltf) {
    return applyTeamColorGLTF(gltf, team, type)
  }

  // Fallback: 程序几何体
  return createProxyBuilding(type, team)
}

/**
 * 材质名 → 团队色槽映射
 * key = asset type, value = 需要被替换为团队色的材质名列表
 */
const TEAM_COLOR_SLOTS: Record<string, string[]> = {
  townhall: ['team_color', 'TeamColor', 'Main'],
  barracks: ['team_color', 'TeamColor'],
  farm: ['team_color', 'TeamColor'],
  tower: ['team_color', 'TeamColor'],
}

export function applyTeamColorGLTF(group: THREE.Group, team: number, type: string): THREE.Group {
  const color = TEAM_COLORS[team]
  const slots = TEAM_COLOR_SLOTS[type] ?? ['team_color', 'TeamColor']
  const slotSet = new Set(slots)

  group.traverse((child) => {
    if (child instanceof THREE.Mesh && child.material) {
      const mats = Array.isArray(child.material) ? child.material : [child.material]
      for (const mat of mats) {
        const stdMat = mat as THREE.MeshStandardMaterial
        if (slotSet.has(stdMat.name)) {
          stdMat.color.setHex(color)
        }
      }
    }
  })
  return group
}

// ==================== Fallback 程序几何体 ====================

function createProxyBuilding(type: string, team: number): THREE.Group {
  const group = new THREE.Group()
  const color = TEAM_COLORS[team]

  if (type === 'townhall') {
    createProxyTownhall(group, color)
  } else if (type === 'barracks') {
    createProxyBarracks(group, color)
  } else if (type === 'farm') {
    createProxyFarm(group)
  } else if (type === 'tower') {
    createProxyTower(group, color)
  } else if (type === 'goldmine') {
    createProxyGoldmine(group)
  } else {
    // 通用 fallback
    const s = BUILDINGS[type]?.size ?? 1
    const base = new THREE.Mesh(
      new THREE.BoxGeometry(s, s * 0.4, s),
      new THREE.MeshLambertMaterial({ color: 0x888888 }),
    )
    base.position.y = s * 0.2
    group.add(base)
  }

  // 开启阴影
  group.traverse((child) => {
    if (child instanceof THREE.Mesh) {
      child.castShadow = true
      child.receiveShadow = true
    }
  })

  return group
}

function createProxyTownhall(group: THREE.Group, color: number) {
  // size=4: dominant base building, wider than all others
  const stone = new THREE.Mesh(
    new THREE.BoxGeometry(3.6, 0.6, 3.6),
    new THREE.MeshLambertMaterial({ color: 0x808070 }),
  )
  stone.position.y = 0.3
  group.add(stone)

  const walls = new THREE.Mesh(
    new THREE.BoxGeometry(3.4, 1.2, 3.4),
    new THREE.MeshLambertMaterial({ color: 0xa08050 }),
  )
  walls.position.y = 1.1
  group.add(walls)

  const beam = new THREE.Mesh(
    new THREE.BoxGeometry(3.5, 0.08, 3.5),
    new THREE.MeshLambertMaterial({ color: 0x5c3a1e }),
  )
  beam.position.y = 0.65
  group.add(beam)

  const roof = new THREE.Mesh(
    new THREE.ConeGeometry(2.6, 1.6, 4),
    new THREE.MeshLambertMaterial({ color: 0x8b4513 }),
  )
  roof.position.y = 2.5
  roof.rotation.y = Math.PI / 4
  group.add(roof)

  const pole = new THREE.Mesh(
    new THREE.CylinderGeometry(0.04, 0.04, 2.5, 4),
    new THREE.MeshLambertMaterial({ color: 0x888888 }),
  )
  pole.position.set(1.4, 2.8, 0)
  group.add(pole)

  const flag = new THREE.Mesh(
    new THREE.PlaneGeometry(0.6, 0.4),
    new THREE.MeshLambertMaterial({ color, side: THREE.DoubleSide }),
  )
  flag.position.set(1.7, 3.8, 0)
  group.add(flag)

  const door = new THREE.Mesh(
    new THREE.BoxGeometry(0.8, 1.0, 0.06),
    new THREE.MeshLambertMaterial({ color: 0x5c3a1e }),
  )
  door.position.set(0, 0.7, 1.73)
  group.add(door)

  const doorArch = new THREE.Mesh(
    new THREE.CylinderGeometry(0.4, 0.4, 0.06, 8, 1, false, 0, Math.PI),
    new THREE.MeshLambertMaterial({ color: 0x706050 }),
  )
  doorArch.position.set(0, 1.2, 1.73)
  doorArch.rotation.z = Math.PI / 2
  doorArch.rotation.y = Math.PI / 2
  group.add(doorArch)

  const winMat = new THREE.MeshLambertMaterial({ color: 0xddc880, emissive: 0x332200 })
  const win1 = new THREE.Mesh(new THREE.PlaneGeometry(0.35, 0.35), winMat)
  win1.position.set(1.0, 1.15, 1.73)
  group.add(win1)
  const win2 = new THREE.Mesh(new THREE.PlaneGeometry(0.35, 0.35), winMat)
  win2.position.set(-1.0, 1.15, 1.73)
  group.add(win2)
}

function createProxyBarracks(group: THREE.Group, color: number) {
  // size=3: mid-size production building.
  // Keep its visual bbox below Town Hall; production identity comes from gate/crest,
  // not from being wider than the base anchor.
  const stonework = new THREE.Mesh(
    new THREE.BoxGeometry(2.4, 0.35, 2.1),
    new THREE.MeshLambertMaterial({ color: 0x707060 }),
  )
  stonework.position.y = 0.175
  group.add(stonework)

  const base = new THREE.Mesh(
    new THREE.BoxGeometry(2.2, 1.1, 1.9),
    new THREE.MeshLambertMaterial({ color: 0x604020 }),
  )
  base.position.y = 0.9
  group.add(base)

  // Wide military gate — primary production cue
  const gateFrame = new THREE.Mesh(
    new THREE.BoxGeometry(1.0, 1.05, 0.08),
    new THREE.MeshLambertMaterial({ color: 0x2a1a0a }),
  )
  gateFrame.position.set(0, 0.7, 0.98)
  group.add(gateFrame)

  // Gate arch (semicircle above gate)
  const gateArch = new THREE.Mesh(
    new THREE.CylinderGeometry(0.5, 0.5, 0.08, 12, 1, false, 0, Math.PI),
    new THREE.MeshLambertMaterial({ color: 0x5c3a1e }),
  )
  gateArch.position.set(0, 1.22, 0.98)
  gateArch.rotation.z = Math.PI / 2
  gateArch.rotation.y = Math.PI / 2
  group.add(gateArch)

  // Shield emblem on facade — cross shape, team color
  const shieldH = new THREE.Mesh(
    new THREE.BoxGeometry(0.5, 0.12, 0.06),
    new THREE.MeshLambertMaterial({ color }),
  )
  shieldH.position.set(0, 1.42, 1.0)
  group.add(shieldH)
  const shieldV = new THREE.Mesh(
    new THREE.BoxGeometry(0.12, 0.5, 0.06),
    new THREE.MeshLambertMaterial({ color }),
  )
  shieldV.position.set(0, 1.42, 1.0)
  group.add(shieldV)

  // Roof
  const roof = new THREE.Mesh(
    new THREE.ConeGeometry(0.9, 1.1, 4),
    new THREE.MeshLambertMaterial({ color: 0x5c3a1e }),
  )
  roof.position.y = 2.0
  roof.rotation.y = Math.PI / 4
  group.add(roof)

  // Crossed swords above gate — production identity
  const swordMat = new THREE.MeshLambertMaterial({ color: 0xcccccc })
  const swordL = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.6, 0.04), swordMat)
  swordL.position.set(-0.15, 1.0, 1.04)
  swordL.rotation.z = 0.3
  group.add(swordL)
  const swordR = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.6, 0.04), swordMat)
  swordR.position.set(0.15, 1.0, 1.04)
  swordR.rotation.z = -0.3
  group.add(swordR)

  // Anvil outside gate — crafting/production cue
  const anvilBase = new THREE.Mesh(
    new THREE.BoxGeometry(0.32, 0.22, 0.28),
    new THREE.MeshLambertMaterial({ color: 0x555555 }),
  )
  anvilBase.position.set(0.82, 0.11, 1.08)
  group.add(anvilBase)
  const anvilTop = new THREE.Mesh(
    new THREE.BoxGeometry(0.42, 0.1, 0.34),
    new THREE.MeshLambertMaterial({ color: 0x666666 }),
  )
  anvilTop.position.set(0.82, 0.26, 1.08)
  group.add(anvilTop)

  // Team color banner: kept inside bbox so it does not distort scale metrics.
  const pole = new THREE.Mesh(
    new THREE.CylinderGeometry(0.035, 0.035, 1.25, 4),
    new THREE.MeshLambertMaterial({ color: 0x888888 }),
  )
  pole.position.set(-0.92, 1.55, 0.62)
  group.add(pole)

  const flag = new THREE.Mesh(
    new THREE.PlaneGeometry(0.46, 0.32),
    new THREE.MeshLambertMaterial({ color, side: THREE.DoubleSide }),
  )
  flag.position.set(-0.92, 2.08, 0.62)
  group.add(flag)
}

function createProxyFarm(group: THREE.Group) {
  // Farm is a compact size=2 wall/supply piece; M3 measures completed visuals only.
  const base = new THREE.Mesh(
    new THREE.BoxGeometry(1.5, 0.4, 1.3),
    new THREE.MeshLambertMaterial({ color: 0x907050 }),
  )
  base.position.y = 0.2
  group.add(base)

  const roof = new THREE.Mesh(
    new THREE.ConeGeometry(1.1, 0.6, 2),
    new THREE.MeshLambertMaterial({ color: 0x8b6914 }),
  )
  roof.position.y = 0.7
  group.add(roof)
}

function createProxyTower(group: THREE.Group, color: number) {
  // size=2: tall narrow silhouette — defense/watchtower identity
  // Taller body (2.4) for skyline visibility at RTS distance
  const base = new THREE.Mesh(
    new THREE.CylinderGeometry(0.50, 0.62, 2.4, 8),
    new THREE.MeshLambertMaterial({ color: 0x808070 }),
  )
  base.position.y = 1.2
  group.add(base)

  // Team color band — horizontal stripe, primary team identity at distance
  const band = new THREE.Mesh(
    new THREE.CylinderGeometry(0.54, 0.54, 0.25, 8),
    new THREE.MeshLambertMaterial({ color }),
  )
  band.position.y = 1.8
  group.add(band)

  // Wider platform top
  const top = new THREE.Mesh(
    new THREE.CylinderGeometry(0.64, 0.54, 0.3, 8),
    new THREE.MeshLambertMaterial({ color: 0x707060 }),
  )
  top.position.y = 2.55
  group.add(top)

  // Bigger merlons — readable crenellations
  for (let i = 0; i < 4; i++) {
    const merlon = new THREE.Mesh(
      new THREE.BoxGeometry(0.22, 0.24, 0.22),
      new THREE.MeshLambertMaterial({ color: 0x707060 }),
    )
    const angle = (i / 4) * Math.PI * 2
    merlon.position.set(Math.sin(angle) * 0.55, 2.82, Math.cos(angle) * 0.55)
    group.add(merlon)
  }

  // Arrow slits — dark vertical lines on 4 sides, military defense cue
  const slitMat = new THREE.MeshLambertMaterial({ color: 0x222222, emissive: 0x110800 })
  for (let i = 0; i < 4; i++) {
    const angle = (i / 4) * Math.PI * 2 + Math.PI / 4 // offset from merlons
    const slit = new THREE.Mesh(
      new THREE.BoxGeometry(0.04, 0.35, 0.12),
      slitMat,
    )
    const r = 0.53
    slit.position.set(Math.sin(angle) * r, 1.4, Math.cos(angle) * r)
    slit.rotation.y = -angle
    group.add(slit)
  }

  // Spire — taller for skyline
  const spire = new THREE.Mesh(
    new THREE.ConeGeometry(0.35, 0.8, 8),
    new THREE.MeshLambertMaterial({ color: 0x555555 }),
  )
  spire.position.y = 3.1
  group.add(spire)

  // Team color flag — bigger for visibility
  const towerFlag = new THREE.Mesh(
    new THREE.PlaneGeometry(0.35, 0.25),
    new THREE.MeshLambertMaterial({ color, side: THREE.DoubleSide }),
  )
  towerFlag.position.set(0.15, 3.35, 0)
  group.add(towerFlag)
}

/**
 * 金矿：原创代理方案
 * - 岩石基座
 * - 金色晶体簇（加大、加高）
 * - 金色底环（资源池语义）
 * - 强发光点光源
 * - 可读的资源点语义
 */
function createProxyGoldmine(group: THREE.Group) {
  const rock = new THREE.Mesh(
    new THREE.BoxGeometry(2.8, 1.4, 2.8),
    new THREE.MeshLambertMaterial({ color: 0x6a6050 }),
  )
  rock.position.y = 0.7
  group.add(rock)

  const bump1 = new THREE.Mesh(
    new THREE.BoxGeometry(0.8, 0.6, 0.6),
    new THREE.MeshLambertMaterial({ color: 0x7a7060 }),
  )
  bump1.position.set(-1.0, 1.0, 1.0)
  group.add(bump1)

  const bump2 = new THREE.Mesh(
    new THREE.BoxGeometry(0.6, 0.5, 0.7),
    new THREE.MeshLambertMaterial({ color: 0x706858 }),
  )
  bump2.position.set(1.0, 0.8, -0.8)
  group.add(bump2)

  // Golden base ring — gold pooling around rock, resource identity
  const ring = new THREE.Mesh(
    new THREE.TorusGeometry(1.3, 0.12, 6, 16),
    new THREE.MeshLambertMaterial({ color: 0xffcc00, emissive: 0x886600 }),
  )
  ring.position.y = 0.15
  ring.rotation.x = Math.PI / 2
  group.add(ring)

  // Main crystal — taller (scale y=2.0) for skyline visibility
  const crystal1 = new THREE.Mesh(
    new THREE.OctahedronGeometry(0.55, 0),
    new THREE.MeshLambertMaterial({ color: 0xffdd00, emissive: 0xcc9900 }),
  )
  crystal1.position.set(0, 2.0, 0)
  crystal1.scale.set(1, 2.0, 1)
  group.add(crystal1)

  // Secondary crystals — brighter emissive
  const crystalMat = new THREE.MeshLambertMaterial({ color: 0xffcc00, emissive: 0x997700 })
  const crystal2 = new THREE.Mesh(new THREE.OctahedronGeometry(0.32, 0), crystalMat)
  crystal2.position.set(0.9, 1.4, 0.6)
  crystal2.scale.set(1, 1.5, 1)
  group.add(crystal2)

  const crystal3 = new THREE.Mesh(new THREE.OctahedronGeometry(0.28, 0), crystalMat)
  crystal3.position.set(-0.7, 1.3, -0.8)
  crystal3.scale.set(1, 1.4, 1)
  group.add(crystal3)

  const crystal4 = new THREE.Mesh(new THREE.OctahedronGeometry(0.24, 0), crystalMat)
  crystal4.position.set(-0.4, 1.6, 0.9)
  crystal4.scale.set(1, 1.3, 1)
  group.add(crystal4)

  const crystal5 = new THREE.Mesh(new THREE.OctahedronGeometry(0.22, 0), crystalMat)
  crystal5.position.set(0.5, 1.1, -1.0)
  crystal5.scale.set(1, 1.3, 1)
  group.add(crystal5)

  // Extra small crystal for denser cluster
  const crystal6 = new THREE.Mesh(new THREE.OctahedronGeometry(0.18, 0), crystalMat)
  crystal6.position.set(0.3, 1.8, -0.5)
  crystal6.scale.set(1, 1.2, 1)
  group.add(crystal6)

  // Sparkle points — small bright spheres at crystal tips
  const sparkleMat = new THREE.MeshBasicMaterial({ color: 0xffffaa })
  const sparkle1 = new THREE.Mesh(new THREE.SphereGeometry(0.06, 4, 4), sparkleMat)
  sparkle1.position.set(0, 3.1, 0)
  group.add(sparkle1)
  const sparkle2 = new THREE.Mesh(new THREE.SphereGeometry(0.04, 4, 4), sparkleMat)
  sparkle2.position.set(0.9, 2.0, 0.6)
  group.add(sparkle2)

  // Stronger golden point light — wider range for RTS visibility
  const glow = new THREE.PointLight(0xffaa00, 2.5, 12)
  glow.position.set(0, 2.5, 0)
  group.add(glow)
}
