# M6 Private Playtest Feedback Rollup Template：私测反馈汇总模板

> 用途：把多个少量私测 session 汇总成一个 M6 决策输入。本文不替代单场 session 证据，也不批准私测扩大或公开分享。

## 1. Session List / Candidate Scope

```text
Rollup ID：
汇总日期：
汇总人：

候选记录 ID：
候选分支：
候选 commit：
部署 / 试玩链接：
构建产物或 workflow 链接：

汇总覆盖 session 数：
汇总覆盖时间范围：
用户授权状态：未授权 / 已允许少量私测 / 已允许评估公开候选
当前目标：继续私测 / 判断是否 hold / 判断是否可考虑 promotion
```

Session 列表：

| Session ID | Tester | 设备 / 浏览器 | 时长 | 单场结论 | 证据链接 |
| --- | --- | --- | --- | --- | --- |
|  |  |  |  | continue private playtest / fix then replay / hold |  |
|  |  |  |  | continue private playtest / fix then replay / hold |  |
|  |  |  |  | continue private playtest / fix then replay / hold |  |

范围说明：

```text
本 rollup 只覆盖上述候选版本和 session。不要把其他版本、历史 smoke 或未记录聊天反馈混入结论。
```

## 2. Repeated Issue Summary

只记录至少两场 session 中重复出现，或同一问题在不同 tester / 环境下复现的问题。

| Issue ID | 重复次数 | 涉及 session | Bucket | 现象摘要 | 证据 | 建议动作 |
| --- | --- | --- | --- | --- | --- | --- |
|  |  |  | P0 / P1 / P2 / P3 / P4 / P5 |  |  | queue / regression / known issues / user judgment / archive |
|  |  |  | P0 / P1 / P2 / P3 / P4 / P5 |  |  | queue / regression / known issues / user judgment / archive |

重复问题判断：

```text
最严重重复问题：
是否影响继续私测：是 / 否 / 不确定
是否影响公开候选：是 / 否 / 不确定
是否需要先补复验证据：是 / 否
```

## 3. One-off Issue Block

只出现一次的问题不要直接升级成趋势。先按证据质量处理。

| Issue ID | Session | Bucket | 是否可复现 | 证据强度 | 当前处理 |
| --- | --- | --- | --- | --- | --- |
|  |  | P0 / P1 / P2 / P3 / P4 / P5 | 是 / 否 / 不确定 | 强 / 中 / 弱 | 复验 / 记录 debt / defer / archive |
|  |  | P0 / P1 / P2 / P3 / P4 / P5 | 是 / 否 / 不确定 | 强 / 中 / 弱 | 复验 / 记录 debt / defer / archive |

一-off 处理口径：

```text
证据不足但可能严重的问题：
应先复验的问题：
可以归档的问题：
```

## 4. Blocker Tally / Debt Tally

### Blocker tally

| Blocker 类型 | 数量 | 涉及 session | 是否阻断继续私测 | 是否阻断公开 | 下一步 |
| --- | --- | --- | --- | --- | --- |
| P0 red line |  |  | 是 / 否 | 是 / 否 |  |
| P1 私测阻断 |  |  | 是 / 否 | 是 / 否 |  |
| P2 工程合同缺口 |  |  | 是 / 否 / 视严重度 | 是 / 否 |  |

### Debt tally

| Debt 类型 | 数量 | 是否已提前披露 | 是否阻断当前 lane | 是否阻断 promotion | 下一步 |
| --- | --- | --- | --- | --- | --- |
| P3 可接受私测债 |  | 是 / 否 | 否 / 是 | 是 / 否 / 视用户 |  |
| P4 用户判断项 |  | 是 / 否 | 否 | 是 / 否 / 视主题 |  |
| P5 重复 / 已覆盖 / 无效反馈 |  | 是 / 否 | 否 | 否 |  |

汇总判断：

```text
阻断继续私测的数量：
阻断 public promotion 的数量：
只需记录为债务的数量：
需要用户判断的数量：
```

## 5. Promotion Targets：该升级到哪里

把反馈转成下一步时，不直接复制 tester 原话。按下面分类：

| 目标 | 进入条件 | 本 rollup 项目 |
| --- | --- | --- |
| Queue | 有 owner、阻断级别和明确后续动作，但不一定需要新 regression。 |  |
| Regression / contract task | 可复现、能写期望行为、能用 deterministic proof 证明。 |  |
| Known Issues | 会影响 tester 理解、反馈质量或分享边界，且当前仍真实存在。 |  |
| User judgment | 属于空间感、alpha 质量、方向选择、公开分享价值等人工判断。 |  |
| Archive | 已覆盖、重复、无证据或当前不测该目标。 |  |

每个推广项至少写：

```text
Issue ID：
目标：queue / regression / known issues / user judgment / archive
原因：
证据来源：
默认 owner：
阻断级别：
```

## 6. Candidate Decision Input

### Private gate 复核

```text
build/typecheck/live openability 是否仍成立：是 / 否 / 未复核
最小控制闭环是否仍成立：是 / 否 / 不确定
最小训练闭环是否仍成立：是 / 否 / 不确定
AI 是否不是静止样机：是 / 否 / 不确定
Known Issues 是否需要更新后才能继续：是 / 否
私测说明是否需要更新后才能继续：是 / 否
```

### Promotion readiness 预判

```text
是否无 P0 red line：是 / 否
是否无会污染公开反馈的 P1/P3 debt：是 / 否 / 不确定
Known Issues 是否已足够支撑陌生 tester：是 / 否 / 不确定
README / share copy 是否已能独立设定 alpha 预期：是 / 否 / 不确定
用户是否已允许评估 public candidate：是 / 否
用户是否已批准公开分享：是 / 否
```

## 7. Final Recommendation

只选一个：

```text
final recommendation: continue private playtest / hold / consider promotion
```

### `continue private playtest`

适用条件：

- 没有 P0 red line。
- P1/P2 问题不阻断继续少量知情私测，或已有明确复验/修复路径。
- P3/P4 已披露，不会污染当前私测反馈。
- Known Issues 和私测说明足够支撑下一轮。

一句理由：

```text

```

### `hold`

适用条件：

- 存在 P0 red line。
- 多个 session 暴露同一 P1/P2 阻断项。
- Known Issues 或私测上下文缺失导致反馈失真。
- 证据不足，无法判断候选版本状态。
- 用户授权不足。

一句理由：

```text

```

### `consider promotion`

适用条件：

- private gate 持续成立。
- 多场私测没有 P0/P1 阻断项。
- repeated issues 主要是可披露 debt 或用户判断项。
- Known Issues、README/share copy、candidate evidence 已接近 public-share quality。
- 用户已允许评估公开候选；实际公开仍需用户单独批准。

一句理由：

```text

```

## 8. 结论边界

- `consider promotion` 不等于 `public share approved`。
- `continue private playtest` 不等于 `M6 passed`。
- `hold` 不等于项目失败；只表示当前候选不应继续外发。
- 没有单场 session 证据的反馈，不应进入 repeated issue 结论。
