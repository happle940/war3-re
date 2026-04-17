# A1 公开分享素材最小导入审查包 001

> 日期：2026-04-16
> 分支：`codex/asset-public-share`
> 候选来源：Quaternius Ultimate Fantasy RTS
> 状态：`review-ready, not approved-for-import`
> 边界：这是审查包，不是导入执行记录。当前仍不得复制 Quaternius 文件到 `public/assets`。

## 0. 审查结论

```text
approved-for-import: none
review packet: ready for owner review
runtime asset changes: none
```

这份包回答一个问题：

```text
如果下一步要做第一次 A1 建筑素材试导入，最小、可回滚、可复测的范围是什么？
```

答案是：只允许围绕 Quaternius 的 7 个已审候选继续审查，不允许整包导入，不允许加入新来源，不允许删除 S0 fallback。

## 1. 已经完成的准入证据

| 证据 | 文件 | 结论 |
| --- | --- | --- |
| 实物预览 | `docs/A1_CORE_BUILDING_ASSET_PREVIEW_SWEEP_002.zh-CN.md` | 7 个子候选进入 `approved-for-intake`。 |
| S0 并排对比 | `docs/A1_CORE_BUILDING_FALLBACK_COMPARISON_001.zh-CN.md` | Quaternius 世界感更强，S0 cue 更直白。 |
| 队伍色 / 功能标识概念 | `docs/A1_CORE_BUILDING_TEAM_MARKER_CONCEPTS_001.zh-CN.md` | 小旗、徽记、武器 cue、金矿 accent 是可行补强方向。 |
| 规则适配 proof | `docs/A1_CORE_BUILDING_RULE_FIT_PROOF_001.zh-CN.md` | 收口 scale 后 footprint / selection / healthbar / range 静态 proof 通过。 |
| 加载失败 fallback proof | `docs/A1_CORE_BUILDING_LOAD_FAILURE_FALLBACK_PROOF_001.zh-CN.md` | 11 个 runtime 测试通过，S0 安全网可保护后续尝试。 |
| 真实玩法冒烟基线 | `docs/A1_CORE_BUILDING_GAMEPLAY_SMOKE_BASELINE_001.zh-CN.md` | 24 个玩法测试通过，采矿、塔防、建造、HUD、命令面板基线稳定。 |

## 2. 允许继续审查的素材

| runtime key / 用途 | 子候选 | 源文件 | SHA-256 | 审查状态 |
| --- | --- | --- | --- | --- |
| `townhall` | `a1-quaternius-town-center-001` | `artifacts/asset-intake/downloads/poly-pizza/quaternius-ultimate-fantasy-rts/CoERW5nFdE-town-center.glb` | `fa7d33ff72092a96073b659eba5562ed1eadf5b60a8092d1321769b34e9177a5` | 可进入第一试导入切片。 |
| `barracks` | `a1-quaternius-barracks-001` | `artifacts/asset-intake/downloads/poly-pizza/quaternius-ultimate-fantasy-rts/dvlksXgxWc-barracks.glb` | `b62a47e6cf8cdacc87be9afb6c5201a6becaf3e2616fd5d6797958b00e99ef74` | 可进入第一试导入切片。 |
| `farm` | `a1-quaternius-farm-001` | `artifacts/asset-intake/downloads/poly-pizza/quaternius-ultimate-fantasy-rts/91wMLb9kKo-farm.glb` | `403cd4f1218f2d45392becbf63e1bec64df527152235f99895342c5dd2b8b2c2` | 可进入第一试导入切片。 |
| `goldmine` | `a1-quaternius-mine-001` | `artifacts/asset-intake/downloads/poly-pizza/quaternius-ultimate-fantasy-rts/wOJ61Fa0Lt-mine.glb` | `cfbabb663904483aa9704b7ea63e053a58dbe882abbc2935e65f5a0425b21752` | 可进入第一试导入切片，但必须复测采矿。 |
| `tower` | `a1-quaternius-watch-tower-001` | `artifacts/asset-intake/downloads/poly-pizza/quaternius-ultimate-fantasy-rts/f2J0aSLVi4-watch-tower.glb` | `d70f8855cb45003b4f78a093a23eab61717f9246fdcdeca281bf6b341edb442a` | 可进入第一试导入切片，但必须复测塔防。 |
| `tree_line` | `a1-quaternius-tree-line-001` | `artifacts/asset-intake/downloads/poly-pizza/quaternius-ultimate-fantasy-rts/jUzojhHoYR-trees.glb` | `a61c2378b7a103276c8deb8ddbeda0d5b21d7cc638bca48500b97baabdf651d5` | 暂缓到第二切片，先补 worker 遮挡 / 采木 proof。 |
| `goldmine_accent` | `a1-quaternius-resource-gold-accent-001` | `artifacts/asset-intake/downloads/poly-pizza/quaternius-ultimate-fantasy-rts/jkqD4dMoz1-resource-gold.glb` | `014be202047295172158f524d11ecc0a172eef544b4d11fd0fe55b48e55be1f3` | 只能作为组合 cue，不得作为独立可采集建筑。 |

