# V4 Codex Transition Runway

> 用途：这是 `V4 short-match alpha` 的 Codex 预热跑道草案。  
> 当前文件只定义 cutover-ready 后可播种的 seed draft，不表示 V4 已经 active，不修改 live queue。

## 0. Runway Intent

V4 的北极星是：

```text
让 War3 玩家前 5 分钟愿意认真对待它
```

Codex 在 V4 的职责不是直接做 gameplay 实现，而是：

- 固定 short-match alpha 的 gate truth。
- 把 pressure path、recovery/counter path、win/lose/result loop 的证据形状写清。
- 复核 GLM focused proof 是否真的关闭对应 gate。
- 把 V3 carryover 作为 V4 输入路由，而不是让它变成 UI polish 或素材导入任务。

当前 transition state:

```text
cutover-blocked
```

本 runway 只有在 `cutover-ready` 后才能播种到 Codex live queue。

## 1. 禁止范围

V4 Codex seed 不得做：

- 当前 V3 closeout 工作。
- UI polish、主菜单质量裁决、最终视觉方向判断。
- 真实素材导入、素材 sourcing、license 或 art direction 扩写。
- 直接实现 gameplay 大改。
- 把 V4 写成已经 active。

## 2. Seed Draft Order

| Order | Seed draft | Gate focus | Purpose |
| --- | --- | --- | --- |
| 1 | `V4 Codex Seed 01 — Match Loop Gate Sync` | `V4-P1` / `V4-R1` / `V4-E1` | 把 V4 remaining gates、ledger、bootstrap、runway 的 blocker / carryover / residual 口径对齐。 |
| 2 | `V4 Codex Seed 02 — Pressure Proof Acceptance Brief` | `V4-P1` | 定义 opening-to-mid pressure path 要看什么、不能用什么 partial proof 关闭。 |
| 3 | `V4 Codex Seed 03 — Recovery / Counter Routing Brief` | `V4-R1` | 定义玩家受损后恢复、重建、守住和反打的证据形状。 |
| 4 | `V4 Codex Seed 04 — Truthful Ending Review Packet` | `V4-E1` | 定义 win / lose / stall / results / return path 的诚实闭环验收。 |

## 3. Seed Draft Details

### V4 Codex Seed 01 — Match Loop Gate Sync

Status: `seed-draft / not-dispatched`

Artifact targets:

- `docs/V4_SHORT_MATCH_REMAINING_GATES.zh-CN.md`
- `docs/V4_SHORT_MATCH_EVIDENCE_LEDGER.zh-CN.md`
- `docs/V4_TRANSITION_BOOTSTRAP_PACKET.zh-CN.md`

Goal:

让 V4 的 gate、ledger 和 bootstrap packet 对齐，确保 `V4-P1`、`V4-R1`、`V4-E1` 是唯一首批工程 blocker。

Must satisfy:

1. `V3-PS4` 只作为 user-open carryover，不写成 V4 engineering blocker。
2. V3 non-critical visual polish 只作为 residual，不生成素材导入或 UI polish。
3. V4 仍不得写成 active，直到 cutover executor 执行。

Stop condition:

三份 artifact 对同一套 V4 blocker、carryover、residual 和 seed draft 口径一致。

### V4 Codex Seed 02 — Pressure Proof Acceptance Brief

Status: `seed-draft / not-dispatched`

Artifact targets:

- `docs/V4_SHORT_MATCH_REMAINING_GATES.zh-CN.md`
- `docs/V4_SHORT_MATCH_EVIDENCE_LEDGER.zh-CN.md`

Goal:

把 opening-to-mid pressure path 从“感觉 AI 有动”变成可复核 proof：时间线、压力事件、玩家可感知威胁和 focused regression 必须对齐。

Must define:

1. 什么算可解释压力：进攻、骚扰、资源威胁、生产压力或地图压力。
2. 什么不能关闭 `V4-P1`：AI idle、单次偶然交火、纯截图、只证明单位存在。
3. GLM proof pack 必须输出哪些 timeline / state log / screenshot 或 focused command 结果。

Stop condition:

acceptance brief 能直接指导 GLM 写 bounded `Opening Pressure Proof Pack`，且不要求做完整 AI overhaul。

### V4 Codex Seed 03 — Recovery / Counter Routing Brief

Status: `seed-draft / not-dispatched`

Artifact targets:

- `docs/V4_SHORT_MATCH_REMAINING_GATES.zh-CN.md`
- `docs/V4_SHORT_MATCH_EVIDENCE_LEDGER.zh-CN.md`

Goal:

定义玩家受损后如何证明仍有恢复和反打路径，而不是把短局变成失败螺旋或无意义拖时间。

Must define:

1. 恢复证据：补 worker、恢复采集、补生产、重新集结、守住关键点。
2. 反打证据：压力下降、窗口出现、玩家单位重新形成威胁。
3. 不能混入完整 balance、完整科技树或最终战略深度。

Stop condition:

routing brief 能指导 GLM 写 bounded recovery/counter proof，并能让 Codex 后续复核失败面发生在经济、生产、单位、命令面还是状态清理。

### V4 Codex Seed 04 — Truthful Ending Review Packet

Status: `seed-draft / not-dispatched`

Artifact targets:

- `docs/V4_SHORT_MATCH_REMAINING_GATES.zh-CN.md`
- `docs/V4_SHORT_MATCH_EVIDENCE_LEDGER.zh-CN.md`

Goal:

定义短局如何诚实结束或诚实说明未结束，避免把当前 alpha 包装成天梯、战役、完整战报或正式 profile。

Must define:

1. `win`、`lose`、`timeout/stall` 三类结果何时成立。
2. results surface 和 summary 字段必须来自真实 session state。
3. return path 必须清理 gameplay / shell stale state，不回滚 V3 PS2 工程通过。

Stop condition:

review packet 能直接审 GLM 的 ending/result proof，并点名 fake framing、stale state、partial proof 或 copy overclaim。

## 4. Cutover Guard

这些 seed draft 只有在下面条件满足后才能播种：

1. V3 engineering blocker 仍为 none。
2. V4 transition pack 五件 artifact 全部存在并一致。
3. `VERSION_RUNTIME_STATE.json` 仍由 cutover executor 单步切换，而不是手动改文档当作激活。
4. Codex / GLM live queue 不在 preheat 阶段提前写入 V4 seed。

当前结论：

```text
V4 Codex runway 已预热；
V4 仍未 active；
seed queue 未派发。
```
