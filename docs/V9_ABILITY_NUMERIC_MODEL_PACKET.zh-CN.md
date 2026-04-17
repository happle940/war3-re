# V9 HN3 Ability Numeric Model 盘点包

> 生成时间：2026-04-15
> 适用范围：V9 HN3 / ability numeric model 边界盘点
> 前置：Task 133 T2 role combat smoke 已 accepted
> 重要边界：本文件只做模型边界盘点和映射，不改运行时代码，不新增能力，不实现完整 ability 系统。

## 1. 目的

HN2 最小闭环（Keep → Workshop / Arcane Sanctum → Mortar / Priest → AI 使用 → 数值提示 → 角色战斗）已经有完整的 proof 链。HN3 不直接加 Sorceress / Spell Breaker / 英雄 / 物品，而是先把现有三个能力/效果样本整理成可扩展的 ability numeric model 边界，为后续"迁移到数据模型"提供起始合同。

## 2. 现有能力样本盘点

### 2.1 Priest Heal（治疗）

当前实现位置：`Game.ts:1269-1289` (`castHeal`)，数据常量在 `GameData.ts:319-324`。

| 字段 | 当前值 | 来源 | 运行时读取方式 |
| --- | --- | --- | --- |
| key | `'priest_heal'`（概念性，当前无正式 key） | 隐含在 `priest.type === 'priest'` 检查 | 硬编码类型检查 |
| ownerType | `'priest'` | `UNITS.priest` | `priest.type !== 'priest'` 守卫 |
| cost.mana | `5` | `PRIEST_HEAL_MANA_COST` | `priest.mana < PRIEST_HEAL_MANA_COST` |
| cooldown | `2.0s` | `PRIEST_HEAL_COOLDOWN` | `priest.healCooldownUntil = gameTime + PRIEST_HEAL_COOLDOWN` |
| range | `4.0` 世界单位 | `PRIEST_HEAL_RANGE` | `distanceTo > PRIEST_HEAL_RANGE` |
| targetRule | `sameTeam && alive && injured && !isBuilding` | `castHeal` 内部逻辑 | 多个 if 条件组合 |
| effectType | `flatHeal` | `target.hp += PRIEST_HEAL_AMOUNT` | 直接加血，不超过 maxHp |
| effectValue | `25` | `PRIEST_HEAL_AMOUNT` | `Math.min(target.maxHp, target.hp + 25)` |
| duration | 无（瞬时效果） | N/A | 无 buff 持续时间 |
| stackingRule | 无叠加（cooldown 控制） | 单次治疗 | 冷却期间不能再次施放 |

当前缺口：
- 无正式 `ability key` 字段；用 `priest.type === 'priest'` 硬编码判断。
- 无数据驱动的 `targetRule`；用多个 if 条件硬编码。
- 无 `stackingRule` 字段；cooldown 隐式控制。
- 无 `ability level / upgrade` 支持。

### 2.2 Rally Call（集结号令）

当前实现位置：`Game.ts:1184-1207` (`triggerRallyCall`)，数据常量在 `GameData.ts:327-330`。

| 字段 | 当前值 | 来源 | 运行时读取方式 |
| --- | --- | --- | --- |
| key | `'rally_call'`（概念性，当前无正式 key） | 隐含在命令卡按钮和 `triggerRallyCall` | 按钮硬编码调用 |
| ownerType | `team === 0` 所有非建筑军事单位 | `!isBuilding && team !== 0` 检查 | `source.isBuilding \|\| source.team !== 0` 守卫 |
| cost | 无（不消耗资源/mana） | N/A | 无消耗检查 |
| cooldown | `30s` | `RALLY_CALL_COOLDOWN` | `source.rallyCallCooldownUntil = now + 30` |
| range | `6.0` 世界单位（AOE 半径） | `RALLY_CALL_RADIUS` | `dist > RALLY_CALL_RADIUS` 过滤 |
| targetRule | `sameTeam && alive && !isBuilding && inRadius` | 循环内过滤 | 多个 if 条件 |
| effectType | `flatDamageBonus` | `dealDamage` 中读取 `rallyCallBoostUntil` | `if (attacker.rallyCallBoostUntil > this.gameTime)` |
| effectValue | `+5` 伤害 | `RALLY_CALL_DAMAGE_BONUS` | `finalDamage += RALLY_CALL_DAMAGE_BONUS` |
| duration | `8s` | `RALLY_CALL_DURATION` | `u.rallyCallBoostUntil = now + 8` |
| stackingRule | 不叠加（刷新时长） | 赋值覆盖 | `= buffEnd` 不是 `+=` |

