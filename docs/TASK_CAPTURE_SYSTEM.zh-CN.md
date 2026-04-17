# 双泳道任务捕获系统

> 目的：解决 “Codex / GLM 任务为什么会断供” 这个系统问题。  
> 这份文档定义以后任务从哪里来、怎么分层、什么叫真 ready、什么时候必须补货。

## 1. 先定结论

推荐采用 **混合制**，不是二选一：

1. **完整主清单**：从顶层 capability / roadmap 往下拆，形成覆盖全项目的大任务库。
2. **动态 live queue**：根据当前代码状态、closeout、用户反馈、失败验证，实时重排真正可派发的任务。

只做完整主清单，会很快变成静态墓地。  
只做动态队列，又会失去全局覆盖，永远围着眼前 bug 打转。

所以正确结构是：

```text
Master Backlog（全量）
    ↓ 选 trunk / capability
Lane Runway（某一阶段/某一干线）
    ↓ 选当前可派发任务
Live Queue（真实 dispatch 源）
    ↓ 自动派发
Watch Feed / Companion
```

## 2. 现有系统为什么会断供

不是因为某个 worker 停了，而是因为以前同时存在 4 个问题：

1. **source of truth 不唯一**
   - 顶部 live queue 一套状态
   - 后面的 task card 又是一套状态
   - runway doc 还是另一套状态

2. **fake ready**
   - 某些任务写成 `ready`
   - 但备注里其实已经说明它依赖 asset approval / human decision
   - 这类任务不应该出现在 dispatch 队首

3. **feed 不对称**
   - Codex 有自动续派
   - GLM 之前没有

4. **没有 queue floor**
   - 没有人负责在 closeout 前确认“下一批至少还有 3 条真 ready”

## 3. 以后任务系统的四层结构

### L0. Master Backlog

这是全项目总表，来自：

- `WAR3_MASTER_CAPABILITY_PROGRAM.zh-CN.md`
- `WAR3_PAGE_PRODUCT_MASTER_PLAN.zh-CN.md`
- `PROJECT_MASTER_ROADMAP.zh-CN.md`
- `WAR3_ENDSTATE_GAP_ATLAS.zh-CN.md`

它回答的是：

- 我们和 War3 整体还差什么
- 每个大能力属于哪个阶段
- 哪些角色 / 泳道对它负责

它不是拿来直接派发的。

### L1. Lane Runway

这是某个 trunk 当前阶段的中程跑道。

例如：

- GLM Stage-A Shell Runway
- GLM Stage-B Front-Door Runway
- Codex Owner Runway

它回答的是：

- 当前这一条 trunk 下一段最稳的顺序是什么
- 哪几条 branch 值得先开
- 哪些事虽然重要，但现在不该碰

### L2. Live Queue

这是唯一允许 feed 直接读取并 dispatch 的层。

规则：

- **只认顶部 `Current queue state` 表**
- `ready` 必须等于 **可立即派发**
- `blocked` 绝不能排在 `ready` 前面伪装成可派发
- `in_progress` 最多一条

一句话：

```text
runway 是候选池，live queue 才是喂给 worker 的真料斗。
```

### L3. Task Card

task card 不再承担 live status 真值，它只负责：

- 目标
- allowed files
- forbidden files
- verification
- stop condition
- follow-up

也就是说：

- **状态看 live queue**
- **边界看 task card**

## 4. 状态词必须收紧

以后建议只保留下面几类：

| 状态 | 含义 | 是否可直接派发 |
| --- | --- | --- |
| `ready` | 已成型、无前置阻塞、可立即派发 | 是 |
| `in_progress` | 当前正在执行 | 否 |
| `blocked` | 需要前置依赖 / 资产批准 / 人工判断 | 否 |
| `completed` | 已完成且证据已验 | 否 |
| `failed` | 已尝试但 closeout 不成立 | 否 |
| `superseded` | 被其他任务覆盖 | 否 |
| `captured` | 新捕获、未成型、未入 live queue | 否 |

重点：

- `ready` 不能再写成“理论上下一步很合理，但现在还差一个前置”。
- 那种任务就是 `blocked`。

## 5. 任务捕获入口

以后新任务不应该只来自“我突然想到一个下一步”。

至少有 5 个固定入口：

1. **用户反馈**
   - 新需求
   - 新痛点
   - 新方向纠偏

2. **closeout residuals**
   - 完成任务时明确写出的 remaining unknowns / follow-up

3. **失败验证**
   - build/typecheck/runtime/CI 失败直接生成候选任务

4. **review rejection**
   - Codex 拒收 GLM closeout 时，把拒收原因落成新的更小任务

