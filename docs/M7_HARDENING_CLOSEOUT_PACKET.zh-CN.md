# M7 Hardening Closeout Packet

> 用途：作为当前 M7 工程 hardening 的权威收口包。本文记录已接受的 extraction slice、Task 35 的唯一 contract-gap 规则、可复查证据、剩余债务、延期用户判断和不能声称的边界。

## 1. 当前状态

状态：`M7 accepted engineering closeout with residual debt`

Codex 已完成最终本地复验，并接受当前 M7 工程收口：

- `docs/M7_SLICE_REVIEW_LOG.zh-CN.md` 的 Slice 01 / 02 / 03 均已补齐并标记为 `接受`。
- 最终本地验证记录可复查：
  - `npm run build`
  - `npx tsc --noEmit -p tsconfig.app.json`
  - `./scripts/run-runtime-tests.sh tests/hud-cache-transition-regression.spec.ts tests/command-card-state-regression.spec.ts --reporter=list`
  - `FORCE_RUNTIME_CLEANUP=1 ./scripts/cleanup-local-runtime.sh`
- residual debt 与 cannot-claim 边界已按本文登记，没有被 closeout 文案藏掉。

当前事实：

- `Task 33 — SelectionController Extraction Slice`：Codex 已接受。
- `Task 34 — PlacementController Hardening Slice`：Codex 已接受。
- `Task 35 — Contract Coverage Gap Sweep`：chosen gap 已固定为 `HUD command-card cache transitions`；Codex 已完成本地复验并正式接受。

## 2. 收口边界

本文只覆盖 M7 工程 hardening：

- 零行为变化 extraction slice 是否被工程证据接受。
- 一个明确 contract gap 是否被 focused proof 覆盖。
- hardening 后仍有哪些工程 residual 和用户判断 residual。
- 哪些结论不能由 M7 工程 closeout 代替。

本文不批准：

- M2 核心系统组合体验。
- M3 空间语法、镜头 framing、可读性和 proxy 方向。
- M4 alpha match loop、AI 压力质量和 ending clarity。
- M5 产品方向、视觉路线或内容范围。
- M6 私测、公开分享、README/share 文案或 release gate。
- 任何 public-share readiness。

安全说法：

```text
M7 工程 hardening 已按工程证据收口，并保留 residual debt 记录。
它只说明 Task 33/34 的零行为变化抽取和 Task 35 的唯一 chosen gap 已被工程接受。
它不替代用户对 M2-M6 的人工判断，也不批准公开分享。
```

## 3. 本次 M7 工程锚点

| 锚点 | 当前结论 | 工程意义 | 不能扩张成什么 |
| --- | --- | --- | --- |
| `Task 33` SelectionController extraction | `接受` | selection query / display helper 从 `Game.ts` 抽出；左键、框选、Shift、右键命令、HUD 刷新、Tab/编队/Esc 行为保持不变。 | 不代表 selection 系统以后可无 focused regression 改动。 |
| `Task 34` PlacementController hardening | `接受` | ghost preview mesh creation、preview position update、validation color feedback 进入 `PlacementController`；builder agency、payment、construction、footprint、right-click、HUD、AI 未触碰。 | 不代表 placement / construction 语义可以顺手改。 |
| `Task 35` HUD command-card cache transitions | `接受` | 用 focused tests 证明 selection transition、construction cancel/completion、death cleanup、resource/supply reason change 不留下 stale command-card buttons 或 disabled reasons。 | 不代表所有 HUD cache、portrait、multi-select、training queue、lumber/queuedSupply edge case 都已关闭。 |

## 4. Evidence

每个证据项只按 `pass / fail / not run with reason / pending` 记录。`tests pass` 不能单独作为 closeout。

### Task 33：SelectionController Extraction Slice

| 项 | 当前记录 |
| --- | --- |
| review log | `docs/M7_SLICE_REVIEW_LOG.zh-CN.md` Slice 01，结果：`接受`。 |
| accepted commit | `d816736`，`refactor: extract SelectionController slice from Game.ts`。 |
| touched files | `src/game/SelectionController.ts`、`src/game/Game.ts`。 |
| no-touch boundary | right-click command logic、HUD cache rules、input timing、event orchestration、control group / Tab / Esc、gather/resource/attack/build semantics 未移动。 |
| build | `pass`：`npm run build`，Vite 仅有大 chunk warning。 |
| typecheck | `pass`：`npx tsc --noEmit -p tsconfig.app.json`。 |
| focused regression | `pass`：`selection-input` 6/6；`command-surface` + `command-card-state` 20/20。 |
| full runtime | `pass`：GLM closeout 记录 `npm run test:runtime`，5/5 shards，117/117，846s total；Codex 以本地 focused rerun 接受该 slice。 |
| cleanup | `pass`：`FORCE_RUNTIME_CLEANUP=1 ./scripts/cleanup-local-runtime.sh`，无 Vite / Playwright / chrome-headless-shell 残留。 |
| conclusion | `接受`。这是零行为变化 extraction，不批准新的 selection 语义。 |

