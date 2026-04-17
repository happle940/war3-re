# M7 Contract Gap Ranking：Task 35 覆盖缺口优先级

> 用途：给 `Task 35 — M7 Contract Coverage Gap Sweep` 排序。本文只排名高风险合同缺口，不声明它们都是当前真实 bug，也不允许把 Task 35 做成泛泛加测试。

## 排名原则

- 先保护正在或即将发生的 extraction slice，再补长期 no-touch 区。
- 只选能写成确定性 proof 的缺口；不能用“感觉更稳”当目标。
- 已经有 runtime 覆盖的区域，不重复做宽泛测试；只补现有覆盖没有证明的交叉状态。
- 人类判断债不进入 Task 35 工程修复，除非它能被拆成可复现、可断言的合同。

## 优先级总表

| 优先级 | Contract gap | 风险仍在哪里 | 保护 / 阻塞什么 | 最佳下一步 proof shape | 类型 |
| --- | --- | --- | --- | --- | --- |
| 1 | SelectionController 事件语义边界 | 选择、右键、drag、Shift、control group、HUD cache 的交界仍最容易在抽取时被时序漂移破坏。现有 selection-input 覆盖关键行为，但不一定覆盖抽取后事件 payload 到 command dispatch 的完整等价。 | 直接保护 `Task 33`；也保护后续 command / HUD 抽取。 | focused regression 或 closeout review：真实 DOM 事件下证明 click/drag/right-click/Shift 到 selection state、command dispatch、HUD refresh 的映射不变。 | 真工程洞，若 Task 33 已有强 closeout 可降级为 review check。 |
| 2 | Placement anchor / footprint roundtrip | placement preview、validator footprint、spawnBuilding 最终 occupancy、cancel/death release 可能各自绿，但 tile 集合不一定被同一合同串起来。 | 直接保护 `Task 34`；阻止 placement-only slice 漂到 builder agency、payment 或 footprint 语义。 | focused regression：Farm/Barracks/TownHall/GoldMine 的 preview footprint、validator、spawn occupancy、cancel/death release 使用同一 tile 集合。 | 真工程洞，若 Task 34 只碰 preview/validation，应作为验收增强或 Task 35 首选。 |
| 3 | HUD command-card cache transitions | `_lastCmdKey` / `_lastSelKey` 类 cache 能让内部状态正确但玩家看到旧按钮、旧禁用原因、旧 portrait。现有 command-card state 覆盖资源/供给，但跨 selection、construction、death、empty selection 的连续转换仍是高风险。 | 保护 selection slice、placement slice、M4 控制公平、M6 smoke 可理解性。 | focused regression：连续选择 worker -> Town Hall/Barracks -> resource/supply change -> cancel/death/empty selection，断言 DOM 命令卡、portrait、禁用原因、资源文本不 stale。 | 真工程洞；如果 Task 33/34 已完成，这是 Task 35 推荐首攻。 |
| 4 | Order dispatcher 的 gather / attack / build / rally 边界 | move/stop/attackMove 的 order boundary 已有证明，但 gather、attack target、build-resume、set/clear rally 仍分散在 right-click live path、命令面和局部合同里。抽取 selection-to-command 桥时可能漏清 stale state。 | 保护 command surface、selection extraction、M4 控制判断。 | focused regression：公开命令入口与 live right-click 对 gather/attack/build-resume/rally 的字段写入和 stale state 清理等价。 | 真工程洞；若 Task 35 已选 HUD，则放下一轮。 |
| 5 | Pathing failure 与 fallback 行为 | `findPath()` blocked-start 已加强，但 `planPath()` 的 near-target fallback、不可达目标、失败后旧 order state 清理仍可能被 placement/pathing 抽取模糊。 | 保护 placement bridge、unit presence、M4 卡死判断。 | focused regression：不可达/blocked 不穿 blocker；合法 near-target fallback 保留；失败后不残留 stale gather/build/attack target。 | 真工程洞，但只有触碰 pathing/placement bridge 时才优先。 |
| 6 | Death cleanup 组合场景残留 | death-cleanup 核心合同已有，但组合状态仍危险：选中且攻击中、采集中、建造中、asset refreshed 后死亡，可能漏某个引用或 HUD 状态。 | 保护未来 lifecycle/combat/cleanup extraction；支撑 M4 ending clarity。 | focused regression：组合死亡场景后 update 无 stale refs、HUD/selection/occupancy/resource target 稳定、无严重 console error。 | 真工程洞，当前不阻塞 Task 33/34，但进入 lifecycle 前必须补。 |
| 7 | Asset refresh 与 live entity feedback | asset-pipeline 和 visibility 已覆盖 scale/material/可见性，但 selected/attacking/healthbar 状态下 refresh 后反馈挂载是否稳定仍是视觉 helper 抽取风险。 | 保护 Phase A visual helper、unit/building visual factory、M3 可读性。 | focused regression 或 closeout review：selected + healthbar + outline + attack flash 状态下触发 refresh，断言不重复、不丢失、不挂旧对象。 | 真工程洞，但更偏视觉生命周期，Task 35 可后置。 |
| 8 | AI context / Game bridge after entity mutation | AI economy/recovery 已强，但 Game bridge 抽取后如果实体过滤或 context 快照漂移，AI 可能仍“有动作”但用 dead/invalid entities 决策。 | 保护未来 spawning/AI bridge 抽取；支撑 M4/M6 AI activity。 | focused regression：建筑死亡、worker 损失、supply block、placement fail 后 AI context 不含 dead/invalid entities，仍遵守资源/供给。 | 真工程洞，但不应在不触碰 AI bridge 时提前扩大 Task 35。 |
| 9 | Minimap / camera / map-load focus | M3/M6 依赖默认 camera 和可读性；但这更多是 human readability 和 smoke 入口风险，除非开始抽 boot/render/minimap。 | 保护 future boot/render/minimap extraction；支撑 M3/M6 人工判断。 | live smoke evidence 或 focused regression；若问题是“看起来够不够 RTS”，则 defer to human gate。 | 混合项：可见性/遮挡是工程洞，空间感/舒适度是 human-judgment debt。 |

