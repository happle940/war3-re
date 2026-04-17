# M7 Slice Acceptance Decision Tree

> 用途：Codex 审查 `Task 33 / 34 / 35` closeout 时使用。目标是快速决定 `接受`、`拒绝`、`延期`、`退回缩 scope` 或 `Codex 接管`，不让 M7 hardening 被口头 green 掩盖。

## 1. 起点：File Scope Correct？

先看 `git status --short` 和 diff，不先看 closeout 语气。

```text
文件范围是否完全符合该任务 review packet？
```

- `No`：默认 `拒绝` 或 `退回缩 scope`。
- `No，但改动显然是已证明 bug 的最小修复`：`延期`，改写为 contract / test task 后再评。
- `No，且混入 tests 弱化、玩法/AI/视觉/产品方向变化`：直接 `拒绝`。
- `Yes`：进入 slice 类型判断。

不要接受“顺手整理”“顺便修一下”“只是小改动”作为越界理由。

## 2. Slice 类型判断

### Task 33 / Task 34：Zero-behavior-change Slice

先问：

```text
同样输入和初始状态下，玩家可见行为是否应完全不变？
```

必须能从 diff 和 regression 共同判断：

- `Task 33`：selection、右键命令结果、command card / portrait、control group、HUD cache 不漂移。
- `Task 34`：placement mode、ghost / preview lifecycle、validation bridge、builder agency、payment、footprint / occupancy 不漂移。

如果需要主观试玩、截图感觉或“这样更合理”才能判断，结论不是接受；转 `延期` 或 contract task。

### Task 35：Contract-gap Slice

先问：

```text
是否只选择了一个真实 contract gap，并给出 focused proof？
```

必须满足：

- 有唯一 chosen gap。
- 现有覆盖为什么不足已经写清。
- 新 proof 直接命中该 gap。
- 如果改产品代码，新 regression 必须先失败，且修复最小。
- 结果写清“现在证明什么”和“仍未证明什么”。

如果只是“补一些测试”或同时扫多个方向，直接 `拒绝` 或 `退回缩 scope`。

## 3. Evidence Sufficient？

```text
closeout 是否给出可复验的具体证据？
```

接受前至少要有：

- `Files changed`
- `Commands run`
- 精确 pass / fail 结果
- build 和 typecheck
- 对应 focused runtime pack 或新 / 受影响 spec
- cleanup 结果
- 剩余歧义

分支：

- `证据充分且本地复验通过`：可进入接受前最后判断。
- `方向对但少命令、少通过数量、少 cleanup、少风险说明`：`退回补证据`。
- `diff 可用但范围偏大`：`退回缩 scope`。
- `行为可能变化但也许应该变`：`延期`，转 contract / test task。
- `GLM 多次无法给出落地 diff 或可复验证据`：Codex 可 `接管`。

不接受只写 “tests pass”“green”“verified locally”“应该没问题”。

## 4. Focused Verification 够不够？

### Focused verification 通常足够

满足全部条件时，可以只跑任务要求的 focused commands：

- diff 严格在任务允许文件内。
- 没有产品行为语义变化。
- touched path 与指定 regression pack 直接对应。
- closeout 清楚说明证明边界。
- cleanup 已执行且无残留。

### 必须升级验证

出现任一项，升级到更大 runtime 面，通常是 `npm run test:runtime`：

- Task 33 触碰 selection 之外的 input orchestration、command dispatch、HUD cache。
- Task 34 触碰 placement-only 之外的 right-click path、pathing fallback、builder agency、payment、footprint / occupancy。
- Task 35 改了产品代码、runner、shared harness，或 gap 跨 command / HUD / construction / resource / cleanup。
- focused proof 通过，但 diff 影响范围超过 chosen gap。
- reviewer 无法只靠 focused pack 判断副作用。

如果升级验证仍不能解释等价性，不要接受；改为 `延期` 或 `拒绝`。

## 5. 什么时候 Reject / Defer / Return / Take Over

| 结论 | 使用条件 | 下一步 |
| --- | --- | --- |
| `接受` | scope 正确、证明边界清楚、本地复验通过、剩余风险已记录。 | 写 slice review log，更新队列和必要 docs。 |
| `拒绝` | 越界、行为漂移、弱化测试、混入玩法/AI/视觉/产品方向、泛化测试 churn。 | 要求回退或重做，不把该 slice 计入 M7。 |
| `延期` | 行为可能应该变，但缺合同；或暴露真实 bug；或需要用户/产品判断。 | 转 contract / test task，或登记为待判断，不按 hardening 接受。 |
| `退回补证据` | 方向对但 closeout 缺命令、结果、通过数量、cleanup 或风险说明。 | 要 GLM 补证据，不改 scope。 |
| `退回缩 scope` | diff 大体可用但一次搬太多系统。 | 要 GLM 拆成更小 slice。 |
| `Codex 接管` | GLM 多次不落文件、重复给空泛 closeout、已证明问题但无法收口，继续等待成本更高。 | Codex 直接完成最小修复/证据，并记录接管原因。 |

## 6. 接受后必须更新

接受 GLM closeout 不等于收口。Codex 必须立即做这些记录动作：

- 更新 `docs/M7_SLICE_REVIEW_LOG.zh-CN.md` 对应 `Slice 01 / 02 / 03` 条目。
- 更新 `docs/GLM_READY_TASK_QUEUE.md`：任务状态、证据摘要、下一 ready task。
- 更新 `docs/CODEX_ACTIVE_QUEUE.md`：Codex 接受状态和下一步。
- 必要时更新对应 review packet / checklist / regression checklist 的证据口径。
- 确认接受结论没有声称 `M7` 整体已通过，除非所有 M7 条件另有正式证据。

没有 review log，就不要把该 slice 视为真正接受。

## 7. Do Not Say

没有完整证据前，不要写：

- “M7 已通过。”
- “Task 33/34/35 green，可以不看 diff。”
- “只是重构，所以不用 runtime。”
- “focused tests pass，所以没有任何风险。”
- “GLM 说没改行为，所以接受。”
- “Task 35 补了测试，所以 coverage gap 已全部关闭。”
- “这个 refactor 改善了手感 / AI / HUD，所以也算 hardening。”

安全写法：

- “Task 33 / 34 / 35 closeout 已按 scope、证据和本地复验接受。”
- “本 slice 证明的范围是：...”
- “未证明的风险是：...”
- “M7 整体状态仍取决于剩余 slice 和 review log。”
