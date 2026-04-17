# V9 HN7 Blacksmith / Animal War Training 分支合同

> 用途：定义 V9 人族第七条分支（HN7）——Blacksmith 三段攻防升级和 Animal War Training 研究的最小实现范围、数据字段、实现顺序、proof 序列和禁区。
> 前置：HN6 Castle / Knight 已收口。
> 来源：Warcraft III 人族 melee 阵营中 Blacksmith 提供三段近战攻击、远程攻击和护甲升级；Animal War Training 提升骑士等动物单位生命值。当前项目已有 `ResearchDef`、`ResearchEffect`、`FlatDelta` 等数据驱动研究基础设施。

## 1. 为什么选这条线

1. Blacksmith 三段升级是 War3 人族核心科技路线——每一级对近战 / 远程 / 护甲的增量直接影响 Footman、Rifleman、Knight 等主力单位的战斗表现。
2. 当前项目已有完整的 `ResearchDef` / `ResearchEffect` / `FlatDelta` 数据驱动模型，Long Rifles 已证明 `applyResearchEffects` 和 `applyCompletedResearchesToUnit` 能正确消费研究效果。Blacksmith 攻防数值本身可复用 `FlatDelta`，但三段顺序仍需要新增研究间前置表达。
3. Animal War Training 是 Knight 的核心配套研究——War3 中 Knight 的实际强度很大程度依赖 Animal War Training 加成，HN6 只加了 Knight 数据但未加此研究。
4. 这条线不打开英雄、物品、空军、完整科技树或素材导入。

## 2. 当前已有基础设施

| 已有 | 说明 |
| --- | --- |
| `ResearchDef` 接口 | `key`、`name`、`cost`、`researchTime`、`description`、`requiresBuilding?`、`prerequisiteResearch?`、`effects?: ResearchEffect[]` |
| `ResearchEffect` 接口 | `type: ResearchEffectType`、`targetUnitType`、`stat: 'attackRange' \| 'attackDamage' \| 'armor' \| 'maxHp'`、`value` |
| `ResearchEffectType.FlatDelta` | 对单位属性加固定值 |
| `RESEARCHES` 记录 | 当前已有 `long_rifles` 和 `iron_forged_swords` |
| `BUILDINGS.blacksmith` | `key: 'blacksmith'`、`researches: ['long_rifles', 'iron_forged_swords']` |
| `applyResearchEffects` | 研究完成时遍历已有单位，对匹配 `targetUnitType` 的单位应用 `FlatDelta` |
| `applyCompletedResearchesToUnit` | 单位产出时回溯已完成研究，应用所有效果 |
| Blacksmith 已有 Long Rifles | 需与新增三段升级在同一建筑中共存 |
| Knight `techPrereqs: ['castle', 'blacksmith', 'lumber_mill']` | Knight 已依赖 Blacksmith，后续 Animal War Training 依赖关系需在此之上设计 |

## 3. 三条能力线归属

### 3.1 Blacksmith 近战武器升级（三段）

- War3 名称：Iron Forged Swords → Steel Forged Swords → Mithril Forged Swords
- 影响单位：`footman`、`knight`、`militia`（近战 Normal 攻击单位）
- 效果类型：`FlatDelta` → `stat: 'attackDamage'`
- 归属建筑：`blacksmith`
- 前置：每级需要上一级已完成（需 Codex 源校验 War3 是否允许跨级）
- 每级增量：需 Codex 源校验后进入 data seed；War3 参考为每级 +2 近战攻击
- 注意：Militia 是否受近战升级影响需在 data seed 阶段确认

### 3.2 Blacksmith 远程武器升级（三段）

- War3 名称：Gunpowder Upgrades → 需 Codex 源校验完整三段名称
- 影响单位：`rifleman`
- 效果类型：`FlatDelta` → `stat: 'attackDamage'`
- 归属建筑：`blacksmith`
- 前置：每级需要上一级已完成
- 每级增量：需 Codex 源校验后进入 data seed
- 注意：Mortar Team 是否受远程升级影响需在 data seed 阶段确认

### 3.3 Blacksmith 护甲升级（三段）

