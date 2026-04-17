# V9 HERO9-SRC1 英雄死亡/复活源边界

> 合同编号：HERO9-SRC1
> 前置：HERO9-CONTRACT1 accepted
> 目的：确认英雄复活和死亡相关的源数据值，为后续运行时任务提供采纳值

---

## 1. 源层级

| 层级 | 来源 | 说明 |
|------|------|------|
| 主源 | War3 游戏引擎常量 `war3mapMisc.txt` | 引擎定义的公式常量，ROC 与 TFT 相同 |
| 交叉校验 | Liquipedia Hero 页面 | 独立验证的复活费用/时间表 |
| 交叉校验 | Wowpedia / Warcraft Wiki "Hero (Warcraft III)" | 英雄死亡行为描述 |
| 冲突样本 | 社区论坛帖子、旧补丁笔记 | 可能包含过时值 |

### 1.1 可复查来源链接

| 用途 | 链接 | 本文采用方式 |
|------|------|-------------|
| `war3mapMisc.txt` 常量公开摘录 | `https://www.hiveworkshop.com/threads/changing-gameplay-constants-for-roc-maps.149065/` | 采用复活费用、时间、HP、mana 相关 Gameplay Constants |
| 英雄死亡/复活行为说明 | `https://wowpedia.fandom.com/wiki/Hero_(Warcraft_III)` | 交叉校验英雄可在祭坛复活、死亡不留普通尸体、dead Heroes count 等行为 |
| Blizzard Classic 英雄基础说明 | `https://classic.battle.net/war3/basics/heroes.shtml` | 交叉校验各族祭坛可复活死亡英雄这一基础入口 |

---

## 2. 复活费用

### 2.1 源数据（引擎常量）

```
goldReviveCost = originalGoldCost × (ReviveBaseFactor + ReviveLevelFactor × (level - 1))
```

| 常量 | 值 | 说明 |
|------|---|------|
| `ReviveBaseFactor` | 0.40 | 等级 1 基础系数 |
| `ReviveLevelFactor` | 0.10 | 每级增加系数 |
| `ReviveMaxFactor` | 4.0 | 费用上限倍率 |
| `HeroMaxReviveCostGold` | 700 | 费用硬上限 |
| `ReviveBaseLumberFactor` | 0 | 无木材基础系数 |
| `ReviveLumberLevelFactor` | 0 | 无木材等级系数 |

### 2.2 Paladin（基础造价 425g）复活费用表

| 等级 | 系数 | 金币费用 |
|------|------|---------|
| 1 | 0.40 | 170 |
| 2 | 0.50 | 212 |
| 3 | 0.60 | 255 |
| 4 | 0.70 | 297 |
| 5 | 0.80 | 340 |
| 6 | 0.90 | 382 |
| 7 | 1.00 | 425 |
| 8 | 1.10 | 467 |
| 9 | 1.20 | 510 |
| 10 | 1.30 | 552 |

**木材费用：0（所有等级）**

**整数取整规则**：War3 运行时费用是整数资源。本文采用 `Math.floor` / 整数截断作为项目映射，因此 425 × 0.50 = 212.5 记录为 212。若后续 source proof 发现官方运行时使用不同取整方式，必须在 HERO9-DATA1 前修正。

### 2.3 采纳决策

| 项目 | 状态 | 采纳值 |
|------|------|--------|
| 复活费用公式 | **adopted** | `gold = baseCost × (0.40 + 0.10 × (level - 1))`，上限 700 |
| 复活木材 | **adopted** | 0 |
| 金币小数取整 | **project mapping** | `Math.floor` / 整数截断 |

---

## 3. 复活时间

### 3.1 源数据（引擎常量）

```
revivalTime = originalBuildTime × level × ReviveTimeFactor
```

| 常量 | 值 | 说明 |
|------|---|------|
| `ReviveTimeFactor` | 0.65 | 时间系数 |
| `ReviveMaxTimeFactor` | 2.0 | 时间上限倍率 |
| `HeroMaxReviveTime` | 150s | 时间硬上限 |

### 3.2 Paladin（训练时间 55s）复活时间表

| 等级 | 计算 | 时间（秒） | 上限触发 |
|------|------|-----------|---------|
| 1 | 55 × 1 × 0.65 = 35.75 | 36 | 否 |
| 2 | 55 × 2 × 0.65 = 71.5 | 72 | 否 |
| 3 | 55 × 3 × 0.65 = 107.25 | 107 | 否 |
| 4+ | 55 × 4 × 0.65 = 143 → min(143, 110) | **110** | 是（MaxTimeFactor 生效） |

注意：`ReviveMaxTimeFactor = 2.0` 意味着最大时间 = `55 × 2.0 = 110s`。

### 3.3 采纳决策

| 项目 | 状态 | 采纳值 |
|------|------|--------|
| 复活时间公式 | **adopted** | `time = trainTime × level × 0.65`，上限 `trainTime × 2.0` |

