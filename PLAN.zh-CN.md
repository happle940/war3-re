# War3 RE - 顶层 Roadmap

最后更新：2026-04-29

## 现在的项目定义

`war3-re` 是一个浏览器内运行的 War3-like RTS 私有 alpha。目标不是复刻官方 War3，而是做出一个合法、可玩、可持续扩展的 RTS 页面产品：开局能理解，命令可信，经济和战斗闭环成立，人族内容逐步完整，最终能形成一局像样的人机短局。

本文件现在是项目顶层路线图。后续推进不再从旧 V8/V9 runway、双泳道、watch、看板、长队列或自动补货开始，而是从下面的 Roadmap 中切出小任务。

## 当前工作方式

- 只由当前 Codex 会话推进。
- GLM、双泳道、watch、自动补货、看板全部停止维护。
- 不再用长队列文件驱动项目。
- 每次只开一个主攻问题；主攻问题必须能映射到本 Roadmap 的一个阶段。
- 行为改动做完后用构建、类型检查和必要的 focused runtime 测试验收。
- 文档只服务产品方向、系统合同和真实验收，不再为每个小任务生成三件套。

## 当前真实阶段

项目已经越过早期原型阶段，但还不是完整 Human race、完整 War3-like demo 或完整浏览器游戏产品。

已经成立的核心：

- 浏览器 RTS 场景、选择、框选、右键命令、编队、命令卡。
- worker 采金、伐木、建造、训练、资源、人口和部分科技门槛。
- Human-like 基础单位、建筑、部分科技、英雄和能力链路。
- AI 有经济、生产、英雄补给、首波前练级意图、进攻波次、基地防守、重组、防守反击、长局 director 阶段和压力快照。
- `R1-R6` 基础体验已完成当前私有 alpha 第一轮闭环：打开网页前门、第一局开始、第一分钟可读、RTS 命令信任、经济/建造/生产和战斗底盘进入统一运行时快照、HUD 状态和 R15 反馈包。
- `R7` Human 路线整理已完成当前私有 alpha 深化基线：经济、兵营、英雄、支援、科技、后期六段路线进入运行时快照和 HUD 路线面板，并补出 T1/T2/T3 解锁状态、技术节奏阶段、战术角色、混编覆盖、兵种克制读法、科技收益、下一步动作、power spike、生产线概览、路线 icon、解锁完成 cue、命令卡路线角色提示、字母热键执行、命令卡视觉身份、HUD 背包槽、命令状态层级、冷却/生效 meter、法力缺口 badge 和目标模式高亮基线。
- `R10` 短局闭环已完成当前私有 alpha 基线：开局经济、生产、部队、英雄、地图目标、商店、AI 压力、决战、胜负摘要和重开重置都由真实 runtime 状态验收。
- `R11` 战场可读闭环已完成当前私有 alpha 基线：我方基地、金矿线、树线、野怪营地、商店、敌方基地进入 HUD 雷达、世界视角 beacon 和小地图目标圈。
- `R12` Fog / 侦察 / War3 身份已完成当前私有 alpha 基线：可见/已探索状态、中立营地、掉落物、商店消耗品、回城卷轴和目标侦察进入同一运行时验收。
- `R13` 产品壳层已完成当前私有 alpha 基线：主菜单、设置、briefing、暂停、结果、返回、重开、偏好保存、关闭保护和上局摘要都有明确状态语义。
- `R8` 英雄 / 技能成局已完成当前私有 alpha 深化基线：三英雄、XP/等级、技能学习、死亡记录/复活底座、三英雄技能反馈、技能可用性矩阵、目标合法性提示、施法距离/范围/光标语义、主动目标合法/非法判定、复活尸体 marker/范围环和运行时快照进入同一验收。
- `R9` AI 稳定对手已完成当前私有 alpha 基线：经济、生产、科技、英雄技能、练级/商店理解、进攻波、防守/重组/反击和难度 director 都可 runtime 验收。
- `R14` 视觉 / 音频身份已完成当前私有 alpha 深化基线：低模资产 catalog、War3-like HUD 皮肤、技能视觉反馈、施法预览语言、主动目标合法性反馈、目标 marker、复活尸体 marker/范围环、目标/压力/技能 cue 总线、选中/命令/命中/血条/状态表现层、玩家感知反馈层、最小单位动作语言、clip-aware 动作管线和真实动作/音效素材门禁进入统一验收。当前 R14 合同已覆盖 12 个核心单位的 51 个基础 GLB transform clip 状态和 10 类 wav cue 文件；但这些仍是基线素材，不是最终骨骼动画或发布级音频 identity。
- `R15` 外部试玩准备已完成当前私有 alpha 深化基线：主菜单试玩信息入口、版本边界、已知问题入口、反馈诊断包、暂停/结果页反馈入口、关闭保护、兼容信号、性能预算、错误缓冲、反馈分流、Human 解锁层和战场表现层进入统一验收。
- `R16` GitHub Pages 私测发布版进入发布工程阶段：目标是让朋友通过网页链接打开当前 Human 私有 alpha，不需要本地安装；发布门禁使用 `npm run build`、`npm run typecheck:app` 和 `npm run test:release`。
- `WAR3-GAP` 全局追赶雷达已进入 R15 反馈包：从打开网页到关闭网页，按前门、第一分钟、操控、经济、战斗、Human、英雄、地图/Fog/物品、AI、视觉音频、试玩发布和架构 12 个域持续报告 War3 差距，不再只按单个里程碑报喜。
- Vite / TypeScript / Playwright runtime 回归可用。

