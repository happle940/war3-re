# V6 Codex Transition Runway

> 用途：定义 `V6 War3 identity alpha` 正式 cutover 后 Codex lane 的首批 seed draft。  
> 本文件是 `V5_TO_V6` preheat 产物；V6 尚未 active，不得直接派发 live queue。

## 0. 当前口径

```text
transitionId: V5_TO_V6
currentMilestone: V5 strategy backbone alpha
nextMilestone: V6 War3 identity alpha
runwayState: seed-draft / not-dispatched
```

含义：

- V5 仍是当前 active milestone，V6 只是预热草案。
- `V5-COUNTER1` 仍是 `V5 blocker / blocked-by-pending-proof`，必须留在 V5 收口，不能带进 V6 启动。
- 本 runway 只在 cutover-ready / cutover-done 后作为 live queue 播种来源。
- Codex 在 V6 首批任务里只承担 gate sync、证据收口、残留路由、user verdict 路由和治理。
- Codex 不在本 runway 里做 gameplay implementation、UI polish、真实素材导入、当前 V5 closeout、完整内容扩张或 V7 任务。

## 1. Handoff Contract 摘要

| 字段 | 当前值 |
| --- | --- |
| `fromVersionOutcome` | V5 strategy backbone alpha |
| `toVersionFocus` | V6 War3 identity alpha |
| `mustStayInFromVersion` | 任何仍 open 的 V5 blocker |
| `allowedCarryover` | V5 balance tuning debt；V5 presentation polish debt |
| `residualRouting` | V5 roster clarity debt -> V6 identity readability；V5 production-decision debt -> V6 hero/faction expression |
| `netNewBlockers` | 英雄/法术/物品等身份系统；阵营或单位身份差异；能让玩家认出这像 War3-like 的核心表达 |

## 2. Codex 首批任务原则

Codex 首批任务必须围绕 V6 identity blocker 的验收和证据收口：

- `V6-ID1` Hero / spell / item identity systems。
- `V6-FA1` Faction or unit identity difference。
- `V6-W3L1` War3-like identity first-look。

Codex 可以做：

- gate / ledger / bootstrap / runway 口径同步。
- GLM bounded proof pack 的 closeout review。
- focused command、state log、截图、review checklist 或 user verdict 证据的保守判定。
- V5 balance tuning debt、presentation polish debt、roster clarity debt、production-decision debt 的 residual routing。
- live queue 播种前的边界检查。

Codex 不做：

- `V5-COUNTER1` 或任何当前 V5 blocker closeout。
- gameplay implementation、完整英雄池、完整物品系统、完整法术书或完整内容扩张。
- UI polish、菜单质量裁决、release copy。
- 真实素材导入、sourcing、授权判断或风格审批。
- V7 任务、长局、ladder、campaign 或公开 demo。

## 3. Seed Draft

这些任务不是 live queue。只有 `V5_TO_V6` 进入 cutover-ready / cutover-done，且当前 V5 blocker 已关闭后，才能把它们转入 `docs/CODEX_ACTIVE_QUEUE.md`。

### C92: V6 Identity Gate Sync

Status: `seed-draft`.

Milestone: `V6 War3 identity alpha`.

Gate: `V6-ID1` / `V6-FA1` / `V6-W3L1`.

Goal:

把 V6 remaining gates、evidence ledger、bootstrap packet 和双车道 runway 对齐，确认 V6 首批 blocker 只来自 War3 identity alpha 三条主线。

Why now:

正式 cutover 后，V6 需要统一 gate 口径，避免把 V5-COUNTER1、balance tuning、presentation polish、真实素材导入或完整内容扩张误派成 V6 blocker。

Allowed files:

- `docs/V6_IDENTITY_SYSTEMS_REMAINING_GATES.zh-CN.md`
- `docs/V6_IDENTITY_SYSTEMS_EVIDENCE_LEDGER.zh-CN.md`
- `docs/V6_TRANSITION_BOOTSTRAP_PACKET.zh-CN.md`
- `docs/CODEX_ACTIVE_QUEUE.md` only for cutover seed sync

Must satisfy:

- `V6-ID1`、`V6-FA1`、`V6-W3L1` 三条 blocker 口径一致。
- `V5-COUNTER1` 和任何仍 open 的 V5 blocker 留在 V5，不写成 V6 启动输入。
- V5 carryover 只进入 `V6-BAL0`、`V6-PRES0` 或具体 identity proof context，不抢 V6 blocker。
- 不声明 V6 active、完整 War3 内容量、完整身份系统或 V7 范围。

Stop condition:

V6 gate、ledger、bootstrap 和 live queue seed 口径一致；若发现 V5 blocker 仍 open，停止 V6 seed 并路由回 V5。

### C93: ID1 身份系统证据收口复核

Status: `seed-draft`.

Milestone: `V6 War3 identity alpha`.

Gate: `V6-ID1`.

Requires completed GLM proof:

`ID1 英雄法术物品身份证明包`.

Goal:

复核英雄、法术、物品或等价身份系统 proof 是否证明至少一个身份系统有可见状态、触发方式、效果反馈和限制条件。

Why now:

