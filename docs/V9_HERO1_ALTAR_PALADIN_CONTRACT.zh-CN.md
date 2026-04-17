# V9 HERO1 Altar of Kings + Paladin 英雄入口合同

> 用途：定义 Altar of Kings 建筑和第一名英雄 Paladin 的最小数据字段、runtime 行为、验收条件和禁区，作为英雄系统入口的工程合同。
> 上游：Task201 Human 核心全局缺口盘点确认英雄系统是最高优先级缺口。
> 范围：合同阶段只写文档和静态 proof，不写生产代码或 runtime 测试。

## 0. 合同口径

本合同定义英雄系统入口的最小可行切片：
- Altar of Kings 建筑
- Paladin 英雄单位
- Holy Light 英雄能力
- 英雄复活机制最小合同

后续英雄（Archmage、Mountain King、Blood Mage）在本合同走通后逐个加入。

## 1. Altar of Kings 建筑

### 1.1 数据字段

Altar of Kings 应作为 `BUILDINGS` 新条目，包含以下字段：

| 字段 | 值 | 说明 |
| --- | --- | --- |
| key | `'altar_of_kings'` | 唯一标识 |
| name | `'国王祭坛'` | 中文名 |
| cost | `{ gold: 180, lumber: 50 }` | 候选参考值，HERO2-SRC1 源校验后才能写入 GameData |
| buildTime | `60` | 候选参考值，HERO2-SRC1 源校验后才能写入 GameData |
| hp | `900` | 候选参考值，HERO2-SRC1 源校验后才能写入 GameData |
| supply | `0` | 不提供人口 |
| size | `3` | 占地 |
| description | `'英雄祭坛，召唤英雄'` | 说明文字 |
| trains | `['paladin']` | 当前只召唤 Paladin |
| techPrereq | 无 | T1 即可建造 |

### 1.2 建造前置

- 农民可建造，无额外建筑前置。具体 War3-like 口径需在 HERO2-SRC1 源校验中确认后再写入数据。
- 不依赖 Keep 或 Castle。

### 1.3 命令卡入口

- Altar 选中时，命令卡显示「召唤圣骑士」按钮（训练入口）。
- 英雄已召唤后，按钮变为不可用（唯一性限制）。
- 英雄死亡后，按钮重新激活为「复活圣骑士」，并显示复活费用。

### 1.4 与现有建筑系统的兼容

- Altar 不解锁任何其他建筑。
- Altar 不是任何现有建筑的 techPrereq。
- Altar 不影响现有 Town Hall / Keep / Castle 升级链。

## 2. Paladin 英雄单位

### 2.1 最小英雄字段

Paladin 作为 `UNITS` 新条目，需扩展现有 `UnitDef` 以支持英雄：

| 字段 | 值 | 说明 |
| --- | --- | --- |
| key | `'paladin'` | 唯一标识 |
| name | `'圣骑士'` | 中文名 |
| cost | `{ gold: 425, lumber: 100 }` | 候选参考值，HERO2-SRC1 源校验后才能写入 GameData |
| trainTime | `35` | 候选参考值，HERO2-SRC1 源校验后才能写入 GameData |
| hp | `700` | 候选参考值，等级 1，HERO2-SRC1 源校验后才能写入 GameData |
| speed | `3.2` | 移动速度 |
| supply | `5` | 占用人口 |
| attackDamage | `24` | 基础攻击力（等级 1） |
| attackRange | `1.0` | 近战 |
| attackCooldown | `1.8` | 攻击间隔 |
| armor | `3` | 基础护甲 |
| sightRange | `10` | 视野 |
| canGather | `false` | 不可采集 |
| attackType | `AttackType.Normal` | 普通攻击 |
| armorType | `ArmorType.Heavy` | 重甲 |

需新增的英雄特有字段（扩展 `UnitDef`）：

| 新字段 | 类型 | Paladin 初始值 | 说明 |
| --- | --- | --- | --- |
| `isHero` | `boolean` | `true` | 英雄标识，区分普通单位 |
| `heroLevel` | `number` | `1` | 当前等级 |
| `heroXP` | `number` | `0` | 当前经验值 |
| `heroSkillPoints` | `number` | `1` | 可用技能点（等级 1 有 1 点） |
| `isDead` | `boolean` | `false` | 死亡状态（不清理单位，保留在场上） |
| `reviveCost` | `{ gold, lumber }` | `{ gold: 255, lumber: 60 }` | 候选参考值，需在 revive runtime 前源校验 |

### 2.2 唯一性限制

- 每种英雄每名玩家最多 1 个。
- 已有 Paladin 时 Altar 不显示召唤按钮。
- 英雄死亡不解除唯一性（死亡的英雄仍占位置），需复活。

### 2.3 与现有单位系统的兼容

- Paladin 不出现在 Barracks / Workshop / Arcane Sanctum 的训练列表。
- Paladin 不受 Blacksmith 研究影响（近战武器/远程火药/Plating/Leather Armor 的 targetUnitType 不含 paladin）。
- Paladin 不受 Animal War Training 影响。
- Paladin 不改变任何现有能力；`priest_heal` 可按现有 ally + injured 规则治疗 Paladin，但不需要新增 Priest 逻辑。

