# V6 Identity Systems Evidence Ledger

> 用途：记录 `V6 War3 identity alpha` 的工程证据、用户判断证据和当前状态。  
> 上游 gate 清单：`docs/V6_IDENTITY_SYSTEMS_REMAINING_GATES.zh-CN.md`。  
> 本文件最初由 `V5_TO_V6` preheat 生成；V6 已在 `docs/VERSION_RUNTIME_STATE.json` 激活，现在记录 V6 当前证据状态。

## 0. 使用规则

| 状态 | 含义 |
| --- | --- |
| `open` | V6 active 后仍未有足够 runtime proof 关闭。 |
| `engineering-pass` | 工程证据已满足，但用户判断可能仍未完成。 |
| `blocked` | focused proof 明确失败。 |
| `insufficient-evidence` | 有部分证据，但不足以关闭 gate。 |
| `carryover` | 从 V5 带入 V6 的非阻断债务。 |
| `residual` | 不阻塞 V6 工程 closeout，但必须记录路由。 |
| `user-open` | 需要用户或目标 tester 判断。 |

更新规则：

- `V5-ECO1`、`V5-TECH1`、`V5-COUNTER1`、`V5-HUMAN1` 已在 V5 内收口为工程通过。
- `V5-HUMAN1` 的 Task 104 / Task 105 / Task 106 三段 proof 只能作为 V6 数值系统样本输入；不能写成完整人族或 V6 identity proof。
- 若任何 V5 blocker 在 cutover 前仍 open，也必须留在 V5，不能写成 V6 identity proof。
- 每次 V6 active 后的更新必须绑定 focused command、state log、截图包、review packet 或明确的人眼结论。
- V5 carryover 只能作为 `V6-BAL0`、`V6-PRES0` 或具体 V6 blocker 的 proof context；不能抢占 V6 blocker 定义。

## 1. V6 blocker evidence ledger

| Gate | 当前状态 | 必需工程证据 | 必需用户判断证据 | 当前结论 |
| --- | --- | --- | --- | --- |
| `V6-NUM1` Human numeric foundation | `engineering-pass` | 统一 unit/building/research/ability numeric schema、attackType / armorType 字段、research effect model、命令卡数值展示、focused regression。 | 用户或目标 tester 判断数值表达是否支撑人族身份，而不是只是一堆临时字段。 | NUM-A 字段盘点、NUM-B 基础账本、NUM-F proof 计划、NUM-C 攻击/护甲 runtime proof、NUM-D 研究效果数据模型 proof、NUM-E 玩家可见数值提示 proof 均已完成并经 Codex 本地复核；V6-NUM1 工程通过。 |
| `V6-ID1` Hero / spell / item identity systems | `engineering-pass` | 至少一个英雄、法术、物品或等价身份系统的可见状态、触发方式、效果反馈、限制条件、focused regression。 | 用户或目标 tester 判断该系统是否形成可理解的 War3-like 身份表达。 | 人族集结号令最小证明包已完成并经 Codex 本地接管复核：可见状态、触发、有限效果、冷却限制、反馈和 cleanup 均有 focused proof；build、typecheck、相关 runtime 30/30 通过。 |
| `V6-FA1` Faction or unit identity difference | `engineering-pass` | 至少一组阵营/单位/兵种差异的读图、能力、生产/使用选择或战斗角色 proof、state log、focused regression。 | 用户或目标 tester 判断身份差异是否可被看懂。 | Footman / Rifleman 角色差异证明包已由 Codex 接管修正并本地复核通过：数据来源、生产选择、可见差异、战斗角色和 Long Rifles 远程定位均有 runtime proof。 |
| `V6-W3L1` War3-like identity first-look | `engineering-pass` | ID1、FA1 的工程证据、默认视角截图或 state log、review checklist、first-look packet。 | 用户或目标 tester 判断当前 slice 是否更像 War3-like。 | `docs/V6_WAR3_IDENTITY_FIRST_LOOK_REVIEW_PACKET.zh-CN.md` 已合并 NUM1、ID1、FA1 三类证据并明确不证明完整 War3；工程面通过，V6-UA1 仍异步。 |

