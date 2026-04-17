# V5 Strategy Backbone Remaining Gates

> 用途：定义 `V5 strategy backbone alpha` 在正式切换后要关闭的 blocker、carryover、residual 和 user gate。  
> 本文件最初由 `V4_TO_V5` preheat 生成；V5 已在 `docs/VERSION_RUNTIME_STATE.json` 激活，现在它是 V5 当前 gate 清单。

## 0. 当前口径

当前版本状态：

```text
currentVersion: V5
activatedByTransitionId: V4_TO_V5
transitionId: V4_TO_V5
transitionState: cutover-done
```

含义：

- V4 工程 blocker 已清零，`V4_TO_V5` 已完成切换。
- V5 工程项已经具备收口条件：`V5-ECO1`、窄口径 `V5-TECH1`、`V5-COUNTER1`、`V5-HUMAN1` 均有 focused proof。
- `V5-HUMAN1` 已完成三段：`Task 104` Blacksmith/Rifleman，`Task 105` Long Rifles，`Task 106` AI Rifleman composition。Codex 复核时补了“Blacksmith 丢失后 AI 不再排 Rifleman”的前置保护测试，AI focused pack 现在是 3/3 通过。
- V5 当前任务只围绕战略骨架 alpha：经济与产能、科技与建造顺序、基础 counter / army composition、玩家可见的人族第一条单位/科技线。
- 本文件后续更新必须绑定真实 proof、state log、截图包或明确 review 结论，不能继续使用预热口径。
- V5 首批 blocker 原为 `V5-ECO1`、`V5-TECH1`、`V5-COUNTER1` 三条战略骨架主链；2026-04-14 用户试玩新增 `V5-HUMAN1`，用于锁住“玩家可见的人族兵种/科技线”缺口。

V5 的目标不是“完整 War3 战略深度”，而是：

```text
让短局 alpha 之后出现可解释的战略骨架：经济能滚动、产能能选择、科技/建造顺序有意义、基础 counter 与兵种组成不是装饰。
```

## 1. Gate 状态词

| 状态 | 含义 |
| --- | --- |
| `V5 blocker` | 不关闭就不能说 V5 strategy backbone alpha 达成。 |
| `open` | V5 已启动，但该 gate 还没有足够证据关闭。 |
| `partial-runtime-proof` | 该项已经有部分真实运行证据，但还缺最后一段 proof 或 Codex 复核。 |
| `carryover` | 从 V4 带入 V5 的非阻断输入，需要路由但不自动变成 blocker。 |
| `residual` | 可跟踪的债务，不阻塞 V5 工程模板，除非破坏 V5 blocker proof。 |
| `user gate` | 自动化只能准备证据，最终需要用户或目标 tester 判断。 |

## 2. V5 blocker gates

V5 blocker 只能来自 `strategy backbone alpha`，不得从 V4 的结果闭环、UI polish 或非关键 shell debt 里硬造。

| Gate | 类型 | 初始 V5 结论 | 关闭证据 |
| --- | --- | --- | --- |
| `V5-ECO1` Economy and production backbone | economy / production / engineering proof | `engineering-pass / blocker-cleared` | 必须证明经济与产能形成主链：worker、gold/lumber、supply、Town Hall、Barracks、Farm 或等价 production chain 能支持连续生产；不能只有一次性开局资源或静态单位。2026-04-14 新证据复核：`./scripts/run-runtime-tests.sh tests/v5-economy-production-backbone.spec.ts --reporter=list` 为 `6/6 passed`，gold income、lumber income、supply chain、full production cycle、damage recovery 和 comprehensive audit 均通过；ECO1 工程 blocker 关闭，但不关闭 TECH1、COUNTER1 或 V5-UA1。 |
| `V5-TECH1` Tech and build-order backbone | tech / build order / engineering proof | `engineering-pass / blocker-cleared` | 必须证明科技与建造顺序有最小战略含义：至少一条可解释 build order 会解锁或强化后续选择；不能只是把建筑摆出来。2026-04-14 新证据复核：`./scripts/run-runtime-tests.sh tests/v5-tech-build-order-backbone.spec.ts --reporter=list` 为 `6/6 passed`，覆盖 build order timeline、resource prerequisite、building prerequisite、supply prerequisite、observable progression 和 6-point behavioral audit；TECH1 工程 blocker 关闭，但不关闭 COUNTER1 或 V5-UA1，也不声明完整科技树。 |
| `V5-COUNTER1` Basic counter and army composition backbone | combat strategy / army composition / engineering proof | `engineering-pass / blocker-cleared` | 必须证明基础 counter 与兵种组成有可观察差异：玩家或 AI 的单位组合、生产选择或战斗结果会因对手构成而变化；不能只有单一单位互殴。2026-04-14 Codex 接管 GLM 卡住的 Task 103 后收窄 proof：`./scripts/run-runtime-tests.sh tests/v5-counter-composition-backbone.spec.ts --reporter=list` 为 `5/5 passed`，覆盖 footman/worker 属性差异、护甲真实减伤、军队组合输出差异、tower support composition 差异和 bounded strategy audit。COUNTER1 工程 blocker 关闭，但不关闭 HUMAN1 或 V5-UA1，也不声明完整战斗平衡。 |
| `V5-HUMAN1` Visible Human roster and tech line | human roster / visible tech / engineering proof | `engineering-pass / blocker-cleared` | 必须证明玩家可见的人族不再只有 worker + footman：至少一条新人族单位/科技线通过真实建筑前置、训练、研究、命令卡和 AI 使用闭环形成选择。当前 Task 104/105/106 已形成闭环：玩家可建 Blacksmith、可训练 Rifleman、可研究 Long Rifles；AI 会建 Blacksmith、训练 Rifleman、研究 Long Rifles，并形成非 footman-only composition。Codex 复核补测了 Blacksmith 丢失后不继续排 Rifleman，防止前置绕过。 |