5. **queue floor 触发**
   - 当 lane 的真 ready 数量低于地板时，系统必须主动补货

## 6. Queue Floor

这是这次最关键的修复点。

### GLM floor

- `1` 条 `in_progress`
- `3` 条以上真 `ready`

实现语义要写清楚：

- 如果 lane 当前已经有 `in_progress`，那就维持 `3` 条 `ready`
- 如果 lane 当前是空闲、下一次 check 会立刻 dispatch 一条，那么 refill 目标必须是 `4` 条 `ready`
- 否则一派发就只剩 `2` 条 `ready`，这是假地板，不是真连续供给

如果低于 3：

- Codex 不能说“GLM 先等等”
- 必须先补任务，再接受当前 closeout 为系统健康

### Codex floor

- `1-3` 条 active trunk
- `3` 条以上真 `ready`

同理：

- lane 空闲时，refill 要先补到 `4` 条 `ready`
- dispatch 第一条后，才会回到 `1 active + 3 ready`

如果低于 3：

- 说明 Codex 也在吃老本
- 必须从 master backlog / current residuals 里补货

## 7. 自动续派应该怎么做

正确顺序：

1. 看 active companion job 是否存在
2. 不存在时，读 live queue 顶表
3. 找第一条 `ready`
4. 用对应 task card 作为 prompt scope
5. dispatch
6. 记录这次 queue checksum + task title
7. 如果 queue 没更新，就不重复派同一条

补一条实现细则：

- 如果上一轮刚刚把同一条 task dispatch 出去，但 companion 还没来得及回报 `running`，feed 进入短暂确认窗口，只做 queue sync / refill，不重复派发同一标题。

这也是为什么 feed 不该用硬编码任务列表做长期主机制。

硬编码可以做 bootstrap。  
长期正确机制必须是：

```text
queue row 选任务
task card 给范围
feed 只负责派发
```

## 8. 对 Codex 和 GLM 的区别

### GLM

更适合：

- bounded implementation
- deterministic proof
- small file ownership

所以 GLM live queue 应更严格，宁可少，也不能假 ready。

### Codex

更适合：

- trunk shaping
- queue refill
- review / rejection / acceptance
- cross-cutting integration

所以 Codex 的任务捕获除了 implementation，还应包含：

- queue sync
- closeout review
- runway publication
- sourcing governance
- acceptance packets

### 当前 shell trunk 的邻接补货规则

当前 Product Shell / Session Trunk 的 queue refill 不能再从泛 backlog 或聊天记忆里猜下一步。

专用规则文档是：

- `docs/SHELL_ADJACENT_TASK_FEED_MAP.zh-CN.md`

当 Codex 或 GLM 完成 shell 相关 slice 后，refill 必须先按这份 feed map 判断：

1. 下一步是否仍有 source-of-truth neighbor 支撑的 shell task。
2. 完成的 GLM slice 应分支到 implementation、acceptance、routing、integration 还是 user gate。
3. shell 下一步是否需要用户产品判断；如果需要，只能生成 blocked gate/evidence task。
4. shell 没有安全 ready 时，是否可以转到 battlefield readability / asset handoff 邻近任务。
5. 候选是否符合自动 live-queue promotion 的形状和必填字段。

如果候选不符合这些条件，就写入 captured inbox；不能为了维持 queue floor 把它标成 `ready`。

### shell runway 被吃空之后怎么办

以前的根因是：

```text
queue refill 只会读有限的 runway task 列表；
runway 一旦被连续 dispatch 到头，feed 进程还活着，但 live queue 会直接断粮。
```

现在补货顺序必须是：

```text
live queue
  -> adjacent runway tasks
  -> model-generated structured candidates
  -> current milestone truth (V2 gate ledger / remaining gates) as bootstrap only
  -> captured inbox
```

也就是说：

- 先吃当前 trunk 已写好的相邻 runway。
- 如果有限 runway 已经耗尽，就不能停在 `queue_empty`。
- 先让 Codex 侧的 task synthesis 按当前 open gate 生成结构化候选。
- 只有 synthesis 还没有候选，才允许用 milestone truth bootstrap 一批保守任务，避免 lane 断粮。
- 只有 gate truth 也无法安全 promotion 时，才写入 captured inbox 或 blocked gate。

当前 V2 主线的 fallback source of truth 是：

- `docs/V2_PAGE_PRODUCT_EVIDENCE_LEDGER.zh-CN.md`
- `docs/V2_PAGE_PRODUCT_REMAINING_GATES.zh-CN.md`

它们不是 backlog 墓地，而是“当前真实 blocker 还剩什么”的 authoritative surface。

