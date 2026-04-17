# M7 Task 35 Gap Selection Brief

> 用途：Task 35 开工前先固定一个合同缺口。本文不是实现任务，也不声明当前存在真实 bug；它只防止 `Contract Coverage Gap Sweep` 退化成泛泛加测试。

## 1. 为什么 Task 35 必须只选一个 gap

Task 35 的价值在于补一个可证明、可复验、可归责的合同空洞。

如果一次补多个 gap，会立刻失去三个东西：

- 失败时不知道 owner 是 selection、placement、HUD、order 还是 cleanup。
- review 时无法判断 diff 是 targeted regression 还是测试 churn。
- 如果需要产品代码修复，修复范围会被拖大，M7 hardening 变成新一轮 gameplay 改造。

所以 Task 35 开始前必须写清：`chosen gap`、现有覆盖为什么不足、要新增什么 proof、如果失败默认谁修。

## 2. Top Candidate Gaps

| 候选 gap | 当前价值 | 主要风险 | 默认处理 |
| --- | --- | --- | --- |
| `SelectionController 事件语义边界` | 直接保护 Task 33。 | click / drag / right-click / Shift / control group 到 command dispatch 的映射可能漂移。 | 如果 Task 33 closeout 证据不足，优先选它；否则降级为 review check。 |
| `Placement anchor / footprint roundtrip` | 直接保护 Task 34。 | preview footprint、validator、spawn occupancy、cancel/death release 可能各自绿但 tile 集合不一致。 | 如果 Task 34 closeout 证据不足，优先选它；否则作为后续 placement proof。 |
| `HUD command-card cache transitions` | 同时保护 selection、placement、construction、resource/supply、death 和 M4/M6 可理解性。 | 内部状态正确，但玩家看到旧按钮、旧禁用原因、旧 portrait 或旧资源反馈。 | Task 33/34 都被接受后，推荐作为默认 chosen gap。 |
| `Order dispatcher gather / attack / build / rally 边界` | 保护 right-click live path 和公开命令入口一致性。 | gather、attack target、build-resume、rally 的 stale state 清理仍分散。 | 如果 HUD gap 已完成或证明不足再选；不要和 HUD 同时做。 |
| `Pathing failure 与 fallback 行为` | 保护 placement/pathing 交界。 | near-target fallback、不可达目标、失败后旧 order state 清理可能模糊。 | 只有触碰 placement/pathing bridge 时优先。 |
| `Death cleanup 组合场景残留` | 保护未来 lifecycle/combat/cleanup extraction。 | 组合状态死亡后可能漏 selection、HUD、occupancy、resource target 引用。 | 当前不应抢在 Task 33/34 直接保护之前。 |

## 3. 默认推荐 chosen gap

默认选择：

```text
HUD command-card cache transitions
```

进入条件：

- Task 33 已被 Codex 接受，或 selection 直接缺口已被补足。
- Task 34 已被 Codex 接受，或 placement 直接缺口已被补足。
- 当前 Task 35 不需要绕回 selection / placement 的直接验收缺口。

如果进入条件不成立，不要启动本默认 gap。应改选：

```text
SelectionController 事件语义边界
```

或：

```text
Placement anchor / footprint roundtrip
```

## 4. 为什么它现在更高价值

`HUD command-card cache transitions` 比其他候选更适合作为默认 gap，原因是：

- 它跨多个已完成/正在 hardening 的系统，但可以写成一个窄 DOM/state proof。
- 现有 coverage 已覆盖资源、供给、训练禁用原因和部分命令卡状态，但连续切换场景仍容易出现 stale UI。
- 这类问题最容易造成“内部状态正确，玩家判断错误”的假绿，直接影响 M4 控制公平和 M6 smoke 可理解性。
- 它不需要先改 AI、pathing、asset、camera 或产品方向。
- 如果测试失败，owner 通常能收敛到 HUD cache / command-card refresh / selection-display bridge，而不是整个 Game loop。

相比之下：

