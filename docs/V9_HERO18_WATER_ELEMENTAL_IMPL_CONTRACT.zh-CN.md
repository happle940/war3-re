# V9 HERO18-IMPL1-CONTRACT Water Elemental 召唤运行时合同

> 生成时间：2026-04-18
> 前置：Task265 (HERO18-CONTRACT1) 已 accepted — Water Elemental 分支合同。
> 前置：Task266 (HERO18-DATA1) 已 accepted — Water Elemental 源数据种子。
> 前置：Task267 (HERO18-MODEL1) 已 accepted — 数据-模型桥接合同。
> 任务编号：Task 268
> 本文档定义后续 HERO18-IMPL1 召唤运行时的精确行为合同。不实现召唤运行时、命令卡、AI、素材或其他 Archmage 能力。不编辑任何生产代码。
> 本文档 **不** 声称"Water Elemental 已实现"、"完整英雄系统"、"完整人族"或"V9 发布"。

---

## 1. 当前基线

### 1.1 已 accepted 的前置证据

| 任务 | 阶段 | 关键结论 |
|------|------|---------|
| Task265 | HERO18-CONTRACT1 | Water Elemental 分支边界、顺序、禁区 |
| Task266 | HERO18-DATA1 | `WATER_ELEMENTAL_SUMMON_LEVELS` source-only 数据种子落地 |
| Task267 | HERO18-MODEL1 | 桥接路径选项、未解决模型决策清单 |

### 1.2 当前生产代码状态

- `GameData.ts` 有 `WATER_ELEMENTAL_SUMMON_LEVELS`（source-only），无 `UNITS.water_elemental`，无 `ABILITIES.water_elemental`，无 `HERO_ABILITY_LEVELS.water_elemental`。
- `Game.ts` 无 Water Elemental 召唤运行时、命令卡按钮、mana 扣费、cooldown、目标选择、单位生成、定时消散。
- `SimpleAI.ts` 无 Archmage 策略。

本合同不改变以上任何一项。

---

## 2. 桥接路径选择

IMPL1 将采用 **路径 B（专用召唤运行时构造）**，具体方案：

1. **不创建 `UNITS.water_elemental`**：水元素不是生产队列单位，不应占用 `UNITS` 键。
2. **不创建 `ABILITIES.water_elemental`**：当前 `AbilityDef` 会要求 `cost`、`cooldown`、`range`、`targetRule`、`effectType` 等运行时字段；直接插入会把来源值复制到第二张表，并制造数据漂移风险。
3. **不创建 `HERO_ABILITY_LEVELS.water_elemental`**：当前 `HeroAbilityLevelDef` 适合 Holy Light / Divine Shield / Devotion Aura / Resurrection 这类英雄技能等级表，但 Water Elemental 已有专用 source table；再次写入 `mana`、`cooldown`、`duration`、`requiredHeroLevel` 会形成双数据源。
4. **IMPL1 通过专用召唤运行时 helper 读取 `WATER_ELEMENTAL_SUMMON_LEVELS`**：学习门槛、mana、cooldown、duration、HP、attackDamage、attackRange、attackType、armorType、armor、speed 都从这一个 source table 读取。
5. **运行时通过项目本地默认值补充缺源字段**：sightRange、attackCooldown、选择/碰撞处理、人口和施法范围。每个默认值在本合同第 4 节中显式命名和论证。

### 2.1 为什么选路径 B

- `UNITS.water_elemental` 需要填满 `UnitDef` 全部必填字段（`cost`、`trainTime`、`canGather`、`description` 等），这些字段对召唤单位无意义。
- 专用运行时构造路径可以只传递来源确认值 + 显式命名的项目本地默认值，不会在数据表中留下无意义字段。
- `ABILITIES.water_elemental` 和 `HERO_ABILITY_LEVELS.water_elemental` 暂不添加，避免把 `WATER_ELEMENTAL_SUMMON_LEVELS` 中已有的 mana / cooldown / duration / requiredHeroLevel 复制到第二或第三个数据源。
- 如果后续要把所有英雄技能统一迁移到通用 ability model，必须另开模型迁移任务；HERO18-IMPL1 不做这件事。

---

## 3. 来源确认值（IMPL1 必须读取）