当前主要缺口：

- R1-R15 都已有当前私有 alpha 第一轮运行时闭环；R15 也已有性能/兼容/错误缓冲/反馈分流和玩家体验信号底座。但还不是公开发布级包装：设置深度、帮助层级、真实性能阈值、真实玩家反馈运营和 10-15 分钟稳定体验仍要继续补。
- Human 内容已经整理成当前路线面板，T1/T2/T3 解锁状态、节奏阶段、战术角色、混编覆盖、兵种克制读法、科技收益、结果页战斗原因复盘、命令卡字母热键执行、命令卡程序化 icon 身份、HUD 背包槽、命令状态徽标、冷却/生效 meter、法力缺口 badge 和施法目标模式高亮都能运行时验收；但还不是完整 Human race：真实二本/三本数值曲线、升级平衡、克制调参、发布级 icon art、真实多充能体系、最终 cooldown art 和可配置热键体系仍要继续打磨。
- 战场第一眼还不够像 War3-like RTS：地形层次、建筑比例、资源点距离、单位尺度和视觉素材仍要校准。
- AI 已有短局压力曲线、防守、重组、防守反击、难度选择和长局节奏递进基线，但还不是完整侦察、撤退微操或能稳定支撑 10-15 分钟的强对手。
- Fog / 侦察 / 野怪 / 物品 / 商店 / 回城、英雄成局和视觉音频身份已有 runtime 基线；但完整 War3 级 Fog、反隐、高低差遮挡、真实视野争夺、长期 AI 对抗深度和发布级包装仍缺失。
- 全局差距现在已可运行时观测，但“可观测”不等于“已追平”：`visual-audio-identity` 仍是最大硬缺口之一，R14 已补施法距离/范围/光标语义、主动目标合法性反馈、目标 marker、复活尸体 marker/范围环和合同全覆盖素材门禁，但死亡/攻击/施法/采集/建造的动作质量、最终音效混音、UI 声音 identity、远景剪影和发布级资产批准仍未关闭。
- 代码结构也必须进入 Roadmap：`Game.ts` 仍承担过多职责，后续不能继续把新系统都塞回单一控制器。

## 目标架构

架构目标不是换引擎，也不是一次性重写。正确方向是把当前项目演进成一个可维护的浏览器 RTS 模块化单体：局内 simulation、输入命令、渲染表现、UI 壳层、AI、地图和内容数据边界清晰，但仍由一个浏览器应用整体交付。

### 分层目标

