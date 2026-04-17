# 双 AI 中型项目通用底座

> Last updated: 2026-04-14  
> 来源：基于 `war3-re` 的真实执行过程抽象。  
> 目标：以后任何项目都可以先用这份文档起盘。  
> 理想状态是：
>
> ```text
> 你给目标、约束、资料和边界，
> 我按这套底座自动生成项目框架、任务系统、监控和推进路径，
> 然后就能开工。
> ```

## 1. 这份底座解决什么问题

未来项目最容易在一开始就犯三个错误：

1. 只有想法，没有完整交付框架
2. 只有任务，没有版本和阶段
3. 只有 agent 在跑，没有持续可控的协作系统

所以这份底座的作用不是“告诉 agent 多干活”，而是定义：

- 一个项目从构思到完结，必须经过哪些层
- 每一层需要谁提供什么
- 我能先产出什么
- 哪些东西必须由人拍板
- 哪些东西可以交给 Codex / GLM 自动推进

## 2. 以后所有项目默认都按这 10 层展开

```text
L0 目标与问题定义
L1 产品定义
L2 能力总表
L3 版本路线图
L4 当前真实里程碑
L5 执行 operating model
L6 Runway / Live Queue / Task Card
L7 Companion Job / Feed / Monitor / Board
L8 Gate / Cutover / Release
L9 Post-release / Maintenance / Feedback loop
```

如果少一层，后面一定会出问题。

## 3. 角色定义：每个环节到底需要谁

以后所有项目，默认至少有下面这些角色。  
哪怕现实里只有你和我，也要在系统里把这些职责显式化。

| 角色 | 必须提供什么 | 我能替代到什么程度 | 不能替代什么 |
| --- | --- | --- | --- |
| 用户 / 项目 owner | 目标、优先级、约束、边界、审美与最终判断 | 我可以帮你把模糊想法整理成清晰定义 | 我不能替你决定你真正想要什么 |
| Codex | 规划、架构、版本切换、任务整形、review、集成、关键实现 | 这是我的主职责 | 不应把纯用户品味伪装成工程结论 |
| GLM | 窄边界实现、focused proof、机械性推进 | 我可以持续驱动和验收它 | 不应承担产品方向和最终验收 |
| 外部资料提供者 | repo、设计稿、素材、文档、账号、测试数据、接口权限 | 我可以整理、筛选、转结构化 | 没有权限的账号/资产/法律边界不能靠猜 |
| 测试者 / 目标用户 | 人眼判断、实际使用反馈、主观体验裁决 | 我可以设计脚本、整理反馈、路由问题 | 主观体验不能完全由自动化替代 |

## 4. 项目全生命周期框架

下面这张表是以后任何项目都可以直接套用的“从开始到结束”的主框架。

### P0. Intake / 起盘

| 项 | 内容 |
| --- | --- |
| 目标 | 把模糊想法变成可启动项目 |
| 你必须提供 | 项目目标、目标用户、交付形态、时间约束、不能碰的边界 |
| 我能产出 | 初步问题定义、风险清单、起盘问题单、资料清单 |
| GLM 能做 | 不建议参与 |
| 退出标准 | 已经知道“做什么、给谁、为什么、什么不做” |

### P1. Product Definition / 产品定义

| 项 | 内容 |
| --- | --- |
| 目标 | 定义这个项目最终交付的完整产品是什么 |
| 你必须提供 | 参考案例、偏好、必须实现/不能实现项 |
| 我能产出 | PRD、完整产品定义、用户路径、范围边界、非目标清单 |
| GLM 能做 | 文档整理、素材归档、结构化摘要 |
| 退出标准 | 顶层产品定义可以被任何后续文档引用 |

### P2. Capability Program / 能力总表

| 项 | 内容 |
| --- | --- |
| 目标 | 拆清楚项目离目标还差哪些能力域 |
| 你必须提供 | 如果有行业知识、竞品理解、阶段偏好，尽量给出来 |
| 我能产出 | capability matrix、缺口地图、优先级、owner 建议 |
| GLM 能做 | 补资料、整理已有实现、辅助建表 |
| 退出标准 | 不再靠“继续往前做”推进，而是明确在补哪类能力 |

