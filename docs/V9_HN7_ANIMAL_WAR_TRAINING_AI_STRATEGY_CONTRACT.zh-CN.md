# V9 HN7-AI11 Animal War Training AI 策略合同

> 用途：定义 SimpleAI 研究 Animal War Training 的最小触发条件、预算边界和失败重试边界。
> 前提：HN7-CLOSE10 已 accepted；AWT source/model/data/runtime 均有证据。
> 合同不实现代码，只约束下一张实现任务 `HN7-AI12` 的行为边界。

## 0. 当前 AI 状态

SimpleAI 当前行为：
- Town Hall → Keep 升级在 `waveCount >= 2` 后触发，保留生产储备金。
- Long Rifles 在 Blacksmith 完成后研究，保留 opening footman 储备金。
- 有 Keep 后建 Workshop / Arcane Sanctum。
- 有 Workshop 后训练最多 2 个 Mortar Team。
- 有 Arcane Sanctum 后训练最多 2 个 Priest。
- **没有** Keep → Castle 升级逻辑。
- **没有** Knight 训练或 Castle/T3 建筑逻辑。
- **没有** 任何 AWT 相关代码。
- **没有** 任何 Blacksmith 三段升级（melee/ranged/armor）研究逻辑。

## 1. AWT 研究触发条件

AI **只能**在以下**所有**条件同时满足时考虑研究 AWT：

| 条件 | 检查方式 | 理由 |
| --- | --- | --- |
| C1: 主基地是 Castle | `townhall.type === 'castle'` | AWT requiresBuildings 包含 Castle；主基地只是 Keep 时 AWT 前置不满足。 |
| C2: Barracks 完成 | `barracks.buildProgress >= 1` | AWT requiresBuilding 是 Barracks。 |
| C3: Lumber Mill 完成 | 已有 `hasLumberMill` 辅助 | AWT requiresBuildings 包含 Lumber Mill。 |
| C4: Blacksmith 完成 | 已有 `hasBlacksmith` 辅助 | AWT requiresBuildings 包含 Blacksmith。 |
| C5: AWT 未完成 | `!barracks.completedResearches.includes('animal_war_training')` | 一次性研究，不可重复。 |
| C6: Barracks 研究队列为空 | `barracks.researchQueue.length === 0` | 不叠加研究。 |
| C7: 至少有 1 个 Knight（已训练或在队列中） | `myUnits('knight').length > 0 || barracks.trainingQueue.some(i => i.type === 'knight')` | AWT 只影响 Knight，没有 Knight 时无意义。 |

**注意**：C7 是一个最小 Knight 路线守卫。它不要求 AI 主动训练 Knight（Knight 训练是独立任务），只要求 AI 在确实有 Knight 的情况下才研究 AWT。

## 2. 预算边界

AWT 成本：125 gold / 125 lumber。

AI 研究 AWT 时必须保留以下预算，**不能**为了 AWT 饿死：

| 保留项 | 保留量 | 计算方式 |
| --- | --- | --- |
| P1: 农民训练 | 1 个 worker 成本 | `UNITS.worker.cost` |
| P2: 兵营出兵 | 1 个 footman 成本 | `UNITS.footman.cost` |
| P3: Keep / Castle 升级链 | 当前无 Castle 升级 AI，保留 0 | 如果未来加 Castle 升级 AI，需在此加储备金 |
| P4: 关键前置建筑 | 当前无未建前置风险 | C1-C4 已保证所有前置完成 |

**预算检查**：
```
canAffordAWT = resources.canAfford(team, AWT_COST)
  && resources.get(team).gold >= AWT_COST.gold + workerCost.gold + footmanCost.gold
  && resources.get(team).lumber >= AWT_COST.lumber
```

lumber 不需要额外储备，因为 AWT 只需要 125 lumber，而 AI 持续伐木通常有盈余。

## 3. 一次性研究和失败重试边界

| 场景 | 处理 |
| --- | --- |
| AWT 已完成 | 不再检查，永不重试。检查：`barracks.completedResearches.includes('animal_war_training')`。 |
| AWT 正在研究 | 不重复入队列。检查：`barracks.researchQueue.length === 0`（C6）。 |
| 资源不足 | 跳过本 tick，下个 tick 重新评估。不设重试计数器。 |
| 缺建筑（C1-C4 不满足） | 跳过本 tick。不报错、不记录、不触发建造。 |
| 无 Knight（C7 不满足） | 跳过本 tick。不触发 Knight 训练。 |
| Barracks 不存在 | 整个 AWT 决策跳过（因为 AWT 在 Barracks 研究）。 |

## 4. 决策优先级

AWT 研究在 SimpleAI tick 中的优先级应低于：
- 供给（农场）
- 关键建筑（兵营、铁匠铺）
- Town Hall → Keep 升级
- 基础训练（农民、步/枪兵）
- Long Rifles 研究

AWT 研究优先级高于或等于：
- 进攻波次决策
- 高级建筑（箭塔、Workshop、Arcane Sanctum）

建议在 tick 中的位置：在 Long Rifles 研究之后、分配空闲农民之前。

## 5. 禁区

以下行为在 HN7-AI12 中**明确禁止**：

- 不实现 Keep → Castle 升级逻辑（Castle 升级是独立任务）。
- 不实现 Knight 训练逻辑（Knight 训练是独立任务）。
- 不实现 Blacksmith 三段升级研究（melee/ranged/armor 三段链是独立任务）。
- 不实现 Leather Armor 研究。
- 不实现 AI 战术编队、微操、英雄、空军、物品、素材或完整三本战术。
- 不引入新的 AI 状态机、新的 tick 阶段或新的 class 字段，除非是 AWT 最小检查所需。
- 不修改 `GameData.ts` 或 `Game.ts`。
- 不在 `SimpleAI.ts` 中硬编码 AWT 数值（应从 `RESEARCHES.animal_war_training` 读取 cost、researchTime、key）。

## 6. 实现边界

HN7-AI12 允许修改的文件：

- `src/game/SimpleAI.ts` — 添加 AWT 研究决策（约 1 个 tick 阶段）。
- 对应 runtime proof。

HN7-AI12 不修改：

- `src/game/GameData.ts`
- `src/game/Game.ts`
- 任何现有 proof 或 contract 文件。

## 7. 下一步安全延续

HN7-AI12 完成后，HN7 相邻候选：

- Leather Armor source reconciliation（如果项目需要 Medium armor 升级线）。
- AI Blacksmith 三段升级研究（melee/ranged/armor chain）。
- AI Keep → Castle 升级（如果 Knight 路线需要 AI 主动升级 Castle）。

不能直接开英雄、空军、物品、素材或完整三本战术。

## 8. 验证

本合同 proof 文件：`tests/v9-hn7-animal-war-training-ai-strategy-contract.spec.mjs`。

Proof 覆盖：
1. 合同文件存在且包含所有 7 个触发条件。
2. 合同包含预算边界。
3. 合同包含失败重试边界。
4. 合同包含禁区。
5. 合同包含实现边界。
6. 合同包含下一步安全延续。
7. SimpleAI 当前没有 AWT / Castle / Knight 代码。
8. GameData AWT 数据与合同触发条件一致。