## 真工程洞 vs 人工判断债

### 应进 Task 35 的工程洞

- 事件语义、状态写入、stale state 清理、DOM 状态刷新、footprint roundtrip、pathing fallback、cleanup 引用失效。
- 这些问题能定义期望行为，也能写成 deterministic runtime regression。
- 如果测试失败，可以允许最小产品代码修复；如果测试通过，可以作为对应 extraction 的保护证据。

### 不应进 Task 35 的人工判断债

- “控制是否够顺手”但没有可复现错误。
- “AI 压力是否有趣”但 AI economy/recovery 合同成立。
- “镜头是否舒服”但对象可见、HUD 不遮挡的工程合同成立。
- “proxy 是否足够像 Warcraft-like”但加载、比例和可读性没有客观错误。
- “是否可以公开分享”这属于 M6 用户判断，不是 M7 coverage gap。

人工判断债可以记录，但不要伪装成 coverage gap sweep。

## Task 35 首攻建议

如果 `Task 33` 或 `Task 34` 尚未被 Codex 接受，Task 35 不应绕开它们的直接缺口：

1. 先补 `SelectionController 事件语义边界`，如果 Task 33 证据不足。
2. 再补 `Placement anchor / footprint roundtrip`，如果 Task 34 证据不足。

如果 `Task 33` 和 `Task 34` 都已经被接受，Task 35 推荐首攻：

```text
HUD command-card cache transitions
```

理由：

- 它跨 selection、placement、construction、resource/supply 和 death 状态。
- 它最容易出现“内部状态正确，但玩家看到旧反馈”的假绿。
- 它直接保护 M4 控制公平和 M6 smoke 可理解性。
- 它可以写成 focused regression，不需要扩大成通用 UI test churn。

## 不接受的 Task 35 形态

Codex 应拒绝下面这些 Task 35 方案：

- “补一些测试”但没有指定 gap。
- 同时补 selection、placement、HUD、AI、cleanup 多个方向。
- 为了让测试更容易而弱化现有 runtime proof。
- 把 human approval 项写成工程测试目标。
- 在没有触碰对应区域的情况下提前重写 AI、pathing、asset refresh 或 camera。
- 用 closeout review 口吻替代实际 regression，除非该 gap 本来就是“证据不足 / scope review”问题。

## 记录格式

Task 35 立项时应写：

```text
选择 gap：
排名：
保护的 slice / milestone：
为什么现有测试只是部分覆盖：
新 proof shape：
允许改动文件：
禁止触碰：
验收命令：
如果失败，默认 owner：
```
