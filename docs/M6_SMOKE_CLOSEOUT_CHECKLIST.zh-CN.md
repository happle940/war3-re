# M6 Smoke Closeout Checklist：Task 32 收口审查

> 用途：Codex 审查 GLM `Task 32 — M6 Live Build Smoke Pack`。重点是分清 smoke 文档、候选版本证据、release 措辞三件事，不能混成“M6 已批准”。

## 1. 接受 Task 32 前必须存在

接受前，GLM closeout 至少要给出：

- 改动文件列表，且全部在 Task 32 允许范围内。
- `M6 Live Smoke Path` 或等价 smoke 路径文档已经存在，并能被重复执行。
- 某一个目标候选版本的 smoke 证据已经记录，包含链接、commit 或部署标识。
- build、typecheck、live openability、最小控制闭环、训练闭环、AI activity、cleanup 的结果分别可查。
- README / Known Issues / M6 gate 文案没有把 smoke 证据写成 release approval。
- 如果 smoke 失败，失败类型已归类，并写清是否阻断私测或公开。
- Codex 能按 GLM 提供的信息本地复验或独立判断证据是否够。

缺任一项，不要接受为 Task 32 完成。

## 2. 文档路径 vs 候选证据

这两个状态必须分开记录：

| 状态 | 含义 | 可以声称 | 不能声称 |
| --- | --- | --- | --- |
| `smoke path documented` | 已有一条可重复执行的 smoke 检查路线 | “M6 smoke 路径已整理，可用于候选版本验证。” | “当前候选版 smoke 已通过。” |
| `candidate smoke evidence recorded` | 对某个明确候选版本执行过 smoke，并留下结果 | “候选版本 X 的 smoke 结果为 pass/fail/incomplete。” | “M6 已批准私测 / 公开分享。” |

路径文档存在只是准备材料；候选证据存在也只是 release 判断输入。用户没有批准前，二者都不能升级成 `M6 approved`。

## 3. Exact Proof Buckets

Codex review 时按下面桶逐项查证，不接受一句“smoke passed”代替。

| Proof bucket | 必须看到的证据 | 失败或缺失时 |
| --- | --- | --- |
| Build | `npm run build` 针对目标候选版本的结果、时间或日志 | 阻止任何外部分享；退回补证据或修 build |
| Typecheck | `npx tsc --noEmit -p tsconfig.app.json` 的目标候选结果 | 阻止任何外部分享；退回补证据或修类型错误 |
| Live openability | 目标链接、浏览器环境、无白屏/启动崩溃、初始 HUD 出现 | 归类为 `启动失败`，不接受 Task 32 |
| Minimal control loop | 默认镜头可读；worker 可选中；右键地面移动；右键金矿采集；命令卡可读 | 归类为 `核心交互失败` 或 `可读性失败` |
| Training loop | Town Hall 训练 worker 或 Barracks 训练 footman；资源扣除；单位出生；必要时 rally 行为不误导 | 归类为 `生产闭环失败` |
| AI activity | AI 能采集、维持经济、出兵或形成压力；不是玩家独自在空地图操作 | 归类为 `AI 存活性失败` |
| Cleanup | smoke / runtime 后执行 cleanup；无 Vite / Playwright / Chromium 残留；严重错误已记录 | 不接受 closeout，或要求 Codex 接管清理和复验 |

如果 GLM 只提供截图、口头描述或历史结果，Codex 应要求补成候选版本级证据。

## 4. README / Known Issues / Gate Docs 措辞

### 允许的措辞

当前阶段可以写：

- “当前版本是 `gameplay alpha`，不是完整发行版。”
- “smoke path 已记录，可用于候选版本验证。”
- “候选版本 X 的 smoke 结果：pass / fail / incomplete。”
- “release 判断输入正在准备。”
- “少量私测 / 公开分享仍需用户批准。”
- “Known Issues 已更新到候选版本，或仍待刷新。”
- “如果 smoke 失败，失败类型是启动 / 可读性 / 核心交互 / 生产闭环 / AI 存活性 / 反馈污染。”

