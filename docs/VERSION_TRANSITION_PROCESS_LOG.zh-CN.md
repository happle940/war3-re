# 版本切换过程问题记录

> 用途：记录版本切换体系在设计和落地过程中的关键问题、澄清和结论。  
> 这份文档不代替协议；它保留“我们为什么这样设计”的过程证据，避免后续再次靠聊天回忆。

## 使用规则

- 每条记录都回答一个真实过程问题。
- 先写问题，再写结论，再写对系统的影响。
- 如果结论已经落进代码或协议，必须给出对应文件。
- 不在这里做版本切换批准；这里只记录过程澄清。

---

## 2026-04-14 过程问题

### 01. `preheat-due` 是谁触发的？

**问题**

`tests/version-transition-orchestrator.spec.mjs` 里出现了 `preheat-due`，那到底是谁在真正触发预热？

**结论**

当前系统里，`preheat-due` 先被 **算出来**；现在已经有独立的 **preheat runner**，但它还没有接进自动调度。

- `scripts/milestone-oracle.mjs` 负责给出当前版本工程真相
- `scripts/version-transition-orchestrator.mjs` 负责根据真相和模板齐备度判断状态
- `scripts/version-preheat-runner.mjs` 已经能消费 `preheatInput + handoffContract`
- 它会生成下一版模板候选，但还不会自动激活下一版

所以现在的真实情况是：

```text
orchestrator 是判定器，不是执行器。
```

**影响**

- 不能把“已经能判断 preheat”误写成“已经自动预热”
- 后续要决定由谁、在什么频率调用 preheat runner

**落点**

- `scripts/version-transition-orchestrator.mjs`
- `scripts/version-preheat-runner.mjs`
- `docs/VERSION_TRANSITION_PROTOCOL.zh-CN.md`

### 02. 预热只看 blocker 数量吗？

**问题**

如果系统只知道“还剩 1 个 blocker”，那自动预热是不是会失焦？

**结论**

是，所以预热不能只看数量。

阈值只负责回答：

```text
现在该不该开始预热
```

但真正的预热输入必须带上当前版本 oracle 快照：

- `blockerGatesOpen`
- `conditionalGatesOpen`
- `userDecisionPending`

也就是说，系统不能只知道“剩 1 个”，还必须知道“这 1 个是谁”。

**影响**

orchestrator 的输出已经补成：

- `oracleSnapshot`
- `preheatInput`

以后 preheat runner 不需要再自己反查一遍当前 blocker 明细。

**落点**

- `scripts/version-transition-orchestrator.mjs`
- `tests/version-transition-orchestrator.spec.mjs`
- `docs/VERSION_TRANSITION_PROTOCOL.zh-CN.md`

### 03. `V2 -> V3` 传什么，`V3 -> V4` 又传什么？

**问题**

下一版本到底接什么，是否只是“上一版没做完的都扔过去”？

**结论**

不是。通用 handoff 结构必须明确回答 6 个问题：

1. `northStar`
2. `fromVersionOutcome`
3. `toVersionFocus`
4. `mustStayInFromVersion`
5. `allowedCarryover`
6. `residualRouting`
7. `netNewBlockers`

换句话说，版本切换不是“把尾巴甩给下一版”，而是：

```text
上一版交付了什么
+ 哪些残留允许带过去
+ 下一版新增必须关闭的能力
= 下一版真正的 blocker 结构
```

**影响**

`docs/VERSION_TRANSITIONS.json` 现在不再只是阈值和文件路径表，而是每个版本切换都有 handoff contract。

**落点**

- `docs/VERSION_TRANSITIONS.json`
- `docs/VERSION_TRANSITION_PROTOCOL.zh-CN.md`

### 04. 下一版本 blocker 是怎么搞出来的？

**问题**

block 是不是拍脑袋定的，还是基于大目标和上一版本结果？

**结论**

下一版本 blocker 的统一推导公式是：

```text
N+1 的 blocker
= 北极星在这一版要兑现的 capability slice
+ N 版本 closeout 后必须继续接住的 residual / user-open
+ N+1 自己新增、且不关闭就不能宣称本版达成的能力
```

所以 blocker 的来源有三层：

1. 顶层目标
2. 上一版本真正交付的结果
3. 上一版本带入的残留及其路由

**影响**

后面如果要自动生成下一版模板或任务，不能只读 gate 编号，还必须读：

- `handoffContract`
- `preheatInput`

**落点**

