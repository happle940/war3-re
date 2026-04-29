import type { TreeEntry } from '../TreeManager'
import type { Unit } from '../UnitTypes'

export function assignGoldGatherTarget(workers: readonly Unit[], mine: Unit) {
  for (const worker of workers) {
    worker.resourceTarget = { type: 'goldmine', mine }
  }
}

export function assignLumberGatherTarget(workers: readonly Unit[], tree: TreeEntry) {
  for (const worker of workers) {
    worker.resourceTarget = { type: 'tree', entry: tree }
  }
}
