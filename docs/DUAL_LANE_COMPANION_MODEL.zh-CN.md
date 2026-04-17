# 双泳道 Companion 模型

> 目的：把 `openai/codex-plugin-cc` 的核心运行时思想，复合到 `war3-re` 当前的 `codex-watch / glm-watch / board` 双泳道模式里。  
> 这份文档不讨论“插件怎么装”，只讨论它对我们当前执行系统的启发，以及我们在本仓库里的落地形态。

## 1. 参考对象到底解决了什么

参考仓库：

- `https://github.com/openai/codex-plugin-cc`

它表面上给 Claude Code 增加了这些命令：

- `/codex:review`
- `/codex:adversarial-review`
- `/codex:rescue`
- `/codex:status`
- `/codex:result`
- `/codex:cancel`

但真正有价值的不是“多几个 slash command”，而是下面这套运行时模型：

1. **workspace-scoped state**
   - 每个仓库有自己的 state 目录。
   - job 不是散在聊天或终端里，而是有稳定的 workspace 归属。

2. **job lifecycle**
   - 每个任务有 `id / status / phase / createdAt / updatedAt / result / logFile`。
   - `task`、`status`、`result`、`cancel` 构成闭环，而不是只会“发任务”。

3. **runtime 和 job 分离**
   - 底层 session/runtime 可以持续活着。
   - 上层 job 是一条条进入这个 runtime 的有边界工作单元。

4. **progress preview**
   - 不是只看一整块终端输出。
   - `status` 会给出最近 progress lines。

5. **result retrieval**
   - 完成后的结果不是靠人工翻 terminal。
   - `result` 可以直接拿最终 closeout。

6. **cancel semantics**
   - 后台任务不是只能“等它跑完”。
   - 至少有一条取消路径。

一句话：  
它把“代理在后台跑”从**会话**提升成了**可追踪作业系统**。

## 2. 我们当前双泳道的真实短板

当前仓库已经有：

- `scripts/codex-watch.sh`
- `scripts/glm-watch.sh`
- `scripts/codex-watch-monitor.sh`
- `scripts/glm-watch-monitor.sh`
- `board.html`
- `public/dual-lane-board.json`

它们已经解决了：

- 双终端常驻
- monitor 心跳
- 本地网页看板
- 文档队列和 watch 输出聚合

但还缺插件式 companion 的这几层：

1. **任务粒度不是真正的一等对象**
   - 目前一条 lane 里“有 session”，不等于“有可追踪 job”。
   - 任务常常只存在于 prompt 文本、queue 文档或聊天里。

2. **queue 和 execution state 混在一起**
   - `ready / active / watch / long-term owner lane` 曾经被混成一个列表。
   - 用户看到的是“好多 active”，但真实只在做其中一两件。

3. **result retrieval 不标准**
   - 现在更多依赖 terminal capture、doc closeout、人工验收。
   - 缺一条固定的 `job -> result` 读取路径。

4. **cancel / replace 没有统一语义**
   - 需要手工发消息、盯 terminal、必要时 tmux 中断。
   - 没有稳定的作业级控制面。

5. **看板读的是综合推断，不是 job truth**
   - 现在 board 同时读 queue docs、watch pane、monitor json。
   - 它能看大势，但还不是“作业系统的单一真相源”。

## 3. 复合原则

我们不直接复制 `codex-plugin-cc`，因为场景不同：

- 它是 `Claude Code -> Codex`
- 我们是 `Codex owner + GLM lane + 本地看板 + 持续运行`

所以复合原则是：

1. **保留现有 watch runtime**
   - `codex-watch` 和 `glm-watch` 继续作为底层 transport/runtime。
   - 不推倒重来。

2. **在 runtime 之上补一层 companion job system**
   - 新增一层统一的 `task/status/result/cancel/setup`。
   - 这层才是双泳道的标准作业接口。

3. **queue docs 退回 planning role**
   - queue 负责“接下来该做什么”。
   - companion jobs 负责“现在到底在跑什么、跑到哪了、结果是什么”。

4. **board 逐步切到 job truth**
   - 看板以后优先展示 companion 的 job 状态。
   - queue 仍展示，但作为 backlog，不冒充 live execution。

## 4. 本仓库里的第一版落地

当前已新增：

- `scripts/dual-lane-companion.mjs`

对应命令：

