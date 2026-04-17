# V9 HERO6-CONTRACT4 Altar runtime exposure contract

> 合同编号：HERO6-CONTRACT4
> 前置：HERO5-DATA3 accepted（holy_light data seed）
> 目的：锁定祭坛运行时暴露的分步策略，防止 generic trains 泄漏

---

## 1. 当前生产边界

### 1.1 已有数据（HERO3/4/5 完成）

| 对象 | 位置 | 状态 |
|------|------|------|
| `altar_of_kings` | `BUILDINGS` | 数据已植入，`trains: ['paladin']` |
| `paladin` | `UNITS` | 数据已植入，含 `isHero`, `heroLevel`, `heroXP`, `heroSkillPoints`, `isDead`, `maxMana: 255` |
| `holy_light` | `ABILITIES` | 数据已植入，`ownerType: 'paladin'`, `excludeSelf: true` |

### 1.2 运行时隔离状态

| 文件 | 是否引用 altar_of_kings | 是否引用 paladin | 是否引用 holy_light |
|------|------------------------|-----------------|-------------------|
| `Game.ts` | 否 | 否 | 否 |
| `SimpleAI.ts` | 否 | 否 | 否 |

### 1.3 关键隔离线

```
PEASANT_BUILD_MENU = ['farm', 'barracks', 'blacksmith', 'lumber_mill', 'tower', 'workshop', 'arcane_sanctum']
```

`altar_of_kings` **不在**农民建造菜单中。这意味着玩家当前无法建造祭坛。

---

## 2. Generic trains 泄漏风险分析

### 2.1 现有通用训练路径

Game.ts 第 5177–5199 行实现了通用训练命令卡生成：

```typescript
const buildingDef = BUILDINGS[primary.type]
if (buildingDef?.trains && primary.buildProgress >= 1) {
  for (const uKey of buildingDef.trains) {
    const uDef = UNITS[uKey]
    if (!uDef) continue
    const availability = this.getTrainAvailability(capturedUKey, 0)
    buttons.push({ ... })
  }
}
```

### 2.2 泄漏机制

若 `altar_of_kings` 被加入农民建造菜单，玩家建造祭坛后，通用 `trains` 路径会：

1. 读取 `BUILDINGS.altar_of_kings.trains = ['paladin']`
2. 查找 `UNITS.paladin`
3. 调用 `getTrainAvailability('paladin', 0)` — 此函数仅检查科技前置、资源、人口
4. 生成命令卡按钮 "圣骑士"
5. 点击后调用 `trainUnit(building, 'paladin')` — 此函数无英雄唯一性检查

### 2.3 缺失的英雄约束

通用训练路径**不包含**以下英雄必需约束：

| 约束 | 通用路径是否检查 | 后果 |
|------|----------------|------|
| 英雄唯一性（同类型只能有一个存活） | 否 | 可无限召唤圣骑士 |
| 全英雄数量上限（最多 3 个不同英雄） | 否 | 无上限 |
| 死亡英雄复活 vs 新召唤 | 否 | 死亡圣骑士会被替换而非复活 |
| 召唤时初始化 mana | 否 | `maxMana: 255` 但运行时可能不初始化 |
| `isHero` 标记的运行时语义 | 否 | 英雄死亡行为与普通单位不同 |
| 复活费用计算 | 否 | 无 reviveCost 运行时逻辑 |

### 2.4 结论

`BUILDINGS.altar_of_kings.trains = ['paladin']` 是合法的**数据声明**，表示"祭坛建筑与圣骑士英雄存在训练关系"。但此数据**不可**直接暴露给通用运行时路径。必须通过英雄专用路径接入。

---

## 3. 运行时暴露分步计划

### HERO6A：祭坛建筑暴露

**范围：** 将 `altar_of_kings` 加入农民建造菜单，使玩家可以建造祭坛建筑。

**运行时变更：**
- `PEASANT_BUILD_MENU` 添加 `'altar_of_kings'`
- 建造流程复用现有 `constructBuilding` 路径
- 祭坛建造完成后的命令卡**必须为空**（不显示训练按钮）

**安全条件：**
- 通用 `trains` 路径必须对 `altar_of_kings` 进行特殊处理：当建筑类型为祭坛时，跳过通用训练按钮生成
- 或更优方案：在通用路径中检查 `UNITS[uKey].isHero`，若为 hero 单位则跳过，由英雄专用路径处理

**不包含：**
- 不召唤圣骑士
- 不初始化英雄系统
- 不暴露 Holy Light

