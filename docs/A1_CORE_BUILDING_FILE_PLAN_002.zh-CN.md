# A1 核心建筑素材文件计划 002

> 日期：2026-04-16
> 依据：`docs/A1_CORE_BUILDING_ASSET_PREVIEW_SWEEP_002.zh-CN.md`
> 用途：把 Quaternius 核心建筑候选拆成未来可能导入的 runtime 文件计划。
> 边界：本文件仍不是导入批准包。当前不得把这些 GLB 复制到 `public/assets`。

## 0. 文件计划结论

```text
approved-for-import: none
ready-for-file-plan: Town Center, Barracks, Farm, Mine, Resource Gold accent, Trees, Watch Tower
runtime code changes: none
```

这批素材的产品价值很明确：它补上了 A1 战场最缺的“第一眼核心建筑”。但它们还只能停在 intake，因为导入前必须证明 footprint、选择圈、worker pathing、队伍色、fallback 都不破坏当前可玩版本。

## 1. 候选到 runtime key 的映射

| runtime key | intake id | 源文件 | 目标路径草案 | 当前状态 | fallback |
| --- | --- | --- | --- | --- | --- |
| `townhall` | `a1-quaternius-town-center-001` | `CoERW5nFdE-town-center.glb` | `public/assets/models/buildings/townhall.glb` | `intake-plan-only` | `fallback-readable-th-proxy` |
| `barracks` | `a1-quaternius-barracks-001` | `dvlksXgxWc-barracks.glb` | `public/assets/models/buildings/barracks.glb` | `intake-plan-only` | `fallback-readable-barracks-proxy` |
| `farm` | `a1-quaternius-farm-001` | `91wMLb9kKo-farm.glb` | `public/assets/models/buildings/farm.glb` | `intake-plan-only` | `fallback-readable-farm-proxy` |
| `goldmine` | `a1-quaternius-mine-001` | `wOJ61Fa0Lt-mine.glb` | `public/assets/models/buildings/goldmine.glb` | `intake-plan-only` | `fallback-readable-goldmine-proxy` |
| `goldmine_accent` | `a1-quaternius-resource-gold-accent-001` | `jkqD4dMoz1-resource-gold.glb` | `public/assets/models/buildings/goldmine_accent.glb` 或合并进 `goldmine.glb` | `composition-only` | `fallback-readable-goldmine-proxy` |
| `pine_tree` / `tree_line` | `a1-quaternius-tree-line-001` | `jUzojhHoYR-trees.glb` | `public/assets/models/nature/pine_tree.glb` 或 `tree_cluster.glb` | `intake-plan-only` | `fallback-readable-tree-line-proxy` |
| `tower` | `a1-quaternius-watch-tower-001` | `f2J0aSLVi4-watch-tower.glb` | `public/assets/models/buildings/tower.glb` | `intake-plan-only` | `fallback-readable-tower-proxy` |

## 2. 单项落地计划

### 2.1 Town Hall / Town Center

| 字段 | 内容 |
| --- | --- |
| `sub_candidate_id` | `a1-quaternius-town-center-001` |
| artifact 文件 | `artifacts/asset-intake/downloads/poly-pizza/quaternius-ultimate-fantasy-rts/CoERW5nFdE-town-center.glb` |
| 未来目标路径 | `public/assets/models/buildings/townhall.glb` |
| 文件大小 | 159,508 bytes |
| SHA-256 | `fa7d33ff72092a96073b659eba5562ed1eadf5b60a8092d1321769b34e9177a5` |
| 适合原因 | 默认镜头下能读成主基地，体量比 farm / tower 更强。 |
| 必改项 | 队伍色、主基地旗帜或入口 cue；选择圈和血条锚点；和当前 townhall proxy 并排判断。 |
| 初始 scale 口径 | 以当前 `townhall` footprint 为锚，不按预览页 scale 直接导入。 |
| 当前结论 | `file-plan-ready, not approved-for-import` |

### 2.2 Barracks

| 字段 | 内容 |
| --- | --- |
| `sub_candidate_id` | `a1-quaternius-barracks-001` |
| artifact 文件 | `artifacts/asset-intake/downloads/poly-pizza/quaternius-ultimate-fantasy-rts/dvlksXgxWc-barracks.glb` |
| 未来目标路径 | `public/assets/models/buildings/barracks.glb` |
| 文件大小 | 486,740 bytes |
| SHA-256 | `b62a47e6cf8cdacc87be9afb6c5201a6becaf3e2616fd5d6797958b00e99ef74` |
| 适合原因 | 石墙和红屋顶能读成军事生产建筑，不像普通房子。 |
| 必改项 | Human 阵营识别；rally 点不被模型遮挡；训练中状态和选择圈兼容。 |
| 初始 scale 口径 | 以当前 barracks footprint 为锚；不能超过 Town Hall 的视觉层级。 |
| 当前结论 | `file-plan-ready, not approved-for-import` |

