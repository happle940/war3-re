# 公开分享素材第一切片导入 Checklist

> 日期：2026-04-16
> 分支：`codex/asset-public-share`
> 依据：`docs/PUBLIC_SHARE_ASSET_IMPORT_REVIEW_PACKET_A1_001.zh-CN.md`
> 状态：`executed-for-first-trial-slice`
> 边界：这张清单已经用于第一切片试导入；后续二次导入不得扩大范围，除非另写新的 checklist。

## 0. 当前结论

```text
approved-for-import: none
approved-for-import-trial: five-building slice
runtime asset changes: yes
```

第一切片只覆盖 5 个 runtime building key：

```text
townhall
barracks
farm
goldmine
tower
```

Tree line 和 Resource Gold accent 不进第一切片。

## 1. 执行前必须满足

| Gate | 要求 | 当前状态 |
| --- | --- | --- |
| 候选台账 | Quaternius 子候选为 `approved-for-intake`，不是 `approved-for-import`。 | 已满足 |
| Import review packet | `docs/PUBLIC_SHARE_ASSET_IMPORT_REVIEW_PACKET_A1_001.zh-CN.md` 已准备。 | 已满足 |
| Notice 入口 | `public/assets/THIRD_PARTY_NOTICES.md` 已存在并标明 `pending-import-review`。 | 已满足 |
| Owner 决策 | 明确允许第一切片开始。 | 已满足 |
| 复测预算 | 能完整跑 fallback proof 和 gameplay smoke。 | 已满足：fallback 完整通过；gameplay 使用 split verification。 |

后续如果要继续导入 Tree line、Resource Gold accent 或其他素材，必须另写新的 checklist。

## 2. 只允许复制的文件

| 目标 runtime key | 源文件 | 目标候选路径 |
| --- | --- | --- |
| `townhall` | `artifacts/asset-intake/downloads/poly-pizza/quaternius-ultimate-fantasy-rts/CoERW5nFdE-town-center.glb` | `public/assets/models/vendor/quaternius/ultimate-fantasy-rts/town-center.glb` |
| `barracks` | `artifacts/asset-intake/downloads/poly-pizza/quaternius-ultimate-fantasy-rts/dvlksXgxWc-barracks.glb` | `public/assets/models/vendor/quaternius/ultimate-fantasy-rts/barracks.glb` |
| `farm` | `artifacts/asset-intake/downloads/poly-pizza/quaternius-ultimate-fantasy-rts/91wMLb9kKo-farm.glb` | `public/assets/models/vendor/quaternius/ultimate-fantasy-rts/farm.glb` |
| `goldmine` | `artifacts/asset-intake/downloads/poly-pizza/quaternius-ultimate-fantasy-rts/wOJ61Fa0Lt-mine.glb` | `public/assets/models/vendor/quaternius/ultimate-fantasy-rts/mine.glb` |
| `tower` | `artifacts/asset-intake/downloads/poly-pizza/quaternius-ultimate-fantasy-rts/f2J0aSLVi4-watch-tower.glb` | `public/assets/models/vendor/quaternius/ultimate-fantasy-rts/watch-tower.glb` |

禁止复制：

- `jUzojhHoYR-trees.glb`
- `jkqD4dMoz1-resource-gold.glb`
- Quaternius 包内任何其他模型、贴图、示例、说明文件
- KayKit / Kenney / Game-icons.net / AI 输出

## 3. 只允许的 runtime 改动

第一切片只允许改 `src/game/AssetCatalog.ts` 中这 5 个 key 的 `path` 和 `scale`：

| key | path | scale |
| --- | --- | --- |
| `townhall` | `assets/models/vendor/quaternius/ultimate-fantasy-rts/town-center.glb` | `2.5299` |
| `barracks` | `assets/models/vendor/quaternius/ultimate-fantasy-rts/barracks.glb` | `1.4369` |
| `farm` | `assets/models/vendor/quaternius/ultimate-fantasy-rts/farm.glb` | `0.8123` |
| `goldmine` | `assets/models/vendor/quaternius/ultimate-fantasy-rts/mine.glb` | `1.7960` |
| `tower` | `assets/models/vendor/quaternius/ultimate-fantasy-rts/watch-tower.glb` | `1.8461` |

不允许在第一切片里做：

- 删除或弱化 fallback manifest。
- 删除 `BuildingVisualFactory` / 程序 fallback。
- 改 worker、footman、rifleman、人族新单位。
- 改建筑数据、价格、血量、攻击力、训练队列。
- 改 Tree line、Resource Gold accent、icon、UI、音频。
- 把 Quaternius 素材说成最终原创美术。

## 4. 导入后必须跑的验证

第一组：加载失败和 fallback 安全线。

```bash
./scripts/run-runtime-tests.sh tests/asset-pipeline-regression.spec.ts tests/v3-asset-fallback-catalog-proof.spec.ts --reporter=list
```

第二组：真实玩法基线。

```bash
./scripts/run-runtime-tests.sh tests/mining-saturation-regression.spec.ts tests/static-defense-regression.spec.ts tests/construction-lifecycle-regression.spec.ts tests/building-agency-regression.spec.ts --reporter=list
```

第三组：视觉 proof 重渲染。

```text
artifacts/asset-intake/preview/quaternius-rule-fit-proof.png
```

导入后要新增一份执行记录，不能覆盖旧 proof：

```text
docs/PUBLIC_SHARE_ASSET_IMPORT_TRIAL_A1_001.zh-CN.md
```

## 5. 失败处理

任一情况出现，都必须停止试导入并回滚到 S0 fallback 路线：

- 页面启动报严重 console error。
- 任一 key 出现空模型、透明模型、不可选模型。
- Goldmine 采集容量或回收路径失败。
- Tower 目标选择、射程、弹道或友军过滤失败。
- 取消建造后 HUD / 选择圈 / 命令面板无效。
- 模型遮挡选择圈、血条或主要状态反馈。
- Tree line / Resource Gold accent 被顺手导入。

失败后只允许写失败记录，不允许继续扩大导入范围。

## 6. 导入成功后的状态仍然不是最终美术

第一切片通过后，最多只能把状态推进到：

```text
approved-for-import-trial-passed
```

不能直接写：

```text
final art complete
public art solved
Warcraft-like assets ready
```

下一步还要补：

- Tree line worker 遮挡 / 采木 proof。
- Goldmine + Resource Gold accent 组合渲染 proof。
- Human unit 正式资产路线。
- Help / Credits 游戏内入口。
- 如果对外发布，README / 页面文案必须同步写明素材仍是候选和 fallback 路线。
