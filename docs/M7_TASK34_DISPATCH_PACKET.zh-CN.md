# M7 Task 34 Dispatch Packet：PlacementController Hardening Slice

> 用途：Codex 发给 GLM 的 `Task 34` 派发包。目标是做一个零行为变化的 placement-only hardening slice，不能漂移到 builder agency、资源支付、build progress 或占地语义。

## 1. 任务目标

把当前放置流程中“placement mode / preview / validation bridge”相关的边界收窄、命名清楚、可 review，但不改变任何玩家可见行为。

本任务不是修建造系统，不是改建造手感，不是重做 pathing / footprint，也不是优化资源、AI 或命令语义。

## 2. Allowed Files

GLM 默认只允许触碰以下范围，且必须在 closeout 中逐项说明：

- `src/game/Game.ts`
  - 仅限 placement mode / ghost preview / validation bridge 的委托、搬迁或薄化。
  - 不能改非 placement 区域的 gameplay 语义。
- `src/game/PlacementController.ts`
  - 如果已有该文件，可做小范围 hardening。
  - 如果需要新建，只能承接 placement mode state、ghost / preview helper、validator bridge。
- `src/game/PlacementValidator.ts`
  - 只有在必须整理调用边界时才可触碰。
  - 不允许改变 validator 判定条件、footprint 尺寸、anchor 或 overlap 语义。

如果实际需要新增或修改其他文件，GLM 必须先停止并报告，由 Codex 改写任务合同后再继续。

## 3. Forbidden Files / Zones

以下默认禁碰：

- `src/game/SimpleAI.ts`
- `src/game/GameData.ts`
- `src/game/TeamResources.ts`
- `src/game/PathFinder.ts`
- `src/game/PathingGrid.ts`
- `src/game/OccupancyGrid.ts`
- asset loader / asset catalog / visual factory 文件
- tests、queue docs、M2-M6 docs、release docs
- `Game.ts` 中 gather / resource settle、training / supply / payment、combat / auto-aggro / order recovery、AI bridge、map loading / camera focus、asset refresh、HUD cache 等区域

禁止用“为了抽 placement 顺便整理一下”作为碰这些区域的理由。

## 4. No-Touch Boundaries

Task 34 绝不能跨过这些边界：

- 不改 builder 指派规则。
- 不改 selected-worker agency。
- 不改建造资源支付时机。
- 不改 build progress 语义。
- 不改取消建造 / 续建 / refund / builder cleanup 行为。
- 不改 footprint mark / unmark 语义。
- 不改 `GameData.size`、建筑 anchor、mesh origin 或 footprint rounding。
- 不改 right-click 建造恢复路径。
- 不改 placement 失败后的命令状态清理语义。
- 不改 UI / HUD 文案或命令卡状态，除非只是保持现有调用不变的 wiring。

只要 diff 让 review 需要重新判断这些行为是否正确，就已经不是 Task 34。

## 5. 这里的 placement-only 是什么

`placement-only` 指的是：

- placement mode 是否开启、退出、清理的状态边界。
- ghost / preview mesh 的创建、更新、销毁调用边界。
- preview 位置到 validator 的只读查询桥接。
- placement 可行 / 不可行状态的显示输入。
- 与 `PlacementValidator` 的窄接口连接，但不改变判定规则。

`placement-only` 不包括：

- 哪个 worker 被分配去建造。
- 什么时候扣资源。
- 建筑实体何时创建、何时完成、何时取消。
- 建筑是否释放 occupancy。
- 未完成建筑能否续建。
- 右键目标如何解释为 move / gather / attack / build。
- AI 如何放置建筑。

## 6. Minimum Regression Floor

GLM closeout 前至少要跑：

```bash
npm run build
npx tsc --noEmit -p tsconfig.app.json
./scripts/run-runtime-tests.sh tests/building-agency-regression.spec.ts tests/construction-lifecycle-regression.spec.ts tests/pathing-footprint-regression.spec.ts --reporter=list
FORCE_RUNTIME_CLEANUP=1 ./scripts/cleanup-local-runtime.sh
```

如果 diff 触碰 input event、selection state、right-click path 或 command surface，还必须追加：

```bash
./scripts/run-runtime-tests.sh tests/selection-input-regression.spec.ts tests/command-surface-regression.spec.ts --reporter=list
```

如果 diff 跨出 placement-only 边界，Codex 应要求 `npm run test:runtime`，或者直接拒绝并改写任务。

## 7. Automatic Reject Conditions

出现任一项，Codex 应自动拒绝 Task 34 closeout：

- 修改 builder agency、builder 选择、builder fallback 或 builder cleanup 规则。
- 修改资源支付、refund、supply、training 或 build progress。
- 修改 footprint / occupancy / anchor / size 判定。
- 修改 right-click build resume、cancel construction 或 under-construction HUD 语义。
- 修改 pathing fallback、blocked-start、near-target 行为。
- 修改 AI、combat、gather、training、map loading、asset refresh 或 release 文档。
- 修改或弱化 tests，只为了让 refactor 通过。
- 新增全局状态、事件总线、单例或循环 import，让 placement 副作用更隐蔽。
- 一个 slice 同时搬 placement、input、selection、command 或 HUD 多个系统。
- closeout 只写 “tests pass”，没有具体命令、通过数量和 cleanup 结果。
- review 需要靠试玩感觉判断是否等价。

## 8. GLM Required Closeout Format

GLM 必须按下面格式收口：

```text
Task 34 closeout

Files changed:
- ...

Scope:
- 本次只抽取 / 整理了：
- 明确没有触碰：

Placement-only proof:
- placement mode state 是否等价：
- ghost / preview lifecycle 是否等价：
- validation bridge 是否等价：
- builder agency / payment / build progress / cancel-resume 是否未改：

Commands run:
- npm run build: pass/fail，摘要
- npx tsc --noEmit -p tsconfig.app.json: pass/fail，摘要
- building/construction/pathing runtime pack: pass/fail，通过数量
- selection/command pack（如适用）: pass/fail，通过数量
- cleanup: pass/fail，是否有残留进程

Behavior unchanged:
- 玩家可见行为不变的证据：
- 可能受影响但已由测试覆盖的合同：

Remaining ambiguity:
- ...

Recommended Codex review result:
- accept / return / defer
```

GLM 不得在 closeout 中声称 `M7` 已通过、refactor 已被接受，或 Task 34 后可以直接进入更大范围 `Game.ts` 拆分。Codex review 通过后，才可以把该 slice 记入 M7 review log。
