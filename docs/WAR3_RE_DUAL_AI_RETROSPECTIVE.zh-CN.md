# war3-re 双 AI 中型项目深度复盘

> Last updated: 2026-04-14  
> 用途：这份文档不是当前任务单，也不是单纯的 War3 产品愿景。  
> 它记录的是一件更大的事：
>
> ```text
> war3-re 既是一个 War3-like 网页版产品项目，
> 也是一个“用双 AI 泳道推进中型项目”的方法论项目。
> ```
>
> 明天对齐时，建议把这份文档当成主复盘底稿。
>
> 如果要把这次经验抽成未来项目通用起盘模板，请继续看：
>
> - `docs/DUAL_AI_PROJECT_BASELINE.zh-CN.md`

## 1. 先把项目本质说清楚

这个项目实际上包含三层目标，而且过去很长时间里这三层被混在一起了。

### 1.1 产品层

目标是做一个：

```text
合法、安全、浏览器内可运行、值得认真玩的 War3-like RTS 页面版产品
```

不是只做一个能自动开局的 RTS 原型。

对应源文档：

- `PLAN.zh-CN.md`
- `docs/WAR3_PAGE_PRODUCT_MASTER_PLAN.zh-CN.md`
- `docs/WAR3_MASTER_CAPABILITY_PROGRAM.zh-CN.md`
- `docs/PROJECT_MASTER_ROADMAP.zh-CN.md`

### 1.2 交付系统层

目标不是“让两个模型都在跑”，而是：

```text
让 Codex 和 GLM 在一个共享仓库里，
能长期、持续、可审计地推进同一个中型项目。
```

它要求我们把下面这些东西做成系统，而不是聊天习惯：

- 阶段定义
- 版本切换
- live queue
- 任务捕获
- 监控看板
- 自动派发
- closeout 回收
- 资源治理

对应源文档：

- `docs/PROJECT_OPERATING_MODEL.md`
- `docs/TASK_CAPTURE_SYSTEM.zh-CN.md`
- `docs/DUAL_LANE_COMPANION_MODEL.zh-CN.md`
- `docs/DUAL_LANE_ISSUE_LOG.zh-CN.md`
- `docs/VERSION_TRANSITION_PROTOCOL.zh-CN.md`

### 1.3 复用方法层

更长期看，这个仓库还在回答一个方法论问题：

```text
一个双 AI 泳道系统，要怎样才能真正带得动中型项目，
而不是只会在小任务上显得热闹？
```

这层现在还没完全成熟，但已经开始有可复用骨架。

## 2. 我们对项目的认识，经历了哪几次关键修正

这部分是复盘的核心。真正踩坑的地方，不是某个 bug，而是顶层认知错误。

### 2.1 从“局内 RTS 原型”修正到“完整页面版产品”

最早的默认假设是：

```text
打开网页直接进局。
```

这会把菜单、模式选择、设置、暂停、结算、返回菜单，都误归类成“后期包装”。

后来的修正是：

```text
产品前门、会话壳层、对局内核，三者一起才叫页面版产品。
```

这是顶层规划最重要的一次纠偏。

### 2.2 从“一个北极星”修正到“目标分层”

过去我们把：

```text
让 War3 玩家前 5 分钟认真对待它
```

同时当成：

- 当前阶段北极星
- 整个项目的终极衡量

这会带来一个错觉：

- 按当前阶段看，好像已经完成一大半
- 按长期目标看，其实还在中前段

后来的修正是分成三层：

1. 长期愿景：War3-like 页面版产品
2. 当前阶段北极星：前 5 分钟值得认真对待
3. 执行台阶：V2 / V3 / V4... 分版本推进

### 2.3 从 `M2-M7` 施工视角，修正到 `V0-V9` 产品视角

`M2-M7` 很适合做内部证据、closeout、验收包。

但如果把它们当成用户视角的主里程碑，会出现两个问题：

1. 用户看到的是很多战术标签，不知道产品真正走到哪
2. 系统容易围着当前施工包打转，看不到下一座主山

所以后来切成：

- `V0-V9`：产品/版本主线
- `M2-M7`：内部证据编号

这是从“施工段”回到“产品路线图”的修正。

### 2.4 从“聊天协调”修正到“系统协调”

早期很多状态只存在于：

- 聊天上下文
- 终端输出
- 某一次 closeout

