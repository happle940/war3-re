# A1 公开分享素材 Goldmine 组合导入 Pass 001

> 日期：2026-04-16
> 分支：`codex/asset-public-share`
> 依据：`docs/PUBLIC_SHARE_ASSET_IMPORT_REVIEW_PACKET_A1_001.zh-CN.md`
> 状态：`goldmine-composition-applied-runtime-proof-passed`

> 后续增强：`docs/PUBLIC_SHARE_ASSET_GOLDMINE_READABILITY_PASS_A1_002.zh-CN.md`

## 0. 本次结论

```text
runtime key changed: goldmine visual only
new catalog key: goldmine_accent
gameplay object changed: no
pathing changed: no
gather logic changed: no
tree line import: still blocked
```

这次补的是金矿可读性，不是新增资源规则。

Pass 001 时玩家看到的 `goldmine` 是：

```text
Quaternius Mine body + Quaternius Resource Gold accent
```

2026-04-16 根据“金矿不够金”的反馈，已追加 Pass 002：

```text
Quaternius Mine body + 4 Resource Gold accents + 3 lightweight gold readability nuggets
```

但游戏规则里仍然只有一个可采对象：

```text
unit.type === "goldmine"
```

`Resource Gold` 不会独立成为建筑、单位、资源点或 pathing blocker。

## 1. 文件和 runtime 改动

新增运行文件：

```text
public/assets/models/vendor/quaternius/ultimate-fantasy-rts/resource-gold.glb
```

新增 catalog entry：

```text
key: goldmine_accent
path: assets/models/vendor/quaternius/ultimate-fantasy-rts/resource-gold.glb
scale: 1.15
```

组合方式：

- `createBuildingVisual("goldmine")` 仍先加载 `goldmine` 主体。
- 如果 `goldmine_accent` 已加载，就创建一个组合 root。
- `mine` 和 `accent` 是 root 下的两个 sibling，避免 accent 被 mine 的 scale 二次放大。
- accent 命名为 `goldmine-resource-gold-accent`，便于回归测试和后续截图验证。

Pass 002 追加：

- `Resource Gold` accent root 从 1 个扩到 4 个。
- 新增 `goldmine-gold-readability-cue`，包含 3 个低面数金色碎矿。
- 不新增 GLB / texture / decoder。
- 不改变 `unit.type === "goldmine"`、`remainingGold`、pathing 或采集逻辑。

## 2. Resource Gold 优化结果

| 文件 | 原始大小 | 优化后大小 | 节省 | 原始 SHA-256 | 优化后 SHA-256 |
| --- | ---: | ---: | ---: | --- | --- |
| `resource-gold.glb` | 51,048 B / 49.9 KB | 38,892 B / 38.0 KB | 23.81% | `014be202047295172158f524d11ecc0a172eef544b4d11fd0fe55b48e55be1f3` | `a580525d732887e89ab7d538cefd6ce59c2d1657e5fea9f6b3839a484194faa7` |

结构：

| 指标 | 原始 | 优化后 |
| --- | ---: | ---: |
| primitives | 2 | 2 |
| materials | 2 | 2 |
| accessors | 8 | 6 |
| bufferViews | 8 | 3 |
| vertices | 1,307 | 1,279 |
| triangles | 1,016 | 1,016 |
| textures / images / animations | 0 | 0 |

优化流程：

```text
prune -> dedup -> weld
```

没有引入 Draco / Meshopt / texture compression，也不需要 loader decoder。

## 3. 当前 Quaternius runtime 切片

| runtime key | 文件 | SHA-256 | 状态 |
| --- | --- | --- | --- |
| `townhall` | `town-center.glb` | `fa7d33ff72092a96073b659eba5562ed1eadf5b60a8092d1321769b34e9177a5` | import trial |
| `barracks` | `barracks.glb` | `1b6607319c7166daec71e60c0473cd85afa4df96a1d4cd4624d6ca7ab36e7de6` | import trial, optimized |
| `farm` | `farm.glb` | `9ba5dfacf8e469b002e41a60e746fb7d5de64feb46903fb674a8e8174fa2a6bd` | import trial, optimized |
| `goldmine` | `mine.glb` | `cfbabb663904483aa9704b7ea63e053a58dbe882abbc2935e65f5a0425b21752` | import trial |
| `goldmine_accent` | `resource-gold.glb` | `a580525d732887e89ab7d538cefd6ce59c2d1657e5fea9f6b3839a484194faa7` | visual-only composition |
| `tower` | `watch-tower.glb` | `d70f8855cb45003b4f78a093a23eab61717f9246fdcdeca281bf6b341edb442a` | import trial |

六个 GLB 合计：

```text
bytes: 946,240
size: 924.1 KB
primitives: 30
materials: 30
vertices: 30,333
triangles: 18,406
textures/images/animations: 0
```

## 4. 验证结果

### 4.1 GLB validator

```bash
gltf-transform validate artifacts/asset-intake/optimized/quaternius-gold-accent-pass-001/final/resource-gold.glb
```

结果：

```text
no errors
no warnings
```

### 4.2 构建

```bash
npm run build
```

结果：

```text
passed
```

仍有 Vite 大 chunk warning，不是本次新增阻断项。

### 4.3 Goldmine composition regression

```bash
./scripts/run-runtime-tests.sh tests/goldmine-accent-composition-regression.spec.ts --reporter=list
```

结果：

```text
1 passed
duration: 30.1s
```

证明点：

- `goldmine` 仍是 `unit.type === "goldmine"`。
- `remainingGold > 0`。
- 视觉树中存在 `goldmine-resource-gold-accent`。
- goldmine 视觉 mesh 从 5 个变为 7 个。
- accent 不改变 pathing，矿点周围仍有可走邻接 tile。
- 无严重 console error。

### 4.4 Asset / fallback safety

```bash
./scripts/run-runtime-tests.sh tests/asset-pipeline-regression.spec.ts tests/v3-asset-fallback-catalog-proof.spec.ts --reporter=list
```

结果：

```text
11 passed
duration: 3.9m
```

关键观察：

- `goldmine` factory result meshCount = 7。
- Tree line 仍是程序 fallback，187 棵树，sample meshCount = 4。
- 九类 A1 target fallback traceability 仍全部 resolved。
- 无外链导入。
- 无严重 console error。

### 4.5 Mining saturation

```bash
./scripts/run-runtime-tests.sh tests/mining-saturation-regression.spec.ts --reporter=list
```

结果：

```text
2 passed
duration: 1.3m
```

证明点：

- goldmine 仍不暴露超过 5 个同时活跃采集工。
- 默认经济规模仍能接近 5 人采矿饱和。

## 5. Tree line 仍不导入

Quaternius `trees.glb` 当前不进入 runtime，原因很具体：

- 源文件是 `Resource_Tree_Group`，不是单棵轻量树。
- 单文件 90.2 KB，2,540 vertices，4,776 triangles。
- 当前地图会注册约 187 个 TreeEntry。
- 如果直接映射到 `pine_tree`，每个 tree tile 都会克隆整组树，容易造成 worker 遮挡和渲染压力。
- 当前程序 fallback 每棵树有明确 tile 注册、资源扣减、耗尽移除和 pathing blocker，不能用视觉替换破坏这些语义。

下一步必须先做 Tree line import gate：

```text
docs/PUBLIC_SHARE_ASSET_TREE_LINE_IMPORT_GATE_A1_001.zh-CN.md
```

结论先定死：不要把 `jUzojhHoYR-trees.glb` 直接接到 `pine_tree`。
