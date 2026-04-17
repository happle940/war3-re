# V6 Identity Systems Remaining Gates

> 用途：定义 `V6 War3 identity alpha` 在正式切换后要关闭的 blocker、carryover、residual 和 user gate。  
> 本文件最初由 `V5_TO_V6` preheat 生成；V6 已在 `docs/VERSION_RUNTIME_STATE.json` 激活，现在它是 V6 当前 gate 清单。

## 0. 当前口径

当前版本状态：

```text
currentVersion: V6
activatedByTransitionId: V5_TO_V6
transitionId: V5_TO_V6
transitionState: cutover-done
```

含义：

- V6 是当前 active milestone。
- `V5-ECO1`、`V5-TECH1`、`V5-COUNTER1`、`V5-HUMAN1` 已在 V5 内收口为工程通过。
- `V5-HUMAN1` 已完成 Task 104 Blacksmith/Rifleman、Task 105 Long Rifles、Task 106 AI Rifleman composition 三段 proof；V6 不需要接管未完成 Rifleman 工作。
- `V5-UA1` 是 user-open / async，可以作为下一版人眼判断背景，但不能由自动化代判，也不要求同步阻塞 V5 -> V6。
- V6 当前已经有 `docs/V6_NUMERIC_SYSTEM_TASK_SEED.zh-CN.md` 作为数值底座任务种子；第一批 live queue 应从 `NUM-A` 开始。
- 本文件定义 V6 当前 gate 口径；不能生成 UI polish、真实素材导入或一次性完整人族实现任务。

V6 的目标不是“完整内容量”或“完整 War3 复刻”，而是：

```text
让玩家在已有战略骨架上看出身份表达：完整人族路线有数值底座，英雄/法术/物品等系统有最小存在感，阵营或单位差异可辨，整体第一眼更像 War3-like。
```

## 1. Gate 状态词

| 状态 | 含义 |
| --- | --- |
| `V6 blocker` | 不关闭就不能说 V6 War3 identity alpha 达成。 |
| `open` | V6 已启动，但该项还没有足够证据关闭。 |
| `carryover` | 从 V5 带入 V6 的非阻断输入，需要路由但不自动变成 blocker。 |
| `residual` | 可跟踪的债务，不阻塞 V6 工程模板，除非破坏 V6 blocker proof。 |
| `user gate` | 自动化只能准备证据，最终需要用户或目标 tester 判断。 |

## 2. V6 blocker gates

V6 blocker 只能来自 `War3 identity alpha`，不得从 V5 的经济产能修复、balance tuning、presentation polish、真实素材导入或完整内容扩张里硬造。

| Gate | 类型 | 初始 V6 结论 | 关闭证据 |
| --- | --- | --- | --- |
| `V6-NUM1` Human numeric foundation | numeric system / engineering proof | `V6 blocker / engineering-pass` | 已证明单位、建筑、科技不再只是散落字段：NUM-A 字段盘点、NUM-B 基础账本、NUM-F proof 计划、NUM-C 攻击/护甲 runtime proof、NUM-D 研究效果数据模型 proof、NUM-E 玩家可见数值提示 proof 均已完成并经 Codex 本地复核。后续完整能力、完整人族和平衡调参不属于 NUM1 阻塞项。 |
| `V6-ID1` Hero / spell / item identity systems | identity systems / engineering proof | `V6 blocker / engineering-pass` | 人族集结号令最小证明包已证明至少一个等价法术/指挥能力有可见状态、真实触发、有限效果、冷却限制、反馈和 cleanup；Codex 本地验证 build、typecheck、ID1 focused 6/6、相关 runtime 30/30 通过。它不声明完整英雄、法术书、物品或完整人族身份。 |
| `V6-FA1` Faction or unit identity difference | faction / roster / engineering proof | `V6 blocker / engineering-pass` | Footman / Rifleman 角色差异证明包已通过 Codex 本地复核：数据来源、生产选择、玩家可读、近战/远程战斗角色和 Long Rifles 远程定位差异均由 focused runtime proof 支撑。它不声明完整人族或完整平衡。 |
| `V6-W3L1` War3-like identity first-look | user-facing identity / review proof | `V6 blocker / engineering-pass` | `docs/V6_WAR3_IDENTITY_FIRST_LOOK_REVIEW_PACKET.zh-CN.md` 已合并 NUM1、ID1、FA1 证据，能说明当前 slice 为什么进入 War3-like identity alpha；V6-UA1 的最终人眼判断仍异步保留。 |

