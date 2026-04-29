import * as THREE from 'three'

export function createAssetPipelineFixture(scale: number): THREE.Group {
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

export function summarizeObject3D(root: THREE.Object3D) {
  root.updateWorldMatrix(true, true)
  const box = new THREE.Box3().setFromObject(root)
  const size = new THREE.Vector3()
  box.getSize(size)
  return {
    visibleMeshCount: countRenderableMeshes(root),
    bboxHeight: size.y,
    bboxWidth: size.x,
    bboxDepth: size.z,
    directChildCount: root.children.length,
    scale: { x: root.scale.x, y: root.scale.y, z: root.scale.z },
  }
}

export function countRenderableMeshes(root: THREE.Object3D): number {
  let count = 0
  root.traverse(child => {
    if (child instanceof THREE.Mesh && child.visible !== false) count++
  })
  return count
}

export function getFirstMesh(root: THREE.Object3D): THREE.Mesh {
  let mesh: THREE.Mesh | null = null
  root.traverse(child => {
    if (!mesh && child instanceof THREE.Mesh) mesh = child
  })
  if (!mesh) throw new Error('asset pipeline fixture has no mesh')
  return mesh
}

export function asMaterialArray(material: THREE.Material | THREE.Material[]): THREE.Material[] {
  return Array.isArray(material) ? material : [material]
}

export function findNamedMaterial(root: THREE.Object3D, name: string): THREE.MeshStandardMaterial | null {
  let found: THREE.MeshStandardMaterial | null = null
  root.traverse(child => {
    if (found || !(child instanceof THREE.Mesh) || !child.material) return
    const materials = asMaterialArray(child.material)
    for (const material of materials) {
      if (material.name === name && 'color' in material) {
        found = material as THREE.MeshStandardMaterial
        return
      }
    }
  })
  return found
}
