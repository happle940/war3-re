# A1 公开分享素材 Tree Line 导入 Gate 001

> 日期：2026-04-16
> 分支：`codex/asset-public-share`
> 状态：`tree-line-direct-import-blocked, current-lumber-gate-passed, current-worker-readability-passed`

## 0. 结论

```text
Quaternius trees.glb direct runtime import: blocked
current runtime tree line: keep S0 procedural fallback
current runtime lumber gate: passed
current runtime worker readability: passed
reason: Resource_Tree_Group is too heavy and semantically too coarse for per-tile TreeEntry cloning
```

不要把：

```text
artifacts/asset-intake/downloads/poly-pizza/quaternius-ultimate-fantasy-rts/jUzojhHoYR-trees.glb
```

直接复制成：

```text
public/assets/models/nature/pine_tree.glb
```

当前 `Game.createSingleTree()` 会为每个 TreeEntry 调用 `getLoadedModel("pine_tree")`。如果 `pine_tree` 指向 Quaternius `Resource_Tree_Group`，每棵树 tile 都会克隆一整组树，而不是克隆一棵树。

## 1. 源文件体检

| 文件 | 大小 | mesh | primitives | materials | vertices | triangles | textures | animations | SHA-256 |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | --- |
| `jUzojhHoYR-trees.glb` | 92,392 B / 90.2 KB | 1 | 2 | 2 | 2,540 | 4,776 | 0 | 0 | `a61c2378b7a103276c8deb8ddbeda0d5b21d7cc638bca48500b97baabdf651d5` |

`gltf-transform inspect` 关键结果：

```text
mesh name: Resource_Tree_Group
bboxMin: -0.99633, 0.002, -0.84999
bboxMax:  0.97357, 0.9285, 1.01359
renderVertexCount: 14,328
uploadVertexCount: 2,540
```

当前默认地图会注册约：

```text
187 TreeEntry
```

如果直接导入，风险是：

- 187 个 tree tile 克隆 187 份树组视觉。
- 单个 tile 的视觉宽度接近 2 个 world units，容易互相覆盖。
- worker 靠近树线时更容易被树冠遮挡。
- 采木目标从“单 tile 树”视觉上变成“一团树”，玩家不清楚点的是哪棵。
- 三角面规模会从程序 fallback 的轻量锥体，变成接近百万级 tree-line triangles 的风险面。

## 2. 当前 runtime 语义不能破坏

树线不是装饰，它承担四个产品功能：

| 功能 | 当前实现 | 不能破坏的点 |
| --- | --- | --- |
| 木材资源 | `TreeManager.entries` | worker 必须能找到最近 TreeEntry。 |
| 地图阻挡 | `PathingGrid.isTreeTile()` | 每个 tree tile 必须保持阻挡语义。 |
| 采集循环 | `resourceTarget: { type: "tree", entry }` | 采集、返回、再采集必须稳定。 |
| 树木耗尽 | `depleteTree()` | 木材耗尽要移除 mesh 并释放 blocker。 |

所以第二切片不能只是换模型。正确路线是先把 Quaternius 树组拆成更小的单树 / 小树丛模块，或者继续使用当前 S0 procedural fallback。

## 3. 允许的后续路线

### 路线 A：继续用 S0 procedural fallback

这是当前推荐路线。

优点：

- 已通过 fallback proof。
- 每棵树都是单 tile blocker。
- worker 遮挡风险低。
- 性能可控。

缺点：

- 美术统一性不如 Quaternius。

### 路线 B：从 Quaternius 树组拆单树

必须先做准备资产，不直接接 runtime：

```text
source trees.glb -> prepared single-tree or small-cluster GLB -> pine_tree candidate
```

最低要求：

- 每个 prepared tree visual 的占地宽度 <= 1.2 world units。
- 每个 prepared tree visual <= 1,000 triangles。
- 保留 TreeEntry tile 注册语义。
- worker 站在树前缘时，头部和选择圈不被树冠完全遮住。
- `tests/v3-asset-fallback-catalog-proof.spec.ts` 里的 tree line fallback / traceability 仍通过。

### 路线 C：做 tree-line cluster 但不替换 TreeEntry

可以把树组作为远景边界 decoration，但不能替换可采 TreeEntry。

要求：

- 可采树仍由 TreeManager 管。
- cluster 不参与 pathing。
- cluster 不遮挡 worker 采木前缘。
- 必须有清楚的“可采前缘”视觉。

## 4. 下一步验收

真正允许 Tree line 进入 runtime 前，要跑：

- Tree line worker 遮挡截图 proof。
- Worker 右键树线后进入 lumber gather。
- Tree depletion proof：耗尽后释放 blocker。
- Asset fallback proof：缺失 tree model 仍可回到程序树。
- Default camera readability：树线是边界，不是噪声墙。

当前结论保持：

```text
tree line import: blocked
S0 procedural fallback: keep
```

## 5. 已补的木材闭环证明

2026-04-16 已新增：

```text
tests/tree-line-lumber-gate-regression.spec.ts
docs/PUBLIC_SHARE_ASSET_TREE_LINE_LUMBER_GATE_A1_001.zh-CN.md
docs/PUBLIC_SHARE_ASSET_TREE_LINE_LUMBER_GATE_A1_001.json
```

验证命令：

```bash
./scripts/run-runtime-tests.sh tests/tree-line-lumber-gate-regression.spec.ts --reporter=list
```

结果：

```text
2 passed
duration: 21.6s
```

本次证明：

- 默认树线可见、已注册、能阻挡 pathing。
- worker 完成 lumber gather 后，耗尽的树会从 `TreeManager` 移除。
- 被移除的树 tile 会释放 blocker。

所以当前 S0 procedural tree line 可以继续作为公开分享前的产品安全底座；但这不等于最终树美术完成，也不改变 Quaternius `trees.glb` 直接导入被拒绝的结论。

## 6. 已补的工人遮挡证明

2026-04-16 已新增：

```text
tests/tree-line-worker-readability-proof.spec.ts
docs/PUBLIC_SHARE_ASSET_TREE_LINE_WORKER_READABILITY_A1_001.zh-CN.md
docs/PUBLIC_SHARE_ASSET_TREE_LINE_WORKER_READABILITY_A1_001.json
artifacts/asset-intake/preview/tree-line-worker-readability-a1-001.png
artifacts/asset-intake/preview/tree-line-worker-readability-a1-001.json
```

验证命令：

```bash
./scripts/run-runtime-tests.sh tests/tree-line-worker-readability-proof.spec.ts --reporter=list
```

结果：

```text
1 passed
duration: 17.6s
```

本次用的是现有树线：

```text
tree tile: (9, 7)
worker tile: (9, 8)
source: existing-tree-line
```

证明当前 S0 procedural tree line 的采木边缘可读性可接受：worker、树、selection ring 都在屏幕内，worker 没有被树冠完全遮住。

未来如果替换 `pine_tree` 候选，必须重新跑这条 proof；当前证明只覆盖现有 S0 fallback。
