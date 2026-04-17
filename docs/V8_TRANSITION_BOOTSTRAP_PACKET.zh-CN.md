# V8 Transition Bootstrap Packet

> 用途：把 V7 的工程 closeout 转成 V8 的首轮执行入口，避免进入 V8 后重新讨论范围。

## 0. Transition summary

| 项 | 内容 |
| --- | --- |
| Transition | `V7_TO_V8` |
| From | `V7 content and beta candidate` |
| To | `V8 external demo and release candidate` |
| V7 outcome | V7 工程 blocker 清零；Task 107-111 accepted；beta candidate 审查包 candidate-ready。 |
| V8 focus | 外部 demo 路径、release candidate 稳定性、对外口径、素材边界、反馈回流。 |

## 1. V7 handoff contract

V7 已提供：

- Lumber Mill + Guard Tower 最小塔线。
- Arcane Sanctum + Priest 最小法师线。
- Workshop + Mortar Team 最小工程线。
- Priest caster mana 与 Mortar AOE/filter 两类高级模型。
- AI 同规则使用 Tower / Workshop / Mortar 内容。
- V7 内容稳定性包 31/31。
- beta candidate 审查包 candidate-ready。

V7 没有提供：

- 完整 War3 人族。
- 完整英雄、物品、空军、完整 T3。
- 公开 demo 或 release candidate 通过结论。
- 未授权官方素材。

## 2. V8 first execution order

1. `V8-DEMO1`：确认外部试玩入口和开始/重开/返回路径。
2. `V8-RC1`：跑 release candidate 稳定性证据包。
3. `V8-COPY1`：同步 README / demo 文案 / 范围说明。
4. `V8-ASSET1`：确认外部可见素材边界。
5. `V8-FEEDBACK1`：建立 tester 反馈记录和 triage 回流。

## 3. Stop conditions

- 如果 demo 入口打不开或无法开始，停止扩展内容，先修 V8-DEMO1。
- 如果 runtime / live smoke 不稳定，停止包装，先修 V8-RC1。
- 如果文案误承诺完整 War3、public release 或未授权素材，停止对外化，先修 V8-COPY1 / ASSET1。
- 如果反馈无法记录和回流，不能宣称外部 beta 流程成立。

## 4. First queue seeds

| Lane | Seed | 目标 |
| --- | --- | --- |
| Codex | `V8-CX1 — External release gate sync` | 同步 V8 gate、看板、审查包和 cutover 状态。 |
| GLM | `Task 112 — V8 demo path smoke pack` | 用窄测试证明 demo 入口、开始、重开/返回和范围说明。 |
| GLM | `Task 113 — V8 release candidate stability pack` | 把 V7 内容包、核心 runtime shard、cleanup 串成 RC 稳定性证明。 |

## 5. Current decision

```text
V7 can cut over to V8 once this transition pack is present and version-cutover passes.
V8 starts with external path and release readiness, not more Human content expansion.
```
