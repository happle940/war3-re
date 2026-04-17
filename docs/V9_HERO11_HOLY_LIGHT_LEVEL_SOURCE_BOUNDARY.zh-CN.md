# V9 HERO11-SRC1 Holy Light 等级 / 技能学习规则来源边界

> 生成时间：2026-04-16
> 前置：HERO11-CONTRACT1 (Task 225) 已 accepted。
> 范围：Holy Light 等级 1/2/3 治疗值和基本技能学习规则的来源边界。**不** 修改生产代码。
> 本文档 **不** 声称"完整英雄系统"、"完整人族"或"V9 发布"。

---

## 1. 来源层级

| 层级 | 来源 | 角色 |
|------|------|------|
| 主来源 | Blizzard Classic Battle.net Paladin page（当前可通过 Classic Hive Workshop 镜像读取：`https://classic.hiveworkshop.com/war3/human/units/paladin.shtml`） | Holy Light 等级数值、目标规则和学习等级门槛的采纳依据 |
| 主来源 | Blizzard Classic Hero Basics（当前可通过 Classic Hive Workshop 镜像读取：`https://classic.hiveworkshop.com/war3/basics/heroes.shtml`） | 技能点、能力树、终极技能和英雄等级规则 |
| 交叉检查 | Liquipedia Warcraft Wiki — Paladin (`https://liquipedia.net/warcraft/Paladin`) | Holy Light 数值与补丁历史交叉校验 |
| 冲突样本 | 旧补丁记录、社区表格、HERO1 候选值 | 只记录差异，不直接采纳 |
| 冲突处理 | 以 Blizzard Classic / Classic 镜像主来源为准；冲突时 Codex 可显式覆盖 | — |

### 1.1 版本历史依据

来自 Liquipedia 补丁历史的交叉检查：
- **1.13 (2003-12-16)**: Holy Light mana cost reduced to 65 from 75。
- 本任务只采用它作为 mana 65 的补丁历史佐证；采纳值仍以 Classic Paladin 页面和 Hero Basics 为准。

---

## 2. Holy Light 等级数值（来源边界）

### 2.1 采纳值

| 属性 | 等级 1 | 等级 2 | 等级 3 |
|------|--------|--------|--------|
| 治疗量 (Amount Healed) | 200 | 400 | 600 |
| 对亡灵伤害 (Damage) | 100 | 200 | 300 |
| 法力消耗 (Mana Cost) | 65 | 65 | 65 |
| 冷却时间 (Cooldown) | 5s | 5s | 5s |
| 射程 (Range) | 80 War3 单位 | 80 War3 单位 | 80 War3 单位 |
| 项目射程映射 | 8.0 格 | 8.0 格 | 8.0 格 |
| 英雄等级需求 (Hero Level Req) | 1 | 3 | 5 |

### 2.2 与当前运行时的兼容性

当前项目 `ABILITIES.holy_light` 中：
- `effectValue: 200` — 与来源等级 1 治疗量一致
- `cost.mana: 65` — 与来源一致
- `cooldown: 5` — 与来源一致
- `range: 8.0` — 项目使用网格单位，来源使用 80 War3 单位；当前映射为 80 → 8.0 格

### 2.3 HERO1 候选值处理

HERO1 早期可能存在的候选值 `350/500` **不被采纳**，因为：
- Liquipedia 明确记录 Holy Light 治疗量为 200/400/600
- 该数值在 1.13 补丁后未改变
- `350/500` 无可靠来源支持

---

## 3. 技能学习规则（来源边界）

### 3.1 技能点获取

| 规则 | 来源 |
|------|------|
| 新英雄起始 1 技能点 | 已在 HERO10 中实现 |
| 每次升级获得 1 技能点 | 已在 HERO10 中实现 |

### 3.2 普通英雄能力等级

- 普通英雄能力（如 Holy Light）有 **3 个等级**。
- Classic Paladin 页面直接列出 Holy Light 的英雄等级需求：Level 1 / 3 / 5。
- 当前项目映射：Holy Light 等级 1/2/3 必须分别要求 Paladin `heroLevel >= 1 / 3 / 5`，不能在任意英雄等级提前消费技能点升到下一级。
- 未来其他普通英雄能力默认也应先查各自来源表；不能从 Holy Light 外推到所有技能。

### 3.3 终极技能解锁规则（仅记录，延后）

- 终极技能在英雄等级 6 时首次可学习。
- 终极技能只有 1 个等级，不能用额外技能点继续升级。
- **本边界不实现终极技能**，仅记录此规则供后续参考。

---

## 4. 项目映射（HERO11-DATA1 指导）

### 4.1 数据形状建议

```
HERO_ABILITY_LEVELS = {
  holy_light: {
    levels: [
      { effectValue: 200, undeadDamage: 100, mana: 65, cooldown: 5, range: 8.0, requiredHeroLevel: 1 },
      { effectValue: 400, undeadDamage: 200, mana: 65, cooldown: 5, range: 8.0, requiredHeroLevel: 3 },
      { effectValue: 600, undeadDamage: 300, mana: 65, cooldown: 5, range: 8.0, requiredHeroLevel: 5 },
    ],
    maxLevel: 3,
  },
}
```

### 4.2 约束

- Holy Light 等级数据在 DATA1/IMPL1 之前不进入运行时。
- 不修改 `GameData.ts`。
- 当前 HERO7 等级 1 运行时是兼容基线。
- HERO11-DATA1 应只新增数据形状，不直接改变当前 `ABILITIES.holy_light` 的等级 1 runtime 行为。

---

## 5. 下一任务

`HERO11-DATA1` — 将来源边界中的 Holy Light 等级数据落地到 `GameData.ts`。

本任务本身不修改生产代码，不改变当前 Holy Light 运行时行为。

---

## 6. 明确延后

| 项目 | 延后原因 |
|------|---------|
| Divine Shield（神圣护盾） | 需要独立能力实现 |
| Devotion Aura（虔诚光环） | 需要光环系统 |
| Resurrection（复活终极技能） | 需要终极技能系统 |
| Archmage / Mountain King / Blood Mage | 需要独立英雄实现 |
| AI 英雄策略 | 需要 AI 扩展 |
| 完整英雄头像面板 | 需要完整英雄 UI |
| 物品 / 背包 | 不在范围内 |
| 商店 / 酒馆 | 不在范围内 |
| 野怪 XP / 敌方英雄 XP | 不在范围内 |
| 多英雄 XP 分配 | 不在范围内 |
| 空军 / 第二种族 / 多人联机 | 不在范围内 |
| 公开发布 / 新视觉素材 | 不在范围内 |
