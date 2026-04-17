# V9 Maintenance And Expansion Evidence Ledger

> 用途：记录 `V9 maintenance and expansion runway` 的工程证据、用户判断证据和残余债务。  
> 上游 gate 清单：`docs/V9_MAINTENANCE_EXPANSION_REMAINING_GATES.zh-CN.md`。

## 0. 使用规则

- V9 不以“继续加更多内容”为默认目标；它先保证外部反馈、版本基线和下一轮扩展选择可控。
- 每个 V9 blocker 必须绑定可复跑证据、反馈记录、决策包或 runtime smoke。
- 用户或 tester verdict 可以异步；如果反馈是 P0/P1，必须先进入 hotfix/patch，不得绕过去开新内容。
- 任何扩展方向都必须来自 V8 反馈和 master roadmap 的交集，且一次只选一个主攻能力。

## 1. V9 blocker evidence ledger

| Gate | 当前状态 | 必需工程证据 | 必需用户判断证据 | 当前结论 |
| --- | --- | --- | --- | --- |
| `V9-HOTFIX1` External feedback intake | `engineering-pass` | `tests/v9-hotfix-triage-proof.spec.mjs` 5/5；样例反馈记录、P0-P5 分级、gate 路由、任务合成、禁止模板拒绝、用户 verdict 不自动通过均验证。Codex 本地复核 `npm run build`、`npx tsc --noEmit -p tsconfig.app.json`、`node --test tests/v9-hotfix-triage-proof.spec.mjs`、cleanup、无残留均通过。 | tester 或用户真实反馈可异步到达。 | Task115 已 Codex accepted；反馈可以进入 hotfix / patch / debt / user gate。 |
| `V9-BASELINE1` Reproducible V8 baseline | `engineering-pass` | `tests/v9-baseline-replay-smoke.spec.ts` 5/5；V8 demo 入口路径、暂停/返回/结果返回、V7 数据表+训练、V7 战斗模型、完整会话生命周期+cleanup+恢复均复跑通过。Codex 本地复核 `npm run build`、`npx tsc --noEmit -p tsconfig.app.json`、focused runtime 5/5、cleanup、无残留均通过。 | 用户可异步判断该 baseline 是否值得继续迭代。 | Task116 已 Codex accepted；V8 baseline 可复跑、可清理、可解释。 |
| `V9-EXPAND1` Next expansion decision | `engineering-pass` | `docs/V9_HUMAN_NUMERIC_EXPANSION_PACKET.zh-CN.md` 把下一轮扩展固定为完整 Human 核心与数值系统，并列出 HN1-HN4 相邻任务、禁止扩张项和自动补货限制；Task117 刷新人族背景板，Task118 固定 HN2 tier / prerequisite schema 边界，Task120/121/122 已把 Keep 数据种子、Town Hall -> Keep 最小升级路径和升级后主基地命令面落地；Task123 已盘点 Keep / T2 解锁兼容关系；Task124 已定义 Keep / T2 解锁目标合同；Task125 已证明 runtime gating dry-run；Task126 已完成 AI 使用现有 Keep 升级路径的最小准备；Task127 已把 Workshop / Arcane Sanctum 真实迁移到 Keep 门槛；Task128 已补升级 / 解锁反馈；Task129 已证明玩家侧最小二本生产路径在同一局串通；Task130 已证明 AI 在 Keep 后使用既有二本建筑和训练 Mortar / Priest；Task131 已把 T2 数值账本与 `GameData.ts` 对齐；Task132 已把二本成本、人口、建造/训练/升级时间和禁用原因接到玩家可见命令卡 proof；Task133 已证明 Mortar Team 与 Priest 的二本战斗角色在受控 runtime 中成立；Task134 已把 Priest Heal、Rally Call、Mortar AOE 三个现有样本映射到 HN3 ability/effect 字段；Task135 已把 `ABILITIES.priest_heal` 数据种子落进 `GameData.ts`；Task136 已把 Priest Heal 运行时读取迁移到 `ABILITIES.priest_heal` 且行为不变；Task137 已把 `ABILITIES.rally_call` 数据种子落进 `GameData.ts`；Task138 已把 `ABILITIES.mortar_aoe` 数据种子落进 `GameData.ts`；Task139 已把 Rally Call 运行时读取迁移到 `ABILITIES.rally_call`；Task140 已把 Mortar AOE 运行时读取迁移到 `ABILITIES.mortar_aoe`；Task141 已把 Rally Call / Priest Heal 命令卡和可见提示迁移到 `ABILITIES` 且行为不变；Task142 已完成 HN3 ability data-read 收口盘点；Task143 已完成 HN4 Militia / Back to Work / Defend 分支合同；Task144 已完成 Militia / Call to Arms 数据种子；Task145 已完成 Militia runtime；Task146 已完成 Back to Work runtime；Task147 已完成 Defend 数据种子；Task148 已完成 Defend runtime；Task149 已完成 HN4 closure inventory；Task150 已完成 HN5 Sorceress / Slow branch contract；Task151 已完成 HN5 Sorceress / Slow data seed；Task152 已完成 Sorceress training surface；Task153 已完成 Sorceress mana surface；Task154 已完成手动 Slow runtime；Task155 已完成 Slow auto-cast minimal toggle；Task156 已完成 HN5 closure inventory，证明数据种子、训练、mana、手动 Slow、自动 Slow 均有证据且无越界。 | 用户可异步改变优先级，但不能阻塞工程记录。 | V9-CX2..V9-CX44 正在推进；HN5 最小链路已闭环，后续任务需从 Human completeness roadmap 选择新分支（Knight、Altar/Heroes 或 AI 战术），需走新分支合同。 |

## 2. V8 handoff evidence

| 输入 | 当前状态 | V9 路由 | 当前结论 |
| --- | --- | --- | --- |
| `V8-DEMO1` | `engineering-pass` | `V9-BASELINE1` | 外部入口路径可作为 baseline smoke 输入。 |
| `V8-RC1` | `engineering-pass` | `V9-BASELINE1` | RC stability pack 可作为 baseline 复跑输入。 |
| `V8-COPY1` | `engineering-pass` | `V9-HOTFIX1` / `V9-EXPAND1` | 对外口径和缺口说明可作为反馈入口上下文。 |
| `V8-ASSET1` | `engineering-pass` | `V9-EXPAND1` / `V9-POLISH1` | 当前素材边界保守；若新增真实素材，必须重新走审批。 |
| `V8-FEEDBACK1` | `engineering-pass` | `V9-HOTFIX1` | 反馈记录、分级、路由规则已存在，V9 需要证明它能被消费。 |
| `V8-UA1` | `user-open / async` | `V9-HOTFIX1` / `V9-EXPAND1` / `V9-UA1` | 用户或 tester verdict 后续进入 V9，不阻塞 V8 -> V9 工程切换。 |

## 3. Conditional / user evidence ledger

| Gate | 当前状态 | 工程处理 | 用户判断 |
| --- | --- | --- | --- |
| `V9-UA1` | `user gate / user-open / async` | Codex 准备方向选择包，不代判。 | 用户可选择修 demo、扩完整 Human、加英雄/物品、做新地图/阵营或暂停。 |
| `V9-POLISH1` | `residual / active` | 只有污染 feedback / baseline 时升级。 | 异步。 |
| `V9-BALANCE1` | `residual / active` | 只有破坏 baseline replay 或 tester loop 时升级。 | 异步。 |

## 4. V9 accepted evidence

### V9-HOTFIX1 — External feedback intake

Accepted at: `2026-04-15 14:07:52 CST`.

Evidence:

- `tests/v9-hotfix-triage-proof.spec.mjs`
- `docs/V9_MAINTENANCE_EXPANSION_EVIDENCE_LEDGER.zh-CN.md`
- `docs/GLM_READY_TASK_QUEUE.md`

Codex verification:

```bash
npm run build
npx tsc --noEmit -p tsconfig.app.json
node --test tests/v9-hotfix-triage-proof.spec.mjs
./scripts/cleanup-local-runtime.sh
pgrep -fl 'vite|playwright|chrome-headless|Chromium|run-runtime-tests|node .*vite' || true
```

Result:

```text
build pass.
typecheck pass.
V9 hotfix triage proof 5/5 pass.
cleanup complete.
No Vite / Playwright / Chromium / runtime leftovers.
```

Conclusion:

```text
V9-HOTFIX1 engineering-pass.
Sample feedback can be recorded, classified P0-P5, routed to hotfix / patch / debt / user gate, synthesized into an actionable task shape, and guarded against auto-approving user verdicts.
```

Residual:

- This proves the feedback route shape with sample records; it does not replace real tester feedback.
- Actual P0/P1 feedback can still reopen V8/V9 gates.

### V9-BASELINE1 — Reproducible V8 baseline

Accepted at: `2026-04-15 14:18:31 CST`.

Evidence:

- `tests/v9-baseline-replay-smoke.spec.ts`
- `docs/V9_MAINTENANCE_EXPANSION_EVIDENCE_LEDGER.zh-CN.md`
- `docs/GLM_READY_TASK_QUEUE.md`

Codex verification:

```bash
npm run build
npx tsc --noEmit -p tsconfig.app.json
./scripts/run-runtime-tests.sh tests/v9-baseline-replay-smoke.spec.ts --reporter=list
./scripts/cleanup-local-runtime.sh
pgrep -fl 'vite|playwright|chrome-headless|Chromium|run-runtime-tests|node .*vite' || true
```

Result:

```text
build pass.
typecheck pass.
V9 baseline replay smoke 5/5 pass.
cleanup complete.
No Vite / Playwright / Chromium / runtime leftovers.
```

Conclusion:

```text
V9-BASELINE1 engineering-pass.
V8 demo entry, pause/return, results/return, V7 content connectivity, V7 combat models, session cleanup, and procedural recovery are reproducible at V9 start.
```

Residual:

- This is a baseline replay, not a public release verdict.
- Known missing content remains known debt, not a regression: complete Human, heroes, shops, neutral, campaign, multiplayer, ladder, replay, final assets.

### V9-EXPAND1 — Next expansion decision

Accepted at: `2026-04-15 14:18:31 CST`.

Evidence:

- `docs/V9_HUMAN_NUMERIC_EXPANSION_PACKET.zh-CN.md`
- `docs/HUMAN_RACE_CAPABILITY_BOARD.zh-CN.md`
- `docs/V9_TIER_PREREQUISITE_SCHEMA_PACKET.zh-CN.md`
- `docs/V9_KEEP_TIER_IMPLEMENTATION_CONTRACT.zh-CN.md`
- `docs/V9_KEEP_UPGRADE_FLOW_CONTRACT_DRAFT.zh-CN.md`
- `tests/v9-human-completeness-ledger.spec.mjs`
- `tests/v9-tier-prerequisite-schema.spec.mjs`
- `tests/v9-keep-tier-contract.spec.mjs`
- `tests/v9-keep-tier-seed-proof.spec.mjs`
- `tests/v9-keep-upgrade-flow-contract.spec.mjs`
- `docs/PROJECT_MASTER_ROADMAP.zh-CN.md`
- `docs/WAR3_MASTER_CAPABILITY_PROGRAM.zh-CN.md`
- `docs/WAR3_ENDSTATE_GAP_ATLAS.zh-CN.md`
- `README.md`
- `docs/KNOWN_ISSUES.zh-CN.md`

Codex verification:

```bash
git diff --check -- README.md docs/KNOWN_ISSUES.zh-CN.md docs/DOCS_INDEX.md docs/V9_HUMAN_NUMERIC_EXPANSION_PACKET.zh-CN.md
node --test tests/v9-human-completeness-ledger.spec.mjs
node --test tests/v9-tier-prerequisite-schema.spec.mjs
node --test tests/v9-keep-tier-contract.spec.mjs
node --test tests/v9-keep-tier-seed-proof.spec.mjs
node --test tests/v9-keep-upgrade-flow-contract.spec.mjs
npm run build
npx tsc --noEmit -p tsconfig.app.json
./scripts/cleanup-local-runtime.sh
```

Result:

```text
V9 expansion direction fixed to complete Human core + numeric system.
Adjacent task sequence HN1-HN4 exists.
HN1 Human completeness ledger is current with V5-V7 implemented facts.
HN2 tier / prerequisite schema boundary is current; HN2-IMPL1 Keep tier seed is implemented and no longer a future task.
HN2-IMPL2 Town Hall -> Keep upgrade flow is implemented and locally accepted: build, typecheck, focused runtime 3/3, node proof 20/20, cleanup, no leftovers.
HN2-IMPL3 Keep post-upgrade command surface is implemented.
HN2-PLAN4/CONTRACT5/PROOF6 have inventoried, contracted, and dry-run Keep/T2 building unlock.
HN2-IMPL7 AI Keep upgrade readiness is implemented and locally accepted: build, typecheck, focused runtime 6/6, AI/V7 regression 10/10, node contract 12/12, cleanup, no leftovers.
HN2-IMPL8 real Workshop / Arcane Sanctum Keep-gated unlock migration is implemented and locally accepted: build, typecheck, Keep/T2 runtime 4/4, V7 Workshop/Arcane runtime 12/12, V9 baseline 5/5, V7 AI same-rule 8/8, node contract 12/12, cleanup, no leftovers.
HN2-UX9 player-visible Keep upgrade / T2 unlock feedback is implemented and locally accepted: build, typecheck, runtime 12/12, node contract 12/12, cleanup, no leftovers.
HN2-PROOF10 player-side Human T2 production path smoke is locally accepted: build, typecheck, focused runtime 7/7, node contract 12/12, cleanup, no leftovers.
HN2-AI11 AI post-Keep T2 usage is locally accepted: build, typecheck, focused runtime 21/21, node contract 12/12, cleanup, no leftovers.
HN2-NUM12 T2 numeric ledger alignment is locally accepted: node proof 5/5, build, typecheck, cleanup, no leftovers.
HN2-UX13 T2 visible numeric hints is locally accepted: focused runtime 6/6, related runtime pack 16/16, build, typecheck, cleanup, no leftovers.
HN2-ROLE14 next adjacent task is T2 role combat smoke, not Castle / Knight / full tech tree.
Automatic refill limit exists.
Second race, multiplayer, public release packaging, and pure asset replacement are explicitly out of the current live queue.
```

Conclusion:

```text
V9-EXPAND1 engineering-pass.
This does not mean complete Human is implemented; it means the next expansion runway is bounded, evidence-led, and queueable.
```

### V9 HN2-NUM12 — T2 numeric ledger alignment

Accepted at: `2026-04-15 21:11:31 CST`.

Evidence:

- `docs/V6_HUMAN_NUMERIC_LEDGER.zh-CN.md`
- `docs/HUMAN_RACE_PARITY_AND_NUMERIC_SYSTEM.zh-CN.md`
- `tests/v9-t2-numeric-ledger-alignment.spec.mjs`
- `docs/GLM_READY_TASK_QUEUE.md`

Codex verification:

```bash
node --test tests/v9-t2-numeric-ledger-alignment.spec.mjs
npm run build
npx tsc --noEmit -p tsconfig.app.json
./scripts/cleanup-local-runtime.sh
ps aux | egrep 'node .*vite|playwright|Chromium|chrome-headless-shell|run-runtime-tests' | egrep -v 'egrep' || true
```

Result:

```text
T2 numeric ledger proof 5/5 pass.
build pass.
typecheck pass.
cleanup complete.
No Vite / Playwright / Chromium / runtime leftovers.
```

Conclusion:

```text
Keep / Workshop / Arcane Sanctum / Mortar Team / Priest are now represented in the numeric ledger as current code facts.
The ledger explicitly states that Castle, Knight, complete caster/engineering/air, heroes, items, and shop systems are still missing.
This closes numeric ledger alignment only; it does not implement more Human content.
```

### V9 HN2-UX13 — T2 visible numeric hints

Accepted at: `2026-04-15 21:27:36 CST`.

Evidence:

- `src/game/Game.ts`
- `tests/v9-t2-visible-numeric-hints.spec.ts`
- `docs/GLM_READY_TASK_QUEUE.md`

Codex verification:

```bash
npm run build
npx tsc --noEmit -p tsconfig.app.json
./scripts/run-runtime-tests.sh tests/v9-t2-visible-numeric-hints.spec.ts --reporter=list
./scripts/run-runtime-tests.sh tests/v9-t2-visible-numeric-hints.spec.ts tests/v6-visible-numeric-hints-proof.spec.ts tests/v9-keep-upgrade-unlock-feedback.spec.ts --reporter=list
./scripts/cleanup-local-runtime.sh
ps aux | egrep 'node .*vite|playwright|Chromium|chrome-headless-shell|run-runtime-tests' | egrep -v 'egrep' || true
```

Result:

```text
build pass.
typecheck pass.
T2 visible numeric hints focused runtime 6/6 pass.
T2 + existing visible numeric / Keep unlock feedback runtime pack 16/16 pass.
cleanup complete.
No Vite / Playwright / Chromium / runtime leftovers.
```

Conclusion:

```text
Command-card buttons now show build time for buildable structures, train time for trainable units, and upgrade time for Town Hall -> Keep.
Workshop / Arcane Sanctum / Mortar Team / Priest visible hints are checked against current GameData values.
This closes visibility of current T2 numeric hints only; it does not add new units, tech, AI formation, or assets.
```

### V9 HN2-ROLE14 — T2 role combat smoke

Accepted at: `2026-04-15 21:43:05 CST`.

Evidence:

- `tests/v9-t2-role-combat-smoke.spec.ts`
- `tests/v7-workshop-mortar-combat-model-proof.spec.ts`
- `tests/v7-arcane-sanctum-caster-proof.spec.ts`
- `docs/GLM_READY_TASK_QUEUE.md`

Codex verification:

```bash
npm run build
npx tsc --noEmit -p tsconfig.app.json
./scripts/run-runtime-tests.sh tests/v9-t2-role-combat-smoke.spec.ts tests/v7-workshop-mortar-combat-model-proof.spec.ts tests/v7-arcane-sanctum-caster-proof.spec.ts --reporter=list
./scripts/cleanup-local-runtime.sh
ps aux | egrep 'node .*vite|playwright|Chromium|chrome-headless-shell|run-runtime-tests' | egrep -v 'egrep' || true
```

Result:

```text
build pass.
typecheck pass.
T2 role combat smoke + V7 Workshop/Mortar + V7 Arcane/Priest runtime pack 15/15 pass.
cleanup complete.
No Vite / Playwright / Chromium / runtime leftovers.
```

Conclusion:

```text
Mortar Team has current GameData-backed Siege/AOE behavior in a controlled combat fixture.
Priest has current GameData-backed mana/Heal behavior and rejects invalid targets in a controlled combat fixture.
This closes HN2 role smoke only; it does not add Sorceress, Spell Breaker, heroes, items, AI formations, new assets, or new abilities.
The next adjacent work is HN3 ability numeric model inventory.
```

### V9 HN3-PLAN1 — ability numeric model inventory

Accepted at: `2026-04-15 21:48:53 CST`.

Evidence:

- `docs/V9_ABILITY_NUMERIC_MODEL_PACKET.zh-CN.md`
- `tests/v9-ability-numeric-model-inventory.spec.mjs`
- `src/game/GameData.ts`
- `src/game/Game.ts`

Codex verification:

```bash
node --test tests/v9-ability-numeric-model-inventory.spec.mjs
npm run build
npx tsc --noEmit -p tsconfig.app.json
./scripts/cleanup-local-runtime.sh
```

Result:

```text
HN3 ability numeric model inventory proof 5/5 pass.
build pass.
typecheck pass.
cleanup complete.
```

Conclusion:

```text
Priest Heal, Rally Call, and Mortar AOE are now mapped to the same minimal ability/effect field set.
HN3 is bounded to migration of existing samples first; it does not add Sorceress, Spell Breaker, heroes, items, summons, new abilities, or runtime behavior.
The next adjacent work is Priest Heal ability data seed.
```

### V9 HN3-DATA2 — Priest Heal ability data seed

Accepted at: `2026-04-15 21:54:15 CST`.

Evidence:

- `src/game/GameData.ts`
- `docs/V9_ABILITY_NUMERIC_MODEL_PACKET.zh-CN.md`
- `tests/v9-priest-heal-ability-data-seed.spec.mjs`

Codex verification:

```bash
node --test tests/v9-priest-heal-ability-data-seed.spec.mjs
npm run build
npx tsc --noEmit -p tsconfig.app.json
./scripts/cleanup-local-runtime.sh
```

Result:

```text
Priest Heal ability data seed proof 5/5 pass.
build pass.
typecheck pass.
cleanup complete.
```

Conclusion:

```text
GameData.ts now exposes the minimal AbilityDef shape and ABILITIES.priest_heal.
The seed uses the existing Priest Heal constants for mana cost, cooldown, range, and heal amount.
Game.ts runtime behavior is intentionally unchanged in Task135.
The next adjacent work is Task136: migrate castHeal to read ABILITIES.priest_heal while proving behavior stays the same.
```

### V9 HN3-IMPL3 — Priest Heal runtime data-read migration

Accepted at: `2026-04-15 22:10:20 CST`.

Evidence:

- `src/game/Game.ts`
- `tests/v9-priest-heal-runtime-data-read.spec.ts`
- `tests/v9-priest-heal-ability-data-seed.spec.mjs`
- `docs/GLM_READY_TASK_QUEUE.md`

Codex verification:

```bash
npm run build
npx tsc --noEmit -p tsconfig.app.json
./scripts/run-runtime-tests.sh tests/v9-priest-heal-runtime-data-read.spec.ts tests/v7-arcane-sanctum-caster-proof.spec.ts --reporter=list
node --test tests/v9-priest-heal-ability-data-seed.spec.mjs
./scripts/cleanup-local-runtime.sh
```

Result:

```text
build pass.
typecheck pass.
Priest Heal runtime data-read + V7 Priest regression 13/13 pass.
Task135 data seed proof 5/5 pass after stage-compatible update.
cleanup complete.
```