- `docs/VERSION_TRANSITION_PROTOCOL.zh-CN.md`
- `docs/VERSION_TRANSITIONS.json`
- `scripts/version-transition-orchestrator.mjs`

### 05. 当前 `V3` 到底是什么状态？

**问题**

既然 V3 的文档和跑道都已经补了，那现在是不是已经进入 V3？

**结论**

不是。

当前真实状态是：

- `V3` 的 transition pack 已准备
- `V2 -> V3` 当前处于 `preheated-awaiting-closeout`
- `BF1` 仍是 `V2` 最后一个工程 blocker

所以：

```text
V3 已预热，但还不是 active milestone。
```

**影响**

- 后续不能把当前阶段写成“已经进入 V3”
- 所有自动化都必须先尊重 `milestone-oracle` 的当前工程真相

**落点**

- `scripts/milestone-oracle.mjs`
- `scripts/version-transition-orchestrator.mjs`
- `docs/V3_TRANSITION_BOOTSTRAP_PACKET.zh-CN.md`

### 06. 现在的 `preheat runner` 到底做了什么？

**问题**

既然已经补了 `preheat runner`，那它是不是已经会自动把下一版任务推进到 live queue？

**结论**

还没有。

当前 `scripts/version-preheat-runner.mjs` 只负责：

1. 读取当前 transition report
2. 读取 `preheatInput`
3. 读取 `handoffContract`
4. 在状态是 `preheat-due` 时生成一份结构化候选：
   - `docs/VERSION_PREHEAT_CANDIDATES.json`

它不负责：

- 激活下一版本
- 改写当前 live queue
- 把下一版任务混进当前版本任务池

所以它现在的角色是：

```text
next-version template candidate generator
```

不是：

```text
next-version activator
```

**影响**

- 现在已经有了独立的 preheat 执行层
- 它仍然不是 cutover executor
- 下一版真正激活，要交给单独的版本切换执行器处理

**落点**

- `scripts/version-preheat-runner.mjs`
- `tests/version-preheat-runner.spec.mjs`

### 07. 为什么之前已经 `cutover-ready`，却还停在 V2？

**问题**

既然 orchestrator 已经说 `V2 -> V3` 是 `cutover-ready`，为什么系统没有自己进入 V3？

**结论**

因为之前只做了“判定器”，没做“执行器”。

- `scripts/version-transition-orchestrator.mjs` 只能回答“现在能不能切”
- 但它不会真的去改当前 active milestone
- 也不会清旧 live queue、播种 V3 queue

所以旧系统会停在：

```text
可以切了
但还没人去按下切换按钮
```

现在新增的角色是：

- `docs/VERSION_RUNTIME_STATE.json`
- `scripts/version-cutover.mjs`

前者记录当前 active milestone，后者负责真的执行单步切换。

**影响**

- 以后 `cutover-ready` 不再只是一个静态状态
- Codex lane 可以把它消费成真正的 `cutover-done`

**落点**

- `scripts/version-cutover.mjs`
- `tests/version-cutover.spec.mjs`
- `docs/VERSION_TRANSITION_PROTOCOL.zh-CN.md`

### 08. 为什么切到 V3 后，不能顺手再自动进 V4？

**问题**

如果把自动切版本做成“只要 ready 就一路往前跳”，那是不是会出现刚进 V3 又直接进 V4？

**结论**

不能这样做，系统现在明确只允许：

```text
当前 active milestone -> 下一 milestone
```

也就是一次只切一步。

切换时会把 runtime state 从：

- `fromMilestone`

改成：

- `toMilestone`

然后下一次 orchestrator 再重新基于**新版本自己的 gate 文档**判断状态。

所以：

- `V2 -> V3` 切完后
- 当前 active milestone 就变成 `V3`
- 下一轮即使看见 `V3_TO_V4`
- 也必须先满足 V3 自己的 engineering closeout
- 才可能再次进入 `cutover-ready`

不会发生“同一次切换直接连跳两级”。

**影响**

- 版本自动化变成真正的状态机，而不是 while-loop
- 用户担心的“刚进 V3 又被自动推到 V4”被硬规则阻断

**落点**

- `scripts/version-cutover.mjs`
- `tests/version-cutover.spec.mjs`

## 下一步过程问题

下面这些问题还没有彻底落成自动化，后续继续记录：

- `preheat runner` 由谁执行、多久执行一次
- `docs/VERSION_PREHEAT_CANDIDATES.json` 何时允许晋升成真实 Codex 任务
- 用户异步判断如何被带入下一版而不阻塞推进

