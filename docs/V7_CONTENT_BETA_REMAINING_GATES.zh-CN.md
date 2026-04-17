# V7 Content Beta Remaining Gates

> 用途：定义 `V7 content and beta candidate` 已激活后必须关闭的工程 blocker、residual 和 user gate。  
> 来源：`V6_TO_V7` transition preheat；V7 已由 `scripts/version-cutover.mjs` 单步激活。

## 0. 当前口径

当前阶段状态：

```text
transitionId: V6_TO_V7
fromVersion: V6
toVersion: V7
fromMilestone: V6 War3 identity alpha
toMilestone: V7 content and beta candidate
currentVersion: V7
activatedAt: 2026-04-15
```

含义：

- V6 的工程 blocker 已经清零，`V6-UA1` 仍是异步人眼判断。
- V7 已经进入执行期，不能继续用 `preheat-open` 作为任务状态。
- V7 不能只叫“继续加内容”，必须把内容完整度、数值系统、AI 使用、稳定性和 beta 审查绑定在一起。
- V7 不是公开 demo，也不是完整 War3 终局；它是 Human 内容与 beta 候选阶段。

## 1. 状态词

| 状态 | 含义 |
| --- | --- |
| `V7 blocker` | 不关闭就不能宣称 V7 content / beta candidate 达成。 |
| `preheat-open` | V7 模板已准备，但正式 cutover 前不能派发。 |
| `open` | V7 active 后仍缺工程证据。 |
| `engineering-pass` | 工程证据满足，用户判断可能仍异步。 |
| `blocked` | focused proof 明确失败。 |
| `residual` | 记录债务，不阻塞 V7 工程面，除非破坏 blocker proof。 |
| `user gate` | 自动化只能准备证据，不能替用户或 tester 判断。 |

## 2. V7 blocker gates

| Gate | 类型 | 初始 V7 结论 | 关闭证据 |
| --- | --- | --- | --- |
| `V7-SCOPE1` Beta scope freeze | product scope / governance proof | `V7 blocker / engineering-pass` | V7 当前只收四条 Human 内容线：Lumber Mill + Guard Tower 最小塔线、Arcane Sanctum + Priest 最小法师线、Workshop + Mortar Team 最小攻城线、AI 同规则使用其中至少一条。完整人族其余内容后移，不进入 V7 blocker。 |
| `V7-HUM1` Human content breadth | content / gameplay proof | `V7 blocker / engineering-pass` | Task 107 塔线、Task 108 法师线、Task 109 工程线均已 Codex accepted；三条内容线都有数据、前置、命令卡、runtime proof 和玩家可见状态。 |
| `V7-NUM2` Advanced numeric/combat model | numeric / combat proof | `V7 blocker / engineering-pass` | Mortar AOE/filter 与 Priest caster mana 均已 Codex accepted，证明来自数据与 runtime 行为。 |
| `V7-AI1` Same-rule beta AI | AI / match proof | `V7 blocker / engineering-pass` | Task 110 已 accepted：AI 按同一套资源、人口、前置、研究和生产规则使用 Tower / Workshop / Mortar 内容；同时保留第一、第二波开局压制，不直接 spawn 或跳过训练。 |
| `V7-STAB1` Beta stability and regression | QA / runtime proof | `V7 blocker / engineering-pass` | Task 111 已 accepted：稳定性包 5/5、完整 V7 内容包 31/31、build/typecheck/cleanup/无残留证明通过。 |
| `V7-BETA1` Beta candidate review packet | review / release-readiness proof | `V7 blocker / engineering-pass` | `docs/V7_BETA_CANDIDATE_REVIEW_PACKET.zh-CN.md` 已 candidate-ready，列出可玩内容、证明命令、已知缺口、不可对外承诺范围和人眼判断问题；明确不是 public demo 或 release candidate。 |

## 2.1 V7-CX1 范围冻结结果

V7-CX1 在 `2026-04-15 10:36:52 CST` 冻结本版范围。后续自动补任务只能围绕下表选定内容展开，不能把“完整人族终局”全部塞进 V7。

