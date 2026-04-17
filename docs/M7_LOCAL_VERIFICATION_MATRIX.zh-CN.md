# M7 Local Verification Matrix

> 用途：Codex 本地复验 `Task 33 / 34 / 35` closeout 时使用。目标是判断 focused runtime pack 是否足够，什么时候必须升级到 full runtime，并把 exact pass/fail 结果写进 review log。

## 1. Verification Matrix

| Task | Baseline commands | Focused proof 够用的前提 | 强制扩大验证的 diff shape |
| --- | --- | --- | --- |
| `Task 33` SelectionController extraction | `npm run build`<br>`npx tsc --noEmit -p tsconfig.app.json`<br>`./scripts/run-runtime-tests.sh tests/selection-input-regression.spec.ts --reporter=list`<br>`./scripts/run-runtime-tests.sh tests/command-surface-regression.spec.ts tests/command-card-state-regression.spec.ts --reporter=list`<br>`FORCE_RUNTIME_CLEANUP=1 ./scripts/cleanup-local-runtime.sh` | diff 只在 selection helper / mapping / display input 边界；`Game.ts` 只做委托；没有改 right-click、command dispatch、HUD cache、control group 定义或 tests。 | 触碰 selection 之外的 input orchestration；改 command dispatch、right-click path、gather / attack / rally / build resume；改 `_lastCmdKey` / `_lastSelKey` 或 command-card refresh；改 tests / harness；无法从 diff 对照状态写入和迭代顺序。 |
| `Task 34` PlacementController hardening slice | `npm run build`<br>`npx tsc --noEmit -p tsconfig.app.json`<br>`./scripts/run-runtime-tests.sh tests/building-agency-regression.spec.ts tests/construction-lifecycle-regression.spec.ts tests/pathing-footprint-regression.spec.ts --reporter=list`<br>`FORCE_RUNTIME_CLEANUP=1 ./scripts/cleanup-local-runtime.sh` | diff 只在 placement mode、ghost / preview lifecycle、validator bridge；`PlacementValidator` 判定规则不变；没有改 builder agency、payment、build progress、footprint / occupancy 或 tests。 | 触碰 input event、selection state、right-click build resume、command surface；改 builder agency、resource payment、refund、build progress、cancel / resume；改 footprint / occupancy / anchor / size / rounding / pathing fallback；改 tests / harness；一个 slice 同时搬 placement、input、selection、command、HUD。 |
| `Task 35` Contract coverage gap sweep | `npm run build`<br>`npx tsc --noEmit -p tsconfig.app.json`<br>`./scripts/run-runtime-tests.sh <new-or-affected-specs> --reporter=list`<br>`FORCE_RUNTIME_CLEANUP=1 ./scripts/cleanup-local-runtime.sh` | 只有一个 chosen gap；新增/修改 spec 直接命中该 gap；没有弱化旧 regression；未改产品代码，或产品修复已由新 regression 先失败证明且范围极小。 | 同时补多个 gap；改产品代码；改 runner、shared runtime harness、package scripts；gap 跨 command / HUD / construction / resource / cleanup；focused spec 通过但 diff 影响范围超过 chosen gap；closeout 说不清现在证明什么。 |

## 2. 什么时候 `npm run test:runtime` 是 Mandatory

下面任一条件成立，focused pack 不够，必须运行：

```bash
npm run test:runtime
```

强制条件：

- `Task 33` diff 跨出 selection 边界，影响 input orchestration、command dispatch、HUD cache 或 right-click 结果。
- `Task 34` diff 跨出 placement-only 边界，影响 builder agency、payment、build progress、right-click build resume、footprint / occupancy 或 pathing fallback。
- `Task 35` 改了产品代码、runtime harness、runner、package scripts，或 chosen gap 横跨多个高风险合同。
- GLM closeout 只给 focused green，但 Codex review 发现 diff 影响面更大。
- focused regression 失败后又被修复，且修复触碰 shared gameplay state。
- reviewer 需要证明“没有跨系统副作用”，而不是只证明一个 spec 通过。

如果 full runtime 输出类似下面这种，结论必须记录为 `fail`，不能写成“跑过但大体可用”：

```text
> war3-re@0.1.0 test:runtime
> ./scripts/run-runtime-suite.sh

SHARD: core-controls
SPECS: tests/closeout.spec.ts tests/first-five-minutes.spec.ts tests/command-regression.spec.ts tests/combat-control-regression.spec.ts
...
SHARD FAILED: core-controls (52s)
>>> Stopping at first failure: core-controls
SUITE SUMMARY: 0/1 shards passed (FAILED at core-controls)
```

记录要点：

- 命令：`npm run test:runtime`
- 结果：`fail`
- 失败 shard：`core-controls`
- 首个失败位置：按实际输出填写文件、行号、测试名；如果输出只到 shard 失败，就写“首个失败未展开，需要重跑或打开完整报告”。
- 影响：不能接受该 slice，除非后续修复并重新通过 required verification。

## 3. Cleanup Expectations

每次跑 runtime / smoke / Playwright 后都要执行：

```bash
FORCE_RUNTIME_CLEANUP=1 ./scripts/cleanup-local-runtime.sh
```

Codex 复验时还应确认：

- 没有遗留 Vite dev / preview server。
- 没有遗留 Playwright 或 Chromium 进程。
- 没有 stale runtime test lock 继续阻塞下一轮。
- 如果 cleanup 发现并移除 stale lock，要在 review log 中写明。
- 如果 cleanup 失败或进程残留无法清理，closeout 不能报 green。

残留检查推荐记录为：

```text
cleanup：pass / fail
残留进程：无 / 有（列出 pid 或进程名）
runtime lock：无 / stale lock removed / still blocked
```

## 4. Exact Pass / Fail 记录格式

把验证结果写进 `M7_SLICE_REVIEW_LOG.zh-CN.md` 时，不写一句 “tests pass”。按下面格式填：

```text
### 证据

- build：pass / fail
  - command：npm run build
  - summary：
- typecheck：pass / fail
  - command：npx tsc --noEmit -p tsconfig.app.json
  - summary：
- focused regression：pass / fail / not run
  - command：
  - specs：
  - passed：
  - failed：
  - first failure：
- full runtime：pass / fail / not required / not run
  - command：npm run test:runtime
  - shards passed：
  - failed shard：
  - first failure：
  - reason required：
- cleanup：pass / fail
  - command：FORCE_RUNTIME_CLEANUP=1 ./scripts/cleanup-local-runtime.sh
  - residual process check：
```

接受口径：

- `focused regression: pass` 只证明 focused 范围。
- `full runtime: not required` 必须写理由。
- `full runtime: fail` 阻断接受，除非后续修复并重新验证。
- `cleanup: fail` 阻断接受，至少要补清理结果。

## 5. 不要用验证替代 scope 判断

即使 `npm run test:runtime` 通过，也不能接受这些 diff：

- scope 越界且没有新合同授权。
- 弱化或删除旧 tests。
- 把 zero-behavior-change slice 做成行为修改。
- 把 Task 35 做成泛泛测试 churn。
- 需要用户判断产品方向、视觉身份或手感是否更好。

验证只能证明候选 diff 没破坏已覆盖合同；不能把越界任务变成合格 M7 slice。
