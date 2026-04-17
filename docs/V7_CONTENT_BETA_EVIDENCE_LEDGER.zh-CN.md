# V7 Content Beta Evidence Ledger

> 用途：记录 `V7 content and beta candidate` 的工程证据、用户判断证据和当前状态。  
> 上游 gate 清单：`docs/V7_CONTENT_BETA_REMAINING_GATES.zh-CN.md`。  
> 本文件由 `V6_TO_V7` preheat 产出；V7 已在 `2026-04-15` 激活。

## 0. 使用规则

| 状态 | 含义 |
| --- | --- |
| `preheat-open` | 模板已存在，等待 V7 cutover 后执行。 |
| `open` | V7 active 后仍缺工程证据。 |
| `engineering-pass` | 工程证据满足。 |
| `blocked` | proof 失败。 |
| `insufficient-evidence` | 证据不足。 |
| `residual` | 不阻塞当前工程 closeout 的债务。 |
| `user-open` | 需要用户或目标 tester 判断。 |

更新规则：

- 每条 V7 blocker 必须绑定具体文件、focused command、state log、截图包或 review packet。
- 不能把 V6 的 NUM1 / ID1 / FA1 / W3L1 证据直接写成 V7 通过；它们只作为地基。
- 每次 GLM closeout 必须由 Codex 本地复核后才能改成 `engineering-pass`。
- 用户判断可以异步，但不能被自动化代判。

## 1. V7 blocker evidence ledger

| Gate | 当前状态 | 必需工程证据 | 必需用户判断证据 | 当前结论 |
| --- | --- | --- | --- | --- |
| `V7-SCOPE1` Beta scope freeze | `engineering-pass` | V7-CX1 已冻结范围：Lumber Mill + Guard Tower、Arcane Sanctum + Priest、Workshop + Mortar Team、AI 同规则使用至少一条已证明内容；完整人族其余内容后移。 | 用户或目标 tester 可异步判断这个 beta 范围是否足够，但不阻塞工程推进。 | 范围已冻结，后续任务不得无限扩张 V7。 |
| `V7-HUM1` Human content breadth | `engineering-pass` | 选定 Human 建筑、单位、科技的真实数据、前置、命令卡、runtime proof 和玩家可见状态。 | 用户或目标 tester 判断 Human 内容是否像一个 beta candidate 的内容范围。 | Task 107 塔线、Task 108 法师线、Task 109 工程线均已 Codex accepted。 |
| `V7-NUM2` Advanced numeric/combat model | `engineering-pass` | projectile、target filters、caster mana、AOE、upgrade levels 等高级模型的 data-driven proof。 | 用户或目标 tester 判断这些模型是否支撑可理解的战斗和选择。 | Mortar AOE/filter 与 Priest caster mana 均已 Codex accepted。 |
| `V7-AI1` Same-rule beta AI | `engineering-pass` | AI 使用 V7 选定内容的 build / train / research / combat proof，且不跳过资源、人口、前置或科技。 | 用户或目标 tester 判断 AI 是否让短局可持续 playtest。 | Task 110 已 accepted：AI 按同规则使用 Tower / Workshop / Mortar 内容，并保留开局压制节奏。 |
| `V7-STAB1` Beta stability and regression | `engineering-pass` | build、typecheck、focused runtime、相关 runtime pack、cleanup、无残留进程和已知缺口记录。 | 用户或 tester 反馈严重 bug 是否阻断 beta candidate。 | Task 111 已由 Codex 接管接受：稳定性包 5/5、完整 V7 内容包 31/31、cleanup 后无 runtime 残留。 |
| `V7-BETA1` Beta candidate review packet | `engineering-pass` | beta candidate 审查包：可玩内容、证明命令、已知缺口、不可对外承诺范围、人眼问题。 | 用户或目标 tester 给出 beta candidate verdict。 | `docs/V7_BETA_CANDIDATE_REVIEW_PACKET.zh-CN.md` 已 candidate-ready；用户 verdict 异步保留。 |

## 1.1 V7-CX1 scope freeze evidence

