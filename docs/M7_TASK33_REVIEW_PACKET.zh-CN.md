# M7 Task 33 Review Packet：SelectionController 抽取审查

> 用途：Codex 审查 GLM `Task 33 — SelectionController extraction slice`。本文用于快速判断接受、拒绝或延期，不替代实际 diff review。

## 1. Task 33 是什么 / 不是什么

Task 33 只允许做一个零行为变化的 selection 小切片：

- 可以抽 selection query / lookup helper。
- 可以抽选中集合到显示层输入的纯映射。
- 可以抽 selection ring / subgroup / box select 的无副作用 helper。
- 可以新增窄 `SelectionController`，但它只能服务 selection 边界。

Task 33 不允许改变：

- 右键命令决策。
- 采集、攻击、rally、build resume 语义。
- 输入事件时序。
- control group 行为定义。
- HUD cache 规则。
- 任何玩家可见控制、命令、AI、资源、建造或视觉品味。

如果 diff 让 reviewer 需要重新判断“这个行为现在是不是更合理”，它已经不是 M7 hardening。

## 2. File Scope Expectations

接受前，文件范围必须满足：

| 范围 | 期望 |
| --- | --- |
| `src/game/SelectionController.ts` | 可新增或修改；职责应窄，只承接 selection helper / mapping / display input。 |
| `src/game/Game.ts` | 只允许把 selection helper 委托出去，或接入新的 `SelectionController`；不得顺手改 command、AI、resource、placement、combat、HUD cache。 |
| 其他 product files | 默认不允许。出现即要求 GLM 解释，通常 `Reject` 或 `Defer`。 |
| tests | 默认不允许改。Task 33 是抽取 review，不是改验证口径。 |
| docs / queue | 默认不允许改。接受后由 Codex 更新 review log 和队列。 |

如果 GLM 改到 `SimpleAI.ts`、`GameCommand.ts`、`TeamResources.ts`、`PlacementController.ts`、asset/map/camera/visual factory 文件，默认判 scope 越界。

## 3. 必须保持完全一致的玩家可见行为

Codex review 时逐项确认这些行为没有变化：

- 左键单选：同一对象、同一视口、同一点击结果不变。
- 左键拖框：框选提交时机、选中集合、selection ring 映射不变。
- `Shift` 追加选择：追加顺序、HUD 更新、selection order 不变。
- 右键命令结果：右键地面移动、右键金矿采集、右键敌人攻击不因 selection 抽取改变。
- command card / portrait：选择变化后的刷新时机和可见状态不变。
- Tab / control group：子组切换、编队保存与恢复后的 ring/object mapping 不变。
- `Esc` 或取消模式后的 selection 可见状态不变。
- 空选择、死亡对象移除后的 selection 状态不变。

这些行为不需要变好；它们必须等价。

## 4. Focused Review Checklist

Codex review 时按顺序检查：

| 检查项 | Yes / No | 备注 |
| --- | --- | --- |
| 改动范围只包含 Task 33 允许文件。 |  |  |
| `SelectionController` 职责单一，没有接管输入时序或命令决策。 |  |  |
| `Game.ts` 中被移动的条件分支、early return、集合迭代顺序可对照。 |  |  |
| 没有新增全局状态、事件总线、单例或循环 import。 |  |  |
| 没有改 `_lastCmdKey` / `_lastSelKey` 或 HUD cache 规则。 |  |  |
| 没有改 right-click、gather、attack、rally、build resume 语义。 |  |  |
| 没有改 control group 行为定义。 |  |  |
| 没有改 tests 来适配重构。 |  |  |
| 行为等价可以从 diff 和 regression 共同判断，不依赖主观试玩。 |  |  |
| 失败时可以单独回退本 slice。 |  |  |

任一核心项为 `No`，不要接受。

## 5. Required Local Verification

接受前，至少需要 GLM closeout 提供命令结果，Codex 应按需本地复验：

```bash
npm run build
npx tsc --noEmit -p tsconfig.app.json
./scripts/run-runtime-tests.sh tests/selection-input-regression.spec.ts --reporter=list
./scripts/run-runtime-tests.sh tests/command-surface-regression.spec.ts tests/command-card-state-regression.spec.ts --reporter=list
FORCE_RUNTIME_CLEANUP=1 ./scripts/cleanup-local-runtime.sh
```

升级到 `npm run test:runtime` 的条件：

- diff 触碰 selection 之外的 input orchestration。
- diff 触碰 HUD cache、command-card 刷新或 command dispatch。
- GLM 的 focused proof 不足以解释行为等价。
- Codex 在 review 中发现任何跨系统副作用。

不接受只写 “tests pass” 的 closeout；必须有具体命令、结果、通过数量或失败摘要、cleanup 状态。

## 6. Automatic Reject Conditions

出现任一项，Codex 应直接 `Reject` 或 `Defer`：

- 改了任务外文件，且没有新合同授权。
- 修改或弱化 tests。
- 把 right-click command path 搬进 `SelectionController`。
- 改动 gather、attack、rally、build resume、resource、AI、combat、placement 或 HUD cache 语义。
- 把 selection helper、input event timing、command dispatch 一起搬。
- 新 `SelectionController` 持有过多 Game 全局引用，副作用更隐蔽。
- closeout 无法说明哪些玩家可见行为保持不变。
- 验证只包含 build / typecheck，没有 runtime selection proof。
- 需要靠人工试玩或截图判断等价。
- GLM 声称 “顺手优化手感 / 控制 / HUD”。

如果行为可能变了但也许应该变，正确动作是转 contract / test task，不是按 Task 33 接受。

## 7. Closeout Logging Template

Codex 接受、拒绝或延期时，把下面内容复制进 `M7_SLICE_REVIEW_LOG.zh-CN.md` 的 `Slice 01` 条目。

```text
### Slice 01

- 名称：SelectionController extraction slice
- 对应任务：Task 33
- reviewer：Codex
- 日期：

### 范围

- 目标边界：
- 实际改动文件：
- 是否碰到任务外文件：是 / 否

### 行为等价检查

- 明确不变的行为：
  - 左键单选：
  - 拖框选择：
  - Shift 追加：
  - 右键命令结果：
  - command card / portrait 刷新：
  - Tab / control group：
- 可能受影响的合同：
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

没有这条 review log，不要把 Task 33 视为真正收口。
