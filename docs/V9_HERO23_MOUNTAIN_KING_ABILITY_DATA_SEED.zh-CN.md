# V9 HERO23-DATA2 Mountain King 能力数据种子

> 任务编号：Task 307
> 生成时间：2026-04-18
> 前置：Task306 (HERO23-SKILL1) 已 accepted。技能学习合同已定义四能力学习形状和实施序列。
> 范围：仅将 Mountain King 四个能力的 `HERO_ABILITY_LEVELS` 和 `ABILITIES` 条目以 source-only 形式落地到 `GameData.ts`。不暴露学习按钮，不实现运行时行为。
> 本文档 **不** 声称"Mountain King 能力已可使用"、"完整英雄系统"、"完整人族"、"完整 AI"或"V9 发布"。

---

## 1. 数据种子内容

### 1.1 `HeroAbilityLevelDef` 新增可选字段

为支持 Mountain King 四能力的源数据载体，新增以下可选字段：

| 字段 | 类型 | 使用能力 | 说明 |
|------|------|---------|------|
| `stunDuration` | `number?` | Storm Bolt, Bash | 普通单位眩晕持续时间（秒） |
| `heroStunDuration` | `number?` | Storm Bolt, Bash | 英雄目标眩晕持续时间（秒） |
| `triggerChance` | `number?` | Bash | 被动触发概率（0-1） |
| `bonusDamage` | `number?` | Bash | 额外伤害值 |
| `hpBonus` | `number?` | Avatar | 临时 HP 加成 |
| `damageBonus` | `number?` | Avatar | 临时攻击伤害加成 |
| `heroDuration` | `number?` | Thunder Clap | 英雄目标减益独立持续时间（秒） |
| `speedMultiplier` | `number?` | Thunder Clap | 移动速度倍率；0.5 表示 50% slow |
| `spellImmunity` | `boolean?` | Avatar | 法术免疫来源标记 |

所有新增字段均为可选源数据载体，不要求运行时消费者。

### 1.2 已添加到 `HERO_ABILITY_LEVELS` 的条目

#### Storm Bolt（风暴之锤）

```
storm_bolt: {
  maxLevel: 3,
  levels: [
    { level: 1, effectValue: 100, mana: 75, cooldown: 9, range: 6.0, requiredHeroLevel: 1, stunDuration: 5, heroStunDuration: 3 },
    { level: 2, effectValue: 225, mana: 75, cooldown: 9, range: 6.0, requiredHeroLevel: 3, stunDuration: 5, heroStunDuration: 3 },
    { level: 3, effectValue: 350, mana: 75, cooldown: 9, range: 6.0, requiredHeroLevel: 5, stunDuration: 5, heroStunDuration: 3 },
  ],
}
```

#### Thunder Clap（雷霆一击）

```
thunder_clap: {
  maxLevel: 3,
  levels: [
    { level: 1, effectValue: 60, mana: 90, cooldown: 6, range: 0, requiredHeroLevel: 1, areaRadius: 2.5, duration: 5, heroDuration: 3, speedMultiplier: 0.5 },
    { level: 2, effectValue: 100, mana: 90, cooldown: 6, range: 0, requiredHeroLevel: 3, areaRadius: 3.0, duration: 5, heroDuration: 3, speedMultiplier: 0.5 },
    { level: 3, effectValue: 140, mana: 90, cooldown: 6, range: 0, requiredHeroLevel: 5, areaRadius: 3.5, duration: 5, heroDuration: 3, speedMultiplier: 0.5 },
  ],
}
```

#### Bash（猛击）

```
bash: {
  maxLevel: 3,
  levels: [
    { level: 1, mana: 0, cooldown: 0, range: 0, requiredHeroLevel: 1, triggerChance: 0.20, bonusDamage: 25, stunDuration: 2, heroStunDuration: 1 },
    { level: 2, mana: 0, cooldown: 0, range: 0, requiredHeroLevel: 3, triggerChance: 0.30, bonusDamage: 25, stunDuration: 2, heroStunDuration: 1 },
    { level: 3, mana: 0, cooldown: 0, range: 0, requiredHeroLevel: 5, triggerChance: 0.40, bonusDamage: 25, stunDuration: 2, heroStunDuration: 1 },
  ],
}
```

#### Avatar（化身）

```
avatar: {
  maxLevel: 1,
  levels: [
    { level: 1, mana: 150, cooldown: 180, range: 0, requiredHeroLevel: 6, duration: 60, armorBonus: 5, hpBonus: 500, damageBonus: 20, spellImmunity: true },
  ],
}
```

### 1.3 已添加到 `ABILITIES` 的条目

