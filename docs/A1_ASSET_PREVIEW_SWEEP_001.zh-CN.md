# A1 战场素材预览 Sweep 001

> 日期：2026-04-16  
> 分支：`codex/asset-public-share`  
> 目的：把第一批 CC0 战场素材候选从“来源可看”推进到“有实物包、许可证、文件清单、默认镜头预览和初步产品判断”。  
> 边界：本 sweep 不批准导入 runtime；不复制任何第三方素材到 `public/assets`。

## 0. 本次结论

```text
approved-for-import: none
approved-for-intake: partial, Kenney A1 tower / tree / terrain-aid candidates only
runtime asset changes: none
```

本次下载并检查了两个 Kenney 官方 CC0 包：

| 包 | 来源 | 包内许可 | 本地 artifact | 当前结论 |
| --- | --- | --- | --- | --- |
| Kenney Tower Defense Kit | https://kenney.nl/assets/tower-defense-kit | CC0，可个人/教育/商业使用，署名非强制 | `artifacts/asset-intake/downloads/kenney_tower-defense-kit.zip` | 可作为树线、地表辅助、塔候选，但塔的视觉语义需要重调。 |
| Kenney Castle Kit | https://kenney.nl/assets/castle-kit | CC0，可个人/教育/商业使用，署名非强制 | `artifacts/asset-intake/downloads/kenney_castle-kit.zip` | 更适合 Human 战场第一批：塔、树、墙体、岩石、门。 |

预览图：

```text
artifacts/asset-intake/preview/kenney-a1-shortlist-rts-preview.png
```

机器清单：

```text
artifacts/asset-intake/manifests/kenney_tower-defense-kit.files.txt
artifacts/asset-intake/manifests/kenney_castle-kit.files.txt
artifacts/asset-intake/manifests/kenney_selected_glb_inventory.json
```

文件计划：

```text
docs/A1_ASSET_FILE_PLAN_001.zh-CN.md
```

## 1. 本次安全和来源检查

| 检查 | 结果 |
| --- | --- |
| 官方页面 URL | ClawDefender URL check 通过。 |
| zip 下载 URL | ClawDefender URL check 通过。 |
| zip 类型 | 两个文件都是 Zip archive。 |
| 路径穿越 | 文件清单未发现 `/` 开头、`../` 或 `/../` 路径。 |
| 包内 license | 两个包内 `License.txt` 都写明 `Creative Commons Zero, CC0`。 |
| 文件格式 | 两包都包含 GLB；不需要把 FBX 作为 runtime 合同。 |
| runtime 导入 | 未发生。 |

## 2. 默认镜头预览判断

### 2.1 可继续推进的项

| sub_candidate_id | 来源文件 | A1 类别 | 产品判断 | 当前状态 |
| --- | --- | --- | --- | --- |
| `a1-kenney-castle-tower-square-001` | `tower-square.glb` | `tower` | 方塔体量清楚，默认镜头下比 farm / wall 更高，适合做防御塔候选。缺点是攻击点不够明显。 | `approved-for-intake` |
| `a1-kenney-castle-tree-line-001` | `tree-large.glb`、`tree-small.glb` | `trees / tree line` | 单棵树轮廓干净，色块清楚，适合作为树线模块。需要成排摆放测试，防止遮 worker。 | `approved-for-intake` |
| `a1-kenney-td-tree-tile-001` | `tile-tree.glb`、`tile-tree-quad.glb` | `trees / tree line`、`terrain readability aids` | 树块天然带地面底板，适合快速形成“树线/不可走边界”。底板颜色较亮，需要和当前地表统一。 | `approved-for-intake` |
| `a1-kenney-castle-rocks-001` | `rocks-large.glb` | `terrain readability aids` | 岩石可作为地形障碍或矿区装饰；不能直接当 goldmine，因为没有金色资源 cue。 | `approved-for-intake` |
| `a1-kenney-castle-wall-gate-001` | `wall.glb`、`gate.glb` | `terrain readability aids` / Human props | 墙体和门适合做基地边界、Castle/Keep 语义辅助或壳层装饰。不是 A1 必需建筑替换。 | `approved-for-intake` |

