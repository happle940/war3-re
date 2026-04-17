/**
 * UnitVisualFactory — 单位视觉创建（glTF 优先，fallback 到程序几何体）
 *
 * Runtime route:
 * - every cataloged unit uses a local glTF model when loaded
 * - fallback geometry remains only for missing/failed assets
 * - real models get small non-box role/team cues so RTS readability survives
 */

import * as THREE from 'three'
import { getLoadedModel } from './AssetLoader'

const TEAM_COLORS = [0x4488ff, 0xff4444]
const WORKER_SPRITE_TEXTURES = new Map<number, THREE.CanvasTexture>()
const REAL_MODEL_ROUTE = 'real-gltf-unit-model'

const UNIT_HEALTH_BAR_Y: Record<string, number> = {
  worker: 2.35,
  footman: 2.45,
  rifleman: 2.35,
  mortar_team: 1.75,
  priest: 2.45,
  militia: 2.35,
  sorceress: 2.45,
  knight: 2.55,
  paladin: 2.7,
}

/**
 * 创建单位视觉模型
 */
export function createUnitVisual(type: string, team: number): THREE.Group {
  // Cataloged units: use real glTF model first.
  const gltf = getLoadedModel(type)
  if (gltf) {
    return applyUnitModelAdapter(gltf, team, type)
  }

  // Worker still has a hand-authored peasant fallback if the model fails.
  if (type === 'worker') {
    return createRTSWorkerProxy(team)
  }

  // Fallback: 程序几何体
  return createProxyUnit(type, team)
}

/**
 * 材质名 → 团队色槽映射
 */
const TEAM_COLOR_SLOTS: Record<string, string[]> = {
  worker: ['LightBlue', 'Red', 'team_color', 'TeamColor'],
  footman: ['team_color', 'TeamColor'],
  rifleman: ['Green', 'LightGreen', 'Swat', 'team_color', 'TeamColor'],
  militia: ['Worker_Yellow', 'Worker_Vest', 'team_color', 'TeamColor'],
  sorceress: ['Wizard_Secondary', 'team_color', 'TeamColor'],
  paladin: ['Blue', 'team_color', 'TeamColor'],
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
        if (slotSet.has(stdMat.name) && stdMat.color instanceof THREE.Color) {
          stdMat.color.setHex(color)
        }
      }
    }
  })
  return group
}

function applyUnitModelAdapter(group: THREE.Group, team: number, type: string): THREE.Group {
  applyTeamColorGLTF(group, team, type)
  group.userData.healthBarY = UNIT_HEALTH_BAR_Y[type] ?? 2.2
  group.userData.visualRoute = REAL_MODEL_ROUTE
  group.userData.unitModelType = type

  // Test fixture assets assert raw clone/scale behavior; keep them unadorned.
  if (group.userData.assetPath === '__test__') return group

  polishUnitMaterials(group, type)
  addModelGrounding(group, team)
  addRoleCue(group, team, type)

  group.traverse((child) => {
    if (child instanceof THREE.Mesh) {
      child.castShadow = true
      child.receiveShadow = true
    }
  })

  return group
}

const MATERIAL_LIGHTNESS_BOOST: Record<string, number> = {
  worker: 0.04,
  footman: 0.08,
  rifleman: 0.06,
  mortar_team: 0.06,
  priest: 0.08,
  militia: 0.05,
  sorceress: 0.07,
  knight: 0.08,
  paladin: 0.06,
}

function polishUnitMaterials(group: THREE.Group, type: string) {
  const lightnessBoost = MATERIAL_LIGHTNESS_BOOST[type] ?? 0.06
  group.traverse((child) => {
    if (!(child instanceof THREE.Mesh) || !child.material) return
    const mats = Array.isArray(child.material) ? child.material : [child.material]
    for (const mat of mats) {
      if (!mat) continue
      const material = mat as THREE.MeshStandardMaterial | THREE.MeshLambertMaterial
      if (material.color instanceof THREE.Color) {
        if (material.name.toLowerCase().includes('black')) {
          material.color.offsetHSL(0, 0.04, 0.16)
        } else {
          material.color.offsetHSL(0, 0.03, lightnessBoost)
        }
      }
      if ('emissive' in material && material.emissive instanceof THREE.Color && material.color instanceof THREE.Color) {
        material.emissive.copy(material.color).multiplyScalar(0.055)
      }
      if ('roughness' in material && typeof material.roughness === 'number') {
        material.roughness = Math.min(0.88, Math.max(0.48, material.roughness))
      }
      if ('metalness' in material && typeof material.metalness === 'number') {
        material.metalness = Math.min(0.18, material.metalness)
      }
      material.needsUpdate = true
    }
  })
}

function adapterRootScale(root: THREE.Group): number {
  return Math.max(Math.abs(root.scale.x), Math.abs(root.scale.y), Math.abs(root.scale.z), 0.0001)
}

function addWorldSpaceChild(
  root: THREE.Group,
  child: THREE.Object3D,
  position: THREE.Vector3Tuple,
) {
  const scale = adapterRootScale(root)
  child.position.set(position[0] / scale, position[1] / scale, position[2] / scale)
  child.scale.setScalar(1 / scale)
  root.add(child)
}

function addWorldSpaceChildPreserveScale(
  root: THREE.Group,
  child: THREE.Object3D,
  position: THREE.Vector3Tuple,
  worldScaleMultiplier: number,
) {
  const scale = adapterRootScale(root)
  child.position.set(position[0] / scale, position[1] / scale, position[2] / scale)
  child.scale.multiplyScalar(worldScaleMultiplier / scale)
  root.add(child)
}

