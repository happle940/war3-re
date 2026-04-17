# M7 Task 33 Dispatch Packet：SelectionController 小切片

> 用途：给 `Task 33` 一份可直接发送给 GLM 的窄范围派发包。目标不是“整理代码”，而是在零行为变化前提下，只抽 selection 相关的小边界。

## 1. 进入条件

开始 `Task 33` 前，至少应满足：

- `Task 31` 已被 Codex 接受，不再有 AI recovery 语义歧义。
- `Task 32` 已形成基本 smoke 方向，不会反向拖住 `M7`。
- `npm run build` 可通过。
- `npx tsc --noEmit -p tsconfig.app.json` 可通过。
- `tests/selection-input-regression.spec.ts`、`tests/command-surface-regression.spec.ts`、`tests/command-card-state-regression.spec.ts` 当前处于可复验状态。

如果这些前提没有站住，不要用 `M7 extraction` 掩盖工程不稳定。

## 2. 任务目标

`Task 33` 只做一件事：

把 selection 相关、可证明无副作用的小边界从 `Game.ts` 里抽出来，形成一个窄 `SelectionController` 切片。

允许的方向：

- selection query / lookup helper
- 选中集合到显示层输入的纯映射
- selection ring / subgroup / box select 的无副作用 helper

不允许把“selection”偷换成：

- 右键命令决策
- 采集 / 攻击 / rally 语义
- 输入事件时序重排
- control group 行为重写
- HUD cache 规则改写

## 3. Allowed Files

只允许改这些文件：

- `src/game/SelectionController.ts`（新文件）
- `src/game/Game.ts`

默认不允许改：

- 任何 `tests/*.spec.ts`
- `docs/*`
- `src/game/SimpleAI.ts`
- `src/game/GameCommand.ts`
- `src/game/TeamResources.ts`
- `src/game/PlacementController.ts`
- 任何 asset / map / camera / visual factory 文件

如果 GLM 认为必须碰任务外文件，正确动作是停止并把原因写进 closeout，不是直接扩 scope。

## 4. 明确 No-Touch 边界

即使在 `Game.ts` 内，也默认不能碰这些区域：

- 右键命令语义与目标判定
- gather / resource settle
- attack-move / stop / hold / auto-aggro / order recovery
- builder agency / payment / build progress
- `control group` 行为定义
- `_lastCmdKey` / `_lastSelKey` 缓存规则
- AI bridge / spawn / occupancy / W3X camera focus

对 `Task 33` 来说，`SelectionController` 的上限是“帮 `Game.ts` 读 selection 状态和组织 selection 相关纯 helper”，不是接管输入和命令系统。

## 5. 明确不变的玩家行为

GLM closeout 必须明确声明这些行为没有变化：

1. 左键单选语义不变。
2. 拖框选择语义不变。
3. `Shift` 追加 / 取消选择语义不变。
4. 选择后 command card 与 portrait 刷新时机不变。
5. 右键地面移动、右键采集、右键攻击的命令结果不因本切片而变化。
6. control group、Tab、Esc 的玩家可见行为不因本切片而变化。

如果 diff 无法让 reviewer 看懂这些行为为什么没变，直接判 `Reject`。

## 6. 最低验证面

GLM 必须实际运行：

```bash
npm run build
npx tsc --noEmit -p tsconfig.app.json
./scripts/run-runtime-tests.sh tests/selection-input-regression.spec.ts --reporter=list
./scripts/run-runtime-tests.sh tests/command-surface-regression.spec.ts tests/command-card-state-regression.spec.ts --reporter=list
FORCE_RUNTIME_CLEANUP=1 ./scripts/cleanup-local-runtime.sh
```

下面任一情况成立时，Codex 本地复验应升级到 `npm run test:runtime`：

- diff 触碰了 selection 之外的输入 orchestration
- diff 触碰 HUD cache 或 command-card 刷新
- diff 让 reviewer 需要更大验证面才能判断等价

## 7. 自动拒绝条件

出现任一项，Codex 直接退回或接管：

- 改了任务外文件
- 改了 tests 以帮助切片通过
- 右键命令路径被搬进 `SelectionController`
- 为了“顺便更合理”而调整 command / control / AI / gather 行为
- 把多个 selection 子系统和输入时序一起搬
- closeout 只写“tests pass”，没有精确命令和结果
- 只能靠“试玩感觉差不多”判断是否等价

## 8. GLM Closeout 格式

GLM closeout 至少要包含：

- `Files changed`
- `Selection-only boundary`
- `Explicit unchanged behaviors`
- `Commands run`
- `Exact pass/fail results`
- `Whether product behavior changed`
- `Remaining ambiguity`

最后必须回答：

```text
Task 33 result: accept-ready / evidence-insufficient / out-of-scope
```

## 9. Codex 接受后立即要做的事

Codex 接受 `Task 33` 后，必须马上：

- 在 [M7 Slice Review Log](./M7_SLICE_REVIEW_LOG.zh-CN.md) 填一条 `SelectionController extraction slice`
- 更新 `docs/GLM_READY_TASK_QUEUE.md`
- 更新 `docs/CODEX_ACTIVE_QUEUE.md`
- 决定是否进入 `Task 34`，或先转 `Task 35`

如果 `Task 33` 接受后没有下一步落点，这次 closeout 还不算真正收口。
