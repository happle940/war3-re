import type { Unit } from '../UnitTypes'

export type TrainingQueueCompletion = {
  unitType: string
}

export type ReviveQueueCompletion = {
  heroType: string
}

export type ResearchQueueCompletion = {
  researchKey: string
}

export function advanceTrainingQueue(building: Unit, dt: number): TrainingQueueCompletion | null {
  if (!building.isBuilding || building.trainingQueue.length === 0) return null
  if (building.buildProgress < 1) return null

  const item = building.trainingQueue[0]
  item.remaining -= dt
  if (item.remaining > 0) return null

  building.trainingQueue.shift()
  return { unitType: item.type }
}

export function advanceReviveQueue(building: Unit, dt: number): ReviveQueueCompletion | null {
  if (!building.isBuilding || building.reviveQueue.length === 0) return null
  if (building.buildProgress < 1) return null

  const item = building.reviveQueue[0]
  item.remaining -= dt
  if (item.remaining > 0) return null

  building.reviveQueue.shift()
  return { heroType: item.heroType }
}

export function advanceResearchQueue(building: Unit, dt: number): ResearchQueueCompletion | null {
  if (!building.isBuilding || building.researchQueue.length === 0) return null
  if (building.buildProgress < 1) return null

  const item = building.researchQueue[0]
  item.remaining -= dt
  if (item.remaining > 0) return null

  building.researchQueue.shift()
  return { researchKey: item.key }
}
