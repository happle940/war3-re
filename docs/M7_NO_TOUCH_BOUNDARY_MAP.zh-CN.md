# M7 No-Touch Boundary Map：默认禁碰边界

> 用途：给 `M7` 零行为变化硬化设置默认边界。除非有新的明确合同授权，否则不要让 extraction slice 触碰这些文件或责任区。

## 基本规则

- `M7` 只做零行为变化硬化，不做玩法、AI、视觉品味或产品方向调整。
- 默认不允许 broad `Game.ts` rewrite；每个 slice 必须说明抽什么、不抽什么、用哪些 tests 证明等价。
- 如果行为可能变了，先转合同 / 测试任务，不要继续按 refactor 合并。
- 如果只能靠试玩感觉判断等价，说明该 slice 已经越界。

## No-Touch 文件 / 区域表

| 文件 / 区域 | 默认状态 | 为什么风险高 | 触碰前必须有的证据 | 应先抽什么 |
| --- | --- | --- | --- | --- |
| `src/game/Game.ts` 全文件级大拆分 | 默认 no-touch | 这是 runtime coordinator，同时承载输入、模拟、渲染、HUD、AI bridge 和生命周期。大拆分会让 review 无法判断行为等价。 | 明确 slice 边界；改动文件列表；相关 runtime packs；`npm run build`；`npx tsc --noEmit -p tsconfig.app.json`；必要时 `npm run test:runtime`；可单独回退。 | 先做 `SelectionController` 小切片、`PlacementController` 小切片，或纯视觉 helper。 |
| `Game.ts` unit update / gather / construction / training 状态机 | no-touch，除非新合同授权 | 这里影响移动、采集、建造、训练、资源结算和单位出生。任何条件或时机变化都会直接改变玩家可见行为。 | resource/supply、construction-lifecycle、command-surface、相关 smoke 或新 focused contract 证明旧语义被保持或新语义被批准。 | 不先抽 gameplay system；先抽无副作用 selection query、placement preview 或视觉反馈 helper。 |
| `Game.ts` combat / auto-aggro / order recovery | no-touch | attack-move、stop、hold、auto-aggro、previous order restore 共同决定战斗控制权。小改动会让单位“不听话”。 | command-regression、combat-control、order-model-boundary 等合同全部 green；diff 能逐段对照条件和恢复链。 | 先保持命令执行在原处，只抽 selection 显示映射或 input shell，不能改命令语义。 |
| `Game.ts` health / death / resources cleanup | no-touch | 死亡清理跨 selection、rings、healthbars、occupancy、resourceTarget、builder、attackTarget、mesh disposal。漏一处会留下幽灵状态。 | death-cleanup、construction-lifecycle、static-defense 及必要的组合 cleanup focused contract；确认对象生命周期和引用失效顺序不变。 | 先抽低风险视觉创建 helper；不要先抽 lifecycle manager。 |
| `Game.ts` input orchestration 和右键命令路径 | no-touch，SelectionController 例外需极窄 | mouseup commit、Shift 追加、右键移动/采集/攻击、control group、Tab、HUD cache 都在这里交汇。事件时序变化会破坏 RTS 手感。 | selection-input、command-surface、command-regression；真实 DOM 或 live-like path 证明 left/right/drag/shift 语义不变。 | 先抽 selection query / lookup、选中集合到显示层的纯映射、selection ring helper；不要搬 command decisions。 |
| `Game.ts` building placement agency / builder assignment / payment / progress | no-touch，PlacementController 只碰 preview 边界 | builder agency、资源支付、build progress、取消、续建、footprint release 是 M2/M4 核心合同。 | building-agency、construction-lifecycle、pathing-footprint；若触碰 payment 还要 resource/supply；证明 builder 选择、支付时机、取消/续建行为不变。 | 先抽 placement mode state、ghost / preview helper、validator bridge；不碰 builder 指派和生命周期。 |
| `Game.ts` pathing bridge / footprint / occupancy | no-touch | `planPath()` fallback 有 gameplay 语义；建筑 anchor、mesh origin、footprint rounding 和 occupancy 强耦合。 | pathing-footprint contract；若改 anchor/size，需要 explicit footprint roundtrip proof；不能只用视觉对齐。 | 先抽 placement preview 与 validator 调用边界；等 footprint 合同足够强后再考虑 adapter。 |
| `Game.ts` spawning / occupancy / AI bridge | no-touch | spawn 位置、占地标记、AI context 和实体过滤耦合。抽错会让 AI 读到 dead/invalid entities 或让 footprint 漂移。 | first-five、ai-economy、m4-ai-recovery、pathing-footprint；必要时新增 AI context focused contract。 | 先抽 selection 或 placement 小切片；不要先抽 AI bridge。 |
| `src/game/SimpleAI.ts` / AI economy / AI recovery | no-touch | AI 压力和恢复直接影响 M4/M6 可玩性。调度、资源读写、供应判断、波次条件变化都不是纯重构。 | ai-economy、m4-ai-recovery、first-five 目标版本绿；若行为变化，应新开 AI contract task。 | M7 中先抽不影响 AI 的 Game-side display/placement helper。 |
| Asset refresh / async visual swap / asset pipeline files | no-touch，除非是已覆盖的纯视觉 helper | async asset replacement 会影响 scale、material isolation、selection ring、healthbar anchor、outline、attack flash。 | asset-pipeline、unit-visibility、相关 visual feedback proof；必须证明 live entity refresh 后反馈仍挂在正确对象上。 | 先抽 procedural fallback mesh creation 或 move/attack/impact indicator factory，不改 refresh 时机。 |
| HUD / command card cache key 与状态刷新 | no-touch，除非有 HUD focused proof | `_lastCmdKey` / `_lastSelKey` 可能让内部状态正确但玩家看到旧按钮、旧资源、旧选择。 | command-card-state、command-surface、construction-lifecycle；如果抽 presenter，必须证明连续状态转换不 stale。 | 先抽 portrait / mini portrait 绘制或纯格式化 helper；不要先改 cache 规则。 |
| Map / minimap / W3X loading / camera focus | no-touch | 默认镜头、map load、minimap input 和 HUD framing 影响 M3 可读性和 M6 smoke。 | unit-visibility、m3-base-grammar、m3-camera-hud；如果改 input，还要 selection-input。 | 先抽 selection/placement 小切片；不要在 M7 顺手调相机、地图 scale 或 minimap 行为。 |
| tests、queue docs、milestone source docs | no-touch，除非任务合同明确授权 | M7 slice 如果顺手改 tests 或队列，容易把验证标准和实现改动混在一起。 | 新任务明确允许；说明测试为何要改；旧测试不能被删除或弱化。 | 先写 review 记录或 contract gap candidate；不要在 extraction slice 里改验证口径。 |

