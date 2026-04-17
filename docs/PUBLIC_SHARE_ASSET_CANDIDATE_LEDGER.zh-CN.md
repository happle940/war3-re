# 公开分享素材候选台账

> 日期：2026-04-16
> 用途：把“可以考虑的素材来源”拆成候选记录。
> 重要边界：本文不是批准导入清单。所有条目当前最多是 `candidate` 或 `lab-only`。

## 0. 当前结论

```text
approved-for-import: none
approved-for-import-trial: Quaternius A1 five-building slice with Barracks / Farm optimization pass, Goldmine accent composition/readability boost, and current Tree line safety proofs applied
approved-for-intake: partial, Kenney A1 tower / tree / terrain-aid + KayKit Human Footman / caster / animation-core + Quaternius A1 core building / resource / tree / tower sub-candidates
candidate: KayKit / Quaternius / Kenney / Game-icons.net / Meshy paid / Tripo paid
lab-only / blocked for public runtime: Hunyuan3D-2
```

## 1. 候选总表

| candidate_id | 来源 | source_class | 优先用途 | 当前状态 | 决策 |
| --- | --- | --- | --- | --- | --- |
| `pub-a1-kaykit-medieval-hexagon-001` | KayKit Medieval Hexagon Pack | `S1` | A1 建筑、金矿、树、地形；A-Human Blacksmith / Barracks / Lumber Mill | `candidate-source-verified-download-pending` | 页面和免费 33 MB 下载页已到达，但本地 zip 下载超时取消；拿到文件前不进入实物预览结论。 |
| `pub-ah-kaykit-adventurers-001` | KayKit Adventurers | `S1` | Footman、caster、ranged proxy 候选 | `partial-approved-for-intake` | 已完成 Sweep 001；Knight body 可进 Footman intake，Mage body 可进 caster intake；Rifleman、骑兵 Knight、Worker 仍未解决。 |
| `pub-ah-kaykit-character-animations-001` | KayKit Character Animations | `S1` | humanoid idle / move / attack / tool 动画 | `partial-approved-for-intake` | 已完成 Sweep 001；Rig_Medium 动画核心可进 retarget intake，未批准 runtime 导入。 |
| `pub-a1-quaternius-ultimate-fantasy-rts-001` | Quaternius Ultimate Fantasy RTS | `S1` | A1 建筑、自然、地形、RTS 场景候选 | `partial-approved-for-intake` | Sweep 002 已完成；Town Center / Barracks / Farm / Mine / Resource Gold / Watch Tower 已进入 import trial / composition trial；Goldmine 已补金色可读性增强；Trees 仍不导入，但当前 S0 树线已补木材闭环和工人遮挡 proof。 |
| `pub-ah-quaternius-fantasy-props-001` | Quaternius Fantasy Props MegaKit | `S1` | Blacksmith props、武器架、工具、法师/市场/木材细节 | `candidate` | 适合作为建筑识别细节，不直接替代完整建筑。 |
| `pub-a1-kenney-tower-defense-001` | Kenney Tower Defense Kit | `S1` | tower、防御、墙体、低模战场构件 | `partial-approved-for-intake` | 已完成 Sweep 001；tree tile 可进 intake，tower 仍需调色和语义重评。 |
| `pub-a1-kenney-castle-kit-001` | Kenney Castle Kit | `S1` | Castle / Keep / tower / wall 轮廓候选 | `partial-approved-for-intake` | 已完成 Sweep 001；tower、tree、rocks、wall/gate 可进 intake，但不能导入。 |
| `pub-ui-game-icons-001` | Game-icons.net | `S2` | command card、研究、技能、设置/help 图标 | `candidate-with-attribution` | 可用但必须做署名页和 third-party notices。 |
| `pub-s6-meshy-paid-clean-001` | Meshy paid route | `S6` | 原创低模 3D 草稿、缺口补齐 | `candidate` | 只接受付费账号 + 干净输入 + 人工改造。 |
| `pub-s6-tripo-paid-clean-001` | Tripo paid route | `S6` | 原创低模 3D 草稿、快速预览 | `candidate` | 只接受付费账号 + 干净输入；免费输出不进公开素材线。 |
| `pub-s6-hunyuan3d-lab-only-001` | Hunyuan3D-2 | `S6` | 技术研究 | `lab-only` | 暂不进入公开版 runtime 资产链。 |

