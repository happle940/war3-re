import * as THREE from 'three'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js'
import { OutlinePass } from 'three/examples/jsm/postprocessing/OutlinePass.js'
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js'
import { CameraController } from './CameraController'
import {
  loadAllAssets,
  getAssetStatus,
  getAssetAnimationClipNames,
  __testDeepCloneWithMaterials,
  __testInjectFakeAsset,
} from './AssetLoader'
import { createUnitVisual } from './UnitVisualFactory'
import { createBuildingVisual } from './BuildingVisualFactory'
import { createTreeVisual } from './TreeVisualFactory'
import { createItemVisual } from './ItemVisualFactory'
import { getAllAssetEntries } from './AssetCatalog'
import { Terrain, TileType } from '../map/Terrain'
import { W3XTerrainRenderer } from '../map/W3XTerrainRenderer'
import { MapRuntime } from '../map/MapRuntime'
import type { ParsedMap, W3ETerrain } from '../map/W3XParser'
import { disposeObject3DDeep } from '../utils/dispose'
import {
  UnitState, BUILDINGS, UNITS, RESEARCHES,
  TREE_LUMBER, GOLDMINE_GOLD,
  MELEE_RANGE, AGGRO_RANGE,
  AttackType,
  ABILITIES,
  HERO_ABILITY_LEVELS,
  HERO_XP_RULES,
  HERO_INVENTORY_MAX_ITEMS,
  ITEMS,
  SHOP_PURCHASE_RANGE,
  WATER_ELEMENTAL_SUMMON_LEVELS,
} from './GameData'
import type { BuildingDef, HeroAbilityLevelDef, ItemKey } from './GameData'
import { TeamResources } from './TeamResources'
import { GamePhase, Phase } from './GamePhase'
import { issueCommand as dispatchGameCommand } from './GameCommand'
import { SelectionModel } from './SelectionModel'
import { ControlGroupManager } from './ControlGroupManager'
import { SelectionController } from './SelectionController'
import { SimpleAI } from './SimpleAI'
import type { AIContext } from './AIContext'
import { OccupancyGrid, PlacementValidator } from './OccupancyGrid'
import { PlacementController } from './PlacementController'
import { FeedbackEffects } from './FeedbackEffects'
import { PathingGrid } from './PathingGrid'
import { TreeManager } from './TreeManager'
import type { TreeEntry } from './TreeManager'
import type { QueuedCommand, ResourceTarget, Unit } from './UnitTypes'
import { CommandCardPresenter } from './ui/CommandCardPresenter'
import type { CommandCardButtonSpec } from './ui/CommandCardPresenter'
import { buildCommandCardStateKey } from './ui/CommandCardStateKey'
import { buildBuildingCommandButtons } from './ui/BuildingCommandButtonBuilders'
import {
  buildArchmageCommandButtons,
  buildMountainKingCommandButtons,
  buildPaladinCommandButtons,
} from './ui/HeroCommandButtonBuilders'
import {
  buildBasicUnitCommandButtons,
  buildConstructionCommandButtons,
  buildWorkerCommandButtons,
} from './ui/UnitCommandButtonBuilders'
import { buildHeroInventoryCommandButtons } from './ui/InventoryCommandButtonBuilders'
import {
  buildMultiSelectionHudKey,
  buildSingleSelectionHudKey,
  SelectionHudPresenter,
} from './ui/SelectionHudPresenter'
import { drawMiniPortrait, drawPortrait } from './ui/PortraitDrawers'
import { HealthBarRenderer } from './ui/HealthBarRenderer'
import { MapObjectiveBeaconPresenter } from './ui/MapObjectiveBeaconPresenter'
import { MinimapPresenter } from './ui/MinimapPresenter'
import { ModeHintPresenter } from './ui/ModeHintPresenter'
import { TrainingQueuePresenter } from './ui/TrainingQueuePresenter'
import { buildTrainingQueueItems } from './ui/TrainingQueueViewModel'
import {
  asMaterialArray,
  countRenderableMeshes,
  createAssetPipelineFixture,
  findNamedMaterial,
  getFirstMesh,
  summarizeObject3D,
} from './testing/AssetPipelineTestUtils'
import {
  chooseGoldWorkerStandPoint,
  hasSuppressedResourceLoopCollision,
  reserveGoldLoopSlot,
} from './systems/ResourceLoopSystem'
import {
  clearGatherTarget,
  consumeCarriedResources,
  findNearestGoldmine,
  findNearestHarvestableTree,
  settleGatherTrip,
  startGatheringTrip,
} from './systems/ResourceHarvestSystem'
import {
  assignGoldGatherTarget,
  assignLumberGatherTarget,
} from './systems/ResourceCommandSystem'
import { findNearestEnemyTarget } from './systems/CombatTargeting'
import {
  getMortarSplashApplications,
  resolveDirectAttackDamage,
  shouldApplyMortarSplash,
} from './systems/CombatDamageApplicationSystem'
import {
  beginAutoAggro,
  faceUnitTarget,
  getLostCombatTargetAction,
  isAttackTargetInRange,
  isCombatState,
  isCombatTargetValid,
  isStaticDefenseReady,
  isStaticDefenseTargetValid,
  isUnitStunned,
  setUnitChaseTarget,
  shouldAutoAggroUnit,
  shouldDropChaseTarget,
  shouldDropHoldPositionTarget,
  shouldIgnoreOpeningWorkerAggro as shouldIgnoreOpeningWorkerAggroRule,
  stopUnitForAttack,
  tickAttackCooldown,
} from './systems/CombatRuntimeSystem'
import { createRuntimeUnitState } from './systems/UnitRuntimeFactory'
import {
  clearActiveUnitOrder,
  clearPreviousUnitOrder,
  enqueueQueuedCommand,
  executeQueuedMovementCommand,
  finishAttackMoveOrder,
} from './systems/UnitOrderState'
import { advanceBuildingUpgrade } from './systems/BuildingUpgradeSystem'
import {
  advanceResearchQueue,
  advanceReviveQueue,
  advanceTrainingQueue,
} from './systems/ProductionQueueSystem'
import {
  getHeroReviveQuote as calculateHeroReviveQuote,
  restoreHeroFromRevive,
} from './systems/HeroReviveSystem'
import { addHeroXp } from './systems/HeroProgressionSystem'
import {
  castPaladinDivineShield,
  castPaladinHolyLight,
  castPaladinResurrection,
  getResurrectionEligibleRecordIndices as getPaladinResurrectionEligibleRecordIndices,
} from './systems/PaladinAbilitySystem'
import {
  applyWaterElementalSummonStats,
  castArchmageBlizzard,
  castSummonWaterElemental as resolveWaterElementalSummon,
  WATER_ELEMENTAL_CAST_RANGE,
} from './systems/ArchmageAbilitySystem'
import type { BlizzardChannel } from './systems/ArchmageAbilitySystem'
import {
  applyCompletedResearchesToUnit as applyCompletedResearchesToSpawnedUnit,
  applyResearchEffectsToTeam,
} from './systems/ResearchEffectsSystem'
import {
  distanceToBuildingFootprint as getDistanceToBuildingFootprint,
  distanceToTreeFootprint as getDistanceToTreeFootprint,
  hasReachedBuildInteraction as hasUnitReachedBuildInteraction,
  hasReachedDropoffHall as hasUnitReachedDropoffHall,
  hasReachedGatherInteraction as hasUnitReachedGatherInteraction,
  isResourceTargetValid,
} from './systems/InteractionGeometry'
import {
  chooseNearestApproachPoint,
  getBuildingApproachCandidates,
  getTreeApproachCandidates,
} from './systems/ApproachPointSystem'
import { getFormationMoveTargets } from './systems/FormationMoveSystem'
import { advanceUnitMovement } from './systems/UnitMovementSystem'
import { applyUnitSeparation } from './systems/UnitSeparationSystem'
import { planUnitPath } from './systems/PathPlanningSystem'
import {
  canAssignBuilderToConstruction,
  selectConstructionBuilder,
} from './systems/ConstructionAssignmentSystem'
import {
  castMassTeleport as resolveMassTeleport,
  findMassTeleportPlacement,
  selectMassTeleportTransportedUnits,
} from './systems/MassTeleportSystem'
import type { MassTeleportPending } from './systems/MassTeleportSystem'
import {
  getBlizzardWaveDamage,
  selectBlizzardWaveTargets,
} from './systems/BlizzardSystem'
import {
  castStormBolt as resolveStormBolt,
  resolveStormBoltImpact,
} from './systems/StormBoltSystem'
import type { StormBoltProjectile } from './systems/StormBoltSystem'
import { castThunderClap as resolveThunderClap } from './systems/ThunderClapSystem'
import { resolveBashProc } from './systems/BashSystem'
import {
  castAvatar as resolveAvatar,
  expireAvatar,
  isSpellImmune,
} from './systems/AvatarSystem'
import {
  updateBrillianceAura as updateBrillianceAuraBonuses,
  updateDevotionAura as updateDevotionAuraBonuses,
} from './systems/AuraSystem'
import {
  findPriestAutoHealTarget,
  findSlowAutoCastTarget,
  isCasterAutoCastState,
} from './systems/CasterAutoTargetSystem'
import {
  getRightClickUnitIntent,
  selectGoldmineTarget,
  selectRightClickUnitTarget,
  splitGatherCapableUnits,
} from './systems/InputTargetSystem'
import {
  getFriendlyUnitsInScreenRect,
  isTinySelectionRect,
  normalizeScreenRect,
  screenPointToNdc,
} from './systems/SelectionInputSystem'
import { isMainHallType } from './systems/TechPredicates'
import { getMatchOutcome } from './systems/MatchOutcomeSystem'
import type { MatchResult } from './systems/MatchOutcomeSystem'
import {
  getBuildAvailability as checkBuildAvailability,
  getCostBlockReason as checkCostBlockReason,
  getQueuedSupply as computeQueuedSupply,
  getResearchAvailability as checkResearchAvailability,
  getTrainAvailability as checkTrainAvailability,
  hasCompletedResearch as checkCompletedResearch,
} from './systems/AvailabilityChecks'
import {
  buildObjectiveStateKey,
  buildSkirmishCompletionSnapshot,
  buildSkirmishObjectives,
  createMatchTelemetry,
  formatMatchResultSummary,
  formatMenuSessionSummary,
  recordCompletedBuilding,
  recordItemCollected,
  recordItemPurchased,
  recordItemUsed,
  recordResourceDeposit,
  recordTrainedUnit,
  recordUnitDeath,
} from './systems/SkirmishProgressSystem'
import type {
  MatchTelemetry,
  SkirmishCompletionSnapshot,
  SkirmishObjectiveView,
} from './systems/SkirmishProgressSystem'
import {
  buildResultPresentationSnapshot,
} from './systems/ResultPresentationSystem'
import type {
  ResultPresentationSnapshot,
} from './systems/ResultPresentationSystem'
import type { AIPressureSnapshot } from './systems/AIPressureSystem'
import {
  buildBattlefieldReadabilitySnapshot,
  buildMapObjectiveStateKey,
  buildMapObjectives,
} from './systems/MapObjectiveSystem'
import type {
  BattlefieldReadabilitySnapshot,
  MapObjectiveView,
} from './systems/MapObjectiveSystem'
import {
  buildSessionShellSnapshot,
  loadSessionPreferences,
  saveSessionPreferences,
} from './systems/SessionMilestoneSystem'
import type {
  SessionPreferences,
  SessionShellSnapshot,
} from './systems/SessionMilestoneSystem'
import { VisibilitySystem } from './systems/VisibilitySystem'
import type { VisibilitySnapshot } from './systems/VisibilitySystem'
import {
  buildWar3IdentitySnapshot,
} from './systems/War3IdentitySystem'
import type { War3IdentitySnapshot } from './systems/War3IdentitySystem'
import { buildHumanRouteSnapshot } from './systems/HumanRouteSystem'
import type { HumanRouteSnapshot } from './systems/HumanRouteSystem'
import {
  buildHeroMilestoneSnapshot,
} from './systems/HeroMilestoneSystem'
import type { HeroMilestoneSnapshot } from './systems/HeroMilestoneSystem'
import type {
  ActiveHeroAbilityTargetMode,
  ActiveHeroAbilityTargetEvaluation,
} from './systems/HeroAbilityPresentationSystem'
import {
  buildAIOpponentSnapshot,
} from './systems/AIOpponentMilestoneSystem'
import type { AIOpponentSnapshot } from './systems/AIOpponentMilestoneSystem'
import { AudioCueSystem, getAudioCueAssetPath } from './systems/AudioCueSystem'
import type { AudioCueKind, AudioCueSnapshot } from './systems/AudioCueSystem'
import { UnitPresentationSystem } from './systems/UnitPresentationSystem'
import type { UnitPresentationSnapshot } from './systems/UnitPresentationSystem'
import {
  buildVisualAudioIdentitySnapshot,
} from './systems/VisualAudioIdentitySystem'
import type { VisualAudioIdentitySnapshot } from './systems/VisualAudioIdentitySystem'
import { buildPlaytestMilestoneSignals } from './systems/MilestoneSignalSystem'
import type { RuntimeMilestoneSnapshots } from './systems/MilestoneSignalSystem'
import { buildWar3GapSnapshot } from './systems/War3GapSystem'
import type { War3GapSnapshot } from './systems/War3GapSystem'
import {
  buildPlaytestReadinessSnapshot,
  PLAYTEST_BUILD_LABEL,
} from './systems/PlaytestReadinessSystem'
import type {
  PlaytestMilestoneSignal,
  PlaytestReadinessSnapshot,
  PlaytestRuntimeInfo,
  PlaytestCompatibilitySignal,
  PlaytestErrorSignal,
  PlaytestFeedbackInput,
} from './systems/PlaytestReadinessSystem'
import {
  buildFoundationMilestoneSnapshot,
} from './systems/FoundationMilestoneSystem'
import type {
  FoundationMilestoneSnapshot,
} from './systems/FoundationMilestoneSystem'

type CurrentMapSource =
  | { kind: 'parsed'; mapData: ParsedMap }
  | { kind: 'procedural' }

type HeroTargetModeKey = 'waterElemental' | 'blizzard' | 'massTeleport' | 'stormBolt'

type WorldItem = {
  id: number
  type: ItemKey
  mesh: THREE.Object3D
}

const COMMAND_CARD_SLOT_COUNT = 16
const AI_WORKER_HARASS_GRACE_TIME = 300

const TEAM_COLORS = [0x4488ff, 0xff4444, 0x8f8f7a]
const CONSTRUCTION_CANCEL_REFUND_RATE = 0.75

const OPENING_GOLDMINE_OFFSET = { x: 8, z: -4 } as const
const OPENING_BARRACKS_OFFSET = { x: -5, z: 5 } as const
const OPENING_WORKER_OFFSETS: readonly { x: number; z: number }[] = [
  { x: -1, z: 5 },
  { x: 0, z: 5 },
  { x: 1, z: 5 },
  { x: 2, z: 5 },
  { x: 3, z: 5 },
]

function getHumanUnlockCounterText(unlockKey: string, snapshot: HumanRouteSnapshot) {
  const profileByKey = new Map(snapshot.combat.profiles.map(profile => [profile.unitKey, profile]))
  const counterByKey = new Map(snapshot.combat.counters.map(counter => [counter.key, counter]))
  const profile = (unitKey: string, fallback: string) => profileByKey.get(unitKey)?.counterHint ?? fallback
  const weakness = (unitKey: string, fallback: string) => profileByKey.get(unitKey)?.weaknessHint ?? fallback
  const rule = (key: string, fallback: string) => counterByKey.get(key)?.detail ?? fallback

  switch (unlockKey) {
    case 't1-rifleman':
      return `${profile('rifleman', '远程火力')}；${rule('rifleman-heavy', '穿刺克重甲')}`
    case 't2-caster-line':
      return `${profile('priest', '治疗续航')}；${profile('sorceress', '控制接战')}`
    case 't2-workshop-siege':
      return `${profile('mortar_team', '破防攻城')}；${rule('mortar-medium', '攻城不适合打中甲主力')}`
    case 't3-knight-line':
      return `${profile('knight', '重甲前排')}；${weakness('knight', '需要后排配合')}`
    case 't3-upgrade-chains':
      return `${snapshot.upgradeImpact.battleReason}；${snapshot.upgradeImpact.nextUpgradeHint}；${snapshot.combat.strongestDpsLabel}；${snapshot.combat.highestEffectiveHpLabel}`
    case 't3-animal-war-training':
      return `${profileByKey.get('knight')?.roleLabel ?? '三本重甲'}；${snapshot.upgradeImpact.strongestLiveImpactLabel}`
    default:
      return snapshot.combat.recommendedMix
  }
}

/**
 * 游戏主类
 *
 * 操作：
 * - 左键选择/框选，右键移动/采集/攻击
 * - 命令卡：建造建筑、训练单位
 * - 方向键/屏幕边缘移动视角，滚轮缩放
 */
export class Game {
  static readonly STALL_VERDICT_SECONDS = 12 * 60

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
  /** Dead unit records eligible for future Resurrection (IMPL1B substrate). */
  deadUnitRecords: { team: number; type: string; x: number; z: number; diedAt: number }[] = []
  private selectionModel = new SelectionModel()
  private controlGroups = new ControlGroupManager()
  /** Quick access to selected units (delegates to SelectionModel) */
  private get selectedUnits(): readonly Unit[] { return this.selectionModel.units }
  private sel!: SelectionController
  private healthBars = new Map<Unit, { bg: THREE.Mesh; fill: THREE.Mesh }>()
  private healthBarRenderer!: HealthBarRenderer

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
  // Fog / recon runtime
  private visibility!: VisibilitySystem

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
  private mapObjectiveBeacons!: MapObjectiveBeaconPresenter
  private audioCues!: AudioCueSystem
  private unitPresentation!: UnitPresentationSystem

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

  // Water Elemental ground-target mode (HERO18-IMPL1)
  private weTargetMode = false
  private weTargetCaster: Unit | null = null

  // Blizzard ground-target mode (HERO20-IMPL1)
  private blizzardTargetMode = false
  private blizzardTargetCaster: Unit | null = null

  // Blizzard channel state (HERO20-IMPL1)
  private blizzardChannel: BlizzardChannel | null = null

  // Blizzard AOE indicator ring (HERO20-UX1)
  private blizzardAoeRing: THREE.Mesh | null = null

  // Mass Teleport target mode (HERO21-IMPL1)
  private massTeleportTargetMode = false
  private massTeleportTargetCaster: Unit | null = null

  // Storm Bolt unit-target mode (HERO23-IMPL1)
  private stormBoltTargetMode = false
  private stormBoltTargetCaster: Unit | null = null

  // Storm Bolt in-flight projectiles (HERO23-IMPL1)
  private stormBoltProjectiles: StormBoltProjectile[] = []

  // Mass Teleport pending delayed cast (HERO21-IMPL1)
  private massTeleportPending: MassTeleportPending | null = null

  // Neutral creep drops / world pickups
  private worldItems: WorldItem[] = []
  private nextWorldItemId = 1

  // 模式提示文字
  private modeHintPresenter = new ModeHintPresenter(document.getElementById('mode-hint')!)

  // 时间
  private lastTime = 0
  private gameTime = 0

  // HUD
  private elGold = document.getElementById('gold')!
  private elLumber = document.getElementById('lumber')!
  private elSupply = document.getElementById('supply')!
  private elTime = document.getElementById('game-time')!
  private elCameraPos = document.getElementById('camera-pos')!
  private elTileInfo = document.getElementById('tile-info')!
  private commandCardPresenter = new CommandCardPresenter(document.getElementById('command-card')!, COMMAND_CARD_SLOT_COUNT)
  private minimapPresenter = new MinimapPresenter(document.getElementById('minimap-canvas') as HTMLCanvasElement | null)
  private selectionHudPresenter = new SelectionHudPresenter({
    singleSelect: document.getElementById('single-select')!,
    multiSelect: document.getElementById('multi-select')!,
    unitName: document.getElementById('unit-name')!,
    unitHpFill: document.getElementById('unit-hp-fill')!,
    unitHpText: document.getElementById('unit-hp-text')!,
    unitState: document.getElementById('unit-state')!,
    unitStats: document.getElementById('unit-stats')!,
    typeBadge: document.getElementById('unit-type-badge')!,
    portraitCanvas: document.getElementById('portrait-canvas') as HTMLCanvasElement,
    multiCount: document.getElementById('multi-count')!,
    multiBreakdown: document.getElementById('multi-breakdown')!,
    multiHpFill: document.getElementById('multi-hp-fill')!,
    multiHpText: document.getElementById('multi-hp-text')!,
  }, {
    drawPortrait,
    drawMiniPortrait,
  })
  private elObjectiveList = document.getElementById('objective-list') as HTMLOListElement | null
  private elMapObjectiveList = document.getElementById('map-objective-list') as HTMLDivElement | null
  private elWar3IdentityStatus = document.getElementById('war3-identity-status') as HTMLDivElement | null
  private elHumanRoutePanel = document.getElementById('human-route-panel') as HTMLElement | null
  private elHumanRouteList = document.getElementById('human-route-list') as HTMLDivElement | null
  private elHumanRouteTechSummary = document.getElementById('human-route-tech-summary') as HTMLDivElement | null
  private elHumanRouteUnlockList = document.getElementById('human-route-unlock-list') as HTMLDivElement | null
  private elHeroTacticsStatus = document.getElementById('hero-tactics-status') as HTMLDivElement | null
  private elHeroTacticsReadiness = document.getElementById('hero-tactics-readiness') as HTMLDivElement | null
  private elAiOpponentStatus = document.getElementById('ai-opponent-status') as HTMLDivElement | null
  private elVisualAudioStatus = document.getElementById('visual-audio-status') as HTMLDivElement | null
  private elFoundationStatus = document.getElementById('foundation-status') as HTMLDivElement | null
  private elPressureStage = document.getElementById('pressure-stage') as HTMLSpanElement | null
  private elPressureWave = document.getElementById('pressure-wave') as HTMLSpanElement | null
  private elPressureNext = document.getElementById('pressure-next') as HTMLSpanElement | null
  private elPressureMeterFill = document.getElementById('pressure-meter-fill') as HTMLSpanElement | null
  private elPressureAlert = document.getElementById('pressure-alert') as HTMLDivElement | null
  private elPlaytestReadinessStatus = document.getElementById('playtest-readiness-status') as HTMLDivElement | null
  private elPlaytestReadinessList = document.getElementById('playtest-readiness-list') as HTMLDivElement | null
  private elPlaytestFeedbackPacket = document.getElementById('playtest-feedback-packet') as HTMLTextAreaElement | null
  private elPlaytestOperationalSummary = document.getElementById('playtest-operational-summary') as HTMLDivElement | null
  private elPlaytestErrorList = document.getElementById('playtest-error-list') as HTMLDivElement | null
  private elPlaytestFeedbackCategory = document.getElementById('playtest-feedback-category') as HTMLSelectElement | null
  private elPlaytestFeedbackSeverity = document.getElementById('playtest-feedback-severity') as HTMLSelectElement | null
  private elPlaytestUserNotes = document.getElementById('playtest-user-notes') as HTMLTextAreaElement | null
  private elPlaytestRefreshButton = document.getElementById('playtest-refresh-button') as HTMLButtonElement | null
  private elPlaytestCopyButton = document.getElementById('playtest-copy-feedback-button') as HTMLButtonElement | null
  private _lastCmdKey = ''  // 命令卡缓存，只在选择变化时重建
  private _lastSelKey = ''  // 选择HUD缓存
  private _lastObjectiveKey = ''
  private _lastPressureKey = ''
  private _lastMapObjectiveKey = ''
  private _lastWar3IdentityKey = ''
  private _lastHumanRouteKey = ''
  private _lastMilestoneStatusKey = ''
  private _lastPlaytestReadinessKey = ''
  private _lastPressureCueKey = ''
  private _lastCommandCardPrimary: Unit | null = null
  private trainingQueuePresenter = new TrainingQueuePresenter(document.getElementById('train-queue')!)
  private sessionPreferences: SessionPreferences = loadSessionPreferences()
  private matchTelemetry: MatchTelemetry = createMatchTelemetry()
  private playtestRuntimeErrors: PlaytestErrorSignal[] = []
  private objectiveTrackerPrimed = false
  private completedObjectiveKeys = new Set<string>()
  private objectiveHintTimer = 0
  private humanRouteFeedbackPrimed = false
  private completedHumanRouteKeys = new Set<string>()
  private humanRouteCompletionCueCount = 0
  private lastHumanRouteCompletionKeys: string[] = []

  // 胜利/失败
  private gameOverResult: MatchResult | null = null
  private previousPhaseBeforeSetup: Phase | null = null
  private elGameOverOverlay = document.getElementById('game-over-overlay')!
  private elGameOverText = document.getElementById('game-over-text')!
  private elSetupShell = document.getElementById('setup-shell')!
  private elSetupReturnButton = document.getElementById('setup-return-button') as HTMLButtonElement
  private elSetupStartButton = document.getElementById('setup-start-button') as HTMLButtonElement
  private elPauseShell = document.getElementById('pause-shell')!
  private elPauseResumeButton = document.getElementById('pause-resume-button') as HTMLButtonElement
  private elPauseSetupButton = document.getElementById('pause-setup-button') as HTMLButtonElement
  private elPauseReloadButton = document.getElementById('pause-reload-button') as HTMLButtonElement
  private elResultsShell = document.getElementById('results-shell')!
  private elResultsReloadButton = document.getElementById('results-reload-button') as HTMLButtonElement
  private elResultsShellMessage = document.getElementById('results-shell-message') as HTMLDivElement
  private elResultsShellSummary = document.getElementById('results-shell-summary') as HTMLDivElement
  private elResultsVisualSummary = document.getElementById('results-visual-summary') as HTMLDivElement | null
  private elResultsStatGrid = document.getElementById('results-stat-grid') as HTMLDivElement | null
  private elResultsObjectiveRecap = document.getElementById('results-objective-recap') as HTMLDivElement | null
  private elResultsFlowRecap = document.getElementById('results-flow-recap') as HTMLDivElement | null
  private currentMapSource: CurrentMapSource | null = null
  private proceduralGroundPlane!: THREE.Mesh

