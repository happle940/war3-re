# V8 External Release Remaining Gates

> 用途：定义 `V8 external demo and release candidate` 必须关闭的工程 blocker、residual 和异步用户判断。  
> 来源：`V7_TO_V8` transition preheat。V8 的目标不是“完整 War3 终局”，而是让外部试玩路径和 release candidate 口径真实可用。

## 0. 当前口径

当前阶段进入后，V8 只允许围绕外部 demo / release candidate 做工程收口：

- 把 V7 beta candidate 变成外部可打开、可理解、可回收反馈的 demo 路径。
- 把稳定性从 V7 内容包提升到 release candidate 候选标准。
- 把对外文案、素材边界、分享边界和已知缺口写清。
- 不在 V8 中承诺完整四族、战役、多人大厅、ladder、完整英雄/物品/空军或未授权官方素材。

## 1. 状态词

| 状态 | 含义 |
| --- | --- |
| `preheat-open` | V8 模板已存在，但 cutover 前不能算执行中。 |
| `open` | V8 active 后仍缺工程证据。 |
| `engineering-pass` | 工程证据满足，用户或 tester 判断可异步。 |
| `blocked` | focused proof 或 release path 明确失败。 |
| `residual` | 记录债务，不阻塞 V8 工程面，除非破坏 blocker proof。 |
| `user gate` | 自动化只能准备证据，不能替用户或外部 tester 判断。 |

## 2. V8 blocker gates

| Gate | 类型 | 初始 V8 结论 | 关闭证据 |
| --- | --- | --- | --- |
| `V8-DEMO1` External demo path | demo / access proof | `V8 blocker / engineering-pass` | `tests/v8-demo-path-smoke.spec.ts` 证明普通入口初始化、开始 demo、暂停返回+重开、结果返回和范围说明可见；Codex 本地复核 build、tsc、focused smoke 5/5、cleanup、无残留通过。 |
| `V8-RC1` Release candidate stability | QA / runtime proof | `V8 blocker / engineering-pass` | `tests/v8-release-candidate-stability.spec.ts` 5/5 通过；Codex 本地复核 suite syntax、build、typecheck、focused RC、cleanup、无残留通过。该证明覆盖 V7 内容数据、训练/战斗、普通入口完整会话、HUD/命令状态和清理恢复。 |
| `V8-COPY1` External truth and scope copy | product truth / release wording | `V8 blocker / engineering-pass` | README 已更新为 V8 外部试玩候选口径；入口范围说明明确可玩内容、未实现系统、反馈方式、非完整 War3 / 非公开发布边界；`docs/V8_EXTERNAL_COPY_TRUTH_PACKET.zh-CN.md` 固定禁止夸大措辞。 |
| `V8-ASSET1` Approved asset boundary | asset / legal proof | `V8 blocker / engineering-pass` | `docs/V8_EXTERNAL_ASSET_BOUNDARY_PACKET.zh-CN.md` 已盘点当前 public/src 外部可见素材：只有 S0 fallback / project proxy；未发现官方未授权、拆包、fan remake、来源不明图片/音频/模型进入外部 demo。 |
| `V8-FEEDBACK1` Feedback capture and triage | beta ops / process proof | `V8 blocker / engineering-pass` | 入口页写明反馈方式；`docs/V8_FEEDBACK_CAPTURE_AND_TRIAGE_PACKET.zh-CN.md` 定义记录模板、P0-P5 分级、gate 回流和任务转译规则。 |

## 3. Carryover / residual into V8

| 输入 | V8 路由 | 处理规则 |
| --- | --- | --- |
| `V7-UA1` beta candidate verdict | `V8-UA1` user context | 异步保留；如果用户或 tester reject V7 beta 体验，必须路由到 V8-DEMO1 / V8-RC1 / V8-COPY1。 |
| V7 polish debt | `V8-PRES1` residual | 只有阻断外部试玩理解或 release candidate 口径时升级为 blocker。 |
| V7 packaging debt | `V8-COPY1` / `V8-DEMO1` | 如果影响用户打开、开始、理解或反馈，升级为 V8 blocker。 |
| 完整 War3 终局缺口 | `V9+` / master roadmap | 不作为 V8 blocker，除非外部文案误承诺。 |

## 4. Conditional / user gates

| Gate | 类型 | 初始结论 | 关闭或后移规则 |
| --- | --- | --- | --- |
| `V8-PRES1` Presentation polish | residual / conditional | `residual / active` | 视觉、音效、素材观感债务；只有破坏 demo 自助理解才升级为 blocker。 |
| `V8-BAL1` Balance tuning | residual / conditional | `residual / active` | 节奏、数值、AI 难度债务；只有阻断 demo / RC 稳定性才升级。 |
| `V8-UA1` External demo verdict | user gate | `user gate / user-open / async` | 用户或 tester 给出 pass / pass-with-debt / reject / defer；不阻塞工程自动推进，但必须记录。 |

## 5. V8 closeout 最低要求

| Closeout requirement | 关联 gate | 通过标准 |
| --- | --- | --- |
| 外部 demo 路径成立 | `V8-DEMO1` | 本地或部署入口可打开、可开始、可重开、可看到范围说明。 |
| release candidate 稳定性成立 | `V8-RC1` | build、typecheck、runtime pack、live smoke、cleanup 和无残留通过。 |
| 对外口径真实 | `V8-COPY1` | 文案不夸大范围，不承诺完整 War3 / public release / unauthorized assets。 |
| 素材边界可信 | `V8-ASSET1` | 外部可见素材来源、fallback、禁止项清楚。 |
| 反馈回流可执行 | `V8-FEEDBACK1` | tester 反馈能记录、分级、路由到后续 gate。 |

## 6. 当前保守结论

```text
V8 是 external demo / release candidate 阶段。
V8 工程 blocker 已清零，但 V8 不能自动宣称 public release。
V8 只剩 V8-UA1 异步用户/tester verdict，可进入下一阶段的维护与扩展跑道。
```