当前缺口：
- 无正式 `ability key`；按钮直接调用 `triggerRallyCall`。
- buff 挂载在 `unit.rallyCallBoostUntil` 字段上，无通用 buff 系统。
- 伤害加成在 `dealDamage` 中硬编码检查 `rallyCallBoostUntil`。
- 无数据驱动的 `targetRule` 或 `effectType`。

### 2.3 Mortar AOE（攻城溅射）

当前实现位置：`Game.ts:1480-1505` (`dealAoeSplash`)，数据常量在 `GameData.ts:284-285`。

| 字段 | 当前值 | 来源 | 运行时读取方式 |
| --- | --- | --- | --- |
| key | `'mortar_aoe'`（概念性，当前无正式 key） | 隐含在 `AttackType.Siege` 检查 | `atkType === AttackType.Siege` |
| ownerType | `attackType === Siege` 的所有单位 | `UNITS[attacker.type]?.attackType` | 在 `dealDamage` 中判断 |
| cost | 无（作为攻击的被动属性） | N/A | 不单独消耗 |
| cooldown | 无（跟随攻击冷却） | `UNITS.mortar_team.attackCooldown: 2.5` | 不单独计算 |
| range | `2.0` 世界单位（溅射半径） | `MORTAR_AOE_RADIUS` | `dist > MORTAR_AOE_RADIUS` |
| targetRule | `enemy && alive && !goldmine && !=primary && !=attacker` | `dealAoeSplash` 内部逻辑 | 多个 if 条件 |
| effectType | `aoeSplashDamage` | 线性距离衰减 | `rawDamage * falloff * typeMultiplier * (1 - reduction)` |
| effectValue | 基础伤害 `42`，衰减至 `0.5x` 边缘 | `UNITS.mortar_team.attackDamage` + `MORTAR_AOE_FALLOFF` | `falloff = 1.0 - (1.0 - 0.5) * (dist / 2.0)` |
| duration | 无（瞬时效果） | N/A | 无 buff |
| stackingRule | 不叠加（每次攻击独立计算） | 每次命中独立 | 无状态累积 |

当前缺口：
- 触发条件硬编码在 `dealDamage` 中（`AttackType.Siege`）。
- 无数据驱动的 AOE 模型；半径和衰减从常量读取，但过滤逻辑硬编码。
- 无通用 `onHit` / `onAttack` 回调系统。

## 3. 最小 Ability/Effect 数据字段定义

以下字段是 HN3 后续迁移任务应首先实现的最小集合：

```typescript
interface AbilityDef {
  key: string                    // 唯一标识（如 'priest_heal'）
  name: string                   // 显示名称
  ownerType: string | string[]   // 可使用该能力的单位/建筑类型
  cost: {
    mana?: number                // 魔力消耗
    gold?: number                // 金币消耗
    lumber?: number              // 木材消耗
  }
  cooldown: number               // 冷却时间（秒）
  range: number                  // 施法/生效距离（0=自身）
  targetRule: {
    teams: 'self' | 'ally' | 'enemy' | 'all'
    alive: boolean
    excludeTypes: string[]       // 排除的类型（如 'goldmine'）
    includeCondition?: string    // 附加条件（如 'injured' 表示 hp < maxHp）
  }
  effectType: 'flatHeal' | 'flatDamageBonus' | 'aoeSplashDamage' | string
  effectValue: number            // 效果数值
  duration: number               // 效果持续时间（0=瞬时）
  stackingRule: 'none' | 'refresh' | 'stack'  // 叠加规则
  aoeRadius?: number             // AOE 半径；非 AOE 能力不填
  aoeFalloff?: number            // AOE 边缘伤害倍率；非 AOE 能力不填
}
```