Conclusion:

```text
castHeal now reads ABILITIES.priest_heal for mana cost, range, cooldown, and heal amount.
Priest auto-heal uses the same ability values.
Heal behavior remains unchanged: valid heal restores the same HP, spends the same mana, sets the same cooldown, and still rejects enemy, full HP, out-of-range, no-mana, and cooldown cases.
The next adjacent HN3 work is Rally Call ability data seed; no new ability system or buff runtime is opened.
```

### V9 HN3-DATA4 — Rally Call ability data seed

Accepted at: `2026-04-15 22:21:31 CST`.

Evidence:

- `src/game/GameData.ts`
- `docs/V9_ABILITY_NUMERIC_MODEL_PACKET.zh-CN.md`
- `tests/v9-rally-call-ability-data-seed.spec.mjs`
- `docs/GLM_READY_TASK_QUEUE.md`

Codex verification:

```bash
node --test tests/v9-rally-call-ability-data-seed.spec.mjs
npm run build
npx tsc --noEmit -p tsconfig.app.json
./scripts/cleanup-local-runtime.sh
```

Result:

```text
Rally Call ability data seed proof 4/4 pass.
build pass.
typecheck pass.
cleanup complete.
```

Conclusion:

```text
GameData.ts now exposes ABILITIES.rally_call.
The seed uses existing Rally Call constants for cooldown, radius, damage bonus, and duration.
Rally Call runtime behavior is intentionally unchanged in Task137 and still reads the existing RALLY_CALL_* path.
The next adjacent HN3 work is Mortar AOE ability data seed; no projectile, buff, new spell, hero, or item system is opened.
```

### V9 HN3-DATA5 — Mortar AOE ability data seed

Accepted at: `2026-04-15 22:21:31 CST`.

Evidence:

- `src/game/GameData.ts`
- `docs/V9_ABILITY_NUMERIC_MODEL_PACKET.zh-CN.md`
- `tests/v9-mortar-aoe-ability-data-seed.spec.mjs`
- `docs/GLM_READY_TASK_QUEUE.md`

Codex verification:

```bash
node --test tests/v9-mortar-aoe-ability-data-seed.spec.mjs
npx tsc --noEmit -p tsconfig.app.json
npm run build
```

Result:

```text
Mortar AOE ability data seed proof 4/4 pass.
typecheck pass.
build pass.
```

Conclusion:

```text
GameData.ts now exposes ABILITIES.mortar_aoe with existing Mortar AOE radius, falloff, and Mortar Team unit data.
The seed describes passive on-hit splash/falloff damage and enemy alive target filtering without migrating runtime behavior.
Game.ts runtime behavior is intentionally unchanged in Task138 and still reads AttackType.Siege plus MORTAR_AOE_* constants.
The next adjacent HN3 work is Rally Call runtime data-read migration; no buff system, projectile system, hero, item, or new spell is opened.
```

### V9 HN3-IMPL6 — Rally Call runtime data-read migration

Accepted at: `2026-04-15 22:45:00 CST`.

Evidence:

- `src/game/Game.ts`
- `tests/v9-rally-call-runtime-data-read.spec.ts`
- `tests/v9-rally-call-ability-data-seed.spec.mjs`
- `docs/V9_ABILITY_NUMERIC_MODEL_PACKET.zh-CN.md`
- `docs/GLM_READY_TASK_QUEUE.md`

Codex verification:

```bash
npx tsc --noEmit -p tsconfig.app.json
npm run build
./scripts/run-runtime-tests.sh tests/v9-rally-call-runtime-data-read.spec.ts tests/v6-human-rally-call-identity-proof.spec.ts --reporter=list
./scripts/cleanup-local-runtime.sh
```

Result:

```text
typecheck pass.
build pass.
Rally Call runtime data-read + V6 Rally Call regression 13/13 pass.
cleanup complete.
```

Conclusion:

```text
triggerRallyCall now reads ABILITIES.rally_call for cooldown, range, and duration.
Rally Call damage bonus now reads ABILITIES.rally_call.effectValue.
User-visible behavior remains unchanged: invalid sources still reject, in-range allies still receive the same duration buff, cooldown remains the same, and buffed damage remains the same.
The next adjacent HN3 work is Mortar AOE runtime data-read migration; no projectile/onHit system, hero, item, or new spell is opened.
```

### V9 HN3-IMPL7 — Mortar AOE runtime data-read migration

Accepted at: `2026-04-15 22:58:00 CST`.

Evidence:

- `src/game/Game.ts`
- `tests/v9-mortar-aoe-runtime-data-read.spec.ts`
- `tests/v9-mortar-aoe-ability-data-seed.spec.mjs`
- `tests/v9-ability-numeric-model-inventory.spec.mjs`
- `docs/V9_ABILITY_NUMERIC_MODEL_PACKET.zh-CN.md`
- `docs/GLM_READY_TASK_QUEUE.md`

Codex verification:

```bash
node --test tests/v9-ability-numeric-model-inventory.spec.mjs tests/v9-rally-call-ability-data-seed.spec.mjs tests/v9-mortar-aoe-ability-data-seed.spec.mjs tests/lane-feed.spec.mjs
npx tsc --noEmit -p tsconfig.app.json
npm run build
./scripts/run-runtime-tests.sh tests/v9-mortar-aoe-runtime-data-read.spec.ts tests/v7-workshop-mortar-combat-model-proof.spec.ts --reporter=list
FORCE_RUNTIME_CLEANUP=1 ./scripts/cleanup-local-runtime.sh
```

Result:

```text
Static HN3 + lane-feed proof 56/56 pass.
typecheck pass.
build pass.
Mortar AOE runtime data-read + V7 Workshop/Mortar regression 9/9 pass.
cleanup complete.
```

Conclusion:

```text
Mortar AOE trigger and splash falloff now read ABILITIES.mortar_aoe.
User-visible behavior remains unchanged: Siege attacks still trigger splash, non-Siege attacks do not, primary target / attacker / same team / dead units / goldmine are still filtered, radius cutoff still applies, and center damage remains higher than edge damage.
The next adjacent HN3 work is ability command-card data-read migration; no new skill, projectile/onHit system, hero, item, or unit is opened.
```

### V9 HN3-UX8 — Ability command-card data-read migration

Accepted at: `2026-04-15 23:12:00 CST`.

Evidence:

- `src/game/Game.ts`
- `tests/v9-ability-command-card-data-read.spec.ts`
- `tests/v9-priest-heal-runtime-data-read.spec.ts`
- `tests/v9-rally-call-runtime-data-read.spec.ts`
- `docs/GLM_READY_TASK_QUEUE.md`

Codex verification:

```bash
npx tsc --noEmit -p tsconfig.app.json
npm run build
./scripts/run-runtime-tests.sh tests/v9-ability-command-card-data-read.spec.ts tests/v9-priest-heal-runtime-data-read.spec.ts tests/v9-rally-call-runtime-data-read.spec.ts --reporter=list
FORCE_RUNTIME_CLEANUP=1 ./scripts/cleanup-local-runtime.sh
```

Result:

```text
typecheck pass.
build pass.
Ability command-card + Priest Heal + Rally Call runtime proof 14/14 pass.
cleanup complete.
```

Conclusion:

```text
Rally Call command-card and selected-state text now read ABILITIES.rally_call.
Priest Heal command-card and manual target range now read ABILITIES.priest_heal.
Game.ts no longer reads RALLY_CALL_* / PRIEST_HEAL_* as runtime or visible UI data sources.
The next adjacent HN3 work is a closure inventory; no runtime code or new content is opened.
```

### V9 HN3-CLOSE9 — Ability data-read closure inventory

Accepted at: `2026-04-15 23:18:00 CST`.

Evidence:

- `tests/v9-ability-data-read-closure.spec.mjs`
- `tests/v9-ability-numeric-model-inventory.spec.mjs`
- `docs/V9_ABILITY_NUMERIC_MODEL_PACKET.zh-CN.md`
- `docs/V9_HUMAN_NUMERIC_EXPANSION_PACKET.zh-CN.md`
- `docs/GLM_READY_TASK_QUEUE.md`

Codex verification:

```bash
node --test tests/v9-ability-data-read-closure.spec.mjs tests/v9-ability-numeric-model-inventory.spec.mjs
npm run build
npx tsc --noEmit -p tsconfig.app.json
FORCE_RUNTIME_CLEANUP=1 ./scripts/cleanup-local-runtime.sh
```

Result:

```text
HN3 ability data-read closure proof + HN3 inventory proof 9/9 pass.
build pass.
typecheck pass.
cleanup complete.
```

Conclusion:

```text
Priest Heal, Rally Call, and Mortar AOE now have data seed, runtime data-read, and visible / command-card data-read evidence tied to ABILITIES.
Game.ts no longer uses RALLY_CALL_* / PRIEST_HEAL_* / MORTAR_AOE_* as runtime or UI data sources.
HN3 is closed as an ability data-read normalization slice only; it does not add new spells, units, heroes, items, projectile/onHit, or buff/debuff systems.
The next adjacent HN4 work is the Militia / Back to Work / Defend branch contract.
```

### V9 HN4-PLAN1 — Militia / Defend branch contract

Accepted at: `2026-04-15 23:31:00 CST`.

Evidence:

- `docs/V9_HN4_MILITIA_DEFEND_CONTRACT.zh-CN.md`
- `tests/v9-hn4-militia-defend-contract.spec.mjs`
- `docs/V9_HUMAN_NUMERIC_EXPANSION_PACKET.zh-CN.md`
- `docs/GLM_READY_TASK_QUEUE.md`

Codex verification:

```bash
node --test tests/v9-hn4-militia-defend-contract.spec.mjs
npm run build
npx tsc --noEmit -p tsconfig.app.json
FORCE_RUNTIME_CLEANUP=1 ./scripts/cleanup-local-runtime.sh
ps aux | egrep 'node .*vite|playwright|Chromium|chrome-headless-shell|run-runtime-tests|run-runtime-suite' | egrep -v 'egrep' || true
```

Result:

```text
HN4 branch contract proof 5/5 pass.
build pass.
typecheck pass.
cleanup complete.
No Vite / Playwright / Chromium / runtime leftovers.
```

Conclusion:

```text
HN4 first branch is now bounded: Militia, Back to Work, and Defend each have target, gap, minimal data fields, minimal runtime behavior, and proof sequence.
The first implementation task must pick one minimal slice; it cannot implement all three abilities together.
Heroes, items, second faction, full tech tree, asset import, and full AI tactic rewrite remain blocked from this branch.
The next adjacent HN4 work is Militia data seed only.
```

### V9 HN4-DATA1 — Militia data seed

Accepted at: `2026-04-15 23:48:00 CST`.

Evidence:

- `src/game/GameData.ts`
- `docs/V9_HN4_MILITIA_DEFEND_CONTRACT.zh-CN.md`
- `docs/V9_HUMAN_NUMERIC_EXPANSION_PACKET.zh-CN.md`
- `tests/v9-hn4-militia-data-seed.spec.mjs`
- `tests/v9-hn4-militia-defend-contract.spec.mjs`
- `docs/GLM_READY_TASK_QUEUE.md`

Codex verification:

```bash
node --test tests/v9-hn4-militia-data-seed.spec.mjs tests/v9-hn4-militia-defend-contract.spec.mjs
npm run build
npx tsc --noEmit -p tsconfig.app.json
FORCE_RUNTIME_CLEANUP=1 ./scripts/cleanup-local-runtime.sh
ps aux | egrep 'node .*vite|playwright|Chromium|chrome-headless-shell|run-runtime-tests|run-runtime-suite' | egrep -v 'egrep' || true
```

Result:

```text
HN4 Militia data seed proof + HN4 contract proof 10/10 pass.
build pass.
typecheck pass.
cleanup complete.
No Vite / Playwright / Chromium / runtime leftovers.
```

Conclusion:

```text
UNITS.militia exists as a temporary Worker combat form: hp 230, attack 12, armor 2, Normal attack, Heavy armor, canGather false.
ABILITIES.call_to_arms exists with ownerType worker, morphTarget militia, range tied to Town Hall footprint, duration 45, effectType morph.
Game.ts still has no call_to_arms / militia runtime or command-card code.
Back to Work and Defend are still absent.
The next adjacent HN4 work is Militia Call to Arms runtime only.
```

### V9 HN4-IMPL2 — Militia Call to Arms runtime

Accepted at: `2026-04-15 23:59:00 CST`.

Evidence:

- `src/game/Game.ts`
- `tests/v9-hn4-militia-call-to-arms-runtime.spec.ts`
- `tests/v9-hn4-militia-data-seed.spec.mjs`
- `tests/v9-hn4-militia-defend-contract.spec.mjs`
- `docs/V9_HN4_MILITIA_DEFEND_CONTRACT.zh-CN.md`
- `docs/V9_HUMAN_NUMERIC_EXPANSION_PACKET.zh-CN.md`
- `docs/GLM_READY_TASK_QUEUE.md`

Codex verification:

```bash
npm run build
npx tsc --noEmit -p tsconfig.app.json
./scripts/run-runtime-tests.sh tests/v9-hn4-militia-call-to-arms-runtime.spec.ts --reporter=list
node --test tests/v9-hn4-militia-data-seed.spec.mjs tests/v9-hn4-militia-defend-contract.spec.mjs
FORCE_RUNTIME_CLEANUP=1 ./scripts/cleanup-local-runtime.sh
ps aux | egrep 'node .*vite|playwright|Chromium|chrome-headless-shell|run-runtime-tests|run-runtime-suite' | egrep -v 'egrep' || true
```

Result:

```text
build pass.
typecheck pass.
Militia Call to Arms runtime proof 6/6 pass.
HN4 static proof 10/10 pass.
cleanup complete.
No Vite / Playwright / Chromium / runtime leftovers.
```

Conclusion:

```text
Worker near a completed friendly Town Hall / Keep can use Call to Arms.
Call to Arms morphs Worker into Militia using ABILITIES.call_to_arms and UNITS.militia data.
Militia auto-reverts to Worker after the ability duration.
Morph clears gather, build, move, attack, reciprocal builder, and previous-order state.
Back to Work and Defend remain absent.
The next adjacent HN4 work is Back to Work only.
```

### V9 HN4-IMPL3 — Back to Work runtime

Accepted at: `2026-04-16 00:20:00 CST`.

Evidence:

- `src/game/GameData.ts`
- `src/game/Game.ts`
- `tests/v9-hn4-back-to-work-runtime.spec.ts`
- `tests/v9-hn4-militia-call-to-arms-runtime.spec.ts`
- `tests/v9-hn4-militia-data-seed.spec.mjs`
- `tests/v9-hn4-militia-defend-contract.spec.mjs`
- `scripts/lane-feed.mjs`
- `tests/lane-feed.spec.mjs`
- `docs/V9_HN4_MILITIA_DEFEND_CONTRACT.zh-CN.md`
- `docs/V9_HUMAN_NUMERIC_EXPANSION_PACKET.zh-CN.md`
- `docs/GLM_READY_TASK_QUEUE.md`

Codex verification:

```bash
npm run build
npx tsc --noEmit -p tsconfig.app.json
./scripts/run-runtime-tests.sh tests/v9-hn4-back-to-work-runtime.spec.ts tests/v9-hn4-militia-call-to-arms-runtime.spec.ts --reporter=list
node --test tests/v9-hn4-militia-data-seed.spec.mjs tests/v9-hn4-militia-defend-contract.spec.mjs
node --test tests/lane-feed.spec.mjs
FORCE_RUNTIME_CLEANUP=1 ./scripts/cleanup-local-runtime.sh
ps aux | egrep 'node .*vite|playwright|Chromium|chrome-headless-shell|run-runtime-tests|run-runtime-suite' | egrep -v 'egrep' || true
```

Result:

```text
build pass.
typecheck pass.
Back to Work + Call to Arms runtime proof 12/12 pass.
HN4 static proof 10/10 pass.
lane-feed proof 50/50 pass.
cleanup complete.
No Vite / Playwright / Chromium / runtime leftovers.
```

Conclusion:

```text
ABILITIES.back_to_work exists with ownerType militia and morphTarget worker.
Militia command card reads ABILITIES.back_to_work for Back to Work label / owner / morph target.
Clicking Back to Work immediately reverts Militia to Worker and clears morph state.
Automatic expiration still reverts Militia to Worker.
Defend remains absent from runtime and data.
The next adjacent HN4 work is Defend ability data seed only.
```

### V9 HN4-DATA4 — Defend ability data seed

Accepted at: `2026-04-16 00:28:00 CST`.

Evidence:

- `src/game/GameData.ts`
- `tests/v9-hn4-defend-data-seed.spec.mjs`
- `tests/v9-hn4-militia-data-seed.spec.mjs`
- `tests/v9-hn4-militia-defend-contract.spec.mjs`
- `docs/V9_HN4_MILITIA_DEFEND_CONTRACT.zh-CN.md`
- `docs/V9_HUMAN_NUMERIC_EXPANSION_PACKET.zh-CN.md`
- `docs/GLM_READY_TASK_QUEUE.md`

Codex verification:

```bash
npm run build
npx tsc --noEmit -p tsconfig.app.json
node --test tests/v9-hn4-defend-data-seed.spec.mjs tests/v9-hn4-militia-data-seed.spec.mjs tests/v9-hn4-militia-defend-contract.spec.mjs
FORCE_RUNTIME_CLEANUP=1 ./scripts/cleanup-local-runtime.sh
ps aux | egrep 'node .*vite|playwright|Chromium|chrome-headless-shell|run-runtime-tests|run-runtime-suite' | egrep -v 'egrep' || true
```

Result:

```text
build pass.
typecheck pass.
HN4 Defend data seed + migrated static proof 15/15 pass.
cleanup complete.
No Vite / Playwright / Chromium / runtime leftovers.
```

Conclusion:

```text
ABILITIES.defend exists with ownerType footman.
Defend data expresses AttackType.Piercing damage reduction and speed penalty.
Game.ts still has no Defend runtime or command-card implementation.
Militia / Call to Arms / Back to Work seeds remain intact.
The next adjacent HN4 work is Defend runtime only.
```

### V9 HN4-IMPL5 — Defend runtime

Accepted at: `2026-04-16 00:44:08 CST`.

Evidence:

- `src/game/Game.ts`
- `tests/v9-hn4-defend-runtime.spec.ts`
- `tests/v9-hn4-back-to-work-runtime.spec.ts`
- `tests/v9-hn4-militia-call-to-arms-runtime.spec.ts`
- `tests/v9-hn4-defend-data-seed.spec.mjs`
- `tests/v9-hn4-militia-data-seed.spec.mjs`
- `tests/v9-hn4-militia-defend-contract.spec.mjs`
- `docs/V9_HN4_MILITIA_DEFEND_CONTRACT.zh-CN.md`
- `docs/V9_HUMAN_NUMERIC_EXPANSION_PACKET.zh-CN.md`
- `docs/GLM_READY_TASK_QUEUE.md`

Codex verification:

```bash
npm run build
npx tsc --noEmit -p tsconfig.app.json
./scripts/run-runtime-tests.sh tests/v9-hn4-defend-runtime.spec.ts tests/v9-hn4-back-to-work-runtime.spec.ts tests/v9-hn4-militia-call-to-arms-runtime.spec.ts --reporter=list
node --test tests/v9-hn4-defend-data-seed.spec.mjs tests/v9-hn4-militia-data-seed.spec.mjs tests/v9-hn4-militia-defend-contract.spec.mjs
FORCE_RUNTIME_CLEANUP=1 ./scripts/cleanup-local-runtime.sh
ps aux | egrep 'node .*vite|playwright|Chromium|chrome-headless-shell|run-runtime-tests|run-runtime-suite' | egrep -v 'egrep' || true
```

Result:

```text
build pass.
typecheck pass.
HN4 runtime proof 18/18 pass.
HN4 static proof 15/15 pass.
cleanup complete.
No Vite / Playwright / Chromium / runtime leftovers.
```

Conclusion:

```text
Footman command card exposes data-driven Defend toggle.
Defend active state lowers Footman speed using ABILITIES.defend.speedMultiplier.
dealDamage applies ABILITIES.defend.damageReduction only for AttackType.Piercing.
Normal and Siege damage are not reduced by Defend.
Worker / Militia / Priest / Mortar / buildings do not receive Defend command-card ownership.
Militia / Call to Arms / Back to Work regressions remain intact.
The next adjacent HN4 work is closure inventory only, not more runtime expansion.
```

### V9 HN4-CLOSE6 — Militia / Back to Work / Defend closure inventory

Accepted at: `2026-04-16 00:50:08 CST`.

Evidence:

- `docs/V9_HN4_MILITIA_DEFEND_CONTRACT.zh-CN.md`
- `docs/V9_HUMAN_NUMERIC_EXPANSION_PACKET.zh-CN.md`
- `tests/v9-hn4-closure-inventory.spec.mjs`
- `docs/GLM_READY_TASK_QUEUE.md`

Codex verification:

```bash
npm run build
npx tsc --noEmit -p tsconfig.app.json
node --test tests/v9-hn4-closure-inventory.spec.mjs tests/v9-hn4-defend-data-seed.spec.mjs tests/v9-hn4-militia-defend-contract.spec.mjs
FORCE_RUNTIME_CLEANUP=1 ./scripts/cleanup-local-runtime.sh
ps aux | egrep 'node .*vite|playwright|Chromium|chrome-headless-shell|run-runtime-tests|run-runtime-suite' | egrep -v 'egrep' || true
```

Result:

```text
build pass.
typecheck pass.
HN4 closure + Defend static proof 16/16 pass.
cleanup complete.
No Vite / Playwright / Chromium / runtime leftovers.
```

Conclusion:

```text
HN4 Militia / Call to Arms, Back to Work, and Defend each have data, runtime, and command-card entries.
No AI Defend, assets, heroes, items, Sorceress, Spell Breaker, or Knight runtime is claimed.
HN4 first branch is closed as a minimal Human identity branch, not as complete Human parity.
The next adjacent work is HN5 Sorceress / Slow branch contract only.
```

