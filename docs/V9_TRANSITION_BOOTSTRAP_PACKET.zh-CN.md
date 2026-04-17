# V9 Transition Bootstrap Packet

> 用途：把 V8 的工程 closeout 转成 V9 的首轮执行入口，避免进入 V9 后任务断供或无限扩张。

## 0. Transition summary

| 项 | 内容 |
| --- | --- |
| Transition | `V8_TO_V9` |
| From | `V8 external demo and release candidate` |
| To | `V9 maintenance and expansion runway` |
| V8 outcome | V8-DEMO1、V8-RC1、V8-COPY1、V8-ASSET1、V8-FEEDBACK1 工程通过；V8-UA1 异步保留。 |
| V9 focus | 外部反馈进入维护队列、V8 baseline 可复现、下一轮扩展方向受控。 |

## 1. V8 handoff contract

V8 已提供：

- 外部 demo 入口 smoke：正常入口、开始、暂停返回、重开、结果返回、范围说明。
- release candidate stability proof：V7 内容数据、训练/战斗、普通入口完整会话、HUD/命令状态、清理恢复。
- 对外 copy truth：README 和入口页不宣称完整 War3、公开发布或 final art。
- 素材边界：当前外部可见素材是 S0 fallback / project proxy / procedural，不包含未授权官方素材。
- 反馈流程：记录字段、P0-P5 分级、gate 回流和任务转译规则。

V8 没有提供：

- 外部 tester 已接受的主观 verdict。
- 完整 War3、人族全套科技、完整英雄/物品/商店/野怪/空军/海军。
- 战役、多人大厅、天梯、回放、账号系统。
- 最终授权素材包或最终美术质量。
- 长期扩展方向选择结论。

## 2. V9 first execution order

1. `V9-BASELINE1`：固定 V8 baseline，确认 demo smoke、RC smoke、cleanup 和回滚说明。
2. `V9-HOTFIX1`：把 V8/V9 反馈样例跑通记录、分级、路由和任务生成。
3. `V9-EXPAND1`：只从一个主攻能力开始选下一轮扩展，不允许无限开线。

## 3. Stop conditions

- 如果 V8 baseline 无法复跑，停止扩展，先修 `V9-BASELINE1`。
- 如果 P0/P1 反馈不能进入 hotfix/patch，停止新内容，先修 `V9-HOTFIX1`。
- 如果下一轮扩展不是来自 feedback + master roadmap，停止派发，先修 `V9-EXPAND1`。
- 如果任务生成开始重复提交同一类任务，停止自动派发，先修 queue/refill 去重。

## 4. First queue seeds

| Lane | Seed | 目标 |
| --- | --- | --- |
| Codex | `V9-CX1 — External feedback intake sync` | 把 V8 feedback packet、V9 gates、live queue 和看板接起来。 |
| Codex | `V9-CX2 — Next expansion decision packet` | 从 V8 反馈和 master roadmap 中选择一个主攻能力，写清不选什么。 |
| GLM | `Task 115 — V9 hotfix triage proof pack` | 用窄测试/文档证明一条反馈能被分级并进入正确队列。 |
| GLM | `Task 116 — V9 baseline replay smoke pack` | 复跑 V8 demo smoke + RC smoke 的最小 baseline proof，并记录 cleanup。 |

## 5. Current decision

```text
V8 can cut over to V9 once V9 templates are present and version-cutover passes.
V9 starts as maintenance and expansion discipline, not as more feature excitement.
```