| 层 | 责任 | 目标模块 |
| --- | --- | --- |
| App / Boot | 启动网页、连接 DOM、创建游戏、处理普通入口和 runtime test 入口 | `src/main.ts`、后续 `src/app/` |
| Session Shell | menu、briefing、pause、setup、results、return/reload、关闭/重开语义 | 后续 `src/game/session/` |
| Game Facade | 对外保持 `Game` 入口，兼容测试和页面调用；内部只做组合和调度 | `src/game/Game.ts` 逐步瘦身 |
| World Model | 单位、建筑、资源、队伍、时间、订单、死亡记录、比赛结果的权威状态 | 后续 `src/game/model/` |
| Commands / Orders | move、attack、gather、build、train、research、ability 的统一命令入口和失败原因 | `src/game/GameCommand.ts`，后续 `src/game/commands/` |
| Systems | 移动、采集、建造、生产、研究、战斗、技能、死亡、胜负、buff/debuff | 后续 `src/game/systems/` |
| Presentation | Three.js 场景、单位/建筑 visual、血条、特效、截图、minimap 渲染 | `UnitVisualFactory`、`BuildingVisualFactory`、`FeedbackEffects`，后续 `src/game/render/` |
| UI / HUD | 选择面板、命令卡、资源栏、训练队列、错误反馈、cursor/提示 | 后续 `src/game/ui/` |
| AI | build order、worker 分配、进攻波次、英雄学习/施法、恢复策略 | `SimpleAI.ts`，后续 `src/game/ai/` |
| Map Runtime | 程序化地图、W3X 地形、pathing、occupancy、tree、地图实体生成 | `src/map/` + `PathingGrid` / `TreeManager` |
| Content Data | 单位、建筑、科技、能力、数值、Human 路线配置 | `GameData.ts`，后续 `src/game/content/` |
| Test Harness | 给 Playwright 暴露稳定调试 API，减少测试直接摸内部字段 | 后续 `src/game/testing/` |

### 架构决策

1. **保留模块化单体，不做 ECS / 微服务 / 引擎重写。**
   当前项目是单页浏览器 RTS，最大风险是功能体验未闭合，不是规模化部署。模块化单体能降低复杂度，也能保留现有测试资产。

2. **`Game` 先做 facade，再逐步瘦身。**
   `Game.ts` 不能继续膨胀，但也不能突然删除。短期让它继续作为页面和测试入口，内部把 session、HUD、command card、ability、combat、economy 等边界逐个外移。

3. **权威状态要逐步从 Three.js 对象中剥离。**
   当前很多状态挂在 `Unit.mesh.position` 和 Three object 上。长期应由 World Model 持有权威状态，Three.js 只读状态并表现出来。这个过程必须渐进，先从新系统开始，不强行一次性迁移全部单位。

4. **命令必须成为系统边界。**
   玩家输入、AI 和测试都应通过命令 / order 层表达意图。系统内部可以拒绝命令并给出失败原因，不能让 UI、AI 或测试绕过同一套规则。

5. **每次重构都必须绑定一个 Roadmap 切片。**
   不开“纯重构大阶段”。例如 R1 做主菜单时抽 session shell；R4 做命令反馈时抽 command / HUD；R6 做战斗时抽 combat；R8 做英雄时抽 abilities。

## `R-ARCH` 横切重构主线

`R-ARCH` 不是独立玩家功能阶段，而是贯穿 R1-R15 的工程约束。每个 Roadmap 切片都应检查是否有一个小而可测的结构边界可以顺手拆出。

