# V9 HERO23-SRC1 Mountain King 来源边界

> 任务编号：Task 303
> 生成时间：2026-04-18
> 前置：Task302 (HERO23-CONTRACT1) 已 accepted。Mountain King 分支边界合同已定义。
> 基线：HERO22 (Archmage AI 最小策略收口) 已 accepted；Task301 (V9-HUMAN-GAP-REFRESH) 已 accepted。
> 范围：Mountain King 英雄单位及其四个能力的来源值与项目映射。不修改生产代码。
> 本文档 **不** 声称"完整英雄系统"、"完整人族"、"完整 AI"或"V9 发布"。

---

## 1. 来源层级

| 层级 | 来源 | 角色 |
|------|------|------|
| 主来源 | Blizzard Classic Battle.net Mountain King 页面 (`https://classic.battle.net/war3/human/units/mountainking.shtml`) | Mountain King 基础属性和能力的优先采纳依据 |
| 主来源 | Blizzard Classic Hero Basics (`https://classic.battle.net/war3/basics/heroes.shtml`) | 英雄通用规则（技能点、终极技能、等级门槛） |
| 交叉检查 | Liquipedia Warcraft III — Mountain King (`https://liquipedia.net/warcraft/Mountain_King`) | 社区维护的当前补丁数值和完整补丁历史 |
| 交叉检查 | Warcraft Wiki (`https://warcraft.wiki.gg`) | 额外交叉校验 |
| 冲突样本 | 旧补丁记录、社区表格、非官方资料 | 只记录差异，不直接采纳 |
| 冲突处理 | 以 Blizzard Classic / Classic 镜像主来源为准；冲突时 Codex 可显式覆盖 | — |

### 1.1 版本选择说明

War3 历经多次补丁（1.03 至 2.0.4），部分数值在不同版本间有变化。本来源边界采用以下原则：

- **基准来源**：采用 `classic.battle.net` 当前可复查页面记录的值作为主源基线；不把记忆中的 RoC / TFT / Reforged 补丁值直接当作生产依据。
- **补丁历史**：记录重大补丁变更和社区样本差异，但采纳值以主来源为准。
- **后续调整**：数值微调可在 runtime 任务中根据游戏体验调整，不在此边界锁定。

### 1.2 来源获取状态

- `https://classic.battle.net/war3/human/units/mountainking.shtml`：**已成功获取**。Mountain King 全部单位属性和四个能力（Storm Bolt / Thunder Clap / Bash / Avatar）的完整数值表均来自此页面。
- `https://classic.battle.net/war3/basics/heroes.shtml`：**已尝试获取**，页面内容稀少，仅获标题。英雄通用规则参照 Paladin / Archmage 已 accepted 的来源边界惯例。

---

## 2. Mountain King 英雄单位（等级 1 基础属性）

### 2.1 采纳值

| 字段 | Classic 主源值 | 交叉校验 | 采用值 | 说明 |
|------|---------------|----------|--------|------|
| cost.gold | 425 | 一致 | **425** | 无冲突；与 Paladin / Archmage 同价 |
| cost.lumber | 100 | 一致 | **100** | 无冲突；与 Paladin / Archmage 同价 |
| trainTime | 55s | 一致 | **55** | 无冲突；与 Paladin / Archmage 同 |
| hp | 700 | 一致 | **700** | Classic 主源 Level 1 HP = 700 |
| speed | 270 (Average) | — | **3.0** | 项目映射：270 → 3.0 格/秒（与 Paladin 270→3.0 一致） |
| supply | 5 | 一致 | **5** | 无冲突；标准英雄人口 |
| attackDamage | 26-36 (avg 31) | 一致 | **26** | Classic 主源 Level 1 攻击 26-36；采用下限 |
| attackRange | Melee | — | **1.0** | 近战英雄，项目映射与 Paladin 一致 |
| attackCooldown | 2.22s | — | **2.22** | Classic 主源 Cooldown 值 |
| armor | 2 | 一致 | **2** | Classic 主源 Level 1 Armor = 2 |
| sightRange | 180/80 (日/夜 War3 单位) | — | **10** | 项目映射：180→10（与 Paladin / Archmage 一致）；夜间视野暂缓 |
| maxMana | 225 (15 INT × 15) | 一致 | **225** | Classic 主源 Level 1 Mana = 225 |
| attackType | Hero | Classic 主源 Attack Type = Hero | **Normal** | 项目映射：Hero 攻击 → Normal（与 Paladin / Archmage 一致） |
| armorType | Hero | Classic 主源 Armor Type = Hero | **Heavy** | 项目映射：Hero 护甲 → Heavy（与 Paladin / Archmage 一致） |
| primaryAttribute | Strength | Classic 主源 Strength Bonus = 3/level | **Strength** | Mountain King 是力量型英雄 |
| airAttack | None | Classic 主源明确 Air Attack = None | **None** | 近战英雄无对空攻击 |

