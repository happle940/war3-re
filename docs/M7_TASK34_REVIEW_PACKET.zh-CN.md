# M7 Task 34 Review Packet：PlacementController 抽取审查

> 用途：Codex 审查 GLM `Task 34 — PlacementController hardening slice`。本文用于快速判断接受、拒绝或延期，不替代实际 diff review。

## 1. Task 34 是什么 / 不是什么

Task 34 只允许做一个零行为变化的 placement-only 抽取切片：

- 可以抽 placement mode state 的薄边界。
- 可以抽 ghost / preview mesh 的创建、更新、销毁 helper。
- 可以抽 preview 位置到 `PlacementValidator` 的只读查询桥接。
- 可以整理 placement 可行 / 不可行状态的显示输入。
- 可以新增或收窄 `PlacementController`，但它只能服务 placement preview / validation 边界。

Task 34 不允许改变：

- builder 指派、selected-worker agency 或 fallback。
- 资源支付、refund、supply、training 或 build progress。
- 建筑创建、完成、取消、续建、cleanup 行为。
- footprint、occupancy、anchor、size、rounding 或 pathing 语义。
- right-click build resume、command dispatch、AI 放置或 HUD 文案。
- 任何玩家可见建造规则、控制手感、资源结果或视觉品味。

如果 diff 让 reviewer 需要重新判断“这个建造行为现在是不是更正确”，它已经不是 M7 hardening。

## 2. File Scope Expectations

接受前，文件范围必须满足：

| 范围 | 期望 |
| --- | --- |
| `src/game/PlacementController.ts` | 可新增或修改；职责应窄，只承接 placement mode、ghost / preview helper、validator bridge。 |
| `src/game/Game.ts` | 只允许把 placement mode / preview / validation bridge 委托出去，或接入 `PlacementController`；不得顺手改 input、selection、command、AI、resource、combat、HUD cache。 |
| `src/game/PlacementValidator.ts` | 只有在整理调用边界必须时才可触碰；不得改变判定条件、footprint 尺寸、anchor、overlap 或 rounding 语义。 |
| 其他 product files | 默认不允许。出现即要求 GLM 解释，通常 `Reject` 或 `Defer`。 |
| tests | 默认不允许改。Task 34 是抽取 review，不是调整验证口径。 |
| docs / queue | 默认不允许改。接受后由 Codex 更新 review log 和队列。 |

如果 GLM 改到 `SimpleAI.ts`、`GameData.ts`、`TeamResources.ts`、`PathFinder.ts`、`PathingGrid.ts`、`OccupancyGrid.ts`、asset/map/camera/visual factory 文件，默认判 scope 越界。

## 3. 必须保持完全一致的 placement-preview / validation 行为

Codex review 时逐项确认这些行为没有变化：

- 进入 placement mode：同一命令、同一选中状态下，进入 / 不进入放置模式的结果不变。
- 退出 placement mode：取消、成功放置、失败放置后的清理时机不变。
- ghost / preview lifecycle：preview mesh 创建、位置更新、可见性、销毁时机不变。
- preview 位置：鼠标 / 地面点到建筑预览位置的映射、snap、anchor、rounding 不变。
- validation bridge：同一 preview 位置、同一地图和单位状态下，可放置 / 不可放置结果不变。
- 失败反馈：不可放置状态的显示输入、命令状态清理和后续可操作性不变。
- 成功放置后果：builder agency、资源扣除、建筑实体创建、build progress 启动不变。
- footprint / occupancy：mark、unmark、blocked-start、near-target 结果不变。
- right-click build resume：未完成建筑续建路径、builder cleanup、HUD 状态不变。

这些行为不需要变好；它们必须等价。

## 4. Focused Review Checklist

Codex review 时按顺序检查：

