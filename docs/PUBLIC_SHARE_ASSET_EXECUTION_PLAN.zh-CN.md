# 公开分享素材执行计划

> 分支：`codex/asset-public-share`
> 日期：2026-04-16
> 用途：把“素材这条线”从讨论变成可执行路径，同时保护未来公开分享和中国内地传播边界。

## 0. 当前真实状态

当前仓库里可以被网页实际加载到的二进制素材很少：

| 类型 | 当前文件 | 当前结论 |
| --- | --- | --- |
| 单位模型 | `public/assets/models/units/worker.glb` | 项目内 proxy / fallback 级别，不代表最终 worker 美术。 |
| 建筑模型 | `public/assets/models/buildings/townhall.glb` | 项目内 proxy / fallback 级别，不代表最终 Town Hall 美术。 |
| 建筑试导入模型 | `public/assets/models/vendor/quaternius/ultimate-fantasy-rts/*.glb` 六个文件 | Quaternius A1 第一切片 runtime 试导入已通过 split smoke；Barracks / Farm 已做第一轮结构优化；Resource Gold 已作为 Goldmine 视觉 cue 组合；不是最终公开美术批准。 |
| 图片 / 图标 / UI 背景 | 无 | 还没有可公开图标包或页面壳层素材。 |
| 音频 | 无 | 还没有可公开音效或音乐素材。 |
| 真实第三方素材 | intake artifact 中已有 Kenney / KayKit / Quaternius 下载包和预览；`public/assets/models/vendor/quaternius/ultimate-fantasy-rts/` 中有第一切片 5 个 GLB | Quaternius 五建筑切片已进入 runtime 试导入；没有任何第三方素材获得最终公开美术批准。 |
| AI 生成素材 | 无 | 允许进入候选流程，但不能裸用、不能未登记入库。 |

这意味着素材线现在的第一目标已经从“只建流程”推进到“受控试导入 + 验证 + 优化”：

```text
先让最小建筑切片稳定跑起来，再做性能优化、Tree line、金矿组合和 Human unit。
```

## 1. 产品落地目标

素材线服务三个产品目标。

| 目标 | 玩家看到的变化 | 当前优先级 |
| --- | --- | --- |
| `A1` 战场可读性 | 初始基地、农民、兵营、农场、塔、金矿、树线、路径更像一局可理解的 RTS。 | 最高 |
| `A-Human` 人族内容可见化 | Rifleman、Sorceress、Knight、Blacksmith、Workshop、Arcane Sanctum、Castle 等不再只是名字和数值。 | 最高 |
| `A2` 产品壳层 | 主菜单、加载、暂停、结果、设置/帮助不再是临时文本壳。 | 高 |

音效、BGM、宣传图、社媒物料暂时排在后面。它们重要，但不是阻止玩家理解当前可玩版本的第一缺口。

## 2. 公开分享资产路线

### 阶段 1：干净候选池

只收三类来源：

- `S0` 项目自制 / 程序化 proxy。
- `S1` CC0 / Public Domain 素材包。
- `S6-clean` 干净 AI 生成候选，必须有 prompt、工具、条款、人工修改记录。

这个阶段不导入素材，只做候选台账和截图/预览评估。

### 阶段 2：第一批可读性替换

优先做这些替换，而不是一次性追求全量美术：

| 批次 | 第一组目标 | 验收方式 |
| --- | --- | --- |
| 战场建筑 | Town Hall、Barracks、Farm、Tower、Goldmine、Tree line | 默认 RTS 镜头下 3 秒内能认出，不和现有 footprint 冲突。 |
| 人族单位 | Worker、Footman、Rifleman、Sorceress、Knight | 角色轮廓清楚，单位之间不混淆，队伍色可读。 |
| 科技图标 | Long Rifles、Blacksmith upgrades、Slow、Defend、Call to Arms | 命令卡中一眼能区分训练、研究、技能和状态。 |
| 壳层素材 | Main menu、Loading/briefing、Pause、Results | 不遮挡主按钮、状态、结果、说明文字。 |

