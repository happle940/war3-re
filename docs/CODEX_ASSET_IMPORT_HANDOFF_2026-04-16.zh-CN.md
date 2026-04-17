# Codex 并行会话交接：A1 素材第一切片试导入

> 日期：2026-04-16
> 分支：`codex/asset-public-share`
> 给并行 Codex / GLM session：不要覆盖或回滚本文件列出的素材试导入改动。

## 当前状态

Quaternius A1 第一切片已经进入 runtime 试导入：

- `townhall`
- `barracks`
- `farm`
- `goldmine`
- `goldmine_accent` (visual-only child of `goldmine`)
- `tower`

Poly Pizza Human unit 第一切片也已经进入 runtime 试导入：

- `worker`
- `footman`
- `rifleman`
- `mortar_team`
- `priest`
- `militia`
- `sorceress`
- `knight`
- `paladin`

这不是最终美术批准。当前状态是：

```text
approved-for-import-trial-passed
final approved-for-import: none
barracks/farm optimization: applied
goldmine accent composition: applied
goldmine gold readability boost: applied
worker peasant proxy readability pass: applied
worker painted peasant billboard pass: applied
all current Human units real GLB trial: applied
Human unit style pass A1-002: applied
```

## 本次改动范围

素材文件：

- `public/assets/models/vendor/quaternius/ultimate-fantasy-rts/town-center.glb`
- `public/assets/models/vendor/quaternius/ultimate-fantasy-rts/barracks.glb`
- `public/assets/models/vendor/quaternius/ultimate-fantasy-rts/farm.glb`
- `public/assets/models/vendor/quaternius/ultimate-fantasy-rts/mine.glb`
- `public/assets/models/vendor/quaternius/ultimate-fantasy-rts/resource-gold.glb`
- `public/assets/models/vendor/quaternius/ultimate-fantasy-rts/watch-tower.glb`
- `public/assets/models/vendor/poly-pizza/units/worker.glb`
- `public/assets/models/vendor/poly-pizza/units/footman.glb`
- `public/assets/models/vendor/poly-pizza/units/rifleman_adventurer.glb`
- `public/assets/models/vendor/poly-pizza/units/mortar_team.glb`
- `public/assets/models/vendor/poly-pizza/units/priest.glb`
- `public/assets/models/vendor/poly-pizza/units/militia.glb`
- `public/assets/models/vendor/poly-pizza/units/sorceress.glb`
- `public/assets/models/vendor/poly-pizza/units/knight.glb`
- `public/assets/models/vendor/poly-pizza/units/paladin.glb`
- `public/assets/models/vendor/poly-pizza/units/unit-model-sources.json`

Runtime：

- `src/game/AssetCatalog.ts`
  - 5 个核心 building key 指向上面的 vendor 候选路径。
  - `goldmine_accent` 指向 `resource-gold.glb`，只作为 Goldmine 视觉子 cue。
  - scale 使用 `docs/PUBLIC_SHARE_ASSET_IMPORT_CHECKLIST.zh-CN.md` 中的 proof scale。
  - 9 个当前 Human unit key 指向 `public/assets/models/vendor/poly-pizza/units/` 下的本地 GLB。
- `src/game/BuildingVisualFactory.ts`
  - `goldmine` 组合 Mine body + Resource Gold accent；规则对象仍然是 `goldmine`。
- `src/game/AssetLoader.ts`
  - glTF clone 改用 SkeletonUtils，避免 skinned character 多实例共享骨架。
  - 对带 Idle 动画的角色应用静态 idle pose，避免默认 T-pose 作为第一观感。
- `src/game/UnitVisualFactory.ts`
  - 所有 cataloged unit 现在 glTF 优先；只有资产缺失/加载失败才走 proxy。
  - `worker` 不再强制走项目自制 proxy；真实 Farmer GLB 是默认形态。
  - 每个真实模型增加轻量队伍色圆环、落地阴影和职业识别件，不再用方块堆主体。
  - worker 的手绘 peasant billboard/proxy 仍保留为加载失败兜底，不再是默认路径。
