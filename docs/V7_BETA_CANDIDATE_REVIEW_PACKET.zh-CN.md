# V7 Beta Candidate Review Packet

> 用途：把 V7 可玩内容、验证命令、已知缺口和人眼判断入口汇总成一份 beta candidate 审查材料。  
> 当前状态：`candidate-ready`。这表示 V7 beta candidate 工程审查材料已成立；它仍不是 public demo / release candidate。

## 0. 当前口径

```text
currentVersion: V7
currentMilestone: V7 content and beta candidate
packetState: candidate-ready
lastUpdated: 2026-04-15 13:15:52 CST
```

`V7-HUM1`、`V7-NUM2`、`V7-AI1`、`V7-STAB1` 都已有 Codex accepted 工程证据。  
本文件现在关闭 `V7-BETA1` 的工程面；用户或 tester verdict 保持异步，不阻塞后续版本预热。

## 1. 这份审查包能证明什么

本包证明：

- V7 选定 Human 内容真的可玩，不是只有按钮、名字或模型。
- 新内容有数据、前置、命令卡、runtime proof 和玩家可见状态。
- 至少两类高级数值或战斗模型进入真实行为。
- AI 至少按同一套规则使用一个 V7 已证明内容。
- build、typecheck、focused runtime、相关回归和 cleanup 都通过。
- 已知缺口和不能对外承诺的范围写清楚。

## 2. 这份审查包不能证明什么

即使 V7 通过，也不能宣称：

- 完整 War3 人族已经完成。
- 四族、战役、ladder、多人大厅或公开 demo 已完成。
- 官方素材、图标、音频或未授权资产已可使用。
- 英雄、物品、空军、完整 T3、完整 Workshop / Sanctum 全单位都已完成。
- 当前版本已经达到 release candidate。

## 3. 当前工程状态

| Gate | 当前状态 | 证据位置 | 备注 |
| --- | --- | --- | --- |
| `V7-SCOPE1` | `engineering-pass` | `docs/V7_CONTENT_BETA_REMAINING_GATES.zh-CN.md` §2.1 | 范围已冻结。 |
| `V7-HUM1` | `engineering-pass` | `docs/V7_CONTENT_BETA_REMAINING_GATES.zh-CN.md` §2.2；`tests/v7-arcane-sanctum-caster-proof.spec.ts` | Task 107 塔线、Task 108 法师线、Task 109 工程线均已 accepted。 |
| `V7-NUM2` | `engineering-pass` | `docs/V7_CONTENT_BETA_REMAINING_GATES.zh-CN.md` §2.3；`tests/v7-workshop-mortar-combat-model-proof.spec.ts`；`tests/v7-arcane-sanctum-caster-proof.spec.ts` | Mortar AOE/filter 与 Priest caster mana 均已 accepted。 |
| `V7-AI1` | `engineering-pass` | `docs/GLM_READY_TASK_QUEUE.md` Task 110；`tests/v7-ai-same-rule-content-proof.spec.ts` | Task 110 已 accepted：AI 同规则使用 V7 内容，并保留开局压制节奏。 |
| `V7-STAB1` | `engineering-pass` | `tests/v7-beta-stability-regression.spec.ts`；`scripts/run-runtime-suite.sh` | Task 111 已 accepted：稳定性包 5/5、完整 V7 内容包 31/31、cleanup 后无残留。 |
| `V7-BETA1` | `engineering-pass` | 本文件 | beta candidate 审查材料已补齐：可玩内容、验证命令、已知缺口、不可承诺范围和异步人眼判断入口。 |
| `V7-UA1` | `user-open / async` | 待用户或 tester verdict | 不阻塞工程推进，但必须记录。 |

## 4. V7 可玩内容清单

