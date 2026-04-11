/**
 * UnitVisualFactory — 单位视觉创建（glTF 优先，fallback 到程序几何体）
 *
 * Worker 特殊处理：
 * - worker 使用增强版 RTS proxy（因为 worker.glb 是高面数角色模型，
 *   在 RTS 镜头下缺乏可读剪影，手指/脚趾等细节在远距离全是噪点）
 * - 其他单位仍走 glTF → proxy fallback 流程
 */

import * as THREE from 'three'
import { getLoadedModel } from './AssetLoader'

const TEAM_COLORS = [0x4488ff, 0xff4444]

/**
 * 创建单位视觉模型
 */
export function createUnitVisual(type: string, team: number): THREE.Group {
  // Worker: 强制使用增强版 RTS proxy（glTF 在 RTS 镜头下不可读）
  if (type === 'worker') {
    return createRTSWorkerProxy(team)
  }

  // 其他单位：优先尝试 glTF
  const gltf = getLoadedModel(type)
  if (gltf) {
    return applyTeamColorGLTF(gltf, team, type)
  }

  // Fallback: 程序几何体
  return createProxyUnit(type, team)
}

/**
 * 材质名 → 团队色槽映射
 */
const TEAM_COLOR_SLOTS: Record<string, string[]> = {
  footman: ['team_color', 'TeamColor'],
}

/**
 * 对 glTF 模型应用团队色
 * Exported for regression testing of per-instance color isolation.
 */
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

// ==================== RTS Worker Proxy ====================

/**
 * RTS 增强版 worker proxy
 *
 * 设计目标：在默认 RTS 镜头（FOV 45, distance 24）下一眼可辨
 *
 * 关键尺寸：
 * - 总高 ~1.85 单位（默认测试地图相机下仍有足够屏幕面积）
 * - 身体最宽处 ~1.0 单位（远距离仍可见，1 tile 间距内不互相吞没）
 * - 团队色占比 >50%（蓝/红是远距离辨识第一要素）
 * - 清晰剪影：圆头 + 宽肩工具包 + 窄腰 = 不是建筑/不是兵
 */