### 2.2 属性成长（Classic 主源完整 1-10 级表）

| 等级 | 攻击 (地面/空中) | 护甲 | 力量 | 敏捷 | 智力 | HP | Mana |
|------|-----------------|------|------|------|------|-----|------|
| 1 | 26-36 / None | 2 | 24 | 11 | 15 | 700 | 225 |
| 2 | 29-39 / None | 3 | 27 | 12 | 16 | 775 | 240 |
| 3 | 32-42 / None | 3 | 30 | 14 | 18 | 850 | 270 |
| 4 | 35-45 / None | 4 | 33 | 15 | 19 | 925 | 285 |
| 5 | 38-48 / None | 4 | 36 | 17 | 21 | 1000 | 315 |
| 6 | 41-51 / None | 4 | 39 | 18 | 22 | 1075 | 330 |
| 7 | 44-54 / None | 5 | 42 | 20 | 24 | 1150 | 360 |
| 8 | 47-57 / None | 5 | 45 | 21 | 25 | 1225 | 375 |
| 9 | 50-60 / None | 6 | 48 | 23 | 27 | 1300 | 405 |
| 10 | 53-63 / None | 6 | 51 | 24 | 28 | 1375 | 420 |

属性成长推导（来源确认）：
- 力量成长：+3/级
- 敏捷成长：+1.5/级
- 智力成长：+1.5/级

### 2.3 与 Paladin / Archmage 的对比

| 字段 | Paladin 采用值 | Archmage 采用值 | Mountain King 采用值 | 差异说明 |
|------|---------------|----------------|---------------------|----------|
| hp | 650 | 450 | **700** | MK 最肉（力量型英雄） |
| attackDamage | 24 | 21 | **26** | MK 基础攻击最高 |
| attackRange | 1.0 | 6.0 | **1.0** | MK 近战，与 Paladin 一致 |
| attackCooldown | 2.2 | 2.13 | **2.22** | 三者接近 |
| armor | 4 | 3 | **2** | MK 基础护甲最低 |
| maxMana | 255 | 285 | **225** | MK 法力最少（力量型） |
| speed | 3.0 | 3.2 | **3.0** | MK 与 Paladin 同速 |
| primaryAttribute | Strength | Intelligence | **Strength** | MK 与 Paladin 同为力量型 |

### 2.4 英雄特有字段

| 字段 | 采用值 | 说明 |
|------|--------|------|
| isHero | true | 英雄标识 |
| heroLevel | 1 | 初始等级 |
| heroXP | 0 | 初始经验 |
| heroSkillPoints | 1 | 等级 1 有 1 个技能点 |
| isDead | false | 初始未死亡 |

### 2.5 来源未知 / 暂缓字段

| 字段 | 状态 | 说明 |
|------|------|------|
| manaRegen | 暂缓 | Classic 主源给出 0.01 基础回复率；runtime 任务可按 Paladin / Archmage 同等方式处理 |
| 夜间视野 | 暂缓 | 项目当前无日夜视野区分机制 |
| canGather | false | 英雄不可采集，无需来源确认 |
| weaponType | Normal | Classic 主源 Weapon Type = Normal；项目已有此映射 |

---

## 3. Storm Bolt（风暴之锤）

### 3.1 能力参数（Classic 主源完整表）

| 字段 | 等级 1 | 等级 2 | 等级 3 | 说明 |
|------|--------|--------|--------|------|
| 法力消耗 (Mana Cost) | 75 | 75 | 75 | 无冲突 |
| 冷却时间 (Cooldown) | 9s | 9s | 9s | 无冲突 |
| 施法射程 (Range) | 60 | 60 | 60 | Classic 显示 Range = 60；项目映射：60→6.0 格 |
| 允许目标 (Allowed Targets) | Unit Air, Ground, Enemy, Neutral | Unit Air, Ground, Enemy, Neutral | Unit Air, Ground, Enemy, Neutral | 单体指向性，可对空对地 |
| 伤害 (Damage) | 100 | 225 | 350 | 无冲突 |
| 眩晕持续时间 (Stun Duration) | 5s (Hero 3s) | 5s (Hero 3s) | 5s (Hero 3s) | 普通单位 5 秒，英雄 3 秒 |
| 英雄等级需求 | 1 | 3 | 5 | 标准普通技能等级门槛 |

