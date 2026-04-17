# A1 素材文件计划 001

> 日期：2026-04-16  
> 依据：`docs/A1_ASSET_PREVIEW_SWEEP_001.zh-CN.md`  
> 用途：把已进入 `approved-for-intake` 的 Kenney 子候选，拆成未来可能导入的文件计划。  
> 边界：本文件仍不是导入批准包。只有 `Asset Approval Handoff Packet` 完整后才能复制到 `public/assets`。

## 0. 当前导入结论

```text
approved-for-import: none
direct-runtime-file-plan: tower and tree only
deferred-prop-plan: rocks, wall, gate, tree tile
runtime code changes: none
```

## 1. 可进入直接 runtime 文件计划的项

### 1.1 Tower

| 字段 | 内容 |
| --- | --- |
| `sub_candidate_id` | `a1-kenney-castle-tower-square-001` |
| 原始文件 | `Models/GLB format/tower-square.glb` |
| artifact 预览文件 | `artifacts/asset-intake/extracted/kenney-castle-kit/glb/tower-square.glb` |
| 未来目标路径 | `public/assets/models/buildings/tower.glb` |
| 当前 runtime key | `tower` |
| fallback | `fallback-readable-tower-proxy` |
| 适合原因 | 体量清楚、方塔轮廓稳定、默认 RTS 镜头下不像 farm / wall。 |
| 必改项 | 加强顶部攻击点；确认队伍色；统一木石明度；检查选择圈和血条位置。 |
| scale / pivot | 未批准。需要以现有 tower footprint 为基准做 in-game side-by-side。 |
| 当前结论 | `file-plan-ready, not approved-for-import` |

导入前必须完成：

- 和现有 S0 tower proxy 并排截图。
- 默认镜头下与 farm / barracks / townhall 同屏比较。
- 选择后不被血条和 selection ring 遮住。
- 缺文件时仍 deterministic fallback。

### 1.2 Tree / Tree Line

| 字段 | 内容 |
| --- | --- |
| `sub_candidate_id` | `a1-kenney-castle-tree-line-001` |
| 原始文件 | `Models/GLB format/tree-large.glb`、`Models/GLB format/tree-small.glb` |
| artifact 预览文件 | `artifacts/asset-intake/extracted/kenney-castle-kit/glb/tree-large.glb`、`artifacts/asset-intake/extracted/kenney-castle-kit/glb/tree-small.glb` |
| 未来目标路径 | `public/assets/models/nature/pine_tree.glb` 或 `public/assets/models/nature/tree_large.glb` / `tree_small.glb` |
| 当前 runtime key | `pine_tree` |
| fallback | `fallback-readable-tree-line-proxy` |
| 适合原因 | 单树轮廓干净，颜色从地表里跳出来，低模风格与当前 proxy 不冲突。 |
| 必改项 | 测试成排树线；避免遮住 worker；决定是否只保留一个 `pine_tree` key。 |
| scale / pivot | 未批准。必须用 worker 采木前缘、选择圈和 pathing edge 测试。 |
| 当前结论 | `file-plan-ready, not approved-for-import` |

导入前必须完成：

- 3x / 5x / 9x 树线摆放截图。
- worker 靠近采集时不被树冠遮挡。
- 树线前缘和可走区边界清楚。
- 当前 `pine_tree` key 是否保留单文件，还是拆成 tree-large / tree-small / tree-cluster。

## 2. 暂不作为直接 runtime key 的项

### 2.1 Tree Tile

| 字段 | 内容 |
| --- | --- |
| `sub_candidate_id` | `a1-kenney-td-tree-tile-001` |
| 原始文件 | `tile-tree.glb`、`tile-tree-quad.glb` |
| 未来用途 | 快速森林块、不可走边界、地图编辑器原型。 |
| 不直接导入原因 | 自带亮绿色底板，和当前地表会冲突；容易把树线变成独立 tile game 语法。 |
| 当前结论 | `approved-for-intake as reference / possible cluster, deferred for import` |

### 2.2 Rocks

| 字段 | 内容 |
| --- | --- |
| `sub_candidate_id` | `a1-kenney-castle-rocks-001` |
| 原始文件 | `rocks-large.glb` |
| 未来用途 | 矿区周边装饰、不可走边界、地图地形辅助。 |
| 不直接导入原因 | 没有金色 cue、洞口或采集目标语义，不能承担 `goldmine`。 |
| 当前结论 | `approved-for-intake as terrain aid, blocked as goldmine` |

### 2.3 Wall / Gate

| 字段 | 内容 |
| --- | --- |
| `sub_candidate_id` | `a1-kenney-castle-wall-gate-001` |
| 原始文件 | `wall.glb`、`gate.glb` |
| 未来用途 | Human base props、Castle/Keep 语义辅助、壳层装饰、地图边界。 |
| 不直接导入原因 | 当前 runtime 没有 wall/gate key；不是 A1 九类的核心替换。 |
| 当前结论 | `approved-for-intake as props, deferred for runtime import` |

## 3. 导入前 handoff 必填项

如果后续要把 Tower 或 Tree 变成 `approved-for-import`，交接包必须补齐：

| 字段 | Tower | Tree |
| --- | --- | --- |
| `target_runtime_key` | `tower` | `pine_tree` 或新 key |
| `target_path` | `public/assets/models/buildings/tower.glb` | `public/assets/models/nature/pine_tree.glb` |
| `license_evidence` | Kenney Castle Kit page + `License.txt` | Kenney Castle Kit page + `License.txt` |
| `source_file` | `Models/GLB format/tower-square.glb` | `Models/GLB format/tree-large.glb` / `tree-small.glb` |
| `texture_dependency` | `Textures/colormap.png` must be embedded or colocated | `Textures/colormap.png` must be embedded or colocated |
| `scale_anchor_notes` | Tower footprint, top attack point, bloodbar anchor | Tree-line spacing, worker occlusion, harvest edge |
| `material_plan` | Wood/stone value tuning, team-color marker | Ground contrast, leaf brightness, no over-occlusion |
| `fallback_id` | `fallback-readable-tower-proxy` | `fallback-readable-tree-line-proxy` |
| `human_review_required` | yes | yes |

## 4. 当前下一步

```text
先不要导入。
下一步应做 side-by-side runtime preview：S0 tower/tree proxy vs Kenney tower/tree candidate。
如果用户认可方向，再生成 approved-for-import packet。
```