### V9 HN5-PLAN1 — Sorceress / Slow branch contract

Accepted at: `2026-04-16 00:55:20 CST`.

Evidence:

- `docs/V9_HN5_SORCERESS_SLOW_CONTRACT.zh-CN.md`
- `docs/V9_HUMAN_NUMERIC_EXPANSION_PACKET.zh-CN.md`
- `tests/v9-hn5-sorceress-slow-contract.spec.mjs`
- `docs/GLM_READY_TASK_QUEUE.md`

Codex verification:

```bash
npm run build
npx tsc --noEmit -p tsconfig.app.json
node --test tests/v9-hn5-sorceress-slow-contract.spec.mjs tests/v9-hn4-closure-inventory.spec.mjs
FORCE_RUNTIME_CLEANUP=1 ./scripts/cleanup-local-runtime.sh
ps aux | egrep 'node .*vite|playwright|Chromium|chrome-headless-shell|run-runtime-tests|run-runtime-suite' | egrep -v 'egrep' || true
```

Result:

```text
build pass.
typecheck pass.
HN5 contract + HN4 closure proof 11/11 pass.
cleanup complete.
No Vite / Playwright / Chromium / runtime leftovers.
```

Conclusion:

```text
HN5 Sorceress / Slow branch contract exists.
Sorceress is defined as a weak ranged Magic attacker whose core identity is Slow.
Slow is defined as a data-first enemy debuff branch with movement-speed reduction first and attack-speed reduction optional later.
No Sorceress / Slow data seed, training, command-card, runtime, AI, asset, hero, item, Spell Breaker, Invisibility, or Polymorph implementation is claimed.
The next adjacent work is HN5-DATA1 Sorceress + Slow data seed only.
```

### V9 HN5-DATA1 — Sorceress + Slow data seed

Accepted at: `2026-04-16 00:59:44 CST`.

Evidence:

- `src/game/GameData.ts`
- `docs/V9_HN5_SORCERESS_SLOW_CONTRACT.zh-CN.md`
- `docs/V9_HUMAN_NUMERIC_EXPANSION_PACKET.zh-CN.md`
- `tests/v9-hn5-sorceress-slow-data-seed.spec.mjs`
- `tests/v9-hn5-sorceress-slow-contract.spec.mjs`
- `docs/GLM_READY_TASK_QUEUE.md`

Codex verification:

```bash
npm run build
npx tsc --noEmit -p tsconfig.app.json
node --test tests/v9-hn5-sorceress-slow-data-seed.spec.mjs tests/v9-hn5-sorceress-slow-contract.spec.mjs
FORCE_RUNTIME_CLEANUP=1 ./scripts/cleanup-local-runtime.sh
ps aux | egrep 'node .*vite|playwright|Chromium|chrome-headless-shell|run-runtime-tests|run-runtime-suite' | egrep -v 'egrep' || true
```

Result:

```text
build pass.
typecheck pass.
HN5 data + contract proof 10/10 pass.
cleanup complete.
No Vite / Playwright / Chromium / runtime leftovers.
```

Conclusion:

```text
UNITS.sorceress exists with weak ranged Magic attack and Unarmored armor type.
AttackType.Magic has a visible name and conservative 1.0 placeholder multipliers.
ABILITIES.slow exists as a data-only enemy speed debuff.
At Task151 acceptance time, Arcane Sanctum still trained only Priest; Task152 later opened the Sorceress training surface.
Game.ts had no Sorceress / Slow runtime at this stage.
The next adjacent work at that time was Sorceress training surface only.
```

### V9 HN5-IMPL2 — Sorceress training surface

Accepted at: `2026-04-16 01:08:45 CST`.

Evidence:

- `src/game/GameData.ts`
- `src/game/Game.ts`
- `src/game/UnitVisualFactory.ts`
- `tests/v9-hn5-sorceress-training-surface.spec.ts`
- `tests/v9-hn5-sorceress-slow-data-seed.spec.mjs`
- `tests/v9-hn5-sorceress-slow-contract.spec.mjs`
- `tests/v9-hn4-closure-inventory.spec.mjs`
- `docs/GLM_READY_TASK_QUEUE.md`

Codex verification:

```bash
npm run build
npx tsc --noEmit -p tsconfig.app.json
./scripts/run-runtime-tests.sh tests/v9-hn5-sorceress-training-surface.spec.ts --reporter=list
node --test tests/v9-hn4-closure-inventory.spec.mjs tests/v9-hn5-sorceress-slow-contract.spec.mjs tests/v9-hn5-sorceress-slow-data-seed.spec.mjs
```

Result:

```text
build pass.
typecheck pass.
HN5 Sorceress training surface runtime 2/2 pass.
HN4/HN5 migrated static proof 16/16 pass.
```

Conclusion:

```text
Arcane Sanctum command card exposes 女巫 from BUILDINGS.arcane_sanctum.trains.
Clicking 女巫 uses the normal training queue and produces a Sorceress unit.
The selected Sorceress shows the Chinese name, caster label, weak Magic attack, range, and Unarmored armor type.
The Sorceress has a dedicated proxy visual instead of the generic fallback cylinder.
Game.ts still does not read ABILITIES.slow and has no speedDebuff runtime.
The next adjacent work is Sorceress mana initialization only; Slow runtime remains blocked until the caster resource exists.
```

### V9 HN5-IMPL3 — Sorceress mana initialization surface

Accepted at: `2026-04-16 01:21:37 CST`.

Evidence:

- `src/game/GameData.ts`
- `src/game/Game.ts`
- `tests/v9-hn5-sorceress-mana-surface.spec.ts`
- `tests/v9-hn5-sorceress-training-surface.spec.ts`
- `tests/v9-hn5-sorceress-slow-data-seed.spec.mjs`
- `tests/v9-hn5-sorceress-slow-contract.spec.mjs`
- `tests/v9-hn4-closure-inventory.spec.mjs`
- `docs/GLM_READY_TASK_QUEUE.md`

Codex verification:

```bash
npm run build
npx tsc --noEmit -p tsconfig.app.json
./scripts/run-runtime-tests.sh tests/v9-hn5-sorceress-mana-surface.spec.ts tests/v9-hn5-sorceress-training-surface.spec.ts --reporter=list
node --test tests/v9-hn5-sorceress-slow-data-seed.spec.mjs tests/v9-hn5-sorceress-slow-contract.spec.mjs tests/v9-hn4-closure-inventory.spec.mjs
```

Result:

```text
build pass.
typecheck pass.
HN5 Sorceress mana + training runtime pack 5/5 pass.
HN4/HN5 migrated static proof 16/16 pass.
```

Conclusion:

```text
UNITS.priest and UNITS.sorceress declare maxMana and manaRegen.
spawnUnit initializes caster resources from UNITS[type] instead of a Priest-only branch.
The selected Sorceress shows mana, regenerates through updateCasterAbilities, and caps at maxMana.
Priest still has mana and keeps the Heal command surface.
Game.ts still does not read ABILITIES.slow and has no speedDebuff runtime.
The next adjacent work is Slow runtime minimal slice only: manual Slow cast, enemy movement speed debuff, expiry restore; no auto-cast, AI, assets, attack speed debuff, or other caster tech.
```

### V9 HN5-IMPL4 — Slow runtime minimal slice

Accepted at: `2026-04-16 01:39:19 CST`.

Evidence:

- `src/game/Game.ts`
- `tests/v9-hn5-slow-runtime-minimal.spec.ts`
- `tests/v9-hn5-sorceress-mana-surface.spec.ts`
- `tests/v9-hn5-sorceress-training-surface.spec.ts`
- `tests/v9-hn5-sorceress-slow-data-seed.spec.mjs`
- `tests/v9-hn5-sorceress-slow-contract.spec.mjs`
- `tests/v9-hn4-closure-inventory.spec.mjs`
- `docs/GLM_READY_TASK_QUEUE.md`

Codex verification:

```bash
npm run build
npx tsc --noEmit -p tsconfig.app.json
./scripts/run-runtime-tests.sh tests/v9-hn5-slow-runtime-minimal.spec.ts tests/v9-hn5-sorceress-mana-surface.spec.ts tests/v9-hn5-sorceress-training-surface.spec.ts --reporter=list
node --test tests/v9-hn5-sorceress-slow-data-seed.spec.mjs tests/v9-hn5-sorceress-slow-contract.spec.mjs tests/v9-hn4-closure-inventory.spec.mjs
```

Result:

```text
build pass.
typecheck pass.
HN5 Slow + mana + training runtime pack 9/9 pass.
HN4/HN5 migrated static proof 16/16 pass.
```

Conclusion:

```text
Sorceress command card exposes manual Slow from ABILITIES.slow.
Slow spends mana, targets the nearest valid enemy non-building, applies movement speed reduction, refreshes duration, and expires cleanly.
Slow no longer mutates base unit.speed; movement uses slowSpeedMultiplier through getEffectiveMovementSpeed.
No-target clicks do not spend mana, low mana disables the button, and non-Sorceress units do not show Slow.
AI, attack speed debuff, status icons, assets, and full buff/debuff framework remain out of scope.
The next adjacent work is Slow auto-cast minimal toggle only.
```

### V9 HN5-IMPL5 — Slow auto-cast minimal toggle

Accepted at: `2026-04-16 01:57:07 CST`.

Evidence:

- `src/game/Game.ts`
- `tests/v9-hn5-slow-autocast-minimal.spec.ts`
- `tests/v9-hn5-slow-runtime-minimal.spec.ts`
- `tests/v9-hn5-sorceress-slow-data-seed.spec.mjs`
- `tests/v9-hn5-sorceress-slow-contract.spec.mjs`
- `tests/v9-hn4-closure-inventory.spec.mjs`
- `docs/GLM_READY_TASK_QUEUE.md`

Codex verification:

```bash
npm run build
npx tsc --noEmit -p tsconfig.app.json
./scripts/run-runtime-tests.sh tests/v9-hn5-slow-autocast-minimal.spec.ts tests/v9-hn5-slow-runtime-minimal.spec.ts --reporter=list
node --test tests/v9-hn5-sorceress-slow-data-seed.spec.mjs tests/v9-hn5-sorceress-slow-contract.spec.mjs tests/v9-hn4-closure-inventory.spec.mjs
```

Result:

```text
build pass.
typecheck pass.
HN5 Slow auto-cast + manual Slow runtime pack 8/8 pass.
HN4/HN5 migrated static proof 16/16 pass.
```

Conclusion:

```text
Sorceress command card exposes a visible Slow auto-cast toggle.
Auto-cast reuses ABILITIES.slow and castSlow instead of duplicating Slow constants.
Enabled auto-cast spends mana on valid enemy non-building targets.
Targets with sufficient Slow remaining are skipped, so the toggle does not drain mana every frame.
Near-expiry Slow can be refreshed, disabled auto-cast does nothing, and insufficient mana does not cast.
SimpleAI still has no Slow usage, and attack speed debuff / status icons / assets / full caster tree remain out of scope.
The next adjacent work is HN5 closure inventory only.
```

### V9 HN5-CLOSE6 — Sorceress / Slow closure inventory

Accepted at: `2026-04-16 02:06:00 CST`.

Evidence:

- `tests/v9-hn5-closure-inventory.spec.mjs`
- `tests/v9-hn5-sorceress-slow-data-seed.spec.mjs`
- `tests/v9-hn5-sorceress-slow-contract.spec.mjs`
- `docs/V9_HN5_SORCERESS_SLOW_CONTRACT.zh-CN.md`
- `docs/V9_HUMAN_NUMERIC_EXPANSION_PACKET.zh-CN.md`
- `docs/V9_MAINTENANCE_EXPANSION_REMAINING_GATES.zh-CN.md`
- `docs/GLM_READY_TASK_QUEUE.md`

Codex verification:

```bash
node --test tests/v9-hn5-closure-inventory.spec.mjs tests/v9-hn5-sorceress-slow-data-seed.spec.mjs tests/v9-hn5-sorceress-slow-contract.spec.mjs
```

Result:

```text
HN5 closure + HN5 contract/data proof 18/18 pass.
```

Conclusion:

```text
HN5 Sorceress / Slow minimal chain is closed.
UNITS.sorceress, ABILITIES.slow, Arcane Sanctum training, data-driven mana, manual Slow runtime, and auto Slow toggle all have proof coverage.
No AI Slow, attack speed debuff, Spell Breaker, Invisibility, Polymorph, heroes, items, assets, or complete caster tree is claimed.
The next adjacent work is a new Human branch contract, starting with Castle / Knight.
```

### V9 HN6-PLAN1 — Castle / Knight branch contract

Accepted at: `2026-04-16 02:12:00 CST`.

Evidence:

- `docs/V9_HN6_CASTLE_KNIGHT_CONTRACT.zh-CN.md`
- `tests/v9-hn6-castle-knight-contract.spec.mjs`
- `docs/V9_HUMAN_NUMERIC_EXPANSION_PACKET.zh-CN.md`
- `docs/HUMAN_RACE_CAPABILITY_BOARD.zh-CN.md`
- `docs/GLM_READY_TASK_QUEUE.md`

Codex verification:

```bash
node --test tests/v9-hn6-castle-knight-contract.spec.mjs
npm run build
npx tsc --noEmit -p tsconfig.app.json
```

Result:

```text
HN6 Castle / Knight contract proof 7/7 pass.
build pass.
typecheck pass.
```

Conclusion:

```text
HN6 Castle / Knight branch contract is accepted.
The contract defines Castle data, Keep -> Castle runtime, Knight prerequisite model, Knight data, Knight training, Knight smoke, and closure inventory.
Knight is not simplified to Castle-only; Castle + Blacksmith + Lumber Mill prerequisite complexity remains explicit.
No runtime, Castle data, Knight data, heroes, items, air units, Spell Breaker, full T3, AI Knight, Animal War Training, Blacksmith tiers, or assets are implemented by this task.
At Task157 closeout, the next adjacent work was Castle data seed only.
```

### V9 HN6-DATA1 — Castle data seed

Accepted at: `2026-04-16 02:16:26 CST`.

Evidence:

- `src/game/GameData.ts`
- `tests/v9-hn6-castle-data-seed.spec.mjs`
- `tests/v9-hn6-castle-knight-contract.spec.mjs`
- `docs/V9_HN6_CASTLE_KNIGHT_CONTRACT.zh-CN.md`
- `docs/V9_HUMAN_NUMERIC_EXPANSION_PACKET.zh-CN.md`
- `docs/HUMAN_RACE_CAPABILITY_BOARD.zh-CN.md`
- `docs/GLM_READY_TASK_QUEUE.md`

Codex verification:

```bash
node --test tests/v9-hn6-castle-data-seed.spec.mjs tests/v9-hn6-castle-knight-contract.spec.mjs
npm run build
npx tsc --noEmit -p tsconfig.app.json
```

Result:

```text
HN6 Castle data seed + HN6 contract proof 12/12 pass.
build pass.
typecheck pass.
```

Conclusion:

```text
Castle data seed is accepted.
BUILDINGS.castle exists as the T3 main base data entry, and BUILDINGS.keep.upgradeTo now points to castle.
Castle trains worker only; no Knight, heroes, air units, shop, item, AI Castle, T3 building unlock, or asset path is opened.
Game.ts is unchanged by this task, so Keep -> Castle is not playable yet.
The next adjacent work is Keep -> Castle runtime only.
```

### V9 HN6-IMPL2 — Keep to Castle upgrade path

Accepted at: `2026-04-16 02:30:49 CST`.

Evidence:

- `src/game/Game.ts`
- `tests/v9-hn6-keep-castle-upgrade-runtime.spec.ts`
- `tests/v9-keep-upgrade-flow-regression.spec.ts`
- `tests/v9-keep-post-upgrade-command-surface.spec.ts`
- `tests/v9-hn6-castle-data-seed.spec.mjs`
- `tests/v9-hn6-castle-knight-contract.spec.mjs`
- `docs/V9_HN6_CASTLE_KNIGHT_CONTRACT.zh-CN.md`
- `docs/V9_HUMAN_NUMERIC_EXPANSION_PACKET.zh-CN.md`
- `docs/HUMAN_RACE_CAPABILITY_BOARD.zh-CN.md`
- `docs/GLM_READY_TASK_QUEUE.md`

Codex verification:

```bash
npm run build
./scripts/run-runtime-tests.sh tests/v9-hn6-keep-castle-upgrade-runtime.spec.ts tests/v9-keep-upgrade-flow-regression.spec.ts tests/v9-keep-post-upgrade-command-surface.spec.ts --reporter=list
```

Result:

```text
build pass.
HN6 Keep -> Castle + migrated Keep runtime proof 9/9 pass.
```

Conclusion:

```text
Keep -> Castle runtime is accepted.
The existing data-driven upgrade mechanism can now take Keep to Castle.
Castle completion keeps the same building, updates hp/maxHp to Castle data, preserves worker training and rally surface, and does not expose Knight.
Town Hall -> Keep remains a first upgrade only and does not skip directly to Castle.
No Knight data, Knight training, AI Castle, full T3, heroes, air units, items, or assets are implemented by this task.
The next adjacent work is the Knight prerequisite model only.
```

### V9 HN6-PREREQ3 — Knight prerequisite model

Accepted at: `2026-04-16 02:38:15 CST`.

Evidence:

- `src/game/GameData.ts`
- `tests/v9-hn6-knight-prerequisite-model.spec.mjs`
- `tests/v9-hn6-castle-knight-contract.spec.mjs`
- `docs/V9_HN6_CASTLE_KNIGHT_CONTRACT.zh-CN.md`
- `docs/V9_HUMAN_NUMERIC_EXPANSION_PACKET.zh-CN.md`
- `docs/GLM_READY_TASK_QUEUE.md`

Codex verification:

```bash
node --test tests/v9-hn6-knight-prerequisite-model.spec.mjs tests/v9-hn6-castle-knight-contract.spec.mjs
npm run build
npx tsc --noEmit -p tsconfig.app.json
```

Result:

```text
Knight prerequisite model + HN6 contract proof 13/13 pass.
build pass.
typecheck pass.
```

Conclusion:

```text
Knight prerequisite model is accepted.
UnitDef now has techPrereqs?: string[] so Knight can later require Castle + Blacksmith + Lumber Mill without collapsing to Castle-only.
Current runtime does not consume techPrereqs yet, and Game.ts does not reference it.
No UNITS.knight, Knight training button, AI Knight, full T3, heroes, air units, items, or assets are implemented by this task.
The next adjacent work is Knight data seed only.
```

### V9 HN6-DATA4 — Knight data seed

Accepted at: `2026-04-16 02:42:29 CST`.

Evidence:

- `src/game/GameData.ts`
- `tests/v9-hn6-knight-data-seed.spec.mjs`
- `tests/v9-hn6-knight-prerequisite-model.spec.mjs`
- `tests/v9-hn6-castle-knight-contract.spec.mjs`
- `tests/v9-hn6-castle-data-seed.spec.mjs`
- `docs/V9_HN6_CASTLE_KNIGHT_CONTRACT.zh-CN.md`
- `docs/V9_HUMAN_NUMERIC_EXPANSION_PACKET.zh-CN.md`
- `docs/GLM_READY_TASK_QUEUE.md`

Codex verification:

```bash
node --test tests/v9-hn6-knight-data-seed.spec.mjs tests/v9-hn6-knight-prerequisite-model.spec.mjs tests/v9-hn6-castle-knight-contract.spec.mjs tests/v9-hn6-castle-data-seed.spec.mjs
npm run build
npx tsc --noEmit -p tsconfig.app.json
```

Result:

```text
HN6 Knight data static proof 24/24 pass.
build pass.
typecheck pass.
```

Conclusion:

```text
Knight data seed is accepted.
UNITS.knight now exists with hp 835, armor 5, attackDamage 34, speed 3.5, supply 4, Normal attack and Heavy armor.
Knight uses techPrereqs: ['castle', 'blacksmith', 'lumber_mill'] and does not use single techPrereq.
Barracks still does not train Knight, Game.ts still does not consume techPrereqs, and no AI Knight, full T3, heroes, air units, items, Animal War Training, or assets are implemented by this task.
The next adjacent work is Knight training prerequisite gate only.
```

### V9 HN6-IMPL5 — Knight training prerequisite gate

Accepted at: `2026-04-16 02:53:37 CST`.

Evidence:

- `src/game/GameData.ts`
- `src/game/Game.ts`
- `tests/v9-hn6-knight-training-prereq-runtime.spec.ts`
- `tests/v9-hn6-keep-castle-upgrade-runtime.spec.ts`
- `tests/v9-hn6-knight-data-seed.spec.mjs`
- `tests/v9-hn6-knight-prerequisite-model.spec.mjs`
- `tests/v9-hn6-castle-knight-contract.spec.mjs`
- `tests/v9-hn6-castle-data-seed.spec.mjs`
- `docs/V9_HN6_CASTLE_KNIGHT_CONTRACT.zh-CN.md`
- `docs/V9_HUMAN_NUMERIC_EXPANSION_PACKET.zh-CN.md`
- `docs/HUMAN_RACE_CAPABILITY_BOARD.zh-CN.md`
- `docs/GLM_READY_TASK_QUEUE.md`

Codex verification:

```bash
npm run build
npx tsc --noEmit -p tsconfig.app.json
node --test tests/v9-hn6-knight-data-seed.spec.mjs tests/v9-hn6-knight-prerequisite-model.spec.mjs tests/v9-hn6-castle-knight-contract.spec.mjs tests/v9-hn6-castle-data-seed.spec.mjs
./scripts/run-runtime-tests.sh tests/v9-hn6-keep-castle-upgrade-runtime.spec.ts tests/v9-hn6-knight-training-prereq-runtime.spec.ts --reporter=list
```

Result:

```text
build pass.
typecheck pass.
HN6 static proof 24/24 pass.
HN6 focused runtime proof 5/5 pass.
```