V6 的身份系统不能只是按钮、图标或文案占位；Codex 需要防止把装饰性存在写成 identity system pass。

Allowed files:

- `docs/V6_IDENTITY_SYSTEMS_REMAINING_GATES.zh-CN.md`
- `docs/V6_IDENTITY_SYSTEMS_EVIDENCE_LEDGER.zh-CN.md`
- `docs/CODEX_ACTIVE_QUEUE.md` only for closeout sync

Must satisfy:

- 必须引用实际 focused command、state log、触发路径、效果反馈和限制条件。
- 不能把按钮存在、图标存在、改名或说明文案写成 ID1 pass。
- 不关闭 `V6-FA1`、`V6-W3L1` 或 `V6-UA1`。

Stop condition:

remaining gates 和 evidence ledger 写清 `V6-ID1` pass / blocked / insufficient-evidence，并点名最小失败面。

### C94: FA1 阵营单位差异证据收口复核

Status: `seed-draft`.

Milestone: `V6 War3 identity alpha`.

Gate: `V6-FA1`.

Requires completed GLM proof:

`FA1 阵营或单位身份差异证明包`.

Goal:

复核阵营、单位或兵种身份差异 proof 是否证明至少一组差异会影响读图、能力、生产/使用选择或战斗角色。

Why now:

V6 不能只靠同一单位换名字或换颜色获得身份感；需要 Codex 收口差异是否真实可观察。

Allowed files:

- `docs/V6_IDENTITY_SYSTEMS_REMAINING_GATES.zh-CN.md`
- `docs/V6_IDENTITY_SYSTEMS_EVIDENCE_LEDGER.zh-CN.md`
- `docs/CODEX_ACTIVE_QUEUE.md` only for closeout sync

Must satisfy:

- 必须引用差异对象、runtime state、使用选择、生产选择或 combat role proof。
- 不能把单纯改名、重色、静态描述或同质单位写成 FA1 pass。
- 不关闭 `V6-ID1`、`V6-W3L1` 或 `V6-UA1`。

Stop condition:

remaining gates 和 evidence ledger 写清 `V6-FA1` pass / blocked / insufficient-evidence，并点名最小失败面。

### C95: W3L1 War3-like 身份首看复核

Status: `seed-draft`.

Milestone: `V6 War3 identity alpha`.

Gate: `V6-W3L1`.

Requires completed GLM proof:

`W3L1 War3-like 身份审查包`.

Goal:

复核 ID1、FA1、截图、state log、review checklist 和用户或目标 tester verdict 是否能组成同一份 War3-like identity closeout。

Why now:

V6 最终不是单点功能通过，而是让玩家能认出这更像 War3-like；Codex 需要把工程证据和人眼判断分开收口。

Allowed files:

- `docs/V6_IDENTITY_SYSTEMS_REMAINING_GATES.zh-CN.md`
- `docs/V6_IDENTITY_SYSTEMS_EVIDENCE_LEDGER.zh-CN.md`
- `docs/CODEX_ACTIVE_QUEUE.md` only for closeout sync

Must satisfy:

- 必须绑定同一 build 的 screenshot / state log / review checklist。
- 必须保留用户或目标 tester 的 identity verdict；自动化不能代判最终人眼结论。
- 不能用单个装饰元素、UI polish、真实素材导入或完整内容承诺冒充 W3L1 pass。

Stop condition:

remaining gates 和 evidence ledger 写清 `V6-W3L1` pass / blocked / insufficient-evidence / user-open，并点名最小后续 proof 或 verdict。

## 4. Cutover 与派发规则

V6 runway 播种前必须满足：

- `V5-COUNTER1` 和任何仍 open 的 V5 blocker 已在 V5 关闭。
- transition 状态进入 cutover-ready / cutover-done。
- `docs/V6_IDENTITY_SYSTEMS_REMAINING_GATES.zh-CN.md`、`docs/V6_IDENTITY_SYSTEMS_EVIDENCE_LEDGER.zh-CN.md`、`docs/V6_TRANSITION_BOOTSTRAP_PACKET.zh-CN.md` 与两条 runway 同步。
- live queue seed 明确只派 V6 identity alpha 任务。

如果任一 V5 blocker 仍 open：

- 停止 V6 seed。
- 不把 V5 blocker 改写成 V6 residual。
- 由 V5 live queue 继续收口。

## 5. 验证底线

Codex 文档同步任务至少运行：

```bash
git diff --check -- <changed-docs>
```

Codex proof closeout 任务必须引用 GLM closeout 中的实际 focused command、state log、截图或 review packet。若涉及 runtime 复核，还必须遵守 fresh-state 规则：发生击杀、重载、训练、重建或 cleanup 后，重新从 `window.__war3Game` / `g.units` 读取状态，不使用旧快照作为 proof。

## 6. 当前保守结论

```text
这是 V6 Codex runway 的预热草案。
它只定义 V6 cutover-ready 后 Codex 可以领取的 gate sync、review、routing 和治理任务。
它不激活 V6，不修改 live queue，不代表任何 V6 gate 已通过。
V5-COUNTER1 仍留在 V5，不得带进 V6 启动。
```
