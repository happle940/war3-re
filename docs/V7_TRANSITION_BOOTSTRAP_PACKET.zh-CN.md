# V7 Transition Bootstrap Packet

> 用途：记录 `V6_TO_V7` 的交接输入、残留路由、切换条件和 seed queue 边界。  
> 本文件由 `V7 content and beta candidate` preheat 产出；V7 已由 cutover 工具激活。

## 0. 当前状态

```text
transitionId: V6_TO_V7
transitionState: cutover-done
fromVersion: V6
toVersion: V7
currentMilestone: V7 content and beta candidate
activatedAt: 2026-04-15
```

当前含义：

- V6 工程 closeout 已 ready：NUM1、ID1、FA1、W3L1 均为 engineering-pass。
- `V6-UA1` 是 user-open / async，只作为 V7 人眼判断背景。
- 本 bootstrap 记录 V7 的激活来源和边界；实际激活由 `scripts/version-cutover.mjs apply` 完成。
- V7-CX1 已冻结 beta 范围；后续任务必须围绕选定内容展开。

## 1. Handoff contract

| 字段 | 当前值 |
| --- | --- |
| `northStar` | 让 War3 玩家前 5 分钟愿意认真对待它 |
| `fromVersionOutcome` | V6 War3 identity alpha |
| `toVersionFocus` | V7 content and beta candidate |
| `mustStayInFromVersion` | 任何仍 open 的 V6 blocker |
| `allowedCarryover` | V6 polish debt；V6 non-critical UX debt |
| `residualRouting` | V6 identity tuning debt -> V7 content complete tuning；V6 onboarding debt -> V7 beta usability hardening |
| `netNewBlockers` | 内容完整度达到 beta 候选；核心模式/地图/素材组合能持续 playtest；beta 级稳定性与回归面 |

## 2. Preheat 输入快照

| 输入 | 当前状态 | V7 处理规则 |
| --- | --- | --- |
| `V6-NUM1` | `engineering-pass` | 作为 V7 高级数值与战斗模型地基。 |
| `V6-ID1` | `engineering-pass` | 作为 V7 人族身份能力背景，不等于完整英雄系统。 |
| `V6-FA1` | `engineering-pass` | 作为 V7 Human 内容扩张地基。 |
| `V6-W3L1` | `engineering-pass` | 作为 V7 beta review packet 的输入，不等于 beta candidate。 |
| `V6-UA1` | `user-open / async` | 作为异步 user verdict 背景，不阻塞 V7 preheat 或 cutover。 |

## 3. Transition artifact 状态

本任务开始时，`V6_TO_V7` 缺：

- `remainingGates`: `docs/V7_CONTENT_BETA_REMAINING_GATES.zh-CN.md`
- `evidenceLedger`: `docs/V7_CONTENT_BETA_EVIDENCE_LEDGER.zh-CN.md`
- `bootstrapPacket`: `docs/V7_TRANSITION_BOOTSTRAP_PACKET.zh-CN.md`
- `codexRunway`: `docs/runways/V7_CODEX_TRANSITION_RUNWAY.zh-CN.md`
- `glmRunway`: `docs/runways/V7_GLM_TRANSITION_RUNWAY.zh-CN.md`

当前 artifact 状态：

| Artifact | 文件 | 状态 |
| --- | --- | --- |
| `remainingGates` | `docs/V7_CONTENT_BETA_REMAINING_GATES.zh-CN.md` | prepared |
| `evidenceLedger` | `docs/V7_CONTENT_BETA_EVIDENCE_LEDGER.zh-CN.md` | prepared |
| `bootstrapPacket` | `docs/V7_TRANSITION_BOOTSTRAP_PACKET.zh-CN.md` | prepared-by-this-packet |
| `codexRunway` | `docs/runways/V7_CODEX_TRANSITION_RUNWAY.zh-CN.md` | prepared |
| `glmRunway` | `docs/runways/V7_GLM_TRANSITION_RUNWAY.zh-CN.md` | prepared |

