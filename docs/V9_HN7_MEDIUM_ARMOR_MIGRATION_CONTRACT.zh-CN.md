# V9 HN7-MODEL9 Medium Armor Migration Contract

> 用途：定义 `rifleman` 从 `ArmorType.Unarmored` 迁移到 `ArmorType.Medium` 的范围、行为变更、验收条件和禁区，同时把 `mortar_team` 从“可直接迁移”降级为需要单独决策的兼容风险。
> 前提：HN7-SRC8 已 accepted；确认当前项目没有 Human Medium armor 战斗单位，Leather Armor 不能直接进入。
> 合同不修改代码，只约束下一张迁移实现任务的行为边界。
> 后续状态：V9-CX85 已按本合同只迁移 `rifleman`，`mortar_team` 保持 `Unarmored`；HN7-MODEL10 已接受该 Mortar Team 决策。

## 0. 本合同任务边界

本任务只写合同和静态 proof，不修改 `src/game/GameData.ts`、`src/game/Game.ts`、`src/game/SimpleAI.ts`，不把任何单位实际改成 `ArmorType.Medium`，不新增 `RESEARCHES.studded_leather_armor` 等 Leather Armor 数据。未来实现任务是否修改 `GameData.ts`，必须以本合同第 4 节和第 6 节为准。

## 1. 迁移候选范围

### 1a. 迁移单位（本次明确目标）

| 单位 | 当前 armorType | 迁移后 armorType | 理由 |
| --- | --- | --- | --- |
| rifleman | Unarmored | Medium | War3 原版 Rifleman 为 Medium；受 Leather Armor 升级影响 |

### 1b. 兼容风险单位（本次不允许直接盲迁移）

| 单位 | 当前 armorType | 本合同结论 | 理由 |
| --- | --- | --- | --- |
| mortar_team | Unarmored | 不能直接当作无争议 Medium 迁移 | War3 原版 Mortar Team 受 Leather Armor 影响，但其 armorType 不是 Medium；Leather Armor 的升级效果按单位花名册分配，不按 armorType 谓词。 |

**决策**：下一张实现任务默认只迁移 `rifleman`。`mortar_team` 是否改 armorType 需要单独的 parity decision：可以选择保持当前 armorType 并在 Leather Armor 数据里按 `targetUnitType` 覆盖，也可以另开任务把 Mortar Team 迁移到更接近 War3 的护甲类型。不能在没有额外证明的情况下把 Mortar Team 直接改成 Medium。

### 1c. 不迁移单位（明确排除）

| 单位 | 当前 armorType | 不迁移理由 |
| --- | --- | --- |
| worker | Unarmored | 民兵/农民保持 Unarmored |
| militia | Unarmored | 临时民兵保持 Unarmored |
| footman | Heavy | 受 Plating 影响，不应受 Leather Armor 影响 |
| knight | Heavy | 受 Plating 影响，不应受 Leather Armor 影响 |
| priest | Unarmored | 法师单位保持 Unarmored |
| sorceress | Unarmored | 法师单位保持 Unarmored |
| tower | Medium | 建筑/防御塔，已有 Medium，但不应受 Leather Armor 影响 |

## 2. Damage Multiplier 变更分析

### 2a. 当前 DAMAGE_MULTIPLIER_TABLE

已存在的倍率（无需修改表本身）：

| 攻击类型 | vs Medium | vs Heavy | vs Unarmored |
| --- | --- | --- | --- |
| Normal | 1.0 | 1.0 | 1.0 |
| Piercing | **0.75** | 1.25 | 1.0 |
| Siege | **0.75** | 1.0 | 1.0 |
| Magic | 1.0 | 1.0 | 1.0 |

### 2b. rifleman 迁移后的受击变化

| 攻击来源类型 | 当前（Unarmored） | 迁移后（Medium） | 变化 |
| --- | --- | --- | --- |
| Normal | 1.0x | 1.0x | 无变化 |
| Piercing | 1.0x | **0.75x** | 受到 Piercing 伤害减少 25% |
| Siege | 1.0x | **0.75x** | 受到 Siege 伤害减少 25% |
| Magic | 1.0x | 1.0x | 无变化 |

**关键影响**：
- rifleman 受到 Piercing 攻击时伤害从 100% 降至 75%。敌方 rifleman 对我方 rifleman 的伤害降低。
- rifleman 受到 Siege 攻击时伤害从 100% 降至 75%。敌方 mortar_team 对我方 rifleman 的伤害降低。
- 这与 War3 原版一致：Medium armor 对 Piercing 和 Siege 有减免。

### 2c. mortar_team 如果被误迁移到 Medium 的风险

