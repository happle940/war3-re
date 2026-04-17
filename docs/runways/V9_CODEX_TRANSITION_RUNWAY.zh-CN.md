# V9 Codex Transition Runway

> Codex 在 V9 负责反馈闭环、baseline 控制、扩展方向选择和 GLM 验收。

## 1. Codex ownership

- 决定 V9 gate 是否工程通过。
- 维护 V8 feedback -> V9 hotfix / patch / debt / user gate 的路由。
- 固定 V8 baseline，避免后续扩展破坏可复现试玩候选版。
- 从 master roadmap 和真实反馈中选择下一轮扩展方向。
- 派发、拒收、接管 GLM 的窄 proof，不允许 worker completed 直接变 accepted。

## 2. Active trunk

| Trunk | 目标 | 第一动作 |
| --- | --- | --- |
| `V9-CX1` External feedback intake sync | 让反馈进入维护队列，而不是停在文档模板。 | 同步 V9 gates、feedback packet、queue 和 board。 |
| `V9-CX2` Next expansion decision packet | 选择一个主攻扩展能力，明确不做项。 | 对照 V8 反馈、master roadmap 和当前缺口。 |
| `V9-CX3` Baseline release note packet | 固定 V8 baseline 的可复跑命令、已知缺口和回滚说明。 | 审核 GLM Task116。 |

## 3. Codex ready tasks

| Task | Status | Files | Stop condition |
| --- | --- | --- | --- |
| `V9-CX1 — External feedback intake sync` | ready-after-cutover | V9 docs、V8 feedback packet、board、queue | V9-HOTFIX1 有可执行任务，GLM 不空转。 |
| `V9-CX2 — Next expansion decision packet` | ready-after-CX1 | roadmap、capability program、V9 decision docs | 只选一个主攻能力；不把 V9 变成完整 War3 大杂烩。 |
| `V9-CX3 — Baseline release note packet` | ready-after-Task116 | V9 evidence、README/known issues docs | baseline 复跑结果、已知缺口、回滚说明清楚。 |

### V9-CX1: External feedback intake sync

Goal:

把 V8 的反馈记录模板、V9 gates、live queue 和看板接起来，让反馈能进入维护队列，而不是停在一份说明文档里。

Allowed files:

- `docs/V9_MAINTENANCE_EXPANSION_REMAINING_GATES.zh-CN.md`
- `docs/V9_MAINTENANCE_EXPANSION_EVIDENCE_LEDGER.zh-CN.md`
- `docs/V8_FEEDBACK_CAPTURE_AND_TRIAGE_PACKET.zh-CN.md`
- `docs/CODEX_ACTIVE_QUEUE.md`
- `docs/GLM_READY_TASK_QUEUE.md`
- `docs/DUAL_LANE_STATUS.zh-CN.md`
- `public/dual-lane-board.json`

Must satisfy:

- 明确 V9-HOTFIX1 的第一条可执行路径。
- 不需要真实 tester 反馈也能用样例证明路由规则。
- 不把 V9-UA1 用户选择写成自动通过。
- 看板和队列必须显示 V9 当前阶段和下一张 GLM 任务。

### V9-CX2: Next expansion decision packet

Goal:

从 V8 反馈入口、项目总路线和 War3-like 终局差距中选择一个下一轮主攻能力，并写清本轮不做什么，防止 V9 无限扩张。

Allowed files:

- `docs/PROJECT_MASTER_ROADMAP.zh-CN.md`
- `docs/WAR3_MASTER_CAPABILITY_PROGRAM.zh-CN.md`
- `docs/WAR3_ENDSTATE_GAP_ATLAS.zh-CN.md`
- `docs/V9_MAINTENANCE_EXPANSION_EVIDENCE_LEDGER.zh-CN.md`
- `docs/CODEX_ACTIVE_QUEUE.md`

Must satisfy:

- 只选一个主攻能力。
- 选择依据必须来自 V8 反馈入口、master roadmap 或终局差距，不凭临时兴奋点。
- 明确不选项和延期项。
- 输出能转成 GLM 窄任务，而不是一份空泛战略文档。

### V9-CX3: Baseline release note packet

Goal:

固定 V8 baseline 的可复跑命令、已知缺口、回滚说明和外部说明口径，给 V9 后续 hotfix / patch / expansion 一个稳定起点。

Allowed files:

- `docs/V9_MAINTENANCE_EXPANSION_EVIDENCE_LEDGER.zh-CN.md`
- `docs/V8_EXTERNAL_RELEASE_EVIDENCE_LEDGER.zh-CN.md`
- `docs/KNOWN_ISSUES.zh-CN.md`
- `README.md`
- `docs/CODEX_ACTIVE_QUEUE.md`

Must satisfy:

- 列出 baseline smoke / RC smoke / cleanup 的复跑命令。
- 明确哪些缺口是已知债务，不是回归。
- 不把 V8 baseline 写成 public release 或完整 War3。
- 只有 Task116 accepted 后才能关闭 V9-BASELINE1。

## 4. Reject rules

Codex 必须拒绝：

- 没有反馈或 roadmap 依据就派新内容。
- 把 V9 写成完整 War3 终局。
- 把异步用户 verdict 写成自动通过。
- GLM closeout 没有完整 build / typecheck / focused runtime / cleanup。
- 重复提交同一任务或把历史 completed 当成当前可执行任务。