| 内容 | 状态 | 证明命令 | Codex 结论 |
| --- | --- | --- | --- |
| Lumber Mill + Guard Tower 最小塔线 | `accepted` | `./scripts/run-runtime-tests.sh tests/v7-lumber-mill-tower-branch-proof.spec.ts --reporter=list` | Codex 复核通过：focused 6/6，command-surface 13/13。 |
| Arcane Sanctum + Priest | `accepted` | `./scripts/run-runtime-tests.sh tests/v7-arcane-sanctum-caster-proof.spec.ts --reporter=list` | Codex 复核通过：Arcane Sanctum 数据/前置/命令卡训练 Priest，Priest mana / heal / cooldown / range / HUD / 禁用原因 focused 9/9；相关 V7/command 回归 30/30。 |
| Workshop + Mortar Team | `accepted` | `./scripts/run-runtime-tests.sh tests/v7-workshop-mortar-combat-model-proof.spec.ts --reporter=list` | Codex 接管复核通过：Workshop 训练入口、Mortar Siege 数据、AOE/filter focused 3/3；相关回归 23/23。 |
| AI 同规则使用 V7 内容 | `accepted` | `./scripts/run-runtime-tests.sh tests/v7-ai-same-rule-content-proof.spec.ts --reporter=list` | Codex 接管复核通过：AI 按同规则使用 Tower / Workshop / Mortar 内容；focused 8/8，相关 AI / Rifleman / Mortar 回归 18/18。 |
| V7 稳定性总包 | `accepted` | `./scripts/run-runtime-tests.sh tests/v7-beta-stability-regression.spec.ts --reporter=list` | Codex 接管复核通过：V7 内容在同一 runtime 中共存，focused 5/5；完整 V7 内容包 31/31。 |

## 5. 最终审查前必须补齐的证据

| 证据 | 必需命令或材料 | 当前状态 |
| --- | --- | --- |
| Build | `npm run build` | Task 111 Codex 复核已通过。 |
| Typecheck | `npx tsc --noEmit -p tsconfig.app.json` | Task 111 Codex 复核已通过。 |
| Focused runtime | Task 107 / 108 / 109 / 110 / 111 对应 focused specs | Task 107、108、109、110、111 均已 accepted；Task 111 focused 5/5。 |
| Related runtime pack | 选择受影响的 command / economy / AI / combat specs | 完整 V7 内容包 31/31；Task 108 相关 V7/command pack 30/30；Task 109 相关包 23/23；Task 110 相关包 18/18。 |
| Cleanup | `./scripts/cleanup-local-runtime.sh` + 无残留进程检查 | Task 111 runtime 后已清理，无 Vite / Playwright / Chromium / runtime test 残留。 |
| Known gaps | 本文件 §6 | 已填；均不阻塞 V7 工程面。 |
| User / tester verdict | 本文件 §7 | 异步待填。 |

## 6. 已知缺口记录

| 缺口 | 是否阻塞 V7 | 路由 |
| --- | --- | --- |
| 完整英雄、商店、空军、完整 T3 | 不阻塞当前 V7 工程面 | V8/V9 或完整人族终局合同。 |
| Cannon Tower / Arcane Tower 全塔线 | 不阻塞，除非 Guard Tower 最小线失败 | 后续 tower branch 扩展。 |
| Sorceress / Spell Breaker 全法师线 | 不阻塞，除非 Priest 最小线失败 | 后续 caster expansion。 |
| Flying Machine / Siege Engine 全工程线 | 不阻塞，除非 Mortar 最小线失败 | 后续 workshop expansion。 |
| 真实授权素材 | 不阻塞 gameplay proof | 素材批准流程单独推进。 |

## 7. 用户或 tester verdict

| Verdict | 记录 |
| --- | --- |
| `pass` | 待填。 |
| `pass-with-debt` | 待填。 |
| `reject` | 待填。 |
| `defer` | 待填。 |

如果用户或 tester 异步反馈“不像 beta candidate”，必须把原因路由到对应 gate：

- 内容少或不真实 -> `V7-HUM1`
- 战斗/法术没有选择意义 -> `V7-NUM2`
- AI 不会使用新内容 -> `V7-AI1`
- bug 或残留进程阻断试玩 -> `V7-STAB1`
- 不知道能玩什么、不能承诺什么 -> `V7-BETA1`

## 8. 当前结论

```text
V7 beta candidate 审查包已 candidate-ready。
Task 107、Task 108、Task 109、Task 110、Task 111 已 accepted。
V7-SCOPE1、V7-HUM1、V7-NUM2、V7-AI1、V7-STAB1、V7-BETA1 工程面已通过。
用户或 tester verdict 仍是异步入口；如果后续 reject，会按 §7 路由回对应 gate。
下一步可以评估 V7_TO_V8 预热或 cutover。
```