| 项 | 证据 |
| --- | --- |
| 完成时间 | `2026-04-15 10:36:52 CST` |
| 证据文件 | `docs/V7_CONTENT_BETA_REMAINING_GATES.zh-CN.md` §2.1；`docs/HUMAN_RACE_PARITY_AND_NUMERIC_SYSTEM.zh-CN.md` §6 |
| 冻结范围 | Lumber Mill + Guard Tower；Arcane Sanctum + Priest；Workshop + Mortar Team；AI 同规则使用至少一个已证明内容。 |
| 明确后移 | 完整英雄、物品商店、空军、完整 T3、完整 Sanctum / Workshop 全单位、公开 demo、release candidate 和未授权素材。 |
| 当前任务绑定 | GLM Task 107 正在执行第一条 Lumber Mill / tower branch 切片；Codex 下一步是 V7-CX2 证明矩阵。 |
| 状态结论 | `V7-SCOPE1` 工程面通过；用户或 tester 对范围是否“够 beta”可以异步反馈并回流。 |

## 1.2 V7-CX2 Human content proof matrix evidence

| 项 | 证据 |
| --- | --- |
| 完成时间 | `2026-04-15 10:36:52 CST` 后续同轮更新 |
| 证据文件 | `docs/V7_CONTENT_BETA_REMAINING_GATES.zh-CN.md` §2.2 |
| 覆盖对象 | Lumber Mill、Guard Tower 最小塔线、Arcane Sanctum、Priest、Workshop、Mortar Team、V7 AI content use。 |
| 验收维度 | 数据、前置、命令卡、runtime proof、玩家可见状态。 |
| 当前状态 | 矩阵已建立；Task 107 / 108 / 109 均已完成 Codex 本地复核，V7-HUM1 工程面通过。 |
| 风险控制 | Task 107 已被明确禁止改 `BuildingVisualFactory.ts`；视觉代理不能替代 gameplay proof。 |

### V7-HUM1-A accepted proof: Lumber Mill + Guard Tower

| 项 | 证据 |
| --- | --- |
| 任务 | `Task 107 — Lumber Mill 与塔分支最小可玩切片` |
| 状态 | `accepted` |
| 本地复核时间 | `2026-04-15` |
| 证明文件 | `tests/v7-lumber-mill-tower-branch-proof.spec.ts` |
| 证明内容 | Lumber Mill 有真实数据；Tower 的 `techPrereq` 来自数据；缺 Lumber Mill 时命令卡禁用并给出原因；Lumber Mill 完成后 Tower 可用；dispose/reload 后无 stale prerequisite cache。 |
| 复核命令 | `npm run build`；`npx tsc --noEmit -p tsconfig.app.json`；focused runtime 6/6；`tests/command-surface-regression.spec.ts` 13/13；cleanup。 |
| V7-HUM1 影响 | 塔线第一条内容 accepted；V7-HUM1 当时仍需 Priest / Mortar 线 proof。 |
| 过程问题 | GLM 初始越界修改 `BuildingVisualFactory.ts`，已被 Codex 打断并撤回；见 `DL-2026-04-15-09`。 |

### V7-HUM1-B accepted proof: Workshop + Mortar Team

| 项 | 证据 |
| --- | --- |
| 任务 | `Task 109 — Workshop / Mortar 战斗模型切片` |
| 状态 | `accepted` |
| 本地复核时间 | `2026-04-15 11:31:09 CST` |
| 证明文件 | `tests/v7-workshop-mortar-combat-model-proof.spec.ts` |
| 证明内容 | `Workshop` 有真实建筑数据和训练入口；命令卡能通过正常训练队列训练 `Mortar Team`；`Mortar Team` 使用 `AttackType.Siege`、更长射程和 AOE/filter 行为，不是换名 Footman/Rifleman。 |
| 复核命令 | `npm run build`；`npx tsc --noEmit -p tsconfig.app.json`；`./scripts/run-runtime-tests.sh tests/v7-workshop-mortar-combat-model-proof.spec.ts --reporter=list` 3/3；相关回归 `tests/v6-attack-armor-type-proof.spec.ts`、`tests/v7-lumber-mill-tower-branch-proof.spec.ts`、`tests/command-surface-regression.spec.ts` 共 23/23。 |
| V7-HUM1 影响 | 工程线 accepted；V7-HUM1 当时仍需 Priest 法师线 proof。 |
| V7-NUM2 影响 | `projectile / AOE / target filter` 中的 AOE + target filter 已有 focused proof；V7-NUM2 当时仍需 Priest caster mana。 |
| 过程问题 | GLM 在 Task 109 中卡入可选 UI/显示名细节并使用了不该用的脚本编辑方式；Codex 停止 GLM、取消 job 后接管完成。见 `DL-2026-04-15-12`。 |