| 攻击来源类型 | 当前（Unarmored） | 迁移后（Medium） | 变化 |
| --- | --- | --- | --- |
| Normal | 1.0x | 1.0x | 无变化 |
| Piercing | 1.0x | **0.75x** | 受到 Piercing 伤害减少 25% |
| Siege | 1.0x | **0.75x** | 受到 Siege 伤害减少 25% |
| Magic | 1.0x | 1.0x | 无变化 |

**结论**：本合同不批准 Mortar Team 直接迁移到 Medium。上表只说明误迁移会造成的行为变化，提醒实现任务不要把 Leather Armor 的目标名单和 armorType 迁移混为一谈。

## 3. 现有研究兼容性

迁移 armorType 不影响以下现有研究效果，因为效果按 targetUnitType 分配而非 armorType：

| 研究 | targetUnitType | 受 armorType 迁移影响？ |
| --- | --- | --- |
| Long Rifles | rifleman | 不受影响（stat: attackRange） |
| Black Gunpowder | rifleman, mortar_team | 不受影响（stat: attackDamage） |
| Iron/Steel/Mithril Plating | footman, militia, knight | 不受影响（不涉及 rifleman/mortar_team） |
| Iron/Steel/Mithril Forged Swords | footman, militia, knight | 不受影响 |
| Animal War Training | knight | 不受影响 |

**结论**：armorType 迁移只改变受击倍率，不改变任何现有研究效果的目标分配。

## 4. 验收条件（实现任务必须满足）

### 4a. 数据迁移

- [ ] `UNITS.rifleman.armorType` 从 `ArmorType.Unarmored` 改为 `ArmorType.Medium`
- [ ] `UNITS.mortar_team.armorType` 默认不改；如果未来要改，必须另有 parity decision 和 runtime proof
- [ ] 其他单位 armorType 不变
- [ ] `DAMAGE_MULTIPLIER_TABLE` 本身不修改（已有 Medium 列）

### 4b. 受控伤害 proof

- [ ] rifleman（Medium）受到 Piercing 攻击时，伤害为 0.75x（不是 1.0x）
- [ ] rifleman（Medium）受到 Normal 攻击时，伤害为 1.0x（不变）
- [ ] footman（Heavy）受到 Piercing 攻击时，伤害仍为 1.25x（不回退）

### 4c. 现有研究不回退

- [ ] Long Rifles 仍给 rifleman +1.5 攻击范围
- [ ] Black Gunpowder 仍给 rifleman/mortar_team +1 攻击伤害
- [ ] Plating 不影响 rifleman/mortar_team

### 4d. Leather Armor 数据种子入口

- [ ] armorType 迁移完成后，Leather Armor 数据种子任务才允许派发
- [ ] Leather Armor 数据种子的 targetUnitType 在当前项目中只能是 `rifleman` 和 `mortar_team`，但这不等于两者都必须是 Medium
- [ ] Dragonhawk Rider 和 Gryphon Rider 未实现时不能添加到 Leather Armor targetUnitType

## 5. 禁区

以下行为在迁移实现任务中**明确禁止**：

- 不修改 `DAMAGE_MULTIPLIER_TABLE` 的任何值。
- 不把 footman、knight、militia 改为 Medium。
- 不把 worker、priest、sorceress 改为 Medium。
- 不把 tower 从 Medium 改为其他类型。
- 不新增 `studded_leather_armor` 等 Leather Armor 数据。
- 不修改 `SimpleAI.ts` 或 `Game.ts`。
- 不新增 AI 行为、命令卡或研究队列。
- 不新增英雄、空军、物品、素材或完整三本战术。

## 6. 实现边界

迁移实现任务允许修改的文件：

- `src/game/GameData.ts` — 默认只修改 `UNITS.rifleman.armorType`
- 对应 runtime proof

迁移实现任务不修改：

- `src/game/SimpleAI.ts`
- `src/game/Game.ts`
- 任何现有 proof 或 contract 文件
- `DAMAGE_MULTIPLIER_TABLE`

## 7. 下一步安全延续

迁移实现任务完成后，相邻候选：

1. **Rifleman Medium armor migration implementation** — 只改 `rifleman` 并补受控伤害 proof。
2. **Mortar Team armor parity decision** — 如需处理 Mortar Team armorType，先决定保持当前、迁移 Heavy，还是采用本项目 Medium 简化。
3. **Leather Armor data seed** — 在 Rifleman 迁移和 Mortar Team 决策后，落地 Leather Armor 三段数据。
4. **AI Castle/Knight strategy contract** — 如果 Leather Armor 延后。
5. **HN7/Human global closure** — 盘点 HN1-HN7 所有链路。

不能直接跳到英雄、空军、物品、素材或完整三本战术。