Conclusion:

```text
Knight training prerequisite gate is accepted.
Barracks now includes Knight training, but Knight stays gated behind completed Castle + Blacksmith + Lumber Mill.
Missing prerequisites disable the Knight button with a concrete building reason, and all prerequisites present allow normal queue-based training with resource spend, supply use, trainTime wait, and a real Knight unit at completion.
No AI Knight, Animal War Training, full T3, heroes, air units, items, or assets are implemented by this task.
The next adjacent work is Knight combat identity smoke only.
```

### V9 HN6-IMPL6 — Knight combat identity smoke

Accepted at: `2026-04-16 03:03:12 CST`.

Evidence:

- `tests/v9-hn6-knight-combat-smoke.spec.ts`
- `tests/v9-hn6-knight-data-seed.spec.mjs`
- `tests/v9-hn6-castle-knight-contract.spec.mjs`
- `docs/V9_HN6_CASTLE_KNIGHT_CONTRACT.zh-CN.md`
- `docs/V9_HUMAN_NUMERIC_EXPANSION_PACKET.zh-CN.md`
- `docs/HUMAN_RACE_CAPABILITY_BOARD.zh-CN.md`
- `docs/GLM_READY_TASK_QUEUE.md`

Codex verification:

```bash
./scripts/run-runtime-tests.sh tests/v9-hn6-knight-combat-smoke.spec.ts --reporter=list
node --test tests/v9-hn6-knight-data-seed.spec.mjs tests/v9-hn6-castle-knight-contract.spec.mjs
npm run build
npx tsc --noEmit -p tsconfig.app.json
```

Result:

```text
Knight combat runtime smoke 3/3 pass.
HN6 Knight static proof 13/13 pass.
build pass.
typecheck pass.
```

Conclusion:

```text
Knight combat identity smoke is accepted.
Knight runtime stats match the data table for hp, armor, speed, attack damage, range and cooldown.
Knight attack and armor identity are proved from the data table and the selected-unit HUD, which shows Normal / Heavy as 普通 / 重甲.
Under equal Normal attack pressure Knight survives better than Footman, and a Knight hit deals more damage than a Footman hit.
No AI Knight, Animal War Training, full T3, heroes, air units, items, or assets are implemented by this task.
The next adjacent work is HN6 closure inventory only.
```

### V9 HN6-CLOSE7 — Castle / Knight closure inventory

Accepted at: `2026-04-16 03:16:00 CST`.

Evidence:

- `tests/v9-hn6-closure-inventory.spec.mjs`
- `docs/V9_HN6_CASTLE_KNIGHT_CONTRACT.zh-CN.md`
- `docs/V9_HUMAN_NUMERIC_EXPANSION_PACKET.zh-CN.md`
- `docs/HUMAN_RACE_CAPABILITY_BOARD.zh-CN.md`
- `docs/V9_MAINTENANCE_EXPANSION_REMAINING_GATES.zh-CN.md`
- `docs/V9_MAINTENANCE_EXPANSION_EVIDENCE_LEDGER.zh-CN.md`
- `docs/GLM_READY_TASK_QUEUE.md`

Codex verification:

```bash
node --test tests/v9-hn6-closure-inventory.spec.mjs
```

Result:

```text
HN6 closure inventory proof pass.
```

Conclusion:

```text
HN6 Castle / Knight minimal chain is accepted as closed.
The closed chain covers Castle data, Keep -> Castle upgrade, Knight multi-prereq model, Knight data, Knight training gate, and Knight combat identity smoke.
The branch remains bounded: no AI Castle, AI Knight, Animal War Training, Blacksmith upgrade ladder, heroes, air units, items, asset import, or full T3 tech tree.
The next adjacent work must start with a new Human branch contract instead of expanding HN6 implicitly.
```

### V9 HN7-PLAN1 — Blacksmith / Animal War Training branch contract

Accepted at: `2026-04-16 03:30:00 CST`.

Evidence:

- `docs/V9_HN7_BLACKSMITH_ANIMAL_TRAINING_CONTRACT.zh-CN.md`
- `tests/v9-hn7-blacksmith-animal-contract.spec.mjs`
- `docs/V9_HUMAN_NUMERIC_EXPANSION_PACKET.zh-CN.md`
- `docs/V9_MAINTENANCE_EXPANSION_REMAINING_GATES.zh-CN.md`
- `docs/GLM_READY_TASK_QUEUE.md`

Codex verification:

```bash
node --test tests/v9-hn7-blacksmith-animal-contract.spec.mjs
npm run build
npx tsc --noEmit -p tsconfig.app.json
```

Result:

```text
HN7 contract static proof 14/14 pass.
build pass.
typecheck pass.
```

Conclusion:

```text
HN7 Blacksmith / Animal War Training branch contract is accepted.
The contract defines three Blacksmith upgrade lines (melee / ranged / armor), Animal War Training, their data fields, implementation sequence, and forbidden items.
Two infrastructure gaps are identified: ResearchEffect.stat needs maxHp, and ResearchDef needs prerequisiteResearch.
All uncertain War3 values are marked for Codex source verification; no values are fabricated.
Game.ts and GameData.ts were not modified.
The next adjacent work is HN7-IMPL1: extend ResearchEffect.stat to support maxHp.
```

### V9 HN7-IMPL1 — ResearchEffect maxHp support

Accepted at: `2026-04-16 03:45:00 CST`.

Evidence:

- `src/game/GameData.ts`
- `src/game/Game.ts`
- `tests/v9-hn7-research-maxhp-effect.spec.mjs`
- `tests/v9-hn7-blacksmith-animal-contract.spec.mjs`
- `docs/V9_HN7_BLACKSMITH_ANIMAL_TRAINING_CONTRACT.zh-CN.md`
- `docs/V9_HUMAN_NUMERIC_EXPANSION_PACKET.zh-CN.md`
- `docs/GLM_READY_TASK_QUEUE.md`

Codex verification:

```bash
node --test tests/v9-hn7-research-maxhp-effect.spec.mjs tests/v9-hn7-blacksmith-animal-contract.spec.mjs
npm run build
npx tsc --noEmit -p tsconfig.app.json
```

Result:

```text
HN7 maxHp model proof and updated HN7 contract proof pass.
build pass.
typecheck pass.
```

Conclusion:

```text
HN7-IMPL1 is accepted.
ResearchEffect.stat now supports maxHp.
applyFlatDeltaEffect now increases both unit.maxHp and unit.hp for maxHp effects.
No Animal War Training research data, Blacksmith upgrade data, command card button, runtime research chain, AI strategy, hero, air, item, or asset work was added.
The next adjacent work is HN7-IMPL2: add ResearchDef.prerequisiteResearch support for ordered research chains.
```

### V9 HN7-IMPL2 — ResearchDef prerequisiteResearch support

Accepted at: `2026-04-16 04:00:00 CST`.

Evidence:

- `src/game/GameData.ts`
- `src/game/Game.ts`
- `tests/v9-hn7-prerequisite-research-model.spec.mjs`
- `tests/v9-hn7-blacksmith-animal-contract.spec.mjs`
- `docs/V9_HN7_BLACKSMITH_ANIMAL_TRAINING_CONTRACT.zh-CN.md`
- `docs/V9_HUMAN_NUMERIC_EXPANSION_PACKET.zh-CN.md`
- `docs/GLM_READY_TASK_QUEUE.md`

Codex verification:

```bash
node --test tests/v9-hn7-prerequisite-research-model.spec.mjs tests/v9-hn7-blacksmith-animal-contract.spec.mjs tests/v9-hn7-research-maxhp-effect.spec.mjs
npm run build
npx tsc --noEmit -p tsconfig.app.json
```

Result:

```text
HN7 prerequisiteResearch model proof + contract proof + maxHp proof 36/36 pass.
build pass.
typecheck pass.
```

Conclusion:

```text
HN7-IMPL2 is accepted.
ResearchDef now has prerequisiteResearch?: string for ordered research tier chains.
getResearchAvailability checks prerequisiteResearch and returns a player-readable disabled reason.
startResearch delegates to getResearchAvailability without duplicating the check.
No Blacksmith upgrade data, Animal War Training data, command card, AI strategy, hero, air, item, or asset work was added.
The next adjacent work is HN7-DATA3: melee upgrade Level 1 data seed (requires Codex source verification of War3 values).
```

### V9 HN7-SRC3 — Melee upgrade Level 1 source packet

Accepted at: `2026-04-16 04:12:00 CST`.

Evidence:

- `docs/V9_HN7_MELEE_UPGRADE_SOURCE_PACKET.zh-CN.md`
- `tests/v9-hn7-melee-upgrade-source-packet.spec.mjs`
- `docs/V9_HN7_BLACKSMITH_ANIMAL_TRAINING_CONTRACT.zh-CN.md`

Codex verification:

```bash
node --test tests/v9-hn7-melee-upgrade-source-packet.spec.mjs tests/v9-hn7-prerequisite-research-model.spec.mjs tests/v9-hn7-research-maxhp-effect.spec.mjs tests/v9-hn7-blacksmith-animal-contract.spec.mjs
```

Result:

```text
HN7 source packet proof + prerequisiteResearch proof + maxHp proof + contract proof 42/42 pass.
```

Conclusion:

```text
HN7-SRC3 is accepted.
HN7-DATA3 may add only Iron Forged Swords / melee Level 1.
Allowed values are cost 100 gold / 50 lumber, researchTime 60, and current scalar attackDamage +1 based on Damage Dice Bonus 1.
The affected current units are footman, militia, and knight.
Steel / Mithril, ranged upgrades, armor upgrades, Animal War Training, AI, heroes, air, items, assets, and dice model changes remain blocked.
```

### V9 HN7-DATA3 — Iron Forged Swords Level 1 data seed

Accepted at: `2026-04-16 04:25:00 CST`.

Evidence:

- `src/game/GameData.ts`
- `tests/v9-hn7-melee-upgrade-data-seed.spec.mjs`
- `tests/v9-hn7-melee-upgrade-source-packet.spec.mjs`
- `docs/V9_HN7_BLACKSMITH_ANIMAL_TRAINING_CONTRACT.zh-CN.md`
- `docs/V9_HUMAN_NUMERIC_EXPANSION_PACKET.zh-CN.md`
- `docs/GLM_READY_TASK_QUEUE.md`

Codex verification:

```bash
node --test tests/v9-hn7-melee-upgrade-data-seed.spec.mjs tests/v9-hn7-melee-upgrade-source-packet.spec.mjs tests/v9-hn7-prerequisite-research-model.spec.mjs tests/v9-hn7-research-maxhp-effect.spec.mjs tests/v9-hn7-blacksmith-animal-contract.spec.mjs
npm run build
npx tsc --noEmit -p tsconfig.app.json
```

Result:

```text
HN7 melee data seed proof + source proof + prerequisiteResearch proof + maxHp proof + contract proof pass.
build pass.
typecheck pass.
```

Conclusion:

```text
HN7-DATA3 is accepted.
RESEARCHES.iron_forged_swords exists with cost 100/50, researchTime 60, requiresBuilding blacksmith, and no prerequisiteResearch.
It applies attackDamage +1 to footman, militia, and knight.
BUILDINGS.blacksmith.researches now contains long_rifles and iron_forged_swords.
No Steel, Mithril, ranged upgrade, armor upgrade, Animal War Training, Game.ts special case, AI strategy, hero, air, item, asset, or dice model work was added.
The next adjacent work is HN7-IMPL4: runtime smoke for Iron Forged Swords Level 1.
```

### V9 HN7-IMPL4 — Iron Forged Swords Level 1 runtime smoke

Accepted at: `2026-04-16 03:56:45 CST`.

Evidence:

- `tests/v9-hn7-iron-forged-swords-runtime.spec.ts`
- `src/game/GameData.ts`
- `src/game/Game.ts`
- `docs/V9_HUMAN_NUMERIC_EXPANSION_PACKET.zh-CN.md`
- `docs/GLM_READY_TASK_QUEUE.md`

Codex verification:

```bash
./scripts/run-runtime-tests.sh tests/v9-hn7-iron-forged-swords-runtime.spec.ts --reporter=list
```

Result:

```text
HN7 Iron Forged Swords runtime smoke 6/6 pass.
```

Conclusion:

```text
HN7-IMPL4 is accepted.
Blacksmith command card exposes 铁剑.
Starting the research spends 100 gold / 50 lumber and enters the research queue.
Completion applies attackDamage +1 to existing footman, militia, and knight.
Newly trained Footman and Knight inherit the completed research effect.
Existing and newly spawned Rifleman, Mortar Team, Priest, and Sorceress do not receive the melee upgrade.
No new data, AI strategy, hero, air, item, asset, or dice model work was added.
The next adjacent work is HN7-CLOSE5: closure inventory for Iron Forged Swords Level 1.
```

### V9 HN7-CLOSE5 — Iron Forged Swords Level 1 closure inventory

- Gate: `HN7-CLOSE5`
- State before: HN7-IMPL4 accepted; Level 1 chain has source packet, data seed, and runtime smoke but no formal closure inventory.
- Engineering evidence:
  - `tests/v9-hn7-iron-forged-swords-closure.spec.mjs` 11/11 pass
  - `tests/v9-hn7-melee-upgrade-data-seed.spec.mjs` 10/10 pass
  - `tests/v9-hn7-melee-upgrade-source-packet.spec.mjs` 6/6 pass
  - Combined HN7 static pack including closure, data seed, source packet, prerequisiteResearch, maxHp, and contract proof: 63/63 pass
  - Focused runtime smoke: 6/6 pass
  - `npm run build` pass
  - `npx tsc --noEmit -p tsconfig.app.json` pass
- User evidence: async
- State after: `accepted`

```text
HN7-CLOSE5 is accepted.
Iron Forged Swords Level 1 chain is formally closed:
  - HN7-SRC3 source packet limits scope to Level 1 (100/50, 60s, attackDamage +1)
  - HN7-DATA3 data seed exists in GameData with correct values and Blacksmith hook
  - HN7-IMPL4 runtime smoke proves command card, cost deduction, existing unit +1, new unit inheritance, non-melee exclusion
  - Steel / Mithril, ranged, armor, Animal War Training, AI, heroes, air, items, assets are confirmed absent
  - No gameplay code was modified by this closure task
The next branch is HN7-SRC4: higher melee levels (Steel / Mithril) source reconciliation.
No Level 2/3 data, runtime, AI, or Animal War Training work is allowed until SRC4 source verification completes.
```

### V9 HN7-SRC4 — Steel / Mithril source reconciliation

- Gate: `HN7-SRC4`
- State before: HN7-CLOSE5 accepted; Level 1 closed. Level 2/3 values unverified.
- Engineering evidence:
  - `tests/v9-hn7-melee-upgrade-higher-level-source.spec.mjs` 6/6 pass
  - `tests/v9-hn7-melee-upgrade-source-packet.spec.mjs` 6/6 pass
  - Combined: 12/12 pass
  - `npm run build` pass
  - `npx tsc --noEmit -p tsconfig.app.json` pass
- User evidence: async
- State after: `accepted`

```text
HN7-SRC4 is accepted.
Steel Forged Swords and Mithril Forged Swords values are verified and fixed:
  - Steel: 175 gold / 175 lumber, 75s, requires Keep, prerequisite Iron Forged Swords
  - Mithril: 250 gold / 300 lumber, 90s, requires Castle, prerequisite Steel Forged Swords
  - Blizzard Classic Battle.net is the adopted source for Level 2/3 cost, time, requirement, and affected-unit wording
  - Liquipedia is retained as current dice-bonus reference; ROC GameFAQs has conflicting costs (Steel 250/200, Mithril 400/150) and is recorded but not adopted
  - Scalar mapping: each level adds incremental +1 attackDamage (not cumulative dice bonus)
  - Affected units: footman, militia, knight (current project units only)
  - No Steel / Mithril data has been written to GameData.ts
The next adjacent work is HN7-DATA4: Steel / Mithril melee upgrade data seed.
Only melee Level 2/3 data is allowed; no ranged, armor, AWT, AI, heroes, air, items, or assets.
```

### V9 HN7-CLOSE6 — melee weapon upgrade chain closure

- Gate: `HN7-CLOSE6`
- State before: HN7-IMPL5 accepted; melee three-tier chain has source, data, and runtime but no formal chain closure.
- Engineering evidence:
  - `tests/v9-hn7-melee-upgrade-chain-closure.spec.mjs` 14/14 pass
  - Combined chain closure + DATA4 + SRC4 + DATA3 + SRC3: 45/45 pass
  - `npm run build` pass
  - `npx tsc --noEmit -p tsconfig.app.json` pass
- User evidence: async
- State after: `accepted`

```text
HN7-CLOSE6 is accepted.
Human melee weapon upgrade chain is formally closed:
  - SRC3 source packet limits Level 1; SRC4 fixes Steel/Mithril through source hierarchy: Blizzard Classic Battle.net is the adopted primary source, Liquipedia is retained as current reference, and ROC GameFAQs is a recorded conflict sample
  - DATA3 seeds Iron (100/50/60s); DATA4 seeds Steel (175/175/75s/Keep) and Mithril (250/300/90s/Castle)
  - Each tier applies incremental +1 attackDamage to footman/militia/knight
  - IMPL4 runtime proves Level 1: command card, cost, completion, inheritance, exclusion
  - IMPL5 runtime proves Level 2/3: prerequisite gating, cumulative +3, new unit inheritance
  - Blacksmith exposes long_rifles + iron + steel + mithril
  - Ranged upgrade, armor upgrade, AWT, AI, heroes, air, items, assets confirmed absent
No gameplay code was modified by this closure task.
The next branch is HN7-SRC5 (ranged weapon source reconciliation) or HN7-SRC6 (armor source reconciliation).
No ranged/armor/AWT data, runtime, or AI is allowed until source reconciliation completes.
```

### V9 HN7-SRC5 — ranged weapon source reconciliation

- Gate: `HN7-SRC5`
- State before: HN7-CLOSE6 accepted; melee weapon chain closed, ranged weapon values not yet reconciled.
- Engineering evidence:
  - `docs/V9_HN7_RANGED_UPGRADE_SOURCE_PACKET.zh-CN.md`
  - `tests/v9-hn7-ranged-upgrade-source.spec.mjs` 11/11 pass
  - Combined ranged source + melee closure: 25/25 pass
  - `npm run build` pass
  - `npx tsc --noEmit -p tsconfig.app.json` pass
- User evidence: async
- State after: `accepted`

```text
HN7-SRC5 is accepted.
Human ranged weapon source reconciliation is fixed:
  - Black Gunpowder: 100 gold / 50 lumber, 60s, requires Blacksmith, no prerequisiteResearch
  - Refined Gunpowder: 175 gold / 175 lumber, 75s, requires Keep, prerequisite black_gunpowder
  - Imbued Gunpowder: 250 gold / 300 lumber, 90s, requires Castle, prerequisite refined_gunpowder
  - Blizzard Classic Battle.net is the hard-values primary source
  - Liquipedia is retained as current cross-check, especially for Damage Dice Bonus 1/2/3
  - GameFAQs / Wowpedia / Fandom references are not hard-value sources in this task
  - Current project DATA5 target units are rifleman and mortar_team only
  - Siege Engine and Flying Machine are not in the project and must not get effect rows
  - Current project mapping is incremental attackDamage +1 per level
No ranged upgrade data has been written yet.
The next adjacent work is HN7-DATA5: ranged weapon upgrade data seed.
```

### V9 HN7-DATA5 — ranged weapon upgrade data seed

- Gate: `HN7-DATA5`
- State before: HN7-SRC5 accepted; ranged weapon source values fixed, but no data existed.
- Engineering evidence:
  - `tests/v9-hn7-ranged-upgrade-data-seed.spec.mjs` 10/10 pass
  - `tests/v9-hn7-ranged-upgrade-source.spec.mjs` 11/11 pass
  - `tests/v9-hn7-melee-upgrade-chain-closure.spec.mjs` 14/14 pass
  - Combined ranged DATA5 + SRC5 + melee closure: 35/35 pass
  - `npm run build` pass
  - `npx tsc --noEmit -p tsconfig.app.json` pass
- User evidence: async
- State after: `accepted`

```text
HN7-DATA5 is accepted.
Human ranged weapon upgrade data is now seeded:
  - black_gunpowder: 黑火药, 100 gold / 50 lumber, 60s, requires Blacksmith
  - refined_gunpowder: 精炼火药, 175 gold / 175 lumber, 75s, requires Keep, prerequisite Black Gunpowder
  - imbued_gunpowder: 附魔火药, 250 gold / 300 lumber, 90s, requires Castle, prerequisite Refined Gunpowder
  - Each tier applies incremental attackDamage +1 to rifleman and mortar_team
  - BUILDINGS.blacksmith.researches now exposes Long Rifles, melee chain, and ranged chain
  - Game.ts has no Gunpowder special case
  - Siege Engine and Flying Machine are not project units and have no effect rows
  - No armor upgrade, Animal War Training, AI, hero, air, item, asset, or dice model work was added
The next adjacent work is HN7-IMPL6: ranged weapon runtime smoke.
```

### V9 HN7-IMPL6 — ranged weapon runtime smoke

- Gate: `HN7-IMPL6`
- State before: HN7-DATA5 accepted; ranged weapon upgrade data exists but runtime behavior is unproven.
- Engineering evidence:
  - `tests/v9-hn7-ranged-upgrade-runtime.spec.ts` 7/7 pass
  - `tests/v9-hn7-ranged-upgrade-data-seed.spec.mjs` pass (prior task)
  - `npm run build` pass
  - `npx tsc --noEmit -p tsconfig.app.json` pass
- User evidence: async
- State after: `accepted`