这在短任务里勉强能用，但一旦任务链拉长就会崩：

- 谁在做什么会失真
- 队列会断供
- 监控会和真实状态漂移
- 版本切换会停在“理论上能切”

后来的修正是把协调对象写进系统：

- queue docs
- runway docs
- task cards
- companion jobs
- version runtime state
- board json

## 3. 现在已经成型的治理栈

这套栈决定了项目从顶层目标到下发任务的全过程。

```text
完整产品定义
  -> 能力总表
  -> 版本路线图
  -> 当前真实版本 / gate oracle
  -> Lane runway
  -> Live queue
  -> Task card
  -> Companion job
  -> Watch runtime
  -> Feed / monitor / board
  -> Closeout / residual / next dispatch
```

### 3.1 顶层产品定义

回答“这个产品最终要长成什么样”：

- `docs/WAR3_PAGE_PRODUCT_MASTER_PLAN.zh-CN.md`
- `docs/WAR3_MASTER_CAPABILITY_PROGRAM.zh-CN.md`
- `docs/PROJECT_MASTER_ROADMAP.zh-CN.md`
- `docs/WAR3_ASCENT_EXECUTION_PLAN.zh-CN.md`

### 3.2 当前阶段真实判断

回答“今天到底在哪一版、还差哪些 blocker”：

- `scripts/milestone-oracle.mjs`
- `docs/VERSION_RUNTIME_STATE.json`
- `docs/VERSION_TRANSITIONS.json`
- `scripts/version-transition-orchestrator.mjs`

### 3.3 双泳道任务分发层

回答“Codex 和 GLM 接下来各该做什么”：

- `docs/CODEX_ACTIVE_QUEUE.md`
- `docs/GLM_READY_TASK_QUEUE.md`
- `scripts/queue-refill.mjs`
- `scripts/task-synthesis.mjs`
- `scripts/lane-feed.mjs`

### 3.4 作业系统层

回答“现在到底在跑哪一条 job，结果是什么”：

- `scripts/dual-lane-companion.mjs`
- `scripts/codex-watch.sh`
- `scripts/glm-watch.sh`
- `scripts/codex-watch-monitor.sh`
- `scripts/glm-watch-monitor.sh`

### 3.5 可视化与用户观察层

回答“用户现在能在哪儿看真实进展”：

- `scripts/generate-dual-lane-board.mjs`
- `public/dual-lane-board.json`
- `board.html`

## 4. 双 AI 泳道为什么成立

双泳道不是两个模型一起刷任务，而是一个有明确不对称分工的系统。

### 4.1 Codex 的角色

Codex 不是单纯 reviewer。它是：

- 方向与边界的 owner
- GLM 的任务整形者
- 集成者
- closeout 的裁判
- 关键路径上的直接实现者

Codex 适合做：

- 顶层规划
- 阶段切换
- 任务补货
- 高风险集成
- 看板 / 自动化 / 协议
- 不适合让 GLM 自由发挥的产品边界工作

### 4.2 GLM 的角色

GLM 不是产品 owner，也不是最终验收者。它更像：

```text
高频、边界清楚、可验证的实现中尉
```

GLM 适合做：

- 有明确 allowed / forbidden files 的小切片
- focused regression pack
- deterministic bug fix
- mechanical docs sync
- 已经定好边界的小型实现

### 4.3 双泳道成立的前提

双泳道不是默认成立的。它需要四个前提：

1. 任务边界明确
2. 文件 ownership 明确
3. closeout 回收明确
4. 队列不会断供

只要其中一个缺失，双泳道就会退化成：

- 两个人改同一堆文件
- 一个在等，一个在猜
- 看起来很忙，实际很乱

## 5. 双泳道现在的实际执行链路

这是目前最接近“真实作业系统”的链路。

### 5.1 任务从哪里来

任务不是从聊天灵感里直接长出来，而是从四层结构里选出来：

```text
Master Backlog
  -> Lane Runway
  -> Live Queue
  -> Task Card
  -> Companion Job
```

### 5.2 任务如何进入 lane

1. Oracle 判断当前真实版本与 blocker
2. Queue refill 从 runway / synthesis / fallback 里补货
3. Lane feed 只看 live queue 的顶部状态表
4. Task card 提供范围、验证、停机条件
5. Companion job 把这一条任务变成可追踪作业

