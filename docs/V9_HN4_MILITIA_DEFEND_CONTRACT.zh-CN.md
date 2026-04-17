# V9 HN4 Militia / Defend 分支合同

> 生成时间：2026-04-15
> 适用范围：V9 HN4 — 第一分支合同定义
> 前置：Task 142 HN3 ability numeric model 收口已 accepted
> 重要边界：本文件只定义合同、数值边界和 proof 序列，不改运行时代码、不新增单位、不导入素材。

## 1. 目的

HN3 已完成 Priest Heal、Rally Call、Mortar AOE 的 ability numeric model 统一。HN4 按 `V9_HUMAN_NUMERIC_EXPANSION_PACKET` 候选顺序，第一分支为 Militia / Back to Work / Defend。本合同定义这三个能力的最小实现范围、数据字段、runtime 行为和 proof 序列。

## 2. 候选能力定义

### 2.1 Militia（民兵变身）

**War3 参考行为：** Town Hall / Keep / Castle 附近的 Worker 可点击"Call to Arms"按钮，临时变身为 Militia（近战军事单位），持续 45 秒后自动变回 Worker。

**目标：** 让 Worker 能临时升级为 Militia，增加攻击力和护甲，持续一段时间后自动变回。

**当前缺口：**
- 无 `militia` 单位定义
- 无 Worker → Militia 变身机制
- 无 Town Hall 范围内触发判定
- 无自动回退计时器

**最小数据字段（HN4-DATA 候选）：**

| 字段 | 候选值 | 说明 |
| --- | --- | --- |
| sourceType | `'worker'` | 只有 Worker 能变身 |
| morphTarget | `'militia'` | 变身目标单位类型 |
| duration | `45` | 持续秒数 |
| triggerRange | `townhall.size * 2` | 必须在主基地附近 |
| hp | `230` | 变身后 HP |
| attackDamage | `12` | 变身后攻击力 |
| armor | `2` | 变身后护甲 |
| armorType | `Heavy` | 变身后护甲类型 |
| attackType | `Normal` | 变身后攻击类型 |
| speed | `3.5` | 变身后速度 |

**最小 runtime 行为：**
1. 选中 Worker 时，若在 Town Hall / Keep 附近，命令卡显示"Call to Arms"按钮
2. 点击后 Worker 变身为 Militia（换属性、视觉）
3. 45 秒后自动变回 Worker（恢复原始属性）
4. 变身期间 Worker 的采集/建造命令不可用
5. 死亡时按 Worker 计算死亡效果

**Proof 序列：**
1. DATA proof：`militia` 数据种子存在于 `UNITS` 或 `ABILITIES`
2. RUNTIME proof：Worker 在主基地附近变身，属性正确
3. IDENTITY proof：45 秒后自动变回，采集功能恢复
4. COMMAND proof：命令卡正确显示/隐藏

### 2.2 Back to Work（返回工作）

**War3 参考行为：** Militia 可随时点击"Back to Work"提前变回 Worker。

**目标：** 让 Militia 能提前变回 Worker，不需要等 45 秒自然过期。

**当前缺口：**
- 依赖 Militia 变身机制存在
- 无提前回退触发

**最小数据字段：**

| 字段 | 候选值 | 说明 |
| --- | --- | --- |
| morphTarget | `'worker'` | 回退为原始单位类型 |
| triggerCondition | `'isMilitia'` | 只有 Militia 能触发 |

**最小 runtime 行为：**
1. 选中 Militia 时，命令卡显示"Back to Work"按钮
2. 点击后立即变回 Worker，恢复原始属性
3. 变回后采集/建造命令恢复可用
4. 冷却或变身计时器重置

**Proof 序列：**
1. RUNTIME proof：Militia 点击后立即变回 Worker
2. IDENTITY proof：变回后采集功能正常
3. COMMAND proof：按钮只对 Militia 显示

### 2.3 Defend（防御姿态）

**War3 参考行为：** Footman 可激活 Defend 模式，减少穿刺攻击伤害，移动速度降低。

**目标：** 让 Footman 能切换防御姿态，换取对穿刺攻击的减伤。

**当前缺口：**
- 无 Defend 激活/取消机制
- 无穿刺减伤 modifier
- 无速度降低 effect

**最小数据字段（HN4-DATA 候选）：**

| 字段 | 候选值 | 说明 |
| --- | --- | --- |
| key | `'defend'` | 能力标识 |
| ownerType | `'footman'` | 只有 Footman 能使用 |
| cost | `{}` | 无消耗 |
| cooldown | `0` | 可随时切换 |
| range | `0` | 自身效果 |
| effectType | `'pierceDamageReduction'` | 穿刺减伤 |
| effectValue | `0.5` | 受到穿刺伤害减半 |
| speedPenalty | `0.5` | 速度降至 50% |
| duration | `0` | 永久直到取消 |
| stackingRule | `'toggle'` | 切换型 |

