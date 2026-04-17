# V5 Transition Bootstrap Packet

> 用途：记录 `V4_TO_V5` 从 `V4 short-match alpha` 预热到 `V5 strategy backbone alpha` 的交接输入、残留路由、cutover 条件和 seed queue 边界。  
> 本文件最初是 next-version preheat 产物；V5 已在 `docs/VERSION_RUNTIME_STATE.json` 激活，本文件保留为 V4_TO_V5 交接记录。

## 0. 当前状态

```text
transitionId: V4_TO_V5
transitionState: cutover-done
fromVersion: V4
toVersion: V5
currentMilestone: V5 strategy backbone alpha
activatedByTransitionId: V4_TO_V5
```

当前含义：

- V4 工程 blocker 已清零。
- V5 已成为 active milestone。
- `V4-UA1` 是历史 user-open 体验判断，不阻塞工程切换；用户可以异步追加反馈。
- 本 packet 记录 V4_TO_V5 的交接输入和 seed queue 边界，不生成 V4 closeout 任务。

## 1. Handoff Contract

| 字段 | 当前值 |
| --- | --- |
| `northStar` | 让 War3 玩家前 5 分钟愿意认真对待它 |
| `fromVersionOutcome` | V4 short-match alpha |
| `toVersionFocus` | V5 strategy backbone alpha |
| `mustStayInFromVersion` | 任何仍 open 的 V4 blocker |
| `allowedCarryover` | V4 pacing tuning debt；V4 non-critical shell clarity debt |
| `residualRouting` | V4 stall/recovery debt -> V5 economy/production backbone；V4 flow clarity debt -> V5 strategic decision surfaces |
| `netNewBlockers` | 经济与产能主链；科技与建造顺序主链；基础 counter / army composition backbone |

## 2. Preheat 输入快照

| 输入 | 当前状态 | 处理规则 |
| --- | --- | --- |
| `V4-E1` Truthful win / lose / result loop | `engineering-pass / V4 blocker cleared` | 不进入 V5 blocker。不能写成 V5 接管，也不能用 V5 strategic backbone proof 替代 V4 结果闭环。 |
| `V4-UA1` Short-match first-play verdict | `user gate / user-open` | 可以作为 V5 user/open context，但不能阻塞 V5 工程模板，也不能由自动化冒充用户判断。 |
| `V4-P1` pressure path | `engineering-pass` | 可作为 V4 已有短局压力基础输入，但不证明 V5 经济、科技或 counter 骨架。 |
| `V4-R1` recovery/counter path | `engineering-pass` | 可作为 V5 recovery/stall residual 的来源；若影响经济与产能主链，路由到 `V5-ECO1` proof context。 |

## 3. Artifact 状态

| Artifact | 文件 | 当前状态 | 备注 |
| --- | --- | --- | --- |
| `remainingGates` | `docs/V5_STRATEGY_BACKBONE_REMAINING_GATES.zh-CN.md` | `prepared` | 已定义 `V5-ECO1`、`V5-TECH1`、`V5-COUNTER1`。 |
| `evidenceLedger` | `docs/V5_STRATEGY_BACKBONE_EVIDENCE_LEDGER.zh-CN.md` | `prepared` | 已记录 V5 blocker evidence template 与 V4 carryover snapshot。 |
| `bootstrapPacket` | `docs/V5_TRANSITION_BOOTSTRAP_PACKET.zh-CN.md` | `prepared-by-this-packet` | 本文件创建后不再是缺件。 |
| `codexRunway` | `docs/runways/V5_CODEX_TRANSITION_RUNWAY.zh-CN.md` | `prepared` | 已补 Codex seed draft；只承担 gate sync、review、routing 和治理。 |
| `glmRunway` | `docs/runways/V5_GLM_TRANSITION_RUNWAY.zh-CN.md` | `prepared` | 已补 GLM seed draft。 |

本 packet 创建时缺失项为：

```text
bootstrapPacket
codexRunway
glmRunway
```

