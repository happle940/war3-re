# M7 Slice Review Log

> 用途：记录每一个 M7 slice 的审查结果，避免“我记得这个应该看过了”。
> 规则：没有 review 记录，就不算真正接受。

---

## 使用方式

每完成一个 slice，就复制一份下面的模板并填写。

记录重点不是“写得漂亮”，而是把这 4 件事写清楚：

- 改了什么
- 证明了什么
- 有没有越界
- 结果是接受、拒绝还是延期

---

## Slice Review Template

### Slice

- 名称：
- 对应任务：
- reviewer：
- 日期：

### 范围

- 目标边界：
- 实际改动文件：
- 是否碰到任务外文件：

### 行为等价检查

- 明确不变的行为：
- 可能受影响的合同：
- 是否出现顺手修改语义：

### 证据

- build：
- typecheck：
- focused regression：
- full runtime：
- cleanup：

### 结论

- 结果：`接受` / `拒绝` / `延期`
- 原因：
- 后续动作：

---

## 预置条目

### Slice 01

- 名称：SelectionController extraction slice
- 对应任务：`Task 33`
- reviewer：Codex
- 日期：2026-04-13

### 范围

- 目标边界：selection query / lookup helper、screen-space query、selection ring lifecycle、box-select visual helper
- 实际改动文件：`src/game/SelectionController.ts`、`src/game/Game.ts`
- 是否碰到任务外文件：否

### 行为等价检查

- 明确不变的行为：
  - 左键单选：未变
  - 拖框选择：未变
  - Shift 追加：未变
  - 右键命令结果：未变
  - command card / portrait 刷新：未变
  - Tab / control group：未变
- 可能受影响的合同：selection-input、command-surface、command-card-state
- 是否出现顺手修改语义：否

### 证据

- build：pass
  - command：`npm run build`
  - summary：Codex 本地通过；Vite 仅有大 chunk warning，无 build failure
- typecheck：pass
  - command：`npx tsc --noEmit -p tsconfig.app.json`
  - summary：Codex 本地无输出通过
- focused regression：pass
  - commands：
    - `./scripts/run-runtime-tests.sh tests/selection-input-regression.spec.ts --reporter=list`
    - `./scripts/run-runtime-tests.sh tests/command-surface-regression.spec.ts tests/command-card-state-regression.spec.ts --reporter=list`
  - passed：`6/6` + `20/20`
  - failed：`0`
  - first failure：无
- full runtime：pass（GLM closeout）
  - command：`npm run test:runtime`
  - shards passed：`5/5`
  - tests passed：`117/117`
  - summary：GLM closeout recorded `846s total`; Codex reviewed scope and accepted focused local reruns as sufficient for local reproduction
- cleanup：pass
  - command：`FORCE_RUNTIME_CLEANUP=1 ./scripts/cleanup-local-runtime.sh`
  - residual process check：无 Vite / Playwright / chrome-headless-shell 残留；`ps aux | rg ...` 仅命中当前 `rg`

### 结论

- 结果：`接受`
- 原因：改动范围只在 `Game.ts` 与新 `SelectionController.ts`，且保留了 input orchestration、HUD cache、right-click command path、control group / Tab / Esc、死亡清理等 no-touch 边界。Codex 本地 build / typecheck / focused runtime 全绿，GLM full runtime 也全绿。
- 后续动作：更新 GLM/Codex 队列；继续派发 `Task 34 — M7 PlacementController Hardening Slice`

### Slice 02

- 名称：PlacementController hardening slice
- 对应任务：`Task 34`
- reviewer：Codex
- 日期：2026-04-13

### 范围

- 目标边界：ghost preview mesh creation、preview position update、validation color feedback
- 实际改动文件：`src/game/PlacementController.ts`、`src/game/Game.ts`
- 是否碰到任务外文件：否

### 行为等价检查

- 明确不变的行为：
  - 进入 / 退出 placement mode：未变
  - preview 吸附到 tile 中心：未变
  - preview 高度偏移：未变
  - validation 绿 / 红反馈：未变
  - place / cancel / builder assignment：未变
  - resource payment / build progress / footprint occupancy：未变
  - right-click / resume / builder agency：未变
- 可能受影响的合同：building-agency、construction-lifecycle、pathing-footprint
- 是否出现顺手修改语义：否

