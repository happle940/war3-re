# 全角色阶段 / 环节 / 功能任务矩阵

> 用途：把 11 个角色在最新产品视角下的任务，按“阶段 / 环节 / 功能”统一拆开。  
> 这份文档不替代各角色详细计划；它解决的是“所有角色现在和未来分别该干什么”的总排布问题。

## 1. 这份文档解决什么问题

旧角色计划的问题不是没有内容，而是：

- 各角色分别写了 `V0-V9` 和 `M0-M7`
- 但没有一张总表，把所有角色按同一坐标系放在一起
- 也没有把最新加入的 `H0 / P-shell / 素材采集` 纳入同一套任务体系

所以现在需要一张新的母表，专门回答：

1. 每个角色在最新项目视角下，按哪个阶段发力
2. 每个阶段里，它具体负责哪个产品环节
3. 这些环节对应哪些功能域
4. 当前哪些是现主攻，哪些是近期准备，哪些是后续主责

## 2. 统一坐标

### 2.1 阶段坐标

| 阶段锚点 | 对齐关系 | 这段到底在做什么 | 当前性 |
| --- | --- | --- | --- |
| `Stage A` | `H0 / P-shell` | 把项目补成完整页面版产品，有前门、有会话、有收口 | 明显缺失，必须立刻入线 |
| `Stage B` | `H1 / V2` | 把 RTS trust loop 收干净，结束“是不是样机”的争论 | 当前尾部 |
| `Stage C` | `H2 / V3` | 让第一眼像 War3-like 战场 | 下一主攻 |
| `Stage D` | `H3 / V4` | 让 10-15 分钟短局 alpha 成立 | 紧随其后 |
| `Stage E` | `H4 / V5` | 拉起战略骨架 | 中期主轴 |
| `Stage F` | `H5 / V6` | 引入身份系统 | 后续主轴 |
| `Stage G` | `H6-H7 / V7-V8` | Beta 候选、外部试玩、发布边界 | 后期主轴 |
| `Stage H` | `H8 / V9` | patch、扩展、长期演化 | 长期 |

### 2.2 环节坐标

| 环节 | 含义 | 主要功能域 |
| --- | --- | --- |
| `R1` 产品前门与会话 | 主菜单、模式选择、pause、results、settings、help | `C0` |
| `R2` 局前配置与地图入口 | skirmish/setup/loading/briefing/map select | `C0`、`C5` |
| `R3` 局内控制与 HUD | selection、command card、resource/supply、minimap | `C1`、`C6` |
| `R4` 经济 / 生产 / 建造 | gather、build、train、queue、repair、upgrade | `C2` |
| `R5` 战场 / 空间 / 可读性 | TH/矿/树线/出口、footprint、camera、silhouette | `C3`、`C5`、`C6` |
| `R6` 战斗 / AI / 对局弧线 | combat、pressure、recovery、ending、short match | `C4`、`C7` |
| `R7` 战略 / 内容 / 身份 | roster、tech、counter、hero、neutral、items | `C8`、`C9` |
| `R8` 素材 / 资产 / 音频 | source pack、proxy/hybrid、UI art、SFX/BGM | `C10` + 资产治理 |
| `R9` 验证 / 发布 / 反馈 | contracts、smoke、gate、README、private/public | `C10` |

### 2.3 状态口径

| 状态 | 含义 |
| --- | --- |
| `现主攻` | 现在就应该进入 live queue / live lane |
| `当前收尾` | 当前阶段尾部必须继续守住 |
| `近期准备` | 下一波主攻前必须先写清或预热 |
| `中期主责` | 不是马上做，但阶段一到就是主责 |
| `后期主责` | 更后面才成为主角 |
| `长期` | 外部版本后持续存在 |

## 3. 全角色最新任务矩阵

## 3.1 角色 01：产品负责人 / 游戏总监

