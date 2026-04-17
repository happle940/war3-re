# V4 Short-Match Evidence Ledger

> 用途：记录 `V4 short-match alpha` 的工程证据、用户判断证据和当前状态。  
> 上游 gate 清单：`docs/V4_SHORT_MATCH_REMAINING_GATES.zh-CN.md`。  
> 本文件最初由 `V3_TO_V4` preheat 生成；V4 已在 `docs/VERSION_RUNTIME_STATE.json` 激活，现在它记录 V4 当前证据状态。

## 0. 使用规则

| 状态 | 含义 |
| --- | --- |
| `open` | V4 已启动，但该 gate 还没有足够 runtime proof 关闭。 |
| `engineering-pass` | 工程证据已满足，但用户判断可能仍未完成。 |
| `blocked` | V4 激活后，focused proof 明确失败。 |
| `insufficient-evidence` | 有部分证据，但不足以关闭 gate。 |
| `carryover` | 从 V3 带入 V4 的非阻断债务。 |
| `user-open` | 需要用户或目标 tester 判断。 |
| `residual` | 不阻塞 V4 工程 closeout，但必须记录路由。 |

更新规则：

- 每次更新必须绑定 focused command、截图包、state log、review packet 或明确的人眼结论。
- `engineering-pass` 不能冒充 `user-accepted`。
- `carryover` 不能升级成 V4 blocker，除非它直接破坏 `V4-P1`、`V4-R1` 或 `V4-E1` 的 proof。
- 当前 V4 阶段不得把未证明的能力写成已通过。

## 1. V4 blocker evidence ledger

| Gate | 当前状态 | 必需工程证据 | 必需用户判断证据 | 当前结论 |
| --- | --- | --- | --- | --- |
| `V4-P1` Opening-to-mid pressure path | `engineering-pass` | 2026-04-14 `tests/v4-opening-pressure-proof.spec.ts` 6/6 pass；AI 在 t≈180s 发起攻击波，t≈192.6s 摧毁玩家主基地；closeout audit 记录 4 波进攻、13 个 AI 工人、2 个步兵、生产设施完好，gameOverResult=`defeat`。 | 用户或目标 tester 仍需确认压力体验是否合理，不是只看数值通过。 | P1 工程证据通过：压力路径存在且能被 state log 证明。该结论不关闭 E1 结果闭环，也不证明平衡或可赢性。 |
| `V4-R1` Recovery and counter path | `engineering-pass / watch-after-E1` | 2026-04-14 `tests/v4-recovery-counter-proof.spec.ts` 5/5 pass；受控 fixture 禁用 AI，覆盖 kill workers、damage TH、训练 replacement workers、gold rally 恢复采集、训练 footmen、attack-move 向 AI 基地、selection/placement/attack-move clean。 | 用户或目标 tester 确认失败后仍看得懂下一步。 | R1 工程证据通过：玩家受损后存在补 worker、恢复采集、补兵和反击的机制路径。该结论不证明真实开局平衡、可赢性或 E1 结果闭环。 |
| `V4-E1` Truthful win / lose / result loop | `engineering-pass` | 2026-04-14 `tests/v4-ending-result-truth-proof.spec.ts` 6/6 pass；覆盖 defeat、victory、stall 三类结果触发，overlay/results 文案，summary 时长与双方单位/建筑字段来源，真实 results 返回按钮清理，以及 no-fake-label 扫描。 | 用户或目标 tester 确认结果说明真实、轻量、可理解。 | E1 工程证据通过：短局能给出诚实胜负或僵局结果，结果页不冒充天梯、战役、正式战报或长期统计。 |

## 2. Carryover / residual ledger

| Carryover | 当前状态 | V4 路由 | 当前结论 |
| --- | --- | --- | --- |
| `V3 user-open menu quality debt` | `carryover / user-open` | `V4-SH1` session-loop polish | 只作为用户判断债务带入。不得阻塞 V4 gate 模板；只有当菜单或 shell 影响短局 session loop 理解时，才记录为 V4-SH1 证据缺口。 |
| `V3 non-critical visual polish debt` | `residual` | `V4-RD0` short-match readability baseline | 只作为可读性 tuning baseline。不得生成真实素材导入、素材 sourcing 或 UI polish 任务；若影响 pressure/recovery/result proof，必须回到对应 V4 blocker 记录具体失败面。 |
| V3 readability tuning debt | `carryover` | `V4-RD0` | V3 已给 V4 留下默认镜头可读性基础；V4 只复核它是否支撑短局压力和恢复，不重新打开 V3 视觉 closeout。 |
| V3 shell polish debt | `carryover` | `V4-SH1` | V4 只关心 session-loop clarity：pause、results、return、rematch、briefing 是否支撑短局闭环；不裁决最终主菜单质感。 |

## 3. Conditional / user evidence ledger

| Gate | 当前状态 | 必需工程证据 | 必需用户判断证据 | 当前结论 |
| --- | --- | --- | --- | --- |
| `V4-RD0` Short-match readability baseline | `carryover / active` | 短局 pressure、recovery、ending proof 中对象仍可读；如失败，绑定具体截图或 state log。 | 用户或目标 tester 判断短局期间读图是否足够。 | 只作为 V4 blocker proof 的支撑面；不单独生成视觉 polish 或素材导入任务。 |
| `V4-SH1` Session-loop polish | `carryover / active` | pause、results、return、rematch、briefing 与短局状态一致；不出现 stale session、假模式或假战报。 | 用户判断 session loop 是否像产品路径而不是工程占位。 | 继承 V3 PS4 user-open 和 shell polish debt；不阻塞 V4 工程模板。 |
| `V4-UA1` Short-match first-play verdict | `user-open` | V4-P1、V4-R1、V4-E1 的工程证据包。 | 用户或目标 tester 给出 `pass`、`pass-with-debt`、`reject` 或 `defer`。 | 人眼 verdict 是 V4 alpha 判断；不能由自动化替代。 |

## 4. Handoff contract snapshot

| 字段 | 当前值 |
| --- | --- |
| `fromVersionOutcome` | V3.1 battlefield + product-shell clarity |
| `toVersionFocus` | V4 short-match alpha |
| `mustStayInFromVersion` | 任何仍 open 的 V3 blocker |
| `allowedCarryover` | V3 user-open menu quality debt；V3 non-critical visual polish debt |
| `residualRouting` | V3 readability tuning debt -> V4 short-match readability baseline；V3 shell polish debt -> V4 session-loop polish |
| `netNewBlockers` | 开局到中期 pressure path；玩家恢复与反打路径；truthful win/lose/result loop |

## 5. 当前保守结论

```text
V4 已 active。
当前工程 blocker 已清零。
V4 blocker 只来自 short-match alpha：pressure path、recovery/counter path、truthful win/lose/result loop。
V3-PS4 user-open menu quality debt 是 carryover，不阻塞 V4 工程模板。
V3 non-critical visual polish debt 是 residual，不生成真实素材导入或 UI polish 任务。
V4-UA1 仍是 user-open，但不阻塞工程切换；用户可以异步追加体验反馈。
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
