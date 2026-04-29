# V9 HERO23-CLOSE1 Storm Bolt 分支静态收口盘点

> 任务编号：Task312 / HERO23-CLOSE1
> 日期：2026-04-26
> 用途：Storm Bolt 从合同、最小运行时到可见反馈的完整证据链收口。不声称完整 Mountain King、完整英雄系统、完整 Human 或 V9 发布。

---

## 1. 前置任务证据链

| 任务 | 代号 | 状态 | 证据 |
|------|------|------|------|
| Task309 | HERO23-IMPL1-CONTRACT | accepted | Storm Bolt 运行时合同：定义成功/失败路径、数据消费字段（`stunDuration` / `heroStunDuration`）、证明义务。验证命令：`node --test tests/v9-hero23-storm-bolt-runtime-contract.spec.mjs` |
| Task310 | HERO23-IMPL1 | accepted | Storm Bolt 最小玩家侧运行时：施放、投射物、伤害、眩晕。Codex 接管后 accepted：build、tsc、Storm Bolt runtime 10/10、Task310 static chain 101/101、cleanup、无残留通过。验证命令：`node --test tests/v9-hero23-storm-bolt-runtime.spec.ts` |
| Task311 | HERO23-UX1 | accepted | Storm Bolt 最小可见反馈：命令卡成本/禁用原因、目标模式提示、HUD 等级/冷却、目标眩晕状态、命中反馈。Codex 接管后 accepted：build、tsc、Storm Bolt UX acceptance/static 61/61、Storm Bolt visible feedback/runtime 20/20、cleanup、无残留通过。验证命令：`node --test tests/v9-hero23-storm-bolt-visible-feedback.spec.ts` |

---

## 2. 当前玩家能力真实状态

以下为 Storm Bolt 分支完成后玩家可以实际做到的事情：

1. **Mountain King 可以从 Altar of Kings 训练。**（Task305 / HERO23-EXPOSE1 accepted：`BUILDINGS.altar_of_kings.trains` 包含 `'mountain_king'`）
2. **Mountain King 可以学习 Storm Bolt。**（Task308 / HERO23-DATA3 accepted：命令卡学习按钮已接入，点击消费技能点并存储 `abilityLevels.storm_bolt`）
3. **Storm Bolt 可以玩家侧施放。**（Task310 accepted：`Game.ts` 包含 `castStormBolt`、`stormBoltCooldownUntil` 字段、投射物飞行和命中逻辑）
4. **Storm Bolt 读取 `HERO_ABILITY_LEVELS.storm_bolt`，**使用 `stunDuration` / `heroStunDuration` 字段（不是 `duration` / `heroDuration`）：
   - `stunDuration`：普通单位眩晕时长（5 秒）
   - `heroStunDuration`：英雄眩晕时长（3 秒）
   - 来源：`GameData.ts:1062-1064` 三级数据均使用 `stunDuration` / `heroStunDuration`
   - 运行时消费：`Game.ts:2381-2383` 读取 `proj.levelData.heroStunDuration` 和 `proj.levelData.stunDuration`
5. **Storm Bolt 可以造成伤害。**（Task310 accepted：命中时 `target.hp -= levelData.effectValue`，100/225/350）
6. **Storm Bolt 可以启动冷却。**（Task310 accepted：施放成功后 `primary.stormBoltCooldownUntil = gameTime + levelData.cooldown`，冷却 9 秒）
7. **Storm Bolt 可以扣魔法。**（Task310 accepted：施放成功后 `primary.mana -= levelData.mana`，消耗 75）
8. **Storm Bolt 可以眩晕普通单位和英雄。**（Task310 accepted：普通单位 5 秒、英雄 3 秒；眩晕期间无法移动/攻击）
9. **玩家能看到最小可读反馈。**（Task311 accepted：命令卡成本信息、禁用原因、目标模式提示、命中 damage number + impact ring、眩晕状态行、冷却倒计时）