每个真实导入项都必须有 deterministic fallback。真实模型加载失败或可读性失败时，游戏不能坏，必须回到 S0 proxy。

### 阶段 3：公开版原创化

如果未来要长期公开分享或商业化，第三方 CC0 / AI 候选不应直接成为最终身份。长期路线应该是：

1. 用 CC0 和 AI 候选确定比例、轮廓、色彩和可读性。
2. 找人类美术按原创世界观重新统一建模 / 绘制关键资产。
3. 保留源文件、合同、授权、修改记录。
4. 把产品命名、单位命名、建筑命名、视觉符号全部从 `War3` / `Warcraft` 联想里移出来。

## 3. 当前分支要产出的东西

本分支第一轮只做资产生产前置，不做大规模导入。

| 产物 | 文件 | 状态 |
| --- | --- | --- |
| 公开分享素材执行计划 | `docs/PUBLIC_SHARE_ASSET_EXECUTION_PLAN.zh-CN.md` | 本文件 |
| AI 素材使用红线 | `docs/AI_ASSET_GENERATION_POLICY.zh-CN.md` | 已建立 |
| AI 素材 prompt 包 | `docs/AI_ASSET_PROMPT_PACK.zh-CN.md` | 已建立 |
| 候选素材台账 | `docs/PUBLIC_SHARE_ASSET_CANDIDATE_LEDGER.zh-CN.md` | 已建立 |
| 候选素材机器台账 | `docs/PUBLIC_SHARE_ASSET_CANDIDATE_LEDGER.json` | 已建立 |
| A1 第一轮实物预览 | `docs/A1_ASSET_PREVIEW_SWEEP_001.zh-CN.md` | 已建立 |
| A1 第一轮文件计划 | `docs/A1_ASSET_FILE_PLAN_001.zh-CN.md` | 已建立 |
| Human unit 第一轮实物预览 | `docs/HUMAN_UNIT_ASSET_PREVIEW_SWEEP_001.zh-CN.md` | 已建立 |
| Human unit 第一轮文件计划 | `docs/HUMAN_UNIT_ASSET_FILE_PLAN_001.zh-CN.md` | 已建立 |
| Human unit 动画绑定 spike | `docs/HUMAN_UNIT_ANIMATION_RETARGET_SPIKE_001.zh-CN.md` | 已建立 |
| A1 核心建筑实物预览 | `docs/A1_CORE_BUILDING_ASSET_PREVIEW_SWEEP_002.zh-CN.md` | 已建立 |
| A1 核心建筑文件计划 | `docs/A1_CORE_BUILDING_FILE_PLAN_002.zh-CN.md` | 已建立 |
| A1 核心建筑 S0 并排对比 | `docs/A1_CORE_BUILDING_FALLBACK_COMPARISON_001.zh-CN.md` | 已建立 |
| A1 核心建筑队伍色和功能标识概念 | `docs/A1_CORE_BUILDING_TEAM_MARKER_CONCEPTS_001.zh-CN.md` | 已建立 |
| A1 核心建筑规则适配 proof | `docs/A1_CORE_BUILDING_RULE_FIT_PROOF_001.zh-CN.md` | 已建立 |
| A1 核心建筑加载失败 fallback proof | `docs/A1_CORE_BUILDING_LOAD_FAILURE_FALLBACK_PROOF_001.zh-CN.md` | 已建立 |
| A1 核心建筑真实玩法冒烟基线 | `docs/A1_CORE_BUILDING_GAMEPLAY_SMOKE_BASELINE_001.zh-CN.md` | 已建立 |
| A1 最小导入审查包 | `docs/PUBLIC_SHARE_ASSET_IMPORT_REVIEW_PACKET_A1_001.zh-CN.md` | 已建立 |
| 公开分享素材署名 / notice 方案 | `docs/PUBLIC_SHARE_ASSET_ATTRIBUTION_PLAN.zh-CN.md` | 已建立 |
| 第三方素材 notice 入口 | `public/assets/THIRD_PARTY_NOTICES.md` | 已建立 |
| 第一切片导入 checklist | `docs/PUBLIC_SHARE_ASSET_IMPORT_CHECKLIST.zh-CN.md` | 已建立 |
| 第一切片试导入记录 | `docs/PUBLIC_SHARE_ASSET_IMPORT_TRIAL_A1_001.zh-CN.md` | 已建立 |
| 第一切片优化 proof | `docs/PUBLIC_SHARE_ASSET_OPTIMIZATION_PROOF_A1_001.zh-CN.md` | 已建立 |
| 第一切片优化 pass | `docs/PUBLIC_SHARE_ASSET_OPTIMIZATION_PASS_A1_001.zh-CN.md` | 已建立 |
| Goldmine 组合导入 pass | `docs/PUBLIC_SHARE_ASSET_GOLDMINE_COMPOSITION_PASS_A1_001.zh-CN.md` | 已建立 |
| Tree line 导入 gate | `docs/PUBLIC_SHARE_ASSET_TREE_LINE_IMPORT_GATE_A1_001.zh-CN.md` | 已建立 |
| 并行 Codex 交接 | `docs/CODEX_ASSET_IMPORT_HANDOFF_2026-04-16.zh-CN.md` | 已建立 |