| 线 | V7 必做范围 | V7 证明方式 | 后移内容 |
| --- | --- | --- | --- |
| 塔线 / 木材线 | `Lumber Mill` + `Scout Tower -> Guard Tower` 最小可玩切片。 | 真实数据、成本、前置、建造或升级入口、命令卡状态、focused runtime proof。 | Cannon Tower、Arcane Tower、完整 Masonry / Lumber Harvesting 多级科技。 |
| 法师线 | `Arcane Sanctum` + `Priest` 最小 caster 切片。 | mana、施法入口、效果、限制、HUD 状态和 runtime proof。 | Sorceress、Spell Breaker、Adept/Master 全量训练和 Control Magic。 |
| 工程线 | `Workshop` + `Mortar Team` 最小攻城切片。 | projectile、AOE 或 target filter 至少一类高级战斗模型进入数据和 runtime proof。 | Flying Machine、Siege Engine、Flare、Fragmentation Shards、Barrage 全量线。 |
| AI 线 | AI 按同规则使用至少一个 V7 已证明内容。 | 不跳资源、人口、前置或科技；有 build/train/research/use proof。 | 多路线完整 AI、完整战术权重和平衡优化。 |

V7 明确不做：

- 完整英雄系统、物品商店、四英雄、召唤物和复活闭环。
- Keep / Castle 完整 tier、空军线、完整 Workshop 全单位、完整 Sanctum 全单位。
- 公开 demo、release candidate、对外传播包装。
- 未授权官方素材、图标、音频或提取资源。
- 纯审美 polish；除非它直接阻断 beta 审查路径。

首批执行顺序：

1. GLM Task 107：Lumber Mill / Guard Tower 最小切片。
2. Codex V7-CX2：把选定 Human 内容整理成证明矩阵。
3. GLM Task 108 / 109：Priest caster 切片、Mortar siege 切片。
4. Codex V7-CX3：固定高级数值与战斗模型接线。
5. GLM Task 110：AI 同规则使用一个 V7 内容。
6. Codex V7-CX4：beta candidate 审查包。

## 2.2 V7-CX2 Human 内容证明矩阵

V7-HUM1 不按“新增了名字”验收，只按下面矩阵验收。每个对象至少要同时满足数据、前置、命令卡、runtime proof、玩家可见状态五个面。

| 内容对象 | 数据面 | 前置面 | 命令卡面 | runtime proof | 玩家可见状态 |
| --- | --- | --- | --- | --- | --- |
| `Lumber Mill` | `GameData` 有成本、生命、建造时间、footprint 或 size。 | 只能从真实建造入口出现；不能直接塞进完成建筑列表冒充。 | 建造按钮有 available / building / completed 状态。 | `tests/v7-lumber-mill-tower-branch-proof.spec.ts` 从 fresh state 证明建造入口和完成状态。 | 选中、建造中、完成后能看到名称、成本或禁用原因来源。 |
| `Guard Tower` 最小塔线 | Tower 或 tower upgrade 的前置来自数据字段。 | 必须被 `Lumber Mill` 或等价已证明前置锁住；前置缺失时按钮禁用。 | 缺前置禁用，前置满足后可建造或可升级。 | 同一 focused proof 证明前置变化后命令卡刷新，不用 stale cache。 | 玩家能看到为什么之前不能做、为什么之后能做。 |
| `Arcane Sanctum` | 有建筑数据、成本、建造时间和生产/能力入口。 | 以 Barracks 作为 V7 tier proxy，完整 War3 tier 差距已记录。 | 建造按钮和 Priest 训练入口状态真实。 | `tests/v7-arcane-sanctum-caster-proof.spec.ts` 已证明数据、前置、训练入口和命令卡正常路径。 | 玩家能看懂这是法师线入口，不是装饰建筑。 |
| `Priest` | 有单位数据、mana、基础生存与移动数值。 | 只能从已完成的 `Arcane Sanctum` 或等价训练建筑生产。 | 训练按钮、治疗按钮、mana/冷却不足状态真实。 | `tests/v7-arcane-sanctum-caster-proof.spec.ts` 已证明施法消耗 mana、进入冷却、治疗友军、拒绝敌方/满血/无 mana/越界目标，并显示 HUD mana。 | HUD 或命令卡能显示 mana、可用/不可用原因和效果反馈。 |
| `Workshop` | 有建筑数据、成本、建造时间和训练入口。 | V7 可使用当前工程已有 beta 前置，但不能免费从开局出现。 | 建造按钮和 Mortar 训练入口状态真实。 | `tests/v7-workshop-mortar-combat-model-proof.spec.ts` 或后续 focused proof。 | 玩家能看懂这是工程/攻城线入口。 |
| `Mortar Team` | 有单位数据、攻击模型和攻城角色字段。 | 只能从已完成 `Workshop` 或等价训练建筑生产。 | 训练按钮和攻击/目标限制状态真实。 | `tests/v7-workshop-mortar-combat-model-proof.spec.ts` 已证明 Workshop 训练入口、Mortar Siege 数据、AOE 溅射和同队/金矿过滤。 | 玩家能观察到它和 Footman/Rifleman 不是换名同单位。 |
| `V7 AI content use` | AI 读取同一套单位、建筑、科技和成本数据。 | 不跳资源、人口、建筑前置或研究前置。 | 不需要独立 UI，但必须不破坏玩家命令卡事实。 | `tests/v7-ai-same-rule-content-proof.spec.ts` 已通过；相关 AI / Rifleman / Mortar 回归 18/18。 | 对局中能看到 AI 用过 Tower / Workshop / Mortar 相关内容，同时开局进攻节奏不被高级内容饿死。 |