## 2.5 V6-NUM1 第一批任务链

V6 启动后第一优先不是继续随机加单位，而是先建立数值底座。当前任务种子来自 `docs/V6_NUMERIC_SYSTEM_TASK_SEED.zh-CN.md`。

| 顺序 | 任务 | 适合泳道 | 目的 | 触发条件 |
| --- | --- | --- | --- | --- |
| 1 | `NUM-A` 人族数值字段盘点 | Codex | 定义 unit / building / research / ability 最小字段清单。 | 已完成：`docs/V6_NUMERIC_SCHEMA_INVENTORY.zh-CN.md`。 |
| 2 | `NUM-B` 单位与建筑基础账本 | Codex | 给 Peasant、Footman、Rifleman、Town Hall、Farm、Barracks、Blacksmith、Scout Tower 等已有/相邻对象建立数值行。 | 已完成：`docs/V6_HUMAN_NUMERIC_LEDGER.zh-CN.md`。 |
| 3 | `NUM-C` 攻击类型与护甲类型最小模型 | GLM | 让 attackType / armorType 和倍率表进入真实伤害计算。 | 已完成并由 Codex 本地复核：4/4 runtime passed。 |
| 4 | `NUM-D` 研究效果数据模型 | GLM + Codex review | 已完成：Long Rifles 迁移到 `ResearchDef.effects[]`，通用 effect 应用路径和 focused proof 通过。 | Codex 已本地验证 build、typecheck、NUM-D / NUM-C / V5 Long Rifles 相关 runtime 共 12/12 通过。 |
| 5 | `NUM-E` 玩家可见数值提示 | GLM + Codex review | 已完成：命令卡和选择面板展示来自真实数据的成本、人口、攻击/护甲、研究效果和禁用原因。 | Codex 已本地验证 build、typecheck、NUM-C / NUM-D / NUM-E runtime 共 15/15 通过。 |
| 6 | `NUM-F` 数值底座证明计划 | Codex | 固定 focused proof 范围，防止用单场胜负、按钮存在或截图冒充数值系统。 | 已完成：`docs/V6_NUMERIC_PROOF_PLAN.zh-CN.md`。 |

V6-NUM1 只允许补数值底座。它不接管未完成的 Rifleman AI proof，不一次性实现完整人族，不做主菜单审美，不导入真实素材。当前 NUM-A 到 NUM-F 已形成最小工程证据，V6-NUM1 工程通过；下一步转向 V6-ID1。

## 2.6 V6-ID1 第一批身份系统候选

V6-ID1 的验收口径来自 `docs/V6_IDENTITY_SYSTEM_ACCEPTANCE.zh-CN.md`。

最小身份系统必须同时证明：

- 可见状态：玩家能看见可用、进行中、冷却中、已生效或被限制。
- 触发方式：玩家、AI 或 focused spec 有真实触发入口，并能在 fresh state 中看到状态变化。
- 效果反馈：触发后至少一个单位、战斗、状态、范围、持续时间或选择发生可测变化。
- 限制条件：冷却、目标、前置、范围、唯一性、状态冲突或资源限制真实生效。
- focused regression：覆盖触发、效果、限制、反馈和 cleanup。

当前推荐第一批切片：

| 顺序 | 候选切片 | 适合泳道 | 结论 | 原因 |
| --- | --- | --- | --- | --- |
| 1 | 人族集结号令 | GLM | 推荐第一批 | 等价法术 / 指挥能力，能用 fallback/proxy 和现有单位证明触发、效果、限制、反馈，不需要完整英雄池或物品系统。 |
| 2 | 队长代理光环 | GLM | 备选 | 更有英雄感，但容易滑向完整英雄等级、技能点和光环系统。 |
| 3 | 补给物品代理 | GLM | 备选 | 能证明物品-like 身份，但需要持有/消耗状态，容易滑向背包和商店。 |

ID1 不能用按钮、图标、tooltip、换名、换色、装饰动画或单场战斗胜负关闭。真实素材仍禁止导入；第一批只能用自制 fallback/proxy、几何标记或项目内合法素材表达反馈。当前人族集结号令已满足最小工程证据，V6-ID1 工程通过；下一步转向 V6-FA1。

