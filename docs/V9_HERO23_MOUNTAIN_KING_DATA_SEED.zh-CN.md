# V9 HERO23-DATA1 Mountain King source-only 数据种子

> 任务编号：Task 304
> 生成时间：2026-04-18
> 前置：Task303 (HERO23-SRC1) 已 accepted。Mountain King 来源边界已定义。
> 范围：仅将 Mountain King 单位数据以 source-only 形式落地到 `GameData.ts`。不暴露 Altar 训练入口，不添加能力数据。
> 本文档 **不** 声称"完整英雄系统"、"完整人族"、"完整 AI"或"V9 发布"。

---

## 1. 数据种子内容

### 1.1 已添加到 `UNITS` 的字段

```
mountain_king: {
  key: 'mountain_king',
  name: '山丘之王',
  cost: { gold: 425, lumber: 100 },
  trainTime: 55, hp: 700, speed: 3.0, supply: 5,
  attackDamage: 26, attackRange: 1.0, attackCooldown: 2.22,
  armor: 2, sightRange: 10,
  canGather: false,
  description: '山丘之王英雄',
  attackType: AttackType.Normal,
  armorType: ArmorType.Heavy,
  maxMana: 225,
  isHero: true,
  heroLevel: 1,
  heroXP: 0,
  heroSkillPoints: 1,
  isDead: false,
}
```

### 1.2 来源依据

所有数值来自 Task303 (HERO23-SRC1) 已 accepted 的来源边界：

| 字段 | 来源值 | 说明 |
|------|--------|------|
| cost.gold | 425 | Classic 主源，与 Paladin/Archmage 同价 |
| cost.lumber | 100 | Classic 主源 |
| trainTime | 55 | Classic 主源 |
| hp | 700 | Classic 主源 Level 1 HP |
| speed | 3.0 | 项目映射：270 → 3.0 |
| supply | 5 | 标准英雄人口 |
| attackDamage | 26 | Classic 主源 Level 1 下限 |
| attackRange | 1.0 | 近战英雄 |
| attackCooldown | 2.22 | Classic 主源 |
| armor | 2 | Classic 主源 Level 1 |
| sightRange | 10 | 项目映射：180 → 10 |
| maxMana | 225 | Classic 主源 Level 1 Mana |
| attackType | Normal | Hero 攻击 → Normal |
| armorType | Heavy | Hero 护甲 → Heavy |

---

## 2. 未添加的内容

以下内容 **不** 在本数据种子范围内：

- `BUILDINGS.altar_of_kings.trains` — 仍为 `['paladin', 'archmage']`，Mountain King 暂不可训练
- Storm Bolt / Thunder Clap / Bash / Avatar 能力数据
- `HERO_ABILITY_LEVELS` 条目
- `ABILITIES` 条目
- 命令卡按钮
- 运行时行为
- AI 策略
- 视觉/音频资产

---

## 3. 下一安全任务

本数据种子被 Codex accepted 后，下一安全任务为：

**Task 305 — V9 HERO23-EXPOSE1 Mountain King Altar 训练暴露**

该任务只把 Mountain King 加入 `BUILDINGS.altar_of_kings.trains`，并证明现有 Altar 训练路径能训练一个山丘之王。四个能力的运行时合同必须在训练入口被 Codex accepted 后单独开任务。

---

## 4. 非声称

本文档 **不** 声称：

- Mountain King 已可训练（Altar 未暴露）
- Mountain King 任何能力已实现
- 完整英雄系统已完成
- 完整 AI 已完成
- 完整人族已完成
- V9 已发布

---

## 5. EXPOSE1 后状态更新

Task305 (HERO23-EXPOSE1) accepted 后：

- `BUILDINGS.altar_of_kings.trains` 已变更为 `['paladin', 'archmage', 'mountain_king']`。
- Mountain King 可通过 Altar 训练入口训练。
- 四个能力数据仍未添加。
- 下一步为 `Task306 — V9 HERO23-SKILL1 Mountain King ability learning contract`。
