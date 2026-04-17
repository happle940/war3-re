# V9 HN7-CLOSE13 Human Blacksmith Branch Global Closure

> 用途：把 HN7 全部 Blacksmith/Barracks 相关升级子链串成全局闭环，清楚列出已完成和未打开的内容。

## 0. 全局概览

HN7 Human Blacksmith/Barracks 分支包含以下已验收子链：

| 子链 | 任务范围 | 核心产出 | 验证状态 |
| --- | --- | --- | --- |
| 近战武器三段 | SRC3/SRC4/DATA3/DATA4/IMPL4/IMPL5/CLOSE6 | Iron/Steel/Mithril Forged Swords（footman/militia/knight attackDamage +1/+1/+1） | static + runtime accepted |
| 远程火药三段 | SRC5/DATA5/IMPL6/CLOSE7 | Black/Refined/Imbued Gunpowder（rifleman/mortar_team attackDamage +1/+1/+1） | static + runtime accepted |
| Plating 三段 | SRC6/DATA6/IMPL7/CLOSE8 | Iron/Steel/Mithril Plating（footman/militia/knight armor +2/+2/+2） | static + runtime accepted |
| Long Rifles | 前序任务 | long_rifles（rifleman attackRange +1.5） | static + runtime accepted |
| Animal War Training | SRC7/MODEL8/DATA7/IMPL9/CLOSE10/AI11/AI12/AI13 | animal_war_training（knight maxHp +100）+ AI 策略 | static + runtime accepted |
| Blacksmith 升级 AI | AI14/AI15/AI16 | AI 同规则使用近战/远程/Plating 三段升级 | static + runtime accepted |
| Leather Armor 三段 | SRC8/MODEL9/MODEL10/DATA8/IMPL11/CLOSE12 | Studded/Reinforced/Dragonhide（rifleman/mortar_team armor +2/+2/+2） | static + runtime accepted |

## 1. Blacksmith 研究总览

Blacksmith 当前有 13 个研究：

| # | Key | 成本 | 时间 | 建筑 | 前置 | Effect targets | Effect stat |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | long_rifles | 175/50 | 20s | blacksmith | — | rifleman | attackRange +1.5 |
| 2 | iron_forged_swords | 100/50 | 60s | blacksmith | — | footman/militia/knight | attackDamage +1 |
| 3 | steel_forged_swords | 175/175 | 75s | keep | iron_forged_swords | footman/militia/knight | attackDamage +1 |
| 4 | mithril_forged_swords | 250/300 | 90s | castle | steel_forged_swords | footman/militia/knight | attackDamage +1 |
| 5 | black_gunpowder | 100/50 | 60s | blacksmith | — | rifleman/mortar_team | attackDamage +1 |
| 6 | refined_gunpowder | 175/175 | 75s | keep | black_gunpowder | rifleman/mortar_team | attackDamage +1 |
| 7 | imbued_gunpowder | 250/300 | 90s | castle | refined_gunpowder | rifleman/mortar_team | attackDamage +1 |
| 8 | iron_plating | 125/75 | 60s | blacksmith | — | footman/militia/knight | armor +2 |
| 9 | steel_plating | 150/175 | 75s | keep | iron_plating | footman/militia/knight | armor +2 |
| 10 | mithril_plating | 175/275 | 90s | castle | steel_plating | footman/militia/knight | armor +2 |
| 11 | studded_leather_armor | 100/100 | 60s | blacksmith | — | rifleman/mortar_team | armor +2 |
| 12 | reinforced_leather_armor | 150/175 | 75s | keep | studded_leather_armor | rifleman/mortar_team | armor +2 |
| 13 | dragonhide_armor | 200/250 | 90s | castle | reinforced_leather_armor | rifleman/mortar_team | armor +2 |

## 2. Barracks 研究

| Key | 成本 | 时间 | 建筑 | 前置 | Effect targets | Effect stat |
| --- | --- | --- | --- | --- | --- | --- |
| animal_war_training | 125/125 | 40s | barracks | castle+lumber_mill+blacksmith | knight | maxHp +100 |

## 3. 三本建筑门槛

所有三段研究链共享同一建筑门槛模式：
- **T1 (Blacksmith)**: 无额外建筑需求
- **T2 (Keep)**: requiresBuilding `keep`
- **T3 (Castle)**: requiresBuilding `castle`