### 禁止的措辞

当前阶段不能写：

- “M6 已通过。”
- “release approved。”
- “公开 demo 已准备好。”
- “可以公开分享。”
- “smoke path 已写，所以 smoke 已通过。”
- “测试都绿，所以 release 可发。”
- “Known Issues 已解决”，除非对应问题已有当前候选证据。
- “私测已批准”，除非用户明确批准。
- “公开分享已安全”，除非用户明确批准且公开分享 checklist 已全部满足。

### 文档边界

- README 可以说明玩法、控制、alpha 范围和反馈路径，但不能替用户批准 release。
- Known Issues 应记录当前真实限制，不写未来愿望，也不删除仍会污染反馈的问题。
- M6 gate docs 可以写“等待用户选择 public/private/hold”，不能写“默认公开”。

## 5. Accept / Return / Take-over Criteria

### Accept

同时满足时，Codex 可以接受 Task 32：

- 文件范围正确，没有碰 forbidden files。
- smoke path 文档存在且步骤可重复。
- 至少一个明确候选版本有 smoke evidence 记录。
- 七个 proof buckets 都有 pass/fail/not-run 状态，且缺口影响被写清。
- README / Known Issues / gate docs 没有过度 release 措辞。
- Codex 本地复核关键证据或确认 GLM 证据足够具体。
- cleanup 已执行，没有残留进程或残留已说明。

### Return to GLM

适合退回 GLM 的情况：

- 方向正确，但缺少某个 proof bucket 的具体结果。
- 只有 smoke path，没有候选版本 smoke 记录。
- 文案有轻微过度，需要改成 “candidate / input / pending approval”。
- Known Issues 或 M6 gate 没有同步 smoke 失败/缺口。
- cleanup 结果没有写。

### Codex Take-over

适合 Codex 直接接管的情况：

- GLM 两次仍把 release approval 和 smoke evidence 混在一起。
- GLM 无法给出目标链接、commit、命令或 smoke 步骤结果。
- smoke 失败已经很明确，但 GLM 继续包装成 green。
- cleanup 或本地进程残留影响后续验证。
- 继续退回会拖住 M6 release 判断输入。

## 6. 接受后必须立即更新的队列和 gate 文档

接受 Task 32 后，Codex 应立即更新这些文档。注意：这是接受后的动作清单；本 checklist 创建时不执行这些更新。

| 文档 | 必须更新什么 |
| --- | --- |
| `docs/GLM_READY_TASK_QUEUE.md` | Task 32 状态、结果、证据摘要；下一个 ready task 是否清楚。 |
| `docs/CODEX_ACTIVE_QUEUE.md` | Codex 对 Task 32 的接受状态、剩余 Codex lane、下一步 review/dispatch。 |
| `docs/M6_GATE_PACKET.zh-CN.md` | smoke 路径和候选证据状态；仍待用户选择 `公开发出去` / `先给少数人私测` / `再等一个里程碑`。 |
| `docs/KNOWN_ISSUES.zh-CN.md` | 候选版本 smoke 发现的新限制；已被证据关闭的问题；仍会污染反馈的问题。 |
| `docs/M6_LIVE_SMOKE_PATH.zh-CN.md` | 如果 Task 32 改进了 smoke 步骤或记录格式，应写入最新可重复路径。 |

不能只更新队列不更新 gate 输入，也不能只更新 gate packet 不让任务队列知道 Task 32 已收口。

## 7. 最终 Closeout 口径

Task 32 被接受后，推荐只写：

```text
Task 32 accepted: smoke path documented and candidate smoke evidence recorded for [candidate id].
M6 release status: pending user decision.
Allowed next decision: private playtest / public share / hold, based on user approval and red lines.
```

不要写：

```text
M6 approved.
Ready for public demo.
Release complete.
```