| 能力 | key | name | ownerType | mana | cooldown | range |
|------|-----|------|-----------|------|----------|-------|
| Storm Bolt | `storm_bolt` | 风暴之锤 | `mountain_king` | 75 | 9 | 6.0 |
| Thunder Clap | `thunder_clap` | 雷霆一击 | `mountain_king` | 90 | 6 | 0 |
| Bash | `bash` | 猛击 | `mountain_king` | 0 | 0 | 0 |
| Avatar | `avatar` | 化身 | `mountain_king` | 150 | 180 | 0 |

### 1.4 来源依据

所有数值来自 Task303 (HERO23-SRC1) 已 accepted 的来源边界：

| 能力 | 字段 | 来源值 | 说明 |
|------|------|--------|------|
| Storm Bolt | damage | 100/225/350 | Classic 主源 |
| Storm Bolt | mana | 75 | Classic 主源 |
| Storm Bolt | cooldown | 9s | Classic 主源 |
| Storm Bolt | range | 60 → 6.0 | 项目映射：÷100 |
| Storm Bolt | unit stun | 5s | Classic 主源 |
| Storm Bolt | hero stun | 3s | Classic 主源 |
| Thunder Clap | damage | 60/100/140 | Classic 主源 |
| Thunder Clap | mana | 90 | Classic 主源 |
| Thunder Clap | cooldown | 6s | Classic 主源 |
| Thunder Clap | AOE | 25/30/35 → 2.5/3.0/3.5 | 项目映射：÷10 |
| Thunder Clap | slow | 50% | Classic 主源（`speedMultiplier: 0.5`） |
| Thunder Clap | duration | 5s (unit) / 3s (hero) | Classic 主源 |
| Bash | triggerChance | 20%/30%/40% → 0.20/0.30/0.40 | Classic 主源 |
| Bash | bonusDamage | 25 | Classic 主源 |
| Bash | unit stun | 2s | Classic 主源 |
| Bash | hero stun | 1s | Classic 主源 |
| Avatar | mana | 150 | Classic 主源 |
| Avatar | cooldown | 180s | Classic 主源 |
| Avatar | duration | 60s | Classic 主源 |
| Avatar | armorBonus | 5 | Classic 主源 |
| Avatar | hpBonus | 500 | Classic 主源 |
| Avatar | damageBonus | 20 | Classic 主源 |
| Avatar | spellImmunity | true | Classic 主源 |

---

## 2. 未添加的内容

以下内容 **不** 在本数据种子范围内：

- 命令卡学习按钮
- 技能点消费路径（Mountain King 学习入口）
- 冷却时间倒计时
- 法力消耗运行时
- 目标模式运行时
- 投射物系统
- 眩晕状态机制
- 减速状态机制
- 被动触发运行时
- Avatar 变身运行时
- 法术免疫运行时
- AI 策略
- 视觉/音频资产

---

## 3. 下一安全任务

本数据种子被 Codex accepted 后，下一安全任务为：

**Task 308 — V9 HERO23-DATA3 Mountain King 学习命令卡暴露**

该任务将四个能力的命令卡学习按钮接入现有学习路径，证明技能点消费和能力等级存储。

---

## 4. 非声称

本文档 **不** 声称：

- Mountain King 任何能力已可使用
- Mountain King 技能学习按钮已暴露
- 完整英雄系统已完成
- 完整 AI 已完成
- 完整人族已完成
- V9 已发布
- AI 已能使用 Mountain King

---

## 5. DATA3 后状态更新

Task308 (HERO23-DATA3) accepted 后：

- Mountain King 四个能力的命令卡学习按钮已接入现有英雄学习路径。
- 玩家可通过命令卡学习 Storm Bolt / Thunder Clap / Bash / Avatar，消费技能点并存储 `abilityLevels`。
- 学习按钮遵循与 Paladin / Archmage 相同的门槛建模：`requiredHeroLevel`、`heroSkillPoints`、`isDead`。
- Avatar 终极能力在英雄等级 6 解锁，maxLevel 1。
- 学习后不暴露施放按钮、冷却、耗魔或运行时效果。
- 下一步为 `Task 309 — V9 HERO23-IMPL1-CONTRACT Storm Bolt 运行时合同`，先写合同，不直接实现运行时。

---

## 6. IMPL1 后状态更新

Task310 (HERO23-IMPL1) accepted 后：

- Storm Bolt 已进入最小玩家侧运行时：学习后出现施放入口，可扣除法力、启动冷却、发出延迟命中路径，并按 `HERO_ABILITY_LEVELS.storm_bolt` 造成伤害和眩晕。
- Thunder Clap、Bash、Avatar 仍只有数据和学习入口，没有运行时效果。
- `SimpleAI.ts` 仍没有 Mountain King 策略，AI 不会学习或施放 Storm Bolt。
- 视觉、音效、图标、粒子和完整 Mountain King / 完整英雄系统仍未完成。
- 下一步为 `Task 311 — V9 HERO23-UX1 Storm Bolt visible feedback`，只处理玩家可读反馈。