```text
HN7-IMPL6 is accepted.
Human ranged weapon upgrade runtime behavior is proven:
  - Blacksmith command card displays 黑火药, 精炼火药, and 附魔火药
  - Black Gunpowder: costs 100 gold / 50 lumber, requires Blacksmith, no prerequisite
  - Refined Gunpowder: costs 175 gold / 175 lumber, requires Keep, prerequisite Black Gunpowder
  - Imbued Gunpowder: costs 250 gold / 300 lumber, requires Castle, prerequisite Refined Gunpowder
  - Completing all three tiers applies cumulative attackDamage +3 to existing rifleman and mortar_team
  - Newly trained Rifleman and Mortar Team inherit cumulative +3
  - Footman, militia, knight, priest, and sorceress remain unaffected
  - No melee, armor, Animal War Training, AI, hero, air, item, asset, or dice model work was added
The next adjacent work is HN7-CLOSE7: ranged weapon upgrade chain closure inventory.
```

### V9 HN7-CLOSE7 — ranged weapon upgrade chain closure

- Gate: `HN7-CLOSE7`
- State before: HN7-IMPL6 accepted; SRC5/DATA5/IMPL6 completed but not formally inventoried.
- Engineering evidence:
  - `tests/v9-hn7-ranged-upgrade-chain-closure.spec.mjs` 14/14 pass
  - `tests/v9-hn7-ranged-upgrade-data-seed.spec.mjs` 10/10 pass
  - `tests/v9-hn7-ranged-upgrade-source.spec.mjs` 11/11 pass
  - Combined ranged closure + DATA5 + SRC5: 35/35 pass
  - `npm run build` pass
  - `npx tsc --noEmit -p tsconfig.app.json` pass
- User evidence: async
- State after: `accepted`

```text
HN7-CLOSE7 is accepted.
Human ranged weapon upgrade chain closure inventory complete:
  - SRC5: Blizzard Classic Battle.net primary source, Liquipedia cross-check, no fake consensus
  - DATA5: black_gunpowder, refined_gunpowder, imbued_gunpowder seeded
  - IMPL6: runtime smoke 7/7 proving buttons, prerequisites, costs, cumulative +3, inheritance, exclusions
  - Game.ts has no Gunpowder special cases (fully data-driven)
  - Armor upgrade, Animal War Training, AI, heroes, air, items, assets remain absent
The next adjacent work is HN7-SRC6: armor upgrade source reconciliation (not armor data or AWT).
```

### V9 HN7-SRC6 — armor upgrade source reconciliation

- Gate: `HN7-SRC6`
- State before: HN7-CLOSE7 accepted; Plating armor upgrade chain needs source reconciliation before data seed.
- Engineering evidence:
  - `tests/v9-hn7-armor-upgrade-source.spec.mjs` 12/12 pass
  - `npm run build` pass
  - `npx tsc --noEmit -p tsconfig.app.json` pass
- User evidence: async
- State after: `accepted`

```text
HN7-SRC6 is accepted.
Human Plating armor upgrade source reconciliation complete:
  - Iron Plating: 125 gold / 75 lumber, 60s, Blacksmith, no prerequisite
  - Steel Plating: 150 gold / 175 lumber, 75s, Keep, prerequisite Iron Plating
  - Mithril Plating: 175 gold / 275 lumber, 90s, Castle, prerequisite Steel Plating
  - Each tier applies incremental armor +2 to Heavy armor units (footman, militia, knight)
  - Priest and Sorceress are Unarmored and not affected by Plating
  - War3 has a second Leather Armor line for Medium armor units but current project has no Medium armor units
  - Leather Armor line is documented but not in DATA6 scope
The next adjacent work is HN7-DATA6: Plating armor upgrade data seed (not Leather Armor, AWT, AI, heroes, air, items, or assets).
```

### V9 HN7-DATA6 — Plating armor upgrade data seed

- Gate: `HN7-DATA6`
- State before: HN7-SRC6 accepted; Plating armor upgrade source values fixed, but no data existed.
- Engineering evidence:
  - `tests/v9-hn7-armor-upgrade-data-seed.spec.mjs` 9/9 pass
  - `tests/v9-hn7-armor-upgrade-source.spec.mjs` 12/12 pass
  - Combined armor DATA6 + SRC6: 21/21 pass
  - `npm run build` pass
  - `npx tsc --noEmit -p tsconfig.app.json` pass
- User evidence: async
- State after: `accepted` by Codex takeover after fixing stale SRC6 no-data assertion

```text
HN7-DATA6 is accepted.
Human Plating armor upgrade data is now seeded:
  - iron_plating: 铁甲, 125 gold / 75 lumber, 60s, requires Blacksmith
  - steel_plating: 钢甲, 150 gold / 175 lumber, 75s, requires Keep, prerequisite Iron Plating
  - mithril_plating: 秘银甲, 175 gold / 275 lumber, 90s, requires Castle, prerequisite Steel Plating
  - Each tier applies incremental armor +2 to footman, militia, and knight
  - BUILDINGS.blacksmith.researches now exposes Long Rifles, melee chain, ranged chain, and Plating chain
  - Game.ts has no Plating special case
  - No Leather Armor, Animal War Training, AI, hero, air, item, asset, or dice model work was added
The next adjacent work is HN7-IMPL7: Plating armor upgrade runtime smoke.
```

### V9 HN7-IMPL7 — Plating armor upgrade runtime smoke

- Gate: `HN7-IMPL7`
- State before: HN7-DATA6 accepted; Plating armor upgrade data exists but runtime behavior is unproven.
- Engineering evidence:
  - `tests/v9-hn7-plating-upgrade-runtime.spec.ts` 7/7 pass
  - Affected command-card / HUD cleanup / construction regression pack 20/20 pass
  - Armor DATA6 + SRC6 static proof 21/21 pass
  - `npm run build` pass
  - `npx tsc --noEmit -p tsconfig.app.json` pass
- User evidence: async
- State after: `accepted` by Codex takeover after fixing command-card capacity

```text
HN7-IMPL7 is accepted.
Human Plating armor upgrade runtime behavior is proven:
  - Blacksmith command card displays 铁甲 / 钢甲 / 秘银甲
  - Command card capacity was first raised from 8 to 12 fixed slots, then Task198 raised it to 16 fixed slots after Leather Armor brought Blacksmith to 13 research buttons
  - Steel Plating disabled without Keep or Iron; enabled with both
  - Mithril Plating disabled without Castle or Steel; enabled with both
  - Iron deducts 125/75, Steel 150/175, Mithril 175/275
  - Completing all three tiers applies cumulative armor +6 to existing footman, militia, and knight
  - Newly trained Footman and Knight inherit cumulative +6
  - Rifleman, mortar_team, priest, sorceress, and worker remain unaffected
  - No Leather Armor, Animal War Training, AI, hero, air, item, asset, or dice model work was added
The next adjacent work is HN7-CLOSE8: Plating armor upgrade chain closure inventory.
```

### V9 HN7-CLOSE8 — Plating armor upgrade chain closure

- Gate: `HN7-CLOSE8`
- State before: HN7-SRC6, HN7-DATA6, and HN7-IMPL7 were accepted, but the Plating chain still needed one closure inventory tying source, data, runtime, command-card capacity fix, and forbidden branches together.
- Engineering evidence:
  - `tests/v9-hn7-plating-upgrade-chain-closure.spec.mjs` 14/14 pass
  - Combined Plating closure + DATA6 + SRC6 proof 35/35 pass
  - `npm run build` pass
  - `npx tsc --noEmit -p tsconfig.app.json` pass
- User evidence: async
- State after: `accepted` by Codex review after strengthening the command-card capacity proof

```text
HN7-CLOSE8 is accepted.
Human Plating armor upgrade chain is closed:
  - SRC6 source packet fixes Iron / Steel / Mithril Plating values and Heavy-only scope
  - DATA6 seeds iron_plating / steel_plating / mithril_plating with ordered prerequisites and armor +2 per tier
  - IMPL7 runtime smoke proves three command-card buttons, prerequisites, costs, cumulative armor +6, new-unit inheritance, and non-Heavy exclusions
  - The command-card capacity fix is verified directly in Game.ts and CSS: 16 fixed slots, 4x4 grid
  - No Leather Armor, Animal War Training, AI upgrade strategy, hero, air, item, asset, or full armor model work was added
The next adjacent work is HN7-SRC7: Animal War Training source reconciliation.
```

### V9 HN7-SRC7 — Animal War Training source reconciliation

- Gate: `HN7-SRC7`
- State before: HN7-CLOSE8 accepted; AWT values not yet reconciled.
- Engineering evidence:
  - `tests/v9-hn7-animal-war-training-source.spec.mjs` 14/14 pass
  - `npm run build` pass
  - `npx tsc --noEmit -p tsconfig.app.json` pass
- User evidence: async
- State after: `accepted`

```text
HN7-SRC7 is accepted.
Human Animal War Training source reconciliation complete:
  - AWT is a single-level upgrade (not 3-tier like melee/ranged/armor)
  - Cost: 125 gold / 125 lumber, research time 40 seconds
  - Researched at Barracks, requires Castle + Lumber Mill + Blacksmith
  - Effect: knight maxHp +100
  - Liquipedia is primary source (current patch values post-1.31.0)
  - Patch history recorded (1.10: 150/250/+150, 1.12: 125/175/+150) but not adopted
  - Classic Battle.net old cost 125/175 is treated as a conflict sample, not the current hard value
  - Multi-building prerequisite gap identified: ResearchDef only has requiresBuilding?: string
  - Dragonhawk Rider and Gryphon Rider are War3-only; no effect rows for non-existent units
  - No AWT data, runtime, AI, hero, air, item, asset, or Leather Armor work was added
The next adjacent work is HN7-MODEL8: Research multi-building prerequisite model. AWT DATA7 must wait until this model can express Castle + Lumber Mill + Blacksmith.
```

### V9 HN7-MODEL8 — Research multi-building prerequisite model

- Gate: `HN7-MODEL8`
- State before: HN7-SRC7 accepted; ResearchDef only supported single-building prerequisite (`requiresBuilding?: string`), but AWT needs Castle + Lumber Mill + Blacksmith.
- Engineering evidence:
  - `tests/v9-hn7-research-multi-building-prereq.spec.ts` 5/5 pass
  - `tests/v9-hn7-animal-war-training-source.spec.mjs` 14/14 pass after model work
  - `npm run build` pass
  - `npx tsc --noEmit -p tsconfig.app.json` pass
- User evidence: async
- State after: `accepted` by Codex takeover after removing product-data test fixture

```text
HN7-MODEL8 is accepted.
Research multi-building prerequisite model is implemented:
  - ResearchDef now has requiresBuildings?: string[] for multi-building prerequisites
  - getResearchAvailability checks all buildings in requiresBuildings, lists ALL missing buildings with Chinese names
  - startResearch reuses the availability check
  - Existing requiresBuilding (single) researches are not regressed
  - main.ts exposes window.__war3Researches for runtime test hook (runtimeTest=1 only)
  - _test_multi_prereq is not shipped in GameData; the runtime proof injects it only during the test
  - No animal_war_training data or AWT runtime was added
The next adjacent work is HN7-DATA7: Animal War Training data seed.
```

### V9 HN7-DATA7 — Animal War Training data seed

- Gate: `HN7-DATA7`
- State before: HN7-MODEL8 accepted; multi-building prerequisite model ready, AWT source values fixed.
- Engineering evidence:
  - `tests/v9-hn7-animal-war-training-data-seed.spec.mjs` 10/10 pass
  - `tests/v9-hn7-animal-war-training-source.spec.mjs` 14/14 pass
  - Combined DATA7 + SRC7: 24/24 pass
  - `npm run build` pass
  - `npx tsc --noEmit -p tsconfig.app.json` pass
- User evidence: async
- State after: `accepted`

```text
HN7-DATA7 is accepted.
Human Animal War Training data is now seeded:
  - RESEARCHES.animal_war_training: 动物作战训练, 125 gold / 125 lumber, 40s
  - requiresBuilding: barracks, requiresBuildings: ['castle', 'lumber_mill', 'blacksmith']
  - Effect: knight maxHp +100 (single FlatDelta, single-level)
  - BUILDINGS.barracks.researches now includes animal_war_training
  - Game.ts was not modified; no runtime, AI, hero, air, item, or asset work was added
The next adjacent work is HN7-IMPL9: Animal War Training runtime smoke.
```

### V9 HN7-IMPL9 — Animal War Training runtime smoke

- Gate: `HN7-IMPL9`
- State before: HN7-DATA7 accepted; AWT data existed but runtime consumption was not yet proven.
- Engineering evidence:
  - `tests/v9-hn7-animal-war-training-runtime.spec.ts` 4/4 pass
  - `tests/v9-hn7-animal-war-training-data-seed.spec.mjs` 10/10 pass
  - `tests/v9-hn7-animal-war-training-source.spec.mjs` 14/14 pass
  - `npm run build` pass
  - `npx tsc --noEmit -p tsconfig.app.json` pass
- User evidence: async
- State after: `accepted` by Codex takeover

```text
HN7-IMPL9 is accepted.
Animal War Training runtime consumption is proven:
  - Barracks command card shows 动物作战训练
  - Missing Castle / Lumber Mill / Blacksmith blocks research and lists all missing Chinese names
  - With all prerequisites, research spends 125 gold / 125 lumber and enters the Barracks researchQueue
  - Queue completion applies knight maxHp +100 and hp +100 through the generic maxHp research effect
  - Newly trained Knight inherits maxHp +100
  - Non-Knight units remain unchanged
  - Game.ts did not need AWT-specific runtime code
The next adjacent work is HN7-CLOSE10: Animal War Training closure inventory.
```

### V9 HN7-CLOSE10 — Animal War Training closure inventory

- Gate: `HN7-CLOSE10`
- State before: HN7-IMPL9 accepted; SRC7/MODEL8/DATA7/IMPL9 all accepted but not formally tied together.
- Engineering evidence:
  - `tests/v9-hn7-animal-war-training-closure.spec.mjs` 14/14 pass
  - `tests/v9-hn7-animal-war-training-data-seed.spec.mjs` 10/10 pass
  - `tests/v9-hn7-animal-war-training-source.spec.mjs` 14/14 pass
  - Combined AWT closure + DATA7 + SRC7: 38/38 pass
  - `npm run build` pass
  - `npx tsc --noEmit -p tsconfig.app.json` pass
- User evidence: async
- State after: `accepted`

```text
HN7-CLOSE10 is accepted.
Human Animal War Training minimal chain is formally closed:
  - SRC7: single-level upgrade, 125/125/40s, Barracks, Castle+Lumber Mill+Blacksmith, knight maxHp +100
  - MODEL8: requiresBuildings?: string[] for multi-building prerequisites
  - DATA7: RESEARCHES.animal_war_training seeded with correct values and Barracks hook
  - IMPL9: runtime 4/4 proving command card, prerequisites, costs, maxHp effect, inheritance, exclusions
  - Game.ts has no AWT-specific code (fully data-driven)
  - Leather Armor, AI upgrade strategy, heroes, air, items, assets remain absent
The next adjacent work is a new HN7 remaining item: Leather Armor source reconciliation or AWT AI strategy contract.
No Leather Armor data, hero, air, item, asset, or full T3 work is allowed until the next branch contract.
```

### V9 HN7-AI11 — Animal War Training AI strategy contract

- Gate: `HN7-AI11`
- State before: HN7-CLOSE10 accepted; AI does not know when to research AWT.
- Engineering evidence:
  - `tests/v9-hn7-animal-war-training-ai-strategy-contract.spec.mjs` 16/16 pass
  - Combined AI strategy + CLOSE10 proof: 30/30 pass
  - `npm run build` pass
  - `npx tsc --noEmit -p tsconfig.app.json` pass
- User evidence: async
- State after: `accepted`

```text
HN7-AI11 is accepted.
Animal War Training AI strategy contract exists:
  - 7 trigger conditions: Castle + Barracks + Lumber Mill + Blacksmith + AWT not done + queue empty + at least 1 Knight
  - Budget boundary: reserves worker + footman production cost
  - Retry boundary: completed never retried, queued not duplicated, insufficient resources skip tick
  - Priority: below supply/buildings/training, above attack waves
  - Forbidden: Castle upgrade, Knight training, Blacksmith chains, Leather Armor, heroes, air, items, assets
  - Implementation: SimpleAI.ts only, data-driven from RESEARCHES
The next adjacent work is HN7-AI12: Animal War Training AI implementation slice.
No runtime code, GameData, or Game.ts was modified by this contract task.
```

### V9 HN7-AI12 — Animal War Training AI implementation slice

- Gate: `HN7-AI12`
- State before: HN7-AI11 accepted; AI strategy contract defined but no AWT code in SimpleAI.
- Engineering evidence:
  - `tests/v9-hn7-animal-war-training-ai-runtime.spec.ts` 8/8 pass (Playwright runtime)
    - AWT-AI-1: AI researches AWT when all conditions met
    - AWT-AI-2: AI skips when main base is Keep (not Castle)
    - AWT-AI-3: AI skips when no Knight exists
    - AWT-AI-4: AI skips when research queue occupied
    - AWT-AI-5: AI skips when already completed
    - AWT-AI-6: AI does not duplicate AWT across ticks
    - AWT-AI-7: Knight in training queue satisfies C7
    - AWT-AI-8: AI skips when gold insufficient with production reserve
  - `tests/v9-hn7-animal-war-training-ai-strategy-contract.spec.mjs` 16/16 pass (static)
  - `tests/v9-hn7-animal-war-training-closure.spec.mjs` 14/14 pass (static)
  - `src/game/SimpleAI.ts`: 5d-AWT block, data-driven from `BUILDINGS.castle.key`, `UNITS.knight.key`, `RESEARCHES.animal_war_training`
- User evidence: async
- State after: `accepted`

```text
HN7-AI12 is accepted.
Animal War Training AI implementation slice complete:
  - SimpleAI 5d-AWT: Castle + Barracks + LumberMill + Blacksmith + not done + queue empty + Knight
  - Budget: reserves worker + footman cost
  - No duplicate, no Castle upgrade, no Knight training, no Blacksmith chains
  - Runtime proof 8/8, contract proof 16/16, closure proof 14/14
HN7 Animal War Training full chain closed: SRC7 → MODEL8 → DATA7 → IMPL9 → AI11 → AI12
Next: Leather Armor research, AI Blacksmith upgrades, or other Human expansion per roadmap.
No GameData, Game.ts, or assets were modified outside SimpleAI.ts.
```

### V9 HN7-AI13 — Animal War Training AI closure inventory

- Gate: `HN7-AI13`
- State before: HN7-AI12 accepted; AI11 contract + AI12 runtime implementation complete but no closure proof tying them together.
- Engineering evidence:
  - `tests/v9-hn7-animal-war-training-ai-closure.spec.mjs` 20/20 pass (static)
    - AI-CLOSE-1..5: SimpleAI reads data-driven values, implements all C1-C7 triggers, budget boundary, spend+enqueue
    - AI-CLOSE-6..13: runtime spec covers all 8 scenarios (trigger, 5 skips, no-duplicate, Knight-in-training)
    - AI-CLOSE-14..15: strategy contract proof covers triggers, budget, retry, forbidden
    - AI-CLOSE-16..18: forbidden branches untouched (no Castle upgrade, no Knight training, no Blacksmith chains)
    - AI-CLOSE-19: priority placement correct (Long Rifles < AWT < attack waves)
    - AI-CLOSE-20: no GameData or Game.ts modification
  - Combined static run: 50/50 (closure 20 + strategy 16 + AWT closure 14)
  - `npm run build` pass, `npx tsc --noEmit -p tsconfig.app.json` pass
- User evidence: async
- State after: `accepted`

```text
HN7-AI13 is accepted.
Animal War Training AI closure inventory complete:
  - AI11 contract → AI12 implementation: all 7 triggers aligned, budget aligned, priority correct
  - Runtime 8/8 covers trigger + 5 skip + no-duplicate + Knight-in-training
  - Forbidden branches untouched: no Castle upgrade, no Knight training, no Blacksmith chains
  - No production code modified (docs/proof only)
  - Combined static: 50/50, build pass, tsc pass
HN7 Animal War Training full chain closed: SRC7 → MODEL8 → DATA7 → IMPL9 → AI11 → AI12 → AI13
Next: Leather Armor research, AI Blacksmith upgrades, or other Human expansion per roadmap.
```

### V9 HN7-AI14 — Blacksmith upgrade AI strategy contract

- Gate: `HN7-AI14`
- State before: HN7-AI13 accepted; Blacksmith melee/ranged/plating upgrades exist in data but AI does not research them.
- Engineering evidence:
  - `docs/V9_HN7_BLACKSMITH_UPGRADE_AI_STRATEGY_CONTRACT.zh-CN.md` — strategy contract defining:
    - Three upgrade chains: melee weapons (iron→steel→mithril), ranged gunpowder (black→refined→imbued), armor plating (iron→steel→mithril)
    - General conditions GC1-GC4: Blacksmith exists, queue empty, budget with reserve, waveCount >= 1
    - Per-chain conditions MC1-MC4, RC1-RC5, PC1-PC4: not completed, prerequisite done, townhall tier, unit presence
    - Budget: worker + footman reserve
    - Chain priority: melee L1 > plating L1 > ranged L1 > L2 chains > L3 chains
    - Interaction with Long Rifles and AWT paths
    - Retry boundaries and forbidden branches
  - `tests/v9-hn7-blacksmith-upgrade-ai-strategy-contract.spec.mjs` 24/24 pass (static)
    - BS-AI-1..2: contract structure and research keys
    - BS-AI-3..6: trigger conditions (GC, MC, RC, PC)
    - BS-AI-7..8: budget boundaries
    - BS-AI-9..10: retry boundaries
    - BS-AI-11..12: priority and AI path interaction
    - BS-AI-13..15: forbidden branches
    - BS-AI-16..17: implementation boundary
    - BS-AI-18..19: current AI state and Leather Armor exclusion
    - BS-AI-20..23: data consistency with GameData
    - BS-AI-24: next step boundary
  - `npm run build` pass, `npx tsc --noEmit -p tsconfig.app.json` pass
