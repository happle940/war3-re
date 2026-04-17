# V8 Codex Transition Runway

> Codex 在 V8 负责产品真实口径、release 边界、集成验收和 cutover 控制。

## 1. Codex ownership

- 决定 V8 gate 是否工程通过。
- 审核 GLM 的 demo smoke / RC stability closeout。
- 维护外部可见文案、README、已知缺口和不可承诺范围。
- 确认素材边界合法、保守、可解释。
- 把 tester 反馈路由成 blocker、residual、user gate 或下一版本任务。

## 2. Active trunk

| Trunk | 目标 | 第一动作 |
| --- | --- | --- |
| `V8-CX1` Release gate sync | cutover 后把 V8 gate / evidence / board 状态同步。 | 更新 `DUAL_LANE_STATUS`、board、queue。 |
| `V8-CX2` External truth packet | 对外入口文案、README、已知缺口、反馈说明一致。 | 审查并改写外部可见 copy。 |
| `V8-CX3` RC acceptance packet | 建立 release candidate 稳定性与 smoke 证据。 | 审核 GLM Task 113。 |

## 3. Codex ready tasks

| Task | Status | Files | Stop condition |
| --- | --- | --- | --- |
| `V8-CX1 — External release gate sync` | ready-after-cutover | V8 docs、board、queue | V8 current status 清楚，GLM 有下一张任务。 |
| `V8-CX2 — External copy truth packet` | ready | README、V8 review docs | 文案不夸大、不误导、不碰未授权素材。 |
| `V8-CX3 — Release candidate review packet` | ready | V8 evidence ledger、review packet | build/runtime/live smoke/cleanup 证据完整。 |

## 4. Reject rules

Codex 必须拒绝：

- 把 V8 写成完整 War3 或 public release。
- 没有 live smoke 就宣称 external demo path 通过。
- 没有 cleanup / 无残留证明就宣称 release candidate stability 通过。
- 把素材来源不明的内容放进外部可见 demo。
