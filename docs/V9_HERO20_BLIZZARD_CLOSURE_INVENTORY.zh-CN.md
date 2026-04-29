# V9 HERO20-CLOSE1 Blizzard 最小玩家侧分支收口盘点

> 生成时间：2026-04-18
> 任务编号：Task 285
> 本文档盘点 Blizzard 最小玩家侧分支的已接受证据链、当前能力、来源值和未完成边界。
> 本文档 **不** 声称"Blizzard 已完整实现"、"完整 Archmage"、"完整英雄系统"、"完整人族"或"V9 发布"。

---

## 1. 已接受证据链

| 任务 | 阶段 | 状态 | 产出 |
|------|------|------|------|
| Task279 | HERO20-CONTRACT1 Blizzard 分支合同 | accepted | 分支边界、序列、禁区 |
| Task280 | HERO20-SRC1 Blizzard 来源边界 | accepted | 来源层级、采用值、补丁历史 |
| Task281 | HERO20-DATA1 Blizzard 数据种子 | accepted | `HERO_ABILITY_LEVELS.blizzard` 三级数据 |
| Task282 | HERO20-IMPL1-CONTRACT 运行时合同 | accepted | 运行时行为合同、12 项 proof 清单 |
| Task283 | HERO20-IMPL1 最小运行时 | accepted | 学习、施放、通道、波次伤害、中断 |
| Task284 | HERO20-UX1 可见反馈 | accepted | 命令卡文案、禁用原因、AOE 环、HUD |

---

## 2. 当前玩家能力

玩家可以在运行时执行以下 Blizzard 操作：

| 能力 | 说明 |
|------|------|
| 训练 Archmage | 通过 Altar of Kings 训练 |
| 学习 Blizzard Lv1/Lv2/Lv3 | 英雄等级门槛 1/3/5，消耗技能点 |
| 命令卡显示 | 中文名称、法力消耗、射程、波次、冷却信息 |
| 禁用原因 | 已死亡、魔力不足、冷却中、正在引导、等级不足、无技能点 |
| 地面目标模式 | 进入/确认/右键取消/Esc 取消 |
| 扣除法力 | 施放时一次性扣除 75 法力 |
| 启动冷却 | 6 秒冷却 |
| 通道施法 | 持续 duration 秒，每波间隔 duration/waves 秒 |
| 波次伤害 | 每波对 AOE 半径内最多 5 个敌方单位造成伤害 |
| 建筑伤害 | 对建筑造成 50% 伤害 |
| 死亡中断 | Archmage 死亡后通道立即停止 |
| 移动/停止中断 | 玩家发出移动或停止命令时通道停止 |
| AOE 可见反馈 | 施放后蓝色 AOE 环指示器 + 受击闪白 + 冲击环 |
| HUD 显示 | 暴风雪等级、冷却倒计时、引导波次 |
| 与其他技能共存 | Water Elemental 和 Brilliance Aura 保持独立可见 |

---

## 3. 采用来源值

所有数值来自 `HERO_ABILITY_LEVELS.blizzard`（`src/game/GameData.ts`），运行时只读此数据源。

| 字段 | 等级 1 | 等级 2 | 等级 3 |
|------|--------|--------|--------|
| 法力消耗 (mana) | 75 | 75 | 75 |
| 冷却 (cooldown) | 6s | 6s | 6s |
| 射程 (range) | 8.0 | 8.0 | 8.0 |
| AOE 半径 (areaRadius) | 2.0 | 2.0 | 2.0 |
| 每波伤害 (effectValue) | 30 | 40 | 50 |
| 波数 (waves) | 6 | 8 | 10 |
| 总持续时间 (duration) | 6s | 8s | 10s |
| 英雄等级需求 (requiredHeroLevel) | 1 | 3 | 5 |
| 最大目标数 (maxTargets) | 5 | 5 | 5 |
| 建筑伤害倍率 (buildingDamageMultiplier) | 0.5 | 0.5 | 0.5 |

---

## 4. 生产边界验证