以下值来自 `WATER_ELEMENTAL_SUMMON_LEVELS`，IMPL1 必须直接读取，不得在 `Game.ts` 中硬编码：

### 3.1 能力参数（所有等级相同）

| 字段 | 值 | 来源 |
|------|-----|------|
| mana | 125 | Task262 / Task265 / Task266 |
| cooldown | 20s | Task262 / Task265 / Task266 |
| duration | 60s | Task262 / Task265 / Task266 |
| requiredHeroLevel | 1 / 3 / 5 | Task262 / Task265 / Task266 |

### 3.2 召唤单位属性（按等级）

| 字段 | Lv1 | Lv2 | Lv3 | 来源 |
|------|-----|-----|-----|------|
| summonedHp | 525 | 675 | 900 | Task262 / Task265 / Task266 |
| summonedAttackDamage | 20 | 35 | 45 | Task262 / Task265 / Task266 |
| summonedAttackRange | 3.0 | 3.0 | 3.0 | Task262 / Task265 / Task266 |
| summonedAttackType | Piercing | Piercing | Piercing | Task262 / Task265 / Task266 |
| summonedArmorType | Heavy | Heavy | Heavy | Task262 / Task265 / Task266 |
| summonedArmor | 0 | 0 | 1 | Task262 / Task265 / Task266 |
| summonedSpeed | 2.2 | 2.2 | 2.2 | Task262 / Task265 / Task266 |

---

## 4. 项目本地默认值（IMPL1 必须显式命名）

以下字段来源未确认，但运行时必须有一个值才能工作。每个默认值有明确的名称、取值和论证理由。这些不是来源确认值，后续如果来源确认，应以来源值替换。

### 4.1 视野范围

| 名称 | 值 | 论证 |
|------|-----|------|
| `WE_DEFAULT_SIGHT_RANGE` | 8.0 | 与项目内其他远程单位（Rifleman 8.0、Priest 8.0）一致。不是来源确认值。 |

### 4.2 攻击间隔

| 名称 | 值 | 论证 |
|------|-----|------|
| `WE_DEFAULT_ATTACK_COOLDOWN` | 1.5 秒 | 与项目内类似远程单位（Rifleman 1.5）一致。不是来源确认值。 |

### 4.3 选择 / 碰撞处理

| 名称 | 值 | 论证 |
|------|-----|------|
| `WE_DEFAULT_SELECTION_RADIUS` | 0.8 | 仅作为水元素选择/目标落点处理的项目本地半径；当前 `Unit` 和 `UnitDef` 都没有 `size` 字段，IMPL1 不得伪造 `Unit.size` 或 `UnitDef.size`。不是来源确认值。 |
| `WE_COLLISION_MODE` | `ordinary_unit` | 水元素在 IMPL1 使用现有普通单位移动/碰撞处理，不新增建筑式占位，不进入采矿特殊无碰撞逻辑。不是来源确认值。 |

### 4.4 召唤单位人口

| 名称 | 值 | 论证 |
|------|-----|------|
| `WE_DEFAULT_SUPPLY` | 0 | 作为项目本地临时决定：召唤单位不吃当前人口上限，不影响玩家训练链。不是来源确认值。 |

### 4.5 施法范围

| 名称 | 值 | 论证 |
|------|-----|------|
| `WE_CAST_RANGE` | 8.0 | 与 Paladin Holy Light 施法范围一致。不是来源确认值。 |

---

## 5. 已解决决策

### 5.1 活跃召唤上限

**决策**：每次施放产生 1 个水元素。IMPL1 不实施全局活跃上限。

- 不检查"当前已有几个水元素"。
- 不限制同一 Archmage 只能有 1 个水元素。
- 后续可基于来源确认添加上限检查，但 IMPL1 不做。

**理由**：来源（Task262）未确认活跃上限。强行写死"只能 1 个"将违反不发明原则。多次施放产生多个水元素是来源未禁止的默认行为。

### 5.2 deadUnitRecords / Resurrection 交互

**决策**：水元素死亡 **不** 进入 `deadUnitRecords`。水元素消散（定时到期）也 **不** 进入 `deadUnitRecords`。

- Paladin Resurrection 不影响水元素。
- 水元素没有尸体。
- 水元素被击杀时直接清理，不留死亡记录。