## 4. 现在的批准结论

```text
没有任何第三方素材被最终批准导入。
Quaternius 五建筑切片只处于 import-trial-active。
Barracks / Farm 已做低风险结构优化，但仍不是最终公开美术。
Resource Gold 只作为 Goldmine 视觉 cue 组合导入，不是独立资源对象。
没有任何 AI 生成素材被批准导入。
当前只批准继续做候选筛选、预览、授权记录、fallback 设计和试导入级验证。
```

## 5. 下一步执行顺序

1. 从候选台账里选一个 `A1` 建筑 / 地形包做本地预览，不直接入库。`done: Kenney sweep 001`
2. 给每个候选截图默认镜头可读性，记录是否适合 RTS 俯视视角。`done: artifacts/asset-intake/preview/kenney-a1-shortlist-rts-preview.png`
3. 选出第一批 `approved-for-intake`，但仍不等于 `approved-for-import`。`partial: tower / tree / terrain-aid only`
4. 为第一批候选写 GLB 文件计划：目标路径、命名、scale、pivot、材质、队伍色、fallback。`done for tower/tree, deferred for rocks/wall/gate`
5. 对 Human unit 做第一轮实物预览。`done: KayKit Adventurers / Character Animations sweep 001`
6. 对 Human unit 做动画 retarget intake spike。`done: Knight / Ranger / Mage sampled bind pass`
7. 对 Quaternius 做 A1 核心建筑实物预览。`done: Town Center / Barracks / Farm / Mine / Resource Gold / Trees / Watch Tower`
8. 为 Quaternius 7 个核心建筑候选写第二轮文件计划，明确目标路径、scale、pivot、footprint、队伍色、fallback。`done: docs/A1_CORE_BUILDING_FILE_PLAN_002.zh-CN.md`
9. 做 Quaternius 核心建筑和当前 S0 fallback 的并排预览，判断是否值得进入 runtime 导入包。`done: docs/A1_CORE_BUILDING_FALLBACK_COMPARISON_001.zh-CN.md`
10. 做 Quaternius Town Center / Barracks / Tower 的 team-color marker 概念和 Mine + Resource Gold 组合预览。`done: docs/A1_CORE_BUILDING_TEAM_MARKER_CONCEPTS_001.zh-CN.md`
11. 做 Quaternius footprint / selection ring / healthbar / worker pathing / projectile range 证明。`done: docs/A1_CORE_BUILDING_RULE_FIT_PROOF_001.zh-CN.md`
12. 做 Quaternius 导入前 load-failure fallback proof。`done: docs/A1_CORE_BUILDING_LOAD_FAILURE_FALLBACK_PROOF_001.zh-CN.md`
13. 做 Quaternius 导入前真实 gameplay smoke：Goldmine、Tower、Town Hall / Barracks / Farm。`done: docs/A1_CORE_BUILDING_GAMEPLAY_SMOKE_BASELINE_001.zh-CN.md`
14. 准备 Quaternius 最小 import review packet，列明只允许审查哪些文件、哪些 runtime key、哪些 fallback 和哪些复测。`done: docs/PUBLIC_SHARE_ASSET_IMPORT_REVIEW_PACKET_A1_001.zh-CN.md`
15. 做公开分享第三方素材署名 / notice 方案，决定 CC0 候选是否也统一列入 notice。`done: docs/PUBLIC_SHARE_ASSET_ATTRIBUTION_PLAN.zh-CN.md`
16. 创建 `public/assets/THIRD_PARTY_NOTICES.md` 模板，先以 `pending-import` 记录 Quaternius 第一切片。`done`
17. 准备第一切片 import checklist，限定文件复制、AssetCatalog 改动、fallback 保留和复测命令。`done: docs/PUBLIC_SHARE_ASSET_IMPORT_CHECKLIST.zh-CN.md`
18. 等 owner 明确允许后，执行第一切片试导入并写 `docs/PUBLIC_SHARE_ASSET_IMPORT_TRIAL_A1_001.zh-CN.md`。`done: split verification passed`
19. 做 Quaternius 第一切片 GLB 优化 proof，重点看材质、节点、draw call、测试耗时。`done: docs/PUBLIC_SHARE_ASSET_OPTIMIZATION_PROOF_A1_001.zh-CN.md`
20. 做第一切片优化 pass，先处理 `barracks.glb` 和 `farm.glb`，优化后重新跑 fallback / mining / tower smoke。`done: docs/PUBLIC_SHARE_ASSET_OPTIMIZATION_PASS_A1_001.zh-CN.md`
21. Resource Gold accent + Goldmine 组合 proof。`done: docs/PUBLIC_SHARE_ASSET_GOLDMINE_COMPOSITION_PASS_A1_001.zh-CN.md`
22. Tree line 导入 gate。`done: docs/PUBLIC_SHARE_ASSET_TREE_LINE_IMPORT_GATE_A1_001.zh-CN.md`
23. 对 Blacksmith、Rifleman、Sorceress、Knight 等 AI 草稿使用 `docs/AI_ASSET_PROMPT_PACK.zh-CN.md`，生成后默认记为 `reference-only`。
24. Tree line 仍需单独 worker 遮挡 / 采木 proof，不跟 Goldmine 组合混入。

