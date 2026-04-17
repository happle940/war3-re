# V8 External Release Evidence Ledger

> 用途：记录 `V8 external demo and release candidate` 的工程证据、用户判断证据和残余债务。  
> 上游 gate 清单：`docs/V8_EXTERNAL_RELEASE_REMAINING_GATES.zh-CN.md`。

## 0. 使用规则

- 每条 V8 blocker 必须绑定具体文件、命令、截图包、smoke 记录或 review packet。
- V7 的 evidence 只能作为地基；不能直接关闭 V8-DEMO1 / RC1 / COPY1 / ASSET1 / FEEDBACK1。
- 用户或 tester verdict 可以异步；如果 reject，必须写回对应 gate。
- 外部口径必须保守，不能把 demo candidate 写成完整 War3、public release 或 release candidate 已通过。

## 1. V8 blocker evidence ledger

| Gate | 当前状态 | 必需工程证据 | 必需用户判断证据 | 当前结论 |
| --- | --- | --- | --- | --- |
| `V8-DEMO1` External demo path | `engineering-pass` | `tests/v8-demo-path-smoke.spec.ts` 5/5；Codex 本地复核 `npm run build`、`npx tsc --noEmit -p tsconfig.app.json`、focused smoke、cleanup、无残留均通过。 | tester 判断是否能自助进入和理解仍异步。 | 入口初始化、开始 demo、暂停返回+重开、结果返回、范围说明可见均成立。 |
| `V8-RC1` Release candidate stability | `engineering-pass` | `tests/v8-release-candidate-stability.spec.ts` 5/5；V7 数据表、训练+战斗共存、普通入口完整会话生命周期、HUD/命令状态、清理+恢复均通过。Codex 本地复核 `bash -n scripts/run-runtime-suite.sh`、`npm run build`、`npx tsc --noEmit -p tsconfig.app.json`、focused RC、cleanup、无残留均通过。 | tester 判断严重 bug 是否阻断仍异步。 | Task113 已 Codex accepted；V8 工程 blocker 清零，只保留异步用户/tester verdict。 |
| `V8-COPY1` External truth and scope copy | `engineering-pass` | `README.md`、入口范围说明、`docs/V8_EXTERNAL_COPY_TRUTH_PACKET.zh-CN.md` 已对齐：可玩范围、未实现范围、反馈方式、非完整 War3 / 非公开发布边界。 | 用户判断对外口径是否可接受仍异步。 | 工程口径不再停留在 V2，也未宣称完整 War3、public release 或 release-ready。 |
| `V8-ASSET1` Approved asset boundary | `engineering-pass` | `docs/V8_EXTERNAL_ASSET_BOUNDARY_PACKET.zh-CN.md` 盘点 public/src：当前外部可见素材只有 S0 fallback / project proxy；未发现官方未授权、拆包、fan remake、来源不明图片/音频/模型进入外部 demo。 | 用户可异步审批素材策略；若后续新增真实素材，必须重新打开。 | 当前 V8 外部试玩候选可继续使用 proxy / fallback / procedural 边界，不得宣称最终素材或官方素材。 |
| `V8-FEEDBACK1` Feedback capture and triage | `engineering-pass` | 入口页反馈方式 + `docs/V8_FEEDBACK_CAPTURE_AND_TRIAGE_PACKET.zh-CN.md` 的记录模板、P0-P5 分级、gate 回流和任务转译规则。 | tester 反馈可异步回收。 | 反馈能记录、分级并回流到 V8 gate 或后续任务。 |

## 2. V7 handoff evidence

| 输入 | 当前状态 | V8 路由 | 当前结论 |
| --- | --- | --- | --- |
| V7-SCOPE1 | `engineering-pass` | V8-COPY1 | V7 范围边界可作为外部文案基础。 |
| V7-HUM1 | `engineering-pass` | V8-DEMO1 / V8-RC1 | 塔线、法师线、工程线可作为 demo 内容基础。 |
| V7-NUM2 | `engineering-pass` | V8-RC1 | Priest mana 与 Mortar AOE/filter 可作为稳定性输入。 |
| V7-AI1 | `engineering-pass` | V8-DEMO1 / V8-RC1 | AI 同规则使用内容可作为 demo 对局基础。 |
| V7-STAB1 | `engineering-pass` | V8-RC1 | V7 内容包 31/31 是 V8 RC 稳定性地基，不等于 V8 RC 通过。 |
| V7-BETA1 | `engineering-pass` | V8-COPY1 / V8-DEMO1 | beta candidate 审查包已 candidate-ready。 |
| V7-UA1 | `user-open / async` | V8-UA1 | 用户或 tester verdict 保留异步回流。 |

## 3. Conditional / user evidence ledger

| Gate | 当前状态 | 工程处理 | 用户判断 |
| --- | --- | --- | --- |
| `V8-PRES1` | `residual / active` | 只有阻断 demo 自助理解时升级。 | 异步。 |
| `V8-BAL1` | `residual / active` | 只有阻断 demo 稳定性或 RC 证明时升级。 | 异步。 |
| `V8-UA1` | `user gate / user-open / async` | 工程准备证据，不代判 verdict。 | 用户或 tester 后续给出。 |

## 4. V8 accepted evidence

### V8-RC1 — Release candidate stability