## 2. 第一批推荐预览顺序

2026-04-16 已完成第一轮 Kenney 预览：

- 控制文档：`docs/A1_ASSET_PREVIEW_SWEEP_001.zh-CN.md`
- 机器记录：`docs/A1_ASSET_PREVIEW_SWEEP_001.json`
- 预览图：`artifacts/asset-intake/preview/kenney-a1-shortlist-rts-preview.png`

本轮只批准 Kenney 的 tower / tree / terrain-aid 子候选进入 `approved-for-intake`，不批准任何素材导入 runtime。

2026-04-16 已完成第一轮 KayKit Human unit 预览：

- 控制文档：`docs/HUMAN_UNIT_ASSET_PREVIEW_SWEEP_001.zh-CN.md`
- 机器记录：`docs/HUMAN_UNIT_ASSET_PREVIEW_SWEEP_001.json`
- 文件计划：`docs/HUMAN_UNIT_ASSET_FILE_PLAN_001.zh-CN.md`
- 动画 spike：`docs/HUMAN_UNIT_ANIMATION_RETARGET_SPIKE_001.zh-CN.md`
- 预览图：`artifacts/asset-intake/preview/kaykit-human-units-rts-preview.png`

本轮只批准 KayKit 的 Footman body、caster body、Rig_Medium animation core 子候选进入 `approved-for-intake`，不批准任何素材导入 runtime。

动画绑定抽样已经通过：Knight 近战、Ranger 远程、Mage idle 三组都没有缺失 track target，探针骨骼发生实际变化。这个结果只说明动画路线可继续，不等于游戏内动画导入完成。

2026-04-16 已完成 Quaternius A1 core building 预览：

- 控制文档：`docs/A1_CORE_BUILDING_ASSET_PREVIEW_SWEEP_002.zh-CN.md`
- 机器记录：`docs/A1_CORE_BUILDING_ASSET_PREVIEW_SWEEP_002.json`
- 文件计划：`docs/A1_CORE_BUILDING_FILE_PLAN_002.zh-CN.md`
- S0 并排对比：`docs/A1_CORE_BUILDING_FALLBACK_COMPARISON_001.zh-CN.md`
- 队伍色 / 功能标识概念：`docs/A1_CORE_BUILDING_TEAM_MARKER_CONCEPTS_001.zh-CN.md`
- 规则适配 proof：`docs/A1_CORE_BUILDING_RULE_FIT_PROOF_001.zh-CN.md`
- 模型索引：`artifacts/asset-intake/manifests/quaternius_ultimate_fantasy_rts_poly_pizza_index.json`
- 预览图：`artifacts/asset-intake/preview/quaternius-core-buildings-rts-preview.png`
- 并排图：`artifacts/asset-intake/preview/quaternius-vs-s0-core-buildings-rts-preview.png`
- 标识概念图：`artifacts/asset-intake/preview/quaternius-team-marker-concepts.png`
- 规则适配图：`artifacts/asset-intake/preview/quaternius-rule-fit-proof.png`
- 加载失败 fallback proof：`docs/A1_CORE_BUILDING_LOAD_FAILURE_FALLBACK_PROOF_001.zh-CN.md`
- 真实玩法冒烟基线：`docs/A1_CORE_BUILDING_GAMEPLAY_SMOKE_BASELINE_001.zh-CN.md`
- 最小导入审查包：`docs/PUBLIC_SHARE_ASSET_IMPORT_REVIEW_PACKET_A1_001.zh-CN.md`
- 公开分享素材署名 / notice 方案：`docs/PUBLIC_SHARE_ASSET_ATTRIBUTION_PLAN.zh-CN.md`
- 第三方素材 notice 入口：`public/assets/THIRD_PARTY_NOTICES.md`
- 第一切片导入 checklist：`docs/PUBLIC_SHARE_ASSET_IMPORT_CHECKLIST.zh-CN.md`
- 第一切片试导入记录：`docs/PUBLIC_SHARE_ASSET_IMPORT_TRIAL_A1_001.zh-CN.md`
- 第一切片优化 proof：`docs/PUBLIC_SHARE_ASSET_OPTIMIZATION_PROOF_A1_001.zh-CN.md`
- 第一切片优化 pass：`docs/PUBLIC_SHARE_ASSET_OPTIMIZATION_PASS_A1_001.zh-CN.md`
- Goldmine 组合导入 pass：`docs/PUBLIC_SHARE_ASSET_GOLDMINE_COMPOSITION_PASS_A1_001.zh-CN.md`
- Goldmine 金色可读性 pass：`docs/PUBLIC_SHARE_ASSET_GOLDMINE_READABILITY_PASS_A1_002.zh-CN.md`
- Tree line 导入 gate：`docs/PUBLIC_SHARE_ASSET_TREE_LINE_IMPORT_GATE_A1_001.zh-CN.md`
- Tree line 木材闭环 gate：`docs/PUBLIC_SHARE_ASSET_TREE_LINE_LUMBER_GATE_A1_001.zh-CN.md`
- Tree line 工人遮挡 proof：`docs/PUBLIC_SHARE_ASSET_TREE_LINE_WORKER_READABILITY_A1_001.zh-CN.md`
- 并行 Codex 交接：`docs/CODEX_ASSET_IMPORT_HANDOFF_2026-04-16.zh-CN.md`

