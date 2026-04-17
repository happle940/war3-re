# V9 HERO15-CLOSE1 Paladin 最小能力套件全局收口盘点

> 生成时间：2026-04-17 10:44:00 CST
> 任务编号：Task 253
> 本文档是 Paladin 最小能力套件的全局收口。不宣称完整英雄系统、完整人族或 V9 发布。

---

## 1. 证据链总览

 Paladin 最小能力套件从 HERO1 到 HERO14 历经 14 条连续分支，形成完整证据链：

| 分支 | 任务范围 | 关键产出 |
|------|----------|----------|
| HERO1 | 合同 | Altar + Paladin 召唤合同（`V9_HERO1_ALTAR_PALADIN_CONTRACT`） |
| HERO2 | 来源边界 | Altar + Paladin 来源值与项目映射（`V9_HERO2_ALTAR_PALADIN_SOURCE_BOUNDARY`） |
| HERO3 | 数据种子 | Altar 建筑数据（`V9_HERO3` 阶段） |
| HERO4 | 数据种子 | Paladin 单位数据（`V9_HERO4` 阶段） |
| HERO5 | 数据种子 | Holy Light 数据种子（`V9_HERO5` 阶段） |
| HERO6/6A/6B | 运行时 | Altar 建造 + Paladin 召唤运行时暴露（`V9_HERO6_ALTAR_RUNTIME_EXPOSURE_CONTRACT`） |
| HERO7 | 运行时 | Holy Light 治疗运行时（`V9_HERO7` 阶段） |
| HERO8 | 收口 | 最小英雄运行时收口（`V9_HERO8_MINIMAL_HERO_RUNTIME_CLOSURE`，15 项证明） |
| HERO9 | 死亡/复活 | 英雄死亡 + Altar 复活（`V9_HERO9_DEATH_REVIVE_CLOSURE`，11 项证明） |
| HERO10 | XP/升级 | 经验获取、等级提升、阈值计算（`V9_HERO10_XP_LEVELING_CLOSURE`，8 项证明） |
| HERO11 | 技能学习 | 技能点花费、Holy Light 学习入口（`V9_HERO11_HOLY_LIGHT_SKILL_LEARNING_CLOSURE`，17 项证明） |
| HERO12 | 神圣护盾 | Divine Shield 自施放 + 反馈（`V9_HERO12_DIVINE_SHIELD_CLOSURE`，35 项证明） |
| HERO13 | 虔诚光环 | Devotion Aura 被动光环 + 反馈（`V9_HERO13_DEVOTION_AURA_CLOSURE`，42 项证明） |
| HERO14 | 复活术 | Resurrection 主动施放 + 可见反馈（`V9_HERO14_RESURRECTION_CLOSURE`，34 项证明） |

---

## 2. 分支收口证明文件

| 分支 | 收口证明 | 测试数 |
|------|----------|--------|
| HERO8 | `tests/v9-hero8-minimal-hero-runtime-closure.spec.mjs` | 15 |
| HERO9 | `tests/v9-hero9-death-revive-closure.spec.mjs` | 11 |
| HERO10 | `tests/v9-hero10-xp-leveling-closure.spec.mjs` | 8 |
| HERO11 | `tests/v9-hero11-holy-light-skill-learning-closure.spec.mjs` | 17 |
| HERO12 | `tests/v9-hero12-divine-shield-closure.spec.mjs` | 35 |
| HERO13 | `tests/v9-hero13-devotion-aura-closure.spec.mjs` | 42 |
| HERO14 | `tests/v9-hero14-resurrection-closure.spec.mjs` | 34 |
| HERO15 | `tests/v9-hero15-paladin-minimal-kit-closure.spec.mjs` | 本证明 |

---

## 3. 玩家当前能做什么

### 3.1 建筑与召唤
- 建造 Altar of Kings
- 从 Altar 召唤一个 Paladin

### 3.2 英雄核心
- Paladin 获得击杀经验值，等级提升
- 等级提升时获得技能点
- 技能点用于学习 Paladin 能力（最多 3 个普通技能 + 1 个终极技能）
- 死亡后通过 Altar 复活队列复活（保留已学技能）

### 3.3 Holy Light（圣光术）
- 点选友方单位施放治疗
- 消耗法力，治疗量随等级增长
- 有冷却时间

### 3.4 Divine Shield（神圣护盾）
- 自施放无敌效果
- 持续时间随等级增长
- 有冷却时间
- 激活时单位属性面板和命令卡显示剩余秒数

### 3.5 Devotion Aura（虔诚光环）
- 被动：附近友方单位获得额外护甲
- 护甲加成随等级增长
- 光环范围内的友方单位属性面板显示护甲加成

### 3.6 Resurrection（复活术）
- 终极技能：英雄等级 6 可学习
- 无目标施放：消耗 200 法力，240 秒冷却
- 以 Paladin 为中心 9.0 半径内，按最早死亡顺序复活最多 6 个友方普通地面非英雄、非建筑死亡单位
- 可见反馈：单位属性面板显示等级、复活数量、冷却秒数；Paladin 上方浮动复活数量

---

## 4. 生产代码边界确认

| 文件 | 包含 | 不包含 |
|------|------|--------|
| `src/game/GameData.ts` | `HERO_ABILITY_LEVELS.holy_light`、`HERO_ABILITY_LEVELS.divine_shield`、`HERO_ABILITY_LEVELS.devotion_aura`、`HERO_ABILITY_LEVELS.resurrection`、Paladin 单位定义、Altar 建筑定义 | Archmage / Mountain King / Blood Mage 定义、`ABILITIES.resurrection` 条目 |
| `src/game/Game.ts` | Paladin 召唤、XP/升级、技能学习、Holy Light 治疗、Divine Shield 无敌、Devotion Aura 光环、Resurrection 施放、Altar 复活、死亡记录、可见反馈 | 其他三个英雄运行时、物品/商店/Tavern 系统 |
| `src/game/SimpleAI.ts` | 基础经济/建造/训练 AI；HERO16 后包含最小 Paladin AI 链路 | 其他英雄 AI、完整英雄战术、物品/商店/Tavern 策略 |

---

## 5. 仍然延后

以下内容不属于 Paladin 最小能力套件，不应被误宣称为已完成：

### 英雄
- 完整 AI 英雄策略 / 指挥 / 能力施放决策（HERO16 已覆盖最小 Paladin AI 链路，但不覆盖完整战术）
- Archmage 运行时
- Mountain King 运行时
- Blood Mage 运行时

### 系统
- 物品/背包系统
- 商店
- Tavern（中立英雄雇佣）
- 完整英雄 UI 美化

### 视觉/音频
- 图标、声音、粒子特效
- 新素材/资产

### 规则细节
- 来源精确 most-powerful 排序
- 尸体存在时间 / corpse decay timer
- 友方英雄尸体是否可复活

### 规模
- 空军
- 战役
- 第二种族
- 多人联机

### 里程碑
- 完整英雄系统
- 完整人族
- V9 发布

---

## 6. 合同声明

Paladin 最小能力套件收口不宣称以下任何一项：
- 完整英雄系统
- 完整人族
- V9 已发布
- 其他英雄已完成
- 完整 AI 英雄行为已完成（HERO16 仅覆盖最小 Paladin AI 链路）
- 物品/商店/Tavern 系统已完成
