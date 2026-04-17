# V9 HN7-MODEL10 Mortar Team Armor Parity Decision

> 用途：基于 HN7-SRC8 / MODEL9 证据，明确 `mortar_team` 的 `armorType` 应保持当前 `Unarmored`、迁移 `Heavy`，还是采用项目简化迁移 `Medium`。
> 前提：HN7-MODEL9 已 accepted；`rifleman` 是唯一明确 Medium 迁移目标，`mortar_team` 被降级为需单独决策的兼容风险。
> 本文档只做来源分析和模型决策，不修改任何运行时代码。

## 0. 本决策任务边界

本任务只写决策文档和静态 proof，不修改 `src/game/GameData.ts`、`src/game/Game.ts`、`src/game/SimpleAI.ts`，不实际修改 `mortar_team.armorType`，不新增 Leather Armor 数据。

## 1. 当前事实

### 1a. GameData.ts 中 mortar_team 的数据身份

| 字段 | 当前值 | 说明 |
| --- | --- | --- |
| `key` | `mortar_team` | 攻城单位 |
| `attackType` | `AttackType.Siege` | 攻城攻击 |
| `armorType` | `ArmorType.Unarmored` | **当前无甲** |
| `armor` | `0` | 基础护甲 0 |
| `hp` | `360` | 生命值 |
| `attackDamage` | `42` | 攻击伤害 |
| `attackRange` | `6.5` | 攻击范围 |

### 1b. War3 原版 Mortar Team 护甲类型

- War3 原版 Mortar Team 的 armorType 是 **Heavy**（不是 Medium）。
- 来源：classic.battle.net/war3/human/units/mortarteam.shtml
- 这意味着在 War3 中，Mortar Team 受到 Piercing 攻击时伤害为 **1.25x**（加伤），而不是 Medium 的 0.75x（减伤）。

### 1c. Leather Armor 效果分配机制

- War3 原版 Leather Armor 的升级效果按**单位花名册**分配，不按 armorType 谓词。
- 受 Leather Armor 影响的单位：Rifleman、Mortar Team、Dragonhawk Rider、Gryphon Rider。
- 当前项目的研究效果系统使用 `targetUnitType` 列表分配，与 War3 花名册机制一致。
- **因此 mortar_team 的 armorType 决策独立于 Leather Armor 效果目标**：无论 armorType 如何选择，Leather Armor 都可以通过 `targetUnitType: 'mortar_team'` 覆盖 Mortar Team。

## 2. 三个候选选项分析

### 2a. 选项 A：保持 Unarmored（当前状态）

| 受击类型 | 当前倍率（Unarmored） | 变化 |
| --- | --- | --- |
| Normal | 1.0x | 无变化 |
| Piercing | 1.0x | 无变化 |
| Siege | 1.0x | 无变化 |
| Magic | 1.0x | 无变化 |

**对 Leather Armor 的影响**：
- Leather Armor 数据种子的 `targetUnitType` 列出 `mortar_team` 即可覆盖，不受 armorType 影响。
- Leather Armor 效果是 `armor +2/级`，与 armorType 无关。

**对 Black Gunpowder 的影响**：
- Black Gunpowder 通过 `targetUnitType: 'mortar_team'` 增加 `attackDamage +1/级`，与 armorType 无关。
- 不受影响。

**对 Plating 的影响**：
- Plating 的 `targetUnitType` 是 `footman`/`militia`/`knight`，不含 `mortar_team`。
- 不受影响。

**对未来 runtime proof 的影响**：
- 无需修改任何伤害倍率测试。
- 无需修改 `DAMAGE_MULTIPLIER_TABLE`。
- 零风险。

**优点**：零迁移成本，零回归风险，Leather Armor 可正常覆盖。
**缺点**：不匹配 War3 原版（War3 Mortar Team 是 Heavy）；damage multiplier 语义上 Unarmored 对所有攻击类型都是 1.0x，没有弱点和抗性区分。

