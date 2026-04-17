# War3 RE

`War3 RE` 是一个浏览器 RTS 页面产品的私有 alpha。当前阶段是 `V9 maintenance and expansion runway`：V8 外部试玩候选的工程阻塞已经清零，项目正在把外部反馈、V8 baseline 复跑和下一轮扩展方向变成可维护流程。它仍不是公开发布版本，也不是完整 War3-like demo。

项目目标是做一个合法的 War3-like RTS 页面版 slice：开局基地可读、鼠标命令可信、采集-建造-训练闭环成立、基础战斗可理解、AI 会活动，并逐步补齐前门、暂停、结算、返回路径等页面产品结构。它不是官方产品，不是完整内容版，也不是完成版 demo。

## 当前状态

- 阶段：`V9 maintenance and expansion runway`。V8-DEMO1、V8-RC1、V8-COPY1、V8-ASSET1、V8-FEEDBACK1 已有工程通过证据；V9 先处理反馈闭环、baseline 复跑和下一轮扩展选择。
- 当前真实里程碑：反馈能进入 hotfix / patch / debt / user gate；V8 baseline 已可复跑；下一轮扩展已固定为完整 Human 核心与数值系统。
- 当前对外口径按 `docs/V9_MAINTENANCE_EXPANSION_REMAINING_GATES.zh-CN.md`、`docs/V9_MAINTENANCE_EXPANSION_EVIDENCE_LEDGER.zh-CN.md` 和 V8 evidence ledger 收束；如果这里的概述和 ledger 状态冲突，以 ledger 为准。
- 当前工程阻塞：无。`V9-HOTFIX1`、`V9-BASELINE1`、`V9-EXPAND1` 均已有工程通过证据；用户和 tester verdict 仍可异步进入后续任务。
- 当前最适合验证：打开页面，玩前 5-10 分钟，记录入口是否清楚、能否开始、控制是否可信、经济/生产/AI 是否能形成短局、返回/重开是否自助，并把最阻塞继续试玩的问题按反馈模板记录。
- 分享边界：可以继续受控外部试玩；不能把当前版本包装成公开发布、完整 War3、完整 Human race 或最终 release-ready。
- 视觉边界：战场和产品壳层仍可能使用 proxy / fallback / procedural 资产；当前更重视可读性和合法来源，不代表最终资产品质。

## 当前回看链接

GitHub Pages 当前地址：

