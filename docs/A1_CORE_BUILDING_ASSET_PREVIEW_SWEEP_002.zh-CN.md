# A1 核心建筑素材预览 Sweep 002

> 日期：2026-04-16
> 分支：`codex/asset-public-share`
> 目的：把主基地、兵营、农场、金矿、树线、塔这组“玩家第一眼会看到的战场核心素材”从来源研究推进到本地 GLB 预览。
> 边界：本 sweep 不批准导入 runtime；不复制任何第三方素材到 `public/assets`。

## 0. 本次结论

```text
approved-for-import: none
approved-for-intake: partial, Quaternius core building / resource / tree / tower candidates
runtime asset changes: none
```

本轮真正推进的是 Quaternius / Poly Pizza 这条线：

- Quaternius 官方页确认 `Ultimate Fantasy RTS` 是 CC0 来源，并且包方向就是 RTS 建筑和自然物。
- Poly Pizza 镜像页暴露出 107 个模型索引，其中 67 个和 A1 战场核心有关。
- 本地成功下载 7 个优先 GLB：Town Center、Barracks、Farm、Mine、Resource Gold、Trees、Watch Tower。
- 7 个 GLB 都通过 GLB v2 文件头检查。
- Playwright 本地打开预览页，7 个模型都加载成功，默认 RTS 镜头截图非空。

预览图：

```text
artifacts/asset-intake/preview/quaternius-core-buildings-rts-preview.png
```

机器记录：

```text
docs/A1_CORE_BUILDING_ASSET_PREVIEW_SWEEP_002.json
artifacts/asset-intake/manifests/quaternius_ultimate_fantasy_rts_poly_pizza_index.json
artifacts/asset-intake/preview/quaternius-core-buildings-preview.metrics.json
```

## 1. 玩家第一眼能解决什么

这批素材的价值不是“最终美术已经完成”，而是它第一次把 A1 战场最缺的几块放到同一张画面里：

| 玩家看到的东西 | 本次候选 | 产品判断 |
| --- | --- | --- |
| 主基地锚点 | `Town Center` | 比当前 proxy 更像基地核心，体量够大，适合继续进 intake。 |
| 造兵建筑 | `Barracks` | 读成军营没问题，但还要做 Human 色彩、旗帜或军事识别强化。 |
| 人口 / 补给建筑 | `Farm` | 平民建筑语义清楚，适合承担 farm，但不能放太大，否则会抢主基地层级。 |
| 金矿主体 | `Mine` | 洞口和岩体可读，适合承担 goldmine 主体，但还缺 worker 采集路径证明。 |
| 金矿识别 cue | `Resource Gold` | 金色 cue 清楚，但只能做矿区强调，不能单独当金矿。 |
| 木材边界 | `Trees` | 树组能形成资源边界，后续重点是成排摆放和不遮 worker。 |
| 防御塔 | `Watch Tower` | 高度和轮廓可读，后续要补攻击点、阵营色和 footprint。 |

## 2. 本次批准进入 intake 的子候选

| sub_candidate_id | 来源模型 | A1 类别 | 当前状态 | 导入结论 |
| --- | --- | --- | --- | --- |
| `a1-quaternius-town-center-001` | `CoERW5nFdE-town-center.glb` | `townhall` | `approved-for-intake` | 不导入。先做 scale、pivot、selection ring、team color。 |
| `a1-quaternius-barracks-001` | `dvlksXgxWc-barracks.glb` | `barracks` | `approved-for-intake` | 不导入。先做军营识别、footprint、rally 兼容。 |
| `a1-quaternius-farm-001` | `91wMLb9kKo-farm.glb` | `farm` | `approved-for-intake` | 不导入。先控制体量，避免抢主基地层级。 |
| `a1-quaternius-mine-001` | `wOJ61Fa0Lt-mine.glb` | `goldmine` | `approved-for-intake` | 不导入。先验证 worker 靠近、采集、选择圈。 |
| `a1-quaternius-resource-gold-accent-001` | `jkqD4dMoz1-resource-gold.glb` | `goldmine / terrain aid` | `approved-for-intake` | 不导入。只能作为金矿 accent，不单独承担金矿。 |
| `a1-quaternius-tree-line-001` | `jUzojhHoYR-trees.glb` | `trees / tree line` | `approved-for-intake` | 不导入。先做重复摆放和遮挡测试。 |
| `a1-quaternius-watch-tower-001` | `f2J0aSLVi4-watch-tower.glb` | `tower` | `approved-for-intake` | 不导入。先补攻击 cue、阵营色和 footprint。 |

## 3. KayKit Medieval Hexagon 当前状态

KayKit Medieval Hexagon 仍然是高优先级候选，但本轮没有拿到可预览 GLB：

- 官方 itch 页面已保存。
- 付费为 0 的官方下载流程能走到下载页。
- 下载页明确显示 Free / 33 MB / Apr 26, 2024。
- 本地下载在等待后取消，没有得到 zip 文件。

所以它现在只能记为：

```text
candidate-source-verified-download-pending
```

也就是说：来源和包存在，但不能把它列入“已实物预览”的素材池。

## 4. 还不能导入的原因

这些 Quaternius 候选已经比“网页收藏”前进了一大步，但还没到 runtime：

- 没有 runtime 路径和 `AssetCatalog` 映射批准。
- 没有 scale、pivot、selection ring、footprint、阻挡和 worker pathing 证明。
- 没有 team-color / 材质统一方案。
- 没有和当前 S0 fallback 的并排对照图。
- 没有 fallback regression 更新。
- 没有把公开来源 packet 晋升到 runtime 文档。

## 5. 下一步建议

1. 先用 Quaternius 这 7 个 GLB 做 `A1_CORE_BUILDING_FILE_PLAN_002`，把目标路径、scale、pivot、fallback、队伍色需求写清楚。
2. 对 Town Center、Barracks、Farm、Mine 做一张 S0 fallback 并排图，判断替换后玩家是否更清楚。
3. 对 Goldmine 单独做 worker 靠近和遮挡验证，金矿不能只看静态截图。
4. KayKit Medieval Hexagon 继续重试下载，但在拿到 zip 前不参与实物预览结论。
5. 仍然不把任何 GLB 放进 `public/assets`。

## 6. 参考来源

- Quaternius Ultimate Fantasy RTS: https://quaternius.com/packs/ultimatefantasyrts.html
- Poly Pizza Ultimate Fantasy RTS mirror: https://poly.pizza/bundle/Ultimate-Fantasy-RTS-nSDjmACoSU
- KayKit Medieval Hexagon Pack: https://kaylousberg.itch.io/kaykit-medieval-hexagon
