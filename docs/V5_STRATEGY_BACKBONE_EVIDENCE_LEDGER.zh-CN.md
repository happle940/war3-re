# V5 Strategy Backbone Evidence Ledger

> 用途：记录 `V5 strategy backbone alpha` 的工程证据、用户判断证据和当前状态。  
> 上游 gate 清单：`docs/V5_STRATEGY_BACKBONE_REMAINING_GATES.zh-CN.md`。  
> 本文件最初由 `V4_TO_V5` preheat 生成；V5 已在 `docs/VERSION_RUNTIME_STATE.json` 激活，现在它记录 V5 当前证据状态。

## 0. 使用规则

| 状态 | 含义 |
| --- | --- |
| `open` | V5 active 后仍未有足够 runtime proof 关闭。 |
| `partial-runtime-proof` | 已有一部分真实运行证据，但还缺最后一段 proof 或 Codex 复核。 |
| `engineering-pass` | 工程证据已满足，但用户判断可能仍未完成。 |
| `blocked` | focused proof 明确失败。 |
| `insufficient-evidence` | 有部分证据，但不足以关闭 gate。 |
| `carryover` | 从 V4 带入 V5 的非阻断债务。 |
| `residual` | 不阻塞 V5 工程 closeout，但必须记录路由。 |
| `user-open` | 需要用户或目标 tester 判断。 |

更新规则：

- `engineering-pass` 不能冒充 `user-accepted`。
- V4 已关闭的结果闭环不能被重新包装成 V5 blocker；若后续回归，记录为 V4 regression debt。
- 每次 V5 active 后的更新必须绑定 focused command、state log、截图包、review packet 或明确的人眼结论。
- V4 carryover 只能进入 `V5-PACE0` 或 `V5-SD1`。Residual 只能作为 `V5-ECO1`、`V5-TECH1` 或 `V5-COUNTER1` 的具体失败面记录，不能抢占 V5 blocker 定义。
- 2026-04-14 用户试玩反馈已经证明：窄口径 TECH1 build-order proof 不能替代玩家可见的人族兵种/科技线；新增 `V5-HUMAN1` 作为 V5 工程项，直到至少一条新人族 roster/tech 线真实可玩。
- `V5-HUMAN1` 当前已有 Task 104 / Task 105 / Task 106 的真实运行证据；Codex 复核补了 Blacksmith 丢失后不排 Rifleman 的前置保护测试。

## 1. V5 blocker evidence ledger

| Gate | 当前状态 | 必需工程证据 | 必需用户判断证据 | 当前结论 |
| --- | --- | --- | --- | --- |
| `V5-ECO1` Economy and production backbone | `engineering-pass / blocker-cleared` | 资源流 state log、worker/gather proof、supply 约束、production queue proof、补 worker/补兵路径、focused regression。 | 用户或目标 tester 判断经济与产能是否像可理解的战略主链。 | 2026-04-14 新证据复核：`./scripts/run-runtime-tests.sh tests/v5-economy-production-backbone.spec.ts --reporter=list` 为 `6/6 passed`。gold income、lumber income、supply chain、full production cycle、damage recovery 和 comprehensive audit 均通过；ECO1 工程 blocker 关闭，但不代表 V5-UA1 人眼战略骨架 verdict 已完成。 |
| `V5-TECH1` Tech and build-order backbone | `engineering-pass / blocker-cleared` | build order timeline、前置条件 proof、解锁或升级效果、失败回退、focused regression。 | 用户或目标 tester 判断建造/科技顺序是否产生可理解选择。 | 2026-04-14 新证据复核：`./scripts/run-runtime-tests.sh tests/v5-tech-build-order-backbone.spec.ts --reporter=list` 为 `6/6 passed`。TH -> gather -> Farm -> Barracks -> Footman timeline、resource/building/supply prerequisites、observable progression 和 behavioral audit 均通过；TECH1 工程 blocker 关闭，但不代表 V5-UA1 人眼战略骨架 verdict 已完成。 |
| `V5-COUNTER1` Basic counter and army composition backbone | `engineering-pass / blocker-cleared` | counter relation proof、army composition choice、production choice state log、战斗结果差异、focused regression。 | 用户或目标 tester 判断 counter 和兵种组成是否能被看懂。 | 2026-04-14 Codex 接管 GLM 卡住的 Task 103 后收窄 proof：`./scripts/run-runtime-tests.sh tests/v5-counter-composition-backbone.spec.ts --reporter=list` 为 `5/5 passed`。当前证据覆盖 footman/worker 属性差异、护甲真实减伤、军队组合输出差异、tower support composition 差异和 bounded strategy audit；COUNTER1 工程 blocker 关闭，但不代表完整兵种克制表、完整 AI counter 选择或完整战斗平衡。 |
| `V5-HUMAN1` Visible Human roster and tech line | `engineering-pass / blocker-cleared` | 至少一条新人族单位/科技线通过真实前置、训练、研究、命令卡和 AI 使用闭环形成玩家可见选择。 | 用户或目标 tester 判断“现在终于不只是农民/步兵”且科技选择能被看见。 | Task 104 已完成 Blacksmith/Rifleman 玩家链路，Task 105 已完成 Long Rifles 研究链路，Task 106 已完成 AI Rifleman composition。Codex 复核补测前置丢失保护后，HUMAN1 工程项关闭；不代表完整人族。 |