## 3. V4 carryover / residual into V5

这些内容可以作为 V5 接棒输入，但不能抢占 V5 blocker 定义。`carryover` 只能进入 `V5-PACE0` 或 `V5-SD1`；任何 residual 只有在直接破坏三条 V5 blocker proof 时，才作为对应 gate 的失败面记录。

### 3.1 V4 carryover

| Carryover | V5 路由 | V5 处理规则 |
| --- | --- | --- |
| `V4 pacing tuning debt` | `V5-PACE0` pacing residual | 只在影响经济滚动、产能节奏、counter proof 时回流到对应 blocker；不得生成纯平衡 polish 任务。 |
| `V4 non-critical shell clarity debt` | `V5-SD1` strategic decision surfaces | 只在战略选择说明、结果解释或决策面板影响 V5 proof 理解时记录；不得变成主菜单质量或 UI polish blocker。 |

### 3.2 V4 residual proof context

| Residual 输入 | V5 记录位置 | V5 处理规则 |
| --- | --- | --- |
| V4 stall/recovery debt | `V5-ECO1` proof context | 不是新的 V5 blocker，也不是 carryover gate。只有当它直接破坏 economy/production backbone proof 时，才写成 `V5-ECO1` 的具体失败面。 |
| V4 flow clarity debt | `V5-SD1` strategic decision surfaces | 只作为战略决策面理解度输入；不得回滚 V4 shell 工程通过。 |

## 4. Conditional / user gates

| Gate | 类型 | 初始结论 | 关闭或后移规则 |
| --- | --- | --- | --- |
| `V5-PACE0` Short-match pacing carryover | residual / conditional | `carryover / active` | 跟踪 V4 pacing tuning debt。只有当 pacing 直接破坏 ECO1、TECH1 或 COUNTER1 的 proof，才回流为对应 blocker 的失败面。 |
| `V5-SD1` Strategic decision surfaces | product clarity / conditional | `residual / active` | 只处理战略选择是否被玩家理解：经济、建造、科技、counter 的说明和状态面板。不得裁决主菜单审美或当前 V4 结果页 closeout。 |
| `V5-UA1` Strategy backbone first-look verdict | user gate | `user gate / user-open / async` | 用户或目标 tester 判断 V5 的经济/科技/counter/H1 骨架是否像真实战略选择。自动化只能提供工程证据；该项不再要求同步人工确认才能进入 V6，用户后续反馈进入 V6 或后续版本任务。 |

## 4.5 2026-04-14 ECO1 新证据收口复核

| 项 | 结论 |
| --- | --- |
| focused command | `./scripts/run-runtime-tests.sh tests/v5-economy-production-backbone.spec.ts --reporter=list` |
| focused result | `6/6 passed`；通过项为 gold income、lumber income、supply chain、full production cycle、damage recovery、comprehensive economy backbone audit。 |
| 资源流 proof | gold proof 证明 worker gather 后 gold 增长；lumber proof 使用真实 `gather` command、tree target、45s runtime advance，并在重新读取 `g.resources.get(0).lumber` 后通过 `lumberAfter > lumberBefore` 断言。该新证据覆盖旧 C89 的 `200 -> 200` lumber failure。 |
| production/economy state log | production cycle: `gold0=500`、`goldAfterEarn=560`、`goldAfterSpendAndEarn=660`、`goldFinal=760`、`totalWorkers=7`、`gatheringWorkers=5`、cycle=`earn -> spend -> earn -> spend -> earn`。damage recovery: `goldBeforeDamage=560`、`workersAfterDamage=2`、`goldAfterDamage=560`、`workersRecovered=5`、`goldRecovered=790`、`gatheringRecovered=5`。audit: `goldBefore=500`、`goldAfterGather=580`、`workerCount=6`、`supply=6/10`、`footmen=1`、`gathering=5`。 |
| 通过面 | 资源流覆盖 gold/lumber；supply chain 证明 Farm / supply cap 会影响生产；production cycle 证明 `earn -> spend -> earn -> spend -> earn`，不是一次性初始资源消耗；damage recovery 证明受损后可补 worker 并恢复采集。 |
| ECO1 closeout | `engineering-pass / blocker-cleared`。经济与产能主链已有可复跑 focused proof，ECO1 工程 blocker 关闭。 |
| 不关闭范围 | 不关闭 `V5-TECH1`、`V5-COUNTER1` 或 `V5-UA1`。不生成完整科技树、完整战略深度、UI polish 或 V6 身份系统任务。 |