**理由**：WC3 召唤单位不留尸体，不能被 Resurrection 复活。这是基于 WC3 系列机制的合理推断，而非主源直接确认。标记为项目本地决策。

### 5.3 目标位置验证

**决策**：Water Elemental 施放目标为地面位置。

- 必须在施法范围内（`WE_CAST_RANGE` 8.0 格）。
- 目标位置必须可行走（非障碍物、非建筑位置）。
- 无效目标时：不施放，不扣 mana，显示无效目标反馈。
- 战争迷雾中的位置：允许施放（与 WC3 行为一致）。
- 建筑位置：不允许（建筑占位）。
- 友方/敌方单位位置：允许（水元素生成到目标附近可行走位置）。

### 5.4 归属和队伍

**决策**：水元素属于召唤者（Archmage）的玩家。

- 水元素的 `team` 与召唤者相同。
- 水元素可被友方治疗、被敌方攻击。
- 水元素可被驱散（如果未来有驱散机制）。
- 水元素受 AoE 影响。
- 水元素可被玩家选择和控制（移动、攻击、攻击移动、原地驻守）。

### 5.5 清理生命周期

**决策**：水元素有定时消散机制。

- 生成时设置消散计时器（`duration` 秒，从 `WATER_ELEMENTAL_SUMMON_LEVELS` 读取）。
- 计时器到期后：水元素被移除（从单位列表中删除，清理视觉）。
- 水元素被击杀时：立即移除，不进入 deadUnitRecords（见 5.2）。
- 消散 vs 被击杀：两者都移除单位，但只有被击杀时触发死亡视觉反馈（如有）。
- IMPL1 不实现消散前预警（延后到 UX1）。

### 5.6 命令卡学习和施放

**决策**：

- **学习**：Archmage 命令卡在满足条件时显示 Water Elemental 学习按钮。
  - 条件：有技能点、英雄等级 >= `WATER_ELEMENTAL_SUMMON_LEVELS` 当前下一等级的 `requiredHeroLevel`。
  - 学习消耗 1 技能点，提升 1 级 Water Elemental。
  - 使用 `WATER_ELEMENTAL_SUMMON_LEVELS`，不添加 `HERO_ABILITY_LEVELS.water_elemental`。
- **施放**：已学习 Water Elemental 时，命令卡显示施放按钮。
  - 点击后进入目标选择模式（选择地面位置）。
  - 确认目标后：检查 mana >= `WATER_ELEMENTAL_SUMMON_LEVELS` 当前等级 mana（125），检查 cooldown。
  - 通过：扣 mana，开始 cooldown，在目标位置生成水元素。
  - 未通过：不扣 mana，不开始 cooldown，显示原因（mana 不足 / 冷却中）。
- **未学习**：不显示施放按钮。
- **死亡**：死亡 Archmage 不能施放。

### 5.7 冷却 / mana 时机

**决策**：

- **mana 扣除**：施放时立即扣除，不是生成后扣除。
- **cooldown 开始**：施放时立即开始，不是生成后开始。
- **cooldown 读取**：从 `WATER_ELEMENTAL_SUMMON_LEVELS` 读取当前等级 cooldown。
- **mana 读取**：从 `WATER_ELEMENTAL_SUMMON_LEVELS` 读取当前等级 mana。
- **mana 不足**：不施放，不扣 mana，显示"法力不足"。
- **cooldown 中**：不施放，显示冷却剩余时间。
- **Archmage 死亡**：cooldown 继续计时（与 Holy Light / Divine Shield 行为一致）。复活后如果 cooldown 已过，可以立即施放。

---

## 6. 仍然延后 / IMPL1 禁止

以下内容 IMPL1 **不得** 实现：