function createTeamMaterial(team: number, opacity = 1): THREE.MeshLambertMaterial {
  return new THREE.MeshLambertMaterial({
    color: TEAM_COLORS[team],
    transparent: opacity < 1,
    opacity,
  })
}

function addModelGrounding(root: THREE.Group, team: number) {
  const shadow = new THREE.Mesh(
    new THREE.CircleGeometry(0.62, 24),
    new THREE.MeshBasicMaterial({
      color: 0x000000,
      transparent: true,
      opacity: 0.22,
      depthWrite: false,
    }),
  )
  shadow.name = 'unit-real-model-contact-shadow'
  shadow.rotation.x = -Math.PI / 2
  shadow.renderOrder = 1
  addWorldSpaceChild(root, shadow, [0, 0.018, 0])

  const ring = new THREE.Mesh(
    new THREE.TorusGeometry(0.55, 0.025, 8, 32),
    createTeamMaterial(team, 0.95),
  )
  ring.name = 'unit-team-ownership-ring'
  ring.rotation.x = Math.PI / 2
  addWorldSpaceChild(root, ring, [0, 0.052, 0])
}

function addRoleCue(root: THREE.Group, team: number, type: string) {
  if (type === 'worker') {
    addPickaxe(root, team, 'worker-tool-real-model-pickaxe')
    return
  }
  if (type === 'militia') {
    addMilitiaAxe(root, team)
    return
  }
  if (type === 'rifleman') {
    addRifle(root, team)
    return
  }
  if (type === 'footman' || type === 'knight') {
    addRoundShield(root, team, type)
    return
  }
  if (type === 'paladin') {
    addPaladinHalo(root, team)
    return
  }
  if (type === 'mortar_team') {
    addMortarPennant(root, team)
    return
  }
  if (type === 'priest' || type === 'sorceress') {
    addCasterFocus(root, team, type)
  }
}

function addPickaxe(root: THREE.Group, team: number, prefix: string) {
  const woodMat = new THREE.MeshLambertMaterial({ color: 0x8b5a24 })
  const metalMat = new THREE.MeshLambertMaterial({ color: 0xb7b4a6 })

  const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.032, 0.038, 1.05, 8), woodMat)
  shaft.name = `${prefix}-shaft`
  shaft.rotation.z = -0.42
  addWorldSpaceChild(root, shaft, [0.47, 0.88, 0.08])

  const head = new THREE.Mesh(new THREE.CylinderGeometry(0.026, 0.032, 0.44, 8), metalMat)
  head.name = `${prefix}-head`
  head.rotation.z = Math.PI / 2 - 0.12
  addWorldSpaceChild(root, head, [0.62, 1.34, 0.08])

  const teamWrap = new THREE.Mesh(new THREE.TorusGeometry(0.07, 0.012, 6, 16), createTeamMaterial(team))
  teamWrap.name = `${prefix}-team-wrap`
  teamWrap.rotation.x = Math.PI / 2
  addWorldSpaceChild(root, teamWrap, [0.49, 1.02, 0.08])
}

function addMilitiaAxe(root: THREE.Group, team: number) {
  addPickaxe(root, team, 'militia-tool-real-model-axe')

  const edge = new THREE.Mesh(
    new THREE.ConeGeometry(0.12, 0.22, 8),
    new THREE.MeshLambertMaterial({ color: 0xc7c7bb }),
  )
  edge.name = 'militia-tool-real-model-axe-blade'
  edge.rotation.z = -Math.PI / 2
  addWorldSpaceChild(root, edge, [0.69, 1.34, 0.08])
}

function addRifle(root: THREE.Group, team: number) {
  const woodMat = new THREE.MeshLambertMaterial({ color: 0x5b3920 })
  const metalMat = new THREE.MeshLambertMaterial({ color: 0x2f3232 })

  const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 1.16, 10), metalMat)
  barrel.name = 'rifleman-role-real-model-rifle-barrel'
  barrel.rotation.x = Math.PI / 2
  addWorldSpaceChild(root, barrel, [0.36, 0.96, -0.2])

  const stock = new THREE.Mesh(new THREE.CapsuleGeometry(0.055, 0.22, 4, 8), woodMat)
  stock.name = 'rifleman-role-real-model-rifle-stock'
  stock.rotation.x = Math.PI / 2
  addWorldSpaceChild(root, stock, [0.36, 0.96, 0.45])

  const band = new THREE.Mesh(new THREE.TorusGeometry(0.055, 0.01, 6, 16), createTeamMaterial(team))
  band.name = 'rifleman-role-real-model-rifle-team-band'
  band.rotation.x = Math.PI / 2
  addWorldSpaceChild(root, band, [0.36, 0.96, 0.1])
}

function addRoundShield(root: THREE.Group, team: number, type: string) {
  const shield = new THREE.Mesh(
    new THREE.CylinderGeometry(0.2, 0.2, 0.055, 24),
    createTeamMaterial(team),
  )
  shield.name = `${type}-role-real-model-round-shield`
  shield.rotation.x = Math.PI / 2
  addWorldSpaceChild(root, shield, [-0.38, 0.88, 0.36])

  const boss = new THREE.Mesh(
    new THREE.SphereGeometry(0.07, 12, 8),
    new THREE.MeshLambertMaterial({ color: 0xc9c7b8 }),
  )
  boss.name = `${type}-role-real-model-shield-boss`
  addWorldSpaceChild(root, boss, [-0.38, 0.88, 0.4])

  addSword(root, type)
  if (type === 'footman') addHelmetCrest(root, team, type)
}

