# V9 HN7-AI14 Blacksmith Upgrade AI 策略合同

> 用途：定义 SimpleAI 研究现有 Blacksmith 三段升级链（近战武器、远程火药、护甲 Plating）的最小触发条件、优先级、预算边界和失败重试边界。
> 前提：HN7-AI13 已 accepted；AWT AI 全链路闭环。Blacksmith 三段升级数据已在 `RESEARCHES` 中落地。
> 合同不实现代码，只约束下一张实现任务 `HN7-AI15` 的行为边界。

## 0. 当前 AI 状态

SimpleAI 当前行为：
- Town Hall → Keep 升级在 `waveCount >= 2` 后触发，保留生产储备金。
- Long Rifles 在 Blacksmith 完成后研究，保留 opening footman 储备金。
- 有 Keep 后建 Workshop / Arcane Sanctum。
- 有 Workshop 后训练最多 2 个 Mortar Team。
- 有 Arcane Sanctum 后训练最多 2 个 Priest。
- 有 Castle + Barracks + Lumber Mill + Blacksmith + Knight 时研究 AWT。
- **没有** Keep → Castle 升级逻辑。
- **没有** Knight 训练或 Castle/T3 建筑逻辑。
- **没有** 任何 Blacksmith 三段升级（melee/ranged/armor）研究逻辑。
- **没有** Leather Armor 研究。

## 1. 三段升级链数据总览

### 1a. 近战武器链（Melee Weapons）

| 等级 | key | 名称 | cost | time | requiresBuilding | prerequisiteResearch | 效果 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | `iron_forged_swords` | 铁剑 | 100/50 | 60s | blacksmith | — | footman/militia/knight attackDamage +1 |
| 2 | `steel_forged_swords` | 钢剑 | 175/175 | 75s | keep | iron_forged_swords | footman/militia/knight attackDamage +1 |
| 3 | `mithril_forged_swords` | 秘银剑 | 250/300 | 90s | castle | steel_forged_swords | footman/militia/knight attackDamage +1 |

### 1b. 远程火药链（Gunpowder）

| 等级 | key | 名称 | cost | time | requiresBuilding | prerequisiteResearch | 效果 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | `black_gunpowder` | 黑火药 | 100/50 | 60s | blacksmith | — | rifleman/mortar_team attackDamage +1 |
| 2 | `refined_gunpowder` | 精炼火药 | 175/175 | 75s | keep | black_gunpowder | rifleman/mortar_team attackDamage +1 |
| 3 | `imbued_gunpowder` | 附魔火药 | 250/300 | 90s | castle | refined_gunpowder | rifleman/mortar_team attackDamage +1 |

### 1c. 护甲 Plating 链（Armor Plating）

| 等级 | key | 名称 | cost | time | requiresBuilding | prerequisiteResearch | 效果 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | `iron_plating` | 铁甲 | 125/75 | 60s | blacksmith | — | footman/militia/knight armor +2 |
| 2 | `steel_plating` | 钢甲 | 150/175 | 75s | keep | iron_plating | footman/militia/knight armor +2 |
| 3 | `mithril_plating` | 秘银甲 | 175/275 | 90s | castle | steel_plating | footman/militia/knight armor +2 |

**注意**：所有数据均来自 `RESEARCHES`，不从 `GameData.ts` 之外获取。Leather Armor 不在现有数据中，本合同不涉及。

## 2. AI 研究触发条件

每条升级链独立决策，但共享以下约束：

### 2a. 通用前置条件（所有升级链共用）

| 条件 | 检查方式 | 理由 |
| --- | --- | --- |
| GC1: Blacksmith 完成 | `hasBlacksmith` 且找到 `blacksmith` 实例 | 所有升级都在 Blacksmith 研究。 |
| GC2: 研究队列为空 | `blacksmith.researchQueue.length === 0` | 不叠加研究，一次只研究一个。 |
| GC3: 预算充足（含储备） | 见第 3 节 | 不能饿死生产和出兵。 |
| GC4: waveCount >= 1 | `this.waveCount >= 1` | 不在开局第一波前抢资源研究。 |

### 2b. 近战武器链触发条件