### 2.3 Farm

| 字段 | 内容 |
| --- | --- |
| `sub_candidate_id` | `a1-quaternius-farm-001` |
| artifact 文件 | `artifacts/asset-intake/downloads/poly-pizza/quaternius-ultimate-fantasy-rts/91wMLb9kKo-farm.glb` |
| 未来目标路径 | `public/assets/models/buildings/farm.glb` |
| 文件大小 | 230,864 bytes |
| SHA-256 | `403cd4f1218f2d45392becbf63e1bec64df527152235f99895342c5dd2b8b2c2` |
| 适合原因 | 平民建筑和田地 cue 清楚，适合承载 supply / farm。 |
| 必改项 | 控制体量；不要把农田 footprint 做成 pathing 障碍误导；和人口上限 UI 对齐。 |
| 初始 scale 口径 | 明显小于 Barracks，且不遮挡单位行走读数。 |
| 当前结论 | `file-plan-ready, not approved-for-import` |

### 2.4 Goldmine / Mine

| 字段 | 内容 |
| --- | --- |
| `sub_candidate_id` | `a1-quaternius-mine-001` |
| artifact 文件 | `artifacts/asset-intake/downloads/poly-pizza/quaternius-ultimate-fantasy-rts/wOJ61Fa0Lt-mine.glb` |
| 未来目标路径 | `public/assets/models/buildings/goldmine.glb` |
| 文件大小 | 141,868 bytes |
| SHA-256 | `cfbabb663904483aa9704b7ea63e053a58dbe882abbc2935e65f5a0425b21752` |
| 适合原因 | 岩体和洞口能读成矿点，比普通 rocks 更接近 goldmine。 |
| 必改项 | 加金色 cue；worker 采集靠近点；选择圈；矿点血条 / 资源量提示位置。 |
| 初始 scale 口径 | 以 worker 进出路径为锚，不能只按视觉大小决定。 |
| 当前结论 | `file-plan-ready, not approved-for-import` |

### 2.5 Resource Gold Accent

| 字段 | 内容 |
| --- | --- |
| `sub_candidate_id` | `a1-quaternius-resource-gold-accent-001` |
| artifact 文件 | `artifacts/asset-intake/downloads/poly-pizza/quaternius-ultimate-fantasy-rts/jkqD4dMoz1-resource-gold.glb` |
| 未来目标路径 | `public/assets/models/buildings/goldmine_accent.glb` 或合并进 `goldmine.glb` |
| 文件大小 | 51,048 bytes |
| SHA-256 | `014be202047295172158f524d11ecc0a172eef544b4d11fd0fe55b48e55be1f3` |
| 适合原因 | 金色资源 cue 很清楚，适合贴在 Mine 旁边强化识别。 |
| 不直接导入原因 | 单独看只是金块，不是可采集建筑。 |
| 当前结论 | `composition-only, not standalone runtime key` |

### 2.6 Tree Line

| 字段 | 内容 |
| --- | --- |
| `sub_candidate_id` | `a1-quaternius-tree-line-001` |
| artifact 文件 | `artifacts/asset-intake/downloads/poly-pizza/quaternius-ultimate-fantasy-rts/jUzojhHoYR-trees.glb` |
| 未来目标路径 | `public/assets/models/nature/pine_tree.glb` 或 `public/assets/models/nature/tree_cluster.glb` |
| 文件大小 | 92,392 bytes |
| SHA-256 | `a61c2378b7a103276c8deb8ddbeda0d5b21d7cc638bca48500b97baabdf651d5` |
| 适合原因 | 树组能承担资源边界，默认镜头下不会混成建筑。 |
| 必改项 | 3x / 5x / 9x 重复摆放；worker 采木遮挡；树线前缘和可走区边界。 |
| 初始 scale 口径 | 以 worker 高度和采集边界为锚，不按单棵树美观决定。 |
| 当前结论 | `file-plan-ready, not approved-for-import` |

### 2.7 Watch Tower

