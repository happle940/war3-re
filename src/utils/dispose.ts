import * as THREE from 'three'

/**
 * 递归释放 Three.js Object3D 及其子对象的 GPU 资源
 *
 * 递归遍历所有子 mesh，dispose geometry 和 material。
 * 从父对象移除。防止地图切换时的 GPU 内存泄漏。
 */
export function disposeObject3DDeep(obj: THREE.Object3D) {
  // 先递归处理所有子对象（复制数组，因为 remove 会修改 children）
  const children = [...obj.children]
  for (const child of children) {
    disposeObject3DDeep(child)
  }

  if (obj instanceof THREE.Mesh) {
    obj.geometry?.dispose()

    if (Array.isArray(obj.material)) {
      obj.material.forEach((m) => disposeMaterial(m))
    } else if (obj.material) {
      disposeMaterial(obj.material)
    }
  }

  // 从父对象移除
  if (obj.parent) {
    obj.parent.remove(obj)
  }
}

function disposeMaterial(mat: THREE.Material) {
  // 释放 ShaderMaterial.uniforms 中的纹理
  if (mat instanceof THREE.ShaderMaterial) {
    for (const key of Object.keys(mat.uniforms)) {
      const val = mat.uniforms[key].value
      if (val instanceof THREE.Texture) {
        val.dispose()
      }
    }
  }

  // 释放材质直接属性上的纹理
  const matAny = mat as unknown as Record<string, unknown>
  for (const key of Object.keys(matAny)) {
    const val = matAny[key]
    if (val instanceof THREE.Texture) {
      val.dispose()
    }
  }
  mat.dispose()
}
