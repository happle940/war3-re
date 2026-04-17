# GLM Ready Task Queue

Purpose: keep GLM continuously useful without letting it collide with Codex or weaken product contracts. These are pre-shaped tasks that can be sent with small situational edits.

Primary runway docs for the current shell/session push:

- `/Users/zhaocong/Documents/war3-re/docs/plans/2026-04-13-glm-stage-a-product-shell-runway.md`
- `/Users/zhaocong/Documents/war3-re/docs/plans/2026-04-13-glm-stage-b-front-door-runway.md`

C63 runway publication (historical shell runway, not the current V6 dispatch source):

- GLM dispatch source remains the `Current queue state` table below, not chat memory.
- The GLM-side runway source is `/Users/zhaocong/Documents/war3-re/docs/plans/2026-04-13-glm-stage-a-product-shell-runway.md`.
- The Codex counterpart is `/Users/zhaocong/Documents/war3-re/docs/plans/2026-04-13-codex-owner-runway.md`.
- Historical current slice at publication time: `Task 57 — Front-Door Boot Gate Contract`.
- Current dispatch source is the `Current queue state` table plus active milestone gate docs; V6-specific live status is tracked by the V6 rows and `docs/V6_LIVE_QUEUE_SUPPLY_PACKET.zh-CN.md`.

## Queue Maintenance Contract

This file is operational state, not archive prose. Codex must update it whenever GLM starts, completes, abandons, or materially changes a task.

Required update points:

- Before dispatch: mark exactly one task as `in_progress`, add owner, start date, allowed files, and current reason for priority.
- After GLM closeout: mark the task as `completed`, `failed`, `abandoned`, or `superseded`; record commit hash, verification result, and follow-up task IDs.
- Before sending the next task: re-rank the queue against current user pain and latest test failures.
- After any user-reported runtime issue: either map it to an existing task or add a new task card near the top.
- After Codex changes shared tooling, CI, scripts, or test harnesses: update task verification commands before GLM receives another prompt.

Status vocabulary:

- `ready`: safe to dispatch when GLM is idle.
- `in_progress`: GLM is currently working on it; do not dispatch another implementation task.
- `blocked`: cannot continue without a missing dependency or human confirmation.
- `completed`: merged/pushed and verification passed.
- `failed`: attempted but closeout failed; requires Codex review before retry.
- `superseded`: no longer needed because another task or direct fix covered it.

Current queue state:

| Task | Status | Owner | Last update | Notes |
| --- | --- | --- | --- | --- |
| Task 115 — V9 hotfix triage proof pack | accepted | GLM-style worker + Codex review | 2026-04-15 | Codex 本地复核接受：build、tsc、node test 5/5、cleanup、无残留均通过。V9-HOTFIX1 工程通过。 |
| Task 116 — V9 baseline replay smoke pack | accepted | GLM-style worker + Codex review | 2026-04-15 | Codex 本地复核接受：build、tsc、V9 baseline replay smoke 5/5、cleanup、无残留均通过。V9-BASELINE1 工程通过。 |
| Task 117 — V9 Human completeness ledger consistency pack | accepted | GLM-style worker + Codex takeover | 2026-04-15 | GLM 写出背景板更新和初版 proof 后在低上下文处被 Codex 取消并接管；Codex 修正 node proof、build、tsc、node test 5/5、cleanup、无残留均通过。 |
| Task 118 — V9 HN2 tier and prerequisite schema boundary pack | accepted | GLM-style worker + Codex review | 2026-04-15 | Codex 本地复核接受并加固 proof：build、tsc、node test 5/5、cleanup、无残留通过；下一步命名修正为 HN2-IMPL1，避免误占 HN3。 |
| Task 119 — V9 HN2-IMPL1 Keep tier contract pack | accepted | GLM-style worker + Codex review | 2026-04-15 | Codex 本地复核接受：纠正 keep 不得指向未实现 Castle，补强 schema proof 让下一步只允许 `keep` seed、仍禁止 `castle` 和新单位/科技；build、tsc、node proof 81/81 通过。 |
| Task 120 — V9 HN2-IMPL1 Keep tier data seed | accepted | GLM-style worker + Codex review | 2026-04-15 | Codex 本地复核接受：`BuildingDef.techTier/upgradeTo`、`townhall -> keep`、`keep` T2 数据种子和 proof 均通过；build、tsc、node proof 27/27、cleanup、无残留均通过。 |
| Task 121 — V9 HN2-IMPL2 Town Hall to Keep upgrade flow | accepted | GLM-style worker + Codex takeover | 2026-04-15 | GLM 初版实现后 runtime 测试失败并停在提示；Codex 接管修正选择模型、资源 API 和升级链边界。build、tsc、focused runtime 3/3、node proof 20/20、cleanup、无残留均通过。 |
| Task 122 — V9 HN2-IMPL3 Keep post-upgrade command surface | accepted | GLM-style worker + Codex review | 2026-04-15 | Codex 本地复核接受：Keep 升级后可训练农民并保留集结点；无 Castle、Knight、T2 解锁、AI 二本策略或素材扩张。build、tsc、focused runtime 3/3、node proof 20/20、cleanup、无残留通过。 |
| Task 123 — V9 HN2-PLAN4 Keep/T2 unlock compatibility inventory | accepted | GLM-style worker + Codex review | 2026-04-15 | Codex 本地复核接受：当前 Workshop / Arcane Sanctum 与 Keep gating 的兼容关系已盘点，静态 proof 18/18、build、tsc、cleanup、无残留通过；未改运行时代码。 |
| Task 124 — V9 HN2-CONTRACT5 Keep/T2 unlock contract packet | accepted | GLM-style worker + Codex review | 2026-04-15 | Codex 本地复核接受：Keep/T2 解锁目标合同和迁移验收标准已定义，静态 proof 24/24、build、tsc、cleanup、无残留通过；未改运行时代码。 |
| Task 125 — V9 HN2-PROOF6 Keep/T2 runtime gating dry-run | accepted | GLM-style worker + Codex takeover | 2026-04-15 | GLM 初版用 Tower/Lumber Mill 代理证明且卡进 0% compact；Codex 取消 job 后接管，改成真实 dry-run：现有 techPrereq 机制 + 模拟 Keep gate 命令卡证明。build、tsc、runtime 4/4、node 12/12、cleanup、无残留通过。 |
| Task 126 — V9 HN2-IMPL7 AI Town Hall to Keep upgrade readiness | accepted | GLM-style worker + Codex takeover | 2026-04-15 | GLM 初版弱化 KU-2 且 KU-6 残留断言；Codex 取消 job 后接管。AI 可使用现有 Town Hall -> Keep 升级路径；build、tsc、focused runtime 6/6、AI/V7 regression 10/10、node contract 12/12、cleanup、无残留通过。 |
| Task 127 — V9 HN2-IMPL8 Keep/T2 building unlock migration | accepted | GLM-style worker + Codex review | 2026-04-15 | Codex 本地复核接受：Workshop / Arcane Sanctum techPrereq 迁移到 Keep；build、tsc、runtime 4/4 + 12/12 + 5/5、V7 AI same-rule 8/8、node 12/12、cleanup、无残留通过。无 Castle、Knight、新素材或完整二本策略。 |
| Task 128 — V9 HN2-UX9 Keep upgrade and T2 unlock feedback | accepted | GLM-style worker + Codex review | 2026-04-15 | Codex 本地复核接受：升级中命令卡显示“升级主城…”+剩余秒数且秒数会下降，无重复升级按钮；无 Keep 时 T2 建筑禁用含“主城”原因，有 Keep 后可用。build、tsc、runtime 12/12、node 12/12、cleanup、无残留通过。 |
| Task 129 — V9 HN2-PROOF10 Human T2 production path smoke | accepted | GLM-style worker + Codex review | 2026-04-15 | Codex 本地复核接受：单局完整二本最小路径 smoke 串起 Town Hall 升级 Keep → T2 建筑解锁 → Mortar/Priest 训练。build、tsc、runtime 7/7、node 12/12、cleanup、无残留通过。不改生产代码。 |
| Task 130 — V9 HN2-AI11 AI post-Keep T2 usage slice | accepted | GLM-style worker + Codex review | 2026-04-15 | Codex 本地复核接受：AI 在 Keep 后通过真实建造路径启动 Workshop / Arcane Sanctum，并训练 Mortar / Priest。Codex 去掉 Priest 随军波次的隐性战术改动，补强双建筑、精确扣费、人口阻塞和 KU-6 证明。build、tsc、runtime 21/21、node 12/12、cleanup、无残留通过。 |
| Task 131 — V9 HN2-NUM12 T2 numeric ledger alignment proof | accepted | GLM-style worker + Codex takeover | 2026-04-15 | GLM 写出账本草稿但没有 closeout，且初版静态 proof 直接 import 不存在的 `GameData.js` 失败；Codex 接管后改成读取 `GameData.ts` + 文档文本的 proof。node proof 5/5、build、tsc、cleanup、无残留通过。 |
| Task 132 — V9 HN2-UX13 T2 visible numeric hints proof | accepted | GLM-style worker + Codex takeover | 2026-04-15 | GLM 新增初版 proof 但停在 runtime/closeout；Codex 复核发现未覆盖 build/train time，补 Game.ts 命令卡时间展示并加断言。build、tsc、runtime 16/16、cleanup、无残留通过。 |
| Task 133 — V9 HN2-ROLE14 T2 role combat smoke | accepted | GLM-style worker + Codex takeover | 2026-04-15 | GLM 初版 proof 过宽且旧验证重复启动；Codex 接管后收窄为 3 个 focused smoke。build、tsc、runtime 15/15、cleanup、无残留通过。 |
| Task 134 — V9 HN3-PLAN1 ability numeric model inventory | accepted | GLM-style worker + Codex takeover | 2026-04-15 | GLM 写出 HN3 文档后再次停在 prompt 且未创建 proof；Codex 接管补静态 proof。build、tsc、node proof 5/5、cleanup 通过。 |
| Task 135 — V9 HN3-DATA2 Priest Heal ability data seed | accepted | GLM-style worker + Codex review | 2026-04-15 | GLM 写出 AbilityDef / ABILITIES.priest_heal 数据种子和 proof；Codex 修正 proof 切片并本地复核。build、tsc、node proof 5/5、cleanup 通过。 |
| Task 136 — V9 HN3-IMPL3 Priest Heal runtime data-read migration | accepted | GLM-style worker + Codex takeover | 2026-04-15 | GLM 写出部分 `Game.ts` 迁移后停在 prompt；Codex 接管补完 proof。build、tsc、runtime 13/13、Task135 node proof 5/5、cleanup 通过。 |
| Task 137 — V9 HN3-DATA4 Rally Call ability data seed | accepted | GLM-style worker + Codex takeover | 2026-04-15 | GLM 写出初版数据和文档后卡住且初版编译失败；Codex 接管修正常量顺序、target rule 和 proof。build、tsc、node proof 4/4、cleanup 通过。 |
| Task 138 — V9 HN3-DATA5 Mortar AOE ability data seed | accepted | GLM-style worker + Codex takeover | 2026-04-15 | GLM 因 compact/queued message 停在半成品；Codex 接管完成 `ABILITIES.mortar_aoe`、HN3 文档和静态 proof。build、tsc、node proof 4/4 通过。 |
| Task 139 — V9 HN3-IMPL6 Rally Call runtime data-read migration | accepted | GLM-style worker + Codex takeover | 2026-04-15 | GLM 完成核心迁移但误跑 `run-runtime-suite.sh`，Codex 中断重验并修正 proof。build、tsc、focused runtime 13/13、cleanup 通过。 |
| Task 140 — V9 HN3-IMPL7 Mortar AOE runtime data-read migration | accepted | GLM-style worker + Codex takeover | 2026-04-15 | GLM 完成核心迁移但验证被中断；Codex 接管修正 proof 和旧静态证明。build、tsc、node proof 56/56、focused runtime 9/9、cleanup 通过。 |
| Task 141 — V9 HN3-UX8 ability command-card data-read migration | accepted | GLM-style worker + Codex takeover | 2026-04-15 | GLM 完成核心 `Game.ts` 迁移但未补 proof/closeout；Codex 接管新增 focused proof。build、tsc、runtime 14/14、cleanup 通过。 |
| Task 142 — V9 HN3-CLOSE9 ability data-read closure inventory | accepted | GLM-style worker + Codex review | 2026-04-15 | GLM 完成 HN3 收口盘点，Codex 本地复核接受：node proof 9/9、build、tsc、cleanup 通过。 |
| Task 143 — V9 HN4-PLAN1 Militia / Defend branch contract | accepted | GLM-style worker + Codex review | 2026-04-15 | Codex 本地复核接受：HN4 合同定义 Militia / Back to Work / Defend 三个能力的最小数据字段、runtime 行为、proof 序列和禁区。node proof 5/5、build、tsc、cleanup、无残留通过。 |
| Task 144 — V9 HN4-DATA1 Militia data seed | accepted | GLM-style worker + Codex takeover | 2026-04-15 | GLM 完成数据种子；Codex 接管修正 `call_to_arms` 的主基地附近范围表达，并加固对象块 proof。node proof 10/10、build、tsc、cleanup、无残留通过。 |
| Task 145 — V9 HN4-IMPL2 Militia Call to Arms runtime slice | accepted | GLM-style worker + Codex takeover | 2026-04-15 | GLM 完成主体实现但卡在队列文档；Codex 接管补建造状态清理和 proof。build、tsc、focused runtime 6/6、node proof 10/10、cleanup、无残留通过。 |
| Task 146 — V9 HN4-IMPL3 Back to Work runtime slice | accepted | GLM-style worker + Codex takeover | 2026-04-16 | GLM 完成初版后 runtime / 旧回归卡住；Codex 接管改成数据驱动 `ABILITIES.back_to_work` 路径并修监控误判。build、tsc、runtime 12/12、node proof 10/10、lane-feed 50/50、cleanup、无残留通过。 |
| Task 147 — V9 HN4-DATA4 Defend ability data seed | accepted | GLM-style worker + Codex takeover | 2026-04-16 | GLM 写入初版数据后停在提示符；Codex 接管改为 `AttackType.Piercing` 类型化字段并补静态 proof。build、tsc、node proof 15/15、cleanup、无残留通过。 |
| Task 148 — V9 HN4-IMPL5 Defend runtime slice | accepted | GLM-style worker + Codex review | 2026-04-16 | GLM 完成 runtime 主体并修正 stale proof，Codex 复核接受：Footman 命令卡可切换“防御姿态”，开启后按 `ABILITIES.defend` 降低移速并只减少 Piercing 伤害；build、tsc、HN4 runtime 18/18、HN4 static 15/15、cleanup、无残留通过。 |
| Task 149 — V9 HN4-CLOSE6 Militia / Back to Work / Defend closure inventory | accepted | GLM-style worker + Codex review | 2026-04-16 | GLM 完成收口盘点后卡在队列文档编辑；Codex 本地复核接受：三条最小链路数据+runtime+命令卡均有入口，无 AI/英雄/素材/Sorceress/Knight。node proof 16/16、build、tsc、cleanup、无残留通过。 |
| Task 150 — V9 HN5-PLAN1 Sorceress / Slow branch contract | accepted | GLM-style worker + Codex review | 2026-04-16 | GLM 完成 HN5 合同和 proof，Codex 修正 Sorceress 仍应有弱远程 Magic 攻击后复核接受：node proof 11/11、build、tsc、cleanup、无残留通过。 |
| Task 151 — V9 HN5-DATA1 Sorceress + Slow data seed | accepted | GLM-style worker + Codex takeover | 2026-04-16 | GLM 写入核心数据后停在提示符；Codex 接管补 Magic 显示名/倍率占位和数据 proof。`UNITS.sorceress`、`AttackType.Magic`、`ABILITIES.slow` 已落地；Task152 之后 Arcane Sanctum 已可训练 Sorceress，但 `Game.ts` 仍无 Slow runtime。node proof 10/10、build、tsc、cleanup、无残留通过。 |
| Task 152 — V9 HN5-IMPL2 Sorceress training surface | accepted | GLM-style worker + Codex takeover | 2026-04-16 | GLM 只把 `sorceress` 加进 Arcane Sanctum 训练列表后停在提示符；Codex 接管补 runtime proof、旧阶段 proof 迁移、女巫名称/类型显示和 proxy 视觉。build、tsc、runtime 2/2、node proof 16/16 通过；Slow 仍未接 runtime。 |
| Task 153 — V9 HN5-IMPL3 Sorceress mana initialization surface | accepted | GLM-style worker + Codex takeover | 2026-04-16 | GLM 写入核心数据字段和 `spawnUnit` 数据化 mana 初始化后停在提示符；Codex 接管补 runtime proof。Sorceress / Priest 均从 `UNITS` 读取 mana，女巫可见 mana、可回复、不超过上限；Slow 仍无 runtime。build、tsc、runtime 5/5、node proof 16/16 通过。 |
| Task 154 — V9 HN5-IMPL4 Slow runtime minimal slice | accepted | GLM-style worker + Codex takeover | 2026-04-16 | GLM 写入初版 Slow runtime 后未补完整 proof；Codex 接管改为移动路径临时倍率，不直接覆盖基础速度，并补 runtime proof。build、tsc、runtime 9/9、node proof 16/16 通过。 |
| Task 155 — V9 HN5-IMPL5 Slow auto-cast minimal toggle | accepted | GLM-style worker + Codex takeover | 2026-04-16 | GLM 写入 auto-cast 半成品后反复 tail/grep runtime；Codex 接管补 repeat-spend guard 和 proof。Slow 自动施法开关、目标筛选、防重复耗蓝成立。build、tsc、runtime 8/8、node proof 16/16 通过。 |
| Task 156 — V9 HN5-CLOSE6 Sorceress / Slow closure inventory | accepted | GLM-style worker + Codex review | 2026-04-16 | GLM 写出 HN5 收口盘点后停在提示符；Codex 本地复核接受：Sorceress 数据、训练、mana、手动 Slow、自动 Slow 均有 proof，且未越界宣称 AI Slow、攻击速度减益、其他女巫技能、英雄、物品或素材。node proof 18/18 通过。 |
| Task 157 — V9 HN6-PLAN1 Castle / Knight branch contract | accepted | GLM-style worker + Codex review | 2026-04-16 | GLM 写出 Castle / Knight 合同和 proof 后停在 build 前；Codex 修正 Barracks 当前事实、Knight 多前置口径和 Castle reference 值后复核接受。node proof 7/7、build、tsc 通过。 |
| Task 158 — V9 HN6-DATA1 Castle data seed | accepted | GLM-style worker + Codex review | 2026-04-16 | Castle 数据种子完成并经 Codex 复核接受：`BUILDINGS.castle`（T3、hp 2500、trains worker）和 `keep.upgradeTo = 'castle'` 已落地。node proof 12/12、build、tsc 通过。`Game.ts` 未修改，无 Castle runtime，无 Knight。 |
| Task 159 — V9 HN6-IMPL2 Keep to Castle upgrade path | accepted | GLM-style worker + Codex takeover | 2026-04-16 | GLM 半启动后停在提示符；Codex 接管完成 runtime proof。Keep -> Castle 最小升级路径成立，Castle 完成后仍有 worker / rally，不暴露 Knight。build、runtime 9/9 通过。 |
| Task 160 — V9 HN6-PREREQ3 Knight prerequisite model | accepted | GLM-style worker + Codex review | 2026-04-16 | `UnitDef` 新增 `techPrereqs?: string[]`；Codex 修正说明为“只定义字段，runtime 另接”。现有单前置不变，Knight 后续使用 Castle + Blacksmith + Lumber Mill。node proof 13/13、build、tsc 通过。 |
| Task 161 — V9 HN6-DATA4 Knight data seed | accepted | GLM-style worker + Codex review | 2026-04-16 | `UNITS.knight` 数据种子落地（hp 835、armor 5、attackDamage 34、speed 3.5、techPrereqs 多前置）；Task161 收口时 Barracks trains 未加入 knight，Game.ts 不消费 techPrereqs。Codex 修正数值和过期 proof 后，static proof 24/24、build、tsc 通过。 |
| Task 162 — V9 HN6-IMPL5 Knight training prerequisite gate | accepted | GLM-style worker + Codex takeover | 2026-04-16 | Barracks 可训练 Knight；techPrereqs 多前置 runtime 已接入 getTrainAvailability/trainUnit；缺前置时 disabled 并显示原因；三前置齐全后走正常训练队列产出 Knight。Codex 补 runtime proof 并修正测试净收入误判；focused runtime 5/5、static proof 24/24、build、tsc 通过。 |
| Task 163 — V9 HN6-IMPL6 Knight combat identity smoke | accepted | GLM-style worker + Codex review | 2026-04-16 | Codex 本地复核接受：修正 KCS-1 不再读取运行时单位上不存在的 attackType / armorType 字段，改为数据表 + HUD 显示双重证明。runtime 3/3、static proof 13/13、build、tsc 通过。 |
| Task 164 — V9 HN6-CLOSE7 Castle / Knight closure inventory | accepted | Codex takeover | 2026-04-16 | GLM 开始后中途回到提示符且未产出 proof；Codex 接管完成 HN6 收口盘点。Castle 数据、Keep -> Castle、Knight 多前置、Knight 数据、训练门槛和战斗 smoke 均有 proof；node proof 6/6 通过。 |
| Task 165 — V9 HN7-PLAN1 Blacksmith / Animal Training branch contract | accepted | GLM-style worker + Codex review | 2026-04-16 | Codex 本地复核接受：软化未源校验的 War3 建筑/前置口径后，HN7 合同定义 Blacksmith 三段升级和 Animal War Training 的字段、影响单位、实现顺序和禁区；static proof 14/14、build、tsc 通过。 |
| Task 166 — V9 HN7-IMPL1 ResearchEffect maxHp support | accepted | GLM-style worker + Codex takeover | 2026-04-16 | GLM 半完成后回到提示符；Codex 接管收口并接受。ResearchEffect.stat 支持 maxHp，applyFlatDeltaEffect 同时增加 maxHp 和 hp；未新增研究数据、命令卡或 AI。node proof 26/26、build、tsc 通过。 |
| Task 167 — V9 HN7-IMPL2 ResearchDef prerequisiteResearch support | accepted | GLM-style worker + Codex review | 2026-04-16 | `ResearchDef.prerequisiteResearch?: string` 已落地；`getResearchAvailability` 检查研究间前置并返回"需要先研究<研究名>"；`startResearch` 复用 `getResearchAvailability`；static proof 10/10、build、tsc 通过。未新增 Blacksmith 升级数据、Animal War Training 或 AI。 |
| Task 168 — V9 HN7-DATA3 Iron Forged Swords Level 1 data seed | accepted | GLM-style worker + Codex takeover | 2026-04-16 | GLM 写入核心数据后回到提示符；Codex 接管收口并接受。Iron Forged Swords Level 1、cost 100/50、time 60、footman/militia/knight attackDamage +1、Blacksmith hook 已落地；无二/三级、Game.ts 或 AI。 |
| Task 169 — V9 HN7-IMPL4 Iron Forged Swords Level 1 runtime smoke | accepted | Codex takeover + GLM late supplement | 2026-04-16 | Codex 先接管完成 runtime smoke；GLM 后续补成 6 条 focused runtime。铁剑按钮、扣费、队列、已有近战 +1、新训练 Footman/Knight 继承、已有和新产出非近战不变均通过；Codex 复跑 focused runtime 6/6。 |
| Task 170 — V9 HN7-CLOSE5 Iron Forged Swords Level 1 closure inventory | accepted | GLM-style worker + Codex review | 2026-04-16 | closure inventory proof 11/11 + HN7 静态包联合 63/63 + focused runtime 6/6 通过。SRC3 源校验、DATA3 数据种子、IMPL4 runtime smoke 均有证据；Steel / Mithril、远程、护甲、AWT、AI、英雄、空军、物品、素材确认未落地。下一分支：HN7-SRC4 higher melee levels source reconciliation。 |
| Task 171 — V9 HN7-SRC4 Steel / Mithril source reconciliation | accepted | Codex source review + GLM queue sync | 2026-04-16 | SRC4 已接受：Blizzard Classic Battle.net 作为主源，Steel 175/175、Keep、75 秒；Mithril 250/300、Castle、90 秒；旧 GameFAQs 成本冲突仅作记录。当前项目按每级 incremental attackDamage +1 写入，DATA4 可以开启，但不得改 runtime 或夹带远程/护甲/AWT/AI。source proof 12/12。 |
| Task 172 — V9 HN7-DATA4 Steel / Mithril melee upgrade data seed | accepted | GLM-style worker + Codex takeover | 2026-04-16 | GLM 写入 Steel/Mithril 数据后停在 proof 修复中；Codex 接管收口。`steel_forged_swords` / `mithril_forged_swords`、Blacksmith hook、顺序前置和当前单位 +1 已落地；不改 Game.ts、不写 runtime、不做远程/护甲/AWT/AI。static proof 31/31 通过。 |
| Task 173 — V9 HN7-IMPL5 Steel / Mithril runtime smoke | accepted | GLM-style worker + Codex takeover | 2026-04-16 | GLM 写出 runtime spec 后未先 build 导致旧 dist 假红；Codex 接管后清理调试痕迹并按 build -> runtime 顺序复验。钢剑/秘银剑按钮、前置、扣费、队列完成、已有/新产出近战累计 +3、非近战不变均通过；focused runtime 7/7。 |
| Task 174 — V9 HN7-CLOSE6 melee weapon upgrade chain closure | accepted | GLM-style worker + Codex review | 2026-04-16 | Codex 复核接受：chain closure proof 14/14 + 联合 SRC3/SRC4/DATA3/DATA4 共 45/45 pass。近战三段源校验、数据种子、runtime smoke 均有证据；远程/护甲/AWT/AI/英雄/空军/物品/素材确认未落地；build、tsc 通过。下一分支：HN7-SRC5 ranged 或 HN7-SRC6 armor。 |
| Task 175 — V9 HN7-SRC5 ranged weapon source reconciliation | accepted | GLM-style worker + Codex takeover | 2026-04-16 | Codex 接管接受：独立 RANGED source packet + static proof 25/25、build、tsc 通过。Black / Refined / Imbued Gunpowder 采用 Blizzard 主源；Liquipedia 交叉校验；GameFAQs/Wowpedia 仅作待复核或阅读参考，不写成“所有来源完全一致”。 |
| Task 176 — V9 HN7-DATA5 ranged weapon upgrade data seed | accepted | GLM-style worker + Codex takeover | 2026-04-16 | GLM 写入核心 `GameData.ts` 数据后停在 proof；Codex 接管补静态证明并接受：ranged data proof 10/10 + source proof 11/11 + melee closure 14/14 = 35/35、build、tsc 通过。 |
| Task 177 — V9 HN7-IMPL6 ranged weapon runtime smoke | accepted | GLM-style worker + Codex review | 2026-04-16 | GLM 完成 runtime smoke；Codex 本地复核接受：远程三段按钮、前置、扣费、已有/新产出远程累计 +3、非远程不变均通过。focused runtime 7/7、build、tsc 通过。 |
| Task 178 — V9 HN7-CLOSE7 ranged weapon upgrade chain closure | accepted | GLM-style worker + Codex review | 2026-04-16 | Codex 本地复核接受：chain closure proof 14/14，联合 melee/ranged source/data/closure 共 49/49，runtime 7/7、build、tsc 通过；下一张：HN7-SRC6 armor upgrade source reconciliation。 |
| Task 179 — V9 HN7-SRC6 armor upgrade source reconciliation | accepted | GLM-style worker + Codex review | 2026-04-16 | Codex 本地复核接受：Plating 三段（Iron 125/75/60s、Steel 150/175/75s/Keep、Mithril 175/275/90s/Castle）已固定；每级 armor +2 只影响 Heavy armor 单位；Leather Armor 记录但不进 DATA6。source proof 12/12、build、tsc 通过。 |
| Task 180 — V9 HN7-DATA6 Plating armor upgrade data seed | accepted | GLM-style worker + Codex takeover | 2026-04-16 | GLM 写入核心数据和初版 proof 后停在队列收口，并提前写 Codex accepted；Codex 接管修正 source proof stale 断言并本地复核接受：armor data + source 21/21、build、tsc 通过。 |
| Task 181 — V9 HN7-IMPL7 Plating armor upgrade runtime smoke | accepted | GLM-style worker + Codex takeover | 2026-04-16 | GLM 初版 runtime smoke 缩窄了按钮断言；Codex 接管后发现 Blacksmith 10 个研究项被 8 格命令卡截断，先修为 12 格，Task198 后升级为 16 格以容纳 Leather Armor 后的 13 个研究按钮；Plating runtime 7/7、受影响 HUD/cleanup/construction 20/20、source+data 21/21、build、tsc 通过。 |
| Task 182 — V9 HN7-CLOSE8 Plating armor upgrade chain closure | accepted | GLM-style worker + Codex review | 2026-04-16 | GLM 写出 closure proof 后使用 tail 截断验证；Codex 加固命令卡容量 proof，Task198 后直接证明 16 格命令卡绑定 Game.ts/CSS：Plating closure 14/14，联合 SRC6/DATA6 35/35、build、tsc 通过。 |
| Task 183 — V9 HN7-SRC7 Animal War Training source reconciliation | accepted | GLM-style worker + Codex takeover | 2026-04-16 | GLM 写出来源包后停在提示符；Codex 接管补 source proof 并接受：AWT 为单级升级，125/125、40 秒、Barracks 研究、需 Castle + Lumber Mill + Blacksmith、knight maxHp +100；Classic 旧成本冲突已记录；source proof 14/14、build、tsc 通过。 |
| Task 184 — V9 HN7-MODEL8 Research multi-building prerequisite model | accepted | GLM-style worker + Codex takeover | 2026-04-16 | GLM 写出 requiresBuildings 字段和 getResearchAvailability 检查；Codex 加固：改为 runtime hook 注入临时研究（不修改 GameData），补 __war3Researches 暴露。runtime proof 5/5、build、tsc 通过。未写 AWT 数据/runtime/AI/英雄/空军/物品/素材。 |
| Task 185 — V9 HN7-DATA7 Animal War Training data seed | accepted | GLM-style worker + Codex review | 2026-04-16 | GLM 完成 AWT 数据种子；Codex 修正 source proof 不再依赖 DATA7 后复核接受：animal_war_training 125/125/40s、Barracks hook、requiresBuildings Castle+Lumber Mill+Blacksmith、knight maxHp +100。data+source 24/24、build、tsc 通过。 |
| Task 186 — V9 HN7-IMPL9 Animal War Training runtime smoke | accepted | Codex takeover | 2026-04-16 | GLM 收到任务后停在调研/API 错误；Codex 接管完成 focused runtime。Barracks 命令卡显示 AWT 按钮且缺建筑时禁用列全名；三建筑齐全可研究扣费 125/125；队列完成已有 Knight maxHp +100；新产出 Knight 继承 +100；非 Knight 不变。runtime 4/4、static 24/24、build、tsc 通过。 |
| Task 187 — V9 HN7-CLOSE10 Animal War Training closure inventory | accepted | GLM-style worker + Codex review | 2026-04-16 | Codex 本地复核接受：GLM 后改 remaining-gates 后曾让 AWT-CLOSE-13 失效，Codex 修正 proof 口径为“CLOSE10 已关闭并移动到 HN7 剩余项”。closure/data/source 38/38、build、tsc 通过。 |
| Task 188 — V9 HN7-AI11 Animal War Training AI strategy contract | accepted | GLM-style worker + Codex review | 2026-04-16 | Codex 本地复核接受：修掉会被后续正确推进打红的断言，不再锁死 remaining-gates 下一项名字，也不要求 SimpleAI 永远没有 AWT/Knight 文本。contract+closure proof 30/30、build、tsc 通过。 |
| Task 189 — V9 HN7-AI12 Animal War Training AI implementation slice | accepted | Codex takeover | 2026-04-16 | GLM 写出核心实现和初版 runtime 后停在诊断提示符；Codex 接管修正测试基座，改为复用默认 AI 主基地/兵营，并把 AWT key 改成读取 `RESEARCHES.animal_war_training.key`。build、tsc、focused runtime 8/8、AI strategy + AWT closure 30/30 通过。 |
| Task 190 — V9 HN7-AI13 Animal War Training AI closure inventory | accepted | GLM-style worker + Codex review | 2026-04-16 | closure proof 20/20 证明 AI11 合同+AI12 实现闭环（C1-C7 对齐、预算对齐、runtime 8 场景覆盖、禁区未触碰、优先级正确、无生产代码改动）；全部 static 50/50；build、tsc 通过。HN7 AWT 全链路闭环 SRC7→MODEL8→DATA7→IMPL9→AI11→AI12→AI13。 |
| Task 191 — V9 HN7-AI14 Blacksmith upgrade AI strategy contract | accepted | GLM-style worker + Codex review | 2026-04-16 | Codex 本地复核接受：GLM 写出 Blacksmith 三条三段升级链 AI 策略合同和静态 proof；定义通用条件、三条链独立条件、预算、优先级、Long Rifles/AWT 交互和禁区。static proof 24/24、build、tsc 通过；未改生产代码。 |
| Task 192 — V9 HN7-AI15 Blacksmith upgrade AI implementation slice | accepted | GLM-style worker + Codex takeover | 2026-04-16 | GLM 完成初版后在 BS-RT-6 上反复调试并改成弱断言；Codex 中断后接管，保留 Long Rifles 现有优先级，修正 runtime 场景污染并本地复核接受：build、tsc、focused runtime 18/18、strategy proof 24/24 通过。 |
| Task 193 — V9 HN7-AI16 Blacksmith upgrade AI closure inventory | accepted | GLM-style worker + Codex review | 2026-04-16 | GLM 写出 closure 文档和 proof 后在队列 closeout 编辑处遇到 API/network 错误；Codex 本地复核接受：closure+strategy static 56/56、build、tsc 通过。HN7 Blacksmith upgrade AI 全链路闭环。 |
| Task 194 — V9 HN7-SRC8 Leather Armor source and armor-type boundary | accepted | GLM-style worker + Codex review | 2026-04-16 | 源校验确认 Leather Armor 三段线数据（Studded/Reinforced/Dragonhide），并固定迁移前边界：当时 rifleman/mortar_team 为 Unarmored 非 Medium；结论需先做 Medium armor migration 合同；source proof 18/18、build、tsc 通过。 |
| Task 195 — V9 HN7-MODEL9 Medium armor migration contract | accepted | Codex takeover | 2026-04-16 | GLM 写出初版合同后中断；Codex 接管收窄合同：Rifleman 是唯一明确 Medium 迁移目标，Mortar Team 是兼容风险需单独决策，不能盲迁移。contract+Leather boundary proof 31/31、build、tsc 通过。 |
| Task 196 — V9 HN7-MODEL10 Mortar Team armor parity decision | accepted | GLM-style worker + Codex review | 2026-04-16 | GLM 写出 Mortar Team 护甲归属决策并经 Codex 本地复核接受：当前保持 Unarmored；War3 Heavy 作为后续 parity 债务记录；Leather Armor 未来按 targetUnitType 覆盖 mortar_team。parity+MODEL9 static 31/31、build、tsc 通过。 |
| Task 197 — V9 HN7-DATA8 Leather Armor data seed | accepted | GLM-style worker + Codex takeover | 2026-04-16 | GLM 写出数据种子后停在失败 proof；Codex 接管修正 proof 并本地复核接受：三段 Leather Armor 数据落地，targetUnitType 只含 rifleman + mortar_team；DATA8/source/parity/MODEL9 static 67/67、build、tsc 通过。 |
| Task 198 — V9 HN7-IMPL11 Leather Armor runtime smoke | accepted | GLM-style worker + Codex takeover | 2026-04-16 | GLM 接到任务后停在 interrupted / 无测试文件状态；Codex 接管完成 runtime proof，并修复 Leather Armor 加入后 Blacksmith 13 个研究按钮被 12 格命令卡截断的问题，命令卡扩到 16 格。Leather runtime 4/4、Plating+Ranged 相邻 runtime 14/14、相关 static 81/81、build、tsc 通过。 |
| Task 199 — V9 HN7-CLOSE12 Leather Armor closure inventory | accepted | GLM-style worker + Codex takeover | 2026-04-16 | GLM 写出 closure 文档后停在 interrupted / same-title freeze，未补 proof；Codex 接管补 `tests/v9-hn7-leather-armor-closure.spec.mjs` 并修正文档过期行号。Leather closure proof 18/18、联合 static 99/99、build、tsc 通过。 |
| Task 200 — V9 HN7-CLOSE13 Human Blacksmith branch global closure | accepted | GLM-style worker + Codex takeover | 2026-04-16 | GLM 写出全局闭环文档后再次停在 proof/closeout 之前；Codex 接管修正文档口径、补全静态 proof、修复过期 AWT AI 断言。单项 proof 22/22、联合 static 92/92、build、tsc 通过。 |
| Task 201 — V9 HUMAN-GAP1 Human core global gap inventory | accepted | GLM-style worker + Codex review | 2026-04-16 | Codex 本地复核接受：GLM 写出缺口盘点和 proof，但初版过度宣称“完整”并误写 AI Castle/Knight 已覆盖；Codex 修正为“最小链路/未完成”口径并加固 proof。gap static 24/24、联合 HN7 global 46/46、build、tsc 通过。下一张只允许 Altar + Paladin 英雄入口合同。 |
| Task 202 — V9 HERO1 Altar + Paladin branch contract | accepted | GLM-style worker + Codex review | 2026-04-16 | Codex 本地复核接受：GLM 写出 Altar + Paladin + Holy Light 合同和 proof；Codex 将未源校验的精确数值降级为候选参考值，并把下一步改为 source boundary。HERO1+HUMAN-GAP static 45/45、HN7+gap 46/46、build、tsc 通过。 |
| Task 203 — V9 HERO2-SRC1 Altar + Paladin + Holy Light source boundary | accepted | GLM-style worker + Codex review | 2026-04-16 | Codex 本地复核接受：GLM 写出来源边界后，Codex 修正 Holy Light mana 口径为当前 Blizzard Classic 主源 65，75 只保留为非采用样本；Paladin manaRegen 不再硬借 caster 默认值。source+HERO1 static 46/46、build、tsc 通过。 |
| Task 204 — V9 HERO3-DATA1 Altar of Kings data seed | accepted | GLM-style worker + Codex review | 2026-04-16 | Codex 本地复核接受：GLM 写入 Altar 数据后为过编译删掉 `armor: 5`；Codex 改为给 `BuildingDef` 补可选 `armor` 数据字段并恢复来源值。HERO3+HERO2+HERO1 static 62/62、build、tsc 通过；Altar 未暴露建造入口或 runtime。 |
| Task 205 — V9 HERO4-DATA2 Paladin data seed | accepted | GLM-style worker + Codex review | 2026-04-16 | Codex 本地复核接受：`UNITS.paladin` 数据种子和可选 hero 字段已落地；Paladin 没有 manaRegen，`Game.ts` / `SimpleAI.ts` 没有 runtime 引用，`holy_light` 仍未写入。HERO4+HERO3+HERO2+HERO1 static 82/82、lane-feed+companion 80/80、build、tsc 通过。 |
| Task 206 — V9 HERO5-DATA3 Holy Light ability data seed | accepted | GLM-style worker + Codex takeover | 2026-04-16 | GLM 写入 `TargetRule.excludeSelf?` 和 `ABILITIES.holy_light` 后遇到 API/network error；Codex 接管补 HERO5 proof 和旧 HERO 阶段化断言。HERO5+HERO4+HERO3+HERO2+HERO1 static 94/94、build、tsc 通过；仍无 Holy Light runtime、Paladin 命令卡、召唤、英雄 UI、AI 或素材。 |
| Task 207 — V9 HERO6-CONTRACT4 Altar runtime exposure contract | accepted | GLM-style worker + Codex review | 2026-04-16 | Codex 本地复核接受：HERO6 合同和 22 条静态 proof 成立；generic `trains` 泄漏风险已记录，Altar 建造入口、Paladin 召唤、mana 初始化和 Holy Light runtime 被拆成独立阶段。HERO6+HERO5 static 34/34、build、tsc 通过。 |
| Task 208 — V9 HERO6A-IMPL1 Altar construction runtime exposure | accepted | GLM-style worker + Codex review | 2026-04-16 | Codex 本地复核接受并加固 runtime proof：真实农民命令卡路径可放置并建成 Altar，扣费正确，完成后不显示 Paladin / Holy Light；generic `trains` 有 isHero guard。build、tsc、HERO6A runtime 4/4、HERO6+HERO5 static 35/35、cleanup、无残留通过。 |
| Task 209 — V9 HERO6B-IMPL2 Paladin hero summon runtime | accepted | GLM-style worker + Codex review | 2026-04-16 | Codex 本地复核接受并补强唯一性：完成的 Altar 可召唤圣骑士，扣费、队列、产出、mana 初始化成立；第二个 Altar 和直接 `trainUnit` 也不能绕过唯一性。build、tsc、HERO6B runtime 6/6、HERO6+HERO5 static 35/35、cleanup、无残留通过。 |
| Task 210 — V9 HERO7-IMPL1 Holy Light manual runtime | accepted | GLM-style worker + Codex review | 2026-04-16 | Codex 本地复核接受并补强 proof：Paladin 命令卡可点击圣光术，读取 `ABILITIES.holy_light`，治疗合法友军、扣 65 mana、5s 冷却、最多治疗到 max HP；self/enemy/building/full/out-of-range/low mana/cooldown 均被拦住。build、tsc、HERO7 runtime 7/7、HERO1-HERO6 static 117/117、cleanup、无残留通过。 |
| Task 211 — V9 HERO8-CLOSE1 Hero minimal runtime closure inventory | accepted | GLM-style worker + Codex review | 2026-04-16 | Codex 本地复核接受：最小 Altar + Paladin + Holy Light 英雄链路已完成收口盘点；node proof 26/26、build、tsc 通过。完整英雄系统仍未完成，复活、XP、升级、其他三英雄、AI、物品和素材仍关闭。 |
| Task 212 — V9 HERO9-CONTRACT1 Hero death and revive branch contract | accepted | GLM-style worker + Codex review | 2026-04-16 | Codex 本地复核接受并修正唯一性语义：新召唤看同类型英雄记录是否存在，复活入口单独看 `isDead === true`。HERO9 contract proof 27/27、build、tsc 通过；未改生产代码。 |
| Task 213 — V9 HERO9-SRC1 Hero death / revive source boundary | accepted | GLM-style worker + Codex review | 2026-04-16 | Codex 本地复核接受并补强来源链接与取整口径：复活费用/时间/HP/mana、死亡不留普通尸体、死亡英雄仍占人口和视觉/选择 deferred 已记录；source proof 24/24、build、tsc 通过；未改生产 runtime。 |
| Task 214 — V9 HERO9-IMPL1 Hero death-state runtime slice | accepted | GLM-style worker + Codex takeover | 2026-04-16 | GLM 自动压缩后 interrupted，Codex 接管并接受：Paladin 死亡保留记录、`isDead=true`、`hp=0`、停止行动/索敌、继续挡新召唤，死 Paladin 不能放圣光。source proof 24/24、build、tsc、focused runtime 19/19、cleanup 通过。无复活按钮/队列。 |
| Task 215 — V9 HERO9-DATA1 Hero revive data seed | accepted | GLM-style worker + Codex takeover | 2026-04-16 | Codex 接管复核接受：`HERO_REVIVE_RULES` 已进入 `GameData.ts`，复活金币/木材/时间/HP/mana 映射和 Paladin 例子均由静态 proof 证明；Codex 修正 Paladin HP 示例为当前真实 650。联合 static 49/49、build、tsc、cleanup 通过；`Game.ts` 未接复活按钮/队列。 |
| Task 216 — V9 HERO9-CONTRACT2 Altar revive runtime contract | accepted | GLM-style worker + Codex review | 2026-04-16 | Codex 本地复核接受：祭坛复活按钮/队列运行时合同成立，费用、时间 `Math.round` 映射、队列形状、同一英雄记录恢复、禁区和 no-runtime 边界均有 proof。联合 static 85/85、build、tsc 通过；`Game.ts` 未接复活 runtime。 |
| Task 217 — V9 HERO9-IMPL2 Altar revive runtime | accepted | GLM-style worker + Codex takeover | 2026-04-16 | Codex 接管接受：GLM 初版写入复活按钮/队列后停在编辑错误，并绕过运行时锁反复直跑 Playwright；Codex 补完复活公式统一计算、队列刷新、血条/可选中对象恢复和 runtime proof。static 85/85、build、tsc、focused runtime 21/21、cleanup、无残留通过。 |
| Task 218 — V9 HERO9-CLOSE1 Hero death / revive closure inventory | accepted | GLM-style worker + Codex review | 2026-04-16 | Codex 本地复核接受：HERO9 death + revive closure inventory 成立。27/27 静态 proof、112/112 联合 proof、build、tsc、cleanup 通过。明确排除 XP/升级/技能点/物品/光环/其他英雄/酒馆/商店/AI/视觉/空军/第二种族/多人/发布。不声称完整英雄系统或完整人族。 |
| Task 219 — V9 HERO10-CONTRACT1 Hero XP / leveling branch contract | accepted | GLM-style worker + Codex review | 2026-04-16 | Codex 本地复核接受：HERO10 XP / leveling 分支合同完成。51/51 静态 proof、联合 HERO9 closure 78/78、build、tsc、cleanup 通过。当前状态边界明确（heroLevel/heroXP/heroSkillPoints 为数据种子），升级保留 HERO9 语义，技能点仅为就绪概念，下一序列 SRC1→DATA1→IMPL1→CLOSE1。不声称完整英雄系统或完整人族。 |
| Task 220 — V9 HERO10-SRC1 XP / level / skill-point source boundary | accepted | GLM-style worker + Codex review | 2026-04-16 | Codex 本地复核接受：XP / 等级 / 技能点来源边界成立，采用 Blizzard Classic Hero Basics 为主源；固定等级阈值、英雄击杀 XP、creep XP 限制、普通单位 XP 公式、最高 10 级、初始 1 技能点、每级 +1 技能点、终极 6 级开放。source+contract proof 127/127、build、tsc、cleanup、无残留通过；未改生产代码。 |
| Task 221 — V9 HERO10-DATA1 XP / leveling data seed | accepted | GLM-style worker + Codex review | 2026-04-16 | Codex 本地复核接受并收紧 proof：`GameData.ts` 新增 `HERO_XP_RULES` 数据种子，数据表完全来自 Task220；文档措辞修正为“数据种子”，不宣称 DATA1 阶段已接 runtime。54/54 data proof、130/130 联合 source proof、build、tsc、cleanup、无残留通过；Task222 后 `Game.ts` 开始消费该常量。 |
| Task 222 — V9 HERO10-IMPL1 minimal unit-kill XP runtime | accepted | GLM-style worker + Codex takeover | 2026-04-16 | GLM 写出核心实现但在 XP-6 复活证明上反复 timeout，并把资源花费断言弱化为 `>= 0`；Codex 中断接管，补受控 fixture、恢复精确 level-2 revive 花费证明，并收窄中立/creep XP 边界。build、tsc、HERO10 runtime 6/6、HERO9 revive runtime 7/7、source/data proof 130/130、cleanup、无残留通过。 |
| Task 223 — V9 HERO10-UX1 Paladin XP visible feedback slice | accepted | GLM-style worker + Codex takeover | 2026-04-16 | GLM 写出 HUD 主体和初版 proof，但没有 rebuild 就跑 runtime，导致旧 dist 全红，并继续用 tail/grep 截断输出；Codex 接管修正 UX-5 为真实复活后选择路径。build、tsc、UX runtime 5/5、HERO10 runtime 6/6、cleanup、无残留通过。 |
| Task 224 — V9 HERO10-CLOSE1 XP / leveling visible chain closure inventory | accepted | GLM-style worker + Codex takeover | 2026-04-16 | GLM 写出 HERO10 静态闭环盘点和 proof 后卡在队列编辑循环；Codex 中断接管并本地复核接受。closure proof 31/31、build、tsc、cleanup、无残留通过。HERO10 只关闭 Paladin 最小 XP/升级可见链，不代表完整英雄系统、完整人族或 V9 发布。 |
| Task 225 — V9 HERO11-CONTRACT1 Hero skill learning / Holy Light level branch contract | accepted | GLM-style worker + Codex review | 2026-04-16 | Codex 本地复核接受：HERO11 技能学习 / Holy Light 升级分支合同成立。34/34 静态 proof、build、tsc、cleanup、无残留通过。当前基线明确（技能点可见不可消费），消费机制定义（命令卡入口，1 点=1 级），Holy Light 为首目标，复活保留等级，HERO7/9/10 回归边界列出。 |
| Task 226 — V9 HERO11-SRC1 Holy Light levels / skill-learning rules source boundary | accepted | GLM-style worker + Codex takeover | 2026-04-16 | GLM 写出来源文档后进入 context limit / compact 中断；Codex 接管修正来源优先级、Holy Light 学习等级门槛和项目映射，补静态 proof。source proof 9/9、build、tsc、cleanup、无残留通过。采纳 Holy Light 200/400/600、亡灵伤害 100/200/300、65 mana、5s、80→8.0、学习等级 1/3/5。 |
| Task 227 — V9 HERO11-DATA1 Holy Light level data seed | accepted | GLM-style worker + Codex takeover | 2026-04-16 | Codex 本地复核接受：`GameData.ts` 新增 `HeroAbilityLevelDef` 和 `HERO_ABILITY_LEVELS.holy_light`（等级 1/2/3，治疗 200/400/600，亡灵伤害 100/200/300，mana 65，cd 5，range 8.0，学习等级 1/3/5）。`ABILITIES.holy_light` 不变，`Game.ts` 不消费。DATA1+SRC1 proof 39/39、build、tsc、cleanup、无残留通过。 |
| Task 228 — V9 HERO11-IMPL1 Holy Light skill-point spend runtime | accepted | GLM-style worker + Codex takeover | 2026-04-16 | GLM 越界补 DATA1 proof/doc 且一度用截断验证，Codex 接管后接受必要阶段升级并补强 runtime：Paladin 消费技能点学习/升级 Holy Light，等级治疗读取 `HERO_ABILITY_LEVELS`，复活保留能力等级。build、tsc、HERO11 6/6、HERO7 7/7、HERO9 7/7、DATA1+SRC1 39/39、cleanup 和 30 秒观察均通过。 |
| Task 229 — V9 HERO11-UX1 Holy Light learned level visible feedback | accepted | GLM-style worker + Codex review | 2026-04-16 | Codex 本地复核接受：Holy Light 已学等级、下一等级门槛、治疗量和剩余技能点可见；Codex 补强为 `技能点 0` 也显示。build、tsc、UX1 runtime 6/6、Task228 runtime 6/6、DATA1+SRC1 39/39、cleanup 和 30 秒观察通过。 |
| Task 230 — V9 HERO11-CLOSE1 Holy Light skill learning closure inventory | accepted | GLM-style worker + Codex review | 2026-04-16 | Codex 本地复核接受：HERO11 合同、来源、数据、技能点消费 runtime、可见反馈和遗留边界已静态收口；只关闭 Paladin Holy Light 最小学习链，不宣称完整英雄系统、人族或 V9 发布。closure proof 36/36、build、tsc、cleanup 和 30 秒观察通过。 |
| Task 231 — V9 HERO12-CONTRACT1 Paladin Divine Shield branch contract | accepted | GLM-style worker + Codex review | 2026-04-16 | Codex 本地复核接受：Divine Shield 分支合同和 37 条静态 proof 成立；未改生产代码、未写数值数据、未跑浏览器。contract proof 37/37、build、tsc、cleanup 和 30 秒观察通过。 |
| Task 232 — V9 HERO12-SRC1 Divine Shield source boundary | accepted | GLM-style worker + Codex review | 2026-04-16 | Codex 本地复核接受：Divine Shield 来源边界采用 Blizzard Classic Battle.net Paladin 页面为主源，固定 15/30/45 持续、35/50/65 秒冷却、25 mana、自身/无敌、学习等级 1/3/5、不可主动取消。Codex 修正 proof 的否定句误判后，source+contract proof 61/61、build、tsc、cleanup 和 30 秒观察通过。 |
| Task 233 — V9 HERO12-DATA1 Divine Shield level data seed | accepted | GLM-style worker + Codex takeover/review | 2026-04-16 | Codex 接管复核接受：Divine Shield 只落 `HERO_ABILITY_LEVELS.divine_shield` 等级数据，保持 `ABILITIES` 和 `Game.ts` runtime 关闭；source proof 已阶段化。static proof 78/78、build、tsc、cleanup 和 30 秒观察通过。 |
| Task 234 — V9 HERO12-IMPL1A Divine Shield learn surface | accepted | GLM-style worker + Codex takeover/review | 2026-04-16 | Codex 接管复核接受：Paladin 可学习 Divine Shield Lv1/2/3，技能点消费、等级门槛、HUD 可见、死亡复活保留成立；仍无施放/无敌 runtime。runtime 19/19、static 78/78、build、tsc、cleanup 和进程清理通过。 |
| Task 235 — V9 HERO12-IMPL1B Divine Shield self-cast runtime | accepted | GLM-style worker + Codex takeover/review | 2026-04-16 | Codex 接管复核接受：Divine Shield 可自我施放，读取 `HERO_ABILITY_LEVELS.divine_shield`，25 mana、15/30/45 秒持续、35/50/65 秒冷却、临时免伤、过期恢复和复活重置成立；runtime 29/29、static 78/78、build、tsc、cleanup 通过。 |
| Task 236 — V9 HERO12-UX1 Divine Shield visible active/cooldown feedback | accepted | GLM-style worker + Codex takeover/review | 2026-04-16 | Codex 接管复核接受：选择面板显示 Divine Shield 生效剩余秒数，命令卡显示生效/冷却/魔力不足原因并能随时间刷新；runtime 22/22、static 78/78、build、tsc、cleanup 通过。 |
| Task 237 — V9 HERO12-CLOSE1 Divine Shield branch closure inventory | accepted | GLM-style worker + Codex review | 2026-04-16 | Codex 接管复核接受：HERO12 Divine Shield 证据链、玩家当前能力和明确延后范围完成静态收口；closure+HERO12 static 113/113、build、tsc、cleanup 通过。 |
| Task 238 — V9 HERO13-CONTRACT1 Paladin Devotion Aura branch contract | accepted | GLM-style worker + Codex review | 2026-04-16 | Codex 本地复核接受：Devotion Aura 合同、实现顺序、禁区和 no-production-code proof 成立；Codex 收窄受影响目标/叠加规则必须等 SRC1。static 72/72、build、tsc 通过。 |
| Task 239 — V9 HERO13-SRC1 Devotion Aura source boundary | accepted | GLM-style worker + Codex takeover | 2026-04-16 | Codex 接管复核接受：官方来源值、90→9.0 项目映射、目标/建筑/多来源边界和 no-runtime proof 成立；static 102/102、build、tsc 通过。 |
| Task 240 — V9 HERO13-DATA1 Devotion Aura data seed | accepted | GLM-style worker + Codex review | 2026-04-16 | Codex 本地复核接受：`HERO_ABILITY_LEVELS.devotion_aura` 已落地，armor +1.5/+3/+4.5、`auraRadius: 9.0`、mana/cooldown 0、学习等级 1/3/5；`Game.ts` 和 `ABILITIES` 仍未接运行时。static 119/119、build、tsc、cleanup 通过。 |
| Task 241 — V9 HERO13-IMPL1 Devotion Aura minimal passive aura runtime | accepted | GLM-style worker + Codex takeover | 2026-04-16 | GLM 初版越界写学习按钮/HUD，被 Codex 取消并接管；最小被动护甲光环 runtime 已完成。runtime 5/5、相邻 HERO11/12/9 runtime 23/23、static 119/119、build、tsc、cleanup 通过。 |
| Task 242 — V9 HERO13-IMPL2 Devotion Aura learn surface | accepted | GLM-style worker + Codex takeover/review | 2026-04-16 | Codex 本地复核接受：Paladin 已能学习 Devotion Aura Lv1/2/3，技能点消费、等级门槛、复活保留和被动 runtime 触发成立；仍无施法按钮和 HUD 状态。learn+runtime 9/9、相邻 HERO11/12/9 runtime 23/23、static 119/119、build、tsc、强制 cleanup 通过。 |
| Task 243 — V9 HERO13-UX1 Devotion Aura visible feedback | accepted | GLM-style worker + Codex takeover/review | 2026-04-16 | Codex 接管复核接受：Paladin 已学 Devotion Aura 时显示等级，受光环影响的友方单位显示护甲加成；离开范围/来源死亡后消失；敌人/建筑不显示；仍无施法按钮。UX+learn+runtime 14/14、相邻 HERO11/12/9 runtime 23/23、static 119/119、build、tsc、cleanup 通过。 |
| Task 244 — V9 HERO13-CLOSE1 Devotion Aura branch closure inventory | accepted | GLM-style worker + Codex takeover/review | 2026-04-16 | Codex 本地复核接受：Devotion Aura 合同、来源、数据、被动 runtime、学习入口和可见反馈证据链已静态收口；closure+HERO13/HERO12 static 168/168、build、tsc、cleanup 通过。 |
| Task 245 — V9 HERO14-CONTRACT1 Paladin Resurrection branch contract | accepted | GLM-style worker + Codex takeover/review | 2026-04-16 | Codex 接管复核接受：Resurrection 分支合同、HERO14-SRC1→DATA1→IMPL1→UX1→CLOSE1 顺序、禁区和 no-production-code proof 成立；HERO14/HERO13/HERO12 static 114/114、build、tsc、cleanup 通过。 |
| Task 246 — V9 HERO14-SRC1 Resurrection source boundary | accepted | GLM-style worker + Codex takeover/review | 2026-04-16 | Codex 接管复核接受：Resurrection 主源、200 mana/240s/Range40/AoE90/6 corpses/Level6、150 mana 二源歧义、HP/mana/尸体时间/source-unknown 和项目映射已绑定；source+contract+HERO13/HERO12 static 144/144、build、tsc、cleanup 通过。 |
| Task 247 — V9 HERO14-DATA1 Resurrection level data seed | accepted | GLM-style worker + Codex takeover/review | 2026-04-16 | Codex 接管复核接受：`HERO_ABILITY_LEVELS.resurrection` 数据种子、`areaRadius/maxTargets` 可选字段、数据文档和阶段化 proof 已完成；DATA+SRC+CONTRACT+HERO13/HERO12 static 162/162、build、tsc、cleanup 通过。 |
| Task 248 — V9 HERO14-IMPL1A Resurrection learn surface | accepted | GLM-style worker + Codex takeover/review | 2026-04-16 | Codex 接管复核接受：Paladin 可在 6 级且有技能点时学习 Resurrection Lv1，学习消耗 1 点，复活后保留；仍无施放按钮、复活效果、尸体系统、HUD、AI 或素材。static 162/162、build、tsc、learn runtime 3/3、HERO9 revive 回归 7/7、cleanup 通过。 |
| Task 249 — V9 HERO14-IMPL1B Resurrection dead-unit record substrate | accepted | GLM-style worker + Codex takeover/review | 2026-04-17 | Codex 接管复核接受：友方普通单位死亡记录底座成立；team1、建筑、英雄不进记录；地图重开清空；HERO9 复活独立。build、tsc、focused runtime 12/12、static 162/162、cleanup 通过。 |
| Task 250 — V9 HERO14-IMPL1C Resurrection minimal no-target cast runtime | accepted | GLM partial + Codex takeover/review | 2026-04-17 | GLM 写出 Game.ts 初版和 cast 测试后停在提示符且验证使用 `tail`；Codex 接管修正目标过滤、死亡位置、最早死亡优先和阶段化 proof。build、tsc、focused runtime 17/17、static 162/162、cleanup 通过。 |
| Task 251 — V9 HERO14-UX1 Resurrection visible feedback minimal slice | accepted | GLM partial + Codex takeover/review | 2026-04-17 | Codex 接管复核接受：单位属性面板显示 `复活术 Lv1`、`刚复活 N 个单位` 和 `复活冷却 Ns`；命令按钮冷却原因随 HUD 刷新变化；仍无 ABILITIES/AI/素材。build、tsc、runtime 22/22、static 162/162、cleanup 通过。 |
| Task 252 — V9 HERO14-CLOSE1 Resurrection branch closure inventory | accepted | GLM-style worker + Codex review | 2026-04-17 | Codex 本地复核接受：Resurrection 分支静态收口已完成，closure doc + 34 项 closure proof 汇总 Task245-252 证据链、玩家当前能力和延后边界；Codex 修正测试数量口径。closure+data+source+contract static 112/112、build、tsc、cleanup 通过；未改生产代码。 |
| Task 253 — V9 HERO15-CLOSE1 Paladin minimal ability kit global closure inventory | accepted | GLM-style worker + Codex review | 2026-04-17 | Codex 本地复核接受：Paladin 最小能力套件全局静态收口完成，HERO1-HERO14 证据链、当前玩家能力和延后边界已盘清；Codex 去掉未来源支撑的“53 个子任务”精确说法。HERO8-HERO15 closure static 278/278、build、tsc、cleanup 通过；未改生产代码。 |
| Task 254 — V9 HERO16-CONTRACT1 Paladin AI hero strategy boundary | accepted | GLM-style worker + Codex review | 2026-04-17 | Codex 接管复核接受：Paladin AI 英雄策略分阶段合同成立，AI1-AI5 顺序、禁区、Devotion Aura 被动边界和当前 SimpleAI 无 Paladin 行为均有 proof。HERO16+HERO15 static 79/79、build、tsc、cleanup 通过；未改生产代码。 |
| Task 255 — V9 HERO16-AI1 AI Altar build + Paladin summon readiness slice | accepted | GLM-style worker + Codex takeover/review | 2026-04-17 | Codex 接管复核接受：AI 可在经济和唯一性条件满足时建造 Altar 并召唤一个 Paladin；不学习/施放技能，不接其他英雄/物品/素材。build、tsc、runtime 5/5、cleanup 通过。 |
| Task 256 — V9 HERO16-AI2 AI Paladin skill-learning priority slice | accepted | GLM-style worker + Codex review | 2026-04-17 | Codex 本地复核接受：AI Paladin 有技能点时按 HL -> DS -> DA -> Res 顺序学习，尊重英雄等级门槛，不施法。build、tsc、runtime 11/11、cleanup 通过。 |
| Task 257 — V9 HERO16-AI3 AI Holy Light defensive cast slice | accepted | GLM partial + Codex takeover/review | 2026-04-17 | Codex 接管复核接受：AI Paladin 复用现有 Holy Light 路径治疗受伤友军，不复制治疗公式；build、tsc、runtime 14/14、cleanup 通过。 |
| Task 258 — V9 HERO16-AI4 AI Divine Shield self-preservation slice | accepted | GLM partial + Codex takeover/review | 2026-04-17 | Codex 接管复核接受：AI Paladin 复用现有 Divine Shield 路径，在低生命且条件合法时自施放；build、tsc、runtime 17/17、cleanup 通过。 |
| Task 259 — V9 HERO16-AI5 AI Resurrection cast slice | accepted | GLM partial + Codex takeover/review | 2026-04-17 | Codex 接管复核接受：AI Paladin 复用现有 Resurrection 路径施放；deadUnitRecords 扩展为 team0/team1 可控阵营记录，仍过滤中立/英雄/建筑；build、tsc、runtime 28/28、cleanup、diff check 通过。 |
| Task 260 — V9 HERO16-CLOSE1 Paladin AI strategy closure inventory | accepted | GLM partial + Codex takeover/review | 2026-04-17 | Codex 接管复核接受：HERO16 AI1-AI5 证据链、当前真实能力、旧“无 AI”历史口径和明确延后范围已对齐；build、tsc、static proof 96/96、cleanup、diff check 通过；未新增运行时行为。 |
| Task 261 — V9 HERO17-CONTRACT1 Archmage branch boundary contract | accepted | GLM partial + Codex takeover/review | 2026-04-17 | Codex 接管复核接受：Archmage 分支边界合同和静态 proof 已完成，明确当前无 Archmage 数据/运行时/AI，后续必须 source-first；build、tsc、static proof 93/93、cleanup、diff check 通过。 |
| Task 262 — V9 HERO17-SRC1 Archmage source boundary packet | accepted | GLM-style worker + Codex correction/review | 2026-04-17 | Codex 修正后接受：Hero 攻击映射为 Normal、Mass Teleport 采用主源 20s、Water Elemental 活跃上限/死亡记录延后、Altar 暴露拆出 data seed；static 88/88、build、tsc、cleanup 通过。 |
| Task 263 — V9 HERO17-DATA1 Archmage unit data seed | in_progress | GLM-style worker + Codex review | 2026-04-17 | 下一张相邻任务：只添加 `UNITS.archmage` 数据种子和静态 proof；不得修改 Altar 训练列表、不得添加能力数据/运行时/AI。 |
| AI 圣骑士技能学习优先级证明包 | accepted | GLM-style worker + Codex review | 2026-04-17 | 自动补货生成的同向重复任务；GLM no-op closeout 与 Task256 本地复验一致，Codex 以 Task256 accepted 覆盖验收，不得再派发。 |
| Task 112 — V8 demo path smoke pack | accepted | GLM-style worker + Codex review | 2026-04-15 | Codex 本地复核接受：补强入口范围说明和反馈方式后，build、tsc、V8 smoke 5/5、cleanup、无残留均通过。V8-DEMO1、V8-COPY1、V8-FEEDBACK1 工程证据可用。 |
| Task 113 — V8 release candidate stability pack | accepted | GLM-style worker + Codex review | 2026-04-15 | Codex 本地复核接受：suite syntax、build、tsc、V8 RC 5/5、cleanup、无残留均通过。V8-RC1 工程通过，V8 blocker 清零。 |
| Task 114 — V8 feedback capture proof | superseded | GLM-style worker + Codex review | 2026-04-15 | 已被 Task112 smoke + `docs/V8_FEEDBACK_CAPTURE_AND_TRIAGE_PACKET.zh-CN.md` 覆盖；除非 Codex 复核后重新打开 V8-FEEDBACK1，否则不再派发。 |
| Task 107 — Lumber Mill 与塔分支最小可玩切片 | accepted | GLM-style worker + Codex review | 2026-04-15 | Codex 本地复核通过：build、tsc、V7 focused 6/6、command-surface 13/13、cleanup，无 `lumber_mill` 视觉越界残留。 |
| Task 108 — Arcane Sanctum 法师基础切片 | accepted | GLM-style worker + Codex review | 2026-04-15 | Job `glm-mnzk34f0-kmvssx` 已由 Codex 本地复核接受。Codex 补强敌方治疗拦截和 Arcane Sanctum 正常训练 Priest 证明；build、tsc、focused 9/9、相关 V7/command 回归 30/30 通过，cleanup 后无 runtime 残留。 |
| Task 109 — Workshop / Mortar 战斗模型切片 | accepted | GLM-style worker + Codex takeover | 2026-04-15 | GLM job `glm-mnzguyn3-wtjxp7` 卡在可选 UI/显示名细节并被取消；Codex 接管完成 Workshop + Mortar Team + Siege AOE/filter proof。Focused runtime 3/3、相关回归 23/23 通过。 |
| Task 110 — V7 内容 AI 同规则使用切片 | accepted | GLM-style worker + Codex takeover | 2026-04-15 | GLM job `glm-mnzi2shn-un2pwe` 两次 proof-5 失败并使用 tail 截断输出；Codex 取消 job 后接管。AI 同规则使用 V7 Tower/Workshop/Mortar 内容，且修复开局预算保护，focused 8/8、相关回归 18/18 通过。 |
| Task 111 — V7 beta 稳定性回归包 | accepted | GLM-style worker + Codex takeover | 2026-04-15 | GLM job `glm-mnzkxeb9-4x4f6w` 卡在自动压缩，且初版测试在 `page.evaluate` 中误用 Node import、提前改 `V7-STAB1`。Codex 取消 job 后接管完成：新增稳定性包 5/5，完整 V7 内容包 31/31，build、tsc、cleanup 均通过。 |
| Task 01 — Resource/Supply Regression Pack | completed | GLM | 2026-04-11 | Accepted at commit `a64833d`; Codex reran locked runtime pack, 9/9 passed. |
| Task 02 — Unit Visibility Contract Pack | completed | Codex | 2026-04-11 | Added visibility runtime pack and fixed W3X camera reset; `npm run test:runtime` passed 33/33. |
| Task 04 — Selection/Input Contract Pack | completed | GLM + Codex review | 2026-04-11 | Accepted at commit `96d9d4a`; Codex integrated it into `test:runtime`. |
| Task 05 — Pathing/Footprint Contract Pack | completed | GLM + Codex review | 2026-04-11 | Accepted at commit `edd0bde`; Codex tightened blocked-start proof and integrated spec into `test:runtime`. |
| Task 06 — AI First Five Minutes Deepening | completed | GLM + Codex review | 2026-04-11 | Added AI economy regression pack; Codex tightened weak assertions, fixed flashHit crash, and integrated into `test:runtime`. |
| Task 07 — Asset Pipeline Contract Pack | completed | GLM + Codex takeover | 2026-04-11 | Accepted after Codex takeover. Asset pipeline runtime spec green; fixed `Material[]` clone and attack animation scale reset. |
| Task 03 — Building Placement Agency Pack | completed | Codex takeover | 2026-04-11 | GLM stalled in exploration; Codex completed at commit `6290f90`. Runtime pack 57/57 passed locally. |
| Task 09 — Death/Cleanup Contract Pack | completed | Codex takeover | 2026-04-11 | GLM stalled in broad exploration; Codex completed core pack directly. `death-cleanup-regression.spec.ts` 5/5 green. |
| Task 10 — Placement Controller Development Slice | completed | GLM + Codex review | 2026-04-11 | Accepted at commit `14bd7ba`; Codex reran build, app typecheck, and 17 affected runtime tests locally. GitHub Actions for this commit was still in progress at acceptance update time. |
| Task 11 — Construction Lifecycle Contract Pack | completed | Codex takeover | 2026-04-11 | GLM stalled in broad exploration; Codex implemented resumable construction, cancel, refund, footprint release, HUD cleanup, builder cleanup, and runtime proof. |
| Task 12 — Static Defense Combat Contract Pack | completed | GLM + Codex review | 2026-04-11 | Accepted at commit `24eeea1`; 7/7 static defense tests + 5/5 death cleanup + 7/7 command regression passed. Codex integrated the spec into `test:runtime`. |
| Task 13 — Command Disabled Reasons Pack | completed | Codex takeover | 2026-04-11 | GLM created an initial failing spec but refresh assertions needed correction; Codex completed explicit disabled reasons, cache invalidation, runtime proof, and `test:runtime` integration. |
| Task 14 — Unit Collision Presence Pack | completed | GLM + Codex takeover | 2026-04-11 | GLM started the separation baseline; Codex corrected exact-overlap math, added runtime proof, and integrated the spec into `test:runtime`. |
| Task 15 — Combat Control Contract Pack | completed | GLM + Codex takeover | 2026-04-11 | GLM drafted the regression pack but it initially failed 8/8; Codex exposed the real command dispatcher to runtime tests, fixed the HoldPosition chase/restore bug, and integrated the spec into `test:runtime`. |
| Task 16 — M2 Gate Regression Packet | completed | GLM + Codex review | 2026-04-11 | Added `npm run test:m2` and `docs/M2_GATE_PACKET.zh-CN.md`; Codex reran `npm run test:m2`, 32/32 passed. |
| Task 17 — M3 Scale/Layout Benchmark Spec | completed | GLM + Codex review | 2026-04-11 | Added `docs/M3_WAR3_FEEL_BENCHMARK.zh-CN.md`; Codex corrected the Farm footprint recommendation to avoid fractional occupancy. |
| Task 18 — M3 Scale Measurement Baseline | completed | GLM-5.1 | 2026-04-12 | Measurement-only runtime pack for M3 objective ratios. Tests pass. |
| Task 19 — Order Model Boundary Inventory | completed | GLM + Codex review | 2026-04-12 | Completed at commit `8e8d017`; added order-model boundary inventory and regression proof. |
| Task 20 — Builder-Stealing Fix | completed | GLM + Codex review | 2026-04-12 | Completed at commit `7fa441e`; fixed active construction builder stealing and added 3 construction lifecycle tests. Codex verified build, app typecheck, and four M4 specs individually green. |
| Task 21 — Runtime Harness Fast-Start | completed | GLM | 2026-04-12 | Partial infrastructure improvement. `?runtimeTest=1` skips W3X auto-load, per-test time ~8-9s -> ~5.8-6.5s. Individual M4 specs pass. Full `npm run test:runtime` still >10min, not a stable local gate. |
| Task 22 — Runtime Sharded Gate | completed | GLM + Codex closeout | 2026-04-12 | Completed at commit `2e7421d`; `npm run test:runtime` replaced with sharded script. 5/5 shards passed, 103 tests, 13m total. Replaces old single-command runtime. |
| Task 23 — M3 Scale Contract Implementation | completed | GLM + Codex correction | 2026-04-12 | Completed locally; Codex corrected the farm measurement flaw so M3 measures completed buildings only. Verification green: build, app typecheck, M3 spec, visibility/pathing/selection affected pack. |
| Task 24 — M4 Player-Reported UX Reality Pack | completed | GLM + Codex correction | 2026-04-12 | M4 spec added and corrected. Verification green: build, app typecheck, M4 pack 6/6, affected construction/static-defense/resource/unit-presence pack 29/29. |
| Task 25 — M4 War3 Command Surface Matrix | completed | GLM | 2026-04-12 | 11/11 command surface tests green. Game.ts fixes: tower weapon stats in HUD, crowded goldmine right-click target priority, findUnitByObject parent-chain helper. |
| Task 26 — AI Gold Saturation Contract | completed | GLM | 2026-04-12 | 12/12 AI economy tests green. SimpleAI saturation cap + dynamic rally; 3 new saturation/lumber/build-loop tests. |
| Task 27 — Goldmine Clickability Contract | completed | Codex takeover | 2026-04-12 | GLM stalled twice without file changes. Codex added left-click crowded-goldmine contracts and a selection-priority fix; command-surface spec now passes 13/13. |
| Task 08 — Game.ts Module Extraction Slice | completed | GLM-5.1 | 2026-04-12 | Extracted `FeedbackEffects.ts`; build, typecheck, and runtime gate green. |
| Task 28 — M3 Base Grammar Measurement Pack | completed | GLM-5.1 | 2026-04-12 | 5/5 deterministic spatial grammar tests green. Measured TH/GM/BK/tree/exit relationships. |
| Task 29 — M3 Camera/HUD Readability Contract | completed | GLM-5.1 | 2026-04-12 | 4/4 deterministic camera/HUD readability tests green. No product code changes needed. |
| Task 30 — M4 Victory/Defeat Loop Pack | completed | GLM-5.1 | 2026-04-12 | 4/4 deterministic victory/defeat loop tests green. Added endGame detection, HUD overlay, and phase transition. |
| Task 31 — M4 AI Recovery Pack | completed | GLM-5.1 | 2026-04-13 | 4/4 deterministic AI recovery tests green. Supply overshoot bounded ≤2 with in-progress farm proof. No product code changes. |
| Task 32 — M6 Live Build Smoke Pack | completed | GLM-5.1 | 2026-04-13 | 5/5 live-build smoke tests green. KNOWN_ISSUES + M6 gate packet synced. No product code changes. |
| Task 33 — M7 SelectionController Extraction Slice | completed | GLM-5.1 | 2026-04-13 | Extracted selection query/display helpers into SelectionController. Zero behavior change. Full runtime suite 5/5 shards, 117 tests passed. |
| Task 34 — M7 PlacementController Hardening Slice | completed | GLM-5.1 | 2026-04-13 | Extracted ghost preview mesh creation + validation color feedback into PlacementController. Zero behavior change. Building/construction/pathing pack 21/21 passed. |
| Task 35 — M7 Contract Coverage Gap Sweep | completed | GLM-5.1 | 2026-04-13 | HUD command-card cache transition regression 5/5 passed. No product code changes needed. Chosen gap: stale buttons/disabled reasons across selection transitions. |
| G2-01 — TH-GM Gather Corridor Contract | completed | GLM-5.1 | 2026-04-13 | TH-to-goldmine opening corridor not pinched by trees. 6/6 M3 grammar tests pass. No product code changes. |
| Task 61 — Session Return-To-Menu Seam Slice | completed | GLM-style worker + Codex review | 2026-04-13 | Game.returnToMenu() resets session+pauses; main.ts wires pause/results return buttons; 3/3 return-to-menu + 6/6 transition matrix pass (9 total). |
| Task 62 — Front-Door Re-entry Start Loop Pack | completed | GLM-style worker + Codex review | 2026-04-13 | After a real return-to-menu seam exists, prove the menu can start the next session again without stale shell or phase leakage. |
| Task 41 — 已批准素材目录边界包 | blocked | GLM-style worker | 2026-04-13 | 等第一批素材完成来源、授权、风格和回退审批后再启动；现在不是可执行任务。 |
| Task 63 — Menu Shell Mode Truth Boundary Slice | completed | GLM-style worker + Codex review | 2026-04-13 | Make the front door honest about the current playable entry mode without inventing a fake mode-select tree. |
| Task 64 — Help / Controls Shell Entry Slice | completed | GLM-style worker + Codex review | 2026-04-13 | Expose one truthful help / controls surface from the menu or pause shell using only controls that are actually implemented. |
| Task 65 — Settings Shell Truth Boundary Slice | completed | GLM-style worker + Codex review | 2026-04-13 | Expose one truthful settings surface without pretending unsupported graphics/audio/control systems already exist. |
| Task 66 — Pre-Match Briefing Truth Slice | completed | GLM-style worker + Codex review | 2026-04-13 | Add one truthful pre-match briefing/loading seam before live play so the product no longer jumps straight from front door to battlefield with no understanding layer. |
| Task 67 — Mode Select Placeholder Truth Slice | completed | GLM-style worker + Codex review | 2026-04-13 | Expose one real mode-select shell from the front door while keeping only the actually implemented path enabled. |
| Task 68 — Manual Map Reset Truth Slice | completed | GLM-style worker + Codex review | 2026-04-13 | After a manual map has been selected, expose one truthful reset path back to the default/procedural source. |
| Task 69 — Shell Backstack Truth Pack | completed | GLM-style worker + Codex review | 2026-04-13 | Make menu-level secondary shells return to their prior shell truthfully instead of hard-jumping to a guessed destination. |
| Task 70 — Briefing Continue Start Seam | completed | GLM-style worker + Codex review | 2026-04-13 | Turn the new pre-match briefing from a passive flash state into one truthful continue/start seam before live play. |
| Task 71 — Briefing Source Truth Pack | completed | GLM-style worker + Codex review | 2026-04-13 | Keep the briefing shell aligned with the real current source and entry mode after manual map changes, resets, and return-to-menu. |
| Task 72 — Secondary Shell Escape/Back Contract | completed | GLM-style worker + Codex review | 2026-04-13 | Make escape/back semantics truthful across menu-level secondary shells without leaking into gameplay controls. |
| Task 73 — Front-Door Source Persistence Slice | completed | GLM-style worker + Codex review | 2026-04-13 | Keep the front-door shell truthful about the current source and mode while navigating through non-start shell pages in the same browser session. |
| Task 74 — Menu Action Availability Truth Pack | completed | GLM-style worker + Codex review | 2026-04-13 | Make front-door action enabled/disabled states line up with the real currently implemented routes. |
| Task 75 — Front-Door Last Session Summary Slice | completed | GLM-style worker + Codex review | 2026-04-13 | Expose one minimal truthful last-session summary on the front door after return-to-menu, without inventing metagame or campaign framing. |
| Task 76 — Mode-Select Disabled Branch Rationale Pack | completed | GLM-style worker + Codex review | 2026-04-13 | If mode-select shows unavailable branches, make their rationale truthful and non-actionable. |
| Task 77 — Front-Door Last Session Summary Reset Contract | completed | GLM-style worker + Codex review | 2026-04-13 | If the front door shows a last-session summary, make its reset and overwrite behavior truthful across new sessions and source changes. |
| Task 78 — Menu Primary Action Focus Contract | completed | GLM-style worker + Codex review | 2026-04-13 | Keep front-door and mode-select primary action focus aligned with the real actionable route as more shell surfaces accumulate. |
| Task 79 — Shell Visible-State Exclusivity Pack | completed | GLM-style worker + Codex review | 2026-04-13 | Keep menu-level shell states mutually exclusive so accumulating front-door/help/settings/mode-select/briefing surfaces do not overlap or leak. |
| Task 80 — Front-Door Session Summary Dismiss Contract | completed | GLM-style worker + Codex review | 2026-04-13 | If the front door shows last-session summary state, make dismiss/clear behavior truthful without corrupting the underlying source or mode state. |
| Task 81 — Secondary Shell Copy Truth Pack | completed | GLM-style worker + Codex review | 2026-04-13 | Keep visible shell copy aligned with implemented behavior as menu/help/settings/briefing surfaces accumulate. |
| Mode-Select Conditional Branch Proof Pack | completed | GLM-style worker + Codex review | 2026-04-13 | PS3 needs deterministic proof that visible mode-select branches are truthful rather than fake product breadth. |
| Help And Settings Surface Truth Pack | completed | GLM-style worker + Codex review | 2026-04-13 | PS4 needs bounded proof that help and settings surfaces contain real current-slice information rather than decorative containers. |
| Task 57 — Front-Door Boot Gate Contract | completed | GLM-style worker + Codex review | 2026-04-13 | Stop dropping a normal visitor directly into live gameplay. The page should open to a truthful front door while runtime-test mode still bypasses it. |
| Task 58 — Menu Shell Start Current Map Slice | completed | GLM-style worker + Codex review | 2026-04-13 | Give `#menu-shell` one real start action using the already truthful current-map/procedural seam. |
| Task 59 — Menu Shell Current Map Source Truth Pack | completed | GLM-style worker + Codex review | 2026-04-13 | Make the front door honest about what map source will start, especially after manual map selection. |
| Task 60 — Menu Shell Manual Map Entry Slice | completed | GLM-style worker + Codex review | 2026-04-13 | Expose one truthful manual map-selection entry from the front door so source changes happen in-menu instead of through a hidden side path. |
| Task V3-OPEN1 — Starting Worker Auto-Mine Slice | completed | GLM-style worker + Codex review | 2026-04-13 | User asked for a faster opening: starting workers should enter gold-mining by default without breaking saturation or rally truth. |
| Task V2-PS1 — Front-Door Baseline Proof Pack | completed | GLM-style worker + Codex review | 2026-04-13 | Close the PS1 blocker by making the normal visitor front door and start-current-map path truthful under focused proof. |
| Task V2-PS2 — Session Shell No-Residue Pack | completed | GLM-style worker + Codex review | 2026-04-13 | Close the PS2 blocker by proving visible session shells do not leak stale state across pause/setup/results/reset transitions. |
| Task V2-PS6 — Results Summary Truth Pack | completed | GLM-style worker + Codex review | 2026-04-13 | Close the PS6 blocker by making visible results and last-session summary surfaces reflect only real session facts. |
| Task V2-BF1 — Basic Visibility No-Regression Pack | completed | GLM-style worker + Codex review | 2026-04-13 | Close the BF1 blocker by proving the default entry path still shows controllable units, structures, and resources without camera/HUD credibility failures. |
| PS1 Front-Door Baseline Proof Rerun | completed | GLM-style worker + Codex review | 2026-04-13 | Produce current command evidence for the normal visitor front door without claiming a complete main menu. |
| PS2 Session-Shell No-Residue Proof Rerun | completed | GLM-style worker + Codex review | 2026-04-13 | Produce current command evidence that visible pause/setup/results/reload/reset seams do not leak stale state. |
| PS6 Results Summary Truth Proof Rerun | completed | GLM-style worker + Codex review | 2026-04-13 | Produce current command evidence that visible results and last-session summary fields come from real session state. |
| BF1 Basic Visibility Four-Proof Rerun | completed | GLM-style worker + Codex review | 2026-04-13 | Produce current command evidence for BF1 basic visibility and no-regression without claiming V3 readability. |
| PS1 前门基线证据复跑 | completed | GLM-style worker + Codex review | 2026-04-13 | 补一轮当前候选版的 PS1 实测证据，确认普通入口和开始当前地图是否仍然成立。 |
| PS2 会话壳层无残留证据复跑 | completed | GLM-style worker + Codex review | 2026-04-13 | 补一轮 PS2 实测证据，确认 pause/setup/results/reload/reset 之间没有 stale state 泄漏。 |
| PS6 结果摘要真实性证据复跑 | completed | GLM-style worker + Codex review | 2026-04-13 | 补一轮 PS6 实测证据，确认结果页和上局摘要字段都来自真实 session state。 |
| PS2 会话壳层无残留复跑 | completed | GLM-style worker + Codex review | 2026-04-14 | Codex closeout recorded focused pack `24/24`; pause、setup、results、reload、terminal reset 工程无残留，未关闭 return-to-menu/re-entry 或用户理解度。 |
| PS6 结果摘要真实性复跑 | completed | GLM-style worker + Codex review | 2026-04-13 | 补一轮结果页和上局摘要实测，确认可见字段都来自真实 session state。 |
| BF1 基础可见性四证据复跑 | completed | GLM-style worker + Codex review | 2026-04-14 | Codex closeout recorded complete four-proof pack `11/11`; accepted only as BF1 basic visibility / no-regression proof, not V3 readability or asset import approval. |
| Task 94 — V3 Human Opening Grammar Proof Pack | completed | GLM-style worker + Codex review | 2026-04-13 | 把 TH / 金矿 / 树线 / 出口 / 兵营 / 农场 / 塔的开局空间关系变成客观可复跑的 proof pack。 |
| Task 95 — V3 Default Camera Readability Pack | completed | GLM-style worker + Codex review | 2026-04-13 | 证明默认镜头下 worker、footman、核心建筑和资源点是一眼可读的，而不是只是“存在”。 |
| Task 96 — V3 Camera HUD Footprint Harmony Pack | completed | GLM-style worker + Codex review | 2026-04-13 | 把默认镜头、HUD 遮挡、selection ring、footprint 与 choke/gap 感知之间的关系收成一个 focused pack。 |
| Task 97 — V3 Return/Re-entry Product-Shell Pack | completed | GLM-style worker + Codex review | 2026-04-13 | 把 V2 residual 的 return-to-menu / re-entry 推进成 V3 product-shell clarity 的真实路径。 |
| 基地空间语法测量包 | completed | GLM-style worker + Codex review | 2026-04-13 | 补一轮默认战场的空间关系实测，确认主基地、金矿、树线、出口和早期建筑不是随机摆放。 |
| 默认镜头角色可读性包 | completed | GLM-style worker + Codex review | 2026-04-13 | 复查默认镜头下九类关键对象是否能被分辨，补齐截图、测量和回归证据。 |
| 返回菜单再开局证明包 | completed | GLM-style worker + Codex review | 2026-04-13 | 证明从 pause/results 返回菜单后，旧对局不会继续运行，再次开始也不会带旧状态。 |
| 开局解释层收口包 | completed | GLM-style worker + Codex review | 2026-04-13 | 让开始路径经过一个诚实解释层，告诉玩家当前来源、模式、控制或目标，不伪装成完整模式系统。 |
| V3 BG1 基地空间语法收口复跑 | completed | GLM-style worker + Codex review | 2026-04-14 | 补一轮 V3-BG1 focused proof，确认基地、矿区、树线、出口和生产区的关系真能被测出来。 |
| V3 RD1 默认镜头可读性收口复跑 | completed | GLM-style worker + Codex review | 2026-04-14 | 补一轮默认镜头对象可读性 focused pack，确认关键对象不是只有”存在”，而是真的一眼能分辨。 |
| V3 PS2 返回再开局收口复跑 | completed | GLM-style worker + Codex review | 2026-04-14 | 补一轮 return-to-menu / re-entry focused proof，确认返回后 inactive、再开局 clean session。 |
| V3 PS3 开局解释层收口复跑 | completed | GLM-style worker + Codex review | 2026-04-14 | 补一轮 explanation layer focused pack，确认开始前的说明层讲的都是真的，而且能把玩家带进当前 slice。 |
| CH1 镜头HUD协同证明包 | completed | GLM-style worker + Codex review | 2026-04-14 | 补齐默认镜头、HUD、选中圈和 footprint 提示的同屏证据，确认它们不会互相破坏读图。 |
| AV1 回退素材验证包 | completed | GLM-style worker + Codex review | 2026-04-14 | 验证当前工程只使用合法 proxy、fallback 或 hybrid 路线，并把缺图状态写进 manifest。 |
| BG1 同 build 空间证明包 | completed | GLM-style worker + Codex review | 2026-04-14 | 补齐同一版本的默认镜头截图、布局说明和回归证明，让基地空间关系能被一次性审查。 |
| RD1 九类对象可读证明包 | completed | GLM-style worker + Codex review | 2026-04-14 | `tests/v3-default-camera-readability-proof.spec.ts` 10/10 passed。九类对象都有 on-screen measurement proof 和材质/剪影记录。engineering-pass；人眼 verdict 归 V3-UA1。 |
| PS1 入口焦点证明包 | completed | GLM-style worker + Codex review | 2026-04-14 | `tests/v3-product-shell-focus-proof.spec.ts` 8/8 passed。Primary action hierarchy、source/mode truth、disabled branch audit、no fake route scan 全部通过。修复了 pause shell 在 front-door 时拦截点击的问题。 |
| V3 CH1 镜头HUD协同收口复跑 | completed | GLM-style worker + Codex review | 2026-04-14 | M3 + V3 CH1 specs 11/11 passed。Viewport framing、HUD safe area、selection ring、health bar、ghost footprint、exit corridors 全部 harmony。engineering-pass。 |
| PS2 返回再开局证明包 | completed | GLM-style worker + Codex review | 2026-04-14 | `tests/v3-product-shell-return-reentry-proof.spec.ts` 6/6 passed (54.3s)。Pause return、results return、source truth preserved、clean re-entry、stale cleanup、full cycle 全部通过。engineering-pass；用户可理解度归 V3-PS5。 |
| PS2 残留交互清理证明包 | completed | GLM-style worker + Codex review | 2026-04-14 | `tests/v3-product-shell-stale-cleanup-proof.spec.ts` 6/6 passed (1.1m)。Selection/rings/healthbars、placement/ghost/modes、command-card empty slots、overlay shells、multi-session stress、14-point audit 全部通过。修复了 `disposeAllUnits()` 命令卡 DOM 不刷新 bug。 |
| AV1 回退目录验证包 | completed | GLM-style worker + Codex review | 2026-04-14 | `tests/v3-asset-fallback-catalog-proof.spec.ts` 6/6 passed (33.6s)。九类 A1 target key 全部 resolve 到 S0 fallback，factory 产出有效 mesh，无外部引用。新增 AssetCatalog fallback manifest。 |
| V3 AV1 素材回退清单验证包 | completed | GLM-style worker + Codex review | 2026-04-14 | `tests/asset-pipeline-regression.spec.ts` 5/5 passed (33.3s)。四类状态 (legal-proxy/fallback/hybrid/blocked) 已记录，pipeline 回归全绿，无 approved packet 时无真实素材加载。Manifest §10 收口复核已写入。 |
| RD1 截图标注证明包 | completed | GLM-style worker + Codex review | 2026-04-14 | `tests/v3-default-camera-readability-proof.spec.ts` 11/11 pass (1.2m)。新增 screenshot capture test + annotation binding (`artifacts/v3-rd1-readability/annotation-binding.md`)。V3-RD1 升级为 engineering-pass。 |
| P1 开局压力证明包 | completed | GLM-style worker + Codex review | 2026-04-14 | `tests/v4-opening-pressure-proof.spec.ts` 6/6 pass (1.3m)。AI 在 t≈180s 发起进攻波次，t≈192s 摧毁玩家主基地（defeat）。4 波进攻、13 个农民、2 个步兵、生产设施完好。V4-P1 engineering-pass。 |
| R1 恢复反打证明包 | completed | GLM-style worker + Codex review | 2026-04-14 | `tests/v4-recovery-counter-proof.spec.ts` 5/5 pass (38.4s)。AI disabled 受控 fixture：kill 3 workers → train replacements → gather resumes → train footmen → attack-move toward AI base。Command surfaces clean。V4-R1 engineering-pass。 |
| E1 胜负结果证明包 | completed | GLM-style worker + Codex review | 2026-04-14 | GLM proof 已完成；Codex 复核时补齐 stall 和真实按钮返回路径，`tests/v4-ending-result-truth-proof.spec.ts` 6/6 pass (48.5s)。Defeat/victory/stall、summary 全量字段、真实 results 返回按钮清理、无 fake 标签。V4-E1 engineering-pass。 |
| Task 101 — ECO1 经济产能主链证明包 | completed | GLM-style worker + Codex review | 2026-04-14 | `tests/v5-economy-production-backbone.spec.ts` 6/6 pass (57.5s)。Gold income、lumber income、supply chain、full production cycle、damage recovery、comprehensive audit。AI disabled 受控 fixture。V5-ECO1 engineering-pass。 |
| Task 102 — TECH1 科技建造顺序证明包 | completed | GLM-style worker + Codex review | 2026-04-14 | `tests/v5-tech-build-order-backbone.spec.ts` 6/6 pass (50.9s)。Build order timeline (TH→workers→gather→farm→barracks→footman)、resource prerequisite (0 gold=build buttons disabled)、building prerequisite (no barracks=no footmen)、supply prerequisite (cap=training blocked)、observable progression、6-point behavioral audit。V5-TECH1 engineering-pass。 |
| Task 103 — COUNTER1 基础克制与兵种组成证明包 | completed | Codex takeover + GLM stall review | 2026-04-14 | GLM 超过软上限且 focused proof 首轮失败；Codex 收窄为最小战略证明，`tests/v5-counter-composition-backbone.spec.ts` 5/5 通过。 |
| Task 104 — H1 Blacksmith 与 Rifleman 可玩切片 | done | GLM glm-mnycfk6e-75jqo7 | 2026-04-14 | COMPLETED: Blacksmith building, Rifleman unit with tech prereq gate, ranged attack, proxy visuals, 2/2 tests passing. |
| Task 105 — H1 Long Rifles 研究切片 | done | GLM glm-mnydimiy-l1t3aw | 2026-04-14 | COMPLETED: Long Rifles research via real queue, range 4.5→6.0, applies to existing+new riflemen, cannot re-research, command card states, 2/2 tests passing. |
| Task 106 — H1 AI Rifleman 组成切片 | done | GLM glm-mnyea7t2-yfzjrd | 2026-04-14 | COMPLETED: AI builds blacksmith, trains riflemen, researches Long Rifles, forms mixed composition. No prereq bypass. 2/2 tests passing. |
| 攻击护甲最小模型证明包 | done | GLM-style worker + Codex review | 2026-04-15 | NUM-C：关机中断记录已单独归档，本任务可恢复执行；实现最小 attackType / armorType 字段和倍率表，证明同一攻击值对不同护甲类型有不同结果，且原护甲减伤仍生效。 |
| 研究效果数据模型证明包 | done | GLM-style worker + Codex review | 2026-04-15 | NUM-D：把 Long Rifles 这类研究效果从单点常量整理为 data-driven research effect model，证明研究效果来自数据、不能重复叠加、命令卡状态真实、cleanup 不残留。 |
| 玩家可见数值提示证明包 | accepted | GLM-style worker + Codex review | 2026-04-15 | NUM-E：Codex 已本地复核并加固测试；build、typecheck、NUM-C/NUM-D/NUM-E runtime 共 15/15 通过。 |
| 人族集结号令最小证明包 | accepted | GLM-style worker + Codex takeover | 2026-04-15 | V6-ID1：GLM 写出初版后卡在 auto-compact；Codex 取消 job、清理残留并接管复核。build、typecheck、focused + 相关回归 runtime 30/30 通过。 |
| Footman / Rifleman 角色差异证明包 | accepted | GLM-style worker + Codex takeover | 2026-04-15 | V6-FA1：GLM 初版 runtime 失败并卡在 queued prompt 后由 Codex 接管修正；build、typecheck、FA1 focused 5/5、相关 runtime pack 22/22 通过。 |
### Task 117 — V9 Human completeness ledger consistency pack

Status: `accepted`.

Owner: Codex takeover.

Priority: V9-EXPAND1 follow-up after baseline acceptance; prevents stale Human background docs from generating duplicate or already-completed work.

Allowed files:

- `docs/HUMAN_RACE_CAPABILITY_BOARD.zh-CN.md`
- `docs/V9_HUMAN_NUMERIC_EXPANSION_PACKET.zh-CN.md`
- `tests/v9-human-completeness-ledger.spec.mjs`
- `docs/GLM_READY_TASK_QUEUE.md` only for closeout sync

Goal:

把人族能力背景板刷新到当前代码事实：Rifleman、Blacksmith、Lumber Mill、Guard Tower gate、Workshop、Mortar Team、Arcane Sanctum、Priest、Long Rifles、attack/armor type、Priest mana/heal、Mortar AOE 都已经是当前样本，不允许继续被旧文档当作“缺失”重复派发。

Must prove:

1. `GameData.ts` 当前对象表和 `docs/HUMAN_RACE_CAPABILITY_BOARD.zh-CN.md` 的“当前已有 / 缺失 / 后置”分类一致。
2. 文档不再把 `rifleman`、`blacksmith`、`lumber_mill`、`workshop`、`mortar_team`、`arcane_sanctum`、`priest`、`long_rifles` 写成当前缺失。
3. 仍然明确缺失 Militia / Back to Work、Defend、Keep / Castle、Knight、Sorceress、Spell Breaker、Flying Machine、Siege Engine、Gryphon / Dragonhawk、Altar / heroes、Arcane Vault / items。
4. 任务只做 ledger / consistency proof，不新增 gameplay 内容、素材、AI 策略或新版本路线。
5. 生成的后续建议必须仍服从 `docs/V9_HUMAN_NUMERIC_EXPANSION_PACKET.zh-CN.md` 的 HN1-HN4 顺序。

Verification:

```bash
npm run build
npx tsc --noEmit -p tsconfig.app.json
node --test tests/v9-human-completeness-ledger.spec.mjs
./scripts/cleanup-local-runtime.sh
```

Closeout note:

- GLM 写出背景板更新和初版 proof 后在低上下文处被 Codex 取消并接管；Codex 修正 node proof，并完成 build、tsc、node test 5/5、cleanup、无残留复核。

### Task 118 — V9 HN2 tier and prerequisite schema boundary pack

Status: `accepted`.

Owner: Codex takeover.

Priority: HN2 follow-up after Human ledger consistency; prepare the data model before Keep / Castle / Knight / caster-training implementation.

Allowed files:

- `docs/V9_TIER_PREREQUISITE_SCHEMA_PACKET.zh-CN.md`
- `tests/v9-tier-prerequisite-schema.spec.mjs`
- `docs/GLM_READY_TASK_QUEUE.md` only for closeout sync

Goal:

盘点当前 `GameData.ts` 里的 `techPrereq`、`requiresBuilding`、`trains`、`researches`、`PEASANT_BUILD_MENU`，为 Keep / Castle、Knight、Sorceress、Spell Breaker 和后续 caster training 固定最小数据模型。这个任务只做 schema 边界和 proof，不改 gameplay。

Must prove:

1. 当前前置事实被测试读出来：Rifleman 需要 Blacksmith、Long Rifles 需要 Blacksmith、Tower 需要 Lumber Mill、Arcane Sanctum 需要 Barracks。
2. 当前生产事实被测试读出来：Barracks 训练 Footman / Rifleman，Workshop 训练 Mortar Team，Arcane Sanctum 训练 Priest。
3. schema packet 定义后续最小字段：Keep / Castle tier、upgrade-to、research level、unit unlock、building unlock。
4. 不实现 Keep、Castle、Knight、Sorceress、Spell Breaker、heroes、items、assets 或任何新 gameplay。
5. 只提出一个 HN2 后续实现切片建议，不扩张成完整科技树。

Verification:

```bash
npm run build
npx tsc --noEmit -p tsconfig.app.json
node --test tests/v9-tier-prerequisite-schema.spec.mjs
./scripts/cleanup-local-runtime.sh
```

Closeout note:

- GLM 完成 schema packet 和 node proof 后，Codex 本地复核并加固 proof：把全文件字符串查找改成对象级文本解析，并把下一步从误写的 HN3 修正为 HN2-IMPL1。build、tsc、node test 5/5、cleanup、无残留通过。

### Task 119 — V9 HN2-IMPL1 Keep tier contract pack

Status: `accepted`.

Owner: Codex takeover.

Priority: HN2 implementation guard after Task118; prevent the next step from jumping straight into full Keep / Castle / Knight gameplay.

Allowed files:

- `docs/V9_KEEP_TIER_IMPLEMENTATION_CONTRACT.zh-CN.md`
- `tests/v9-keep-tier-contract.spec.mjs`
- `docs/GLM_READY_TASK_QUEUE.md` only for closeout sync

Goal:

为下一张 Keep tier seed 实现任务写清楚“只做什么、不做什么、怎么验收”：它应该只把 `BuildingDef` / `BUILDINGS` 的 tier / upgrade 字段接出来，并证明不会开启完整 Castle、Knight、Sorceress、Spell Breaker、英雄、物品或素材线。这个任务不改 gameplay。

Must prove:

1. contract 明确下一张实现切片名称为 `HN2-IMPL1 — Keep tier seed`。
2. contract 明确允许的未来实现文件：`src/game/GameData.ts`、一个 focused node proof，以及必要的 Human/V9 文档同步；默认不碰 `Game.ts`。
3. contract 明确最小字段：`techTier`、`upgradeTo`，并说明 `researchLevel`、`unitUnlock`、`buildingUnlock` 只保留为后续字段，不在 HN2-IMPL1 全量接入。
4. proof 证明 contract 没有要求一次实现 Castle、Knight、Sorceress、Spell Breaker、heroes、items、assets 或完整科技树。
5. proof 证明 Task118 schema packet 仍指向 `HN2-IMPL1`，没有重新把 Keep 归到 HN3。

Verification:

```bash
npm run build
npx tsc --noEmit -p tsconfig.app.json
node --test tests/v9-keep-tier-contract.spec.mjs
./scripts/cleanup-local-runtime.sh
```

Closeout note:

- GLM 初版 closeout 后，Codex 本地复核发现上游 schema packet 仍残留 `keep -> castle` 指令，会让下一张实现任务冲突。
- Codex 修正 `docs/V9_TIER_PREREQUISITE_SCHEMA_PACKET.zh-CN.md`、`docs/V9_KEEP_TIER_IMPLEMENTATION_CONTRACT.zh-CN.md`、`tests/v9-tier-prerequisite-schema.spec.mjs` 和 `tests/v9-keep-tier-contract.spec.mjs`：HN2-IMPL1 只允许 `townhall.upgradeTo = 'keep'` 与 `keep.techTier = 2`，`keep` 不加 `upgradeTo`。
- Codex 本地复核：`node --test tests/v9-human-completeness-ledger.spec.mjs tests/v9-tier-prerequisite-schema.spec.mjs tests/v9-keep-tier-contract.spec.mjs tests/lane-feed.spec.mjs tests/queue-refill.spec.mjs tests/board-closeouts.spec.mjs` 81/81 通过；`npm run build`、`npx tsc --noEmit -p tsconfig.app.json` 通过。

### Task 120 — V9 HN2-IMPL1 Keep tier data seed

Status: `accepted`.

Owner: GLM-style worker + Codex takeover.

Priority: Task119 已把实现边界锁住；现在可以进入最小数据种子，但仍不能打开完整 T2/T3 科技树。

Allowed files:

- `src/game/GameData.ts`
- `tests/v9-keep-tier-seed-proof.spec.mjs`
- `tests/v9-tier-prerequisite-schema.spec.mjs`
- `docs/HUMAN_RACE_CAPABILITY_BOARD.zh-CN.md`
- `docs/V9_TIER_PREREQUISITE_SCHEMA_PACKET.zh-CN.md`
- `docs/V9_KEEP_TIER_IMPLEMENTATION_CONTRACT.zh-CN.md`
- `docs/GLM_READY_TASK_QUEUE.md` only for closeout sync

Goal:

按 Task119 合同落下 Keep tier 的最小数据种子：`BuildingDef` 支持 `techTier` / `upgradeTo`，`townhall` 明确是 T1 且只指向 `keep`，`keep` 作为 T2 主基地数据存在，但不指向尚未实现的 Castle。

Required implementation:

1. 在 `BuildingDef` 增加 `techTier?: 1 | 2 | 3`。
2. 在 `BuildingDef` 增加 `upgradeTo?: string`。
3. `BUILDINGS.townhall` 增加 `techTier: 1` 和 `upgradeTo: 'keep'`，保留现有 `trains: ['worker']`。
4. `BUILDINGS.keep` 新增为 T2 主基地数据种子：
   - `key: 'keep'`
   - `name: '主城'`
   - `cost: { gold: 320, lumber: 210 }`
   - `buildTime: 45`
   - `hp: 2000`
   - `supply: 0`
   - `size: 4`
   - `description` 明确这是 T2 主基地数据种子
   - `techTier: 2`
   - 不加 `upgradeTo`
   - 不加 `trains`、`researches`、`unitUnlock`、`buildingUnlock`
5. 同步 `tests/v9-tier-prerequisite-schema.spec.mjs` 到 seed 后事实：允许 `keep`，仍禁止 `castle` 和任何新单位/科技。
6. 新增 `tests/v9-keep-tier-seed-proof.spec.mjs`，用文本解析证明字段归属，不直接 import TS。
7. 同步 Human 背景板里 Keep 当前状态：可以写成“数据种子已存在；升级流程、外观、解锁和 Castle 仍缺失”。

Forbidden:

- 不改 `src/game/Game.ts`。
- 不把 `keep` 加入 `PEASANT_BUILD_MENU`。
- 不实现 `castle`。
- 不实现 Knight、Sorceress、Spell Breaker、Flying Machine、Siege Engine、英雄、物品或商店。
- 不新增素材。
- 不改现有单位、建筑、科技的 cost / hp / damage / range / cooldown / trainTime / buildTime。
- 不把 `keep.upgradeTo` 指向任何不存在的建筑。
- 不一次性接入 `unitUnlock`、`buildingUnlock`、`researchLevel`。

Must prove:

1. `BuildingDef` 有 `techTier?: 1 | 2 | 3` 和 `upgradeTo?: string`。
2. `BUILDINGS.townhall` 有 `techTier: 1`、`upgradeTo: 'keep'`，并仍训练 `worker`。
3. `BUILDINGS.keep` 存在，`techTier: 2`，且没有 `upgradeTo`。
4. `BUILDINGS` 里没有 `castle`，`UNITS` 仍只有 worker、footman、rifleman、mortar_team、priest，`RESEARCHES` 仍只有 long_rifles。
5. `PEASANT_BUILD_MENU` 不包含 `keep`。
6. V5–V7 既有前置事实不回退：Rifleman→Blacksmith、Tower→Lumber Mill、Arcane Sanctum→Barracks、Priest→Arcane Sanctum、Long Rifles→Blacksmith。
7. 不出现 `keep.upgradeTo = 'castle'`、`upgradeTo: 'castle'` 或任何 Castle 实现暗示。

Verification:

```bash
npm run build
npx tsc --noEmit -p tsconfig.app.json
node --test tests/v9-keep-tier-seed-proof.spec.mjs tests/v9-tier-prerequisite-schema.spec.mjs tests/v9-keep-tier-contract.spec.mjs tests/v9-human-completeness-ledger.spec.mjs
./scripts/cleanup-local-runtime.sh
```

Closeout note:

- GLM 完成数据 seed 后，Codex 本地复核并修正一个文档残留：`docs/V9_TIER_PREREQUISITE_SCHEMA_PACKET.zh-CN.md` 第 6 节不再把 HN2-IMPL1 当作未来任务，避免重复派发。
- Codex 本地复核：`node --test tests/v9-keep-tier-seed-proof.spec.mjs tests/v9-tier-prerequisite-schema.spec.mjs tests/v9-keep-tier-contract.spec.mjs tests/v9-human-completeness-ledger.spec.mjs tests/v9-keep-upgrade-flow-contract.spec.mjs` 27/27 通过。
- `npm run build` 通过；`npx tsc --noEmit -p tsconfig.app.json` 通过；`./scripts/cleanup-local-runtime.sh` 完成，且无 Vite / Playwright / Chrome 残留。
- 流程问题：GLM closeout 没有输出 `READY_FOR_NEXT_TASK:` 行；Codex 已在 issue log 记录，下一张任务仍由 Codex 明确补货。

### Task 121 — V9 HN2-IMPL2 Town Hall to Keep upgrade flow

Status: `accepted`.

Owner: GLM-style worker + Codex takeover/review.

Priority: Task120 只落了数据种子；下一步相邻任务是让玩家可见地从 Town Hall 升到 Keep，而不是跳到 Castle / Knight / 完整 T2/T3。

Prerequisite: `Task 120 — V9 HN2-IMPL1 Keep tier data seed` accepted.

Source contract:

- `docs/V9_KEEP_UPGRADE_FLOW_CONTRACT_DRAFT.zh-CN.md`
- `tests/v9-keep-upgrade-flow-contract.spec.mjs`

Allowed files:

- `src/game/Game.ts`
- `src/game/GameCommand.ts`
- `tests/v9-keep-upgrade-flow-regression.spec.ts`
- `docs/HUMAN_RACE_CAPABILITY_BOARD.zh-CN.md`
- `docs/V9_KEEP_UPGRADE_FLOW_CONTRACT_DRAFT.zh-CN.md`
- `docs/GLM_READY_TASK_QUEUE.md` only for closeout sync

Goal:

实现最小可验证的 Town Hall -> Keep 升级路径：选中已完成的己方 Town Hall 能看到升级按钮，资源不足时不能点，资源足够时能开始升级并消耗资源，时间推进后该建筑变成 `keep`。这不是完整二本/三本科技树。

Required implementation:

1. 增加一个窄的建筑升级状态，建议在 `Unit` 上加 `upgradeQueue` 或等价字段，记录目标建筑 key 和剩余时间。
2. 在 `GameCommand` 增加明确命令，例如 `upgradeBuilding`，不要用 train/research 假装升级。
3. 在 `Game.ts` 里为 `BUILDINGS[primary.type].upgradeTo` 生成命令卡按钮，按钮文字用中文，建议为 `升级主城`。
4. 资源不足时按钮 disabled，并把 disabled reason 写进 DOM（现有 command-card pattern 已支持）。
5. 开始升级时消耗 `BUILDINGS.keep.cost`，并启动进度；不能把 `keep` 加入农民建造菜单。
6. 升级完成时原建筑 `type` 变成 `keep`，`maxHp` / `hp` 进入 Keep 的 hp；位置、阵营、选择语义保持稳定。
7. 同步 Human 背景板：Keep 可写成“Town Hall -> Keep 最小升级路径已存在；外观、解锁、Castle 仍缺失”。

Forbidden:

- 不实现 `castle`。
- 不设置 `keep.upgradeTo`。
- 不实现 Knight、Sorceress、Spell Breaker、Flying Machine、Siege Engine、英雄、物品、商店。
- 不接入 `unitUnlock`、`buildingUnlock`、`researchLevel` 的真实运行时语义。
- 不改 AI 策略依赖 Keep。
- 不导入或替换素材。
- 不做泛化升级系统大重构；第一步只证明 Town Hall -> Keep。
- 不改现有单位、建筑、科技的数值，除了升级完成后该建筑使用 `BUILDINGS.keep.hp`。

Must prove:

1. Command card 从 `townhall.upgradeTo` 读出升级目标；没有硬编码假按钮。
2. 资源不足时不能开始升级，按钮 disabled reason 可读。
3. 资源足够时点击升级会扣除 `keep.cost`，并产生升级进度。
4. 时间推进后同一建筑从 `townhall` 变成 `keep`，仍在原位置、同阵营、可被选中。
5. `BUILDINGS` 仍没有 `castle`，`UNITS` 和 `RESEARCHES` 不扩张。
6. `PEASANT_BUILD_MENU` 仍不包含 `keep`。
7. 现有训练、研究、采集、baseline proof 不回退。

Verification:

```bash
npm run build
npx tsc --noEmit -p tsconfig.app.json
./scripts/run-runtime-tests.sh tests/v9-keep-upgrade-flow-regression.spec.ts --reporter=list
node --test tests/v9-keep-upgrade-flow-contract.spec.mjs tests/v9-keep-tier-seed-proof.spec.mjs tests/v9-tier-prerequisite-schema.spec.mjs
./scripts/cleanup-local-runtime.sh
```

Closeout note:

- GLM 初版实现写出 `upgradeQueue`、`upgradeBuilding` 命令、命令卡升级按钮和 focused runtime proof，但测试在资源 API 与选择模型上失败，并停在提示态。
- Codex 接管后修正 runtime proof：用 `TeamResources.earn()` 补资源，用 `selectionModel.setSelection()` 走真实选择模型，并用 `.btn-label` 精确找 `升级主城` 按钮。
- Codex 同步加固生产边界：`startBuildingUpgrade()` 只允许当前建筑声明的 `upgradeTo` 目标，不能被内部调用绕到任意建筑。
- 本地复核通过：`npm run build`、`npx tsc --noEmit -p tsconfig.app.json`、`./scripts/run-runtime-tests.sh tests/v9-keep-upgrade-flow-regression.spec.ts --reporter=list` 3/3、`node --test tests/v9-keep-upgrade-flow-contract.spec.mjs tests/v9-keep-tier-seed-proof.spec.mjs tests/v9-tier-prerequisite-schema.spec.mjs` 20/20、cleanup、无 Vite / Playwright / Chrome 残留。

### Task 122 — V9 HN2-IMPL3 Keep post-upgrade command surface

Status: `accepted`.

Owner: GLM-style worker `glm-mnzrwac3-ecxn6q`.

Priority: Task121 只证明建筑能从 Town Hall 变 Keep；下一张相邻任务要证明升级后的 Keep 仍是玩家可用主基地，而不是一个改了 type 的死建筑。

Prerequisite: `Task 121 — V9 HN2-IMPL2 Town Hall to Keep upgrade flow` accepted.

Allowed files:

- `src/game/GameData.ts`
- `tests/v9-keep-post-upgrade-command-surface.spec.ts`
- `tests/v9-keep-upgrade-flow-contract.spec.mjs`
- `tests/v9-keep-tier-seed-proof.spec.mjs`
- `docs/HUMAN_RACE_CAPABILITY_BOARD.zh-CN.md`
- `docs/GLM_READY_TASK_QUEUE.md` only for closeout sync

Goal:

让升级完成后的 Keep 保留主基地最小玩家行为：选中 Keep 后能看到训练农民和集结点入口，资源足够时可以从 Keep 训练 `worker`，并且升级按钮不再出现。这个任务只补 post-upgrade 主基地可用性，不打开完整 T2。

Required implementation:

1. `BUILDINGS.keep` 可以训练 `worker`，保持 `techTier: 2`，仍不设置 `upgradeTo`。
2. 升级完成后选中同一建筑，命令卡显示 `农民` 和 `集结点`。
3. Keep 训练 worker 使用现有训练队列、资源扣费、人口检查和 rally 语义，不新增第二套训练逻辑。
4. Keep 命令卡不显示 `升级主城`，不暗示 Castle。
5. 同步 Human 背景板：Keep 最小升级与农民训练入口存在；Castle、T2 解锁、外观和完整主基地能力仍缺失。

Forbidden:

- 不实现 `castle`。
- 不设置 `keep.upgradeTo`。
- 不实现 Knight、Sorceress、Spell Breaker、Flying Machine、Siege Engine、英雄、物品、商店。
- 不接入完整 `unitUnlock`、`buildingUnlock`、`researchLevel` 运行时语义。
- 不改 AI 策略依赖 Keep。
- 不导入或替换素材。
- 不重写 command-card 或训练系统。

Must prove:

1. 升级完成后的同一建筑是 `keep`，仍可被选中。
2. Keep 命令卡有 `农民` 和 `集结点`。
3. 点击 Keep 的 `农民` 会扣资源并进入现有 `trainingQueue`。
4. Keep 不显示 `升级主城`。
5. `BUILDINGS` 仍没有 `castle`，`keep.upgradeTo` 仍不存在，`PEASANT_BUILD_MENU` 仍不包含 `keep`。

Verification:

```bash
npm run build
npx tsc --noEmit -p tsconfig.app.json
./scripts/run-runtime-tests.sh tests/v9-keep-post-upgrade-command-surface.spec.ts --reporter=list
node --test tests/v9-keep-upgrade-flow-contract.spec.mjs tests/v9-keep-tier-seed-proof.spec.mjs tests/v9-tier-prerequisite-schema.spec.mjs
./scripts/cleanup-local-runtime.sh
```

Closeout note:

- GLM 完成 Keep post-upgrade 最小命令面：`BUILDINGS.keep.trains = ['worker']`，升级后的 Keep 可训练农民并保留集结点。
- Codex 本地复核通过：`npm run build`、`npx tsc --noEmit -p tsconfig.app.json`、`./scripts/run-runtime-tests.sh tests/v9-keep-post-upgrade-command-surface.spec.ts --reporter=list` 3/3、`node --test tests/v9-keep-upgrade-flow-contract.spec.mjs tests/v9-keep-tier-seed-proof.spec.mjs tests/v9-tier-prerequisite-schema.spec.mjs` 20/20、cleanup、无 Vite / Playwright / Chrome 残留。
- 仍然没有 Castle、Knight、完整 T2 解锁、AI 二本策略或素材扩张。

### Task 123 — V9 HN2-PLAN4 Keep/T2 unlock compatibility inventory

Status: `accepted`.

Owner: Codex takeover.

Priority: Task122 已证明 Keep 升级后仍是可用主基地；下一步不能直接把现有 Workshop / Arcane Sanctum 锁到 Keep 后面，因为 V7 已有内容和测试可能依赖当前前置规则。先做兼容盘点，再决定运行时迁移顺序。

Prerequisite: `Task 122 — V9 HN2-IMPL3 Keep post-upgrade command surface` accepted.

Allowed files:

- `docs/V9_KEEP_T2_UNLOCK_COMPATIBILITY_PACKET.zh-CN.md`
- `tests/v9-keep-t2-unlock-compatibility-proof.spec.mjs`
- `docs/HUMAN_RACE_CAPABILITY_BOARD.zh-CN.md`
- `docs/GLM_READY_TASK_QUEUE.md` only for closeout sync

Goal:

产出一份 Keep / T2 解锁兼容盘点包，说明当前 V7 已实现建筑、单位、研究和测试如何依赖现状；用 node proof 固定真实事实；给出后续安全迁移顺序。这个任务只盘点和证明，不改运行时代码。

Required implementation:

1. 新增 `docs/V9_KEEP_T2_UNLOCK_COMPATIBILITY_PACKET.zh-CN.md`，用中文写清：
   - 当前 `PEASANT_BUILD_MENU` 里是否已有 `workshop`、`arcane_sanctum`。
   - 当前 `workshop` 是否没有 `techPrereq`。
   - 当前 `arcane_sanctum` 是否以前置 `barracks` 解锁，而不是 Keep。
   - 当前 V7/V9 相关测试依赖哪些事实。
   - Keep 现在已经存在、可训练农民、没有 Castle。
   - 后续迁移顺序建议：先定义二本解锁合同，再更新 proof，再改运行时 gating；不要在本任务直接锁现有内容。
2. 新增 `tests/v9-keep-t2-unlock-compatibility-proof.spec.mjs`，只做静态/数据级 proof，不启动浏览器。
3. 如需同步能力板，只允许更新 `docs/HUMAN_RACE_CAPABILITY_BOARD.zh-CN.md` 里的 Keep / Workshop / Arcane Sanctum 现状说明。
4. 任务完成时只把本任务在 `docs/GLM_READY_TASK_QUEUE.md` 标成 `completed`，不要替 Codex 标 `accepted`。

Forbidden:

- 不改 `src/game/GameData.ts`、`src/game/Game.ts`、`src/game/GameCommand.ts` 或任何运行时代码。
- 不把 `workshop`、`arcane_sanctum`、Priest、Mortar、Long Rifles 等现有内容锁到 Keep 后面。
- 不实现 Castle、Knight、Sorceress、Spell Breaker、Flying Machine、Siege Engine、英雄、物品、商店。
- 不改 AI 策略。
- 不导入或替换素材。
- 不删改现有 V7/V9 runtime proof。

Must prove:

1. `PEASANT_BUILD_MENU` 当前包含 `workshop` 和 `arcane_sanctum`。
2. `BUILDINGS.workshop.techPrereq` 当前不存在或为空。
3. `BUILDINGS.arcane_sanctum.techPrereq` 当前是 `barracks`，不是 `keep`。
4. `BUILDINGS.keep` 当前存在、`techTier` 为 2、可训练 `worker`，且没有 `upgradeTo`。
5. `BUILDINGS.castle` 当前不存在。
6. 兼容包列出了后续迁移必须保护的 V7/V9 测试或能力面。

Verification:

```bash
npm run build
npx tsc --noEmit -p tsconfig.app.json
node --test tests/v9-keep-t2-unlock-compatibility-proof.spec.mjs tests/v9-tier-prerequisite-schema.spec.mjs tests/v9-keep-tier-seed-proof.spec.mjs
./scripts/cleanup-local-runtime.sh
```

Closeout note:

- GLM 新增 `docs/V9_KEEP_T2_UNLOCK_COMPATIBILITY_PACKET.zh-CN.md` 和 `tests/v9-keep-t2-unlock-compatibility-proof.spec.mjs`，只做兼容盘点和静态 proof。
- Codex 本地复核通过：`npm run build`、`npx tsc --noEmit -p tsconfig.app.json`、`node --test tests/v9-keep-t2-unlock-compatibility-proof.spec.mjs tests/v9-tier-prerequisite-schema.spec.mjs tests/v9-keep-tier-seed-proof.spec.mjs` 18/18、cleanup、无 Vite / Playwright / Chrome 残留。
- 未改 `GameData.ts`、`Game.ts`、AI、素材或 runtime gating；没有把 Workshop / Arcane Sanctum 锁到 Keep 后面。

### Task 124 — V9 HN2-CONTRACT5 Keep/T2 unlock contract packet

Status: `accepted`.

Owner: GLM-style worker + Codex review.

Priority: Task123 证明当前 Workshop / Arcane Sanctum 不依赖 Keep。下一步必须先写清未来目标和验收边界，再进入运行时迁移，避免直接破坏 V7 已有内容。

Prerequisite: `Task 123 — V9 HN2-PLAN4 Keep/T2 unlock compatibility inventory` accepted.

Allowed files:

- `docs/V9_KEEP_T2_UNLOCK_CONTRACT.zh-CN.md`
- `tests/v9-keep-t2-unlock-contract.spec.mjs`
- `docs/V9_KEEP_T2_UNLOCK_COMPATIBILITY_PACKET.zh-CN.md`
- `docs/GLM_READY_TASK_QUEUE.md` only for closeout sync

Goal:

定义 Keep / T2 解锁的目标合同和迁移验收标准：未来哪些内容应该受 Keep gating 影响、哪些现有 proof 要改、哪些阶段不能合并。这个任务只写合同和 proof，不改运行时代码。

Required implementation:

1. 新增 `docs/V9_KEEP_T2_UNLOCK_CONTRACT.zh-CN.md`，用中文写清：
   - 目标态：Workshop / Arcane Sanctum 是否最终应进入 Keep 后置阶段，以及迁移前后玩家可见行为如何变化。
   - 不变项：Town Hall -> Keep、Keep 训练 worker、无 Castle、无 Knight、无新素材、无 AI 二本策略。
   - 需要迁移的 proof / runtime 包：至少列出 `v9-tier-prerequisite-schema`、`v9-keep-tier-seed-proof`、`v9-human-completeness-ledger`、`v9-baseline-replay-smoke`、V7 Workshop / Arcane Sanctum 相关 proof。
   - 分阶段顺序：合同 -> proof 更新 -> runtime gating -> AI 策略 -> baseline rerun。
   - 硬禁止：本任务不修改 `GameData.ts` 或 `Game.ts`。
2. 新增 `tests/v9-keep-t2-unlock-contract.spec.mjs`，只验证合同文档和兼容包一致，不启动浏览器。
3. 可在兼容包里追加一条“已补合同文档”的交叉引用，但不得修改现有事实结论。
4. 任务完成时只把本任务在 `docs/GLM_READY_TASK_QUEUE.md` 标成 `completed`，不要替 Codex 标 `accepted`。

Forbidden:

- 不改 `src/game/GameData.ts`、`src/game/Game.ts`、`src/game/GameCommand.ts` 或任何运行时代码。
- 不修改 `PEASANT_BUILD_MENU`、`techPrereq`、训练队列、命令卡逻辑或 AI 策略。
- 不实现 Castle、Knight、Sorceress、Spell Breaker、Flying Machine、Siege Engine、英雄、物品、商店。
- 不导入或替换素材。
- 不删改现有 V7/V9 runtime proof。

Must prove:

1. 合同明确当前是“未执行的目标合同”，不是已落地运行时。
2. 合同明确目标态与当前态差异。
3. 合同列出受影响的 V7/V9 proof。
4. 合同列出分阶段迁移顺序，且禁止本任务直接改 runtime。
5. 兼容包仍保留“当前 Workshop / Arcane Sanctum 不依赖 Keep”的事实。
6. `GameData.ts` 当前事实未被本任务改变：Workshop 无 `techPrereq`，Arcane Sanctum 前置仍是 `barracks`，Keep 无 `upgradeTo`，Castle 不存在。

Verification:

```bash
npm run build
npx tsc --noEmit -p tsconfig.app.json
node --test tests/v9-keep-t2-unlock-contract.spec.mjs tests/v9-keep-t2-unlock-compatibility-proof.spec.mjs tests/v9-tier-prerequisite-schema.spec.mjs tests/v9-keep-tier-seed-proof.spec.mjs
./scripts/cleanup-local-runtime.sh
```

Closeout note:

- GLM 新增 `docs/V9_KEEP_T2_UNLOCK_CONTRACT.zh-CN.md` 和 `tests/v9-keep-t2-unlock-contract.spec.mjs`，并在兼容包追加合同交叉引用。
- Codex 本地复核通过：`npm run build`、`npx tsc --noEmit -p tsconfig.app.json`、`node --test tests/v9-keep-t2-unlock-contract.spec.mjs tests/v9-keep-t2-unlock-compatibility-proof.spec.mjs tests/v9-tier-prerequisite-schema.spec.mjs tests/v9-keep-tier-seed-proof.spec.mjs` 24/24、cleanup、无 Vite / Playwright / Chrome 残留。
- 未改 `GameData.ts`、`Game.ts`、AI、素材或 runtime gating。

### Task 125 — V9 HN2-PROOF6 Keep/T2 runtime gating dry-run

Status: `accepted`.

Owner: GLM-style worker + Codex takeover.

Priority: Task124 已定义目标合同；在真改 `GameData.ts` 之前，先证明现有 runtime availability / 命令卡机制已经能承载 “Workshop / Arcane Sanctum 需要 Keep” 的规则。

Prerequisite: `Task 124 — V9 HN2-CONTRACT5 Keep/T2 unlock contract packet` accepted.

Allowed files:

- `tests/v9-keep-t2-unlock-runtime-gating-proof.spec.ts`
- `docs/V9_KEEP_T2_UNLOCK_CONTRACT.zh-CN.md`
- `docs/GLM_READY_TASK_QUEUE.md` only for closeout sync

Goal:

新增 focused runtime proof：不改生产数据，先用现有 Tower / Arcane Sanctum 前置证明 `techPrereq` 机制会禁用/放开；再在浏览器里临时覆盖当前 game 实例的 `getBuildAvailability()`，模拟 Workshop / Arcane Sanctum 需要 Keep，证明玩家命令卡能显示“需要主城”。这个任务只证明机制，不落地数据。

Required implementation:

1. 新增 `tests/v9-keep-t2-unlock-runtime-gating-proof.spec.ts`。
2. 测试必须诚实区分两类 proof：生产数据里的现有 `techPrereq` 机制 proof，以及 browser runtime 的模拟 Keep gate proof；不得用 Tower/Lumber Mill 代理后声称已经模拟了 Workshop / Arcane Sanctum。
3. 至少覆盖 `workshop` 和 `arcane_sanctum` 两个建筑。
4. 模拟 Keep gate 时证明 `g.getBuildAvailability(type, 0)` 没有 Keep 返回 `ok: false` 且 reason 指向 Keep/主城；生成一个完成的 Keep 后返回 `ok: true`。
5. 至少一条 proof 要从农民命令卡读取按钮状态，证明玩家可见禁用态和 runtime availability 一致。
6. 可在合同文档追加“runtime dry-run proof 已补”的证据链接，但不得把目标合同改成已落地。
7. 任务完成时只把本任务在 `docs/GLM_READY_TASK_QUEUE.md` 标成 `completed`，不要替 Codex 标 `accepted`。

Forbidden:

- 不改 `src/game/GameData.ts`、`src/game/Game.ts`、`src/game/GameCommand.ts`、`src/game/SimpleAI.ts` 或任何生产代码。
- 不永久修改 `PEASANT_BUILD_MENU`、`techPrereq`、训练队列、命令卡逻辑或 AI 策略。
- 不实现 Castle、Knight、Sorceress、Spell Breaker、Flying Machine、Siege Engine、英雄、物品、商店。
- 不导入或替换素材。
- 不删改现有 V7/V9 proof。

Must prove:

1. 现有 `techPrereq` 机制会让 Tower 在缺 Lumber Mill 时不可建、补 Lumber Mill 后可建。
2. 现有 `techPrereq` 机制会让 Arcane Sanctum 在缺 Barracks 时不可建、补 Barracks 后可建。
3. 生成完成的 Keep 后，两者 availability 变为可建。
4. 农民命令卡能显示对应 disabled 状态或禁用原因。
5. 测试结束后不污染后续测试：原始前置事实恢复，当前 `GameData.ts` 仍未落地 Keep gating。

Verification:

```bash
npm run build
npx tsc --noEmit -p tsconfig.app.json
./scripts/run-runtime-tests.sh tests/v9-keep-t2-unlock-runtime-gating-proof.spec.ts --reporter=list
node --test tests/v9-keep-t2-unlock-contract.spec.mjs tests/v9-keep-t2-unlock-compatibility-proof.spec.mjs
./scripts/cleanup-local-runtime.sh
```

Closeout note:

- GLM 初版只用 Tower / Lumber Mill 代理证明，未真正模拟 Workshop / Arcane Sanctum 需要 Keep，并在 0% compact 处被 Codex 取消。
- Codex 接管并改写 `tests/v9-keep-t2-unlock-runtime-gating-proof.spec.ts`：RG-1 证明现有 `techPrereq` 机制，RG-2/RG-3 通过临时覆盖当前 game 实例的 availability 模拟 Keep gate，RG-4 证明生产数据未变。
- 本地复核通过：`npm run build`、`npx tsc --noEmit -p tsconfig.app.json`、`./scripts/run-runtime-tests.sh tests/v9-keep-t2-unlock-runtime-gating-proof.spec.ts --reporter=list` 4/4、`node --test tests/v9-keep-t2-unlock-contract.spec.mjs tests/v9-keep-t2-unlock-compatibility-proof.spec.mjs` 12/12、cleanup、无 Vite / Playwright / Chrome 残留。

### Task 126 — V9 HN2-IMPL7 AI Town Hall to Keep upgrade readiness

Status: `accepted`.

Owner: GLM-style worker + Codex takeover.

Priority: Keep / T2 gating 真落地前，AI 不能继续只知道 `townhall`。先让 AI 在受控条件下能使用现有 Town Hall -> Keep 升级路径，并且升级后仍把 Keep 当主基地使用。

Prerequisite: `Task 125 — V9 HN2-PROOF6 Keep/T2 runtime gating dry-run` accepted.

Allowed files:

- `src/game/SimpleAI.ts`
- `tests/v9-ai-keep-upgrade-readiness.spec.ts`
- `docs/GLM_READY_TASK_QUEUE.md` only for closeout sync

Goal:

让 SimpleAI 在不改变 Workshop / Arcane Sanctum 生产数据的前提下，具备最小 Keep 升级能力：在开局压力已经完成、资源足够且 Town Hall 可升级时，AI 会启动 Town Hall -> Keep；升级后 AI 不因为主基地类型从 `townhall` 变成 `keep` 而停止经济/训练/集结点逻辑。

Required implementation:

1. SimpleAI 的主基地查询必须接受 `townhall` 或 `keep`，但升级只能从 `townhall` 发起。
2. 只在受控安全条件下发起升级：已有基础经济/兵营节奏，不抢第一波压力；资源足够并保留合理开局生产余量。
3. 发起升级时使用现有 `issueCommand([], { type: 'upgradeBuilding', ... })` 路径和 `BUILDINGS.townhall.upgradeTo` / `BUILDINGS.keep.buildTime` 数据，不写第二套升级状态。
4. 升级中的 Town Hall 不重复发起升级；完成后 AI 继续用 Keep 训练 worker / rally / 分配农民。
5. 新增 focused runtime proof，允许用受控 fixture 加资源、加兵营/黑铁或设置 AI 内部波次状态，但必须读 fresh runtime state。
6. 任务完成时只把本任务在 `docs/GLM_READY_TASK_QUEUE.md` 标成 `completed`，不要替 Codex 标 `accepted`。

Forbidden:

- 不改 `src/game/GameData.ts`、`src/game/Game.ts`、`src/game/GameCommand.ts`。
- 不把 Workshop / Arcane Sanctum 锁到 Keep 后面。
- 不实现完整 AI 二本建造策略、Castle、Knight、法师进阶、空军、英雄、物品或素材。
- 不改玩家命令卡 UI。
- 不删改现有 V7/V9 proof。

Must prove:

1. 受控条件下 AI 会给自己的 Town Hall 写入 `upgradeQueue.targetType === 'keep'`。
2. 升级扣除真实 `BUILDINGS.keep.cost` 资源。
3. 时间推进后同一 AI 主基地变成 `keep`。
4. 升级完成后 AI 仍能识别主基地，不停止 worker 训练或 rally 逻辑。
5. 未满足条件时 AI 不会开局过早升级，避免破坏第一波压力合同。
6. `BUILDINGS.workshop.techPrereq`、`BUILDINGS.arcane_sanctum.techPrereq`、Castle / Knight / 新素材仍未改变。

Verification:

```bash
npm run build
npx tsc --noEmit -p tsconfig.app.json
./scripts/run-runtime-tests.sh tests/v9-ai-keep-upgrade-readiness.spec.ts --reporter=list
./scripts/run-runtime-tests.sh tests/ai-economy-regression.spec.ts tests/v7-ai-same-rule-content-proof.spec.ts --grep "first attack wave|second attack wave|V7 AI Same-Rule" --reporter=list
node --test tests/v9-keep-t2-unlock-contract.spec.mjs tests/v9-keep-t2-unlock-compatibility-proof.spec.mjs
./scripts/cleanup-local-runtime.sh
```

Closeout note:

- GLM 初版证明在 `page.evaluate()` 中误用 Node import，并把 KU-2 从“扣除真实 Keep 成本”弱化成 `>= keep cost`，同时 KU-6 残留旧断言。
- Codex 取消 job 后接管，重写 `tests/v9-ai-keep-upgrade-readiness.spec.ts`：用 `g.resources.spend` instrumentation 证明同一 tick 内存在精确 `BUILDINGS.keep.cost` 扣费，用同一对象引用证明 Town Hall 完成后变为 Keep，并把静态生产数据证明放回 Node 上下文。
- 本地复核通过：`npm run build`、`npx tsc --noEmit -p tsconfig.app.json`、focused runtime 6/6、AI/V7 相关 runtime 10/10、Keep/T2 node contract 12/12、cleanup、无 Vite / Playwright / Chrome 残留。

### Task 127 — V9 HN2-IMPL8 Keep/T2 building unlock migration

Status: `accepted`.

Owner: GLM-style worker + Codex review.

Priority: Task124/125 已定义并 dry-run 了 Keep/T2 解锁合同，Task126 已让 AI 具备升级 Keep 的最小能力。现在可以把 Workshop / Arcane Sanctum 的真实建造门槛迁移到 Keep，但仍不能打开 Castle、Knight、完整二本策略或素材扩张。

Prerequisite: `Task 126 — V9 HN2-IMPL7 AI Town Hall to Keep upgrade readiness` accepted.

Allowed files:

- `src/game/GameData.ts`
- `tests/v9-keep-t2-unlock-contract.spec.mjs`
- `tests/v9-keep-t2-unlock-compatibility-proof.spec.mjs`
- `tests/v9-keep-t2-unlock-runtime-gating-proof.spec.ts`
- `tests/v7-workshop-mortar-combat-model-proof.spec.ts`
- `tests/v7-arcane-sanctum-caster-proof.spec.ts`
- `tests/v9-baseline-replay-smoke.spec.ts` only if the baseline fixture must create Keep before proving V7 content remains reachable
- `docs/GLM_READY_TASK_QUEUE.md` only for closeout sync

Goal:

把生产数据从“Workshop 无 Keep 门槛、Arcane Sanctum 只要 Barracks”迁移到“Workshop 和 Arcane Sanctum 都要求 completed Keep”。玩家命令卡、runtime availability、V7 内容 proof 和 V9 baseline proof 必须跟真实数据一致；不要用临时 monkey patch 模拟 Keep gate 作为最终证据。

Required implementation:

1. `BUILDINGS.workshop.techPrereq` 改为 `'keep'`。
2. `BUILDINGS.arcane_sanctum.techPrereq` 改为 `'keep'`。
3. `PEASANT_BUILD_MENU` 仍保留 `workshop` 和 `arcane_sanctum`，按钮可以显示但必须在未完成 Keep 时禁用。
4. 更新 V9 Keep/T2 proof：旧“dry-run / current facts unchanged”口径必须改成“真实生产数据已迁移”。
5. 更新受影响的 V7 runtime proof fixture：需要 Workshop / Arcane Sanctum 可建时，fixture 应先提供 completed Keep，而不是放宽生产数据。
6. 如果 baseline smoke 直接依赖 Workshop / Arcane Sanctum 可用，也要在 fixture 中显式提供 Keep。
7. 任务完成时只把本任务在 `docs/GLM_READY_TASK_QUEUE.md` 标成 `completed`，不要替 Codex 标 `accepted`。

Forbidden:

- 不新增 Castle、Knight、英雄、物品、飞行单位、新科技或素材。
- 不改 Town Hall -> Keep 升级流程本身。
- 不实现完整 AI 二本建造策略；Task126 的最小升级能力保持即可。
- 不删除 Workshop / Mortar / Arcane Sanctum / Priest 已有内容。
- 不把 failing proof 改成“跳过”或纯静态文本检查。
- 不改看板、队列脚本、版本切换脚本。

Must prove:

1. `BUILDINGS.workshop.techPrereq === 'keep'`。
2. `BUILDINGS.arcane_sanctum.techPrereq === 'keep'`。
3. 没有 completed Keep 时，worker 命令卡中的 Workshop / Arcane Sanctum 按钮禁用且原因包含 `主城`。
4. 有 completed Keep 时，Workshop / Arcane Sanctum 的 build availability 变为 ok。
5. Workshop / Mortar 和 Arcane Sanctum / Priest 的 V7 内容仍可在拥有 Keep 的 fixture 中训练/使用。
6. 仍没有 Castle / Knight / 新素材 / 完整二本策略。

Verification:

```bash
npm run build
npx tsc --noEmit -p tsconfig.app.json
./scripts/run-runtime-tests.sh tests/v9-keep-t2-unlock-runtime-gating-proof.spec.ts --reporter=list
./scripts/run-runtime-tests.sh tests/v7-workshop-mortar-combat-model-proof.spec.ts tests/v7-arcane-sanctum-caster-proof.spec.ts --reporter=list
./scripts/run-runtime-tests.sh tests/v9-baseline-replay-smoke.spec.ts --reporter=list
node --test tests/v9-keep-t2-unlock-contract.spec.mjs tests/v9-keep-t2-unlock-compatibility-proof.spec.mjs
./scripts/cleanup-local-runtime.sh
```

Closeout note:

- GLM 完成真实数据迁移：`BUILDINGS.workshop.techPrereq` 和 `BUILDINGS.arcane_sanctum.techPrereq` 均为 `'keep'`。
- 旧 dry-run proof 已改成生产数据 proof；V7 Arcane / Workshop fixture 和 V9 baseline fixture 已补 completed Keep。
- Codex 本地复核通过：`npm run build`、`npx tsc --noEmit -p tsconfig.app.json`、`node --test tests/v9-keep-t2-unlock-contract.spec.mjs tests/v9-keep-t2-unlock-compatibility-proof.spec.mjs` 12/12、`tests/v9-keep-t2-unlock-runtime-gating-proof.spec.ts` 4/4、V7 Workshop/Mortar + Arcane/Priest 12/12、V9 baseline 5/5、V7 AI same-rule 8/8、cleanup、无 Vite / Playwright / Chrome 残留。

### Task 128 — V9 HN2-UX9 Keep upgrade and T2 unlock feedback

Status: `accepted`.

Owner: GLM-style worker + Codex review.

Priority: Task127 已把 T2 建筑门槛真实迁移到 Keep。下一步不应该直接跳 Castle / Knight，而是让玩家能看懂：Town Hall 正在升级、升级完成后 Workshop / Arcane Sanctum 为什么从禁用变为可用。

Prerequisite: `Task 127 — V9 HN2-IMPL8 Keep/T2 building unlock migration` accepted.

Allowed files:

- `src/game/Game.ts`
- `tests/v9-keep-upgrade-unlock-feedback.spec.ts`
- `tests/v9-keep-upgrade-flow-regression.spec.ts` only if existing upgrade-flow proof needs a narrow assertion update
- `tests/v9-keep-t2-unlock-runtime-gating-proof.spec.ts` only if feedback proof can reuse the existing Keep gate fixture without weakening it
- `docs/GLM_READY_TASK_QUEUE.md` only for closeout sync

Goal:

补一层玩家可见反馈，让当前 Keep 升级和 T2 解锁不再像“数据偷偷变了”：升级中能看到明确状态，未升级时 Workshop / Arcane Sanctum 的禁用原因仍然清楚，升级完成后这两个按钮从“需要主城”变为可用。

Required implementation:

1. 选择正在升级的 Town Hall 时，命令卡或 HUD 必须显示“正在升级主城 / 升级中”一类中文状态，并带有剩余时间或进度信息。
2. 正在升级时不得继续显示可点击的“升级主城”按钮，也不得重复开启 upgradeQueue。
3. 未完成 Keep 时，worker 命令卡里的 Workshop / Arcane Sanctum 仍显示为禁用，原因包含 `主城`。
4. Keep 完成后，worker 命令卡中的 Workshop / Arcane Sanctum 变为可用，原因清空或不再显示。
5. 反馈文案必须是用户看得懂的中文，不写 `gate`、`techPrereq`、`contract`、`proof` 这类内部词。
6. 任务完成时只把本任务在 `docs/GLM_READY_TASK_QUEUE.md` 标成 `completed`，不要替 Codex 标 `accepted`。

Forbidden:

- 不改 `src/game/GameData.ts`。
- 不改 SimpleAI，不实现完整 AI 二本策略。
- 不新增 Castle、Knight、英雄、物品、飞行单位、新科技或素材。
- 不重写 HUD / command card 架构。
- 不删除现有 Keep upgrade、Keep/T2、V7 proof。

Must prove:

1. 点击“升级主城”后，Town Hall 进入 upgradeQueue，重新渲染命令卡能看到升级中反馈。
2. 升级中不会出现第二个可点击升级按钮。
3. 没有 Keep 时，Workshop / Arcane Sanctum 禁用且原因包含 `主城`。
4. 完成 Keep 后，Workshop / Arcane Sanctum 可用。
5. Keep 仍训练 worker，仍无 Castle / Knight / 新素材。

Verification:

```bash
npm run build
npx tsc --noEmit -p tsconfig.app.json
./scripts/run-runtime-tests.sh tests/v9-keep-upgrade-unlock-feedback.spec.ts tests/v9-keep-upgrade-flow-regression.spec.ts tests/v9-keep-t2-unlock-runtime-gating-proof.spec.ts --reporter=list
node --test tests/v9-keep-t2-unlock-contract.spec.mjs tests/v9-keep-t2-unlock-compatibility-proof.spec.mjs
./scripts/cleanup-local-runtime.sh
```

Closeout note:

- GLM 在命令卡中加入升级中反馈：选择有 `upgradeQueue` 的 Town Hall 时显示禁用的 `升级主城…` 按钮和剩余秒数，不再显示可点击的重复升级按钮。
- Codex 复核时加固 UF-2：不仅检查有“秒”，还检查剩余秒数随时间下降。
- 本地复核通过：`npm run build`、`npx tsc --noEmit -p tsconfig.app.json`、`tests/v9-keep-upgrade-unlock-feedback.spec.ts + tests/v9-keep-upgrade-flow-regression.spec.ts + tests/v9-keep-t2-unlock-runtime-gating-proof.spec.ts` runtime 12/12、Keep/T2 node contract 12/12、cleanup、无 Vite / Playwright / Chrome 残留。

### Task 129 — V9 HN2-PROOF10 Human T2 production path smoke

Status: `accepted`.

Owner: GLM-style worker + Codex review.

Priority: Keep 升级、T2 建筑解锁和升级反馈都已分别证明。下一步先做一条玩家侧最小整链 smoke，确认这些能力在同一局里能串起来；仍不新增 Castle、Knight、完整二本策略或素材。

Prerequisite: `Task 128 — V9 HN2-UX9 Keep upgrade and T2 unlock feedback` accepted.

Allowed files:

- `tests/v9-human-t2-production-path-smoke.spec.ts`
- `docs/GLM_READY_TASK_QUEUE.md` only for closeout sync

Goal:

新增一条 focused runtime smoke：从玩家 Town Hall 开始升级 Keep，完成后确认 worker 命令卡解锁 Workshop / Arcane Sanctum，再用 completed T2 building fixture 训练 Mortar Team / Priest，证明这条玩家侧二本最小路径在同一 fresh runtime 中连通。

Required implementation:

1. 测试必须从 fresh runtime 启动，并关闭 AI 干扰。
2. 用真实 `startBuildingUpgrade` 或命令卡点击启动 Town Hall -> Keep，不允许直接把 Town Hall type 改成 Keep。
3. 升级完成后重新读取 fresh state，确认同一主基地变为 Keep。
4. 选择 worker，确认 Workshop / Arcane Sanctum 按钮从未升级时的禁用状态变为可用。
5. 可以用 `spawnBuilding('workshop')` / `spawnBuilding('arcane_sanctum')` 作为“已建成建筑”fixture 来验证训练 Mortar / Priest，但不能把它伪装成建造流程已完整完成。
6. 任务完成时只把本任务在 `docs/GLM_READY_TASK_QUEUE.md` 标成 `completed`，不要替 Codex 标 `accepted`。

Forbidden:

- 不改 `src/game/Game.ts`、`src/game/GameData.ts`、`src/game/SimpleAI.ts`。
- 不新增 Castle、Knight、英雄、物品、飞行单位、新科技或素材。
- 不重写建筑放置流程。
- 不扩大成完整二本 AI 策略或完整科技树。

Must prove:

1. 没有 Keep 前，Workshop / Arcane Sanctum 在 worker 命令卡中禁用且原因包含 `主城`。
2. Town Hall -> Keep 完成后，worker 命令卡中 Workshop / Arcane Sanctum 可用。
3. Workshop 可以通过正常训练按钮排队 Mortar Team。
4. Arcane Sanctum 可以通过正常训练按钮排队 Priest。
5. 仍无 Castle / Knight / 新素材。

Verification:

```bash
npm run build
npx tsc --noEmit -p tsconfig.app.json
./scripts/run-runtime-tests.sh tests/v9-human-t2-production-path-smoke.spec.ts tests/v9-keep-upgrade-unlock-feedback.spec.ts --reporter=list
node --test tests/v9-keep-t2-unlock-contract.spec.mjs tests/v9-keep-t2-unlock-compatibility-proof.spec.mjs
./scripts/cleanup-local-runtime.sh
```

Closeout note:

- GLM 新增 `tests/v9-human-t2-production-path-smoke.spec.ts`，只证明玩家侧最小二本路径在同一 fresh runtime 串通：无 Keep 时 T2 建筑禁用，真实升级 Keep 后解锁 Workshop / Arcane Sanctum，completed fixture 能从正常命令卡训练 Mortar / Priest。
- Codex 本地复核通过：`npm run build`、`npx tsc --noEmit -p tsconfig.app.json`、`tests/v9-human-t2-production-path-smoke.spec.ts + tests/v9-keep-upgrade-unlock-feedback.spec.ts` runtime 7/7、Keep/T2 node contract 12/12、cleanup、无 Vite / Playwright / Chrome 残留。
- 未改生产代码，未新增 Castle / Knight / 英雄 / 物品 / 飞行单位 / 科技 / 素材；AI 完整二本策略仍未实现，交给下一张相邻任务。

### Task 130 — V9 HN2-AI11 AI post-Keep T2 usage slice

Status: `accepted`.

Owner: GLM-style worker + Codex review.

Priority: 玩家侧最小二本路径已经 accepted；下一步只让 AI 在同一规则下使用已存在的二本内容，避免人类能走二本而 AI 仍停在旧 V7 逻辑。

Prerequisite: `Task 129 — V9 HN2-PROOF10 Human T2 production path smoke` accepted.

Allowed files:

- `src/game/SimpleAI.ts`
- `tests/v9-ai-post-keep-t2-usage.spec.ts`
- `tests/v7-ai-same-rule-content-proof.spec.ts` only if an existing assertion must be updated to the Keep gate
- `docs/GLM_READY_TASK_QUEUE.md` only for closeout sync

Goal:

让 SimpleAI 在已完成 Keep 后，按真实建筑前置和资源 / 人口限制使用二本内容：可以建 Workshop / Arcane Sanctum，并从 completed T2 building 的正常训练队列训练 Mortar Team / Priest。范围必须保持在“最小二本使用”，不是完整二本战术。

Required implementation:

1. AI 建 Workshop / Arcane Sanctum 必须依赖真实 `BUILDINGS[*].techPrereq` 和 completed Keep，不允许绕过 `tryBuildBuilding()`。
2. AI 可以继续最多训练 2 个 Mortar Team；新增 Priest 训练也必须走 `issueCommand(... train ...)`，并检查资源、人口和队列长度。
3. Priest 作为支援单位使用当前已有 auto-heal / mana 机制；本任务不新增治疗 AI、技能树或复杂编队。
4. 测试必须包含 fresh runtime，并在每次 mutation 后重新读取 `window.__war3Game` / `g.units` 的 fresh state。
5. 任务完成时只把本任务在 `docs/GLM_READY_TASK_QUEUE.md` 标成 `completed`，不要替 Codex 标 `accepted`。

Forbidden:

- 不改 `src/game/Game.ts`、`src/game/GameData.ts`、`src/game/GameCommand.ts`。
- 不新增 Castle、Knight、英雄、物品、飞行单位、新科技或素材。
- 不直接 spawn completed AI buildings 来伪装 AI 建造路径；building fixture 只允许用于训练队列证明。
- 不重写 AI 总体战略、进攻目标系统、经济参数或地图布局。

Must prove:

1. 没有 completed Keep 时，AI 不会新建 Workshop / Arcane Sanctum。
2. 有 completed Keep、必要前置、资源和可用 builder 时，AI 可以通过真实建造路径启动 Workshop / Arcane Sanctum。
3. Completed Workshop 下，AI 通过正常训练队列训练 Mortar Team，且资源 / 人口检查仍生效。
4. Completed Arcane Sanctum 下，AI 通过正常训练队列训练 Priest，且资源 / 人口检查仍生效。
5. Priest 数据仍来自现有 V7 法师系统；不新增治疗 AI 或新技能。
6. 仍无 Castle / Knight / 新素材 / 完整二本策略扩张。

Verification:

```bash
npm run build
npx tsc --noEmit -p tsconfig.app.json
./scripts/run-runtime-tests.sh tests/v9-ai-post-keep-t2-usage.spec.ts tests/v9-ai-keep-upgrade-readiness.spec.ts tests/v7-ai-same-rule-content-proof.spec.ts --reporter=list
node --test tests/v9-keep-t2-unlock-contract.spec.mjs tests/v9-keep-t2-unlock-compatibility-proof.spec.mjs
./scripts/cleanup-local-runtime.sh
```

Closeout note:

- GLM 实现 AI 在 Keep 后启动 Workshop / Arcane Sanctum，并从 completed T2 fixture 的真实训练队列训练 Mortar Team / Priest。
- Codex 复核时修正三处质量问题：旧 KU-6 断言改成当前 Keep/T2 迁移后的真实前置；AT-2 从“任一 T2 建筑出现”收紧为 Workshop 和 Arcane Sanctum 都必须以在建状态 + builder 启动；训练证明增加精确扣费和人口满时不能排队证明。
- Codex 去掉 `priest` 加入 AI 攻击波次的改动，避免这张任务悄悄改战术编队；Priest 随军支援留给后续独立任务。
- 本地复核通过：`npm run build`、`npx tsc --noEmit -p tsconfig.app.json`、`tests/v9-ai-post-keep-t2-usage.spec.ts + tests/v9-ai-keep-upgrade-readiness.spec.ts + tests/v7-ai-same-rule-content-proof.spec.ts` runtime 21/21、Keep/T2 node contract 12/12、cleanup、无 Vite / Playwright / Chrome 残留。

### Task 131 — V9 HN2-NUM12 T2 numeric ledger alignment proof

Status: `accepted`.

Owner: GLM-style worker + Codex takeover.

Priority: Task130 已 accepted；二本不只是“能建能训”，还要进入玩家和项目管理都能读懂的数值账本，避免后续 Castle / Knight / 高级科技扩展时又丢口径。

Prerequisite: `Task 130 — V9 HN2-AI11 AI post-Keep T2 usage slice` accepted.

Allowed files:

- `docs/V6_HUMAN_NUMERIC_LEDGER.zh-CN.md`
- `docs/HUMAN_RACE_PARITY_AND_NUMERIC_SYSTEM.zh-CN.md`
- `tests/v9-t2-numeric-ledger-alignment.spec.mjs`
- `docs/GLM_READY_TASK_QUEUE.md` only for closeout sync

Goal:

把当前已经实现并 accepted 的 HN2 内容写回数值账本：Keep、Workshop、Arcane Sanctum、Mortar Team、Priest 的成本、人口、建造/训练时间、前置关系和当前限制必须与 `GameData.ts` 一致。这个任务只修文档和静态 proof，不改运行时代码。

Required implementation:

1. 文档必须用用户能看懂的中文说明：当前二本已经有什么、还缺什么、为什么不等于完整人族二本。
2. 静态 proof 必须从 `src/game/GameData.ts` 读取真实数据，核对 ledger 中的关键数值和前置关系。
3. 必须明确 Castle、Knight、英雄、物品、飞行单位、完整法术科技仍未实现。
4. 任务完成时只把本任务在 `docs/GLM_READY_TASK_QUEUE.md` 标成 `completed`，不要替 Codex 标 `accepted`。

Forbidden:

- 不改 `src/game/Game.ts`、`src/game/GameData.ts`、`src/game/SimpleAI.ts`。
- 不新增任何 runtime test。
- 不新增 Castle、Knight、英雄、物品、飞行单位、新科技或素材。

Must prove:

1. Ledger 记录的 Keep / Workshop / Arcane Sanctum 建筑成本、时间、前置和训练项与 `GameData.ts` 一致。
2. Ledger 记录的 Mortar Team / Priest 单位成本、人口、训练时间、前置与 `GameData.ts` 一致。
3. Ledger 明确当前缺口，不能把当前切片描述成完整 War3 Human tech tree。

Verification:

```bash
node --test tests/v9-t2-numeric-ledger-alignment.spec.mjs
npm run build
npx tsc --noEmit -p tsconfig.app.json
./scripts/cleanup-local-runtime.sh
```

Closeout note:

- GLM 已更新 `docs/V6_HUMAN_NUMERIC_LEDGER.zh-CN.md` 和 `docs/HUMAN_RACE_PARITY_AND_NUMERIC_SYSTEM.zh-CN.md`，把 Keep / Workshop / Arcane Sanctum / Mortar Team / Priest 写入当前代码事实，并明确 Castle、Knight、完整法师/工程/空军/英雄/物品仍缺失。
- GLM 没有发出 `JOB_COMPLETE` closeout，companion 已把 job 标成 `interrupted / needs_reroute`。
- Codex 复核发现初版 `tests/v9-t2-numeric-ledger-alignment.spec.mjs` 直接 import `../src/game/GameData.js`，仓库没有该文件，`node --test` 失败。
- Codex 接管后把 proof 改成静态读取 `src/game/GameData.ts`、数值账本和人族终局合同文本，核对 T2 建筑、单位、build menu、缺口和 V9 合同口径。
- Codex 本地复核通过：`node --test tests/v9-t2-numeric-ledger-alignment.spec.mjs` 5/5、`npm run build`、`npx tsc --noEmit -p tsconfig.app.json`、cleanup、无 Vite / Playwright / Chrome 残留。

### Task 132 — V9 HN2-UX13 T2 visible numeric hints proof

Status: `accepted`.

Owner: GLM-style worker + Codex takeover.

Priority: Task131 已 accepted；数值账本已经对齐，下一步要证明玩家在实际界面里能看懂二本相关对象，而不是只有文档知道这些数值。

Prerequisite: `Task 131 — V9 HN2-NUM12 T2 numeric ledger alignment proof` accepted.

Allowed files:

- `tests/v9-t2-visible-numeric-hints.spec.ts`
- `src/game/Game.ts`
- `src/main.ts`
- `src/styles.css`
- `docs/GLM_READY_TASK_QUEUE.md` only for closeout sync

Goal:

证明或补齐玩家可见的二本数值提示：Keep 升级、Workshop / Arcane Sanctum 建造按钮、Mortar Team / Priest 训练按钮、选择面板或命令卡必须展示成本、人口、时间、前置/禁用原因等核心信息。任务只处理二本可读性，不新增单位、科技、AI 策略或素材。

Required implementation:

1. 优先写 focused runtime proof 读取真实 DOM 和 `window.__war3Game` 状态，不能只检查按钮存在。
2. 如果现有界面已满足，允许只新增 proof，不改产品代码。
3. 如果缺少关键提示，只允许在现有命令卡/选择面板文案上做最小补齐。
4. 文案必须是用户能懂的中文，不用 “gate / front door / shell / ledger” 这类内部词。

Forbidden:

- 不改 `src/game/GameData.ts`、`src/game/SimpleAI.ts`。
- 不新增 Castle、Knight、英雄、物品、飞行单位、完整法术科技或素材。
- 不改变资源、人口、前置、AI 行为或训练逻辑。

Must prove:

1. 无 Keep 时，Workshop / Arcane Sanctum 按钮不可用，且原因让玩家知道需要主城/二本。
2. Keep 后，Workshop / Arcane Sanctum 按钮展示真实 gold / lumber / build time。
3. Completed Workshop 下，Mortar Team 训练按钮展示真实 gold / lumber / supply / train time。
4. Completed Arcane Sanctum 下，Priest 训练按钮展示真实 gold / lumber / supply / train time，并能体现法师/治疗定位。
5. 证明读取的是当前 `GameData.ts` 的真实数值，不是测试硬写一套 UI 数字。

Verification:

```bash
npm run build
npx tsc --noEmit -p tsconfig.app.json
./scripts/run-runtime-tests.sh tests/v9-t2-visible-numeric-hints.spec.ts tests/v6-visible-numeric-hints-proof.spec.ts tests/v9-keep-upgrade-unlock-feedback.spec.ts --reporter=list
./scripts/cleanup-local-runtime.sh
```

Closeout note:

- GLM 新增 `tests/v9-t2-visible-numeric-hints.spec.ts`，但在运行验证后没有 `JOB_COMPLETE` closeout，且被 5 分钟 timeout 中断。
- Codex 复核发现初版 proof 只验证成本/人口，未验证任务要求里的 build/train time。
- Codex 接管后最小修改 `src/game/Game.ts` 命令卡：建筑按钮显示 `buildTime`，训练按钮显示 `trainTime`，主基地升级按钮显示升级耗时；没有改资源、人口、前置、AI 或单位数据。
- Codex 加强 proof：Workshop / Arcane Sanctum 建造按钮必须显示真实建造时间，Mortar Team / Priest 训练按钮必须显示真实训练时间。
- 本地复核通过：`npm run build`、`npx tsc --noEmit -p tsconfig.app.json`、focused Task132 runtime 6/6、Task132 + V6 numeric hints + Keep unlock feedback runtime 16/16、cleanup、无 Vite / Playwright / Chrome 残留。

### Task 133 — V9 HN2-ROLE14 T2 role combat smoke

Status: `accepted`.

Owner: GLM-style worker + Codex takeover.

Priority: Task132 已 accepted；玩家现在能看懂二本数值，下一步要证明二本单位不是只在按钮里存在，而是在受控战斗里有各自角色。

Prerequisite: `Task 132 — V9 HN2-UX13 T2 visible numeric hints proof` accepted.

Allowed files:

- `tests/v9-t2-role-combat-smoke.spec.ts`
- `docs/GLM_READY_TASK_QUEUE.md` only for closeout sync

Goal:

新增一个 focused runtime smoke，证明当前二本最小切片的两个代表单位在战斗里分别成立：Mortar Team 有远程攻城 / AOE 角色，Priest 有 mana / Heal 支援角色。任务只做证明，不新增 AI 编队、不改战斗数值、不加新单位/科技/素材。

Required implementation:

1. 使用受控 fixture：禁用 AI，手动 spawn 必要单位，读取 fresh `window.__war3Game` 状态。
2. Mortar proof 必须证明：攻击从 `GameData.ts` 的 `attackType: Siege` / `attackRange` / `attackDamage` 来，且 AOE 伤害会影响主目标附近的敌方单位，不伤友军。
3. Priest proof 必须证明：有 `mana/maxMana/manaRegen`，Heal 会消耗真实 mana、治疗受伤友军、拒绝敌方或满血目标。
4. 可以复用已有 V7 单项证明思路，但这个 smoke 必须以 V9 HN2 当前二本角色闭环来命名和组织。

Forbidden:

- 不改 `src/game/Game.ts`、`src/game/GameData.ts`、`src/game/SimpleAI.ts`。
- 不新增 AI 随军、阵型、自动进攻、Castle、Knight、英雄、物品、飞行单位、新技能或素材。
- 不用截图、按钮存在或单场胜负代替状态证明。

Must prove:

1. Mortar Team 的 AOE / Siege 行为仍可用，且来自当前数据。
2. Priest 的 Heal / mana 行为仍可用，且来自当前数据。
3. 两者可在同一 V9 HN2 smoke 文件中被复跑，不污染 session state。

Verification:

```bash
npm run build
npx tsc --noEmit -p tsconfig.app.json
./scripts/run-runtime-tests.sh tests/v9-t2-role-combat-smoke.spec.ts tests/v7-workshop-mortar-combat-model-proof.spec.ts tests/v7-arcane-sanctum-caster-proof.spec.ts --reporter=list
./scripts/cleanup-local-runtime.sh
```

Closeout note:

- GLM 初版写出 476 行 runtime proof，但 RC-1 读取了运行时 Unit 上不存在的 `attackType` 字段，并把 Priest mana 当成 `UNITS.priest.mana`，与当前实现不一致。
- GLM 旧验证在修正后又延迟启动了一次，继续跑旧断言；Codex 终止旧进程并清理 runtime，避免重复消耗。
- Codex 接管后把 proof 收窄为 3 个 focused smoke：T2 数据合同、Mortar Siege/AOE 受控战斗、Priest mana/Heal 受控战斗。
- 本地复核通过：`npm run build`、`npx tsc --noEmit -p tsconfig.app.json`、Task133 + V7 Workshop/Mortar + V7 Arcane/Priest runtime 15/15、cleanup、无 Vite / Playwright / Chrome 残留。

### Task 134 — V9 HN3-PLAN1 ability numeric model inventory

Status: `accepted`.

Owner: GLM-style worker + Codex takeover.

Priority: Task133 已 accepted；HN2 的 Keep/T2 最小闭环已经有生产、AI、数值提示和角色战斗证据。下一步进入 HN3，不先加 Sorceress / Spell Breaker / 英雄，而是先把现有能力样本整理成可扩展的 ability numeric model 边界。

Prerequisite: `Task 133 — V9 HN2-ROLE14 T2 role combat smoke` accepted.

Allowed files:

- `docs/V9_ABILITY_NUMERIC_MODEL_PACKET.zh-CN.md`
- `tests/v9-ability-numeric-model-inventory.spec.mjs`
- `docs/GLM_READY_TASK_QUEUE.md` only for closeout sync

Goal:

新增一个 HN3 ability numeric model 盘点包，读取当前代码和已接受 proof，把 Priest Heal、Rally Call、Mortar AOE 三个已有能力/效果样本整理成下一步可实现的数据模型边界。这个任务只做文档和静态 proof，不改运行时代码。

Required implementation:

1. 盘点现有能力样本：
   - Priest Heal：mana cost、cooldown、range、target filter、effect amount。
   - Rally Call：cooldown、duration、damage bonus、target/team scope。
   - Mortar AOE：radius、falloff、attackType trigger、enemy-only filter。
2. 定义最小 ability/effect 数据字段：`key`、`ownerType`、`cost`、`cooldown`、`range`、`targetRule`、`effectType`、`effectValue`、`duration`、`stackingRule`。
3. 明确 HN3 后续只允许从“把已有样本迁到数据模型”开始，不能直接新增完整 Sorceress、Spell Breaker、英雄、物品或 summon。
4. 新增 node proof，静态读取 `GameData.ts`、`Game.ts` 和新文档，证明现有三个样本都被覆盖，且文档写明不新增 gameplay。

Forbidden:

- 不改 `src/game/Game.ts`、`src/game/GameData.ts`、`src/game/SimpleAI.ts`。
- 不新增 Sorceress、Spell Breaker、英雄、物品、召唤物、隐身、驱散、buff/debuff 运行时代码。
- 不把 HN3 写成完整 ability 系统实现；这里只做模型边界和 proof。

Must prove:

1. 当前 Priest Heal / Rally Call / Mortar AOE 样本都能映射到 ability/effect 字段。
2. 当前 HN3 文档没有承诺新增单位、技能或素材。
3. 后续第一张实现任务应是迁移一个已有样本到数据模型，而不是开新玩法。

Verification:

```bash
npm run build
npx tsc --noEmit -p tsconfig.app.json
node --test tests/v9-ability-numeric-model-inventory.spec.mjs
./scripts/cleanup-local-runtime.sh
```

Closeout note:

- GLM 写出 `docs/V9_ABILITY_NUMERIC_MODEL_PACKET.zh-CN.md` 后再次停在 prompt，没有创建 `tests/v9-ability-numeric-model-inventory.spec.mjs`，也没有完整 closeout。
- Codex 接管后补静态 proof，读取 `GameData.ts`、`Game.ts` 和 HN3 文档，验证 Priest Heal、Rally Call、Mortar AOE 都映射到最小 ability/effect 字段，并验证文档明确禁止新增 gameplay。
- 本地复核通过：`node --test tests/v9-ability-numeric-model-inventory.spec.mjs` 5/5，`npm run build`，`npx tsc --noEmit -p tsconfig.app.json`，cleanup。

### Task 135 — V9 HN3-DATA2 Priest Heal ability data seed

Status: `accepted`.

Owner: GLM-style worker + Codex review.

Priority: Task134 已 accepted；HN3 已证明 Priest Heal 是最适合先迁移的数据模型样本。下一步只做数据种子，不改运行时行为。

Prerequisite: `Task 134 — V9 HN3-PLAN1 ability numeric model inventory` accepted.

Allowed files:

- `src/game/GameData.ts`
- `docs/V9_ABILITY_NUMERIC_MODEL_PACKET.zh-CN.md`
- `tests/v9-priest-heal-ability-data-seed.spec.mjs`
- `docs/GLM_READY_TASK_QUEUE.md` only for closeout sync

Goal:

新增最小 `AbilityDef` / `ABILITIES.priest_heal` 数据种子，把当前 Priest Heal 的 mana cost、cooldown、range、target rule、effect type、effect value 和 stacking rule 从“文档概念”固定到 `GameData.ts`。这个任务只加数据和静态 proof，不改 `Game.ts` 运行时，不改变 Heal 行为。

Required implementation:

1. 在 `GameData.ts` 新增最小 ability/effect 类型定义和 `ABILITIES.priest_heal`。
2. `ABILITIES.priest_heal` 必须引用或等值于现有常量：`PRIEST_HEAL_MANA_COST`、`PRIEST_HEAL_COOLDOWN`、`PRIEST_HEAL_RANGE`、`PRIEST_HEAL_AMOUNT`。
3. 文档补一小节说明：本任务只落 Priest Heal 数据种子，下一张才考虑 runtime 读取迁移。
4. 新增 node 静态 proof，验证数据种子存在、字段齐全、数值与当前常量一致，并验证 `Game.ts` 没有被改成读取新数据模型。

Forbidden:

- 不改 `src/game/Game.ts`、`src/game/SimpleAI.ts`。
- 不迁移 `castHeal` 运行时，不改 Priest 行为，不改 HUD。
- 不新增 Sorceress、Spell Breaker、英雄、物品、召唤物、buff/debuff runtime。
- 不把 Rally Call 或 Mortar AOE 一起种进数据模型；本张只做 Priest Heal。

Must prove:

1. `AbilityDef` / `ABILITIES.priest_heal` 字段齐全。
2. Priest Heal ability 数据与现有 Priest 常量一致。
3. 当前运行时代码仍保持原行为路径，任务没有偷偷迁移或改行为。

Verification:

```bash
npm run build
npx tsc --noEmit -p tsconfig.app.json
node --test tests/v9-priest-heal-ability-data-seed.spec.mjs
./scripts/cleanup-local-runtime.sh
```

Closeout note:

- GLM 写出 `AbilityDef`、`ABILITIES.priest_heal`、文档补充和静态 proof，但没有输出 closeout。
- Codex 复核发现 DS-4 proof 截取到 `castHeal` 调用点 / 片段过短，修正为定位 `castHeal(priest: Unit, target: Unit): boolean` 方法并扩大方法片段。
- 本地复核通过：`node --test tests/v9-priest-heal-ability-data-seed.spec.mjs` 5/5、`npm run build`、`npx tsc --noEmit -p tsconfig.app.json`、cleanup。

### Task 136 — V9 HN3-IMPL3 Priest Heal runtime data-read migration

Status: `accepted`.

Owner: GLM-style worker + Codex takeover.

Priority: Task135 已 accepted；Priest Heal 的数据种子已经存在。下一步只做零行为迁移：让当前 `castHeal` 读取 `ABILITIES.priest_heal`，但不改变治疗数值、目标过滤、冷却、mana 或 HUD。

Prerequisite: `Task 135 — V9 HN3-DATA2 Priest Heal ability data seed` accepted.

Allowed files:

- `src/game/Game.ts`
- `tests/v9-priest-heal-runtime-data-read.spec.ts`
- `docs/GLM_READY_TASK_QUEUE.md` only for closeout sync

Goal:

把 `castHeal` 中的 Priest Heal 数值读取从直接引用 `PRIEST_HEAL_*` 常量迁移为读取 `ABILITIES.priest_heal`，并用 runtime proof 证明行为完全不变。这个任务只迁移 Priest Heal，不迁移 Rally Call / Mortar AOE，不改 HUD，不新增新技能。

Required implementation:

1. `Game.ts` 从 `GameData.ts` 读取 `ABILITIES`。
2. `castHeal` 使用 `ABILITIES.priest_heal.cost.mana`、`cooldown`、`range`、`effectValue`。
3. 保留现有 target filter：priest only、same team、alive、injured、in range、enough mana、not on cooldown。
4. 新增 focused runtime proof，验证迁移后：
   - Heal 恢复 HP 和消耗 mana 数值等于 `ABILITIES.priest_heal`。
   - cooldown 等于 ability cooldown。
   - enemy / full HP / out-of-range / no-mana 仍被拒绝。
   - `tests/v7-arcane-sanctum-caster-proof.spec.ts` 相关行为不回退。

Forbidden:

- 不改 `src/game/GameData.ts`，除非 proof 发现 Task135 数据种子无法编译。
- 不改 `src/game/SimpleAI.ts`。
- 不新增 Sorceress、Spell Breaker、英雄、物品、召唤物、buff/debuff runtime。
- 不改 HUD 文案、不改 Priest 数值、不改 Rally Call、不改 Mortar AOE。

Must prove:

1. `castHeal` 现在读取 `ABILITIES.priest_heal`。
2. Heal 行为和 Task135 前一致。
3. 既有 V7 Priest proof 仍通过。

Verification:

```bash
npm run build
npx tsc --noEmit -p tsconfig.app.json
./scripts/run-runtime-tests.sh tests/v9-priest-heal-runtime-data-read.spec.ts tests/v7-arcane-sanctum-caster-proof.spec.ts --reporter=list
./scripts/cleanup-local-runtime.sh
```

Closeout note:

- GLM 已把 `Game.ts` 导入 `ABILITIES`，并把 `updateCasterAbilities` / `castHeal` 的 Heal 读取迁到 `ABILITIES.priest_heal`，但停在 prompt，没有 runtime proof 或 closeout。
- Codex 接管补 `tests/v9-priest-heal-runtime-data-read.spec.ts`，并修正 `tests/v9-priest-heal-ability-data-seed.spec.mjs` 的阶段性断言，避免 Task136 后旧 proof 永久失败。
- 本地复核通过：`npm run build`、`npx tsc --noEmit -p tsconfig.app.json`、focused runtime 13/13、Task135 node proof 5/5、cleanup。

### Task 137 — V9 HN3-DATA4 Rally Call ability data seed

Status: `accepted`.

Owner: GLM-style worker + Codex takeover.

Priority: Task136 已 accepted；Priest Heal 已完成数据种子和运行时读取迁移。下一步继续 HN3，但只做第二个既有样本的数据种子：Rally Call。

Prerequisite: `Task 136 — V9 HN3-IMPL3 Priest Heal runtime data-read migration` accepted.

Allowed files:

- `src/game/GameData.ts`
- `docs/V9_ABILITY_NUMERIC_MODEL_PACKET.zh-CN.md`
- `tests/v9-rally-call-ability-data-seed.spec.mjs`
- `docs/GLM_READY_TASK_QUEUE.md` only for closeout sync

Goal:

新增 `ABILITIES.rally_call` 数据种子，把当前 Rally Call 的 cooldown、radius、damage bonus、duration、target rule 和 stacking rule 固定到 `GameData.ts`。这个任务只加数据和静态 proof，不改 `Game.ts` 运行时，不改变 Rally Call 行为。

Required implementation:

1. 在 `ABILITIES` 中新增 `rally_call`。
2. `rally_call` 必须引用现有常量：`RALLY_CALL_COOLDOWN`、`RALLY_CALL_RADIUS`、`RALLY_CALL_DAMAGE_BONUS`、`RALLY_CALL_DURATION`。
3. `targetRule` 必须表达当前真实语义：友军、存活、非建筑、范围内。
4. `effectType` 必须表达当前真实效果：伤害加成，不得暗示治疗、减速、召唤或新 buff 系统。
5. 新增静态 proof，验证数据种子字段齐全、引用现有常量、`Game.ts` 仍未迁移 Rally Call runtime。

Forbidden:

- 不改 `src/game/Game.ts`。
- 不改 `src/game/SimpleAI.ts`。
- 不新增 Sorceress、Spell Breaker、英雄、物品、召唤物、aura、buff/debuff runtime。
- 不改 Rally Call 数值、HUD 文案、触发范围或持续时间。
- 不迁移 Mortar AOE。

Must prove:

1. `ABILITIES.rally_call` 字段齐全。
2. Rally Call 数据引用现有常量，而不是硬编码新数字。
3. `Game.ts` 仍保持当前 Rally Call runtime，不读取 `ABILITIES.rally_call`。
4. 任务没有新增 gameplay 内容。

Verification:

```bash
npm run build
npx tsc --noEmit -p tsconfig.app.json
node --test tests/v9-rally-call-ability-data-seed.spec.mjs
./scripts/cleanup-local-runtime.sh
```

Closeout note:

- GLM 初版写入 `ABILITIES.rally_call` 和 HN3 文档，但没有 proof/closeout，且把 Rally Call 常量引用放到常量定义之前导致 TypeScript 编译失败。
- Codex 接管修正：`RALLY_CALL_*` 常量前移到 `ABILITIES` 之前，`ownerType` 改为 `player_non_building_unit`，`targetRule.excludeTypes` 明确 `['building']`，并补静态 proof。
- 本地复核通过：`node --test tests/v9-rally-call-ability-data-seed.spec.mjs` 4/4、`npm run build`、`npx tsc --noEmit -p tsconfig.app.json`、cleanup。

### Task 138 — V9 HN3-DATA5 Mortar AOE ability data seed

Status: `accepted`.

Owner: GLM-style worker + Codex review.

Job: `glm-mo19s85q-6s7zlt`.

Job: `glm-mo19ji1a-bqrppz`.

Job: `glm-mo191x4s-vjr6g2`.

Priority: Task137 已 accepted；HN3 已有 Priest Heal 和 Rally Call 两个能力数据种子。下一步只做第三个既有样本：Mortar AOE 的被动 on-hit/AOE 数据种子。

Prerequisite: `Task 137 — V9 HN3-DATA4 Rally Call ability data seed` accepted.

Allowed files:

- `src/game/GameData.ts`
- `docs/V9_ABILITY_NUMERIC_MODEL_PACKET.zh-CN.md`
- `tests/v9-mortar-aoe-ability-data-seed.spec.mjs`
- `docs/GLM_READY_TASK_QUEUE.md` only for closeout sync

Goal:

新增 `ABILITIES.mortar_aoe` 数据种子，把当前 Mortar Team 的 AOE 半径、伤害衰减、敌方过滤、被动命中触发语义固定到 `GameData.ts`。这个任务只加数据和静态 proof，不改 `Game.ts` 运行时，不改变 Mortar 伤害、AOE、目标过滤或 HUD。

Required implementation:

1. 在 `ABILITIES` 中新增 `mortar_aoe`。
2. `mortar_aoe` 必须引用现有常量：`MORTAR_AOE_RADIUS`、`MORTAR_AOE_FALLOFF`，不得硬编码数值。
3. `targetRule` 必须表达当前真实语义：敌方、存活、非建筑、AOE 半径内。
4. `effectType` 必须表达当前真实效果：被动 AOE splash / falloff damage，不得暗示主动技能、治疗、减速、召唤或新 projectile 系统。
5. 新增静态 proof，验证数据种子字段齐全、引用现有常量、`Game.ts` 仍未迁移 Mortar AOE runtime。

Forbidden:

- 不改 `src/game/Game.ts`。
- 不改 `src/game/SimpleAI.ts`。
- 不新增 Sorceress、Spell Breaker、英雄、物品、召唤物、aura、buff/debuff runtime。
- 不改 Mortar Team 数值、AOE 半径、falloff、target filter、HUD 文案或 projectile/attack behavior。
- 不迁移 Priest Heal 或 Rally Call。

Must prove:

1. `ABILITIES.mortar_aoe` 字段齐全。
2. Mortar AOE 数据引用现有常量，而不是硬编码新数字。
3. `Game.ts` 仍保持当前 Mortar AOE runtime，不读取 `ABILITIES.mortar_aoe`。
4. 任务没有新增 gameplay 内容。

Verification:

```bash
npm run build
npx tsc --noEmit -p tsconfig.app.json
node --test tests/v9-mortar-aoe-ability-data-seed.spec.mjs
./scripts/cleanup-local-runtime.sh
```

Codex acceptance addendum:

- GLM completed the core hero-specific Altar summon path and initial 6-proof runtime pack.
- Codex found one gap before accepting: uniqueness only checked the selected Altar queue, so a second Altar or direct `trainUnit` call could have queued a second Paladin.
- Codex fixed `Game.ts` so hero uniqueness is enforced both in command-card availability and inside `trainUnit`.
- Codex strengthened PSUM-4 to use two Altars and prove a direct `g.trainUnit(secondAltar, 'paladin')` cannot spend resources or add a second queue item.
- Final verification:
  - `npm run build` pass.
  - `npx tsc --noEmit -p tsconfig.app.json` pass.
  - `./scripts/run-runtime-tests.sh tests/v9-hero6b-paladin-summon-runtime.spec.ts --reporter=list` -> 6/6 pass.
  - `node --test tests/v9-hero6-altar-runtime-exposure-contract.spec.mjs tests/v9-hero5-holy-light-data-seed.spec.mjs` -> 35/35 pass.
  - `./scripts/cleanup-local-runtime.sh` pass; no Vite / Playwright / Chromium / chrome-headless-shell leftovers.

READY_FOR_NEXT_TASK: HERO7-IMPL1 — Holy Light manual runtime only.

Closeout requirements:
- Start your final closeout with the exact line: JOB_COMPLETE: <job-id>
- If truly blocked, emit the exact line: JOB_BLOCKED: <job-id>
- Include sections for files changed, verification run, and remaining unknowns.
- End with an exact line that begins with READY_FOR_NEXT_TASK: followed by the next safe continuation.
- Keep the work within the requested scope; do not widen ownership on your own.

Closeout requirements:
- Start your final closeout with the exact line: JOB_COMPLETE: <job-id>
- If truly blocked, emit the exact line: JOB_BLOCKED: <job-id>
- Include sections for files changed, verification run, and remaining unknowns.
- End with an exact line that begins with READY_FOR_NEXT_TASK: followed by the next safe continuation.
- Keep the work within the requested scope; do not widen ownership on your own.

Closeout note:

- GLM 先添加了 `AbilityDef.aoeRadius/aoeFalloff`，随后进入 compact/queued message 状态，没有完成任务。
- Codex 停止 GLM 会话后接管：补 `ABILITIES.mortar_aoe`、HN3 文档、`tests/v9-mortar-aoe-ability-data-seed.spec.mjs`。
- 本地复核通过：`node --test tests/v9-mortar-aoe-ability-data-seed.spec.mjs` 4/4、`npx tsc --noEmit -p tsconfig.app.json`、`npm run build`。

### Task 139 — V9 HN3-IMPL6 Rally Call runtime data-read migration

Status: `accepted`.

Owner: GLM-style worker + Codex takeover/review.

Priority: HN3 三个既有样本的数据种子已落盘。下一步只迁移第二个已有样本 Rally Call 的运行时读取，让现有逻辑读取 `ABILITIES.rally_call`，不打开通用 buff 系统。

Prerequisite: `Task 138 — V9 HN3-DATA5 Mortar AOE ability data seed` accepted.

Allowed files:

- `src/game/Game.ts`
- `tests/v9-rally-call-runtime-data-read.spec.ts`
- `docs/GLM_READY_TASK_QUEUE.md` only for closeout sync

Goal:

把现有 Rally Call 运行时的 cooldown、radius、duration、damage bonus 读取迁移到 `ABILITIES.rally_call`。行为必须保持不变：只有玩家侧非建筑单位能触发，影响范围、持续时间、冷却和伤害加成不变，敌方/建筑/死亡单位不受影响。

Required implementation:

1. 在 `triggerRallyCall` 中读取 `ABILITIES.rally_call`，使用其 `cooldown`、`range`、`duration`。
2. 在 Rally Call 伤害加成路径中读取 `ABILITIES.rally_call.effectValue`。
3. 不引入通用 buff 系统；继续使用现有 `rallyCallBoostUntil` / `rallyCallCooldownUntil` 字段。
4. 新增 focused runtime proof，证明迁移前后的用户可见行为不变。

Forbidden:

- 不改 `src/game/GameData.ts`。
- 不改 `src/game/SimpleAI.ts`。
- 不改 Rally Call 数值、目标过滤、HUD 文案或按钮可见性。
- 不新增 buff/debuff 系统、aura、英雄、物品、召唤物、Sorceress、Spell Breaker。
- 不迁移 Mortar AOE runtime。

Must prove:

1. `Game.ts` 读取 `ABILITIES.rally_call` 的 cooldown、range、duration、effectValue。
2. Rally Call 仍拒绝建筑、敌方、冷却中和非玩家来源。
3. 友方非建筑单位在范围内仍获得同样持续时间的加成。
4. 加成期间攻击仍增加同样伤害。

Verification:

```bash
npm run build
npx tsc --noEmit -p tsconfig.app.json
./scripts/run-runtime-tests.sh tests/v9-rally-call-runtime-data-read.spec.ts tests/v6-human-rally-call-identity-proof.spec.ts --reporter=list
./scripts/cleanup-local-runtime.sh
```

Codex acceptance addendum:

- GLM implemented `castHolyLight` and a Paladin command-card button using `ABILITIES.holy_light`.
- GLM also stage-updated HERO1-HERO6 static proofs because the earlier “data-only, no runtime” assertions became stale after HERO7.
- Codex reviewed the runtime proof and strengthened it in two places:
  - HL-RT3 now proves Holy Light caps healing at target max HP instead of over-healing.
  - HL-RT5 now proves the command-card button is disabled during cooldown, not only that direct `castHolyLight` returns false.
- Final verification:
  - `npm run build` pass.
  - `npx tsc --noEmit -p tsconfig.app.json` pass.
  - `node --test tests/v9-hero5-holy-light-data-seed.spec.mjs tests/v9-hero6-altar-runtime-exposure-contract.spec.mjs tests/v9-hero4-paladin-data-seed.spec.mjs tests/v9-hero3-altar-data-seed.spec.mjs tests/v9-hero2-altar-paladin-source-boundary.spec.mjs tests/v9-hero1-altar-paladin-contract.spec.mjs` -> 117/117 pass.
  - `./scripts/run-runtime-tests.sh tests/v9-hero7-holy-light-runtime.spec.ts --reporter=list` -> 7/7 pass.
  - `./scripts/cleanup-local-runtime.sh` pass; no Vite / Playwright / Chromium / chrome-headless-shell leftovers.

READY_FOR_NEXT_TASK: HERO8-CLOSE1 — Hero minimal runtime closure inventory.

Closeout requirements:
- Start your final closeout with the exact line: JOB_COMPLETE: <job-id>
- If truly blocked, emit the exact line: JOB_BLOCKED: <job-id>
- Include sections for files changed, verification run, and remaining unknowns.
- End with an exact line that begins with READY_FOR_NEXT_TASK: followed by the next safe continuation.
- Keep the work within the requested scope; do not widen ownership on your own.

Closeout note:

- GLM 完成 `Game.ts` 核心迁移并新增 `tests/v9-rally-call-runtime-data-read.spec.ts`，但用错 runtime 命令跑了 `run-runtime-suite.sh`，启动了默认 runtime 包。
- Codex 中断错误 runtime、清理残留、修正 proof 中浏览器上下文误读 Node 常量的问题，并补静态断言证明 `Game.ts` 真读取 `ABILITIES.rally_call`。
- 本地复核通过：`npx tsc --noEmit -p tsconfig.app.json`、`npm run build`、`./scripts/run-runtime-tests.sh tests/v9-rally-call-runtime-data-read.spec.ts tests/v6-human-rally-call-identity-proof.spec.ts --reporter=list` 13/13、cleanup。

### Task 140 — V9 HN3-IMPL7 Mortar AOE runtime data-read migration

Status: `accepted`.

Owner: GLM-style worker + Codex takeover/review.

Priority: Priest Heal 和 Rally Call 的 runtime data-read migration 已 accepted。下一步只迁移第三个既有样本 Mortar AOE，让现有 splash runtime 读取 `ABILITIES.mortar_aoe` 的 radius / falloff / effect type 数据，不改变战斗行为。

Prerequisite: `Task 139 — V9 HN3-IMPL6 Rally Call runtime data-read migration` accepted.

Allowed files:

- `src/game/Game.ts`
- `tests/v9-mortar-aoe-runtime-data-read.spec.ts`
- `docs/GLM_READY_TASK_QUEUE.md` only for closeout sync

Goal:

把现有 Mortar AOE runtime 的半径和衰减读取迁移到 `ABILITIES.mortar_aoe`。行为必须保持不变：Siege attack 仍触发 splash，主目标仍不重复受伤，同队/死亡/goldmine 仍过滤，距离衰减伤害不变。

Required implementation:

1. 在 `dealDamage` / `dealAoeSplash` 路径中读取 `ABILITIES.mortar_aoe`。
2. 使用 `ABILITIES.mortar_aoe.aoeRadius` 替代直接读取 `MORTAR_AOE_RADIUS` 的 runtime 判定。
3. 使用 `ABILITIES.mortar_aoe.aoeFalloff` 替代直接读取 `MORTAR_AOE_FALLOFF` 的 runtime 衰减计算。
4. 新增 focused runtime proof，证明迁移前后的 splash 行为不变。

Forbidden:

- 不改 `src/game/GameData.ts`。
- 不改 `src/game/SimpleAI.ts`。
- 不改 Mortar Team 数值、攻击冷却、攻击类型、目标过滤、HUD 文案或 projectile/attack behavior。
- 不新增 projectile 系统、onHit 回调系统、buff/debuff 系统、英雄、物品、召唤物、Sorceress、Spell Breaker。
- 不迁移 Priest Heal 或 Rally Call。

Must prove:

1. `Game.ts` 读取 `ABILITIES.mortar_aoe.aoeRadius` 和 `aoeFalloff`。
2. Siege attack 仍触发 AOE splash。
3. Splash 仍排除主目标、攻击者、同队、死亡单位和 goldmine。
4. 中心/边缘衰减结果与现有 `MORTAR_AOE_FALLOFF` 合同一致。

Verification:

```bash
npm run build
npx tsc --noEmit -p tsconfig.app.json
./scripts/run-runtime-tests.sh tests/v9-mortar-aoe-runtime-data-read.spec.ts tests/v7-workshop-mortar-combat-model-proof.spec.ts --reporter=list
./scripts/cleanup-local-runtime.sh
```

Closeout requirements:
- Start your final closeout with the exact line: JOB_COMPLETE: <job-id>
- If truly blocked, emit the exact line: JOB_BLOCKED: <job-id>
- Include sections for files changed, verification run, and remaining unknowns.
- End with an exact line that begins with READY_FOR_NEXT_TASK: followed by the next safe continuation.
- Keep the work within the requested scope; do not widen ownership on your own.

Closeout note:

- GLM 完成 `Game.ts` 核心迁移并新增 `tests/v9-mortar-aoe-runtime-data-read.spec.ts`，但任务没有形成可信 closeout，且验证进程被 cleanup 中断为 143。
- Codex 接管修正 browser `page.evaluate` 中不能读取 Node 侧 `ABILITIES` 的问题，并把旧 `tests/v9-mortar-aoe-ability-data-seed.spec.mjs`、`tests/v9-ability-numeric-model-inventory.spec.mjs` 升级到 Task140 后状态。
- 本地复核通过：`node --test tests/v9-ability-numeric-model-inventory.spec.mjs tests/v9-rally-call-ability-data-seed.spec.mjs tests/v9-mortar-aoe-ability-data-seed.spec.mjs tests/lane-feed.spec.mjs` 56/56、`npx tsc --noEmit -p tsconfig.app.json`、`npm run build`、`./scripts/run-runtime-tests.sh tests/v9-mortar-aoe-runtime-data-read.spec.ts tests/v7-workshop-mortar-combat-model-proof.spec.ts --reporter=list` 9/9、cleanup。

### Task 141 — V9 HN3-UX8 ability command-card data-read migration

Status: `accepted`.

Owner: GLM job `glm-mo28rp3r-loxllp` + Codex review.

Priority: Priest Heal、Rally Call、Mortar AOE 的核心 runtime 已经读取 `ABILITIES`。但玩家可见命令卡和状态提示仍有部分旧常量读取，下一步只把这些 UI / command-surface 读数收敛到 `ABILITIES`，避免数据模型和玩家看到的数值分叉。

Prerequisite: `Task 140 — V9 HN3-IMPL7 Mortar AOE runtime data-read migration` accepted.

Allowed files:

- `src/game/Game.ts`
- `tests/v9-ability-command-card-data-read.spec.ts`
- `docs/GLM_READY_TASK_QUEUE.md` only for closeout sync

Goal:

把现有 Rally Call / Priest Heal 命令卡和可见状态提示中的旧常量读取迁移到 `ABILITIES.rally_call` / `ABILITIES.priest_heal`。行为必须保持不变：按钮文字数值、mana 判断、冷却判断、手动 Heal 选目标范围和 Rally Call 可见加成提示都要与当前一致。

Required implementation:

1. `Game.ts` 命令卡中的 Rally Call cost / 状态提示读取 `ABILITIES.rally_call.effectValue` 和 `duration`。
2. `Game.ts` 命令卡中的 Priest Heal mana cost、回复量和手动选目标范围读取 `ABILITIES.priest_heal.cost.mana`、`effectValue` 和 `range`。
3. 移除 `Game.ts` 对 `RALLY_CALL_*` 和 `PRIEST_HEAL_*` 运行/界面旧常量的直接依赖，除非静态 proof 证明该引用只在测试或数据表里。
4. 新增 focused proof，证明命令卡和可见提示仍显示当前真实数值，且手动 Heal 仍能使用当前 range 选中受伤友军。

Forbidden:

- 不改 `src/game/GameData.ts`。
- 不改 `src/game/SimpleAI.ts`。
- 不改 Heal / Rally Call / Mortar AOE 数值。
- 不新增新技能、新单位、buff/debuff 系统、hero、item、Sorceress、Spell Breaker。
- 不重写命令卡 UI，只做数据读取迁移和最小 proof。

Must prove:

1. `Game.ts` 命令卡 / 状态提示读取 `ABILITIES.rally_call` 和 `ABILITIES.priest_heal`。
2. `Game.ts` 不再直接依赖 `RALLY_CALL_*` / `PRIEST_HEAL_*` 作为 UI 或手动施法数据源。
3. Rally Call 命令卡仍展示当前伤害加成和持续时间。
4. Priest Heal 命令卡仍展示当前 mana cost 和回复量，手动 Heal 仍按 ability range 选择范围内受伤友军。

Verification:

```bash
npm run build
npx tsc --noEmit -p tsconfig.app.json
./scripts/run-runtime-tests.sh tests/v9-ability-command-card-data-read.spec.ts tests/v9-priest-heal-runtime-data-read.spec.ts tests/v9-rally-call-runtime-data-read.spec.ts --reporter=list
./scripts/cleanup-local-runtime.sh
```

Closeout requirements:
- Start your final closeout with the exact line: JOB_COMPLETE: <job-id>
- If truly blocked, emit the exact line: JOB_BLOCKED: <job-id>
- Include sections for files changed, verification run, and remaining unknowns.
- End with an exact line that begins with READY_FOR_NEXT_TASK: followed by the next safe continuation.
- Keep the work within the requested scope; do not widen ownership on your own.

Closeout note:

- GLM 完成 `Game.ts` 核心迁移：Rally Call 状态提示 / 命令卡、Priest Heal mana / 回复量 / 手动范围均读取 `ABILITIES`，并移除 `Game.ts` 旧常量 import。
- GLM 没有新增 proof / closeout，Codex 接管新增 `tests/v9-ability-command-card-data-read.spec.ts`。
- 本地复核通过：`npx tsc --noEmit -p tsconfig.app.json`、`npm run build`、`./scripts/run-runtime-tests.sh tests/v9-ability-command-card-data-read.spec.ts tests/v9-priest-heal-runtime-data-read.spec.ts tests/v9-rally-call-runtime-data-read.spec.ts --reporter=list` 14/14、cleanup。

### Task 142 — V9 HN3-CLOSE9 ability data-read closure inventory

Status: `accepted`.

Owner: GLM partial + Codex takeover/review.

Priority: HN3 收口盘点完成。Priest Heal、Rally Call、Mortar AOE 的 runtime/UI 读取已统一到 `ABILITIES`；`Game.ts` 不再包含旧常量；文档明确下一步必须从相邻 Human/numeric program 进入。

Prerequisite: `Task 141 — V9 HN3-UX8 ability command-card data-read migration` accepted.

Allowed files:

- `docs/V9_ABILITY_NUMERIC_MODEL_PACKET.zh-CN.md`
- `docs/V9_HUMAN_NUMERIC_EXPANSION_PACKET.zh-CN.md`
- `tests/v9-ability-data-read-closure.spec.mjs`
- `docs/GLM_READY_TASK_QUEUE.md` only for closeout sync

Goal:

产出 HN3 收口盘点：Priest Heal、Rally Call、Mortar AOE 的数据种子、运行时读取、命令卡 / 可见提示读取都已经统一到 `ABILITIES`；仍然禁止把 HN3 收口扩成 Sorceress、Spell Breaker、英雄、物品、完整 buff/debuff 或 projectile/onHit 系统。

Required implementation:

1. 更新 HN3 文档，列出三个样本的 data seed、runtime data-read、visible / command-card data-read 状态。
2. 新增静态 proof，读取 `GameData.ts`、`Game.ts` 和 HN3 文档，证明三样本已统一到 `ABILITIES`。
3. proof 必须确认 `Game.ts` 不再直接包含 `RALLY_CALL_*`、`PRIEST_HEAL_*`、`MORTAR_AOE_*` 作为 runtime/UI 读取源。
4. proof 必须确认 HN3 文档没有承诺新技能、新单位、英雄、物品或完整系统。

Forbidden:

- 不改 `src/game/Game.ts`。
- 不改 `src/game/GameData.ts`。
- 不改 runtime specs。
- 不新增技能、新单位、英雄、物品、素材、AI 策略或战斗数值。
- 不把 HN3 closeout 写成 V9 完整收口；这只是 ability numeric model 子阶段收口。

Must prove:

1. `ABILITIES.priest_heal`、`ABILITIES.rally_call`、`ABILITIES.mortar_aoe` 均存在。
2. `Game.ts` runtime / UI paths 读取 `ABILITIES`。
3. `Game.ts` 不再读取旧 ability 常量作为 runtime/UI 源。
4. 文档明确下一步必须从相邻 Human/numeric program 进入，而不是无边界内容扩张。

Verification:

```bash
node --test tests/v9-ability-data-read-closure.spec.mjs tests/v9-ability-numeric-model-inventory.spec.mjs
npm run build
npx tsc --noEmit -p tsconfig.app.json
./scripts/cleanup-local-runtime.sh
```

Closeout requirements:
- Start your final closeout with the exact line: JOB_COMPLETE: <job-id>
- If truly blocked, emit the exact line: JOB_BLOCKED: <job-id>
- Include sections for files changed, verification run, and remaining unknowns.
- End with an exact line that begins with READY_FOR_NEXT_TASK: followed by the next safe continuation.
- Keep the work within the requested scope; do not widen ownership on your own.

Closeout note:

- GLM 完成 HN3 收口盘点、文档更新和 `tests/v9-ability-data-read-closure.spec.mjs`。
- Codex 本地复核通过：`node --test tests/v9-ability-data-read-closure.spec.mjs tests/v9-ability-numeric-model-inventory.spec.mjs` 9/9、`npm run build`、`npx tsc --noEmit -p tsconfig.app.json`、cleanup。

### Task 143 — V9 HN4-PLAN1 Militia / Defend branch contract

Status: `accepted`.

Owner: GLM partial + Codex takeover/review.

Priority: HN4 合同已被 Codex 本地复核接受。Militia / Back to Work / Defend 三个能力的最小数据字段、runtime 行为、proof 序列和禁区已完成；下一步只能选一个最小实现切片。

Prerequisite: `Task 142 — V9 HN3-CLOSE9 ability data-read closure inventory` accepted.

Allowed files:

- `docs/V9_HUMAN_NUMERIC_EXPANSION_PACKET.zh-CN.md`
- `docs/V9_HN4_MILITIA_DEFEND_CONTRACT.zh-CN.md`
- `tests/v9-hn4-militia-defend-contract.spec.mjs`
- `docs/GLM_READY_TASK_QUEUE.md` only for closeout sync

Goal:

定义 HN4 第一分支合同：Militia / Back to Work / Defend 应如何分阶段进入当前项目。只做产品 / 数值 / proof 边界，不改运行时代码。

Required implementation:

1. 新增 HN4 合同文档，区分 Militia、Back to Work、Defend 三个能力的目标、当前缺口、最小数据字段、最小 runtime 行为和 proof 序列。
2. 明确第一张可执行实现任务只能选一个最小切片，不能一次实现三套完整系统。
3. 明确禁区：不做完整英雄、商店、物品、第二阵营、全科技树、素材导入、完整 AI 战术重写。
4. 新增静态 proof，确认合同存在、候选顺序和禁区清楚，并且没有修改 `Game.ts` / `GameData.ts`。

Forbidden:

- 不改 `src/game/Game.ts`。
- 不改 `src/game/GameData.ts`。
- 不新增 runtime tests。
- 不新增 Militia / Defend 代码、数值或 UI。
- 不把 HN4 合同写成完整 Human 终局计划；这只是第一分支合同。

Must prove:

1. 合同包含 Militia、Back to Work、Defend 三个条目。
2. 合同定义最小数据字段、最小 runtime 行为和 proof 顺序。
3. 合同明确第一张实现任务只能是一个最小切片。
4. 合同明确禁止英雄、物品、第二阵营、素材导入和全科技树扩张。

Verification:

```bash
node --test tests/v9-hn4-militia-defend-contract.spec.mjs
npm run build
npx tsc --noEmit -p tsconfig.app.json
./scripts/cleanup-local-runtime.sh
```

Closeout requirements:
- Start your final closeout with the exact line: JOB_COMPLETE: <job-id>
- If truly blocked, emit the exact line: JOB_BLOCKED: <job-id>
- Include sections for files changed, verification run, and remaining unknowns.
- End with an exact line that begins with READY_FOR_NEXT_TASK: followed by the next safe continuation.
- Keep the work within the requested scope; do not widen ownership on your own.

Closeout note:

- GLM 完成 `docs/V9_HN4_MILITIA_DEFEND_CONTRACT.zh-CN.md`、`tests/v9-hn4-militia-defend-contract.spec.mjs` 和 HN4 进展同步。
- Codex 本地复核通过：`node --test tests/v9-hn4-militia-defend-contract.spec.mjs` 5/5、`npm run build`、`npx tsc --noEmit -p tsconfig.app.json`、`FORCE_RUNTIME_CLEANUP=1 ./scripts/cleanup-local-runtime.sh`，并确认无 runtime 残留。
- GLM closeout 漏了 `READY_FOR_NEXT_TASK` 行，后续在问题台账记录。

### Task 144 — V9 HN4-DATA1 Militia data seed

Status: `accepted`.

Owner: GLM-style worker + Codex takeover.

Priority: Task143 已接受；HN4 第一张实现任务必须是一个最小切片。按合同推荐顺序，先只落 Militia / Call to Arms 数据种子，不写变身 runtime。

Prerequisite: `Task 143 — V9 HN4-PLAN1 Militia / Defend branch contract` accepted.

Allowed files:

- `src/game/GameData.ts`
- `docs/V9_HN4_MILITIA_DEFEND_CONTRACT.zh-CN.md`
- `docs/V9_HUMAN_NUMERIC_EXPANSION_PACKET.zh-CN.md`
- `tests/v9-hn4-militia-data-seed.spec.mjs`
- `docs/GLM_READY_TASK_QUEUE.md` only for closeout sync

Goal:

新增 HN4 的最小 Militia 数据种子：`UNITS.militia` 和 `ABILITIES.call_to_arms`。这只建立数据入口，不让玩家实际点击、不改单位运行时、不改 AI。

Required implementation:

1. 在 `GameData.ts` 新增 `UNITS.militia`，字段必须来自 HN4 合同：临时农民战斗形态、不能采集、普通近战、重甲、45 秒语义通过 ability 表达。
2. 扩展最小 `AbilityDef` 以表达 morph 目标（例如可选 `morphTarget?: string`），并新增 `ABILITIES.call_to_arms`，指向 `militia`，持续时间 45 秒，owner 仍是 `worker`。
3. 新增静态 proof，证明 `UNITS.militia` 和 `ABILITIES.call_to_arms` 存在且数值与合同一致。
4. proof 必须证明 `Game.ts` 未出现 `call_to_arms` / `militia` runtime 或命令卡代码；`back_to_work` / `defend` 数据种子也不能在本任务里出现。
5. 更新 HN4 合同和 Human numeric expansion packet 的当前进展，但不能把 runtime 写成已完成。

Forbidden:

- 不改 `src/game/Game.ts`。
- 不新增 runtime tests。
- 不新增命令卡按钮、点击处理、变身计时器、自动回退、AI 使用或视觉素材。
- 不新增 `back_to_work` / `defend` ability seed。
- 不把 Militia 加入任何建筑训练队列。
- 不改 Worker、Footman、Priest、Rally Call、Mortar AOE 既有数值。

Must prove:

1. `UNITS.militia` 存在，`canGather: false`，`attackType: AttackType.Normal`，`armorType: ArmorType.Heavy`。
2. `ABILITIES.call_to_arms` 存在，`ownerType: 'worker'`，`morphTarget: 'militia'`，`duration: 45`。
3. `Game.ts` 没有 `call_to_arms` / `militia` runtime 或命令卡代码。
4. `ABILITIES` 没有新增 `back_to_work` / `defend`。
5. 既有 HN3 ability seeds 仍存在。

Verification:

```bash
node --test tests/v9-hn4-militia-data-seed.spec.mjs tests/v9-hn4-militia-defend-contract.spec.mjs
npm run build
npx tsc --noEmit -p tsconfig.app.json
./scripts/cleanup-local-runtime.sh
```

Closeout requirements:
- Start your final closeout with the exact line: JOB_COMPLETE: <job-id>
- If truly blocked, emit the exact line: JOB_BLOCKED: <job-id>
- Include sections for files changed, verification run, and remaining unknowns.
- End with an exact line that begins with READY_FOR_NEXT_TASK: followed by the next safe continuation.
- Keep the work within the requested scope; do not widen ownership on your own.

Codex acceptance note:

- GLM 完成 `UNITS.militia`、`ABILITIES.call_to_arms`、HN4 合同进展和静态 proof，但在更新队列文档时卡住，没有可信 closeout。
- Codex 接管后修正 `ABILITIES.call_to_arms.range` 为 `BUILDINGS.townhall.size * 2`，让数据表达和“主基地附近触发”合同一致。
- Codex 加固 `tests/v9-hn4-militia-data-seed.spec.mjs` 的对象块 proof，避免全文件字符串误判。
- Codex 本地复核通过：`node --test tests/v9-hn4-militia-data-seed.spec.mjs tests/v9-hn4-militia-defend-contract.spec.mjs` 10/10、`npm run build`、`npx tsc --noEmit -p tsconfig.app.json`、`FORCE_RUNTIME_CLEANUP=1 ./scripts/cleanup-local-runtime.sh`，并确认无 runtime 残留。

### Task 145 — V9 HN4-IMPL2 Militia Call to Arms runtime slice

Status: `accepted`.

Owner: GLM-style worker + Codex takeover.

Priority: Task144 已接受，`UNITS.militia` 和 `ABILITIES.call_to_arms` 数据入口已存在。下一步只把这一个能力接入最小 runtime，不同时打开 Back to Work、Defend、AI 或素材。

Prerequisite: `Task 144 — V9 HN4-DATA1 Militia data seed` accepted.

Allowed files:

- `src/game/Game.ts`
- `tests/v9-hn4-militia-call-to-arms-runtime.spec.ts`
- `docs/V9_HN4_MILITIA_DEFEND_CONTRACT.zh-CN.md`
- `docs/V9_HUMAN_NUMERIC_EXPANSION_PACKET.zh-CN.md`
- `docs/GLM_READY_TASK_QUEUE.md` only for closeout sync

Goal:

让玩家选中 Worker 时，如果它在已完成的友方 Town Hall / Keep 附近，可以看到并点击“紧急动员”。点击后该 Worker 临时变成 Militia，使用 `UNITS.militia` / `ABILITIES.call_to_arms` 的数据，并在 45 秒后自动变回 Worker。

Required implementation:

1. 在 `Game.ts` 增加最小 Militia 变身状态，例如记录原始单位类型和过期时间；必须读取 `ABILITIES.call_to_arms.duration`、`ABILITIES.call_to_arms.range` 和 `morphTarget`。
2. 命令卡只对选中的 Worker 暴露“紧急动员”：必须要求附近有已完成友方 `townhall` 或 `keep`；不允许 Castle 代理。
3. 点击后清理 Worker 的采集、建造、移动和攻击中间态，单位类型临时切到 `militia`，战斗数值来自 `UNITS.militia`。
4. 每帧或每个 simulation tick 检查过期 Militia，45 秒后自动恢复为 Worker，恢复后保持可选中、可下达普通 Worker 命令。
5. 新增 focused runtime proof，覆盖按钮可见/不可见、点击变身、过期自动回 Worker、不能采集期间不进入资源循环、无 Back to Work / Defend 按钮。
6. 更新 HN4 合同和 Human numeric expansion packet 的当前进展，只能写 Militia runtime 最小切片完成，不得宣称 Back to Work / Defend 已完成。

Forbidden:

- 不新增 `back_to_work` ability seed、按钮或运行时。
- 不新增 `defend` ability seed、按钮或运行时。
- 不改 AI 策略、不让 AI 自动使用 Militia。
- 不导入新素材、不改 UnitVisualFactory / BuildingVisualFactory。
- 不新增 Castle、Knight、英雄、物品、第二阵营或完整科技树。
- 不把 Militia 加入任何建筑训练队列；Militia 只能来自 Worker 临时变身。
- 不用硬编码 45 秒、范围或目标单位；必须从 `ABILITIES.call_to_arms` / `UNITS.militia` 读取。

Must prove:

1. Worker 在完成的友方 Town Hall / Keep 附近时，命令卡出现“紧急动员”。
2. Worker 远离 Town Hall / Keep 时，命令卡不允许使用“紧急动员”。
3. 点击“紧急动员”后，选中单位变成 `militia`，攻击、护甲、canGather 状态来自 `UNITS.militia`。
4. 经过 `ABILITIES.call_to_arms.duration` 后，Militia 自动变回 Worker。
5. 变身期间不出现 `Back to Work` 或 `Defend` 按钮。
6. 现有 Worker 采矿、Town Hall / Keep 命令面、Rally Call / Priest Heal / Mortar AOE 数据读取不被破坏。

Verification:

```bash
npm run build
npx tsc --noEmit -p tsconfig.app.json
./scripts/run-runtime-tests.sh tests/v9-hn4-militia-call-to-arms-runtime.spec.ts --reporter=list
node --test tests/v9-hn4-militia-data-seed.spec.mjs tests/v9-hn4-militia-defend-contract.spec.mjs
FORCE_RUNTIME_CLEANUP=1 ./scripts/cleanup-local-runtime.sh
```

Codex acceptance note:

- GLM 完成 Militia runtime 主体、runtime proof 和进展文档，但使用 `npx playwright test` / `tail` 验证，并在更新 `docs/GLM_READY_TASK_QUEUE.md` 时连续报错卡住。
- Codex 接管后补强变身状态清理：`morphToMilitia` 现在会清 `buildTarget`、 reciprocal `builder`、`gatherTimer` 和 previous-order 快照。
- Codex 本地复核通过：`npm run build`、`npx tsc --noEmit -p tsconfig.app.json`、`./scripts/run-runtime-tests.sh tests/v9-hn4-militia-call-to-arms-runtime.spec.ts --reporter=list` 6/6、`node --test tests/v9-hn4-militia-data-seed.spec.mjs tests/v9-hn4-militia-defend-contract.spec.mjs` 10/10、`FORCE_RUNTIME_CLEANUP=1 ./scripts/cleanup-local-runtime.sh`，并确认无 runtime 残留。

### Task 146 — V9 HN4-IMPL3 Back to Work runtime slice

Status: `accepted`.

Owner: GLM-style worker + Codex takeover.

Priority: Task145 已接受，Militia 已能从 Worker 变身并自动过期回 Worker。下一步只补 War3-like 的提前“返回工作”，让 Militia 不必等 45 秒；Defend 仍后置。

Prerequisite: `Task 145 — V9 HN4-IMPL2 Militia Call to Arms runtime slice` accepted.

Allowed files:

- `src/game/GameData.ts`
- `src/game/Game.ts`
- `tests/v9-hn4-back-to-work-runtime.spec.ts`
- `tests/v9-hn4-militia-data-seed.spec.mjs`
- `tests/v9-hn4-militia-defend-contract.spec.mjs`
- `docs/V9_HN4_MILITIA_DEFEND_CONTRACT.zh-CN.md`
- `docs/V9_HUMAN_NUMERIC_EXPANSION_PACKET.zh-CN.md`
- `docs/GLM_READY_TASK_QUEUE.md` only for closeout sync

Goal:

让已变身的 Militia 在命令卡里出现“返回工作”，点击后立即回到 Worker，恢复 Worker 数据和可采集状态。这个任务只完成 Back to Work，不实现 Defend，不改 AI。

Required implementation:

1. 在 `GameData.ts` 新增 `ABILITIES.back_to_work`，ownerType 为 `militia`，effectType 为 `morph`，morphTarget 为 `worker`，cooldown/cost/duration 为最小值。
2. 在 `Game.ts` 复用现有 revert 逻辑，新增公开或私有的最小入口，让命令卡点击可以让 Militia 立即回 Worker。
3. 选中 Militia 时显示“返回工作”按钮；选中 Worker、Footman、Priest、Mortar、建筑时不显示。
4. 点击“返回工作”后清掉 morph 状态，单位 type 回 `worker`，战斗/移动/采集属性从 `UNITS.worker` 恢复。
5. 更新旧静态 proof：允许 `back_to_work` 数据和 runtime 存在，但继续禁止 `defend` 数据和 runtime。
6. 更新 HN4 合同和 Human numeric expansion packet 的当前进展，只能写 Back to Work 完成，不得宣称 Defend 完成。

Forbidden:

- 不新增 `defend` ability seed、按钮或运行时。
- 不改 AI 策略，不让 AI 自动使用 Militia 或 Back to Work。
- 不导入新素材，不改 UnitVisualFactory / BuildingVisualFactory。
- 不新增 Castle、Knight、英雄、物品、第二阵营或完整科技树。
- 不把 Militia 加入任何训练队列。
- 不把“返回工作”做成资源返还、自动采集或复杂工单恢复；本任务只做立即回 Worker。

Must prove:

1. `ABILITIES.back_to_work` 存在，ownerType 为 `militia`，morphTarget 为 `worker`。
2. 选中 Militia 时命令卡显示“返回工作”，并且不显示 Defend。
3. 点击“返回工作”后，单位立即回 Worker，morph 状态清空，属性来自 `UNITS.worker`。
4. 自动过期回 Worker 仍然有效。
5. Worker 的“紧急动员”按钮和现有 Rally Call / Priest Heal / Mortar AOE 数据读取不被破坏。
6. `ABILITIES` 和 `Game.ts` 仍没有 Defend 实现。

Verification:

```bash
npm run build
npx tsc --noEmit -p tsconfig.app.json
./scripts/run-runtime-tests.sh tests/v9-hn4-back-to-work-runtime.spec.ts tests/v9-hn4-militia-call-to-arms-runtime.spec.ts --reporter=list
node --test tests/v9-hn4-militia-data-seed.spec.mjs tests/v9-hn4-militia-defend-contract.spec.mjs
FORCE_RUNTIME_CLEANUP=1 ./scripts/cleanup-local-runtime.sh
```

Closeout:

- GLM 完成初版 `ABILITIES.back_to_work`、按钮和 runtime proof，但旧 `Call to Arms` 回归仍期待“没有返回工作”，导致阶段迁移失败。
- GLM 初版按钮硬编码“返回工作”，没有从 `ABILITIES.back_to_work` 读取；Codex 接管后补 `backToWork()`，让命令卡 label、ownerType、morphTarget 走能力数据。
- Codex 修复 `lane-feed` 的 markerless progress 误判：终端已回到提示符时，不再把旧进展行当作“还在运行”。
- Codex 本地复核通过：`npm run build`、`npx tsc --noEmit -p tsconfig.app.json`、`./scripts/run-runtime-tests.sh tests/v9-hn4-back-to-work-runtime.spec.ts tests/v9-hn4-militia-call-to-arms-runtime.spec.ts --reporter=list` 12/12、`node --test tests/v9-hn4-militia-data-seed.spec.mjs tests/v9-hn4-militia-defend-contract.spec.mjs` 10/10、`node --test tests/lane-feed.spec.mjs` 50/50、`FORCE_RUNTIME_CLEANUP=1 ./scripts/cleanup-local-runtime.sh`，并确认无 runtime 残留。

### Task 147 — V9 HN4-DATA4 Defend ability data seed

Status: `accepted`.

Owner: GLM-style worker + Codex takeover.

Priority: Task146 已接受，Militia / Call to Arms / Back to Work 最小链路已成立。下一步只能先给 Footman Defend 建数据种子，不直接做 runtime toggle。

Prerequisite: `Task 146 — V9 HN4-IMPL3 Back to Work runtime slice` accepted.

Allowed files:

- `src/game/GameData.ts`
- `tests/v9-hn4-defend-data-seed.spec.mjs`
- `tests/v9-hn4-militia-defend-contract.spec.mjs`
- `docs/V9_HN4_MILITIA_DEFEND_CONTRACT.zh-CN.md`
- `docs/V9_HUMAN_NUMERIC_EXPANSION_PACKET.zh-CN.md`
- `docs/GLM_READY_TASK_QUEUE.md` only for closeout sync

Goal:

新增 Footman Defend 的最小 ability 数据种子，让下一张 runtime 任务有统一数据入口。这个任务只定义数据和静态 proof，不让玩家点击 Defend，不改伤害结算。

Required implementation:

1. 在 `AbilityDef` 中补最小可表达 Defend 的可选字段，例如 `affectedAttackType`、`damageReduction`、`speedMultiplier` 或等价字段。
2. 在 `ABILITIES` 新增 `defend`，ownerType 必须是 `footman`，targetRule 必须是 self / alive，effectType 必须表达 toggle 或 defensive buff 语义。
3. Defend 数据必须表达：针对 `AttackType.Piercing` 的减伤、移动速度惩罚、无资源/魔法消耗、无持续时间。
4. 新增静态 proof，证明 `ABILITIES.defend` 数据存在且字段来自集中数据，而 `Game.ts` 仍未读取或实现 Defend runtime。
5. 更新 HN4 合同和 Human numeric expansion packet，只能写 Defend 数据种子完成，不得宣称命令卡、toggle、伤害结算或 AI 已完成。

Forbidden:

- 不改 `src/game/Game.ts`。
- 不新增 Defend 命令卡按钮。
- 不新增 Footman defend 状态字段、toggle 逻辑、速度变化或伤害减免运行时。
- 不改 AI 策略，不让 AI 使用 Defend。
- 不导入新素材，不改视觉工厂。
- 不新增英雄、物品、第二阵营、Knight、Castle 或完整科技树。

Must prove:

1. `ABILITIES.defend` 存在，ownerType 为 `footman`。
2. Defend 数据能表达 Piercing 减伤和移动速度惩罚。
3. `Game.ts` 不包含 `ABILITIES.defend`、`defend` runtime 分支或“防御姿态”命令卡按钮。
4. Militia / Back to Work / Call to Arms 现有数据和 proof 不被破坏。

Verification:

```bash
npm run build
npx tsc --noEmit -p tsconfig.app.json
node --test tests/v9-hn4-defend-data-seed.spec.mjs tests/v9-hn4-militia-data-seed.spec.mjs tests/v9-hn4-militia-defend-contract.spec.mjs
FORCE_RUNTIME_CLEANUP=1 ./scripts/cleanup-local-runtime.sh
```

Closeout:

- GLM 写入初版 `ABILITIES.defend` 后停在提示符，未创建 proof 或 closeout。
- Codex 接管后把 `affectedAttackType` 改成 `AttackType.Piercing` 类型化字段，补 `tests/v9-hn4-defend-data-seed.spec.mjs`，并迁移旧 HN4 proof：Defend 数据 seed 已允许，但 `Game.ts` runtime 仍禁止。
- Codex 本地复核通过：`npm run build`、`npx tsc --noEmit -p tsconfig.app.json`、`node --test tests/v9-hn4-defend-data-seed.spec.mjs tests/v9-hn4-militia-data-seed.spec.mjs tests/v9-hn4-militia-defend-contract.spec.mjs` 15/15、`FORCE_RUNTIME_CLEANUP=1 ./scripts/cleanup-local-runtime.sh`，并确认无 runtime 残留。

### Task 148 — V9 HN4-IMPL5 Defend runtime slice

Status: `accepted`.

Owner: GLM-style worker + Codex review.

Priority: Task147 已接受，`ABILITIES.defend` 已能表达 Footman 的穿刺减伤和移速惩罚。下一步只把这一个数据种子接进最小 runtime，不扩到 AI 或素材。

Prerequisite: `Task 147 — V9 HN4-DATA4 Defend ability data seed` accepted.

Allowed files:

- `src/game/Game.ts`
- `tests/v9-hn4-defend-runtime.spec.ts`
- `tests/v9-hn4-defend-data-seed.spec.mjs`
- `docs/V9_HN4_MILITIA_DEFEND_CONTRACT.zh-CN.md`
- `docs/V9_HUMAN_NUMERIC_EXPANSION_PACKET.zh-CN.md`
- `docs/GLM_READY_TASK_QUEUE.md` only for closeout sync

Goal:

让玩家选中 Footman 时能切换“防御姿态”：开启后只减少穿刺攻击伤害，并降低移动速度；再次点击关闭。这个任务只做 Footman Defend 最小 runtime，不改 AI、不改素材、不新增科技。

Required implementation:

1. 在 `Unit` runtime 状态中新增最小 Defend 状态字段，并在 `spawnUnit()` 初始化。
2. 选中 Footman 时命令卡显示“防御姿态”按钮，按钮文案 / 数值读取 `ABILITIES.defend`。
3. 点击按钮切换 Defend 状态；开启时速度 = `UNITS.footman.speed * ABILITIES.defend.speedMultiplier`，关闭时恢复 `UNITS.footman.speed`。
4. `dealDamage()` 只在目标处于 Defend 且攻击类型为 `ABILITIES.defend.affectedAttackType` 时套用 `damageReduction`。
5. 不影响 Normal / Siege 攻击、不影响非 Footman、不影响 Militia / Back to Work / Rally Call / Priest Heal / Mortar AOE。

Forbidden:

- 不改 `src/game/SimpleAI.ts`。
- 不导入新素材，不改视觉工厂。
- 不新增科技、研究、训练队列或 AI 使用 Defend。
- 不把 Defend 做成完整 War3 技能树、动画、图标或音效。
- 不改 `GameData.ts`，除非静态 proof 暴露 Task147 数据 seed 的明显拼写错误。

Must prove:

1. Footman 命令卡显示“防御姿态”并可切换开 / 关。
2. 开启 Defend 后 Footman 速度降低，关闭后恢复。
3. 开启 Defend 后 Piercing 攻击伤害降低。
4. Normal / Siege 攻击不因 Defend 获得同样减伤。
5. 非 Footman 不显示 Defend。
6. Militia / Back to Work / Call to Arms 现有 HN4 proof 不被破坏。

Verification:

```bash
npm run build
npx tsc --noEmit -p tsconfig.app.json
./scripts/run-runtime-tests.sh tests/v9-hn4-defend-runtime.spec.ts tests/v9-hn4-back-to-work-runtime.spec.ts tests/v9-hn4-militia-call-to-arms-runtime.spec.ts --reporter=list
node --test tests/v9-hn4-defend-data-seed.spec.mjs tests/v9-hn4-militia-data-seed.spec.mjs tests/v9-hn4-militia-defend-contract.spec.mjs
FORCE_RUNTIME_CLEANUP=1 ./scripts/cleanup-local-runtime.sh
```

Closeout:

- GLM 完成 `defendActive` 状态、Footman 命令卡按钮、速度 toggle、`dealDamage()` Piercing 减伤和 HN4 runtime proof，并修正 proof 中同一对象被 Back to Work 原地改回 Worker 后读取类型的 stale-reference 问题。
- Codex 复核时同步迁移旧 Back to Work / Militia 静态 proof：Task148 之后 `Game.ts` 应读取 `ABILITIES.defend`，不能再断言 Defend runtime 缺席。
- 验证通过：`npm run build`、`npx tsc --noEmit -p tsconfig.app.json`、`./scripts/run-runtime-tests.sh tests/v9-hn4-defend-runtime.spec.ts tests/v9-hn4-back-to-work-runtime.spec.ts tests/v9-hn4-militia-call-to-arms-runtime.spec.ts --reporter=list` 18/18、`node --test tests/v9-hn4-defend-data-seed.spec.mjs tests/v9-hn4-militia-data-seed.spec.mjs tests/v9-hn4-militia-defend-contract.spec.mjs` 15/15、cleanup 和无残留检查通过。

### Task 149 — V9 HN4-CLOSE6 Militia / Back to Work / Defend closure inventory

Status: `accepted`.

Owner: GLM-style worker.

Priority: Task148 已接受，HN4 的 Militia / Back to Work / Defend 最小链路已经都有数据、runtime 和 proof。下一步先做收口盘点，避免直接开 Sorceress、Knight、Hero 或素材时再次缺阶段边界。

Prerequisite: `Task 148 — V9 HN4-IMPL5 Defend runtime slice` accepted.

Allowed files:

- `docs/V9_HN4_MILITIA_DEFEND_CONTRACT.zh-CN.md`
- `docs/V9_HUMAN_NUMERIC_EXPANSION_PACKET.zh-CN.md`
- `docs/V9_MAINTENANCE_EXPANSION_EVIDENCE_LEDGER.zh-CN.md`
- `tests/v9-hn4-closure-inventory.spec.mjs`
- `docs/GLM_READY_TASK_QUEUE.md` only for closeout sync

Goal:

把 HN4 第一分支从“还在实现”收成一份可检查库存：Militia、Back to Work、Defend 哪些数据、运行时、命令卡、回归证明已完成，哪些不承诺；并给出下一条 Human 相邻分支候选，不直接实现它。

Required output:

1. 更新 HN4 合同的当前进展和结论，明确最小 HN4 分支完成。
2. 更新 Human numeric expansion packet，说明下一步要先选下一条 Human 分支，而不是继续 HN4 内无限补任务。
3. 新增静态 proof，读取文档和 `GameData.ts` / `Game.ts`，证明 Militia、Back to Work、Defend 三条最小链路都有数据和 runtime 入口。
4. proof 必须同时证明没有把 AI Defend、素材、英雄、物品、完整 Sorceress/Knight 写成已完成。
5. 在文档里列出下一条相邻分支候选，但不得派生成实现任务。

Forbidden:

- 不改 `src/game/Game.ts`、`src/game/GameData.ts`、`src/game/SimpleAI.ts`。
- 不新增单位、建筑、科技、AI 策略、素材或 UI。
- 不把 HN4 closure 写成完整 Human 完成。
- 不把下一分支直接标成 accepted 或 in_progress。

Verification:

```bash
npm run build
npx tsc --noEmit -p tsconfig.app.json
node --test tests/v9-hn4-closure-inventory.spec.mjs tests/v9-hn4-defend-data-seed.spec.mjs tests/v9-hn4-militia-defend-contract.spec.mjs
FORCE_RUNTIME_CLEANUP=1 ./scripts/cleanup-local-runtime.sh
```

Closeout requirements:
- Start your final closeout with the exact line: JOB_COMPLETE: <job-id>
- If truly blocked, emit the exact line: JOB_BLOCKED: <job-id>
- Include sections for files changed, verification run, and remaining unknowns.
- End with an exact line that begins with READY_FOR_NEXT_TASK: followed by the next safe continuation.
- Keep the work within the requested scope; do not widen ownership on your own.

Closeout:

- GLM 完成 HN4 closure inventory 文档和 `tests/v9-hn4-closure-inventory.spec.mjs`，证明 Call to Arms、Back to Work、Defend 三条最小链路都有数据、runtime 和命令卡入口，并且没有误宣称 AI Defend、素材、英雄、物品、Sorceress 或 Knight。
- GLM 在更新 `docs/GLM_READY_TASK_QUEUE.md` 时再次遇到编辑失败并停在提示符；Codex 接管队列收口。
- Codex 本地复核通过：`node --test tests/v9-hn4-closure-inventory.spec.mjs tests/v9-hn4-defend-data-seed.spec.mjs tests/v9-hn4-militia-defend-contract.spec.mjs` 16/16、`npm run build`、`npx tsc --noEmit -p tsconfig.app.json`、cleanup 和无残留检查通过。

### Task 150 — V9 HN5-PLAN1 Sorceress / Slow branch contract

Status: `accepted`.

Owner: GLM-style worker.

Priority: HN4 第一分支已收口。下一条 Human 相邻分支选择 Sorceress / Slow，因为它复用已存在的 Arcane Sanctum、Priest mana、target rule 和 `ABILITIES` 数据模型，比 Castle / Knight / Hero / item 更适合先做合同。

Prerequisite: `Task 149 — V9 HN4-CLOSE6 Militia / Back to Work / Defend closure inventory` accepted.

Allowed files:

- `docs/V9_HN5_SORCERESS_SLOW_CONTRACT.zh-CN.md`
- `docs/V9_HUMAN_NUMERIC_EXPANSION_PACKET.zh-CN.md`
- `tests/v9-hn5-sorceress-slow-contract.spec.mjs`
- `docs/GLM_READY_TASK_QUEUE.md` only for closeout sync

Goal:

定义下一条 Human 分支合同：Sorceress 和 Slow 如何进入当前项目。只写目标、当前缺口、最小数据字段、runtime proof 序列、禁区和下一张可执行任务边界；不写运行时代码，不新增数据种子。

Required output:

1. 新增 HN5 合同文档，说明为什么 Sorceress / Slow 是 HN4 后的相邻分支。
2. 文档必须区分：Sorceress 单位数据、Slow ability 数据、mana/cooldown/range/target/duration/effect、命令卡、runtime、AI 使用、HUD 可见提示，哪些先做、哪些后置。
3. 必须写明第一张实现任务只能是 `HN5-DATA1 Sorceress + Slow data seed` 或更小，不得直接写 runtime。
4. 新增静态 proof，证明合同存在、字段和 proof 序列完整，并且没有要求实现英雄、物品、Spell Breaker、完整 buff/debuff 系统、AI 使用或素材。
5. 更新 Human numeric expansion packet 的当前进展，只能写“下一分支合同准备中 / 已定义”，不得宣称 Sorceress 已实现。

Forbidden:

- 不改 `src/game/Game.ts`、`src/game/GameData.ts`、`src/game/SimpleAI.ts`。
- 不新增 `UNITS.sorceress` 或 `ABILITIES.slow`。
- 不实现 Slow runtime、buff/debuff tick、AI 使用、视觉、音效、图标或素材。
- 不把 HN5 写成完整 Arcane Sanctum / caster tech tree。

Verification:

```bash
npm run build
npx tsc --noEmit -p tsconfig.app.json
node --test tests/v9-hn5-sorceress-slow-contract.spec.mjs tests/v9-hn4-closure-inventory.spec.mjs
FORCE_RUNTIME_CLEANUP=1 ./scripts/cleanup-local-runtime.sh
```

Closeout requirements:
- Start your final closeout with the exact line: JOB_COMPLETE: <job-id>
- If truly blocked, emit the exact line: JOB_BLOCKED: <job-id>
- Include sections for files changed, verification run, and remaining unknowns.
- End with an exact line that begins with READY_FOR_NEXT_TASK: followed by the next safe continuation.
- Keep the work within the requested scope; do not widen ownership on your own.

Closeout:

- GLM 完成 `docs/V9_HN5_SORCERESS_SLOW_CONTRACT.zh-CN.md`、`tests/v9-hn5-sorceress-slow-contract.spec.mjs` 和 Human expansion packet 更新。
- Codex 复核时发现合同把 Sorceress 写成“无普通攻击”，已修正为弱远程 Magic 攻击 + Slow 核心身份，并补强 proof。
- Codex 本地复核通过：`node --test tests/v9-hn5-sorceress-slow-contract.spec.mjs tests/v9-hn4-closure-inventory.spec.mjs` 11/11、`npm run build`、`npx tsc --noEmit -p tsconfig.app.json`、cleanup 和无残留检查通过。

### Task 151 — V9 HN5-DATA1 Sorceress + Slow data seed

Status: `accepted`.

Owner: GLM-style worker.

Priority: Task150 已接受，HN5 合同已定义。下一步只能先落数据种子，给 Sorceress / Slow 建统一数据入口；仍不能把新单位接进训练面或 runtime。

Prerequisite: `Task 150 — V9 HN5-PLAN1 Sorceress / Slow branch contract` accepted.

Allowed files:

- `src/game/GameData.ts`
- `docs/V9_HN5_SORCERESS_SLOW_CONTRACT.zh-CN.md`
- `docs/V9_HUMAN_NUMERIC_EXPANSION_PACKET.zh-CN.md`
- `tests/v9-hn5-sorceress-slow-data-seed.spec.mjs`
- `docs/GLM_READY_TASK_QUEUE.md` only for closeout sync

Goal:

新增 HN5 的最小数据种子：`UNITS.sorceress` 和 `ABILITIES.slow`。这只建立数据入口，不让玩家实际训练 Sorceress，不改命令卡，不改伤害 / debuff runtime，不改 AI。

Required implementation:

1. 在 `UNITS` 中新增 `sorceress`，字段从 HN5 合同读取：成本、训练时间、HP、人口、弱远程 Magic 攻击、Unarmored、mana 能力所需基础数值。
2. 在 `ABILITIES` 中新增 `slow`，字段从 HN5 合同读取：ownerType `sorceress`、mana cost、range、targetRule enemy/alive、duration、stackingRule `refresh`、effectType `speedDebuff`、speedMultiplier。
3. 如 `AbilityDef` 缺少表达 Slow 的必要可选字段，可以只扩展最小字段；不得添加通用 buff/debuff runtime。
4. 新增静态 proof，证明数据种子存在，且 `Game.ts` 未读取 Sorceress / Slow，`BUILDINGS.arcane_sanctum.trains` 仍未加入 `sorceress`。
5. 更新 HN5 合同和 expansion packet 的当前进展，只能写数据种子完成，不得宣称训练、命令卡、施法或 AI 已完成。

Forbidden:

- 不改 `src/game/Game.ts`、`src/game/SimpleAI.ts`、视觉工厂或素材目录。
- 不把 `sorceress` 加入 `BUILDINGS.arcane_sanctum.trains`。
- 不新增 Slow runtime、debuff tick、速度恢复逻辑、命令卡按钮、auto-cast 或 AI 使用。
- 不新增 Spell Breaker、Invisibility、Polymorph、英雄、物品、商店或完整 caster tech tree。

Verification:

```bash
npm run build
npx tsc --noEmit -p tsconfig.app.json
node --test tests/v9-hn5-sorceress-slow-data-seed.spec.mjs tests/v9-hn5-sorceress-slow-contract.spec.mjs
FORCE_RUNTIME_CLEANUP=1 ./scripts/cleanup-local-runtime.sh
```

Closeout requirements:
- Start your final closeout with the exact line: JOB_COMPLETE: <job-id>
- If truly blocked, emit the exact line: JOB_BLOCKED: <job-id>
- Include sections for files changed, verification run, and remaining unknowns.
- End with an exact line that begins with READY_FOR_NEXT_TASK: followed by the next safe continuation.
- Keep the work within the requested scope; do not widen ownership on your own.

Closeout:

- GLM 写入 `AttackType.Magic`、`UNITS.sorceress` 和 `ABILITIES.slow` 后停在提示符，只跑了 typecheck。
- Codex 接管后补齐 Magic 攻击类型显示名、Magic 临时倍率表占位和 `tests/v9-hn5-sorceress-slow-data-seed.spec.mjs`。
- Codex 本地复核通过：`node --test tests/v9-hn5-sorceress-slow-data-seed.spec.mjs tests/v9-hn5-sorceress-slow-contract.spec.mjs` 10/10、`npm run build`、`npx tsc --noEmit -p tsconfig.app.json`、cleanup 和无残留检查通过。

### Task 152 — V9 HN5-IMPL2 Sorceress training surface

Status: `accepted`.

Owner: GLM-style worker.

Priority: Task151 已接受，Sorceress / Slow 数据入口存在。下一步只能让 Arcane Sanctum 通过现有训练队列训练 Sorceress，并显示基础数值；Slow runtime 仍后置。

Prerequisite: `Task 151 — V9 HN5-DATA1 Sorceress + Slow data seed` accepted.

Allowed files:

- `src/game/GameData.ts`
- `src/game/Game.ts`
- `src/game/UnitVisualFactory.ts`
- `tests/v9-hn5-sorceress-training-surface.spec.ts`
- `tests/v9-hn5-sorceress-slow-data-seed.spec.mjs`
- `docs/V9_HN5_SORCERESS_SLOW_CONTRACT.zh-CN.md`
- `docs/V9_HUMAN_NUMERIC_EXPANSION_PACKET.zh-CN.md`
- `docs/GLM_READY_TASK_QUEUE.md` only for closeout sync

Goal:

让已有 Arcane Sanctum 训练队列可以训练 Sorceress，并在命令卡 / 单位状态中显示基础攻击、护甲、Magic 类型和人口成本。这个任务只接训练面，不实现 Slow 按钮、施法、debuff、auto-cast 或 AI。

Required implementation:

1. 将 `sorceress` 加入 `BUILDINGS.arcane_sanctum.trains`。
2. 保持 `techPrereq: 'arcane_sanctum'` 和 Keep → Arcane Sanctum 既有前置链不回退。
3. 新增 focused runtime proof：建成/放置 Arcane Sanctum 后命令卡出现 Sorceress，点击后通过现有训练队列产出 Sorceress。
4. proof 必须验证 Sorceress 基础字段来自 `UNITS.sorceress`：成本、人口、HP、Magic 攻击显示名、Unarmored。
5. 静态 proof 必须继续证明 `ABILITIES.slow` 只存在于数据中，`Game.ts` 无 Slow runtime。

Forbidden:

- 不实现 Slow runtime、命令卡按钮、debuff、auto-cast、AI 使用或素材。
- 不新增 Spell Breaker、Invisibility、Polymorph、英雄、物品或完整 caster tech tree。
- 不修改 `src/game/SimpleAI.ts`。

Verification:

```bash
npm run build
npx tsc --noEmit -p tsconfig.app.json
./scripts/run-runtime-tests.sh tests/v9-hn5-sorceress-training-surface.spec.ts --reporter=list
node --test tests/v9-hn5-sorceress-slow-data-seed.spec.mjs tests/v9-hn5-sorceress-slow-contract.spec.mjs
FORCE_RUNTIME_CLEANUP=1 ./scripts/cleanup-local-runtime.sh
```

Closeout requirements:
- Start your final closeout with the exact line: JOB_COMPLETE: <job-id>
- If truly blocked, emit the exact line: JOB_BLOCKED: <job-id>
- Include sections for files changed, verification run, and remaining unknowns.
- End with an exact line that begins with READY_FOR_NEXT_TASK: followed by the next safe continuation.
- Keep the work within the requested scope; do not widen ownership on your own.

Closeout:

- GLM 只把 `sorceress` 加进 `BUILDINGS.arcane_sanctum.trains` 后停在提示符，未补 runtime proof。
- Codex 接管补 `tests/v9-hn5-sorceress-training-surface.spec.ts`，证明 Arcane Sanctum 命令卡出现“女巫”、点击后进入正常训练队列并完成产出。
- Codex 同步迁移 HN4/HN5 旧阶段 proof：现在允许 Sorceress 训练面存在，但仍禁止 `ABILITIES.slow` / `speedDebuff` runtime。
- Codex 补 `Game.ts` 选择面板从 `GameData` 读取女巫中文名，新增女巫类型标签和 portrait；`UnitVisualFactory.ts` 新增女巫 proxy，避免训练出的单位落到通用灰柱。
- Codex 本地复核通过：`npm run build`、`npx tsc --noEmit -p tsconfig.app.json`、`./scripts/run-runtime-tests.sh tests/v9-hn5-sorceress-training-surface.spec.ts --reporter=list` 2/2、`node --test tests/v9-hn4-closure-inventory.spec.mjs tests/v9-hn5-sorceress-slow-contract.spec.mjs tests/v9-hn5-sorceress-slow-data-seed.spec.mjs` 16/16。
- 剩余未知：Sorceress 仍无 mana 初始化，Slow 仍只是数据种子；下一张必须先接 mana 面，再做 Slow runtime。

### Task 153 — V9 HN5-IMPL3 Sorceress mana initialization surface

Status: `accepted`.

Owner: GLM-style worker.

Priority: Task152 已接受，Sorceress 可以从 Arcane Sanctum 训练出来，但当前 `spawnUnit` 仍只给 Priest 初始化 mana。Slow runtime 不能建立在没有 mana 的 Sorceress 上。

Prerequisite: `Task 152 — V9 HN5-IMPL2 Sorceress training surface` accepted.

Allowed files:

- `src/game/GameData.ts`
- `src/game/Game.ts`
- `tests/v9-hn5-sorceress-mana-surface.spec.ts`
- `tests/v9-hn5-sorceress-training-surface.spec.ts`
- `docs/V9_HN5_SORCERESS_SLOW_CONTRACT.zh-CN.md`
- `docs/V9_HUMAN_NUMERIC_EXPANSION_PACKET.zh-CN.md`
- `docs/GLM_READY_TASK_QUEUE.md` only for closeout sync

Goal:

给 Sorceress 建立真实 mana 初始化和可见 mana 面，让训练出的女巫拥有可复跑的 caster resource。这个任务只补 mana，不实现 Slow 按钮、施法、debuff、auto-cast 或 AI。

Required implementation:

1. 在 `UnitDef` 中新增最小可选 caster 字段，例如 `maxMana?: number`、`manaRegen?: number`。
2. 让 `UNITS.priest` 和 `UNITS.sorceress` 都从数据声明 mana / manaRegen；不要继续把 `spawnUnit` 写死成 `type === 'priest'`。
3. `spawnUnit` 初始化 `mana`、`maxMana`、`manaRegen` 时读取 `UNITS[type]` 的 caster 字段；非 caster 仍为 0。
4. 新增 focused runtime proof：训练或 spawn 出 Sorceress 后，选择面板显示 `💧 current/max`，且 mana 随时间回复不超过 max。
5. 保持 Priest Heal 既有行为不回退；至少证明 Priest 仍有 mana 和 Heal 按钮。
6. 静态 proof 或 runtime proof 必须继续证明 `Game.ts` 仍未读取 `ABILITIES.slow`，没有 Slow 按钮或 debuff runtime。

Forbidden:

- 不实现 Slow runtime、命令卡按钮、debuff、auto-cast、AI 使用或素材。
- 不新增 Spell Breaker、Invisibility、Polymorph、英雄、物品、商店或完整 caster tech tree。
- 不修改 `src/game/SimpleAI.ts`。
- 不把 caster mana 做成和某一个单位名强绑定的新 if 链。

Verification:

```bash
npm run build
npx tsc --noEmit -p tsconfig.app.json
./scripts/run-runtime-tests.sh tests/v9-hn5-sorceress-mana-surface.spec.ts tests/v9-hn5-sorceress-training-surface.spec.ts --reporter=list
node --test tests/v9-hn5-sorceress-slow-data-seed.spec.mjs tests/v9-hn5-sorceress-slow-contract.spec.mjs
FORCE_RUNTIME_CLEANUP=1 ./scripts/cleanup-local-runtime.sh
```

Closeout requirements:
- Start your final closeout with the exact line: JOB_COMPLETE: <job-id>
- If truly blocked, emit the exact line: JOB_BLOCKED: <job-id>
- Include sections for files changed, verification run, and remaining unknowns.
- End with an exact line that begins with READY_FOR_NEXT_TASK: followed by the next safe continuation.
- Keep the work within the requested scope; do not widen ownership on your own.

Closeout:

- GLM 写入 `UnitDef.maxMana` / `manaRegen`、`UNITS.priest` / `UNITS.sorceress` mana 字段，并把 `spawnUnit` 从 Priest-only if 改成读取 `UNITS[type]` 后停在提示符。
- Codex 接管补 `tests/v9-hn5-sorceress-mana-surface.spec.ts`。
- 证明 Sorceress 选择面板显示 mana，`updateCasterAbilities` 会按 `UNITS.sorceress.manaRegen` 回复且不超过上限；Priest 仍有 mana 和 Heal 按钮。
- 证明 `Game.ts` 仍未读取 `ABILITIES.slow`，没有 Slow 按钮或 `speedDebuff` runtime。
- Codex 本地复核通过：`npm run build`、`npx tsc --noEmit -p tsconfig.app.json`、`./scripts/run-runtime-tests.sh tests/v9-hn5-sorceress-mana-surface.spec.ts tests/v9-hn5-sorceress-training-surface.spec.ts --reporter=list` 5/5、`node --test tests/v9-hn5-sorceress-slow-data-seed.spec.mjs tests/v9-hn5-sorceress-slow-contract.spec.mjs tests/v9-hn4-closure-inventory.spec.mjs` 16/16。
- 剩余未知：Slow 仍只是数据种子；下一张只能接手动 Slow runtime，不做 auto-cast、攻击速度减益、AI 或素材。

### Task 154 — V9 HN5-IMPL4 Slow runtime minimal slice

Status: `accepted`.

Owner: GLM-style worker.

Priority: Task153 已接受，Sorceress 现在有真实 mana 和可见 mana 面。下一步可以接 Slow 的最小手动 runtime，但不能一次做完整 buff/debuff 系统。

Prerequisite: `Task 153 — V9 HN5-IMPL3 Sorceress mana initialization surface` accepted.

Allowed files:

- `src/game/Game.ts`
- `tests/v9-hn5-slow-runtime-minimal.spec.ts`
- `tests/v9-hn5-sorceress-mana-surface.spec.ts`
- `docs/V9_HN5_SORCERESS_SLOW_CONTRACT.zh-CN.md`
- `docs/V9_HUMAN_NUMERIC_EXPANSION_PACKET.zh-CN.md`
- `docs/GLM_READY_TASK_QUEUE.md` only for closeout sync

Goal:

实现 Slow 的最小手动 runtime：选中 Sorceress 时出现“减速”按钮，消耗 mana，对范围内最近敌方非建筑单位施加移动速度减益，持续时间结束后恢复。这个任务只证明一个 debuff 切片，不抽完整 buff/debuff 框架。

Required implementation:

1. 给 `Unit` 增加最小 Slow 状态字段，例如 `slowUntil`、`slowSpeedMultiplier`；非 Slow 单位默认无效果。
2. `updateUnitMovement` 或等价速度读取路径必须在 Slow 生效期间用 `ABILITIES.slow.speedMultiplier` 修正移动速度；过期后自动恢复原速度。
3. 新增 `castSlow(sorceress, target)` 或等价方法：只允许 Sorceress，对敌方、存活、非建筑、范围内目标施放；mana 不足时失败；成功后扣 `ABILITIES.slow.cost.mana`。
4. 命令卡对 Sorceress 显示 `ABILITIES.slow.name`，mana 不足时 disabled，按钮文案至少能看到 mana cost / 持续时间 / 减速倍率中的两个。
5. 手动按钮点击只找范围内最近敌方非建筑单位；没有合法目标时不扣 mana。
6. Runtime proof 必须覆盖：成功施放、mana 扣除、目标速度变慢、持续时间刷新/过期恢复、mana 不足禁用、非 Sorceress 不显示 Slow。
7. 继续证明 Priest Heal、Sorceress training surface 和 Sorceress mana surface 不回退。

Forbidden:

- 不做 auto-cast、攻击速度减益、完整 buff/debuff 框架、状态图标、AI 使用或素材。
- 不新增 Spell Breaker、Invisibility、Polymorph、英雄、物品、商店或完整 caster tech tree。
- 不修改 `src/game/SimpleAI.ts`。
- 不把 Slow 写成硬编码常量；必须读取 `ABILITIES.slow`。

Verification:

```bash
npm run build
npx tsc --noEmit -p tsconfig.app.json
./scripts/run-runtime-tests.sh tests/v9-hn5-slow-runtime-minimal.spec.ts tests/v9-hn5-sorceress-mana-surface.spec.ts tests/v9-hn5-sorceress-training-surface.spec.ts --reporter=list
node --test tests/v9-hn5-sorceress-slow-data-seed.spec.mjs tests/v9-hn5-sorceress-slow-contract.spec.mjs
FORCE_RUNTIME_CLEANUP=1 ./scripts/cleanup-local-runtime.sh
```

Closeout requirements:
- Start your final closeout with the exact line: JOB_COMPLETE: <job-id>
- If truly blocked, emit the exact line: JOB_BLOCKED: <job-id>
- Include sections for files changed, verification run, and remaining unknowns.
- End with an exact line that begins with READY_FOR_NEXT_TASK: followed by the next safe continuation.
- Keep the work within the requested scope; do not widen ownership on your own.

Closeout:

- GLM 写入初版 `castSlow`、`slowUntil`、命令卡按钮和过期清理，但直接修改 `unit.speed`，且未补完整 proof。
- Codex 接管后改为 `slowSpeedMultiplier` + `getEffectiveMovementSpeed`：Slow 生效时移动路径临时套倍率，基础 `unit.speed` 仍由 Defend / Militia 等系统拥有，过期只清状态。
- 命令卡读取 `ABILITIES.slow.name` / mana / duration / speedMultiplier，mana 不足 disabled；点击时寻找最近敌方非建筑单位，无目标不扣 mana。
- 新增 `tests/v9-hn5-slow-runtime-minimal.spec.ts`，覆盖成功施放、扣 mana、移动变慢、刷新持续时间、过期恢复、mana 不足禁用、无目标不扣 mana、最近敌人选择、非 Sorceress 不显示 Slow。
- 迁移 HN4/HN5 静态 proof 和 Sorceress training / mana runtime proof：当前阶段允许手动 Slow runtime，但仍禁止 auto-cast、攻击速度减益、AI、素材和完整 buff/debuff 框架。
- Codex 本地复核通过：`npm run build`、`npx tsc --noEmit -p tsconfig.app.json`、`./scripts/run-runtime-tests.sh tests/v9-hn5-slow-runtime-minimal.spec.ts tests/v9-hn5-sorceress-mana-surface.spec.ts tests/v9-hn5-sorceress-training-surface.spec.ts --reporter=list` 9/9、`node --test tests/v9-hn5-sorceress-slow-data-seed.spec.mjs tests/v9-hn5-sorceress-slow-contract.spec.mjs tests/v9-hn4-closure-inventory.spec.mjs` 16/16。
- 剩余未知：Slow 还没有 auto-cast 开关；下一张只能接最小自动施法 toggle，不接 AI、攻击速度减益、状态图标、素材或其他女巫技能。

### Task 155 — V9 HN5-IMPL5 Slow auto-cast minimal toggle

Status: `accepted`.

Owner: GLM-style worker + Codex takeover.

Priority: Task154 已接受，Sorceress 有手动 Slow runtime。War3-like 的女巫需要可关闭的自动施法，但必须避免每帧重复施法和重复耗蓝。

Prerequisite: `Task 154 — V9 HN5-IMPL4 Slow runtime minimal slice` accepted.

Allowed files:

- `src/game/Game.ts`
- `tests/v9-hn5-slow-autocast-minimal.spec.ts`
- `tests/v9-hn5-slow-runtime-minimal.spec.ts`
- `docs/V9_HN5_SORCERESS_SLOW_CONTRACT.zh-CN.md`
- `docs/V9_HUMAN_NUMERIC_EXPANSION_PACKET.zh-CN.md`
- `docs/GLM_READY_TASK_QUEUE.md` only for closeout sync

Goal:

给 Sorceress 增加 Slow 自动施法开关。默认可开启或关闭必须在测试中写清楚；自动施法只能对范围内未被 Slow 影响、或即将过期的敌方非建筑单位施放，不能在目标已经 Slow 时每帧重复扣 mana。

Required implementation:

1. 给 `Unit` 增加最小 auto-cast 状态，例如 `slowAutoCastEnabled` 和必要的 `slowAutoCastCooldownUntil`。
2. Sorceress 命令卡显示自动施法 toggle，文案必须能区分开启 / 关闭状态。
3. auto-cast 只复用 `castSlow` 和 `ABILITIES.slow` 数据；不得复制一套独立 Slow 常量。
4. 自动施法目标只能是敌方、存活、非建筑、范围内，且优先选择未被 Slow 或 Slow 即将过期的目标。
5. mana 不足时不得施放；目标已被 Slow 且剩余时间充足时不得重复扣 mana。
6. Runtime proof 覆盖：toggle 显示和切换、开启后自动施放、关闭后不自动施放、不会对已 Slow 目标重复耗蓝、mana 不足不施放、手动 Slow 行为不回退。

Forbidden:

- 不做 AI 使用 Slow。
- 不做攻击速度减益、完整 buff/debuff 框架、状态图标、视觉/音效/素材。
- 不新增 Spell Breaker、Invisibility、Polymorph、英雄、物品、商店或完整 caster tech tree。
- 不修改 `src/game/SimpleAI.ts`。

Verification:

```bash
npm run build
npx tsc --noEmit -p tsconfig.app.json
./scripts/run-runtime-tests.sh tests/v9-hn5-slow-autocast-minimal.spec.ts tests/v9-hn5-slow-runtime-minimal.spec.ts --reporter=list
node --test tests/v9-hn5-sorceress-slow-data-seed.spec.mjs tests/v9-hn5-sorceress-slow-contract.spec.mjs tests/v9-hn4-closure-inventory.spec.mjs
FORCE_RUNTIME_CLEANUP=1 ./scripts/cleanup-local-runtime.sh
```

Closeout requirements:
- Start your final closeout with the exact line: JOB_COMPLETE: <job-id>
- If truly blocked, emit the exact line: JOB_BLOCKED: <job-id>
- Include sections for files changed, verification run, and remaining unknowns.
- End with an exact line that begins with READY_FOR_NEXT_TASK: followed by the next safe continuation.
- Keep the work within the requested scope; do not widen ownership on your own.

Closeout:

- GLM 写入 auto-cast 半成品后反复运行 tail / grep 型 runtime；Codex 中断重复运行并接管收口。
- `Game.ts` 现在有 `slowAutoCastEnabled`、`slowAutoCastCooldownUntil` 和 `findSlowAutoTarget`，自动施法复用 `castSlow` 与 `ABILITIES.slow`。
- Sorceress 命令卡显示“减速 (自动)”开关，开启后显示“减速 (自动) ✓”；默认不开启，玩家可切换。
- 自动施法只找范围内敌方、存活、非建筑单位；目标已被 Slow 且剩余时间充足时不重复扣 mana，接近过期时允许刷新。
- mana 不足、开关关闭、没有合法目标时不施放；`SimpleAI.ts` 仍没有 Slow 使用。
- Codex 本地复核通过：`npm run build`、`npx tsc --noEmit -p tsconfig.app.json`、`./scripts/run-runtime-tests.sh tests/v9-hn5-slow-autocast-minimal.spec.ts tests/v9-hn5-slow-runtime-minimal.spec.ts --reporter=list` 8/8、`node --test tests/v9-hn5-sorceress-slow-data-seed.spec.mjs tests/v9-hn5-sorceress-slow-contract.spec.mjs tests/v9-hn4-closure-inventory.spec.mjs` 16/16。
- 剩余未知：HN5 需要一张收口盘点证明数据、训练、mana、手动 Slow、自动 Slow 都已连通；AI Slow、攻击速度减益、Invisibility、Polymorph、素材和完整 caster tree 仍后置。

### Task 156 — V9 HN5-CLOSE6 Sorceress / Slow closure inventory

Status: `accepted`.

Owner: GLM-style worker + Codex review.

Priority: Task155 已接受，HN5 的 Sorceress / Slow 最小链路已经覆盖数据、训练、mana、手动 Slow 和自动 Slow。下一步先做收口盘点，防止继续误派 auto-cast 或把 HN5 扩大成完整法师科技树。

Prerequisite: `Task 155 — V9 HN5-IMPL5 Slow auto-cast minimal toggle` accepted.

Allowed files:

- `tests/v9-hn5-closure-inventory.spec.mjs`
- `docs/V9_HN5_SORCERESS_SLOW_CONTRACT.zh-CN.md`
- `docs/V9_HUMAN_NUMERIC_EXPANSION_PACKET.zh-CN.md`
- `docs/V9_MAINTENANCE_EXPANSION_EVIDENCE_LEDGER.zh-CN.md`
- `docs/V9_MAINTENANCE_EXPANSION_REMAINING_GATES.zh-CN.md`
- `docs/GLM_READY_TASK_QUEUE.md` only for closeout sync

Goal:

新增一张 HN5 收口盘点 proof，确认当前最小 Sorceress / Slow 链路已经完整：数据种子、Arcane Sanctum 训练、mana 初始化、手动 Slow、自动 Slow 都有证据。不要继续实现新 runtime。

Required implementation:

1. 新增 `tests/v9-hn5-closure-inventory.spec.mjs`，静态读取代码、测试和文档。
2. 证明 `UNITS.sorceress`、`ABILITIES.slow`、Arcane Sanctum `trains`、Sorceress mana 字段、手动 Slow runtime 和 auto-cast toggle 都存在。
3. 证明已有 proof 文件覆盖：data seed、training surface、mana surface、manual Slow、auto Slow。
4. 证明文档没有把 HN5 误写成已经完成 AI Slow、攻击速度减益、Invisibility、Polymorph、素材或完整 caster tree。
5. 更新 HN5 合同、Human expansion packet、V9 ledger / remaining gates，把 HN5 当前状态写清楚。
6. 任务完成时只把本任务在 `docs/GLM_READY_TASK_QUEUE.md` 标成 `completed`，不要替 Codex 标 `accepted`。

Forbidden:

- 不改 `src/game/Game.ts`、`src/game/GameData.ts`、`src/game/SimpleAI.ts`。
- 不新增 runtime 行为，不改平衡数值。
- 不实现 AI Slow、攻击速度减益、状态图标、素材、Invisibility、Polymorph、Spell Breaker、英雄、物品或完整 caster tech tree。
- 不删除或放宽 Task150-155 现有 proof。

Verification:

```bash
node --test tests/v9-hn5-closure-inventory.spec.mjs tests/v9-hn5-sorceress-slow-data-seed.spec.mjs tests/v9-hn5-sorceress-slow-contract.spec.mjs
npm run build
npx tsc --noEmit -p tsconfig.app.json
FORCE_RUNTIME_CLEANUP=1 ./scripts/cleanup-local-runtime.sh
```

Closeout requirements:
- Start your final closeout with the exact line: JOB_COMPLETE: <job-id>
- If truly blocked, emit the exact line: JOB_BLOCKED: <job-id>
- Include sections for files changed, verification run, and remaining unknowns.
- End with an exact line that begins with READY_FOR_NEXT_TASK: followed by the next safe continuation.
- Keep the work within the requested scope; do not widen ownership on your own.

Closeout:

- GLM 新增 `tests/v9-hn5-closure-inventory.spec.mjs`，并同步 HN5 合同、Human expansion packet、remaining gates 的 HN5 收口口径；随后停在提示符，没有完整 closeout。
- Codex 本地复核接受：proof 证明 `UNITS.sorceress`、`ABILITIES.slow`、Arcane Sanctum 训练、数据驱动 mana、手动 Slow runtime、自动 Slow toggle 都存在。
- proof 同时证明 HN5 没有越界宣称 AI Slow、攻击速度减益、Spell Breaker、Invisibility、Polymorph、英雄、物品、素材或完整 caster tree。
- Codex 本地复核通过：`node --test tests/v9-hn5-closure-inventory.spec.mjs tests/v9-hn5-sorceress-slow-data-seed.spec.mjs tests/v9-hn5-sorceress-slow-contract.spec.mjs` 18/18。
- 剩余未知：HN5 最小链路已闭环；下一张必须从 Human completeness roadmap 选择新分支，并先做分支合同，不直接写 runtime。

### Task 157 — V9 HN6-PLAN1 Castle / Knight branch contract

Status: `accepted`.

Owner: GLM-style worker + Codex review.

Priority: HN5 Sorceress / Slow 最小链路已收口。完整 Human 还缺 Castle / Knight 这条核心重甲近战和 T3 升级线；但下一步只能先定义分支合同，不能直接实现 Castle 或 Knight runtime。

Prerequisite: `Task 156 — V9 HN5-CLOSE6 Sorceress / Slow closure inventory` accepted.

Allowed files:

- `docs/V9_HN6_CASTLE_KNIGHT_CONTRACT.zh-CN.md`
- `docs/V9_HUMAN_NUMERIC_EXPANSION_PACKET.zh-CN.md`
- `docs/HUMAN_RACE_CAPABILITY_BOARD.zh-CN.md`
- `tests/v9-hn6-castle-knight-contract.spec.mjs`
- `docs/GLM_READY_TASK_QUEUE.md` only for closeout sync

Goal:

定义下一条 Human 分支：Castle / Knight。合同必须讲清楚为什么先做这条线、最小数据字段、实现顺序、proof 序列、禁区和后续任务边界。这个任务只写合同和静态 proof，不改 `Game.ts` / `GameData.ts`。

Required implementation:

1. 新增 `docs/V9_HN6_CASTLE_KNIGHT_CONTRACT.zh-CN.md`。
2. 合同至少拆出这些阶段：Castle 数据 / 升级合同、Keep -> Castle 最小升级路径、Knight 数据种子、Barracks training surface、Knight runtime smoke、HN6 closure inventory。
3. 明确 Knight 的 War3-like 身份：高生命、重甲、高成本、近战重甲冲击单位；不等同 Footman / Militia。
4. 明确 Castle 是 T3 主基地，不得在第一张实现里偷开完整 T3、英雄、空军、物品或全部科技。
5. 明确 Animal War Training、完整 Blacksmith 三段攻防、AI Knight 策略、素材和最终外观后置。
6. 新增静态 proof，证明合同存在、阶段顺序清楚、禁区清楚、没有要求一次实现 runtime。
7. 同步 Human expansion packet / Human capability board 的当前下一分支口径。
8. 任务完成时只把本任务在 `docs/GLM_READY_TASK_QUEUE.md` 标成 `completed`，不要替 Codex 标 `accepted`。

Forbidden:

- 不改 `src/game/Game.ts`、`src/game/GameData.ts`、`src/game/SimpleAI.ts`。
- 不新增 Castle / Knight runtime、训练按钮、升级流程或数值。
- 不实现 heroes、items、air units、Spell Breaker、Siege Engine、Gryphon / Dragonhawk、完整科技树或素材。
- 不把 HN6 写成 Human 完成；它只是下一个分支合同。

Verification:

```bash
node --test tests/v9-hn6-castle-knight-contract.spec.mjs
npm run build
npx tsc --noEmit -p tsconfig.app.json
FORCE_RUNTIME_CLEANUP=1 ./scripts/cleanup-local-runtime.sh
```

Closeout requirements:
- Start your final closeout with the exact line: JOB_COMPLETE: <job-id>
- If truly blocked, emit the exact line: JOB_BLOCKED: <job-id>
- Include sections for files changed, verification run, and remaining unknowns.
- End with an exact line that begins with READY_FOR_NEXT_TASK: followed by the next safe continuation.
- Keep the work within the requested scope; do not widen ownership on your own.

Closeout:

- GLM 新增 `docs/V9_HN6_CASTLE_KNIGHT_CONTRACT.zh-CN.md` 和 `tests/v9-hn6-castle-knight-contract.spec.mjs` 后停在 build 输出前。
- Codex 复核时修正合同口径：Barracks 当前已训练 `footman` / `rifleman`；Knight 不能静默简化为“只要 Castle”，必须保留 Castle + Blacksmith + Lumber Mill 的前置复杂度；Castle reference cost 使用 360/210，build time 参考 140。
- 合同把 HN6 拆成 Castle data、Keep -> Castle runtime、Knight prerequisite model、Knight data、Knight training、Knight smoke、closure inventory。
- 禁区仍明确：不实现英雄、物品、空军、Spell Breaker、Siege Engine、完整 T3、AI Knight、Animal War Training、Blacksmith 三段或素材。
- Codex 本地复核通过：`node --test tests/v9-hn6-castle-knight-contract.spec.mjs` 7/7、`npm run build`、`npx tsc --noEmit -p tsconfig.app.json`。
- 剩余未知：Castle / Knight runtime 尚未实现；Task157 当时的下一张只能做 Castle 数据种子，不接 Knight 或 runtime。

### Task 158 — V9 HN6-DATA1 Castle data seed

Status: `accepted`.

Owner: GLM-style worker + Codex review.

Priority: Task157 已接受，HN6 合同明确第一张实现只能是 Castle 数据种子。Task158 已完成这一步，并由 Codex 复核接受；下一步才能进入 Keep -> Castle 最小 runtime。

Prerequisite: `Task 157 — V9 HN6-PLAN1 Castle / Knight branch contract` accepted.

Allowed files:

- `src/game/GameData.ts`
- `tests/v9-hn6-castle-data-seed.spec.mjs`
- `tests/v9-hn6-castle-knight-contract.spec.mjs`
- `docs/V9_HN6_CASTLE_KNIGHT_CONTRACT.zh-CN.md`
- `docs/V9_HUMAN_NUMERIC_EXPANSION_PACKET.zh-CN.md`
- `docs/HUMAN_RACE_CAPABILITY_BOARD.zh-CN.md`
- `docs/GLM_READY_TASK_QUEUE.md` only for closeout sync

Goal:

新增 Castle 的最小数据种子：`BUILDINGS.castle` 存在，`keep.upgradeTo = 'castle'`，Castle 是 T3 主基地并保持 worker 训练入口。这个任务不改 `Game.ts`，不让玩家真的升级 Castle。

Required implementation:

1. 在 `BUILDINGS` 中新增 `castle`，字段对齐 HN6 合同：key/name/cost/buildTime/hp/supply/size/description/techTier/trains。
2. 给 `BUILDINGS.keep` 增加 `upgradeTo: 'castle'`。
3. Castle `trains` 只保留 `['worker']`；不得打开 Knight、英雄、空军、商店、物品或 T3 建筑。
4. 新增静态 proof，证明 Castle 数据存在、Keep 指向 Castle、Game.ts 没有新增 Castle runtime、Task158 收口时 UNITS 仍无 Knight。
5. 更新 HN6 合同 / Human expansion / capability board 的当前状态。
6. 任务完成时只把本任务在 `docs/GLM_READY_TASK_QUEUE.md` 标成 `completed`，不要替 Codex 标 `accepted`。

Forbidden:

- 不改 `src/game/Game.ts`、`src/game/SimpleAI.ts`、UI 或 runtime 测试。
- 不新增 `UNITS.knight`。
- 不让 Keep -> Castle 可点击或可完成；那是下一张 runtime 任务。
- 不新增 heroes、items、air units、Spell Breaker、Siege Engine、full T3 tech tree、AI Knight、Animal War Training、Blacksmith 三段或素材。
- 不把 Castle 数据 seed 写成 Human 完成。

Verification:

```bash
node --test tests/v9-hn6-castle-data-seed.spec.mjs tests/v9-hn6-castle-knight-contract.spec.mjs
npm run build
npx tsc --noEmit -p tsconfig.app.json
FORCE_RUNTIME_CLEANUP=1 ./scripts/cleanup-local-runtime.sh
```

Closeout requirements:
- Start your final closeout with the exact line: JOB_COMPLETE: <job-id>
- If truly blocked, emit the exact line: JOB_BLOCKED: <job-id>
- Include sections for files changed, verification run, and remaining unknowns.
- End with an exact line that begins with READY_FOR_NEXT_TASK: followed by the next safe continuation.
- Keep the work within the requested scope; do not widen ownership on your own.

Closeout:

- GLM 新增 `BUILDINGS.castle`，并把 `BUILDINGS.keep.upgradeTo` 指到 `castle`。
- Castle 数据保持为 T3 主基地、HP 2500、`trains: ['worker']`，没有打开 Knight、英雄、空军、物品或 T3 建筑解锁。
- Codex 修正 proof 中对 Castle runtime 的断言，避免旧合同 proof 和新数据 seed 互相矛盾。
- Codex 本地复核通过：`node --test tests/v9-hn6-castle-data-seed.spec.mjs tests/v9-hn6-castle-knight-contract.spec.mjs` 12/12、`npm run build`、`npx tsc --noEmit -p tsconfig.app.json`。
- 剩余未知：Keep -> Castle 还不能在游戏里点击或完成；Knight 仍没有数据、前置、训练按钮或 runtime。

### Task 159 — V9 HN6-IMPL2 Keep to Castle upgrade path

Status: `accepted`.

Owner: GLM-style worker + Codex takeover.

Owner note: GLM 半启动后停在提示符；Codex 接管完成测试、旧 proof 迁移和验收。

Closeout:

- `src/game/Game.ts` 新增 `isMainHall(type)`，把胜负判断、Call to Arms、开局金矿定位等主基地判断迁移到 Town Hall / Keep / Castle 三者一致。
- 现有升级机制复用 `upgradeTo`，无需 Castle 专用分支；Keep 能显示“升级主城”，资源足够时扣 Castle cost 并进入 `targetType: 'castle'`。
- Castle 升级完成后同一建筑变成 `castle`，HP 更新为 Castle 数据，仍保留 worker 训练和集结点。
- 没有新增 `UNITS.knight`，Barracks 不训练 Knight，没有 AI Castle、T3 建筑解锁、英雄、空军、物品或素材。
- Codex 迁移旧 Keep proof：Castle 数据现在存在，但 Town Hall -> Keep 第一段不能跳级到 Castle，也不能出现 Knight。
- Codex 本地复核通过：`npm run build`；`./scripts/run-runtime-tests.sh tests/v9-hn6-keep-castle-upgrade-runtime.spec.ts tests/v9-keep-upgrade-flow-regression.spec.ts tests/v9-keep-post-upgrade-command-surface.spec.ts --reporter=list` 9/9。
- 剩余未知：Knight 前置还没被 schema 表达；Barracks 仍不能训练 Knight；AI 不会主动升级 Castle。

READY_FOR_NEXT_TASK: HN6-PREREQ3 Knight 前置模型确认

### Task 160 — V9 HN6-PREREQ3 Knight prerequisite model

Status: `accepted`.

Owner: GLM-style worker + Codex review.

Files changed:
- `src/game/GameData.ts`: UnitDef 新增 `techPrereqs?: string[]` 字段
- `tests/v9-hn6-knight-prerequisite-model.spec.mjs`: 新增 6 项静态 proof

Verification:
- `node --test tests/v9-hn6-knight-prerequisite-model.spec.mjs tests/v9-hn6-castle-knight-contract.spec.mjs`: 13/13 通过
- `npm run build`: 通过
- `npx tsc --noEmit -p tsconfig.app.json`: 通过

Codex review:
- 修正 `techPrereqs` 字段注释，避免误写成“当前 runtime 已检查”；当前只定义数据模型，runtime 集成是后续任务。
- 修正静态 proof 文案：现有单前置继续走 `techPrereq`；Game.ts 当前不消费 `techPrereqs`。
- 本地复核通过：node proof 13/13、build、tsc。

READY_FOR_NEXT_TASK: HN6-IMPL5 Knight training prerequisite gate
- Include sections for files changed, verification run, and remaining unknowns.
- End with an exact line that begins with READY_FOR_NEXT_TASK: followed by the next safe continuation.
- Keep the work within the requested scope; do not widen ownership on your own.

### Task 161 — V9 HN6-DATA4 Knight data seed

Status: `accepted`.

Owner: GLM-style worker + Codex review.

Priority: Task160 已接受，多前置模型已存在但 runtime 尚未消费。下一张只新增 Knight 的数据种子，让后续 runtime / command-card 能接真实数据；不得直接把 Knight 训练打开。

Prerequisite: `Task 160 — V9 HN6-PREREQ3 Knight prerequisite model` accepted.

Allowed files:

- `src/game/GameData.ts`
- `tests/v9-hn6-knight-data-seed.spec.mjs`
- `tests/v9-hn6-knight-prerequisite-model.spec.mjs`
- `tests/v9-hn6-castle-knight-contract.spec.mjs`
- `docs/V9_HN6_CASTLE_KNIGHT_CONTRACT.zh-CN.md`
- `docs/V9_HUMAN_NUMERIC_EXPANSION_PACKET.zh-CN.md`
- `docs/HUMAN_RACE_CAPABILITY_BOARD.zh-CN.md`
- `docs/GLM_READY_TASK_QUEUE.md` only for closeout sync

Goal:

新增 `UNITS.knight` 数据种子：Knight 是 Human T3 高机动重甲近战单位，使用 `techPrereqs: ['castle', 'blacksmith', 'lumber_mill']` 表达多前置。这个任务只加数据和静态 proof，不接 runtime，不让玩家训练 Knight。

Required implementation:

1. 在 `UNITS` 中新增 `knight`，字段包括 key/name/cost/trainTime/hp/speed/supply/attackDamage/attackRange/attackCooldown/armor/sightRange/canGather/description/techPrereqs/attackType/armorType。
2. Knight 必须用 `techPrereqs: ['castle', 'blacksmith', 'lumber_mill']`，不得退回单一 `techPrereq: 'castle'`。
3. Barracks `trains` 不得加入 `knight`；Game.ts 不得引用 `knight` 或 `techPrereqs`。
4. 新增静态 proof，证明 Knight 数据存在、字段对齐合同、多前置存在、Barracks 不训练 Knight、runtime 未打开。
5. 更新 HN6 合同、Human expansion、capability board 的当前状态。

Forbidden:

- 不改 `src/game/Game.ts`、`src/game/SimpleAI.ts`、UI 或 runtime 测试。
- 不让 Barracks 训练 Knight。
- 不新增 AI Knight、Animal War Training、Blacksmith 三段、T3 建筑解锁、英雄、空军、物品或素材。
- 不把 Knight data seed 写成 Knight 可玩。

Verification:

```bash
node --test tests/v9-hn6-knight-data-seed.spec.mjs tests/v9-hn6-knight-prerequisite-model.spec.mjs tests/v9-hn6-castle-knight-contract.spec.mjs
npm run build
npx tsc --noEmit -p tsconfig.app.json
FORCE_RUNTIME_CLEANUP=1 ./scripts/cleanup-local-runtime.sh
```

Codex review:
- GLM 已新增 `UNITS.knight`、`tests/v9-hn6-knight-data-seed.spec.mjs`，并迁移 HN6 相关静态 proof。
- Codex 将 Knight speed 从 3.2 修正为 3.5，使其符合“快速重骑”身份，并高于 Footman 的 3.0。
- Codex 修正旧 proof / 文档中“仍无 Knight”的过期口径：当前状态是 Knight 数据存在，但训练入口和 runtime 多前置仍未打开。
- 本地复核通过：HN6 static proof 24/24、build、tsc。

READY_FOR_NEXT_TASK: HN6-IMPL5 Knight training prerequisite gate

### Task 162 — V9 HN6-IMPL5 Knight training prerequisite gate

Status: `accepted`.

Owner: GLM-style worker + Codex takeover.

Priority: Task161 已接受，Knight 数据存在但玩家还不能训练。下一步必须把 Knight 接入真实 Barracks 训练面，同时让 `techPrereqs` 变成运行时门槛，避免 Castle-only 误解。

Prerequisite: `Task 161 — V9 HN6-DATA4 Knight data seed` accepted.

Allowed files:

- `src/game/GameData.ts`
- `src/game/Game.ts`
- `tests/v9-hn6-knight-training-prereq-runtime.spec.ts`
- `tests/v9-hn6-knight-data-seed.spec.mjs`
- `tests/v9-hn6-knight-prerequisite-model.spec.mjs`
- `tests/v9-hn6-castle-knight-contract.spec.mjs`
- `docs/V9_HN6_CASTLE_KNIGHT_CONTRACT.zh-CN.md`
- `docs/V9_HUMAN_NUMERIC_EXPANSION_PACKET.zh-CN.md`
- `docs/HUMAN_RACE_CAPABILITY_BOARD.zh-CN.md`
- `docs/GLM_READY_TASK_QUEUE.md` only for closeout sync

Goal:

让 Barracks 显示 Knight 训练入口，但必须同时满足 Castle、Blacksmith、Lumber Mill 三个已完成建筑后才可用。这个任务只做玩家训练门槛和 proof，不做 AI Knight 或其他 T3 内容。

Required implementation:

1. 将 `knight` 加入 `BUILDINGS.barracks.trains`。
2. 在训练按钮可用性检查里支持 `UnitDef.techPrereqs?: string[]`：数组中每个建筑类型都必须有一个已完成的玩家建筑。
3. 命令卡未满足前置时显示 Knight 训练按钮但 disabled，原因要能让用户看懂，至少说明缺少 Castle / Blacksmith / Lumber Mill 中的具体项。
4. 三个前置都完成后，Knight 按正常训练队列扣资源、占人口、等待 trainTime、产出单位。
5. 新增 focused runtime proof 覆盖：缺任一前置禁用、三前置齐全启用、训练产出 Knight、Game.ts 不绕过资源/人口/队列规则。
6. 更新 HN6 合同、Human expansion、capability board 和 queue 状态。

Forbidden:

- 不改 `src/game/SimpleAI.ts`。
- 不新增 AI Knight。
- 不新增 Animal War Training、Blacksmith 三段、Defend 研究、英雄、空军、物品、素材、Aviary、Altar、Arcane Vault 或完整 T3 解锁。
- 不绕过正常训练队列，不直接 spawn Knight。

Verification:

```bash
npm run build
npx tsc --noEmit -p tsconfig.app.json
./scripts/run-runtime-tests.sh tests/v9-hn6-knight-training-prereq-runtime.spec.ts --reporter=list
node --test tests/v9-hn6-knight-data-seed.spec.mjs tests/v9-hn6-knight-prerequisite-model.spec.mjs tests/v9-hn6-castle-knight-contract.spec.mjs
FORCE_RUNTIME_CLEANUP=1 ./scripts/cleanup-local-runtime.sh
```

Codex review:
- GLM 已完成核心代码：`BUILDINGS.barracks.trains` 加入 `knight`，`getTrainAvailability` / `trainUnit` 增加 `techPrereqs` 多前置检查。
- GLM 只跑了 tsc 和静态 proof；Codex 接管补 `tests/v9-hn6-knight-training-prereq-runtime.spec.ts`，证明缺 Castle / Lumber Mill 时按钮 disabled 且显示原因，三前置齐全后可排队、扣费、占人口、等待 trainTime 后产出 Knight。
- Codex 修正测试中的净收入误判：扣费必须按点击后的即时资源差额断言，不能把 45 秒训练期间农民采金收入算进去。
- 本地复核通过：focused runtime 5/5、static proof 24/24、build、tsc。

READY_FOR_NEXT_TASK: HN6-IMPL6 Knight combat identity smoke

### Task 163 — V9 HN6-IMPL6 Knight combat identity smoke

Status: `accepted`.

Owner: GLM-style worker + Codex review.

Priority: Task162 已接受，Knight 可以训练；下一步只证明它在受控战斗中真的像高血量高护甲重骑，而不是只在数据表里存在。

Prerequisite: `Task 162 — V9 HN6-IMPL5 Knight training prerequisite gate` accepted.

Allowed files:

- `tests/v9-hn6-knight-combat-smoke.spec.ts`
- `tests/v9-hn6-knight-data-seed.spec.mjs`
- `tests/v9-hn6-castle-knight-contract.spec.mjs`
- `docs/V9_HN6_CASTLE_KNIGHT_CONTRACT.zh-CN.md`
- `docs/V9_HUMAN_NUMERIC_EXPANSION_PACKET.zh-CN.md`
- `docs/HUMAN_RACE_CAPABILITY_BOARD.zh-CN.md`
- `docs/GLM_READY_TASK_QUEUE.md` only for closeout sync

Goal:

新增一个 focused runtime smoke，证明 Knight 的战斗身份：它是高 hp、高 armor、高 supply、快速、近战、Normal/Heavy 的 T3 骑兵；在同等受控攻击压力下比 Footman 更耐打。这个任务优先测试和文档，不主动改生产代码。

Required implementation:

1. 新增 `tests/v9-hn6-knight-combat-smoke.spec.ts`。
2. 在 runtime 中用受控 fixture 训练或直接通过已有测试入口生成 Knight / Footman / 敌方攻击者；关闭 AI 干扰。
3. 证明 Knight 与 Footman 的可见/运行时身份差异：hp、armor、speed、supply、attackDamage、Normal / Heavy。
4. 证明在同等攻击压力下 Knight 存活更久或剩余 HP 明显更高。
5. 证明这个 smoke 不依赖 AI Knight、Animal War Training、英雄、空军、物品、素材或完整 T3。
6. 如发现生产代码 bug，可以停下并标 `JOB_BLOCKED`，不要自行扩大范围。

Forbidden:

- 不改 `src/game/SimpleAI.ts`。
- 不新增 AI Knight。
- 不新增 Animal War Training、Blacksmith 三段、英雄、空军、物品、素材、Aviary、Altar、Arcane Vault 或完整 T3 解锁。
- 不做平衡大调参；如果 smoke 证明失败，只记录失败并交给 Codex 决定是否改数值。

Verification:

```bash
npm run build
npx tsc --noEmit -p tsconfig.app.json
./scripts/run-runtime-tests.sh tests/v9-hn6-knight-combat-smoke.spec.ts --reporter=list
node --test tests/v9-hn6-knight-data-seed.spec.mjs tests/v9-hn6-castle-knight-contract.spec.mjs
FORCE_RUNTIME_CLEANUP=1 ./scripts/cleanup-local-runtime.sh
```

Codex review:

- GLM 初版 KCS-1 错误假设运行时 `Unit` 对象存有 `attackType` / `armorType` 字段。
- Codex 修正 proof：Knight 的攻击/护甲类型以 `UNITS.knight` 数据定义为准，并通过选中 Knight 后 HUD 真实显示“普通 / 重甲”证明玩家可见身份。
- 本地复核通过：runtime smoke 3/3、static proof 13/13、build、tsc。

READY_FOR_NEXT_TASK: HN6-CLOSE7 Castle / Knight closure inventory

### Task 164 — V9 HN6-CLOSE7 Castle / Knight closure inventory

Status: `accepted`.

Owner: Codex takeover.

Priority: Task163 已接受，HN6 不能继续无限扩张。下一步只做收口盘点，证明 Castle / Knight 这条最小链路到哪里为止、哪些仍明确不在本阶段。

Prerequisite: `Task 163 — V9 HN6-IMPL6 Knight combat identity smoke` accepted.

Allowed files:

- `tests/v9-hn6-closure-inventory.spec.mjs`
- `docs/V9_HN6_CASTLE_KNIGHT_CONTRACT.zh-CN.md`
- `docs/V9_HUMAN_NUMERIC_EXPANSION_PACKET.zh-CN.md`
- `docs/HUMAN_RACE_CAPABILITY_BOARD.zh-CN.md`
- `docs/V9_MAINTENANCE_EXPANSION_REMAINING_GATES.zh-CN.md`
- `docs/V9_MAINTENANCE_EXPANSION_EVIDENCE_LEDGER.zh-CN.md`
- `docs/GLM_READY_TASK_QUEUE.md` only for closeout sync

Goal:

新增 HN6 closure inventory 静态 proof，盘点 Castle / Knight 分支已经闭环的最小链路：Castle 数据、Keep -> Castle 升级、Knight 多前置模型、Knight 数据、Knight 训练门槛、Knight 战斗身份 smoke。这个任务只做收口证明和文档同步，不新增玩法。

Required implementation:

1. 新增 `tests/v9-hn6-closure-inventory.spec.mjs`。
2. 证明 HN6 合同和 evidence ledger 已记录 Task157..Task163 的完整链路。
3. 证明当前真实能力包括：Castle 数据、Keep -> Castle runtime、Barracks Knight 训练、Castle + Blacksmith + Lumber Mill 多前置、Knight 战斗身份 smoke。
4. 证明当前仍未打开：AI Castle、AI Knight、Animal War Training、Blacksmith 三段、英雄、空军、物品、素材导入、完整 T3。
5. 更新 `docs/V9_HN6_CASTLE_KNIGHT_CONTRACT.zh-CN.md` 和 `docs/V9_HUMAN_NUMERIC_EXPANSION_PACKET.zh-CN.md`，把 HN6 标记为最小闭环完成。
6. 给出下一张相邻任务建议，但不要自行扩大到 AI Knight 或英雄。

Forbidden:

- 不改 `src/game/Game.ts`、`src/game/GameData.ts`、`src/game/SimpleAI.ts`。
- 不新增 runtime spec。
- 不新增 AI、单位、建筑、科技、素材或数值调参。

Verification:

```bash
node --test tests/v9-hn6-closure-inventory.spec.mjs
npm run build
npx tsc --noEmit -p tsconfig.app.json
FORCE_RUNTIME_CLEANUP=1 ./scripts/cleanup-local-runtime.sh
```

Codex review:

- GLM 收到 Task164 后读了合同和测试，但中途回到提示符，没有写出 closure proof 或 closeout。
- Codex 接管新增 `tests/v9-hn6-closure-inventory.spec.mjs`，并同步 HN6 合同、Human expansion packet、remaining gates 和 evidence ledger。
- 本地复核通过：HN6 closure inventory proof 6/6。

READY_FOR_NEXT_TASK: HN7-IMPL1 — extend ResearchEffect.stat to support maxHp

### Task 165 — V9 HN7-PLAN1 Blacksmith / Animal Training branch contract

Status: `accepted`.

Owner: GLM-style worker + Codex review.

Priority: HN6 已收口，Human 后续不应直接跳 AI Knight、英雄或空军。下一张只定义升级分支合同，把 Blacksmith 三段升级和 Animal War Training 的范围、字段和 proof 序列先收清楚。

Prerequisite: `Task 164 — V9 HN6-CLOSE7 Castle / Knight closure inventory` accepted.

Allowed files:

- `docs/V9_HN7_BLACKSMITH_ANIMAL_TRAINING_CONTRACT.zh-CN.md`
- `tests/v9-hn7-blacksmith-animal-contract.spec.mjs`
- `docs/V9_HUMAN_NUMERIC_EXPANSION_PACKET.zh-CN.md`
- `docs/HUMAN_RACE_CAPABILITY_BOARD.zh-CN.md`
- `docs/V9_MAINTENANCE_EXPANSION_REMAINING_GATES.zh-CN.md`
- `docs/GLM_READY_TASK_QUEUE.md` only for closeout sync

Goal:

新增 HN7 合同和静态 proof，只定义 Blacksmith upgrade ladder 与 Animal War Training 的后续实现边界。这个任务不新增任何数据、runtime、AI、素材或数值调参。

Required implementation:

1. 新增 `docs/V9_HN7_BLACKSMITH_ANIMAL_TRAINING_CONTRACT.zh-CN.md`。
2. 新增 `tests/v9-hn7-blacksmith-animal-contract.spec.mjs`。
3. 合同必须区分：Blacksmith 三段武器/护甲升级、Rifleman 已有 Long Rifles、Animal War Training 三者的归属和影响单位。
4. 合同必须定义最小字段：upgrade key、display name、owner building、tier/prereq、cost、research time、affected unit types、effect type、effect value、stacking / max level rule。
5. 合同必须给出实现顺序：contract -> data seed -> visible command-card / disabled reason -> runtime effect read -> proof -> closure。
6. 合同必须明确禁区：不做英雄、空军、AI Knight、AI upgrade strategy、官方素材、物品、完整 T3、第二阵营。
7. 如果对 War3 精确来源不确定，只写“需 Codex 源校验后进入 data seed”，不要伪造官方数值。

Forbidden:

- 不改 `src/game/Game.ts`、`src/game/GameData.ts`、`src/game/SimpleAI.ts`。
- 不新增 runtime spec。
- 不新增任何 upgrade 数据或 ability 数据。
- 不做网页搜索、素材下载或官方资源导入。

Verification:

```bash
node --test tests/v9-hn7-blacksmith-animal-contract.spec.mjs
npm run build
npx tsc --noEmit -p tsconfig.app.json
FORCE_RUNTIME_CLEANUP=1 ./scripts/cleanup-local-runtime.sh
```

Codex review:

- GLM 完成 HN7 合同、静态 proof 和状态文档。
- Codex 复核时把 Animal War Training 的归属建筑 / 前置从“已确认 War3 事实”软化为“候选，进入 data seed 前必须源校验”，避免后续把未校验数值当事实。
- 本地复核通过：HN7 contract proof 14/14、build、tsc。

READY_FOR_NEXT_TASK: HN7-IMPL1 ResearchEffect maxHp support

### Task 166 — V9 HN7-IMPL1 ResearchEffect maxHp support

Status: `accepted`.

Owner: GLM-style worker + Codex takeover.

Priority: Task165 已接受，Animal War Training 需要 maxHp 研究效果。Task166 已完成最小模型扩展，不新增任何研究数据。

Prerequisite: `Task 165 — V9 HN7-PLAN1 Blacksmith / Animal Training branch contract` accepted.

Allowed files:

- `src/game/GameData.ts`
- `src/game/Game.ts`
- `tests/v9-hn7-research-maxhp-effect.spec.mjs`
- `docs/V9_HN7_BLACKSMITH_ANIMAL_TRAINING_CONTRACT.zh-CN.md`
- `docs/V9_HUMAN_NUMERIC_EXPANSION_PACKET.zh-CN.md`
- `docs/V9_MAINTENANCE_EXPANSION_EVIDENCE_LEDGER.zh-CN.md`
- `docs/GLM_READY_TASK_QUEUE.md` only for closeout sync

Goal:

让研究效果模型支持 `maxHp` 的 `FlatDelta`，为后续 Animal War Training 数据种子铺路。这个任务只改模型能力和静态 proof，不新增 `animal_war_training`，不改命令卡，不改 AI。

Required implementation:

1. 在 `ResearchEffect.stat` 联合类型中加入 `'maxHp'`。
2. 扩展 `applyFlatDeltaEffect`：当 stat 为 `maxHp` 时，同时增加 `unit.maxHp` 和 `unit.hp`，保持当前生命百分比争议后置；本任务只要求既有单位获得明确 hp / maxHp 加成。
3. 新增静态 proof `tests/v9-hn7-research-maxhp-effect.spec.mjs`，证明字段、runtime 分支和 forbidden 边界。
4. 更新 HN7 合同 / expansion / evidence ledger，说明 maxHp 模型能力已存在，但 Animal War Training 数据仍未落地。

Forbidden:

- 不新增 `RESEARCHES.animal_war_training`。
- 不新增 Blacksmith 三段升级数据。
- 不改 `BUILDINGS.blacksmith.researches` 或 `BUILDINGS.barracks.researches`。
- 不新增命令卡按钮、runtime spec、AI 升级策略、英雄、空军、物品或素材。
- 不改 Long Rifles 现有行为。

Verification:

```bash
node --test tests/v9-hn7-research-maxhp-effect.spec.mjs tests/v9-hn7-blacksmith-animal-contract.spec.mjs
npm run build
npx tsc --noEmit -p tsconfig.app.json
FORCE_RUNTIME_CLEANUP=1 ./scripts/cleanup-local-runtime.sh
```

Closeout requirements:
- Start your final closeout with the exact line: JOB_COMPLETE: <job-id>
- If truly blocked, emit the exact line: JOB_BLOCKED: <job-id>
- Include sections for files changed, verification run, and remaining unknowns.
- End with an exact line that begins with READY_FOR_NEXT_TASK: followed by the next safe continuation.
- Keep the work within the requested scope; do not widen ownership on your own.

Codex acceptance:

- GLM 写入了 `ResearchEffect.stat = 'maxHp'` 和 `applyFlatDeltaEffect` 的 `maxHp` 分支，但随后回到提示符，没有完整 closeout。
- Codex 接管后修正 HN7 contract proof，让旧合同测试接受 HN7-IMPL1 之后的新状态。
- 本任务没有新增 `animal_war_training`、Blacksmith 三段升级数据、命令卡、AI、英雄、空军、物品或素材。

Verification accepted:

```bash
node --test tests/v9-hn7-research-maxhp-effect.spec.mjs tests/v9-hn7-blacksmith-animal-contract.spec.mjs
npm run build
npx tsc --noEmit -p tsconfig.app.json
```

READY_FOR_NEXT_TASK: HN7-DATA3 — melee upgrade Level 1 data seed

### Task 167 — V9 HN7-IMPL2 ResearchDef prerequisiteResearch support

Status: `accepted`.

Owner: GLM-style worker + Codex review.

Priority: HN7 Blacksmith 三段升级需要“上一级研究完成后才能研究下一级”。当前 `ResearchDef` 还没有研究间前置字段，下一步只补这个模型和可用性检查，不新增任何升级数据。

Prerequisite: `Task 166 — V9 HN7-IMPL1 ResearchEffect maxHp support` accepted.

Allowed files:

- `src/game/GameData.ts`
- `src/game/Game.ts`
- `tests/v9-hn7-prerequisite-research-model.spec.mjs`
- `docs/V9_HN7_BLACKSMITH_ANIMAL_TRAINING_CONTRACT.zh-CN.md`
- `docs/V9_HUMAN_NUMERIC_EXPANSION_PACKET.zh-CN.md`
- `docs/V9_MAINTENANCE_EXPANSION_EVIDENCE_LEDGER.zh-CN.md`
- `docs/GLM_READY_TASK_QUEUE.md` only for closeout sync

Goal:

让研究定义能表达“必须先完成上一项研究”，并让研究可用性检查消费这个字段。这个任务只提供通用模型能力；不新增 melee / ranged / armor 升级数据，也不新增 Animal War Training。

Required implementation:

1. 在 `ResearchDef` 中新增可选字段 `prerequisiteResearch?: string`，注释说明它表示研究开始前必须已完成的研究 key。
2. 扩展 `getResearchAvailability`：如果 `def.prerequisiteResearch` 存在且队伍尚未完成该研究，返回 disabled，原因应能让玩家看懂，例如 `需要先研究<研究名>`。
3. 保持 `startResearch` 继续通过 `getResearchAvailability` 兜底，不复制第二套检查。
4. 新增静态 proof `tests/v9-hn7-prerequisite-research-model.spec.mjs`，证明字段、availability 检查、disabled reason、startResearch 复用、forbidden 边界。
5. 更新 HN7 合同 / expansion / evidence ledger，说明研究间前置模型已存在，但 Blacksmith 三段升级数据仍未落地。

Forbidden:

- 不新增 `RESEARCHES.melee_upgrade_1/2/3`、`ranged_upgrade_1/2/3`、`armor_upgrade_1/2/3`。
- 不新增 `RESEARCHES.animal_war_training`。
- 不改 `BUILDINGS.blacksmith.researches` 或 `BUILDINGS.barracks.researches`。
- 不新增命令卡按钮、runtime spec、AI 升级策略、英雄、空军、物品或素材。
- 不改 Long Rifles 现有行为。

Verification:

```bash
node --test tests/v9-hn7-prerequisite-research-model.spec.mjs tests/v9-hn7-blacksmith-animal-contract.spec.mjs tests/v9-hn7-research-maxhp-effect.spec.mjs
npm run build
npx tsc --noEmit -p tsconfig.app.json
FORCE_RUNTIME_CLEANUP=1 ./scripts/cleanup-local-runtime.sh
```

Closeout requirements:
- Start your final closeout with the exact line: JOB_COMPLETE: <job-id>
- If truly blocked, emit the exact line: JOB_BLOCKED: <job-id>
- Include sections for files changed, verification run, and remaining unknowns.
- End with an exact line that begins with READY_FOR_NEXT_TASK: followed by the next safe continuation.
- Keep the work within the requested scope; do not widen ownership on your own.

Codex acceptance:

- `ResearchDef.prerequisiteResearch?: string` 已落地。
- `getResearchAvailability` 已消费该字段并返回“需要先研究<研究名>”。
- `startResearch` 继续复用 `getResearchAvailability`。
- Codex 追加了 `tests/v9-hn7-prerequisite-research-model.spec.mjs`，并把 HN7 合同 proof 迁移到 HN7-IMPL2 后的真实状态。
- 未新增 Blacksmith 三段升级数据、Animal War Training、命令卡或 AI。

Verification accepted:

```bash
node --test tests/v9-hn7-prerequisite-research-model.spec.mjs tests/v9-hn7-blacksmith-animal-contract.spec.mjs tests/v9-hn7-research-maxhp-effect.spec.mjs
npm run build
npx tsc --noEmit -p tsconfig.app.json
```

READY_FOR_NEXT_TASK: HN7-DATA3 — Iron Forged Swords Level 1 data seed

### Task 168 — V9 HN7-DATA3 Iron Forged Swords Level 1 data seed

Status: `accepted`.

Owner: GLM-style worker + Codex review.

Priority: HN7-SRC3 已把近战 Level 1 源校验收口。下一步只写 Level 1 数据种子，让 Blacksmith 除 Long Rifles 外开始暴露第一段近战升级。

Prerequisite: `Task 167 — V9 HN7-IMPL2 ResearchDef prerequisiteResearch support` accepted.

Source evidence: HN7-SRC3 accepted via `docs/V9_HN7_MELEE_UPGRADE_SOURCE_PACKET.zh-CN.md`.

Allowed files:

- `src/game/GameData.ts`
- `tests/v9-hn7-melee-upgrade-data-seed.spec.mjs`
- `docs/V9_HN7_BLACKSMITH_ANIMAL_TRAINING_CONTRACT.zh-CN.md`
- `docs/V9_HUMAN_NUMERIC_EXPANSION_PACKET.zh-CN.md`
- `docs/V9_MAINTENANCE_EXPANSION_EVIDENCE_LEDGER.zh-CN.md`
- `docs/GLM_READY_TASK_QUEUE.md` only for closeout sync

Goal:

新增 Human 近战升级 Level 1 数据种子，不改 runtime。现有研究系统会自动从 `BUILDINGS.blacksmith.researches` 读取研究按钮。

Required implementation:

1. 在 `RESEARCHES` 中新增 `iron_forged_swords`。
2. 字段必须对齐 HN7-SRC3：
   - `name: '铁剑'`
   - `cost: { gold: 100, lumber: 50 }`
   - `researchTime: 60`
   - `requiresBuilding: 'blacksmith'`
   - no `prerequisiteResearch`
   - effects: `footman` / `militia` / `knight` 的 `attackDamage +1`
3. 把 `BUILDINGS.blacksmith.researches` 从 `['long_rifles']` 改为 `['long_rifles', 'iron_forged_swords']`。
4. 新增静态 proof `tests/v9-hn7-melee-upgrade-data-seed.spec.mjs`，证明数据、source packet 对齐、Long Rifles 保留、forbidden 边界。
5. 更新 HN7 合同 / expansion / evidence ledger：说明 Level 1 数据种子已落地，但二/三级、远程、护甲、Animal War Training 和 AI 仍未落地。

Forbidden:

- 不新增 `steel_forged_swords` 或 `mithril_forged_swords`。
- 不新增 `ranged_upgrade_*`、`armor_upgrade_*` 或 `animal_war_training`。
- 不改 `src/game/Game.ts`。
- 不新增 runtime spec、AI 升级策略、英雄、空军、物品、素材或 dice model。
- 不改 Long Rifles 现有 cost / time / effect。

Verification:

```bash
node --test tests/v9-hn7-melee-upgrade-data-seed.spec.mjs tests/v9-hn7-melee-upgrade-source-packet.spec.mjs tests/v9-hn7-prerequisite-research-model.spec.mjs tests/v9-hn7-research-maxhp-effect.spec.mjs tests/v9-hn7-blacksmith-animal-contract.spec.mjs
npm run build
npx tsc --noEmit -p tsconfig.app.json
FORCE_RUNTIME_CLEANUP=1 ./scripts/cleanup-local-runtime.sh
```

Closeout requirements:
- Start your final closeout with the exact line: JOB_COMPLETE: <job-id>
- If truly blocked, emit the exact line: JOB_BLOCKED: <job-id>
- Include sections for files changed, verification run, and remaining unknowns.
- End with an exact line that begins with READY_FOR_NEXT_TASK: followed by the next safe continuation.
- Keep the work within the requested scope; do not widen ownership on your own.

Codex acceptance:

- GLM 写入了 `RESEARCHES.iron_forged_swords` 和 Blacksmith researches hook，但随后回到提示符，没有补 proof / docs / closeout。
- Codex 接管后新增 `tests/v9-hn7-melee-upgrade-data-seed.spec.mjs`，并同步 HN7 合同、Human expansion packet 和 evidence ledger。
- `iron_forged_swords` 使用 HN7-SRC3 值：100 gold / 50 lumber、60 秒、footman/militia/knight `attackDamage +1`。
- 未新增 Steel / Mithril、远程升级、护甲升级、Animal War Training、Game.ts 特判、AI、英雄、空军、物品、素材或 dice model。

Verification accepted:

```bash
node --test tests/v9-hn7-melee-upgrade-data-seed.spec.mjs tests/v9-hn7-melee-upgrade-source-packet.spec.mjs tests/v9-hn7-prerequisite-research-model.spec.mjs tests/v9-hn7-research-maxhp-effect.spec.mjs tests/v9-hn7-blacksmith-animal-contract.spec.mjs
npm run build
npx tsc --noEmit -p tsconfig.app.json
```

READY_FOR_NEXT_TASK: HN7-IMPL4 — Iron Forged Swords Level 1 runtime smoke

### Task 169 — V9 HN7-IMPL4 Iron Forged Swords Level 1 runtime smoke

Status: `accepted`.

Owner: GLM-style worker + Codex review.

Priority: DATA3 已落地，下一步只验证现有研究系统是否能把 Iron Forged Swords 跑通。不新增数据，不改 AI。

Prerequisite: `Task 168 — V9 HN7-DATA3 Iron Forged Swords Level 1 data seed` accepted.

Allowed files:

- `tests/v9-hn7-iron-forged-swords-runtime.spec.ts`
- `docs/V9_HN7_BLACKSMITH_ANIMAL_TRAINING_CONTRACT.zh-CN.md`
- `docs/V9_HUMAN_NUMERIC_EXPANSION_PACKET.zh-CN.md`
- `docs/V9_MAINTENANCE_EXPANSION_EVIDENCE_LEDGER.zh-CN.md`
- `docs/GLM_READY_TASK_QUEUE.md` only for closeout sync

Goal:

用 focused runtime smoke 证明 Iron Forged Swords Level 1 在真实游戏路径里可用：Blacksmith 命令卡出现、能研究、完成后对已有单位生效，新产出单位继承效果。

Required proof:

1. 玩家拥有完成的 Blacksmith 后，命令卡显示 `铁剑` 研究按钮。
2. 研究扣除 100 gold / 50 lumber，并进入研究队列。
3. 研究完成后，已有 `footman`、`militia`、`knight` 的 `attackDamage` 各 +1。
4. 研究完成后新产出的 `footman` 或 `knight` 自动继承 +1 效果。
5. `rifleman`、`mortar_team`、`priest`、`sorceress` 不获得这项近战加成。

Forbidden:

- 不新增或修改 `src/game/GameData.ts`。
- 不修改 `src/game/Game.ts`。如果 runtime 跑不通，先 `JOB_BLOCKED` 并说明真实断点。
- 不新增 Steel / Mithril、远程升级、护甲升级、Animal War Training、AI、英雄、空军、物品、素材或 dice model。
- 不扩大成完整 Blacksmith 升级链。

Verification:

```bash
./scripts/run-runtime-tests.sh tests/v9-hn7-iron-forged-swords-runtime.spec.ts --reporter=list
npm run build
npx tsc --noEmit -p tsconfig.app.json
FORCE_RUNTIME_CLEANUP=1 ./scripts/cleanup-local-runtime.sh
```

Closeout requirements:
- Start your final closeout with the exact line: JOB_COMPLETE: <job-id>
- If truly blocked, emit the exact line: JOB_BLOCKED: <job-id>
- Include sections for files changed, verification run, and remaining unknowns.
- End with an exact line that begins with READY_FOR_NEXT_TASK: followed by the next safe continuation.
- Keep the work within the requested scope; do not widen ownership on your own.

Codex acceptance:

- GLM Task169 prompt 卡在 Claude Code compacting，未创建 runtime spec。
- Codex 接管新增 `tests/v9-hn7-iron-forged-swords-runtime.spec.ts`。
- Focused runtime smoke 证明：Blacksmith 命令卡出现 `铁剑`；研究扣 100/50 并进入队列；完成后已有 Footman/Militia/Knight 攻击 +1；新训练 Footman 继承 +1；Rifleman/Mortar/Priest/Sorceress 不变。
- 未新增数据、AI、英雄、空军、物品、素材或 dice model。

Verification accepted:

```bash
./scripts/run-runtime-tests.sh tests/v9-hn7-iron-forged-swords-runtime.spec.ts --reporter=list
```

READY_FOR_NEXT_TASK: HN7-CLOSE5 — Iron Forged Swords Level 1 closure inventory

### Task 170 — V9 HN7-CLOSE5 Iron Forged Swords Level 1 closure inventory

Status: `accepted`.

Owner: GLM-style worker + Codex review.

Priority: Iron Forged Swords Level 1 已有源校验、数据种子和 runtime smoke。下一步只做闭环盘点，确认 HN7 的 Level 1 切片没有越界，并明确下一分支。

Prerequisite: `Task 169 — V9 HN7-IMPL4 Iron Forged Swords Level 1 runtime smoke` accepted.

Allowed files:

- `tests/v9-hn7-iron-forged-swords-closure.spec.mjs`
- `docs/V9_HN7_BLACKSMITH_ANIMAL_TRAINING_CONTRACT.zh-CN.md`
- `docs/V9_HUMAN_NUMERIC_EXPANSION_PACKET.zh-CN.md`
- `docs/V9_MAINTENANCE_EXPANSION_EVIDENCE_LEDGER.zh-CN.md`
- `docs/GLM_READY_TASK_QUEUE.md` only for closeout sync

Goal:

盘点 Iron Forged Swords Level 1 链路是否闭环。这个任务不新增任何 gameplay，只确认已有证据和后续边界。

Required proof:

1. 证明 HN7-SRC3 源校验包存在并限定 Level 1。
2. 证明 HN7-DATA3 数据种子存在：`iron_forged_swords`、100/50、60 秒、footman/militia/knight +1、Blacksmith hook。
3. 证明 HN7-IMPL4 runtime smoke 文件存在并覆盖命令卡、扣费、完成效果、新单位继承、非近战不变。
4. 证明 Steel / Mithril、远程、护甲、Animal War Training、AI、英雄、空军、物品、素材仍未落地。
5. 文档结论必须把下一分支写成 HN7-SRC4 higher melee levels source reconciliation，不能直接写入二/三级数据。

Forbidden:

- 不修改 `src/game/GameData.ts`。
- 不修改 `src/game/Game.ts`。
- 不新增 runtime spec。
- 不新增任何研究数据、AI、英雄、空军、物品、素材或 dice model。

Verification:

```bash
node --test tests/v9-hn7-iron-forged-swords-closure.spec.mjs tests/v9-hn7-melee-upgrade-data-seed.spec.mjs tests/v9-hn7-melee-upgrade-source-packet.spec.mjs
npm run build
npx tsc --noEmit -p tsconfig.app.json
FORCE_RUNTIME_CLEANUP=1 ./scripts/cleanup-local-runtime.sh
```

Closeout requirements:
- Start your final closeout with the exact line: JOB_COMPLETE: <job-id>
- If truly blocked, emit the exact line: JOB_BLOCKED: <job-id>
- Include sections for files changed, verification run, and remaining unknowns.
- End with an exact line that begins with READY_FOR_NEXT_TASK: followed by the next safe continuation.
- Keep the work within the requested scope; do not widen ownership on your own.

Codex acceptance:

- GLM wrote `tests/v9-hn7-iron-forged-swords-closure.spec.mjs`.
- Codex retained GLM's late Task169 runtime supplement and reran the current focused runtime file.
- HN7-CLOSE5 is accepted: Level 1 source packet, data seed, runtime smoke, forbidden boundaries, and next-branch conclusion are all proven.

Verification accepted:

```bash
./scripts/run-runtime-tests.sh tests/v9-hn7-iron-forged-swords-runtime.spec.ts --reporter=list
node --test tests/v9-hn7-iron-forged-swords-closure.spec.mjs tests/v9-hn7-melee-upgrade-data-seed.spec.mjs tests/v9-hn7-melee-upgrade-source-packet.spec.mjs tests/v9-hn7-prerequisite-research-model.spec.mjs tests/v9-hn7-research-maxhp-effect.spec.mjs tests/v9-hn7-blacksmith-animal-contract.spec.mjs
```

Result: focused runtime 6/6 pass; HN7 static pack 63/63 pass.

READY_FOR_NEXT_TASK: HN7-SRC4 — Steel / Mithril source reconciliation

### Task 171 — V9 HN7-SRC4 Steel / Mithril source reconciliation

Status: `accepted`.

Owner: Codex source review + GLM static proof.

Priority: HN7 Level 1 已闭环。二、三级近战升级进入 data seed 前，必须先把 Steel / Mithril 的来源、数值和边界核对清楚，避免再次外推或伪造官方数值。

Prerequisite: `Task 170 — V9 HN7-CLOSE5 Iron Forged Swords Level 1 closure inventory` accepted.

Allowed files:

- `docs/V9_HN7_RANGED_UPGRADE_SOURCE_PACKET.zh-CN.md`
- `docs/V9_HN7_BLACKSMITH_ANIMAL_TRAINING_CONTRACT.zh-CN.md`
- `docs/V9_HUMAN_NUMERIC_EXPANSION_PACKET.zh-CN.md`
- `docs/V9_MAINTENANCE_EXPANSION_EVIDENCE_LEDGER.zh-CN.md`
- `tests/v9-hn7-melee-upgrade-source-packet.spec.mjs`
- `tests/v9-hn7-melee-upgrade-higher-level-source.spec.mjs`
- `docs/GLM_READY_TASK_QUEUE.md` only for closeout sync

Goal:

只做 Steel Forged Swords / Mithril Forged Swords 的资料核对和可写入边界，不写 `GameData.ts`，不改 runtime。

Required proof:

1. 至少两处资料源被记录，并注明哪些字段一致、哪些字段不一致。
2. 明确 Level 2 / 3 的 key、中文名、成本、研究时间、增量、受影响单位和 `prerequisiteResearch` 设计。
3. 如果来源仍不一致，必须写 blocked 字段和下一步，不允许进入 data seed。
4. 证明 Task171 没有新增 Steel / Mithril 数据，没有修改 `src/game/GameData.ts` 或 `src/game/Game.ts`。
5. 文档结论必须明确下一张是否允许 `HN7-DATA4`；如果允许，写清只能写二/三级近战升级，不能夹带远程、护甲、AWT、AI。

Forbidden:

- 不修改 `src/game/GameData.ts`。
- 不修改 `src/game/Game.ts`。
- 不新增 runtime spec。
- 不写远程升级、护甲升级、Animal War Training、AI、英雄、空军、物品、素材或 dice model。

Verification:

```bash
node --test tests/v9-hn7-melee-upgrade-higher-level-source.spec.mjs tests/v9-hn7-melee-upgrade-source-packet.spec.mjs
npm run build
npx tsc --noEmit -p tsconfig.app.json
FORCE_RUNTIME_CLEANUP=1 ./scripts/cleanup-local-runtime.sh
```

Closeout requirements:
- Start your final closeout with the exact line: JOB_COMPLETE: <job-id>
- If truly blocked, emit the exact line: JOB_BLOCKED: <job-id>
- Include sections for files changed, verification run, and remaining unknowns.
- End with an exact line that begins with READY_FOR_NEXT_TASK: followed by the next safe continuation.
- Keep the work within the requested scope; do not widen ownership on your own.

Codex acceptance:

- `docs/V9_HN7_MELEE_UPGRADE_SOURCE_PACKET.zh-CN.md` 已扩展 SRC4：Blizzard Classic Battle.net 作为二/三级主源，旧 GameFAQs 作为成本冲突样本。
- Steel 固定为 175/175、Keep、75 秒；Mithril 固定为 250/300、Castle、90 秒。
- 当前项目没有 dice model，DATA4 必须写成每级 incremental `attackDamage +1`，不能把 Damage Dice Bonus 2/3 写成单条 +2/+3。
- SRC4 不修改 `GameData.ts` 或 `Game.ts`，只放行下一张 DATA4。

Verification accepted:

```bash
node --test tests/v9-hn7-melee-upgrade-higher-level-source.spec.mjs tests/v9-hn7-melee-upgrade-source-packet.spec.mjs
```

Result: source proof 12/12 pass.

READY_FOR_NEXT_TASK: HN7-DATA4 — Steel / Mithril melee upgrade data seed

### Task 172 — V9 HN7-DATA4 Steel / Mithril melee upgrade data seed

Status: `accepted`.

Owner: GLM-style worker + Codex review.

Priority: SRC4 已通过，二/三级近战升级可以进入数据种子。这个任务只写数据，不接 runtime，不做 AI，不扩到远程/护甲/AWT。

Prerequisite: `Task 171 — V9 HN7-SRC4 Steel / Mithril source reconciliation` accepted.

Allowed files:

- `src/game/GameData.ts`
- `tests/v9-hn7-melee-upgrade-higher-level-data-seed.spec.mjs`
- `docs/V9_HN7_BLACKSMITH_ANIMAL_TRAINING_CONTRACT.zh-CN.md`
- `docs/V9_HUMAN_NUMERIC_EXPANSION_PACKET.zh-CN.md`
- `docs/V9_MAINTENANCE_EXPANSION_EVIDENCE_LEDGER.zh-CN.md`
- `docs/GLM_READY_TASK_QUEUE.md` only for closeout sync

Goal:

新增 Steel / Mithril 二、三级近战升级数据种子，并让 Blacksmith 暴露这两项研究。不得改 `Game.ts`。

Required implementation:

1. 在 `RESEARCHES` 中新增 `steel_forged_swords`。
   - `name: '钢剑'`
   - `cost: { gold: 175, lumber: 175 }`
   - `researchTime: 75`
   - `description` 说明近战单位攻击力继续提升
   - `requiresBuilding: 'keep'`
   - `prerequisiteResearch: 'iron_forged_swords'`
   - effects：`footman` / `militia` / `knight` 各 `attackDamage +1`
2. 在 `RESEARCHES` 中新增 `mithril_forged_swords`。
   - `name: '秘银剑'`
   - `cost: { gold: 250, lumber: 300 }`
   - `researchTime: 90`
   - `description` 说明近战单位攻击力最终提升
   - `requiresBuilding: 'castle'`
   - `prerequisiteResearch: 'steel_forged_swords'`
   - effects：`footman` / `militia` / `knight` 各 `attackDamage +1`
3. 把 `BUILDINGS.blacksmith.researches` 扩展为：
   - `long_rifles`
   - `iron_forged_swords`
   - `steel_forged_swords`
   - `mithril_forged_swords`

Required proof:

1. 新增 static proof 文件，证明两条研究数据存在、成本/时间/前置/效果准确。
2. 证明 Blacksmith research list 包含 Long Rifles + Iron + Steel + Mithril。
3. 证明 `Game.ts` 没有出现 `steel_forged_swords` 或 `mithril_forged_swords` 特判。
4. 证明没有新增远程升级、护甲升级、Animal War Training、AI、英雄、空军、物品或素材。
5. 证明 SRC4 source packet 仍存在并允许 DATA4。

Forbidden:

- 不修改 `src/game/Game.ts`。
- 不新增 runtime spec。
- 不写远程升级、护甲升级、Animal War Training、AI、英雄、空军、物品、素材或 dice model。
- 不把 Steel 写成 `attackDamage +2`，不把 Mithril 写成 `attackDamage +3`。

Verification:

```bash
node --test tests/v9-hn7-melee-upgrade-higher-level-data-seed.spec.mjs tests/v9-hn7-melee-upgrade-higher-level-source.spec.mjs tests/v9-hn7-melee-upgrade-data-seed.spec.mjs
npm run build
npx tsc --noEmit -p tsconfig.app.json
FORCE_RUNTIME_CLEANUP=1 ./scripts/cleanup-local-runtime.sh
```

Closeout requirements:
- Start your final closeout with the exact line: JOB_COMPLETE: <job-id>
- If truly blocked, emit the exact line: JOB_BLOCKED: <job-id>
- Include sections for files changed, verification run, and remaining unknowns.
- End with an exact line that begins with READY_FOR_NEXT_TASK: followed by the next safe continuation.
- Keep the work within the requested scope; do not widen ownership on your own.

Codex acceptance:

- GLM 写入 `steel_forged_swords` / `mithril_forged_swords` 和 Blacksmith hook 后停在 proof 修复中；Codex 接管并补齐 `tests/v9-hn7-melee-upgrade-higher-level-data-seed.spec.mjs`。
- Steel 数据：175/175、75 秒、requires Keep、prerequisite Iron、footman/militia/knight 各 `attackDamage +1`。
- Mithril 数据：250/300、90 秒、requires Castle、prerequisite Steel、footman/militia/knight 各 `attackDamage +1`。
- `Game.ts` 没有 Steel / Mithril 特判；未新增远程、护甲、AWT、AI、英雄、空军、物品或素材。

Verification accepted:

```bash
node --test tests/v9-hn7-melee-upgrade-higher-level-data-seed.spec.mjs tests/v9-hn7-melee-upgrade-higher-level-source.spec.mjs tests/v9-hn7-melee-upgrade-data-seed.spec.mjs tests/v9-hn7-melee-upgrade-source-packet.spec.mjs
```

Result: static proof 31/31 pass.

READY_FOR_NEXT_TASK: HN7-IMPL5 — Steel / Mithril runtime smoke

### Task 173 — V9 HN7-IMPL5 Steel / Mithril runtime smoke

Status: `accepted`.

Owner: GLM-style worker + Codex review.

Priority: DATA4 已写入 Steel / Mithril 数据。下一步只验证 runtime 是否能正确消费现有研究模型，不新增任何数据或策略。

Prerequisite: `Task 172 — V9 HN7-DATA4 Steel / Mithril melee upgrade data seed` accepted.

Allowed files:

- `tests/v9-hn7-steel-mithril-runtime.spec.ts`
- `docs/V9_HN7_BLACKSMITH_ANIMAL_TRAINING_CONTRACT.zh-CN.md`
- `docs/V9_HUMAN_NUMERIC_EXPANSION_PACKET.zh-CN.md`
- `docs/V9_MAINTENANCE_EXPANSION_EVIDENCE_LEDGER.zh-CN.md`
- `docs/GLM_READY_TASK_QUEUE.md` only for closeout sync

Goal:

证明 Steel / Mithril 二、三级近战升级能在现有 runtime 中正确出现、禁用、研究、完成并应用效果。不得修改 `src/game/Game.ts` 或 `src/game/GameData.ts`。

Required proof:

1. Blacksmith 命令卡显示 `钢剑` / `秘银剑`。
2. Steel 在缺 Keep 或缺 Iron 时 disabled，并显示可读原因；Iron + Keep 满足后可研究。
3. Mithril 在缺 Castle 或缺 Steel 时 disabled，并显示可读原因；Steel + Castle 满足后可研究。
4. Steel 扣 175/175，Mithril 扣 250/300，并进入研究队列。
5. Iron + Steel + Mithril 完成后，已有 footman / militia / knight 相对基础累计 `attackDamage +3`。
6. 新产出的 footman / knight 继承累计 `+3`。
7. rifleman / mortar_team / priest / sorceress 不受近战升级影响。

Forbidden:

- 不修改 `src/game/Game.ts`。
- 不修改 `src/game/GameData.ts`。
- 不新增远程升级、护甲升级、Animal War Training、AI、英雄、空军、物品、素材或 dice model。

Verification:

```bash
./scripts/run-runtime-tests.sh tests/v9-hn7-steel-mithril-runtime.spec.ts --reporter=list
npm run build
npx tsc --noEmit -p tsconfig.app.json
FORCE_RUNTIME_CLEANUP=1 ./scripts/cleanup-local-runtime.sh
```

Closeout requirements:
- Start your final closeout with the exact line: JOB_COMPLETE: <job-id>
- If truly blocked, emit the exact line: JOB_BLOCKED: <job-id>
- Include sections for files changed, verification run, and remaining unknowns.
- End with an exact line that begins with READY_FOR_NEXT_TASK: followed by the next safe continuation.
- Keep the work within the requested scope; do not widen ownership on your own.

Codex acceptance:

- GLM 写出 `tests/v9-hn7-steel-mithril-runtime.spec.ts` 后直接跑 runtime，因未先 build，浏览器仍用旧 dist，出现假红。
- Codex 中断 GLM 自旋，清理 SM-6 调试痕迹，按 `npm run build` -> focused runtime 顺序复验通过。
- runtime 证明：Blacksmith 显示钢剑/秘银剑；Steel / Mithril 的建筑前置和研究顺序前置生效；扣费正确；三段完成后已有和新产出近战单位累计 +3；非近战不变。

Verification accepted:

```bash
npm run build
./scripts/run-runtime-tests.sh tests/v9-hn7-steel-mithril-runtime.spec.ts --reporter=list
```

Result: build pass; focused runtime 7/7 pass.

READY_FOR_NEXT_TASK: HN7-SRC5 — ranged weapon source reconciliation

### Task 174 — V9 HN7-CLOSE6 melee weapon upgrade chain closure

Status: `accepted`.

Owner: GLM-style worker + Codex review.

Priority: 近战三段升级已完成 source、data 和 runtime。继续扩远程/护甲/AWT 前，先做闭环盘点，防止 HN7 分支边界漂移。

Prerequisite: `Task 173 — V9 HN7-IMPL5 Steel / Mithril runtime smoke` accepted.

Allowed files:

- `tests/v9-hn7-melee-upgrade-chain-closure.spec.mjs`
- `docs/V9_HN7_BLACKSMITH_ANIMAL_TRAINING_CONTRACT.zh-CN.md`
- `docs/V9_HUMAN_NUMERIC_EXPANSION_PACKET.zh-CN.md`
- `docs/V9_MAINTENANCE_EXPANSION_EVIDENCE_LEDGER.zh-CN.md`
- `docs/GLM_READY_TASK_QUEUE.md` only for closeout sync

Goal:

盘点 Human 近战武器三段升级链路是否闭环。这个任务不新增 gameplay，只确认已有证据和下一分支。

Required proof:

1. 证明 HN7-SRC3 / HN7-SRC4 源校验存在。
2. 证明 HN7-DATA3 / HN7-DATA4 数据种子存在：Iron / Steel / Mithril 三段、成本、时间、前置、效果、Blacksmith hook。
3. 证明 HN7-IMPL4 / HN7-IMPL5 runtime smoke 文件存在，并覆盖按钮、扣费、完成效果、新单位继承和非近战不变。
4. 证明远程升级、护甲升级、Animal War Training、AI、英雄、空军、物品、素材仍未落地。
5. 文档结论必须把下一分支写成 HN7-SRC5 ranged weapon source reconciliation 或 HN7-SRC6 armor source reconciliation，不能直接写入远程/护甲数据。

Forbidden:

- 不修改 `src/game/GameData.ts`。
- 不修改 `src/game/Game.ts`。
- 不新增 runtime spec。
- 不写远程升级、护甲升级、Animal War Training、AI、英雄、空军、物品、素材或 dice model。

Verification:

```bash
node --test tests/v9-hn7-melee-upgrade-chain-closure.spec.mjs tests/v9-hn7-melee-upgrade-higher-level-data-seed.spec.mjs tests/v9-hn7-melee-upgrade-higher-level-source.spec.mjs tests/v9-hn7-melee-upgrade-data-seed.spec.mjs tests/v9-hn7-melee-upgrade-source-packet.spec.mjs
npm run build
npx tsc --noEmit -p tsconfig.app.json
FORCE_RUNTIME_CLEANUP=1 ./scripts/cleanup-local-runtime.sh
```

Closeout requirements:
- Start your final closeout with the exact line: JOB_COMPLETE: <job-id>
- If truly blocked, emit the exact line: JOB_BLOCKED: <job-id>
- Include sections for files changed, verification run, and remaining unknowns.
- End with an exact line that begins with READY_FOR_NEXT_TASK: followed by the next safe continuation.
- Keep the work within the requested scope; do not widen ownership on your own.

Codex acceptance:

- GLM closeout 初版把 source 口径写成“多源一致”，Codex 复核后改回 source hierarchy：Blizzard Classic Battle.net 是二、三级主源；Liquipedia 保留为当前资料 / dice bonus 参考；ROC GameFAQs 是旧版冲突样本，不采用。
- Codex 把 closure proof 拆细到 14 条，保证 closeout 的 `14/14` 和实际测试一致。
- 近战三段升级只以数据驱动方式落在 `GameData.ts`，`Game.ts` 没有 Iron / Steel / Mithril 特判。

Verification accepted:

```bash
node --test tests/v9-hn7-melee-upgrade-chain-closure.spec.mjs tests/v9-hn7-melee-upgrade-higher-level-data-seed.spec.mjs tests/v9-hn7-melee-upgrade-higher-level-source.spec.mjs tests/v9-hn7-melee-upgrade-data-seed.spec.mjs tests/v9-hn7-melee-upgrade-source-packet.spec.mjs
npm run build
npx tsc --noEmit -p tsconfig.app.json
```

Result: closure proof 14/14; combined static proof 45/45; build pass; tsc pass.

READY_FOR_NEXT_TASK: HN7-SRC5 — ranged weapon source reconciliation

### Task 175 — V9 HN7-SRC5 ranged weapon source reconciliation

Status: `accepted`.

Owner: GLM-style worker + Codex source review.

Priority: 近战三段升级已正式闭环。继续扩 Blacksmith 前，下一张只能做远程武器升级源校验，避免直接把远程三段数值伪造进数据表。

Prerequisite: `Task 174 — V9 HN7-CLOSE6 melee weapon upgrade chain closure` accepted.

Allowed files:

- `docs/V9_HN7_RANGED_UPGRADE_SOURCE_PACKET.zh-CN.md`
- `tests/v9-hn7-ranged-upgrade-source.spec.mjs`
- `docs/V9_HUMAN_NUMERIC_EXPANSION_PACKET.zh-CN.md`
- `docs/V9_MAINTENANCE_EXPANSION_EVIDENCE_LEDGER.zh-CN.md`
- `docs/GLM_READY_TASK_QUEUE.md` only for closeout sync

Goal:

核对 Human Blacksmith 远程武器三段升级的来源、成本、时间、前置、影响单位和当前项目映射。这个任务只做 source reconciliation，不写数据、不改 runtime。

Required proof:

1. 明确主源、交叉校验源、冲突样本和不采用来源；如果无法访问来源，必须 `JOB_BLOCKED`，不能凭记忆补数值。
2. 写清楚三段远程升级 key / 中文名建议 / cost / researchTime / requiresBuilding / prerequisiteResearch。
3. 写清楚当前项目中哪些已存在单位允许受影响，哪些 War3 单位因项目尚未存在而不得落地。
4. 写清楚当前项目没有 dice / projectile upgrade 细分模型时，DATA5 应使用什么 incremental 标量映射。
5. 写清楚下一张最多只能是 `HN7-DATA5 — ranged weapon upgrade data seed`，不能直接做 runtime、AI、护甲、Animal War Training、英雄、空军、物品或素材。

Forbidden:

- 不修改 `src/game/GameData.ts`。
- 不修改 `src/game/Game.ts`。
- 不新增 runtime spec。
- 不写远程升级数据、护甲升级数据、Animal War Training、AI、英雄、空军、物品、素材或 dice model。
- 不把“记录过的来源”写成“来源一致”；必须区分主源 / 交叉校验 / 冲突样本。

Verification:

```bash
node --test tests/v9-hn7-ranged-upgrade-source.spec.mjs tests/v9-hn7-melee-upgrade-chain-closure.spec.mjs
npm run build
npx tsc --noEmit -p tsconfig.app.json
```

Closeout requirements:
- Start your final closeout with the exact line: JOB_COMPLETE: <job-id>
- If truly blocked, emit the exact line: JOB_BLOCKED: <job-id>
- Include sections for files changed, verification run, and remaining unknowns.
- End with an exact line that begins with READY_FOR_NEXT_TASK: followed by the next safe continuation.
- Keep the work within the requested scope; do not widen ownership on your own.

Codex acceptance:

- GLM 先产出独立 `docs/V9_HN7_RANGED_UPGRADE_SOURCE_PACKET.zh-CN.md` 和 `tests/v9-hn7-ranged-upgrade-source.spec.mjs`，但初版 proof 自相矛盾：文档需要说明“不要把 +2/+3 直接写成 FlatDelta”，测试却禁止出现 `attackDamage +2` 字样。
- Codex 接管后修正为 source hierarchy：Blizzard Classic Battle.net 是 hard values 主源；Liquipedia 是当前资料交叉校验；GameFAQs / Wowpedia 不参与 hard values，不写成“所有来源完全一致”。
- DATA5 只允许写当前项目存在的 `rifleman` 和 `mortar_team`；Siege Engine / Flying Machine 因项目不存在，不写 effect。

Verification accepted:

```bash
node --test tests/v9-hn7-ranged-upgrade-source.spec.mjs tests/v9-hn7-melee-upgrade-chain-closure.spec.mjs
npm run build
npx tsc --noEmit -p tsconfig.app.json
```

Result: source proof 11/11 + melee closure proof 14/14 = 25/25; build pass; tsc pass.

READY_FOR_NEXT_TASK: HN7-DATA5 — ranged weapon upgrade data seed

### Task 176 — V9 HN7-DATA5 ranged weapon upgrade data seed

Status: `accepted`.

Owner: GLM-style worker + Codex takeover.

Priority: HN7-SRC5 已固定远程武器三段来源和项目映射。下一张只写数据种子，把远程升级接到 Blacksmith research list，仍不改 runtime。

Prerequisite: `Task 175 — V9 HN7-SRC5 ranged weapon source reconciliation` accepted.

Allowed files:

- `src/game/GameData.ts`
- `tests/v9-hn7-ranged-upgrade-data-seed.spec.mjs`
- `docs/V9_HUMAN_NUMERIC_EXPANSION_PACKET.zh-CN.md`
- `docs/V9_MAINTENANCE_EXPANSION_EVIDENCE_LEDGER.zh-CN.md`
- `docs/GLM_READY_TASK_QUEUE.md` only for closeout sync

Goal:

按 HN7-SRC5 写入 Human Blacksmith 远程武器三段升级数据种子：

1. `black_gunpowder` / `黑火药`：100 gold / 50 lumber，60 秒，requires Blacksmith，无 prerequisiteResearch。
2. `refined_gunpowder` / `精炼火药`：175 gold / 175 lumber，75 秒，requires Keep，prerequisite `black_gunpowder`。
3. `imbued_gunpowder` / `附魔火药`：250 gold / 300 lumber，90 秒，requires Castle，prerequisite `refined_gunpowder`。
4. 每级对 `rifleman` 和 `mortar_team` 各应用 `attackDamage +1`。
5. `BUILDINGS.blacksmith.researches` 在现有 long_rifles + melee 三段基础上追加 ranged 三段。

Forbidden:

- 不修改 `src/game/Game.ts`。
- 不新增 runtime spec。
- 不写护甲升级、Animal War Training、AI、英雄、空军、物品、素材或 dice model。
- 不给项目不存在的 Siege Engine / Flying Machine 添加 effect。
- 不改已有 melee 三段数值、Long Rifles 或 Knight / Sorceress 数据。

Verification:

```bash
node --test tests/v9-hn7-ranged-upgrade-data-seed.spec.mjs tests/v9-hn7-ranged-upgrade-source.spec.mjs tests/v9-hn7-melee-upgrade-chain-closure.spec.mjs
npm run build
npx tsc --noEmit -p tsconfig.app.json
```

Closeout requirements:
- Start your final closeout with the exact line: JOB_COMPLETE: <job-id>
- If truly blocked, emit the exact line: JOB_BLOCKED: <job-id>
- Include sections for files changed, verification run, and remaining unknowns.
- End with an exact line that begins with READY_FOR_NEXT_TASK: followed by the next safe continuation.
- Keep the work within the requested scope; do not widen ownership on your own.

Codex acceptance:

- GLM 写入了 `black_gunpowder` / `refined_gunpowder` / `imbued_gunpowder` 和 Blacksmith research list hook，但停在 proof 阶段，没有完成 closeout。
- Codex 接管后新增 `tests/v9-hn7-ranged-upgrade-data-seed.spec.mjs`，并修正 melee closure proof，使 Blacksmith 可继续追加远程研究而不误判。
- DATA5 只接受当前项目存在的 `rifleman` 和 `mortar_team` 每级 `attackDamage +1`；没有给 Siege Engine / Flying Machine 写 effect，也没有改 `Game.ts`。

Verification accepted:

```bash
node --test tests/v9-hn7-ranged-upgrade-data-seed.spec.mjs tests/v9-hn7-ranged-upgrade-source.spec.mjs tests/v9-hn7-melee-upgrade-chain-closure.spec.mjs
npm run build
npx tsc --noEmit -p tsconfig.app.json
```

Result: ranged data proof 10/10 + ranged source proof 11/11 + melee closure proof 14/14 = 35/35; build pass; tsc pass.

READY_FOR_NEXT_TASK: HN7-IMPL6 — ranged weapon runtime smoke

### Task 177 — V9 HN7-IMPL6 ranged weapon runtime smoke

Status: `accepted`.

Owner: GLM-style worker + Codex review.

Priority: HN7-DATA5 已把远程三段火药研究写进数据表。下一步只证明现有研究 runtime 能正确消费这些数据，不扩大到护甲、Animal War Training、AI、英雄、空军、物品或素材。

Prerequisite: `Task 176 — V9 HN7-DATA5 ranged weapon upgrade data seed` accepted.

Allowed files:

- `tests/v9-hn7-ranged-upgrade-runtime.spec.ts`
- `docs/V9_HUMAN_NUMERIC_EXPANSION_PACKET.zh-CN.md`
- `docs/V9_MAINTENANCE_EXPANSION_EVIDENCE_LEDGER.zh-CN.md`
- `docs/GLM_READY_TASK_QUEUE.md` only for closeout sync

Goal:

用 focused runtime smoke 证明 Blacksmith 远程武器三段升级已经真实可用：

1. Blacksmith 命令卡显示 `黑火药` / `精炼火药` / `附魔火药`。
2. Black Gunpowder 只需要 Blacksmith；Refined Gunpowder 没有 Keep 或没完成 Black 时禁用；Imbued Gunpowder 没有 Castle 或没完成 Refined 时禁用。
3. 研究扣费分别为 100/50、175/175、250/300，并进入正常 research queue。
4. 三段完成后，已有 `rifleman` 和 `mortar_team` 累计 `attackDamage +3`。
5. 新训练的 `rifleman` 和 `mortar_team` 继承累计 +3。
6. `footman`、`militia`、`knight`、`priest`、`sorceress` 不受远程火药影响。

Forbidden:

- 不修改 `src/game/GameData.ts`。
- 不修改 `src/game/Game.ts`，除非 runtime proof 暴露真实 bug；若发现真实 bug，先停止并交给 Codex 接管。
- 不写护甲升级、Animal War Training、AI 升级策略、英雄、空军、物品、素材或 dice model。
- 不改已有 melee 三段数值、Long Rifles、Knight、Sorceress 或 ability 数据。

Verification:

```bash
npm run build
./scripts/run-runtime-tests.sh tests/v9-hn7-ranged-upgrade-runtime.spec.ts --reporter=list
npx tsc --noEmit -p tsconfig.app.json
```

Important: run `npm run build` before the runtime proof, otherwise stale `dist/` can create a false red.

Closeout requirements:
- Start your final closeout with the exact line: JOB_COMPLETE: <job-id>
- If truly blocked, emit the exact line: JOB_BLOCKED: <job-id>
- Include sections for files changed, verification run, and remaining unknowns.
- End with an exact line that begins with READY_FOR_NEXT_TASK: followed by the next safe continuation.
- Keep the work within the requested scope; do not widen ownership on your own.

Codex acceptance:

- GLM 新增 `tests/v9-hn7-ranged-upgrade-runtime.spec.ts`，覆盖远程三段按钮、研究前置、扣费、已有单位累计 +3、新产出继承 +3 和非远程单位不变。
- 初版 RU-2 因同一页面内状态泄漏误判，GLM 后续把前置场景拆开修正；这是测试隔离问题，不是产品逻辑问题。
- GLM 在更新队列时遇到 API/network error，Codex 接管队列和文档收口。

Verification accepted:

```bash
npm run build
./scripts/run-runtime-tests.sh tests/v9-hn7-ranged-upgrade-runtime.spec.ts --reporter=list
npx tsc --noEmit -p tsconfig.app.json
```

Result: focused runtime 7/7; build pass; tsc pass.

READY_FOR_NEXT_TASK: HN7-CLOSE7 — ranged weapon upgrade chain closure inventory

### Task 178 — V9 HN7-CLOSE7 ranged weapon upgrade chain closure

Status: `accepted`.

Owner: GLM-style worker + Codex review.

Priority: SRC5、DATA5、IMPL6 已分别完成。下一步只做远程武器升级闭环盘点，把来源、数据、runtime proof、禁区和下一张相邻任务整理成可复查证据。

Prerequisite: `Task 177 — V9 HN7-IMPL6 ranged weapon runtime smoke` accepted.

Allowed files:

- `tests/v9-hn7-ranged-upgrade-chain-closure.spec.mjs`
- `docs/V9_HUMAN_NUMERIC_EXPANSION_PACKET.zh-CN.md`
- `docs/V9_MAINTENANCE_EXPANSION_EVIDENCE_LEDGER.zh-CN.md`
- `docs/V9_MAINTENANCE_EXPANSION_REMAINING_GATES.zh-CN.md`
- `docs/GLM_READY_TASK_QUEUE.md` only for closeout sync

Goal:

做远程武器升级链路 closure inventory，不新增 gameplay：

1. 证明 SRC5 远程武器来源包存在，并保留 Blizzard 主源 + Liquipedia 交叉校验口径。
2. 证明 DATA5 三段数据存在，且只影响 `rifleman` / `mortar_team`。
3. 证明 IMPL6 runtime 文件覆盖按钮、前置、扣费、累计 +3、新单位继承和非远程不变。
4. 证明 `Game.ts` 没有 Gunpowder 特判。
5. 证明护甲升级、Animal War Training、AI、英雄、空军、物品、素材仍未落地。
6. 写清楚下一张最多只能是 `HN7-SRC6 — armor upgrade source reconciliation`，不能直接写护甲数据或 AWT。

Forbidden:

- 不修改 `src/game/Game.ts`。
- 不修改 `src/game/GameData.ts`。
- 不新增 runtime spec。
- 不写护甲升级数据、Animal War Training、AI、英雄、空军、物品、素材或 dice model。
- 不改已有 melee / ranged / Long Rifles / Knight / Sorceress 数据。

Verification:

```bash
node --test tests/v9-hn7-ranged-upgrade-chain-closure.spec.mjs tests/v9-hn7-ranged-upgrade-data-seed.spec.mjs tests/v9-hn7-ranged-upgrade-source.spec.mjs
npm run build
npx tsc --noEmit -p tsconfig.app.json
```

Closeout requirements:
- Start your final closeout with the exact line: JOB_COMPLETE: <job-id>
- If truly blocked, emit the exact line: JOB_BLOCKED: <job-id>
- Include sections for files changed, verification run, and remaining unknowns.
- End with an exact line that begins with READY_FOR_NEXT_TASK: followed by the next safe continuation.
- Keep the work within the requested scope; do not widen ownership on your own.

Codex acceptance:

- GLM 新增 `tests/v9-hn7-ranged-upgrade-chain-closure.spec.mjs`，把 SRC5、DATA5、IMPL6 的证据串成 closure inventory。
- 初版 proof 因直引号 / 智能引号匹配失败，GLM 已修正；Codex 额外更新 melee closure 的“当前相邻任务”断言，避免旧 proof 卡住已推进的 HN7-SRC6 状态。

Verification accepted:

```bash
node --test tests/v9-hn7-ranged-upgrade-chain-closure.spec.mjs tests/v9-hn7-ranged-upgrade-data-seed.spec.mjs tests/v9-hn7-ranged-upgrade-source.spec.mjs tests/v9-hn7-melee-upgrade-chain-closure.spec.mjs
npm run build
./scripts/run-runtime-tests.sh tests/v9-hn7-ranged-upgrade-runtime.spec.ts --reporter=list
npx tsc --noEmit -p tsconfig.app.json
```

Result: static closure/source/data proof 49/49; focused runtime 7/7; build pass; tsc pass.

READY_FOR_NEXT_TASK: HN7-SRC6 — armor upgrade source reconciliation

### Task 179 — V9 HN7-SRC6 armor upgrade source reconciliation

Status: `accepted`.

Owner: GLM-style worker + Codex review.

Priority: HN7 ranged chain is closed. The next adjacent Blacksmith branch is Human armor upgrades, but armor values must be sourced before any data seed.

Prerequisite: `Task 178 — V9 HN7-CLOSE7 ranged weapon upgrade chain closure` accepted.

Allowed files:

- `docs/V9_HN7_ARMOR_UPGRADE_SOURCE_PACKET.zh-CN.md`
- `tests/v9-hn7-armor-upgrade-source.spec.mjs`
- `docs/V9_HN7_BLACKSMITH_ANIMAL_TRAINING_CONTRACT.zh-CN.md`
- `docs/V9_HUMAN_NUMERIC_EXPANSION_PACKET.zh-CN.md`
- `docs/V9_MAINTENANCE_EXPANSION_EVIDENCE_LEDGER.zh-CN.md`
- `docs/GLM_READY_TASK_QUEUE.md` only for closeout sync

Goal:

核对 Human Blacksmith armor upgrade chain 的来源和项目映射，只做 source packet：

1. 找出 Human 护甲升级三段的 canonical names、cost、research time、building/tier requirement、ordered prerequisite 和 source wording。
2. 明确 adopted source hierarchy。优先使用 Blizzard Classic Battle.net；Liquipedia / 其他资料只做交叉校验或冲突记录。
3. 明确当前项目允许的目标单位映射，只能落到项目已存在且来源可解释的单位。
4. 记录项目不存在单位（例如 air / siege / late roster）如何处理：只能文档说明，不能写 effect。
5. 写清楚下一张最多只能是 `HN7-DATA6 — armor upgrade data seed`，不能直接做 runtime、AWT、AI 或素材。

Forbidden:

- 不修改 `src/game/GameData.ts`。
- 不修改 `src/game/Game.ts`。
- 不新增 runtime spec。
- 不写任何 armor upgrade data seed。
- 不写 Animal War Training、AI、英雄、空军、物品、素材或 dice / armor-type 新模型。
- 不改 melee / ranged / Long Rifles / Knight / Sorceress / ability 数据。
- 如果资料无法稳定核对，标记 blocked，不要编造数值。

Verification:

```bash
node --test tests/v9-hn7-armor-upgrade-source.spec.mjs
npm run build
npx tsc --noEmit -p tsconfig.app.json
```

Closeout requirements:
- Start your final closeout with the exact line: JOB_COMPLETE: <job-id>
- If truly blocked, emit the exact line: JOB_BLOCKED: <job-id>
- Include sections for files changed, verification run, and remaining unknowns.
- End with an exact line that begins with READY_FOR_NEXT_TASK: followed by the next safe continuation.
- Keep the work within the requested scope; do not widen ownership on your own.

Codex acceptance:

- GLM 新增 `docs/V9_HN7_ARMOR_UPGRADE_SOURCE_PACKET.zh-CN.md` 和 `tests/v9-hn7-armor-upgrade-source.spec.mjs`，把 Human Blacksmith Plating / Leather 两条护甲升级线先分开。
- Codex 对照 Blizzard Classic Battle.net Blacksmith 页面复核 Plating 三段成本、时间和前置：Iron 125/75/60s；Steel 150/175/75s + Keep；Mithril 175/275/90s + Castle。
- DATA6 边界已固定：只写 Plating 三段，当前项目只影响 Heavy armor 单位 `footman` / `militia` / `knight`；Leather Armor 因当前 `rifleman` / `mortar_team` 仍是 Unarmored，留待单独模型迁移判断。

Verification accepted:

```bash
node --test tests/v9-hn7-armor-upgrade-source.spec.mjs
npm run build
npx tsc --noEmit -p tsconfig.app.json
```

Result: source proof 12/12; build pass; tsc pass.

READY_FOR_NEXT_TASK: HN7-DATA6 — Plating armor upgrade data seed

### Task 180 — V9 HN7-DATA6 Plating armor upgrade data seed

Status: `accepted`.

Owner: GLM-style worker + Codex review.

Priority: Task179 has accepted the Plating armor source packet. The next adjacent work is a data seed only, before any runtime smoke or Animal War Training work.

Prerequisite: `Task 179 — V9 HN7-SRC6 armor upgrade source reconciliation` accepted.

Allowed files:

- `src/game/GameData.ts`
- `tests/v9-hn7-armor-upgrade-data-seed.spec.mjs`
- `docs/V9_HUMAN_NUMERIC_EXPANSION_PACKET.zh-CN.md`
- `docs/V9_MAINTENANCE_EXPANSION_EVIDENCE_LEDGER.zh-CN.md`
- `docs/V9_MAINTENANCE_EXPANSION_REMAINING_GATES.zh-CN.md`
- `docs/GLM_READY_TASK_QUEUE.md` only for closeout sync

Goal:

把 Plating 三段护甲升级写成数据种子，完全复用现有 `ResearchDef` / `ResearchEffectType.FlatDelta` 模型，不改 runtime：

1. 新增 `iron_plating` / `steel_plating` / `mithril_plating` 三个 research。
2. 数值必须来自 Task179 source packet：Iron 125/75/60s；Steel 150/175/75s + Keep + `prerequisiteResearch: 'iron_plating'`；Mithril 175/275/90s + Castle + `prerequisiteResearch: 'steel_plating'`。
3. 每一级只给当前 Heavy armor 单位 `footman` / `militia` / `knight` 增加 `{ stat: 'armor', value: 2 }`。
4. Blacksmith `researches` 列表追加 Plating 三段，同时保留 Long Rifles、近战三段和远程三段。
5. 写静态 proof，证明数据来自 source packet、范围没有越界、`Game.ts` 没有 Plating 特判。

Forbidden:

- 不修改 `src/game/Game.ts`。
- 不新增 runtime spec。
- 不写 Leather Armor / Studded / Reinforced / Dragonhide 数据。
- 不改 `rifleman` / `mortar_team` 的 `armorType`。
- 不写 Animal War Training。
- 不改 AI、英雄、空军、物品、素材或完整护甲模型。
- 不改 melee / ranged / Long Rifles / Knight / Sorceress / ability 既有数据，除非 proof 发现必须保留格式。

Must prove:

1. 三个 Plating research key、中文名、成本、时间和前置存在。
2. 三段值与 `docs/V9_HN7_ARMOR_UPGRADE_SOURCE_PACKET.zh-CN.md` 对齐。
3. 每段 effect 只包含 `footman` / `militia` / `knight`，每个 effect 都是 `armor` +2。
4. 不包含 Spell Breaker、Siege Engine、Flying Machine、Rifleman、Mortar Team、Priest、Sorceress、Worker 的 Plating effect。
5. 不包含 Leather Armor、Animal War Training、英雄、空军、物品或素材相关数据。
6. Blacksmith research list 包含 Long Rifles、近战三段、远程三段和 Plating 三段。
7. `src/game/Game.ts` 不出现 `iron_plating` / `steel_plating` / `mithril_plating` 特判。

Verification:

```bash
node --test tests/v9-hn7-armor-upgrade-data-seed.spec.mjs
npm run build
npx tsc --noEmit -p tsconfig.app.json
```

Closeout requirements:
- Start your final closeout with the exact line: JOB_COMPLETE: <job-id>
- If truly blocked, emit the exact line: JOB_BLOCKED: <job-id>
- Include sections for files changed, verification run, and remaining unknowns.
- End with an exact line that begins with READY_FOR_NEXT_TASK: followed by the next safe continuation.
- Keep the work within the requested scope; do not widen ownership on your own.

Codex acceptance:

- GLM 写入 `RESEARCHES.iron_plating`、`RESEARCHES.steel_plating`、`RESEARCHES.mithril_plating`，并把 Blacksmith research list 追加 Plating 三段。
- GLM 初版 proof 9/9 通过，但 source proof 仍包含“DATA6 之前数据不存在”的旧断言；Codex 接管后把 source proof 改成验证 SRC6 source-only 边界与 DATA6 handoff，避免 DATA6 完成后联合 proof 失效。
- Codex 补强 DATA6 proof：不只检查成本字符串，也检查 source packet 里的 key、researchTime、requiresBuilding 和 ordered prerequisite。

Verification accepted:

```bash
node --test tests/v9-hn7-armor-upgrade-data-seed.spec.mjs tests/v9-hn7-armor-upgrade-source.spec.mjs
npm run build
npx tsc --noEmit -p tsconfig.app.json
```

Result: armor data + source proof 21/21; build pass; tsc pass.

READY_FOR_NEXT_TASK: HN7-IMPL7 — Plating armor upgrade runtime smoke

### Task 181 — V9 HN7-IMPL7 Plating armor upgrade runtime smoke

Status: `accepted`.

Owner: GLM-style worker + Codex takeover.

Priority: Task180 accepted the Plating data seed. The next adjacent work is to prove the existing runtime consumes that data correctly, without changing product code first.

Prerequisite: `Task 180 — V9 HN7-DATA6 Plating armor upgrade data seed` accepted.

Allowed files:

- `tests/v9-hn7-plating-upgrade-runtime.spec.ts`
- `docs/V9_HUMAN_NUMERIC_EXPANSION_PACKET.zh-CN.md`
- `docs/V9_MAINTENANCE_EXPANSION_EVIDENCE_LEDGER.zh-CN.md`
- `docs/V9_MAINTENANCE_EXPANSION_REMAINING_GATES.zh-CN.md`
- `docs/GLM_READY_TASK_QUEUE.md` only for closeout sync

Goal:

只写 focused runtime smoke，证明当前 runtime 已经能消费 Plating 三段数据：

1. Blacksmith 命令卡显示 `铁甲`、`钢甲`、`秘银甲`。
2. Steel Plating 在缺 Keep 或未完成 Iron 时禁用；满足 Keep + Iron 后可用。
3. Mithril Plating 在缺 Castle 或未完成 Steel 时禁用；满足 Castle + Steel 后可用。
4. 三段研究扣费分别为 125/75、150/175、175/275，并进入真实研究队列。
5. 三段完成后，已有 `footman` / `militia` / `knight` 累计 `armor +6`。
6. 三段完成后，新训练或新生成的 Heavy 单位继承累计 `armor +6`。
7. `rifleman` / `mortar_team` / `priest` / `sorceress` / `worker` 不受 Plating 影响。

Forbidden:

- 不修改 `src/game/Game.ts`、`src/game/GameData.ts` 或其他产品代码。
- 不新增或修改 static source/data proof。
- 不写 Leather Armor、Animal War Training、AI 升级策略、英雄、空军、物品、素材或完整护甲模型。
- 不用直接改 `completedResearches` 冒充真实研究完成；如需加速，必须通过现有 test helper / real queue tick，并在断言前重新读取 fresh runtime state。
- 如果现有 runtime 不能消费 Plating 数据，标记 blocked，并给出最小失败证据；不要在本任务里顺手修产品代码。

Verification:

```bash
npm run build
./scripts/run-runtime-tests.sh tests/v9-hn7-plating-upgrade-runtime.spec.ts --reporter=list
npx tsc --noEmit -p tsconfig.app.json
```

Closeout requirements:
- Start your final closeout with the exact line: JOB_COMPLETE: <job-id>
- If truly blocked, emit the exact line: JOB_BLOCKED: <job-id>
- Include sections for files changed, verification run, and remaining unknowns.
- End with an exact line that begins with READY_FOR_NEXT_TASK: followed by the next safe continuation.
- Keep the work within the requested scope; do not widen ownership on your own.

Codex acceptance:

- GLM wrote the initial runtime smoke but narrowed PL-1 from three Plating buttons to only `铁甲` after discovering a command-card limit.
- Codex treated that as a real product blocker, not as permission to weaken the contract: `Game.ts` now renders a fixed 16-slot command card and `src/styles.css` uses a 4x4 grid so Blacksmith can expose current and adjacent research buttons.
- `tests/v9-hn7-plating-upgrade-runtime.spec.ts` now proves `铁甲`、`钢甲`、`秘银甲` are all visible, and uses `startResearch` + real queue ticks instead of writing `completedResearches`.
- Verification accepted by Codex: Plating runtime 7/7, affected HUD/cleanup/construction pack 20/20, armor source+data 21/21, `npm run build`, and `npx tsc --noEmit -p tsconfig.app.json`.

READY_FOR_NEXT_TASK: HN7-CLOSE8 — Plating armor upgrade chain closure inventory

### Task 182 — V9 HN7-CLOSE8 Plating armor upgrade chain closure

Status: `accepted`.

Owner: GLM-style worker + Codex review.

Priority: Task181 accepted the runtime behavior and also fixed the command-card capacity blocker. The next adjacent work is to close the Plating chain with a static inventory before moving to Leather Armor or Animal War Training.

Prerequisite: `Task 181 — V9 HN7-IMPL7 Plating armor upgrade runtime smoke` accepted.

Allowed files:

- `tests/v9-hn7-plating-upgrade-chain-closure.spec.mjs`
- `docs/V9_HUMAN_NUMERIC_EXPANSION_PACKET.zh-CN.md`
- `docs/V9_MAINTENANCE_EXPANSION_EVIDENCE_LEDGER.zh-CN.md`
- `docs/V9_MAINTENANCE_EXPANSION_REMAINING_GATES.zh-CN.md`
- `docs/GLM_READY_TASK_QUEUE.md` only for closeout sync

Goal:

产出 HN7 Plating 护甲升级闭环盘点，只做静态 closure inventory，不新增运行时代码：

1. 证明 SRC6 source packet 已固定 Iron / Steel / Mithril Plating 的成本、时间、建筑前置、研究顺序和 Heavy-only 影响范围。
2. 证明 DATA6 数据种子已落地，三段 key / name / cost / researchTime / requiresBuilding / prerequisiteResearch / effects 均对齐 source。
3. 证明 IMPL7 runtime smoke 文件存在并覆盖命令卡三按钮、前置禁用、扣费、累计 `armor +6`、新单位继承和非 Heavy 不变。
4. 证明命令卡容量问题已经作为 IMPL7/Task198 的产品修复记录：固定 16 格，不再截断当前 Blacksmith 13 个研究按钮。
5. 明确仍未落地：Leather Armor、Animal War Training、AI 升级策略、英雄、空军、物品、素材、完整护甲模型。

Forbidden:

- 不修改 `src/game/Game.ts`、`src/game/GameData.ts` 或其他产品代码。
- 不新增 Leather Armor、Animal War Training、AI 升级策略、英雄、空军、物品、素材或新 runtime smoke。
- 不把 Task181 说成纯 GLM accepted；必须记录 Codex takeover 修复命令卡容量后才 accepted。
- 不扩大到完整 Blacksmith / Human tech tree closure；只关 Plating chain。

Verification:

```bash
node --test tests/v9-hn7-plating-upgrade-chain-closure.spec.mjs tests/v9-hn7-armor-upgrade-data-seed.spec.mjs tests/v9-hn7-armor-upgrade-source.spec.mjs
npm run build
npx tsc --noEmit -p tsconfig.app.json
```

Closeout requirements:
- Start your final closeout with the exact line: JOB_COMPLETE: <job-id>
- If truly blocked, emit the exact line: JOB_BLOCKED: <job-id>
- Include sections for files changed, verification run, and remaining unknowns.
- End with an exact line that begins with READY_FOR_NEXT_TASK: followed by the next safe continuation.
- Keep the work within the requested scope; do not widen ownership on your own.

Codex acceptance:

- GLM wrote `tests/v9-hn7-plating-upgrade-chain-closure.spec.mjs`, but its final verification used tail-truncated output.
- Codex strengthened the closure proof so command-card capacity is proven directly from `Game.ts` and `src/styles.css`, not only from vague docs wording.
- Codex local verification accepted: Plating closure 14/14, combined closure + DATA6 + SRC6 35/35, `npm run build`, and `npx tsc --noEmit -p tsconfig.app.json`.

READY_FOR_NEXT_TASK: HN7-SRC7 — Animal War Training source reconciliation

### Task 183 — V9 HN7-SRC7 Animal War Training source reconciliation

Status: `accepted`.

Owner: GLM-style worker + Codex review.

Priority: Plating chain is now closed. The next adjacent HN7 branch is Animal War Training source reconciliation because maxHp effect support already exists, but no AWT source packet or data seed is accepted.

Prerequisite: `Task 182 — V9 HN7-CLOSE8 Plating armor upgrade chain closure` accepted.

Allowed files:

- `docs/V9_HN7_ANIMAL_WAR_TRAINING_SOURCE_PACKET.zh-CN.md`
- `docs/V9_HUMAN_NUMERIC_EXPANSION_PACKET.zh-CN.md`
- `docs/V9_MAINTENANCE_EXPANSION_EVIDENCE_LEDGER.zh-CN.md`
- `docs/V9_MAINTENANCE_EXPANSION_REMAINING_GATES.zh-CN.md`
- `tests/v9-hn7-animal-war-training-source.spec.mjs`
- `docs/GLM_READY_TASK_QUEUE.md` only for closeout sync

Goal:

只做 Animal War Training 来源核对和当前项目映射，不写数据：

1. 核对 War3 Human Animal War Training 的成本、研究时间、建筑/科技前置、效果和影响单位范围。
2. 明确主源、交叉校验源和冲突/不采用来源；不能写成“所有来源完全一致”，除非证据真的支持。
3. 映射到当前项目已有单位：当前可考虑 `knight`，但不能凭空写 `gryphon` / `dragonhawk` / 其他空军数据。
4. 明确 DATA7 后续只能写 AWT 数据种子，不得顺手实现 runtime、AI 升级、英雄、空军、物品或素材。
5. 新增 static proof，证明 source packet 有来源层级、数值、前置、影响范围、当前项目映射和禁区。

Forbidden:

- 不修改 `src/game/Game.ts`、`src/game/GameData.ts` 或其他产品代码。
- 不新增 `animal_war_training` 数据种子。
- 不实现 AWT runtime、AI 升级策略、英雄、空军、物品或素材。
- 不把 Leather Armor 混进 AWT；Leather Armor 另开分支。
- 不外推没有来源证据的数值。

Verification:

```bash
node --test tests/v9-hn7-animal-war-training-source.spec.mjs
npm run build
npx tsc --noEmit -p tsconfig.app.json
```

Closeout requirements:
- Start your final closeout with the exact line: JOB_COMPLETE: <job-id>
- If truly blocked, emit the exact line: JOB_BLOCKED: <job-id>
- Include sections for files changed, verification run, and remaining unknowns.
- End with an exact line that begins with READY_FOR_NEXT_TASK: followed by the next safe continuation.
- Keep the work within the requested scope; do not widen ownership on your own.

Codex acceptance:

- GLM wrote the AWT source packet but returned to prompt before creating the proof or closeout.
- Codex tightened the source packet: Classic Battle.net old 125/175 cost is documented as a conflict, current hard values come from Liquipedia, and DATA7 is blocked until the research model can express multiple building prerequisites.
- Codex local verification accepted: source proof 14/14, `npm run build`, and `npx tsc --noEmit -p tsconfig.app.json`.

READY_FOR_NEXT_TASK: HN7-MODEL8 — Research multi-building prerequisite model

### Task 184 — V9 HN7-MODEL8 Research multi-building prerequisite model

Status: `accepted`.

Owner: GLM-style worker + Codex review.

Priority: Task183 accepted AWT source values and found a real model gap. AWT needs Barracks as the research building plus Castle + Lumber Mill + Blacksmith as completed-building prerequisites; current `ResearchDef.requiresBuilding?: string` can only express one completed building.

Prerequisite: `Task 183 — V9 HN7-SRC7 Animal War Training source reconciliation` accepted.

Allowed files:

- `src/game/GameData.ts`
- `src/game/Game.ts`
- `tests/v9-hn7-research-multi-building-prereq.spec.ts`
- `docs/V9_HN7_ANIMAL_WAR_TRAINING_SOURCE_PACKET.zh-CN.md`
- `docs/V9_HUMAN_NUMERIC_EXPANSION_PACKET.zh-CN.md`
- `docs/V9_MAINTENANCE_EXPANSION_EVIDENCE_LEDGER.zh-CN.md`
- `docs/V9_MAINTENANCE_EXPANSION_REMAINING_GATES.zh-CN.md`
- `docs/GLM_READY_TASK_QUEUE.md` only for closeout sync

Goal:

只补研究的多建筑前置模型，不写 Animal War Training 数据：

1. 给 `ResearchDef` 增加一个可表达多个完成建筑前置的字段，例如 `requiresBuildings?: string[]`。
2. `getResearchAvailability` / `startResearch` 必须消费这个字段；缺任意前置建筑时研究不可开始。
3. 缺多个建筑时，玩家可读原因必须说明缺少哪些建筑，不能只显示第一个，也不能显示内部 key。
4. 旧的 `requiresBuilding?: string` 语义必须保持，现有 Long Rifles、近战、远程、Plating 研究不可回退。
5. 新增 focused runtime proof，只用测试内临时研究或现有研究做模型证明，不新增 `RESEARCHES.animal_war_training`。

Forbidden:

- 不新增 `RESEARCHES.animal_war_training`。
- 不把 AWT 加入 Barracks 命令卡。
- 不实现 AWT runtime、AI 升级策略、英雄、空军、物品或素材。
- 不改 Knight / Castle / Blacksmith / Plating / Gunpowder 的数值。
- 不把多建筑前置写成只检查 Castle 的假简化。

Verification:

```bash
npm run build
npx tsc --noEmit -p tsconfig.app.json
./scripts/run-runtime-tests.sh tests/v9-hn7-research-multi-building-prereq.spec.ts --reporter=list
```

Closeout requirements:
- Start your final closeout with the exact line: JOB_COMPLETE: <job-id>
- If truly blocked, emit the exact line: JOB_BLOCKED: <job-id>
- Include sections for files changed, verification run, and remaining unknowns.
- End with an exact line that begins with READY_FOR_NEXT_TASK: followed by the next safe continuation.
- Keep the work within the requested scope; do not widen ownership on your own.

Codex acceptance:

- GLM added `requiresBuildings?: string[]` and `getResearchAvailability` support, but then attempted to add `_test_multi_prereq` to product `RESEARCHES`.
- Codex took over, removed the product test fixture, and exposed `window.__war3Researches` only under `runtimeTest=1` so the runtime spec can inject a temporary research without shipping fake product data.
- Codex local verification accepted: `npm run build`, `npx tsc --noEmit -p tsconfig.app.json`, focused runtime 5/5, and Task183 source proof 14/14.

READY_FOR_NEXT_TASK: HN7-DATA7 — Animal War Training data seed

### Task 185 — V9 HN7-DATA7 Animal War Training data seed

Status: `accepted`.

Owner: GLM-style worker + Codex review.

Priority: Task183 fixed AWT source values and Task184 accepted the multi-building prerequisite model. Data can now be seeded without collapsing Castle + Lumber Mill + Blacksmith into one fake prerequisite.

Prerequisite: `Task 184 — V9 HN7-MODEL8 Research multi-building prerequisite model` accepted.

Allowed files:

- `src/game/GameData.ts`
- `docs/V9_HN7_ANIMAL_WAR_TRAINING_SOURCE_PACKET.zh-CN.md`
- `docs/V9_HUMAN_NUMERIC_EXPANSION_PACKET.zh-CN.md`
- `docs/V9_MAINTENANCE_EXPANSION_EVIDENCE_LEDGER.zh-CN.md`
- `docs/V9_MAINTENANCE_EXPANSION_REMAINING_GATES.zh-CN.md`
- `tests/v9-hn7-animal-war-training-data-seed.spec.mjs`
- `docs/GLM_READY_TASK_QUEUE.md` only for closeout sync

Goal:

只写 Animal War Training 数据种子，不写 runtime smoke：

1. 新增 `RESEARCHES.animal_war_training`，值必须来自 Task183 source packet：125 gold / 125 lumber、40 秒、Barracks 研究、requiresBuildings 为 Castle + Lumber Mill + Blacksmith、effect 为 `knight maxHp +100`。
2. 把 `animal_war_training` 加入 Barracks researches，让后续 runtime smoke 可以从兵营命令卡证明入口。
3. 保持 AWT 单级，不新增 level 2 / level 3。
4. 受影响单位只允许当前项目存在的 `knight`；不得为 `dragonhawk`、`gryphon` 或其他不存在单位写 effect。
5. 新增 static proof，证明数据值、Barracks hook、multi-building prerequisites、单级边界和 forbidden branches。

Forbidden:

- 不修改 `src/game/Game.ts` 或 runtime 行为。
- 不实现 AWT 按钮 runtime smoke、AI 升级策略、英雄、空军、物品或素材。
- 不新增 `dragonhawk` / `gryphon` / Flying Machine / Siege Engine / Spell Breaker。
- 不改 Knight、Castle、Blacksmith、Plating、Gunpowder 或 Leather Armor 数值。
- 不使用 `_test_multi_prereq` 或其他测试夹具污染产品数据。

Verification:

```bash
node --test tests/v9-hn7-animal-war-training-data-seed.spec.mjs tests/v9-hn7-animal-war-training-source.spec.mjs
npm run build
npx tsc --noEmit -p tsconfig.app.json
```

Closeout requirements:
- Start your final closeout with the exact line: JOB_COMPLETE: <job-id>
- If truly blocked, emit the exact line: JOB_BLOCKED: <job-id>
- Include sections for files changed, verification run, and remaining unknowns.
- End with an exact line that begins with READY_FOR_NEXT_TASK: followed by the next safe continuation.
- Keep the work within the requested scope; do not widen ownership on your own.

Codex acceptance:

- GLM seeded `RESEARCHES.animal_war_training`, added the Barracks research hook, and created the static data proof.
- Codex corrected the older SRC7 source proof so it does not depend on DATA7 being present; DATA7 ownership now lives in the data proof.
- Codex local verification accepted: data+source proof 24/24, `npm run build`, and `npx tsc --noEmit -p tsconfig.app.json`.

READY_FOR_NEXT_TASK: HN7-IMPL9 — Animal War Training runtime smoke

### Task 186 — V9 HN7-IMPL9 Animal War Training runtime smoke

Status: `accepted`.

Owner: GLM-style worker + Codex review.

Priority: Task185 accepted the data seed. The next adjacent proof is that the existing research runtime can consume AWT from Barracks with multi-building prerequisites and maxHp effects.

Prerequisite: `Task 185 — V9 HN7-DATA7 Animal War Training data seed` accepted.

Allowed files:

- `tests/v9-hn7-animal-war-training-runtime.spec.ts`
- `docs/V9_HUMAN_NUMERIC_EXPANSION_PACKET.zh-CN.md`
- `docs/V9_MAINTENANCE_EXPANSION_EVIDENCE_LEDGER.zh-CN.md`
- `docs/V9_MAINTENANCE_EXPANSION_REMAINING_GATES.zh-CN.md`
- `docs/GLM_READY_TASK_QUEUE.md` only for closeout sync
- `src/game/Game.ts` only if the focused runtime proof exposes a real generic research/runtime bug

Goal:

只证明 Animal War Training 数据能被现有 runtime 正确消费：

1. Barracks 命令卡显示 `动物作战训练` 研究按钮。
2. 缺 Castle、Lumber Mill 或 Blacksmith 时按钮禁用，原因列出缺失建筑中文名。
3. 三建筑齐全后可研究，并按 125 gold / 125 lumber 扣费。
4. 研究进入 Barracks researchQueue，完成后已有 Knight `maxHp` 和 `hp` 增加 100。
5. 研究完成后新训练 Knight 继承 `maxHp +100`；Footman / Rifleman / Mortar / Priest / Sorceress 不受影响。

Forbidden:

- 不实现 AI 升级策略、英雄、空军、物品、素材、Leather Armor 或新单位。
- 不改 AWT 数据值、Knight 基础数值、Castle / Barracks / Blacksmith / Lumber Mill 数值。
- 不直接写 `completedResearches` 伪造完成；必须走 `startResearch` + researchQueue tick。
- 不用 `tail` 截断验证输出。

Verification:

```bash
npm run build
npx tsc --noEmit -p tsconfig.app.json
./scripts/run-runtime-tests.sh tests/v9-hn7-animal-war-training-runtime.spec.ts --reporter=list
node --test tests/v9-hn7-animal-war-training-data-seed.spec.mjs tests/v9-hn7-animal-war-training-source.spec.mjs
```

Closeout requirements:
- Start your final closeout with the exact line: JOB_COMPLETE: <job-id>
- If truly blocked, emit the exact line: JOB_BLOCKED: <job-id>
- Include sections for files changed, verification run, and remaining unknowns.
- End with an exact line that begins with READY_FOR_NEXT_TASK: followed by the next safe continuation.
- Keep the work within the requested scope; do not widen ownership on your own.

Codex acceptance:

- GLM received Task186 but stopped during exploration after an API error without creating the runtime spec.
- Codex took over and added `tests/v9-hn7-animal-war-training-runtime.spec.ts`.
- Codex local verification accepted: `npm run build`, `npx tsc --noEmit -p tsconfig.app.json`, focused runtime 4/4, and data+source static proof 24/24.

READY_FOR_NEXT_TASK: HN7-CLOSE10 — Animal War Training closure inventory

### Task 187 — V9 HN7-CLOSE10 Animal War Training closure inventory

Status: `accepted`.

Owner: GLM-style worker + Codex review.

Priority: AWT source, model, data, and runtime are accepted. HN7 needs a closure inventory before moving to the next branch.

Prerequisite: `Task 186 — V9 HN7-IMPL9 Animal War Training runtime smoke` accepted.

Allowed files:

- `tests/v9-hn7-animal-war-training-closure.spec.mjs`
- `docs/V9_HUMAN_NUMERIC_EXPANSION_PACKET.zh-CN.md`
- `docs/V9_MAINTENANCE_EXPANSION_EVIDENCE_LEDGER.zh-CN.md`
- `docs/V9_MAINTENANCE_EXPANSION_REMAINING_GATES.zh-CN.md`
- `docs/GLM_READY_TASK_QUEUE.md` only for closeout sync

Goal:

只做 AWT 最小链路闭环盘点：

1. 串起 HN7-SRC7、HN7-MODEL8、HN7-DATA7、HN7-IMPL9 四段证据。
2. 证明 AWT 已有 source、multi-building prereq model、data seed、Barracks command entry 和 runtime maxHp effect。
3. 明确仍未做 Leather Armor、AI 升级策略、英雄、空军、物品、素材或完整三本战术。
4. 新增 static closure proof，避免只靠文档叙述。
5. 下一张 safe continuation 只能从 HN7 相邻剩余项中选，例如 Leather Armor source reconciliation 或 AWT AI strategy contract，不能直接开英雄/空军/素材大面。

Forbidden:

- 不修改 `src/game/Game.ts`、`src/game/GameData.ts` 或 runtime 测试。
- 不新增数据、AI、英雄、空军、物品、素材或 Leather Armor。
- 不用 tail 截断验证输出。

Verification:

```bash
node --test tests/v9-hn7-animal-war-training-closure.spec.mjs tests/v9-hn7-animal-war-training-data-seed.spec.mjs tests/v9-hn7-animal-war-training-source.spec.mjs
npm run build
npx tsc --noEmit -p tsconfig.app.json
```

Closeout requirements:
- Start your final closeout with the exact line: JOB_COMPLETE: <job-id>
- If truly blocked, emit the exact line: JOB_BLOCKED: <job-id>
- Include sections for files changed, verification run, and remaining unknowns.
- End with an exact line that begins with READY_FOR_NEXT_TASK: followed by the next safe continuation.
- Keep the work within the requested scope; do not widen ownership on your own.

Codex acceptance:

- GLM wrote the closure proof and HN7 docs, then changed `remaining-gates` from `HN7-CLOSE10` to the next HN7 remaining items after running verification.
- That late doc change made `AWT-CLOSE-13` fail under Codex review.
- Codex corrected the proof to assert the durable state: evidence ledger closes `HN7-CLOSE10`, while remaining-gates now points at the next adjacent HN7 work.
- Codex local verification accepted: AWT closure + data + source static proof 38/38, `npm run build`, and `npx tsc --noEmit -p tsconfig.app.json`.

READY_FOR_NEXT_TASK: HN7-AI11 — Animal War Training AI strategy contract

### Task 188 — V9 HN7-AI11 Animal War Training AI strategy contract

Status: `accepted`.

Owner: GLM-style worker + Codex review.

Priority: AWT source/model/data/runtime are accepted, but AI does not yet know when it should research AWT. Before implementation, write a strategy contract so AI behavior does not become an ad hoc SimpleAI patch.

Prerequisite: `Task 187 — V9 HN7-CLOSE10 Animal War Training closure inventory` accepted.

Allowed files:

- `docs/V9_HN7_ANIMAL_WAR_TRAINING_AI_STRATEGY_CONTRACT.zh-CN.md`
- `tests/v9-hn7-animal-war-training-ai-strategy-contract.spec.mjs`
- `docs/V9_HUMAN_NUMERIC_EXPANSION_PACKET.zh-CN.md`
- `docs/V9_MAINTENANCE_EXPANSION_EVIDENCE_LEDGER.zh-CN.md`
- `docs/V9_MAINTENANCE_EXPANSION_REMAINING_GATES.zh-CN.md`
- `docs/GLM_READY_TASK_QUEUE.md` only for closeout sync

Goal:

只做 AI 研究 AWT 的策略合同，不实现代码：

1. 阅读当前 `SimpleAI.ts`、AWT 数据和 Knight / Castle / Blacksmith / Lumber Mill 前置链，写出 AI 研究 AWT 的最小触发条件。
2. 合同必须明确：AI 只有在已经进入 Castle/Knight 路线、拥有 Barracks + Castle + Lumber Mill + Blacksmith、且 AWT 未研究时，才允许考虑 AWT。
3. 合同必须定义预算边界：不能为了 AWT 饿死农民、兵营出兵、关键前置建筑或 Keep/Castle 升级链。
4. 合同必须定义一次性研究和失败重试边界：已研究、正在研究、资源不足、缺建筑、无 Knight 路线时都不能重复刷队列。
5. 新增 static proof，证明合同覆盖触发条件、禁区、下一个实现任务边界。
6. 下一张 safe continuation 只能是 `HN7-AI12 — Animal War Training AI implementation slice` 或更保守的 contract 修正，不能直接开英雄/空军/物品/素材。

Forbidden:

- 不修改 `src/game/SimpleAI.ts`、`src/game/Game.ts`、`src/game/GameData.ts`。
- 不新增 runtime 测试、不实现 AI 研究、不改数据。
- 不写 Leather Armor、英雄、空军、物品、素材或完整三本战术。
- 不用 tail 截断验证输出。

Verification:

```bash
node --test tests/v9-hn7-animal-war-training-ai-strategy-contract.spec.mjs tests/v9-hn7-animal-war-training-closure.spec.mjs
npm run build
npx tsc --noEmit -p tsconfig.app.json
```

Closeout requirements:
- Start your final closeout with the exact line: JOB_COMPLETE: <job-id>
- If truly blocked, emit the exact line: JOB_BLOCKED: <job-id>
- Include sections for files changed, verification run, and remaining unknowns.
- End with an exact line that begins with READY_FOR_NEXT_TASK: followed by the next safe continuation.
- Keep the work within the requested scope; do not widen ownership on your own.

Codex acceptance:

- GLM wrote the AI11 contract and proof, then advanced remaining-gates to HN7-AI12.
- Codex corrected two brittle proof edges before accepting:
  - AWT closure proof no longer requires the next adjacent title to stay exactly `HN7 remaining items`; it only requires CLOSE10 to be closed and current work to move to some adjacent HN7 item.
  - AI strategy proof no longer reads `SimpleAI.ts` as a permanent "no AWT / no Knight" invariant, because HN7-AI12 is expected to add AWT logic.
- Codex local verification accepted: AI strategy + AWT closure proof 30/30, `npm run build`, and `npx tsc --noEmit -p tsconfig.app.json`.

READY_FOR_NEXT_TASK: HN7-AI12 — Animal War Training AI implementation slice

### Task 189 — V9 HN7-AI12 Animal War Training AI implementation slice

Status: `accepted`.

Owner: Codex takeover.

Priority: Task188 fixed the AI strategy contract. Now add the smallest SimpleAI implementation that researches AWT when that exact contract is satisfied.

Prerequisite: `Task 188 — V9 HN7-AI11 Animal War Training AI strategy contract` accepted.

Allowed files:

- `src/game/SimpleAI.ts`
- `tests/v9-hn7-animal-war-training-ai-runtime.spec.ts`
- `docs/V9_HUMAN_NUMERIC_EXPANSION_PACKET.zh-CN.md`
- `docs/V9_MAINTENANCE_EXPANSION_EVIDENCE_LEDGER.zh-CN.md`
- `docs/V9_MAINTENANCE_EXPANSION_REMAINING_GATES.zh-CN.md`
- `docs/GLM_READY_TASK_QUEUE.md` only for closeout sync

Goal:

只按 Task188 合同实现 AI 研究 AWT 的最小切片：

1. 在 `SimpleAI.ts` 增加一个小的 AWT 研究决策，必须从 `RESEARCHES.animal_war_training` 读取 key/cost，不硬编码成本或研究 key。
2. 只有同时满足 Castle、Barracks、Lumber Mill、Blacksmith、AWT 未完成、Barracks 研究队列为空、已有或正在训练至少 1 个 Knight、资源满足 AWT 成本且保留 worker + footman 成本时，AI 才能调用研究。
3. 资源不足、缺任一前置、无 Knight、AWT 已完成、研究队列非空时，AI 必须跳过，不得报错、不得重复入队列。
4. 新增 focused runtime proof，证明触发成功、资源扣除/队列入队、至少 3 个跳过场景、不重复研究。
5. 不实现 AI Castle 升级、不实现 AI Knight 训练、不实现 Blacksmith 三段升级、不改 GameData 或 Game.ts。

Forbidden:

- 不修改 `src/game/Game.ts`、`src/game/GameData.ts`。
- 不新增 Castle 升级、Knight 训练、Leather Armor、英雄、空军、物品、素材或完整三本战术。
- 不改现有 runtime harness 或通用测试脚本。
- 不用 tail 截断验证输出。

Verification:

```bash
npm run build
npx tsc --noEmit -p tsconfig.app.json
./scripts/run-runtime-tests.sh tests/v9-hn7-animal-war-training-ai-runtime.spec.ts --reporter=list
node --test tests/v9-hn7-animal-war-training-ai-strategy-contract.spec.mjs tests/v9-hn7-animal-war-training-closure.spec.mjs
```

Closeout requirements:
- Start your final closeout with the exact line: JOB_COMPLETE: <job-id>
- If truly blocked, emit the exact line: JOB_BLOCKED: <job-id>
- Include sections for files changed, verification run, and remaining unknowns.
- End with an exact line that begins with READY_FOR_NEXT_TASK: followed by the next safe continuation.
- Keep the work within the requested scope; do not widen ownership on your own.

Codex acceptance:

- GLM completed the core `SimpleAI.ts` idea but stopped at the prompt while diagnosing runtime failures.
- Codex found the runtime fixture was spawning duplicate Castle/Barracks while SimpleAI selected the default AI Town Hall/Barracks first.
- Codex rewrote the focused runtime fixture to mutate the default AI main hall to Castle and assert against the same Barracks that SimpleAI selects.
- Codex also removed the remaining hardcoded AWT research queue key from `SimpleAI.ts`; the queue entry now uses `RESEARCHES.animal_war_training.key`.
- Local verification accepted:

```bash
npm run build
npx tsc --noEmit -p tsconfig.app.json
./scripts/run-runtime-tests.sh tests/v9-hn7-animal-war-training-ai-runtime.spec.ts --reporter=list
node --test tests/v9-hn7-animal-war-training-ai-strategy-contract.spec.mjs tests/v9-hn7-animal-war-training-closure.spec.mjs
```

Result:

```text
build pass.
typecheck pass.
AWT AI runtime 8/8 pass.
AI strategy + AWT closure static proof 30/30 pass.
```

READY_FOR_NEXT_TASK: HN7-AI13 — Animal War Training AI closure inventory

### Task 190 — V9 HN7-AI13 Animal War Training AI closure inventory

Status: `accepted`.

Owner: GLM-style worker + Codex review.

Priority: Task189 is now accepted. Close the AWT AI mini-chain before opening the next Human expansion branch.

Prerequisite: `Task 189 — V9 HN7-AI12 Animal War Training AI implementation slice` accepted.

Allowed files:

- `tests/v9-hn7-animal-war-training-ai-closure.spec.mjs`
- `docs/V9_HN7_ANIMAL_WAR_TRAINING_AI_STRATEGY_CONTRACT.zh-CN.md`
- `docs/V9_HUMAN_NUMERIC_EXPANSION_PACKET.zh-CN.md`
- `docs/V9_MAINTENANCE_EXPANSION_EVIDENCE_LEDGER.zh-CN.md`
- `docs/V9_MAINTENANCE_EXPANSION_REMAINING_GATES.zh-CN.md`
- `docs/DUAL_LANE_STATUS.zh-CN.md`
- `docs/GLM_READY_TASK_QUEUE.md` only for closeout sync

Goal:

只做收口盘点，不改生产代码：

1. 新增 `tests/v9-hn7-animal-war-training-ai-closure.spec.mjs`，证明 AI11 合同和 AI12 runtime 已形成闭环。
2. 静态 proof 必须覆盖：`SimpleAI.ts` 从 `RESEARCHES.animal_war_training` 读取 key/cost/time；runtime spec 覆盖成功触发、Keep 跳过、无 Knight 跳过、研究队列占用跳过、已完成跳过、不重复、训练队列 Knight、预算不足跳过。
3. 文档同步 Task189 accepted 结果：build、tsc、focused runtime 8/8、AI strategy + AWT closure 30/30。
4. remaining-gates 只能移动到下一个相邻 Human 能力，不得宣称完整 Human、完整 T3、AI Castle/Knight 完整战术、英雄、空军、物品或素材完成。
5. 如果发现 Task189 文档或 proof 有过期口径，只能做最小文档/proof 修正，不得扩展实现范围。

Forbidden:

- 不修改 `src/game/SimpleAI.ts`、`src/game/Game.ts`、`src/game/GameData.ts`。
- 不新增 AI Castle 升级、AI Knight 训练、Blacksmith 自动升级策略、Leather Armor、英雄、空军、物品、素材或完整三本战术。
- 不跑完整 runtime suite；只跑本任务静态 proof、必要 build/tsc。
- 不用 tail 截断验证输出。

Verification:

```bash
node --test tests/v9-hn7-animal-war-training-ai-closure.spec.mjs tests/v9-hn7-animal-war-training-ai-strategy-contract.spec.mjs tests/v9-hn7-animal-war-training-closure.spec.mjs
npm run build
npx tsc --noEmit -p tsconfig.app.json
```

Closeout requirements:
- Start your final closeout with the exact line: JOB_COMPLETE: <job-id>
- If truly blocked, emit the exact line: JOB_BLOCKED: <job-id>
- Include sections for files changed, verification run, and remaining unknowns.
- End with an exact line that begins with READY_FOR_NEXT_TASK: followed by the next safe continuation.
- Keep the work within the requested scope; do not widen ownership on your own.

Codex acceptance:

- GLM wrote the closure proof and document sync, then returned to prompt without a full closeout.
- Codex accepted after local verification:

```bash
node --test tests/v9-hn7-animal-war-training-ai-closure.spec.mjs tests/v9-hn7-animal-war-training-ai-strategy-contract.spec.mjs tests/v9-hn7-animal-war-training-closure.spec.mjs
npm run build
npx tsc --noEmit -p tsconfig.app.json
```

Result:

```text
AI closure proof 20/20 pass.
Combined static proof 50/50 pass.
build pass.
typecheck pass.
```

READY_FOR_NEXT_TASK: HN7-AI16 — Blacksmith upgrade AI closure inventory

### Task 191 — V9 HN7-AI14 Blacksmith upgrade AI strategy contract

Status: `accepted`.

Owner: GLM-style worker + Codex review.

Priority: HN7 Blacksmith upgrades already exist for melee, ranged, and plating. AWT now has AI coverage. The next safe step is a strategy contract for AI using existing Blacksmith upgrades without implementing it yet.

Prerequisite: `Task 190 — V9 HN7-AI13 Animal War Training AI closure inventory` accepted.

Allowed files:

- `docs/V9_HN7_BLACKSMITH_UPGRADE_AI_STRATEGY_CONTRACT.zh-CN.md`
- `tests/v9-hn7-blacksmith-upgrade-ai-strategy-contract.spec.mjs`
- `docs/V9_HUMAN_NUMERIC_EXPANSION_PACKET.zh-CN.md`
- `docs/V9_MAINTENANCE_EXPANSION_EVIDENCE_LEDGER.zh-CN.md`
- `docs/V9_MAINTENANCE_EXPANSION_REMAINING_GATES.zh-CN.md`
- `docs/DUAL_LANE_STATUS.zh-CN.md`
- `docs/GLM_READY_TASK_QUEUE.md` only for closeout sync

Goal:

只写合同和静态 proof，不改生产代码：

1. 定义 AI 何时研究当前已经存在的 Blacksmith 升级链：近战武器、远程火药、护甲 Plating。必须基于当前 `GameData.ts` 已落地的数据，不新增 Leather Armor。
2. 合同必须明确优先级：不能在开局压力前抢资源；必须保留 worker + 基础军事生产预算；只能在对应前置满足后研究；不得重复研究或塞满研究队列。
3. 合同必须区分已存在的 Long Rifles AI 路径、AWT AI 路径和未来 Blacksmith upgrade AI 路径，避免互相覆盖。
4. 新增静态 proof 验证合同内容、当前数据事实、禁区和下一步 safe continuation。
5. 文档同步下一步只能是 AI implementation slice 或更小的 proof，不得跳到英雄、空军、物品、素材、完整三本战术或 Leather Armor 数据。

Forbidden:

- 不修改 `src/game/SimpleAI.ts`、`src/game/Game.ts`、`src/game/GameData.ts`。
- 不新增 Leather Armor、不新增任何研究数据、不改 Blacksmith 研究列表。
- 不实现 AI research 逻辑、不改 runtime tests、不跑完整 runtime suite。
- 不用 tail 截断验证输出。

Verification:

```bash
node --test tests/v9-hn7-blacksmith-upgrade-ai-strategy-contract.spec.mjs
npm run build
npx tsc --noEmit -p tsconfig.app.json
```

Closeout requirements:
- Start your final closeout with the exact line: JOB_COMPLETE: <job-id>
- If truly blocked, emit the exact line: JOB_BLOCKED: <job-id>
- Include sections for files changed, verification run, and remaining unknowns.
- End with an exact line that begins with READY_FOR_NEXT_TASK: followed by the next safe continuation.
- Keep the work within the requested scope; do not widen ownership on your own.

Codex review closeout:

- GLM produced `docs/V9_HN7_BLACKSMITH_UPGRADE_AI_STRATEGY_CONTRACT.zh-CN.md` and `tests/v9-hn7-blacksmith-upgrade-ai-strategy-contract.spec.mjs`.
- Codex locally verified:
  - `node --test tests/v9-hn7-blacksmith-upgrade-ai-strategy-contract.spec.mjs` -> 24/24 pass
  - `npm run build` pass
  - `npx tsc --noEmit -p tsconfig.app.json` pass
- Accepted as strategy-contract evidence only. Production code was not changed by this task.

### Task 192 — V9 HN7-AI15 Blacksmith upgrade AI implementation slice

Status: `accepted`.

Owner: GLM-style worker + Codex takeover.

Priority: Task191 has fixed the behavior contract. The next safe step is a narrow implementation: make SimpleAI research existing Blacksmith upgrade chains when the contract conditions are met, then prove the behavior with focused runtime tests.

Prerequisite: `Task 191 — V9 HN7-AI14 Blacksmith upgrade AI strategy contract` accepted.

Allowed files:

- `src/game/SimpleAI.ts`
- `tests/v9-hn7-blacksmith-upgrade-ai-runtime.spec.ts`
- `docs/V9_HUMAN_NUMERIC_EXPANSION_PACKET.zh-CN.md`
- `docs/V9_MAINTENANCE_EXPANSION_EVIDENCE_LEDGER.zh-CN.md`
- `docs/V9_MAINTENANCE_EXPANSION_REMAINING_GATES.zh-CN.md`
- `docs/DUAL_LANE_STATUS.zh-CN.md`
- `docs/GLM_READY_TASK_QUEUE.md` only for closeout sync

Goal:

只实现 AI 使用已经存在的数据，不新增内容：

1. 在 `SimpleAI.ts` 中增加一个独立 Blacksmith upgrade research block，放在 Long Rifles / AWT 之后、进攻波次之前。
2. 按 Task191 的顺序只研究第一个满足条件的升级：`iron_forged_swords` -> `iron_plating` -> `black_gunpowder` -> `steel_forged_swords` -> `steel_plating` -> `refined_gunpowder` -> `mithril_forged_swords` -> `mithril_plating` -> `imbued_gunpowder`。
3. 所有 cost、researchTime、key、requiresBuilding、prerequisiteResearch 必须从 `RESEARCHES` 读取，不硬编码数值。
4. 必须保留 worker + footman 预算；`waveCount < 1` 时不研究；Blacksmith 研究队列不为空时不新增；已完成研究不重复。
5. 近战链只在有 footman 或 knight 时触发；护甲链只在有 footman 或 knight 时触发；远程链只在 Long Rifles 已完成且有 rifleman 或 mortar_team 时触发。
6. Level 2 / Level 3 必须尊重前置研究和主基地等级；不能跳级。
7. 补 focused runtime proof，至少覆盖：正向 L1 近战、开局不抢资源、队列占用不重复、已完成不重复、资源不足不研究、纯远程阵容研究火药、Keep 后 L2 顺序、Castle 后 L3 顺序。

Forbidden:

- 不修改 `src/game/GameData.ts` 或 `src/game/Game.ts`。
- 不新增 Leather Armor、不新增任何研究数据、不改 Blacksmith 研究列表。
- 不实现 Keep -> Castle 升级、不实现 Knight 训练。
- 不实现英雄、空军、物品、素材、完整三本战术或新 AI 状态机。
- 不跑完整 runtime suite；只跑 focused runtime 和必要静态验证。
- 不用 `tail` 截断验证输出。

Verification:

```bash
npm run build
npx tsc --noEmit -p tsconfig.app.json
./scripts/run-runtime-tests.sh tests/v9-hn7-blacksmith-upgrade-ai-runtime.spec.ts --reporter=list
node --test tests/v9-hn7-blacksmith-upgrade-ai-strategy-contract.spec.mjs
FORCE_RUNTIME_CLEANUP=1 ./scripts/cleanup-local-runtime.sh
```

Closeout requirements:
- Start your final closeout with the exact line: JOB_COMPLETE: <job-id>
- If truly blocked, emit the exact line: JOB_BLOCKED: <job-id>
- Include sections for files changed, verification run, and remaining unknowns.
- End with an exact line that begins with READY_FOR_NEXT_TASK: followed by the next safe continuation.
- Keep the work within the requested scope; do not widen ownership on your own.

Codex acceptance:

- GLM wrote the first `SimpleAI.ts` implementation and runtime spec, then got stuck on BS-RT-6 and temporarily weakened the assertion to spend matching instead of queue matching.
- Codex interrupted Task192, removed the debug/weak assertion, kept the existing Long Rifles priority intact, split the Long Rifles and Black Gunpowder cases into independent runtime scenarios, and reduced the focused test default to `waveCount = 1` so unrelated V7 expansion building does not pollute the Blacksmith research proof.
- Codex locally verified:

```bash
npm run build
npx tsc --noEmit -p tsconfig.app.json
./scripts/run-runtime-tests.sh tests/v9-hn7-blacksmith-upgrade-ai-runtime.spec.ts --reporter=list
node --test tests/v9-hn7-blacksmith-upgrade-ai-strategy-contract.spec.mjs
```

Result:

```text
build pass.
typecheck pass.
focused runtime 18/18 pass.
strategy contract proof 24/24 pass.
```

READY_FOR_NEXT_TASK: HN7-AI16 — Blacksmith upgrade AI closure inventory

### Task 193 — V9 HN7-AI16 Blacksmith upgrade AI closure inventory

Status: `accepted`.

Owner: GLM-style worker + Codex review.

Priority: Task191 defined the Blacksmith upgrade AI contract and Task192 implemented it. The next safe step is a closure inventory that ties contract, implementation, and runtime proof together before opening any new Human branch.

Prerequisite: `Task 192 — V9 HN7-AI15 Blacksmith upgrade AI implementation slice` accepted.

Allowed files:

- `docs/V9_HN7_BLACKSMITH_UPGRADE_AI_CLOSURE.zh-CN.md`
- `tests/v9-hn7-blacksmith-upgrade-ai-closure.spec.mjs`
- `docs/V9_HUMAN_NUMERIC_EXPANSION_PACKET.zh-CN.md`
- `docs/V9_MAINTENANCE_EXPANSION_EVIDENCE_LEDGER.zh-CN.md`
- `docs/V9_MAINTENANCE_EXPANSION_REMAINING_GATES.zh-CN.md`
- `docs/DUAL_LANE_STATUS.zh-CN.md`
- `docs/GLM_READY_TASK_QUEUE.md` only for closeout sync

Goal:

只做收口盘点和静态 proof，不改生产代码：

1. 证明 Task191 合同和 Task192 实现已经闭环：三条链、9 个升级、Long Rifles 优先级、预算、队列空、已完成不重复、waveCount >= 1、前置研究和主基地等级均有证据。
2. 证明 Task192 runtime spec 覆盖 18 个 focused 场景，包括 Long Rifles 优先、Black Gunpowder 在 Long Rifles 后触发、L2/L3 顺序、资源不足、队列占用、不跳级、不重复和 Leather Armor 禁区。
3. 证明 `SimpleAI.ts` 只读取 `RESEARCHES` 中的 key/cost/researchTime/requiresBuilding/prerequisiteResearch/effects，不在实现中硬编码升级数值。
4. 更新 Human numeric packet、V9 evidence ledger、remaining gates、dual lane status，把当前相邻任务推进到 HN7-AI16 closure。
5. 下一步只能是 Leather Armor source reconciliation、AI Castle/Knight 策略合同，或 HN7/Human closure 后由 Codex 选择；不得直接跳到英雄、空军、物品、素材或完整三本战术。

Forbidden:

- 不修改 `src/game/SimpleAI.ts`、`src/game/Game.ts`、`src/game/GameData.ts`。
- 不修改 `tests/v9-hn7-blacksmith-upgrade-ai-runtime.spec.ts`。
- 不新增 Leather Armor 数据或实现。
- 不实现 AI Castle upgrade、AI Knight training、英雄、空军、物品、素材或完整 T3。
- 不跑完整 runtime suite；本任务只做静态 proof，必要时可引用 Task192 的已通过 runtime 结果。
- 不用 tail 截断验证输出。

Verification:

```bash
node --test tests/v9-hn7-blacksmith-upgrade-ai-closure.spec.mjs tests/v9-hn7-blacksmith-upgrade-ai-strategy-contract.spec.mjs
npm run build
npx tsc --noEmit -p tsconfig.app.json
```

Closeout requirements:
- Start your final closeout with the exact line: JOB_COMPLETE: <job-id>
- If truly blocked, emit the exact line: JOB_BLOCKED: <job-id>
- Include sections for files changed, verification run, and remaining unknowns.
- End with an exact line that begins with READY_FOR_NEXT_TASK: followed by the next safe continuation.
- Keep the work within the requested scope; do not widen ownership on your own.

Codex acceptance:

- GLM wrote the closure document and static proof, then hit an API/network error while updating `docs/GLM_READY_TASK_QUEUE.md`; the companion job was marked interrupted without a clean closeout.
- Codex reviewed the existing diff instead of re-dispatching the same task.
- Codex locally verified:

```bash
node --test tests/v9-hn7-blacksmith-upgrade-ai-closure.spec.mjs tests/v9-hn7-blacksmith-upgrade-ai-strategy-contract.spec.mjs
npm run build
npx tsc --noEmit -p tsconfig.app.json
```

Result:

```text
closure + strategy static proof 56/56 pass.
build pass.
typecheck pass.
```

READY_FOR_NEXT_TASK: HN7-SRC8 — Leather Armor source and armor-type boundary

### Task 194 — V9 HN7-SRC8 Leather Armor source and armor-type boundary

Status: `accepted`.

Owner: GLM-style worker + Codex review.

Priority: HN7 Blacksmith weapon, Plating, Animal War Training, and AI upgrade chains are now closed. The remaining adjacent Human Blacksmith item is Leather Armor, but existing source notes say current `rifleman` / `mortar_team` are `Unarmored` while War3 Leather Armor affects `Medium` armor units. Before any data seed, the project needs a source and model-boundary decision.

Prerequisite: `Task 193 — V9 HN7-AI16 Blacksmith upgrade AI closure inventory` accepted.

Allowed files:

- `docs/V9_HN7_LEATHER_ARMOR_SOURCE_AND_TYPE_BOUNDARY.zh-CN.md`
- `tests/v9-hn7-leather-armor-source-boundary.spec.mjs`
- `docs/V9_HUMAN_NUMERIC_EXPANSION_PACKET.zh-CN.md`
- `docs/V9_MAINTENANCE_EXPANSION_EVIDENCE_LEDGER.zh-CN.md`
- `docs/V9_MAINTENANCE_EXPANSION_REMAINING_GATES.zh-CN.md`
- `docs/DUAL_LANE_STATUS.zh-CN.md`
- `docs/GLM_READY_TASK_QUEUE.md` only for closeout sync

Goal:

只做来源、现状和边界判断，不改运行时代码：

1. 复核并整理 War3 Human Leather Armor 三段线：Studded Leather Armor、Reinforced Leather Armor、Dragonhide Armor 的成本、时间、前置、影响单位和与 Plating 的区别。
2. 对照当前项目 `GameData.ts`，证明 `rifleman`、`mortar_team` 现在是什么 `armorType`，当前是否有 `Medium` armor 人族单位会被 Leather Armor 正确影响。
3. 明确 Leather Armor 如果要进入数据种子，是否必须先有一个 `Medium armor migration` 合同；如果不需要，也要给出证据。
4. 输出下一步 safe continuation，只能是 `Medium armor migration contract`、`Leather Armor data seed`、`AI Castle/Knight strategy contract`、或 `HN7/Human closure` 之一，并说明为什么。
5. 更新 Human numeric packet、V9 evidence ledger、remaining gates、dual lane status，把当前相邻任务推进到 HN7-SRC8。

Forbidden:

- 不修改 `src/game/GameData.ts`、`src/game/Game.ts`、`src/game/SimpleAI.ts`。
- 不新增 `RESEARCHES.studded_leather_armor` 等 Leather Armor 数据。
- 不修改 `rifleman` / `mortar_team` / 任何单位的 `armorType`。
- 不改命令卡、研究队列、AI、runtime 行为、素材、英雄、空军、物品或完整三本战术。
- 不跑完整 runtime suite；本任务只做静态 proof。
- 不用 `tail` 截断验证输出。

Verification:

```bash
node --test tests/v9-hn7-leather-armor-source-boundary.spec.mjs tests/v9-hn7-armor-upgrade-source.spec.mjs
npm run build
npx tsc --noEmit -p tsconfig.app.json
```

Codex review:

- Accepted on 2026-04-16.
- Local verification passed: Leather source boundary + armor source proof 30/30, `npm run build`, `npx tsc --noEmit -p tsconfig.app.json`.
- Result: do not seed Leather Armor yet. The next safe step is a Medium armor migration contract.

READY_FOR_NEXT_TASK: HN7-MODEL9 — Medium armor migration contract

### Task 195 — V9 HN7-MODEL9 Medium armor migration contract

Status: `accepted`.

Owner: Codex takeover.

Priority: Task194 proved Leather Armor should not be seeded while `rifleman` and `mortar_team` remain `ArmorType.Unarmored`. Before touching `GameData.ts`, the project needs a narrow migration contract. Codex review narrowed the contract: `rifleman` is the only mandatory Medium migration target; `mortar_team` must go through a separate parity decision and cannot be blindly changed to Medium.

Prerequisite: `Task 194 — V9 HN7-SRC8 Leather Armor source and armor-type boundary` accepted.

Allowed files:

- `docs/V9_HN7_MEDIUM_ARMOR_MIGRATION_CONTRACT.zh-CN.md`
- `tests/v9-hn7-medium-armor-migration-contract.spec.mjs`
- `docs/V9_HUMAN_NUMERIC_EXPANSION_PACKET.zh-CN.md`
- `docs/V9_MAINTENANCE_EXPANSION_EVIDENCE_LEDGER.zh-CN.md`
- `docs/V9_MAINTENANCE_EXPANSION_REMAINING_GATES.zh-CN.md`
- `docs/DUAL_LANE_STATUS.zh-CN.md`
- `docs/GLM_READY_TASK_QUEUE.md` only for closeout sync

Goal:

只写合同和静态 proof，不改运行时代码：

1. 定义 Medium armor migration 的候选范围：当前只允许评估 `rifleman` 和 `mortar_team`，并明确 `worker`、`militia`、`footman`、`knight`、`priest`、`sorceress`、`tower` 不属于这次迁移。
2. 对照当前 `DAMAGE_MULTIPLIER_TABLE`，说明从 Unarmored 改为 Medium 后会改变哪些受击倍率，尤其是 Piercing 与 Siege 的 0.75 关系。
3. 定义未来实现任务必须怎么验收：数据迁移、受控伤害 proof、现有 Long Rifles / Black Gunpowder / Plating 不回退、Leather Armor 数据种子何时才允许进入。
4. 明确 Leather Armor 未来数据种子的目标单位边界：当前只能是 `rifleman` 和 `mortar_team`；Dragonhawk / Gryphon 未实现时不能添加。
5. 更新 Human numeric packet、V9 evidence ledger、remaining gates、dual lane status，把当前相邻任务推进到 HN7-MODEL9。

Forbidden:

- 不修改 `src/game/GameData.ts`、`src/game/Game.ts`、`src/game/SimpleAI.ts`。
- 不把任何单位实际改成 `ArmorType.Medium`。
- 不新增 `RESEARCHES.studded_leather_armor` 等 Leather Armor 数据。
- 不新增 runtime 行为、AI、命令卡、研究队列、英雄、空军、物品、素材或完整三本战术。
- 不跑完整 runtime suite；本任务只做静态 proof。
- 不用 `tail` 截断验证输出。

Verification:

```bash
node --test tests/v9-hn7-medium-armor-migration-contract.spec.mjs tests/v9-hn7-leather-armor-source-boundary.spec.mjs
npm run build
npx tsc --noEmit -p tsconfig.app.json
```

Codex review:

- Accepted on 2026-04-16.
- GLM wrote the initial contract but stopped before proof/closeout; Codex took over.
- Local verification passed: Medium armor migration contract + Leather source boundary proof 28/28, `npm run build`, `npx tsc --noEmit -p tsconfig.app.json`.
- Result: next implementation may migrate `rifleman` to Medium with controlled damage proof. `mortar_team` needs a separate armor parity decision before any armorType change.

READY_FOR_NEXT_TASK: HN7-MODEL10 — Mortar Team armor parity decision

### Task 196 — V9 HN7-MODEL10 Mortar Team armor parity decision

Status: `accepted`.

Owner: GLM-style worker + Codex review.

Priority: Task195 deliberately did not approve a blind Mortar Team migration to Medium. Leather Armor can target Mortar Team by unit roster, but armorType parity is a separate modeling decision. This task gives GLM a source/static decision lane while Codex can separately implement Rifleman Medium migration.

Prerequisite: `Task 195 — V9 HN7-MODEL9 Medium armor migration contract` accepted.

Allowed files:

- `docs/V9_HN7_MORTAR_TEAM_ARMOR_PARITY_DECISION.zh-CN.md`
- `tests/v9-hn7-mortar-team-armor-parity-decision.spec.mjs`
- `docs/V9_HN7_MEDIUM_ARMOR_MIGRATION_CONTRACT.zh-CN.md`
- `docs/V9_HUMAN_NUMERIC_EXPANSION_PACKET.zh-CN.md`
- `docs/V9_MAINTENANCE_EXPANSION_EVIDENCE_LEDGER.zh-CN.md`
- `docs/V9_MAINTENANCE_EXPANSION_REMAINING_GATES.zh-CN.md`
- `docs/DUAL_LANE_STATUS.zh-CN.md`
- `docs/GLM_READY_TASK_QUEUE.md` only for closeout sync

Goal:

只做来源和模型决策，不改运行时代码：

1. 基于现有 HN7-SRC8 / MODEL9 证据，明确 `mortar_team` 的 armorType 是否应保持当前、迁移 Heavy，还是采用项目简化迁移 Medium。
2. 说明每个选项对 damage multiplier、Leather Armor targetUnitType、Black Gunpowder、Plating 和未来 runtime proof 的影响。
3. 给出推荐决策和下一步安全任务：如果推荐保持或 Heavy，Leather Armor 数据仍可按 targetUnitType 覆盖 Mortar Team；如果推荐 Medium，必须列出偏离 War3 的风险。
4. 更新 Human numeric packet、V9 evidence ledger、remaining gates、dual lane status，把当前相邻任务推进到 HN7-MODEL10。

Forbidden:

- 不修改 `src/game/GameData.ts`、`src/game/Game.ts`、`src/game/SimpleAI.ts`。
- 不实际修改 `mortar_team.armorType`。
- 不新增 Leather Armor 数据。
- 不新增 runtime 行为、AI、命令卡、研究队列、英雄、空军、物品、素材或完整三本战术。
- 不跑完整 runtime suite；本任务只做静态 proof。
- 不用 `tail` 截断验证输出。

Verification:

```bash
node --test tests/v9-hn7-mortar-team-armor-parity-decision.spec.mjs tests/v9-hn7-medium-armor-migration-contract.spec.mjs
npm run build
npx tsc --noEmit -p tsconfig.app.json
```

Codex review:

- Accepted on 2026-04-16.
- GLM wrote `docs/V9_HN7_MORTAR_TEAM_ARMOR_PARITY_DECISION.zh-CN.md` and `tests/v9-hn7-mortar-team-armor-parity-decision.spec.mjs`.
- Local verification passed: parity proof + MODEL9 proof 31/31, `npm run build`, `npx tsc --noEmit -p tsconfig.app.json`.
- Result: keep `mortar_team` as `ArmorType.Unarmored` for now. Leather Armor may still target `mortar_team` by unit roster through `targetUnitType`.

READY_FOR_NEXT_TASK: HN7-DATA8 — Leather Armor data seed

### Task 197 — V9 HN7-DATA8 Leather Armor data seed

Status: `accepted`.

Owner: GLM-style worker + Codex takeover.

Priority: Rifleman Medium migration and Mortar Team parity decision are now accepted. Leather Armor is the next adjacent Blacksmith item and no longer blocked by armorType uncertainty.

Prerequisite:

- `Task 194 — V9 HN7-SRC8 Leather Armor source and armor-type boundary` accepted.
- `Task 195 — V9 HN7-MODEL9 Medium armor migration contract` accepted.
- `Task 196 — V9 HN7-MODEL10 Mortar Team armor parity decision` accepted.
- `V9-CX85 — HN7 Rifleman Medium armor migration implementation` accepted.

Allowed files:

- `src/game/GameData.ts`
- `tests/v9-hn7-leather-armor-data-seed.spec.mjs`
- `docs/V9_HUMAN_NUMERIC_EXPANSION_PACKET.zh-CN.md`
- `docs/V9_MAINTENANCE_EXPANSION_EVIDENCE_LEDGER.zh-CN.md`
- `docs/V9_MAINTENANCE_EXPANSION_REMAINING_GATES.zh-CN.md`
- `docs/DUAL_LANE_STATUS.zh-CN.md`
- `docs/GLM_READY_TASK_QUEUE.md` only for closeout sync

Goal:

落地 Leather Armor 三段数据，不做 runtime 行为改造：

1. 新增 `RESEARCHES.studded_leather_armor`、`RESEARCHES.reinforced_leather_armor`、`RESEARCHES.dragonhide_armor`。
2. 数据值必须来自 HN7-SRC8：100/100/60s、150/175/75s、200/250/90s。
3. 前置链：L1 requires blacksmith；L2 requires keep + prerequisite L1；L3 requires castle + prerequisite L2。
4. 每级 effects 只给 `rifleman` 和 `mortar_team` `armor +2`。不要添加 Dragonhawk/Gryphon，因为当前项目未实现。
5. 把三段研究加入 `BUILDINGS.blacksmith.researches`。
6. 静态 proof 必须证明 Leather Armor 不按 armorType 谓词分配，不影响 footman/militia/knight/priest/sorceress/worker/tower。

Forbidden:

- 不修改任何单位 `armorType`。
- 不修改 `DAMAGE_MULTIPLIER_TABLE`。
- 不修改 `src/game/Game.ts`、`src/game/SimpleAI.ts` 或命令系统。
- 不新增 runtime 行为、AI、英雄、空军、物品、素材或完整三本战术。
- 不跑完整 runtime suite；本任务只做数据种子和静态 proof。
- 不用 `tail` 截断验证输出。

Verification:

```bash
node --test tests/v9-hn7-leather-armor-data-seed.spec.mjs tests/v9-hn7-leather-armor-source-boundary.spec.mjs tests/v9-hn7-mortar-team-armor-parity-decision.spec.mjs
npm run build
npx tsc --noEmit -p tsconfig.app.json
```

Codex review:

- Accepted on 2026-04-16.
- GLM wrote the data seed and static proof, then stopped while fixing a failing proof.
- Codex took over proof maintenance and accepted locally.
- Local verification passed: DATA8/source/parity/MODEL9 static 67/67, `npm run build`, `npx tsc --noEmit -p tsconfig.app.json`.
- Result: Leather Armor data now exists for `rifleman` + `mortar_team` only; runtime behavior still needs a separate smoke.

READY_FOR_NEXT_TASK: HN7-IMPL11 — Leather Armor runtime smoke

### Task 198 — V9 HN7-IMPL11 Leather Armor runtime smoke

Status: `accepted`.

Owner: GLM-style worker + Codex takeover.

Priority: HN7-DATA8 seeded the three Leather Armor researches. The next adjacent proof is that the existing runtime research queue consumes those data entries correctly.

Prerequisite:

- `Task 197 — V9 HN7-DATA8 Leather Armor data seed` accepted.

Allowed files:

- `tests/v9-hn7-leather-armor-runtime.spec.ts`
- `docs/V9_HUMAN_NUMERIC_EXPANSION_PACKET.zh-CN.md`
- `docs/V9_MAINTENANCE_EXPANSION_EVIDENCE_LEDGER.zh-CN.md`
- `docs/V9_MAINTENANCE_EXPANSION_REMAINING_GATES.zh-CN.md`
- `docs/DUAL_LANE_STATUS.zh-CN.md`
- `docs/GLM_READY_TASK_QUEUE.md` only for closeout sync

Goal:

证明 Leather Armor 数据能被现有 runtime 正确消费，不新增生产逻辑：

1. Blacksmith 命令卡能显示三段 Leather Armor 研究。
2. L1/L2/L3 研究完成后，`rifleman` 和 `mortar_team` 的 armor 分别累计 +2/+4/+6。
3. `footman`、`militia`、`knight`、`priest`、`sorceress`、`worker`、`tower` 不受 Leather Armor 影响。
4. 前置链正确：L2 需要 Keep + L1；L3 需要 Castle + L2。
5. 研究不修改 armorType：rifleman 仍是 Medium，mortar_team 仍是 Unarmored。

Forbidden:

- 不修改 `src/game/GameData.ts` 的 Leather Armor 数据。
- 不修改单位 armorType 或 `DAMAGE_MULTIPLIER_TABLE`。
- 不新增 AI、英雄、空军、物品、素材或完整三本战术。
- 不用 `tail` 截断验证输出。

Verification:

```bash
./scripts/run-runtime-tests.sh tests/v9-hn7-leather-armor-runtime.spec.ts tests/v9-hn7-ranged-upgrade-runtime.spec.ts tests/v9-hn7-plating-upgrade-runtime.spec.ts --reporter=list
node --test tests/v9-hn7-leather-armor-data-seed.spec.mjs
npm run build
npx tsc --noEmit -p tsconfig.app.json
./scripts/cleanup-local-runtime.sh
```

Closeout:

- Accepted on 2026-04-16.
- GLM Task198 进入 interrupted / false-running 状态且没有产出 runtime spec；Codex 接管实现 `tests/v9-hn7-leather-armor-runtime.spec.ts`。
- Codex runtime 发现 Leather Armor 后 Blacksmith 已有 13 个研究按钮，旧 12 格命令卡会截断龙皮甲；`COMMAND_CARD_SLOT_COUNT` 和 CSS 网格已升级为 16 格。
- Local verification passed:
  - `./scripts/run-runtime-tests.sh tests/v9-hn7-leather-armor-runtime.spec.ts --reporter=list` -> 4/4
  - `./scripts/run-runtime-tests.sh tests/v9-hn7-ranged-upgrade-runtime.spec.ts tests/v9-hn7-plating-upgrade-runtime.spec.ts --reporter=list` -> 14/14
  - `node --test tests/v9-hn7-plating-upgrade-chain-closure.spec.mjs tests/v9-hn7-leather-armor-data-seed.spec.mjs tests/v9-hn7-leather-armor-source-boundary.spec.mjs tests/v9-hn7-mortar-team-armor-parity-decision.spec.mjs tests/v9-hn7-medium-armor-migration-contract.spec.mjs` -> 81/81
  - `npm run build`
  - `npx tsc --noEmit -p tsconfig.app.json`
- Result: Leather Armor 三段在真实 runtime 中可见、前置正确、完成后 rifleman/mortar_team 累计 armor +6，新产出单位继承，非目标单位和塔不受影响。

READY_FOR_NEXT_TASK: HN7-CLOSE12 — Leather Armor closure inventory

### Task 199 — V9 HN7-CLOSE12 Leather Armor closure inventory

Status: `accepted`.

Owner: GLM-style worker + Codex takeover.

Priority: HN7 Leather Armor 已有 source boundary、Rifleman Medium 迁移合同、Mortar Team 护甲归属决策、DATA8 数据种子和 IMPL11 runtime smoke；下一步需要一份 closure inventory，防止后续重复派发 Leather Armor 或把它误扩成英雄/空军/物品/素材。

Prerequisites:

- `Task 194 — V9 HN7-SRC8 Leather Armor source and armor-type boundary` accepted.
- `Task 195 — V9 HN7-MODEL9 Medium armor migration contract` accepted.
- `Task 196 — V9 HN7-MODEL10 Mortar Team armor parity decision` accepted.
- `Task 197 — V9 HN7-DATA8 Leather Armor data seed` accepted.
- `Task 198 — V9 HN7-IMPL11 Leather Armor runtime smoke` accepted.

Allowed files:

- `docs/V9_HN7_LEATHER_ARMOR_CLOSURE_INVENTORY.zh-CN.md`
- `tests/v9-hn7-leather-armor-closure.spec.mjs`
- `docs/V9_HUMAN_NUMERIC_EXPANSION_PACKET.zh-CN.md`
- `docs/V9_MAINTENANCE_EXPANSION_EVIDENCE_LEDGER.zh-CN.md`
- `docs/V9_MAINTENANCE_EXPANSION_REMAINING_GATES.zh-CN.md`
- `docs/DUAL_LANE_STATUS.zh-CN.md`
- `docs/GLM_READY_TASK_QUEUE.md` only for closeout sync

Goal:

写一个闭环盘点和静态 proof，直白证明：

1. Leather Armor 来源包定义了 Studded / Reinforced / Dragonhide 的成本、时间和阶段前置。
2. Rifleman 已单独迁移为 Medium；Mortar Team 当前保留 Unarmored，但 Leather Armor 通过 `targetUnitType` 仍覆盖 mortar_team。
3. DATA8 只新增三段 Leather Armor 数据和 Blacksmith research hook。
4. IMPL11 runtime 已证明命令卡显示、前置、累计 armor +6、新单位继承和非目标排除。
5. 命令卡容量已升到 16 格，能容纳 Blacksmith 13 个研究按钮。
6. 禁区仍成立：不新增英雄、空军、物品、素材、AI Castle/Knight 策略或新的护甲类型迁移。

Forbidden:

- 不修改 `src/game/GameData.ts`、`src/game/Game.ts`、`src/styles.css` 或任何 runtime 行为。
- 不新增新的 Leather Armor runtime 测试；只引用已存在 runtime 证据。
- 不把 Mortar Team 改成 Heavy，不改伤害表。
- 不用 `tail` 截断验证输出。

Verification:

```bash
node --test tests/v9-hn7-leather-armor-closure.spec.mjs tests/v9-hn7-leather-armor-data-seed.spec.mjs tests/v9-hn7-medium-armor-migration-contract.spec.mjs tests/v9-hn7-mortar-team-armor-parity-decision.spec.mjs
npm run build
npx tsc --noEmit -p tsconfig.app.json
./scripts/cleanup-local-runtime.sh
```

Closeout:

- Accepted on 2026-04-16.
- GLM wrote the closure inventory document but stopped in interrupted / same-title freeze before creating the static proof.
- Codex took over, removed stale source line numbers from the doc, and added `tests/v9-hn7-leather-armor-closure.spec.mjs`.
- Local verification passed:
  - `node --test tests/v9-hn7-leather-armor-closure.spec.mjs` -> 18/18
  - `node --test tests/v9-hn7-leather-armor-closure.spec.mjs tests/v9-hn7-leather-armor-data-seed.spec.mjs tests/v9-hn7-medium-armor-migration-contract.spec.mjs tests/v9-hn7-mortar-team-armor-parity-decision.spec.mjs tests/v9-hn7-leather-armor-source-boundary.spec.mjs tests/v9-hn7-plating-upgrade-chain-closure.spec.mjs` -> 99/99
  - `npm run build`
  - `npx tsc --noEmit -p tsconfig.app.json`
- Result: Leather Armor chain is now closed from SRC8 → MODEL9 → MODEL10 → DATA8 → IMPL11, including the 16-slot command-card capacity contract.

READY_FOR_NEXT_TASK: HN7-CLOSE13 — Human Blacksmith branch global closure

### Task 200 — V9 HN7-CLOSE13 Human Blacksmith branch global closure

Status: `accepted`.

Owner: GLM-style worker + Codex takeover.

Priority: HN7 has accumulated many accepted Blacksmith/Barracks upgrade subchains. Before opening a new Human branch, create one global closure inventory so the project knows exactly what HN7 finished and what remains out of scope.

Prerequisites:

- Melee weapon chain SRC3/SRC4/DATA3/DATA4/IMPL4/IMPL5/CLOSE6 accepted.
- Ranged weapon chain SRC5/DATA5/IMPL6/CLOSE7 accepted.
- Plating armor chain SRC6/DATA6/IMPL7/CLOSE8 accepted.
- Animal War Training SRC7/MODEL8/DATA7/IMPL9/CLOSE10/AI11/AI12/AI13 accepted.
- Blacksmith upgrade AI strategy/implementation/closure accepted.
- Leather Armor SRC8/MODEL9/MODEL10/DATA8/IMPL11/CLOSE12 accepted.

Allowed files:

- `docs/V9_HN7_BLACKSMITH_BRANCH_GLOBAL_CLOSURE.zh-CN.md`
- `tests/v9-hn7-blacksmith-branch-global-closure.spec.mjs`
- `docs/V9_HUMAN_NUMERIC_EXPANSION_PACKET.zh-CN.md`
- `docs/V9_MAINTENANCE_EXPANSION_EVIDENCE_LEDGER.zh-CN.md`
- `docs/V9_MAINTENANCE_EXPANSION_REMAINING_GATES.zh-CN.md`
- `docs/DUAL_LANE_STATUS.zh-CN.md`
- `docs/GLM_READY_TASK_QUEUE.md` only for closeout sync

Goal:

写一份 HN7 全局闭环盘点和静态 proof，直白说明：

1. Blacksmith 已有近战武器三段、远程火药三段、Plating 三段、Leather Armor 三段、Long Rifles。
2. Barracks 已有 Animal War Training 单级研究。
3. 研究间前置、三本建筑门槛、多建筑前置、maxHp effect、命令卡 16 格容量都有 proof。
4. AI 已能在同规则下使用 Blacksmith 三段升级和 AWT；但 AI Castle/Knight strategy 仍未单独完成，不能误宣称。
5. HN7 已完成的链路和未打开的禁区必须分清：英雄、空军、物品、素材、第二阵营、多人均未打开。
6. 给出下一步安全方向：Human global closure、AI Castle/Knight strategy、Hero branch contract，三者都必须另开任务。

Forbidden:

- 不修改 `src/game/GameData.ts`、`src/game/Game.ts`、`src/game/SimpleAI.ts`、CSS 或 runtime 行为。
- 不新增 runtime 测试；只写 closure doc 和静态 proof。
- 不把 HN7 写成完整 Human 已完成。
- 不批准英雄、空军、物品、素材或 Mortar Heavy parity 自动进入。

Verification:

```bash
node --test tests/v9-hn7-blacksmith-branch-global-closure.spec.mjs tests/v9-hn7-leather-armor-closure.spec.mjs tests/v9-hn7-blacksmith-upgrade-ai-closure.spec.mjs tests/v9-hn7-animal-war-training-ai-closure.spec.mjs
npm run build
npx tsc --noEmit -p tsconfig.app.json
./scripts/cleanup-local-runtime.sh
```

Closeout:

- Accepted on 2026-04-16.
- GLM wrote `docs/V9_HN7_BLACKSMITH_BRANCH_GLOBAL_CLOSURE.zh-CN.md` but stopped before producing a complete proof/closeout.
- Codex took over, corrected the command-card wording to "13 research buttons fit in 16 slots with 3 empty slots" rather than implying extra actions, and added `tests/v9-hn7-blacksmith-branch-global-closure.spec.mjs`.
- Codex also fixed a stale AWT AI closure assertion so it checks the AWT block boundary rather than incorrectly forbidding all later Blacksmith AI research logic.
- Local verification passed:
  - `node --test tests/v9-hn7-blacksmith-branch-global-closure.spec.mjs` -> 22/22
  - `node --test tests/v9-hn7-blacksmith-branch-global-closure.spec.mjs tests/v9-hn7-leather-armor-closure.spec.mjs tests/v9-hn7-blacksmith-upgrade-ai-closure.spec.mjs tests/v9-hn7-animal-war-training-ai-closure.spec.mjs` -> 92/92
  - `npm run build`
  - `npx tsc --noEmit -p tsconfig.app.json`
- Result: HN7 Blacksmith/Barracks upgrade branch is globally closed as a branch. This does not mean complete Human is closed.

READY_FOR_NEXT_TASK: HUMAN-GAP1 — Human core global gap inventory

### Task 201 — V9 HUMAN-GAP1 Human core global gap inventory

Status: `accepted`.

Owner: GLM-style worker + Codex review.

Priority: Task200 closes the Blacksmith/Barracks upgrade branch, but the user cares about complete Human parity. Before opening another implementation branch, create a full Human gap inventory from the current trunk so task generation can choose the next adjacent branch from real gaps instead of momentum.

Prerequisites:

- Task200 accepted.
- Current Human data/runtime/status docs are available in the repo.

Allowed files:

- `docs/V9_HUMAN_CORE_GLOBAL_GAP_INVENTORY.zh-CN.md`
- `tests/v9-human-core-global-gap-inventory.spec.mjs`
- `docs/V9_HUMAN_NUMERIC_EXPANSION_PACKET.zh-CN.md`
- `docs/V9_MAINTENANCE_EXPANSION_EVIDENCE_LEDGER.zh-CN.md`
- `docs/V9_MAINTENANCE_EXPANSION_REMAINING_GATES.zh-CN.md`
- `docs/DUAL_LANE_STATUS.zh-CN.md`
- `docs/GLM_READY_TASK_QUEUE.md` only for closeout sync

Goal:

写一份完整 Human 核心缺口盘点和静态 proof，直白说明：

1. 当前已经具备哪些 Human 核心对象：Town Hall / Keep / Castle、Barracks、Blacksmith、Lumber Mill、Workshop、Arcane Sanctum、Farm、Guard Tower、Worker、Footman、Rifleman、Mortar Team、Priest、Sorceress、Knight，以及已接入的能力/研究/AI。
2. 距离 War3 Human 仍缺哪些大块：Altar + 四英雄、Spell Breaker、Flying Machine、Gryphon Rider、Dragonhawk Rider、Siege Engine、Spell Tower / Arcane Tower 细节、Paladin/Archmage/MK/Blood Mage 技能、商店/物品、完整三本 AI、地图/战役/多人等。
3. 按“可复用底座优先、玩家可见价值、风险、依赖”排序下一批候选分支，只推荐 1 个下一张相邻实现任务。
4. 不得把缺口盘点写成已经实现，不得把全部缺口一次性进入 live queue。

Forbidden:

- 不修改 `src/game/GameData.ts`、`src/game/Game.ts`、`src/game/SimpleAI.ts`、CSS 或 runtime 行为。
- 不新增 runtime 测试；只写 inventory doc 和静态 proof。
- 不打开第二阵营、多人、公开发布或素材导入。
- 不自动生成一长串 implementation live queue；只给下一张最相邻任务。

Verification:

```bash
node --test tests/v9-human-core-global-gap-inventory.spec.mjs tests/v9-hn7-blacksmith-branch-global-closure.spec.mjs
npm run build
npx tsc --noEmit -p tsconfig.app.json
./scripts/cleanup-local-runtime.sh
```

Closeout requirements:
- Start your final closeout with the exact line: JOB_COMPLETE: <job-id>
- If truly blocked, emit the exact line: JOB_BLOCKED: <job-id>
- Include sections for files changed, verification run, and remaining unknowns.
- End with an exact line that begins with READY_FOR_NEXT_TASK: followed by the next safe continuation.
- Keep the work within the requested scope; do not widen ownership on your own.

Closeout:

- Accepted on 2026-04-16.
- GLM wrote `docs/V9_HUMAN_CORE_GLOBAL_GAP_INVENTORY.zh-CN.md` and `tests/v9-human-core-global-gap-inventory.spec.mjs`, then returned a completed state.
- Codex review found two material wording risks:
  - The first draft described several current links as `完整`, which could be read as full Human parity.
  - The AI section overclaimed Castle/Knight coverage by implying AI already uses Keep -> Castle and active Knight production.
- Codex corrected the document to use "已实现最小链路", explicitly mark AI Keep -> Castle, active Knight production, and Knight tactics as unfinished, and strengthened the static proof so these claims cannot regress.
- Local verification passed:
  - `node --test tests/v9-human-core-global-gap-inventory.spec.mjs` -> 24/24
  - `node --test tests/v9-human-core-global-gap-inventory.spec.mjs tests/v9-hn7-blacksmith-branch-global-closure.spec.mjs` -> 46/46
  - `npm run build`
  - `npx tsc --noEmit -p tsconfig.app.json`
- Result: Human core gap inventory is accepted. Complete Human is still not closed. The next adjacent branch is an Altar of Kings + Paladin contract, not a broad hero implementation.

READY_FOR_NEXT_TASK: HERO1 — Altar + Paladin branch contract

### Task 202 — V9 HERO1 Altar + Paladin branch contract

Status: `accepted`.

Owner: GLM-style worker + Codex review.

Priority: Task201 accepted that the biggest next Human gap is the hero system. The next move must be a narrow contract for the first hero entry, not a full hero implementation.

Prerequisites:

- Task201 accepted.
- Current ability, command-card, tier, prerequisite, and resurrection/rebuild patterns are available for reference.

Allowed files:

- `docs/V9_HERO1_ALTAR_PALADIN_CONTRACT.zh-CN.md`
- `tests/v9-hero1-altar-paladin-contract.spec.mjs`
- `docs/V9_HUMAN_NUMERIC_EXPANSION_PACKET.zh-CN.md`
- `docs/V9_MAINTENANCE_EXPANSION_EVIDENCE_LEDGER.zh-CN.md`
- `docs/V9_MAINTENANCE_EXPANSION_REMAINING_GATES.zh-CN.md`
- `docs/DUAL_LANE_STATUS.zh-CN.md`
- `docs/GLM_READY_TASK_QUEUE.md` only for closeout sync

Goal:

写一份 Altar of Kings + Paladin 英雄入口合同和静态 proof，必须直白定义：

1. `Altar of Kings` 作为英雄入口建筑需要哪些数据字段、建造前置、命令卡入口和可见说明。
2. `Paladin` 作为第一名英雄需要哪些最小英雄字段：hero flag、等级、经验、技能点、死亡/复活状态、唯一性限制、训练/召唤入口。
3. 第一条英雄能力只允许选择 `Holy Light` 最小切片，并说明它如何复用或扩展当前 `AbilityDef` / mana / command-card 模型。
4. 英雄复活机制的最小合同：死亡后不能当普通单位清理掉，Altar 提供复活入口，但本任务不实现 runtime。
5. 后续切片顺序：Altar data seed → Paladin data seed → Holy Light data seed → summon/train runtime → death/revive runtime → XP/level minimal proof。

Forbidden:

- 不修改 `src/game/GameData.ts`、`src/game/Game.ts`、`src/game/SimpleAI.ts`、CSS、runtime 或 asset 文件。
- 不新增 runtime 测试；只写合同文档和静态 proof。
- 不实现 Paladin、Altar、Holy Light、XP、revive 或 hero UI。
- 不同时打开 Archmage、Mountain King、Blood Mage、items/shop、air units、second race、multiplayer、official Warcraft assets 或 public release。
- 不把 Task201 的完整 Human 缺口盘点改写成英雄已实现。

Verification:

```bash
node --test tests/v9-hero1-altar-paladin-contract.spec.mjs tests/v9-human-core-global-gap-inventory.spec.mjs
npm run build
npx tsc --noEmit -p tsconfig.app.json
./scripts/cleanup-local-runtime.sh
```

Closeout requirements:
- Start your final closeout with the exact line: JOB_COMPLETE: <job-id>
- If truly blocked, emit the exact line: JOB_BLOCKED: <job-id>
- Include sections for files changed, verification run, and remaining unknowns.
- End with an exact line that begins with READY_FOR_NEXT_TASK: followed by the next safe continuation.
- Keep the work within the requested scope; do not widen ownership on your own.

Closeout:

- Accepted on 2026-04-16.
- GLM produced `docs/V9_HERO1_ALTAR_PALADIN_CONTRACT.zh-CN.md` and `tests/v9-hero1-altar-paladin-contract.spec.mjs`.
- Codex review accepted the structure but corrected one quality issue: exact Altar / Paladin / Holy Light values were written as "War3 ROC original" without a source boundary.
- Codex changed those values to candidate references and inserted `HERO2-SRC1` as a mandatory source boundary before any `GameData.ts` data seed.
- Local verification passed:
  - `node --test tests/v9-hero1-altar-paladin-contract.spec.mjs tests/v9-human-core-global-gap-inventory.spec.mjs` -> 45/45
  - `node --test tests/v9-human-core-global-gap-inventory.spec.mjs tests/v9-hn7-blacksmith-branch-global-closure.spec.mjs` -> 46/46
  - `npm run build`
  - `npx tsc --noEmit -p tsconfig.app.json`
- Result: HERO1 contract is accepted as a contract only. Altar, Paladin, Holy Light, XP, revive, and hero runtime are still not implemented.

READY_FOR_NEXT_TASK: HERO2-SRC1 — Altar + Paladin + Holy Light source boundary

### Task 203 — V9 HERO2-SRC1 Altar + Paladin + Holy Light source boundary

Status: `accepted`.

Owner: GLM-style worker + Codex review.

Priority: HERO1 accepted the hero-entry contract but deliberately downgraded all exact numbers to candidate references. Before any data seed can enter `GameData.ts`, source values must be reconciled and documented.

Prerequisites:

- Task202 accepted.
- `docs/V9_HERO1_ALTAR_PALADIN_CONTRACT.zh-CN.md` exists.

Allowed files:

- `docs/V9_HERO2_ALTAR_PALADIN_SOURCE_BOUNDARY.zh-CN.md`
- `tests/v9-hero2-altar-paladin-source-boundary.spec.mjs`
- `docs/V9_HERO1_ALTAR_PALADIN_CONTRACT.zh-CN.md`
- `docs/V9_HUMAN_NUMERIC_EXPANSION_PACKET.zh-CN.md`
- `docs/V9_MAINTENANCE_EXPANSION_EVIDENCE_LEDGER.zh-CN.md`
- `docs/V9_MAINTENANCE_EXPANSION_REMAINING_GATES.zh-CN.md`
- `docs/DUAL_LANE_STATUS.zh-CN.md`
- `docs/GLM_READY_TASK_QUEUE.md` only for closeout sync

Goal:

写一份来源边界包和静态 proof，核对并固定进入后续 data seed 的候选值：

1. Altar of Kings: build cost、build time、hp、size、T1 availability。
2. Paladin level 1: summon cost、summon time、hp、mana、armor、attack/range/cooldown/speed/supply。
3. Holy Light level 1: mana cost、cooldown、range、heal amount、target rule。
4. Revive: revive cost/time 是否采用固定候选值、比例公式或暂缓实现。
5. 来源层级：优先官方/主源；非官方资料只能做交叉校验或冲突样本；冲突时记录 adopted value 和理由。

Forbidden:

- 不修改 `src/game/GameData.ts`、`src/game/Game.ts`、`src/game/SimpleAI.ts`、CSS、runtime 或 asset 文件。
- 不新增 runtime 测试；只写 source boundary 文档和静态 proof。
- 不实现 Altar、Paladin、Holy Light、revive、XP、英雄 UI 或四英雄。
- 不导入官方 Warcraft 素材或来源不明素材。
- 不把候选值写成已实现。

Verification:

```bash
node --test tests/v9-hero2-altar-paladin-source-boundary.spec.mjs tests/v9-hero1-altar-paladin-contract.spec.mjs
npm run build
npx tsc --noEmit -p tsconfig.app.json
./scripts/cleanup-local-runtime.sh
```

Codex acceptance:

- GLM produced the source boundary document and proof.
- Codex corrected the Holy Light mana source claim: current Blizzard Classic page lists Level 1 mana cost as 65; the 75-mana claim is recorded only as a non-adopted historical sample, not as the main source.
- Codex removed `manaRegen: 0.5` from the Paladin adopted data summary because that value was borrowed from Priest/Sorceress rather than sourced or mapped.
- Verification passed:
  - `node --test tests/v9-hero2-altar-paladin-source-boundary.spec.mjs tests/v9-hero1-altar-paladin-contract.spec.mjs` -> 46/46
  - `npm run build`
  - `npx tsc --noEmit -p tsconfig.app.json`

READY_FOR_NEXT_TASK: HERO3-DATA1 — Altar of Kings data seed

### Task 204 — V9 HERO3-DATA1 Altar of Kings data seed

Status: `accepted`.

Owner: GLM-style worker + Codex review.

Priority: HERO2-SRC1 accepted the Altar source boundary. The next safe adjacent step is only the Altar data seed, not Paladin, Holy Light, revive, XP, runtime, or command-surface exposure.

Prerequisites:

- Task203 accepted.
- `docs/V9_HERO2_ALTAR_PALADIN_SOURCE_BOUNDARY.zh-CN.md` exists and records adopted Altar values.

Allowed files:

- `src/game/GameData.ts`
- `tests/v9-hero3-altar-data-seed.spec.mjs`
- `docs/V9_HUMAN_NUMERIC_EXPANSION_PACKET.zh-CN.md`
- `docs/V9_MAINTENANCE_EXPANSION_EVIDENCE_LEDGER.zh-CN.md`
- `docs/V9_MAINTENANCE_EXPANSION_REMAINING_GATES.zh-CN.md`
- `docs/DUAL_LANE_STATUS.zh-CN.md`
- `docs/GLM_READY_TASK_QUEUE.md` only for closeout sync

Goal:

Add the minimum `altar_of_kings` building definition to `BUILDINGS` using HERO2-SRC1 adopted values:

1. key/name/description: `altar_of_kings` / `国王祭坛` / clear hero altar description.
2. cost: 180 gold / 50 lumber.
3. buildTime: 60.
4. hp: 900.
5. supply: 0.
6. size: 3.
7. armor: 5.
8. armorType: `ArmorType.Heavy` as the project-local Fortified mapping.
9. trains: `['paladin']` as future contract data only.

Forbidden:

- Do not add `paladin` to `UNITS`.
- Do not add `holy_light` to `ABILITIES`.
- Do not expose Altar in the worker build menu or any command card.
- Do not implement construction/runtime, hero uniqueness, summon, revive, XP, skill points, hero UI, or pathing.
- Do not add runtime tests.
- Do not add official Warcraft assets or new visual assets.
- Do not change `src/game/Game.ts`, `src/game/SimpleAI.ts`, CSS, HTML, or asset files.

Proof requirements:

- Static proof must read `GameData.ts` and the HERO2 source boundary document.
- Prove `BUILDINGS.altar_of_kings` has exactly the adopted values listed above.
- Prove no `UNITS.paladin` exists yet.
- Prove no `ABILITIES.holy_light` exists yet.
- Prove worker build menu / command-surface exposure is not changed by this task.
- Prove source boundary still says Altar data comes after HERO2-SRC1 and before Paladin/Holy Light data.

Verification:

```bash
node --test tests/v9-hero3-altar-data-seed.spec.mjs tests/v9-hero2-altar-paladin-source-boundary.spec.mjs tests/v9-hero1-altar-paladin-contract.spec.mjs
npm run build
npx tsc --noEmit -p tsconfig.app.json
./scripts/cleanup-local-runtime.sh
```

Codex acceptance:

- GLM added `BUILDINGS.altar_of_kings` and a focused static proof.
- GLM initially removed `armor: 5` because `BuildingDef` did not yet support it.
- Codex corrected that by adding optional `armor?: number` to `BuildingDef` and restoring `armor: 5` on `altar_of_kings`; runtime consumption remains a later task.
- Codex updated earlier HERO1/HERO2 proofs so they no longer fail just because the planned Altar data seed now exists.
- Verification passed:
  - `node --test tests/v9-hero3-altar-data-seed.spec.mjs tests/v9-hero2-altar-paladin-source-boundary.spec.mjs tests/v9-hero1-altar-paladin-contract.spec.mjs` -> 62/62
  - `npm run build`
  - `npx tsc --noEmit -p tsconfig.app.json`

READY_FOR_NEXT_TASK: HERO4-DATA2 — Paladin data seed

### Task 205 — V9 HERO4-DATA2 Paladin data seed

Status: `accepted`.

Owner: GLM-style worker + Codex review.

Priority: HERO3 accepted the Altar data seed. The next safe adjacent step is only the Paladin unit data seed, with no summon/runtime/command-card/hero UI implementation.

Prerequisites:

- Task204 accepted.
- `BUILDINGS.altar_of_kings` exists and has `trains: ['paladin']`.
- `docs/V9_HERO2_ALTAR_PALADIN_SOURCE_BOUNDARY.zh-CN.md` exists and records adopted Paladin values.

Allowed files:

- `src/game/GameData.ts`
- `tests/v9-hero4-paladin-data-seed.spec.mjs`
- `tests/v9-hero1-altar-paladin-contract.spec.mjs`
- `tests/v9-hero2-altar-paladin-source-boundary.spec.mjs`
- `tests/v9-hero3-altar-data-seed.spec.mjs`
- `docs/V9_HUMAN_NUMERIC_EXPANSION_PACKET.zh-CN.md`
- `docs/V9_MAINTENANCE_EXPANSION_EVIDENCE_LEDGER.zh-CN.md`
- `docs/V9_MAINTENANCE_EXPANSION_REMAINING_GATES.zh-CN.md`
- `docs/DUAL_LANE_STATUS.zh-CN.md`
- `docs/GLM_READY_TASK_QUEUE.md` only for closeout sync

Goal:

Add the minimum `paladin` unit definition to `UNITS` using HERO2-SRC1 adopted values:

1. key/name/description: `paladin` / `圣骑士` / clear hero description.
2. cost: 425 gold / 100 lumber.
3. trainTime: 55.
4. hp: 650.
5. speed: 3.0.
6. supply: 5.
7. attackDamage: 24.
8. attackRange: 1.0.
9. attackCooldown: 2.2.
10. armor: 4.
11. sightRange: 10.
12. canGather: false.
13. attackType: `AttackType.Normal` as the project-local Hero attack mapping.
14. armorType: `ArmorType.Heavy` as the project-local Hero armor mapping.
15. maxMana: 255.
16. hero fields: `isHero: true`, `heroLevel: 1`, `heroXP: 0`, `heroSkillPoints: 1`, `isDead: false`.

Forbidden:

- Do not add `holy_light` to `ABILITIES`.
- Do not implement Altar summon, Paladin runtime, hero uniqueness, death/revive, XP gain, skill learning, command card, selection UI, visuals, or AI.
- Do not add `manaRegen` unless the source/mapping is explicitly established in a later task.
- Do not expose Paladin through any runtime path beyond the data table.
- Do not add runtime tests.
- Do not add official Warcraft assets or new visual assets.
- Do not change `src/game/Game.ts`, `src/game/SimpleAI.ts`, CSS, HTML, or asset files.

Proof requirements:

- Static proof must read `GameData.ts`, HERO2 source boundary, and HERO3 Altar proof.
- Prove `UNITS.paladin` has exactly the adopted values listed above.
- Prove `UnitDef` supports the hero fields as optional data fields.
- Prove `BUILDINGS.altar_of_kings.trains` still references `paladin`.
- Prove no `ABILITIES.holy_light` exists yet.
- Prove no `Game.ts` or `SimpleAI.ts` runtime reference to `paladin`.
- Update older HERO1/HERO2/HERO3 proofs from “Paladin must not exist yet” to “Paladin data may exist after HERO4, but runtime/Holy Light still must not exist”.

Verification:

```bash
node --test tests/v9-hero4-paladin-data-seed.spec.mjs tests/v9-hero3-altar-data-seed.spec.mjs tests/v9-hero2-altar-paladin-source-boundary.spec.mjs tests/v9-hero1-altar-paladin-contract.spec.mjs
npm run build
npx tsc --noEmit -p tsconfig.app.json
./scripts/cleanup-local-runtime.sh
```

Closeout requirements:
- Start your final closeout with the exact line: JOB_COMPLETE: <job-id>
- If truly blocked, emit the exact line: JOB_BLOCKED: <job-id>
- Include sections for files changed, verification run, and remaining unknowns.
- End with an exact line that begins with READY_FOR_NEXT_TASK: followed by the next safe continuation.
- Keep the work within the requested scope; do not widen ownership on your own.

Closeout note:

- GLM added optional hero fields to `UnitDef`, added `UNITS.paladin`, and updated HERO1/HERO2/HERO3 proofs to the new stage-aware boundary.
- Codex locally reviewed the result and accepted it: Paladin data matches HERO2 adopted values, `manaRegen` remains absent, `Game.ts` and `SimpleAI.ts` still do not reference Paladin, and `ABILITIES.holy_light` still does not exist.
- Verification passed:
  - `node --test tests/v9-hero4-paladin-data-seed.spec.mjs tests/v9-hero3-altar-data-seed.spec.mjs tests/v9-hero2-altar-paladin-source-boundary.spec.mjs tests/v9-hero1-altar-paladin-contract.spec.mjs` -> 82/82
  - `node --test tests/lane-feed.spec.mjs tests/dual-lane-companion.spec.mjs` -> 80/80
  - `npm run build`
  - `npx tsc --noEmit -p tsconfig.app.json`

READY_FOR_NEXT_TASK: HERO5-DATA3 — Holy Light ability data seed

### Task 206 — V9 HERO5-DATA3 Holy Light ability data seed

Status: `accepted`.

Owner: GLM-style worker + Codex takeover.

Priority: HERO4 accepted the Paladin data seed. The next safe adjacent step is only the Holy Light ability data seed, with no runtime spell casting or hero command surface.

Prerequisites:

- Task205 accepted.
- `UNITS.paladin` exists and has `isHero: true`.
- `docs/V9_HERO2_ALTAR_PALADIN_SOURCE_BOUNDARY.zh-CN.md` records Holy Light adopted values.
- `ABILITIES.holy_light` did not exist before this task.

Allowed files:

- `src/game/GameData.ts`
- `tests/v9-hero5-holy-light-data-seed.spec.mjs`
- `tests/v9-hero1-altar-paladin-contract.spec.mjs`
- `tests/v9-hero2-altar-paladin-source-boundary.spec.mjs`
- `tests/v9-hero3-altar-data-seed.spec.mjs`
- `tests/v9-hero4-paladin-data-seed.spec.mjs`
- `docs/V9_HUMAN_NUMERIC_EXPANSION_PACKET.zh-CN.md`
- `docs/V9_MAINTENANCE_EXPANSION_EVIDENCE_LEDGER.zh-CN.md`
- `docs/V9_MAINTENANCE_EXPANSION_REMAINING_GATES.zh-CN.md`
- `docs/DUAL_LANE_STATUS.zh-CN.md`
- `docs/GLM_READY_TASK_QUEUE.md` only for closeout sync

Goal:

Add the minimum `holy_light` ability definition to `ABILITIES` using HERO2-SRC1 adopted values:

1. key/name: `holy_light` / `圣光术`.
2. ownerType: `paladin`.
3. cost: `{ mana: 65 }`.
4. cooldown: `5`.
5. range: `8.0`.
6. targetRule: ally, alive, injured, and not self. Add optional `excludeSelf?: boolean` to `TargetRule` if needed, then set `excludeSelf: true`.
7. effectType: `flatHeal`.
8. effectValue: `200`.
9. duration: `0`.
10. stackingRule: `none`.

Forbidden:

- Do not modify `src/game/Game.ts`, `src/game/SimpleAI.ts`, CSS, HTML, assets, or runtime harness files.
- Do not implement Holy Light casting, autocast, command-card buttons, Paladin mana initialization, cooldown timers, target selection, undead damage, hero skill learning, hero UI, revive, XP, summon, Altar runtime, uniqueness rules, AI, or visuals.
- Do not add runtime tests.
- Do not add `manaRegen` to Paladin.
- Do not add official Warcraft assets or new visual assets.

Proof requirements:

- Static proof must read `GameData.ts`, HERO2 source boundary, HERO4 Paladin proof, `Game.ts`, and `SimpleAI.ts`.
- Prove `ABILITIES.holy_light` has exactly the adopted values listed above.
- Prove `AbilityDef` / `TargetRule` can express the not-self target rule without changing runtime behavior.
- Prove `UNITS.paladin` still exists, still has `maxMana: 255`, and still has no `manaRegen`.
- Prove no `Game.ts` or `SimpleAI.ts` runtime reference to `holy_light` or Paladin casting exists.
- Update older HERO1/HERO2/HERO3/HERO4 proofs from “Holy Light must not exist yet” to “Holy Light data may exist after HERO5, but runtime/command-card/hero UI still must not exist”.

Verification:

```bash
node --test tests/v9-hero5-holy-light-data-seed.spec.mjs tests/v9-hero4-paladin-data-seed.spec.mjs tests/v9-hero3-altar-data-seed.spec.mjs tests/v9-hero2-altar-paladin-source-boundary.spec.mjs tests/v9-hero1-altar-paladin-contract.spec.mjs
npm run build
npx tsc --noEmit -p tsconfig.app.json
./scripts/cleanup-local-runtime.sh
```

Closeout requirements:

- Start your final closeout with the exact line: JOB_COMPLETE: <job-id>
- If truly blocked, emit the exact line: JOB_BLOCKED: <job-id>
- Include sections for files changed, verification run, and remaining unknowns.
- End with an exact line that begins with READY_FOR_NEXT_TASK: followed by the next safe continuation.
- Keep the work within the requested scope; do not widen ownership on your own.

Closeout note:

- GLM wrote the core data seed (`TargetRule.excludeSelf?` and `ABILITIES.holy_light`) but stopped on an API/network error before updating all proofs or writing the HERO5 proof.
- Codex took over, updated HERO1/HERO2/HERO4 stage boundaries, added `tests/v9-hero5-holy-light-data-seed.spec.mjs`, and verified the scope remains data-only.
- Verification passed:
  - `node --test tests/v9-hero5-holy-light-data-seed.spec.mjs tests/v9-hero4-paladin-data-seed.spec.mjs tests/v9-hero3-altar-data-seed.spec.mjs tests/v9-hero2-altar-paladin-source-boundary.spec.mjs tests/v9-hero1-altar-paladin-contract.spec.mjs` -> 94/94
  - `npm run build`
  - `npx tsc --noEmit -p tsconfig.app.json`

READY_FOR_NEXT_TASK: HERO6-CONTRACT4 — Altar runtime exposure contract

### Task 207 — V9 HERO6-CONTRACT4 Altar runtime exposure contract

Status: `accepted`.

Owner: GLM-style worker + Codex review.

Priority: Altar, Paladin, and Holy Light now exist as data. The next implementation risk is that adding `altar_of_kings` to the worker build menu may automatically expose generic `trains: ['paladin']` through the existing building command-card path before hero uniqueness, summon semantics, mana initialization, or revive are ready. Lock the runtime split before writing code.

Prerequisites:

- Task206 accepted.
- `BUILDINGS.altar_of_kings`, `UNITS.paladin`, and `ABILITIES.holy_light` exist as data.
- `Game.ts` currently has no Altar, Paladin, or Holy Light runtime references.

Allowed files:

- `docs/V9_HERO6_ALTAR_RUNTIME_EXPOSURE_CONTRACT.zh-CN.md`
- `tests/v9-hero6-altar-runtime-exposure-contract.spec.mjs`
- `docs/V9_HUMAN_NUMERIC_EXPANSION_PACKET.zh-CN.md`
- `docs/V9_MAINTENANCE_EXPANSION_EVIDENCE_LEDGER.zh-CN.md`
- `docs/V9_MAINTENANCE_EXPANSION_REMAINING_GATES.zh-CN.md`
- `docs/DUAL_LANE_STATUS.zh-CN.md`
- `docs/GLM_READY_TASK_QUEUE.md` only for closeout sync

Goal:

Create a contract for the next runtime phase:

1. HERO6A: expose Altar construction from worker build menu without exposing Paladin summon.
2. HERO6B: expose Paladin summon from a completed Altar through a hero-specific path, not through accidental generic `trains` leakage.
3. HERO6C: initialize Paladin mana from data when Paladin is actually spawned.
4. HERO6D: keep Holy Light command-card/runtime closed until a later ability runtime task.
5. Record why generic `BUILDINGS.altar_of_kings.trains = ['paladin']` is valid data but unsafe as automatic runtime exposure without uniqueness/death/revive rules.

Forbidden:

- Do not modify `src/game/Game.ts`, `src/game/GameData.ts`, `src/game/SimpleAI.ts`, CSS, HTML, assets, or runtime harness files.
- Do not add `altar_of_kings` to `PEASANT_BUILD_MENU`.
- Do not implement Altar construction, Paladin summon, Holy Light casting, command-card buttons, mana initialization, hero UI, revive, XP, uniqueness, AI, or visuals.
- Do not add runtime tests.

Proof requirements:

- Static proof must read the new contract, `GameData.ts`, and `Game.ts`.
- Prove Altar/Paladin/Holy Light data exists.
- Prove `PEASANT_BUILD_MENU` still does not include `altar_of_kings`.
- Prove `Game.ts` still does not reference `altar_of_kings`, `paladin`, or `holy_light`.
- Prove the contract explicitly splits Altar construction from Paladin summon and Holy Light runtime.
- Prove the contract mentions generic `trains` leakage risk and requires a hero-specific summon/uniqueness path before Paladin can become runtime-exposed.

Verification:

```bash
node --test tests/v9-hero6-altar-runtime-exposure-contract.spec.mjs tests/v9-hero5-holy-light-data-seed.spec.mjs
npm run build
npx tsc --noEmit -p tsconfig.app.json
./scripts/cleanup-local-runtime.sh
```

Closeout requirements:

- Start your final closeout with the exact line: JOB_COMPLETE: <job-id>
- If truly blocked, emit the exact line: JOB_BLOCKED: <job-id>
- Include sections for files changed, verification run, and remaining unknowns.
- End with an exact line that begins with READY_FOR_NEXT_TASK: followed by the next safe continuation.
- Keep the work within the requested scope; do not widen ownership on your own.

Closeout note:

- GLM created `docs/V9_HERO6_ALTAR_RUNTIME_EXPOSURE_CONTRACT.zh-CN.md` and `tests/v9-hero6-altar-runtime-exposure-contract.spec.mjs`.
- Codex locally reviewed and accepted the contract:
  - Altar construction, Paladin summon, mana initialization, and Holy Light runtime are explicitly split.
  - Generic `trains: ['paladin']` is recorded as valid data but unsafe for automatic runtime exposure.
  - `PEASANT_BUILD_MENU` still excludes `altar_of_kings`.
  - `Game.ts` and `SimpleAI.ts` remain free of Altar / Paladin / Holy Light runtime references for this contract stage.
- Verification passed:
  - `node --test tests/v9-hero6-altar-runtime-exposure-contract.spec.mjs tests/v9-hero5-holy-light-data-seed.spec.mjs` -> 34/34
  - `npm run build`
  - `npx tsc --noEmit -p tsconfig.app.json`

READY_FOR_NEXT_TASK: HERO6A-IMPL1 — Altar construction runtime exposure

### Task 208 — V9 HERO6A-IMPL1 Altar construction runtime exposure

Status: `accepted`.

Owner: GLM-style worker.

Priority: HERO6 contract is accepted. The next narrow runtime step is to make Altar of Kings buildable without accidentally exposing Paladin through the generic `trains` command-card path.

Prerequisites:

- Task207 accepted.
- `BUILDINGS.altar_of_kings.trains = ['paladin']` exists as data.
- `UNITS.paladin.isHero === true` exists as data.
- `PEASANT_BUILD_MENU` currently does not include `altar_of_kings`.

Allowed files:

- `src/game/GameData.ts`
- `src/game/Game.ts`
- `tests/v9-hero6a-altar-construction-runtime.spec.ts`
- `tests/v9-hero6-altar-runtime-exposure-contract.spec.mjs`
- `docs/GLM_READY_TASK_QUEUE.md` only for closeout sync

Goal:

Open only HERO6A:

1. Add `altar_of_kings` to the worker build menu.
2. Add a generic `trains` safety guard so `UNITS[uKey].isHero === true` does not create ordinary train buttons.
3. Prove a player worker can build Altar through the normal construction path.
4. Prove a completed Altar does not show a Paladin train/summon button yet.
5. Prove non-hero training, such as Barracks -> Footman, still works through the generic path.

Forbidden:

- Do not implement Paladin summon.
- Do not add a Paladin-specific command-card button.
- Do not implement Holy Light command-card/runtime.
- Do not implement hero uniqueness, revive, XP, skill points, hero UI, AI hero strategy, visuals, sounds, assets, items, shops, air, second race, or multiplayer.
- Do not edit `SimpleAI.ts`, CSS, HTML, asset files, or unrelated runtime systems.

Proof requirements:

- Runtime proof must use the actual browser game path and fresh `window.__war3Game` state after mutations.
- Prove the worker build menu exposes Altar and that construction produces `altar_of_kings`.
- Prove selecting completed Altar does not reveal Paladin or Holy Light buttons.
- Prove no Paladin unit is spawned by the Altar construction slice.
- Prove Barracks Footman train button still appears, so the `isHero` guard does not break ordinary training.
- Static proof may update HERO6 contract proof from "Altar not in PEASANT_BUILD_MENU" to the stage-aware HERO6A state.

Verification:

```bash
npm run build
npx tsc --noEmit -p tsconfig.app.json
./scripts/run-runtime-tests.sh tests/v9-hero6a-altar-construction-runtime.spec.ts --reporter=list
node --test tests/v9-hero6-altar-runtime-exposure-contract.spec.mjs tests/v9-hero5-holy-light-data-seed.spec.mjs
./scripts/cleanup-local-runtime.sh
```

Closeout requirements:

- Start your final closeout with the exact line: JOB_COMPLETE: <job-id>
- If truly blocked, emit the exact line: JOB_BLOCKED: <job-id>
- Include sections for files changed, verification run, and remaining unknowns.
- End with an exact line that begins with READY_FOR_NEXT_TASK: followed by the next safe continuation.
- Keep the work within the requested scope; do not widen ownership on your own.

Closeout:

- GLM job `glm-mo0wt05e-tj9xol` completed the main implementation:
  - Added `altar_of_kings` to `PEASANT_BUILD_MENU`.
  - Added `if (uDef.isHero) continue` in the generic `trains` command-card loop.
  - Added HERO6A runtime proof and updated HERO6 static proof to the HERO6A stage.
- Codex review strengthened ALTAR-RT4 from a direct `spawnBuilding('altar_of_kings')` shortcut into the real player path:
  - select worker
  - click the "国王祭坛" command-card button
  - enter placement mode
  - place Altar
  - spend 180 gold / 50 lumber
  - let the worker complete construction
  - select the completed Altar and prove no Paladin / Holy Light button leaks
- Verification passed:
  - `npm run build`
  - `npx tsc --noEmit -p tsconfig.app.json`
  - `./scripts/run-runtime-tests.sh tests/v9-hero6a-altar-construction-runtime.spec.ts --reporter=list` -> 4/4
  - `node --test tests/v9-hero6-altar-runtime-exposure-contract.spec.mjs tests/v9-hero5-holy-light-data-seed.spec.mjs` -> 35/35
  - `node --test tests/dual-lane-companion.spec.mjs tests/lane-feed.spec.mjs` -> 89/89
  - `./scripts/cleanup-local-runtime.sh`
  - no Vite / Playwright / Chromium / chrome-headless-shell leftovers

READY_FOR_NEXT_TASK: HERO6B-IMPL2 — Paladin hero summon runtime

### Task 209 — V9 HERO6B-IMPL2 Paladin hero summon runtime

Status: `accepted`.

Owner: GLM-style worker.

Priority: HERO6A is accepted. The next safe step is to expose Paladin through a hero-specific summon path on completed Altar, not through the generic `trains` loop.

Prerequisites:

- Task208 accepted.
- `BUILDINGS.altar_of_kings.trains = ['paladin']` exists as data.
- `UNITS.paladin.isHero === true` and `UNITS.paladin.maxMana === 255` exist as data.
- Generic `trains` command-card loop already skips `uDef.isHero`.

Allowed files:

- `src/game/Game.ts`
- `tests/v9-hero6b-paladin-summon-runtime.spec.ts`
- `tests/v9-hero6-altar-runtime-exposure-contract.spec.mjs`
- `docs/GLM_READY_TASK_QUEUE.md` only for closeout sync

Goal:

Open only HERO6B:

1. Selecting a completed player Altar shows a hero-specific "召唤圣骑士" or equivalent Paladin summon button.
2. The button uses Paladin data for cost, supply and summon/train time.
3. Clicking the button spends `UNITS.paladin.cost`, queues only one Paladin summon, and eventually produces exactly one `paladin`.
4. The spawned Paladin has hero runtime identity from data: `type === 'paladin'`, `maxMana === 255`, `mana === 255`, `isBuilding === false`, and no gather/build behavior.
5. If a Paladin is already alive or already queued, the Altar button is disabled with a player-readable reason.
6. The generic `trains` path must still skip heroes; this task must not make Paladin appear as an ordinary train button through the generic loop.

Forbidden:

- Do not implement Holy Light command-card or runtime.
- Do not implement revive, tavern, altar revive state, XP, leveling, skill points, inventory, aura, item/shop systems, AI hero strategy, visuals, sounds, assets, air, second race, or multiplayer.
- Do not edit `src/game/GameData.ts` unless a compile-only type hole blocks the task; if you need to edit it, explain why in closeout.
- Do not edit `src/game/SimpleAI.ts`, CSS, HTML, asset files, or unrelated runtime systems.
- Do not remove `BUILDINGS.altar_of_kings.trains = ['paladin']`; it remains source data, but runtime exposure must be hero-specific.

Proof requirements:

- Runtime proof must use browser state and fresh `window.__war3Game` reads after each mutation.
- Prove Altar shows Paladin summon only after Altar is complete.
- Prove clicking summon spends the exact Paladin cost and creates a queue item or equivalent in-progress state.
- Prove after enough time exactly one Paladin exists and no second Paladin can be queued while one is alive.
- Prove Holy Light still does not appear on command cards and no `holy_light` runtime method/path is opened.
- Prove ordinary Barracks training still works after the hero-specific path is added.
- Stage-update HERO6 static proof if needed: HERO6B may allow `Game.ts` to reference `paladin` through the hero-specific summon path, but `holy_light` must remain closed and `SimpleAI.ts` must not reference Altar / Paladin / Holy Light.

Verification:

```bash
npm run build
npx tsc --noEmit -p tsconfig.app.json
./scripts/run-runtime-tests.sh tests/v9-hero6b-paladin-summon-runtime.spec.ts --reporter=list
node --test tests/v9-hero6-altar-runtime-exposure-contract.spec.mjs tests/v9-hero5-holy-light-data-seed.spec.mjs
./scripts/cleanup-local-runtime.sh
```

Closeout requirements:

- Start your final closeout with the exact line: JOB_COMPLETE: <job-id>
- If truly blocked, emit the exact line: JOB_BLOCKED: <job-id>
- Include sections for files changed, verification run, and remaining unknowns.
- End with an exact line that begins with READY_FOR_NEXT_TASK: followed by the next safe continuation.
- Keep the work within the requested scope; do not widen ownership on your own.

### Task 210 — V9 HERO7-IMPL1 Holy Light manual runtime

Status: `accepted`.

Owner: GLM-style worker.

Priority: HERO6B accepted. Paladin can now be summoned through Altar and starts with mana from data. The next adjacent step is the smallest Holy Light runtime slice, using the existing `ABILITIES.holy_light` data.

Prerequisites:

- Task209 accepted.
- `UNITS.paladin.isHero === true`, `UNITS.paladin.maxMana === 255`.
- `ABILITIES.holy_light` exists with ownerType `paladin`, mana 65, cooldown 5, range 8.0, target rule ally / injured / alive / excludeSelf, effectValue 200.
- Paladin summon runtime exists and Holy Light is still not on any command card before this task.

Allowed files:

- `src/game/Game.ts`
- `tests/v9-hero7-holy-light-runtime.spec.ts`
- `tests/v9-hero5-holy-light-data-seed.spec.mjs`
- `tests/v9-hero6-altar-runtime-exposure-contract.spec.mjs`
- `docs/GLM_READY_TASK_QUEUE.md` only for closeout sync

Goal:

Open only HERO7 manual Holy Light:

1. Selecting a player Paladin shows a `圣光术` command-card button.
2. The button reads `ABILITIES.holy_light` for mana cost, cooldown, range and heal amount.
3. Clicking the button heals the lowest-health injured friendly non-building unit in range, excluding the Paladin itself.
4. The cast spends exactly 65 mana, applies exactly 5 seconds cooldown, and heals by up to 200 without exceeding target max HP.
5. It must reject enemies, buildings, full-health allies, self, out-of-range allies, insufficient mana, and cooldown.
6. Holy Light must not appear on Altar, Barracks, Priest, Sorceress, worker, Footman, Knight, or enemy command cards.

Forbidden:

- Do not implement revive, altar revive state, dead hero state, tavern, XP, leveling, skill points, aura, inventory, items, shop, autocast Holy Light, AI hero strategy, visuals, sounds, assets, air, second race, or multiplayer.
- Do not change `src/game/GameData.ts` unless a compile-only type hole blocks the task; if you need to edit it, explain why in closeout.
- Do not edit `src/game/SimpleAI.ts`, CSS, HTML, asset files, or unrelated runtime systems.
- Do not change Priest Heal or Sorceress Slow behavior except if a shared helper is extracted with proof that existing behavior is unchanged.

Proof requirements:

- Runtime proof must create or summon Paladin through current runtime data and use fresh `window.__war3Game` reads after each mutation.
- Prove visible command-card button on Paladin and absence on non-Paladin surfaces.
- Prove one successful cast: injured ally in range heals, Paladin mana drops by 65, cooldown becomes active.
- Prove target filtering: self, enemy, building, full-health ally, and out-of-range injured ally are not healed.
- Prove disabled state or no-op for insufficient mana and active cooldown.
- Prove `ABILITIES.holy_light` remains the source of cost/range/cooldown/effect.
- Stage-update HERO5 / HERO6 static proofs only as needed: Holy Light runtime may now exist in `Game.ts`, but `SimpleAI.ts` still must not reference Holy Light / Paladin casting.

Verification:

```bash
npm run build
npx tsc --noEmit -p tsconfig.app.json
./scripts/run-runtime-tests.sh tests/v9-hero7-holy-light-runtime.spec.ts --reporter=list
node --test tests/v9-hero5-holy-light-data-seed.spec.mjs tests/v9-hero6-altar-runtime-exposure-contract.spec.mjs
./scripts/cleanup-local-runtime.sh
```

Closeout requirements:

- Start your final closeout with the exact line: JOB_COMPLETE: <job-id>
- If truly blocked, emit the exact line: JOB_BLOCKED: <job-id>
- Include sections for files changed, verification run, and remaining unknowns.
- End with an exact line that begins with READY_FOR_NEXT_TASK: followed by the next safe continuation.
- Keep the work within the requested scope; do not widen ownership on your own.

### Task 211 — V9 HERO8-CLOSE1 Hero minimal runtime closure inventory

Status: `accepted`.

Owner: GLM-style worker.

Priority: HERO7 accepted. Before opening revive, XP, leveling, other heroes, AI hero strategy, or assets, close the minimal Altar + Paladin + Holy Light runtime branch as a bounded evidence inventory.

Prerequisites:

- Task210 accepted.
- HERO1-HERO7 files and proofs exist.
- Altar construction, Paladin summon, and Holy Light manual runtime have focused runtime proof.

Allowed files:

- `docs/V9_HERO8_MINIMAL_HERO_RUNTIME_CLOSURE.zh-CN.md`
- `tests/v9-hero8-minimal-hero-runtime-closure.spec.mjs`
- `docs/GLM_READY_TASK_QUEUE.md` only for closeout sync

Goal:

Create a closure inventory for the minimal Human hero branch:

1. Map HERO1 contract, HERO2 source boundary, HERO3 Altar data, HERO4 Paladin data, HERO5 Holy Light data, HERO6 runtime split, HERO6A Altar construction, HERO6B Paladin summon, and HERO7 Holy Light runtime into one evidence chain.
2. Explicitly state what is now live:
   - worker can build Altar;
   - completed Altar can summon exactly one Paladin;
   - Paladin starts with 255 mana;
   - Paladin can manually cast Holy Light on valid injured allied non-self unit;
   - Holy Light uses ability data for 65 mana / 5s / range 8 / heal up to 200.
3. Explicitly state what is still closed:
   - revive, dead hero state, tavern, XP, leveling, skill points, aura, inventory, items, shop, autocast Holy Light, AI hero strategy, other three Human heroes, visuals/assets, air, second race, multiplayer.
4. Recommend the next adjacent branch, but do not implement it.

Forbidden:

- Do not edit `src/game/Game.ts`, `src/game/GameData.ts`, `src/game/SimpleAI.ts`, CSS, HTML, assets, or runtime tests.
- Do not implement revive, XP, leveling, AI, visuals, or any new ability.
- Do not claim complete Human heroes are done; this is only the minimal Altar + Paladin + Holy Light branch closure.

Proof requirements:

- Static proof must read the closure document and relevant source/test files.
- Prove the closure document references the accepted evidence files for HERO1-HERO7.
- Prove live capabilities and closed capabilities are both listed.
- Prove no forbidden production files are needed for this closure task.
- Prove next recommendation is one bounded adjacent branch, not a task explosion.

Verification:

```bash
node --test tests/v9-hero8-minimal-hero-runtime-closure.spec.mjs
npm run build
npx tsc --noEmit -p tsconfig.app.json
./scripts/cleanup-local-runtime.sh
```

Closeout requirements:

- Start your final closeout with the exact line: JOB_COMPLETE: <job-id>
- If truly blocked, emit the exact line: JOB_BLOCKED: <job-id>
- Include sections for files changed, verification run, and remaining unknowns.
- End with an exact line that begins with READY_FOR_NEXT_TASK: followed by the next safe continuation.
- Keep the work within the requested scope; do not widen ownership on your own.

Codex acceptance:

- Accepted at: `2026-04-16 12:15:14 CST`.
- Local verification:
  - `node --test tests/v9-hero8-minimal-hero-runtime-closure.spec.mjs` -> 26/26 pass.
  - `npm run build` pass.
  - `npx tsc --noEmit -p tsconfig.app.json` pass.
- Acceptance note: HERO8 closes only the minimum Altar + Paladin + Holy Light evidence branch. It does not open revive, XP, leveling, other heroes, AI, items, shops, visuals, assets, air, second race, multiplayer, or public release.

### Task 212 — V9 HERO9-CONTRACT1 Hero death and revive branch contract

Status: `accepted`.

Owner: GLM-style worker.

Priority: HERO8 accepted. The next adjacent hero branch is death + Altar revive, but production runtime must not start until the contract and source-value boundary are explicit.

Prerequisites:

- Task211 accepted.
- HERO1-HERO8 evidence chain exists.
- Current runtime can build Altar, summon exactly one Paladin, and manually cast Holy Light.

Allowed files:

- `docs/V9_HERO9_HERO_DEATH_REVIVE_CONTRACT.zh-CN.md`
- `tests/v9-hero9-hero-death-revive-contract.spec.mjs`
- `docs/GLM_READY_TASK_QUEUE.md` only for closeout sync

Goal:

Create a contract for the next branch: hero death state and Altar revive.

The contract must define:

1. Current starting state:
   - Paladin can exist and be unique.
   - Altar exists and can be built.
   - There is no hero death / revive runtime yet.
2. Minimum future runtime semantics:
   - When a hero reaches 0 HP, it must stop acting, stop being targetable as a normal live combat unit, and enter an explicit dead-hero state.
   - Dead hero identity must be tracked per player and per hero type, so uniqueness still holds while dead.
   - Completed Altar may expose a revive action only for that player's dead hero.
   - Revive action must have resource, time, population, placement, and queue rules defined before implementation.
   - Revived hero must return as the same hero type and cannot create a second Paladin.
3. Source-value boundary:
   - Do not invent final revive cost or revive time in this contract.
   - Mark exact cost/time/level scaling as `source-boundary required` for the next task.
   - If examples are needed, label them as non-production placeholders.
4. Proof sequence:
   - HERO9-SRC1 source boundary before data/runtime.
   - HERO9-DATA1 minimal type/data fields if needed.
   - HERO9-IMPL1 death-state runtime.
   - HERO9-IMPL2 Altar revive command and queue.
   - HERO9-CLOSE1 closure inventory.
5. Closed capabilities:
   - XP, leveling, skill points, other Human heroes, Tavern, items, shop, aura, AI hero strategy, visuals/assets, air, second race, multiplayer.

Forbidden:

- Do not edit `src/game/Game.ts`, `src/game/GameData.ts`, `src/game/SimpleAI.ts`, CSS, HTML, assets, or runtime tests.
- Do not implement hero death, revive button, revive queue, source values, XP, leveling, other heroes, AI, visuals, or items.
- Do not claim the complete hero system is done.
- Do not hard-code or assert exact War3 revive costs/times without a follow-up source boundary.

Proof requirements:

- Static proof must read the contract document.
- Prove the contract references HERO8 and current accepted minimum hero runtime facts.
- Prove it defines death state, Altar revive, uniqueness while dead, queue/resource/time/population concerns, and revival output.
- Prove it requires a future source boundary for exact revive cost/time.
- Prove it keeps XP, leveling, other heroes, Tavern, items, AI, visuals/assets, air, second race, and multiplayer closed.
- Prove no production files are modified or required for this contract-only task.

Verification:

```bash
node --test tests/v9-hero9-hero-death-revive-contract.spec.mjs
npm run build
npx tsc --noEmit -p tsconfig.app.json
./scripts/cleanup-local-runtime.sh
```

Closeout requirements:

- Start your final closeout with the exact line: JOB_COMPLETE: <job-id>
- If truly blocked, emit the exact line: JOB_BLOCKED: <job-id>
- Include sections for files changed, verification run, and remaining unknowns.
- End with an exact line that begins with READY_FOR_NEXT_TASK: followed by the next safe continuation.
- Keep the work within the requested scope; do not widen ownership on your own.

Codex acceptance:

- Accepted at: `2026-04-16 12:22:50 CST`.
- Codex correction: GLM 初版把唯一性修正建议写成 `!u.isDead`，这会让死亡英雄不挡新召唤。Codex 已改成两个 predicate：
  - `hasExistingHero`: 同队伍同类型英雄记录只要存在，不论 `hp` 或 `isDead`，都阻止新召唤。
  - `deadHero`: 同队伍同类型英雄记录存在且 `isDead === true`，才允许复活入口。
- Local verification:
  - `node --test tests/v9-hero9-hero-death-revive-contract.spec.mjs` -> 27/27 pass.
  - `npm run build` pass.
  - `npx tsc --noEmit -p tsconfig.app.json` pass.
- Acceptance note: HERO9-CONTRACT1 opens only the contract branch. No death runtime, revive command, revive values, XP, leveling, AI, other heroes, items, visuals, or assets are implemented.

### Task 213 — V9 HERO9-SRC1 Hero death / revive source boundary

Status: `accepted`.

Owner: GLM-style worker + Codex review.

Priority: HERO9-CONTRACT1 accepted. Before any death-state runtime or Altar revive implementation, exact revive values and uncertain visual/selection semantics must be sourced or explicitly deferred.

Prerequisites:

- Task212 accepted.
- `docs/V9_HERO9_HERO_DEATH_REVIVE_CONTRACT.zh-CN.md` exists.
- Current production runtime still has no hero death / revive implementation.

Allowed files:

- `docs/V9_HERO9_REVIVE_SOURCE_BOUNDARY.zh-CN.md`
- `tests/v9-hero9-revive-source-boundary.spec.mjs`
- `docs/GLM_READY_TASK_QUEUE.md` only for closeout sync

Goal:

Create a source boundary for hero death + revive values and semantics.

The boundary must:

1. Define source hierarchy:
   - Primary: current accessible Blizzard Classic / official Warcraft III references when available.
   - Cross-check: Liquipedia, Warcraft Wiki / Wowpedia, StrategyWiki, or equivalent stable gameplay references.
   - Conflict samples: old patch notes, community calculators, forum posts, GameFAQs-style tables, or unsourced claims.
2. Resolve or defer the following fields:
   - revive cost formula;
   - revive time formula;
   - revive HP after revive;
   - revive mana after revive;
   - whether a dead hero corpse/record is visible, selectable, or commandable;
   - whether dead heroes continue to occupy food/supply in the project's simplified model.
3. For each field, mark one of:
   - `adopted` with source rationale;
   - `project mapping` when War3 semantics need simplified project translation;
   - `deferred` when sources conflict or the project cannot safely map it yet.
4. Preserve Task212's corrected uniqueness contract:
   - New summon blocks if same-team same-type hero record exists.
   - Revive is a separate path for `isDead === true`.
5. Produce the next safe continuation:
   - If source values are clear: HERO9-DATA1 minimal revive/death data fields.
   - If source values remain conflicted: HERO9-SRC2 focused conflict resolution.

Forbidden:

- Do not edit `src/game/Game.ts`, `src/game/GameData.ts`, `src/game/SimpleAI.ts`, CSS, HTML, assets, or runtime tests.
- Do not implement hero death, revive command, revive queue, source values in production data, XP, leveling, other heroes, AI, visuals, or items.
- Do not claim exact values are adopted unless the source boundary explains source hierarchy and conflicts.
- Do not silently reuse the placeholder 50% cost/time/HP examples from Task212 as production values.

Proof requirements:

- Static proof must read the source boundary document and Task212 contract.
- Prove source hierarchy is present.
- Prove revive cost, revive time, revive HP, revive mana, corpse/selection semantics, and supply semantics are each resolved or explicitly deferred.
- Prove placeholder values are not adopted without source rationale.
- Prove the corrected uniqueness contract from Task212 remains present.
- Prove production files remain untouched by this source-only task.

Verification:

```bash
node --test tests/v9-hero9-revive-source-boundary.spec.mjs
npm run build
npx tsc --noEmit -p tsconfig.app.json
./scripts/cleanup-local-runtime.sh
```

Closeout requirements:

- Start your final closeout with the exact line: JOB_COMPLETE: <job-id>
- If truly blocked, emit the exact line: JOB_BLOCKED: <job-id>
- Include sections for files changed, verification run, and remaining unknowns.
- End with an exact line that begins with READY_FOR_NEXT_TASK: followed by the next safe continuation.
- Keep the work within the requested scope; do not widen ownership on your own.

Codex acceptance:

- Accepted at: `2026-04-16 12:37:07 CST`.
- Codex corrections:
  - Added directly reviewable source URLs for the public `war3mapMisc.txt` constants mirror, Wowpedia / Warcraft Wiki hero behavior page, and Blizzard Classic hero basics page.
  - Marked fractional revive-resource rounding as project mapping with `Math.floor` / integer truncation instead of pretending it is already proven source truth.
  - Strengthened the static proof so future data/runtime tasks cannot drop the source links or rounding rule silently.
- Local verification:
  - `node --test tests/v9-hero9-revive-source-boundary.spec.mjs` -> 24/24 pass.
  - `npm run build` pass.
  - `npx tsc --noEmit -p tsconfig.app.json` pass.
- Acceptance note: HERO9-SRC1 resolves the source boundary only. It does not implement death runtime, revive command, revive queue, XP, leveling, AI, other heroes, items, visuals, or assets.

### Task 214 — V9 HERO9-IMPL1 Hero death-state runtime slice

Status: `accepted`.

Owner: GLM-style worker + Codex takeover after GLM interrupted during auto-compaction.

Priority: HERO9-CONTRACT1 and HERO9-SRC1 are accepted. The next safe implementation step is not full revive; it is the minimum runtime distinction between normal unit cleanup and dead hero records.

Prerequisites:

- Task212 accepted.
- Task213 accepted.
- Paladin summon runtime already exists from Task209.
- Manual Holy Light runtime already exists from Task210.

Allowed files:

- `src/game/Game.ts`
- `tests/v9-hero9-death-state-runtime.spec.ts`
- `tests/v9-hero6b-paladin-summon-runtime.spec.ts` only if existing summon-uniqueness expectations need to include dead heroes
- `docs/GLM_READY_TASK_QUEUE.md` only for closeout sync

Goal:

Implement the smallest hero death-state runtime slice.

Must prove:

1. A Paladin reduced to `hp <= 0` is not removed from `g.units`; it stays as a hero record with `isDead === true` and `hp === 0`.
2. A dead Paladin stops action state, movement, gather/build references, attack target and attack-move state.
3. Other live units clear attack targets pointing at the dead Paladin.
4. The dead Paladin is not a normal live combat target for auto-acquire / attacks.
5. A dead Paladin still blocks a new Paladin summon from the Altar command card.
6. Direct `trainUnit(altar, 'paladin')` cannot bypass the dead-hero uniqueness guard.
7. Dead Paladin cannot cast Holy Light and cannot heal or spend mana.
8. Existing non-hero death cleanup still removes normal units/buildings and keeps existing death-cleanup tests compatible.

Implementation constraints:

- Preserve Task212 predicate split:
  - `hasExistingHero`: same-team same-type hero record exists, regardless of `hp` or `isDead`, blocks new summon.
  - `deadHero`: same-team same-type hero with `isDead === true`, for future revive path only.
- It is acceptable for dead hero visuals to disappear or remain hidden as a project mapping if the unit record stays in `g.units`; do not build full death UI.
- Do not implement revive command, revive cost/time, revive queue, clickable dead-hero UI, Tavern, XP, leveling, skill points, aura, inventory, AI hero strategy, other Human heroes, visuals/assets, air, second race, multiplayer, or public release packaging.

Verification:

```bash
npm run build
npx tsc --noEmit -p tsconfig.app.json
./scripts/run-runtime-tests.sh tests/v9-hero9-death-state-runtime.spec.ts tests/v9-hero6b-paladin-summon-runtime.spec.ts tests/death-cleanup-regression.spec.ts --reporter=list
./scripts/cleanup-local-runtime.sh
```

Closeout requirements:

- Start your final closeout with the exact line: JOB_COMPLETE: <job-id>
- If truly blocked, emit the exact line: JOB_BLOCKED: <job-id>
- Include sections for files changed, verification run, and remaining unknowns.
- End with an exact line that begins with READY_FOR_NEXT_TASK: followed by the next safe continuation.
- Keep the work within the requested scope; do not widen ownership on your own.

Codex acceptance:

- Accepted at: `2026-04-16 13:00:28 CST`.
- Codex takeover/corrections:
  - GLM auto-compacted mid-task and briefly froze; Codex continued the half-finished slice.
  - Added/verified `Unit.isDead?: boolean`, `hero.hp = 0` clamp, existence-based direct `trainUnit` hero guard, and dead-hero `updateAutoAggro` skip.
  - Updated stale HERO6B expectation: after HERO7, Holy Light should appear on Paladin but not Altar.
  - Updated HERO9 source-boundary proof so it allows death-state runtime while still proving no revive command/queue exists.
  - Kept revive button, revive queue, XP, leveling, AI, other heroes, items and visual system out of scope.
- Local verification:
  - `node --test tests/v9-hero9-revive-source-boundary.spec.mjs` -> 24/24 pass.
  - `npm run build` pass.
  - `npx tsc --noEmit -p tsconfig.app.json` pass.
  - `./scripts/run-runtime-tests.sh tests/v9-hero9-death-state-runtime.spec.ts tests/v9-hero6b-paladin-summon-runtime.spec.ts tests/death-cleanup-regression.spec.ts --reporter=list` -> 19/19 pass.
  - `./scripts/cleanup-local-runtime.sh` pass; no Vite / Playwright / Chromium / chrome-headless-shell leftovers.
- Acceptance note: HERO9-IMPL1 closes only the dead hero state. The Altar still cannot revive a dead hero yet.

### Task 215 — V9 HERO9-DATA1 Hero revive data seed

Status: `accepted`.

Owner: GLM-style worker + Codex takeover.

Priority: HERO9-SRC1 and HERO9-IMPL1 are accepted. Before adding an Altar revive button or revive queue, the revive constants must exist as data and static proof.

Prerequisites:

- Task213 accepted.
- Task214 accepted.
- `docs/V9_HERO9_REVIVE_SOURCE_BOUNDARY.zh-CN.md` is the source boundary.

Allowed files:

- `src/game/GameData.ts`
- `docs/V9_HERO9_REVIVE_DATA_SEED.zh-CN.md`
- `tests/v9-hero9-revive-data-seed.spec.mjs`
- `docs/GLM_READY_TASK_QUEUE.md` only for closeout sync

Goal:

Add a minimal data seed for hero revive formulas. This is data only, not runtime.

Required data shape:

- Export a clearly named data object from `GameData.ts`, for example `HERO_REVIVE_RULES`.
- It must include the adopted/source-boundary values:
  - gold base factor `0.40`
  - gold level factor `0.10`
  - gold max factor `4.0`
  - gold hard cap `700`
  - lumber base factor `0`
  - lumber level factor `0`
  - revive time factor `0.65`
  - revive time max factor `2.0`
  - revive time hard cap seconds `150`
  - life factor `1.0`
  - mana start factor `1`
  - mana bonus factor `0`
  - project resource rounding `floor`
  - current simplified mana mapping `maxMana`
- The data can be generic, not Paladin-only, but the proof must compute Paladin examples from `UNITS.paladin`:
  - level 1 gold `170`
  - level 2 gold `212` by floor/truncation
  - level 10 gold `552`
  - Paladin max revive time `110` seconds by `trainTime * 2.0`

Forbidden:

- Do not edit `src/game/Game.ts`, `src/game/SimpleAI.ts`, CSS, HTML, assets, or runtime tests.
- Do not implement an Altar revive button, command, queue, cost spend, timer, UI, AI, XP, leveling, skill points, other heroes, items, visuals, or assets.
- Do not use the old Task212 placeholder 50% values.
- Do not change existing Paladin summon or Holy Light runtime behavior.

Proof requirements:

- Static proof must read `src/game/GameData.ts`, `docs/V9_HERO9_REVIVE_SOURCE_BOUNDARY.zh-CN.md`, and the new data seed doc.
- Prove all required constants exist in data.
- Prove Paladin example values are computed from `UNITS.paladin`, not copied as free text only.
- Prove `Game.ts` remains free of revive command/queue identifiers.
- Prove no runtime tests are added or required for this data-only slice.

Verification:

```bash
node --test tests/v9-hero9-revive-data-seed.spec.mjs tests/v9-hero9-revive-source-boundary.spec.mjs
npm run build
npx tsc --noEmit -p tsconfig.app.json
./scripts/cleanup-local-runtime.sh
```

Closeout requirements:

- Start your final closeout with the exact line: JOB_COMPLETE: <job-id>
- If truly blocked, emit the exact line: JOB_BLOCKED: <job-id>
- Include sections for files changed, verification run, and remaining unknowns.
- End with an exact line that begins with READY_FOR_NEXT_TASK: followed by the next safe continuation.
- Keep the work within the requested scope; do not widen ownership on your own.

Codex acceptance:

- GLM 写出 `HERO_REVIVE_RULES`、数据种子文档和静态 proof 后在 closeout 前中断；Codex 接管复核。
- Codex 修正 GLM 初版文档里的 Paladin HP 示例：当前 `UNITS.paladin.hp` 是 650，不是 700。
- Codex 将 proof 改成文本读取 `GameData.ts`，避免直接 import TypeScript `const enum` 造成 Node 静态 proof 失败。
- Local verification:
  - `node --test tests/v9-hero9-revive-data-seed.spec.mjs tests/v9-hero9-revive-source-boundary.spec.mjs` -> 49/49 pass.
  - `npm run build` pass.
  - `npx tsc --noEmit -p tsconfig.app.json` pass.
  - `FORCE_RUNTIME_CLEANUP=1 ./scripts/cleanup-local-runtime.sh` pass.
  - Removed stale runtime lock from dead pid `87880`; no Vite / Playwright / chrome-headless-shell leftovers.
- Acceptance note: HERO9-DATA1 closes only revive formula data. It still does not add a revive command, revive queue, resource spend, timer, XP, leveling, full hero UI, AI hero strategy, other heroes, items, visuals or assets.

### Task 216 — V9 HERO9-CONTRACT2 Altar revive runtime contract

Status: `accepted`.

Owner: GLM-style worker + Codex review.

Priority: HERO9-DATA1 is accepted. Before touching runtime, the Altar revive button and queue semantics need one small implementation contract so the next implementation slice cannot invent timing, cost, queue or UI rules in `Game.ts`.

Prerequisites:

- Task213 accepted.
- Task214 accepted.
- Task215 accepted.
- `docs/V9_HERO9_REVIVE_SOURCE_BOUNDARY.zh-CN.md` is the source boundary.
- `HERO_REVIVE_RULES` exists in `src/game/GameData.ts`.

Allowed files:

- `docs/V9_HERO9_REVIVE_RUNTIME_CONTRACT.zh-CN.md`
- `tests/v9-hero9-revive-runtime-contract.spec.mjs`
- `docs/GLM_READY_TASK_QUEUE.md` only for closeout sync

Goal:

Write the implementation contract for the next runtime slice. This task is contract/proof only. Do not implement revive runtime yet.

Required contract content:

- Altar command-card availability:
  - Completed same-team Altar can show a revive entry only when a same-team Paladin record exists with `isDead === true`.
  - No dead Paladin means no revive entry.
  - A live Paladin continues to block new summon and does not open revive.
  - A revive already queued for that dead hero disables or hides duplicate revive.
- Cost formula:
  - Read `HERO_REVIVE_RULES`.
  - Gold uses `Math.floor(baseGold * min(0.40 + 0.10 * (level - 1), 4.0))`, then hard cap 700.
  - Lumber is 0.
  - Current Paladin level 1 cost is 170 gold / 0 lumber.
- Time formula and project rounding:
  - Raw time uses `trainTime * level * 0.65`.
  - Cap uses `min(raw, trainTime * 2.0, 150)`.
  - Runtime queue duration uses `Math.round(capped)` as project mapping, matching the current source-boundary table examples 36 / 72 / 107 / 110 for Paladin.
  - UI may display remaining seconds separately, but queue total duration must be defined by this mapping.
- Queue shape:
  - Queue must identify hero unit id/type/team and source Altar.
  - It must not create a second Paladin unit.
  - It must spend resources once when queue starts.
  - It must reject insufficient resources before spending.
  - It must reject duplicate queues for the same dead hero.
- Completion behavior:
  - The same retained hero record becomes live again.
  - `isDead` clears or becomes false.
  - `hp` restores to max HP using `lifeFactor`.
  - `mana` restores to current project maxMana mapping.
  - The hero appears near the Altar or its rally point using existing spawn-position conventions.
  - Selection is not automatic unless an explicit later UI task opens it.
- Forbidden scope:
  - No production runtime changes.
  - No `Game.ts`, `SimpleAI.ts`, CSS, HTML or asset edits.
  - No XP, leveling, skill points, item inventory, aura, Holy Light autocast, AI hero strategy, other heroes, Tavern, shop, new visuals, new assets, air units, second race, multiplayer or public release work.

Proof requirements:

- Static proof must read the new contract, `GameData.ts`, `docs/V9_HERO9_REVIVE_SOURCE_BOUNDARY.zh-CN.md`, and `docs/V9_HERO9_REVIVE_DATA_SEED.zh-CN.md`.
- Prove the contract references `HERO_REVIVE_RULES` and the source-boundary data.
- Prove the cost, lumber, time cap and `Math.round` runtime duration mapping.
- Prove the Paladin level 1 examples: 170 gold, 0 lumber, 36 second queue duration, full HP 650, full mana 255.
- Prove the queue updates the retained hero record instead of creating a new Paladin.
- Prove the forbidden files are not modified by this task.

Verification:

```bash
node --test tests/v9-hero9-revive-runtime-contract.spec.mjs tests/v9-hero9-revive-data-seed.spec.mjs tests/v9-hero9-revive-source-boundary.spec.mjs
npm run build
npx tsc --noEmit -p tsconfig.app.json
./scripts/cleanup-local-runtime.sh
```

Closeout requirements:

- Start your final closeout with the exact line: JOB_COMPLETE: <job-id>
- If truly blocked, emit the exact line: JOB_BLOCKED: <job-id>
- Include sections for files changed, verification run, and remaining unknowns.
- End with an exact line that begins with READY_FOR_NEXT_TASK: followed by the next safe continuation.
- Keep the work within the requested scope; do not widen ownership on your own.

Codex acceptance:

- GLM wrote `docs/V9_HERO9_REVIVE_RUNTIME_CONTRACT.zh-CN.md` and `tests/v9-hero9-revive-runtime-contract.spec.mjs`.
- GLM fixed the only initial static proof issue: the contract contains "英雄系统已完成" only as an explicit negative disclaimer.
- The contract keeps production runtime closed and defines the exact next implementation boundary:
  - revive entry only for `isDead === true` Paladin records,
  - level 1 Paladin cost 170 gold / 0 lumber,
  - level 1 Paladin queue duration 36 seconds by `Math.round`,
  - revive updates the retained hero record instead of creating a new Paladin,
  - HP restores to 650 and mana to 255,
  - XP / leveling / other heroes / AI / visuals / items / shop / Tavern remain closed.
- Local verification:
  - `node --test tests/v9-hero9-revive-runtime-contract.spec.mjs tests/v9-hero9-revive-data-seed.spec.mjs tests/v9-hero9-revive-source-boundary.spec.mjs` -> 85/85 pass.
  - `npm run build` pass.
  - `npx tsc --noEmit -p tsconfig.app.json` pass.
- Acceptance note: HERO9-CONTRACT2 closes only the implementation contract. It does not implement the revive button, revive queue, resource spend or timer.

### Task 217 — V9 HERO9-IMPL2 Altar revive runtime

Status: `accepted`.

Owner: GLM-style worker + Codex takeover.

Codex acceptance:

- GLM initial implementation added part of `Game.ts` but stopped after an edit failure and then repeatedly launched direct Playwright commands outside `run-runtime-tests.sh`.
- Codex took over and completed the slice:
  - Altar command card shows revive only for a dead same-team Paladin.
  - Level 1 Paladin revive reads `HERO_REVIVE_RULES`: 170 gold, 0 lumber, 36 seconds.
  - Duplicate revive clicks do not double-spend or create duplicate queues.
  - Completion restores the same Paladin record, not a new unit.
  - Restored Paladin returns with hp 650, mana 255, visible mesh, health bar and selectable mesh restored, no auto-selection, and stale orders cleared.
- Verification:
  - `node --test tests/v9-hero9-revive-runtime-contract.spec.mjs tests/v9-hero9-revive-data-seed.spec.mjs tests/v9-hero9-revive-source-boundary.spec.mjs` -> 85/85 passed.
  - `npm run build` -> passed.
  - `npx tsc --noEmit -p tsconfig.app.json` -> passed.
  - `./scripts/run-runtime-tests.sh tests/v9-hero9-revive-runtime.spec.ts tests/v9-hero9-death-state-runtime.spec.ts tests/v9-hero6b-paladin-summon-runtime.spec.ts --reporter=list` -> 21/21 passed.
  - `./scripts/cleanup-local-runtime.sh` -> complete; no Vite / Playwright / Chrome / Claude process left by the accepted run.

Priority: HERO9-CONTRACT2 is accepted. The exact runtime behavior for Altar revive is now bounded; the next safe implementation slice is the minimal revive button + queue + completion path.

Prerequisites:

- Task213 accepted.
- Task214 accepted.
- Task215 accepted.
- Task216 accepted.
- `HERO_REVIVE_RULES` exists in `src/game/GameData.ts`.
- `docs/V9_HERO9_REVIVE_RUNTIME_CONTRACT.zh-CN.md` defines the implementation contract.

Allowed files:

- `src/game/Game.ts`
- `tests/v9-hero9-revive-runtime.spec.ts`
- `tests/v9-hero9-revive-runtime-contract.spec.mjs` only if a contract proof needs line-safe strengthening after implementation
- `docs/GLM_READY_TASK_QUEUE.md` only for closeout sync

Goal:

Implement the minimum Altar revive runtime for the existing Paladin hero. This is not a full hero system.

Required runtime behavior:

- Completed same-team Altar command card:
  - live Paladin exists: summon button disabled with live reason; no revive action.
  - dead Paladin exists: summon remains blocked by existence; revive action is available if resources are enough and no revive queue exists.
  - no Paladin record: normal summon behavior remains unchanged.
- Revive action:
  - reads `HERO_REVIVE_RULES`;
  - level 1 Paladin cost is 170 gold and 0 lumber;
  - rejects insufficient resources before spending;
  - spends resources exactly once when queue starts;
  - creates one revive queue for the retained dead hero, not a new Paladin unit.
- Queue timing:
  - level 1 Paladin total duration is 36 seconds using Task216 `Math.round` mapping;
  - duplicate revive clicks while queued do not double-spend or create duplicate queues;
  - command card reflects "正在复活" or an equivalent clear disabled state while queued.
- Completion:
  - restores the same retained Paladin record;
  - `isDead` becomes false or clears;
  - `hp` restores to 650;
  - `mana` restores to 255;
  - mesh becomes visible again;
  - state is idle with no stale attack/move/gather target;
  - hero appears near the Altar or existing spawn-position convention;
  - no automatic selection.

Forbidden:

- Do not implement XP, leveling, skill points, item inventory, aura, Holy Light autocast, AI hero strategy, other Human heroes, Tavern, shop, new visuals, new assets, air units, second race, multiplayer or public release work.
- Do not change Paladin base stats or Holy Light behavior except where revive completion must restore Paladin hp/mana.
- Do not use `run-runtime-suite.sh`. This task must use focused runtime only.
- Do not weaken Task213/215/216 static proofs.

Required runtime tests:

Create `tests/v9-hero9-revive-runtime.spec.ts` with focused Playwright proof for:

1. Dead Paladin makes Altar show an available revive action and keeps summon blocked.
2. Revive costs 170 gold / 0 lumber for level 1 Paladin and starts one queue.
3. Insufficient gold disables or rejects revive without spending.
4. Duplicate revive while queued does not double-spend and does not create a second queue.
5. After 36 seconds of simulated/game time, the same Paladin record becomes live with hp 650, mana 255, `isDead` false/cleared, visible mesh, idle state.
6. No dead Paladin means no revive entry and normal summon behavior remains intact.
7. Existing Paladin summon uniqueness and dead-state tests still pass.

Verification:

```bash
node --test tests/v9-hero9-revive-runtime-contract.spec.mjs tests/v9-hero9-revive-data-seed.spec.mjs tests/v9-hero9-revive-source-boundary.spec.mjs
npm run build
npx tsc --noEmit -p tsconfig.app.json
./scripts/run-runtime-tests.sh tests/v9-hero9-revive-runtime.spec.ts tests/v9-hero9-death-state-runtime.spec.ts tests/v9-hero6b-paladin-summon-runtime.spec.ts --reporter=list
./scripts/cleanup-local-runtime.sh
```

Closeout requirements:

- Start your final closeout with the exact line: JOB_COMPLETE: <job-id>
- If truly blocked, emit the exact line: JOB_BLOCKED: <job-id>
- Include sections for files changed, verification run, and remaining unknowns.
- End with an exact line that begins with READY_FOR_NEXT_TASK: followed by the next safe continuation.
- Keep the work within the requested scope; do not widen ownership on your own.

### Task 218 — V9 HERO9-CLOSE1 Hero death / revive closure inventory

Status: `accepted`.

Owner: GLM-style worker.

Priority: Task217 is accepted. The HERO9 death + revive branch now needs a narrow static closure inventory so the queue does not keep regenerating already-closed HERO9 runtime work.

Allowed files:

- `docs/V9_HERO9_DEATH_REVIVE_CLOSURE.zh-CN.md`
- `tests/v9-hero9-death-revive-closure.spec.mjs`
- `docs/GLM_READY_TASK_QUEUE.md` only for closeout sync

Goal:

Write a closure inventory for the minimal Human hero death + Altar revive branch. This is a documentation/proof task only.

Must prove:

1. HERO9-CONTRACT1, HERO9-SRC1, HERO9-IMPL1, HERO9-DATA1, HERO9-CONTRACT2, and HERO9-IMPL2 are all represented in the closure inventory.
2. Death-state runtime is covered by `tests/v9-hero9-death-state-runtime.spec.ts`.
3. Revive source/data/contract static proofs are covered by the HERO9 source/data/contract `.spec.mjs` files.
4. Revive runtime is covered by `tests/v9-hero9-revive-runtime.spec.ts`.
5. The closure inventory explicitly states that XP, leveling, skill points, hero UI leveling panels, inventory/items, aura, other Human heroes, Tavern, shop, AI hero strategy, new visuals/assets, air units, second race, multiplayer, and public-release work remain closed.
6. The closure inventory does not claim "complete hero system" or "complete Human".

Forbidden:

- Do not edit `src/game/Game.ts`, `src/game/GameData.ts`, runtime specs, production code, public assets, or board code.
- Do not run Playwright/runtime tests for this closure task.
- Do not open a new implementation front.
- Do not mark V9 or complete Human as done.

Verification:

```bash
node --test tests/v9-hero9-death-revive-closure.spec.mjs tests/v9-hero9-revive-runtime-contract.spec.mjs tests/v9-hero9-revive-data-seed.spec.mjs tests/v9-hero9-revive-source-boundary.spec.mjs
npm run build
npx tsc --noEmit -p tsconfig.app.json
./scripts/cleanup-local-runtime.sh
```

Closeout requirements:

- Start your final closeout with the exact line: JOB_COMPLETE: <job-id>
- If truly blocked, emit the exact line: JOB_BLOCKED: <job-id>
- Include sections for files changed, verification run, and remaining unknowns.
- End with an exact line that begins with READY_FOR_NEXT_TASK: followed by the next safe continuation.
- Keep the work within the requested scope; do not widen ownership on your own.

### Task 219 — V9 HERO10-CONTRACT1 Hero XP / leveling branch contract

Status: `accepted`.

Owner: GLM-style worker + Codex review.

Priority: Task218 is accepted. The minimal Paladin death + Altar revive branch is closed. The next adjacent hero branch is XP / leveling, but production runtime must not start until the contract and source-value boundary are explicit.

Allowed files:

- `docs/V9_HERO10_XP_LEVELING_CONTRACT.zh-CN.md`
- `tests/v9-hero10-xp-leveling-contract.spec.mjs`
- `docs/GLM_READY_TASK_QUEUE.md` only for closeout sync

Goal:

Write a contract for the next Human hero branch: Paladin XP, leveling, and skill-point readiness. This is documentation/proof only.

Must prove:

1. Current state is bounded: Paladin can be summoned, cast Holy Light, die, and revive, but there is no XP gain / level-up runtime yet.
2. Existing `heroLevel` / `heroXP` data fields, if present, are only seeds or current data fields; they are not a complete XP system.
3. XP gain must be a future runtime branch with explicit source boundary before exact XP table, kill reward, level thresholds, or skill-point numbers are adopted.
4. Leveling must preserve existing HERO9 semantics: death, revive cost/time by level, uniqueness, no auto-selection, Holy Light legality, and no duplicate Paladin.
5. Skill points and ability leveling are only readiness concepts in this contract; do not implement Holy Light levels, aura, ultimate, hero UI, or learned ability selection.
6. The contract defines the next safe sequence:
   - `HERO10-SRC1` source boundary for XP / level thresholds / skill point rules.
   - `HERO10-DATA1` minimal XP / leveling data seed.
   - `HERO10-IMPL1` minimal runtime XP gain + level-up proof.
   - `HERO10-CLOSE1` closure inventory.
7. The contract explicitly keeps other Human heroes, AI hero strategy, items/inventory, shop/Tavern, aura, hero leveling panels, air units, second race, multiplayer, and public-release work closed.
8. The contract does not claim "complete hero system" or "complete Human".

Forbidden:

- Do not edit `src/game/Game.ts`, `src/game/GameData.ts`, runtime specs, production code, public assets, or board code.
- Do not run Playwright/runtime tests for this contract task.
- Do not invent exact War3 XP tables, kill rewards, level thresholds, skill-point numbers, or ability-level values.
- Do not implement XP gain, level-up, skill-point spend, hero UI, AI hero logic, items, aura, other heroes, Tavern, or shop.
- Do not mark V9 or complete Human as done.

Verification:

```bash
node --test tests/v9-hero10-xp-leveling-contract.spec.mjs tests/v9-hero9-death-revive-closure.spec.mjs
npm run build
npx tsc --noEmit -p tsconfig.app.json
./scripts/cleanup-local-runtime.sh
```

Closeout requirements:

- Start your final closeout with the exact line: JOB_COMPLETE: <job-id>
- If truly blocked, emit the exact line: JOB_BLOCKED: <job-id>
- Include sections for files changed, verification run, and remaining unknowns.
- End with an exact line that begins with READY_FOR_NEXT_TASK: followed by the next safe continuation.
- Keep the work within the requested scope; do not widen ownership on your own.

### Task 220 — V9 HERO10-SRC1 XP / level / skill-point source boundary

Status: `accepted`.

Owner: GLM-style worker + Codex review.

Priority: Task219 is accepted. HERO10 now has a branch contract, but DATA1 / IMPL1 must not start until XP thresholds, XP reward rules, skill-point readiness, and project mappings are source-bounded.

Codex acceptance: source+contract proof 127/127, `npm run build`, `npx tsc --noEmit -p tsconfig.app.json`, cleanup, and no residual Playwright/Vite/Chrome processes passed locally. Task221 can start.

Allowed files:

- `docs/V9_HERO10_XP_LEVELING_SOURCE_BOUNDARY.zh-CN.md`
- `tests/v9-hero10-xp-leveling-source-boundary.spec.mjs`
- `docs/GLM_READY_TASK_QUEUE.md` only for closeout sync

Goal:

Write the source-boundary packet for Paladin XP / leveling / skill-point rules. This is documentation/proof only. Do not modify runtime or production data.

Primary source to use:

- Blizzard Classic Battle.net Hero Basics: `https://classic.battle.net/war3/basics/heroes.shtml`

Must prove:

1. Source hierarchy is explicit: Blizzard Classic Hero Basics is the adopted primary source for XP/leveling rules; project may record community or gameplay-constant snippets only as cross-check or conflict samples.
2. Adopt the hero level cap as 10 and state heroes do not gain XP after level 10.
3. Adopt the XP thresholds from the primary source:
   - Level 1: start value / no threshold.
   - Level 2: 200.
   - Level 3: 500.
   - Level 4: 900.
   - Level 5: 1400.
   - Level 6: 2000.
   - Level 7: 2700.
   - Level 8: 3500.
   - Level 9: 4400.
   - Level 10: 5400.
4. Adopt the hero-kill XP table as source-bounded data for future use, but mark runtime as deferred because the current project does not yet have enemy hero gameplay:
   - Enemy hero levels 1..10 grant 100, 120, 160, 220, 300, 400, 500, 600, 700, 800 XP.
5. Adopt the creep XP reduction rule as source-bounded data for future creeps, but mark runtime as deferred because current project has no creep camps:
   - Killer hero levels 1, 2, 3, 4, 5+ receive 80%, 70%, 62%, 55%, 0% from creeps.
6. Adopt the normal unit XP formula or its evaluated table for unit level 1..10:
   - `GrantNormalXP = 25`, `F(x) = F(x-1) + 5*x + 5`, evaluated as 25, 40, 60, 85, 115, 150, 190, 235, 285, 340.
7. State the minimal project mapping for HERO10-DATA1 / HERO10-IMPL1:
   - Current project can start with enemy non-building unit kills only, because creeps, enemy heroes, items, auras, multiple owned heroes, allied sharing, and hero UI are not ready.
   - Buildings must stay excluded until a separate source/runtime decision, because current project building kills are not ready to carry War3 XP semantics.
   - Dead heroes must not gain XP.
   - Reaching a threshold increments `heroLevel`, grants exactly one `heroSkillPoints`, and must preserve HERO9 revive formulas that read `heroLevel`.
8. Adopt skill-point readiness from source:
   - Each new hero starts with one skill point.
   - Each level-up grants a new ability/skill point.
   - Ultimate abilities first become available at level 6.
   - Ability levels, learned ability UI, aura, ultimate, and attribute growth stay deferred.
9. Preserve HERO9 semantics: death state, revive cost/time by level, uniqueness, no auto-selection, Holy Light legality, no duplicate Paladin.
10. The packet must not claim "complete hero system" or "complete Human".
11. The packet must define the next safe sequence:
   - `HERO10-DATA1` XP/leveling data seed.
   - `HERO10-IMPL1` minimal unit-kill XP gain + level-up runtime proof.
   - `HERO10-UX1` minimal visible level / skill-point feedback if needed.
   - `HERO10-CLOSE1` XP / leveling closure inventory.

Forbidden:

- Do not edit `src/game/Game.ts`, `src/game/GameData.ts`, runtime specs, production code, public assets, or board code.
- Do not run Playwright/runtime tests for this source-boundary task.
- Do not invent values outside the primary source table above.
- Do not implement XP gain, level-up, skill-point spend, hero UI, attribute growth, learned abilities, aura, ultimate, AI hero logic, items, other heroes, Tavern, shop, creeps, or enemy heroes.
- Do not mark V9, complete Human, or complete hero system as done.

Verification:

```bash
node --test tests/v9-hero10-xp-leveling-source-boundary.spec.mjs tests/v9-hero10-xp-leveling-contract.spec.mjs
npm run build
npx tsc --noEmit -p tsconfig.app.json
./scripts/cleanup-local-runtime.sh
```

Closeout requirements:

- Start your final closeout with the exact line: JOB_COMPLETE: <job-id>
- If truly blocked, emit the exact line: JOB_BLOCKED: <job-id>
- Include sections for files changed, verification run, and remaining unknowns.
- End with an exact line that begins with READY_FOR_NEXT_TASK: followed by the next safe continuation.
- Keep the work within the requested scope; do not widen ownership on your own.

### Task 221 — V9 HERO10-DATA1 XP / leveling data seed

Status: `accepted`.

Owner: GLM-style worker + Codex review.

Priority: Task220 is accepted. The XP / level / skill-point source values are now bounded, so the next safe step is data seed only. Runtime must still wait for IMPL1.

Codex acceptance: Codex fixed the data-seed doc wording from "runtime data" to "data seed" and tightened the static proof so values are checked inside the `HERO_XP_RULES` block. Local verification passed: 54/54 data proof, 130/130 joined proof, build, tsc, cleanup, and no residual browser/runtime processes.

Allowed files:

- `src/game/GameData.ts`
- `docs/V9_HERO10_XP_LEVELING_DATA_SEED.zh-CN.md`
- `tests/v9-hero10-xp-leveling-data-seed.spec.mjs`
- `docs/GLM_READY_TASK_QUEUE.md` only for closeout sync

Goal:

Add a data-only hero XP / leveling rules seed to `GameData.ts`, plus a static proof and short Chinese data-seed note. Do not wire runtime behavior.

Required data shape:

1. Add an exported constant near `HERO_REVIVE_RULES`, using project style. Preferred name: `HERO_XP_RULES`.
2. It must include:
   - `maxHeroLevel: 10`.
   - `xpThresholdsByLevel` for levels 1..10: `{ 1: 0, 2: 200, 3: 500, 4: 900, 5: 1400, 6: 2000, 7: 2700, 8: 3500, 9: 4400, 10: 5400 }`.
   - `heroKillXpByLevel` for enemy hero levels 1..10: `{ 1: 100, 2: 120, 3: 160, 4: 220, 5: 300, 6: 400, 7: 500, 8: 600, 9: 700, 10: 800 }`.
   - `creepXpRateByHeroLevel` for future creep use: `{ 1: 0.8, 2: 0.7, 3: 0.62, 4: 0.55, 5: 0 }`, with a comment/doc note that 5 represents level 5+.
   - `normalUnitXpByLevel` for unit levels 1..10: `{ 1: 25, 2: 40, 3: 60, 4: 85, 5: 115, 6: 150, 7: 190, 8: 235, 9: 285, 10: 340 }`.
   - `initialSkillPoints: 1`.
   - `skillPointsPerLevel: 1`.
   - `ultimateRequiredLevel: 6`.
3. The data-seed doc must state that HERO10-IMPL1 will start from enemy non-building unit kills only. Hero-kill XP and creep XP are source-bounded data but runtime-deferred because enemy heroes and creeps are not ready.
4. Preserve existing Paladin seed fields: `heroLevel: 1`, `heroXP: 0`, `heroSkillPoints: 1`.

Must prove:

1. `GameData.ts` exports the new XP rules constant.
2. All accepted Task220 source values are present exactly.
3. `Game.ts` does not import or consume the new XP rules yet.
4. Paladin seed fields are unchanged.
5. `HERO_REVIVE_RULES` still exists unchanged in purpose; do not move or remove it.
6. The data-seed doc says runtime is deferred and does not claim complete hero system or complete Human.

Forbidden:

- Do not edit `src/game/Game.ts`, runtime specs, public assets, board code, AI code, UI code, or package scripts.
- Do not run Playwright/runtime tests for this data-seed task.
- Do not implement XP gain, level-up, kill attribution, skill-point spend, ability learning UI, aura, ultimate, attribute growth, enemy heroes, creeps, items, AI hero logic, other heroes, Tavern, shop, second race, or multiplayer.
- Do not mark V9, complete Human, or complete hero system as done.

Verification:

```bash
node --test tests/v9-hero10-xp-leveling-data-seed.spec.mjs tests/v9-hero10-xp-leveling-source-boundary.spec.mjs
npm run build
npx tsc --noEmit -p tsconfig.app.json
./scripts/cleanup-local-runtime.sh
```

Closeout requirements:

- Start your final closeout with the exact line: JOB_COMPLETE: <job-id>
- If truly blocked, emit the exact line: JOB_BLOCKED: <job-id>
- Include sections for files changed, verification run, and remaining unknowns.
- End with an exact line that begins with READY_FOR_NEXT_TASK: followed by the next safe continuation.
- Keep the work within the requested scope; do not widen ownership on your own.

### Task 222 — V9 HERO10-IMPL1 minimal unit-kill XP runtime

Status: `accepted`.

Owner: GLM-style worker + Codex takeover.

Priority: Task221 is accepted. `HERO_XP_RULES` exists as data, and Task222 now wires the minimal player-team normal-unit XP runtime.

Allowed files:

- `src/game/Game.ts`
- `tests/v9-hero10-xp-leveling-runtime.spec.ts`
- `docs/V9_HERO10_XP_LEVELING_RUNTIME_SLICE.zh-CN.md`
- `docs/GLM_READY_TASK_QUEUE.md` only for closeout sync

Goal:

Implement the smallest runtime slice for Paladin XP gain and level-up, using `HERO_XP_RULES`. This is gameplay runtime only; do not add hero UI or ability learning.

Required behavior:

1. Import and consume `HERO_XP_RULES` from `GameData.ts`.
2. Extend the runtime `Unit` shape as needed so hero instances carry `heroLevel`, `heroXP`, and `heroSkillPoints`.
3. `spawnUnit` must initialize hero runtime fields from `UNITS[type]`: Paladin starts at level 1, XP 0, skill points 1.
4. When an enemy non-building, non-hero unit dies, award XP to the current alive Paladin on the opposing player team.
   - Current minimal project mapping may treat existing normal combat units as unit level 1 unless a unit-level field already exists.
   - Use `HERO_XP_RULES.normalUnitXpByLevel[1]` for the first runtime slice.
   - Do not award XP for buildings, dead heroes, gold mines, friendly deaths, enemy heroes, creeps, summons, items, or AI hero strategy.
5. If XP reaches a next-level threshold, increment `heroLevel` and add exactly `HERO_XP_RULES.skillPointsPerLevel` to `heroSkillPoints`.
6. A hero at `HERO_XP_RULES.maxHeroLevel` must not gain more XP.
7. Preserve HERO9 revive behavior: revive costs/time continue to read the current `heroLevel`; death-state and revive queues must not be broken.

Must prove:

1. Paladin starts with level 1 / XP 0 / skill points 1 in runtime.
2. Killing one enemy non-building unit grants 25 XP to alive Paladin.
3. Friendly unit death, building death, and dead Paladin do not gain XP.
4. Crossing 200 XP levels Paladin to level 2 and grants exactly one additional skill point.
5. Level 10 Paladin does not gain more XP.
6. Existing HERO9 revive runtime still passes or is covered by a focused adjacent proof.
7. The runtime slice doc states what is implemented and what remains deferred.

Forbidden:

- Do not edit `src/game/GameData.ts` except if TypeScript forces a non-behavioral type import cleanup; prefer not to edit it.
- Do not edit `SimpleAI.ts`, public assets, board code, package scripts, or unrelated docs.
- Do not implement hero UI, ability learning, skill-point spend, aura, ultimate, attribute growth, enemy hero XP, creep XP, XP sharing, multiple owned heroes, items, Tavern, shop, other heroes, second race, multiplayer, or AI hero strategy.
- Do not mark V9, complete Human, or complete hero system as done.
- Do not run `npx playwright test`, `npm exec playwright`, `vite preview`, or browser processes directly.

Verification:

```bash
./scripts/run-runtime-tests.sh tests/v9-hero10-xp-leveling-runtime.spec.ts --reporter=list
node --test tests/v9-hero10-xp-leveling-data-seed.spec.mjs tests/v9-hero10-xp-leveling-source-boundary.spec.mjs
npm run build
npx tsc --noEmit -p tsconfig.app.json
./scripts/cleanup-local-runtime.sh
```

Closeout requirements:

- Start your final closeout with the exact line: JOB_COMPLETE: <job-id>
- If truly blocked, emit the exact line: JOB_BLOCKED: <job-id>
- Include sections for files changed, verification run, and remaining unknowns.
- End with an exact line that begins with READY_FOR_NEXT_TASK: followed by the next safe continuation.
- Keep the work within the requested scope; do not widen ownership on your own.

Codex acceptance:

- GLM wrote the first implementation but repeatedly timed out while investigating XP-6 and weakened the revive spending assertion.
- Codex interrupted GLM, took over the patch, added a controlled no-gather fixture, restored exact level-2 revive spending proof, and blocked neutral / creep-like unit deaths from awarding XP in this MVP slice.
- Verification accepted:
  - `./scripts/run-runtime-tests.sh tests/v9-hero10-xp-leveling-runtime.spec.ts --reporter=list` → 6/6 passed.
  - `./scripts/run-runtime-tests.sh tests/v9-hero9-revive-runtime.spec.ts --reporter=list` → 7/7 passed.
  - `node --test tests/v9-hero10-xp-leveling-data-seed.spec.mjs tests/v9-hero10-xp-leveling-source-boundary.spec.mjs` → 130/130 passed.
  - `npm run build` passed.
  - `npx tsc --noEmit -p tsconfig.app.json` passed.
  - `./scripts/cleanup-local-runtime.sh` completed and process check found no Playwright/Vite/chrome-headless-shell leftovers.

### Task 223 — V9 HERO10-UX1 Paladin XP visible feedback slice

Status: `accepted`.

Owner: GLM-style worker + Codex takeover.

Priority: Task222 is accepted. Paladin can now gain XP and level up, and Task223 adds the minimum visible selection-HUD feedback for level / XP / unspent skill points.

Allowed files:

- `src/game/Game.ts`
- `tests/v9-hero10-xp-visible-feedback.spec.ts`
- `docs/V9_HERO10_XP_VISIBLE_FEEDBACK_SLICE.zh-CN.md`
- `docs/GLM_READY_TASK_QUEUE.md` only for closeout sync

Goal:

Expose the minimal visible feedback for the already-wired Paladin XP runtime. This is a small selection HUD / command-surface truth slice, not a full hero UI.

Required behavior:

1. When the player selects a live Paladin, the visible unit stats area must include:
   - hero level, e.g. `等级 1` / `等级 2`;
   - current XP and next threshold when not max level, e.g. `XP 25/200`;
   - unspent skill points, e.g. `技能点 1`.
2. After Paladin gains XP and levels up, selecting or refreshing the Paladin HUD must show the new level, XP total, and skill-point count.
3. At max level, the HUD must not show a misleading next threshold; use a clear Chinese phrase such as `最高等级`.
4. Dead Paladin state must still be honest: if selected through existing runtime hooks or after revive, the displayed level / XP / skill points must match the same hero record.
5. Do not introduce a separate hero panel, skill-learning UI, ability level UI, aura display, ultimate unlock UI, floating XP text, sound, new art, or AI behavior.

Must prove:

1. Fresh Paladin selection shows level 1, XP 0/200, and skill points 1.
2. After one enemy normal unit death, selected Paladin shows XP 25/200.
3. After crossing 200 XP, selected Paladin shows level 2, XP 200/500, and skill points 2.
4. At max level, selected Paladin shows level 10 and a max-level phrase instead of a fake next threshold.
5. HERO10-IMPL1 runtime proof still passes or the new spec includes an adjacent focused proof for XP gain + HUD refresh.
6. The Chinese UX slice doc states this is visible feedback only and does not claim complete hero UI or complete Human.

Forbidden:

- Do not edit `src/game/GameData.ts`, `SimpleAI.ts`, public assets, board code, package scripts, or unrelated docs.
- Do not implement skill learning, skill-point spending, hero command submenus, full hero portrait panel, ability levels, aura, ultimate, enemy hero XP, creep XP, XP sharing, multiple heroes, items, Tavern, shop, other heroes, second race, multiplayer, AI hero strategy, or complete hero system claims.
- Do not mark V9, complete Human, or complete hero system as done.
- Do not run `npx playwright test`, `npm exec playwright`, `vite preview`, or browser processes directly.

Verification:

```bash
./scripts/run-runtime-tests.sh tests/v9-hero10-xp-visible-feedback.spec.ts --reporter=list
./scripts/run-runtime-tests.sh tests/v9-hero10-xp-leveling-runtime.spec.ts --reporter=list
npm run build
npx tsc --noEmit -p tsconfig.app.json
./scripts/cleanup-local-runtime.sh
```

Closeout requirements:

- Start your final closeout with the exact line: JOB_COMPLETE: <job-id>
- If truly blocked, emit the exact line: JOB_BLOCKED: <job-id>
- Include sections for files changed, verification run, and remaining unknowns.
- End with an exact line that begins with READY_FOR_NEXT_TASK: followed by the next safe continuation.
- Keep the work within the requested scope; do not widen ownership on your own.

Codex acceptance:

- GLM wrote the HUD implementation, doc, and initial runtime spec, but ran runtime against stale `dist` without a successful rebuild and wrapped output in `tail` / `grep`.
- Codex interrupted GLM, rebuilt, corrected UX-5 to use the real revive path instead of direct dead-hero selection, and accepted the slice.
- Verification accepted:
  - `npm run build` passed.
  - `./scripts/run-runtime-tests.sh tests/v9-hero10-xp-visible-feedback.spec.ts --reporter=list` → 5/5 passed.
  - `./scripts/run-runtime-tests.sh tests/v9-hero10-xp-leveling-runtime.spec.ts --reporter=list` → 6/6 passed.
  - `npx tsc --noEmit -p tsconfig.app.json` passed.
  - `./scripts/cleanup-local-runtime.sh` completed and process check found no Playwright/Vite/chrome-headless-shell leftovers.

### Task 224 — V9 HERO10-CLOSE1 XP / leveling visible chain closure inventory

Status: `accepted`.

Owner: GLM-style worker + Codex takeover.

Priority: Task223 is accepted. HERO10 now has contract, source boundary, data seed, minimal runtime XP/level-up, and visible selection-HUD feedback. The next safe task is a static closure inventory, not another browser-heavy runtime task.

Allowed files:

- `docs/V9_HERO10_XP_LEVELING_CLOSURE.zh-CN.md`
- `tests/v9-hero10-xp-leveling-closure.spec.mjs`
- `docs/GLM_READY_TASK_QUEUE.md` only for closeout sync

Goal:

Create a static closure inventory that ties together the HERO10 evidence chain and states exactly what is done versus still deferred.

Required content:

1. List accepted HERO10 evidence in order:
   - HERO10-CONTRACT1 / Task219.
   - HERO10-SRC1 / Task220.
   - HERO10-DATA1 / Task221.
   - HERO10-IMPL1 / Task222.
   - HERO10-UX1 / Task223.
2. State the implemented player-facing chain in plain Chinese:
   - Paladin has level / XP / skill-point runtime fields.
   - Enemy player-team normal non-building unit death grants minimal XP.
   - Threshold crossing raises hero level and adds skill point.
   - Max level stops more XP.
   - Selection HUD shows level, XP to next threshold or max-level phrase, and unspent skill points.
   - HERO9 revive keeps level / XP / skill points.
3. Explicitly list still-deferred items:
   - skill learning / skill-point spend;
   - hero ability levels;
   - aura / ultimate / attributes;
   - enemy hero XP;
   - creep XP / neutral camps;
   - XP sharing / multiple owned heroes;
   - full hero panel / portrait UI;
   - AI hero strategy;
   - other Human heroes;
   - items, Tavern, shop, air, second race, multiplayer, assets.
4. State that this closes only the HERO10 minimum XP/leveling visible chain, not complete hero system, not complete Human, not V9 release.

Must prove:

1. Closure doc exists and references all five accepted HERO10 stages.
2. Closure doc includes the runtime + visible feedback chain listed above.
3. Closure doc explicitly says complete hero system, complete Human, and V9 release are not done.
4. Closure doc lists the deferred items.
5. Static proof checks source files exist:
   - `tests/v9-hero10-xp-leveling-contract.spec.mjs`
   - `tests/v9-hero10-xp-leveling-source-boundary.spec.mjs`
   - `tests/v9-hero10-xp-leveling-data-seed.spec.mjs`
   - `tests/v9-hero10-xp-leveling-runtime.spec.ts`
   - `tests/v9-hero10-xp-visible-feedback.spec.ts`

Forbidden:

- Do not edit `src/game/Game.ts`, `src/game/GameData.ts`, runtime specs, UI code, assets, `SimpleAI.ts`, package scripts, board code, or unrelated docs.
- Do not run Playwright/runtime tests for this static closure task.
- Do not implement new behavior.
- Do not mark V9, complete Human, or complete hero system as done.

Verification:

```bash
node --test tests/v9-hero10-xp-leveling-closure.spec.mjs
npm run build
npx tsc --noEmit -p tsconfig.app.json
./scripts/cleanup-local-runtime.sh
```

Closeout requirements:

- Start your final closeout with the exact line: JOB_COMPLETE: <job-id>
- If truly blocked, emit the exact line: JOB_BLOCKED: <job-id>
- Include sections for files changed, verification run, and remaining unknowns.
- End with an exact line that begins with READY_FOR_NEXT_TASK: followed by the next safe continuation.
- Keep the work within the requested scope; do not widen ownership on your own.

Codex acceptance:

- GLM wrote the closure doc and static proof, then got stuck repeatedly editing this queue file.
- Codex interrupted GLM, reviewed the scope, and accepted the closure as a bounded HERO10 closeout.
- Verification accepted:
  - `node --test tests/v9-hero10-xp-leveling-closure.spec.mjs` → 31/31 passed.
  - `npm run build` passed.
  - `npx tsc --noEmit -p tsconfig.app.json` passed.
  - `./scripts/cleanup-local-runtime.sh` completed and process check found no Playwright/Vite/chrome-headless-shell leftovers.
- Boundary accepted: this closes only Paladin minimum XP / leveling visible feedback, not complete hero system, complete Human, or V9 release.

### Task 225 — V9 HERO11-CONTRACT1 Hero skill learning / Holy Light level branch contract

Status: `accepted`.

Owner: GLM-style worker + Codex review.

Priority: Task224 is accepted. HERO10 now makes skill points visible, but the player cannot spend them and Holy Light has only the current level-1 runtime. The next safe step is a static contract for learning/spending hero skill points and leveling Holy Light, not implementation.

Allowed files:

- `docs/V9_HERO11_SKILL_LEARNING_CONTRACT.zh-CN.md`
- `tests/v9-hero11-skill-learning-contract.spec.mjs`
- `docs/GLM_READY_TASK_QUEUE.md` only for closeout sync

Goal:

Create a static contract that defines how the project will turn visible `heroSkillPoints` into a usable hero skill-learning path for Paladin / Holy Light without breaking the accepted HERO7-HERO10 behavior.

Required content:

1. State the current baseline:
   - Paladin can be summoned, cast level-1 Holy Light, die/revive, gain XP, level up, and show skill points.
   - Skill points are currently visible data only; no spend path exists.
   - Holy Light level 2/3, learn UI, ability level storage, aura, ultimate, other Paladin abilities, and other heroes are not implemented.
2. Define the HERO11 contract boundary:
   - skill point spend must be explicit through a player-visible command-card or hero-panel entry;
   - spending one point increases a Paladin-owned ability level by 1;
   - the first implementation target is Holy Light only;
   - learned ability level must survive death and revive;
   - existing HERO7 Holy Light legality and HERO9/HERO10 death/revive/XP semantics must not regress.
3. Define a safe implementation sequence:
   - `HERO11-SRC1` source boundary for Holy Light level 2/3 heal values and skill learning rules;
   - `HERO11-DATA1` data shape for ability levels / learnable hero abilities;
   - `HERO11-IMPL1` minimal skill-point spend runtime for Holy Light;
   - `HERO11-UX1` visible learned-level feedback;
   - `HERO11-CLOSE1` closure inventory.
4. Explicitly list deferred items:
   - Divine Shield, Devotion Aura, Resurrection ultimate;
   - Archmage, Mountain King, Blood Mage;
   - enemy hero XP / creep XP / multi-hero XP sharing;
   - full portrait hero panel, items, shop, AI hero strategy, air, second race, multiplayer, assets.
5. State that this contract does not itself change gameplay or mark complete hero system / complete Human / V9 release done.

Must prove:

1. Contract doc exists and references accepted HERO7-HERO10 evidence.
2. Contract doc says skill points are visible but not currently spendable.
3. Contract doc defines explicit spend, Holy Light as first target, revive persistence, and regression boundaries.
4. Contract doc lists the implementation sequence above.
5. Contract doc denies complete hero system, complete Human, and V9 release.
6. Static proof checks `src/game/Game.ts` and `src/game/GameData.ts` were not modified by this task through content expectations only; do not add production-code assertions that would block future HERO11 tasks.

Forbidden:

- Do not edit `src/game/Game.ts`, `src/game/GameData.ts`, runtime specs, UI code, assets, `SimpleAI.ts`, package scripts, board code, or unrelated docs.
- Do not run Playwright/runtime tests for this static contract task.
- Do not implement skill learning, ability levels, new Paladin abilities, other heroes, AI hero behavior, items, or hero panel UI.
- Do not weaken existing HERO7/HERO9/HERO10 assertions.
- Do not claim complete hero system, complete Human, or V9 release.

Verification:

```bash
node --test tests/v9-hero11-skill-learning-contract.spec.mjs
npm run build
npx tsc --noEmit -p tsconfig.app.json
./scripts/cleanup-local-runtime.sh
```

Closeout requirements:

- Start your final closeout with the exact line: JOB_COMPLETE: <job-id>
- If truly blocked, emit the exact line: JOB_BLOCKED: <job-id>
- Include sections for files changed, verification run, and remaining unknowns.
- End with an exact line that begins with READY_FOR_NEXT_TASK: followed by the next safe continuation.
- Keep the work within the requested scope; do not widen ownership on your own.

Codex acceptance:

- GLM completed the static contract, doc, proof, and clean closeout, but wrapped validation output with `tail`.
- Codex reran full local verification and accepted the contract.
- Verification accepted:
  - `node --test tests/v9-hero11-skill-learning-contract.spec.mjs` → 34/34 passed.
  - `npm run build` passed.
  - `npx tsc --noEmit -p tsconfig.app.json` passed.
  - `./scripts/cleanup-local-runtime.sh` completed and process check found no Playwright/Vite/chrome-headless-shell leftovers.
- Boundary accepted: this opens only the next source/data/runtime sequence for Paladin skill-point spending and Holy Light levels. It does not implement skill learning or mark the hero system complete.

### Task 226 — V9 HERO11-SRC1 Holy Light levels / skill-learning rules source boundary

Status: `accepted`.

Owner: GLM-style worker + Codex takeover.

Priority: Task225 is accepted. HERO11 has a contract, but it must not enter data or runtime until Holy Light levels and skill-learning rules are source-bounded. This task is a source boundary only.

Allowed files:

- `docs/V9_HERO11_HOLY_LIGHT_LEVEL_SOURCE_BOUNDARY.zh-CN.md`
- `tests/v9-hero11-holy-light-level-source-boundary.spec.mjs`
- `docs/GLM_READY_TASK_QUEUE.md` only for closeout sync

Goal:

Create a source boundary for Holy Light levels 1/2/3 and basic hero skill-learning rules before any HERO11 data seed or runtime implementation.

Required content:

1. State source hierarchy in plain Chinese:
   - primary source: current Blizzard Classic / Battle.net hero ability pages when reachable;
   - cross-check sources: Liquipedia / StrategyWiki / Wowpedia-style community references;
   - conflict samples: older patch notes, community tables, or HERO1 candidate values;
   - when sources conflict, adopt the current primary source unless Codex explicitly overrides.
2. Source-bound Holy Light level values:
   - keep level 1 aligned with current accepted runtime (`effectValue: 200`, mana 65, cooldown 5, range 8.0);
   - research and record adopted level 2 and level 3 heal values;
   - explicitly reject or downgrade any unverified HERO1 candidate values such as `350/500` unless sources confirm them.
3. Source-bound basic skill-learning rules:
   - new hero starts with 1 skill point;
   - each level-up grants 1 skill point;
   - normal hero abilities have three levels, but exact learn-level gates must be sourced rather than guessed;
   - ultimate ability unlock rules must be recorded only as deferred context, not implemented.
4. Define project mapping for HERO11-DATA1:
   - keep Holy Light level data out of runtime until DATA1 / IMPL1;
   - recommend a data shape, but do not edit `GameData.ts`;
   - keep current HERO7 level-1 runtime as the compatibility baseline.
5. Explicitly defer:
   - Divine Shield, Devotion Aura, Resurrection ultimate;
   - Archmage, Mountain King, Blood Mage;
   - AI hero strategy, full hero panel, items, shops, creep XP, enemy hero XP, multi-hero XP, air, second race, multiplayer, assets.

Must prove:

1. Source boundary doc exists and references Task225 / HERO11-CONTRACT1.
2. Doc records source hierarchy and conflict policy.
3. Doc records adopted Holy Light levels 1/2/3 and keeps level 1 compatible with existing `ABILITIES.holy_light`.
4. Doc records skill-point gain rules and says learn-level gates are source-bound.
5. Doc explicitly rejects unverified candidate values when unsupported.
6. Doc defines next task as `HERO11-DATA1` and does not claim runtime behavior changed.
7. Static proof checks `src/game/GameData.ts` still has the current level-1 `holy_light` data and no new Holy Light level table introduced by this task.

Forbidden:

- Do not edit `src/game/Game.ts`, `src/game/GameData.ts`, runtime specs, UI code, assets, `SimpleAI.ts`, package scripts, board code, or unrelated docs.
- Do not run Playwright/runtime tests for this static source-boundary task.
- Do not implement skill learning, ability levels, ability-level data tables, UI, AI, other Paladin skills, or other heroes.
- Do not claim complete hero system, complete Human, or V9 release.

Verification:

```bash
node --test tests/v9-hero11-holy-light-level-source-boundary.spec.mjs
npm run build
npx tsc --noEmit -p tsconfig.app.json
./scripts/cleanup-local-runtime.sh
```

Closeout requirements:

- Start your final closeout with the exact line: JOB_COMPLETE: <job-id>
- If truly blocked, emit the exact line: JOB_BLOCKED: <job-id>
- Include sections for files changed, verification run, and remaining unknowns.
- End with an exact line that begins with READY_FOR_NEXT_TASK: followed by the next safe continuation.
- Keep the work within the requested scope; do not widen ownership on your own.

Codex acceptance:

- GLM started Task226, found the main Holy Light values, and wrote the source-boundary doc, but hit context limit / auto-compact before proof or closeout.
- Codex took over, corrected the source hierarchy to prefer Blizzard Classic / Classic mirror pages over Liquipedia, fixed Holy Light source range to 80 → project 8.0, added sourced learn gates 1/3/5, and removed the unsafe "any level can spend" mapping.
- Verification accepted:
  - `node --test tests/v9-hero11-holy-light-level-source-boundary.spec.mjs` → 9/9 passed.
  - `npm run build` passed.
  - `npx tsc --noEmit -p tsconfig.app.json` passed.
  - `./scripts/cleanup-local-runtime.sh` completed and process check found no Playwright/Vite/chrome-headless-shell leftovers.
- Boundary accepted: this is source-only. `GameData.ts` still has only the current level-1 `ABILITIES.holy_light` data; DATA1 will add the level table.

### Task 227 — V9 HERO11-DATA1 Holy Light level data seed

Status: `accepted`.

Owner: GLM-style worker + Codex takeover.

Priority: Task226 is accepted. Holy Light level values and learn gates are now source-bounded. The next safe step is a data seed only: add level data without wiring runtime skill learning.

Allowed files:

- `src/game/GameData.ts`
- `docs/V9_HERO11_HOLY_LIGHT_LEVEL_DATA_SEED.zh-CN.md`
- `tests/v9-hero11-holy-light-level-data-seed.spec.mjs`
- `docs/GLM_READY_TASK_QUEUE.md` only for closeout sync

Goal:

Add a data-only seed for Holy Light level 1/2/3 values and learn gates, based on Task226, while preserving the current level-1 runtime behavior.

Required implementation:

1. In `src/game/GameData.ts`, add a small typed data shape for hero ability levels, for example:
   - `HeroAbilityLevelDef` with `level`, `effectValue`, `undeadDamage`, `mana`, `cooldown`, `range`, `requiredHeroLevel`.
   - `HERO_ABILITY_LEVELS` with a `holy_light` entry.
2. Seed `HERO_ABILITY_LEVELS.holy_light` with exactly:
   - level 1: heal 200, undeadDamage 100, mana 65, cooldown 5, range 8.0, requiredHeroLevel 1;
   - level 2: heal 400, undeadDamage 200, mana 65, cooldown 5, range 8.0, requiredHeroLevel 3;
   - level 3: heal 600, undeadDamage 300, mana 65, cooldown 5, range 8.0, requiredHeroLevel 5;
   - maxLevel 3.
3. Leave `ABILITIES.holy_light` unchanged as the current level-1 runtime compatibility object.
4. Document that DATA1 does not implement skill spending, command-card learning UI, level-2/3 casting, undead damage, AI, other Paladin skills, other heroes, or full hero panel.
5. Add static proof that the data table matches Task226 and that no runtime file consumes it yet.

Must prove:

1. `HERO_ABILITY_LEVELS` exists in `GameData.ts`.
2. The Holy Light table has levels 1/2/3 with adopted values 200/400/600, 100/200/300 undead damage, mana 65, cooldown 5, range 8.0, and required hero levels 1/3/5.
3. Existing `ABILITIES.holy_light` remains level-1 compatible: `effectValue: 200`, `cost: { mana: 65 }`, `cooldown: 5`, `range: 8.0`.
4. `Game.ts` does not import or consume `HERO_ABILITY_LEVELS` in this DATA1 task.
5. Data-seed doc references Task226 and says runtime is unchanged.

Forbidden:

- Do not edit `src/game/Game.ts`, runtime specs, UI code, assets, `SimpleAI.ts`, package scripts, board code, or unrelated docs.
- Do not run Playwright/runtime tests for this static data-seed task.
- Do not implement skill learning, ability-level casting, undead damage runtime, command-card learn buttons, AI, other Paladin skills, or other heroes.
- Do not change existing level-1 Holy Light runtime behavior.
- Do not claim complete hero system, complete Human, or V9 release.

Verification:

```bash
node --test tests/v9-hero11-holy-light-level-data-seed.spec.mjs
node --test tests/v9-hero11-holy-light-level-source-boundary.spec.mjs
npm run build
npx tsc --noEmit -p tsconfig.app.json
./scripts/cleanup-local-runtime.sh
```

Closeout requirements:

- Start your final closeout with the exact line: JOB_COMPLETE: <job-id>
- If truly blocked, emit the exact line: JOB_BLOCKED: <job-id>
- Include sections for files changed, verification run, and remaining unknowns.
- End with an exact line that begins with READY_FOR_NEXT_TASK: followed by the next safe continuation.
- Keep the work within the requested scope; do not widen ownership on your own.

Codex acceptance:

- GLM completed the data seed, data doc, and static proof, but returned to queue editing errors during closeout.
- Codex interrupted GLM, reviewed the data shape, reran verification, and accepted the task.
- Verification accepted:
  - `node --test tests/v9-hero11-holy-light-level-data-seed.spec.mjs tests/v9-hero11-holy-light-level-source-boundary.spec.mjs` → 39/39 passed.
  - `npm run build` passed.
  - `npx tsc --noEmit -p tsconfig.app.json` passed.
  - `./scripts/cleanup-local-runtime.sh` completed and final process check found no Playwright/Vite/chrome-headless-shell leftovers.
- Boundary accepted: `HERO_ABILITY_LEVELS` is data-only. `Game.ts` does not consume it yet, and existing level-1 `ABILITIES.holy_light` runtime stays unchanged.

### Task 228 — V9 HERO11-IMPL1 Holy Light skill-point spend runtime

Status: `accepted`.

Owner: GLM-style worker + Codex takeover.

Priority: Task227 is accepted. Holy Light levels are now source-bounded and seeded in `GameData.ts`; the next step is the smallest runtime slice that lets the player spend skill points on Holy Light without opening other hero systems.

Allowed files:

- `src/game/Game.ts`
- `tests/v9-hero11-holy-light-skill-spend-runtime.spec.ts`
- `tests/v9-hero7-holy-light-runtime.spec.ts` only for necessary stage-updates after learn-before-cast behavior changes
- `tests/v9-hero9-revive-runtime.spec.ts` only for necessary persistence proof additions
- `docs/V9_HERO11_HOLY_LIGHT_SKILL_SPEND_RUNTIME.zh-CN.md`
- `docs/GLM_READY_TASK_QUEUE.md` only for closeout sync

Goal:

Implement the minimal player-visible runtime path for spending Paladin skill points on Holy Light levels 1/2/3, using `HERO_ABILITY_LEVELS.holy_light`.

Required behavior:

1. Paladin starts with `heroSkillPoints` from existing HERO10 rules and no learned Holy Light level, unless an existing saved/runtime record already has one.
2. Paladin command card shows a visible learn action for Holy Light when:
   - Paladin is alive;
   - `heroSkillPoints > 0`;
   - next Holy Light level exists;
   - Paladin `heroLevel >= requiredHeroLevel` for the next level.
3. Clicking learn consumes exactly 1 skill point and increases the stored Holy Light level by 1.
4. Holy Light cast action is available only when learned level is at least 1.
5. Casting Holy Light reads the learned level from `HERO_ABILITY_LEVELS.holy_light`:
   - level 1 heals 200;
   - level 2 heals 400;
   - level 3 heals 600;
   - mana 65, cooldown 5, range 8.0 remain unchanged.
6. Learned Holy Light level and remaining skill points survive death and Altar revive.
7. Existing HERO7 target legality remains intact after learning: no self-cast, no enemy, no full-health, no out-of-range, no low-mana, no cooldown bypass.

Must prove with focused runtime:

1. New Paladin has a learn Holy Light action and cannot cast Holy Light before learning it.
2. Learning level 1 consumes 1 skill point and enables current level-1 Holy Light behavior.
3. Holy Light level 2 cannot be learned before Paladin level 3.
4. After controlled XP/leveling to level 3, learning level 2 consumes 1 point and heals 400.
5. Learned Holy Light level and remaining skill points persist through death and revive.
6. Existing HERO7 Holy Light legality still passes after learning.

Forbidden:

- Do not edit `src/game/GameData.ts` except if a compile-only type fix is unavoidable; if touched, explain why.
- Do not edit assets, `SimpleAI.ts`, package scripts, board code, or unrelated docs.
- Do not implement Divine Shield, Devotion Aura, Resurrection ultimate, Archmage, Mountain King, Blood Mage, AI hero strategy, items, shops, full hero panel, undead-damage runtime, creep XP, enemy hero XP, air, second race, multiplayer, or assets.
- Do not bypass runtime wrapper. Use `./scripts/run-runtime-tests.sh ... --reporter=list`.
- Do not weaken existing HERO7/HERO9/HERO10 assertions to make the new tests pass.

Verification:

```bash
npm run build
./scripts/run-runtime-tests.sh tests/v9-hero11-holy-light-skill-spend-runtime.spec.ts --reporter=list
./scripts/run-runtime-tests.sh tests/v9-hero7-holy-light-runtime.spec.ts --reporter=list
./scripts/run-runtime-tests.sh tests/v9-hero9-revive-runtime.spec.ts --reporter=list
node --test tests/v9-hero11-holy-light-level-data-seed.spec.mjs tests/v9-hero11-holy-light-level-source-boundary.spec.mjs
npx tsc --noEmit -p tsconfig.app.json
./scripts/cleanup-local-runtime.sh
```

Closeout requirements:

- Start your final closeout with the exact line: JOB_COMPLETE: <job-id>
- If truly blocked, emit the exact line: JOB_BLOCKED: <job-id>
- Include sections for files changed, verification run, and remaining unknowns.
- End with an exact line that begins with READY_FOR_NEXT_TASK: followed by the next safe continuation.
- Keep the work within the requested scope; do not widen ownership on your own.

Acceptance update:

- GLM produced the main slice but also touched DATA1 proof/doc because the earlier DATA1 no-runtime wording became obsolete after IMPL1; Codex accepted that phase upgrade instead of reverting it.
- Codex tightened the implementation so Holy Light cast data reads the learned level from `HERO_ABILITY_LEVELS`, command-card refresh keys include hero ability state, stale learn clicks re-check skill points, death and required level, and the revive proof uses the real Altar queue path.
- Verification accepted:
  - `npm run build`
  - `./scripts/run-runtime-tests.sh tests/v9-hero11-holy-light-skill-spend-runtime.spec.ts --reporter=list` → 6/6 passed.
  - `./scripts/run-runtime-tests.sh tests/v9-hero7-holy-light-runtime.spec.ts --reporter=list` → 7/7 passed.
  - `./scripts/run-runtime-tests.sh tests/v9-hero9-revive-runtime.spec.ts --reporter=list` → 7/7 passed.
  - `node --test tests/v9-hero11-holy-light-level-data-seed.spec.mjs tests/v9-hero11-holy-light-level-source-boundary.spec.mjs` → 39/39 passed.
  - `npx tsc --noEmit -p tsconfig.app.json`
  - `./scripts/cleanup-local-runtime.sh` plus 30 second process observation found no Playwright/Vite/chrome-headless-shell leftovers.

### Task 229 — V9 HERO11-UX1 Holy Light learned level visible feedback

Status: `accepted`.

Owner: GLM-style worker + Codex review.

Priority: Task228 is accepted. Players can now spend Paladin skill points on Holy Light, but the command card still needs clearer learned-level feedback so the action reads as a real Warcraft-style skill instead of a hidden state change.

Allowed files:

- `src/game/Game.ts`
- `tests/v9-hero11-holy-light-learned-feedback.spec.ts`
- `docs/V9_HERO11_HOLY_LIGHT_LEARNED_FEEDBACK.zh-CN.md`
- `docs/GLM_READY_TASK_QUEUE.md` only for closeout sync

Goal:

Add the smallest visible feedback layer for Holy Light learning state.

Required behavior:

1. When Paladin has not learned Holy Light, the command card clearly exposes the learn action and the next requirement.
2. After learning level 1, the command card label or hint shows Holy Light level 1 and remaining skill points.
3. At Paladin level 1, level 2 learning is visibly blocked by the level 3 requirement, not silently hidden.
4. After Paladin reaches level 3, level 2 becomes learnable and the visible state updates after learning.
5. After death and Altar revive, the selected Paladin still shows the learned Holy Light level and remaining skill points.
6. Existing Holy Light cast legality and skill-spend runtime behavior from Task228 remain unchanged.

Forbidden:

- Do not implement Divine Shield, Devotion Aura, Resurrection ultimate, other Paladin skills, other heroes, AI hero strategy, items, shops, full hero panel, undead-damage runtime, creep XP, enemy hero XP, air, second race, multiplayer, or assets.
- Do not edit `GameData.ts` unless a compile-only type fix is unavoidable and documented.
- Do not weaken Task228/HERO7/HERO9 assertions to make feedback tests pass.
- Do not bypass runtime wrapper. Use `./scripts/run-runtime-tests.sh ... --reporter=list`.

Verification:

```bash
npm run build
./scripts/run-runtime-tests.sh tests/v9-hero11-holy-light-learned-feedback.spec.ts --reporter=list
./scripts/run-runtime-tests.sh tests/v9-hero11-holy-light-skill-spend-runtime.spec.ts --reporter=list
npx tsc --noEmit -p tsconfig.app.json
./scripts/cleanup-local-runtime.sh
```

Closeout requirements:

- Start your final closeout with the exact line: JOB_COMPLETE: <job-id>
- If truly blocked, emit the exact line: JOB_BLOCKED: <job-id>
- Include sections for files changed, verification run, and remaining unknowns.
- End with an exact line that begins with READY_FOR_NEXT_TASK: followed by the next safe continuation.
- Keep the work within the requested scope; do not widen ownership on your own.

Acceptance update:

- GLM added the visible Holy Light level proof and doc. Codex tightened the HUD contract so `技能点 0` remains visible after learning.
- Verification accepted:
  - `npm run build`
  - `./scripts/run-runtime-tests.sh tests/v9-hero11-holy-light-learned-feedback.spec.ts --reporter=list` → 6/6 passed.
  - `./scripts/run-runtime-tests.sh tests/v9-hero11-holy-light-skill-spend-runtime.spec.ts --reporter=list` → 6/6 passed.
  - `node --test tests/v9-hero11-holy-light-level-data-seed.spec.mjs tests/v9-hero11-holy-light-level-source-boundary.spec.mjs` → 39/39 passed.
  - `npx tsc --noEmit -p tsconfig.app.json`
  - `./scripts/cleanup-local-runtime.sh` plus 30 second process observation found no Playwright/Vite/chrome-headless-shell leftovers.

### Task 230 — V9 HERO11-CLOSE1 Holy Light skill learning closure inventory

Status: `accepted`.

Owner: GLM-style worker + Codex review.

Priority: Task229 is accepted. HERO11 now needs a static closure inventory so the next branch does not accidentally re-open the same Holy Light learning work or claim a complete hero system.

Allowed files:

- `docs/V9_HERO11_HOLY_LIGHT_SKILL_LEARNING_CLOSURE.zh-CN.md`
- `tests/v9-hero11-holy-light-skill-learning-closure.spec.mjs`
- `docs/GLM_READY_TASK_QUEUE.md` only for closeout sync

Goal:

Create a static closure inventory for the Paladin Holy Light skill-learning chain.

Must prove:

1. HERO11 has accepted evidence for contract, source boundary, level data seed, skill-point spend runtime, and learned-level visible feedback.
2. The closure doc lists the exact implemented player-visible behavior: learn Holy Light Lv1/Lv2/Lv3 by spending skill points, 1/3/5 hero-level gates, 200/400/600 healing, visible current level, visible remaining skill points, and revive persistence.
3. The closure doc explicitly says this closes only the Paladin Holy Light minimal learning chain.
4. The closure doc explicitly excludes undead-damage runtime, other Paladin skills, other Human heroes, AI hero strategy, items, shops, full hero panel, creep/hero XP, air, second race, multiplayer, assets, complete hero system, complete Human, and V9 release.
5. The proof checks the existence of the relevant docs/tests instead of relying on chat history.

Forbidden:

- Do not edit production runtime files.
- Do not run Playwright or browser/runtime tests for this static closure task.
- Do not implement or modify any ability, hero, AI behavior, UI surface, asset, build script, or board code.
- Do not claim complete hero system, complete Human, or V9 release.

Verification:

```bash
node --test tests/v9-hero11-holy-light-skill-learning-closure.spec.mjs
npm run build
npx tsc --noEmit -p tsconfig.app.json
./scripts/cleanup-local-runtime.sh
```

Closeout requirements:

- Start your final closeout with the exact line: JOB_COMPLETE: <job-id>
- If truly blocked, emit the exact line: JOB_BLOCKED: <job-id>
- Include sections for files changed, verification run, and remaining unknowns.
- End with an exact line that begins with READY_FOR_NEXT_TASK: followed by the next safe continuation.
- Keep the work within the requested scope; do not widen ownership on your own.

Acceptance update:

- Codex 本地复核接受：closure doc 和 36 条静态 proof 成立，证明 HERO11 只关闭 Paladin Holy Light 最小学习链。
- Verification accepted:
  - `node --test tests/v9-hero11-holy-light-skill-learning-closure.spec.mjs` → 36/36 passed.
  - `npm run build`
  - `npx tsc --noEmit -p tsconfig.app.json`
  - `./scripts/cleanup-local-runtime.sh` plus 30 second process observation found no Playwright/Vite/chrome-headless-shell leftovers.

### Task 231 — V9 HERO12-CONTRACT1 Paladin Divine Shield branch contract

Status: `accepted`.

Owner: GLM-style worker.

Priority: HERO11 Holy Light learning chain is closed. The next narrow hero branch should start with a contract for the next Paladin skill, Divine Shield, without implementing runtime or inventing unverified numeric data.

Allowed files:

- `docs/V9_HERO12_DIVINE_SHIELD_CONTRACT.zh-CN.md`
- `tests/v9-hero12-divine-shield-contract.spec.mjs`
- `docs/GLM_READY_TASK_QUEUE.md` only for closeout sync

Goal:

Create the branch contract for Paladin Divine Shield.

Must define:

1. The branch sequence: CONTRACT1 -> SRC1 -> DATA1 -> IMPL1 -> UX1 -> CLOSE1.
2. Current precondition: Paladin, skill points, abilityLevels, Holy Light learning, death/revive persistence, and command-card feedback already exist from HERO6-HERO11.
3. Desired player-visible behavior at a contract level: Paladin can learn Divine Shield by spending skill points, can activate a temporary self-only protective state, and death/revive / cooldown / mana rules must remain coherent.
4. Source boundary requirement: exact Divine Shield levels, mana, cooldown, duration, learn gates, and War3 behavior must be resolved in HERO12-SRC1 before any data or runtime change.
5. Runtime proof obligations for future IMPL1: learn gate, skill-point spend, self-target only, duration expiry, cooldown/mana, interaction with taking damage, death/revive persistence, and no effect on other units.
6. Explicit exclusions: no runtime implementation, no GameData seed, no Game.ts changes, no AI hero strategy, no Devotion Aura, no Resurrection ultimate, no Archmage/Mountain King/Blood Mage, no items/shops/tavern, no full hero panel, no assets, no complete hero system, no complete Human, no V9 release.

Forbidden:

- Do not edit production runtime files.
- Do not edit `src/game/GameData.ts`.
- Do not run Playwright or browser/runtime tests.
- Do not invent Divine Shield numeric values in production data.
- Do not implement the ability.

Verification:

```bash
node --test tests/v9-hero12-divine-shield-contract.spec.mjs
npm run build
npx tsc --noEmit -p tsconfig.app.json
./scripts/cleanup-local-runtime.sh
```

Closeout requirements:

- Start your final closeout with the exact line: JOB_COMPLETE: <job-id>
- If truly blocked, emit the exact line: JOB_BLOCKED: <job-id>
- Include sections for files changed, verification run, and remaining unknowns.
- End with an exact line that begins with READY_FOR_NEXT_TASK: followed by the next safe continuation.
- Keep the work within the requested scope; do not widen ownership on your own.

Acceptance:

- Codex 本地复核接受：合同文档明确 HERO12 只开启 Divine Shield 分支边界，后续顺序为 SRC1 -> DATA1 -> IMPL1 -> UX1 -> CLOSE1。
- Verification accepted:
  - `node --test tests/v9-hero12-divine-shield-contract.spec.mjs` -> 37/37 passed.
  - `npm run build`
  - `npx tsc --noEmit -p tsconfig.app.json`
  - `./scripts/cleanup-local-runtime.sh` plus 30 second process observation found no Playwright/Vite/chrome-headless-shell leftovers.
- GLM closeout 仍使用过链式 / tail 截断验证；Codex 已重新分步复验，不把 GLM 截断输出作为 accepted 证据。

### Task 232 — V9 HERO12-SRC1 Divine Shield source boundary

Status: `accepted`.

Owner: GLM-style worker.

Priority: Task231 已接受。HERO12 下一步必须先固定 Divine Shield 的来源和项目映射，之后才允许 DATA1 写数据或 IMPL1 改运行时。

Allowed files:

- `docs/V9_HERO12_DIVINE_SHIELD_SOURCE_BOUNDARY.zh-CN.md`
- `tests/v9-hero12-divine-shield-source-boundary.spec.mjs`
- `docs/GLM_READY_TASK_QUEUE.md` only for closeout sync

Goal:

Create the source boundary packet for Paladin Divine Shield.

Must use and prove:

1. Primary source: Blizzard Classic Battle.net Paladin page, `https://classic.battle.net/war3/human/units/paladin.shtml`.
2. Adopted Divine Shield levels:
   - level 1: duration 15, cooldown 35 sec., mana 25, range N/A, area Personal, allowed target Self, effect Invulnerability, hero level req 1.
   - level 2: duration 30, cooldown 50 sec., mana 25, range N/A, area Personal, allowed target Self, effect Invulnerability, hero level req 3.
   - level 3: duration 45, cooldown 65 sec., mana 25, range N/A, area Personal, allowed target Self, effect Invulnerability, hero level req 5.
3. Behavior note: Divine Shield is an invincibility spell; enemies cannot harm the Paladin until it wears off.
4. Behavior note: Divine Shield cannot be deactivated.
5. Project mapping:
   - `range: null` or equivalent no-target/self-cast marker must be used later, not a world-target range.
   - target rule is self-only Paladin.
   - effect is temporary invulnerability, not armor bonus, healing, evasion, damage absorb, aura, or stun.
   - cooldown and duration are seconds in project runtime.
6. Explicitly keep DATA1 / IMPL1 closed: do not edit `src/game/GameData.ts`, `src/game/Game.ts`, `src/game/SimpleAI.ts`, UI, CSS, assets, or runtime tests.
7. Record uncertain / non-goals: no Devotion Aura, Resurrection, other Paladin abilities, other Human heroes, items, shop, tavern, AI hero strategy, complete hero system, complete Human, or V9 release.

Forbidden:

- Do not edit production runtime files.
- Do not edit `src/game/GameData.ts`.
- Do not run Playwright or browser/runtime tests.
- Do not implement Divine Shield.
- Do not weaken Task231 contract proof.
- Do not use unofficial values if they conflict with the Blizzard Classic page; if a conflict is discovered, document it as non-adopted instead of mixing values.

Verification:

```bash
node --test tests/v9-hero12-divine-shield-source-boundary.spec.mjs tests/v9-hero12-divine-shield-contract.spec.mjs
npm run build
npx tsc --noEmit -p tsconfig.app.json
./scripts/cleanup-local-runtime.sh
```

Closeout requirements:

- Start your final closeout with the exact line: JOB_COMPLETE: <job-id>
- If truly blocked, emit the exact line: JOB_BLOCKED: <job-id>
- Include sections for files changed, verification run, and remaining unknowns.
- End with an exact line that begins with READY_FOR_NEXT_TASK: followed by the next safe continuation.
- Keep the work within the requested scope; do not widen ownership on your own.

Acceptance:

- Codex 本地复核接受：来源边界采用 Blizzard Classic Battle.net Paladin 页面为主源，固定 Divine Shield 等级 1/2/3 的持续时间、冷却、mana、Self/Personal/Invulnerability、学习等级和不可主动取消语义。
- Codex 修正 GLM 初版 proof 的一处否定句误判：文档必须能写“不是护甲加成 / 治疗 / 伤害吸收 / 光环 / 眩晕”，proof 不能因为这些词出现在否定句里失败。
- Verification accepted:
  - `node --test tests/v9-hero12-divine-shield-source-boundary.spec.mjs tests/v9-hero12-divine-shield-contract.spec.mjs` -> 61/61 passed.
  - `npm run build`
  - `npx tsc --noEmit -p tsconfig.app.json`
  - `./scripts/cleanup-local-runtime.sh` plus 30 second process observation found no Playwright/Vite/chrome-headless-shell leftovers.

### Task 233 — V9 HERO12-DATA1 Divine Shield level data seed

Status: `accepted`.

Owner: GLM-style worker + Codex takeover/review.

Priority: Task232 已接受。下一步只把 Divine Shield 来源边界落成数据种子，仍不接运行时。

Allowed files:

- `src/game/GameData.ts`
- `docs/V9_HERO12_DIVINE_SHIELD_DATA_SEED.zh-CN.md`
- `tests/v9-hero12-divine-shield-data-seed.spec.mjs`
- `tests/v9-hero12-divine-shield-source-boundary.spec.mjs`
- `docs/GLM_READY_TASK_QUEUE.md` only for closeout sync

Goal:

Add Divine Shield level data seed without runtime behavior.

Must implement and prove:

1. Extend the hero ability level data shape only as needed for Divine Shield data. Prefer additive optional fields so Holy Light data and runtime continue to compile unchanged.
2. Add `HERO_ABILITY_LEVELS.divine_shield` with exactly:
   - level 1: duration 15, cooldown 35, mana 25, requiredHeroLevel 1, range 0 or self/no-target equivalent, effect type invulnerability.
   - level 2: duration 30, cooldown 50, mana 25, requiredHeroLevel 3, range 0 or self/no-target equivalent, effect type invulnerability.
   - level 3: duration 45, cooldown 65, mana 25, requiredHeroLevel 5, range 0 or self/no-target equivalent, effect type invulnerability.
3. Preserve `HERO_ABILITY_LEVELS.holy_light` values exactly.
4. Do not add `ABILITIES.divine_shield` unless the existing type forces it; DATA1 should be a hero level data seed, not a runtime command-card seed.
5. Keep `Game.ts` untouched: no learn button, no cast button, no invulnerability state, no cooldown behavior.
6. Update the SRC1 proof only to make the old "no divine_shield in GameData" assertion stage-aware; it must still prove no runtime implementation.
7. Document explicitly that DATA1 does not make Divine Shield learnable or castable yet.

Forbidden:

- Do not edit `src/game/Game.ts`, `src/game/SimpleAI.ts`, UI/CSS, assets, runtime tests, or production runtime behavior.
- Do not run Playwright or browser/runtime tests.
- Do not implement Divine Shield command-card, learning, casting, damage prevention, visual feedback, AI usage, Devotion Aura, Resurrection, or other heroes.
- Do not change Holy Light values or HERO11 behavior.

Verification:

```bash
node --test tests/v9-hero12-divine-shield-data-seed.spec.mjs tests/v9-hero12-divine-shield-source-boundary.spec.mjs tests/v9-hero12-divine-shield-contract.spec.mjs
npm run build
npx tsc --noEmit -p tsconfig.app.json
./scripts/cleanup-local-runtime.sh
```

Closeout requirements:

- Start your final closeout with the exact line: JOB_COMPLETE: <job-id>
- If truly blocked, emit the exact line: JOB_BLOCKED: <job-id>
- Include sections for files changed, verification run, and remaining unknowns.
- End with an exact line that begins with READY_FOR_NEXT_TASK: followed by the next safe continuation.
- Keep the work within the requested scope; do not widen ownership on your own.

Acceptance:

- GLM 写出 `HERO_ABILITY_LEVELS.divine_shield` 数据种子、DATA1 文档和静态 proof 后遇到 API/network error，没有完成 closeout。
- Codex 接管时发现 GLM 初版把 `HeroAbilityLevelDef.effectValue` / `undeadDamage` 改成 optional，会弱化 Holy Light 运行时类型；已改回必填字段，并让 Divine Shield 使用 `effectValue: 0`、`undeadDamage: 0` 占位。
- DATA1 阶段只新增等级数据：duration 15/30/45、cooldown 35/50/65、mana 25、range 0、requiredHeroLevel 1/3/5、`effectType: 'invulnerability'`。
- `ABILITIES.divine_shield` 仍不存在，`Game.ts` 仍不引用 `divine_shield`，没有 learn/cast/runtime/UI/AI 行为。
- Verification accepted:
  - `node --test tests/v9-hero12-divine-shield-data-seed.spec.mjs tests/v9-hero12-divine-shield-source-boundary.spec.mjs tests/v9-hero12-divine-shield-contract.spec.mjs` -> 78/78 passed.
  - `npm run build`
  - `npx tsc --noEmit -p tsconfig.app.json`
  - `./scripts/cleanup-local-runtime.sh` plus 30 second process observation found no Playwright/Vite/chrome-headless-shell leftovers.

### Task 234 — V9 HERO12-IMPL1A Divine Shield learn surface

Status: `accepted`.

Owner: GLM-style worker + Codex takeover/review.

Priority: Task233 已接受。下一步只打开 Divine Shield 的“学习入口”，不打开施放和无敌 runtime，避免一步过大。

Allowed files:

- `src/game/Game.ts`
- `tests/v9-hero12-divine-shield-learn-runtime.spec.ts`
- `tests/v9-hero12-divine-shield-data-seed.spec.mjs`
- `tests/v9-hero12-divine-shield-source-boundary.spec.mjs`
- `docs/V9_HERO12_DIVINE_SHIELD_LEARN_SLICE.zh-CN.md`
- `docs/GLM_READY_TASK_QUEUE.md` only for closeout sync

Goal:

Make Paladin able to spend skill points to learn Divine Shield levels from `HERO_ABILITY_LEVELS.divine_shield`, while keeping casting and invulnerability closed.

Must implement and prove:

1. Paladin command card shows `学习神圣护盾 (Lv1)` when Divine Shield level is 0 and the Paladin has a skill point.
2. Clicking the learn button consumes exactly 1 skill point and sets `abilityLevels.divine_shield = 1`.
3. Level 2 is disabled before hero level 3, and level 3 is disabled before hero level 5; disabled reason must mention the required hero level.
4. At hero level 3 / 5 with skill points, clicking the learn button upgrades to level 2 / 3 and consumes exactly 1 skill point each time.
5. Learned Divine Shield level and remaining skill points persist through HERO9 death/revive, same as Holy Light.
6. Selection info or command card must show the learned Divine Shield level in plain Chinese.
7. Update existing HERO12 static proofs so they no longer require `Game.ts` to have zero `divine_shield` references after IMPL1A, but they must still prove there is no cast button, no `ABILITIES.divine_shield`, and no invulnerability/damage-prevention runtime.
8. Preserve Holy Light learning and casting behavior unchanged.

Forbidden:

- Do not implement Divine Shield casting, damage prevention, invulnerability state, buff duration ticking, cooldown behavior, visual effects, AI usage, Devotion Aura, Resurrection, other Paladin abilities, other Human heroes, items, shops, or assets.
- Do not add `ABILITIES.divine_shield` unless you can prove it remains unused by runtime casting; prefer no `ABILITIES` entry in this slice.
- Do not edit `src/game/SimpleAI.ts`, UI/CSS, assets, or unrelated docs.
- Do not weaken existing HERO7/HERO9/HERO11 behavior or tests.
- Do not run direct Playwright/Vite commands; runtime tests must go through `./scripts/run-runtime-tests.sh`.

Verification:

```bash
npm run build
./scripts/run-runtime-tests.sh tests/v9-hero12-divine-shield-learn-runtime.spec.ts tests/v9-hero11-holy-light-skill-spend-runtime.spec.ts tests/v9-hero9-revive-runtime.spec.ts --reporter=list
node --test tests/v9-hero12-divine-shield-data-seed.spec.mjs tests/v9-hero12-divine-shield-source-boundary.spec.mjs tests/v9-hero12-divine-shield-contract.spec.mjs
npx tsc --noEmit -p tsconfig.app.json
./scripts/cleanup-local-runtime.sh
```

Closeout requirements:

- Start your final closeout with the exact line: JOB_COMPLETE: <job-id>
- If truly blocked, emit the exact line: JOB_BLOCKED: <job-id>
- Include sections for files changed, verification run, and remaining unknowns.
- End with an exact line that begins with READY_FOR_NEXT_TASK: followed by the next safe continuation.
- Keep the work within the requested scope; do not widen ownership on your own.

Acceptance:

- GLM 写出学习入口主体、runtime spec 和说明文档后在 closeout 前中断，并曾用 `tail` 链式验证，不能直接作为验收证据。
- Codex 接管后补正 HERO12 静态 proof 阶段口径：允许 `Game.ts` 出现学习入口引用，但仍禁止 cast、无敌状态、冷却状态和 `ABILITIES.divine_shield` runtime。
- 运行时结果：Paladin 命令卡显示「学习神圣护盾 (LvN)」，Lv1/2/3 消费技能点并受英雄等级 1/3/5 门槛控制；HUD 显示 `神圣护盾 LvN`；死亡/复活保留 Divine Shield 等级和剩余技能点；Holy Light 学习/施放和 HERO9 复活回归不变。
- Task234 仍不实现施放按钮、无敌状态、伤害免疫、持续时间 ticking、冷却、视觉、AI 或其他技能。
- Verification accepted:
  - `npm run build`
  - `./scripts/run-runtime-tests.sh tests/v9-hero12-divine-shield-learn-runtime.spec.ts tests/v9-hero11-holy-light-skill-spend-runtime.spec.ts tests/v9-hero9-revive-runtime.spec.ts --reporter=list` -> 19/19 passed.
  - `node --test tests/v9-hero12-divine-shield-data-seed.spec.mjs tests/v9-hero12-divine-shield-source-boundary.spec.mjs tests/v9-hero12-divine-shield-contract.spec.mjs` -> 78/78 passed.
  - `npx tsc --noEmit -p tsconfig.app.json`
  - `FORCE_RUNTIME_CLEANUP=1 WAR3_RUNTIME_KILL_PLAYWRIGHT_PROCS=1 ./scripts/cleanup-local-runtime.sh`
  - Final process check found no Playwright/Vite/chrome-headless-shell/runtime leftovers; only GLM `claude` remained.

### Task 235 — V9 HERO12-IMPL1B Divine Shield self-cast runtime

Status: `accepted`.

Owner: GLM-style worker.

Priority: Task234 已接受。下一步只打开 Divine Shield 自我施放和临时无敌 runtime，不做视觉/AI/其他技能。

Allowed files:

- `src/game/Game.ts`
- `tests/v9-hero12-divine-shield-runtime.spec.ts`
- `tests/v9-hero12-divine-shield-learn-runtime.spec.ts`
- `tests/v9-hero12-divine-shield-data-seed.spec.mjs`
- `tests/v9-hero12-divine-shield-source-boundary.spec.mjs`
- `docs/V9_HERO12_DIVINE_SHIELD_RUNTIME_SLICE.zh-CN.md`
- `docs/GLM_READY_TASK_QUEUE.md` only for closeout sync

Goal:

Let a Paladin who has learned Divine Shield cast it on self, using the data from `HERO_ABILITY_LEVELS.divine_shield`.

Must implement and prove:

1. No learned Divine Shield level means no cast button and direct cast returns false.
2. Learned Lv1/Lv2/Lv3 shows a self-cast Divine Shield command-card button with data-driven mana, duration and cooldown.
3. Clicking the cast button spends exactly 25 mana, starts cooldown from the learned level, and applies a temporary invulnerable/protected state to the Paladin only.
4. While active, incoming enemy damage to the Paladin is prevented or reduced to 0; damage to other units remains unchanged.
5. After the level duration expires (15/30/45 seconds), the Paladin can take damage normally again.
6. Cooldown prevents repeated casts until the data-driven cooldown expires; mana shortage disables or rejects casting.
7. Divine Shield cannot be manually deactivated in this slice.
8. Holy Light learning/casting, HERO9 death/revive, and Task234 learn surface behavior remain unchanged.
9. Static proofs are stage-aware: they should allow the new runtime tokens, but still prove no `ABILITIES.divine_shield`, no AI usage, no Devotion Aura, no Resurrection, no other heroes, no assets, no complete hero system, no complete Human, and no V9 release claim.

Forbidden:

- Do not add visuals, particles, sound, status icon styling, AI usage, Devotion Aura, Resurrection, other Paladin skills, other Human heroes, items, shops, Tavern, assets, second race, air, or multiplayer.
- Do not add `ABILITIES.divine_shield`; HERO12 still reads from `HERO_ABILITY_LEVELS.divine_shield`.
- Do not edit `src/game/SimpleAI.ts`, CSS, assets, unrelated docs, or broad balance values.
- Do not weaken HERO7/HERO9/HERO11/HERO12 learn proofs.
- Do not run direct Playwright/Vite commands; runtime tests must go through `./scripts/run-runtime-tests.sh`.

Verification:

```bash
npm run build
./scripts/run-runtime-tests.sh tests/v9-hero12-divine-shield-runtime.spec.ts tests/v9-hero12-divine-shield-learn-runtime.spec.ts tests/v9-hero11-holy-light-skill-spend-runtime.spec.ts tests/v9-hero9-revive-runtime.spec.ts --reporter=list
node --test tests/v9-hero12-divine-shield-data-seed.spec.mjs tests/v9-hero12-divine-shield-source-boundary.spec.mjs tests/v9-hero12-divine-shield-contract.spec.mjs
npx tsc --noEmit -p tsconfig.app.json
./scripts/cleanup-local-runtime.sh
```

Closeout requirements:

- Start your final closeout with the exact line: JOB_COMPLETE: <job-id>
- If truly blocked, emit the exact line: JOB_BLOCKED: <job-id>
- Include sections for files changed, verification run, and remaining unknowns.
- End with an exact line that begins with READY_FOR_NEXT_TASK: followed by the next safe continuation.
- Keep the work within the requested scope; do not widen ownership on your own.

Accepted closeout:

- GLM 写出主体实现、runtime spec 和运行时文档后停在验证阶段；Codex 接管并取消 companion job `glm-mo1bcda8-d8os6d`，避免继续重复跑单文件 Playwright。
- Codex 修复命令卡缓存，使护盾生效/冷却剩余时间会随 `gameTime` 刷新，而不是停在第一次施放后的按钮状态。
- Codex 修正 `CS-8` 测试：先选中 Paladin 再验证 Holy Light 学习/施放和 Divine Shield 学习入口。
- Verification accepted:
  - `npm run build`
  - `./scripts/run-runtime-tests.sh tests/v9-hero12-divine-shield-runtime.spec.ts tests/v9-hero12-divine-shield-learn-runtime.spec.ts tests/v9-hero11-holy-light-skill-spend-runtime.spec.ts tests/v9-hero9-revive-runtime.spec.ts --reporter=list` -> 29/29 passed.
  - `node --test tests/v9-hero12-divine-shield-data-seed.spec.mjs tests/v9-hero12-divine-shield-source-boundary.spec.mjs tests/v9-hero12-divine-shield-contract.spec.mjs` -> 78/78 passed.
  - `npx tsc --noEmit -p tsconfig.app.json`
  - `./scripts/cleanup-local-runtime.sh` plus forced cleanup after stale GLM duplicate runner; final process check found no Playwright/Vite/chrome-headless-shell/runtime leftovers.

### Task 236 — V9 HERO12-UX1 Divine Shield visible active/cooldown feedback

Status: `accepted`.

Owner: GLM-style worker + Codex review.

Priority: Task235 已接受。玩家现在能施放 Divine Shield，但反馈主要藏在命令按钮禁用原因里；下一步只补清楚、可测试的状态反馈，不做特效扩张。

Allowed files:

- `src/game/Game.ts`
- `tests/v9-hero12-divine-shield-visible-feedback.spec.ts`
- `tests/v9-hero12-divine-shield-runtime.spec.ts` only if a regression assertion must be tightened
- `docs/V9_HERO12_DIVINE_SHIELD_VISIBLE_FEEDBACK.zh-CN.md`
- `docs/GLM_READY_TASK_QUEUE.md` only for closeout sync

Goal:

Make Divine Shield's active state and cooldown readable to the player after casting.

Must implement and prove:

1. When Divine Shield is active, selecting the Paladin shows an explicit active-state text with remaining seconds.
2. While active, the cast button is disabled with a readable "生效中" reason and the remaining time updates as time advances.
3. After active duration expires but cooldown remains, the cast button stays disabled with a readable cooldown reason and remaining seconds update.
4. After cooldown expires and mana is sufficient, the cast button becomes enabled again without requiring deselect/reselect.
5. Mana shortage remains a separate readable reason and does not overwrite active/cooldown priority.
6. Holy Light learned feedback, HERO12 self-cast runtime, and HERO9 revive behavior remain unchanged.

Forbidden:

- Do not add particles, sound, new CSS effect systems, AI usage, Devotion Aura, Resurrection, other Paladin skills, other heroes, items, assets, second race, air, multiplayer, or `ABILITIES.divine_shield`.
- Do not edit `src/game/SimpleAI.ts`, `GameData.ts`, CSS, assets, or broad balance values.
- Do not run direct Playwright/Vite commands; runtime tests must go through `./scripts/run-runtime-tests.sh`.

Verification:

```bash
npm run build
./scripts/run-runtime-tests.sh tests/v9-hero12-divine-shield-visible-feedback.spec.ts tests/v9-hero12-divine-shield-runtime.spec.ts tests/v9-hero12-divine-shield-learn-runtime.spec.ts --reporter=list
node --test tests/v9-hero12-divine-shield-data-seed.spec.mjs tests/v9-hero12-divine-shield-source-boundary.spec.mjs tests/v9-hero12-divine-shield-contract.spec.mjs
npx tsc --noEmit -p tsconfig.app.json
./scripts/cleanup-local-runtime.sh
```

Closeout requirements:

- Start your final closeout with the exact line: JOB_COMPLETE: <job-id>
- If truly blocked, emit the exact line: JOB_BLOCKED: <job-id>
- Include sections for files changed, verification run, and remaining unknowns.
- End with an exact line that begins with READY_FOR_NEXT_TASK: followed by the next safe continuation.
- Keep the work within the requested scope; do not widen ownership on your own.

Accepted closeout:

- GLM 写出主体实现、runtime spec 和文档后停在截断 build 验证阶段；Codex 取消 companion job `glm-mo1cas0e-dclk0x` 后接管复核。
- Codex 修正两处测试错误：`VF-4` 必须先选中 Paladin 后才验证不重选刷新；`VF-6` 必须先设置 `divine_shield = 1` 才能断言自我施放。
- Codex 将 HUD 活跃文本收敛为纯文字 `神圣护盾生效 Ns`，避免把新增 emoji 当作状态图标。
- Verification accepted:
  - `npm run build`
  - `./scripts/run-runtime-tests.sh tests/v9-hero12-divine-shield-visible-feedback.spec.ts tests/v9-hero12-divine-shield-runtime.spec.ts tests/v9-hero12-divine-shield-learn-runtime.spec.ts --reporter=list` -> 22/22 passed.
  - `node --test tests/v9-hero12-divine-shield-data-seed.spec.mjs tests/v9-hero12-divine-shield-source-boundary.spec.mjs tests/v9-hero12-divine-shield-contract.spec.mjs` -> 78/78 passed.
  - `npx tsc --noEmit -p tsconfig.app.json`
  - `./scripts/cleanup-local-runtime.sh`; final process check found no Playwright/Vite/chrome-headless-shell/runtime leftovers.

### Task 237 — V9 HERO12-CLOSE1 Divine Shield branch closure inventory

Status: `accepted`.

Owner: GLM-style worker + Codex review.

Priority: Task236 已接受。HERO12 Divine Shield 已完成合同、来源、数据、学习、自我施放和可见反馈，下一步只做静态收口盘点，防止继续无限扩张。

Allowed files:

- `docs/V9_HERO12_DIVINE_SHIELD_CLOSURE.zh-CN.md`
- `tests/v9-hero12-divine-shield-closure.spec.mjs`
- `docs/GLM_READY_TASK_QUEUE.md` only for closeout sync

Goal:

Close the HERO12 Divine Shield branch by proving exactly what is now complete and exactly what remains out of scope.

Must implement and prove:

1. Closure doc references HERO12 contract, source boundary, data seed, learn surface, self-cast runtime, and visible feedback.
2. Closure doc lists the accepted proof files and verification commands for each slice.
3. Closure doc states what the player can now do: learn Divine Shield, cast it on self, see active/cooldown feedback, avoid damage while active, and recover normal vulnerability after expiry.
4. Closure doc explicitly denies Devotion Aura, Resurrection, other Paladin skills, other Human heroes, AI hero strategy, items, shops, Tavern, assets, second race, air, multiplayer, complete hero system, complete Human, and V9 release.
5. Static proof reads docs and source files, but must not modify production code or run Playwright.
6. Existing HERO12 contract/source/data proofs remain valid.

Forbidden:

- Do not edit `src/game/Game.ts`, `src/game/GameData.ts`, `src/game/SimpleAI.ts`, CSS, assets, runtime tests, or production code.
- Do not run Playwright/runtime tests for this closure task.
- Do not claim complete hero system, complete Human, or V9 release.

Verification:

```bash
node --test tests/v9-hero12-divine-shield-closure.spec.mjs tests/v9-hero12-divine-shield-data-seed.spec.mjs tests/v9-hero12-divine-shield-source-boundary.spec.mjs tests/v9-hero12-divine-shield-contract.spec.mjs
npm run build
npx tsc --noEmit -p tsconfig.app.json
./scripts/cleanup-local-runtime.sh
```

Closeout requirements:

- Start your final closeout with the exact line: JOB_COMPLETE: <job-id>
- If truly blocked, emit the exact line: JOB_BLOCKED: <job-id>
- Include sections for files changed, verification run, and remaining unknowns.
- End with an exact line that begins with READY_FOR_NEXT_TASK: followed by the next safe continuation.
- Keep the work within the requested scope; do not widen ownership on your own.

Accepted closeout:

- GLM 写出 closure 文档和静态 proof 后，在修复 `fileURLToPath` 导入后停在 prompt，没有提交 closeout；Codex 取消 companion job `glm-mo1csw9d-wego74` 后接管复核。
- Codex 修正文档标题为“分支收口盘点”，并把可见反馈口径对齐当前真实 UI：选择面板显示 `神圣护盾生效 Ns`，命令卡显示生效中/冷却中/魔力不足。
- Codex 加硬 closure proof：禁区项必须出现在“明确延后”段落，完整英雄系统/完整人族/V9 发布必须同时在延后段落和合同声明中被否认。
- Verification accepted:
  - `node --test tests/v9-hero12-divine-shield-closure.spec.mjs tests/v9-hero12-divine-shield-data-seed.spec.mjs tests/v9-hero12-divine-shield-source-boundary.spec.mjs tests/v9-hero12-divine-shield-contract.spec.mjs` -> 113/113 passed.
  - `npm run build`
  - `npx tsc --noEmit -p tsconfig.app.json`
  - `./scripts/cleanup-local-runtime.sh`; final process check found no Playwright/Vite/chrome-headless-shell/runtime leftovers.

### Task 238 — V9 HERO13-CONTRACT1 Paladin Devotion Aura branch contract

Status: `accepted`.

Owner: GLM-style worker + Codex review.

Priority: HERO12 Divine Shield 分支已收口。Paladin 仍缺 Devotion Aura 和 Resurrection；Devotion Aura 是下一个相邻、低风险的 Paladin 能力，但必须先合同化，不能直接写运行时。

Allowed files:

- `docs/V9_HERO13_DEVOTION_AURA_CONTRACT.zh-CN.md`
- `tests/v9-hero13-devotion-aura-contract.spec.mjs`
- `docs/GLM_READY_TASK_QUEUE.md` only for closeout sync

Goal:

Define the Paladin Devotion Aura branch contract without changing production code, data seeds, runtime behavior, UI, assets, AI, or other heroes.

Must implement and prove:

1. Contract references the accepted Paladin baseline: HERO9 death/revive, HERO10 XP/leveling, HERO11 Holy Light learning, and HERO12 Divine Shield closure.
2. Contract defines the safe branch order: HERO13-SRC1 source boundary, HERO13-DATA1 data seed, HERO13-IMPL1 minimal passive aura runtime, HERO13-UX1 visible feedback, HERO13-CLOSE1 branch closure.
3. Contract states Devotion Aura as a passive Paladin aura at contract level: no mana cost, no cooldown, no command-button cast, friendly nearby armor bonus, aura ends when the source is dead or out of range.
4. Contract says exact armor bonus values, radius, stacking behavior, and affected target set must come from HERO13-SRC1 before data/runtime work.
5. Runtime proof obligations are listed for future IMPL1: source Paladin alive/dead, friendly-in-range affected, friendly-out-of-range unaffected, enemy unaffected, no permanent armor mutation, no stacking abuse, Holy Light/Divine Shield unaffected.
6. Contract explicitly denies Resurrection, other Paladin skills, Archmage/Mountain King/Blood Mage, AI hero strategy, items, shops, Tavern, assets, second race, air, multiplayer, complete hero system, complete Human, and V9 release.
7. Static proof reads only docs and source text as needed; it must not modify production code or run Playwright.

Forbidden:

- Do not edit `src/game/Game.ts`, `src/game/GameData.ts`, `src/game/SimpleAI.ts`, CSS, assets, runtime tests, or production code.
- Do not add `ABILITIES.devotion_aura`, `HERO_ABILITY_LEVELS.devotion_aura`, armor runtime, aura runtime, command-card buttons, status icons, particles, or sounds.
- Do not run Playwright/runtime tests for this contract task.
- Do not claim complete Paladin, complete hero system, complete Human, or V9 release.

Verification:

```bash
node --test tests/v9-hero13-devotion-aura-contract.spec.mjs tests/v9-hero12-divine-shield-closure.spec.mjs
npm run build
npx tsc --noEmit -p tsconfig.app.json
./scripts/cleanup-local-runtime.sh
```

Closeout requirements:

- Start your final closeout with the exact line: JOB_COMPLETE: <job-id>
- If truly blocked, emit the exact line: JOB_BLOCKED: <job-id>
- Include sections for files changed, verification run, and remaining unknowns.
- End with an exact line that begins with READY_FOR_NEXT_TASK: followed by the next safe continuation.
- Keep the work within the requested scope; do not widen ownership on your own.

Accepted closeout:

- GLM 写出 HERO13 contract 文档和静态 proof，并自行修正一次顺序 proof 失败；closeout 显示 static 71/71、build、tsc、cleanup 通过。
- Codex 本地复核时收窄合同：受影响目标集合和多来源叠加规则必须等 HERO13-SRC1 确认，合同不能提前写死“非建筑单位”或未来多 Paladin 口径。
- Codex 加硬 proof：关键能力定义必须在能力定义段落中出现；禁区必须出现在“明确延后”段落；完整英雄系统/完整人族/V9 发布必须在延后段落和合同声明中都被否认；生产代码仍无 `devotion_aura`。
- Verification accepted:
  - `node --test tests/v9-hero13-devotion-aura-contract.spec.mjs tests/v9-hero12-divine-shield-closure.spec.mjs` -> 72/72 passed.
  - `node --test tests/lane-feed.spec.mjs` -> 66/66 passed for the table-missing dispatch repair made during this handoff.
  - `npm run build`
  - `npx tsc --noEmit -p tsconfig.app.json`

### Task 239 — V9 HERO13-SRC1 Devotion Aura source boundary

Status: `accepted`.

Owner: GLM-style worker + Codex review.

Priority: Task238 contract 已 accepted。下一步必须先做 Devotion Aura 来源边界，确认数值、目标、半径和叠加口径；不能直接写数据或运行时。

Allowed files:

- `docs/V9_HERO13_DEVOTION_AURA_SOURCE_BOUNDARY.zh-CN.md`
- `tests/v9-hero13-devotion-aura-source-boundary.spec.mjs`
- `docs/GLM_READY_TASK_QUEUE.md` only for closeout sync

Goal:

Bind Devotion Aura source truth and project mapping for a later data/runtime slice, without changing production code.

Primary source to use:

- Blizzard Classic Battle.net Paladin page: `https://classic.battle.net/war3/human/units/paladin.shtml#paladin-devotion`

Must implement and prove:

1. Source boundary doc references Task238 / HERO13-CONTRACT1 and the accepted Paladin baseline.
2. Source hierarchy uses Blizzard Classic Battle.net as the primary source; any secondary source is only a cross-check and cannot override the primary source in this task.
3. Source boundary records Devotion Aura as passive: duration unlimited, cooldown N/A, mana none, range N/A, no command-card cast.
4. Source boundary records levels 1/2/3: armor bonus +1.5/+3/+4.5, area of effect 90, allowed targets Air / Ground / Friend / Self, hero level requirements 1/3/5.
5. Project mapping explicitly states how source `Area of Effect 90` maps into project scale for later runtime; do not edit runtime yet.
6. Source boundary states affected target set and stacking behavior are source-bound decisions; do not invent building, item, AI, or multi-hero semantics beyond source text.
7. Static proof confirms `GameData.ts` and `Game.ts` still have no `devotion_aura`, `ABILITIES.devotion_aura`, `HERO_ABILITY_LEVELS.devotion_aura`, or aura runtime references.
8. Contract proof remains valid.

Forbidden:

- Do not edit `src/game/Game.ts`, `src/game/GameData.ts`, `src/game/SimpleAI.ts`, CSS, assets, runtime tests, or production code.
- Do not add Devotion Aura data, runtime, command-card buttons, status icons, particles, sounds, AI behavior, Resurrection, other heroes, items, shops, Tavern, second race, air systems, or multiplayer.
- Do not run Playwright/runtime tests for this source-boundary task.
- Do not claim complete Paladin, complete hero system, complete Human, or V9 release.

Verification:

```bash
node --test tests/v9-hero13-devotion-aura-source-boundary.spec.mjs tests/v9-hero13-devotion-aura-contract.spec.mjs tests/v9-hero12-divine-shield-closure.spec.mjs
npm run build
npx tsc --noEmit -p tsconfig.app.json
./scripts/cleanup-local-runtime.sh
```

Closeout requirements:

- Start your final closeout with the exact line: JOB_COMPLETE: <job-id>
- If truly blocked, emit the exact line: JOB_BLOCKED: <job-id>
- Include sections for files changed, verification run, and remaining unknowns.
- End with an exact line that begins with READY_FOR_NEXT_TASK: followed by the next safe continuation.
- Keep the work within the requested scope; do not widen ownership on your own.

Accepted closeout:

- GLM 写出 source-boundary 文档和 proof 后，第一次联合 proof 失败并停在 prompt；Codex 取消 companion job `glm-mo1ebzwj-ihn2yr` 后接管。
- Codex 修正来源边界：沿用 HERO2/HERO11 的 `80 War3 单位 → 8.0 项目格`，把 Devotion Aura `Area of Effect 90` 明确映射为 `auraRadius: 9.0`，避免留到 IMPL1 再拍板。
- Codex 收窄目标/叠加边界：当前项目无空军时只映射友方地面单位和 Paladin 自身；主来源未列 Buildings / Structures，后续不得把建筑加入受影响目标；多来源叠加规则未定，不得外推多个 Paladin 独立叠加。
- Verification accepted:
  - `node --test tests/v9-hero13-devotion-aura-source-boundary.spec.mjs tests/v9-hero13-devotion-aura-contract.spec.mjs tests/v9-hero12-divine-shield-closure.spec.mjs` -> 102/102 passed.
  - `npm run build`
  - `npx tsc --noEmit -p tsconfig.app.json`

### Task 240 — V9 HERO13-DATA1 Devotion Aura data seed

Status: `accepted`.

Owner: GLM-style worker + Codex review.

Priority: Task239 source boundary 已 accepted。下一步只允许落 Devotion Aura 等级数据种子，仍禁止运行时、命令卡、HUD、AI、视觉和 Resurrection。

Allowed files:

- `src/game/GameData.ts`
- `docs/V9_HERO13_DEVOTION_AURA_DATA_SEED.zh-CN.md`
- `tests/v9-hero13-devotion-aura-data-seed.spec.mjs`
- `docs/GLM_READY_TASK_QUEUE.md` only for closeout sync

Goal:

Add Devotion Aura level data to `HERO_ABILITY_LEVELS` and prove it remains data-only.

Must implement and prove:

1. Extend `HeroAbilityLevelDef` only as narrowly as needed for a passive armor aura data seed. Prefer optional fields so Holy Light and Divine Shield stay valid.
2. Add `HERO_ABILITY_LEVELS.devotion_aura` with maxLevel 3.
3. Levels must reflect Task239 source boundary: armor bonus +1.5/+3/+4.5, `auraRadius: 9.0`, mana 0, cooldown 0, range 0 or passive marker, required hero levels 1/3/5, passive / armor aura effect marker.
4. Data seed must preserve existing Holy Light and Divine Shield entries and not move their semantics into `ABILITIES`.
5. `Game.ts` must not consume Devotion Aura yet; no runtime aura behavior, no command-card button, no HUD feedback, no armor mutation.
6. Static proof reads `GameData.ts`, `Game.ts`, Task238 contract and Task239 source-boundary docs.
7. Contract/source proofs remain valid.

Forbidden:

- Do not edit `src/game/Game.ts`, `src/game/SimpleAI.ts`, CSS, assets, runtime tests, or UI files.
- Do not add `ABILITIES.devotion_aura`.
- Do not add runtime aura application, command-card buttons, status icons, particles, sounds, AI behavior, Resurrection, other heroes, buildings target expansion, air systems, items, shops, Tavern, second race, or multiplayer.
- Do not run Playwright/runtime tests for this data-seed task.
- Do not claim complete Paladin, complete hero system, complete Human, or V9 release.

Verification:

```bash
node --test tests/v9-hero13-devotion-aura-data-seed.spec.mjs tests/v9-hero13-devotion-aura-source-boundary.spec.mjs tests/v9-hero13-devotion-aura-contract.spec.mjs tests/v9-hero12-divine-shield-closure.spec.mjs
npm run build
npx tsc --noEmit -p tsconfig.app.json
./scripts/cleanup-local-runtime.sh
```

Closeout requirements:

- Start your final closeout with the exact line: JOB_COMPLETE: <job-id>
- If truly blocked, emit the exact line: JOB_BLOCKED: <job-id>
- Include sections for files changed, verification run, and remaining unknowns.
- End with an exact line that begins with READY_FOR_NEXT_TASK: followed by the next safe continuation.
- Keep the work within the requested scope; do not widen ownership on your own.

Accepted closeout:

- GLM 写入 `HeroAbilityLevelDef.auraRadius?` / `armorBonus?` 和 `HERO_ABILITY_LEVELS.devotion_aura` 三等级数据，并补 DATA1 文档与静态 proof。
- Codex 本地复核时修正文档 typo，把 `Devotion Shield` 改回 `Devotion Aura`；并把 `auraRadius: 9.0` 明确绑定到 Task239 已接受映射 `Area of Effect 90 → 项目半径 9.0`，不再让 IMPL1 重新拍板。
- Codex 加固 DATA1 proof：只在 `devotion_aura` 数据块内检查等级、护甲、半径、mana、cooldown 和学习等级；只在 `ABILITIES` 数据块内证明未添加 `ABILITIES.devotion_aura`；继续证明 `Game.ts` 未消费 Devotion Aura。
- Verification accepted:
  - `node --test tests/v9-hero13-devotion-aura-data-seed.spec.mjs tests/v9-hero13-devotion-aura-source-boundary.spec.mjs tests/v9-hero13-devotion-aura-contract.spec.mjs tests/v9-hero12-divine-shield-closure.spec.mjs` -> 119/119 passed.
  - `npm run build`
  - `npx tsc --noEmit -p tsconfig.app.json`
  - `./scripts/cleanup-local-runtime.sh`

### Task 241 — V9 HERO13-IMPL1 Devotion Aura minimal passive aura runtime

Status: `accepted`.

Owner: GLM-style worker.

Priority: Task240 data seed 已 accepted。下一步只允许把 Devotion Aura 接成最小被动护甲光环 runtime，仍不做按钮、HUD、特效、AI、建筑目标、空军或其他英雄。

Allowed files:

- `src/game/Game.ts`
- `docs/V9_HERO13_DEVOTION_AURA_RUNTIME_SLICE.zh-CN.md`
- `tests/v9-hero13-devotion-aura-runtime.spec.ts`
- `docs/GLM_READY_TASK_QUEUE.md` only for closeout sync

Goal:

Implement a minimal passive Devotion Aura armor runtime that reads `HERO_ABILITY_LEVELS.devotion_aura`.

Must implement and prove:

1. A living Paladin with learned Devotion Aura grants the level's `armorBonus` to himself and friendly in-range ground units within `auraRadius: 9.0`.
2. Enemy units are unaffected.
3. Buildings are unaffected.
4. Leaving the radius removes the bonus; entering the radius grants it.
5. Paladin death stops the aura; revive can restore aura behavior only after the Paladin is alive again and still has the learned level.
6. Armor changes must be temporary runtime modifiers. Do not permanently mutate base armor or stack the same source repeatedly across ticks.
7. If a friendly unit already has research armor bonuses, Devotion Aura must add temporarily on top and then restore to the correct non-aura value after leaving range.
8. Holy Light, Divine Shield, XP / revive basics must not regress in the focused proof set.
9. Runtime doc must state this is a minimal passive runtime slice only, not complete Paladin, complete hero system, complete Human, or V9 release.

Forbidden:

- Do not add a command-card button for Devotion Aura.
- Do not add HUD/status text, particles, sounds, icons, CSS, assets, or UI copy.
- Do not edit `src/game/SimpleAI.ts`.
- Do not affect buildings, enemies, neutral units, air units, second race, items, shops, Tavern, Resurrection, or other heroes.
- Do not add `ABILITIES.devotion_aura`.
- Do not invent multiple-Paladin independent stacking semantics; same source must not stack across ticks.
- Do not claim complete Paladin, complete hero system, complete Human, or V9 release.

Verification:

```bash
npm run build
./scripts/run-runtime-tests.sh tests/v9-hero13-devotion-aura-runtime.spec.ts tests/v9-hero12-divine-shield-runtime.spec.ts tests/v9-hero11-holy-light-skill-spend-runtime.spec.ts tests/v9-hero9-revive-runtime.spec.ts --reporter=list
node --test tests/v9-hero13-devotion-aura-data-seed.spec.mjs tests/v9-hero13-devotion-aura-source-boundary.spec.mjs tests/v9-hero13-devotion-aura-contract.spec.mjs tests/v9-hero12-divine-shield-closure.spec.mjs
npx tsc --noEmit -p tsconfig.app.json
./scripts/cleanup-local-runtime.sh
```

Closeout requirements:

- Start your final closeout with the exact line: JOB_COMPLETE: <job-id>
- If truly blocked, emit the exact line: JOB_BLOCKED: <job-id>
- Include sections for files changed, verification run, and remaining unknowns.
- End with an exact line that begins with READY_FOR_NEXT_TASK: followed by the next safe continuation.
- Keep the work within the requested scope; do not widen ownership on your own.

Accepted closeout:

- GLM job `glm-mo1ewk9s-dbt39q` 被取消：它在 Task241 明确禁止按钮/HUD 的情况下，开始添加“学习虔诚光环”命令卡按钮和 HUD 文案。
- Codex 接管并移除越界 UI/HUD 改动，只保留并修正最小被动 runtime。
- `Game.ts` 现在每 tick 先移除旧 Devotion Aura 临时护甲，再按活着的 Paladin 和 `HERO_ABILITY_LEVELS.devotion_aura` 重新应用。
- 当前 runtime 覆盖：Paladin 自身、友方范围内非建筑单位、离开/进入范围、死亡/复活、研究护甲叠加恢复、敌人和建筑不受影响、同来源不跨 tick 叠加。
- 当前仍无学习入口、施法按钮、HUD、特效、AI、建筑目标、空军或其他英雄。
- Verification accepted:
  - `node --test tests/v9-hero13-devotion-aura-data-seed.spec.mjs tests/v9-hero13-devotion-aura-source-boundary.spec.mjs tests/v9-hero13-devotion-aura-contract.spec.mjs tests/v9-hero12-divine-shield-closure.spec.mjs` -> 119/119 passed.
  - `npm run build`
  - `./scripts/run-runtime-tests.sh tests/v9-hero13-devotion-aura-runtime.spec.ts --reporter=list` -> 5/5 passed.
  - `./scripts/run-runtime-tests.sh tests/v9-hero12-divine-shield-runtime.spec.ts tests/v9-hero11-holy-light-skill-spend-runtime.spec.ts tests/v9-hero9-revive-runtime.spec.ts --reporter=list` -> 23/23 passed.
  - `npx tsc --noEmit -p tsconfig.app.json`
  - `./scripts/cleanup-local-runtime.sh`

### Task 242 — V9 HERO13-IMPL2 Devotion Aura learn surface

Status: `accepted`.

Owner: GLM-style worker.

Priority: Task241 已 accepted，但玩家还没有办法在正常命令卡中学习 Devotion Aura。下一步只补学习入口，让已存在的被动 runtime 能通过玩家操作触发。

Allowed files:

- `src/game/Game.ts`
- `docs/V9_HERO13_DEVOTION_AURA_LEARN_SLICE.zh-CN.md`
- `tests/v9-hero13-devotion-aura-learn-runtime.spec.ts`
- `tests/v9-hero13-devotion-aura-runtime.spec.ts` only if needed for adjacent proof updates
- `docs/GLM_READY_TASK_QUEUE.md` only for closeout sync

Goal:

Add a Paladin command-card learn entry for Devotion Aura Lv1/Lv2/Lv3 that consumes hero skill points and activates the existing passive runtime.

Must implement and prove:

1. A new Paladin with 1 skill point shows a learn Devotion Aura entry.
2. Learning Lv1 consumes exactly 1 skill point and sets `abilityLevels.devotion_aura = 1`.
3. After learning Lv1, the existing passive runtime grants Lv1 armor bonus without requiring a cast button.
4. Lv2 cannot be learned before Paladin level 3; Lv3 cannot be learned before Paladin level 5.
5. At valid hero levels, learning Lv2/Lv3 consumes skill points and upgrades the passive armor bonus to +3/+4.5.
6. Learned Devotion Aura level and remaining skill points persist through HERO9 death/revive.
7. Command card must not show any Devotion Aura cast button; this is passive only.
8. No HUD/status text, particles, sound, CSS, assets, AI, building targets, air targets, Resurrection, other heroes, items, shops, Tavern, second race, multiplayer, complete Paladin, complete hero system, complete Human, or V9 release claims.

Forbidden:

- Do not add a Devotion Aura cast button.
- Do not add HUD/status text, particles, sounds, icons, CSS, assets, or AI behavior.
- Do not edit `src/game/SimpleAI.ts`.
- Do not add `ABILITIES.devotion_aura`.
- Do not change Devotion Aura source values, `auraRadius: 9.0`, or `armorBonus` values.
- Do not change Holy Light, Divine Shield, HERO9 revive, XP rules, or research systems except where a focused regression proves unchanged.
- Do not affect buildings, enemies, neutral units, air units, second race, items, shops, Tavern, Resurrection, or other heroes.
- Do not claim complete Paladin, complete hero system, complete Human, or V9 release.

Verification:

```bash
npm run build
./scripts/run-runtime-tests.sh tests/v9-hero13-devotion-aura-learn-runtime.spec.ts tests/v9-hero13-devotion-aura-runtime.spec.ts tests/v9-hero11-holy-light-skill-spend-runtime.spec.ts tests/v9-hero12-divine-shield-runtime.spec.ts tests/v9-hero9-revive-runtime.spec.ts --reporter=list
node --test tests/v9-hero13-devotion-aura-data-seed.spec.mjs tests/v9-hero13-devotion-aura-source-boundary.spec.mjs tests/v9-hero13-devotion-aura-contract.spec.mjs tests/v9-hero12-divine-shield-closure.spec.mjs
npx tsc --noEmit -p tsconfig.app.json
./scripts/cleanup-local-runtime.sh
```

Closeout requirements:

- Start your final closeout with the exact line: JOB_COMPLETE: <job-id>
- If truly blocked, emit the exact line: JOB_BLOCKED: <job-id>
- Include sections for files changed, verification run, and remaining unknowns.
- End with an exact line that begins with READY_FOR_NEXT_TASK: followed by the next safe continuation.
- Keep the work within the requested scope; do not widen ownership on your own.

Accepted closeout:

- GLM job `glm-mo1fpzfz-obc6xf` was cancelled after it widened Task242 into HUD/status text. A later GLM closeout for the same slice was incomplete because it only observed partial runtime output and left remaining unknowns.
- Codex removed the premature HUD/status text and kept the learn surface only.
- `Game.ts` now exposes `学习虔诚光环 (LvN)` on Paladin command card, consumes hero skill points, enforces required hero levels 1/3/5, and activates the existing passive Devotion Aura runtime without a cast button.
- Learned Devotion Aura level and remaining skill points persist through HERO9 death/revive.
- Current slice still has no Devotion Aura cast button, no HUD/status text, no particles/sounds/icons/CSS/assets, no AI, no building/air expansion, no Resurrection, no other heroes, and no V9 release claim.
- Verification accepted:
  - `node --test tests/v9-hero13-devotion-aura-data-seed.spec.mjs tests/v9-hero13-devotion-aura-source-boundary.spec.mjs tests/v9-hero13-devotion-aura-contract.spec.mjs tests/v9-hero12-divine-shield-closure.spec.mjs` -> 119/119 passed.
  - `npm run build`
  - `./scripts/run-runtime-tests.sh tests/v9-hero13-devotion-aura-learn-runtime.spec.ts tests/v9-hero13-devotion-aura-runtime.spec.ts --reporter=list` -> 9/9 passed.
  - `./scripts/run-runtime-tests.sh tests/v9-hero11-holy-light-skill-spend-runtime.spec.ts tests/v9-hero12-divine-shield-runtime.spec.ts tests/v9-hero9-revive-runtime.spec.ts --reporter=list` -> 23/23 passed.
  - `npx tsc --noEmit -p tsconfig.app.json`
  - `FORCE_RUNTIME_CLEANUP=1 ./scripts/cleanup-local-runtime.sh`

### Task 243 — V9 HERO13-UX1 Devotion Aura visible feedback

Status: `accepted`.

Owner: GLM-style worker.

Priority: Task242 已 accepted。玩家现在能学习 Devotion Aura，也能实际获得被动护甲光环；下一步只补“看得懂”的反馈，让玩家知道 Paladin 学了几级、友方单位当前是否正在吃到光环。

Allowed files:

- `src/game/Game.ts`
- `docs/V9_HERO13_DEVOTION_AURA_VISIBLE_FEEDBACK.zh-CN.md`
- `tests/v9-hero13-devotion-aura-visible-feedback.spec.ts`
- `tests/v9-hero13-devotion-aura-learn-runtime.spec.ts` only if adjacent proof update is required
- `tests/v9-hero13-devotion-aura-runtime.spec.ts` only if adjacent proof update is required
- `tests/v9-hero13-devotion-aura-data-seed.spec.mjs` only if stage-aware static proof update is required
- `tests/v9-hero13-devotion-aura-source-boundary.spec.mjs` only if stage-aware static proof update is required
- `tests/v9-hero13-devotion-aura-contract.spec.mjs` only if stage-aware static proof update is required
- `docs/V9_HERO13_DEVOTION_AURA_CONTRACT.zh-CN.md` only if task-order wording must be aligned
- `docs/GLM_READY_TASK_QUEUE.md` only for closeout sync

Goal:

Add visible feedback for learned Devotion Aura and active aura benefit without adding any cast action.

Must implement and prove:

1. Selected Paladin with learned Devotion Aura shows the learned level in unit stats/HUD, for example `虔诚光环 Lv1/Lv2/Lv3`.
2. Selected friendly non-building unit currently receiving the aura shows an aura armor bonus line, for example `虔诚光环 +1.5 护甲`.
3. The friendly unit's aura bonus text disappears after the unit leaves `auraRadius: 9.0` or after the source Paladin dies.
4. Enemy units and buildings do not show friendly Devotion Aura applied state.
5. The command card still has learn buttons when eligible, but never has a Devotion Aura cast button.
6. Holy Light, Divine Shield, HERO9 revive, HERO10 XP/skill points, and the Task241/242 Devotion Aura behavior remain intact.
7. Static proofs become stage-aware for UX1: HUD/status text is now allowed only as passive feedback, while `castDevotionAura` and `ABILITIES.devotion_aura` remain forbidden.

Forbidden:

- Do not add a Devotion Aura cast button.
- Do not add particles, sounds, icon systems, CSS animation/effects, assets, or AI behavior.
- Do not edit `src/game/SimpleAI.ts`.
- Do not add `ABILITIES.devotion_aura`.
- Do not change Devotion Aura source values, `auraRadius: 9.0`, `armorBonus` values, skill-point costs, or required hero levels.
- Do not expand Devotion Aura to buildings, enemies, neutral units, air units, second race, items, shops, Tavern, Resurrection, or other heroes.
- Do not claim complete Paladin, complete hero system, complete Human, or V9 release.
- Do not run direct Playwright/Vite commands; use `./scripts/run-runtime-tests.sh` only.

Verification:

```bash
npm run build
./scripts/run-runtime-tests.sh tests/v9-hero13-devotion-aura-visible-feedback.spec.ts tests/v9-hero13-devotion-aura-learn-runtime.spec.ts tests/v9-hero13-devotion-aura-runtime.spec.ts --reporter=list
node --test tests/v9-hero13-devotion-aura-data-seed.spec.mjs tests/v9-hero13-devotion-aura-source-boundary.spec.mjs tests/v9-hero13-devotion-aura-contract.spec.mjs tests/v9-hero12-divine-shield-closure.spec.mjs
npx tsc --noEmit -p tsconfig.app.json
./scripts/cleanup-local-runtime.sh
```

Closeout requirements:

- Start your final closeout with the exact line: JOB_COMPLETE: <job-id>
- If truly blocked, emit the exact line: JOB_BLOCKED: <job-id>
- Include sections for files changed, verification run, and remaining unknowns.
- End with an exact line that begins with READY_FOR_NEXT_TASK: followed by the next safe continuation.
- Keep the work within the requested scope; do not widen ownership on your own.

Accepted closeout:

- GLM job `glm-mo1gf5dk-1oomyz` entered auto-compaction and then ran runtime through a truncated `tail -30` command. Codex cancelled it, cleaned residual runtime processes, kept the useful partial patch, and finished verification locally.
- `Game.ts` now shows `虔诚光环 LvN` for selected Paladin after Devotion Aura is learned.
- Selected friendly non-building units currently receiving the aura show `虔诚光环 +N 护甲`; the line disappears when the unit leaves `auraRadius: 9.0` or the source Paladin dies.
- Enemy units and buildings do not show friendly aura applied state.
- Devotion Aura remains passive: learn buttons may appear when eligible, but there is still no Devotion Aura cast button, no `ABILITIES.devotion_aura`, no AI behavior, no particles/sounds/assets, and no building/air/other-hero expansion.
- Verification accepted:
  - `npm run build`
  - `npx tsc --noEmit -p tsconfig.app.json`
  - `node --test tests/v9-hero13-devotion-aura-data-seed.spec.mjs tests/v9-hero13-devotion-aura-source-boundary.spec.mjs tests/v9-hero13-devotion-aura-contract.spec.mjs tests/v9-hero12-divine-shield-closure.spec.mjs` -> 119/119 passed.
  - `./scripts/run-runtime-tests.sh tests/v9-hero13-devotion-aura-visible-feedback.spec.ts tests/v9-hero13-devotion-aura-learn-runtime.spec.ts tests/v9-hero13-devotion-aura-runtime.spec.ts --reporter=list` -> 14/14 passed.
  - `./scripts/run-runtime-tests.sh tests/v9-hero11-holy-light-skill-spend-runtime.spec.ts tests/v9-hero12-divine-shield-runtime.spec.ts tests/v9-hero9-revive-runtime.spec.ts --reporter=list` -> 23/23 passed.
  - `FORCE_RUNTIME_CLEANUP=1 ./scripts/cleanup-local-runtime.sh`
  - process check showed no Playwright/Vite/chrome-headless-shell leftovers.

### Task 244 — V9 HERO13-CLOSE1 Devotion Aura branch closure inventory

Status: `accepted`.

Owner: GLM-style worker.

Priority: Task243 已 accepted。Devotion Aura 已有合同、来源、数据、被动 runtime、学习入口和可见反馈；下一步只做静态收口盘点，把证据链和剩余缺口写清楚，防止后续误宣称完整 Paladin / 完整英雄系统 / 完整人族。

Allowed files:

- `docs/V9_HERO13_DEVOTION_AURA_CLOSURE.zh-CN.md`
- `tests/v9-hero13-devotion-aura-closure.spec.mjs`
- `docs/GLM_READY_TASK_QUEUE.md` only for closeout sync

Goal:

Create a static closure inventory for the Devotion Aura branch without changing production code or runtime behavior.

Must implement and prove:

1. Closure doc references Task238 CONTRACT1, Task239 SRC1, Task240 DATA1, Task241 IMPL1, Task242 IMPL2, and Task243 UX1.
2. Closure doc lists the accepted proof files for contract/source/data/runtime/learn/visible feedback.
3. Closure doc states the current player-facing capability: Paladin can learn Devotion Aura Lv1/Lv2/Lv3; passive armor aura applies to self/friendly non-building units; HUD shows learned level and active aura bonus.
4. Closure doc states the current exclusions: no Devotion Aura cast button, no `ABILITIES.devotion_aura`, no particles/sounds/assets, no AI hero strategy, no building/air expansion, no Resurrection, no other Human heroes, no items/shops/Tavern, no second race, no multiplayer.
5. Closure doc explicitly denies complete Paladin, complete hero system, complete Human, and V9 release.
6. Static proof checks both the closure doc and current source boundaries; it must not depend on browser/runtime.

Forbidden:

- Do not edit production code.
- Do not edit `src/game/Game.ts`, `src/game/GameData.ts`, `src/game/SimpleAI.ts`, CSS, assets, or runtime tests.
- Do not run Playwright, Vite, runtime tests, or browser processes.
- Do not add or change Devotion Aura behavior, HUD copy, command buttons, AI, particles, sounds, assets, Resurrection, other heroes, items, shops, Tavern, second race, air, or multiplayer.
- Do not claim complete Paladin, complete hero system, complete Human, or V9 release.

Verification:

```bash
node --test tests/v9-hero13-devotion-aura-closure.spec.mjs tests/v9-hero13-devotion-aura-data-seed.spec.mjs tests/v9-hero13-devotion-aura-source-boundary.spec.mjs tests/v9-hero13-devotion-aura-contract.spec.mjs tests/v9-hero12-divine-shield-closure.spec.mjs
npm run build
npx tsc --noEmit -p tsconfig.app.json
./scripts/cleanup-local-runtime.sh
```

Closeout requirements:

- Start your final closeout with the exact line: JOB_COMPLETE: <job-id>
- If truly blocked, emit the exact line: JOB_BLOCKED: <job-id>
- Include sections for files changed, verification run, and remaining unknowns.
- End with an exact line that begins with READY_FOR_NEXT_TASK: followed by the next safe continuation.
- Keep the work within the requested scope; do not widen ownership on your own.

Accepted closeout:

- GLM job `glm-mo1hah1k-dpn054` wrote the closure doc and proof, but got stuck editing the queue; Codex cancelled it and completed local review.
- `docs/V9_HERO13_DEVOTION_AURA_CLOSURE.zh-CN.md` now records the accepted Devotion Aura chain: CONTRACT1, SRC1, DATA1, IMPL1 passive runtime, IMPL2 learn surface, UX1 visible feedback.
- `tests/v9-hero13-devotion-aura-closure.spec.mjs` proves current player capability and explicit exclusions, including no cast button, no `ABILITIES.devotion_aura`, no AI, no assets, no Resurrection, no other heroes, no complete Paladin / hero system / Human / V9 release claim.
- Verification accepted:
  - `node --test tests/v9-hero13-devotion-aura-closure.spec.mjs tests/v9-hero13-devotion-aura-data-seed.spec.mjs tests/v9-hero13-devotion-aura-source-boundary.spec.mjs tests/v9-hero13-devotion-aura-contract.spec.mjs tests/v9-hero12-divine-shield-closure.spec.mjs` -> 168/168 passed.
  - `npm run build`
  - `npx tsc --noEmit -p tsconfig.app.json`
  - `./scripts/cleanup-local-runtime.sh`
  - process check showed no Playwright/Vite/chrome-headless-shell leftovers.

### Task 245 — V9 HERO14-CONTRACT1 Paladin Resurrection branch contract

Status: `accepted`.

Owner: GLM-style worker + Codex takeover/review.

Priority: HERO13 Devotion Aura 分支已收口。Paladin 仍缺 Resurrection 终极技能；下一步只能先合同化，不能直接写来源、数据或 runtime。

Allowed files:

- `docs/V9_HERO14_RESURRECTION_CONTRACT.zh-CN.md`
- `tests/v9-hero14-resurrection-contract.spec.mjs`
- `docs/GLM_READY_TASK_QUEUE.md` only for closeout sync

Goal:

Define the Paladin Resurrection branch contract without changing production code, data seeds, runtime behavior, UI, assets, AI, or other heroes.

Must implement and prove:

1. Contract doc references accepted HERO9 death/revive, HERO10 XP/leveling/skill points, HERO11 Holy Light learning, HERO12 Divine Shield, and HERO13 Devotion Aura closure.
2. Contract defines the safe branch order: HERO14-SRC1 source boundary, HERO14-DATA1 data seed, HERO14-IMPL1 minimal Resurrection runtime, HERO14-UX1 visible feedback, HERO14-CLOSE1 branch closure.
3. Contract states Resurrection as a Paladin ultimate at contract level: it must be learned through the hero skill system, must not be implemented until source/data steps are accepted, and must operate on dead friendly units only after source boundary confirms exact target rules.
4. Contract says exact mana cost, cooldown, range/area, resurrected-unit HP/mana, target filters, corpse/dead-record rules, and interaction with HERO9 Altar revive must come from HERO14-SRC1 before data/runtime work.
5. Runtime proof obligations are listed but not implemented: learn gate, cost/cooldown, dead friendly unit target set, no enemy/neutral/building resurrection unless source confirms, no duplicate resurrection, interaction with Altar revive/dead Paladin records, and non-regression for Holy Light / Divine Shield / Devotion Aura.
6. Contract explicitly denies production code changes, `GameData.ts` data seeds, `Game.ts` runtime, command-card cast buttons, particles/sounds/assets, AI hero strategy, other Human heroes, items, shops, Tavern, second race, air, multiplayer, complete hero system, complete Human, and V9 release.
7. Static proof confirms no new `HERO_ABILITY_LEVELS.resurrection`, no `ABILITIES.resurrection`, no `castResurrection`, and no Resurrection command button in current production code.

Forbidden:

- Do not edit production code.
- Do not edit `src/game/Game.ts`, `src/game/GameData.ts`, `src/game/SimpleAI.ts`, CSS, assets, or runtime tests.
- Do not add Resurrection data, runtime, command-card buttons, status text, particles, sounds, AI behavior, source values, or target logic.
- Do not run Playwright, Vite, runtime tests, or browser processes.
- Do not implement Archmage, Mountain King, Blood Mage, items, shops, Tavern, second race, air, multiplayer, complete Paladin, complete hero system, complete Human, or V9 release.

Verification:

```bash
node --test tests/v9-hero14-resurrection-contract.spec.mjs tests/v9-hero13-devotion-aura-closure.spec.mjs tests/v9-hero12-divine-shield-closure.spec.mjs
npm run build
npx tsc --noEmit -p tsconfig.app.json
./scripts/cleanup-local-runtime.sh
```

Closeout requirements:

- Start your final closeout with the exact line: JOB_COMPLETE: <job-id>
- If truly blocked, emit the exact line: JOB_BLOCKED: <job-id>
- Include sections for files changed, verification run, and remaining unknowns.
- End with an exact line that begins with READY_FOR_NEXT_TASK: followed by the next safe continuation.
- Keep the work within the requested scope; do not widen ownership on your own.

Accepted closeout:

- GLM 写出合同文档后停在提示符，未补静态 proof 和完整 closeout；Codex 取消 companion job `glm-mo1hjtfu-s33uri` 后接管。
- Codex 补强合同边界：阶段名统一成 `HERO14-SRC1` / `HERO14-DATA1` / `HERO14-IMPL1` / `HERO14-UX1` / `HERO14-CLOSE1`，明确本任务不改生产代码、不落 `GameData.ts` 数据、不接 `Game.ts` runtime、不加命令卡/HUD/粒子/声音/AI。
- Codex 新增 `tests/v9-hero14-resurrection-contract.spec.mjs`，证明合同引用 HERO9/10/11/12/13，未来 runtime proof obligation 已列出，且当前生产代码仍没有 `HERO_ABILITY_LEVELS.resurrection`、`ABILITIES.resurrection`、`castResurrection` 或 Resurrection 技能按钮。
- Verification accepted:
  - `node --test tests/v9-hero14-resurrection-contract.spec.mjs tests/v9-hero13-devotion-aura-closure.spec.mjs tests/v9-hero12-divine-shield-closure.spec.mjs` -> 114/114 passed.
  - `npm run build`
  - `npx tsc --noEmit -p tsconfig.app.json`
  - `./scripts/cleanup-local-runtime.sh`
  - process check showed no Playwright/Vite/chrome-headless-shell leftovers.

### Task 246 — V9 HERO14-SRC1 Resurrection source boundary

Status: `accepted`.

Owner: GLM-style worker + Codex takeover/review.

Priority: Task245 contract 已 accepted。下一步只能做 Resurrection 来源边界，先把主源、数值字段、目标规则、尸体/死亡记录规则和 HERO9 Altar revive 交互讲清楚；不能直接写数据或运行时。

Allowed files:

- `docs/V9_HERO14_RESURRECTION_SOURCE_BOUNDARY.zh-CN.md`
- `tests/v9-hero14-resurrection-source-boundary.spec.mjs`
- `docs/GLM_READY_TASK_QUEUE.md` only for closeout sync

Goal:

Bind Resurrection source truth and project mapping for a later data/runtime slice, without changing production code.

Primary source to use:

- Blizzard Classic Battle.net Paladin page, Resurrection section: `https://classic.battle.net/war3/human/units/paladin.shtml`

Must implement and prove:

1. Source boundary doc references Task245 / HERO14-CONTRACT1 and accepted HERO9 / HERO10 / HERO11 / HERO12 / HERO13 baseline.
2. Source hierarchy uses Blizzard Classic Battle.net as the primary source; any secondary source is only a cross-check and cannot override the primary source in this task.
3. Source boundary records Resurrection as Paladin ultimate and captures exact source fields that are actually present: mana cost, cooldown, area/range, resurrected unit count, valid target categories, level requirement, and any wording about corpses/dead units.
4. Source boundary states which values are absent or ambiguous in the primary source; absent values must be marked `source-unknown` and deferred, not invented.
5. Project mapping proposes how source area/range/count values map into the current project scale, but does not edit runtime yet.
6. Source boundary explicitly separates Resurrection ability from HERO9 Altar revive: HERO9 revives the dead Paladin record through Altar; HERO14 Resurrection is a Paladin ultimate affecting dead friendly unit records/corpses only after source and runtime rules are accepted.
7. Source boundary lists future runtime proof obligations for target filtering, no enemy/neutral/building resurrection unless source confirms, no duplicate resurrection, dead Paladin interaction, mana/cooldown, and non-regression for Holy Light / Divine Shield / Devotion Aura / Altar revive.
8. Static proof confirms `GameData.ts` and `Game.ts` still have no `HERO_ABILITY_LEVELS.resurrection`, no `ABILITIES.resurrection`, no `castResurrection`, and no Resurrection command-card button.
9. Contract proof remains valid.

Forbidden:

- Do not edit production code.
- Do not edit `src/game/Game.ts`, `src/game/GameData.ts`, `src/game/SimpleAI.ts`, CSS, assets, runtime tests, or UI files.
- Do not add Resurrection data, runtime, command-card buttons, status text, particles, sounds, AI behavior, source-invented values, or target logic.
- Do not run Playwright, Vite, runtime tests, or browser processes.
- Do not implement Archmage, Mountain King, Blood Mage, items, shops, Tavern, second race, air, multiplayer, complete Paladin, complete hero system, complete Human, or V9 release.

Verification:

```bash
node --test tests/v9-hero14-resurrection-source-boundary.spec.mjs tests/v9-hero14-resurrection-contract.spec.mjs tests/v9-hero13-devotion-aura-closure.spec.mjs tests/v9-hero12-divine-shield-closure.spec.mjs
npm run build
npx tsc --noEmit -p tsconfig.app.json
./scripts/cleanup-local-runtime.sh
```

Closeout requirements:

- Start your final closeout with the exact line: JOB_COMPLETE: <job-id>
- If truly blocked, emit the exact line: JOB_BLOCKED: <job-id>
- Include sections for files changed, verification run, and remaining unknowns.
- End with an exact line that begins with READY_FOR_NEXT_TASK: followed by the next safe continuation.
- Keep the work within the requested scope; do not widen ownership on your own.

Accepted closeout:

- GLM 查到 Blizzard Classic Battle.net 主源和 Liquipedia 交叉信息，并写出 source-boundary 文档，但没有补 source-boundary proof；Codex 取消 companion job `glm-mo1hsahb-04qjdy` 后接管。
- Codex 修正文档中过强的建筑解释：首轮不纳入建筑，是因为当前项目没有建筑尸体记录，而不是简单声称 `Ground` 一定排除建筑。
- Codex 新增 `tests/v9-hero14-resurrection-source-boundary.spec.mjs`，证明主源/二源层级、200 mana vs 150 mana 歧义、240 秒冷却、Range 40→4.0、AoE 90→9.0、最多 6 单位、等级 6、目标过滤、source-unknown 字段和 no-production-code 边界。
- Verification accepted:
  - `node --test tests/v9-hero14-resurrection-source-boundary.spec.mjs tests/v9-hero14-resurrection-contract.spec.mjs tests/v9-hero13-devotion-aura-closure.spec.mjs tests/v9-hero12-divine-shield-closure.spec.mjs` -> 144/144 passed.
  - `npm run build`
  - `npx tsc --noEmit -p tsconfig.app.json`
  - `./scripts/cleanup-local-runtime.sh`
  - process check showed no Playwright/Vite/chrome-headless-shell leftovers.

### Task 247 — V9 HERO14-DATA1 Resurrection level data seed

Status: `accepted`.

Owner: GLM-style worker + Codex takeover/review.

Priority: Task246 source boundary 已 accepted。下一步只允许把 Resurrection 的等级数据种子落进 `GameData.ts`，仍禁止运行时、命令卡、HUD、AI 和素材。

Allowed files:

- `src/game/GameData.ts`
- `docs/V9_HERO14_RESURRECTION_DATA_SEED.zh-CN.md`
- `tests/v9-hero14-resurrection-data-seed.spec.mjs`
- `tests/v9-hero14-resurrection-contract.spec.mjs`
- `tests/v9-hero14-resurrection-source-boundary.spec.mjs`
- `docs/GLM_READY_TASK_QUEUE.md` only for closeout sync

Goal:

Add a Resurrection data seed under `HERO_ABILITY_LEVELS` using the accepted Task246 source boundary, without adding runtime, command-card, HUD, AI, visuals, or assets.

Must implement and prove:

1. `HeroAbilityLevelDef` is extended only as needed for Resurrection data fields, such as `areaRadius?` and `maxTargets?`; do not introduce runtime-only structures.
2. `HERO_ABILITY_LEVELS.resurrection` exists with `maxLevel: 1`.
3. The single Resurrection level uses accepted Task246 source mapping:
   - `level: 1`
   - `requiredHeroLevel: 6`
   - `mana: 200` (primary source value; 150 remains documented as secondary-source ambiguity, not adopted in this data seed)
   - `cooldown: 240`
   - `range: 4.0`
   - `areaRadius: 9.0`
   - `maxTargets: 6`
   - `effectValue: 6`
   - `undeadDamage: 0`
   - `effectType: 'resurrection'`
4. Data-seed doc explains which source-unknown values remain deferred: resurrected HP/mana, corpse decay time, exact "most powerful" sorting, friendly hero corpse handling.
5. Contract/source-boundary static proofs are made stage-aware: they now allow `HERO_ABILITY_LEVELS.resurrection` data seed but still prove no `ABILITIES.resurrection`, no `castResurrection`, no command-card button, no HUD/status text, no AI, no particles/sounds/assets, no runtime, and no complete Paladin / hero system / Human / V9 claim.
6. `Game.ts` and `SimpleAI.ts` remain unchanged for Resurrection behavior.

Forbidden:

- Do not edit `src/game/Game.ts`, `src/game/SimpleAI.ts`, CSS, assets, runtime tests, UI files, or runtime behavior.
- Do not add `ABILITIES.resurrection`, `castResurrection`, command-card buttons, HUD/status text, particles, sounds, AI usage, target logic, corpse records, or resurrect behavior.
- Do not run Playwright, Vite preview, runtime tests, or browser processes.
- Do not adopt the secondary-source 150 mana value in this task; if that choice is desired later, open a separate source-boundary decision task.
- Do not implement Archmage, Mountain King, Blood Mage, items, shops, Tavern, second race, air, multiplayer, complete Paladin, complete hero system, complete Human, or V9 release.

Verification:

```bash
node --test tests/v9-hero14-resurrection-data-seed.spec.mjs tests/v9-hero14-resurrection-source-boundary.spec.mjs tests/v9-hero14-resurrection-contract.spec.mjs tests/v9-hero13-devotion-aura-closure.spec.mjs tests/v9-hero12-divine-shield-closure.spec.mjs
npm run build
npx tsc --noEmit -p tsconfig.app.json
./scripts/cleanup-local-runtime.sh
```

Closeout requirements:

- Start your final closeout with the exact line: JOB_COMPLETE: <job-id>
- If truly blocked, emit the exact line: JOB_BLOCKED: <job-id>
- Include sections for files changed, verification run, and remaining unknowns.
- End with an exact line that begins with READY_FOR_NEXT_TASK: followed by the next safe continuation.
- Keep the work within the requested scope; do not widen ownership on your own.

Accepted closeout:

- GLM 写入 `GameData.ts` 的数据种子和 `areaRadius/maxTargets` 可选字段，但停在提示符，未生成 DATA1 文档和 data-seed proof；Codex 取消 companion job `glm-mo1i4098-26m53x` 后接管。
- Codex 新增 `docs/V9_HERO14_RESURRECTION_DATA_SEED.zh-CN.md` 和 `tests/v9-hero14-resurrection-data-seed.spec.mjs`。
- Codex 将 contract/source proof 改成 DATA1 后阶段口径：允许 `HERO_ABILITY_LEVELS.resurrection` 数据存在，但仍禁止 `ABILITIES.resurrection`、`castResurrection`、命令卡、HUD、AI、runtime 和完整化宣称。
- Verification accepted:
  - `node --test tests/v9-hero14-resurrection-data-seed.spec.mjs tests/v9-hero14-resurrection-source-boundary.spec.mjs tests/v9-hero14-resurrection-contract.spec.mjs tests/v9-hero13-devotion-aura-closure.spec.mjs tests/v9-hero12-divine-shield-closure.spec.mjs` -> 162/162 passed.
  - `npm run build`
  - `npx tsc --noEmit -p tsconfig.app.json`
  - `./scripts/cleanup-local-runtime.sh`
  - process check showed no Playwright/Vite/chrome-headless-shell leftovers.

### Task 248 — V9 HERO14-IMPL1A Resurrection learn surface

Status: `accepted`.

Owner: GLM-style worker.

Priority: Task247 data seed 已 accepted。下一步先开放 Resurrection 学习入口和技能点消费，仍不实现施放按钮、复活效果或尸体系统，避免一次性把 ultimate runtime 做成大切片。

Allowed files:

- `src/game/Game.ts`
- `docs/V9_HERO14_RESURRECTION_LEARN_SLICE.zh-CN.md`
- `tests/v9-hero14-resurrection-learn-runtime.spec.ts`
- `tests/v9-hero14-resurrection-data-seed.spec.mjs`
- `tests/v9-hero14-resurrection-source-boundary.spec.mjs`
- `tests/v9-hero14-resurrection-contract.spec.mjs`
- `docs/GLM_READY_TASK_QUEUE.md` only for closeout sync

Goal:

Expose the Paladin Resurrection learn surface using `HERO_ABILITY_LEVELS.resurrection`, without adding Resurrection cast runtime, corpse records, resurrect effects, HUD/status text, AI behavior, visuals, or assets.

Must implement and prove:

1. Paladin command card shows `学习复活 (Lv1)` or an equivalent clear Resurrection learn label when selected and Resurrection is not learned.
2. Learn button is enabled only when Paladin is alive, has at least 1 skill point, and meets `requiredHeroLevel: 6` from `HERO_ABILITY_LEVELS.resurrection`.
3. Disabled reasons are clear for dead Paladin, no skill point, and insufficient hero level.
4. Clicking the learn button consumes exactly 1 skill point and sets `abilityLevels.resurrection = 1`.
5. Resurrection has `maxLevel: 1`; after learning, no second learn level appears.
6. Learned Resurrection persists across HERO9 Altar revive.
7. No Resurrection cast button appears in this task; no dead unit is resurrected, no corpse system is introduced, no mana/cooldown is consumed, and no HUD/status text is added.
8. Static proofs are stage-aware: allow learn-surface tokens, but still prove no `ABILITIES.resurrection`, no `castResurrection`, no resurrect effect, no AI usage, no particles/sounds/assets, no complete Paladin / hero system / Human / V9 release claim.

Forbidden:

- Do not implement Resurrection casting, resurrect effects, target selection, corpse records, dead-unit retention, HP/mana restoration, "most powerful" sorting, cooldown consumption, mana consumption, HUD/status text, particles, sounds, assets, or AI behavior.
- Do not add `ABILITIES.resurrection` or `castResurrection`.
- Do not edit `src/game/SimpleAI.ts`, CSS, assets, or non-HERO14 files unless a stage-aware proof must be updated.
- Do not run `npx playwright`, `npm exec playwright`, `vite preview`, or browser processes directly; use `./scripts/run-runtime-tests.sh`.
- Do not implement Archmage, Mountain King, Blood Mage, items, shops, Tavern, second race, air, multiplayer, complete Paladin, complete hero system, complete Human, or V9 release.

Verification:

```bash
node --test tests/v9-hero14-resurrection-data-seed.spec.mjs tests/v9-hero14-resurrection-source-boundary.spec.mjs tests/v9-hero14-resurrection-contract.spec.mjs tests/v9-hero13-devotion-aura-closure.spec.mjs tests/v9-hero12-divine-shield-closure.spec.mjs
npm run build
npx tsc --noEmit -p tsconfig.app.json
./scripts/run-runtime-tests.sh tests/v9-hero14-resurrection-learn-runtime.spec.ts tests/v9-hero9-revive-runtime.spec.ts --reporter=list
./scripts/cleanup-local-runtime.sh
```

Closeout requirements:

- Start your final closeout with the exact line: JOB_COMPLETE: <job-id>
- If truly blocked, emit the exact line: JOB_BLOCKED: <job-id>
- Include sections for files changed, verification run, and remaining unknowns.
- End with an exact line that begins with READY_FOR_NEXT_TASK: followed by the next safe continuation.
- Keep the work within the requested scope; do not widen ownership on your own.

Closeout:

- GLM 写入 `src/game/Game.ts` 学习入口后停在提示符，没有完成 runtime proof 或 closeout；Codex 取消 companion job `glm-mo1iek8u-35xgef` 后接管。
- Codex 新增 `docs/V9_HERO14_RESURRECTION_LEARN_SLICE.zh-CN.md` 和 `tests/v9-hero14-resurrection-learn-runtime.spec.ts`，并把 HERO14 contract/source/data 静态 proof 改成 IMPL1A 阶段口径：允许学习入口，继续禁止 `ABILITIES.resurrection`、`castResurrection`、施放按钮、复活效果、尸体系统、HUD、AI、素材和完整化宣称。
- Codex 修复 runtime proof 的等待口径：6 级 Paladin 的 HERO9 祭坛复活时间会按真实队列 `totalDuration` 变长，不能沿用 1 级 `PALADIN_REVIVE_TIME`。
- Verification accepted:
  - `node --test tests/v9-hero14-resurrection-data-seed.spec.mjs tests/v9-hero14-resurrection-source-boundary.spec.mjs tests/v9-hero14-resurrection-contract.spec.mjs tests/v9-hero13-devotion-aura-closure.spec.mjs tests/v9-hero12-divine-shield-closure.spec.mjs` -> 162/162 passed.
  - `npm run build`
  - `npx tsc --noEmit -p tsconfig.app.json`
  - `./scripts/run-runtime-tests.sh tests/v9-hero14-resurrection-learn-runtime.spec.ts --reporter=list` -> 3/3 passed.
  - `./scripts/run-runtime-tests.sh tests/v9-hero14-resurrection-learn-runtime.spec.ts tests/v9-hero9-revive-runtime.spec.ts --reporter=list` -> 10/10 passed.
  - `./scripts/cleanup-local-runtime.sh`
  - process check showed no Playwright/Vite/chrome-headless-shell leftovers.

### Task 249 — V9 HERO14-IMPL1B Resurrection dead-unit record substrate

Status: `accepted`.

Owner: GLM-style worker.

Priority: Task248 learn surface 已 accepted。Resurrection 真正施放前需要可靠的“友方单位死亡记录”底座；当前项目死亡单位会从 `units` 中清理，不能直接跳到施放按钮，否则会把尸体系统、目标选择和复活效果混成一个大任务。

Allowed files:

- `src/game/Game.ts`
- `tests/v9-hero14-resurrection-dead-record-runtime.spec.ts`
- `docs/V9_HERO14_RESURRECTION_DEAD_RECORD_SLICE.zh-CN.md`
- `tests/v9-hero14-resurrection-learn-runtime.spec.ts` only if existing proof needs a stage-aware no-cast assertion update
- `tests/v9-hero14-resurrection-data-seed.spec.mjs` only if existing proof needs a stage-aware no-cast assertion update
- `tests/v9-hero14-resurrection-source-boundary.spec.mjs` only if existing proof needs a stage-aware no-cast assertion update
- `tests/v9-hero14-resurrection-contract.spec.mjs` only if existing proof needs a stage-aware no-cast assertion update
- `docs/GLM_READY_TASK_QUEUE.md` only for closeout sync

Goal:

Create the minimal runtime substrate that records friendly non-building, non-hero ground unit deaths for future Resurrection casting. This task must not add a Resurrection cast button or resurrect anything.

Must implement and prove:

1. When a player-owned non-building, non-hero ground unit dies, the game records a Resurrection-eligible dead-unit entry with at least team, unit type, death position, and a stable record id or timestamp.
2. Enemy units, buildings, heroes, and already dead hero records are not stored as Resurrection-eligible ordinary unit records.
3. Existing HERO9 dead Paladin / Altar revive behavior remains separate and unchanged.
4. Dead records are cleared on fresh runtime / match reset and do not leak across tests.
5. The substrate is bounded: repeated deaths create records only for real death events and do not duplicate the same unit death every frame.
6. No Resurrection cast button appears; no unit is resurrected; no mana/cooldown is consumed; no HUD/status text, particles, sounds, assets, or AI behavior are added.

Forbidden:

- Do not implement Resurrection casting, resurrect effects, target selection, HP/mana restoration, "most powerful" sorting, cooldown consumption, mana consumption, HUD/status text, particles, sounds, assets, or AI behavior.
- Do not add `ABILITIES.resurrection` or `castResurrection`.
- Do not edit `src/game/SimpleAI.ts`, CSS, assets, or unrelated systems.
- Do not run `npx playwright`, `npm exec playwright`, `vite preview`, or browser processes directly; use `./scripts/run-runtime-tests.sh`.
- Do not implement Archmage, Mountain King, Blood Mage, items, shops, Tavern, second race, air, multiplayer, complete Paladin, complete hero system, complete Human, or V9 release.

Verification:

```bash
npm run build
npx tsc --noEmit -p tsconfig.app.json
./scripts/run-runtime-tests.sh tests/v9-hero14-resurrection-dead-record-runtime.spec.ts tests/v9-hero14-resurrection-learn-runtime.spec.ts tests/v9-hero9-revive-runtime.spec.ts --reporter=list
node --test tests/v9-hero14-resurrection-data-seed.spec.mjs tests/v9-hero14-resurrection-source-boundary.spec.mjs tests/v9-hero14-resurrection-contract.spec.mjs tests/v9-hero13-devotion-aura-closure.spec.mjs tests/v9-hero12-divine-shield-closure.spec.mjs
./scripts/cleanup-local-runtime.sh
```

Closeout requirements:

- Start your final closeout with the exact line: JOB_COMPLETE: <job-id>
- If truly blocked, emit the exact line: JOB_BLOCKED: <job-id>
- Include sections for files changed, verification run, and remaining unknowns.
- End with an exact line that begins with READY_FOR_NEXT_TASK: followed by the next safe continuation.
- Keep the work within the requested scope; do not widen ownership on your own.

Closeout:

- GLM 初版新增 `deadUnitRecords` 后反复用 `tail` 跑 runtime，并把 `dispose()` 当成公共清理入口；Codex 暂停 feed、取消重复 job 后接管复核。
- Codex 保留生产实现的正确部分：`Game.ts` 在普通死亡单位模型销毁前记录 team 0、非建筑、非英雄单位的 `team/type/x/z/diedAt`，并在 `disposeAllUnits()` / 地图重开路径清空。
- Codex 重写 runtime proof 为 2 条受控用例：同局证明 team0 普通单位记录、team1/建筑/英雄排除、重复处理不重复、地图重开清空；另证 HERO9 死亡圣骑士和祭坛复活不进入普通死亡记录。
- Verification accepted:
  - `npm run build`
  - `npx tsc --noEmit -p tsconfig.app.json`
  - `./scripts/run-runtime-tests.sh tests/v9-hero14-resurrection-dead-record-runtime.spec.ts --reporter=list` -> 2/2 passed.
  - `./scripts/run-runtime-tests.sh tests/v9-hero14-resurrection-dead-record-runtime.spec.ts tests/v9-hero14-resurrection-learn-runtime.spec.ts tests/v9-hero9-revive-runtime.spec.ts --reporter=list` -> 12/12 passed.
  - `node --test tests/v9-hero14-resurrection-data-seed.spec.mjs tests/v9-hero14-resurrection-source-boundary.spec.mjs tests/v9-hero14-resurrection-contract.spec.mjs tests/v9-hero13-devotion-aura-closure.spec.mjs tests/v9-hero12-divine-shield-closure.spec.mjs` -> 162/162 passed.
  - `./scripts/cleanup-local-runtime.sh`
  - process check showed no Playwright/Vite/chrome-headless-shell leftovers.

### Task 250 — V9 HERO14-IMPL1C Resurrection minimal no-target cast runtime

Status: `accepted`.

Owner: GLM partial + Codex takeover/review.

Priority: Task249 已接受，普通友方单位死亡记录现在可用。下一步可以把 Paladin 学会 Resurrection 后的最小无目标施放串起来，但必须继续把视觉、AI、素材和完整英雄系统留在后续。

Allowed files:

- `src/game/Game.ts`
- `tests/v9-hero14-resurrection-cast-runtime.spec.ts`
- `docs/V9_HERO14_RESURRECTION_CAST_RUNTIME_SLICE.zh-CN.md`
- `tests/v9-hero14-resurrection-contract.spec.mjs` only for stage-aware no-longer-no-cast assertions
- `tests/v9-hero14-resurrection-source-boundary.spec.mjs` only for stage-aware no-longer-no-cast assertions
- `tests/v9-hero14-resurrection-data-seed.spec.mjs` only for stage-aware no-longer-no-cast assertions
- `tests/v9-hero14-resurrection-dead-record-runtime.spec.ts` only if Task249 proof needs a no-regression addition
- `docs/GLM_READY_TASK_QUEUE.md` only for closeout sync

Goal:

Implement the smallest playable Resurrection cast runtime on top of Task249 dead-unit records.

Must implement and prove:

1. A living Paladin that has learned `resurrection` gets a command-card cast button; unlearned, dead, insufficient-mana, and cooldown states are blocked with clear command-card reasons.
2. The cast reads `HERO_ABILITY_LEVELS.resurrection` for `manaCost`, `cooldown`, `areaRadius`, and `maxTargets`; do not add `ABILITIES.resurrection`.
3. No-target cast is centered on the Paladin. It consumes mana once, starts cooldown once, and restores at most `maxTargets` eligible team-0 non-building non-hero records within `areaRadius`.
4. Consumed records are removed; out-of-range and overflow records remain for later casts.
5. Revived ordinary units use existing `spawnUnit` defaults at the recorded death position. This is the current project fallback for source-unknown HP/mana restoration and must be documented as provisional.
6. Selection order is deterministic record order / oldest-first only; do not claim source-accurate "most powerful" sorting in this task.
7. HERO9 dead Paladin / Altar revive remains separate; heroes, enemy units, buildings, and records from other teams are not resurrected by this ordinary-unit cast.
8. No particles, sounds, external assets, AI behavior, other heroes, items, shops, Tavern, second race, air, multiplayer, complete Paladin, complete hero system, complete Human, or V9 release claim.

Forbidden:

- Do not add `ABILITIES.resurrection`.
- Do not implement particles, sounds, icon assets, AI casting, corpse decay timers, source-accurate most-powerful sorting, hero resurrection via this ability, items, shops, Tavern, second race, air, multiplayer, or release packaging.
- Do not edit `src/game/SimpleAI.ts`, CSS, assets, or unrelated systems.
- Do not run `npx playwright`, `npm exec playwright`, `vite preview`, or browser processes directly; use `./scripts/run-runtime-tests.sh`.

Verification:

```bash
npm run build
npx tsc --noEmit -p tsconfig.app.json
./scripts/run-runtime-tests.sh tests/v9-hero14-resurrection-cast-runtime.spec.ts tests/v9-hero14-resurrection-dead-record-runtime.spec.ts tests/v9-hero14-resurrection-learn-runtime.spec.ts tests/v9-hero9-revive-runtime.spec.ts --reporter=list
node --test tests/v9-hero14-resurrection-data-seed.spec.mjs tests/v9-hero14-resurrection-source-boundary.spec.mjs tests/v9-hero14-resurrection-contract.spec.mjs tests/v9-hero13-devotion-aura-closure.spec.mjs tests/v9-hero12-divine-shield-closure.spec.mjs
./scripts/cleanup-local-runtime.sh
```

Closeout requirements:

- Start your final closeout with the exact line: JOB_COMPLETE: <job-id>
- If truly blocked, emit the exact line: JOB_BLOCKED: <job-id>
- Include sections for files changed, verification run, and remaining unknowns.
- End with an exact line that begins with READY_FOR_NEXT_TASK: followed by the next safe continuation.
- Keep the work within the requested scope; do not widen ownership on your own.

Codex closeout:

- GLM wrote the first `Game.ts` cast sketch and initial runtime file, then returned to prompt before doc/proof closeout; its validation used truncated `tail` output and was not accepted.
- Codex took over and fixed the runtime contract:
  - `castResurrection` reads `HERO_ABILITY_LEVELS.resurrection`.
  - No `ABILITIES.resurrection` was added.
  - Eligible records are same-team ordinary unit records only; enemies, heroes, buildings, other teams, and out-of-range records are not consumed.
  - Selection is deterministic `diedAt` oldest-first, with record order tie-break.
  - Revived units are spawned at the recorded death position, not offset by `spawnUnit`'s tile-to-center convention.
  - Empty-target, low-mana, dead, and cooldown states do not spend mana or start cooldown.
  - HERO9 Altar revive remains separate.
- Verification accepted:
  - `npm run build` passed.
  - `npx tsc --noEmit -p tsconfig.app.json` passed.
  - `./scripts/run-runtime-tests.sh tests/v9-hero14-resurrection-cast-runtime.spec.ts --reporter=list` -> 5/5 passed.
  - `./scripts/run-runtime-tests.sh tests/v9-hero14-resurrection-cast-runtime.spec.ts tests/v9-hero14-resurrection-dead-record-runtime.spec.ts tests/v9-hero14-resurrection-learn-runtime.spec.ts tests/v9-hero9-revive-runtime.spec.ts --reporter=list` -> 17/17 passed.
  - `node --test tests/v9-hero14-resurrection-data-seed.spec.mjs tests/v9-hero14-resurrection-source-boundary.spec.mjs tests/v9-hero14-resurrection-contract.spec.mjs tests/v9-hero13-devotion-aura-closure.spec.mjs tests/v9-hero12-divine-shield-closure.spec.mjs` -> 162/162 passed.
  - `./scripts/cleanup-local-runtime.sh` completed.

### Task 251 — V9 HERO14-UX1 Resurrection visible feedback minimal slice

Status: `accepted`.

Owner: GLM-style worker.

Priority: Task250 已接受，玩家现在能施放 Resurrection，但反馈还只有命令按钮和状态原因。下一步只补最小可见反馈，避免玩家不知道施法是否成功、复活了多少单位或为什么不能施放。

Allowed files:

- `src/game/Game.ts`
- `tests/v9-hero14-resurrection-visible-feedback.spec.ts`
- `docs/V9_HERO14_RESURRECTION_VISIBLE_FEEDBACK.zh-CN.md`
- `tests/v9-hero14-resurrection-cast-runtime.spec.ts` only for narrowly required no-regression additions
- `docs/GLM_READY_TASK_QUEUE.md` only for closeout sync

Goal:

Add minimal readable Resurrection feedback without adding assets or widening into AI/complete Paladin work.

Must implement and prove:

1. Selecting a Paladin that has learned Resurrection shows a readable learned/cast status in the existing unit stats or command-card text.
2. After a successful Resurrection cast, the player can see how many ordinary units were revived in the existing text UI.
3. Cooldown / no target / low mana / dead reasons remain visible and update after HUD refresh.
4. Feedback uses plain text only; no particles, sounds, icons, new assets, CSS-heavy redesign, AI behavior, other heroes, items, shops, Tavern, second race, air, multiplayer, complete Paladin, complete hero system, complete Human, or V9 release claim.
5. Existing cast runtime, dead-record runtime, learn runtime, and HERO9 revive behavior remain green.

Forbidden:

- Do not add particles, sounds, icon assets, AI casting, corpse decay timers, source-accurate most-powerful sorting, hero resurrection via this ability, items, shops, Tavern, second race, air, multiplayer, or release packaging.
- Do not edit `src/game/SimpleAI.ts`, CSS, assets, or unrelated systems.
- Do not run `npx playwright`, `npm exec playwright`, `vite preview`, or browser processes directly; use `./scripts/run-runtime-tests.sh`.

Verification:

```bash
npm run build
npx tsc --noEmit -p tsconfig.app.json
./scripts/run-runtime-tests.sh tests/v9-hero14-resurrection-visible-feedback.spec.ts tests/v9-hero14-resurrection-cast-runtime.spec.ts tests/v9-hero14-resurrection-dead-record-runtime.spec.ts tests/v9-hero14-resurrection-learn-runtime.spec.ts tests/v9-hero9-revive-runtime.spec.ts --reporter=list
./scripts/cleanup-local-runtime.sh
```

Closeout requirements:

- Start your final closeout with the exact line: JOB_COMPLETE: <job-id>
- If truly blocked, emit the exact line: JOB_BLOCKED: <job-id>
- Include sections for files changed, verification run, and remaining unknowns.
- End with an exact line that begins with READY_FOR_NEXT_TASK: followed by the next safe continuation.
- Keep the work within the requested scope; do not widen ownership on your own.

Codex closeout:

- GLM wrote the first visible-feedback pass, then hit a queue edit error and used truncated `tail` validation for build / tsc / static output; Codex took over local review.
- Codex fixed two acceptance issues:
  - A plain floating number alone was not readable enough for revived-count feedback, so the unit stats panel now briefly shows `刚复活 N 个单位` after a successful cast.
  - Resurrection cooldown / recent feedback state is now included in the HUD command refresh key, so command-card disabled reasons update naturally as time advances.
- Accepted behavior:
  - Learned Resurrection shows as `复活术 Lv1`.
  - Successful cast shows readable revived-count text plus existing lightweight floating number feedback.
  - Cooldown appears as `复活冷却 Ns` in the unit panel and `冷却中 N.Ns` in the command reason.
  - No `ABILITIES.resurrection`, AI casting, particles, sounds, icon assets, corpse timers, other heroes, complete Paladin, complete hero system, complete Human, or V9 release claim was added.
- Verification accepted:
  - `npx tsc --noEmit -p tsconfig.app.json` passed.
  - `npm run build` passed.
  - `./scripts/run-runtime-tests.sh tests/v9-hero14-resurrection-visible-feedback.spec.ts tests/v9-hero14-resurrection-cast-runtime.spec.ts tests/v9-hero14-resurrection-dead-record-runtime.spec.ts tests/v9-hero14-resurrection-learn-runtime.spec.ts tests/v9-hero9-revive-runtime.spec.ts --reporter=list` -> 22/22 passed.
  - `node --test tests/v9-hero14-resurrection-data-seed.spec.mjs tests/v9-hero14-resurrection-source-boundary.spec.mjs tests/v9-hero14-resurrection-contract.spec.mjs tests/v9-hero13-devotion-aura-closure.spec.mjs tests/v9-hero12-divine-shield-closure.spec.mjs` -> 162/162 passed.
  - `./scripts/cleanup-local-runtime.sh` completed.

### Task 252 — V9 HERO14-CLOSE1 Resurrection branch closure inventory

Status: `accepted`.

Owner: GLM-style worker + Codex review.

Priority: Task251 已接受，Resurrection 分支已有合同、来源、数据、学习入口、死亡记录底座、最小施放 runtime 和最小可见反馈。下一步只做分支收口盘点，把完成证据和延后边界写清楚，避免后续误宣称完整 Paladin / 完整英雄系统。

Allowed files:

- `docs/V9_HERO14_RESURRECTION_CLOSURE.zh-CN.md`
- `tests/v9-hero14-resurrection-closure.spec.mjs`
- `docs/GLM_READY_TASK_QUEUE.md` only for closeout sync

Goal:

Close the HERO14 Resurrection branch as a bounded evidence inventory.

Must prove:

1. Closure doc references Task245 contract, Task246 source, Task247 data, Task248 learn, Task249 dead-record substrate, Task250 cast runtime, and Task251 visible feedback.
2. Closure doc lists every proof file: contract/source/data/learn/dead-record/cast/visible-feedback.
3. Closure doc states exactly what the player can do now: learn Resurrection at Paladin level 6, cast no-target Resurrection, revive up to 6 eligible friendly ordinary dead units, see learned/cast/cooldown/revived-count feedback.
4. Closure doc states exactly what remains delayed: ABILITIES.resurrection, AI casting, particles, sounds, icons/assets, corpse decay timers, source-accurate most-powerful sorting, friendly hero corpse handling, items, shops, Tavern, other heroes, second race, air, multiplayer, complete Paladin, complete hero system, complete Human, V9 release.
5. Static proof confirms production boundaries remain: Game.ts has castResurrection and minimal feedback text, GameData.ts has HERO_ABILITY_LEVELS.resurrection, ABILITIES has no resurrection, and SimpleAI.ts has no Resurrection behavior.

Forbidden:

- Do not edit `src/game/Game.ts`, `src/game/GameData.ts`, `src/game/SimpleAI.ts`, CSS, assets, runtime tests, or unrelated docs.
- Do not run Playwright/runtime/browser tests for this static closure task.
- Do not add new gameplay behavior, AI behavior, assets, effects, sounds, icons, or release packaging.

Verification:

```bash
node --test tests/v9-hero14-resurrection-closure.spec.mjs tests/v9-hero14-resurrection-data-seed.spec.mjs tests/v9-hero14-resurrection-source-boundary.spec.mjs tests/v9-hero14-resurrection-contract.spec.mjs
npm run build
npx tsc --noEmit -p tsconfig.app.json
./scripts/cleanup-local-runtime.sh
```

Closeout requirements:

- Start your final closeout with the exact line: JOB_COMPLETE: <job-id>
- If truly blocked, emit the exact line: JOB_BLOCKED: <job-id>
- Include sections for files changed, verification run, and remaining unknowns.
- End with an exact line that begins with READY_FOR_NEXT_TASK: followed by the next safe continuation.
- Keep the work within the requested scope; do not widen ownership on your own.

Codex closeout:

- GLM produced the closure doc and static proof, then marked the task completed. Its build / tsc validation still used `tail`, and the closeout/test-count summary had stale counts.
- Codex corrected the proof-count summary in the closure doc and added `CLOSE14-34` so the count cannot silently drift again.
- Accepted behavior:
  - `docs/V9_HERO14_RESURRECTION_CLOSURE.zh-CN.md` references Task245 through Task252 and lists the contract/source/data/learn/dead-record/cast/visible-feedback evidence chain.
  - The closure doc states current player capability precisely: learn Resurrection at Paladin level 6, cast no-target Resurrection, revive up to 6 eligible friendly ordinary dead units, and see learned/cast/cooldown/revived-count feedback.
  - The closure doc keeps `ABILITIES.resurrection`, AI casting, particles, sounds, icons/assets, corpse decay timers, most-powerful sorting, friendly hero corpse handling, items, shops, Tavern, other heroes, second race, air, multiplayer, complete Paladin, complete hero system, complete Human, and V9 release delayed.
  - Production boundaries remain unchanged: no production code changed by this task, `ABILITIES.resurrection` is still absent, and `SimpleAI.ts` has no Resurrection behavior.
- Verification accepted:
  - `node --test tests/v9-hero14-resurrection-closure.spec.mjs tests/v9-hero14-resurrection-data-seed.spec.mjs tests/v9-hero14-resurrection-source-boundary.spec.mjs tests/v9-hero14-resurrection-contract.spec.mjs` -> 112/112 passed.
  - `npm run build` passed.
  - `npx tsc --noEmit -p tsconfig.app.json` passed.
  - `./scripts/cleanup-local-runtime.sh` completed.

### Task 253 — V9 HERO15-CLOSE1 Paladin minimal ability kit global closure inventory

Status: `accepted`.

Owner: GLM-style worker + Codex review.

Priority: Task252 已接受，Resurrection 分支完成。Paladin 现在已有 Holy Light、Divine Shield、Devotion Aura、Resurrection、XP/升级、技能学习、死亡/祭坛复活和最小反馈证据链。下一步只做全局静态收口，证明“Paladin 最小能力套件”闭环，同时明确这仍不是完整英雄系统或完整 Human。

Allowed files:

- `docs/V9_HERO15_PALADIN_MINIMAL_KIT_CLOSURE.zh-CN.md`
- `tests/v9-hero15-paladin-minimal-kit-closure.spec.mjs`
- `docs/GLM_READY_TASK_QUEUE.md` only for closeout sync

Goal:

Close the Paladin minimal ability kit as a bounded evidence inventory.

Must prove:

1. Closure doc references the accepted evidence chain: HERO1 contract, HERO2 source, HERO3 Altar data, HERO4 Paladin data, HERO5 Holy Light data, HERO6/HERO6A/HERO6B Altar runtime exposure, HERO7 Holy Light runtime, HERO8 minimal hero closure, HERO9 death/revive, HERO10 XP/leveling, HERO11 skill learning, HERO12 Divine Shield, HERO13 Devotion Aura, and HERO14 Resurrection.
2. Closure doc states exactly what a player can do now: build Altar, summon one Paladin, cast Holy Light, die and revive at Altar, gain XP/level/skill points, learn Paladin abilities, use Divine Shield, benefit from Devotion Aura, and cast Resurrection with visible feedback.
3. Closure doc lists the key proof files for each branch closure: HERO8, HERO9, HERO10, HERO11, HERO12, HERO13, HERO14, plus the new HERO15 proof.
4. Closure doc states exactly what remains delayed: AI hero strategy/casting, other three Human heroes, inventory, items, shops, Tavern, icon/sound/particle/assets, full hero UI polish, source-accurate corpse sorting details, air, campaign, second race, multiplayer, complete hero system, complete Human, V9 release.
5. Static proof confirms production boundaries remain: no Archmage/Mountain King/Blood Mage runtime, no SimpleAI hero strategy, no item/shop/Tavern system, no new assets, and no production files changed by this task.

Forbidden:

- Do not edit `src/game/Game.ts`, `src/game/GameData.ts`, `src/game/SimpleAI.ts`, CSS, assets, runtime tests, or unrelated docs.
- Do not run Playwright/runtime/browser tests for this static closure task.
- Do not add new gameplay behavior, AI behavior, assets, effects, sounds, icons, items, shops, Tavern, other heroes, air, or release packaging.

Verification:

```bash
node --test tests/v9-hero15-paladin-minimal-kit-closure.spec.mjs tests/v9-hero14-resurrection-closure.spec.mjs tests/v9-hero13-devotion-aura-closure.spec.mjs tests/v9-hero12-divine-shield-closure.spec.mjs tests/v9-hero11-holy-light-skill-learning-closure.spec.mjs tests/v9-hero10-xp-leveling-closure.spec.mjs tests/v9-hero9-death-revive-closure.spec.mjs tests/v9-hero8-minimal-hero-runtime-closure.spec.mjs
npm run build
npx tsc --noEmit -p tsconfig.app.json
./scripts/cleanup-local-runtime.sh
```

Closeout requirements:

- Start your final closeout with the exact line: JOB_COMPLETE: <job-id>
- If truly blocked, emit the exact line: JOB_BLOCKED: <job-id>
- Include sections for files changed, verification run, and remaining unknowns.
- End with an exact line that begins with READY_FOR_NEXT_TASK: followed by the next safe continuation.
- Keep the work within the requested scope; do not widen ownership on your own.

Codex closeout:

- GLM produced the closure doc and static proof, then hit a self-referential proof trap in `CLOSE15-39`: the test searched its own source for `spawnUnit` / `spawnBuilding`, so the assertion could fail because the guard text itself contained the forbidden tokens.
- GLM corrected the proof to an allowed-file existence check; Codex then performed local review and removed one unsupported exact phrase from the doc (`53 个子任务`), replacing it with the defensible `14 条连续分支`.
- Accepted behavior:
  - `docs/V9_HERO15_PALADIN_MINIMAL_KIT_CLOSURE.zh-CN.md` references HERO1-HERO14 and lists the Paladin evidence chain: Altar, Paladin summon, Holy Light, death/revive, XP/leveling, skill learning, Divine Shield, Devotion Aura, and Resurrection.
  - The closure doc states current player capability precisely: build Altar, summon one Paladin, cast Holy Light, die and revive at Altar, gain XP/level/skill points, learn Paladin abilities, use Divine Shield, benefit from Devotion Aura, and cast Resurrection with visible feedback.
  - The closure doc keeps AI hero strategy, Archmage, Mountain King, Blood Mage, inventory, items, shops, Tavern, icon/sound/particle/assets, full hero UI polish, corpse sorting details, air, campaign, second race, multiplayer, complete hero system, complete Human, and V9 release delayed.
  - Production boundaries remain unchanged: no production code changed by this task; `SimpleAI.ts` still has no Paladin hero strategy; no other Human hero runtime or item/shop/Tavern system was introduced.
- Verification accepted:
  - `node --test tests/v9-hero15-paladin-minimal-kit-closure.spec.mjs` -> 40/40 passed.
  - `node --test tests/v9-hero15-paladin-minimal-kit-closure.spec.mjs tests/v9-hero14-resurrection-closure.spec.mjs tests/v9-hero13-devotion-aura-closure.spec.mjs tests/v9-hero12-divine-shield-closure.spec.mjs tests/v9-hero11-holy-light-skill-learning-closure.spec.mjs tests/v9-hero10-xp-leveling-closure.spec.mjs tests/v9-hero9-death-revive-closure.spec.mjs tests/v9-hero8-minimal-hero-runtime-closure.spec.mjs` -> 278/278 passed.
  - `npm run build` passed.
  - `npx tsc --noEmit -p tsconfig.app.json` passed.
  - `./scripts/cleanup-local-runtime.sh` completed.

### Task 254 — V9 HERO16-CONTRACT1 Paladin AI hero strategy boundary

Status: `accepted`.

Owner: GLM-style worker + Codex review.

Priority: Task253 已接受，Paladin 最小能力套件完成静态收口。下一步不能直接让 AI 乱用技能，先把 AI 使用 Paladin 的产品合同、阶段顺序和禁区写清楚，避免把“会造英雄”“会学技能”“会治疗”“会复活”混成一个不可验收的大任务。

Allowed files:

- `docs/V9_HERO16_PALADIN_AI_STRATEGY_CONTRACT.zh-CN.md`
- `tests/v9-hero16-paladin-ai-strategy-contract.spec.mjs`
- `docs/GLM_READY_TASK_QUEUE.md` only for closeout sync

Goal:

Define the smallest safe contract for AI-side Paladin usage without changing runtime behavior.

Must prove:

1. The contract references the accepted Paladin chain: HERO8/HERO9/HERO10/HERO11/HERO12/HERO13/HERO14/HERO15 closure proofs.
2. The contract states the current boundary truth: `SimpleAI.ts` has no Paladin build/summon/skill/casting strategy today, and this task does not change that.
3. The contract defines a phased future sequence:
   - `HERO16-AI1`: AI Altar build + Paladin summon readiness, with economy and uniqueness constraints.
   - `HERO16-AI2`: AI skill-learning priority, with Holy Light before defensive/ultimate behavior unless explicitly justified.
   - `HERO16-AI3`: AI Holy Light defensive cast, limited to injured friendly units and existing mana/cooldown/range rules.
   - `HERO16-AI4`: AI Divine Shield self-preservation cast, limited to alive Paladin, learned level, low HP / combat pressure, mana, and cooldown.
   - `HERO16-AI5`: AI Resurrection cast, limited to learned ultimate, level/mana/cooldown, existing dead-unit records, and minimum useful corpse count.
4. The contract states Devotion Aura is passive and requires no active cast strategy, but AI still benefits once learned.
5. The contract forbids other heroes, items, shops, Tavern, new assets, new production runtime, omniscient enemy cheating beyond current game-state inspection, complete AI strategy claims, complete hero system claims, complete Human claims, and V9 release claims.
6. The static proof validates those contract statements and confirms `src/game/SimpleAI.ts` still lacks Paladin / Holy Light / Divine Shield / Devotion Aura / Resurrection behavior.

Forbidden:

- Do not edit `src/game/SimpleAI.ts`, `src/game/Game.ts`, `src/game/GameData.ts`, CSS, assets, runtime tests, or unrelated docs.
- Do not run Playwright/runtime/browser tests for this static contract task.
- Do not implement AI behavior, hero build orders, ability casting, other heroes, items, shops, Tavern, visual/audio assets, or release packaging.

Verification:

```bash
node --test tests/v9-hero16-paladin-ai-strategy-contract.spec.mjs tests/v9-hero15-paladin-minimal-kit-closure.spec.mjs
npm run build
npx tsc --noEmit -p tsconfig.app.json
./scripts/cleanup-local-runtime.sh
```

Closeout requirements:

- Start your final closeout with the exact line: JOB_COMPLETE: <job-id>
- If truly blocked, emit the exact line: JOB_BLOCKED: <job-id>
- Include sections for files changed, verification run, and remaining unknowns.
- End with an exact line that begins with READY_FOR_NEXT_TASK: followed by the next safe continuation.
- Keep the work within the requested scope; do not widen ownership on your own.

Codex closeout:

- GLM wrote the HERO16 AI strategy contract and static proof, then stopped after two proof failures.
- Codex fixed both proof problems:
  - `C16-25` now checks the actual line containing all AI phase ids, not the `顺序约束` heading.
  - `C16-36` no longer treats generic `heal` text in existing Priest AI behavior as Holy Light behavior; it checks Paladin/Holy Light-specific markers.
- Accepted behavior:
  - The contract references HERO8-HERO15 accepted closure proofs.
  - The contract records current truth: `SimpleAI.ts` has no Paladin build/summon/skill/casting behavior today.
  - The contract defines strict future order: `HERO16-AI1` Altar + summon readiness, `HERO16-AI2` skill-learning priority, `HERO16-AI3` Holy Light defensive cast, `HERO16-AI4` Divine Shield self-preservation, `HERO16-AI5` Resurrection cast.
  - Devotion Aura is correctly treated as passive: no active cast strategy is needed, though AI benefits automatically after learning it.
  - Other Human heroes, items, shops, Tavern, new assets, production runtime, complete AI strategy, complete hero system, complete Human, and V9 release remain denied.
- Verification accepted:
  - `node --test tests/v9-hero16-paladin-ai-strategy-contract.spec.mjs tests/v9-hero15-paladin-minimal-kit-closure.spec.mjs` -> 79/79 passed.
  - `npm run build` passed.
  - `npx tsc --noEmit -p tsconfig.app.json` passed.
  - `./scripts/cleanup-local-runtime.sh` completed.

### Task 255 — V9 HERO16-AI1 AI Altar build + Paladin summon readiness slice

Status: `accepted`.

Owner: GLM-style worker + Codex review.

Priority: Task254 已接受，AI hero strategy 顺序已经固定。下一步只做 `HERO16-AI1`：让 AI 使用现有生产系统进入英雄线，先能在合适经济条件下建造 Altar 并召唤一个 Paladin；不学习技能、不施放技能。

Allowed files:

- `src/game/SimpleAI.ts`
- `tests/v9-hero16-ai-altar-paladin-summon.spec.ts`
- `docs/GLM_READY_TASK_QUEUE.md` only for closeout sync

Goal:

Implement the smallest AI-side Paladin entry behavior using existing game APIs.

Must prove:

1. AI builds or schedules Altar only when economy allows and an Altar is not already built or already under construction.
2. AI summons exactly one Paladin after Altar is available, respecting existing Paladin uniqueness rules.
3. AI does not attempt to summon duplicate Paladins from multiple Altars or direct training paths.
4. AI does not learn Paladin skills, cast Holy Light, cast Divine Shield, cast Resurrection, or introduce Devotion Aura positioning strategy in this task.
5. AI still follows existing economy / military behavior enough that the test does not pass by freezing all other AI decisions.
6. If existing `SimpleAI.ts` cannot build Altar or train Paladin through existing `Game.ts` APIs without production API changes, stop and emit `JOB_BLOCKED`; do not edit `Game.ts`.

Forbidden:

- Do not edit `src/game/Game.ts`, `src/game/GameData.ts`, CSS, assets, unrelated runtime tests, or unrelated docs.
- Do not implement skill learning or ability casting.
- Do not add Archmage, Mountain King, Blood Mage, items, shops, Tavern, new assets, particles, sounds, icons, or release packaging.
- Do not bypass existing resource costs, population rules, build queue, train queue, or Paladin uniqueness guard.

Verification:

```bash
npm run build
npx tsc --noEmit -p tsconfig.app.json
./scripts/run-runtime-tests.sh tests/v9-hero16-ai-altar-paladin-summon.spec.ts --reporter=list
./scripts/cleanup-local-runtime.sh
```

Closeout requirements:

- Start your final closeout with the exact line: JOB_COMPLETE: <job-id>
- If truly blocked, emit the exact line: JOB_BLOCKED: <job-id>
- Include sections for files changed, verification run, and remaining unknowns.
- End with an exact line that begins with READY_FOR_NEXT_TASK: followed by the next safe continuation.
- Keep the work within the requested scope; do not widen ownership on your own.

Codex closeout:

- GLM wrote the first `SimpleAI.ts` implementation and runtime proof but stopped before complete verification; its earlier Claude-side build output had timed out.
- Codex reviewed and fixed two acceptance issues:
  - `AI1-1` now clears any pre-existing team 1 Altar fixture and resets AI before proving the no-Altar starting condition.
  - `SimpleAI.ts` no longer marks `altarScheduled = true` immediately after a build attempt, so failed placement / no idle worker cases can retry on later ticks.
- Accepted behavior:
  - AI attempts Altar only after Barracks exists, resources can afford it, and no completed or in-progress Altar already exists.
  - AI can summon exactly one Paladin from a completed Altar when resources and supply allow it.
  - Duplicate Paladins are prevented by existing Paladin presence and Altar training-queue checks.
  - This task does not learn Paladin skills, cast Holy Light, cast Divine Shield, cast Resurrection, add Devotion Aura positioning, or add other heroes/items/assets.
  - Existing economy / military behavior still continues in the focused proof.
- Verification accepted:
  - `npm run build` passed.
  - `npx tsc --noEmit -p tsconfig.app.json` passed.
  - `./scripts/run-runtime-tests.sh tests/v9-hero16-ai-altar-paladin-summon.spec.ts --reporter=list` -> 5/5 passed.
  - `./scripts/cleanup-local-runtime.sh` completed.

### Task 256 — V9 HERO16-AI2 AI Paladin skill-learning priority slice

Status: `accepted`.

Owner: GLM-style worker + Codex review.

Priority: Task255 已接受，AI 已能进入最小英雄线。下一步只做 `HERO16-AI2`：AI Paladin 有技能点时按合同顺序学习技能，不施放技能。

Allowed files:

- `src/game/SimpleAI.ts`
- `tests/v9-hero16-ai-paladin-skill-learning.spec.ts`
- `docs/GLM_READY_TASK_QUEUE.md` only for closeout sync

Goal:

Implement AI-side Paladin skill-learning priority using existing game APIs.

Must prove:

1. AI Paladin with available `heroSkillPoints` learns `Holy Light` first.
2. AI then learns `Divine Shield`, then `Devotion Aura`, then `Resurrection` only when level / prerequisite conditions make the skill legal.
3. AI does not spend skill points when Paladin is dead, has no skill points, or does not meet the existing level gate.
4. AI does not cast Holy Light, Divine Shield, Resurrection, or introduce Devotion Aura positioning in this task.
5. Task255 behavior remains intact: AI can still build Altar and summon Paladin.
6. If existing `SimpleAI.ts` cannot learn hero skills through existing command/API paths without `Game.ts` changes, stop and emit `JOB_BLOCKED`; do not edit `Game.ts`.

Forbidden:

- Do not edit `src/game/Game.ts`, `src/game/GameData.ts`, CSS, assets, unrelated runtime tests, or unrelated docs.
- Do not implement ability casting or target selection.
- Do not add Archmage, Mountain King, Blood Mage, items, shops, Tavern, new assets, particles, sounds, icons, or release packaging.
- Do not bypass existing level gates, skill point costs, revive persistence, mana, cooldown, or Paladin uniqueness.

Verification:

```bash
npm run build
npx tsc --noEmit -p tsconfig.app.json
./scripts/run-runtime-tests.sh tests/v9-hero16-ai-paladin-skill-learning.spec.ts tests/v9-hero16-ai-altar-paladin-summon.spec.ts --reporter=list
./scripts/cleanup-local-runtime.sh
```

Closeout requirements:

- Start your final closeout with the exact line: JOB_COMPLETE: <job-id>
- If truly blocked, emit the exact line: JOB_BLOCKED: <job-id>
- Include sections for files changed, verification run, and remaining unknowns.
- End with an exact line that begins with READY_FOR_NEXT_TASK: followed by the next safe continuation.
- Keep the work within the requested scope; do not widen ownership on your own.

Codex closeout (2026-04-17 11:35:20 CST):

- Files reviewed:
  - `src/game/SimpleAI.ts`
  - `tests/v9-hero16-ai-paladin-skill-learning.spec.ts`
  - `tests/v9-hero16-ai-altar-paladin-summon.spec.ts`
- Accepted behavior:
  - AI Paladin with skill points learns Holy Light first.
  - If the next Holy Light level is locked by hero level, AI proceeds to Divine Shield, then Devotion Aura, then Resurrection when legal.
  - Dead Paladin, zero skill points and unmet level gate do not spend points.
  - This task does not cast Holy Light, Divine Shield or Resurrection.
  - Task255 Altar + Paladin summon regression remains green.
- Verification accepted:
  - `npm run build` passed.
  - `npx tsc --noEmit -p tsconfig.app.json` passed.
  - `./scripts/run-runtime-tests.sh tests/v9-hero16-ai-paladin-skill-learning.spec.ts tests/v9-hero16-ai-altar-paladin-summon.spec.ts --reporter=list` -> 11/11 passed.
  - `./scripts/cleanup-local-runtime.sh` completed.

### Task 257 — V9 HERO16-AI3 AI Holy Light defensive cast slice

Status: `accepted`.

Owner: GLM-style worker + Codex review.

Priority: Task256 已接受，AI Paladin 已会按合同学习技能。下一步只做 `HERO16-AI3`：AI 在已有 Holy Light 等级时，防御性治疗受伤友军。

Allowed files:

- `src/game/Game.ts`
- `src/game/SimpleAI.ts`
- `tests/v9-hero16-ai-holy-light-cast.spec.ts`
- `docs/GLM_READY_TASK_QUEUE.md` only for closeout sync

Goal:

Implement the narrow AI-side Holy Light defensive cast using the existing Paladin Holy Light rules.

Must prove:

1. AI Paladin only casts Holy Light when it has learned Holy Light, is alive, has enough mana, is not on cooldown, and a valid injured friendly non-building unit is in range.
2. The cast must reuse the existing `Game.ts` Holy Light runtime path or expose that path through a narrow AI context method; do not duplicate heal amount, mana cost, cooldown or range formulas in `SimpleAI.ts`.
3. The cast heals the chosen friendly unit, spends mana and starts cooldown using the same numbers as the player path.
4. AI does not cast on self, enemies, buildings, full-health units, out-of-range units or dead Paladin.
5. Task255 and Task256 behavior remains intact: AI can still build Altar, summon Paladin and learn skills.
6. This task does not implement Divine Shield AI, Resurrection AI, Devotion Aura positioning, other heroes, items, shops, assets or broad AI tactics.

Forbidden:

- Do not change `src/game/GameData.ts`, CSS, assets, unrelated runtime tests or unrelated docs.
- Do not introduce a second Holy Light implementation in `SimpleAI.ts`.
- Do not implement Divine Shield, Resurrection, Devotion Aura positioning, Archmage, Mountain King, Blood Mage, items, shops, Tavern, particles, sounds, icons or release packaging.
- Do not weaken existing mana, cooldown, range, skill-level, revive persistence or Paladin uniqueness rules.

Verification:

```bash
npm run build
npx tsc --noEmit -p tsconfig.app.json
./scripts/run-runtime-tests.sh tests/v9-hero16-ai-holy-light-cast.spec.ts tests/v9-hero16-ai-paladin-skill-learning.spec.ts tests/v9-hero16-ai-altar-paladin-summon.spec.ts --reporter=list
./scripts/cleanup-local-runtime.sh
```

Runtime command safety:
- If runtime or Playwright verification is required, use `./scripts/run-runtime-tests.sh ... --reporter=list`; do not run `npx playwright test`, `npm exec playwright`, `vite preview`, or browser processes directly.

Closeout requirements:
- Start your final closeout with the exact line: JOB_COMPLETE: <job-id>
- If truly blocked, emit the exact line: JOB_BLOCKED: <job-id>
- Include sections for files changed, verification run, and remaining unknowns.
- End with an exact line that begins with READY_FOR_NEXT_TASK: followed by the next safe continuation.
- Keep the work within the requested scope; do not widen ownership on your own.

Codex closeout (2026-04-17 11:46:05 CST):

- GLM completed only the first API seam before stalling at low context; Codex took over implementation and verification.
- Files changed:
  - `src/game/Game.ts`: added `aiCastHolyLight` wrapper that delegates to existing `castHolyLight`, and wired it into `AIContext`.
  - `src/game/SimpleAI.ts`: AI Paladin selects injured friendly non-building targets and calls the context wrapper; no Holy Light formula is duplicated in AI.
  - `tests/v9-hero16-ai-holy-light-cast.spec.ts`: focused runtime proof for success, invalid targets and blocked gates.
- Accepted behavior:
  - Learned AI Paladin heals an injured friendly with the same mana / cooldown path as the player cast.
  - AI does not cast on self, enemies, buildings, full-health units, out-of-range units, unlearned Paladin, dead Paladin, low mana or cooldown.
  - Task255 summon and Task256 skill-learning regressions remain green.
- Verification accepted:
  - `npm run build` passed.
  - `npx tsc --noEmit -p tsconfig.app.json` passed.
  - `./scripts/run-runtime-tests.sh tests/v9-hero16-ai-holy-light-cast.spec.ts tests/v9-hero16-ai-paladin-skill-learning.spec.ts tests/v9-hero16-ai-altar-paladin-summon.spec.ts --reporter=list` -> 14/14 passed.
  - `./scripts/cleanup-local-runtime.sh` completed.

### Task 258 — V9 HERO16-AI4 AI Divine Shield self-preservation slice

Status: `accepted`.

Owner: GLM-style worker + Codex review.

Priority: Task257 已接受，AI Paladin 已能防御性使用 Holy Light。下一步只做 `HERO16-AI4`：AI Paladin 在低生命且 Divine Shield 合法时自施放。

Allowed files:

- `src/game/Game.ts`
- `src/game/SimpleAI.ts`
- `tests/v9-hero16-ai-divine-shield-cast.spec.ts`
- `docs/GLM_READY_TASK_QUEUE.md` only for closeout sync

Goal:

Implement a narrow AI-side Divine Shield self-preservation cast using the existing Paladin Divine Shield rules.

Must prove:

1. AI Paladin casts Divine Shield only on itself, only when alive, learned, low HP, enough mana, and not on cooldown.
2. The cast must reuse the existing `Game.ts` Divine Shield runtime path or expose it through a narrow AI context method; do not duplicate mana, cooldown, duration or invulnerability formulas in `SimpleAI.ts`.
3. A successful AI cast spends mana, sets active invulnerability and starts cooldown using the same numbers as the player path.
4. AI does not cast Divine Shield when unlearned, dead, high HP, low mana or cooldown-active.
5. Task255, Task256 and Task257 behavior remains intact: AI can still build Altar, summon Paladin, learn skills and use Holy Light defensively.
6. This task does not implement Resurrection AI, Devotion Aura positioning, other heroes, items, shops, assets or broad AI tactics.

Forbidden:

- Do not change `src/game/GameData.ts`, CSS, assets, unrelated runtime tests or unrelated docs.
- Do not introduce a second Divine Shield implementation in `SimpleAI.ts`.
- Do not implement Resurrection AI, Devotion Aura positioning, Archmage, Mountain King, Blood Mage, items, shops, Tavern, particles, sounds, icons or release packaging.
- Do not weaken existing mana, cooldown, duration, skill-level, revive persistence or Paladin uniqueness rules.

Verification:

```bash
npm run build
npx tsc --noEmit -p tsconfig.app.json
./scripts/run-runtime-tests.sh tests/v9-hero16-ai-divine-shield-cast.spec.ts tests/v9-hero16-ai-holy-light-cast.spec.ts tests/v9-hero16-ai-paladin-skill-learning.spec.ts tests/v9-hero16-ai-altar-paladin-summon.spec.ts --reporter=list
./scripts/cleanup-local-runtime.sh
```

Runtime command safety:
- If runtime or Playwright verification is required, use `./scripts/run-runtime-tests.sh ... --reporter=list`; do not run `npx playwright test`, `npm exec playwright`, `vite preview`, or browser processes directly.

Closeout requirements:
- Start your final closeout with the exact line: JOB_COMPLETE: <job-id>
- If truly blocked, emit the exact line: JOB_BLOCKED: <job-id>
- Include sections for files changed, verification run, and remaining unknowns.
- End with an exact line that begins with READY_FOR_NEXT_TASK: followed by the next safe continuation.
- Keep the work within the requested scope; do not widen ownership on your own.

Codex closeout (2026-04-17 11:57:51 CST):

- GLM added only the first wrapper/interface seam before compacting at 0%; Codex took over implementation and verification.
- Files changed:
  - `src/game/Game.ts`: added `aiCastDivineShield` wrapper that delegates to existing `castDivineShield`, and wired it into `AIContext`.
  - `src/game/SimpleAI.ts`: AI Paladin triggers Divine Shield through the context wrapper only when low HP; no Divine Shield formula is duplicated in AI.
  - `tests/v9-hero16-ai-divine-shield-cast.spec.ts`: focused runtime proof for success, high-HP no-op and blocked gates.
- Accepted behavior:
  - Learned low-HP AI Paladin self-casts Divine Shield with the same mana / duration / cooldown path as the player cast.
  - AI does not cast Divine Shield when unlearned, dead, high HP, low mana or cooldown-active.
  - Task255 summon, Task256 skill-learning and Task257 Holy Light regressions remain green.
- Verification accepted:
  - `npm run build` passed.
  - `npx tsc --noEmit -p tsconfig.app.json` passed.
  - `./scripts/run-runtime-tests.sh tests/v9-hero16-ai-divine-shield-cast.spec.ts tests/v9-hero16-ai-holy-light-cast.spec.ts tests/v9-hero16-ai-paladin-skill-learning.spec.ts tests/v9-hero16-ai-altar-paladin-summon.spec.ts --reporter=list` -> 17/17 passed.
  - `./scripts/cleanup-local-runtime.sh` completed.

### Task 259 — V9 HERO16-AI5 AI Resurrection cast slice

Status: `accepted`.

Owner: GLM-style worker + Codex review.

Priority: Task258 已接受，AI Paladin 已能学习技能、治疗友军、低生命自保。下一步只做 `HERO16-AI5`：AI Paladin 在已有可复活友军记录且 Resurrection 合法时施放。

Allowed files:

- `src/game/Game.ts`
- `src/game/SimpleAI.ts`
- `tests/v9-hero16-ai-resurrection-cast.spec.ts`
- `docs/GLM_READY_TASK_QUEUE.md` only for closeout sync

Goal:

Implement a narrow AI-side Resurrection cast using the existing Paladin Resurrection rules.

Must prove:

1. AI Paladin casts Resurrection only when alive, learned, enough mana, not on cooldown, and existing dead-unit records contain at least one eligible friendly non-hero non-building unit in range.
2. The cast must reuse the existing `Game.ts` Resurrection runtime path or expose it through a narrow AI context method; do not duplicate target filtering, mana, cooldown, range, area or max-target formulas in `SimpleAI.ts`.
3. A successful AI cast spends mana, starts cooldown and revives eligible friendly units using the same path as the player cast.
4. AI does not cast Resurrection when unlearned, dead, low mana, cooldown-active, no eligible records, or only enemy / hero / building / out-of-range records exist.
5. Task255, Task256, Task257 and Task258 behavior remains intact.
6. This task does not implement other Human heroes, items, shops, assets, Devotion Aura positioning, new corpse visuals or broad AI tactics.

Forbidden:

- Do not change `src/game/GameData.ts`, CSS, assets, unrelated runtime tests or unrelated docs.
- Do not introduce a second Resurrection implementation in `SimpleAI.ts`.
- Do not implement Archmage, Mountain King, Blood Mage, items, shops, Tavern, particles, sounds, icons, corpse visuals or release packaging.
- Do not weaken existing mana, cooldown, range, max-target, dead-record, revive persistence or Paladin uniqueness rules.

Verification:

```bash
npm run build
npx tsc --noEmit -p tsconfig.app.json
./scripts/run-runtime-tests.sh tests/v9-hero16-ai-resurrection-cast.spec.ts tests/v9-hero16-ai-divine-shield-cast.spec.ts tests/v9-hero16-ai-holy-light-cast.spec.ts tests/v9-hero16-ai-paladin-skill-learning.spec.ts tests/v9-hero16-ai-altar-paladin-summon.spec.ts --reporter=list
./scripts/cleanup-local-runtime.sh
```

Runtime command safety:
- If runtime or Playwright verification is required, use `./scripts/run-runtime-tests.sh ... --reporter=list`; do not run `npx playwright test`, `npm exec playwright`, `vite preview`, or browser processes directly.

Closeout requirements:
- Start your final closeout with the exact line: JOB_COMPLETE: <job-id>
- If truly blocked, emit the exact line: JOB_BLOCKED: <job-id>
- Include sections for files changed, verification run, and remaining unknowns.
- End with an exact line that begins with READY_FOR_NEXT_TASK: followed by the next safe continuation.
- Keep the work within the requested scope; do not widen ownership on your own.

Codex acceptance:

- GLM added the `aiCastResurrection` wrapper, AI context seam, initial SimpleAI call and an initial runtime spec, but did not provide a reliable closeout.
- Codex tightened the production boundary:
  - `Game.ts` records Resurrection-eligible deaths for controllable team 0 / team 1 only; neutral / creep-like teams remain deferred.
  - `SimpleAI.ts` only calls the AI context `castResurrection` seam and does not duplicate Resurrection formula logic.
  - `tests/v9-hero16-ai-resurrection-cast.spec.ts` was rewritten into a focused 4-test contract with exact mana/cooldown/record-consumption assertions.
  - `tests/v9-hero14-resurrection-dead-record-runtime.spec.ts` and the dead-record slice doc now match the team0/team1 record contract.
- Accepted behavior:
  - AI Paladin casts learned Resurrection only with a legal friendly dead-unit record.
  - Success spends 200 mana, starts 240s cooldown, revives legal records, and leaves enemy / hero / building / out-of-range records untouched.
  - Unlearned, dead, low-mana, cooldown and no-record states are no-ops.
  - Team1 real deaths now generate records that AI Resurrection can consume once; neutral deaths still do not.
- Verification accepted:
  - `npm run build` passed.
  - `npx tsc --noEmit -p tsconfig.app.json` passed.
  - `./scripts/run-runtime-tests.sh tests/v9-hero16-ai-resurrection-cast.spec.ts tests/v9-hero14-resurrection-dead-record-runtime.spec.ts tests/v9-hero14-resurrection-cast-runtime.spec.ts tests/v9-hero16-ai-divine-shield-cast.spec.ts tests/v9-hero16-ai-holy-light-cast.spec.ts tests/v9-hero16-ai-paladin-skill-learning.spec.ts tests/v9-hero16-ai-altar-paladin-summon.spec.ts --reporter=list` -> 28/28 passed.
  - `./scripts/cleanup-local-runtime.sh` completed.
  - `git diff --check` passed.

### Task 260 — V9 HERO16-CLOSE1 Paladin AI strategy closure inventory

Status: `accepted`.

Owner: GLM partial + Codex takeover/review.

Priority: Task259 已接受，HERO16-AI1 到 AI5 的工程链路已完成。下一步不是继续加新行为，而是做 HERO16 AI 全链路收口，避免旧合同里的“当前无 AI 行为”历史口径继续误导后续任务和看板。

Allowed files:

- `docs/V9_HERO16_PALADIN_AI_STRATEGY_CLOSURE.zh-CN.md`
- `tests/v9-hero16-paladin-ai-strategy-closure.spec.mjs`
- `docs/V9_HERO16_PALADIN_AI_STRATEGY_CONTRACT.zh-CN.md`
- `tests/v9-hero16-paladin-ai-strategy-contract.spec.mjs`
- `docs/V9_HERO15_PALADIN_MINIMAL_KIT_CLOSURE.zh-CN.md`
- `tests/v9-hero15-paladin-minimal-kit-closure.spec.mjs`
- `docs/V9_MAINTENANCE_EXPANSION_REMAINING_GATES.zh-CN.md`
- `docs/GLM_READY_TASK_QUEUE.md` only for closeout sync

Goal:

Write a HERO16 closure inventory that states exactly what AI Paladin can do now and what remains deferred.

Must prove:

1. Closure doc references Task254 through Task259 and the runtime proof files for AI1-AI5.
2. Current AI capabilities are stated accurately: build Altar, summon one Paladin, learn skills in priority order, cast Holy Light defensively, cast Divine Shield at low HP, cast Resurrection through existing records.
3. The closure doc states that Devotion Aura is passive and has no active cast strategy.
4. The closure doc states that SimpleAI delegates ability math to Game.ts wrappers and must not duplicate mana/cooldown/range/target formulas.
5. Update old HERO16 contract proof from "SimpleAI has no Paladin behavior" to a stage-aware statement: that was true at contract time, but after AI1-AI5 current production code intentionally contains bounded Paladin AI.
6. Update HERO15 closure wording/proof so "AI hero strategy deferred" becomes "AI hero strategy is handled by HERO16 and now has a minimal accepted chain"; still deny complete AI, other heroes, items, shops, Tavern, assets, complete hero system, complete Human and V9 release.
7. Do not implement runtime behavior.

Forbidden:

- Do not edit `src/game/Game.ts`, `src/game/SimpleAI.ts`, `src/game/GameData.ts`, runtime specs, CSS, assets or package scripts.
- Do not add Archmage, Mountain King, Blood Mage, items, shops, Tavern, particles, sounds, icons, assets, complete AI tactics, complete hero system, complete Human or V9 release claims.
- Do not delete old proof files. If an old proof was historically scoped, make it stage-aware rather than removing it.

Verification:

```bash
npm run build
npx tsc --noEmit -p tsconfig.app.json
node --test tests/v9-hero16-paladin-ai-strategy-closure.spec.mjs tests/v9-hero16-paladin-ai-strategy-contract.spec.mjs tests/v9-hero15-paladin-minimal-kit-closure.spec.mjs
./scripts/cleanup-local-runtime.sh
```

Runtime command safety:
- This is a static/documentation closeout task. Do not run browser/runtime tests unless Codex explicitly expands scope.

Closeout requirements:
- Start your final closeout with the exact line: JOB_COMPLETE: <job-id>
- If truly blocked, emit the exact line: JOB_BLOCKED: <job-id>
- Include sections for files changed, verification run, and remaining unknowns.
- End with an exact line that begins with READY_FOR_NEXT_TASK: followed by the next safe continuation.
- Keep the work within the requested scope; do not widen ownership on your own.

Codex closeout accepted:

- GLM stopped after partial stage-aware edits, before creating closure doc/proof and before updating HERO15 old AI wording.
- Codex created `docs/V9_HERO16_PALADIN_AI_STRATEGY_CLOSURE.zh-CN.md`.
- Codex created `tests/v9-hero16-paladin-ai-strategy-closure.spec.mjs`.
- Codex updated `tests/v9-hero16-paladin-ai-strategy-contract.spec.mjs` so C16-35..C16-39 now prove bounded Paladin AI delegation instead of the stale "no Paladin in SimpleAI" baseline.
- Codex updated HERO15 closure doc/proof to acknowledge HERO16 minimal Paladin AI while still denying complete AI, other heroes, items, shops, Tavern, assets, complete Human and V9 release.
- Verification accepted:
  - `node --test tests/v9-hero16-paladin-ai-strategy-closure.spec.mjs tests/v9-hero16-paladin-ai-strategy-contract.spec.mjs tests/v9-hero15-paladin-minimal-kit-closure.spec.mjs` -> 96/96 passed.
  - `npm run build` passed.
  - `npx tsc --noEmit -p tsconfig.app.json` passed.
  - `./scripts/cleanup-local-runtime.sh` completed.
  - `git diff --check` passed.

### Task 261 — V9 HERO17-CONTRACT1 Archmage branch boundary contract

Status: `accepted`.

Owner: GLM-style worker.

Priority: HERO16 Paladin 最小 AI 链路已收口。完整 Human 仍缺其他三名英雄。下一步只能先开 Archmage 边界合同，不能直接写数值或运行时。

Allowed files:

- `docs/V9_HERO17_ARCHMAGE_BRANCH_CONTRACT.zh-CN.md`
- `tests/v9-hero17-archmage-branch-contract.spec.mjs`
- `docs/V9_MAINTENANCE_EXPANSION_REMAINING_GATES.zh-CN.md`
- `docs/GLM_READY_TASK_QUEUE.md` only for closeout sync

Goal:

Write a source-first Archmage branch contract that defines what must happen before any Archmage runtime is implemented.

Must prove:

1. The contract references the accepted Paladin / HERO16 closure as the current hero-chain baseline.
2. The contract states Archmage is not implemented yet in `GameData.ts`, `Game.ts`, `SimpleAI.ts`, command cards, visuals, AI, or runtime tests.
3. The contract defines the next safe sequence: source boundary -> Archmage unit data seed -> Water Elemental contract/source/data -> summon runtime -> Brilliance Aura contract/source/data/runtime -> Blizzard contract/source/data/runtime -> Mass Teleport contract/source/data/runtime -> closure.
4. The contract forbids writing Archmage values without a source boundary.
5. The contract forbids runtime behavior, new models/icons/particles/sounds, items, shops, Tavern, other races, campaign, multiplayer, and complete Human / complete hero system / V9 release claims.
6. The static proof checks current source files still do not contain Archmage runtime or data.

Forbidden:

- Do not edit `src/game/Game.ts`, `src/game/GameData.ts`, `src/game/SimpleAI.ts`, runtime tests, CSS, assets or package scripts.
- Do not add Archmage, Water Elemental, Brilliance Aura, Blizzard, Mass Teleport data or runtime.
- Do not invent source values. This task is a boundary contract only.
- Do not claim complete AI, complete hero system, complete Human or V9 release.

Verification:

```bash
npm run build
npx tsc --noEmit -p tsconfig.app.json
node --test tests/v9-hero17-archmage-branch-contract.spec.mjs tests/v9-hero16-paladin-ai-strategy-closure.spec.mjs tests/v9-hero15-paladin-minimal-kit-closure.spec.mjs
./scripts/cleanup-local-runtime.sh
```

Runtime command safety:
- This is a static/documentation contract task. Do not run browser/runtime tests unless Codex explicitly expands scope.

Closeout requirements:
- Start your final closeout with the exact line: JOB_COMPLETE: <job-id>
- If truly blocked, emit the exact line: JOB_BLOCKED: <job-id>
- Include sections for files changed, verification run, and remaining unknowns.
- End with an exact line that begins with READY_FOR_NEXT_TASK: followed by the next safe continuation.
- Keep the work within the requested scope; do not widen ownership on your own.

Codex closeout accepted:

- GLM created the first Archmage contract/proof files but returned to prompt before closeout. Codex reviewed locally and fixed the source-boundary handoff.
- The accepted contract says Archmage, Water Elemental, Brilliance Aura, Blizzard and Mass Teleport are not implemented yet.
- The accepted contract corrected the death-record boundary: current `deadUnitRecords` cover controllable team0/team1 ordinary non-hero non-building units; neutral, heroes and buildings remain excluded; Water Elemental death-record handling is deferred to a later contract.
- Verification accepted:
  - `node --test tests/v9-hero17-archmage-branch-contract.spec.mjs tests/v9-hero16-paladin-ai-strategy-closure.spec.mjs tests/v9-hero15-paladin-minimal-kit-closure.spec.mjs` -> 93/93 passed.
  - `npm run build` passed.
  - `npx tsc --noEmit -p tsconfig.app.json` passed.
  - `./scripts/cleanup-local-runtime.sh` completed.
  - `git diff --check` passed.

### Task 262 — V9 HERO17-SRC1 Archmage source boundary packet

Status: `accepted`.

Owner: GLM-style worker + Codex correction/review.

Priority: Task261 已接受；后续不能凭记忆写 Archmage / Water Elemental / Brilliance Aura / Blizzard / Mass Teleport 数值。下一步必须先做来源边界。

Allowed files:

- `docs/V9_HERO17_ARCHMAGE_SOURCE_BOUNDARY.zh-CN.md`
- `tests/v9-hero17-archmage-source-boundary.spec.mjs`
- `docs/V9_HERO17_ARCHMAGE_BRANCH_CONTRACT.zh-CN.md` only if a wording correction is required
- `docs/V9_MAINTENANCE_EXPANSION_REMAINING_GATES.zh-CN.md`
- `docs/GLM_READY_TASK_QUEUE.md` only for closeout sync

Goal:

Write a source boundary packet for Archmage and its four hero abilities before any data or runtime work starts.

Must prove:

1. The source packet identifies the source priority used for Archmage, Water Elemental, Brilliance Aura, Blizzard and Mass Teleport values.
2. The packet records source-known versus source-unknown fields instead of filling gaps from memory.
3. The packet maps War3 scale/range/duration values into current project units only when a mapping rule already exists; otherwise it must mark the field as pending.
4. The packet explicitly does not modify `GameData.ts`, `Game.ts`, `SimpleAI.ts`, runtime specs, assets, CSS or package scripts.
5. The packet produces the allowed next data task scope: Archmage unit data seed only if enough source fields are known; otherwise source reconciliation remains open.
6. The static proof checks the source packet, current contract, and current source files still contain no Archmage runtime/data implementation.

Forbidden:

- Do not edit production code.
- Do not add Archmage, Water Elemental, Brilliance Aura, Blizzard or Mass Teleport data/runtime.
- Do not invent values when sources disagree or are missing.
- Do not use unofficial values as adopted truth without documenting the source priority and uncertainty.
- Do not claim complete AI, complete hero system, complete Human or V9 release.

Verification:

```bash
npm run build
npx tsc --noEmit -p tsconfig.app.json
node --test tests/v9-hero17-archmage-source-boundary.spec.mjs tests/v9-hero17-archmage-branch-contract.spec.mjs tests/v9-hero16-paladin-ai-strategy-closure.spec.mjs
./scripts/cleanup-local-runtime.sh
```

Runtime command safety:
- This is a static/source-boundary task. Do not run browser/runtime tests unless Codex explicitly expands scope.

Closeout requirements:
- Start your final closeout with the exact line: JOB_COMPLETE: <job-id>
- If truly blocked, emit the exact line: JOB_BLOCKED: <job-id>
- Include sections for files changed, verification run, and remaining unknowns.
- End with an exact line that begins with READY_FOR_NEXT_TASK: followed by the next safe continuation.
- Keep the work within the requested scope; do not widen ownership on your own.

Codex closeout accepted:

- GLM created the first source boundary and proof, but Codex found source/phase boundary errors before acceptance.
- Codex corrected Archmage attack mapping: Blizzard Classic lists Attack Type as Hero; this project has no Hero attack type, so Archmage follows the existing Paladin mapping `Hero attack -> AttackType.Normal`, not `AttackType.Magic`.
- Codex corrected Mass Teleport: Classic primary source lists cooldown 20 sec, so adopted value is 20; 15 and 30 remain patch/conflict samples only.
- Codex corrected Water Elemental boundaries: primary source says each cast summons 1 Water Elemental, but does not prove a one-active cap; active cap and `deadUnitRecords` handling are deferred to later Water Elemental runtime contracts.
- Codex split Altar exposure from data seed: `HERO17-DATA1` may add `UNITS.archmage`, but must keep `BUILDINGS.altar_of_kings.trains = ['paladin']`; `HERO17-EXPOSE1` will own the player-visible training entry.
- Verification accepted:
  - `node --test tests/v9-hero17-archmage-source-boundary.spec.mjs tests/v9-hero17-archmage-branch-contract.spec.mjs tests/v9-hero16-paladin-ai-strategy-closure.spec.mjs` -> 88/88 passed.
  - `npm run build` passed.
  - `npx tsc --noEmit -p tsconfig.app.json` passed.
  - `./scripts/cleanup-local-runtime.sh` completed.

### Task 263 — V9 HERO17-DATA1 Archmage unit data seed

Status: `in_progress`.

Owner: GLM-style worker.

Priority: Task262 source boundary is accepted. The next safe adjacent step is the Archmage unit data seed only; do not expose the hero in the Altar command surface yet.

Allowed files:

- `src/game/GameData.ts`
- `docs/V9_HERO17_ARCHMAGE_DATA_SEED.zh-CN.md`
- `tests/v9-hero17-archmage-data-seed.spec.mjs`
- `docs/GLM_READY_TASK_QUEUE.md` only for closeout sync

Goal:

Add the Archmage unit data seed using the accepted Task262 source boundary, without adding ability data, runtime behavior, AI behavior, or Altar command exposure.

Must prove:

1. `UNITS.archmage` exists with accepted source-boundary fields: cost 425/100, trainTime 55, hp 450, speed 3.2, supply 5, attackDamage 21, attackRange 6.0, attackCooldown 2.13, armor 3, sightRange 10, `canGather: false`, maxMana 285, hero initial fields, `attackType: AttackType.Normal`, and `armorType: ArmorType.Heavy`.
2. `BUILDINGS.altar_of_kings.trains` remains exactly `['paladin']`; Archmage is not player-visible from Altar in this task.
3. `GameData.ts` still has no `water_elemental`, `brilliance_aura`, `blizzard`, or `mass_teleport` data.
4. `Game.ts` and `SimpleAI.ts` remain untouched by this task and still contain no Archmage runtime or AI strategy.
5. The data-seed doc references Task262 and records that Altar exposure is deferred to `HERO17-EXPOSE1`.

Forbidden:

- Do not edit `Game.ts`, `SimpleAI.ts`, CSS, assets, package scripts, runtime tests, or board UI.
- Do not modify `BUILDINGS.altar_of_kings.trains`.
- Do not add Water Elemental, Brilliance Aura, Blizzard, or Mass Teleport data.
- Do not implement training runtime, command buttons, AI, visual/audio assets, item/shop/Tavern, other heroes, complete Human, complete hero system, or V9 release claims.

Verification:

```bash
npm run build
npx tsc --noEmit -p tsconfig.app.json
node --test tests/v9-hero17-archmage-data-seed.spec.mjs tests/v9-hero17-archmage-source-boundary.spec.mjs tests/v9-hero17-archmage-branch-contract.spec.mjs tests/v9-hero16-paladin-ai-strategy-closure.spec.mjs
./scripts/cleanup-local-runtime.sh
```

Runtime command safety:
- This is a static/data-seed task. Do not run browser/runtime tests unless Codex explicitly expands scope.

Closeout requirements:
- Start your final closeout with the exact line: JOB_COMPLETE: <job-id>
- If truly blocked, emit the exact line: JOB_BLOCKED: <job-id>
- Include sections for files changed, verification run, and remaining unknowns.
- End with an exact line that begins with READY_FOR_NEXT_TASK: followed by the next safe continuation.
- Keep the work within the requested scope; do not widen ownership on your own.

### Task V3-OPEN1 — Starting Worker Auto-Mine Slice

Status: `accepted`.

Owner: GLM-style worker + Codex review.

Priority: direct user feedback after the latest local play pass.

Allowed files:

- `src/game/Game.ts`
- `tests/first-five-minutes.spec.ts`
- `tests/mining-saturation-regression.spec.ts`
- `tests/rally-contract-regression.spec.ts`
- `docs/GLM_READY_TASK_QUEUE.md` only for closeout sync

Goal:

Make the opening feel less idle by sending the player's starting workers into the gold-mining loop automatically on fresh match start.

Must prove:

1. Fresh starting workers auto-enter the gold loop without waiting for manual clicks.
2. The existing five-worker saturation cap still holds, and overflow behavior does not revert.
3. Rally behavior and explicit player orders still override the default opening assignment cleanly.

Verification:

```bash
npm run build
npx tsc --noEmit -p tsconfig.app.json
./scripts/run-runtime-tests.sh tests/first-five-minutes.spec.ts tests/mining-saturation-regression.spec.ts tests/rally-contract-regression.spec.ts --reporter=list
./scripts/cleanup-local-runtime.sh
```

## Single-Milestone Runway Rule

The current user instruction is to stop treating `M2`-`M7` as top-level visible milestones and keep Codex + GLM moving one real product milestone forward:

`V2 credible page-product vertical slice`

Implications for this queue:

- The current in-progress GLM task must not close into an empty runway.
- Before Codex accepts a GLM closeout, the next highest-priority `ready` task should already be documented.
- `M2-M7` labels remain valid as historical/internal proof, but new GLM work should be framed around the truthful product milestone: front door, battlefield first look, short-loop credibility, and session shell truth.

## Shell Integration Cadence Rule

当前 front-door / session-shell / return-to-menu 线必须按下面的节奏走，避免 GLM 和 Codex 各自积累一套不同的 shell 真相。

### 未 review 上限

硬上限：

```text
completed-but-unreviewed shell slice: 1
in_progress shell implementation slice: 1
```

只要已有 1 个 shell slice 完成但 Codex 尚未 review / sync，GLM 队列可以保留后续 `ready` 任务，但不能 dispatch 下一个 shell implementation slice。

### Codex 必须暂停新 queue refill 的情况

出现任一情况，Codex 先集成，不继续补 shell 新前线：

- GLM 刚提交 front-door、session-shell 或 return-to-menu closeout。
- 上一个 shell closeout 还没有同步到 `CODEX_ACTIVE_QUEUE` 和本队列。
- 同一批 shell 文件连续被多个任务触碰：`index.html`、`src/styles.css`、`src/main.ts`、`src/game/Game.ts`、`src/game/GamePhase.ts`。
- 下一个任务会基于尚未 review 的 shell 状态继续实现。
- `Task 61` return-to-menu 或 `Task 62` re-entry 前，front-door/session-shell baseline 没有重新证明。

集成完成后，才允许 dispatch 下一条 shell implementation task。

### Shell slice regression packs

| Slice family | 适用任务 | 最低回归证明 |
| --- | --- | --- |
| `front-door` | `Task 57-60` | 新 focused spec + `tests/front-door-boot-contract.spec.ts`。若涉及 start/source/manual entry，再加 `tests/menu-shell-start-current-map-contract.spec.ts`、`tests/menu-shell-map-source-truth.spec.ts` 或 `tests/menu-shell-manual-map-entry-contract.spec.ts`。 |
| `session-shell` | pause/setup/results/reload/terminal shell slices | 新 focused spec + `tests/session-shell-transition-matrix.spec.ts`。若触碰 pause/setup/results 具体 seam，还要加对应现有 focused spec。 |
| `return-to-menu` | `Task 61-62` | `tests/session-return-to-menu-contract.spec.ts` + `tests/session-shell-transition-matrix.spec.ts`。`Task 62` 还必须加 `tests/front-door-reentry-start-loop.spec.ts`、`tests/front-door-boot-contract.spec.ts` 和当前 start/source focused spec。 |

如果 required spec 尚不存在，当前 GLM slice 必须创建它；closeout 不能用“后续补测试”代替证明。

## Dispatch Rules

Before sending any task, Codex must check:

```bash
git status --short
./scripts/glm-watch.sh status
```

If Codex has dirty implementation files, GLM must receive a non-overlapping write scope. If GLM is already running, do not send another implementation task into the same session.

All runtime tests must use the locked runner:

```bash
./scripts/run-runtime-tests.sh <spec files> --reporter=list
```

Default GLM closeout requirements:

```bash
npm run build
npx tsc --noEmit -p tsconfig.app.json
./scripts/cleanup-local-runtime.sh
```

GLM may fix bugs it proves with a failing deterministic test, but it must keep the fix minimal and inside the allowed write scope.

## GLM Fit Assessment

Good GLM tasks:

- Runtime regression tests with deterministic assertions.
- Command/resource/pathing/AI logic bugs.
- Small contained repairs after test failure.
- Documentation of verified contracts.
- Mechanical module extraction with tight file ownership.

Bad GLM tasks:

- Subjective visual taste decisions.
- Screenshot/artifact workflows as the main deliverable.
- Broad `Game.ts` rewrites without a narrow contract.
- Asset sourcing/licensing decisions.
- Tasks requiring long live human play-feel judgment.

Important boundary:

```text
GLM does not own “go find materials”.
GLM only becomes useful after Codex approves a material batch and needs catalog/import/fallback/regression work.
```

## GLM Development Task Policy

GLM is not limited to tests.

GLM may own product code when the task is contract-first and file-bounded:

- one product contract
- one small implementation slice
- allowed files listed explicitly
- forbidden files listed explicitly
- acceptance tests or runtime assertions
- repair authority for proven failures inside allowed files

Good development examples:

- build placement agency fix with runtime contract
- death cleanup stale-reference fixes with runtime contract
- placement controller extraction after build agency tests are green
- HUD command enabled/disabled state if assertions can inspect DOM/state
- AI recovery behavior with deterministic simulation proof

Bad development examples:

- "make controls feel better" without a measurable contract
- "make it look like War3" without human gate
- broad `Game.ts` rewrite
- changing scale/camera/visual taste as a side effect of logic work

## Deepening Rule

GLM should go deep inside one bounded branch, not skim many unrelated tasks.

Operational cap:

- at most `1` `in_progress` GLM task
- keep `3-5` `ready` tasks behind it
- prefer continuing the same trunk with the next bounded branch before opening a brand-new trunk

GLM may deepen one level when all are true:

- same capability cluster
- same write-scope family or an explicitly adjacent one
- same validation path
- no new product judgment is required

GLM must escalate back to Codex when any of these happen:

- the problem crosses into a new capability cluster
- the fix needs product or visual taste judgment
- the task turns into asset sourcing / licensing / direction choice
- the right fix appears to require broader architecture changes than the original branch allowed

## Current Stage-A Runway

This is the next bounded runway under the current active trunks.

| Task | Status | Trunk | Scope | Notes |
| --- | --- | --- | --- | --- |
| `Task 36 — Session State Boundary Inventory` | `completed` | `CT1` | inspect current boot / phase / HUD / end-state surfaces and define the smallest safe seam for page-shell state insertion | result: start with shell containers, then split `main.ts` boot, then add session gates in `Game.ts`/`GamePhase.ts` |
| `Task 37 — Shell Container Scaffolding Slice` | `completed` | `CT1` | add dormant shell containers and styles for menu, setup, pause, and results in `index.html` + `src/styles.css` only | completed with no runtime logic changes; build green |
| `Task 38 — Boot Orchestration Split` | `completed` | `CT1` | split `src/main.ts` so runtime-test fast path and shell flow can coexist without breaking `window.__war3Game` or `#map-status` | completed; default boot, runtime-test fast path, W3X auto-load, and manual upload behavior preserved |
| `Task 39 — Session State / Overlay Gate Slice` | `completed` | `CT1` | add session-state and overlay gates in `Game.ts`, with minimal `GamePhase.ts` change only if needed | completed as dormant infrastructure: paused phase, overlay sync, stale terminal-state reset, and gameplay-input suppression landed; existing M4 match-loop regression still green |
| `Task 42 — Session Overlay Contract Pack` | `completed` | `CT1` | add deterministic proof for paused/session-overlay behavior and tighten overlay gating so gameplay input is blocked without painting future shell interaction into a dead corner | completed: pause state, canvas suppression, shell click observability, and resume restoration are now runtime-proven |
| `Task 43 — Pause Shell Action Wiring Slice` | `completed` | `CT1` | turn the pause shell from a clickable container into a minimal usable session shell with a real Resume action | completed: a real Resume button now routes through `resumeGame()` and is runtime-proven |
| `Task 44 — Results Shell Contract Pack` | `superseded` | `CT1` + `CT3` | prove terminal-state shell behavior so victory/defeat produces a stable, truthful results surface without stale pause/session state | superseded by `Task 40`, which now proves victory/defeat/stall against both overlay and results shell |
| `Task 40 — AI Ending Clarity Contract` | `completed` | `CT3` | prove and repair bounded end-state / defeat / stall clarity for short-match closure | completed: `stall` verdict added as a narrow time-cap terminal path, with focused runtime proof |
| `Task 45 — Terminal Shell Reset Contract` | `completed` | `CT1` + `CT3` | prove that terminal entry hides pause shell and that map reload clears stale terminal shell/overlay state | completed: focused runtime spec now proves terminal reset without product-code changes |
| `Task 46 — Current Map Reload Seam Slice` | `completed` | `CT1` + `CT3` | add a real `reloadCurrentMap()` seam that replays the currently loaded map source, without inventing rematch/menu state | completed: `Game` now caches the current parsed map source and can replay it through real `loadMap()` |
| `Task 47 — Results Shell Reload Button Slice` | `completed` | `CT1` + `CT3` | wire one real reload action into `#results-shell` using `reloadCurrentMap()` | completed: results shell now exposes a real reload button, enabled only when a current source exists |
| `Task 48 — Procedural Reload Source Slice` | `completed` | `CT1` + `CT3` | extend the reload seam so the default procedural opening also has a replayable current source | completed: `reloadCurrentMap()` now supports both parsed and procedural sources |
| `Task 49 — Pause Shell Reload Button Slice` | `completed` | `CT1` | wire the same real reload seam into `#pause-shell` | completed: pause shell now exposes both Resume and Reload actions backed by the real session seams |
| `Task 50 — Setup Shell Current Map Action Slice` | `completed` | `CT1` | turn `#setup-shell` into a minimal truthful shell with one current-map action instead of leaving it as a decorative empty container | completed: setup shell now opens as a real session overlay and its action routes through the real current-map reload seam |
| `Task 51 — Pause Shell Entry Hotkey Slice` | `completed` | `CT1` | give the now-truthful pause shell one real player-facing entry seam instead of leaving it runtime-test-only | completed: `Escape` now opens pause during normal play without breaking existing mode-cancel precedence |
| `Task 52 — Pause Shell Exit Hotkey Contract` | `completed` | `CT1` | make the pause shell reversible through keyboard semantics instead of button-only | completed: `Escape` now cleanly dismisses pause without breaking overlay isolation or current-map continuity |
| `Task 53 — Setup Shell Live Entry Slice` | `completed` | `CT1` | stop leaving setup shell as runtime-test-only by adding one truthful live entry seam from an already-real shell | completed: pause-shell now has a Settings button that opens setup-shell through real session seams |
| `Task 54 — Setup Shell Return Path Slice` | `completed` | `CT1` | give setup shell one truthful way back to the live session without forcing reload | completed: setup-shell return button restores prior phase (Playing or Paused) without reload |
| `Task 55 — Results Shell Summary Truth Pack` | `completed` | `CT1` + `CT3` | upgrade results shell from verdict-only to a minimally truthful summary surface | completed: results shell now shows real match time, unit/building counts per side, cleared on reload |
| `Task 56 — Session Shell Transition Matrix Pack` | `completed` | `CT1` | lock the implemented shell lifecycle together before broader front-door work starts | completed: 6/6 transition matrix tests pass — pause/resume/reload/setup/return/results/terminal-reset all proven |
| `Task 41 — 已批准素材目录边界包` | `blocked` | `CT2` | 第一批素材通过来源、授权、风格和回退审批后，再接入目录、导入、回退和回归规则 | 当前卡在素材审批，不是工程实现难度 |

### Task 42 — Session Overlay Contract Pack

Status: `accepted`.

Owner: GLM-style worker + Codex review.

Started: 2026-04-13.

Completed: 2026-04-13.

Priority: prove that the newly introduced paused/session-overlay infrastructure does not trap future shell UX in a dead corner.

Goal:

Add deterministic runtime proof for paused/session-overlay behavior and tighten the input blocker so gameplay surfaces are frozen while future shell surfaces can still receive interaction.

Changed files:

- `src/game/Game.ts`
- `tests/pause-session-overlay-contract.spec.ts`

Verification:

```bash
npm run build
./scripts/run-runtime-tests.sh tests/pause-session-overlay-contract.spec.ts --reporter=list
```

Result:

- `npm run build` passed
- `tests/pause-session-overlay-contract.spec.ts` passed 1/1

Follow-up:

- `Task 43 — Pause Shell Action Wiring Slice`

### Task 43 — Pause Shell Action Wiring Slice

Status: `accepted`.

Owner: GLM-style worker + Codex review.

Started: 2026-04-13.

Completed: 2026-04-13.

Priority: the shell is now provably interactive; the next bounded step is to make it minimally usable instead of leaving it as text-only dormant infrastructure.

Allowed files:

- `index.html`
- `src/styles.css`
- `src/game/Game.ts`
- one focused pause-action runtime spec under `tests/`, or a narrow extension of `tests/pause-session-overlay-contract.spec.ts`

Forbidden files:

- `src/main.ts`
- `src/game/SimpleAI.ts`
- menu/setup/results shell flows

Goal:

Add a real Resume action inside `#pause-shell`, wire it to the actual resume path, and prove that the button works while gameplay canvas input remains blocked during pause.

Verification:

```bash
npm run build
./scripts/run-runtime-tests.sh tests/pause-session-overlay-contract.spec.ts --reporter=list
```

Result:

- `npm run build` passed
- `tests/pause-session-overlay-contract.spec.ts` passed 2/2

Follow-up:

- `Task 44 — Results Shell Contract Pack`

### Task 44 — Results Shell Contract Pack

Status: `superseded`.

Owner: GLM-style worker.

Started: 2026-04-13.

Priority: the project now has a minimally usable pause shell; the next shell-side truth to lock is whether terminal victory/defeat produces a stable results surface instead of only a legacy overlay.

Allowed files:

- `src/game/Game.ts`
- one focused end-state/runtime spec under `tests/`, or a narrow extension of `tests/m4-match-loop-regression.spec.ts`

Forbidden files:

- `src/main.ts`
- `src/game/SimpleAI.ts`
- menu/setup shell flows
- rematch / back-to-menu wiring

Goal:

Prove that terminal victory/defeat activates `#results-shell` with truthful state, does not leave `#pause-shell` visible, and remains stable across the existing terminal-state flow.

Required verification:

```bash
npm run build
./scripts/run-runtime-tests.sh <results shell spec> --reporter=list
```

### Task 40 — AI Ending Clarity Contract

Status: `accepted`.

Owner: GLM-style worker + Codex review.

Started: 2026-04-13.

Completed: 2026-04-13.

Priority: the current game only ends when a townhall dies. There is no explicit stall/timeout verdict, so short matches can freeze into ambiguity without ever producing a clear end-state.

Allowed files:

- `src/game/Game.ts`
- `tests/ai-ending-clarity-contract.spec.ts`
- `docs/GLM_READY_TASK_QUEUE.md` only for closeout status sync

Forbidden files:

- `src/game/SimpleAI.ts`
- `src/main.ts`
- broad AI difficulty or economy redesign
- menu/setup/rematch flows

Goal:

Keep the existing `victory` / `defeat` semantics intact, but add one narrow `stall` verdict path and deterministic runtime proof that the game can reach a truthful terminal state even when no townhall has died.

Verification:

```bash
npm run build
./scripts/run-runtime-tests.sh tests/ai-ending-clarity-contract.spec.ts --reporter=list
```

Result:

- `npm run build` passed
- `tests/ai-ending-clarity-contract.spec.ts` passed 3/3
- `tests/m4-match-loop-regression.spec.ts` passed 4/4 in Codex follow-up verification

Follow-up:

- `Task 45 — Terminal Shell Reset Contract`

### Task 45 — Terminal Shell Reset Contract

Status: `accepted`.

Owner: GLM-style worker + Codex review.

Started: 2026-04-13.

Completed: 2026-04-13.

Priority: terminal truth now exists for victory / defeat / stall, but the remaining shell-side risk is stale session state: pause shell accidentally surviving terminal entry, or old results surfaces leaking through map reload.

Allowed files:

- `src/game/Game.ts`
- one focused runtime spec under `tests/`
- `docs/GLM_READY_TASK_QUEUE.md` only for closeout state sync

Forbidden files:

- `src/main.ts`
- `src/game/SimpleAI.ts`
- rematch / back-to-menu wiring
- new menu/setup/results state machines

Goal:

Prove that entering terminal state hides the pause shell, keeps the terminal shell truthful, and that the existing map reload path clears stale terminal overlay/shell state before play resumes.

Verification:

```bash
npm run build
./scripts/run-runtime-tests.sh tests/terminal-shell-reset-contract.spec.ts --reporter=list
```

Result:

- `npm run build` passed
- `tests/terminal-shell-reset-contract.spec.ts` passed 2/2

Follow-up:

- `Task 46 — Current Map Reload Seam Slice`

### Task 46 — Current Map Reload Seam Slice

Status: `accepted`.

Owner: GLM-style worker + Codex review.

Started: 2026-04-13.

Completed: 2026-04-13.

Priority: the smallest honest post-match action is not fake menu navigation; it is reloading the current map source through the real `loadMap()` path. That seam does not exist yet as a stable public action.

Allowed files:

- `src/game/Game.ts`
- `tests/results-shell-reload-contract.spec.ts`
- `docs/GLM_READY_TASK_QUEUE.md` only for closeout sync

Forbidden files:

- `src/main.ts`
- `src/game/SimpleAI.ts`
- menu/setup/rematch shell wiring
- asset or difficulty changes

Goal:

Cache enough current map source inside `Game` to expose a real `reloadCurrentMap()` action, then prove with a focused runtime spec that it replays the same loaded map source and returns the game to a clean playing state.

Verification:

```bash
npm run build
./scripts/run-runtime-tests.sh tests/results-shell-reload-contract.spec.ts --reporter=list
```

Result:

- `npm run build` passed
- `tests/results-shell-reload-contract.spec.ts` passed 1/1
- `tests/terminal-shell-reset-contract.spec.ts` passed 2/2 in Codex follow-up verification

Follow-up:

- `Task 47 — Results Shell Reload Button Slice`

### Task 47 — Results Shell Reload Button Slice

Status: `accepted`.

Owner: GLM-style worker + Codex takeover finish.

Started: 2026-04-13.

Completed: 2026-04-13.

Priority: the reload seam is now real. The next smallest honest product step is to expose exactly that seam in the results shell, instead of inventing rematch or fake menu flow.

Allowed files:

- `index.html`
- `src/styles.css`
- `src/game/Game.ts`
- one focused runtime spec under `tests/`
- `docs/GLM_READY_TASK_QUEUE.md` only for closeout sync

Forbidden files:

- `src/main.ts`
- `src/game/SimpleAI.ts`
- menu/setup shell flows
- rematch/back-to-menu state machines

Goal:

Add one results-shell reload button that calls the real `reloadCurrentMap()` path when available, keeps terminal shell truth intact before click, and returns the game to a clean playing state after click.

Verification:

```bash
npm run build
./scripts/run-runtime-tests.sh tests/results-shell-reload-button-contract.spec.ts --reporter=list
```

Result:

- Initial worker attempt regressed the results-shell message container and broke both reload-button and reload-seam contracts.
- Codex took over locally, split the results message from the button, added explicit disabled behavior when no current source exists, and reran the affected contract pack.
- `npm run build` passed
- `tests/ai-ending-clarity-contract.spec.ts` passed 3/3
- `tests/results-shell-reload-button-contract.spec.ts` passed 2/2
- `tests/results-shell-reload-contract.spec.ts` passed 1/1
- `tests/terminal-shell-reset-contract.spec.ts` passed 2/2

Follow-up:

- `Task 48 — Procedural Reload Source Slice`

### Task 48 — Procedural Reload Source Slice

Status: `completed`.

Owner: GLM-style worker + Codex takeover finish.

Started: 2026-04-13.

Completed: 2026-04-13.

Priority: the reload seam initially only worked for parsed maps. The next honest extension was to make the default procedural opening replayable through that same seam instead of leaving the default path as a permanent disabled edge case.

Allowed files:

- `src/game/Game.ts`
- `tests/procedural-reload-source-contract.spec.ts`

Forbidden files:

- `src/main.ts`
- `src/game/SimpleAI.ts`
- menu/setup/results shell wiring
- synthetic ParsedMap replay hacks

Goal:

Upgrade `currentMapSource` into a tagged `parsed | procedural` source, add a bounded procedural reset helper, and prove that `reloadCurrentMap()` restores the disturbed procedural opening to the same baseline.

Verification:

```bash
npm run build
./scripts/run-runtime-tests.sh tests/procedural-reload-source-contract.spec.ts --reporter=list
```

Result:

- Initial worker/spec pass found the right implementation seam but the spec still encoded brittle startup assumptions.
- Codex took over locally and corrected the contract shape so it compares the replayed procedural baseline against itself rather than against unstable absolute startup counts.
- `npm run build` remained green on the same code revision.
- `tests/procedural-reload-source-contract.spec.ts` passed 1/1 after the contract correction.

Follow-up:

- `Task 49 — Pause Shell Reload Button Slice`

### Task 49 — Pause Shell Reload Button Slice

Status: `completed`.

Owner: GLM-style worker + Codex takeover finish.

Started: 2026-04-13.

Completed: 2026-04-13.

Priority: both parsed and procedural openings now share one truthful reload seam. The next smallest user-facing step is to expose that same seam inside the pause shell, not only after terminal state.

Allowed files:

- `index.html`
- `src/styles.css`
- `src/game/Game.ts`
- one focused runtime spec under `tests/`
- `docs/GLM_READY_TASK_QUEUE.md` only for closeout sync

Forbidden files:

- `src/main.ts`
- `src/game/SimpleAI.ts`
- menu/setup/results navigation flows
- rematch/back-to-menu state machines

Goal:

Add one pause-shell reload button that calls the real `reloadCurrentMap()` path, keeps pause-shell interaction valid while paused, and returns the game to a clean playing state after click.

Verification:

```bash
npm run build
./scripts/run-runtime-tests.sh tests/pause-session-overlay-contract.spec.ts tests/pause-shell-reload-button-contract.spec.ts tests/results-shell-reload-button-contract.spec.ts tests/procedural-reload-source-contract.spec.ts --reporter=list
```

Result:

- Worker landed the DOM/button wiring in `index.html` and `Game.ts`, but did not finish the focused proof.
- Codex took over locally, added `tests/pause-shell-reload-button-contract.spec.ts`, and tightened the contract around a near-zero restart time instead of a brittle exact-zero assertion on the click path.
- `npm run build` passed
- `tests/pause-session-overlay-contract.spec.ts` passed 2/2
- `tests/pause-shell-reload-button-contract.spec.ts` passed 2/2
- `tests/results-shell-reload-button-contract.spec.ts` passed 2/2
- `tests/procedural-reload-source-contract.spec.ts` passed 1/1

Follow-up:

- `Task 50 — Setup Shell Current Map Action Slice`

### Task 50 — Setup Shell Current Map Action Slice

Status: `completed`.

Owner: GLM-style worker + Codex review.

Started: 2026-04-13.

Completed: 2026-04-13.

Priority: `menu-shell` and `setup-shell` are still empty containers. The smallest honest next step is not a fake main menu, but one real setup-shell action that reuses the already truthful current-map reload seam.

Allowed files:

- `index.html`
- `src/styles.css`
- `src/game/Game.ts`
- `src/game/GamePhase.ts` only if a tiny dedicated setup phase is strictly needed
- one focused runtime spec under `tests/`
- `docs/GLM_READY_TASK_QUEUE.md` only for closeout sync

Forbidden files:

- `src/main.ts`
- `src/game/SimpleAI.ts`
- menu-shell flows
- back-to-menu / full front-door routing
- rematch state machines

Goal:

Make `#setup-shell` openable as a real shell, add one current-map action inside it that routes through the truthful session seam, and prove that the action returns the game to a clean `playing` state with current map source intact.

Required verification:

```bash
npm run build
./scripts/run-runtime-tests.sh tests/setup-shell-contract.spec.ts --reporter=list
```

Changed files:

- `index.html`
- `src/styles.css`
- `src/game/Game.ts`
- `src/game/GamePhase.ts`
- `tests/setup-shell-contract.spec.ts`

Verification result:

- `npm run build` passed
- `./scripts/run-runtime-tests.sh tests/setup-shell-contract.spec.ts --reporter=list` passed 1/1
- `./scripts/run-runtime-tests.sh tests/pause-session-overlay-contract.spec.ts --reporter=list` passed 2/2

Follow-up:

- `Task 51 — Pause Shell Entry Hotkey Slice`

### Task 51 — Pause Shell Entry Hotkey Slice

Status: `completed`.

Owner: GLM-style worker + Codex review.

Started: 2026-04-13.

Completed: 2026-04-13.

Priority: pause shell now has truthful Resume/Reload actions, but it still lacks one real player-facing entry seam. The smallest honest next step is to expose pause through session keyboard semantics without inventing full menu, rematch, or front-door routing.

Allowed files:

- `src/game/Game.ts`
- `src/game/GamePhase.ts` only if a tiny state helper is strictly needed
- one focused runtime spec under `tests/`
- `docs/GLM_READY_TASK_QUEUE.md` only for closeout sync

Forbidden files:

- `index.html`
- `src/styles.css`
- `src/main.ts`
- `src/game/SimpleAI.ts`
- menu-shell flows
- setup-shell flows
- results/rematch/back-to-menu state machines

Goal:

Make the pause shell reachable through one real hotkey path during live play, while preserving current `Escape` precedence for placement/attack-move/rally cancel semantics and keeping the existing pause shell actions truthful.

Required verification:

```bash
npm run build
./scripts/run-runtime-tests.sh tests/pause-shell-entry-hotkey-contract.spec.ts --reporter=list
./scripts/run-runtime-tests.sh tests/pause-session-overlay-contract.spec.ts --reporter=list
```

Changed files:

- `src/game/Game.ts`
- `tests/pause-shell-entry-hotkey-contract.spec.ts`

Verification result:

- `npm run build` passed
- `./scripts/run-runtime-tests.sh tests/pause-shell-entry-hotkey-contract.spec.ts --reporter=list` passed 2/2
- `./scripts/run-runtime-tests.sh tests/pause-session-overlay-contract.spec.ts --reporter=list` passed 2/2

Outcome:

- `Escape` now opens `pause-shell` during normal live play when no placement / attack-move / rally mode is active.
- If placement / attack-move / rally is active, the same keypress still cancels that mode first and does not pause on the same press.
- `pause-resume-button` still routes through the real `resumeGame()` path.

Follow-up:

- `Task 52 — Pause Shell Exit Hotkey Contract`

### Task 52 — Pause Shell Exit Hotkey Contract

Status: `completed`.

Owner: GLM-style worker + Codex review.

Started: 2026-04-13.

Completed: 2026-04-13.

Priority: pause shell can now be entered through real live-play semantics, but it still exits through button-only interaction. The smallest honest next step is to make paused-session exit symmetric through keyboard semantics without widening into a general settings/keybind system.

Allowed files:

- `src/game/Game.ts`
- `src/game/GamePhase.ts` only if a tiny state helper is strictly needed
- one focused runtime spec under `tests/`
- `docs/GLM_READY_TASK_QUEUE.md` only for closeout sync

Forbidden files:

- `index.html`
- `src/styles.css`
- `src/main.ts`
- `src/game/SimpleAI.ts`
- menu-shell flows
- setup-shell flows
- results/rematch/back-to-menu state machines

Goal:

Make the paused session reversible through one real hotkey path while preserving gameplay-input blocking and keeping pause-shell state isolated from setup/results state.

Required verification:

```bash
npm run build
./scripts/run-runtime-tests.sh tests/pause-shell-exit-hotkey-contract.spec.ts --reporter=list
./scripts/run-runtime-tests.sh tests/pause-session-overlay-contract.spec.ts --reporter=list
./scripts/run-runtime-tests.sh tests/pause-shell-entry-hotkey-contract.spec.ts --reporter=list
```

Changed files:

- `src/game/Game.ts`
- `tests/pause-shell-exit-hotkey-contract.spec.ts`

Verification result:

- `npm run build` passed
- `./scripts/run-runtime-tests.sh tests/pause-shell-exit-hotkey-contract.spec.ts --reporter=list` passed 1/1
- `./scripts/run-runtime-tests.sh tests/pause-session-overlay-contract.spec.ts --reporter=list` passed 2/2
- `./scripts/run-runtime-tests.sh tests/pause-shell-entry-hotkey-contract.spec.ts --reporter=list` passed 2/2

Outcome:

- `Escape` now resumes from paused state through a real hotkey path.
- While paused, gameplay input stays blocked.
- Setup/results shells stay hidden and `currentMapSource` stays intact during pause dismissal.

Follow-up:

- `Task 53 — Setup Shell Live Entry Slice`

### Task 53 — Setup Shell Live Entry Slice

Status: `completed`.

Owner: GLM-style worker + Codex review.

Started: 2026-04-13.

Completed: 2026-04-13.

Priority: setup shell is now truthful as a session overlay and has a real current-map action, but it is still opened only through test seam. The next bounded step is to expose one live entry path from an already-real shell without widening into front-door or menu routing.

Allowed files:

- `index.html`
- `src/styles.css`
- `src/game/Game.ts`
- `src/game/GamePhase.ts` only if a tiny dedicated helper is strictly needed
- one focused runtime spec under `tests/`
- `docs/GLM_READY_TASK_QUEUE.md` only for closeout sync

Forbidden files:

- `src/main.ts`
- `src/game/SimpleAI.ts`
- menu-shell flows
- full front-door routing
- back-to-menu / rematch state machines

Goal:

Make `setup-shell` reachable through one already-real shell path during live play, while preserving current pause/results truth and keeping the setup action routed through the real current-map seam.

Changed files:

- `index.html`: added `#pause-setup-button` ("设置") inside pause-shell body
- `src/game/Game.ts`: added `elPauseSetupButton` field, wired click to `openSetupShell()`, relaxed `openSetupShell()` guard to allow entry from both Playing and Paused phases
- `tests/setup-shell-live-entry-contract.spec.ts` (new)

Verification:

```bash
npm run build
./scripts/run-runtime-tests.sh tests/setup-shell-live-entry-contract.spec.ts --reporter=list
./scripts/run-runtime-tests.sh tests/setup-shell-contract.spec.ts --reporter=list
./scripts/run-runtime-tests.sh tests/pause-session-overlay-contract.spec.ts --reporter=list
```

Result:

- `npm run build` passed
- `tests/setup-shell-live-entry-contract.spec.ts` passed 3/3
- `tests/setup-shell-contract.spec.ts` passed 1/1
- `tests/pause-session-overlay-contract.spec.ts` passed 2/2

Follow-up:

- `Task 54 — Setup Shell Return Path Slice`

### Task 54 — Setup Shell Return Path Slice

Status: `completed`.

Owner: GLM-style worker + Codex review.

Started: 2026-04-13.

Completed: 2026-04-13.

Priority: setup-shell now has a live entry path, but it is still a one-way trip. The user must be able to return without reloading the map.

Changed files:

- `index.html`: added `#setup-return-button` ("返回") inside setup-shell body
- `src/game/Game.ts`: added `elSetupReturnButton` field + `previousPhaseBeforeSetup` state field, wired return button to `closeSetupShell()`, updated `openSetupShell()` to save prior phase, updated `closeSetupShell()` to restore prior phase instead of always going to Playing
- `tests/setup-shell-return-path-contract.spec.ts` (new)

Verification:

```bash
npm run build
./scripts/run-runtime-tests.sh tests/setup-shell-return-path-contract.spec.ts --reporter=list
./scripts/run-runtime-tests.sh tests/setup-shell-contract.spec.ts --reporter=list
./scripts/run-runtime-tests.sh tests/pause-session-overlay-contract.spec.ts --reporter=list
```

Result:

- `npm run build` passed
- `tests/setup-shell-return-path-contract.spec.ts` passed 3/3
- `tests/setup-shell-contract.spec.ts` passed 1/1
- `tests/pause-session-overlay-contract.spec.ts` passed 2/2
- `tests/setup-shell-live-entry-contract.spec.ts` passed 3/3 (adjacent affected)

Follow-up:

- `Task 55 — Results Shell Summary Truth Pack`

### Task 55 — Results Shell Summary Truth Pack

Status: `completed`.

Owner: GLM-style worker + Codex review.

Started: 2026-04-13.

Completed: 2026-04-13.

Priority: results shell shows only a verdict label. A truthful summary surface is needed before the shell lifecycle can be locked.

Changed files:

- `index.html`: added `#results-shell-summary` div inside results-shell body
- `src/styles.css`: added `.page-shell-summary` styling
- `src/game/Game.ts`: added `elResultsShellSummary` field, populated in `endGame()` with real match state (duration, unit/building counts per side), cleared in `clearGameOverOverlay()`
- `tests/results-shell-summary-contract.spec.ts` (new)

Verification:

```bash
npm run build
./scripts/run-runtime-tests.sh tests/results-shell-summary-contract.spec.ts --reporter=list
./scripts/run-runtime-tests.sh tests/results-shell-reload-button-contract.spec.ts --reporter=list
./scripts/run-runtime-tests.sh tests/ai-ending-clarity-contract.spec.ts --reporter=list
```

Result:

- `npm run build` passed
- `tests/results-shell-summary-contract.spec.ts` passed 3/3
- `tests/results-shell-reload-button-contract.spec.ts` passed 2/2
- `tests/ai-ending-clarity-contract.spec.ts` passed 3/3

Follow-up:

- `Task 56 — Session Shell Transition Matrix Pack`

### Task 56 — Session Shell Transition Matrix Pack

Status: `completed`.

Owner: GLM-style worker + Codex review.

Started: 2026-04-13.

Completed: 2026-04-13.

Priority: lock the implemented shell lifecycle together as a hard floor before any future front-door work.

Changed files:

- `tests/session-shell-transition-matrix.spec.ts` (new)
- No product code changes needed — all transitions pass with existing implementation.

Verification:

```bash
npm run build
./scripts/run-runtime-tests.sh tests/session-shell-transition-matrix.spec.ts --reporter=list
```

Result:

- `npm run build` passed
- `tests/session-shell-transition-matrix.spec.ts` passed 6/6

Proven transitions:

1. pause -> resume returns to playing
2. pause -> reload returns to clean playing state
3. pause -> setup -> return -> pause round-trip
4. setup -> start current map reloads and returns to playing
5. results -> reload returns to clean playing state
6. terminal entry hides pause and setup residue

### Task 57 — Front-Door Boot Gate Contract

Status: `completed`.

Owner: GLM-style worker + Codex review.

Started: 2026-04-13.

Completed: 2026-04-13.

Priority: Stage A proved the in-match shell loop. The next honest product-shell step is to stop sending a normal visitor straight into gameplay.

Changed files:

- `src/main.ts`: normal boot now calls `game.pauseGame()` and shows `#menu-shell`; runtime-test mode unchanged; removed automatic test-map load in favor of front-door gate
- `tests/front-door-boot-contract.spec.ts` (new)

Verification:

```bash
npm run build
./scripts/run-runtime-tests.sh tests/front-door-boot-contract.spec.ts tests/session-shell-transition-matrix.spec.ts --reporter=list
./scripts/cleanup-local-runtime.sh
```

Closeout:

- GLM job `glm-mnzn27md-e8soq9` completed the V9 feedback triage proof after one failing proof iteration and a local fix.
- Codex local verification passed: `npm run build`, `npx tsc --noEmit -p tsconfig.app.json`, `node --test tests/v9-hotfix-triage-proof.spec.mjs` 5/5, `./scripts/cleanup-local-runtime.sh`, and no Vite / Playwright / Chromium / runtime leftovers.
- Accepted as V9-HOTFIX1 engineering evidence only. It proves the route shape with sample feedback; real tester feedback remains async and can reopen gates.

Closeout:

- GLM job `glm-mnzmkthf-x0grx4` 完成 RC 稳定性证明包：新增 V8 RC 聚合测试，并把 `v8-rc` shard 接入 `scripts/run-runtime-suite.sh`。
- Codex 本地复核通过：`bash -n scripts/run-runtime-suite.sh`、`npm run build`、`npx tsc --noEmit -p tsconfig.app.json`、`./scripts/run-runtime-tests.sh tests/v8-release-candidate-stability.spec.ts --reporter=list` 5/5、`./scripts/cleanup-local-runtime.sh`、无 Vite / Playwright / Chromium / runtime 残留。
- Accepted as V8-RC1 engineering evidence only. It does not approve public release, full War3 parity, final art, complete Human roster, campaign, multiplayer, ladder, replay, or user/tester verdict.

Result:

- `npm run build` passed
- `tests/front-door-boot-contract.spec.ts` passed 3/3 (normal boot menu, runtime-test bypass, map-loader accessible)
- `tests/session-shell-transition-matrix.spec.ts` passed 6/6 (no regression)

Follow-up:

- `Task 58 — Menu Shell Start Current Map Slice`

### Task 58 — Menu Shell Start Current Map Slice

Status: `completed`.

Owner: GLM-style worker + Codex review.

Priority: once normal boot lands on a truthful front door, the menu needs one real start action instead of being a decorative container.

Allowed files:

- `index.html`
- `src/styles.css`
- `src/main.ts`
- `tests/menu-shell-start-current-map-contract.spec.ts`
- `docs/GLM_READY_TASK_QUEUE.md` only for closeout sync

Forbidden files:

- `src/game/Game.ts`
- `src/game/SimpleAI.ts`
- fake mode-select flow
- fake loading screen
- back-to-menu / rematch state machines

Goal:

Give `#menu-shell` one explicit start action that uses the already truthful current-map/procedural seam.

Must prove:

1. the menu exposes one real start action
2. activating it enters active play through the real boot path
3. the menu stops being the active shell after gameplay starts

Verification:

```bash
npm run build
./scripts/run-runtime-tests.sh tests/menu-shell-start-current-map-contract.spec.ts tests/front-door-boot-contract.spec.ts --reporter=list
./scripts/cleanup-local-runtime.sh
```

Follow-up:

- `Task 59 — Menu Shell Current Map Source Truth Pack`

### Task 59 — Menu Shell Current Map Source Truth Pack

Status: `completed`.

Owner: GLM-style worker + Codex review.

Priority: once the menu can actually start a match, it must also be truthful about which source it will launch.

Allowed files:

- `index.html`
- `src/styles.css`
- `src/main.ts`
- `tests/menu-shell-map-source-truth.spec.ts`
- `docs/GLM_READY_TASK_QUEUE.md` only for closeout sync

Forbidden files:

- `src/game/Game.ts`
- `src/game/SimpleAI.ts`
- asset sourcing / licensing work
- fake campaign / briefing copy
- mode-select branching

Goal:

Keep the front door honest about the current map source.

Must prove:

1. default/procedural source is shown truthfully before manual upload
2. manual map selection updates the visible source truthfully
3. the visible source and the eventual start action stay aligned

Verification:

```bash
npm run build
./scripts/run-runtime-tests.sh tests/menu-shell-map-source-truth.spec.ts tests/menu-shell-start-current-map-contract.spec.ts --reporter=list
./scripts/cleanup-local-runtime.sh
```

Follow-up:

- `Task 60 — Menu Shell Manual Map Entry Slice`

### Task 60 — Menu Shell Manual Map Entry Slice

Status: `completed`.

Owner: GLM-style worker + Codex review.

Priority: once the menu can start and name the current source truthfully, the next honest step is letting the player change that source from the menu itself.

Allowed files:

- `index.html`
- `src/styles.css`
- `src/main.ts`
- `tests/menu-shell-manual-map-entry-contract.spec.ts`
- `docs/GLM_READY_TASK_QUEUE.md` only for closeout sync

Forbidden files:

- `src/game/Game.ts`
- `src/game/SimpleAI.ts`
- asset sourcing / licensing work
- fake skirmish / campaign flow
- hidden auto-start after upload

Goal:

Expose one truthful manual map-selection entry from `#menu-shell` using the existing upload/load seam.

Must prove:

1. the menu exposes one manual map-selection entry
2. choosing a map updates the current source while the menu stays in control
3. manual selection does not auto-start gameplay or bypass the front door

Verification:

```bash
npm run build
./scripts/run-runtime-tests.sh tests/menu-shell-manual-map-entry-contract.spec.ts tests/menu-shell-map-source-truth.spec.ts --reporter=list
./scripts/cleanup-local-runtime.sh
```

Follow-up:

- `Task 61 — Session Return-To-Menu Seam Slice`

### Task 61 — Session Return-To-Menu Seam Slice

Status: `completed`.

Owner: GLM-style worker + Codex review.

Priority: the front door is not a real product state until a live session can return to it through a truthful seam.

Allowed files:

- `index.html`
- `src/styles.css`
- `src/main.ts`
- `src/game/Game.ts`
- `src/game/GamePhase.ts`
- `tests/session-return-to-menu-contract.spec.ts`
- `docs/GLM_READY_TASK_QUEUE.md` only for closeout sync

Forbidden files:

- `src/game/SimpleAI.ts`
- fake rematch tree
- fake loading / briefing screen
- asset catalog work

Goal:

Give pause/results one truthful return-to-menu action that lands back on `#menu-shell` without stale live-session state.

Must prove:

1. a live session can return to the front door through a real action
2. returning to menu leaves gameplay inactive and front door visible
3. stale pause/results state does not leak into the menu shell

Verification:

```bash
npm run build
./scripts/run-runtime-tests.sh tests/session-return-to-menu-contract.spec.ts tests/session-shell-transition-matrix.spec.ts --reporter=list
./scripts/cleanup-local-runtime.sh
```

Follow-up:

- `Task 62 — Front-Door Re-entry Start Loop Pack`

### Task 62 — Front-Door Re-entry Start Loop Pack

Status: `completed`.

Owner: GLM-style worker + Codex review.

Priority: once return-to-menu is real, the start loop must be proven re-entrant so the menu is a stable session hub instead of a one-shot boot page.

Allowed files:

- `index.html`
- `src/styles.css`
- `src/main.ts`
- `src/game/Game.ts`
- `src/game/GamePhase.ts`
- `tests/front-door-reentry-start-loop.spec.ts`
- `docs/GLM_READY_TASK_QUEUE.md` only for closeout sync

Forbidden files:

- `src/game/SimpleAI.ts`
- fake campaign / mode tree
- asset sourcing / licensing work
- broad shell redesign

Goal:

Prove that after returning to menu, the front door can start the next session again through the same truthful source path.

Must prove:

1. the menu still shows the correct current source after a return-to-menu path
2. starting again from the front door re-enters play cleanly
3. stale menu / pause / results state does not leak into the restarted session

Verification:

```bash
npm run build
./scripts/run-runtime-tests.sh tests/front-door-reentry-start-loop.spec.ts tests/session-return-to-menu-contract.spec.ts --reporter=list
./scripts/cleanup-local-runtime.sh
```

### Task 63 — Menu Shell Mode Truth Boundary Slice

Status: `completed`.

Owner: GLM-style worker + Codex review.

Priority: auto-captured from the adjacent Stage-B front-door runway when the live queue dropped below the ready floor.

Allowed files:

- ``index.html``
- ``src/styles.css``
- ``src/main.ts``
- ``tests/menu-shell-mode-truth-contract.spec.ts``
- `docs/GLM_READY_TASK_QUEUE.md` only for closeout sync

Goal:

Make the front door honest about the current playable entry mode without inventing a fake mode-select tree.

Must prove:

1. The menu names the current playable entry truthfully.
2. No fake mode-select branch is implied by the visible shell.
3. The shown mode stays aligned with the real start path before and after return-to-menu.

Verification:

```bash
npm run build
npx tsc --noEmit -p tsconfig.app.json
./scripts/run-runtime-tests.sh <focused spec> --reporter=list
./scripts/cleanup-local-runtime.sh
```

### Task 64 — Help / Controls Shell Entry Slice

Status: `completed`.

Owner: GLM-style worker + Codex review.

Priority: auto-captured from the adjacent Stage-B front-door runway when the live queue dropped below the ready floor.

Allowed files:

- ``index.html``
- ``src/styles.css``
- ``src/main.ts``
- ``tests/help-shell-entry-contract.spec.ts``
- `docs/GLM_READY_TASK_QUEUE.md` only for closeout sync

Goal:

Expose one truthful help / controls surface from the menu or pause shell using only controls that are actually implemented.

Must prove:

1. Help / controls is reachable from a real shell state.
2. It only claims implemented controls truthfully.
3. Closing help returns to the prior shell state without leaking stale overlay state.

Verification:

```bash
npm run build
npx tsc --noEmit -p tsconfig.app.json
./scripts/run-runtime-tests.sh <focused spec> --reporter=list
./scripts/cleanup-local-runtime.sh
```

### Task 65 — Settings Shell Truth Boundary Slice

Status: `completed`.

Owner: GLM-style worker + Codex review.

Priority: auto-captured from the adjacent Stage-B front-door runway when the live queue dropped below the ready floor.

Allowed files:

- ``index.html``
- ``src/styles.css``
- ``src/main.ts``
- ``tests/settings-shell-truth-contract.spec.ts``
- `docs/GLM_READY_TASK_QUEUE.md` only for closeout sync

Goal:

Expose one truthful settings surface without pretending unsupported graphics/audio/control systems already exist.

Must prove:

1. Settings is reachable from a real shell state.
2. Only implemented or explicitly disabled options are shown.
3. Closing settings returns to the prior shell state without changing session truth.

Verification:

```bash
npm run build
npx tsc --noEmit -p tsconfig.app.json
./scripts/run-runtime-tests.sh <focused spec> --reporter=list
./scripts/cleanup-local-runtime.sh
```

### Task 66 — Pre-Match Briefing Truth Slice

Status: `completed`.

Owner: GLM-style worker + Codex review.

Priority: auto-captured from the adjacent Stage-B front-door runway when the live queue dropped below the ready floor.

Allowed files:

- ``index.html``
- ``src/styles.css``
- ``src/main.ts``
- ``tests/pre-match-briefing-truth-contract.spec.ts``
- `docs/GLM_READY_TASK_QUEUE.md` only for closeout sync

Goal:

Add one truthful pre-match briefing/loading seam before live play so the product no longer jumps straight from front door to battlefield with no understanding layer.

Must prove:

1. Normal front-door start passes through a visible briefing/loading shell.
2. The shell only shows truthful map / objective / controls information, with no fake campaign or cinematic theater.
3. Briefing state does not leak into the next session or back-to-menu path.

Verification:

```bash
npm run build
npx tsc --noEmit -p tsconfig.app.json
./scripts/run-runtime-tests.sh <focused spec> --reporter=list
./scripts/cleanup-local-runtime.sh
```

### Task 67 — Mode Select Placeholder Truth Slice

Status: `completed`.

Owner: GLM-style worker + Codex review.

Priority: auto-captured from the adjacent Stage-B front-door runway when the live queue dropped below the ready floor.

Allowed files:

- ``index.html``
- ``src/styles.css``
- ``src/main.ts``
- ``tests/mode-select-placeholder-truth-contract.spec.ts``
- `docs/GLM_READY_TASK_QUEUE.md` only for closeout sync

Goal:

Expose one real mode-select shell from the front door while keeping only the actually implemented path enabled.

Must prove:

1. The front door can enter a distinct mode-select shell.
2. Only implemented modes are actionable; unimplemented modes are absent or explicitly disabled truthfully.
3. Choosing the implemented mode returns to the correct setup/front-door path without hidden auto-start.

Verification:

```bash
npm run build
npx tsc --noEmit -p tsconfig.app.json
./scripts/run-runtime-tests.sh <focused spec> --reporter=list
./scripts/cleanup-local-runtime.sh
```

### Task 68 — Manual Map Reset Truth Slice

Status: `completed`.

Owner: GLM-style worker + Codex review.

Priority: auto-captured from the adjacent Stage-B front-door runway when the live queue dropped below the ready floor.

Allowed files:

- ``index.html``
- ``src/styles.css``
- ``src/main.ts``
- ``tests/menu-shell-map-reset-contract.spec.ts``
- `docs/GLM_READY_TASK_QUEUE.md` only for closeout sync

Goal:

After a manual map has been selected, expose one truthful reset path back to the default/procedural source.

Must prove:

1. A real clear/reset action exists after manual map selection.
2. Reset returns the visible source label and start path to the default/procedural truth.
3. Reset does not auto-start gameplay or leave stale file metadata in the shell.

Verification:

```bash
npm run build
npx tsc --noEmit -p tsconfig.app.json
./scripts/run-runtime-tests.sh <focused spec> --reporter=list
./scripts/cleanup-local-runtime.sh
```

### Task 69 — Shell Backstack Truth Pack

Status: `completed`.

Owner: GLM-style worker + Codex review.

Priority: auto-captured from the adjacent Stage-B front-door runway when the live queue dropped below the ready floor.

Allowed files:

- ``index.html``
- ``src/styles.css``
- ``src/main.ts``
- ``tests/shell-backstack-truth-contract.spec.ts``
- `docs/GLM_READY_TASK_QUEUE.md` only for closeout sync

Goal:

Make menu-level secondary shells return to their prior shell truthfully instead of hard-jumping to a guessed destination.

Must prove:

1. Help, settings, and mode-select return to the real prior shell state.
2. Nested shell transitions do not strand hidden overlays or stale focus state.
3. Back / close semantics do not leak into live gameplay controls while a menu-level shell is open.

Verification:

```bash
npm run build
npx tsc --noEmit -p tsconfig.app.json
./scripts/run-runtime-tests.sh <focused spec> --reporter=list
./scripts/cleanup-local-runtime.sh
```

### Task 70 — Briefing Continue Start Seam

Status: `completed`.

Owner: GLM-style worker + Codex review.

Priority: auto-captured from the adjacent Stage-B front-door runway when the live queue dropped below the ready floor.

Allowed files:

- ``index.html``
- ``src/styles.css``
- ``src/main.ts``
- ``tests/briefing-continue-start-contract.spec.ts``
- `docs/GLM_READY_TASK_QUEUE.md` only for closeout sync

Goal:

Turn the new pre-match briefing from a passive flash state into one truthful continue/start seam before live play.

Must prove:

1. Starting from the front door enters briefing before live play.
2. An explicit continue/start action leaves briefing and enters gameplay cleanly.
3. Return-to-menu, rematch, or reload paths do not leak stale briefing state or bypass the intended seam unexpectedly.

Verification:

```bash
npm run build
npx tsc --noEmit -p tsconfig.app.json
./scripts/run-runtime-tests.sh <focused spec> --reporter=list
./scripts/cleanup-local-runtime.sh
```

### Task 71 — Briefing Source Truth Pack

Status: `completed`.

Owner: GLM-style worker + Codex review.

Priority: auto-captured from the adjacent Stage-B front-door runway when the live queue dropped below the ready floor.

Allowed files:

- ``index.html``
- ``src/styles.css``
- ``src/main.ts``
- ``tests/briefing-source-truth-contract.spec.ts``
- `docs/GLM_READY_TASK_QUEUE.md` only for closeout sync

Goal:

Keep the briefing shell aligned with the real current source and entry mode after manual map changes, resets, and return-to-menu.

Must prove:

1. Briefing reflects the real current source and entry mode for default and manual-map paths.
2. Resetting or changing the source updates the next briefing truthfully.
3. Return-to-menu does not leave stale briefing source data behind.

Verification:

```bash
npm run build
npx tsc --noEmit -p tsconfig.app.json
./scripts/run-runtime-tests.sh <focused spec> --reporter=list
./scripts/cleanup-local-runtime.sh
```

### Task 72 — Secondary Shell Escape/Back Contract

Status: `completed`.

Owner: GLM-style worker + Codex review.

Priority: auto-captured from the adjacent Stage-B front-door runway when the live queue dropped below the ready floor.

Allowed files:

- ``index.html``
- ``src/styles.css``
- ``src/main.ts``
- ``tests/menu-shell-escape-back-contract.spec.ts``
- `docs/GLM_READY_TASK_QUEUE.md` only for closeout sync

Goal:

Make escape/back semantics truthful across menu-level secondary shells without leaking into gameplay controls.

Must prove:

1. Escape/back closes the current secondary shell or returns to the real prior shell state.
2. Escape/back from front-door shell states does not accidentally pause, resume, or start gameplay.
3. Repeated back actions cannot strand hidden overlays or stale focus.

Verification:

```bash
npm run build
npx tsc --noEmit -p tsconfig.app.json
./scripts/run-runtime-tests.sh <focused spec> --reporter=list
./scripts/cleanup-local-runtime.sh
```

### Task 73 — Front-Door Source Persistence Slice

Status: `completed`.

Owner: GLM-style worker + Codex review.

Priority: auto-captured from the adjacent Stage-B front-door runway when the live queue dropped below the ready floor.

Allowed files:

- ``index.html``
- ``src/styles.css``
- ``src/main.ts``
- ``tests/front-door-source-persistence-contract.spec.ts``
- `docs/GLM_READY_TASK_QUEUE.md` only for closeout sync

Goal:

Keep the front-door shell truthful about the current source and mode while navigating through non-start shell pages in the same browser session.

Must prove:

1. Current source and mode survive navigation through mode-select, help, and settings without hidden resets.
2. Return-to-menu restores the last truthful front-door shell state.
3. A manual reset path clears the persisted source state truthfully.

Verification:

```bash
npm run build
npx tsc --noEmit -p tsconfig.app.json
./scripts/run-runtime-tests.sh <focused spec> --reporter=list
./scripts/cleanup-local-runtime.sh
```

### Task 74 — Menu Action Availability Truth Pack

Status: `completed`.

Owner: GLM-style worker + Codex review.

Priority: auto-captured from the adjacent Stage-B front-door runway when the live queue dropped below the ready floor.

Allowed files:

- ``index.html``
- ``src/styles.css``
- ``src/main.ts``
- ``tests/menu-action-availability-truth.spec.ts``
- `docs/GLM_READY_TASK_QUEUE.md` only for closeout sync

Goal:

Make front-door action enabled/disabled states line up with the real currently implemented routes.

Must prove:

1. Only implemented routes are actionable.
2. Disabled or unavailable actions are labeled truthfully instead of pretending full support.
3. Action availability updates correctly after source, mode, or shell-state changes.

Verification:

```bash
npm run build
npx tsc --noEmit -p tsconfig.app.json
./scripts/run-runtime-tests.sh <focused spec> --reporter=list
./scripts/cleanup-local-runtime.sh
```

### Task 75 — Front-Door Last Session Summary Slice

Status: `completed`.

Owner: GLM-style worker + Codex review.

Priority: auto-captured from the adjacent Stage-B front-door runway when the live queue dropped below the ready floor.

Allowed files:

- ``index.html``
- ``src/styles.css``
- ``src/main.ts``
- ``tests/front-door-last-session-summary-contract.spec.ts``
- `docs/GLM_READY_TASK_QUEUE.md` only for closeout sync

Goal:

Expose one minimal truthful last-session summary on the front door after return-to-menu, without inventing metagame or campaign framing.

Must prove:

1. Returning to menu can show the last session outcome/source truthfully.
2. The summary clears or updates correctly on a new session/reset path.
3. No stale session summary leaks across unrelated shell navigation.

Verification:

```bash
npm run build
npx tsc --noEmit -p tsconfig.app.json
./scripts/run-runtime-tests.sh <focused spec> --reporter=list
./scripts/cleanup-local-runtime.sh
```

### Task 76 — Mode-Select Disabled Branch Rationale Pack

Status: `completed`.

Owner: GLM-style worker + Codex review.

Priority: auto-captured from the adjacent Stage-B front-door runway when the live queue dropped below the ready floor.

Allowed files:

- ``index.html``
- ``src/styles.css``
- ``src/main.ts``
- ``tests/mode-select-disabled-branches-contract.spec.ts``
- `docs/GLM_READY_TASK_QUEUE.md` only for closeout sync

Goal:

If mode-select shows unavailable branches, make their rationale truthful and non-actionable.

Must prove:

1. Unavailable mode branches are absent or explicitly disabled with truthful wording.
2. Activating a disabled branch cannot start gameplay or corrupt shell state.
3. The currently implemented branch remains visually and behaviorally clear.

Verification:

```bash
npm run build
npx tsc --noEmit -p tsconfig.app.json
./scripts/run-runtime-tests.sh <focused spec> --reporter=list
./scripts/cleanup-local-runtime.sh
```

### Task 77 — Front-Door Last Session Summary Reset Contract

Status: `completed`.

Owner: GLM-style worker + Codex review.

Priority: auto-captured from the adjacent Stage-B front-door runway when the live queue dropped below the ready floor.

Allowed files:

- ``index.html``
- ``src/styles.css``
- ``src/main.ts``
- ``tests/front-door-last-session-summary-reset-contract.spec.ts``
- `docs/GLM_READY_TASK_QUEUE.md` only for closeout sync

Goal:

If the front door shows a last-session summary, make its reset and overwrite behavior truthful across new sessions and source changes.

Must prove:

1. The next session outcome updates or replaces the last-session summary truthfully.
2. Manual source reset/change clears or relabels stale summary data correctly.
3. Summary state does not survive hard boot or runtime-test bypass in the wrong context.

Verification:

```bash
npm run build
npx tsc --noEmit -p tsconfig.app.json
./scripts/run-runtime-tests.sh <focused spec> --reporter=list
./scripts/cleanup-local-runtime.sh
```

### Task 78 — Menu Primary Action Focus Contract

Status: `completed`.

Owner: GLM-style worker + Codex review.

Priority: auto-captured from the adjacent Stage-B front-door runway when the live queue dropped below the ready floor.

Allowed files:

- ``index.html``
- ``src/styles.css``
- ``src/main.ts``
- ``tests/menu-primary-action-focus-contract.spec.ts``
- `docs/GLM_READY_TASK_QUEUE.md` only for closeout sync

Goal:

Keep front-door and mode-select primary action focus aligned with the real actionable route as more shell surfaces accumulate.

Must prove:

1. Visible shell states focus the truthful primary action by default.
2. Disabled or unavailable routes cannot become the primary focused action.
3. Switching shell states updates focus without leaving hidden or stale targets behind.

Verification:

```bash
npm run build
npx tsc --noEmit -p tsconfig.app.json
./scripts/run-runtime-tests.sh <focused spec> --reporter=list
./scripts/cleanup-local-runtime.sh
```

### Task 79 — Shell Visible-State Exclusivity Pack

Status: `completed`.

Owner: GLM-style worker + Codex review.

Priority: auto-captured from the adjacent Stage-B front-door runway when the live queue dropped below the ready floor.

Allowed files:

- ``index.html``
- ``src/styles.css``
- ``src/main.ts``
- ``tests/shell-visible-state-exclusivity-contract.spec.ts``
- `docs/GLM_READY_TASK_QUEUE.md` only for closeout sync

Goal:

Keep menu-level shell states mutually exclusive so accumulating front-door/help/settings/mode-select/briefing surfaces do not overlap or leak.

Must prove:

1. Only one menu-level shell surface is visible at a time.
2. Switching between shell surfaces hides the previous one cleanly.
3. Return-to-menu and front-door re-entry clear stale combined shell visibility state.

Verification:

```bash
npm run build
npx tsc --noEmit -p tsconfig.app.json
./scripts/run-runtime-tests.sh <focused spec> --reporter=list
./scripts/cleanup-local-runtime.sh
```

### Task 80 — Front-Door Session Summary Dismiss Contract

Status: `completed`.

Owner: GLM-style worker + Codex review.

Priority: auto-captured from the adjacent Stage-B front-door runway when the live queue dropped below the ready floor.

Allowed files:

- ``index.html``
- ``src/styles.css``
- ``src/main.ts``
- ``tests/front-door-session-summary-dismiss-contract.spec.ts``
- `docs/GLM_READY_TASK_QUEUE.md` only for closeout sync

Goal:

If the front door shows last-session summary state, make dismiss/clear behavior truthful without corrupting the underlying source or mode state.

Must prove:

1. Dismissing the last-session summary hides only the summary, not the underlying front-door state.
2. The next real session outcome can repopulate the summary truthfully.
3. Dismiss/clear does not mutate current mode/source selection unexpectedly.

Verification:

```bash
npm run build
npx tsc --noEmit -p tsconfig.app.json
./scripts/run-runtime-tests.sh <focused spec> --reporter=list
./scripts/cleanup-local-runtime.sh
```

### Task 81 — Secondary Shell Copy Truth Pack

Status: `completed`.

Owner: GLM-style worker + Codex review.

Priority: auto-captured from the adjacent Stage-B front-door runway when the live queue dropped below the ready floor.

Allowed files:

- ``index.html``
- ``src/styles.css``
- ``src/main.ts``
- ``tests/secondary-shell-copy-truth-contract.spec.ts``
- `docs/GLM_READY_TASK_QUEUE.md` only for closeout sync

Goal:

Keep visible shell copy aligned with implemented behavior as menu/help/settings/briefing surfaces accumulate.

Must prove:

1. Secondary shell titles and helper text only claim implemented behavior.
2. Disabled or missing routes are described truthfully.
3. Copy updates correctly when the same shell is opened from different truthful states.

Verification:

```bash
npm run build
npx tsc --noEmit -p tsconfig.app.json
./scripts/run-runtime-tests.sh <focused spec> --reporter=list
./scripts/cleanup-local-runtime.sh
```

### Task V2-PS1 — Front-Door Baseline Proof Pack

Status: `completed`.

Owner: GLM-style worker + Codex review.

Priority: auto-captured from the adjacent Stage-B front-door runway when the live queue dropped below the ready floor.

Allowed files:

- `index.html`
- `src/styles.css`
- `src/main.ts`
- `tests/front-door-boot-contract.spec.ts`
- `tests/menu-shell-start-current-map-contract.spec.ts`
- `tests/menu-shell-map-source-truth.spec.ts`
- `docs/GLM_READY_TASK_QUEUE.md` only for closeout sync

Goal:

Close the PS1 blocker by making the normal visitor front door and start-current-map path truthful under focused proof.

Must prove:

1. Normal boot lands on the front door while runtime-test bypass stays intact.
2. The primary start action enters the real current session path.
3. Source labeling remains truthful across the front-door start path.

Verification:

```bash
npm run build
npx tsc --noEmit -p tsconfig.app.json
./scripts/run-runtime-tests.sh tests/front-door-boot-contract.spec.ts tests/menu-shell-start-current-map-contract.spec.ts tests/menu-shell-map-source-truth.spec.ts --reporter=list
./scripts/cleanup-local-runtime.sh
```

### Task V2-PS2 — Session Shell No-Residue Pack

Status: `completed`.

Owner: GLM-style worker + Codex review.

Priority: auto-captured from the adjacent Stage-B front-door runway when the live queue dropped below the ready floor.

Allowed files:

- `src/main.ts`
- `src/game/Game.ts`
- `src/game/GamePhase.ts`
- `tests/session-shell-transition-matrix.spec.ts`
- `tests/pause-shell-entry-hotkey-contract.spec.ts`
- `tests/pause-shell-exit-hotkey-contract.spec.ts`
- `tests/setup-shell-return-path-contract.spec.ts`
- `tests/terminal-shell-reset-contract.spec.ts`
- `docs/GLM_READY_TASK_QUEUE.md` only for closeout sync

Goal:

Close the PS2 blocker by proving visible session shells do not leak stale state across pause/setup/results/reset transitions.

Must prove:

1. Pause, results, setup, and escape/back transitions do not unexpectedly resume gameplay or overlap shells.
2. Returning from any visible session shell preserves or clears state exactly as the current shell claims.
3. Terminal reset and reload paths do not leave stale overlays or summary state behind.

Verification:

```bash
npm run build
npx tsc --noEmit -p tsconfig.app.json
./scripts/run-runtime-tests.sh tests/session-shell-transition-matrix.spec.ts tests/pause-shell-entry-hotkey-contract.spec.ts tests/pause-shell-exit-hotkey-contract.spec.ts tests/setup-shell-return-path-contract.spec.ts tests/terminal-shell-reset-contract.spec.ts --reporter=list
./scripts/cleanup-local-runtime.sh
```

### Task V2-PS6 — Results Summary Truth Pack

Status: `completed`.

Owner: GLM-style worker + Codex review.

Priority: auto-captured from the adjacent Stage-B front-door runway when the live queue dropped below the ready floor.

Allowed files:

- `index.html`
- `src/styles.css`
- `src/main.ts`
- `tests/results-shell-summary-contract.spec.ts`
- `tests/results-shell-reload-button-contract.spec.ts`
- `tests/front-door-session-summary-dismiss-contract.spec.ts`
- `docs/GLM_READY_TASK_QUEUE.md` only for closeout sync

Goal:

Close the PS6 blocker by making visible results and last-session summary surfaces reflect only real session facts.

Must prove:

1. Visible results and summary fields come from actual session outcome and source state.
2. Dismiss and reload paths do not fabricate or preserve stale summary facts.
3. No visible copy implies ladder, campaign, or full postgame systems that do not exist.

Verification:

```bash
npm run build
npx tsc --noEmit -p tsconfig.app.json
./scripts/run-runtime-tests.sh tests/results-shell-summary-contract.spec.ts tests/results-shell-reload-button-contract.spec.ts tests/front-door-session-summary-dismiss-contract.spec.ts --reporter=list
./scripts/cleanup-local-runtime.sh
```

### Task V2-BF1 — Basic Visibility No-Regression Pack

Status: `accepted`.

Owner: GLM-style worker + Codex review.

Priority: V2 blocker proof scope reconciliation. Previous BF1 wording named only visibility and camera/HUD proof; the current BF1 gate requires the complete four-part basic visibility / no-regression packet before Codex can accept closeout.

Allowed files:

- `tests/unit-visibility-regression.spec.ts`
- `tests/m3-camera-hud-regression.spec.ts`
- `tests/m3-scale-measurement.spec.ts`
- `tests/unit-presence-regression.spec.ts`
- `src/game/Game.ts` only for a proven default-camera, HUD, spawn, source, or blocker-placement repair required by a failing BF1 assertion
- `src/game/UnitVisualFactory.ts` only for a proven unit body, scale, opacity, healthbar, or selection-ring visibility repair required by a failing BF1 assertion
- `src/game/AssetCatalog.ts` only for a proven asset metadata or fallback selection repair required by a failing BF1 assertion
- `docs/GLM_READY_TASK_QUEUE.md` only for closeout sync

Goal:

Close the BF1 blocker only if the default entry path passes the complete basic visibility / no-regression proof packet. This is an engineering guard against invisible, offscreen, HUD-obscured, footprint-collapsed, or blocker-spawned starting objects.

Must prove:

1. `tests/unit-visibility-regression.spec.ts`: worker body, opacity, world scale, projected size, and healthbar do not regress after default boot / asset refresh.
2. `tests/m3-camera-hud-regression.spec.ts`: town hall, worker, and goldmine are inside the default camera view and above the bottom HUD; command card, selection ring, and healthbar are visible.
3. `tests/m3-scale-measurement.spec.ts`: BF1 subset only; unit visual bboxes are nonzero, footman/building/resource footprint sanity holds, default camera anchor is sane, and selection ring sizing is non-collapsed.
4. `tests/unit-presence-regression.spec.ts`: starting workers do not collapse into one stack and do not spawn inside blocking footprints.
5. Any product-code repair is narrow, tied to a failing BF1 assertion, and re-runs the complete four-proof pack.

Must not claim:

- full War3-like battlefield readability
- human opening grammar acceptance
- real battlefield asset import
- user first-look approval
- V3 `BF3/BF4/BF5` closure

Verification:

```bash
npm run build
npx tsc --noEmit -p tsconfig.app.json
./scripts/run-runtime-tests.sh tests/unit-visibility-regression.spec.ts tests/m3-camera-hud-regression.spec.ts tests/m3-scale-measurement.spec.ts tests/unit-presence-regression.spec.ts --reporter=list
FORCE_RUNTIME_CLEANUP=1 ./scripts/cleanup-local-runtime.sh
```

Closeout boundary:

- If all four focused specs pass, write only: `BF1 basic visibility / no-regression proof passed.`
- If any proof is skipped, failed, flaky, or replaced by a partial command, BF1 remains open and the closeout must say which proof surface is missing.
- Do not mark BF1 closed from old two-spec visibility/camera evidence.

### Mode-Select Conditional Branch Proof Pack

Status: `completed`.

Owner: GLM-style worker + Codex review.

Priority: auto-captured from the adjacent Stage-B front-door runway when the live queue dropped below the ready floor.

Milestone: `V2 credible page-product vertical slice`.
Gate: `PS3`.
Proof target: Only the real current playable path is actionable; unavailable branches are disabled or absent and never route to fake loading or fake map pools.
Why now: PS3 is conditional-open and not covered by the current live GLM PS1/PS2/PS6/BF1 blocker queue.
Stop condition: Mode-select focused specs pass and closeout states whether PS3 is visible-pass, visible-repair-needed, or absent-residual.

Allowed files:

- `index.html`
- `src/styles.css`
- `src/main.ts`
- `tests/menu-shell-mode-truth-contract.spec.ts`
- `tests/mode-select-placeholder-truth-contract.spec.ts`
- `tests/mode-select-disabled-branches-contract.spec.ts`
- `docs/GLM_READY_TASK_QUEUE.md` only for closeout sync

Goal:

Run and repair the focused mode-select truth contracts for enabled, disabled, and absent branches.

Must prove:

1. The implemented current-map path is the only enabled route to live play.
2. Disabled mode branches are non-actionable and explain unavailable scope honestly.
3. No visible copy implies campaign, ladder, full skirmish setup, or finished mode support.

Verification:

```bash
npm run build
npx tsc --noEmit -p tsconfig.app.json
./scripts/run-runtime-tests.sh tests/menu-shell-mode-truth-contract.spec.ts tests/mode-select-placeholder-truth-contract.spec.ts tests/mode-select-disabled-branches-contract.spec.ts --reporter=list
./scripts/cleanup-local-runtime.sh
```

### Help And Settings Surface Truth Pack

Status: `completed`.

Owner: GLM-style worker + Codex review.

Priority: auto-captured from the adjacent Stage-B front-door runway when the live queue dropped below the ready floor.

Milestone: `V2 credible page-product vertical slice`.
Gate: `PS4`.
Proof target: Visible help/settings entries have truthful content, stable return paths, and no unsupported graphics/audio/control promises.
Why now: Help and settings slices are completed historically, but PS4 remains conditional-open until their proof is folded into the V2 gate.
Stop condition: Focused help/settings specs pass and closeout identifies any remaining user usefulness judgment separately from engineering proof.

Allowed files:

- `index.html`
- `src/styles.css`
- `src/main.ts`
- `tests/help-shell-entry-contract.spec.ts`
- `tests/settings-shell-truth-contract.spec.ts`
- `docs/GLM_READY_TASK_QUEUE.md` only for closeout sync

Goal:

Verify and repair help/controls and settings shell surfaces with existing focused contracts.

Must prove:

1. Help/controls copy describes only implemented controls and current session behavior.
2. Settings copy does not imply unsupported audio, graphics, save, or remap systems.
3. Back/escape paths return to the prior truthful shell without leaking gameplay state.

Verification:

```bash
npm run build
npx tsc --noEmit -p tsconfig.app.json
./scripts/run-runtime-tests.sh tests/help-shell-entry-contract.spec.ts tests/settings-shell-truth-contract.spec.ts --reporter=list
./scripts/cleanup-local-runtime.sh
```

### PS1 Front-Door Baseline Proof Rerun

Status: `completed`.

Owner: GLM-style worker + Codex review.

Priority: auto-captured from the adjacent Stage-B front-door runway when the live queue dropped below the ready floor.

Milestone: `V2 credible page-product vertical slice`.
Gate: `PS1`.
Proof target: PS1 closes only if normal boot reaches the menu/front door, runtime-test bypass still goes directly to harness gameplay, start current map enters real playing, and source truth aligns with the current map.
Why now: The PS1 ledger row is still open for actual command-result evidence, while the equivalent GLM live-queue proof pack is completed rather than active or ready.
Stop condition: Done when the exact PS1 command result is recorded as green, or a named failing spec is isolated without describing the shell as a complete main menu.

Allowed files:

- `src/main.ts`
- `src/game/Game.ts`
- `tests/front-door-boot-contract.spec.ts`
- `tests/menu-shell-start-current-map-contract.spec.ts`
- `tests/menu-shell-map-source-truth.spec.ts`
- `docs/GLM_READY_TASK_QUEUE.md` only for closeout sync

Goal:

Rerun the PS1 focused proof pack and report whether normal boot, runtime-test bypass, start-current-map, and source truth all hold on the current candidate.

Must prove:

1. Normal visitor path opens a truthful front door before live play.
2. Runtime-test bypass remains separate from normal visitor proof.
3. Start current map enters real playing from the menu/front door.
4. Closeout explicitly says PS1 does not equal complete main menu acceptance.

Verification:

```bash
npm run build
npx tsc --noEmit -p tsconfig.app.json
./scripts/run-runtime-tests.sh tests/front-door-boot-contract.spec.ts tests/menu-shell-start-current-map-contract.spec.ts tests/menu-shell-map-source-truth.spec.ts --reporter=list
./scripts/cleanup-local-runtime.sh
```

### PS2 Session-Shell No-Residue Proof Rerun

Status: `completed`.

Owner: GLM-style worker + Codex review.

Priority: auto-captured from the adjacent Stage-B front-door runway when the live queue dropped below the ready floor.

Milestone: `V2 credible page-product vertical slice`.
Gate: `PS2`.
Proof target: PS2 closes only if pause entry/resume/reload, pause-to-setup, setup start/return, terminal entry, results reload, and the transition matrix are green without using results summary content as PS2 proof.
Why now: The PS2 ledger row has an explicit proof route but still lacks current closeout command evidence; the matching GLM pack is completed, not active or ready.
Stop condition: Done when the PS2 focused pack result is recorded, or a named failing seam is split out while routing summary truth to PS6 and return-to-menu/re-entry to PS5/V3.

Allowed files:

- `src/main.ts`
- `src/game/Game.ts`
- `tests/pause-session-overlay-contract.spec.ts`
- `tests/pause-shell-entry-hotkey-contract.spec.ts`
- `tests/pause-shell-exit-hotkey-contract.spec.ts`
- `tests/pause-shell-reload-button-contract.spec.ts`
- `tests/setup-shell-contract.spec.ts`
- `tests/setup-shell-live-entry-contract.spec.ts`
- `tests/setup-shell-return-path-contract.spec.ts`
- `tests/results-shell-reload-button-contract.spec.ts`
- `tests/terminal-shell-reset-contract.spec.ts`
- `tests/session-shell-transition-matrix.spec.ts`
- `docs/GLM_READY_TASK_QUEUE.md` only for closeout sync

Goal:

Rerun the PS2 session-shell focused pack and report whether every visible pause, setup, results, reload, and terminal reset seam is mutually exclusive and repeatable.

Must prove:

1. Pause, setup, results, reload, and terminal reset surfaces remain mutually exclusive.
2. Repeated transitions do not leave stale shell or gameplay state.
3. User clarity judgment stays separate from stale-state regression proof.
4. Results summary content remains PS6, and return-to-menu/re-entry remains PS5 or V3.

Verification:

```bash
npm run build
npx tsc --noEmit -p tsconfig.app.json
./scripts/run-runtime-tests.sh tests/pause-session-overlay-contract.spec.ts tests/pause-shell-entry-hotkey-contract.spec.ts tests/pause-shell-exit-hotkey-contract.spec.ts tests/pause-shell-reload-button-contract.spec.ts tests/setup-shell-contract.spec.ts tests/setup-shell-live-entry-contract.spec.ts tests/setup-shell-return-path-contract.spec.ts tests/results-shell-reload-button-contract.spec.ts tests/terminal-shell-reset-contract.spec.ts tests/session-shell-transition-matrix.spec.ts --reporter=list
./scripts/cleanup-local-runtime.sh
```

### PS6 Results Summary Truth Proof Rerun

Status: `completed`.

Owner: GLM-style worker + Codex review.

Priority: auto-captured from the adjacent Stage-B front-door runway when the live queue dropped below the ready floor.

Milestone: `V2 credible page-product vertical slice`.
Gate: `PS6`.
Proof target: PS6 closes only if verdict, duration, live unit/building counts, reload cleanup, terminal reset, and front-door runtime last-session summary stay truthful and alpha-scoped.
Why now: The PS6 ledger row defines the whitelist and proof route but still lacks actual closeout command evidence; the equivalent GLM pack is completed rather than active or ready.
Stop condition: Done when the PS6 command result is recorded, or a failing field is named while rejecting ladder, campaign, score, APM, replay, and full battle report framing.

Allowed files:

- `src/main.ts`
- `src/game/Game.ts`
- `tests/results-shell-summary-contract.spec.ts`
- `tests/results-shell-reload-button-contract.spec.ts`
- `tests/terminal-shell-reset-contract.spec.ts`
- `tests/front-door-last-session-summary-contract.spec.ts`
- `tests/front-door-last-session-summary-reset-contract.spec.ts`
- `docs/GLM_READY_TASK_QUEUE.md` only for closeout sync

Goal:

Rerun the PS6 results summary proof pack and report whether visible result text and summary fields are backed by terminal/session state without fake postgame framing.

Must prove:

1. Results verdict and summary fields come from real session state.
2. Reload and terminal reset clear stale summary state.
3. Front-door last-session summary remains current-runtime and lightweight.
4. Closeout says the summary is alpha-level, not ladder, campaign, replay, score, APM, or full postgame.

Verification:

```bash
npm run build
npx tsc --noEmit -p tsconfig.app.json
./scripts/run-runtime-tests.sh tests/results-shell-summary-contract.spec.ts tests/results-shell-reload-button-contract.spec.ts tests/terminal-shell-reset-contract.spec.ts tests/front-door-last-session-summary-contract.spec.ts tests/front-door-last-session-summary-reset-contract.spec.ts --reporter=list
./scripts/cleanup-local-runtime.sh
```

### BF1 Basic Visibility Four-Proof Rerun

Status: `completed`.

Owner: GLM-style worker + Codex review.

Priority: auto-captured from the adjacent Stage-B front-door runway when the live queue dropped below the ready floor.

Milestone: `V2 credible page-product vertical slice`.
Gate: `BF1`.
Proof target: BF1 closes only if unit visibility, camera/HUD, BF1 scale/footprint sanity, and unit presence proofs pass together; partial two-spec evidence cannot close BF1.
Why now: BF1 was still open in the evidence ledger, and the GLM BF1 pack was completed rather than active or ready, so a current-candidate proof rerun was the narrowest GLM-safe continuation.
Stop condition: Done when the four-proof command result is recorded as green, or the failing spec is named and the closeout avoids War3-like readability, human opening grammar, or real asset import claims.

Allowed files:

- `src/game/Game.ts`
- `tests/unit-visibility-regression.spec.ts`
- `tests/m3-camera-hud-regression.spec.ts`
- `tests/m3-scale-measurement.spec.ts`
- `tests/unit-presence-regression.spec.ts`
- `docs/GLM_READY_TASK_QUEUE.md` only for closeout sync

Goal:

Rerun the full four-spec BF1 proof pack and report whether worker visibility, camera/HUD framing, scale/footprint sanity, and unit presence all hold on the current candidate.

Must prove:

1. Worker body, opacity, scale, projected size, and healthbar do not regress.
2. Town hall, worker, and goldmine remain in the default camera and above the HUD.
3. BF1 scale/footprint sanity has nonzero unit bbox, footprint sanity, default anchor, and ring sanity.
4. Starting workers do not collapse into one stack or spawn inside blockers.

Verification:

```bash
npm run build
npx tsc --noEmit -p tsconfig.app.json
./scripts/run-runtime-tests.sh tests/unit-visibility-regression.spec.ts tests/m3-camera-hud-regression.spec.ts tests/m3-scale-measurement.spec.ts tests/unit-presence-regression.spec.ts --reporter=list
./scripts/cleanup-local-runtime.sh
```

### PS1 前门基线证据复跑

Status: `completed`.

Owner: GLM-style worker + Codex review.

Priority: auto-captured from the adjacent Stage-B front-door runway when the live queue dropped below the ready floor.

Milestone: `V2 credible page-product vertical slice`.
Gate: `PS1`.
Proof target: 普通用户路径先落到真实前门，再进入 live play。
Why now: This directly advances currently open gate PS1.
Stop condition: The listed proof is demonstrated and the focused verification passes without widening scope.

Allowed files:

- `src/main.ts`
- `src/game/Game.ts`
- `tests/front-door-boot-contract.spec.ts`
- `tests/menu-shell-start-current-map-contract.spec.ts`
- `tests/menu-shell-map-source-truth.spec.ts`
- `docs/GLM_READY_TASK_QUEUE.md` only for closeout sync

Goal:

复跑 PS1 focused proof pack，确认 normal boot、runtime-test bypass、start-current-map 和 source truth 在当前候选版上是否仍然成立。

Must prove:

1. 普通用户路径先落到真实前门，再进入 live play。
2. runtime-test bypass 必须继续和普通入口分开。
3. start current map 仍然从前门进入真实 playing。
4. closeout 必须明确说明这不等于完整主菜单通过。

Verification:

```bash
npm run build
npx tsc --noEmit -p tsconfig.app.json
./scripts/run-runtime-tests.sh tests/front-door-boot-contract.spec.ts tests/menu-shell-start-current-map-contract.spec.ts tests/menu-shell-map-source-truth.spec.ts --reporter=list
./scripts/cleanup-local-runtime.sh
```

### PS2 会话壳层无残留证据复跑

Status: `completed`.

Owner: GLM-style worker + Codex review.

Priority: auto-captured from the adjacent Stage-B front-door runway when the live queue dropped below the ready floor.

Milestone: `V2 credible page-product vertical slice`.
Gate: `PS6`.
Proof target: pause、setup、results、reload、terminal reset 必须保持互斥。
Why now: This directly advances currently open gate PS6.
Stop condition: The listed proof is demonstrated and the focused verification passes without widening scope.

Allowed files:

- `src/main.ts`
- `src/game/Game.ts`
- `tests/pause-session-overlay-contract.spec.ts`
- `tests/session-shell-transition-matrix.spec.ts`
- `tests/pause-shell-entry-hotkey-contract.spec.ts`
- `tests/pause-shell-exit-hotkey-contract.spec.ts`
- `tests/pause-shell-reload-button-contract.spec.ts`
- `tests/setup-shell-contract.spec.ts`
- `tests/setup-shell-return-path-contract.spec.ts`
- `tests/setup-shell-live-entry-contract.spec.ts`
- `tests/results-shell-reload-button-contract.spec.ts`
- `tests/terminal-shell-reset-contract.spec.ts`
- `docs/GLM_READY_TASK_QUEUE.md` only for closeout sync

Goal:

复跑 PS2 session-shell focused pack，确认 pause、setup、results、reload、terminal reset 这些可见壳层状态互斥且可重复。

Must prove:

1. pause、setup、results、reload、terminal reset 必须保持互斥。
2. 重复切换后不能留下 stale shell 或 gameplay 状态。
3. 用户是否觉得清楚，要和工程 stale-state proof 分开。
4. results summary 内容继续归 PS6，return-to-menu/re-entry 继续归 PS5/V3。

Verification:

```bash
npm run build
npx tsc --noEmit -p tsconfig.app.json
./scripts/run-runtime-tests.sh tests/pause-session-overlay-contract.spec.ts tests/session-shell-transition-matrix.spec.ts tests/pause-shell-entry-hotkey-contract.spec.ts tests/pause-shell-exit-hotkey-contract.spec.ts tests/pause-shell-reload-button-contract.spec.ts tests/setup-shell-contract.spec.ts tests/setup-shell-return-path-contract.spec.ts tests/setup-shell-live-entry-contract.spec.ts tests/results-shell-reload-button-contract.spec.ts tests/terminal-shell-reset-contract.spec.ts --reporter=list
./scripts/cleanup-local-runtime.sh
```

### PS6 结果摘要真实性证据复跑

Status: `completed`.

Owner: GLM-style worker + Codex review.

Priority: auto-captured from the adjacent Stage-B front-door runway when the live queue dropped below the ready floor.

Milestone: `V2 credible page-product vertical slice`.
Gate: `PS6`.
Proof target: 结果 verdict 和摘要字段都来自真实 session state。
Why now: This directly advances currently open gate PS6.
Stop condition: The listed proof is demonstrated and the focused verification passes without widening scope.

Allowed files:

- `src/main.ts`
- `src/game/Game.ts`
- `tests/results-shell-summary-contract.spec.ts`
- `tests/results-shell-reload-button-contract.spec.ts`
- `tests/terminal-shell-reset-contract.spec.ts`
- `tests/front-door-last-session-summary-contract.spec.ts`
- `tests/front-door-last-session-summary-reset-contract.spec.ts`
- `docs/GLM_READY_TASK_QUEUE.md` only for closeout sync

Goal:

复跑 PS6 focused proof pack，确认可见结果文案和摘要字段都由 terminal/session state 驱动，而不是假 postgame 文案。

Must prove:

1. 结果 verdict 和摘要字段都来自真实 session state。
2. reload 和 terminal reset 会清掉 stale summary state。
3. 前门上的 last-session summary 仍然是 current-runtime、轻量级信息。
4. closeout 必须明确这不是 ladder、campaign、replay、score、APM 或完整 postgame。

Verification:

```bash
npm run build
npx tsc --noEmit -p tsconfig.app.json
./scripts/run-runtime-tests.sh tests/results-shell-summary-contract.spec.ts tests/results-shell-reload-button-contract.spec.ts tests/terminal-shell-reset-contract.spec.ts tests/front-door-last-session-summary-contract.spec.ts tests/front-door-last-session-summary-reset-contract.spec.ts --reporter=list
./scripts/cleanup-local-runtime.sh
```

### BF1 基础可见性四证据复跑

Status: `completed`.

Owner: GLM-style worker + Codex review.

Priority: auto-captured from the adjacent Stage-B front-door runway when the live queue dropped below the ready floor.

Milestone: `V2 credible page-product vertical slice`.
Gate: `BF1`.
Proof target: worker body、opacity、scale、projected size、healthbar 没有回退。
Why now: This directly advances currently open gate BF1.
Stop condition: The listed proof is demonstrated and the focused verification passes without widening scope.

Allowed files:

- `src/game/Game.ts`
- `tests/unit-visibility-regression.spec.ts`
- `tests/m3-camera-hud-regression.spec.ts`
- `tests/m3-scale-measurement.spec.ts`
- `tests/unit-presence-regression.spec.ts`
- `docs/GLM_READY_TASK_QUEUE.md` only for closeout sync

Goal:

复跑 BF1 四证据包，确认 worker 可见性、camera/HUD、scale/footprint sanity、unit presence 在当前候选版上是否同时成立。

Must prove:

1. worker body、opacity、scale、projected size、healthbar 没有回退。
2. town hall、worker、goldmine 仍然在默认镜头里且高于 HUD。
3. BF1 的 scale/footprint sanity 仍然满足 nonzero bbox、footprint sanity、default anchor、ring sanity。
4. 起始 workers 不会坍成一团，也不会刷进 blocker 里。

Verification:

```bash
npm run build
npx tsc --noEmit -p tsconfig.app.json
./scripts/run-runtime-tests.sh tests/unit-visibility-regression.spec.ts tests/m3-camera-hud-regression.spec.ts tests/m3-scale-measurement.spec.ts tests/unit-presence-regression.spec.ts --reporter=list
./scripts/cleanup-local-runtime.sh
```

Codex closeout:

- 2026-04-14 complete four-proof command passed `11/11`: `./scripts/run-runtime-tests.sh tests/unit-visibility-regression.spec.ts tests/m3-camera-hud-regression.spec.ts tests/m3-scale-measurement.spec.ts tests/unit-presence-regression.spec.ts --reporter=list`。
- Accepted only as `BF1 basic visibility / no-regression proof passed.`
- Not accepted as War3-like readability, human opening grammar, real asset import, map spatial grammar, or V3 battlefield approval.

### PS2 会话壳层无残留复跑

Status: `completed`.

Owner: GLM-style worker + Codex review.

Priority: auto-captured from the adjacent Stage-B front-door runway when the live queue dropped below the ready floor.

Milestone: `V2 credible page-product vertical slice`.
Gate: `PS2`.
Proof target: PS2 只在 pause entry/resume/reload、pause-to-setup、setup start/return、terminal entry、results reload 和 transition matrix 全部通过时关闭；results summary 内容仍归 PS6，return-to-menu/re-entry 仍归 PS5/V3。
Why now: ledger 里 PS2 当时仍是 open，虽然路线已经明确；当前最缺的是一份可被 Codex closeout 引用的当前命令结果。
Stop condition: 四类会话 seam 的 focused pack 结果被记录为通过，或明确点名失败 seam，并且不把用户理解度判断混进 stale-state 工程证明。

Allowed files:

- `src/main.ts`
- `src/game/Game.ts`
- `tests/pause-session-overlay-contract.spec.ts`
- `tests/pause-shell-entry-hotkey-contract.spec.ts`
- `tests/pause-shell-exit-hotkey-contract.spec.ts`
- `tests/pause-shell-reload-button-contract.spec.ts`
- `tests/setup-shell-contract.spec.ts`
- `tests/setup-shell-live-entry-contract.spec.ts`
- `tests/setup-shell-return-path-contract.spec.ts`
- `tests/results-shell-reload-button-contract.spec.ts`
- `tests/terminal-shell-reset-contract.spec.ts`
- `tests/session-shell-transition-matrix.spec.ts`
- `docs/GLM_READY_TASK_QUEUE.md` only for closeout sync

Goal:

复跑 PS2 会话壳层 focused pack，报告每个可见会话 seam 是否互斥、可重复且没有 stale state。

Must prove:

1. pause、setup、results、reload、terminal reset 当前互斥且可重复。
2. 重复进入和退出不会留下旧 shell、旧 phase 或旧 session state。
3. stale-state 结论只来自 named tests 或明确命令结果。
4. results summary 内容不用于关闭 PS2，return-to-menu/re-entry 不用于关闭 PS2。

Verification:

```bash
npm run build
npx tsc --noEmit -p tsconfig.app.json
./scripts/run-runtime-tests.sh tests/pause-session-overlay-contract.spec.ts tests/pause-shell-entry-hotkey-contract.spec.ts tests/pause-shell-exit-hotkey-contract.spec.ts tests/pause-shell-reload-button-contract.spec.ts tests/setup-shell-contract.spec.ts tests/setup-shell-live-entry-contract.spec.ts tests/setup-shell-return-path-contract.spec.ts tests/results-shell-reload-button-contract.spec.ts tests/terminal-shell-reset-contract.spec.ts tests/session-shell-transition-matrix.spec.ts --reporter=list
./scripts/cleanup-local-runtime.sh
```

Codex closeout:

- 2026-04-14 focused command passed `24/24`: `./scripts/run-runtime-tests.sh tests/pause-session-overlay-contract.spec.ts tests/pause-shell-entry-hotkey-contract.spec.ts tests/pause-shell-exit-hotkey-contract.spec.ts tests/pause-shell-reload-button-contract.spec.ts tests/setup-shell-contract.spec.ts tests/setup-shell-live-entry-contract.spec.ts tests/setup-shell-return-path-contract.spec.ts tests/results-shell-reload-button-contract.spec.ts tests/terminal-shell-reset-contract.spec.ts tests/session-shell-transition-matrix.spec.ts --reporter=list`。
- Accepted only as PS2 session-shell no-residue engineering proof.
- Not accepted as complete main menu, return-to-menu, re-entry, rematch, or user clarity proof.

### PS6 结果摘要真实性复跑

Status: `completed`.

Owner: GLM-style worker + Codex review.

Priority: auto-captured from the adjacent Stage-B front-door runway when the live queue dropped below the ready floor.

Milestone: `V2 credible page-product vertical slice`.
Gate: `PS6`.
Proof target: PS6 只在 visible verdict、duration、live unit/building counts、reload cleanup、terminal reset、front-door runtime summary 都由真实 session state 支撑时关闭。
Why now: PS6 白名单已经写清楚，但 ledger 仍缺当前命令结果；如果不补证据，结果摘要很容易被误写成完整战报或历史系统。
Stop condition: PS6 focused command 结果被记录为通过，或明确点名缺失/失败字段，并继续拒绝 ladder、campaign、rank、score、APM、replay、continue-saved-game 和 full battle report 说法。

Allowed files:

- `src/main.ts`
- `src/game/Game.ts`
- `tests/results-shell-summary-contract.spec.ts`
- `tests/results-shell-reload-button-contract.spec.ts`
- `tests/terminal-shell-reset-contract.spec.ts`
- `tests/front-door-last-session-summary-contract.spec.ts`
- `tests/front-door-last-session-summary-reset-contract.spec.ts`
- `docs/GLM_READY_TASK_QUEUE.md` only for closeout sync

Goal:

复跑 PS6 结果摘要 proof pack，报告 verdict、duration、单位/建筑数、reload 清理、terminal reset 和 front-door 上局摘要是否仍然真实。

Must prove:

1. 结果页 verdict、duration、单位数和建筑数来自真实 session state。
2. reload 和 terminal reset 会清理 stale summary state。
3. front-door 上局摘要只保留当前 runtime 的轻量事实。
4. closeout 明确写成 alpha 级摘要，不写成天梯、战役、排名、分数、APM、replay 或完整战报。

Verification:

```bash
npm run build
npx tsc --noEmit -p tsconfig.app.json
./scripts/run-runtime-tests.sh tests/results-shell-summary-contract.spec.ts tests/results-shell-reload-button-contract.spec.ts tests/terminal-shell-reset-contract.spec.ts tests/front-door-last-session-summary-contract.spec.ts tests/front-door-last-session-summary-reset-contract.spec.ts --reporter=list
./scripts/cleanup-local-runtime.sh
```

### Task 94 — V3 Human Opening Grammar Proof Pack

Status: `completed`.

Owner: GLM-style worker + Codex review.

Priority: auto-captured from the adjacent Stage-B front-door runway when the live queue dropped below the ready floor.

Allowed files:

- `src/game/Game.ts`
- `tests/v3-opening-grammar-regression.spec.ts`
- `tests/v3-base-layout-anchor-contract.spec.ts`
- `docs/GLM_READY_TASK_QUEUE.md` only for closeout sync

Goal:

把 TH / 金矿 / 树线 / 出口 / 兵营 / 农场 / 塔的开局空间关系变成客观可复跑的 proof pack。

Must prove:

1. TH / 矿 / 树线 / 出口关系不再像随手摆件
2. 生产区和防御区能形成可解释布局
3. proof 只回答 V3 opening grammar，不扩写成短局或最终地图设计

Verification:

```bash
npm run build
npx tsc --noEmit -p tsconfig.app.json
./scripts/run-runtime-tests.sh tests/v3-opening-grammar-regression.spec.ts tests/v3-base-layout-anchor-contract.spec.ts --reporter=list
./scripts/cleanup-local-runtime.sh
```

### Task 95 — V3 Default Camera Readability Pack

Status: `completed`.

Owner: GLM-style worker + Codex review.

Priority: auto-captured from the adjacent Stage-B front-door runway when the live queue dropped below the ready floor.

Allowed files:

- `src/game/Game.ts`
- `tests/v3-default-camera-readability.spec.ts`
- `tests/v3-role-readability-screenshot-contract.spec.ts`
- `docs/GLM_READY_TASK_QUEUE.md` only for closeout sync

Goal:

证明默认镜头下 worker、footman、核心建筑和资源点是一眼可读的，而不是只是“存在”。

Must prove:

1. worker / footman / Town Hall / Barracks / Farm / Tower / Goldmine 都可读
2. 读图不是靠缩放到不真实的镜头作弊实现
3. proof 不等于最终美术完成或 user verdict

Verification:

```bash
npm run build
npx tsc --noEmit -p tsconfig.app.json
./scripts/run-runtime-tests.sh tests/v3-default-camera-readability.spec.ts tests/v3-role-readability-screenshot-contract.spec.ts --reporter=list
./scripts/cleanup-local-runtime.sh
```

### Task 96 — V3 Camera HUD Footprint Harmony Pack

Status: `completed`.

Owner: GLM-style worker + Codex review.

Priority: auto-captured from the adjacent Stage-B front-door runway when the live queue dropped below the ready floor.

Allowed files:

- `src/main.ts`
- `src/game/Game.ts`
- `tests/v3-camera-hud-footprint-harmony.spec.ts`
- `docs/GLM_READY_TASK_QUEUE.md` only for closeout sync

Goal:

把默认镜头、HUD 遮挡、selection ring、footprint 与 choke/gap 感知之间的关系收成一个 focused pack。

Must prove:

1. 默认镜头 framing 服务开局读图
2. HUD 不遮挡核心对象
3. selection / footprint / gap 感知不会互相打架

Verification:

```bash
npm run build
npx tsc --noEmit -p tsconfig.app.json
./scripts/run-runtime-tests.sh tests/v3-camera-hud-footprint-harmony.spec.ts --reporter=list
./scripts/cleanup-local-runtime.sh
```

### Task 97 — V3 Return/Re-entry Product-Shell Pack

Status: `completed`.

Owner: GLM-style worker + Codex review.

Priority: auto-captured from the adjacent Stage-B front-door runway when the live queue dropped below the ready floor.

Allowed files:

- `src/main.ts`
- `src/game/Game.ts`
- `tests/session-return-to-menu-contract.spec.ts`
- `tests/front-door-reentry-start-loop.spec.ts`
- `tests/v3-briefing-return-consistency.spec.ts`
- `docs/GLM_READY_TASK_QUEUE.md` only for closeout sync

Goal:

把 V2 residual 的 return-to-menu / re-entry 推进成 V3 product-shell clarity 的真实路径。

Must prove:

1. 从 results 或 pause 返回 menu 后 source truth 仍成立
2. 再次开始不会带 stale shell / stale gameplay state
3. 这条路径是产品路径，不是假按钮

Verification:

```bash
npm run build
npx tsc --noEmit -p tsconfig.app.json
./scripts/run-runtime-tests.sh tests/session-return-to-menu-contract.spec.ts tests/front-door-reentry-start-loop.spec.ts tests/v3-briefing-return-consistency.spec.ts --reporter=list
./scripts/cleanup-local-runtime.sh
```

### 基地空间语法测量包

Status: `completed`.

Owner: GLM-style worker + Codex review.

Priority: auto-captured from the adjacent Stage-B front-door runway when the live queue dropped below the ready floor.

Milestone: `V3.1 battlefield + product-shell clarity`.
Gate: `V3-BG1`.
Proof target: 关闭 V3-BG1 的空间语法 proof：布局关系、默认镜头截图、测量输出和审查清单一致。
Why now: 用户已经指出地图平、比例和关系不像 War3；这是 V3.1 battlefield clarity 的第一批硬 blocker。
Stop condition: 测试和截图证据能说明对象关系；若缺口仍在，必须点名最小失败面，而不是泛称战场还要优化。

Allowed files:

- `src/game/Game.ts`
- `tests/m3-base-grammar.spec.ts`
- `tests/v3-battlefield-grammar-contract.spec.ts`
- `docs/GLM_READY_TASK_QUEUE.md` only for closeout sync

Goal:

用 focused regression 和截图输出证明 TH、金矿、树线、出口、兵营、农场、塔形成可解释的空间语法。

Must prove:

1. TH、金矿、树线和出口存在可测量的相对关系。
2. 兵营、农场、塔不会破坏基地出口和采矿路径。
3. 默认镜头截图与测量输出能对应同一套空间语法。

Verification:

```bash
npm run build
npx tsc --noEmit -p tsconfig.app.json
./scripts/run-runtime-tests.sh tests/m3-base-grammar.spec.ts tests/v3-battlefield-grammar-contract.spec.ts --reporter=list
./scripts/cleanup-local-runtime.sh
```

### 默认镜头角色可读性包

Status: `completed`.

Owner: GLM-style worker + Codex review.

Priority: auto-captured from the adjacent Stage-B front-door runway when the live queue dropped below the ready floor.

Milestone: `V3.1 battlefield + product-shell clarity`.
Gate: `V3-RD1`.
Proof target: 关闭 V3-RD1 的默认镜头可读性 proof：截图包、测量 proof、focused regressions 和每类对象结论。
Why now: BF1 只证明基础可见，V3.1 需要证明玩家第一眼能分辨对象身份和用途。
Stop condition: 九类对象各自得到 pass/pass-with-tuning/blocked/rejected 结论；不能用单一截图或 BF1 旧命令代替。

Allowed files:

- `tests/m3-scale-measurement.spec.ts`
- `tests/unit-visibility-regression.spec.ts`
- `tests/v3-default-camera-readability.spec.ts`
- `docs/GLM_READY_TASK_QUEUE.md` only for closeout sync

Goal:

让 worker、footman、主要建筑、金矿、树线和 terrain aid 在默认镜头下具备可辨认证据。

Must prove:

1. worker、footman、Town Hall、Barracks、Farm、Tower、Goldmine、tree line、terrain aid 在默认镜头下可辨认。
2. 测量 proof 与截图包能对应到每类对象。
3. 失败对象必须写成 blocked 或 pass-with-tuning，不能假装全量通过。

Verification:

```bash
npm run build
npx tsc --noEmit -p tsconfig.app.json
./scripts/run-runtime-tests.sh tests/m3-scale-measurement.spec.ts tests/unit-visibility-regression.spec.ts tests/v3-default-camera-readability.spec.ts --reporter=list
./scripts/cleanup-local-runtime.sh
```

### 返回菜单再开局证明包

Status: `completed`.

Owner: GLM-style worker + Codex review.

Priority: auto-captured from the adjacent Stage-B front-door runway when the live queue dropped below the ready floor.

Milestone: `V3.1 battlefield + product-shell clarity`.
Gate: `V3-PS2`.
Proof target: 关闭 V3-PS2 的 return-to-menu / re-entry proof：返回后 inactive，source truth 保留，再次开始 clean session。
Why now: V2 已证明 session shell 不残留；V3.1 需要把返回前门和再次开始做成真实产品循环。
Stop condition: focused specs 全绿；若失败，必须点名是 pause return、results return、source truth 还是 re-entry stale state。

Allowed files:

- `src/main.ts`
- `src/game/Game.ts`
- `tests/session-return-to-menu-contract.spec.ts`
- `tests/front-door-reentry-start-loop.spec.ts`
- `docs/GLM_READY_TASK_QUEUE.md` only for closeout sync

Goal:

锁住 pause/results 返回 menu、gameplay inactive、source truth 保留、再次开始无 stale state 的完整路径。

Must prove:

1. pause 返回菜单后 gameplay inactive，menu 可见。
2. results 返回菜单后旧 terminal / pause / setup 状态清理。
3. 再次开始使用当前 source，且不继承旧单位、phase 或 summary 状态。

Verification:

```bash
npm run build
npx tsc --noEmit -p tsconfig.app.json
./scripts/run-runtime-tests.sh tests/session-return-to-menu-contract.spec.ts tests/front-door-reentry-start-loop.spec.ts --reporter=list
./scripts/cleanup-local-runtime.sh
```

### 开局解释层收口包

Status: `completed`.

Owner: GLM-style worker + Codex review.

Priority: auto-captured from the adjacent Stage-B front-door runway when the live queue dropped below the ready floor.

Milestone: `V3.1 battlefield + product-shell clarity`.
Gate: `V3-PS3`.
Proof target: 关闭 V3-PS3 的 truthful explanation proof：source、mode、controls 或目标真实展示，并能进入当前 gameplay。
Why now: V2 已有真实 briefing seam；V3.1 需要让它承担产品理解，而不只是过渡页。
Stop condition: focused specs 证明解释层内容与当前 source/mode/action 对齐；不可玩分支仍 disabled 或 absent。

Allowed files:

- `index.html`
- `src/main.ts`
- `src/styles.css`
- `tests/pre-match-briefing-truth-contract.spec.ts`
- `tests/briefing-source-truth-contract.spec.ts`
- `tests/briefing-continue-start-contract.spec.ts`
- `docs/GLM_READY_TASK_QUEUE.md` only for closeout sync

Goal:

收紧 start path 的 briefing / loading proxy，使它解释当前可玩 slice，而不是扩写 campaign、ladder 或完整模式池。

Must prove:

1. 解释层显示当前 source、mode、controls 或目标中的真实信息。
2. continue/start seam 进入当前可玩路径。
3. 文案不暗示 campaign、ladder、完整 skirmish setup 或完整模式池。

Verification:

```bash
npm run build
npx tsc --noEmit -p tsconfig.app.json
./scripts/run-runtime-tests.sh tests/pre-match-briefing-truth-contract.spec.ts tests/briefing-source-truth-contract.spec.ts tests/briefing-continue-start-contract.spec.ts --reporter=list
./scripts/cleanup-local-runtime.sh
```

### V3 BG1 基地空间语法收口复跑

Status: `completed`.

Owner: GLM-style worker + Codex review.

Priority: auto-captured from the adjacent Stage-B front-door runway when the live queue dropped below the ready floor.

Milestone: `V3.1 battlefield + product-shell clarity`.
Gate: `V3-BG1`.
Proof target: 关闭 V3-BG1 所需的空间语法 proof：默认镜头关系、测量输出和审查清单一致。
Why now: 旧的 V3 语法 proof task 已经跑完，但 gate 还开着；队列需要一个新标题复跑包继续推进 closeout。
Stop condition: focused specs 通过，或失败面被点名为具体 geometry / layout seam。 → **ALL 10 TESTS PASS.**

Allowed files:

- `src/game/Game.ts` — no changes needed
- `tests/m3-base-grammar.spec.ts` — created new V3-BG1 closeout proof (5 tests)
- `tests/v3-battlefield-grammar-contract.spec.ts` — existing (5 tests, all pass)
- `docs/GLM_READY_TASK_QUEUE.md` only for closeout sync

Goal:

用 focused regression 和最小修正把 V3-BG1 压成可 closeout 的空间语法证据。

Must prove:

1. TH、金矿、树线和出口存在可测量、可解释的相对关系。 ✅
2. 兵营、农场、塔不会破坏矿线和出口语法。 ✅
3. 结论绑定到 focused proof，而不是泛称”地图还需继续调”。 ✅

Closeout evidence (2026-04-14):

```
m3-base-grammar.spec.ts (5 tests):
  ✓ TH-mine-treeline-exit relationships (thMineDist=6.40, gap=2.90, mineNE=true, treeCount=187, openExits=4)
  ✓ Barracks does not break gather corridor (inCorridor=false, angleDeg=173.7°, pathable=true)
  ✓ Military buildings preserve exit corridor (exitsOpen=3/4: SE,S,E open)
  ✓ TH-mine corridor not blocked (7 tiles checked, 0 blocked)
  ✓ Full spatial grammar audit (allHold=true, mineNE, barSW, mineCloser, noMineBarOverlap, treeLinePresent, openExits≥2)

v3-battlefield-grammar-contract.spec.ts (5 tests):
  ✓ TH-mine-gather path geometry measurable and structured
  ✓ Barracks does not block TH-to-mine gather corridor
  ✓ Barracks does not block base exit corridor
  ✓ Tree line does not encroach into core building footprints
  ✓ Spatial grammar summary: all relationships hold together

Verification: 10/10 pass, build clean, tsc clean.
```

Verification:

```bash
npm run build
npx tsc --noEmit -p tsconfig.app.json
./scripts/run-runtime-tests.sh tests/m3-base-grammar.spec.ts tests/v3-battlefield-grammar-contract.spec.ts --reporter=list
./scripts/cleanup-local-runtime.sh
```

### V3 RD1 默认镜头可读性收口复跑

Status: `completed`.

Owner: GLM-style worker + Codex review.

Priority: auto-captured from the adjacent Stage-B front-door runway when the live queue dropped below the ready floor.

Milestone: `V3.1 battlefield + product-shell clarity`.
Gate: `V3-RD1`.
Proof target: 关闭 V3-RD1 所需的截图包、测量 proof 和对象级别结论。
Why now: 用户已经明确指出比例和第一眼不够 War3；旧 task 已完成但 gate 没关，live queue 不能继续空。
Stop condition: focused specs 通过，或失败对象被明确列成 blocked / pass-with-tuning。 → **ALL 7 TESTS PASS.**

Allowed files:

- `src/game/Game.ts` — no changes needed
- `tests/unit-visibility-regression.spec.ts` — existing (2 tests, all pass)
- `tests/m3-scale-measurement.spec.ts` — existing (1 test, all pass)
- `tests/v3-default-camera-readability.spec.ts` — **created** new V3-RD1 closeout proof (4 tests)
- `docs/GLM_READY_TASK_QUEUE.md` only for closeout sync

Goal:

用 focused regression、截图和必要修正推进 V3-RD1 closeout。

Must prove:

1. worker、footman、核心建筑、资源点和树线在默认镜头下可辨认。 ✅
2. 测量输出与截图能对应到同一批对象。 ✅
3. 失败对象必须点名，不能把 BF1 可见性当成 RD1 已通过。 ✅

Closeout evidence (2026-04-14):

```
v3-default-camera-readability.spec.ts (4 tests):
  ✓ Worker/footman distinguishable silhouettes (worker 42x62px 15meshes, footman 80x73px 11meshes, areaRatio=2.25)
  ✓ Core buildings individually distinguishable (TH 137x139, BK 137x140, GM 100x123, Farm 85x101, Tower 144x104)
  ✓ Treeline present and on screen (187 trees, 5 near base, all sample on screen)
  ✓ Full readability audit: all 8 object types pass (worker, footman, TH, barracks, goldmine, farm, tower, treeline)

unit-visibility-regression.spec.ts (2 tests):
  ✓ Worker bodies readable at default camera after map and asset settle
  ✓ Worker visibility stays valid after explicit asset-refresh hook

m3-scale-measurement.spec.ts (1 test):
  ✓ Scale/layout ratios and structured JSON summary

Verification: 7/7 pass, build clean, tsc clean.
```

Verification:

```bash
npm run build
npx tsc --noEmit -p tsconfig.app.json
./scripts/run-runtime-tests.sh tests/unit-visibility-regression.spec.ts tests/m3-scale-measurement.spec.ts tests/v3-default-camera-readability.spec.ts --reporter=list
./scripts/cleanup-local-runtime.sh
```

### V3 PS2 返回再开局收口复跑

Status: `completed`.

Owner: GLM-style worker + Codex review.

Priority: auto-captured from the adjacent Stage-B front-door runway when the live queue dropped below the ready floor.

Milestone: `V3.1 battlefield + product-shell clarity`.
Gate: `V3-PS2`.
Proof target: 关闭 V3-PS2 的 return-to-menu / re-entry proof：返回后 inactive，source truth 保留，再次开始 clean session。
Why now: 旧的 return/re-entry task 已完成，但 gate 仍开着；需要一个 closeout-oriented rerun 继续推进。
Stop condition: focused specs 全绿，或 failing seam 被点名为 pause return、results return、source truth 或 re-entry stale state。 → **ALL 6 TESTS PASS.**

Allowed files:

- `src/main.ts` — no changes needed
- `src/game/Game.ts` — no changes needed
- `tests/session-return-to-menu-contract.spec.ts` — **fixed** briefing flow step
- `tests/front-door-reentry-start-loop.spec.ts` — **fixed** briefing flow step
- `docs/GLM_READY_TASK_QUEUE.md` only for closeout sync

Goal:

把 V3-PS2 压成真实产品路径，而不是停留在”session shell 已真实”的旧结论。

Must prove:

1. pause 返回菜单后 gameplay inactive，menu 可见。 ✅
2. results 返回菜单后旧 terminal / pause / setup 状态清理。 ✅
3. 再次开始使用当前 source，且不继承旧 phase、summary 或 stale shell 状态。 ✅

Closeout evidence (2026-04-14):

```
session-return-to-menu-contract.spec.ts (3 tests):
  ✓ Live session returns through pause shell (menu visible, pause/results hidden, game paused)
  ✓ Live session returns through results shell (results→menu, matchResult cleared, game paused)
  ✓ Stale pause/results state does not leak into menu (source truthful, gameTime reset)

front-door-reentry-start-loop.spec.ts (3 tests):
  ✓ Menu shows correct source after return-to-menu (procedural label matches)
  ✓ Starting again re-enters play cleanly (isPlaying, menu hidden, units present)
  ✓ Stale state does not leak into restarted session (no pause/results/gameover, gameTime<1)

Fix applied: Tests were not clicking briefing-start-button in the menu→briefing→play flow.
The briefing shell was added between menu and gameplay; tests needed updating to match.

Verification: 6/6 pass, build clean, tsc clean.
```

Verification:

```bash
npm run build
npx tsc --noEmit -p tsconfig.app.json
./scripts/run-runtime-tests.sh tests/session-return-to-menu-contract.spec.ts tests/front-door-reentry-start-loop.spec.ts --reporter=list
./scripts/cleanup-local-runtime.sh
```

### V3 PS3 开局解释层收口复跑

Status: `completed`.

Closeout evidence (2026-04-14):
- All 9/9 focused specs passed on first run — no fixes needed.
- `pre-match-briefing-truth-contract.spec.ts`: 3/3 — source label shows "程序化地图", mode shows "沙盒模式", controls text is truthful.
- `briefing-source-truth-contract.spec.ts`: 3/3 — briefing shell shows correct map source, truthful map mode label, no fake labels.
- `briefing-continue-start-contract.spec.ts`: 3/3 — briefing start button enters play phase, hides briefing shell, spawns units.
- Build clean, tsc clean, no code changes required — explanation layer already truthful and functional.

Owner: GLM-style worker + Codex review.

Priority: auto-captured from the adjacent Stage-B front-door runway when the live queue dropped below the ready floor.

Milestone: `V3.1 battlefield + product-shell clarity`.
Gate: `V3-PS3`.
Proof target: 关闭 V3-PS3 的 truthful explanation proof：source、mode、controls 或目标真实展示，并能进入当前 gameplay。
Why now: 旧的 briefing task 已完成但 gate 还开着；需要一条新标题 rerun 继续清掉 blocker。
Stop condition: focused specs 通过，或 failing seam 被明确点名为 source truth、continue/start 或 fake framing。

Allowed files:

- `index.html`
- `src/main.ts`
- `src/styles.css`
- `tests/pre-match-briefing-truth-contract.spec.ts`
- `tests/briefing-source-truth-contract.spec.ts`
- `tests/briefing-continue-start-contract.spec.ts`
- `docs/GLM_READY_TASK_QUEUE.md` only for closeout sync

Goal:

把 V3-PS3 压成 truthful explanation closeout，而不是继续积累一层看起来像产品但不对齐的页面。

Must prove:

1. 解释层展示当前 source、mode、controls 或目标中的真实信息。
2. continue/start seam 进入当前可玩路径。
3. 文案不暗示 campaign、ladder、完整 skirmish setup 或完整模式池。

Verification:

```bash
npm run build
npx tsc --noEmit -p tsconfig.app.json
./scripts/run-runtime-tests.sh tests/pre-match-briefing-truth-contract.spec.ts tests/briefing-source-truth-contract.spec.ts tests/briefing-continue-start-contract.spec.ts --reporter=list
./scripts/cleanup-local-runtime.sh
```

### V3 CH1 镜头HUD协同收口复跑

Status: `completed`.

Owner: GLM-style worker + Codex review.

Priority: auto-captured from the adjacent Stage-B front-door runway when the live queue dropped below the ready floor.

Milestone: `V3.1 battlefield + product-shell clarity`.
Gate: `V3-CH1`.
Proof target: 关闭 V3-CH1 的 harmony proof：默认镜头 framing、HUD 遮挡、selection ring 和 footprint 一致。
Why now: CH1 仍开着，但旧候选都已跑完；需要一个新标题 focused rerun 继续把 blocker 往前推。
Stop condition: focused specs 通过，或 failing seam 被明确归因为 HUD、framing、ring 或 footprint。

Allowed files:

- `src/main.ts`
- `src/game/Game.ts`
- `tests/m3-camera-hud-regression.spec.ts`
- `tests/v3-camera-hud-footprint-harmony.spec.ts`
- `docs/GLM_READY_TASK_QUEUE.md` only for closeout sync

Goal:

用 focused regression 和必要修正推进 V3-CH1 closeout。

Must prove:

1. 默认镜头 framing 与 HUD 不遮断关键开局信息。
2. selection ring 和 footprint 提示仍然可信。
3. 失败面必须点名，不能再复用 BF1/RD1 的旧结论。

Verification:

```bash
npm run build
npx tsc --noEmit -p tsconfig.app.json
./scripts/run-runtime-tests.sh tests/m3-camera-hud-regression.spec.ts tests/v3-camera-hud-footprint-harmony.spec.ts --reporter=list
./scripts/cleanup-local-runtime.sh
```

Closeout evidence:

- No code changes needed — both spec files already pass.
- Verification: build clean, tsc clean, 11/11 tests passed (1.2m).
- M3 spec 4/4 + V3 spec 7/7 = 11/11 total.
- Key proofs: viewport spread 371×262px, all objects above bottom HUD (558px), below top HUD (50px), selection ring at worker, ghost opacity 0.5, 3 open exits above HUD, comprehensive audit all checks pass.
- Did not close V3-BG1, V3-RD1, V3-AV1, V3-UA1, or any product-shell gate.

### V3 AV1 素材回退清单验证包

Status: `completed`.

Owner: GLM-style worker + Codex review.

Priority: auto-captured from the adjacent Stage-B front-door runway when the live queue dropped below the ready floor.

Milestone: `V3.1 battlefield + product-shell clarity`.
Gate: `V3-AV1`.
Proof target: 关闭或收紧 V3-AV1 所需的 manifest / fallback 证明：legal state、fallback route、blocked assets 和缺图处理一致。
Why now: V3 视觉 slice 仍在推进；队列空掉时必须有一条真实的 manifest validation task 接棒。
Stop condition: manifest 与 focused regression 对齐，或缺口被点名为具体 fallback/blocked 项。

Allowed files:

- `docs/V3_ASSET_FALLBACK_MANIFEST.zh-CN.md`
- `tests/asset-pipeline-regression.spec.ts`
- `docs/GLM_READY_TASK_QUEUE.md` only for closeout sync

Goal:

把 V3-AV1 收成当前可执行的验证包，而不是继续只说“等素材”。

Must prove:

1. manifest 记录 legal proxy、fallback、hybrid、blocked 四类状态。
2. 缺图或回退路径有 focused regression 或明确验证方法。
3. 没有 approved packet 时，不能越权导入真实素材。

Verification:

```bash
npm run build
npx tsc --noEmit -p tsconfig.app.json
./scripts/run-runtime-tests.sh tests/asset-pipeline-regression.spec.ts --reporter=list
./scripts/cleanup-local-runtime.sh
```

### CH1 镜头HUD协同证明包

Status: `completed`.

Closeout evidence (2026-04-14):
- All 7/7 focused specs passed.
- `v3-camera-hud-footprint-harmony.spec.ts` created: 7 tests proving harmony.
- Viewport framing: TH, goldmine, worker, barracks all on screen simultaneously, spread > 100px horizontal.
- Bottom HUD (162px) safe area: all core objects project above hud top (TH 325px, GM 220px, worker 264px, barracks 482px vs 558px threshold).
- Top HUD (50px) safe area: all core objects project below top bar.
- Selection ring: present at worker position, does not mask TH-mine direction (TH-mine dist 196px on screen).
- Ghost footprint: semi-transparent (opacity 0.5), validation-colored (green/red), does not occlude TH or mine centers.
- Exit corridors: 4/4 open (SE, S, SW, E), all project above bottom HUD and below top HUD.
- Comprehensive audit: all checks (viewport, HUD safe areas, selection ring, health bar, ghost, exits) pass together.

Owner: GLM-style worker + Codex review.

Priority: auto-captured from the adjacent Stage-B front-door runway when the live queue dropped below the ready floor.

Milestone: `V3.1 battlefield + product-shell clarity`.
Gate: `V3-CH1`.
Proof target: 关闭 V3-CH1 的 harmony proof：默认镜头 framing、HUD 遮挡、selection ring、footprint 提示和 gap/choke 感知协同成立。
Why now: CH1 仍是 open blocker，且没有 active/ready GLM 任务覆盖；只用 object visible 不能再支撑这个 gate。
Stop condition: focused regression 和 raw/annotated 截图能点名 harmony pass；若 blocked，必须说明破坏面来自 framing、HUD、selection ring 还是 footprint。

Allowed files:

- `src/main.ts`
- `src/game/Game.ts`
- `src/styles.css`
- `tests/v3-camera-hud-footprint-harmony.spec.ts`
- `docs/GLM_READY_TASK_QUEUE.md` only for closeout sync

Goal:

产出 V3-CH1 所需的带 HUD 默认镜头截图、framing proof、safe-area proof、selection ring proof、footprint proof 和 focused regression。

Must prove:

1. 默认镜头截图同时包含 battlefield、HUD、selection ring 或 footprint 交互状态。
2. HUD safe area 不遮挡关键单位、建筑、资源点和 gap/choke 判断。
3. selection ring 与 footprint 提示不会制造误读或遮蔽关键空间关系。

Verification:

```bash
npm run build
npx tsc --noEmit -p tsconfig.app.json
./scripts/run-runtime-tests.sh tests/v3-camera-hud-footprint-harmony.spec.ts --reporter=list
./scripts/cleanup-local-runtime.sh
```

### AV1 回退素材验证包

Status: `completed`.

Closeout evidence (2026-04-14):
- All 6/6 focused specs passed.
- `v3-asset-fallback-manifest.spec.ts` created: 6 tests proving manifest alignment.
- Battlefield: all unit/building types use procedural MeshLambertMaterial fallback or self-made glTF proxy (townhall). No external third-party assets loaded.
- Worker: forced RTS proxy path (always MeshLambertMaterial, worker.glb exists but intentionally skipped).
- Town Hall: starts as procedural fallback, asynchronously loads self-made townhall.glb proxy — both are project-self-made, not approved third-party assets.
- Product shell: all 5 elements (menu, title, briefing, results, help) use CSS/text only — zero img tags, zero real images.
- Shared: selection ring (MeshBasicMaterial procedural), footprint ghost (MeshLambertMaterial procedural + transparent), UI panel (CSS only) — all legal-proxy.
- Comprehensive audit: all 17 manifest items traceable (14 fallback + 3 legal-proxy + 0 hybrid + 0 blocked).
- Manifest updated: townhall entry now documents async glTF proxy replacement behavior.

Owner: GLM-style worker + Codex review.

Priority: auto-captured from the adjacent Stage-B front-door runway when the live queue dropped below the ready floor.

Milestone: `V3.1 battlefield + product-shell clarity`.
Gate: `V3-AV1`.
Proof target: 关闭 V3-AV1 条件 gate 的 implementation proof：fallback id 可追踪、blocked 素材不被加载、无 approved packet 时不会导入真实素材。
Why now: 后续 CH1、RD1 和 PS4 都可能触碰视觉表达；先验证素材回退路径可以减少后续切片的授权风险。
Stop condition: manifest 和 focused check 证明所有触达素材处于 legal proxy / fallback / hybrid / blocked 之一；任何缺失都写成最小后续批准或替换任务。

Allowed files:

- `docs/V3_ASSET_FALLBACK_MANIFEST.zh-CN.md`
- `src/assets`
- `tests/v3-asset-fallback-manifest.spec.ts`
- `docs/GLM_READY_TASK_QUEUE.md` only for closeout sync

Goal:

用最小测试和 manifest 更新证明 V3.1 没有越权导入未批准真实素材，缺图对象都有可追踪 fallback。

Must prove:

1. 所有 V3.1 battlefield 和 product-shell 触达素材都有 manifest 状态。
2. blocked 或未批准真实素材不会进入运行时加载路径。
3. fallback id 能对应到当前可见 proxy 或明确缺图处理。

Verification:

```bash
npm run build
npx tsc --noEmit -p tsconfig.app.json
./scripts/run-runtime-tests.sh tests/v3-asset-fallback-manifest.spec.ts --reporter=list
./scripts/cleanup-local-runtime.sh
```

### BG1 同 build 空间证明包

Status: `completed`.

Closeout evidence (2026-04-14):
- All 7/7 focused specs passed (`tests/v3-battlefield-grammar-proof.spec.ts`).
- TH center: TH at ~(13,14) is the reference point for all spatial relationships.
- Economic axis: Goldmine NE of TH, distance ~4.5, edge gap ~1.0, pathing grid clear.
- Treeline boundary: 187 trees, no TH footprint encroachment, mine path verified clear.
- Exit readability: 4/4 exit directions open (SE/S/SW/E), mine is NE.
- Production zone: Barracks SW of TH, angle >90° from mine, not in gather corridor.
- Farm scale: Within base area, not in mine corridor, supports size reference.
- Defense zone: Tower near SE exit direction, within defense range.
- Comprehensive audit: all 7 grammar checks pass together.
- Layout explanation and checklist filled in `docs/V3_BATTLEFIELD_GRAMMAR_ACCEPTANCE.zh-CN.md`.
- Evidence ledger updated to `engineering-pass`.

Owner: GLM-style worker + Codex review.

Priority: auto-captured from the adjacent Stage-B front-door runway when the live queue dropped below the ready floor.

Milestone: `V3.1 battlefield + product-shell clarity`.
Gate: `V3-BG1`.
Proof target: 关闭 V3-BG1 的 evidence pack：TH、金矿、树线、出口、兵营、农场、塔之间有可解释的空间语法。
Why now: BG1 仍缺同一 build 的四类证据；先补这个包，Codex 才能做有效 closeout，而不是继续记录 insufficient-evidence。
Stop condition: 同一 build 下的截图、说明、focused regression 和 checklist 全部产出；若失败，必须点名缺的是截图、布局说明、测试还是 checklist。

Allowed files:

- `tests/v3-battlefield-grammar-proof.spec.ts`
- `docs/V3_BATTLEFIELD_GRAMMAR_ACCEPTANCE.zh-CN.md`
- `docs/V3_BATTLEFIELD_PRODUCT_SHELL_EVIDENCE_LEDGER.zh-CN.md`
- `artifacts/v3-bg1/`
- `docs/GLM_READY_TASK_QUEUE.md` only for closeout sync

Goal:

产出 V3-BG1 所需的 raw/annotated 默认镜头截图、布局说明、focused regression 和已填写 opening grammar checklist。

Must prove:

1. raw 与 annotated 默认镜头截图来自同一 build。
2. 布局说明能解释 TH、金矿、树线、出口、兵营、农场、塔的空间关系。
3. focused regression 与 opening grammar checklist 指向同一结论。

Verification:

```bash
npm run build
npx tsc --noEmit -p tsconfig.app.json
./scripts/run-runtime-tests.sh tests/v3-battlefield-grammar-proof.spec.ts --reporter=list
./scripts/cleanup-local-runtime.sh
```

### RD1 九类对象可读证明包

Status: `completed`.

Owner: GLM-style worker + Codex review.

Priority: auto-captured from the adjacent Stage-B front-door runway when the live queue dropped below the ready floor.

Milestone: `V3.1 battlefield + product-shell clarity`.
Gate: `V3-RD1`.
Proof target: 关闭 V3-RD1 的 readability evidence pack：每类对象都有可复核的默认镜头可读性证据。
Why now: RD1 仍缺对象级证据，且用户已经指出比例和第一眼 War3-like 感不足；这个包是下一次 Codex 复核的最小输入。
Stop condition: 九类对象都有 raw/annotated 截图、measurement proof、focused regression 和待填或已填 verdict；失败时必须点名具体对象。

Allowed files:

- `tests/v3-default-camera-readability-proof.spec.ts`
- `docs/V3_DEFAULT_CAMERA_READABILITY_REVIEW.zh-CN.md`
- `docs/V3_BATTLEFIELD_PRODUCT_SHELL_EVIDENCE_LEDGER.zh-CN.md`
- `artifacts/v3-rd1/`
- `docs/GLM_READY_TASK_QUEUE.md` only for closeout sync

Goal:

产出 worker、footman、Town Hall、Barracks、Farm、Tower、Goldmine、tree line、terrain aid 的对象级截图、measurement proof、focused regression 和 verdict 占位。

Must prove:

1. 九类对象在默认镜头下都有对象级 evidence entry。
2. measurement proof 不能替代人眼 verdict，只能作为辅助证据。
3. 素材批准、opening grammar 和 HUD harmony 不写成 RD1 已通过。

Verification:

```bash
npm run build
npx tsc --noEmit -p tsconfig.app.json
./scripts/run-runtime-tests.sh tests/v3-default-camera-readability-proof.spec.ts --reporter=list
./scripts/cleanup-local-runtime.sh
```

Closeout evidence:

- `tests/v3-default-camera-readability-proof.spec.ts` created: 10 focused tests covering all 9 object types.
- Verification: build clean, tsc clean, 10/10 tests passed (1.4m).
- Key measurements: worker 42×62px/15 meshes, footman 80×73px/11 meshes (area × 2.25 vs worker), TH 137×139px (anchor competitive × 0.99 vs barracks), farm 65×86px (smallest), tower 74×105px (vertical), goldmine 100×123px (golden emissive), treeline 187 trees/avg 37px < TH, terrain aid manifest-only.
- `docs/V3_DEFAULT_CAMERA_READABILITY_REVIEW.zh-CN.md` updated with per-object measurement evidence, material types, silhouette notes, and verdict table.
- `docs/V3_BATTLEFIELD_PRODUCT_SHELL_EVIDENCE_LEDGER.zh-CN.md` RD1 status updated to `engineering-pass`.
- Residual debt: raw/annotated screenshots (runtime capture), terrain aid visual, human verdict (V3-UA1).
- Did not close V3-AV1, V3-BG1, V3-CH1, or V3-UA1.

### PS1 入口焦点证明包

Status: `completed`.

Owner: GLM-style worker + Codex review.

Priority: auto-captured from the adjacent Stage-B front-door runway when the live queue dropped below the ready floor.

Milestone: `V3.1 battlefield + product-shell clarity`.
Gate: `V3-PS1`.
Proof target: 关闭 V3-PS1 的 front-door focus proof：当前可玩入口清晰突出，source、mode 和 start path 真实。
Why now: PS1 仍缺入口焦点证据，而 GLM 当前 live queue 没有 PS1 active/ready 任务；这是 product-shell clarity 的最小可派发切片。
Stop condition: focused proof 和审计记录能证明入口焦点成立；若失败，必须说明问题来自层级、source truth、mode truth 还是 fake route。

Allowed files:

- `index.html`
- `src/main.ts`
- `src/styles.css`
- `tests/v3-product-shell-focus-proof.spec.ts`
- `docs/GLM_READY_TASK_QUEUE.md` only for closeout sync

Goal:

产出 primary action hierarchy proof、source/mode truth summary、disabled/absent branch audit 和 no fake route scan。

Must prove:

1. 当前可玩入口是主行动，并说明当前 source、mode 或 start path。
2. campaign、ladder、完整模式池等不可玩分支 disabled 或 absent。
3. 没有与当前可玩入口同权的 fake route。

Verification:

```bash
npm run build
npx tsc --noEmit -p tsconfig.app.json
./scripts/run-runtime-tests.sh tests/v3-product-shell-focus-proof.spec.ts --reporter=list
./scripts/cleanup-local-runtime.sh
```

Closeout evidence:

- `tests/v3-product-shell-focus-proof.spec.ts` created: 8 focused tests.
- `src/main.ts` fixed: pause/results shells hidden when menu shell shown.
- Verification: build clean, tsc clean, 8/8 passed (1.8m).
- Key proofs: start button primary, source = "程序化地图", mode = "遭遇战", campaign disabled, ladder/multiplayer absent, no fake routes, honest menu→briefing→gameplay flow.
- Did not close V3-PS2, V3-PS4, V3-PS5, V3-AV1, or V3-UA1.

### PS2 返回再开局证明包

Status: `completed`.

Owner: GLM-style worker + Codex review.

Priority: auto-captured from the adjacent Stage-B front-door runway when the live queue dropped below the ready floor.

Milestone: `V3.1 battlefield + product-shell clarity`.
Gate: `V3-PS2`.
Proof target: 关闭 V3-PS2 的 proof pack：返回后 gameplay inactive，menu 可见，source truth 保留，再次 start 不带旧 selection、placement、results、pause/setup 状态。
Why now: V3-PS2 当前仍 blocked；GLM live queue 没有 active/ready 的 PS2 任务，且这是产品壳层闭环的最小工程缺口。
Stop condition: focused specs 和证据记录覆盖五个缺口；若失败，必须点名失败发生在 return、inactive、source truth、re-entry 还是 stale cleanup。

Allowed files:

- `index.html`
- `src/main.ts`
- `src/game/Game.ts`
- `tests/v3-product-shell-return-reentry-proof.spec.ts`
- `docs/GLM_READY_TASK_QUEUE.md` only for closeout sync

Goal:

产出 return-to-menu、gameplay inactive、source truth preserved、clean re-entry 和 stale cleanup 的 focused proof。

Must prove:

1. pause/results 返回 menu 后 gameplay inactive。
2. 返回后当前 source 和 mode 说明仍真实。
3. 再次开始不会继承上一局 selection、placement、command card、results 或 shell 状态。

Verification:

```bash
npm run build
npx tsc --noEmit -p tsconfig.app.json
./scripts/run-runtime-tests.sh tests/v3-product-shell-return-reentry-proof.spec.ts --reporter=list
./scripts/cleanup-local-runtime.sh
```

### PS2 残留交互清理证明包

Status: `completed`.

Owner: GLM-style worker + Codex review.

Priority: auto-captured from the adjacent Stage-B front-door runway when the live queue dropped below the ready floor.

Milestone: `V3.1 battlefield + product-shell clarity`.
Gate: `V3-PS2`.
Proof target: 关闭 V3-PS2 剩余缺口的 proof pack：再次 start 后没有旧 selection、placement ghost/build mode、command-card 按钮或 results/pause shell 状态。
Why now: V3-PS2 当前缺口已经缩到 stale cleanup；GLM live queue 没有 active/ready 的 PS2 stale cleanup 任务。
Stop condition: focused spec 覆盖 selection、placement、command-card 三类残留；若失败，必须点名具体 stale surface。

Allowed files:

- `src/main.ts`
- `src/game/Game.ts`
- `tests/v3-product-shell-stale-cleanup-proof.spec.ts`
- `docs/GLM_READY_TASK_QUEUE.md` only for closeout sync

Goal:

在现有 return/re-entry 通过的基础上，增加 stale cleanup focused proof，并保留 source truth 不回退。

Must prove:

1. 再次开始后没有继承上一局 selected unit 或 selection ring。
2. 再次开始后没有继承 placement ghost、build mode 或 footprint preview。
3. 再次开始后 command card、results、pause/setup shell 状态恢复到新局初始状态。

Verification:

```bash
npm run build
npx tsc --noEmit -p tsconfig.app.json
./scripts/run-runtime-tests.sh tests/v3-product-shell-stale-cleanup-proof.spec.ts --reporter=list
./scripts/cleanup-local-runtime.sh
```

### AV1 回退目录验证包

Status: `completed`.

Owner: GLM-style worker + Codex review.

Priority: auto-captured from the adjacent Stage-B front-door runway when the live queue dropped below the ready floor.

Milestone: `V3.1 battlefield + product-shell clarity`.
Gate: `V3-AV1`.
Proof target: V3-AV1 的 fallback handoff proof：九类 A1 battlefield target key 均解析到批准的 S0 fallback route，真实素材 approved packet 仍为 none 时不会被导入。
Why now: V3-AV1 已经 fallback-handoff-ready；需要 GLM 执行目录边界和回归验证，让视觉 slice 能继续推进但不越权 sourcing。
Stop condition: catalog/manifest/test 证明九类 target key 可解析且不依赖未批准素材；不得声称关闭 BG1、RD1、CH1、UA1 或菜单质量。

Allowed files:

- `src/game/AssetCatalog.ts`
- `src/game/visuals/`
- `tests/v3-asset-fallback-catalog-proof.spec.ts`
- `docs/GLM_READY_TASK_QUEUE.md` only for closeout sync

Goal:

把 asset-handoff-a1-s0-fallback-001 落到可验证目录和回归证明，确保缺图路线稳定、可追踪、可回退。

Must prove:

1. 九类 A1 battlefield target key 都绑定到 asset-handoff-a1-s0-fallback-001 允许的 S0 fallback。
2. 缺少真实素材时不会崩溃、不会引用外部未批准文件、不会伪装成 approved import。
3. GLM 不做 sourcing、授权判断、风格审批或真实素材导入。

Verification:

```bash
npm run build
npx tsc --noEmit -p tsconfig.app.json
./scripts/run-runtime-tests.sh tests/v3-asset-fallback-catalog-proof.spec.ts --reporter=list
./scripts/cleanup-local-runtime.sh
```

### RD1 截图标注证明包

Status: `completed`.

Closeout evidence:

- `tests/v3-default-camera-readability-proof.spec.ts` 11/11 pass (1.2m): 新增 test 11 `screenshot capture: raw default-camera image with build binding`，捕获 raw canvas 截图并计算九类对象 NDC 坐标、像素尺寸、材质类型、剪影描述的 annotation JSON。
- `artifacts/v3-rd1-readability/annotation-binding.md` 写入：build binding (FOV 45, distance 24, viewport 1280×720)、八类视觉对象 annotation 表、面积比阈值、terrain aid manifest-only fallback gap 记录。
- V3-RD1 升级为 `engineering-pass`：measurement proof + screenshot capture + annotation binding 完备，但仍缺用户或目标 tester 人眼 readability verdict (V3-UA1)。
- `docs/V3_BATTLEFIELD_PRODUCT_SHELL_EVIDENCE_LEDGER.zh-CN.md` 已更新。

Verification:

```bash
npm run build                    # clean
npx tsc --noEmit -p tsconfig.app.json  # clean
./scripts/run-runtime-tests.sh tests/v3-default-camera-readability-proof.spec.ts --reporter=list  # 11/11 pass (1.2m)
./scripts/cleanup-local-runtime.sh
```

Owner: GLM-style worker + Codex review.

Priority: auto-captured from the adjacent Stage-B front-door runway when the live queue dropped below the ready floor.

Milestone: `V3.1 battlefield + product-shell clarity`.
Gate: `V3-RD1`.
Proof target: V3-RD1 截图 proof：worker、footman、Town Hall、Barracks、Farm、Tower、Goldmine、tree line、terrain aid 在默认镜头截图中有可复核标注。
Why now: RD1 的 focused regression 和 measurement proof 已通过，但 Codex closeout 仍因缺截图包、tester verdict 和 terrain aid runtime visual 保持 open。
Stop condition: 截图包、标注说明、build/route/seed 和命令结果绑定完成；若 terrain aid 没有运行时视觉，必须明确标为缺口而不是通过。

Allowed files:

- `tests/v3-default-camera-readability-proof.spec.ts`
- `artifacts/v3-rd1-readability/`
- `docs/GLM_READY_TASK_QUEUE.md`
- `docs/GLM_READY_TASK_QUEUE.md` only for closeout sync

Goal:

产出同 build raw/annotated 默认镜头截图，并把截图与 tests/v3-default-camera-readability-proof.spec.ts 的 10/10 结果绑定。

Must prove:

1. raw default-camera screenshot 与 10/10 focused command 是同一 build / route / seed。
2. annotated screenshot 标出九类 RD1 对象，不能用特写或裁剪图替代默认镜头。
3. terrain aid 若仍是 manifest-only fallback，必须在 closeout 中保留缺口。

Verification:

```bash
npm run build
npx tsc --noEmit -p tsconfig.app.json
./scripts/run-runtime-tests.sh tests/v3-default-camera-readability-proof.spec.ts --reporter=list
./scripts/cleanup-local-runtime.sh
```

### P1 开局压力证明包

Status: `completed`.

Closeout evidence:

- `tests/v4-opening-pressure-proof.spec.ts` 6/6 pass (1.3m)。
- Test 1 — AI military production at t=60: AI 有 >=1 footman, >=1 barracks, 已花费资源。
- Test 2 — AI first attack wave at t=180: AI footmen 到达或接近玩家基地，waveCount >= 1。
- Test 3 — AI economic harassment at t=240: AI 发起 >=1 attack wave，玩家 TH 受损或被摧毁或 AI targeting player。
- Test 4 — AI production throughput (5-minute timeline): t=60/120/180/240/300 五个时间点采样，AI 持续生产 footmen，经济持续（workers >= 3），至少一个时间点 footmen 到达玩家基地。
- Test 5 — AI not idle at t=300: AI waveCount >= 1, footmen > 0。
- Test 6 — Comprehensive 7-point audit: military production、attack waves、territorial pressure、economy sustained、player under pressure、production infrastructure、game active/ended 全部 pass。

Closeout audit result: gameTime=192.6s, waveCount=4, aiFootmen=2, aiWorkers=13, player defeated (TH destroyed), phase=game_over, gameOverResult=defeat.

V4-P1 conclusion: AI 在约 3 分钟内发起军事进攻、产生可观测压力、并在约 3.2 分钟内击败玩家。这证明 V4-P1 的压力路径成立：进攻压力类型确实存在，且能与 state log 对齐。

这不能证明 V4-R1（恢复反打）、V4-E1（胜负结果）或游戏平衡。

No code changes to Game.ts or SimpleAI.ts required — AI pressure was already functional.

Verification:

```bash
npm run build                    # clean
npx tsc --noEmit -p tsconfig.app.json  # clean
./scripts/run-runtime-tests.sh tests/v4-opening-pressure-proof.spec.ts --reporter=list  # 6/6 pass (1.3m)
./scripts/cleanup-local-runtime.sh
```

Owner: GLM-style worker + Codex review.

Priority: auto-captured from the adjacent Stage-B front-door runway when the live queue dropped below the ready floor.

Milestone: `V4 short-match alpha`.
Gate: `V4-P1`.
Proof target: V4-P1 pressure path proof：进攻、骚扰、资源威胁、生产压力或地图压力至少一种成立，且证据能和截图或 state log 对齐。
Why now: V4 当前三个 blocker 都还是 preheat-open / not-active；请求 lane 是 GLM，最适合先补一个 bounded runtime proof pack 给 Codex 收口。
Stop condition: focused command 通过并产出时间线、state log、截图或事件证据；如果压力路径不存在，记录最小 failing surface 而不是做大范围玩法重构。

Allowed files:

- `tests/v4-opening-pressure-proof.spec.ts`
- `src/game/Game.ts`
- `src/game/SimpleAI.ts`
- `docs/GLM_READY_TASK_QUEUE.md` only for closeout sync

Goal:

产出 V4-P1 的 focused proof pack，记录开局到约 5 分钟的压力时间线、压力类型、玩家可见威胁和状态日志。

Must prove:

1. 开局到约 5 分钟内 AI 或系统压力没有长期 idle。
2. 玩家能看到至少一种真实压力类型，并能从 state log 或截图定位。
3. focused regression、时间线记录和截图或事件记录互相对齐。

Verification:

```bash
npm run build
npx tsc --noEmit -p tsconfig.app.json
./scripts/run-runtime-tests.sh tests/v4-opening-pressure-proof.spec.ts --reporter=list
./scripts/cleanup-local-runtime.sh
```

### R1 恢复反打证明包

Status: `completed`.

Closeout evidence:

- `tests/v4-recovery-counter-proof.spec.ts` 5/5 pass (38.4s)。
- Test 1 — 受损 fixture：kill 3/5 workers + TH HP 降到 40%，g.handleDeadUnits 正确清理，剩余 2 workers 存活。
- Test 2 — 经济恢复：TH 训练 2 replacement workers + gold rally，50s 后 worker 数恢复到 >=4，>=1 worker 进入 gather 状态。
- Test 3 — 军事反打：barracks 训练 3 footmen，55s 后 >=2 footmen 存活，attack-move 向 AI 基地方向移动。
- Test 4 — Command surface 完整性：damaged state 下 select worker → clear → reselect，全程 selection/placement/attack-move 干净。
- Test 5 — 综合审计 6 点全 pass：damage、recovery、gather、military、counter、surfaces。
- AI disabled (g.ai.update = () => {})，避免 AI 干扰受控 fixture。
- 关键发现：g.handleDeadUnits() 重赋 this.units，后续读必须用 g.units 而不是缓存的旧引用。

V4-R1 conclusion：受损后恢复路径存在——补 worker、恢复采集、补 footmen、attack-move 反击、command surface 不残留。

这不能证明游戏平衡或真实开局恢复窗口（真实开局中 AI 在 t≈180s 发起进攻、t≈192s 摧毁玩家主基地，P1 proof 已证明）。

No code changes to Game.ts or SimpleAI.ts required.

Verification:

```bash
npm run build                    # clean
npx tsc --noEmit -p tsconfig.app.json  # clean
./scripts/run-runtime-tests.sh tests/v4-recovery-counter-proof.spec.ts --reporter=list  # 5/5 pass (38.4s)
./scripts/cleanup-local-runtime.sh
```

Owner: GLM-style worker + Codex review.

Priority: auto-captured from the adjacent Stage-B front-door runway when the live queue dropped below the ready floor.

Milestone: `V4 short-match alpha`.
Gate: `V4-R1`.
Proof target: V4-R1 recovery/counter proof：玩家在被压或损失后能补 worker、恢复采集、补生产、重新集结、反击或守住关键点。
Why now: P1 只能证明压力存在；V4 short-match alpha 还必须证明压力后有玩家可理解的恢复与反打路线。
Stop condition: focused command 通过并记录 damaged state、recovery action、counter window 和 command surface；如果缺路线，点名失败 surface，不扩大到完整策略系统。

Allowed files:

- `tests/v4-recovery-counter-proof.spec.ts`
- `src/game/Game.ts`
- `src/game/SimpleAI.ts`
- `docs/GLM_READY_TASK_QUEUE.md` only for closeout sync

Goal:

产出 V4-R1 的 focused proof pack，覆盖受损 fixture、恢复动作、生产或采集恢复、反击窗口和 command surface 不残留。

Must prove:

1. 测试 fixture 能进入受压或受损状态。
2. 玩家或系统能执行可见恢复动作，并恢复采集、生产、集结、反击或守点中的至少一类路径。
3. 恢复和反打过程中 selection、placement、command-card 等 command surface 不继承 stale 状态。

Verification:

```bash
npm run build
npx tsc --noEmit -p tsconfig.app.json
./scripts/run-runtime-tests.sh tests/v4-recovery-counter-proof.spec.ts --reporter=list
./scripts/cleanup-local-runtime.sh
```

### E1 胜负结果证明包

Status: `completed`.

Owner: GLM-style worker + Codex review.

Priority: auto-captured from the adjacent Stage-B front-door runway when the live queue dropped below the ready floor.

Milestone: `V4 short-match alpha`.
Gate: `V4-E1`.
Proof target: V4-E1 truthful result proof：短局能诚实结束或诚实说明未结束，不能假装天梯、战役、正式战报或长期统计。
Why now: V4 的短局 alpha 需要有可信闭环；结果 proof 能阻止后续把半成品结束面包装成完整产品结果。
Stop condition: focused command 通过并记录 win/lose/timeout-stall 覆盖范围、结果文案、summary 字段来源和 return path 状态；未覆盖项明确留作 blocker。

Allowed files:

- `tests/v4-ending-result-truth-proof.spec.ts`
- `src/main.ts`
- `src/game/Game.ts`
- `docs/GLM_READY_TASK_QUEUE.md` only for closeout sync

Goal:

产出 V4-E1 的 focused proof pack，覆盖结果触发条件、结果文案、summary 字段和返回后的状态清理。

Must prove:

1. win、lose、timeout/stall 至少按 V4 gate 要求被触发或被明确记录为未覆盖。
2. results surface 和 summary 字段来自真实 session state。
3. 返回后不会保留旧结果、旧 shell 或旧 gameplay 状态。

Verification:

```bash
npm run build
npx tsc --noEmit -p tsconfig.app.json
./scripts/run-runtime-tests.sh tests/v4-ending-result-truth-proof.spec.ts --reporter=list
./scripts/cleanup-local-runtime.sh
```

Closeout evidence:

- GLM 初版 proof 5/5 pass；Codex 复核发现 stall 未覆盖，且 return-to-menu 测试手动隐藏 DOM，不能作为最终 E1 证据。
- Codex 将 proof 加强为 6/6 pass (48.5s)。
- Defeat: TH destroyed → matchResult=defeat, overlay="失败", phase=game_over。
- Victory: AI TH destroyed → matchResult=victory, overlay="胜利"。
- Stall: 12min timeout → matchResult=stall, overlay="僵局", summary 显示 `时长 12:00`。
- Summary truth: 时长、我方单位/建筑、敌方单位/建筑都匹配 endGame 后的真实 `g.units` state。
- Return-to-menu: 点击真实 results shell 返回按钮后，overlay/text/results summary 清空，results/pause shell 隐藏，menu shell 可见，matchResult 清空。
- No fake labels: no 天梯/rank/排名/积分/rating/战报/统计/赛季/ELO/MMR/段位。"战役"仅出现在 disabled 按钮"战役（未实现）"中。
- No code changes to Game.ts or main.ts required。

### Task 101 — ECO1 经济产能主链证明包

Status: `completed`.

Owner: GLM-style worker + Codex review.

Priority: auto-captured from the adjacent Stage-B front-door runway when the live queue dropped below the ready floor.

Allowed files:

- `tests/v5-economy-production-backbone.spec.ts`
- `src/game/Game.ts`
- `src/game/SimpleAI.ts`
- `src/game/GameData.ts`
- `docs/GLM_READY_TASK_QUEUE.md` only for closeout sync

Goal:

证明资源、worker、supply、生产队列能支撑连续生产，而不是只消耗初始资源。

Must prove:

1. worker、gold/lumber、supply、Town Hall、Barracks、Farm 或等价 production chain 能支持连续生产。
2. 生产队列和 supply 约束来自真实 runtime state，不是测试里硬造结果。
3. 受损后能补 worker 或补兵，并记录资源流和队列状态；如果断链，点名最小失败面。

Verification:

```bash
npm run build
npx tsc --noEmit -p tsconfig.app.json
./scripts/run-runtime-tests.sh tests/v5-economy-production-backbone.spec.ts --reporter=list
./scripts/cleanup-local-runtime.sh
```

### Task 102 — TECH1 科技建造顺序证明包

Status: `completed`.

Owner: GLM-style worker + Codex review.

Priority: auto-captured from the adjacent Stage-B front-door runway when the live queue dropped below the ready floor.

Started: 2026-04-14.

Completed: 2026-04-14.

Outcome:

- `tests/v5-tech-build-order-backbone.spec.ts` — 6/6 pass (50.9s)
- All proofs use behavioral verification (no BUILDINGS definition access, no state teleport)
- Key discovery: `TeamResources.get()` returns a copy, must use `earn(team, -gold, -lumber)` to drain
- Game starts with pre-built barracks; tests destroy it to prove prerequisite chain
- Resource prerequisite proven via kill-all-workers + earn-to-0 + HUD button disabled check

Verification:

```
npm run build          # ✓ built in 1.09s
tsc --noEmit           # ✓ clean
run-runtime-tests.sh   # ✓ 6 passed (50.9s)
cleanup-local-runtime  # ✓ done
```

Allowed files:

- `tests/v5-tech-build-order-backbone.spec.ts`
- `src/game/Game.ts`
- `src/game/GameData.ts`
- `docs/GLM_READY_TASK_QUEUE.md` only for closeout sync

Goal:

证明至少一条 build order 会解锁或强化后续选择，建筑和科技不是装饰。

Must prove:

1. build order 有前置条件、建造顺序和可观察的解锁或强化结果。
2. 前置缺失时有明确失败或禁用状态，不能默默允许假科技。
3. proof 输出 timeline，说明玩家为什么能看懂这个建造/科技选择。

Verification:

```bash
npm run build
npx tsc --noEmit -p tsconfig.app.json
./scripts/run-runtime-tests.sh tests/v5-tech-build-order-backbone.spec.ts --reporter=list
./scripts/cleanup-local-runtime.sh
```

### Task 103 — COUNTER1 基础克制与兵种组成证明包

Status: `completed`.

Owner: GLM-style worker + Codex review.

Priority: auto-captured from the adjacent Stage-B front-door runway when the live queue dropped below the ready floor.

Allowed files:

- `tests/v5-counter-composition-backbone.spec.ts`
- `src/game/Game.ts`
- `src/game/SimpleAI.ts`
- `src/game/GameData.ts`
- `docs/GLM_READY_TASK_QUEUE.md` only for closeout sync

Goal:

证明至少一个 counter 或兵种组成选择会改变生产、编队或战斗结果。

Must prove:

1. 至少一个 counter relation 或 army composition choice 影响战斗结果或生产选择。
2. state log 能记录双方 composition、关键战斗事件和结果差异。
3. 不能把单一单位互殴或纯数值胜负写成 counter backbone pass。

Verification:

```bash
npm run build
npx tsc --noEmit -p tsconfig.app.json
./scripts/run-runtime-tests.sh tests/v5-counter-composition-backbone.spec.ts --reporter=list
./scripts/cleanup-local-runtime.sh
```

Closeout:

- GLM exceeded the soft limit and left the first focused proof failing, so Codex took over the closeout.
- `tests/v5-counter-composition-backbone.spec.ts` now proves unit quality, armor damage reduction, army composition damage difference, static-defense composition difference, and a bounded strategy audit.
- Focused runtime result: `./scripts/run-runtime-tests.sh tests/v5-counter-composition-backbone.spec.ts --reporter=list` -> `5/5 passed`.
- This closes only `V5-COUNTER1`; it does not close `V5-HUMAN1` or claim complete combat balance.

### Task 104 — H1 Blacksmith 与 Rifleman 可玩切片

Status: `done`.

Owner: GLM-style worker + Codex review.

Prerequisite: `H1 人族火枪手科技线范围包` completed.

Scope packet: `docs/HUMAN_H1_RIFLEMAN_SCOPE_PACKET.zh-CN.md`.

Priority: 用户试玩指出当前没有其他兵种和科技；这是 V5-HUMAN1 的第一条玩家可见人族 roster/tech 切片。

Allowed files:

- `src/game/GameData.ts`
- `src/game/Game.ts`
- `src/game/AssetCatalog.ts`
- `tests/v5-human-rifleman-techline.spec.ts`
- `docs/GLM_READY_TASK_QUEUE.md` only for closeout sync

Goal:

新增最小 Blacksmith + Rifleman 玩家可玩链路：玩家能建 Blacksmith，Barracks 在 Blacksmith 完成后能训练 Rifleman；没有 Blacksmith 时命令卡必须给出真实禁用原因。

Must prove:

1. Rifleman 是真实单位数据，不是测试里直接 spawn 的假单位。
2. Barracks 命令卡能显示 Rifleman；前置缺失时 disabled reason 可见。
3. Blacksmith 完成后 Rifleman 可训练，资源和人口被真实扣除，新单位真实出生。
4. Rifleman 有基础远程攻击行为，且能在默认镜头里用 fallback/proxy 读出来是远程单位。
5. 不做 Long Rifles、不做完整 Blacksmith 三段攻防、不做英雄/法术/车间/空军。

Material boundary:

- 只允许自制 fallback / proxy。
- 禁止官方提取模型、官方图标、官方音频、截图转贴图、来源不明素材和未批准第三方素材。
- GLM 不做 sourcing、授权判断或风格审批。

Runtime proof:

- 必须从玩家真实建造 / 训练路径证明 Blacksmith 和 Rifleman。
- 建造、训练、击杀、重载或 cleanup 后必须重新读取 `window.__war3Game` / `g.units`，不能用旧单位快照作为 proof。

Verification:

```bash
npm run build
npx tsc --noEmit -p tsconfig.app.json
./scripts/run-runtime-tests.sh tests/v5-human-rifleman-techline.spec.ts --reporter=list
./scripts/cleanup-local-runtime.sh
```

### Task 105 — H1 Long Rifles 研究切片

Status: `done`.

Owner: GLM-style worker + Codex review.

Prerequisite: `Task 104 — H1 Blacksmith 与 Rifleman 可玩切片` completed.

Scope packet: `docs/HUMAN_H1_RIFLEMAN_SCOPE_PACKET.zh-CN.md`.

Priority: H1 不能只新增 Rifleman 按钮；必须有一个玩家可研究、可验证的科技选择。

Allowed files:

- `src/game/GameData.ts`
- `src/game/Game.ts`
- `tests/v5-human-long-rifles-tech.spec.ts`
- `docs/GLM_READY_TASK_QUEUE.md` only for closeout sync

Goal:

新增最小 `Long Rifles` 研究：研究完成后 Rifleman 射程增加，命令卡显示真实研究状态，不能重复研究。

Must prove:

1. Long Rifles 通过真实 research queue 或等价研究状态完成，不是测试直接改数值。
2. 研究前后 Rifleman attackRange 或实战交战距离有可复跑差异。
3. 资源不足、前置不足或已研究时，命令卡原因真实可见。
4. 不做 Blacksmith 全攻防三段、不做 Rifleman 之外的科技。

Material boundary:

- 只允许自制 Long Rifles fallback / proxy 图标或文字状态。
- 禁止官方升级图标、来源不明素材和未批准第三方素材。
- GLM 不做 sourcing、授权判断或风格审批。

Runtime proof:

- 必须从真实研究入口证明研究前、研究中或研究后状态。
- 必须记录研究前后 Rifleman 射程或交战距离的 state log。
- 研究完成、训练新 Rifleman 或 cleanup 后必须重新读取 fresh runtime state。

Verification:

```bash
npm run build
npx tsc --noEmit -p tsconfig.app.json
./scripts/run-runtime-tests.sh tests/v5-human-long-rifles-tech.spec.ts --reporter=list
./scripts/cleanup-local-runtime.sh
```

### Task 106 — H1 AI Rifleman 组成切片

Status: `done`.

Owner: GLM-style worker + Codex review.

Prerequisite: `Task 105 — H1 Long Rifles 研究切片` completed.

Scope packet: `docs/HUMAN_H1_RIFLEMAN_SCOPE_PACKET.zh-CN.md`.

Priority: V5-HUMAN1 要求新人族 roster/tech 进入真实 match loop；AI 不能继续只出 Footman。

Allowed files:

- `src/game/SimpleAI.ts`
- `tests/v5-human-ai-rifleman-composition.spec.ts`
- `docs/GLM_READY_TASK_QUEUE.md` only for closeout sync

Goal:

让 AI 在同一套 Blacksmith/Rifleman/Long Rifles 规则下形成可观察 composition：会建 Blacksmith，会训练 Rifleman，必要时研究 Long Rifles。

Must prove:

1. AI 不直接 spawn Rifleman，不绕过资源、人口、建筑前置或研究规则。
2. state log 记录 AI 的 Blacksmith、Rifleman、Long Rifles 或未研究原因。
3. AI composition 与原 footman-only 路线有可观察差异。
4. 不做完整 build order 智能、不做平衡 polish、不做英雄/法术/空军。

Material boundary:

- 继续沿用 Task 104 / 105 的 fallback / proxy，不新增真实素材导入。
- 禁止官方提取素材、来源不明素材和未批准第三方素材。

Runtime proof:

- 必须证明 AI 使用同一套 Blacksmith / Rifleman / Long Rifles runtime 规则。
- 必须记录 AI 资源、人口、建筑前置、训练和研究状态。
- AI 建造、训练、研究、战斗或 cleanup 后必须重新读取 `window.__war3Game` / `g.units`。
- H1 AI composition 可以作为未来 COUNTER1 输入，但不能关闭 `V5-COUNTER1`。

Verification:

```bash
npm run build
npx tsc --noEmit -p tsconfig.app.json
./scripts/run-runtime-tests.sh tests/v5-human-ai-rifleman-composition.spec.ts --reporter=list
./scripts/cleanup-local-runtime.sh
```

### Task 107 — Lumber Mill 与塔分支最小可玩切片

Status: `accepted`.

Owner: GLM-style worker + Codex review.

Priority: auto-captured from the adjacent Stage-B front-door runway when the live queue dropped below the ready floor.

Allowed files:

- `src/game/GameData.ts`
- `src/game/Game.ts`
- `tests/v7-lumber-mill-tower-branch-proof.spec.ts`
- `docs/GLM_READY_TASK_QUEUE.md` only for closeout sync

Goal:

让 Lumber Mill 或 tower branch 中的选定范围进入真实前置、命令卡和 runtime proof。

Scope lock:

- 本任务只做 `Lumber Mill + Guard Tower` 最小塔线。
- 不得修改 `src/game/BuildingVisualFactory.ts`、资产、图标或模型文件。
- 如果没有视觉代理也能完成数据、前置、命令卡和 runtime proof，就继续；如果不能，就输出 `JOB_BLOCKED`，不要越界。

Must prove:

1. 选定建筑或塔分支有真实数据、成本、前置、建造或升级入口。
2. 命令卡能显示可用、禁用、建造中或完成状态。
3. focused runtime 从 fresh state 证明入口和状态来自真实数据，不是按钮占位。

Verification:

```bash
npm run build
npx tsc --noEmit -p tsconfig.app.json
./scripts/run-runtime-tests.sh tests/v7-lumber-mill-tower-branch-proof.spec.ts --reporter=list
./scripts/cleanup-local-runtime.sh
```

Codex acceptance:

- `npm run build`：passed。
- `npx tsc --noEmit -p tsconfig.app.json`：passed。
- `./scripts/run-runtime-tests.sh tests/v7-lumber-mill-tower-branch-proof.spec.ts --reporter=list`：6/6 passed。
- `./scripts/run-runtime-tests.sh tests/command-surface-regression.spec.ts --reporter=list`：13/13 passed after updating the old tower expectation to the new Lumber Mill prerequisite rule.
- `./scripts/cleanup-local-runtime.sh`：passed；无 Vite / Playwright / Chromium 残留。
- Scope review：GLM 曾短暂修改 `BuildingVisualFactory.ts`，Codex 打断后已撤回 `lumber_mill` 视觉代理；accepted diff 不依赖该越界文件。

### Task 108 — Arcane Sanctum 法师基础切片

Status: `accepted`.

Owner: GLM-style worker + Codex review.

Priority: auto-captured from the adjacent Stage-B front-door runway when the live queue dropped below the ready floor.

Prerequisite: `Task 107 — Lumber Mill 与塔分支最小可玩切片` accepted.

Retry note:

- 误派发 job `glm-mnzggrwa-tusv5u` 已取消。
- Task 107 与 Task 109 均已 Codex accepted。
- 本任务已恢复为 `ready`；下一次 GLM 空闲时应优先执行 Priest caster mana 线，不得复用旧取消 job 的输出。

Allowed files:

- `src/game/GameData.ts`
- `src/game/Game.ts`
- `tests/v7-arcane-sanctum-caster-proof.spec.ts`
- `docs/GLM_READY_TASK_QUEUE.md` only for closeout sync

Goal:

让 Priest 或 Sorceress 中的一个最小法师能力进入 mana、cast、效果、限制和 HUD proof。

Scope lock:

- 本任务选 `Priest` 作为 V7 最小法师线。
- 不扩张到 Sorceress、Spell Breaker、Adept/Master 全量训练或完整法师科技树。

Must prove:

1. 选定法师或能力有 mana、cooldown、target 或 duration 中至少一条真实限制。
2. 触发后 state、战斗或单位状态发生可测变化。
3. HUD 或命令卡能解释能力可用、不可用和触发后的状态。

Verification:

```bash
npm run build
npx tsc --noEmit -p tsconfig.app.json
./scripts/run-runtime-tests.sh tests/v7-arcane-sanctum-caster-proof.spec.ts --reporter=list
./scripts/cleanup-local-runtime.sh
```

### Task 109 — Workshop / Mortar 战斗模型切片

Status: `accepted`.

Owner: GLM-style worker + Codex review.

Priority: auto-captured from the adjacent Stage-B front-door runway when the live queue dropped below the ready floor.

Allowed files:

- `src/game/GameData.ts`
- `src/game/Game.ts`
- `tests/v7-workshop-mortar-combat-model-proof.spec.ts`
- `docs/GLM_READY_TASK_QUEUE.md` only for closeout sync

Goal:

让 Mortar Team 或等价攻城切片证明 projectile、AOE、target filter 中至少一类高级战斗模型。

Scope lock:

- 本任务选 `Workshop + Mortar Team`。
- 不扩张到 Flying Machine、Siege Engine、Flare、Fragmentation Shards 或完整 Workshop 科技树。

Must prove:

1. 选定攻城单位或模型的差异来自 GameData 或统一 combat model。
2. focused combat fixture 能观察 projectile、AOE 或 target filter 的真实行为。
3. proof 不把单场胜负、改名或静态数字写成高级战斗模型通过。

Verification:

```bash
npm run build
npx tsc --noEmit -p tsconfig.app.json
./scripts/run-runtime-tests.sh tests/v7-workshop-mortar-combat-model-proof.spec.ts --reporter=list
./scripts/cleanup-local-runtime.sh
```

### Task 110 — V7 内容 AI 同规则使用切片

Status: `accepted`.

Owner: GLM-style worker + Codex takeover.

Priority: auto-captured from the adjacent Stage-B front-door runway when the live queue dropped below the ready floor.

Allowed files:

- `src/game/SimpleAI.ts`
- `tests/v7-ai-same-rule-content-proof.spec.ts`
- `docs/GLM_READY_TASK_QUEUE.md` only for closeout sync

Goal:

让 AI 按资源、人口、前置、科技使用一个 V7 选定内容。

Scope lock:

- 只有当 Task 107、108 或 109 至少一个被 Codex accepted 后，本任务才应使用该内容。
- 如果没有已 accepted 的 V7 内容，本任务必须 blocked，不得伪造 AI 使用。

Must prove:

1. AI 使用 V7 选定内容时不直接 spawn、不跳过资源、人口、建筑前置或研究前置。
2. AI 的 build、train、research 或 combat choice 至少一条路径能在受控 runtime 中复现。
3. 如果 V7 内容尚未足够，测试必须明确 blocked 面，而不是伪造完成。

Verification:

```bash
npm run build
npx tsc --noEmit -p tsconfig.app.json
./scripts/run-runtime-tests.sh tests/v7-ai-same-rule-content-proof.spec.ts --reporter=list
./scripts/cleanup-local-runtime.sh
```

Closeout:

- GLM job `glm-mnzi2shn-un2pwe` 被取消：初版 proof-5 两次失败，且 closeout 使用 tail 截断输出，不能作为验收依据。
- Codex 接管后修复 AI 节奏：开局工人生产包含训练队列并先保护第一、第二波；昂贵科技必须保留开局兵力预算；V7 伐木场、塔、车间扩展放到两波进攻之后。
- Codex 本地验证通过：`npm run build`；`npx tsc --noEmit -p tsconfig.app.json`；`./scripts/run-runtime-tests.sh tests/v7-ai-same-rule-content-proof.spec.ts tests/ai-economy-regression.spec.ts --grep "V7 AI Same-Rule|first attack wave|second attack wave" --reporter=list` 10/10；相关回归 `tests/ai-economy-regression.spec.ts`、`tests/v5-human-ai-rifleman-composition.spec.ts`、`tests/v7-workshop-mortar-combat-model-proof.spec.ts` 共 18/18；cleanup 后无 runtime 残留。

### Task 111 — V7 beta 稳定性回归包

Status: `accepted`.

Owner: GLM-style worker + Codex review.

Priority: auto-captured from the adjacent Stage-B front-door runway when the live queue dropped below the ready floor.

Allowed files:

- `tests/v7-beta-stability-regression.spec.ts`
- `scripts/run-runtime-suite.sh`
- `docs/V7_CONTENT_BETA_EVIDENCE_LEDGER.zh-CN.md`
- `docs/GLM_READY_TASK_QUEUE.md` only for closeout sync

Goal:

把 V7 选定内容和现有短局 runtime pack 串成稳定性证明。

Must prove:

1. V7 选定内容的 focused proof 能和现有短局、数值、AI 相关 regression 共存。
2. cleanup 后没有 Vite、Playwright、Chromium 测试残留。
3. closeout 明确哪些是 beta blocker，哪些只是 residual debt。

Verification:

```bash
npm run build
npx tsc --noEmit -p tsconfig.app.json
./scripts/run-runtime-tests.sh tests/v7-beta-stability-regression.spec.ts --reporter=list
./scripts/cleanup-local-runtime.sh
```

Closeout:

- GLM job `glm-mnzkxeb9-4x4f6w` 被取消：初版测试在 `page.evaluate` 中误用 Node import，且提前把 `V7-STAB1` 写成通过。
- Codex 接管后重写稳定性包并接入 V7 content shard。
- Codex 本地验证通过：`npm run build`；`npx tsc --noEmit -p tsconfig.app.json`；`./scripts/run-runtime-tests.sh tests/v7-beta-stability-regression.spec.ts --reporter=list` 5/5；完整 V7 内容包 31/31；cleanup 后无 runtime 残留。

### Task 112 — V8 demo path smoke pack

Status: `accepted`.

Owner: GLM-style worker + Codex review.

Priority: V8 已切换为当前里程碑；第一件事必须证明外部试玩入口本身能走通，而不是继续补内容。

Allowed files:

- `tests/v8-demo-path-smoke.spec.ts`
- `src/main.ts` only if the smoke path proves an entry/start/restart/back action is wired incorrectly.
- `src/styles.css` only if a visible scope/known-gap line exists but is hidden or unreadable.
- `index.html` only if the external entry root cannot load.
- `docs/V8_EXTERNAL_RELEASE_EVIDENCE_LEDGER.zh-CN.md`
- `docs/GLM_READY_TASK_QUEUE.md` only for closeout sync

Goal:

证明普通访问者能打开当前 demo、开始一局、从结束/暂停路径回到入口或重开，并看到“当前能玩什么、还缺什么”的范围说明。

Scope lock:

- 这是外部路径 smoke，不是新增兵种、AI、数值、素材或菜单大改任务。
- 如果发现入口缺陷，只做能让 smoke 成立的最小修复；如果需要大改，必须 blocked 并写清楚缺口。
- 不得把 V8-DEMO1 写成 engineering-pass；GLM 只能提交 worker closeout，等 Codex 本地复核。

Must prove:

1. 普通入口不是空白页，也不是直接卡死在 runtime。
2. 用户能从入口开始当前可玩 demo。
3. 用户能从 pause / results / reload 相关路径至少完成一种自助返回或重开。
4. 页面或入口附近有当前范围说明：能玩什么、不能承诺什么、如何反馈。
5. cleanup 后没有 Vite、Playwright、Chromium 测试残留。

Verification:

```bash
npm run build
npx tsc --noEmit -p tsconfig.app.json
./scripts/run-runtime-tests.sh tests/v8-demo-path-smoke.spec.ts --reporter=list
./scripts/cleanup-local-runtime.sh
```

Closeout:

- GLM job `glm-mnzluife-c3py33` 完成 worker closeout：新增 `tests/v8-demo-path-smoke.spec.ts`、入口范围说明和 smoke proof。
- Codex 本地复核时补强入口文案：明确短局切片、完整科技树/英雄/商店/野怪/战役/多人/天梯/回放未实现、反馈方式和非公开发布边界。
- Codex 本地验证通过：`npm run build`；`npx tsc --noEmit -p tsconfig.app.json`；`./scripts/run-runtime-tests.sh tests/v8-demo-path-smoke.spec.ts --reporter=list` 5/5；`./scripts/cleanup-local-runtime.sh`；无 Vite / Playwright / Chromium / runtime 残留。

### Task 113 — V8 release candidate stability pack

Status: `accepted`.

Owner: GLM-style worker + Codex review.

Prerequisite: `Task 112 — V8 demo path smoke pack` Codex accepted.

Allowed files:

- `tests/v8-release-candidate-stability.spec.ts`
- `scripts/run-runtime-suite.sh`
- `docs/V8_EXTERNAL_RELEASE_EVIDENCE_LEDGER.zh-CN.md`
- `docs/GLM_READY_TASK_QUEUE.md` only for closeout sync

Goal:

把 V7 内容稳定性、核心 runtime shard、外部入口 smoke 和 cleanup 串成 V8 release candidate 稳定性证明。

Must prove:

1. V7 内容包和核心 runtime gate 能在 V8 候选状态下共存。
2. live/demo smoke 已被包含或明确引用。
3. closeout 明确哪些问题会阻止 RC，哪些只是后续体验债。
4. cleanup 后没有 Vite、Playwright、Chromium 残留。

Verification:

```bash
npm run build
npx tsc --noEmit -p tsconfig.app.json
./scripts/run-runtime-tests.sh tests/v8-release-candidate-stability.spec.ts --reporter=list
./scripts/cleanup-local-runtime.sh
```

### Task 114 — V8 feedback capture proof

Status: `superseded`.

Owner: GLM-style worker + Codex review.

Superseded by: `Task 112 — V8 demo path smoke pack` Codex accepted plus `V8-CX5 — Feedback capture and triage packet`.

Allowed files:

- `tests/v8-feedback-capture-proof.spec.ts`
- `docs/V8_EXTERNAL_RELEASE_EVIDENCE_LEDGER.zh-CN.md`
- `docs/GLM_READY_TASK_QUEUE.md` only for closeout sync

Goal:

证明外部 tester 的反馈能被记录、分类，并回流到 blocker、体验债、用户判断或下一版本任务。

Must prove:

1. 反馈入口或记录模板对 tester 可理解。
2. 反馈分类规则不会把 blocker 混成普通建议。
3. 反馈能回流到 V8 evidence / gate 或后续版本任务。

Verification:

```bash
npm run build
npx tsc --noEmit -p tsconfig.app.json
./scripts/run-runtime-tests.sh tests/v8-feedback-capture-proof.spec.ts --reporter=list
./scripts/cleanup-local-runtime.sh
```

### Task 115 — V9 hotfix triage proof pack

Status: `accepted`.

Owner: GLM-style worker + Codex review.

Priority: auto-captured from the adjacent Stage-B front-door runway when the live queue dropped below the ready floor.

Allowed files:

- ``docs/V9_MAINTENANCE_EXPANSION_EVIDENCE_LEDGER.zh-CN.md``
- ``docs/V8_FEEDBACK_CAPTURE_AND_TRIAGE_PACKET.zh-CN.md``
- ``tests/v9-hotfix-triage-proof.spec.mjs``
- `docs/GLM_READY_TASK_QUEUE.md` only for closeout sync

Goal:

用一条样例反馈证明 V9 能把外部反馈记录、分级，并路由到 hotfix / patch / debt / user gate，不再让反馈停在聊天里。

Must prove:

1. 样例反馈有版本、环境、复现步骤、影响范围和严重度字段。
2. P0/P1 反馈会路由到 hotfix / patch，不会被当成普通建议。
3. P2-P5 反馈能被分到 patch、debt、user gate 或 expansion 候选。
4. 输出任务必须带 gate、文件范围、验证方式和不做项。
5. 不能把用户 verdict 自动写成通过。

Verification:

```bash
npm run build
npx tsc --noEmit -p tsconfig.app.json
./scripts/run-runtime-tests.sh <focused spec> --reporter=list
./scripts/cleanup-local-runtime.sh
```

### Task 116 — V9 baseline replay smoke pack

Status: `accepted`.

Owner: GLM-style worker + Codex review.

Priority: auto-captured from the adjacent Stage-B front-door runway when the live queue dropped below the ready floor.

Allowed files:

- ``tests/v8-demo-path-smoke.spec.ts``
- ``tests/v8-release-candidate-stability.spec.ts``
- ``tests/v9-baseline-replay-smoke.spec.ts``
- ``docs/V9_MAINTENANCE_EXPANSION_EVIDENCE_LEDGER.zh-CN.md``
- `docs/GLM_READY_TASK_QUEUE.md` only for closeout sync

Goal:

复跑 V8 demo smoke 和 V8 RC smoke 的最小 baseline proof，证明 V9 开始时有一个可复现、可清理、可解释的候选版基线。

Must prove:

1. V8 demo path smoke 仍可复跑或被 V9 baseline smoke 直接覆盖。
2. V8 RC stability smoke 仍可复跑或被 V9 baseline smoke 直接覆盖。
3. cleanup 后没有 Vite / Playwright / Chromium / runtime 残留。
4. baseline 说明明确哪些是已知缺口，哪些才是回归。
5. 不新增 gameplay 内容、素材、AI 策略或长期扩展方向。

Verification:

```bash
npm run build
npx tsc --noEmit -p tsconfig.app.json
./scripts/run-runtime-tests.sh <focused spec> --reporter=list
./scripts/cleanup-local-runtime.sh
```

### AI 圣骑士技能学习优先级证明包

Status: `accepted`.

Owner: GLM-style worker + Codex review.

Priority: auto-captured duplicate. Superseded by `Task 256 — V9 HERO16-AI2 AI Paladin skill-learning priority slice`, which is now Codex accepted.

Milestone: `V9 maintenance and expansion runway`.
Gate: `V9-HEROCHAIN1`.
Proof target: V9-HEROCHAIN1 / HERO16-AI2：AI Paladin 技能点消费和学习顺序成立，技能等级门槛被尊重，且 AI 施法、其他英雄和物品仍关闭。
Why now: 当前 live queue 里同名方向是 blocked 且缺任务卡；AI Altar + Paladin summon 已 accepted 后，技能学习是 HERO16 的最小相邻切片。
Stop condition: focused proof 能稳定证明学习顺序、技能点消费、等级门槛和不施法边界；一旦需要改 Game.ts、做施法、做其他英雄或补素材，停止并拆任务。

Allowed files:

- `src/game/SimpleAI.ts`
- `tests/v9-hero16-ai-paladin-skill-learning.spec.ts`
- `docs/GLM_READY_TASK_QUEUE.md` only for closeout sync

Goal:

实现并证明 AI Paladin 的最小技能学习优先级：Holy Light、Divine Shield、Devotion Aura、Resurrection 依次学习，只打开学习决策。

Must prove:

1. AI 只在已有 Paladin 且有技能点时学习技能。
2. 学习顺序为 Holy Light -> Divine Shield -> Devotion Aura -> Resurrection。
3. 等级门槛和技能点消费真实生效，复活后已学技能不丢失。
4. 本任务不施放 Holy Light、Divine Shield、Devotion Aura 或 Resurrection。

Verification:

```bash
npm run build
npx tsc --noEmit -p tsconfig.app.json
./scripts/run-runtime-tests.sh tests/v9-hero16-ai-paladin-skill-learning.spec.ts --reporter=list
./scripts/cleanup-local-runtime.sh
```

## Queue

### Task 27 — Goldmine Clickability Contract

Status: `completed`.

Owner: Codex takeover.

Started: 2026-04-12.

Completed: 2026-04-12.

Priority: converts the user's current pain into a direct contract. Right-click gather priority is fixed, but left-click/resource targetability under worker crowding is still not locked.

Goal:

Make goldmine selection/interaction reliable when workers crowd the mine, without making generic ground clicks or ordinary unit selection regress.

Outcome:

- GLM received an initial broad prompt and one narrowed spec-first retry.
- After two reframes and no file changes, Codex stopped GLM and took over.
- Codex added two selection contracts:
  - crowded goldmine left-click still selects the goldmine
  - worker near a goldmine still selects the worker
- Codex fixed `handleClick()` to resolve the full hit list and prefer the goldmine only when earlier hits are workers already mining that same mine.

Changed files:

- `src/game/Game.ts`
- `tests/command-surface-regression.spec.ts`

Verification:

```bash
npm run build
npx tsc --noEmit -p tsconfig.app.json
./scripts/run-runtime-tests.sh tests/command-surface-regression.spec.ts --reporter=list
FORCE_RUNTIME_CLEANUP=1 ./scripts/cleanup-local-runtime.sh
ps aux | egrep 'node .*vite|playwright|chrome-headless-shell' | grep -v egrep || true
```

Result:

- `npm run build` passed
- `npx tsc --noEmit -p tsconfig.app.json` passed
- `tests/command-surface-regression.spec.ts` passed 13/13

### Task 26 — AI Gold Saturation Contract

Status: `completed`.

Owner: GLM.

Started: 2026-04-12.

Completed: 2026-04-12.

Priority: prevents AI from oversaturating goldmine and starving lumber; directly impacts AI economy realism.

Goal:

Change AI gold/lumber allocation from fixed threshold to mine-saturation-based strategy. Cap = 5 workers per goldmine. Excess workers go to lumber/build.

Implementation:

- Added `GOLDMINE_SATURATION_CAP = 5` constant in SimpleAI.ts.
- `goldEffectiveCap = Math.min(this.targetGoldWorkers, GOLDMINE_SATURATION_CAP)` — profile target and hard cap both respected.
- `assignIdleWorkers()`: new idle workers assigned to gold only when `goldCount < goldEffectiveCap`; otherwise default to lumber.
- Dynamic rally: when gold workers ≥ cap, rally switches from goldmine to nearest tree so new workers auto-lumber. When below cap, rally switches back to goldmine. No fake `rallyPoint = townhall.position` — always uses a real resource target.

New contracts (3 tests):

- T10: AI gold workers never exceed 5 across t=45/90/120 sampling.
- T11: AI maintains ≥1 lumber worker at t=90 (saturation logic doesn't starve lumber).
- T12: AI completes early build loop (farm+barracks+footman) at t=90 with saturation logic active.

Allowed files:

- `src/game/SimpleAI.ts`
- `tests/ai-economy-regression.spec.ts`
- `docs/GAMEPLAY_REGRESSION_CHECKLIST.md`
- `docs/GLM_READY_TASK_QUEUE.md`

Verification:

```bash
npm run build
npx tsc --noEmit -p tsconfig.app.json
./scripts/run-runtime-tests.sh tests/ai-economy-regression.spec.ts --reporter=list
FORCE_RUNTIME_CLEANUP=1 ./scripts/cleanup-local-runtime.sh
ps aux | egrep 'node .*vite|playwright test|chrome-headless-shell' | grep -v egrep || true
```

Result: 12/12 passed, 2.5m. No residual processes after cleanup.

Commit message:

```text
gameplay: enforce AI gold saturation cap with dynamic rally
```

### Task 25 — M4 War3 Command Surface Matrix

Status: `completed`.

Owner: GLM.

Started: 2026-04-12.

Completed: 2026-04-12.

Accepted commit: `6f03a1f` (`gameplay: add command surface regression matrix`).

Owner: GLM.

Started: 2026-04-12.

Priority: follows Task24 because the user correctly identified the player issues as symptoms of incomplete War3-like order/ability alignment, not isolated bugs.

Goal:

Create a command-surface regression pack that tests the player's visible command semantics as a matrix. This is not a broad order-system rewrite. It is a contract layer that says which selected unit + clicked target + command-card state must produce which War3-like behavior.

Required contracts:

- Right-click target matrix:
  - Worker + unfinished own building -> selected worker resumes construction through `handleRightClick()` and real `g.update()` loop.
  - Worker + goldmine -> gather command, `resourceTarget` points to that mine.
  - Non-worker + goldmine -> move near mine, not gather.
  - Combat unit + enemy -> attack command.
  - Unit + ground -> move command and clear stale gather/build/attack state.
  - Unit + own completed building -> move near building, not accidental build/attack.
- Command-card state matrix:
  - Worker card exposes buildable Farm/Barracks/Tower commands with explicit disabled reasons when resources are insufficient.
  - Unfinished selected building exposes Cancel and executing it releases footprint + clears builder.
  - Completed Barracks at supply cap disables Footman with a supply reason.
  - Tower selected HUD exposes enough attack information that a player can tell it is a weapon building.
- No fake proof:
  - Setup may spawn entities directly.
  - Behavior under test must use public/live-like paths: `handleRightClick()`, command-card button click, keyboard event, or `g.update()`.
  - Do not call `updateBuildProgress()` or `assignBuilderToConstruction()` as the asserted behavior path.

Allowed files:

- `tests/command-surface-regression.spec.ts` (new)
- `src/game/Game.ts` only for minimal product fixes proven by the new spec
- `docs/GAMEPLAY_REGRESSION_CHECKLIST.md`
- `docs/GLM_READY_TASK_QUEUE.md`

Forbidden files:

- `src/game/SimpleAI.ts`
- `src/game/TeamResources.ts`
- camera, terrain, asset catalog, visual factories
- runtime harness scripts
- broad Game.ts refactor

Required verification:

```bash
npm run build
npx tsc --noEmit -p tsconfig.app.json
./scripts/run-runtime-tests.sh tests/command-surface-regression.spec.ts --reporter=list
./scripts/run-runtime-tests.sh tests/m4-player-reported-issues.spec.ts tests/selection-input-regression.spec.ts tests/command-card-state-regression.spec.ts --reporter=list
FORCE_RUNTIME_CLEANUP=1 ./scripts/cleanup-local-runtime.sh
ps aux | egrep 'node .*vite|playwright|chrome-headless-shell|\.openclaw/browser' | grep -v egrep || true
```

Closeout rules:

- Report matrix rows as `proven`, `fixed`, or `still open`.
- If a row requires product code, keep the patch minimal and name the exact failing assertion that drove it.
- Do not commit if any required verification fails.

Commit message:

```text
gameplay: add command surface regression matrix
```

### Task 24 — M4 Player-Reported UX Reality Pack

Status: `completed`.

Owner: GLM + Codex correction.

Started: 2026-04-12.

Completed: 2026-04-12.

Final review status: accepted locally after Codex correction. GLM created the initial M4 pack and nested-mesh hit resolution helper, but Codex paused GLM before accepting an invalid terrain-height clamp, corrected the live-like right-click proof, and added the `planPath()` no-path-to-building transition needed for adjacent construction resume.

Verification:

- `npm run build`
- `npx tsc --noEmit -p tsconfig.app.json`
- `./scripts/run-runtime-tests.sh tests/m4-player-reported-issues.spec.ts --reporter=list` -> 6/6 passed
- `./scripts/run-runtime-tests.sh tests/construction-lifecycle-regression.spec.ts tests/static-defense-regression.spec.ts tests/resource-supply-regression.spec.ts tests/unit-presence-regression.spec.ts --reporter=list` -> 29/29 passed

Priority: next after Task23 because the user reported concrete live-play blockers after the M3 scale pass.

User-reported issues to convert into contracts:

1. Barracks construction can stop halfway and feels impossible to resume.
2. Arrow tower appears to have no attack in live play.
3. Units do not have meaningful collision/body presence.
4. Supply block makes unit production feel dead instead of explaining the block and guiding farm construction.
5. Construction cancel is not discoverable or not usable enough.
6. These are all symptoms of incomplete War3-like order/ability/system alignment, not isolated UI polish.

Goal:

Create one runtime spec that uses real input/DOM where possible and direct runtime setup only where needed. If a contract fails, make the smallest product-code fix inside the allowed files. Do not claim "fixed" from internal smoke only.

Required contracts:

- Construction resume:
  - Start a farm or barracks through the player build flow.
  - Interrupt the worker.
  - Select a worker and right-click the unfinished building.
  - Assert `buildProgress` continues increasing and the selected worker becomes/retains the builder.
- Construction cancel discoverability:
  - Select an unfinished player building.
  - Assert the command card exposes a cancel command with enabled/disabled state and reason.
  - Execute cancel and assert footprint release + deterministic partial refund + builder cleanup.
- Tower live attack:
  - Spawn or build a completed player tower and an enemy unit in range.
  - Advance simulation and assert enemy hp drops, tower `attackTarget` clears/reacquires correctly, and under-construction tower does not attack.
  - If existing tower combat passes internally but live play still feels like no attack, add a visible feedback assertion or HUD/stat assertion rather than changing combat numbers blindly.
- Supply-block feedback:
  - Fill supply to cap.
  - Select barracks.
  - Assert footman command is disabled with an explicit supply reason.
  - Assert worker/farm build route remains available when resources allow, so the player has an obvious recovery path.
- Unit collision/body presence:
  - Use existing unit presence/collision baseline as reference.
  - Add one focused regression that two units ordered to the same point do not end in exact overlap and remain selectable.
  - Do not attempt full local avoidance/pathfinder rewrite in this task.

Allowed files:

- `tests/m4-player-reported-issues.spec.ts` (new)
- `src/game/Game.ts` only for proven minimal fixes in construction resume/cancel, command-card state, tower feedback/stat surfacing, or local body separation
- `src/game/GameCommand.ts` only if command semantics are proven wrong by the new spec
- `src/game/GameData.ts` only if tower/supply numbers are provably missing or inconsistent
- `docs/GAMEPLAY_REGRESSION_CHECKLIST.md`
- `docs/GLM_READY_TASK_QUEUE.md`

Forbidden files:

- `src/game/SimpleAI.ts`
- `src/game/TeamResources.ts` unless the new spec proves an actual supply accounting bug
- camera, terrain, asset catalog, visual factories
- runtime harness scripts
- screenshot-only validation
- broad Game.ts refactor

Required verification:

```bash
npm run build
npx tsc --noEmit -p tsconfig.app.json
./scripts/run-runtime-tests.sh tests/m4-player-reported-issues.spec.ts --reporter=list
./scripts/run-runtime-tests.sh tests/construction-lifecycle-regression.spec.ts tests/static-defense-regression.spec.ts tests/resource-supply-regression.spec.ts tests/unit-presence-regression.spec.ts --reporter=list
FORCE_RUNTIME_CLEANUP=1 ./scripts/cleanup-local-runtime.sh
ps aux | egrep 'node .*vite|playwright|chrome-headless-shell|\.openclaw/browser' | grep -v egrep || true
```

Closeout rules:

- Report which user issue is proven fixed, already covered, or still open.
- If an issue is "already covered by existing tests" but user still reports it live, explain the gap and add a better live-like test.
- Do not commit if any required verification fails.

Commit message:

```text
gameplay: add M4 player issue reality pack
```

### Task 23 — M3 Scale Contract Implementation

Status: `completed`.

Owner: GLM + Codex correction.

Started: 2026-04-12.

Completed: 2026-04-12.

Final status:

- Strengthened M3 objective ratio tests.
- Enlarged footman proxy scale from 1.5 to 1.7.
- Reduced tree random scale from 0.8-1.6x to 0.6-1.1x.
- Corrected farm measurement to use completed buildings only; farm proxy geometry remains compact and unchanged.
- Verified `farmOverTH=0.291`, `footmanOverWorker=1.547`, `maxTreeHeightOverTH=1.175`.
- Codex reran build, app typecheck, M3 spec, and affected visibility/pathing/selection pack successfully.

Priority: first M3 implementation slice after M2 runtime harness stabilization.

Why now:

The user's remaining visual complaint is not just "art quality"; it is inconsistent RTS scale grammar. M3 must start by making scale relationships objective and testable before any subjective visual pass.

Goal:

Tighten the M3 objective scale/readability contract and make minimal proxy-only adjustments so the current procedural visuals obey stable War3-like ratios:

- farm remains a compact wall/supply piece
- barracks reads as mid-size production, below Town Hall
- tower has a visible defensive base and vertical profile without dwarfing Town Hall
- footman silhouette reads meaningfully heavier than worker
- tree height does not visually dominate the player base
- selection ring and healthbar placement remain sane after ratio changes

Allowed files:

- `tests/m3-scale-measurement.spec.ts`
- `src/game/UnitVisualFactory.ts`
- `src/game/BuildingVisualFactory.ts`
- `src/game/Game.ts` only for tree scale/height constants and measurement hooks; do not touch command, AI, combat, construction, or resource logic
- `docs/M3_WAR3_FEEL_BENCHMARK.zh-CN.md`
- `docs/GAMEPLAY_REGRESSION_CHECKLIST.md`
- `docs/GLM_READY_TASK_QUEUE.md`

Forbidden files:

- `src/game/GameCommand.ts`
- `src/game/SimpleAI.ts`
- `src/game/TeamResources.ts`
- runtime harness scripts
- camera controller
- terrain generator
- asset sourcing or external model files
- screenshots or browser-visible manual validation

Required workflow:

1. First run the existing M3 measurement test and read the emitted `[M3-SCALE-MEASUREMENT]` JSON.
2. Strengthen `tests/m3-scale-measurement.spec.ts` with objective ratios only. Do not assert subjective "looks like War3".
3. Make minimal proxy numeric changes in the allowed visual files until the strengthened contract passes.
4. Update docs with exact before/after ratios and clearly label human visual approval as still required.

Required verification:

```bash
npm run build
npx tsc --noEmit -p tsconfig.app.json
./scripts/run-runtime-tests.sh tests/m3-scale-measurement.spec.ts --reporter=list
./scripts/run-runtime-tests.sh tests/unit-visibility-regression.spec.ts tests/pathing-footprint-regression.spec.ts tests/selection-input-regression.spec.ts --reporter=list
./scripts/cleanup-local-runtime.sh
ps aux | egrep 'node .*vite|playwright|chrome-headless-shell|\.openclaw/browser' | grep -v egrep || true
```

Commit message:

```text
visual: enforce M3 scale contract
```

### Task 22 — Runtime Sharded Local Gate

Status: `completed`.

Owner: GLM.

Started: 2026-04-12.

Completed: 2026-04-12.

Accepted commit: `test: shard runtime regression gate`.

Final review status: accepted. Full sharded suite passes 5/5 shards, 103 tests, 779s total.

Result:

- Created `scripts/run-runtime-suite.sh` with 5 shards covering all 16 spec files.
- Each shard prints name, spec list, per-shard timing. Fails fast on first failure.
- Updated `package.json`: `test:runtime` now calls sharded script; old command preserved as `test:runtime:single`.
- Fixed `test:runtime:single` to include `selection-input-regression.spec.ts` for coverage parity.
- CI (`deploy-pages.yml`) uses `npm run test:runtime` which now goes through shards.

Shard results:

| Shard | Tests | Time |
|-------|-------|------|
| core-controls | 30 | 213s |
| ui-economy | 16 | 107s |
| presence-pathing | 18 | 159s |
| ai-assets-buildings | 23 | 190s |
| construction-defense | 16 | 110s |
| **Total** | **103** | **779s (13m)** |

Priority: immediate infrastructure fix following Task 21 fast-start.

Why now:

Task 21 reduced per-test time but `npm run test:runtime` was still a single opaque 15+ minute Playwright command that looked like a hang. Sharding makes progress observable and isolates failures.

Goal:

Replace the single long Playwright command with a sharded script where each shard prints clear progress, timing, and spec coverage.

Allowed files:

- `scripts/run-runtime-suite.sh`
- `package.json`
- `docs/GAMEPLAY_REGRESSION_CHECKLIST.md`
- `docs/GLM_READY_TASK_QUEUE.md`

Forbidden files:

- `src/game/*`
- `tests/*.spec.ts` (no assertion changes)

### Task 21 — Runtime Harness Fast-Start

Status: `completed`.

Owner: GLM.

Started: 2026-04-12.

Completed: 2026-04-12.

Accepted commit: `test: add runtime fast-start mode`.

Final review status: partial infrastructure improvement accepted. Not a full runtime harness fix.

Result:

- Added `?runtimeTest=1` query-param to `src/main.ts`: skips W3X auto-load, sets `map-status` to fast-start text immediately.
- Updated all 18 `tests/*.spec.ts` BASE constants to include `?runtimeTest=1`.
- Per-test startup time reduced from ~8-9s to ~5.8-6.5s.
- Individual M4 specs all pass: command-card (7/7), construction (9/9), static-defense (7/7), resource (9/9).
- `npm run test:runtime` still exceeds 10 minutes; Codex stopped it. Not a stable local gate.
- Normal live demo URL (no query param) unchanged; user map upload unchanged.

Remaining risk:

- Full runtime harness needs separate task for sharding or local gate.
- `npm run test:runtime` cannot be used as a blocking CI gate without further work.

Priority: immediate infrastructure fix.

Why now:

Codex verification of M4 found that individual gameplay specs pass, but long Playwright runs can hit false `waitForGame()` timeouts. The common startup path loads the W3X test map for every test page, making each test cost roughly 8-10 seconds and making `npm run test:runtime` fragile.

Goal:

Add a test-only fast-start mode so runtime regression tests use the procedural initial map and skip automatic W3X test-map loading.

Allowed files:

- `src/main.ts`
- `tests/*.spec.ts`
- `package.json`
- `scripts/run-runtime-tests.sh` only if needed for stable sharding or cleanup
- `docs/GAMEPLAY_REGRESSION_CHECKLIST.md`

Forbidden files:

- `src/game/Game.ts`
- `src/game/GameCommand.ts`
- `src/game/SimpleAI.ts`
- `src/game/TeamResources.ts`
- visual factories, assets, screenshots, camera/terrain tuning

Required verification:

```bash
npm run build
npx tsc --noEmit -p tsconfig.app.json
time npm run test:command-card
time npm run test:construction
time npm run test:resource
time npm run test:static-defense
time npm run test:runtime
./scripts/cleanup-local-runtime.sh
```

Acceptance:

- Normal live demo URL behavior is unchanged.
- Tests use `?runtimeTest=1` or equivalent explicit test mode.
- Runtime assertions remain real; only automatic W3X loading is skipped.
- If full runtime still times out, GLM must report the remaining slow spec instead of claiming full pass.

Commit message:

```text
test: add runtime fast-start mode
```

### Task 11 — Construction Lifecycle Contract Pack

Status: `completed`.

Owner: Codex takeover.

Started: 2026-04-11.

Completed: 2026-04-11.

Final review status: accepted locally. GLM stalled in exploration without creating files, so Codex interrupted and completed the pack directly.

Implemented:

- `assignBuilderToConstruction()` as the minimal construction-resume path.
- Right-clicking a friendly under-construction building assigns selected workers to resume construction.
- `cancelConstruction()` for under-construction buildings.
- Deterministic cancel refund: `floor(75% of total building cost)`.
- Cancel cleanup through the existing death cleanup path, plus forced HUD/command-card cache invalidation.
- Command-card “取消” button when a player under-construction building is selected.
- Added `tests/construction-lifecycle-regression.spec.ts` and integrated it into `npm run test:runtime`.

Codex verified:

```bash
npm run build
npx tsc --noEmit -p tsconfig.app.json
./scripts/run-runtime-tests.sh tests/construction-lifecycle-regression.spec.ts --reporter=list
./scripts/run-runtime-tests.sh tests/construction-lifecycle-regression.spec.ts tests/building-agency-regression.spec.ts tests/resource-supply-regression.spec.ts tests/death-cleanup-regression.spec.ts --reporter=list
```

Result: build passed; app typecheck passed; construction lifecycle pack passed 6/6; affected construction/building/resource/death pack passed 25/25.

Priority: highest M2 task.

Why now:

User reported that a barracks can stop halfway and cannot be resumed, and that construction cancel is missing. This is one higher-level system gap: construction lifecycle.

Goal:

Implement a Warcraft-like construction lifecycle baseline:

- under-construction buildings can be resumed by a valid worker
- builder interruption does not make construction unrecoverable
- construction can be canceled
- cancel releases footprint and builder state
- cancel applies a deterministic refund
- selection/HUD stays valid after cancel

Product contract:

Construction is no longer a one-shot command. It is an order lifecycle with active builder, interrupted state, resumable state, cancellation, cleanup, and resource consequences.

Default rule:

- Cancel refund: 75% of the building's total cost while under construction.
- If this conflicts with existing code shape, keep the rule simple and document it in the test.

Allowed files:

- `tests/construction-lifecycle-regression.spec.ts`
- `src/game/Game.ts`
- `src/game/GameCommand.ts`
- `docs/GAMEPLAY_REGRESSION_CHECKLIST.md`
- `docs/GLM_READY_TASK_QUEUE.md` only for closeout status

Forbidden files:

- `src/game/SimpleAI.ts`
- `src/game/TeamResources.ts` unless a proven resource API gap blocks refund
- `src/game/Asset*`
- `src/game/*VisualFactory.ts`
- `src/map/*`
- `scripts/*`
- `.github/*`
- screenshots or image files
- camera, terrain, or visual tuning

Required tests:

- A worker starts constructing a building, is stopped or retasked, and construction remains resumable.
- A valid worker can resume an interrupted under-construction building.
- Canceling under-construction building removes the building and releases occupancy.
- Canceling under-construction building refunds the documented amount and does not duplicate resources.
- Canceling selected under-construction building leaves selection and HUD in a valid state.
- Builder state/buildTarget is cleared on cancel.

Required verification:

```bash
npm run build
npx tsc --noEmit -p tsconfig.app.json
./scripts/run-runtime-tests.sh tests/construction-lifecycle-regression.spec.ts tests/building-agency-regression.spec.ts tests/resource-supply-regression.spec.ts tests/death-cleanup-regression.spec.ts --reporter=list
./scripts/cleanup-local-runtime.sh
```

Commit message:

```text
systems: add construction lifecycle baseline
```

Do not claim:

- full Warcraft III construction parity
- multi-builder speed scaling
- repair system completeness
- final command-card UX

Dispatch prompt summary:

```text
Implement Task 11 Construction Lifecycle Contract Pack. Add runtime tests first. Fix only the construction lifecycle gaps: resume interrupted construction, cancel under-construction building, refund, footprint release, builder cleanup, selection/HUD validity. Keep scope inside allowed files. Verify with build, app typecheck, locked runtime tests, cleanup, then commit/push.
```

### Task 12 — Static Defense Combat Contract Pack

Status: `ready`.

Owner: GLM.

Priority: after Task 11.

Goal:

Make arrow towers actual combat buildings.

Must prove:

- tower has range/damage/cooldown weapon behavior
- tower auto-acquires enemy units in range
- tower damages targets over time
- tower stops or reacquires after target death
- no severe console errors

Allowed files:

- `tests/static-defense-regression.spec.ts`
- `src/game/Game.ts`
- `src/game/GameData.ts`
- `docs/GAMEPLAY_REGRESSION_CHECKLIST.md`

Required verification:

```bash
npm run build
npx tsc --noEmit -p tsconfig.app.json
./scripts/run-runtime-tests.sh tests/static-defense-regression.spec.ts tests/death-cleanup-regression.spec.ts --reporter=list
./scripts/cleanup-local-runtime.sh
```

### Task 13 — Command Disabled Reasons Pack

Status: `ready`.

Owner: GLM.

Priority: after Task 11 or Task 12.

Goal:

Make command buttons communicate blocked states, especially supply block and insufficient resources.

Must prove:

- supply-blocked train command is disabled or returns visible reason
- insufficient-resource build/train command is disabled or returns visible reason
- successful commands still work
- command card state updates after resources/supply changes

Allowed files:

- `tests/command-card-state-regression.spec.ts`
- `src/game/Game.ts`
- `src/styles.css`
- `docs/GAMEPLAY_REGRESSION_CHECKLIST.md`

Required verification:

```bash
npm run build
npx tsc --noEmit -p tsconfig.app.json
./scripts/run-runtime-tests.sh tests/command-card-state-regression.spec.ts tests/resource-supply-regression.spec.ts --reporter=list
./scripts/cleanup-local-runtime.sh
```

### Task 14 — Unit Collision Presence Pack

Status: `ready`.

Owner: GLM.

Priority: after construction and command state.

Goal:

Add a minimal unit physical-presence baseline without building a full physics engine.

Must prove:

- moving units do not permanently stack at one exact position
- worker/footman have deterministic collision radius or separation rule
- building blockers remain respected
- existing pathing tests remain green

Allowed files:

- `tests/unit-collision-regression.spec.ts`
- `src/game/Game.ts`
- `src/game/GameData.ts`
- `docs/GAMEPLAY_REGRESSION_CHECKLIST.md`

Required verification:

```bash
npm run build
npx tsc --noEmit -p tsconfig.app.json
./scripts/run-runtime-tests.sh tests/unit-collision-regression.spec.ts tests/pathing-footprint-regression.spec.ts tests/command-regression.spec.ts --reporter=list
./scripts/cleanup-local-runtime.sh
```

### Task 01 — Resource/Supply Regression Pack

Status: `completed`.

Owner: GLM.

Started: 2026-04-11.

Completed: 2026-04-11.

Accepted commit: `a64833d` (`test: harden stop/move-override tests to use real command paths`).

Final review status: accepted. Codex reran:

```bash
./scripts/run-runtime-tests.sh tests/resource-supply-regression.spec.ts --reporter=list
```

Result: 9/9 passed. The previous weak stop/override proof was replaced with real command-path tests.

Goal: prove resources, supply, training, and AI spending are not fake-green.

Allowed write scope:

- `tests/resource-supply-regression.spec.ts`
- `src/game/Game.ts`, `src/game/SimpleAI.ts`, `src/game/TeamResources.ts`, `src/game/GameData.ts` only for minimal proven fixes
- `docs/GAMEPLAY_REGRESSION_CHECKLIST.md`

Must prove:

- Under-construction buildings do not count as supply.
- Supply cap blocks training and does not deduct resources.
- Successful training deducts resources exactly once.
- Worker return-resource path increases resources and clears carry state.
- Stop/cancel/override does not duplicate carried resources.
- AI does not train beyond available supply.
- AI farm supply applies only after completion.
- Multi-building training cannot overspend resources.

Verification:

```bash
npm run build
npx tsc --noEmit -p tsconfig.app.json
./scripts/run-runtime-tests.sh tests/resource-supply-regression.spec.ts --reporter=list
```

Dispatch prompt summary:

```text
Implement Resource/Supply Regression Pack 01. Use deterministic runtime tests. Write failing test before any fix. Allowed files: tests/resource-supply-regression.spec.ts plus minimal proven fixes in Game.ts/SimpleAI.ts/TeamResources.ts/GameData.ts, and checklist docs. Do not touch CI/scripts/package or existing runtime specs. Verify with build, app tsc, and locked runner.
```

### Task 02 — Unit Visibility Contract Pack

Status: `completed`.

Owner: Codex.

Completed: 2026-04-11.

Result: Codex added `tests/unit-visibility-regression.spec.ts`, fixed W3X map-load camera focus, and added the visibility pack to `npm run test:runtime`.

Default next task after Task 01, unless Task 01 exposes a higher-severity resource/supply bug.

Goal: solve the recurring “农民刷新后看不到 / blood bar visible but body invisible” class of bugs with runtime assertions, not screenshots.

Allowed write scope:

- `tests/unit-visibility-regression.spec.ts`
- `src/game/AssetLoader.ts`, `src/game/UnitVisualFactory.ts`, `src/game/Game.ts`, `src/game/AssetCatalog.ts` only for minimal proven fixes
- `docs/GAMEPLAY_REGRESSION_CHECKLIST.md`

Must prove:

- Worker mesh has at least one visible renderable mesh after initial spawn.
- Worker remains visible after async asset refresh completes.
- Worker world bounding box height/width exceeds minimum RTS readability thresholds.
- Health bar anchor remains above actual visual body after fallback and glTF refresh.
- Team color changes do not hide or zero-alpha unit materials.
- No unit visual has scale near zero after refresh.

Suggested thresholds:

- Worker bounding box height >= `0.65` world units.
- Worker bounding box width/depth >= `0.25` world units.
- Health bar y position > visual bbox max y.

Verification:

```bash
npm run build
npx tsc --noEmit -p tsconfig.app.json
./scripts/run-runtime-tests.sh tests/unit-visibility-regression.spec.ts --reporter=list
```

Dispatch prompt summary:

```text
Implement Unit Visibility Contract Pack. Focus on the reported bug: workers are visible at refresh start, then body disappears while bars remain. Add runtime assertions for visible meshes, world bounding boxes, non-zero scale, material opacity, and post-asset-refresh visibility. Fix only proven causes.
```

### Task 03 — Building Placement Agency Pack

Status: `completed`.

Owner: Codex takeover.

Started: 2026-04-11.

Completed: 2026-04-11.

Accepted commit: `6290f90` (`test: add building agency regression pack`).

Final review status: accepted. GLM stalled in exploration, so Codex stopped GLM and completed the pack directly.

Codex verified:

```bash
npm run build
npx tsc --noEmit -p tsconfig.app.json
./scripts/run-runtime-tests.sh tests/building-agency-regression.spec.ts tests/closeout.spec.ts tests/selection-input-regression.spec.ts --reporter=list
npm run test:runtime
```

Results:

- Building agency pack: 5/5 passed.
- Affected closeout + selection pack: 20/20 passed.
- Full runtime pack: 57/57 passed.

Fixes landed:

- `placeBuilding()` now records `building.builder = peasant`.
- `findNearestIdlePeasant()` ignores dead workers (`hp <= 0`).

Goal: harden the contract that the selected worker performs the build order and no unrelated idle worker steals the command.

Allowed write scope:

- `tests/building-agency-regression.spec.ts`
- `src/game/Game.ts` only for minimal proven fixes
- `docs/GAMEPLAY_REGRESSION_CHECKLIST.md`

Must prove:

- Selected worker remains selected/remembered through placement mode.
- Placed building assigns `buildTarget` to the selected worker, not nearest idle worker.
- Shift/box selection cases do not corrupt `placementWorkers`.
- If selected worker is dead or invalid by placement time, fallback is deterministic and documented.
- Multiple selected workers choose the expected builder consistently.

Verification:

```bash
npm run build
npx tsc --noEmit -p tsconfig.app.json
./scripts/run-runtime-tests.sh tests/building-agency-regression.spec.ts --reporter=list
```

Dispatch prompt summary:

```text
Implement Building Placement Agency Pack. The product contract is: the worker the player selected to build must be the worker assigned after placement. Add runtime tests for selected worker, multiple selected workers, invalid selected worker fallback, and placementWorkers cleanup.
```

### Task 09 — Death/Cleanup Contract Pack

Status: `completed`.

Owner: Codex takeover.

Completed: 2026-04-11.

Accepted commit: `c5dc3ab` (`test: add death cleanup regression pack`).

Final review status: accepted locally.

Codex verified:

```bash
npm run build
./scripts/run-runtime-tests.sh tests/death-cleanup-regression.spec.ts --reporter=list
```

Result: 5/5 passed.

Coverage landed:

- selected-unit death removes selection, selection rings, healthbar, outline, and scene mesh refs
- attack-target death clears attacker `attackTarget` and exits Attacking
- building death releases footprint occupancy
- under-construction building death clears builder build state
- invalid resource target recovery clears `resourceTarget` without crashing

Dispatch note:

The first high-effort attempt on 2026-04-11 was stopped because GLM spent multiple minutes in broad exploration and did not create files. Retry with a smaller prompt:

1. Create only `tests/death-cleanup-regression.spec.ts`.
2. First implement only selected-unit cleanup, attack-target cleanup, and building-footprint release.
3. Do not edit `Game.ts` until those three tests run and show a real failure.
4. Expand to build/resource/healthbar cleanup only after the core spec is green.

Goal: harden the high-risk cleanup paths so dead units/buildings cannot leave stale selection, targets, healthbars, blockers, or build/resource references behind.

Allowed write scope:

- `tests/death-cleanup-regression.spec.ts`
- `src/game/Game.ts` only for minimal proven fixes
- `docs/GAMEPLAY_REGRESSION_CHECKLIST.md`

Forbidden files:

- `package.json`
- `scripts/*`
- `.github/*`
- asset loader/factory/catalog files
- visual/camera/layout tuning
- broad Game.ts refactor

Must prove with Playwright runtime assertions:

- Killing a selected unit removes it from `selectionModel` and selection rings after `handleDeadUnits()` / update.
- Killing an attack target clears all attackers' `attackTarget` references and does not leave them stuck attacking a dead unit.
- Killing a building releases its footprint occupancy so `placementValidator.canPlace()` can place on the same tiles afterward.
- Killing an under-construction building clears builder `buildTarget` / build state without crashing.
- Killing a resource target clears workers' `resourceTarget` references and does not crash the gather loop.
- Healthbar/outline references for dead units are removed or no longer point at removed meshes.
- No severe console errors during forced death/cleanup scenarios.

Verification:

```bash
npm run build
npx tsc --noEmit -p tsconfig.app.json
./scripts/run-runtime-tests.sh tests/death-cleanup-regression.spec.ts --reporter=list
```

Suggested extra verification if `Game.ts` changes:

```bash
./scripts/run-runtime-tests.sh tests/command-regression.spec.ts tests/pathing-footprint-regression.spec.ts tests/selection-input-regression.spec.ts --reporter=list
```

Dispatch prompt summary:

```text
Implement Death/Cleanup Contract Pack. Use deterministic Playwright runtime tests that force unit/building death and then assert selection cleanup, target cleanup, footprint release, build/resource reference cleanup, healthbar/outline cleanup, and no severe console errors. Fix only proven bugs in Game.ts.
```

### Task 10 — Placement Controller Development Slice

Status: `completed`.

Owner: GLM + Codex review.

Started: 2026-04-11.

Completed: 2026-04-11.

Accepted commit: `14bd7ba` (`refactor: extract placement controller slice`).

Final review status: accepted. Codex reran:

```bash
npm run build
npx tsc --noEmit -p tsconfig.app.json
./scripts/run-runtime-tests.sh tests/building-agency-regression.spec.ts tests/selection-input-regression.spec.ts tests/pathing-footprint-regression.spec.ts --reporter=list
```

Result: build passed, app typecheck passed, 17/17 affected runtime tests passed. Local runtime/browser cleanup was completed after verification.

Implementation accepted:

- Added `src/game/PlacementController.ts`.
- Moved placement mode key, ghost mesh, saved workers, exit cleanup, and alive-worker filtering behind the controller.
- Preserved `Game.enterPlacementMode()`, `Game.exitPlacementMode()`, and placement click behavior.
- Added deprecated `Game` getter shims for old placement-state inspection used by runtime tests.

Goal: reduce `Game.ts` coupling by moving placement-mode state into a bounded controller without changing behavior.

This is a development task, not a test-only task.

Preconditions:

- `tests/building-agency-regression.spec.ts` is green.
- `tests/selection-input-regression.spec.ts` is green.
- No active Codex work is touching `src/game/Game.ts`.

Allowed write scope:

- `src/game/PlacementController.ts`
- `src/game/Game.ts`
- `tests/building-agency-regression.spec.ts` only if an assertion needs a non-behavior-changing hook
- `docs/GAME_TS_RISK_MAP.md` optional

Forbidden files:

- asset loader/factory/catalog files
- `src/game/SimpleAI.ts`
- `src/game/GameCommand.ts`
- camera/terrain/visual tuning files
- package/scripts/CI unless Codex explicitly approves

Product contract:

The user-selected worker remains the builder after placement, and placement/cancel mode state is cleaned exactly as before.

Implementation direction:

- Move placement mode fields/operations behind a small `PlacementController` or equivalent helper.
- Preserve current public Game entry points: `enterPlacementMode()`, `exitPlacementMode()`, and the internal placement click path.
- Do not change building sizes, costs, occupancy semantics, camera, visuals, or selection rules.
- If extraction requires too many callbacks, stop and report; do not build a large framework.

Required verification:

```bash
npm run build
npx tsc --noEmit -p tsconfig.app.json
./scripts/run-runtime-tests.sh tests/building-agency-regression.spec.ts tests/selection-input-regression.spec.ts tests/pathing-footprint-regression.spec.ts --reporter=list
```

Commit message:

```text
refactor: extract placement controller slice
```

### Task 04 — Selection/Input Contract Pack

Status: `completed`.

Owner: GLM.

Started: 2026-04-11.

Completed: 2026-04-11.

Accepted commit: `96d9d4a` (`test: add selection input regression pack`).

Final review status: accepted after Codex tightened `finishBoxSelect` fallback semantics and added the spec to `npm run test:runtime`.

Codex reran:

```bash
./scripts/run-runtime-tests.sh tests/selection-input-regression.spec.ts --reporter=list
```

Result: 6/6 passed before integration. Codex then added the spec to `npm run test:runtime`; full runtime pack passed 39/39.

Goal: make box select/click semantics match RTS expectations and stop regressions like “mouseup does not feel committed”.

Allowed write scope:

- `tests/selection-input-regression.spec.ts`
- `src/game/Game.ts`, `src/game/SelectionModel.ts`, `src/game/ControlGroupManager.ts` only for minimal proven fixes
- `docs/GAMEPLAY_REGRESSION_CHECKLIST.md`

Must prove:

- Left drag box selects on mouseup without another click.
- Right mouse drag never starts box selection.
- Right click while dragging does not leave ghost selection state.
- Shift box-select appends without stale HUD/cache state.
- Tab subgroup switch keeps selection rings mapped to the same selected objects.
- Control group restore preserves ring/object mapping.

Verification:

```bash
npm run build
npx tsc --noEmit -p tsconfig.app.json
./scripts/run-runtime-tests.sh tests/selection-input-regression.spec.ts --reporter=list
```

Dispatch prompt summary:

```text
Implement Selection/Input Contract Pack. Add deterministic runtime tests for mouseup commit, right-button drag behavior, Shift append, Tab subgroup ring mapping, and control group ring mapping. Fix only proven input/selection bugs.
```

### Task 05 — Pathing/Footprint Contract Pack

Status: `completed`.

Owner: GLM.

Started: 2026-04-11.

Completed: 2026-04-11.

Accepted commit: `edd0bde` (`test: add pathing footprint regression pack`).

Final review status: accepted after Codex corrected the blocked-start contract to assert `findPath()` returns `null` directly, rather than treating `planPath()` straight-line fallback as a valid pathing proof.

Codex reran:

```bash
./scripts/run-runtime-tests.sh tests/pathing-footprint-regression.spec.ts --reporter=list
```

Result: 6/6 passed before integration. Codex added the spec to `npm run test:runtime`; full runtime pack passed 45/45.

Priority reason: M1 needs RTS-scale/pathing trust before another human playtest. Recent issues included workers spawning inside blockers, map/building scale drift, and fallback movement masking invalid paths.

Goal: prevent “unit spawned inside blocker / path fallback through blocker / building footprint drift” regressions.

Allowed write scope:

- `tests/pathing-footprint-regression.spec.ts`
- `src/game/Game.ts`, `src/game/PathFinder.ts`, `src/game/PathingGrid.ts`, `src/game/OccupancyGrid.ts`, `src/game/GameData.ts` only for minimal proven fixes
- `docs/GAMEPLAY_REGRESSION_CHECKLIST.md`

Must prove:

- Starting workers never spawn inside TH, goldmine, barracks, farm, tower blockers.
- Every initial unit has a valid non-blocked tile.
- TH/goldmine/barracks footprints match `GameData.size` at runtime.
- Pathfinding from every worker to goldmine and nearest tree returns a path.
- Fallback straight-line movement is not used when start/end are blocked.
- Building placement validator rejects overlaps at tile footprint level.

Verification:

```bash
npm run build
npx tsc --noEmit -p tsconfig.app.json
./scripts/run-runtime-tests.sh tests/pathing-footprint-regression.spec.ts --reporter=list
```

Dispatch prompt summary:

```text
Implement Pathing/Footprint Contract Pack. Build runtime tests for spawn blockers, GameData footprint consistency, worker-to-resource pathing, and placement overlap rejection. Fix only proven footprint/path bugs.
```

### Task 06 — AI First Five Minutes Deepening

Status: `completed`.

Owner: GLM + Codex review.

Started: 2026-04-11.

Completed: 2026-04-11.

Final review status: accepted after Codex tightened the proof and fixed one runtime crash exposed by the long AI simulation.

Result:

- Added `tests/ai-economy-regression.spec.ts`.
- Fixed AI attack-wave deadlock where `attackWaveSent` could remain true forever after the first wave.
- Fixed `flashHit()` so glTF/nested/multi-material visuals do not crash when taking damage.
- Integrated AI regression into `npm run test:runtime`.

Codex reran:

```bash
npm run build
npx tsc --noEmit -p tsconfig.app.json
./scripts/run-runtime-tests.sh tests/ai-economy-regression.spec.ts --reporter=list
```

Result: 9/9 passed.

Goal: move from “AI does something” to “AI can sustain a playable first five minutes”.

Allowed write scope:

- `tests/ai-economy-regression.spec.ts`
- `src/game/SimpleAI.ts`, `src/game/Game.ts`, `src/game/TeamResources.ts` only for minimal proven fixes
- `docs/GAMEPLAY_REGRESSION_CHECKLIST.md`

Must prove:

- AI has gold and lumber workers assigned by 30 game-seconds.
- AI completes at least one farm before supply cap blocks production.
- AI trains additional workers and footmen without overspending.
- AI attack wave launches after threshold and does not permanently stall after survivors return.
- AI can recover if one worker dies early.
- AI does not spam invalid building placement attempts.

Verification:

```bash
npm run build
npx tsc --noEmit -p tsconfig.app.json
./scripts/run-runtime-tests.sh tests/ai-economy-regression.spec.ts --reporter=list
```

Dispatch prompt summary:

```text
Implement AI First Five Minutes Deepening. Add runtime tests for AI worker assignment, farm completion, worker/footman production, attack wave launch, recovery after worker death, and invalid placement throttling. Minimal fixes only.
```

### Task 07 — Asset Pipeline Contract Pack

Status: `completed`.

Owner: GLM + Codex takeover.

Started: 2026-04-11.

Completed: 2026-04-11.

Final review status: accepted after Codex takeover. GLM's first pass produced weak tests and then conflicted on the same files, so Codex paused GLM, implemented the browser-side hook, tightened the assertions, and ran verification.

Accepted commit: `4ba477f` (`test: add asset pipeline regression pack`).

Codex reran:

```bash
npm run build
npx tsc --noEmit -p tsconfig.app.json
./scripts/run-runtime-tests.sh tests/asset-pipeline-regression.spec.ts --reporter=list
./scripts/run-runtime-tests.sh tests/unit-visibility-regression.spec.ts tests/ai-economy-regression.spec.ts --reporter=list
```

Result: asset pipeline 4/4 passed; neighboring visibility/AI pack 11/11 passed.

Priority reason: asset replacement has already caused worker invisibility, scale override, material sharing, and glTF material-shape crashes. Before sourcing more assets, the pipeline needs deterministic runtime contracts.

Goal: make drop-in `.glb` replacement reliable without subjective visual judgment.

Allowed write scope:

- `tests/asset-pipeline-regression.spec.ts`
- `src/game/AssetCatalog.ts`, `src/game/AssetLoader.ts`, `src/game/UnitVisualFactory.ts`, `src/game/BuildingVisualFactory.ts`, `src/game/Game.ts` only for minimal proven fixes
- `docs/GAMEPLAY_REGRESSION_CHECKLIST.md`

Must prove:

- Missing assets fall back without throwing.
- Loaded assets replace existing fallback visuals after async load.
- Replaced visuals preserve world position and rotation.
- Replaced visuals do not inherit fallback scale incorrectly.
- Materials are cloned per instance before team color mutation.
- Disposed fallback visuals do not leave duplicate meshes in the scene.

Verification:

```bash
npm run build
npx tsc --noEmit -p tsconfig.app.json
./scripts/run-runtime-tests.sh tests/asset-pipeline-regression.spec.ts --reporter=list
```

Dispatch prompt summary:

```text
Implement Asset Pipeline Contract Pack. Add runtime tests for fallback, async refresh, position/rotation preservation, scale preservation, per-instance material cloning, and no duplicate scene meshes after refresh.
```

### Task 08 — Game.ts Module Extraction Slice

Status: `completed`.

Owner: GLM-5.1.

Started: 2026-04-12.

Completed: 2026-04-12.

Outcome:

- Extracted 12 methods and 5 state fields from `Game.ts` into `src/game/FeedbackEffects.ts`.
- Zero behavior change: all visual effects preserved exactly.
- Build + `tsc --noEmit` + `npm run test:runtime` all green.

Changed files:

- `src/game/FeedbackEffects.ts` (new): FeedbackEffects class with all extracted helpers
- `src/game/Game.ts`: delegates to `this.feedback.*` for all 20 call sites; removed extracted methods and fields
- `docs/GLM_READY_TASK_QUEUE.md`: closeout status

Extracted responsibilities:

- Move indicators: showMoveIndicator, showQueuedMoveIndicator, showAttackMoveIndicator, updateMoveIndicators
- Impact rings: spawnImpactRing, updateImpactRings
- Build-complete visual: playBuildCompleteEffect
- Hit/selection flash: flashHit, flashSelection
- Damage numbers: spawnDamageNumber
- Carry indicator: updateCarryIndicator
- Queue indicators: updateQueueIndicators, clearQueueIndicators

Verification:

```bash
npm run build
npx tsc --noEmit -p tsconfig.app.json
npm run test:runtime
FORCE_RUNTIME_CLEANUP=1 ./scripts/cleanup-local-runtime.sh
```

Residual risk:

- FeedbackEffects holds a `getWorldHeight` callback closure; if Game's terrain/mapRuntime changes at runtime (loadMap), the callback still references the same Game instance method which uses the updated mapRuntime. This is correct behavior.
- `playBuildCompleteEffect` uses `setTimeout` for scale/emissive revert — closure captures the FeedbackEffects `this.scene`. Scene reference is stable across the Game lifetime.

### Task 28 — M3 Base Grammar Measurement Pack

Status: `completed`.

Owner: GLM-5.1.

Started: 2026-04-12.

Completed: 2026-04-12.

Result:

- Created `tests/m3-base-grammar-regression.spec.ts` with 5 deterministic spatial grammar tests.
- No product code changes needed — all layout relationships pass with current spawn positions.
- All assertions read real runtime positions, not hardcoded constants.

Proven contracts:

1. Player 0 base has exactly 1 townhall, 1 barracks, ≥5 workers, ≥1 goldmine.
2. Goldmine is close enough for opening economy (dist < 10) but footprints do not overlap (dist > sum of half-extents).
3. Barracks is in a distinct production lane from TH-GM axis (angle > 45°), not overlapping TH, and at reasonable distance (3–20 tiles).
4. Nearest tree line: present (trees > 0), outside TH footprint, reachable (dist < 15), and meaningful density (≥10 trees within range 20).
5. At least one open exit/approach band: 8 cardinal+diagonal directions checked from TH edge outward, requiring ≥4 consecutive unblocked tiles.

Changed files:

- `tests/m3-base-grammar-regression.spec.ts` (new)
- `docs/GLM_READY_TASK_QUEUE.md` (closeout)

Verification:

```bash
npm run build                       # EXIT_CODE=0
npx tsc --noEmit -p tsconfig.app.json  # EXIT_CODE=0
./scripts/run-runtime-tests.sh tests/m3-base-grammar-regression.spec.ts --reporter=list  # 5/5 passed (33.5s)
FORCE_RUNTIME_CLEANUP=1 ./scripts/cleanup-local-runtime.sh  # EXIT_CODE=0
```

Residual ambiguity:

- Tree presence depends on seeded RNG with 0.58–0.70 density per candidate tile. Tests tolerate this with loose bounds (≥10 trees in range 20). If spawn density parameters change significantly, the tree tests may need threshold adjustment.
- "Distinct production lane" uses angle > 45° from TH→GM axis. This is a measurable proxy for spatial separation, not a claim of optimal RTS layout.

### Task 29 — M3 Camera/HUD Readability Contract

Status: `completed`.

Owner: GLM-5.1.

Started: 2026-04-12.

Completed: 2026-04-12.

Result:

- Created `tests/m3-camera-hud-regression.spec.ts` with 4 deterministic camera/HUD readability tests.
- No product code changes needed — all camera framing and HUD layout relationships pass with current settings.

Proven contracts:

1. TH, worker, and goldmine all project into default viewport (NDC bounds + z<1).
2. Core base objects (TH, GM, worker) project above the bottom HUD panel (screen Y < vh - 162px).
3. Command card has 8 visible slots after selecting a worker via programmatic selection.
4. Selected worker has a visible selection ring (within 1.0 world units of worker position) and a visible health bar.

Changed files:

- `tests/m3-camera-hud-regression.spec.ts` (new)
- `docs/GLM_READY_TASK_QUEUE.md` (closeout)

Verification:

```bash
npm run build                       # EXIT_CODE=0
npx tsc --noEmit -p tsconfig.app.json  # EXIT_CODE=0
./scripts/run-runtime-tests.sh tests/m3-camera-hud-regression.spec.ts --reporter=list  # 4/4 passed (35.6s)
FORCE_RUNTIME_CLEANUP=1 ./scripts/cleanup-local-runtime.sh  # EXIT_CODE=0
```

Residual ambiguity:

- Test 3 and 4 use programmatic selection (`selectionModel.setSelection` + `createSelectionRing`/`createHealthBar`) rather than screen-space clicking. This tests HUD response to selection state, not click targeting accuracy. Click targeting is covered by the separate selection-input pack.
- "Above HUD panel" uses center-point projection. Object bounding boxes could extend partially behind the HUD while the center is above it. This is a sufficient readability proxy for M3.

### Task 30 — M4 Victory/Defeat Loop Pack

Status: `completed`.

Owner: GLM-5.1.

Started: 2026-04-12.

Completed: 2026-04-12.

Result:

- Created `tests/m4-match-loop-regression.spec.ts` with 4 deterministic victory/defeat tests.
- Added victory/defeat detection to Game.ts: `checkGameOver()`, `endGame()`, `getMatchResult()`.
- Added game-over overlay HTML element and CSS styling.
- Phase transitions to `GameOver` after terminal state, freezing game time.

Proven contracts:

1. Killing player townhall → `getMatchResult() === 'defeat'`, phase `game_over`.
2. Killing AI townhall → `getMatchResult() === 'victory'`, phase `game_over`.
3. End-state HUD overlay becomes visible with correct text ('胜利' or '失败') and CSS class, stays stable across further frames.
4. Game time freezes at terminal value (phase `GameOver` blocks `update()` game-logic path).

Changed files:

- `tests/m4-match-loop-regression.spec.ts` (new)
- `src/game/Game.ts`: added `gameOverResult` field, `elGameOverOverlay`/`elGameOverText` DOM refs, `checkGameOver()`, `endGame()`, `getMatchResult()` methods, `checkGameOver()` call in update loop
- `index.html`: added `game-over-overlay` div with `game-over-text` child
- `src/styles.css`: added game-over overlay and victory/defeat text styling
- `docs/GLM_READY_TASK_QUEUE.md` (closeout)

Verification:

```bash
npm run build                       # EXIT_CODE=0
npx tsc --noEmit -p tsconfig.app.json  # EXIT_CODE=0
./scripts/run-runtime-tests.sh tests/m4-match-loop-regression.spec.ts --reporter=list  # 4/4 passed (25.3s)
FORCE_RUNTIME_CLEANUP=1 ./scripts/cleanup-local-runtime.sh  # EXIT_CODE=0
```

Residual ambiguity:

- Victory/defeat is based on townhall destruction only. Other terminal conditions (all units dead, all buildings dead without townhall) are not checked. Townhall-only is a sufficient M4 proxy.
- The overlay has `pointer-events: none` — no restart button. Restart requires page reload, which is acceptable for M4.
- AI SimpleAI already stops all operations when its townhall is gone (the `if (!townhall) return` guard), so the AI won't crash or loop after defeat.

### Task 31 — M4 AI Recovery Pack

Status: `completed`.

Owner: GLM-5.1.

Started: 2026-04-12.

Completed: 2026-04-13.

Result:

- Created `tests/m4-ai-recovery-regression.spec.ts` with 4 deterministic AI recovery tests.
- No product code changes needed — AI already recovers correctly from partial economic damage.

Proven contracts:

1. AI replaces at least one lost worker via normal production within 60 game-seconds.
2. After losing 3 of 5 workers, AI resumes gathering and shows economic progression (resources changed or buildings/units produced) within 90 game-seconds.
3. AI does not bypass resource or supply rules during recovery. The test computes `effectiveUsed = supplyUsed + queuedSupply` (same formula as SimpleAI tick) and asserts:
   - `effectiveUsed == supplyUsed + queuedSupply` (consistency)
   - If `effectiveUsed > supplyTotal`: overshoot ≤ 2 (one footman unit)
   - If `effectiveUsed > supplyTotal` and `queuedSupply > 0`: there must be ≥1 in-progress farm that will restore the supply budget
   - Resources non-negative, totalUnits ≤ supplyTotal + 2 (same overshoot bound)
4. Townhall loss is terminal: match enters victory state, no new buildings appear, no new footmen trained, training queues do not grow after TH death. Workers may finish existing gather orders but AI issues no new commands.

Changed files:

- `tests/m4-ai-recovery-regression.spec.ts` (new)
- `docs/GLM_READY_TASK_QUEUE.md` (closeout)

Verification:

```bash
npm run build                       # EXIT_CODE=0
npx tsc --noEmit -p tsconfig.app.json  # EXIT_CODE=0
./scripts/run-runtime-tests.sh tests/m4-ai-recovery-regression.spec.ts --reporter=list  # 4/4 passed (37.3s)
FORCE_RUNTIME_CLEANUP=1 ./scripts/cleanup-local-runtime.sh  # EXIT_CODE=0
```

Residual ambiguity:

- Post-damage supply overshoot: when workers building farms are killed, farms stall and supply.total drops. Units queued before the farm loss complete, causing effectiveUsed > total. The AI's `effectiveUsed + unitSupply <= total` check is correct at train-time. When overshoot is observed with an active training queue, the test requires an in-progress farm to prove the AI has a recovery path. Overshoot is bounded to ≤2 (one footman unit).
- "Recovery" means the AI replaces workers and resumes economic activity, not that it reaches pre-damage unit counts within the test window.
- Terminal damage = townhall destruction only. Losing all workers but keeping townhall is recoverable. Losing townhall is not recoverable (SimpleAI returns early).

### Task 32 — M6 Live Build Smoke Pack

Status: `completed`.

Owner: GLM-5.1.

Started: 2026-04-13.

Completed: 2026-04-13.

Result:

- Created `tests/live-build-smoke.spec.ts` with 5 minimal smoke tests.
- No product code changes needed.
- Synced KNOWN_ISSUES.zh-CN.md and M6_GATE_PACKET.zh-CN.md with current state.

Proven smoke path:

1. Game boots with playable opening state (player TH/workers/barracks, AI TH/workers, goldmine, HUD elements, starting resources).
2. Player can select a worker and issue a gather command.
3. Player resources change after 30s of simulated gathering (workers directed to goldmine).
4. Player can train a unit from barracks (footman queued).
5. AI is active and produces economy within 60s (gathering workers, spent resources, built structures).

Changed files:

- `tests/live-build-smoke.spec.ts` (new)
- `docs/KNOWN_ISSUES.zh-CN.md` (updated victory/defeat status, demo smoke path status)
- `docs/M6_GATE_PACKET.zh-CN.md` (added automated preparation status table)
- `docs/GLM_READY_TASK_QUEUE.md` (closeout)

Verification:

```bash
npm run build                       # EXIT_CODE=0
npx tsc --noEmit -p tsconfig.app.json  # EXIT_CODE=0
./scripts/run-runtime-tests.sh tests/live-build-smoke.spec.ts --reporter=list  # 5/5 passed (35.4s)
FORCE_RUNTIME_CLEANUP=1 ./scripts/cleanup-local-runtime.sh  # EXIT_CODE=0
```

Residual ambiguity:

- The smoke spec is NOT registered in `npm run test:runtime` / `run-runtime-suite.sh`. It is a standalone M6 gate, not part of the continuous regression pack. Adding it would require modifying `scripts/run-runtime-suite.sh`, which was not done to avoid scope creep.
- README was not rewritten as an external-playtest entry doc — that is a human-gate decision, not an automated check.
- The test does not claim public readiness. The M6 gate packet explicitly marks this as a "private playtest candidate" boundary, not a public release.
- Gather proof uses the exposed `g.issueCommand(...gather...)` runtime-test command hook plus `resourceTarget`/path setup; train proof uses the real command-card button click path. The spec still does not require full click→NDC→raycast gather targeting, because this pack is a smoke gate rather than a command-surface regression.

### Task 33 — M7 SelectionController Extraction Slice

Status: `completed`.

Owner: GLM-5.1.

Started: 2026-04-13.

Completed: 2026-04-13.

Accepted commit: `d816736` (`refactor: extract SelectionController slice from Game.ts`).

Result:

- Created `src/game/SelectionController.ts` with extracted selection query/display helpers.
- Updated `src/game/Game.ts` to delegate to `this.sel` and added backward-compatible deprecated shims for test access.
- Net diff: +344 / -595 lines (Game.ts shrinks by ~250 lines).

Extracted responsibilities:

- Unit lookup: `findUnitByObject`, `resolveHitUnits`, `resolveClickSelectionTarget`
- Screen-space query: `isUnitOnScreen`
- Selection rings: `createSelectionRing`, `clearSelectionRings`, `syncSelectionRings`, `updateSelectionRings`, `removeSelectionRingAt`
- Box-select visuals: `drawSelectionBox`, `hideSelectionBox`

Selection-only boundary:

- No right-click command logic moved.
- No HUD cache rules changed.
- No input timing or event orchestration moved.
- No control group / Tab / Esc behavior changed.
- No gather/resource/attack/build semantics touched.

Explicit unchanged behaviors:

1. Left-click single select semantics unchanged.
2. Box select semantics unchanged.
3. Shift add/remove toggle unchanged.
4. Post-selection command card and portrait refresh timing unchanged.
5. Right-click move/gather/attack command results unchanged.
6. Control group, Tab, Esc player-visible behavior unchanged.

Verification:

```bash
npm run build                          # EXIT_CODE=0
npx tsc --noEmit -p tsconfig.app.json  # EXIT_CODE=0
./scripts/run-runtime-tests.sh tests/selection-input-regression.spec.ts --reporter=list  # 6/6 passed
./scripts/run-runtime-tests.sh tests/command-surface-regression.spec.ts tests/command-card-state-regression.spec.ts --reporter=list  # 20/20 passed
npm run test:runtime                   # 5/5 shards, 117 tests, 846s total
FORCE_RUNTIME_CLEANUP=1 ./scripts/cleanup-local-runtime.sh  # EXIT_CODE=0
```

Product behavior changed: No. Zero behavior change extraction.

Remaining ambiguity:

- Backward-compatible deprecated shims (`selectionRings`, `selBoxEl`, `createSelectionRing`, `clearSelectionRings`) are public on Game for test access. These should be migrated to `g.sel.*` in a future task if test backward compatibility is no longer needed.
- `SelectionController.selectionRings` is a `readonly` array (reference immutable, content mutable). This is intentional to support both internal mutation and external test reads through the deprecated shim.

Task 33 result: accepted by Codex after local build, typecheck, `selection-input` 6/6, `command-surface` + `command-card-state` 20/20, and cleanup
```

### Task 34 — M7 PlacementController Hardening Slice

Status: `completed`.

Owner: GLM-5.1.

Started: 2026-04-13.

Completed: 2026-04-13.

Accepted commit: `a985e6d` (`refactor: extract ghost preview helpers into PlacementController`).

Result:

- Extended `src/game/PlacementController.ts` with two new methods: `createGhostMesh` and `updatePreview`.
- Updated `src/game/Game.ts`: delegated ghost mesh creation and preview update to PlacementController; removed `createBuildingMesh` method.
- Net diff: Game.ts -47 lines, PlacementController.ts +66 lines.

Files changed:

- `src/game/PlacementController.ts` — added `createGhostMesh`, `updatePreview`, and JSDoc
- `src/game/Game.ts` — changed `enterPlacementMode` and `updateGhostPlacement` to delegate; removed `createBuildingMesh`

Scope:

- Extracted: ghost preview mesh creation, ghost position update + validation color feedback
- Explicitly not touched: builder agency, resource payment, build progress, cancel/resume, footprint/occupancy, right-click commands, HUD cache, selection, AI, combat

Placement-only proof:

- Placement mode state (begin/exit): unchanged — same `begin()` / `exit()` calls
- Ghost / preview lifecycle: unchanged — same creation timing, same scene.add, same exit cleanup
- Preview position / anchor / rounding: unchanged — same `Math.round`, same `+0.5` offset, same `getWorldHeight`
- Validation bridge: unchanged — same `canPlace(tx, tz, def.size)` call with same inputs
- Failure cleanup: unchanged — `exitPlacementMode()` path identical
- Builder agency / payment / build progress / cancel-resume: all remain in Game.ts untouched

Explicit unchanged behaviors:

1. Enter placement mode: same resource check, same worker save, same ghost creation, same mode hint
2. Ghost preview position: same snap-to-tile, same height offset
3. Validation color: same green/red threshold, same material traversal
4. Place building: same `canPlace` check, same resource spend, same builder assignment, same `exitPlacementMode`
5. Cancel placement: same cleanup path
6. Builder agency: not touched
7. Resource payment: not touched
8. Right-click commands: not touched

Commands run:

- `npm run build`: pass (built in 1.05s)
- `npx tsc --noEmit -p tsconfig.app.json`: pass (no output)
- `./scripts/run-runtime-tests.sh tests/building-agency-regression.spec.ts tests/construction-lifecycle-regression.spec.ts tests/pathing-footprint-regression.spec.ts --reporter=list`: 21/21 passed (2.0m)
- `FORCE_RUNTIME_CLEANUP=1 ./scripts/cleanup-local-runtime.sh`: pass (no residual processes)

Behavior unchanged: Yes. The diff only moves existing placement-preview code into PlacementController with identical logic. All building agency, construction lifecycle, and pathing footprint contracts pass unchanged.

Remaining ambiguity:

- `createBuildingMesh` in Game.ts was only used for ghost creation, so removing it is safe. No other caller existed.
- `updatePreview` receives a `getWorldHeight` callback and `PlacementValidator` reference — these are passed from Game.ts on each call, not stored. The controller remains stateless beyond its own mode/ghost/workers.

Task 34 result: accept-ready

### Task 35 — M7 Contract Coverage Gap Sweep

Status: `completed`.

Owner: GLM-5.1.

Started: 2026-04-13.

Completed: 2026-04-13.

Accepted commit: `8af6f3b` (`test: add HUD command-card cache transition regression`).

Chosen gap: HUD command-card cache transitions

Files changed:

- `tests/hud-cache-transition-regression.spec.ts` (new) — 5 focused deterministic tests

Product code changed: No. All 5 transitions pass with the existing `_lastCmdKey` cache invalidation logic.

What is now proven:

1. **Selection transition (worker → TH → barracks → worker round-trip)**: Each transition shows the correct command buttons (build menu, worker train, footman train) with no stale buttons from the previous selection.
2. **Under-construction vs completed building**: Cancel button appears for under-construction buildings and disappears when buildProgress reaches 1, without reselection.
3. **Cancel construction → empty selection**: After cancel, the command card clears to zero buttons, and explicit empty selection shows "未选择单位".
4. **Death cleanup**: Killing a selected barracks clears the command card — no stale footman or rally buttons remain.
5. **Resource/supply change without reselection**: Supply-capped footman shows "人口" reason; completing a farm removes the supply block; draining gold changes the reason to "黄金不足" (not stale "人口").

Commands run:

- `npm run build`: pass (1.03s)
- `npx tsc --noEmit -p tsconfig.app.json`: pass (no output)
- `./scripts/run-runtime-tests.sh tests/hud-cache-transition-regression.spec.ts --reporter=list`: 5/5 passed (30s)
- `./scripts/run-runtime-tests.sh tests/command-card-state-regression.spec.ts --reporter=list`: 7/7 passed (44s)
- `FORCE_RUNTIME_CLEANUP=1 ./scripts/cleanup-local-runtime.sh`: pass, no residual processes

What is still not proven:

- The test does not cover multi-select transitions (e.g. selecting two barracks then deselecting one).
- It does not test HUD portrait canvas content — only command-card buttons and disabled reasons.
- It does not test training queue progress causing cache invalidation (the cache key includes `primaryQueueKey` with `remaining` bucketed to 0.1s, but the test doesn't advance simulation time to trigger queue progress).
- The spec is not yet registered in `scripts/run-runtime-suite.sh`.

Remaining ambiguity:

- The cache key includes `res.gold`, `res.lumber`, `supply.used`, `supply.total`, `queuedSupply`, and `primaryQueueKey`. The tests prove invalidation works for gold and supply changes but not for lumber-only or queuedSupply-only edge cases.
- The test does not assert portrait canvas content — only DOM command-card button state.

Task 35 result: accept-ready

## Dispatch Priority

Use this order unless current failures suggest otherwise:

1. Task 28 M3 Base Grammar Measurement Pack
2. Task 29 M3 Camera/HUD Readability Contract
3. Task 30 M4 Victory/Defeat Loop Pack
4. Task 31 M4 AI Recovery Pack
5. Task 32 M6 Live Build Smoke Pack
6. Task 33 M7 SelectionController Extraction Slice
7. Task 34 M7 PlacementController Hardening Slice
8. Task 35 M7 Contract Coverage Gap Sweep

Reasoning: `M2` objective work is already substantially green, the user has explicitly authorized continuous execution through `M7`, and GLM should keep feeding the next objective bundle or hardening lane instead of waiting for milestone-by-milestone permission.

### 攻击护甲最小模型证明包

Status: `done`.

Milestone: `V6 War3 identity alpha`.
Gate: `V6-NUM1`.
Prerequisite: `人族数值字段盘点` 已完成。

Owner: GLM-style worker + Codex review.

Closeout (2026-04-15):
- GameData.ts: moved AttackType/ArmorType enums to top of file; assigned types to worker (Normal/Unarmored), footman (Normal/Heavy), rifleman (Piercing/Unarmored), tower (Piercing/Medium).
- Game.ts dealDamage(): wired getTypeMultiplier() lookup into damage formula → `rawDamage * typeMultiplier * (1 - armorReduction)`.
- Tests: 4/4 passed — proof-1 (different armor types → different damage), proof-2 (armor reduction still works with multiplier), proof-3 (exact values match centralized table), proof-4 (fresh state after kill).

Goal:

在当前战斗结算里加入最小 `attackType` / `armorType` 数据入口和倍率表，证明同一攻击值打到不同护甲类型时会产生不同结果，同时原有护甲数值减伤仍然有效。

Allowed files:

- `src/game/GameData.ts`
- `src/game/Game.ts`
- `tests/v6-attack-armor-type-proof.spec.ts`
- `docs/GLM_READY_TASK_QUEUE.md` only for closeout sync

Forbidden:

- `src/game/SimpleAI.ts`
- Asset files
- Menu / UI polish
- Hero / spell / item implementations
- Broad balance table or full War3 multiplier matrix

Must prove:

1. 同一攻击值命中至少两种护甲类型时结果不同。
2. 护甲数值减伤仍会和 attackType / armorType 倍率一起生效。
3. 倍率表来自数据字段和集中表，不允许散落 if 判断。
4. 测试在修改状态后必须重新读取 fresh state，避免缓存假绿。

Verification:

```bash
npm run build
npx tsc --noEmit -p tsconfig.app.json
./scripts/run-runtime-tests.sh tests/v6-attack-armor-type-proof.spec.ts --reporter=list
./scripts/cleanup-local-runtime.sh
```

### 研究效果数据模型证明包

Status: `done`.

Milestone: `V6 War3 identity alpha`.
Gate: `V6-NUM1`.
Prerequisite: `人族基础数值账本`、`数值底座证明计划`、`攻击护甲最小模型证明包` 已完成。

Owner: GLM-style worker + Codex review.

Closeout (2026-04-15):
- GameData.ts: added ResearchEffectType const enum, ResearchEffect interface, and effects[] field on ResearchDef; migrated long_rifles to effects data.
- Codex review removed the unused LONG_RIFLES_RANGE_BONUS constant after migration.
- Game.ts: replaced hardcoded applyLongRifles() with generic applyResearchEffects + applyFlatDeltaEffect + applyCompletedResearchesToUnit; added duplicate-completion guard so the same research effect does not stack.
- Codex review fixed proof-2 to use real startResearch -> tick -> retry flow instead of manually adding range twice.
- Codex local verification passed: build, app typecheck, and locked runtime `12/12` across NUM-D, NUM-C, and V5 Long Rifles.

Goal:

把 Long Rifles 从 `LONG_RIFLES_RANGE_BONUS` 单点逻辑迁移到最小 `ResearchDef.effects[]` 数据模型，至少支持 `flatDelta` 研究效果，并证明研究效果来自同一数据入口。

Allowed files:

- `src/game/GameData.ts`
- `src/game/Game.ts`
- `tests/v6-research-effect-model-proof.spec.ts`
- `docs/GLM_READY_TASK_QUEUE.md` only for closeout sync

Forbidden:

- `src/game/SimpleAI.ts`
- Asset files
- Menu / UI polish
- Hero / spell / item implementations
- Complete Blacksmith tech tree
- Broad balance table

Must prove:

1. Long Rifles 的射程变化来自 `ResearchDef.effects[]` 或等价 data-driven effect 字段。
2. 已完成研究不会重复叠加。
3. 已存在 Rifleman 和研究后新训练 Rifleman 都得到同一效果。
4. 命令卡能区分 unavailable、available、researching、completed。
5. cleanup / reload 后旧研究状态不残留。
6. 测试 mutation 后必须重新读取 fresh `window.__war3Game` / `g.units` 状态。

Verification:

```bash
npm run build
npx tsc --noEmit -p tsconfig.app.json
./scripts/run-runtime-tests.sh tests/v6-research-effect-model-proof.spec.ts --reporter=list
./scripts/cleanup-local-runtime.sh
```

### 玩家可见数值提示证明包

Status: `accepted`.

Milestone: `V6 War3 identity alpha`.
Gate: `V6-NUM1`.
Prerequisite: `研究效果数据模型证明包` 已完成。

Owner: GLM-style worker + Codex review.


Closeout (2026-04-15):

- GLM 初版新增 `ATTACK_TYPE_NAMES` / `ARMOR_TYPE_NAMES`，选择面板开始展示攻击类型、护甲类型和护甲值。
- 命令卡训练按钮展示真实成本和人口；研究按钮展示来自 `ResearchDef.effects[]` 的效果说明。
- Codex 复核时把 NUM-E 测试从写死数字改为导入 `GameData` 期望值，再和 DOM / fresh runtime state 对照。
- Codex 本地验证通过：`npm run build`、`npx tsc --noEmit -p tsconfig.app.json`、NUM-C / NUM-D / NUM-E locked runtime `15/15`。
- cleanup 已执行；NUM-E 现在是 `accepted`，可以作为 V6-ID1 后续任务前置。

Dispatch note:

2026-04-15 曾因 NUM-D 队列状态先于 Codex 本地复核变为 done 而被提前派发一次；该次派发已取消并归档。Codex 已完成 NUM-D 本地复核，当前可正式派发。

Goal:

让玩家在命令卡或选择面板里看到至少一组来自真实数据源的数值提示：成本、人口、前置、攻击类型、护甲类型、研究效果或禁用原因。提示必须绑定 `GameData` / runtime state，不能手写一段看起来像数值的假文案。

Allowed files:

- `src/game/GameData.ts`
- `src/game/Game.ts`
- `src/styles.css`
- `tests/v6-visible-numeric-hints-proof.spec.ts`
- `docs/GLM_READY_TASK_QUEUE.md` only for closeout sync

Forbidden:

- `src/game/SimpleAI.ts`
- Asset files
- Menu / front-door / pause / results shell work
- Hero / spell / item implementations
- Broad balance tuning

Must prove:

1. 至少一个训练、建造或研究按钮显示真实成本、人口、前置或研究效果。
2. 至少一个单位或建筑选择态显示真实攻击类型 / 护甲类型 / 护甲值中的一组。
3. disabled reason 来自现有 availability 判断，而不是和按钮状态脱节的手写文本。
4. 研究完成、资源变化、选择变化后提示会刷新，不保留旧状态。
5. 测试读取 DOM 后必须回查 fresh `window.__war3Game` state，证明显示值来自真实数据。

Verification:

```bash
npm run build
npx tsc --noEmit -p tsconfig.app.json
./scripts/run-runtime-tests.sh tests/v6-visible-numeric-hints-proof.spec.ts --reporter=list
./scripts/cleanup-local-runtime.sh
```

### 人族集结号令最小证明包

Status: `accepted`.

Milestone: `V6 War3 identity alpha`.
Gate: `V6-ID1`.
Prerequisite: `玩家可见数值提示证明包` accepted.

Owner: GLM-style worker + Codex takeover.

Goal:

实现一个最小“人族集结号令”指挥能力，作为 V6-ID1 的第一条 identity slice。它可以用现有人族单位和 fallback/proxy 状态表达，必须有真实触发、有限持续、可见反馈、限制条件和 cleanup。

Allowed files:

- `src/game/GameData.ts`
- `src/game/Game.ts`
- `src/styles.css`
- `tests/v6-human-rally-call-identity-proof.spec.ts`
- `docs/GLM_READY_TASK_QUEUE.md` only for closeout sync

Forbidden:

- `src/game/SimpleAI.ts`
- Asset files
- Official Warcraft assets, icons, sounds, or extracted material
- Full hero entity model
- XP, levels, skill points, inventory, shop, item drops
- Complete spell book or aura framework

Must prove:

1. Command card exposes the ability only when a valid player-owned Human source is selected.
2. Triggering the ability writes real runtime state; at least one nearby friendly unit gets a measurable temporary effect.
3. The effect has a finite duration and cleanup removes it from all affected units.
4. Cooldown, invalid source, or missing valid target state blocks repeat spam with a visible disabled reason.
5. Feedback is visible through state text, class, marker, command-card state, or other project-local fallback, and is bound to runtime state.
6. Reload / return-to-menu / fresh start does not keep old rally-call state.

Verification:

```bash
npm run build
npx tsc --noEmit -p tsconfig.app.json
./scripts/run-runtime-tests.sh tests/v6-human-rally-call-identity-proof.spec.ts --reporter=list
./scripts/cleanup-local-runtime.sh
```

Closeout:

- GLM job `glm-mnzd89mr-pxbkiu` started the implementation but got stuck in Claude Code auto-compact / reconnect state before a closeout.
- Codex cancelled the stuck job, cleaned the orphaned direct Playwright/Vite/Chrome run, and completed the local review.
- Verification passed:
  - `npm run build`
  - `npx tsc --noEmit -p tsconfig.app.json`
  - `./scripts/run-runtime-tests.sh tests/v6-human-rally-call-identity-proof.spec.ts --reporter=list` -> 6/6
  - `./scripts/run-runtime-tests.sh tests/v6-human-rally-call-identity-proof.spec.ts tests/v6-visible-numeric-hints-proof.spec.ts tests/v6-research-effect-model-proof.spec.ts tests/v6-attack-armor-type-proof.spec.ts tests/v5-human-long-rifles-tech.spec.ts tests/command-regression.spec.ts --reporter=list` -> 30/30
  - `./scripts/cleanup-local-runtime.sh`
- Accepted as V6-ID1 engineering evidence only. It does not prove a full hero system, full spell book, item system, or complete Human identity.

### Footman / Rifleman 角色差异证明包

Status: `accepted`.

Milestone: `V6 War3 identity alpha`.
Gate: `V6-FA1`.
Prerequisite: `人族集结号令最小证明包` accepted.

Owner: GLM-style worker + Codex takeover.

Goal:

证明当前人族已经有至少一组可观察兵种身份差异：Footman 是近战前排，Rifleman 是远程火力，Long Rifles 科技只强化 Rifleman 的远程定位。这个 proof 关闭的是 V6-FA1 的最小工程面，不扩张成完整人族。

Allowed files:

- `src/game/GameData.ts`
- `src/game/Game.ts`
- `tests/v6-footman-rifleman-role-identity-proof.spec.ts`
- `docs/GLM_READY_TASK_QUEUE.md` only for closeout sync

Forbidden:

- `src/game/SimpleAI.ts`
- `src/styles.css`
- Asset files
- Official Warcraft assets, icons, sounds, or extracted material
- New hero, item, shop, inventory, campaign, multiplayer, or full race-select systems
- Broad balance tuning not required by this proof

Must prove:

1. Footman / Rifleman 的成本、人口、攻击、护甲、射程、前置来自 `GameData` 和 runtime state，不是测试写死。
2. Barracks / Blacksmith / Long Rifles 路径给玩家形成不同生产或科技选择。
3. Footman 以近战前排方式接敌，Rifleman 以远程方式输出；Long Rifles 只改变 Rifleman 远程身份。
4. 选择面板或命令卡能让玩家看见这些差异。
5. fresh state、mutation 后重新读取 state、cleanup 不残留。

Verification:

```bash
npm run build
npx tsc --noEmit -p tsconfig.app.json
./scripts/run-runtime-tests.sh tests/v6-footman-rifleman-role-identity-proof.spec.ts tests/v6-visible-numeric-hints-proof.spec.ts tests/v6-research-effect-model-proof.spec.ts tests/v6-attack-armor-type-proof.spec.ts tests/v5-human-long-rifles-tech.spec.ts --reporter=list
./scripts/cleanup-local-runtime.sh
```

Closeout:

- GLM job `glm-mnze1drz-a0hkcq` started the implementation and produced the first FA1 proof, but the first runtime pass failed:
  - proof-4 queried `type-badge` while the actual DOM uses `unit-type-badge`.
  - proof-5 pushed `completedResearches` directly after spawning Rifleman, so the existing unit did not receive the real Long Rifles effect path.
- GLM then got stuck at the queued prompt state; Codex stopped the GLM watch session, cancelled the companion job, cleaned the runtime, and took over the fix.
- Codex corrected the proof to use real `GameData` / runtime expectations, real research queue completion, enough supply for training buttons, and the actual HUD selector.
- Verification passed:
  - `npm run build`
  - `npx tsc --noEmit -p tsconfig.app.json`
  - `./scripts/run-runtime-tests.sh tests/v6-footman-rifleman-role-identity-proof.spec.ts --reporter=list` -> 5/5
  - `./scripts/run-runtime-tests.sh tests/v6-footman-rifleman-role-identity-proof.spec.ts tests/v6-visible-numeric-hints-proof.spec.ts tests/v6-research-effect-model-proof.spec.ts tests/v6-attack-armor-type-proof.spec.ts tests/v5-human-long-rifles-tech.spec.ts --reporter=list` -> 22/22
  - `./scripts/cleanup-local-runtime.sh`
- Accepted as V6-FA1 engineering evidence only. It proves the current Footman / Rifleman identity slice; it does not prove full Human roster, full War3 balance, complete AI strategy, or real Warcraft assets.