function addSword(root: THREE.Group, type: string) {
  const metalMat = new THREE.MeshStandardMaterial({
    color: 0xd7d5c7,
    roughness: 0.42,
    metalness: 0.18,
  })
  const leatherMat = new THREE.MeshLambertMaterial({ color: 0x5b3920 })

  const blade = new THREE.Mesh(new THREE.CylinderGeometry(0.024, 0.034, 0.78, 8), metalMat)
  blade.name = `${type}-role-real-model-sword-blade`
  blade.rotation.z = type === 'knight' ? -0.12 : 0.18
  addWorldSpaceChild(root, blade, [0.42, 0.92, 0.32])

  const tip = new THREE.Mesh(new THREE.ConeGeometry(0.045, 0.12, 8), metalMat)
  tip.name = `${type}-role-real-model-sword-tip`
  tip.rotation.z = type === 'knight' ? -0.12 : 0.18
  addWorldSpaceChild(root, tip, [0.38, 1.32, 0.32])

  const hilt = new THREE.Mesh(new THREE.CapsuleGeometry(0.04, 0.18, 4, 8), leatherMat)
  hilt.name = `${type}-role-real-model-sword-hilt`
  hilt.rotation.x = Math.PI / 2
  addWorldSpaceChild(root, hilt, [0.46, 0.54, 0.34])
}

function addHelmetCrest(root: THREE.Group, team: number, type: string) {
  const crest = new THREE.Mesh(
    new THREE.ConeGeometry(0.08, 0.28, 8),
    createTeamMaterial(team),
  )
  crest.name = `${type}-role-real-model-helmet-crest`
  crest.rotation.x = Math.PI / 2
  addWorldSpaceChild(root, crest, [0, 1.76, 0.08])
}

function addPaladinHalo(root: THREE.Group, team: number) {
  const halo = new THREE.Mesh(
    new THREE.TorusGeometry(0.26, 0.018, 8, 32),
    new THREE.MeshStandardMaterial({
      color: 0xffd45c,
      emissive: 0x6a4d10,
      roughness: 0.5,
      metalness: 0.15,
    }),
  )
  halo.name = 'paladin-role-real-model-gold-halo'
  halo.rotation.x = Math.PI / 2
  addWorldSpaceChild(root, halo, [0, 2.18, 0])

  const gem = new THREE.Mesh(new THREE.SphereGeometry(0.07, 12, 8), createTeamMaterial(team))
  gem.name = 'paladin-role-real-model-team-gem'
  addWorldSpaceChild(root, gem, [0, 1.35, 0.42])
}

function addMortarPennant(root: THREE.Group, team: number) {
  const crew = getLoadedModel('militia')
  if (crew) {
    crew.name = 'mortar-team-real-model-crew'
    applyTeamColorGLTF(crew, team, 'militia')
    polishUnitMaterials(crew, 'militia')
    crew.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.castShadow = true
        child.receiveShadow = true
      }
    })
    addWorldSpaceChildPreserveScale(root, crew, [-0.78, 0, 0.42], 0.58)
  }

  const pole = new THREE.Mesh(
    new THREE.CylinderGeometry(0.025, 0.025, 0.72, 8),
    new THREE.MeshLambertMaterial({ color: 0x5b3920 }),
  )
  pole.name = 'mortar-team-role-real-model-pennant-pole'
  addWorldSpaceChild(root, pole, [-0.42, 0.82, -0.25])

  const flag = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.28, 3), createTeamMaterial(team))
  flag.name = 'mortar-team-role-real-model-team-pennant'
  flag.rotation.z = -Math.PI / 2
  addWorldSpaceChild(root, flag, [-0.31, 1.06, -0.25])
}