### 5.3 为什么 companion 很重要

如果没有 companion，就会出现一个老问题：

```text
有会话，不等于有任务。
有进程，不等于在干活。
```

Companion 的价值在于把“持续跑的 session”变成“可追踪的作业单元”。

### 5.4 为什么版本切换也必须系统化

早期一个典型错误是：

- orchestrator 已经判断 `cutover-ready`
- 但系统仍停在旧版本

根因不是判断错，而是缺少真正的切换执行器。

所以后来把版本切换拆成：

- oracle：只报真相
- orchestrator：只判能不能切
- cutover executor：真的去切
- runtime state：记录当前 active version

### 5.5 这次 V2/V3 问题真正沉淀成了什么

V2->V3 暴露的问题，不只是“某次没切过去”，而是版本系统最容易犯的五类错误：

1. 只会判断，不会执行
2. 只写当前版本，不考虑下一版本预热
3. 只给人看状态，不告诉人为什么没动
4. 任务生成还读旧版本文档
5. 解析器和 prompt 示例把 `V2/V3` 当成语义，而不是把 `Vn` 当成结构

这次修正的核心沉淀是：

```text
版本推进不能靠“聊天里说现在进入下一版”，
必须靠 runtime state + transition config + milestone oracle + cutover executor。
```

后续 V3->V4、V4->V5、直到 V7->V8，都必须复用同一条状态链：

```text
当前版本 gate 文档
  -> oracle 计算真实 blocker
  -> orchestrator 判断预热/切换状态
  -> preheat runner 只准备下一版模板
  -> cutover executor 只切一步
  -> runtime state 改写 active version
  -> queue refill 按新版本跑道补货
```

这里最重要的教训是：阶段转换系统里的任何字段、示例、看板 key，都不能写成某个历史版本名。  
`V2/V3` 只能是数据，不能是规则。

## 6. 这套系统是怎么一步步长出来的

为了便于明天对齐，这里按“演化阶段”而不是按聊天顺序复盘。

### 阶段 A：原型与手工推进期

特征：

- 重点在 RTS 基底
- 状态主要靠聊天记忆和终端
- 对“页面产品”与“中型项目系统”认识不足

收获：

- V0/V1 的基础能力打出来了

问题：

- 还没有真正的产品前门
- 还没有可持续的双泳道机制

### 阶段 B：队列和跑道文档期

特征：

- 开始出现 `CODEX_ACTIVE_QUEUE` / `GLM_READY_TASK_QUEUE`
- 开始显式区分 Codex 和 GLM 的任务

收获：

- 任务不再完全依赖聊天
- 分工第一次被写成文档

问题：

- queue、runway、task card 还会相互漂移
- `ready` 的语义经常被污染

### 阶段 C：watch runtime 和看板期

特征：

- 有了 `codex-watch` / `glm-watch`
- 有了 monitor 和 board

收获：

- 第一次能“看”两条泳道

问题：

- “有 watch 进程”被误以为“有人在持续工作”
- board 读的是综合推断，不是真正作业真相

### 阶段 D：feed 与自动续派期

特征：

- 开始尝试自动补货和自动续派
- lane feed 接入 queue

收获：

- 能从“人工盯每一步”走向“系统接棒”

问题：

- 双边 feed 不对称
- queue floor 没守住就会断供
- synthesis 会重复派单，烧 token

### 阶段 E：companion 作业系统期

特征：

- 引入 `dual-lane-companion`
- 开始有 job id / status / result / cancel

收获：

- “会话”第一次变成“作业”
- board 和 feed 有了更稳定的 truth source

问题：

- 目前 still mixed truth，不是完全由 companion 一统
- 一些旧 watch / queue 语义仍在共存

### 阶段 F：版本切换标准化期

特征：

- 形成 version transition protocol
- 引入 runtime state / cutover executor / preheat runner

收获：

- 项目不再只能“做当前阶段”，还能管理“怎么进入下一阶段”
- `V2 -> V3` 已经真正实现切版
- V3->V4 的预热条件和切换条件已经能在看板上分开解释
- V4->V5 的回归已经证明后续阶段不会依赖 V2/V3 特例字段

问题：

- 更后面的 V4-V8 模板还没补齐
- preheat / cutover 的自动衔接还需要继续打磨

## 7. 真实踩坑清单

下面是这次项目里最值得保留的过程资产。