---

## 4. 复活后 HP

### 4.1 源数据

```
HeroReviveLifeFactor = 1.0
```

英雄在祭坛复活后恢复 **100% HP（满血）**。

### 4.2 采纳决策

| 项目 | 状态 | 采纳值 |
|------|------|--------|
| 复活后 HP | **adopted** | 满血（maxHp） |

理由：`HeroReviveLifeFactor = 1.0` 明确且无争议。Wowpedia、WCreplays 论坛和多个社区来源一致确认"full HP"。

---

## 5. 复活后 Mana

### 5.1 源数据

```
HeroReviveManaStart = 1
HeroReviveManaFactor = 0.0
mana = baseMana × HeroReviveManaStart + (maxMana - baseMana) × HeroReviveManaFactor
```

### 5.2 项目映射

War3 的 `baseMana` 是英雄等级 1 时的基础 mana 值（受智力属性影响）。War3 ROC 中 Paladin 等级 1 的基础 mana 为 255（等于 maxMana）。

在本项目的简化模型中：
- 没有"基础 mana"与"最大 mana"的区分（Paladin `maxMana: 255` 是固定值）
- War3 公式中 `HeroReviveManaStart = 1` 意味着恢复到基础 mana
- 由于项目 maxMana = 基础 mana = 255，复活后 mana 应为 **255**

### 5.3 采纳决策

| 项目 | 状态 | 采纳值 |
|------|------|--------|
| 复活后 mana | **project mapping** | 255（等于 maxMana） |

理由：War3 源数据 `HeroReviveManaStart = 1` 表示恢复到基础 mana。项目简化模型中基础 mana = maxMana = 255，因此映射为满 mana。若未来引入智力/等级系统需重新评估。

---

## 6. 死亡英雄行为

### 6.1 源数据

| 行为 | War3 原版 | 来源 |
|------|----------|------|
| 尸体 | **不留尸体**，播放"dissipate"动画后消失 | Wowpedia, Warcraft Wiki |
| 可见性 | 消散动画 3 秒后视觉消失（`DissipateTime = 3.0`） | 引擎常量 |
| 可选中 | 死亡英雄图标在 UI 中显示为灰色，可在祭坛选中用于复活 | Wowpedia |
| 占用人口 | **仍然占用人口**（"dead Heroes count"） | Wowpedia, Warcraft Wiki |
| 物品 | 死亡英雄保留物品（本项目无物品系统） | Wowpedia |

### 6.2 项目映射

| 行为 | 项目映射 | 理由 |
|------|---------|------|
| 视觉 | **deferred** | 项目当前使用简单几何体，无 dissipation 动画系统 |
| 死亡英雄可选中 | **deferred** | 需要设计死亡英雄的 UI 交互，超出当前范围 |
| 占用人口 | **adopted** | 死亡英雄仍占用 5 人口 |
| 停止行动/攻击 | **adopted** | 死亡英雄不再参与战斗 |
| 不留尸体 | **project mapping** | 死亡英雄保留在 units 数组中（isDead=true），但无可视表示 |

---

## 7. 唯一性合同（保留 HERO9-CONTRACT1 修正）

HERO9-CONTRACT1 要求将唯一性检查拆为两种：

### 7.1 新召唤检查

```typescript
const hasExistingHero = this.units.some(
  u => u.team === team && u.type === heroKey && !u.isBuilding,
)
```

同队伍同类型英雄记录只要存在（不论 hp 或 isDead），就阻止新召唤。

### 7.2 复活检查

```typescript
const deadHero = this.units.find(
  u => u.team === team && u.type === heroKey && !u.isBuilding && u.isDead === true,
)
```

同队伍同类型英雄记录存在且 `isDead === true`，才允许祭坛显示复活入口。

---

## 8. 采纳值汇总

| 字段 | 采纳值 | 类型 | 用于切片 |
|------|--------|------|---------|
| 复活金币公式 | `baseCost × (0.40 + 0.10 × (level - 1))` | adopted | HERO9-DATA1 |
| 复活木材 | 0 | adopted | HERO9-DATA1 |
| 复活时间公式 | `trainTime × level × 0.65`，上限 `trainTime × 2.0` | adopted | HERO9-DATA1 |
| 复活后 HP | maxHp（满血） | adopted | HERO9-IMPL2 |
| 复活后 mana | maxMana（满 mana） | project mapping | HERO9-IMPL2 |
| 死亡占用人口 | 是 | adopted | HERO9-IMPL1 |
| 死亡英雄视觉 | — | deferred | 后续视觉任务 |
| 死亡英雄可选中 | — | deferred | 后续 UI 任务 |

---

## 9. 下一步

源边界值清晰，无未解决冲突。下一步为 **HERO9-DATA1**：添加复活公式相关数据字段（如有需要）。

不建议开启 HERO9-SRC2：所有关键字段已有明确采纳值或合理的项目映射/推迟标记。
