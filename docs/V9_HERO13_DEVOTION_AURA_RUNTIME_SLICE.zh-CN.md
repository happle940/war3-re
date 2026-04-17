# V9 HERO13-IMPL1 Devotion Aura 最小被动光环 runtime

> 生成时间：2026-04-16
> 前置：Task 240 (HERO13-DATA1) 已 accepted。
> 范围：把 `HERO_ABILITY_LEVELS.devotion_aura` 接入最小被动护甲光环 runtime。

本文档不声称“完整圣骑士”、“完整英雄系统”、“完整人族”或“V9 发布”。

---

## 1. 已接入行为

- 活着的 Paladin 如果已经拥有 `abilityLevels.devotion_aura >= 1`，会成为 Devotion Aura 来源。
- 光环读取 `HERO_ABILITY_LEVELS.devotion_aura`：
  - Lv1：护甲 +1.5，半径 9.0
  - Lv2：护甲 +3，半径 9.0
  - Lv3：护甲 +4.5，半径 9.0
- 光环影响 Paladin 自身和半径内同队非建筑单位。
- 敌方单位不受影响。
- 建筑不受影响。
- 单位离开半径后移除光环加成；重新进入半径后重新获得加成。
- Paladin 死亡后不再提供光环；复活后如果仍有已学等级，会重新提供光环。

---

## 2. 护甲处理规则

- 光环加成是 runtime 临时值，不写回基础数据。
- 每次 tick 会先移除旧的 Devotion Aura 临时加成，再按当前来源重新计算。
- 同一个来源不会跨 tick 重复叠加。
- 单位已有研究护甲加成时，Devotion Aura 临时叠加在研究后的当前护甲上；离开光环后恢复到不含光环的护甲值。

---

## 3. 明确未接入

- 没有 Devotion Aura 学习按钮。
- 没有 Devotion Aura 施法按钮。
- 没有 HUD / 状态栏 / 图标 / 特效 / 声音。
- 没有 AI 使用。
- 没有建筑目标扩张。
- 没有空军目标实现。
- 没有多个 Paladin 独立叠加语义。
- 没有 Resurrection、其他英雄、物品、商店、Tavern、第二种族或多人联机。

---

## 4. 验证入口

重点 runtime proof：

```bash
./scripts/run-runtime-tests.sh tests/v9-hero13-devotion-aura-runtime.spec.ts --reporter=list
```

相邻回归：

```bash
./scripts/run-runtime-tests.sh tests/v9-hero12-divine-shield-runtime.spec.ts tests/v9-hero11-holy-light-skill-spend-runtime.spec.ts tests/v9-hero9-revive-runtime.spec.ts --reporter=list
```

静态阶段 proof：

```bash
node --test tests/v9-hero13-devotion-aura-data-seed.spec.mjs tests/v9-hero13-devotion-aura-source-boundary.spec.mjs tests/v9-hero13-devotion-aura-contract.spec.mjs tests/v9-hero12-divine-shield-closure.spec.mjs
```

