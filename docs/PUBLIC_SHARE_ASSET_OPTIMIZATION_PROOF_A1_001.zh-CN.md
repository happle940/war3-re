# A1 公开分享素材第一切片优化 Proof 001

> 日期：2026-04-16
> 分支：`codex/asset-public-share`
> 依据：`docs/PUBLIC_SHARE_ASSET_IMPORT_TRIAL_A1_001.zh-CN.md`
> 状态：`optimization-proof-complete, superseded-by-optimization-pass-a1-001`

## 0. 本次结论

```text
correctness: import trial passed
performance risk: real and measurable
optimization applied: none
next action: optimize GLB slice before expanding asset scope
```

Quaternius 第一切片已经能跑通玩法，但不应继续扩大素材范围。当前最该做的是先处理 5 个已导入建筑的加载 / clone / 渲染成本。

更新：本文件是优化前的预算 proof。第一轮实际优化已完成，见：

```text
docs/PUBLIC_SHARE_ASSET_OPTIMIZATION_PASS_A1_001.zh-CN.md
docs/PUBLIC_SHARE_ASSET_OPTIMIZATION_PASS_A1_001.json
```

## 1. 静态 GLB 体检

| 文件 | 大小 | nodes | meshes | primitives | materials | vertices | triangles | textures | animations |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| `barracks.glb` | 475.3 KB | 2 | 1 | 9 | 9 | 13,546 | 6,900 | 0 | 0 |
| `farm.glb` | 225.5 KB | 2 | 1 | 7 | 7 | 6,142 | 4,162 | 0 | 0 |
| `mine.glb` | 138.5 KB | 2 | 1 | 5 | 5 | 3,789 | 2,294 | 0 | 0 |
| `town-center.glb` | 155.8 KB | 2 | 1 | 4 | 4 | 4,183 | 3,334 | 0 | 0 |
| `watch-tower.glb` | 51.9 KB | 2 | 1 | 3 | 3 | 1,394 | 700 | 0 | 0 |

合计：

```text
size: 1.047 MB
nodes: 10
meshes: 5
primitives: 28
materials: 28
vertices: 29,054
triangles: 17,390
textures: 0
animations: 0
```

## 2. 产品判断

这批模型不是“贴图太大”，因为没有 textures / images。主要成本来自：

- primitives / materials 数量偏多，实例 clone 时要复制更多材质对象。
- Barracks 单体最大，接近半 MB，顶点数占总量接近一半。
- Farm 作为常见建筑，体量也偏重；如果玩家和 AI 都多造，会放大 clone 和渲染成本。
- Runtime 当前会 deep-clone 每个 mesh 的材质，保证队伍色、受击闪白、选择反馈等实例隔离；这条安全线暂时不应移除。

## 3. 为什么这次不直接上 meshopt / Draco

压缩不是不能做，但不能裸上：

- 当前项目没有 glTF Transform / meshopt / Draco 工具链依赖。
- 如果使用 Meshopt / Draco 压缩，Three.js `GLTFLoader` 还要配置对应 decoder。
- 这批 GLB 没有贴图，KTX2 / WebP / AVIF 这类纹理压缩不是第一优先级。
- 这次试导入已经暴露过一次材质兼容问题，继续改 loader 风险比收益大。

所以第一轮优化建议先走：

```text
GLB 结构精简 > 材质/primitive 合并 > 再评估压缩 decoder
```

## 4. 优化预算建议

下一轮优化目标：

| 指标 | 当前 | 目标 |
| --- | ---: | ---: |
| 五建筑总大小 | 1.047 MB | <= 750 KB |
| 总 primitives | 28 | <= 20 |
| 总 materials | 28 | <= 20 |
| 总 vertices | 29,054 | <= 22,000 |
| Barracks 大小 | 475.3 KB | <= 320 KB |
| Farm 大小 | 225.5 KB | <= 160 KB |

浏览器验证目标：

| 场景 | 当前观察 | 目标 |
| --- | --- | --- |
| Building agency 5 项 | 3.1m | <= 2.0m |
| Construction lifecycle | 部分场景 40s 到 1m+ | 不再触发长命令 SIGTERM |
| Fallback proof | 11/11 pass | 仍保持 11/11 pass |
| Mining / tower smoke | pass | 仍保持 pass |

## 5. 建议执行顺序

1. 先优化 `barracks.glb`。
   - 它最大，材质和 primitive 最多。
   - 先尝试材质合并和几何精简，不改变 pivot / scale。
2. 再优化 `farm.glb`。
   - 它会成为高频建筑，数量放大后更影响性能。
3. Mine / Town Center / Tower 先不动。
   - 它们体量相对可控。
4. 每优化一个文件，先复跑：
   - asset fallback proof
   - mining smoke 或 tower smoke 中对应关键用例
   - rule-fit preview
5. 如果优化后视觉明显损失，宁可回到当前试导入版本，不为了体积牺牲 RTS 可读性。

## 6. 仍然禁止

- 不在优化前导入 Tree line。
- 不在优化前导入 Resource Gold accent。
- 不把当前 import trial 写成 final art。
- 不删除 S0 fallback。
- 不为了压缩引入 decoder 但不改 loader / 不跑浏览器验证。
- 不用官方或 fan remake 素材替换这条干净来源路线。

## 7. 下一步

下一步可以做 `PUBLIC_SHARE_ASSET_OPTIMIZATION_PASS_A1_001`：

- 只处理 `barracks.glb` 和 `farm.glb`。
- 输出优化前后 checksum、大小、primitive、material、vertex 对比。
- 优化后重新跑 fallback proof 和拆分 smoke。
- 如果收益不足或视觉退化，保留当前 trial 文件并记录拒绝原因。