| 字段 | 内容 |
| --- | --- |
| `sub_candidate_id` | `a1-quaternius-watch-tower-001` |
| artifact 文件 | `artifacts/asset-intake/downloads/poly-pizza/quaternius-ultimate-fantasy-rts/f2J0aSLVi4-watch-tower.glb` |
| 未来目标路径 | `public/assets/models/buildings/tower.glb` |
| 文件大小 | 53,188 bytes |
| SHA-256 | `d70f8855cb45003b4f78a093a23eab61717f9246fdcdeca281bf6b341edb442a` |
| 适合原因 | 高度和塔楼轮廓清楚，能和 Farm / Barracks 区分。 |
| 必改项 | 攻击点 cue；队伍色；射程/选中反馈不被顶端遮挡。 |
| 初始 scale 口径 | 高于 Farm，低于或弱于主基地，不抢 Town Hall anchor。 |
| 当前结论 | `file-plan-ready, not approved-for-import` |

## 3. 导入前必须补的共同检查

| 检查 | 验收口径 |
| --- | --- |
| scale | 和当前 worker、Footman、Town Hall、Barracks 同屏不失衡。 |
| pivot | 建筑落点在 footprint 中心，旋转和选中圈不漂移。 |
| selection ring | 不被模型遮挡，不超出真实占位太多。 |
| footprint | 建造、阻挡、寻路、采集边缘和视觉边界一致。 |
| team-color | 玩家 / AI 阵营至少有一个稳定可读位置。 |
| fallback | GLB 加载失败时回到 S0 proxy，不影响建造、训练、采集、攻击。 |
| bundle | 只导入被批准的最小文件集，不整包导入。 |
| notices | 即使 CC0 不强制署名，公开分享版仍建议列入第三方素材清单。 |

2026-04-16 已完成第一轮规则适配 proof：`docs/A1_CORE_BUILDING_RULE_FIT_PROOF_001.zh-CN.md`。

proof 结论：

- Town Hall、Barracks、Farm、Goldmine、Tower、Tree line 最终都能压进当前 footprint proof。
- Town Hall、Barracks、Farm 初始存在轻微 bbox 溢出，必须按 proof 的 scale 收口方案继续。
- Goldmine 和 Tower 在当前 proof 中尺寸最稳。
- Tree line 可做 7 组重复摆放，但还要继续做 worker 遮挡和真实采木 proof。
- 这仍然不是导入批准，只说明可以继续进入 import review packet，不能裸导入。

proof 推荐 scale：

| runtime key | 初始 scale | proof 收口 scale | 备注 |
| --- | --- | --- | --- |
| `townhall` | `2.7220` | `2.5299` | 必须缩小后才压进 size 4。 |
| `barracks` | `1.5076` | `1.4369` | 轻微缩小后压进 size 3。 |
| `farm` | `0.8701` | `0.8123` | 缩小后压进 size 2，保持 farm 从属层级。 |
| `goldmine` | `1.7960` | `1.7960` | 原 proof scale 可用，采集点另测。 |
| `tower` | `1.8461` | `1.8461` | 原 proof scale 可用，攻击点另测。 |

2026-04-16 已完成导入前安全线验证：

- 加载失败 fallback proof：`docs/A1_CORE_BUILDING_LOAD_FAILURE_FALLBACK_PROOF_001.zh-CN.md`，11 个 runtime 测试通过。
- 真实玩法冒烟基线：`docs/A1_CORE_BUILDING_GAMEPLAY_SMOKE_BASELINE_001.zh-CN.md`，24 个玩法测试通过。

这说明当前 S0 / project-proxy 安全网和建筑玩法合同能作为 Quaternius 后续 import review 的验收基线。它仍然不等于导入批准。

## 4. 第一轮最小可落地范围

如果后续要做第一次 runtime 替换，不要一次性替换所有建筑。建议顺序是：

1. `townhall` + `barracks`：先验证玩家第一眼是否更像 RTS 基地。
2. `goldmine` + `goldmine_accent`：单独验证 worker 采集和矿点可读性。
3. `farm`：验证 supply 建筑是否抢主基地层级。
4. `pine_tree` / `tree_line`：验证树线遮挡和采木边界。
5. `tower`：最后验证攻击 cue、射程和阵营色。

每一步都要保留 S0 fallback，并且只在截图、路径、选择、建造、加载失败都通过后，才能进入 `approved-for-import` packet。

## 5. 仍然禁止

```text
不得把本计划当成导入批准。
不得复制 Quaternius 文件到 public/assets。
不得修改 AssetCatalog。
不得删除当前 S0 fallback。
不得把 Resource Gold 单独说成 Goldmine 已解决。
不得在公开文案里说最终美术已经完成。
```
