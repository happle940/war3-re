# V8 Release Candidate Review Packet

> 用途：Codex 审查 GLM `Task 113 — V8 release candidate stability pack` 时使用。  
> 当前状态：`prepared / waiting for worker closeout`。本文不预先批准 V8-RC1。

## 1. 当前 V8 gate 状态

| Gate | 当前状态 | 证据 |
| --- | --- | --- |
| `V8-DEMO1` | `engineering-pass` | Task112 accepted；入口、开始、暂停返回+重开、结果返回、范围说明 smoke 5/5。 |
| `V8-COPY1` | `engineering-pass` | README、入口范围说明、copy truth packet 对齐。 |
| `V8-ASSET1` | `engineering-pass` | asset boundary packet 证明当前只用 S0 fallback / project proxy。 |
| `V8-FEEDBACK1` | `engineering-pass` | 入口反馈方式 + feedback capture / triage packet。 |
| `V8-RC1` | `open` | 等 Task113 证明 release candidate stability。 |
| `V8-UA1` | `async user gate` | 用户或 tester verdict 后续插入，不阻塞工程自动推进。 |

## 2. Task113 必须提交什么

GLM closeout 必须包含：

- 改动文件列表。
- `tests/v8-release-candidate-stability.spec.ts` 的证明范围。
- 是否修改 `scripts/run-runtime-suite.sh`，以及新增 shard 是否足够小。
- 完整验证命令结果，不接受 `tail` 截断：

```bash
npm run build
npx tsc --noEmit -p tsconfig.app.json
./scripts/run-runtime-tests.sh tests/v8-release-candidate-stability.spec.ts --reporter=list
./scripts/cleanup-local-runtime.sh
```

- 如果它引用了 V7 内容包，必须列出具体 spec 和通过结果。
- 如果它引用了 Task112 smoke，必须说明是直接调用、同测复用，还是只引用 accepted evidence。
- cleanup 后必须说明无 Vite / Playwright / Chromium / runtime 残留。

## 3. Codex 本地复核命令

最低复核：

```bash
npm run build
npx tsc --noEmit -p tsconfig.app.json
./scripts/run-runtime-tests.sh tests/v8-release-candidate-stability.spec.ts --reporter=list
./scripts/cleanup-local-runtime.sh
pgrep -fl 'vite|playwright|chrome-headless|Chromium|run-runtime-tests|node .*vite' || true
```

如果 Task113 改了 suite 脚本：

```bash
bash -n scripts/run-runtime-suite.sh
```

如果 Task113 声称 V7 内容包共存：

```bash
./scripts/run-runtime-tests.sh \
  tests/v7-lumber-mill-tower-branch-proof.spec.ts \
  tests/v7-workshop-mortar-combat-model-proof.spec.ts \
  tests/v7-arcane-sanctum-caster-proof.spec.ts \
  tests/v7-ai-same-rule-content-proof.spec.ts \
  tests/v7-beta-stability-regression.spec.ts \
  tests/v8-demo-path-smoke.spec.ts \
  --reporter=list
```

Codex 可按机器负载选择是否跑完整相关包；如果不跑，必须写清未跑的 residual risk。

## 4. 接受条件

Codex 只能在同时满足下面条件时把 `V8-RC1` 写成 `engineering-pass`：

- build 通过。
- app typecheck 通过。
- V8 RC focused spec 通过。
- Task112 demo smoke 仍可被引用或复跑。
- V7 selected content proof 不和 V8 entry / copy / feedback / asset gate 冲突。
- cleanup 通过，且没有本地 runtime 残留。
- closeout 没有把 V8 写成 public release、完整 War3 或用户已接受。

## 5. 拒收 / 接管条件

Codex 必须拒收或接管：

- GLM 再次用 `tail` 截断 build / tsc / runtime 输出。
- 测试只检查文件存在或按钮存在，没有证明 V8 RC 稳定性。
- 通过一个 focused spec 就宣称完整 release candidate 通过。
- 修改了未允许文件，例如 gameplay 规则、AI、素材或 README。
- cleanup 没跑或跑完仍有 Vite / Playwright / Chromium 残留。
- 将 `V8-UA1` 主观判断写成自动通过。

## 6. 收口后的动作

如果 Task113 accepted：

1. 更新 `docs/V8_EXTERNAL_RELEASE_EVIDENCE_LEDGER.zh-CN.md`：`V8-RC1` -> `engineering-pass`。
2. 更新 `docs/V8_EXTERNAL_RELEASE_REMAINING_GATES.zh-CN.md`：`V8-RC1` -> `engineering-pass`。
3. 更新 `docs/GLM_READY_TASK_QUEUE.md`：Task113 -> `accepted`。
4. 运行 `node scripts/milestone-oracle.mjs --json`。
5. 如果 engineering blockers 清零，只保留 `V8-UA1` 异步判断，并准备下一阶段 transition / closeout。

如果 Task113 blocked：

1. 不派发下一张实现任务。
2. 把失败点路由到 `V8-RC1`。
3. 写清是 runtime instability、suite gap、cleanup residual、还是 proof quality gap。