## 9. 具体推荐方案

推荐以后固定按这套走：

### 方案 A：完整主清单

保持一份全量能力库，回答“项目最终还缺什么”。

作用：

- 防止只围绕当前阶段打转
- 防止英雄、菜单、资产、设置这类顶层缺口消失在局部任务里

### 方案 B：动态 live queue

每条 lane 都有一份顶表，只放：

- 当前 `in_progress`
- 接下来的 `ready`
- 当前 `blocked`

作用：

- 让自动续派读取的是准生产任务，不是长文档墓地

### 方案 C：Captured Inbox

建议后续补一个统一入口文档或结构化文件，专门存：

- 新捕获但未成型的任务
- closeout residuals
- 用户新反馈
- CI/测试失败项

它不直接 dispatch，但会在 queue floor 触发时成为补货来源。

## 10. 里程碑有限，任务不有限

系统必须先把“什么叫到里程碑”写死，才能允许任务自动继续长。

正确关系是：

```text
milestone gate 是终点边界
task 是逼近 gate 的手段
```

所以：

- 任务可以继续分解、补强、重排。
- 里程碑不能靠“任务都做完了”判定。
- 里程碑只能靠 blocker gate 是否被关闭判定。

当前仓库里，`V2` 的 gate source of truth 是：

- `docs/V2_PAGE_PRODUCT_REMAINING_GATES.zh-CN.md`
- `docs/V2_PAGE_PRODUCT_EVIDENCE_LEDGER.zh-CN.md`

现在新增的自动收口层是：

- `scripts/milestone-oracle.mjs`

它负责回答：

1. 当前真实 milestone 是什么
2. 哪些 gate 还是 engineering blocker
3. 哪些 conditional gate 仍处于 visible/open 态
4. engineering closeout 是否已经 ready
5. 哪些 user gate 仍待用户判断

一句话：

```text
任务可以长；里程碑只能由 oracle 说了算。
```

## 11. 自动化责任分层

现在要强制分成 3 层，而不是让一个脚本同时决定终点、发明任务、派发任务：

### A. Milestone Oracle

负责：

- 读取当前里程碑 gate
- 判断 blocker 是否还开着
- 判断 current milestone 是否 engineering-ready

不负责：

- 发明任务
- 改 live queue
- 代替用户关闭 user gate

### B. Task Synthesis

负责：

- 基于 open gate、queue 状态、现有 trunk 任务，生成结构化候选
- 每条候选必须带 `milestone / gate / proofTarget / stopCondition`
- 候选写入统一文件，等待 queue guard 验证

不负责：

- 直接改 live queue
- 绕过当前 milestone 扩 scope
- 用 polish 任务冒充 blocker work

### C. Queue Guard / Lane Feed

负责：

- runway 优先
- synthesis 候选晋升
- fallback bootstrap
- 去重、锁、queue floor、dispatch

不负责：

- 自己定义“下一步应该是什么产品任务”

## 12. 当前实现状态

这套系统现在不是纸面方案了，已经落到仓库里：

1. `scripts/queue-refill.mjs`
   - 读取 lane runway + live queue
   - 当真 `ready` 数量低于 floor 时，先补相邻 runway task
   - runway 之后优先读取 `docs/TASK_SYNTHESIS_CANDIDATES.json` 的结构化候选
   - 只有 synthesis 没有候选时，才从当前 milestone gate truth 自动 bootstrap 下一批任务
   - 对不能安全晋升的候选，自动写进 `docs/TASK_CAPTURE_INBOX.zh-CN.md`

2. `scripts/milestone-oracle.mjs`
   - 从 `V2_PAGE_PRODUCT_REMAINING_GATES` + `V2_PAGE_PRODUCT_EVIDENCE_LEDGER` 自动算出 open blocker / conditional gate
   - 把“当前里程碑是否已到 engineering closeout”从聊天记忆中拿出来，变成可执行判断

3. `scripts/task-synthesis.mjs`
   - 读取 oracle 结果和 live queue 状态
   - 当 lane 断粮时，尝试给 Codex companion 派发一个 task-synthesis job
   - task-synthesis job 只允许写 `docs/TASK_SYNTHESIS_CANDIDATES.json`
   - 候选必须是结构化任务，不允许直接改 queue

4. `scripts/lane-feed.mjs`
   - 每次续派前先做 `queue sync -> queue refill -> dispatch`
   - 先从 companion 最近任务状态把 live queue 顶表收口
   - 再补足 ready floor
   - live queue 真空时，不再只写 `queue_empty`，而会尝试触发一次 codex task synthesis
   - 同 lane 的 feed check 现在带有 lock，避免 daemon / 手动触发并发时重复派发同一条任务

