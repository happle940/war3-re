# V9 HN5 Sorceress / Slow 分支合同

> 生成时间：2026-04-16
> 适用范围：V9 HN5 — 第二分支合同定义
> 前置：Task 149 HN4 收口盘点已 accepted
> 重要边界：本文件只定义合同、数值边界和 proof 序列，不改运行时代码、不新增单位数据、不导入素材。

## 1. 为什么是 Sorceress / Slow

HN4 已完成 Militia / Back to Work / Defend 第一分支闭环。按 `V9_HUMAN_NUMERIC_EXPANSION_PACKET` 候选顺序，下一条分支应满足：

1. 复用已存在的 `ABILITIES` 数据模型（HN3 已统一 Priest Heal / Rally Call / Mortar AOE）
2. 复用已存在的 Arcane Sanctum 建筑（已有 `trains: ['priest']`、`techPrereq: 'keep'`）
3. 复用已存在的 mana / cooldown / range / targetRule runtime 基础设施
4. 不需要新系统（toggle 已在 Defend 证明，morph 已在 Militia 证明）

Sorceress / Slow 满足以上条件，并且是 War3 Human 的核心辅助法师。Spell Breaker、英雄、物品、Knight、Castle、完整 buff/debuff 系统仍后置。

## 2. 候选定义

### 2.1 Sorceress（女巫）

**War3 参考行为：** Arcane Sanctum 训练的法师单位，拥有 Slow 能力，可手动或自动施放。

**目标：** 在 Arcane Sanctum 增加可训练的 Sorceress 单位，拥有 Slow debuff 能力。

**当前缺口：**
- 无 `sorceress` 单位定义
- Arcane Sanctum 的 `trains` 数组不含 `sorceress`
- 无 Slow ability 数据或 runtime
- 无 debuff / movement-speed-modifier 基础设施

**最小数据字段（HN5-DATA 候选）：**

| 字段 | 候选值 | 说明 |
| --- | --- | --- |
| key | `'sorceress'` | 女巫单位类型 |
| name | `'女巫'` | 中文名 |
| cost | `{ gold: 155, lumber: 25 }` | 训练费用 |
| trainTime | `30` | 训练时间（秒） |
| hp | `305` | 生命值 |
| speed | `2.5` | 移动速度 |
| supply | `2` | 人口占用 |
| attackDamage | `11` | 弱远程魔法攻击 |
| attackRange | `5.5` | 远程攻击范围 |
| attackCooldown | `1.6` | 远程攻击间隔 |
| armor | `0` | 无甲 |
| sightRange | `8` | 视野 |
| canGather | `false` | 不能采集 |
| attackType | `AttackType.Magic` | 魔法攻击（如需扩展） |
| armorType | `ArmorType.Unarmored` | 无甲 |

**最小 runtime 行为：**
1. Arcane Sanctum 可训练 Sorceress（加入 `trains` 数组）
2. Sorceress 有 mana bar 和自动 mana 回复
3. Sorceress 有弱远程魔法攻击，但主身份来自 Slow
4. Sorceress 可手动施放 Slow
5. Sorceress 可自动施放 Slow（auto-cast toggle，后置）
6. 训练前置：Arcane Sanctum（已有）+ Keep（已有）

**Proof 序列：**
1. DATA proof：`sorceress` 数据种子存在于 `UNITS`
2. RUNTIME proof：Arcane Sanctum 可训练 Sorceress
3. IDENTITY proof：Sorceress 拥有 mana 和正确的初始属性
4. COMMAND proof：选中 Sorceress 显示 Slow 按钮

### 2.2 Slow（减速）

**War3 参考行为：** Sorceress 对敌方单位施放 Slow，降低移动速度和攻击速度，持续 20 秒。

**目标：** 让 Sorceress 能对敌方单位施放 Slow debuff，降低其移动速度。

**当前缺口：**
- 无 `slow` ability 数据种子
- 无 debuff / movement-speed-modifier runtime
- 无单位级 debuff 状态追踪

**最小数据字段（HN5-DATA 候选）：**

| 字段 | 候选值 | 说明 |
| --- | --- | --- |
| key | `'slow'` | 能力标识 |
| ownerType | `'sorceress'` | 只有 Sorceress 能施放 |
| cost | `{ mana: 40 }` | 魔法消耗 |
| cooldown | `0` | 无额外冷却（受 global cooldown 约束） |
| range | `8` | 施法距离 |
| targetRule | `{ teams: 'enemy', alive: true, excludeTypes: [] }` | 对敌方施放 |
| effectType | `'speedDebuff'` | 首个切片只做移动速度减益 |
| effectValue | `0` | 数值由 speedMultiplier 表达 |
| duration | `20` | 持续秒数 |
| stackingRule | `'refresh'` | 刷新已存在的 Slow |
| speedMultiplier | `0.4` | 目标移动速度降至 40% |
| attackCooldownMultiplier | `1.5` | 后续可选：攻击间隔变长，首个 runtime 可先不接 |

