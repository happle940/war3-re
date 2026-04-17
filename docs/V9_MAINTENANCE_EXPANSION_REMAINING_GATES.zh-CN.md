# V9 Maintenance And Expansion Remaining Gates

> 用途：定义 `V9 maintenance and expansion runway` 的工程 blocker、residual 和异步用户判断。  
> 来源：`V8_TO_V9` transition preheat。V9 不是继续无边界加内容，而是把外部反馈转成可维护 patch / expansion 节奏。

## 0. 当前口径

V9 只在 V8 工程 blocker 清零后启动。它的目标是：

- 把外部 tester 或用户反馈转成 hotfix、patch、debt、user gate 或 expansion 候选。
- 保持 V8 baseline 可复现、可回滚、可解释。
- 从 master roadmap 和真实反馈中选择下一轮扩展，不再凭兴奋点开线。

## 1. 状态词

| 状态 | 含义 |
| --- | --- |
| `preheat-open` | 模板已存在，但 V9 未 active。 |
| `open` | V9 active 后仍缺工程证据。 |
| `engineering-pass` | 工程证据满足，用户判断可异步。 |
| `blocked` | 反馈、baseline 或扩展选择无法闭环。 |
| `residual` | 记录债务，不阻塞 V9 工程面。 |
| `user gate` | 自动化不能代替用户或 tester verdict。 |

## 2. V9 blocker gates

| Gate | 类型 | 初始 V9 结论 | 关闭证据 |
| --- | --- | --- | --- |
| `V9-HOTFIX1` External feedback intake | ops / triage proof | `V9 blocker / engineering-pass` | Task115 + `tests/v9-hotfix-triage-proof.spec.mjs` 证明样例反馈能记录、P0-P5 分级、gate 路由、任务合成、禁止模板拒绝和用户 verdict 不自动通过；Codex 本地复核 build、typecheck、node test 5/5、cleanup、无残留通过。 |
| `V9-BASELINE1` Reproducible V8 baseline | QA / replay proof | `V9 blocker / engineering-pass` | Task116 + `tests/v9-baseline-replay-smoke.spec.ts` 复跑 V8 demo path、V8 RC 内容连通性、V7 战斗模型、cleanup 和 procedural recovery；Codex 本地复核 build、typecheck、focused runtime 5/5、cleanup、无残留通过。 |
| `V9-EXPAND1` Next expansion decision | product / roadmap proof | `V9 blocker / engineering-pass` | `docs/V9_HUMAN_NUMERIC_EXPANSION_PACKET.zh-CN.md` 已把扩展方向固定为完整 Human 核心与数值系统；Task120/121/122 已落 Keep 数据种子、Town Hall -> Keep 最小升级路径和升级后主基地命令面；Task123 已完成 Keep / T2 解锁兼容盘点；Task124 已完成 Keep / T2 解锁目标合同；Task125 已完成 runtime gating dry-run；Task126 已完成 AI 使用现有 Keep 升级路径的最小准备；Task127 已把 Workshop / Arcane Sanctum 真实迁移到 Keep 门槛；Task128 已补升级 / 解锁反馈；Task129 已证明玩家侧最小二本生产路径在同一局可串通；Task130 已证明 AI 在 Keep 后使用既有二本建筑和训练 Mortar / Priest；Task131 已把二本数值写回账本并用静态 proof 对齐 `GameData.ts`；Task132 已把二本成本、人口、时间和禁用原因变成玩家可见提示并通过 runtime proof；Task133 已证明 Mortar Siege/AOE 与 Priest mana/Heal 在受控战斗中成立；Task134 已把 Priest Heal、Rally Call、Mortar AOE 三个现有样本映射到 HN3 ability/effect 字段；Task135 已落地 `ABILITIES.priest_heal` 数据种子；Task136 已把 Priest Heal runtime 迁移到 ability 数据读取并证明行为不变；Task137 已落地 `ABILITIES.rally_call` 数据种子；Task138 已落地 `ABILITIES.mortar_aoe` 数据种子；Task139 已把 Rally Call runtime 迁移到 ability 数据读取；Task140 已把 Mortar AOE runtime 迁移到 ability 数据读取；Task141 已把 Rally Call / Priest Heal 命令卡和可见提示迁移到 ability 数据读取；Task142 已完成 HN3 ability data-read 收口盘点；Task143 已完成 HN4 Militia / Defend branch contract；Task144 已完成 Militia / Call to Arms 数据种子；Task145 已完成 Militia runtime；Task146 已完成 Back to Work runtime；Task147 已完成 Defend 数据种子；Task148 已完成 Defend runtime；Task149 已完成 HN4 closure inventory；Task150 已完成 HN5 Sorceress / Slow branch contract；Task151 已完成 HN5 Sorceress / Slow data seed；Task152 已完成 Sorceress training surface；Task153 已完成 Sorceress mana initialization surface；Task154 已完成手动 Slow runtime；Task155 已完成 Slow auto-cast minimal toggle；Task156 已完成 HN5 closure inventory，证明 Sorceress / Slow 最小链路完整闭环，无越界。后续 Human 扩展需走新分支合同（Knight、Altar/Heroes 或 AI 战术）。 |
| `V9-HEROCHAIN1` Human hero-chain continuation | product / capability proof | `V9 blocker / open` | V9 启动三门已过，但完整 Human 与数值系统主线尚未结束。当前 Paladin 已完成 Holy Light、Divine Shield、Devotion Aura、Resurrection、XP/升级、死亡/祭坛复活、最小反馈、Paladin 最小能力套件全局收口、AI hero strategy 合同、AI Altar + Paladin summon、AI Paladin 技能学习优先级、AI Holy Light 防御施放、AI Divine Shield 低生命自保、AI Resurrection 和 HERO16 全局 AI 收口；Archmage 分支边界合同和来源边界也已完成。下一步进入 HERO17-DATA1：只添加 Archmage 单位数据种子，不暴露 Altar 训练入口，不写能力或运行时。该 gate 未关闭前，V9 不应被 oracle 判成 engineering-closed。 |

