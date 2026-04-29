# V9 HERO18 Water Elemental Codex 验收预案

> 生成时间：2026-04-17
> 队列来源：后台 Codex 独立队列任务 `V9-CX162`
> 适用对象：GLM Task265 / `HERO18-CONTRACT1 Water Elemental branch contract`
> 结论性质：这是接收预案，不代表 Task265 已经 Codex accepted。
> 范围限制：不实现 Water Elemental 数据、运行时、AI、素材或测试；不修改 GLM 正在写的合同/测试文件。

---

## 1. 预案结论

Task265 只能作为 **Water Elemental 分支合同** 被验收。Codex 接收时要确认它回答四件事：

1. Water Elemental 分支基于哪些已 accepted 前置。
2. 后续阶段必须按什么顺序推进。
3. Task262 已确认哪些 Water Elemental 来源字段，哪些字段仍缺源。
4. 当前代码仍没有 Water Elemental 数据、运行时、AI 或素材。

如果 Task265 只做到这些，并且静态 proof 能证明生产边界仍关闭，则可以进入 Codex acceptance 候选。若它越过合同边界，哪怕测试通过，也应拒绝或要求拆分。

---

## 2. 接收前置

Codex 复核 Task265 时，必须先确认合同引用的前置链是 stage-aware 的：

| 前置 | 接收要求 |
|------|----------|
| Task261 / HERO17-CONTRACT1 | 作为 Archmage 分支边界合同引用，说明 Archmage 后续必须 source-first、分阶段推进。 |
| Task262 / HERO17-SRC1 | 作为 Water Elemental 数值来源引用，不能凭记忆补值。 |
| Task263 / HERO17-DATA1 | 作为 `UNITS.archmage` 已存在的前置引用，不能把 Archmage 数据和 Water Elemental 数据混在 Task265。 |
| Task264 / HERO17-EXPOSE1 | 只可作为 Archmage 已暴露到 Altar 的前置候选/已复核事实引用；若本地队列尚未由前台 Codex 标为 accepted，合同不得把 worker `completed` 当成最终 acceptance。 |
| V9-CX161 / PSUM-5 复核 | 应记录 PSUM-5 是 Paladin 旧夹具问题，不应阻塞 Archmage 暴露候选验收，但也不等于 Task264 已自动 accepted。 |

拒绝信号：

- 把 GLM `completed` / `done` 写成 Codex `accepted`，但没有本地复核证据。
- 省略 Task262 来源边界，直接写 Water Elemental 数值。
- 把 Task265 写成数据种子、运行时或 AI 起点，而不是合同。

---

## 3. 必须通过的合同条件

### 3.1 阶段顺序

Task265 必须固定以下最小顺序：

`HERO18-CONTRACT1` -> `HERO18-DATA1` -> `HERO18-IMPL1` -> `HERO18-UX1` -> `HERO18-CLOSE1`

合同可以说明后续可能需要 source 修正，但不能把 runtime 放到 data seed 前面，也不能在合同阶段直接派发运行时。

通过条件：

- 每个阶段的职责边界清楚。
- `HERO18-DATA1` 只允许写 Water Elemental 所需的最小数据种子。
- `HERO18-IMPL1` 才能讨论召唤施放、单位生成、生命周期和按钮行为。
- `HERO18-UX1` 才能讨论可见反馈、状态显示、倒计时、禁用原因。
- `HERO18-CLOSE1` 才能做分支收口，不得提前宣称完整 Archmage。

### 3.2 Water Elemental 来源字段

Task265 必须引用 Task262 已记录的 Water Elemental 来源字段，并区分“可写入后续数据种子”和“暂缓”。

可进入后续 `HERO18-DATA1` 候选的字段：

