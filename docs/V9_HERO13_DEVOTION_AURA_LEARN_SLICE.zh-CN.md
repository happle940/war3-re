# V9 HERO13-IMPL2 Devotion Aura 学习入口

> 生成时间：2026-04-16
> 前置：Task 241 (HERO13-IMPL1) 已 accepted。
> 范围：给 Paladin 增加 Devotion Aura 学习入口，让玩家能触发已经存在的被动光环 runtime。

本文档不声称“完整圣骑士”、“完整英雄系统”、“完整人族”或“V9 发布”。

---

## 1. 已接入行为

- Paladin 命令卡出现 `学习虔诚光环 (LvN)`。
- Lv1 / Lv2 / Lv3 分别要求英雄等级 1 / 3 / 5。
- 每学习一级消耗 1 点英雄技能点。
- 学习成功后写入 `abilityLevels.devotion_aura`。
- 学到 Devotion Aura 后，不需要施法按钮；已有被动 runtime 会自动按等级提供护甲光环。
- 死亡和祭坛复活后，已学 Devotion Aura 等级保留。

---

## 2. 仍未接入

- 没有 Devotion Aura 施法按钮。
- 没有 HUD / 状态栏 / 图标 / 特效 / 声音。
- 没有 AI 使用。
- 没有建筑目标扩张。
- 没有空军目标实现。
- 没有多个 Paladin 独立叠加语义。
- 没有 Resurrection、其他英雄、物品、商店、Tavern、第二种族或多人联机。

---

## 3. 验证入口

重点 runtime proof：

```bash
./scripts/run-runtime-tests.sh tests/v9-hero13-devotion-aura-learn-runtime.spec.ts tests/v9-hero13-devotion-aura-runtime.spec.ts --reporter=list
```

相邻回归：

```bash
./scripts/run-runtime-tests.sh tests/v9-hero11-holy-light-skill-spend-runtime.spec.ts tests/v9-hero12-divine-shield-runtime.spec.ts tests/v9-hero9-revive-runtime.spec.ts --reporter=list
```

