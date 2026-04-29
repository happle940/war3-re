# V9 HERO21-SRC1 Mass Teleport 来源边界

> 生成时间：2026-04-18
> 前置：Task286 (HERO21-CONTRACT1) 已 accepted — Mass Teleport 分支合同。
> 前置：Task262 (HERO17-SRC1) 已 accepted — Archmage 来源边界（含 Mass Teleport 来源候选值）。
> 范围：Mass Teleport 来源值锁定与项目映射。**不** 修改生产代码。
> 本文档 **不** 声称"Mass Teleport 已实现"、"完整 Archmage"、"完整英雄系统"、"完整人族"或"V9 发布"。

---

## 1. 来源层级

与 HERO17-SRC1 一致：

| 层级 | 来源 | 角色 |
|------|------|------|
| 主来源 | Blizzard Classic Battle.net Human 页面 | Archmage 能力的优先采纳依据 |
| 交叉检查 | Liquipedia Warcraft III — Archmage | 社区维护的当前补丁数值和补丁历史 |
| 交叉检查 | Warcraft Wiki (warcraft.wiki.gg) | 额外交叉校验 |
| 冲突处理 | 以 Classic 主源为准；冲突时 Codex 可显式覆盖 | — |

### 1.1 版本选择说明

采用 RoC / Classic 原始值作为基线。补丁变更记录在下方补丁历史中，但当前项目选择以 Classic 值为采纳值，与 Water Elemental、Brilliance Aura 和 Blizzard 分支的来源策略一致。

---

## 2. 采用值

### 2.1 等级参数（单级终极技能）

| 字段 | Classic 主源值 | 交叉校验 | 项目采用值 | 说明 |
|------|---------------|----------|-----------|------|
| 法力消耗 (Mana Cost) | 100 | Liquipedia 一致 | **100** | 无冲突 |
| 冷却时间 (Cooldown) | 20s | Liquipedia 显示 30s（1.35 后） | **20** | 采用 Classic 原始值；1.35 补丁增为 30s 记录在补丁历史 |
| 施法射程 (Cast Range) | 无限制 | 一致 | **无限制（全图）** | 无冲突 |
| 传送半径 (AOE) | 700 内部 / 70 显示 | 1.30 后 800 / 80 | **7.0** 格 | 项目映射：700→7.0 格（÷100）；1.30 增大记录在补丁历史 |
| 最大传送单位数 | 24 | 一致 | **24** | 无冲突 |
| 英雄等级需求 | 6 | 一致 | **6** | 终极技能标准门槛 |
| 施法延迟 | 3s | 一致 | **3** | 无冲突 |
| maxLevel | 1 | 一致 | **1** | 终极技能只有 1 级 |

### 2.2 通用参数

| 参数 | 采用值 | 说明 |
|------|--------|------|
| 技能类型 | 终极 (Ultimate) | 英雄等级 6 可学习，只有 1 级 |
| 目标类型 | 友方单位或建筑 | 主源描述为传送至友方目标位置；精确规则延后至 IMPL1-CONTRACT |
| 传送机制 | 延迟施放 | 3 秒延迟后传送，非通道 |
| 传送上限 | 24 单位（含自身） | 来源一致 |

---

## 3. 补丁历史（仅记录，不改变采用值）

| 版本 | 变化 |
|------|------|
| 1.15 | 冷却从 15s 增至 20s |
| 1.30.0 | 传送半径从 700 增至 800 |
| 1.35.0 | 冷却从 20s 增至 30s |

当前补丁值与 RoC 原始值的差异：
- 冷却：当前 30s vs Classic 20s
- 传送半径：当前 800/80 vs Classic 700/70

项目选择 Classic 原始值，与 Blizzard、Water Elemental、Brilliance Aura 分支的版本策略一致。

---

## 4. 项目映射

| War3 显示单位 | War3 内部单位 | 项目单位 | 映射公式 |
|---------------|--------------|---------|----------|
| 传送半径 70 | 700 | 7.0 | ÷100 |

映射规则与 Blizzard（射程 800→8.0）、Water Elemental（射程 300→3.0）、Brilliance Aura（光环 900→9.0）一致。