## 1.5 V6-NUM1 seed evidence

| 字段 | 记录 |
| --- | --- |
| Seed item | `C93 — V6-NUM1 数值系统任务种子包` |
| File | `docs/V6_NUMERIC_SYSTEM_TASK_SEED.zh-CN.md` |
| State before | V6 有 NUM1 大目标，但没有第一批可派发任务链。 |
| Evidence added | 种子包定义 `NUM-A` 人族数值字段盘点、`NUM-B` 单位与建筑基础账本、`NUM-C` 攻击类型与护甲类型最小模型、`NUM-D` 研究效果数据模型、`NUM-E` 玩家可见数值提示、`NUM-F` 数值底座证明计划。 |
| What it proves | V6 不会在 V5-HUMAN1 之后断供，也不会直接跳到 V7 内容堆叠；下一批任务有固定顺序和停止条件。 |
| What it does not prove | 不证明 V6 已 active，不证明 runtime 已有数值系统，不关闭 V5-HUMAN1，不实现完整人族。 |
| Next owner | V5-HUMAN1 工程收口后，Codex 先派 `NUM-A`，再按证据派 `NUM-B` 和 GLM 小切片。 |

## 1.6 V6-NUM1 progress evidence

| Item | 状态 | Evidence | What it proves | What it does not prove |
| --- | --- | --- | --- | --- |
| `NUM-A` 人族数值字段盘点 | `done` | `docs/V6_NUMERIC_SCHEMA_INVENTORY.zh-CN.md` | unit / building / research / ability 四类 schema、attackType / armorType、research effect、命令卡展示和 AI 权重字段位置已写清。 | 不证明 runtime 已使用这些字段。 |
| `NUM-B` 单位与建筑基础账本 | `done` | `docs/V6_HUMAN_NUMERIC_LEDGER.zh-CN.md` | Peasant、Footman、Rifleman、Town Hall、Farm、Barracks、Blacksmith、Scout Tower、Long Rifles 的当前数值和 V6 目标增量已进入账本。 | 不证明实际战斗、研究或 UI 已按账本执行。 |
| `NUM-C` 攻击类型与护甲类型最小模型 | `engineering-pass` | GLM job `glm-mnzbkz0a-4uflqz`；Codex 本地复核 `npm run build`、`npx tsc --noEmit -p tsconfig.app.json`、`./scripts/run-runtime-tests.sh tests/v6-attack-armor-type-proof.spec.ts --reporter=list` 4/4 passed；cleanup complete。 | attackType / armorType 字段、集中倍率表、`dealDamage()` 组合护甲公式和 focused runtime proof 已成立。 | 只证明攻击/护甲最小模型；不证明 research effect model、可见数值提示或完整 War3 攻防表。 |
| `NUM-D` 研究效果数据模型 | `engineering-pass` | `src/game/GameData.ts` / `src/game/Game.ts` / `tests/v6-research-effect-model-proof.spec.ts` | Long Rifles 已迁移到 `ResearchDef.effects[]`；研究完成由通用 `applyResearchEffects` 应用；新训练 Rifleman 通过 completed research 数据得到同一效果；Codex 修正 proof-2 后本地验证 12/12 通过。 | 只证明最小 `flatDelta` effect，不证明完整 Blacksmith 科技树、多级升级、caster training 或 hero ability model。 |
| `NUM-E` 玩家可见数值提示 | `engineering-pass` | `src/game/GameData.ts` / `src/game/Game.ts` / `tests/v6-visible-numeric-hints-proof.spec.ts`；Codex 本地复核 build、typecheck、NUM-C/NUM-D/NUM-E locked runtime `15/15` 通过；cleanup complete。 | 训练按钮成本/人口、选择面板攻击/护甲类型、研究效果说明和禁用原因均由 `GameData` / runtime state 支撑；测试已从写死数字改为导入 `GameData` 期望值后对照 DOM 与 fresh state。 | 只证明最小玩家可见数值提示；不证明完整百科面板、完整科技树、主菜单 UI polish 或完整 War3 数值平衡。 |
| `NUM-F` 数值底座证明计划 | `done` | `docs/V6_NUMERIC_PROOF_PLAN.zh-CN.md` | 已定义 NUM-C / NUM-D / NUM-E 的证明矩阵、fresh state 规则、cleanup 要求和 V6-NUM1 收口条件。 | 不替代 runtime proof。 |