**最小 runtime 行为：**
1. 选中 Footman 时，命令卡显示"Defend"切换按钮
2. 激活后 Footman 受到 Pierce 类型伤害减半
3. 激活后 Footman 移动速度降低
4. 再次点击取消，恢复正常
5. Defend 不影响对 Normal/Siege/Magic 攻击的减伤

**Proof 序列：**
1. DATA proof：Defend 数据种子存在于 `ABILITIES`
2. RUNTIME proof：激活后 Pierce 伤害减半，速度降低
3. IDENTITY proof：取消后恢复正常
4. COMMAND proof：按钮只对 Footman 显示，可切换

## 3. 实现顺序和约束

### 3.1 第一张可执行实现任务只能是一个最小切片

从三个候选中只能选**一个**作为第一张 HN4 实现任务。推荐优先级：

1. **Militia** — 优先级最高：直接延伸 Worker / Town Hall 现有数据，不依赖其他新系统
2. **Defend** — 优先级第二：需要 toggle buff 机制，比 Militia 复杂
3. **Back to Work** — 优先级最低：完全依赖 Militia 变身机制存在

第一张任务可以是以下之一：
- `HN4-DATA1`：Militia 数据种子（`UNITS.militia` + `ABILITIES.call_to_arms`）
- `HN4-IMPL1`：Militia 变身 runtime

**不允许第一张任务同时实现两个能力。**

### 3.2 禁区

| 禁止 | 原因 |
| --- | --- |
| 完整英雄系统 | 英雄需要完整 ability slot、level up、经验系统 |
| 商店 / 物品 | 需要完整物品栏和物品使用系统 |
| 第二阵营 | 需要独立的经济、建筑、单位树 |
| 全科技树 | 需要先完成 Castle / T3 基础设施 |
| 素材导入 | 需要走 asset approval packet |
| 完整 AI 战术重写 | AI 策略变更应在功能稳定后 |
| Sorceress / Spell Breaker | 需要本分支先证明 toggle / morph 机制可行 |
| Knight / Flying Machine | 需要先完成 Castle / T3 解锁 |

## 4. 数值边界

所有数值基于 War3 参考值，但允许在 proof 阶段微调以适配当前项目缩放：

| 能力 | 关键数值 | 参考值 | 容差 |
| --- | --- | --- | --- |
| Militia HP | 230 | War3: 230 | ±10% |
| Militia 攻击力 | 12 | War3: 12 | ±10% |
| Militia 持续时间 | 45s | War3: 45s | ±10% |
| Defend 穿刺减伤 | 50% | War3: 50% | ±10% |
| Defend 速度惩罚 | 50% | War3: ~50% | ±10% |

## 5. Proof 总表

| Proof 类型 | 覆盖范围 | 运行方式 |
| --- | --- | --- |
| 合同存在 proof | 合同文件存在、包含三个条目、候选顺序和禁区清楚 | 静态 node:test |
| 数据种子 proof | 新增数据存在于正确位置 | 静态 node:test |
| Runtime proof | 变身/切换行为正确 | Playwright runtime |
| Identity proof | 回退/恢复行为正确 | Playwright runtime |
| Command proof | 命令卡显示/隐藏正确 | Playwright runtime |
| Regression proof | 不影响已有 Worker / Footman / Town Hall / 经济循环 | Playwright runtime |

## 6. 当前进展

### 6.1 Militia 数据种子（HN4-DATA1，Task 144）

Task 144 已完成 `UNITS.militia` 和 `ABILITIES.call_to_arms` 数据种子：

| 字段 | UNITS.militia 值 | 说明 |
| --- | --- | --- |
| key | `'militia'` | 民兵单位类型 |
| hp | `230` | 参考合同 §4 |
| attackDamage | `12` | 参考合同 §4 |
| armor | `2` | 参考合同 §4 |
| attackType | `AttackType.Normal` | 近战普通攻击 |
| armorType | `ArmorType.Heavy` | 重甲 |
| canGather | `false` | 变身期间不能采集 |

| 字段 | ABILITIES.call_to_arms 值 | 说明 |
| --- | --- | --- |
| key | `'call_to_arms'` | 紧急动员能力 |
| ownerType | `'worker'` | 只有农民能触发 |
| morphTarget | `'militia'` | AbilityDef 新增字段，指向变身目标 |
| range | `BUILDINGS.townhall.size * 2` | 主基地附近触发范围，当前只落数据 |
| duration | `45` | 45 秒后自动变回 |
| effectType | `'morph'` | 变身类效果 |

`AbilityDef` 接口已扩展可选字段 `morphTarget?: string`。Task 144 只落数据种子；`Game.ts` 运行时保持不变。

Codex acceptance：Task144 已完成本地复核，`node --test tests/v9-hn4-militia-data-seed.spec.mjs tests/v9-hn4-militia-defend-contract.spec.mjs` 10/10、build、tsc、cleanup 和残留进程检查通过。

### 6.2 Militia runtime（HN4-IMPL2，Task 145）

Task 145 已完成最小 Militia runtime：