最新相邻状态：HN7 Blacksmith/Barracks 升级分支已全局收口，Human core gaps 已盘点。Paladin 链路已经从 HERO1 推进到 HERO16-CLOSE1：Altar、Paladin、Holy Light、死亡/祭坛复活、XP/升级、技能学习、Divine Shield、Devotion Aura、Resurrection、Paladin 最小能力套件全局收口、AI hero strategy 合同、AI 建造 Altar + 召唤 Paladin、AI 技能学习、AI Holy Light、AI Divine Shield、AI Resurrection 和 HERO16 AI 全链路收口均已有证据链。HERO17-CONTRACT1 已完成 Archmage 分支边界合同，HERO17-SRC1 已完成 Archmage / Water Elemental / Brilliance Aura / Blizzard / Mass Teleport 来源边界。当前 Human 仍不是完整 Human：Archmage 还没有数据/运行时/AI，Mountain King / Blood Mage、物品/商店、空军、素材和完整战役/多人仍需另开合同。当前相邻工作是 HERO17-DATA1：Archmage 单位数据种子，不暴露训练入口。

## 3. Carryover / residual into V9

| 输入 | V9 路由 | 处理规则 |
| --- | --- | --- |
| `V8-UA1` External demo verdict | `V9-HOTFIX1` / `V9-EXPAND1` / user gate | tester/user reject 必须先分流，不得直接开新内容。 |
| `V8-PRES1` Presentation polish | `V9-POLISH1` residual | 只有破坏外部理解或反馈质量时升级为 blocker。 |
| `V8-BAL1` Balance tuning | `V9-BALANCE1` residual | 只有破坏 baseline replay 或 tester 反馈质量时升级为 blocker。 |
| 长期 War3-like 扩展 | `V9-EXPAND1` | 只能从一个能力 program 开始，例如完整 Human、英雄/物品、第二地图、第二阵营或多人壳层。 |

## 4. Conditional / user gates

| Gate | 类型 | 初始结论 | 关闭或后移规则 |
| --- | --- | --- | --- |
| `V9-UA1` Long-term direction verdict | user gate | `user gate / user-open / async` | 用户选择继续修 demo、扩完整 Human、加英雄/物品、做新地图/阵营或暂停。 |
| `V9-POLISH1` Presentation polish | residual / conditional | `residual / active` | 只在污染 feedback / baseline 时升级。 |
| `V9-BALANCE1` Balance tuning | residual / conditional | `residual / active` | 只在破坏 baseline / tester loop 时升级。 |

## 5. 当前保守结论

```text
V9 is a maintenance and expansion runway.
V9-HOTFIX1, V9-BASELINE1, and V9-EXPAND1 have engineering evidence.
V9-HEROCHAIN1 is still open; V9 must not be treated as engineering-closed.
Current adjacent work: HERO17-DATA1 Archmage unit data seed without Altar exposure.
Accepted Paladin evidence now includes Altar construction, Paladin summon, Holy Light manual cast and learned feedback, hero death / Altar revive, XP / leveling, skill learning, Divine Shield, Devotion Aura, Resurrection learn/cast/feedback, and each branch closure.
Complete Human is not closed. AI hero strategy, other three Human heroes, air, items, shops, assets, campaign, second race and multiplayer remain out of scope until follow-up contracts open them.
```
