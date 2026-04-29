import * as THREE from 'three'
import type { MapObjectiveView } from '../systems/MapObjectiveSystem'
import { disposeObject3DDeep } from '../../utils/dispose'

type MarkerRecord = {
  group: THREE.Group
  spriteTexture: THREE.CanvasTexture
}

function colorForTone(tone: string) {
  if (tone === 'base') return 0x7fb7ff
  if (tone === 'economy') return 0xf1dc8d
  if (tone === 'lumber') return 0x7fcf6f
  if (tone === 'map') return 0x72d18c
  if (tone === 'shop') return 0x75d6d6
  if (tone === 'attack') return 0xff7a5f
  return 0xeee1b5
}

function makeLabelTexture(label: string, tone: string) {
  const canvas = document.createElement('canvas')
  canvas.width = 256
  canvas.height = 64
  const ctx = canvas.getContext('2d')!
  ctx.clearRect(0, 0, canvas.width, canvas.height)
  ctx.fillStyle = 'rgba(5, 8, 6, 0.82)'
  ctx.strokeStyle = `#${colorForTone(tone).toString(16).padStart(6, '0')}`
  ctx.lineWidth = 2
  ctx.fillRect(12, 12, 232, 38)
  ctx.strokeRect(12, 12, 232, 38)
  ctx.fillStyle = '#eee1b5'
  ctx.font = '700 24px Georgia, serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(label, 128, 32, 210)

  const texture = new THREE.CanvasTexture(canvas)
  texture.needsUpdate = true
  return texture
}

function makeMarker(objective: MapObjectiveView, getWorldHeight: (x: number, z: number) => number): MarkerRecord {
  const color = colorForTone(objective.tone)
  const group = new THREE.Group()
  group.name = `map-objective-beacon:${objective.key}`
  group.userData.mapObjectiveKey = objective.key

  const ringGeo = new THREE.RingGeometry(0.72, 0.9, 28)
  ringGeo.rotateX(-Math.PI / 2)
  const ring = new THREE.Mesh(
    ringGeo,
    new THREE.MeshBasicMaterial({
      color,
      transparent: true,
      opacity: objective.key === 'enemyBase' ? 0.9 : 0.68,
      depthTest: false,
      side: THREE.DoubleSide,
    }),
  )
  ring.name = `${group.name}:ring`
  ring.renderOrder = 880
  group.add(ring)

  const diamond = new THREE.Mesh(
    new THREE.OctahedronGeometry(objective.key === 'enemyBase' ? 0.46 : 0.34, 0),
    new THREE.MeshBasicMaterial({
      color,
      transparent: true,
      opacity: 0.86,
      depthTest: false,
    }),
  )
  diamond.name = `${group.name}:diamond`
  diamond.position.y = 1.45
  diamond.renderOrder = 881
  group.add(diamond)

  const texture = makeLabelTexture(objective.label, objective.tone)
  const sprite = new THREE.Sprite(new THREE.SpriteMaterial({
    map: texture,
    transparent: true,
    depthTest: false,
  }))
  sprite.name = `${group.name}:label`
  sprite.position.y = 2.18
  sprite.scale.set(3.1, 0.78, 1)
  sprite.renderOrder = 882
  group.add(sprite)

  if (objective.targetX !== null && objective.targetZ !== null) {
    group.position.set(
      objective.targetX,
      getWorldHeight(objective.targetX, objective.targetZ) + 0.08,
      objective.targetZ,
    )
  }

  return { group, spriteTexture: texture }
}

export class MapObjectiveBeaconPresenter {
  private readonly scene: THREE.Scene
  private readonly getWorldHeight: (x: number, z: number) => number
  private records = new Map<string, MarkerRecord>()
  private visibleCount = 0

  constructor(options: {
    scene: THREE.Scene
    getWorldHeight: (x: number, z: number) => number
  }) {
    this.scene = options.scene
    this.getWorldHeight = options.getWorldHeight
  }

  render(objectives: readonly MapObjectiveView[]) {
    const visibleObjectives = objectives.filter(objective =>
      objective.targetX !== null &&
      objective.targetZ !== null,
    )
    const nextKeys = new Set<string>(visibleObjectives.map(objective => objective.key))

    for (const [key, record] of this.records) {
      if (nextKeys.has(key)) continue
      this.scene.remove(record.group)
      record.spriteTexture.dispose()
      disposeObject3DDeep(record.group)
      this.records.delete(key)
    }

    for (const objective of visibleObjectives) {
      let record = this.records.get(objective.key)
      if (!record) {
        record = makeMarker(objective, this.getWorldHeight)
        this.records.set(objective.key, record)
        this.scene.add(record.group)
      }
      record.group.visible = true
      record.group.userData.mapObjectiveStatus = objective.status
      record.group.position.set(
        objective.targetX!,
        this.getWorldHeight(objective.targetX!, objective.targetZ!) + 0.08,
        objective.targetZ!,
      )
      record.group.rotation.y += objective.key === 'enemyBase' ? 0.012 : 0.006
    }

    this.visibleCount = visibleObjectives.length
  }

  getVisibleCount() {
    return this.visibleCount
  }

  dispose() {
    for (const record of this.records.values()) {
      this.scene.remove(record.group)
      record.spriteTexture.dispose()
      disposeObject3DDeep(record.group)
    }
    this.records.clear()
    this.visibleCount = 0
  }
}
