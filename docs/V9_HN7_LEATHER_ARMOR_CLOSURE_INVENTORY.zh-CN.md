# V9 HN7-CLOSE12 Leather Armor 闭环盘点

> 用途：把 SRC8 → MODEL9 → MODEL10 → DATA8 → IMPL11 五张 Leather Armor 任务串成闭环，防止后续重复派发或误扩。

## 0. 闭环链路

| 任务 | 类型 | 核心产出 | 验证结果 |
| --- | --- | --- | --- |
| Task 194 HN7-SRC8 | source boundary | 三段 Leather Armor 来源包定义（Studded / Reinforced / Dragonhide 的成本、时间和阶段前置）；迁移前 rifleman/mortar_team 均为 Unarmored | static proof 18/18 |
| Task 195 HN7-MODEL9 | migration contract | Rifleman 单独迁移 Medium 的合同；Mortar Team 是兼容风险单位需单独决策，不盲迁移 | contract+boundary proof 31/31 |
| Task 196 HN7-MODEL10 | parity decision | Mortar Team 保持 Unarmored 的决策文档；War3 Heavy 作为后续 parity 债务记录 | parity+MODEL9 static 31/31 |
| Task 197 HN7-DATA8 | data seed | 三段 Leather Armor 数据种子落地 `GameData.ts`；targetUnitType 只含 rifleman + mortar_team | DATA8/source/parity/MODEL9 static 67/67 |
| Task 198 HN7-IMPL11 | runtime smoke | 命令卡显示、前置门控 L1→L2→L3、累计 armor +6、新单位继承、非目标排除 | runtime 4/4 + 相邻 regression 14/14 |

## 1. 来源包定义对齐

- `studded_leather_armor`: gold 100 / lumber 100 / time 60s / requiresBuilding `blacksmith` / 无前置研究
- `reinforced_leather_armor`: gold 150 / lumber 175 / time 75s / requiresBuilding `keep` / prerequisite `studded_leather_armor`
- `dragonhide_armor`: gold 200 / lumber 250 / time 90s / requiresBuilding `castle` / prerequisite `reinforced_leather_armor`

三段成本递增、建筑门槛递升（blacksmith → keep → castle）、前置链单向递进。来源：`src/game/GameData.ts` RESEARCHES。

## 2. Rifleman Medium 迁移

- `UNITS.rifleman.armorType` 已从 `Unarmored` 迁移为 `ArmorType.Medium`。
- 迁移范围：仅 rifleman。Mortar Team 不在迁移目标中。
- DAMAGE_MULTIPLIER_TABLE 中 Piercing vs Medium = 0.75（降低了步枪兵对 Piercing 攻击的受伤）。

## 3. Mortar Team 护甲归属

- `UNITS.mortar_team.armorType` 保持 `ArmorType.Unarmored`。
- War3 原版 Mortar Team 是 Heavy；当前保留 Unarmored 是有意选择，非遗漏。
- Leather Armor 通过 `targetUnitType: 'mortar_team'` 仍覆盖 mortar_team，无需 mortar_team 本身改 armorType。

## 4. DATA8 数据变更

- `GameData.ts` 新增 `studded_leather_armor`、`reinforced_leather_armor`、`dragonhide_armor` 三段 RESEARCHES 条目。
- 每段含 2 个 effects，均为 `{ type: FlatDelta, targetUnitType, stat: 'armor', value: 2 }`。
- targetUnitType 只含 `'rifleman'` 和 `'mortar_team'`，不含任何其他单位。
- `BUILDINGS.blacksmith.researches` 数组新增三个 key，总数从 10 增长到 13。
- 不改 UNITS、ATTACK_TYPES、DAMAGE_MULTIPLIER_TABLE 或任何其他 RESEARCHES 条目。

## 5. IMPL11 runtime 证据

- **LA-RT-1**: Blacksmith 选中时命令卡显示「镶钉皮甲」「强化皮甲」「龙皮甲」按钮；L2/L3 通过 `getResearchAvailability` 证明前置阻断。
- **LA-RT-2**: 前置门控链：无 Blacksmith → L1 不可用；有 Blacksmith → L1 可用；无 L1 → L2 不可用（需「主城」）；有 Keep+L1 → L2 可用；无 L2 → L3 不可用（需「城堡」）；有 Castle+L2 → L3 可用。
- **LA-RT-3**: 三段研究完成后：现有 rifleman/mortar_team armor +6，新训练的 rifleman/mortar_team 继承 +6。
- **LA-RT-4**: footman、militia、knight、priest、sorceress、worker、tower 的 armor 不受影响。

## 6. 命令卡容量

- 命令卡从 12 格（3×4）扩展为 16 格（4×4），可容纳 Blacksmith 13 个研究按钮。
- CSS 来源：`src/styles.css` `#command-card` grid 4×4。

## 7. 禁区确认

以下在 Leather Armor 任务序列中**未打开**，后续需走新分支合同：

- 不新增英雄单位或英雄系统
- 不新增空军单位
- 不新增物品系统
- 不新增美术素材
- 不新增 AI Castle/Knight 策略
- 不新增护甲类型迁移（Heavy / Unarmored / Medium 以外的类型）
- 不修改 DAMAGE_MULTIPLIER_TABLE
- 不把 Mortar Team 改成 Heavy

## 8. 后续安全方向

Leather Armor 闭环完成后，可选后续方向（均需新分支合同）：

- HN7/Human global closure（人族全局收口盘点）
- AI Castle/Knight strategy
- 新的护甲类型迁移（如 Mortar Team Heavy parity 债务）
- 英雄 / 空军 / 物品（需用户明确授权）

## 9. 证据文件索引

| 文件 | 类型 |
| --- | --- |
| `docs/V9_HN7_LEATHER_ARMOR_SOURCE_AND_TYPE_BOUNDARY.zh-CN.md` | SRC8 来源包 |
| `tests/v9-hn7-leather-armor-source-boundary.spec.mjs` | SRC8 静态 proof |
| `docs/V9_HN7_MEDIUM_ARMOR_MIGRATION_CONTRACT.zh-CN.md` | MODEL9 迁移合同 |
| `tests/v9-hn7-medium-armor-migration-contract.spec.mjs` | MODEL9 静态 proof |
| `docs/V9_HN7_MORTAR_TEAM_ARMOR_PARITY_DECISION.zh-CN.md` | MODEL10 决策文档 |
| `tests/v9-hn7-mortar-team-armor-parity-decision.spec.mjs` | MODEL10 静态 proof |
| `tests/v9-hn7-leather-armor-data-seed.spec.mjs` | DATA8 数据 proof |
| `tests/v9-hn7-leather-armor-runtime.spec.ts` | IMPL11 runtime proof |
