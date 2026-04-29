import * as THREE from 'three'
import { getLoadedModel } from './AssetLoader'
import type { ItemKey } from './GameData'

const ITEM_CUE: Record<ItemKey, { color: number; emissive: number }> = {
  tome_of_experience: { color: 0xdcc45d, emissive: 0x4d3a08 },
  healing_potion: { color: 0xe24d4d, emissive: 0x4d1111 },
  mana_potion: { color: 0x5ed7ff, emissive: 0x123d55 },
  boots_of_speed: { color: 0xd08a42, emissive: 0x4a2207 },
  scroll_of_town_portal: { color: 0xf0e3b0, emissive: 0x4a3b11 },
}

export function createItemVisual(type: ItemKey): THREE.Group {
  const root = new THREE.Group()
  root.userData.itemType = type

  const gltf = getLoadedModel(type)
  if (gltf) {
    root.userData.visualRoute = 'real-gltf-item-model'
    gltf.name = `${type}-gltf-root`
    root.add(gltf)
  } else {
    root.userData.visualRoute = 'procedural-item-fallback'
    root.add(createFallbackItemBody(type))
  }

  root.add(createPickupRing(type))
  root.add(createGroundShadow())

  root.traverse((child) => {
    if (child instanceof THREE.Mesh) {
      child.castShadow = true
      child.receiveShadow = true
    }
  })

  return root
}

function createFallbackItemBody(type: ItemKey): THREE.Mesh {
  const cue = ITEM_CUE[type]
  const base = new THREE.Mesh(
    new THREE.OctahedronGeometry(0.32, 0),
    new THREE.MeshStandardMaterial({
      color: cue.color,
      emissive: cue.emissive,
      roughness: 0.4,
      metalness: 0.1,
    }),
  )
  base.name = `${type}-procedural-item-body`
  base.position.y = 0.45
  return base
}

function createPickupRing(type: ItemKey): THREE.Mesh {
  const cue = ITEM_CUE[type]
  const ring = new THREE.Mesh(
    new THREE.RingGeometry(0.38, 0.5, 24),
    new THREE.MeshBasicMaterial({
      color: cue.color,
      transparent: true,
      opacity: 0.78,
      side: THREE.DoubleSide,
      depthTest: false,
    }),
  )
  ring.name = `${type}-pickup-ring`
  ring.rotation.x = -Math.PI / 2
  ring.position.y = 0.04
  return ring
}

function createGroundShadow(): THREE.Mesh {
  const shadow = new THREE.Mesh(
    new THREE.CircleGeometry(0.46, 24),
    new THREE.MeshBasicMaterial({
      color: 0x000000,
      transparent: true,
      opacity: 0.18,
      depthWrite: false,
    }),
  )
  shadow.name = 'item-contact-shadow'
  shadow.rotation.x = -Math.PI / 2
  shadow.position.y = 0.02
  return shadow
}
