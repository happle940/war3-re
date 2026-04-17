# Human 单位真实模型试导入 A1-001

> 日期：2026-04-16  
> 状态：`import-trial-active-not-final-art`  
> 目标：所有当前 Human 单位不再默认显示成堆叠几何块；有本地 GLB 时直接显示真实模型。

## 这次落地了什么

9 个当前 Human 单位都已经接到本地真实模型路径：

| 单位 | 运行模型 | 来源候选 | 运行状态 |
| --- | --- | --- | --- |
| `worker` | `public/assets/models/vendor/poly-pizza/units/worker.glb` | Farmer by Quaternius | 已进入 runtime |
| `footman` | `public/assets/models/vendor/poly-pizza/units/footman.glb` | Warrior by mastjie | 已进入 runtime |
| `rifleman` | `public/assets/models/vendor/poly-pizza/units/rifleman_adventurer.glb` | Adventurer by Quaternius | 已进入 runtime |
| `mortar_team` | `public/assets/models/vendor/poly-pizza/units/mortar_team.glb` | Cannon by Quaternius | 已进入 runtime |
| `priest` | `public/assets/models/vendor/poly-pizza/units/priest.glb` | Eye Cleric by Polygonal Mind | 已进入 runtime |
| `militia` | `public/assets/models/vendor/poly-pizza/units/militia.glb` | Worker by Quaternius | 已进入 runtime |
| `sorceress` | `public/assets/models/vendor/poly-pizza/units/sorceress.glb` | Witch by Polygonal Mind | 已进入 runtime |
| `knight` | `public/assets/models/vendor/poly-pizza/units/knight.glb` | Warrior by mastjie | 已进入 runtime |
| `paladin` | `public/assets/models/vendor/poly-pizza/units/paladin.glb` | King by Quaternius | 已进入 runtime |

现在的行为是：

- 资产加载成功：走 `real-gltf-unit-model`。
- 资产加载失败：才退回项目自制 proxy。
- worker 不再强制使用手绘/几何 proxy；真实 Farmer GLB 是默认可见形态。
- militia 变身和 back-to-work 会真正换模型，不再只是数据变了、外观还停在 worker。
- 每个真实模型额外有很轻的队伍色圆环、落地阴影和职业识别件，用来保证 RTS 远镜头下可读，但不再是方块堆出来的主体。

## 当前观感

证明图：

- `artifacts/asset-intake/preview/real-unit-model-lineup-a1-001.png`
- `artifacts/asset-intake/preview/real-unit-model-lineup-a1-001.json`

这张图把 9 个单位排成一列检查。测试确认每个单位：

- `visualRoute = real-gltf-unit-model`
- 资产路径来自 `assets/models/vendor/poly-pizza/units/`
- 有真实模型 mesh cue
- 有非方块的 RTS 队伍/职业辅助 cue
- 屏幕内可见，尺寸没有塌缩

## 为什么不是最终美术

这次是“能用、能看、能公开分享前继续评审”的 runtime 试导入，不是最终定稿。

后续如果继续打磨，优先级是：

1. 给 `footman` / `knight` 找更接近中世纪人族军队的一套模型，减少“同源 Warrior 变体”的重复感。
2. 给 `rifleman` 找更接近火枪手的最终模型；当前 Adventurer + rifle cue 比 SWAT 更贴近人族风格，但仍是 trial。
3. 给 `mortar_team` 找“炮 + 操作手”的最终组合模型；当前 Cannon + crew cue 已能读出小队语义。
4. 给 caster 继续找更统一的最终候选；Monk / Wizard 复查后俯视读形不如 Eye Cleric / Witch，暂不进入 runtime。
5. 做 GLB 压缩和纹理预算，不让首屏加载时间继续涨。

## 已跑验证

- `npm run build`：pass
- `./scripts/run-runtime-tests.sh tests/real-unit-model-intake-proof.spec.ts tests/worker-peasant-readability-proof.spec.ts tests/unit-visibility-regression.spec.ts tests/asset-pipeline-regression.spec.ts --reporter=list`：9/9 pass
- `./scripts/run-runtime-tests.sh tests/real-unit-model-intake-proof.spec.ts --reporter=list`：1/1 pass，重拍了无遮挡证明图

## 交接注意

- 不要回滚 `src/game/AssetCatalog.ts` 里的 9 个单位路径。
- 不要把 worker 改回“永远强制 proxy”；proxy 现在只是兜底。
- 不要删除 `public/assets/models/vendor/poly-pizza/units/unit-model-sources.json`，它是本地来源索引。
- 不要把这批素材描述成 final art；公开分享时可以说是 CC0 候选素材的 runtime trial。