Long Rifles 和 Animal War Training 是独立单级研究，无三段递进。

## 4. 前置链总结

四条三段链（近战/远程/Plating/Leather）各自内部有前置依赖（L1 → L2 → L3），四条链之间无交叉前置。AWT 的前置是多建筑条件（castle + lumber_mill + blacksmith）。

## 5. 命令卡容量

命令卡为 4×4 = 16 格。Blacksmith 当前 13 个研究按钮可全部显示，仍剩 3 个空槽；本结论不表示 Blacksmith 已经拥有额外 3 个可操作按钮。

## 6. AI 覆盖

- AI 已能按同规则使用 Blacksmith 三段升级（近战/远程/Plating）。
- AI 已能使用 Animal War Training。
- AI Castle/Knight strategy **未单独完成**：AI 不在 Castle 后自动转骑士生产或骑士战术。这是明确的未完成项，不能误宣称。

## 7. 护甲类型现状

| 单位 | armorType | 受影响研究 |
| --- | --- | --- |
| footman | Heavy | 近战武器 + Plating |
| militia | Heavy | 近战武器 + Plating |
| knight | Heavy | 近战武器 + Plating + AWT |
| rifleman | Medium | 远程火药 + Leather Armor + Long Rifles |
| mortar_team | Unarmored | 远程火药 + Leather Armor |
| priest | Unarmored | — |
| sorceress | Unarmored | — |
| worker | Unarmored | — |

## 8. 禁区确认

以下在 HN7 中**未打开**，后续需走新分支合同：

- 不新增英雄单位或英雄系统
- 不新增空军单位
- 不新增物品系统
- 不新增美术素材
- 不新增第二阵营
- 不新增多人模式
- 不把 Mortar Team 改成 Heavy（现有 Unarmored 决策仍然有效）
- 不新增 AI Castle/Knight 策略（AI 骑士生产和战术未完成）
- 不新增新的护甲类型

## 9. 后续安全方向

HN7 Blacksmith 分支全局闭环完成后，可选后续方向（均需新分支合同）：

- AI Castle/Knight strategy（骑士生产 + 战术）
- Hero branch contract（英雄系统）
- Human global closure（人族整体收口）
- 新的护甲类型迁移（如 Mortar Team Heavy parity 债务）

## 10. 证据文件索引

| 子链 | 闭环文档 | 静态 proof | Runtime proof |
| --- | --- | --- | --- |
| 近战武器 | `docs/V9_HN7_MELEE_UPGRADE_SOURCE_PACKET.zh-CN.md` | `tests/v9-hn7-melee-upgrade-chain-closure.spec.mjs` | `tests/v9-hn7-melee-upgrade-runtime.spec.ts` |
| 远程火药 | `docs/V9_HN7_RANGED_UPGRADE_SOURCE_PACKET.zh-CN.md` | `tests/v9-hn7-ranged-upgrade-chain-closure.spec.mjs` | `tests/v9-hn7-ranged-upgrade-runtime.spec.ts` |
| Plating | (inline in source packet) | `tests/v9-hn7-plating-upgrade-chain-closure.spec.mjs` | `tests/v9-hn7-plating-upgrade-runtime.spec.ts` |
| Leather Armor | `docs/V9_HN7_LEATHER_ARMOR_CLOSURE_INVENTORY.zh-CN.md` | `tests/v9-hn7-leather-armor-closure.spec.mjs` | `tests/v9-hn7-leather-armor-runtime.spec.ts` |
| AWT | `docs/V9_HN7_ANIMAL_WAR_TRAINING_SOURCE_PACKET.zh-CN.md` | `tests/v9-hn7-animal-war-training-closure.spec.mjs` | `tests/v9-hn7-animal-war-training-runtime.spec.ts` |
| Blacksmith AI | `docs/V9_HN7_BLACKSMITH_UPGRADE_AI_CLOSURE.zh-CN.md` | `tests/v9-hn7-blacksmith-upgrade-ai-closure.spec.mjs` | (covered by upgrade runtime) |
| AWT AI | `docs/V9_HN7_ANIMAL_WAR_TRAINING_AI_STRATEGY_CONTRACT.zh-CN.md` | `tests/v9-hn7-animal-war-training-ai-closure.spec.mjs` | (covered by AI runtime) |