## 4.6 2026-04-14 TECH1 新证据收口复核

| 项 | 结论 |
| --- | --- |
| focused command | `./scripts/run-runtime-tests.sh tests/v5-tech-build-order-backbone.spec.ts --reporter=list` |
| focused result | `6/6 passed`；通过项为 build order timeline、resource prerequisite、building prerequisite、supply prerequisite、observable progression、comprehensive build order audit。 |
| build order timeline | `START -> AFTER_GATHER -> AFTER_FARM -> AFTER_BARRACKS -> AFTER_TRAIN`。起点 `workers=5`、`resources=500g/200l`、`supply=5/10`、buildings=`townhall,barracks`；gather 后 `gold=550`；farm 后 `supply=5/16`；barracks 建成后训练 footman；最终 `footmen=1`、`supply=7/16`。 |
| 前置条件 proof | resource prerequisite：资源 drain 到 `0g/0l` 后，农场、兵营、箭塔按钮均 disabled，原因是 `黄金不足 / 木材不足`。building prerequisite：无 barracks 时 `footmenBefore=0`、`footmenAfter=0`，但 TH 仍可训练 worker。supply prerequisite：`supplyAtCap=10/10` 时 footman 按钮 disabled，原因是 `人口不足`。 |
| 解锁或强化 proof | observable progression：`start.canTrainWorker=true`、`start.canTrainFootman=false`；gather 使 gold `500 -> 550`；farm 使 supply `10 -> 16`；barracks 使 `footmanCapableBefore=false` 变为 `true`；train 使 footmen `0 -> 1`。closeout audit 记录 TH trains workers、Barracks trains footmen、Farm increases supply、gathering increases gold、execution chain 全部 passed，execution=`Farm:true BK:true Footmen:2`、`supplyAfter=10/22`、`goldRemaining=920`。 |
| TECH1 closeout | `engineering-pass / blocker-cleared`。至少一条 build order 已通过真实前置、建造顺序、资源/supply 约束和可观察解锁结果形成最小战略含义。 |
| 不关闭范围 | 不关闭 `V5-COUNTER1` 或 `V5-UA1`，不回改 `V5-ECO1`。不生成完整科技树、完整战略深度、UI polish、英雄/法术、V6 身份系统任务。 |

## 4.7 2026-04-14 COUNTER1 收口复核

| 项 | 结论 |
| --- | --- |
| live proof 状态 | GLM `Task 103 — COUNTER1 基础克制与兵种组成证明包` 超过软上限且首轮 focused proof 失败；Codex 接管后改为最小稳定 proof。 |
| focused command | `./scripts/run-runtime-tests.sh tests/v5-counter-composition-backbone.spec.ts --reporter=list` |
| focused result | `5/5 passed`；通过项为 unit quality、armor damage reduction、army composition damage difference、tower support composition difference、bounded strategy audit。 |
| proof 边界 | 证明当前 runtime 已有可测的基础兵种质量、护甲、军队组成和静态防御差异；不声称完整兵种克制表、完整 AI counter 选择或完整战斗平衡。 |
| COUNTER1 closeout | `engineering-pass / blocker-cleared`。COUNTER1 工程 blocker 关闭。 |
| 不关闭范围 | 不关闭 `V5-ECO1`、`V5-TECH1` 或 `V5-UA1`。不生成完整兵种体系、平衡 polish、完整战略深度、UI polish 或 V6 身份系统任务。 |

## 4.8 2026-04-14 HUMAN1 H1 范围包

