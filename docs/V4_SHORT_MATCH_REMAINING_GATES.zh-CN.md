# V4 Short-Match Remaining Gates

> 用途：定义 `V4 short-match alpha` 当前要关闭的 blocker、carryover、user gate 和 residual。  
> 本文件最初由 `V3_TO_V4` preheat 生成；V4 已在 `docs/VERSION_RUNTIME_STATE.json` 激活，现在它是 V4 当前 gate 清单。

## 0. 当前口径

当前版本状态：

```text
currentVersion: V4
activatedByTransitionId: V3_TO_V4
```

含义：

- V3 工程 blocker 已清零，V3_TO_V4 已完成切换。
- V4 当前工程 blocker 已清零：`V4-P1`、`V4-R1`、`V4-E1` 都已有 focused proof 通过。`V4-UA1` 仍是人眼短局判断，不阻塞工程切换。
- 本文件后续更新必须绑定真实 proof、截图、state log 或明确 review 结论，不能继续使用预热口径。

V4 的目标不是“完整战略游戏”，而是：

```text
让 War3 玩家前 5 分钟愿意认真对待它。
```

V4 short-match alpha 要回答的是：

```text
开局之后，游戏是否能形成一段真实短局：有压力、有恢复与反打、有诚实的胜负和结果闭环。
```

它不回答：

- 完整 10-15 分钟对局。
- 完整科技树、英雄、物品、阵营差异。
- 最终视觉素材导入或主菜单最终质感。
- 公开 demo / release candidate。

## 1. Gate 状态词

| 状态 | 含义 |
| --- | --- |
| `V4 blocker` | 不关闭就不能说 V4 short-match alpha 达成。 |
| `conditional blocker` | 只有对应 surface / claim 暴露时才阻塞；未暴露时保留为条件债务。 |
| `carryover` | 从 V3 带入 V4 的非阻断债务，必须有路由但不抢 V4 主 blocker。 |
| `user gate` | 自动化只能准备证据，最终仍需要用户或目标 tester 判断。 |
| `residual` | 可继续跟踪，但不阻塞 V4 工程模板。 |
| `open` | V4 已启动，但该 gate 还没有足够证据关闭。 |

## 2. V4 blocker gates

V4 blocker 只能来自 short-match alpha，不从 V3 的 user-open 或视觉 polish 债务里硬造。

| Gate | 类型 | 初始 V4 结论 | 关闭证据 |
| --- | --- | --- | --- |
| `V4-P1` Opening-to-mid pressure path | match-loop / engineering proof | `V4 blocker / engineering-pass` | 从开局到约 5 分钟必须出现可解释的压力路径：AI 或系统压力不能长期 idle；玩家必须看到进攻、骚扰、资源威胁、生产压力或地图压力中的至少一种；focused regression、时间线记录和截图 / state log 要对齐。2026-04-14 `P1 开局压力证明包`：`tests/v4-opening-pressure-proof.spec.ts` 6/6 pass；AI 在 t≈180s 发起攻击波，t≈192.6s 摧毁玩家主基地，4 波进攻、13 个 AI 工人、2 个步兵、生产设施仍在。P1 只证明压力路径存在，不证明平衡、恢复反打或结果闭环。 |
| `V4-R1` Recovery and counter path | match-loop / engineering proof | `V4 blocker / engineering-pass / watch-after-E1` | 玩家在被压或损失后必须有恢复与反打路径：补 worker、恢复采集、补生产、重新集结、反击或守住关键点；不能只有失败螺旋或无意义拖时间。2026-04-14 `R1 恢复反打证明包`：`tests/v4-recovery-counter-proof.spec.ts` 5/5 pass；受控 fixture 禁用 AI，覆盖 worker 受损、补 worker、恢复采集、训练 footman、attack-move 反击和 command surface clean。R1 证明恢复/反打路径存在，不证明真实开局平衡或可赢性。 |
| `V4-E1` Truthful win / lose / result loop | match-loop + product-shell / engineering proof | `V4 blocker / engineering-pass` | 短局必须能诚实结束或诚实说明未结束：win、lose、timeout/stall、results surface 和 return path 不得假装完整天梯、战役、正式战报或长期统计。2026-04-14 `E1 胜负结果证明包` 经 Codex 复核加强为 `tests/v4-ending-result-truth-proof.spec.ts` 6/6 pass；覆盖 defeat、victory、stall、结果文案、summary 全量字段、真实 results 返回按钮清理和 no-fake-label 扫描。 |