function addCasterFocus(root: THREE.Group, team: number, type: string) {
  const staff = new THREE.Mesh(
    new THREE.CylinderGeometry(0.024, 0.03, 1.0, 8),
    new THREE.MeshLambertMaterial({ color: 0x6c4a22 }),
  )
  staff.name = `${type}-role-real-model-staff`
  staff.rotation.z = type === 'priest' ? -0.22 : 0.24
  addWorldSpaceChild(root, staff, [0.4, 0.88, 0.12])

  const orb = new THREE.Mesh(
    new THREE.SphereGeometry(0.1, 16, 10),
    new THREE.MeshStandardMaterial({
      color: TEAM_COLORS[team],
      emissive: TEAM_COLORS[team],
      emissiveIntensity: 0.35,
      roughness: 0.35,
    }),
  )
  orb.name = `${type}-role-real-model-team-focus-orb`
  addWorldSpaceChild(root, orb, [0.52, 1.36, 0.12])
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
 * - 团队色集中在胸标/条带/袖口（远距离可识别，但不吞掉农民材质）
 * - 清晰剪影：圆头 + 宽肩工具包 + 窄腰 = 不是建筑/不是兵
 */
function createRTSWorkerProxy(team: number): THREE.Group {
  const group = new THREE.Group()
  const color = TEAM_COLORS[team]
  group.userData.healthBarY = 2.15
  group.userData.visualRoute = 'painted-peasant-billboard-proxy'

  const teamMat = new THREE.MeshLambertMaterial({ color })
  const skinMat = new THREE.MeshLambertMaterial({ color: 0xddc8a0 })
  const tunicMat = new THREE.MeshLambertMaterial({ color: 0xb88a48 })
  const darkClothMat = new THREE.MeshLambertMaterial({ color: 0x4a3518 })
  const leatherMat = new THREE.MeshLambertMaterial({ color: 0x6b4e1f })
  const strawMat = new THREE.MeshLambertMaterial({ color: 0xd1b765 })
  const toolWoodMat = new THREE.MeshLambertMaterial({ color: 0x8b6914 })
  const toolMetalMat = new THREE.MeshLambertMaterial({ color: 0x9d9d92 })
  const beardMat = new THREE.MeshLambertMaterial({ color: 0x5a3a18 })

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

  const paintedSprite = createWorkerPaintedSprite(team)
  if (paintedSprite) {
    group.add(paintedSprite)
  }

  // === 腿部（深色短裤感，区分上下半身）===
  const legL = new THREE.Mesh(
    new THREE.CylinderGeometry(0.14, 0.16, 0.42, 6),
    darkClothMat,
  )
  legL.name = 'worker-leg-left'
  legL.position.set(-0.13, 0.24, 0)
  group.add(legL)

  const legR = legL.clone()
  legR.name = 'worker-leg-right'
  legR.position.set(0.13, 0.24, 0)
  group.add(legR)

  // === 身体（更宽更亮的工作服，避免在树影和暗地面里丢失）===
  const body = new THREE.Mesh(
    new THREE.CylinderGeometry(0.34, 0.42, 0.76, 8),
    tunicMat,
  )
  body.name = 'worker-peasant-tunic'
  body.position.y = 0.80
  group.add(body)

  // === 团队色布标（正面 + 背面，远距离可见，但不盖掉农民材质）===
  const tabardFront = new THREE.Mesh(
    new THREE.BoxGeometry(0.22, 0.32, 0.045),
    teamMat,
  )
  tabardFront.name = 'worker-team-tabard-front'
  tabardFront.position.set(0, 0.86, 0.37)
  group.add(tabardFront)

  const tabardBack = new THREE.Mesh(
    new THREE.BoxGeometry(0.22, 0.32, 0.045),
    teamMat,
  )
  tabardBack.name = 'worker-team-tabard-back'
  tabardBack.position.set(0, 0.86, -0.37)
  group.add(tabardBack)

  const apronLower = new THREE.Mesh(
    new THREE.BoxGeometry(0.30, 0.18, 0.045),
    leatherMat,
  )
  apronLower.name = 'worker-leather-apron-front'
  apronLower.position.set(0, 0.56, 0.39)
  group.add(apronLower)

  // === 侧肩队伍色块：从 RTS 斜上方看时比正面胸标更稳定 ===
  const shoulderL = new THREE.Mesh(
    new THREE.BoxGeometry(0.18, 0.20, 0.44),
    leatherMat,
  )
  shoulderL.name = 'worker-shoulder-pad-left'
  shoulderL.position.set(-0.38, 1.02, 0)
  group.add(shoulderL)

  const shoulderR = shoulderL.clone()
  shoulderR.name = 'worker-shoulder-pad-right'
  shoulderR.position.x = 0.38
  group.add(shoulderR)

  const shoulderStripeL = new THREE.Mesh(
    new THREE.BoxGeometry(0.20, 0.05, 0.46),
    teamMat,
  )
  shoulderStripeL.name = 'worker-team-shoulder-stripe-left'
  shoulderStripeL.position.set(-0.38, 1.15, 0)
  group.add(shoulderStripeL)

  const shoulderStripeR = shoulderStripeL.clone()
  shoulderStripeR.name = 'worker-team-shoulder-stripe-right'
  shoulderStripeR.position.x = 0.38
  group.add(shoulderStripeR)

  // === 袖子和手臂：让 worker 在远景读成“干活的人”，不是小建筑块 ===
  const sleeveL = new THREE.Mesh(
    new THREE.BoxGeometry(0.16, 0.28, 0.18),
    tunicMat,
  )
  sleeveL.name = 'worker-sleeve-left'
  sleeveL.position.set(-0.46, 0.93, 0.12)
  sleeveL.rotation.z = -0.35
  group.add(sleeveL)

  const sleeveR = sleeveL.clone()
  sleeveR.name = 'worker-sleeve-right'
  sleeveR.position.set(0.46, 0.93, 0.12)
  sleeveR.rotation.z = 0.35
  group.add(sleeveR)

  const cuffL = new THREE.Mesh(
    new THREE.BoxGeometry(0.13, 0.06, 0.18),
    teamMat,
  )
  cuffL.name = 'worker-team-cuff-left'
  cuffL.position.set(-0.55, 0.58, 0.19)
  cuffL.rotation.z = -0.28
  group.add(cuffL)

  const cuffR = cuffL.clone()
  cuffR.name = 'worker-team-cuff-right'
  cuffR.position.set(0.56, 0.60, 0.19)
  cuffR.rotation.z = 0.32
  group.add(cuffR)

  const forearmL = new THREE.Mesh(
    new THREE.CylinderGeometry(0.065, 0.075, 0.38, 6),
    skinMat,
  )
  forearmL.name = 'worker-forearm-left'
  forearmL.position.set(-0.54, 0.72, 0.18)
  forearmL.rotation.z = -0.28
  group.add(forearmL)

  const forearmR = forearmL.clone()
  forearmR.name = 'worker-forearm-right'
  forearmR.position.set(0.55, 0.74, 0.18)
  forearmR.rotation.z = 0.32
  group.add(forearmR)

  const handL = new THREE.Mesh(
    new THREE.SphereGeometry(0.085, 8, 6),
    skinMat,
  )
  handL.name = 'worker-hand-left'
  handL.position.set(-0.58, 0.51, 0.2)
  group.add(handL)

  const handR = handL.clone()
  handR.name = 'worker-hand-right'
  handR.position.set(0.6, 0.54, 0.2)
  group.add(handR)

  // === 团队色宽腰带 ===
  const belt = new THREE.Mesh(
    new THREE.CylinderGeometry(0.41, 0.41, 0.12, 8),
    teamMat,
  )
  belt.name = 'worker-team-belt'
  belt.position.y = 0.58
  group.add(belt)

  const pouchL = new THREE.Mesh(
    new THREE.BoxGeometry(0.15, 0.14, 0.09),
    leatherMat,
  )
  pouchL.name = 'worker-tool-belt-pouch-left'
  pouchL.position.set(-0.22, 0.55, 0.36)
  pouchL.rotation.z = 0.1
  group.add(pouchL)

  const pouchR = pouchL.clone()
  pouchR.name = 'worker-tool-belt-pouch-right'
  pouchR.position.set(0.22, 0.55, 0.36)
  pouchR.rotation.z = -0.1
  group.add(pouchR)

  // === 头（更大更圆，肤色）===
  const head = new THREE.Mesh(
    new THREE.SphereGeometry(0.24, 12, 8),
    skinMat,
  )
  head.name = 'worker-peasant-head'
  head.position.y = 1.34
  group.add(head)

  const nose = new THREE.Mesh(
    new THREE.ConeGeometry(0.045, 0.13, 6),
    skinMat,
  )
  nose.name = 'worker-face-nose'
  nose.position.set(0, 1.34, 0.24)
  nose.rotation.x = Math.PI / 2
  group.add(nose)

  const beard = new THREE.Mesh(
    new THREE.ConeGeometry(0.13, 0.18, 8),
    beardMat,
  )
  beard.name = 'worker-face-beard'
  beard.position.set(0, 1.21, 0.19)
  beard.rotation.x = Math.PI
  group.add(beard)

  // === 团队色帽子（宽沿帽，远距离看得出是帽子）===
  // 帽沿
  const brim = new THREE.Mesh(
    new THREE.CylinderGeometry(0.36, 0.36, 0.04, 12),
    strawMat,
  )
  brim.name = 'worker-wide-brim-hat'
  brim.position.y = 1.52
  group.add(brim)
  // 帽顶
  const hatTop = new THREE.Mesh(
    new THREE.ConeGeometry(0.25, 0.34, 10),
    strawMat,
  )
  hatTop.name = 'worker-peasant-hat-top'
  hatTop.position.y = 1.71
  group.add(hatTop)

  const hatBand = new THREE.Mesh(
    new THREE.CylinderGeometry(0.27, 0.28, 0.045, 12),
    teamMat,
  )
  hatBand.name = 'worker-team-hat-band'
  hatBand.position.y = 1.57
  group.add(hatBand)

  // === 背包/工具（背影辨识特征：worker 背着东西）===
  const backpack = new THREE.Mesh(
    new THREE.BoxGeometry(0.40, 0.44, 0.26),
    leatherMat,
  )
  backpack.name = 'worker-tool-backpack'
  backpack.position.set(0, 0.88, -0.36)
  group.add(backpack)

  const bedroll = new THREE.Mesh(
    new THREE.CylinderGeometry(0.13, 0.13, 0.46, 8),
    new THREE.MeshLambertMaterial({ color: 0x2f6f3e }),
  )
  bedroll.name = 'worker-tool-bedroll'
  bedroll.position.set(0, 1.12, -0.50)
  bedroll.rotation.z = Math.PI / 2
  group.add(bedroll)

  // === 镐（侧面伸出的工具，剪影辨识）===
  const pickShaft = new THREE.Mesh(
    new THREE.BoxGeometry(0.07, 0.86, 0.07),
    toolWoodMat,
  )
  pickShaft.name = 'worker-pickaxe-shaft'
  pickShaft.position.set(0.48, 0.96, 0)
  pickShaft.rotation.z = -0.3
  group.add(pickShaft)

  const pickHead = new THREE.Mesh(
    new THREE.BoxGeometry(0.38, 0.10, 0.10),
    toolMetalMat,
  )
  pickHead.name = 'worker-pickaxe-head'
  pickHead.position.set(0.60, 1.38, 0)
  pickHead.rotation.z = -0.08
  group.add(pickHead)

  const hammerHandle = new THREE.Mesh(
    new THREE.BoxGeometry(0.05, 0.44, 0.05),
    toolWoodMat,
  )
  hammerHandle.name = 'worker-hammer-handle'
  hammerHandle.position.set(-0.44, 0.72, 0.26)
  hammerHandle.rotation.z = 0.28
  group.add(hammerHandle)

  const hammerHead = new THREE.Mesh(
    new THREE.BoxGeometry(0.24, 0.09, 0.10),
    toolMetalMat,
  )
  hammerHead.name = 'worker-hammer-head'
  hammerHead.position.set(-0.50, 0.94, 0.26)
  hammerHead.rotation.z = 0.28
  group.add(hammerHead)

  // 开启阴影
  group.traverse((child) => {
    if (child instanceof THREE.Mesh) {
      child.castShadow = true
      child.receiveShadow = true
    }
  })

  return group
}

function createWorkerPaintedSprite(team: number): THREE.Sprite | null {
  if (typeof document === 'undefined') return null

  const texture = getWorkerSpriteTexture(team)
  const sprite = new THREE.Sprite(
    new THREE.SpriteMaterial({
      map: texture,
      transparent: true,
      depthTest: false,
      depthWrite: false,
      alphaTest: 0.08,
    }),
  )
  sprite.name = 'worker-painted-peasant-sprite'
  sprite.position.set(0, 1.04, 0.2)
  sprite.scale.set(1.34, 2.05, 1)
  sprite.renderOrder = 8
  sprite.userData.visualCue = 'painted-peasant'
  return sprite
}

function getWorkerSpriteTexture(team: number): THREE.CanvasTexture {
  const cached = WORKER_SPRITE_TEXTURES.get(team)
  if (cached) return cached

  const canvas = document.createElement('canvas')
  canvas.width = 192
  canvas.height = 256
  const ctx = canvas.getContext('2d')
  if (!ctx) {
    const fallback = new THREE.CanvasTexture(canvas)
    WORKER_SPRITE_TEXTURES.set(team, fallback)
    return fallback
  }

  drawWorkerSprite(ctx, canvas.width, canvas.height, TEAM_COLORS[team])

  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  texture.minFilter = THREE.LinearMipmapLinearFilter
  texture.magFilter = THREE.LinearFilter
  texture.generateMipmaps = true
  texture.needsUpdate = true
  WORKER_SPRITE_TEXTURES.set(team, texture)
  return texture
}

function drawWorkerSprite(ctx: CanvasRenderingContext2D, width: number, height: number, teamColor: number) {
  const team = `#${teamColor.toString(16).padStart(6, '0')}`
  ctx.clearRect(0, 0, width, height)
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'

  const outline = '#24180d'
  const shadow = 'rgba(0, 0, 0, 0.30)'
  const leather = '#6e451f'
  const leatherDark = '#3b2411'
  const tunic = '#b57939'
  const tunicDark = '#76481f'
  const skin = '#dfb887'
  const skinShade = '#b97f52'
  const straw = '#d7bb66'
  const strawLight = '#f2d985'
  const metal = '#b8b8a8'

  function roundedRect(x: number, y: number, w: number, h: number, r: number) {
    ctx.beginPath()
    ctx.moveTo(x + r, y)
    ctx.lineTo(x + w - r, y)
    ctx.quadraticCurveTo(x + w, y, x + w, y + r)
    ctx.lineTo(x + w, y + h - r)
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h)
    ctx.lineTo(x + r, y + h)
    ctx.quadraticCurveTo(x, y + h, x, y + h - r)
    ctx.lineTo(x, y + r)
    ctx.quadraticCurveTo(x, y, x + r, y)
    ctx.closePath()
  }

  function fillStroke(fill: string, stroke: string = outline, lineWidth: number = 8) {
    ctx.fillStyle = fill
    ctx.strokeStyle = stroke
    ctx.lineWidth = lineWidth
    ctx.stroke()
    ctx.fill()
  }

  function ellipse(x: number, y: number, rx: number, ry: number, fill: string, stroke: string = outline, lineWidth: number = 8) {
    ctx.beginPath()
    ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2)
    fillStroke(fill, stroke, lineWidth)
  }

  // Grounded painted shadow inside the transparent sprite. It reads better than
  // relying only on scene lighting after the texture gets minified.
  ellipse(96, 225, 48, 13, shadow, 'rgba(0, 0, 0, 0)', 0)

  // Rear tool silhouette.
  ctx.strokeStyle = outline
  ctx.lineWidth = 15
  ctx.beginPath()
  ctx.moveTo(136, 82)
  ctx.lineTo(58, 205)
  ctx.stroke()
  ctx.strokeStyle = '#855d28'
  ctx.lineWidth = 8
  ctx.beginPath()
  ctx.moveTo(136, 82)
  ctx.lineTo(58, 205)
  ctx.stroke()
  roundedRect(128, 68, 45, 18, 6)
  fillStroke(metal, outline, 7)

  // Legs and boots.
  roundedRect(66, 154, 24, 56, 10)
  fillStroke('#40311f', outline, 7)
  roundedRect(102, 154, 24, 56, 10)
  fillStroke('#40311f', outline, 7)
  roundedRect(55, 205, 37, 16, 8)
  fillStroke(leatherDark, outline, 6)
  roundedRect(100, 205, 37, 16, 8)
  fillStroke(leatherDark, outline, 6)

  // Arms behind the torso.
  ctx.strokeStyle = outline
  ctx.lineWidth = 18
  ctx.beginPath()
  ctx.moveTo(60, 115)
  ctx.lineTo(44, 162)
  ctx.stroke()
  ctx.beginPath()
  ctx.moveTo(132, 112)
  ctx.lineTo(148, 158)
  ctx.stroke()
  ctx.strokeStyle = skinShade
  ctx.lineWidth = 10
  ctx.beginPath()
  ctx.moveTo(60, 115)
  ctx.lineTo(44, 162)
  ctx.stroke()
  ctx.beginPath()
  ctx.moveTo(132, 112)
  ctx.lineTo(148, 158)
  ctx.stroke()
  ellipse(43, 165, 10, 10, skin, outline, 5)
  ellipse(149, 161, 10, 10, skin, outline, 5)

  // Body with leather apron and team accents.
  roundedRect(56, 95, 80, 78, 24)
  fillStroke(tunic, outline, 9)
  roundedRect(70, 116, 52, 58, 10)
  fillStroke(leather, outline, 5)
  roundedRect(81, 111, 30, 43, 8)
  fillStroke(team, outline, 5)
  ctx.strokeStyle = tunicDark
  ctx.lineWidth = 4
  ctx.beginPath()
  ctx.moveTo(68, 108)
  ctx.lineTo(125, 108)
  ctx.stroke()
  ctx.strokeStyle = team
  ctx.lineWidth = 8
  ctx.beginPath()
  ctx.moveTo(58, 130)
  ctx.lineTo(46, 152)
  ctx.moveTo(134, 128)
  ctx.lineTo(146, 150)
  ctx.stroke()

  // Backpack and side pouches.
  roundedRect(42, 120, 22, 46, 8)
  fillStroke(leatherDark, outline, 5)
  roundedRect(128, 121, 22, 44, 8)
  fillStroke(leatherDark, outline, 5)
  roundedRect(58, 164, 24, 18, 6)
  fillStroke(leather, outline, 4)
  roundedRect(110, 164, 24, 18, 6)
  fillStroke(leather, outline, 4)

  // Neck, head, beard and facial details.
  roundedRect(82, 77, 28, 24, 8)
  fillStroke(skinShade, outline, 5)
  ellipse(96, 66, 31, 34, skin, outline, 8)
  ctx.fillStyle = '#6b3b1b'
  ctx.beginPath()
  ctx.moveTo(72, 76)
  ctx.quadraticCurveTo(96, 104, 120, 76)
  ctx.quadraticCurveTo(108, 95, 96, 100)
  ctx.quadraticCurveTo(83, 95, 72, 76)
  ctx.closePath()
  ctx.strokeStyle = outline
  ctx.lineWidth = 5
  ctx.stroke()
  ctx.fill()
  ellipse(85, 63, 3.2, 4.2, '#182018', 'rgba(0,0,0,0)', 0)
  ellipse(107, 63, 3.2, 4.2, '#182018', 'rgba(0,0,0,0)', 0)
  ctx.strokeStyle = '#7b4b26'
  ctx.lineWidth = 4
  ctx.beginPath()
  ctx.moveTo(90, 72)
  ctx.quadraticCurveTo(96, 76, 102, 72)
  ctx.stroke()

  // Straw hat with a readable team band.
  ctx.beginPath()
  ctx.ellipse(96, 42, 56, 17, 0, 0, Math.PI * 2)
  fillStroke(straw, outline, 7)
  ctx.beginPath()
  ctx.moveTo(65, 40)
  ctx.quadraticCurveTo(96, 3, 127, 40)
  ctx.quadraticCurveTo(108, 31, 96, 31)
  ctx.quadraticCurveTo(83, 31, 65, 40)
  ctx.closePath()
  fillStroke(strawLight, outline, 7)
  ctx.strokeStyle = team
  ctx.lineWidth = 7
  ctx.beginPath()
  ctx.moveTo(70, 42)
  ctx.quadraticCurveTo(96, 51, 122, 42)
  ctx.stroke()

  // Painted highlights and a second tool cue.
  ctx.strokeStyle = 'rgba(255, 244, 190, 0.65)'
  ctx.lineWidth = 4
  ctx.beginPath()
  ctx.moveTo(82, 31)
  ctx.quadraticCurveTo(96, 18, 111, 31)
  ctx.moveTo(68, 102)
  ctx.quadraticCurveTo(83, 96, 102, 99)
  ctx.stroke()

  ctx.strokeStyle = outline
  ctx.lineWidth = 11
  ctx.beginPath()
  ctx.moveTo(136, 146)
  ctx.lineTo(160, 197)
  ctx.stroke()
  ctx.strokeStyle = '#7d5527'
  ctx.lineWidth = 6
  ctx.beginPath()
  ctx.moveTo(136, 146)
  ctx.lineTo(160, 197)
  ctx.stroke()
  roundedRect(148, 186, 29, 12, 4)
  fillStroke(metal, outline, 5)
}