[https://happle940.github.io/war3-re/](https://happle940.github.io/war3-re/)

这个链接用于 milestone 回看、受控试玩或 V8 候选验证。不要把它包装成公开发布入口。

## 私测 / 分享批准状态

当前 README 只允许这一层对外 wording：

```text
V9 maintenance and expansion runway after V8 external demo engineering closeout
```

它不等于公开分享、release-ready 或完整 War3-like demo。V8 工程证据已经可作为 baseline，但继续扩散或升级口径前仍需单独满足：

- `V9-HOTFIX1`：tester 反馈能被记录、分级并进入 hotfix / patch / debt / user gate；当前已工程通过。
- `V9-BASELINE1`：V8 demo smoke、RC smoke、cleanup 和已知缺口说明已能复跑。
- `V9-EXPAND1`：下一轮扩展只主攻完整 Human 核心与数值系统，不同时打开第二阵营、多人、公开发布或纯包装线；当前已工程通过。

默认边界是：可以继续受控试玩和维护；不能说公开 demo 已发布；不能说完整 Human、完整 War3-like 或 release-ready 已完成。

## 现在已经实现了什么

- 最小页面产品壳层正在成立：普通入口不再只是自动进局的样机；当前方向是先进入可解释的前门 / menu shell，再进入对局。
- 会话壳层已有真实基础：pause、setup、results、reload/current-map、terminal reset、返回/重开等路径已有 proof route 和 focused regression 覆盖。
- 浏览器内 RTS 对局场景和 Human-like 开局基地。
- 鼠标点击选择、框选、右键移动/采集、攻击移动、停止、原地防守、编队。
- worker 采金、伐木和资源回收闭环。
- Town Hall 训练 worker，Barracks 训练 footman，Lumber Mill 解锁 Guard Tower，Arcane Sanctum 训练 Priest，Workshop 训练 Mortar Team。
- Farm 人口、Barracks 生产、Tower 静态防御、Gold Mine 资源点、树木/木材交互。
- Priest 已有最小法力 / 治疗模型；Mortar Team 已有最小攻城弹道 / AOE / 目标过滤模型。
- 基础 HUD、选择反馈、命令卡状态、资源/人口显示、集结点。
- 基础 AI 经济、生产和进攻压力行为；AI 已能按同规则使用部分 V7 内容，而不是直接生成单位。
- 面向核心控制、资源、建造、战斗、资产、可视性、AI 和 smoke path 的 runtime 回归脚本。

这说明仓库已有可玩的 RTS alpha 核心；不代表游戏完整，也不代表可以公开发布。

## 页面产品壳层：真实与缺口

当前可以诚实描述为：

- `front door / menu shell`：最小前门正在接入。它的目标是让普通访问者先理解“这是什么、从哪里开始”，而不是直接被扔进局内。
- `session shell`：pause、setup、results 已经不只是空壳；它们开始有真实按钮、返回/重载 seam 和 proof route。
- `current-map / reload seam`：当前地图重载路径是已有真实能力，可以作为 menu、pause、results 的最小动作基础。
- `results summary`：只允许描述当前 alpha 级字段，例如 verdict、时长、双方 live 单位/建筑数和当前 runtime 上局结果短标签；不能写成完整战报或历史系统。
- `battlefield / shell assets`：当前只有 intake、fallback 和 handoff 规则；没有 `approved-for-import` packet 前，不应说真实素材批次已批准或导入。
- 队列里 `ready` 或 `in_progress` 的 shell 任务不能写成已完成能力；只有经过 Codex review、同步和对应回归证明的 slice 才算当前事实。

仍不能这样描述：

- 不能说已经有完整主菜单、完整模式选择、完整对局配置或完整 loading / briefing。
- 不能说设置、帮助、返回主菜单、再来一局、session continuity 已达到最终产品水准。
- 不能说 ladder、rank、campaign progress、完整 postgame report、match history、replay 或 continue saved game 已存在。
- 不能把当前 shell 说成最终 UI、最终视觉 identity 或公开发布级产品包装。
- 不能暗示已有完整四族、英雄、野怪、物品、战役、多人、天梯或 War3 parity。

## 仍然没完成什么

- 完整产品壳层仍在建设：当前只有最小前门和会话壳层基础，不等于完整主菜单、模式选择、对局配置、loading/briefing、settings、help 或完整返回路径的最终形态。
- 视觉 identity 未最终确定；proxy / fallback 资产仍是正常状态。
- 当前内容仍是很窄的 Human-like slice：worker、footman、Guard Tower、Priest、Mortar Team、Town Hall、Barracks、Farm、Lumber Mill、Arcane Sanctum、Workshop、Gold Mine、树线和地形可读性辅助。
- 没有完整阵营、完整科技树、英雄、商店、野怪、物品、战役、多人、回放、天梯或正式 onboarding。
- V9 推荐下一轮扩展主攻完整 Human 核心与数值系统，但这只是方向收口，不代表这些内容已经实现。
- 平衡、长局深度、最终 UI 皮肤、音频 identity、公开分享文案和外部 release readiness 仍未关闭。
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

常用 focused checks：

```bash
npm run test:closeout
npm run test:first-five
npm run test:assets
npm run test:visibility
npm run test:ai
```

## 项目文档

重要工作前先读这些项目事实和路线图材料：

- [PLAN.md](./PLAN.md)：当前总控判断和优先级。
- [docs/DOCS_INDEX.md](./docs/DOCS_INDEX.md)：文档索引。
- [docs/WAR3_EXPERIENCE_CONTRACT.md](./docs/WAR3_EXPERIENCE_CONTRACT.md)：体验契约和证据分层。
- [docs/WAR3_PAGE_PRODUCT_MASTER_PLAN.zh-CN.md](./docs/WAR3_PAGE_PRODUCT_MASTER_PLAN.zh-CN.md)：页面产品目标和缺失壳层状态。
- [docs/WAR3_ENDSTATE_GAP_ATLAS.zh-CN.md](./docs/WAR3_ENDSTATE_GAP_ATLAS.zh-CN.md)：当前项目与长期 War3-like 终态的差距。
- [docs/KNOWN_ISSUES.zh-CN.md](./docs/KNOWN_ISSUES.zh-CN.md)：私测前必须知道的限制。
- [docs/V9_MAINTENANCE_EXPANSION_REMAINING_GATES.zh-CN.md](./docs/V9_MAINTENANCE_EXPANSION_REMAINING_GATES.zh-CN.md)：V9 维护与扩展阶段的当前工程阻塞。
- [docs/V9_MAINTENANCE_EXPANSION_EVIDENCE_LEDGER.zh-CN.md](./docs/V9_MAINTENANCE_EXPANSION_EVIDENCE_LEDGER.zh-CN.md)：V9 证据台账。
- [docs/V9_HUMAN_NUMERIC_EXPANSION_PACKET.zh-CN.md](./docs/V9_HUMAN_NUMERIC_EXPANSION_PACKET.zh-CN.md)：V9 下一轮扩展边界：完整 Human 核心与数值系统，含自动补货限制。
- [docs/V8_EXTERNAL_RELEASE_EVIDENCE_LEDGER.zh-CN.md](./docs/V8_EXTERNAL_RELEASE_EVIDENCE_LEDGER.zh-CN.md)：V8 外部试玩候选的 baseline 证据。
- [docs/V7_BETA_CANDIDATE_REVIEW_PACKET.zh-CN.md](./docs/V7_BETA_CANDIDATE_REVIEW_PACKET.zh-CN.md)：V7 beta candidate 的已通过工程地基。
