# V9 HERO21-CLOSE1 Mass Teleport 分支收口盘点

> 生成时间：2026-04-18
> 前置：Task286 (CONTRACT1) accepted, Task287 (SRC1) accepted, Task288 (DATA1) accepted, Task289 (IMPL1-CONTRACT) accepted, Task290 (IMPL1) accepted, Task291 (UX1) accepted。
> 范围：Mass Teleport 最小玩家侧分支收口盘点。本文档不修改生产代码。
> 本文档 **不** 声称"Mass Teleport 完整"、"完整 Archmage"、"完整英雄系统"、"完整人族"或"V9 发布"。

---

## 1. 分支完整序列

| 阶段 | 任务 | 状态 | 产出 |
|------|------|------|------|
| HERO21-CONTRACT1 | Task286 | accepted | 分支边界和禁区 |
| HERO21-SRC1 | Task287 | accepted | 来源值锁定（Classic 主源） |
| HERO21-DATA1 | Task288 | accepted | `HERO_ABILITY_LEVELS.mass_teleport` 数据种子 |
| HERO21-IMPL1-CONTRACT | Task289 | accepted | 14 条运行时决策合同 |
| HERO21-IMPL1 | Task290 | accepted | 最小玩家侧运行时 |
| HERO21-UX1 | Task291 | accepted | 可读反馈（HUD、命令卡、impact ring） |
| HERO21-CLOSE1 | Task292 | 本文档 | 分支收口盘点 |

---

## 2. 当前玩家侧能力

| 能力 | 说明 |
|------|------|
| 学习 | Archmage 英雄等级 6 可学习 Mass Teleport Lv1，消耗 1 技能点 |
| 命令卡 | 低于 6 级时显示禁用按钮并注明原因；学习后显示施放按钮 |
| 目标模式 | 点击施放按钮进入目标选择模式，左键选择友方单位/建筑，右键/Esc 取消 |
| 有效施放 | 有效友方目标消耗 100 法力、开始 20s 冷却、创建 3s 延迟待决 |
| 延迟 | 3 秒延迟期间可被打断（死亡/stop/move/目标死亡），法力和冷却不退 |
| 传送执行 | 延迟完成后传送施法者周围 7.0 半径内友方非建筑单位（含召唤物/英雄/工人） |
| 上限 | 最多 24 个单位（含 Archmage），超出时取最近的 |
| 工人资源 | 携带资源不变，不存入/丢弃/修改 |
| 放置 | 确定性非重叠偏移，不与目标建筑 footprint 重叠 |
| 选择 | 传送后保持当前选择，不自动跳转摄像机 |
| 无效目标 | 敌方/死亡/空地不消耗法力、不启动冷却、不创建待决状态 |
| 反馈 | 单位面板显示已学等级和冷却倒计时；HUD 显示"传送准备中 Xs"；完成后 impact ring |

---

## 3. 来源值引用（Task287/288）

| 字段 | Classic 主源值 | 项目采用值 |
|------|---------------|-----------|
| 法力消耗 | 100 | 100 |
| 冷却时间 | 20s | 20 |
| 施法射程 | 无限制 | Infinity |
| 传送半径 | 700 内部 → 7.0 格 | 7.0 |
| 最大传送单位数 | 24 | 24 |
| 英雄等级需求 | 6 | 6 |
| 施法延迟 | 3s | 3 |
| maxLevel | 1 | 1 |

---

## 4. 证明证据

| 证明类型 | 文件 | 结果 |
|---------|------|------|
| 分支合同静态 proof | `tests/v9-hero21-mass-teleport-branch-contract.spec.mjs` | 9/9 |
| 来源边界静态 proof | `tests/v9-hero21-mass-teleport-source-boundary.spec.mjs` | 8/8 |
| 数据种子静态 proof | `tests/v9-hero21-mass-teleport-data-seed.spec.mjs` | 7/7 |
| 运行时合同静态 proof | `tests/v9-hero21-mass-teleport-runtime-contract.spec.mjs` | 9/9 |
| IMPL1 focused runtime | `tests/v9-hero21-mass-teleport-runtime.spec.ts` | 13/13 |
| UX1 focused runtime | `tests/v9-hero21-mass-teleport-visible-feedback.spec.ts` | 9/9 |

---

## 5. 生产边界

- `HERO_ABILITY_LEVELS.mass_teleport` 存在于 `GameData.ts`。
- `ABILITIES.mass_teleport` **不** 存在。
- `Game.ts` 包含 Mass Teleport 运行时和可见反馈。
- `SimpleAI.ts` 无 Archmage / Mass Teleport 策略。
- 无官方/最终素材、图标、音效、小地图定位、摄像机跳转或完整系统宣称。

---

## 6. 明确开放项

| 项目 | 状态 |
|------|------|
| Archmage AI 自动施放策略 | 未开始 |
| 最终素材/图标/粒子/音效 | 未开始 |
| 小地图/全地图定位 UI | 未开始 |
| 精确 War3 碰撞对齐 | 未开始 |
| 传送后任务路径重建 | 未开始 |
| Mountain King 英雄分支 | 未开始 |
| Blood Mage 英雄分支 | 未开始 |
| 物品系统 / 商店 / Tavern | 未开始 |
| 完整英雄系统 | 未完成 |
| 完整人族 | 未完成 |
| V9 发布 | 未发布 |