// ==================== Fallback 程序几何体（非 worker 单位）====================

function createProxyUnit(type: string, team: number): THREE.Group {
  const group = new THREE.Group()
  const color = TEAM_COLORS[team]

  if (type === 'footman') {
    createProxyFootman(group, color)
  } else if (type === 'rifleman') {
    createProxyRifleman(group, color)
  } else if (type === 'sorceress') {
    createProxySorceress(group, color)
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

  // M3 scale contract: footman must read meaningfully heavier than worker.
  // scale 1.7 => silhouette ratio ~1.5x worker (target > 1.3).
  // Collision/pathing unchanged; this is only the visual adapter.
  group.scale.setScalar(1.7)
}

function createProxyRifleman(group: THREE.Group, color: number) {
  // Rifleman: ranged unit identity — tall narrow silhouette, long gun
  group.userData.healthBarY = 2.35

  // Legs — darker tone for lower body contrast
  const legL = new THREE.Mesh(
    new THREE.CylinderGeometry(0.12, 0.14, 0.40, 6),
    new THREE.MeshLambertMaterial({ color: 0x3a3020 }),
  )
  legL.position.set(-0.11, 0.22, 0)
  group.add(legL)
  const legR = legL.clone()
  legR.position.set(0.11, 0.22, 0)
  group.add(legR)

  // Body — midtone armor tunic
  const body = new THREE.Mesh(
    new THREE.CylinderGeometry(0.26, 0.30, 0.85, 8),
    new THREE.MeshLambertMaterial({ color: 0x6a5a48 }),
  )
  body.position.y = 0.67
  group.add(body)

  // Team color tabard — front and back for all-angle readability
  const tabardFront = new THREE.Mesh(
    new THREE.BoxGeometry(0.44, 0.48, 0.05),
    new THREE.MeshLambertMaterial({ color }),
  )
  tabardFront.position.set(0, 0.72, 0.30)
  group.add(tabardFront)
  const tabardBack = new THREE.Mesh(
    new THREE.BoxGeometry(0.44, 0.48, 0.05),
    new THREE.MeshLambertMaterial({ color }),
  )
  tabardBack.position.set(0, 0.72, -0.30)
  group.add(tabardBack)

  // Shoulder pads — team color
  const shoulderL = new THREE.Mesh(
    new THREE.BoxGeometry(0.18, 0.14, 0.22),
    new THREE.MeshLambertMaterial({ color }),
  )
  shoulderL.position.set(-0.30, 1.0, 0)
  group.add(shoulderL)
  const shoulderR = shoulderL.clone()
  shoulderR.position.set(0.30, 1.0, 0)
  group.add(shoulderR)

  // Head — round, leather cap
  const head = new THREE.Mesh(
    new THREE.SphereGeometry(0.18, 10, 8),
    new THREE.MeshLambertMaterial({ color: 0xddc8a0 }),
  )
  head.position.y = 1.26
  group.add(head)

  // Cap — team color beret
  const cap = new THREE.Mesh(
    new THREE.SphereGeometry(0.20, 8, 4, 0, Math.PI * 2, 0, Math.PI / 2),
    new THREE.MeshLambertMaterial({ color }),
  )
  cap.position.y = 1.30
  group.add(cap)

  // Long rifle — the defining silhouette element for ranged identity
  const barrel = new THREE.Mesh(
    new THREE.BoxGeometry(0.04, 0.08, 1.2),
    new THREE.MeshLambertMaterial({ color: 0x554433 }),
  )
  barrel.position.set(0.28, 0.88, -0.30)
  barrel.rotation.x = -0.15
  group.add(barrel)

  const muzzle = new THREE.Mesh(
    new THREE.BoxGeometry(0.05, 0.05, 0.08),
    new THREE.MeshLambertMaterial({ color: 0x888888 }),
  )
  muzzle.position.set(0.28, 0.80, -0.90)
  group.add(muzzle)

  const stock = new THREE.Mesh(
    new THREE.BoxGeometry(0.06, 0.12, 0.22),
    new THREE.MeshLambertMaterial({ color: 0x554433 }),
  )
  stock.position.set(0.28, 0.92, 0.36)
  group.add(stock)

  // Ammo pouch on belt — crafting/industrial cue
  const pouch = new THREE.Mesh(
    new THREE.BoxGeometry(0.14, 0.10, 0.08),
    new THREE.MeshLambertMaterial({ color: 0x5c3a1e }),
  )
  pouch.position.set(-0.26, 0.55, 0.20)
  group.add(pouch)

  // Same M3 scale contract as footman — military weight
  group.scale.setScalar(1.7)
}

function createProxySorceress(group: THREE.Group, color: number) {
  // Sorceress: caster silhouette distinct from Priest, but still cheap proxy geometry.
  group.userData.healthBarY = 2.25

  const robe = new THREE.Mesh(
    new THREE.CylinderGeometry(0.22, 0.34, 0.9, 8),
    new THREE.MeshLambertMaterial({ color: 0xdcecff }),
  )
  robe.position.y = 0.48
  group.add(robe)

  const sashFront = new THREE.Mesh(
    new THREE.BoxGeometry(0.36, 0.44, 0.05),
    new THREE.MeshLambertMaterial({ color }),
  )
  sashFront.position.set(0, 0.58, 0.28)
  group.add(sashFront)

  const hood = new THREE.Mesh(
    new THREE.SphereGeometry(0.2, 10, 8),
    new THREE.MeshLambertMaterial({ color: 0xcfd7ff }),
  )
  hood.position.y = 1.08
  group.add(hood)

  const trim = new THREE.Mesh(
    new THREE.ConeGeometry(0.22, 0.22, 8),
    new THREE.MeshLambertMaterial({ color }),
  )
  trim.position.y = 1.22
  group.add(trim)

  const staff = new THREE.Mesh(
    new THREE.BoxGeometry(0.05, 1.0, 0.05),
    new THREE.MeshLambertMaterial({ color: 0x8b6914 }),
  )
  staff.position.set(0.36, 0.68, 0)
  group.add(staff)

  const orb = new THREE.Mesh(
    new THREE.SphereGeometry(0.1, 10, 8),
    new THREE.MeshLambertMaterial({ color: 0x88ddff, emissive: 0x113344 }),
  )
  orb.position.set(0.36, 1.22, 0)
  group.add(orb)

  // Keep the caster readable beside Footman/Rifleman without changing gameplay size.
  group.scale.setScalar(1.55)
}
