# V9 HERO14-SRC1 Resurrection 来源边界

> 生成时间：2026-04-16
> 前置：HERO14-CONTRACT1 (Task 245) 已 accepted。Resurrection 分支合同已定义。
> 任务编号：Task 246
> 本文档 **不** 声称"完整圣骑士"、"完整英雄系统"、"完整人族"或"V9 发布"。

---

## 1. 来源层级

| 优先级 | 来源 | URL | 角色 |
|--------|------|-----|------|
| 1（主源） | Blizzard Classic Battle.net | `https://classic.battle.net/war3/human/units/paladin.shtml` | 数值和行为的唯一权威来源 |
| 2（交叉核对） | Liquipedia | `https://liquipedia.net/warcraft/Resurrection` | 仅交叉核对，不得覆盖主源 |

主源为 Blizzard Classic Battle.net Paladin 页面 Resurrection 部分。Liquipedia 仅用于交叉核对版本历史，不能覆盖主源数值。

本来源边界引用已 accepted 基线：
- **HERO9** — Paladin 死亡/复活运行时
- **HERO10** — XP/升级/技能点运行时
- **HERO11** — Holy Light 学习/施放运行时
- **HERO12** — Divine Shield 学习/自我施放/反馈运行时（已收口）
- **HERO13** — Devotion Aura 被动光环运行时（已收口）

---

## 2. 采纳值

以下数值来自主源（Blizzard Classic Battle.net）Resurrection 表格：

| 字段 | 主源值 | 备注 |
|------|--------|------|
| Level | N/A（仅 1 级，终极技能） | 终极技能，只有 1 个等级 |
| Duration | 不适用 | 复活是即时效果，无持续 |
| Cooldown | 240 秒 | |
| Mana Cost | 200 | 主源值 200；Liquipedia 记录 1.32.6 版本改为 150 |
| Range | 40 | 施法距离 |
| Area of Effect | 90 | 以 Paladin 为中心的范围 |
| Allowed Targets | Ground, Dead, Friend | 仅地面友方死亡单位 |
| Effect | Resurrects up to 6 Units | 最多复活 6 个单位 |
| Hero Level Req | 6 | 需要英雄等级 6 |
| Cast Type | Active, No Target | 主动施放，无需点选目标 |

### 2.1 主源描述原文

> Brings back to life the corpses of 6 friendly nearby units. The spell will choose the most powerful corpses to resurrect if there are more than 6.

### 2.2 数值歧义标记

| 字段 | 状态 | 说明 |
|------|------|------|
| Mana Cost | **source-ambiguous** | 主源记录 200，Liquipedia 记录 1.32.6 版本改为 150。主源值 200 为权威；若采用 1.32.6 修正值 150 需另开来源边界 |
| Cooldown | source-confirmed | 主源 240 秒，无歧义 |
| Range | source-confirmed | 主源 40，无歧义 |
| AoE | source-confirmed | 主源 90，无歧义 |
| Max Units | source-confirmed | 主源 6，无歧义 |
| Resurrected HP/Mana | **source-unknown** | 主源未明确复活单位的 HP/魔力恢复量；来源边界标记为 `source-unknown`，延后至运行时通过测试契约确定 |
| Corpse Decay Time | **source-unknown** | 主源未明确尸体存在时间限制；标记为 `source-unknown` |
| "Most Powerful" 排序规则 | **source-ambiguous** | 主源说"choose the most powerful corpses"但未定义"most powerful"的具体标准（按造价？按人口？按等级？）；标记为 `source-ambiguous`，运行时可采用简单启发式（如按造价降序），不得宣称复刻精确原版排序 |

---

## 3. 行为规则

### 3.1 主源确认的行为

- Resurrection 是 **主动施放** 的终极技能，不需要点选目标（No Target cast）。
- 复活 Paladin 周围 90 范围内最多 **6 个** 友方地面死亡单位。
- 如果范围内超过 6 个尸体，选择"最强"的 6 个。
- 允许使用 Resurrection 超过人口上限。
- 冷却 240 秒，法力消耗 200。

### 3.2 与 HERO9 Altar Revive 的关系

- **HERO9 Altar Revive**：复活 **Paladin 自身**，通过 Altar of Kings 触发，是英雄专属复活机制。
- **HERO14 Resurrection**：Paladin 终极技能，复活 **周围友方死亡地面单位**（非 Paladin 自身）。
- 主源 `Allowed Targets` 为 `Ground, Dead, Friend`，不包含 `Self`，因此 Resurrection **不能** 复活 Paladin 自身。
- 死亡的 Paladin 可通过 Altar revive 复活（HERO9 机制不变），但不能通过 Resurrection 复活自己。
- 友方英雄是否可被 Resurrection 复活：主源 `Allowed Targets` 为 `Ground, Dead, Friend`，不排除 Hero 类型，但 `Ground` 排除 Air。是否包含友方英雄尸体标记为 **source-ambiguous**（主源未明确区分 Hero/Unit 尸体），运行时不得宣称完整复刻。