### 证据

- build：pass
  - command：`npm run build`
  - summary：GLM closeout reported local build clean
- typecheck：pass
  - command：`npx tsc --noEmit -p tsconfig.app.json`
  - summary：GLM closeout reported app typecheck clean
- focused regression：pass
  - command：`./scripts/run-runtime-tests.sh tests/building-agency-regression.spec.ts tests/construction-lifecycle-regression.spec.ts tests/pathing-footprint-regression.spec.ts --reporter=list`
  - passed：`21/21`
  - failed：`0`
  - first failure：无
- full runtime：未升级
  - reason：diff 保持在 placement preview helper 抽取边界内，且本地 focused pack 已覆盖 builder agency、construction lifecycle、pathing footprint 三条直接合同
- cleanup：pass
  - commands：
    - `FORCE_RUNTIME_CLEANUP=1 ./scripts/cleanup-local-runtime.sh`
    - `ps aux | rg 'node .*vite|playwright|chrome-headless-shell' || true`
  - residual process check：无 Vite / Playwright / chrome-headless-shell 残留；仅命中当前 `rg`

### 结论

- 结果：`接受`
- 原因：改动只把现有 ghost preview mesh 创建和 preview 更新逻辑搬进 `PlacementController`，没有扩展到 builder、payment、construction state 或 pathing fallback。Codex 本地 rerun 的 21 个直接相关回归和 cleanup 都通过，范围和证据足以接受。
- 后续动作：更新队列状态；派发 `Task 35 — M7 Contract Coverage Gap Sweep`

### Slice 03

- 名称：Contract coverage gap sweep
- 对应任务：`Task 35`
- reviewer：Codex
- 日期：2026-04-13

### 范围

- 目标边界：只验证 `HUD command-card cache transitions` 这一条 chosen gap，不扩张成泛泛 coverage sweep
- 实际改动文件：`tests/hud-cache-transition-regression.spec.ts`
- 是否碰到任务外文件：否

### 行为等价检查

- 明确不变的行为：
  - product code：未变
  - `_lastCmdKey` cache invalidation 逻辑：未变
  - selection / placement / construction / death cleanup 语义：未变
  - command-card disabled reason 刷新：未变，只新增 focused proof
- 可能受影响的合同：command-card-state、selection transition、construction cancel/completion、death cleanup、resource/supply refresh
- 是否出现顺手修改语义：否

### 证据

- build：pass
  - command：`npm run build`
  - summary：Codex 本地通过；Vite 仅有大 chunk warning，无 build failure
- typecheck：pass
  - command：`npx tsc --noEmit -p tsconfig.app.json`
  - summary：Codex 本地无输出通过
- focused regression：pass
  - command：`./scripts/run-runtime-tests.sh tests/hud-cache-transition-regression.spec.ts tests/command-card-state-regression.spec.ts --reporter=list`
  - passed：`12/12`
  - failed：`0`
  - first failure：无
- full runtime：不升级
  - reason：Task 35 是 test-only focused gap proof；未触碰产品代码、runner、shared harness 或 package scripts。按 `M7_LOCAL_VERIFICATION_MATRIX`，focused rerun 足以接受。
- cleanup：pass
  - command：`FORCE_RUNTIME_CLEANUP=1 ./scripts/cleanup-local-runtime.sh`
  - residual process check：cleanup 完成，无本地 runtime 残留

### 结论

- 结果：`接受`
- 原因：Task 35 保持了唯一 chosen gap，新增 proof 直接命中 HUD command-card cache transition 风险，没有把 scope 扩张到多 gap、产品代码或 shared harness。Codex 本地 build / typecheck / focused runtime / cleanup 全部复验通过，证据足以把它从 `accept-ready` 升级为正式接受。
- 后续动作：`M7_HARDENING_CLOSEOUT_PACKET.zh-CN.md` 改为 `accepted engineering closeout with residual debt`；Codex 主线退出 M7 关账，转向 V2 真实里程碑的前门、战场第一眼和产品壳层推进。

---

## 拒绝时的最小记录要求

如果某个 slice 被拒绝，至少写清楚：

- 是 scope 越界
- 还是行为可能变化
- 还是证据不足
- 还是任务拆分本身错了

否则下一轮很容易重复犯同一个错误。