## 3. V3 carryover into V4

这些内容可以进入 V4，但不能抢占 V4 blocker 定义。

| Carryover | V4 路由 | V4 处理规则 |
| --- | --- | --- |
| `V3 user-open menu quality debt` | `V4-SH1` session-loop polish / user gate | 只在菜单或 session loop 影响短局理解时记录；不得把主菜单审美 verdict 写成 V4 工程 blocker。 |
| `V3 non-critical visual polish debt` | `V4-RD0` short-match readability baseline residual | 只作为短局期间的可读性基线债务；不得生成真实素材导入、UI polish 或素材 sourcing 任务。 |
| V3 readability tuning debt | `V4-RD0` short-match readability baseline | 如果短局压力、恢复或结束 proof 因对象不可读而失败，才回流为对应 V4 proof blocker 的证据缺口。 |
| V3 shell polish debt | `V4-SH1` session-loop polish | 如果 return、result、rematch、pause 或 briefing 影响短局闭环理解，记录为 session-loop polish；不回滚 V3 工程通过。 |

## 4. Conditional / user gates

| Gate | 类型 | 初始结论 | 关闭或后移规则 |
| --- | --- | --- | --- |
| `V4-RD0` Short-match readability baseline | residual / conditional | `carryover / active` | 继承 V3 readability tuning debt。只有当默认镜头读图问题破坏 pressure、recovery 或 result proof 时，才升级为相关 blocker 的修复输入。 |
| `V4-SH1` Session-loop polish | product-shell / conditional + user gate | `carryover / active` | 继承 V3 shell polish 和 PS4 user-open menu quality debt。只处理短局 session loop 的理解度，不裁决最终主菜单审美。 |
| `V4-UA1` Short-match first-play verdict | user gate | `user gate / user-open` | 用户或目标 tester 判断前 5 分钟是否值得认真对待。自动化只能提供 pressure、recovery、ending、readability 与 session-loop 证据。 |

## 5. 不属于 V4 当前任务的内容

下面内容不得在 V4 当前任务里变成 blocker 或抢占主线：

| 内容 | 路由 |
| --- | --- |
| 真实素材导入、素材 sourcing、官方 / 第三方素材选择 | 后续 approved packet / asset flow；不属于 V4 gate 模板。 |
| 主菜单最终质感、视觉氛围 polish | `V4-SH1` user/carryover，只有影响短局理解才记录。 |
| 完整科技树、英雄、物品、法术、阵营差异 | V5/V6。 |
| 公开 demo、release copy、外部分享许可 | V8。 |
| 当前 V3 closeout 工作 | 必须留在 V3，不得混入 V4 preheat。 |

## 6. V4 closeout 最低要求

| Closeout requirement | 关联 gate | 通过标准 |
| --- | --- | --- |
| 前 5 分钟存在真实压力 | `V4-P1` | 压力路径可复现、可解释、有时间线 proof，不是 AI idle 或单次偶然交火。 |
| 玩家有恢复和反打空间 | `V4-R1` | 损失后仍有可执行恢复动作和反击窗口，不是纯失败螺旋。 |
| 胜负与结果诚实 | `V4-E1` | win / lose / stall / result 文案和状态真实，不假装天梯、战役、完整战报。 |
| 可读性和 shell 债务不破坏短局 | `V4-RD0` / `V4-SH1` | V3 carryover 没有阻断 V4 三个 blocker 的 proof。 |
| 人眼短局 verdict 有记录 | `V4-UA1` | 用户或目标 tester 给出 pass / pass-with-debt / reject 的短局判断。 |

## 7. 当前 V4 必须回答的话

```text
V4 关的是“短局 alpha”：压力、恢复、反打、结局与结果闭环。
它不是下一轮视觉 polish，也不是完整战略深度。
```