### P3. Version Roadmap / 版本路线图

| 项 | 内容 |
| --- | --- |
| 目标 | 把长期目标拆成一串版本主山 |
| 你必须提供 | 哪些阶段必须有实际业务意义 |
| 我能产出 | `V0-VN` 路线图、阶段目标、非本阶段项、切换标准 |
| GLM 能做 | 辅助生成模板、维护部分文档 |
| 退出标准 | 项目进入“按版本推进”，而不是“按今天想到的任务推进” |

### P4. Operating Model / 协作系统

| 项 | 内容 |
| --- | --- |
| 目标 | 定义人、Codex、GLM、自动化之间怎么协作 |
| 你必须提供 | 你希望怎么参与、哪些事必须你拍板、哪些可以异步 |
| 我能产出 | operating model、角色边界、并行规则、review 规则、资源治理规则 |
| GLM 能做 | 不建议主导，可配合补执行说明 |
| 退出标准 | 所有人都知道谁该做什么、何时停、何时继续 |

### P5. First Milestone / 当前真实里程碑

| 项 | 内容 |
| --- | --- |
| 目标 | 定义当前唯一真实主里程碑 |
| 你必须提供 | 当前最想先赚到什么、什么算过早 |
| 我能产出 | 当前里程碑定义、gate、evidence ledger、deferred judgment 规则 |
| GLM 能做 | 基于当前 gate 做 scoped implementation/proof |
| 退出标准 | 项目只有一个主问题，不再同时追很多主目标 |

### P6. Task System / 任务系统

| 项 | 内容 |
| --- | --- |
| 目标 | 把当前里程碑变成可持续派发的任务系统 |
| 你必须提供 | 如果有特殊优先级或资源限制，要明确说 |
| 我能产出 | master backlog、runway、live queue、task card、queue floor、补货规则 |
| GLM 能做 | 执行 live queue 中的 bounded slice |
| 退出标准 | 任务不会断供，不会 fake ready，不会靠聊天记忆 |

### P7. Automation / 监控与自动化

| 项 | 内容 |
| --- | --- |
| 目标 | 让项目持续可观察、可续派、可回收 |
| 你必须提供 | 机器资源边界、是否允许常驻进程、是否需要网页面板 |
| 我能产出 | watch runtime、companion、feed、monitor、board、cleanup 规则 |
| GLM 能做 | 配合输出 closeout marker、维护局部执行链 |
| 退出标准 | “有没有在干活”不再靠猜 |

### P8. Release / 版本收口与切换

| 项 | 内容 |
| --- | --- |
| 目标 | 让当前版本能收口，并标准化进入下一版 |
| 你必须提供 | 是否有必须的人眼批准、分享边界、对外口径 |
| 我能产出 | oracle、transition pack、cutover 规则、release packet、known issues |
| GLM 能做 | 完成 scoped closeout proof、机械性收口任务 |
| 退出标准 | 可以明确回答“这一版到底算没算过、下一版到底有没有开始” |

P8 的硬规则：

- “能切”和“已经切了”必须分开。
- 每次只允许 `N -> N+1`，不能一次连跳两版。
- 下一版预热只能准备模板和交接包，不能提前把下一版当 active version。
- 当前 active version 必须写进 runtime state，不能只存在于聊天结论。
- 版本模板、任务生成 prompt、看板字段都不能写死某个历史版本号；必须按 `当前 Vn 结论` / runtime state / transition config 动态读取。

### P9. Post-release / 维护与反馈闭环

| 项 | 内容 |
| --- | --- |
| 目标 | 让项目进入长期维护和扩展，而不是一发完就散 |
| 你必须提供 | 对反馈处理策略、公开/私测策略、后续优先级 |
| 我能产出 | feedback triage、debt register、next-version entry、维护策略 |
| GLM 能做 | 小范围修复、回归包、文档同步 |
| 退出标准 | 反馈能进入系统，不再重新回到“临时聊天推进” |

## 5. 以后每个项目启动前，我默认只需要你回答这些问题

这套问卷是以后所有项目的最小起盘包。

### 5.1 目标问题

