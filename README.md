# War3 RE

`War3 RE` 是一个浏览器 RTS 页面产品的私有 alpha。当前顶层路线以 `PLAN.zh-CN.md` 的 `R0-R15` Roadmap 为准：从打开网页像打开游戏开始，逐步补齐开局体验、RTS 操控信任、Human 短局、War3-like 身份系统、产品壳层和外部试玩准备。它仍不是公开发布版本，也不是完整 War3-like demo。

项目目标是做一个合法的 War3-like RTS 页面版 slice：开局基地可读、鼠标命令可信、采集-建造-训练闭环成立、基础战斗可理解、AI 会活动，并逐步补齐前门、暂停、结算、返回路径等页面产品结构。它不是官方产品，不是完整内容版，也不是完成版 demo。

## 当前状态

- 执行方式：`Codex-only`。旧的双泳道、GLM、watch、自动补货和本地看板已停止维护；不要再启动相关脚手架。
- 顶层路线：`R0-R15` Roadmap。后续任务从功能缺口和用户体验缺口切片，不从旧队列、V8/V9 gate 或自动补货流程开始。
- 架构路线：`R-ARCH` 横切主线。重构绑定 Roadmap 切片推进，保持行为不变，不做一次性 `Game.ts` 大重写。
- 当前真实阶段：R1-R15 都已有当前私有 alpha 运行时闭环：打开网页、第一局、第一分钟、RTS 操控、经济/生产、战斗底盘、Human 路线、英雄成局、AI 对手、短局、战场可读、War3-like 身份、产品壳层、视觉 / 音频身份和外部试玩准备都能 proof；仍不是完整 Human race、完整 War3-like demo 或发布版。
- 全局差距视角：R15 反馈包现在包含 `War3 gap radar`，按 12 个玩家旅程域持续报告离 War3-like 目标的差距；这用于每轮追赶复盘，不是 War3 parity 声明。
- 当前优先级：AI 长局先放低，主攻 `R14/R7/R-ARCH/R15`：R14 已按真实动作/音效素材门禁补齐当前合同覆盖，12 个核心单位共 51 个基础 GLB transform clip 状态、10 类 wav cue 文件已进 runtime，并补出英雄范围圈、施法 cursor、主动目标合法性、复活尸体 marker/范围环、命令卡程序化 icon、HUD 背包槽、命令状态徽标、冷却/生效 meter、法力缺口 badge、目标模式高亮、技能特效爆发和结果页视觉复盘；R7 已补出 T1/T2/T3 技术节奏、战术角色、混编覆盖、兵种克制读法、科技收益、下一步动作、power spike、命令卡路线角色提示、字母热键执行和视觉身份基线；R10 结果页已补出 combat reason / tech impact 卡片。下一步是把这些基线素材升级成更接近 War3-like 的动作节奏、技能特效质量、真实 Human 数值曲线、升级平衡、发布级图标、真实多充能体系、最终 cooldown art、可配置热键和音频 identity，同时继续推进结构拆分、主菜单氛围和外部试玩包装。
- 当前最适合验证：打开页面，玩前 5-10 分钟，记录入口是否清楚、能否开始、控制是否可信、经济/生产/AI 是否能形成短局、返回/重开是否自助，并把最阻塞继续试玩的问题按反馈模板记录。
- 分享边界：可以继续受控外部试玩；不能把当前版本包装成公开发布、完整 War3、完整 Human race 或最终 release-ready。
- 视觉边界：战场和产品壳层仍可能使用 proxy / fallback / procedural 资产；当前更重视可读性和合法来源，不代表最终资产品质。

## 当前回看链接

GitHub Pages 当前地址：