| 字段 | Lv1 | Lv2 | Lv3 | 接收口径 |
|------|-----|-----|-----|----------|
| mana | 125 | 125 | 125 | 作为召唤能力消耗候选。 |
| cooldown | 20s | 20s | 20s | 作为召唤能力冷却候选。 |
| duration | 60s | 60s | 60s | 作为召唤物持续时间候选，但 lifecycle runtime 另开。 |
| requiredHeroLevel | 1 | 3 | 5 | 沿用普通英雄技能等级门槛。 |
| summoned unit HP | 525 | 675 | 900 | 采用 Task262 当前 RoC 原始值；补丁差异只记录，不在合同里自动改值。 |
| summoned attackDamage | 20 | 35 | 45 | 当前项目固定伤害标量采用下限。 |
| summoned attackRange | 3.0 | 3.0 | 3.0 | Task262 映射 300 -> 3.0。 |
| summoned attackType | Piercing | Piercing | Piercing | 项目已有类型。 |
| summoned armorType | Heavy | Heavy | Heavy | 项目已有类型。 |
| summoned armor | 0 | 0 | 1 | 采用 Task262 当前记录。 |
| summoned speed | 2.2 | 2.2 | 2.2 | Task262 映射 220 -> 2.2。 |

必须继续标为缺源或延后的字段：

- 水元素 `sightRange`。
- 水元素 `attackCooldown`。
- 水元素碰撞/footprint/选择半径。
- 活跃召唤上限。
- 死亡记录是否进入 `deadUnitRecords` 或能否被 Resurrection 复活。

### 3.3 禁区

Task265 必须明确禁止：

- Water Elemental 数据种子。
- Archmage ability button / command-card runtime。
- 召唤施放、单位生成、持续时间销毁、目标选择等 runtime。
- Archmage AI、AI 学技能、AI 施放 Water Elemental。
- 图标、模型、粒子、声音、素材导入。
- Brilliance Aura、Blizzard、Mass Teleport 数据或运行时。
- Mountain King、Blood Mage、物品、商店、Tavern、空军、第二种族、多人。
- 完整英雄系统、完整 Human 或 V9 发布声明。

### 3.4 no-data / no-runtime / no-AI proof

Task265 的静态 proof 必须证明：

- `src/game/GameData.ts` 仍没有 `water_elemental` 单位、`water_elemental` 能力、`brilliance_aura`、`blizzard` 或 `mass_teleport` 数据。
- `src/game/Game.ts` 仍没有 Water Elemental 召唤 runtime、Archmage ability command-card 分支、召唤物生命周期清理、召唤目标选择或主动施放入口。
- `src/game/SimpleAI.ts` 仍没有 Archmage 选择、技能学习或 Water Elemental 施放策略。
- Task265 没有编辑生产代码、素材、CSS、package scripts 或 runtime spec。

如果 proof 只检查文档文字而不检查生产边界，应要求补强；如果 proof 通过但生产代码已经越界，应拒绝。

---

## 4. 必须拒绝的情况

Codex 应拒绝 Task265 或要求拆分，若发现任一项：

1. **发明活跃召唤上限**：例如写死“同一 Archmage 同时只能有 1 个 Water Elemental”。Task262 只确认每次施放召唤 1 个，未确认活跃上限；60s 持续 / 20s 冷却反而要求后续 runtime 不能无来源写死唯一性。
2. **发明死亡记录行为**：例如断言 Water Elemental 死亡一定进入或一定不进入 `deadUnitRecords`，或一定可/不可被 Paladin Resurrection 复活。该项必须延后。
3. **加入数据或运行时**：包括 `UNITS.water_elemental`、`ABILITIES.water_elemental`、`HERO_ABILITY_LEVELS.water_elemental`、Archmage 命令按钮、召唤函数、生命周期清理、目标选择、冷却扣费等。
4. **加入 AI 或素材**：包括 `SimpleAI.ts` Archmage 策略、AIContext 施放入口、图标/模型/粒子/声音/贴图。
5. **扩大到其他英雄或技能**：包括 Brilliance Aura、Blizzard、Mass Teleport、Mountain King、Blood Mage 或 Paladin 改动。
6. **把 V9 或 Human 说成完成**：Task265 最多打开 Water Elemental 合同，不能关闭完整 Archmage、完整英雄系统、完整 Human 或 V9。
7. **跳过 Codex acceptance 语义**：把 worker completed 当作 accepted，或在 Task264/Task265 未本地复核前派发 runtime。
8. **弱化旧 blocker**：把 PSUM-5 当成 Archmage 回归，或反过来用 PSUM-5 结论宣称 Paladin 测试问题已修复。