### V7-HUM1-C accepted proof: Arcane Sanctum + Priest

| 项 | 证据 |
| --- | --- |
| 任务 | `Task 108 — Arcane Sanctum 法师基础切片` |
| 状态 | `accepted` |
| 本地复核时间 | `2026-04-15 12:57:34 CST` |
| 证明文件 | `tests/v7-arcane-sanctum-caster-proof.spec.ts` |
| 证明内容 | `Arcane Sanctum` 有真实建筑数据、Barracks 前置和训练入口；命令卡能通过正常训练队列训练 `Priest`；`Priest` 有 mana / regen / cooldown / heal range / HUD 状态；Heal 消耗 mana、进入冷却、回复友军、拒绝敌方、满血、无 mana、冷却和越界目标。 |
| Codex 补强 | GLM closeout 后，Codex 补了 `castHeal` 的敌方目标拦截，并把 proof 从“数据存在”加固为“Arcane Sanctum 命令卡正常训练 Priest”。 |
| 复核命令 | `npm run build`；`npx tsc --noEmit -p tsconfig.app.json`；`./scripts/run-runtime-tests.sh tests/v7-arcane-sanctum-caster-proof.spec.ts --reporter=list` 9/9；相关回归 `tests/command-surface-regression.spec.ts`、`tests/v7-lumber-mill-tower-branch-proof.spec.ts`、`tests/v7-workshop-mortar-combat-model-proof.spec.ts`、`tests/v7-ai-same-rule-content-proof.spec.ts` 共 30/30。 |
| V7-HUM1 影响 | 塔线、法师线、工程线均已 accepted，V7-HUM1 工程面通过。 |
| V7-NUM2 影响 | Priest caster mana 与 Mortar AOE/filter 均已 accepted，V7-NUM2 工程面通过。 |
| 过程问题 | GLM 一度转向视觉工厂探索，Codex 已明确收回文件边界；GLM build/tsc 使用了 tail 截断，Codex 已全量本地重跑。见 `DL-2026-04-15-15`。 |

## 1.3 V7-CX3 advanced numeric / combat model plan evidence

| 项 | 证据 |
| --- | --- |
| 完成时间 | `2026-04-15 10:36:52 CST` 后续同轮更新 |
| 证据文件 | `docs/V7_CONTENT_BETA_REMAINING_GATES.zh-CN.md` §2.3；`docs/HUMAN_RACE_PARITY_AND_NUMERIC_SYSTEM.zh-CN.md` §6 |
| V7 选定模型 | `caster mana` 绑定 Priest；`projectile / AOE / target filter` 绑定 Mortar Team。 |
| 验收规则 | 必须有数据入口、行为入口、玩家可见状态和 focused runtime；不能只靠字段、按钮或单场胜负。 |
| 当前状态 | Mortar AOE/filter 已通过 Task 109 accepted；Priest caster mana 已通过 Task 108 accepted，V7-NUM2 工程面通过。 |
| 风险控制 | 禁止在 `Game.ts` 继续散落一次性单位常量；需要扩展共享 combat / ability path 时，优先做小 helper 和 focused proof。 |

## 1.4 V7-AI1 accepted proof: AI same-rule V7 content use