1. **AI 施法**：SimpleAI 不添加任何 Archmage Water Elemental 策略。
2. **Brilliance Aura / Blizzard / Mass Teleport**：各有独立分支。
3. **Mountain King / Blood Mage**：需独立英雄实现。
4. **物品 / 商店 / Tavern**：不在范围内。
5. **消散前预警 / HP 条 / 计时器显示**：延后到 HERO18-UX1。
6. **模型 / 图标 / 粒子 / 声音**：不在范围内。
7. **驱散机制**：不在 IMPL1 范围内（当前无驱散系统）。
8. **水元素升级 / 转化**：不在范围内。
9. **多 Archmage 水元素交互**：不在 IMPL1 范围内（每个 Archmage 独立召唤）。
10. **水元素被 Resurrection 复活**：明确禁止（见 5.2）。
11. **活跃上限检查**：IMPL1 不实施（见 5.1）。
12. **完整英雄系统 / 完整人族 / V9 发布**：不宣称。

---

## 7. IMPL1 必须证明的运行时行为

后续 HERO18-IMPL1 的 runtime proof 必须覆盖以下场景：

### 7.1 学习

1. **WE-RT-1**：Archmage 有技能点且等级 >= 1 时，可学习 Water Elemental Lv1。
2. **WE-RT-2**：等级 >= 3 且已学 Lv1 时，可学习 Lv2。
3. **WE-RT-3**：等级 >= 5 且已学 Lv2 时，可学习 Lv3。
4. **WE-RT-4**：等级不足时不能学习。
5. **WE-RT-5**：技能点不足时不能学习。
6. **WE-RT-6**：死亡和复活后保留已学等级。

### 7.2 施放

7. **WE-RT-7**：已学 Water Elemental 且有足够 mana 时，施放扣 125 mana 并开始 20 秒 cooldown。
8. **WE-RT-8**：施放后目标位置生成一个可控水元素，属于施放者阵营。
9. **WE-RT-9**：水元素属性匹配当前等级来源确认值（HP、攻击力、范围、速度等）。
10. **WE-RT-10**：水元素 60 秒后自动消散并从单位列表移除。
11. **WE-RT-11**：mana 不足时不能施放，不扣 mana。
12. **WE-RT-12**：cooldown 中不能施放。
13. **WE-RT-13**：未学习时不能施放。
14. **WE-RT-14**：死亡 Archmage 不能施放。

### 7.3 目标验证

15. **WE-RT-15**：无效目标位置（障碍物）不施放。
16. **WE-RT-16**：超出施法范围不施放。

### 7.4 deadUnitRecords

17. **WE-RT-17**：水元素被击杀不进入 deadUnitRecords。
18. **WE-RT-18**：水元素消散不进入 deadUnitRecords。

### 7.5 回归

19. **WE-RT-19**：Paladin Holy Light / Divine Shield / Devotion Aura / Resurrection 行为不受影响。
20. **WE-RT-20**：AI 无 Archmage 策略变化。
21. **WE-RT-21**：现有单位训练和建筑建造不受影响。

### 7.6 禁区

22. **WE-RT-22**：无 Brilliance Aura / Blizzard / Mass Teleport 运行时。
23. **WE-RT-23**：无 Mountain King / Blood Mage 运行时。
24. **WE-RT-24**：无 AI 水元素施法。

---

## 8. IMPL1 允许修改的文件

| 文件 | 允许的操作 |
|------|-----------|
| `GameData.ts` | 不新增 `UNITS.water_elemental`、`ABILITIES.water_elemental` 或 `HERO_ABILITY_LEVELS.water_elemental`；只复用已存在的 `WATER_ELEMENTAL_SUMMON_LEVELS` |
| `Game.ts` | 添加 Water Elemental 学习、施放、召唤单位生成、定时消散、目标验证代码；所有来源确认值读取 `WATER_ELEMENTAL_SUMMON_LEVELS`；不添加 AI |
| IMPL1 专属 proof | runtime proof 文件 |
| IMPL1 专属文档 | 实施文档 |

---

## 9. 合同声明

本合同不宣称以下任何一项：

- Water Elemental 已实现
- 本合同修改了任何生产代码
- Archmage 能力已实现
- 桥接路径已在生产代码中落地
- `ABILITIES.water_elemental` 或 `HERO_ABILITY_LEVELS.water_elemental` 已添加
- Brilliance Aura / Blizzard / Mass Teleport 已开始
- 完整英雄系统已完成
- 完整人族已完成
- V9 已发布
- Mountain King / Blood Mage 已开始
- 物品/商店/Tavern 系统已完成
- AI 已能使用 Archmage 能力
- 项目本地默认值是来源确认值