## 4. HN3 后续路线约束

### 4.1 第一步只能是迁移

HN3 后续第一张实现任务必须是：**把上述三个已有样本之一迁移到 `AbilityDef` 数据模型**，而不是开新玩法、新单位或新技能。

迁移优先级建议：
1. **Priest Heal** 最适合先迁移：已有 `key`、`cost.mana`、`cooldown`、`range`、`targetRule`、`effectType`、`effectValue` 的完整边界。
2. **Rally Call** 第二迁移：有 `duration` 和 `buff` 语义，但需要引入 buff 系统。
3. **Mortar AOE** 最后迁移：作为攻击被动属性，需要 `onHit` 回调系统。

### 4.2 禁止事项

| 禁止 | 原因 |
| --- | --- |
| 新增 Sorceress / Spell Breaker | 需要先完成 ability model 迁移 |
| 新增英雄 / 物品 / 召唤物 | 属于远期终局 |
| 新增 buff/debuff 运行时系统 | 需要先完成数据模型 |
| 实现完整 ability 系统 | 本阶段只做最小迁移 |
| 修改当前三个样本的运行时行为 | 迁移不能改变已 accepted 的 proof |

## 5. 数据种子落盘状态

### 5.1 Priest Heal（HN3-DATA2，Task 135）

Task 135 已在 `GameData.ts` 落盘最小 `AbilityDef` 类型和 `ABILITIES.priest_heal` 数据种子：

| 字段 | 值 | 对应常量 |
| --- | --- | --- |
| key | `'priest_heal'` | 新增 |
| name | `'治疗'` | 新增 |
| ownerType | `'priest'` | 对应 `priest.type` |
| cost.mana | `5` | `PRIEST_HEAL_MANA_COST` |
| cooldown | `2.0` | `PRIEST_HEAL_COOLDOWN` |
| range | `4.0` | `PRIEST_HEAL_RANGE` |
| targetRule.teams | `'ally'` | 对应 `target.team === priest.team` |
| targetRule.alive | `true` | 对应 `target.hp > 0` |
| targetRule.includeCondition | `'injured'` | 对应 `target.hp < target.maxHp` |
| effectType | `'flatHeal'` | 对应 `target.hp += amount` |
| effectValue | `25` | `PRIEST_HEAL_AMOUNT` |
| duration | `0` | 瞬时效果 |
| stackingRule | `'none'` | cooldown 控制 |

Task 135 只落数据种子；Task 136 已把 `castHeal` 和 Priest auto-heal 迁移为读取 `ABILITIES.priest_heal`，并用 focused runtime proof 证明治疗行为不变。

### 5.2 Rally Call（HN3-DATA4，Task 137）

Task 137 已在 `GameData.ts` 落盘 `ABILITIES.rally_call` 数据种子：

| 字段 | 值 | 对应常量 |
| --- | --- | --- |
| key | `'rally_call'` | 新增 |
| name | `'集结号令'` | 新增 |
| ownerType | `'player_non_building_unit'` | 对应 `!source.isBuilding && source.team === 0` |
| cost | `{}` | 无消耗 |
| cooldown | `30` | `RALLY_CALL_COOLDOWN` |
| range | `6.0` | `RALLY_CALL_RADIUS` |
| targetRule.teams | `'ally'` | 对应 `u.team === source.team` |
| targetRule.alive | `true` | 对应 `u.hp > 0` |
| targetRule.excludeTypes | `['building']` | 对应 `!u.isBuilding` |
| effectType | `'flatDamageBonus'` | 对应 `finalDamage += RALLY_CALL_DAMAGE_BONUS` |
| effectValue | `5` | `RALLY_CALL_DAMAGE_BONUS` |
| duration | `8` | `RALLY_CALL_DURATION` |
| stackingRule | `'refresh'` | 赋值覆盖 `= buffEnd` |