本轮只批准 Quaternius 的 Town Center、Barracks、Farm、Mine、Resource Gold、Trees、Watch Tower 子候选进入 `approved-for-intake`。其中 Town Center、Barracks、Farm、Mine、Watch Tower 五个子候选已进入 `approved-for-import-trial-passed`，但不是最终公开美术批准。并排对比显示：Quaternius 的世界感更强，但当前 S0 的队伍色和功能 cue 更直白。标识概念验证显示：小型蓝旗、徽记、武器 cue、金矿 accent 可能补回可读性。规则适配 proof 显示：经过缩放收口后，这组素材可以压进当前 footprint、selection ring、healthbar、Goldmine worker lane、Tree line 重复摆放和 Tower range 的静态 proof。加载失败 fallback proof 已通过 11 个 runtime 测试，证明当前 S0 安全网可保护后续导入尝试。导入后 split gameplay smoke 覆盖 24 个场景，采矿、塔防、建造、取消、HUD 和命令面板均有通过输出。优化 pass 已把 Barracks / Farm 替换为低风险结构精简版，五建筑合计从约 1.047 MB 降到 886.1 KB，优化后 fallback / asset safety 11/11 pass，Farm 建造中断 / 恢复烟测 1/1 pass。Goldmine 组合导入已把 Resource Gold 作为视觉 cue 挂到 Mine 主体，composition regression 1/1 pass、fallback / asset safety 11/11 pass、mining saturation 2/2 pass；随后根据“金矿不够金”反馈补了金色可读性 Pass 002，Resource Gold accent 扩到 4 处并新增 3 个轻量碎矿 cue，build 通过、goldmine readability proof 2/2 pass。Tree line 仍不导入，直接映射 `trees.glb` 到 `pine_tree` 已被 gate 拒绝；但当前 S0 procedural tree line 已补木材闭环 proof 和 worker readability proof，证明树线可见、已注册、能阻挡 pathing，树木耗尽后会释放 blocker，并且现有采木前缘不会把 worker / selection ring 完全遮住。

KayKit Medieval Hexagon 也完成了来源页和 itch 下载页确认，但 zip 没有成功落到本地，所以仍停在 `candidate-source-verified-download-pending`。

### 2.1 先看建筑和地形

原因：第一眼是否像 RTS 战场，主要由基地 anchor、建筑体量、金矿、树线、路径决定。

推荐顺序：

1. `pub-a1-quaternius-ultimate-fantasy-rts-001`。`done: Sweep 002`
2. `pub-a1-kaykit-medieval-hexagon-001`。`blocked: download pending`
3. `pub-a1-kenney-tower-defense-001`。`done: Sweep 001`
4. `pub-a1-kenney-castle-kit-001`。`done: Sweep 001`

默认镜头检查：

- Town Hall / Barracks / Farm / Tower 不能混。
- 金矿不能像普通地形。
- 树线必须读成资源边界，不遮 worker。
- 建筑不应让玩家误以为是官方 Warcraft 模型。

### 2.2 再看人族单位

推荐顺序：

1. `pub-ah-kaykit-adventurers-001`。`done: Sweep 001`
2. `pub-ah-kaykit-character-animations-001`。`done: Sweep 001`
3. `pub-s6-meshy-paid-clean-001`
4. `pub-s6-tripo-paid-clean-001`

默认镜头检查：

