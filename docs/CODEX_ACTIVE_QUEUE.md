# Codex Active Queue

Purpose: Codex needs its own execution queue. GLM's queue keeps the lieutenant busy; this queue keeps the project brain and integration owner busy while GLM works.

Primary runway docs for the current long push:

- `/Users/zhaocong/Documents/war3-re/docs/plans/2026-04-13-codex-owner-runway.md`
- GLM counterpart: `/Users/zhaocong/Documents/war3-re/docs/plans/2026-04-13-glm-stage-a-product-shell-runway.md`

## Operating Rule

Codex must not enter passive wait just because GLM is running.

Passive wait is allowed only when all are true:

- GLM is modifying the same files Codex would need to touch.
- No documentation, planning, review, CI, or non-overlapping implementation task is available.
- Continuing would create real merge risk or require human product judgment.

If GLM runs longer than 5 minutes, Codex must choose one of these actions:

1. Work the next non-conflicting Codex queue item.
2. Review/update project contracts and task queues.
3. Check CI/deploy health.
4. Prepare the next GLM task prompt from `docs/GLM_READY_TASK_QUEUE.md`.
5. If all are blocked, write a clear blocked note with the exact blocker.

## Division Of Labor

Codex owns:

- Product contracts and priority order.
- Architecture and file-boundary decisions.
- Integration of GLM output.
- Human-feedback translation into tests or task cards.
- High-risk visual/readability decisions.
- CI/test harness quality.
- Final acceptance or rejection of GLM claims.

GLM owns:

- Scoped deterministic runtime tests.
- Small proven repairs inside allowed files.
- Repetitive regression packs.
- Mechanical docs/checklist sync.
- Narrow module extraction after contracts exist.

## Status Vocabulary

- `active`: Codex is doing this now.
- `ready`: safe to start without user input.
- `watch`: wait for external result, but do not block all Codex work.
- `blocked`: needs user decision or conflicting GLM files.
- `done`: completed and committed.
- `superseded`: replaced by a better task.

## Deep-Work Trunk Rule

Codex should not keep opening broad parallel fronts.

Operational cap:

- at most `3` active Codex trunks at once
- each trunk must map to one capability cluster, one immediate next move, and one clear reason it is live now
- if a new idea appears outside the active trunks, add it as `ready` or `blocked`; do not turn it into a fourth active front

A trunk is larger than one task but smaller than a roadmap theme:

- it should be deep enough to absorb adjacent follow-ups
- but narrow enough that Codex can still keep product and file-boundary control

## Current Trunk Selection

These are the active Codex trunks until explicitly changed:

| Trunk | Status | Scope | Why now |
| --- | --- | --- | --- |
| `CT1` Product Shell / Session Trunk | `active` | main menu, mode select, match setup, loading/briefing, pause, results, back-to-menu, rematch, settings/help boundaries | this is the missing product shell; without it the project is still a direct-boot RTS prototype |
| `CT2` Battlefield Readability / Asset Trunk | `active` | H2 base grammar, first-look readability, A1/A2 asset batches, proxy/hybrid replacement priorities | this closes the first-look War3-like gap and the material sourcing gap together |
| `CT3` Match Loop Closure Trunk | `active` | H1 tail + H3 entry: AI pressure/recovery, ending clarity, results flow, short-match closure | this is the bridge from “opening loop works” to “a short match exists” |

Everything else should attach to one of these trunks or wait as `ready`.

## Current Codex Queue State

| Task | Status | Last update | Why it matters |
| --- | --- | --- | --- |
| V9-CX1 — External feedback intake sync | done | 2026-04-15 | Task115 已 Codex accepted；V9-HOTFIX1 工程通过，反馈能进入 hotfix / patch / debt / user gate，且不会自动批准用户 verdict。 |
| V9-CX2 — Next expansion decision packet | done | 2026-04-15 | 已在总路线、能力母表和终局差距图里固定：V9 第一轮扩展只主攻完整 Human 核心与数值系统补全；第二阵营、多人、公开发布和纯包装暂不进入 live queue。 |
| V9-CX3 — Baseline release note packet | done | 2026-04-15 | Task116 已 Codex accepted；README / Known Issues / V9 ledger 已切到 V9 baseline 口径，V9-BASELINE1 工程通过。 |
| V9-CX4 — Human numeric expansion runway sync | done | 2026-04-15 | Task117 已由 Codex 接管复核并接受；Human 背景板不再把 Rifleman、Blacksmith、Lumber Mill、Workshop、Mortar、Arcane Sanctum、Priest、Long Rifles 等已实现内容当作缺失。 |
| V9-CX5 — HN2 schema boundary feed guard | done | 2026-04-15 | Task118 已 Codex accepted；修复缺任务卡幽灵 in_progress，并把 HN2 schema proof 加固为对象级文本解析。 |
| V9-CX6 — Keep tier implementation contract review | done | 2026-04-15 | Task119 已 Codex accepted；复核时纠正上游 schema 残留的 keep->castle 指令，并把 schema proof 改为允许 `keep` seed、仍禁止 `castle` 和新单位/科技。 |
| V9-CX7 — Keep tier data seed review | done | 2026-04-15 | Task120 已 Codex accepted：`GameData.ts` 只落 Keep seed，node proof 27/27、build、tsc、cleanup、无残留通过；schema 第 6 节已去掉未来重复派发口径。 |
| V9-CX8 — Keep upgrade flow next-contract draft | done | 2026-04-15 | Codex 已准备 Task120 之后的相邻合同草稿：下一步只能是 Town Hall -> Keep 最小升级路径，必须等 Task120 accepted 后才能派发，且仍禁止 Castle、Knight、完整科技树和素材扩张。 |
| V9-CX9 — Keep upgrade flow runtime review | done | 2026-04-15 | Task121 已由 Codex 接管并 accepted：Town Hall -> Keep 最小升级路径可用，资源不足禁用、资源足够扣费、同建筑变 Keep、无 Castle/新单位/新科技/AI/素材扩张；build、tsc、focused runtime 3/3、node proof 20/20、cleanup 均通过。 |
| V9-CX10 — Keep post-upgrade command surface dispatch | done | 2026-04-15 | Task122 已由 GLM 完成并经 Codex 本地复核接受：升级后的 Keep 能训练农民并保留集结点；仍无 Castle、Knight、完整 T2 解锁、AI 二本策略或素材扩张。 |
| V9-CX11 — Keep/T2 unlock compatibility inventory dispatch | done | 2026-04-15 | Task123 已 Codex accepted：当前 Workshop / Arcane Sanctum 与未来 Keep gating 的兼容关系已盘点，静态 proof 18/18、build、tsc、cleanup 均通过；未改运行时代码。 |
| V9-CX12 — Keep/T2 unlock contract packet dispatch | done | 2026-04-15 | Task124 已 Codex accepted：Keep/T2 解锁目标合同和迁移验收标准已定义，静态 proof 24/24、build、tsc、cleanup 均通过；未改运行时代码。 |
| V9-CX13 — Keep/T2 runtime gating dry-run dispatch | done | 2026-04-15 | Task125 已由 Codex 接管并 accepted：GLM 初版代理证明无效且卡进 compact；Codex 改成现有 techPrereq 机制 + 模拟 Keep gate 命令卡证明。runtime 4/4、node 12/12、build、tsc、cleanup 均通过。 |
| V9-CX14 — AI Keep upgrade readiness dispatch | done | 2026-04-15 | Task126 已由 Codex 接管并 accepted：AI 可在受控条件下使用现有 Town Hall -> Keep 升级路径，升级后仍识别 Keep 为主基地；build、tsc、focused runtime 6/6、AI/V7 regression 10/10、node contract 12/12、cleanup 均通过。 |
| V9-CX15 — Keep/T2 building unlock migration dispatch | done | 2026-04-15 | Task127 已 Codex accepted：Workshop / Arcane Sanctum 的建造门槛真实迁移到 Keep；build、tsc、runtime 4/4 + 12/12 + 5/5、V7 AI same-rule 8/8、node 12/12、cleanup 均通过。 |
| V9-CX16 — Keep upgrade and T2 unlock feedback dispatch | done | 2026-04-15 | Task128 已 Codex accepted：升级中命令卡显示“升级主城…”和会下降的剩余秒数；未升级时 T2 建筑原因清楚，Keep 后可用。build、tsc、runtime 12/12、node 12/12、cleanup 通过。 |
| V9-CX17 — Human T2 production path smoke dispatch | done | 2026-04-15 | Task129 已 Codex accepted：玩家侧最小二本整链 smoke 证明升级 Keep 后解锁 T2 建筑，并能从正常训练队列训练 Mortar / Priest；build、tsc、runtime 7/7、node 12/12、cleanup、无残留通过。 |
| V9-CX18 — AI post-Keep T2 usage dispatch | done | 2026-04-15 | Task130 已 Codex accepted：AI 在 Keep 后通过真实建造路径启动 Workshop / Arcane Sanctum，并训练 Mortar / Priest；Codex 去掉 Priest 随军波次隐性战术改动，补强双建筑、精确扣费、人口阻塞和 KU-6 证明。build、tsc、runtime 21/21、node 12/12、cleanup、无残留通过。 |
| V9-CX19 — T2 numeric ledger alignment dispatch | done | 2026-04-15 | Task131 已由 Codex 接管并 accepted：GLM 写出账本草稿但无 closeout，初版 proof import `GameData.js` 失败；Codex 改成静态读取 `GameData.ts` + 文档文本，node proof 5/5、build、tsc、cleanup、无残留通过。 |
| V9-CX20 — T2 visible numeric hints dispatch | done | 2026-04-15 | Task132 已由 Codex 接管并 accepted：GLM 初版 proof 未覆盖时间字段且无 closeout；Codex 补命令卡 build/train/upgrade time 展示并加断言。build、tsc、runtime 16/16、cleanup、无残留通过。 |
| V9-CX21 — T2 role combat smoke dispatch | done | 2026-04-15 | Task133 已由 Codex 接管并 accepted：GLM 初版 proof 过宽且旧验证重复启动；Codex 收窄为 3 个 focused smoke。build、tsc、runtime 15/15、cleanup、无残留通过。 |
| V9-CX22 — HN3 ability numeric model dispatch | done | 2026-04-15 | Task134 已由 Codex 接管并 accepted：GLM 写出文档后停在 prompt；Codex 补静态 proof，验证 Priest Heal、Rally Call、Mortar AOE 三个已有样本映射到最小能力数值字段。build、tsc、node proof 5/5、cleanup 通过。 |
| V9-CX23 — Priest Heal ability data seed dispatch | done | 2026-04-15 | Task135 已 Codex accepted：GLM 写出 AbilityDef / ABILITIES.priest_heal 和静态 proof；Codex 修正 proof 切片后本地复核 build、tsc、node proof 5/5、cleanup 通过。 |
| V9-CX24 — Priest Heal runtime data-read migration dispatch | done | 2026-04-15 | Task136 已由 Codex 接管并 accepted：`castHeal` / auto-heal 读取 `ABILITIES.priest_heal`，行为不变。build、tsc、focused runtime 13/13、Task135 node proof 5/5、cleanup 通过。 |
| V9-CX25 — Rally Call ability data seed dispatch | done | 2026-04-15 | Task137 已由 Codex 接管并 accepted：`ABILITIES.rally_call` 数据种子落地，运行时未迁移。build、tsc、node proof 4/4、cleanup 通过。 |
| V9-CX26 — Mortar AOE ability data seed dispatch | done | 2026-04-15 | Task138 已由 Codex 接管并 accepted：`ABILITIES.mortar_aoe` 数据种子落地，运行时未迁移。build、tsc、node proof 4/4 通过。 |
| V9-CX27 — Rally Call runtime data-read migration dispatch | done | 2026-04-15 | Task139 已由 Codex 接管验收：Rally Call runtime 读取 `ABILITIES.rally_call` 的 cooldown、range、duration、effectValue，行为不变。build、tsc、focused runtime 13/13、cleanup 通过。 |
| V9-CX27A — GLM submitted-progress monitor fix | done | 2026-04-15 | 修复 feed 对 Claude Code 终端状态的误判：任务卡已提交并出现 Reading/Scurrying 等执行痕迹时，即使 companion 暂时标 interrupted，也按 running 处理，不再进入 same-title freeze。`tests/lane-feed.spec.mjs` 43/43 通过。 |
| V9-CX28 — Mortar AOE runtime data-read migration dispatch | done | 2026-04-15 | Task140 已由 Codex 接管验收：Mortar AOE runtime 读取 `ABILITIES.mortar_aoe` 的 radius / falloff，行为不变。build、tsc、node proof 56/56、focused runtime 9/9、cleanup 通过。 |
| V9-CX29 — Ability command-card data-read migration dispatch | done | 2026-04-15 | Task141 已由 Codex 接管验收：Rally Call / Priest Heal 命令卡和可见提示读取 `ABILITIES`，旧 ability 常量不再作为 `Game.ts` 运行 / 界面数据源。build、tsc、runtime 14/14、cleanup 通过。 |
| V9-CX29A — GLM Searching progress monitor fix | done | 2026-04-15 | 修复 feed 对 Claude Code `Searching` / `Searched` 输出的误判：Task141 已提交并开始搜索时按 running 处理，不再显示 needs_submit。`tests/lane-feed.spec.mjs` 44/44 通过。 |
| V9-CX30 — HN3 ability data-read closure inventory dispatch | done | 2026-04-15 | Task142 已 Codex accepted：HN3 ability data-read 收口盘点完成，node proof 9/9、build、tsc、cleanup 通过。 |
| V9-CX31 — HN4 Militia / Defend branch contract dispatch | done | 2026-04-15 | Task143 已 Codex accepted：HN4 合同定义 Militia / Back to Work / Defend 三个能力的最小数据字段、runtime 行为、proof 序列和禁区。node proof 5/5、build、tsc、cleanup 通过。 |
| V9-CX32 — HN4 Militia data seed dispatch | done | 2026-04-15 | Task144 已由 Codex 接管并 accepted：`UNITS.militia` 与 `ABILITIES.call_to_arms` 数据种子落地，范围表达改成主基地附近，静态 proof 10/10、build、tsc、cleanup、无残留通过。 |
| V9-CX33 — HN4 Militia runtime dispatch | done | 2026-04-15 | Task145 已由 Codex 接管并 accepted：Worker 近主基地可“紧急动员”变 Militia，45 秒后自动回 Worker；Codex 补建造状态清理。build、tsc、runtime 6/6、node proof 10/10、cleanup 通过。 |
| V9-CX33A — GLM prompt closeout duplicate trim | done | 2026-04-15 | `lane-feed` 现在派发前会剥掉任务卡里的通用 closeout boilerplate，只保留 `dual-lane-companion` 追加的真实 job id closeout，减少重复 token 和提示冲突；`tests/lane-feed.spec.mjs` 47/47 通过。 |
| V9-CX33B — Watch capture window hardening | done | 2026-04-15 | `glm-watch.sh` / `codex-watch.sh` 的 capture 窗口默认扩大到 1200 行，并让 `lane-feed` 在 job marker 被长输出挤出时仍能识别最近的 Claude 进展行；bash syntax、lane-feed 49/49、GLM check running 通过。 |
| V9-CX33C — Runtime prompt-return monitor fix | done | 2026-04-16 | 修复 markerless progress 过宽的问题：Claude Code 已回到 `❯` 提示符时，不再把旧 `Update/Bash/Verifying` 行误判为 GLM 仍在运行；`tests/lane-feed.spec.mjs` 50/50 通过。 |
| V9-CX34 — HN4 Back to Work dispatch | done | 2026-04-16 | Task146 已由 Codex 接管并 accepted：Militia 命令卡“返回工作”读取 `ABILITIES.back_to_work`，点击立即回 Worker；build、tsc、runtime 12/12、node proof 10/10、cleanup 通过。 |
| V9-CX35 — HN4 Defend data seed dispatch | done | 2026-04-16 | Task147 已由 Codex 接管并 accepted：`ABILITIES.defend` 数据种子落地，类型化指向 `AttackType.Piercing`，静态 proof 15/15、build、tsc、cleanup 通过。 |
| V9-CX36 — HN4 Defend runtime dispatch | done | 2026-04-16 | Task148 已经 GLM 完成并由 Codex 复核接受：Footman 命令卡可切换“防御姿态”，速度和 Piercing 减伤读取 `ABILITIES.defend`；build、tsc、HN4 runtime 18/18、HN4 static 15/15、cleanup、无残留通过。 |
| V9-CX37 — HN4 closure inventory dispatch | done | 2026-04-16 | Task149 已经 GLM 完成并由 Codex 复核接受：HN4 三条最小链路数据+runtime+命令卡均有入口，未误宣称 AI/英雄/素材/Sorceress/Knight；node proof 16/16、build、tsc、cleanup、无残留通过。 |
| V9-CX38 — HN5 Sorceress / Slow contract dispatch | done | 2026-04-16 | Task150 已经 GLM 完成并由 Codex 复核接受：HN5 Sorceress / Slow 合同和 proof 成立；Codex 修正 Sorceress 弱远程 Magic 攻击口径。node proof 11/11、build、tsc、cleanup、无残留通过。 |
| V9-CX39 — HN5 Sorceress / Slow data seed dispatch | done | 2026-04-16 | Task151 已由 Codex 接管并 accepted：`UNITS.sorceress`、`AttackType.Magic`、Magic 显示名/倍率占位和 `ABILITIES.slow` 数据入口落地；Task152 后 Arcane Sanctum 已可训练 Sorceress，`Game.ts` 仍无 Slow runtime。node proof 10/10、build、tsc、cleanup、无残留通过。 |
| V9-CX40 — HN5 Sorceress training surface dispatch | done | 2026-04-16 | Task152 已由 Codex 接管并 accepted：Arcane Sanctum 命令卡可训练“女巫”，正常队列产出 Sorceress；选择面板显示中文名、法师标签、Magic / 无甲等基础数值，Slow 仍无 runtime。build、tsc、runtime 2/2、node proof 16/16 通过。 |
| V9-CX41 — HN5 Sorceress mana surface dispatch | done | 2026-04-16 | Task153 已由 Codex 接管并 accepted：Priest / Sorceress 的 mana 和回复速度来自 `UNITS` 数据，`spawnUnit` 不再写死 Priest；女巫选择面板显示 mana、可回复且不超过上限，Slow 仍无 runtime。build、tsc、runtime 5/5、node proof 16/16 通过。 |
| V9-CX42 — HN5 Slow runtime minimal dispatch | done | 2026-04-16 | Task154 已由 Codex 接管并 accepted：Slow 手动施放、敌方移动速度减益、刷新和过期恢复成立；基础速度不被 Slow 直接覆盖。build、tsc、runtime 9/9、node proof 16/16 通过。 |
| V9-CX43 — HN5 Slow auto-cast minimal dispatch | done | 2026-04-16 | Task155 已由 Codex 接管并 accepted：Slow 自动施法开关、目标筛选、防重复耗蓝成立；不接 AI、攻击速度减益、状态图标、素材或其他女巫技能。build、tsc、runtime 8/8、node proof 16/16 通过。 |
| V9-CX44 — HN5 closure inventory dispatch | done | 2026-04-16 | Task156 已经 GLM 完成并由 Codex 复核接受：Sorceress 数据、训练、mana、手动 Slow、自动 Slow 均有 proof，且未越界宣称 AI Slow、攻击速度减益、其他女巫技能、英雄、物品或素材；node proof 18/18 通过。 |
| V9-CX45 — HN6 Castle / Knight contract dispatch | done | 2026-04-16 | Task157 已经 GLM 完成并由 Codex 修正后接受：Castle / Knight 分支合同和静态 proof 成立；Knight 多前置复杂度保留，不静默简化成只要 Castle。node proof 7/7、build、tsc 通过。 |
| V9-CX46 — HN6 Castle data seed dispatch | done | 2026-04-16 | Task158 已经 GLM 完成并由 Codex 复核接受：Castle 数据种子和 `keep.upgradeTo = 'castle'` 已落地；node proof 12/12、build、tsc 通过。仍无 Castle runtime 和 Knight。 |
| V9-CX47 — HN6 Keep to Castle runtime dispatch | done | 2026-04-16 | Task159 已由 GLM 半启动并由 Codex 接管 accepted：Keep -> Castle 最小升级路径成立；Castle 完成后仍有 worker / rally，不暴露 Knight。build、focused runtime 9/9 通过。 |
| V9-CX48 — HN6 Knight prerequisite model dispatch | done | 2026-04-16 | Task160 已经 GLM 完成并由 Codex 复核接受：`UnitDef.techPrereqs?: string[]` 已定义，runtime 尚不消费；Knight 后续可表达 Castle + Blacksmith + Lumber Mill。node proof 13/13、build、tsc 通过。 |
| V9-CX49 — HN6 Knight data seed dispatch | done | 2026-04-16 | Task161 已由 GLM 完成并经 Codex 修正后 accepted：`UNITS.knight` 数据种子存在，speed 校准为 3.5，使用 Castle + Blacksmith + Lumber Mill 多前置；Barracks 仍不训练 Knight，Game.ts 仍不消费 `techPrereqs`。static proof 24/24、build、tsc 通过。 |
| V9-CX50 — HN6 Knight training prerequisite gate dispatch | done | 2026-04-16 | Task162 已由 GLM 半完成并经 Codex takeover accepted：Barracks 可训练 Knight，`techPrereqs` 多前置 runtime 已接入；缺 Castle / Blacksmith / Lumber Mill 任一项时禁用并显示原因，三者完成后按正常队列训练产出 Knight。focused runtime 5/5、static proof 24/24、build、tsc 通过。 |
| V9-CX51 — HN6 Knight combat identity smoke dispatch | done | 2026-04-16 | Task163 已由 GLM 完成并经 Codex 复核接受：修正初版 KCS-1 对运行时字段的错误假设后，Knight 数据身份、HUD 普通/重甲显示、受控耐打性和单击伤害均有 proof。runtime 3/3、static proof 13/13、build、tsc 通过。 |
| V9-CX52 — HN6 Castle / Knight closure inventory dispatch | done | 2026-04-16 | Task164 已由 Codex 接管并接受：新增 HN6 closure inventory proof，盘点 Castle 数据、Keep -> Castle、Knight 多前置、Knight 数据、训练门槛和战斗 smoke，且证明未打开 AI Castle、AI Knight、Animal War Training、英雄、空军、物品或完整 T3。node proof 6/6 通过。 |
| V9-CX53 — HN7 Blacksmith / Animal Training contract dispatch | done | 2026-04-16 | Task165 已由 GLM 完成并经 Codex 复核接受：HN7 合同定义 Blacksmith 三段升级和 Animal War Training 的字段、影响单位、实现顺序和禁区；Codex 软化未源校验 War3 口径后，static proof 14/14、build、tsc 通过。 |
| V9-CX54 — HN7 ResearchEffect maxHp support dispatch | done | 2026-04-16 | Task166 已由 GLM 半完成并经 Codex 接管接受：`ResearchEffect.stat` 支持 `maxHp`，`applyFlatDeltaEffect` 同时增加 maxHp / hp；没有新增研究数据、命令卡或 AI。node proof 26/26、build、tsc 通过。 |
| V9-CX55 — HN7 prerequisiteResearch support dispatch | done | 2026-04-16 | Task167 已收口 accepted：`ResearchDef.prerequisiteResearch?` 和研究可用性检查已存在；`startResearch` 复用统一门槛；未新增 Blacksmith 升级数据、不改 AI、不做 Animal War Training。static proof 10/10、build、tsc 通过。 |
| V9-CX56 — HN7 melee upgrade source packet | done | 2026-04-16 | HN7-SRC3 已收口 accepted：近战 Level 1 只采用 Iron Forged Swords，成本 100/50、时间 60、当前标量映射 attackDamage +1；二、三级因来源不一致禁止外推。source proof 6/6 通过。 |
| V9-CX57 — HN7 melee upgrade Level 1 data seed dispatch | done | 2026-04-16 | Task168 已由 GLM 半完成并经 Codex 接管接受：`iron_forged_swords` 数据种子和 Blacksmith hook 已落地；footman/militia/knight attackDamage +1；无二/三级、远程、护甲、Animal War Training、Game.ts 特判或 AI。 |
| V9-CX58 — HN7 Iron Forged Swords runtime smoke dispatch | done | 2026-04-16 | Task169 已由 Codex 接管并吸收 GLM 晚到补充：Blacksmith 命令卡显示铁剑，研究扣 100/50，完成后已有 footman/militia/knight +1，新训练 Footman/Knight 继承 +1，已有和新产出非近战单位不变。focused runtime 6/6 通过。 |
| V9-CX59 — HN7 Iron Forged Swords Level 1 closure dispatch | done | 2026-04-16 | Task170 已经 Codex 复验接受：Level 1 源校验、数据种子、runtime smoke 和禁区闭环；静态联合 63/63、focused runtime 6/6 通过。 |
| V9-CX60 — HN7 higher melee levels source reconciliation | done | 2026-04-16 | Task171 已收口 accepted：Blizzard Classic Battle.net 作为二/三级主源，Steel 175/175、75 秒、需 Keep；Mithril 250/300、90 秒、需 Castle；当前项目按每级 incremental attackDamage +1。source proof 12/12 通过。 |
| V9-CX61 — HN7 Steel / Mithril data seed review | done | 2026-04-16 | Task172 已由 GLM 写入核心数据并经 Codex 接管收口接受：Steel/Mithril 数据、Blacksmith hook、顺序前置和当前近战单位 +1 已落地；Game.ts 未改，static proof 31/31 通过。 |
| V9-CX62 — HN7 Steel / Mithril runtime smoke review | done | 2026-04-16 | Task173 已由 GLM 写测试、Codex 接管复验接受：按 build -> runtime 正确顺序后，钢剑/秘银剑按钮、前置禁用原因、扣费、完成效果、新单位继承和非近战不变均通过；focused runtime 7/7。 |
| V9-CX63 — HN7 melee weapon chain closure review | done | 2026-04-16 | Task174 已经 Codex 复核接受：closure proof 14/14、联合 SRC/DATA proof 45/45、build、tsc 通过；source 口径已修正为主源/参考/冲突样本，不再写成多源一致。 |
| V9-CX64 — HN7 ranged weapon source review | done | 2026-04-16 | Task175 已经 Codex 接管接受：RANGED source packet、source proof 25/25、build、tsc 通过；修正 GLM 初版“所有来源完全一致”和 proof 自相矛盾问题。 |
| V9-CX65 — HN7 ranged weapon data seed review | done | 2026-04-16 | Task176 已由 GLM 写入核心数据并经 Codex 接管接受：远程三段火药数据、Blacksmith hook、当前远程单位 +1 和禁区 proof 均通过；static 35/35、build、tsc 通过。 |
| V9-CX66 — HN7 ranged weapon runtime review | done | 2026-04-16 | Task177 已由 GLM 完成并经 Codex 接管收口接受：远程三段按钮、前置、扣费、已有/新产出远程累计 +3、非远程不变均通过；runtime 7/7、build、tsc 通过。 |
| V9-CX67 — HN7 ranged weapon closure review | done | 2026-04-16 | Task178 已由 GLM 完成并经 Codex 本地复核接受：远程链路 SRC5/DATA5/IMPL6 closure 成立；static 49/49、runtime 7/7、build、tsc 通过。 |
| V9-CX68 — HN7 armor upgrade source review | done | 2026-04-16 | Task179 已由 Codex 本地复核接受：source proof 12/12、build、tsc 通过；Plating 三段和 Leather 排除边界已固定。 |
| V9-CX69 — HN7 Plating armor data seed review | done | 2026-04-16 | Task180 已由 GLM 半完成、Codex 接管验收并接受：Plating 三段数据落地，source/data 联合 proof 21/21、build、tsc 通过。 |
| V9-CX70 — HN7 Plating runtime smoke review | done | 2026-04-16 | Task181 已由 GLM 半完成、Codex 接管验收并接受：发现并修复 Blacksmith 10 个研究项被 8 格命令卡截断的问题；Task198 后进一步改为 16 格，容纳 Leather Armor 后的 13 个研究项。Plating runtime 7/7、受影响 HUD/cleanup/construction 20/20、source+data 21/21、build、tsc 通过。 |
| V9-CX71 — HN7 Plating chain closure review | done | 2026-04-16 | Task182 已由 GLM 写出 closure proof 并经 Codex 加固接受：命令卡容量修复直接绑定到 Game.ts/CSS，Task198 后 proof 升级为 16 格；Plating closure 14/14、联合 SRC6/DATA6 35/35、build、tsc 通过。 |
| V9-CX72 — HN7 Animal War Training source review | done | 2026-04-16 | Task183 已由 GLM 写出来源包并经 Codex 接管接受：AWT 单级、125/125、40 秒、Barracks 研究、需 Castle + Lumber Mill + Blacksmith、knight maxHp +100；source proof 14/14、build、tsc 通过。 |
| V9-CX73 — HN7 research multi-building prerequisite review | done | 2026-04-16 | Task184 已由 GLM 启动并经 Codex 接管接受：`ResearchDef.requiresBuildings?: string[]`、availability 多建筑检查、runtimeTest 临时注入 proof 5/5、build、tsc 通过；未写 AWT 数据。 |
| V9-CX74 — HN7 Animal War Training data seed review | done | 2026-04-16 | Task185 已由 GLM 完成并经 Codex 复核接受：`RESEARCHES.animal_war_training`、Barracks research hook、requiresBuildings 三建筑前置和 knight maxHp +100 已落地；data+source 24/24、build、tsc 通过。 |
| V9-CX75 — HN7 Animal War Training runtime review | done | 2026-04-16 | Task186 已由 Codex 接管接受：AWT 兵营按钮、多建筑前置、扣费、队列完成、已有/新产出 Knight 生命值加成成立；runtime 4/4、static 24/24、build、tsc 通过。 |
| V9-CX76 — HN7 Animal War Training closure review | done | 2026-04-16 | Task187 已 Codex accepted：GLM 后续文档同步让 AWT-CLOSE-13 失效，Codex 修正 proof 口径后复验 closure/data/source 38/38、build、tsc 通过；AWT 最小链路关闭。 |
| V9-CX77 — HN7 AWT AI strategy contract dispatch | done | 2026-04-16 | Task188 已 Codex accepted：AI11 合同定义 AWT 研究触发、预算、重试和禁区；Codex 修正不锁死未来 AI12 的 proof 后，contract+closure 30/30、build、tsc 通过。 |
| V9-CX78 — HN7 AWT AI implementation dispatch | done | 2026-04-16 | Task189 已由 Codex 接管验收：修正 AI runtime fixture 复用默认 AI 主基地/兵营，SimpleAI 从 `RESEARCHES.animal_war_training.key` 入队；build、tsc、focused runtime 8/8、strategy+closure 30/30 通过。 |
| V9-CX79 — HN7 AWT AI closure dispatch | done | 2026-04-16 | Task190 已 Codex accepted：AI closure proof 20/20、strategy+AWT closure 联合 50/50、build、tsc 通过；HN7 AWT 全链路闭环。 |
| V9-CX80 — HN7 Blacksmith upgrade AI strategy dispatch | done | 2026-04-16 | Task191 已由 GLM 写出合同和 proof，并经 Codex 本地复核接受：Blacksmith 近战/远程/护甲三条三段升级链 AI 策略合同成立；static proof 24/24、build、tsc 通过；未改生产代码。 |
| V9-CX81 — HN7 Blacksmith upgrade AI implementation dispatch | done | 2026-04-16 | Task192 已由 Codex 接管并接受：GLM 初版卡在 BS-RT-6 并弱化断言后被中断；Codex 保留 Long Rifles 优先级、修正 runtime 场景污染，build、tsc、focused runtime 18/18、strategy proof 24/24 通过。 |
| V9-CX82 — HN7 Blacksmith upgrade AI closure dispatch | done | 2026-04-16 | Task193 已 Codex accepted：GLM 写出 closure 文档和 proof 后在队列 closeout 编辑处遇到 API/network 错误；Codex 本地复核 closure+strategy static 56/56、build、tsc 通过。 |
| V9-CX83 — HN7 Leather Armor source boundary dispatch | done | 2026-04-16 | Task194 已 Codex accepted：Leather Armor 源与迁移前护甲类型边界已固定；当时 rifleman/mortar_team 均为 Unarmored，不能直接写 Leather Armor 数据；source boundary + armor source proof 30/30、build、tsc 通过。后续 Rifleman 已单独迁移到 Medium。 |
| V9-CX83A — GLM multi-line task panel monitor fix | done | 2026-04-16 | 修复 `lane-feed` 对 Claude Code 多行任务面板的误判：当 `⎿ ✔` 已完成项和下一行 `◼` 正在项同时存在时，仍应按 running 处理。看板/泳道回归 77/77 通过。 |
| V9-CX83B — GLM stale prompt monitor fix | done | 2026-04-16 | 修复 `lane-feed` 把“已回到输入提示符的旧 Claude 任务面板”误判为 running 的问题，避免完成后断供不给下一条；lane-feed 回归 54/54 通过。 |
| V9-CX84 — HN7 Medium armor migration contract dispatch | done | 2026-04-16 | Task195 已 Codex accepted：GLM 初版后中断，Codex 接管收窄为 Rifleman 是唯一明确 Medium 迁移目标，Mortar Team 需单独 parity decision；Medium contract + Leather boundary proof 31/31、build、tsc 通过。 |
| V9-CX85 — HN7 Rifleman Medium armor migration implementation | done | 2026-04-16 | Codex 已完成：只把 Rifleman 迁移到 Medium，Mortar Team 保持 Unarmored；受控伤害 / 研究不回退 runtime 11/11、相关 static 43/43、build、tsc 通过；未写 Leather Armor 数据。 |
| V9-CX86 — HN7 Mortar Team armor parity GLM dispatch | done | 2026-04-16 | Task196 已由 GLM 写出并经 Codex 本地复核接受：Mortar Team 当前保持 Unarmored，Leather Armor 未来按 targetUnitType 覆盖；parity + MODEL9 static 31/31、build、tsc 通过。 |
| V9-CX87 — HN7 Leather Armor data seed dispatch | done | 2026-04-16 | Task197 已由 GLM 启动、Codex 接管验收：三段 Leather Armor 数据已落地，目标单位只允许 rifleman + mortar_team；DATA8/source/parity/MODEL9 static 67/67、build、tsc 通过。 |
| V9-CX88 — HN7 Leather Armor runtime smoke dispatch | done | 2026-04-16 | Task198 已由 Codex 接管并接受：GLM interrupted 且无 runtime 文件后，Codex 补 Leather Armor runtime proof；同时发现 Blacksmith 13 个研究按钮会超过旧 12 格命令卡，已升级为 16 格。Leather runtime 4/4、Plating+Ranged 相邻 runtime 14/14、相关 static 81/81、build、tsc 通过。 |
| V9-CX89 — HN7 Leather Armor closure dispatch | done | 2026-04-16 | Task199 已由 Codex 接管并接受：GLM 写出 closure 文档后停在 interrupted / same-title freeze，Codex 补静态 proof 并去掉过期源码行号。Leather closure proof 18/18、联合 static 99/99、build、tsc 通过。 |
| V9-CX90 — HN7 Blacksmith branch global closure dispatch | done | 2026-04-16 | Task200 已由 Codex 接管并接受：GLM 写出全局 closure 文档后停在 proof/closeout 前；Codex 补静态 proof、修正文档口径和过期 AWT AI 断言。单项 proof 22/22、联合 static 92/92、build、tsc 通过。 |
| V9-CX90A — GLM background cooking monitor fix | done | 2026-04-16 | 修复 Task201 现场误判：Claude Code 后台 `Explore(...)` 显示 `Cooking…` 时，即使底部输入框可见，也不能判成 interrupted。lane-feed 55/55、dual-lane-companion 19/19、脚本语法检查通过。 |
| V9-CX91 — Human core global gap inventory dispatch | done | 2026-04-16 | Task201 已 Codex accepted：Human 当前已具备的建筑、单位、能力、研究、AI 和系统底座已盘点；初版过度宣称“完整”和 AI Castle/Knight 覆盖已修正。gap static 24/24、联合 HN7 global 46/46、build、tsc 通过。 |
| V9-CX92 — HERO1 Altar + Paladin contract dispatch | done | 2026-04-16 | Task202 已 Codex accepted：Altar + Paladin + Holy Light 合同成立；Codex 把未源校验数值降级为候选参考值，并把下一步改为 HERO2-SRC1 source boundary。HERO1+gap static 45/45、HN7+gap 46/46、build、tsc 通过。 |
| V9-CX93 — HERO2-SRC1 source boundary dispatch | done | 2026-04-16 | Task203 已 Codex accepted：GLM 写出来源边界后，Codex 修正 Holy Light mana 口径为当前 Blizzard Classic 主源 65，75 只作非采用样本；Paladin manaRegen 不再硬借 caster 默认值。source+HERO1 static 46/46、build、tsc 通过。 |
| V9-CX93A — GLM researcher Booping monitor fix | done | 2026-04-16 | 修复 Task203 现场误判：Claude Code 后台 `researcher(...)` 显示 `Running…` 和 `Booping…` 时，即使底部输入框可见，也不能判成 queued prompt / needs_submit。lane-feed + dual-lane-companion 76/76、脚本语法检查通过。 |
| V9-CX94 — HERO3-DATA1 Altar data seed dispatch | done | 2026-04-16 | Task204 已 Codex accepted：Altar 数据种子写入 `BUILDINGS`；Codex 补 `BuildingDef.armor?` 并恢复 `armor: 5`，旧 HERO proof 已阶段化。HERO3+HERO2+HERO1 static 62/62、build、tsc 通过；仍无建造入口/runtime。 |
| V9-CX95 — HERO4-DATA2 Paladin data seed dispatch | done | 2026-04-16 | Task205 已 Codex accepted：`UNITS.paladin` 数据种子、可选 hero 字段和静态 proof 已落地；Paladin 不含 manaRegen，`Game.ts` / `SimpleAI.ts` 没有 runtime 引用，`holy_light` 仍未写入。HERO4+HERO3+HERO2+HERO1 static 82/82、build、tsc 通过。 |
| V9-CX95A — GLM live status verb monitor fix | done | 2026-04-16 | 修复 Task204/205 现场误判：Claude Code 显示 `Razzmatazzing...`、`Kneading...` 这类单词状态行时，即使输入框可见也应判定为 running。lane-feed + dual-lane-companion 80/80、脚本语法检查通过。 |
| V9-CX96 — HERO5-DATA3 Holy Light ability data seed dispatch | done | 2026-04-16 | Task206 已由 Codex 接管并 accepted：GLM 写入 `TargetRule.excludeSelf?` 和 `ABILITIES.holy_light` 后 API/network error；Codex 补 HERO5 proof 和旧 HERO 阶段化断言。HERO5+HERO4+HERO3+HERO2+HERO1 static 94/94、build、tsc 通过。 |
| V9-CX97 — HERO6 Altar runtime exposure contract dispatch | done | 2026-04-16 | Task207 已 Codex accepted：HERO6 合同和 22 条静态 proof 成立；generic `trains` 泄漏风险已记录，Altar 建造、Paladin 召唤、mana 初始化、Holy Light runtime 已拆成阶段。HERO6+HERO5 static 34/34、build、tsc 通过。 |
| V9-CX98 — GLM tokenless live-status monitor fix | done | 2026-04-16 | 修复 Task207 现场误判风险：Claude Code 显示 `Fluttering... (3m 25s)` 这种只有耗时、没有 token 明细的活跃状态时，仍按 running 处理，不重复投喂。lane-feed + dual-lane-companion 82/82、脚本语法检查通过。 |
| V9-CX99 — Codex stale needs-attention feed cleanup | done | 2026-04-16 | 修复旧 codex-watch stalled 状态残留：`needs attention` 详情里的 tracked job id 现在也会读取真实 job 终态。现场 codex feed 已从旧 stalled 变为 idle/tracked_job_settled；lane-feed + companion 83/83、脚本语法检查通过。 |
| V9-CX100 — HERO6A Altar construction runtime dispatch | done | 2026-04-16 | Task208 已 Codex accepted，并把 runtime proof 加固为真实农民命令卡建造路径：点“国王祭坛”、进入放置、扣 180/50、施工完成、完成后不泄漏 Paladin/Holy Light。build、tsc、runtime 4/4、static 35/35、cleanup 通过。 |
| V9-CX101 — GLM interrupted job live-recovery monitor fix | done | 2026-04-16 | 修复 Task208 现场错位：companion job 旧状态是 interrupted，但终端仍有 `Hatching...` / `Create runtime proof for HERO6A...` 等真实进展。现在只有匹配当前 job 关键词的活跃 pane 才能恢复为 running；lane-feed + companion 89/89、脚本语法检查通过。 |
| V9-CX102 — HERO6B Paladin summon runtime review | done | 2026-04-16 | Task209 已 Codex accepted：完成 Altar 可召唤圣骑士，扣费、队列、产出、mana 初始化成立；Codex 补强全局唯一性，两个 Altar 和直接 `trainUnit` 都不能绕过。build、tsc、runtime 6/6、static 35/35、cleanup 通过。 |
| V9-CX103 — GLM current-checklist monitor fix | done | 2026-04-16 | 修复 Task209 现场误判风险：Claude Code 当前 checklist 显示 `1 in progress` 和 `◼` 当前项时，feed / companion 应按 running 处理。lane-feed + companion 91/91、脚本语法检查通过。 |
| V9-CX104 — HERO7 Holy Light manual runtime review | done | 2026-04-16 | Task210 已 Codex accepted：Paladin 命令卡可手动释放圣光术，读取 `ABILITIES.holy_light`，治疗合法友军、扣 65 mana、5s 冷却、治疗不超过 max HP；非法目标、低魔法和冷却均被拦住。build、tsc、runtime 7/7、static 117/117、cleanup 通过。 |
| V9-CX105 — HERO8 minimal hero closure review | done | 2026-04-16 | Task211 已 Codex accepted：最小 Altar + Paladin + Holy Light 英雄链路完成收口盘点；node proof 26/26、build、tsc 通过。复活、XP、升级、其他三英雄、AI、物品和素材仍关闭。 |
| V9-CX106 — HERO9 death / revive contract review | done | 2026-04-16 | Task212 已 Codex accepted：Codex 修正唯一性语义，要求新召唤看同类型英雄记录是否存在，复活入口单独看 `isDead === true`。HERO9 contract proof 27/27、build、tsc 通过；未改生产代码。 |
| V9-CX107 — HERO9 revive source boundary review | done | 2026-04-16 | Task213 已 Codex accepted：Codex 补强可复查来源链接和复活费用取整口径，证明复活费用/时间/HP/mana、死亡人口、尸体/选择映射已记录。source proof 24/24、build、tsc 通过；未改生产 runtime。 |
| V9-CX107A — GLM fresh-dispatch prompt grace monitor fix | done | 2026-04-16 | 修复刚派发 job 时底部提示符短暂可见导致 false interrupted：45 秒内只要 pane 含当前 job id，不把 fresh dispatch 判成 idle prompt。dual-lane companion 29/29、脚本语法检查通过。 |
| V9-CX108 — HERO9 death-state runtime takeover | done | 2026-04-16 | Task214 已 Codex accepted：GLM 自动压缩后 Codex 接管修正 `trainUnit` 死英雄唯一性、`Unit.isDead` 类型、死亡 hp clamp、dead auto-aggro、旧 HERO6B 口径和 Task213 过期断言。source proof 24/24、build、tsc、runtime 19/19、cleanup 通过。 |
| V9-CX109 — HERO9 revive data seed review | done | 2026-04-16 | Task215 已由 Codex 接管复核接受：`HERO_REVIVE_RULES` 数据种子、Paladin 费用/时间/HP/mana 示例和 no-Game.ts-runtime proof 成立；Codex 修正 HP 示例为当前真实 650。联合 static 49/49、build、tsc、cleanup 通过。 |
| V9-CX110 — HERO9 revive runtime contract review | done | 2026-04-16 | Task216 已由 GLM 完成并经 Codex 本地复核接受：祭坛复活 runtime 合同、费用/时间取整、队列、恢复状态和禁区 proof 成立；联合 static 85/85、build、tsc 通过；`Game.ts` 未接 runtime。 |
| V9-CX111 — HERO9 revive runtime implementation review | done | 2026-04-16 | Task217 已由 Codex 接管并 accepted：GLM 初版停在编辑错误且反复直跑 Playwright；Codex 补完复活 runtime、focused proof 和验证。static 85/85、build、tsc、runtime 21/21、cleanup、无残留通过。 |
| V9-CX112 — HERO9 death/revive closure dispatch | done | 2026-04-16 | Task218 已派发给 GLM，范围限定为 HERO9 death + revive 静态收口盘点；禁止 Playwright、禁止生产代码、禁止宣称完整英雄系统/完整 Human。 |
| V9-CX113 — lane runtime command guardrails | done | 2026-04-16 | 补上任务派发和监控防护：后续 runtime 验证必须走 `./scripts/run-runtime-tests.sh`，不得直跑 `npx playwright test`；监控发现绕过统一入口的 direct Playwright 会标成 `unsafe_runtime`。lane-feed + companion 93/93、JS check、shell check 通过。 |
| V9-CX114 — HERO9 death/revive closure review | done | 2026-04-16 | Task218 已 Codex accepted：HERO9 death + revive closure inventory 成立；静态 112/112、build、tsc、cleanup 通过；没有 Playwright/Vite/Chrome 残留，没有改生产代码，没有宣称完整英雄系统/完整 Human。 |
| V9-CX115 — HERO10 XP/leveling contract review | done | 2026-04-16 | Task219 已 Codex accepted：HERO10 XP / leveling 分支合同和静态 proof 成立；78/78 proof、build、tsc、cleanup 通过；没有改生产代码，没有发明 XP 表或宣称完整英雄系统 / 完整 Human。 |
| V9-CX116 — HERO10 source-boundary review | done | 2026-04-16 | Task220 已 Codex accepted：XP / 等级 / 技能点来源边界采用 Blizzard Classic Hero Basics 为主源，固定等级阈值、英雄击杀 XP、creep XP 限制、普通单位 XP 公式和技能点就绪规则。source+contract proof 127/127、build、tsc、cleanup、无残留通过；未改生产代码。 |
| V9-CX117 — HERO10 data-seed review | done | 2026-04-16 | Task221 已 Codex accepted：`HERO_XP_RULES` 数据种子落地，Codex 修正文档“runtime”误述并加固 proof 到 `HERO_XP_RULES` 块内检查。54/54 data proof、130/130 joined proof、build、tsc、cleanup、无残留通过；`Game.ts` 未引入新常量。 |
| V9-CX118 — HERO10 minimal XP runtime review | done | 2026-04-16 | Task222 已由 Codex 接管并 accepted：最小 XP runtime、升级、技能点增加和 HERO9 复活兼容均通过；Codex 修复 GLM 弱化 revive 花费 proof 和受控 fixture 缺主基地问题。build、tsc、HERO10 6/6、HERO9 7/7、source/data 130/130、cleanup、无残留通过。 |
| V9-CX119 — HERO10 visible XP feedback review | done | 2026-04-16 | Task223 已由 Codex 接管并 accepted：Paladin 选中 HUD 显示等级、XP/下级阈值或最高等级、未花技能点；升级和复活后显示保持正确。build、tsc、UX runtime 5/5、HERO10 runtime 6/6、cleanup、无残留通过。 |
| V9-CX120 — HERO10 closure inventory review | done | 2026-04-16 | Task224 已由 Codex 接管并 accepted：HERO10 contract/source/data/runtime/visible feedback 证据链完成静态收口；closure proof 31/31、build、tsc、cleanup、无残留通过；只关闭 Paladin 最小 XP/升级可见链，不宣称完整英雄系统或完整 Human。 |
| V9-CX121 — HERO11 skill-learning contract review | done | 2026-04-16 | Task225 已 Codex accepted：技能点目前可见不可消费，HERO11 合同定义显式消费、Holy Light 为首个升级目标、复活保留能力等级、HERO7/9/10 回归边界和 SRC1→DATA1→IMPL1→UX1→CLOSE1 顺序。34/34 proof、build、tsc、cleanup 通过。 |
| V9-CX122 — HERO11 source-boundary takeover | done | 2026-04-16 | Task226 已由 Codex 接管并 accepted：GLM 写出来源文档后 compact 中断；Codex 修正来源优先级、Holy Light 等级 200/400/600、亡灵伤害 100/200/300、射程 80→8.0、学习等级 1/3/5 和不提前消费技能点。source proof 9/9、build、tsc、cleanup 通过。 |
| V9-CX123 — HERO11 level-data seed review | done | 2026-04-16 | Task227 已 Codex accepted：`HERO_ABILITY_LEVELS.holy_light` 数据表落地，Holy Light 1/2/3 为 200/400/600、亡灵伤害 100/200/300、mana 65、cd 5、range 8.0、学习等级 1/3/5；`ABILITIES.holy_light` 和 `Game.ts` runtime 不变。DATA1+SRC1 proof 39/39、build、tsc、cleanup 通过。 |
| V9-CX124 — HERO11 skill-spend runtime takeover | done | 2026-04-16 | Task228 已由 Codex 接管验收：保留 GLM 的主体实现，修正为等级数据驱动施法、 stale learn click 防护、command-card 缓存刷新和真实 Altar 复活持久化 proof。build、tsc、HERO11 6/6、HERO7 7/7、HERO9 7/7、DATA1+SRC1 39/39、cleanup 和 30 秒观察通过。 |
| V9-CX124A — GLM live Implementing monitor fix | done | 2026-04-16 | 修复 Task228 现场误判：Claude Code 后台 Explore/任务面板正在运行且底部输入框可见时，`Implementing ... (计时)` + 当前任务标题 token 应按 running 处理。lane-feed + companion 97/97、脚本语法检查通过；Task228 已恢复为 running。 |
| V9-CX124B — stale Codex app-server runtime queue drain | done | 2026-04-16 | Task228 复验后发现旧 Codex app-server 子进程连续启动无关 runtime（worker-glb、worker-peasant、unit-visibility）并抢锁耗电；已等待有限队列自然跑完、cleanup、30 秒观察，最终无 Playwright/Vite/chrome-headless-shell 残留。 |
| V9-CX125 — HERO11 learned-level feedback review | done | 2026-04-16 | Task229 已 Codex accepted：Holy Light 学习状态和当前等级可见，下一等级门槛/治疗量可见，剩余技能点为 0 时也显示。build、tsc、UX1 runtime 6/6、Task228 runtime 6/6、DATA1+SRC1 39/39、cleanup 和 30 秒观察通过。 |
| V9-CX126 — HERO11 closure inventory review | done | 2026-04-16 | Task230 已 Codex accepted：HERO11 Holy Light 技能学习链静态收口，只关闭 Paladin Holy Light 最小学习链，不宣称完整英雄系统/完整人族/V9 发布。closure proof 36/36、build、tsc、cleanup 和 30 秒观察通过。 |
| V9-CX127 — HERO12 Divine Shield contract review | done | 2026-04-16 | Task231 已 Codex accepted：Divine Shield 分支合同和 37 条静态 proof 成立；未改生产代码、未写数值数据、未跑浏览器。contract proof 37/37、build、tsc、cleanup 和 30 秒观察通过。 |
| V9-CX128 — HERO12 source-boundary review | done | 2026-04-16 | Task232 已 Codex accepted：Divine Shield 来源边界采用 Blizzard Classic Battle.net Paladin 页面为主源，固定 15/30/45 持续、35/50/65 秒冷却、25 mana、自身/无敌、学习等级 1/3/5、不可主动取消。Codex 修正 proof 否定句误判后，source+contract proof 61/61、build、tsc、cleanup 和 30 秒观察通过。 |
| V9-CX129 — HERO12 data-seed review | done | 2026-04-16 | Task233 已由 Codex 接管复核并 accepted：Divine Shield 等级数据已落到 `HERO_ABILITY_LEVELS.divine_shield`，`ABILITIES` 和 `Game.ts` runtime 仍关闭；static proof 78/78、build、tsc、cleanup 和 30 秒观察通过。 |
| V9-CX130 — HERO12 learn-surface review | done | 2026-04-16 | Task234 已由 Codex 接管复核并 accepted：Divine Shield 学习入口、Lv1/2/3 技能点消费、等级门槛、HUD 可见、死亡复活保留成立；runtime 19/19、static 78/78、build、tsc、cleanup 和进程清理通过。 |
| V9-CX130A — stale cancelled-job progress guard | done | 2026-04-16 | 修复 Task233/234 现场监控误判：旧 job 已取消后，如果终端最后一个 `[DUAL_LANE_JOB]` 已是新任务，feed 不再把旧标题残影当作旧任务仍在运行；lane-feed 回归 65/65 通过。 |
| V9-CX131 — HERO12 self-cast runtime review | done | 2026-04-16 | Task235 已由 Codex 接管复核并 accepted：Divine Shield 自我施放、25 mana、数据驱动持续/冷却、临时免伤、过期恢复、复活重置和命令卡刷新成立；runtime 29/29、static 78/78、build、tsc、cleanup 通过。 |
| V9-CX131A — force cleanup stale runtime lock fix | done | 2026-04-16 | 修复 Task235 现场残留问题：强制 cleanup 现在会停止本仓库 runtime runner，并在 holder pid 已死亡时自动移除 runtime lockdir；`bash -n scripts/cleanup-local-runtime.sh`、强制 cleanup 和临时 stale lock 验证通过。 |
| V9-CX132 — HERO12 visible feedback review | done | 2026-04-16 | Task236 已由 Codex 接管复核并 accepted：选择面板显示 `神圣护盾生效 Ns`，命令卡显示生效/冷却/魔力不足原因并能随时间刷新；runtime 22/22、static 78/78、build、tsc、cleanup 通过。 |
| V9-CX133 — HERO12 closure review | done | 2026-04-16 | Task237 已由 Codex 接管复核并 accepted：Divine Shield 分支证据链、玩家当前能力和明确延后范围完成静态收口；closure+HERO12 static 113/113、build、tsc、cleanup 通过。 |
| V9-CX134 — HERO13 Devotion Aura contract review | done | 2026-04-16 | Task238 已由 GLM 完成并经 Codex 收窄后 accepted：Devotion Aura 合同、实现顺序和禁区成立；受影响目标/叠加规则必须等 SRC1。static 72/72、build、tsc 通过。 |
| V9-CX134A — GLM ready-card table repair | done | 2026-04-16 | 修复 feed 断供根因：最新 ready 任务卡如果漏了顶部表格行，feed 会自动补表再派发，不再误报 `milestone_ready_no_transition`；lane-feed 66/66 通过。 |
| V9-CX135 — HERO13 Devotion Aura source-boundary review | done | 2026-04-16 | Task239 已由 Codex 接管复核并 accepted：官方来源值、90→9.0 项目映射、目标/建筑/多来源边界和 no-runtime proof 成立；static 102/102、build、tsc 通过。 |
| V9-CX136 — HERO13 Devotion Aura data seed review | done | 2026-04-16 | Task240 已 Codex accepted：`HERO_ABILITY_LEVELS.devotion_aura` 数据种子落地，`auraRadius: 9.0` 映射已固定；static 119/119、build、tsc、cleanup 通过。`Game.ts` 和 `ABILITIES` 仍未接运行时。 |
| V9-CX137 — HERO13 Devotion Aura passive runtime takeover | done | 2026-04-16 | Task241 已由 Codex 接管 accepted：GLM 越界添加学习按钮/HUD 后被取消；Codex 保留并修正最小被动护甲光环 runtime。runtime 5/5、相邻 HERO11/12/9 runtime 23/23、static 119/119、build、tsc、cleanup 通过。 |
| V9-CX138 — HERO13 Devotion Aura learn surface review | done | 2026-04-16 | Task242 已由 Codex 接管复核 accepted：Paladin 可学习 Devotion Aura Lv1/2/3，技能点消费、等级门槛、复活保留和被动 runtime 触发成立；仍无施法按钮和 HUD 状态。learn+runtime 9/9、相邻 HERO11/12/9 runtime 23/23、static 119/119、build、tsc、强制 cleanup 通过。 |
| V9-CX139 — HERO13 Devotion Aura visible feedback review | done | 2026-04-16 | Task243 已由 Codex 接管复核 accepted：Paladin 已学 Devotion Aura 时显示等级，受光环影响的友方单位显示护甲加成；离开范围/来源死亡后消失；敌人/建筑不显示；仍无施法按钮。UX+learn+runtime 14/14、相邻 HERO11/12/9 runtime 23/23、static 119/119、build、tsc、cleanup 通过。 |
| V9-CX140 — HERO13 Devotion Aura closure review | done | 2026-04-16 | Task244 已由 Codex 接管复核 accepted：Devotion Aura 合同、来源、数据、被动 runtime、学习入口和可见反馈证据链已静态收口；closure+HERO13/HERO12 static 168/168、build、tsc、cleanup 通过。 |
| V9-CX141 — HERO14 Resurrection contract dispatch | done | 2026-04-16 | Task245 已由 Codex 接管复核 accepted：Resurrection 分支合同、HERO14-SRC1→DATA1→IMPL1→UX1→CLOSE1 顺序、禁区和 no-production-code proof 成立；HERO14/HERO13/HERO12 static 114/114、build、tsc、cleanup 通过。 |
| V9-CX142 — HERO14 Resurrection source boundary dispatch | done | 2026-04-16 | Task246 已由 Codex 接管复核 accepted：Resurrection 主源、数值、歧义字段、项目映射和 no-production-code proof 成立；source+contract+HERO13/HERO12 static 144/144、build、tsc、cleanup 通过。 |
| V9-CX143 — HERO14 Resurrection data seed dispatch | done | 2026-04-16 | Task247 已由 Codex 接管复核 accepted：`HERO_ABILITY_LEVELS.resurrection` 数据种子、`areaRadius/maxTargets` 可选字段、DATA 文档和阶段化 proof 已完成；DATA+SRC+CONTRACT+HERO13/HERO12 static 162/162、build、tsc、cleanup 通过。 |
| V9-CX144 — HERO14 Resurrection learn surface dispatch | done | 2026-04-16 | Task248 已由 Codex 接管复核 accepted：Paladin 可在 6 级且有技能点时学习 Resurrection Lv1，消耗 1 点并在 HERO9 祭坛复活后保留；仍无施放按钮、复活效果、尸体系统、HUD、AI 或素材。static 162/162、build、tsc、runtime 10/10、cleanup 通过。 |
| V9-CX145 — HERO14 Resurrection dead-unit record substrate dispatch | done | 2026-04-17 | Task249 已由 Codex 接管复核 accepted：友方普通单位死亡记录底座成立；team1、建筑、英雄不进记录；地图重开清空；HERO9 复活独立。build、tsc、runtime 12/12、static 162/162、cleanup 通过。 |
| V9-CX146 — HERO14 Resurrection minimal cast runtime dispatch | done | 2026-04-17 | Task250 已由 Codex 接管 accepted：GLM 初版停在提示符且验证截断；Codex 修正目标过滤、死亡位置、最早死亡优先、失败不扣费和阶段化 proof。build、tsc、runtime 17/17、static 162/162、cleanup 通过。 |
| V9-CX147 — HERO14 Resurrection visible feedback dispatch | done | 2026-04-17 | Task251 已由 GLM 初版 + Codex 接管复核 accepted：单位属性面板显示 `复活术 Lv1`、`刚复活 N 个单位`、`复活冷却 Ns`，命令按钮冷却原因会随时间刷新；不做粒子、声音、图标素材、AI 或完整 Paladin。build、tsc、runtime 22/22、static 162/162、cleanup 通过。 |
| V9-CX147A — lane-feed stale accepted companion guard | done | 2026-04-17 | 已修复 Task250 现场暴露的调度问题：队列表已 accepted / closed 的旧 running companion 不再挡住下一任务；无当前 job marker 且底部已回提示符的旧 Claude 状态面板不再被算成真实进展。lane-feed 70/70、lane-feed+companion 103/103 通过。 |
| V9-CX148 — HERO14 Resurrection closure inventory dispatch | done | 2026-04-17 | Task252 已 Codex accepted：Resurrection 分支静态收口完成，closure doc + 34 项 proof 汇总 Task245-252 证据链、当前玩家能力和明确延后范围；Codex 修正 GLM 初版测试数量口径。static 112/112、build、tsc、cleanup 通过，未改生产代码。 |
| V9-CX148A — verification output anti-tail prompt guard | done | 2026-04-17 | GLM 多次把 build/tsc/static 输出接 `tail` 截断后再 closeout；派发 prompt 已加规则：验证命令不能通过 `tail`、`grep`、`head` 或其他方式截断输出，长输出只能在完整命令结束后摘要。`node --test tests/lane-feed.spec.mjs` 70/70 通过。 |
| V9-CX149 — V9 hero-chain continuity and Task253 dispatch | done | 2026-04-17 | 修复 V9 被 oracle 误判 engineering-closed 的断点：`V9-HEROCHAIN1` 已作为当前 Human/Paladin 英雄链 open blocker 写入 remaining gates；milestone oracle 已显示 engineeringCloseoutReady=false；Task253 已派发为 GLM job `glm-mo2aru5h-u53az9`。 |
| V9-CX150 — Paladin minimal kit closeout review | done | 2026-04-17 | Task253 已由 GLM 初版 + Codex 本地复核 accepted：Paladin 最小能力套件全局静态收口完成；Codex 去掉未来源支撑的“53 个子任务”精确说法。HERO8-HERO15 static 278/278、build、tsc、cleanup 通过。 |
| V9-CX150A — companion accepted-status settlement guard | done | 2026-04-17 | 修复 companion 假 running：队列表用 `accepted` 表示 Codex 已验收时，现在 companion 也会把对应 running job 收为 completed，不再只认 completed/done。dual-lane-companion + lane-feed 104/104 通过。 |
| V9-CX151 — Paladin AI strategy contract dispatch | done | 2026-04-17 | Task254 已由 GLM 初版 + Codex 接管复核 accepted：Paladin AI 使用合同、AI1-AI5 顺序、Devotion Aura 被动边界和当前 SimpleAI 无 Paladin 行为均有 proof。HERO16+HERO15 static 79/79、build、tsc、cleanup 通过。 |
| V9-CX152 — AI Altar + Paladin summon dispatch | done | 2026-04-17 | Task255 已由 GLM 初版 + Codex 接管复核 accepted：AI 可在经济和唯一性条件满足时建造 Altar 并召唤一个 Paladin；不学技能不施法。build、tsc、runtime 5/5、cleanup 通过。 |
| V9-CX153 — AI Paladin skill-learning dispatch | done | 2026-04-17 | Task256 已由 GLM 初版 + Codex 本地复核 accepted：AI Paladin 按 Holy Light -> Divine Shield -> Devotion Aura -> Resurrection 顺序学习技能；build、tsc、runtime 11/11、cleanup 通过。 |
| V9-CX154 — AI Holy Light defensive cast dispatch | done | 2026-04-17 | Task257 已由 GLM partial + Codex 接管 accepted：AI Paladin 复用现有 Holy Light 路径治疗受伤友军；build、tsc、runtime 14/14、cleanup 通过。 |
| V9-CX155 — AI Divine Shield self-preservation dispatch | done | 2026-04-17 | Task258 已由 GLM partial + Codex 接管 accepted：AI Paladin 低生命时复用现有 Divine Shield 路径自保；build、tsc、runtime 17/17、cleanup 通过。 |
| V9-CX156 — AI Resurrection cast dispatch | done | 2026-04-17 | Task259 已由 GLM partial + Codex 接管复核 accepted：AI Paladin 复用现有 Resurrection 路径复活合法友军记录；死亡记录扩展为 team0/team1 可控阵营，仍排除中立/英雄/建筑。build、tsc、runtime 28/28、cleanup、diff check 通过。 |
| V9-CX157 — HERO16 AI strategy closure dispatch | done | 2026-04-17 | Task260 已由 GLM partial + Codex 接管 accepted：HERO16 AI1-AI5 证据链、当前能力、旧“无 AI”历史口径和明确延后范围已对齐。static proof 96/96、build、tsc、cleanup、diff check 通过；未新增运行时行为。 |
| V9-CX158 — HERO17 Archmage branch contract dispatch | done | 2026-04-17 | Task261 已由 GLM partial + Codex 接管 accepted：Archmage 分支边界合同和 proof 已完成，当前无 Archmage 数据/运行时/AI，后续必须 source-first。static proof 93/93、build、tsc、cleanup、diff check 通过。 |
| V9-CX159 — HERO17 Archmage source boundary dispatch | done | 2026-04-17 | Task262 已由 GLM 初版 + Codex 修正复核 accepted：Archmage 来源边界完成，Codex 修正 Hero 攻击映射、Mass Teleport 主源冷却、Water Elemental 活跃上限外推和 Altar 暴露边界。static proof 88/88、build、tsc、cleanup 通过。 |
| V9-CX160 — HERO17 Archmage unit data seed dispatch | active | 2026-04-17 | Task263 已派发给 GLM job `glm-mo2hgv0g-88aq4o`：只添加 `UNITS.archmage` 数据种子和静态 proof；不修改 Altar 训练列表、不写能力数据、不改运行时或 AI。 |
| V8-CX1 — External release gate sync | done | 2026-04-15 | V8 已激活；已把 V8 gate、双泳道队列、看板和 GLM Task112 同步到真实执行状态。 |
| V8-CX2 — External copy truth packet | done | 2026-04-15 | README、入口范围说明和 `docs/V8_EXTERNAL_COPY_TRUTH_PACKET.zh-CN.md` 已对齐；V8-COPY1 工程通过，但用户可异步否决措辞。 |
| V8-CX4 — External asset boundary packet | done | 2026-04-15 | 新增 `docs/V8_EXTERNAL_ASSET_BOUNDARY_PACKET.zh-CN.md`：盘点 public/src 实际素材，确认当前外部可见面只使用 S0 fallback / project proxy，官方/拆包/fan remake/来源不明素材继续 hard reject。 |
| V8-CX5 — Feedback capture and triage packet | done | 2026-04-15 | 新增 `docs/V8_FEEDBACK_CAPTURE_AND_TRIAGE_PACKET.zh-CN.md`：定义 tester 反馈模板、P0-P5 分级、gate 回流和任务转译规则；等入口 smoke accepted 后可同步关闭 V8-FEEDBACK1。 |
| V7-CX1 — Beta 范围冻结包 | done | 2026-04-15 | 已冻结 V7 范围：Lumber Mill + Guard Tower、Arcane Sanctum + Priest、Workshop + Mortar Team、AI 同规则使用至少一个已证明内容；完整人族其余线后移。 |
| V7-CX2 — Human 内容证明矩阵 | done | 2026-04-15 | 已把 Lumber Mill、Guard Tower、Arcane Sanctum、Priest、Workshop、Mortar Team、AI 使用映射到数据、前置、命令卡、runtime proof 和玩家可见状态；V7-HUM1 仍等真实 proof。 |
| V7-CX3 — 高级数值与战斗模型接线计划 | done | 2026-04-15 | 已固定 V7 只先接两类模型：Priest 的 caster mana，以及 Mortar Team 的 projectile / AOE / target filter；V7-NUM2 仍等真实实现和 proof。 |
| V7-CX4 — Beta 候选审查包 | done | 2026-04-15 | `docs/V7_BETA_CANDIDATE_REVIEW_PACKET.zh-CN.md` 已 candidate-ready；Task 107-111 均 accepted，V7 工程 blocker 清零，V7-UA1 作为异步用户判断保留。 |
| GLM closeout 全局验收刹车 | done | 2026-04-15 | `lane-feed` 已改成：GLM 最新 worker closeout 只要还不是 Codex `accepted`，就进入 `codex_review_wait`，不会继续派下一张 implementation task；回归 38/38 通过。 |
| lane-feed 历史状态误挡修复 | done | 2026-04-15 | 修复 accepted-only 门禁误扫历史 completed/done 和旧 cancelled 记录的问题：只检查最新 completed GLM job；ready 的显式重试不再被旧 cancelled 冻住。回归 40/40 通过。 |
| V7-Review Task 108 — Arcane Sanctum / Priest | done | 2026-04-15 | GLM job `glm-mnzk34f0-kmvssx` 完成后由 Codex 本地复核；补强 Heal 拒绝敌方目标和 Arcane Sanctum 正常训练 Priest proof。build、tsc、focused 9/9、相关 V7/command 回归 30/30、cleanup 无残留。 |
| V7-Review/Takeover Task 111 — Beta 稳定性回归包 | done | 2026-04-15 | GLM job `glm-mnzkxeb9-4x4f6w` 卡在自动压缩，且初版测试误用 `page.evaluate` 读取 Node import、提前改 gate；Codex 取消后接管，新增 `tests/v7-beta-stability-regression.spec.ts` 并接入 V7 suite。build、tsc、focused 5/5、完整 V7 内容包 31/31、cleanup 无残留。 |
| V7-BETA1 — Beta candidate 审查包工程收口 | done | 2026-04-15 | `docs/V7_BETA_CANDIDATE_REVIEW_PACKET.zh-CN.md` 已改为 candidate-ready：列出可玩内容、验证命令、已知缺口、不可承诺范围和异步用户判断入口；V7 工程 blocker 清零。 |
| V7-Review/Takeover Task 110 — AI 同规则使用 V7 内容 | done | 2026-04-15 | GLM 初版 proof-5 两次失败且使用 tail 截断输出，Codex 取消 job 后接管；修复 AI 开局预算保护和 V7 扩展节奏，证明 AI 按同规则使用 Tower / Workshop / Mortar 内容。Focused 8/8、关键回归 10/10、相关回归 18/18 通过。 |
| V7-Review/Takeover Task 109 — Workshop / Mortar | done | 2026-04-15 | GLM 卡在可选 UI 细节后由 Codex 停止并接管；补 `tests/v7-workshop-mortar-combat-model-proof.spec.ts`，证明 Workshop 数据/训练入口、Mortar Siege 数据和 AOE/filter 行为。Focused runtime 3/3、相关回归 23/23 通过。 |
| V7-Review Task 107 — Lumber Mill / Guard Tower | done | 2026-04-15 | Codex 本地复核 accepted：build、tsc、focused 6/6、command-surface 13/13、cleanup；同步修正旧 command-surface tower 断言。 |
| V6-FA1 Footman / Rifleman 接管复核 | done | 2026-04-15 | GLM 初版 runtime 失败并卡在 queued prompt 后，Codex 停止 GLM、取消 job、接管修正测试；build、typecheck、FA1 focused 5/5、相关 runtime pack 22/22 通过，V6-FA1 工程通过。 |
| V6-W3L1 第一眼审查包工程收口 | done | 2026-04-15 | 已把 NUM1、ID1、FA1 三类证据合并进 `docs/V6_WAR3_IDENTITY_FIRST_LOOK_REVIEW_PACKET.zh-CN.md`，V6-W3L1 工程面通过；V6-UA1 人眼判断仍异步。 |
| V6-ID1 集结号令接管复核 | done | 2026-04-15 | GLM 在人族集结号令实现中卡进 auto-compact；Codex 取消 job、清理 Playwright/Vite/Chrome 残留并接管验证。build、typecheck、ID1 focused 6/6、相关 runtime 30/30 通过，V6-ID1 工程通过。 |
| V6-W3L1 第一眼审查包种子 | done | 2026-04-15 | 已固定 V6-W3L1 的收口方式：等 NUM1、ID1、FA1 都有工程证据后，Codex 合成一份第一眼审查包，而不是继续无限补兵种、素材或 UI 任务。 |
| V6-ID1 集结号令复核清单 | done | 2026-04-15 | 已把当前 GLM 的集结号令 closeout 标准写进 V6-ID1 验收稿：文件边界、触发/效果/限制/反馈/cleanup、测试质量和本地验证命令都固定下来，避免只凭 GLM 报告接受。 |
| V6-FA1 阵营/兵种身份任务种子包 | done | 2026-04-15 | 已把 V6-FA1 的下一张相邻任务限定为 Footman / Rifleman 角色差异 proof：等 ID1 accepted 后再派 GLM，避免当前和集结号令实现冲突，也避免扩张成完整人族。 |
| NUM-E 玩家可见数值提示复核 | done | 2026-04-15 | Codex 加固 GLM 的 NUM-E 测试，确认可见成本、人口、攻击/护甲类型、研究效果和禁用原因来自真实数据；build、typecheck、相关 runtime 15/15 通过，V6-NUM1 工程通过。 |
| accepted 前置调度保护 | done | 2026-04-15 | 已把“worker 完成”和“Codex 本地验收”拆开：后续任务写 accepted 前置时，completed/done 不会再自动放行下一张，避免 GLM 基于未复核实现继续扩展。 |
| NUM-D 研究效果模型复核 | done | 2026-04-15 | Codex 修正 GLM 初版 proof-2，并本地验证 build、typecheck、NUM-D / NUM-C / V5 Long Rifles runtime 共 12/12 通过；V6-NUM1 现在只剩 NUM-E。 |
| V6 实时任务供给与防断供包 | done | 2026-04-15 | 已记录当前 V6 live queue 链和防重复规则；最新状态是 NUM1、ID1、FA1、W3L1 均为 engineering-pass，下一步只做 oracle / transition 复核，不再补 V6 内容扩张任务。 |
| 数值底座证明计划 | done | 2026-04-15 | NUM-F proof 计划已产出：明确 NUM-C/NUM-D/NUM-E 的通过标准、fresh state 规则、cleanup 要求和 V6-NUM1 收口条件，防止用按钮存在、单场胜负或截图观感冒充数值系统。 |
| 人族基础数值账本 | done | 2026-04-14 | NUM-B 账本已产出：`docs/V6_HUMAN_NUMERIC_LEDGER.zh-CN.md` 分开记录当前对象、V6 目标增量和后续占位；后续可派 NUM-C 攻击/护甲或 NUM-D 研究效果模型。 |
| C93 — V6-NUM1 数值系统任务种子包 | done | 2026-04-14 | 已产出 V6-NUM1 数值系统任务种子包：首批任务覆盖 schema 盘点、基础账本、攻击/护甲模型、研究效果、可见数值提示和 proof 计划；不关闭 V5-HUMAN1。 |
| C01 — Dual queue operating model | done | 2026-04-11 | Fixes the root process bug: Codex had no explicit queue and drifted into GLM-waiting. |
| C02 — Review GLM Resource/Supply Pack | done | 2026-04-11 | Accepted GLM follow-up commit `a64833d`; locked runtime pack reran 9/9 green. |
| C03 — Worker Visibility Truth | done | 2026-04-11 | Added visibility regression pack and fixed W3X map-load camera reset that left player workers offscreen. |
| C04 — Live Build Reality Check Protocol | done | 2026-04-11 | Added live-build evidence labels and conversion flow to operating model. |
| C05 — Human Decision Gates | done | 2026-04-11 | Defines when the user should intervene and what Codex/GLM must finish before each gate. |
| C06 — PLAN.md stale queue cleanup | done | 2026-04-11 | PLAN now points to live queue/gate docs instead of carrying a stale inline GLM queue. |
| C07 — CI Node 24 Migration | done | 2026-04-11 | Workflow now opts JavaScript actions and app verification into Node 24. |
| C08 — Game.ts Risk Map | done | 2026-04-11 | Added responsibility zones, coverage gaps, no-go zones, and safe extraction order. |
| C09 — Continuous Execution Loop Hardening | done | 2026-04-11 | Root-cause fix for Codex stopping: operating model now requires next-task selection, GLM stall handling, and non-conflicting Codex work while GLM runs. |
| C10 — M1 Gate Packet Prep | done | 2026-04-11 | Prepared concrete M1 playtest packet, controls, objective entry criteria, automated proof list, and failure routing. |
| C11 — Review GLM Placement Controller Slice | done | 2026-04-11 | Accepted GLM commit `14bd7ba`; Codex reran build, app typecheck, and 17 affected runtime tests locally. |
| C12 — M1 Candidate Audit | done | 2026-04-11 | Latest code commit `14bd7ba` is locally verified and GitHub Actions green; M1 is ready for user gate. |
| C13 — M1 Result And M2 System Replan | done | 2026-04-11 | User selected `pass with visual debt`; next phase reframed from visual pass to War3 core systems alignment. |
| C14 — Construction Lifecycle Pack Takeover | done | 2026-04-11 | GLM stalled without file changes; Codex implemented and verified resume/cancel/refund/builder cleanup directly. |
| C15 — M2 Systems Architecture Slice | done | 2026-04-11 | M2 source-of-truth docs synced with completed packs and combat-control contract accepted into the M2 baseline. |
| C16 — Review GLM Combat Control Contract | done | 2026-04-11 | GLM drafted the test file but it initially failed 8/8; Codex took over, exposed the real command dispatcher for runtime tests, fixed HoldPosition state restoration, and verified 20/20 affected tests. |
| C17 — Dispatch M2 Gate Packet | done | 2026-04-11 | GLM added `npm run test:m2` and `docs/M2_GATE_PACKET.zh-CN.md`; Codex reran `npm run test:m2` locally, 32/32 passed. |
| C18 — War3 Rule System Roadmap | done | 2026-04-11 | Converted the user's bug list into a durable S1-S7 system roadmap so future work is contract-first, not patch-first. |
| C19 — Runtime Harness Sharding Review | done | 2026-04-12 | Accepted Task22 at commit `2e7421d`; sharded runtime gate passed 5/5 shards, 103 tests, 779s, with 16-spec coverage parity. |
| C20 — M3/M4 Next Work Packet Prep | done | 2026-04-12 | Task23 completed with corrected M3 objective scale contract; Codex rejected invalid construction-scale farm evidence and replaced it with completed-building measurement. |
| C21 — Dispatch M4 Player Issue Reality Pack | done | 2026-04-12 | GLM started the M4 pack; Codex corrected the live-like construction-resume proof and accepted the pack after build, app typecheck, M4 6/6, and affected 29/29 regression tests. |
| C22 — Dispatch M4 Command Surface Matrix | done | 2026-04-12 | Keep GLM on a broader War3-like command matrix so future live-play issues are tested as system contracts instead of one-off patches. |
| C23 — Dispatch Goldmine Clickability Contract | done | 2026-04-12 | Convert crowded-goldmine frustration into a stable selection contract and direct fix when GLM stalled. |
| C24 — M2-M7 Dual-Lane Continuous Execution | done | 2026-04-12 | Split M2-M7 into explicit Codex/GLM swimlanes so work continues through milestone handoffs instead of pausing for direction. |
| C25 — Review GLM M4 AI Recovery Pack | done | 2026-04-13 | Local build, app typecheck, and `tests/m4-ai-recovery-regression.spec.ts` are green; Task 31 is accepted as bounded-recovery proof, not human M4 approval. |
| C26 — M4 AI Recovery Acceptance Brief | done | 2026-04-13 | Codex-owned acceptance brief now isolates what Task 31 proves, what still needs human alpha judgment, and what routes back to engineering. |
| C27 — GLM Closeout Review Checklist | done | 2026-04-13 | Codex now has a fixed closeout review rubric for Task 32-35 acceptance, rejection, and takeover. |
| C28 — M6 Release Red Lines | done | 2026-04-13 | Release/share red lines are now explicit, separating no-external-share failures from private-playtest-only debt. |
| C29 — M6 Evidence Ledger | done | 2026-04-13 | Candidate-share claims are now mapped to concrete build, smoke, runtime, docs, and user-approval evidence. |
| C30 — M7 Extraction Sequence Plan | done | 2026-04-13 | Safe M7 order is fixed to Selection slice -> Placement slice -> contract gap sweep. |
| C31 — M7 Slice Review Log | done | 2026-04-13 | Codex has a standing acceptance/reject/defer log template for each M7 extraction slice. |
| C32 — Review GLM M6/M7 Hardening Closeouts | done | 2026-04-13 | Task 32-35 are now locally reviewed; Task 35 has been accepted and M7 engineering hardening is formally closed with residual debt recorded. |
| C33 — M6 README And Share Entry Refresh | done | 2026-04-13 | README now matches the actual alpha/private-playtest boundary, implemented scope, review path, and non-public-share wording. |
| C34 — M6 Public Share Gate Materials | done | 2026-04-13 | Public-share checklist, README/share-copy checklist, and candidate release record template are now ready for M6 review. |
| C35 — Re-review GLM Task 31 Closeout Consistency | done | 2026-04-13 | Task 31 test wording, queue wording, and Codex-side acceptance boundary are now aligned on bounded recovery and overshoot <= 2. |
| C36 — M4 Alpha Observation Pack | done | 2026-04-13 | Observation template now exists, so future M4 human review can be recorded as structured evidence instead of chat fragments. |
| C37 — M6 Smoke Closeout Checklist | done | 2026-04-13 | Task-specific smoke closeout checklist now exists, separating smoke path docs, candidate evidence, and release wording. |
| C38 — M7 Task33 Dispatch Packet | done | 2026-04-13 | Dispatch packet now exists with strict allowed files, no-touch boundaries, regression floor, and reject conditions for Task 33. |
| C39 — M7 Task34 Dispatch Packet | done | 2026-04-13 | Dispatch packet now exists with strict placement-only scope, no-touch boundaries, regression floor, and reject conditions for Task 34. |
| C40 — M7 Contract Gap Ranking | done | 2026-04-13 | Ranking now exists and recommends HUD command-card cache transitions as the first Task 35 target after Task 33/34 settle. |
| C41 — M7 Task35 Dispatch Packet | done | 2026-04-13 | Dispatch packet now exists and constrains Task 35 to one explicit high-risk gap with spec-first proof and narrow repair rules. |
| C42 — M6 Private Playtest Gate Checklist | done | 2026-04-13 | The missing middle gate now exists, separating small private playtests from both hold and public share language. |
| C43 — M6 Release Decision Tree | done | 2026-04-13 | One-page hold/private-playtest/public-share decision tree now exists, so M6 calls can stay evidence-led and stop mixing approval language. |
| C44 — M7 Task33 Review Packet | done | 2026-04-13 | SelectionController review packet now exists, with file-boundary checks, unchanged-behavior list, reject conditions, and a ready-to-fill slice log template. |
| C45 — M7 Task34 Review Packet | done | 2026-04-13 | PlacementController review packet now exists, with placement-only file boundaries, invariant checks, reject conditions, and a ready-to-fill slice log template. |
| C46 — M7 Task35 Review Packet | done | 2026-04-13 | Contract-gap review packet now exists, keeping Task 35 anchored on one chosen gap, one proof shape, and explicit reject rules for generic test churn. |
| C47 — M6 Candidate Smoke Record Example | done | 2026-04-13 | A filled smoke-record example now exists, so future M6 closeouts can follow one evidence shape instead of loose chat summaries. |
| C48 — M6 Private Playtest Feedback Triage | done | 2026-04-13 | The private-playtest triage guide now exists, mapping tester feedback into red lines, contract gaps, debt, or user-judgment buckets. |
| C49 — M7 Slice Acceptance Decision Tree | done | 2026-04-13 | A one-page accept/defer/takeover tree now exists, so Task 33-35 closeouts can be judged consistently without drifting into vague “green” language. |
| C50 — M7 Local Verification Matrix | done | 2026-04-13 | Verification matrix now exists, fixing when Task 33-35 may rely on focused packs and when Codex must escalate to broader runtime coverage. |
| C51 — M7 Merge Sequence Checklist | done | 2026-04-13 | Merge/update order now exists, so slice acceptance, queue sync, and next-task dispatch do not drift out of sequence. |
| C52 — M6 Private Playtest Session Log Template | done | 2026-04-13 | A structured per-session private-playtest record now exists, joining context, evidence, behavior observations, and triage outcome. |
| C53 — M6 Candidate Promotion Checklist | done | 2026-04-13 | Promotion checklist now exists, clarifying how a candidate moves from private-playtest-ready toward public-share-ready without overstating proof or approval. |
| C54 — M7 Task35 Gap Selection Brief | done | 2026-04-13 | Chosen-gap brief now exists and fixes Task 35 to HUD command-card cache transitions instead of generic coverage churn. |
| C55 — M7 Post-Hardening Residual Debt Register | done | 2026-04-13 | Residual-debt register now distinguishes true M7 blockers from acceptable post-hardening debt and deferred user judgment. |
| C56 — M6 Known Issues Disclosure Checklist | done | 2026-04-13 | Known Issues audit checklist now exists for private-playtest and public-share candidate wording, evidence links, and no-theater wording. |
| C57 — M6 Private Playtest Feedback Rollup Template | done | 2026-04-13 | Rollup template now exists so repeated private-playtest feedback can be aggregated into one evidence-led M6 input. |
| C58 — M6 README Entry Rewrite Brief | done | 2026-04-13 | README rewrite brief now fixes the future entry page around honest alpha/private-playtest framing before touching README itself. |
| C59 — M7 Hardening Closeout Packet | done | 2026-04-13 | M7 engineering hardening is now formally closed as `accepted engineering closeout with residual debt`; future work moves back to the real V2 product milestone instead of more M7 paperwork. |
| C60 — Asset Sourcing Governance Lane | watch | 2026-04-13 | Governance remains live, but concrete work should now advance through adjacent intake and integration tasks instead of re-dispatching the original lane brief. |
| C61 — Battlefield Asset Sourcing Brief | done | 2026-04-13 | The vague sourcing brief is no longer the live queue head; the concrete follow-up is `C69` battlefield intake matrix. |
| C62 — Product Shell Asset Sourcing Brief | superseded | 2026-04-13 | The vague shell sourcing brief is no longer the live queue head; the concrete follow-up is `C70` product-shell intake matrix. |
| C64 — Product Shell State Map | done | 2026-04-13 | Added `PRODUCT_SHELL_STATE_MAP.zh-CN.md`, defining the real current shell lifecycle, missing states, and the safest next wiring order. |
| C65 — Battlefield Asset Intake Matrix | done | 2026-04-13 | Convert asset sourcing from vague intent into concrete intake categories, legal source classes, fallback rules, and GLM handoff boundaries. |
| C66 — Product Shell Asset Intake Matrix | done | 2026-04-13 | Product-shell intake work now exists as a concrete matrix covering categories, legal source classes, tone/style boundaries, fallback rules, and GLM handoff limits. |
| C70 — Product Shell Asset Intake Matrix | done | 2026-04-13 | Product-shell intake is now the concrete approval surface for title/menu/loading/pause/results/settings/help materials, with V2 scope, hard rejects, fallback, and GLM handoff boundaries. |
| C71 — Shell Slice Integration Cadence | done | 2026-04-13 | Shell cadence 已明确：未 review shell slice 不得堆积；Codex 何时停下 queue refill 做集成；front-door/session-shell/return-to-menu 各自要跑哪些 regression pack。 |
| C73 — Front-Door Acceptance Matrix | done | 2026-04-13 | define what counts as a truthful front door for the current V2 page-product slice so shell work stops drifting between “boot menu exists” and “real product entry exists”. |
| C74 — Session Shell Gap Routing Pack | done | 2026-04-13 | Session-shell gaps are now routed into real seams, dormant surfaces, GLM-safe implementation slices, Codex-only truth work, and user judgment gates. |
| C75 — Asset Approval Handoff Packet | done | 2026-04-13 | Asset approval now requires a Codex packet with approved candidates, fallback, source evidence, target keys, regression expectations, and send-back rules before GLM import. |
| C76 — Mode-Select Acceptance Matrix | done | 2026-04-13 | Mode-select now has a V2/V3 boundary for truthful placeholders, enabled vs disabled vs absent branches, later product work, and playable-path alignment. |
| C77 — Secondary Shell Surface Acceptance Brief | done | 2026-04-13 | Secondary shell surfaces now have a truth lens for settings, help/controls, and briefing, separating GLM-safe slices, Codex-only truth work, dormant placeholders, and user judgment. |
| C78 — Shell Adjacency Feed Map | done | 2026-04-13 | Shell refill now has a neighbor-backed feed map for source docs, GLM-slice branching, shell-vs-battlefield-vs-user-gate decisions, and promotion-safe candidate shapes. |
| C79 — V2 Page-Product Remaining Gates | done | 2026-04-13 | V2 closeout now has an evidence-led remaining-gates list split by product-shell vs battlefield/readability, engineering proof vs user acceptance, blockers vs residual debt. |
| C80 — Front-Door Session Summary Acceptance Matrix | done | 2026-04-13 | Front-door last-session summary now has a truth matrix for allowed session facts, stale/overclaimed behavior, GLM-safe implementation, Codex wording, and out-of-scope product layers. |
| C81 — Mode-Select Placeholder Review Checklist | done | 2026-04-13 | Mode-select placeholder review now requires enabled/disabled/absent branch proof, fake full-mode wording rejection, and split rules for unsafe GLM slices. |
| C82 — Shell-To-Battlefield Cutover Criteria | done | 2026-04-13 | Shell-to-battlefield cutover now has gate criteria for shell closure, parallel battlefield work, anti-premature-switch evidence, and remaining user judgment. |
| C83 — V2 Page-Product Evidence Ledger | done | 2026-04-13 | V2 page-product gates now have an evidence ledger tying each remaining PS/BF gate to engineering evidence, user judgment, and current state. |
| V2 Codex BF1 — Basic Visibility Evidence Packet | done | 2026-04-13 | BF1 now has an explicit basic visibility/no-regression proof packet, separated from V3 battlefield readability and human visual judgment. |
| PS7 Private-Playtest Approval Packet | done | 2026-04-13 | Packet now separates wording evidence, engineering blockers, private-playtest permission, and public-share prohibition; PS7 remains user-open, not approved. |
| PS3 Mode-Select Conditional Exposure Audit | done | 2026-04-13 | PS3 visible placeholder is recorded as visible-pass/user-open: only current-map live route is actionable; campaign remains disabled/unimplemented and broader modes are absent. |
| PS4 Secondary Surface Conditional Audit | done | 2026-04-13 | PS4 visible secondary surfaces are recorded as visible-pass/user-open: help, settings, and briefing have real content/return/proof boundaries without claiming full tutorial/settings/loading completion. |
| BF1 Live-Queue Proof Scope Reconciliation | done | 2026-04-13 | GLM BF1 card now requires unit visibility, camera/HUD, scale footprint sanity, and unit presence proof; old two-spec evidence is explicitly partial only. |
| C63 — Dual-Lane Runway Publication | done | 2026-04-13 | Replace implicit “keep going” with explicit long-run runway docs for both lanes. |
| C67 — V2 -> V3 Promotion Boundary Rewrite | done | 2026-04-13 | V2 is now defined as a credible page-product vertical slice; V3 owns battlefield/product-shell clarity, and later strategic depth stays out of promotion scope. |
| C68 — Product-Shell Acceptance Brief | done | 2026-04-13 | Give the user one honest acceptance lens for page-product structure, separate from in-match mechanics. |
| C69 — Battlefield Asset Intake Matrix | done | 2026-04-13 | Turn `C61` into a concrete intake matrix instead of a vague “go find materials” brief. |
| C72 — README / Share Copy Reality Sync | done | 2026-04-13 | Make the outward description of the repo match the real product state after M7 shell work and before V3 readability work. |
| V3 Codex Main-Menu Reference Brief | done | 2026-04-13 | Turn the user's “menu still feels weak” feedback into a concrete War3-referenced main-menu target instead of leaving shell quality as a vague complaint. |
| V3 Codex Battlefield Readability Feedback Routing | done | 2026-04-13 | Route the latest user feedback about flat terrain and off War3-like ratios into the next battlefield readability and spatial-grammar work instead of losing it in chat memory. |
| V2 Codex PS1 — Front-Door Gate Evidence Sync | done | 2026-04-13 | Align the PS1 front-door blocker with the actual acceptance matrix, ledger row, and current focused proof list. |
| V2 Codex PS2 — Session-Shell Evidence Routing | done | 2026-04-13 | Turn the open PS2 blocker into an explicit proof route for pause/setup/results/reload/reset instead of a vague shell claim. |
| V2 Codex PS6 — Results Summary Truth Brief | done | 2026-04-13 | Define what the currently visible results and summary surfaces may claim, and what evidence is still missing for PS6. |
| V2 Codex PS7 — Outward Wording Closeout Sync | done | 2026-04-13 | Align outward wording with the still-open V2 gates so closeout copy cannot overclaim parity or release readiness. |
| PS1 Front-Door Evidence Closeout Review | done | 2026-04-13 | Turn the existing PS1 proof route into a conservative closeout decision without claiming a complete main menu. |
| PS2 Session-Shell Evidence Closeout Review | done | 2026-04-13 | Convert the PS2 proof route into a closeout decision for visible session seams and stale-state risk. |
| PS6 Results Summary Evidence Closeout Review | done | 2026-04-13 | Close or block PS6 from real session-state evidence while rejecting fake postgame framing. |
| BF1 Four-Proof Closeout Review | done | 2026-04-13 | Reconcile BF1 basic visibility evidence without claiming V3 battlefield readability. |
| PS1 前门证据收口复核 | done | 2026-04-13 | PS1 工程证据已收口为 normal boot、runtime-test bypass 独立保护线、start-current-map 和 source-truth；不声明完整主菜单。 |
| PS2 会话壳层证据收口复核 | done | 2026-04-13 | 把 PS2 的 pause/setup/results/reload/reset 证据路线收成一次明确复核，而不是继续挂一个大而空的 shell 说法。 |
| PS7 对外文案收口同步 | done | 2026-04-13 | README、release/share 文案已和当前 ledger 对齐，只写 V2 page-product alpha / private-playtest candidate。 |
| PS6 结果摘要证据收口复核 | done | 2026-04-14 | PS6 focused pack passed 13/13；结果页与上局摘要已收口为真实 runtime session state 支撑的 alpha 级轻量字段，不声明完整战报、历史、天梯或战役。 |
| PS2 状态一致性复核 | done | 2026-04-14 | PS2 focused pack passed 24/24；pause/setup/results/reload/terminal reset 工程 blocker 已从 open 移出，但不声明完整主菜单、return-to-menu/re-entry 或用户理解度通过。 |
| BF1 四证据包收口复核 | done | 2026-04-14 | BF1 complete four-proof pack passed 11/11；基础可见性工程 blocker 已从 open 移出，但不声明 V3 readability、人眼 opening grammar 或真实素材导入通过。 |
| C84 — V3 Transition Gate Sync | done | 2026-04-13 | 让 V3 gate、ledger 和 bootstrap packet 的 blocker / residual / seed queue 口径完全一致。 |
| C85 — V3 Human Opening Grammar Acceptance Matrix | done | 2026-04-13 | 把“基地像不像一个 War3-like opening”从主观吐槽变成可重复审查的问题矩阵。 |
| C86 — V3 Product-Shell Clarity Routing Brief | done | 2026-04-14 | 把 V3 product-shell clarity 的边界写清楚，避免 GLM 被模糊 shell 任务拖进大改。 |
| C87 — V3 First-Look Approval Packet | done | 2026-04-13 | 给 V3 的人眼 gate 准备统一 review 包，不再靠聊天碎片裁决。 |
| 战场空间语法验收包 | done | 2026-04-14 | 把基地、金矿、树线、出口和防御建筑的空间关系写成一份可验收的战场语法标准，避免后续只把对象摆在一起。 |
| 默认镜头可读性审查包 | done | 2026-04-13 | 把默认镜头下各类单位、建筑、资源和地形辅助物是否能被看懂，整理成一份可复核的审查包。 |
| 素材回退清单收口 | done | 2026-04-14 | 整理合法 proxy、fallback、hybrid 素材和缺图回退清单，防止 GLM 用未批准素材偷跑。 |
| 可玩入口焦点验收包 | done | 2026-04-13 | 把主入口的焦点、当前地图/模式说明和不可玩分支边界写成一份产品壳层验收标准。 |
| V3 BG1 战场空间语法收口复核 | done | 2026-04-14 | V3-BG1 收口为 `insufficient-evidence`：缺同一 build 的 raw/annotated 默认镜头截图、布局说明、BG1 focused regression 和已填写审查清单；未关闭 RD1、CH1、AV1 或 UA1。 |
| V3 RD1 默认镜头可读性收口复核 | done | 2026-04-14 | V3-RD1 收口为 `blocked-by-evidence-gap`：九类对象都缺对象级默认镜头截图、measurement proof、focused regression 和 readability verdict；未关闭 BG1、CH1 或 AV1。 |
| V3 PS1 可玩入口焦点收口复核 | done | 2026-04-14 | V3-PS1 收口为 `blocked-by-evidence-gap`：缺 primary action hierarchy、source/mode truth、disabled/absent branch audit 和 no fake route scan；未关闭 PS2、PS3、PS4 或 PS5。 |
| AV1 素材合法回退复核 | done | 2026-04-14 | V3-AV1 收口为 `manifest-ready / conditional-open`：17 个素材项已登记为 14 fallback、3 legal-proxy、0 hybrid、0 blocked；无 approved packet，真实素材仍禁止导入。 |
| PS4 主菜单质量评审包 | done | 2026-04-14 | V3-PS4 收口为 `review-packet-ready / user-open`：已定义 hierarchy、focal entry、backdrop mood、action grouping 和 verdict 规则；仍缺用户或指定 reviewer 判断。 |
| V3 PS3 开局解释层收口复核 | done | 2026-04-14 | V3-PS3 收口为 `blocked-by-evidence-gap`：缺 explanation surface proof、copy truth audit、fake framing audit、route placement proof 和 focused proof；未关闭 PS1、PS2、PS4 或 PS5。 |
| V3 PS2 返回再开局收口复核 | done | 2026-04-14 | V3-PS2 收口为 `blocked`：return-to-menu、re-entry、source truth、stale cleanup 四段仍缺 focused proof；未关闭 summary truth、main-menu quality、secondary usefulness、PS1、PS3 或 PS5。 |
| V3 CH1 镜头与HUD协同收口复核 | done | 2026-04-14 | V3-CH1 收口为 `blocked`：缺带 HUD 默认镜头 raw/annotated screenshot、framing proof、HUD safe-area proof、selection ring interaction proof、footprint interaction proof 和 focused regression；未关闭 RD1、BG1、AV1 或 UA1。 |
| BG1 空间语法证据复核 | done | 2026-04-14 | V3-BG1 复核仍为 `insufficient-evidence`：缺同一 build 的 raw/annotated 默认镜头截图、布局说明、BG1 focused regression 和已填写 checklist；未关闭 RD1、CH1、AV1 或 UA1。 |
| PS2 返回再开局证据复核 | done | 2026-04-14 | V3-PS2 仍 `blocked`：return-to-menu、re-entry、source truth 已有 6/6 focused proof；仍缺 selection、placement、command-card stale cleanup 显式 proof；未关闭 summary、menu quality 或 secondary usefulness。 |
| CH1 镜头HUD协同证据复核 | done | 2026-04-14 | V3-CH1 复核为 `insufficient-evidence`：focused regression 7/7 pass 覆盖 framing、HUD、selection ring、footprint 和 exit/gap；仍缺同 build raw/annotated HUD screenshot packet；未关闭 RD1、BG1、AV1 或 UA1。 |
| PS3 开局解释层证据复核 | done | 2026-04-14 | V3-PS3 收口为 `engineering-pass`：briefing/source/continue focused pack 9/9 pass，覆盖 source/mode/controls truth、no fake labels 和 briefing start route；未关闭 PS1、PS2、PS4 或 PS5。 |
| V3 AV1 素材回退清单收口复核 | done | 2026-04-14 | V3-AV1 复核为 `manifest-ready / conditional-open`：17 项素材为 14 fallback、3 legal-proxy、0 hybrid、0 blocked；approved packet 仍为 none，真实素材禁止导入。 |
| V3 A1 第一批素材批准交接包 | done | 2026-04-14 | A1 fallback-only handoff packet 已产出：九类 battlefield target key 批准 S0 fallback route；真实素材 approved packet 仍为 none，GLM 只可做 fallback manifest / regression。 |
| RD1 可读性证据收口复核 | done | 2026-04-14 | V3-RD1 收口为 `insufficient-evidence / measurement-proof-pass`：focused regression 10/10 pass，八类视觉对象已有 measurement 和剪影/材质记录；仍缺同 build raw/annotated 默认镜头截图包、用户或目标 tester verdict，terrain aid 仍无运行时视觉 proof。 |
| CH1 截图包收口复核 | done | 2026-04-14 | V3-CH1 收口为 `insufficient-evidence / regression-pass-screenshot-missing`：focused regression 7/7 pass；仍缺同 build raw/annotated HUD screenshot packet 与截图到命令结果的绑定记录，不能关闭 gate。 |
| PS1 入口焦点证据收口复核 | done | 2026-04-14 | V3-PS1 收口为 `blocked-by-pending-proof`：GLM `PS1 入口焦点证明包` 仍是 `in_progress`，尚无 completed focused proof；不能关闭入口焦点 gate，也不能混入 PS4 菜单质感。 |
| PS2 残留交互清理复核 | done | 2026-04-14 | V3-PS2 收口为 `blocked / stale-cleanup-proof-missing`：return-to-menu、re-entry、source truth 已有 6/6 focused proof；selection、placement、command-card cleanup 仍缺显式 proof，GLM 证明包仍是 `ready`。 |
| RD1 截图与可读判断收口复核 | done | 2026-04-14 | V3-RD1 收口为 `insufficient-evidence / screenshot-verdict-missing`：10/10 focused regression 与八类视觉对象 measurement proof 有效；仍缺同 build raw/annotated 截图和 tester verdict，terrain aid 在 RD1 runtime visual claim 下 blocked。 |
| PS2 残留清理证据收口复核 | done | 2026-04-14 | V3-PS2 工程收口为 `engineering-pass`：Codex 复跑 focused spec 6/6 pass，selection、placement、command-card stale cleanup 均有证据；PS5 用户理解度仍 open。 |
| AV1 回退目录证据收口复核 | done | 2026-04-14 | V3-AV1 收口为 `fallback-regression-pass / conditional-open`：17 项 traceable，14 fallback、3 legal-proxy、0 hybrid、0 blocked；approved packet 仍 none，真实素材仍禁止导入。 |
| RD1 截图判定收口复核 | done | 2026-04-14 | V3-RD1 仍为 `insufficient-evidence / screenshot-verdict-still-missing`：10/10 measurement proof 有效，但截图包、tester verdict 和 terrain aid runtime visual 仍缺。 |
| AV1 真实素材批准输入包 | done | 2026-04-14 | V3-AV1 真实素材输入收口为 `fallback-only / deferred-real-assets`：已定义 approved / fallback-only / rejected / deferred 四类结论和九类 target key 输入字段；approved packet 仍为 none，GLM 只能接 approved fallback 或未来 approved-for-import packet。 |
| P1 压力路径证据收口复核 | done | 2026-04-14 | P1 复核通过：GLM proof 6/6 pass，V4 ledger 已收为 `engineering-pass`；不关闭 R1/E1。 |
| R1 恢复反打证据收口复核 | done | 2026-04-14 | R1 复核通过：GLM proof 5/5 pass，V4 ledger 已收为 `engineering-pass / watch-after-E1`；不关闭 E1 或人眼短局判断。 |
| E1 结果闭环证据收口复核 | done | 2026-04-14 | E1 复核通过：GLM proof 已完成，Codex 加强为 6/6 pass，V4 ledger 已收为 `engineering-pass`；V4 工程 blocker 清零。 |
| C88 — V5 Strategy Backbone Gate Sync | done | 2026-04-14 | V5 gate / ledger / bootstrap 已同步：V5 blocker 仅为 ECO1、TECH1、COUNTER1；V4 carryover 限定为 PACE0/SD1；cutover 仍因 GLM runway 缺失阻塞，V5 未 active。 |
| C89 — ECO1 经济产能证据收口复核 | done | 2026-04-14 | ECO1 复核为 `blocked / partial-proof`：focused command 5/6 pass，gold/supply/production/recovery 有证据，但 lumber income 失败为 `200 -> 200`；不关闭 TECH1、COUNTER1 或 V5-UA1。 |
| C90 — TECH1 科技建造顺序证据收口复核 | done | 2026-04-14 | TECH1 复核为 `blocked-by-pending-proof`：GLM Task 102 仍是 ready，`tests/v5-tech-build-order-backbone.spec.ts` 尚不存在；无 build order timeline、前置 proof 或解锁/强化 proof。 |
| C91 — COUNTER1 兵种组成证据收口复核 | done | 2026-04-14 | COUNTER1 复核为 `blocked-by-pending-proof`：GLM Task 103 仍是 ready，`tests/v5-counter-composition-backbone.spec.ts` 尚不存在；无 counter relation、composition choice、production choice 或 combat state log proof。 |
| ECO1 新证据收口复核 | done | 2026-04-14 | ECO1 新证据复核为 `engineering-pass / blocker-cleared`：focused command 6/6 pass，gold/lumber、supply、production cycle、damage recovery 和 audit 均通过；未关闭 TECH1、COUNTER1 或 V5-UA1。 |
| TECH1 新证据收口复核 | done | 2026-04-14 | TECH1 新证据复核为 `engineering-pass / blocker-cleared`：focused command 6/6 pass，build order timeline、resource/building/supply prerequisites、observable progression 和 audit 均通过；未关闭 COUNTER1 或 V5-UA1，也未回改 ECO1。 |
| H1 人族火枪手科技线范围包 | done | 2026-04-14 | H1 scope packet 已产出：V5-HUMAN1 被切成 Blacksmith/Rifleman、Long Rifles、AI Rifleman composition 三段 GLM 任务；只允许 fallback/proxy，不关闭 V5-COUNTER1。 |
| C92 — Watch 提交与假运行防护 | done | 2026-04-14 | watch send 现在会检查独立提交提示并补提交；lane-feed 会把排队未提交显示为 `needs_submit / queued_prompt`，并避免同标题未确认时重复派发。 |
| 人族数值字段盘点 | done | 2026-04-14 | NUM-A 字段合同已产出：`docs/V6_NUMERIC_SCHEMA_INVENTORY.zh-CN.md` 覆盖 unit/building/research/ability 四类 schema，并明确 attackType/armorType、research effect、命令卡数值展示和 AI 权重字段；下一步可派 NUM-B 基础账本。 |
| 身份系统最小验收稿 | done | 2026-04-14 | V6-ID1 最小验收稿已产出：拒绝按钮/图标/文案占位，要求 visible state、trigger、effect、restriction、feedback、cleanup 证据；推荐第一批 GLM 切片为“人族集结号令”。 |
### C67 — V2 -> V3 Promotion Boundary Rewrite

Status: `done`.

Goal:

Clarify what “V2 credible slice” means now that shell/session truth and battlefield readability are both on the table.

Allowed files:

- `/Users/zhaocong/Documents/war3-re/docs/PROJECT_MASTER_ROADMAP.zh-CN.md`
- `/Users/zhaocong/Documents/war3-re/docs/WAR3_ENDSTATE_GAP_ATLAS.zh-CN.md`
- `/Users/zhaocong/Documents/war3-re/PLAN.zh-CN.md`
- `docs/CODEX_ACTIVE_QUEUE.md` only for closeout sync

Must satisfy:

- what still belongs to V2 closeout
- what becomes V3 battlefield/product-shell work
- what absolutely belongs to later strategic depth

Done when:

- `docs/PROJECT_MASTER_ROADMAP.zh-CN.md` defines the V2 closeout / V3 promotion / later-depth boundary.
- `docs/WAR3_ENDSTATE_GAP_ATLAS.zh-CN.md` maps major gap layers into V2, V3, V4/V5, and V6+ buckets.
- `PLAN.zh-CN.md` uses `V2 credible page-product vertical slice` as the current-stage wording and stops treating V2 as only gameplay hardening.

Verification:

```bash
git diff --check -- /Users/zhaocong/Documents/war3-re/docs/PROJECT_MASTER_ROADMAP.zh-CN.md /Users/zhaocong/Documents/war3-re/docs/WAR3_ENDSTATE_GAP_ATLAS.zh-CN.md /Users/zhaocong/Documents/war3-re/PLAN.zh-CN.md docs/CODEX_ACTIVE_QUEUE.md
```

Closeout:

- `docs/PROJECT_MASTER_ROADMAP.zh-CN.md` now names V2 as a credible page-product vertical slice, adds the V2 page-product minimum, and routes battlefield/product-shell clarity into V3.
- `docs/WAR3_ENDSTATE_GAP_ATLAS.zh-CN.md` now maps major endstate gap layers into V2, V3, V4/V5, and V6+ buckets.
- `PLAN.zh-CN.md` now uses the `V2 credible page-product vertical slice` wording for current-stage execution and stops treating Wave 1 as only gameplay hardening.
- Later strategic depth, heroes/spells/second race, full short-match alpha, final identity, and public release packaging remain outside V2/V3 promotion.

### C68 — Product-Shell Acceptance Brief

Status: `done`.

Goal:

Give the user one honest acceptance lens for page-product structure, separate from in-match mechanics.

Allowed files:

- `/Users/zhaocong/Documents/war3-re/docs/PRODUCT_SHELL_ACCEPTANCE_BRIEF.zh-CN.md`
- `/Users/zhaocong/Documents/war3-re/docs/WAR3_PAGE_PRODUCT_MASTER_PLAN.zh-CN.md`
- `docs/CODEX_ACTIVE_QUEUE.md` only for closeout sync

Must satisfy:

- what counts as a real front door
- what counts as a truthful pause/results loop
- what still remains only as dormant infrastructure

Done when:

- `docs/PRODUCT_SHELL_ACCEPTANCE_BRIEF.zh-CN.md` defines real front door, truthful pause/results loop, dormant infrastructure, and accept/defer/reject rules.
- `docs/WAR3_PAGE_PRODUCT_MASTER_PLAN.zh-CN.md` points product-shell acceptance to the new brief instead of relying on generic page-product ambition.

Verification:

```bash
git diff --check -- /Users/zhaocong/Documents/war3-re/docs/PRODUCT_SHELL_ACCEPTANCE_BRIEF.zh-CN.md /Users/zhaocong/Documents/war3-re/docs/WAR3_PAGE_PRODUCT_MASTER_PLAN.zh-CN.md docs/CODEX_ACTIVE_QUEUE.md
```

Closeout:

- `docs/PRODUCT_SHELL_ACCEPTANCE_BRIEF.zh-CN.md` now defines real front door, truthful pause loop, truthful results loop, dormant infrastructure, and explicit `accept` / `defer` / `reject` / `needs-user-judgment` routing.
- `docs/WAR3_PAGE_PRODUCT_MASTER_PLAN.zh-CN.md` now points product-shell acceptance to that brief and separates current V2 page-product facts from full product-shell ambition.
- This task does not accept full front door, full mode select, full settings, full loading/briefing, rematch, public release, or War3 parity.

### C73 — Front-Door Acceptance Matrix

Status: `done`.

Goal:

define what counts as a truthful front door for the current V2 page-product slice so shell work stops drifting between “boot menu exists” and “real product entry exists”.

Allowed files:

- `/Users/zhaocong/Documents/war3-re/docs/FRONT_DOOR_ACCEPTANCE_MATRIX.zh-CN.md`
- `/Users/zhaocong/Documents/war3-re/docs/WAR3_PAGE_PRODUCT_MASTER_PLAN.zh-CN.md`
- `/Users/zhaocong/Documents/war3-re/docs/CODEX_ACTIVE_QUEUE.md`
- `docs/CODEX_ACTIVE_QUEUE.md` only for closeout sync

Must satisfy:

- what “start current map” already proves
- what “manual map entry” would newly prove
- what still does **not** count as finished front-door scope yet
- which parts remain explicit V3 or later work

Verification:

```bash
git diff --check -- /Users/zhaocong/Documents/war3-re/docs/FRONT_DOOR_ACCEPTANCE_MATRIX.zh-CN.md /Users/zhaocong/Documents/war3-re/docs/WAR3_PAGE_PRODUCT_MASTER_PLAN.zh-CN.md /Users/zhaocong/Documents/war3-re/docs/CODEX_ACTIVE_QUEUE.md docs/CODEX_ACTIVE_QUEUE.md
```

### C74 — Session Shell Gap Routing Pack

Status: `done`.

Goal:

turn remaining session-shell gaps into explicit routing so Codex/GLM/user judgment boundaries stay stable after `Task 62`.

Allowed files:

- `/Users/zhaocong/Documents/war3-re/docs/SESSION_SHELL_GAP_ROUTING.zh-CN.md`
- `/Users/zhaocong/Documents/war3-re/docs/PRODUCT_SHELL_STATE_MAP.zh-CN.md`
- `/Users/zhaocong/Documents/war3-re/docs/CODEX_ACTIVE_QUEUE.md`
- `docs/CODEX_ACTIVE_QUEUE.md` only for closeout sync

Must satisfy:

- which seams are already real vs still dormant
- which gaps are safe GLM implementation slices
- which gaps are Codex-only integration / truth work
- which gaps must wait for user product judgment

Done when:

- `docs/SESSION_SHELL_GAP_ROUTING.zh-CN.md` defines real seams, dormant surfaces, safe GLM slices, Codex-only truth work, user-judgment gates, and regression-pack expectations.
- `docs/PRODUCT_SHELL_STATE_MAP.zh-CN.md` points future session-shell routing to the new pack.

Verification:

```bash
git diff --check -- /Users/zhaocong/Documents/war3-re/docs/SESSION_SHELL_GAP_ROUTING.zh-CN.md /Users/zhaocong/Documents/war3-re/docs/PRODUCT_SHELL_STATE_MAP.zh-CN.md /Users/zhaocong/Documents/war3-re/docs/CODEX_ACTIVE_QUEUE.md docs/CODEX_ACTIVE_QUEUE.md
```

### C75 — Asset Approval Handoff Packet

Status: `done`.

Goal:

define the exact packet Codex must produce before GLM can touch approved asset batches, so “go import materials” stops depending on chat memory.

Allowed files:

- `/Users/zhaocong/Documents/war3-re/docs/ASSET_APPROVAL_HANDOFF_PACKET.zh-CN.md`
- `/Users/zhaocong/Documents/war3-re/docs/ASSET_SOURCING_AND_GOVERNANCE.zh-CN.md`
- `/Users/zhaocong/Documents/war3-re/docs/CODEX_ACTIVE_QUEUE.md`
- `docs/CODEX_ACTIVE_QUEUE.md` only for closeout sync

Must satisfy:

- approval prerequisites
- required packet fields for battlefield vs shell batches
- import/fallback regression expectations after handoff
- reject / send-back rules for partial or unclear batches

Done when:

- `docs/ASSET_APPROVAL_HANDOFF_PACKET.zh-CN.md` defines approval prerequisites, common packet fields, battlefield vs shell required fields, import/fallback regression expectations, and reject / send-back rules.
- `docs/ASSET_SOURCING_AND_GOVERNANCE.zh-CN.md` points GLM import work to the handoff packet instead of chat memory or loose approval lists.

Verification:

```bash
git diff --check -- /Users/zhaocong/Documents/war3-re/docs/ASSET_APPROVAL_HANDOFF_PACKET.zh-CN.md /Users/zhaocong/Documents/war3-re/docs/ASSET_SOURCING_AND_GOVERNANCE.zh-CN.md /Users/zhaocong/Documents/war3-re/docs/CODEX_ACTIVE_QUEUE.md docs/CODEX_ACTIVE_QUEUE.md
```

### C76 — Mode-Select Acceptance Matrix

Status: `done`.

Goal:

define what the current V2/V3 boundary accepts as a truthful mode-select placeholder versus a fake full product branch.

Allowed files:

- `/Users/zhaocong/Documents/war3-re/docs/MODE_SELECT_ACCEPTANCE_MATRIX.zh-CN.md`
- `/Users/zhaocong/Documents/war3-re/docs/WAR3_PAGE_PRODUCT_MASTER_PLAN.zh-CN.md`
- `/Users/zhaocong/Documents/war3-re/docs/CODEX_ACTIVE_QUEUE.md`
- `docs/CODEX_ACTIVE_QUEUE.md` only for closeout sync

Must satisfy:

- what a real mode-select placeholder already needs to prove
- which unavailable modes may appear as disabled versus should stay absent
- what still belongs to later V3/V4 product work
- how mode-select truth must stay aligned with real playable paths

Done when:

- `docs/MODE_SELECT_ACCEPTANCE_MATRIX.zh-CN.md` defines V2 placeholder proof, enabled / disabled / absent rules, V3/V4 boundaries, playable-path alignment, and accept/defer/reject outcomes.
- `docs/WAR3_PAGE_PRODUCT_MASTER_PLAN.zh-CN.md` points mode-select acceptance to the new matrix instead of treating mode select as generic missing shell ambition.

Verification:

```bash
git diff --check -- /Users/zhaocong/Documents/war3-re/docs/MODE_SELECT_ACCEPTANCE_MATRIX.zh-CN.md /Users/zhaocong/Documents/war3-re/docs/WAR3_PAGE_PRODUCT_MASTER_PLAN.zh-CN.md /Users/zhaocong/Documents/war3-re/docs/CODEX_ACTIVE_QUEUE.md docs/CODEX_ACTIVE_QUEUE.md
```

### C77 — Secondary Shell Surface Acceptance Brief

Status: `done`.

Goal:

define the acceptance lens for settings, help/controls, and briefing surfaces so shell work stops claiming “page product exists” from mere container presence.

Allowed files:

- `/Users/zhaocong/Documents/war3-re/docs/SHELL_SECONDARY_SURFACE_ACCEPTANCE.zh-CN.md`
- `/Users/zhaocong/Documents/war3-re/docs/PRODUCT_SHELL_ACCEPTANCE_BRIEF.zh-CN.md`
- `/Users/zhaocong/Documents/war3-re/docs/CODEX_ACTIVE_QUEUE.md`
- `docs/CODEX_ACTIVE_QUEUE.md` only for closeout sync

Must satisfy:

- what settings/help/briefing must prove to count as truthful
- what dormant placeholders do **not** count as acceptance
- which surfaces remain GLM-safe slices versus Codex-only truth work
- which user judgments remain outside current scope

Done when:

- `docs/SHELL_SECONDARY_SURFACE_ACCEPTANCE.zh-CN.md` defines truthful settings/help/briefing gates, dormant placeholder reject rules, GLM-safe slices, Codex-only truth work, user-judgment boundaries, and accept/defer/reject outcomes.
- `docs/PRODUCT_SHELL_ACCEPTANCE_BRIEF.zh-CN.md` points secondary shell surface acceptance to the new brief instead of treating settings/help/briefing as generic dormant infrastructure.

Verification:

```bash
git diff --check -- /Users/zhaocong/Documents/war3-re/docs/SHELL_SECONDARY_SURFACE_ACCEPTANCE.zh-CN.md /Users/zhaocong/Documents/war3-re/docs/PRODUCT_SHELL_ACCEPTANCE_BRIEF.zh-CN.md /Users/zhaocong/Documents/war3-re/docs/CODEX_ACTIVE_QUEUE.md docs/CODEX_ACTIVE_QUEUE.md
```

### C78 — Shell Adjacency Feed Map

Status: `done`.

Goal:

make the next-task capture rule explicit for the current shell trunk so queue refill keeps drawing from adjacent real work instead of drifting or starving.

Allowed files:

- `/Users/zhaocong/Documents/war3-re/docs/SHELL_ADJACENT_TASK_FEED_MAP.zh-CN.md`
- `/Users/zhaocong/Documents/war3-re/docs/TASK_CAPTURE_SYSTEM.zh-CN.md`
- `/Users/zhaocong/Documents/war3-re/docs/CODEX_ACTIVE_QUEUE.md`
- `docs/CODEX_ACTIVE_QUEUE.md` only for closeout sync

Must satisfy:

- which docs are the source-of-truth neighbors for the current shell trunk
- when a finished GLM shell slice should branch to implementation vs acceptance vs routing work
- how Codex decides whether the next refill stays on shell, shifts to battlefield readability, or waits for user judgment
- which candidate shapes are valid for automatic live-queue promotion

Done when:

- `docs/SHELL_ADJACENT_TASK_FEED_MAP.zh-CN.md` defines shell source-of-truth neighbors, GLM-slice branch rules, shell vs battlefield vs user-gate refill decisions, and valid / invalid automatic promotion shapes.
- `docs/TASK_CAPTURE_SYSTEM.zh-CN.md` points current Product Shell / Session Trunk refill to the shell adjacent feed map before promoting new live-queue work.

Verification:

```bash
git diff --check -- /Users/zhaocong/Documents/war3-re/docs/SHELL_ADJACENT_TASK_FEED_MAP.zh-CN.md /Users/zhaocong/Documents/war3-re/docs/TASK_CAPTURE_SYSTEM.zh-CN.md /Users/zhaocong/Documents/war3-re/docs/CODEX_ACTIVE_QUEUE.md docs/CODEX_ACTIVE_QUEUE.md
```

### C79 — V2 Page-Product Remaining Gates

Status: `done`.

Goal:

convert the current shell/front-door progress into one honest remaining-gates list for finishing the V2 page-product slice.

Allowed files:

- `/Users/zhaocong/Documents/war3-re/docs/V2_PAGE_PRODUCT_REMAINING_GATES.zh-CN.md`
- `/Users/zhaocong/Documents/war3-re/docs/PROJECT_MASTER_ROADMAP.zh-CN.md`
- `/Users/zhaocong/Documents/war3-re/PLAN.zh-CN.md`
- `/Users/zhaocong/Documents/war3-re/docs/CODEX_ACTIVE_QUEUE.md`
- `docs/CODEX_ACTIVE_QUEUE.md` only for closeout sync

Must satisfy:

- which remaining gates are product-shell gates versus battlefield/readability gates
- which gates are purely engineering proof versus user acceptance
- which unfinished gaps are allowed residual debt and which still block V2 closeout
- what exact evidence closes each remaining gate

Done when:

- `docs/V2_PAGE_PRODUCT_REMAINING_GATES.zh-CN.md` defines product-shell gates, battlefield/readability gates, engineering proof gates, user acceptance gates, V2 blockers, allowed residual debt, and exact closeout evidence.
- `docs/PROJECT_MASTER_ROADMAP.zh-CN.md` and `PLAN.zh-CN.md` point V2 closeout to the remaining-gates list instead of relying on broad V2/V3 boundary wording alone.

Verification:

```bash
git diff --check -- /Users/zhaocong/Documents/war3-re/docs/V2_PAGE_PRODUCT_REMAINING_GATES.zh-CN.md /Users/zhaocong/Documents/war3-re/docs/PROJECT_MASTER_ROADMAP.zh-CN.md /Users/zhaocong/Documents/war3-re/PLAN.zh-CN.md /Users/zhaocong/Documents/war3-re/docs/CODEX_ACTIVE_QUEUE.md docs/CODEX_ACTIVE_QUEUE.md
```

### C80 — Front-Door Session Summary Acceptance Matrix

Status: `done`.

Goal:

define what a truthful front-door last-session summary would need to prove before it counts as product progress instead of decorative UI.

Allowed files:

- `/Users/zhaocong/Documents/war3-re/docs/FRONT_DOOR_SESSION_SUMMARY_ACCEPTANCE.zh-CN.md`
- `/Users/zhaocong/Documents/war3-re/docs/WAR3_PAGE_PRODUCT_MASTER_PLAN.zh-CN.md`
- `/Users/zhaocong/Documents/war3-re/docs/CODEX_ACTIVE_QUEUE.md`
- `docs/CODEX_ACTIVE_QUEUE.md` only for closeout sync

Must satisfy:

- which session facts may be shown truthfully
- what counts as stale or overclaimed summary behavior
- when a summary is GLM-safe implementation work versus Codex-only wording/judgment
- what later product layers still remain out of scope

Done when:

- `docs/FRONT_DOOR_SESSION_SUMMARY_ACCEPTANCE.zh-CN.md` defines truthful session facts, stale / overclaimed behavior, acceptance outcomes, GLM-safe slices, Codex-only wording/judgment, and later product layers that remain out of scope.
- `docs/WAR3_PAGE_PRODUCT_MASTER_PLAN.zh-CN.md` points any front-door last-session summary to the new matrix instead of treating a summary panel as generic front-door progress.

Verification:

```bash
git diff --check -- /Users/zhaocong/Documents/war3-re/docs/FRONT_DOOR_SESSION_SUMMARY_ACCEPTANCE.zh-CN.md /Users/zhaocong/Documents/war3-re/docs/WAR3_PAGE_PRODUCT_MASTER_PLAN.zh-CN.md /Users/zhaocong/Documents/war3-re/docs/CODEX_ACTIVE_QUEUE.md docs/CODEX_ACTIVE_QUEUE.md
```

### C81 — Mode-Select Placeholder Review Checklist

Status: `done`.

Goal:

tighten Codex review rules for mode-select placeholder slices so disabled branches and fake routes do not slip through as “menu progress.”

Allowed files:

- `/Users/zhaocong/Documents/war3-re/docs/MODE_SELECT_PLACEHOLDER_REVIEW_CHECKLIST.zh-CN.md`
- `/Users/zhaocong/Documents/war3-re/docs/GLM_CLOSEOUT_REVIEW_CHECKLIST.zh-CN.md`
- `/Users/zhaocong/Documents/war3-re/docs/CODEX_ACTIVE_QUEUE.md`
- `docs/CODEX_ACTIVE_QUEUE.md` only for closeout sync

Must satisfy:

- how to review disabled/unavailable branches
- when one implemented branch is enough for acceptance
- what wording counts as fake full-mode support
- when to reject and split the next GLM slice

Done when:

- `docs/MODE_SELECT_PLACEHOLDER_REVIEW_CHECKLIST.zh-CN.md` defines enabled / disabled / absent branch review, one-branch V2 placeholder acceptance, fake full-mode support wording, and reject/split rules.
- `docs/GLM_CLOSEOUT_REVIEW_CHECKLIST.zh-CN.md` routes mode-select placeholder closeouts through the new checklist before Codex accepts GLM claims as menu progress.

Verification:

```bash
git diff --check -- /Users/zhaocong/Documents/war3-re/docs/MODE_SELECT_PLACEHOLDER_REVIEW_CHECKLIST.zh-CN.md /Users/zhaocong/Documents/war3-re/docs/GLM_CLOSEOUT_REVIEW_CHECKLIST.zh-CN.md /Users/zhaocong/Documents/war3-re/docs/CODEX_ACTIVE_QUEUE.md docs/CODEX_ACTIVE_QUEUE.md
```

### C82 — Shell-To-Battlefield Cutover Criteria

Status: `done`.

Goal:

define when the current shell/front-door trunk has done enough that Codex can reopen battlefield-readability as the next primary V2/V3 pressure line.

Allowed files:

- `/Users/zhaocong/Documents/war3-re/docs/SHELL_TO_BATTLEFIELD_CUTOVER_CRITERIA.zh-CN.md`
- `/Users/zhaocong/Documents/war3-re/docs/PROJECT_MASTER_ROADMAP.zh-CN.md`
- `/Users/zhaocong/Documents/war3-re/PLAN.zh-CN.md`
- `/Users/zhaocong/Documents/war3-re/docs/CODEX_ACTIVE_QUEUE.md`
- `docs/CODEX_ACTIVE_QUEUE.md` only for closeout sync

Must satisfy:

- which shell gates must close first
- which battlefield gates can proceed in parallel
- what evidence prevents premature branch switching
- what user judgment is still required before a true cutover

Done when:

- `docs/SHELL_TO_BATTLEFIELD_CUTOVER_CRITERIA.zh-CN.md` defines shell gates, parallel battlefield gates, anti-premature-switch evidence, user judgment, and decision outcomes.
- `docs/PROJECT_MASTER_ROADMAP.zh-CN.md` points V2/V3 promotion and V3 battlefield work to the cutover criteria.
- `PLAN.zh-CN.md` records the same cutover rule so P1 battlefield readability cannot become the primary line while shell truth still has blockers.

Verification:

```bash
git diff --check -- /Users/zhaocong/Documents/war3-re/docs/SHELL_TO_BATTLEFIELD_CUTOVER_CRITERIA.zh-CN.md /Users/zhaocong/Documents/war3-re/docs/PROJECT_MASTER_ROADMAP.zh-CN.md /Users/zhaocong/Documents/war3-re/PLAN.zh-CN.md /Users/zhaocong/Documents/war3-re/docs/CODEX_ACTIVE_QUEUE.md docs/CODEX_ACTIVE_QUEUE.md
```

### C83 — V2 Page-Product Evidence Ledger

Status: `done`.

Goal:

keep each remaining V2 page-product gate tied to specific engineering/user evidence instead of drifting back into chat memory.

Allowed files:

- `/Users/zhaocong/Documents/war3-re/docs/V2_PAGE_PRODUCT_EVIDENCE_LEDGER.zh-CN.md`
- `/Users/zhaocong/Documents/war3-re/docs/V2_PAGE_PRODUCT_REMAINING_GATES.zh-CN.md`
- `/Users/zhaocong/Documents/war3-re/docs/CODEX_ACTIVE_QUEUE.md`
- `docs/CODEX_ACTIVE_QUEUE.md` only for closeout sync

Must satisfy:

- one row per remaining V2 page-product gate
- required engineering evidence
- required user-judgment evidence
- current open/closed state per gate

Done when:

- `docs/V2_PAGE_PRODUCT_EVIDENCE_LEDGER.zh-CN.md` has one row per `PS1-PS7` and `BF1-BF5` gate with current state, required engineering evidence, required user evidence, and current conclusion.
- `docs/V2_PAGE_PRODUCT_REMAINING_GATES.zh-CN.md` points closeout readers to the ledger as the current evidence/status surface.

Verification:

```bash
git diff --check -- /Users/zhaocong/Documents/war3-re/docs/V2_PAGE_PRODUCT_EVIDENCE_LEDGER.zh-CN.md /Users/zhaocong/Documents/war3-re/docs/V2_PAGE_PRODUCT_REMAINING_GATES.zh-CN.md /Users/zhaocong/Documents/war3-re/docs/CODEX_ACTIVE_QUEUE.md docs/CODEX_ACTIVE_QUEUE.md
```

### V2 Codex PS1 — Front-Door Gate Evidence Sync

Status: `done`.

Goal:

Align the PS1 front-door blocker with the actual acceptance matrix, ledger row, and current focused proof list.

Allowed files:

- `docs/FRONT_DOOR_ACCEPTANCE_MATRIX.zh-CN.md`
- `docs/V2_PAGE_PRODUCT_EVIDENCE_LEDGER.zh-CN.md`
- `docs/CODEX_ACTIVE_QUEUE.md`
- `docs/CODEX_ACTIVE_QUEUE.md` only for closeout sync

Must satisfy:

- Record only the real normal-boot/start-current-map proof that exists now.
- Keep runtime-test bypass distinct from the normal visitor path.
- Do not describe the current shell as a complete main menu.

Done when:

- `docs/FRONT_DOOR_ACCEPTANCE_MATRIX.zh-CN.md` lists the actual PS1 focused proof files and separates runtime-test bypass from normal visitor proof.
- `docs/V2_PAGE_PRODUCT_EVIDENCE_LEDGER.zh-CN.md` narrows the `PS1` row to normal boot, start-current-map, and default source alignment evidence only.
- Manual map entry remains V3 front-door work and is not used to close the PS1 blocker.

Verification:

```bash
git diff --check -- docs/FRONT_DOOR_ACCEPTANCE_MATRIX.zh-CN.md docs/V2_PAGE_PRODUCT_EVIDENCE_LEDGER.zh-CN.md docs/CODEX_ACTIVE_QUEUE.md docs/CODEX_ACTIVE_QUEUE.md
```

### V2 Codex PS2 — Session-Shell Evidence Routing

Status: `done`.

Goal:

Turn the open PS2 blocker into an explicit proof route for pause/setup/results/reload/reset instead of a vague shell claim.

Allowed files:

- `docs/PRODUCT_SHELL_STATE_MAP.zh-CN.md`
- `docs/V2_PAGE_PRODUCT_EVIDENCE_LEDGER.zh-CN.md`
- `docs/CODEX_ACTIVE_QUEUE.md`
- `docs/CODEX_ACTIVE_QUEUE.md` only for closeout sync

Must satisfy:

- Map each visible session seam to concrete regression proof or a remaining engineering gap.
- Keep stale-state claims tied to named tests or closeout evidence only.
- Split missing engineering proof from user-judgment language.

Done when:

- `docs/PRODUCT_SHELL_STATE_MAP.zh-CN.md` contains a PS2 evidence route for each visible pause/setup/results/reload/reset seam.
- `docs/V2_PAGE_PRODUCT_EVIDENCE_LEDGER.zh-CN.md` points the `PS2` row at the named focused regression pack and keeps user clarity separate from engineering stale-state proof.
- Results summary content is routed to `PS6`, and return-to-menu / re-entry remains `PS5` / V3 work instead of being used to close PS2.

Verification:

```bash
git diff --check -- docs/PRODUCT_SHELL_STATE_MAP.zh-CN.md docs/V2_PAGE_PRODUCT_EVIDENCE_LEDGER.zh-CN.md docs/CODEX_ACTIVE_QUEUE.md docs/CODEX_ACTIVE_QUEUE.md
```

### V2 Codex PS6 — Results Summary Truth Brief

Status: `done`.

Goal:

Define what the currently visible results and summary surfaces may claim, and what evidence is still missing for PS6.

Allowed files:

- `docs/FRONT_DOOR_SESSION_SUMMARY_ACCEPTANCE.zh-CN.md`
- `docs/V2_PAGE_PRODUCT_EVIDENCE_LEDGER.zh-CN.md`
- `docs/CODEX_ACTIVE_QUEUE.md`
- `docs/CODEX_ACTIVE_QUEUE.md` only for closeout sync

Must satisfy:

- Retain only fields backed by real session state.
- Reject fake ladder, campaign, or full postgame framing.
- Update the PS6 ledger row with current evidence versus missing proof.

Done when:

- `docs/FRONT_DOOR_SESSION_SUMMARY_ACCEPTANCE.zh-CN.md` defines the current PS6 field whitelist for results-shell and front-door last-session summary surfaces.
- Fake ladder, campaign, rank, score, APM, full battle report, replay, and continue-saved-game framing are rejected explicitly.
- `docs/V2_PAGE_PRODUCT_EVIDENCE_LEDGER.zh-CN.md` records the PS6 proof route and still-missing closeout/user evidence.

Verification:

```bash
git diff --check -- docs/FRONT_DOOR_SESSION_SUMMARY_ACCEPTANCE.zh-CN.md docs/V2_PAGE_PRODUCT_EVIDENCE_LEDGER.zh-CN.md docs/CODEX_ACTIVE_QUEUE.md docs/CODEX_ACTIVE_QUEUE.md
```

### V2 Codex PS7 — Outward Wording Closeout Sync

Status: `done`.

Goal:

Align outward wording with the still-open V2 gates so closeout copy cannot overclaim parity or release readiness.

Allowed files:

- `README.md`
- `docs/M6_RELEASE_BRIEF.zh-CN.md`
- `docs/M6_PUBLIC_SHARE_CHECKLIST.zh-CN.md`
- `docs/V2_PAGE_PRODUCT_EVIDENCE_LEDGER.zh-CN.md`
- `docs/CODEX_ACTIVE_QUEUE.md`
- `docs/CODEX_ACTIVE_QUEUE.md` only for closeout sync

Must satisfy:

- Describe the build as a V2 page-product alpha/private-playtest candidate only.
- Do not claim War3 parity, finished product, or public readiness.
- Keep the outward wording and the ledger in sync.

Done when:

- `README.md`, `docs/M6_RELEASE_BRIEF.zh-CN.md`, and `docs/M6_PUBLIC_SHARE_CHECKLIST.zh-CN.md` describe the build as a V2 page-product alpha/private-playtest candidate only.
- Outward wording explicitly avoids War3 parity, finished product, release-ready, public-ready, and complete-shell claims.
- `docs/V2_PAGE_PRODUCT_EVIDENCE_LEDGER.zh-CN.md` records that wording is synced but PS7 remains open until user approval and target-candidate evidence exist.

Verification:

```bash
git diff --check -- README.md docs/M6_RELEASE_BRIEF.zh-CN.md docs/M6_PUBLIC_SHARE_CHECKLIST.zh-CN.md docs/V2_PAGE_PRODUCT_EVIDENCE_LEDGER.zh-CN.md docs/CODEX_ACTIVE_QUEUE.md docs/CODEX_ACTIVE_QUEUE.md
```

### V2 Codex BF1 — Basic Visibility Evidence Packet

Status: `done`.

Goal:

Shape the BF1 blocker into an explicit visibility proof packet instead of a generic readability promise.

Allowed files:

- `docs/V2_PAGE_PRODUCT_EVIDENCE_LEDGER.zh-CN.md`
- `docs/V2_PAGE_PRODUCT_REMAINING_GATES.zh-CN.md`
- `docs/CODEX_ACTIVE_QUEUE.md`
- `docs/CODEX_ACTIVE_QUEUE.md` only for closeout sync

Must satisfy:

- Separate basic visibility/no-regression proof from full V3 readability judgment.
- Cite the exact unit/camera/HUD proofs required for BF1.
- Keep V3 readability residuals out of the V2 blocker wording.

Done when:

- `docs/V2_PAGE_PRODUCT_EVIDENCE_LEDGER.zh-CN.md` defines the BF1 minimum proof packet and, before the 2026-04-14 closeout, kept BF1 open until actual runtime command results were recorded.
- `docs/V2_PAGE_PRODUCT_REMAINING_GATES.zh-CN.md` separates BF1 basic visibility/no-regression from `BF3/BF4/BF5` V3 readability, opening grammar, and asset-import residuals.
- BF1 cites exact unit, camera/HUD, footprint, and unit-presence proofs without claiming War3-like visual approval.

Verification:

```bash
git diff --check -- docs/V2_PAGE_PRODUCT_EVIDENCE_LEDGER.zh-CN.md docs/V2_PAGE_PRODUCT_REMAINING_GATES.zh-CN.md docs/CODEX_ACTIVE_QUEUE.md docs/CODEX_ACTIVE_QUEUE.md
```

### PS7 Private-Playtest Approval Packet

Status: `done`.

Milestone: `V2 credible page-product vertical slice`.
Gate: `PS7`.
Proof target: README/release/share wording stays at V2 page-product alpha/private-playtest candidate only, with user approval recorded separately from engineering proof.
Why now: The current GLM live queue covers PS1, PS2, PS6, and BF1, but no live task owns the remaining PS7 user-gate and candidate-evidence closeout.
Stop condition: PS7 can be marked closed or user-open with explicit evidence links, no War3 parity/public-ready wording, and a recorded user decision boundary.

Goal:

Create a closeout-ready packet that separates approved wording, engineering evidence, private-playtest permission, and public-share prohibition.

Allowed files:

- `README.md`
- `docs/M6_RELEASE_BRIEF.zh-CN.md`
- `docs/M6_PUBLIC_SHARE_CHECKLIST.zh-CN.md`
- `docs/V2_PAGE_PRODUCT_EVIDENCE_LEDGER.zh-CN.md`
- `docs/CODEX_ACTIVE_QUEUE.md` only for closeout sync

Must satisfy:

- Do not claim finished product, War3 parity, release-ready, or public-ready.
- Keep private-playtest candidate wording separate from user approval.
- Record any missing PS1/PS2/PS6/BF1 evidence as blockers, not caveats hidden in prose.

Verification:

```bash
git diff --check -- README.md docs/M6_RELEASE_BRIEF.zh-CN.md docs/M6_PUBLIC_SHARE_CHECKLIST.zh-CN.md docs/V2_PAGE_PRODUCT_EVIDENCE_LEDGER.zh-CN.md docs/CODEX_ACTIVE_QUEUE.md
```

Closeout:

- Wording evidence is linked through `README.md`, `docs/M6_RELEASE_BRIEF.zh-CN.md`, `docs/M6_PUBLIC_SHARE_CHECKLIST.zh-CN.md`, and the `PS7` row / packet section in `docs/V2_PAGE_PRODUCT_EVIDENCE_LEDGER.zh-CN.md`.
- Private-playtest permission remains `user-open`; no wording in the packet treats private playtest as approved.
- Public-share permission remains not granted; the current default remains `M6 public share: NO`.
- `PS1`、`PS2`、`PS6`、`BF1` closeout evidence and target-candidate build/typecheck/live smoke remain explicit blockers, not prose caveats.

### PS3 Mode-Select Conditional Exposure Audit

Status: `done`.

Milestone: `V2 credible page-product vertical slice`.
Gate: `PS3`.
Proof target: Enabled, disabled, and absent branches are listed with evidence that only the current playable path can route to live play.
Why now: Several shell tasks have already completed around mode truth, disabled branches, and primary action focus; the ledger still records PS3 as conditional-open.
Stop condition: PS3 ledger state records visible-pass, visible-reject, or absent-residual with exact focused tests or a follow-up GLM task shape.

Goal:

Audit current mode-select exposure against the acceptance matrix and decide whether PS3 is a visible blocker or dormant residual.

Allowed files:

- `docs/MODE_SELECT_ACCEPTANCE_MATRIX.zh-CN.md`
- `docs/MODE_SELECT_PLACEHOLDER_REVIEW_CHECKLIST.zh-CN.md`
- `docs/V2_PAGE_PRODUCT_EVIDENCE_LEDGER.zh-CN.md`
- `docs/CODEX_ACTIVE_QUEUE.md` only for closeout sync

Must satisfy:

- Do not accept fake mode routes, fake loading, fake map pools, or toast-only success.
- Treat unavailable modes as disabled or absent only when the wording is non-actionable.
- Keep later full mode-select/map-browser work out of V2.

Verification:

```bash
git diff --check -- docs/MODE_SELECT_ACCEPTANCE_MATRIX.zh-CN.md docs/MODE_SELECT_PLACEHOLDER_REVIEW_CHECKLIST.zh-CN.md docs/V2_PAGE_PRODUCT_EVIDENCE_LEDGER.zh-CN.md docs/CODEX_ACTIVE_QUEUE.md
```

Closeout:

- `docs/MODE_SELECT_ACCEPTANCE_MATRIX.zh-CN.md` now records the PS3 branch inventory and conclusion `accept-v2-placeholder`.
- `docs/MODE_SELECT_PLACEHOLDER_REVIEW_CHECKLIST.zh-CN.md` now records enabled, disabled, and absent branch lists, the proof route, remaining user judgment, and safe split names if rejected later.
- `docs/V2_PAGE_PRODUCT_EVIDENCE_LEDGER.zh-CN.md` records PS3 as `visible-pass / user-open`, not as full mode-select completion.
- No GLM repair slice is required from current evidence unless user rejects the disabled campaign tile or focused mode-select tests fail.

### PS4 Secondary Surface Conditional Audit

Status: `done`.

Milestone: `V2 credible page-product vertical slice`.
Gate: `PS4`.
Proof target: Settings/help/briefing surfaces prove real content, real return paths, truthful current-scope copy, and no fake coming-soon product claims.
Why now: Completed GLM shell slices added or tightened help, settings, briefing, copy, escape/back, and source-truth behavior; Codex must fold those into the V2 gate ledger.
Stop condition: PS4 ledger row distinguishes engineering proof from user usefulness judgment and names any missing focused regression pack.

Goal:

Review visible secondary shell surfaces and route each one to accepted, GLM repair, user judgment, or V3 residual.

Allowed files:

- `docs/SHELL_SECONDARY_SURFACE_ACCEPTANCE.zh-CN.md`
- `docs/PRODUCT_SHELL_ACCEPTANCE_BRIEF.zh-CN.md`
- `docs/V2_PAGE_PRODUCT_EVIDENCE_LEDGER.zh-CN.md`
- `docs/CODEX_ACTIVE_QUEUE.md` only for closeout sync

Must satisfy:

- Do not count empty containers, static fake copy, or unsupported settings as acceptance.
- Require a real return path for every visible secondary surface.
- Keep usefulness/readability as a user gate when engineering proof is already present.

Verification:

```bash
git diff --check -- docs/SHELL_SECONDARY_SURFACE_ACCEPTANCE.zh-CN.md docs/PRODUCT_SHELL_ACCEPTANCE_BRIEF.zh-CN.md docs/V2_PAGE_PRODUCT_EVIDENCE_LEDGER.zh-CN.md docs/CODEX_ACTIVE_QUEUE.md
```

Closeout:

- `docs/SHELL_SECONDARY_SURFACE_ACCEPTANCE.zh-CN.md` records current PS4 visible surfaces, evidence routes, missing future-only regression packs, and user judgment boundaries.
- `docs/PRODUCT_SHELL_ACCEPTANCE_BRIEF.zh-CN.md` records that PS4 is engineering-truth only and cannot be used as full product-shell acceptance.
- `docs/V2_PAGE_PRODUCT_EVIDENCE_LEDGER.zh-CN.md` records PS4 as `visible-pass / user-open`, not as complete settings/tutorial/loading.
- No GLM repair slice is required for current visible PS4 surfaces unless the cited focused specs fail or future-visible pause-origin settings/help, real settings options, or briefing failure/cancel UI appear.

### BF1 Live-Queue Proof Scope Reconciliation

Status: `done`.

Milestone: `V2 credible page-product vertical slice`.
Gate: `BF1`.
Proof target: BF1 closeout requires unit visibility, camera/HUD, scale footprint sanity, and unit presence proof without V3 readability overclaim.
Why now: Task V2-BF1 is ready in the GLM queue, so the scope mismatch should be fixed before it is dispatched and produces incomplete evidence.
Stop condition: The future GLM BF1 prompt or queue card cites `unit-visibility`, `m3-camera-hud`, `m3-scale-measurement`, and `unit-presence` proof, or BF1 remains blocked for incomplete scope.

Goal:

Reconcile the GLM BF1 ready task with the current BF1 proof packet before dispatch or acceptance.

Allowed files:

- `docs/GLM_READY_TASK_QUEUE.md`
- `docs/V2_PAGE_PRODUCT_EVIDENCE_LEDGER.zh-CN.md`
- `docs/V2_PAGE_PRODUCT_REMAINING_GATES.zh-CN.md`
- `docs/CODEX_ACTIVE_QUEUE.md` only for closeout sync

Must satisfy:

- Do not reduce BF1 back to a vague readability promise.
- Do not include V3 human opening grammar, asset import, or War3-like visual approval in BF1 closure.
- Keep GLM's implementation authority limited to deterministic proof and narrow proven repairs.

Verification:

```bash
git diff --check -- docs/GLM_READY_TASK_QUEUE.md docs/V2_PAGE_PRODUCT_EVIDENCE_LEDGER.zh-CN.md docs/V2_PAGE_PRODUCT_REMAINING_GATES.zh-CN.md docs/CODEX_ACTIVE_QUEUE.md
```

Closeout:

- `docs/GLM_READY_TASK_QUEUE.md` reclassifies `Task V2-BF1 — Basic Visibility No-Regression Pack` as `ready` with the complete four-proof command: `unit-visibility`, `m3-camera-hud`, `m3-scale-measurement`, and `unit-presence`.
- `docs/V2_PAGE_PRODUCT_REMAINING_GATES.zh-CN.md` now includes the BF1 GLM handoff boundary and rejects two-spec partial proof as closeout.
- `docs/V2_PAGE_PRODUCT_EVIDENCE_LEDGER.zh-CN.md` recorded that BF1 would remain `open` until the four focused specs were actually run and accepted; the 2026-04-14 closeout later moved BF1 to `engineering-pass`.
- GLM repair authority is limited to deterministic proof failures and narrow proven repairs; BF1 still cannot close V3 readability, human opening grammar, asset import, or War3-like visual approval.

### PS1 Front-Door Evidence Closeout Review

Status: `done`.

Milestone: `V2 credible page-product vertical slice`.
Gate: `PS1`.
Proof target: PS1 closes only if normal boot reaches menu/front door, runtime-test bypass remains separate, start current map enters real playing, and source truth aligns.
Why now: The PS1 ledger row is still open for actual closeout evidence, while the live queue work has already shaped the acceptance matrix and proof route.
Stop condition: Done when PS1 has a recorded command-result conclusion or a named blocker, with explicit wording that this is not complete main-menu acceptance.

Goal:

Review the current PS1 proof packet, record the focused command result, and decide whether PS1 can move out of open or must name a missing/failing proof.

Allowed files:

- `docs/FRONT_DOOR_ACCEPTANCE_MATRIX.zh-CN.md`
- `docs/V2_PAGE_PRODUCT_EVIDENCE_LEDGER.zh-CN.md`
- `docs/CODEX_ACTIVE_QUEUE.md`
- `docs/CODEX_ACTIVE_QUEUE.md` only for closeout sync

Must satisfy:

- Use only normal boot, runtime-test bypass, start-current-map, and source-truth proof.
- Keep runtime-test bypass separate from normal visitor evidence.
- Do not use manual map entry to close PS1.
- Do not describe the current shell as a complete main menu.

Verification:

```bash
git diff --check -- docs/FRONT_DOOR_ACCEPTANCE_MATRIX.zh-CN.md docs/V2_PAGE_PRODUCT_EVIDENCE_LEDGER.zh-CN.md docs/CODEX_ACTIVE_QUEUE.md docs/CODEX_ACTIVE_QUEUE.md
```

### PS2 Session-Shell Evidence Closeout Review

Status: `done`.

Milestone: `V2 credible page-product vertical slice`.
Gate: `PS2`.
Proof target: PS2 closes only if pause, setup, results, reload, terminal reset, and transition matrix proof show no stale shell or session leakage.
Why now: The PS2 ledger already has named proof routes, but V2 closeout still needs actual command-result evidence instead of a vague shell claim.
Stop condition: Done when PS2 has a recorded pass/fail closeout and results summary truth remains routed to PS6 while return-to-menu/re-entry remains PS5 or V3.

Goal:

Review the named pause/setup/results/reload/reset regression pack, record current evidence, and split engineering proof from user clarity judgment.

Allowed files:

- `docs/PRODUCT_SHELL_STATE_MAP.zh-CN.md`
- `docs/V2_PAGE_PRODUCT_EVIDENCE_LEDGER.zh-CN.md`
- `docs/CODEX_ACTIVE_QUEUE.md`
- `docs/CODEX_ACTIVE_QUEUE.md` only for closeout sync

Must satisfy:

- Map every visible session seam to a named proof or a named gap.
- Tie stale-state claims to tests or explicit closeout evidence only.
- Keep user clarity judgment separate from engineering stale-state proof.
- Do not use results summary content or return-to-menu/re-entry to close PS2.

Verification:

```bash
git diff --check -- docs/PRODUCT_SHELL_STATE_MAP.zh-CN.md docs/V2_PAGE_PRODUCT_EVIDENCE_LEDGER.zh-CN.md docs/CODEX_ACTIVE_QUEUE.md docs/CODEX_ACTIVE_QUEUE.md
```

### PS6 Results Summary Evidence Closeout Review

Status: `done`.

Milestone: `V2 credible page-product vertical slice`.
Gate: `PS6`.
Proof target: PS6 closes only if visible verdict, duration, live unit/building counts, reload cleanup, terminal reset, and front-door runtime summary are backed by real session state.
Why now: The PS6 field whitelist is defined, but the ledger still needs actual closeout evidence before the V2 blocker can move.
Stop condition: Done when PS6 records current proof or a named missing field, and explicitly rejects ladder, campaign, rank, score, APM, replay, continue-saved-game, and full battle report framing.

Goal:

Review the PS6 results and last-session summary proof route, record current command evidence, and keep the summary alpha-scoped.

Allowed files:

- `docs/FRONT_DOOR_SESSION_SUMMARY_ACCEPTANCE.zh-CN.md`
- `docs/V2_PAGE_PRODUCT_EVIDENCE_LEDGER.zh-CN.md`
- `docs/CODEX_ACTIVE_QUEUE.md`
- `docs/CODEX_ACTIVE_QUEUE.md` only for closeout sync

Must satisfy:

- Retain only fields backed by real session state.
- Reject fake ladder, campaign, rank, score, APM, replay, continue-saved-game, and full postgame framing.
- Keep front-door summary limited to current runtime lightweight facts.
- Record missing command evidence separately from user judgment.

Verification:

```bash
git diff --check -- docs/FRONT_DOOR_SESSION_SUMMARY_ACCEPTANCE.zh-CN.md docs/V2_PAGE_PRODUCT_EVIDENCE_LEDGER.zh-CN.md docs/CODEX_ACTIVE_QUEUE.md docs/CODEX_ACTIVE_QUEUE.md
```

### BF1 Four-Proof Closeout Review

Status: `done`.

Milestone: `V2 credible page-product vertical slice`.
Gate: `BF1`.
Proof target: BF1 closes only when unit visibility, camera/HUD, BF1 scale/footprint sanity, and unit presence proofs are recorded together.
Why now: The BF1 ledger was still open even though the GLM BF1 proof pack was completed, so Codex needed a conservative evidence reconciliation before V2 closeout.
Stop condition: Done when BF1 records the exact four-proof command result or names the missing/failing proof while keeping BF3/BF4/BF5 as V3 residuals.

Goal:

Review the full BF1 basic visibility/no-regression proof packet and record whether BF1 can move from open or must name a missing/failing proof.

Allowed files:

- `docs/V2_PAGE_PRODUCT_EVIDENCE_LEDGER.zh-CN.md`
- `docs/V2_PAGE_PRODUCT_REMAINING_GATES.zh-CN.md`
- `docs/CODEX_ACTIVE_QUEUE.md`
- `docs/GLM_READY_TASK_QUEUE.md`
- `docs/CODEX_ACTIVE_QUEUE.md` only for closeout sync

Must satisfy:

- Do not close BF1 from partial visibility or camera-only proof.
- Do not describe BF1 as War3-like readability or human opening grammar approval.
- Do not treat BF1 as real asset import approval.
- If any proof is missing or failed, leave BF1 open and produce the smallest follow-up repair shape.

Verification:

```bash
git diff --check -- docs/V2_PAGE_PRODUCT_EVIDENCE_LEDGER.zh-CN.md docs/V2_PAGE_PRODUCT_REMAINING_GATES.zh-CN.md docs/CODEX_ACTIVE_QUEUE.md docs/GLM_READY_TASK_QUEUE.md docs/CODEX_ACTIVE_QUEUE.md
```

### PS1 前门证据收口复核

Status: `done`.

Milestone: `V2 credible page-product vertical slice`.
Gate: `PS1`.
Proof target: 只使用 normal boot、runtime-test bypass、start-current-map 和 source-truth 这组证据。
Why now: This directly advances currently open gate PS1.
Stop condition: The listed files are updated and the focused verification passes without widening scope.

Goal:

复核当前 PS1 证据包，记录 focused 命令结果，并判断 PS1 是能从 open 移出，还是必须继续保留缺口。

Allowed files:

- `docs/FRONT_DOOR_ACCEPTANCE_MATRIX.zh-CN.md`
- `docs/V2_PAGE_PRODUCT_EVIDENCE_LEDGER.zh-CN.md`
- `docs/CODEX_ACTIVE_QUEUE.md`
- `docs/CODEX_ACTIVE_QUEUE.md` only for closeout sync

Must satisfy:

- 只使用 normal boot、runtime-test bypass、start-current-map 和 source-truth 这组证据。
- 必须把 runtime-test bypass 和普通用户入口分开描述。
- 不能用 manual map entry 去关闭 PS1。
- 不能把当前 shell 写成完整主菜单。

Verification:

```bash
git diff --check -- docs/FRONT_DOOR_ACCEPTANCE_MATRIX.zh-CN.md docs/V2_PAGE_PRODUCT_EVIDENCE_LEDGER.zh-CN.md docs/CODEX_ACTIVE_QUEUE.md docs/CODEX_ACTIVE_QUEUE.md
```

### PS2 会话壳层证据收口复核

Status: `done`.

Milestone: `V2 credible page-product vertical slice`.
Gate: `PS6`.
Proof target: 每个可见 session seam 都要落到命名 proof 或命名 gap。
Why now: This directly advances currently open gate PS6.
Stop condition: The listed files are updated and the focused verification passes without widening scope.

Goal:

复核 pause/setup/results/reload/reset 相关证据，记录当前结论，并把工程证明和用户体感判断拆开。

Allowed files:

- `docs/PRODUCT_SHELL_STATE_MAP.zh-CN.md`
- `docs/V2_PAGE_PRODUCT_EVIDENCE_LEDGER.zh-CN.md`
- `docs/CODEX_ACTIVE_QUEUE.md`
- `docs/CODEX_ACTIVE_QUEUE.md` only for closeout sync

Must satisfy:

- 每个可见 session seam 都要落到命名 proof 或命名 gap。
- stale-state 说法必须绑定到测试或明确 closeout 证据。
- 用户是否觉得清楚，要和工程 stale-state proof 分开写。
- 不能用 results summary 内容或 return-to-menu/re-entry 去关闭 PS2。

Verification:

```bash
git diff --check -- docs/PRODUCT_SHELL_STATE_MAP.zh-CN.md docs/V2_PAGE_PRODUCT_EVIDENCE_LEDGER.zh-CN.md docs/CODEX_ACTIVE_QUEUE.md docs/CODEX_ACTIVE_QUEUE.md
```

### PS7 对外文案收口同步

Status: `done`.

Milestone: `V2 credible page-product vertical slice`.
Gate: `PS7`.
Proof target: 构建只能写成 V2 page-product alpha / private-playtest candidate。
Why now: This directly advances currently open gate PS7.
Stop condition: The listed files are updated and the focused verification passes without widening scope.

Goal:

同步 README、release/share 文案和当前 V2 gate 状态，确保对外口径只停留在真实边界。

Allowed files:

- `README.md`
- `docs/M6_RELEASE_BRIEF.zh-CN.md`
- `docs/M6_PUBLIC_SHARE_CHECKLIST.zh-CN.md`
- `docs/V2_PAGE_PRODUCT_EVIDENCE_LEDGER.zh-CN.md`
- `docs/CODEX_ACTIVE_QUEUE.md`
- `docs/CODEX_ACTIVE_QUEUE.md` only for closeout sync

Must satisfy:

- 构建只能写成 V2 page-product alpha / private-playtest candidate。
- 不能写 War3 parity、finished product 或 public-ready。
- 对外文案必须和 ledger 保持一致。

Verification:

```bash
git diff --check -- README.md docs/M6_RELEASE_BRIEF.zh-CN.md docs/M6_PUBLIC_SHARE_CHECKLIST.zh-CN.md docs/V2_PAGE_PRODUCT_EVIDENCE_LEDGER.zh-CN.md docs/CODEX_ACTIVE_QUEUE.md docs/CODEX_ACTIVE_QUEUE.md
```

### BF1 四证据包收口复核

Status: `done`.

Milestone: `V2 credible page-product vertical slice`.
Gate: `BF1`.
Proof target: 不能用 partial proof 去关闭 BF1。
Why now: This directly advances currently open gate BF1.
Stop condition: The listed files are updated and the focused verification passes without widening scope.

Goal:

复核 BF1 的四证据包，记录 BF1 现在能不能从 open 移出，还是仍然缺某条 proof。

Allowed files:

- `docs/V2_PAGE_PRODUCT_EVIDENCE_LEDGER.zh-CN.md`
- `docs/V2_PAGE_PRODUCT_REMAINING_GATES.zh-CN.md`
- `docs/GLM_READY_TASK_QUEUE.md`
- `docs/CODEX_ACTIVE_QUEUE.md`
- `docs/CODEX_ACTIVE_QUEUE.md` only for closeout sync

Must satisfy:

- 不能用 partial proof 去关闭 BF1。
- 不能把 BF1 写成 War3-like readability 或 human opening grammar 通过。
- 不能把 BF1 写成真实素材导入通过。
- 如果还缺 proof，要明确指出最小后续任务。

Verification:

```bash
git diff --check -- docs/V2_PAGE_PRODUCT_EVIDENCE_LEDGER.zh-CN.md docs/V2_PAGE_PRODUCT_REMAINING_GATES.zh-CN.md docs/GLM_READY_TASK_QUEUE.md docs/CODEX_ACTIVE_QUEUE.md docs/CODEX_ACTIVE_QUEUE.md
```

Closeout:

- 2026-04-14 complete four-proof command passed `11/11`: `./scripts/run-runtime-tests.sh tests/unit-visibility-regression.spec.ts tests/m3-camera-hud-regression.spec.ts tests/m3-scale-measurement.spec.ts tests/unit-presence-regression.spec.ts --reporter=list`。
- `BF1` ledger status is now `engineering-pass`: worker visibility, camera/HUD, BF1 scale/footprint sanity, and unit presence proofs all passed together, not as partial proof.
- Still missing / forbidden: War3-like readability approval、human opening grammar、真实素材导入、asset approval、地图层次 / spatial grammar、V3 battlefield first-look judgment。

### PS6 结果摘要证据收口复核

Status: `done`.

Milestone: `V2 credible page-product vertical slice`.
Gate: `PS6`.
Proof target: 只保留真实 session state 支撑的字段。
Why now: This directly advances currently open gate PS6.
Stop condition: The listed files are updated and the focused verification passes without widening scope.

Goal:

复核 PS6 的结果页与上局摘要证据，记录当前命令结果，并保持摘要仍然是 alpha 级别的轻量信息。

Allowed files:

- `docs/FRONT_DOOR_SESSION_SUMMARY_ACCEPTANCE.zh-CN.md`
- `docs/V2_PAGE_PRODUCT_EVIDENCE_LEDGER.zh-CN.md`
- `docs/CODEX_ACTIVE_QUEUE.md`
- `docs/CODEX_ACTIVE_QUEUE.md` only for closeout sync

Must satisfy:

- 只保留真实 session state 支撑的字段。
- 拒绝假天梯、假战役、假完整战报等 framing。
- 要把现在已有证据和缺失证据分别写清楚。

Verification:

```bash
git diff --check -- docs/FRONT_DOOR_SESSION_SUMMARY_ACCEPTANCE.zh-CN.md docs/V2_PAGE_PRODUCT_EVIDENCE_LEDGER.zh-CN.md docs/CODEX_ACTIVE_QUEUE.md docs/CODEX_ACTIVE_QUEUE.md
```

Closeout:

- 2026-04-14 focused command passed `13/13`: `./scripts/run-runtime-tests.sh tests/results-shell-summary-contract.spec.ts tests/results-shell-reload-button-contract.spec.ts tests/terminal-shell-reset-contract.spec.ts tests/front-door-last-session-summary-contract.spec.ts tests/front-door-last-session-summary-reset-contract.spec.ts --reporter=list`。
- `PS6` ledger status is now `engineering-pass / user-open`: results verdict、duration、live unit/building counts、reload cleanup、terminal reset 和 front-door runtime last-result tag have focused proof.
- Still missing / forbidden: 用户理解度判断、完整战报、持久化历史、source/duration 搬到 front door、score/kills/APM、replay、continue saved game、campaign、ladder、rank。

### PS2 状态一致性复核

Status: `done`.

Milestone: `V2 credible page-product vertical slice`.
Gate: `PS2`.
Proof target: PS2 session shell 不残留：pause、setup、results、reload、terminal reset 互斥、可重复，且 closeout 绑定实际命令结果。
Why now: BF1 已经是 Codex active、PS6 已经是 Codex ready，GLM 的 PS2 复跑也已完成；PS2 当前最需要的是证据账本和 live queue 的保守一致性判断。
Stop condition: PS2 要么有足够实际命令证据从 open 移出，要么保留 open 并写清唯一最小缺口；不得用 route 定义或 partial proof 代替 closeout。

Goal:

只复核并落账 PS2 的 session shell closeout 状态，不改产品行为、不扩展新 shell 能力。

Allowed files:

- `docs/V2_PAGE_PRODUCT_EVIDENCE_LEDGER.zh-CN.md`
- `docs/V2_PAGE_PRODUCT_REMAINING_GATES.zh-CN.md`
- `docs/CODEX_ACTIVE_QUEUE.md`
- `docs/GLM_READY_TASK_QUEUE.md`
- `docs/CODEX_ACTIVE_QUEUE.md` only for closeout sync

Must satisfy:

- 只处理 PS2，不顺手关闭 PS6、PS7 或 BF1。
- 必须引用实际 focused command 结果；只有 proof route 或 completed 队列文字不够。
- 不能把 session shell 清理写成完整主菜单、return-to-menu 或 re-entry 通过。
- 若证据不足，明确最小后续任务而不是新增泛化 shell 工作。

Verification:

```bash
git diff --check -- docs/V2_PAGE_PRODUCT_EVIDENCE_LEDGER.zh-CN.md docs/V2_PAGE_PRODUCT_REMAINING_GATES.zh-CN.md docs/CODEX_ACTIVE_QUEUE.md docs/GLM_READY_TASK_QUEUE.md docs/CODEX_ACTIVE_QUEUE.md
```

Closeout:

- 2026-04-14 focused command passed `24/24`: `./scripts/run-runtime-tests.sh tests/pause-session-overlay-contract.spec.ts tests/pause-shell-entry-hotkey-contract.spec.ts tests/pause-shell-exit-hotkey-contract.spec.ts tests/pause-shell-reload-button-contract.spec.ts tests/setup-shell-contract.spec.ts tests/setup-shell-live-entry-contract.spec.ts tests/setup-shell-return-path-contract.spec.ts tests/results-shell-reload-button-contract.spec.ts tests/terminal-shell-reset-contract.spec.ts tests/session-shell-transition-matrix.spec.ts --reporter=list`。
- `PS2` ledger status is now `engineering-pass / user-open`: pause entry/resume/reload、pause-to-setup、setup start/return、results reload、terminal entry/reset 和 transition matrix have focused proof.
- Still missing / forbidden: 用户理解度判断、完整主菜单、return-to-menu、re-entry、rematch、完整设置页；results summary 内容继续归 `PS6`，return-to-menu/re-entry 继续归 `PS5`/V3。

### C84 — V3 Transition Gate Sync

Status: `done`.

Goal:

让 V3 gate、ledger 和 bootstrap packet 的 blocker / residual / seed queue 口径完全一致。

Allowed files:

- `docs/V3_BATTLEFIELD_PRODUCT_SHELL_REMAINING_GATES.zh-CN.md`
- `docs/V3_BATTLEFIELD_PRODUCT_SHELL_EVIDENCE_LEDGER.zh-CN.md`
- `docs/V3_TRANSITION_BOOTSTRAP_PACKET.zh-CN.md`
- `docs/CODEX_ACTIVE_QUEUE.md` only for closeout sync

Must satisfy:

- 哪些 gate 真是 V3 blocker
- 哪些 V2 residual 导入到哪个 V3 gate
- 切到 V3 后的首批 Codex / GLM 任务为什么是这几条

Verification:

```bash
git diff --check -- docs/V3_BATTLEFIELD_PRODUCT_SHELL_REMAINING_GATES.zh-CN.md docs/V3_BATTLEFIELD_PRODUCT_SHELL_EVIDENCE_LEDGER.zh-CN.md docs/V3_TRANSITION_BOOTSTRAP_PACKET.zh-CN.md docs/CODEX_ACTIVE_QUEUE.md
```

### C85 — V3 Human Opening Grammar Acceptance Matrix

Status: `done`.

Goal:

把“基地像不像一个 War3-like opening”从主观吐槽变成可重复审查的问题矩阵。

Allowed files:

- `docs/V3_HUMAN_OPENING_GRAMMAR_ACCEPTANCE.zh-CN.md`
- `docs/V3_BATTLEFIELD_PRODUCT_SHELL_REMAINING_GATES.zh-CN.md`
- `docs/V3_BATTLEFIELD_PRODUCT_SHELL_EVIDENCE_LEDGER.zh-CN.md`
- `docs/CODEX_ACTIVE_QUEUE.md` only for closeout sync

Must satisfy:

- TH / 矿 / 树线 / 出口 / 生产区 / 防御区分别看什么
- 哪些失败属于 V3 engineering blocker
- 哪些只属于 user-open verdict

Verification:

```bash
git diff --check -- docs/V3_HUMAN_OPENING_GRAMMAR_ACCEPTANCE.zh-CN.md docs/V3_BATTLEFIELD_PRODUCT_SHELL_REMAINING_GATES.zh-CN.md docs/V3_BATTLEFIELD_PRODUCT_SHELL_EVIDENCE_LEDGER.zh-CN.md docs/CODEX_ACTIVE_QUEUE.md
```

### C86 — V3 Product-Shell Clarity Routing Brief

Status: `done`.

Goal:

把 V3 product-shell clarity 的边界写清楚，避免 GLM 被模糊 shell 任务拖进大改。

Allowed files:

- `docs/V3_PRODUCT_SHELL_CLARITY_ROUTING.zh-CN.md`
- `docs/V3_BATTLEFIELD_PRODUCT_SHELL_REMAINING_GATES.zh-CN.md`
- `docs/V3_TRANSITION_BOOTSTRAP_PACKET.zh-CN.md`
- `docs/CODEX_ACTIVE_QUEUE.md` only for closeout sync

Must satisfy:

- 哪些属于 front-door hierarchy/source truth
- 哪些属于 return-to-menu / re-entry
- 哪些属于 briefing/loading explanation
- 哪些属于 menu quality / user gate

Verification:

```bash
git diff --check -- docs/V3_PRODUCT_SHELL_CLARITY_ROUTING.zh-CN.md docs/V3_BATTLEFIELD_PRODUCT_SHELL_REMAINING_GATES.zh-CN.md docs/V3_TRANSITION_BOOTSTRAP_PACKET.zh-CN.md docs/CODEX_ACTIVE_QUEUE.md
```

Closeout:

- Added `docs/V3_PRODUCT_SHELL_CLARITY_ROUTING.zh-CN.md` to split product-shell clarity into front-door hierarchy/source truth, return-to-menu/re-entry, briefing/loading explanation, and menu quality/user gate routing.
- Updated `docs/V3_BATTLEFIELD_PRODUCT_SHELL_REMAINING_GATES.zh-CN.md` so V3 product-shell gates reference the routing brief and reject generic shell rewrites.
- Updated `docs/V3_TRANSITION_BOOTSTRAP_PACKET.zh-CN.md` so V3 seed tasks explain why GLM return/re-entry work is bounded to `V3-PS2` and why menu quality remains a user-gated review surface.

### C87 — V3 First-Look Approval Packet

Status: `done`.

Goal:

给 V3 的人眼 gate 准备统一 review 包，不再靠聊天碎片裁决。

Allowed files:

- `docs/V3_FIRST_LOOK_APPROVAL_PACKET.zh-CN.md`
- `docs/V3_BATTLEFIELD_PRODUCT_SHELL_EVIDENCE_LEDGER.zh-CN.md`
- `docs/V3_TRANSITION_BOOTSTRAP_PACKET.zh-CN.md`
- `docs/CODEX_ACTIVE_QUEUE.md` only for closeout sync

Must satisfy:

- battlefield first-look 该看什么
- product-shell clarity 该看什么
- 允许的 verdict 和后续路由

Verification:

```bash
git diff --check -- docs/V3_FIRST_LOOK_APPROVAL_PACKET.zh-CN.md docs/V3_BATTLEFIELD_PRODUCT_SHELL_EVIDENCE_LEDGER.zh-CN.md docs/V3_TRANSITION_BOOTSTRAP_PACKET.zh-CN.md docs/CODEX_ACTIVE_QUEUE.md
```

### 战场空间语法验收包

Status: `done`.

Milestone: `V3.1 battlefield + product-shell clarity`.
Gate: `V3-BG1`.
Proof target: 关闭 V3-BG1 所需的布局说明、默认镜头截图要求、focused regression 清单和审查清单一致性。
Why now: BF1 已经只作为基础可见性工程通过；用户指出地图仍平、比例和空间关系不像 War3，下一步必须把空间语法先定清楚。
Stop condition: 文档明确 TH、金矿、树线、出口、兵营、农场、塔之间的关系标准，并列出不能关闭 BG1 的 partial proof。

Goal:

定义 V3.1 默认战场空间语法的接受、退回和后移规则，并给 GLM 可执行的最小证明形状。

Allowed files:

- `docs/V3_BATTLEFIELD_GRAMMAR_ACCEPTANCE.zh-CN.md`
- `docs/CODEX_ACTIVE_QUEUE.md` only for closeout sync

Must satisfy:

- 只处理 V3-BG1，不关闭 RD1、CH1 或真实素材导入。
- 必须把 BF1 basic visibility 和 V3 battlefield grammar 分开。
- 必须包含默认镜头截图、布局说明、focused regression、审查清单四类证据。

Verification:

```bash
git diff --check -- docs/V3_BATTLEFIELD_GRAMMAR_ACCEPTANCE.zh-CN.md docs/CODEX_ACTIVE_QUEUE.md
```

Closeout:

- Added `docs/V3_BATTLEFIELD_GRAMMAR_ACCEPTANCE.zh-CN.md` as the V3-BG1 acceptance packet for TH、金矿、树线、出口、兵营、农场、塔空间语法。
- The packet separates BF1 basic visibility from V3 battlefield grammar and states that BF1 proof cannot close BG1.
- The packet requires four evidence classes before BG1 closeout: 默认镜头截图、布局说明、focused regression、审查清单.
- The packet keeps RD1、CH1、AV1、UA1 out of scope and gives GLM a bounded proof / repair shape.

### 默认镜头可读性审查包

Status: `done`.

Milestone: `V3.1 battlefield + product-shell clarity`.
Gate: `V3-RD1`.
Proof target: 关闭 V3-RD1 所需的截图包、测量 proof、focused regressions 和 pass/pass-with-tuning/blocked/rejected 记录。
Why now: 当前 BF1 只证明看得见、不坍缩；V3.1 需要回答默认镜头下是否真的可辨认。
Stop condition: 审查包写清每类对象的证据字段、截图要求、测试引用和不能用纯尺寸数据冒充人眼可读性的规则。

Goal:

定义 worker、footman、Town Hall、Barracks、Farm、Tower、Goldmine、tree line、terrain aid 的可读性证据格式。

Allowed files:

- `docs/V3_DEFAULT_CAMERA_READABILITY_REVIEW.zh-CN.md`
- `docs/CODEX_ACTIVE_QUEUE.md` only for closeout sync

Must satisfy:

- 只处理 V3-RD1，不把基础可见性重复写成可读性通过。
- 必须保留用户或目标 tester 的 readability verdict 字段。
- 必须明确真实素材导入仍属于 V3-AV1 或后续资产流程。

Verification:

```bash
git diff --check -- docs/V3_DEFAULT_CAMERA_READABILITY_REVIEW.zh-CN.md docs/CODEX_ACTIVE_QUEUE.md
```

### 素材回退清单收口

Status: `done`.

Milestone: `V3.1 battlefield + product-shell clarity`.
Gate: `V3-AV1`.
Proof target: 关闭 V3-AV1 条件 gate 所需的合法来源类别、fallback id、缺图处理、禁止导入规则和交接边界。
Why now: V3.1 会继续触碰战场可读性和菜单质量；没有 manifest 会把视觉推进和素材批准混在一起。
Stop condition: manifest brief 写清哪些素材可用、哪些必须 fallback、哪些仍需用户批准，并明确 GLM 不能越权导入。

Goal:

为 V3.1 battlefield 和 product-shell clarity 建立一份最小素材 manifest 与回退路线。

Allowed files:

- `docs/V3_ASSET_FALLBACK_MANIFEST.zh-CN.md`
- `docs/CODEX_ACTIVE_QUEUE.md` only for closeout sync

Must satisfy:

- 只处理 V3-AV1，不把素材方向判断交给 GLM。
- 必须区分 legal proxy、fallback、hybrid、blocked 四类状态。
- 必须明确没有 approved packet 时不能导入真实素材。

Verification:

```bash
git diff --check -- docs/V3_ASSET_FALLBACK_MANIFEST.zh-CN.md docs/CODEX_ACTIVE_QUEUE.md
```

Closeout:

- Added `docs/V3_ASSET_FALLBACK_MANIFEST.zh-CN.md` as the V3-AV1 manifest brief for battlefield、product-shell、and shared visual fallback surfaces.
- The manifest distinguishes `legal-proxy`、`fallback`、`hybrid`、and `blocked` states.
- The manifest states that no real / third-party asset may be imported without an approved packet.
- The manifest keeps素材方向、授权判断、真实素材批准 out of GLM ownership and limits GLM to approved packet or explicit fallback execution.

### 可玩入口焦点验收包

Status: `done`.

Milestone: `V3.1 battlefield + product-shell clarity`.
Gate: `V3-PS1`.
Proof target: 关闭 V3-PS1 所需的入口层级、行动可用性、disabled/absent 分支、source truth 和 no fake route 证据。
Why now: V2 已经证明前门真实，但用户仍指出菜单质量弱；V3.1 需要把入口焦点和产品感作为独立 gate。
Stop condition: 验收包列出 accept/defer/reject 规则，并能直接指导 GLM 做 bounded menu shell slice。

Goal:

定义当前可玩入口怎样成为清晰焦点，同时保持 source、mode、start path 真实，不制造同权假入口。

Allowed files:

- `docs/V3_PRODUCT_SHELL_FOCUS_ACCEPTANCE.zh-CN.md`
- `docs/CODEX_ACTIVE_QUEUE.md` only for closeout sync

Must satisfy:

- 只处理 V3-PS1，不顺手关闭 PS2、PS3 或 PS4。
- 必须拒绝 campaign、ladder、完整模式池和 fake 同权入口。
- 必须保留用户对主菜单质量的最终判断。

Verification:

```bash
git diff --check -- docs/V3_PRODUCT_SHELL_FOCUS_ACCEPTANCE.zh-CN.md docs/CODEX_ACTIVE_QUEUE.md
```

Closeout:

- Added `docs/V3_PRODUCT_SHELL_FOCUS_ACCEPTANCE.zh-CN.md` as the V3-PS1 acceptance packet for playable-entry focus、source truth、disabled/absent branches、and no fake routes.
- The packet rejects campaign、ladder、完整模式池、multiplayer、profile/history、and other fake same-rank routes unless absent or truthfully disabled.
- The packet defines accept / accept-with-debt / defer / reject / blocked-by-product-decision routing for bounded menu shell slices.
- The packet keeps PS2 return/re-entry、PS3 briefing/loading、and PS4/PS5 menu-quality/user judgment out of scope.

### V3 BG1 战场空间语法收口复核

Status: `done`.

Milestone: `V3.1 battlefield + product-shell clarity`.
Gate: `V3-BG1`.
Proof target: V3-BG1 的布局说明、默认镜头截图、focused regression 和审查清单必须对成同一套空间语法结论。
Why now: V3 当前 live queue 已空，但 opening grammar 仍是硬 blocker；需要一个新标题的 closeout review 接棒，而不是再空等旧任务解冻。
Stop condition: 文档给出 pass / blocked / insufficient-evidence 结论，并点名最小后续 repair 或 proof。

Goal:

复核默认镜头下 TH、金矿、树线、出口、兵营、农场、塔的空间语法证据，并把 still-open 原因压成最小后续口径。

Allowed files:

- `docs/V3_BATTLEFIELD_GRAMMAR_ACCEPTANCE.zh-CN.md`
- `docs/V3_BATTLEFIELD_PRODUCT_SHELL_REMAINING_GATES.zh-CN.md`
- `docs/V3_BATTLEFIELD_PRODUCT_SHELL_EVIDENCE_LEDGER.zh-CN.md`
- `docs/CODEX_ACTIVE_QUEUE.md`
- `docs/CODEX_ACTIVE_QUEUE.md` only for closeout sync

Must satisfy:

- 只处理 V3-BG1，不关闭 V3-RD1、V3-CH1、V3-AV1 或 V3-UA1。
- 必须把 BF1 基础可见性通过和 V3-BG1 空间语法 through 分开写。
- 结论必须落到具体缺口，不能再写成“地图还需继续优化”这种泛话。

Verification:

```bash
git diff --check -- docs/V3_BATTLEFIELD_GRAMMAR_ACCEPTANCE.zh-CN.md docs/V3_BATTLEFIELD_PRODUCT_SHELL_REMAINING_GATES.zh-CN.md docs/V3_BATTLEFIELD_PRODUCT_SHELL_EVIDENCE_LEDGER.zh-CN.md docs/CODEX_ACTIVE_QUEUE.md docs/CODEX_ACTIVE_QUEUE.md
```

Closeout:

- `docs/V3_BATTLEFIELD_GRAMMAR_ACCEPTANCE.zh-CN.md` now records a 2026-04-14 `insufficient-evidence` closeout review for `V3-BG1`.
- `docs/V3_BATTLEFIELD_PRODUCT_SHELL_REMAINING_GATES.zh-CN.md` keeps `V3-BG1` as a V3 blocker and names the exact missing evidence: same-build raw/annotated default-camera screenshots、layout explanation、BG1 focused regression、filled checklist.
- `docs/V3_BATTLEFIELD_PRODUCT_SHELL_EVIDENCE_LEDGER.zh-CN.md` separates BF1 basic visibility pass from V3-BG1 grammar proof and records the minimum next task as `V3-BG1 opening grammar proof pack`.
- No RD1、CH1、AV1、or UA1 gate was closed or reclassified.

### V3 RD1 默认镜头可读性收口复核

Status: `done`.

Milestone: `V3.1 battlefield + product-shell clarity`.
Gate: `V3-RD1`.
Proof target: V3-RD1 需要一份对象级别的可读性结论，而不是继续复用 BF1 basic visibility 证明。
Why now: 用户已经明确指出比例和第一眼不够 War3；V3-RD1 仍开着，live queue 不能在这里断供。
Stop condition: closeout 记录写清 pass / pass-with-tuning / blocked 的对象级结论，并把失败对象点名。

Goal:

复核 worker、footman、核心建筑、资源点和地形辅助物在默认镜头下的截图、测量和 focused regression 证据。

Allowed files:

- `docs/V3_DEFAULT_CAMERA_READABILITY_REVIEW.zh-CN.md`
- `docs/V3_BATTLEFIELD_PRODUCT_SHELL_REMAINING_GATES.zh-CN.md`
- `docs/V3_BATTLEFIELD_PRODUCT_SHELL_EVIDENCE_LEDGER.zh-CN.md`
- `docs/CODEX_ACTIVE_QUEUE.md`
- `docs/CODEX_ACTIVE_QUEUE.md` only for closeout sync

Must satisfy:

- 只处理 V3-RD1，不把 BF1 basic visibility 写成 readability 已通过。
- 必须保留对象级结论，不能只给一张总截图。
- 素材批准、空间语法和 HUD 协同仍分别留在 V3-AV1、V3-BG1、V3-CH1。

Verification:

```bash
git diff --check -- docs/V3_DEFAULT_CAMERA_READABILITY_REVIEW.zh-CN.md docs/V3_BATTLEFIELD_PRODUCT_SHELL_REMAINING_GATES.zh-CN.md docs/V3_BATTLEFIELD_PRODUCT_SHELL_EVIDENCE_LEDGER.zh-CN.md docs/CODEX_ACTIVE_QUEUE.md docs/CODEX_ACTIVE_QUEUE.md
```

Closeout:

- Added `docs/V3_DEFAULT_CAMERA_READABILITY_REVIEW.zh-CN.md` with a 2026-04-14 `blocked-by-evidence-gap` closeout review for `V3-RD1`.
- The review keeps BF1 basic visibility separate from RD1 default-camera readability.
- worker、footman、Town Hall、Barracks、Farm、Tower、Goldmine、tree line、terrain aid are all object-level `blocked` because raw/annotated screenshots、measurement proof、RD1 focused regression、and readability verdict are missing.
- `docs/V3_BATTLEFIELD_PRODUCT_SHELL_REMAINING_GATES.zh-CN.md` and `docs/V3_BATTLEFIELD_PRODUCT_SHELL_EVIDENCE_LEDGER.zh-CN.md` keep `V3-RD1` open and point to the minimum next task: `V3-RD1 default-camera readability proof pack`.
- 素材批准、空间语法和 HUD 协同仍分别留在 `V3-AV1`、`V3-BG1`、`V3-CH1`。

### V3 PS1 可玩入口焦点收口复核

Status: `done`.

Milestone: `V3.1 battlefield + product-shell clarity`.
Gate: `V3-PS1`.
Proof target: V3-PS1 需要明确 primary action、source truth、mode truth 和 fake 同权入口拒绝规则。
Why now: 菜单仍被用户认为偏弱，但 live queue 已经断掉；先把 V3-PS1 的 closeout 标准压实，GLM 才不会继续瞎扩写。
Stop condition: closeout 记录能直接指导下一条 bounded shell slice，且不把 PS2 / PS3 / PS4 混进来。

Goal:

复核 front door 的主入口焦点、当前地图/模式说明和不可玩分支边界，压实 V3-PS1 的通过口径。

Allowed files:

- `docs/V3_PRODUCT_SHELL_FOCUS_ACCEPTANCE.zh-CN.md`
- `docs/V3_PRODUCT_SHELL_CLARITY_ROUTING.zh-CN.md`
- `docs/V3_BATTLEFIELD_PRODUCT_SHELL_REMAINING_GATES.zh-CN.md`
- `docs/V3_BATTLEFIELD_PRODUCT_SHELL_EVIDENCE_LEDGER.zh-CN.md`
- `docs/CODEX_ACTIVE_QUEUE.md`
- `docs/CODEX_ACTIVE_QUEUE.md` only for closeout sync

Must satisfy:

- 只处理 V3-PS1，不顺手关闭 V3-PS2、V3-PS3 或 V3-PS4。
- 必须拒绝 campaign、ladder、完整模式池和 fake 同权入口。
- 主菜单质感仍是 V3-PS4/V3-PS5，不得在这里偷关。

Verification:

```bash
git diff --check -- docs/V3_PRODUCT_SHELL_FOCUS_ACCEPTANCE.zh-CN.md docs/V3_PRODUCT_SHELL_CLARITY_ROUTING.zh-CN.md docs/V3_BATTLEFIELD_PRODUCT_SHELL_REMAINING_GATES.zh-CN.md docs/V3_BATTLEFIELD_PRODUCT_SHELL_EVIDENCE_LEDGER.zh-CN.md docs/CODEX_ACTIVE_QUEUE.md docs/CODEX_ACTIVE_QUEUE.md
```

Closeout:

- `docs/V3_PRODUCT_SHELL_FOCUS_ACCEPTANCE.zh-CN.md` now records a `blocked-by-evidence-gap` closeout review for `V3-PS1`.
- `docs/V3_PRODUCT_SHELL_CLARITY_ROUTING.zh-CN.md` points the next shell slice to primary action hierarchy、source/mode truth、disabled/absent branch audit、and no fake same-rank route scan.
- `docs/V3_BATTLEFIELD_PRODUCT_SHELL_REMAINING_GATES.zh-CN.md` and `docs/V3_BATTLEFIELD_PRODUCT_SHELL_EVIDENCE_LEDGER.zh-CN.md` keep `V3-PS1` open and name the exact missing evidence.
- No V3-PS2、V3-PS3、V3-PS4、or V3-PS5 gate was closed or reclassified.

### V3 PS3 开局解释层收口复核

Status: `done`.

Milestone: `V3.1 battlefield + product-shell clarity`.
Gate: `V3-PS3`.
Proof target: V3-PS3 需要一份能区分 truthful explanation 与 fake product framing 的明确 closeout 口径。
Why now: V3-PS3 仍开着，而当前候选任务已经跑完；需要一个新标题 closeout review 继续把 gate 往前推。
Stop condition: closeout 记录说明 explanation layer 是否足够、缺什么、下一步由谁接。

Goal:

复核 start path 的 explanation layer 是否真实说明当前 source、mode、controls 或目标，并保持不伪装完整模式池。

Allowed files:

- `docs/V3_BRIEFING_EXPLANATION_ACCEPTANCE.zh-CN.md`
- `docs/V3_PRODUCT_SHELL_CLARITY_ROUTING.zh-CN.md`
- `docs/V3_BATTLEFIELD_PRODUCT_SHELL_REMAINING_GATES.zh-CN.md`
- `docs/V3_BATTLEFIELD_PRODUCT_SHELL_EVIDENCE_LEDGER.zh-CN.md`
- `docs/CODEX_ACTIVE_QUEUE.md`
- `docs/CODEX_ACTIVE_QUEUE.md` only for closeout sync

Must satisfy:

- 只处理 V3-PS3，不把 menu quality、return/re-entry 或 help/settings usefulness 混进来。
- 必须明确哪些文案属于 truthful explanation，哪些是假装 campaign/ladder/完整模式池。
- 结果必须能指导后续 GLM 的 bounded seam，不是泛化 shell 重构。

Verification:

```bash
git diff --check -- docs/V3_BRIEFING_EXPLANATION_ACCEPTANCE.zh-CN.md docs/V3_PRODUCT_SHELL_CLARITY_ROUTING.zh-CN.md docs/V3_BATTLEFIELD_PRODUCT_SHELL_REMAINING_GATES.zh-CN.md docs/V3_BATTLEFIELD_PRODUCT_SHELL_EVIDENCE_LEDGER.zh-CN.md docs/CODEX_ACTIVE_QUEUE.md docs/CODEX_ACTIVE_QUEUE.md
```

Closeout:

- `docs/V3_BRIEFING_EXPLANATION_ACCEPTANCE.zh-CN.md` now records a `blocked-by-evidence-gap` closeout review for `V3-PS3`.
- `docs/V3_PRODUCT_SHELL_CLARITY_ROUTING.zh-CN.md` routes the next PS3 seam to explanation surface proof、copy truth audit、fake framing audit、route placement proof、and focused proof.
- `docs/V3_BATTLEFIELD_PRODUCT_SHELL_REMAINING_GATES.zh-CN.md` and `docs/V3_BATTLEFIELD_PRODUCT_SHELL_EVIDENCE_LEDGER.zh-CN.md` keep `V3-PS3` open and name the exact missing evidence.
- No V3-PS1、V3-PS2、V3-PS4、or V3-PS5 gate was closed or reclassified.

### V3 PS2 返回再开局收口复核

Status: `done`.

Milestone: `V3.1 battlefield + product-shell clarity`.
Gate: `V3-PS2`.
Proof target: V3-PS2 需要明确说明 return/re-entry 哪一段已成立，哪一段仍 blocked。
Why now: 旧的 V3 return/re-entry task 已完成，但 gate 还开着；队列需要一个新的 closeout review 而不是继续空白。
Stop condition: closeout 记录点名 failing seam 或确认通过范围，并保持不把 PS1 / PS3 / PS5 混进去。

Goal:

复核 pause/results 返回 menu、再次 start、source truth 保留和 stale-state cleanup 的当前证据。

Allowed files:

- `docs/V3_PRODUCT_SHELL_CLARITY_ROUTING.zh-CN.md`
- `docs/SESSION_SHELL_GAP_ROUTING.zh-CN.md`
- `docs/V3_BATTLEFIELD_PRODUCT_SHELL_REMAINING_GATES.zh-CN.md`
- `docs/V3_BATTLEFIELD_PRODUCT_SHELL_EVIDENCE_LEDGER.zh-CN.md`
- `docs/CODEX_ACTIVE_QUEUE.md`
- `docs/CODEX_ACTIVE_QUEUE.md` only for closeout sync

Must satisfy:

- 只处理 V3-PS2，不把 summary truth、main-menu quality 或 secondary usefulness 混进来。
- 必须把 return-to-menu、re-entry、source truth、stale cleanup 分开写。
- 不能再用“session shell 已经真实”这种大话替代产品路径 closeout。

Verification:

```bash
git diff --check -- docs/V3_PRODUCT_SHELL_CLARITY_ROUTING.zh-CN.md docs/SESSION_SHELL_GAP_ROUTING.zh-CN.md docs/V3_BATTLEFIELD_PRODUCT_SHELL_REMAINING_GATES.zh-CN.md docs/V3_BATTLEFIELD_PRODUCT_SHELL_EVIDENCE_LEDGER.zh-CN.md docs/CODEX_ACTIVE_QUEUE.md docs/CODEX_ACTIVE_QUEUE.md
```

Closeout:

- `docs/V3_PRODUCT_SHELL_CLARITY_ROUTING.zh-CN.md` now records `V3-PS2` as `blocked`, split into return-to-menu、re-entry、source truth、and stale cleanup.
- `docs/SESSION_SHELL_GAP_ROUTING.zh-CN.md` records which session-shell foundations exist and why they do not close V3-PS2.
- `docs/V3_BATTLEFIELD_PRODUCT_SHELL_REMAINING_GATES.zh-CN.md` and `docs/V3_BATTLEFIELD_PRODUCT_SHELL_EVIDENCE_LEDGER.zh-CN.md` keep `V3-PS2` open and name the failing seams.
- No summary truth、main-menu quality、secondary usefulness、V3-PS1、V3-PS3、or V3-PS5 gate was closed or reclassified.

### V3 CH1 镜头与HUD协同收口复核

Status: `done`.

Milestone: `V3.1 battlefield + product-shell clarity`.
Gate: `V3-CH1`.
Proof target: V3-CH1 需要一份 focused harmony closeout，而不是再复用 BF1 或 RD1 旧证据。
Why now: V3-CH1 仍开着，但 queue 当前已经空了；需要一个新标题 closeout review 继续把 blocker 往前推。
Stop condition: 文档给出 harmony pass / blocked 结论，并绑定对应截图或 focused regression 路线。

Goal:

复核默认镜头 framing、HUD 遮挡、selection ring 和 footprint 提示的当前证据，并点名真实冲突面。

Allowed files:

- `docs/V3_CAMERA_HUD_FOOTPRINT_HARMONY_REVIEW.zh-CN.md`
- `docs/V3_BATTLEFIELD_PRODUCT_SHELL_REMAINING_GATES.zh-CN.md`
- `docs/V3_BATTLEFIELD_PRODUCT_SHELL_EVIDENCE_LEDGER.zh-CN.md`
- `docs/CODEX_ACTIVE_QUEUE.md`
- `docs/CODEX_ACTIVE_QUEUE.md` only for closeout sync

Must satisfy:

- 只处理 V3-CH1，不把 readability、opening grammar 或 asset gate 混进来。
- 必须说明是 framing、HUD、selection ring 还是 footprint 在破坏读图。
- 不能继续只用“object visible”当作 closeout 证据。

Verification:

```bash
git diff --check -- docs/V3_CAMERA_HUD_FOOTPRINT_HARMONY_REVIEW.zh-CN.md docs/V3_BATTLEFIELD_PRODUCT_SHELL_REMAINING_GATES.zh-CN.md docs/V3_BATTLEFIELD_PRODUCT_SHELL_EVIDENCE_LEDGER.zh-CN.md docs/CODEX_ACTIVE_QUEUE.md docs/CODEX_ACTIVE_QUEUE.md
```

Closeout:

- `docs/V3_CAMERA_HUD_FOOTPRINT_HARMONY_REVIEW.zh-CN.md` now records `V3-CH1` as `blocked`, split into framing、HUD、selection ring、and footprint proof gaps.
- `docs/V3_BATTLEFIELD_PRODUCT_SHELL_REMAINING_GATES.zh-CN.md` keeps `V3-CH1` as a V3 blocker and names the missing screenshot / focused regression evidence.
- `docs/V3_BATTLEFIELD_PRODUCT_SHELL_EVIDENCE_LEDGER.zh-CN.md` records that BF1 object visible and RD1 readability cannot close CH1.
- No V3-RD1、V3-BG1、V3-AV1、or V3-UA1 gate was closed or reclassified.

### AV1 素材合法回退复核

Status: `done`.

Milestone: `V3.1 battlefield + product-shell clarity`.
Gate: `V3-AV1`.
Proof target: 关闭 V3-AV1 条件 gate 所需的 legal proxy / fallback / hybrid / blocked 分类、缺图回退记录和无批准素材禁止导入规则。
Why now: 战场可读性和菜单质量都会继续触碰视觉素材；没有一份可复核的素材边界，会把工程修复和素材批准混在一起。
Stop condition: 文档明确哪些素材可用、哪些只能 fallback、哪些 blocked，并点名最小后续批准或替代任务；不得把真实素材导入写成已通过。

Goal:

复核 V3.1 battlefield 和 product-shell clarity 的素材来源、fallback id、缺图处理和禁止导入边界。

Allowed files:

- `docs/V3_ASSET_FALLBACK_MANIFEST.zh-CN.md`
- `docs/V3_BATTLEFIELD_PRODUCT_SHELL_REMAINING_GATES.zh-CN.md`
- `docs/V3_BATTLEFIELD_PRODUCT_SHELL_EVIDENCE_LEDGER.zh-CN.md`
- `docs/CODEX_ACTIVE_QUEUE.md`
- `docs/CODEX_ACTIVE_QUEUE.md` only for closeout sync

Must satisfy:

- 只处理 V3-AV1，不关闭 V3-BG1、V3-RD1 或 V3-CH1。
- 必须区分 legal proxy、fallback、hybrid、blocked 四类状态。
- 必须明确没有 approved packet 时不能导入真实素材。

Verification:

```bash
git diff --check -- docs/V3_ASSET_FALLBACK_MANIFEST.zh-CN.md docs/V3_BATTLEFIELD_PRODUCT_SHELL_REMAINING_GATES.zh-CN.md docs/V3_BATTLEFIELD_PRODUCT_SHELL_EVIDENCE_LEDGER.zh-CN.md docs/CODEX_ACTIVE_QUEUE.md docs/CODEX_ACTIVE_QUEUE.md
```

Closeout:

- `docs/V3_ASSET_FALLBACK_MANIFEST.zh-CN.md` now records a 2026-04-14 `manifest-ready / conditional-open` closeout review for `V3-AV1`.
- The manifest review counts 17 V3.1 asset items: 14 `fallback`, 3 `legal-proxy`, 0 `hybrid`, and 0 `blocked`.
- approved packet remains `none`; real third-party assets、original game extracted assets、and unconfirmed-source assets are still forbidden to import.
- `docs/V3_BATTLEFIELD_PRODUCT_SHELL_REMAINING_GATES.zh-CN.md` and `docs/V3_BATTLEFIELD_PRODUCT_SHELL_EVIDENCE_LEDGER.zh-CN.md` keep AV1 as conditional-open and name the next safe routes: `approved-for-import packet` or `fallback validation pack`.
- No `V3-BG1`、`V3-RD1`、or `V3-CH1` gate was closed or reclassified by this manifest review.

### PS4 主菜单质量评审包

Status: `done`.

Milestone: `V3.1 battlefield + product-shell clarity`.
Gate: `V3-PS4`.
Proof target: 关闭 V3-PS4 条件 gate 所需的主菜单质量 review proof：入口层级清楚、当前可玩行动突出、氛围和行动分组达标，并保留用户最终判断。
Why now: V3-PS1 只处理真实入口焦点；菜单质感仍是独立条件 gate，需要单独的评审口径避免 GLM 扩写 fake mode。
Stop condition: 评审包写清 accept / pass-with-tuning / user-reject / defer 规则，并说明哪些问题回到 PS1、PS3 或 PS4 本身。

Goal:

定义 V3-PS4 的 hierarchy、focal entry、backdrop mood、action grouping 和 user-open verdict 记录方式。

Allowed files:

- `docs/V3_PRODUCT_SHELL_FOCUS_ACCEPTANCE.zh-CN.md`
- `docs/V3_PRODUCT_SHELL_CLARITY_ROUTING.zh-CN.md`
- `docs/V3_FIRST_LOOK_APPROVAL_PACKET.zh-CN.md`
- `docs/V3_BATTLEFIELD_PRODUCT_SHELL_EVIDENCE_LEDGER.zh-CN.md`
- `docs/CODEX_ACTIVE_QUEUE.md`
- `docs/CODEX_ACTIVE_QUEUE.md` only for closeout sync

Must satisfy:

- 只处理 V3-PS4，不顺手关闭 V3-PS1、V3-PS2 或 V3-PS3。
- 不得把 campaign、ladder、完整模式池或 fake 同权入口当作菜单质量提升。
- 必须保留用户或指定 reviewer 的 menu quality verdict 字段。

Verification:

```bash
git diff --check -- docs/V3_PRODUCT_SHELL_FOCUS_ACCEPTANCE.zh-CN.md docs/V3_PRODUCT_SHELL_CLARITY_ROUTING.zh-CN.md docs/V3_FIRST_LOOK_APPROVAL_PACKET.zh-CN.md docs/V3_BATTLEFIELD_PRODUCT_SHELL_EVIDENCE_LEDGER.zh-CN.md docs/CODEX_ACTIVE_QUEUE.md docs/CODEX_ACTIVE_QUEUE.md
```

Closeout:

- Added `docs/V3_FIRST_LOOK_APPROVAL_PACKET.zh-CN.md` with the `V3-PS4` menu quality review packet.
- `docs/V3_PRODUCT_SHELL_CLARITY_ROUTING.zh-CN.md` now routes PS4 menu quality around hierarchy、focal entry、backdrop mood、action grouping、and reviewer verdict.
- `docs/V3_PRODUCT_SHELL_FOCUS_ACCEPTANCE.zh-CN.md` keeps PS1 front-door truth separate from PS4 menu quality.
- `docs/V3_BATTLEFIELD_PRODUCT_SHELL_EVIDENCE_LEDGER.zh-CN.md` records `V3-PS4` as `review-packet-ready / user-open`, not accepted.
- No `V3-PS1`、`V3-PS2`、`V3-PS3`、or `V3-PS5` gate was closed or reclassified.

### BG1 空间语法证据复核

Status: `done`.

Milestone: `V3.1 battlefield + product-shell clarity`.
Gate: `V3-BG1`.
Proof target: 关闭 V3-BG1 所需的空间语法 proof：TH、金矿、树线、出口、兵营、农场、塔形成可解释的 opening grammar，而不是对象随机摆放。
Why now: V3-BG1 仍是 blocker，当前 closeout 是 insufficient-evidence；需要 Codex 在下一轮 proof 后判断证据是否真的对成同一套空间语法结论。
Stop condition: 文档给出 pass / blocked / insufficient-evidence 结论，并点名最小后续 repair 或 proof；不得关闭 RD1、CH1、AV1 或 UA1。

Goal:

复核同一 build 的 raw/annotated 默认镜头截图、布局说明、BG1 focused regression 和已填写 opening grammar 审查清单。

Allowed files:

- `docs/V3_BATTLEFIELD_GRAMMAR_ACCEPTANCE.zh-CN.md`
- `docs/V3_BATTLEFIELD_PRODUCT_SHELL_REMAINING_GATES.zh-CN.md`
- `docs/V3_BATTLEFIELD_PRODUCT_SHELL_EVIDENCE_LEDGER.zh-CN.md`
- `docs/CODEX_ACTIVE_QUEUE.md`
- `docs/CODEX_ACTIVE_QUEUE.md` only for closeout sync

Must satisfy:

- 只处理 V3-BG1，不把默认镜头可读性、HUD 协同或素材批准混进来。
- 必须把 BF1 basic visibility 和 V3-BG1 opening grammar 分开写。
- 结论必须落到具体缺口，不能写成泛化地图优化。

Verification:

```bash
git diff --check -- docs/V3_BATTLEFIELD_GRAMMAR_ACCEPTANCE.zh-CN.md docs/V3_BATTLEFIELD_PRODUCT_SHELL_REMAINING_GATES.zh-CN.md docs/V3_BATTLEFIELD_PRODUCT_SHELL_EVIDENCE_LEDGER.zh-CN.md docs/CODEX_ACTIVE_QUEUE.md docs/CODEX_ACTIVE_QUEUE.md
```

### PS2 返回再开局证据复核

Status: `done`.

Milestone: `V3.1 battlefield + product-shell clarity`.
Gate: `V3-PS2`.
Proof target: 关闭 V3-PS2 所需的 return/re-entry proof：返回后旧对局停止、source truth 保留、再次开始不会继承 selection、placement、results 或 shell 状态。
Why now: V3-PS2 仍是 blocker；V2 PS2 只证明 pause/setup/results/reload/terminal reset 基础 seam，不能替代 V3 产品路径 proof。
Stop condition: closeout 记录逐项给出 pass / blocked / insufficient-evidence，并点名最小 failing surface；不得把 PS1、PS3、PS4 或 PS5 混进来。

Goal:

复核 pause/results 返回 menu、gameplay inactive、source truth preserved、clean re-entry 和 stale cleanup 的证据。

Allowed files:

- `docs/V3_PRODUCT_SHELL_CLARITY_ROUTING.zh-CN.md`
- `docs/SESSION_SHELL_GAP_ROUTING.zh-CN.md`
- `docs/V3_BATTLEFIELD_PRODUCT_SHELL_REMAINING_GATES.zh-CN.md`
- `docs/V3_BATTLEFIELD_PRODUCT_SHELL_EVIDENCE_LEDGER.zh-CN.md`
- `docs/CODEX_ACTIVE_QUEUE.md`
- `docs/CODEX_ACTIVE_QUEUE.md` only for closeout sync

Must satisfy:

- 只处理 V3-PS2，不关闭 summary truth、main-menu quality 或 secondary usefulness。
- 必须把 return-to-menu、re-entry、source truth、stale cleanup 分开写。
- 不能用“session shell 已真实”替代产品路径 closeout。

Verification:

```bash
git diff --check -- docs/V3_PRODUCT_SHELL_CLARITY_ROUTING.zh-CN.md docs/SESSION_SHELL_GAP_ROUTING.zh-CN.md docs/V3_BATTLEFIELD_PRODUCT_SHELL_REMAINING_GATES.zh-CN.md docs/V3_BATTLEFIELD_PRODUCT_SHELL_EVIDENCE_LEDGER.zh-CN.md docs/CODEX_ACTIVE_QUEUE.md docs/CODEX_ACTIVE_QUEUE.md
```

Closeout:

- `docs/V3_PRODUCT_SHELL_CLARITY_ROUTING.zh-CN.md` now records V3-PS2 as still `blocked`, but split more narrowly: return-to-menu、re-entry、source truth are `pass`; stale interaction cleanup remains blocked.
- `docs/SESSION_SHELL_GAP_ROUTING.zh-CN.md` records GLM focused rerun evidence: `tests/session-return-to-menu-contract.spec.ts` + `tests/front-door-reentry-start-loop.spec.ts` passed `6/6`, with build and tsc clean recorded in the GLM closeout.
- `docs/V3_BATTLEFIELD_PRODUCT_SHELL_REMAINING_GATES.zh-CN.md` and `docs/V3_BATTLEFIELD_PRODUCT_SHELL_EVIDENCE_LEDGER.zh-CN.md` keep V3-PS2 open and name the remaining minimum proof: selection、placement、command-card stale cleanup after return/re-entry.
- No summary truth、main-menu quality、secondary usefulness、V3-PS1、V3-PS3、V3-PS4、or V3-PS5 gate was closed or reclassified.

### CH1 镜头HUD协同证据复核

Status: `done`.

Milestone: `V3.1 battlefield + product-shell clarity`.
Gate: `V3-CH1`.
Proof target: 关闭 V3-CH1 所需的 harmony proof：framing、HUD、selection ring、footprint 提示和 gap/choke 感知不会互相破坏。
Why now: V3-CH1 仍是 blocker，且 BF1 object visible 与 RD1 readability 都不能关闭镜头/HUD/footprint 协同问题。
Stop condition: 文档给出 harmony pass / blocked / insufficient-evidence 结论，并说明真实冲突来自 framing、HUD、selection ring 还是 footprint。

Goal:

复核带 HUD 默认镜头 raw/annotated 截图、framing proof、HUD safe-area proof、selection ring proof、footprint proof 和 CH1 focused regression。

Allowed files:

- `docs/V3_CAMERA_HUD_FOOTPRINT_HARMONY_REVIEW.zh-CN.md`
- `docs/V3_BATTLEFIELD_PRODUCT_SHELL_REMAINING_GATES.zh-CN.md`
- `docs/V3_BATTLEFIELD_PRODUCT_SHELL_EVIDENCE_LEDGER.zh-CN.md`
- `docs/CODEX_ACTIVE_QUEUE.md`
- `docs/CODEX_ACTIVE_QUEUE.md` only for closeout sync

Must satisfy:

- 只处理 V3-CH1，不把 readability、opening grammar 或 asset gate 混进来。
- 必须点名 framing、HUD、selection ring 或 footprint 哪一面破坏读图。
- 不能继续用 object visible 当作 closeout 证据。

Verification:

```bash
git diff --check -- docs/V3_CAMERA_HUD_FOOTPRINT_HARMONY_REVIEW.zh-CN.md docs/V3_BATTLEFIELD_PRODUCT_SHELL_REMAINING_GATES.zh-CN.md docs/V3_BATTLEFIELD_PRODUCT_SHELL_EVIDENCE_LEDGER.zh-CN.md docs/CODEX_ACTIVE_QUEUE.md docs/CODEX_ACTIVE_QUEUE.md
```

### PS3 开局解释层证据复核

Status: `done`.

Milestone: `V3.1 battlefield + product-shell clarity`.
Gate: `V3-PS3`.
Proof target: 关闭 V3-PS3 所需的 truthful explanation proof：start path 经过真实解释层，不假装 campaign、ladder、完整教程或完整模式池。
Why now: V3-PS3 仍是 blocker；当前 closeout 是 blocked-by-evidence-gap，缺的是解释层证据而不是泛化 shell 重构。
Stop condition: closeout 说明 explanation layer 是否足够、缺什么、下一步由谁接；不得混入 PS1 入口焦点、PS2 return/re-entry 或 PS4 菜单质量。

Goal:

复核 explanation surface proof、copy truth audit、fake framing audit、route placement proof 和 focused proof。

Allowed files:

- `docs/V3_BRIEFING_EXPLANATION_ACCEPTANCE.zh-CN.md`
- `docs/V3_PRODUCT_SHELL_CLARITY_ROUTING.zh-CN.md`
- `docs/V3_BATTLEFIELD_PRODUCT_SHELL_REMAINING_GATES.zh-CN.md`
- `docs/V3_BATTLEFIELD_PRODUCT_SHELL_EVIDENCE_LEDGER.zh-CN.md`
- `docs/CODEX_ACTIVE_QUEUE.md`
- `docs/CODEX_ACTIVE_QUEUE.md` only for closeout sync

Must satisfy:

- 只处理 V3-PS3，不把 menu quality、return/re-entry 或 help/settings usefulness 混进来。
- 必须明确 truthful explanation 与 fake product framing 的区别。
- 结果必须能指导后续 bounded shell slice。

Verification:

```bash
git diff --check -- docs/V3_BRIEFING_EXPLANATION_ACCEPTANCE.zh-CN.md docs/V3_PRODUCT_SHELL_CLARITY_ROUTING.zh-CN.md docs/V3_BATTLEFIELD_PRODUCT_SHELL_REMAINING_GATES.zh-CN.md docs/V3_BATTLEFIELD_PRODUCT_SHELL_EVIDENCE_LEDGER.zh-CN.md docs/CODEX_ACTIVE_QUEUE.md docs/CODEX_ACTIVE_QUEUE.md
```

Closeout:

- `docs/V3_BRIEFING_EXPLANATION_ACCEPTANCE.zh-CN.md` now records `V3-PS3` as `engineering-pass` for truthful explanation proof.
- `docs/V3_PRODUCT_SHELL_CLARITY_ROUTING.zh-CN.md` routes any remaining PS3 work to bounded copy / placement tuning only, not broad shell redesign.
- `docs/V3_BATTLEFIELD_PRODUCT_SHELL_REMAINING_GATES.zh-CN.md` and `docs/V3_BATTLEFIELD_PRODUCT_SHELL_EVIDENCE_LEDGER.zh-CN.md` record GLM focused evidence: `pre-match-briefing-truth-contract.spec.ts`、`briefing-source-truth-contract.spec.ts`、`briefing-continue-start-contract.spec.ts` passed `9/9`, with build and tsc clean in GLM closeout.
- The proof covers source “程序化地图”、mode “沙盒模式”、truthful controls、no fake labels、briefing start -> play phase、briefing shell hidden、and units spawned.
- No menu quality、return/re-entry、help/settings usefulness、V3-PS1、V3-PS2、V3-PS4、or V3-PS5 gate was closed or reclassified.

### V3 AV1 素材回退清单收口复核

Status: `done`.

Milestone: `V3.1 battlefield + product-shell clarity`.
Gate: `V3-AV1`.
Proof target: V3-AV1 需要一个当前可执行的 manifest closeout：哪些可用、哪些必须 fallback、哪些仍 blocked。
Why now: V3 的战场和菜单都在动视觉第一眼；没有新一轮 closeout review，队列会再次卡死在素材边界上。
Stop condition: manifest closeout 记录当前 legal state、fallback route 和最小后续输入，不再用泛化“等素材”代替。

Goal:

复核 V3-AV1 manifest、缺图路线和禁止导入边界，让视觉 slice 继续可推进但不偷跑真实素材。

Allowed files:

- `docs/V3_ASSET_FALLBACK_MANIFEST.zh-CN.md`
- `docs/V3_BATTLEFIELD_PRODUCT_SHELL_REMAINING_GATES.zh-CN.md`
- `docs/V3_BATTLEFIELD_PRODUCT_SHELL_EVIDENCE_LEDGER.zh-CN.md`
- `docs/CODEX_ACTIVE_QUEUE.md`
- `docs/CODEX_ACTIVE_QUEUE.md` only for closeout sync

Must satisfy:

- 只处理 V3-AV1，不替代 BG1、RD1 或 menu quality。
- 必须保留 legal proxy、fallback、hybrid、blocked 四类状态。
- 没有 approved packet 时，仍禁止导入未批准素材。

Verification:

```bash
git diff --check -- docs/V3_ASSET_FALLBACK_MANIFEST.zh-CN.md docs/V3_BATTLEFIELD_PRODUCT_SHELL_REMAINING_GATES.zh-CN.md docs/V3_BATTLEFIELD_PRODUCT_SHELL_EVIDENCE_LEDGER.zh-CN.md docs/CODEX_ACTIVE_QUEUE.md docs/CODEX_ACTIVE_QUEUE.md
```

Closeout:

- `docs/V3_ASSET_FALLBACK_MANIFEST.zh-CN.md` now records this review as `manifest-ready / conditional-open` with 17 V3.1 asset entries: 14 `fallback`, 3 `legal-proxy`, 0 `hybrid`, 0 `blocked`.
- `docs/V3_BATTLEFIELD_PRODUCT_SHELL_REMAINING_GATES.zh-CN.md` and `docs/V3_BATTLEFIELD_PRODUCT_SHELL_EVIDENCE_LEDGER.zh-CN.md` keep `V3-AV1` conditional-open and state that approved packet remains `none`.
- Real third-party assets、original game extracted assets、web screenshots、and unconfirmed-source assets remain forbidden to import without an approved packet.
- The next safe routes are `approved-for-import packet` or `fallback validation pack`; AV1 does not close BG1、RD1、CH1、PS4、or user gates.

### V3 A1 第一批素材批准交接包

Status: `done`.

Milestone: `V3.1 battlefield + product-shell clarity`.
Gate: `V3-AV1`.
Proof target: V3-AV1 需要 approved-for-import 或批准 fallback 的 handoff packet，GLM 才能继续目录、导入、回退和回归验证。
Why now: Task 41 当前 blocked 的真实原因是缺 Codex 批准包；规则模板已经存在，但缺可执行的第一批交接产物。
Stop condition: 交接包列出 approved candidates、批准的 S0 fallback、license evidence、target keys、拒绝/延期记录和 GLM 可接手范围。

Goal:

根据 A1 战场素材矩阵产出第一批批准交接包；如果没有真实素材可批，就明确批准 S0 fallback、延期项和禁止导入项。

Allowed files:

- `docs/ASSET_APPROVAL_HANDOFF_PACKET.zh-CN.md`
- `docs/BATTLEFIELD_ASSET_INTAKE_MATRIX.zh-CN.md`
- `docs/ASSET_SOURCING_AND_GOVERNANCE.zh-CN.md`
- `docs/V3_ASSET_FALLBACK_MANIFEST.zh-CN.md`
- `docs/V3_BATTLEFIELD_PRODUCT_SHELL_REMAINING_GATES.zh-CN.md`
- `docs/V3_BATTLEFIELD_PRODUCT_SHELL_EVIDENCE_LEDGER.zh-CN.md`
- `docs/CODEX_ACTIVE_QUEUE.md`
- `docs/CODEX_ACTIVE_QUEUE.md` only for closeout sync

Must satisfy:

- 只处理 A1 / V3-AV1，不替代 BG1、RD1、CH1、UA1 或 menu quality。
- 没有真实素材可批准时，必须产出批准的 S0 fallback 包，而不是继续写“等素材”。
- 必须明确 GLM 只能接 approved-for-import 或批准 fallback，不能代做 sourcing、授权判断或风格审批。

Verification:

```bash
git diff --check -- docs/ASSET_APPROVAL_HANDOFF_PACKET.zh-CN.md docs/BATTLEFIELD_ASSET_INTAKE_MATRIX.zh-CN.md docs/ASSET_SOURCING_AND_GOVERNANCE.zh-CN.md docs/V3_ASSET_FALLBACK_MANIFEST.zh-CN.md docs/V3_BATTLEFIELD_PRODUCT_SHELL_REMAINING_GATES.zh-CN.md docs/V3_BATTLEFIELD_PRODUCT_SHELL_EVIDENCE_LEDGER.zh-CN.md docs/CODEX_ACTIVE_QUEUE.md docs/CODEX_ACTIVE_QUEUE.md
```

Closeout:

- `docs/ASSET_APPROVAL_HANDOFF_PACKET.zh-CN.md` now includes `asset-handoff-a1-s0-fallback-001`, a fallback-only A1 battlefield handoff packet.
- `docs/BATTLEFIELD_ASSET_INTAKE_MATRIX.zh-CN.md` records that there are no approved real candidates and that nine A1 categories are approved only as S0 fallback routes.
- `docs/ASSET_SOURCING_AND_GOVERNANCE.zh-CN.md` records that GLM is unblocked only for fallback manifest、catalog、wiring、missing-asset fallback and runtime regression under this packet.
- `docs/V3_ASSET_FALLBACK_MANIFEST.zh-CN.md` links AV1 to the A1 fallback-only handoff while keeping real approved packet as `none`.
- `docs/V3_BATTLEFIELD_PRODUCT_SHELL_REMAINING_GATES.zh-CN.md` and `docs/V3_BATTLEFIELD_PRODUCT_SHELL_EVIDENCE_LEDGER.zh-CN.md` record `V3-AV1` as `fallback-handoff-ready / conditional-open`.
- No real third-party assets、original game extracted assets、web screenshots、or unconfirmed-source assets were approved; no BG1、RD1、CH1、UA1、PS4、or menu quality gate was closed or reclassified.

### C01 — Dual Queue Operating Model

Status: `done`.

Goal: make the operating model explicit so Codex keeps working while GLM works.

Allowed files:

- `docs/CODEX_ACTIVE_QUEUE.md`
- `docs/PROJECT_OPERATING_MODEL.md`
- `PLAN.md`

Done when:

- This Codex queue exists.
- `PROJECT_OPERATING_MODEL.md` defines the dual-queue model.
- `PLAN.md` points to queue documents instead of stale inline queues.

Verification:

```bash
git diff --check
```

### C02 — Review GLM Resource/Supply Pack

Status: `done`.

Trigger: GLM finishes Task 01.

Goal: accept or reject GLM's resource/supply regression pack based on evidence, not report tone.

Review checklist:

- `git status --short` contains only GLM-allowed files.
- Test file has real assertions, not smoke checks.
- Build passed.
- App typecheck passed.
- `./scripts/run-runtime-tests.sh tests/resource-supply-regression.spec.ts --reporter=list` passed.
- If GLM changed gameplay code, each change is backed by a failing test and narrow fix.
- Queue docs are updated after closeout.

Final review note:

- GLM commit `a64833d` replaced the weak stop/override proof with real command-path coverage. Codex reran `./scripts/run-runtime-tests.sh tests/resource-supply-regression.spec.ts --reporter=list`; result was 9/9 green.

Allowed files for Codex review follow-up:

- `docs/GLM_READY_TASK_QUEUE.md`
- `docs/GAMEPLAY_REGRESSION_CHECKLIST.md`
- Any GLM-touched allowed files if a correction is required.

### C03 — Worker Visibility Truth

Status: `done`.

Goal: resolve the user's recurring report: workers appear during load, then become hard to see or invisible after asset/proxy refresh.

Codex owns this because it crosses visual readability, asset refresh, and product judgment.

First implementation direction:

- Add deterministic runtime measurements for worker visual bbox, visible mesh count, opacity, and post-refresh scale.
- Inspect actual live screenshot/human feedback separately from tests.
- Prefer a readable proxy over asset purity if the glTF worker fails default-camera readability.

Likely files:

- `tests/unit-visibility-regression.spec.ts`
- `src/game/UnitVisualFactory.ts`
- `src/game/AssetCatalog.ts`
- `src/game/Game.ts` only if refresh logic is the proven cause

Verification:

```bash
npm run build
npx tsc --noEmit -p tsconfig.app.json
./scripts/run-runtime-tests.sh tests/unit-visibility-regression.spec.ts --reporter=list
```

Human gate:

- User must confirm workers are visible on the live build at default zoom.

Closeout:

- Added `tests/unit-visibility-regression.spec.ts`.
- Fixed W3X map-load camera reset by refocusing on player 0 base after entity spawn.
- Fixed runtime-test lock script so parallel agents cannot release the lock before Playwright starts.
- `npm run test:runtime` passed 33/33 locally after the fix.

### C04 — Live Build Reality Check Protocol

Status: `done`.

Goal: avoid confusing runtime proof with human visual approval.

Deliverable:

- A short doc section defining how user screenshots map to bugs, task cards, or human-gated decisions.
- A rule that visual claims must say `implemented`, `runtime-measured`, or `human-approved` explicitly.

Allowed files:

- `docs/PROJECT_OPERATING_MODEL.md`
- `PLAN.md`

Closeout:

- Added `docs/PROJECT_OPERATING_MODEL.md` section 7.5.
- Defined `human-observed`, `runtime-measured`, `implemented`, and `human-approved`.
- Added the default conversion flow from live-build feedback to tests/tasks/milestone approval.

### C05 — Human Decision Gates

Status: `done`.

Goal: define the large product nodes where the user should intervene, and list the Codex/GLM work bundle that must be completed before each node.

Allowed files:

- `docs/HUMAN_DECISION_GATES.md`
- `docs/CODEX_ACTIVE_QUEUE.md`
- `docs/PROJECT_OPERATING_MODEL.md`
- `PLAN.md`

Done when:

- Gate document exists.
- `PLAN.md` references the gate document.
- `PROJECT_OPERATING_MODEL.md` says user intervention happens at gates, not during routine implementation.

### C06 — PLAN.md Stale Queue Cleanup

Status: `done`.

Goal: stop `PLAN.md` from duplicating old GLM queue state that becomes stale.

Allowed files:

- `PLAN.md`

### C60 — Asset Sourcing Governance Lane

Status: `done`.

Goal: make asset sourcing an explicit production lane instead of a vague future responsibility.

Why this exists:

- The role docs mention Tech Art and Presentation responsibilities.
- The GLM queue explicitly excludes asset sourcing/licensing decisions.
- The Codex queue previously had asset-related bug work, but not “go find the next materials.”

Deliverables:

- `docs/ASSET_SOURCING_AND_GOVERNANCE.zh-CN.md`
- explicit split between Codex-owned sourcing and GLM-owned post-approval import/verification work
- first two batches prioritized: battlefield readability pack and product-shell pack

Allowed files:

- `docs/ASSET_SOURCING_AND_GOVERNANCE.zh-CN.md`
- `docs/CODEX_ACTIVE_QUEUE.md`
- `docs/GLM_READY_TASK_QUEUE.md`
- `docs/DOCS_INDEX.md`

Done when:

- sourcing governance doc exists
- acting owner is explicit
- `C61` and `C62` are on the live queue

### C61 — Battlefield Asset Sourcing Brief

Status: `done`.

Goal: define the first real asset batch for battlefield readability and base grammar.

Scope:

- worker
- footman
- townhall
- barracks
- farm
- tower
- goldmine
- trees / tree line
- ground / path / cliff readability aids

### C62 — Product Shell Asset Sourcing Brief

Status: `done`.

Goal: define the first real asset batch for the page-product shell.

Scope:

- title / main menu
- mode select
- loading / briefing
- pause / system menu
- victory / defeat / results
- settings / help

### C63 — Dual-Lane Runway Publication

Status: `done`.

Goal: replace “keep going” chat memory with explicit long-run runway docs for both lanes.

Primary artifacts:

- `/Users/zhaocong/Documents/war3-re/docs/plans/2026-04-13-glm-stage-a-product-shell-runway.md`
- `/Users/zhaocong/Documents/war3-re/docs/plans/2026-04-13-codex-owner-runway.md`

Allowed files:

- `docs/plans/2026-04-13-glm-stage-a-product-shell-runway.md`
- `docs/plans/2026-04-13-codex-owner-runway.md`
- `docs/CODEX_ACTIVE_QUEUE.md`
- `docs/GLM_READY_TASK_QUEUE.md`

Done when:

- both runway docs exist
- GLM queue has a pre-shaped next runway after the current slice
- Codex queue has pre-shaped owner tasks that do not rely on GLM being idle

Closeout:

- `/Users/zhaocong/Documents/war3-re/docs/plans/2026-04-13-glm-stage-a-product-shell-runway.md` now names the current GLM slice and the ready Task 58-60 front-door runway behind it.
- `/Users/zhaocong/Documents/war3-re/docs/plans/2026-04-13-codex-owner-runway.md` now names C67-C69 as the current non-overlapping Codex owner runway.
- `/Users/zhaocong/Documents/war3-re/docs/GLM_READY_TASK_QUEUE.md` now records C63 runway publication and points GLM dispatch to the explicit queue state.
- This queue marks C63 complete while leaving C67-C69 ready for Codex work that does not require GLM to be idle.

Verification:

```bash
git diff --check -- docs/plans/2026-04-13-glm-stage-a-product-shell-runway.md docs/plans/2026-04-13-codex-owner-runway.md docs/CODEX_ACTIVE_QUEUE.md docs/GLM_READY_TASK_QUEUE.md
```

### C64 — Product Shell State Map

Status: `done`.

Goal: define the truthful state graph from front door to results before broader shell coding starts.

Target artifact:

- `/Users/zhaocong/Documents/war3-re/docs/PRODUCT_SHELL_STATE_MAP.zh-CN.md`

Must cover:

- menu
- mode select
- setup
- loading / briefing
- playing
- paused
- results
- restart / back-to-menu

### C65 — Battlefield Asset Intake Matrix

Status: `done`.

Goal: turn battlefield asset sourcing into a concrete intake matrix instead of a vague “find materials” request.

Target artifact:

- `/Users/zhaocong/Documents/war3-re/docs/BATTLEFIELD_ASSET_INTAKE_MATRIX.zh-CN.md`

Must cover:

- categories
- legal source classes
- readability gates
- fallback rules
- GLM handoff boundary after approval

### C66 — Product Shell Asset Intake Matrix

Status: `done`.

Goal: do the same intake work for product-shell materials.

Target artifact:

- `/Users/zhaocong/Documents/war3-re/docs/PRODUCT_SHELL_ASSET_INTAKE_MATRIX.zh-CN.md`

Must cover:

- title/menu/loading/pause/results/settings/help categories
- legal source classes
- tone/style boundaries
- fallback rules

Done when:

- `PLAN.md` references `docs/CODEX_ACTIVE_QUEUE.md`, `docs/GLM_READY_TASK_QUEUE.md`, and `docs/HUMAN_DECISION_GATES.md`.
- Inline stale entries like old first-five/CI/command queue are removed or rewritten as historical baseline.

### C69 — Battlefield Asset Intake Matrix

Status: `done`.

Goal: make the battlefield intake matrix the real approval surface for the first readable War3-like battlefield batch.

Allowed files:

- `docs/BATTLEFIELD_ASSET_INTAKE_MATRIX.zh-CN.md`
- `docs/ASSET_SOURCING_AND_GOVERNANCE.zh-CN.md`
- `docs/CODEX_ACTIVE_QUEUE.md`

Must define:

- required asset categories
- legal source classes
- hard reject source classes
- fallback rules
- readability acceptance tests
- GLM handoff rules after approval

Done when:

- `docs/BATTLEFIELD_ASSET_INTAKE_MATRIX.zh-CN.md` defines all nine battlefield categories, source classes, hard rejects, category-level readability checks, no-approved-batch fallback, and exact Codex-to-GLM boundary.
- `docs/ASSET_SOURCING_AND_GOVERNANCE.zh-CN.md` points `A1` to the battlefield intake matrix as the controlling approval surface.
- GLM remains blocked from sourcing/licensing/art-direction calls until Codex provides an `approved-for-import` packet.

Verification:

```bash
git diff --check -- docs/BATTLEFIELD_ASSET_INTAKE_MATRIX.zh-CN.md docs/ASSET_SOURCING_AND_GOVERNANCE.zh-CN.md docs/CODEX_ACTIVE_QUEUE.md
```

Closeout:

- `docs/BATTLEFIELD_ASSET_INTAKE_MATRIX.zh-CN.md` defines the nine A1 battlefield categories, legal source classes, hard rejects, category readability checks, no-approved-batch fallback, and Codex-to-GLM handoff boundary.
- `docs/ASSET_SOURCING_AND_GOVERNANCE.zh-CN.md` now makes the battlefield intake matrix the controlling approval surface for `A1`.
- GLM remains blocked from sourcing, licensing, art direction, unapproved import, and human readability approval until Codex provides an `approved-for-import` packet.

### C70 — Product Shell Asset Intake Matrix

Status: `done`.

Goal: make the product-shell intake matrix the real approval surface for title/menu/loading/pause/results/settings/help materials.

Allowed files:

- `docs/PRODUCT_SHELL_ASSET_INTAKE_MATRIX.zh-CN.md`
- `docs/ASSET_SOURCING_AND_GOVERNANCE.zh-CN.md`
- `docs/WAR3_PAGE_PRODUCT_MASTER_PLAN.zh-CN.md`
- `docs/CODEX_ACTIVE_QUEUE.md`

Must define:

- shell-specific asset categories
- legal source rules
- hard reject source classes
- tone/style constraints
- fallback behavior when no approved batch exists

Done when:

- `docs/PRODUCT_SHELL_ASSET_INTAKE_MATRIX.zh-CN.md` defines shell-specific categories, legal source classes, hard rejects, tone/style gates, no-approved-batch fallback, and exact Codex-to-GLM approval boundary.
- `docs/ASSET_SOURCING_AND_GOVERNANCE.zh-CN.md` points `A2` to the product-shell matrix as the controlling intake / approval surface.
- `docs/WAR3_PAGE_PRODUCT_MASTER_PLAN.zh-CN.md` records that shell assets serve the current `V2 credible page-product vertical slice`, not final War3 parity or commercial visual completion.

Verification:

```bash
git diff --check -- docs/PRODUCT_SHELL_ASSET_INTAKE_MATRIX.zh-CN.md docs/ASSET_SOURCING_AND_GOVERNANCE.zh-CN.md docs/WAR3_PAGE_PRODUCT_MASTER_PLAN.zh-CN.md docs/CODEX_ACTIVE_QUEUE.md
```

### C71 — Shell Slice Integration Cadence

Status: `done`.

Goal: define how shell slices are reviewed and folded back so Codex and GLM do not build parallel truths around the front door/session shell work.

Allowed files:

- `docs/CODEX_ACTIVE_QUEUE.md`
- `docs/GLM_READY_TASK_QUEUE.md`
- `docs/M7_MERGE_SEQUENCE_CHECKLIST.zh-CN.md`

Must define:

- maximum number of unreviewed shell slices allowed
- when Codex must stop opening new fronts and integrate
- required regression packs per shell slice family

Done when:

- `docs/M7_MERGE_SEQUENCE_CHECKLIST.zh-CN.md` 定义 shell slice integration cadence，包括一个未 review slice 上限和 stop-to-integrate 触发条件。
- `docs/GLM_READY_TASK_QUEUE.md` 同步 dispatch 规则，避免 GLM shell tasks 跑到 Codex review 前面。
- front-door、session-shell、return-to-menu 三类 regression pack 已明确写出 required focused specs 和 baseline matrix specs。

Verification:

```bash
git diff --check -- docs/CODEX_ACTIVE_QUEUE.md docs/GLM_READY_TASK_QUEUE.md docs/M7_MERGE_SEQUENCE_CHECKLIST.zh-CN.md
```

### C72 — README / Share Copy Reality Sync

Status: `done`.

Goal: sync outward repo wording with the real V2 page-product slice after the current shell intake and merge cadence work settles.

Allowed files:

- `README.md`
- `docs/M6_RELEASE_BRIEF.zh-CN.md`
- `docs/M6_PUBLIC_SHARE_CHECKLIST.zh-CN.md`

Must avoid:

- calling the product complete
- implying a finished front door exists if it does not
- overstating War3 parity

Verification:

```bash
git diff --check -- README.md docs/M6_RELEASE_BRIEF.zh-CN.md docs/M6_PUBLIC_SHARE_CHECKLIST.zh-CN.md
```

### C07 — CI Node 24 Migration

Status: `done`.

Goal: remove GitHub Actions deprecation warnings before they become failures.

Allowed files:

- `.github/workflows/deploy-pages.yml`

Likely change:

- Evaluate whether current actions support Node 24 defaults.
- If safe, set `FORCE_JAVASCRIPT_ACTIONS_TO_NODE24: true` or update action versions as appropriate.

Verification:

```bash
npm run build
npx tsc --noEmit -p tsconfig.app.json
npm run test:runtime
```

GitHub Actions must pass after push.

Closeout:

- Added workflow-level `FORCE_JAVASCRIPT_ACTIONS_TO_NODE24: true`.
- Changed both `actions/setup-node@v4` uses from Node 20 to Node 24.
- CI is now the verification source for Node 24 compatibility because it runs install, build, app typecheck, runtime tests, Pages build, and deploy on GitHub-hosted runners.

### C08 — Game.ts Risk Map

Status: `done`.

Goal: prepare future refactor by mapping `Game.ts` responsibilities before moving code.

Allowed files:

- `docs/GAME_TS_RISK_MAP.md`

Must include:

- Current responsibility zones.
- High-churn methods.
- Test coverage protecting each zone.
- Safe extraction candidates.
- No-go zones until more tests exist.

Closeout:

- Added `docs/GAME_TS_RISK_MAP.md`.
- Marked pathing/footprint, asset replacement/disposal, building agency edge cases, AI recovery, death cleanup, and HUD cache transitions as coverage gaps.
- Defined safe extraction phases and M1 no-go zones.

### C09 — Continuous Execution Loop Hardening

Status: `done`.

Goal: fix the process bug where Codex finished a scoped task, reported, and stopped even though the project had more safe work.

Root cause:

- Codex had queues but no mandatory closeout-to-next-task state machine.
- GLM was treated too often as a test writer instead of an implementation lieutenant.
- GLM stall handling was reactive instead of time-boxed.
- The operating model still had stale visual parallelization guidance from an older phase.

Changes:

- `docs/PROJECT_OPERATING_MODEL.md` now requires a continuous execution loop after every closeout.
- Stop conditions are now narrow and explicit.
- GLM stall handling now has 60s / 120s / 180s escalation.
- GLM development authority is explicit: contract-first product code is allowed, not only tests.
- Current parallelization now points to M1 integration + contract-first gameplay development.

Verification:

```bash
git diff --check
```

Closeout:

- This task changes operating docs only.
- No runtime verification required.

### C10 — M1 Gate Packet Prep

Status: `done`.

Goal: prepare the large milestone packet for `M1 — First Playable RTS Slice` so the user is only asked to judge the project at a meaningful node.

Allowed files:

- `docs/HUMAN_DECISION_GATES.md`
- `docs/GAMEPLAY_REGRESSION_CHECKLIST.md`
- `docs/SMOKE_CHECKLIST.md`
- `README.md` if controls/live URL need clarification

Done when:

- M1 entry criteria are current against the latest runtime packs.
- Remaining objective blockers are listed separately from human visual/taste questions.
- The user checklist is concrete and limited to 5-7 questions.
- Live URL and expected controls are included.

Verification:

```bash
git diff --check
```

Closeout:

- Added a concrete M1 decision packet to `docs/HUMAN_DECISION_GATES.md`.
- Added live URL, local fallback, controls, objective entry criteria, automated proof list, human playtest script, 6 user questions, and failure routing.
- Updated `README.md` with live URL and basic controls.

### C11 — Review GLM Placement Controller Slice

Status: `done`.

Trigger: GLM Task 10 completes or stops.

Goal: accept or reject the `PlacementController` extraction based on behavior preservation and verification, not report tone.

Review checklist:

- Dirty files are limited to GLM allowed scope.
- `PlacementController` only owns placement mode, workers, and ghost mesh lifecycle.
- `enterPlacementMode()`, `exitPlacementMode()`, and `placeBuilding()` behavior is preserved.
- No raycasting, resource spending, spawning, command issuing, path planning, camera, terrain, asset, or AI behavior was moved.
- Selected worker still owns the building order.
- Placement cancel still removes ghost mesh and clears mode/workers.
- Build, app typecheck, and affected runtime packs pass.
- Local browser/runtime leftovers are cleaned.

Required verification:

```bash
npm run build
npx tsc --noEmit -p tsconfig.app.json
./scripts/run-runtime-tests.sh tests/building-agency-regression.spec.ts tests/selection-input-regression.spec.ts tests/pathing-footprint-regression.spec.ts --reporter=list
```

Allowed follow-up files:

- `docs/GLM_READY_TASK_QUEUE.md`
- `docs/GAME_TS_RISK_MAP.md`
- GLM-touched files only if Codex needs a narrow correction.

Closeout:

- Accepted GLM commit `14bd7ba` (`refactor: extract placement controller slice`).
- Scope was limited to `src/game/Game.ts` and `src/game/PlacementController.ts`.
- `PlacementController` owns mode key, ghost mesh, saved workers, exit cleanup, and alive-worker filtering.
- `Game.ts` kept `enterPlacementMode()`, `exitPlacementMode()`, and `placeBuilding()` behavior intact.
- GLM added deprecated compatibility getters for placement state so existing runtime tests continue to inspect the same contract.
- Codex reran:

```bash
npm run build
npx tsc --noEmit -p tsconfig.app.json
./scripts/run-runtime-tests.sh tests/building-agency-regression.spec.ts tests/selection-input-regression.spec.ts tests/pathing-footprint-regression.spec.ts --reporter=list
```

Result: build passed, app typecheck passed, 17/17 affected runtime tests passed.

Note: the verification wrapper command ended with a zsh variable-name mistake during cleanup bookkeeping, but the test output itself was green. Codex then ran cleanup separately and confirmed no local browser/runtime leftovers.

### C12 — M1 Candidate Audit

Status: `done`.

Goal: decide whether the project is ready to present the M1 milestone packet to the user, or whether objective blockers remain.

Prerequisites:

- GLM Task 10 is accepted, rejected, or deferred with clean working tree.
- Latest target commit is known.

Audit steps:

1. Check `git status --short --branch`.
2. Check GitHub Actions for the target commit.
3. Run or confirm `npm run build`.
4. Run or confirm `npx tsc --noEmit -p tsconfig.app.json`.
5. Run or confirm `npm run test:runtime`.
6. Run `./scripts/cleanup-local-runtime.sh`.
7. Check no local Vite, Playwright, Chromium, or `chrome-headless-shell` process remains.
8. If all green, present the M1 packet from `docs/HUMAN_DECISION_GATES.md`.
9. If not green, convert failures into Codex/GLM queue tasks before asking the user to play.

Verification:

```bash
git diff --check
```

Closeout:

- Target code commit: `14bd7ba` (`refactor: extract placement controller slice`).
- Local build: passed.
- Local app typecheck: passed.
- Local affected runtime packs: 17/17 passed.
- GitHub Actions for `14bd7ba`: success.
- Local browser/runtime leftovers: none after cleanup.
- Current next step is the documented M1 user gate, not another tactical bug review.

### C13 — M1 Result And M2 System Replan

Status: `done`.

Goal: record the user's M1 verdict and convert the follow-up issues into system-level direction.

User M1 verdict:

- `pass with visual debt`.

User-confirmed positives:

- Workers and buildings are visible enough for the current slice.
- Controls are broadly obedient.
- Gather, build, train, and fight are possible.
- AI applies pressure.
- Base layout is basically playable.

User-raised issues:

- Barracks construction can stop halfway and cannot resume.
- Arrow tower has no attack power.
- Units lack collision volume.
- Supply cap blocks play but population-building command feedback is weak.
- Construction cancel is missing.
- The higher-level direction is still incomplete: align with Warcraft III systems, not just fix isolated bugs.

System diagnosis:

- This is not a pure visual problem.
- The missing layer is War3-like RTS systems: construction lifecycle, ability/prerequisite UI, static defense combat, cancellation/refund rules, and unit physical presence.

Allowed files:

- `PLAN.md`
- `docs/HUMAN_DECISION_GATES.md`
- `docs/WAR3_SYSTEM_ALIGNMENT_01.md`
- `docs/CODEX_ACTIVE_QUEUE.md`
- `docs/GLM_READY_TASK_QUEUE.md`

Verification:

```bash
git diff --check
```

Closeout:

- Added `docs/WAR3_SYSTEM_ALIGNMENT_01.md`.
- Updated `PLAN.md`, `docs/HUMAN_DECISION_GATES.md`, and `docs/PROJECT_MILESTONES.zh-CN.md`.
- Added GLM Tasks 11-14 for construction lifecycle, tower combat, command disabled reasons, and unit collision.
- M2 is now `War3 Core Systems Alignment`; M3 is the visual/War3-feel pass.

### C14 — Construction Lifecycle Pack Takeover

Status: `done`.

Trigger: GLM Task 11 stalled without creating files.

Goal: implement and verify the construction lifecycle pack directly instead of waiting on a stalled external agent.

Review checklist:

- Under-construction building can be resumed by a valid worker.
- Retasking or stopping the builder does not make construction unrecoverable.
- Cancel construction releases footprint.
- Cancel construction releases builder state.
- Cancel construction refunds according to the documented rule.
- Canceling a selected under-construction building leaves selection/HUD in a valid state.
- No resource duplication.
- No unrelated command, AI, visual, or pathing behavior changed.
- Local runtime leftovers are cleaned.

Required verification:

```bash
npm run build
npx tsc --noEmit -p tsconfig.app.json
./scripts/run-runtime-tests.sh tests/construction-lifecycle-regression.spec.ts tests/building-agency-regression.spec.ts tests/resource-supply-regression.spec.ts tests/death-cleanup-regression.spec.ts --reporter=list
```

Closeout:

- Added `tests/construction-lifecycle-regression.spec.ts`.
- Added minimal construction resume path and right-click resume for friendly under-construction buildings.
- Added under-construction cancel with deterministic `floor(75%)` refund.
- Added selected-building cancel button and HUD cache invalidation.
- Added construction pack to `npm run test:runtime`.
- Verification passed: build, app typecheck, construction pack 6/6, affected construction/building/resource/death pack 25/25.

### C15 — M2 Systems Architecture Slice

Status: `done`.

Goal: define the medium-term architecture direction for War3-like systems before too many one-off fixes accumulate.

Deliverable:

- A concise system architecture note describing how these should converge:
  - order lifecycle
  - ability command cards
  - construction lifecycle
  - combat weapons
  - unit collision/local avoidance
  - command-card disabled reasons
- Extraction order that does not block M2 implementation.
- Boundaries for what GLM can implement directly vs what Codex must own.

Allowed files:

- `docs/WAR3_SYSTEM_ALIGNMENT_01.md`
- `docs/GAME_TS_RISK_MAP.md`
- `docs/CODEX_ACTIVE_QUEUE.md`

Verification:

```bash
git diff --check
```

Closeout:

- M2 system architecture has been captured in `docs/WAR3_RULE_SYSTEM_ROADMAP.zh-CN.md`.
- The roadmap maps user-reported issues into S1-S7 durable system directions.
- GLM development policy now allows product-code fixes when they are contract-first, file-bounded, and runtime-proven.
- M2 completed baseline packs now cover construction lifecycle, static defense, command-card disabled reasons, unit collision baseline, and combat-control contract.

### C19 — Runtime Harness Sharding Review

Status: `done`.

Trigger: GLM Task22 is in progress.

Goal: accept or reject the sharded runtime gate based on actual script correctness and verification, not the final report.

Review checklist:

- `scripts/run-runtime-suite.sh` covers every spec from `test:runtime:single`.
- No misspelled spec paths.
- Each shard prints name, spec list, elapsed seconds, and pass/fail result.
- Failure exits non-zero at the failing shard.
- `package.json` default `test:runtime` uses the sharded script.
- The old single-command path remains available as `test:runtime:single`.
- `npm run build` passes.
- `npx tsc --noEmit -p tsconfig.app.json` passes.
- `time npm run test:runtime` completes or reports a real failing shard.
- Local Vite, Playwright, Chromium, and OpenClaw browser leftovers are cleaned.

Allowed follow-up files:

- `scripts/run-runtime-suite.sh`
- `package.json`
- `docs/GAMEPLAY_REGRESSION_CHECKLIST.md`
- `docs/GLM_READY_TASK_QUEUE.md`
- `docs/CODEX_ACTIVE_QUEUE.md`

Acceptance command set:

```bash
npm run build
npx tsc --noEmit -p tsconfig.app.json
time npm run test:runtime
FORCE_RUNTIME_CLEANUP=1 ./scripts/cleanup-local-runtime.sh
ps aux | egrep 'node .*vite|playwright|chrome-headless-shell|\.openclaw/browser' | grep -v egrep || true
```

Closeout requirement:

- If GLM pushes Task22, Codex must inspect the diff and rerun at least build, app typecheck, and the sharded runtime suite before marking C19 done.

Closeout:

- Accepted commit `2e7421d` (`test: shard runtime regression gate`).
- `npm run test:runtime` now routes through `scripts/run-runtime-suite.sh`.
- `test:runtime:single` is retained with equivalent 16-spec coverage.
- Full sharded runtime gate passed: 5/5 shards, 103 tests, 779s.
- Codex reran build, app typecheck, diff check, and static coverage parity check before commit/push.

### C20 — M3/M4 Next Work Packet Prep

Status: `done`.

Goal: keep the next product-level work ready so GLM does not idle after Task22.

Decision boundary:

- If M2 gate still has objective runtime failures, continue M2 repair.
- If M2 is objectively green but user has not confirmed the milestone, prepare a compact M2 human gate packet.
- If M2 is accepted, start M3 scale/readability integration before deeper M4 AI work.
- If user prioritizes a playable match over visuals, start M4 Human-vs-AI Alpha loop.

Likely next GLM task shapes:

- M3 Scale Contract Implementation: unify data sources for footprint, collision radius, selection ring radius, health bar width, and model scale.
- M3 Base Grammar Measurement: add deterministic checks for townhall, mine, barracks, tree line, and exit spacing without claiming visual approval.
- M4 Win/Loss Baseline: add victory/defeat state, AI/player base destruction detection, and end-state HUD.
- M4 AI Recovery Pack: prove AI can recover after worker/building loss without bypassing normal rules.

Verification:

```bash
git diff --check
```

Closeout:

- Task23 completed with corrected M3 measurement contract.
- Codex rejected GLM's invalid farm evidence because it measured a construction-scaled farm.
- Corrected final M3 values: `farmOverTH=0.291`, `footmanOverWorker=1.547`, `maxTreeHeightOverTH=1.175`.
- Next GLM task after M4 closeout is Task25: M4 War3 Command Surface Matrix.

### C21 — Dispatch M4 Player Issue Reality Pack

Status: `done`.

Goal: convert the user's latest live-play blockers into deterministic runtime proof and narrow fixes before M4.

Inputs:

- Barracks construction can stop halfway and feel impossible to resume.
- Tower appears to have no attack in live play.
- Units lack meaningful body/collision presence.
- Supply block makes production feel dead.
- Construction cancel is not discoverable enough.
- These must be handled as War3-like order/ability/system alignment gaps, not isolated visual polish.

Codex responsibilities:

- Dispatch Task24 with tight file ownership.
- Review GLM output for real input/DOM assertions, not internal smoke.
- Reject claims that existing internal tests are enough if the user's live path is not covered.
- Keep browser/runtime cleanup enforced after Playwright runs.

Verification:

```bash
git diff --check
```

Closeout:

- M4 player-reported pack accepted after Codex correction.
- Verified locally: build, app typecheck, `m4-player-reported-issues.spec.ts` 6/6, affected construction/static-defense/resource/unit-presence pack 29/29.
- GLM's invalid `Math.max(0, getWorldHeight())` spawn-height change was rejected because it would decouple entities from terrain height instead of proving visibility.

### C22 — Dispatch M4 Command Surface Matrix

Status: `done`.

Goal: turn the user's higher-level complaint into a command-surface matrix so War3-like behavior is defined by selected unit + target + command card state, not by ad hoc fixes.

Inputs:

- User asked that the above problems be treated as a higher-level War3-alignment direction.
- Task24 proved several isolated fixes, but the command surface still needs a matrix contract.

Codex responsibilities:

- Dispatch Task25 to GLM with non-overlapping, test-first ownership.
- Review for real live-like input/DOM paths.
- Continue non-conflicting architecture/roadmap work while GLM runs.

Verification:

```bash
git diff --check
```

Closeout:

- Task25 completed and accepted at commit `6f03a1f`.
- Command-surface matrix is now guarded by 11/11 runtime tests.

### C23 — Dispatch Goldmine Clickability Contract

Status: `done`.

Goal: turn the user's resource-click pain into a stable interaction contract: workers crowding a goldmine must not make the mine effectively unclickable or unselectable.

Inputs:

- User explicitly reported that goldmine interaction remains frustrating when workers surround the mine.
- Task25 fixed right-click gather target priority, but left-click selection / targetability under crowding still needs a higher-level contract.

Codex responsibilities:

- Keep GLM scoped to a minimal spec-first slice.
- Review whether the proof uses real click/selection resolve paths rather than synthetic state writes.
- If GLM stalls again, take over the critical-path fix directly.
- Continue queue maintenance and non-conflicting review work while GLM writes the first failing contract.

Verification:

```bash
git diff --check
./scripts/glm-watch.sh status
```

Closeout:

- GLM received an initial broad prompt and then a narrowed spec-first retry, but produced no file changes after two reframes.
- Codex stopped GLM per stall policy, implemented the fix directly, and verified `tests/command-surface-regression.spec.ts` 13/13 green.

### C24 — M2-M7 Dual-Lane Continuous Execution

Status: `done`.

Goal: keep Codex and GLM continuously productive from `M2` through `M7` by pre-splitting milestone work into non-conflicting lanes and removing milestone handoff idle time.

Plan reference:

- `docs/plans/2026-04-12-m2-m7-dual-lane-execution.md`

Codex lane by milestone:

- `M2`: refresh the gate packet against the latest economy, command-surface, collision, and construction evidence.
- `M3`: own base-grammar, camera, readability, and visual-direction packet assembly.
- `M4`: own match-loop acceptance framing, win/loss integration review, and alpha packet prep.
- `M5`: own content/identity memo, default recommendation, and product-direction writeup.
- `M6`: own release packet, README/known-issues framing, and external-share checklist.
- `M7`: own refactor sequencing, acceptance of zero-behavior-change extractions, and final hardening summary.

GLM lane by milestone:

- finish `Task 08` first
- then `Task 28` / `Task 29` for objective `M3` preparation
- then `Task 30` / `Task 31` for objective `M4` preparation
- then `Task 32` for `M6` live-build smoke proof
- then `Task 33` / `Task 34` / `Task 35` for `M7` hardening

Hard rules:

- Codex must not leave GLM without at least one documented `ready` task after the active task.
- Human gates remain real, but when the user is absent they become recorded packets, not passive-wait points.
- If GLM is active in one lane, Codex must keep advancing the other lane unless a documented blocker exists.

Current progress:

- Added baton-mode rules to `docs/PROJECT_OPERATING_MODEL.md`.
- Added the `M2`-`M7` dual-lane implementation plan in `docs/plans/2026-04-12-m2-m7-dual-lane-execution.md`.
- Added `Task 28` through `Task 35` to `docs/GLM_READY_TASK_QUEUE.md` so GLM has continuous runway after `Task 08`.
- Refreshed `docs/M2_GATE_PACKET.zh-CN.md` so `M2` is documented as objectively ready but human approval can remain deferred while Codex/GLM continue.
- Added draft gate packets for `M3` and `M4` so later milestone handoffs do not require fresh packet writing from scratch.
- Added draft gate packets for `M5` and `M6` so product/release decisions also have prepared input instead of becoming pause points.
- Added `docs/M7_HARDENING_CHECKLIST.zh-CN.md` so the final hardening milestone also has an explicit completion shape.
- Codex repaired the `MovingToBuild` contract so builders can start from a building-edge interaction boundary instead of waiting on a blocked center point; new construction lifecycle regression coverage proves the boundary transition.
- Authoritative local verification on the current worktree is green: `npm run build`, `npx tsc --noEmit -p tsconfig.app.json`, `ai-assets-buildings` shard, and full `npm run test:runtime` (`5/5` shards, `TOTAL: 870s`).
- `Task 28` is now dispatched to GLM, so both lanes are active again instead of pausing after `Task 08`.
- Added `scripts/codex-watch.sh`, `scripts/codex-watch-monitor.sh`, and `scripts/codex-watch-daemon.sh` so the Codex lane also has a tmux-backed continuous worker instead of relying on the heartbeat automation UI.
- Marked heartbeat automation as non-authoritative after the scheduler advanced `next_run_at` without creating a real run; baton mode now treats `codex-watch` plus `glm-watch` as the actual execution backbone.
- Added `scripts/codex-watch-feed.sh` and `scripts/codex-watch-feed-daemon.sh` so Codex docs-only baton tasks auto-dispatch after `READY_FOR_NEXT_TASK` instead of leaving an idle live session waiting for a manual prompt.
- The first docs-only feed list proved too shallow: after seven documents, Codex could still be live but effectively out of runway. The next layer of Codex-owned M4/M6/M7 integration and review tasks is now part of the active queue instead of tribal memory.
- Codex lane produced three new milestone briefs without conflicting with GLM's gameplay lane:
  - `docs/M5_DIRECTION_MEMO.zh-CN.md`
  - `docs/M6_RELEASE_BRIEF.zh-CN.md`
  - `docs/M7_REFACTOR_ACCEPTANCE_BRIEF.zh-CN.md`
- Codex lane then produced a second wave of M4/M6/M7 operating docs without touching GLM gameplay files:
  - `docs/M4_GATE_REVIEW_MATRIX.zh-CN.md`
  - `docs/M4_ALPHA_ISSUE_ROUTING.zh-CN.md`
  - `docs/M6_PRIVATE_PLAYTEST_INVITE_TEMPLATE.zh-CN.md`
  - `docs/M6_FEEDBACK_CAPTURE_TEMPLATE.zh-CN.md`
  - `docs/M7_REFACTOR_REJECTION_PATTERNS.zh-CN.md`
  - `docs/M7_CONTRACT_GAP_CANDIDATES.zh-CN.md`
  - `docs/M2_M7_DEFERRED_JUDGMENT_REGISTER.zh-CN.md`
- Codex refreshed `README.md` into an M6-aware alpha/share entry point and manually dispatched `docs/M6_PUBLIC_SHARE_CHECKLIST.zh-CN.md` into `codex-watch` so the lane would not go idle when the feeder hit queue-empty.
- GLM `Task 30` is locally accepted after Codex reran `npm run build`, `npx tsc --noEmit -p tsconfig.app.json`, `tests/m4-match-loop-regression.spec.ts`, and full `npm run test:runtime` (`5/5` shards, `TOTAL: 896s`).
- After acceptance, Codex immediately dispatched `Task 31 — M4 AI Recovery Pack` to GLM with a tightened no-scope-creep file boundary.
- Codex must now keep at least three ready non-conflicting tasks beyond the current `codex-watch` prompt, so the lane can absorb another `READY_FOR_NEXT_TASK` without falling back to idle status.
- Codex local re-verification for `Task 31` is green on `2026-04-13` (`npm run build`, `npx tsc --noEmit -p tsconfig.app.json`, `tests/m4-ai-recovery-regression.spec.ts` 4/4, cleanup), but the closeout is still under review because the queue detail and the test file currently describe the supply contract differently.

Verification:

```bash
git diff --check
./scripts/codex-watch.sh status
./scripts/glm-watch.sh status
```

## Default Next Action Logic

When Codex becomes free:

1. Check git status, CI status, and GLM status.
2. Check `./scripts/codex-watch.sh status`; if Codex lane is idle or stalled, feed the next non-conflicting queue item into the worker.
3. If GLM has completed, review it before dispatching more GLM work.
4. If user has a fresh pain report, map it to queue or add a task.
5. If GLM is running, start the highest `ready` Codex task that does not conflict with GLM's allowed files.
6. If GLM is idle and no human gate is active, dispatch or directly execute the highest-priority ready task.
7. If Codex changes queue state, commit the queue update before dispatching another GLM task.
8. Never leave both queues without at least one `ready` next task.

### C25 — Review GLM M4 AI Recovery Pack

Status: `watch`.

Trigger: GLM finishes `Task 31`.

Goal: accept or reject the AI recovery pack with local proof, then decide whether `M4` is objectively ready for a short alpha loop or still has unresolved AI debt.

Review checklist:

- `git status --short` contains only the declared `Task 31` write scope plus Codex review follow-up files.
- `tests/m4-ai-recovery-regression.spec.ts` distinguishes bounded recovery from truly terminal economic damage.
- AI recovery uses normal worker/train/resource/supply rules; no hidden bypass or free-state reset.
- Local verification reruns cleanly.
- `docs/GLM_READY_TASK_QUEUE.md` and `docs/M4_GATE_PACKET.zh-CN.md` are updated before `Task 32` is dispatched.

Allowed files for Codex review follow-up:

- `docs/CODEX_ACTIVE_QUEUE.md`
- `docs/GLM_READY_TASK_QUEUE.md`
- `docs/M4_GATE_PACKET.zh-CN.md`
- `docs/GAMEPLAY_REGRESSION_CHECKLIST.md`
- any `Task 31`-allowed GLM-touched file if a narrow correction is required

Verification:

```bash
npm run build
npx tsc --noEmit -p tsconfig.app.json
./scripts/run-runtime-tests.sh tests/m4-ai-recovery-regression.spec.ts --reporter=list
FORCE_RUNTIME_CLEANUP=1 ./scripts/cleanup-local-runtime.sh
```

### C26 — M4 AI Recovery Acceptance Brief

Status: `active`.

Goal: create `docs/M4_AI_RECOVERY_ACCEPTANCE_BRIEF.zh-CN.md` so `M4` has a standalone brief for what AI recovery objectively proves and what still remains human alpha judgment.

Allowed files:

- `docs/M4_AI_RECOVERY_ACCEPTANCE_BRIEF.zh-CN.md`

Read as needed:

- `docs/M4_GATE_PACKET.zh-CN.md`
- `docs/M4_ALPHA_ACCEPTANCE_BRIEF.zh-CN.md`
- `docs/GAMEPLAY_REGRESSION_CHECKLIST.md`

Verification:

```bash
git diff --check -- docs/M4_AI_RECOVERY_ACCEPTANCE_BRIEF.zh-CN.md
```

### C27 — GLM Closeout Review Checklist

Status: `active`.

Goal: create `docs/GLM_CLOSEOUT_REVIEW_CHECKLIST.zh-CN.md` so Codex has a reusable review checklist for accepting or rejecting GLM Tasks `31`-`35`.

Allowed files:

- `docs/GLM_CLOSEOUT_REVIEW_CHECKLIST.zh-CN.md`

Read as needed:

- `docs/PROJECT_OPERATING_MODEL.md`
- `docs/CODEX_ACTIVE_QUEUE.md`
- `docs/GLM_READY_TASK_QUEUE.md`

Verification:

```bash
git diff --check -- docs/GLM_CLOSEOUT_REVIEW_CHECKLIST.zh-CN.md
```

### C28 — M6 Release Red Lines

Status: `done`.

Goal: create `docs/M6_RELEASE_RED_LINES.zh-CN.md` so Codex owns the hard no-go conditions for private playtest or public sharing while GLM works on the smoke path.

Allowed files:

- `docs/M6_RELEASE_RED_LINES.zh-CN.md`

Read as needed:

- `docs/M6_RELEASE_BRIEF.zh-CN.md`
- `docs/M6_LIVE_SMOKE_PATH.zh-CN.md`
- `docs/KNOWN_ISSUES.zh-CN.md`

Verification:

```bash
git diff --check -- docs/M6_RELEASE_RED_LINES.zh-CN.md
```

### C29 — M6 Evidence Ledger

Status: `ready`.

Goal: create `docs/M6_EVIDENCE_LEDGER.zh-CN.md` to map each release or private-playtest claim to the concrete proof artifact, command, and failure owner.

Allowed files:

- `docs/M6_EVIDENCE_LEDGER.zh-CN.md`

Read as needed:

- `docs/M6_GATE_PACKET.zh-CN.md`
- `docs/M6_RELEASE_BRIEF.zh-CN.md`
- `docs/GAMEPLAY_REGRESSION_CHECKLIST.md`
- `docs/KNOWN_ISSUES.zh-CN.md`

Verification:

```bash
git diff --check -- docs/M6_EVIDENCE_LEDGER.zh-CN.md
```

### C30 — M7 Extraction Sequence Plan

Status: `ready`.

Goal: create `docs/M7_EXTRACTION_SEQUENCE_PLAN.zh-CN.md` to pre-order safe extraction slices, no-go zones, and rejection triggers before GLM starts `Task 33` and `Task 34`.

Allowed files:

- `docs/M7_EXTRACTION_SEQUENCE_PLAN.zh-CN.md`

Read as needed:

- `docs/GAME_TS_RISK_MAP.md`
- `docs/M7_HARDENING_CHECKLIST.zh-CN.md`
- `docs/GLM_READY_TASK_QUEUE.md`

Verification:

```bash
git diff --check -- docs/M7_EXTRACTION_SEQUENCE_PLAN.zh-CN.md
```

### C31 — M7 Slice Review Log

Status: `ready`.

Goal: create `docs/M7_SLICE_REVIEW_LOG.zh-CN.md` so each extraction slice has a recorded accept/reject/defer note instead of implicit memory.

Allowed files:

- `docs/M7_SLICE_REVIEW_LOG.zh-CN.md`

Read as needed:

- `docs/M7_EXTRACTION_REVIEW_CHECKLIST.zh-CN.md`
- `docs/M7_REFACTOR_ACCEPTANCE_BRIEF.zh-CN.md`
- `docs/GLM_READY_TASK_QUEUE.md`

Verification:

```bash
git diff --check -- docs/M7_SLICE_REVIEW_LOG.zh-CN.md
```

### C32 — Review GLM M6/M7 Hardening Closeouts

Status: `watch`.

Trigger: GLM finishes `Task 32`, `Task 33`, `Task 34`, or `Task 35`.

Goal: accept or reject release-smoke and hardening closeouts based on local evidence, then keep the next GLM and Codex tasks non-empty.

Review checklist:

- `Task 32` maps smoke claims to actual commands, docs, and no-share red lines.
- `Task 33` / `Task 34` show zero-behavior-change boundaries and pass the required verification.
- `Task 35` closes a named coverage gap instead of adding vague test bulk.
- Queue docs reflect the new state before the next dispatch.

Allowed files for Codex review follow-up:

- `docs/CODEX_ACTIVE_QUEUE.md`
- `docs/GLM_READY_TASK_QUEUE.md`
- `docs/GAMEPLAY_REGRESSION_CHECKLIST.md`
- `docs/M6_GATE_PACKET.zh-CN.md`
- `docs/M7_HARDENING_CHECKLIST.zh-CN.md`
- any GLM-touched allowed file if a narrow correction is required

### V3 Codex Main-Menu Reference Brief

Status: `done`.

Goal:

Turn the user's feedback that the current menu is still weak into a concrete War3-referenced main-menu target for the next shell pass.

Allowed files:

- `docs/PRODUCT_SHELL_ACCEPTANCE_BRIEF.zh-CN.md`
- `docs/PROJECT_MASTER_ROADMAP.zh-CN.md`
- `docs/V2_PAGE_PRODUCT_EVIDENCE_LEDGER.zh-CN.md`
- `docs/CODEX_ACTIVE_QUEUE.md` only for closeout sync

Must satisfy:

- Record that the current menu is still not human-accepted as a strong main-menu experience.
- Define which War3 main-menu qualities should be borrowed next: hierarchy, focal entry, backdrop mood, and action grouping.
- Keep V2 truthful front-door closure separate from the stronger V3 menu-quality target.

Verification:

```bash
git diff --check -- docs/PRODUCT_SHELL_ACCEPTANCE_BRIEF.zh-CN.md docs/PROJECT_MASTER_ROADMAP.zh-CN.md docs/V2_PAGE_PRODUCT_EVIDENCE_LEDGER.zh-CN.md docs/CODEX_ACTIVE_QUEUE.md
```

### V3 Codex Battlefield Readability Feedback Routing

Status: `done`.

Goal:

Route the latest user feedback about flat terrain and non-War3-like scale ratios into the next battlefield readability / spatial-grammar work.

Allowed files:

- `docs/V2_PAGE_PRODUCT_EVIDENCE_LEDGER.zh-CN.md`
- `docs/V2_PAGE_PRODUCT_REMAINING_GATES.zh-CN.md`
- `docs/WAR3_ENDSTATE_GAP_ATLAS.zh-CN.md`
- `docs/CODEX_ACTIVE_QUEUE.md` only for closeout sync

Must satisfy:

- Record that the user explicitly called out flat map feel and off scale ratios between town hall, goldmine, worker, and footman.
- Keep this feedback out of BF1 basic visibility closure and route it to `BF3/BF4`.
- Define the next proof / review target as readability and spatial grammar, not just raw visibility.

Verification:

```bash
git diff --check -- docs/V2_PAGE_PRODUCT_EVIDENCE_LEDGER.zh-CN.md docs/V2_PAGE_PRODUCT_REMAINING_GATES.zh-CN.md docs/WAR3_ENDSTATE_GAP_ATLAS.zh-CN.md docs/CODEX_ACTIVE_QUEUE.md
```



### RD1 可读性证据收口复核

Status: `done`.

Milestone: `V3.1 battlefield + product-shell clarity`.
Gate: `V3-RD1`.
Proof target: 关闭 V3-RD1 所需的对象级 raw/annotated 默认镜头截图、measurement proof、focused regression 和用户或目标 tester readability verdict。
Why now: V3-RD1 仍是 blocker，且 GLM 当前已有九类对象可读证明包 in_progress；需要预留 Codex 收口，避免结果停在测试输出。
Stop condition: ledger 和 remaining gates 写清对象级结论与失败对象；不复用 BF1 basic visibility，不关闭 BG1、CH1 或 AV1。

Goal:

复核 worker、footman、Town Hall、Barracks、Farm、Tower、Goldmine、tree line、terrain aid 的对象级证据，判断 RD1 是 pass、blocked 还是仍缺证据。

Allowed files:

- `docs/V3_DEFAULT_CAMERA_READABILITY_REVIEW.zh-CN.md`
- `docs/V3_BATTLEFIELD_PRODUCT_SHELL_REMAINING_GATES.zh-CN.md`
- `docs/V3_BATTLEFIELD_PRODUCT_SHELL_EVIDENCE_LEDGER.zh-CN.md`
- `docs/CODEX_ACTIVE_QUEUE.md`
- `docs/CODEX_ACTIVE_QUEUE.md` only for closeout sync

Must satisfy:

- 只处理 V3-RD1，不把 BF1 basic visibility 写成 readability 已通过。
- 必须保留九类对象的独立结论，不能只给总截图或总分。
- 素材批准、空间语法和 HUD 协同仍分别留在 V3-AV1、V3-BG1、V3-CH1。

Verification:

```bash
git diff --check -- docs/V3_DEFAULT_CAMERA_READABILITY_REVIEW.zh-CN.md docs/V3_BATTLEFIELD_PRODUCT_SHELL_REMAINING_GATES.zh-CN.md docs/V3_BATTLEFIELD_PRODUCT_SHELL_EVIDENCE_LEDGER.zh-CN.md docs/CODEX_ACTIVE_QUEUE.md docs/CODEX_ACTIVE_QUEUE.md
```

Closeout:

- `docs/V3_DEFAULT_CAMERA_READABILITY_REVIEW.zh-CN.md` now records `V3-RD1` as `insufficient-evidence / measurement-proof-pass`.
- `tests/v3-default-camera-readability-proof.spec.ts` is recorded as 10/10 pass, covering the nine-object audit and measurement proof.
- Eight visual objects are recorded as `measurement-pass / screenshot-verdict-missing`; terrain aid remains `insufficient-evidence` because it is still manifest-only with no runtime visual proof.
- `docs/V3_BATTLEFIELD_PRODUCT_SHELL_REMAINING_GATES.zh-CN.md` and `docs/V3_BATTLEFIELD_PRODUCT_SHELL_EVIDENCE_LEDGER.zh-CN.md` keep `V3-RD1` open and name the minimum next task: `V3-RD1 screenshot + tester verdict proof pack`.
- No `V3-BG1`、`V3-CH1`、or `V3-AV1` gate was closed or reclassified.

### CH1 截图包收口复核

Status: `done`.

Milestone: `V3.1 battlefield + product-shell clarity`.
Gate: `V3-CH1`.
Proof target: 关闭 V3-CH1 所需的 harmony proof：7/7 focused regression 与同 build raw/annotated HUD screenshot packet 对齐。
Why now: V3-CH1 的 focused regression 已记录 7/7 pass，但缺截图包；这是从 insufficient-evidence 进入 closeout 的最小 Codex 复核。
Stop condition: 文档给出 harmony pass、blocked 或 insufficient-evidence 结论，并点名冲突来自 framing、HUD、selection ring 还是 footprint。

Goal:

复核带 HUD 默认镜头 raw/annotated 截图是否能支撑 framing、HUD safe area、selection ring、footprint 和 gap/choke 的同屏结论。

Allowed files:

- `docs/V3_CAMERA_HUD_FOOTPRINT_HARMONY_REVIEW.zh-CN.md`
- `docs/V3_BATTLEFIELD_PRODUCT_SHELL_REMAINING_GATES.zh-CN.md`
- `docs/V3_BATTLEFIELD_PRODUCT_SHELL_EVIDENCE_LEDGER.zh-CN.md`
- `docs/CODEX_ACTIVE_QUEUE.md`
- `docs/CODEX_ACTIVE_QUEUE.md` only for closeout sync

Must satisfy:

- 只处理 V3-CH1，不把 readability、opening grammar 或 asset gate 混进来。
- 必须绑定同 build raw/annotated HUD screenshot packet 和 focused regression 结果。
- 不能继续用 object visible 当作 closeout 证据。

Verification:

```bash
git diff --check -- docs/V3_CAMERA_HUD_FOOTPRINT_HARMONY_REVIEW.zh-CN.md docs/V3_BATTLEFIELD_PRODUCT_SHELL_REMAINING_GATES.zh-CN.md docs/V3_BATTLEFIELD_PRODUCT_SHELL_EVIDENCE_LEDGER.zh-CN.md docs/CODEX_ACTIVE_QUEUE.md docs/CODEX_ACTIVE_QUEUE.md
```

Closeout:

- `docs/V3_CAMERA_HUD_FOOTPRINT_HARMONY_REVIEW.zh-CN.md` now records `V3-CH1` as `insufficient-evidence / regression-pass-screenshot-missing`.
- `tests/v3-camera-hud-footprint-harmony.spec.ts` remains recorded as 7/7 pass, covering framing、HUD safe area、selection ring、footprint and exit/gap.
- No actual conflict surface is proven right now; the failing seam is the missing same-build raw/annotated HUD screenshot packet and screenshot-to-command binding.
- `docs/V3_BATTLEFIELD_PRODUCT_SHELL_REMAINING_GATES.zh-CN.md` and `docs/V3_BATTLEFIELD_PRODUCT_SHELL_EVIDENCE_LEDGER.zh-CN.md` keep `V3-CH1` open and name the minimum next task: `V3-CH1 screenshot annotation packet`.
- No `V3-RD1`、`V3-BG1`、or `V3-AV1` gate was closed or reclassified.

### PS1 入口焦点证据收口复核

Status: `done`.

Milestone: `V3.1 battlefield + product-shell clarity`.
Gate: `V3-PS1`.
Proof target: 关闭 V3-PS1 所需的入口层级、当前地图/模式 truth、不可玩分支边界和 no fake same-rank route proof。
Why now: V3-PS1 仍是 blocker，GLM 已有入口焦点证明包 ready；需要 Codex 收口防止菜单质量或 fake mode 被混进 PS1。
Stop condition: closeout 能指导是否关闭 PS1 或点名最小修复；不得关闭 PS2、PS3、PS4 或 PS5。

Goal:

复核 primary action hierarchy、source/mode truth、disabled/absent branch audit 和 no fake route scan 的证据。

Allowed files:

- `docs/V3_PRODUCT_SHELL_FOCUS_ACCEPTANCE.zh-CN.md`
- `docs/V3_PRODUCT_SHELL_CLARITY_ROUTING.zh-CN.md`
- `docs/V3_BATTLEFIELD_PRODUCT_SHELL_REMAINING_GATES.zh-CN.md`
- `docs/V3_BATTLEFIELD_PRODUCT_SHELL_EVIDENCE_LEDGER.zh-CN.md`
- `docs/CODEX_ACTIVE_QUEUE.md`
- `docs/CODEX_ACTIVE_QUEUE.md` only for closeout sync

Must satisfy:

- 必须拒绝 campaign、ladder、完整模式池和 fake 同权入口。
- 主菜单质感仍归 V3-PS4 或用户 first-look，不在 PS1 偷关。
- 只处理当前可玩入口焦点和 source/mode truth。

Verification:

```bash
git diff --check -- docs/V3_PRODUCT_SHELL_FOCUS_ACCEPTANCE.zh-CN.md docs/V3_PRODUCT_SHELL_CLARITY_ROUTING.zh-CN.md docs/V3_BATTLEFIELD_PRODUCT_SHELL_REMAINING_GATES.zh-CN.md docs/V3_BATTLEFIELD_PRODUCT_SHELL_EVIDENCE_LEDGER.zh-CN.md docs/CODEX_ACTIVE_QUEUE.md docs/CODEX_ACTIVE_QUEUE.md
```

Closeout:

- `docs/V3_PRODUCT_SHELL_FOCUS_ACCEPTANCE.zh-CN.md` now records `V3-PS1` as `blocked-by-pending-proof`.
- GLM live queue currently shows `PS1 入口焦点证明包` as `in_progress`; no completed focused command result is available for Codex closeout.
- `docs/V3_PRODUCT_SHELL_CLARITY_ROUTING.zh-CN.md` routes the remaining gap to primary action hierarchy、source/mode truth、disabled/absent branch audit、and no fake same-rank route scan.
- `docs/V3_BATTLEFIELD_PRODUCT_SHELL_REMAINING_GATES.zh-CN.md` and `docs/V3_BATTLEFIELD_PRODUCT_SHELL_EVIDENCE_LEDGER.zh-CN.md` keep `V3-PS1` open.
- No `V3-PS2`、`V3-PS3`、`V3-PS4`、or `V3-PS5` gate was closed or reclassified.

### PS2 残留交互清理复核

Status: `done`.

Milestone: `V3.1 battlefield + product-shell clarity`.
Gate: `V3-PS2`.
Proof target: 关闭 V3-PS2 剩余缺口所需的 stale cleanup proof：selection、placement、command-card 三类状态显式清理。
Why now: V3-PS2 已有 6/6 focused command 覆盖 return/re-entry/source truth；当前唯一最小缺口是 stale cleanup 显式 proof。
Stop condition: closeout 逐项给出 pass、blocked 或 insufficient-evidence，并点名失败发生在 selection、placement 还是 command-card。

Goal:

复核 pause/results 返回 menu 后再次 start 不会继承 selection、placement ghost、command-card、results 或 shell 状态。

Allowed files:

- `docs/V3_PRODUCT_SHELL_CLARITY_ROUTING.zh-CN.md`
- `docs/SESSION_SHELL_GAP_ROUTING.zh-CN.md`
- `docs/V3_BATTLEFIELD_PRODUCT_SHELL_REMAINING_GATES.zh-CN.md`
- `docs/V3_BATTLEFIELD_PRODUCT_SHELL_EVIDENCE_LEDGER.zh-CN.md`
- `docs/CODEX_ACTIVE_QUEUE.md`
- `docs/CODEX_ACTIVE_QUEUE.md` only for closeout sync

Must satisfy:

- 只处理 V3-PS2，不关闭 summary truth、main-menu quality 或 secondary usefulness。
- 必须把 return-to-menu、re-entry、source truth、stale cleanup 分开写。
- 不能用“session shell 已真实”替代产品路径 closeout。

Verification:

```bash
git diff --check -- docs/V3_PRODUCT_SHELL_CLARITY_ROUTING.zh-CN.md docs/SESSION_SHELL_GAP_ROUTING.zh-CN.md docs/V3_BATTLEFIELD_PRODUCT_SHELL_REMAINING_GATES.zh-CN.md docs/V3_BATTLEFIELD_PRODUCT_SHELL_EVIDENCE_LEDGER.zh-CN.md docs/CODEX_ACTIVE_QUEUE.md docs/CODEX_ACTIVE_QUEUE.md
```

Closeout:

- `docs/V3_PRODUCT_SHELL_CLARITY_ROUTING.zh-CN.md` now records `V3-PS2` as `blocked / stale-cleanup-proof-missing`.
- `docs/SESSION_SHELL_GAP_ROUTING.zh-CN.md` splits the current PS2 state into return-to-menu `pass`, re-entry `pass`, source truth `pass`, shell/result cleanup `pass-with-gap`, and stale cleanup gaps.
- The remaining explicit proof gaps are selection cleanup、placement cleanup、and command-card cleanup.
- GLM `PS2 残留交互清理证明包` is currently `ready`, not completed, so Codex cannot close V3-PS2 yet.
- No summary truth、main-menu quality、secondary usefulness、`V3-PS1`、`V3-PS3`、`V3-PS4`、or `V3-PS5` gate was closed or reclassified.



### RD1 截图与可读判断收口复核

Status: `done`.

Milestone: `V3.1 battlefield + product-shell clarity`.
Gate: `V3-RD1`.
Proof target: 关闭 V3-RD1 所需的截图包、对象级 readability verdict，以及 terrain aid runtime visual proof 或明确移出 closeout claim。
Why now: RD1 已有 10/10 focused regression 和八类视觉对象 measurement proof；当前最小缺口只剩截图、tester verdict 和 terrain aid runtime visual。
Stop condition: ledger 和 remaining gates 写清九类对象 pass / blocked / insufficient-evidence；不得复用 BF1 basic visibility，不关闭 BG1、CH1 或 AV1。

Goal:

复核同 build raw/annotated 默认镜头截图、九类对象标注、tester readability verdict 和 terrain aid 处理结论。

Allowed files:

- `docs/V3_DEFAULT_CAMERA_READABILITY_REVIEW.zh-CN.md`
- `docs/V3_BATTLEFIELD_PRODUCT_SHELL_REMAINING_GATES.zh-CN.md`
- `docs/V3_BATTLEFIELD_PRODUCT_SHELL_EVIDENCE_LEDGER.zh-CN.md`
- `docs/CODEX_ACTIVE_QUEUE.md`
- `docs/CODEX_ACTIVE_QUEUE.md` only for closeout sync

Must satisfy:

- 必须保留九类对象的独立结论。
- measurement proof 只能作为辅助证据，不能替代截图或 tester verdict。
- terrain aid 若仍无运行时视觉，必须写清是 blocked 还是移出 RD1 closeout claim。

Verification:

```bash
git diff --check -- docs/V3_DEFAULT_CAMERA_READABILITY_REVIEW.zh-CN.md docs/V3_BATTLEFIELD_PRODUCT_SHELL_REMAINING_GATES.zh-CN.md docs/V3_BATTLEFIELD_PRODUCT_SHELL_EVIDENCE_LEDGER.zh-CN.md docs/CODEX_ACTIVE_QUEUE.md docs/CODEX_ACTIVE_QUEUE.md
```

Closeout:

- `docs/V3_DEFAULT_CAMERA_READABILITY_REVIEW.zh-CN.md` now records `V3-RD1` as `insufficient-evidence / screenshot-verdict-missing`.
- `tests/v3-default-camera-readability-proof.spec.ts` remains recorded as 10/10 pass, and eight visual objects retain valid measurement proof.
- worker、footman、Town Hall、Barracks、Farm、Tower、Goldmine、tree line are each `insufficient-evidence / measurement-pass` because raw/annotated screenshots and tester verdicts are still missing.
- terrain aid is `blocked` under the RD1 runtime visual claim because it is still manifest-only and has not been moved out of the RD1 closeout claim.
- No `V3-BG1`、`V3-CH1`、or `V3-AV1` gate was closed or reclassified.

### PS2 残留清理证据收口复核

Status: `done`.

Milestone: `V3.1 battlefield + product-shell clarity`.
Gate: `V3-PS2`.
Proof target: 关闭 V3-PS2 剩余缺口所需的 stale cleanup proof：selection、placement、command-card 三类状态不继承旧局。
Why now: V3-PS2 已有 6/6 focused proof 覆盖 return-to-menu、re-entry 和 source truth；当前只剩 stale cleanup proof。
Stop condition: closeout 分别记录 return-to-menu、re-entry、source truth、selection cleanup、placement cleanup、command-card cleanup；不得关闭 summary truth、main-menu quality 或 secondary usefulness。

Goal:

复核 return/re-entry 后 selection、placement ghost/build mode、command-card buttons/disabled reasons 是否被显式清理。

Allowed files:

- `docs/V3_PRODUCT_SHELL_CLARITY_ROUTING.zh-CN.md`
- `docs/SESSION_SHELL_GAP_ROUTING.zh-CN.md`
- `docs/V3_BATTLEFIELD_PRODUCT_SHELL_REMAINING_GATES.zh-CN.md`
- `docs/V3_BATTLEFIELD_PRODUCT_SHELL_EVIDENCE_LEDGER.zh-CN.md`
- `docs/CODEX_ACTIVE_QUEUE.md`
- `docs/CODEX_ACTIVE_QUEUE.md` only for closeout sync

Must satisfy:

- 必须把 selection、placement、command-card 三个 stale surface 分开判定。
- 不能用“session shell 已真实”替代产品路径 closeout。
- 不混入 PS1、PS3、PS4 或 PS5。

Verification:

```bash
git diff --check -- docs/V3_PRODUCT_SHELL_CLARITY_ROUTING.zh-CN.md docs/SESSION_SHELL_GAP_ROUTING.zh-CN.md docs/V3_BATTLEFIELD_PRODUCT_SHELL_REMAINING_GATES.zh-CN.md docs/V3_BATTLEFIELD_PRODUCT_SHELL_EVIDENCE_LEDGER.zh-CN.md docs/CODEX_ACTIVE_QUEUE.md docs/CODEX_ACTIVE_QUEUE.md
```

Closeout:

- `docs/V3_PRODUCT_SHELL_CLARITY_ROUTING.zh-CN.md` records `V3-PS2` as `engineering-pass`, split into return-to-menu、re-entry、source truth、selection cleanup、placement cleanup、and command-card cleanup.
- `docs/SESSION_SHELL_GAP_ROUTING.zh-CN.md` binds the closeout to Codex rerun `./scripts/run-runtime-tests.sh tests/v3-product-shell-return-reentry-proof.spec.ts --reporter=list`, 6/6 pass (53.2s).
- `docs/V3_BATTLEFIELD_PRODUCT_SHELL_REMAINING_GATES.zh-CN.md` and `docs/V3_BATTLEFIELD_PRODUCT_SHELL_EVIDENCE_LEDGER.zh-CN.md` move `V3-PS2` engineering proof to pass while keeping user understandability under `V3-PS5`.
- No summary truth、main-menu quality、secondary usefulness、`V3-PS1`、`V3-PS3`、`V3-PS4`、or `V3-PS5` gate was closed by this task.

### AV1 回退目录证据收口复核

Status: `done`.

Milestone: `V3.1 battlefield + product-shell clarity`.
Gate: `V3-AV1`.
Proof target: V3-AV1 的 fallback handoff proof：九类 A1 battlefield target key 都解析到批准 fallback route，真实素材 approved packet 仍为 none 时没有未批准导入。
Why now: AV1 已经 fallback-handoff-ready，但 GLM live queue 仍有 AV1 fallback/catalog 验证任务待完成；Codex 需要预留收口防止素材边界被扩大。
Stop condition: ledger 写清 legal proxy / fallback / hybrid / blocked 数量、approved packet 状态和 GLM 可接手范围；不得关闭 BG1、RD1、CH1、UA1 或 PS4。

Goal:

复核 asset-handoff-a1-s0-fallback-001 的 catalog / manifest / regression 证据，判断 AV1 是否仍 conditional-open。

Allowed files:

- `docs/V3_ASSET_FALLBACK_MANIFEST.zh-CN.md`
- `docs/V3_BATTLEFIELD_PRODUCT_SHELL_REMAINING_GATES.zh-CN.md`
- `docs/V3_BATTLEFIELD_PRODUCT_SHELL_EVIDENCE_LEDGER.zh-CN.md`
- `docs/CODEX_ACTIVE_QUEUE.md`
- `docs/CODEX_ACTIVE_QUEUE.md` only for closeout sync

Must satisfy:

- 必须保留 legal proxy、fallback、hybrid、blocked 四类状态。
- 没有真实 approved packet 时仍禁止导入真实素材。
- 不能把 fallback 目录验证写成可读性、空间语法或菜单质量通过。

Verification:

```bash
git diff --check -- docs/V3_ASSET_FALLBACK_MANIFEST.zh-CN.md docs/V3_BATTLEFIELD_PRODUCT_SHELL_REMAINING_GATES.zh-CN.md docs/V3_BATTLEFIELD_PRODUCT_SHELL_EVIDENCE_LEDGER.zh-CN.md docs/CODEX_ACTIVE_QUEUE.md docs/CODEX_ACTIVE_QUEUE.md
```

Closeout:

- `docs/V3_ASSET_FALLBACK_MANIFEST.zh-CN.md` now records `AV1 回退目录证据收口复核` as `fallback-regression-pass / conditional-open`.
- Codex reran `./scripts/run-runtime-tests.sh tests/v3-asset-fallback-manifest.spec.ts --reporter=list`; result was 6/6 pass (50.0s).
- `docs/V3_BATTLEFIELD_PRODUCT_SHELL_REMAINING_GATES.zh-CN.md` and `docs/V3_BATTLEFIELD_PRODUCT_SHELL_EVIDENCE_LEDGER.zh-CN.md` record 17 traceable V3.1 asset items: 14 fallback、3 legal-proxy、0 hybrid、0 blocked.
- `asset-handoff-a1-s0-fallback-001` remains fallback-only for nine A1 battlefield target keys; approved packet remains `none`，因此真实第三方素材、原版提取素材、网页截图和未确认来源素材仍禁止导入。
- No `V3-BG1`、`V3-RD1`、`V3-CH1`、`V3-UA1`、or `V3-PS4` gate was closed or reclassified by this task.



### RD1 截图判定收口复核

Status: `done`.

Milestone: `V3.1 battlefield + product-shell clarity`.
Gate: `V3-RD1`.
Proof target: 关闭 V3-RD1 所需的截图包、对象级 readability verdict、terrain aid runtime visual proof 或明确移出 RD1 closeout claim。
Why now: V3-RD1 仍是唯一打开的 blocker；现有 10/10 focused regression 和 measurement proof 不能替代截图与人眼可读判断。
Stop condition: remaining gates 和 evidence ledger 写清九类对象 pass / blocked / insufficient-evidence；不得复用 BF1 basic visibility，不关闭 BG1、CH1、AV1 或 UA1。

Goal:

复核同 build raw/annotated 默认镜头截图、九类对象标注、tester readability verdict，以及 terrain aid 是否仍停留在 fallback 缺口。

Allowed files:

- `docs/V3_DEFAULT_CAMERA_READABILITY_REVIEW.zh-CN.md`
- `docs/V3_BATTLEFIELD_PRODUCT_SHELL_REMAINING_GATES.zh-CN.md`
- `docs/V3_BATTLEFIELD_PRODUCT_SHELL_EVIDENCE_LEDGER.zh-CN.md`
- `docs/CODEX_ACTIVE_QUEUE.md`
- `docs/CODEX_ACTIVE_QUEUE.md` only for closeout sync

Must satisfy:

- 必须保留 worker、footman、Town Hall、Barracks、Farm、Tower、Goldmine、tree line、terrain aid 的独立结论。
- measurement proof 只能作为辅助证据，不能替代 raw/annotated 默认镜头截图或 tester verdict。
- terrain aid 若仍无运行时视觉，必须写清是 blocked、insufficient-evidence，还是从 RD1 closeout claim 中移出。

Verification:

```bash
git diff --check -- docs/V3_DEFAULT_CAMERA_READABILITY_REVIEW.zh-CN.md docs/V3_BATTLEFIELD_PRODUCT_SHELL_REMAINING_GATES.zh-CN.md docs/V3_BATTLEFIELD_PRODUCT_SHELL_EVIDENCE_LEDGER.zh-CN.md docs/CODEX_ACTIVE_QUEUE.md docs/CODEX_ACTIVE_QUEUE.md
```

Closeout:

- `docs/V3_DEFAULT_CAMERA_READABILITY_REVIEW.zh-CN.md` now records `RD1 截图判定收口复核` as `insufficient-evidence / screenshot-verdict-still-missing`.
- `docs/V3_BATTLEFIELD_PRODUCT_SHELL_REMAINING_GATES.zh-CN.md` and `docs/V3_BATTLEFIELD_PRODUCT_SHELL_EVIDENCE_LEDGER.zh-CN.md` keep `V3-RD1` open.
- Existing `tests/v3-default-camera-readability-proof.spec.ts` 10/10 measurement proof remains valid, but it still cannot substitute for raw/annotated default-camera screenshots or tester readability verdict.
- `RD1 截图标注证明包` is still GLM `ready`, not completed; no same-build screenshot packet is recorded.
- terrain aid remains `blocked` under the RD1 runtime visual claim because it still has no runtime visual proof and has not been moved out of the RD1 closeout claim.
- No `V3-BG1`、`V3-CH1`、`V3-AV1`、or `V3-UA1` gate was closed or reclassified by this task.



### AV1 真实素材批准输入包

Status: `done`.

Milestone: `V3.1 battlefield + product-shell clarity`.
Gate: `V3-AV1`.
Proof target: V3-AV1 后续 approved-for-import proof：只有明确 approved packet 才能从 fallback/legal-proxy 切到真实素材；无批准时继续保持 fallback route。
Why now: AV1 fallback/catalog regression 已通过，但 approved packet 仍为 none；下一步风险不是再验证 fallback，而是防止把 conditional-open 误读成真实素材可导入。
Stop condition: 文档写清 approved / fallback-only / rejected / deferred 四类输入结论和 GLM 可接手范围；不关闭 BG1、RD1、CH1、UA1 或 PS4。

Goal:

定义真实素材进入 V3.1 前必须提供的 approved packet、source evidence、target keys、fallback 保留规则和 reject/defer 记录。

Allowed files:

- `docs/ASSET_APPROVAL_HANDOFF_PACKET.zh-CN.md`
- `docs/BATTLEFIELD_ASSET_INTAKE_MATRIX.zh-CN.md`
- `docs/V3_ASSET_FALLBACK_MANIFEST.zh-CN.md`
- `docs/V3_BATTLEFIELD_PRODUCT_SHELL_EVIDENCE_LEDGER.zh-CN.md`
- `docs/CODEX_ACTIVE_QUEUE.md`
- `docs/CODEX_ACTIVE_QUEUE.md` only for closeout sync

Must satisfy:

- 没有真实 source evidence 时，结论必须是 fallback-only 或 deferred，不能写 approved-for-import。
- 必须逐项绑定 target key、sourceType、licenseOrPermission、approvedUse、forbiddenUse、attribution 和 fallbackId。
- GLM 只能接 approved-for-import 或 approved fallback handoff，不能代做 sourcing、授权判断或风格审批。

Verification:

```bash
git diff --check -- docs/ASSET_APPROVAL_HANDOFF_PACKET.zh-CN.md docs/BATTLEFIELD_ASSET_INTAKE_MATRIX.zh-CN.md docs/V3_ASSET_FALLBACK_MANIFEST.zh-CN.md docs/V3_BATTLEFIELD_PRODUCT_SHELL_EVIDENCE_LEDGER.zh-CN.md docs/CODEX_ACTIVE_QUEUE.md docs/CODEX_ACTIVE_QUEUE.md
```

Closeout:

- `docs/ASSET_APPROVAL_HANDOFF_PACKET.zh-CN.md` now records `asset-approval-input-v3-av1-real-asset-001` as `fallback-only / deferred-real-assets`: no real asset has source evidence, license, attribution, approved use, forbidden use, fallback id, and reviewer evidence sufficient for `approved-for-import`.
- `docs/BATTLEFIELD_ASSET_INTAKE_MATRIX.zh-CN.md` and `docs/V3_ASSET_FALLBACK_MANIFEST.zh-CN.md` bind the nine A1 battlefield target keys to sourceType、licenseOrPermission、approvedUse、forbiddenUse、attribution、fallbackId、and current input conclusion.
- `docs/V3_BATTLEFIELD_PRODUCT_SHELL_EVIDENCE_LEDGER.zh-CN.md` keeps `V3-AV1` as `fallback-regression-pass / conditional-open`; approved packet remains `none`, and true asset import remains prohibited.
- GLM may only handle approved fallback handoff or a future approved-for-import packet; sourcing, licensing, art direction, and style approval remain Codex/user decisions.



### P1 压力路径证据收口复核

Status: `done`.

Milestone: `V4 short-match alpha`.
Gate: `V4-P1`.
Prerequisite: `P1 开局压力证明包` completed.
Proof target: 关闭 V4-P1 所需的 pressure path proof：AI 或系统压力不能长期 idle，玩家必须看到进攻、骚扰、资源威胁、生产压力或地图压力中的至少一种。
Why now: V4 的 blocker 已经定义，但当前还没有 V4 runtime proof；Codex 需要预留收口，防止把单次移动、单次交火或 AI 非空转误写成短局压力通过。
Stop condition: remaining gates 和 evidence ledger 写清 P1 pass / blocked / insufficient-evidence 结论，并点名最小 failing surface；不关闭 V4-R1 或 V4-E1。

Goal:

复核 V4-P1 的 opening-to-mid pressure proof pack，判断压力路径是 pass、blocked 还是 insufficient-evidence。

Closeout:

2026-04-14 复核通过。`P1 开局压力证明包` 产出 `tests/v4-opening-pressure-proof.spec.ts`，runtime proof 6/6 pass；证据显示 AI 在 t≈180s 发起攻击波，t≈192.6s 摧毁玩家主基地。V4-P1 已写入 `engineering-pass`。该结论只关闭压力存在性，不关闭恢复反打、结果闭环或平衡。

Allowed files:

- `docs/V4_SHORT_MATCH_REMAINING_GATES.zh-CN.md`
- `docs/V4_SHORT_MATCH_EVIDENCE_LEDGER.zh-CN.md`
- `docs/CODEX_ACTIVE_QUEUE.md`
- `docs/CODEX_ACTIVE_QUEUE.md` only for closeout sync

Must satisfy:

- 必须引用实际 focused command、时间线记录、state log 和截图或事件证据。
- 不能把 AI 有动作、单次接触或装饰性威胁写成 pressure path pass。
- 只处理 V4-P1 收口，不做 gameplay implementation 或 UI polish。

Verification:

```bash
git diff --check -- docs/V4_SHORT_MATCH_REMAINING_GATES.zh-CN.md docs/V4_SHORT_MATCH_EVIDENCE_LEDGER.zh-CN.md docs/CODEX_ACTIVE_QUEUE.md docs/CODEX_ACTIVE_QUEUE.md
```

### R1 恢复反打证据收口复核

Status: `done`.

Milestone: `V4 short-match alpha`.
Gate: `V4-R1`.
Prerequisite: `R1 恢复反打证明包` completed.
Proof target: 关闭 V4-R1 所需的 recovery/counter proof：玩家受损后能补 worker、恢复采集、补生产、重新集结、反击或守住关键点。
Why now: V4 的短局 alpha 不能只有压力，还必须证明玩家有恢复和反打余地；Codex 收口能避免把普通存活或等待计时当作恢复路径。
Stop condition: remaining gates 和 evidence ledger 写清 R1 pass / blocked / insufficient-evidence 结论，并点名失败发生在受损 fixture、恢复动作、反打窗口或 command surface；不关闭 V4-P1 或 V4-E1。

Goal:

复核 V4-R1 的 damaged-state、recovery action、counter window 和 command surface proof，判断恢复反打路径是否成立。

Closeout:

2026-04-14 复核通过。`R1 恢复反打证明包` 产出 `tests/v4-recovery-counter-proof.spec.ts`，runtime proof 5/5 pass；受控 fixture 禁用 AI，覆盖 worker 受损、补 worker、恢复采集、训练 footman、attack-move 反击和 command surface clean。V4-R1 已写入 `engineering-pass / watch-after-E1`。该结论只证明恢复/反打机制路径存在，不证明真实开局平衡、可赢性、E1 结果闭环或 `V4-UA1` 人眼 verdict。

Allowed files:

- `docs/V4_SHORT_MATCH_REMAINING_GATES.zh-CN.md`
- `docs/V4_SHORT_MATCH_EVIDENCE_LEDGER.zh-CN.md`
- `docs/CODEX_ACTIVE_QUEUE.md`
- `docs/CODEX_ACTIVE_QUEUE.md` only for closeout sync

Must satisfy:

- 必须把 damaged state、recovery action、counter window 和 command surface 分开判定。
- 不能把拖时间、自然恢复或静态存活写成 recovery/counter path pass。
- 只处理 V4-R1 收口，不扩展到经济系统大改或策略骨架。

Verification:

```bash
git diff --check -- docs/V4_SHORT_MATCH_REMAINING_GATES.zh-CN.md docs/V4_SHORT_MATCH_EVIDENCE_LEDGER.zh-CN.md docs/CODEX_ACTIVE_QUEUE.md docs/CODEX_ACTIVE_QUEUE.md
```

### E1 结果闭环证据收口复核

Status: `done`.

Milestone: `V4 short-match alpha`.
Gate: `V4-E1`.
Prerequisite: `E1 胜负结果证明包` completed.
Proof target: 关闭 V4-E1 所需的 truthful result proof：短局必须能诚实结束或诚实说明未结束，结果文案和摘要字段不能伪装完整模式。
Why now: V4 的短局 alpha 需要一个可信收尾；Codex 收口能把真实结果闭环和假战报、假天梯、假长期统计分开。
Stop condition: remaining gates 和 evidence ledger 写清 E1 pass / blocked / insufficient-evidence 结论，并点名失败发生在触发条件、结果文案、summary 字段或返回后状态；不关闭 V4-P1 或 V4-R1。

Goal:

复核 V4-E1 的 win、lose、timeout/stall、results surface、summary fields 和 return path proof，判断短局结果闭环是否成立。

Allowed files:

- `docs/V4_SHORT_MATCH_REMAINING_GATES.zh-CN.md`
- `docs/V4_SHORT_MATCH_EVIDENCE_LEDGER.zh-CN.md`
- `docs/CODEX_ACTIVE_QUEUE.md`
- `docs/CODEX_ACTIVE_QUEUE.md` only for closeout sync

Must satisfy:

- 必须引用 focused proof 覆盖 win、lose、timeout/stall 或明确说明未覆盖项。
- 必须拒绝 campaign、ladder、完整战报、长期统计和正式 profile framing。
- 只处理 V4-E1 收口，不把 menu quality 或 release readiness 混进来。

Verification:

```bash
git diff --check -- docs/V4_SHORT_MATCH_REMAINING_GATES.zh-CN.md docs/V4_SHORT_MATCH_EVIDENCE_LEDGER.zh-CN.md docs/CODEX_ACTIVE_QUEUE.md docs/CODEX_ACTIVE_QUEUE.md
```

Closeout evidence:

- 2026-04-14 GLM 先产出 `tests/v4-ending-result-truth-proof.spec.ts`，Codex 复核时发现原 proof 没覆盖 stall，并且 return-to-menu 测试手动隐藏 DOM。
- Codex 将 proof 加强为真实结果闭环：defeat、victory、stall、summary 全量字段、真实 results 返回按钮、no-fake-label 扫描。
- `npm run build` passed。
- `npx tsc --noEmit -p tsconfig.app.json` passed。
- `./scripts/run-runtime-tests.sh tests/v4-ending-result-truth-proof.spec.ts --reporter=list` 6/6 passed。
- V4-E1 已写入 `engineering-pass`；不替代 `V4-UA1` 人眼短局判断。



### C88 — V5 Strategy Backbone Gate Sync

Status: `done`.

Goal:

把 V5 remaining gates、evidence ledger、bootstrap packet 和双车道 runway 对齐，确认 V5 首批 blocker 只来自战略骨架三条主链。

Allowed files:

- `docs/V5_STRATEGY_BACKBONE_REMAINING_GATES.zh-CN.md`
- `docs/V5_STRATEGY_BACKBONE_EVIDENCE_LEDGER.zh-CN.md`
- `docs/V5_TRANSITION_BOOTSTRAP_PACKET.zh-CN.md`
- `docs/CODEX_ACTIVE_QUEUE.md` only for closeout sync

Must satisfy:

- `V5-ECO1`、`V5-TECH1`、`V5-COUNTER1` 三条 blocker 口径一致。
- V4 carryover 只进入 `V5-PACE0` 或 `V5-SD1`，不得抢 V5 blocker。
- 不声明完整科技树、完整战略深度或 V6 身份系统。

Verification:

```bash
git diff --check -- docs/V5_STRATEGY_BACKBONE_REMAINING_GATES.zh-CN.md docs/V5_STRATEGY_BACKBONE_EVIDENCE_LEDGER.zh-CN.md docs/V5_TRANSITION_BOOTSTRAP_PACKET.zh-CN.md docs/CODEX_ACTIVE_QUEUE.md
```

Closeout evidence:

- `docs/V5_STRATEGY_BACKBONE_REMAINING_GATES.zh-CN.md` now records `transitionState: cutover-blocked`, V4 engineering blockers as `none`, and V5 first blockers as only `V5-ECO1`、`V5-TECH1`、`V5-COUNTER1`.
- `docs/V5_STRATEGY_BACKBONE_EVIDENCE_LEDGER.zh-CN.md` now keeps V4 carryover limited to `V5-PACE0` / `V5-SD1`; V4 stall/recovery is only `V5-ECO1` proof context, not a fourth blocker.
- `docs/V5_TRANSITION_BOOTSTRAP_PACKET.zh-CN.md` now reflects V4-E1 engineering-pass, Codex runway prepared, GLM runway still missing, and V5 not active.
- No complete tech tree, complete strategic depth, V6 identity system, UI polish, or live queue seed was declared.

### C89 — ECO1 经济产能证据收口复核

Status: `done`.

Goal:

复核经济与产能 proof 是否证明资源流、worker、supply、production queue 和补 worker/补兵形成可持续主链。

Allowed files:

- `docs/V5_STRATEGY_BACKBONE_REMAINING_GATES.zh-CN.md`
- `docs/V5_STRATEGY_BACKBONE_EVIDENCE_LEDGER.zh-CN.md`
- `docs/CODEX_ACTIVE_QUEUE.md` only for closeout sync

Must satisfy:

- 必须引用实际 focused command、state log 和 production/economy proof。
- 必须区分持续经济/产能链与一次性生产。
- 不关闭 TECH1、COUNTER1 或 V5-UA1。

Verification:

```bash
git diff --check -- docs/V5_STRATEGY_BACKBONE_REMAINING_GATES.zh-CN.md docs/V5_STRATEGY_BACKBONE_EVIDENCE_LEDGER.zh-CN.md docs/CODEX_ACTIVE_QUEUE.md
```

Closeout evidence:

- Codex reran `./scripts/run-runtime-tests.sh tests/v5-economy-production-backbone.spec.ts --reporter=list`; result was `5/6 passed`.
- Passing proof covered gold income、supply chain、full production cycle、damage recovery and comprehensive economy audit.
- Production state log included `gold0=500`、`goldAfterEarn=560`、`goldAfterSpendAndEarn=660`、`goldFinal=760`、`totalWorkers=7`、`gatheringWorkers=5`.
- Damage recovery log included `workersAfterDamage=2`、`workersRecovered=5`、`goldRecovered=790`、`gatheringRecovered=5`.
- Closeout audit included `goldBefore=500`、`goldAfterGather=580`、`workerCount=6`、`supply=6/10`、`footmen=1`、`gathering=5`.
- Failing proof was lumber income: after simulated gather time, lumber remained `200 -> 200`; current ECO1 cannot close while gate requires `gold/lumber` resource flow.
- The failed proof re-read resource state after simulation; no game balance change or test rewrite was made in this Codex closeout.
- `V5-ECO1` remains `blocked / partial-proof`; `V5-TECH1`、`V5-COUNTER1` and `V5-UA1` were not closed.

### C90 — TECH1 科技建造顺序证据收口复核

Status: `done`.

Goal:

复核科技与建造顺序 proof 是否证明前置条件、build order、解锁或强化效果具有最小战略含义。

Allowed files:

- `docs/V5_STRATEGY_BACKBONE_REMAINING_GATES.zh-CN.md`
- `docs/V5_STRATEGY_BACKBONE_EVIDENCE_LEDGER.zh-CN.md`
- `docs/CODEX_ACTIVE_QUEUE.md` only for closeout sync

Must satisfy:

- 必须引用 build order timeline、前置条件 proof、解锁或强化效果。
- 不能把摆出建筑或展示按钮写成 tech/build-order pass。
- 不关闭 ECO1、COUNTER1 或 V5-UA1。

Verification:

```bash
git diff --check -- docs/V5_STRATEGY_BACKBONE_REMAINING_GATES.zh-CN.md docs/V5_STRATEGY_BACKBONE_EVIDENCE_LEDGER.zh-CN.md docs/CODEX_ACTIVE_QUEUE.md
```

Closeout evidence:

- Codex found GLM `Task 102 — TECH1 科技建造顺序证明包` in `ready` state, not completed.
- The expected focused file `tests/v5-tech-build-order-backbone.spec.ts` does not exist yet.
- No build order timeline、前置条件 proof、解锁或强化效果、失败回退 or focused regression evidence is available.
- `V5-TECH1` remains `blocked-by-pending-proof`.
- `V5-ECO1`、`V5-COUNTER1` and `V5-UA1` were not closed or reclassified.

### C91 — COUNTER1 兵种组成证据收口复核

Status: `done`.

Goal:

复核 counter 与 army composition proof 是否证明至少一个基础克制关系会影响生产、编队或战斗结果。

Allowed files:

- `docs/V5_STRATEGY_BACKBONE_REMAINING_GATES.zh-CN.md`
- `docs/V5_STRATEGY_BACKBONE_EVIDENCE_LEDGER.zh-CN.md`
- `docs/CODEX_ACTIVE_QUEUE.md` only for closeout sync

Must satisfy:

- 必须引用 counter relation proof、composition choice、production choice 或 combat state log。
- 不能把单场战斗胜负写成 counter backbone pass。
- 不关闭 ECO1、TECH1 或 V5-UA1。

Verification:

```bash
git diff --check -- docs/V5_STRATEGY_BACKBONE_REMAINING_GATES.zh-CN.md docs/V5_STRATEGY_BACKBONE_EVIDENCE_LEDGER.zh-CN.md docs/CODEX_ACTIVE_QUEUE.md
```

Closeout evidence:

- Codex found GLM `Task 103 — COUNTER1 基础克制与兵种组成证明包` in `ready` state, not completed.
- The expected focused file `tests/v5-counter-composition-backbone.spec.ts` does not exist yet.
- No counter relation proof、army composition choice、production choice、combat state log or focused regression evidence is available.
- `V5-COUNTER1` remains `blocked-by-pending-proof`.
- `V5-ECO1`、`V5-TECH1` and `V5-UA1` were not closed or reclassified.
- V4 recovery/counter evidence was not reused as COUNTER1 proof, because C91 requires V5-specific counter/composition evidence.



### ECO1 新证据收口复核

Status: `done`.

Milestone: `V5 strategy backbone alpha`.
Gate: `V5-ECO1`.
Prerequisite: `Task 101 — ECO1 经济产能主链证明包` completed.
Proof target: 关闭 V5-ECO1 所需的 economy/production backbone proof：worker、gold/lumber、supply、Town Hall、Barracks、Farm 或等价 production chain 能支持连续生产，不能只有一次性开局资源或静态单位。
Why now: V5 docs 仍记录 C89 的 lumber income 失败，但 GLM live queue 已显示 Task 101 completed 且 focused proof 6/6 pass；需要 Codex 用同一套证据收口，避免队列继续围绕旧 5/6 结论派发重复修复。
Stop condition: remaining gates 和 evidence ledger 写清 ECO1 pass / blocked / insufficient-evidence 结论，并点名资源流、production queue、supply 约束、补 worker/补兵中仍失败或已通过的具体面；不关闭 V5-TECH1、V5-COUNTER1 或 V5-UA1。

Goal:

复核 V5-ECO1 的最新 focused command、state log、资源流、worker/gather、supply、production queue 和补 worker/补兵证据，判断经济与产能主链是 pass、blocked 还是 insufficient-evidence。

Allowed files:

- `docs/V5_STRATEGY_BACKBONE_REMAINING_GATES.zh-CN.md`
- `docs/V5_STRATEGY_BACKBONE_EVIDENCE_LEDGER.zh-CN.md`
- `docs/CODEX_ACTIVE_QUEUE.md`
- `docs/CODEX_ACTIVE_QUEUE.md` only for closeout sync

Must satisfy:

- 必须引用实际 focused command、state log 和 production/economy proof。
- 必须区分持续经济/产能链与一次性生产或静态资源。
- 若 lumber proof 仍失败，必须保留 ECO1 blocked；若通过，只能关闭 ECO1，不得顺手关闭 TECH1、COUNTER1 或 V5-UA1。

Verification:

```bash
git diff --check -- docs/V5_STRATEGY_BACKBONE_REMAINING_GATES.zh-CN.md docs/V5_STRATEGY_BACKBONE_EVIDENCE_LEDGER.zh-CN.md docs/CODEX_ACTIVE_QUEUE.md docs/CODEX_ACTIVE_QUEUE.md
```



### TECH1 新证据收口复核

Status: `done`.

Milestone: `V5 strategy backbone alpha`.
Gate: `V5-TECH1`.
Prerequisite: `Task 102 — TECH1 科技建造顺序证明包` completed.
Proof target: 关闭 V5-TECH1 所需的 tech/build-order backbone proof：至少一条可解释 build order 会解锁或强化后续选择，不能只是把建筑摆出来。
Why now: GLM live queue 已显示 Task 102 completed，focused proof 6/6 pass；V5 docs 仍记录 TECH1 blocked-by-pending-proof，需要 Codex 用新证据收口，避免继续围绕已完成证明包派发重复任务。
Stop condition: remaining gates 和 evidence ledger 写清 TECH1 pass / blocked / insufficient-evidence 结论，并点名前置条件、建造顺序、解锁/强化效果、失败回退和 focused regression 中仍失败或已通过的具体面；不关闭 V5-COUNTER1 或 V5-UA1，也不回改 ECO1。

Goal:

复核 V5-TECH1 的最新 focused command、build order timeline、前置条件、解锁或强化效果、失败回退和 focused regression 证据，判断科技与建造顺序是 pass、blocked 还是 insufficient-evidence。

Allowed files:

- `docs/V5_STRATEGY_BACKBONE_REMAINING_GATES.zh-CN.md`
- `docs/V5_STRATEGY_BACKBONE_EVIDENCE_LEDGER.zh-CN.md`
- `docs/CODEX_ACTIVE_QUEUE.md`
- `docs/CODEX_ACTIVE_QUEUE.md` only for closeout sync

Must satisfy:

- 必须引用实际 focused command、build order timeline、前置条件 proof、解锁或强化效果。
- 不能把摆出建筑、按钮存在或装饰性科技写成 tech/build-order backbone pass。
- 只处理 V5-TECH1 收口，不扩展到完整科技树、英雄、法术、V6 身份系统或 UI polish。

Verification:

```bash
git diff --check -- docs/V5_STRATEGY_BACKBONE_REMAINING_GATES.zh-CN.md docs/V5_STRATEGY_BACKBONE_EVIDENCE_LEDGER.zh-CN.md docs/CODEX_ACTIVE_QUEUE.md docs/CODEX_ACTIVE_QUEUE.md
```

### H1 人族火枪手科技线范围包

Status: `done`.

Milestone: `V5 strategy backbone alpha`.
Gate: `V5-HUMAN1`.
Source board: `docs/HUMAN_RACE_CAPABILITY_BOARD.zh-CN.md`.
Proof target: 把玩家可见的人族 roster/tech 缺口切成最小可实现路线：`Blacksmith -> Rifleman -> Long Rifles -> AI composition`。
Why now: 用户试玩明确指出当前版本没有其他兵种和真实科技；V5 不能再只靠 TH -> Farm -> Barracks -> Footman 的窄 TECH1 proof 收口。
Stop condition: 产出一份 H1 scope packet，并把 GLM 后续任务边界写清：可做什么、不许做什么、素材只能用 fallback/proxy、验收必须覆盖玩家可训练、可研究、AI 可使用。

Goal:

基于 `docs/HUMAN_RACE_CAPABILITY_BOARD.zh-CN.md`，生成 `docs/HUMAN_H1_RIFLEMAN_SCOPE_PACKET.zh-CN.md`，把 V5-HUMAN1 拆成可派给 GLM 的最小实现切片。

Allowed files:

- `docs/HUMAN_H1_RIFLEMAN_SCOPE_PACKET.zh-CN.md`
- `docs/HUMAN_RACE_CAPABILITY_BOARD.zh-CN.md`
- `docs/V5_STRATEGY_BACKBONE_REMAINING_GATES.zh-CN.md`
- `docs/V5_STRATEGY_BACKBONE_EVIDENCE_LEDGER.zh-CN.md`
- `docs/GLM_READY_TASK_QUEUE.md`
- `docs/CODEX_ACTIVE_QUEUE.md` only for closeout sync

Must satisfy:

- 必须写清 H1 只做 Blacksmith、Rifleman、Long Rifles 和 AI composition，不做完整人族科技树、英雄、法术、车间、空军或真实素材导入。
- 必须定义 GLM 的后续实现切片：Blacksmith/Rifleman、Long Rifles、AI Rifleman composition，且每个切片都有 allowed files、runtime proof 和 cleanup 要求。
- 必须把素材规则写成中文用户可读 notes：当前只允许自制 fallback/proxy，禁止官方提取素材、来源不明素材和未批准第三方素材。
- 必须保持 V5-COUNTER1 独立；不要用 H1 任务关闭 COUNTER1。

Verification:

```bash
git diff --check -- docs/HUMAN_H1_RIFLEMAN_SCOPE_PACKET.zh-CN.md docs/HUMAN_RACE_CAPABILITY_BOARD.zh-CN.md docs/V5_STRATEGY_BACKBONE_REMAINING_GATES.zh-CN.md docs/V5_STRATEGY_BACKBONE_EVIDENCE_LEDGER.zh-CN.md docs/GLM_READY_TASK_QUEUE.md docs/CODEX_ACTIVE_QUEUE.md
node scripts/milestone-oracle.mjs --json
```

Closeout:

- `docs/HUMAN_H1_RIFLEMAN_SCOPE_PACKET.zh-CN.md` now defines H1 as `Blacksmith -> Rifleman -> Long Rifles -> AI composition`.
- `docs/GLM_READY_TASK_QUEUE.md` keeps Task 104、105、106 as bounded GLM slices with allowed files、runtime proof、cleanup commands、fallback/proxy-only material rules、and forbidden scope.
- `docs/V5_STRATEGY_BACKBONE_REMAINING_GATES.zh-CN.md` and `docs/V5_STRATEGY_BACKBONE_EVIDENCE_LEDGER.zh-CN.md` record `V5-HUMAN1` as `open / scope-ready / implementation-pending`, not closed.
- `V5-COUNTER1` remains independent and was not closed or reclassified.

### C92 — Watch 提交与假运行防护

Status: `done`.

Milestone: dual-lane operating system.

Gate: process reliability.

Why now:

2026-04-14 现场暴露了两个真实问题：GLM 任务表面显示 running，但 tmux 里只是提示停在 `Press up to edit queued messages`；手动解除后又可能因为同标题冻结/状态文件不同步导致重复派发。这个问题会直接浪费 GLM/GPT 时间，也会让监控页面误导用户。

Goal:

让 watch/feed 能识别并处理“消息已排队但未提交”的假运行状态，同时降低同标题重复派发风险。

Allowed files:

- `scripts/codex-watch.sh`
- `scripts/glm-watch.sh`
- `scripts/lane-feed.mjs`
- `tests/lane-feed.spec.mjs`
- `docs/DUAL_LANE_ISSUE_LOG.zh-CN.md`
- `docs/CODEX_ACTIVE_QUEUE.md` only for closeout sync

Must satisfy:

- `codex-watch.sh send` 和 `glm-watch.sh send` 在发送多行 prompt 后，要检查最近 pane 输出；如果仍出现 `Press up to edit queued messages` 或等价排队提示，必须自动补一次或多次提交，不能只打印 `Sent prompt`。
- `lane-feed.mjs` 不能把“刚刚派发但运行端仍停在排队提示”的状态长期当成健康 running；要写成用户看得懂的 `needs_submit`、`queued_prompt` 或等价状态。
- 同标题重复派发必须保守处理：如果已有同标题 running 或刚派发未确认，不要新建第二个 job id。
- 不改游戏逻辑、不碰 V5-HUMAN1 的实现文件，不影响 GLM 当前 `Task 104`。

Verification:

```bash
npm test -- tests/lane-feed.spec.mjs
bash -n scripts/codex-watch.sh scripts/glm-watch.sh
node scripts/generate-dual-lane-board.mjs
git diff --check -- scripts/codex-watch.sh scripts/glm-watch.sh scripts/lane-feed.mjs tests/lane-feed.spec.mjs docs/DUAL_LANE_ISSUE_LOG.zh-CN.md docs/CODEX_ACTIVE_QUEUE.md
```

Closeout requirements:

- 说明修的是哪一个假运行场景。
- 说明没有触碰 `src/game/Game.ts`、`src/game/GameData.ts`、`src/game/AssetCatalog.ts` 和 `tests/v5-human-rifleman-techline.spec.ts`。
- 如果发现需要更大改造，先把任务标成 `blocked`，不要扩大范围。

### C93 — V6-NUM1 数值系统任务种子包

Status: `done`.

Milestone: `V6 numeric foundation preheat`.

Gate: `V6-NUM1`.

Why now:

V5 只是在做人族第一条科技分支，用户已经明确要求最终必须走向完整人族和 War3-like 数值系统。趁 GLM 正在跑 V5-HUMAN1 的最后实现切片，Codex 先把 V6 的数值底座拆成可派发任务，避免 V5 收口后队列断供或盲目跳到 V7 内容堆叠。

Goal:

生成一份中文的 V6 数值系统任务种子包，把完整人族与数值系统合同拆成后续可执行、可验证、不会无限扩张的相邻任务。

Allowed files:

- `docs/V6_NUMERIC_SYSTEM_TASK_SEED.zh-CN.md`
- `docs/CODEX_ACTIVE_QUEUE.md` only for closeout sync

Forbidden files:

- `src/game/SimpleAI.ts`
- `src/game/Game.ts`
- `src/game/GameData.ts`
- `tests/v5-human-ai-rifleman-composition.spec.ts`
- `docs/GLM_READY_TASK_QUEUE.md`

Must satisfy:

- 只做任务种子和验收拆解，不改运行时代码，不跑浏览器，不启动 Vite/Playwright。
- 必须从 `docs/HUMAN_RACE_PARITY_AND_NUMERIC_SYSTEM.zh-CN.md` 和 `docs/V6_IDENTITY_SYSTEMS_REMAINING_GATES.zh-CN.md` 出发，拆出 V6-NUM1 的第一批相邻任务。
- 至少覆盖这些任务族：数值 schema 盘点、攻击类型/护甲类型模型、研究效果模型、单位/建筑基础账本、玩家可见数值提示、focused proof 计划。
- 每条任务都要写清：目的、为什么现在做、允许文件、禁止文件、验收证据、适合 Codex 还是 GLM、什么情况下停止继续生成。
- 任务名和 notes 必须是中文、用户能看懂，避免使用“gate / blocker / shell / front door / hardening”等不必要术语。
- 不关闭 V5-HUMAN1，不声明 V6 已开始，也不把完整人族内容提前塞进 V6-NUM1。

Verification:

```bash
git diff --check -- docs/V6_NUMERIC_SYSTEM_TASK_SEED.zh-CN.md docs/CODEX_ACTIVE_QUEUE.md
```

Closeout requirements:

- 说明种子包中第一批 Codex/GLM 任务各是什么。
- 说明它如何防止 V5 结束后队列断供。
- 说明它如何防止“完整人族”任务无限扩张。



### 人族数值字段盘点

Status: `done`.

Milestone: `V6 War3 identity alpha`.
Gate: `V6-NUM1`.
Proof target: 支撑 V6-NUM1 的 data-driven numeric schema：unit / building / research / ability 字段、attackType / armorType、research effect、命令卡展示和 AI 权重都有明确位置。
Why now: V6-NUM1 已经 seed-ready；正式推进 V6 前必须先有字段合同，否则 GLM 会在每个单位或科技里继续加一次性逻辑。
Stop condition: 输出字段盘点文档，能指导后续 NUM-B、NUM-C、NUM-D；一旦开始要求完整英雄池、完整法术书、完整物品或真实素材，停止并拆到后续版本。

Goal:

建立 V6-NUM1 的最小数值 schema 清单，区分已有字段、V6 必需字段、后续版本字段和拒绝扩张项。

Allowed files:

- `docs/V6_NUMERIC_SCHEMA_INVENTORY.zh-CN.md`
- `docs/V6_NUMERIC_SYSTEM_TASK_SEED.zh-CN.md`
- `docs/CODEX_ACTIVE_QUEUE.md`
- `docs/CODEX_ACTIVE_QUEUE.md` only for closeout sync

Must satisfy:

- 只做字段盘点，不改运行时代码。
- 必须覆盖 unit、building、research、ability 四类 schema。
- 必须明确 attackType / armorType、research effect、命令卡数值展示和 AI 权重字段。

Verification:

```bash
git diff --check -- docs/V6_NUMERIC_SCHEMA_INVENTORY.zh-CN.md docs/V6_NUMERIC_SYSTEM_TASK_SEED.zh-CN.md docs/CODEX_ACTIVE_QUEUE.md docs/CODEX_ACTIVE_QUEUE.md
```

Closeout:

- `docs/V6_NUMERIC_SCHEMA_INVENTORY.zh-CN.md` 已新增，按 `已有`、`V6 必需`、`后续版本`、`拒绝扩张` 四类状态盘点 unit、building、research、ability schema。
- 字段合同已明确：`attackType` / `armorType` 位于单位/建筑 weapon / defense 数据入口；research effect 进入 `ResearchDef.effects[]`；命令卡数值展示来自 `ui.numericHints` 或可追溯派生字段；AI 生产、建造、研究和能力使用偏好进入 `ai.*Weight`。
- `docs/V6_NUMERIC_SYSTEM_TASK_SEED.zh-CN.md` 已记录 NUM-A 完成，下一步安全 continuation 是 NUM-B 单位与建筑基础账本。
- 本任务未改运行时代码，未关闭 V6-NUM1，未实现完整英雄池、完整法术书、完整物品系统、真实素材或完整 War3 平衡表。

### 身份系统最小验收稿

Status: `done`.

Milestone: `V6 War3 identity alpha`.
Gate: `V6-ID1`.
Proof target: 支撑 V6-ID1 的验收标准：至少一个身份系统有可见状态、触发方式、效果反馈、限制条件和 focused regression。
Why now: V6 的身份表达不能从随机加英雄或图标开始；需要 Codex 先把最小身份系统 proof 形状写清楚。
Stop condition: 文档给出 2-3 个可选最小切片并推荐一个；不得要求完整英雄池、完整法术书、完整物品系统或真实素材。

Goal:

写清 V6-ID1 的最小验收口径、可选实现方向和拒绝范围，供后续 GLM 小切片使用。

Allowed files:

- `docs/V6_IDENTITY_SYSTEM_ACCEPTANCE.zh-CN.md`
- `docs/V6_IDENTITY_SYSTEMS_REMAINING_GATES.zh-CN.md`
- `docs/CODEX_ACTIVE_QUEUE.md`
- `docs/CODEX_ACTIVE_QUEUE.md` only for closeout sync

Must satisfy:

- 必须拒绝按钮、图标或文案占位。
- 必须说明触发、效果、限制和反馈证据。
- 必须保留真实素材禁止边界。

Verification:

```bash
git diff --check -- docs/V6_IDENTITY_SYSTEM_ACCEPTANCE.zh-CN.md docs/V6_IDENTITY_SYSTEMS_REMAINING_GATES.zh-CN.md docs/CODEX_ACTIVE_QUEUE.md docs/CODEX_ACTIVE_QUEUE.md
```

Closeout:

- `docs/V6_IDENTITY_SYSTEM_ACCEPTANCE.zh-CN.md` 已新增，定义 V6-ID1 最小通过必须覆盖可见状态、触发方式、效果反馈、限制条件和 focused regression。
- 验收稿明确拒绝按钮、图标、tooltip、换名、换色、装饰动画、单场胜负、完整英雄池、完整法术书、完整物品系统和真实素材导入。
- 文档给出三条可选最小切片：推荐 `人族集结号令`，备选 `队长代理光环` 和 `补给物品代理`；推荐项可作为后续 GLM bounded proof pack。
- `docs/V6_IDENTITY_SYSTEMS_REMAINING_GATES.zh-CN.md` 已加入 V6-ID1 第一批身份系统候选，不关闭 V6-ID1、V6-FA1、V6-W3L1 或 V6-UA1。

### NUM-E 玩家可见数值提示复核

Status: `done`.

Milestone: `V6 War3 identity alpha`.
Gate: `V6-NUM1`.
Proof target: 接受或修正 GLM 的 NUM-E visible numeric hints proof，确保玩家看到的成本、人口、攻击/护甲类型、研究效果和禁用原因都能追溯到 `GameData` 或 fresh runtime state。
Why now: GLM 初版实现方向正确，但测试里存在写死数值的弱证明；V6-NUM1 不能用“DOM 有数字”冒充数据驱动提示。
Stop condition: 只复核 NUM-E，不实现 V6-ID1、人族集结号令、完整科技树或 UI polish。

Goal:

加固 NUM-E runtime proof，跑本地验证，并把 V6-NUM1 更新为 `engineering-pass`。

Allowed files:

- `src/game/GameData.ts`
- `src/game/Game.ts`
- `tests/v6-visible-numeric-hints-proof.spec.ts`
- `docs/GLM_READY_TASK_QUEUE.md`
- `docs/V6_IDENTITY_SYSTEMS_EVIDENCE_LEDGER.zh-CN.md`
- `docs/V6_IDENTITY_SYSTEMS_REMAINING_GATES.zh-CN.md`
- `docs/V6_NUMERIC_SYSTEM_TASK_SEED.zh-CN.md`
- `docs/V6_NUMERIC_PROOF_PLAN.zh-CN.md`
- `docs/V6_LIVE_QUEUE_SUPPLY_PACKET.zh-CN.md`
- `docs/CODEX_ACTIVE_QUEUE.md`

Verification:

```bash
./scripts/cleanup-local-runtime.sh
npm run build
npx tsc --noEmit -p tsconfig.app.json
./scripts/run-runtime-tests.sh tests/v6-visible-numeric-hints-proof.spec.ts tests/v6-research-effect-model-proof.spec.ts tests/v6-attack-armor-type-proof.spec.ts --reporter=list
./scripts/cleanup-local-runtime.sh
```

Closeout:

- NUM-E tests now import `GameData` expected values instead of hardcoding costs, damage, armor and type labels.
- Local verification passed: build, app typecheck, runtime `15/15`; cleanup executed.
- `玩家可见数值提示证明包` is marked `accepted`, so V6-ID1 can now dispatch.
- V6-NUM1 is recorded as `engineering-pass`; remaining V6 blockers are ID1, FA1 and W3L1.

### accepted 前置调度保护

Status: `done`.

Milestone: `V6 War3 identity alpha`.
Gate: `dual-lane execution / GLM review control`.
Proof target: 让 feed 能区分 worker 自报完成和 Codex 本地验收通过，避免下一张实现任务基于未经复核的前置继续派发。
Why now: NUM-D 曾在 Codex 复核前把 NUM-E 自动派出，说明只靠文档备注不够，需要代码层支持 `accepted` 前置。
Stop condition: 只改 feed / 测试 / 队列文档；不触碰 GLM 正在改的 V6-NUM1 游戏实现文件。

Goal:

当任务卡写“Prerequisite: `X` accepted.”时，`completed` / `done` 不再满足前置；只有 Codex 本地复核后把 `X` 标成 `accepted`，下一张任务才会进入派发。

Allowed files:

- `scripts/lane-feed.mjs`
- `tests/lane-feed.spec.mjs`
- `docs/GLM_READY_TASK_QUEUE.md`
- `docs/V6_LIVE_QUEUE_SUPPLY_PACKET.zh-CN.md`
- `docs/DUAL_LANE_ISSUE_LOG.zh-CN.md`
- `docs/CODEX_ACTIVE_QUEUE.md`

Verification:

```bash
node --test tests/lane-feed.spec.mjs
node scripts/generate-dual-lane-board.mjs
```

Closeout:

- `lane-feed` 现在能解析 `accepted` 前置，且 `completed/done` 不会满足这种前置。
- 新增回归：前置任务为 `completed` 时必须等待；改成 `accepted` 后才允许计划下一张。
- `人族集结号令最小证明包` 改为等待 `玩家可见数值提示证明包 accepted`，避免 NUM-E 一完成就自动进 V6-ID1。
- 本地 `node --test tests/lane-feed.spec.mjs` 通过 `35/35`。
- 看板 JSON 已刷新。

### NUM-D 研究效果模型复核

Status: `done`.

Milestone: `V6 War3 identity alpha`.
Gate: `V6-NUM1`.
Proof target: 接受或修正 GLM 的 NUM-D research effect model closeout，确保 Long Rifles 真正从数据模型生效，且不会重复叠加。
Why now: GLM 自报 6/6 通过时使用了超时形态命令，且初版 proof-2 实际是在测试里手动加射程两次，不能证明游戏逻辑不叠加。
Stop condition: 只复核 NUM-D；不接管 NUM-E UI 提示，不实现完整科技树或英雄技能。

Goal:

修正 NUM-D proof 弱点，复跑本地验证，并把 V6 evidence ledger 更新到“只剩 NUM-E”。

Allowed files:

- `src/game/GameData.ts`
- `src/game/Game.ts`
- `tests/v6-research-effect-model-proof.spec.ts`
- `tests/v6-attack-armor-type-proof.spec.ts`
- `docs/V6_IDENTITY_SYSTEMS_EVIDENCE_LEDGER.zh-CN.md`
- `docs/V6_IDENTITY_SYSTEMS_REMAINING_GATES.zh-CN.md`
- `docs/V6_NUMERIC_SYSTEM_TASK_SEED.zh-CN.md`
- `docs/GLM_READY_TASK_QUEUE.md`
- `docs/CODEX_ACTIVE_QUEUE.md`

Verification:

```bash
./scripts/cleanup-local-runtime.sh
npm run build
npx tsc --noEmit -p tsconfig.app.json
./scripts/run-runtime-tests.sh tests/v6-research-effect-model-proof.spec.ts tests/v6-attack-armor-type-proof.spec.ts tests/v5-human-long-rifles-tech.spec.ts --reporter=list
./scripts/cleanup-local-runtime.sh
```

Closeout:

- `LONG_RIFLES_RANGE_BONUS` unused constant removed after migration.
- Research completion now ignores duplicate completion for an already completed research key.
- New units apply each completed research key once, avoiding duplicate effects if multiple buildings record the same research.
- `startResearch` now spends from the selected building's team instead of hard-coding player team 0.
- NUM-D proof-2 now uses real `startResearch -> tick -> retry` flow and proves the second attempt does not queue or stack.
- Local verification passed: build, app typecheck, runtime `12/12`; cleanup executed.

### V6 实时任务供给与防断供包

Status: `done`.

Milestone: `V6 War3 identity alpha`.
Gate: `dual-lane execution / V6 live queue`.
Proof target: 让用户、看板和 feed 都能看到当前 GLM 在跑什么、下一张是什么、为什么还不能自动进 V7，以及如何避免重复派发和空队列烧 token。
Why now: 关机恢复后 GLM 队列一度为空；如果只依赖自动合成，会再次出现任务断供、重复标题冻结或 Codex 空转。
Stop condition: 只记录当前 V6-NUM1 -> V6-ID1 最短链路和防断供规则，不生成完整 V6/V7 内容计划。

Goal:

把当前 V6 live queue 链、前置关系、防重复规则和自动推进条件写成一份可复盘文档，并把 NUM-E / ID1 后续卡补进 GLM live queue。

Allowed files:

- `docs/V6_LIVE_QUEUE_SUPPLY_PACKET.zh-CN.md`
- `docs/GLM_READY_TASK_QUEUE.md`
- `docs/CODEX_ACTIVE_QUEUE.md`
- `docs/DOCS_INDEX.md`

Must satisfy:

- 必须写清当前 active GLM 任务和后续 ready 任务。
- 必须说明为什么不无限生成更多任务。
- 必须说明 watch running、queue empty、同标题取消、Codex 空转时的处理规则。
- 必须把任务前置写进 GLM 任务卡，避免越级派发。

Verification:

```bash
git diff --check -- docs/V6_LIVE_QUEUE_SUPPLY_PACKET.zh-CN.md docs/GLM_READY_TASK_QUEUE.md docs/CODEX_ACTIVE_QUEUE.md docs/DOCS_INDEX.md
node scripts/generate-dual-lane-board.mjs
```

Closeout:

- `docs/V6_LIVE_QUEUE_SUPPLY_PACKET.zh-CN.md` 已新增，记录当前 V6 仍 open 的 gate、GLM 当前任务、后续 NUM-E / ID1 链路、自动推进条件和防重复规则。
- `docs/GLM_READY_TASK_QUEUE.md` 已补两张后续卡：`玩家可见数值提示证明包` 和 `人族集结号令最小证明包`，并写明前置依赖，避免 NUM-D 结束后断供。
- `docs/DOCS_INDEX.md` 已加入新的 live queue supply packet。
- 本任务未改运行时代码，不关闭 V6-NUM1、V6-ID1、V6-FA1 或 V6-W3L1。

### 人族基础数值账本

Status: `done`.

Milestone: `V6 War3 identity alpha`.
Gate: `V6-NUM1`.
Prerequisite: `人族数值字段盘点` 已完成。
Proof target: 让现有和相邻人族对象的基础数值先进入同一张可审查账本，后续实现只对账本做增量落地，不再各写各的。
Why now: NUM-A 已经给出字段合同；NUM-B 必须先把 Peasant、Footman、Rifleman、Town Hall、Farm、Barracks、Blacksmith、Scout Tower 等对象的数值基线写清楚，GLM 才能安全实现攻击/护甲和研究效果。
Stop condition: 输出账本文档即可；不得改运行时代码，不得开始完整英雄池、完整法术书、完整物品系统或真实素材导入。

Goal:

把现有和相邻人族单位、建筑、科技的核心数值整理成第一版账本，明确哪些来自当前代码、哪些是 V6 目标、哪些只是后续占位。

Allowed files:

- `docs/V6_HUMAN_NUMERIC_LEDGER.zh-CN.md`
- `docs/V6_NUMERIC_SCHEMA_INVENTORY.zh-CN.md`
- `docs/CODEX_ACTIVE_QUEUE.md` only for closeout sync

Forbidden:

- Runtime source files
- GLM queue files
- Full Human implementation
- Heroes / spells / items / assets

Must satisfy:

- 只建账本，不实现数值。
- 已有对象和后续相邻对象必须分开。
- 必须覆盖 cost、supply、hp、armor、attack、range、train/build time、prereq、command-card display fields、proof location。
- 每个字段要能追溯到当前代码、V6 目标或后续版本，不允许混成“感觉像 War3”的散表。

Verification:

```bash
git diff --check -- docs/V6_HUMAN_NUMERIC_LEDGER.zh-CN.md docs/V6_NUMERIC_SCHEMA_INVENTORY.zh-CN.md docs/CODEX_ACTIVE_QUEUE.md
```

Closeout:

- `docs/V6_HUMAN_NUMERIC_LEDGER.zh-CN.md` 已新增，按当前对象、V6 目标增量和后续占位分开记录人族基础数值。
- 当前账本覆盖 Peasant、Footman、Rifleman、Town Hall、Farm、Barracks、Blacksmith、Scout Tower 和 Long Rifles，并逐项列出 cost、supply、hp、armor、attack、range、train/build/research time、prereq、command-card display fields、proof location。
- `docs/V6_NUMERIC_SCHEMA_INVENTORY.zh-CN.md` 已记录 NUM-B 完成，后续 runtime proof 应按账本增量落地。
- 本任务只建账本，未改运行时代码、未编辑 GLM queue、未实现完整人族、英雄、法术、物品或真实素材。

### 数值底座证明计划

Status: `done`.

Milestone: `V6 War3 identity alpha`.
Gate: `V6-NUM1`.
Prerequisite: `人族数值字段盘点` 和 `人族基础数值账本` 已完成。
Proof target: 让 NUM-C、NUM-D、NUM-E 的 runtime proof 有统一验收口径，防止用单场胜负、按钮存在或截图观感冒充数值系统。
Why now: GLM 已恢复 NUM-C，Codex 需要提前固定 proof 读取规则、fresh state 规则和 V6-NUM1 收口条件，避免 GLM 完成后队列断供或验收口径发散。
Stop condition: 输出证明计划即可；不得改运行时代码，不得启动浏览器实测，不得新增完整人族、英雄、法术、物品或真实素材任务。

Goal:

写清 attackType / armorType、armor formula、research effect、visible numeric hints、AI 同规则使用和 cleanup proof 的最低证明标准。

Allowed files:

- `docs/V6_NUMERIC_PROOF_PLAN.zh-CN.md`
- `docs/V6_NUMERIC_SYSTEM_TASK_SEED.zh-CN.md`
- `docs/CODEX_ACTIVE_QUEUE.md` only for closeout sync

Forbidden:

- Runtime source files
- Runtime specs
- GLM queue files
- Browser / Playwright execution
- Full Human implementation
- Heroes / spells / items / assets

Must satisfy:

- 每个 proof 必须绑定数据入口、运行时读取点、可观察结果和不通过条件。
- 必须写清 mutation 后重新读取 `window.__war3Game` / `g.units` 的 fresh state 规则。
- 必须写清 V6-NUM1 从 `open` 到 `engineering-pass` 的条件。
- 必须拒绝单场胜负、按钮存在、截图观感或单个数值调整作为通过证据。

Verification:

```bash
git diff --check -- docs/V6_NUMERIC_PROOF_PLAN.zh-CN.md docs/V6_NUMERIC_SYSTEM_TASK_SEED.zh-CN.md docs/CODEX_ACTIVE_QUEUE.md
```

Closeout:

- `docs/V6_NUMERIC_PROOF_PLAN.zh-CN.md` 已新增，定义 NUM-C / NUM-D / NUM-E 的证明矩阵。
- 计划明确了 attack/armor 类型差异、护甲组合、建筑/单位同规则、research effect、命令卡数值提示、AI 同规则使用和 cleanup proof。
- 计划明确 V6-NUM1 必须在 NUM-A、NUM-B、NUM-C、NUM-D、NUM-E 和 evidence ledger 对齐后才可改为 `engineering-pass`。
- 本任务只写文档，未改运行时代码、未跑浏览器、未编辑 GLM queue、未实现完整人族、英雄、法术、物品或真实素材。



### V7-CX1 — Beta 范围冻结包

Status: `ready`.

Goal:

把 V7 要做的 Human 内容范围冻结下来，明确本版做什么、不做什么、哪些债务后移到 V8/V9。

Allowed files:

- `docs/V7_CONTENT_BETA_REMAINING_GATES.zh-CN.md`
- `docs/V7_CONTENT_BETA_EVIDENCE_LEDGER.zh-CN.md`
- `docs/HUMAN_RACE_PARITY_AND_NUMERIC_SYSTEM.zh-CN.md`
- `docs/CODEX_ACTIVE_QUEUE.md`
- `docs/CODEX_ACTIVE_QUEUE.md` only for closeout sync

Must satisfy:

- 选定 V7 Human 内容范围不能超过可测试能力。
- 必须点名 Lumber Mill / tower branches / Arcane Sanctum / Priest/Sorceress / Workshop/Mortar 哪些进入当前切片，哪些后移。
- 不能把完整 War3 终局写进 V7。

Verification:

```bash
git diff --check -- docs/V7_CONTENT_BETA_REMAINING_GATES.zh-CN.md docs/V7_CONTENT_BETA_EVIDENCE_LEDGER.zh-CN.md docs/HUMAN_RACE_PARITY_AND_NUMERIC_SYSTEM.zh-CN.md docs/CODEX_ACTIVE_QUEUE.md docs/CODEX_ACTIVE_QUEUE.md
```

### V7-CX2 — Human 内容证明矩阵

Status: `ready`.

Goal:

把每个选定 Human 内容对象映射到数据、前置、命令卡、runtime proof 和玩家可见状态，给 GLM 派发小切片。

Allowed files:

- `docs/V7_CONTENT_BETA_REMAINING_GATES.zh-CN.md`
- `docs/V7_CONTENT_BETA_EVIDENCE_LEDGER.zh-CN.md`
- `docs/GLM_READY_TASK_QUEUE.md`
- `docs/CODEX_ACTIVE_QUEUE.md` only for closeout sync

Must satisfy:

- 每个新增单位、建筑、科技都要有数值行和真实行为入口。
- 每个 GLM 任务必须有 allowed / forbidden files、focused proof 和 cleanup 要求。
- 不允许用模型、按钮或文案替代 gameplay proof。

Verification:

```bash
git diff --check -- docs/V7_CONTENT_BETA_REMAINING_GATES.zh-CN.md docs/V7_CONTENT_BETA_EVIDENCE_LEDGER.zh-CN.md docs/GLM_READY_TASK_QUEUE.md docs/CODEX_ACTIVE_QUEUE.md
```

### V7-CX3 — 高级数值与战斗模型接线计划

Status: `ready`.

Goal:

确定 V7 最先补哪两类高级模型，例如 projectile / target filters / caster mana / AOE / upgrade levels，并固定证明方式。

Allowed files:

- `docs/V7_CONTENT_BETA_REMAINING_GATES.zh-CN.md`
- `docs/V7_CONTENT_BETA_EVIDENCE_LEDGER.zh-CN.md`
- `docs/HUMAN_RACE_PARITY_AND_NUMERIC_SYSTEM.zh-CN.md`
- `docs/CODEX_ACTIVE_QUEUE.md` only for closeout sync

Must satisfy:

- 必须复用 V6 的数值 schema 和 research effect model。
- 每个模型都要有 data-driven 入口和 runtime proof。
- 不允许在 `Game.ts` 里继续加一次性常量。

Verification:

```bash
git diff --check -- docs/V7_CONTENT_BETA_REMAINING_GATES.zh-CN.md docs/V7_CONTENT_BETA_EVIDENCE_LEDGER.zh-CN.md docs/HUMAN_RACE_PARITY_AND_NUMERIC_SYSTEM.zh-CN.md docs/CODEX_ACTIVE_QUEUE.md
```

### V7-CX4 — Beta 候选审查包

Status: `ready`.

Goal:

收集 V7 的可玩内容、验证命令、已知缺口和不可对外承诺范围，形成用户或 tester 可审查材料。

Allowed files:

- `docs/V7_CONTENT_BETA_EVIDENCE_LEDGER.zh-CN.md`
- `docs/CODEX_ACTIVE_QUEUE.md`
- `docs/V7_BETA_CANDIDATE_REVIEW_PACKET.zh-CN.md`
- `docs/CODEX_ACTIVE_QUEUE.md` only for closeout sync

Must satisfy:

- 审查包必须写清“证明什么”和“不证明什么”。
- 必须保留用户或 tester verdict 字段。
- 不得写成 public demo、release candidate 或完整 War3 parity。

Verification:

```bash
git diff --check -- docs/V7_CONTENT_BETA_EVIDENCE_LEDGER.zh-CN.md docs/CODEX_ACTIVE_QUEUE.md docs/V7_BETA_CANDIDATE_REVIEW_PACKET.zh-CN.md docs/CODEX_ACTIVE_QUEUE.md
```



### V9-CX1 — External feedback intake sync

Status: `ready`.

Goal:

把 V8 的反馈记录模板、V9 gates、live queue 和看板接起来，让反馈能进入维护队列，而不是停在一份说明文档里。

Allowed files:

- `docs/V9_MAINTENANCE_EXPANSION_REMAINING_GATES.zh-CN.md`
- `docs/V9_MAINTENANCE_EXPANSION_EVIDENCE_LEDGER.zh-CN.md`
- `docs/V8_FEEDBACK_CAPTURE_AND_TRIAGE_PACKET.zh-CN.md`
- `docs/CODEX_ACTIVE_QUEUE.md`
- `docs/GLM_READY_TASK_QUEUE.md`
- `docs/DUAL_LANE_STATUS.zh-CN.md`
- `public/dual-lane-board.json`
- `docs/CODEX_ACTIVE_QUEUE.md` only for closeout sync

Must satisfy:

- 明确 V9-HOTFIX1 的第一条可执行路径。
- 不需要真实 tester 反馈也能用样例证明路由规则。
- 不把 V9-UA1 用户选择写成自动通过。
- 看板和队列必须显示 V9 当前阶段和下一张 GLM 任务。

Verification:

```bash
git diff --check -- docs/V9_MAINTENANCE_EXPANSION_REMAINING_GATES.zh-CN.md docs/V9_MAINTENANCE_EXPANSION_EVIDENCE_LEDGER.zh-CN.md docs/V8_FEEDBACK_CAPTURE_AND_TRIAGE_PACKET.zh-CN.md docs/CODEX_ACTIVE_QUEUE.md docs/GLM_READY_TASK_QUEUE.md docs/DUAL_LANE_STATUS.zh-CN.md public/dual-lane-board.json docs/CODEX_ACTIVE_QUEUE.md
```

### V9-CX2 — Next expansion decision packet

Status: `ready`.

Goal:

从 V8 反馈入口、项目总路线和 War3-like 终局差距中选择一个下一轮主攻能力，并写清本轮不做什么，防止 V9 无限扩张。

Allowed files:

- `docs/PROJECT_MASTER_ROADMAP.zh-CN.md`
- `docs/WAR3_MASTER_CAPABILITY_PROGRAM.zh-CN.md`
- `docs/WAR3_ENDSTATE_GAP_ATLAS.zh-CN.md`
- `docs/V9_MAINTENANCE_EXPANSION_EVIDENCE_LEDGER.zh-CN.md`
- `docs/CODEX_ACTIVE_QUEUE.md`
- `docs/CODEX_ACTIVE_QUEUE.md` only for closeout sync

Must satisfy:

- 只选一个主攻能力。
- 选择依据必须来自 V8 反馈入口、master roadmap 或终局差距，不凭临时兴奋点。
- 明确不选项和延期项。
- 输出能转成 GLM 窄任务，而不是一份空泛战略文档。

Verification:

```bash
git diff --check -- docs/PROJECT_MASTER_ROADMAP.zh-CN.md docs/WAR3_MASTER_CAPABILITY_PROGRAM.zh-CN.md docs/WAR3_ENDSTATE_GAP_ATLAS.zh-CN.md docs/V9_MAINTENANCE_EXPANSION_EVIDENCE_LEDGER.zh-CN.md docs/CODEX_ACTIVE_QUEUE.md docs/CODEX_ACTIVE_QUEUE.md
```

### V9-CX3 — Baseline release note packet

Status: `ready`.

Goal:

固定 V8 baseline 的可复跑命令、已知缺口、回滚说明和外部说明口径，给 V9 后续 hotfix / patch / expansion 一个稳定起点。

Allowed files:

- `docs/V9_MAINTENANCE_EXPANSION_EVIDENCE_LEDGER.zh-CN.md`
- `docs/V8_EXTERNAL_RELEASE_EVIDENCE_LEDGER.zh-CN.md`
- `docs/KNOWN_ISSUES.zh-CN.md`
- `README.md`
- `docs/CODEX_ACTIVE_QUEUE.md`
- `docs/CODEX_ACTIVE_QUEUE.md` only for closeout sync

Must satisfy:

- 列出 baseline smoke / RC smoke / cleanup 的复跑命令。
- 明确哪些缺口是已知债务，不是回归。
- 不把 V8 baseline 写成 public release 或完整 War3。
- 只有 Task116 accepted 后才能关闭 V9-BASELINE1。

Verification:

```bash
git diff --check -- docs/V9_MAINTENANCE_EXPANSION_EVIDENCE_LEDGER.zh-CN.md docs/V8_EXTERNAL_RELEASE_EVIDENCE_LEDGER.zh-CN.md docs/KNOWN_ISSUES.zh-CN.md README.md docs/CODEX_ACTIVE_QUEUE.md docs/CODEX_ACTIVE_QUEUE.md
```