| 阶段 | 环节 | 功能映射 | 最新任务 | 状态 |
| --- | --- | --- | --- | --- |
| `Stage A` | `R1-R2` | `C0.1-C0.10` | 冻结“完整页面版产品”的最小前门、模式、setup、loading、pause、results、settings、help 范围；给出必须有/可以后补/不能伪装完成三类边界 | `现主攻` |
| `Stage B` | `R3-R6` | `C1-C4` | 继续做最终体验裁决：什么叫 command trust 通过，什么叫 opening loop 仍像样机 | `当前收尾` |
| `Stage C` | `R5` | `C5-C6` | 用人眼裁定 TH/矿/树线/出口/建筑/镜头/HUD 是否开始像 War3-like 战场 | `近期准备` |
| `Stage D` | `R6` | `C7` + `C0.6-C0.7` | 用完整 10-15 分钟试玩裁定短局 alpha 是否成立，尤其是恢复、结束、results 是否清楚 | `近期准备` |
| `Stage E` | `R7` | `C8` | 决定 queue/rally/cancel/repair/upgrade/roster 的扩张顺序，避免乱长系统 | `中期主责` |
| `Stage F` | `R7` | `C9` | 决定 hero / neutral / items / faction asymmetry 到底进不进、先进哪条线 | `后期主责` |
| `Stage G` | `R1-R9` | `C0.8-C0.9`、`C10` | 决定 beta 冻结范围、onboarding 标准、private/public 边界、对外说法 | `后期主责` |
| `Stage H` | `R7-R9` | 长期路线 | 决定 patch / expansion / 长期产品方向 | `长期` |

## 3.2 角色 02：执行制片 / 项目整合负责人

| 阶段 | 环节 | 功能映射 | 最新任务 | 状态 |
| --- | --- | --- | --- | --- |
| `Stage A` | `R1-R2-R8-R9` | `C0` + 资产治理 | 把页面壳层、素材采集、Codex lane、GLM lane 全部写成显式泳道；不允许“谁有空谁顺手做” | `现主攻` |
| `Stage B` | `R3-R4-R6-R9` | `C1-C4`、`C7` | 收掉 H1 尾部剩余合同，安排 closeout、merge、review、验证顺序 | `当前收尾` |
| `Stage C` | `R5-R8-R9` | `C5-C6` + 素材 | 把 battlefield / HUD / tech-art / asset 四条 lane 并行起来，避免都挤在 gameplay 线里 | `近期准备` |
| `Stage D` | `R6-R9` | `C7`、`C10` | 组织 alpha playtest packet、observation、issue routing、回流优先级 | `近期准备` |
| `Stage E` | `R4-R7-R9` | `C8` | 给战略骨架扩张排波次，不让 tech/roster/upgrade 同时爆炸 | `中期主责` |
| `Stage F` | `R7-R9` | `C9` | 给英雄/中立/身份系统拆 lane、拆依赖、拆 freeze 点 | `后期主责` |
| `Stage G` | `R8-R9` | `C10` | 组织 beta burn-down、private/public gate packet、反馈 triage 节奏 | `后期主责` |
| `Stage H` | `R9` | 长期运营 | 维护 patch cadence、roadmap、债务与扩展节奏 | `长期` |

## 3.3 角色 03：技术总监 / 系统架构负责人

| 阶段 | 环节 | 功能映射 | 最新任务 | 状态 |
| --- | --- | --- | --- | --- |
| `Stage A` | `R1-R2-R8` | `C0.3-C0.10` | 设计页面壳层与局内 runtime 的状态边界：菜单到对局、pause、results、restart、settings persistence、asset format/budget | `现主攻` |
| `Stage B` | `R3-R4-R6-R9` | `C1-C4` | 完成 trust loop 的模块边界与硬化，保证 refactor 不改用户可见行为 | `当前收尾` |
| `Stage C` | `R5` | `C3`、`C5`、`C6` | 给 footprint/pathing/camera/HUD harmony 提供硬约束，不让 G2 变成纯审美讨论 | `近期准备` |
| `Stage D` | `R1-R6` | `C0.5-C0.7`、`C7` | 建 match-state 生命周期：pause、victory/defeat、restart/rematch、stall/end-state 技术模型 | `近期准备` |
| `Stage E` | `R4-R7` | `C1.7-C2.11`、`C8` | 设计 queue/rally/repair/upgrade/roster 的可扩展数据和事件模型 | `中期主责` |
| `Stage F` | `R7` | `C9.2-C9.7` | 设计 hero/mana/cooldown/xp/inventory/ability hooks 的系统模型 | `后期主责` |
| `Stage G` | `R8-R9` | `C10.7` | 建 beta/外部候选的性能、稳定性、包体、偏好存储和崩溃下限 | `后期主责` |
| `Stage H` | `R7-R9` | 长期演进 | 推动模块演进、热修结构、扩展兼容性 | `长期` |

## 3.4 角色 04：Gameplay Systems Engineer