### Task 34：PlacementController Hardening Slice

| 项 | 当前记录 |
| --- | --- |
| review log | `docs/M7_SLICE_REVIEW_LOG.zh-CN.md` Slice 02，结果：`接受`。 |
| accepted commit | `a985e6d`，`refactor: extract ghost preview helpers into PlacementController`。 |
| touched files | `src/game/PlacementController.ts`、`src/game/Game.ts`。 |
| no-touch boundary | builder agency、resource payment、build progress、cancel/resume、footprint/occupancy、right-click commands、HUD cache、selection、AI、combat 未触碰。 |
| build | `pass`：`npm run build`。 |
| typecheck | `pass`：`npx tsc --noEmit -p tsconfig.app.json`。 |
| focused regression | `pass`：`building-agency` + `construction-lifecycle` + `pathing-footprint`，21/21。 |
| full runtime | `not run with reason`：diff 保持在 placement preview helper 抽取边界；focused pack 已覆盖直接合同。 |
| cleanup | `pass`：cleanup 和残留进程检查无 Vite / Playwright / chrome-headless-shell 残留。 |
| conclusion | `接受`。这是 placement preview helper 抽取，不批准 builder/payment/construction/pathing 语义变化。 |

### Task 35：HUD Command-Card Cache Transition Gap

| 项 | 当前记录 |
| --- | --- |
| chosen gap | `HUD command-card cache transitions`。 |
| queue state | `docs/GLM_READY_TASK_QUEUE.md` 记录 Task 35 `completed`；Codex closeout 结论为 `接受`。 |
| review log | `pass`：`docs/M7_SLICE_REVIEW_LOG.zh-CN.md` Slice 03 已补齐，结果：`接受`。 |
| touched files | `tests/hud-cache-transition-regression.spec.ts` new。 |
| product code changed | `No`。现有 `_lastCmdKey` cache invalidation 通过测试。 |
| proof shape | 5 个 focused deterministic tests，配合 `command-card-state-regression` 共形成 12/12 focused rerun。 |
| build | `pass`：`npm run build`。 |
| typecheck | `pass`：`npx tsc --noEmit -p tsconfig.app.json`。 |
| focused regression | `pass`：`hud-cache-transition-regression` 5/5；`command-card-state-regression` 7/7；Codex 本地总计 12/12。 |
| full runtime | `not run with reason`：Task 35 是 test-only focused gap proof；未触碰产品代码、shared harness、runner 或 package scripts。按 `M7_LOCAL_VERIFICATION_MATRIX`，focused rerun 足以接受。 |
| cleanup | `pass`：Codex 本地 rerun 后 cleanup 无 residual processes。 |
| conclusion | `接受`。它只证明一个 chosen gap，不能声称所有 HUD cache edge case 已关闭。 |

### Docs / Queue Sync

| 项 | 当前记录 |
| --- | --- |
| `M7_SLICE_REVIEW_LOG` | Task 33 / 34 / 35 均已接受。 |
| `GLM_READY_TASK_QUEUE` | Task 33 / 34 / 35 均记录为 completed；Task 35 的 Codex closeout 已提升为正式接受。 |
| residual register | `docs/M7_POST_HARDENING_RESIDUAL_DEBT_REGISTER.zh-CN.md` 已定义 M7 后可接受 debt 和 blocker debt。 |
| closeout packet | 本文已更新为当前 accepted engineering closeout with residual debt。 |

## 5. Residual Debt

### 5.1 当前阻断最终 `accepted engineering closeout` 的事项

当前无阻断项。

如果后续发现 build、typecheck、focused regression、cleanup、scope 或 test strength 失败，必须新增 blocker，并把状态从 `accepted engineering closeout with residual debt` 改为 `blocked`。

### 5.2 可接受的工程 residual

