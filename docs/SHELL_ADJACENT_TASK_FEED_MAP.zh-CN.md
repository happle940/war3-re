# Shell 邻接任务 Feed Map

> 用途：给当前 Product Shell / Session Trunk 一个固定的 next-task 捕获规则，避免 queue refill 在 shell 工作后漂移、断供或继续生成假 ready。

## 0. 当前口径

本文对应 `C78`。

当前 shell trunk 的目标不是无限扩 UI 面，而是推进：

```text
V2 credible page-product vertical slice
```

所以自动补货必须优先从已存在的 shell truth 文档旁边取任务，而不是从聊天记忆、泛 backlog 或“看起来还缺点什么”里随意生成。

一句话规则：

```text
finished shell slice -> 先问它证明了什么 -> 再决定补 implementation、acceptance、routing、integration、battlefield，或停在 user judgment。
```

## 1. 当前 shell trunk 的 source-of-truth neighbors

Queue refill 生成 shell adjacent task 时，必须先读这些邻居文档。

| 邻居文档 | 负责什么 | 可捕获的 next-task 形状 |
| --- | --- | --- |
| `docs/WAR3_PAGE_PRODUCT_MASTER_PLAN.zh-CN.md` | 页面版产品的顶层层级、S0-S8 目标状态、主线 A/B/C。 | page-product gap summary、V2/V3 shell boundary sync。 |
| `docs/PRODUCT_SHELL_STATE_MAP.zh-CN.md` | shell 状态图、当前真实状态、未成立页态。 | state graph repair、return/re-entry ordering、shell lifecycle sync。 |
| `docs/PRODUCT_SHELL_ACCEPTANCE_BRIEF.zh-CN.md` | front door、pause/results、dormant infrastructure 的总验收口径。 | acceptance brief update、claim boundary correction、closeout review task。 |
| `docs/FRONT_DOOR_ACCEPTANCE_MATRIX.zh-CN.md` | front door 当前证明、manual map entry、V3+ 边界。 | front-door review checklist、re-entry/source truth task。 |
| `docs/MODE_SELECT_ACCEPTANCE_MATRIX.zh-CN.md` | mode-select placeholder 的 enabled / disabled / absent 边界。 | mode-select placeholder review、disabled branch proof、fake mode rejection。 |
| `docs/SESSION_SHELL_GAP_ROUTING.zh-CN.md` | pause/setup/results/return/re-entry 的 GLM-safe、Codex-only、user-judgment 路由。 | return-to-menu slice、re-entry slice、results-summary slice、routing sync。 |
| `docs/SHELL_SECONDARY_SURFACE_ACCEPTANCE.zh-CN.md` | settings、help/controls、loading/briefing 的二级 surface 验收。 | settings/help/briefing acceptance, GLM-safe prompt, dormant rejection task。 |
| `docs/SHELL_INTEGRATION_CADENCE` 对应内容 | shell slice 未 review 上限、何时 stop-to-integrate、regression pack。 | integration review、regression-pack sync、queue pause/refill correction。 |
| `docs/PRODUCT_SHELL_ASSET_INTAKE_MATRIX.zh-CN.md` | shell 素材 intake、legal/tone/fallback/approval 边界。 | shell asset approval prep、fallback-only shell asset task。 |
| `docs/ASSET_APPROVAL_HANDOFF_PACKET.zh-CN.md` | Codex 批准后交给 GLM 导入的固定 packet。 | asset handoff packet completion/rejection task。 |
| `docs/V2_PAGE_PRODUCT_REMAINING_GATES.zh-CN.md` | V2 剩余 gate 汇总，若存在则优先作为 closeout 判断。 | remaining-gate closure、evidence ledger sync。 |

如果某个邻居文档还不存在，不能凭空推断；只能生成一个 Codex-owned source-of-truth task，或者把候选写入 `TASK_CAPTURE_INBOX`。

## 2. GLM shell slice 完成后的分支规则

每次 GLM 完成 shell 相关 slice，Codex closeout 必须按下面顺序分支。