## 2.7 V6-FA1 第一批阵营/兵种身份候选

V6-FA1 的任务种子来自 `docs/V6_FACTION_IDENTITY_TASK_SEED.zh-CN.md`。

当前最短切片不是完整人族，而是：

```text
Footman 近战前排身份 + Rifleman 远程火力身份 + Long Rifles 科技后差异
```

| 顺序 | 候选切片 | 适合泳道 | 状态 | 原因 |
| --- | --- | --- | --- | --- |
| 1 | Footman / Rifleman 角色差异 runtime proof | GLM + Codex takeover | `engineering-pass / Codex verified` | 复用 NUM1 的数值底座和 V5 的 Rifleman / Long Rifles 输入，已证明读图、生产选择和战斗角色差异。GLM 首轮 runtime 失败并卡住后由 Codex 接管修正，FA1 focused 5/5、相关 runtime pack 22/22 通过。 |
| 2 | 人族生产选择 review packet | Codex | `engineering-pass / covered by W3L1 packet` | 已并入 `docs/V6_WAR3_IDENTITY_FIRST_LOOK_REVIEW_PACKET.zh-CN.md`，作为“为什么现在更像 War3-like”的审查输入。 |

FA1 不能用同单位换名、换色、单场胜负或纯 UI 文案关闭。达到一组可验证单位身份差异后应停止 FA1，转向 W3L1，不继续扩张完整人族内容量。

## 2.8 V6-W3L1 第一眼审查包

V6-W3L1 的任务种子来自 `docs/V6_WAR3_IDENTITY_FIRST_LOOK_REVIEW_PACKET_SEED.zh-CN.md`。

W3L1 不再生成新内容切片；它负责把已经通过的工程证据合成一份人眼可审查材料：

| 输入 | 必须状态 | 进入 W3L1 的方式 |
| --- | --- | --- |
| `V6-NUM1` | `engineering-pass` | 作为数值底座和可见提示证据。 |
| `V6-ID1` | `engineering-pass` / `accepted` | 作为身份能力证据。 |
| `V6-FA1` | `engineering-pass` / `accepted` | 作为兵种或阵营差异证据。 |

NUM1、ID1 和 FA1 均已 engineering-pass，`docs/V6_WAR3_IDENTITY_FIRST_LOOK_REVIEW_PACKET.zh-CN.md` 已生成并补入真实证据。W3L1 的工程面可以关闭；`V6-UA1` 的用户 verdict 仍异步保留，不阻塞后续工程预热。

## 3. V5 carryover / residual into V6

这些内容可以作为 V6 接棒输入，但不能抢占 V6 blocker 定义。任何仍 open 的 V5 blocker 必须留在 V5，不能被 V6 吸收。

### 3.1 必须留在 V5

| V5 输入 | 当前状态 | V6 处理规则 |
| --- | --- | --- |
| `V5-HUMAN1` Visible Human roster and tech line | `engineering-pass / blocker-cleared` | 作为 V6 的已完成输入背景：Blacksmith/Rifleman、Long Rifles、AI Rifleman composition 都已通过。不得把 H1 通过扩大解释为完整人族或完整数值系统。 |
| 任何未来仍 open 的 V5 blocker | `open if any` | 必须留在 V5；不得被 V6 gate 吸收。 |

### 3.2 V6 carryover / residual

| V5 输入 | V6 路由 | V6 处理规则 |
| --- | --- | --- |
| `Human complete roster debt` | `V6-NUM1` / `V6-FA1` proof context | 不要求 V6 完成全人族，但 V6 起必须用完整人族终局合同约束数据模型和后续任务。 |
| `Human numeric system debt` | `V6-NUM1` blocker | 数值底座是 V6 blocker，不是后期 polish；至少要有 data-driven schema、attack/armor type 和 research effect model 的工程 proof。 |
| `V5 balance tuning debt` | `V6-BAL0` balance residual | 只在破坏英雄/法术/物品、阵营/单位差异或 War3-like identity proof 时绑定到具体 V6 gate；不得生成纯 balance polish blocker。 |
| `V5 presentation polish debt` | `V6-PRES0` presentation residual | 只在破坏身份可读性或 review packet 时记录；不得生成 UI polish、素材导入或主菜单审美任务。 |
| V5 roster clarity debt | `V6-FA1` / `V6-W3L1` proof context | 只有当 roster clarity 直接影响单位/阵营身份差异或 first-look identity verdict 时，才作为具体失败面记录。 |
| V5 production-decision debt | `V6-ID1` / `V6-FA1` proof context | 只作为英雄/阵营表达与生产选择关系的 proof 输入；不得回滚 V5 strategy backbone closeout。 |