| ID | 范围 | 为什么仍未解决 | 是否阻断 M7 accepted closeout | 默认 owner / 时机 | 不能声称 |
| --- | --- | --- | --- | --- | --- |
| `M7-ENG-01` | Task 33 deprecated test shims | `Game` 上仍保留 `selectionRings`、`selBoxEl`、`createSelectionRing`、`clearSelectionRings` 等 backward-compatible shims。 | 否。它们是测试兼容债，不改变玩家行为。 | 后续测试 API 清理任务。 | 不能声称 selection test access 已完全迁移到 `g.sel.*`。 |
| `M7-ENG-02` | Task 34 controller boundary | `PlacementController.updatePreview` 仍从 `Game.ts` 接收 `getWorldHeight` callback 和 `PlacementValidator` reference。 | 否。当前 controller 仍保持 preview helper 边界。 | 后续 placement architecture cleanup。 | 不能声称 placement 模块已经完全自治。 |
| `M7-ENG-03` | Task 35 HUD cache coverage | 未覆盖 multi-select transition、portrait canvas、training queue progress、lumber-only 或 queuedSupply-only edge case。 | 否，只要 Task 35 明确只证明 chosen gap。 | 后续 contract-gap task。 | 不能声称所有 command-card/HUD cache edge case 都已关闭。 |
| `M7-ENG-04` | runtime suite registration | `hud-cache-transition-regression.spec.ts` 尚未记录为已加入 `scripts/run-runtime-suite.sh`。 | 否，除非 final review 要求它进入 full runtime floor。 | 后续 harness / runtime coverage sync。 | 不能声称 Task 35 proof 已自动进入 full runtime suite。 |
| `M7-ENG-05` | broader `Game.ts` structure | AI bridge、pathing fallback、asset refresh、camera/minimap 等 no-touch 区仍未抽取。 | 否。M7 当前只收 Task 33/34/35 小切片。 | 后续 M7+ / architecture hardening。 | 不能声称 `Game.ts` 结构风险清零。 |

### 5.3 用户判断 residual

| ID | 范围 | 等待谁判断 | 是否阻断 M7 工程 accepted closeout | 不能声称 |
| --- | --- | --- | --- | --- |
| `M7-USER-01` | M2 系统组合 | 用户 / 目标玩家 | 否，但不能代判。 | 不能声称 M2 人工 gate 已通过。 |
| `M7-USER-02` | M3 空间、镜头、可读性、proxy 方向 | 用户 / 目标玩家 | 否，但不能代判。 | 不能声称默认镜头和视觉方向已 human-approved。 |
| `M7-USER-03` | M4 alpha match loop、AI 压力、ending clarity | 用户 / 目标玩家 | 否，但不能代判。 | 不能声称短对局体验已被接受。 |
| `M7-USER-04` | M5 产品方向和内容范围 | 用户 | 否，但不能代判。 | 不能声称下一阶段方向已批准。 |
| `M7-USER-05` | M6 私测 / 公开分享 | 用户 + release gate | 否，但不能代判。 | 不能声称当前版本可公开分享。 |
| `M7-USER-06` | 任何 M7 后续可见 tradeoff | 用户 / Codex product owner | 视 tradeoff 而定。 | 不能把工程 refactor 自动等同于玩家可接受。 |

## 6. Cannot Claim Boundaries

本 packet 不能被引用来声称：

- `Game.ts` 结构债已经清零。
- 所有 contract gap 都已关闭。
- Selection / placement 后续改动不再需要 focused regression。
- HUD command-card cache 的所有边界都已覆盖。
- M2-M6 任一人工 gate 已通过。
- AI 趣味、视觉方向、内容范围、玩法质量或 public-share readiness 已批准。
- 当前版本可以公开分享、公开 demo、release ready。
- 自动化测试通过可以替代人眼对可读性、手感、方向或分享等级的判断。

## 7. Codex Final Review Checklist

Codex final review 已完成；下面保留最终核对结果，供后续复查：

| 检查项 | 当前状态 | 处理 |
| --- | --- | --- |
| Task 33 review log | `pass` | 已接受。 |
| Task 34 review log | `pass` | 已接受。 |
| Task 35 review log | `pass` | Slice 03 已补齐并接受。 |
| Task 35 chosen gap 是否唯一 | `pass` | 只允许 `HUD command-card cache transitions`。 |
| Task 35 是否泛泛 coverage sweep | `pass` | 当前是 5 个 focused tests；保持不能扩张 claim。 |
| build/typecheck/focused regression | `pass` | Codex 已本地复跑。 |
| full runtime 是否需要 | `resolved` | 不需要；Task 35 保持 test-only focused proof 边界。 |
| cleanup | `pass` | Codex 已本地 cleanup。 |
| residual debt | `pass` | 本文已列 blocker、engineering residual、user judgment residual。 |
| cannot claim | `pass` | 本文已列边界。 |

如果后续任一必需项被新证据推翻，状态必须改成 `blocked` 并重新打开 closeout。

## 8. Closeout Statement For Current State

当前可写结论：

```text
M7 accepted engineering closeout with residual debt 已形成。
Task 33 SelectionController extraction、Task 34 PlacementController hardening、Task 35 HUD command-card cache transitions 均已被 Codex 按工程证据接受。
当前 M7 已正式关账；后续工作回到 V2 真实里程碑推进，不再继续扩写 M7 文书。
本 packet 不批准 M2-M6 人工 gate、玩法质量、视觉方向、私测或公开分享。
```

当前不可写结论：

```text
所有 M7 工程风险已关闭。
所有 command-card / HUD cache edge case 已证明。
M2-M6 用户判断已经通过。
当前版本可以公开分享。
```
