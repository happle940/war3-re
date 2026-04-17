# V9 HERO9-DATA1 英雄复活数据种子

> 合同编号：HERO9-DATA1
> 前置：HERO9-SRC1 accepted、HERO9-IMPL1 accepted
> 源边界：`docs/V9_HERO9_REVIVE_SOURCE_BOUNDARY.zh-CN.md`
> 目的：将源边界采纳值注册为运行时可引用的 `HERO_REVIVE_RULES` 常量

---

## 1. 数据对象

`src/game/GameData.ts` 导出 `HERO_REVIVE_RULES`，包含以下字段：

| 字段 | 值 | 类型 | 源边界依据 |
|------|---|------|-----------|
| `goldBaseFactor` | `0.40` | adopted | ReviveBaseFactor |
| `goldLevelFactor` | `0.10` | adopted | ReviveLevelFactor |
| `goldMaxFactor` | `4.0` | adopted | ReviveMaxFactor |
| `goldHardCap` | `700` | adopted | HeroMaxReviveCostGold |
| `lumberBaseFactor` | `0` | adopted | ReviveBaseLumberFactor |
| `lumberLevelFactor` | `0` | adopted | ReviveLumberLevelFactor |
| `timeFactor` | `0.65` | adopted | ReviveTimeFactor |
| `timeMaxFactor` | `2.0` | adopted | ReviveMaxTimeFactor |
| `timeHardCap` | `150` | adopted | HeroMaxReviveTime |
| `lifeFactor` | `1.0` | adopted | HeroReviveLifeFactor |
| `manaStartFactor` | `1` | adopted | HeroReviveManaStart |
| `manaBonusFactor` | `0` | adopted | HeroReviveManaFactor |
| `rounding` | `'floor'` | project mapping | 整数截断 |
| `simplifiedManaMapping` | `'maxMana'` | project mapping | 简化模型无基础/最大区分 |

---

## 2. Paladin 示例计算

Paladin 基础数据来自 `UNITS.paladin`：
- `cost.gold` = 425
- `trainTime` = 55
- `maxMana` = 255

### 2.1 复活金币

```
gold = floor(cost.gold × (goldBaseFactor + goldLevelFactor × (level - 1)))
```

| 等级 | 系数 | 计算 | 金币 |
|------|------|------|------|
| 1 | 0.40 | floor(425 × 0.40) | **170** |
| 2 | 0.50 | floor(425 × 0.50) = floor(212.5) | **212** |
| 10 | 1.30 | floor(425 × 1.30) = floor(552.5) | **552** |

### 2.2 复活时间

```
time = min(trainTime × level × timeFactor, trainTime × timeMaxFactor)
```

| 等级 | 计算 | 时间 |
|------|------|------|
| 1 | 55 × 1 × 0.65 = 35.75 | 36 |
| 4+ | min(55 × 4 × 0.65, 55 × 2.0) = min(143, 110) | **110** |

Paladin 最大复活时间 = `trainTime × timeMaxFactor` = 55 × 2.0 = **110 秒**。

### 2.3 复活后 HP/Mana

- HP: `maxHp × lifeFactor` = 650 × 1.0 = 650（满血）
- Mana: 按 `simplifiedManaMapping` = `maxMana` = 255

---

## 3. 运行时引用约定

后续 IMPL2 切片使用公式：

```typescript
import { HERO_REVIVE_RULES, UNITS } from './GameData'

function reviveGoldCost(heroKey: string, level: number): number {
  const base = UNITS[heroKey].cost.gold
  const factor = HERO_REVIVE_RULES.goldBaseFactor
    + HERO_REVIVE_RULES.goldLevelFactor * (level - 1)
  const raw = base * Math.min(factor, HERO_REVIVE_RULES.goldMaxFactor)
  return Math.min(Math.floor(raw), HERO_REVIVE_RULES.goldHardCap)
}

function reviveTime(heroKey: string, level: number): number {
  const trainTime = UNITS[heroKey].trainTime
  const raw = trainTime * level * HERO_REVIVE_RULES.timeFactor
  const capped = trainTime * HERO_REVIVE_RULES.timeMaxFactor
  return Math.min(raw, capped, HERO_REVIVE_RULES.timeHardCap)
}
```

---

## 4. 未包含

本数据种子不包含：
- 复活按钮 UI
- 复活队列/计时器
- 费用扣除逻辑
- 复活动画/视觉
- AI 复活决策
- 其他英雄数据

---

## 5. 下一步

HERO9-IMPL2：祭坛复活运行时实现。
