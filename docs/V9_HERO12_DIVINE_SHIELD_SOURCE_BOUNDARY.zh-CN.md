# V9 HERO12-SRC1 Divine Shield 等级 / 行为来源边界

> 生成时间：2026-04-16
> 前置：HERO12-CONTRACT1 (Task 231) 已 accepted。
> 范围：Divine Shield 等级 1/2/3 数值和行为的来源边界。**不** 修改生产代码。
> 本文档 **不** 声称"完整英雄系统"、"完整人族"或"V9 发布"。

---

## 1. 来源层级

| 层级 | 来源 | 角色 |
|------|------|------|
| 主来源 | Blizzard Classic Battle.net Paladin page (`https://classic.battle.net/war3/human/units/paladin.shtml`) | Divine Shield 等级数值的采纳依据 |
| 交叉检查 | Liquipedia Warcraft Wiki — Paladin (`https://liquipedia.net/warcraft/Paladin`) | 社区维护的数值交叉验证 |
| 冲突处理 | 以主来源为准；冲突时 Codex 可显式覆盖 | — |

---

## 2. Divine Shield 等级数值（来源边界）

### 2.1 采纳值

| 属性 | 等级 1 | 等级 2 | 等级 3 |
|------|--------|--------|--------|
| 持续时间 (Duration) | 15s | 30s | 45s |
| 冷却时间 (Cooldown) | 35s | 50s | 65s |
| 法力消耗 (Mana Cost) | 25 | 25 | 25 |
| 射程 (Range) | N/A | N/A | N/A |
| 影响范围 (Area) | 自身 (Personal) | 自身 (Personal) | 自身 (Personal) |
| 允许目标 (Allowed Target) | 自身 (Self) | 自身 (Self) | 自身 (Self) |
| 效果 (Effect) | 无敌 (Invulnerability) | 无敌 (Invulnerability) | 无敌 (Invulnerability) |
| 所需英雄等级 (Required Hero Level) | 1 | 3 | 5 |

### 2.2 行为规则

- Divine Shield 是无敌法术：敌人在持续时间内无法对 Paladin 造成伤害。
- Divine Shield **不可**被主动取消（不能手动关闭）。
- 持续时间到期后 Paladin 恢复正常受伤状态。
- 法力消耗在所有等级保持 25 不变。
- 持续时间和冷却时间随等级增加。

### 2.3 与当前运行时的兼容性

- 当前项目 `ABILITIES` 中无 Divine Shield 定义。
- `HERO_ABILITY_LEVELS` 中无 Divine Shield 条目。
- `abilityLevels` 字段已支持任意能力名称（`Record<string, number>`），可直接扩展。
- SRC1 不修改任何运行时代码。

---

## 3. 项目映射（HERO12-DATA1 指导）

### 3.1 数据形状建议

```
HERO_ABILITY_LEVELS.divine_shield = {
  maxLevel: 3,
  levels: [
    { level: 1, duration: 15, cooldown: 35, mana: 25, requiredHeroLevel: 1 },
    { level: 2, duration: 30, cooldown: 50, mana: 25, requiredHeroLevel: 3 },
    { level: 3, duration: 45, cooldown: 65, mana: 25, requiredHeroLevel: 5 },
  ],
}
```

### 3.2 运行时映射要点

- `range` 应使用 `null` 或等效的自身施放标记，而非世界空间射程数值。
- 目标规则为自身 (Self-only)。
- 效果为临时无敌状态（`invulnerability`），不是护甲加成、治疗、闪避、伤害吸收、光环或眩晕。
- 冷却时间和持续时间以秒为单位。
- 施放后设置 `divineShieldUntil = gameTime + duration`，到期自动清除。
- 冷却使用 `divineShieldCooldownUntil = gameTime + cooldown`。

### 3.3 约束

- Divine Shield 等级数据在 DATA1/IMPL1 之前不进入运行时。
- 不修改 `GameData.ts`。
- 当前 HERO11 运行时是兼容基线。

---

## 4. 下一任务

`HERO12-DATA1` — 将来源边界中的 Divine Shield 等级数据落地到 `GameData.ts`。

---

## 5. 明确延后

| 项目 | 延后原因 |
|------|---------|
| Devotion Aura（虔诚光环） | 需要光环系统 |
| Resurrection（复活终极技能） | 需要终极技能系统 |
| Archmage / Mountain King / Blood Mage | 需要独立英雄实现 |
| AI 英雄策略 | 需要 AI 扩展 |
| 完整英雄头像面板 | 需要完整英雄 UI |
| 物品 / 背包 | 不在范围内 |
| 商店 / 酒馆 | 不在范围内 |
| 野怪 XP / 敌方英雄 XP | 不在范围内 |
| 多英雄 XP 分配 | 不在范围内 |
| 空军 / 第二种族 / 多人联机 | 不在范围内 |
| 公开发布 / 新视觉素材 | 不在范围内 |
