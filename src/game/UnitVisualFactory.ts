/**
 * UnitVisualFactory — 单位视觉创建（glTF 优先，fallback 到程序几何体）
 *
 * 职责：
 * - 尝试从 AssetLoader 获取 glTF 模型
 * - 失败时自动回退到程序几何体
 * - 应用团队色
 * - 返回 THREE.Group，可直接 add 到 scene
 */

import * as THREE from 'three'
import { getLoadedModel } from './AssetLoader'

const TEAM_COLORS = [0x4488ff, 0xff4444]

/**
 * 创建单位视觉模型
 * @param type 单位类型（worker / footman）
 * @param team 阵营（0=蓝方, 1=红方）
 * @returns THREE.Group — 可直接 scene.add()
 */
export function createUnitVisual(type: string, team: number): THREE.Group {
  // 优先尝试 glTF
  const gltf = getLoadedModel(type)
  if (gltf) {
    return applyTeamColorGLTF(gltf, team, type)
  }

  // Fallback: 程序几何体
  return createProxyUnit(type, team)
}

/**
 * 材质名 → 团队色槽映射
 * key = asset type, value = 需要被替换为团队色的材质名列表
 */
const TEAM_COLOR_SLOTS: Record<string, string[]> = {
  worker: ['team_color', 'TeamColor', 'Red'],
  footman: ['team_color', 'TeamColor'],
}

/**
 * 对 glTF 模型应用团队色（查找可替换材质并设置 color）
 */
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

function createProxyUnit(type: string, team: number): THREE.Group {
  const group = new THREE.Group()
  const color = TEAM_COLORS[team]

  if (type === 'worker') {
    createProxyWorker(group, color)
  } else if (type === 'footman') {
    createProxyFootman(group, color)
  } else {
    // 通用 fallback
    const body = new THREE.Mesh(
      new THREE.CylinderGeometry(0.25, 0.3, 0.7, 8),
      new THREE.MeshLambertMaterial({ color: 0x888888 }),
    )
    body.position.y = 0.35
    group.add(body)
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

function createProxyWorker(group: THREE.Group, color: number) {
  const body = new THREE.Mesh(
    new THREE.CylinderGeometry(0.22, 0.28, 0.6, 8),
    new THREE.MeshLambertMaterial({ color: 0x8b6914 }),
  )
  body.position.y = 0.3
  group.add(body)

  const belt = new THREE.Mesh(
    new THREE.CylinderGeometry(0.24, 0.24, 0.1, 8),
    new THREE.MeshLambertMaterial({ color }),
  )
  belt.position.y = 0.45
  group.add(belt)

  const head = new THREE.Mesh(
    new THREE.SphereGeometry(0.14, 8, 6),
    new THREE.MeshLambertMaterial({ color: 0xddc8a0 }),
  )
  head.position.y = 0.72
  group.add(head)

  const hat = new THREE.Mesh(
    new THREE.ConeGeometry(0.14, 0.18, 6),
    new THREE.MeshLambertMaterial({ color }),
  )
  hat.position.y = 0.86
  group.add(hat)

  const pick = new THREE.Mesh(
    new THREE.BoxGeometry(0.05, 0.55, 0.05),
    new THREE.MeshLambertMaterial({ color: 0x888888 }),
  )
  pick.position.set(-0.22, 0.5, -0.15)
  pick.rotation.z = 0.3
  group.add(pick)

  const pickHead = new THREE.Mesh(
    new THREE.BoxGeometry(0.15, 0.06, 0.06),
    new THREE.MeshLambertMaterial({ color: 0x777777 }),
  )
  pickHead.position.set(-0.22, 0.78, -0.15)
  group.add(pickHead)
}

function createProxyFootman(group: THREE.Group, color: number) {
  const body = new THREE.Mesh(
    new THREE.CylinderGeometry(0.28, 0.32, 0.9, 8),
    new THREE.MeshLambertMaterial({ color: 0x787878 }),
  )
  body.position.y = 0.45
  group.add(body)

  const shoulderL = new THREE.Mesh(
    new THREE.BoxGeometry(0.22, 0.14, 0.28),
    new THREE.MeshLambertMaterial({ color: 0x888888 }),
  )
  shoulderL.position.set(-0.32, 0.82, 0)
  group.add(shoulderL)

  const shoulderR = new THREE.Mesh(
    new THREE.BoxGeometry(0.22, 0.14, 0.28),
    new THREE.MeshLambertMaterial({ color: 0x888888 }),
  )
  shoulderR.position.set(0.32, 0.82, 0)
  group.add(shoulderR)

  const tabard = new THREE.Mesh(
    new THREE.BoxGeometry(0.42, 0.55, 0.06),
    new THREE.MeshLambertMaterial({ color }),
  )
  tabard.position.set(0, 0.48, 0.24)
  group.add(tabard)

  const helmet = new THREE.Mesh(
    new THREE.SphereGeometry(0.2, 8, 6),
    new THREE.MeshLambertMaterial({ color: 0x999999 }),
  )
  helmet.position.y = 1.06
  group.add(helmet)

  const noseGuard = new THREE.Mesh(
    new THREE.BoxGeometry(0.04, 0.12, 0.12),
    new THREE.MeshLambertMaterial({ color: 0x888888 }),
  )
  noseGuard.position.set(0, 1.0, 0.18)
  group.add(noseGuard)

  const plume = new THREE.Mesh(
    new THREE.ConeGeometry(0.06, 0.2, 4),
    new THREE.MeshLambertMaterial({ color }),
  )
  plume.position.set(0, 1.26, 0)
  group.add(plume)

  const blade = new THREE.Mesh(
    new THREE.BoxGeometry(0.06, 0.9, 0.1),
    new THREE.MeshLambertMaterial({ color: 0xcccccc }),
  )
  blade.position.set(0.4, 0.75, 0)
  group.add(blade)

  const hilt = new THREE.Mesh(
    new THREE.BoxGeometry(0.04, 0.18, 0.24),
    new THREE.MeshLambertMaterial({ color: 0x8b6914 }),
  )
  hilt.position.set(0.4, 0.28, 0)
  group.add(hilt)

  const shield = new THREE.Mesh(
    new THREE.BoxGeometry(0.08, 0.5, 0.4),
    new THREE.MeshLambertMaterial({ color }),
  )
  shield.position.set(-0.38, 0.55, 0)
  group.add(shield)

  const shieldRim = new THREE.Mesh(
    new THREE.BoxGeometry(0.09, 0.52, 0.42),
    new THREE.MeshLambertMaterial({ color: 0x666666 }),
  )
  shieldRim.position.set(-0.38, 0.55, 0)
  group.add(shieldRim)
}
