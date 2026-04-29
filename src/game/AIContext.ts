import type * as THREE from 'three'
import type { ItemKey } from './GameData'
import type { PlacementValidator } from './OccupancyGrid'
import type { TeamResources } from './TeamResources'
import type { TreeEntry } from './TreeManager'
import type { Unit } from './UnitTypes'

/** Runtime dependencies SimpleAI needs from the game shell. */
export interface AIContext {
  team: number
  units: Unit[]
  resources: TeamResources
  placement: PlacementValidator
  findNearestUnit(unit: Unit, type: string, team: number): Unit | null
  findNearestGoldmine(unit: Unit): Unit | null
  findNearestTreeEntry(pos: THREE.Vector3, maxRange?: number): TreeEntry | null
  spawnUnit(type: string, team: number, x: number, z: number): Unit
  spawnBuilding(type: string, team: number, x: number, z: number): Unit
  getWorldHeight(wx: number, wz: number): number
  planPath(unit: Unit, target: THREE.Vector3): boolean
  planPathToBuildingInteraction(unit: Unit, target: Unit): boolean
  planPathToTreeInteraction(unit: Unit, target: TreeEntry): boolean
  castHolyLight(caster: Unit, target: Unit): boolean
  castDivineShield(caster: Unit): boolean
  castResurrection(caster: Unit): boolean
  castSummonWaterElemental(caster: Unit, targetX: number, targetZ: number): boolean
  castBlizzard(caster: Unit, targetX: number, targetZ: number): boolean
  castStormBolt(caster: Unit, target: Unit): boolean
  castThunderClap(caster: Unit): boolean
  castAvatar(caster: Unit): boolean
  purchaseShopItem(shop: Unit, itemKey: ItemKey): boolean
}