## 4. Conditional / user gates

| Gate | 类型 | 初始结论 | 关闭或后移规则 |
| --- | --- | --- | --- |
| `V6-BAL0` Identity balance carryover | residual / conditional | `carryover / active` | 跟踪 V5 balance tuning debt。只有当 balance 直接破坏 ID1、FA1 或 W3L1 proof，才回流为对应 blocker 的失败面。 |
| `V6-PRES0` Identity presentation carryover | residual / conditional | `residual / active` | 跟踪 V5 presentation polish debt。只处理身份表达可读性，不裁决 UI polish、真实素材导入或视觉风格审批。 |
| `V6-UA1` War3 identity first-look verdict | user gate | `user gate / user-open / async` | 用户或目标 tester 判断 V6 的身份表达是否更像 War3-like。自动化只能提供 ID1、FA1、W3L1 的工程证据和 review packet；不要求同步人工确认才继续工程推进。 |

## 5. 不属于 V6 当前模板的内容

| 内容 | 路由 |
| --- | --- |
| 任何未来仍 open 的 V5 blocker | 留在 V5，不能由 V6 接管。 |
| `V5-HUMAN1` 已完成 H1 分支 | 只作为 V6 数值系统样本输入；不等于完整人族、不等于完整数值系统。 |
| 完整英雄池、完整物品系统、完整法术书 | 后续内容阶段；V6 只要求最小 identity slice。 |
| 完整人族所有单位一次性实现 | V7/V8 内容候选；V6 只要求数值底座和第一批身份分支。 |
| 真实素材 sourcing、授权判断、外部素材导入 | 后续 asset approval flow；不属于本模板。 |
| UI polish、主菜单审美、release copy | 后续 polish/release gate；不属于 V6 blocker。 |
| 长局、完整 ladder、campaign、公开 demo | 后续版本。 |

## 6. V6 closeout 最低要求

| Closeout requirement | 关联 gate | 通过标准 |
| --- | --- | --- |
| 人族数值系统底座成立 | `V6-NUM1` | `NUM-A` 字段盘点、`NUM-B` 基础账本、`NUM-C` 攻击/护甲模型、`NUM-D` 研究效果模型、`NUM-E` 可见数值提示、`NUM-F` proof 计划至少按最小路径形成证据；不能只靠 Rifleman 当前数值或单场战斗。 |
| 身份系统有玩法表达 | `V6-ID1` | 至少一个英雄/法术/物品或等价系统有真实触发、状态、效果、限制和 focused regression。 |
| 阵营或单位差异可观察 | `V6-FA1` | 至少一组身份差异会改变读图、能力、生产/使用选择或战斗角色。 |
| War3-like identity review packet 成立 | `V6-W3L1` | ID1、FA1 的工程证据和截图/state log/review checklist 能组成一次人眼审查包。 |
| V5 carryover 不破坏 identity proof | `V6-BAL0` / `V6-PRES0` | balance 和 presentation debt 不阻断 ID1、FA1、W3L1 的 proof。 |
| 人眼身份 verdict 有记录 | `V6-UA1` | 用户或目标 tester 给出 pass / pass-with-debt / reject / defer。 |

## 7. 当前 V6 必须回答的话

```text
V6 关的是“War3 identity alpha”：第一步必须是完整人族路线所需的数值系统底座，然后才是英雄/法术/物品等身份系统、阵营或单位身份差异、能让玩家认出这像 War3-like 的核心表达。
它不是 V5-HUMAN1 的未完成 Rifleman 分支接管，不是一次性完整科技树或完整战略深度，也不是 UI polish 或真实素材导入。当前 NUM1、ID1、FA1、W3L1 均已工程通过；剩余 V6-UA1 是异步人眼判断，不应阻塞下一版本预热。
```