## 默认可先抽的低风险边界

优先选择这些，因为它们更容易证明零行为变化：

- selection query / lookup helper。
- 选中集合到 selection ring / subgroup / HUD 显示输入的纯映射。
- box select / ring / indicator 的无副作用 helper。
- placement mode state、ghost / preview helper、validator bridge。
- procedural unit / building fallback mesh creation。
- move / attack / impact indicator creation。
- portrait / mini portrait drawing 或纯格式化 helper。

这些也不是免审。只要触碰状态写入、事件时机、资源支付、AI、pathing、cleanup 或 HUD cache，就立刻回到 no-touch 规则。

## 触碰 no-touch 区域前的最低证明

要触碰 no-touch 区域，任务说明必须先写清：

1. 为什么这个区域必须现在碰，而不是先抽更低风险边界。
2. 哪个行为合同保护它。
3. 哪些玩家可见行为明确不变。
4. 哪些 runtime packs 必须通过。
5. 如果发现行为差异，是否回退、缩小 scope，还是转合同 / 测试任务。

没有这五项，不要开始实现；已经开始的 slice 应暂停并改写。

## Codex review 口径

- GLM 改到 no-touch 区域但没有合同授权：`Reject`。
- GLM 同时搬多个高风险区：`Defer`，要求拆小。
- GLM 顺手修 bug：转 contract / test task，不能按 M7 hardening 接受。
- GLM 只给 typecheck 或泛泛 `tests pass`：证据不足，要求补验证。
- GLM 的 diff 保持等价、范围小、验证足：才进入 M7 slice review。