- War3 名称：Iron Plating → Steel Plating → Mithril Plating
- 影响单位：`footman`、`knight`、`rifleman`、`mortar_team`、`militia`（所有人族非法师战斗单位）
- 效果类型：`FlatDelta` → `stat: 'armor'`
- 归属建筑：`blacksmith`
- 前置：每级需要上一级已完成
- 每级增量：需 Codex 源校验后进入 data seed；War3 参考为每级 +2 护甲
- 注意：Priest / Sorceress 是否受护甲升级影响需在 data seed 阶段确认

### 3.4 Animal War Training

- War3 名称：Animal War Training
- 影响单位：`knight`（当前唯一动物骑乘单位）
- 效果类型：`FlatDelta` → `stat: 'maxHp'`（HN7-IMPL1 已让 `ResearchEffect.stat` 支持 `'maxHp'`，并在应用时同步提升 `maxHp` 和当前 `hp`）
- 归属建筑候选：`barracks`；进入 data seed 前必须由 Codex 源校验
- 前置候选：Castle；进入 data seed 前必须由 Codex 源校验
- 数值：需 Codex 源校验后进入 data seed；War3 参考为骑士 +150 hp
- 当前缺口：Animal War Training 数据尚未落地；归属建筑、前置和数值仍需 Codex 源校验后才能进入 data seed

## 4. 最小数据字段

### 4.1 近战升级（每级一条 `RESEARCHES` 条目）

| 字段 | 说明 |
| --- | --- |
| `key` | `'melee_upgrade_1'` / `'melee_upgrade_2'` / `'melee_upgrade_3'`（最终 key 需 Codex 确认命名约定） |
| `name` | 中文显示名，需 Codex 源校验 |
| `cost` | 每级 gold / lumber，需 Codex 源校验 |
| `researchTime` | 秒，需 Codex 源校验 |
| `description` | 描述受影响单位和效果 |
| `requiresBuilding` | `'blacksmith'` |
| `prerequisiteResearch?` | 上一级的 key（已由 HN7-IMPL2 补齐模型支持；数据种子阶段再写入具体 key） |
| `effects` | `[ { type: FlatDelta, targetUnitType: 'footman', stat: 'attackDamage', value: X }, { ... knight ... } ]` |

### 4.2 远程升级（每级一条 `RESEARCHES` 条目）

| 字段 | 说明 |
| --- | --- |
| `key` | `'ranged_upgrade_1'` / `'ranged_upgrade_2'` / `'ranged_upgrade_3'` |
| 其余同近战升级 | `targetUnitType` 改为 `'rifleman'` |

### 4.3 护甲升级（每级一条 `RESEARCHES` 条目）

| 字段 | 说明 |
| --- | --- |
| `key` | `'armor_upgrade_1'` / `'armor_upgrade_2'` / `'armor_upgrade_3'` |
| 其余同近战升级 | `stat` 改为 `'armor'`，`targetUnitType` 为所有人族非法师战斗单位 |

### 4.4 Animal War Training（一条 `RESEARCHES` 条目）

| 字段 | 说明 |
| --- | --- |
| `key` | `'animal_war_training'` |
| `name` | `'战兽训练'` |
| `cost` | 需 Codex 源校验 |
| `researchTime` | 需 Codex 源校验 |
| `description` | `'骑士生命值提升'` |
| `requiresBuilding` | 候选为 `'barracks'`，需 Codex 源校验 |
| `prerequisiteTech?` | Castle 是否需要，需 Codex 源校验 |
| `effects` | 使用 `stat: 'maxHp'`；HN7-IMPL1 已补齐模型能力，数据仍未新增 |

### 4.5 需新增的字段 / 机制

| 缺口 | 说明 |
| --- | --- |
| `ResearchEffect.stat` 扩展 | 已由 HN7-IMPL1 补齐：`'maxHp'` 可用于 Animal War Training 的生命值上限加成 |
| 研究间前置 | 已由 HN7-IMPL2 补齐：`ResearchDef.prerequisiteResearch?: string` 已落地，`getResearchAvailability` 已消费该字段 |
| `applyFlatDeltaEffect` 扩展 | 已由 HN7-IMPL1 补齐：`maxHp` 分支同时增加 `unit.maxHp` 和 `unit.hp` |