---

## 3. 生产代码边界确认

### 3.1 Storm Bolt 源数据字段口径

`GameData.ts` 中 `HERO_ABILITY_LEVELS.storm_bolt` 三级数据使用字段：

- `stunDuration: 5` — 普通单位眩晕时长
- `heroStunDuration: 3` — 英雄眩晕时长

**不使用** `duration` 或 `heroDuration`。运行时消费侧（`Game.ts:2381-2383`）同样读取 `stunDuration` / `heroStunDuration`。

### 3.2 SimpleAI.ts 边界

`SimpleAI.ts` 仍 **没有** Mountain King / Storm Bolt 策略。静态搜索确认无 `mountain_king`、`storm_bolt`、`Storm Bolt`、`stormbolt` 等关键词。

### 3.3 本任务不编辑生产代码

Task312 不编辑 `Game.ts`、`GameData.ts`、`SimpleAI.ts`、视觉工厂、素材或运行时测试。只写收口文档和静态 proof。

---

## 4. 仍未完成的边界

以下内容 **未** 完成，不在此收口范围内，留给后续独立任务：

| 未完成项 | 状态 | 说明 |
|----------|------|------|
| Thunder Clap runtime | 未开始 | 等待 Task313 / HERO23-THUNDER1 分支合同 |
| Bash runtime | 未开始 | 无任务卡 |
| Avatar runtime | 未开始 | 无任务卡 |
| Mountain King AI | 未开始 | `SimpleAI.ts` 无 MK 策略 |
| Mountain King 完整视觉/音频/官方素材 | 未开始 | 无任务卡 |
| Blood Mage | 未开始 | 无任务卡 |
| 物品/商店 | 未开始 | 无任务卡 |
| 空军 | 未开始 | 无任务卡 |
| 第二种族 | 未开始 | 无任务卡 |
| 多人 | 未开始 | 无任务卡 |
| 完整英雄系统 | 未开始 | 当前只有 Paladin + Archmage + Mountain King（仅 Storm Bolt） |
| 完整 Human | 未开始 | 缺上述多项 |
| V9 发布 | 未开始 | 远未达到发布标准 |

---

## 5. 静态 proof 义务

收口 proof（`tests/v9-hero23-storm-bolt-closure.spec.mjs`）必须证明：

1. **SB-CLOSE-1**：收口文档存在并命名 Task312 / HERO23-CLOSE1。
2. **SB-CLOSE-2**：文档引用已 accepted 的 Task309、Task310、Task311。
3. **SB-CLOSE-3**：文档记录玩家当前可用 Storm Bolt 能力（训练、学习、施放、伤害、冷却、扣魔、眩晕）。
4. **SB-CLOSE-4**：文档记录 `stunDuration` / `heroStunDuration` 为 Storm Bolt 源字段口径，不使用 `duration` / `heroDuration`。
5. **SB-CLOSE-5**：`SimpleAI.ts` 无 Mountain King / Storm Bolt 策略。
6. **SB-CLOSE-6**：本任务不编辑生产代码。
7. **SB-CLOSE-7**：文档不宣称完整 Mountain King、完整英雄系统、完整 Human 或 V9 发布。

---

## 6. 收口非声称

本收口文档 **不** 声称：

- Mountain King 完整能力套件已完成（仅 Storm Bolt 完成）
- 完整英雄系统已完成
- 完整 Human 已完成
- V9 已发布
- Mountain King AI 已实现
- Thunder Clap / Bash / Avatar 已实现
- 任何生产代码被本任务修改

---

## 7. 下一步

Task312 accepted 后，下一安全任务为：

**Task313 — V9 HERO23-THUNDER1 Mountain King Thunder Clap branch contract**

- 先做 Thunder Clap 分支合同，不直接写 runtime。
- 不把 Bash、Avatar、AI、素材终版或完整 Mountain King 混进 Thunder Clap 的第一张任务。
