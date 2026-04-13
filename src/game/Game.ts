import * as THREE from 'three'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js'
import { OutlinePass } from 'three/examples/jsm/postprocessing/OutlinePass.js'
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js'
import { CameraController } from './CameraController'
import {
  loadAllAssets,
  getLoadedModel,
  getAssetStatus,
  __testDeepCloneWithMaterials,
  __testInjectFakeAsset,
} from './AssetLoader'
import { createUnitVisual } from './UnitVisualFactory'
import { createBuildingVisual } from './BuildingVisualFactory'
import { Terrain, TileType } from '../map/Terrain'
import { W3XTerrainRenderer } from '../map/W3XTerrainRenderer'
import { MapRuntime } from '../map/MapRuntime'
import type { ParsedMap, W3ETerrain } from '../map/W3XParser'
import { disposeObject3DDeep } from '../utils/dispose'
import {
  UnitState, BUILDINGS, UNITS, GOLD_GATHER_TIME, LUMBER_GATHER_TIME,
  GOLD_PER_TRIP, GOLDMINE_MAX_WORKERS,
  LUMBER_PER_TRIP, TREE_LUMBER, GOLDMINE_GOLD,
  PEASANT_BUILD_MENU, MELEE_RANGE, AGGRO_RANGE, CHASE_RANGE, GATHER_RANGE, BUILD_RANGE,
} from './GameData'
import type { BuildingDef } from './GameData'
import { TeamResources } from './TeamResources'
import { GamePhase, Phase } from './GamePhase'
import { issueCommand as dispatchGameCommand } from './GameCommand'
import { SelectionModel } from './SelectionModel'
import { ControlGroupManager } from './ControlGroupManager'
import { SelectionController } from './SelectionController'
import { SimpleAI } from './SimpleAI'
import type { AIContext } from './SimpleAI'
import { OccupancyGrid, PlacementValidator } from './OccupancyGrid'
import { PlacementController } from './PlacementController'
import { FeedbackEffects } from './FeedbackEffects'
import { PathingGrid } from './PathingGrid'
import { findPath, pathToWorldWaypoints } from './PathFinder'
import { TreeManager } from './TreeManager'
import type { TreeEntry } from './TreeManager'

// ===== 队列命令类型 =====
/**
 * 最小队列命令语义
 *
 * 支持 Shift+右键追加 move 和 Shift+A+点击追加 attackMove。
 * 每个队列项是原子命令：弹出后直接执行。
 */
export type QueuedCommand =
  | { type: 'move'; target: THREE.Vector3 }
  | { type: 'attackMove'; target: THREE.Vector3 }

// ===== 资源目标类型 =====
/**
 * 最小资源目标语义
 *
 * gold/lumber 对称设计：每个分支都持有真实资源对象引用。
 * 未来扩展：
 * - 中立建筑：加 { type: 'neutral', ... } 分支
 * - 完整抽象时改为 ResourceNode interface + discriminated union
 */
export type ResourceTarget =
  | { type: 'tree'; entry: TreeEntry }
  | { type: 'goldmine'; mine: Unit }

// ===== 单位数据 =====
export interface Unit {
  mesh: THREE.Group
  type: string
  team: number
  hp: number
  maxHp: number
  speed: number
  moveTarget: THREE.Vector3 | null
  isBuilding: boolean

  // 状态机
  state: UnitState
  gatherType: 'gold' | 'lumber' | null
  carryAmount: number
  resourceTarget: ResourceTarget | null  // 明确资源目标引用，不再靠"最近邻推断"
  gatherTimer: number
  attackTimer: number
  attackTarget: Unit | null
  armor: number
  attackDamage: number
  attackRange: number
  attackCooldown: number

  // 建造
  buildProgress: number
  builder: Unit | null
  buildTarget: Unit | null

  // 训练
  trainingQueue: { type: string; remaining: number }[]

  // 资源节点数据（仅资源类 Unit 使用）
  remainingGold: number  // 金矿剩余量，非金矿为 0

  // 寻路
  waypoints: THREE.Vector3[]

  // 移动命令队列（Shift+右键追加 move，Shift+A 追加 attackMove）
  moveQueue: QueuedCommand[]

  // 攻击移动目标（仅 AttackMove 状态使用）
  attackMoveTarget: THREE.Vector3 | null

  // 集结点（建筑专用，新训练单位前往的目标）
  rallyPoint: THREE.Vector3 | null
  // 集结目标单位（仅 goldmine 类型，用于 townhall 自动采金）
  rallyTarget: Unit | null

  // === Order recovery: auto-aggro 中断前的命令快照 ===
  previousState: UnitState | null       // 被中断前的状态
  previousGatherType: 'gold' | 'lumber' | null
  previousResourceTarget: ResourceTarget | null
  previousMoveTarget: THREE.Vector3 | null
  previousWaypoints: THREE.Vector3[]
  previousMoveQueue: QueuedCommand[]
  previousAttackMoveTarget: THREE.Vector3 | null

  // === Auto-aggro suppression ===
  // 玩家手动下达 move/stop 后，短时间内禁止 auto-aggro 抢回单位
  // 值为 gameTime 阈值，gameTime < aggroSuppressUntil 时跳过自动索敌
  aggroSuppressUntil: number
}

const TEAM_COLORS = [0x4488ff, 0xff4444]
const CONSTRUCTION_CANCEL_REFUND_RATE = 0.75

// Unit presence / separation constants
const UNIT_SEPARATION_RADIUS = 0.6   // minimum distance between units (world units)
const UNIT_SEPARATION_PUSH = 0.08    // max push per frame
const FORMATION_SPACING = 0.7        // formation offset spacing

/**
 * 游戏主类
 *
 * 操作：
 * - 左键选择/框选，右键移动/采集/攻击
 * - 命令卡：建造建筑、训练单位
 * - WASD移动视角，滚轮缩放
 */
export class Game {
  private scene: THREE.Scene
  private camera: THREE.PerspectiveCamera
  private renderer: THREE.WebGLRenderer
  private composer!: EffectComposer
  private outlinePass!: OutlinePass
  private outlineObjects: THREE.Object3D[] = []
  private cameraCtrl!: CameraController
  private terrain!: Terrain
  private mapRuntime!: MapRuntime  // 统一的地图查询入口
  private w3xRenderer: W3XTerrainRenderer | null = null  // 持有引用以便 cleanup

  private raycaster = new THREE.Raycaster()
  private mouseNDC = new THREE.Vector2()
  private mouseScreen = new THREE.Vector2()

  // 单位
  private units: Unit[] = []
  private selectionModel = new SelectionModel()
  private controlGroups = new ControlGroupManager()
  /** Quick access to selected units (delegates to SelectionModel) */
  private get selectedUnits(): readonly Unit[] { return this.selectionModel.units }
  private sel!: SelectionController
  private healthBars = new Map<Unit, { bg: THREE.Mesh; fill: THREE.Mesh }>()

  // 资源（通过 TeamResources 管理）
  private resources = new TeamResources()
  // 游戏阶段
  private phase = new GamePhase()
  // AI
  private ai!: SimpleAI
  // 占用与放置
  private occupancy!: OccupancyGrid
  private placementValidator!: PlacementValidator
  // 统一导航查询
  private pathingGrid!: PathingGrid
  // 树木运行时
  private treeManager!: TreeManager

  // 框选
  private isDragging = false
  private dragStart = new THREE.Vector2()

  // Shift 键状态
  private shiftHeld = false

  // 双击检测
  private lastClickTime = 0
  private lastClickUnit: Unit | null = null
  private static readonly DOUBLE_CLICK_MS = 350

  // 反馈/视觉效果
  private feedback!: FeedbackEffects

  // 建造放置模式
  private placement = new PlacementController()

  /** @deprecated Use placement.mode — kept for test backward compatibility */
  get placementMode(): string | null { return this.placement.mode }
  /** @deprecated Use placement.currentGhost — kept for test backward compatibility */
  get ghostMesh(): THREE.Group | null { return this.placement.currentGhost }
  /** @deprecated Use placement.currentWorkers — kept for test backward compatibility */
  get placementWorkers(): readonly Unit[] { return this.placement.currentWorkers }

  /** @deprecated Use sel — kept for test backward compatibility */
  get selectionRings(): THREE.Mesh[] { return this.sel.selectionRings }
  /** @deprecated Use sel — kept for test backward compatibility */
  get selBoxEl(): HTMLDivElement { return this.sel.selBoxEl }
  /** @deprecated Use sel.createSelectionRing — kept for test backward compatibility */
  createSelectionRing(unit: Unit) { this.sel.createSelectionRing(unit) }
  /** @deprecated Use sel.clearSelectionRings — kept for test backward compatibility */
  clearSelectionRings() { this.sel.clearSelectionRings() }

  // 攻击移动目标模式
  private attackMoveMode = false

  // 集结点设置模式
  private rallyMode = false
  private rallyBuilding: Unit | null = null

  // 模式提示文字
  private elModeHint = document.getElementById('mode-hint')!

  // 时间
  private lastTime = 0
  private gameTime = 0

  // HUD
  private elGold = document.getElementById('gold')!
  private elLumber = document.getElementById('lumber')!
  private elSupply = document.getElementById('supply')!
  private elTime = document.getElementById('game-time')!
  private elUnitName = document.getElementById('unit-name')!
  private elUnitHpFill = document.getElementById('unit-hp-fill')!
  private elUnitHpText = document.getElementById('unit-hp-text')!
  private elUnitState = document.getElementById('unit-state')!
  private elUnitStats = document.getElementById('unit-stats')!
  private elTypeBadge = document.getElementById('unit-type-badge')!
  private elPortraitCanvas = document.getElementById('portrait-canvas') as HTMLCanvasElement
  private elSingleSelect = document.getElementById('single-select')!
  private elMultiSelect = document.getElementById('multi-select')!
  private elMultiCount = document.getElementById('multi-count')!
  private elMultiBreakdown = document.getElementById('multi-breakdown')!
  private elMultiHpFill = document.getElementById('multi-hp-fill')!
  private elMultiHpText = document.getElementById('multi-hp-text')!
  private elCameraPos = document.getElementById('camera-pos')!
  private elTileInfo = document.getElementById('tile-info')!
  private elCommandCard = document.getElementById('command-card')!
  private _lastCmdKey = ''  // 命令卡缓存，只在选择变化时重建
  private _lastSelKey = ''  // 选择HUD缓存
  private elTrainQueue = document.getElementById('train-queue')!

  // 胜利/失败
  private gameOverResult: 'victory' | 'defeat' | null = null
  private elGameOverOverlay = document.getElementById('game-over-overlay')!
  private elGameOverText = document.getElementById('game-over-text')!

  constructor() {
    this.scene = new THREE.Scene()
    // war3 氛围：偏暖偏深的雾色背景，不是纯黑
    this.scene.background = new THREE.Color(0x1a2218)
    this.scene.fog = new THREE.Fog(0x1a2218, 50, 120)
    // FOV 45° — war3 风格压缩透视，减少畸变，更像经典 RTS
    this.camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 2000)