| 检查项 | 状态 |
|--------|------|
| `HERO_ABILITY_LEVELS.blizzard` 存在 | 通过 |
| `ABILITIES.blizzard` 不存在 | 通过 |
| `Game.ts` 包含 Blizzard 运行时和可见反馈 | 通过 |
| `Game.ts` 包含 `HERO_ABILITY_LEVELS.blizzard` 引用 | 通过 |
| `Game.ts` 不包含 `ABILITIES.blizzard` | 通过 |
| `SimpleAI.ts` 无 Archmage / Blizzard 策略 | 通过 |
| Mass Teleport 不存在 | 通过 |

---

## 5. Proof 覆盖

### 5.1 运行时 proof（Playwright，7/7 通过）

| 编号 | 测试 | 覆盖范围 |
|------|------|----------|
| BLZ-RT-1 | 学习 Lv1/Lv2/Lv3 | 英雄等级门槛、技能点消耗 |
| BLZ-RT-2 | 无效施放不变更状态 | 未学、低魔、冷却、死亡、超距 |
| BLZ-RT-3 | 成功施放读源数据 | 法力、冷却、波次、伤害、建筑倍率 |
| BLZ-RT-4 | 每波 maxTargets | 6 敌人仅 5 受伤 |
| BLZ-RT-5 | 死亡/停止/移动中断 | 三种中断均停止波次 |
| BLZ-RT-6 | 目标模式进入/取消 | 右键和 Esc 取消 |
| BLZ-RT-7 | 边界回归 | 无 ABILITIES.blizzard、无 AI、WE/BA 独立 |

### 5.2 可见反馈 proof（Playwright，8/8 通过）

| 编号 | 测试 | 覆盖范围 |
|------|------|----------|
| BLZ-UX-1 | HUD 显示等级 | 暴风雪 LvN |
| BLZ-UX-2 | 命令卡文案 | 名称、法力、射程、波次、冷却 |
| BLZ-UX-3 | 禁用原因 | 死亡、魔力、冷却、引导、等级、技能点 |
| BLZ-UX-4 | 目标模式提示 | 暴风雪提示、左键/右键/Esc |
| BLZ-UX-5 | AOE 环反馈 | 施放后蓝色环 + 命中 |
| BLZ-UX-6 | 反馈消失 | 引导结束/死亡中断/停止中断 |
| BLZ-UX-7 | HUD 冷却/引导 | 冷却倒计时、引导波数、其他技能共存 |
| BLZ-UX-8 | 边界回归 | 无 ABILITIES/AI/Mass Teleport，WE/BA 独立 |

---

## 6. 明确未完成 / 仍然开放

| 项目 | 状态 | 说明 |
|------|------|------|
| Mass Teleport | 未开始 | 需独立分支 |
| Archmage AI 策略 | 未开始 | SimpleAI 无 Blizzard 策略 |
| 官方/终版素材 | 未开始 | 模型、图标、粒子、声音 |
| 完整中断系统 | 未开始 | 等项目有硬控机制后补充 |
| 友军伤害策略 | 延后 | IMPL1 选择不影响友军 |
| 空中单位策略 | 延后 | 项目当前无空军 |
| 多 Blizzard 叠加策略 | 延后 | 多 Archmage 同时施放 |
| 目标选择优先级 | 延后 | 超过 maxTargets 时的选择规则 |
| Mountain King | 未开始 | 需独立英雄分支 |
| Blood Mage | 未开始 | 需独立英雄分支 |
| 物品系统 / 商店 / Tavern | 未开始 | 不在本分支 |
| 完整 Archmage | 未完成 | 缺 Mass Teleport、终版素材 |
| 完整英雄系统 | 未完成 | 缺其他英雄 |
| 完整人族 | 未完成 | 仍缺其他英雄分支、若干系统/素材/AI/收口证明 |
| V9 发布 | 未发布 | 非发布状态 |

---

## 7. 非声称

本文档 **不** 声称：

- 完整 Archmage 已实现（缺 Mass Teleport、终版素材）。
- 完整英雄系统已实现（缺 Mountain King、Blood Mage 等）。
- 完整人族已实现。
- V9 已发布。
- Blizzard 有终版视觉/音频效果。
- AI 能自动施放 Blizzard。