| 阶段 | 环节 | 功能映射 | 最新任务 | 状态 |
| --- | --- | --- | --- | --- |
| `Stage A` | `R1-R2-R6` | `C0.5-C0.7` | 把产品壳层真正接入 runtime：pause/resume、restart/rematch、back-to-menu、setup 参数进入对局 | `现主攻` |
| `Stage B` | `R3-R4-R6` | `C1-C4` | 继续收掉 selection/order/gather/build/combat/tower/collision 的 H1 尾巴 | `当前收尾` |
| `Stage C` | `R5` | `C2.4`、`C3.2-C3.4`、`C5` | 让采矿、放置、出生、交互在基地语法里自然工作，而不是“测试过但不好用” | `近期准备` |
| `Stage D` | `R6` | `C4.3`、`C7`、`C0.6-C0.7` | 让补兵、防守、反击、结束条件、results 触发链真的成立 | `近期准备` |
| `Stage E` | `R4-R7` | `C1.7-C1.8`、`C2.7-C2.11`、`C8` | 实现 queue / rally / repair / upgrade / roster 扩张 | `中期主责` |
| `Stage F` | `R7` | `C9.3-C9.7` | 实现 hero entity、skills、inventory、neutral interaction | `后期主责` |
| `Stage G` | `R6-R9` | 候选稳定性 | 清 exploit、清明显 gameplay 坏死、清 candidate blockers | `后期主责` |
| `Stage H` | `R4-R7` | 长期系统 | 扩新系统但保持旧合同不塌 | `长期` |

## 3.5 角色 05：RTS 战场语法 / 关卡设计师

| 阶段 | 环节 | 功能映射 | 最新任务 | 状态 |
| --- | --- | --- | --- | --- |
| `Stage A` | `R2-R5` | `C0.3-C0.4`、`C5` | 为 map select / loading / briefing 准备地图语义入口，让页面壳层能解释“这一局在哪里打” | `近期准备` |
| `Stage B` | `R5` | `C5.1` | 继续修掉 opening 中最出戏的空间假象，尤其是 TH-矿-树线关系 | `当前收尾` |
| `Stage C` | `R5` | `C5.1-C5.5` | 主导 Human Opening Grammar：TH/矿/树线/出口/兵营/农场/塔的空间语法模板 | `现主攻` |
| `Stage D` | `R5-R6` | `C5.6-C5.7` | 建短局里的进攻/回防/扩张路径，让 AI 与玩家都能形成压力节点 | `近期准备` |
| `Stage E` | `R5-R7` | `C5.7`、`C8.5-C8.6` | 支撑 rush/boom/tech/scout 等战略分化的地图语义 | `中期主责` |
| `Stage F` | `R7` | `C5.8`、`C9.8-C9.9` | 为 neutral camp / shop / hero routes 预留拓扑 | `后期主责` |
| `Stage G` | `R2-R5-R9` | demo map pool | 准备 beta/demo 地图池、briefing、试玩地图分组 | `后期主责` |
| `Stage H` | `R5-R7` | 长期地图池 | 演化 map pool 与扩展路线 | `长期` |

## 3.6 角色 06：HUD / UX / 信息架构设计师

| 阶段 | 环节 | 功能映射 | 最新任务 | 状态 |
| --- | --- | --- | --- | --- |
| `Stage A` | `R1-R2` | `C0.1-C0.10` | 设计主菜单、模式选择、setup、loading、pause、results、settings、help 的信息架构与交互流 | `现主攻` |
| `Stage B` | `R3-R4` | `C1.4`、`C1.9`、`C2.9`、`C6.4-C6.5` | 收紧 command card、disabled reasons、resource/supply、selection feedback 的解释层 | `当前收尾` |
| `Stage C` | `R3-R5` | `C6.1-C6.3` | 定义 HUD/camera harmony、minimap 用法、遮挡边界、默认镜头下的信息密度 | `现主攻` |
| `Stage D` | `R6` | `C6.6-C6.7`、`C0.6-C0.7` | 建短局告警、失败原因、results 摘要、rematch/back flow 的可理解性 | `近期准备` |
| `Stage E` | `R7` | `C8` | 为 queue / tech / upgrade / more-unit roster 扩信息承载面 | `中期主责` |
| `Stage F` | `R7` | `C9.6-C9.7` | 设计 hero / spell / item / inventory UI 与学习反馈 | `后期主责` |
| `Stage G` | `R1-R9` | `C0.8-C0.9`、`C6.8`、`C10` | 建 onboarding / external usability / README 与 HUD 一致口径 | `后期主责` |
| `Stage H` | `R3-R9` | 长期 UX | 管理 UX debt、信息架构演进、可访问性 | `长期` |

## 3.7 角色 07：AI / Match Loop 设计工程师

