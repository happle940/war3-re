# V5 Codex Transition Runway

> 用途：定义 `V5 strategy backbone alpha` 正式 cutover 后 Codex lane 的首批 seed draft。  
> 本文件是 `V4_TO_V5` preheat 产物；V5 尚未 active，不得直接派发 live queue。

## 0. 当前口径

```text
transitionId: V4_TO_V5
currentMilestone: V4 short-match alpha
nextMilestone: V5 strategy backbone alpha
runwayState: seed-draft / not-dispatched
```

含义：

- V4 工程 blocker 已清零，但 V5 仍未 active。
- 本 runway 只在 cutover-ready / cutover-done 后作为 live queue 播种来源。
- Codex 在 V5 首批任务里只承担 gate sync、证据收口、残留路由和治理。
- Codex 不在本 runway 里做 gameplay implementation、UI polish、真实素材导入或当前 V4 closeout。

## 1. Handoff Contract 摘要

| 字段 | 当前值 |
| --- | --- |
| `fromVersionOutcome` | V4 short-match alpha |
| `toVersionFocus` | V5 strategy backbone alpha |
| `mustStayInFromVersion` | 任何仍 open 的 V4 blocker |
| `allowedCarryover` | V4 pacing tuning debt；V4 non-critical shell clarity debt |
| `residualRouting` | V4 stall/recovery debt -> V5 economy/production backbone；V4 flow clarity debt -> V5 strategic decision surfaces |
| `netNewBlockers` | 经济与产能主链；科技与建造顺序主链；基础 counter / army composition backbone |

## 2. Codex 首批任务原则

Codex 首批任务必须围绕 V5 blocker 的验收和证据收口：

- `V5-ECO1` Economy and production backbone。
- `V5-TECH1` Tech and build-order backbone。
- `V5-COUNTER1` Basic counter and army composition backbone。

Codex 可以做：

- gate / ledger / bootstrap 口径同步。
- GLM proof pack 的 closeout review。
- focused command 结果、state log、截图或事件证据的保守判定。
- V4 carryover / residual 是否影响 V5 blocker proof 的路由。
- live queue 播种前的边界检查。

Codex 不做：

- gameplay implementation。
- broad balance tuning。
- UI polish、主菜单质量裁决、release copy。
- 真实素材导入、sourcing、授权判断。
- V4-E1 或任何当前 V4 closeout 工作。
- V6 英雄、法术、物品、阵营身份系统。

## 3. Seed Draft

### Task C88: V5 Strategy Backbone Gate Sync

Status: `seed-draft`.

Milestone: `V5 strategy backbone alpha`.

Gate: `V5-ECO1` / `V5-TECH1` / `V5-COUNTER1`.

**Goal:** 把 V5 remaining gates、evidence ledger、bootstrap packet 和双车道 runway 对齐，确认 V5 首批 blocker 只来自战略骨架三条主链。

Goal:

把 V5 remaining gates、evidence ledger、bootstrap packet 和双车道 runway 对齐，确认 V5 首批 blocker 只来自战略骨架三条主链。

Why now:

正式 cutover 后，V5 需要一个统一 gate 口径，避免 GLM proof pack 被派成泛化玩法实现、UI polish 或下一阶段身份系统。

Allowed files:

- `docs/V5_STRATEGY_BACKBONE_REMAINING_GATES.zh-CN.md`
- `docs/V5_STRATEGY_BACKBONE_EVIDENCE_LEDGER.zh-CN.md`
- `docs/V5_TRANSITION_BOOTSTRAP_PACKET.zh-CN.md`
- `docs/CODEX_ACTIVE_QUEUE.md` only for cutover seed sync

**Files:**

- `docs/V5_STRATEGY_BACKBONE_REMAINING_GATES.zh-CN.md`
- `docs/V5_STRATEGY_BACKBONE_EVIDENCE_LEDGER.zh-CN.md`
- `docs/V5_TRANSITION_BOOTSTRAP_PACKET.zh-CN.md`

Must satisfy:

- `V5-ECO1`、`V5-TECH1`、`V5-COUNTER1` 三条 blocker 口径一致。
- V4 carryover 只进入 `V5-PACE0` 或 `V5-SD1`，不得抢 V5 blocker。
- 不声明完整科技树、完整战略深度或 V6 身份系统。

**Must satisfy:**

- `V5-ECO1`、`V5-TECH1`、`V5-COUNTER1` 三条 blocker 口径一致。
- V4 carryover 只进入 `V5-PACE0` 或 `V5-SD1`，不得抢 V5 blocker。
- 不声明完整科技树、完整战略深度或 V6 身份系统。

Stop condition:

V5 gate、ledger、bootstrap 和 live queue seed 口径一致；若发现 V4 blocker 重新 open，停止 V5 seed 并路由回 V4。

### Task C89: ECO1 经济产能证据收口复核

Status: `seed-draft`.

Milestone: `V5 strategy backbone alpha`.

Gate: `V5-ECO1`.

Requires completed GLM proof:

`ECO1 经济产能主链证明包`.

**Goal:** 复核经济与产能 proof 是否证明资源流、worker、supply、production queue 和补 worker/补兵形成可持续主链。

Goal:

复核经济与产能 proof 是否证明资源流、worker、supply、production queue 和补 worker/补兵形成可持续主链。

Why now:

ECO1 是 V5 strategy backbone 的第一条工程 blocker；Codex 必须防止把一次性初始资源或静态单位写成经济主链通过。

Allowed files:

- `docs/V5_STRATEGY_BACKBONE_REMAINING_GATES.zh-CN.md`
- `docs/V5_STRATEGY_BACKBONE_EVIDENCE_LEDGER.zh-CN.md`
- `docs/CODEX_ACTIVE_QUEUE.md` only for closeout sync