Task 137 只落数据种子；Task 139 已把 `triggerRallyCall` 和 Rally Call 伤害加成迁移为读取 `ABILITIES.rally_call`，并用 focused runtime proof 证明范围、持续时间、冷却和伤害加成行为不变。

### 5.3 Mortar AOE（HN3-DATA5，Task 138）

Task 138 已在 `GameData.ts` 落盘 `ABILITIES.mortar_aoe` 数据种子：

| 字段 | 值 | 对应常量 / 数据 |
| --- | --- | --- |
| key | `'mortar_aoe'` | 新增 |
| name | `'迫击炮溅射'` | 新增 |
| ownerType | `'mortar_team'` | 对应现有人族二本攻城单位 |
| cost | `{}` | 被动攻击效果，无额外消耗 |
| cooldown | `UNITS.mortar_team.attackCooldown` | 跟随迫击炮普通攻击节奏，不是主动技能冷却 |
| range | `MORTAR_AOE_RADIUS` | 溅射半径 |
| targetRule.teams | `'enemy'` | 对应 `unit.team !== attacker.team` |
| targetRule.alive | `true` | 对应 `unit.hp > 0` |
| targetRule.excludeTypes | `['building', 'primaryTarget', 'attacker']` | 数据侧表达非建筑、排除主目标和攻击者 |
| targetRule.includeCondition | `'within_aoe_radius'` | 对应 `dist <= MORTAR_AOE_RADIUS` |
| effectType | `'passiveAoeSplashFalloffDamage'` | 被动 on-hit 溅射伤害，不是主动技能 |
| effectValue | `UNITS.mortar_team.attackDamage` | 当前迫击炮基础攻击伤害 |
| duration | `0` | 瞬时伤害 |
| stackingRule | `'none'` | 每次攻击独立计算 |
| aoeRadius | `MORTAR_AOE_RADIUS` | 复用现有溅射半径 |
| aoeFalloff | `MORTAR_AOE_FALLOFF` | 复用现有边缘伤害倍率 |

Task 138 只落数据种子；Task 140 已把 `dealDamage` / `dealAoeSplash` 的 Mortar AOE 半径和边缘衰减迁移为读取 `ABILITIES.mortar_aoe`，并用 focused runtime proof 证明触发条件、过滤规则、半径边界和中心 / 边缘衰减行为不变。

### 5.4 未落盘样本

当前三个 HN3 既有样本的数据种子均已落盘，且 Priest Heal、Rally Call、Mortar AOE 的现有 runtime 读取路径均已迁移到 `ABILITIES`。后续若要继续推进，只能继续做相邻的数值模型收口或 proof 加固，不能顺手新增 Sorceress、Spell Breaker、英雄、物品或完整 buff/projectile 系统。

## 6. Proof 索引