- Selection gap 更适合在 Task 33 未稳时补，不应在 Task 33 已强 closeout 后重复做宽泛证明。
- Placement roundtrip 更适合在 Task 34 未稳时补，不应提前扩大到 builder agency 或 payment。
- Order dispatcher gap 价值高，但更容易牵出 gather / attack / build / rally 多条语义，应在 HUD gap 后单独做。
- Pathing、cleanup、asset、AI gap 都是真风险，但当前不应抢占 Task 35 首刀，除非它们被新 closeout 直接触发。

## 5. 最合适的 proof shape

推荐 proof：

```text
focused runtime regression
```

建议断言形态：

- 连续选择 `worker -> Town Hall -> Barracks -> empty selection`，命令卡和 portrait 不 stale。
- 资源变化后，不重新选择也能刷新训练 / 建造按钮可用状态和禁用原因。
- supply 变化后，不重新选择也能刷新命令卡状态。
- 选中未完成建筑、取消、死亡或 empty selection 后，命令卡不会保留旧按钮。
- 切回 worker 后，建造入口不会被建筑命令卡或旧禁用原因污染。
- 测试过程无严重 console error。

可选实现路径：

- 新增一个窄 spec，例如 `tests/hud-command-card-cache-transitions.spec.ts`。
- 或在现有 `tests/command-card-state-regression.spec.ts` 中新增一个明确分组。
- 只有新 regression 先失败，才允许最小产品修复。

最低验证：

```bash
npm run build
npx tsc --noEmit -p tsconfig.app.json
./scripts/run-runtime-tests.sh <new-or-affected-specs> --reporter=list
FORCE_RUNTIME_CLEANUP=1 ./scripts/cleanup-local-runtime.sh
```

如果修复触碰 command dispatch、selection bridge、construction、resource/supply 或 shared HUD cache，Codex review 应升级到：

```bash
npm run test:runtime
```

## 6. Out of Scope

Task 35 不应做这些事：

- 同时补 selection、placement、HUD、AI、cleanup 多个 gap。
- 重写 `Game.ts` 或做 broad refactor。
- 修改或弱化现有 tests。
- 把 M3/M4/M5/M6 的人工判断债写成工程 regression。
- 改 AI 行为、pathing fallback、asset refresh、camera/minimap、release/README 文案。
- 顺手优化控制手感、HUD 视觉、战斗节奏、AI 压力。
- 因为测试难写就降低断言质量。
- closeout 只写 “tests pass”，没有说明 chosen gap、proof、结果和仍未证明的范围。

## 7. GLM Handoff Block

```text
Task 35 preselection

Chosen gap:
- HUD command-card cache transitions

Why this gap:
- It protects the boundary where selection, construction, resource/supply, death/empty selection, and HUD feedback meet.
- Existing command-card coverage proves important single states, but Task 35 should prove continuous transitions do not leave stale buttons, stale disabled reasons, stale portrait, or stale resource text.
- This is higher value than generic test additions because it protects M4 control fairness and M6 smoke readability without changing product direction.

Proof shape:
- Add one focused deterministic runtime regression.
- Prefer a new narrow spec or a clearly named section in command-card state regression.
- Assert worker -> Town Hall -> Barracks -> unfinished building/cancel/death/empty selection transitions keep command card, portrait, disabled reasons, and resource/supply feedback fresh.

Allowed files:
- tests/*.spec.ts
- docs/GAMEPLAY_REGRESSION_CHECKLIST.md only if a new proof is accepted and needs documentation

Forbidden:
- Broad Game.ts rewrite
- AI/pathing/asset/camera/release docs
- Weakening existing tests
- Multiple unrelated gaps
- Product code unless the new regression fails first and the repair is minimal

Commands required:
- npm run build
- npx tsc --noEmit -p tsconfig.app.json
- ./scripts/run-runtime-tests.sh <new-or-affected-specs> --reporter=list
- FORCE_RUNTIME_CLEANUP=1 ./scripts/cleanup-local-runtime.sh

Closeout must include:
- Chosen gap
- Files changed
- Whether product code changed
- Exact command results
- What is now proven
- What is still not proven
- Remaining ambiguity
- Task 35 result: accept-ready / evidence-insufficient / out-of-scope
```