- `src/game/Game.ts`
  - `morphToMilitia` / `revertMilitia` 会真正替换 mesh，民兵不再只是数据变身。
  - worker 左下角 portrait 从简笔图标升级为半身农民头像。
  - worker 血条缩窄，减少近景遮挡。
- `src/game/FeedbackEffects.ts`
  - 修复 build-complete emissive flash 对真实 glTF 材质的兼容问题。

文档：

- `docs/PUBLIC_SHARE_ASSET_IMPORT_TRIAL_A1_001.zh-CN.md`
- `docs/PUBLIC_SHARE_ASSET_IMPORT_TRIAL_A1_001.json`
- `docs/PUBLIC_SHARE_ASSET_OPTIMIZATION_PROOF_A1_001.zh-CN.md`
- `docs/PUBLIC_SHARE_ASSET_OPTIMIZATION_PROOF_A1_001.json`
- `docs/PUBLIC_SHARE_ASSET_OPTIMIZATION_PASS_A1_001.zh-CN.md`
- `docs/PUBLIC_SHARE_ASSET_OPTIMIZATION_PASS_A1_001.json`
- `docs/PUBLIC_SHARE_ASSET_GOLDMINE_COMPOSITION_PASS_A1_001.zh-CN.md`
- `docs/PUBLIC_SHARE_ASSET_GOLDMINE_COMPOSITION_PASS_A1_001.json`
- `docs/PUBLIC_SHARE_ASSET_GOLDMINE_READABILITY_PASS_A1_002.zh-CN.md`
- `docs/PUBLIC_SHARE_ASSET_GOLDMINE_READABILITY_PASS_A1_002.json`
- `artifacts/asset-intake/preview/goldmine-gold-readability-a1-002.png`
- `artifacts/asset-intake/preview/goldmine-gold-readability-a1-002.json`
- `docs/PUBLIC_SHARE_ASSET_TREE_LINE_IMPORT_GATE_A1_001.zh-CN.md`
- `docs/PUBLIC_SHARE_ASSET_TREE_LINE_IMPORT_GATE_A1_001.json`
- `docs/PUBLIC_SHARE_ASSET_TREE_LINE_LUMBER_GATE_A1_001.zh-CN.md`
- `docs/PUBLIC_SHARE_ASSET_TREE_LINE_LUMBER_GATE_A1_001.json`
- `docs/PUBLIC_SHARE_ASSET_TREE_LINE_WORKER_READABILITY_A1_001.zh-CN.md`
- `docs/PUBLIC_SHARE_ASSET_TREE_LINE_WORKER_READABILITY_A1_001.json`
- `artifacts/asset-intake/preview/tree-line-worker-readability-a1-001.png`
- `artifacts/asset-intake/preview/tree-line-worker-readability-a1-001.json`
- `docs/PUBLIC_SHARE_ASSET_WORKER_PEASANT_PROXY_A1_001.zh-CN.md`
- `docs/PUBLIC_SHARE_ASSET_WORKER_PEASANT_PROXY_A1_001.json`
- `artifacts/asset-intake/preview/worker-peasant-readability-a1-001.png`
- `artifacts/asset-intake/preview/worker-peasant-readability-a1-001.json`
- `docs/PUBLIC_SHARE_UNIT_REAL_MODEL_PASS_A1_001.zh-CN.md`
- `docs/PUBLIC_SHARE_UNIT_REAL_MODEL_PASS_A1_001.json`
- `docs/PUBLIC_SHARE_UNIT_REAL_MODEL_STYLE_PASS_A1_002.zh-CN.md`
- `docs/PUBLIC_SHARE_UNIT_REAL_MODEL_STYLE_PASS_A1_002.json`
- `artifacts/asset-intake/preview/real-unit-model-lineup-a1-001.png`
- `artifacts/asset-intake/preview/real-unit-model-lineup-a1-001.json`
- `artifacts/asset-intake/preview/real-unit-model-style-pass-a1-002.png`
- `artifacts/asset-intake/preview/real-unit-model-style-pass-a1-002.json`
- `artifacts/asset-intake/metadata/poly-pizza-unit-candidates-2026-04-16.json`
- `artifacts/asset-intake/metadata/poly-pizza-unit-glb-inspection-2026-04-16.json`
- `artifacts/asset-intake/metadata/poly-pizza-unit-glb-inspection-a1-002-2026-04-16.json`
- `public/assets/THIRD_PARTY_NOTICES.md`

