# V9 HERO9-CONTRACT2 祭坛复活运行时合同

> 合同编号：HERO9-CONTRACT2
> 前置：HERO9-SRC1 accepted、HERO9-IMPL1 accepted、HERO9-DATA1 accepted
> 数据源：`HERO_REVIVE_RULES`（`src/game/GameData.ts`）
> 源边界：`docs/V9_HERO9_REVIVE_SOURCE_BOUNDARY.zh-CN.md`
> 数据种子：`docs/V9_HERO9_REVIVE_DATA_SEED.zh-CN.md`
> 目的：为下一个运行时切片（HERO9-IMPL2）定义祭坛复活按钮和队列的精确行为规格

---

## 1. 当前已有运行时事实（HERO8 闭包 + HERO9-IMPL1）

| 事实 | 来源 |
|------|------|
| Paladin 可通过祭坛召唤，唯一性检查基于存在性（`hasExistingHero`，不论 hp/isDead） | HERO6B-IMPL2, HERO9-IMPL1 |
| 死亡 Paladin 保留在 `units` 数组，`isDead = true`，`hp = 0`，mesh 不可见 | HERO9-IMPL1 |
| 死亡 Paladin 阻止新召唤（disabled reason: `已阵亡（需复活）`） | HERO9-IMPL1 |
| 死亡 Paladin 不可施放圣光术、不可被攻击、不可被自动索敌 | HERO9-IMPL1 |
| 非英雄单位死亡仍正常移除（`handleDeadUnits` 原有路径） | HERO9-IMPL1 |
| `HERO_REVIVE_RULES` 已存在，包含所有复活公式常量 | HERO9-DATA1 |

---

## 2. 祭坛命令卡可用性

### 2.1 复活入口显示条件

```
已完成同队祭坛 + 同队存在 isDead === true 的 Paladin 记录 → 显示复活按钮
```

具体规则：

| 条件 | 祭坛命令卡显示 |
|------|--------------|
| 无 Paladin 记录 | 圣骑士召唤按钮（可用） |
| 有存活 Paladin（!isDead） | 圣骑士召唤按钮（disabled: 已存活） |
| 有死亡 Paladin（isDead === true） | 圣骑士召唤按钮（disabled: 已阵亡）+ **复活圣骑士按钮（可用）** |
| 有死亡 Paladin + 复活已排队 | 复活圣骑士按钮（disabled: 正在复活） |
| 有死亡 Paladin + 复活已完成 | 不存在此状态（Paladin 已恢复存活，回到第 2 行） |

### 2.2 禁止

- 没有死亡 Paladin 时不显示复活入口
- 存活 Paladin 不打开复活路径
- 复活按钮不与召唤按钮同时可用（召唤永远被存在性阻止，复活只在 isDead 时出现）

---

## 3. 费用公式

读取 `HERO_REVIVE_RULES` 常量：

### 3.1 金币

```typescript
const factor = HERO_REVIVE_RULES.goldBaseFactor
  + HERO_REVIVE_RULES.goldLevelFactor * (level - 1)
const cappedFactor = Math.min(factor, HERO_REVIVE_RULES.goldMaxFactor)
const gold = Math.min(Math.floor(baseGold * cappedFactor), HERO_REVIVE_RULES.goldHardCap)
```

- `baseGold` = `UNITS[heroKey].cost.gold`
- `level` = 英雄当前 `heroLevel`

### 3.2 木材

木材费用 = 0（`lumberBaseFactor: 0`, `lumberLevelFactor: 0`）。

### 3.3 Paladin 等级 1 示例

- 金币：`Math.floor(425 × 0.40) = 170`
- 木材：`0`

---

## 4. 时间公式与项目取整

### 4.1 复活时间

```typescript
const raw = trainTime * level * HERO_REVIVE_RULES.timeFactor
const cappedByFactor = trainTime * HERO_REVIVE_RULES.timeMaxFactor
const queueDuration = Math.round(Math.min(raw, cappedByFactor, HERO_REVIVE_RULES.timeHardCap))
```

- `trainTime` = `UNITS[heroKey].trainTime`
- `level` = 英雄当前 `heroLevel`

### 4.2 项目取整映射

运行时队列持续时间使用 `Math.round`（项目映射），与源边界表中 Paladin 示例一致：

| 等级 | raw | capped | `Math.round(capped)` | 源边界记录 |
|------|-----|--------|----------------------|-----------|
| 1 | 35.75 | 35.75 | **36** | 36 |
| 2 | 71.5 | 71.5 | **72** | 72 |
| 3 | 107.25 | 107.25 | **107** | 107 |
| 4+ | 143 | min(143, 110) = 110 | **110** | 110 |