**Files:**

- `docs/V5_STRATEGY_BACKBONE_REMAINING_GATES.zh-CN.md`
- `docs/V5_STRATEGY_BACKBONE_EVIDENCE_LEDGER.zh-CN.md`

Must satisfy:

- 必须引用实际 focused command、state log 和 production/economy proof。
- 必须区分持续经济/产能链与一次性生产。
- 不关闭 TECH1、COUNTER1 或 V5-UA1。

**Must satisfy:**

- 必须引用实际 focused command、state log 和 production/economy proof。
- 必须区分持续经济/产能链与一次性生产。
- 不关闭 TECH1、COUNTER1 或 V5-UA1。

Stop condition:

ledger 和 remaining gates 写清 `V5-ECO1` pass / blocked / insufficient-evidence，并点名最小 failing surface。

### Task C90: TECH1 科技建造顺序证据收口复核

Status: `seed-draft`.

Milestone: `V5 strategy backbone alpha`.

Gate: `V5-TECH1`.

Requires completed GLM proof:

`TECH1 科技建造顺序证明包`.

**Goal:** 复核科技与建造顺序 proof 是否证明前置条件、build order、解锁或强化效果具有最小战略含义。

Goal:

复核科技与建造顺序 proof 是否证明前置条件、build order、解锁或强化效果具有最小战略含义。

Why now:

V5 不能只让建筑存在；玩家必须能看出建造/科技顺序为什么影响后续选择。

Allowed files:

- `docs/V5_STRATEGY_BACKBONE_REMAINING_GATES.zh-CN.md`
- `docs/V5_STRATEGY_BACKBONE_EVIDENCE_LEDGER.zh-CN.md`
- `docs/CODEX_ACTIVE_QUEUE.md` only for closeout sync

**Files:**

- `docs/V5_STRATEGY_BACKBONE_REMAINING_GATES.zh-CN.md`
- `docs/V5_STRATEGY_BACKBONE_EVIDENCE_LEDGER.zh-CN.md`

Must satisfy:

- 必须引用 build order timeline、前置条件 proof、解锁或强化效果。
- 不能把摆出建筑或展示按钮写成 tech/build-order pass。
- 不关闭 ECO1、COUNTER1 或 V5-UA1。

**Must satisfy:**

- 必须引用 build order timeline、前置条件 proof、解锁或强化效果。
- 不能把摆出建筑或展示按钮写成 tech/build-order pass。
- 不关闭 ECO1、COUNTER1 或 V5-UA1。

Stop condition:

ledger 和 remaining gates 写清 `V5-TECH1` pass / blocked / insufficient-evidence，并点名最小 failing surface。

### Task C91: COUNTER1 兵种组成证据收口复核

Status: `seed-draft`.

Milestone: `V5 strategy backbone alpha`.

Gate: `V5-COUNTER1`.

Requires completed GLM proof:

`COUNTER1 基础克制与兵种组成证明包`.

**Goal:** 复核 counter 与 army composition proof 是否证明至少一个基础克制关系会影响生产、编队或战斗结果。

Goal:

复核 counter 与 army composition proof 是否证明至少一个基础克制关系会影响生产、编队或战斗结果。

Why now:

V5 的战略骨架必须有基础 counter 和组成选择；Codex 需要防止把单一单位互殴或纯数值胜负写成 army composition backbone。

Allowed files:

- `docs/V5_STRATEGY_BACKBONE_REMAINING_GATES.zh-CN.md`
- `docs/V5_STRATEGY_BACKBONE_EVIDENCE_LEDGER.zh-CN.md`
- `docs/CODEX_ACTIVE_QUEUE.md` only for closeout sync

**Files:**

- `docs/V5_STRATEGY_BACKBONE_REMAINING_GATES.zh-CN.md`
- `docs/V5_STRATEGY_BACKBONE_EVIDENCE_LEDGER.zh-CN.md`

Must satisfy:

- 必须引用 counter relation proof、composition choice、production choice 或 combat state log。
- 不能把单场战斗胜负写成 counter backbone pass。
- 不关闭 ECO1、TECH1 或 V5-UA1。

**Must satisfy:**

- 必须引用 counter relation proof、composition choice、production choice 或 combat state log。
- 不能把单场战斗胜负写成 counter backbone pass。
- 不关闭 ECO1、TECH1 或 V5-UA1。

Stop condition:

ledger 和 remaining gates 写清 `V5-COUNTER1` pass / blocked / insufficient-evidence，并点名最小 failing surface。

## 4. 播种前检查

在把本 runway 写入 live queue 前，必须确认：

1. V5 已通过 cutover executor 或等价流程进入 active。
2. `docs/V5_STRATEGY_BACKBONE_REMAINING_GATES.zh-CN.md` 存在。
3. `docs/V5_STRATEGY_BACKBONE_EVIDENCE_LEDGER.zh-CN.md` 存在。
4. `docs/V5_TRANSITION_BOOTSTRAP_PACKET.zh-CN.md` 存在。
5. `docs/runways/V5_GLM_TRANSITION_RUNWAY.zh-CN.md` 存在。
6. 当前 live queue 没有仍 open 的 V4 engineering blocker。
7. 用户或系统没有要求停留在 V4 做追加 closeout。

## 5. 当前保守结论

```text
本文件只是 V5 Codex runway 预热草案。
它不能激活 V5，也不能派发 live queue。
Codex 首批 V5 工作只负责 gate sync、evidence closeout、residual routing 和治理。
GLM proof pack 完成前，Codex closeout review 不可派发。
```
