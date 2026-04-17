# V9 HERO13-SRC1 Devotion Aura 来源边界

> 生成时间：2026-04-16
> 前置：Task 238 (HERO13-CONTRACT1) 已 accepted。Devotion Aura 分支合同已定义。
> 基线：HERO9 (死亡/复活)、HERO10 (XP/升级)、HERO11 (圣光术学习)、HERO12 (Divine Shield 收口) 已 accepted。
> 范围：绑定 Devotion Aura 来源真值和项目映射，不修改生产代码。
> 本文档 **不** 声称"完整圣骑士"、"完整英雄系统"、"完整人族"或"V9 发布"。

---

## 1. 来源层级

### 1.1 主来源

Blizzard Classic Battle.net Paladin 页面：
`https://classic.battle.net/war3/human/units/paladin.shtml#paladin-devotion`

主来源为最终真值来源。任何次要来源仅作交叉验证，不能覆盖主来源。

### 1.2 次要交叉来源

- Liquipedia Warcraft III Paladin 页面：仅作交叉验证。

---

## 2. 采纳值

### 2.1 Devotion Aura 基本属性

| 属性 | 值 |
|------|-----|
| 类型 | 被动光环（Passive Aura） |
| 持续时间 | 无限（被动持续） |
| 冷却时间 | 不适用 |
| 法力消耗 | 无 |
| 射程 | 不适用（被动生效） |
| 施放方式 | 无命令卡按钮，自动生效 |

### 2.2 等级数据

| 属性 | 等级 1 | 等级 2 | 等级 3 |
|------|--------|--------|--------|
| 护甲加成 (armor bonus) | +1.5 | +3 | +4.5 |
| 光环半径 (area of effect) | 90 | 90 | 90 |
| 所需英雄等级 (required hero level) | 1 | 3 | 5 |
| 受影响目标 | Air / Ground / Friend / Self | 同左 | 同左 |

### 2.3 与其他能力的关系

- Devotion Aura 是被动能力，不与 Holy Light 或 Divine Shield 交互。
- 护甲加成叠加规则：同一来源不重复累计；主来源未给出多来源叠加规则，未来多英雄/多来源必须另开来源边界。
- 光环在来源单位死亡时停止生效。

---

## 3. 行为规则

### 3.1 来源规则

- Devotion Aura 的来源是学习该技能的 Paladin。
- 来源必须存活且在场上，光环才生效。
- 来源死亡时，所有受影响的友方单位立即失去护甲加成。

### 3.2 范围规则

- 光环半径为 90（来源单位），影响范围内所有符合条件的友方单位。
- 友方单位离开范围时立即失去护甲加成。
- 友方单位进入范围时立即获得护甲加成。

### 3.3 叠加规则

- 同一 Paladin 的 Devotion Aura 对同一单位只计一次，不重复累计。
- 主来源未给出多个 Paladin / 多来源叠加规则；当前项目仍只有唯一 Paladin，后续不得从本来源边界外推多来源独立叠加。

### 3.4 效果排除

Devotion Aura 是 **临时护甲加成**，明确 **不是**：
- 治疗效果
- 伤害吸收盾
- 无敌效果
- 攻击力加成
- 移动速度加成

---

## 4. 项目映射

### 4.1 AoE 90 到项目比例

- 来源 `Area of Effect: 90` 是 War3 标准单位。
- 项目使用世界坐标系；沿用 HERO2 / HERO11 已接受的 `80 War3 单位 → 8.0 项目格` 映射。
- 因此 Devotion Aura 的来源 `Area of Effect: 90` 映射为 `auraRadius: 9.0`，供 DATA1 / IMPL1 后续使用。
- 本文档只记录来源值 `90` 和项目映射 `9.0`，不修改运行时。

### 4.2 护甲加成实现方式

- 来源 `+1.5/+3/+4.5` 护甲在项目中将作为临时加成实现，不永久修改单位基础护甲。
- 加成值来自 `HERO_ABILITY_LEVELS.devotion_aura`（DATA1 任务将种子）。
- 移除光环时恢复单位原护甲值。

### 4.3 受影响目标集

- 来源 `Air / Ground / Friend / Self`：友方空中单位、友方地面单位、自身。
- 当前项目无空军单位；后续实现只能映射当前存在的友方地面单位和 Paladin 自身，未来空军出现时再接入 Air 目标。
- 主来源没有列出 Buildings / Structures；后续实现不得把建筑加入受影响目标，除非另有来源边界批准。
- 同一来源不重复累计；多来源叠加规则未定，不得在 DATA1 / IMPL1 中外推。

---

## 5. 不修改生产代码

- `GameData.ts` 不添加 `devotion_aura` 条目。
- `Game.ts` 不添加光环运行时。
- 运行时不变性保持。

---

## 6. 明确延后

| 项目 | 延后原因 |
|------|---------|
| Devotion Aura 等级数据种子 | 需要 DATA1 |
| Devotion Aura 被动光环运行时 | 需要 IMPL1 |
| 命令卡按钮（被动无按钮） | 不适用 |
| HUD 光环反馈 | 需要 UX1 |
| 视觉效果 | 需要后续任务 |
| Resurrection | 需要独立实现 |
| Archmage / Mountain King / Blood Mage | 需要独立实现 |
| AI 英雄策略 | 需要 AI 任务 |
| 物品 / 商店 / Tavern | 需要独立实现 |
| 资产 | 需要资产任务 |
| 第二种族 / 空军 / 多人联机 | 不在范围内 |
| 完整英雄系统 / 完整人族 / V9 发布 | 不在范围内 |

---

## 7. 合同声明

本文档 **仅** 定义 Devotion Aura 的来源真值和项目映射。

本文档 **不** 声称：
- "完整圣骑士"
- "完整英雄系统"
- "完整人族"
- "V9 发布"
- 已实现 Devotion Aura 运行时
- 已添加 `HERO_ABILITY_LEVELS.devotion_aura` 或 `ABILITIES.devotion_aura`