### 2b. 选项 B：迁移到 Heavy（War3 原版）

| 受击类型 | 当前（Unarmored） | 迁移后（Heavy） | 变化 |
| --- | --- | --- | --- |
| Normal | 1.0x | 1.0x | 无变化 |
| Piercing | 1.0x | **1.25x** | 受到 Piercing 伤害增加 25% |
| Siege | 1.0x | 1.0x | 无变化 |
| Magic | 1.0x | 1.0x | 无变化 |

**对 Leather Armor 的影响**：
- Leather Armor 通过 `targetUnitType` 覆盖，与 armorType 无关。不受影响。
- 但需注意：Heavy armor 单位（footman、militia、knight）受 Plating 影响。如果 mortar_team 也变成 Heavy，实现者可能误认为它也应受 Plating。需要明确 `Plating.targetUnitType` 不含 `mortar_team`。

**对 Black Gunpowder 的影响**：
- 通过 `targetUnitType` 覆盖，与 armorType 无关。不受影响。

**对 Plating 的影响**：
- Plating effects 列表是 `footman`/`militia`/`knight`，不含 `mortar_team`。
- 如果 mortar_team 变为 Heavy，需要在未来 proof 中明确验证 Plating 不影响 mortar_team（即使 armorType 匹配）。

**对未来 runtime proof 的影响**：
- 需要新增受控伤害 proof：Piercing vs mortar_team（Heavy）= 1.25x。
- 需要新增 Plating 不影响 mortar_team 的 proof。
- `DAMAGE_MULTIPLIER_TABLE` 无需修改（已有 Heavy 列）。

**优点**：匹配 War3 原版；Piercing 对 Heavy 的 1.25x 增伤反映了 War3 的克制关系（远程单位克制重甲攻城单位）；与 footman/knight 使用同一 armorType，但 Leather Armor/Plating 按花名册区分。
**缺点**：需迁移实现任务和受控伤害 proof；需额外 proof 确保 Plating 不误影响 Heavy 的 mortar_team；Piercing 增伤可能使 Mortar Team 在当前项目中过于脆弱（360 HP + Piercing 1.25x）。

### 2c. 选项 C：迁移到 Medium（项目简化）

| 受击类型 | 当前（Unarmored） | 迁移后（Medium） | 变化 |
| --- | --- | --- | --- |
| Normal | 1.0x | 1.0x | 无变化 |
| Piercing | 1.0x | **0.75x** | 受到 Piercing 伤害减少 25% |
| Siege | 1.0x | **0.75x** | 受到 Siege 伤害减少 25% |
| Magic | 1.0x | 1.0x | 无变化 |

**对 Leather Armor 的影响**：
- 通过 `targetUnitType` 覆盖，与 armorType 无关。不受影响。

**对 Black Gunpowder 的影响**：
- 通过 `targetUnitType` 覆盖，与 armorType 无关。不受影响。

**对 Plating 的影响**：
- Plating 不影响 Medium armor 单位（只影响 Heavy 的 footman/militia/knight）。不受影响。

**对未来 runtime proof 的影响**：
- 需要新增受控伤害 proof：Piercing vs mortar_team（Medium）= 0.75x，Siege vs mortar_team（Medium）= 0.75x。
- `DAMAGE_MULTIPLIER_TABLE` 无需修改。

**优点**：与 rifleman 使用同一 armorType（如果 rifleman 也迁移到 Medium），简化项目模型；Piercing 和 Siege 减伤使 Mortar Team 更耐久。
**缺点**：**不匹配 War3 原版**——War3 Mortar Team 是 Heavy（Piercing 加伤 1.25x），不是 Medium（Piercing 减伤 0.75x）；这会使 Mortar Team 对 Piercing 攻击反而更耐打，与 War3 的克制关系完全相反；丧失了 Heavy armor 的战术弱点（远程克制重甲）。

## 3. 推荐决策

### 推荐：选项 A — 保持 Unarmored

**理由**：