## 5. 实现顺序

### 5.1 阶段拆分

1. **HN7-IMPL1（已完成）**：`ResearchEffect.stat` 扩展 → 在 `stat` 联合类型中加入 `'maxHp'`；`applyFlatDeltaEffect` 新增 `maxHp` case 同时加 `maxHp` 和 `hp`。这是 Animal War Training 的前置。
2. **HN7-IMPL2（已完成）**：`ResearchDef` 新增 `prerequisiteResearch?: string` → 支持研究间前置表达。这是三段升级"上一级完成"的前置。
3. **HN7-DATA3（已完成）**：近战升级 Level 1 数据种子 → 新增 `RESEARCHES.iron_forged_swords` 并更新 `BUILDINGS.blacksmith.researches`。不改 runtime。
4. **HN7-SRC4（已完成）**：近战升级 Level 2 / 3 源校验 → 只核对 Steel / Mithril 的成本、时间、增量、前置顺序和受影响单位，不写数据。
5. **HN7-DATA4（已完成）**：近战升级 Level 2 / 3 数据种子 → 新增 Steel / Mithril 二、三级数据和 Blacksmith hook。
6. **HN7-IMPL5（已完成）**：近战升级 runtime → 验证 `startResearch` / `getResearchAvailability` 消费 `requiresBuilding` 与 `prerequisiteResearch`，命令卡显示升级按钮和禁用原因。已有效果应用不需改。
7. **HN7-CLOSE6（当前下一步）**：近战三段升级闭环盘点 → 盘点 SRC3/SRC4、DATA3/DATA4、IMPL4/IMPL5 的证据和禁区。
8. **HN7-DATA6**：远程升级三段数据种子 → 一次性新增 `RESEARCHES.ranged_upgrade_1` / `2` / `3`。
9. **HN7-IMPL7**：远程升级 runtime → 与近战升级共用 `prerequisiteResearch` 检查。
10. **HN7-DATA8**：护甲升级三段数据种子 → 一次性新增 `RESEARCHES.armor_upgrade_1` / `2` / `3`。
11. **HN7-IMPL9**：护甲升级 runtime → 与近战/远程共用检查。
12. **HN7-DATA10**：Animal War Training 数据种子 → 新增 `RESEARCHES.animal_war_training`。
13. **HN7-IMPL11**：Animal War Training runtime → 命令卡 + 前置检查 + 效果应用。
14. **HN7-SMOKE12**（可选）：升级后战斗 smoke → 证明升级后 Footman / Rifleman / Knight 在受控战斗中数值提升。
15. **HN7-CLOSE13**：closure inventory → 盘点 HN7 完整链路。

### 5.2 不允许第一张任务同时实现数据和 runtime

每个阶段只做一个方向：数据种子不改 runtime，runtime 不改数据结构。

### 5.3 禁区

以下内容在 HN7 中**明确禁止**：

- AI 升级研究策略（AI 主动研究 Blacksmith 升级或 Animal War Training）
- AI Knight 训练/使用策略
- 英雄系统（Paladin / Archmage / Mountain King / Blood Mage）
- Altar of Kings
- 物品系统、商店
- 空军（Gryphon / Dragonhawk / Flying Machine）
- Siege Engine
- Spell Breaker
- Invisibility / Polymorph
- 素材导入（真实第三方或官方提取）
- 完整 T3 科技树解锁（Aviary 等新建筑）
- Masonry 建筑护甲升级
- Knight / 其他单位最终外观/动画
- 伪造 War3 官方数值（不确定时写"需 Codex 源校验后进入 data seed"）

## 6. Proof 序列

### 6.1 CONTRACT proof（Task165）

- 合同存在且定义了三条能力线（近战升级、远程升级、护甲升级）和 Animal War Training
- 合同区分了已有 Long Rifles 和新增三段升级的归属
- 合同定义了最小数据字段、实现顺序、禁区
- Task165 创建合同时 `Game.ts` 和 `GameData.ts` 未被修改

### 6.2 DATA / MODEL proof（HN7-IMPL1 起）