1. 这个项目最终要交付什么？
2. 目标用户是谁？
3. 他们为什么要用它？
4. 当前最想先赚到的第一阶段价值是什么？

### 5.2 边界问题

5. 明确不做什么？
6. 法律、品牌、素材、账号、权限有哪些硬边界？
7. 有没有时间、预算、发布窗口约束？

### 5.3 资料问题

8. 现有 repo、文档、设计稿、素材、接口、账号有哪些？
9. 有没有 benchmark、竞品、参考产品？
10. 哪些资料是 source of truth？

### 5.4 协作问题

11. 你希望同步拍板的点有哪些？
12. 哪些判断可以让我异步推进？
13. 是否允许常驻监控 / 自动派发 / 本地看板？

只要这几组问题回答得够完整，我就可以开始生成项目的完整执行框架。

## 6. 以后我默认能自动产出的东西

当最小起盘包完整后，我默认应该自动产出下面这些文档和机制。

### 6.1 规划层

1. 产品定义文档
2. 能力总表
3. 版本路线图
4. 当前真实里程碑定义

### 6.2 执行层

5. operating model
6. Codex live queue
7. GLM live queue
8. runway 文档
9. task card 模板

### 6.3 自动化层

10. watch runtime
11. companion job system
12. feed / refill / synthesis
13. board / monitor

### 6.4 验收层

14. gate doc
15. evidence ledger
16. closeout packet
17. release / cutover packet

换句话说，以后我不应该只是“帮你做任务”，而应该先把项目底座搭出来。

## 7. 以后每个阶段谁该提供什么

下面这张表是最重要的通用分工表。

| 阶段 | 你提供 | Codex 提供 | GLM 提供 | 外部系统提供 |
| --- | --- | --- | --- | --- |
| 起盘 | 目标、约束、资料 | 起盘框架、问题单 | 暂不主导 | repo/账号/文档入口 |
| 产品定义 | 目标用户、参考、偏好 | 产品定义、非目标、用户路径 | 补资料整理 | benchmark、设计稿 |
| 能力总表 | 行业优先级、业务判断 | capability map、缺口排序 | 结构化整理 | 竞品材料 |
| 路线图 | 哪些阶段必须有业务意义 | 版本主线、切换规则 | 辅助整理 | 历史数据/计划 |
| 当前里程碑 | 这阶段最值钱的目标 | milestone/gate/evidence | 小切片实现与 proof | 测试环境 |
| 执行系统 | 参与方式、资源约束 | queue/runway/ownership/review | task closeout | tmux/CI/local env |
| 自动化监控 | 是否允许常驻进程 | board/companion/feed/cleanup | closeout marker 配合 | 机器、端口、权限 |
| 切版发布 | 分享边界、审批边界 | transition pack/release packet | scoped closeout | deploy、testers |
| 维护扩展 | 长期优先级、反馈标准 | triage、debt routing、next roadmap | regression/fixes | 反馈来源 |

## 8. 以后哪些东西必须由你提供，哪些我可以自己推断

### 8.1 必须由你提供的

这些我不能安全猜：

- 项目真实目标
- 目标用户
- 法律 / 素材 / 账号 / 权限边界
- 明确不能碰的事
- 你要不要公开 / 私测 / 内部使用
- 审美和品牌的最终偏好

### 8.2 我可以先推断、再让你校正的

- 版本路线图
- capability 分层
- 角色框架
- 当前里程碑与 gate
- queue / runway / task card
- 自动化与监控架构
- 技术路线与验证策略

### 8.3 可选但非常有价值的

- benchmark 截图或链接
- 设计稿 / 品牌稿
- 现有用户反馈
- 测试账号
- 历史项目资料
- 素材清单

## 9. 以后所有项目默认采用的双泳道规则

### 9.1 Codex lane 默认负责

- 顶层规划
- 版本切换
- 当前里程碑判断
- 任务补货
- review / reject / accept
- 高风险集成
- 用户反馈翻译

### 9.2 GLM lane 默认负责

- bounded implementation
- focused proof
- mechanical docs sync
- 窄范围回归
- 已定义边界的小型改动

### 9.3 双泳道的三个硬前提