    const canvas = document.getElementById('game-canvas') as HTMLCanvasElement
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, preserveDrawingBuffer: true })
    this.renderer.setSize(window.innerWidth, window.innerHeight)
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    this.renderer.shadowMap.enabled = true
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap

    // EffectComposer 后处理管线（War3 风格黑色描边）
    this.composer = new EffectComposer(this.renderer)
    this.composer.addPass(new RenderPass(this.scene, this.camera))
    this.outlinePass = new OutlinePass(
      new THREE.Vector2(window.innerWidth, window.innerHeight),
      this.scene,
      this.camera,
    )
    this.outlinePass.edgeStrength = 3.5
    this.outlinePass.edgeGlow = 0.0
    this.outlinePass.edgeThickness = 1.5
    this.outlinePass.pulsePeriod = 0
    this.outlinePass.visibleEdgeColor.set('#000000')
    this.outlinePass.hiddenEdgeColor.set('#000000')
    this.outlinePass.selectedObjects = this.outlineObjects
    this.composer.addPass(this.outlinePass)
    this.composer.addPass(new OutputPass())

    const MAP_SIZE = 64
    this.terrain = new Terrain(MAP_SIZE, MAP_SIZE)
    this.mapRuntime = new MapRuntime(this.terrain)
    this.feedback = new FeedbackEffects({
      scene: this.scene,
      camera: this.camera,
      getWorldHeight: (wx, wz) => this.getWorldHeight(wx, wz),
    })
    this.scene.add(this.terrain.mesh)
    this.scene.add(this.terrain.groundPlane)
    this.terrain.mesh.traverse((child) => {
      if (child instanceof THREE.Mesh) child.receiveShadow = true
    })
    this.terrain.groundPlane.receiveShadow = true

    this.cameraCtrl = new CameraController(this.camera, MAP_SIZE, MAP_SIZE)

    // 占用与放置
    this.occupancy = new OccupancyGrid(MAP_SIZE, MAP_SIZE)
    this.placementValidator = new PlacementValidator(this.occupancy, this.mapRuntime)
    // 导航查询
    this.pathingGrid = new PathingGrid(this.mapRuntime, this.occupancy)
    // 树木运行时
    this.treeManager = new TreeManager(MAP_SIZE, MAP_SIZE)
    this.pathingGrid.setTreeManager(this.treeManager)

    this.scene.add(new THREE.AmbientLight(0x999980))
    // 暖色阳光，从西南方斜照，产生自然阴影感
    const sun = new THREE.DirectionalLight(0xfff0dd, 1.0)
    sun.position.set(-30, 80, -20)
    sun.castShadow = true
    sun.shadow.mapSize.width = 2048
    sun.shadow.mapSize.height = 2048
    sun.shadow.camera.near = 1
    sun.shadow.camera.far = 200
    sun.shadow.camera.left = -50
    sun.shadow.camera.right = 80
    sun.shadow.camera.top = 80
    sun.shadow.camera.bottom = -50
    sun.shadow.bias = -0.001
    this.scene.add(sun)
    // 补光，从对侧打一点冷色
    const fill = new THREE.DirectionalLight(0x8899bb, 0.25)
    fill.position.set(30, 40, 30)
    this.scene.add(fill)
    // 半球光：天空偏蓝、地面偏绿，模拟 war3 环境光
    const hemi = new THREE.HemisphereLight(0x8899aa, 0x445533, 0.3)
    this.scene.add(hemi)

    const selBoxEl = document.getElementById('selection-box') as HTMLDivElement
    this.sel = new SelectionController({
      scene: this.scene,
      camera: this.camera,
      selectionModel: this.selectionModel,
      feedback: this.feedback,
      selBoxEl,
    })

    // 初始化阵营资源
    this.resources.init(0, 500, 200)
    this.resources.init(1, 500, 200)

    this.spawnTrees()
    this.spawnStartingUnits()
    this.setupInput()
    this.createAI()
    this.phase.set(Phase.Playing)
    window.addEventListener('resize', () => this.onResize())

    // 异步加载资产（不阻塞游戏启动，fallback 自动生效）
    loadAllAssets().then((statuses) => {
      const loaded = [...statuses.values()].filter(s => s === 'loaded').length
      console.log(`[AssetLoader] ${loaded}/${statuses.size} assets loaded`)
      // 加载完成后回填：把已有的 fallback 实例替换为 glTF
      if (loaded > 0) this.refreshVisualsAfterAssetLoad()
    })
  }

  start() {
    this.lastTime = performance.now()
    this.loop()
  }

  private loop = () => {
    requestAnimationFrame(this.loop)
    const now = performance.now()
    const dt = Math.min((now - this.lastTime) / 1000, 0.1)
    this.lastTime = now
    this.update(dt)
    this.render()
  }

  // ==================== 主循环 ====================

  private update(dt: number) {
    // 相机始终更新（LoadingMap 时也允许缩放/平移）
    this.cameraCtrl.update(dt)
    // 游戏逻辑仅在 Playing 阶段运行
    if (!this.phase.isPlaying()) return
    this.gameTime += dt
    this.ai.update(dt)
    this.updateUnits(dt)
    this.updateCombat(dt)
    this.updateStaticDefense(dt)
    this.updateAutoAggro()
    this.updateHealthBars()
    this.sel.updateSelectionRings()
    this.feedback.updateMoveIndicators(dt)
    this.feedback.updateImpactRings(dt)
    this.updateGhostPlacement()
    this.handleDeadUnits()
    this.checkGameOver()
    this.updateHUD(dt)
    this.updateMinimap()
  }

  private render() {
    this.composer.render()
  }

  // ==================== 单位AI ====================

  private updateUnits(dt: number) {
    for (const unit of this.units) {
      this.updateUnitMovement(unit, dt)
      this.updateUnitState(unit, dt)
      this.updateBuildProgress(unit, dt)
      this.updateTrainingQueue(unit, dt)
      this.feedback.updateCarryIndicator(unit)
    }
    // Post-move separation: push apart units that are too close
    this.applySeparation()
  }

  /**
   * Lightweight post-move separation pass.
   *
   * For each non-building unit that is too close to another non-building unit,
   * push them apart by a small amount per frame. This prevents permanent stacking
   * without requiring a full physics engine.
   *
   * Respects blockers: never pushes a unit into a blocked tile.
   * Deterministic: exact-overlap pairs get a deterministic direction from pair indexes.
   */
  private applySeparation() {
    const mobileUnits: Unit[] = []
    for (const u of this.units) {
      if (!u.isBuilding && u.hp > 0) mobileUnits.push(u)
    }

    for (let i = 0; i < mobileUnits.length; i++) {
      const a = mobileUnits[i]

      for (let j = i + 1; j < mobileUnits.length; j++) {
        const b = mobileUnits[j]
        // Read A's current position each iteration (may have been pushed by earlier pairs)
        const ax = a.mesh.position.x
        const az = a.mesh.position.z
        const bx = b.mesh.position.x
        const bz = b.mesh.position.z

        let dx = ax - bx
        let dz = az - bz
        let dist = Math.sqrt(dx * dx + dz * dz)

        if (dist >= UNIT_SEPARATION_RADIUS) continue

        // Handle exact overlap: use deterministic direction from pair indexes.
        const exactOverlap = dist <= 0.001
        if (exactOverlap) {
          const angle = ((i * 92821 + j * 68917) % 360) * Math.PI / 180
          dx = Math.cos(angle)
          dz = Math.sin(angle)
        }

        // Push each unit away by half the overlap, capped at max push per frame
        const effectiveDist = exactOverlap ? 0 : dist
        const overlap = (UNIT_SEPARATION_RADIUS - effectiveDist) * 0.5
        const pushAmount = Math.min(overlap, UNIT_SEPARATION_PUSH)
        // Normalize: exact-overlap dx/dz are already unit length.
        const normDist = exactOverlap ? 1 : dist
        const pushX = (dx / normDist) * pushAmount
        const pushZ = (dz / normDist) * pushAmount

        // Apply to A if not blocked
        const newAx = ax + pushX
        const newAz = az + pushZ
        if (!this.isPositionBlocked(newAx, newAz)) {
          a.mesh.position.x = newAx
          a.mesh.position.z = newAz
          a.mesh.position.y = this.getWorldHeight(newAx - 0.5, newAz - 0.5)
        }

        // Apply to B (opposite direction)
        const newBx = bx - pushX
        const newBz = bz - pushZ
        if (!this.isPositionBlocked(newBx, newBz)) {
          b.mesh.position.x = newBx
          b.mesh.position.z = newBz
          b.mesh.position.y = this.getWorldHeight(newBx - 0.5, newBz - 0.5)
        }
      }
    }
  }

  /** Check if a world position falls on a blocked tile */
  private isPositionBlocked(wx: number, wz: number): boolean {
    const tx = Math.floor(wx)
    const tz = Math.floor(wz)
    return this.pathingGrid.isBlocked(tx, tz)
  }

  /** 通用移动逻辑（支持 A* waypoints） */
  private updateUnitMovement(unit: Unit, dt: number) {
    if (!unit.moveTarget || unit.isBuilding) {
      // 无移动目标：如果是 Moving 状态，尝试消费队列或转 Idle
      if (unit.state === UnitState.Moving && !unit.isBuilding) {
        if (unit.moveQueue.length > 0) {
          const nextCmd = unit.moveQueue.shift()!
          this.executeQueuedCommand(unit, nextCmd)
          return
        }
        unit.state = UnitState.Idle
      }
      return
    }

    const pos = unit.mesh.position
    let dx = unit.moveTarget.x - pos.x
    let dz = unit.moveTarget.z - pos.z
    let dist = Math.sqrt(dx * dx + dz * dz)

    // 到达当前 waypoint → 推进到下一个
    while (dist < 0.15 && unit.waypoints.length > 0) {
      unit.moveTarget = unit.waypoints.shift()!
      dx = unit.moveTarget.x - pos.x
      dz = unit.moveTarget.z - pos.z
      dist = Math.sqrt(dx * dx + dz * dz)
    }

    if (dist < 0.1) {
      // 到达最终目标
      pos.x = unit.moveTarget.x
      pos.z = unit.moveTarget.z
      unit.moveTarget = null
      // 攻击移动到达终点 → 转为空闲
      if (unit.state === UnitState.AttackMove) {
        this.finishAttackMove(unit)
        return
      }
      // 移动队列：如果还有排队的目标，弹出下一个并继续
      if (unit.state === UnitState.Moving && unit.moveQueue.length > 0) {
        const nextCmd = unit.moveQueue.shift()!
        this.executeQueuedCommand(unit, nextCmd)
      }
      return
    }

    const step = Math.min(unit.speed * dt, dist)
    pos.x += (dx / dist) * step
    pos.z += (dz / dist) * step
    pos.y = this.getWorldHeight(pos.x - 0.5, pos.z - 0.5)
    unit.mesh.rotation.y = Math.atan2(dx, dz)
  }

  /** 状态机 */
  private updateUnitState(unit: Unit, dt: number) {
    // 防御层：非可采集单位不应处于采集相关状态
    if ((unit.state === UnitState.MovingToGather || unit.state === UnitState.Gathering
        || unit.state === UnitState.MovingToReturn)
      && !UNITS[unit.type]?.canGather) {
      unit.state = UnitState.Idle
      unit.gatherType = null
      unit.resourceTarget = null
      unit.moveTarget = null
      unit.waypoints = []
      return
    }

    switch (unit.state) {
      case UnitState.MovingToGather: {
        if (unit.moveTarget && !this.hasReachedGatherInteraction(unit)) return
        if (unit.moveTarget) {
          unit.moveTarget = null
          unit.waypoints = []
        }
        // 到达资源点 → 验证资源目标仍有效
        if (!this.validateResourceTarget(unit)) {
          this.startGatherNearest(unit)
          break
        }
        if (!this.canStartGoldGather(unit)) {
          // Gold mines are saturated at five active workers. Extra workers
          // wait at the mine until a gathering slot opens.
          unit.gatherTimer = 0
          break
        }
        unit.state = UnitState.Gathering
        unit.gatherTimer = unit.gatherType === 'gold' ? GOLD_GATHER_TIME : LUMBER_GATHER_TIME
        break
      }

      case UnitState.Gathering: {
        unit.gatherTimer -= dt
        if (unit.gatherTimer <= 0) {
          // 统一结算：基于明确资源目标扣减，不允许凭空产资源
          unit.carryAmount = this.settleGather(unit)

          // 只有拿到了资源才走回基地
          if (unit.carryAmount > 0) {
            const hall = this.findNearest(unit, 'townhall', unit.team)
            if (hall) {
              unit.state = UnitState.MovingToReturn
              this.planPath(unit, hall.mesh.position)
            } else {
              unit.state = UnitState.Idle
              unit.carryAmount = 0
            }
          } else {
            // 没拿到资源 → 重试找新资源或转为空闲
            this.startGatherNearest(unit)
          }
        }
        break
      }

      case UnitState.MovingToReturn: {
        const hall = this.findNearest(unit, 'townhall', unit.team)
        if (unit.moveTarget && !this.hasReachedDropoffHall(unit, hall)) return
        if (unit.moveTarget) {
          unit.moveTarget = null
          unit.waypoints = []
        }
        if (!hall) {
          unit.state = UnitState.Idle
          unit.carryAmount = 0
          break
        }
        // 到达主基地，存入资源
        if (unit.gatherType === 'gold') {
          this.resources.earn(unit.team, unit.carryAmount, 0)
        } else {
          this.resources.earn(unit.team, 0, unit.carryAmount)
        }
        unit.carryAmount = 0
        // 自动返回资源点继续采集
        this.startGatherNearest(unit)
        break
      }

      case UnitState.MovingToBuild: {
        const target = unit.buildTarget
        if (!target || target.buildProgress >= 1) {
          unit.state = UnitState.Idle
          unit.buildTarget = null
          unit.moveTarget = null
          unit.waypoints = []
          break
        }
        if (unit.moveTarget && !this.hasReachedBuildInteraction(unit, target)) return
        unit.moveTarget = null
        unit.waypoints = []
        unit.state = UnitState.Building
        break
      }

      case UnitState.Building: {
        const target = unit.buildTarget
        if (!target || target.buildProgress >= 1) {
          unit.state = UnitState.Idle
          unit.buildTarget = null
        }
        break
      }
    }
  }

  /** 建造进度（建筑自身）*/
  private updateBuildProgress(unit: Unit, dt: number) {
    if (!unit.isBuilding || unit.buildProgress >= 1) return
    const def = BUILDINGS[unit.type]
    if (!def || def.buildTime <= 0) return

    // 只有有农民在建造时才推进
    const hasBuilder = this.units.some(
      (u) => u.buildTarget === unit && u.state === UnitState.Building,
    )
    if (!hasBuilder) return

    unit.buildProgress += dt / def.buildTime
    if (unit.buildProgress >= 1) {
      unit.buildProgress = 1
      // 建造完成，建筑变实
      const mesh0 = unit.mesh.children[0] as THREE.Mesh | undefined
      const mat = mesh0?.material as THREE.MeshLambertMaterial | undefined
      if (mat) mat.opacity = 1

      // 完成反馈：短弹 + 亮度提亮回落
      this.feedback.playBuildCompleteEffect(unit)
    }

    // 缩放动画：从0.3到1
    const scale = 0.3 + 0.7 * unit.buildProgress
    unit.mesh.scale.setScalar(scale)
  }

  /** 训练队列 */
  private updateTrainingQueue(unit: Unit, dt: number) {
    if (!unit.isBuilding || unit.trainingQueue.length === 0) return
    if (unit.buildProgress < 1) return // 建筑未完成

    const item = unit.trainingQueue[0]
    item.remaining -= dt
    if (item.remaining <= 0) {
      unit.trainingQueue.shift()
      // 出兵
      const def = UNITS[item.type]
      if (def) {
        const angle = Math.random() * Math.PI * 2
        const spawnX = unit.mesh.position.x + Math.cos(angle) * 2
        const spawnZ = unit.mesh.position.z + Math.sin(angle) * 2
        const spawned = this.spawnUnit(item.type, unit.team, spawnX - 0.5, spawnZ - 0.5)

        // 集结点逻辑
        if (unit.rallyPoint) {
          if (unit.rallyTarget && unit.rallyTarget.type === 'goldmine'
            && UNITS[spawned.type]?.canGather) {
            // 城镇大厅集结到金矿 → 自动采金
            spawned.gatherType = 'gold'
            spawned.resourceTarget = { type: 'goldmine', mine: unit.rallyTarget }
            spawned.state = UnitState.MovingToGather
            this.planPath(spawned, unit.rallyTarget.mesh.position)
          } else {
            // 普通位置集结 → 移动到集结点
            dispatchGameCommand([spawned], { type: 'move', target: unit.rallyPoint })
            this.planPath(spawned, unit.rallyPoint)
          }
        }
      }
    }
  }

  // ==================== 战斗系统 ====================

  /** 战斗状态更新（Attacking / AttackMove / HoldPosition） */
  private updateCombat(dt: number) {
    for (const unit of this.units) {
      if (unit.state !== UnitState.Attacking
        && unit.state !== UnitState.AttackMove
        && unit.state !== UnitState.HoldPosition) continue

      // AttackMove 无 attackTarget → 正常前进中，不需要战斗逻辑
      // 路径已在 issueCommand 或 resumeAttackMove() 中设好
      if (unit.state === UnitState.AttackMove && !unit.attackTarget) continue

      // HoldPosition 无 attackTarget → 扫描范围内敌人
      if (unit.state === UnitState.HoldPosition && !unit.attackTarget) {
        let nearest: Unit | null = null
        let nearDist = unit.attackRange + 0.5
        for (const other of this.units) {
          if (other.team === unit.team || other.hp <= 0 || other.type === 'goldmine') continue
          const d = unit.mesh.position.distanceTo(other.mesh.position)
          if (d < nearDist) { nearDist = d; nearest = other }
        }
        if (nearest) {
          unit.attackTarget = nearest
        }
        continue // 有目标后下帧处理攻击
      }

      const target = unit.attackTarget
      const isAttackMove = unit.state === UnitState.AttackMove

      // 目标死亡/无效
      if (!target || target.hp <= 0 || !this.units.includes(target)) {
        unit.attackTarget = null
        if (isAttackMove) {
          // 攻击移动：恢复继续走（仅在目标刚丢失时重规划）
          this.resumeAttackMove(unit)
        } else if (unit.state === UnitState.HoldPosition) {
          // 驻守：保持驻守
        } else {
          // 尝试恢复被 auto-aggro 中断的原始命令
          this.restorePreviousOrder(unit)
        }
        continue
      }

      const dist = unit.mesh.position.distanceTo(target.mesh.position)

      // 驻守：只在攻击范围内打，超出范围就放弃（不追，也不恢复成 Idle）
      // This must run before the generic CHASE_RANGE branch, otherwise hold
      // position incorrectly falls through to restorePreviousOrder().
      if (unit.state === UnitState.HoldPosition && dist > unit.attackRange + 0.3) {
        unit.attackTarget = null
        unit.moveTarget = null
        unit.waypoints = []
        continue
      }

      // 超出追击范围
      if (dist > CHASE_RANGE && !isAttackMove) {
        unit.attackTarget = null
        this.restorePreviousOrder(unit)
        continue
      }

      // 攻击移动时超出追击范围 → 放弃目标，恢复移动
      if (isAttackMove && dist > CHASE_RANGE) {
        unit.attackTarget = null
        this.resumeAttackMove(unit)
        continue
      }

      // 超出攻击范围 → 追上去
      if (dist > unit.attackRange + 0.3) {
        if (unit.waypoints.length === 0) {
          unit.moveTarget = target.mesh.position.clone()
        }
      } else {
        // 在攻击范围内 → 停下打
        unit.moveTarget = null
        unit.waypoints = []
        unit.mesh.rotation.y = Math.atan2(
          target.mesh.position.x - unit.mesh.position.x,
          target.mesh.position.z - unit.mesh.position.z,
        )

        unit.attackTimer -= dt
        if (unit.attackTimer <= 0) {
          unit.attackTimer = unit.attackCooldown
          this.dealDamage(unit, target)
        }
      }
    }
  }

  // ==================== 静态防御（箭塔）====================

  /**
   * Static defense combat update for completed towers.
   *
   * Towers are buildings with non-zero attackDamage. They auto-acquire
   * enemy units in range, attack on cooldown, and never chase.
   * Under-construction towers (buildProgress < 1) are skipped.
   */
  private updateStaticDefense(dt: number) {
    for (const unit of this.units) {
      // Only process completed buildings with a weapon
      if (!unit.isBuilding) continue
      if (unit.attackDamage <= 0) continue
      if (unit.buildProgress < 1) continue
      if (unit.hp <= 0) continue

      // Validate existing target
      const target = unit.attackTarget
      if (target) {
        if (target.hp <= 0 || !this.units.includes(target)) {
          unit.attackTarget = null
        }
      }

      // Acquire target if none
      if (!unit.attackTarget) {
        let nearest: Unit | null = null
        let nearDist = unit.attackRange
        for (const other of this.units) {
          if (other.team === unit.team || other.hp <= 0) continue
          if (other.type === 'goldmine') continue
          if (other.isBuilding) continue // towers target units only
          const d = unit.mesh.position.distanceTo(other.mesh.position)
          if (d < nearDist) { nearDist = d; nearest = other }
        }
        if (nearest) unit.attackTarget = nearest
      }

      // Attack if target is in range
      const currentTarget = unit.attackTarget
      if (!currentTarget) continue

      const dist = unit.mesh.position.distanceTo(currentTarget.mesh.position)
      if (dist > unit.attackRange) {
        // Target moved out of range — drop it, will reacquire next frame
        unit.attackTarget = null
        continue
      }

      // Face target
      unit.mesh.rotation.y = Math.atan2(
        currentTarget.mesh.position.x - unit.mesh.position.x,
        currentTarget.mesh.position.z - unit.mesh.position.z,
      )

      // Attack on cooldown
      unit.attackTimer -= dt
      if (unit.attackTimer <= 0) {
        unit.attackTimer = unit.attackCooldown
        this.dealDamage(unit, currentTarget)
      }
    }
  }

  /** 攻击移动完成：清理所有 attack-move 状态，回到 Idle */
  private finishAttackMove(unit: Unit) {
    unit.state = UnitState.Idle
    unit.attackMoveTarget = null
    unit.attackTarget = null
    unit.moveTarget = null
    unit.waypoints = []
  }

  /** 统一的 attack-move 路径规划：有路就走，没路就结束
   *
   * 所有 attack-move 路径（初次下发、追击恢复、目标丢失恢复）
   * 都必须通过此方法，保证终态语义一致：
   * - planPath 成功 → 单位沿路径移动
   * - planPath 失败（已在最佳可达位置）→ finishAttackMove → Idle
   */
  private planAttackMovePath(unit: Unit, target: THREE.Vector3): void {
    if (!this.planPath(unit, target)) {
      this.finishAttackMove(unit)
    }
  }

  /** 攻击移动：目标丢失或追击后恢复向 attackMoveTarget 前进 */
  private resumeAttackMove(unit: Unit) {
    if (unit.attackMoveTarget) {
      this.planAttackMovePath(unit, unit.attackMoveTarget)
    } else {
      this.finishAttackMove(unit)
    }
  }

  /**
   * 恢复被 auto-aggro 中断的原始命令
   *
   * 如果有保存的 previousState，恢复到中断前的状态。
   * 如果没有保存（说明是玩家手动下达的 attack 命令），回到 Idle。
   */
  private restorePreviousOrder(unit: Unit) {
    const prev = unit.previousState
    if (prev === null || prev === undefined) {
      // 没有保存的前状态（玩家手动 attack）→ 回到 Idle
      unit.state = UnitState.Idle
      unit.moveTarget = null
      unit.waypoints = []
      unit.resourceTarget = null
      return
    }

    // 恢复前状态
    unit.state = prev
    unit.gatherType = unit.previousGatherType
    unit.resourceTarget = unit.previousResourceTarget
    unit.attackMoveTarget = unit.previousAttackMoveTarget
    unit.moveQueue = [...unit.previousMoveQueue]

    // 恢复移动目标（如果有）
    if (unit.previousMoveTarget) {
      if (prev === UnitState.AttackMove) {
        // AttackMove 恢复：重新规划到 attackMoveTarget
        if (unit.attackMoveTarget) {
          this.planAttackMovePath(unit, unit.attackMoveTarget)
        }
      } else {
        // 普通移动恢复：重新规划到原目标
        this.planPath(unit, unit.previousMoveTarget)
      }
    } else {
      unit.moveTarget = null
      unit.waypoints = []
    }

    // 对于采集状态，需要重新验证资源目标是否仍有效
    if (prev === UnitState.MovingToGather || prev === UnitState.Gathering
      || prev === UnitState.MovingToReturn) {
      if (!this.validateResourceTarget(unit)) {
        // 资源目标已失效，尝试找新资源
        if (unit.gatherType) {
          this.startGatherNearest(unit)
        } else {
          unit.state = UnitState.Idle
          unit.resourceTarget = null
        }
      }
    }

    // 清除 previous 快照（已恢复）
    this.clearPreviousOrder(unit)
  }

  /** 清除 previous order 快照 */
  private clearPreviousOrder(unit: Unit) {
    unit.previousState = null
    unit.previousGatherType = null
    unit.previousResourceTarget = null
    unit.previousMoveTarget = null
    unit.previousWaypoints = []
    unit.previousMoveQueue = []
    unit.previousAttackMoveTarget = null
  }

  /**
   * 执行队列中的命令
   *
   * 从 moveQueue 弹出后，根据命令类型设置正确的状态和路径。
   * 这是所有队列命令的统一消费者。
   */
  private executeQueuedCommand(unit: Unit, cmd: QueuedCommand) {
    // 队列命令切换时，清理采集/建造相关状态
    unit.gatherType = null
    unit.resourceTarget = null
    unit.buildTarget = null
    unit.carryAmount = 0
    unit.attackTarget = null

    switch (cmd.type) {
      case 'move':
        unit.state = UnitState.Moving
        unit.moveTarget = null
        this.planPath(unit, cmd.target)
        break
      case 'attackMove':
        unit.state = UnitState.AttackMove
        unit.attackMoveTarget = cmd.target.clone()
        unit.moveTarget = null
        this.planAttackMovePath(unit, cmd.target)
        break
    }
  }

  /** 计算伤害（含护甲减伤）*/
  private dealDamage(attacker: Unit, target: Unit) {
    const rawDamage = attacker.attackDamage
    // war3护甲公式: 减伤 = (armor * 0.06) / (1 + 0.06 * armor)
    const armor = target.armor
    const reduction = armor > 0
      ? (armor * 0.06) / (1 + 0.06 * armor)
      : 0
    const finalDamage = Math.max(1, Math.round(rawDamage * (1 - reduction)))
    target.hp -= finalDamage

    // 攻击动画不能把 glTF/root asset scale 重置成 1。
    const originalScale = attacker.mesh.scale.clone()
    attacker.mesh.scale.copy(originalScale).multiplyScalar(1.15)
    setTimeout(() => { if (attacker.mesh) attacker.mesh.scale.copy(originalScale) }, 100)

    // 受击闪烁（增强版：闪红再闪白）
    this.feedback.flashHit(target)

    // 命中冲击环
    this.feedback.spawnImpactRing(target.mesh.position)

    // 浮动伤害数字
    this.feedback.spawnDamageNumber(target, finalDamage)

    // 血条闪烁反馈（短暂提亮血条边框）
    const bars = this.healthBars.get(target)
    if (bars) {
      const borderObj = bars.bg.parent?.children[0]
      if (borderObj instanceof THREE.Mesh) {
        const borderMat = borderObj.material as THREE.MeshBasicMaterial | undefined
        if (borderMat && 'color' in borderMat && borderMat.color) {
          const origBorder = borderMat.color.getHex()
          borderMat.color.setHex(0xffffff)
          setTimeout(() => { borderMat.color.setHex(origBorder) }, 150)
        }
      }
    }
  }

  /** 自动反击：侦测附近的敌人 */
  private updateAutoAggro() {
    for (const unit of this.units) {
      if (unit.isBuilding || unit.attackTarget) continue
      // 只有 Idle / AttackMove 的单位才走自动 aggro
      // Moving 单位不被 auto-aggro 打断——war3 行为：玩家显式移动优先级高于自动反击
      if (unit.state !== UnitState.Idle && unit.state !== UnitState.AttackMove) continue
      // 玩家手动 stop/move 后的 suppression 窗口：短时间内不会被 auto-aggro 抢回
      if (this.gameTime < unit.aggroSuppressUntil) continue

      // 搜索最近的敌方单位
      let nearestEnemy: Unit | null = null
      let nearestDist = AGGRO_RANGE
      for (const other of this.units) {
        if (other.team === unit.team || other.hp <= 0) continue
        if (other.type === 'goldmine') continue
        const d = unit.mesh.position.distanceTo(other.mesh.position)
        if (d < nearestDist) {
          nearestDist = d
          nearestEnemy = other
        }
      }
      if (nearestEnemy) {
        unit.attackTarget = nearestEnemy
        if (unit.state === UnitState.AttackMove) {
          // 攻击移动中遇敌：保持 AttackMove 状态，暂停移动
          unit.moveTarget = null
          unit.waypoints = []
        } else {
          // 保存中断前的命令，用于战斗结束后恢复
          unit.previousState = unit.state
          unit.previousGatherType = unit.gatherType
          unit.previousResourceTarget = unit.resourceTarget
          unit.previousMoveTarget = unit.moveTarget ? unit.moveTarget.clone() : null
          unit.previousWaypoints = [...unit.waypoints]
          unit.previousMoveQueue = [...unit.moveQueue]
          unit.previousAttackMoveTarget = unit.attackMoveTarget ? unit.attackMoveTarget.clone() : null

          unit.state = UnitState.Attacking
          unit.moveTarget = null
          unit.waypoints = []
        }
      }
    }
  }

  // ==================== 血条 ====================

  /** 创建血条（war3 风格：金色边框 + 暗底 + 彩色填充）*/
  private createHealthBar(unit: Unit) {
    const group = new THREE.Group()

    const barWidth = unit.isBuilding ? 2.0 : 1.2
    const barHeight = 0.14

    // 金色边框（略大于血条本身）
    const borderGeo = new THREE.PlaneGeometry(barWidth + 0.1, barHeight + 0.1)
    const borderMat = new THREE.MeshBasicMaterial({ color: 0xb09030, side: THREE.DoubleSide, depthTest: false })
    const border = new THREE.Mesh(borderGeo, borderMat)
    group.add(border)

    // 暗底
    const bgGeo = new THREE.PlaneGeometry(barWidth, barHeight)
    const bgMat = new THREE.MeshBasicMaterial({ color: 0x1a1208, side: THREE.DoubleSide, depthTest: false })
    const bg = new THREE.Mesh(bgGeo, bgMat)
    bg.position.z = 0.001
    group.add(bg)

    // 彩色填充
    const fillGeo = new THREE.PlaneGeometry(barWidth, barHeight)
    const fillMat = new THREE.MeshBasicMaterial({ color: 0x00cc00, side: THREE.DoubleSide, depthTest: false })
    const fill = new THREE.Mesh(fillGeo, fillMat)
    fill.position.z = 0.002
    group.add(fill)

    // 定位在单位头顶
    const yPos = this.getHealthBarHeight(unit)
    group.position.copy(unit.mesh.position)
    group.position.y += yPos

    this.scene.add(group)
    this.healthBars.set(unit, { bg, fill })
  }

  /** 更新所有血条位置和填充 */
  private updateHealthBars() {
    const toDelete: Unit[] = []
    for (const [unit, bars] of this.healthBars) {
      if (!this.units.includes(unit)) {
        toDelete.push(unit)
        continue
      }

      const pct = Math.max(0, unit.hp / unit.maxHp)
      const yPos = this.getHealthBarHeight(unit)

      // 位置跟随单位
      bars.bg.parent!.position.copy(unit.mesh.position)
      bars.bg.parent!.position.y += yPos

      // 朝向摄像机（billboard）
      bars.bg.parent!.quaternion.copy(this.camera.quaternion)

      // 缩放填充条
      const halfWidth = (unit.isBuilding ? 0.9 : 0.55)
      bars.fill.scale.x = pct
      bars.fill.position.x = -(1 - pct) * halfWidth

      // 颜色
      const fillMat = bars.fill.material as THREE.MeshBasicMaterial
      fillMat.color.setHex(pct > 0.6 ? 0x00cc00 : pct > 0.3 ? 0xcccc00 : 0xcc0000)
    }
    for (const u of toDelete) {
      const bars = this.healthBars.get(u)!
      this.scene.remove(bars.bg.parent!)
      this.healthBars.delete(u)
    }
  }

  private getHealthBarHeight(unit: Unit): number {
    if (unit.isBuilding) {
      return (BUILDINGS[unit.type]?.size ?? 1) * 0.5 + 0.5
    }

    const visualHeight = unit.mesh.userData.healthBarY
    return typeof visualHeight === 'number' ? visualHeight : 1.6
  }

  // ==================== 死亡处理 ====================

  private handleDeadUnits() {
    const dead = this.units.filter((u) => u.hp <= 0 && u.type !== 'goldmine')
    if (dead.length === 0) return

    const deadSet = new Set(dead)

    for (const unit of dead) {
      // 从选择中移除
      const selIdx = this.selectionModel.contains(unit) ? this.selectedUnits.indexOf(unit) : -1
      if (selIdx >= 0) {
        this.selectionModel.remove(unit)
        this.sel.removeSelectionRingAt(selIdx)
      }
      // 取消其他单位对它的攻击引用
      for (const other of this.units) {
        if (other === unit) continue
        if (other.attackTarget === unit) {
          other.attackTarget = null
          if (other.state === UnitState.AttackMove) {
            this.resumeAttackMove(other)
          } else if (other.state === UnitState.HoldPosition) {
            // 驻守中目标死亡 → 保持驻守
          } else {
            // 尝试恢复被 auto-aggro 中断的原始命令
            this.restorePreviousOrder(other)
          }
        }
        if (other.buildTarget === unit) {
          other.buildTarget = null
          other.state = UnitState.Idle
          other.moveTarget = null
          other.waypoints = []
          other.resourceTarget = null
        }
        // 清理 previousResourceTarget 中指向死亡单位的引用
        if (other.previousResourceTarget) {
          const prt = other.previousResourceTarget
          if (prt.type === 'goldmine' && prt.mine === unit) {
            other.previousResourceTarget = null
            other.previousState = null
          }
        }
      }
      // 移除血条（deep dispose）
      const bars = this.healthBars.get(unit)
      if (bars) {
        disposeObject3DDeep(bars.bg.parent!)
        this.healthBars.delete(unit)
      }
      // 释放建筑占用
      if (unit.isBuilding) {
        this.unmarkBuildingOccupancy(unit)
      }
      // 从描边列表移除
      const oi = this.outlineObjects.indexOf(unit.mesh)
      if (oi >= 0) this.outlineObjects.splice(oi, 1)
      // 移除模型（deep dispose）
      disposeObject3DDeep(unit.mesh)
    }

    // 批量移除死亡单位（一次 filter，避免多次 splice）
    this.units = this.units.filter(u => !deadSet.has(u))
  }

  // ==================== 胜利/失败检测 ====================

  /** 检查胜利/失败条件：一方主基地全毁则判负 */
  private checkGameOver() {
    if (this.gameOverResult) return

    // Player 0 (human) defeat: no living townhall
    const playerTH = this.units.some(u => u.team === 0 && u.type === 'townhall' && u.isBuilding && u.hp > 0)
    if (!playerTH) {
      this.endGame('defeat')
      return
    }

    // Player 1 (AI) defeat: no living townhall
    const aiTH = this.units.some(u => u.team === 1 && u.type === 'townhall' && u.isBuilding && u.hp > 0)
    if (!aiTH) {
      this.endGame('victory')
    }
  }

  private endGame(result: 'victory' | 'defeat') {
    this.gameOverResult = result
    this.phase.set(Phase.GameOver)

    // Show end-state HUD overlay
    this.elGameOverOverlay.style.display = 'flex'
    this.elGameOverOverlay.classList.add(result)
    this.elGameOverText.textContent = result === 'victory' ? '胜利' : '失败'
  }

  /** Public accessor for runtime tests */
  getMatchResult(): 'victory' | 'defeat' | null {
    return this.gameOverResult
  }

  /** 树木耗尽：移除 mesh + 释放 blocker */
  private depleteTree(tree: TreeEntry) {
    this.treeManager.remove(tree)
    disposeObject3DDeep(tree.mesh)
  }

  /** 验证资源目标是否仍有效（gold/lumber 统一） */
  private validateResourceTarget(unit: Unit): boolean {
    const rt = unit.resourceTarget
    if (!rt) return false
    if (rt.type === 'tree') {
      return rt.entry.remainingLumber > 0
    }
    if (rt.type === 'goldmine') {
      return rt.mine.hp > 0 && rt.mine.remainingGold > 0
    }
    return false
  }

  /** 建筑的交互半径按 footprint 边界计算，不要求走到中心点。 */
  private getBuildingInteractionRadius(target: Unit): number {
    const size = BUILDINGS[target.type]?.size ?? 1
    return Math.max(GATHER_RANGE, size * 0.5)
  }

  /** 采集型交互使用资源节点边界，而不是精确 path target。 */
  private hasReachedGatherInteraction(unit: Unit): boolean {
    const rt = unit.resourceTarget
    if (!rt) return false
    if (rt.type === 'tree') {
      return unit.mesh.position.distanceTo(rt.entry.mesh.position) <= GATHER_RANGE
    }
    if (rt.type === 'goldmine') {
      return unit.mesh.position.distanceTo(rt.mine.mesh.position) <= this.getBuildingInteractionRadius(rt.mine)
    }
    return false
  }

  /** 回本同样按 Town Hall 边界判定，避免多工人卡在中心点/编队落点。 */
  private hasReachedDropoffHall(unit: Unit, hall: Unit | null): boolean {
    if (!hall) return false
    return unit.mesh.position.distanceTo(hall.mesh.position) <= this.getBuildingInteractionRadius(hall)
  }

  /** 建造同样按建筑边界交互，不要求工人走到占用中的中心点。 */
  private hasReachedBuildInteraction(unit: Unit, target: Unit): boolean {
    const size = BUILDINGS[target.type]?.size ?? 1
    const radius = Math.max(BUILD_RANGE, size * 0.5)
    return unit.mesh.position.distanceTo(target.mesh.position) <= radius
  }

  /** 金矿采集槽位：同一座金矿最多 5 个农民同时真正采集。 */
  private canStartGoldGather(unit: Unit): boolean {
    const rt = unit.resourceTarget
    if (unit.gatherType !== 'gold' || rt?.type !== 'goldmine') return true

    const activeGatherers = this.units.filter(other =>
      other !== unit &&
      other.hp > 0 &&
      other.gatherType === 'gold' &&
      other.state === UnitState.Gathering &&
      other.resourceTarget?.type === 'goldmine' &&
      other.resourceTarget.mine === rt.mine,
    ).length

    return activeGatherers < GOLDMINE_MAX_WORKERS
  }

  /**
   * 统一采集结算：扣减真实资源对象，返回本次携带量
   * gold/lumber 对称处理：
   * - 有有效目标 → 扣减资源 + 返回携带量
   * - 目标无效/耗尽 → 返回 0
   */
  private settleGather(unit: Unit): number {
    const rt = unit.resourceTarget
    if (!rt) return 0

    if (unit.gatherType === 'lumber' && rt.type === 'tree') {
      const tree = rt.entry
      if (tree.remainingLumber > 0) {
        tree.remainingLumber -= LUMBER_PER_TRIP
        if (tree.remainingLumber <= 0) {
          this.depleteTree(tree)
        }
        return LUMBER_PER_TRIP
      }
      return 0
    }

    if (unit.gatherType === 'gold' && rt.type === 'goldmine') {
      const mine = rt.mine
      if (mine.hp > 0 && mine.remainingGold > 0) {
        const take = Math.min(GOLD_PER_TRIP, mine.remainingGold)
        mine.remainingGold -= take
        return take
      }
      return 0
    }

    return 0
  }

  /** 让农民去采最近的资源（自动回采 / 采集失败重试入口） */
  private startGatherNearest(unit: Unit) {
    if (unit.gatherType === 'gold') {
      const mine = this.findNearestGoldmine(unit)
      if (mine && mine.remainingGold > 0) {
        unit.state = UnitState.MovingToGather
        unit.resourceTarget = { type: 'goldmine', mine }
        this.planPath(unit, mine.mesh.position)
        return
      }
    }
    // 伐木：走向最近的树（通过 TreeManager 统一查询）
    if (unit.gatherType === 'lumber') {
      const tree = this.treeManager.findNearest(unit.mesh.position, 30)
      if (tree) {
        unit.state = UnitState.MovingToGather
        unit.resourceTarget = { type: 'tree', entry: tree }
        this.planPath(unit, tree.mesh.position)
        return
      }
    }
    // 找不到资源 → 空闲，清除资源目标
    unit.state = UnitState.Idle
    unit.resourceTarget = null
  }

  /** 找最近的未耗尽金矿 */
  private findNearestGoldmine(unit: Unit): Unit | null {
    let best: Unit | null = null
    let bestDist = Infinity
    for (const u of this.units) {
      if (u.type !== 'goldmine' || u.hp <= 0 || u.remainingGold <= 0) continue
      const d = unit.mesh.position.distanceTo(u.mesh.position)
      if (d < bestDist) { bestDist = d; best = u }
    }
    return best
  }

  // ==================== 建造系统 ====================

  /** 进入建造放置模式 */
  enterPlacementMode(buildingKey: string) {
    const def = BUILDINGS[buildingKey]
    if (!def) return

    // 检查资源
    if (!this.resources.canAfford(0, def.cost)) return

    // 保存当前选中的可控 worker（进入放置模式后选择会被清除）
    const savedWorkers = this.selectedUnits.filter(
      (u) => u.team === 0 && u.type === 'worker' && !u.isBuilding,
    )

    this.clearSelection()

    // 创建幽灵建筑
    const ghostMesh = this.placement.createGhostMesh(buildingKey)
    ghostMesh.visible = false
    this.scene.add(ghostMesh)
    this.placement.begin(buildingKey, savedWorkers, ghostMesh)
    this.updateModeHint(`放置 ${def.name} — 左键放置，右键/Esc取消`)
  }

  /** 更新幽灵建筑位置 + 合法性颜色反馈 */
  private updateGhostPlacement() {
    if (!this.placement.mode || !this.placement.currentGhost) return

    this.raycaster.setFromCamera(this.mouseNDC, this.camera)
    const hits = this.raycaster.intersectObject(this.terrain.groundPlane)
    const hitPoint = hits.length > 0 ? hits[0].point : null
    this.placement.updatePreview(
      hitPoint,
      (wx, wz) => this.getWorldHeight(wx, wz),
      this.placementValidator,
    )
  }

  /** 放置建筑 */
  private placeBuilding() {
    if (!this.placement.mode || !this.placement.currentGhost) return

    const key = this.placement.mode
    const def = BUILDINGS[key]

    // 放置合法性校验
    const pos = this.placement.currentGhost.position.clone()
    const tx = Math.round(pos.x - 0.5)
    const tz = Math.round(pos.z - 0.5)
    const result = this.placementValidator.canPlace(tx, tz, def.size)
    if (!result.ok) return

    // 扣资源
    this.resources.spend(0, def.cost)

    // 创建建筑实体（半透明，表示未完成）
    const building = this.spawnBuilding(key, 0, tx, tz)
    building.buildProgress = 0
    building.mesh.scale.setScalar(0.3)
    // 半透明表示未完成
    const bMesh = building.mesh.children[0] as THREE.Mesh | undefined
    const bMat = bMesh?.material as THREE.MeshLambertMaterial | undefined
    if (bMat) { bMat.transparent = true; bMat.opacity = 0.5 }

    // 优先使用进入建造模式时选中的 worker（玩家指定建造者）
    // 只有在没有选中 worker 时才 fallback 到最近空闲农民
    let peasant: Unit | null = null

    // 从已保存的选中 worker 中找：优先 primary（第一个），然后其他选中的
    const savedWorkers = this.placement.aliveWorkers(this.units)
    if (savedWorkers.length > 0) {
      // 如果只有一个选中的 worker → 它就是建造者
      // 如果多个选中的 → 用 primary（第一个）
      peasant = savedWorkers[0]
    } else {
      // Fallback：没有选中 worker（从命令卡直接点击建造按钮时，选中可能是建筑）
      peasant = this.findNearestIdlePeasant(pos)
    }

    if (peasant) this.assignBuilderToConstruction(peasant, building)

    // 清理
    this.exitPlacementMode()
  }

  exitPlacementMode() {
    this.placement.exit(this.scene)
    this.updateModeHint('')
  }

  /**
   * Assign a worker to active construction.
   *
   * This is intentionally small: it is not a full repair system or
   * multi-builder model. It only makes interrupted construction resumable.
   */
  private assignBuilderToConstruction(worker: Unit, building: Unit): boolean {
    if (!this.units.includes(worker) || !this.units.includes(building)) return false
    if (worker.isBuilding || !UNITS[worker.type]?.canGather) return false
    if (!building.isBuilding || building.buildProgress >= 1 || building.hp <= 0) return false
    if (worker.team !== building.team) return false

    // Prevent stealing from a valid active builder (MovingToBuild or Building)
    const existing = building.builder
    if (existing && existing !== worker
      && this.units.includes(existing)
      && existing.hp > 0
      && existing.buildTarget === building
      && (existing.state === UnitState.MovingToBuild || existing.state === UnitState.Building)) {
      return false
    }

    building.builder = worker
    dispatchGameCommand([worker], { type: 'build', target: building })
    const hasPath = this.planPath(worker, building.mesh.position)
    if (!hasPath) {
      worker.waypoints = []
      worker.moveTarget = null
      worker.state = UnitState.Building
    }
    return true
  }

  /**
   * Cancel an under-construction building.
   *
   * Current deterministic baseline: refund floor(75% of total building cost).
   * This is a product contract, not a claim of full Warcraft III parity.
   */
  private cancelConstruction(building: Unit): boolean {
    if (!this.units.includes(building)) return false
    if (!building.isBuilding || building.buildProgress >= 1 || building.hp <= 0) return false
    const def = BUILDINGS[building.type]
    if (!def || building.team < 0) return false

    const refundGold = Math.floor(def.cost.gold * CONSTRUCTION_CANCEL_REFUND_RATE)
    const refundLumber = Math.floor(def.cost.lumber * CONSTRUCTION_CANCEL_REFUND_RATE)
    if (refundGold > 0 || refundLumber > 0) {
      this.resources.earn(building.team, refundGold, refundLumber)
    }

    building.hp = 0
    this.handleDeadUnits()
    // Force the next HUD tick to rebuild empty selection/command-card state.
    this._lastCmdKey = '__construction_cancel__'
    this._lastSelKey = '__construction_cancel__'
    return true
  }

  /** 进入攻击移动目标选择模式 */
  enterAttackMoveMode() {
    this.attackMoveMode = true
    this.updateModeHint('攻击移动 — 左键点击目标位置，右键/Esc取消')
  }

  /** 更新模式提示文字 */
  private updateModeHint(text: string) {
    this.elModeHint.textContent = text
    this.elModeHint.style.display = text ? 'block' : 'none'
  }

  /** 编组召回轻量反馈（短暂闪烁编组号） */
  private groupHintTimer = 0
  private flashGroupHint(slot: number, count: number, summary: string) {
    this.elModeHint.textContent = `编组 ${slot} — ${count} 个单位${summary ? ' (' + summary + ')' : ''}`
    this.elModeHint.style.display = 'block'
    this.groupHintTimer = 1.2  // 秒
  }

  /** 给一组单位设置 auto-aggro suppression 窗口（玩家手动撤退时使用） */
  private suppressAggroFor(units: readonly Unit[], duration: number = 1.5) {
    const until = this.gameTime + duration
    for (const u of units) {
      u.aggroSuppressUntil = until
    }
  }

  /**
   * Runtime-test command hook.
   *
   * The game already exposes `window.__war3Game` for Playwright contracts.
   * Keeping this wrapper on Game lets tests exercise the real GameCommand
   * dispatcher without duplicating command field mutations in the browser.
   */
  issueCommand(units: Unit[], cmd: Parameters<typeof dispatchGameCommand>[1]) {
    dispatchGameCommand(units, cmd)
  }

  /** 清除所有模式（ESC 统一出口） */
  private cancelAllModes() {
    if (this.placement.mode) {
      this.exitPlacementMode()
    }
    if (this.attackMoveMode) {
      this.attackMoveMode = false
    }
    if (this.rallyMode) {
      this.rallyMode = false
      this.rallyBuilding = null
    }
    this.updateModeHint('')
  }

  // ==================== 输入 ====================

  private setupInput() {
    const canvas = this.renderer.domElement

    canvas.addEventListener('mousemove', (e) => {
      this.mouseNDC.x = (e.clientX / window.innerWidth) * 2 - 1
      this.mouseNDC.y = -(e.clientY / window.innerHeight) * 2 + 1
      this.mouseScreen.set(e.clientX, e.clientY)
      this.updateTileInfo()

      if (this.isDragging) {
        this.drawSelectionBox(e.clientX, e.clientY)
      }
    })

    canvas.addEventListener('mousedown', (e) => {
      if (e.button !== 0) return

      // 建造模式：放置建筑
      if (this.placement.mode) {
        this.placeBuilding()
        return
      }

      // 攻击移动模式：点击地面发出 attack-move
      if (this.attackMoveMode) {
        this.mouseNDC.x = (e.clientX / window.innerWidth) * 2 - 1
        this.mouseNDC.y = -(e.clientY / window.innerHeight) * 2 + 1
        this.handleAttackMoveClick()
        this.attackMoveMode = false
        this.updateModeHint('')
        return
      }

      // 集结点模式：点击地面/金矿设 rally
      if (this.rallyMode) {
        this.mouseNDC.x = (e.clientX / window.innerWidth) * 2 - 1
        this.mouseNDC.y = -(e.clientY / window.innerHeight) * 2 + 1
        this.handleRallyClick()
        this.rallyMode = false
        this.rallyBuilding = null
        this.updateModeHint('')
        return
      }

      this.isDragging = false
      this.dragStart.set(e.clientX, e.clientY)
    })

    canvas.addEventListener('mouseup', (e) => {
      if (e.button !== 0) return
      if (this.placement.mode) return
      if (this.attackMoveMode) return
      if (this.rallyMode) return

      if (this.isDragging) {
        this.finishBoxSelect(e.clientX, e.clientY, this.shiftHeld || e.shiftKey)
      } else {
        this.mouseNDC.x = (e.clientX / window.innerWidth) * 2 - 1
        this.mouseNDC.y = -(e.clientY / window.innerHeight) * 2 + 1
        this.handleClick()
      }
      this.isDragging = false
      this.sel.hideSelectionBox()
    })

    canvas.addEventListener('mousemove', (e) => {
      if (e.buttons !== 1) return
      const dx = e.clientX - this.dragStart.x
      const dy = e.clientY - this.dragStart.y
      if (!this.isDragging && (Math.abs(dx) > 5 || Math.abs(dy) > 5)) {
        this.isDragging = true
      }
    })

    canvas.addEventListener('contextmenu', (e) => {
      e.preventDefault()

      // 右键取消建造模式
      if (this.placement.mode) {
        this.exitPlacementMode()
        return
      }

      // 右键取消攻击移动模式
      if (this.attackMoveMode) {
        this.attackMoveMode = false
        this.updateModeHint('')
        return
      }

      // 右键取消集结点模式
      if (this.rallyMode) {
        this.rallyMode = false
        this.rallyBuilding = null
        this.updateModeHint('')
        return
      }

      if (this.selectedUnits.length === 0) return

      this.mouseNDC.x = (e.clientX / window.innerWidth) * 2 - 1
      this.mouseNDC.y = -(e.clientY / window.innerHeight) * 2 + 1
      this.handleRightClick()
    })

    // Shift 键状态跟踪
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Shift') this.shiftHeld = true
    })
    window.addEventListener('keyup', (e) => {
      if (e.key === 'Shift') this.shiftHeld = false
    })

    // 键盘快捷键
    window.addEventListener('keydown', (e) => {
      // Esc = 取消当前模式（最高优先级）
      if (e.key === 'Escape') {
        this.cancelAllModes()
        return
      }

      // P = 截图（全局可用）
      if (e.key.toLowerCase() === 'p') {
        this.captureScreenshot()
        return
      }

      // 控制组：Ctrl+1..9 存编组
      const digit = parseInt(e.key)
      if (digit >= 1 && digit <= 9 && e.ctrlKey) {
        e.preventDefault()
        if (this.selectedUnits.length > 0) {
          this.controlGroups.save(digit, this.selectedUnits)
        }
        return
      }

      // 控制组：1..9 召回编组
      if (digit >= 1 && digit <= 9 && !e.ctrlKey && !e.altKey) {
        // 建造/攻击移动/集结模式时不响应数字键（避免误触）
        if (this.placement.mode || this.attackMoveMode || this.rallyMode) return

        const recalled = this.controlGroups.recall(digit, this.units)
        if (recalled.length > 0) {
          // Shift 持有时追加到现有选择
          if (this.shiftHeld) {
            for (const u of recalled) {
              if (!this.selectionModel.contains(u)) {
                this.selectionModel.add(u)
                this.sel.createSelectionRing(u)
              }
            }
          } else {
            this.clearSelection()
            this.sel.clearSelectionRings()
            this.selectionModel.setSelection(recalled)
            for (const u of recalled) {
              this.sel.createSelectionRing(u)
            }
          }
          // 重置 HUD 缓存
          this._lastCmdKey = ''
          this._lastSelKey = ''
          // 轻量召回反馈：短暂显示编组信息
          const summary = this.controlGroups.getTypeSummary(digit)
          this.flashGroupHint(digit, recalled.length, summary)
        }
        return
      }

      // 建造/攻击移动/集结模式时不响应快捷键
      if (this.placement.mode || this.attackMoveMode || this.rallyMode) return
      if (this.selectedUnits.length === 0) return

      // Tab = 子组切换
      if (e.key === 'Tab') {
        e.preventDefault()
        if (this.selectionModel.cycleSubgroup()) {
          // 强制刷新命令卡和选择 HUD
          this._lastCmdKey = ''
          this._lastSelKey = ''
          // 重建 selection rings 以匹配新的选择顺序
          this.sel.clearSelectionRings()
          for (const u of this.selectedUnits) {
            this.sel.createSelectionRing(u)
          }
        }
        return
      }

      // 建筑快捷键（Y = 集结点）
      if (e.key.toLowerCase() === 'y') {
        const primary = this.selectionModel.primary
        if (primary && primary.team === 0 && primary.isBuilding && primary.buildProgress >= 1) {
          const def = BUILDINGS[primary.type]
          if (def?.trains) {
            this.enterRallyMode(primary)
          }
        }
        return
      }

      const controllable = this.selectedUnits.filter((u) => u.team === 0 && !u.isBuilding)
      if (controllable.length === 0) return

      switch (e.key.toLowerCase()) {
        case 's':
          dispatchGameCommand(controllable, { type: 'stop' })
          this.suppressAggroFor(controllable)
          break
        case 'h':
          dispatchGameCommand(controllable, { type: 'holdPosition' })
          break
        case 'a':
          this.enterAttackMoveMode()
          break
      }
    })

    // 小地图点击跳转视角
    const minimapCanvas = document.getElementById('minimap-canvas') as HTMLCanvasElement
    if (minimapCanvas) {
      minimapCanvas.addEventListener('mousedown', (e) => {
        e.stopPropagation()
        this.handleMinimapClick(e)
      })
      minimapCanvas.addEventListener('mousemove', (e) => {
        if (e.buttons !== 1) return
        e.stopPropagation()
        this.handleMinimapClick(e)
      })
    }
  }

  /** 为单个单位计算 A* 路径并设置 waypoints + moveTarget
   * @returns true = 有移动目标（路径或直线 fallback），false = 已在最佳可达位置 */
  private planPath(unit: Unit, target: THREE.Vector3): boolean {
    if (unit.isBuilding) return false

    const startTx = Math.floor(unit.mesh.position.x)
    const startTz = Math.floor(unit.mesh.position.z)
    const goalTx = Math.floor(target.x)
    const goalTz = Math.floor(target.z)

    const tilePath = findPath(startTx, startTz, goalTx, goalTz, this.pathingGrid)
    const waypoints = pathToWorldWaypoints(tilePath, (wx, wz) => this.getWorldHeight(wx, wz))

    if (waypoints === null) {
      // 真正寻路失败 → 直线 fallback
      unit.waypoints = []
      unit.moveTarget = target.clone()
      unit.moveTarget.y = this.getWorldHeight(target.x, target.z)
      return true
    } else if (waypoints.length > 0) {
      // 有路径 → 跟随 waypoints
      unit.waypoints = waypoints
      unit.moveTarget = unit.waypoints.shift()!
      return true
    } else {
      // 空路径 = 已在最佳可达位置（blocked target 旁），停止移动
      unit.waypoints = []
      unit.moveTarget = null
      return false
    }
  }

  /** 为一组单位批量计算路径（含编队偏移） */
  private planPathForUnits(units: Unit[], target: THREE.Vector3) {
    if (units.length <= 1) {
      for (const u of units) {
        if (!u.isBuilding) this.planPath(u, target)
      }
      return
    }

    // Formation offsets: arrange units in a grid around the target
    const cols = Math.ceil(Math.sqrt(units.length))
    for (let i = 0; i < units.length; i++) {
      const u = units[i]
      if (u.isBuilding) continue

      const row = Math.floor(i / cols)
      const col = i % cols
      const offsetX = (col - (cols - 1) / 2) * FORMATION_SPACING
      const offsetZ = (row - (Math.ceil(units.length / cols) - 1) / 2) * FORMATION_SPACING

      const offsetTarget = new THREE.Vector3(
        target.x + offsetX,
        target.y,
        target.z + offsetZ,
      )

      // Validate offset target is not blocked; if it is, fall back to base target
      if (this.isPositionBlocked(offsetTarget.x, offsetTarget.z)) {
        this.planPath(u, target)
      } else {
        this.planPath(u, offsetTarget)
      }
    }
  }

  // ==================== 单位命中查找 ====================

  /** Deduplicate all unit hits resolved from a raycast hit list. */
  private resolveHitUnits(hits: readonly THREE.Intersection<THREE.Object3D>[]): Unit[] {
    return this.sel.resolveHitUnits(hits, this.units)
  }

  private resolveClickSelectionTarget(hitUnits: readonly Unit[]): Unit | undefined {
    return this.sel.resolveClickSelectionTarget(hitUnits)
  }

  // ==================== 左键选择 ====================

  private handleClick() {
    this.raycaster.setFromCamera(this.mouseNDC, this.camera)
    const unitMeshes = this.units.map((u) => u.mesh)
    const hits = this.raycaster.intersectObjects(unitMeshes, true)

    if (hits.length > 0) {
      const unit = this.resolveClickSelectionTarget(this.resolveHitUnits(hits))
      if (unit) {
        // Shift+click: add/remove toggle
        if (this.shiftHeld) {
          if (this.selectionModel.contains(unit)) {
            // 移除：先记录 index 再从 model 移除
            const idx = this.selectedUnits.indexOf(unit)
            this.selectionModel.remove(unit)
            this.sel.removeSelectionRingAt(idx)
          } else if (unit.team === 0) {
            // 添加友方单位
            this.selectionModel.add(unit)
            this.sel.createSelectionRing(unit)
          }
          // 敌方单位：忽略
          // 'rejected' = 敌方单位，忽略
          return
        }

        // 双击检测：如果点击的是同一个单位且在时间窗口内
        const now = performance.now()
        if (this.lastClickUnit === unit && now - this.lastClickTime < Game.DOUBLE_CLICK_MS) {
          // 双击：选中屏幕上所有同类友方单位
          this.clearSelection()
          this.sel.clearSelectionRings()
          this.selectionModel.setSelection([unit])
          // 尝试选中所有可见同类（保持 primary = 被点击的单位）
          this.selectionModel.selectSameType(this.units, 0, (u) => this.sel.isUnitOnScreen(u))
          // 为所有选中的单位创建 selection rings
          for (const u of this.selectedUnits) {
            this.sel.createSelectionRing(u)
          }
          this.lastClickTime = 0
          this.lastClickUnit = null
          return
        }

        // 普通单击：替换选择
        this.lastClickTime = now
        this.lastClickUnit = unit
        this.clearSelection()
        this.sel.clearSelectionRings()
        this.selectUnit(unit)
        return
      }
    }
    // 点击空白处：清除选择（Shift 不影响）
    this.clearSelection()
    this.sel.clearSelectionRings()
  }

  // ==================== 右键命令 ====================

  private handleRightClick() {
    this.raycaster.setFromCamera(this.mouseNDC, this.camera)

    // 先检测是否右键点击了单位/建筑
    const unitMeshes = this.units.map((u) => u.mesh)
    const unitHits = this.raycaster.intersectObjects(unitMeshes, true)

    if (unitHits.length > 0) {
      // Resolve all hit units from the hit list. When workers crowd a goldmine
      // the first hit may be a worker, but the player intent is to gather.
      // Prefer goldmine or unfinished building over own units.
      const hitUnits: Unit[] = []
      const seen = new Set<Unit>()
      for (const hit of unitHits) {
        const u = this.sel.findUnitByObject(hit.object, this.units)
        if (u && !seen.has(u)) { hitUnits.push(u); seen.add(u) }
      }
      const target =
        hitUnits.find(u => u.type === 'goldmine') ??
        hitUnits.find(u => u.team === 0 && u.isBuilding && u.buildProgress < 1) ??
        hitUnits[0]

      if (target) {
        // 只有己方可控单位才能接受玩家命令
        const controllable = this.selectedUnits.filter((u) => u.team === 0 && !u.isBuilding)

        // 右键金矿 → 只派 worker 采金
        if (target.type === 'goldmine') {
          const workers = controllable.filter((u) => UNITS[u.type]?.canGather)
          dispatchGameCommand(workers, { type: 'gather', resourceType: 'gold', target: target.mesh.position })
          for (const u of workers) {
            u.resourceTarget = { type: 'goldmine', mine: target }
          }
          this.planPathForUnits(workers, target.mesh.position)
          // 非 worker 单位走到金矿旁（移动命令）
          const nonWorkers = controllable.filter((u) => !UNITS[u.type]?.canGather)
          if (nonWorkers.length > 0) {
            dispatchGameCommand(nonWorkers, { type: 'move', target: target.mesh.position })
            this.planPathForUnits(nonWorkers, target.mesh.position)
            this.suppressAggroFor(nonWorkers)
          }
          this.feedback.showMoveIndicator(target.mesh.position.x, target.mesh.position.z)
          return
        }

        // 右键敌方 → 攻击
        if (target.team !== 0 && target.type !== 'goldmine') {
          dispatchGameCommand(controllable, { type: 'attack', target })
          this.planPathForUnits(controllable, target.mesh.position)
          return
        }

        // 右键己方未完成建筑 → 农民续建
        if (target.team === 0 && target.isBuilding && target.buildProgress < 1) {
          const workers = controllable.filter((u) => UNITS[u.type]?.canGather)
          let assigned = 0
          for (const worker of workers) {
            if (this.assignBuilderToConstruction(worker, target)) assigned++
          }
          if (assigned > 0) {
            this.feedback.showMoveIndicator(target.mesh.position.x, target.mesh.position.z)
            return
          }
        }

        // 右键己方建筑 → 移动到建筑旁
        dispatchGameCommand(controllable, { type: 'move', target: target.mesh.position })
        this.planPathForUnits(controllable, target.mesh.position)
        this.suppressAggroFor(controllable)
        this.feedback.showMoveIndicator(target.mesh.position.x, target.mesh.position.z)
        return
      }
    }

    // 右键地面
    const groundHits = this.raycaster.intersectObject(this.terrain.groundPlane)
    if (groundHits.length === 0) return

    const groundTarget = groundHits[0].point
    const controllable = this.selectedUnits.filter((u) => u.team === 0 && !u.isBuilding)

    // Shift + 右键地面 → 追加移动到队列（不覆盖当前移动，不触发采集）
    if (this.shiftHeld) {
      for (const u of controllable) {
        u.moveQueue.push({ type: 'move', target: groundTarget.clone() })
        // 如果单位当前空闲，立即启动第一段队列
        if (u.state === UnitState.Idle && u.moveQueue.length > 0) {
          const firstCmd = u.moveQueue.shift()!
          this.executeQueuedCommand(u, firstCmd)
        }
      }
      this.feedback.showQueuedMoveIndicator(groundTarget.x, groundTarget.z)
      return
    }

    // 检查附近是否有树（伐木，通过 TreeManager 统一查询）
    const nearestTree = this.treeManager.findNearest(groundTarget, 2)
    if (nearestTree) {
      const workers = controllable.filter((u) => UNITS[u.type]?.canGather)
      dispatchGameCommand(workers, { type: 'gather', resourceType: 'lumber', target: nearestTree.mesh.position })
      // 为每个 worker 设置明确的树目标
      for (const u of workers) {
        u.resourceTarget = { type: 'tree', entry: nearestTree }
      }
      this.planPathForUnits(workers, nearestTree.mesh.position)
      // 非 worker 单位走到目标位置（移动命令）
      const nonWorkers = controllable.filter((u) => !UNITS[u.type]?.canGather)
      if (nonWorkers.length > 0) {
        dispatchGameCommand(nonWorkers, { type: 'move', target: nearestTree.mesh.position })
        this.planPathForUnits(nonWorkers, nearestTree.mesh.position)
        this.suppressAggroFor(nonWorkers)
      }
    } else {
      dispatchGameCommand(controllable, { type: 'move', target: groundTarget })
      this.planPathForUnits(controllable, groundTarget)
      this.suppressAggroFor(controllable)
    }

    this.feedback.showMoveIndicator(groundTarget.x, groundTarget.z)
  }

  /** 攻击移动：左键点击地面 */
  private handleAttackMoveClick() {
    this.raycaster.setFromCamera(this.mouseNDC, this.camera)
    const groundHits = this.raycaster.intersectObject(this.terrain.groundPlane)
    if (groundHits.length === 0) return

    const target = groundHits[0].point
    const controllable = this.selectedUnits.filter((u) => u.team === 0 && !u.isBuilding)

    // Shift + attackMove → 追加到队列
    if (this.shiftHeld) {
      for (const u of controllable) {
        u.moveQueue.push({ type: 'attackMove', target: target.clone() })
        // 如果单位当前空闲，立即启动队列
        if (u.state === UnitState.Idle && u.moveQueue.length > 0) {
          const firstCmd = u.moveQueue.shift()!
          this.executeQueuedCommand(u, firstCmd)
        }
      }
      this.feedback.showAttackMoveIndicator(target.x, target.z)
      return
    }

    dispatchGameCommand(controllable, { type: 'attackMove', target })
    for (const u of controllable) {
      this.planAttackMovePath(u, target)
    }
    // 红色攻击移动指示器
    this.feedback.showAttackMoveIndicator(target.x, target.z)
  }


  /** 集结点：左键点击地面/金矿 */
  private handleRallyClick() {
    if (!this.rallyBuilding) return
    const building = this.rallyBuilding

    // 先检查是否点击了单位/金矿
    this.raycaster.setFromCamera(this.mouseNDC, this.camera)
    const unitMeshes = this.units.map((u) => u.mesh)
    const unitHits = this.raycaster.intersectObjects(unitMeshes, true)

    if (unitHits.length > 0) {
      const hitObj = unitHits[0].object
      const target = this.sel.findUnitByObject(hitObj, this.units)
      // 点击金矿 → 设为 goldmine rally
      if (target && target.type === 'goldmine') {
        dispatchGameCommand([], { type: 'setRally', building, target: target.mesh.position, rallyTarget: target })
        this.feedback.showMoveIndicator(target.mesh.position.x, target.mesh.position.z)
        return
      }
    }

    // 点击地面 → 设为普通位置 rally
    const groundHits = this.raycaster.intersectObject(this.terrain.groundPlane)
    if (groundHits.length === 0) return
    const target = groundHits[0].point
    dispatchGameCommand([], { type: 'setRally', building, target })
    this.feedback.showMoveIndicator(target.x, target.z)
  }

  /** 进入集结点设置模式 */
  enterRallyMode(building: Unit) {
    this.rallyMode = true
    this.rallyBuilding = building
    this.updateModeHint('设置集结点 — 左键点击目标位置/金矿，右键/Esc取消')
  }

  // ==================== 框选 ====================

  private drawSelectionBox(ex: number, ey: number) {
    this.sel.drawSelectionBox(this.dragStart.x, this.dragStart.y, ex, ey)
  }

  private finishBoxSelect(ex: number, ey: number, appendSelection?: boolean) {
    const shouldAppend = appendSelection ?? this.shiftHeld
    const x1 = Math.min(this.dragStart.x, ex)
    const y1 = Math.min(this.dragStart.y, ey)
    const x2 = Math.max(this.dragStart.x, ex)
    const y2 = Math.max(this.dragStart.y, ey)

    if ((x2 - x1) * (y2 - y1) < 25) {
      this.mouseNDC.x = (ex / window.innerWidth) * 2 - 1
      this.mouseNDC.y = -(ey / window.innerHeight) * 2 + 1
      this.handleClick()
      return
    }

    // 如果没有 Shift，先清除现有选择
    if (!shouldAppend) {
      this.clearSelection()
      this.sel.clearSelectionRings()
    }

    const screenPos = new THREE.Vector3()
    for (const unit of this.units) {
      if (unit.team !== 0) continue
      screenPos.copy(unit.mesh.position).project(this.camera)
      const sx = (screenPos.x + 1) / 2 * window.innerWidth
      const sy = (-screenPos.y + 1) / 2 * window.innerHeight
      if (sx >= x1 && sx <= x2 && sy >= y1 && sy <= y2) {
        // Shift+框选时避免重复添加
        if (!shouldAppend || !this.selectionModel.contains(unit)) {
          this.selectUnit(unit)
        }
      }
    }

    // 强制刷新 HUD 缓存：框选完成后立即让下一帧更新命令卡和选择信息
    // 没有这行，Shift+框选后命令卡不会更新（因为 clearSelection 被跳过了）
    this._lastCmdKey = ''
    this._lastSelKey = ''
  }

  // ==================== 选择管理 ====================

  private selectUnit(unit: Unit) {
    this.selectionModel.add(unit)
    this.sel.createSelectionRing(unit)
  }

  private clearSelection() {
    this.selectionModel.clear()
    this._lastCmdKey = ''
    this._lastSelKey = ''
    this.sel.clearSelectionRings()
    this.feedback.clearQueueIndicators()
  }

  private updateSelectionRings() {
    this.sel.updateSelectionRings()
  }


  // ==================== 单位创建 ====================

  private createUnitMesh(type: string, team: number): THREE.Group {
    const group = new THREE.Group()
    const color = TEAM_COLORS[team]

    if (type === 'worker') {
      // 农民：矮胖、暖色、团队色腰带 + 背工具 — 远景可辨
      const body = new THREE.Mesh(
        new THREE.CylinderGeometry(0.22, 0.28, 0.6, 8),
        new THREE.MeshLambertMaterial({ color: 0x8b6914 }),
      )
      body.position.y = 0.3
      group.add(body)
      // 团队色腰带（宽条，远景更醒目）
      const belt = new THREE.Mesh(
        new THREE.CylinderGeometry(0.24, 0.24, 0.1, 8),
        new THREE.MeshLambertMaterial({ color }),
      )
      belt.position.y = 0.45
      group.add(belt)
      // 头（肤色）
      const head = new THREE.Mesh(
        new THREE.SphereGeometry(0.14, 8, 6),
        new THREE.MeshLambertMaterial({ color: 0xddc8a0 }),
      )
      head.position.y = 0.72
      group.add(head)
      // 帽子（团队色，小尖帽）
      const hat = new THREE.Mesh(
        new THREE.ConeGeometry(0.14, 0.18, 6),
        new THREE.MeshLambertMaterial({ color }),
      )
      hat.position.y = 0.86
      group.add(hat)
      // 镐（背上工具）
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
    } else if (type === 'footman') {
      // 步兵：更高更宽、灰甲 + 团队色战袍 + 剑盾 — 和 worker 形成强烈剪影对比
      const body = new THREE.Mesh(
        new THREE.CylinderGeometry(0.28, 0.32, 0.9, 8),
        new THREE.MeshLambertMaterial({ color: 0x787878 }),
      )
      body.position.y = 0.45
      group.add(body)
      // 肩甲（更宽更明显）
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
      // 团队色战袍（大块醒目色）
      const tabard = new THREE.Mesh(
        new THREE.BoxGeometry(0.42, 0.55, 0.06),
        new THREE.MeshLambertMaterial({ color }),
      )
      tabard.position.set(0, 0.48, 0.24)
      group.add(tabard)
      // 头盔（圆顶 + 鼻梁护 + 团队色羽饰）
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
      // 头盔羽饰（团队色小三角，远景辨识）
      const plume = new THREE.Mesh(
        new THREE.ConeGeometry(0.06, 0.2, 4),
        new THREE.MeshLambertMaterial({ color }),
      )
      plume.position.set(0, 1.26, 0)
      group.add(plume)
      // 剑
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
      // 盾牌（团队色 + 边框）
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
    } else if (type === 'townhall') {
      // 城镇大厅：size=4 的锚定建筑，视觉上要大于所有其他建筑
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
      // 门上拱形装饰
      const doorArch = new THREE.Mesh(
        new THREE.CylinderGeometry(0.4, 0.4, 0.06, 8, 1, false, 0, Math.PI),
        new THREE.MeshLambertMaterial({ color: 0x706050 }),
      )
      doorArch.position.set(0, 1.2, 1.73)
      doorArch.rotation.z = Math.PI / 2
      doorArch.rotation.y = Math.PI / 2
      group.add(doorArch)
      // 窗户暗示（两侧各一个）
      const winMat = new THREE.MeshLambertMaterial({ color: 0xddc880, emissive: 0x332200 })
      const win1 = new THREE.Mesh(new THREE.PlaneGeometry(0.35, 0.35), winMat)
      win1.position.set(1.0, 1.15, 1.73)
      group.add(win1)
      const win2 = new THREE.Mesh(new THREE.PlaneGeometry(0.35, 0.35), winMat)
      win2.position.set(-1.0, 1.15, 1.73)
      group.add(win2)
    } else if (type === 'barracks') {
      // 兵营：size=3 生产建筑
      const stonework = new THREE.Mesh(
        new THREE.BoxGeometry(2.6, 0.3, 2.4),
        new THREE.MeshLambertMaterial({ color: 0x707060 }),
      )
      stonework.position.y = 0.15
      group.add(stonework)
      // 主墙体
      const base = new THREE.Mesh(
        new THREE.BoxGeometry(2.4, 0.9, 2.2),
        new THREE.MeshLambertMaterial({ color: 0x604020 }),
      )
      base.position.y = 0.75
      group.add(base)
      // 门口开口（暗色凹陷）
      const doorSpace = new THREE.Mesh(
        new THREE.BoxGeometry(0.7, 0.8, 0.06),
        new THREE.MeshLambertMaterial({ color: 0x1a1208 }),
      )
      doorSpace.position.set(0, 0.55, 1.13)
      group.add(doorSpace)
      // 屋顶
      const roof = new THREE.Mesh(
        new THREE.ConeGeometry(1.9, 1.1, 4),
        new THREE.MeshLambertMaterial({ color: 0x5c3a1e }),
      )
      roof.position.y = 1.8
      roof.rotation.y = Math.PI / 4
      group.add(roof)
      // 武器架（门口旁竖杆）
      const weaponRack = new THREE.Mesh(
        new THREE.BoxGeometry(0.06, 1.0, 0.06),
        new THREE.MeshLambertMaterial({ color: 0x5c3a1e }),
      )
      weaponRack.position.set(0.85, 0.5, 1.13)
      group.add(weaponRack)
      // 挂着的剑（武器架上）
      const sword1 = new THREE.Mesh(
        new THREE.BoxGeometry(0.04, 0.5, 0.04),
        new THREE.MeshLambertMaterial({ color: 0xcccccc }),
      )
      sword1.position.set(0.85, 0.7, 1.2)
      group.add(sword1)
      // 旗杆 + 团队色旗
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
    } else if (type === 'farm') {
      // 农场：木质围栏 + 草顶
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
    } else if (type === 'tower') {
      // 箭塔：size=2，窄但可见
      const base = new THREE.Mesh(
        new THREE.CylinderGeometry(0.52, 0.62, 1.8, 8),
        new THREE.MeshLambertMaterial({ color: 0x808070 }),
      )
      base.position.y = 0.9
      group.add(base)
      // 城垛顶部
      const top = new THREE.Mesh(
        new THREE.CylinderGeometry(0.62, 0.54, 0.3, 8),
        new THREE.MeshLambertMaterial({ color: 0x707060 }),
      )
      top.position.y = 1.95
      group.add(top)
      // 城垛齿（4个小方块）
      for (let i = 0; i < 4; i++) {
        const merlon = new THREE.Mesh(
          new THREE.BoxGeometry(0.15, 0.18, 0.15),
          new THREE.MeshLambertMaterial({ color: 0x707060 }),
        )
        const angle = (i / 4) * Math.PI * 2
        merlon.position.set(Math.sin(angle) * 0.52, 2.18, Math.cos(angle) * 0.52)
        group.add(merlon)
      }
      // 尖顶
      const spire = new THREE.Mesh(
        new THREE.ConeGeometry(0.35, 0.6, 8),
        new THREE.MeshLambertMaterial({ color: 0x555555 }),
      )
      spire.position.y = 2.5
      group.add(spire)
      // 团队色小旗
      const towerFlag = new THREE.Mesh(
        new THREE.PlaneGeometry(0.25, 0.18),
        new THREE.MeshLambertMaterial({ color, side: THREE.DoubleSide }),
      )
      towerFlag.position.set(0, 2.7, 0)
      group.add(towerFlag)
    } else if (type === 'goldmine') {
      // 金矿：更大岩壁 + 更多更大晶体 + 强金光
      const rock = new THREE.Mesh(
        new THREE.BoxGeometry(2.8, 1.4, 2.8),
        new THREE.MeshLambertMaterial({ color: 0x6a6050 }),
      )
      rock.position.y = 0.7
      group.add(rock)
      // 岩壁不规则凸起
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
      // 主晶体（更大，更强发光）
      const crystal1 = new THREE.Mesh(
        new THREE.OctahedronGeometry(0.5, 0),
        new THREE.MeshLambertMaterial({ color: 0xffdd00, emissive: 0xaa8800 }),
      )
      crystal1.position.set(0, 1.8, 0)
      crystal1.scale.set(1, 1.5, 1)
      group.add(crystal1)
      // 周围晶体（更多）
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
      // 金色光晕点光源（更强）
      const glow = new THREE.PointLight(0xffaa00, 1.5, 8)
      glow.position.set(0, 2.2, 0)
      group.add(glow)
    }
    group.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.castShadow = true
        child.receiveShadow = true
      }
    })
    return group
  }

  private spawnStartingUnits() {
    // ===== 玩家基地区（地图左下象限）=====
    // WC3 研究参考布局：
    //   TH (4x4) 居中锚定，金矿 (3x3) 紧贴 NE，worker 往返路径短
    //   Barracks (3x3) 在 SW 出口方向，Farm (2x2) 用于填充墙
    //   开放方向 S-SE 用于出兵/集结/扩张
    //
    // 空间语法（从 TH 中心看）：
    //   NE: Gold Mine（3-4 tile edge-to-edge）
    //   C: Town Hall（4x4，基地核心，最大建筑）
    //   SW: Barracks（3x3，出口/军事区）
    //   S-SE: 开阔空地（出兵/集结/扩张方向）

    // Town Hall：tile (10,12) size=4 → occupies (10-13, 12-15), world center (12.5, 14.5)
    this.spawnBuilding('townhall', 0, 10, 12)

    // Gold Mine：TH 右上方 (NE)，tile (15,8) size=3 → occupies (15-17, 8-10)
    // TH edge (x=13) to GM edge (x=15) = 2 tile gap，接近 WC3 典型的 3-4 tile
    this.spawnBuilding('goldmine', -1, 15, 8)

    // Barracks：TH 左下方 (SW)，tile (5,17) size=3 → occupies (5-7, 17-19)
    this.spawnBuilding('barracks', 0, 5, 17)

    // 5 个农民：TH 南面空地，在 TH (z=12) 和树林之间
    // worker 排成一排，紧贴 TH 南面，第一趟采金路径自然
    for (let i = 0; i < 5; i++) this.spawnUnit('worker', 0, 10 + i, 11)

    // ===== AI 基地区（地图右上角，镜像布局）=====
    const far = 50
    this.spawnBuilding('townhall', 1, far, far)
    this.spawnBuilding('goldmine', -1, far + 5, far - 4)
    this.spawnBuilding('barracks', 1, far - 5, far + 5)
    for (let i = 0; i < 5; i++) this.spawnUnit('worker', 1, far + i, far - 2)

    // 初始镜头：聚焦玩家基地中心，让 TH + 金矿 + 农民一屏尽收
    this.cameraCtrl.distance = 24
    this.cameraCtrl.setTarget(13, 14)
  }

  private spawnUnit(type: string, team: number, x: number, z: number): Unit {
    const mesh = createUnitVisual(type, team)
    const def = UNITS[type]
    const h = this.getWorldHeight(x, z)
    mesh.position.set(x + 0.5, h, z + 0.5)
    this.scene.add(mesh)
    this.outlineObjects.push(mesh)

    const unit: Unit = {
      mesh, type, team,
      hp: def?.hp ?? 250, maxHp: def?.hp ?? 250,
      speed: def?.speed ?? 3, moveTarget: null,
      isBuilding: false,
      state: UnitState.Idle,
      gatherType: null, carryAmount: 0, gatherTimer: 0,
      resourceTarget: null,
      attackTimer: 0, attackTarget: null,
      attackDamage: def?.attackDamage ?? 5,
      attackRange: def?.attackRange ?? MELEE_RANGE,
      attackCooldown: def?.attackCooldown ?? 1.5,
      armor: def?.armor ?? 0,
      buildProgress: 1, builder: null, buildTarget: null,
      trainingQueue: [],
      remainingGold: 0,
      waypoints: [],
      moveQueue: [],
      attackMoveTarget: null,
      rallyPoint: null,
      rallyTarget: null,
      previousState: null,
      previousGatherType: null,
      previousResourceTarget: null,
      previousMoveTarget: null,
      previousWaypoints: [],
      previousMoveQueue: [],
      previousAttackMoveTarget: null,
      aggroSuppressUntil: 0,
    }
    this.units.push(unit)
    this.createHealthBar(unit)
    return unit
  }

  private spawnBuilding(type: string, team: number, x: number, z: number): Unit {
    const mesh = createBuildingVisual(type, team)
    const def = BUILDINGS[type]
    const h = this.getWorldHeight(x, z)
    mesh.position.set(x + 0.5, h, z + 0.5)
    this.scene.add(mesh)
    this.outlineObjects.push(mesh)

    const unit: Unit = {
      mesh, type, team,
      hp: def?.hp ?? 500, maxHp: def?.hp ?? 500,
      speed: 0, moveTarget: null,
      isBuilding: true,
      state: UnitState.Idle,
      gatherType: null, carryAmount: 0, gatherTimer: 0,
      resourceTarget: null,
      attackTimer: 0, attackTarget: null,
      attackDamage: def?.attackDamage ?? 0, attackRange: def?.attackRange ?? 0, attackCooldown: def?.attackCooldown ?? 2, armor: def?.key === 'tower' ? 0 : 2,
      buildProgress: 1, builder: null, buildTarget: null,
      trainingQueue: [],
      remainingGold: type === 'goldmine' ? GOLDMINE_GOLD : 0,
      waypoints: [],
      moveQueue: [],
      attackMoveTarget: null,
      rallyPoint: null,
      rallyTarget: null,
      previousState: null,
      previousGatherType: null,
      previousResourceTarget: null,
      previousMoveTarget: null,
      previousWaypoints: [],
      previousMoveQueue: [],
      previousAttackMoveTarget: null,
      aggroSuppressUntil: 0,
    }
    this.units.push(unit)
    if (type !== 'goldmine') this.createHealthBar(unit)
    // 登记建筑占用
    this.markBuildingOccupancy(unit)
    return unit
  }

  // ==================== 辅助查找 ====================

  /** 标记建筑的 tile 占用 */
  private markBuildingOccupancy(unit: Unit) {
    const size = BUILDINGS[unit.type]?.size ?? 1
    const tx = Math.round(unit.mesh.position.x - 0.5)
    const tz = Math.round(unit.mesh.position.z - 0.5)
    for (let dx = 0; dx < Math.ceil(size); dx++) {
      for (let dz = 0; dz < Math.ceil(size); dz++) {
        this.occupancy.mark(tx + dx, tz + dz)
      }
    }
  }

  /** 释放建筑的 tile 占用 */
  private unmarkBuildingOccupancy(unit: Unit) {
    const size = BUILDINGS[unit.type]?.size ?? 1
    const tx = Math.round(unit.mesh.position.x - 0.5)
    const tz = Math.round(unit.mesh.position.z - 0.5)
    for (let dx = 0; dx < Math.ceil(size); dx++) {
      for (let dz = 0; dz < Math.ceil(size); dz++) {
        this.occupancy.unmark(tx + dx, tz + dz)
      }
    }
  }

  private findNearest(unit: Unit, type: string, team: number): Unit | null {
    let best: Unit | null = null
    let bestDist = Infinity
    for (const u of this.units) {
      if (u.type !== type) continue
      if (team >= 0 && u.team !== team) continue
      const d = unit.mesh.position.distanceTo(u.mesh.position)
      if (d < bestDist) { bestDist = d; best = u }
    }
    return best
  }

  private findNearestIdlePeasant(pos: THREE.Vector3): Unit | null {
    let best: Unit | null = null
    let bestDist = Infinity
    for (const u of this.units) {
      if (u.type !== 'worker' || u.team !== 0) continue
      if (u.hp <= 0) continue
      if (u.state !== UnitState.Idle) continue
      const d = pos.distanceTo(u.mesh.position)
      if (d < bestDist) { bestDist = d; best = u }
    }
    return best
  }

  /** 找离某位置最近的树木（通过 TreeManager 统一查询） */
  private findNearestTree(pos: THREE.Vector3): THREE.Object3D | null {
    const tree = this.treeManager.findNearest(pos)
    return tree ? tree.mesh : null
  }

  // ==================== Regression test hooks ====================

  /**
   * Browser-side asset pipeline contracts for Playwright.
   *
   * These hooks deliberately run inside the live built game bundle, not in the
   * Node test process, so they exercise the same AssetLoader cache and visual
   * factories that the runtime uses.
   */
  public __testRunAssetPipelineContracts() {
    const source = this.createAssetPipelineFixture(2.5)
    const cloneA = __testDeepCloneWithMaterials(source)
    const cloneB = __testDeepCloneWithMaterials(source)
    const sourceMesh = this.getFirstMesh(source)
    const meshA = this.getFirstMesh(cloneA)
    const meshB = this.getFirstMesh(cloneB)
    const sourceMaterials = this.asMaterialArray(sourceMesh.material)
    const materialsA = this.asMaterialArray(meshA.material)
    const materialsB = this.asMaterialArray(meshB.material)

    const materialArrayIsolated =
      Array.isArray(meshA.material) &&
      Array.isArray(meshB.material) &&
      meshA.material !== meshB.material &&
      meshA.material !== sourceMesh.material
    const materialObjectsIsolated = materialsA.every((mat, idx) =>
      mat !== sourceMaterials[idx] && mat !== materialsB[idx],
    )

    const cleanupTeamAsset = __testInjectFakeAsset('footman', this.createAssetPipelineFixture(2.5), 2.5, 0, 'unit')
    let teamBlue = 0
    let teamRed = 0
    let teamMaterialObjectsIsolated = false
    let factoryScale = 0
    let visualBlue: THREE.Group | null = null
    let visualRed: THREE.Group | null = null
    try {
      visualBlue = createUnitVisual('footman', 0)
      visualRed = createUnitVisual('footman', 1)
      factoryScale = visualBlue.scale.x
      const blueTeamMat = this.findNamedMaterial(visualBlue, 'team_color')
      const redTeamMat = this.findNamedMaterial(visualRed, 'team_color')
      teamBlue = blueTeamMat?.color.getHex() ?? 0
      teamRed = redTeamMat?.color.getHex() ?? 0
      teamMaterialObjectsIsolated = !!blueTeamMat && !!redTeamMat && blueTeamMat !== redTeamMat
    } finally {
      if (visualBlue) disposeObject3DDeep(visualBlue)
      if (visualRed) disposeObject3DDeep(visualRed)
      cleanupTeamAsset()
    }

    const refresh = this.__testRunRefreshScaleContract()

    disposeObject3DDeep(source)
    disposeObject3DDeep(cloneA)
    disposeObject3DDeep(cloneB)

    return {
      materialArrayIsolated,
      materialObjectsIsolated,
      sourceMaterialCount: sourceMaterials.length,
      cloneMaterialCount: materialsA.length,
      teamBlue,
      teamRed,
      teamMaterialObjectsIsolated,
      factoryScale,
      refresh,
    }
  }

  public __testCreateAssetVisualSummary(type: string, isBuilding: boolean, team = 0) {
    const visual = isBuilding ? createBuildingVisual(type, team) : createUnitVisual(type, team)
    const summary = this.summarizeObject3D(visual)
    disposeObject3DDeep(visual)
    return summary
  }

  private __testRunRefreshScaleContract() {
    if (this.units.some(u => u.type === 'footman' && !u.isBuilding)) {
      return { ok: false, reason: 'footman already exists; refresh contract requires isolated temporary footman' }
    }

    const unit = this.spawnUnit('footman', 0, 22, 22)
    const oldMesh = unit.mesh
    const oldMeshId = oldMesh.id
    const oldChildIds = new Set<number>()
    oldMesh.traverse(child => oldChildIds.add(child.id))
    oldMesh.scale.setScalar(0.2)

    const cleanupAsset = __testInjectFakeAsset('footman', this.createAssetPipelineFixture(2.5), 2.5, 0, 'unit')
    let result: {
      ok: boolean
      oldScale: number
      replacementScale: number
      scaleAfterDealDamage: number
      oldRootStillInScene: boolean
      sharedOldChildCount: number
      directChildCount: number
      renderableMeshCount: number
      flashHitError: string | null
      dealDamageError: string | null
      reason?: string
    }
    try {
      this.refreshVisualsAfterAssetLoad()
      const replacementScale = unit.mesh.scale.x
      const newChildIds: number[] = []
      unit.mesh.traverse(child => newChildIds.push(child.id))
      let flashHitError: string | null = null
      let dealDamageError: string | null = null
      try {
        this.feedback.flashHit(unit)
      } catch (err) {
        flashHitError = err instanceof Error ? err.message : String(err)
      }
      try {
        this.dealDamage(unit, unit)
      } catch (err) {
        dealDamageError = err instanceof Error ? err.message : String(err)
      }
      result = {
        ok: Math.abs(replacementScale - 2.5) < 0.001 && !this.scene.getObjectById(oldMeshId),
        oldScale: 0.2,
        replacementScale,
        scaleAfterDealDamage: unit.mesh.scale.x,
        oldRootStillInScene: !!this.scene.getObjectById(oldMeshId),
        sharedOldChildCount: newChildIds.filter(id => oldChildIds.has(id)).length,
        directChildCount: unit.mesh.children.length,
        renderableMeshCount: this.countRenderableMeshes(unit.mesh),
        flashHitError,
        dealDamageError,
      }
    } finally {
      cleanupAsset()
      this.removeTestUnit(unit)
    }
    return result
  }

  private createAssetPipelineFixture(scale: number): THREE.Group {
    const root = new THREE.Group()
    root.name = 'asset-pipeline-fixture-root'
    root.scale.setScalar(scale)

    const materialLessGroup = new THREE.Group()
    materialLessGroup.name = 'asset-pipeline-material-less-group'

    const baseMat = new THREE.MeshStandardMaterial({ color: 0x334455 })
    baseMat.name = 'base'
    const teamMat = new THREE.MeshStandardMaterial({ color: 0x111111 })
    teamMat.name = 'team_color'

    const mesh = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), [baseMat, teamMat])
    mesh.name = 'asset-pipeline-array-material-mesh'
    materialLessGroup.add(mesh)
    root.add(materialLessGroup)
    return root
  }

  private summarizeObject3D(root: THREE.Object3D) {
    root.updateWorldMatrix(true, true)
    const box = new THREE.Box3().setFromObject(root)
    const size = new THREE.Vector3()
    box.getSize(size)
    return {
      visibleMeshCount: this.countRenderableMeshes(root),
      bboxHeight: size.y,
      bboxWidth: size.x,
      bboxDepth: size.z,
      directChildCount: root.children.length,
      scale: { x: root.scale.x, y: root.scale.y, z: root.scale.z },
    }
  }

  private countRenderableMeshes(root: THREE.Object3D): number {
    let count = 0
    root.traverse(child => {
      if (child instanceof THREE.Mesh && child.visible !== false) count++
    })
    return count
  }

  private getFirstMesh(root: THREE.Object3D): THREE.Mesh {
    let mesh: THREE.Mesh | null = null
    root.traverse(child => {
      if (!mesh && child instanceof THREE.Mesh) mesh = child
    })
    if (!mesh) throw new Error('asset pipeline fixture has no mesh')
    return mesh
  }

  private asMaterialArray(material: THREE.Material | THREE.Material[]): THREE.Material[] {
    return Array.isArray(material) ? material : [material]
  }

  private findNamedMaterial(root: THREE.Object3D, name: string): THREE.MeshStandardMaterial | null {
    let found: THREE.MeshStandardMaterial | null = null
    root.traverse(child => {
      if (found || !(child instanceof THREE.Mesh) || !child.material) return
      const materials = this.asMaterialArray(child.material)
      for (const material of materials) {
        if (material.name === name && 'color' in material) {
          found = material as THREE.MeshStandardMaterial
          return
        }
      }
    })
    return found
  }

  private removeTestUnit(unit: Unit) {
    const idx = this.units.indexOf(unit)
    if (idx >= 0) this.units.splice(idx, 1)

    const oi = this.outlineObjects.indexOf(unit.mesh)
    if (oi >= 0) this.outlineObjects.splice(oi, 1)

    const bars = this.healthBars.get(unit)
    if (bars) {
      disposeObject3DDeep(bars.bg.parent!)
      this.healthBars.delete(unit)
    }

    this.scene.remove(unit.mesh)
    disposeObject3DDeep(unit.mesh)
  }

  // ==================== AI ====================

  private createAI() {
    const ctx: AIContext = {
      team: 1,
      units: this.units,
      resources: this.resources,
      placement: this.placementValidator,
      findNearestUnit: (unit, type, team) => this.findNearest(unit, type, team),
      findNearestGoldmine: (unit) => this.findNearestGoldmine(unit),
      findNearestTreeEntry: (pos, maxRange) => this.treeManager.findNearest(pos, maxRange ?? 30),
      spawnUnit: (type, team, x, z) => this.spawnUnit(type, team, x, z),
      spawnBuilding: (type, team, x, z) => this.spawnBuilding(type, team, x, z),
      getWorldHeight: (wx, wz) => this.getWorldHeight(wx, wz),
      planPath: (unit, target) => this.planPath(unit, target),
    }
    this.ai = new SimpleAI(ctx)
  }

  // ==================== 装饰物 ====================

  // Fallback 树共享几何体（glTF 加载后不会被创建）
  private static readonly TREE_CROWN1_GEO = new THREE.ConeGeometry(0.55, 1.1, 7)
  private static readonly TREE_CROWN2_GEO = new THREE.ConeGeometry(0.38, 0.85, 7)
  private static readonly TREE_CROWN3_GEO = new THREE.ConeGeometry(0.22, 0.65, 6)
  private static readonly TREE_TRUNK_GEO = new THREE.CylinderGeometry(0.06, 0.1, 0.7, 5)
  private static readonly TREE_CROWN1_MAT = new THREE.MeshLambertMaterial({ color: 0x1a3d10 })
  private static readonly TREE_CROWN2_MAT = new THREE.MeshLambertMaterial({ color: 0x224d15 })
  private static readonly TREE_CROWN3_MAT = new THREE.MeshLambertMaterial({ color: 0x1a3d10 })
  private static readonly TREE_TRUNK_MAT = new THREE.MeshLambertMaterial({ color: 0x3d2210 })

  /** 创建单棵树（glTF 优先，fallback 到程序几何体） */
  private createSingleTree(): THREE.Group {
    // 优先尝试 glTF
    const gltf = getLoadedModel('pine_tree')
    if (gltf) return gltf

    // Fallback: 三层针叶树
    const tree = new THREE.Group()
    tree.userData.isTree = true
    const c1 = new THREE.Mesh(Game.TREE_CROWN1_GEO, Game.TREE_CROWN1_MAT)
    c1.position.y = 0.8
    tree.add(c1)
    const c2 = new THREE.Mesh(Game.TREE_CROWN2_GEO, Game.TREE_CROWN2_MAT)
    c2.position.y = 1.5
    tree.add(c2)
    const c3 = new THREE.Mesh(Game.TREE_CROWN3_GEO, Game.TREE_CROWN3_MAT)
    c3.position.y = 2.1
    tree.add(c3)
    const trunk = new THREE.Mesh(Game.TREE_TRUNK_GEO, Game.TREE_TRUNK_MAT)
    trunk.position.y = 0.35
    tree.add(trunk)
    tree.traverse((c) => { if (c instanceof THREE.Mesh) c.castShadow = true })
    return tree
  }

  /**
   * 资产异步加载完成后，把场景中已有的 fallback 实例替换为 glTF 模型。
   * 保留位置/旋转/缩放/游戏语义，只替换 mesh 子树。
   */
  private refreshVisualsAfterAssetLoad() {
    // 替换单位和建筑
    for (const unit of this.units) {
      const newVisual = unit.isBuilding
        ? createBuildingVisual(unit.type, unit.team)
        : createUnitVisual(unit.type, unit.team)
      // 如果 factory 返回的还是 fallback（没有 glTF），跳过
      // 检测方式：新视觉没有 children 且不是 glTF 实例 → 实际上 factory 有 fallback 所以总有 children
      // 用 getAssetStatus 判断更可靠
      if (!unit.isBuilding && getAssetStatus(unit.type) !== 'loaded') continue
      if (unit.isBuilding && getAssetStatus(unit.type) !== 'loaded') continue

      // 保留旧位置/旋转，但不复制 fallback 的 scale
      // 新 glTF 的 scale 已由 AssetLoader 按 AssetCatalog 设置好，
      // 复制旧 fallback scale 会覆盖正确的资产缩放导致单位"变小/消失"
      const pos = unit.mesh.position.clone()
      const rot = unit.mesh.rotation.clone()

      // 从 outlineObjects 中移除旧 mesh
      const oi = this.outlineObjects.indexOf(unit.mesh)
      if (oi >= 0) this.outlineObjects.splice(oi, 1)

      // 从 scene 中移除旧 mesh（不 dispose children，由新 mesh 替代）
      this.scene.remove(unit.mesh)
      disposeObject3DDeep(unit.mesh)

      // 设置新 mesh
      unit.mesh = newVisual
      unit.mesh.position.copy(pos)
      unit.mesh.rotation.copy(rot)
      // scale：默认使用 glTF 自身 scale（来自 AssetCatalog），不复制 fallback
      // 仅对建造中的建筑保留 buildProgress 缩放语义
      if (unit.isBuilding && unit.buildProgress < 1) {
        const buildScale = 0.3 + 0.7 * unit.buildProgress
        unit.mesh.scale.setScalar(buildScale)
      }
      this.scene.add(unit.mesh)
      this.outlineObjects.push(unit.mesh)

      // 更新血条位置（下一帧 updateHealthBars 会处理）
      // 重建血条（因为旧血条引用了旧的 parent）
      const bars = this.healthBars.get(unit)
      if (bars) {
        disposeObject3DDeep(bars.bg.parent!)
        this.healthBars.delete(unit)
        this.createHealthBar(unit)
      }
    }

    // 替换树木
    this.refreshTreeVisuals()
  }

  /** 刷新所有树木视觉（如果 pine_tree glTF 已加载） */
  private refreshTreeVisuals() {
    if (getAssetStatus('pine_tree') !== 'loaded') return
    const trees = this.treeManager.entries
    for (const entry of trees) {
      const oldMesh = entry.mesh
      const pos = oldMesh.position.clone()
      const rot = oldMesh.rotation.clone()
      const scl = oldMesh.scale.clone()

      const newTree = this.createSingleTree()
      newTree.position.copy(pos)
      newTree.rotation.copy(rot)
      newTree.scale.copy(scl)

      this.scene.remove(oldMesh)
      disposeObject3DDeep(oldMesh)
      this.scene.add(newTree)
      entry.mesh = newTree
    }
  }

  private spawnTrees() {
    const rng = this.seededRandom(42)

    // ===== 玩家基地树环 =====
    // TH occupies (10-13, 12-15), goldmine occupies (15-17, 8-10)
    // 树林在金矿北侧（z<8）和基地西侧（x<5），形成自然的基地边界
    const baseTreePositions: [number, number][] = []
    // 金矿北侧/东侧：x=13-24, z=0-7（密集，形成北边界和伐木资源）
    for (let tx = 13; tx <= 24; tx++) {
      for (let tz = 0; tz <= 7; tz++) {
        if (rng() < 0.70) baseTreePositions.push([tx, tz])
      }
    }
    // 基地西侧：x=0-4, z=5-20（加密，覆盖兵营西侧）
    for (let tx = 0; tx <= 4; tx++) {
      for (let tz = 5; tz <= 20; tz++) {
        if (rng() < 0.58) baseTreePositions.push([tx, tz])
      }
    }
    // 基地北侧上方：x=5-12, z=0-7（更密，形成清晰的北/西北边界）
    for (let tx = 5; tx <= 12; tx++) {
      for (let tz = 0; tz <= 7; tz++) {
        if (rng() < 0.65) baseTreePositions.push([tx, tz])
      }
    }

    for (const [x, z] of baseTreePositions) {
      if (x < 0 || z < 0 || x >= this.terrain.width || z >= this.terrain.height) continue
      const tile = this.terrain.getTile(x, z)
      if (tile === TileType.Water || tile === TileType.Dirt || tile === TileType.LightDirt
        || tile === TileType.Stone || tile === TileType.DarkStone) continue
      const h = this.getWorldHeight(x, z)
      const scale = 0.6 + rng() * 0.5
      const tree = this.createSingleTree()
      tree.position.set(x + 0.5, h, z + 0.5)
      tree.scale.setScalar(scale)
      tree.rotation.y = rng() * Math.PI * 2
      this.scene.add(tree)
      this.treeManager.register(tree, x, z, TREE_LUMBER)
    }

    // ===== AI 基地树环 =====
    const aiBase = 50
    const aiTreePositions: [number, number][] = []
    for (let tx = aiBase - 10; tx <= aiBase - 6; tx++) {
      for (let tz = aiBase + 2; tz <= aiBase + 8; tz++) {
        if (rng() < 0.6) aiTreePositions.push([tx, tz])
      }
    }
    for (let tx = aiBase + 4; tx <= aiBase + 8; tx++) {
      for (let tz = aiBase - 2; tz <= aiBase + 8; tz++) {
        if (rng() < 0.5) aiTreePositions.push([tx, tz])
      }
    }
    for (const [x, z] of aiTreePositions) {
      if (x < 0 || z < 0 || x >= this.terrain.width || z >= this.terrain.height) continue
      const tile = this.terrain.getTile(x, z)
      if (tile === TileType.Water || tile === TileType.Dirt || tile === TileType.LightDirt
        || tile === TileType.Stone || tile === TileType.DarkStone) continue
      const h = this.getWorldHeight(x, z)
      const scale = 0.6 + rng() * 0.5
      const tree = this.createSingleTree()
      tree.position.set(x + 0.5, h, z + 0.5)
      tree.scale.setScalar(scale)
      tree.rotation.y = rng() * Math.PI * 2
      this.scene.add(tree)
      this.treeManager.register(tree, x, z, TREE_LUMBER)
    }

    // ===== 散布地图其余部分 =====
    for (let i = 0; i < 200; i++) {
      const x = Math.floor(rng() * this.terrain.width)
      const z = Math.floor(rng() * this.terrain.height)
      const tile = this.terrain.getTile(x, z)
      if (tile === TileType.Water || tile === TileType.Dirt || tile === TileType.LightDirt
        || tile === TileType.Stone || tile === TileType.DarkStone) continue
      const d1 = Math.sqrt((x - 12) ** 2 + (z - 13) ** 2)
      const d2 = Math.sqrt((x - 50) ** 2 + (z - 50) ** 2)
      if (d1 < 16 || d2 < 16) continue

      const h = this.getWorldHeight(x, z)
      const scale = 0.6 + rng() * 0.5
      const tree = this.createSingleTree()
      tree.position.set(x + 0.5, h, z + 0.5)
      tree.scale.setScalar(scale)
      tree.rotation.y = rng() * Math.PI * 2
      this.scene.add(tree)
      this.treeManager.register(tree, x, z, TREE_LUMBER)
    }
  }

  private seededRandom(seed: number) {
    let s = seed
    return () => { s = (s * 16807) % 2147483647; return s / 2147483647 }
  }

  // ==================== HUD ====================

  private updateHUD(dt: number) {
    // 时间
    const min = Math.floor(this.gameTime / 60).toString().padStart(2, '0')
    const sec = Math.floor(this.gameTime % 60).toString().padStart(2, '0')
    this.elTime.textContent = `${min}:${sec}`

    // 资源
    const res = this.resources.get(0)
    this.elGold.textContent = String(res.gold)
    this.elLumber.textContent = String(res.lumber)
    const supply = this.resources.computeSupply(0, this.units)
    this.elSupply.textContent = `${supply.used}/${supply.total}`

    // 摄像机
    const t = this.cameraCtrl.getTarget()
    this.elCameraPos.textContent = `${t.x.toFixed(1)}, ${t.z.toFixed(1)}`

    // 选中单位
    this.updateSelectionHUD()
    this.updateCommandCard()
    this.updateTrainQueueUI()

    // 编组召回反馈倒计时
    if (this.groupHintTimer > 0) {
      this.groupHintTimer -= dt
      if (this.groupHintTimer <= 0) {
        this.updateModeHint('')
      }
    }
  }

  // ===== Portrait 绘制 =====

  /** 在 portrait canvas 上绘制单位类型图标 */
  private drawPortrait(type: string, team: number) {
    const canvas = this.elPortraitCanvas
    const ctx = canvas.getContext('2d')!
    const w = canvas.width
    const h = canvas.height

    // 背景
    ctx.fillStyle = '#0c0a04'
    ctx.fillRect(0, 0, w, h)

    // 背景渐变氛围
    const grad = ctx.createRadialGradient(w / 2, h / 2, 5, w / 2, h / 2, 38)
    const teamColor = team === 0 ? '#2244aa' : '#aa2222'
    grad.addColorStop(0, teamColor + '40')
    grad.addColorStop(1, '#0c0a0400')
    ctx.fillStyle = grad
    ctx.fillRect(0, 0, w, h)

    ctx.save()
    ctx.translate(w / 2, h / 2)

    switch (type) {
      case 'worker': {
        // 农民：简笔人物 + 镐
        // 身体
        ctx.fillStyle = '#8b6914'
        ctx.fillRect(-6, -4, 12, 18)
        // 头
        ctx.fillStyle = '#ddc8a0'
        ctx.beginPath()
        ctx.arc(0, -12, 8, 0, Math.PI * 2)
        ctx.fill()
        // 帽子（团队色）
        ctx.fillStyle = team === 0 ? '#4488ff' : '#ff4444'
        ctx.fillRect(-7, -20, 14, 6)
        ctx.fillRect(-5, -22, 10, 4)
        // 镐
        ctx.strokeStyle = '#888'
        ctx.lineWidth = 2
        ctx.beginPath()
        ctx.moveTo(8, -8)
        ctx.lineTo(18, 10)
        ctx.stroke()
        ctx.fillStyle = '#777'
        ctx.fillRect(15, 6, 8, 3)
        break
      }
      case 'footman': {
        // 步兵：头盔 + 剑盾
        // 身体（灰色铠甲）
        ctx.fillStyle = '#787878'
        ctx.fillRect(-8, -2, 16, 20)
        // 肩甲
        ctx.fillStyle = '#888'
        ctx.fillRect(-14, -2, 7, 5)
        ctx.fillRect(7, -2, 7, 5)
        // 团队色战袍
        ctx.fillStyle = team === 0 ? '#4488ff' : '#ff4444'
        ctx.fillRect(-6, 2, 12, 10)
        // 头盔
        ctx.fillStyle = '#999'
        ctx.beginPath()
        ctx.arc(0, -10, 9, 0, Math.PI * 2)
        ctx.fill()
        // 鼻梁护
        ctx.fillStyle = '#888'
        ctx.fillRect(-1, -10, 2, 8)
        // 剑
        ctx.fillStyle = '#ccc'
        ctx.fillRect(12, -14, 3, 24)
        ctx.fillStyle = '#8b6914'
        ctx.fillRect(11, 8, 5, 4)
        // 盾
        ctx.fillStyle = team === 0 ? '#4488ff' : '#ff4444'
        ctx.fillRect(-18, 0, 5, 14)
        ctx.strokeStyle = '#666'
        ctx.lineWidth = 1
        ctx.strokeRect(-18, 0, 5, 14)
        break
      }
      case 'townhall': {
        // 城镇大厅：正面建筑 + 旗帜
        // 石基
        ctx.fillStyle = '#808070'
        ctx.fillRect(-20, 8, 40, 10)
        // 主墙
        ctx.fillStyle = '#a08050'
        ctx.fillRect(-18, -8, 36, 18)
        // 屋顶
        ctx.fillStyle = '#8b4513'
        ctx.beginPath()
        ctx.moveTo(-22, -8)
        ctx.lineTo(0, -24)
        ctx.lineTo(22, -8)
        ctx.closePath()
        ctx.fill()
        // 门
        ctx.fillStyle = '#5c3a1e'
        ctx.fillRect(-5, 2, 10, 14)
        // 窗户
        ctx.fillStyle = '#ddc880'
        ctx.fillRect(-14, -4, 5, 5)
        ctx.fillRect(9, -4, 5, 5)
        // 旗帜（团队色）
        ctx.fillStyle = team === 0 ? '#4488ff' : '#ff4444'
        ctx.fillRect(14, -24, 10, 7)
        ctx.strokeStyle = '#888'
        ctx.lineWidth = 1
        ctx.beginPath()
        ctx.moveTo(14, -26)
        ctx.lineTo(14, -14)
        ctx.stroke()
        break
      }
      case 'barracks': {
        // 兵营：军事建筑 + 旗帜 + 剑
        // 基座
        ctx.fillStyle = '#707060'
        ctx.fillRect(-16, 6, 32, 10)
        // 主墙
        ctx.fillStyle = '#604020'
        ctx.fillRect(-14, -6, 28, 14)
        // 屋顶
        ctx.fillStyle = '#5c3a1e'
        ctx.beginPath()
        ctx.moveTo(-18, -6)
        ctx.lineTo(0, -20)
        ctx.lineTo(18, -6)
        ctx.closePath()
        ctx.fill()
        // 门口
        ctx.fillStyle = '#1a1208'
        ctx.fillRect(-4, 0, 8, 10)
        // 剑装饰
        ctx.fillStyle = '#ccc'
        ctx.fillRect(8, -12, 2, 16)
        // 旗帜
        ctx.fillStyle = team === 0 ? '#4488ff' : '#ff4444'
        ctx.fillRect(-16, -22, 8, 5)
        ctx.strokeStyle = '#888'
        ctx.lineWidth = 1
        ctx.beginPath()
        ctx.moveTo(-16, -24)
        ctx.lineTo(-16, -12)
        ctx.stroke()
        break
      }
      case 'farm': {
        // 农场：简单小屋
        ctx.fillStyle = '#907050'
        ctx.fillRect(-12, 0, 24, 16)
        ctx.fillStyle = '#8b6914'
        ctx.beginPath()
        ctx.moveTo(-16, 0)
        ctx.lineTo(0, -14)
        ctx.lineTo(16, 0)
        ctx.closePath()
        ctx.fill()
        // 门
        ctx.fillStyle = '#5c3a1e'
        ctx.fillRect(-4, 6, 8, 10)
        break
      }
      case 'tower': {
        // 箭塔：高塔 + 城垛
        ctx.fillStyle = '#808070'
        ctx.fillRect(-8, -16, 16, 34)
        // 城垛顶部
        ctx.fillStyle = '#707060'
        ctx.fillRect(-11, -20, 22, 6)
        // 城垛齿
        ctx.fillRect(-11, -24, 5, 4)
        ctx.fillRect(-2, -24, 5, 4)
        ctx.fillRect(7, -24, 5, 4)
        // 尖顶
        ctx.fillStyle = '#555'
        ctx.beginPath()
        ctx.moveTo(-8, -20)
        ctx.lineTo(0, -30)
        ctx.lineTo(8, -20)
        ctx.closePath()
        ctx.fill()
        // 小旗
        ctx.fillStyle = team === 0 ? '#4488ff' : '#ff4444'
        ctx.fillRect(-1, -30, 8, 4)
        break
      }
      case 'goldmine': {
        // 金矿：岩壁 + 晶体
        ctx.fillStyle = '#6a6050'
        ctx.fillRect(-18, 2, 36, 16)
        // 凸起
        ctx.fillStyle = '#7a7060'
        ctx.fillRect(-14, -4, 12, 8)
        ctx.fillRect(6, -2, 10, 6)
        // 主晶体（金色）
        ctx.fillStyle = '#ffdd00'
        ctx.beginPath()
        ctx.moveTo(0, 2)
        ctx.lineTo(6, -12)
        ctx.lineTo(0, -20)
        ctx.lineTo(-6, -12)
        ctx.closePath()
        ctx.fill()
        // 小晶体
        ctx.fillStyle = '#ffcc00'
        ctx.beginPath()
        ctx.moveTo(10, 4)
        ctx.lineTo(14, -4)
        ctx.lineTo(10, -8)
        ctx.lineTo(6, -4)
        ctx.closePath()
        ctx.fill()
        ctx.beginPath()
        ctx.moveTo(-8, 6)
        ctx.lineTo(-4, -2)
        ctx.lineTo(-8, -6)
        ctx.lineTo(-12, -2)
        ctx.closePath()
        ctx.fill()
        // 金光晕
        const glow = ctx.createRadialGradient(0, -6, 2, 0, -6, 14)
        glow.addColorStop(0, 'rgba(255,200,0,0.3)')
        glow.addColorStop(1, 'rgba(255,200,0,0)')
        ctx.fillStyle = glow
        ctx.fillRect(-18, -20, 36, 36)
        break
      }
      default: {
        // 通用问号
        ctx.fillStyle = '#5a4e22'
        ctx.font = 'bold 32px Georgia'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText('?', 0, 0)
        break
      }
    }

    ctx.restore()

    // 外框内描边
    ctx.strokeStyle = '#6a5e2a'
    ctx.lineWidth = 1
    ctx.strokeRect(0.5, 0.5, w - 1, h - 1)
  }

  // ===== 多选摘要绘制 =====

  /** 在多选 breakdown 中绘制小型类型图标 */
  private drawMiniPortrait(canvas: HTMLCanvasElement, type: string, team: number) {
    const ctx = canvas.getContext('2d')!
    const w = canvas.width
    const h = canvas.height
    ctx.clearRect(0, 0, w, h)

    ctx.fillStyle = '#0c0a04'
    ctx.fillRect(0, 0, w, h)

    ctx.save()
    ctx.translate(w / 2, h / 2)

    const teamCol = team === 0 ? '#4488ff' : '#ff4444'

    switch (type) {
      case 'worker': {
        ctx.fillStyle = '#8b6914'
        ctx.fillRect(-3, -2, 6, 9)
        ctx.fillStyle = '#ddc8a0'
        ctx.beginPath()
        ctx.arc(0, -6, 4, 0, Math.PI * 2)
        ctx.fill()
        ctx.fillStyle = teamCol
        ctx.fillRect(-4, -10, 8, 3)
        break
      }
      case 'footman': {
        ctx.fillStyle = '#787878'
        ctx.fillRect(-4, -1, 8, 10)
        ctx.fillStyle = '#999'
        ctx.beginPath()
        ctx.arc(0, -5, 5, 0, Math.PI * 2)
        ctx.fill()
        ctx.fillStyle = teamCol
        ctx.fillRect(-3, 1, 6, 5)
        ctx.fillStyle = '#ccc'
        ctx.fillRect(6, -7, 2, 12)
        break
      }
      default: {
        ctx.fillStyle = '#5a4e22'
        ctx.font = 'bold 12px Georgia'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText('?', 0, 0)
        break
      }
    }

    ctx.restore()
  }

  private updateSelectionHUD() {
    const primaryType = this.selectionModel.primaryType
    const selKey = this.selectedUnits.length > 0
      ? `${this.selectedUnits.length}:${primaryType}:${this.selectedUnits.map(u => u.type).sort().join(',')}`
      : ''

    if (this.selectedUnits.length === 0) {
      // 无选择 → 隐藏所有，清空
      if (this._lastSelKey !== '') {
        this.elSingleSelect.style.display = ''
        this.elMultiSelect.style.display = 'none'
        this.elUnitName.textContent = '未选择单位'
        this.elUnitHpFill.style.width = '0%'
        this.elUnitHpText.textContent = ''
        this.elUnitState.textContent = ''
        this.elUnitStats.innerHTML = ''
        this.elTypeBadge.style.display = 'none'
        // 清空 portrait
        const ctx = this.elPortraitCanvas.getContext('2d')!
        ctx.fillStyle = '#0c0a04'
        ctx.fillRect(0, 0, 76, 76)
        this._lastSelKey = ''
      }
      return
    }

    // 多选 vs 单选
    if (this.selectedUnits.length > 1) {
      // 多选面板
      this.elSingleSelect.style.display = 'none'
      this.elMultiSelect.style.display = 'flex'

      // 数量
      this.elMultiCount.textContent = `${this.selectedUnits.length} 个单位`

      // 类型分组
      const typeCounts: Record<string, number> = {}
      for (const u of this.selectedUnits) {
        typeCounts[u.type] = (typeCounts[u.type] ?? 0) + 1
      }

      // HP 汇总
      let totalHp = 0
      let totalMaxHp = 0
      for (const u of this.selectedUnits) {
        totalHp += u.hp
        totalMaxHp += u.maxHp
      }

      // 只有类型变化时才重建 breakdown（防抖）
      const primaryType = this.selectionModel.primaryType
      if (selKey !== this._lastSelKey) {
        this.elMultiBreakdown.innerHTML = ''
        const names: Record<string, string> = {
          worker: '农民', footman: '步兵',
        }
        for (const [type, count] of Object.entries(typeCounts).sort()) {
          const row = document.createElement('div')
          row.className = type === primaryType ? 'breakdown-row breakdown-primary' : 'breakdown-row'
          const miniCanvas = document.createElement('canvas')
          miniCanvas.className = 'breakdown-icon'
          miniCanvas.width = 18
          miniCanvas.height = 18
          this.drawMiniPortrait(miniCanvas, type, 0)
          row.appendChild(miniCanvas)
          const label = document.createElement('span')
          label.textContent = `${names[type] ?? type} x${count}`
          row.appendChild(label)
          this.elMultiBreakdown.appendChild(row)
        }
      }

      // HP 条（每帧更新）
      const hpPct = totalMaxHp > 0 ? (totalHp / totalMaxHp) * 100 : 0
      this.elMultiHpFill.style.width = `${hpPct}%`
      this.elMultiHpFill.style.background = hpPct > 50 ? '#0c0' : hpPct > 25 ? '#cc0' : '#c00'
      this.elMultiHpText.textContent = `${totalHp} / ${totalMaxHp}`

      this._lastSelKey = selKey
      return
    }

    // === 单选 ===
    const u = this.selectionModel.primary!
    // 构建缓存键：量化所有可能变化的值，防止无意义 churn
    const bpKey = u.buildProgress < 1 ? Math.floor(u.buildProgress * 100) : 100
    const goldKey = u.type === 'goldmine' ? Math.floor(u.remainingGold / 10) : 0
    const queueLen = u.trainingQueue.length
    // 训练进度量化到 1%（每秒约 1 次更新，不是每帧）
    const trainProgressKey = queueLen > 0 ? Math.floor(u.trainingQueue[0].remaining * 10) : 0
    const rallyKey = u.rallyPoint ? 'r' : 'n'
    const hpKey = `${u.hp}:${u.maxHp}`
    const moveQueueKey = u.moveQueue.length
    const selKeyFull = `${u.type}:${u.team}:${bpKey}:${goldKey}:${queueLen}:${trainProgressKey}:${rallyKey}:${hpKey}:${u.state}:${moveQueueKey}`

    if (selKeyFull === this._lastSelKey) return
    this._lastSelKey = selKeyFull

    this.elSingleSelect.style.display = ''
    this.elMultiSelect.style.display = 'none'

    const names: Record<string, string> = {
      worker: '农民', footman: '步兵', townhall: '城镇大厅',
      barracks: '兵营', farm: '农场', tower: '箭塔', goldmine: '金矿',
    }
    const stateNames = ['空闲', '移动', '前往采集', '采集中', '运送资源', '前往建造', '建造中', '攻击中', '攻击移动', '驻守']

    // Portrait
    this.drawPortrait(u.type, u.team)

    // 名称
    this.elUnitName.textContent = names[u.type] ?? u.type

    // HP 条 + 数值
    const pct = u.maxHp > 0 ? (u.hp / u.maxHp) * 100 : 0
    this.elUnitHpFill.style.width = `${pct}%`
    this.elUnitHpFill.style.background = pct > 50 ? '#0c0' : pct > 25 ? '#cc0' : '#c00'
    this.elUnitHpText.textContent = `${Math.max(0, u.hp)} / ${u.maxHp}`

    // 状态
    const stateText = u.isBuilding
      ? (u.buildProgress < 1 ? `建造中 ${Math.floor(u.buildProgress * 100)}%` : '就绪')
      : (stateNames[u.state] ?? '')
    const queueText = !u.isBuilding && u.moveQueue.length > 0
      ? ` (队列: ${u.moveQueue.length})`
      : ''
    this.elUnitState.textContent = stateText + queueText

    // 类型标签
    const badges: Record<string, string> = {
      worker: '采集', footman: '近战', townhall: '主基地',
      barracks: '军事', farm: '人口', tower: '防御', goldmine: '资源',
    }
    this.elTypeBadge.textContent = badges[u.type] ?? ''
    this.elTypeBadge.style.display = 'block'

    // 属性行
    const def = UNITS[u.type]
    const bDef = BUILDINGS[u.type]
    if (u.type === 'worker') {
      this.elUnitStats.innerHTML =
        `<span class="stat">⚔ ${def?.attackDamage ?? 5}</span>` +
        `<span class="stat">🛡 ${def?.armor ?? 0}</span>` +
        `<span class="stat">💨 ${(def?.speed ?? 3.5).toFixed(1)}</span>`
    } else if (u.type === 'footman') {
      this.elUnitStats.innerHTML =
        `<span class="stat">⚔ ${def?.attackDamage ?? 13}</span>` +
        `<span class="stat">🛡 ${def?.armor ?? 2}</span>` +
        `<span class="stat">💨 ${(def?.speed ?? 3).toFixed(1)}</span>`
    } else if (u.isBuilding && u.type !== 'goldmine') {
      let statsHtml = ''
      const supplyVal = bDef?.supply ?? 0
      if (supplyVal > 0) statsHtml += `<span class="stat">人口 +${supplyVal}</span>`
      if (bDef?.trains) statsHtml += `<span class="stat">可训练</span>`
      if (u.rallyPoint) {
        const rt = u.rallyTarget
        if (rt && rt.type === 'goldmine') {
          statsHtml += `<span class="stat">集结 → 金矿</span>`
        } else {
          statsHtml += `<span class="stat">集结 ✓</span>`
        }
      }
      // 训练队列信息
      if (u.trainingQueue.length > 0) {
        const first = u.trainingQueue[0]
        const tDef = UNITS[first.type]
        if (tDef) {
          const progress = Math.floor(((tDef.trainTime - first.remaining) / tDef.trainTime) * 100)
          statsHtml += `<span class="stat">训练 ${tDef.name} ${progress}%</span>`
        }
        if (u.trainingQueue.length > 1) {
          statsHtml += `<span class="stat">队列 ${u.trainingQueue.length}</span>`
        }
      }
      // Weapon stats for combat buildings (e.g., tower)
      if (bDef?.attackDamage) {
        statsHtml += `<span class="stat">⚔ ${bDef.attackDamage}</span>`
        if (bDef.attackRange) statsHtml += `<span class="stat">射程 ${bDef.attackRange}</span>`
        if (bDef.attackCooldown) statsHtml += `<span class="stat">冷却 ${bDef.attackCooldown}s</span>`
      }
      this.elUnitStats.innerHTML = statsHtml
    } else if (u.type === 'goldmine') {
      this.elUnitStats.innerHTML = `<span class="stat">黄金 ${u.remainingGold}</span>`
    } else {
      this.elUnitStats.innerHTML = ''
    }
  }

  // ==================== 命令卡 ====================

  private updateCommandCard() {
    // 关键：只在选择变化时重建，否则按钮每帧被销毁导致无法点击
    // 量化 buildProgress 到 1% 避免 float 抖动
    const primary = this.selectionModel.primary
    const bpKey = primary && primary.buildProgress < 1
      ? Math.floor(primary.buildProgress * 100)
      : (primary ? 100 : -1)
    const res = this.resources.get(0)
    const supply = this.resources.computeSupply(0, this.units)
    const queuedSupply = this.getQueuedSupply(0)
    const primaryQueueKey = primary ? primary.trainingQueue.map(item => `${item.type}:${Math.ceil(item.remaining * 10)}`).join('|') : ''
    const selKey = primary
      ? `${primary.type}:${primary.team}:${bpKey}:${res.gold}:${res.lumber}:${supply.used}:${supply.total}:${queuedSupply}:${primaryQueueKey}`
      : ''
    if (selKey === this._lastCmdKey) return
    this._lastCmdKey = selKey

    this.elCommandCard.innerHTML = ''

    if (this.selectedUnits.length === 0 || !primary || primary.team !== 0) {
      // 显示8个空插槽
      for (let i = 0; i < 8; i++) {
        const slot = document.createElement('div')
        slot.className = 'cmd-slot'
        this.elCommandCard.appendChild(slot)
      }
      return
    }

    // 收集要显示的按钮
    const buttons: { label: string; cost: string; onClick: () => void; hotkey?: string; enabled?: boolean; disabledReason?: string }[] = []

    // 农民：显示可建造的建筑
    if (primary.type === 'worker') {
      for (const bKey of PEASANT_BUILD_MENU) {
        const def = BUILDINGS[bKey]
        if (!def) continue
        const capturedKey = bKey
        const availability = this.getBuildAvailability(capturedKey, 0)
        buttons.push({
          label: def.name,
          cost: `${def.cost.gold}g ${def.cost.lumber}w`,
          enabled: availability.ok,
          disabledReason: availability.reason,
          onClick: () => {
            if (this.getBuildAvailability(capturedKey, 0).ok) {
              this.enterPlacementMode(capturedKey)
            }
          },
        })
      }
    }

    // 未完成建筑：显示取消建造
    if (primary.isBuilding && primary.buildProgress < 1) {
      const def = BUILDINGS[primary.type]
      const refundGold = Math.floor((def?.cost.gold ?? 0) * CONSTRUCTION_CANCEL_REFUND_RATE)
      const refundLumber = Math.floor((def?.cost.lumber ?? 0) * CONSTRUCTION_CANCEL_REFUND_RATE)
      buttons.push({
        label: '取消',
        cost: `返还 ${refundGold}g ${refundLumber}w`,
        onClick: () => { this.cancelConstruction(primary) },
        hotkey: 'C',
      })
    }

    // 可移动军事单位：显示 停止 / 驻守 / 攻击移动
    if (!primary.isBuilding && primary.type !== 'worker') {
      buttons.push({
        label: '停止', cost: '—',
        onClick: () => {
          const sel = this.selectedUnits.filter((u) => u.team === 0 && !u.isBuilding)
          dispatchGameCommand(sel, { type: 'stop' })
          this.suppressAggroFor(sel)
        },
        hotkey: 'S',
      })
      buttons.push({
        label: '驻守', cost: '—',
        onClick: () => {
          dispatchGameCommand(this.selectedUnits.filter((u) => u.team === 0 && !u.isBuilding), { type: 'holdPosition' })
        },
        hotkey: 'H',
      })
      buttons.push({
        label: '攻击移动', cost: '—',
        onClick: () => { this.enterAttackMoveMode() },
        hotkey: 'A',
      })
    }

    // 城镇大厅/兵营：显示可训练的单位（支持多建筑选择 alpha）
    const buildingDef = BUILDINGS[primary.type]
    if (buildingDef?.trains && primary.buildProgress >= 1) {
      // 收集所有同类型可训练建筑
      const sameTypeBuildings = this.selectedUnits.filter(
        u => u.team === 0 && u.isBuilding && u.type === primary.type && u.buildProgress >= 1,
      )
      for (const uKey of buildingDef.trains) {
        const uDef = UNITS[uKey]
        if (!uDef) continue
        const capturedUKey = uKey
        const availability = this.getTrainAvailability(capturedUKey, 0)
        buttons.push({
          label: uDef.name,
          cost: `${uDef.cost.gold}g`,
          enabled: availability.ok,
          disabledReason: availability.reason,
          onClick: () => {
            // 多建筑训练：依次为每个建筑排队（直到资源不足）
            for (const b of sameTypeBuildings) {
              this.trainUnit(b, capturedUKey)
            }
          },
        })
      }
      // 集结点按钮（应用到所有同类建筑）
      buttons.push({
        label: '集结点', cost: '—',
        onClick: () => { this.enterRallyMode(primary) },
        hotkey: 'Y',
      })
    }

    // 先渲染已填充的按钮（最多8个）
    for (let i = 0; i < Math.min(buttons.length, 8); i++) {
      const b = buttons[i]
      this.addCommandButton(b.label, b.cost, b.onClick, b.hotkey, b.enabled ?? true, b.disabledReason ?? '')
    }
    // 剩余位置用空插槽补齐
    for (let i = buttons.length; i < 8; i++) {
      const slot = document.createElement('div')
      slot.className = 'cmd-slot'
      this.elCommandCard.appendChild(slot)
    }
  }

  private addCommandButton(label: string, cost: string, onClick: () => void, hotkey?: string, enabled = true, disabledReason = '') {
    const btn = document.createElement('button')
    if (!enabled) {
      btn.disabled = true
      btn.dataset.disabledReason = disabledReason
      btn.title = disabledReason
      btn.classList.add('cmd-disabled')
    }
    btn.innerHTML =
      (hotkey ? `<span class="btn-hotkey">${hotkey}</span>` : '') +
      `<span class="btn-label">${label}</span>` +
      `<span class="btn-cost">${cost}</span>` +
      (disabledReason ? `<span class="btn-reason">${disabledReason}</span>` : '')
    btn.addEventListener('click', onClick)
    this.elCommandCard.appendChild(btn)
  }

  // ==================== 训练 ====================

  private getQueuedSupply(team: number): number {
    let queuedSupply = 0
    for (const u of this.units) {
      if (u.team !== team || !u.isBuilding) continue
      for (const item of u.trainingQueue) {
        queuedSupply += UNITS[item.type]?.supply ?? 0
      }
    }
    return queuedSupply
  }

  private getCostBlockReason(team: number, cost: { gold: number; lumber: number }): string {
    const res = this.resources.get(team)
    const reasons: string[] = []
    if (res.gold < cost.gold) reasons.push('黄金不足')
    if (res.lumber < cost.lumber) reasons.push('木材不足')
    return reasons.join(' / ')
  }

  private getBuildAvailability(buildingType: string, team: number): { ok: boolean; reason: string } {
    const def = BUILDINGS[buildingType]
    if (!def) return { ok: false, reason: '不可用' }
    const reason = this.getCostBlockReason(team, def.cost)
    return reason ? { ok: false, reason } : { ok: true, reason: '' }
  }

  private getTrainAvailability(unitType: string, team: number): { ok: boolean; reason: string } {
    const def = UNITS[unitType]
    if (!def) return { ok: false, reason: '不可用' }
    const resourceReason = this.getCostBlockReason(team, def.cost)
    if (resourceReason) return { ok: false, reason: resourceReason }

    const supply = this.resources.computeSupply(team, this.units)
    const queuedSupply = this.getQueuedSupply(team)
    if (supply.used + queuedSupply + def.supply > supply.total) {
      return { ok: false, reason: '人口不足' }
    }
    return { ok: true, reason: '' }
  }

  private trainUnit(building: Unit, unitType: string) {
    const def = UNITS[unitType]
    if (!def) return
    if (!this.resources.canAfford(0, def.cost)) return

    // 检查人口上限（含训练队列中的单位，防止超额训练）
    const supply = this.resources.computeSupply(0, this.units)
    const queuedSupply = this.getQueuedSupply(0)
    if (supply.used + queuedSupply + def.supply > supply.total) return

    this.resources.spend(0, def.cost)
    dispatchGameCommand([], { type: 'train', building, unitType, trainTime: def.trainTime })
  }

  private updateTrainQueueUI() {
    this.elTrainQueue.innerHTML = ''
    // 显示所有有训练队列的玩家建筑
    for (const unit of this.units) {
      if (unit.team !== 0 || !unit.isBuilding || unit.trainingQueue.length === 0) continue
      for (const item of unit.trainingQueue) {
        const def = UNITS[item.type]
        if (!def) continue
        const total = def.trainTime
        const pct = ((total - item.remaining) / total) * 100
        const div = document.createElement('div')
        div.className = 'train-item'
        div.innerHTML = `${def.name} <div class="train-bar"><div class="train-fill" style="width:${pct}%"></div></div>`
        this.elTrainQueue.appendChild(div)
      }
    }
  }

  // ==================== 地块信息 ====================

  private updateTileInfo() {
    if (this.placement.mode) return
    this.raycaster.setFromCamera(this.mouseNDC, this.camera)
    const hits = this.raycaster.intersectObject(this.terrain.groundPlane)
    if (hits.length > 0) {
      const p = hits[0].point
      const info = this.mapRuntime.getTileInfo(p.x, p.z)
      this.elTileInfo.textContent = `地块 (${info.tx}, ${info.tz}) ${info.name}`
    }
  }

  // ==================== 小地图 ====================

  updateMinimap() {
    const canvas = document.getElementById('minimap-canvas') as HTMLCanvasElement
    if (!canvas) return
    const ctx = canvas.getContext('2d')!
    const w = canvas.width
    const h = canvas.height
    const sx = w / this.mapRuntime.width
    const sz = h / this.mapRuntime.height

    ctx.fillStyle = '#111'
    ctx.fillRect(0, 0, w, h)

    // 使用 MapRuntime 统一渲染小地图底图
    const imageData = ctx.createImageData(w, h)
    this.mapRuntime.renderMinimap(imageData.data, w, h)
    ctx.putImageData(imageData, 0, 0)

    // 单位标记
    for (const unit of this.units) {
      ctx.fillStyle = unit.team === 0 ? '#4488ff' : unit.team === 1 ? '#ff4444' : '#ffd700'
      const px = unit.mesh.position.x * sx
      const pz = unit.mesh.position.z * sz
      const size = unit.isBuilding ? 3 : 2
      ctx.fillRect(px - size / 2, pz - size / 2, size, size)
    }
    const target = this.cameraCtrl.getTarget()
    const vs = this.cameraCtrl.getZoom()
    ctx.strokeStyle = '#fff'
    ctx.lineWidth = 1
    ctx.strokeRect((target.x - vs) * sx, (target.z - vs) * sz, vs * 2 * sx, vs * 2 * sz)
  }

  /** 小地图点击/拖拽 → 移动摄像机目标 */
  private handleMinimapClick(e: MouseEvent) {
    const canvas = document.getElementById('minimap-canvas') as HTMLCanvasElement
    if (!canvas) return
    const rect = canvas.getBoundingClientRect()
    const cx = e.clientX - rect.left
    const cy = e.clientY - rect.top
    // 小地图坐标 → 地图世界坐标
    const wx = (cx / canvas.width) * this.mapRuntime.width
    const wz = (cy / canvas.height) * this.mapRuntime.height
    this.cameraCtrl.setTarget(wx, wz)
  }

  // ==================== 窗口缩放 ====================

  private onResize() {
    this.renderer.setSize(window.innerWidth, window.innerHeight)
    this.composer.setSize(window.innerWidth, window.innerHeight)
    this.outlinePass.resolution.set(window.innerWidth, window.innerHeight)
    this.cameraCtrl.update(0)
  }

  // ==================== 高度查询 ====================

  /** 统一高度查询 */
  private getWorldHeight(wx: number, wz: number): number {
    return this.mapRuntime.getHeight(wx, wz)
  }

  // ==================== W3X 地图加载 ====================

  /**
   * 加载解析后的 W3X 地图数据
   * 替换当前程序化地形为真实war3地图
   */
  loadMap(mapData: ParsedMap) {
    this.phase.set(Phase.LoadingMap)

    // ===== 1. 清理旧 W3X 渲染器（如果有）=====
    if (this.w3xRenderer) {
      disposeObject3DDeep(this.w3xRenderer.group)
      this.w3xRenderer = null
    }

    // ===== 2. 清理旧单位（含血条 GPU 资源）=====
    this.disposeAllUnits()

    // ===== 3. 清理旧树木（通过 TreeManager 统一释放） =====
    this.treeManager.disposeAll()

    // ===== 4. 移除旧程序化地形 =====
    this.scene.remove(this.terrain.mesh)
    this.scene.remove(this.terrain.groundPlane)

    // ===== 5. 统一到 MapRuntime =====
    this.mapRuntime.loadW3X(mapData.terrain)

    // ===== 5.5 重置占用网格与导航查询 =====
    const mapW = mapData.terrain.width
    const mapH = mapData.terrain.height
    this.occupancy.resize(mapW, mapH)
    this.placementValidator.updateReferences(this.occupancy, this.mapRuntime)
    this.pathingGrid.updateReferences(this.mapRuntime, this.occupancy)
    this.treeManager.resize(mapW, mapH)

    // ===== 6. 创建新 W3X 渲染器 =====
    this.w3xRenderer = new W3XTerrainRenderer()
    this.w3xRenderer.renderFromW3X(mapData)
    this.scene.add(this.w3xRenderer.group)

    // 替换地面检测平面
    if (this.w3xRenderer.groundPlane) {
      this.terrain.groundPlane = this.w3xRenderer.groundPlane
    }

    // ===== 7. 更新摄像机范围 =====
    const [mw, mh] = this.w3xRenderer.getMapSize()
    this.cameraCtrl.updateMapBounds(mw, mh)

    // ===== 8. 生成新实体 =====
    // 重置阵营资源
    this.resources.reset()
    this.resources.init(0, 500, 200)
    this.resources.init(1, 500, 200)
    this.spawnMapEntities(mapData)
    this.focusCameraOnPrimaryPlayerBase(mapData)
    this.createAI()

    this.phase.set(Phase.Playing)
  }

  /** 完整清理所有单位（模型 + 血条 + GPU 资源）*/
  private disposeAllUnits() {
    for (const unit of this.units) {
      // 清理血条
      const bars = this.healthBars.get(unit)
      if (bars) {
        disposeObject3DDeep(bars.bg.parent!)
        this.healthBars.delete(unit)
      }
      // 清理单位模型
      disposeObject3DDeep(unit.mesh)
    }
    this.units = []
    this.outlineObjects = []
    this.selectionModel.clear()
    this.sel.clearSelectionRings()
    this._lastCmdKey = ''
    this._lastSelKey = ''
  }

  /**
   * 根据 W3X 地图数据生成游戏实体
   */
  private spawnMapEntities(mapData: ParsedMap) {
    const terrain = mapData.terrain
    const w = terrain.width
    const h = terrain.height

    // 收集玩家出生点（tile 坐标），用于树木避让
    const spawnPoints: [number, number][] = []
    if (mapData.info) {
      for (const player of mapData.info.players) {
        spawnPoints.push([player.startX / 128, player.startY / 128])
      }
    }

    // 生成装饰树木（避开水、边界和出生点）
    this.spawnTreesOnTerrain(terrain, spawnPoints)

    if (!mapData.info) return

    // 按出生点放置建筑和单位
    for (const player of mapData.info.players) {
      // war3 世界坐标 → tile 坐标
      const px = Math.round(player.startX / 128)
      const pz = Math.round(player.startY / 128)
      const team = player.id

      // 以出生点为 Town Hall 中心，套用与默认开局一致的 WC3-like 空间语法：
      // TH(4x4) 为基地核心，金矿在 NE，兵营在 SW，worker 在 TH 南侧一字排开。
      const townhallX = px - 2
      const townhallZ = pz - 2

      // 主基地
      this.spawnBuilding('townhall', team, townhallX, townhallZ)

      // 金矿：NE，保持与默认开局相同的 3-4 tile 级别短路径语法
      this.spawnBuilding('goldmine', -1, townhallX + 5, townhallZ - 4)

      // 兵营：SW 出口，形成军事区/出兵方向
      this.spawnBuilding('barracks', team, townhallX - 5, townhallZ + 5)

      // 5个农民：在 TH 南侧一字排开，避免出生在 blocker 内
      for (let i = 0; i < 5; i++) {
        this.spawnUnit('worker', team, townhallX + i, townhallZ - 1)
      }
    }
  }

  /**
   * W3X 地图加载会先按地图尺寸重置相机边界。实体生成后必须再把镜头拉回
   * 玩家 0 基地，否则默认视图会停在地图中心，玩家看到的是空地和零散树木。
   */
  private focusCameraOnPrimaryPlayerBase(mapData: ParsedMap) {
    const player = mapData.info?.players.find((p) => p.id === 0) ?? mapData.info?.players[0]
    if (!player) return

    const px = Math.round(player.startX / 128)
    const pz = Math.round(player.startY / 128)

    this.cameraCtrl.distance = 24
    this.cameraCtrl.setTarget(px + 1, pz)
  }

  /** 出生点树木避让半径（tile 单位） */
  private static readonly SPAWN_AVOID_RADIUS = 10

  /**
   * 在 W3X 地形上生成树木（避开水面、边界和出生点）
   */
  private spawnTreesOnTerrain(terrain: W3ETerrain, spawnPoints: [number, number][]) {
    const w = terrain.width
    const h = terrain.height
    const rng = this.seededRandom(42)
    const avoidR = Game.SPAWN_AVOID_RADIUS

    for (let i = 0; i < 400; i++) {
      const x = Math.floor(rng() * w)
      const z = Math.floor(rng() * h)
      const dataIdx = z * w + x

      // 跳过水面、边界
      if ((terrain.flags[dataIdx] & 0x04) !== 0) continue
      if ((terrain.flags[dataIdx] & 0x40) !== 0) continue

      // 跳过出生点附近（避免挡住农民路径和建筑放置）
      let tooClose = false
      for (const [sx, sz] of spawnPoints) {
        if (Math.sqrt((x - sx) ** 2 + (z - sz) ** 2) < avoidR) {
          tooClose = true
          break
        }
      }
      if (tooClose) continue

      // 高度
      const groundH = terrain.groundHeight[dataIdx] * 3.0  // 匹配 renderer 的 heightScale

      const scale = 0.6 + rng() * 0.5
      const tree = this.createSingleTree()
      tree.position.set(x + 0.5, groundH, z + 0.5)
      tree.scale.setScalar(scale)
      tree.rotation.y = rng() * Math.PI * 2
      this.scene.add(tree)
      this.treeManager.register(tree, x, z, TREE_LUMBER)
    }
  }

  // ==================== 截图 ====================

  private screenshotIndex = 0

  private captureScreenshot() {
    this.renderer.render(this.scene, this.camera)
    const name = `screenshot-${this.screenshotIndex++}.png`

    const canvas = this.renderer.domElement
    canvas.toBlob(async (blob) => {
      if (!blob) return
      // 优先保存到本地 screenshot server
      try {
        const resp = await fetch(
          `http://localhost:3456/screenshot?name=${encodeURIComponent(name)}`,
          { method: 'POST', body: blob },
        )
        if (resp.ok) {
          console.log(`Screenshot saved: screenshots/${name}`)
          return
        }
      } catch (_err) {
        // server not running — fallback below
      }
      // Fallback: 浏览器下载
      const dataUrl = canvas.toDataURL('image/png')
      const link = document.createElement('a')
      link.download = name
      link.href = dataUrl
      link.click()
    }, 'image/png')
  }
}