- 每条新增 `RESEARCHES` 条目存在且字段对齐合同
- `BUILDINGS.blacksmith.researches` 包含所有新增 key
- `ResearchDef` 有 `prerequisiteResearch?` 字段（已由 HN7-IMPL2 完成）
- `ResearchEffect.stat` 包含 `'maxHp'`（已由 HN7-IMPL1 完成）

### 6.3 RUNTIME proof（后续 runtime 任务）

- 研究按钮在前置未满足时 disabled 并显示原因
- 前置满足后研究可正常执行：扣资源、等研究时间、完成时应用效果
- 已有单位在新研究完成后立即获得属性加成
- 新产出单位自动获得已完成研究的效果
- Long Rifles 行为不回退

### 6.4 IDENTITY proof

- 近战升级只影响近战 Normal 攻击单位，不影响远程单位
- 远程升级只影响远程单位
- 护甲升级影响所有指定单位类型
- Animal War Training 只影响 Knight

## 7. 需 Codex 源校验的数值

以下数值需要源校验后写入；HN7-DATA3 只能使用 `docs/V9_HN7_MELEE_UPGRADE_SOURCE_PACKET.zh-CN.md` 已收口的 Level 1 范围，不能外推到二、三级：

| 项目 | 需校验内容 |
| --- | --- |
| 近战升级 Level 1 增量 | 已由 HN7 source packet 定为 `Damage Dice Bonus 1` → 当前项目标量 `attackDamage +1` |
| 近战升级 Level 1 成本 / 时间 | 已由 HN7 source packet 定为 100 gold / 50 lumber / 60 秒 |
| 近战升级 Level 2 / 3 成本与时间 | 当前来源不一致，后续单独源校验，不在 HN7-DATA3 写入 |
| 远程升级每级增量 | War3 参考每级 +2 攻击 |
| 远程升级每级成本 | War3 三级成本递增 |
| 护甲升级每级增量 | War3 参考每级 +2 护甲 |
| 护甲升级每级成本 | War3 三级成本递增 |
| Animal War Training HP 加成 | War3 参考骑士 +150 HP |
| Animal War Training 成本 / 时间 | War3 参考值 |
| Animal War Training 归属建筑 | War3 中在 Barracks 还是 Blacksmith |
| Animal War Training 前置 | 是否需要 Castle |
| Militia 是否受近战 / 护甲升级影响 | War3 中 Militia 通常共享 Worker 升级 |
| Mortar Team 是否受远程升级影响 | War3 中 Siege 单位是否受远程升级 |
| Priest / Sorceress 是否受护甲升级影响 | War3 中法师单位是否受护甲升级 |
| 研究间前置是否允许跨级 | War3 中升级是否必须按顺序 |

## 8. 结论

```text
HN7 Human 后续升级分支合同定义完成。
Blacksmith 三段升级（近战 / 远程 / 护甲）和 Animal War Training 已区分目标、数据字段、runtime 行为、实现顺序、proof 序列和禁区。
当前项目已有 ResearchDef / ResearchEffect / FlatDelta 数据驱动模型、Long Rifles 样本和 Iron Forged Swords Level 1 数据种子。
ResearchDef 已支持 prerequisiteResearch 字段表达研究间前置。
ResearchEffect.stat 已支持 maxHp；Animal War Training 数据尚未落地。
所有 War3 精确数值标记为"需 Codex 源校验后进入 data seed"，不伪造。
Iron Forged Swords Level 1 runtime smoke 已证明研究入口、完成效果和新单位继承效果。
HN7-CLOSE5 closure inventory 已正式盘点 Level 1 链路闭环：SRC3 源校验、DATA3 数据种子、IMPL4 runtime smoke 均有证据。
HN7-CLOSE6 closure inventory 已正式盘点近战三段升级闭环：SRC3/SRC4 源校验、DATA3/DATA4 数据种子、IMPL4/IMPL5 runtime smoke 均有证据；远程、护甲、AWT、AI、英雄、空军、物品、素材确认仍未落地。
下一步：HN7-SRC5 ranged weapon source reconciliation — 先源校验远程升级数值，再进入 data seed；若远程源校验受阻，再转 HN7-SRC6 armor source reconciliation。
禁止英雄、物品、空军、完整 T3 科技树、AI 策略、素材导入和伪造官方数值。
```
