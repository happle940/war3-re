# V6 Transition Bootstrap Packet

> 用途：记录 `V5_TO_V6` 的交接输入、残留路由、切换条件和 seed queue 边界。  
> 本文件是 `V6 War3 identity alpha` 的 preheat 产物；V6 尚未 active，不得用本文件派发 live queue。

## 0. 当前状态

```text
transitionId: V5_TO_V6
transitionState: preheat-due
fromVersion: V5
toVersion: V6
currentMilestone: V5 strategy backbone alpha
nextMilestone: V6 War3 identity alpha
```

当前含义：

- V5 仍是当前 active milestone。
- V6 只处于 transition pack preheat，不是 active milestone。
- `V5-ECO1` 是 `V5 blocker / blocked / partial-proof`，必须留在 V5 收口；V6 不接管经济产能 blocker。
- `V5-UA1` 是 `user gate / user-open`，只能作为后续人眼判断背景，不能由自动化代判。
- 本 bootstrap 不派发 seed queue，不关闭 V5 gate，不声明 V6 已 active。

## 1. Handoff contract

| 字段 | 当前值 |
| --- | --- |
| `northStar` | 让 War3 玩家前 5 分钟愿意认真对待它 |
| `fromVersionOutcome` | V5 strategy backbone alpha |
| `toVersionFocus` | V6 War3 identity alpha |
| `mustStayInFromVersion` | 任何仍 open 的 V5 blocker |
| `allowedCarryover` | V5 balance tuning debt；V5 presentation polish debt |
| `residualRouting` | V5 roster clarity debt -> V6 identity readability；V5 production-decision debt -> V6 hero/faction expression |
| `netNewBlockers` | 英雄/法术/物品等身份系统；阵营或单位身份差异；能让玩家认出这像 War3-like 的核心表达 |

## 2. Preheat 输入快照

| 输入 | 当前状态 | V6 处理规则 |
| --- | --- | --- |
| `V5-ECO1` Economy and production backbone | `V5 blocker / blocked / partial-proof` | 留在 V5。V6 不吸收 lumber income、production queue、supply 或持续经济 closeout。 |
| 任何仍 open 的 V5 blocker | `must-stay-in-from-version` | 留在 V5。cutover 前必须重新检查，不能被写成 V6 identity proof。 |
| `V5-UA1` Strategy backbone first-look verdict | `user gate / user-open` | 作为 V6 人眼判断背景；不能阻塞 V6 preheat 模板，也不能由自动化替代。 |
| `V5 balance tuning debt` | `allowed carryover` | 进入 `V6-BAL0` residual；只有直接破坏身份 proof 时，才绑定具体 V6 blocker 失败面。 |
| `V5 presentation polish debt` | `allowed carryover` | 进入 `V6-PRES0` residual；不得生成 UI polish、真实素材导入或当前 V5 closeout 任务。 |
| V5 roster clarity debt | `residual routing` | 作为 `V6-FA1` / `V6-W3L1` 的身份可读性上下文。 |
| V5 production-decision debt | `residual routing` | 作为 `V6-ID1` / `V6-FA1` 的 hero/faction expression 上下文。 |

## 3. Transition artifact 状态

本任务开始时，`V5_TO_V6` 仍缺：

- `bootstrapPacket`: `docs/V6_TRANSITION_BOOTSTRAP_PACKET.zh-CN.md`
- `codexRunway`: `docs/runways/V6_CODEX_TRANSITION_RUNWAY.zh-CN.md`
- `glmRunway`: `docs/runways/V6_GLM_TRANSITION_RUNWAY.zh-CN.md`

当前 artifact 状态：

| Artifact | 文件 | 状态 |
| --- | --- | --- |
| `remainingGates` | `docs/V6_IDENTITY_SYSTEMS_REMAINING_GATES.zh-CN.md` | prepared |
| `evidenceLedger` | `docs/V6_IDENTITY_SYSTEMS_EVIDENCE_LEDGER.zh-CN.md` | prepared |
| `bootstrapPacket` | `docs/V6_TRANSITION_BOOTSTRAP_PACKET.zh-CN.md` | prepared-by-this-packet |
| `codexRunway` | `docs/runways/V6_CODEX_TRANSITION_RUNWAY.zh-CN.md` | missing |
| `glmRunway` | `docs/runways/V6_GLM_TRANSITION_RUNWAY.zh-CN.md` | missing |