矩阵关闭规则：

- 单个对象只有进入 focused proof 后，才能算作 V7-HUM1 的有效内容。
- 如果某个对象只完成数据或按钮，但没有 runtime proof，它只能算 `matrix-ready`，不能关闭 blocker。
- 如果为了通过 proof 需要新增视觉代理，必须另开素材/表现任务；当前 Task 107 不允许改 `BuildingVisualFactory.ts`。
- V7-HUM1 的工程通过，需要至少三条内容线都有被 Codex accepted 的 focused proof：塔线、法师线、工程线。当前已满足。

## 2.3 V7-CX3 高级数值与战斗模型接线计划

V7-NUM2 不接受“多写几个字段但没人用”。本版只先接两类高级模型，绑定到 V7 已选内容：

| 模型 | 绑定内容 | 数据入口 | 行为入口 | focused proof | 不做什么 |
| --- | --- | --- | --- | --- | --- |
| `caster mana` | `Priest` | Priest 已有 `maxMana`、当前 `mana`、mana regen、heal cost、cooldown 和 range。 | Priest 通过命令卡或可测调用触发最小 Heal，消耗 mana、进入冷却并治疗友军。 | `tests/v7-arcane-sanctum-caster-proof.spec.ts` 9/9 已证明 mana 不足、冷却、满血、敌方、越界、HUD 和命令卡状态。 | 不做完整 spell system，不做 Sorceress / Spell Breaker 全技能，不做英雄技能。 |
| `projectile / AOE / target filter` | `Mortar Team` | `GameData` 已声明 `AttackType.Siege`、`MORTAR_AOE_RADIUS`、`MORTAR_AOE_FALLOFF`；不能只把攻击数字调大。 | Mortar 攻击通过统一 combat path 对主目标周围敌人造成溅射，并过滤同队和中立金矿。 | `tests/v7-workshop-mortar-combat-model-proof.spec.ts` 3/3 通过；证明差异来自数据字段，并能在 fresh runtime 中复现。 | 不做完整弹道表现系统，不做所有攻城科技，不做空地全 target taxonomy。 |

接线规则：

- V6 的 `attackType / armorType`、research effect model 和玩家可见数值提示继续作为底座。
- 新模型必须先写数据结构，再写行为读取，再写 command/HUD 状态，再写 runtime proof。
- 如果为了实现模型必须扩展共享 combat pipeline，优先抽成小而可测的 helper；禁止在 `Game.ts` 里散落一次性 `if (unit.type === 'priest')` / `if (unit.type === 'mortar')`。
- V7-NUM2 只有当上述两类模型都被 Codex accepted，且 build/typecheck/focused runtime/cleanup 通过后，才允许改成 engineering-pass。当前已满足；V7-STAB1 也已通过，后续只剩 V7-BETA1 审查包。

## 3. Carryover / residual into V7