[https://happle940.github.io/war3-re/](https://happle940.github.io/war3-re/)

这个链接用于 milestone 回看、受控试玩和当前 Roadmap 切片验证。不要把它包装成公开发布入口。朋友试玩前按 [GitHub Pages 私测发布说明](./docs/PRIVATE_PLAYTEST_RELEASE.zh-CN.md) 做发布验收和口径控制。

## 私测 / 分享批准状态

当前 README 只允许这一层对外 wording：

```text
War3-like browser RTS private alpha, Roadmap-driven Codex-only development
```

它不等于公开分享、release-ready 或完整 War3-like demo。继续扩散或升级口径前，至少要完成当前 Roadmap 中的开局体验、RTS 信任底盘、Human 短局和产品壳层关键切片。

默认边界是：可以继续受控试玩和维护；不能说公开 demo 已发布；不能说完整 Human、完整 War3-like 或 release-ready 已完成。

## 现在已经实现了什么

- 页面产品壳层已完成当前私有 alpha 闭环：主菜单、设置、briefing、暂停、结果、返回、重开、偏好保存、关闭保护和上局摘要都有运行时 proof。
- 外部试玩准备已完成当前私有 alpha 闭环：主菜单、暂停和结果页都有试玩信息入口，版本边界、Known Issues、诊断反馈包、性能预算信号、兼容矩阵、错误缓冲、反馈分类、恢复按钮、Human 解锁层、战场表现层和关闭保护进入 R15 runtime proof。
- War3 全局差距雷达已进入试玩诊断包：前门、第一分钟、操控、经济、战斗、Human、英雄、地图/Fog/物品、AI、视觉音频、试玩发布和架构 12 个域会随 runtime 快照一起输出。
- 基础体验已完成当前私有 alpha 闭环：R1-R6 的前门、开局、第一分钟、命令信任、经济/生产和战斗底盘进入 `FoundationMilestoneSystem`、HUD 战术身份面板和 R15 反馈包。
- 浏览器内 RTS 对局场景和 Human-like 开局基地。
- 鼠标点击选择、框选、右键移动/采集、攻击移动、停止、原地防守、编队。
- worker 采金、伐木和资源回收闭环。
- Town Hall 训练 worker，Barracks 训练 footman，Lumber Mill 解锁 Guard Tower，Arcane Sanctum 训练 Priest，Workshop 训练 Mortar Team。
- Farm 人口、Barracks 生产、Tower 静态防御、Gold Mine 资源点、树木/木材交互。
- Priest 已有最小法力 / 治疗模型；Mortar Team 已有最小攻城弹道 / AOE / 目标过滤模型。
- 基础 HUD、选择反馈、命令卡状态、资源/人口显示、集结点。
- 基础 AI 经济、生产、科技、英雄技能、练级/商店、进攻波、防守/重组/反击和难度 director 已进入 R9 运行时 proof。
- 三英雄、XP/等级、技能学习、死亡/复活底座、技能反馈、技能可用性矩阵、目标合法性提示、施法距离/范围/光标语义、主动目标合法/非法判定和复活尸体可读层已进入 R8 运行时 proof。
- Human 路线面板已从六段路线推进到 T1/T2/T3 解锁状态、技术节奏阶段、战术角色、混编覆盖、兵种克制读法、科技收益、生产线概览、下一步动作、power spike、路线 icon 和解锁完成 cue；建造、训练、升级、研究和商店命令卡显示路线 tier、角色、focus，并支持当前可见页的字母热键执行、禁用原因反馈、程序化 icon 视觉身份、命令状态徽标、冷却/生效 meter、法力缺口 badge 和目标模式高亮。
- 低模资产基线、HUD 皮肤、命令卡程序化 icon、HUD 背包槽、命令状态徽标、冷却/生效 meter、法力缺口 badge、目标模式高亮、技能视觉反馈、施法预览语言、主动目标合法性反馈、复活尸体 marker/范围环、技能特效爆发、结果页视觉复盘、目标/压力/技能 cue 总线、选中/命令/命中/血条/状态表现层、玩家感知反馈层、最小单位动作语言、clip/fallback 动作来源、真实动作/音效素材门禁和当前合同全覆盖 asset-backed clips/cues 已进入 R14 运行时 proof。
- 面向核心控制、资源、建造、战斗、资产、可视性、AI 和 smoke path 的 runtime 回归脚本。

这说明仓库已有可玩的 RTS alpha 核心；不代表游戏完整，也不代表可以公开发布。

## 页面产品壳层：真实与缺口

当前可以诚实描述为：

- `front door / menu shell`：当前私有 alpha 已有真实主菜单、地图来源、模式入口、设置入口、试玩信息入口和开始路径。后续短板是发布级氛围和真实浏览器矩阵。
- `session shell`：pause、setup、results、返回、重载、关闭保护、试玩反馈入口、反馈分流和恢复按钮已有运行时 proof。后续短板是帮助层级、反馈运营和更清楚的外部试玩包装。
- `current-map / reload seam`：当前地图重载路径是已有真实能力，可以作为 menu、pause、results 的最小动作基础。
- `results summary`：当前允许描述 alpha 级 verdict、时长、双方 live 单位/建筑数、目标完成度、AI 压力摘要和结果页视觉复盘卡片；不能写成完整战报、历史系统或回放系统。
- `battlefield / shell assets`：当前只有 intake、fallback 和 handoff 规则；没有 `approved-for-import` packet 前，不应说真实素材批次已批准或导入。
- 只有经过 Codex review、同步和对应回归证明的 slice 才算当前事实；旧队列、看板、watch 和自动补货不再作为事实来源。

仍不能这样描述：

- 不能说设置、帮助、返回主菜单、再来一局、session continuity 已达到最终产品水准；当前只是私有 alpha 闭环。
- 不能说 ladder、rank、campaign progress、完整 postgame report、match history、replay 或 continue saved game 已存在。
- 不能把当前 shell 说成最终 UI、最终视觉 identity 或公开发布级产品包装。
- 不能暗示已有完整四族、英雄、野怪、物品、战役、多人、天梯或 War3 parity。

## 仍然没完成什么

- 产品壳层和外部试玩入口已有当前闭环，但不等于发布级包装：帮助层级、真实性能阈值、浏览器矩阵、反馈运营和人工 triage 仍未关闭。
- 代码结构仍需渐进重构：`Game.ts` 承担过多职责，后续应按 `R-ARCH` 抽 session、HUD/command card、command/order、economy、combat、abilities、AI、result presentation 等边界。
- 视觉 identity 未最终确定；proxy / fallback / procedural 动作仍可能存在于非合同对象或表现细节中。运行时已经能优先播放 GLB clips，并能报告真实动作/音效素材门禁；当前合同覆盖已满，技能爆发和结果复盘已有可见层，但 clips 仍是基础 transform 动作，不是最终骨骼动画，技能特效也不是最终美术，最终音频 identity 还没关闭。
- 当前内容仍不是完整 Human race：已有 worker、footman、rifleman、priest、sorceress、knight、mortar、三英雄、主要建筑、科技链路、T1/T2/T3 解锁、节奏面板、混编覆盖、兵种克制读法、科技收益、结果页战斗原因复盘、命令卡路线角色提示、字母热键执行、程序化 icon、HUD 背包槽、命令状态徽标、冷却/生效 meter、法力缺口 badge 和目标模式高亮基线，但真实二本/三本数值曲线、升级平衡、克制调参、发布级图标、真实多充能体系、最终 cooldown art 和可配置热键体系仍要继续打磨。
- War3 全局差距已经可见，但仍未关闭：特别是视觉/动作/音频身份仍有关键缺口，当前只是基础 clips/cues、技能爆发和结果复盘合同覆盖，不等于发布级动作、技能特效、混音和最终资产批准。
- 没有完整四族、完整科技树、完整战役、多人、回放、天梯或正式 onboarding。
- 顶层 Roadmap 已把 R1-R15 全部纳入当前私有 alpha proof；这不代表 War3 parity、完整 Human race 或发布级完成。
- 平衡、10-15 分钟长局深度、最终 UI 皮肤、真实音频 identity、公开分享文案和外部 release readiness 仍未关闭。
- 可读性、手感、视觉方向和任何公开分享决定仍需要人眼确认。

## 建议的 5-10 分钟检查路径

1. 打开回看链接，确认没有白屏、启动崩溃或明显卡死。
2. 在默认镜头下确认 Town Hall、worker、Gold Mine、树线和 HUD 是否可读。
3. 选中 worker，右键地面移动，再右键 Gold Mine 或树木采集。
4. 选中 Town Hall 或 Barracks，训练一个 worker 或 footman。
5. 如果开局允许，检查 Farm、Barracks、Tower 的建造或作用是否可理解。
6. 继续运行一小段时间，观察 AI 是否采集、建造、训练或进攻。
7. 尝试暂停、返回或重开，确认是否能自助恢复到入口或新一局。
8. 记录最影响理解或继续试玩的 1-3 个问题。

有用反馈：

- 浏览器、设备、页面是否能稳定打开。
- 开局基地是否看得懂。
- 选择和右键命令是否可信。
- 采集、建造、训练闭环是否清楚。
- AI 是否像一个活动中的对手，而不是静止样机。
- 暂停、返回、重开或反馈路径是否清楚。
- 试玩信息里的反馈包是否足够帮助你描述问题。
- 哪个问题最阻止继续玩下去。

现阶段不适合重点评价：

- 最终美术品质。
- 完整阵营、战役、英雄系统、商店、野怪或多人内容。
- 已知问题里已经列出的限制，除非实际影响比文档描述更严重。

## 基础操作

- 左键点击：选择一个单位或建筑。
- 左键拖框：框选单位。
- Shift + 左键 / Shift + 框选：追加选择。
- 右键地面：移动。
- 右键 Gold Mine：让 worker 采金。
- 右键树木：让 worker 伐木。
- 选中 worker 后点击建造按钮，再左键地面：放置建筑。
- 选中有命令卡的单位或建筑后，可按按钮显示的字母热键执行当前可见命令；禁用命令会显示缺资源、缺科技、缺建筑、冷却剩余、法力缺口或目标模式状态。
- `A` + 左键地面：攻击移动。
- `S`：停止。
- `H`：原地防守。
- `Ctrl+1..9`：保存编队。
- `1..9`：召回编队。
- `Tab`：切换子组。
- 选中可训练单位的建筑后按 `Y`：设置集结点。
- 右键或 `Esc`：取消建造、攻击移动或集结点模式。

## 本地运行和验证

安装依赖：

```bash
npm install
```

启动本地开发服务器：

```bash
npm run dev
```

构建：

```bash
npm run build
```

应用类型检查：

```bash
npm run typecheck:app
```

完整 runtime 回归：

```bash
npm run test:runtime
```

GitHub Pages 私测发布验收：

```bash
npm run test:release
```

常用 focused checks：

```bash
npm run test:closeout
npm run test:first-five
npm run test:assets
npm run test:visibility
npm run test:ai
```

## 项目文档

重要工作前先读这些，不要从历史队列或看板文档开始：

- [PLAN.zh-CN.md](./PLAN.zh-CN.md)：顶层 R0-R15 Roadmap。
- [docs/PROJECT_COMMAND_CENTER.zh-CN.md](./docs/PROJECT_COMMAND_CENTER.zh-CN.md)：Codex-only 工作方式和 Roadmap 驱动的当前主攻顺序。
- [docs/DOCS_INDEX.md](./docs/DOCS_INDEX.md)：瘦身后的文档索引。
- [docs/PROJECT_MASTER_ROADMAP.zh-CN.md](./docs/PROJECT_MASTER_ROADMAP.zh-CN.md)：版本级路线图。
- [docs/WAR3_ENDSTATE_GAP_ATLAS.zh-CN.md](./docs/WAR3_ENDSTATE_GAP_ATLAS.zh-CN.md)：长期 War3-like 差距。
- [docs/HUMAN_RACE_CAPABILITY_BOARD.zh-CN.md](./docs/HUMAN_RACE_CAPABILITY_BOARD.zh-CN.md)：Human 内容能力板。
- [docs/KNOWN_ISSUES.zh-CN.md](./docs/KNOWN_ISSUES.zh-CN.md)：私测前必须知道的限制。
- [docs/GAMEPLAY_REGRESSION_CHECKLIST.md](./docs/GAMEPLAY_REGRESSION_CHECKLIST.md)：回归覆盖。