本任务完成后，cutover 仍被两条 runway 缺失阻塞；不得把 bootstrap 完成写成 V6 可激活。

## 4. V6 接棒范围

V6 正式切换后的首批 blocker 只能来自 `War3 identity alpha`：

| Gate | V6 初始角色 | 接棒证明方向 |
| --- | --- | --- |
| `V6-ID1` Hero / spell / item identity systems | `V6 blocker / preheat-open` | 至少一个英雄、法术、物品或等价身份系统有可见状态、触发方式、效果反馈、限制条件和 focused regression。 |
| `V6-FA1` Faction or unit identity difference | `V6 blocker / preheat-open` | 至少一组阵营、单位或兵种身份差异影响读图、能力、生产/使用选择或战斗角色。 |
| `V6-W3L1` War3-like identity first-look | `V6 blocker / preheat-open` | 身份系统、阵营/单位差异和整体第一眼形成同一份 review packet，让用户或目标 tester 判断是否更像 War3-like。 |

不得加入的 V6 blocker：

- `V5-ECO1` 或任何仍 open 的 V5 blocker。
- 完整英雄池、完整物品系统、完整法术书。
- UI polish、主菜单审美、presentation polish 本身。
- 真实素材 sourcing、授权判断或导入。
- V7 以后才需要的身份扩展、长局、ladder、campaign 或公开 demo。

## 5. Seed queue 原则

V6 seed queue 只能在 transition 进入 cutover-ready 后播种。

Codex runway 只应承担：

- V6 gate sync。
- V6 evidence closeout review。
- V5 carryover / residual routing。
- V6 与 transition artifact 的一致性复核。

GLM runway 只应承担：

- `V6-ID1`、`V6-FA1`、`V6-W3L1` 的 bounded proof pack。
- focused regression、state log、截图或 review packet 的最小证据生产。
- 在明确 bounded scope 内修复 proof 失败面。

禁止 seed：

- 当前 V5-ECO1 closeout 或经济产能修复。
- UI polish、presentation-only 任务或菜单质量裁决。
- 真实素材导入、sourcing 或授权审批。
- 完整 War3 内容量、完整科技树、完整战略深度或 V7 身份系统。

## 6. Cutover 前检查项

正式切换前必须逐项确认：

| 检查项 | 通过口径 |
| --- | --- |
| V5 blocker 状态 | `V5-ECO1` 和任何仍 open 的 V5 blocker 已在 V5 关闭或明确不得切换。 |
| V5 user-open 状态 | `V5-UA1` 保留为人眼判断背景，不由自动化代判。 |
| V6 remaining gates | `docs/V6_IDENTITY_SYSTEMS_REMAINING_GATES.zh-CN.md` 存在，且 V6 blocker 仅为 `V6-ID1`、`V6-FA1`、`V6-W3L1`。 |
| V6 evidence ledger | `docs/V6_IDENTITY_SYSTEMS_EVIDENCE_LEDGER.zh-CN.md` 存在，且不把 V5 blocker 写成 V6 proof。 |
| V6 bootstrap packet | 本文件存在，并记录 preheat-due、缺件和禁止提前激活边界。 |
| V6 Codex runway | `docs/runways/V6_CODEX_TRANSITION_RUNWAY.zh-CN.md` 存在，且只定义 review / routing / governance 任务。 |
| V6 GLM runway | `docs/runways/V6_GLM_TRANSITION_RUNWAY.zh-CN.md` 存在，且只定义 bounded proof packs。 |
| Live queue | 未在 cutover-ready 前播种 V6 live queue。 |

## 7. 当前保守结论

```text
V5_TO_V6 处于 preheat-due。
V6 尚未 active，seed queue 尚未派发。
V5-ECO1 仍是 V5 blocker / blocked / partial-proof，必须留在 V5。
V5-UA1 是 user-open，只能作为 V6 人眼判断背景。
V6 gate 与 evidence ledger 已有预热模板；本 bootstrap 补齐 bootstrapPacket。
cutover 仍缺 codexRunway 与 glmRunway。
V6 首批 blocker 只来自 War3 identity alpha：V6-ID1、V6-FA1、V6-W3L1。
```
