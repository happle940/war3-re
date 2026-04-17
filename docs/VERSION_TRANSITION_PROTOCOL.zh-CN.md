# 版本切换总协议

> 用途：把 `V2 -> V8` 的版本进入、预热、切换、收口统一成一套可复用标准。  
> 它不替代具体版本的 gate 文档；它定义的是“什么时候该补下一版模板、什么时候能真正切版本、切版本时必须准备什么”。
>
> 相关过程问答与设计澄清，记录在 `docs/VERSION_TRANSITION_PROCESS_LOG.zh-CN.md`。

## 1. 先定结论

以后每个版本切换都遵守同一条总规则：

```text
先预热下一版，再切换主线；
先准备模板，再发动车道；
先证明当前版可收口，再让下一版接棒。
```

这条规则从 `V2 -> V3` 开始，后续直接复用到 `V8`。

## 2. 四个核心对象

### 2.1 当前版本 oracle

作用：只回答当前版本的工程事实。

它必须能回答：

- 当前真实里程碑是什么
- 还有多少 engineering blocker
- 具体是哪些 blocker / conditional / user-open
- engineering closeout 是否已经 ready
- 哪些项只是 user-open / residual，不再阻塞切换

### 2.2 Transition Pack

每个 `N -> N+1` 都必须有一套固定产物：

1. `remaining gates`
2. `evidence ledger`
3. `transition bootstrap packet`
4. `Codex runway`
5. `GLM runway`
6. `machine-readable transition entry`

没有这 6 件东西，就只能叫“方向存在”，不能叫“版本已预热”。

### 2.3 version-transition orchestrator

作用：不做产品判断，只做版本切换编排。

它负责：

- 判断什么时候该开始预热下一版
- 判断下一版模板是否准备齐
- 判断当前版本是否已满足正式切换条件
- 报告当前状态：`preheat-not-needed-yet` / `preheat-due` / `preheated-awaiting-closeout` / `cutover-ready`

### 2.4 version runtime state + cutover executor

从现在开始，版本切换不再只靠“当前 milestone 文案在哪个 md 里”。

系统还必须有两个执行对象：

- `docs/VERSION_RUNTIME_STATE.json`
  - 记录当前 active version / milestone
  - 记录最近一次是通过哪条 transition 激活的
- `scripts/version-cutover.mjs`
  - 在 `cutover-ready` 时执行真正的单步切换
  - 清掉旧版本 live queue 里的非终态任务
  - 用新版本 runway 重新播种 Codex / GLM live queue

这里的原则是：

```text
orchestrator 负责判断能不能切；
cutover executor 负责真的去切。
```

### 2.5 lane feed

lane feed 不负责定义版本。

lane feed 只负责：

- 读取 live queue
- 派发当前版本的 ready 任务
- 在 Codex lane 上消费 `cutover-ready`，调用 cutover executor 做一次真正切换
- 其余时间只处理当前 active milestone 的队列，不跨版本乱派

## 3. 统一状态机

每个 `N -> N+1` 只能处于下面这些状态之一：

| 状态 | 含义 |
| --- | --- |
| `not-current` | 当前项目不在这个切换上。 |
| `preheat-not-needed-yet` | 当前版本 blocker 还太多，不该补下一版完整模板。 |
| `preheat-due` | 当前版本已接近收口，必须补下一版模板。 |
| `preheated-awaiting-closeout` | 下一版模板已齐，但当前版本还没正式收口。 |
| `cutover-blocked` | 当前版本已可切，但下一版模板仍缺关键件。 |
| `cutover-ready` | 当前版本已收口，下一版模板也已齐，可以切换主线。 |
| `cutover-done` | 版本已经切换完成，并且新版本 seed queue 已播种。 |

禁止出现：

- “感觉差不多了，算进下一版”
- “当前版刚收口，下一版模板以后再补”
- “边切版本边想下一版做什么”

## 4. 两段触发

### 4.1 预热触发

预热不是开始做下一版全部内容，而是把下一版从“想法”变成“可接棒模板”。

统一规则：

```text
当当前版本 engineering blocker 降到少量，
且下一版本已经是 roadmap 明确的下一主山，
而下一版本模板仍不存在或已过时，
就触发 preheat。
```

默认触发阈值：

- 当前版本 engineering blocker `<= 1`

如果某个版本要调整阈值，必须在机器配置里显式声明，不能靠聊天记忆。

但要特别注意：

```text
阈值只负责回答“现在该不该开始预热”；
不负责回答“预热到底该补什么”。
```

预热真正要吃的输入必须是当前版本 oracle 的完整快照：

- `blockerGatesOpen`
- `conditionalGatesOpen`
- `userDecisionPending`
- 当前版本里允许带入下一版的 residual

也就是说，系统不能只知道“还剩 1 个 blocker”，还必须知道“这 1 个 blocker 到底是谁”，否则自动补模板时会失焦。