5. `scripts/codex-watch-feed.sh` / `scripts/glm-watch-feed.sh`
   - 现在只是薄 wrapper
   - 真正业务逻辑都走 `scripts/lane-feed.mjs`
   - 这样 feed 可以做纯脚本测试，不再被 shell 分支绑死

6. `tests/queue-refill.spec.mjs` + `tests/lane-feed.spec.mjs` + `tests/milestone-oracle.spec.mjs`
   - 纯本地、无 tmux、无浏览器、无 runtime
   - 用临时仓库夹具验证两件事：
     - GLM lane 能从 runway 自动补到 ready floor，并生成 queue card
     - runway 被吃空时，两条 lane 仍能从当前 V2 gate truth 自动补货
     - synthesis 候选会优先于 deterministic fallback 被晋升
     - Codex lane 能自动补 row + card，不再依赖手写 prompt 映射
     - stale `in_progress` / `active` 能被真实 running job 或 completed job 自动收口
     - lane feed 能在 dry-run / stub-dispatch 下直接断言下一条会派什么，以及 lane 真空时会不会触发 task synthesis

所以现在“补货”不再只靠我人工记忆，最小闭环已经存在。

## 13. 这轮试跑暴露出的新问题

这轮已经在真仓库上触发过一次 Codex synthesis companion job。

说明：

- 自动触发链路已经真的连起来了，不是只在测试里成立。
- 但当前 synthesis prompt 仍然偏宽，companion progress 里已经暴露出“搜索太散、终端噪音偏大”的问题。

所以当前结论不是“任务生成已经完美”，而是：

```text
自动化闭环已接上；
下一步要继续把 synthesis prompt 和 result parser 收紧。
```

## 14. 还没做完的部分

下一步仍然要继续补三类能力：

1. **synthesis 结果收口更强**
   - 现在 companion 已能被自动触发
   - 但 `docs/TASK_SYNTHESIS_CANDIDATES.json` 的 result parser、prompt 范围和 closeout收口仍需更强约束
   - 要避免模型把“看起来相关”的任务扩成下一里程碑

2. **失败验证自动捕获**
   - 现在已经能在 runway 耗尽后从 gate truth 续派
   - 但 runtime/build 失败还没有统一自动落成 synthesis candidate
   - 这一步会决定系统能不能从“真 blocker”里继续长任务，而不是只从文档状态长任务

3. **closeout -> queue sync 自动收口**
   - 现在 closeout 后还可能出现 queue 顶表没及时翻状态，但 worker 已经完成的错位
   - 这需要更强的 closeout parser 和 lane-specific doc sync

4. **captured task 的上游追踪**
   - 当前 inbox 已经能接住候选
   - 但还没有给每条 captured task 标上 master backlog / capability program 的稳定来源 ID

## 15. 一句话判断系统是否健康

如果一个 lane 完成 closeout 后，5 分钟内没有下一条真任务可派，那不是 worker 问题，是任务捕获系统失效。

## 16. 任务多维评分标准

这套评分不是为了写得好看，而是为了决定一条任务能不能进入 live queue。

先定硬门槛，再打分。

### 16.1 硬门槛

下面任一项不满足，直接不能进 `ready`：

1. 没有明确 `milestone`
2. 没有明确 `gate`
3. 没有明确 `goal`
4. 没有明确 `proofTarget`
5. 没有明确 `stopCondition`
6. 没有明确文件边界
   - Codex: `files`
   - GLM: `writeScope`
7. 没有明确验证方式
   - Codex: 至少有静态差异/文档校验
   - GLM: 至少有 build/typecheck/focused runtime 中的一组
8. 明显属于下一里程碑，而不是当前里程碑
9. 明显依赖 user gate / asset approval / 上游 closeout，却被伪装成 `ready`
10. 与当前同 lane 的 running task 明显重叠

不满足硬门槛的处理：

- 还能补全的：`captured`
- 依赖没到位的：`blocked`
- 明显不该做的：`rejected`

### 16.2 五维评分

每维 `0-5` 分，总分 `25`。

#### A. 里程碑对齐度

问题：这条任务是不是直接逼近当前 open gate？

| 分数 | 标准 |
| --- | --- |
| `5` | 直接对应当前 open gate，且 proof 路径清楚 |
| `4` | 明显服务当前 gate，但还带少量支撑性工作 |
| `3` | 与当前里程碑有关，但不是直接 closing task |
| `2` | 更像相邻优化，不是当前 gate 压力点 |
| `1` | 只沾边，随时可以后移 |
| `0` | 明显属于下一里程碑或无关工作 |

