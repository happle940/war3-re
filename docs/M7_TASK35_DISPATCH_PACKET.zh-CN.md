# M7 Task 35 Dispatch Packet：Contract Coverage Gap Sweep

> 用途：给 `Task 35` 一份可直接发送给 GLM 的窄范围派发包。目标不是“补一些测试”，而是选一个明确高风险缺口，做成 deterministic regression，并只在被测试证明时做最小修复。

## 1. 进入条件

开始 `Task 35` 前，先回答：

- `Task 33` 是否已被 Codex 接受？
- `Task 34` 是否已被 Codex 接受？
- 如果没有，`Task 35` 是不是在给它们补直接缺口，而不是绕开它们？

默认规则：

- 如果 `Task 33` 证据不足，先补它的直接合同缺口。
- 如果 `Task 34` 证据不足，先补它的直接合同缺口。
- 只有在 `Task 33/34` 都已稳住时，才进入更泛化的 coverage gap sweep。

## 2. 任务目标

`Task 35` 一次只允许做一件事：

1. 选定一个高风险 gap。
2. 说明现有测试为什么只是部分覆盖。
3. 新增一个 focused regression。
4. 只有当新 regression 失败时，才允许做最小产品修复。

不允许把 `Task 35` 做成：

- 泛泛“补测试”
- 多方向扫荡
- 顺手重构
- 顺手优化玩法、AI 或视觉

## 3. 默认首攻顺序

如果没有新的更强证据，默认按这个顺序选 gap：

1. `SelectionController 事件语义边界`，若 `Task 33` 仍缺保护。
2. `Placement anchor / footprint roundtrip`，若 `Task 34` 仍缺保护。
3. `HUD command-card cache transitions`，若 `Task 33/34` 都已被接受。

除非 Codex 明确改写，不要跳过前面的更直接缺口。

## 4. Allowed Files

基础允许范围：

- `tests/*.spec.ts`
- `docs/GAMEPLAY_REGRESSION_CHECKLIST.md`
- `docs/GLM_READY_TASK_QUEUE.md`
- `package.json`
- `scripts/run-runtime-suite.sh`

产品代码不是默认允许项。

只有在这两个条件同时满足时，才允许最小产品修复：

1. 新 regression 先失败了。
2. GLM closeout 能明确指出是哪个单一文件、哪条被证明的行为需要修。

如果要修产品代码，必须把新增写入范围缩到最小，并在 closeout 里解释为什么不能只停在 spec-first 结果。

## 5. 明确 No-Touch 边界

`Task 35` 默认不能碰这些区域，除非所选 gap 直接指向它们，且 regression 已先失败：

- broad `Game.ts` rewrite
- `src/game/SimpleAI.ts`
- camera / minimap / map-load / visual identity
- asset refresh 管线大改
- README / release 文案
- 任何与当前 gap 无关的 tests 清理

如果一个 gap 需要跨多个高风险区一起改，那不是 `Task 35` 的合格首刀。

## 6. GLM 在开始前必须写清

closeout 前置摘要至少要有：

```text
Chosen gap:
Why current coverage is partial:
New proof shape:
Allowed files:
Forbidden files:
If test fails, default repair file:
```

如果这 6 项写不清，Codex 直接退回，不进入实现。

## 7. 最低验证面

GLM 必须实际运行：

```bash
npm run build
npx tsc --noEmit -p tsconfig.app.json
./scripts/run-runtime-tests.sh <new-or-affected-specs> --reporter=list
FORCE_RUNTIME_CLEANUP=1 ./scripts/cleanup-local-runtime.sh
```

下面任一情况成立时，Codex 本地复验应升级：

- 新 gap 触碰 command / HUD / construction / resource / cleanup 的交叉边界
- GLM 改了产品代码
- reviewer 需要更大验证面才能判断影响范围

升级方式：

```bash
npm run test:runtime
```

## 8. 自动拒绝条件

出现任一项，Codex 直接退回或接管：

- 没有明确 chosen gap
- 同时补多个 gap
- 为了让新测试更容易而弱化旧测试
- 用 human-judgment debt 伪装成工程缺口
- 改了任务外文件
- closeout 只有“tests pass”，没有精确命令和结果
- 为了修一个测试顺手改玩法、AI、路径或视觉风格

## 9. GLM Closeout 格式

GLM closeout 至少要包含：

- `Chosen gap`
- `Files changed`
- `Whether product code changed`
- `Commands run`
- `Exact pass/fail results`
- `What is now proven`
- `What is still not proven`
- `Remaining ambiguity`

最后必须回答：

```text
Task 35 result: accept-ready / evidence-insufficient / out-of-scope
```

## 10. Codex 接受后立即要做的事

Codex 接受 `Task 35` 后，必须马上：

- 更新 [`docs/GLM_READY_TASK_QUEUE.md`](/Users/zhaocong/Documents/war3-re/docs/GLM_READY_TASK_QUEUE.md)
- 更新 [`docs/CODEX_ACTIVE_QUEUE.md`](/Users/zhaocong/Documents/war3-re/docs/CODEX_ACTIVE_QUEUE.md)
- 必要时更新 [`docs/GAMEPLAY_REGRESSION_CHECKLIST.md`](/Users/zhaocong/Documents/war3-re/docs/GAMEPLAY_REGRESSION_CHECKLIST.md)
- 记录它到底保护了哪个 slice / milestone

如果 `Task 35` 接受后仍说不清保护了什么，这次 sweep 就没有真正收口。