---

## 5. 可延期但必须记录的项

以下项不应阻塞 Task265 合同 acceptance，但合同必须记录为后续任务的显式问题，不得隐形丢失：

| 项目 | 延期原因 | 后续最小归属 |
|------|----------|--------------|
| 召唤物生命周期 | 需要 runtime 支持定时销毁、死亡清理、状态刷新。 | `HERO18-IMPL1` |
| 目标选择 | 需要定义点地、默认召唤位置、阻塞地形和无效目标反馈。 | `HERO18-IMPL1` |
| 持续时间显示 | 60s 是来源字段，但 HUD/命令卡反馈属于 UX。 | `HERO18-UX1` |
| 碰撞/选择语义 | Task262 暂无 footprint / selection radius 来源，项目也需决定 summoned unit 是否可框选/编队。 | `HERO18-IMPL1` 或 source 修正 |
| 冷却/耗蓝 | 数值可作为数据字段，但扣 mana、设置 cooldown、禁用原因和刷新属于 runtime/UX。 | `HERO18-DATA1` 后进入 `HERO18-IMPL1` |
| 死亡记录与 Resurrection | 当前 `deadUnitRecords` 记录可控 team0/team1 普通非英雄非建筑单位；Water Elemental 是否参与必须单独定。 | source 修正或 `HERO18-IMPL1` 合同补充 |
| 活跃召唤上限 | 主源未确认唯一活跃上限；后续不得凭直觉写死。 | source 修正或 runtime 合同补充 |
| 补丁版本差异 | Task262 记录 RoC 与 1.30 后 HP/伤害/护甲差异；Task265 不应改采纳版本。 | 数据种子复核 |

---

## 6. Task265 accepted 后的下一张任务选择规则

只有当前台/集成 Codex 本地复核 Task265 并明确标记 `accepted` 后，才能派发下一张任务。

默认下一张：

`HERO18-DATA1 — Water Elemental data seed`

选择 `HERO18-DATA1` 的条件：

- Task265 合同完整引用 Task261-264 和 Task262 来源字段。
- 合同没有新增生产代码或 runtime。
- 合同清楚列出 source-confirmed 字段和 deferred 字段。
- no-data/no-runtime/no-AI proof 可信。

回到 source 修正的条件：

- 合同无法明确列出 Water Elemental 数据种子所需字段。
- 合同对 HP/伤害/护甲采用 RoC 还是当前补丁口径自相矛盾。
- 合同误写活跃召唤上限或 Resurrection/dead-record 行为为已确认。
- 合同缺少 sightRange / attackCooldown / collision 等暂缓记录，导致 DATA1 会凭空补值。

禁止的下一步：

- 不得从 Task265 直接跳到 `HERO18-IMPL1`。
- 不得直接写 Archmage Water Elemental command-card/runtime。
- 不得派发 Brilliance Aura / Blizzard / Mass Teleport。
- 不得派发 Archmage AI。
- 不得把 Task265 的 worker `completed` 当成 accepted 后继续派发。

---

## 7. 本预案的使用方式

前台/集成 Codex 复核 Task265 时，建议按以下顺序处理：

1. 先看文件范围：只允许 Task265 合同文档、静态 proof 和 GLM 队列 closeout。
2. 再看合同语义：是否满足第 2-5 节。
3. 再看静态 proof：是否真的检查生产边界。
4. 再运行 Task265 自带的非 runtime 验证命令。
5. 最后决定 `accepted` / `rejected` / `split-fix`，并据第 6 节选择下一张任务。

本预案不替代本地复核，不接受 Task265，也不允许后台 Codex 越过前台验收直接派发 DATA1。