| 子阶段 | 绑定 Roadmap | 目标 | 验收 |
| --- | --- | --- | --- |
| `R-ARCH-0` | `R0` | 固化目标架构和重构原则 | 顶层 Roadmap 记录清楚，不开始代码大改 |
| `R-ARCH-1` | `R1/R13` | 抽 `SessionShellController`，管理 menu/briefing/pause/results/return/reload | shell 相关 focused tests 通过 |
| `R-ARCH-2` | `R4/R7` | 抽 `CommandCardBuilder` / HUD presenter，命令按钮和禁用原因从 `Game.ts` 外移 | command-card、resource、selection 回归通过 |
| `R-ARCH-3` | `R4/R5` | 强化 `Command` / `Order` 层，统一玩家、AI、测试命令入口和失败原因 | command、resource、construction focused tests 通过 |
| `R-ARCH-4` | `R8` | 建立 `abilities/`，把 Paladin / Archmage / Mountain King 技能逐步从 `Game.ts` 外移 | 对应英雄技能 runtime tests 通过 |
| `R-ARCH-5` | `R5` | 抽 `EconomySystem` / `WorkerLoopSystem`，采金、采木、回本、矿边站位成独立系统 | mining、lumber、resource 回归通过 |
| `R-ARCH-6` | `R6` | 抽 `CombatSystem`，普攻、护甲、AOE、stun、tower、target filter 成独立系统 | combat-control、static-defense、hero combat tests 通过 |
| `R-ARCH-7` | `R9/R10` | 拆 `SimpleAI` 为 economy、build order、wave、hero usage、recovery 模块 | ai、first-five、short-skirmish tests 通过 |
| `R-ARCH-8` | `R11/R12` | 强化 `MapRuntime` / pathing / fog / neutral object 边界 | map、pathing、visibility、fog/neutral tests 通过 |
| `R-ARCH-9` | `R14/R15` | 把 render/assets/audio/performance 形成发布前可维护边界 | build、typecheck、smoke、performance smoke 通过 |
| `R-ARCH-10` | `R15/全局追赶` | 抽 `War3GapSystem`，把 R1-R15 证据汇成 War3 全局差距雷达 | R15 feedback packet 和 R-ARCH 边界测试通过 |

当前进展：`R-ARCH-10` 已完成第九刀，`MilestoneSignalSystem` 接管 R15 反馈包里的里程碑信号组装，`UnitPresentationSystem` 接管单位 idle/move/attack/cast/status/death 的最小表现状态并支持 clip/fallback，`AudioCueSystem` 支持 asset-backed cue 优先、失败回退程序音，`BattlefieldPerceptionSystem` 接管命令、战斗、技能、死亡、建造、动作状态和音效语义覆盖的玩家感知快照，`PresentationAssetReadinessSystem` 接管真实动作 clip 与真实音效素材门禁，`HeroAbilityPresentationSystem` 接管英雄施法距离/范围/光标语义和主动目标合法性快照，`ResurrectionReadabilitySystem` 接管 Paladin 复活尸体 marker、可复活高亮和范围环快照，`ResultPresentationSystem` 接管结果页视觉复盘快照并消费战斗原因/科技收益，`HumanCombatProfileSystem` 接管 Human 混编角色、DPS/有效血量和护甲克制读法，`HumanUpgradeImpactSystem` 接管 Human 攻防/射程/生命科技收益读法，`War3GapSystem` 接管 12 个 War3 差距域的全局追赶快照，避免 `Game.ts` 继续承载 R7/R8/R14/R15 摘要表、表现状态机、资产门禁、结果复盘和产品差距判断。

### 重构红线

- 不做一次性 `Game.ts` 全量拆分。
- 不在没有 focused tests 的情况下迁移经济、战斗、技能或 AI 行为。
- 不把重构 PR 和大功能 PR 混成不可审的超大变更。
- 不因为架构目标推迟玩家体验主线；架构服务 R1-R15，而不是替代 R1-R15。
- 不恢复旧队列、GLM、watch、自动补货或 task synthesis 来管理重构。

## 顶层 Roadmap

