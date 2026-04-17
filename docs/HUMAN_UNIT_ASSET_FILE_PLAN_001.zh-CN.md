# Human Unit 素材文件计划 001

> 日期：2026-04-16
> 来源：`docs/HUMAN_UNIT_ASSET_PREVIEW_SWEEP_001.zh-CN.md`
> 边界：这是 intake 文件计划，不是导入批准。当前不得把这些文件复制到 `public/assets`。

## 0. 文件计划结论

```text
approved-for-import: none
ready-for-file-plan: Footman body, caster body, Rig_Medium animation core
blocked: Rifleman firearm body, mounted Knight body, Worker body
```

这份计划的作用是提前规定“如果后面批准导入，文件应该怎么落”，避免素材散落、命名不一致、加载失败时没有 fallback。

## 1. 候选到 runtime key 的映射

| runtime key | 候选来源 | 目标路径草案 | 当前状态 | fallback |
| --- | --- | --- | --- | --- |
| `footman` | `Knight.glb` | `public/assets/models/units/human/footman/body.glb` | `intake-plan-only` | 当前 UnitVisualFactory 的 S0 proxy。 |
| `sorceress` | `Mage.glb` | `public/assets/models/units/human/sorceress/body.glb` | `intake-plan-only` | 当前 UnitVisualFactory 的 S0 proxy。 |
| `priest` | `Mage.glb` 派生或后续原创 | `public/assets/models/units/human/priest/body.glb` | `deferred` | 当前 UnitVisualFactory 的 S0 proxy。 |
| `rifleman` | 无合格火枪候选 | `public/assets/models/units/human/rifleman/body.glb` | `blocked` | 当前 UnitVisualFactory 的 S0 proxy。 |
| `knight` | 无骑兵候选 | `public/assets/models/units/human/knight/body.glb` | `blocked` | 当前 UnitVisualFactory 的 S0 proxy。 |
| `worker` | 无 worker GLB 候选 | `public/assets/models/units/human/worker/body.glb` | `blocked` | 当前 A1 自制 peasant proxy；见 `docs/PUBLIC_SHARE_ASSET_WORKER_PEASANT_PROXY_A1_001.zh-CN.md`。 |

## 2. 允许进入 intake 的源文件

| intake id | 源文件 | 计划动作 |
| --- | --- | --- |
| `human-kaykit-knight-footman-body-001` | `artifacts/asset-intake/extracted/kaykit-adventurers/characters/gltf/Knight.glb` | 做 scale / pivot / selection ring 检查；只作为 Footman，不作为骑兵 Knight。 |
| `human-kaykit-mage-caster-body-001` | `artifacts/asset-intake/extracted/kaykit-adventurers/characters/gltf/Mage.glb` | 做 caster body 检查；后续用颜色、武器、特效分出 Sorceress / Priest。 |
| `human-kaykit-rig-medium-animation-core-001` | `artifacts/asset-intake/extracted/kaykit-character-animations/gltf/Rig_Medium/*.glb` | 做 retarget spike；通过前不得接入 runtime mixer。 |

## 3. 暂不允许映射的源文件

| 源文件 | 不允许直接映射到 | 原因 |
| --- | --- | --- |
| `Ranger.glb` | `rifleman` | 读成弓弩手，不读成火枪兵。可以做 ranged proxy 截图，不建议公开版直接当 Rifleman。 |
| `Barbarian.glb` | `footman` / `knight` | 更像中立近战或 creep，不像 Human army 主线。 |
| `Rogue.glb` / `Rogue_Hooded.glb` | 当前 A-Human 第一批 | 可读但不是当前最缺的角色。 |
| `Samples/engineer.png` | `worker` | 只是样张，没有对应 GLB。 |

## 4. 导入前必须补的技术和产品检查

| 检查 | 验收口径 |
| --- | --- |
| scale | 和现有 worker、footman proxy、building footprint 同屏不失衡。 |
| pivot | 单位站位点在脚底中心，移动和选中环不漂移。 |
| selection ring | 选中环不被模型遮挡，不超出单位真实占位太多。 |
| team-color | 玩家 / AI 阵营至少有一个稳定可读位置。 |
| animation retarget | `Idle`、`Walk`、`Attack`、`Hit`、`Death` 至少 5 类动作在目标角色上不明显穿模。 |
| fallback | GLB 或动画失败时回到 S0 proxy，不影响战斗、选择、命令、死亡清理。 |
| bundle | 不整包导入，只导入被批准的最小文件集。 |
| notice | 即使 CC0 不强制署名，公开分享版仍建议在第三方素材清单里列出来源。 |

## 5. 第一轮最小可落地范围

2026-04-16 已完成 intake-only retarget spike：`docs/HUMAN_UNIT_ANIMATION_RETARGET_SPIKE_001.zh-CN.md`。抽样结果证明 KayKit `Rig_Medium` clip 能绑定到 KayKit Adventurers 角色骨架，但还没有通过 runtime 生命周期、脚底滑动、命中帧和 fallback 测试。

2026-04-16 追加：Worker 仍没有合格 GLB 候选，但 runtime fallback 已从基础 S0 proxy 升级为 A1 自制 peasant proxy。它只解决公开分享时的农民画面可读性，不等于 Worker final art 完成。

如果后续批准导入，建议第一轮只做这两个视觉替换：

1. `Footman = KayKit Knight body + idle / walk / melee attack spike`
2. `Sorceress/Priest proxy = KayKit Mage body + idle / walk / hit / death spike`

不要在第一轮同时处理：

- Rifleman 火枪语义。
- Mounted Knight。
- Worker。
- 全部 Rogue / Barbarian / Ranger 变体。
- 全量 173 clips 动画接入。

## 6. 仍然禁止

```text
不得把本计划当成导入批准。
不得修改 AssetCatalog。
不得复制 KayKit 文件到 public/assets。
不得让缺失素材被“临时假装已解决”。
不得在公开文案里说 Rifleman / Knight / Worker 已有正式素材。
```
