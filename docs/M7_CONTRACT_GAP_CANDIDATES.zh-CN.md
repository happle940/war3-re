# M7 Contract Gap Candidates：合同缺口候选

> 用途：给 Task 35 选择最高风险行为合同缺口。本文只列候选风险，不声明它们都是当前真实 bug。

## 使用原则

- Task 35 一次只应选择一个缺口，写成确定性 regression，再修复被测试证明的问题。
- 这些候选用于保护 M7 extraction，不用于扩大 refactor 范围。
- 如果某项不会被当前 slice 触碰，可以记录风险但不阻塞该 slice。
- 如果 review 只能靠人工体感判断，先转合同任务，不要把它并入“零行为变化”抽取。

## 候选缺口矩阵

| 候选缺口 | 为什么风险高 | 已有部分覆盖 | 新 focused contract 应证明什么 | 抽取时序建议 |
| --- | --- | --- | --- | --- |
| SelectionController 事件语义边界 | 输入层同时影响框选、单击、右键、Shift 追加、control group、HUD cache。抽取时只改事件时机就可能改变玩家控制感。 | `tests/selection-input-regression.spec.ts` 覆盖 box select、右键拖动、Shift 追加、Tab、control group；`tests/command-regression.spec.ts` 覆盖命令结果。 | 用真实 DOM 事件证明 leftDown/leftUp/rightClick/drag/Shift 修饰键到 selection state 和 command dispatch 的映射不变；至少覆盖单击选择、框选、右键命令、Shift 追加后 HUD 不 stale。 | 应在 Task 33 之前或作为 Task 33 的验收地板；不要先抽输入再补合同。 |
| Order dispatcher 的 gather / attack / build / rally 边界 | 现有 order boundary 已覆盖 move/stop/attackMove，但右键资源、攻击目标、建造恢复、rally/clear rally 仍分散在 live path 和命令面里。抽取 selection/command 时容易漏掉状态清理。 | `tests/order-model-boundary-regression.spec.ts` 覆盖 move/stop/attackMove；`tests/command-surface-regression.spec.ts` 覆盖资源、建筑、rally、cancel 的可见命令面；`tests/rally-contract-regression.spec.ts` 覆盖 clear rally。 | 证明公开命令入口和 live right-click 路径对 gather、attack、build-resume、set/clear rally 的字段写入等价，并清理 stale move/gather/build/attack state。 | 在拆 command decision 或 selection-to-command 桥之前补；若 Task 33 只抽视觉选择状态，可作为后续 Task 35 候选。 |
| Placement anchor / footprint roundtrip | `Game.ts` 风险图指出建筑视觉位置、mesh anchor、footprint round、spawn 和 occupancy 强耦合。视觉对齐看似正确，也可能让占地释放或寻路漂移。 | `tests/pathing-footprint-regression.spec.ts` 覆盖 blocker、GameData footprint、路径和 overlap；`tests/building-agency-regression.spec.ts` 覆盖 selected-worker agency；`tests/construction-lifecycle-regression.spec.ts` 覆盖 cancel 和 footprint release。 | 对 Farm/Barracks/TownHall/GoldMine 等尺寸证明：placement preview footprint、validator footprint、spawnBuilding 最终 occupancy、cancel/death release 使用同一 tile 集合；不依赖截图。 | 应在 Task 34 placement hardening 之前补，或作为 Task 34 的核心验收合同。 |
| Pathing failure 与 fallback 行为 | `planPath()` 的 fallback 本身有 gameplay 语义；blocked start、不可达目标、建筑旁路移动如果被抽取时混淆，会把错误路径伪装成“还能走”。 | `tests/pathing-footprint-regression.spec.ts` 已把 blocked-start 直接压到 `findPath()`；`tests/command-surface-regression.spec.ts` 覆盖右键未完成建筑恢复和 move near；`tests/unit-presence-regression.spec.ts` 覆盖开局不在 blocker 内。 | 证明不可达/blocked 情况下不会穿 blocker 直线移动，合法 near-target fallback 仍保留，并且失败后 unit order state 不残留旧 gather/build/attack 目标。 | 在抽 `planPath` / placement bridge 之前补；若当前 M7 只做纯视觉 helper，可后置。 |
| HUD command-card cache transitions | `_lastCmdKey` / `_lastSelKey` 可能让内部状态正确但玩家看到旧按钮、旧禁用原因或旧选择反馈。抽 presenter 时容易把 cache key 简化错。 | `tests/command-card-state-regression.spec.ts` 覆盖资源/供给阻塞原因；`tests/command-surface-regression.spec.ts` 覆盖部分命令面；`tests/construction-lifecycle-regression.spec.ts` 覆盖 cancel 后 HUD 有效空状态；`tests/m3-camera-hud-regression.spec.ts` 覆盖 HUD 遮挡/响应代理。 | 证明连续状态转换：选择 worker -> 选择 Town Hall/Barracks -> 资源变化 -> supply block -> cancel/死亡/空选择，DOM 命令卡、portrait、禁用原因和资源文本都按真实状态刷新。 | 在抽 HUD renderer / presenter 或 selection-HUD 桥之前补；不触碰 HUD 的 placement slice 可不阻塞。 |
| Asset refresh 与 live entity feedback | 异步资产替换会改 mesh、scale、material、child hierarchy。选中圈、血条、outline、攻击反馈如果挂在旧对象上，玩家会看到幽灵反馈。 | `tests/asset-pipeline-regression.spec.ts` 覆盖 fallback、replacement、scale、material isolation；`tests/unit-visibility-regression.spec.ts` 覆盖 worker 可见性；`tests/static-defense-regression.spec.ts` 覆盖塔战斗反馈一部分。 | 在 selected/attacking/healthbar-visible 状态下触发 asset refresh，证明 selection ring、healthbar anchor、outline、attack flash、scale 和 material isolation 都保持有效且不重复挂载。 | 在 Phase A visual helper 抽取前优先考虑；如果当前 slice 不碰 asset/visual lifecycle，可后置。 |
| Death cleanup 的跨系统残留 | death cleanup 牵动 selection、rings、healthbars、occupancy、resourceTarget、builder、attackTarget、mesh disposal。已有核心覆盖已强，但抽取 lifecycle 时仍容易漏组合场景。 | `tests/death-cleanup-regression.spec.ts` 覆盖 selection/ring/healthbar/outline、attack target、footprint、builder、resource target；`tests/static-defense-regression.spec.ts` 覆盖目标死亡后的塔行为；`tests/construction-lifecycle-regression.spec.ts` 覆盖建造取消清理。 | 组合场景证明：死亡发生在选中、攻击中、采集中、建造中、asset-refreshed 后，后续 update 没有 stale refs、无严重 console error、HUD/selection/occupancy 都稳定。 | 在任何 cleanup / lifecycle / combat extraction 之前补；对 selection 或 placement 单一 slice 可作为后续高优先候选。 |
| AI context / Game bridge after entity mutation | AI 依赖 Game context 读建筑、单位、资源、供给和放置结果。Game.ts 抽取后如果 context 快照或实体过滤漂移，AI 可能仍“有动作”但决策变形。 | `tests/ai-economy-regression.spec.ts` 覆盖 AI 采集、出兵、农场、恢复、饱和；`tests/m4-ai-recovery-regression.spec.ts` 覆盖 worker 损失和 townhall terminal；`tests/first-five-minutes.spec.ts` 覆盖开局压力。 | 在建筑死亡、兵营被摧毁/重建不可用、worker 损失、supply block、placement fail 后，证明 AI context 不包含 dead/invalid entities，且仍遵守资源和供给合同。 | 在抽 spawning/AI bridge 或 SimpleAI context adapter 前补；不应阻塞纯 selection/visual helper。 |
| Minimap / camera / map-load focus | map/minimap/W3X loading 是高风险区；M3 关注可读性，但 M7 抽 boot/render 或 input facade 时可能改变默认 focus、minimap 点击或 HUD 遮挡关系。 | `tests/unit-visibility-regression.spec.ts` 覆盖 W3X camera focus；`tests/m3-base-grammar-regression.spec.ts` 覆盖开局空间语法；`tests/m3-camera-hud-regression.spec.ts` 覆盖核心对象投影在 HUD 上方。 | 证明加载目标地图后默认 camera、minimap click、selection hit-test 和 HUD panel 关系稳定；核心对象可见且可点击，不依赖人工截图。 | 在 boot/render、minimap 或 camera extraction 前补；对 Task 33/34 可记录为后置候选。 |

## Task 35 默认优先级建议

如果 Task 35 只能选一个，按当前 M7 风险和即将到来的 extraction 顺序，优先考虑：

1. `SelectionController 事件语义边界`：直接保护 Task 33。
2. `Placement anchor / footprint roundtrip`：直接保护 Task 34。
3. `HUD command-card cache transitions`：selection 和 command 抽取后最容易出现假绿。
4. `Pathing failure 与 fallback 行为`：placement/pathing bridge 前必须更明确。
5. `Death cleanup 的跨系统残留`：进入 lifecycle/combat 抽取前必须更强。

其他候选不是低价值，只是更适合在触碰对应区域前补，而不是提前把 Task 35 做成大杂烩。

## 记录口径

当某个候选被选中进入 Task 35 时，任务说明应写清：

- 选择的是哪个 gap。
- 现有测试为什么只是部分覆盖。
- 新 regression 的最小断言是什么。
- 若测试失败，允许修哪些最小产品代码。
- 若测试通过，是否足以放行对应 M7 extraction slice。

不要把候选清单改写成“当前已知 bug 列表”。没有 deterministic proof 前，它们只是高风险缺口。
