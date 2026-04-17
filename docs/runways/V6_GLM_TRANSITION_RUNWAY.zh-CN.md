# V6 GLM Transition Runway

> 用途：定义 `V6 War3 identity alpha` 正式 cutover 后，GLM 可以持续领取的首批 bounded proof pack。  
> 状态：`V5_TO_V6` preheat seed draft。V6 尚未 active，本文件不得直接派发 live queue。

## 0. 使用边界

GLM 在 V6 的职责不是决定产品方向，也不是提前实现完整身份系统。

GLM 只接这类任务：

- 一个明确 V6 gate。
- 一个 bounded proof pack。
- 一组受控 runtime fixture。
- focused regression、state log、截图或 review packet 的最小证据生产。
- proof 失败时点名最小失败面，并交给 cutover 后的独立 bounded task 处理。
- 结案必须给出原始验证命令和剩余未知。

GLM 不接：

- 当前 V5 closeout，尤其 `V5-COUNTER1`。
- gameplay implementation 或完整内容扩张。
- UI polish、菜单质量裁决、presentation-only 任务。
- 真实素材 sourcing、授权判断、风格审批或导入。
- 完整英雄池、完整物品系统、完整法术书。
- V7 任务、长局、ladder、campaign 或公开 demo。

## 1. V6 Gate 对应 GLM 任务形状

| V6 gate | GLM 任务形状 | 可写范围原则 | 必须产出的证据 |
| --- | --- | --- | --- |
| `V6-ID1` Hero / spell / item identity systems | 英雄、法术、物品或等价身份系统 proof pack | 派发时重新限定 allowed files；优先 tests、数据表读取和 artifact，不做玩法实现 | 可见状态、触发路径、效果反馈、限制条件、focused runtime spec、state log |
| `V6-FA1` Faction or unit identity difference | 阵营或单位身份差异 proof pack | 派发时重新限定 allowed files；优先 tests、单位/阵营数据读取和 artifact，不做玩法实现 | 至少一组差异对象、读图/能力/生产/使用选择或战斗角色变化、state log |
| `V6-W3L1` War3-like identity first-look | War3-like 身份审查 proof pack | 派发时重新限定 allowed files；优先 tests、artifact 生成与 review packet，不代判用户 verdict | ID1 / FA1 证据串联、同 build screenshot、state log、review checklist、用户或目标 tester verdict 字段 |

## 2. 首批 Seed Draft

这些不是 live queue。只有 `V5_TO_V6` cutover-ready / cutover-done 后，且当前 V5 blocker 已关闭，才能把它们转成 `docs/GLM_READY_TASK_QUEUE.md` 的 ready 任务。

| Seed | Gate | 标题 | 目标 | 停止条件 |
| --- | --- | --- | --- | --- |
| `V6-GLM-01` | `V6-ID1` | ID1 英雄法术物品身份证明包 | 证明至少一个英雄、法术、物品或等价身份系统有可观察玩法表达。 | focused spec 通过，并记录可见状态、触发方式、效果反馈和限制条件；若失败，点名断在按钮占位、触发、效果还是限制。 |
| `V6-GLM-02` | `V6-FA1` | FA1 阵营或单位身份差异证明包 | 证明至少一组阵营、单位或兵种身份差异会影响读图、能力、生产/使用选择或战斗角色。 | focused spec 通过，并记录差异对象、使用/生产选择或 combat role；不得只证明改名或重色。 |
| `V6-GLM-03` | `V6-W3L1` | W3L1 War3-like 身份审查包 | 把 ID1、FA1、截图、state log 和审查清单收成一份 War3-like identity review packet。 | review packet 存在并绑定同一 build 证据；用户或目标 tester verdict 字段保留，自动化不代判。 |

## Task 104 — ID1 英雄法术物品身份证明包

Goal:

证明至少一个英雄、法术、物品或等价身份系统有真实触发、状态、效果反馈和限制条件，而不是按钮、图标或文案占位。

Write scope:

正式 cutover 派发时必须重新限定 allowed files。预期范围只应包含：

- `tests/v6-identity-system-proof.spec.ts`
- 必要时的 proof artifact / review packet 文件

Must prove:

1. identity object 有可见状态，例如英雄、法术、物品或等价身份标记。
2. 玩家或系统有真实触发路径，触发后 state log 能记录变化。
3. 效果反馈可观察，且有成本、冷却、次数、前置或其他限制。
4. focused regression 读取 fresh runtime state；训练、击杀、重载或 cleanup 后不得继续使用旧 `g.units` 快照。
5. 失败时点名是 visibility、trigger、effect、limit 还是 state-log 缺口。

## Task 105 — FA1 阵营或单位身份差异证明包

Goal:

证明至少一组阵营、单位或兵种身份差异会改变读图、能力、生产/使用选择或战斗角色，而不是同质单位换名字或换颜色。

Write scope:

正式 cutover 派发时必须重新限定 allowed files。预期范围只应包含：