function createRTSWorkerProxy(team: number): THREE.Group {
  const group = new THREE.Group()
  const color = TEAM_COLORS[team]
  group.userData.healthBarY = 2.15

  // WC3-like baked contact shadow. Real shadows are camera/lighting dependent;
  // this keeps the worker anchored and visible on bright sand tiles.
  const contactShadow = new THREE.Mesh(
    new THREE.CircleGeometry(0.48, 18),
    new THREE.MeshBasicMaterial({
      color: 0x000000,
      transparent: true,
      opacity: 0.28,
      depthWrite: false,
    }),
  )
  contactShadow.rotation.x = -Math.PI / 2
  contactShadow.position.y = 0.015
  group.add(contactShadow)

  // === 腿部（深色短裤感，区分上下半身）===
  const legL = new THREE.Mesh(
    new THREE.CylinderGeometry(0.14, 0.16, 0.42, 6),
    new THREE.MeshLambertMaterial({ color: 0x4a3518 }),
  )
  legL.position.set(-0.13, 0.24, 0)
  group.add(legL)

  const legR = legL.clone()
  legR.position.set(0.13, 0.24, 0)
  group.add(legR)

  // === 身体（更宽更亮的工作服，避免在树影和暗地面里丢失）===
  const body = new THREE.Mesh(
    new THREE.CylinderGeometry(0.32, 0.40, 0.72, 8),
    new THREE.MeshLambertMaterial({ color: 0xb88a48 }),
  )
  body.position.y = 0.78
  group.add(body)

  // === 团队色大胸标（正面 + 背面，远距离可见）===
  const tabardFront = new THREE.Mesh(
    new THREE.BoxGeometry(0.58, 0.50, 0.05),
    new THREE.MeshLambertMaterial({ color }),
  )
  tabardFront.position.set(0, 0.84, 0.34)
  group.add(tabardFront)

  const tabardBack = new THREE.Mesh(
    new THREE.BoxGeometry(0.58, 0.50, 0.05),
    new THREE.MeshLambertMaterial({ color }),
  )
  tabardBack.position.set(0, 0.84, -0.34)
  group.add(tabardBack)

  // === 侧肩队伍色块：从 RTS 斜上方看时比正面胸标更稳定 ===
  const shoulderL = new THREE.Mesh(
    new THREE.BoxGeometry(0.18, 0.20, 0.44),
    new THREE.MeshLambertMaterial({ color }),
  )
  shoulderL.position.set(-0.38, 1.02, 0)
  group.add(shoulderL)

  const shoulderR = shoulderL.clone()
  shoulderR.position.x = 0.38
  group.add(shoulderR)

  // === 团队色宽腰带 ===
  const belt = new THREE.Mesh(
    new THREE.CylinderGeometry(0.41, 0.41, 0.12, 8),
    new THREE.MeshLambertMaterial({ color }),
  )
  belt.position.y = 0.58
  group.add(belt)

  // === 头（更大更圆，肤色）===
  const head = new THREE.Mesh(
    new THREE.SphereGeometry(0.24, 12, 8),
    new THREE.MeshLambertMaterial({ color: 0xddc8a0 }),
  )
  head.position.y = 1.34
  group.add(head)

  // === 团队色帽子（宽沿帽，远距离看得出是帽子）===
  // 帽沿
  const brim = new THREE.Mesh(
    new THREE.CylinderGeometry(0.36, 0.36, 0.04, 12),
    new THREE.MeshLambertMaterial({ color }),
  )
  brim.position.y = 1.52
  group.add(brim)
  // 帽顶
  const hatTop = new THREE.Mesh(
    new THREE.ConeGeometry(0.25, 0.34, 10),
    new THREE.MeshLambertMaterial({ color }),
  )
  hatTop.position.y = 1.71
  group.add(hatTop)

  // === 背包/工具（背影辨识特征：worker 背着东西）===
  const backpack = new THREE.Mesh(
    new THREE.BoxGeometry(0.40, 0.44, 0.26),
    new THREE.MeshLambertMaterial({ color: 0x6b4e1f }),
  )
  backpack.position.set(0, 0.88, -0.36)
  group.add(backpack)

  // === 镐（侧面伸出的工具，剪影辨识）===
  const pickShaft = new THREE.Mesh(
    new THREE.BoxGeometry(0.07, 0.86, 0.07),
    new THREE.MeshLambertMaterial({ color: 0x8b6914 }),
  )
  pickShaft.position.set(0.48, 0.96, 0)
  pickShaft.rotation.z = -0.3
  group.add(pickShaft)

  const pickHead = new THREE.Mesh(
    new THREE.BoxGeometry(0.32, 0.10, 0.10),
    new THREE.MeshLambertMaterial({ color: 0x999999 }),
  )
  pickHead.position.set(0.60, 1.38, 0)
  group.add(pickHead)

  // 开启阴影
  group.traverse((child) => {
    if (child instanceof THREE.Mesh) {
      child.castShadow = true
      child.receiveShadow = true
    }
  })

  return group
}

// ==================== Fallback 程序几何体（非 worker 单位）====================

function createProxyUnit(type: string, team: number): THREE.Group {
  const group = new THREE.Group()
  const color = TEAM_COLORS[team]

  if (type === 'footman') {
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

function createProxyFootman(group: THREE.Group, color: number) {
  // M3 scale contract: military units must read heavier than workers at RTS zoom.
  // Collision/pathing remains unchanged; this is only the visual adapter.
  group.userData.healthBarY = 2.35

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

  const shieldRim = new THREE.Mesh(
    new THREE.BoxGeometry(0.09, 0.58, 0.48),
    new THREE.MeshLambertMaterial({ color: 0x666666 }),
  )
  shieldRim.position.set(-0.38, 0.55, 0)
  group.add(shieldRim)

  const shield = new THREE.Mesh(
    new THREE.BoxGeometry(0.1, 0.42, 0.32),
    new THREE.MeshLambertMaterial({ color }),
  )
  shield.position.set(-0.43, 0.55, 0)
  group.add(shield)

  group.scale.setScalar(1.5)
}