**最小 runtime 行为：**
1. 选中 Sorceress 时，命令卡显示 Slow 按钮
2. 点击按钮后，对范围内最近敌方单位施放
3. 受影响单位移动速度降低至 `speed * speedMultiplier`
4. 持续 `duration` 秒后自动恢复
5. 已受 Slow 影响的单位再次被 Slow 刷新持续时间
6. Sorceress mana 不足时按钮 disabled
7. 攻击速度减益可作为后续扩展字段，不阻塞首个 Slow runtime

**Proof 序列：**
1. DATA proof：`slow` 数据种子存在于 `ABILITIES`
2. RUNTIME proof：Sorceress 可施放 Slow，目标速度降低
3. IDENTITY proof：Slow 过期后目标速度恢复
4. COMMAND proof：mana 不足时按钮 disabled；非 Sorceress 不显示

## 3. 实现顺序和约束

### 3.1 第一张可执行实现任务只能是一个最小切片

第一张任务必须是以下之一：
- `HN5-DATA1`：Sorceress + Slow 数据种子（`UNITS.sorceress` + `ABILITIES.slow`）
- 不允许第一张任务同时实现数据和 runtime。

**实现顺序：**
1. **HN5-DATA1**：数据种子 → 只新增 `UNITS.sorceress` 和 `ABILITIES.slow`，不改 `Game.ts`
2. **HN5-IMPL2**：Sorceress training surface → Arcane Sanctum 训练、基础属性显示
3. **HN5-IMPL3**：Sorceress mana surface → 数据驱动 caster mana 初始化和回复显示
4. **HN5-IMPL4**：Slow runtime → 命令卡按钮、debuff 施放、速度修改、过期恢复
5. **HN5-IMPL5**（可选）：Slow auto-cast toggle

### 3.2 禁区

| 禁止 | 原因 |
| --- | --- |
| Spell Breaker | 需要先证明 debuff / buff 基础设施可行 |
| 英雄系统 | 需要完整 ability slot、level up、经验系统 |
| 物品 / 商店 | 需要完整物品栏和物品使用系统 |
| 第二阵营 | 需要独立的经济、建筑、单位树 |
| 全科技树 | 需要先完成 Castle / T3 基础设施 |
| 素材导入 | 需要走 asset approval packet |
| 完整 buff/debuff 系统 | 先用最小 Slow debuff 证明可行，不预建通用框架 |
| 完整 AI 战术重写 | AI 策略变更应在功能稳定后 |
| Invisibility / Polymorph | Sorceress 的其他能力在本分支后置 |
| Knight / Flying Machine | 需要先完成 Castle / T3 解锁 |

## 4. 数值边界

| 数值 | 参考值 | 容差 | 说明 |
| --- | --- | --- | --- |
| Sorceress HP | 305 | ±10% | War3 参考值 |
| Sorceress 费用 | 155g/25w | ±10% | War3 参考值 |
| Slow mana cost | 40 | ±10% | War3 参考值 |
| Slow duration | 20s | ±10% | War3 参考值 |
| Slow speed multiplier | 0.4 | ±10% | 目标移速降至 40% |
| Slow range | 8 | ±10% | 世界单位 |

## 5. Proof 总表

| Proof 类型 | 覆盖范围 | 运行方式 |
| --- | --- | --- |
| 合同存在 proof | 合同文件存在、包含两个条目、实现顺序和禁区清楚 | 静态 node:test |
| 数据种子 proof | 新增数据存在于正确位置 | 静态 node:test |
| Runtime proof | 训练、施放、debuff 行为正确 | Playwright runtime |
| Identity proof | debuff 过期恢复行为正确 | Playwright runtime |
| Command proof | 命令卡显示/隐藏、mana 约束正确 | Playwright runtime |
| Regression proof | 不影响已有 Priest Heal / Rally Call / Mortar AOE / Militia / Defend | Playwright runtime |

## 6. 当前进展

### 6.1 合同定义（HN5-PLAN1，Task 150）

Task 150 已完成 HN5 合同定义：
- Sorceress / Slow 两个能力已区分目标、当前缺口、最小数据字段、runtime 行为和 proof 序列
- 实现顺序已确定：DATA1 → IMPL2 → IMPL3 → 可选 IMPL4
- 禁区已明确
- `Game.ts` 和 `GameData.ts` 均未修改

### 6.2 数据种子（HN5-DATA1，Task 151）

Task 151 已完成 HN5 最小数据种子：

- `GameData.ts` 新增 `UNITS.sorceress`
- `GameData.ts` 新增 `AttackType.Magic`、魔法攻击显示名和临时 1.0 倍率表占位
- `GameData.ts` 新增 `ABILITIES.slow`
- Task152 之前 `BUILDINGS.arcane_sanctum.trains` 仍只包含 `priest`
- `Game.ts` 未接入 Slow runtime