| 项 | 证据 |
| --- | --- |
| 任务 | `Task 110 — V7 内容 AI 同规则使用切片` |
| 状态 | `accepted` |
| 本地复核时间 | `2026-04-15` |
| 证明文件 | `tests/v7-ai-same-rule-content-proof.spec.ts` |
| 证明内容 | AI 使用同一套资源、人口、前置和训练规则接入 V7 内容；不会直接 spawn V7 建筑；Tower 前置仍由完成的 Lumber Mill 控制；Workshop 训练 Mortar 仍走正常训练队列；Mortar 计入 AI 军事单位。 |
| 节奏修复 | Codex 接管时发现 GLM 初版会让 AI 在第一波前把资源投进工人、铁匠铺和 V7 扩展，导致中期进攻波断流；已改为开局工人 cap 包含训练队列、昂贵科技保留第一波兵力预算、V7 伐木场/塔/车间扩展在两波进攻后展开。 |
| 复核命令 | `npm run build`；`npx tsc --noEmit -p tsconfig.app.json`；Task110 focused + 第一/第二波关键回归 10/10；相关回归 `tests/ai-economy-regression.spec.ts`、`tests/v5-human-ai-rifleman-composition.spec.ts`、`tests/v7-workshop-mortar-combat-model-proof.spec.ts` 共 18/18；cleanup 后无 runtime 残留。 |
| V7-AI1 影响 | `engineering-pass`。AI 同规则使用至少一个 V7 已证明内容的 blocker 已关闭。 |
| 过程问题 | GLM proof-5 两次失败并使用 tail 截断输出，Codex 取消 job 后接管完成；见 `DL-2026-04-15-14`。 |

## 1.5 V7-CX4 beta review packet framework evidence

| 项 | 证据 |
| --- | --- |
| 完成时间 | `2026-04-15 10:44:29 CST` |
| 证据文件 | `docs/V7_BETA_CANDIDATE_REVIEW_PACKET.zh-CN.md` |
| 当前状态 | `framework-open`，不是 `candidate-ready`。 |
| 关闭条件 | 只有 V7-HUM1、V7-NUM2、V7-AI1、V7-STAB1 都有 Codex accepted 工程证据后，才允许推进 V7-BETA1。 |
| 风险控制 | 本文件明确禁止把 V7 说成完整人族、public demo 或 release candidate。 |

## 1.6 V7-STAB1 accepted proof: V7 beta stability regression

| 项 | 证据 |
| --- | --- |
| 任务 | `Task 111 — V7 beta 稳定性回归包` |
| 状态 | `accepted` |
| 本地复核时间 | `2026-04-15` |
| 证明文件 | `tests/v7-beta-stability-regression.spec.ts` |
| 证明内容 | V7 accepted 内容在同一 runtime 中共存：数据连接、训练命令路径、Priest Heal 过滤、Mortar AOE/filter、HUD/命令卡状态、dispose/reset 清理恢复。 |
| suite 接入 | `scripts/run-runtime-suite.sh` 新增 `v7-content` 分片，包含 Task 107、108、109、110 和 Task111 稳定性包。 |
| 复核命令 | `npm run build`；`npx tsc --noEmit -p tsconfig.app.json`；`./scripts/run-runtime-tests.sh tests/v7-beta-stability-regression.spec.ts --reporter=list` 5/5；`bash -n scripts/run-runtime-suite.sh`；完整 V7 内容包 `tests/v7-lumber-mill-tower-branch-proof.spec.ts`、`tests/v7-workshop-mortar-combat-model-proof.spec.ts`、`tests/v7-arcane-sanctum-caster-proof.spec.ts`、`tests/v7-ai-same-rule-content-proof.spec.ts`、`tests/v7-beta-stability-regression.spec.ts` 共 31/31。 |
| cleanup | `./scripts/cleanup-local-runtime.sh` 后，`pgrep -fl 'vite|playwright|chrome-headless|Chromium|run-runtime-tests|node .*vite'` 无输出。 |
| V7-STAB1 影响 | `engineering-pass`。当前只剩 V7-BETA1 审查包工程收口。 |
| 过程问题 | GLM 初版提前把 `V7-STAB1` 写成通过、使用 tail 截断 build、且在 `page.evaluate` 中误读 Node import；Codex 取消 job 后接管修复。见 `DL-2026-04-15-16`。 |