## 4. V7 接棒范围

V7 正式切换后的首批 blocker 只能来自 `content and beta candidate`：

| Gate | V7 初始角色 | 接棒证明方向 |
| --- | --- | --- |
| `V7-SCOPE1` Beta scope freeze | `V7 blocker / preheat-open` | 固定 V7 选定 Human 内容范围、禁止扩张项和后移内容。 |
| `V7-HUM1` Human content breadth | `V7 blocker / preheat-open` | 让选定 Human 建筑、单位、科技进入可玩切片。 |
| `V7-NUM2` Advanced numeric/combat model | `V7 blocker / preheat-open` | 补 projectile、target filters、caster mana、AOE、upgrade levels 等高级模型。 |
| `V7-AI1` Same-rule beta AI | `V7 blocker / preheat-open` | AI 按同一套资源、人口、前置、科技和生产规则使用 V7 内容。 |
| `V7-STAB1` Beta stability and regression | `V7 blocker / preheat-open` | 建立 beta 级 runtime / cleanup / 无残留证明。 |
| `V7-BETA1` Beta candidate review packet | `V7 blocker / preheat-open` | 形成可交给用户或 tester 的 beta candidate 审查包。 |

不得加入的 V7 blocker：

- 公开 demo、release candidate 或对外传播包装。
- 未授权官方素材、图标、音频或提取资源。
- 完整四族、完整战役、ladder、多人大厅。
- 一次性完整 War3 终局内容。
- 纯 UI polish 或视觉审美改造，除非直接阻断 beta 审查。

## 5. Seed queue 原则

V7 seed queue 只能在 transition 进入 cutover-ready 后播种。

Codex runway 只应承担：

- V7 scope freeze。
- V7 gate / ledger / bootstrap / runway 同步。
- GLM closeout review 和 takeover。
- beta candidate 审查包、已知缺口和 user verdict 路由。

GLM runway 只应承担：

- bounded Human content proof pack。
- numeric / combat model focused proof。
- same-rule AI proof。
- runtime stability proof。

禁止 seed：

- V6 继续补身份证明。
- public demo / release copy。
- 未批准素材导入。
- 无边界完整人族一次性实现。

## 6. Cutover 前检查项

| 检查项 | 通过口径 |
| --- | --- |
| V6 blocker 状态 | V6-NUM1、V6-ID1、V6-FA1、V6-W3L1 均为 engineering-pass。 |
| V6 user-open 状态 | V6-UA1 保留为人眼判断背景，不由自动化代判。 |
| V7 remaining gates | `docs/V7_CONTENT_BETA_REMAINING_GATES.zh-CN.md` 存在，且 V7 blocker 仅来自 content / beta candidate。 |
| V7 evidence ledger | `docs/V7_CONTENT_BETA_EVIDENCE_LEDGER.zh-CN.md` 存在，且不把 V6 proof 写成 V7 pass。 |
| V7 bootstrap packet | 本文件存在，并记录 cutover-blocked 起点、交接输入和禁止提前激活边界。 |
| V7 Codex runway | `docs/runways/V7_CODEX_TRANSITION_RUNWAY.zh-CN.md` 存在，且只定义 scope / review / routing / beta packet 任务。 |
| V7 GLM runway | `docs/runways/V7_GLM_TRANSITION_RUNWAY.zh-CN.md` 存在，且只定义 bounded proof packs。 |
| Live queue | cutover 后已播种 V7-CX1..CX4 与 GLM Task 107..110；Task 107 已派发给 GLM。 |

## 7. 当前保守结论

```text
V6_TO_V7 的 transition pack 已补齐并完成单步切换。
V7 已 active，seed queue 已播种。
V7 第一批主线是 Human 内容切片、高级数值/战斗模型、AI 同规则使用和 beta 稳定性。
V8 预热只有在 V7 blocker 降到阈值内时才允许启动。
```
