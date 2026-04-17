# V4 Transition Bootstrap Packet

> 用途：记录 `V3_TO_V4` 在切换前的交接输入、残留路由、缺失 artifact 和 cutover 检查项。  
> 当前文件是 transition-pack preheat artifact，不表示 `V4 short-match alpha` 已经 active，不修改 live queue，不派发 seed queue。

## 0. 当前状态

```text
transition: V3_TO_V4
from: V3.1 battlefield + product-shell clarity
to: V4 short-match alpha
state: cutover-blocked
```

`cutover-blocked` 的原因不是 V3 工程 blocker，而是 V4 transition pack 仍缺关键件：

| Artifact | Path | 当前状态 |
| --- | --- | --- |
| `remainingGates` | `docs/V4_SHORT_MATCH_REMAINING_GATES.zh-CN.md` | ready / preheated |
| `evidenceLedger` | `docs/V4_SHORT_MATCH_EVIDENCE_LEDGER.zh-CN.md` | ready / preheated |
| `bootstrapPacket` | `docs/V4_TRANSITION_BOOTSTRAP_PACKET.zh-CN.md` | this packet |
| `codexRunway` | `docs/runways/V4_CODEX_TRANSITION_RUNWAY.zh-CN.md` | missing |
| `glmRunway` | `docs/runways/V4_GLM_TRANSITION_RUNWAY.zh-CN.md` | missing |

当前不能写成：

```text
V4 active
V4 seed queue dispatched
cutover-ready
```

## 1. Handoff Contract

| 字段 | 当前值 |
| --- | --- |
| `northStar` | 让 War3 玩家前 5 分钟愿意认真对待它 |
| `fromVersionOutcome` | V3.1 battlefield + product-shell clarity |
| `toVersionFocus` | V4 short-match alpha |
| `mustStayInFromVersion` | 任何仍 open 的 V3 blocker |
| `allowedCarryover` | V3 user-open menu quality debt；V3 non-critical visual polish debt |
| `residualRouting` | V3 readability tuning debt -> V4 short-match readability baseline；V3 shell polish debt -> V4 session-loop polish |
| `netNewBlockers` | 开局到中期 pressure path；玩家恢复与反打路径；truthful win/lose/result loop |

## 2. Oracle Snapshot

当前 V3 oracle 输入：

| Snapshot | 当前值 | V4 处理 |
| --- | --- | --- |
| engineering blockers | none | 不阻塞 preheat；正式 cutover 前仍需复核。 |
| conditional blockers | none | 不生成 V4 conditional blocker。 |
| user-open | `V3-PS4` menu quality | 作为 V4 carryover / user input，不阻塞 V4 工程模板。 |

结论：

```text
V3 blocker snapshot 为空；
V4 cutover 的当前阻塞点是 transition pack 缺件；
V4 仍未激活。
```

## 3. V4 接棒范围

V4 只接这三条 short-match alpha 主线：

| V4 blocker | 需要回答的问题 | 不允许替代成什么 |
| --- | --- | --- |
| `V4-P1` Opening-to-mid pressure path | 开局后是否出现可复现、可解释、玩家能感知的压力路径。 | 不能用单次偶然交火、AI idle 或纯截图代替。 |
| `V4-R1` Recovery and counter path | 玩家受损后是否能恢复、重建、守住或反打。 | 不能只证明失败、拖时间或重开局。 |
| `V4-E1` Truthful win / lose / result loop | 短局是否有诚实的胜负、停滞或结果闭环。 | 不能假装天梯、战役、完整战报或长期 profile。 |

## 4. Carryover 与 Residual 路由

这些是 V4 接棒输入，不是当前版本 closeout 工作。

| 来源 | V4 路由 | 处理规则 |
| --- | --- | --- |
| V3 user-open menu quality debt | `V4-SH1` session-loop polish / user gate | 只在菜单或 session loop 影响短局理解时记录；不得变成 V4 工程 blocker。 |
| V3 non-critical visual polish debt | `V4-RD0` short-match readability baseline residual | 只作为短局可读性 baseline；不得生成真实素材导入、UI polish 或素材 sourcing 任务。 |
| V3 readability tuning debt | `V4-RD0` | 如果破坏 pressure、recovery 或 result proof，绑定具体失败面回流到对应 V4 blocker。 |
| V3 shell polish debt | `V4-SH1` | 只处理 pause、results、return、rematch、briefing 是否支撑短局闭环；不裁决最终主菜单质感。 |

## 5. Seed Queue 原则

V4 seed queue 只允许在 `cutover-ready` 后播种。当前只定义原则：

| Lane | 允许 seed 类型 | 禁止 seed 类型 |
| --- | --- | --- |
| Codex | V4 gate sync、evidence ledger sync、pressure/recovery/result routing brief、GLM proof review packet。 | 当前 V3 closeout、UI polish、真实素材导入、菜单质量裁决、live queue mutation。 |
| GLM | opening pressure focused proof、recovery/counter focused proof、ending/result focused proof、bounded regression pack。 | 版本边界设计、sourcing、授权判断、艺术方向、泛化玩法大改。 |

预期首批方向来自 `VERSION_TRANSITIONS.json`：

- Codex seed draft:
  - `V4 Codex Seed 01 — Match Loop Gate Sync`
  - `V4 Codex Seed 02 — Recovery/Counter Routing Brief`
- GLM seed draft:
  - `V4 GLM Seed 01 — Opening Pressure Proof Pack`
  - `V4 GLM Seed 02 — Ending/Stall Clarity Pack`

这些仍是 seed draft，不是 live queue。

## 6. Cutover 前检查项

正式从 `cutover-blocked` 进入 `cutover-ready` 前，必须满足：

| Check | 要求 |
| --- | --- |
| V3 blocker check | V3 engineering blocker 仍为 none；任何新 open blocker 必须留在 V3。 |
| artifact check | V4 remaining gates、evidence ledger、bootstrap packet、Codex runway、GLM runway 全部存在。 |
| consistency check | 五个 V4 artifact 使用同一套 blocker、carryover、residual、seed queue 和禁止范围。 |
| activation check | 任何文件都不能写成 V4 已 active，直到 cutover executor 执行。 |
| queue check | 当前 live queue 不因 preheat 发生 mutation；V4 seed queue 不提前播种。 |

如果任一检查失败，状态保持：

```text
cutover-blocked
```

## 7. 当前结论

```text
V4 bootstrap packet 已预热；
V4 仍未 active；
当前缺 codexRunway 和 glmRunway；
V3-PS4 只作为 user-open carryover；
V3 non-critical visual polish debt 只作为 residual；
V4 net-new blockers 只来自 short-match alpha。
```