  constructor() {
    this.scene = new THREE.Scene()
    // war3 氛围：偏暖偏深的雾色背景，不是纯黑
    this.scene.background = new THREE.Color(0x1a2218)
    this.scene.fog = new THREE.Fog(0x1a2218, 50, 120)
    // FOV 45° — war3 风格压缩透视，减少畸变，更像经典 RTS
    this.camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 2000)
    this.healthBarRenderer = new HealthBarRenderer(this.scene, this.camera, this.healthBars)

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
    this.proceduralGroundPlane = this.terrain.groundPlane
    this.mapRuntime = new MapRuntime(this.terrain)
    this.feedback = new FeedbackEffects({
      scene: this.scene,
      camera: this.camera,
      getWorldHeight: (wx, wz) => this.getWorldHeight(wx, wz),
    })
    this.audioCues = new AudioCueSystem({
      enabled: this.sessionPreferences.audioCues,
      getTime: () => this.gameTime,
    })
    this.unitPresentation = new UnitPresentationSystem()
    this.mapObjectiveBeacons = new MapObjectiveBeaconPresenter({
      scene: this.scene,
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
    this.visibility = new VisibilitySystem(MAP_SIZE, MAP_SIZE)

    this.scene.add(new THREE.AmbientLight(0xb5b090, 1.15))
    // 暖色阳光，从西南方斜照，产生自然阴影感
    const sun = new THREE.DirectionalLight(0xfff0dd, 1.25)
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
    const fill = new THREE.DirectionalLight(0xaab7d8, 0.45)
    fill.position.set(30, 40, 30)
    this.scene.add(fill)
    // 半球光：天空偏蓝、地面偏绿，模拟 war3 环境光
    const hemi = new THREE.HemisphereLight(0xb8c4d4, 0x52663b, 0.42)
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
    this.attachPreferenceControls()
    this.attachPlaytestControls()
    this.attachPlaytestRuntimeErrorCapture()
    window.addEventListener('beforeunload', this.handleBeforeUnload)
    this.elSetupReturnButton.addEventListener('click', () => this.closeSetupShell())
    this.elSetupStartButton.addEventListener('click', () => {
      this.reloadCurrentMap()
    })
    this.elPauseResumeButton.addEventListener('click', () => this.resumeGame())
    this.elPauseSetupButton.addEventListener('click', () => this.openSetupShell())
    this.elPauseReloadButton.addEventListener('click', () => {
      this.reloadCurrentMap()
    })
    this.elResultsReloadButton.addEventListener('click', () => {
      this.reloadCurrentMap()
    })
    this.createAI()
    this.currentMapSource = { kind: 'procedural' }
    this.phase.set(Phase.Playing)
    this.syncSessionOverlays()
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
    if (!this.phase.isPaused() && !this.phase.isGameOver() && !this.phase.isSetup()) {
      // 相机始终更新（LoadingMap 时也允许缩放/平移）
      this.cameraCtrl.update(dt)
    }
    // 游戏逻辑仅在 Playing 阶段运行
    if (!this.phase.isPlaying()) return
    this.gameTime += dt
    this.ai.update(dt)
    this.updateUnits(dt)
    this.updateCombat(dt)
    this.updateStaticDefense(dt)
    this.updateBrillianceAura()
    this.updateBlizzardChannel()
    this.updateMassTeleportPending()
    this.updateCasterAbilities(dt)
    this.updateSlowExpiry()
    this.updateStunExpiry()
    this.updateAvatarExpiry()
    this.updateStormBoltProjectiles()
    this.updateWorldItemPickups()
    this.updateDevotionAura()
    this.updateAutoAggro()
    this.unitPresentation.update(this.units, dt, this.gameTime)
    this.updateHealthBars()
    this.sel.updateSelectionRings()
    this.feedback.updateMoveIndicators(dt)
    this.feedback.updateImpactRings(dt)
    this.feedback.updateAbilityEffectBursts(dt)
    this.updateGhostPlacement()
    this.handleSummonExpirations()
    this.handleDeadUnits()
    this.checkGameOver()
    this.updateVisibilityState()
    this.updateHUD(dt)
    this.updateMinimap()
  }

  private render() {
    this.composer.render()
  }

  private attachPreferenceControls() {
    const bind = (
      id: string,
      key: Exclude<keyof SessionPreferences, 'aiDifficulty'>,
      onChange?: () => void,
    ) => {
      const input = document.getElementById(id) as HTMLInputElement | null
      if (!input) return
      input.checked = this.sessionPreferences[key]
      input.addEventListener('change', () => {
        this.sessionPreferences = {
          ...this.sessionPreferences,
          [key]: input.checked,
        }
        saveSessionPreferences(this.sessionPreferences)
        onChange?.()
      })
    }

    bind('setting-objective-beacons', 'objectiveBeacons', () => {
      if (!this.sessionPreferences.objectiveBeacons) this.mapObjectiveBeacons.render([])
      else this.renderMapObjectiveRadar(true)
    })
    bind('setting-minimap-fog', 'minimapFog', () => this.updateMinimap())
    bind('setting-close-protection', 'closeProtection')
    bind('setting-human-route-panel', 'humanRoutePanel', () => this.renderHumanRoutePanel(true))
    bind('setting-audio-cues', 'audioCues', () => {
      this.audioCues.setEnabled(this.sessionPreferences.audioCues)
      this.renderMilestoneStatusPanel(true)
    })
    const difficultySelect = document.getElementById('setting-ai-difficulty') as HTMLSelectElement | null
    if (difficultySelect) {
      difficultySelect.value = this.sessionPreferences.aiDifficulty
      difficultySelect.addEventListener('change', () => {
        const value = difficultySelect.value === 'rush' ? 'rush' : 'standard'
        this.sessionPreferences = { ...this.sessionPreferences, aiDifficulty: value }
        saveSessionPreferences(this.sessionPreferences)
        if (this.ai) this.createAI()
        this.renderPressureTracker(true)
        this.renderMilestoneStatusPanel(true)
      })
    }
    this.renderHumanRoutePanel(true)
    this.renderMilestoneStatusPanel(true)
    this.renderPlaytestReadinessPanel(true)
  }

  private attachPlaytestControls() {
    this.elPlaytestRefreshButton?.addEventListener('click', () => {
      this.renderPlaytestReadinessPanel(true)
    })

    this.elPlaytestFeedbackCategory?.addEventListener('change', () => {
      this.renderPlaytestReadinessPanel(true)
    })
    this.elPlaytestFeedbackSeverity?.addEventListener('change', () => {
      this.renderPlaytestReadinessPanel(true)
    })
    this.elPlaytestUserNotes?.addEventListener('input', () => {
      this.renderPlaytestReadinessPanel(true)
    })

    this.elPlaytestCopyButton?.addEventListener('click', () => {
      const button = this.elPlaytestCopyButton
      const packet = this.getPlaytestReadinessSnapshot().feedbackPacket
      if (this.elPlaytestFeedbackPacket) {
        this.elPlaytestFeedbackPacket.value = packet
      }
      if (!button) return

      button.dataset.copyState = 'pending'
      const clipboard = navigator.clipboard
      if (clipboard?.writeText) {
        void clipboard.writeText(packet)
          .then(() => {
            if (this.elPlaytestCopyButton) this.elPlaytestCopyButton.dataset.copyState = 'copied'
          })
          .catch(() => {
            if (this.elPlaytestCopyButton) this.elPlaytestCopyButton.dataset.copyState = 'unavailable'
          })
      } else {
        this.elPlaytestFeedbackPacket?.select()
        button.dataset.copyState = 'unavailable'
      }
    })
  }

  private attachPlaytestRuntimeErrorCapture() {
    window.addEventListener('error', (event) => {
      this.recordPlaytestRuntimeError('error', event.message || 'unknown error', event.filename || 'window')
    })
    window.addEventListener('unhandledrejection', (event) => {
      const reason = event.reason instanceof Error ? event.reason.message : String(event.reason ?? 'unknown rejection')
      this.recordPlaytestRuntimeError('unhandledrejection', reason, 'promise')
    })
  }

  private recordPlaytestRuntimeError(kind: string, message: string, source: string) {
    const min = Math.floor(this.gameTime / 60).toString().padStart(2, '0')
    const sec = Math.floor(this.gameTime % 60).toString().padStart(2, '0')
    this.playtestRuntimeErrors.push({
      kind,
      message: message.slice(0, 180),
      source: source.slice(0, 120),
      timeLabel: `${min}:${sec}`,
    })
    if (this.playtestRuntimeErrors.length > 8) this.playtestRuntimeErrors.shift()
    this.renderPlaytestReadinessPanel(true)
  }

  private handleBeforeUnload = (event: BeforeUnloadEvent) => {
    if (!this.isBeforeUnloadGuardActive()) return
    event.preventDefault()
    event.returnValue = ''
    return ''
  }

  private isBeforeUnloadGuardActive() {
    return this.sessionPreferences.closeProtection &&
      (this.phase.isPlaying() || this.phase.isPaused() || this.phase.isGameOver())
  }

  private setPageShellVisible(shell: HTMLElement, visible: boolean) {
    shell.hidden = !visible
    shell.setAttribute('aria-hidden', visible ? 'false' : 'true')
  }

  private syncSessionOverlays() {
    const setup = this.phase.isSetup()
    const paused = this.phase.isPaused()
    const gameOver = this.phase.isGameOver()

    this.setPageShellVisible(this.elSetupShell, setup)
    this.setPageShellVisible(this.elPauseShell, paused)
    this.setPageShellVisible(this.elResultsShell, gameOver)
    if (!gameOver) {
      this.elResultsShellMessage.textContent = ''
    }
    this.elSetupStartButton.disabled = !this.currentMapSource
    this.elPauseReloadButton.disabled = !this.currentMapSource
    this.elResultsReloadButton.disabled = !gameOver || !this.currentMapSource
  }

  private clearGameOverOverlay() {
    this.elGameOverOverlay.style.display = 'none'
    this.elGameOverOverlay.classList.remove('victory', 'defeat', 'stall')
    this.elGameOverText.textContent = ''
    this.elResultsShellSummary.textContent = ''
    this.clearResultPresentation()
  }

  private resetTransientInputState() {
    this.isDragging = false
    this.sel.hideSelectionBox()
    this.shiftHeld = false
    this.lastClickTime = 0
    this.lastClickUnit = null
    this.clearHeroTargetModes()
  }

  private clearHeldCameraInputs() {
    const centerX = window.innerWidth / 2
    const centerY = window.innerHeight / 2
    window.dispatchEvent(new MouseEvent('mousemove', {
      clientX: centerX,
      clientY: centerY,
      bubbles: true,
      cancelable: true,
    }))

    for (const key of ['arrowup', 'arrowdown', 'arrowleft', 'arrowright', 'Shift']) {
      window.dispatchEvent(new KeyboardEvent('keyup', { key, bubbles: true, cancelable: true }))
    }
  }

  private resetSessionStateForMapLoad() {
    this.gameOverResult = null
    this.matchTelemetry = createMatchTelemetry()
    this._lastObjectiveKey = ''
    this._lastPressureKey = ''
    this._lastMapObjectiveKey = ''
    this._lastWar3IdentityKey = ''
    this._lastHumanRouteKey = ''
    this._lastMilestoneStatusKey = ''
    this._lastPlaytestReadinessKey = ''
    this._lastPressureCueKey = ''
    this.objectiveTrackerPrimed = false
    this.completedObjectiveKeys.clear()
    this.objectiveHintTimer = 0
    this.humanRouteFeedbackPrimed = false
    this.completedHumanRouteKeys.clear()
    this.humanRouteCompletionCueCount = 0
    this.lastHumanRouteCompletionKeys = []
    this.gameTime = 0
    this.elTime.textContent = '00:00'
    this.clearGameOverOverlay()
    this.clearWorldItems()
    this.audioCues.reset()
    this.visibility.reset()
    this.mapObjectiveBeacons.render([])
    this.cancelAllModes()
    this.resetTransientInputState()
    this.syncSessionOverlays()
    this.clearHeldCameraInputs()
  }

  private isGameplaySurfaceTarget(target: EventTarget | null) {
    if (!(target instanceof Element)) return false
    return !!target.closest('#game-canvas, #minimap-canvas')
  }

  private shouldBlockGameplayInput() {
    return this.phase.isSessionOverlayActive()
  }

  public pauseGame() {
    if (!this.phase.isPlaying()) return
    this.resetTransientInputState()
    this.clearHeldCameraInputs()
    this.phase.set(Phase.Paused)
    this.syncSessionOverlays()
  }

  public openSetupShell() {
    if (!this.phase.isPlaying() && !this.phase.isPaused()) return
    this.previousPhaseBeforeSetup = this.phase.get()
    this.resetTransientInputState()
    this.clearHeldCameraInputs()
    this.phase.set(Phase.Setup)
    this.syncSessionOverlays()
  }

  public closeSetupShell() {
    if (!this.phase.isSetup()) return
    const restore = this.previousPhaseBeforeSetup ?? Phase.Playing
    this.previousPhaseBeforeSetup = null
    this.phase.set(restore)
    this.syncSessionOverlays()
  }

  public resumeGame() {
    if (!this.phase.isPaused()) return
    this.phase.set(Phase.Playing)
    this.syncSessionOverlays()
  }

  public togglePause() {
    if (this.phase.isPaused()) {
      this.resumeGame()
    } else if (this.phase.isPlaying()) {
      this.pauseGame()
    }
  }

  public isPaused() {
    return this.phase.isPaused()
  }

  public isSetupOpen() {
    return this.phase.isSetup()
  }

  // ==================== 单位AI ====================

  private updateUnits(dt: number) {
    for (const unit of this.units) {
      this.updateUnitMovement(unit, dt)
      this.updateUnitState(unit, dt)
      this.updateBuildProgress(unit, dt)
      this.updateBuildingUpgradeProgress(unit, dt)
      this.updateTrainingQueue(unit, dt)
      this.updateReviveQueue(unit, dt)
      this.updateResearchQueue(unit, dt)
      this.feedback.updateCarryIndicator(unit)
    }
    this.updateMilitiaExpiration()
    // Post-move separation: push apart units that are too close
    this.applySeparation()
  }

  private applySeparation() {
    applyUnitSeparation(
      this.units,
      (wx, wz) => this.isPositionBlocked(wx, wz),
      (wx, wz) => this.getWorldHeight(wx, wz),
      hasSuppressedResourceLoopCollision,
    )
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

    if (advanceUnitMovement(unit, dt, this.gameTime, (wx, wz) => this.getWorldHeight(wx, wz)) === 'arrived') {
      // 到达最终目标
      // 攻击移动到达终点 → 转为空闲
      if (unit.state === UnitState.AttackMove) {
        finishAttackMoveOrder(unit)
        return
      }
      // 移动队列：如果还有排队的目标，弹出下一个并继续
      if (unit.state === UnitState.Moving && unit.moveQueue.length > 0) {
        const nextCmd = unit.moveQueue.shift()!
        this.executeQueuedCommand(unit, nextCmd)
      }
      return
    }
  }

  /** 状态机 */
  private updateUnitState(unit: Unit, dt: number) {
    // 防御层：非可采集单位不应处于采集相关状态
    if ((unit.state === UnitState.MovingToGather || unit.state === UnitState.Gathering
        || unit.state === UnitState.MovingToReturn)
      && !UNITS[unit.type]?.canGather) {
      unit.state = UnitState.Idle
      unit.gatherType = null
      clearGatherTarget(unit)
      unit.moveTarget = null
      unit.waypoints = []
      return
    }

    switch (unit.state) {
      case UnitState.MovingToGather: {
        if (!isResourceTargetValid(unit)) {
          this.startGatherNearest(unit)
          break
        }
        const reachedGatherInteraction = hasUnitReachedGatherInteraction(unit)
        if (unit.moveTarget && !reachedGatherInteraction) return
        if (unit.moveTarget) {
          unit.moveTarget = null
          unit.waypoints = []
        }
        if (!reachedGatherInteraction) {
          const rt = unit.resourceTarget
          if (rt?.type === 'goldmine') {
            this.planPathToBuildingInteraction(unit, rt.mine)
            if (!unit.moveTarget && getDistanceToBuildingFootprint(unit, rt.mine) <= 2.5) {
              this.placeGoldWorkerAtMineEdge(unit, rt.mine)
              unit.goldStandMine = rt.mine
            }
          } else if (rt?.type === 'tree') {
            this.planPathToTreeInteraction(unit, rt.entry)
          }
          return
        }
        if (reachedGatherInteraction &&
          unit.gatherType === 'gold' &&
          unit.resourceTarget?.type === 'goldmine' &&
          unit.goldStandMine !== unit.resourceTarget.mine) {
          this.placeGoldWorkerAtMineEdge(unit, unit.resourceTarget.mine)
          unit.goldStandMine = unit.resourceTarget.mine
        }
        // 到达资源点 → 验证资源目标仍有效
        if (!isResourceTargetValid(unit)) {
          this.startGatherNearest(unit)
          break
        }
        const rt = unit.resourceTarget
        if (unit.gatherType === 'gold' &&
          rt?.type === 'goldmine' &&
          !reserveGoldLoopSlot(unit, rt.mine, this.units)) {
          // Gold mines are saturated at five active workers. Extra workers
          // wait at the mine until a gathering slot opens.
          unit.gatherTimer = 0
          break
        }
        startGatheringTrip(unit)
        break
      }

      case UnitState.Gathering: {
        unit.gatherTimer -= dt
        if (unit.gatherTimer <= 0) {
          // 统一结算：基于明确资源目标扣减，不允许凭空产资源
          unit.carryAmount = settleGatherTrip(unit, (tree) => this.depleteTree(tree))

          // 只有拿到了资源才走回基地
          if (unit.carryAmount > 0) {
            const hall = this.findNearest(unit, 'townhall', unit.team)
            if (hall) {
              unit.state = UnitState.MovingToReturn
              this.planPathToBuildingInteraction(unit, hall)
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
        if (unit.moveTarget && !hasUnitReachedDropoffHall(unit, hall)) return
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
        const deposit = consumeCarriedResources(unit)
        if (deposit) {
          this.resources.earn(unit.team, deposit.gold, deposit.lumber)
          recordResourceDeposit(this.matchTelemetry, unit.team, deposit.gold, deposit.lumber)
        }
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
        if (unit.moveTarget && !hasUnitReachedBuildInteraction(unit, target)) return
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
      this.playAudioCue('construction', '建造完成')
      recordCompletedBuilding(this.matchTelemetry, unit.team)
    }

    // 缩放动画：从0.3到1
    const scale = 0.3 + 0.7 * unit.buildProgress
    unit.mesh.scale.setScalar(scale)
  }

  /** 训练队列 */
  private updateTrainingQueue(unit: Unit, dt: number) {
    const completed = advanceTrainingQueue(unit, dt)
    if (!completed) return

    const def = UNITS[completed.unitType]
    if (!def) return

    const angle = Math.random() * Math.PI * 2
    const spawnX = unit.mesh.position.x + Math.cos(angle) * 2
    const spawnZ = unit.mesh.position.z + Math.sin(angle) * 2
    const spawned = this.spawnUnit(completed.unitType, unit.team, spawnX - 0.5, spawnZ - 0.5)
    recordTrainedUnit(this.matchTelemetry, unit.team, completed.unitType)

    if (!unit.rallyPoint) return

    if (unit.rallyTarget && unit.rallyTarget.type === 'goldmine'
      && UNITS[spawned.type]?.canGather) {
      spawned.gatherType = 'gold'
      assignGoldGatherTarget([spawned], unit.rallyTarget)
      spawned.state = UnitState.MovingToGather
      this.planPathToBuildingInteraction(spawned, unit.rallyTarget)
      return
    }

    this.issueCommand([spawned], { type: 'move', target: unit.rallyPoint })
    this.planPath(spawned, unit.rallyPoint)
  }

  /** 复活队列（祭坛专用） */
  private updateReviveQueue(unit: Unit, dt: number) {
    const completed = advanceReviveQueue(unit, dt)
    if (!completed) return

    const hero = this.units.find(
      u => u.team === unit.team && u.type === completed.heroType && !u.isBuilding && u.isDead,
    )
    if (!hero) return

    const heroDef = UNITS[completed.heroType]
    if (!heroDef) return

    restoreHeroFromRevive(hero, this.gameTime)

    const angle = Math.random() * Math.PI * 2
    const reviveX = unit.mesh.position.x + Math.cos(angle) * 2
    const reviveZ = unit.mesh.position.z + Math.sin(angle) * 2
    hero.mesh.position.set(
      reviveX,
      this.getWorldHeight(reviveX - 0.5, reviveZ - 0.5),
      reviveZ,
    )
    if (!this.outlineObjects.includes(hero.mesh)) {
      this.outlineObjects.push(hero.mesh)
    }
    if (!this.healthBars.has(hero)) {
      this.createHealthBar(hero)
    }
  }

  /** 研究队列更新 */
  private updateResearchQueue(unit: Unit, dt: number) {
    const completed = advanceResearchQueue(unit, dt)
    if (!completed) return

    if (!checkCompletedResearch(this.units, completed.researchKey, unit.team)) {
      unit.completedResearches.push(completed.researchKey)
      this.applyResearchEffects(completed.researchKey, unit.team)
    }
  }

  /** Building upgrade progress for data-driven main hall upgrades. */
  private updateBuildingUpgradeProgress(unit: Unit, dt: number) {
    if (!unit.isBuilding || !unit.upgradeQueue) return
    if (unit.buildProgress < 1) return

    if (advanceBuildingUpgrade(unit, dt)) {
      this._lastCmdKey = ''
    }
  }

  /** Apply data-driven research effects to existing units on the researching team */
  private applyResearchEffects(researchKey: string, team: number) {
    applyResearchEffectsToTeam(this.units, researchKey, team)
  }

  /** Apply data-driven research effects to a newly spawned unit */
  private applyCompletedResearchesToUnit(unit: Unit) {
    applyCompletedResearchesToSpawnedUnit(unit, this.units)
  }

  // ==================== 战斗系统 ====================

  /** 战斗状态更新（Attacking / AttackMove / HoldPosition） */
  private updateCombat(dt: number) {
    for (const unit of this.units) {
      if (!isCombatState(unit.state)) continue

      // Stunned units cannot attack
      if (isUnitStunned(unit, this.gameTime)) continue

      // AttackMove 无 attackTarget → 正常前进中，不需要战斗逻辑
      // 路径已在 issueCommand 或 resumeAttackMove() 中设好
      if (unit.state === UnitState.AttackMove && !unit.attackTarget) continue

      // HoldPosition 无 attackTarget → 扫描范围内敌人
      if (unit.state === UnitState.HoldPosition && !unit.attackTarget) {
        const nearest = findNearestEnemyTarget({
          units: this.units,
          source: unit,
          maxDistance: unit.attackRange + 0.5,
        })
        if (nearest) {
          unit.attackTarget = nearest
        }
        continue // 有目标后下帧处理攻击
      }

      const target = unit.attackTarget

      // 目标死亡/无效
      if (!isCombatTargetValid(target, this.units)) {
        unit.attackTarget = null
        this.handleLostCombatTarget(unit, getLostCombatTargetAction(unit))
        continue
      }

      // 驻守：只在攻击范围内打，超出范围就放弃（不追，也不恢复成 Idle）
      // This must run before the generic CHASE_RANGE branch, otherwise hold
      // position incorrectly falls through to restorePreviousOrder().
      if (shouldDropHoldPositionTarget(unit, target)) {
        unit.attackTarget = null
        stopUnitForAttack(unit)
        continue
      }

      // 超出追击范围
      const chaseLossAction = shouldDropChaseTarget(unit, target)
      if (chaseLossAction !== 'none') {
        unit.attackTarget = null
        this.handleLostCombatTarget(unit, chaseLossAction)
        continue
      }

      // 超出攻击范围 → 追上去
      if (!isAttackTargetInRange(unit, target)) {
        setUnitChaseTarget(unit, target)
      } else {
        // 在攻击范围内 → 停下打
        stopUnitForAttack(unit)
        faceUnitTarget(unit, target)

        if (tickAttackCooldown(unit, dt, this.gameTime)) {
          this.dealDamage(unit, target)
        }
      }
    }
  }

  private handleLostCombatTarget(unit: Unit, action: 'resumeAttackMove' | 'restorePreviousOrder' | 'holdPosition' | 'none') {
    switch (action) {
      case 'resumeAttackMove':
        this.resumeAttackMove(unit)
        return
      case 'restorePreviousOrder':
        this.restorePreviousOrder(unit)
        return
      case 'holdPosition':
      case 'none':
        return
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
      if (!isStaticDefenseReady(unit)) continue

      // Validate existing target
      if (unit.attackTarget && !isStaticDefenseTargetValid(unit, unit.attackTarget, this.units)) {
        unit.attackTarget = null
      }

      // Acquire target if none
      if (!unit.attackTarget) {
        const nearest = findNearestEnemyTarget({
          units: this.units,
          source: unit,
          maxDistance: unit.attackRange,
          includeBuildings: false,
        })
        if (nearest) unit.attackTarget = nearest
      }

      // Attack if target is in range
      const currentTarget = unit.attackTarget
      if (!currentTarget) continue

      // Face target
      faceUnitTarget(unit, currentTarget)

      // Attack on cooldown
      if (tickAttackCooldown(unit, dt, this.gameTime)) {
        this.dealDamage(unit, currentTarget)
      }
    }
  }

  // ==================== 集结号令（人族 identity ability）====================

  /**
   * Trigger Rally Call from a player-owned unit.
   * Buffs all nearby friendly non-building units with a temporary damage bonus.
   */
  triggerRallyCall(source: Unit): boolean {
    if (source.isBuilding || source.team !== 0) return false
    if (this.gameTime < source.rallyCallCooldownUntil) return false

    const rc = ABILITIES.rally_call
    const now = this.gameTime
    const buffEnd = now + rc.duration
    let affected = 0

    for (const u of this.units) {
      if (u.team !== source.team || u.isBuilding || u.hp <= 0) continue
      const dist = u.mesh.position.distanceTo(source.mesh.position)
      if (dist > rc.range) continue
      u.rallyCallBoostUntil = buffEnd
      affected++
    }

    if (affected > 0) {
      source.rallyCallCooldownUntil = now + rc.cooldown
      // Visual feedback: spawn an impact ring at source
      this.feedback.spawnImpactRing(source.mesh.position)
      return true
    }
    return false
  }

  /** Update rally call buff expiry — clears expired buffs each tick */
  private updateRallyCallBuff() {
    // Buffs are self-expiring via gameTime comparison in dealDamage.
    // No per-unit cleanup needed — the boost field is a timestamp threshold.
    // This hook exists for any future visual/state cleanup if needed.
  }

  // ==================== Militia 变身系统（HN4-IMPL2 Call to Arms）====================

  /**
   * Morph a Worker into Militia using ABILITIES.call_to_arms and UNITS.militia data.
   * Clears gather/build/attack state, swaps combat stats.
   */
  morphToMilitia(unit: Unit): boolean {
    if (unit.type !== 'worker') return false
    if (unit.team !== 0) return false
    if (unit.isBuilding) return false

    const cta = ABILITIES.call_to_arms
    // Must be near a completed friendly main hall (townhall / keep / castle)
    const nearHall = this.units.some(u =>
      isMainHallType(u.type) &&
      u.team === unit.team &&
      u.buildProgress >= 1 &&
      u.hp > 0 &&
      u.mesh.position.distanceTo(unit.mesh.position) <= cta.range
    )
    if (!nearHall) return false

    const militiaDef = UNITS[cta.morphTarget!]
    if (!militiaDef) return false

    // Clear active states
    unit.gatherType = null
    unit.carryAmount = 0
    unit.gatherTimer = 0
    unit.resourceTarget = null
    unit.goldLoopSlotMine = null
    unit.goldStandMine = null
    if (unit.buildTarget?.builder === unit) {
      unit.buildTarget.builder = null
    }
    unit.buildTarget = null
    unit.attackTarget = null
    unit.moveTarget = null
    unit.moveQueue = []
    unit.waypoints = []
    unit.attackMoveTarget = null
    unit.state = UnitState.Idle
    clearPreviousUnitOrder(unit)

    // Morph stats
    unit.morphOriginalType = unit.type
    unit.type = cta.morphTarget!
    unit.attackDamage = militiaDef.attackDamage
    unit.armor = militiaDef.armor
    unit.attackRange = militiaDef.attackRange
    unit.attackCooldown = militiaDef.attackCooldown
    unit.speed = militiaDef.speed
    unit.maxHp = militiaDef.hp
    unit.hp = Math.min(unit.hp, militiaDef.hp)

    this.replaceUnitMeshVisual(unit, createUnitVisual(unit.type, unit.team))

    // Set expiration
    unit.morphExpiresAt = this.gameTime + cta.duration

    return true
  }

  /** Revert a Militia back to its original unit form. */
  revertMilitia(unit: Unit): boolean {
    if (unit.type !== 'militia') return false
    if (!unit.morphOriginalType) return false
    const workerDef = UNITS[unit.morphOriginalType]
    if (!workerDef) return false

    unit.type = unit.morphOriginalType
    unit.morphOriginalType = null
    unit.morphExpiresAt = 0
    unit.attackDamage = workerDef.attackDamage
    unit.armor = workerDef.armor
    unit.attackRange = workerDef.attackRange
    unit.attackCooldown = workerDef.attackCooldown
    unit.speed = workerDef.speed
    unit.maxHp = workerDef.hp
    unit.attackTarget = null
    unit.state = UnitState.Idle
    this.replaceUnitMeshVisual(unit, createUnitVisual(unit.type, unit.team))
    return true
  }

  /** Execute ABILITIES.back_to_work: Militia immediately returns to Worker. */
  backToWork(unit: Unit): boolean {
    const btw = ABILITIES.back_to_work
    const ownedByBackToWork = Array.isArray(btw.ownerType)
      ? btw.ownerType.includes(unit.type)
      : unit.type === btw.ownerType
    if (!ownedByBackToWork) return false
    if (unit.morphExpiresAt <= 0) return false
    if (unit.morphOriginalType !== btw.morphTarget) return false
    return this.revertMilitia(unit)
  }

  /** Check and revert expired Militia units each tick */
  private updateMilitiaExpiration() {
    for (const unit of this.units) {
      if (unit.morphExpiresAt > 0 && this.gameTime >= unit.morphExpiresAt) {
        this.revertMilitia(unit)
      }
    }
  }

  // ==================== 法师系统（Priest V7 最小线）====================

  /**
   * Caster ability update tick: mana regen + auto-heal for Priests.
   *
   * Auto-heal rules (minimal):
   * - Priest scans for the lowest-HP friendly non-building unit within Heal ability range
   * - Target must be injured (hp < maxHp) and not at full health
   * - Priest must have enough mana and not be on heal cooldown
   * - Priest must be in Idle, Attacking, AttackMove, or HoldPosition state
   */
  private updateCasterAbilities(dt: number) {
    for (const unit of this.units) {
      // Mana regeneration for all units with maxMana > 0
      if (unit.maxMana > 0 && unit.mana < unit.maxMana) {
        unit.mana = Math.min(unit.maxMana, unit.mana + (unit.manaRegen + unit.brillianceAuraBonus) * dt)
      }

      // Sorceress auto-cast Slow
      if (unit.type === 'sorceress' && unit.hp > 0 && !unit.isBuilding && unit.slowAutoCastEnabled) {
        const slowDef = ABILITIES.slow
        if (unit.mana >= (slowDef.cost.mana ?? 0) && this.gameTime >= unit.slowAutoCastCooldownUntil) {
          // Only auto-cast in combat-ready states
          if (isCasterAutoCastState(unit.state)) {
            const bestAutoTarget = findSlowAutoCastTarget(unit, this.units, slowDef.range, this.gameTime)
            if (bestAutoTarget) {
              const casted = this.castSlow(unit, bestAutoTarget)
              if (casted) {
                unit.slowAutoCastCooldownUntil = this.gameTime + Math.max(1, slowDef.cooldown ?? 0)
              }
            }
          }
        }
      }

      // Priest auto-heal
      if (unit.type !== 'priest' || unit.hp <= 0 || unit.isBuilding) continue
      const healDef = ABILITIES.priest_heal
      if (unit.mana < (healDef.cost.mana ?? 0)) continue
      if (this.gameTime < unit.healCooldownUntil) continue
      // Only auto-heal when in these states (not moving, gathering, building)
      if (!isCasterAutoCastState(unit.state)) continue

      const bestTarget = findPriestAutoHealTarget(unit, this.units, healDef.range)
      if (bestTarget) {
        this.castHeal(unit, bestTarget)
      }
    }
  }

  /**
   * Cast Heal: Priest heals a target friendly unit.
   *
   * Deducts mana, applies cooldown, heals the target.
   * Returns true if heal was cast successfully.
   */
  castHeal(priest: Unit, target: Unit): boolean {
    const healDef = ABILITIES.priest_heal
    const manaCost = healDef.cost.mana ?? 0
    if (priest.type !== 'priest') return false
    if (target.team !== priest.team) return false
    if (priest.mana < manaCost) return false
    if (this.gameTime < priest.healCooldownUntil) return false
    if (target.hp <= 0 || target.hp >= target.maxHp) return false
    if (priest.mesh.position.distanceTo(target.mesh.position) > healDef.range) return false

    priest.mana -= manaCost
    priest.healCooldownUntil = this.gameTime + healDef.cooldown

    const before = target.hp
    target.hp = Math.min(target.maxHp, target.hp + healDef.effectValue)
    const healed = target.hp - before

    // Visual feedback
    this.feedback.spawnDamageNumber(target, healed)
    this.feedback.spawnImpactRing(target.mesh.position)
    this.feedback.spawnAbilityEffectBurst({
      x: target.mesh.position.x,
      z: target.mesh.position.z,
      tone: 'heal',
      radius: 0.85,
    })
    this.playAudioCue('ability', '治疗')

    return true
  }

  /** Holy Light — Paladin heal (not self), uses learned level */
  private castHolyLight(paladin: Unit, target: Unit): boolean {
    const result = castPaladinHolyLight(paladin, target, this.gameTime)
    if (!result) return false

    this.feedback.spawnDamageNumber(target, result.healed)
    this.feedback.spawnImpactRing(target.mesh.position)
    this.feedback.spawnAbilityEffectBurst({
      x: target.mesh.position.x,
      z: target.mesh.position.z,
      tone: 'heal',
      radius: 1.0,
    })
    this.setAbilityFeedback(paladin, `圣光术 +${result.healed}`)
    this.playAudioCue('ability', '圣光术')

    return true
  }

  private setAbilityFeedback(unit: Unit, text: string, duration = 3) {
    unit.abilityFeedbackText = text
    unit.abilityFeedbackUntil = this.gameTime + duration
  }

  /** AI-safe Holy Light wrapper — delegates to private castHolyLight */
  aiCastHolyLight(caster: Unit, target: Unit): boolean {
    return this.castHolyLight(caster, target)
  }

  /** AI-safe Divine Shield wrapper — delegates to private castDivineShield */
  aiCastDivineShield(caster: Unit): boolean {
    return this.castDivineShield(caster)
  }

  /** AI-safe Resurrection wrapper — delegates to castResurrection */
  aiCastResurrection(caster: Unit): boolean {
    return this.castResurrection(caster)
  }

  /** AI-safe Water Elemental summon wrapper — delegates to castSummonWaterElemental */
  aiCastSummonWaterElemental(caster: Unit, targetX: number, targetZ: number): boolean {
    return this.castSummonWaterElemental(caster, targetX, targetZ)
  }

  /** AI-facing thin wrapper for Blizzard cast — delegates to existing runtime */
  aiCastBlizzard(caster: Unit, targetX: number, targetZ: number): boolean {
    const friendliesInZone = this.units.filter(unit => {
      if (unit === caster || unit.team !== caster.team || unit.hp <= 0 || unit.isBuilding) return false
      const dx = unit.mesh.position.x - targetX
      const dz = unit.mesh.position.z - targetZ
      return Math.sqrt(dx * dx + dz * dz) <= 3.0
    }).length
    if (friendliesInZone > 2) return false
    return this.castBlizzard(caster, targetX, targetZ)
  }

  /** AI-facing thin wrapper for Storm Bolt cast */
  aiCastStormBolt(caster: Unit, target: Unit): boolean {
    return this.castStormBolt(caster, target)
  }

  /** AI-facing thin wrapper for Thunder Clap cast */
  aiCastThunderClap(caster: Unit): boolean {
    return this.castThunderClap(caster)
  }

  /** AI-facing thin wrapper for Avatar cast */
  aiCastAvatar(caster: Unit): boolean {
    return this.castAvatar(caster)
  }

  /** Divine Shield — Paladin self-cast invulnerability, uses learned level */
  private castDivineShield(paladin: Unit): boolean {
    const ok = castPaladinDivineShield(paladin, this.gameTime)
    if (ok) {
      this.feedback.spawnAbilityEffectBurst({
        x: paladin.mesh.position.x,
        z: paladin.mesh.position.z,
        tone: 'shield',
        radius: 1.2,
        life: 1.1,
      })
      this.setAbilityFeedback(paladin, '神圣护盾')
      this.playAudioCue('ability', '神圣护盾')
    }
    return ok
  }

  /** Resurrection — Paladin ultimate: revive up to maxTargets dead friendly units */
  castResurrection(paladin: Unit): boolean {
    const result = castPaladinResurrection(paladin, this.deadUnitRecords, this.gameTime)
    if (!result) return false

    for (const rec of result.revivedRecords) {
      this.spawnUnit(rec.type, rec.team, rec.x - 0.5, rec.z - 0.5)
      this.feedback.spawnAbilityEffectBurst({
        x: rec.x,
        z: rec.z,
        tone: 'resurrection',
        radius: 0.95,
        life: 1.1,
      })
    }

    if (result.revivedRecords.length > 0) {
      this.feedback.spawnDamageNumber(paladin, result.revivedRecords.length)
      this.feedback.spawnAbilityEffectBurst({
        x: paladin.mesh.position.x,
        z: paladin.mesh.position.z,
        tone: 'resurrection',
        radius: 2.2,
        life: 1.2,
      })
      this.setAbilityFeedback(paladin, `复活 ${result.revivedRecords.length}`)
      this.playAudioCue('ability', '复活')
    }

    return true
  }

  private getResurrectionEligibleRecordIndices(
    paladin: Unit,
    levelData: { areaRadius?: number; maxTargets?: number },
  ): number[] {
    return getPaladinResurrectionEligibleRecordIndices(this.deadUnitRecords, paladin, levelData)
  }

  // === Water Elemental (HERO18-IMPL1) ===

  private castSummonWaterElemental(archmage: Unit, targetX: number, targetZ: number): boolean {
    const summon = resolveWaterElementalSummon(
      archmage,
      targetX,
      targetZ,
      this.gameTime,
      (tileX, tileZ) => this.pathingGrid.isBlocked(tileX, tileZ),
    )
    if (!summon) return false

    const we = this.spawnUnit('water_elemental', archmage.team, summon.targetX, summon.targetZ)
    applyWaterElementalSummonStats(we, summon)
    this.feedback.spawnDamageNumber(we, summon.levelData.summonedHp)
    this.feedback.spawnAbilityEffectBurst({
      x: summon.targetX,
      z: summon.targetZ,
      tone: 'summon',
      radius: 1.05,
      life: 1.0,
    })
    this.setAbilityFeedback(archmage, '水元素')
    this.playAudioCue('ability', '水元素')

    return true
  }

  // === Blizzard cast (HERO20-IMPL1) ===

  /** Cast Blizzard at target position */
  private castBlizzard(archmage: Unit, targetX: number, targetZ: number): boolean {
    const channel = castArchmageBlizzard(
      archmage,
      targetX,
      targetZ,
      this.gameTime,
      this.blizzardChannel?.caster === archmage,
    )
    if (!channel) return false
    this.blizzardChannel = channel

    // Create AOE indicator ring at target (HERO20-UX1)
    this.removeBlizzardAoeRing()
    const radius = channel.levelData.areaRadius ?? 2.0
    const ringGeo = new THREE.RingGeometry(radius - 0.15, radius, 32)
    ringGeo.rotateX(-Math.PI / 2)
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0x66ccff, side: THREE.DoubleSide, transparent: true, opacity: 0.5,
      depthTest: false,
    })
    const ring = new THREE.Mesh(ringGeo, ringMat)
    const h = this.getWorldHeight(channel.targetX, channel.targetZ) + 0.08
    ring.position.set(channel.targetX, h, channel.targetZ)
    ring.renderOrder = 998
    this.scene.add(ring)
    this.blizzardAoeRing = ring
    this.feedback.spawnAbilityEffectBurst({
      x: channel.targetX,
      z: channel.targetZ,
      tone: 'area',
      radius,
      opacity: 0.58,
      life: 1.0,
    })
    this.setAbilityFeedback(archmage, '暴风雪引导')
    this.playAudioCue('ability', '暴风雪')

    return true
  }

  /** Update active Blizzard channel: execute waves */
  private updateBlizzardChannel() {
    if (!this.blizzardChannel) return
    const ch = this.blizzardChannel

    // Stop if caster is dead
    if (ch.caster.isDead || ch.caster.hp <= 0) {
      this.blizzardChannel = null
      this.removeBlizzardAoeRing()
      return
    }

    // Execute waves as their time arrives
    while (this.gameTime >= ch.nextWaveTime && ch.wavesRemaining > 0) {
      this.executeBlizzardWave(ch)
      ch.wavesRemaining -= 1
      ch.nextWaveTime += ch.waveInterval
    }

    // Channel complete
    if (ch.wavesRemaining <= 0) {
      this.blizzardChannel = null
      this.removeBlizzardAoeRing()
    }
  }

  /** Execute a single Blizzard wave at channel target */
  private executeBlizzardWave(ch: { caster: Unit; targetX: number; targetZ: number; levelData: HeroAbilityLevelDef }) {
    const radius = ch.levelData.areaRadius ?? 2.0
    const maxTargets = ch.levelData.maxTargets ?? 5
    const damage = ch.levelData.effectValue
    const buildingMult = ch.levelData.buildingDamageMultiplier ?? 1

    const targets = selectBlizzardWaveTargets(
      this.units,
      ch.caster,
      ch.targetX,
      ch.targetZ,
      radius,
      maxTargets,
      this.gameTime,
    )

    for (const target of targets) {
      const finalDamage = getBlizzardWaveDamage(target, damage, buildingMult)
      target.hp = Math.max(0, target.hp - finalDamage)
      this.feedback.flashHit(target)
      this.feedback.spawnDamageNumber(target, -finalDamage)
    }

    // Spawn impact ring at wave center (HERO20-UX1)
    this.feedback.spawnImpactRing(new THREE.Vector3(ch.targetX, 0, ch.targetZ))
    this.feedback.spawnAbilityEffectBurst({
      x: ch.targetX,
      z: ch.targetZ,
      tone: 'area',
      radius,
      opacity: 0.48,
      life: 0.55,
    })
  }

  /** Interrupt active Blizzard channel for a given caster */
  private interruptBlizzardChannel(caster: Unit) {
    if (this.blizzardChannel && this.blizzardChannel.caster === caster) {
      this.blizzardChannel = null
      this.removeBlizzardAoeRing()
    }
  }

  /** Remove the Blizzard AOE indicator ring (HERO20-UX1) */
  private removeBlizzardAoeRing() {
    if (this.blizzardAoeRing) {
      this.scene.remove(this.blizzardAoeRing)
      this.blizzardAoeRing.geometry.dispose()
      ;(this.blizzardAoeRing.material as THREE.Material).dispose()
      this.blizzardAoeRing = null
    }
  }

  /** Blizzard ground-target mode: enter */
  private enterBlizzardTargetMode(caster: Unit) {
    this.enterHeroTargetMode('blizzard', caster, '暴风雪 — 左键点击目标位置，右键/Esc取消')
  }

  /** Blizzard ground-target mode: handle click */
  private handleBlizzardTargetClick() {
    if (!this.blizzardTargetCaster) return false
    this.raycaster.setFromCamera(this.mouseNDC, this.camera)
    const target = this.resolvePointerGroundPoint()
    if (!target) {
      this.showHeroTargetInvalid(this.blizzardTargetCaster, '暴风雪：没有选中地面')
      return false
    }
    const ok = this.castBlizzard(this.blizzardTargetCaster, target.x, target.z)
    if (!ok) {
      this.showHeroTargetInvalid(this.blizzardTargetCaster, '暴风雪：目标超出距离、法力不足或正在冷却')
    }
    return ok
  }

  // ==================== Mass Teleport (HERO21-IMPL1) ====================

  /** Cast Mass Teleport: start delayed teleport to a friendly unit/building target */
  private castMassTeleport(caster: Unit, targetUnit: Unit): boolean {
    const pending = resolveMassTeleport(
      caster,
      targetUnit,
      this.gameTime,
      this.massTeleportPending?.caster === caster,
    )
    if (!pending) return false
    this.massTeleportPending = pending
    this.feedback.spawnAbilityEffectBurst({
      x: caster.mesh.position.x,
      z: caster.mesh.position.z,
      tone: 'teleport',
      radius: pending.levelData.areaRadius ?? 7.0,
      opacity: 0.24,
      life: 1.0,
    })
    this.setAbilityFeedback(caster, '群体传送准备')
    this.playAudioCue('ability', '群体传送准备')
    return true
  }

  /** Update Mass Teleport pending state: check completion and interrupts */
  private updateMassTeleportPending() {
    if (!this.massTeleportPending) return
    const p = this.massTeleportPending

    // Interrupt: caster death
    if (p.caster.isDead || p.caster.hp <= 0) {
      this.massTeleportPending = null
      return
    }

    // Interrupt: target invalid or dead at completion check
    if (p.targetUnit.isDead || p.targetUnit.hp <= 0 || !p.targetUnit.mesh?.position) {
      this.massTeleportPending = null
      return
    }

    // Check if delay has completed
    if (this.gameTime >= p.completeTime) {
      this.executeMassTeleport(p)
      this.massTeleportPending = null
    }
  }

  /** Execute the teleport: move caster and nearby units to target position */
  private executeMassTeleport(p: { caster: Unit; targetUnit: Unit; levelData: HeroAbilityLevelDef }) {
    const { caster, targetUnit, levelData } = p
    const targetPos = targetUnit.mesh.position
    const radius = levelData.areaRadius ?? 7.0
    const maxTargets = levelData.maxTargets ?? 24

    const transported = selectMassTeleportTransportedUnits(this.units, caster, radius, maxTargets)
    if (transported.length === 0) return

    // Place units around target using deterministic non-overlap offsets
    const placed: { x: number; z: number }[] = []
    // Reserve the target unit's position
    placed.push({ x: targetPos.x, z: targetPos.z })

    for (const u of transported) {
      const pos = findMassTeleportPlacement(targetPos.x, targetPos.z, placed, targetUnit)
      const h = this.getWorldHeight(pos.x, pos.z)
      u.mesh.position.set(pos.x, h, pos.z)
      placed.push(pos)
      // Clear move target so unit doesn't walk back
      u.moveTarget = null
      u.waypoints = []
      u.moveQueue = []
      // Reset state to Idle
      if (u.state !== UnitState.Idle) {
        u.state = UnitState.Idle
      }
      u.attackTarget = null
    }

    // Lightweight completion feedback: impact ring at target position
    this.feedback.spawnImpactRing(targetPos)
    this.feedback.spawnAbilityEffectBurst({
      x: targetPos.x,
      z: targetPos.z,
      tone: 'teleport',
      radius: 1.7,
      life: 1.0,
    })
    this.setAbilityFeedback(caster, `群体传送 ${transported.length}`)
    this.playAudioCue('ability', '群体传送')
  }

  /** Interrupt pending Mass Teleport (on stop/move/another command) */
  private interruptMassTeleportPending(caster: Unit) {
    if (this.massTeleportPending && this.massTeleportPending.caster === caster) {
      this.massTeleportPending = null
    }
  }

  /** Mass Teleport unit-target mode: enter */
  private enterMassTeleportTargetMode(caster: Unit) {
    this.enterHeroTargetMode('massTeleport', caster, '群体传送 — 左键点击友方单位或建筑，右键/Esc取消')
  }

  /** Mass Teleport unit-target mode: handle click on a friendly unit/building */
  private handleMassTeleportTargetClick() {
    if (!this.massTeleportTargetCaster) return false
    this.raycaster.setFromCamera(this.mouseNDC, this.camera)
    const hitUnit = this.resolvePointerAbilityTargetUnit(this.resolvePointerGroundPoint())
    if (!hitUnit) {
      this.showHeroTargetInvalid(this.massTeleportTargetCaster, '群体传送：请选择友方单位或建筑')
      return false
    }
    const ok = this.castMassTeleport(this.massTeleportTargetCaster, hitUnit)
    if (!ok) {
      this.showHeroTargetInvalid(this.massTeleportTargetCaster, '群体传送：目标非法、法力不足或正在冷却')
    }
    return ok
  }

  /** Slow — Sorceress speed debuff on enemy */
  castSlow(caster: Unit, target: Unit): boolean {
    const slowDef = ABILITIES.slow
    const manaCost = slowDef.cost.mana ?? 0
    if (caster.type !== 'sorceress') return false
    if (target.team === caster.team) return false
    if (target.hp <= 0) return false
    if (target.isBuilding) return false
    if (caster.mana < manaCost) return false
    if (caster.mesh.position.distanceTo(target.mesh.position) > slowDef.range) return false

    caster.mana -= manaCost

    // Apply or refresh slow debuff without mutating the base speed. Other systems
    // such as Defend and Militia still own unit.speed.
    target.slowUntil = this.gameTime + slowDef.duration
    target.slowSpeedMultiplier = slowDef.speedMultiplier ?? 1

    this.feedback.spawnImpactRing(target.mesh.position)
    this.feedback.spawnAbilityEffectBurst({
      x: target.mesh.position.x,
      z: target.mesh.position.z,
      tone: 'debuff',
      radius: 0.8,
    })
    this.playAudioCue('ability', '减速')
    return true
  }

  /** Update slow expiry — restore speed when debuff ends */
  private updateSlowExpiry() {
    for (const unit of this.units) {
      if (unit.slowUntil > 0 && unit.slowUntil <= this.gameTime) {
        unit.slowUntil = 0
        unit.slowSpeedMultiplier = 1
      }
      if (unit.attackSlowUntil > 0 && unit.attackSlowUntil <= this.gameTime) {
        unit.attackSlowUntil = 0
        unit.attackSpeedMultiplier = 1
      }
    }
  }

  // ==================== Storm Bolt (HERO23-IMPL1) ====================

  /** Cast Storm Bolt: validate, deduct mana, start cooldown, launch projectile */
  private castStormBolt(caster: Unit, target: Unit): boolean {
    const projectile = resolveStormBolt(caster, target, this.gameTime)
    if (!projectile) return false
    this.stormBoltProjectiles.push(projectile)
    this.feedback.spawnAbilityEffectBurst({
      x: caster.mesh.position.x,
      z: caster.mesh.position.z,
      tone: 'stun',
      radius: 0.95,
    })
    this.setAbilityFeedback(caster, '风暴之锤')
    this.playAudioCue('ability', '风暴之锤')
    return true
  }

  /** Storm Bolt unit-target mode: enter */
  private enterStormBoltTargetMode(caster: Unit) {
    this.enterHeroTargetMode('stormBolt', caster, '风暴之锤 — 左键点击敌方单位，右键/Esc取消')
  }

  /** Cast Thunder Clap: instant self-centered AOE damage and slow */
  private castThunderClap(caster: Unit): boolean {
    const result = resolveThunderClap(caster, this.units, this.gameTime)
    if (!result) return false

    this.feedback.spawnImpactRing(caster.mesh.position)
    this.feedback.spawnAbilityEffectBurst({
      x: caster.mesh.position.x,
      z: caster.mesh.position.z,
      tone: 'area',
      radius: result.levelData.areaRadius ?? 3.0,
      opacity: 0.62,
      life: 1.0,
    })
    for (const impact of result.impacts) {
      this.feedback.spawnDamageNumber(impact.target, -impact.damage)
      this.feedback.spawnImpactRing(impact.target.mesh.position)
    }
    this.setAbilityFeedback(caster, `雷霆一击 ${result.impacts.length}`)
    this.playAudioCue('ability', '雷霆一击')
    return true
  }

  /** Cast Avatar: Mountain King self-buff ultimate */
  private castAvatar(caster: Unit): boolean {
    const result = resolveAvatar(caster, this.gameTime)
    if (!result) return false

    this.feedback.spawnImpactRing(caster.mesh.position)
    this.feedback.spawnDamageNumber(caster, result.levelData.hpBonus ?? 0)
    this.feedback.spawnAbilityEffectBurst({
      x: caster.mesh.position.x,
      z: caster.mesh.position.z,
      tone: 'buff',
      radius: 1.3,
      life: 1.2,
    })
    this.setAbilityFeedback(caster, '化身')
    this.playAudioCue('ability', '化身')
    return true
  }

  /** Storm Bolt unit-target mode: handle click */
  private handleStormBoltTargetClick() {
    if (!this.stormBoltTargetCaster) return false
    this.raycaster.setFromCamera(this.mouseNDC, this.camera)
    const hitUnit = this.resolvePointerAbilityTargetUnit(this.resolvePointerGroundPoint())
    if (!hitUnit) {
      this.showHeroTargetInvalid(this.stormBoltTargetCaster, '风暴之锤：请选择敌方非建筑单位')
      return false
    }
    const ok = this.castStormBolt(this.stormBoltTargetCaster, hitUnit)
    if (!ok) {
      this.showHeroTargetInvalid(this.stormBoltTargetCaster, '风暴之锤：目标非法、超出距离、法力不足或正在冷却')
    }
    return ok
  }

  /** Update Storm Bolt projectiles: apply damage/stun on hit */
  private updateStormBoltProjectiles() {
    if (this.stormBoltProjectiles.length === 0) return
    const remaining = []
    for (const proj of this.stormBoltProjectiles) {
      if (this.gameTime < proj.hitTime) {
        remaining.push(proj)
        continue
      }
      const impact = resolveStormBoltImpact(proj, this.gameTime)
      if (!impact) continue
      this.feedback.spawnDamageNumber(impact.target, -impact.damage)
      this.feedback.spawnImpactRing(impact.target.mesh.position)
      this.feedback.spawnAbilityEffectBurst({
        x: impact.target.mesh.position.x,
        z: impact.target.mesh.position.z,
        tone: 'stun',
        radius: 0.9,
      })
    }
    this.stormBoltProjectiles = remaining
  }

  /** Update stun expiry — clear stun state when duration ends */
  private updateStunExpiry() {
    for (const unit of this.units) {
      if (unit.stunUntil > 0 && unit.stunUntil <= this.gameTime) {
        unit.stunUntil = 0
      }
    }
  }

  /** Update Avatar expiry — remove temporary stats when the ultimate ends */
  private updateAvatarExpiry() {
    for (const unit of this.units) {
      expireAvatar(unit, this.gameTime)
    }
  }

  /** Update Devotion Aura — apply/remove passive armor bonus */
  private updateDevotionAura() {
    updateDevotionAuraBonuses(this.units)
  }

  /** Update Brilliance Aura — apply passive mana regen bonus (HERO19-IMPL1) */
  private updateBrillianceAura() {
    updateBrillianceAuraBonuses(this.units)
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
      finishAttackMoveOrder(unit)
    }
  }

  /** 攻击移动：目标丢失或追击后恢复向 attackMoveTarget 前进 */
  private resumeAttackMove(unit: Unit) {
    if (unit.attackMoveTarget) {
      this.planAttackMovePath(unit, unit.attackMoveTarget)
    } else {
      finishAttackMoveOrder(unit)
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
      unit.goldLoopSlotMine = null
      unit.goldStandMine = null
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
      if (!isResourceTargetValid(unit)) {
        // 资源目标已失效，尝试找新资源
        if (unit.gatherType) {
          this.startGatherNearest(unit)
        } else {
          unit.state = UnitState.Idle
          clearGatherTarget(unit)
        }
      }
    }

    // 清除 previous 快照（已恢复）
    clearPreviousUnitOrder(unit)
  }

  /**
   * 执行队列中的命令
   *
   * 从 moveQueue 弹出后，根据命令类型设置正确的状态和路径。
   * 这是所有队列命令的统一消费者。
   */
  private executeQueuedCommand(unit: Unit, cmd: QueuedCommand) {
    executeQueuedMovementCommand(unit, cmd, {
      planMove: (targetUnit, target) => { this.planPath(targetUnit, target) },
      planAttackMove: (targetUnit, target) => { this.planAttackMovePath(targetUnit, target) },
    })
  }

  setDefend(unit: Unit, active: boolean): boolean {
    const defend = ABILITIES.defend
    const isDefendOwner = Array.isArray(defend.ownerType)
      ? defend.ownerType.includes(unit.type)
      : unit.type === defend.ownerType
    if (!isDefendOwner || unit.isBuilding || unit.hp <= 0) return false

    unit.defendActive = active
    const baseSpeed = UNITS[unit.type]?.speed ?? unit.speed
    unit.speed = active
      ? baseSpeed * (defend.speedMultiplier ?? 1)
      : baseSpeed
    return true
  }

  toggleDefend(unit: Unit): boolean {
    return this.setDefend(unit, !unit.defendActive)
  }

  /** 计算伤害（含攻击类型倍率 + 护甲减伤 + AOE 溅射）*/
  private dealDamage(attacker: Unit, target: Unit) {
    const damage = resolveDirectAttackDamage(attacker, target, this.gameTime)
    if (!damage) return
    const finalDamage = damage.finalDamage
    target.hp -= finalDamage

    // AOE splash for Siege attack type (mortar team)
    if (shouldApplyMortarSplash(damage)) {
      this.dealAoeSplash(attacker, target, damage.rawDamage, damage.attackType)
    }

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

    const bash = resolveBashProc(attacker, target, this.gameTime)
    if (bash) {
      this.feedback.flashHit(target)
      this.feedback.spawnImpactRing(target.mesh.position)
      this.feedback.spawnDamageNumber(target, bash.bonusDamage)
      this.setAbilityFeedback(attacker, '猛击')
    }

    // 血条闪烁反馈（短暂提亮血条边框）
    this.healthBarRenderer.flashHit(target)
    this.playAudioCue('combat', '命中')
  }

  /**
   * AOE splash damage for siege units.
   *
   * Applies reduced damage to all enemy units within the Mortar AOE ability
   * radius, using linear distance-based falloff. The primary target is excluded
   * (already took full damage). Goldmine units are filtered out.
   */
  private dealAoeSplash(attacker: Unit, primaryTarget: Unit, rawDamage: number, atkType: AttackType) {
    for (const application of getMortarSplashApplications(this.units, attacker, primaryTarget, rawDamage, atkType)) {
      application.target.hp -= application.damage
      // Visual feedback for splash victims
      this.feedback.flashHit(application.target)
      this.feedback.spawnDamageNumber(application.target, application.damage)
    }
  }

  /** 自动反击：侦测附近的敌人 */
  private updateAutoAggro() {
    for (const unit of this.units) {
      if (!shouldAutoAggroUnit(unit, this.gameTime)) continue

      // 搜索最近的敌方单位
      const nearestEnemy = findNearestEnemyTarget({
        units: this.units,
        source: unit,
        maxDistance: AGGRO_RANGE,
        shouldIgnore: (source, target) => this.shouldIgnoreOpeningWorkerAggro(source, target),
      })
      if (nearestEnemy) {
        beginAutoAggro(unit, nearestEnemy)
      }
    }
  }

  private shouldIgnoreOpeningWorkerAggro(unit: Unit, other: Unit): boolean {
    return shouldIgnoreOpeningWorkerAggroRule(unit, other, this.gameTime, AI_WORKER_HARASS_GRACE_TIME)
  }

  // ==================== 血条 ====================

  /** 创建血条（war3 风格：金色边框 + 暗底 + 彩色填充）*/
  private createHealthBar(unit: Unit) {
    this.healthBarRenderer.create(unit)
  }

  /** 更新所有血条位置和填充 */
  private updateHealthBars() {
    this.healthBarRenderer.update(this.units)
  }

  // ==================== 召唤单位到期处理 ====================

  private handleSummonExpirations() {
    const expired = this.units.filter(u =>
      u.summonExpireAt > 0 && this.gameTime >= u.summonExpireAt && u.hp > 0,
    )
    for (const summon of expired) {
      // Remove without entering deadUnitRecords (summons don't leave corpses)
      summon.hp = 0 // Mark for cleanup below
    }
    // Clean up expired summons like normal deaths (but skip deadUnitRecords)
    if (expired.length > 0) {
      const expiredSet = new Set(expired)
      for (const unit of expired) {
        const selIdx = this.selectedUnits.indexOf(unit)
        if (selIdx >= 0) {
          this.selectionModel.remove(unit)
          this.sel.removeSelectionRingAt(selIdx)
        }
        for (const other of this.units) {
          if (other === unit) continue
          if (other.attackTarget === unit) {
            other.attackTarget = null
            if (other.state === UnitState.AttackMove) {
              this.resumeAttackMove(other)
            } else {
              this.restorePreviousOrder(other)
            }
          }
        }
        this.healthBarRenderer.remove(unit)
        const oi = this.outlineObjects.indexOf(unit.mesh)
        if (oi >= 0) this.outlineObjects.splice(oi, 1)
        disposeObject3DDeep(unit.mesh)
        this.scene.remove(unit.mesh)
      }
      this.units = this.units.filter(u => !expiredSet.has(u))
    }
  }

  // ==================== 死亡处理 ====================

  private handleDeadUnits() {
    const dead = this.units.filter((u) => u.hp <= 0 && u.type !== 'goldmine')
    if (dead.length === 0) return

    // Separate heroes from normal dead units
    const deadHeroes = dead.filter(u => !u.isBuilding && UNITS[u.type]?.isHero)
    const newlyDeadHeroes = deadHeroes.filter(hero => !hero.isDead)
    const normalDead = dead.filter(u => !deadHeroes.includes(u))
    if (newlyDeadHeroes.length + normalDead.length > 0) {
      this.playAudioCue('death', `死亡 ${newlyDeadHeroes.length + normalDead.length}`)
    }
    for (const hero of deadHeroes) {
      if (hero.isDead) continue // already processed
      recordUnitDeath(this.matchTelemetry, hero)
      expireAvatar(hero, this.gameTime, true)
      hero.hp = 0
      hero.isDead = true
      clearActiveUnitOrder(hero)
      // Hide visual
      hero.mesh.visible = false
    }

    // Clear attack/build refs pointing at dead heroes (same as normal cleanup below)
    for (const hero of deadHeroes) {
      const selIdx = this.selectionModel.contains(hero) ? this.selectedUnits.indexOf(hero) : -1
      if (selIdx >= 0) {
        this.selectionModel.remove(hero)
        this.sel.removeSelectionRingAt(selIdx)
      }
      for (const other of this.units) {
        if (other === hero) continue
        if (other.attackTarget === hero) {
          other.attackTarget = null
          if (other.state === UnitState.AttackMove) {
            this.resumeAttackMove(other)
          } else {
            this.restorePreviousOrder(other)
          }
        }
      }
      // Remove health bar
      this.healthBarRenderer.remove(hero)
      const oi = this.outlineObjects.indexOf(hero.mesh)
      if (oi >= 0) this.outlineObjects.splice(oi, 1)
    }

    // Normal dead units (non-heroes)
    const deadSet = new Set(normalDead)
    for (const unit of normalDead) {
      recordUnitDeath(this.matchTelemetry, unit)
    }

    for (const unit of normalDead) {
      if (unit.isBuilding) continue
      const uDef = UNITS[unit.type]
      if (!uDef || uDef.isHero) continue
      const unitLevel = uDef.unitLevel ?? 1
      const baseXp = HERO_XP_RULES.normalUnitXpByLevel[unitLevel] ?? HERO_XP_RULES.normalUnitXpByLevel[1] ?? 0
      let xpGain = baseXp
      let hero: Unit | undefined

      if (unit.team === 0 || unit.team === 1) {
        const opposingTeam = unit.team === 0 ? 1 : 0
        hero = this.units.find(
          u => u.team === opposingTeam && !u.isBuilding && UNITS[u.type]?.isHero && !u.isDead && u.hp > 0,
        )
      } else if (uDef.isCreep) {
        hero = this.findNearestLivingHero(unit, 14)
        const heroLevel = hero?.heroLevel ?? 1
        const rateLevel = Math.min(heroLevel, 5)
        const rate = HERO_XP_RULES.creepXpRateByHeroLevel[rateLevel] ?? 0
        xpGain = Math.floor(baseXp * rate)
      } else {
        continue
      }

      if (xpGain <= 0) continue
      if (!hero) continue
      addHeroXp(hero, xpGain)
    }

    // HERO14/16: record Resurrection-eligible dead units before mesh disposal.
    // Keep this to controllable player/AI teams; neutral/creep corpses remain deferred.
    for (const unit of normalDead) {
      if (unit.isBuilding) continue
      if (unit.team !== 0 && unit.team !== 1) continue
      const uDef = UNITS[unit.type]
      if (!uDef || uDef.isHero) continue
      this.deadUnitRecords.push({
        team: unit.team,
        type: unit.type,
        x: unit.mesh.position.x,
        z: unit.mesh.position.z,
        diedAt: this.gameTime,
      })
    }

    for (const unit of normalDead) {
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
          other.goldLoopSlotMine = null
          other.goldStandMine = null
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
      if (UNITS[unit.type]?.isCreep) {
        const itemType: WorldItem['type'] = unit.type === 'ogre_warrior'
          ? 'healing_potion'
          : 'tome_of_experience'
        this.dropWorldItem(itemType, unit.mesh.position)
      }
      this.healthBarRenderer.remove(unit)
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

  private findNearestLivingHero(source: Unit, maxDistance: number): Unit | undefined {
    let best: Unit | undefined
    let bestDistance = maxDistance
    for (const unit of this.units) {
      if (unit.team !== 0 && unit.team !== 1) continue
      if (unit.isBuilding || unit.isDead || unit.hp <= 0) continue
      if (!UNITS[unit.type]?.isHero) continue
      const distance = unit.mesh.position.distanceTo(source.mesh.position)
      if (distance <= bestDistance) {
        best = unit
        bestDistance = distance
      }
    }
    return best
  }

  private dropWorldItem(type: WorldItem['type'], position: THREE.Vector3): WorldItem {
    const group = createItemVisual(type)
    group.position.set(position.x, this.getWorldHeight(position.x, position.z), position.z)
    group.userData.itemType = type
    this.scene.add(group)

    const item = {
      id: this.nextWorldItemId++,
      type,
      mesh: group,
    }
    this.worldItems.push(item)
    return item
  }

  private updateWorldItemPickups() {
    if (this.worldItems.length === 0) return
    const picked = new Set<WorldItem>()
    for (const item of this.worldItems) {
      const hero = this.units.find(unit =>
        (unit.team === 0 || unit.team === 1) &&
        !unit.isBuilding &&
        !unit.isDead &&
        unit.hp > 0 &&
        !!UNITS[unit.type]?.isHero &&
        unit.mesh.position.distanceTo(item.mesh.position) <= 1.25,
      )
      if (!hero) continue

      if (!this.collectWorldItem(hero, item.type)) continue
      picked.add(item)
    }

    if (picked.size === 0) return
    for (const item of picked) {
      this.scene.remove(item.mesh)
      disposeObject3DDeep(item.mesh)
    }
    this.worldItems = this.worldItems.filter(item => !picked.has(item))
  }

  private clearWorldItems() {
    if (this.worldItems.length === 0) {
      this.nextWorldItemId = 1
      return
    }

    for (const item of this.worldItems) {
      this.scene.remove(item.mesh)
      disposeObject3DDeep(item.mesh)
    }
    this.worldItems = []
    this.nextWorldItemId = 1
  }

  private collectWorldItem(hero: Unit, itemKey: ItemKey): boolean {
    const item = ITEMS[itemKey]
    if (!item) return false

    if (item.kind === 'instant') {
      if (item.xpAmount) {
        addHeroXp(hero, item.xpAmount)
        this.setAbilityFeedback(hero, `拾取 ${item.name} +${item.xpAmount}XP`)
      }
      recordItemCollected(this.matchTelemetry, hero.team)
      this.playAudioCue('shop', `拾取 ${item.name}`)
      return true
    }

    if (!this.addHeroInventoryItem(hero, itemKey)) return false
    this.setAbilityFeedback(hero, `拾取 ${item.name}`)
    recordItemCollected(this.matchTelemetry, hero.team)
    this.playAudioCue('shop', `拾取 ${item.name}`)
    return true
  }

  private addHeroInventoryItem(hero: Unit, itemKey: ItemKey): boolean {
    if (hero.isDead || hero.hp <= 0 || !UNITS[hero.type]?.isHero) return false
    if ((hero.inventoryItems?.length ?? 0) >= HERO_INVENTORY_MAX_ITEMS) return false
    const item = ITEMS[itemKey]
    if (!item) return false
    if (item.kind === 'passive' && hero.inventoryItems.includes(itemKey)) return false

    hero.inventoryItems.push(itemKey)
    if (item.kind === 'passive') {
      this.applyHeroPassiveItem(hero, itemKey)
    }
    return true
  }

  private applyHeroPassiveItem(hero: Unit, itemKey: ItemKey) {
    const item = ITEMS[itemKey]
    if (!item) return
    if (item.speedBonus) {
      hero.speed += item.speedBonus
      this.setAbilityFeedback(hero, `${item.name} 速度+${item.speedBonus}`)
    }
  }

  private findShopPurchaseHero(shop: Unit): Unit | null {
    let best: Unit | null = null
    let bestDistance = SHOP_PURCHASE_RANGE

    for (const unit of this.units) {
      if (unit.team !== shop.team) continue
      if (unit.isBuilding || unit.isDead || unit.hp <= 0) continue
      if (!UNITS[unit.type]?.isHero) continue

      const distance = unit.mesh.position.distanceTo(shop.mesh.position)
      if (distance <= bestDistance) {
        best = unit
        bestDistance = distance
      }
    }

    return best
  }

  private getShopItemAvailability(shop: Unit, itemKey: ItemKey): { ok: boolean; reason: string } {
    const item = ITEMS[itemKey]
    if (!item || !item.purchasable) return { ok: false, reason: '不可购买' }
    if (!shop.isBuilding || shop.buildProgress < 1 || shop.hp <= 0) return { ok: false, reason: '商店未就绪' }

    const costReason = checkCostBlockReason(this.resources, shop.team, item.cost)
    if (costReason) return { ok: false, reason: costReason }

    const hero = this.findShopPurchaseHero(shop)
    if (!hero) return { ok: false, reason: '需要英雄靠近' }
    if ((hero.inventoryItems?.length ?? 0) >= HERO_INVENTORY_MAX_ITEMS) return { ok: false, reason: '背包已满' }
    if (item.kind === 'passive' && hero.inventoryItems.includes(itemKey)) return { ok: false, reason: '已拥有' }

    return { ok: true, reason: '' }
  }

  public getResearchAvailability(researchKey: string, team = 0) {
    return checkResearchAvailability(this.units, this.resources, researchKey, team)
  }

  private purchaseShopItem(shop: Unit, itemKey: ItemKey): boolean {
    const availability = this.getShopItemAvailability(shop, itemKey)
    if (!availability.ok) return false

    const item = ITEMS[itemKey]
    const hero = this.findShopPurchaseHero(shop)
    if (!item || !hero) return false

    this.resources.spend(shop.team, item.cost)
    if (!this.addHeroInventoryItem(hero, itemKey)) return false
    this.setAbilityFeedback(hero, `购买 ${item.name}`)
    recordItemPurchased(this.matchTelemetry, shop.team)
    this.playAudioCue('shop', `购买 ${item.name}`)
    return true
  }

  private useInventoryItem(hero: Unit, index: number): boolean {
    if (hero.isDead || hero.hp <= 0) return false
    const itemType = hero.inventoryItems[index]
    if (!itemType) return false
    const item = ITEMS[itemType as ItemKey]
    if (!item || item.kind !== 'consumable') return false

    if (item.townPortal) {
      if (!this.castTownPortal(hero)) return false
      hero.inventoryItems.splice(index, 1)
      recordItemUsed(this.matchTelemetry, hero.team)
      this.setAbilityFeedback(hero, `使用 ${item.name}`)
      this.playAudioCue('portal', `使用 ${item.name}`)
      return true
    }

    if (item.healAmount) {
      if (hero.hp >= hero.maxHp) return false
      const before = hero.hp
      hero.hp = Math.min(hero.maxHp, hero.hp + item.healAmount)
      const healed = hero.hp - before
      hero.inventoryItems.splice(index, 1)
      recordItemUsed(this.matchTelemetry, hero.team)
      this.feedback.spawnDamageNumber(hero, healed)
      this.setAbilityFeedback(hero, `使用 ${item.name} +${healed}`)
      this.playAudioCue('shop', `使用 ${item.name}`)
      return true
    }

    if (item.manaAmount) {
      if (hero.mana >= hero.maxMana) return false
      const before = hero.mana
      hero.mana = Math.min(hero.maxMana, hero.mana + item.manaAmount)
      const restored = Math.floor(hero.mana - before)
      hero.inventoryItems.splice(index, 1)
      recordItemUsed(this.matchTelemetry, hero.team)
      this.feedback.spawnDamageNumber(hero, restored)
      this.setAbilityFeedback(hero, `使用 ${item.name} +${restored}MP`)
      this.playAudioCue('shop', `使用 ${item.name}`)
      return true
    }

    return false
  }

  private castTownPortal(hero: Unit): boolean {
    const hall = this.units.find(unit =>
      unit.team === hero.team &&
      unit.isBuilding &&
      isMainHallType(unit.type) &&
      unit.hp > 0 &&
      unit.buildProgress >= 1,
    )
    if (!hall) return false

    const source = hero.mesh.position.clone()
    const allies = this.units.filter(unit =>
      unit.team === hero.team &&
      !unit.isBuilding &&
      unit.hp > 0 &&
      !unit.isDead &&
      unit.mesh.position.distanceTo(source) <= 7,
    )
    allies.forEach((unit, index) => {
      const angle = (index / Math.max(1, allies.length)) * Math.PI * 2
      const radius = unit === hero ? 2.0 : 2.6 + (index % 3) * 0.45
      const x = hall.mesh.position.x + Math.cos(angle) * radius
      const z = hall.mesh.position.z + Math.sin(angle) * radius
      unit.mesh.position.set(x, this.getWorldHeight(x, z), z)
      unit.moveTarget = null
      unit.waypoints = []
      unit.moveQueue = []
      unit.attackTarget = null
      unit.state = UnitState.Idle
    })
    this.feedback.playBuildCompleteEffect(hall)
    this.updateModeHint(`回城：${allies.length}个单位返回基地`)
    this.playAudioCue('portal', `回城 ${allies.length}`)
    return true
  }

  // ==================== 胜利/失败检测 ====================

  /** 检查胜利/失败条件：一方主基地全毁则判负 */
  private checkGameOver() {
    if (this.gameOverResult) return

    const outcome = getMatchOutcome(this.units, this.gameTime, Game.STALL_VERDICT_SECONDS)
    if (outcome) this.endGame(outcome)
  }

  private endGame(result: MatchResult) {
    this.cancelAllModes()
    this.resetTransientInputState()
    this.clearHeldCameraInputs()
    this.gameOverResult = result
    this.phase.set(Phase.GameOver)

    // Show end-state HUD overlay
    this.elGameOverOverlay.style.display = 'flex'
    this.elGameOverOverlay.classList.add(result)
    const label = result === 'victory' ? '胜利' : result === 'defeat' ? '失败' : '僵局'
    this.elGameOverText.textContent = label
    this.elResultsShellMessage.textContent = label
    this.playAudioCue('result', `战斗结果：${label}`)

    const aiPressure = this.getAIPressureSnapshot()
    const objectives = this.buildCurrentSkirmishObjectives(aiPressure)
    this.elResultsShellSummary.textContent = formatMatchResultSummary({
      result,
      gameTime: this.gameTime,
      units: this.units,
      telemetry: this.matchTelemetry,
      objectives,
      aiPressure,
    })
    this.renderResultPresentation(this.getResultPresentationSnapshot())

    this.renderObjectiveTracker(true)
    this.renderPressureTracker(true)
    this.renderMapObjectiveRadar(true)
    this.renderWar3IdentityStatus(true)
    this.renderHumanRoutePanel(true)
    this.renderMilestoneStatusPanel(true)
    this.renderPlaytestReadinessPanel(true)
    this.syncSessionOverlays()
  }

  private clearResultPresentation() {
    this.elResultsVisualSummary?.setAttribute('data-complete', 'false')
    this.elResultsStatGrid?.replaceChildren()
    this.elResultsObjectiveRecap?.replaceChildren()
    this.elResultsFlowRecap?.replaceChildren()
  }

  private renderResultPresentation(snapshot: ResultPresentationSnapshot) {
    if (!this.elResultsVisualSummary || !this.elResultsStatGrid || !this.elResultsObjectiveRecap || !this.elResultsFlowRecap) return
    this.elResultsVisualSummary.dataset.complete = snapshot.completed ? 'true' : 'false'
    this.elResultsVisualSummary.dataset.result = snapshot.outcomeTone

    this.elResultsStatGrid.replaceChildren(...snapshot.cards.map((card) => {
      const item = document.createElement('div')
      item.className = 'result-stat-card'
      item.dataset.key = card.key
      item.dataset.tone = card.tone
      item.title = card.detail

      const label = document.createElement('div')
      label.className = 'result-stat-label'
      label.textContent = card.label

      const value = document.createElement('div')
      value.className = 'result-stat-value'
      value.textContent = card.value

      const detail = document.createElement('div')
      detail.className = 'result-stat-detail'
      detail.textContent = card.detail

      item.append(label, value, detail)
      return item
    }))

    this.elResultsObjectiveRecap.replaceChildren(...snapshot.objectives.map((objective) => {
      const item = document.createElement('div')
      item.className = 'result-objective-chip'
      item.dataset.key = objective.key
      item.dataset.tone = objective.tone
      item.dataset.complete = objective.completed ? 'true' : 'false'

      const icon = document.createElement('span')
      icon.className = 'result-objective-icon'
      icon.textContent = objective.completed ? '✓' : objective.icon

      const body = document.createElement('span')
      const label = document.createElement('span')
      label.className = 'result-objective-label'
      label.textContent = objective.label

      const progress = document.createElement('span')
      progress.className = 'result-objective-progress'
      progress.textContent = objective.progressText

      body.append(label, progress)
      item.append(icon, body)
      return item
    }))

    this.elResultsFlowRecap.replaceChildren(...snapshot.flowSteps.map((step) => {
      const item = document.createElement('div')
      item.className = 'result-flow-step'
      item.dataset.key = step.key
      item.dataset.complete = step.completed ? 'true' : 'false'

      const label = document.createElement('div')
      label.className = 'result-flow-label'
      label.textContent = `${step.completed ? '✓' : '·'} ${step.label}`

      const detail = document.createElement('div')
      detail.className = 'result-flow-detail'
      detail.textContent = step.detail

      item.append(label, detail)
      return item
    }))
  }

  /** Public accessor for runtime tests */
  getMatchResult(): MatchResult | null {
    return this.gameOverResult
  }

  getMatchTelemetry(): MatchTelemetry {
    return { ...this.matchTelemetry }
  }

  getSkirmishObjectiveSnapshot(): SkirmishObjectiveView[] {
    return this.buildCurrentSkirmishObjectives()
  }

  getSkirmishCompletionSnapshot(): SkirmishCompletionSnapshot {
    const aiPressure = this.getAIPressureSnapshot()
    return buildSkirmishCompletionSnapshot({
      result: this.gameOverResult,
      telemetry: this.matchTelemetry,
      objectives: this.buildCurrentSkirmishObjectives(aiPressure),
      aiPressure,
    })
  }

  getResultPresentationSnapshot(): ResultPresentationSnapshot {
    const aiPressure = this.getAIPressureSnapshot()
    return buildResultPresentationSnapshot({
      result: this.gameOverResult,
      gameTime: this.gameTime,
      units: this.units,
      telemetry: this.matchTelemetry,
      objectives: this.buildCurrentSkirmishObjectives(aiPressure),
      aiPressure,
    })
  }

  getMapObjectiveSnapshot(): MapObjectiveView[] {
    return this.buildCurrentMapObjectives()
  }

  getBattlefieldReadabilitySnapshot(): BattlefieldReadabilitySnapshot {
    const objectives = this.buildCurrentMapObjectives()
    const minimapTargetCount = objectives.filter(objective =>
      objective.targetX !== null &&
      objective.targetZ !== null,
    ).length
    return buildBattlefieldReadabilitySnapshot({
      objectives,
      worldBeaconCount: this.mapObjectiveBeacons.getVisibleCount(),
      minimapTargetCount,
    })
  }

  getSessionShellSnapshot(): SessionShellSnapshot {
    return buildSessionShellSnapshot({
      preferences: this.sessionPreferences,
      hasCurrentMap: !!this.currentMapSource,
      hasLastSummary: !!this.getLastSessionMenuSummary(),
      beforeUnloadGuardActive: this.isBeforeUnloadGuardActive(),
    })
  }

  getVisibilitySnapshot(): VisibilitySnapshot {
    this.updateVisibilityState()
    return this.visibility.getSnapshot()
  }

  getWar3IdentitySnapshot(): War3IdentitySnapshot {
    this.updateVisibilityState()
    return buildWar3IdentitySnapshot({
      units: this.units,
      objectives: this.buildCurrentMapObjectives(),
      visibilitySystem: this.visibility,
      worldItems: this.worldItems,
    })
  }

  getHumanRouteSnapshot(): HumanRouteSnapshot {
    return buildHumanRouteSnapshot(this.units)
  }

  getHumanRouteFeedbackSnapshot() {
    return {
      primed: this.humanRouteFeedbackPrimed,
      completedKeyCount: this.completedHumanRouteKeys.size,
      completionCueCount: this.humanRouteCompletionCueCount,
      lastCompletedKeys: [...this.lastHumanRouteCompletionKeys],
    }
  }

  getHeroMilestoneSnapshot(): HeroMilestoneSnapshot {
    return buildHeroMilestoneSnapshot({
      units: this.units,
      deadUnitRecords: this.deadUnitRecords,
      gameTime: this.gameTime,
      blizzardChannelActive: !!this.blizzardChannel,
      blizzardChannelCaster: this.blizzardChannel?.caster ?? null,
      massTeleportPendingActive: !!this.massTeleportPending,
      massTeleportPendingCaster: this.massTeleportPending?.caster ?? null,
      selectedUnits: this.selectedUnits,
      activeHeroTargetMode: this.getActiveHeroTargetModeSnapshot(),
      activeHeroTargetEvaluation: this.getActiveHeroTargetEvaluation(),
      pointerGround: this.getHeroTargetPointerGround(),
    })
  }

  getAIPressureSnapshot(): AIPressureSnapshot | null {
    if (!this.ai || typeof this.ai.getPressureSnapshot !== 'function') return null
    return this.ai.getPressureSnapshot()
  }

  getAIOpponentSnapshot(): AIOpponentSnapshot {
    return buildAIOpponentSnapshot({
      units: this.units,
      aiTeam: 1,
      pressure: this.getAIPressureSnapshot(),
      difficultyControlExists: !!document.getElementById('setting-ai-difficulty'),
    })
  }

  getAudioCueSnapshot(): AudioCueSnapshot {
    return this.audioCues.getSnapshot()
  }

  getUnitPresentationSnapshot(): UnitPresentationSnapshot {
    return this.unitPresentation.getSnapshot()
  }

  getVisualAudioIdentitySnapshot(): VisualAudioIdentitySnapshot {
    const minimapCanvas = document.getElementById('minimap-canvas') as HTMLCanvasElement | null
    const hero = this.getHeroMilestoneSnapshot()
    return buildVisualAudioIdentitySnapshot({
      units: this.units,
      audio: this.getAudioCueSnapshot(),
      getAssetStatus,
      getAssetAnimationClipNames,
      getAudioCueAssetPath,
      feedback: this.feedback.getSnapshot(),
      unitPresentation: this.getUnitPresentationSnapshot(),
      heroAbilityPresentation: hero.abilityPresentation,
      resurrectionReadability: hero.resurrectionReadability,
      resultPresentation: this.getResultPresentationSnapshot(),
      selectedCount: this.selectedUnits.length,
      selectionRingCount: this.sel.selectionRings.length,
      healthBarCount: this.healthBars.size,
      deadRecordCount: this.deadUnitRecords.length,
      minimapReady: !!minimapCanvas && minimapCanvas.width > 0 && minimapCanvas.height > 0,
      objectiveRadarReady: !!this.elMapObjectiveList,
      fogReady: !!this.visibility.getSnapshot(),
    })
  }

  getFoundationMilestoneSnapshot(): FoundationMilestoneSnapshot {
    const rendererSize = new THREE.Vector2()
    this.renderer.getSize(rendererSize)
    const resources = this.resources.get(0)
    const source = this.currentMapSource
    return buildFoundationMilestoneSnapshot({
      units: this.units,
      treeCount: this.treeManager.entries.length,
      hasCurrentMap: !!source,
      mapKind: source?.kind ?? 'missing',
      isPlayingOrPaused: this.phase.isPlaying() || this.phase.isPaused() || this.phase.isGameOver(),
      rendererReady: rendererSize.x > 0 && rendererSize.y > 0,
      viewport: `${window.innerWidth}x${window.innerHeight}`,
      hasAI: !!this.ai,
      playerResources: { gold: resources.gold, lumber: resources.lumber },
      playerSupply: this.resources.computeSupply(0, this.units),
      telemetry: this.matchTelemetry,
      aiPressureReady: !!this.getAIPressureSnapshot(),
      commandRuntimeReady: typeof this.issueCommand === 'function' &&
        typeof this.enterPlacementMode === 'function' &&
        typeof this.enterAttackMoveMode === 'function',
      combatRuntimeReady: typeof this.dealDamage === 'function' &&
        typeof this.updateCombat === 'function' &&
        typeof this.updateStaticDefense === 'function',
    })
  }

  getPlaytestReadinessSnapshot(): PlaytestReadinessSnapshot {
    return buildPlaytestReadinessSnapshot({
      runtime: this.getPlaytestRuntimeInfo(),
      milestones: this.getPlaytestMilestoneSignals(),
      beforeUnloadGuardActive: this.isBeforeUnloadGuardActive(),
      compatibility: this.getPlaytestCompatibilitySignals(),
      recentErrors: this.getPlaytestRecentErrors(),
      feedback: this.getPlaytestFeedbackInput(),
      war3Gap: this.getWar3GapSnapshot(),
    })
  }

  getWar3GapSnapshot(): War3GapSnapshot {
    return buildWar3GapSnapshot(this.getRuntimeMilestoneSnapshots())
  }

  getLastSessionMenuSummary(): string | null {
    if (!this.gameOverResult) return null
    return formatMenuSessionSummary({
      result: this.gameOverResult,
      gameTime: this.gameTime,
      telemetry: this.matchTelemetry,
      objectives: this.buildCurrentSkirmishObjectives(),
      aiPressure: this.getAIPressureSnapshot(),
    })
  }

  private buildCurrentSkirmishObjectives(
    aiPressure: AIPressureSnapshot | null = this.getAIPressureSnapshot(),
  ): SkirmishObjectiveView[] {
    return buildSkirmishObjectives(this.units, this.matchTelemetry, this.gameOverResult, aiPressure)
  }

  private buildCurrentMapObjectives(
    aiPressure: AIPressureSnapshot | null = this.getAIPressureSnapshot(),
  ): MapObjectiveView[] {
    return buildMapObjectives(this.units, aiPressure, this.treeManager.entries)
  }

  private updateVisibilityState() {
    this.visibility.update(this.units, 0)
  }

  /** 树木耗尽：移除 mesh + 释放 blocker */
  private depleteTree(tree: TreeEntry) {
    this.treeManager.remove(tree)
    disposeObject3DDeep(tree.mesh)
  }

  /** 自动续采只选择当前边缘可站立的树，避免盯上森林内部不可接触的树。 */
  private findNearestReachableTree(pos: THREE.Vector3, maxDist: number = Infinity): TreeEntry | null {
    return findNearestHarvestableTree(
      pos,
      this.treeManager.entries,
      (tree) => getTreeApproachCandidates(
        tree,
        this.pathingGrid,
        (tx, tz) => this.getWorldHeight(tx, tz),
      ).length > 0,
      maxDist,
    )
  }

  /**
   * Gold miners should not use ordinary collision once they are in the reserved
   * mining loop, but their visible stand points must still remain distinct.
   * This keeps old point-target command paths from collapsing every miner onto
   * the same mine-center coordinate.
   */
  private placeGoldWorkerAtMineEdge(unit: Unit, mine: Unit): void {
    const candidates = getBuildingApproachCandidates(
      mine,
      this.pathingGrid,
      (tx, tz) => this.getWorldHeight(tx, tz),
      2,
    ).sort((a, b) => a.z === b.z ? a.x - b.x : a.z - b.z)
    if (candidates.length === 0) return

    const target = chooseGoldWorkerStandPoint(unit, mine, this.units, candidates)
    if (!target) return

    const pos = unit.mesh.position
    pos.x = target.x
    pos.z = target.z
    pos.y = this.getWorldHeight(pos.x - 0.5, pos.z - 0.5)
    unit.mesh.rotation.y = Math.atan2(mine.mesh.position.x - pos.x, mine.mesh.position.z - pos.z)
  }

  /** 让农民去采最近的资源（自动回采 / 采集失败重试入口） */
  private startGatherNearest(unit: Unit) {
    if (unit.gatherType === 'gold') {
      const mine = findNearestGoldmine(unit.mesh.position, this.units)
      if (mine && mine.remainingGold > 0) {
        unit.state = UnitState.MovingToGather
        assignGoldGatherTarget([unit], mine)
        unit.goldStandMine = null
        this.planPathToBuildingInteraction(unit, mine)
        return
      }
    }
    // 伐木：走向最近的树（通过 TreeManager 统一查询）
    if (unit.gatherType === 'lumber') {
      const tree = this.findNearestReachableTree(unit.mesh.position, 30)
      if (tree) {
        unit.state = UnitState.MovingToGather
        assignLumberGatherTarget([unit], tree)
        this.planPathToTreeInteraction(unit, tree)
        return
      }
    }
    // 找不到资源 → 空闲，清除资源目标
    unit.state = UnitState.Idle
    clearGatherTarget(unit)
  }

  /** 开局入口统一：玩家初始农民自动去最近金矿，避免不同地图入口行为分叉。 */
  private autoAssignOpeningGoldWorkers(team: number) {
    const hall = this.units.find(
      (u) => u.team === team && isMainHallType(u.type) && u.hp > 0,
    )
    if (!hall) return

    const mine = findNearestGoldmine(hall.mesh.position, this.units)
    if (!mine || mine.remainingGold <= 0) return

    const workers = this.units.filter(
      (u) => u.team === team &&
        u.type === 'worker' &&
        u.hp > 0 &&
        u.state === UnitState.Idle &&
        !u.moveTarget,
    )
    if (workers.length === 0) return

    this.issueCommand(workers, {
      type: 'gather',
      resourceType: 'gold',
      target: mine.mesh.position.clone(),
    })
    assignGoldGatherTarget(workers, mine)
    this.planPathForUnitsToBuildingInteraction(workers, mine)
  }

  // ==================== 建造系统 ====================

  /** 进入建造放置模式 */
  enterPlacementMode(buildingKey: string) {
    const def = BUILDINGS[buildingKey]
    if (!def) return

    // Tech prerequisite gate
    if (def.techPrereq && !this.units.some(
      u => u.team === 0 && u.type === def.techPrereq && u.isBuilding
        && u.buildProgress >= 1 && u.hp > 0,
    )) return

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
    const hitPoint = this.resolvePointerGroundPoint()
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

    const savedWorkers = this.placement.aliveWorkers(this.units)
    const peasant = selectConstructionBuilder(savedWorkers, () => this.findNearestIdlePeasant(pos))

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
    if (!canAssignBuilderToConstruction(worker, building, this.units)) return false

    building.builder = worker
    this.issueCommand([worker], { type: 'build', target: building })
    const hasPath = this.planPathToBuildingInteraction(worker, building)
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
    this.modeHintPresenter.clearState()
    this.modeHintPresenter.show(text)
  }

  private playAudioCue(kind: AudioCueKind, label: string) {
    this.audioCues.play(kind, label)
    this._lastMilestoneStatusKey = ''
  }

  /** 编组召回轻量反馈（短暂闪烁编组号） */
  private groupHintTimer = 0
  private commandHintTimer = 0
  private flashGroupHint(slot: number, count: number, summary: string) {
    this.modeHintPresenter.flashGroup(slot, count, summary)
    this.groupHintTimer = 1.2  // 秒
  }

  private flashCommandCardHint(text: string, state: 'ok' | 'blocked') {
    this.modeHintPresenter.flashCommand(text, state)
    this.commandHintTimer = state === 'blocked' ? 1.8 : 1.1
  }

  private triggerCommandCardHotkey(e: KeyboardEvent) {
    if (e.ctrlKey || e.metaKey || e.altKey) return false
    if (e.key.length !== 1) return false
    if (!this.phase.isPlaying()) return false
    if (this.hasModalInputMode()) return false
    if (this.selectedUnits.length === 0) return false

    const result = this.commandCardPresenter.triggerHotkey(e.key)
    if (!result.handled) return false

    e.preventDefault()
    e.stopPropagation()

    if (result.executed) {
      this.flashCommandCardHint(`${result.hotkey.toUpperCase()} — ${result.label}`, 'ok')
      this.playAudioCue('command', `命令卡 ${result.label}`)
    } else {
      const reason = result.disabledReason || '当前不可用'
      this.flashCommandCardHint(`${result.hotkey.toUpperCase()} — ${result.label} 不可用：${reason}`, 'blocked')
      this.playAudioCue('command', `命令卡不可用 ${result.label}`)
    }

    return true
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
    this.interruptChanneledCastsForOrder(units)
    dispatchGameCommand(units, cmd)
  }

  /** Runtime-test accessor for resource-loop pathing contracts. */
  getBuildingApproachCandidates(target: Unit, extraRadius = 1) {
    return getBuildingApproachCandidates(
      target,
      this.pathingGrid,
      (tx, tz) => this.getWorldHeight(tx, tz),
      extraRadius,
    )
  }

  /** Runtime-test accessor for resource-loop pathing contracts. */
  getTreeApproachCandidates(tree: TreeEntry, extraRadius = 1) {
    return getTreeApproachCandidates(
      tree,
      this.pathingGrid,
      (tx, tz) => this.getWorldHeight(tx, tz),
      extraRadius,
    )
  }

  /** Runtime-test accessor for gather interaction contracts. */
  hasReachedGatherInteraction(unit: Unit) {
    return hasUnitReachedGatherInteraction(unit)
  }

  /** Runtime-test accessor for resource-loop collision contracts. */
  hasSuppressedUnitCollision(unit: Unit) {
    return hasSuppressedResourceLoopCollision(unit)
  }

  /** Runtime-test accessor for tree interaction diagnostics. */
  distanceToTreeFootprint(unit: Unit, tree: TreeEntry) {
    return getDistanceToTreeFootprint(unit, tree)
  }

  private interruptChanneledCastsForOrder(units: readonly Unit[]) {
    for (const u of units) {
      if (u.type === 'archmage') {
        this.interruptBlizzardChannel(u)
        this.interruptMassTeleportPending(u)
      }
    }
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
    this.clearHeroTargetModes()
    this.updateModeHint('')
  }

  private clearHeroTargetModes() {
    this.weTargetMode = false
    this.weTargetCaster = null
    this.blizzardTargetMode = false
    this.blizzardTargetCaster = null
    this.massTeleportTargetMode = false
    this.massTeleportTargetCaster = null
    this.stormBoltTargetMode = false
    this.stormBoltTargetCaster = null
    this._lastCmdKey = ''
  }

  private clearHeroTargetMode(mode: HeroTargetModeKey) {
    switch (mode) {
      case 'waterElemental':
        this.weTargetMode = false
        this.weTargetCaster = null
        break
      case 'blizzard':
        this.blizzardTargetMode = false
        this.blizzardTargetCaster = null
        break
      case 'massTeleport':
        this.massTeleportTargetMode = false
        this.massTeleportTargetCaster = null
        break
      case 'stormBolt':
        this.stormBoltTargetMode = false
        this.stormBoltTargetCaster = null
        break
    }
    this._lastCmdKey = ''
  }

  private enterHeroTargetMode(mode: HeroTargetModeKey, caster: Unit, hint: string) {
    this.clearHeroTargetModes()
    switch (mode) {
      case 'waterElemental':
        this.weTargetMode = true
        this.weTargetCaster = caster
        break
      case 'blizzard':
        this.blizzardTargetMode = true
        this.blizzardTargetCaster = caster
        break
      case 'massTeleport':
        this.massTeleportTargetMode = true
        this.massTeleportTargetCaster = caster
        break
      case 'stormBolt':
        this.stormBoltTargetMode = true
        this.stormBoltTargetCaster = caster
        break
    }
    this.updateModeHint(hint)
    this._lastCmdKey = ''
  }

  private showHeroTargetInvalid(caster: Unit, message: string) {
    this.setAbilityFeedback(caster, message, 2)
    this.updateModeHint(`${message} — 重新选择，右键/Esc取消`)
  }

  private hasHeroTargetMode() {
    return this.weTargetMode ||
      this.blizzardTargetMode ||
      this.massTeleportTargetMode ||
      this.stormBoltTargetMode
  }

  private getActiveHeroTargetModeSnapshot(): ActiveHeroAbilityTargetMode | null {
    if (this.weTargetMode && this.weTargetCaster) {
      return {
        mode: 'waterElemental',
        abilityKey: 'water_elemental',
        casterType: this.weTargetCaster.type,
        targetKind: 'ground',
        hint: '召唤水元素：选择未阻挡地面',
      }
    }
    if (this.blizzardTargetMode && this.blizzardTargetCaster) {
      return {
        mode: 'blizzard',
        abilityKey: 'blizzard',
        casterType: this.blizzardTargetCaster.type,
        targetKind: 'ground',
        hint: '暴风雪：选择目标地面',
      }
    }
    if (this.massTeleportTargetMode && this.massTeleportTargetCaster) {
      return {
        mode: 'massTeleport',
        abilityKey: 'mass_teleport',
        casterType: this.massTeleportTargetCaster.type,
        targetKind: 'friendly-unit',
        hint: '群体传送：选择友方单位或建筑',
      }
    }
    if (this.stormBoltTargetMode && this.stormBoltTargetCaster) {
      return {
        mode: 'stormBolt',
        abilityKey: 'storm_bolt',
        casterType: this.stormBoltTargetCaster.type,
        targetKind: 'enemy-unit',
        hint: '风暴之锤：选择敌方非建筑单位',
      }
    }
    return null
  }

  private getHeroTargetPointerGround(): { x: number; z: number } | null {
    if (!this.hasHeroTargetMode()) return null
    this.raycaster.setFromCamera(this.mouseNDC, this.camera)
    const target = this.resolvePointerGroundPoint()
    return target ? { x: target.x, z: target.z } : null
  }

  private getActiveHeroTargetEvaluation(): ActiveHeroAbilityTargetEvaluation | null {
    const mode = this.getActiveHeroTargetModeSnapshot()
    if (!mode) return null

    this.raycaster.setFromCamera(this.mouseNDC, this.camera)
    const ground = this.resolvePointerGroundPoint()
    const hitUnit = this.resolvePointerAbilityTargetUnit(ground)

    switch (mode.mode) {
      case 'waterElemental':
        return this.evaluateWaterElementalTarget(mode, this.weTargetCaster, ground)
      case 'blizzard':
        return this.evaluateBlizzardTarget(mode, this.blizzardTargetCaster, ground)
      case 'massTeleport':
        return this.evaluateMassTeleportTarget(mode, this.massTeleportTargetCaster, hitUnit, ground)
      case 'stormBolt':
        return this.evaluateStormBoltTarget(mode, this.stormBoltTargetCaster, hitUnit, ground)
    }
  }

  private makeTargetEvaluation(input: {
    mode: ActiveHeroAbilityTargetMode
    legal: boolean
    reason: string
    status?: ActiveHeroAbilityTargetEvaluation['status']
    targetLabel?: string
    x?: number | null
    z?: number | null
  }): ActiveHeroAbilityTargetEvaluation {
    return {
      mode: input.mode.mode,
      abilityKey: input.mode.abilityKey,
      targetKind: input.mode.targetKind,
      status: input.status ?? (input.legal ? 'valid' : 'invalid'),
      legal: input.legal,
      reason: input.reason,
      targetLabel: input.targetLabel ?? '地面',
      x: input.x ?? null,
      z: input.z ?? null,
    }
  }

  private getHeroAbilityLevelData(caster: Unit | null, abilityKey: string): HeroAbilityLevelDef | null {
    if (!caster) return null
    const learnedLevel = caster.abilityLevels?.[abilityKey] ?? 0
    if (learnedLevel < 1) return null
    const abilityDef = HERO_ABILITY_LEVELS[abilityKey]
    if (!abilityDef) return null
    return abilityDef.levels[Math.min(learnedLevel, abilityDef.maxLevel) - 1] ?? null
  }

  private targetLabel(unit: Unit | null) {
    if (!unit) return '无目标'
    return UNITS[unit.type]?.name ?? unit.type
  }

  private isCasterReadyForTargeting(caster: Unit | null, expectedType: string) {
    if (!caster) return '没有施法者'
    if (caster.type !== expectedType) return '施法者类型不匹配'
    if (caster.isDead || caster.hp <= 0) return '施法者已死亡'
    return ''
  }

  private evaluateWaterElementalTarget(
    mode: ActiveHeroAbilityTargetMode,
    caster: Unit | null,
    ground: THREE.Vector3 | null,
  ): ActiveHeroAbilityTargetEvaluation {
    const casterBlock = this.isCasterReadyForTargeting(caster, 'archmage')
    if (casterBlock) return this.makeTargetEvaluation({ mode, legal: false, reason: casterBlock, status: 'missing-target' })
    const archmage = caster!
    const learnedLevel = archmage.abilityLevels?.water_elemental ?? 0
    const levelData = learnedLevel > 0
      ? WATER_ELEMENTAL_SUMMON_LEVELS[Math.min(learnedLevel, WATER_ELEMENTAL_SUMMON_LEVELS.length) - 1]
      : null
    if (!levelData) return this.makeTargetEvaluation({ mode, legal: false, reason: '未学习水元素' })
    if (this.gameTime < archmage.waterElementalCooldownUntil) return this.makeTargetEvaluation({ mode, legal: false, reason: '冷却中' })
    if (archmage.mana < levelData.mana) return this.makeTargetEvaluation({ mode, legal: false, reason: '法力不足' })
    if (!ground) return this.makeTargetEvaluation({ mode, legal: false, reason: '没有选中地面', status: 'missing-target' })
    const distance = archmage.mesh.position.distanceTo(ground)
    if (distance > WATER_ELEMENTAL_CAST_RANGE) {
      return this.makeTargetEvaluation({ mode, legal: false, reason: '超出施法距离', x: ground.x, z: ground.z })
    }
    if (this.pathingGrid.isBlocked(Math.floor(ground.x), Math.floor(ground.z))) {
      return this.makeTargetEvaluation({ mode, legal: false, reason: '目标地面被阻挡', x: ground.x, z: ground.z })
    }
    return this.makeTargetEvaluation({ mode, legal: true, reason: '可召唤', x: ground.x, z: ground.z })
  }

  private evaluateBlizzardTarget(
    mode: ActiveHeroAbilityTargetMode,
    caster: Unit | null,
    ground: THREE.Vector3 | null,
  ): ActiveHeroAbilityTargetEvaluation {
    const casterBlock = this.isCasterReadyForTargeting(caster, 'archmage')
    if (casterBlock) return this.makeTargetEvaluation({ mode, legal: false, reason: casterBlock, status: 'missing-target' })
    const archmage = caster!
    const levelData = this.getHeroAbilityLevelData(archmage, 'blizzard')
    if (!levelData) return this.makeTargetEvaluation({ mode, legal: false, reason: '未学习暴风雪' })
    if (this.blizzardChannel?.caster === archmage) return this.makeTargetEvaluation({ mode, legal: false, reason: '正在引导' })
    if (this.gameTime < archmage.blizzardCooldownUntil) return this.makeTargetEvaluation({ mode, legal: false, reason: '冷却中' })
    if (archmage.mana < levelData.mana) return this.makeTargetEvaluation({ mode, legal: false, reason: '法力不足' })
    if (!ground) return this.makeTargetEvaluation({ mode, legal: false, reason: '没有选中地面', status: 'missing-target' })
    const distance = archmage.mesh.position.distanceTo(ground)
    if (distance > levelData.range) {
      return this.makeTargetEvaluation({ mode, legal: false, reason: '超出施法距离', x: ground.x, z: ground.z })
    }
    return this.makeTargetEvaluation({ mode, legal: true, reason: '可施放', x: ground.x, z: ground.z })
  }

  private evaluateMassTeleportTarget(
    mode: ActiveHeroAbilityTargetMode,
    caster: Unit | null,
    target: Unit | null,
    ground: THREE.Vector3 | null,
  ): ActiveHeroAbilityTargetEvaluation {
    const casterBlock = this.isCasterReadyForTargeting(caster, 'archmage')
    if (casterBlock) return this.makeTargetEvaluation({ mode, legal: false, reason: casterBlock, status: 'missing-target' })
    const archmage = caster!
    const levelData = this.getHeroAbilityLevelData(archmage, 'mass_teleport')
    const fallbackPoint = ground ? { x: ground.x, z: ground.z } : {}
    if (!levelData) return this.makeTargetEvaluation({ mode, legal: false, reason: '未学习群体传送', ...fallbackPoint })
    if (this.massTeleportPending?.caster === archmage) return this.makeTargetEvaluation({ mode, legal: false, reason: '传送准备中', ...fallbackPoint })
    if (this.gameTime < archmage.massTeleportCooldownUntil) return this.makeTargetEvaluation({ mode, legal: false, reason: '冷却中', ...fallbackPoint })
    if (archmage.mana < levelData.mana) return this.makeTargetEvaluation({ mode, legal: false, reason: '法力不足', ...fallbackPoint })
    if (!target) return this.makeTargetEvaluation({ mode, legal: false, reason: '需要友方单位或建筑', status: 'missing-target', ...fallbackPoint })
    const targetPoint = { x: target.mesh.position.x, z: target.mesh.position.z }
    if (target.isDead || target.hp <= 0) return this.makeTargetEvaluation({ mode, legal: false, reason: '目标已死亡', targetLabel: this.targetLabel(target), ...targetPoint })
    if (target.team !== archmage.team) return this.makeTargetEvaluation({ mode, legal: false, reason: '必须选择友方目标', targetLabel: this.targetLabel(target), ...targetPoint })
    return this.makeTargetEvaluation({ mode, legal: true, reason: '可传送', targetLabel: this.targetLabel(target), ...targetPoint })
  }

  private evaluateStormBoltTarget(
    mode: ActiveHeroAbilityTargetMode,
    caster: Unit | null,
    target: Unit | null,
    ground: THREE.Vector3 | null,
  ): ActiveHeroAbilityTargetEvaluation {
    const casterBlock = this.isCasterReadyForTargeting(caster, 'mountain_king')
    if (casterBlock) return this.makeTargetEvaluation({ mode, legal: false, reason: casterBlock, status: 'missing-target' })
    const mountainKing = caster!
    const levelData = this.getHeroAbilityLevelData(mountainKing, 'storm_bolt')
    const fallbackPoint = ground ? { x: ground.x, z: ground.z } : {}
    if (!levelData) return this.makeTargetEvaluation({ mode, legal: false, reason: '未学习风暴之锤', ...fallbackPoint })
    if (this.gameTime < mountainKing.stormBoltCooldownUntil) return this.makeTargetEvaluation({ mode, legal: false, reason: '冷却中', ...fallbackPoint })
    if (mountainKing.mana < levelData.mana) return this.makeTargetEvaluation({ mode, legal: false, reason: '法力不足', ...fallbackPoint })
    if (!target) return this.makeTargetEvaluation({ mode, legal: false, reason: '需要敌方非建筑单位', status: 'missing-target', ...fallbackPoint })
    const targetPoint = { x: target.mesh.position.x, z: target.mesh.position.z }
    if (target.isDead || target.hp <= 0) return this.makeTargetEvaluation({ mode, legal: false, reason: '目标已死亡', targetLabel: this.targetLabel(target), ...targetPoint })
    if (target.team === mountainKing.team) return this.makeTargetEvaluation({ mode, legal: false, reason: '不能选择友方目标', targetLabel: this.targetLabel(target), ...targetPoint })
    if (target.isBuilding) return this.makeTargetEvaluation({ mode, legal: false, reason: '不能选择建筑', targetLabel: this.targetLabel(target), ...targetPoint })
    if (isSpellImmune(target, this.gameTime)) return this.makeTargetEvaluation({ mode, legal: false, reason: '目标魔法免疫', targetLabel: this.targetLabel(target), ...targetPoint })
    if (mountainKing.mesh.position.distanceTo(target.mesh.position) > levelData.range) {
      return this.makeTargetEvaluation({ mode, legal: false, reason: '超出施法距离', targetLabel: this.targetLabel(target), ...targetPoint })
    }
    return this.makeTargetEvaluation({ mode, legal: true, reason: '可命中', targetLabel: this.targetLabel(target), ...targetPoint })
  }

  private hasModalInputMode() {
    return this.placement.mode ||
      this.attackMoveMode ||
      this.rallyMode ||
      this.hasHeroTargetMode()
  }

  private setMouseNdcFromScreenPoint(x: number, y: number) {
    const ndc = screenPointToNdc(x, y, window.innerWidth, window.innerHeight)
    this.mouseNDC.set(ndc.x, ndc.y)
  }

  private setMouseNdcFromEvent(e: MouseEvent) {
    this.setMouseNdcFromScreenPoint(e.clientX, e.clientY)
  }

  private cancelPrimaryInputMode(): boolean {
    if (this.placement.mode) {
      this.exitPlacementMode()
      return true
    }
    if (this.attackMoveMode) {
      this.attackMoveMode = false
      this.updateModeHint('')
      return true
    }
    if (this.rallyMode) {
      this.rallyMode = false
      this.rallyBuilding = null
      this.updateModeHint('')
      return true
    }
    if (this.hasHeroTargetMode()) {
      this.clearHeroTargetModes()
      this.updateModeHint('')
      return true
    }
    return false
  }

  private consumePrimaryLeftClickMode(e: MouseEvent): boolean {
    if (this.placement.mode) {
      this.placeBuilding()
      return true
    }

    if (this.attackMoveMode) {
      this.setMouseNdcFromEvent(e)
      this.handleAttackMoveClick()
      this.attackMoveMode = false
      this.updateModeHint('')
      return true
    }

    if (this.rallyMode) {
      this.setMouseNdcFromEvent(e)
      this.handleRallyClick()
      this.rallyMode = false
      this.rallyBuilding = null
      this.updateModeHint('')
      return true
    }

    if (this.weTargetMode && this.weTargetCaster) {
      this.setMouseNdcFromEvent(e)
      if (this.handleWaterElementalTargetClick()) {
        this.clearHeroTargetMode('waterElemental')
        this.updateModeHint('')
      }
      return true
    }

    if (this.blizzardTargetMode && this.blizzardTargetCaster) {
      this.setMouseNdcFromEvent(e)
      if (this.handleBlizzardTargetClick()) {
        this.clearHeroTargetMode('blizzard')
        this.updateModeHint('')
      }
      return true
    }

    if (this.massTeleportTargetMode && this.massTeleportTargetCaster) {
      this.setMouseNdcFromEvent(e)
      if (this.handleMassTeleportTargetClick()) {
        this.clearHeroTargetMode('massTeleport')
        this.updateModeHint('')
      }
      return true
    }

    if (this.stormBoltTargetMode && this.stormBoltTargetCaster) {
      this.setMouseNdcFromEvent(e)
      if (this.handleStormBoltTargetClick()) {
        this.clearHeroTargetMode('stormBolt')
        this.updateModeHint('')
      }
      return true
    }

    return false
  }

  // ==================== 输入 ====================

  private setupInput() {
    const canvas = this.renderer.domElement

    const blockSessionInput = (e: Event) => {
      if (!this.shouldBlockGameplayInput()) return
      if (e instanceof KeyboardEvent) {
        if (e.key.toLowerCase() === 'p') return
        if (this.phase.isPaused() && e.key === 'Escape') return
        e.preventDefault()
        e.stopImmediatePropagation()
        return
      }
      if (!this.isGameplaySurfaceTarget(e.target)) return
      e.preventDefault()
      e.stopImmediatePropagation()
    }

    for (const type of ['keydown', 'keyup', 'mousemove', 'mousedown', 'mouseup', 'contextmenu', 'wheel']) {
      window.addEventListener(type, blockSessionInput, true)
    }

    canvas.addEventListener('mousemove', (e) => {
      this.setMouseNdcFromEvent(e)
      this.mouseScreen.set(e.clientX, e.clientY)
      this.updateTileInfo()

      if (this.isDragging) {
        this.drawSelectionBox(e.clientX, e.clientY)
      }
    })

    canvas.addEventListener('mousedown', (e) => {
      if (e.button !== 0) return

      if (this.consumePrimaryLeftClickMode(e)) return

      this.isDragging = false
      this.dragStart.set(e.clientX, e.clientY)
    })

    canvas.addEventListener('mouseup', (e) => {
      if (e.button !== 0) return
      if (this.hasModalInputMode()) return

      if (this.isDragging) {
        this.finishBoxSelect(e.clientX, e.clientY, this.shiftHeld || e.shiftKey)
      } else {
        this.setMouseNdcFromEvent(e)
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

      if (this.cancelPrimaryInputMode()) return

      if (this.selectedUnits.length === 0) return

      this.setMouseNdcFromEvent(e)
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
        if (this.hasModalInputMode()) {
          this.cancelAllModes()
          return
        }
        if (this.phase.isPaused()) {
          this.resumeGame()
          return
        }
        if (this.phase.isPlaying()) {
          this.pauseGame()
        }
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
        if (this.hasModalInputMode()) return

        const recalled = this.controlGroups.recall(digit, this.units)
        if (recalled.length > 0) {
          // Shift 持有时追加到现有选择
          if (this.shiftHeld) {
            this.appendSelectionUnits(recalled)
          } else {
            this.replaceSelection(recalled)
          }
          // 轻量召回反馈：短暂显示编组信息
          const summary = this.controlGroups.getTypeSummary(digit)
          this.flashGroupHint(digit, recalled.length, summary)
        }
        return
      }

      if (this.triggerCommandCardHotkey(e)) return

      // P = 截图；若当前命令卡有 P 热键，上面的命令卡路径优先。
      if (e.key.toLowerCase() === 'p') {
        this.captureScreenshot()
        return
      }

      // 建造/攻击移动/集结模式时不响应快捷键
      if (this.hasModalInputMode()) return
      if (this.selectedUnits.length === 0) return

      // Tab = 子组切换
      if (e.key === 'Tab') {
        e.preventDefault()
        if (this.selectionModel.cycleSubgroup()) {
          this.refreshSelectionVisuals()
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

      const controllable = this.getSelectedControllableUnits()
      if (controllable.length === 0) return

      switch (e.key.toLowerCase()) {
        case 's':
          this.issueCommand(controllable, { type: 'stop' })
          this.suppressAggroFor(controllable)
          break
        case 'h':
          this.issueCommand(controllable, { type: 'holdPosition' })
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
    return planUnitPath(unit, target, this.pathingGrid, (wx, wz) => this.getWorldHeight(wx, wz))
  }

  /** 路径目标落在建筑外圈可站立点，避免单位挤向建筑占用格中心。 */
  private planPathToBuildingInteraction(unit: Unit, target: Unit, reserved?: Set<string>): boolean {
    const candidates = getBuildingApproachCandidates(
      target,
      this.pathingGrid,
      (tx, tz) => this.getWorldHeight(tx, tz),
    )
    const approach = chooseNearestApproachPoint(unit.mesh.position, candidates, target.mesh.position, reserved)
    return this.planPath(unit, approach)
  }

  /** 路径目标落在树格外圈可站立点，避免农民对着树中心反复重寻路。 */
  private planPathToTreeInteraction(unit: Unit, tree: TreeEntry, reserved?: Set<string>): boolean {
    const candidates = getTreeApproachCandidates(
      tree,
      this.pathingGrid,
      (tx, tz) => this.getWorldHeight(tx, tz),
    )
    const approach = chooseNearestApproachPoint(unit.mesh.position, candidates, tree.mesh.position, reserved)
    return this.planPath(unit, approach)
  }

  private planPathForUnitsToBuildingInteraction(units: Unit[], target: Unit) {
    if (target.type === 'goldmine') {
      for (const u of units) {
        if (u.isBuilding) continue
        if (u.gatherType !== 'gold') continue
        if (u.resourceTarget?.type !== 'goldmine' || u.resourceTarget.mine !== target) continue
        reserveGoldLoopSlot(u, target, this.units)
      }
    }

    const reserved = new Set<string>()
    for (const u of units) {
      if (!u.isBuilding) this.planPathToBuildingInteraction(u, target, reserved)
    }
  }

  private planPathForUnitsToTreeInteraction(units: Unit[], tree: TreeEntry) {
    const reserved = new Set<string>()
    for (const u of units) {
      if (!u.isBuilding) this.planPathToTreeInteraction(u, tree, reserved)
    }
  }

  /** 为一组单位批量计算路径（含编队偏移） */
  private planPathForUnits(units: Unit[], target: THREE.Vector3) {
    const targets = getFormationMoveTargets(
      units,
      target,
      (wx, wz) => this.isPositionBlocked(wx, wz),
    )
    for (const move of targets) {
      this.planPath(move.unit, move.target)
    }
  }

  // ==================== 单位命中查找 ====================

  /** Deduplicate all unit hits resolved from a raycast hit list. */
  private resolveHitUnits(hits: readonly THREE.Intersection<THREE.Object3D>[]): Unit[] {
    return this.sel.resolveHitUnits(hits, this.units)
  }

  private resolvePointerUnitHits(): Unit[] {
    const unitMeshes = this.units.map((u) => u.mesh)
    return this.resolveHitUnits(this.raycaster.intersectObjects(unitMeshes, true))
  }

  private resolvePointerGroundPoint(): THREE.Vector3 | null {
    const hits = this.raycaster.intersectObject(this.terrain.groundPlane)
    return hits.length > 0 ? hits[0].point : null
  }

  private resolvePointerAbilityTargetUnit(ground: THREE.Vector3 | null): Unit | null {
    const direct = this.resolvePointerUnitHits()[0]
    if (direct) return direct
    if (!ground) return null

    let best: { unit: Unit; distanceSq: number } | null = null
    for (const unit of this.units) {
      if (unit.isDead || unit.hp <= 0 || !unit.mesh?.position) continue
      const dx = unit.mesh.position.x - ground.x
      const dz = unit.mesh.position.z - ground.z
      const distanceSq = dx * dx + dz * dz
      const buildingSize = unit.isBuilding ? BUILDINGS[unit.type]?.size ?? 1 : 1
      const radius = unit.isBuilding ? buildingSize * 0.65 + 0.35 : 0.95
      if (distanceSq > radius * radius) continue
      if (!best || distanceSq < best.distanceSq) best = { unit, distanceSq }
    }
    return best?.unit ?? null
  }

  private resolveClickSelectionTarget(hitUnits: readonly Unit[]): Unit | undefined {
    return this.sel.resolveClickSelectionTarget(hitUnits)
  }

  // ==================== 左键选择 ====================

  private handleClick() {
    this.raycaster.setFromCamera(this.mouseNDC, this.camera)
    const hitUnits = this.resolvePointerUnitHits()

    if (hitUnits.length > 0) {
      const unit = this.resolveClickSelectionTarget(hitUnits)
      if (unit) {
        // Shift+click: add/remove toggle
        if (this.shiftHeld) {
          const idx = this.selectedUnits.indexOf(unit)
          const toggleResult = this.selectionModel.shiftToggle(unit, 0)
          if (toggleResult === 'removed') {
            this.sel.removeSelectionRingAt(idx)
          } else if (toggleResult === 'added') {
            this.sel.createSelectionRing(unit)
          }
          return
        }

        // 双击检测：如果点击的是同一个单位且在时间窗口内
        const now = performance.now()
        if (this.lastClickUnit === unit && now - this.lastClickTime < Game.DOUBLE_CLICK_MS) {
          // 双击：选中屏幕上所有同类友方单位
          this.selectionModel.setSelection([unit])
          // 尝试选中所有可见同类（保持 primary = 被点击的单位）
          this.selectionModel.selectSameType(this.units, 0, (u) => this.sel.isUnitOnScreen(u))
          this.refreshSelectionVisuals(true)
          this.lastClickTime = 0
          this.lastClickUnit = null
          return
        }

        // 普通单击：替换选择
        this.lastClickTime = now
        this.lastClickUnit = unit
        this.replaceSelection([unit])
        return
      }
    }
    // 点击空白处：清除选择（Shift 不影响）
    this.clearSelection()
  }

  // ==================== 右键命令 ====================

  private getSelectedControllableUnits(): Unit[] {
    return this.selectedUnits.filter((u) => u.team === 0 && !u.isBuilding)
  }

  private handleRightClick() {
    this.raycaster.setFromCamera(this.mouseNDC, this.camera)

    // 先检测是否右键点击了单位/建筑
    const unitHits = this.resolvePointerUnitHits()

    if (unitHits.length > 0) {
      // Resolve all hit units from the hit list. When workers crowd a goldmine
      // the first hit may be a worker, but the player intent is to gather.
      // Prefer goldmine or unfinished building over own units.
      const target = selectRightClickUnitTarget(unitHits, 0)

      if (target) {
        this.handleRightClickUnitTarget(target)
        return
      }
    }

    // 右键地面
    const groundTarget = this.resolvePointerGroundPoint()
    if (!groundTarget) return
    this.handleRightClickGroundTarget(groundTarget)
  }

  private handleRightClickUnitTarget(target: Unit) {
    const controllable = this.getSelectedControllableUnits()
    this.interruptChanneledCastsForOrder(controllable)

    const intent = getRightClickUnitIntent(target, 0)
    switch (intent) {
      case 'gatherGold': {
        if (target.remainingGold <= 0) {
          this.updateModeHint('金矿已采空')
          this.feedback.showMoveIndicator(target.mesh.position.x, target.mesh.position.z)
          return
        }
        const { gatherers, others } = splitGatherCapableUnits(controllable)
        this.issueCommand(gatherers, { type: 'gather', resourceType: 'gold', target: target.mesh.position })
        assignGoldGatherTarget(gatherers, target)
        this.planPathForUnitsToBuildingInteraction(gatherers, target)
        if (others.length > 0) {
          this.issueCommand(others, { type: 'move', target: target.mesh.position })
          this.planPathForUnitsToBuildingInteraction(others, target)
          this.suppressAggroFor(others)
        }
        this.feedback.showMoveIndicator(target.mesh.position.x, target.mesh.position.z)
        this.playAudioCue('command', '采集')
        return
      }

      case 'attack':
        this.issueCommand(controllable, { type: 'attack', target })
        this.planPathForUnits(controllable, target.mesh.position)
        this.playAudioCue('command', '攻击')
        return

      case 'resumeConstruction': {
        const { gatherers } = splitGatherCapableUnits(controllable)
        let assigned = 0
        for (const worker of gatherers) {
          if (this.assignBuilderToConstruction(worker, target)) assigned++
        }
        if (assigned > 0) {
          this.feedback.showMoveIndicator(target.mesh.position.x, target.mesh.position.z)
          this.playAudioCue('command', '续建')
          return
        }
        break
      }

      case 'moveToUnit':
        break
    }

    // 右键己方建筑/单位，或续建无人可分配 → 移动到目标旁
    this.issueCommand(controllable, { type: 'move', target: target.mesh.position })
    this.planPathForUnitsToBuildingInteraction(controllable, target)
    this.suppressAggroFor(controllable)
    this.feedback.showMoveIndicator(target.mesh.position.x, target.mesh.position.z)
    this.playAudioCue('command', '移动')
  }

  private handleRightClickGroundTarget(groundTarget: THREE.Vector3) {
    const controllable = this.getSelectedControllableUnits()
    this.interruptChanneledCastsForOrder(controllable)

    // Shift + 右键地面 → 追加移动到队列（不覆盖当前移动，不触发采集）
    if (this.shiftHeld) {
      for (const u of controllable) {
        const firstCmd = enqueueQueuedCommand(u, { type: 'move', target: groundTarget.clone() })
        if (firstCmd) this.executeQueuedCommand(u, firstCmd)
      }
      this.feedback.showQueuedMoveIndicator(groundTarget.x, groundTarget.z)
      this.playAudioCue('command', '追加移动')
      return
    }

    const nearestTree = this.findNearestReachableTree(groundTarget, 2)
    if (nearestTree) {
      this.issueLumberRightClick(controllable, nearestTree)
    } else {
      this.issueGroundMoveRightClick(controllable, groundTarget)
    }
    this.feedback.showMoveIndicator(groundTarget.x, groundTarget.z)
    this.playAudioCue('command', '移动')
  }

  private issueLumberRightClick(controllable: Unit[], nearestTree: TreeEntry) {
    const { gatherers, others } = splitGatherCapableUnits(controllable)
    this.issueCommand(gatherers, { type: 'gather', resourceType: 'lumber', target: nearestTree.mesh.position })
    assignLumberGatherTarget(gatherers, nearestTree)
    this.planPathForUnitsToTreeInteraction(gatherers, nearestTree)
    if (others.length > 0) {
      this.issueCommand(others, { type: 'move', target: nearestTree.mesh.position })
      this.planPathForUnits(others, nearestTree.mesh.position)
      this.suppressAggroFor(others)
    }
  }

  private issueGroundMoveRightClick(controllable: Unit[], groundTarget: THREE.Vector3) {
    this.issueCommand(controllable, { type: 'move', target: groundTarget })
    this.planPathForUnits(controllable, groundTarget)
    this.suppressAggroFor(controllable)
  }

  /** 攻击移动：左键点击地面 */
  private handleAttackMoveClick() {
    this.raycaster.setFromCamera(this.mouseNDC, this.camera)
    const target = this.resolvePointerGroundPoint()
    if (!target) return
    const controllable = this.getSelectedControllableUnits()
    this.interruptChanneledCastsForOrder(controllable)

    // Shift + attackMove → 追加到队列
    if (this.shiftHeld) {
      for (const u of controllable) {
        const firstCmd = enqueueQueuedCommand(u, { type: 'attackMove', target: target.clone() })
        if (firstCmd) this.executeQueuedCommand(u, firstCmd)
      }
      this.feedback.showAttackMoveIndicator(target.x, target.z)
      this.playAudioCue('command', '追加攻击移动')
      return
    }

    this.issueCommand(controllable, { type: 'attackMove', target })
    for (const u of controllable) {
      this.planAttackMovePath(u, target)
    }
    // 红色攻击移动指示器
    this.feedback.showAttackMoveIndicator(target.x, target.z)
    this.playAudioCue('command', '攻击移动')
  }


  /** Water Elemental ground-target mode: enter */
  private enterWaterElementalTargetMode(caster: Unit) {
    this.enterHeroTargetMode('waterElemental', caster, '召唤水元素 — 左键点击目标位置，右键/Esc取消')
  }

  /** Water Elemental ground-target mode: handle click */
  private handleWaterElementalTargetClick() {
    if (!this.weTargetCaster) return false
    this.raycaster.setFromCamera(this.mouseNDC, this.camera)
    const target = this.resolvePointerGroundPoint()
    if (!target) {
      this.showHeroTargetInvalid(this.weTargetCaster, '水元素：没有选中地面')
      return false
    }
    const ok = this.castSummonWaterElemental(this.weTargetCaster, target.x, target.z)
    if (!ok) {
      this.showHeroTargetInvalid(this.weTargetCaster, '水元素：目标被阻挡、超出距离、法力不足或正在冷却')
    }
    return ok
  }

  /** 集结点：左键点击地面/金矿 */
  private handleRallyClick() {
    if (!this.rallyBuilding) return
    const building = this.rallyBuilding

    // 先检查是否点击了单位/金矿
    this.raycaster.setFromCamera(this.mouseNDC, this.camera)
    const unitHits = this.resolvePointerUnitHits()

    if (unitHits.length > 0) {
      const target = selectGoldmineTarget(unitHits)
      // 点击金矿 → 设为 goldmine rally
      if (target) {
        this.issueCommand([], { type: 'setRally', building, target: target.mesh.position, rallyTarget: target })
        this.feedback.showMoveIndicator(target.mesh.position.x, target.mesh.position.z)
        return
      }
    }

    // 点击地面 → 设为普通位置 rally
    const target = this.resolvePointerGroundPoint()
    if (!target) return
    this.issueCommand([], { type: 'setRally', building, target })
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
    const rect = normalizeScreenRect(this.dragStart.x, this.dragStart.y, ex, ey)

    if (isTinySelectionRect(rect)) {
      this.setMouseNdcFromScreenPoint(ex, ey)
      this.handleClick()
      return
    }

    // 如果没有 Shift，先清除现有选择
    if (!shouldAppend) {
      this.clearSelection()
    }

    const boxUnits = getFriendlyUnitsInScreenRect(
      this.units,
      rect,
      this.camera,
      window.innerWidth,
      window.innerHeight,
      0,
    )
    for (const unit of boxUnits) {
      // Shift+框选时避免重复添加
      if (!shouldAppend || !this.selectionModel.contains(unit)) {
        this.selectUnit(unit)
      }
    }

    // 强制刷新 HUD 缓存：框选完成后立即让下一帧更新命令卡和选择信息
    // 没有这行，Shift+框选后命令卡不会更新（因为 clearSelection 被跳过了）
    this._lastCmdKey = ''
    this._lastSelKey = ''
  }

  // ==================== 选择管理 ====================

  private markSelectionDirty() {
    this._lastCmdKey = ''
    this._lastSelKey = ''
  }

  private refreshSelectionVisuals(clearQueueIndicators = false) {
    this.markSelectionDirty()
    this.sel.clearSelectionRings()
    for (const unit of this.selectedUnits) {
      this.sel.createSelectionRing(unit)
    }
    if (clearQueueIndicators) this.feedback.clearQueueIndicators()
  }

  private replaceSelection(units: readonly Unit[]) {
    this.selectionModel.setSelection([...units])
    this.refreshSelectionVisuals(true)
  }

  private appendSelectionUnits(units: readonly Unit[]) {
    let changed = false
    for (const unit of units) {
      if (this.selectionModel.contains(unit)) continue
      this.selectionModel.add(unit)
      this.sel.createSelectionRing(unit)
      changed = true
    }
    if (changed) this.markSelectionDirty()
  }

  private selectUnit(unit: Unit) {
    this.selectionModel.add(unit)
    this.sel.createSelectionRing(unit)
    this.markSelectionDirty()
  }

  private clearSelection() {
    this.selectionModel.clear()
    this.markSelectionDirty()
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
    } else if (type === 'priest') {
      // 牧师：瘦长长袍 + 团队色头巾 + 治疗光环暗示
      const body = new THREE.Mesh(
        new THREE.CylinderGeometry(0.22, 0.30, 0.8, 8),
        new THREE.MeshLambertMaterial({ color: 0xf0e8d0 }),
      )
      body.position.y = 0.4
      group.add(body)
      // 团队色肩带
      const sash = new THREE.Mesh(
        new THREE.BoxGeometry(0.06, 0.6, 0.40),
        new THREE.MeshLambertMaterial({ color }),
      )
      sash.position.set(0, 0.55, 0.14)
      group.add(sash)
      // 头（肤色）
      const head = new THREE.Mesh(
        new THREE.SphereGeometry(0.14, 8, 6),
        new THREE.MeshLambertMaterial({ color: 0xddc8a0 }),
      )
      head.position.y = 0.96
      group.add(head)
      // 兜帽（团队色，覆盖头顶）
      const hood = new THREE.Mesh(
        new THREE.ConeGeometry(0.18, 0.24, 8),
        new THREE.MeshLambertMaterial({ color }),
      )
      hood.position.y = 1.10
      group.add(hood)
      // 法杖（细长杆 + 顶部光球）
      const staff = new THREE.Mesh(
        new THREE.CylinderGeometry(0.02, 0.02, 1.1, 4),
        new THREE.MeshLambertMaterial({ color: 0x8b6914 }),
      )
      staff.position.set(0.28, 0.65, 0)
      group.add(staff)
      const orb = new THREE.Mesh(
        new THREE.SphereGeometry(0.08, 8, 6),
        new THREE.MeshLambertMaterial({ color: 0xffffff, emissive: 0x88aaff }),
      )
      orb.position.set(0.28, 1.25, 0)
      group.add(orb)
    } else if (type === 'mortar_team') {
      // 迫击炮小队：矮胖 + 大口径炮管 + 团队色头巾
      const body = new THREE.Mesh(
        new THREE.CylinderGeometry(0.24, 0.30, 0.55, 8),
        new THREE.MeshLambertMaterial({ color: 0x6b5b3a }),
      )
      body.position.y = 0.28
      group.add(body)
      // 头（肤色）
      const mtHead = new THREE.Mesh(
        new THREE.SphereGeometry(0.13, 8, 6),
        new THREE.MeshLambertMaterial({ color: 0xddc8a0 }),
      )
      mtHead.position.y = 0.68
      group.add(mtHead)
      // 团队色头巾
      const bandana = new THREE.Mesh(
        new THREE.CylinderGeometry(0.15, 0.15, 0.06, 8),
        new THREE.MeshLambertMaterial({ color }),
      )
      bandana.position.y = 0.72
      group.add(bandana)
      // 炮管（粗圆管）
      const barrel = new THREE.Mesh(
        new THREE.CylinderGeometry(0.08, 0.08, 0.7, 6),
        new THREE.MeshLambertMaterial({ color: 0x555555 }),
      )
      barrel.position.set(0.25, 0.55, 0)
      barrel.rotation.z = -Math.PI / 6
      group.add(barrel)
      // 炮座（方盒）
      const mount = new THREE.Mesh(
        new THREE.BoxGeometry(0.35, 0.18, 0.3),
        new THREE.MeshLambertMaterial({ color: 0x666655 }),
      )
      mount.position.set(0, 0.18, 0)
      group.add(mount)
      // 炮轮（两侧）
      for (const sx of [-1, 1]) {
        const wheel = new THREE.Mesh(
          new THREE.CylinderGeometry(0.12, 0.12, 0.04, 8),
          new THREE.MeshLambertMaterial({ color: 0x5c3a1e }),
        )
        wheel.position.set(sx * 0.22, 0.12, 0)
        wheel.rotation.z = Math.PI / 2
        group.add(wheel)
      }
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
    } else if (type === 'workshop') {
      // 车间：工业风格 + 大门 + 团队色旗帜
      const stonework = new THREE.Mesh(
        new THREE.BoxGeometry(2.6, 0.3, 2.4),
        new THREE.MeshLambertMaterial({ color: 0x707060 }),
      )
      stonework.position.y = 0.15
      group.add(stonework)
      // 主墙体
      const wsBase = new THREE.Mesh(
        new THREE.BoxGeometry(2.4, 0.9, 2.2),
        new THREE.MeshLambertMaterial({ color: 0x504030 }),
      )
      wsBase.position.y = 0.75
      group.add(wsBase)
      // 大门口（暗色凹陷，比兵营更宽）
      const wsDoor = new THREE.Mesh(
        new THREE.BoxGeometry(1.0, 0.8, 0.06),
        new THREE.MeshLambertMaterial({ color: 0x1a1208 }),
      )
      wsDoor.position.set(0, 0.55, 1.13)
      group.add(wsDoor)
      // 屋顶
      const wsRoof = new THREE.Mesh(
        new THREE.ConeGeometry(1.9, 1.1, 4),
        new THREE.MeshLambertMaterial({ color: 0x4a3a2a }),
      )
      wsRoof.position.y = 1.8
      wsRoof.rotation.y = Math.PI / 4
      group.add(wsRoof)
      // 齿轮装饰（门口上方）
      const gear = new THREE.Mesh(
        new THREE.TorusGeometry(0.15, 0.04, 6, 8),
        new THREE.MeshLambertMaterial({ color: 0x888888 }),
      )
      gear.position.set(0, 1.1, 1.14)
      group.add(gear)
      // 烟囱
      const chimney = new THREE.Mesh(
        new THREE.BoxGeometry(0.2, 0.7, 0.2),
        new THREE.MeshLambertMaterial({ color: 0x606060 }),
      )
      chimney.position.set(0.8, 2.3, -0.5)
      group.add(chimney)
      // 团队色旗
      const wsFlag = new THREE.Mesh(
        new THREE.PlaneGeometry(0.4, 0.25),
        new THREE.MeshLambertMaterial({ color, side: THREE.DoubleSide }),
      )
      wsFlag.position.set(-0.8, 2.0, 0.7)
      group.add(wsFlag)
    } else if (type === 'arcane_sanctum') {
      // 奥秘圣殿：高塔 + 紫色魔法光球 + 团队色旗帜
      const base = new THREE.Mesh(
        new THREE.BoxGeometry(2.4, 0.3, 2.2),
        new THREE.MeshLambertMaterial({ color: 0x606070 }),
      )
      base.position.y = 0.15
      group.add(base)
      // 主墙体（蓝灰色石砖）
      const asWalls = new THREE.Mesh(
        new THREE.BoxGeometry(2.2, 1.2, 2.0),
        new THREE.MeshLambertMaterial({ color: 0x7070a0 }),
      )
      asWalls.position.y = 0.9
      group.add(asWalls)
      // 拱门
      const asDoor = new THREE.Mesh(
        new THREE.BoxGeometry(0.7, 1.0, 0.06),
        new THREE.MeshLambertMaterial({ color: 0x1a1208 }),
      )
      asDoor.position.set(0, 0.65, 1.03)
      group.add(asDoor)
      // 尖塔
      const asSpire = new THREE.Mesh(
        new THREE.ConeGeometry(0.6, 1.5, 6),
        new THREE.MeshLambertMaterial({ color: 0x5555aa }),
      )
      asSpire.position.y = 2.25
      group.add(asSpire)
      // 魔法光球（顶部发光）
      const asOrb = new THREE.Mesh(
        new THREE.SphereGeometry(0.2, 8, 6),
        new THREE.MeshLambertMaterial({ color: 0xccccff, emissive: 0x6666cc }),
      )
      asOrb.position.y = 3.15
      group.add(asOrb)
      // 团队色旗
      const asFlag = new THREE.Mesh(
        new THREE.PlaneGeometry(0.4, 0.25),
        new THREE.MeshLambertMaterial({ color, side: THREE.DoubleSide }),
      )
      asFlag.position.set(0.5, 2.8, 0)
      group.add(asFlag)
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
    //   TH (4x4) 是基地核心，金矿 (3x3) 在 NE，但不能贴到让 worker 出生即采集
    //   Barracks (3x3) 在 SW 出口方向，Farm (2x2) 用于填充墙
    //   开放方向 S-SE 用于出兵/集结/扩张
    //
    // 空间语法（从 TH 中心看）：
    //   NE: Gold Mine（短矿线，但有可见往返路线）
    //   C: Town Hall（4x4，基地核心，最大建筑）
    //   SW: Barracks（3x3，出口/军事区）
    //   S-SE: 开阔空地（出兵/集结/扩张方向）

    // Town Hall：tile (10,12) size=4 → occupies (10-13, 12-15)
    this.spawnBuilding('townhall', 0, 10, 12)

    // Gold Mine：TH 右上方 (NE)，留出可见的 worker 往返路线。
    this.spawnBuilding(
      'goldmine',
      -1,
      10 + OPENING_GOLDMINE_OFFSET.x,
      12 + OPENING_GOLDMINE_OFFSET.z,
    )

    // Barracks：TH 左下方 (SW)，tile (5,17) size=3 → occupies (5-7, 17-19)
    this.spawnBuilding(
      'barracks',
      0,
      10 + OPENING_BARRACKS_OFFSET.x,
      12 + OPENING_BARRACKS_OFFSET.z,
    )

    // 5 个农民：TH 南侧空地。第一帧会自动接采金命令，但必须先走过可见矿线。
    for (const offset of OPENING_WORKER_OFFSETS) {
      this.spawnUnit('worker', 0, 10 + offset.x, 12 + offset.z)
    }

    this.autoAssignOpeningGoldWorkers(0)

    // ===== AI 基地区（地图右上角，镜像布局）=====
    const far = 50
    this.spawnBuilding('townhall', 1, far, far)
    this.spawnBuilding('goldmine', -1, far + OPENING_GOLDMINE_OFFSET.x, far + OPENING_GOLDMINE_OFFSET.z)
    this.spawnBuilding('barracks', 1, far + OPENING_BARRACKS_OFFSET.x, far + OPENING_BARRACKS_OFFSET.z)
    for (const offset of OPENING_WORKER_OFFSETS) {
      this.spawnUnit('worker', 1, far + offset.x, far + offset.z)
    }

    this.spawnNeutralCamps()

    // 初始镜头：聚焦玩家基地中心，让 TH + 金矿 + 农民一屏尽收
    this.cameraCtrl.distance = 26
    this.cameraCtrl.setTarget(14, 14)
  }

  private spawnNeutralCamps() {
    const camps: readonly { x: number; z: number; units: readonly { type: string; dx: number; dz: number }[] }[] = [
      {
        x: 27,
        z: 28,
        units: [
          { type: 'forest_troll', dx: -1, dz: 0 },
          { type: 'forest_troll', dx: 1, dz: 0 },
          { type: 'ogre_warrior', dx: 0, dz: 1 },
        ],
      },
      {
        x: 36,
        z: 34,
        units: [
          { type: 'forest_troll', dx: -1, dz: 0 },
          { type: 'ogre_warrior', dx: 1, dz: 0 },
        ],
      },
    ]

    for (const camp of camps) {
      for (const entry of camp.units) {
        const creep = this.spawnUnit(entry.type, 2, camp.x + entry.dx, camp.z + entry.dz)
        creep.state = UnitState.HoldPosition
        creep.aggroSuppressUntil = this.gameTime + 3
      }
    }
  }

  private spawnUnit(type: string, team: number, x: number, z: number): Unit {
    const mesh = createUnitVisual(type, team)
    const def = UNITS[type]
    const h = this.getWorldHeight(x, z)
    mesh.position.set(x + 0.5, h, z + 0.5)
    this.scene.add(mesh)
    this.outlineObjects.push(mesh)

    const unit = createRuntimeUnitState({
      mesh,
      type,
      team,
      hp: def?.hp ?? 250,
      maxHp: def?.hp ?? 250,
      speed: def?.speed ?? 3,
      isBuilding: false,
      attackDamage: def?.attackDamage ?? 5,
      attackRange: def?.attackRange ?? MELEE_RANGE,
      attackCooldown: def?.attackCooldown ?? 1.5,
      armor: def?.armor ?? 0,
      buildProgress: 1,
      remainingGold: 0,
      mana: UNITS[type]?.maxMana ?? 0,
      maxMana: UNITS[type]?.maxMana ?? 0,
      manaRegen: UNITS[type]?.manaRegen ?? 0,
      heroLevel: UNITS[type]?.isHero ? (UNITS[type]?.heroLevel ?? 1) : undefined,
      heroXP: UNITS[type]?.isHero ? (UNITS[type]?.heroXP ?? 0) : undefined,
      heroSkillPoints: UNITS[type]?.isHero ? (UNITS[type]?.heroSkillPoints ?? HERO_XP_RULES.initialSkillPoints) : undefined,
      abilityLevels: UNITS[type]?.isHero ? {} : undefined,
    })
    this.units.push(unit)
    this.createHealthBar(unit)

    // Apply completed research bonuses to newly spawned units
    this.applyCompletedResearchesToUnit(unit)

    return unit
  }

  private spawnBuilding(type: string, team: number, x: number, z: number): Unit {
    const mesh = createBuildingVisual(type, team)
    const def = BUILDINGS[type]
    const h = this.getWorldHeight(x, z)
    mesh.position.set(x + 0.5, h, z + 0.5)
    this.scene.add(mesh)
    this.outlineObjects.push(mesh)

    const unit = createRuntimeUnitState({
      mesh,
      type,
      team,
      hp: def?.hp ?? 500,
      maxHp: def?.hp ?? 500,
      speed: 0,
      isBuilding: true,
      attackDamage: def?.attackDamage ?? 0,
      attackRange: def?.attackRange ?? 0,
      attackCooldown: def?.attackCooldown ?? 2,
      armor: def?.key === 'tower' ? 0 : 2,
      buildProgress: 1,
      remainingGold: type === 'goldmine' ? GOLDMINE_GOLD : 0,
      mana: 0,
      maxMana: 0,
      manaRegen: 0,
    })
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

  public __testTriggerAudioCue(kind: AudioCueKind, label: string) {
    this.playAudioCue(kind, label)
  }

  /**
   * Browser-side asset pipeline contracts for Playwright.
   *
   * These hooks deliberately run inside the live built game bundle, not in the
   * Node test process, so they exercise the same AssetLoader cache and visual
   * factories that the runtime uses.
   */
  public __testRunAssetPipelineContracts() {
    const source = createAssetPipelineFixture(2.5)
    const cloneA = __testDeepCloneWithMaterials(source)
    const cloneB = __testDeepCloneWithMaterials(source)
    const sourceMesh = getFirstMesh(source)
    const meshA = getFirstMesh(cloneA)
    const meshB = getFirstMesh(cloneB)
    const sourceMaterials = asMaterialArray(sourceMesh.material)
    const materialsA = asMaterialArray(meshA.material)
    const materialsB = asMaterialArray(meshB.material)

    const materialArrayIsolated =
      Array.isArray(meshA.material) &&
      Array.isArray(meshB.material) &&
      meshA.material !== meshB.material &&
      meshA.material !== sourceMesh.material
    const materialObjectsIsolated = materialsA.every((mat, idx) =>
      mat !== sourceMaterials[idx] && mat !== materialsB[idx],
    )

    const cleanupTeamAsset = __testInjectFakeAsset('footman', createAssetPipelineFixture(2.5), 2.5, 0, 'unit')
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
      const blueTeamMat = findNamedMaterial(visualBlue, 'team_color')
      const redTeamMat = findNamedMaterial(visualRed, 'team_color')
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
    const summary = summarizeObject3D(visual)
    disposeObject3DDeep(visual)
    return summary
  }

  public __testCreateItemVisualSummary(type: ItemKey) {
    const visual = createItemVisual(type)
    const summary = summarizeObject3D(visual)
    disposeObject3DDeep(visual)
    return summary
  }

  public __testGetAssetStatus(key: string) {
    return getAssetStatus(key)
  }

  public __testGetAssetAnimationClipNames(key: string) {
    return getAssetAnimationClipNames(key)
  }

  public __testRunAnimationClipPresentationContract() {
    const clip = new THREE.AnimationClip('Walk', 0.6, [
      new THREE.VectorKeyframeTrack(
        'asset-pipeline-material-less-group.position',
        [0, 0.3, 0.6],
        [0, 0, 0, 0, 0.18, 0, 0, 0, 0],
      ),
    ])
    const cleanupAsset = __testInjectFakeAsset('footman', createAssetPipelineFixture(1.5), 1.5, 0, 'unit', [clip])
    try {
      const unit = this.spawnUnit('footman', 0, 22, 22)
      unit.state = UnitState.Moving
      unit.moveTarget = new THREE.Vector3(23, unit.mesh.position.y, 22)
      this.unitPresentation.update(this.units, 0.05, this.gameTime + 0.05)
      const unitPresentation = this.getUnitPresentationSnapshot()
      const identity = this.getVisualAudioIdentitySnapshot()
      const entry = unitPresentation.entries.find(item => item.meshId === unit.mesh.id) ?? null
      return {
        injectedClipNames: unit.mesh.userData.assetAnimationClipNames ?? [],
        entry,
        unitPresentation,
        identityPresentation: identity.presentation,
      }
    } finally {
      cleanupAsset()
    }
  }

  public __testRecordPlaytestError(message: string, source = 'runtime-test') {
    this.recordPlaytestRuntimeError('test', message, source)
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

    const cleanupAsset = __testInjectFakeAsset('footman', createAssetPipelineFixture(2.5), 2.5, 0, 'unit')
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
        renderableMeshCount: countRenderableMeshes(unit.mesh),
        flashHitError,
        dealDamageError,
      }
    } finally {
      cleanupAsset()
      this.removeTestUnit(unit)
    }
    return result
  }

  private removeTestUnit(unit: Unit) {
    const idx = this.units.indexOf(unit)
    if (idx >= 0) this.units.splice(idx, 1)

    const oi = this.outlineObjects.indexOf(unit.mesh)
    if (oi >= 0) this.outlineObjects.splice(oi, 1)

    this.healthBarRenderer.remove(unit)

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
      findNearestGoldmine: (unit) => findNearestGoldmine(unit.mesh.position, this.units),
      findNearestTreeEntry: (pos, maxRange) => this.findNearestReachableTree(pos, maxRange ?? 30),
      spawnUnit: (type, team, x, z) => this.spawnUnit(type, team, x, z),
      spawnBuilding: (type, team, x, z) => this.spawnBuilding(type, team, x, z),
      getWorldHeight: (wx, wz) => this.getWorldHeight(wx, wz),
      planPath: (unit, target) => this.planPath(unit, target),
      planPathToBuildingInteraction: (unit, target) => this.planPathToBuildingInteraction(unit, target),
      planPathToTreeInteraction: (unit, target) => this.planPathToTreeInteraction(unit, target),
      castHolyLight: (caster, target) => this.aiCastHolyLight(caster, target),
      castDivineShield: (caster) => this.aiCastDivineShield(caster),
      castResurrection: (caster) => this.aiCastResurrection(caster),
      castSummonWaterElemental: (caster, tx, tz) => this.aiCastSummonWaterElemental(caster, tx, tz),
      castBlizzard: (caster, tx, tz) => this.aiCastBlizzard(caster, tx, tz),
      castStormBolt: (caster, target) => this.aiCastStormBolt(caster, target),
      castThunderClap: (caster) => this.aiCastThunderClap(caster),
      castAvatar: (caster) => this.aiCastAvatar(caster),
      purchaseShopItem: (shop, itemKey) => this.purchaseShopItem(shop, itemKey),
    }
    const profileIndex = this.sessionPreferences.aiDifficulty === 'rush' ? 1 : 0
    this.ai = new SimpleAI(ctx, profileIndex)
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

      this.replaceUnitMeshVisual(unit, newVisual)
    }

    // 替换树木
    this.refreshTreeVisuals()
  }

  private replaceUnitMeshVisual(unit: Unit, newVisual: THREE.Group) {
    // 保留旧位置/旋转，但不复制 fallback 的 scale。
    // 新 glTF 的 scale 已由 AssetLoader 按 AssetCatalog 设置好。
    const pos = unit.mesh.position.clone()
    const rot = unit.mesh.rotation.clone()
    const oldMesh = unit.mesh

    const oi = this.outlineObjects.indexOf(oldMesh)
    if (oi >= 0) this.outlineObjects.splice(oi, 1)

    this.scene.remove(oldMesh)
    disposeObject3DDeep(oldMesh)

    unit.mesh = newVisual
    unit.mesh.position.copy(pos)
    unit.mesh.rotation.copy(rot)

    if (unit.isBuilding && unit.buildProgress < 1) {
      const buildScale = 0.3 + 0.7 * unit.buildProgress
      unit.mesh.scale.setScalar(buildScale)
    }

    this.scene.add(unit.mesh)
    this.outlineObjects.push(unit.mesh)

    if (this.healthBars.has(unit)) {
      this.healthBarRenderer.remove(unit)
      this.createHealthBar(unit)
    }
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

      const newTree = createTreeVisual()
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
    // TH occupies (10-13, 12-15), goldmine occupies (18-20, 8-10)
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
      const tree = createTreeVisual()
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
      const tree = createTreeVisual()
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
      const d1 = Math.sqrt((x - 12) ** 2 + (z - 14) ** 2)
      const d2 = Math.sqrt((x - 50) ** 2 + (z - 50) ** 2)
      if (d1 < 16 || d2 < 16) continue

      const h = this.getWorldHeight(x, z)
      const scale = 0.6 + rng() * 0.5
      const tree = createTreeVisual()
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
    this.updateHeroAbilityPreviews()
    this.updateTrainQueueUI()
    this.renderObjectiveTracker()
    this.renderPressureTracker()
    this.renderMapObjectiveRadar()
    this.renderWar3IdentityStatus()
    this.renderHumanRoutePanel()
    this.renderMilestoneStatusPanel()
    this.renderPlaytestReadinessPanel()

    // 编组召回反馈倒计时
    if (this.groupHintTimer > 0) {
      this.groupHintTimer -= dt
      if (this.groupHintTimer <= 0) {
        this.updateModeHint('')
      }
    }
    if (this.commandHintTimer > 0) {
      this.commandHintTimer -= dt
      if (this.commandHintTimer <= 0 && this.groupHintTimer <= 0) {
        this.updateModeHint('')
      }
    }
    if (this.objectiveHintTimer > 0) {
      this.objectiveHintTimer -= dt
      if (this.objectiveHintTimer <= 0 && this.groupHintTimer <= 0 && this.commandHintTimer <= 0) {
        this.updateModeHint('')
      }
    }
  }

  private updateHeroAbilityPreviews() {
    const hero = this.getHeroMilestoneSnapshot()
    this.feedback.updateAbilityPreviews(hero.abilityPresentation.previewRings)
    this.feedback.updateResurrectionReadability({
      corpseMarkers: hero.resurrectionReadability.corpseMarkers,
      radiusRings: hero.resurrectionReadability.radiusRings,
    })
  }

  private updateSelectionHUD() {
    const primaryType = this.selectionModel.primaryType
    const selectedUnits = this.selectedUnits

    if (selectedUnits.length === 0) {
      if (this._lastSelKey !== '') {
        this.selectionHudPresenter.renderNoSelection()
        this._lastSelKey = ''
      }
      return
    }

    if (selectedUnits.length > 1) {
      const selKey = buildMultiSelectionHudKey(selectedUnits, primaryType)
      const rebuildBreakdown = selKey !== this._lastSelKey
      this.selectionHudPresenter.renderMultiSelection(selectedUnits, primaryType, rebuildBreakdown)
      this._lastSelKey = selKey
      return
    }

    const primary = this.selectionModel.primary!
    const runtimeState = {
      gameTime: this.gameTime,
      blizzardChannel: this.blizzardChannel,
      massTeleportPending: this.massTeleportPending,
    }
    const selKey = buildSingleSelectionHudKey(primary, runtimeState)
    if (selKey === this._lastSelKey) return

    this._lastSelKey = selKey
    this.selectionHudPresenter.renderSingleSelection(primary, runtimeState)
  }

  // ==================== 命令卡 ====================

  private updateCommandCard() {
    // 关键：只在选择变化时重建，否则按钮每帧被销毁导致无法点击
    const primary = this.selectionModel.primary
    if (primary !== this._lastCommandCardPrimary) {
      this.commandCardPresenter.resetPage()
      this._lastCommandCardPrimary = primary
    }
    const selKey = buildCommandCardStateKey({
      primary,
      units: this.units,
      playerTeam: 0,
      gameTime: this.gameTime,
      resources: this.resources.get(0),
      supply: this.resources.computeSupply(0, this.units),
      queuedSupply: computeQueuedSupply(this.units, 0),
      blizzardChannel: this.blizzardChannel,
      massTeleportPending: this.massTeleportPending,
    })
    if (selKey === this._lastCmdKey) return
    this._lastCmdKey = selKey

    this.commandCardPresenter.clear()

    if (this.selectedUnits.length === 0 || !primary || primary.team !== 0) {
      // 显示固定命令卡空槽，保持 HUD 布局稳定。
      this.commandCardPresenter.renderEmptySlots()
      return
    }

    // 收集要显示的按钮
    const buttons: CommandCardButtonSpec[] = []
    const markCommandCardDirty = () => { this._lastCmdKey = '' }
    const activeHeroTarget = this.getActiveHeroTargetModeSnapshot()
    const activeAbilityKey = activeHeroTarget?.casterType === primary.type
      ? activeHeroTarget.abilityKey
      : undefined

    buttons.push(...buildWorkerCommandButtons({
      primary,
      selectedUnits: this.selectedUnits,
      units: this.units,
      playerTeam: 0,
      markDirty: markCommandCardDirty,
      getBuildAvailability: (buildingType, team) =>
        checkBuildAvailability(this.units, this.resources, buildingType, team),
      enterPlacementMode: (buildingType) => this.enterPlacementMode(buildingType),
      isMainHall: isMainHallType,
      morphToMilitia: (unit) => this.morphToMilitia(unit),
    }))

    buttons.push(...buildConstructionCommandButtons({
      primary,
      cancelRefundRate: CONSTRUCTION_CANCEL_REFUND_RATE,
      cancelConstruction: (building) => this.cancelConstruction(building),
    }))

    // 可移动军事单位：显示 停止 / 驻守 / 攻击移动
    if (!primary.isBuilding && primary.type !== 'worker') {
      buttons.push(...buildBasicUnitCommandButtons({
        primary,
        selectedUnits: this.selectedUnits,
        units: this.units,
        playerTeam: 0,
        markDirty: markCommandCardDirty,
        gameTime: this.gameTime,
        issueCommand: (units, command) => this.issueCommand(units, command),
        suppressAggroFor: (units) => this.suppressAggroFor(units),
        enterAttackMoveMode: () => this.enterAttackMoveMode(),
        triggerRallyCall: (source) => this.triggerRallyCall(source),
        setDefend: (unit, active) => this.setDefend(unit, active),
        castHeal: (caster, target) => this.castHeal(caster, target),
        backToWork: (unit) => this.backToWork(unit),
        castSlow: (caster, target) => this.castSlow(caster, target),
      }))
      if (primary.type === 'paladin') {
        buttons.push(...buildPaladinCommandButtons({
          primary,
          gameTime: this.gameTime,
          activeAbilityKey,
          units: this.units,
          markDirty: markCommandCardDirty,
          castHolyLight: (caster, target) => this.castHolyLight(caster, target),
          castDivineShield: (caster) => this.castDivineShield(caster),
          castResurrection: (caster) => this.castResurrection(caster),
          hasResurrectionTargets: (caster, levelData) =>
            this.getResurrectionEligibleRecordIndices(caster, levelData).length > 0,
        }))
      }

      if (primary.type === 'archmage') {
        buttons.push(...buildArchmageCommandButtons({
          primary,
          gameTime: this.gameTime,
          activeAbilityKey,
          markDirty: markCommandCardDirty,
          enterWaterElementalTargetMode: (caster) => this.enterWaterElementalTargetMode(caster),
          enterBlizzardTargetMode: (caster) => this.enterBlizzardTargetMode(caster),
          enterMassTeleportTargetMode: (caster) => this.enterMassTeleportTargetMode(caster),
          isBlizzardChanneling: (caster) => this.blizzardChannel?.caster === caster,
          isMassTeleportPending: (caster) => this.massTeleportPending?.caster === caster,
          getBlizzardChannelRemaining: (caster) => this.blizzardChannel?.caster === caster
            ? Math.max(0, this.blizzardChannel.nextWaveTime + Math.max(0, this.blizzardChannel.wavesRemaining - 1) * this.blizzardChannel.waveInterval - this.gameTime)
            : 0,
          getMassTeleportPendingRemaining: (caster) => this.massTeleportPending?.caster === caster
            ? Math.max(0, this.massTeleportPending.completeTime - this.gameTime)
            : 0,
        }))
      }

      if (primary.type === 'mountain_king') {
        buttons.push(...buildMountainKingCommandButtons({
          primary,
          gameTime: this.gameTime,
          activeAbilityKey,
          markDirty: markCommandCardDirty,
          enterStormBoltTargetMode: (caster) => this.enterStormBoltTargetMode(caster),
          castThunderClap: (caster) => this.castThunderClap(caster),
          castAvatar: (caster) => this.castAvatar(caster),
        }))
      }

      if (UNITS[primary.type]?.isHero) {
        buttons.push(...buildHeroInventoryCommandButtons({
          primary,
          useInventoryItem: (hero, index) => this.useInventoryItem(hero, index),
          markDirty: markCommandCardDirty,
        }))
      }
    }
    buttons.push(...buildBuildingCommandButtons({
      primary,
      selectedUnits: this.selectedUnits,
      units: this.units,
      playerTeam: 0,
      getTrainAvailability: (unitType, team) =>
        checkTrainAvailability(this.units, this.resources, unitType, team),
      getCostBlockReason: (team, cost) => checkCostBlockReason(this.resources, team, cost),
      getQueuedSupply: (team) => computeQueuedSupply(this.units, team),
      getSupply: (team) => this.resources.computeSupply(team, this.units),
      hasCompletedResearch: (researchKey, team) => checkCompletedResearch(this.units, researchKey, team),
      getResearchAvailability: (researchKey, team) =>
        checkResearchAvailability(this.units, this.resources, researchKey, team),
      getHeroReviveQuote: calculateHeroReviveQuote,
      trainUnit: (building, unitType) => this.trainUnit(building, unitType),
      enterRallyMode: (building) => this.enterRallyMode(building),
      startReviveHero: (altar, heroKey) => this.startReviveHero(altar, heroKey),
      startBuildingUpgrade: (building, targetKey) => this.startBuildingUpgrade(building, targetKey),
      startResearch: (building, researchKey) => this.startResearch(building, researchKey),
      getShopItemAvailability: (shop, itemKey) => this.getShopItemAvailability(shop, itemKey),
      purchaseShopItem: (shop, itemKey) => {
        if (this.purchaseShopItem(shop, itemKey)) markCommandCardDirty()
      },
    }))

    this.commandCardPresenter.renderButtons(buttons)
  }

  // ==================== 训练 ====================

  /** Start hero revive on an Altar */
  private startReviveHero(altar: Unit, heroKey: string) {
    if (altar.team !== 0) return
    if (!altar.isBuilding || altar.buildProgress < 1) return
    const buildingDef = BUILDINGS[altar.type]
    if (!buildingDef?.trains?.includes(heroKey)) return

    // Verify dead hero still exists
    const deadHero = this.units.find(
      u => u.team === altar.team && u.type === heroKey && !u.isBuilding && u.isDead,
    )
    if (!deadHero) return

    // Reject if already queued on any altar
    const alreadyQueued = this.units.some(
      u => u.team === altar.team && u.isBuilding && u.reviveQueue.some((rv: any) => rv.heroType === heroKey),
    )
    if (alreadyQueued) return

    const quote = calculateHeroReviveQuote(deadHero)
    if (!quote) return

    // Check and spend resources
    if (!this.resources.canAfford(altar.team, { gold: quote.gold, lumber: quote.lumber })) return
    this.resources.spend(altar.team, { gold: quote.gold, lumber: quote.lumber })

    altar.reviveQueue.push({ heroType: heroKey, remaining: quote.totalDuration, totalDuration: quote.totalDuration })
  }

  private trainUnit(building: Unit, unitType: string) {
    const def = UNITS[unitType]
    if (!def) return
    if (def.isHero) {
      const hasExistingHero = this.units.some(
        u => u.team === building.team && u.type === unitType && !u.isBuilding,
      )
      const hasQueuedHero = this.units.some(
        u => u.team === building.team && u.isBuilding && u.trainingQueue.some((item: any) => item.type === unitType),
      )
      if (hasExistingHero || hasQueuedHero) return
    }
    // Tech prerequisite gate — same check as getTrainAvailability
    if (def.techPrereq && !this.units.some(
      u => u.team === 0 && u.type === def.techPrereq && u.isBuilding
        && u.buildProgress >= 1 && u.hp > 0,
    )) return
    // Multi-building prerequisite gate
    if (def.techPrereqs) {
      for (const prereqKey of def.techPrereqs) {
        if (!this.units.some(
          u => u.team === 0 && u.type === prereqKey && u.isBuilding
            && u.buildProgress >= 1 && u.hp > 0,
        )) return
      }
    }
    if (!this.resources.canAfford(0, def.cost)) return

    // 检查人口上限（含训练队列中的单位，防止超额训练）
    const supply = this.resources.computeSupply(0, this.units)
    const queuedSupply = computeQueuedSupply(this.units, 0)
    if (supply.used + queuedSupply + def.supply > supply.total) return

    this.resources.spend(0, def.cost)
    this.issueCommand([], { type: 'train', building, unitType, trainTime: def.trainTime })
  }

  // ==================== 建筑升级（数据驱动主基地升级）====================

  private startBuildingUpgrade(building: Unit, targetKey: string) {
    const team = building.team
    if (team !== 0) return
    if (!building.isBuilding || building.buildProgress < 1) return
    if (building.upgradeQueue) return // already upgrading

    const currentDef = BUILDINGS[building.type]
    if (currentDef?.upgradeTo !== targetKey) return

    const targetDef = BUILDINGS[targetKey]
    if (!targetDef) return
    if (!this.resources.canAfford(team, targetDef.cost)) return

    this.resources.spend(team, targetDef.cost)
    this.issueCommand([], { type: 'upgradeBuilding', building, targetKey, upgradeTime: targetDef.buildTime })
  }

  // ==================== 研究 ====================

  private startResearch(building: Unit, researchKey: string) {
    const def = RESEARCHES[researchKey]
    if (!def) return
    const team = building.team
    if (!checkResearchAvailability(this.units, this.resources, researchKey, team).ok) return

    this.resources.spend(team, def.cost)
    building.researchQueue.push({ key: researchKey, remaining: def.researchTime })
  }

  private updateTrainQueueUI() {
    this.trainingQueuePresenter.render(buildTrainingQueueItems(this.units))
  }

  private renderObjectiveTracker(force = false) {
    if (!this.elObjectiveList) return
    const objectives = this.buildCurrentSkirmishObjectives()
    const key = buildObjectiveStateKey(objectives)
    if (!force && key === this._lastObjectiveKey) return
    this._lastObjectiveKey = key

    const newlyCompleted = objectives.filter(objective =>
      objective.completed && !this.completedObjectiveKeys.has(objective.key),
    )
    const shouldFlashCompletions = this.objectiveTrackerPrimed && newlyCompleted.length > 0

    this.elObjectiveList.replaceChildren(...objectives.map((objective) => {
      const item = document.createElement('li')
      const justCompleted = shouldFlashCompletions && newlyCompleted.some(done => done.key === objective.key)
      item.className = `objective-item${justCompleted ? ' objective-item--new' : ''}`
      item.dataset.key = objective.key
      item.dataset.complete = objective.completed ? 'true' : 'false'
      item.dataset.tone = objective.tone
      item.title = objective.detail
      item.setAttribute('aria-label', `${objective.label}: ${objective.progressText}`)

      const icon = document.createElement('span')
      icon.className = 'objective-icon'
      icon.textContent = objective.icon

      const state = document.createElement('span')
      state.className = 'objective-state'
      state.textContent = objective.completed ? '✓' : '•'

      const body = document.createElement('span')
      body.className = 'objective-body'

      const name = document.createElement('span')
      name.className = 'objective-name'
      name.textContent = objective.label

      const progress = document.createElement('span')
      progress.className = 'objective-progress'
      progress.textContent = objective.progressText

      const rail = document.createElement('span')
      rail.className = 'objective-rail'

      const railFill = document.createElement('span')
      railFill.className = 'objective-rail-fill'
      railFill.style.width = `${Math.round(Math.max(0, Math.min(1, objective.progressValue)) * 100)}%`
      rail.append(railFill)

      body.append(name, progress, rail)
      item.append(icon, body, state)
      return item
    }))

    for (const objective of objectives) {
      if (objective.completed) this.completedObjectiveKeys.add(objective.key)
    }
    if (shouldFlashCompletions) {
      this.objectiveHintTimer = 2.2
      this.updateModeHint(`目标完成：${newlyCompleted.map(objective => objective.label).join('、')}`)
      this.playAudioCue('objective', `目标完成：${newlyCompleted[0]?.label ?? '短局目标'}`)
    }
    this.objectiveTrackerPrimed = true
  }

  private renderPressureTracker(force = false) {
    if (!this.elPressureStage || !this.elPressureWave || !this.elPressureNext || !this.elPressureMeterFill) return
    const pressure = this.getAIPressureSnapshot()
    if (!pressure) return

    const key = [
      pressure.stage,
      pressure.pressure,
      pressure.waveCount,
      Math.ceil(pressure.nextWaveIn),
      pressure.armyCount,
      pressure.creepCampAttempts,
      pressure.shopPurchases,
      pressure.counterAttackCount,
      pressure.defenseResponses,
      pressure.regroupCount,
      pressure.directorPhase,
      pressure.playerBaseThreatLevel,
    ].join(':')
    if (!force && key === this._lastPressureKey) return
    this._lastPressureKey = key

    this.elPressureStage.textContent = `AI ${pressure.difficultyLabel} · ${pressure.stageLabel}`
    this.elPressureWave.textContent = `波次 ${pressure.waveCount}`
    const nextLabel = pressure.waveCount === 0 ? '首波' : '下波'
    this.elPressureNext.textContent = pressure.nextWaveIn > 0
      ? `${pressure.directorPhaseLabel} · ${nextLabel} ${Math.ceil(pressure.nextWaveIn)}s`
      : `${pressure.directorPhaseLabel} · ${nextLabel} 就绪`
    this.elPressureMeterFill.style.width = `${Math.max(0, Math.min(100, pressure.pressure))}%`
    if (this.elPressureAlert) {
      const hpSuffix = pressure.playerBaseHpPct !== null && pressure.playerBaseThreatLevel === 'siege'
        ? ` · 基地 ${pressure.playerBaseHpPct}%`
        : ''
      this.elPressureAlert.textContent = `${pressure.playerBaseThreatLabel}${hpSuffix}`
      this.elPressureAlert.dataset.alert = pressure.playerBaseThreatLevel
    }
    const pressureCueKey = `${pressure.stage}:${pressure.playerBaseThreatLevel}:${pressure.waveCount}`
    if (pressureCueKey !== this._lastPressureCueKey &&
      (pressure.stage === 'attacking' ||
        pressure.stage === 'counterattacking' ||
        pressure.playerBaseThreatLevel === 'attack' ||
        pressure.playerBaseThreatLevel === 'siege')) {
      this._lastPressureCueKey = pressureCueKey
      this.playAudioCue('pressure', `AI ${pressure.stageLabel}`)
    } else if (pressureCueKey !== this._lastPressureCueKey) {
      this._lastPressureCueKey = pressureCueKey
    }
  }

  private renderMapObjectiveRadar(force = false) {
    if (!this.elMapObjectiveList) return
    const objectives = this.buildCurrentMapObjectives()
    if (this.sessionPreferences.objectiveBeacons) {
      this.mapObjectiveBeacons.render(objectives)
    } else {
      this.mapObjectiveBeacons.render([])
    }
    const key = buildMapObjectiveStateKey(objectives)
    if (!force && key === this._lastMapObjectiveKey) return
    this._lastMapObjectiveKey = key

    this.elMapObjectiveList.replaceChildren(...objectives.map((objective) => {
      const item = document.createElement('div')
      item.className = 'map-objective-item'
      item.dataset.key = objective.key
      item.dataset.tone = objective.tone
      item.title = objective.detail
      item.setAttribute('aria-label', `${objective.label}: ${objective.status}, ${objective.distanceText}`)

      const icon = document.createElement('span')
      icon.className = 'map-objective-icon'
      icon.textContent = objective.icon

      const body = document.createElement('span')
      body.className = 'map-objective-body'

      const main = document.createElement('span')
      main.className = 'map-objective-main'

      const label = document.createElement('span')
      label.className = 'map-objective-label'
      label.textContent = objective.label

      const status = document.createElement('span')
      status.className = 'map-objective-status'
      status.textContent = objective.status

      const rail = document.createElement('span')
      rail.className = 'map-objective-rail'

      const railFill = document.createElement('span')
      railFill.className = 'map-objective-rail-fill'
      railFill.style.width = `${Math.round(Math.max(0, Math.min(1, objective.progressValue)) * 100)}%`
      rail.append(railFill)

      const distance = document.createElement('span')
      distance.className = 'map-objective-distance'
      distance.textContent = objective.distanceText

      main.append(label, status)
      body.append(main, rail)
      item.append(icon, body, distance)
      return item
    }))
  }

  private renderWar3IdentityStatus(force = false) {
    if (!this.elWar3IdentityStatus) return
    const snapshot = this.getWar3IdentitySnapshot()
    const key = [
      snapshot.completedCount,
      snapshot.totalCount,
      Math.round(snapshot.visibility.visiblePct * 100),
      Math.round(snapshot.visibility.exploredPct * 100),
      snapshot.scoutedObjectiveCount,
      snapshot.visibleNeutralCount,
      snapshot.worldItems.length,
    ].join(':')
    if (!force && key === this._lastWar3IdentityKey) return
    this._lastWar3IdentityKey = key

    this.elWar3IdentityStatus.dataset.complete = snapshot.completed ? 'true' : 'false'
    this.elWar3IdentityStatus.textContent =
      `侦察 ${Math.round(snapshot.visibility.exploredPct * 100)}% · ` +
      `可见 ${Math.round(snapshot.visibility.visiblePct * 100)}% · ` +
      `目标 ${snapshot.scoutedObjectiveCount}/6 · ` +
      `野怪 ${snapshot.visibleNeutralCount} · ` +
      `物品 ${snapshot.worldItems.length} · ` +
      snapshot.verdict
  }

  private updateHumanRouteCompletionFeedback(snapshot: HumanRouteSnapshot) {
    const completedKeys = [
      ...snapshot.steps
        .filter(step => step.completed)
        .map(step => `step:${step.key}`),
      ...snapshot.unlocks
        .filter(unlock => unlock.available && unlock.dataReady)
        .map(unlock => `unlock:${unlock.key}`),
    ]
    const nextCompleted = new Set(completedKeys)
    const newlyCompleted = completedKeys.filter(key => !this.completedHumanRouteKeys.has(key))

    this.completedHumanRouteKeys = nextCompleted
    if (!this.humanRouteFeedbackPrimed) {
      this.humanRouteFeedbackPrimed = true
      this.lastHumanRouteCompletionKeys = []
      return []
    }

    this.lastHumanRouteCompletionKeys = newlyCompleted
    if (newlyCompleted.length > 0) {
      this.humanRouteCompletionCueCount += newlyCompleted.length
      this.audioCues.play('objective', `Human route ${newlyCompleted.length} complete`)
    }
    return newlyCompleted
  }

  private renderHumanRoutePanel(force = false) {
    if (!this.elHumanRoutePanel || !this.elHumanRouteList) return
    this.elHumanRoutePanel.hidden = !this.sessionPreferences.humanRoutePanel
    this.elHumanRoutePanel.setAttribute('aria-hidden', this.sessionPreferences.humanRoutePanel ? 'false' : 'true')
    if (!this.sessionPreferences.humanRoutePanel) return

    const snapshot = this.getHumanRouteSnapshot()
    const key = [
      snapshot.tier.currentTierLabel,
      snapshot.tier.availableUnlockCount,
      snapshot.tier.nextActions.join('/'),
      snapshot.rhythm.phaseLabel,
      snapshot.rhythm.roleCoverageCount,
      snapshot.rhythm.completeRoleCount,
      snapshot.rhythm.recommendedFocus,
      snapshot.combat.compositionCoverageCount,
      snapshot.combat.counterAdvantageCount,
      snapshot.combat.recommendedMix,
      snapshot.upgradeImpact.completedResearchCount,
      snapshot.upgradeImpact.battleReason,
      snapshot.steps
        .map(step => `${step.key}:${Math.round(step.liveProgress * 100)}:${step.status}:${step.completed ? 1 : 0}`)
        .join('|'),
      snapshot.unlocks
        .map(unlock => `${unlock.key}:${unlock.state}:${Math.round(unlock.progress * 100)}:${unlock.status}:${unlock.nextAction}`)
        .join('|'),
    ].join('::')
    const newlyCompletedKeys = new Set(this.updateHumanRouteCompletionFeedback(snapshot))
    if (!force && key === this._lastHumanRouteKey && newlyCompletedKeys.size === 0) return
    this._lastHumanRouteKey = key

    this.elHumanRoutePanel.dataset.complete = snapshot.completed ? 'true' : 'false'
    if (this.elHumanRouteTechSummary) {
      const next = snapshot.tier.nextActions.length > 0
        ? `下一步 ${snapshot.tier.nextActions.join('；')}`
        : `路线已闭环；${snapshot.rhythm.recommendedFocus}`
      this.elHumanRouteTechSummary.textContent =
        `${snapshot.tier.currentTierLabel} · ${snapshot.rhythm.phaseLabel} · 角色 ${snapshot.rhythm.roleCoverageCount}/${snapshot.rhythm.totalRoleCount} · 混编 ${snapshot.combat.compositionCoverageCount}/${snapshot.combat.totalCompositionRoleCount} · 克制 ${snapshot.combat.counterAdvantageCount}/${snapshot.combat.counterRuleCount} · 科技 ${snapshot.upgradeImpact.completedResearchCount}/${snapshot.upgradeImpact.totalTrackedResearchCount} · 解锁 ${snapshot.tier.availableUnlockCount}/${snapshot.tier.totalUnlockCount} · ${next}`
      this.elHumanRouteTechSummary.dataset.complete = snapshot.completed ? 'true' : 'false'
      this.elHumanRouteTechSummary.title = `${snapshot.rhythm.nextPowerSpike}；${snapshot.combat.recommendedMix}；${snapshot.upgradeImpact.battleReason}`
    }
    this.elHumanRouteList.replaceChildren(...snapshot.steps.map((step) => {
      const item = document.createElement('div')
      item.className = 'human-route-item'
      item.dataset.key = step.key
      item.dataset.tone = step.tone
      item.dataset.complete = step.completed ? 'true' : 'false'
      item.dataset.new = newlyCompletedKeys.has(`step:${step.key}`) ? 'true' : 'false'
      item.title = step.detail

      const icon = document.createElement('span')
      icon.className = 'human-route-icon'
      icon.textContent = step.icon
      icon.setAttribute('aria-hidden', 'true')

      const label = document.createElement('span')
      label.className = 'human-route-label'
      label.textContent = step.label

      const status = document.createElement('span')
      status.className = 'human-route-status'
      status.textContent = step.status

      const rail = document.createElement('span')
      rail.className = 'human-route-rail'
      const fill = document.createElement('span')
      fill.className = 'human-route-rail-fill'
      fill.style.width = `${Math.round(step.liveProgress * 100)}%`
      rail.append(fill)

      item.append(icon, label, status, rail)
      return item
    }))
    if (this.elHumanRouteUnlockList) {
      this.elHumanRouteUnlockList.replaceChildren(...snapshot.unlocks.map((unlock) => {
        const item = document.createElement('div')
        item.className = 'human-route-unlock-item'
        item.dataset.key = unlock.key
        item.dataset.tier = unlock.tier
        item.dataset.tone = unlock.tone
        item.dataset.state = unlock.state
        item.dataset.role = unlock.role
        item.dataset.action = unlock.nextAction
        item.dataset.progress = String(Math.round(unlock.progress * 100))
        item.dataset.counter = getHumanUnlockCounterText(unlock.key, snapshot)
        item.dataset.complete = unlock.available && unlock.dataReady ? 'true' : 'false'
        item.dataset.new = newlyCompletedKeys.has(`unlock:${unlock.key}`) ? 'true' : 'false'
        item.title = `${unlock.detail}；${unlock.impact}；${getHumanUnlockCounterText(unlock.key, snapshot)}；下一步：${unlock.nextAction}`

        const icon = document.createElement('span')
        icon.className = 'human-route-unlock-icon'
        icon.textContent = unlock.icon
        icon.setAttribute('aria-hidden', 'true')

        const label = document.createElement('span')
        label.className = 'human-route-unlock-label'
        label.textContent = unlock.label

        const status = document.createElement('span')
        status.className = 'human-route-unlock-status'
        status.textContent = unlock.status

        const role = document.createElement('span')
        role.className = 'human-route-unlock-role'
        role.textContent = `${unlock.role} · ${unlock.nextAction}`

        const counter = document.createElement('span')
        counter.className = 'human-route-unlock-counter'
        counter.textContent = getHumanUnlockCounterText(unlock.key, snapshot)

        item.append(icon, label, status, role, counter)
        return item
      }))
    }
  }

  private renderMilestoneStatusPanel(force = false) {
    if (!this.elFoundationStatus || !this.elHeroTacticsStatus || !this.elAiOpponentStatus || !this.elVisualAudioStatus) return
    const foundation = this.getFoundationMilestoneSnapshot()
    const hero = this.getHeroMilestoneSnapshot()
    const ai = this.getAIOpponentSnapshot()
    const identity = this.getVisualAudioIdentitySnapshot()
    const key = [
      foundation.completedCount,
      foundation.stages.map(stage => `${stage.key}:${stage.completed ? 1 : 0}`).join('|'),
      hero.completedCount,
      hero.maxHeroLevel,
      hero.learnedAbilityCount,
      hero.activeFeedbackCount,
      hero.tacticalAbilityCount,
      hero.tacticalReadyCount,
      hero.tacticalBlockedCount,
      hero.tacticalTargetHintCount,
      hero.abilityPresentation.completedCount,
      hero.abilityPresentation.rangePreviewCount,
      hero.abilityPresentation.areaPreviewCount,
      hero.abilityPresentation.cursorHintCount,
      hero.abilityPresentation.visiblePreviewRingCount,
      hero.abilityPresentation.activeTargetLegalCount,
      hero.abilityPresentation.activeTargetInvalidCount,
      hero.abilityPresentation.activeTargetMarkerCount,
      hero.abilityPresentation.activeTargetEvaluation?.reason ?? '',
      hero.resurrectionReadability.completedCount,
      hero.resurrectionReadability.visibleCorpseMarkerCount,
      hero.resurrectionReadability.visibleEligibleCorpseMarkerCount,
      hero.resurrectionReadability.resurrectionRadiusCount,
      ai.completedCount,
      ai.directorPhase,
      ai.armyCount,
      ai.heroCount,
      identity.completedCount,
      identity.feedbackCueCount,
      identity.loadedAssetCount,
      identity.presentationCheckCount,
      identity.presentation.abilityPreviewRingCount,
      identity.presentation.abilityEffectBurstCount,
      identity.presentation.abilityTargetMarkerCount,
      identity.resultPresentation.completedCount,
      identity.resultPresentation.cardCount,
      identity.resultPresentation.objectiveChipCount,
      identity.resultPresentation.flowStepCount,
      identity.perceptionCheckCount,
      identity.assetReadinessCheckCount,
      identity.combatFeedbackCount,
      identity.perception.audioKindCount,
      identity.perception.deathSignalCount,
      identity.perception.constructionSignalCount,
      identity.assetReadiness.realClipStateCount,
      identity.assetReadiness.requiredClipStateCount,
      identity.assetReadiness.audioAssetCueKindCount,
      identity.assetReadiness.audioCueContractCount,
      identity.unitPresentation.clipBackedUnitCount,
      identity.unitPresentation.proceduralFallbackUnitCount,
      identity.unitPresentation.availableClipUnitCount,
    ].join(':')
    if (!force && key === this._lastMilestoneStatusKey) return
    this._lastMilestoneStatusKey = key

    this.elFoundationStatus.dataset.complete = foundation.completed ? 'true' : 'false'
    this.elFoundationStatus.textContent =
      `R1-R6 基础 ${foundation.completedCount}/${foundation.totalCount} · ${foundation.verdict}`

    this.elHeroTacticsStatus.dataset.complete = hero.completed ? 'true' : 'false'
    this.elHeroTacticsStatus.textContent =
      `R8 英雄 ${hero.completedCount}/${hero.totalCount} · Lv${hero.maxHeroLevel} · 技能 ${hero.learnedAbilityCount} · ${hero.verdict}`

    if (this.elHeroTacticsReadiness) {
      const readinessComplete = hero.tacticalAbilityCount > 0 &&
        hero.tacticalTargetHintCount >= 6 &&
        hero.tacticalAbilityCount === hero.abilityReadiness.length &&
        hero.abilityPresentation.completed
      this.elHeroTacticsReadiness.dataset.complete = readinessComplete ? 'true' : 'false'
      const activeTarget = hero.abilityPresentation.activeTargetEvaluation
      const activeTargetText = activeTarget
        ? ` · 当前目标 ${activeTarget.legal ? '合法' : '非法'}:${activeTarget.reason}`
        : ''
      const resurrectionText = hero.resurrectionReadability.visibleCorpseMarkerCount > 0 ||
        hero.resurrectionReadability.resurrectionRadiusCount > 0
        ? ` · 复活 尸体${hero.resurrectionReadability.visibleCorpseMarkerCount}/可复活${hero.resurrectionReadability.visibleEligibleCorpseMarkerCount}/范围${hero.resurrectionReadability.resurrectionRadiusCount}`
        : ''
      this.elHeroTacticsReadiness.textContent =
        `技能判断 可用 ${hero.tacticalReadyCount}/${hero.tacticalAbilityCount} · 阻断 ${hero.tacticalBlockedCount} · ` +
        `目标提示 ${hero.tacticalTargetHintCount} · 预览 距离${hero.abilityPresentation.rangePreviewCount}/范围${hero.abilityPresentation.areaPreviewCount}/光标${hero.abilityPresentation.cursorHintCount}${activeTargetText}${resurrectionText}`
    }

    this.elAiOpponentStatus.dataset.complete = ai.completed ? 'true' : 'false'
    this.elAiOpponentStatus.textContent =
      `R9 AI ${ai.completedCount}/${ai.totalCount} · ${ai.difficultyLabel} · ${ai.directorPhase} · 军队 ${ai.armyCount} · ${ai.verdict}`

    this.elVisualAudioStatus.dataset.complete = identity.completed ? 'true' : 'false'
    this.elVisualAudioStatus.textContent =
      `R14 反馈 ${identity.completedCount}/${identity.totalCount} · ` +
      `资产 ${identity.loadedAssetCount}/${identity.assetCount} · ` +
      `表现 ${identity.presentationCheckCount}/${identity.presentation.totalCount} · ` +
      `感知 ${identity.perceptionCheckCount}/${identity.perception.totalCount} · ` +
      `门禁 ${identity.assetReadiness.realClipStateCount}/${identity.assetReadiness.requiredClipStateCount}clip ${identity.assetReadiness.audioAssetCueKindCount}/${identity.assetReadiness.audioCueContractCount}音频 · ` +
      `动作 clip ${identity.unitPresentation.clipBackedUnitCount}/fallback ${identity.unitPresentation.proceduralFallbackUnitCount} · ` +
      `技能环 ${identity.presentation.abilityPreviewRingCount}/特效${identity.presentation.abilityEffectBurstCount}/标记${identity.presentation.abilityTargetMarkerCount}/尸体${identity.presentation.corpseMarkerCount} · ` +
      `结果卡 ${identity.resultPresentation.cardCount}/${identity.resultPresentation.objectiveChipCount}/${identity.resultPresentation.flowStepCount} · ` +
      `cue ${identity.feedbackCueCount} · ${identity.verdict}`
  }

  private getCurrentMapSourceLabel() {
    if (!this.currentMapSource) return '未加载'
    if (this.currentMapSource.kind === 'procedural') return '程序化短局地图'
    const terrain = this.currentMapSource.mapData.terrain
    return `W3X ${terrain.width}x${terrain.height} · tileset ${terrain.tileset}`
  }

  private getPlaytestRuntimeInfo(): PlaytestRuntimeInfo {
    const rendererSize = new THREE.Vector2()
    this.renderer.getSize(rendererSize)
    const fps = document.getElementById('fps')?.textContent?.trim() ?? ''
    const result = this.gameOverResult
    const assetEntries = getAllAssetEntries()
    const assetLoadedCount = assetEntries.filter(entry => getAssetStatus(entry.key) === 'loaded').length
    const buildingCount = this.units.filter(unit => unit.isBuilding && unit.hp > 0).length
    const unitCount = this.units.filter(unit => !unit.isBuilding && unit.hp > 0 && !unit.isDead).length
    return {
      buildLabel: PLAYTEST_BUILD_LABEL,
      browser: navigator.userAgent,
      viewport: `${window.innerWidth}x${window.innerHeight}`,
      url: window.location.href,
      mapSource: this.getCurrentMapSourceLabel(),
      modeLabel: this.currentMapSource?.kind === 'parsed' ? 'W3X 地图遭遇战' : '短局遭遇战',
      resultLabel: result ?? (this.phase.isGameOver() ? 'ended' : 'in-progress'),
      gameTimeLabel: this.elTime.textContent?.trim() || '00:00',
      fpsText: fps,
      rendererReady: rendererSize.x > 0 && rendererSize.y > 0,
      devicePixelRatio: Number(window.devicePixelRatio.toFixed(2)),
      hardwareConcurrency: typeof navigator.hardwareConcurrency === 'number' ? navigator.hardwareConcurrency : null,
      webglVersion: this.renderer.capabilities.isWebGL2 ? 'WebGL2' : 'WebGL1',
      unitCount,
      buildingCount,
      treeCount: this.treeManager.entries.length,
      worldItemCount: this.worldItems.length,
      assetLoadedCount,
      assetTotalCount: assetEntries.length,
    }
  }

  private getPlaytestFeedbackInput(): PlaytestFeedbackInput {
    return {
      category: this.elPlaytestFeedbackCategory?.value || 'startup',
      severity: this.elPlaytestFeedbackSeverity?.value || 'blocker',
      notes: this.elPlaytestUserNotes?.value.trim().slice(0, 800) || '',
    }
  }

  private canUseLocalStorage() {
    try {
      const key = '__war3_re_playtest_probe__'
      localStorage.setItem(key, '1')
      localStorage.removeItem(key)
      return true
    } catch {
      return false
    }
  }

  private getPlaytestCompatibilitySignals(): PlaytestCompatibilitySignal[] {
    const clipboardAvailable = !!navigator.clipboard && typeof navigator.clipboard.writeText === 'function'
    return [
      {
        key: 'webgl',
        label: 'WebGL',
        ok: this.renderer.domElement.width > 0 && this.renderer.domElement.height > 0,
        detail: `${this.renderer.capabilities.isWebGL2 ? 'WebGL2' : 'WebGL1'} renderer active`,
      },
      {
        key: 'local-storage',
        label: 'LocalStorage',
        ok: this.canUseLocalStorage(),
        detail: this.canUseLocalStorage() ? 'preferences can persist' : 'preferences cannot persist',
      },
      {
        key: 'pointer',
        label: 'Pointer/Mouse',
        ok: typeof window.PointerEvent !== 'undefined' || typeof window.MouseEvent !== 'undefined',
        detail: typeof window.PointerEvent !== 'undefined' ? 'PointerEvent available' : 'MouseEvent fallback available',
      },
      {
        key: 'audio',
        label: 'AudioContext',
        ok: typeof AudioContext !== 'undefined' || typeof (window as any).webkitAudioContext !== 'undefined',
        detail: typeof AudioContext !== 'undefined' || typeof (window as any).webkitAudioContext !== 'undefined'
          ? 'audio cue runtime can initialize'
          : 'audio cue runtime may be unavailable',
      },
      {
        key: 'clipboard',
        label: 'Clipboard',
        ok: clipboardAvailable,
        detail: clipboardAvailable ? 'copy feedback supported' : 'copy may require manual select',
      },
    ]
  }

  private getPlaytestRecentErrors(): PlaytestErrorSignal[] {
    return [...this.playtestRuntimeErrors]
  }

  private getRuntimeMilestoneSnapshots(): RuntimeMilestoneSnapshots {
    return {
      foundation: this.getFoundationMilestoneSnapshot(),
      r7: this.getHumanRouteSnapshot(),
      r8: this.getHeroMilestoneSnapshot(),
      r9: this.getAIOpponentSnapshot(),
      r10: this.getSkirmishCompletionSnapshot(),
      r11: this.getBattlefieldReadabilitySnapshot(),
      r12: this.getWar3IdentitySnapshot(),
      r13: this.getSessionShellSnapshot(),
      r14: this.getVisualAudioIdentitySnapshot(),
    }
  }

  private getPlaytestMilestoneSignals(): PlaytestMilestoneSignal[] {
    return buildPlaytestMilestoneSignals(this.getRuntimeMilestoneSnapshots())
  }

  renderPlaytestReadinessPanel(force = false) {
    if (!this.elPlaytestReadinessStatus || !this.elPlaytestReadinessList || !this.elPlaytestFeedbackPacket) return
    const snapshot = this.getPlaytestReadinessSnapshot()
    const key = [
      snapshot.completedCount,
      snapshot.totalCount,
      snapshot.feedbackPacket.length,
      snapshot.feedback.category,
      snapshot.feedback.severity,
      snapshot.feedback.notes.length,
      snapshot.recentErrors.length,
      snapshot.compatibility.map(item => `${item.key}:${item.ok ? 1 : 0}`).join('|'),
      snapshot.checks.map(check => `${check.key}:${check.completed ? 1 : 0}`).join('|'),
    ].join(':')
    if (!force && key === this._lastPlaytestReadinessKey) return
    this._lastPlaytestReadinessKey = key

    this.elPlaytestReadinessStatus.dataset.complete = snapshot.completed ? 'true' : 'false'
    this.elPlaytestReadinessStatus.textContent =
      `R15 ${snapshot.completedCount}/${snapshot.totalCount} · ${snapshot.buildLabel} · ${snapshot.verdict}`
    this.elPlaytestFeedbackPacket.value = snapshot.feedbackPacket
    if (this.elPlaytestOperationalSummary) {
      const runtime = this.getPlaytestRuntimeInfo()
      this.elPlaytestOperationalSummary.textContent =
        `性能 ${runtime.fpsText || 'not sampled'} · WebGL ${runtime.webglVersion} · 对象 U${runtime.unitCount}/B${runtime.buildingCount}/T${runtime.treeCount}/I${runtime.worldItemCount} · 资产 ${runtime.assetLoadedCount}/${runtime.assetTotalCount}`
    }
    if (this.elPlaytestErrorList) {
      this.elPlaytestErrorList.textContent = snapshot.recentErrors.length > 0
        ? `运行时异常：${snapshot.recentErrors.map(item => `${item.timeLabel} ${item.kind} ${item.message}`).join(' | ')}`
        : '运行时异常：未捕获'
    }

    this.elPlaytestReadinessList.replaceChildren(...snapshot.checks.map((check) => {
      const item = document.createElement('div')
      item.className = 'playtest-readiness-item'
      item.dataset.key = check.key
      item.dataset.complete = check.completed ? 'true' : 'false'
      item.title = check.detail

      const label = document.createElement('span')
      label.className = 'playtest-readiness-label'
      label.textContent = check.label

      const detail = document.createElement('span')
      detail.className = 'playtest-readiness-detail'
      detail.textContent = check.detail

      item.append(label, detail)
      return item
    }))
  }

  // ==================== 地块信息 ====================

  private updateTileInfo() {
    if (this.placement.mode) return
    this.raycaster.setFromCamera(this.mouseNDC, this.camera)
    const p = this.resolvePointerGroundPoint()
    if (p) {
      const info = this.mapRuntime.getTileInfo(p.x, p.z)
      this.elTileInfo.textContent = `地块 (${info.tx}, ${info.tz}) ${info.name}`
    }
  }

  // ==================== 小地图 ====================

  updateMinimap() {
    const target = this.cameraCtrl.getTarget()
    this.minimapPresenter.render({
      mapRuntime: this.mapRuntime,
      units: this.units,
      cameraTarget: target,
      cameraZoom: this.cameraCtrl.getZoom(),
      objectives: this.buildCurrentMapObjectives(),
      visibility: this.visibility,
      showFog: this.sessionPreferences.minimapFog,
    })
  }

  /** 小地图点击/拖拽 → 移动摄像机目标 */
  private handleMinimapClick(e: MouseEvent) {
    const target = this.minimapPresenter.getWorldPointFromEvent(e, this.mapRuntime)
    if (!target) return
    this.cameraCtrl.setTarget(target.x, target.z)
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
    this.currentMapSource = { kind: 'parsed', mapData }
    this.phase.set(Phase.LoadingMap)
    this.resetSessionStateForMapLoad()
    this.clearLoadedMapRenderer()

    // ===== 1. 清理旧 W3X 渲染器（如果有）=====
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
    this.visibility.resize(mapW, mapH)

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
    this.renderObjectiveTracker(true)
    this.renderPressureTracker(true)
    this.renderMapObjectiveRadar(true)
    this.renderWar3IdentityStatus(true)
    this.renderHumanRoutePanel(true)
    this.renderMilestoneStatusPanel(true)
    this.renderPlaytestReadinessPanel(true)
    this.syncSessionOverlays()
  }

  reloadCurrentMap(): boolean {
    if (!this.currentMapSource) return false
    if (this.currentMapSource.kind === 'procedural') {
      this.resetToProceduralStart()
    } else {
      this.loadMap(this.currentMapSource.mapData)
    }
    return true
  }

  /**
   * Return to menu: reset session to procedural start and freeze simulation.
   * The caller (main.ts) is responsible for showing #menu-shell and syncing
   * the source label after this call.
   */
  returnToMenu() {
    this.resetToProceduralStart()
    this.pauseGame()
  }

  private clearLoadedMapRenderer() {
    if (!this.w3xRenderer) return
    this.scene.remove(this.w3xRenderer.group)
    disposeObject3DDeep(this.w3xRenderer.group)
    this.w3xRenderer = null
  }

  private resetToProceduralStart() {
    this.phase.set(Phase.LoadingMap)
    this.resetSessionStateForMapLoad()
    this.clearLoadedMapRenderer()

    this.disposeAllUnits()
    this.treeManager.disposeAll()

    this.mapRuntime.reset()
    this.terrain.groundPlane = this.proceduralGroundPlane
    this.scene.add(this.terrain.mesh)
    this.scene.add(this.proceduralGroundPlane)

    const mapW = this.terrain.width
    const mapH = this.terrain.height
    this.occupancy.resize(mapW, mapH)
    this.placementValidator.updateReferences(this.occupancy, this.mapRuntime)
    this.pathingGrid.updateReferences(this.mapRuntime, this.occupancy)
    this.treeManager.resize(mapW, mapH)
    this.visibility.resize(mapW, mapH)

    this.resources.reset()
    this.resources.init(0, 500, 200)
    this.resources.init(1, 500, 200)
    this.spawnTrees()
    this.spawnStartingUnits()
    this.createAI()

    this.cameraCtrl.updateMapBounds(mapW, mapH)
    this.cameraCtrl.distance = 24
    this.cameraCtrl.setTarget(13, 14)

    this.currentMapSource = { kind: 'procedural' }
    this.phase.set(Phase.Playing)
    this.renderObjectiveTracker(true)
    this.renderPressureTracker(true)
    this.renderMapObjectiveRadar(true)
    this.renderWar3IdentityStatus(true)
    this.renderHumanRoutePanel(true)
    this.renderMilestoneStatusPanel(true)
    this.renderPlaytestReadinessPanel(true)
    this.syncSessionOverlays()
  }

  /** 完整清理所有单位（模型 + 血条 + GPU 资源）*/
  private disposeAllUnits() {
    for (const unit of this.units) {
      // 清理血条
      this.healthBarRenderer.remove(unit)
      // 清理单位模型
      disposeObject3DDeep(unit.mesh)
    }
    this.units = []
    this.deadUnitRecords = []
    this.outlineObjects = []
    this.selectionModel.clear()
    this.sel.clearSelectionRings()
    this._lastCmdKey = '__disposed__'
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
      // TH(4x4) 为基地核心，金矿在 NE 形成可见矿线，兵营在 SW，worker 在 TH 南侧一字排开。
      const townhallX = px - 2
      const townhallZ = pz - 2

      // 主基地
      this.spawnBuilding('townhall', team, townhallX, townhallZ)

      // 金矿：NE，保持与默认开局相同的短路径语法，但不贴脸跳过移动。
      this.spawnBuilding(
        'goldmine',
        -1,
        townhallX + OPENING_GOLDMINE_OFFSET.x,
        townhallZ + OPENING_GOLDMINE_OFFSET.z,
      )

      // 兵营：SW 出口，形成军事区/出兵方向
      this.spawnBuilding(
        'barracks',
        team,
        townhallX + OPENING_BARRACKS_OFFSET.x,
        townhallZ + OPENING_BARRACKS_OFFSET.z,
      )

      // 5个农民：在 TH 南侧一字排开，避免出生在 blocker 内
      for (const offset of OPENING_WORKER_OFFSETS) {
        this.spawnUnit('worker', team, townhallX + offset.x, townhallZ + offset.z)
      }
    }

    this.autoAssignOpeningGoldWorkers(0)
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
      const tree = createTreeVisual()
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