| 项 | 结论 |
| --- | --- |
| source board | `docs/HUMAN_RACE_CAPABILITY_BOARD.zh-CN.md` |
| scope packet | `docs/HUMAN_H1_RIFLEMAN_SCOPE_PACKET.zh-CN.md` |
| H1 route | `Blacksmith -> Rifleman -> Long Rifles -> AI composition` |
| gate state | `engineering-pass / blocker-cleared`。H1 玩家训练、玩家研究、AI composition 三段已有 runtime proof；`V5-HUMAN1` 工程项可以关闭。 |
| GLM slices | `Task 104 — H1 Blacksmith 与 Rifleman 可玩切片`：done；`Task 105 — H1 Long Rifles 研究切片`：done；`Task 106 — H1 AI Rifleman 组成切片`：done。 |
| 已有 proof | Task 104：Blacksmith 建筑、Rifleman 单位、Blacksmith 前置、远程攻击、fallback/proxy 可读性和 `tests/v5-human-rifleman-techline.spec.ts` 2/2。Task 105：Long Rifles 真实 research queue、射程 4.5 -> 6.0、已训练和新训练 Rifleman 都吃效果、不可重复研究、`tests/v5-human-long-rifles-tech.spec.ts` 2/2。 |
| AI proof | Task 106：AI 建 Blacksmith、训练 Rifleman、研究 Long Rifles，形成 mixed composition，不直接 spawn、不绕过资源/人口/前置/研究状态。GLM closeout 为 2/2；Codex 补测前置丢失保护后，`tests/v5-human-ai-rifleman-composition.spec.ts` 为 3/3。 |
| Codex review fix | 移除 AI 对 `blacksmithBuilt` 记忆位的训练依赖，改为按当前完成的 Blacksmith 判断 Rifleman 训练和 Long Rifles 研究；新增测试证明 Blacksmith 被摧毁后 AI 不会继续排 Rifleman。 |
| material boundary | 当前只允许自制 fallback / proxy；禁止官方提取素材、来源不明素材、未批准第三方素材和真实素材导入。 |
| closeout proof | 必须覆盖玩家可训练 Rifleman、玩家可研究 Long Rifles、AI 可使用 Rifleman composition、命令卡真实原因和 cleanup 后无 runtime 残留。 |
| 不关闭范围 | 不关闭 `V5-COUNTER1`、`V5-UA1`，不声明完整人族科技树、英雄、法术、车间、空军、真实素材或 V6 身份系统完成。 |

## 5. 不属于 V5 当前模板的内容

| 内容 | 路由 |
| --- | --- |
| `V4-E1` truthful win / lose / result loop | 已按 V4 工程 blocker 收口，不由 V5 接管；任何残留只能进入 V4-UA1/user-open 或后续非阻断 routing。 |
| 真实素材导入、素材 sourcing、视觉风格审批 | 后续 asset flow；不属于 V5 gate 模板。 |
| 主菜单最终质感、UI polish、release copy | 后续 user/polish/release gate；不属于 V5 blocker。 |
| 英雄、法术、物品、阵营身份表达 | V6 War3 identity alpha。 |
| 长局、完整 tech tree、完整战略深度、完整 ladder/campaign | 后续版本。 |

## 6. V5 closeout 最低要求

| Closeout requirement | 关联 gate | 通过标准 |
| --- | --- | --- |
| 经济与产能能持续滚动 | `V5-ECO1` | 资源、worker、supply、production queue 能形成可复跑链条，不是一轮初始资源消耗。 |
| 建造/科技顺序有战略含义 | `V5-TECH1` | 前置、建造、解锁或强化关系能被 proof 解释，且不是纯装饰。 |
| 基础 counter 与兵种组成有差异 | `V5-COUNTER1` | 至少一个 counter relation 和 army composition choice 能改变生产、编队或战斗结果。 |
| 玩家能看见新人族单位/科技选择 | `V5-HUMAN1` | 已通过：Blacksmith/Rifleman、Long Rifles、AI Rifleman composition 三段 proof 成立；不能把它扩大解释为完整人族。 |
| V4 carryover 不破坏战略 proof | `V5-PACE0` / `V5-SD1` | pacing 和 clarity debt 不阻断 ECO1、TECH1、COUNTER1 的 proof。 |
| 人眼战略骨架判断有记录 | `V5-UA1` | 用户或目标 tester 的判断可以异步补入；自动进入 V6 不再等待同步人工确认，但必须保留反馈路由。 |

## 7. 当前 V5 必须回答的话

```text
V5 关的是“战略骨架 alpha”：经济与产能、科技与建造顺序、基础 counter / army composition，以及玩家可见的人族 roster/tech 选择。
ECO1、窄口径 TECH1、COUNTER1 和 HUMAN1 均有工程通过证据。V5 工程收口条件已经满足；V5-UA1 是异步人眼判断，不阻塞自动进入 V6。
它不是 V4-E1 的结果闭环收尾，也不是 UI polish 或完整 War3 身份系统。
```
