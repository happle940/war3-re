import * as THREE from 'three'
import type { TreeEntry } from '../TreeManager'
import type { Unit } from '../UnitTypes'
import { getBuildingFootprint } from './InteractionGeometry'

type PathingGridReader = {
  isInside(tx: number, tz: number): boolean
  isBlocked(tx: number, tz: number): boolean
}

type HeightAtTile = (tx: number, tz: number) => number

function pushTileCenter(candidates: THREE.Vector3[], tx: number, tz: number, heightAtTile: HeightAtTile) {
  const wx = tx + 0.5
  const wz = tz + 0.5
  candidates.push(new THREE.Vector3(wx, heightAtTile(tx, tz), wz))
}

export function getBuildingApproachCandidates(
  target: Unit,
  pathingGrid: PathingGridReader,
  heightAtTile: HeightAtTile,
  maxRing = 3,
) {
  const fp = getBuildingFootprint(target)
  const candidates: THREE.Vector3[] = []
  const seen = new Set<string>()

  for (let ring = 1; ring <= maxRing; ring++) {
    const minTx = fp.tx - ring
    const maxTx = fp.tx + fp.size - 1 + ring
    const minTz = fp.tz - ring
    const maxTz = fp.tz + fp.size - 1 + ring

    for (let tz = minTz; tz <= maxTz; tz++) {
      for (let tx = minTx; tx <= maxTx; tx++) {
        const onRing = tx === minTx || tx === maxTx || tz === minTz || tz === maxTz
        if (!onRing) continue

        const insideFootprint = tx >= fp.tx && tx < fp.tx + fp.size
          && tz >= fp.tz && tz < fp.tz + fp.size
        if (insideFootprint) continue
        if (!pathingGrid.isInside(tx, tz) || pathingGrid.isBlocked(tx, tz)) continue

        const key = `${tx}:${tz}`
        if (seen.has(key)) continue
        seen.add(key)
        pushTileCenter(candidates, tx, tz, heightAtTile)
      }
    }

    if (candidates.length > 0) return candidates
  }

  return candidates
}

export function getTreeApproachCandidates(
  tree: TreeEntry,
  pathingGrid: PathingGridReader,
  heightAtTile: HeightAtTile,
  maxRing = 3,
) {
  const candidates: THREE.Vector3[] = []
  const seen = new Set<string>()

  for (let ring = 1; ring <= maxRing; ring++) {
    const minTx = tree.tx - ring
    const maxTx = tree.tx + ring
    const minTz = tree.tz - ring
    const maxTz = tree.tz + ring

    for (let tz = minTz; tz <= maxTz; tz++) {
      for (let tx = minTx; tx <= maxTx; tx++) {
        const onRing = tx === minTx || tx === maxTx || tz === minTz || tz === maxTz
        if (!onRing) continue
        if (tx === tree.tx && tz === tree.tz) continue
        if (!pathingGrid.isInside(tx, tz) || pathingGrid.isBlocked(tx, tz)) continue

        const key = `${tx}:${tz}`
        if (seen.has(key)) continue
        seen.add(key)
        pushTileCenter(candidates, tx, tz, heightAtTile)
      }
    }

    if (candidates.length > 0) return candidates
  }

  return candidates
}

export function chooseNearestApproachPoint(
  origin: THREE.Vector3,
  candidates: readonly THREE.Vector3[],
  fallback: THREE.Vector3,
  reserved?: Set<string>,
) {
  if (candidates.length === 0) return fallback.clone()

  const scored = candidates
    .map(point => {
      const dx = origin.x - point.x
      const dz = origin.z - point.z
      const key = `${Math.floor(point.x)}:${Math.floor(point.z)}`
      const reservedPenalty = reserved?.has(key) ? 1000 : 0
      return { point, key, score: dx * dx + dz * dz + reservedPenalty }
    })
    .sort((a, b) => a.score - b.score)

  const best = scored[0]
  if (reserved) reserved.add(best.key)
  return best.point.clone()
}