### 3.2 行为规则（来源确认）

- Storm Bolt 是单体指向性技能：向目标敌方单位投掷战锤，造成伤害并眩晕。
- 眩晕对普通单位和英雄的持续时间不同：普通 5 秒，英雄 3 秒。
- 战锤有弹道飞行时间（来源提及"thrown at an enemy unit"），弹道速度暂缓。
- 可对空中单位施放（来源明确 Allowed Targets 包含 Air）。
- 可对中立单位施放。
- 眩晕打断通道技能（来源："Use Storm Bolt to interrupt spells that require spell channeling"）。

### 3.3 补丁历史

- Classic 主源值与 RoC 原始值一致。
- 后续补丁可能调整伤害/眩晕/法力消耗，本边界以 Classic 主源为准。

### 3.4 运行时影响评估

| 项目 | 评估 |
|------|------|
| 弹道投射物 | 需要新机制：从 MK 发射到目标单位的飞行投射物 |
| 眩晕效果 | 需要眩晕状态机制：目标无法移动/攻击/施法 |
| 英雄 vs 普通单位眩晕时长 | 需要目标类型判断 |
| 打断通道 | 需要通道施法打断机制 |

### 3.5 来源未知 / 暂缓字段

| 字段 | 状态 | 说明 |
|------|------|------|
| 弹道速度 | 暂缓 | Classic 主源未列出弹道飞行速度 |
| 弹道是否可被躲避 | 暂缓 | 来源未明确 |
| 眩晕是否可被驱散 | 暂缓 | 来源未明确 |

---

## 4. Thunder Clap（雷霆一击）

### 4.1 能力参数（Classic 主源完整表）

| 字段 | 等级 1 | 等级 2 | 等级 3 | 说明 |
|------|--------|--------|--------|------|
| 法力消耗 (Mana Cost) | 90 | 90 | 90 | 无冲突 |
| 冷却时间 (Cooldown) | 6s | 6s | 6s | 无冲突 |
| 施法射程 (Range) | N/A | N/A | N/A | 近身 AOE，无目标选择 |
| 影响范围 (Area of Effect) | 25 | 30 | 35 | Classic 显示 AOE = 25/30/35；项目映射待定 |
| 允许目标 (Allowed Targets) | Ground, Enemy | Ground, Enemy | Ground, Enemy | 仅地面敌方单位 |
| 伤害 (Damage) | 60 | 100 | 140 | 无冲突 |
| 持续时间 (Duration) | 5s (Hero 3s) | 5s (Hero 3s) | 5s (Hero 3s) | 减速持续时间 |
| 移动速度减慢 | 50% | 50% | 50% | 无冲突 |
| 攻击速度减慢 | 50% | 50% | 50% | 无冲突 |
| 英雄等级需求 | 1 | 3 | 5 | 标准普通技能等级门槛 |

### 4.2 行为规则（来源确认）

- Thunder Clap 是无目标近身 AOE 技能：以 Mountain King 为中心，对范围内地面敌方单位造成伤害并减速。
- **不对空中单位生效**（来源明确："This spell will not work on air units"）。
- 同时降低移动速度和攻击速度各 50%。
- 减速对普通单位 5 秒，对英雄 3 秒。
- 无目标选择，即时施放。

### 4.3 补丁历史

- Classic 主源值与 RoC 原始值一致。

### 4.4 运行时影响评估

| 项目 | 评估 |
|------|------|
| 近身 AOE | 以 MK 为中心的范围伤害，类似 Blizzard 但无需通道 |
| 减速效果 | 需要移动速度和攻击速度临时降低机制 |
| AOE 半径随等级增长 | 25/30/35 是 Classic 显示值；内部值和项目映射待 runtime 确定 |
| 目标过滤 | 仅地面敌方单位，不包含建筑和空中单位 |

### 4.5 来源未知 / 暂缓字段

| 字段 | 状态 | 说明 |
|------|------|------|
| AOE 内部值 | 暂缓 | Classic 显示 25/30/35，但内部单位转换和项目映射需 runtime 确认 |
| 减速效果是否可驱散 | 暂缓 | 来源未明确 |
| 对建筑是否生效 | 暂缓 | 来源只说 Ground, Enemy，建筑是否包含需 runtime 确认 |

