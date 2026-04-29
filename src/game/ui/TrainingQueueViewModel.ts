import { RESEARCHES, UNITS } from '../GameData'
import type { Unit } from '../UnitTypes'
import type { TrainingQueueItemView } from './TrainingQueuePresenter'

export function buildTrainingQueueItems(units: readonly Unit[]): TrainingQueueItemView[] {
  const items: TrainingQueueItemView[] = []

  for (const unit of units) {
    if (unit.team !== 0 || !unit.isBuilding) continue

    for (const item of unit.trainingQueue) {
      const def = UNITS[item.type]
      if (!def) continue
      const progressPct = ((def.trainTime - item.remaining) / def.trainTime) * 100
      items.push({ label: def.name, progressPct })
    }

    for (const item of unit.researchQueue) {
      const def = RESEARCHES[item.key]
      if (!def) continue
      const progressPct = ((def.researchTime - item.remaining) / def.researchTime) * 100
      items.push({ label: `R: ${def.name}`, progressPct })
    }
  }

  return items
}