| 阶段 | 目标 | 功能缺口 | 用户体验缺口 |
| --- | --- | --- | --- |
| `R0` | 项目口径统一 | 清理旧 V8/V9、队列、GLM、watch 叙述 | 入口文档和实际产品状态一致 |
| `R1` | 打开网页像打开游戏 | 当前主菜单、模式/地图/帮助/设置/试玩信息入口和渲染就绪已通过 R1-R6 proof；后续补发布级氛围 | 不再像工程说明页；第一屏有游戏感、焦点明确 |
| `R2` | 第一局能自然开始 | 当前默认地图、AI、双方基地、局前 briefing 和地图/模式状态已通过 R1-R6 proof；后续补局前配置深度 | 玩家知道自己要打什么、怎么开始、当前版本边界是什么 |
| `R3` | 第一分钟可信 | 当前 worker、矿、树、基地、HUD、目标面板和路线面板已通过 R1-R6 proof；后续补更强镜头/引导/地形层次 | 玩家一眼知道基地、资源、农民、下一步操作 |
| `R4` | RTS 操控可信 | 当前选择、命令卡、建造入口、移动/采集/攻击移动/停止/驻守命令入口和命令卡字母热键执行已通过 proof；后续补 cursor、目标合法性和失败原因层级 | 玩家相信“我选谁，谁听命令”；错误原因清楚 |
| `R5` | 经济 / 建造 / 生产稳定 | 当前采金、伐木、资源、人口、训练、建造和科技入口已通过 R1-R6 proof；后续抽 EconomySystem 并补长局压力 | 不会卡死；按钮灰掉时知道为什么 |
| `R6` | 战斗系统像 RTS | 当前普攻、攻击移动、静态防御、血条/状态、伤害模型和战斗数据入口已通过 R1-R6 proof；后续抽 CombatSystem 并补动画/音效/范围提示 | 战斗结果可读，谁在打谁、为什么死、能否撤退都清楚 |
| `R7` | Human 核心内容闭环 | Worker、Footman、Rifleman、Priest、Sorceress、Knight、Mortar、三英雄、建筑、科技、升级；当前六段 Human 路线、T1/T2/T3 解锁状态、技术节奏阶段、战术角色、混编覆盖、兵种克制读法、科技收益、下一步动作、power spike、路线 icon、解锁完成 cue、命令卡路线角色提示、字母热键执行、命令卡视觉身份、HUD 背包槽、命令状态层级、冷却/生效 meter、法力缺口 badge 和施法目标模式高亮基线已通过 proof | 玩家能理解人族路线，并在命令卡里看到、按下、辨认下一步属于哪条路线、当前命令是否可施放、当前混编缺什么、哪些护甲克制要点、当前研究带来多少攻击/护甲/生命/射程收益；后续继续补真实二本/三本数值曲线、升级平衡、克制调参、发布级图标、真实多充能体系、最终 cooldown art 和可配置热键体系 |
| `R8` | 英雄 / 技能真正成局 | XP、升级、技能学习、复活、Paladin / Archmage / Mountain King 完整技能链；当前三英雄技能成局、技能可用/阻断/目标提示、施法距离/范围/光标语义、主动目标合法/非法、复活尸体可读快照已通过 runtime proof | 英雄不是装饰；技能有反馈、有时机、有战术意义；后续继续补技能 icon 质量、动画和音效 |
| `R9` | AI 是稳定对手 | AI 经济、建造、科技、英雄、技能、进攻、防守、恢复、难度 director；当前稳定对手快照已通过 runtime proof | 10-15 分钟内像一个对手，不是脚本样机；后续继续补侦察、撤退、适应玩家打法 |
| `R10` | 短局闭环 | 胜负条件、AI 压力曲线、防守、反打、结算、重开；当前私有 alpha 完整闭环已通过 runtime proof，并补出战斗读法与科技收益结果卡 | 玩家能完整打一局，知道为什么赢 / 输；结算页能读出混编、克制和科技收益对结果的影响 |
| `R11` | War3-like 战场可读 | 地图空间、基地布局、矿线、树线、出口、堵口、建筑占地、单位比例；当前 HUD 雷达、世界 beacon、小地图目标圈已通过 runtime proof | 第一眼能读出主要战场目标，但还不是完整美术/地形/Fog of war |
| `R12` | War3 身份系统 | Fog of war、侦察、野怪、物品、商店、掉落、回城 / 消耗品；当前可见/已探索、目标侦察、回城卷轴和身份快照已通过 proof | 有侦察、练级、争夺点，开始接近 War3 核心味道；后续补完整 Fog 规则、反隐、高低差和遮挡 |
| `R13` | 产品壳层完整 | 设置、帮助、暂停、结果、返回、重开、偏好保存、关闭保护；当前主菜单到关闭保护的产品旅程已通过 proof | 从打开网页到关闭网页都有明确状态语义；后续补发布级包装、反馈入口和错误恢复 |
| `R14` | 视觉 / 音频身份 | 合法资产、动画、攻击特效、音效、UI 皮肤、主菜单氛围；当前低模资产、HUD 皮肤、命令卡 icon、HUD 背包槽、命令状态徽标、冷却/生效 meter、法力缺口 badge、目标模式高亮、技能反馈、施法预览语言、主动目标合法性反馈、目标 marker、复活尸体 marker/范围环、技能特效爆发、结果页视觉复盘、cue 总线、选中/命令/命中/血条/状态表现层、玩家感知反馈层、最小单位动作语言、clip/fallback 动作管线、真实动作/音效素材门禁和 51/51 clips、10/10 wav cues 合同覆盖已通过 runtime proof | 不再像纯 proxy 工程版；后续重点是把基线 clips/cues、程序化 icon、冷却层和技能爆发升级为发布级动作、技能特效、音频 identity、最终图标和主菜单氛围 |
| `R15` | 外部试玩 / 发布准备 | 当前已接入试玩信息、版本边界、已知问题入口、诊断反馈包、暂停/结果反馈入口、性能预算信号、兼容矩阵、错误缓冲、反馈分类、恢复按钮、Human 解锁层、战场表现层和 War3 全局差距雷达；后续继续补真实性能阈值、浏览器矩阵和反馈运营 | 普通玩家可试玩，不需要项目背景解释；每轮能看到离 War3-like 目标还有哪些最大差距；但还不是公开发布或 release-ready |
| `R16` | GitHub Pages 私测发布 | 固化 Pages workflow、发布 smoke、朋友试玩口径和当前链接 | 朋友能点链接进入当前私有 alpha；发布仍受控，不升级为公开 release |

