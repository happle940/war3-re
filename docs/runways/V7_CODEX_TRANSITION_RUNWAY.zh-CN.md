# V7 Codex Transition Runway

> 用途：定义 `V7 content and beta candidate` 正式 cutover 后 Codex lane 的首批 seed draft。  
> 本文件是 `V6_TO_V7` preheat 产物；V7 尚未 active，不得直接派发 live queue。

## 0. 当前口径

```text
transitionId: V6_TO_V7
currentMilestone: V6 War3 identity alpha
nextMilestone: V7 content and beta candidate
runwayState: seed-draft / not-dispatched
```

Codex 在 V7 的职责：

- 冻结 V7 beta 范围。
- 维护 gate / ledger / bootstrap / runway 一致性。
- 把用户反馈和 GLM closeout 转成证据或失败面。
- 决定何时接受、拒收或接管 GLM 小切片。
- 准备 beta candidate 审查包，但不代替用户做 verdict。

Codex 不做：

- 未授权素材导入。
- public demo / release candidate 包装。
- 无边界完整人族一次性实现。
- 纯审美 polish，除非它阻断 beta 审查路径。

## 1. Handoff contract 摘要

| 字段 | 当前值 |
| --- | --- |
| `fromVersionOutcome` | V6 War3 identity alpha |
| `toVersionFocus` | V7 content and beta candidate |
| `mustStayInFromVersion` | 任何仍 open 的 V6 blocker |
| `allowedCarryover` | V6 polish debt；V6 non-critical UX debt |
| `residualRouting` | V6 identity tuning debt -> V7 content complete tuning；V6 onboarding debt -> V7 beta usability hardening |
| `netNewBlockers` | 内容完整度达到 beta 候选；核心模式/地图/素材组合能持续 playtest；beta 级稳定性与回归面 |

## 2. Seed Draft

这些任务不是 live queue。只有 `V6_TO_V7` 进入 cutover-ready / cutover-done 后，才能转入 `docs/CODEX_ACTIVE_QUEUE.md`。

### V7-CX1：Beta 范围冻结包

Status: `seed-draft`.

Gate: `V7-SCOPE1`.

Goal:

把 V7 要做的 Human 内容范围冻结下来，明确本版做什么、不做什么、哪些债务后移到 V8/V9。

Allowed files:

- `docs/V7_CONTENT_BETA_REMAINING_GATES.zh-CN.md`
- `docs/V7_CONTENT_BETA_EVIDENCE_LEDGER.zh-CN.md`
- `docs/HUMAN_RACE_PARITY_AND_NUMERIC_SYSTEM.zh-CN.md`
- `docs/CODEX_ACTIVE_QUEUE.md` only for cutover seed sync

Must satisfy:

- 选定 V7 Human 内容范围不能超过可测试能力。
- 必须点名 Lumber Mill / tower branches / Arcane Sanctum / Priest/Sorceress / Workshop/Mortar 哪些进入当前切片，哪些后移。
- 不能把完整 War3 终局写进 V7。

### V7-CX2：Human 内容证明矩阵

Status: `seed-draft`.

Gate: `V7-HUM1`.

Goal:

把每个选定 Human 内容对象映射到数据、前置、命令卡、runtime proof 和玩家可见状态，给 GLM 派发小切片。

Allowed files:

- `docs/V7_CONTENT_BETA_REMAINING_GATES.zh-CN.md`
- `docs/V7_CONTENT_BETA_EVIDENCE_LEDGER.zh-CN.md`
- `docs/GLM_READY_TASK_QUEUE.md` only after cutover

Must satisfy:

- 每个新增单位、建筑、科技都要有数值行和真实行为入口。
- 每个 GLM 任务必须有 allowed / forbidden files、focused proof 和 cleanup 要求。
- 不允许用模型、按钮或文案替代 gameplay proof。

### V7-CX3：高级数值与战斗模型接线计划

Status: `seed-draft`.

Gate: `V7-NUM2`.

Goal:

确定 V7 最先补哪两类高级模型，例如 projectile / target filters / caster mana / AOE / upgrade levels，并固定证明方式。

Allowed files:

- `docs/V7_CONTENT_BETA_REMAINING_GATES.zh-CN.md`
- `docs/V7_CONTENT_BETA_EVIDENCE_LEDGER.zh-CN.md`
- `docs/HUMAN_RACE_PARITY_AND_NUMERIC_SYSTEM.zh-CN.md`

Must satisfy:

- 必须复用 V6 的数值 schema 和 research effect model。
- 每个模型都要有 data-driven 入口和 runtime proof。
- 不允许在 `Game.ts` 里继续加一次性常量。

### V7-CX4：Beta 候选审查包

Status: `seed-draft`.

Gate: `V7-BETA1`.

Goal:

收集 V7 的可玩内容、验证命令、已知缺口和不可对外承诺范围，形成用户或 tester 可审查材料。

Allowed files:

- `docs/V7_CONTENT_BETA_EVIDENCE_LEDGER.zh-CN.md`
- `docs/CODEX_ACTIVE_QUEUE.md` only for closeout sync
- future packet file after cutover: `docs/V7_BETA_CANDIDATE_REVIEW_PACKET.zh-CN.md`

Must satisfy:

- 审查包必须写清“证明什么”和“不证明什么”。
- 必须保留用户或 tester verdict 字段。
- 不得写成 public demo、release candidate 或完整 War3 parity。

## 3. Codex 复核底线

每个 GLM closeout 后，Codex 必须检查：

- 是否只改 allowed files。
- proof 是否从真实数据和 runtime state 推导。
- 是否有 build / typecheck / focused runtime / cleanup。
- 是否有资源、人口、前置、科技和 AI 同规则证明。
- 是否留下 Playwright / Vite / Chromium 残留。
- 是否把受控切片夸大成完整人族、public demo 或 release candidate。

## 4. 当前保守结论

```text
这是 V7 Codex runway 的预热草案。
它只定义 cutover 后 Codex 如何冻结范围、验收 GLM、维护证据和准备 beta 审查包。
它不激活 V7，也不派发 live queue。
```