| 输入 | V7 路由 | 处理规则 |
| --- | --- | --- |
| `V6-UA1` War3 identity first-look verdict | `V7-UA1` user context | 作为异步人眼判断背景；若用户 reject，回流到对应 V7 blocker 的失败面。 |
| V6 identity tuning debt | `V7-PRES1` / blocker context | 只有当身份可读性破坏 V7-HUM1 或 V7-BETA1 时才升级为修复任务。 |
| V6 onboarding debt | `V7-ONB1` residual | 只在阻断 beta tester 自助试玩时进入工程 blocker。 |
| Human complete roster debt | `V7-HUM1` / V8 carryover | V7 必须推进选定 Human 内容范围，但不要求一口气完成完整 War3 人族终局。 |
| V6 polish debt | `V7-PRES1` residual | 不抢 V7 主山；只有破坏 beta candidate 审查才绑定到 blocker。 |

## 4. Conditional / user gates

| Gate | 类型 | 初始结论 | 关闭或后移规则 |
| --- | --- | --- | --- |
| `V7-BAL1` Beta balance carryover | residual / conditional | `residual / active` | 记录节奏、伤害、资源、人口和平衡债务；只有破坏 V7 proof 才回流为 blocker。 |
| `V7-PRES1` Presentation and asset quality | residual / conditional | `residual / active` | 记录视觉、音效、素材和可读性债务；真实素材必须走批准流程，不能替代 gameplay proof。 |
| `V7-ONB1` Beta onboarding clarity | residual / conditional | `residual / active` | 记录 tester 是否能自助理解；若无法开始或无法判断目标，升级到 V7-BETA1 失败面。 |
| `V7-UA1` Beta candidate verdict | user gate | `user gate / user-open / async` | 用户或目标 tester 判断 V7 是否可称为 beta candidate；不要求同步阻塞工程推进，但必须记录。 |

## 5. 不属于 V7 当前模板的内容

| 内容 | 路由 |
| --- | --- |
| 完整四族、完整战役、ladder、多人大厅 | V8+ 或更后。 |
| 公开 demo、release candidate、对外传播包装 | V8。 |
| 官方 Warcraft 素材、图标、音频或未授权内容 | 永远禁止；只能使用合法 proxy / fallback / approved assets。 |
| 一次性完整人族全部英雄、物品、空军和所有科技 | V7 可以切选定范围，剩余进入 V8/V9；不能为了 scope freeze 牺牲证明质量。 |
| 纯 UI polish 或视觉审美改造 | residual，除非破坏 beta 审查路径。 |

## 6. V7 closeout 最低要求

| Closeout requirement | 关联 gate | 通过标准 |
| --- | --- | --- |
| V7 范围冻结 | `V7-SCOPE1` | 选定 Human 内容范围、缩减边界、禁止扩张项和后移内容写清。 |
| Human 内容可玩切片成立 | `V7-HUM1` | 已通过：塔线、法师线、工程线均有 Codex accepted focused proof。 |
| 高级数值/战斗模型成立 | `V7-NUM2` | 已通过：Priest caster mana 与 Mortar AOE/filter 进入数据与 runtime proof。 |
| AI 同规则使用选定内容 | `V7-AI1` | 已通过：Task 110 证明 AI 不跳前置、不直接 spawn，能按同规则使用 V7 Tower / Workshop / Mortar 内容。 |
| beta 稳定性证据成立 | `V7-STAB1` | 已通过：Task 111 稳定性包 5/5，完整 V7 内容包 31/31，cleanup 后无残留。 |
| beta candidate 审查包成立 | `V7-BETA1` | 已通过：审查包 candidate-ready，列出可玩内容、证明命令、已知缺口、人眼问题和不可对外承诺范围。 |

## 7. 当前保守结论

```text
V7 的主山是 Human 内容与 beta 候选，不是继续做 V6 身份证明。
V7 范围已经冻结：本版只收 Lumber Mill/Guard Tower、Priest、Mortar Team 和至少一个同规则 AI 使用证明；内容、数值、AI、稳定性和审查包工程线已通过。
V7 不等于公开 demo，不等于完整 War3 终局，也不允许导入未授权素材。
```