### 4.2 正式切换触发

统一规则：

```text
当前版本 engineeringCloseoutReady = true
并且下一版本 Transition Pack 全部齐备
并且下一版本 seed queue 已经定义
才允许切换主线。
```

切换执行后，还必须额外满足：

```text
只做一步：
N -> N+1
不允许在同一次切换里连跳到 N+2。
```

注意：

- `user-open` 不阻塞切版本
- 但会进入下一版 residual / follow-up
- 当前版本如果还有真正 engineering blocker，就不能切

## 5. 下一版本 blocker 是怎么来的

统一推导公式：

```text
N+1 的 blocker
= 北极星在这一版要兑现的 capability slice
+ N 版本 closeout 后必须继续接住的 residual / user-open
+ N+1 自己新增、且不关闭就不能宣称本版达成的能力
```

换句话说，下一版本 blocker 不是凭空拍出来的，而是来自三层输入：

1. 顶层目标  
   这条版本线到底是在逼近什么，例如：
   - `V3`：第一眼战场 + 产品壳层清晰度
   - `V4`：短局 alpha
   - `V5`：战略骨架

2. 上一版本真正交付了什么  
   也就是 `fromVersionOutcome`。它定义：
   - 哪些问题必须在上一版关掉
   - 哪些问题可以带着进入下一版
   - 上一版到底给下一版留下了什么可靠地基

3. 上一版本留下了什么残留  
   也就是 residual routing。它定义：
   - 哪些 residual 进入下一版后升级成主 blocker
   - 哪些 residual 只是继续跟踪，不该抢主山
   - 哪些 user-open 只是异步判断，不应伪装成工程 blocker

所以通用做法不是“先有任务，再猜 blocker”，而是：

```text
先定北极星切片；
再读上一版 closeout 结果；
再生成下一版 blocker / residual / user gate。
```

这三层输入必须能落进机器配置，而不是只存在聊天里。

## 6. 每次切换必须准备的标准产物

每个 `N -> N+1` 的 Transition Pack 必须具备下面这些文件：

| 产物 | 用途 |
| --- | --- |
| `remaining gates` | 定义 `N+1` 的 blocker / conditional / residual / user gate |
| `evidence ledger` | 记录 `N+1` 的工程证据、用户证据和当前状态 |
| `transition bootstrap packet` | 记录 preheat 输入、cutover、残留债务、seed queue |
| `Codex runway` | 给 Codex 的首批结构化任务 |
| `GLM runway` | 给 GLM 的首批结构化任务 |
| `VERSION_TRANSITIONS.json` entry | 给脚本读的统一配置 |

## 7. 版本切换时谁负责什么

| 对象 | 职责 | 不负责 |
| --- | --- | --- |
| oracle | 报当前版工程真相 | 决定产品方向 |
| orchestrator | 触发 preheat / cutover，检查模板齐备度，带出当前 blocker 明细 | 代替人写产品文档 |
| Codex | 生成下一版模板、seed queue、路由文档 | 靠聊天记忆切版本 |
| GLM | 执行被派发的 bounded implementation slice | 设计版本边界 |
| user gate | 提供人眼接受、分享许可、视觉方向等异步判断 | 替代工程 closeout |

## 8. 统一命名建议

从 `V3` 开始，建议每个版本固定使用下面这些文件名：

- `docs/<VERSION>_*_REMAINING_GATES.zh-CN.md`
- `docs/<VERSION>_*_EVIDENCE_LEDGER.zh-CN.md`
- `docs/<VERSION>_TRANSITION_BOOTSTRAP_PACKET.zh-CN.md`
- `docs/runways/<VERSION>_CODEX_TRANSITION_RUNWAY.zh-CN.md`
- `docs/runways/<VERSION>_GLM_TRANSITION_RUNWAY.zh-CN.md`

`V2` 是历史遗留命名，可以保持不改；从 `V3` 起按统一名字走。

## 9. 复用到 V8 的最小映射

| 切换 | 下一版要补的主模板 |
| --- | --- |
| `V2 -> V3` | 第一眼战场 + 产品壳层清晰度 |
| `V3 -> V4` | 短局 alpha |
| `V4 -> V5` | 战略骨架 |
| `V5 -> V6` | War3 身份系统 |
| `V6 -> V7` | 内容与 beta 候选 |
| `V7 -> V8` | 外部 demo / release 候选 |

## 10. 当前落地要求

当前仓库至少要做到：

1. `V2 -> V3` Transition Pack 完整存在
2. 机器配置可读 `V2 -> V8` 的统一结构
3. orchestrator 能回答当前是否该 preheat / cutover
4. lane feed 不再把“无切换器”误写成版本已经自然切换

一句话：

```text
以后版本推进不再靠聊天记忆，
而靠 oracle + transition pack + orchestrator。
```