### 7.1 顶层定位类问题

| 坑 | 当时表象 | 根因 | 修正 | 通用教训 |
| --- | --- | --- | --- | --- |
| 把网页产品当局内原型 | 页面打开直接进局，菜单/暂停/结算长期缺席 | 顶层规划只盯局内 loop | 重写页面版总规划，引入产品壳层主线 | 任何网页游戏/工具项目，都要先定义完整用户会话 |
| 把“前 5 分钟认真对待它”当整个项目北极星 | 阶段完成度和长期完成度混在一起 | 目标层级没有拆开 | 分成长远愿景、当前北极星、版本路线 | 北极星不能同时承担阶段度量和终局定义 |
| 把 `M2-M7` 当用户看得懂的主里程碑 | 用户只能看到很多内部标签 | 施工标签替代了产品标签 | 切成 `V0-V9` 主路线，`M2-M7` 留给内部证据 | 内部验证编号不能直接当产品路线图 |

### 7.2 协作机制类问题

| 坑 | 当时表象 | 根因 | 修正 | 通用教训 |
| --- | --- | --- | --- | --- |
| 以为聊天窗口能持续后台工作 | 页面停在回复后不再动 | 聊天 UI 不是 daemon | 用 tmux watch / companion 承担后台作业 | 会话 UI 和后台 worker 必须分离 |
| 以为 watch 进程在，就说明有人在干活 | 右上角显示 running，但 terminal 已空转 | runtime 存活不等于 job 存活 | 引入 companion job truth | 监控要看 job，不只看 session |
| Codex 和 GLM 没有严格不对称 | 两边都可能碰同一块逻辑 | 分工只写原则，没写 ownership | 用 queue、task card、review 机制收紧 | 双 AI 不是对等平分，而是主次分工 |

### 7.3 任务系统类问题

| 坑 | 当时表象 | 根因 | 修正 | 通用教训 |
| --- | --- | --- | --- | --- |
| source of truth 不唯一 | queue、runway、task card 三处状态打架 | 状态和范围混写 | 规定 live queue 只管状态，task card 只管边界 | 状态真值必须单一 |
| fake ready | 队首写 `ready`，实际上还依赖前置批准 | `ready` 被当成“下一步看起来合理” | 收紧状态词，只允许真可派发任务标 `ready` | `ready` 语义必须非常贵 |
| 没有 queue floor | GLM 或 Codex 一收工就没下一条 | closeout 前没人负责补货 | 规定 lane floor，并把 refill 变成系统动作 | 连续运行不是速度问题，是补货问题 |
| 只靠动态补任务，没有 master backlog | 容易围着眼前 bug 打转 | 缺少顶层能力总表 | 采用 master backlog + runway + live queue 混合制 | 没有全局 backlog，动态调度会失焦 |

### 7.4 自动派发与 token 消耗类问题

| 坑 | 当时表象 | 根因 | 修正 | 通用教训 |
| --- | --- | --- | --- | --- |
| 只有一边 lane 有自动续派 | GLM finish 后掉进空队列，Codex 也会空转 | feed 不对称 | 补 lane feed 与双边 queue 机制 | 双泳道必须双边闭环 |
| synthesis 重复派发，浪费 token | 同一轮候选生成被反复触发 | 只防“正在跑”，没防“刚跑过” | 增加 same-title freeze 和 recent synthesis freeze | 自动派发系统必须防重复发同题 |
| `running + completedAt` 脏状态污染续派 | 系统以为任务还在跑或误判 | job 状态恢复逻辑不完整 | companion / synthesis 里补脏状态恢复 | 作业系统要优先修状态一致性，再做智能调度 |

### 7.5 阶段切换类问题

