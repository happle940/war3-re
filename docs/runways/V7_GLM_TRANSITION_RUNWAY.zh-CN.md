# V7 GLM Transition Runway

> 用途：定义 `V7 content and beta candidate` 正式 cutover 后 GLM 可以持续领取的 bounded proof pack。  
> 状态：`V6_TO_V7` preheat seed draft。V7 尚未 active，本文件不得直接派发 live queue。

## 0. 使用边界

GLM 在 V7 的职责是做窄切片、真实实现、focused proof 和机械同步。

GLM 可以接：

- 一个明确 V7 gate。
- 一个 bounded Human 内容或数值/AI proof pack。
- 明确 allowed / forbidden files。
- build、typecheck、focused runtime、cleanup 的原始结果。

GLM 不接：

- 未授权素材导入。
- public demo / release copy。
- 一次性完整人族全部内容。
- 纯审美 polish。
- 跳过资源、人口、前置或科技的 AI 任务。

## 1. V7 Gate 对应 GLM 任务形状

| V7 gate | GLM 任务形状 | 可写范围原则 | 必须产出的证据 |
| --- | --- | --- | --- |
| `V7-HUM1` Human content breadth | 选定 Human 建筑/单位/科技可玩切片 | 派发时限定 GameData / Game / focused spec / docs closeout | 数据、前置、命令卡、可见状态、训练/研究/使用 runtime proof |
| `V7-NUM2` Advanced numeric/combat model | projectile / target filters / caster mana / AOE / upgrade levels proof | 优先数据模型和 focused combat fixture，避免全局重写 | data-driven schema、state log、combat proof、UI hints |
| `V7-AI1` Same-rule beta AI | AI 使用 V7 选定内容 proof | 只碰 SimpleAI 和对应 spec，不能直接 spawn 或跳前置 | build/train/research/composition proof、同规则断言 |
| `V7-STAB1` Beta stability | runtime stability pack | 只补测试、脚本或窄 bugfix | focused pack、相关 runtime pack、cleanup、无残留 |

## 2. 首批 Seed Draft

这些不是 live queue。只有 `V6_TO_V7` cutover-ready / cutover-done 后，才能转成 `docs/GLM_READY_TASK_QUEUE.md` 的 ready 任务。

| Seed | Gate | 标题 | 目标 | 停止条件 |
| --- | --- | --- | --- | --- |
| `V7-GLM-01` | `V7-HUM1` | Lumber Mill 与塔分支最小可玩切片 | 让 Lumber Mill 或 tower branch 中的选定范围进入真实前置、命令卡和 runtime proof。 | focused spec 通过，证明建筑/升级/禁用原因/可见状态来自数据。 |
| `V7-GLM-02` | `V7-HUM1` / `V7-NUM2` | Arcane Sanctum 法师基础切片 | 让 Priest 或 Sorceress 中的一个最小法师能力进入 mana、cast、效果、限制和 HUD proof。 | focused spec 通过，证明 mana / cooldown / target / effect 至少一条链成立。 |
| `V7-GLM-03` | `V7-HUM1` / `V7-NUM2` | Workshop / Mortar 战斗模型切片 | 让 Mortar Team 或等价攻城切片证明 projectile / AOE / target filter 中至少一类高级战斗模型。 | focused spec 通过，证明差异来自数据与真实战斗路径。 |
| `V7-GLM-04` | `V7-AI1` | V7 内容 AI 同规则使用切片 | 让 AI 按资源、人口、前置、科技使用一个 V7 选定内容。 | focused spec 通过，明确 AI 没有直接 spawn、跳前置或伪造研究。 |
| `V7-GLM-05` | `V7-STAB1` | V7 beta 稳定性回归包 | 把 V7 选定内容和现有短局 runtime pack 串成稳定性证明。 | build、typecheck、focused pack、相关 runtime pack、cleanup 全部通过。 |

## Task 107 — Lumber Mill 与塔分支最小可玩切片

Goal:

让 Lumber Mill 或 tower branch 中的选定范围进入真实前置、命令卡和 runtime proof。

Write scope:

- src/game/GameData.ts
- src/game/Game.ts
- tests/v7-lumber-mill-tower-branch-proof.spec.ts

Must prove:

1. 选定建筑或塔分支有真实数据、成本、前置、建造或升级入口。
2. 命令卡能显示可用、禁用、建造中或完成状态。
3. focused runtime 从 fresh state 证明入口和状态来自真实数据，不是按钮占位。

## Task 108 — Arcane Sanctum 法师基础切片

Goal:

让 Priest 或 Sorceress 中的一个最小法师能力进入 mana、cast、效果、限制和 HUD proof。

Write scope:

- src/game/GameData.ts
- src/game/Game.ts
- tests/v7-arcane-sanctum-caster-proof.spec.ts

Must prove:

1. 选定法师或能力有 mana、cooldown、target 或 duration 中至少一条真实限制。
2. 触发后 state、战斗或单位状态发生可测变化。
3. HUD 或命令卡能解释能力可用、不可用和触发后的状态。

## Task 109 — Workshop / Mortar 战斗模型切片

Goal:

让 Mortar Team 或等价攻城切片证明 projectile、AOE、target filter 中至少一类高级战斗模型。

Write scope:

- src/game/GameData.ts
- src/game/Game.ts
- tests/v7-workshop-mortar-combat-model-proof.spec.ts

Must prove:

1. 选定攻城单位或模型的差异来自 GameData 或统一 combat model。
2. focused combat fixture 能观察 projectile、AOE 或 target filter 的真实行为。
3. proof 不把单场胜负、改名或静态数字写成高级战斗模型通过。

## Task 110 — V7 内容 AI 同规则使用切片

Goal:

让 AI 按资源、人口、前置、科技使用一个 V7 选定内容。

Write scope:

- src/game/SimpleAI.ts
- tests/v7-ai-same-rule-content-proof.spec.ts

Must prove:

1. AI 使用 V7 选定内容时不直接 spawn、不跳过资源、人口、建筑前置或研究前置。
2. AI 的 build、train、research 或 combat choice 至少一条路径能在受控 runtime 中复现。
3. 如果 V7 内容尚未足够，测试必须明确 blocked 面，而不是伪造完成。

## Task 111 — V7 beta 稳定性回归包

Goal:

把 V7 选定内容和现有短局 runtime pack 串成稳定性证明。

Write scope:

- tests/v7-beta-stability-regression.spec.ts
- scripts/run-runtime-suite.sh
- docs/V7_CONTENT_BETA_EVIDENCE_LEDGER.zh-CN.md

Must prove:

1. V7 选定内容的 focused proof 能和现有短局、数值、AI 相关 regression 共存。
2. cleanup 后没有 Vite、Playwright、Chromium 测试残留。
3. closeout 明确哪些是 beta blocker，哪些只是 residual debt。

## 3. 派发规则

V7 active 后，默认顺序是：

```text
V7-GLM-01 -> V7-GLM-02 or V7-GLM-03 -> V7-GLM-04 -> V7-GLM-05
```

允许调整顺序的情况：

- Codex 的 V7 scope freeze 选择了不同 Human 内容范围。
- 前一条 proof 失败，需要先做更小的数据模型或 UI hint 修复。
- runtime 资源异常时，GLM 只能继续文档/fixture 设计，不得强开多个 Playwright/Vite。

禁止派发的情况：

- V7 尚未 cutover。
- scope freeze 未完成。
- 任务目标是 public demo、release copy、真实素材导入或一次性完整人族。
- 任务没有 allowed / forbidden files。

## 4. 验证底线

每个 GLM V7 proof pack 至少给出：

```bash
npm run build
npx tsc --noEmit -p tsconfig.app.json
./scripts/run-runtime-tests.sh <focused-spec> --reporter=list
./scripts/cleanup-local-runtime.sh
```

如果涉及 AI、短局或稳定性，Codex 可追加相关 runtime pack。

## 5. 防假绿规则

- 不能只证明按钮存在。
- 不能只改内部 state，必须走真实玩家或系统入口。
- mutation 后必须重新读取 `window.__war3Game`、最新 DOM 和最新 state。
- 测试期望必须来自 `GameData` / runtime state，不写死当前数字，除非测试目标就是固定合同常量。
- closeout 必须写出原始验证结果，不用 `tail` 假绿。

## 6. 当前保守结论

```text
这是 V7 GLM runway 的预热草案。
它只定义 cutover 后 GLM 能做的 bounded proof pack。
它不激活 V7，不修改 live queue，不代表任何 V7 gate 已通过。
```