## 2. V4 blocker / carryover snapshot

| 输入 | 当前状态 | V5 路由 | 当前结论 |
| --- | --- | --- | --- |
| `V4-E1` Truthful win / lose / result loop | `engineering-pass / V4 blocker cleared` | 不进入 V5 blocker | 已按 V4 工程 blocker 收口；不得用 V5 strategy backbone proof 替代 V4 结果闭环，也不得把 V4 结果页残留写成 V5 blocker。 |
| `V4 pacing tuning debt` | `carryover candidate` | `V5-PACE0` | 只作为 pacing residual。若破坏 ECO1、TECH1 或 COUNTER1 proof，只能绑定到具体 blocker 的失败面，不生成独立工程 blocker。 |
| `V4 non-critical shell clarity debt` | `carryover candidate` | `V5-SD1` | 只作为 strategic decision surface 的理解度输入。不得生成 UI polish、主菜单质量或当前 V4 closeout 任务。 |
| V4 stall/recovery debt | `residual candidate` | `V5-ECO1` proof context | 不是 carryover gate。只有影响 economy/production backbone 时才进入 ECO1 的具体证据缺口。 |
| V4 flow clarity debt | `residual candidate` | `V5-SD1` | 只用于战略决策面理解度，不回滚 V4 shell 工程通过。 |

## 3. Conditional / user evidence ledger

| Gate | 当前状态 | 必需工程证据 | 必需用户判断证据 | 当前结论 |
| --- | --- | --- | --- | --- |
| `V5-PACE0` Short-match pacing carryover | `carryover / active` | ECO1、TECH1、COUNTER1 proof 中 pacing 不破坏战略链条；如失败，绑定具体 state log。 | 用户或目标 tester 判断节奏是否还能支撑战略选择。 | 只作为 V5 blocker proof 的支撑面，不单独生成平衡 polish 任务。 |
| `V5-SD1` Strategic decision surfaces | `residual / active` | 经济、建造、科技、counter 的可见状态与真实系统一致；不出现假模式、假科技或假统计。 | 用户判断战略决策面是否可理解。 | 只处理 V5 战略决策理解度；不裁决主菜单审美或 V4 results surface。 |
| `V5-UA1` Strategy backbone first-look verdict | `user gate / user-open / async` | V5-ECO1、V5-TECH1、V5-COUNTER1、V5-HUMAN1 的工程证据包。 | 用户或目标 tester 给出 `pass`、`pass-with-debt`、`reject` 或 `defer`。 | 2026-04-14 当前人眼反馈为“现有版本没有其他兵种和科技”，已转成 V5-HUMAN1 工程项。后续人眼判断可异步补入，不要求同步阻塞 V5 -> V6 自动切换。 |

## 3.5 2026-04-14 ECO1 closeout entry

