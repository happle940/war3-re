# V9 Keep Upgrade Flow Contract Draft

> 用途：给 Task120 之后的相邻任务做边界预案。  
> 状态：已执行并 Codex accepted；本文件保留为 Task121 边界与回归依据。Task120 被 Codex 本地复核并标记为 accepted 后，本合同已转成 GLM live task。  
> 核心原则：只让 Town Hall 真正升级到已存在的 Keep seed，不借机打开 Castle、Knight、完整科技树或素材线。

## 1. 触发条件

本合同不能直接派发。必须先满足：

- `Task 120 — V9 HN2-IMPL1 Keep tier data seed` 已经 Codex accepted。
- `BUILDINGS.townhall.upgradeTo === 'keep'`。
- `BUILDINGS.keep.techTier === 2`。
- `BUILDINGS.keep` 没有 `upgradeTo`。
- `BUILDINGS` 里仍然没有 `castle`。

## 2. 下一张切片建议

`HN2-IMPL2 — Town Hall to Keep upgrade flow`

目标不是完整 T2/T3 科技树，而是让已有数据种子进入一个最小可验证运行时路径：

1. 选中已完成的己方 `townhall` 时，命令卡出现 “升级主城” 行为。
2. 资源不足时按钮禁用，理由来自真实 `keep.cost`。
3. 点击升级后消耗资源，并在建筑上产生可推进的升级进度。
4. 升级完成后，该建筑 `type` 变为 `keep`。
5. 升级期间和升级后，不新增 Castle、Knight、Sorceress、Spell Breaker、英雄、物品或素材。

## 3. 推荐实现边界

允许未来实现者选择最小内部形状，但必须保持这些边界：

- 可以在 `Unit` 上新增一个窄字段，例如 `upgradeQueue` 或 `upgradeTarget`，用于记录目标建筑和剩余时间。
- 可以在 `GameCommand` 增加一个明确命令，例如 `upgradeBuilding`。
- 可以在 `Game.ts` 的 command card / update loop / resource check 里接入这一个升级路径。
- 可以新增 focused runtime proof，例如 `tests/v9-keep-upgrade-flow-regression.spec.ts`。
- 可以同步 `docs/HUMAN_RACE_CAPABILITY_BOARD.zh-CN.md`，但只能把 Keep 从“数据种子”推进为“Town Hall -> Keep 最小升级路径已存在”。

## 4. 不允许做什么

- 不实现 `castle`，也不让 `keep.upgradeTo` 指向 `castle`。
- 不实现 Knight、Sorceress、Spell Breaker、Flying Machine、Siege Engine、英雄、物品或商店。
- 不把 `keep` 加入 `PEASANT_BUILD_MENU`。
- 不引入 `unitUnlock`、`buildingUnlock`、`researchLevel` 的真实运行时语义。
- 不改 AI 策略依赖 Keep。
- 不导入或替换素材。
- 不把升级系统做成泛化大重构；第一步只证明 Town Hall -> Keep。

## 5. 验收证据

未来实现任务至少要证明：

1. 没有 `keep` seed 时不能显示假升级；有 seed 时按钮来自 `townhall.upgradeTo`。
2. 资源不足时不能开始升级，且禁用理由能被测试读到。
3. 资源足够时能开始升级，资源真实扣除。
4. 时间推进后 `townhall` 变为 `keep`，但地图上建筑对象仍然是同一个阵营、同一位置、同一选择语义。
5. `BUILDINGS` 不包含 `castle`，`UNITS` 和 `RESEARCHES` 不扩张。
6. `PEASANT_BUILD_MENU` 不包含 `keep`。
7. 现有训练、研究、采集、胜负和 baseline replay 不因升级字段退化。

## 6. 当前结论

```text
Task120 之后的相邻点是 Town Hall -> Keep 的最小升级路径。
它不是 Castle / Knight / 完整科技树入口。
它必须以 Task120 accepted 为前置，不能在数据 seed 未验收前派发。
Task121 已实现并通过 Codex 本地复核；下一张相邻任务是 Keep 升级后的主基地命令面，不是 Castle / Knight / 完整科技树入口。
```