- `npm run lane:setup`
- `npm run lane:task`
- `npm run lane:status`
- `npm run lane:result`
- `npm run lane:cancel`

### 4.1 V1 能力

第一版 companion 已经具备：

1. `task`
   - 向 `codex` 或 `glm` lane 派发一个 job。
   - 自动生成 `job id`。
   - 记录 lane、title、session log file、log offset。
   - 包装 prompt，要求输出固定 closeout marker：
     - `JOB_COMPLETE: <id>`
     - `JOB_BLOCKED: <id>`
     - `READY_FOR_NEXT_TASK: ...`

2. `status`
   - 读取 workspace-scoped state。
   - 基于 job 对应 log offset 提取 progress preview。
   - 推断 `running / completed / blocked / cancelled`。

3. `result`
   - 读取某个 job 的最终输出块。
   - 不再必须靠人工翻整段 terminal。

4. `cancel`
   - best-effort 向对应 lane 的 tmux session 发送中断。
   - 同时把 job 标成 `cancelled`。

5. `setup`
   - 输出当前 workspace 的 companion state 路径与 lane monitor 基本状态。

### 4.2 V1 仍然故意保守的地方

V1 还没有做这些：

1. 没有实现 `review / adversarial-review` 的双 lane 版本。
2. 没有实现自动 `resume-last` 线程选择。
3. 没有把 board 完全切到 companion state。
4. 没有把 queue dispatch 自动改成 companion 驱动。
5. `cancel` 仍是 best-effort，不保证底层代理一定停止在理想边界。

这是故意的。  
先把 **job truth** 补上，再做调度自动化和 UI 合流。

## 5. 状态分层

复合之后，双泳道状态应该分成 4 层：

### L0. Runtime layer

- `codex-watch`
- `glm-watch`

只回答：

- session 在不在
- pane 有没有变化
- terminal 最近在吐什么

### L1. Companion job layer

- `dual-lane-companion` job files

回答：

- 这条 lane 当前 job 是谁
- job id 是什么
- 从什么时候开始
- 现在 phase 是什么
- 有没有 closeout
- result 是什么

### L2. Queue / runway layer

- `docs/CODEX_ACTIVE_QUEUE.md`
- `docs/GLM_READY_TASK_QUEUE.md`
- runway docs

回答：

- 下一个该做什么
- 哪些是 ready
- 哪些是 owner lane
- 哪些在 watch

### L3. Board layer

把 L0 + L1 + L2 聚合给人看。

以后优先级应是：

```text
job truth > runtime monitor > queue docs > free-form terminal interpretation
```

## 6. 对双泳道模式的直接改进

把 companion 模型复合进来后，双泳道会有 5 个直接提升：

1. **Codex 不会再因为 queue 很长看起来像“同时做很多事”**
   - 当前 job 和 backlog 被拆开。

2. **GLM / Codex 都能用 job id 对齐**
   - 比如 `glm-md9b...`、`codex-md9c...`
   - 讨论的是 job，不是“你刚才那条消息”。

3. **结果回收标准化**
   - 审核时不再先翻 pane，而是先看 `result`。

4. **board 更容易实时化**
   - 可以直接显示每条 lane 的 current job / latest completed job / progress preview。

5. **将来更容易做“Codex -> Claude Code”标准桥**
   - 因为我们已经从 “watch script” 升到 “job companion” 模型。

## 7. 下一步推荐顺序

### Phase A

先把 companion 作为**标准派发入口**跑起来：

- 新任务尽量用 `lane:task` 发，而不是直接 `watch.sh send`
- 审核时优先看 `lane:status` / `lane:result`

### Phase B

把 board 接到 companion state：

- 每条 lane 单独显示：
  - current job id
  - current job title
  - status / phase
  - latest result summary

### Phase C

把当前零散自动化迁过去：

- `codex-watch-feed`
- queue 派发器
- closeout 采集

### Phase D

再考虑更强的功能：

- resume-last
- stronger cancel
- review/adversarial-review 风格的 owner 审核 lane
- 从 Codex 反向驱动 Claude Code 的正式 bridge

## 8. 一句话定义

`codex-plugin-cc` 给我们的最大启发不是“Claude 里能叫 Codex”，而是：

```text
把代理协作从“两个活着的终端”升级成“两个带 job truth 的持续作业系统”。
```

对 `war3-re` 来说，这就是双泳道下一阶段该有的执行底座。