- `Unit` 接口新增 `morphExpiresAt` 和 `morphOriginalType` 字段
- `morphToMilitia(unit)` 方法读取 `ABILITIES.call_to_arms` 的 `range`、`duration`、`morphTarget` 和 `UNITS.militia` 的战斗数值
- `revertMilitia(unit)` 方法恢复 Worker 原始属性
- `updateMilitiaExpiration()` 每帧检查过期 Militia，自动恢复
- 命令卡对选中 Worker 暴露"紧急动员"按钮，要求附近有已完成的友方 `townhall` 或 `keep`
- `Game.ts` 不硬编码 45 秒、范围或目标单位

### 6.3 Back to Work runtime（HN4-IMPL3，Task 146）

Task 146 已完成 Back to Work 最小 runtime：

- `GameData.ts` 新增 `ABILITIES.back_to_work`，ownerType 为 `militia`，morphTarget 为 `worker`，effectType 为 `morph`，duration/cooldown/cost 为 0
- `Game.ts` 新增 `backToWork()` 路径，命令卡读取 `ABILITIES.back_to_work` 的 ownerType、name 和 morphTarget
- 点击"返回工作"后立即清空 morph 状态，单位 type 回 `worker`，战斗/移动/采集属性从 `UNITS.worker` 恢复
- 自动过期回 Worker 仍然有效
- 选中 Worker、Footman、Priest、Mortar、建筑时不显示"返回工作"
- 选中 Militia 时仍然不显示 Defend
- Codex acceptance：Task146 已完成本地复核，build、tsc、Back to Work + Call to Arms runtime proof 12/12、HN4 static proof 10/10、cleanup 和残留进程检查通过。

### 6.4 Defend 数据种子（HN4-DATA4，Task 147）

Task 147 已完成 Defend 最小 ability 数据种子：

| 字段 | ABILITIES.defend 值 | 说明 |
| --- | --- | --- |
| key | `'defend'` | 防御姿态能力 |
| ownerType | `'footman'` | 只属于 Footman |
| targetRule | self / alive | 只作用于自身 |
| effectType | `'toggle'` | 后续 runtime 可接 toggle |
| affectedAttackType | `AttackType.Piercing` | 只先表达穿刺减伤 |
| damageReduction | `0.5` | 50% 伤害倍率 |
| speedMultiplier | `0.5` | 50% 移速倍率 |

`AbilityDef` 接口已扩展可选字段 `affectedAttackType?: AttackType`、`damageReduction?: number`、`speedMultiplier?: number`。Task 147 只落数据种子和静态 proof；`Game.ts` 运行时保持不变。

### 6.5 Defend runtime（HN4-IMPL5，Task 148）

Task 148 已完成 Defend 最小 runtime：

- `Unit` 接口新增 `defendActive: boolean` 字段，`spawnUnit` / `spawnBuilding` 初始化为 `false`
- `setDefend(unit, active)` 方法读取 `ABILITIES.defend` 的 `ownerType`、`speedMultiplier`，开启时速度 = `baseSpeed * speedMultiplier`，关闭时恢复 `baseSpeed`
- `toggleDefend(unit)` 方法切换 `defendActive`
- 选中 Footman 时命令卡显示"防御姿态"按钮（`defend.name`），开启后按钮文案显示 `✓`；选中非 Footman 不显示
- `dealDamage()` 在目标 `defendActive` 且攻击类型为 `ABILITIES.defend.affectedAttackType` 时套用 `damageReduction`
- Normal / Siege 攻击不受影响；非 Footman 不受影响
- 命令卡缓存键新增 `defendKey` 基于 `defendActive`
- Codex acceptance：Task148 已完成复核，build、tsc、HN4 runtime proof 18/18、HN4 static proof 15/15、cleanup 和残留进程检查通过。

### 6.6 未完成条目

- Militia / Back to Work / Defend 三个能力最小 runtime 均已完成。
- 仍未完成且不属于本分支收口范围：AI 使用 Defend、Defend 动画 / 图标 / 音效、完整 War3 科技树、英雄、物品、Sorceress / Spell Breaker、Knight、空军和真实素材导入。

## 7. 结论

```text
HN4 第一分支合同定义完成。
Militia / Back to Work / Defend 三个能力已区分目标、缺口、数据字段和 proof 序列。
Militia 数据种子（UNITS.militia + ABILITIES.call_to_arms）已落盘（Task 144）。
Militia runtime（变身、过期、命令卡按钮）已完成（Task 145）。
Back to Work runtime（返回工作按钮、立即回退、命令卡约束、数据读取）已完成（Task 146）。
Defend ability 数据种子已完成（Task 147）。
Defend runtime（防御姿态按钮、toggle、穿刺减伤、速度惩罚）已完成（Task 148）。
禁止英雄、物品、第二阵营、全科技树、素材导入和完整 AI 重写。
HN4 closure inventory 已完成（Task 149）。
下一步：进入 HN5 Sorceress / Slow branch contract；不直接打开 AI、视觉增强或素材。
```
