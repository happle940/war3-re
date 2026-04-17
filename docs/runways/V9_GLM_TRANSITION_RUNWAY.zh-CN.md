# V9 GLM Transition Runway

> GLM 在 V9 负责窄切片、可验证 proof 和机械同步。GLM 不负责方向选择，也不能自行把 gate 标成 accepted。

## 1. GLM ownership

- 反馈 triage 的窄 proof。
- V8 baseline replay 的 focused smoke。
- 已确认 hotfix 的最小 regression test。
- cleanup 与无残留证明。
- 按 Codex 指定同步 queue closeout。

## 2. Candidate tasks

| Task | Status | Allowed scope | Goal |
| --- | --- | --- | --- |
| `Task 115 — V9 hotfix triage proof pack` | ready-after-cutover | feedback docs、triage proof、queue closeout | 证明一条反馈能被记录、分级并路由到 hotfix / patch / debt / user gate。 |
| `Task 116 — V9 baseline replay smoke pack` | ready-after-115-or-parallel-if-safe | V8 demo smoke、V8 RC smoke、baseline notes、queue closeout | 证明 V8 baseline 可复跑、可清理、可解释。 |
| `Task 117 — First confirmed feedback regression pack` | blocked-until-real-feedback | focused regression spec、最小修复、queue closeout | 只处理真实 P0/P1 或 Codex 批准的 P2 反馈。 |

## Task 115 — V9 hotfix triage proof pack

Goal:

用一条样例反馈证明 V9 能把外部反馈记录、分级，并路由到 hotfix / patch / debt / user gate，不再让反馈停在聊天里。

Write scope:

- `docs/V9_MAINTENANCE_EXPANSION_EVIDENCE_LEDGER.zh-CN.md`
- `docs/V8_FEEDBACK_CAPTURE_AND_TRIAGE_PACKET.zh-CN.md`
- `tests/v9-hotfix-triage-proof.spec.mjs`

Must prove:

1. 样例反馈有版本、环境、复现步骤、影响范围和严重度字段。
2. P0/P1 反馈会路由到 hotfix / patch，不会被当成普通建议。
3. P2-P5 反馈能被分到 patch、debt、user gate 或 expansion 候选。
4. 输出任务必须带 gate、文件范围、验证方式和不做项。
5. 不能把用户 verdict 自动写成通过。

## Task 116 — V9 baseline replay smoke pack

Goal:

复跑 V8 demo smoke 和 V8 RC smoke 的最小 baseline proof，证明 V9 开始时有一个可复现、可清理、可解释的候选版基线。

Write scope:

- `tests/v8-demo-path-smoke.spec.ts`
- `tests/v8-release-candidate-stability.spec.ts`
- `tests/v9-baseline-replay-smoke.spec.ts`
- `docs/V9_MAINTENANCE_EXPANSION_EVIDENCE_LEDGER.zh-CN.md`

Must prove:

1. V8 demo path smoke 仍可复跑或被 V9 baseline smoke 直接覆盖。
2. V8 RC stability smoke 仍可复跑或被 V9 baseline smoke 直接覆盖。
3. cleanup 后没有 Vite / Playwright / Chromium / runtime 残留。
4. baseline 说明明确哪些是已知缺口，哪些才是回归。
5. 不新增 gameplay 内容、素材、AI 策略或长期扩展方向。

## 3. Standard verification

每张 GLM 任务 closeout 至少包含：

```bash
npm run build
npx tsc --noEmit -p tsconfig.app.json
./scripts/run-runtime-tests.sh <focused spec> --reporter=list
./scripts/cleanup-local-runtime.sh
```

文档/队列类 proof 如果没有 runtime change，也必须说明为什么无需 runtime，并至少跑相关 node tests 或 markdown/state parser。

## 4. Hard boundaries

GLM 不得：

- 自行选择长期扩展方向。
- 引入新兵种、英雄、素材、地图或 AI 策略，除非 Codex 任务明确允许。
- 把 V9-HOTFIX1 / V9-BASELINE1 / V9-EXPAND1 标成 engineering-pass；只能写 worker completed，等 Codex accepted。
- 用 tail 截断 build / tsc / runtime 输出。
- 在同一任务里同时改反馈系统、baseline、扩展方向和 gameplay。
