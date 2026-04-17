# V9 HERO12-IMPL1B Divine Shield 自我施放运行时

> 生成时间：2026-04-16
> 前置：Task 234 (HERO12-IMPL1A) 已 accepted。Divine Shield 学习入口已实现。
> 范围：实现 Paladin 对自身施放 Divine Shield，包含法力消耗、冷却、临时无敌状态和伤害防止。
> 本文档 **不** 声称"完整英雄系统"、"完整人族"或"V9 发布"。

---

## 1. 运行时变更

### 1.1 Unit 接口扩展

- 新增 `divineShieldUntil: number` — 无敌状态过期 gameTime 阈值；0 表示非活跃。
- 新增 `divineShieldCooldownUntil: number` — 冷却过期 gameTime 阈值；0 表示可施放。

### 1.2 castDivineShield 方法

- 前置条件：`abilityLevels.divine_shield >= 1`、Paladin 存活、法力 >= 25、冷却已过。
- 施放时消耗 `levelData.mana`（始终 25），设置 `divineShieldUntil = gameTime + levelData.duration`，设置 `divineShieldCooldownUntil = gameTime + levelData.cooldown`。
- 等级 1：持续 15s，冷却 35s。等级 2：持续 30s，冷却 50s。等级 3：持续 45s，冷却 65s。
- 返回 `true` 表示成功施放，`false` 表示条件不满足。

### 1.3 dealDamage 修改

- 在 `dealDamage` 顶部增加 `target.divineShieldUntil > this.gameTime` 检查。
- 若目标处于 Divine Shield 活跃状态，直接 `return`，伤害为 0。
- 其他单位不受影响，正常受到伤害。

### 1.4 命令卡施放按钮

- 新增「神圣护盾 (LvN)」施放按钮（与学习按钮分开）。
- 施放按钮条件：`abilityLevels.divine_shield >= 1`。
- 禁用原因显示：生效中 / 冷却中 Xs / 魔力不足。
- 施放按钮点击调用 `castDivineShield(primary)`。

### 1.5 复活重置

- Paladin 复活时，`divineShieldUntil` 和 `divineShieldCooldownUntil` 重置为 0。
- `abilityLevels` 保持不变（已通过 IMPL1A 实现）。

### 1.6 未实现

- **无** Divine Shield 手动取消机制（不可取消）。
- **无** 视觉效果或状态图标。
- **无** AI 使用 Divine Shield。
- **无** Devotion Aura、Resurrection 或其他技能。
- **无** ABILITIES.divine_shield 运行时条目。

---

## 2. 数据来源

所有数值来自 `HERO_ABILITY_LEVELS.divine_shield`（Task 233 DATA1 已种子）。

| 等级 | 持续时间 | 冷却时间 | 法力消耗 | 所需英雄等级 |
|------|---------|---------|---------|------------|
| 1    | 15s     | 35s     | 25      | 1          |
| 2    | 30s     | 50s     | 25      | 3          |
| 3    | 45s     | 65s     | 25      | 5          |

---

## 3. 回归确认

| 系统 | 回归状态 |
|------|---------|
| HERO7 圣光施放 | 不变，castHolyLight 和学习/施放按钮不受影响 |
| HERO9 死亡/复活 | `abilityLevels` 保留；DS 状态和冷却在复活时重置 |
| HERO10 XP/升级 | 不变 |
| HERO11 Holy Light 学习/施放 | 不变，学习按钮和施放按钮不受影响 |
| HERO12-IMPL1A DS 学习入口 | 不变，学习按钮和 HUD 显示不受影响 |

---

## 4. 明确延后

| 项目 | 延后原因 |
|------|---------|
| Divine Shield 视觉效果 | 需要后续任务 |
| 状态栏图标 | 需要后续任务 |
| AI 使用 Divine Shield | 需要 AI 策略任务 |
| Devotion Aura / Resurrection | 需要独立实现 |
| ABILITIES.divine_shield | 不需要；继续使用 HERO_ABILITY_LEVELS |
| 其他英雄 | 不在范围内 |
| 完整英雄系统 / 完整人族 / V9 发布 | 不在范围内 |

---

## 5. 合同声明

本文档 **仅** 定义 Divine Shield 自我施放的最小运行时。

本运行时 **不** 声称：
- "完整英雄系统"
- "完整人族"
- "V9 发布"
- 已实现 Divine Shield 视觉效果或 AI 使用
- 已添加 ABILITIES.divine_shield