## 3. Holy Light 英雄能力

### 3.1 数据定义

Holy Light 应作为 `ABILITIES` 新条目，复用现有 `AbilityDef` 结构：

| 字段 | 值 | 说明 |
| --- | --- | --- |
| key | `'holy_light'` | 唯一标识 |
| name | `'圣光术'` | 中文名 |
| ownerType | `'paladin'` | 所有者 |
| cost | `{ mana: 65 }` | 候选参考值，HERO2-SRC1 源校验后才能写入 GameData |
| cooldown | `5` | 候选参考值 |
| range | `8.0` | 候选参考值 |
| targetRule | `{ teams: 'ally', alive: true, excludeTypes: [], includeCondition: 'injured' }` | 友方受伤单位 |
| effectType | `'flatHeal'` | 复用现有 heal 效果类型 |
| effectValue | `200` | 候选参考值，等级 1 |
| duration | `0` | 即时 |
| stackingRule | `'none'` | 不叠加 |

### 3.2 复用现有模型

- **targetRule**：与 `priest_heal` 相同结构，复用 TargetRule 类型。
- **effectType**：`flatHeal` 已有 runtime 实现（priest_heal 通路）。
- **mana 系统**：Paladin 需新增 `maxMana` 和 `manaRegen`，候选参考值为 `maxMana: 255`、`manaRegen: 0.5`，复用 priest/sorceress 的 mana 管理逻辑；具体数值需源校验。
- **command-card**：Paladin 选中时显示「圣光术」按钮，复用现有能力按钮渲染。

### 3.3 英雄技能升级

- 等级 1：Holy Light 治疗 200，mana 消耗 65
- 等级 2：Holy Light 治疗 350，mana 消耗 65（本合同不实现等级 2/3）
- 等级 3：Holy Light 治疗 500，mana 消耗 65（本合同不实现等级 2/3）

本合同只定义等级 1 最小切片。等级 2/3 的数值升级和技能点分配机制留后续任务。

### 3.4 来源边界

- 本合同中的 Altar / Paladin / Holy Light 数值是候选参考值，不是已批准数据。
- 进入任何 `GameData.ts` 数据种子前，必须先做 `HERO2-SRC1 — Altar + Paladin + Holy Light source boundary`，明确采用来源、冲突样本和项目映射。
- 若 HERO2-SRC1 发现来源冲突，后续数据种子必须采用 source boundary 的结果，而不是本合同表格里的候选值。

## 4. 英雄复活机制最小合同

### 4.1 死亡处理

- 英雄 HP 降至 0 时不触发普通死亡逻辑（不清理单位、不播放死亡动画）。
- 英雄进入 `isDead = true` 状态，保留在场上（可能显示为倒地状态）。
- 死亡的英雄不攻击、不移动、不施法。

### 4.2 复活入口

- Altar 选中时，如果该玩家有死亡的英雄，命令卡显示「复活圣骑士」按钮。
- 复活费用 = `reviveCost`（约 60% 召唤费用）。
- 复活时间 = 约 50% 召唤时间。
- 复活后英雄 HP 满血、mana 满、保留等级和经验。

### 4.3 本合同不实现

- 复活 UI 动画
- 复活倒计时
- Town Hall / Keep / Castle 的备选复活入口
- 复活费用的百分比动态计算

## 5. 后续切片顺序

本合同是 HERO1，后续按以下顺序：

| 序号 | 任务 | 类型 | 说明 |
| --- | --- | --- | --- |
| HERO2-SRC1 | Altar + Paladin + Holy Light source boundary | SRC | 核对候选数值、来源层级和项目映射，不改生产代码 |
| HERO3 | Altar data seed | DATA | `GameData.ts` 新增 `altar_of_kings` BUILDINGS 条目 |
| HERO4 | Paladin data seed | DATA | `GameData.ts` 新增 `paladin` UNITS 条目 + `UnitDef` 扩展 |
| HERO5 | Holy Light data seed | DATA | `GameData.ts` 新增 `holy_light` ABILITIES 条目 |
| HERO6 | Altar summon/train runtime | IMPL | 命令卡召唤入口 + Paladin 生成 |
| HERO7 | Death/revive runtime | IMPL | 英雄死亡/复活逻辑 |
| HERO8 | XP/level minimal proof | PROOF | 经验获取和等级提升最小验证 |

每步需前一步 accepted 后才能开始。

## 6. 禁区

以下在本合同中**不打开**：

- 不实现 Archmage、Mountain King、Blood Mage
- 不实现物品/商店系统
- 不实现空军单位
- 不实现第二阵营
- 不实现多人
- 不实现公开发布
- 不导入 War3 官方素材
- 不修改现有单位/建筑/研究的数据或行为
- 不把 HUMAN-GAP1 的缺口盘点改写成英雄已实现

## 7. 验收条件

本合同验收需满足：

1. 合同文档存在且覆盖 Altar / Paladin / Holy Light / 复活 / 切片顺序 / 禁区。
2. 静态 proof 验证合同中的数值引用合理、数据字段与现有 `UnitDef`/`BuildingDef`/`AbilityDef` 兼容。
3. 不修改任何生产代码。
4. 不打开禁区范围。