| 字段 | 记录 |
| --- | --- |
| Gate | `V5-ECO1` |
| State before | `blocked / partial-proof` |
| Focused command | `./scripts/run-runtime-tests.sh tests/v5-economy-production-backbone.spec.ts --reporter=list` |
| Focused result | `6/6 passed`；通过项是 gold income、lumber income、supply chain、full production cycle、damage recovery、comprehensive economy backbone audit。 |
| Passing evidence | gold income 证明 worker gather 后 gold 增长；lumber income 通过真实 `gather` command、tree target、45s runtime advance 和 `lumberAfter > lumberBefore` 断言；supply chain 证明 Farm 提升 supply total 且训练消耗 supply；production cycle 和 recovery 证明连续生产不是一次性开局资源。 |
| State log | Production cycle logged `gold0=500`、`goldAfterEarn=560`、`goldAfterSpendAndEarn=660`、`goldFinal=760`、`totalWorkers=7`、`gatheringWorkers=5`、cycle=`earn -> spend -> earn -> spend -> earn`。Damage recovery logged `goldBeforeDamage=560`、`workersAfterDamage=2`、`goldAfterDamage=560`、`workersRecovered=5`、`goldRecovered=790`、`gatheringRecovered=5`。Comprehensive audit logged `goldBefore=500`、`goldAfterGather=580`、`workerCount=6`、`supply=6/10`、`footmen=1`、`gathering=5`。 |
| Failing evidence | 无 ECO1 工程失败面保留。旧 C89 lumber failure `200 -> 200` 已由 6/6 focused proof 覆盖。 |
| State after | `engineering-pass / blocker-cleared` |
| Residual debt | V5-UA1 仍需要用户或目标 tester 判断经济/科技/counter 骨架是否像真实战略选择；这不是 ECO1 工程 blocker。 |
| Next owner | GLM 继续当前 `Task 102 — TECH1 科技建造顺序证明包`；Codex 后续复核 TECH1。 |
| Scope guard | 不关闭 `V5-TECH1`、`V5-COUNTER1` 或 `V5-UA1`；不把一次性生产、静态资源、完整科技树或完整战略深度写成 ECO1 通过。 |

## 3.6 2026-04-14 TECH1 closeout entry

| 字段 | 记录 |
| --- | --- |
| Gate | `V5-TECH1` |
| State before | `blocked-by-pending-proof` |
| Focused command | `./scripts/run-runtime-tests.sh tests/v5-tech-build-order-backbone.spec.ts --reporter=list` |
| Focused result | `6/6 passed`；通过项是 build order timeline、resource prerequisite、building prerequisite、supply prerequisite、observable progression、comprehensive build order audit。 |
| Build order evidence | Timeline logged `START -> AFTER_GATHER -> AFTER_FARM -> AFTER_BARRACKS -> AFTER_TRAIN`，从 `workers=5`、`resources=500g/200l`、`supply=5/10` 到 gather 后 `gold=550`、farm 后 `supply=5/16`、barracks completed、footman trained、final `supply=7/16`。 |
| Prerequisite evidence | Resource prerequisite logged `0g/0l` with farm/barracks/tower buttons disabled for `黄金不足 / 木材不足`。Building prerequisite logged `barracksAlive=0`、`footmenBefore=0`、`footmenAfter=0`、`thTrainedWorkers=1`。Supply prerequisite logged `supplyAtCap=10/10`、`footmanButtonDisabled=true`、reason=`人口不足`。 |
| Unlock evidence | Observable progression logged `canTrainWorker=true` and `canTrainFootman=false` at start；gather earned gold `500 -> 550`；farm unlocked supply `10 -> 16`；barracks changed `footmanCapableBefore=false` to `footmanCapableAfter=true`；training changed footmen `0 -> 1`。Closeout audit logged `Farm:true BK:true Footmen:2`、`supplyAfter=10/22`、`goldRemaining=920`。 |
| State after | `engineering-pass / blocker-cleared` |
| Residual debt | V5-UA1 仍需要用户或目标 tester 判断经济/科技/counter 骨架是否像真实战略选择；这不是 TECH1 工程 blocker。 |
| Next owner | GLM 继续当前 `Task 103 — COUNTER1 基础克制与兵种组成证明包`；Codex 后续复核 COUNTER1。 |
| Scope guard | 不关闭 `V5-COUNTER1` 或 `V5-UA1`，不回改 `V5-ECO1`；不把摆出建筑、展示按钮、完整科技树、英雄/法术、V6 身份系统或 UI polish 写成 TECH1 通过。 |

## 3.6.1 2026-04-14 Human visible roster / tech correction