| 观察到的结果 | 下一步分支 | 可自动补 live queue 吗 |
| --- | --- | --- |
| implementation 完成，focused regression 通过，claim 边界清楚 | `review / integration`：更新 acceptance、routing 或 remaining-gates 事实。 | 可以。 |
| implementation 完成，但 closeout 把 DOM、按钮或 green test 写成产品完成 | `acceptance correction`：补验收矩阵、review checklist 或 wording reality sync。 | 可以，docs-only。 |
| implementation 暴露新 seam，例如 return、re-entry、source truth、disabled branch | `routing work`：补 gap routing 或明确 GLM-safe next slice。 | 可以，前提是不需要用户判断。 |
| implementation 失败或 regression 缺关键路径 | `repair / proof`：生成更小 GLM-safe implementation 或 focused regression task。 | 可以，但必须有 allowed files 和 verification。 |
| slice 触及 settings/help/briefing/mode-select 的产品承诺 | `Codex truth work`：先补 acceptance/routing，再派实现。 | 可以，docs-only。 |
| 需要判断“是否好懂、够像产品、能否公开说成立” | `user judgment`：准备 gate/evidence，不自动派实现。 | 不可以；只能 capture 为 blocked/user-gate。 |
| 涉及素材来源、许可、官方相似、asset import | `asset governance`：走 intake 或 handoff packet。 | 只有 packet/docs task 可自动补；导入 task 需 approved packet。 |

分支优先级：

1. 先收口当前 slice 的 truth。
2. 再补缺失 regression 或 acceptance。
3. 再派下一个 GLM-safe implementation。
4. 最后才扩到新 surface。

## 3. 何时继续留在 shell trunk

Queue refill 应继续生成 shell 任务，当满足任一条件：

- top queue 中 shell ready 数低于 floor，且 shell neighbor docs 里还有未关闭的 V2 gate。
- GLM 刚完成 front-door、pause/results、return-to-menu、mode-select、settings/help/briefing 相关 slice。
- closeout residuals 提到 `dormant infrastructure`、`fake product claim`、`source truth`、`disabled branch`、`return path`、`stale shell`、`loading/briefing`、`settings/help`。
- `V2` page-product closeout 仍缺 front-door、session shell、return/re-entry、secondary surface truth 或 public wording reality。
- 已存在 GLM-safe next slice，且 Codex 已经写清 allowed files、forbidden files、verification 和 reject conditions。

shell 任务应优先选择这些形状：

1. acceptance matrix / review checklist
2. gap routing / state map sync
3. focused GLM-safe implementation dispatch packet
4. integration cadence / regression pack sync
5. remaining gate closure evidence

## 4. 何时转向 battlefield readability

Queue refill 可以从 shell 转向 battlefield readability，当满足全部条件：

- 当前 shell trunk 没有安全 `ready` work，或下一步需要用户产品判断。
- battlefield / asset neighbor docs 存在明确 approved intake、fallback-only task 或 readability gate。
- 该任务不需要修改 shell 允许文件，也不会扩大当前 shell ownership。
- 任务能服务 `V2` 或 `V3` 的真实 battlefield readability gap，而不是泛视觉愿望。

可转向的 battlefield 任务形状：

- battlefield remaining gate summary
- approved A1 packet completion / rejection
- fallback-only readability proof
- import handoff review
- first-look readability evidence checklist

不可转向：

- 未批准素材导入。
- 官方相似或来源不清资产。
- “让战场更像 War3”这种没有 intake/gate 的泛任务。

## 5. 何时等待用户判断

Queue refill 必须停止自动 promotion，改为 blocked/user-gate，当 next task 主要依赖这些判断：

- front door 第一眼是否清楚。
- mode-select 的 disabled/absent 取舍是否符合产品意图。
- settings/help/briefing 文案是否真的降低理解成本。
- pause/results 是否让玩家理解当前会话状态。
- shell 视觉是否可信、不误导、不像素材拼贴。
- README / release wording 能否进入私测或公开分享语气。
- 是否接受某个残余缺口作为 V2 debt。

此时可以自动生成的只有：

- gate packet
- evidence checklist
- user review script
- decision record template

不能自动生成 implementation task 来绕过判断。

## 6. 自动 live-queue promotion 的合法 candidate 形状