| 坑 | 当时表象 | 根因 | 修正 | 通用教训 |
| --- | --- | --- | --- | --- |
| `cutover-ready` 了却没切版本 | 看起来该进 V3，实际还在 V2 | 只有判定器，没有执行器 | 增加 `version-cutover.mjs` 与 runtime state | “能切”与“真的切了”必须分层 |
| 当前版一结束就想直接进入后后版 | 容易从 V2 直接讨论到 V4/V5 | 缺少单步切换规则 | 明确 `N -> N+1` 一次只走一步 | 版本切换必须是一阶状态机 |
| `user-open` 被当成阻塞项 | 工程已闭，但系统还等人拍板 | 把异步判断和工程 blocker 混了 | 规定 `user-open` 不阻塞版本推进 | 人类判断要异步挂接，不应拖停工程 |
| V2/V3 字段被写进解析器 | 后续 V4/V5 可能读不到 `当前 V4 结论` | 把历史版本当成规则 | 改成识别任意 `当前 V数字 结论`，并补 V4/V5 回归 | 版本号只能是数据，不能成为程序分支的默认假设 |
| prompt 示例残留旧版本 | 任务生成可能继续围绕 V2/V3 说话 | 示例文本没有跟 runtime state 绑定 | synthesis / preheat prompt 改为动态写入当前 milestone 和 transition | 自动生成任务时，示例也是规则的一部分 |

### 7.6 监控和可视化类问题

| 坑 | 当时表象 | 根因 | 修正 | 通用教训 |
| --- | --- | --- | --- | --- |
| board 和真实版本状态不一致 | 仓库已切 V3，页面还写 V2 | 看板读旧常量，不读 runtime state | 改成从 milestone oracle / transition report 生成 | 面板必须读系统真值，不读历史文案 |
| 页面文案太工程化 | “门禁”“壳层”等词用户不知所云 | 工程术语直接上板 | 改成人话描述当前阻塞和阶段 | 用户面板和工程文档不是一套语言 |
| “最近收口”忽隐忽现 | 刷新后历史完成项丢失 | closeout 聚合和去重不稳定 | 限定条数、统一时间戳、去重规则 | 监控页面要稳定，不能让用户猜 |

### 7.7 资源治理类问题

| 坑 | 当时表象 | 根因 | 修正 | 通用教训 |
| --- | --- | --- | --- | --- |
| node 进程堆积、内存和电量暴涨 | 电脑卡、风扇响、电量掉很快 | daemon 太多、没有控制总量 | 收缩常驻进程，尽量一个系统只保留一条主链路 | 自动化是成本中心，不是免费能力 |
| runtime lock / 浏览器残留 | 两个代理互相抢 runtime，测试混乱 | 锁和清理逻辑太脆弱 | 补 runtime lock hardening 和 cleanup 规则 | 长跑型测试必须先解决资源互斥 |

## 8. 到今天为止，已经标准化下来的原则

这些不是临时口头约定，而是已经值得固化的规则。

### 8.1 一个真实主里程碑

任何时刻只允许有一个用户看得懂的真实主里程碑。

内部可以有很多：

- gate
- packet
- closeout
- regression pack

但对外只能有一个主问题：

```text
当前产品到底在收哪一版。
```

### 8.2 任务系统必须是四层，不是两层

最小可用结构必须同时存在：

1. master backlog
2. runway
3. live queue
4. task card

少一层，系统就会失真。

### 8.3 自动派发要建立在状态一致性之上

自动派发的前提不是“更聪明”，而是：

- job 状态靠谱
- queue 状态靠谱
- 同题冻结靠谱
- cooldown 靠谱

### 8.4 版本切换必须有机器真值

不能再靠：

- 某个 md 里写了新的 milestone
- 某次聊天说“现在算 V3 了”

必须有：

- runtime state
- current oracle
- transition report
- cutover executor

### 8.5 人的判断必须异步接入

这次一个很重要的修正是：

```text
用户判断很重要，
但不能把工程推进建立在用户随时在线之上。
```

所以：

- human approval 仍保留
- 但 user-open 不再阻塞主线
- 它变成异步插入的 judgment layer

## 9. 现在仍然没有完全解决的问题

复盘不能只写“已经很好了”。下面这些还是真风险。

### 9.1 board 还不是纯 job truth

现在 board 已经比早期可靠很多，但仍然是混合来源：

- queue docs
- monitor json
- companion state
- terminal capture

理想状态应是：

```text
job truth > runtime monitor > queue docs > terminal interpretation
```

现在还没完全走到这一步。

### 9.2 companion 还不是唯一派发入口

目前 companion 已经能承担作业系统，但还没有完全取代旧的 watch / queue 入口。

这意味着：

- 仍有双轨并存
- 某些状态需要桥接

### 9.3 V4-V8 的模板还没补完整

V2 -> V3 的版本切换体系已经落地，但后面的模板更多还是协议级设计，不是完整落地。