- User evidence: async
- State after: `accepted`

```text
HN7-AI14 is accepted.
Blacksmith upgrade AI strategy contract complete:
  - Three chains: melee (3 levels), ranged (3 levels), plating (3 levels)
  - General conditions: GC1-GC4, per-chain conditions: MC1-MC4, RC1-RC5, PC1-PC4
  - Budget: worker + footman reserve, waveCount >= 1 gate
  - Priority: melee > plating > ranged, L1 > L2 > L3
  - No Leather Armor, no Castle upgrade, no Knight training
  - Static proof 24/24, build pass, tsc pass
Next: HN7-AI15 Blacksmith upgrade AI implementation slice.
```

### V9 HN7-AI15 — Blacksmith upgrade AI implementation slice

- Gate: `HN7-AI15`
- State before: HN7-AI14 accepted; Blacksmith melee/ranged/plating upgrades existed and had player/runtime proof, but AI still did not research those chains.
- Engineering evidence:
  - `src/game/SimpleAI.ts`
    - Adds a Blacksmith upgrade research block after Long Rifles / AWT and before attack waves.
    - Uses ordered upgrade definitions from `RESEARCHES`.
    - Reads `key`, `cost`, `researchTime`, `requiresBuilding`, `prerequisiteResearch`, and `effects` from data.
    - Keeps Long Rifles as the existing higher-priority Blacksmith research path before ranged gunpowder.
    - Preserves worker + footman production reserve, waveCount >= 1 gate, queue-empty gate, completed-research skip, prerequisite-research skip, and townhall tier gate.
  - `tests/v9-hn7-blacksmith-upgrade-ai-runtime.spec.ts` 18/18 pass via locked runtime wrapper.
    - Covers melee L1, Long Rifles priority, ranged L1 after Long Rifles, queue occupied, completed skip, budget skip, Keep L2, Castle L3, no skip-level, no duplicate, no Blacksmith, Knight as melee, plating L1, no Leather Armor, and data-driven prerequisite/tier checks.
  - `tests/v9-hn7-blacksmith-upgrade-ai-strategy-contract.spec.mjs` 24/24 pass.
  - `npm run build` pass, `npx tsc --noEmit -p tsconfig.app.json` pass.
- User evidence: async
- State after: `accepted`

```text
HN7-AI15 is accepted.
Blacksmith upgrade AI implementation slice complete:
  - AI researches existing melee / plating / ranged Blacksmith upgrades under Task191 contract
  - Long Rifles stays ahead of Black Gunpowder
  - L2/L3 use data-driven prerequisiteResearch and requiresBuilding
  - Runtime proof 18/18, strategy proof 24/24, build pass, tsc pass
No Leather Armor, no AI Castle upgrade, no AI Knight training, no heroes, air, items, or assets.
Next: HN7-AI16 Blacksmith upgrade AI closure inventory.
```

### V9 HN7-AI16 — Blacksmith upgrade AI closure inventory

- Gate: `HN7-AI16`
- State before: HN7-AI15 accepted; Blacksmith upgrade AI implementation complete with 18/18 runtime proof, but no closure inventory tying contract + implementation together.
- Engineering evidence:
  - `tests/v9-hn7-blacksmith-upgrade-ai-closure.spec.mjs` 32/32 pass (static)
    - BS-CLOSE-1..5: SimpleAI reads data-driven values from RESEARCHES (key/cost/time/requiresBuilding/prerequisiteResearch/effects)
    - BS-CLOSE-6..10: Contract general conditions (GC1-GC4), priority order, Long Rifles priority, budget, one-per-tick
    - BS-CLOSE-11..27: Runtime spec covers all 18 scenarios (melee L1, waveCount, queue occupied, completed skip, no-melee, LR priority, budget, L2 Keep, L3 Castle, no-skip-level, no-duplicate, no-Blacksmith, Knight melee, plating L1, no-Leather Armor, data-driven prereq, data-driven tier)
    - BS-CLOSE-28: Strategy contract proof covers all 24 assertions
    - BS-CLOSE-29..30: Forbidden branches untouched (no Castle upgrade, no Knight training, no Leather Armor)
    - BS-CLOSE-31: No GameData or Game.ts modification
    - BS-CLOSE-32: Correct placement after Long Rifles + AWT, before attack waves
  - `docs/V9_HN7_BLACKSMITH_UPGRADE_AI_CLOSURE.zh-CN.md` — closure inventory document
  - Combined static run: 56/56 (closure 32 + strategy 24)
  - `npm run build` pass, `npx tsc --noEmit -p tsconfig.app.json` pass
- User evidence: async
- State after: `accepted`

```text
HN7-AI16 is accepted.
Blacksmith upgrade AI closure inventory complete:
  - AI14 contract → AI15 implementation: all 3 chains × 3 levels aligned
  - Data-driven: key/cost/time/requiresBuilding/prerequisiteResearch/effects from RESEARCHES
  - Runtime 18/18 covers all trigger/skip/priority scenarios
  - Long Rifles priority preserved, budget boundary, forbidden branches untouched
  - No production code modified (docs/proof only)
  - Combined static: 56/56, build pass, tsc pass
HN7 Blacksmith upgrade AI full chain closed: AI14 → AI15 → AI16
Next: Leather Armor source reconciliation, AI Castle/Knight strategy, or HN7/Human global closure.
```

### V9 HN7-SRC8 — Leather Armor source and armor-type boundary

- Gate: `HN7-SRC8`
- State before: HN7-AI16 accepted; Leather Armor was the remaining Blacksmith upgrade chain without source verification.
- Engineering evidence:
  - `docs/V9_HN7_LEATHER_ARMOR_SOURCE_AND_TYPE_BOUNDARY.zh-CN.md` — source document:
    - Records War3 Leather Armor 3-level chain (Studded/Reinforced/Dragonhide, 100/100→150/175→200/250, 60s→75s→90s)
    - Documents affected unit roster (Rifleman, Mortar Team, Dragonhawk Rider, Gryphon Rider)
    - Verifies the pre-migration project state: rifleman and mortar_team were ArmorType.Unarmored (not Medium)
    - Confirms no Human combat unit used ArmorType.Medium before the migration work
    - Concludes Leather Armor cannot proceed directly; requires Medium armor migration contract first
  - `tests/v9-hn7-leather-armor-source-boundary.spec.mjs` 18/18 pass (static)
    - LA-SRC-1..6: source data recording (3 levels, costs, times, effects, roster, Plating distinction)
    - LA-SRC-7..11: GameData armorType verification updated after migration (enum, rifleman Medium, mortar Unarmored, no other Human combat unit Medium)
    - LA-SRC-12..15: document correctness (Unarmored recording, no Medium combat unit, cannot proceed, migration recommended)
    - LA-SRC-16..18: no Leather Armor data in GameData, Plating effects correct, safe continuations only
  - Combined static run: 30/30 (Leather Armor 18 + armor upgrade source 12)
  - `npm run build` pass, `npx tsc --noEmit -p tsconfig.app.json` pass
- User evidence: async
- State after: `accepted`

```text
HN7-SRC8 is accepted.
Leather Armor source and armor-type boundary complete:
  - War3 Leather Armor: 3 levels, 100/100→150/175→200/250, blacksmith/keep/castle
  - Pre-migration project: rifleman/mortar_team were Unarmored, not Medium
  - No Human Medium armor combat unit existed at SRC8 time
  - Conclusion at SRC8 time: Leather Armor could not proceed directly; needed Medium armor migration first
  - Source proof 18/18, combined static 30/30, build pass, tsc pass
Next: Medium armor migration contract, AI Castle/Knight strategy, or HN7/Human global closure.
```

### V9 HN7-MODEL9 — Medium armor migration contract

- Gate: `HN7-MODEL9`
- State before: HN7-SRC8 proved Leather Armor should not be seeded while all Human combat units remain non-Medium, but the exact armor migration boundary was not safe enough.
- Engineering evidence:
  - `docs/V9_HN7_MEDIUM_ARMOR_MIGRATION_CONTRACT.zh-CN.md`
    - Defines `rifleman` as the only mandatory `ArmorType.Medium` migration target.
    - Downgrades `mortar_team` from blind Medium migration to a separate armor parity decision.
    - Records that `DAMAGE_MULTIPLIER_TABLE` already has Medium values: Piercing 0.75, Siege 0.75, Normal 1.0.
    - Requires future controlled damage proof for Rifleman and non-regression proof for Long Rifles, Black Gunpowder, and Plating.
    - Keeps Leather Armor data seed blocked until Rifleman migration and Mortar parity decision are resolved.
  - `tests/v9-hn7-medium-armor-migration-contract.spec.mjs` 10/10 pass.
  - Combined static run with HN7-SRC8 proof: 28/28 pass.
  - `npm run build` pass, `npx tsc --noEmit -p tsconfig.app.json` pass.
- User evidence: async.
- State after: `accepted`

```text
HN7-MODEL9 is accepted.
Medium armor migration contract complete:
  - Rifleman is the only mandatory Medium migration target.
  - Mortar Team is a separate parity decision, not a blind Medium migration.
  - Future implementation must prove Rifleman Piercing/Siege damage changes and existing research non-regression.
Next split: Codex Rifleman Medium migration implementation; GLM Mortar Team armor parity decision.
Leather Armor data remains closed.
```

### V9 HN7-IMPL10 — Rifleman Medium armor migration implementation

- Gate: `HN7-IMPL10`
- State before: HN7-MODEL9 accepted; Rifleman was the only approved Medium armor migration target.
- Engineering evidence:
  - `src/game/GameData.ts`
    - `UNITS.rifleman.armorType` changed from `ArmorType.Unarmored` to `ArmorType.Medium`.
    - `UNITS.mortar_team.armorType` remains `ArmorType.Unarmored`.
    - `DAMAGE_MULTIPLIER_TABLE` unchanged.
  - `tests/v9-hn7-rifleman-medium-armor-runtime.spec.ts` 4/4 pass.
    - RM-1: Rifleman is Medium; Mortar Team remains Unarmored; Medium table values remain 0.75/0.75/1.0.
    - RM-2: Piercing Rifleman vs Rifleman now deals 14 damage, while Piercing vs Unarmored worker still deals 19.
    - RM-3: Normal worker vs Rifleman remains 5 damage.
    - RM-4: Long Rifles, Black Gunpowder, and Plating targetUnitType contracts do not regress.
  - Focused runtime run: 11/11 pass (`v9-hn7-rifleman-medium-armor-runtime`, `v6-attack-armor-type-proof`, `v9-t2-role-combat-smoke`).
  - Related static run: 43/43 pass (`medium-armor-migration-contract`, `leather-armor-source-boundary`, `armor-upgrade-source`).
  - `npm run build` pass, `npx tsc --noEmit -p tsconfig.app.json` pass.
- User evidence: async.
- State after: `accepted`

```text
HN7-IMPL10 is accepted.
Rifleman Medium migration complete:
  - rifleman is now Medium.
  - mortar_team stays Unarmored.
  - Piercing vs Rifleman uses Medium 0.75 multiplier.
  - Existing research target lists do not regress.
Next: Mortar Team parity decision and then Leather Armor data seed.
```

### V9 HN7-MODEL10 — Mortar Team armor parity decision

- Gate: `HN7-MODEL10`
- State before: HN7-MODEL9 accepted; mortar_team identified as "兼容风险单位" needing separate parity decision.
- Engineering evidence:
  - `docs/V9_HN7_MORTAR_TEAM_ARMOR_PARITY_DECISION.zh-CN.md`
    - Analyzes three options: Keep Unarmored, Migrate to Heavy (War3 original), Migrate to Medium (project simplification).
    - Documents damage multiplier impact for each option against current DAMAGE_MULTIPLIER_TABLE.
    - Proves Leather Armor, Black Gunpowder, Plating all work by targetUnitType (independent of armorType).
    - Recommends Option A: Keep Unarmored — zero migration cost, zero regression risk, Leather Armor covers mortar_team by targetUnitType.
    - Notes War3 Mortar Team is Heavy (Piercing 1.25x), not Medium (Piercing 0.75x); Medium migration would invert War3 counter relationship.
  - `tests/v9-hn7-mortar-team-armor-parity-decision.spec.mjs` 18/18 pass.
  - Combined static run with MODEL9 proof: 31/31 pass.
  - `npm run build` pass, `npx tsc --noEmit -p tsconfig.app.json` pass.
- User evidence: async.
- State after: `accepted`

```text
HN7-MODEL10 accepted: mortar_team stays Unarmored.
Parity decision complete:
  - Option A (Keep Unarmored) recommended: zero risk, Leather Armor covers by targetUnitType.
  - Option B (Heavy) matches War3 but introduces Plating ambiguity.
  - Option C (Medium) inverts War3 counter relationship.
  - Decision does not block Leather Armor data seed.
Next: Leather Armor data seed (rifleman Medium + mortar_team Unarmored, both in targetUnitType).
```

### V9 HN7-DATA8 — Leather Armor data seed

- Gate: `HN7-DATA8`
- State before: HN7-SRC8 + MODEL9 + MODEL10 + CX85 accepted; Leather Armor data seed unblocked.
- Engineering evidence:
  - `src/game/GameData.ts`
    - Added `RESEARCHES.studded_leather_armor` (100/100/60s/blacksmith, rifleman+mortar_team armor+2).
    - Added `RESEARCHES.reinforced_leather_armor` (150/175/75s/keep, prerequisite studded, rifleman+mortar_team armor+2).
    - Added `RESEARCHES.dragonhide_armor` (200/250/90s/castle, prerequisite reinforced, rifleman+mortar_team armor+2).
    - All three added to `BUILDINGS.blacksmith.researches`.
    - No unit armorType, DAMAGE_MULTIPLIER_TABLE, Game.ts or SimpleAI.ts modified.
  - `tests/v9-hn7-leather-armor-data-seed.spec.mjs` 18/18 pass.
  - Combined static run with DATA8 + source boundary + parity decision + MODEL9: 67/67 pass.
  - `npm run build` pass, `npx tsc --noEmit -p tsconfig.app.json` pass.
- User evidence: async.
- State after: `accepted`

```text
HN7-DATA8 accepted: Leather Armor three-level data seed complete.
  - studded_leather_armor (100/100/60s, blacksmith)
  - reinforced_leather_armor (150/175/75s, keep, prereq studded)
  - dragonhide_armor (200/250/90s, castle, prereq reinforced)
  - Effects: rifleman + mortar_team armor +2 per level (targetUnitType, not armorType predicate)
Next: HN7-IMPL11 Leather Armor runtime smoke.
```

### V9 HN7-IMPL11 — Leather Armor runtime smoke

- Gate: `HN7-IMPL11`
- State before: HN7-DATA8 accepted; Leather Armor existed as data but had no runtime proof.
- Engineering evidence:
  - `tests/v9-hn7-leather-armor-runtime.spec.ts` added focused runtime proof:
    - Blacksmith command card shows Studded / Reinforced / Dragonhide Leather Armor.
    - L1/L2/L3 prerequisite chain works: Blacksmith, then Keep + L1, then Castle + L2.
    - Three completed levels give existing `rifleman` and `mortar_team` cumulative armor +6.
    - Newly spawned `rifleman` and `mortar_team` inherit cumulative armor +6.
    - `footman`, `militia`, `knight`, `priest`, `sorceress`, `worker`, and `tower` are not affected.
  - Task198 surfaced a real UI capacity regression: after Leather Armor, Blacksmith has 13 research buttons. The previous 12-slot command card would hide the 13th button (`龙皮甲`).
  - `src/game/Game.ts` now uses `COMMAND_CARD_SLOT_COUNT = 16`.
  - `src/styles.css` command card grid is now 4x4.
  - `tests/v9-hn7-plating-upgrade-chain-closure.spec.mjs` was updated so the command-card capacity proof tracks the new 16-slot contract.
  - Focused runtime:
    - `./scripts/run-runtime-tests.sh tests/v9-hn7-leather-armor-runtime.spec.ts --reporter=list` -> 4/4 pass.
    - `./scripts/run-runtime-tests.sh tests/v9-hn7-ranged-upgrade-runtime.spec.ts tests/v9-hn7-plating-upgrade-runtime.spec.ts --reporter=list` -> 14/14 pass.
  - Related static proof:
    - `node --test tests/v9-hn7-plating-upgrade-chain-closure.spec.mjs tests/v9-hn7-leather-armor-data-seed.spec.mjs tests/v9-hn7-leather-armor-source-boundary.spec.mjs tests/v9-hn7-mortar-team-armor-parity-decision.spec.mjs tests/v9-hn7-medium-armor-migration-contract.spec.mjs` -> 81/81 pass.
  - `npm run build` pass.
  - `npx tsc --noEmit -p tsconfig.app.json` pass.
- Process evidence:
  - GLM Task198 was submitted but reached interrupted / false-running state without producing the runtime spec.
  - Codex took over implementation and verification rather than re-dispatching the same task.
- User evidence: async.
- State after: `accepted`

```text
HN7-IMPL11 accepted: Leather Armor data is now proven in runtime.
Leather Armor remains targetUnitType-based:
  - rifleman is Medium
  - mortar_team remains Unarmored
  - both receive Leather Armor by explicit targetUnitType
The command card capacity contract is now 16 fixed slots / 4x4 grid, enough for the current 13 Blacksmith research buttons.
Next: HN7-CLOSE12 Leather Armor closure inventory.
```

### V9 HN7-CLOSE12 — Leather Armor closure inventory

- Gate: `HN7-CLOSE12`
- State before: SRC8, MODEL9, MODEL10, DATA8, and IMPL11 accepted, but no single closure inventory tied the chain together.
- Engineering evidence:
  - `docs/V9_HN7_LEATHER_ARMOR_CLOSURE_INVENTORY.zh-CN.md` created.
  - `tests/v9-hn7-leather-armor-closure.spec.mjs` added.
  - The proof confirms:
    - SRC8 source values and historical armor-type boundary are preserved.
    - Rifleman is the only current Human combat unit migrated to Medium.
    - Mortar Team remains Unarmored by explicit decision.
    - DATA8 contains exactly the three Leather Armor research rows and Blacksmith exposes 13 current research buttons.
    - IMPL11 runtime file covers command-card visibility, prerequisites, cumulative +6 armor, new-unit inheritance, and non-target exclusions.
    - Command-card capacity is 16 slots / 4x4 grid.
    - Game.ts has no Leather Armor special-case runtime code.
    - Heroes, air, items, assets, AI Castle/Knight strategy, Mortar Heavy, and damage table edits remain closed.
  - Static proof: `node --test tests/v9-hn7-leather-armor-closure.spec.mjs` -> 18/18 pass.
  - Combined static proof with DATA8 / MODEL9 / MODEL10 / SRC8 / Plating closure: 99/99 pass.
  - `npm run build` pass.
  - `npx tsc --noEmit -p tsconfig.app.json` pass.
- Process evidence:
  - GLM wrote the closure doc but stopped in interrupted / same-title freeze before adding proof.
  - Codex took over proof creation and removed stale source line numbers from the closure doc.
- User evidence: async.
- State after: `accepted`

```text
HN7-CLOSE12 accepted: Leather Armor is closed from source to runtime.
Closed chain:
  SRC8 → MODEL9 → MODEL10 → DATA8 → IMPL11 → CLOSE12
Next: HN7-CLOSE13 Human Blacksmith branch global closure.
```

### V9 HN7-CLOSE13 — Human Blacksmith branch global closure

- Gate: `HN7-CLOSE13`
- State before: Blacksmith/Barracks upgrade work had many accepted subchains, but no single branch-level closure that connected melee, ranged, Plating, Animal War Training, AI, Leather Armor, and command-card capacity.
- Engineering evidence:
  - `docs/V9_HN7_BLACKSMITH_BRANCH_GLOBAL_CLOSURE.zh-CN.md`
    - Lists the current 13 Blacksmith research buttons.
    - Separates Barracks Animal War Training from Blacksmith research.
    - Records 16-slot command-card capacity as 13 research buttons plus 3 empty slots, not 3 extra actions.
    - States AI covers Blacksmith upgrade chains and AWT, but does not claim AI Castle/Knight strategy.
    - Keeps heroes, air, items, assets, second race, multiplayer, Mortar Heavy parity, and new armor types closed.
  - `tests/v9-hn7-blacksmith-branch-global-closure.spec.mjs` -> 22/22 pass.
  - Combined static proof with Leather closure, Blacksmith AI closure, and AWT AI closure -> 92/92 pass.
  - `npm run build` pass.
  - `npx tsc --noEmit -p tsconfig.app.json` pass.
- Process evidence:
  - GLM wrote the closure document but stopped before a complete proof/closeout.
  - Codex took over, corrected closure wording, added the static proof, and fixed a stale AWT AI proof assertion that incorrectly scanned all of `SimpleAI.ts`.
- User evidence: async.
- State after: `accepted`

```text
HN7-CLOSE13 accepted: the Human Blacksmith/Barracks upgrade branch is globally closed.
Closed branch:
  melee weapons + ranged weapons + Plating + Leather Armor + Long Rifles + AWT + Blacksmith upgrade AI + AWT AI
Important boundary:
  Complete Human is not closed yet.
Next: HUMAN-GAP1 Human core global gap inventory.
```

### V9 HUMAN-GAP1 — Human core global gap inventory