| 阶段 | 环节 | 功能映射 | 最新任务 | 状态 |
| --- | --- | --- | --- | --- |
| `Stage A` | `R2-R6` | `C0.3`、`C7` | 把 setup 中的 AI 难度/模式入口和局内 AI lifecycle 接起来，不让页面壳层与 AI 断层 | `近期准备` |
| `Stage B` | `R4-R6` | `C7.1-C7.2` | 继续收同规则经济、建造、训练、采金饱和、lumber 分配、基础出兵 | `当前收尾` |
| `Stage C` | `R5-R6` | `C5`、`C7.2-C7.3` | 让 AI 理解基地语法、出兵路径、战场入口，而不是在灰盒里假装会打 | `近期准备` |
| `Stage D` | `R6` | `C7.3-C7.6` | 建短局里的 opening pressure、recovery、ending、stall clarity、初始 difficulty baseline | `现主攻` |
| `Stage E` | `R6-R7` | `C8.3-C8.6` | 给 AI 加 build order、tech timing、counter、scouting 基线 | `中期主责` |
| `Stage F` | `R7` | `C9` | 让 AI 会用 hero、items、neutral、shops | `后期主责` |
| `Stage G` | `R6-R9` | `C7.7`、`C10` | 管理外部试玩 AI 的 exploit、傻行为、难度梯度 | `后期主责` |
| `Stage H` | `R6-R7` | 长期 AI | 继续演化对手质量与可重复游玩性 | `长期` |

## 3.8 角色 08：QA / Contract / Release Infra Engineer

| 阶段 | 环节 | 功能映射 | 最新任务 | 状态 |
| --- | --- | --- | --- | --- |
| `Stage A` | `R1-R2-R8-R9` | `C0` + 资产治理 | 建页面壳层 smoke、page-state contract、settings persistence proof、approved asset import boundary | `现主攻` |
| `Stage B` | `R3-R4-R6-R9` | `C1-C4`、`C7.1-C7.2` | 继续守 trust contracts、runtime、cleanup、hardening 证据 | `当前收尾` |
| `Stage C` | `R5-R9` | `C5-C6` | 定义 G2 能证明什么、不能证明什么；区分 objective metrics 与 human gate | `近期准备` |
| `Stage D` | `R6-R9` | `C7`、`C10` | 组织 short-match playtest、observation template、issue routing、alpha acceptance packet | `近期准备` |
| `Stage E` | `R4-R7-R9` | `C8` | 为战略骨架准备 regression matrix，防止每加一个系统就炸旧循环 | `中期主责` |
| `Stage F` | `R7-R9` | `C9` | 设计 hero/ability/item/neutral 的回归架构和复杂度边界 | `后期主责` |
| `Stage G` | `R8-R9` | `C10` | 主导 smoke、disclosure、private/public gate、perf/stability matrix | `后期主责` |
| `Stage H` | `R9` | 长期验证 | 维护 patch evidence、hotfix smoke、长期缺陷台账 | `长期` |

## 3.9 角色 09：技术美术 / 可读性负责人

| 阶段 | 环节 | 功能映射 | 最新任务 | 状态 |
| --- | --- | --- | --- | --- |
| `Stage A` | `R1-R5-R8` | `C0`、`C6` + 资产治理 | 拉起 `A1` 战场可读性素材包和 `A2` 页面壳层素材包，定 proxy/hybrid/正式资源的替换规则 | `现主攻` |
| `Stage B` | `R5-R8` | `C6.1-C6.3` | 继续保证 worker/building/resource 在默认镜头下不隐身、不混淆、不塌缩 | `当前收尾` |
| `Stage C` | `R5-R8` | `C5-C6` | 主导第一眼基地可读性：轮廓、比例、树线、矿区、地表、camera readability | `现主攻` |
| `Stage D` | `R5-R6-R8` | `C4.7`、`C6.7` | 支撑短局中的战斗、生产、压力、结束反馈可读性 | `近期准备` |
| `Stage E` | `R7-R8` | `C8` | 为更多兵种、升级、tech path 建识别体系 | `中期主责` |
| `Stage F` | `R7-R8` | `C9` | 为 hero/spell/neutral/item 建身份层可读性规则 | `后期主责` |
| `Stage G` | `R8-R9` | `C10.1-C10.2` | 管理 visual debt、candidate presentation baseline、音画风格冻结输入 | `后期主责` |
| `Stage H` | `R8` | 长期视觉 | 管理视觉路线与可读性演进 | `长期` |

## 3.10 角色 10：内容 / 战略骨架设计师