## 当前运行素材 SHA-256

| runtime key | 文件 | SHA-256 | 备注 |
| --- | --- | --- | --- |
| `townhall` | `town-center.glb` | `fa7d33ff72092a96073b659eba5562ed1eadf5b60a8092d1321769b34e9177a5` | 试导入原样 |
| `barracks` | `barracks.glb` | `1b6607319c7166daec71e60c0473cd85afa4df96a1d4cd4624d6ca7ab36e7de6` | 已优化替换；原始 hash 在 optimization pass 文档 |
| `farm` | `farm.glb` | `9ba5dfacf8e469b002e41a60e746fb7d5de64feb46903fb674a8e8174fa2a6bd` | 已优化替换；原始 hash 在 optimization pass 文档 |
| `goldmine` | `mine.glb` | `cfbabb663904483aa9704b7ea63e053a58dbe882abbc2935e65f5a0425b21752` | 试导入原样 |
| `goldmine_accent` | `resource-gold.glb` | `a580525d732887e89ab7d538cefd6ce59c2d1657e5fea9f6b3839a484194faa7` | 只作为 `goldmine` 视觉 cue，不是独立资源对象 |
| `tower` | `watch-tower.glb` | `d70f8855cb45003b4f78a093a23eab61717f9246fdcdeca281bf6b341edb442a` | 试导入原样 |
| `worker` | `worker.glb` | `f7ae6e2596c6521d296fa5948783f1dac717807456ce5355e48719e81d15e9a6` | Poly Pizza / Farmer by Quaternius / CC0 candidate |
| `footman` | `footman.glb` | `4160bdbfa82959f81eeb1983879f2955552edbae15b46f0e910fb3e947b21609` | Poly Pizza / Warrior by mastjie / CC0 candidate |
| `rifleman` | `rifleman_adventurer.glb` | `4a8639cd8eee9d8a150464edc25eb0536ced464790704a64e40c8620d99f66db` | Poly Pizza / Adventurer by Quaternius / CC0 candidate；A1-002 replaces SWAT candidate |
| `mortar_team` | `mortar_team.glb` | `13ecd509b2e36cfcf934e84c30f6a946b6a892166a75e553613123217703cef0` | Poly Pizza / Cannon by Quaternius / CC0 candidate |
| `priest` | `priest.glb` | `35614ad3ead53406d14f196e3d6b1594918a632fe6bd2a166b89f4904e945fa0` | Poly Pizza / Eye Cleric by Polygonal Mind / CC0 candidate |
| `militia` | `militia.glb` | `9c28614f465b7dc105f908c20c22fc045f4b07caf8c5ef0e9f8049eceb6dd38d` | Poly Pizza / Worker by Quaternius / CC0 candidate |
| `sorceress` | `sorceress.glb` | `efcfbe1060e591aa7ff2a5330a23ead1a76505cd38f4a6aa0f49e838f341483d` | Poly Pizza / Witch by Polygonal Mind / CC0 candidate |
| `knight` | `knight.glb` | `ec6fd98a9bfb7e88ad0b5f395903da438e442d29fc816521b8b55859ca2f7939` | Poly Pizza / Warrior by mastjie / CC0 candidate |
| `paladin` | `paladin.glb` | `0f20861fbc1670b8cc87b2dbbe7dbe8d9fc6f0f794703b6bfee8431f3de8c5cf` | Poly Pizza / King by Quaternius / CC0 candidate |

## 不要做的事

- 不要把 Tree line 导入 runtime。
- 不要把 Resource Gold accent 单独当作 Goldmine 导入；它只能作为 `goldmine` 的视觉子 cue。
- 不要删除 S0 fallback / fallback manifest。
- 不要覆盖 `public/assets/models/buildings/townhall.glb`。
- 不要把 `worker` 改回“永远强制 proxy”；现在 proxy 只负责资产失败兜底。
- 不要回滚 `public/assets/models/vendor/poly-pizza/units/` 这 9 个 unit GLB。
- 不要把这次试导入宣传成最终公开美术完成。
- 不要在未重新跑验证的情况下改 `AssetCatalog.ts` 里的 building path / scale 或 9 个 unit path / scale。