| 检查项 | Yes / No | 备注 |
| --- | --- | --- |
| 改动范围只包含 Task 34 允许文件。 |  |  |
| `PlacementController` 职责单一，没有接管 builder agency、支付或 build progress。 |  |  |
| `Game.ts` 中被移动的条件分支、early return、状态清理和生命周期顺序可对照。 |  |  |
| `PlacementValidator` 判定规则没有改变。 |  |  |
| 没有改 footprint / occupancy / anchor / size / rounding。 |  |  |
| 没有改 right-click build resume、cancel construction 或 under-construction HUD 语义。 |  |  |
| 没有改 resource、supply、training、AI、combat、gather、pathing fallback。 |  |  |
| 没有新增全局状态、事件总线、单例或循环 import。 |  |  |
| 没有改 tests 来适配重构。 |  |  |
| 行为等价可以从 diff 和 regression 共同判断，不依赖主观试玩。 |  |  |
| 失败时可以单独回退本 slice。 |  |  |

任一核心项为 `No`，不要接受。

## 5. Required Local Verification

接受前，至少需要 GLM closeout 提供命令结果，Codex 应按需本地复验：

```bash
npm run build
npx tsc --noEmit -p tsconfig.app.json
./scripts/run-runtime-tests.sh tests/building-agency-regression.spec.ts tests/construction-lifecycle-regression.spec.ts tests/pathing-footprint-regression.spec.ts --reporter=list
FORCE_RUNTIME_CLEANUP=1 ./scripts/cleanup-local-runtime.sh
```

如果 diff 触碰 input event、selection state、right-click path 或 command surface，必须追加：

```bash
./scripts/run-runtime-tests.sh tests/selection-input-regression.spec.ts tests/command-surface-regression.spec.ts --reporter=list
```

升级到 `npm run test:runtime` 的条件：

- diff 跨出 placement-only 边界。
- diff 触碰 command dispatch、HUD cache、right-click build resume 或 pathing fallback。
- GLM 的 focused proof 不足以解释行为等价。
- Codex 在 review 中发现任何跨系统副作用。

不接受只写 “tests pass” 的 closeout；必须有具体命令、结果、通过数量或失败摘要、cleanup 状态。

## 6. Automatic Reject Conditions

出现任一项，Codex 应直接 `Reject` 或 `Defer`：

- 改了任务外文件，且没有新合同授权。
- 修改或弱化 tests。
- 把 builder agency、payment、refund、build progress 或 cancel / resume 搬进 `PlacementController`。
- 改动 footprint、occupancy、anchor、size、rounding、pathing fallback 或 blocked-start 语义。
- 改动 right-click build resume、command dispatch、AI、gather、combat、training、resource 或 supply。
- 一个 slice 同时搬 placement、input、selection、command、HUD 多个系统。
- 新 `PlacementController` 持有过多 Game 全局引用，副作用更隐蔽。
- closeout 无法说明哪些 placement-preview / validation 行为保持不变。
- 验证只包含 build / typecheck，没有 building / construction / pathing runtime proof。
- 需要靠人工试玩、截图或体感判断等价。
- GLM 声称 “顺手优化建造手感 / 可放置判断 / worker 行为 / HUD”。

如果行为可能变了但也许应该变，正确动作是转 contract / test task，不是按 Task 34 接受。

## 7. Closeout Logging Template

Codex 接受、拒绝或延期时，把下面内容复制进 `M7_SLICE_REVIEW_LOG.zh-CN.md` 的 `Slice 02` 条目。

```text
### Slice 02

- 名称：PlacementController hardening slice
- 对应任务：Task 34
- reviewer：Codex
- 日期：

### 范围

- 目标边界：
- 实际改动文件：
- 是否碰到任务外文件：是 / 否

### 行为等价检查

- 明确不变的行为：
  - 进入 / 退出 placement mode：
  - ghost / preview lifecycle：
  - preview position / anchor / rounding：
  - validation bridge：
  - failure cleanup：
  - builder agency / payment / build progress：
  - footprint / occupancy：
  - right-click build resume：
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

没有这条 review log，不要把 Task 34 视为真正收口。
