# M7 Task 35 Review Packet：Contract Gap 覆盖审查

> 用途：Codex 审查 GLM `Task 35 — Contract Coverage Gap Sweep`。本文用于快速判断接受、拒绝或延期，防止 coverage work 退化成泛泛加测试。

## 1. Task 35 应该证明什么

Task 35 一次只证明一个高风险合同缺口：

- 选定一个具体 gap。
- 说明现有覆盖为什么只是部分覆盖。
- 新增一个 focused regression 或等价 proof。
- 只有当新 regression 先失败时，才允许做最小产品修复。
- 最终说清“现在证明了什么”和“仍未证明什么”。

Task 35 不是补测试数量，不是测试清理，不是重构，不是修品味，也不是把人工判断债伪装成工程合同。

## 2. 真合同缺口 vs 低价值覆盖

### 可以接受为真实 contract gap

真实 gap 必须同时满足：

- 有明确风险路径，例如 selection event 到 command dispatch、placement footprint roundtrip、HUD cache transition、order stale state、pathing fallback、death cleanup。
- 同样输入和初始状态下，可以定义应保持的状态、DOM、命令字段或实体结果。
- 能写成 deterministic regression，失败时能指向一个窄 owner。
- 能保护 `Task 33`、`Task 34`、后续 M7 extraction，或 M4/M6 的工程可理解性。
- 不是现有测试已经直接覆盖的同一断言。

### 应拒绝为重复或低价值覆盖

下面不算合格 Task 35：

- “补一些测试”但没有 chosen gap。
- 对已有 regression 做同义重复，只换名称或路径。
- 只断言页面能打开、元素存在、测试跑完，但不证明合同边界。
- 把“感觉手感不好”“AI 不够有趣”“镜头不舒服”“是否可公开分享”写成工程测试目标。
- 为了覆盖率数字新增脆弱、宽泛或依赖时序运气的测试。
- 同时覆盖多个系统，导致失败后无法判断 owner。

## 3. Acceptance Expectations

Codex 接受 Task 35 前，scope、proof shape、touched files 必须清楚。

| 项目 | 接受期望 |
| --- | --- |
| Chosen gap | 只能有一个，且能对应 ranking 中的高风险 gap 或 Task 33/34 的直接证据缺口。 |
| Proof shape | 优先 focused runtime regression；如果是 closeout review proof，必须说明为什么不需要新增 spec。 |
| Product code | 默认不允许改。只有新增 regression 先失败，且修复能限制在单一最小 owner 时才可接受。 |
| Test changes | 只能新增或窄改与 chosen gap 直接相关的 spec；不得弱化旧测试。 |
| Docs / scripts | 只有当 dispatch 明确允许且与新 proof 记录或运行入口直接相关时才可接受。 |
| Evidence | 必须列出具体命令、pass/fail、通过数量或失败摘要、cleanup 结果。 |
| Residual risk | 必须说明仍未证明的行为，不能把一个 focused proof 说成全系统覆盖。 |

默认允许范围来自 Task 35 dispatch：

- `tests/*.spec.ts`
- `docs/GAMEPLAY_REGRESSION_CHECKLIST.md`
- `docs/GLM_READY_TASK_QUEUE.md`
- `package.json`
- `scripts/run-runtime-suite.sh`

产品代码不是默认允许项。出现产品代码改动时，Codex 必须先确认新增 regression 是否先失败、修复是否最小、是否没有顺手改玩法 / AI / 路径 / 视觉。

## 4. Focused Review Checklist

Codex review 时按顺序检查：

| 检查项 | Yes / No | 备注 |
| --- | --- | --- |
| closeout 明确写出唯一 chosen gap。 |  |  |
| chosen gap 是工程合同缺口，不是人工判断债。 |  |  |
| 现有覆盖为什么不足已经说清。 |  |  |
| 新 proof 的断言直接命中该 gap。 |  |  |
| 没有同时补多个 gap。 |  |  |
| 没有删除、跳过、弱化现有 regression。 |  |  |
| 没有为了测试方便改 runtime helper 或测试入口语义。 |  |  |
| 如果改了产品代码，新 regression 曾先失败且修复最小。 |  |  |
| diff 没有混入重构、品味、AI、路径或视觉风格调整。 |  |  |
| 失败时可以把责任归到一个明确 owner。 |  |  |
| closeout 写清现在证明什么、仍未证明什么。 |  |  |
| cleanup 后没有 Vite / Playwright / Chromium 残留。 |  |  |

任一核心项为 `No`，不要接受。

## 5. Required Local Verification

接受前，至少需要 GLM closeout 提供命令结果，Codex 应按需本地复验：

```bash
npm run build
npx tsc --noEmit -p tsconfig.app.json
./scripts/run-runtime-tests.sh <new-or-affected-specs> --reporter=list
FORCE_RUNTIME_CLEANUP=1 ./scripts/cleanup-local-runtime.sh
```

如果出现任一情况，Codex 应升级到更大验证面：

- 新 gap 触碰 command / HUD / construction / resource / cleanup 的交叉边界。
- GLM 改了产品代码。
- 新 spec 依赖 shared runtime harness 或 runner 变化。
- focused spec 通过，但 diff 影响范围超过 chosen gap。

升级命令：

```bash
npm run test:runtime
```

不接受只写 “tests pass” 的 closeout；必须有具体命令、结果、通过数量或失败摘要、cleanup 状态。

## 6. Automatic Reject Conditions

出现任一项，Codex 应直接 `Reject` 或 `Defer`：

- 没有唯一 chosen gap。
- 同时补 selection、placement、HUD、AI、cleanup 多个方向。
- 新增测试与 ranking 或 Task 33/34 证据缺口无关。
- 重复已有测试断言，只增加测试数量。
- 把 human-judgment debt 写成工程 regression。
- 修改或弱化旧测试。
- 产品代码改动没有先由新 regression 证明。
- 为了修一个测试顺手改玩法、AI、路径、视觉、资源、建造或 command 语义。
- 改了任务允许范围外文件。
- closeout 只有结论，没有精确命令和 pass/fail。
- 需要靠人工试玩、截图或主观感觉判断是否通过。

如果发现真正行为缺陷但当前 proof 过宽，正确动作是拆成更小 contract / test task，不是接受泛化 sweep。

## 7. Closeout Logging Template

Codex 接受、拒绝或延期时，把下面内容复制进 `M7_SLICE_REVIEW_LOG.zh-CN.md` 的 `Slice 03` 条目。

```text
### Slice 03

- 名称：Contract coverage gap sweep
- 对应任务：Task 35
- reviewer：Codex
- 日期：

### 范围

- 选择 gap：
- ranking / 保护对象：
- 实际改动文件：
- 是否碰到任务外文件：是 / 否
- 是否改产品代码：是 / 否

### 行为等价 / 合同证明检查

- 现有覆盖为什么不足：
- 新 proof shape：
- 新 regression 是否先失败：是 / 否 / 不适用
- 明确现在证明的行为：
- 仍未证明的行为：
- 是否出现顺手修改语义：是 / 否

### 证据

- build：
- typecheck：
- focused regression：
- full runtime：
- cleanup：

### 结论

- 结果：接受 / 拒绝 / 延期
- 原因：
- 后续动作：
```

没有这条 review log，不要把 Task 35 视为真正收口。