## 推进顺序

1. `R0` 先统一项目口径，避免 README、Known Issues、Roadmap 和实际执行方式互相打架。
2. `R1-R6` 当前私有 alpha 基础体验已经完成第一轮闭环：前门、开局、第一分钟、操控、经济生产和战斗底盘都可 runtime 验收。
3. `R7-R15` 当前私有 alpha 主线也已经完成第一轮闭环：Human 路线、英雄技能、AI 对手、短局、战场可读、War3 身份、产品壳层、视觉音频身份和外部试玩准备都可 runtime 验收。
4. 顶层 Roadmap 当前状态：`R1-R15` 全部完成第一轮 alpha proof，但未达到 War3 parity、完整 Human race、发布版或公开 release-ready。
5. `R16` 先把当前 alpha 固化为 GitHub Pages 私测发布链路，让真实朋友试玩反馈进入后续 R14/R7/R-ARCH/R15/WAR3-GAP 深化。
6. 下一轮主攻先放下 AI 长局，围绕 `R14/R7/R-ARCH/R15/WAR3-GAP`：把基础 clips、程序化 icon、HUD 背包槽、冷却/生效 meter 和技能爆发升级为更可信动作/图标/特效，补 Human 真实 T2/T3 数值曲线、升级平衡、玩家可读反馈、命令卡路线/热键/视觉身份一致性、外部试玩包装、全局差距雷达复盘，以及把 HUD/command/ability/combat/economy/result presentation 边界继续从 `Game.ts` 外移。
7. `R9` 作为已有稳定对手底座保留，后续再做侦察/撤退/适应；当前不抢占 R14/R7/R-ARCH 主线。

## 已完成的第一批切片