- Worker、Footman、Rifleman、Sorceress、Knight 一眼能分。
- Rifleman 的枪管 / 射击方向要明显。
- Knight 必须有骑兵体量，不只是步兵变大。
- Caster 不能和普通 ranged unit 混。

当前 Human unit 结论：

- `Footman` 有候选：KayKit `Knight.glb`，但仍要验证 scale、pivot、selection ring、动画。
- `Sorceress / Priest` 有候选：KayKit `Mage.glb`，但仍要拆分两种 caster 身份。
- `Rifleman` 没解决：KayKit `Ranger.glb` 更像弓弩手。
- `Knight` 没解决：免费包没有骑兵。
- `Worker` 没解决：免费包没有 worker / engineer GLB。

### 2.3 图标走两条线

短期建议继续 `S0` 自制图标，因为命令卡需要清楚表达训练、研究、技能、状态。

Game-icons.net 可以作为 `S2` 候选，但只有在建立署名方案后才进入：

- `public/assets/THIRD_PARTY_NOTICES.md`
- 游戏内 credits / help 页入口
- README / release note 中的许可证说明

## 3. 每个候选进入 approved-for-intake 前要补什么

| 字段 | 说明 |
| --- | --- |
| 下载 / 获取日期 | 当前页面和许可证可能会变，必须记录。 |
| 原始文件列表 | 包内具体用了哪些模型 / 贴图 / 动画，不允许整包模糊引用。 |
| 文件计划 | 目标 GLB 路径、压缩策略、贴图预算、材质复用。 |
| 截图预览 | 默认 RTS 镜头、选中态、和相邻类别同屏对比。 |
| fallback | 每个 key 加载失败时回到哪个 S0 proxy。 |
| 署名 / Notice | CC-BY 或特殊许可证必须先有展示位置。 |
| 风险备注 | 是否像已有 IP、是否暗示未实现内容、是否有条款限制。 |

## 4. 当前不允许做的事

- 不把整包下载后直接放进 `public/assets`。
- 不把 itch / Kenney / Quaternius 页面链接当作 `approved-for-import`。
- 不使用官方 Warcraft / Blizzard / fan remake / ripped / 来源不明素材。
- 不使用 AI 生成的官方相似资产。
- 不让 GLM 或脚本自己决定素材是否可用。
- 不因为“看起来好看”跳过 fallback、scale、pivot、license、attribution。

## 5. 本轮可派发任务

| 任务 | 目标 | 交付 |
| --- | --- | --- |
| A1 preview sweep | 对 Quaternius / KayKit / Kenney 候选做默认镜头可读性截图 | `approved-for-intake` 候选或拒绝原因 |
| Human unit preview sweep | 对 KayKit Adventurers / AI paid-clean 草稿做单位轮廓测试 | Worker / Footman / Rifleman / Caster / Knight 初筛 |
| Icon attribution decision | 判断 Game-icons.net 是否值得承担署名成本 | 使用 Game-icons.net 或继续 S0 自制图标的决策 |
| AI prompt pack | 为 Blacksmith、Rifleman、Sorceress、Knight 写干净 prompt 模板 | 已落到 `docs/AI_ASSET_PROMPT_PACK.zh-CN.md` |

## 6. 参考来源

- KayKit Medieval Hexagon Pack: https://kaylousberg.itch.io/kaykit-medieval-hexagon
- KayKit Adventurers: https://kaylousberg.itch.io/kaykit-adventurers
- KayKit Character Animations: https://kaylousberg.itch.io/kaykit-character-animations
- Quaternius Ultimate Fantasy RTS: https://quaternius.com/packs/ultimatefantasyrts.html
- Quaternius Fantasy Props MegaKit: https://quaternius.com/packs/fantasypropsmegakit.html
- Kenney Support / license FAQ: https://kenney.nl/support
- Kenney Tower Defense Kit: https://kenney.nl/assets/tower-defense-kit
- Kenney Castle Kit: https://kenney.nl/assets/castle-kit
- Game-icons.net FAQ: https://game-icons.net/faq.html
- Meshy commercial use FAQ: https://help.meshy.ai/en/articles/9992001-can-i-use-my-generated-assets-for-commercial-projects
- Tripo terms: https://www.tripo3d.ai/terms
- Hunyuan3D-2 license: https://github.com/Tencent-Hunyuan/Hunyuan3D-2/blob/main/LICENSE
