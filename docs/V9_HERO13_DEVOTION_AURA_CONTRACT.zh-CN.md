# V9 HERO13-CONTRACT1 Paladin Devotion Aura 分支合同

> 生成时间：2026-04-16
> 前置：HERO12-CLOSE1 (Task 237) 已 accepted。Divine Shield 分支已收口。
> 范围：定义 Devotion Aura 分支的安全实现顺序和范围边界。
> 本文档 **不** 声称"完整圣骑士"、"完整英雄系统"、"完整人族"或"V9 发布"。

---

## 1. 基线引用

Devotion Aura 合同基于以下已 accepted 基线：

- **HERO9** — Paladin 死亡/复活运行时（保留 `abilityLevels`）。
- **HERO10** — Paladin XP/升级/技能点运行时。
- **HERO11** — Holy Light 学习/施放运行时。
- **HERO12** — Divine Shield 学习/自我施放/反馈运行时（已收口）。

---

## 2. 分支顺序

| 阶段 | 任务编号 | 名称 | 范围 |
|------|---------|------|------|
| SRC1 | Task 239 | Devotion Aura 来源边界 | 来源绑定数值、行为规则和映射，不修改生产代码 |
| DATA1 | Task 240 | Devotion Aura 等级数据种子 | 在 `GameData.ts` 添加 `HERO_ABILITY_LEVELS.devotion_aura`，不接入运行时 |
| IMPL1 | Task 241 | Devotion Aura 最小被动光环运行时 | 实现被动光环：友军护甲加成、范围、死亡/范围外移除 |
| IMPL2 | Task 242 | Devotion Aura 学习入口 | Paladin 命令卡学习 Devotion Aura，消费技能点并触发已存在被动 runtime |
| UX1 | Task 243 | Devotion Aura 可见反馈 | HUD 显示光环等级和护甲加成 |
| CLOSE1 | Task 244 | Devotion Aura 分支收口 | 静态盘点，不修改生产代码 |

顺序约束：SRC1 → DATA1 → IMPL1 → IMPL2 → UX1 → CLOSE1。每步前置必须 accepted 才能开始下一步。

---

## 3. Devotion Aura 能力定义（合同级别）

Devotion Aura 是 **被动光环**：

- **无** 法力消耗。
- **无** 冷却时间。
- **无** 命令卡施放按钮（自动生效）。
- 对 HERO13-SRC1 确认的附近友方目标提供 **护甲加成**。
- 光环效果在来源 Paladin 死亡或友方单位离开范围时移除。
- 护甲加成值、光环半径、受影响目标集合和叠加规则必须来自 HERO13-SRC1 来源边界，合同不硬编码。

### 3.1 合同级约束

- 护甲加成是 **临时** 的，不永久修改单位基础护甲。
- 同一来源不能被重复累计；多来源叠加规则必须等 HERO13-SRC1 确认。
- 敌方单位不受 Devotion Aura 影响。

---

## 4. 运行时证明义务（IMPL1）

IMPL1 必须证明以下行为：

| 编号 | 证明义务 |
|------|---------|
| RP-1 | 来源 Paladin 存活时，范围内友方单位获得护甲加成 |
| RP-2 | 来源 Paladin 死亡时，友方单位失去护甲加成 |
| RP-3 | 友方单位离开范围时失去护甲加成 |
| RP-4 | 友方单位进入范围时获得护甲加成 |
| RP-5 | 敌方单位不受 Devotion Aura 影响 |
| RP-6 | 护甲加成不永久修改单位基础护甲（光环移除后恢复原值） |
| RP-7 | 同一 Paladin 的 Devotion Aura 不叠加 |
| RP-8 | Holy Light 学习/施放行为不受影响 |
| RP-9 | Divine Shield 学习/施放/反馈行为不受影响 |
| RP-10 | 死亡/复活后光环状态正确恢复 |

---

## 5. 明确延后

- Resurrection（复活终极技能）
- 其他 Paladin 技能
- Archmage / Mountain King / Blood Mage
- AI 英雄策略
- 物品系统
- 商店
- Tavern
- 资产（美术资源）
- 第二种族
- 空军
- 多人联机
- 完整英雄系统
- 完整人族
- V9 发布

---

## 6. 合同声明

本文档 **仅** 定义 Devotion Aura 分支的合同、顺序和范围。

本合同 **不** 声称：
- "完整圣骑士"
- "完整英雄系统"
- "完整人族"
- "V9 发布"
- 已实现 Devotion Aura 运行时
- 已添加 `HERO_ABILITY_LEVELS.devotion_aura` 或 `ABILITIES.devotion_aura`
- 已确定护甲加成具体数值（来源边界任务确定）