### HERO6B：圣骑士英雄召唤

**范围：** 通过英雄专用路径，从已完成的祭坛召唤圣骑士。

**运行时变更：**
- 祭坛命令卡新增英雄召唤按钮（非通用 trains 路径）
- 按钮逻辑必须包含：
  - 唯一性检查：同类型英雄已存活时禁用
  - 全英雄上限检查：最多 3 个不同英雄
  - 死亡英雄检测：若同类型英雄已死亡，按钮变为"复活"而非"召唤"
- 召唤时初始化英雄字段：`isHero = true`, `heroLevel = 1`, `heroXP = 0`, `heroSkillPoints = 1`, `isDead = false`
- 召唤时初始化 mana：`currentMana = maxMana`（从数据读取）

**不包含：**
- 不暴露 Holy Light 命令卡
- 不实现升级/经验系统
- 不实现复活费用扣除（复活保持免费或暂缓）

### HERO6C：圣骑士 mana 初始化

**范围：** 当圣骑士被实际召唤时，从数据初始化其 mana 池。

**运行时变更：**
- 在 `spawnUnit` 或 `trainUnit` 的英雄分支中：`unit.currentMana = UNITS[type].maxMana`
- 若 `maxMana` 不存在或为 0，不初始化 mana 字段

**不包含：**
- mana 再生逻辑（manaRegen 尚未映射）
- Holy Light 消耗 mana 的运行时

### HERO6D：Holy Light 保持关闭

**范围：** 确认 Holy Light 的命令卡和运行时在 HERO6 中**不开放**。

**约束：**
- `ABILITIES.holy_light` 数据保持不变
- Game.ts 不引用 `holy_light`
- 圣骑士命令卡不包含圣光术按钮
- Holy Light 运行时推迟到 HERO7 能力运行时任务

---

## 4. 数据到运行时的映射决策

### 4.1 trains 数据的运行时语义

| 数据字段 | 通用路径用法 | 英雄专用路径用法 |
|---------|------------|----------------|
| `trains: ['paladin']` | 必须跳过（isHero 检查） | 读取为"可召唤的英雄列表" |
| `UNITS.paladin.isHero` | 不适用 | 决定使用英雄专用路径 |
| `UNITS.paladin.maxMana` | 不适用 | 召唤时初始化 currentMana |
| `UNITS.paladin.cost` | 不适用 | 召唤/复活费用来源 |
| `ABILITIES.holy_light` | 不适用 | HERO7 处理 |

### 4.2 isHero 运行时语义（HERO6 定义）

当 `UNITS[type].isHero === true` 时：

1. 通用 `trains` 路径跳过此单位类型
2. 建筑命令卡使用英雄专用渲染
3. 召唤时执行唯一性检查
4. 死亡时设置 `isDead = true` 而非移除单位
5. 初始化 `heroLevel`, `heroXP`, `heroSkillPoints` 字段

---

## 5. 禁区

本合同**不打开**以下范围：

- 其他英雄（大法师、山丘之王、血法师）
- 英雄升级/经验/技能点消耗
- 复活费用和复活时间
- Holy Light 命令卡和施放运行时
- 圣盾术、神圣护盾等其他 Paladin 技能
- 物品/商店系统
- 空军单位
- 第二阵营
- 多人模式
- 公开发布

---

## 6. 验证清单

在 HERO6 运行时任务开始前，必须确认：

- [ ] `PEASANT_BUILD_MENU` 仍不含 `altar_of_kings`（HERO6A 开始前）
- [ ] `Game.ts` 不引用 `altar_of_kings`, `paladin`, `holy_light`（HERO6 开始前）
- [ ] 通用 `trains` 路径有 `isHero` 保护或祭坛特判
- [ ] 英雄召唤有唯一性检查
- [ ] 英雄召唤初始化 mana
- [ ] Holy Light 运行时仍关闭

---

## 7. 后续切片

| 切片 | 内容 | 前置 |
|------|------|------|
| HERO6A | 祭坛建筑暴露 | 本合同 accepted |
| HERO6B | 圣骑士英雄召唤 | HERO6A accepted |
| HERO6C | mana 初始化 | HERO6B accepted |
| HERO6D | Holy Light 保持关闭 | HERO6B accepted（验证） |
| HERO7 | Holy Light 能力运行时 | HERO6 全部 accepted |
| HERO8 | 英雄系统集成验收 | HERO7 accepted |

每个切片需要前一个 accepted 后才能开始。