## 已跑验证

- `npm run build`：pass
- 初次导入时 `npx tsc --noEmit -p tsconfig.app.json`：pass
- fallback proof：11/11 pass
- gameplay smoke：24 个场景通过输出已收集；因为并行 GLM cleanup 和长浏览器进程，部分长命令被 SIGTERM 中断，最终采用 split verification。
- 优化后 `gltf-transform validate barracks/farm`：pass，无 error / warning。
- 优化后 `npm run build`：pass。
- 优化后 fallback / asset safety：11/11 pass，用时 2.1m。
- 优化后 farm 建造中断 / 恢复烟测：1/1 pass，用时 37.8s。
- Goldmine composition regression：1/1 pass，用时 30.1s。
- Goldmine composition 后 fallback / asset safety：11/11 pass，用时 3.9m。
- Goldmine composition 后 mining saturation：2/2 pass，用时 1.3m。
- Goldmine readability boost 后 build：pass。
- Goldmine readability boost proof：2/2 pass，用时 41.8s。
- Goldmine readability boost 后 mining saturation：2/2 pass，用时 1.7m。
- Tree line lumber gate：2/2 pass，用时 21.6s。
- Tree line worker readability proof：1/1 pass，用时 17.6s。
- Worker peasant proxy aesthetic/readability proof + unit visibility regression：3/3 pass，用时 39.9s。
- Worker painted peasant billboard proof + unit visibility regression：3/3 pass，用时 36.6s。
- Human unit real model pass build：`npm run build` pass。
- Human unit real model pass full proof：asset pipeline + all-unit lineup + worker readability + unit visibility，9/9 pass，用时 2.1m。
- Human unit real model lineup proof 重拍无遮挡证明图：1/1 pass，用时 21.2s。
- Human unit style pass A1-002 build：`npm run build` pass。
- Human unit style pass A1-002 all-unit proof + unit visibility：3/3 pass，用时 41.5s。
- Human unit style pass A1-002 asset pipeline + worker readability：6/6 pass，用时 1.2m。

详见：

- `docs/PUBLIC_SHARE_ASSET_IMPORT_TRIAL_A1_001.zh-CN.md`
- `docs/PUBLIC_SHARE_ASSET_IMPORT_TRIAL_A1_001.json`

## 下一步建议

1. 如果要继续素材线，先做 GLB 优化 pass，优先 `barracks.glb` 和 `farm.glb`。
   - `done: docs/PUBLIC_SHARE_ASSET_OPTIMIZATION_PASS_A1_001.zh-CN.md`
2. Tree line 木材闭环 proof 已完成。
   - `done: docs/PUBLIC_SHARE_ASSET_TREE_LINE_LUMBER_GATE_A1_001.zh-CN.md`
   - `done: docs/PUBLIC_SHARE_ASSET_TREE_LINE_WORKER_READABILITY_A1_001.zh-CN.md`
   - 剩余：单树 / 小树丛 GLB 候选；候选替换后必须重跑这两条 proof。
3. Resource Gold accent + Goldmine 组合渲染方案已完成。
   - `done: docs/PUBLIC_SHARE_ASSET_GOLDMINE_COMPOSITION_PASS_A1_001.zh-CN.md`
   - `done: docs/PUBLIC_SHARE_ASSET_GOLDMINE_READABILITY_PASS_A1_002.zh-CN.md`
   - 注意：这是视觉增强，不是经济数值调整；`remainingGold` 仍是 2000。
4. Human unit 已有 runtime trial；下一步是替换更贴合 Warcraft 人族气质的第二轮候选，并补 Help / Credits 入口。
5. Human unit 正式美术仍未定稿；当前 Poly Pizza GLB 是公开分享前的 CC0 候选 runtime trial，不是 final art。