1. `R0` 项目口径清理：README、Known Issues、Roadmap、Command Center 统一到 Codex-only 和当前真实阶段。
2. `R1-R6` 基础体验闭环：打开网页、开始一局、第一分钟可读、RTS 操控、经济/生产、战斗底盘进入 `FoundationMilestoneSystem`、HUD 和 R15 反馈包。
3. `R1/R13` 主菜单和产品壳层：打开网页第一屏、设置、briefing、暂停、结果、返回、重开和关闭保护形成闭环。
4. `R3/R10` 第一局短局体验：默认开局、经济、生产、英雄、目标、AI 压力、胜负和复盘形成闭环。
5. `R11/R12` 战场目标和侦察身份：HUD 目标、世界 beacon、小地图圈、Fog/已探索状态、野怪、物品、商店、回城形成闭环。
6. `R7` Human 路线整理：经济、兵营、英雄、支援、科技、后期六段路线，以及 T1/T2/T3 解锁状态、技术节奏阶段、战术角色、生产线概览、下一步动作、power spike、路线 icon、解锁完成 cue、命令卡路线角色提示、字母热键执行、命令卡视觉身份、HUD 背包槽、命令状态层级、冷却/生效 meter、法力缺口 badge 和目标模式高亮进入玩家可读面板和运行时快照。
7. `R8` 英雄成局：三英雄技能链、经验等级、死亡/复活底座、技能反馈、技能可用性矩阵、目标合法性提示和复活尸体可读层进入 `HeroMilestoneSystem`。
8. `R9` AI 稳定对手：经济、生产、科技、英雄技能、地图/商店理解、压力波次、防守恢复和难度 director 进入 `AIOpponentMilestoneSystem`。
9. `R10` 短局闭环：目标、AI 压力、胜负摘要和重开路径进入 `SkirmishProgressSystem`。
10. `R11` 战场可读：HUD 雷达、世界 beacon 和小地图目标圈进入 `MapObjectiveSystem`。
11. `R12` War3 身份：Fog/侦察、野怪、掉落、商店和回城进入 `War3IdentitySystem`。
12. `R13` 产品壳层：主菜单、设置、briefing、暂停、结果、返回、重开、偏好和关闭保护进入 `SessionMilestoneSystem`。
13. `R14` 视觉 / 音频身份：低模资产基线、HUD 皮肤、命令卡 icon、HUD 背包槽、命令状态徽标、冷却/生效 meter、法力缺口 badge、目标模式高亮、技能反馈、复活尸体 marker/范围环、技能特效爆发、结果页视觉复盘、音效 cue 总线、选中/命令/命中/血条/状态表现层、玩家感知反馈层、最小单位动作语言、clip/fallback 动作来源、真实动作/音效素材门禁和当前合同全覆盖 asset-backed clips/cues 进入 `VisualAudioIdentitySystem`。
14. `R15` 外部试玩准备：试玩信息、已知问题入口、诊断反馈包、暂停/结果反馈入口、性能/兼容/错误缓冲/反馈分流、Human 解锁层、战场表现层和发布边界进入 `PlaytestReadinessSystem`。
15. `WAR3-GAP` 全局追赶雷达：R1-R15 证据汇总为 12 个玩家旅程差距域，并进入 R15 诊断反馈包和 R-ARCH 边界测试。

## 下一批主攻方向

1. `R14` 深化：把当前合同全覆盖的基础 transform clips / wav cues、技能爆发和结果页视觉复盘升级为更接近 War3-like 的动作节奏、发布级技能特效、主菜单氛围和最终音频 identity。
2. `R7` 深化：T2/T3 数值节奏、兵种克制、升级平衡、发布级图标、真实多充能体系、最终 cooldown art、可配置热键体系和路线完成后的实战目标反馈。
3. `R-ARCH` 结构化重构：继续把 milestone/playtest/HUD/command/ability/combat/audio/result presentation 边界逐步从 `Game.ts` 拆出。
4. `R15` 发布级打磨：真实浏览器矩阵、性能阈值、可分享试玩包、反馈运营和人工 triage 规则。
5. `WAR3-GAP` 每轮复盘：每轮结束用全局差距雷达报告哪些 War3-like 域缩小、哪些仍是关键缺口。
6. `R9` 暂缓到下一轮：真实侦察、撤退/恢复微策略、对玩家打法的长期反应、10-15 分钟稳定性证明。

## 默认入口

- 项目总控：`docs/PROJECT_COMMAND_CENTER.zh-CN.md`
- 顶层 Roadmap：`PLAN.zh-CN.md`
- 版本级历史路线：`docs/PROJECT_MASTER_ROADMAP.zh-CN.md`
- 终局差距：`docs/WAR3_ENDSTATE_GAP_ATLAS.zh-CN.md`
- Human 能力板：`docs/HUMAN_RACE_CAPABILITY_BOARD.zh-CN.md`
- 已知问题：`docs/KNOWN_ISSUES.zh-CN.md`
- 回归清单：`docs/GAMEPLAY_REGRESSION_CHECKLIST.md`

## 不再使用

- `board.html`
- `public/board.js`
- `public/board.css`
- `scripts/*watch*`
- `scripts/*lane*`
- `scripts/queue-refill.mjs`
- `scripts/task-synthesis.mjs`
- `scripts/version-*.mjs`
- `docs/CODEX_ACTIVE_QUEUE.md`
- `docs/GLM_READY_TASK_QUEUE.md`
- 双泳道 runways / transition automation 文档
