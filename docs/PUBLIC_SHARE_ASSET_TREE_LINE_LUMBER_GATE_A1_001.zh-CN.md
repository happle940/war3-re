# A1 公开分享素材 Tree Line 木材闭环 Gate 001

> 日期：2026-04-16
> 分支：`codex/asset-public-share`
> 状态：`tree-line-lumber-gate-proof-passed`

## 0. 本次结论

```text
tree line direct import: still blocked
current procedural tree line: keep
lumber gameplay gate: passed
pathing blocker release gate: passed
```

这次没有导入新的树模型，也没有把 Quaternius `Resource_Tree_Group` 接到 `pine_tree`。

本次证明的是：现有 S0 程序树虽然不是最终美术，但已经能承担公开分享前需要保住的玩法职责：

- 树线在场景里可见。
- 每棵树都注册成 `TreeEntry`。
- 树 tile 会挡路。
- worker 可以把树当作木材资源目标。
- 单棵树被砍空后会从 `TreeManager` 移除。
- 被砍空的 tree tile 会释放 pathing blocker。

所以素材线下一步不应该为了“更像一片树林”直接替换 runtime。要先准备单棵树或小树丛候选，再用这条 gate 复验。

## 1. 新增验证

新增测试：

```text
tests/tree-line-lumber-gate-regression.spec.ts
```

覆盖两个产品场景：

| 场景 | 验收点 | 结果 |
| --- | --- | --- |
| 默认树线注册 | 默认地图存在大量树；sample tree 有 mesh；`userData.isTree` 为真；所在 tile 是 tree tile；`PathingGrid.isBlocked()` 为真；最近树查询能找到它。 | passed |
| 木材耗尽释放 | 在空地注册一棵 10 lumber 的临时树；注册后 tile 变 blocked；worker 完成一次 lumber gather；树从 `TreeManager` 消失；tile 不再是 tree tile；`PathingGrid.isBlocked()` 回到 false。 | passed |

这两个场景比单纯截图更重要，因为树线当前不是装饰物，而是资源和地图边界。

## 2. 验证命令

```bash
./scripts/run-runtime-tests.sh tests/tree-line-lumber-gate-regression.spec.ts --reporter=list
```

结果：

```text
2 passed
duration: 21.6s
```

等待过一次 runtime test lock，锁释放后正常跑完，没有改动其他 session 的进程。

## 3. 产品判断

当前树线对玩家的最低产品价值已经成立：

| 产品问题 | 当前答案 |
| --- | --- |
| 玩家能不能把树线理解成边界？ | 可以。默认树线有可见 mesh，并且 tile blocker 生效。 |
| 树是不是只是背景？ | 不是。树是 `TreeEntry`，能作为 lumber resource target。 |
| worker 采木会不会破坏地图格子？ | 不会。树耗尽后 `TreeManager.remove()` 释放 blocker。 |
| 现在是否可以公开说树素材完成？ | 不可以。只能说树线玩法闭环可用，最终树美术仍待替换。 |

## 4. 对素材导入的约束

后续任何 `pine_tree` 替换候选都必须继续满足：

- 单棵树 / 小树丛视觉宽度不要超过当前单 tile 语义。
- worker 站在树前缘时，选择圈和头部不能被树冠完全盖住。
- 树耗尽后必须释放 blocker，不能留下不可见阻挡。
- `TreeManager.entries` 仍是可采树的唯一运行时来源。
- tree line cluster 如果作为远景装饰，只能做非 pathing decoration，不能替换可采树。

建议继续沿用上一份 gate 的硬指标：

```text
prepared tree visual width <= 1.2 world units
prepared tree visual <= 1,000 triangles
```

## 5. 剩余事项

树线素材线还剩：

1. `done` worker 遮挡截图 proof：`docs/PUBLIC_SHARE_ASSET_TREE_LINE_WORKER_READABILITY_A1_001.zh-CN.md`。
2. 准备单树 / 小树丛 GLB 候选，而不是整组树直接复制。
3. 复跑本 gate、worker readability proof、fallback proof、默认镜头可读性 proof。
4. 决定是否需要非采集 tree-line cluster 作为远景边界。

当前结论保持：

```text
Quaternius trees.glb direct runtime import: blocked
S0 procedural tree line: product-safe for now
```