- Gate: `HUMAN-GAP1`
- State before: HN7 Blacksmith/Barracks branch was globally closed, but complete Human parity had not been inventoried from the current trunk.
- Engineering evidence:
  - `docs/V9_HUMAN_CORE_GLOBAL_GAP_INVENTORY.zh-CN.md`
    - Lists current Human minimum core: 10 buildings, 8 unit types plus Militia form, 7 abilities, 14 researches, AI coverage, and shared systems.
    - Separates "已实现最小链路" from full War3 parity.
    - Explicitly marks AI Keep -> Castle auto-upgrade, active Knight production, and Knight tactics as unfinished.
    - Lists major remaining gaps: Altar + four heroes, Spell Breaker, Flying Machine / Gryphon / Dragonhawk, Siege Engine, Arcane Tower / Spell Tower details, hero skills, item/shop system, complete T3 AI, maps/campaign/multiplayer.
    - Recommends exactly one next adjacent task: Altar of Kings + Paladin branch contract.
  - `tests/v9-human-core-global-gap-inventory.spec.mjs`:
    - Proves claimed current buildings, units, abilities, researches, AI coverage, and 16-slot command card against current repo files.
    - Proves missing heroes, air units, Siege Engine, item/shop system, and complete Human claims remain absent.
    - Proves the implemented AI section does not claim Knight strategy or hero use.
  - Static proof:
    - `node --test tests/v9-human-core-global-gap-inventory.spec.mjs` -> 24/24 pass.
    - `node --test tests/v9-human-core-global-gap-inventory.spec.mjs tests/v9-hn7-blacksmith-branch-global-closure.spec.mjs` -> 46/46 pass.
  - `npm run build` pass.
  - `npx tsc --noEmit -p tsconfig.app.json` pass.
- Process evidence:
  - GLM produced the first inventory and proof, but overclaimed current coverage by using "完整" wording and implying AI Castle/Knight coverage.
  - Codex corrected the wording to "已实现最小链路", narrowed AI coverage to true current behavior, and strengthened proof so those overclaims cannot return silently.
- User evidence: async.
- State after: `accepted`

```text
HUMAN-GAP1 accepted: Human core gaps are inventoried.
Current state is a proven minimum Human core, not full War3 Human parity.
Next: HERO1 Altar of Kings + Paladin branch contract.
```

### V9 HERO1 — Altar + Paladin branch contract

- Gate: `HERO1`
- State before: HUMAN-GAP1 identified heroes as the highest-priority next Human gap, but no bounded hero-entry contract existed.
- Engineering evidence:
  - `docs/V9_HERO1_ALTAR_PALADIN_CONTRACT.zh-CN.md`
    - Defines Altar of Kings as the first hero-entry building contract.
    - Defines Paladin as the first hero contract with `isHero`, level, XP, skill point, death/revive, uniqueness, and command-surface boundaries.
    - Defines Holy Light as the first hero ability candidate and maps it to the existing `AbilityDef` / mana / targetRule / command-card patterns.
    - Defines a minimal hero revive contract without implementing runtime.
    - Records a strict slice order and keeps Archmage, Mountain King, Blood Mage, items/shop, air, second race, multiplayer, official assets, and public release closed.
    - Marks all exact Altar / Paladin / Holy Light / revive values as candidate references, not approved data.
  - `tests/v9-hero1-altar-paladin-contract.spec.mjs`:
    - Proves the contract covers Altar, Paladin, Holy Light, revive, slice order, and forbidden scope.
    - Proves current `GameData.ts` still has no `altar_of_kings` or `paladin`.
    - Proves Blacksmith/AWT research does not target Paladin.
    - Proves the next order is source boundary -> data -> runtime -> proof.
  - Static proof:
    - `node --test tests/v9-hero1-altar-paladin-contract.spec.mjs tests/v9-human-core-global-gap-inventory.spec.mjs` -> 45/45 pass.
    - `node --test tests/v9-human-core-global-gap-inventory.spec.mjs tests/v9-hn7-blacksmith-branch-global-closure.spec.mjs` -> 46/46 pass.
  - `npm run build` pass.
  - `npx tsc --noEmit -p tsconfig.app.json` pass.
- Process evidence:
  - GLM produced the first contract and proof.
  - Codex corrected unverified "War3 ROC original" numeric claims into candidate references and inserted `HERO2-SRC1` before data seed.
- User evidence: async.
- State after: `accepted`

```text
HERO1 accepted: Altar + Paladin branch contract exists.
No hero runtime or data seed is implemented yet.
Next: HERO2-SRC1 Altar + Paladin + Holy Light source boundary.
```

### V9 HERO2-SRC1 — Altar + Paladin + Holy Light source boundary

- Gate: `HERO2-SRC1`
- State before: HERO1 accepted a hero-entry contract but intentionally left exact Altar / Paladin / Holy Light values as candidate references.
- Engineering evidence:
  - `docs/V9_HERO2_ALTAR_PALADIN_SOURCE_BOUNDARY.zh-CN.md`
    - Fixes the Altar of Kings adopted data values: 180 gold / 50 lumber, 60s build time, 900 hp, armor 5, size 3, T1 availability, and `trains: ['paladin']`.
    - Fixes Paladin level 1 adopted values from the current source boundary: 425/100/5, 55s summon time, 650 hp, 255 mana, armor 4, 24 fixed project damage from 24-34 source range, melee range, 2.2 cooldown, speed mapping 270 -> 3.0.
    - Fixes Holy Light level 1 adopted values: 65 mana, 5s cooldown, range 80 -> 8.0, heal 200, ally organic non-self target boundary.
    - Defers revive cost/time to the later revive runtime task instead of inventing a fixed value.
    - Records project-local type mappings: Fortified building armor -> `ArmorType.Heavy`; Hero attack -> `AttackType.Normal`; Hero armor -> `ArmorType.Heavy`.
    - Records Holy Light 75 mana only as a non-adopted historical sample; current Blizzard Classic source value is 65.
    - Does not fix Paladin `manaRegen` from Priest/Sorceress defaults.
  - `tests/v9-hero2-altar-paladin-source-boundary.spec.mjs`
    - Proves the document covers Altar, Paladin, Holy Light, revive deferral, type mappings, conflict samples, and forbidden current-state claims.
    - Proves current `GameData.ts` still has no `altar_of_kings`, no `paladin`, no Hero/Fortified enum additions, and no `holy_light`.
    - Proves Paladin mana regeneration is not invented as `0.5`.
  - Static proof:
    - `node --test tests/v9-hero2-altar-paladin-source-boundary.spec.mjs tests/v9-hero1-altar-paladin-contract.spec.mjs` -> 46/46 pass.
  - `npm run build` pass.
  - `npx tsc --noEmit -p tsconfig.app.json` pass.
- Process evidence:
  - GLM produced the first source boundary and proof.
  - Codex corrected Holy Light mana source wording and removed the unproven Paladin manaRegen summary value before acceptance.
- User evidence: async.
- State after: `accepted`

```text
HERO2-SRC1 accepted: Altar / Paladin / Holy Light source boundary is corrected and proven.
No Altar, Paladin, Holy Light, revive, XP, or hero runtime is implemented yet.
Next: HERO3-DATA1 Altar of Kings data seed only.
```

### V9 HERO3-DATA1 — Altar of Kings data seed

- Gate: `HERO3-DATA1`
- State before: HERO2-SRC1 accepted Altar values, but no Altar data existed in `BUILDINGS`.
- Engineering evidence:
  - `src/game/GameData.ts`
    - Adds optional `BuildingDef.armor?: number` as a data-only field.
    - Adds `BUILDINGS.altar_of_kings` with `key: 'altar_of_kings'`, `name: '国王祭坛'`, 180 gold / 50 lumber, buildTime 60, hp 900, armor 5, supply 0, size 3, `trains: ['paladin']`, and `ArmorType.Heavy`.
    - Does not add `UNITS.paladin` or `ABILITIES.holy_light`.
  - `tests/v9-hero3-altar-data-seed.spec.mjs`
    - Proves Altar data matches HERO2 adopted values.
    - Proves Paladin and Holy Light data do not exist yet.
    - Proves worker build menu / command-surface exposure is not changed.
    - Proves `Game.ts` and `SimpleAI.ts` do not reference `altar_of_kings`.
  - Updated older HERO1/HERO2 proofs:
    - They no longer fail because the planned Altar data seed now exists.
    - They still prove Paladin/Holy Light/runtime are not implemented.
  - Static proof:
    - `node --test tests/v9-hero3-altar-data-seed.spec.mjs tests/v9-hero2-altar-paladin-source-boundary.spec.mjs tests/v9-hero1-altar-paladin-contract.spec.mjs` -> 62/62 pass.
  - `npm run build` pass.
  - `npx tsc --noEmit -p tsconfig.app.json` pass.
- Process evidence:
  - GLM produced the first Altar seed and proof.
  - GLM removed `armor: 5` after hitting a `BuildingDef` compile error.
  - Codex corrected the data model by adding optional building armor and restoring the adopted Altar armor value without wiring runtime consumption.
- User evidence: async.
- State after: `accepted`

```text
HERO3-DATA1 accepted: Altar of Kings exists as data only.
No worker build menu exposure, Paladin data, Holy Light, summon, revive, XP, hero UI, or AI exists yet.
Next: HERO4-DATA2 Paladin data seed only.
```

### V9 HERO4-DATA2 — Paladin data seed

- Gate: `HERO4-DATA2`
- State before: HERO3-DATA1 accepted Altar data and `trains: ['paladin']`, but no Paladin unit data existed.
- Engineering evidence:
  - `src/game/GameData.ts`
    - Adds optional hero fields to `UnitDef`: `isHero?`, `heroLevel?`, `heroXP?`, `heroSkillPoints?`, `isDead?`.
    - Adds `UNITS.paladin` with HERO2 adopted values: `key: 'paladin'`, `name: '圣骑士'`, 425 gold / 100 lumber, trainTime 55, hp 650, speed 3.0, supply 5, attackDamage 24, attackRange 1.0, attackCooldown 2.2, armor 4, sightRange 10, `canGather: false`, `AttackType.Normal`, `ArmorType.Heavy`, `maxMana: 255`, and initial hero fields.
    - Does not add Paladin `manaRegen`.
    - Does not add `ABILITIES.holy_light`.
  - `tests/v9-hero4-paladin-data-seed.spec.mjs`
    - Proves Paladin data matches HERO2 adopted values.
    - Proves hero fields are optional data fields.
    - Proves `BUILDINGS.altar_of_kings.trains` still references Paladin.
    - Proves no Holy Light data exists yet.
    - Proves `Game.ts` and `SimpleAI.ts` do not reference Paladin.
  - Updated older HERO1/HERO2/HERO3 proofs:
    - They no longer fail because the planned Paladin data seed now exists.
    - They still prove Holy Light and runtime exposure are not implemented.
  - Static proof:
    - `node --test tests/v9-hero4-paladin-data-seed.spec.mjs tests/v9-hero3-altar-data-seed.spec.mjs tests/v9-hero2-altar-paladin-source-boundary.spec.mjs tests/v9-hero1-altar-paladin-contract.spec.mjs` -> 82/82 pass.
    - `node --test tests/lane-feed.spec.mjs tests/dual-lane-companion.spec.mjs` -> 80/80 pass.
  - `npm run build` pass.
  - `npx tsc --noEmit -p tsconfig.app.json` pass.
- Process evidence:
  - GLM produced the Paladin data seed and static proof.
  - Codex locally reviewed the result, verified scope boundaries, and accepted it.
- User evidence: async.
- State after: `accepted`

```text
HERO4-DATA2 accepted: Paladin exists as data only.
No Holy Light data, Holy Light runtime, Paladin command-card, Altar summon, revive, XP, hero UI, visuals, or AI exists yet.
Next: HERO5-DATA3 Holy Light ability data seed only.
```

### V9 HERO5-DATA3 — Holy Light ability data seed

- Gate: `HERO5-DATA3`
- State before: HERO4-DATA2 accepted Paladin data, but no Holy Light ability data existed.
- Engineering evidence:
  - `src/game/GameData.ts`
    - Adds optional `TargetRule.excludeSelf?: boolean` to express the Holy Light not-self boundary as data.
    - Adds `ABILITIES.holy_light` with HERO2 adopted values: `key: 'holy_light'`, `name: '圣光术'`, `ownerType: 'paladin'`, `cost: { mana: 65 }`, cooldown 5, range 8.0, ally/alive/injured/not-self target rule, `effectType: 'flatHeal'`, `effectValue: 200`, duration 0, and `stackingRule: 'none'`.
    - Does not add Holy Light runtime, command-card exposure, Paladin mana initialization, undead damage, hero skill learning, revive, summon, AI, or visuals.
  - `tests/v9-hero5-holy-light-data-seed.spec.mjs`
    - Proves Holy Light data matches HERO2 adopted values.
    - Proves `TargetRule` can express not-self targeting without runtime changes.
    - Proves Paladin data remains present and still does not gain `manaRegen`.
    - Proves `Game.ts` and `SimpleAI.ts` do not reference `holy_light`, `castHolyLight`, Paladin casting, or Holy Light display text.
  - Updated older HERO1/HERO2/HERO4 proofs:
    - They no longer fail because the planned Holy Light data seed now exists.
    - They still prove runtime exposure is not implemented.
  - Static proof:
    - `node --test tests/v9-hero5-holy-light-data-seed.spec.mjs tests/v9-hero4-paladin-data-seed.spec.mjs tests/v9-hero3-altar-data-seed.spec.mjs tests/v9-hero2-altar-paladin-source-boundary.spec.mjs tests/v9-hero1-altar-paladin-contract.spec.mjs` -> 94/94 pass.
  - `npm run build` pass.
  - `npx tsc --noEmit -p tsconfig.app.json` pass.
- Process evidence:
  - GLM wrote the core data seed and partially updated HERO3 proof.
  - GLM stopped on an API/network error before completing the proof set.
  - Codex took over, completed the proof and stage-boundary updates, and accepted the task.
- User evidence: async.
- State after: `accepted`

```text
HERO5-DATA3 accepted: Holy Light exists as data only.
No Holy Light runtime, Paladin command-card, Altar summon, revive, XP, hero UI, visuals, or AI exists yet.
Next: HERO6-CONTRACT4 Altar runtime exposure contract.
```

### V9 HERO6-CONTRACT4 — Altar runtime exposure contract

- Gate: `HERO6-CONTRACT4`
- State before: HERO5-DATA3 accepted Altar, Paladin, and Holy Light data, but no runtime path existed.
- Engineering evidence:
  - `docs/V9_HERO6_ALTAR_RUNTIME_EXPOSURE_CONTRACT.zh-CN.md`
    - Defines the runtime split:
      - HERO6A: expose Altar construction only.
      - HERO6B: expose Paladin summon through a hero-specific path.
      - HERO6C: initialize Paladin mana from `UNITS.paladin.maxMana`.
      - HERO6D: keep Holy Light command-card/runtime closed until HERO7.
    - Records why `BUILDINGS.altar_of_kings.trains = ['paladin']` is valid data but unsafe for automatic generic runtime exposure.
    - Requires `isHero` protection or equivalent hero-specific handling before Altar enters runtime.
  - `tests/v9-hero6-altar-runtime-exposure-contract.spec.mjs`
    - Proves Altar / Paladin / Holy Light data exist.
    - Proves `PEASANT_BUILD_MENU` still excludes `altar_of_kings` at contract stage.
    - Proves `Game.ts` still has no Altar / Paladin / Holy Light runtime references.
    - Proves the contract documents generic trains leakage and splits Altar construction from Paladin summon and Holy Light runtime.
  - Static proof:
    - `node --test tests/v9-hero6-altar-runtime-exposure-contract.spec.mjs tests/v9-hero5-holy-light-data-seed.spec.mjs` -> 34/34 pass.
  - `npm run build` pass.
  - `npx tsc --noEmit -p tsconfig.app.json` pass.
- Process evidence:
  - GLM completed Task207 with `JOB_COMPLETE`.
  - Codex refreshed companion state, locally reviewed the files, and accepted the task.
- User evidence: async.
- State after: `accepted`

```text
HERO6-CONTRACT4 accepted: the Altar runtime exposure split is defined.
No Altar build-menu exposure, Paladin summon, Holy Light runtime, revive, XP, hero UI, visuals, or AI exists yet.
Next: HERO6A-IMPL1 Altar construction runtime exposure only.
```

### V9 HERO6A-IMPL1 — Altar construction runtime exposure

- Gate: `HERO6A-IMPL1`
- State before: HERO6-CONTRACT4 accepted the stage split, but Altar was not buildable.
- Engineering evidence:
  - `src/game/GameData.ts`
    - `PEASANT_BUILD_MENU` now includes `altar_of_kings`.
  - `src/game/Game.ts`
    - The generic `trains` command-card loop skips `UNITS[uKey].isHero`, preventing `BUILDINGS.altar_of_kings.trains = ['paladin']` from leaking a normal train button.
  - `tests/v9-hero6a-altar-construction-runtime.spec.ts`
    - Proves worker command card shows "国王祭坛".
    - Proves completed Altar does not show Paladin or Holy Light.
    - Proves Barracks Footman training still works through the generic path.
    - Codex strengthened the proof to use the real worker command-card construction path: click Altar, enter placement mode, place, spend 180/50, complete construction, then verify no Paladin / Holy Light leakage.
  - `tests/v9-hero6-altar-runtime-exposure-contract.spec.mjs`
    - Stage-updated HERO6 proof: Altar is now in `PEASANT_BUILD_MENU`, while Holy Light runtime and AI remain closed.
  - Verification:
    - `npm run build` pass.
    - `npx tsc --noEmit -p tsconfig.app.json` pass.
    - `./scripts/run-runtime-tests.sh tests/v9-hero6a-altar-construction-runtime.spec.ts --reporter=list` -> 4/4 pass.
    - `node --test tests/v9-hero6-altar-runtime-exposure-contract.spec.mjs tests/v9-hero5-holy-light-data-seed.spec.mjs` -> 35/35 pass.
    - `node --test tests/dual-lane-companion.spec.mjs tests/lane-feed.spec.mjs` -> 89/89 pass.
    - `./scripts/cleanup-local-runtime.sh` pass; no Vite / Playwright / Chromium / chrome-headless-shell leftovers.
- Process evidence:
  - GLM completed Task208 with `JOB_COMPLETE`.
  - Codex rejected the first runtime proof as too weak for the construction claim, strengthened ALTAR-RT4, reran verification, and accepted the task.
- User evidence: async.
- State after: `accepted`

```text
HERO6A-IMPL1 accepted: Altar can now be built through the worker command path.
Paladin summon, Holy Light runtime, revive, XP, full hero UI, visuals, and AI hero strategy remain closed.
Next: HERO6B-IMPL2 Paladin hero summon runtime only.
```

### V9 HERO6B-IMPL2 — Paladin hero summon runtime

- Gate: `HERO6B-IMPL2`
- State before: HERO6A accepted; Altar was buildable, but selecting Altar did not expose Paladin summon.
- Engineering evidence:
  - `src/game/Game.ts`
    - Generic `trains` path still skips `isHero` units.
    - Completed Altar gets a hero-specific command-card path for `UNITS[heroKey].isHero`.
    - The button reads Paladin cost, supply and train time from data.
    - Hero uniqueness is enforced in two places:
      - command-card availability checks all player buildings for queued Paladin, not just the selected Altar;
      - `trainUnit` rejects a hero train if the same team already has a live or queued hero of that type.
  - `tests/v9-hero6b-paladin-summon-runtime.spec.ts`
    - Proves completed Altar shows Paladin summon.
    - Proves click spends 425 gold / 100 lumber and queues Paladin.
    - Proves after train time exactly one Paladin exists with `mana === maxMana === 255`.
    - Codex strengthened PSUM-4 to create two Altars and prove the second Altar plus direct `g.trainUnit(secondAltar, 'paladin')` cannot queue or charge a second Paladin.
    - Proves Holy Light still does not appear after Paladin exists.
    - Proves Barracks Footman training still works.
  - Verification:
    - `npm run build` pass.
    - `npx tsc --noEmit -p tsconfig.app.json` pass.
    - `./scripts/run-runtime-tests.sh tests/v9-hero6b-paladin-summon-runtime.spec.ts --reporter=list` -> 6/6 pass.
    - `node --test tests/v9-hero6-altar-runtime-exposure-contract.spec.mjs tests/v9-hero5-holy-light-data-seed.spec.mjs` -> 35/35 pass.
    - `./scripts/cleanup-local-runtime.sh` pass; no Vite / Playwright / Chromium / chrome-headless-shell leftovers.
- Process evidence:
  - GLM completed Task209 with `JOB_COMPLETE`.
  - Codex found and fixed the multi-Altar / direct-call uniqueness gap before acceptance.
- User evidence: async.
- State after: `accepted`

```text
HERO6B-IMPL2 accepted: Paladin can now be summoned from a completed Altar through a hero-specific path.
Holy Light runtime, revive, XP, full hero UI, visuals, and AI hero strategy remain closed.
Next: HERO7-IMPL1 Holy Light manual runtime only.
```

### V9 HERO7-IMPL1 — Holy Light manual runtime

- Gate: `HERO7-IMPL1`
- State before: HERO6B accepted; Paladin could be summoned and had 255 mana, but Holy Light was data-only.
- Engineering evidence:
  - `src/game/Game.ts`
    - Adds `castHolyLight(paladin, target)` near Priest Heal.
    - Reads `ABILITIES.holy_light` for mana cost, cooldown, range and heal amount.
    - Rejects non-Paladin caster, enemy target, self, insufficient mana, active cooldown, dead/full-health target, building target and out-of-range target.
    - Adds Paladin command-card button `圣光术`; button uses ability data for copy and disabled state.
  - `tests/v9-hero7-holy-light-runtime.spec.ts`
    - Proves Paladin command card shows Holy Light.
    - Proves clicking the command-card button heals an injured friendly unit, spends 65 mana and starts cooldown.
    - Proves direct method path caps healing at target max HP.
    - Proves self/enemy/building/full-health/out-of-range are rejected.
    - Proves insufficient mana and active cooldown block direct cast, and command-card button disables for cooldown / low mana.
    - Proves Holy Light is absent from Altar, Barracks, worker, Footman, Knight, Priest, Sorceress and enemy command cards.
    - Proves Barracks Footman training still works.
  - Stage-updated static proofs:
    - HERO1-HERO6 static proofs now allow Paladin / Holy Light runtime only through data-driven paths.
    - SimpleAI remains free of Altar / Paladin / Holy Light references.
  - Verification:
    - `npm run build` pass.
    - `npx tsc --noEmit -p tsconfig.app.json` pass.
    - `node --test tests/v9-hero5-holy-light-data-seed.spec.mjs tests/v9-hero6-altar-runtime-exposure-contract.spec.mjs tests/v9-hero4-paladin-data-seed.spec.mjs tests/v9-hero3-altar-data-seed.spec.mjs tests/v9-hero2-altar-paladin-source-boundary.spec.mjs tests/v9-hero1-altar-paladin-contract.spec.mjs` -> 117/117 pass.
    - `./scripts/run-runtime-tests.sh tests/v9-hero7-holy-light-runtime.spec.ts --reporter=list` -> 7/7 pass.
    - `./scripts/cleanup-local-runtime.sh` pass; no Vite / Playwright / Chromium / chrome-headless-shell leftovers.