| 阶段 | 环节 | 功能映射 | 最新任务 | 状态 |
| --- | --- | --- | --- | --- |
| `Stage A` | `R1-R2-R7` | `C0.2-C0.4`、`C8` | 定义 mode select / skirmish / sandbox 应该开放哪些规则，不让 setup 页变空壳 | `近期准备` |
| `Stage B` | `R4-R7` | `C8` 前置 | 记录当前最小循环缺什么战略语义，但不抢跑做未来内容 | `当前收尾` |
| `Stage C` | `R5-R7` | `C5`、`C8` | 把内容语义和基地空间挂钩：什么布局支撑 rush，什么支撑防守，什么支撑 tech | `近期准备` |
| `Stage D` | `R6-R7` | `C7`、`C8` | 定义短局里至少要出现哪些战略选择，而不只是“互相出兵” | `近期准备` |
| `Stage E` | `R7` | `C8.1-C8.6` | 主导 roster / tech / upgrade / counter / expansion 的完整骨架 | `中期主责` |
| `Stage F` | `R7` | `C9.1-C9.10` | 决定 hero、neutral、items、faction 的内容范围与进入顺序 | `后期主责` |
| `Stage G` | `R7-R9` | `C8-C10` | 定 content-complete freeze、demo scope、不能对外暴露的 unfinished 内容 | `后期主责` |
| `Stage H` | `R7` | 长期内容 | 管理扩展内容路线与长期 scope discipline | `长期` |

## 3.11 角色 11：演出 / 音频 / 外部包装负责人

| 阶段 | 环节 | 功能映射 | 最新任务 | 状态 |
| --- | --- | --- | --- | --- |
| `Stage A` | `R1-R2-R8` | `C0.4`、`C0.6`、`C0.8-C0.9`、`C10.2` | 负责 menu / loading / pause / results / settings / help 的 presentation 和音频候选素材包 | `现主攻` |
| `Stage B` | `R8-R9` | `C10` | 记录当前还无法对外解释的体验缺口，建立最小 capture path 和解释债务清单 | `当前收尾` |
| `Stage C` | `R5-R8-R9` | `C5-C6`、`C10` | 准备 G2 截图、录像、review script、最小战场氛围层 | `近期准备` |
| `Stage D` | `R6-R8-R9` | `C7`、`C10.2-C10.3` | 为 alpha playtest 准备最小 SFX、试玩说明、观测脚本和 results 叙述层 | `近期准备` |
| `Stage E` | `R7-R8-R9` | `C8-C10` | 支撑方向对外表达，准备 strategic direction-facing packet | `中期主责` |
| `Stage F` | `R7-R8` | `C9`、`C10.2` | 为 hero/neutral/identity layer 准备 presentation / audio plan | `后期主责` |
| `Stage G` | `R8-R9` | `C10.3-C10.6` | 主导 README、Known Issues、private/public share packaging、feedback intake 外部表达 | `后期主责` |
| `Stage H` | `R9` | 长期外部沟通 | 管理 patch notes、release comms、长期外部认知 | `长期` |

## 4. 当前最该立即进入 live queue 的跨角色任务包

### `Bundle 1` 完整页面版产品壳层包

- 角色主轴：`01`、`02`、`03`、`06`、`11`
- 内容：
  - main menu
  - mode select
  - match setup
  - loading / briefing
  - pause / results
  - settings / help

### `Bundle 2` 战场可读性与素材采集包

- 角色主轴：`02`、`05`、`09`、`11`
- 内容：
  - `A1` 战场可读性素材包
  - `A2` 页面壳层素材包
  - TH/矿/树线/出口/base grammar 结合镜头可读性

### `Bundle 3` H1 尾部与 H3 入口包

- 角色主轴：`03`、`04`、`07`、`08`
- 内容：
  - trust loop 尾部
  - AI recovery / short match
  - results / rematch / end-state clarity

### `Bundle 4` M3/M4 人眼与证据双轨包

- 角色主轴：`01`、`05`、`06`、`08`、`09`
- 内容：
  - H2 的 human gate
  - H3 的 alpha gate
  - objective metrics 与 human judgment 分开

## 5. 使用方式

看单个角色时：

1. 先看本矩阵，确定它在每个阶段的任务
2. 再去看对应的 `docs/role-plans/*.md`
3. 最后才看 queue / gate packet

看跨角色协同时：

1. 先看 `Stage A-D`
2. 再看 `Bundle 1-4`
3. 再决定哪些任务给 Codex lane，哪些任务留给 GLM 的导入/验证侧

一句话：

```text
这份文档把“谁在什么时候、围绕哪个环节、负责哪些功能”
放进了一张能直接继续拆任务的总表里。
```