Accepted at: `2026-04-15 13:53:14 CST`.

Evidence:

- `tests/v8-release-candidate-stability.spec.ts`
- `tests/v8-demo-path-smoke.spec.ts`
- `scripts/run-runtime-suite.sh`
- `docs/GLM_READY_TASK_QUEUE.md`

Codex verification:

```bash
bash -n scripts/run-runtime-suite.sh
npm run build
npx tsc --noEmit -p tsconfig.app.json
./scripts/run-runtime-tests.sh tests/v8-release-candidate-stability.spec.ts --reporter=list
./scripts/cleanup-local-runtime.sh
pgrep -fl 'vite|playwright|chrome-headless|Chromium|run-runtime-tests|node .*vite' || true
```

Result:

```text
suite script syntax pass.
build pass.
typecheck pass.
V8 release candidate stability 5/5 pass.
cleanup complete.
No Vite / Playwright / Chromium / runtime leftovers.
```

Conclusion:

```text
V8-RC1 engineering-pass.
The RC pack proves V7 content data, V7 training/combat, normal entry session lifecycle, HUD/command state, and cleanup/recovery coexist in the V8 candidate.
```

Residual:

- This does not replace external tester verdict.
- It does not claim public release, complete War3 parity, complete Human roster, final art, multiplayer, campaign, ladder, replay, or official asset readiness.

### V8-DEMO1 — External demo path

Accepted at: `2026-04-15 13:44:44 CST`.

Evidence:

- `tests/v8-demo-path-smoke.spec.ts`
- `index.html`
- `src/styles.css`
- `docs/GLM_READY_TASK_QUEUE.md`

Codex verification:

```bash
npm run build
npx tsc --noEmit -p tsconfig.app.json
./scripts/run-runtime-tests.sh tests/v8-demo-path-smoke.spec.ts --reporter=list
./scripts/cleanup-local-runtime.sh
```

Result:

```text
build pass.
typecheck pass.
V8 demo path smoke 5/5 pass.
cleanup complete.
No Vite / Playwright / Chromium / runtime leftovers.
```

Residual:

- This proves the local external path mechanics; it does not replace user or tester verdict.
- It does not prove full release candidate stability; that remains `V8-RC1`.

### V8-COPY1 — External truth and scope copy

Accepted at: `2026-04-15 13:44:44 CST`.

Evidence:

- `README.md`
- `index.html`
- `docs/V8_EXTERNAL_COPY_TRUTH_PACKET.zh-CN.md`
- `tests/v8-demo-path-smoke.spec.ts`

Conclusion:

```text
V8-COPY1 engineering-pass.
README and entry scope copy both say this is a V8 external demo / release candidate preparation state.
They name current playable scope, missing long-scope systems, feedback route, and no-complete-War3 / no-public-release boundary.
```

Residual:

- User can still reject the wording asynchronously; that routes to `V8-UA1` or a copy follow-up.
- Future README or entry edits must preserve the no-overclaim boundary.

### V8-ASSET1 — Approved asset boundary

Accepted at: `2026-04-15 13:41:00 CST`.

Evidence:

- `docs/V8_EXTERNAL_ASSET_BOUNDARY_PACKET.zh-CN.md`
- `src/game/AssetCatalog.ts`
- `docs/ASSET_APPROVAL_HANDOFF_PACKET.zh-CN.md`
- `docs/ASSET_SOURCING_AND_GOVERNANCE.zh-CN.md`
- public/src asset inventory: only `public/assets/models/buildings/townhall.glb` and `public/assets/models/units/worker.glb` are actual binary model files in the current public asset surface.

Conclusion:

```text
V8-ASSET1 engineering-pass.
Current external-visible asset boundary is S0 fallback / project proxy / procedural.
No unauthorized official asset, ripped asset, fan remake asset, unknown-source web image, unapproved external audio, or approved third-party real asset is part of the V8 candidate surface.
```

Residual:

- If any new external-visible asset file is added, this gate must reopen until a matching approved-for-import packet exists.
- This does not approve final art quality, War3 parity, or human first-look acceptance.

### V8-FEEDBACK1 — Feedback capture and triage

Accepted at: `2026-04-15 13:44:44 CST`.

Evidence:

- `index.html`
- `tests/v8-demo-path-smoke.spec.ts`
- `docs/V8_FEEDBACK_CAPTURE_AND_TRIAGE_PACKET.zh-CN.md`

Conclusion:

```text
V8-FEEDBACK1 engineering-pass.
The entry page names the feedback route; the V8 feedback packet defines capture fields, P0-P5 triage, gate routing, and task translation.
```

Residual:

- Actual tester feedback remains asynchronous.
- Any P0/P1 feedback can reopen `V8-DEMO1`, `V8-RC1`, `V8-COPY1`, `V8-ASSET1`, or `V8-FEEDBACK1`.

## 5. 当前保守结论

```text
V8 is active.
V8-DEMO1, V8-RC1, V8-COPY1, V8-ASSET1, and V8-FEEDBACK1 have engineering evidence.
V8 engineering blockers are clear.
V8-UA1 remains async user/tester verdict and does not block engineering transition.
```

## 6. 更新模板

```text
Gate:
State before:
Engineering evidence:
User evidence:
State after:
Residual debt:
Next owner:
```