| 条件 | 检查方式 | 理由 |
| --- | --- | --- |
| MC1: 未完成当前等级 | `!blacksmith.completedResearches.includes(currentLevelKey)` | 不重复。 |
| MC2: 前置研究已完成（Level 2/3） | `blacksmith.completedResearches.includes(prerequisiteResearch)` | 按顺序升级。 |
| MC3: 对应主基地等级 | Level 1: 无要求; Level 2: Keep; Level 3: Castle | 数据中 `requiresBuilding` 为 keep/castle。 |
| MC4: 至少有 1 个近战单位 | `myUnits('footman').length > 0 || myUnits('knight').length > 0` | 无近战单位时研究无意义。 |

### 2c. 远程火药链触发条件

| 条件 | 检查方式 | 理由 |
| --- | --- | --- |
| RC1: 未完成当前等级 | `!blacksmith.completedResearches.includes(currentLevelKey)` | 不重复。 |
| RC2: 前置研究已完成（Level 2/3） | `blacksmith.completedResearches.includes(prerequisiteResearch)` | 按顺序升级。 |
| RC3: 对应主基地等级 | Level 1: 无要求; Level 2: Keep; Level 3: Castle | 数据中 `requiresBuilding` 为 keep/castle。 |
| RC4: Long Rifles 已完成（Level 1） | Level 1 要求 `blacksmith.completedResearches.includes('long_rifles')` | Long Rifles 是基础远程升级，应先于火药链。 |
| RC5: 至少有 1 个远程单位 | `myUnits('rifleman').length > 0 || myUnits('mortar_team').length > 0` | 无远程单位时研究无意义。 |

### 2d. 护甲 Plating 链触发条件

| 条件 | 检查方式 | 理由 |
| --- | --- | --- |
| PC1: 未完成当前等级 | `!blacksmith.completedResearches.includes(currentLevelKey)` | 不重复。 |
| PC2: 前置研究已完成（Level 2/3） | `blacksmith.completedResearches.includes(prerequisiteResearch)` | 按顺序升级。 |
| PC3: 对应主基地等级 | Level 1: 无要求; Level 2: Keep; Level 3: Castle | 数据中 `requiresBuilding` 为 keep/castle。 |
| PC4: 至少有 1 个近战单位 | `myUnits('footman').length > 0 || myUnits('knight').length > 0` | 护甲只影响近战单位。 |

## 3. 预算边界

AI 研究 Blacksmith 升级时必须保留以下预算：

| 保留项 | 保留量 | 计算方式 |
| --- | --- | --- |
| P1: 农民训练 | 1 个 worker 成本 | `UNITS.worker.cost` |
| P2: 兵营出兵 | 1 个 footman 成本 | `UNITS.footman.cost` |
| P3: 开局储备 | waveCount === 0 时不研究 | `this.waveCount >= 1` |

**预算检查**（每条链的每个等级独立检查）：
```
canAffordUpgrade = resources.canAfford(team, upgradeCost)
  && resources.get(team).gold >= upgradeCost.gold + workerCost.gold + footmanCost.gold
```

## 4. 决策优先级

Blacksmith 升级在 SimpleAI tick 中的优先级应低于：
- 供给（农场）
- 关键建筑（兵营、铁匠铺）
- Town Hall → Keep 升级
- 基础训练（农民、步/枪兵）
- Long Rifles 研究（现有逻辑，已在 tick 中）
- AWT 研究（现有逻辑，已在 tick 中）

Blacksmith 升级优先级高于或等于：
- 进攻波次决策

**链间优先级**（同一 tick 中多条链可研究时）：
1. 近战武器 Level 1（`iron_forged_swords`）— 最高优先，footman 最多
2. 护甲 Plating Level 1（`iron_plating`）— 防御提升
3. 远程火药 Level 1（`black_gunpowder`）— 远程增强
4. 近战武器 Level 2（`steel_forged_swords`）
5. 护甲 Plating Level 2（`steel_plating`）
6. 远程火药 Level 2（`refined_gunpowder`）
7. 近战武器 Level 3（`mithril_forged_swords`）
8. 护甲 Plating Level 3（`mithril_plating`）
9. 远程火药 Level 3（`imbued_gunpowder`）