#### B. 边界清晰度

问题：这条任务有没有清晰的起止边界？

| 分数 | 标准 |
| --- | --- |
| `5` | 目标、文件、停点都清楚，做完/没做完一眼可判 |
| `4` | 边界基本清楚，只有少量实现自由度 |
| `3` | 大方向清楚，但停点略虚 |
| `2` | 容易越做越大 |
| `1` | 基本是主题，不是任务 |
| `0` | 完全没有边界 |

#### C. 可验证性

问题：做完之后能不能客观证明？

| 分数 | 标准 |
| --- | --- |
| `5` | 有明确命令、明确 spec、明确通过条件 |
| `4` | 有验证方法，但还需要少量人工判断 |
| `3` | 能验证大部分，仍留明显灰区 |
| `2` | 更多依赖主观描述 |
| `1` | 很难证明完成 |
| `0` | 几乎不可验证 |

#### D. 依赖成熟度

问题：这条任务现在是不是就能开做？

| 分数 | 标准 |
| --- | --- |
| `5` | 当前可立即执行，无前置依赖 |
| `4` | 只有轻微依赖，基本不阻塞 |
| `3` | 有依赖，但短期可解 |
| `2` | 强依赖未满足 |
| `1` | 基本处于等待态 |
| `0` | 依赖完全不存在，不能做 |

#### E. 泳道适配度

问题：这条任务是否适合当前 lane 的 worker？

| 分数 | 标准 |
| --- | --- |
| `5` | 完全符合当前 lane 能力边界 |
| `4` | 基本合适，只有少量跨界 |
| `3` | 能做，但不是最佳 owner |
| `2` | 容易和另一 lane 撞车 |
| `1` | owner 明显不对 |
| `0` | 根本不该派给这个 lane |

### 16.3 分数如何落状态

| 总分 | 结论 | 状态 |
| --- | --- | --- |
| `22-25` | 高质量，可立即进入 live queue | `ready` |
| `18-21` | 基本成立，但还要补一处边界/验证/依赖说明 | `captured` |
| `14-17` | 方向可能对，但还不能直接派发 | `blocked` |
| `<14` | 不该进入当前阶段执行 | `rejected` |

附加规则：

- 只要硬门槛不通过，再高分也不能进 `ready`
- `A` 里程碑对齐度低于 `4`，不能进 `ready`
- `C` 可验证性低于 `4`，不能进 `ready`
- `D` 依赖成熟度低于 `4`，不能进 `ready`
- `E` 泳道适配度低于 `4`，默认不能进 `ready`

### 16.4 系统里的真实用法

这套评分要用在 3 个地方：

1. `task-synthesis` 产出候选之后
   - 先过硬门槛
   - 再看是否达到 `ready`

2. `queue-refill` 准备把候选晋升进 live queue 时
   - 低分任务不能为了补 floor 被硬塞成 `ready`

3. `lane-feed` 真正 dispatch 前
   - 如果任务虽然在表里，但边界/验证明显退化，应该降回 `captured` 或 `blocked`

### 16.5 一句话原则

任务数量可以自动补；
但只有高分、硬门槛通过、且直接逼近当前 gate 的任务，才有资格进 `ready`。

### 16.6 里程碑收口冻结规则

任务生成不是无限增长。

只要 `scripts/milestone-oracle.mjs` 判断：

- blocker gate 清零
- conditional engineering gate 清零
- `engineeringCloseoutReady = true`

当前里程碑就进入**自动冻结**：

1. `queue-refill` 不再把新任务晋升进 live queue
2. `task-synthesis` 不再为这个里程碑继续生新候选
3. `lane-feed` 如果发现 live queue 为空，也不会再补“下一批”，而是明确报告里程碑已到 engineering closeout
4. 如果当前 transition 已经 `cutover-ready`，Codex lane 会调用 `scripts/version-cutover.mjs` 做单步切换：更新 `docs/VERSION_RUNTIME_STATE.json`、清理旧版本 live queue 非终态任务、按新版本 runway 播种新 queue

一句话：

```text
open engineering gates 清零，就是当前里程碑停止继续长任务的时点。
```

补充：

- 版本预热、cutover、模板齐备度和未来 `V3 -> V8` 的统一规则，见 `docs/VERSION_TRANSITION_PROTOCOL.zh-CN.md`
- 机器可读的切换入口，见 `docs/VERSION_TRANSITIONS.json`
- `scripts/version-preheat-runner.mjs` 会在 `preheat-due` 时生成 `docs/VERSION_PREHEAT_CANDIDATES.json`，但这些候选目前还不直接进入 live queue
