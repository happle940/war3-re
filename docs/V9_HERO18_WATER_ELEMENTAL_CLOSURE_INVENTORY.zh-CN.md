# V9 HERO18-CLOSE1 Water Elemental 分支收口盘点

> 生成时间：2026-04-18
> 前置证据链：Task265 (CONTRACT1) → Task266 (DATA1) → Task267 (MODEL1) → Task268 (IMPL1-CONTRACT) → Task269 (IMPL1) → Task270 (UX1) 全部 accepted。
> 本文档不修改任何生产代码。
> 本文档 **不** 声称"Water Elemental 完成"、"完整 Archmage"、"完整英雄系统"、"完整人族"或"V9 发布"。

---

## 1. 已 accepted 证据链

| 任务 | 阶段 | 关键产出 | 状态 |
|------|------|---------|------|
| Task265 | HERO18-CONTRACT1 | Water Elemental 分支边界、顺序、禁区 | accepted |
| Task266 | HERO18-DATA1 | `WATER_ELEMENTAL_SUMMON_LEVELS` source-only 数据种子落地 | accepted |
| Task267 | HERO18-MODEL1 | 数据-模型桥接合同，记录未解决决策清单 | accepted |
| Task268 | HERO18-IMPL1-CONTRACT | 选择路径 B（专用召唤运行时构造），定义运行时行为合同 | accepted |
| Task269 | HERO18-IMPL1 | 最小召唤运行时：学习、施放、扣魔、冷却、生成、消散、失败路径、死亡记录边界 | accepted |
| Task270 | HERO18-UX1 | 可见反馈：已学等级、施放状态、魔力/冷却原因、目标模式提示、召唤物剩余时间 | accepted |

---

## 2. 当前玩家可用能力

以下能力已由 Task265-270 工程证据落地，玩家可体验：

1. **训练 Archmage**：在 Altar of Kings 召唤 Archmage（Task263/264），具有英雄唯一性和 mana 初始化。
2. **学习 Water Elemental**：Archmage 命令卡在等级 1/3/5 可分别学习 Lv1/Lv2/Lv3，消耗技能点，门槛来自 `WATER_ELEMENTAL_SUMMON_LEVELS.requiredHeroLevel`。
3. **施放 Water Elemental**：已学习时，命令卡显示施放按钮（含 mana 和持续时间信息），点击进入地面目标选择模式。
4. **扣魔和冷却**：施放扣 125 mana，启动 20 秒 cooldown，均从 `WATER_ELEMENTAL_SUMMON_LEVELS` 读取。
5. **生成可控 Water Elemental**：在目标位置生成水元素，属性匹配当前等级来源确认值（HP、攻击力、射程、护甲、速度），属于施放者阵营，可被玩家选择和控制。
6. **HUD 反馈**：选中 Archmage 时显示已学水元素等级和冷却倒计时；命令卡显示魔力不足/冷却中原因；选中水元素时显示战斗属性和剩余存活时间。
7. **目标模式提示**：进入水元素放置时显示"召唤水元素 — 左键点击目标位置，右键/Esc取消"，取消后提示消失。
8. **定时消散**：水元素 60 秒后自动消散并从单位列表移除。
9. **死亡记录边界**：水元素被击杀或消散均不进入 `deadUnitRecords`，Paladin Resurrection 不影响水元素。

---

## 3. 生产代码当前状态

### 3.1 `GameData.ts`

- 有 `WATER_ELEMENTAL_SUMMON_LEVELS`（source-only，3 个等级）。
- 无 `UNITS.water_elemental`。
- 无 `ABILITIES.water_elemental`。
- 无 `HERO_ABILITY_LEVELS.water_elemental`。

### 3.2 `Game.ts`

有 Water Elemental 最小运行时和 UX 反馈：

- `castSummonWaterElemental()` — 召唤运行时（mana 扣费、cooldown、目标验证、单位生成、定时消散）。
- `enterWaterElementalTargetMode()` / `handleWaterElementalTargetClick()` — 地面目标选择。
- 命令卡学习按钮（`学习水元素 (LvN)`）和施放按钮（`召唤水元素 (LvN)`）。
- 选中 Archmage HUD：已学等级 `水元素 LvN`、冷却倒计时 `水元素冷却 Ns`。
- 选中 Water Elemental HUD：名称"水元素"、标签"召唤物"、战斗属性（攻击/护甲/速度/射程/类型）、剩余时间 `剩余 Ns` / `消散中`。
- `Unit` 接口字段：`waterElementalCooldownUntil`、`summonExpireAt`。

无以下内容：

- Brilliance Aura 运行时。
- Blizzard 运行时。
- Mass Teleport 运行时。
- Archmage AI 策略。
- `UNITS.water_elemental` / `ABILITIES.water_elemental` / `HERO_ABILITY_LEVELS.water_elemental` 创建。

### 3.3 `SimpleAI.ts`

- 无 Archmage 策略。
- 无 Water Elemental 施法逻辑。

### 3.4 `UnitVisualFactory.ts`

- 未修改。无 Water Elemental 专属视觉。

---

## 4. 工程证据清单