## 1.7 V6-ID1 progress evidence

| Item | 状态 | Evidence | What it proves | What it does not prove |
| --- | --- | --- | --- | --- |
| 人族集结号令最小证明包 | `engineering-pass` | `src/game/GameData.ts` / `src/game/Game.ts` / `tests/v6-human-rally-call-identity-proof.spec.ts`；GLM job `glm-mnzd89mr-pxbkiu` 卡在 auto-compact 后由 Codex 取消并接管；Codex 本地验证 build、typecheck、ID1 focused 6/6、相关 runtime 30/30 通过；cleanup complete。 | 至少一个等价法术/指挥能力有玩家可见状态、真实触发、有限持续效果、冷却限制、反馈和 cleanup；它不是按钮、图标或文案占位。 | 不证明完整英雄系统、完整法术书、物品/背包/商店、完整人族身份或 War3-like first-look。 |

## 1.8 V6-FA1 / V6-W3L1 progress evidence

| Item | 状态 | Evidence | What it proves | What it does not prove |
| --- | --- | --- | --- | --- |
| Footman / Rifleman 角色差异证明包 | `engineering-pass` | `src/game/Game.ts` / `src/game/GameData.ts` / `tests/v6-footman-rifleman-role-identity-proof.spec.ts`；GLM job `glm-mnze1drz-a0hkcq` 首轮 runtime 失败后卡在 queued prompt，Codex 停止 GLM、取消 companion job 并接管；Codex 本地验证 build、typecheck、FA1 focused 5/5、V6 identity 相关 runtime pack 22/22 通过；cleanup complete。 | Footman / Rifleman 的成本、人口、攻击、护甲、射程、前置来自 `GameData` 和 runtime state；Barracks / Blacksmith / Long Rifles 形成不同生产或科技选择；Footman 近战前排、Rifleman 远程火力、Long Rifles 只强化 Rifleman 远程定位。 | 不证明完整人族 roster、完整科技树、完整 War3 数值平衡、完整 AI 兵种运营或真实 Warcraft 素材。 |
| War3-like 第一眼审查包 | `engineering-pass` | `docs/V6_WAR3_IDENTITY_FIRST_LOOK_REVIEW_PACKET.zh-CN.md` | NUM1 数值底座、ID1 身份能力、FA1 兵种差异已经能合成一份人眼审查材料；V6 工程面可以判断为 War3-like identity alpha。 | 不替用户做最终审美判断；不证明完整英雄、物品、战役、多人、真实素材或公开 demo。 |

## 2. V5 blocker / carryover snapshot

| 输入 | 当前状态 | V6 路由 | 当前结论 |
| --- | --- | --- | --- |
| `V5-ECO1` Economy and production backbone | `engineering-pass / blocker-cleared` | V6 context only | 可作为 V6 经济基础背景；不得回滚成 V6 blocker。 |
| `V5-TECH1` Tech and build-order backbone | `engineering-pass / blocker-cleared` | V6 production-decision context | 可作为 V6 research / prerequisite 背景；不得写成完整数值系统。 |
| `V5-COUNTER1` Basic counter and army composition backbone | `engineering-pass / blocker-cleared` | V6 roster clarity context | 可作为 V6 单位差异背景；不得写成完整 counter/balance。 |
| `V5-HUMAN1` Visible Human roster and tech line | `engineering-pass / blocker-cleared` | V6 sample input | Task 104/105/106 已完成；只能作为 V6 数值 schema、research effect 和 AI 同规则使用的样本输入，不能冒充完整人族。 |
| `V5-UA1` Strategy backbone first-look verdict | `user gate / user-open / async` | V6 user context | 只能作为人眼判断背景；不能由自动化代判，也不要求同步阻塞 V5 -> V6。 |
| `Human complete roster debt` | `terminal contract / open` | `V6-NUM1` / `V6-FA1` context | 不要求 V6 完成全人族，但 V6 起必须按 `docs/HUMAN_RACE_PARITY_AND_NUMERIC_SYSTEM.zh-CN.md` 建数值底座和后续任务。 |
| `Human numeric system debt` | `open` | `V6-NUM1` blocker | 数值底座是 V6 blocker，不是后期 polish。 |
| `V5 balance tuning debt` | `carryover candidate` | `V6-BAL0` | 只作为 balance residual。若破坏 ID1、FA1 或 W3L1 proof，再绑定具体失败面回流。 |
| `V5 presentation polish debt` | `carryover candidate` | `V6-PRES0` | 只作为 identity presentation residual。不得生成 UI polish、真实素材导入或当前 V5 closeout 任务。 |
| V5 roster clarity debt | `residual candidate` | `V6-FA1` / `V6-W3L1` proof context | 只有影响单位/阵营身份差异或 first-look identity verdict 时才进入证据缺口。 |
| V5 production-decision debt | `residual candidate` | `V6-ID1` / `V6-FA1` proof context | 只作为英雄/阵营表达与生产选择关系的 proof 输入；不得回滚 V5 strategy backbone closeout。 |