当前仍缺：

```text
none
```

## 4. V5 接棒输入

### 4.1 V5 blocker seed

| V5 gate | 来源 | 初始 proof 方向 |
| --- | --- | --- |
| `V5-ECO1` Economy and production backbone | V5 net-new blocker + V4 stall/recovery residual routing | 资源流、worker、supply、production queue、补 worker/补兵和 focused regression。 |
| `V5-TECH1` Tech and build-order backbone | V5 net-new blocker | build order timeline、前置条件、解锁或强化效果、失败回退和 focused regression。 |
| `V5-COUNTER1` Basic counter and army composition backbone | V5 net-new blocker | counter relation、army composition choice、production choice、战斗 state log 和 focused regression。 |

### 4.2 Carryover / residual 路由

| V4 输入 | V5 路由 | 限制 |
| --- | --- | --- |
| V4 pacing tuning debt | `V5-PACE0` | 只在破坏 V5 blocker proof 时绑定到具体 gate 失败面；不得生成纯 balance polish 或第四条 blocker。 |
| V4 non-critical shell clarity debt | `V5-SD1` | 只在战略决策面理解度受影响时记录；不得生成 UI polish 或主菜单质量任务。 |
| V4 stall/recovery debt | `V5-ECO1` proof context | 不是 carryover gate。只作为 economy/production backbone 的 proof 输入或失败面。 |
| V4 flow clarity debt | `V5-SD1` | 只作为战略决策 surfaces 的理解度输入；不得回滚 V4 shell 工程通过。 |

## 5. Cutover 前检查项

正式从 V4 切到 V5 前必须同时满足：

1. V4 工程 blocker 快照保持为 `none`。
2. `docs/V5_STRATEGY_BACKBONE_REMAINING_GATES.zh-CN.md` 存在并保持 V5 blocker 口径一致。
3. `docs/V5_STRATEGY_BACKBONE_EVIDENCE_LEDGER.zh-CN.md` 存在并记录 V5 初始 evidence template。
4. `docs/V5_TRANSITION_BOOTSTRAP_PACKET.zh-CN.md` 存在并记录本交接输入。
5. `docs/runways/V5_CODEX_TRANSITION_RUNWAY.zh-CN.md` 存在。
6. `docs/runways/V5_GLM_TRANSITION_RUNWAY.zh-CN.md` 存在。
7. `VERSION_TRANSITIONS.json` 的 `V4_TO_V5` entry 与上述 artifact 路径一致。
8. live queue 仍不能播种 V5 任务，直到 cutover executor 或对应流程明确进入 cutover-ready / cutover-done。

## 6. Seed Queue 原则

这些原则只用于后续 runway 草案，不代表任务已派发。

Codex seed draft 应只承担：

- V5 gate sync。
- evidence closeout review。
- residual routing。
- cutover 后 live queue 对齐。

GLM seed draft 应只承担：

- bounded proof pack。
- focused regression。
- state log / screenshot / event evidence。
- 小范围 repair only when proof 明确失败且 allowed files 限定清楚。

不得生成：

- 当前版本 closeout 返工。
- UI polish、主菜单审美裁决或 release copy。
- 真实素材导入、sourcing 或授权判断。
- V6 英雄、法术、物品、阵营身份系统。
- 完整长局、完整 ladder、campaign 或公开 demo 任务。

## 7. 当前保守结论

```text
V4_TO_V5 已完成 cutover。
V5 已 active。
V4 工程 blocker 快照为 none。
V4-UA1 是 user-open，不阻塞 V5 模板预热，但不能由自动化代判。
V5 已有 gate/ledger、bootstrap、Codex runway 和 GLM runway。
V5 当前首个 GLM live task 是 `Task 101 — ECO1 经济产能主链证明包`。
V5 首批 blocker 只来自 ECO1、TECH1、COUNTER1；完整科技树、完整战略深度和 V6 身份系统不在本次切换范围。
```
