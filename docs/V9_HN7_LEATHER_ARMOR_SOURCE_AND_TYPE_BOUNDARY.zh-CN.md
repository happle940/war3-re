# V9 HN7-SRC8 Leather Armor Source and Armor-Type Boundary

> 用途：复核 War3 Human Leather Armor 三段线来源，对照当时项目护甲类型现状，判断 Leather Armor 数据种子是否可以直接进入，还是需要先做 Medium armor migration。
> 前提：HN7-AI16 已 accepted；Blacksmith 武器/火药/护甲/AWT AI 全链路已闭环。
> 后续状态：HN7-MODEL9 已批准 Rifleman 迁移到 Medium；V9-CX85 已完成该迁移。本文第 2-4 节保留为“迁移前证据”，不是当前 GameData 的最新快照。

## 1. War3 Human Leather Armor 三段线来源

来源：classic.battle.net/war3/human/buildings/blacksmith.shtml

| 等级 | 名称 | cost | researchTime | requiresBuilding | prerequisiteResearch | 效果 |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | Studded Leather Armor | 100/100 | 60s | blacksmith | — | 受影响单位护甲 +2 |
| 2 | Reinforced Leather Armor | 150/175 | 75s | keep | Studded Leather Armor | 受影响单位护甲累计 +4 |
| 3 | Dragonhide Armor | 200/250 | 90s | castle | Reinforced Leather Armor | 受影响单位护甲累计 +6 |

**War3 原版受影响单位花名册**（按单位而非 armorType 分配）：
- Rifleman
- Mortar Team
- Dragonhawk Rider（当前项目未实现）
- Gryphon Rider（当前项目未实现）

**与 Plating 的区别**：
- Plating 影响：Militia, Footman, Spell Breaker, Knight, Siege Engine, Flying Machine
- Leather Armor 影响：Rifleman, Mortar Team, Dragonhawk Rider, Gryphon Rider
- 两条线互不重叠，按单位花名册分配，不是按 armorType 谓词分配。

## 2. 迁移前项目护甲类型现状

| 单位 | armorType | armor 基础 | Leather Armor 是否应影响 |
| --- | --- | --- | --- |
| worker | Unarmored | 0 | 不影响 |
| footman | Heavy | 2 | 不影响（受 Plating） |
| rifleman | **Unarmored** | 0 | War3 原版受影响，但当前 armorType 不是 Medium |
| mortar_team | **Unarmored** | 0 | War3 原版受影响，但当前 armorType 不是 Medium |
| priest | Unarmored | 0 | 不影响 |
| militia | Unarmored | 0 | 不影响（受 Plating） |
| sorceress | Unarmored | 0 | 不影响 |
| knight | Heavy | 5 | 不影响（受 Plating） |
| tower | Medium | 0 | 建筑，不应受 Leather Armor 影响 |

**关键发现**：
1. 当前项目中 `rifleman` 和 `mortar_team` 的 `armorType` 均为 `Unarmored`，不是 `Medium`。
2. 当前项目中**没有任何玩家可操作的 Human 战斗单位**拥有 `ArmorType.Medium`。
3. 唯一使用 `ArmorType.Medium` 的是 `tower`（建筑/防御塔），不应受 Leather Armor 影响。
4. War3 原版 Leather Armor 的效果分配是按**单位花名册**而非 armorType 谓词。即使 rifleman/mortar_team 改为 Medium，效果实现仍然需要按 targetUnitType 列表分配。

**后续更新（2026-04-16）**：

- `rifleman` 已在 V9-CX85 中迁移为 `ArmorType.Medium`，并通过受控 runtime proof。
- `mortar_team` 已在 HN7-MODEL10 中决策为当前保持 `ArmorType.Unarmored`。
- 因为 Leather Armor 按 `targetUnitType` 覆盖，下一张数据种子可以只覆盖当前已实现的 `rifleman` 和 `mortar_team`。

## 3. Leather Armor 能否直接进入数据种子

**结论：不能。原因如下：**

1. **armorType 不匹配**：War3 原版中 Leather Armor 单位（Rifleman 等）的 armorType 与 Plating 单位不同。当前项目中 rifleman/mortar_team 为 Unarmored，如果 Leather Armor 数据种子的 effects 列出 `targetUnitType: 'rifleman'`，效果可以生效（因为当前项目的研究效果按 targetUnitType 分配），但这会在 armorType 语义上引入不一致——rifleman 名义上是 Unarmored，却受到 "Leather Armor" 保护。

2. **Medium armor 缺失**：War3 原版的 damage multiplier table 中，Medium armor 对 Piercing 有 0.75x 减免，对 Siege 有 0.75x 减免。当前项目 DAMAGE_MULTIPLIER_TABLE 已定义这些倍率，但没有 Human 战斗单位使用 Medium armorType。如果 Leather Armor 进入数据种子但不做 armorType 迁移，damage multiplier 的 Medium 列将无人使用，造成功能不完整。

3. **设计一致性**：当前 Plating 链的 effects 按 targetUnitType 列出 footman/militia/knight。如果 Leather Armor 按 targetUnitType 列出 rifleman/mortar_team，技术上可以工作，但会跳过 armorType 语义层。这不是错误，但不是 War3 原版的完整建模。

## 4. 边界决策

| 选项 | 是否可行 | 风险 |
| --- | --- | --- |
| A: 直接 Leather Armor 数据种子（effects 按 targetUnitType） | 技术可行 | armorType 语义不一致；damage multiplier Medium 列无人使用 |
| B: 先做 Medium armor migration 合同，再 Leather Armor 数据种子 | 推荐 | 需要额外合同和迁移任务 |
| C: 跳过 Leather Armor，先做 AI Castle/Knight 或 HN7 收口 | 可行 | Leather Armor 延后 |

**推荐路径**：如果项目要实现 Leather Armor，应先完成 Medium armor migration 合同（定义哪些单位从 Unarmored 迁移到 Medium，以及迁移对 damage multiplier 和现有研究效果的影响），然后再进入 Leather Armor 数据种子。

## 5. 下一步安全延续

推荐顺序：
1. **Leather Armor data seed** — 在 Rifleman Medium 迁移和 Mortar Team parity decision 完成后，落地 Leather Armor 三段数据。
2. **Leather Armor runtime smoke** — 证明三段研究在真实研究队列中能提升 rifleman/mortar_team 护甲。
3. 或 **AI Castle/Knight strategy contract** — 如果 Leather Armor runtime 延后。
4. 或 **HN7/Human global closure** — 盘点 HN1-HN7 所有链路。

不能直接跳到英雄、空军、物品、素材或完整三本战术。