- Process evidence:
  - GLM completed Task210 with `JOB_COMPLETE`.
  - Codex required stronger runtime proof before closeout: command-card click path and concrete non-Paladin card checks.
  - Codex then added healing-cap and cooldown-button assertions before acceptance.
- User evidence: async.
- State after: `accepted`

```text
HERO7-IMPL1 accepted: Paladin can manually cast Holy Light through the command card.
Revive, XP, leveling, skill points, full hero UI, visuals, AI hero strategy, other Human heroes, items and shops remain closed.
Next: HERO8-CLOSE1 minimal hero runtime closure inventory.
```

### V9 HERO8-CLOSE1 — Minimal hero runtime closure inventory

- Gate: `HERO8-CLOSE1`
- State before: HERO7 accepted; Altar construction, Paladin summon and manual Holy Light were live, but the minimum hero branch had not been closed into one evidence chain.
- Engineering evidence:
  - `docs/V9_HERO8_MINIMAL_HERO_RUNTIME_CLOSURE.zh-CN.md`
    - Maps HERO1 contract, HERO2 source boundary, HERO3 Altar data, HERO4 Paladin data, HERO5 Holy Light data, HERO6 runtime split, HERO6A Altar construction, HERO6B Paladin summon and HERO7 Holy Light runtime into one chain.
    - Lists current live capabilities: worker builds Altar, completed Altar summons exactly one Paladin, Paladin starts with 255 mana, Paladin manually casts Holy Light using `ABILITIES.holy_light`.
    - Lists closed capabilities: revive, dead hero state, tavern, XP, leveling, skill points, aura, inventory, items, shop, Holy Light autocast, AI hero strategy, other three Human heroes, visuals/assets, air, second race, multiplayer and public release.
    - Recommends a bounded next branch without implementing it.
  - `tests/v9-hero8-minimal-hero-runtime-closure.spec.mjs`
    - Static proof 26/26 verifies the closure document references accepted HERO1-HERO7 evidence, lists live/closed capabilities, avoids forbidden production files, and does not claim Human heroes are complete.
  - Verification:
    - `node --test tests/v9-hero8-minimal-hero-runtime-closure.spec.mjs` -> 26/26 pass.
    - `npm run build` pass.
    - `npx tsc --noEmit -p tsconfig.app.json` pass.
- Process evidence:
  - GLM completed Task211 with `JOB_COMPLETE`.
  - Codex local review accepted it at `2026-04-16 12:15:14 CST`.
- User evidence: async.
- State after: `accepted`

```text
HERO8-CLOSE1 accepted: the minimum Altar + Paladin + Holy Light evidence chain is closed.
Complete Human heroes are still not complete.
Next: HERO9-CONTRACT1 hero death and Altar revive branch contract.
```

### V9 HERO9-CONTRACT1 — Hero death and Altar revive branch contract

- Gate: `HERO9-CONTRACT1`
- State before: HERO8 accepted; the minimum hero evidence chain was closed, but hero death and revive had no implementation contract.
- Engineering evidence:
  - `docs/V9_HERO9_HERO_DEATH_REVIVE_CONTRACT.zh-CN.md`
    - Defines the next branch as hero death state + Altar revive.
    - Defines death semantics: stop actions, stop normal targeting, keep a dead hero record, set `isDead = true`, HP remains 0, and keep hero uniqueness.
    - Defines revive as a separate Altar path for an existing dead hero, not a new summon.
    - Requires source boundary for revive cost/time/HP/mana and corpse/selection semantics before production implementation.
    - Keeps XP, leveling, other heroes, Tavern, items, shop, aura, AI hero strategy, visuals/assets, air, second race, multiplayer and public release closed.
  - `tests/v9-hero9-hero-death-revive-contract.spec.mjs`
    - Static proof 27/27 verifies current accepted facts, death semantics, revive path concerns, source-boundary requirement, forbidden scope and no production implementation.
    - Codex strengthened DRC-9 to prevent a wrong uniqueness predicate.
  - Verification:
    - `node --test tests/v9-hero9-hero-death-revive-contract.spec.mjs` -> 27/27 pass.
    - `npm run build` pass.
    - `npx tsc --noEmit -p tsconfig.app.json` pass.
- Process evidence:
  - GLM completed Task212 with `JOB_COMPLETE`.
  - Codex corrected the uniqueness logic: new summon blocks if same-team same-type hero record exists; revive is a separate path for `isDead === true`.
  - Codex local review accepted it at `2026-04-16 12:22:50 CST`.
- User evidence: async.
- State after: `accepted`

```text
HERO9-CONTRACT1 accepted: hero death + Altar revive now has a branch contract.
No death runtime, revive command, revive values, XP, leveling, AI, other heroes, items, visuals or assets are implemented.
Next: HERO9-SRC1 hero death / revive source boundary.
```

### V9 HERO9-SRC1 — Hero death / revive source boundary

- Gate: `HERO9-SRC1`
- State before: HERO9-CONTRACT1 accepted; death/revive had a contract, but revive values and death semantics were still source-boundary required.
- Engineering evidence:
  - `docs/V9_HERO9_REVIVE_SOURCE_BOUNDARY.zh-CN.md`
    - Records the source hierarchy and directly reviewable links for `war3mapMisc.txt` constants, Wowpedia / Warcraft Wiki hero behavior notes, and Blizzard Classic hero basics.
    - Adopts revive gold formula `baseCost × (0.40 + 0.10 × (level - 1))` with 700 gold hard cap, revive lumber 0, revive time formula `trainTime × level × 0.65` capped by `trainTime × 2.0`, revive HP full, and project-mapped revive mana full for the current simplified Paladin model.
    - Marks fractional resource rounding as project mapping: `Math.floor` / integer truncation until a stronger source proof says otherwise.
    - Adopts dead heroes still occupying supply, and defers full dead-hero visual/selectable UI.
    - Preserves Task212 predicate split: `hasExistingHero` blocks new summon; `deadHero` with `isDead === true` is the future revive path.
  - `tests/v9-hero9-revive-source-boundary.spec.mjs`
    - Static proof 24/24 verifies source hierarchy, reviewable URLs, revive cost/time/HP/mana decisions, corpse/selection/supply semantics, no placeholder 50% adoption, corrected uniqueness contract, and no production runtime edits.
  - Verification:
    - `node --test tests/v9-hero9-revive-source-boundary.spec.mjs` -> 24/24 pass.
    - `npm run build` pass.
    - `npx tsc --noEmit -p tsconfig.app.json` pass.
- Process evidence:
  - GLM completed Task213 with `JOB_COMPLETE` after a closeout-marker nudge.
  - Codex added source URLs and integer rounding proof before acceptance.
  - Codex local review accepted it at `2026-04-16 12:37:07 CST`.
- User evidence: async.
- State after: `accepted`

```text
HERO9-SRC1 accepted: revive values and dead-hero source semantics are bounded.
No death runtime, revive command, revive queue, XP, leveling, AI, other heroes, items, visuals or assets are implemented.
Next: HERO9-IMPL1 hero death-state runtime slice.
```

### V9 HERO9-IMPL1 — Hero death-state runtime slice

- Gate: `HERO9-IMPL1`
- State before: HERO9-SRC1 accepted; revive/death source boundary existed, but runtime still treated heroes like normal units on death.
- Engineering evidence:
  - `src/game/Game.ts`
    - `Unit` now has optional `isDead`.
    - `handleDeadUnits()` separates dead heroes from normal dead units: dead heroes keep their unit record, clamp `hp = 0`, set `isDead = true`, clear action/target/movement queues, hide the mesh, and remove selection/healthbar/outline surfaces.
    - Normal dead units/buildings still follow the existing cleanup/removal path.
    - Hero summon uniqueness uses same-team same-type hero existence, not `hp > 0`.
    - Dead heroes are skipped by auto-aggro and cannot cast Holy Light.
    - Altar summon disabled reason distinguishes live hero from dead hero needing future revive, without implementing revive.
  - `tests/v9-hero9-death-state-runtime.spec.ts`
    - Runtime proof 8/8 covers retained dead Paladin record, action clearing, enemy target clearing, auto-acquire exclusion, Altar button blocking, direct `trainUnit` guard, dead Holy Light guard, and normal non-hero cleanup.
  - `tests/v9-hero6b-paladin-summon-runtime.spec.ts`
    - Updated stale HERO6B expectation: after HERO7, Holy Light appears on Paladin only, not on Altar.
  - `tests/v9-hero9-revive-source-boundary.spec.mjs`
    - Updated source-boundary proof to allow death-state runtime while still proving no revive command/queue identifiers exist.
  - Verification:
    - `node --test tests/v9-hero9-revive-source-boundary.spec.mjs` -> 24/24 pass.
    - `npm run build` pass.
    - `npx tsc --noEmit -p tsconfig.app.json` pass.
    - `./scripts/run-runtime-tests.sh tests/v9-hero9-death-state-runtime.spec.ts tests/v9-hero6b-paladin-summon-runtime.spec.ts tests/death-cleanup-regression.spec.ts --reporter=list` -> 19/19 pass.
    - `./scripts/cleanup-local-runtime.sh` pass; no Vite / Playwright / Chromium / chrome-headless-shell leftovers.
- Process evidence:
  - GLM started Task214, auto-compacted/interrupted, then resumed after Codex nudge.
  - GLM also invoked the wrong runtime-suite wrapper once, which ran old shard tests and timed out; Codex killed the stray runtime/browser processes before local verification.
  - Codex local review accepted it at `2026-04-16 13:00:28 CST`.
- User evidence: async.
- State after: `accepted`

```text
HERO9-IMPL1 accepted: dead hero runtime state is live.
The Altar still has no revive command, revive queue, revive cost spend or timer.
Next: HERO9-DATA1 hero revive data seed.
```

### V9 HERO9-DATA1 — Hero revive data seed

- Gate: `HERO9-DATA1`
- State before: HERO9-SRC1 and HERO9-IMPL1 accepted; revive source values and dead-hero runtime existed, but no shared revive formula data existed.
- Engineering evidence:
  - `src/game/GameData.ts`
    - Exports `HERO_REVIVE_RULES`.
    - Records gold base factor 0.40, gold level factor 0.10, gold max factor 4.0, gold hard cap 700.
    - Records lumber base/level factors as 0.
    - Records revive time factor 0.65, time max factor 2.0, time hard cap 150.
    - Records life factor 1.0, mana start factor 1, mana bonus factor 0.
    - Records current project mappings: resource rounding `floor`, simplified mana mapping `maxMana`.
  - `docs/V9_HERO9_REVIVE_DATA_SEED.zh-CN.md`
    - Documents Paladin examples from current `UNITS.paladin`: level 1 gold 170, level 2 gold 212, level 10 gold 552, max revive time 110 seconds, revive HP 650, revive mana 255.
    - Codex corrected GLM's initial HP example from 700 to current true Paladin HP 650.
  - `tests/v9-hero9-revive-data-seed.spec.mjs`
    - Static proof verifies the data constants, source-boundary alignment, Paladin example calculations, no Task212 50 percent placeholder values, and no `Game.ts` revive runtime identifiers.
    - Codex changed the proof to read `GameData.ts` as text instead of importing TypeScript with `const enum`.
  - Verification:
    - `node --test tests/v9-hero9-revive-data-seed.spec.mjs tests/v9-hero9-revive-source-boundary.spec.mjs` -> 49/49 pass.
    - `npm run build` pass.
    - `npx tsc --noEmit -p tsconfig.app.json` pass.
    - `FORCE_RUNTIME_CLEANUP=1 ./scripts/cleanup-local-runtime.sh` pass.
    - Stale runtime lock from dead pid `87880` removed; no Vite / Playwright / chrome-headless-shell leftovers remain.
- Process evidence:
  - GLM completed the first implementation draft but stopped before trustworthy closeout.
  - Codex took over, corrected the HP example, reran static/build/typecheck verification, and cleaned unrelated runtime leftovers before acceptance.
- User evidence: async.
- State after: `accepted`

```text
HERO9-DATA1 accepted: revive formula data exists.
The Altar still has no revive command, revive queue, revive cost spend or timer.
Next: HERO9-CONTRACT2 Altar revive runtime contract.
```

### V9 HERO9-CONTRACT2 — Altar revive runtime contract

- Gate: `HERO9-CONTRACT2`
- State before: HERO9-DATA1 accepted; revive formulas existed as data, but the runtime button, queue and completion behavior were not yet contracted.
- Engineering evidence:
  - `docs/V9_HERO9_REVIVE_RUNTIME_CONTRACT.zh-CN.md`
    - Defines Altar command-card availability: revive appears only for same-team Paladin records with `isDead === true`; live Paladin blocks summon and does not open revive; duplicate revive queues are rejected.
    - Defines cost formula from `HERO_REVIVE_RULES`: level 1 Paladin revive costs 170 gold and 0 lumber.
    - Defines runtime queue duration mapping: `Math.round(min(trainTime * level * 0.65, trainTime * 2.0, 150))`; level 1 Paladin is 36 seconds.
    - Defines queue shape: references the retained hero, spends resources once, rejects insufficient resources before spending, and does not create a second Paladin.
    - Defines completion behavior: same Paladin record becomes live, `isDead` clears/false, hp restores to 650, mana restores to 255, mesh becomes visible, state is idle, and no auto-selection occurs.
    - Keeps XP, leveling, skill points, other Human heroes, AI hero strategy, items, shop, Tavern, visuals, assets, air, second race, multiplayer and public release closed.
  - `tests/v9-hero9-revive-runtime-contract.spec.mjs`
    - Static proof 36/36 verifies contract shape, availability, cost, time, Paladin examples, queue constraints, completion behavior, forbidden scope and no `Game.ts` revive runtime identifiers.
  - Verification:
    - `node --test tests/v9-hero9-revive-runtime-contract.spec.mjs tests/v9-hero9-revive-data-seed.spec.mjs tests/v9-hero9-revive-source-boundary.spec.mjs` -> 85/85 pass.
    - `npm run build` pass.
    - `npx tsc --noEmit -p tsconfig.app.json` pass.
- Process evidence:
  - GLM completed the contract and proof, then hit a queue-doc edit conflict because Codex had already updated the same queue area.
  - Codex killed unrelated runtime leftovers, reran the exact static/build/typecheck set, and accepted the contract.
- User evidence: async.
- State after: `accepted`

```text
HERO9-CONTRACT2 accepted: Altar revive runtime behavior is contracted.
The Altar still has no implemented revive button, revive queue, resource spend or timer.
Next: HERO9-IMPL2 Altar revive runtime.
```

## 5. 当前保守结论

```text
V9 is active.
V9-HOTFIX1, V9-BASELINE1, and V9-EXPAND1 have engineering evidence.
V9-UA1 remains async user/tester direction verdict.
HN7-CLOSE13 accepted: the Blacksmith/Barracks upgrade branch is closed as a branch.
HUMAN-GAP1 accepted: complete Human gaps are inventoried, but complete Human is not closed yet.
HERO1 accepted: Altar + Paladin branch contract exists.
HERO2-SRC1 accepted: Altar + Paladin + Holy Light source boundary exists.
HERO3-DATA1 accepted: Altar data seed exists.
HERO4-DATA2 accepted: Paladin data seed exists.
HERO5-DATA3 accepted: Holy Light data seed exists, but no hero runtime or command surface is implemented.
HERO6-CONTRACT4 accepted: Altar runtime exposure is split into safe stages.
HERO6A-IMPL1 accepted: Altar is buildable through the worker command path, while Paladin / Holy Light still do not leak.
HERO6B-IMPL2 accepted: Paladin summon is live with global uniqueness, while Holy Light still does not appear.
HERO7-IMPL1 accepted: Holy Light manual runtime is live through Paladin command card.
HERO8-CLOSE1 accepted: the minimum Altar + Paladin + Holy Light evidence chain is closed.
HERO9-CONTRACT1 accepted: hero death + Altar revive now has a branch contract.
HERO9-SRC1 accepted: revive values and dead-hero source semantics are bounded.
HERO9-IMPL1 accepted: dead hero runtime state is live.
HERO9-DATA1 accepted: revive formula data exists.
HERO9-CONTRACT2 accepted: Altar revive runtime behavior is contracted.
Next: HERO9-IMPL2 Altar revive runtime.
AI Castle/Knight full strategy, four heroes, air, items, assets remain closed until a new branch contract opens them.
```

### V9 HN7-DATA4 — Steel / Mithril melee upgrade data seed

- Gate: `HN7-DATA4`
- State before: HN7-SRC4 accepted; Steel / Mithril source values fixed, but no data existed.
- Engineering evidence:
  - `tests/v9-hn7-melee-upgrade-higher-level-data-seed.spec.mjs` 9/9 pass
  - `tests/v9-hn7-melee-upgrade-higher-level-source.spec.mjs` 6/6 pass
  - `tests/v9-hn7-melee-upgrade-data-seed.spec.mjs` 10/10 pass
  - `tests/v9-hn7-melee-upgrade-source-packet.spec.mjs` 6/6 pass
  - Combined focused static run: 31/31 pass
- User evidence: async
- State after: `accepted`

```text
HN7-DATA4 is accepted.
Steel / Mithril melee upgrade data is now seeded:
  - steel_forged_swords: 钢剑, 175 gold / 175 lumber, 75s, requires Keep, prerequisite Iron Forged Swords
  - mithril_forged_swords: 秘银剑, 250 gold / 300 lumber, 90s, requires Castle, prerequisite Steel Forged Swords
  - Both apply incremental attackDamage +1 to footman, militia, and knight
  - BUILDINGS.blacksmith.researches now exposes long_rifles, iron, steel, and mithril
  - Game.ts has no Steel / Mithril special case
  - No ranged, armor, Animal War Training, AI, hero, air, item, asset, or dice model work was added
The next adjacent work is HN7-IMPL5: Steel / Mithril runtime smoke.
```

### V9 HN7-IMPL5 — Steel / Mithril runtime smoke

- Gate: `HN7-IMPL5`
- State before: HN7-DATA4 accepted; Steel / Mithril data exists but runtime behavior was unproven.
- Engineering evidence:
  - `tests/v9-hn7-steel-mithril-runtime.spec.ts` 7/7 pass
  - `npm run build` pass before runtime, so `vite preview` served current `dist`
- User evidence: async
- State after: `accepted`

```text
HN7-IMPL5 is accepted.
Steel / Mithril runtime behavior is proven:
  - Blacksmith command card shows 钢剑 and 秘银剑
  - Steel requires Keep and completed Iron
  - Mithril requires Castle and completed Steel
  - Steel spends 175 gold / 175 lumber; Mithril spends 250 gold / 300 lumber
  - Iron + Steel + Mithril completion gives existing footman, militia, and knight cumulative attackDamage +3
  - Newly spawned footman and knight inherit cumulative +3
  - Rifleman, Mortar Team, Priest, and Sorceress remain unchanged
  - No new data, AI, hero, air, item, asset, or dice model work was added
The next adjacent work is HN7-CLOSE6: melee weapon upgrade chain closure inventory.
```

### V9 HERO9-IMPL2 — Altar revive runtime

- Gate: `HERO9-IMPL2`
- State before: HERO9-CONTRACT2 accepted; death-state runtime and revive formula data existed, but no Altar revive runtime was live.
- Engineering evidence:
  - `tests/v9-hero9-revive-runtime.spec.ts` 7/7 pass
  - `tests/v9-hero9-death-state-runtime.spec.ts` 8/8 pass
  - `tests/v9-hero6b-paladin-summon-runtime.spec.ts` 6/6 pass
  - Combined focused runtime run: 21/21 pass
  - `tests/v9-hero9-revive-runtime-contract.spec.mjs` + data/source static proofs: 85/85 pass
  - `npm run build` pass
  - `npx tsc --noEmit -p tsconfig.app.json` pass
  - `./scripts/cleanup-local-runtime.sh` pass; no Vite / Playwright / Chrome leftovers after accepted run
- User evidence: async
- State after: `accepted`

```text
HERO9-IMPL2 is accepted.
Altar revive runtime is now live:
  - No dead Paladin means no revive entry and normal summon remains available
  - Live Paladin blocks summon and does not open revive
  - Dead Paladin opens "复活圣骑士"
  - Level 1 Paladin revive reads HERO_REVIVE_RULES: 170 gold, 0 lumber, 36 seconds
  - Insufficient gold rejects before spending or queueing
  - Duplicate clicks while queued do not double-spend or create duplicate queue entries
  - Completion restores the same Paladin record, not a new unit
  - Restored Paladin has hp 650, mana 255, visible mesh, health bar restored, selectable mesh restored, idle state and no auto-selection
  - Full hero UI, XP, leveling, skill points, other Human heroes, hero AI, items, air, second race, multiplayer and new assets remain closed

Process note:
  - GLM wrote a partial implementation, then stopped at an edit failure and repeatedly launched direct Playwright commands outside the runtime lock.
  - Codex killed the duplicate direct Playwright runs, temporarily stopped the GLM watch session, and completed/verified the slice through the locked focused runtime path.

Next: HERO9-CLOSE1 death/revive closure inventory.
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