1. **Leather Armor 不依赖 armorType**：Leather Armor 效果按 `targetUnitType` 分配，无论 mortar_team 是 Unarmored、Heavy 还是 Medium，Leather Armor 都可以通过 `targetUnitType: 'mortar_team'` 正确覆盖。armorType 迁移不是 Leather Armor 的前提。

2. **Heavy 迁移引入 Plating 歧义**：如果 mortar_team 变为 Heavy，未来实现者可能认为"所有 Heavy 单位受 Plating 影响"（armorType 谓词），而实际项目按 `targetUnitType` 列表分配。虽然当前数据正确，但 Heavy 语义增加了认知负担，需要额外 proof 防止回归。

3. **Medium 迁移偏离 War3 太远**：War3 Mortar Team 是 Heavy（Piercing 1.25x 加伤），Medium 会给出 Piercing 0.75x 减伤——方向完全相反。HN7-MODEL9 合同已明确指出这是"误迁移风险"。

4. **保持 Unarmored 是最安全的中间态**：当前项目 Human 战斗单位的 armorType 分布为：rifleman（即将 Medium）、footman/knight（Heavy）、mortar_team/priest/sorceress/worker/militia（Unarmored）。保持 mortar_team 为 Unarmored 不引入新的回归风险，不改变任何伤害倍率关系，不与 Plating 产生歧义。

5. **未来可按需迁移**：如果后续 War3 parity 工作需要把 Mortar Team 改为 Heavy，可以在有受控伤害 proof 和 Plating 不回归 proof 保护下进行。当前不急于做这个决策。

### 对 Leather Armor 数据种子的影响

推荐决策不阻塞 Leather Armor 数据种子任务。Leather Armor 数据种子的 `targetUnitType` 应包含 `rifleman` 和 `mortar_team`（Dragonhawk Rider 和 Gryphon Rider 未实现时不能添加）。这与 MODEL9 合同的第 4d 节一致。

## 4. 验收条件

### 4a. 本决策不修改代码

- [ ] `mortar_team.armorType` 保持 `ArmorType.Unarmored`
- [ ] `DAMAGE_MULTIPLIER_TABLE` 未修改
- [ ] `SimpleAI.ts`、`Game.ts` 未修改
- [ ] 没有 Leather Armor 数据新增

### 4b. 决策文档自洽

- [ ] 三个选项的 damage multiplier 分析正确
- [ ] 推荐决策与 MODEL9 合同不冲突
- [ ] Leather Armor 覆盖不受推荐决策阻塞

### 4c. 与 HN7-SRC8 / MODEL9 一致

- [ ] mortar_team 当前状态确认为 Unarmored（与 SRC8 一致）
- [ ] MODEL9 的"兼容风险单位"结论未被推翻
- [ ] Leather Armor 数据种子的 targetUnitType 仍可包含 mortar_team

## 5. 禁区

以下行为在本决策任务中**明确禁止**：

- 不修改 `src/game/GameData.ts`、`src/game/Game.ts`、`src/game/SimpleAI.ts`。
- 不实际修改 `mortar_team.armorType`。
- 不新增 Leather Armor 数据。
- 不新增 runtime 行为、AI、命令卡、研究队列、英雄、空军、物品、素材或完整三本战术。
- 不推翻 MODEL9 合同对 rifleman 的 Medium 迁移批准。

## 6. 下一步安全延续

本决策完成后，相邻候选：

1. **Rifleman Medium armor migration implementation** — 只改 `rifleman.armorType` 并补受控伤害 proof（Codex 泳道）。
2. **Leather Armor data seed** — 在 Rifleman 迁移和本决策完成后，落地 Leather Armor 三段数据。`targetUnitType` 为 `rifleman` 和 `mortar_team`。
3. **AI Castle/Knight strategy contract** — 如果 Leather Armor 延后。
4. **HN7/Human global closure** — 盘点 HN1-HN7 所有链路。

不能直接跳到英雄、空军、物品、素材或完整三本战术。