### 6.3 训练入口（HN5-IMPL2，Task 152）

Task 152 已完成 Sorceress 训练入口：

- `BUILDINGS.arcane_sanctum.trains` 现在包含 `sorceress`
- Arcane Sanctum 命令卡显示“女巫”，点击后通过正常训练队列产出 Sorceress
- 选择面板显示女巫中文名、法师标签、Magic 攻击和无甲
- `UnitVisualFactory.ts` 有女巫 proxy，避免训练出的单位落到通用灰柱
- `Game.ts` 仍未读取 `ABILITIES.slow`，没有 Slow 按钮、debuff 或 auto-cast

### 6.4 Mana 初始化（HN5-IMPL3，Task 153）

Task 153 已完成 Sorceress mana 初始化：

- `UnitDef` 新增 `maxMana` / `manaRegen` 可选字段
- `UNITS.priest` 和 `UNITS.sorceress` 都从数据声明 mana 和回复速度
- `spawnUnit` 读取 `UNITS[type]` 初始化 `mana`、`maxMana`、`manaRegen`，不再写死 Priest
- 选择 Sorceress 时可见 mana 条，mana 会按数据回复且不超过上限
- Priest Heal 仍保留 mana 和治疗按钮
- `Game.ts` 仍未读取 `ABILITIES.slow`，没有 Slow 按钮、debuff 或 auto-cast

### 6.5 手动 Slow runtime（HN5-IMPL4，Task 154）

Task 154 已完成 Slow 的最小手动 runtime：

- 选中 Sorceress 时命令卡显示“减速”按钮
- 按钮读取 `ABILITIES.slow.name`、mana cost、duration 和 speedMultiplier
- mana 不足时 disabled；无合法目标时不扣 mana
- 点击后对范围内最近敌方非建筑单位施放 Slow
- Slow 通过 `slowSpeedMultiplier` 和移动路径临时降低移动速度，不直接覆盖基础 `unit.speed`
- 再次施放刷新持续时间；持续时间结束后清除 Slow 状态
- Priest Heal、Sorceress training surface 和 Sorceress mana surface 均未回退

### 6.6 自动 Slow runtime（HN5-IMPL5，Task 155）

Task 155 已完成 Slow 的最小自动施法 runtime：

- 选中 Sorceress 时命令卡显示“减速 (自动)”开关
- 开启后显示“减速 (自动) ✓”，关闭后不自动施放
- 自动施法复用 `castSlow` 和 `ABILITIES.slow`
- 目标筛选只允许敌方、存活、非建筑、范围内单位
- 已受 Slow 且剩余时间充足的目标不会被重复施放，避免每帧扣 mana
- Slow 接近过期时允许自动刷新
- mana 不足时不施放，`SimpleAI.ts` 仍没有 Slow 使用
- 手动 Slow runtime 未回退

### 6.7 未完成条目

- Slow 攻击速度减益后置
- Invisibility / Polymorph 后置
- AI 使用 Slow 后置
- 状态图标、素材和完整 caster tech tree 后置

### 6.8 收口盘点（HN5-CLOSE6，Task 156）

Task 156 已完成 HN5 Sorceress / Slow 收口盘点：

- `UNITS.sorceress` 数据种子：Magic 攻击、Unarmored 护甲、maxMana/manaRegen
- `ABILITIES.slow` 数据种子：speedDebuff、speedMultiplier 0.4、duration 20
- Arcane Sanctum 训练列表包含 priest 和 sorceress
- `spawnUnit` 从 `UNITS[type]` 数据驱动 mana 初始化
- 手动 Slow runtime：castSlow、命令卡按钮、debuff/过期恢复
- 自动 Slow runtime：toggle 开关、目标筛选、防重复耗蓝
- 六个 proof 文件覆盖完整 HN5 链路：contract、data seed、training、mana、manual Slow、auto Slow
- 无 AI Slow、无攻击速度减益、无 Invisibility/Polymorph/Spell Breaker/英雄/物品
- HN5 最小链路闭环，后续 Human 扩展需走新分支合同

## 7. 结论

```text
HN5 第二分支合同定义完成并已收口。
Sorceress / Slow 已区分目标、缺口、数据字段、runtime 行为和 proof 序列。
选择理由：复用已有 ABILITIES 模型、Arcane Sanctum 建筑、mana/cooldown/range 基础设施。
Sorceress / Slow 数据种子已完成（Task 151），Sorceress 训练入口已完成（Task 152），Sorceress mana 初始化已完成（Task 153），手动 Slow runtime 已完成（Task 154），自动 Slow runtime 已完成（Task 155），收口盘点已完成（Task 156）。
禁止 Spell Breaker、英雄、物品、第二阵营、全科技树、完整 buff/debuff、AI 重写和素材导入。
下一步：选择下一个 Human 分支（如 Knight、Altar/Heroes 或 AI 战术重写），需走新分支合同。
```