### 3.3 明确排除的替代效果

来源边界确认 Resurrection **仅** 实现复活效果：
- **不** 包含治疗
- **不** 包含伤害吸收
- **不** 包含无敌
- **不** 包含攻击力加成
- **不** 包含魔力恢复（除非运行时测试契约另行确定）

---

## 4. 项目映射

### 4.1 范围映射

| 主源值 | 映射规则 | 项目值 |
|--------|---------|--------|
| AoE 90 | 80 War3 单位 = 8.0 项目单位（已接受 HERO 范围比例） | 9.0 项目单位 |
| Range 40 | 同比例：40 / 10 = 4.0 项目单位 | 4.0 项目单位 |

### 4.2 复活单位数

主源值 6 直接映射为项目值 6（无缩放）。

### 4.3 目标过滤器映射

| 主源目标 | 项目映射 |
|---------|---------|
| Ground | 非空中单位；建筑不纳入首轮实现，原因是主源效果描述为尸体/死亡单位，当前项目建筑没有普通单位尸体记录 |
| Dead | 已死亡的单位记录/尸体 |
| Friend | 友方阵营（team === Paladin.team） |
| 不含 Self | Paladin 自身不在目标集中 |

### 4.4 尸体/死亡记录规则

主源使用"corpses"概念。当前项目无独立尸体系统，使用 `isDead` / `hp <= 0` 的单位记录。
运行时映射：
- 死亡友方地面单位记录 = 项目中的 `isDead === true && !isAir && team === paladin.team` 的单位
- 不得把建筑加入首轮受影响目标（当前项目没有建筑尸体记录；如果后续来源确认结构体特殊规则，另开任务）
- 不得把空中单位加入受影响目标（主源 `Ground` 排除 Air）

---

## 5. 不修改生产代码

本来源边界文档 **不** 修改任何生产代码文件：
- `GameData.ts` — 不添加 `HERO_ABILITY_LEVELS.resurrection`
- `Game.ts` — 不添加 `castResurrection`、Resurrection 命令按钮或 HUD 文案
- `SimpleAI.ts` — 不添加 AI Resurrection 行为
- CSS / 资产 — 不修改

---

## 6. 明确延后

- Resurrection 运行时实现
- `HERO_ABILITY_LEVELS.resurrection` 数据种子
- Resurrection 命令卡按钮
- Resurrection HUD / 状态文案
- 复活单位 HP/魔力恢复量（source-unknown）
- "Most powerful" 排序规则的精确复刻
- 友方英雄尸体是否可被复活（source-ambiguous）
- 尸体存在时间限制（source-unknown）
- 视觉特效（粒子、图标、声音）
- 资产（美术资源）
- AI 英雄策略
- 其他 Human 英雄（Archmage、Mountain King、Blood Mage）
- 物品系统
- 商店
- Tavern
- 第二种族
- 空军（已在目标过滤器排除）
- 多人联机
- 完整圣骑士
- 完整英雄系统
- 完整人族
- V9 发布

---

## 7. 合同声明

本来源边界 **仅** 绑定 Resurrection 的来源数值、行为规则和项目映射。

本来源边界 **不** 声称：
- "完整圣骑士"
- "完整英雄系统"
- "完整人族"
- "V9 发布"
- 已确定复活单位 HP/魔力恢复量
- 已确定"most powerful"排序规则的精确实现
- 已确定友方英雄尸体是否可被复活
- 已修改任何生产代码

---

## 8. 当前阶段更新（HERO14-IMPL1C）

Task250 已按本来源边界接入最小施放运行时：

- 使用 `HERO_ABILITY_LEVELS.resurrection` 的 `mana`、`cooldown`、`areaRadius`、`maxTargets`。
- 不添加 `ABILITIES.resurrection`。
- 使用 `deadUnitRecords` 作为项目内尸体记录底座。
- 只复活同阵营、普通单位、非英雄、非建筑、在作用半径内的记录。
- `source-unknown` 的复活 HP / mana 采用项目 fallback：通过 `spawnUnit` 默认状态生成。
- "most powerful" 精确排序仍不声称复刻；当前采用 `diedAt` 最早优先的确定性顺序。

---

## 9. 当前阶段更新（HERO14-UX1）

Task251 已在不改变来源数值和目标规则的前提下接入最小可见反馈：

- 选中 Paladin 时显示 `复活术 Lv1`。
- 施放成功后显示 `刚复活 N 个单位`。
- 冷却中显示 `复活冷却 Ns` 和命令按钮 `冷却中 N.Ns`。
- 仍不添加 `ABILITIES.resurrection`、粒子、声音、图标、素材或 AI 行为。
- `source-unknown` 的尸体存在时间、友方英雄尸体和 "most powerful" 精确排序仍保持延后。