- `tests/v6-faction-unit-identity-proof.spec.ts`
- 必要时的 proof artifact / review packet 文件

Must prove:

1. 至少一组身份差异有清晰对象，例如单位、阵营、兵种或可替代 identity fixture。
2. 差异影响读图、能力、生产/使用选择或战斗角色中的至少一面。
3. state log 能记录差异如何进入 runtime 决策或战斗结果。
4. proof 不能只证明改名、重色、静态文案或单场数值胜负。
5. 失败时点名是差异不可见、能力无效、选择无变化还是 combat role 不成立。

## Task 106 — W3L1 War3-like 身份审查包

Goal:

把 ID1、FA1、截图、state log 和审查清单组成一份 War3-like identity review packet，让用户或目标 tester 能判断当前 slice 是否更像 War3-like。

Write scope:

正式 cutover 派发时必须重新限定 allowed files。预期范围只应包含：

- `tests/v6-war3-like-identity-review.spec.ts`
- 必要时的 review packet / artifact 生成脚本或文档

Must prove:

1. review packet 绑定同一 build 的 ID1 和 FA1 证据。
2. raw / annotated screenshot、state log 和 checklist 能互相指向同一身份表达结论。
3. 文案不假装完整 War3、完整英雄池、完整物品系统、完整战役或完整 ladder。
4. 用户或目标 tester verdict 字段必须保留；GLM 只能准备证据，不能代判最终人眼结论。
5. 失败时点名是截图缺失、state log 不对齐、checklist 未填、verdict 缺失还是 fake full-content framing。

## 3. 派发规则

V6 active 后，GLM 派发顺序默认是：

```text
V6-GLM-01 -> V6-GLM-02 -> V6-GLM-03
```

允许调整顺序的情况：

- `V6-W3L1` 必须等待 `V6-ID1` 和 `V6-FA1` 至少有可审查证据后再派。
- `V6-FA1` 如果依赖已有单位/生产 fixture，Codex 可以先拆一个更小的 identity fixture proof。
- runtime 资源异常时，GLM 只能继续文档/fixture 设计，不得强开多个 Playwright/Vite。

禁止派发的情况：

- `V5-COUNTER1` 或任何 V5 blocker 仍 open。
- transition 尚未 cutover-ready / cutover-done。
- 任务目标是 gameplay implementation、UI polish、真实素材导入、当前 V5 closeout、完整内容扩张或 V7。
- 任务要求 GLM 直接实现英雄、法术、物品、阵营或单位差异；本 runway 只定义 proof pack，不派实现任务。

## 4. 验证底线

每个 GLM V6 proof pack 至少要给出：

```bash
npm run build
npx tsc --noEmit -p tsconfig.app.json
./scripts/run-runtime-tests.sh <focused-spec> --reporter=list
./scripts/cleanup-local-runtime.sh
```

如果只改文档或测试候选，不触碰 runtime 行为，可用：

```bash
git diff --check -- <changed-files>
node --test <affected-node-tests>
```

但不能把“只跑了文档检查”写成 identity gameplay proof。

## 5. Fresh-state Proof 规则

涉及击杀单位、重载地图、训练/重建单位、触发 cleanup 或切换场景时，proof 必须在 mutation 后重新读取：

- `window.__war3Game`
- `g.units`
- 最新 DOM / canvas / command surface

不得继续使用旧 `const units = g.units`、旧 DOM handle 或旧 screenshot 作为通过证据。若 proof 失败，先检查是否读了 stale game state 或 stale DOM，再考虑小范围实现修复。

## 6. Codex 复核要求

GLM closeout 后，Codex 必须复核：

- proof 是否覆盖对应 V6 gate 原话。
- 是否把按钮、图标、改名、重色或文案写成身份系统通过。
- 是否读了旧 `g.units`、旧 DOM 或旧 state。
- 是否把受控 fixture 冒充完整内容量、完整 War3 复刻或公开 demo。
- 是否越界做了 UI polish、真实素材导入、当前 V5 closeout 或 V7 任务。
- 是否留下 runtime 残留进程。

复核结果只能是：

| 结论 | 含义 |
| --- | --- |
| `accepted` | proof 与 gate 对齐，本地验证通过。 |
| `accepted-with-debt` | proof 成立，但留下明确 residual，不阻塞当前 gate。 |
| `send-back` | proof 缺覆盖或测试有假绿风险，退回 GLM 修。 |
| `codex-takeover` | GLM 卡在测试/实现盲点，Codex 接管小范围修复。 |
| `rejected` | 任务越界、证据不可用或方向错误。 |

## 7. 当前保守结论

```text
这是 V6 GLM runway 的预热草案。
它只定义 V6 cutover-ready 后 GLM 可以领取的 bounded proof pack 形状。
它不激活 V6，不修改 live queue，不代表任何 V6 gate 已通过。
V5-COUNTER1 仍留在 V5，不得带进 V6 启动。
```
