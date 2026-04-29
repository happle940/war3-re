import * as THREE from 'three'
import { getLoadedModel } from './AssetLoader'

const TREE_CROWN1_GEO = new THREE.ConeGeometry(0.55, 1.1, 7)
const TREE_CROWN2_GEO = new THREE.ConeGeometry(0.38, 0.85, 7)
const TREE_CROWN3_GEO = new THREE.ConeGeometry(0.22, 0.65, 6)
const TREE_TRUNK_GEO = new THREE.CylinderGeometry(0.06, 0.1, 0.7, 5)
const TREE_CROWN1_MAT = new THREE.MeshLambertMaterial({ color: 0x1a3d10 })
const TREE_CROWN2_MAT = new THREE.MeshLambertMaterial({ color: 0x224d15 })
const TREE_CROWN3_MAT = new THREE.MeshLambertMaterial({ color: 0x1a3d10 })
const TREE_TRUNK_MAT = new THREE.MeshLambertMaterial({ color: 0x3d2210 })

export function createTreeVisual(): THREE.Group {
  const gltf = getLoadedModel('pine_tree')
  if (gltf) return gltf

  const tree = new THREE.Group()
  tree.userData.isTree = true
  const c1 = new THREE.Mesh(TREE_CROWN1_GEO, TREE_CROWN1_MAT)
  c1.position.y = 0.8
  tree.add(c1)
  const c2 = new THREE.Mesh(TREE_CROWN2_GEO, TREE_CROWN2_MAT)
  c2.position.y = 1.5
  tree.add(c2)
  const c3 = new THREE.Mesh(TREE_CROWN3_GEO, TREE_CROWN3_MAT)
  c3.position.y = 2.1
  tree.add(c3)
  const trunk = new THREE.Mesh(TREE_TRUNK_GEO, TREE_TRUNK_MAT)
  trunk.position.y = 0.35
  tree.add(trunk)
  tree.traverse((c) => { if (c instanceof THREE.Mesh) c.castShadow = true })
  return tree
}