## 6. 参考来源

- KayKit Medieval Hexagon Pack: https://kaylousberg.itch.io/kaykit-medieval-hexagon
- KayKit Adventurers: https://kaylousberg.itch.io/kaykit-adventurers
- KayKit Character Animations: https://kaylousberg.itch.io/kaykit-character-animations
- Quaternius Ultimate Fantasy RTS: https://quaternius.com/packs/ultimatefantasyrts.html
- Quaternius Fantasy Props MegaKit: https://quaternius.com/packs/fantasypropsmegakit.html
- Kenney Support / license FAQ: https://kenney.nl/support
- Game-icons.net FAQ: https://game-icons.net/faq.html
- Meshy commercial use FAQ: https://help.meshy.ai/en/articles/9992001-can-i-use-my-generated-assets-for-commercial-projects
- Tripo terms: https://www.tripo3d.ai/terms
- Hunyuan3D-2 license: https://github.com/Tencent-Hunyuan/Hunyuan3D-2/blob/main/LICENSE
- 生成式人工智能服务管理暂行办法: https://www.cac.gov.cn/2023-07/13/c_1690898327029107.htm
- 人工智能生成合成内容标识办法: https://www.cac.gov.cn/2025-03/14/c_1743654684782215.htm
- 国家新闻出版署国产网络游戏审批事项: https://www.nppa.gov.cn/bsfw/xksx/cbfxl/wlcbfwspsx/202210/t20221013_600725.html