## 3. 第一次试导入建议切片

第一切片只做玩家最先能感知的 5 个 runtime building key：

```text
townhall
barracks
farm
goldmine
tower
```

暂不把 Tree line 和 Resource Gold accent 放进第一切片：

- Tree line 需要单独证明 worker 采木、遮挡和边界可读性。
- Resource Gold accent 需要组合渲染方案，不能单独冒充 Goldmine。

推荐路径不要覆盖现有 S0 / project-proxy 文件，而是先放到明确的候选目录：

```text
public/assets/models/vendor/quaternius/ultimate-fantasy-rts/town-center.glb
public/assets/models/vendor/quaternius/ultimate-fantasy-rts/barracks.glb
public/assets/models/vendor/quaternius/ultimate-fantasy-rts/farm.glb
public/assets/models/vendor/quaternius/ultimate-fantasy-rts/mine.glb
public/assets/models/vendor/quaternius/ultimate-fantasy-rts/watch-tower.glb
```

这样做的产品原因很简单：试导入失败时，玩家仍然能回到当前可读的 S0 fallback，而不是被一个覆盖掉的坏文件卡住。

## 4. 第一切片建议 scale

| runtime key | proof scale | 说明 |
| --- | --- | --- |
| `townhall` | `2.5299` | 已从初始 2.7220 缩小，避免超出 size 4。 |
| `barracks` | `1.4369` | 已从初始 1.5076 缩小，避免超出 size 3。 |
| `farm` | `0.8123` | 已从初始 0.8701 缩小，保持平民建筑层级。 |
| `goldmine` | `1.7960` | 静态 proof 尺寸可用，但采集点必须复测。 |
| `tower` | `1.8461` | 静态 proof 尺寸可用，但攻击点必须复测。 |

这些 scale 是试导入起点，不是最终美术参数。

## 5. 导入执行时必须保留的安全线

- `approved_for_import` 在 owner 接受前仍为空。
- 只允许复制上表列出的最小文件，不允许整包导入。
- `AssetCatalog` 只能指向候选目录，不得删除 fallback manifest。
- `BuildingVisualFactory` 的 S0 proxy 和程序 fallback 必须继续存在。
- 加载失败、缺文件、路径写错时，游戏必须显示 S0 fallback，而不是空白或报错停住。
- 公共文案不能说“最终美术完成”，只能说“候选素材试导入中”。
- 即使 Quaternius 是 CC0 候选，公开版仍建议在 third-party notices 里记录来源。

## 6. 试导入后的复测命令

第一次 asset copy / catalog change 后必须跑：

```bash
./scripts/run-runtime-tests.sh tests/asset-pipeline-regression.spec.ts tests/v3-asset-fallback-catalog-proof.spec.ts --reporter=list
```

```bash
./scripts/run-runtime-tests.sh tests/mining-saturation-regression.spec.ts tests/static-defense-regression.spec.ts tests/construction-lifecycle-regression.spec.ts tests/building-agency-regression.spec.ts --reporter=list
```

还要重新渲染 / 记录：

```text
artifacts/asset-intake/preview/quaternius-rule-fit-proof.png
docs/A1_CORE_BUILDING_RULE_FIT_PROOF_001.zh-CN.md
```

如果任一项失败，处理方式不是继续补素材，而是回到 S0 fallback 并写失败记录。

## 7. 当前 owner 需要拍板的点

| 决策 | 推荐 |
| --- | --- |
| 是否允许第一切片复制 5 个 Quaternius GLB 到候选 runtime 目录 | 可以审查，但还不要默认批准。 |
| 是否覆盖现有 `public/assets/models/buildings/townhall.glb` | 不建议覆盖，先走 vendor 候选路径。 |
| 是否第一批同时上 Tree line | 不建议，先补 worker 遮挡 / 采木 proof。 |
| 是否第一批同时上 Resource Gold accent | 不建议，先设计组合渲染方案。 |
| 是否对外宣传素材完成 | 不允许，只能说素材候选和试导入流程完成到审查包。 |

## 8. 结论

这份包把素材线从“候选看起来不错”推进到“可以进行最小试导入审查”。

但最终状态仍然是：

```text
approved-for-intake, not approved-for-import
```