| 字段 | 记录 |
| --- | --- |
| Gate | `V5-HUMAN1` |
| Trigger | 用户试玩反馈：当前可玩版本没有其他兵种和真实科技。 |
| Finding | 窄口径 `V5-TECH1` 只证明 TH -> gather -> Farm -> Barracks -> Footman 的建造/资源/人口顺序；它不能让玩家看见新人族单位、科技研究、兵种分化或 AI 组成变化。 |
| State before | 未建 gate，隐含在 TECH1/COUNTER1。 |
| State after | `open` |
| Required proof | 至少一条新人族单位/科技线真实进入玩家路径：推荐 `Blacksmith -> Rifleman -> Long Rifles -> AI composition`。必须包含命令卡、前置禁用原因、真实训练、研究完成后的数值/行为变化和 AI 使用。 |
| Source board | `docs/HUMAN_RACE_CAPABILITY_BOARD.zh-CN.md` |
| Scope guard | 不要求完整人族科技树、英雄、法术、车间、空军或真实素材导入；但也不能再把只有 worker/footman 的 build-order proof 写成 V5 玩家可见科技通过。 |

## 3.6.2 2026-04-14 H1 Rifleman scope packet

| 字段 | 记录 |
| --- | --- |
| Gate | `V5-HUMAN1` |
| State before | `open` |
| Scope packet | `docs/HUMAN_H1_RIFLEMAN_SCOPE_PACKET.zh-CN.md` |
| Source board | `docs/HUMAN_RACE_CAPABILITY_BOARD.zh-CN.md` |
| Scope decision | H1 只做 `Blacksmith -> Rifleman -> Long Rifles -> AI composition`，不做完整人族科技树、英雄、法术、车间、空军或真实素材导入。 |
| GLM follow-up | `Task 104 — H1 Blacksmith 与 Rifleman 可玩切片`；`Task 105 — H1 Long Rifles 研究切片`；`Task 106 — H1 AI Rifleman 组成切片`。每个切片都有 allowed files、runtime proof、cleanup command 和 forbidden scope。 |
| Material rule | 当前只允许自制 fallback / proxy；禁止官方提取素材、来源不明素材、未批准第三方素材和真实素材导入。GLM 不做 sourcing、授权判断或风格审批。 |
| State after | `open / scope-ready / implementation-started` |
| Missing proof | 原始缺口是玩家可训练 Rifleman、Long Rifles 真实研究、AI 使用 Rifleman composition 的 runtime focused proof；截至 2026-04-14，前两项已有 Task 104/105 证据，剩余缺口是 Task 106 AI composition。 |
| Scope guard | 不关闭 `V5-COUNTER1` 或 `V5-UA1`；H1 不能替代 counter relation / army composition proof。 |

## 3.6.3 2026-04-14 H1 implementation progress

| 字段 | 记录 |
| --- | --- |
| Gate | `V5-HUMAN1` |
| State before | `open / scope-ready / implementation-started` |
| Completed slice | `Task 104 — H1 Blacksmith 与 Rifleman 可玩切片`：Blacksmith building、Rifleman unit、tech prerequisite gate、ranged attack、fallback/proxy visuals，`tests/v5-human-rifleman-techline.spec.ts` 2/2 passed。 |
| Completed slice | `Task 105 — H1 Long Rifles 研究切片`：Long Rifles 通过真实 research queue 完成，Rifleman range 4.5 -> 6.0，已存在和新训练 Rifleman 都获得效果，不可重复研究，command card state 真实，`tests/v5-human-long-rifles-tech.spec.ts` 2/2 passed。 |
| Running slice | `Task 106 — H1 AI Rifleman 组成切片`：GLM 正在实现 SimpleAI 侧 Blacksmith/Rifleman/Long Rifles 使用；尚无最终 closeout。 |
| State after | `engineering-pass / blocker-cleared` |
| Passing proof | AI focused pack 证明 AI 建 Blacksmith、训练 Rifleman、研究 Long Rifles，形成 mixed composition，不直接 spawn，不绕过资源/人口/前置/研究状态。Codex 补测 Blacksmith 丢失后不再排 Rifleman。 |
| Focused commands | `./scripts/run-runtime-tests.sh tests/v5-human-ai-rifleman-composition.spec.ts --reporter=list` -> 3/3；`./scripts/run-runtime-tests.sh tests/v5-human-rifleman-techline.spec.ts tests/v5-human-long-rifles-tech.spec.ts --reporter=list` -> 4/4。 |
| Next owner | 自动切换逻辑可进入 V6；V6 第一批任务必须从 `docs/V6_NUMERIC_SYSTEM_TASK_SEED.zh-CN.md` 的 `NUM-A` 开始。 |
| Scope guard | Task 104/105 的通过不等于完整人族；Task 106 的通过也只关闭第一条新人族单位/科技线，不关闭 V6 数值系统、英雄、法术、物品、车间、空军或真实素材。 |