## 3. Conditional / user evidence ledger

| Gate | 当前状态 | 必需工程证据 | 必需用户判断证据 | 当前结论 |
| --- | --- | --- | --- | --- |
| `V6-BAL0` Identity balance carryover | `carryover / active` | NUM1、ID1、FA1、W3L1 proof 中 balance 不破坏身份表达；如失败，绑定具体 state log。 | 用户或目标 tester 判断身份表达是否被 balance 问题干扰。 | 只作为 V6 blocker proof 的支撑面，不单独生成 balance polish 任务。 |
| `V6-PRES0` Identity presentation carryover | `residual / active` | 身份表达的可见状态、反馈和 review packet 不被 presentation debt 破坏。 | 用户判断身份表达是否能被理解。 | 只处理 V6 身份表达可读性；不裁决 UI polish、真实素材导入或视觉风格审批。 |
| `V6-UA1` War3 identity first-look verdict | `user gate / user-open / async` | V6-ID1、V6-FA1、V6-W3L1 的工程证据包。 | 用户或目标 tester 给出 `pass`、`pass-with-debt`、`reject` 或 `defer`。 | 人眼 verdict 是 V6 alpha 判断；不能由自动化替代，也不要求同步阻塞工程推进。 |

## 4. Handoff contract snapshot

| 字段 | 当前值 |
| --- | --- |
| `fromVersionOutcome` | V5 strategy backbone alpha |
| `toVersionFocus` | V6 War3 identity alpha |
| `mustStayInFromVersion` | 任何仍 open 的 V5 blocker |
| `allowedCarryover` | V5 balance tuning debt；V5 presentation polish debt |
| `residualRouting` | V5 roster clarity debt -> V6 identity readability；V5 production-decision debt -> V6 hero/faction expression |
| `netNewBlockers` | 人族数值系统底座；英雄/法术/物品等身份系统；阵营或单位身份差异；能让玩家认出这像 War3-like 的核心表达 |

## 5. 当前保守结论

```text
V6 已 active。
当前 V5 工程项已清零：ECO1、TECH1、COUNTER1、HUMAN1 均为 engineering-pass / blocker-cleared。
V6 blocker 来自 War3 identity alpha：人族数值系统底座、英雄/法术/物品等身份系统、阵营或单位身份差异、War3-like 核心表达。
V6-NUM1、V6-ID1、V6-FA1、V6-W3L1 均已有工程证据并为 `engineering-pass`；V6-UA1 仍是异步人眼 verdict，不要求同步阻塞后续工程预热。
V5 balance tuning debt 和 presentation polish debt 只能作为 carryover / residual，不生成当前版本 closeout、UI polish 或真实素材导入任务。
V5 roster clarity debt 和 production-decision debt 只能作为 `V6-NUM1`、`V6-ID1`、`V6-FA1` 或 `V6-W3L1` 的 proof context，不能另造松散 blocker。
```

## 6. 更新模板

```text
Gate:
State before:
Engineering evidence:
User evidence:
State after:
Residual debt:
Next owner:
```