**注意**：源边界中金币取整使用 `Math.floor`（整数截断），时间取整使用 `Math.round`（四舍五入）。这是项目映射决策，非源数据要求。

### 4.3 Paladin 等级 1 示例

- 队列持续时间：`Math.round(55 × 1 × 0.65) = Math.round(35.75) = 36` 秒

---

## 5. 队列形状

### 5.1 队列条目必须包含

```typescript
interface ReviveQueueItem {
  heroUnitId: number      // 被复活英雄在 units 数组中的引用标识
  heroType: string        // 'paladin'
  team: number            // 0
  sourceAltar: Unit       // 发起复活的祭坛建筑
  remaining: number       // 剩余时间（秒），每 tick 递减
  totalDuration: number   // 队列总时长（秒）
}
```

### 5.2 队列约束

| 约束 | 说明 |
|------|------|
| 不创建新单位 | 复活完成时修改已保留的英雄记录，不调用 spawnUnit |
| 一次性扣费 | 队列启动时扣除资源，不分期 |
| 资源不足拒绝 | 扣费前检查 `canAfford`，不足则不排队 |
| 重复排队拒绝 | 同一死亡英雄只能有一个复活队列条目 |
| 单条队列 | 每个祭坛最多一个复活队列条目（与训练队列独立） |

### 5.3 队列存储位置

复活队列可以：
- 添加到祭坛建筑的新字段（如 `reviveQueue: ReviveQueueItem[]`），或
- 使用 Game 级别的新数据结构

具体选择留给 IMPL2 实现，但必须满足上述约束。

---

## 6. 完成行为

当 `remaining` 递减至 0 时：

### 6.1 英雄状态恢复

| 字段 | 恢复值 | 依据 |
|------|--------|------|
| `isDead` | `false` | 英雄不再死亡 |
| `hp` | `maxHp × lifeFactor` = 650 × 1.0 = **650** | HERO_REVIVE_RULES.lifeFactor |
| `mana` | `maxMana` = **255** | simplifiedManaMapping |
| `mesh.visible` | `true` | 恢复可见 |
| `attackTarget` | `null` | 清空 |
| `moveTarget` | `null` | 清空 |
| `state` | `UnitState.Idle` | 闲置 |
| `healCooldownUntil` | `0` 或当前 `gameTime` | 重置技能冷却 |

### 6.2 出现位置

英雄出现在发起复活的祭坛附近（或祭坛集结点），使用现有 spawn 位置约定：
- 祭坛 mesh.position 偏移一小段距离
- 不与现有单位重叠
- 具体偏移量与现有训练完成出单位逻辑一致

### 6.3 不自动选中

英雄复活后不自动加入玩家选中，除非后续 UI 任务明确要求。

### 6.4 队列清理

- 复活完成后从队列移除该条目
- 祭坛命令卡刷新：召唤按钮变为 disabled（已存活），复活按钮消失

---

## 7. 禁止范围

本合同和后续 IMPL2 切片**不包含**：

| 项目 | 状态 |
|------|------|
| XP / 升级系统 | closed |
| 技能点分配 | closed |
| 物品/背包 | closed |
| 光环效果 | closed |
| 圣光术自动施放 | closed |
| AI 英雄策略 | closed |
| 其他三个英雄（大法师、山丘之王、血法师） | closed |
| 酒馆 | closed |
| 商店 | closed |
| 新视觉/动画 | closed |
| 新资源 | closed |
| 空军单位 | closed |
| 第二阵营 | closed |
| 多人/公开 | closed |

本合同不声称英雄系统已完成。

---

## 8. 切片顺序

| 切片 | 内容 | 状态 |
|------|------|------|
| HERO9-CONTRACT1 | 死亡/复活分支合同 | accepted |
| HERO9-SRC1 | 复活源边界 | accepted |
| HERO9-IMPL1 | 死亡状态运行时 | accepted |
| HERO9-DATA1 | 复活数据种子 | accepted |
| **HERO9-CONTRACT2** | **本合同：祭坛复活运行时合同** | **待 accepted** |
| HERO9-IMPL2 | 祭坛复活按钮 + 队列 + 完成运行时 | 下一步 |
| HERO9-CLOSE1 | HERO9 闭包 | 最后 |

每个切片必须在前一个 accepted 后才能开始。

---

## 9. 前置检查

本合同引用以下已有数据，IMPL2 实现时必须使用（不可发明新值）：

- `HERO_REVIVE_RULES`（`GameData.ts`）— 所有公式常量
- `UNITS.paladin`（`GameData.ts`）— Paladin 基础数据
- `BUILDINGS.altar_of_kings`（`GameData.ts`）— 祭坛建筑数据
- 源边界采纳值 — 不可使用 Task212 占位值（50%）