---

## 5. Bash（猛击）

### 5.1 能力参数（Classic 主源完整表）

| 字段 | 等级 1 | 等级 2 | 等级 3 | 说明 |
|------|--------|--------|--------|------|
| 法力消耗 (Mana Cost) | None | None | None | 被动技能，无消耗 |
| 冷却时间 (Cooldown) | N/A | N/A | N/A | 被动技能 |
| 触发概率 | 20% | 30% | 40% | 无冲突 |
| 额外伤害 (Bonus Damage) | +25 | +25 | +25 | 无冲突；所有等级相同 |
| 眩晕持续时间 | 2s (Hero 1s) | 2s (Hero 1s) | 2s (Hero 1s) | 普通单位 2 秒，英雄 1 秒 |
| 允许目标 (Allowed Targets) | Ground | Ground | Ground | 仅地面单位 |
| 英雄等级需求 | 1 | 3 | 5 | 标准普通技能等级门槛 |

### 5.2 行为规则（来源确认）

- Bash 是被动触发技能：Mountain King 每次普通攻击有一定概率触发额外伤害和眩晕。
- 额外伤害固定 +25，不随等级变化。
- 触发概率随等级增长：20% / 30% / 40%。
- 眩晕对普通单位 2 秒，对英雄 1 秒。
- Bash 触发时可与 Storm Bolt / Thunder Clap 的眩晕叠加使用（来源："Bash can also be used at the same time as Thunder Clap and Storm Bolt"）。
- 仅对地面单位生效（来源 Allowed Targets = Ground）。使用 Orb 可对空（来源提及），但 Orb / 物品系统不在范围内。

### 5.3 补丁历史

- Classic 主源值与 RoC 原始值一致。

### 5.4 运行时影响评估

| 项目 | 评估 |
|------|------|
| 被动触发 | 需要在 MK 每次攻击时检查触发概率 |
| 额外伤害 | 在普通攻击伤害基础上额外增加 +25 |
| 眩晕效果 | 与 Storm Bolt 共用眩晕机制，但持续时间不同 |
| 触发概率 | 需要随机数判定（20%/30%/40%） |

### 5.5 来源未知 / 暂缓字段

| 字段 | 状态 | 说明 |
|------|------|------|
| Bash 额外伤害是否计入攻击显示 | 暂缓 | 来源未明确 |
| Bash 是否触发攻击特效 | 暂缓 | 来源未明确 |
| Bash 与 Storm Bolt 眩晕是否互相覆盖 | 暂缓 | 来源只说可同时使用，但眩晕覆盖规则需 runtime 确认 |

---

## 6. Avatar（化身）

### 6.1 能力参数（Classic 主源完整表）

| 字段 | 值 | 说明 |
|------|-----|------|
| 法力消耗 (Mana Cost) | 150 | 无冲突 |
| 冷却时间 (Cooldown) | 180s | 无冲突 |
| 持续时间 (Duration) | 60s | 无冲突 |
| 护甲加成 | +5 | 无冲突 |
| 生命值加成 | +500 HP | 无冲突 |
| 攻击伤害加成 | +20 | 无冲突 |
| 法术免疫 | 是 | 来源明确 spell immunity |
| 允许目标 (Allowed Targets) | Self | 自身 |
| 英雄等级需求 | 6 | 终极技能标准门槛 |
| maxLevel | 1 | 终极技能只有 1 级 |

### 6.2 行为规则（来源确认）

- Avatar 是终极自身变身技能：激活后 MK 获得临时属性加成和法术免疫。
- 持续 60 秒后自动恢复。
- 法术免疫：期间不受法术效果影响（但来源说明 Paladin 仍可对 Avatared MK 施放 Holy Light 治疗它）。
- 加成包括：+5 护甲、+500 HP、+20 伤害。
- HP 加成到期后需扣除（如果当前 HP 超过原始 maxHP，应降至原始 maxHP）。

### 6.3 补丁历史

- Classic 主源值与 RoC 原始值一致。

### 6.4 运行时影响评估

| 项目 | 评估 |
|------|------|
| 临时属性加成 | 需要临时属性修改机制：护甲、HP、伤害 |
| 法术免疫 | 需要法术免疫状态机制 |
| HP 加成到期 | 需要处理 HP 加成到期后的 HP 回退 |
| 变身视觉 | 视觉变化延后到 HERO23-UX1 |

### 6.5 来源未知 / 暂缓字段