| 证据类型 | 文件 | 覆盖范围 |
|---------|------|---------|
| 数据种子 | `src/game/GameData.ts` (`WATER_ELEMENTAL_SUMMON_LEVELS`) | 3 级来源确认值 |
| 运行时实现 | `src/game/Game.ts` | 学习、施放、扣魔、冷却、生成、消散、反馈 |
| 运行时 proof | `tests/v9-hero18-water-elemental-runtime.spec.ts` | 7 项 runtime 测试（WE-RT-1 至 WE-RT-7） |
| 反馈 proof | `tests/v9-hero18-water-elemental-visible-feedback.spec.ts` | 7 项反馈测试（UX1-1 至 UX1-7） |
| 合同文档 | `docs/V9_HERO18_WATER_ELEMENTAL_BRANCH_CONTRACT.zh-CN.md` | 分支边界 |
| 数据种子文档 | `docs/V9_HERO18_WATER_ELEMENTAL_DATA_SEED.zh-CN.md` | 数据来源 |
| 桥接合同 | `docs/V9_HERO18_WATER_ELEMENTAL_MODEL_BRIDGE.zh-CN.md` | 模型决策 |
| 运行时合同 | `docs/V9_HERO18_WATER_ELEMENTAL_IMPL_CONTRACT.zh-CN.md` | 运行时行为合同 |
| IMPL1 验收清单 | `docs/V9_HERO18_RUNTIME_ACCEPTANCE_CHECKLIST.zh-CN.md` | IMPL1 验收标准 |
| UX1 验收清单 | `docs/V9_HERO18_UX1_ACCEPTANCE_CHECKLIST.zh-CN.md` | UX1 验收标准 |
| 收口盘点 | 本文档 | 收口汇总 |

---

## 5. 项目本地默认值（非来源确认）

以下值由 Task268 合同记录为项目本地默认，不是 War3 来源确认值：

| 名称 | 值 | 用途 |
|------|-----|------|
| `WE_DEFAULT_SIGHT_RANGE` | 8.0 | 视野范围 |
| `WE_DEFAULT_ATTACK_COOLDOWN` | 1.5s | 攻击间隔 |
| `WE_DEFAULT_SELECTION_RADIUS` | 0.8 | 选择半径 |
| `WE_COLLISION_MODE` | `ordinary_unit` | 碰撞处理 |
| `WE_DEFAULT_SUPPLY` | 0 | 召唤单位人口 |
| `WE_CAST_RANGE` | 8.0 | 施法范围 |

如果后续来源确认，应以来源值替换。

---

## 6. 已解决决策

| 决策 | 结论 | 任务 |
|------|------|------|
| 桥接路径 | 路径 B（专用召唤运行时构造） | Task268 |
| 活跃召唤上限 | 不实施全局上限 | Task268 |
| deadUnitRecords | 水元素死亡/消散不进入，不可被 Resurrection 复活 | Task268 |
| 目标位置验证 | 地面位置，需可行走，需在施法范围内 | Task268 |
| 归属 | 水元素属于召唤者玩家 | Task268 |
| 清理生命周期 | duration 秒后自动消散移除 | Task268 |
| 命令卡学习 | 条件：有技能点 + 英雄等级达标，消耗 1 技能点 | Task268 |
| 冷却/mana 时机 | 施放时立即扣除/开始 | Task268 |

---

## 7. 明确未完成 / 仍然开放

以下内容 **未** 由 Task265-270 实现，需要后续独立任务：

### 7.1 Archmage 其他能力

| 能力 | 状态 |
|------|------|
| Brilliance Aura（辉煌光环） | 未开始，需独立分支 |
| Blizzard（暴风雪） | 未开始，需独立分支 |
| Mass Teleport（群体传送） | 未开始，需独立分支 |

### 7.2 AI 和策略

| 项目 | 状态 |
|------|------|
| Archmage AI 施法策略 | SimpleAI 无 Archmage 策略 |
| Water Elemental 自动施放 | 未实现 |

### 7.3 视觉和音频

| 项目 | 状态 |
|------|------|
| Water Elemental 模型 | 使用通用问号头像 |
| Archmage 模型 | 使用通用问号头像 |
| 图标 | 无专属图标 |
| 粒子效果 | 无 |
| 声音效果 | 无 |
| 消散动画 | 无 |

### 7.4 其他英雄

| 英雄 | 状态 |
|------|------|
| Mountain King（山丘之王） | 未开始 |
| Blood Mage（血法师） | 未开始 |

### 7.5 系统

| 系统 | 状态 |
|------|------|
| 物品系统 | 未开始 |
| 商店 | 未开始 |
| Tavern（酒馆） | 未开始 |
| 完整英雄系统 | 未完成 |
| 完整人族 | 未完成 |
| V9 发布 | 未发布 |

---

## 8. 收口声明

本文档确认：

1. Water Elemental 最小玩家侧召唤分支已由 Task265-270 工程证据落地。
2. 玩家可训练 Archmage、学习 Water Elemental、施放召唤、看到反馈、水元素按时消散。
3. `GameData.ts` 仍为 source-only 数据种子，无 `UNITS.water_elemental` 等运行时条目。
4. `SimpleAI.ts` 仍无 Archmage 策略。
5. Brilliance Aura、Blizzard、Mass Teleport、Archmage AI、素材、Mountain King、Blood Mage、物品/商店/Tavern、完整英雄系统、完整人族和 V9 发布均未开始。
6. 本文档 **不** 声称"Water Elemental 完成"、"完整 Archmage"、"完整英雄系统"、"完整人族"或"V9 发布"。