只有满足下面形状的候选，才可以从 capture / neighbor docs 自动升到 live queue。

| Candidate shape | 必填字段 | 可 promotion 条件 |
| --- | --- | --- |
| `docs-acceptance-matrix` | goal、allowed docs、must satisfy、diff check。 | 只收紧真值口径，不需要用户 judgment。 |
| `docs-routing-pack` | gap family、GLM-safe/Codex-only/user-gate 分类、verification。 | 来源来自已完成 slice residual 或 state map 缺口。 |
| `review-checklist` | review target、reject rules、regression floor、allowed docs。 | 用于防止 GLM closeout 过度声明。 |
| `implementation-dispatch-packet` | exact allowed files、forbidden files、focused regression、reject conditions。 | 已有 acceptance/routing 文档支撑，且不需要产品判断。 |
| `integration-sync` | touched truth docs、queue sync target、diff check。 | 未 review shell slice 数量触达 cadence 上限或出现冲突真相。 |
| `remaining-gate-ledger` | gate list、evidence required、engineering vs user judgment。 | 用于 V2/V3 closeout，不直接改变 runtime。 |
| `asset-handoff-docs` | intake matrix、approval packet、fallback、hard reject sweep。 | 只处理批准证据；不导入未批准资产。 |
| `user-gate-packet` | user question、evidence checklist、decision outcomes。 | 状态必须是 `blocked`，不能标 `ready`。 |

必须具备的通用字段：

- `Task title`
- `Status`
- `Goal`
- `Allowed files`
- `Must satisfy`
- `Verification`
- `Closeout requirements`
- `Why now`
- `Source neighbor`

缺任一字段时，不自动 promotion；写入 captured inbox。

## 7. 禁止自动 promotion 的候选

下面候选即使看起来合理，也不能自动进入 live queue。

| 候选 | 原因 |
| --- | --- |
| `make shell feel better` | 没有 source-of-truth neighbor、验收和文件边界。 |
| `finish settings` | 可能包含产品判断和偏好系统，不是单 slice。 |
| `add full mode select` | 会越过 V2/V3 边界。 |
| `import shell assets` | 没有 approved handoff packet 前不可派。 |
| `make it War3-like` | 太宽，且可能引入 IP / parity 误导。 |
| `fix all stale state` | 没有 focused seam 和 regression。 |
| `public share polish` | 需要 release gate 和用户判断。 |
| `campaign / multiplayer / full race select` | later strategic depth，不是当前 shell trunk ready。 |

## 8. Refill 决策表

| 当前信号 | Refill 动作 |
| --- | --- |
| shell ready < floor，且有 neighbor-backed shell candidate | 补 shell task。 |
| GLM shell slice just completed，claim 未 review | 补 Codex review/integration task。 |
| GLM shell slice exposed deterministic next seam | 补 GLM-safe implementation dispatch packet。 |
| shell truth docs 冲突或缺 acceptance | 补 docs acceptance/routing task。 |
| shell next step 需要用户判断 | 补 blocked user-gate/evidence task，不补 ready implementation。 |
| shell 安全任务耗尽，但 battlefield 有 approved readability/handoff work | 转 battlefield readability。 |
| shell 和 battlefield 都没有安全 ready | 补 remaining-gates 或 captured-inbox triage，不派假 ready。 |

## 9. 当前推荐顺序

截至当前 shell truth 文档，自动 refill 的安全顺序是：

1. `C79`：汇总 V2 page-product remaining gates。
2. front-door/session summary 这类不改 runtime 的 acceptance matrix。
3. mode-select placeholder review checklist。
4. return-to-menu / re-entry 的 GLM-safe dispatch packet。
5. help/controls 或 loading/briefing minimal proxy 的 GLM-safe dispatch packet。
6. 若以上需要用户判断，转成 user gate packet。
7. 若 shell 被用户判断阻塞，再转 battlefield readability / asset handoff 邻近任务。

## 10. 一句话结论

```text
shell queue refill 不再从“下一眼看起来缺什么”取任务；
它从 shell truth 邻居、GLM closeout residual、remaining gates 和 user-judgment 边界中取任务。
能证明、能限界、能验证，才进 live queue。
```