## 1.7 V7-BETA1 accepted proof: beta candidate review packet

| 项 | 证据 |
| --- | --- |
| 任务 | `V7-BETA1 — Beta candidate 审查包工程收口` |
| 状态 | `engineering-pass` |
| 本地收口时间 | `2026-04-15 13:15:52 CST` |
| 证明文件 | `docs/V7_BETA_CANDIDATE_REVIEW_PACKET.zh-CN.md` |
| 证明内容 | 审查包已列出 V7 可玩内容、验证命令、已知缺口、不可对外承诺范围和异步人眼判断入口。 |
| 前置证据 | Task 107、108、109、110、111 均已 accepted；V7-HUM1、V7-NUM2、V7-AI1、V7-STAB1 均已工程通过。 |
| 当前限制 | 这不是 public demo，也不是 release candidate；完整英雄、商店、空军、完整 T3、完整 Workshop / Sanctum 全单位和真实授权素材仍后移。 |
| 用户判断 | `V7-UA1` 保持 user-open / async；用户或 tester 后续 reject 时按审查包路由回对应 gate。 |

## 2. V6 handoff evidence

| 输入 | 当前状态 | V7 路由 | 当前结论 |
| --- | --- | --- | --- |
| `V6-NUM1` Human numeric foundation | `engineering-pass` | V7-NUM2 地基 | 数据驱动数值底座可复用，但 V7 仍要补高级模型。 |
| `V6-ID1` identity ability | `engineering-pass` | V7-HUM1 / V7-BETA1 context | 人族集结号令可作为身份能力背景，不等于完整英雄或物品系统。 |
| `V6-FA1` Footman / Rifleman identity | `engineering-pass` | V7-HUM1 context | Footman/Rifleman 差异可作为 V7 内容扩张地基。 |
| `V6-W3L1` identity first-look packet | `engineering-pass` | V7-BETA1 context | 第一眼身份审查包可作为 beta 审查输入，不等于 beta candidate。 |
| `V6-UA1` identity verdict | `user gate / user-open / async` | V7-UA1 context | 异步保留；若用户 reject，必须回流到对应 V7 proof 失败面。 |

## 3. Conditional / user evidence ledger

| Gate | 当前状态 | 必需工程证据 | 必需用户判断证据 | 当前结论 |
| --- | --- | --- | --- | --- |
| `V7-BAL1` Beta balance carryover | `residual / active` | 只有破坏 V7-HUM1、V7-AI1 或 V7-BETA1 时才绑定具体 proof。 | 用户或 tester 判断节奏是否阻断 beta。 | 不单独生成纯平衡 blocker。 |
| `V7-PRES1` Presentation and asset quality | `residual / active` | 可读性、素材和表现问题必须绑定到 beta 审查失败面。 | 用户或 tester 判断是否影响理解。 | 不用真实素材或 polish 替代 gameplay proof。 |
| `V7-ONB1` Beta onboarding clarity | `residual / active` | 若 tester 无法开始或无法知道目标，绑定到 V7-BETA1。 | 用户或 tester 判断是否能自助试玩。 | 不抢内容主线，除非阻断 beta candidate。 |
| `V7-UA1` Beta candidate verdict | `user gate / user-open / async` | V7-SCOPE1、HUM1、NUM2、AI1、STAB1、BETA1 的工程证据包。 | 用户或目标 tester 给出 `pass`、`pass-with-debt`、`reject` 或 `defer`。 | 自动化不能代判 beta candidate 是否成立。 |

## 4. 当前保守结论

```text
V7 已 active。
V7-SCOPE1 已工程通过，范围不再继续扩张。
V6 工程证据只能作为 V7 地基，不能直接关闭 V7-HUM1 / NUM2 / AI1 / STAB1 / BETA1。
V7-SCOPE1、V7-HUM1、V7-NUM2、V7-AI1、V7-STAB1、V7-BETA1 已工程通过；V7-UA1 保持异步用户判断入口。
```

## 5. 更新模板

```text
Gate:
State before:
Engineering evidence:
User evidence:
State after:
Residual debt:
Next owner:
```