不过这次已经补上了一个关键防线：  
后续模板可以自然使用 `当前 V4 结论`、`当前 V5 结论` 这类字段，解析器会按 `当前 Vn 结论` 统一读取，不会再因为 V2/V3 特例造成 blocker 误判。

剩余风险不再是“系统只认 V2/V3”，而是：

- V4-V8 每个版本自己的 gate 质量要足够好
- transition pack 要在当前版本只剩 1 个以内工程 blocker 时自动预热
- 切版后 queue refill 必须从新版本 runway 补货

### 9.4 人眼验证仍然是瓶颈

尤其是：

- 第一眼战场可读性
- 主菜单质量
- 产品理解度

这类问题不能纯靠工程绿灯替代。

### 9.5 文档数量已经很大

现在体系化的代价是文档变多。

这解决了“状态不落地”的问题，但也带来另一个风险：

```text
如果没有索引和优先级规则，文档本身会变成新的噪音源。
```

## 10. 这套经验怎么复用到下一个中型项目

如果以后要在别的项目上复用，我会建议开局就按下面这套做。

### 10.1 开局先定义五个母件

1. 完整产品定义
2. 能力总表
3. 版本路线图
4. operating model
5. 双 lane live queue

### 10.2 不要太晚才补产品壳层

任何网页产品，只要最终用户不是开发者自己，就必须尽早定义：

- 前门
- 入口
- 会话
- 结算
- 返回

### 10.3 不要把“监控页面”误当“执行系统”

监控页面只是观察层。真正的执行系统应该是：

- queue
- job
- feed
- runtime
- closeout

### 10.4 双 AI 项目最难的不是并行，是补货

表面上看，双 AI 最大问题像是：

- 冲突
- 审核
- 上下文

但实际中最容易把系统搞死的是：

```text
任务断供。
```

所以中型项目要优先把补货和地板做成系统。

### 10.5 版本切换必须先标准化，再自动化

如果连：

- 当前版收口条件
- 下一版模板
- 切版动作

都没定义清楚，就不要急着做自动切版。

标准化至少要包含下面七件事：

1. 当前版本的 remaining gates
2. 当前版本的 evidence ledger
3. 下一版本的 handoff contract
4. 下一版本的 transition artifacts
5. 预热触发阈值
6. 单步 cutover 执行器
7. 切版后 queue refill 的新版本 runway

自动化只负责消费这些结构，不能靠模型临场猜“下一阶段是不是该开始了”。

### 10.6 每一次过程问题都必须进台账

聊天里解释过，不等于项目吸收了教训。

以后凡是出现下面任何一种情况，都必须同步写入：

- `docs/DUAL_LANE_ISSUE_LOG.zh-CN.md`

必须记录的情况包括：

- 任务断供
- fake running
- 重复派发或重复生成任务
- closeout 误判
- 看板状态和真实状态不一致
- 资源暴涨、进程堆积、电量异常
- 版本切换误判
- 用户无法从页面判断真实进展

这条规则的目的不是写更多文档，而是防止同一类系统问题反复用聊天解释、反复烧 token。

## 11. 明天对齐时最值得讨论的 8 个问题

1. 你是否认同：这个仓库已经不仅是 War3 产品项目，也是双 AI 中型项目方法论项目？
2. 你是否认同：未来所有阶段都应该继续按 `V0-V9` 主版本线，而不是回到 `M2-M7` 用户视角？
3. 你是否认同：`user-open` 应永远作为异步判断，不再阻塞工程主线？
4. 你是否认同：board 最终应完全收敛到 companion job truth？
5. 你是否认同：以后所有自动派发都必须经过 queue floor + same-title freeze + cooldown？
6. 你是否认同：产品壳层要持续与局内主线并行，而不是再次被当成后期包装？
7. 你是否认同：V4-V8 应继续按同一套 transition pack 模板推进？
8. 你是否认同：这份复盘应该升格成以后所有双 AI 中型项目的起手模板？

## 12. 一句话总复盘

这次项目最大的收获，不是我们已经做出了多少 War3 内容，而是我们终于把下面这件事做成了仓库内的真实对象：

```text
让一个双 AI 系统，围绕同一个共享代码库、
同一个真实版本、同一个 live queue、同一套切换协议，
持续推进一个中型产品。
```

这件事现在还没有最终完成，但已经不再只是聊天里的设想。