## 3.7 2026-04-14 COUNTER1 closeout entry

| 字段 | 记录 |
| --- | --- |
| Gate | `V5-COUNTER1` |
| State before | `open` |
| Expected proof owner | GLM `Task 103 — COUNTER1 基础克制与兵种组成证明包` |
| Expected focused command | `./scripts/run-runtime-tests.sh tests/v5-counter-composition-backbone.spec.ts --reporter=list` |
| Evidence found | GLM 超过软上限且首轮 proof 失败；Codex 接管后新增稳定 focused proof。 |
| Focused result | `./scripts/run-runtime-tests.sh tests/v5-counter-composition-backbone.spec.ts --reporter=list` -> `5/5 passed`。 |
| Passing evidence | runtime unit quality 证明 Footman 相比 Worker 有更高 hp、damage、armor；GameData 证明 Footman 占用更高 supply 且不能采集、Worker 可采集；armor proof 证明 Worker 对 Footman 的真实伤害低于对无甲 Worker 的伤害；composition proof 证明 Footman 组合对 Worker 的输出高于 Worker 组合；tower support proof 证明加入 Tower 后对敌方 Footman 的可测伤害高于无塔基线；audit 记录 `footman_vs_worker` 和 `tower_support` 两个 composition log。 |
| State after | `engineering-pass / blocker-cleared` |
| Residual debt | 完整兵种克制表、AI counter production choice、平衡手感和玩家是否能看懂 counter 仍属于后续版本或 V5-UA1，不阻塞当前 COUNTER1 工程 closeout。 |
| Next owner | GLM 可转入 `Task 104 — H1 Blacksmith 与 Rifleman 可玩切片`，Codex 后续 review Task 104。 |
| Scope guard | 不关闭 `V5-HUMAN1` 或 `V5-UA1`；不把 bounded proof 写成完整战斗系统、完整人族科技树、完整 AI counter 策略或平衡 polish。 |

## 4. Handoff contract snapshot

| 字段 | 当前值 |
| --- | --- |
| `fromVersionOutcome` | V4 short-match alpha |
| `toVersionFocus` | V5 strategy backbone alpha |
| `mustStayInFromVersion` | 任何仍 open 的 V4 blocker |
| `allowedCarryover` | V4 pacing tuning debt；V4 non-critical shell clarity debt |
| `residualRouting` | V4 stall/recovery debt -> V5 economy/production backbone；V4 flow clarity debt -> V5 strategic decision surfaces |
| `netNewBlockers` | 经济与产能主链；科技与建造顺序主链；基础 counter / army composition backbone |

## 5. 当前保守结论

```text
V5 已 active。
V5-ECO1、窄口径 V5-TECH1、V5-COUNTER1、V5-HUMAN1 均为 engineering-pass / blocker-cleared。
V5-HUMAN1 已完成 Task 104 Blacksmith/Rifleman、Task 105 Long Rifles、Task 106 AI Rifleman composition 三段运行证据，Codex 复核补测前置丢失保护。
V5-UA1 仍是 user-open / async：用户可随时补判断，但不再作为自动进入 V6 的同步确认条件。
V5 blocker 来自 strategy backbone alpha：经济与产能主链、科技与建造顺序主链、基础 counter / army composition backbone，以及 2026-04-14 用户试玩补入的玩家可见人族 roster/tech 线。
V4 pacing tuning debt 和 non-critical shell clarity debt 只能作为 carryover / residual，不生成当前版本 closeout 或 UI polish 工作。
V4 stall/recovery debt 只能作为 ECO1 proof context，不能新增第四条 V5 blocker。
```

## 6. 更新模板

```text
Gate:
State before:
Engineering evidence:
User evidence:
State after:
Residual debt:
Next owner:
```