| Proof | 证明内容 | 位置 |
| --- | --- | --- |
| `tests/v9-ability-numeric-model-inventory.spec.mjs` | 三个样本都能映射到 AbilityDef 字段；文档没有承诺新玩法 | 静态 proof，读 GameData.ts + Game.ts + 本文档 |
| `tests/v9-priest-heal-ability-data-seed.spec.mjs` | Priest Heal 数据种子存在、字段齐全、与常量一致；兼容 Task136 迁移后的 Game.ts | 静态 proof，读 GameData.ts + Game.ts |
| `tests/v9-rally-call-ability-data-seed.spec.mjs` | Rally Call 数据种子存在、字段齐全、引用现有常量；兼容 Task139 迁移后的 Game.ts | 静态 proof，读 GameData.ts + Game.ts |
| `tests/v9-rally-call-runtime-data-read.spec.ts` | Rally Call runtime 读取 `ABILITIES.rally_call`，且范围、持续时间、冷却和伤害加成行为不变 | focused runtime proof |
| `tests/v9-mortar-aoe-ability-data-seed.spec.mjs` | Mortar AOE 数据种子存在、字段齐全、引用现有 AOE 常量；兼容 Task140 迁移后的 Game.ts | 静态 proof，读 GameData.ts + Game.ts |
| `tests/v9-mortar-aoe-runtime-data-read.spec.ts` | Mortar AOE runtime 读取 `ABILITIES.mortar_aoe`，且触发、过滤、半径和衰减行为不变 | focused runtime proof |
| `tests/v9-ability-command-card-data-read.spec.ts` | Rally Call / Priest Heal 命令卡和可见提示读取 `ABILITIES`，手动 Heal 仍按 ability range 选择目标 | focused runtime proof |

## 7. 结论

```text
HN3 ability numeric model 盘点完成。
三个现有样本（Priest Heal、Rally Call、Mortar AOE）的字段边界已映射到 AbilityDef 数据模型。
Priest Heal、Rally Call 和 Mortar AOE 数据种子已落盘到 GameData.ts。
Priest Heal runtime 已迁移为读取 ABILITIES.priest_heal（Task 136）。
Rally Call runtime 已迁移为读取 ABILITIES.rally_call（Task 139）。
Task 140 已把 Mortar AOE runtime 迁移为读取 `ABILITIES.mortar_aoe`，行为不变。
Task 141 已把 Rally Call / Priest Heal 命令卡和可见提示迁移为读取 `ABILITIES`，行为不变。
```

## 8. HN3-CLOSE9 收口盘点（Task 142）

### 8.1 三个样本统一状态

| 样本 | 数据种子 | Runtime data-read | Command-card data-read | 验证 proof |
| --- | --- | --- | --- | --- |
| Priest Heal | `ABILITIES.priest_heal`（Task 135） | `castHeal` + auto-heal 读 ABILITIES（Task 136） | 命令卡 mana / 回复量 / range（Task 141） | `v9-priest-heal-runtime-data-read.spec.ts` |
| Rally Call | `ABILITIES.rally_call`（Task 137） | `triggerRallyCall` + `dealDamage` 读 ABILITIES（Task 139） | 命令卡伤害+持续时间 / 状态提示（Task 141） | `v9-rally-call-runtime-data-read.spec.ts` |
| Mortar AOE | `ABILITIES.mortar_aoe`（Task 138） | `dealAoeSplash` 读 ABILITIES（Task 140） | 无命令卡（被动效果） | `v9-mortar-aoe-runtime-data-read.spec.ts` |

### 8.2 旧常量迁移完成确认

`Game.ts` 不再包含 `RALLY_CALL_*`、`PRIEST_HEAL_*`、`MORTAR_AOE_*` 作为 runtime 或 UI 读取源。这些常量仍在 `GameData.ts` 中定义，仅供数据种子 `ABILITIES` 引用和测试文件使用。

### 8.3 收口边界确认

HN3 收口只覆盖 ability numeric model 子阶段。下一步必须从 V9-HN4 相邻 Human/numeric program 进入（如 Militia / Defend、Sorceress + Slow、Knight），不允许无边界扩张到完整英雄系统、第二阵营、多人或公开发布。

### 8.4 收口 proof

`tests/v9-ability-data-read-closure.spec.mjs` 静态验证：
1. 三个 ABILITIES 种子存在于 `GameData.ts`
2. `Game.ts` runtime / UI 路径读取 `ABILITIES`
3. `Game.ts` 不再引用旧 ability 常量
4. HN3 文档明确限制下一步方向