1. 不重叠 write scope
2. `ready` 只等于真可派发
3. closeout 前必须补足下一批队列

## 10. 以后所有项目默认采用的文档与系统模板

如果未来要快速起盘，一个项目最少应该自动生成这些文件。

### 顶层

- `PLAN.md`
- `PLAN.zh-CN.md`
- `docs/<PROJECT>_MASTER_PLAN.zh-CN.md`
- `docs/<PROJECT>_CAPABILITY_PROGRAM.zh-CN.md`
- `docs/<PROJECT>_ROADMAP.zh-CN.md`

### 执行

- `docs/PROJECT_OPERATING_MODEL.md`
- `docs/CODEX_ACTIVE_QUEUE.md`
- `docs/GLM_READY_TASK_QUEUE.md`
- `docs/TASK_CAPTURE_SYSTEM.zh-CN.md`
- `docs/DUAL_LANE_STATUS.zh-CN.md`

### 自动化

- `scripts/*watch*.sh`
- `scripts/dual-lane-companion.mjs`
- `scripts/lane-feed.mjs`
- `scripts/queue-refill.mjs`
- `scripts/task-synthesis.mjs`
- `scripts/generate-dual-lane-board.mjs`

### 切版与验收

- `docs/VERSION_TRANSITIONS.json`
- `docs/VERSION_RUNTIME_STATE.json`
- `docs/VERSION_TRANSITION_PROTOCOL.zh-CN.md`
- `docs/VERSION_TRANSITION_PROCESS_LOG.zh-CN.md`
- `docs/<VERSION>_*_REMAINING_GATES.zh-CN.md`
- `docs/<VERSION>_*_EVIDENCE_LEDGER.zh-CN.md`
- `docs/<VERSION>_TRANSITION_BOOTSTRAP_PACKET.zh-CN.md`
- `docs/runways/<VERSION>_CODEX_TRANSITION_RUNWAY.zh-CN.md`
- `docs/runways/<VERSION>_GLM_TRANSITION_RUNWAY.zh-CN.md`

切版系统必须有这些回归：

- 当前版本还有 blocker 时，不能切到下一版。
- 当前版本只剩少量 blocker 且下一版模板缺失时，必须进入预热。
- 下一版模板齐备但当前版本未收口时，只能等待，不能切版。
- 当前版本已收口且下一版模板齐备时，才能执行 cutover。
- cutover 后必须只走一步，并重新基于新版本自己的 gate 文档计算状态。
- 任意 `当前 Vn 结论` 表头都必须能被识别，不能只支持 V2/V3。

## 11. 以后我接新项目时的默认启动顺序

你只要给目标和资料，我默认应该按这个顺序展开：

1. 收资料，问最小起盘问题
2. 定产品定义和非目标
3. 定 capability program
4. 定版本路线图
5. 定当前唯一真实主里程碑
6. 定 operating model
7. 生成 queue / runway / task cards
8. 生成 watch / companion / board
9. 进入双泳道推进
10. 进入版本 gate / cutover / release

## 12. 以后判断一个项目底座有没有搭好的标准

只要下面任何一个问题答不上来，这个项目底座就还没搭好：

1. 现在到底在做哪一版？
2. 当前唯一真实主里程碑是什么？
3. 这个项目最终交付的完整产品是什么？
4. 当前最重要的 3 个 blocker 是什么？
5. Codex 和 GLM 现在分别在干什么？
6. 下一条任务从哪儿来？
7. 哪些问题要等你拍板，哪些不需要？
8. 版本怎么从这一版进入下一版？
9. 用户现在能在哪儿看到真实进展？
10. 发版或对外交付时凭什么说自己准备好了？
11. 版本切换规则里有没有写死某个历史版本号？
12. 下一版本的预热输入来自哪里，是不是包含当前 blocker 快照和 handoff contract？

## 13. 一句话总结

以后所有项目，我都应该先把下面这件事做完，再进入日常写代码：

```text
把“项目本身”从一个想法，
变成一个有目标、有阶段、有队列、有作业系统、
有监控、有切版规则的执行机器。
```

只要这个底座先搭好，后面我问问题、收资料，就可以直接开工。