### 09. V3 之后的模板字段不能再写死 V2/V3

**问题**

V2->V3 跑通后，继续检查 V3->V4、V4->V5 时发现一个隐藏风险：gate 文档解析器只显式认识 `当前 V2 结论` 和 `当前 V3 结论`。

如果后续模板自然写成：

```text
当前 V4 结论
当前 V5 结论
```

旧解析器会读不到 blocker 定义，后果是 blocker 数被错误算成 0，进而可能错误触发预热或切换。

**结论**

阶段切换系统必须只依赖“当前 Vn 结论”这个结构，而不是依赖某个具体版本号。

**处置**

- milestone oracle 改成识别任意 `当前 V数字 结论`
- task synthesis prompt 的示例 milestone 改成当前 milestone
- preheat prompt 的示例 id/title 改成当前 transition / 下一版本
- board 数据新增 `current_closeout`，旧的 `v2_closeout` 只作为兼容别名

**验证**

新增回归已覆盖：

- V4 gate 文档用 `当前 V4 结论` 时能正确识别 open blocker
- V4->V5 会正确进入 `preheat-due`
- V4->V5 预热 prompt 不再出现 V2->V3 示例

**防复发规则**

以后任何版本模板、自动任务生成 prompt、看板字段，都不能用 V2/V3 作为语义名。版本号只能来自当前 runtime state、milestone oracle 或 transition config。

### 10. 预热不能只认 `preheat-due`

**问题**

V3->V4 检查时发现，当前阶段可能落入两种都需要补下一版模板的状态：

- `preheat-due`：当前版本还剩少量工程阻塞，应该提前补下一版模板。
- `cutover-blocked`：当前版本已经工程收口，但下一版模板缺失，导致不能切换。

旧实现只允许 `version-preheat-runner` 在 `preheat-due` 时启动。  
如果工程收口发生得比模板预热更快，系统会停在 `cutover-blocked`，既不切换，也不补模板。

**结论**

预热的真实含义不是“只在 closeout 前运行”，而是：

```text
只要下一版 transition pack 缺失，且当前版本已经接近或达到收口，就必须能补模板。
```

**处置**

- `version-preheat-runner` 同时接受 `preheat-due` 和 `cutover-blocked`。
- `lane-feed` 在 `cutover-blocked` 时不再只报 blocked，而是优先派发 preheat task 或 preheat candidate refresh。
- `task-synthesis` 把最近已完成的同名候选算作耗尽库存，避免旧候选挡住 preheat。
- 队列同步会把完成任务卡片从 `active` 改成 `done` / `completed`，即使表格行已经不存在。

**验证**

新增回归已覆盖：

- `candidate_stock_exhausted` 会触发下一版本预热。
- `cutover-blocked` 且缺 transition artifacts 时，会启动 preheat candidate refresh。
- 已完成但表格行缺失的任务卡片会同步成完成状态。

**防复发规则**

以后判断“是否该补下一版本模板”，不能只看状态名是否叫 `preheat-due`；必须看 transition pack 是否缺失，以及当前版本是否已经进入收口窗口。

### 11. 切换成功不等于队列一定播种成功

**问题**

V6->V7 这次暴露了一个更细的问题：`version-cutover` 可以完成版本状态切换，但如果 queue parser 读不懂新版本 runway，live queue 仍然可能为空。

这个状态很危险：

```text
版本已经进入 V7
但是 Codex / GLM 没有 V7 任务
```

用户看到的是“双泳道又停了”；系统内部看起来却像“cutover 成功”。

**根因**

V7 Codex runway 使用 `### V7-CX1：...` 这种更符合版本的标题，旧 parser 只认识 `### Task Cxx: ...`。  
V7 GLM runway 早期也只有 seed 表格，缺少 `## Task 107 — ...` 这种可解析任务正文。

**处置**

- `queue-refill.mjs` 支持 V7-CX 标题和旧 Task 标题。
- V7 GLM runway 补齐 Task 107..111 正文。
- `queue-refill.spec.mjs` 增加 V7 runway parser 回归。
- V7 cutover 后手动执行 queue refill，把 V7-CX1..CX4 和 Task 107..110 写入 live queue。

**新规则**

以后版本切换成功必须同时满足两件事：

1. runtime state 已从 N 切到 N+1。
2. N+1 的 Codex / GLM live queue 至少各有一张可执行任务，或者 oracle 明确说明当前阶段已无工程 blocker。

如果第 1 条成功、第 2 条失败，状态必须记为“切换后补货失败”，不能让系统安静停住。
