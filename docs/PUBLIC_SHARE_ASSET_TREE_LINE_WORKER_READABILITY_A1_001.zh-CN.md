# A1 公开分享素材 Tree Line 工人遮挡 Proof 001

> 日期：2026-04-16
> 分支：`codex/asset-public-share`
> 状态：`tree-line-worker-readability-proof-passed`

## 0. 本次结论

```text
tree line direct import: still blocked
current procedural tree line worker readability: passed
proof source: existing tree line, not controlled fake tree
final tree art approval: no
```

这次补的是“工人在树线前缘会不会被遮到看不清”的证据。

结果是：当前 S0 procedural tree line 在聚焦采木边界的 RTS 镜头下，工人、选择圈、树本体都能同时读出来。它可以继续作为公开分享前的产品安全底座。

但这不批准 Quaternius `trees.glb` 直接导入。未来换树模型时，要重新跑这条 proof。

## 1. 新增验证

新增测试：

```text
tests/tree-line-worker-readability-proof.spec.ts
```

测试做了这些事：

1. 从默认地图里找现有树线，不用临时假树。
2. 选择一棵南侧有空地的树。
3. 把 worker 放在采木前缘。
4. 选中 worker，生成选择圈。
5. 镜头聚焦树线 / worker 边界。
6. 截取 canvas 图片，保存 metrics JSON。
7. 验证 worker、tree、selection ring 都在屏幕内，且 worker 没被树投影完全盖住。

## 2. 产物

截图：

```text
artifacts/asset-intake/preview/tree-line-worker-readability-a1-001.png
```

机器指标：

```text
artifacts/asset-intake/preview/tree-line-worker-readability-a1-001.json
```

测试命令：

```bash
./scripts/run-runtime-tests.sh tests/tree-line-worker-readability-proof.spec.ts --reporter=list
```

结果：

```text
1 passed
duration: 17.6s
```

## 3. 关键指标

| 指标 | 数值 |
| --- | ---: |
| 视口 | `1280 x 720` |
| 树来源 | `existing-tree-line` |
| 树 tile | `(9, 7)` |
| worker tile | `(9, 8)` |
| worker 是否在树南侧 | `true` |
| tree tile 是否 blocked | `true` |
| worker tile 是否 blocked | `false` |
| 选中单位数 | `1` |
| selection ring 数 | `1` |
| worker screen bbox | `72.3 x 95.5 px` |
| tree screen bbox | `79.2 x 117.0 px` |
| selection ring bbox | `68.0 x 55.8 px` |
| worker-tree overlap ratio | `0.51` |

测试阈值：

- worker 宽度 >= 12 px。
- worker 高度 >= 24 px。
- selection ring 宽度 >= 10 px。
- worker 中心在 tree 中心下方，说明 worker 位于镜头侧前缘。
- worker/tree 投影重叠比例 < 0.65，避免树冠把 worker 完全吃掉。

## 4. 产品判断

当前可以说：

```text
树线玩法闭环和采木边缘可读性已通过当前 S0 fallback proof。
```

不能说：

```text
树素材完成
Tree line final art approved
Quaternius trees.glb 可以导入
```

后续任何树素材替换，都必须重新证明：

- worker 在采木前缘不会被树冠完全遮住。
- 选择圈仍能露出来。
- 树 tile 仍保持 blocker。
- worker tile 不被误 blocked。
- 树耗尽后 blocker 释放。

## 5. 下一步

树线素材路线现在只剩“替换美术”层面的工作：

1. 准备单树 / 小树丛 GLB，而不是整组树。
2. 控制单棵树视觉宽度和三角面预算。
3. 用本 proof 截图对比新旧树线。
4. 复跑 lumber gate、worker readability proof、asset fallback proof。