| 字段 | 状态 | 说明 |
|------|------|------|
| 法术免疫具体范围 | 暂缓 | 来源只说 spell immunity；哪些法术被免疫需 runtime 定义 |
| Avatar 期间是否可施放自身技能 | 暂缓 | 来源未明确 |
| HP 加成是否立即生效（满血时是否加血） | 暂缓 | 来源未明确 |

---

## 7. 项目映射汇总

### 7.1 单位映射规则（与 Paladin / Archmage 分支一致）

| War3 显示单位 | War3 内部单位 | 项目单位 | 映射公式 |
|---------------|--------------|---------|----------|
| 射程 60 (Storm Bolt) | 600 | 6.0 | ÷100 |
| 视野 180 | 1800 | 10 | ≈÷180（取整） |
| 速度 270 | 270 | 3.0 | ÷90 |
| AOE 25/30/35 (Thunder Clap) | 待定 | 待定 | 显示值可能已是内部值；需 runtime 确认 |

### 7.2 攻击/护甲类型映射

| War3 类型 | 项目类型 | 说明 |
|-----------|---------|------|
| Hero 攻击 | Normal | 与 Paladin / Archmage 一致 |
| Hero 护甲 | Heavy | 与 Paladin / Archmage 一致 |
| Normal 武器 | Normal | 近战标准 |

---

## 8. 采用值汇总（进入 HERO23-DATA1 及后续数据种子）

### 8.1 Mountain King 单位数据（HERO23-DATA1 指导）

```
key: 'mountain_king'
name: '山丘之王'
cost: { gold: 425, lumber: 100 }
trainTime: 55, hp: 700, speed: 3.0, supply: 5
attackDamage: 26, attackRange: 1.0, attackCooldown: 2.22
armor: 2, sightRange: 10
canGather: false
description: '山丘之王英雄'
attackType: AttackType.Normal
armorType: ArmorType.Heavy
maxMana: 225
isHero: true, heroLevel: 1, heroXP: 0, heroSkillPoints: 1, isDead: false
```

### 8.2 Altar of Kings 更新（延后到 HERO23-IMPL1-CONTRACT / IMPL1）

`HERO23-DATA1` 只允许添加 source-only 数据，不修改 `BUILDINGS.altar_of_kings.trains`。

```
trains: ['paladin', 'archmage']  // HERO23-DATA1 保持不变
// HERO23-IMPL1 才能在 runtime proof 下扩展为 ['paladin', 'archmage', 'mountain_king']
```

### 8.3 能力等级数据（后续任务落地）

| 能力 | 数据任务 | 等级数 | 来源确认 |
|------|---------|--------|---------|
| Storm Bolt | IMPL1-CONTRACT 阶段定义，IMPL1 落地 | 3 | 是 |
| Thunder Clap | IMPL1-CONTRACT 阶段定义，IMPL1 落地 | 3 | 是 |
| Bash | IMPL1-CONTRACT 阶段定义，IMPL1 落地 | 3 | 是 |
| Avatar | IMPL1-CONTRACT 阶段定义，IMPL1 落地 | 1 | 是 |

---

## 9. 明确延后

| 项目 | 延后原因 |
|------|---------|
| Blood Mage | 需要独立英雄分支合同 |
| AI Mountain King 策略 | 需要所有能力运行时完成后 |
| 物品 / 背包 | 不在范围内 |
| 商店 / Tavern | 不在范围内 |
| 完整英雄系统 / 完整 AI / 完整人族 / V9 发布 | 不在范围内 |
| 新视觉/音频素材 | 不在范围内 |
| 日夜视野区分 | 项目当前无此机制 |
| 空军 / 战役 / 第二种族 / 多人联机 | 不在范围内 |
| Orb 对空（Bash） | 需要物品系统 |

---

## 10. 来源边界确认

- 所有采用值均标明主源依据；Classic 主源页面已成功获取，数值直接来自页面表格。
- 来源未知字段已明确标注为"暂缓"，不凭记忆填写。
- 不修改 `GameData.ts`、`Game.ts`、`SimpleAI.ts` 或任何生产代码。
- 本文档不声称完整英雄系统、完整 AI、完整人族或 V9 发布。

---

## 11. 下一安全任务

**Task 304 — V9 HERO23-DATA1 Mountain King source-only 数据种子**

该任务将来源边界中的 Mountain King 单位数据以 source-only 形式落地到 `GameData.ts`，不暴露 Altar 训练入口，不添加运行时能力。