---

## 5. 与 Blizzard 施放对比

| 字段 | Blizzard | Mass Teleport | 说明 |
|------|----------|---------------|------|
| 类型 | 普通 AOE | 终极传送 | 不同 |
| 目标 | 地面位置 | 友方单位/建筑 | 不同 |
| 法力消耗 | 75 | 100 | 不同 |
| 冷却 | 6s | 20s | 不同 |
| 射程 | 8.0 | 无限制 | 不同 |
| 机制 | 通道（多波伤害） | 延迟施放（一次性传送） | 完全不同 |
| 波次/延迟 | 6/8/10 波 | 3s 延迟 | 不同 |
| maxLevel | 3 | 1 | 不同 |

Mass Teleport 的运行时不能复用 Blizzard 的通道/波次/伤害代码。

---

## 6. 来源未知 / 暂缓字段

| 字段 | 状态 | 说明 |
|------|------|------|
| 精确目标规则 | 暂缓 | 是否必须为友方单位/建筑，能否传送到空地 |
| 被传送单位筛选 | 暂缓 | 哪些单位可被传送（英雄/普通/召唤/工人） |
| 打断条件 | 暂缓 | 3s 延迟期间哪些行为打断施法 |
| 传送后碰撞解决 | 暂缓 | 目标位置单位排列 |
| 目标视野需求 | 暂缓 | 是否需要目标位置有视野 |
| 建筑是否可传送 | 暂缓 | 来源未明确 |

以上字段延后至 HERO21-IMPL1-CONTRACT 确认。

---

## 7. 延后至后续任务的运行时决策

| 决策 | 延后到 | 说明 |
|------|--------|------|
| 目标有效性判定 | IMPL1-CONTRACT | 友方单位/建筑/空地规则 |
| 传送对象筛选 | IMPL1-CONTRACT | 英雄/普通/召唤/工人/建筑 |
| 3 秒延迟行为 | IMPL1-CONTRACT | 延迟期间的可操作性 |
| 打断规则 | IMPL1-CONTRACT | 移动/硬控/死亡打断 |
| 失败路径 | IMPL1-CONTRACT | 死亡/无效目标/隐藏目标 |
| 传送后放置 | IMPL1-CONTRACT | 单位排列和碰撞解决 |
| 选择/摄像机 | IMPL1-CONTRACT | 传送后选择和摄像机行为 |
| 召唤物交互 | IMPL1-CONTRACT | Water Elemental 是否跟随传送 |
| 工人资源处理 | IMPL1-CONTRACT | 携带资源的工人传送后资源状态 |
| 目标模式 UI | IMPL1 | 目标选择界面 |
| 视觉反馈 | UX1 | 传送视觉效果 |
| 音频反馈 | UX1 或更后 | 传送声音 |
| AI 策略 | 不在本分支 | SimpleAI 无 Mass Teleport 策略 |

---

## 8. 当前生产代码基线

- `GameData.ts`：无 `HERO_ABILITY_LEVELS.mass_teleport`，无 `ABILITIES.mass_teleport`。
- `Game.ts`：无 Mass Teleport 运行时、无传送功能、无目标模式、无 HUD 文本、无命令卡按钮。
- `SimpleAI.ts`：无 Archmage 策略、无 Mass Teleport 策略。

---

## 9. 下一步

来源边界 accepted 后，下一张任务是 `Task288 — V9 HERO21-DATA1 Mass Teleport data seed`。DATA1 阶段只允许将本来源锁定的值写入 `HERO_ABILITY_LEVELS.mass_teleport`，不实现运行时。

---

## 10. 明确未完成

| 项目 | 状态 |
|------|------|
| Mass Teleport 数据种子 | 未开始（DATA1） |
| Mass Teleport 运行时 | 未开始（IMPL1） |
| Archmage AI 策略 | 未开始 |
| 模型 / 图标 / 粒子 / 声音 | 未开始 |
| Mountain King | 未开始 |
| Blood Mage | 未开始 |
| 物品系统 / 商店 / Tavern | 未开始 |
| 完整英雄系统 | 未完成 |
| 完整人族 | 未完成 |
| V9 发布 | 未发布 |
