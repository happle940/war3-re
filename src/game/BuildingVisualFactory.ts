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

function applyTeamColorGLTF(group: THREE.Group, team: number, type: string): THREE.Group {
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
  // size=3: mid-size production building
  const stonework = new THREE.Mesh(
    new THREE.BoxGeometry(2.6, 0.3, 2.4),
    new THREE.MeshLambertMaterial({ color: 0x707060 }),
  )
  stonework.position.y = 0.15
  group.add(stonework)

  const base = new THREE.Mesh(
    new THREE.BoxGeometry(2.4, 0.9, 2.2),
    new THREE.MeshLambertMaterial({ color: 0x604020 }),
  )
  base.position.y = 0.75
  group.add(base)

  const doorSpace = new THREE.Mesh(
    new THREE.BoxGeometry(0.7, 0.8, 0.06),
    new THREE.MeshLambertMaterial({ color: 0x1a1208 }),
  )
  doorSpace.position.set(0, 0.55, 1.13)
  group.add(doorSpace)

  const roof = new THREE.Mesh(
    new THREE.ConeGeometry(1.9, 1.1, 4),
    new THREE.MeshLambertMaterial({ color: 0x5c3a1e }),
  )
  roof.position.y = 1.8
  roof.rotation.y = Math.PI / 4
  group.add(roof)

  const weaponRack = new THREE.Mesh(
    new THREE.BoxGeometry(0.06, 1.0, 0.06),
    new THREE.MeshLambertMaterial({ color: 0x5c3a1e }),
  )
  weaponRack.position.set(0.85, 0.5, 1.13)
  group.add(weaponRack)

  const sword1 = new THREE.Mesh(
    new THREE.BoxGeometry(0.04, 0.5, 0.04),
    new THREE.MeshLambertMaterial({ color: 0xcccccc }),
  )
  sword1.position.set(0.85, 0.7, 1.2)
  group.add(sword1)

  const pole = new THREE.Mesh(
    new THREE.CylinderGeometry(0.03, 0.03, 1.2, 4),
    new THREE.MeshLambertMaterial({ color: 0x888888 }),
  )
  pole.position.set(-0.8, 1.5, 0.7)
  group.add(pole)

  const flag = new THREE.Mesh(
    new THREE.PlaneGeometry(0.45, 0.3),
    new THREE.MeshLambertMaterial({ color, side: THREE.DoubleSide }),
  )
  flag.position.set(-0.8, 2.0, 0.7)
  group.add(flag)
}

function createProxyFarm(group: THREE.Group) {
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
  // size=2: narrow but not invisible
  const base = new THREE.Mesh(
    new THREE.CylinderGeometry(0.52, 0.62, 1.8, 8),
    new THREE.MeshLambertMaterial({ color: 0x808070 }),
  )
  base.position.y = 0.9
  group.add(base)

  const top = new THREE.Mesh(
    new THREE.CylinderGeometry(0.62, 0.54, 0.3, 8),
    new THREE.MeshLambertMaterial({ color: 0x707060 }),
  )
  top.position.y = 1.95
  group.add(top)

  for (let i = 0; i < 4; i++) {
    const merlon = new THREE.Mesh(
      new THREE.BoxGeometry(0.15, 0.18, 0.15),
      new THREE.MeshLambertMaterial({ color: 0x707060 }),
    )
    const angle = (i / 4) * Math.PI * 2
    merlon.position.set(Math.sin(angle) * 0.52, 2.18, Math.cos(angle) * 0.52)
    group.add(merlon)
  }

  const spire = new THREE.Mesh(
    new THREE.ConeGeometry(0.35, 0.6, 8),
    new THREE.MeshLambertMaterial({ color: 0x555555 }),
  )
  spire.position.y = 2.5
  group.add(spire)

  const towerFlag = new THREE.Mesh(
    new THREE.PlaneGeometry(0.25, 0.18),
    new THREE.MeshLambertMaterial({ color, side: THREE.DoubleSide }),
  )
  towerFlag.position.set(0, 2.7, 0)
  group.add(towerFlag)
}

/**
 * 金矿：原创代理方案
 * - 岩石基座
 * - 金色晶体簇
 * - 发光点光源
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

  const crystal1 = new THREE.Mesh(
    new THREE.OctahedronGeometry(0.5, 0),
    new THREE.MeshLambertMaterial({ color: 0xffdd00, emissive: 0xaa8800 }),
  )
  crystal1.position.set(0, 1.8, 0)
  crystal1.scale.set(1, 1.5, 1)
  group.add(crystal1)

  const crystalMat = new THREE.MeshLambertMaterial({ color: 0xffcc00, emissive: 0x775500 })
  const crystal2 = new THREE.Mesh(new THREE.OctahedronGeometry(0.28, 0), crystalMat)
  crystal2.position.set(0.9, 1.3, 0.6)
  crystal2.scale.set(1, 1.3, 1)
  group.add(crystal2)

  const crystal3 = new THREE.Mesh(new THREE.OctahedronGeometry(0.24, 0), crystalMat)
  crystal3.position.set(-0.7, 1.2, -0.8)
  crystal3.scale.set(1, 1.2, 1)
  group.add(crystal3)

  const crystal4 = new THREE.Mesh(new THREE.OctahedronGeometry(0.2, 0), crystalMat)
  crystal4.position.set(-0.4, 1.5, 0.9)
  group.add(crystal4)

  const crystal5 = new THREE.Mesh(new THREE.OctahedronGeometry(0.18, 0), crystalMat)
  crystal5.position.set(0.5, 1.0, -1.0)
  group.add(crystal5)

  const glow = new THREE.PointLight(0xffaa00, 1.5, 8)
  glow.position.set(0, 2.2, 0)
  group.add(glow)
}