**建议实现方式**：遍历一个有序的升级链配置数组，找到第一个满足条件的升级并研究，每个 tick 最多研究一个。

## 5. 一次性研究和失败重试边界

| 场景 | 处理 |
| --- | --- |
| 升级已完成 | 不再检查该等级，永不重试。 |
| 升级正在研究 | GC2 保证队列空才研究新升级，不重复入队列。 |
| 资源不足 | 跳过本 tick，下个 tick 重新评估。不设重试计数器。 |
| 前置研究未完成 | 跳过本等级，不触发前置研究（前置研究由独立的优先级逻辑处理）。 |
| 缺建筑（GC1 不满足） | 整个 Blacksmith 升级决策跳过。 |
| 无对应单位（MC4/RC5/PC4 不满足） | 跳过该链，不影响其他链。 |
| waveCount < 1 | 所有 Blacksmith 升级跳过，保留开局出兵节奏。 |
| Blacksmith 不存在 | 整个 Blacksmith 升级决策跳过（GC1）。 |

## 6. 与现有 AI 路径的交互

| 现有路径 | 交互规则 |
| --- | --- |
| Long Rifles（section 2e） | Long Rifles 保持现有逻辑不变。火药链 Level 1 增加前置条件 `long_rifles 已完成`，确保 Long Rifles 先研究。 |
| AWT（section 5d） | AWT 保持现有逻辑不变。AWT 在 Barracks 研究，Blacksmith 升级在 Blacksmith 研究，互不干扰。 |
| Town Hall → Keep 升级 | Blacksmith Level 1 不要求 Keep；Level 2 要求 Keep 已升级完成。 |
| 基础训练 | 预算保留 P1+P2 确保不被升级吃掉。 |

## 7. 禁区

以下行为在 HN7-AI15 中**明确禁止**：

- 不实现 Keep → Castle 升级逻辑（Castle 升级是独立任务）。
- 不实现 Knight 训练逻辑（Knight 训练是独立任务）。
- 不实现 Leather Armor 研究或数据。
- 不实现 AI 战术编队、微操、英雄、空军、物品、素材或完整三本战术。
- 不引入新的 AI 状态机、新的 tick 阶段或新的 class 字段，除非是最小升级研究所需。
- 不修改 `GameData.ts` 或 `Game.ts`。
- 不在 `SimpleAI.ts` 中硬编码升级数值（应从 `RESEARCHES` 读取 cost、researchTime、key、requiresBuilding、prerequisiteResearch）。
- 不在同一条链上跳级研究（必须按 Level 1 → Level 2 → Level 3 顺序）。

## 8. 实现边界

HN7-AI15 允许修改的文件：

- `src/game/SimpleAI.ts` — 添加 Blacksmith 升级研究决策（约 1 个 tick 阶段）。
- 对应 runtime proof。

HN7-AI15 不修改：

- `src/game/GameData.ts`
- `src/game/Game.ts`
- 任何现有 proof 或 contract 文件。

## 9. 下一步安全延续

HN7-AI15 完成后，HN7 相邻候选：

- Leather Armor source reconciliation（如果项目需要 Medium armor 升级线）。
- AI Keep → Castle 升级（如果 Knight 路线需要 AI 主动升级 Castle）。
- AI Knight 训练（如果 AI 需要主动产出 Knight）。

不能直接开英雄、空军、物品、素材或完整三本战术。

## 10. 验证

本合同 proof 文件：`tests/v9-hn7-blacksmith-upgrade-ai-strategy-contract.spec.mjs`。

Proof 覆盖：
1. 合同文件存在且包含三条升级链的完整数据。
2. 合同包含通用前置条件（GC1-GC4）和每条链的独立触发条件。
3. 合同包含预算边界。
4. 合同包含失败重试边界。
5. 合同包含禁区。
6. 合同包含实现边界。
7. 合同包含下一步安全延续。
8. GameData 中的升级数据与合同数据一致（cost、time、requiresBuilding、prerequisiteResearch、effects）。
9. 合同记录当前 AI 状态（没有 Blacksmith 升级逻辑）。
10. 合同不包含 Leather Armor。