### 2.2 暂不推进到 intake 的项

| sub_candidate_id | 来源文件 | 原因 | 当前状态 |
| --- | --- | --- | --- |
| `a1-kenney-td-tower-round-build-001` | `tower-round-build-a.glb` | 读成塔没问题，但偏塔防组件，缺少 Human 军事语义。可以后续重调材质和顶部攻击点。 | `candidate` |
| `a1-kenney-td-tower-square-build-001` | `tower-square-build-a.glb` | 轮廓强，但紫色材质太抢，会和当前产品色彩方向冲突；需要 team-color / 材质改造后再评估。 | `candidate` |
| `a1-kenney-td-detail-tree-001` | `detail-tree.glb` | 单体树可读，但比 Castle Kit 树更像地形装饰；当前优先级低。 | `candidate` |
| `a1-kenney-td-detail-rocks-001` | `detail-rocks.glb` | 岩石可读，但资源语义不足，不适合直接承担 goldmine。 | `candidate` |

## 3. A1 九类覆盖变化

| A1 类别 | 本次是否推进 | 说明 |
| --- | --- | --- |
| `worker` | 否 | Kenney 两包没有合适 worker。继续走 S0 proxy / KayKit Adventurers / AI clean route。 |
| `footman` | 否 | Kenney 两包没有合适 footman。继续走 KayKit Adventurers / AI clean route。 |
| `townhall` | 否 | Castle Kit 有塔/墙，不够像主基地。继续等 KayKit / Quaternius 或原创组合。 |
| `barracks` | 否 | 没有完整军营建筑。wall/gate 可作为军营 props，但不能直接替代。 |
| `farm` | 否 | 没有小型人口建筑。继续等 KayKit / Quaternius 或 AI clean route。 |
| `tower` | 是 | Castle Kit `tower-square.glb` 可进入 intake。Tower Defense tower 仍需调色和语义重评。 |
| `goldmine` | 否 | 岩石可作矿区装饰，但没有金色 cue / 洞口，不能直接承担 goldmine。 |
| `trees / tree line` | 是 | Castle Kit 单树 + Tower Defense tree tile 可进入 intake。 |
| `terrain readability aids` | 是 | rocks、wall、gate、tree tile 可作为地形/边界/基地语法辅助候选。 |

## 4. 进入下一步前还缺什么

这些 item 虽然已进入 `approved-for-intake`，但仍不能导入：

- 没有确定最终 runtime key。
- 没有 scale / pivot / selection ring / footprint 方案。
- 没有 team-color 或材质统一方案。
- 没有和现有 S0 fallback 的并排截图。
- 没有写入 `Asset Approval Handoff Packet`。
- 没有跑缺图 fallback regression。

## 5. 下一步建议

1. 用 Castle Kit 的 `tower-square.glb` 做 `tower` 第一候选文件计划。`done: docs/A1_ASSET_FILE_PLAN_001.zh-CN.md`
2. 用 Castle Kit 的 `tree-large.glb` / `tree-small.glb` 做树线第一候选文件计划。`done: docs/A1_ASSET_FILE_PLAN_001.zh-CN.md`
3. 用 Tower Defense 的 `tile-tree-quad.glb` 做树线摆放参考，不直接导入。
4. 把 `rocks-large.glb` 只标为矿区/地形辅助，不当 goldmine。
5. 继续抓 Quaternius 或 KayKit 来补 Town Hall、Barracks、Farm、Goldmine。
6. 另起 Human unit sweep，优先 Rifleman / Sorceress / Knight。

## 6. 仍禁止的动作

```text
不得把本次 GLB 复制到 public/assets。
不得把 approved-for-intake 写成 approved-for-import。
不得让 GLM 或脚本根据本 sweep 直接接入 AssetCatalog。
不得把 Kenney tower / tree / wall 说成最终 Human 美术。
```
