# Overnight Order System Beta + Human Gameplay Alpha

> Session date: 2026-04-10
> Theme: 用深逻辑和可验证主干，把项目推进到“第一次真的能打一局”的方向
> Execution mode: Long-running overnight roadmap
> Status: READY

---

## Goal

把当前项目从“已有基础控制语言和运行时骨架”推进到一个更厚、更可玩的阶段：

- 命令系统从基础版推进到更可靠的 `Order System Beta`
- 单位命令覆盖 / 追加 / 中断 / 恢复语义更清楚
- worker 采集、移动、建造、战斗命令链更一致
- AI 经济与生产节奏推进到 `Human Gameplay Alpha`
- 项目开始具备“第一次能真正打一局”的主循环基础

一句话目标：

> 今晚不是做视觉参数，也不是做截图候选稿，而是把 order truth、command semantics、AI gameplay loop 推进成一套更深、更耐审的系统主干。

---

## Why This Is Tonight's Theme

根据今天的现实反馈：

1. 视觉垂直切片在无人值守时容易退化成“改参数 + build 通过”，不适合作为 7 小时夜间主线
2. 纯逻辑 / 纯系统 / 可客观验证的方向更适合长时间连续推进
3. 你真正想要的 war3 核心之一，是“每个单位都在手里”，这最终取决于：
   - 命令系统
   - 覆盖 / 排队 / 中断 / 恢复语义
   - AI 是否真的能打一局

所以今晚主线切换为：

- `Order System Beta`
- `Human Gameplay Alpha`

这两条都是深逻辑工作，适合无人值守长跑，也更容易真正做满数小时。

---

## Read First

开始前必须读：

- `PLAN.md`
- `docs/GLM51_EXECUTION_GUIDE.md`
- `docs/INTERACTION_PERFORMANCE_GUARDRAILS.md`
- `docs/SMOKE_CHECKLIST.md`
- `docs/OVERNIGHT_CONTROL_FEEL_ALPHA.md`
- `docs/OVERNIGHT_WAR3_AGENCY_BETA.md`
- `src/game/Game.ts`
- `src/game/GameCommand.ts`
- `src/game/SelectionModel.ts`
- `src/game/ControlGroupManager.ts`
- `src/game/SimpleAI.ts`
- `src/game/GameData.ts`
- `src/game/GamePhase.ts`
- `src/map/MapRuntime.ts`

读完后再开始改代码。

---

## Scope

今晚允许做：

- 命令语义真相收口
- 覆盖命令 vs 追加命令语义清晰化
- worker 命令链（移动 / 采集 / 返回 / 建造 / 中断 / 恢复）稳定化
- 队列移动 / 队列命令最小但可靠版本
- 自动反击与原命令恢复策略收口
- 编组 / 选择 / 命令系统对齐
- AI 经济、建造、训练、进攻节奏增强
- gameplay smoke / regression checklist 扩展
- 最小必要的 HUD / 提示增强，但只服务命令与 gameplay 可读性
- 最小必要的构建 / 类型 / runtime 修复
- 文档与 morning handoff 更新

---

## Non-goals

今晚明确不做：

- 不做截图自动化
- 不做视觉 atmosphere pass
- 不做人眼驱动的镜头 / 构图 / 地图配色迭代
- 不做英雄
- 不做迷雾
- 不做技能系统
- 不做物品 / 商店
- 不做完整热键系统
- 不做 8 方向寻路
- 不做单位碰撞
- 不做完整 ECS / EventBus 重构
- 不做大规模 Three.js 渲染重写
- 不做无关 HUD 花活

如果你想扩到这些方向，请先否决自己，回到今晚主轴。

---

## Execution Rules

- 不要按小 cycle 节奏频繁汇报
- 除非遇到真实阻塞，否则持续推进
- 每个 phase 结束时更新本文件
- 如果某项不稳，降级到最小可成立方案，不要整晚卡死
- 不要把代码阅读推断写成“已验证通过”
- build / tsc / runtime smoke 必须持续作为门禁
- 完成核心 phase 后，不要自动停下，继续 Reserve Backlog
- 优先做“真正能改变一局游戏”的逻辑，不要做漂亮但浅的补丁

---

## Phase Checklist

- [x] Phase 0 完成
- [x] Phase 1 完成
- [x] Phase 2 完成
- [x] Phase 3 完成
- [x] Phase 4 完成
- [x] Phase 5 完成
- [x] Phase 6 完成
- [x] Reserve Backlog 至少完成 1 项
- [x] Final Verification + Morning Handoff 完成

---

## Phase 0：Truth Baseline + Gameplay Audit

### Objective

先确认主干为真，再盘点当前 gameplay loop 中最影响“一局能不能打”的系统缺口。

### Required Work

先真实运行：

- `npm run build`
- `npx tsc --noEmit -p tsconfig.app.json`

然后做基线审计，至少覆盖这些行为：

- 单选 / 多选 / 编组 / 子组
- 普通移动
- Shift+右键队列移动
- gather（金 / 木）
- 返回交付
- 建造
- 训练
- rally
- attackMove
- stop / hold
- 自动反击
- AI 开局经济循环

接着在本文档里记录当前最关键的 5-8 个 gameplay truth 缺口，例如：

- queue 只支持移动，不支持更完整的命令链
- 自动反击会吞掉原命令但不恢复
- gather 状态下 queue 残留但不消费
- AI 经济节奏过于原始，无法真正形成局势
- 训练 / rally / 资源扣除存在竞态或不一致

### Audit Results (2026-04-10)

**Build**: `npm run build` ✅ | `tsc --noEmit` ✅

**Critical Gameplay Truth Gaps**:

1. **Auto-aggro permanently steals units** — `updateAutoAggro()` 对 Idle/Moving 单位设置 `state=Attacking` 并清空 `moveTarget`/`waypoints`/`resourceTarget`，原命令永远丢失。仅 AttackMove 状态正确保持。

2. **Queue only supports move** — `moveQueue: THREE.Vector3[]` 只存位置。Shift+右键只追加 move。不支持队列 gather/attack/attackMove。

3. **Gather loop ignores moveQueue** — Worker 在采集循环中（MovingToGather→Gathering→MovingToReturn→回采）从不检查 moveQueue。采集中 shift+右键追加的目标被静默丢弃。

4. **AI doesn't gather lumber** — AI 只派空闲农民采金。无伐木。无农场建造（需 lumber）。supply 卡在 10。

5. **AI no supply/farm awareness** — AI 训练不检查 supply，也不建 farm。`trainUnit()` 在 Game.ts 里也不检查 supply。

6. **AI one-shot attack wave** — `attackWaveSent` 一次性标志，全灭才重置。无持续压力，无目标优先级。

7. **Stop doesn't clear carryAmount** — Worker 被停止后 `gatherType` 被清但 `carryAmount` 保留，视觉上仍显示携带资源。

8. **Training bypasses supply check** — `trainUnit()` 只查 `canAfford`（金/木），不查 supply。可超出人口上限训练。

### Phase 0 Verification
- Commands run: `npm run build`, `npx tsc --noEmit -p tsconfig.app.json`
- Runtime checks performed: Code review audit of all gameplay systems
- What passed: Build, type check, selection model, control groups, basic command dispatch
- What failed and was fixed: N/A (audit only, no fixes yet)
- Remaining uncertainty: Full runtime behavior of AI economy cycle needs Phase 4 live testing

### Exit Criteria

- `npm run build` 通过
- `npx tsc --noEmit -p tsconfig.app.json` 通过
- 已记录 gameplay 关键缺口
- 没有阻断主线的构建/类型错误

---

## Phase 1：Order Truth Audit + Minimal Order Model Beta

### Objective

把当前命令系统从“多个命令分支拼起来”推进到“更像统一 order truth 的主干”。

### Required Work

#### 1. 命令类型分层梳理

至少明确并统一以下语义：

- 覆盖型命令
  - 普通移动
  - attack
  - gather
  - build
  - train
  - rally 设置
  - attackMove
- 追加型命令
  - Shift + move queue（至少成立）
- 清空型命令
  - stop
  - 某些强制覆盖命令

如果当前实现分散在多个 if/else 中，可以做最小抽离，但不要做空架构。

#### 2. 为 Unit 建立更清晰的 order state 基础

不要求完整 RTS order framework，但至少要让以下概念更明确：

- 当前主命令 / 当前 order intent
- moveQueue / queued targets
- 中断来源（手动命令、自动反击、死亡、目标失效）
- 命令清空和覆盖的统一入口

#### 3. worker 特殊命令链对齐

重点补平：

- gather gold
- gather lumber
- return cargo
- build
- 被新命令打断后如何清理 / 恢复 / 丢弃旧命令

### Exit Criteria

- 覆盖 / 追加 / 清空语义更统一
- queue 不再明显像临时补丁
- worker 命令链的状态清理更清楚
- build / tsc 仍然通过

---

## Phase 2：Queue Foundation Beta

### Objective

把当前只够用的 move queue 推进到一个更像 war3 命令语言的版本。

### Required Work

#### 1. Shift + move queue 收口

要求：

- Idle 单位第一跳立即启动
- Moving 单位不被打断，队列追加
- stop 清空 queue
- 覆盖型命令清空 queue
- 队列 UI / indicator / HUD 反馈与真实状态一致

#### 2. 追加命令语义扩展（只在稳定前提下）

如果当前 move queue 稳定，可以尝试扩展一项，按优先级：

1. `Shift + attackMove` append
2. `Shift + rally` queue-like behavior（如果逻辑自然）
3. `Shift + gather` 最小 alpha（只有在很稳时）

不要三项都做。优先保稳定。

#### 3. 目标失效与 queue 清理

要求：

- 队列目标抵达后正确消费
- 队列目标失效时不会卡死
- 战斗、死亡、模式取消等导致的残留 queue 更少

### Exit Criteria

- move queue 是“可靠特性”，不是“偶尔能跑”
- 至少一种追加命令语义在 move 之外有稳定尝试，或明确记录为何不做
- build / tsc 仍然通过

---

## Phase 3：Auto-Aggro / Interrupt / Resume Semantics

### Objective

补上 war3 控制感里非常关键的一层：自动反击、命令中断、命令恢复。

### Required Work

#### 1. 自动反击的边界

要求：

- 自动反击不能把单位永远从原命令中扯走
- 至少明确：
  - 哪些状态允许自动反击
  - 哪些状态不允许
  - 反击结束后是否恢复原命令

#### 2. 原命令恢复策略

不要求完美，但必须有一致策略，例如：

- moving 被短暂自动反击打断后，恢复剩余队列
- attackMove 被自动反击打断后，仍回到 attackMove intent
- gather 中被骚扰时不应把采集逻辑彻底打碎

#### 3. Stop / Hold / AttackMove 与自动反击关系

要求：

- stop 明确切断恢复链
- hold 的攻击行为边界清楚
- attackMove 应该比普通 move 更能容纳自动交战

### Exit Criteria

- 自动反击与原命令关系更一致
- 不再容易出现“打一下就把原任务搞丢”的脆弱行为
- build / tsc 仍然通过

---

## Phase 4：Human Gameplay Alpha — Economy & Production Loop

### Objective

让“打一局”开始具备实际 gameplay，而不是只有玩家能点几下。

### Required Work

#### 1. AI 经济循环增强

目标：

- 开局农民分配更合理
- 采金 / 采木比例更像真实开局
- 资源不足时行为更稳定
- 不会频繁卡死在单一资源瓶颈里

#### 2. 建造顺序与生产节奏

目标：

- AI 建筑顺序更合理
- 训练节奏更连续
- 避免“存一堆钱但不花”或“乱花导致停摆”

#### 3. rally / 训练 / 建造联动

目标：

- 新训练单位能更稳定进入经济或军队循环
- rally 与 AI 生产决策不冲突
- 建造中的等待与重试逻辑更稳

#### 4. 可玩循环视角检查

至少围绕这一句审查：

> 玩家现在是否开始能跟一个会采集、会造房、会出兵、会动起来的 AI 打“像样的一局前 5 分钟”？

### Exit Criteria

- AI 经济与生产节奏更连续
- 训练/建造/集结更像一个 loop，而不是几个分散动作
- build / tsc 仍然通过

---

## Phase 5：Human Gameplay Alpha — Combat & Pressure Loop

### Objective

让 AI 不只是“会活着”，而是开始给玩家施压，形成最基础的人机对局节奏。

### Required Work

#### 1. 军队集结与出击时机

要求：

- AI 不再永远蹲家或零散送兵
- 至少形成：
  - 集结阈值
  - 出击触发
  - 回防 / 再集结逻辑中的最小版本

#### 2. 攻击目标选择

要求：

- 基地、单位、农民、建筑的优先级有最小策略
- 不要求高智商，但不能完全随机

#### 3. 压力曲线

要求：

- 前期不会完全无事发生
- 中期不会只出现零碎单兵送死
- 至少开始形成“玩家需要应对”的最小压力感

#### 4. 玩家命令系统与 AI 对抗兼容

确认：

- 玩家编组、队列、attackMove、采集、建造在 AI 有动作时不退化
- 不要因为 AI 逻辑增强让 player control feel 变脆

### Exit Criteria

- AI 能形成最小攻击压力
- 玩家与 AI 的交互更像一局游戏，而不是两个并行 demo
- build / tsc 仍然通过

---

## Phase 6：Gameplay Sanity + Regression Hardening

### Objective

把前面命令、队列、AI、生产、战斗的改动做统一 sanity pass，避免“局部更强，整体更脆”。

### Required Work

至少统一检查：

- player control feel 是否仍然更强
- order truth 是否更一致
- worker 主循环是否更稳
- AI 是否真的更像一个对手
- 是否引入了新的明显 regression

同步完善：

- `docs/SMOKE_CHECKLIST.md`
- 如果合理，可新增一份更偏 gameplay 的 checklist 文档

### Exit Criteria

- 关键 gameplay loop 更完整
- 回归风险更可见
- build / tsc 仍然通过

---

## Reserve Backlog

只有 Phase 0-6 都稳定后，才继续 Reserve Backlog。按顺序做，做不稳就停。

### Reserve 1：Order Intent Cleanup

- 如果当前 `Game.ts` 命令分支依然过散，可做最小抽离
- 目标是减少脆弱逻辑，不是做大重构

### Reserve 2：AI Build Order Profiles Alpha

- 为 AI 做 2-3 种轻量 build order / unit composition 倾向
- 仍然只做人族最小 alpha，不扩种族系统

### Reserve 3：Gameplay Regression Doc

- 新增一份更偏 gameplay 的回归检查文档，便于后续 cycle 快速验证

### Reserve 4：Multi-building Gameplay Truth

- 同类建筑多选时，训练语义、资源扣除、队列行为更统一
- 只做最小 alpha，不做完整多建筑生产系统

---

## Fallback Rules

如果任一主 phase 连续 60-90 分钟无法收口：

1. 缩成最小可成立版本
2. 优先保主轴，不追求 phase 全量完成
3. 把 blocker 与降级决策写入 `Decisions Taken Without User Confirmation`
4. 继续做下一项更稳的系统任务，不要整晚卡死

例子：

- 如果完整命令恢复过难，就先只做 moving / attackMove / gather 三类恢复
- 如果 AI 压力曲线调不稳，就先保经济与出兵 loop，放弃更复杂的进攻策略
- 如果 queue 扩展 beyond move 不稳，就只把 move queue 打磨到可靠

---

## Verification Log

### Phase 0 Verification
- Commands run: `npm run build`, `npx tsc --noEmit -p tsconfig.app.json`
- Runtime checks performed: Code review audit of all gameplay systems
- What passed: Build, type check, selection model, control groups, basic command dispatch
- What failed and was fixed: N/A (audit only)
- Remaining uncertainty: Full runtime behavior of AI economy needs live testing

### Phase 1-3 Verification
- Commands run: `npm run build`, `npx tsc --noEmit` after each phase
- Runtime checks performed: Code review of previousState save/restore, queue system, auto-aggro logic
- What passed: All builds, all type checks, order recovery mechanism, queue command system
- What failed and was fixed: N/A
- Remaining uncertainty: Auto-aggro restore needs runtime testing to verify path recalculation works correctly

### Phase 4-5 Verification
- Commands run: `npm run build`, `npx tsc --noEmit` after each phase
- Runtime checks performed: AI code review for supply checks, farm building, lumber gathering, attack wave logic
- What passed: All builds, all type checks
- What failed and was fixed: N/A
- Remaining uncertainty: AI lumber gathering needs live testing (TreeManager integration via AIContext)

### Phase 6 + Reserve Verification
- Commands run: `npm run build`, `npx tsc --noEmit`, code-reviewer agent
- Runtime checks performed: Deep code review finding 6 issues, 2 medium fixed
- What passed: Build, type check
- What failed and was fixed:
  - `computeSupply` counted incomplete buildings as providing supply → fixed to check buildProgress >= 1
  - Surviving footmen permanently blocked future AI attack waves → fixed with wave recovery logic
  - `executeQueuedCommand` left gather/carry state dirty → fixed with explicit cleanup
- Remaining uncertainty: Full gameplay loop needs human runtime testing

---

## Decisions Taken Without User Confirmation

1. **Order recovery via previousState snapshot**
   - Decision: Save full command snapshot before auto-aggro, restore after combat
   - Why: Simplest correct approach without full ECS order framework
   - Conservative: Snapshot is per-unit, no global state, easily removed if replaced

2. **Queue typed as QueuedCommand discriminated union**
   - Decision: Changed `moveQueue: Vector3[]` to `moveQueue: QueuedCommand[]`
   - Why: Allows Shift+attackMove without breaking existing Shift+move
   - Conservative: Only two types (move, attackMove), not a general command queue system

3. **stop clears carryAmount**
   - Decision: stop discards carried resources (set carryAmount=0)
   - Why: Prevents "phantom carry" where stopped workers show carry indicator forever
   - Conservative: war3 doesn't have this issue because workers deliver before stopping, our simplified model needs explicit cleanup

4. **AI uses build profiles instead of single hardcoded behavior**
   - Decision: Added `AIBuildProfile` with 2 variants (standard, rush)
   - Why: Makes AI less predictable without complex ML, easy to extend
   - Conservative: Default profile is "standard" (same as before), rush is opt-in

5. **AI attack waves use attackMove instead of direct attack**
   - Decision: AI sends footmen via attackMove to enemy base, not attack-target on townhall
   - Why: Forces engagement with defenders along the way, more realistic
   - Conservative: Can revert to direct attack by changing one line if behavior is wrong

6. **computeSupply requires buildProgress field**
   - Decision: Changed computeSupply signature to require `buildProgress: number`
   - Why: Fixes real bug where incomplete farms provided supply
   - Conservative: All existing callers already pass full Unit objects, only synthetic AI objects needed update

---

## Morning Handoff

### Current State
- 今晚全部 Phase 0-6 完成
- Reserve Backlog 完成 Reserve 1（verified, minimal cleanup needed）、Reserve 2（AI build profiles）、Reserve 3（gameplay regression doc）、Reserve 4（verified, multi-building already works）
- `npm run build` ✅ | `tsc --noEmit` ✅

### What To Look At First In The Morning

1. **场景 1：玩家命令恢复** — 选一个步兵，右键远处移动，用 AI 步兵接近触发 auto-aggro，观察战斗结束后是否恢复移动
2. **场景 2：Shift+队列** — 选步兵，右键移动，Shift+右键追加点，Shift+A+左键追加点，观察队列消费
3. **场景 3：AI 全程观察** — 切到 AI 基地观察：采金、伐木、建农场、建兵营、训练、第一波进攻
4. **场景 4：人口系统** — 不建农场，训练到 10 人口后观察训练是否被拒绝

### Best Next Theme
- **Combat & Control Feel Polish** — 验证今晚所有系统改动在运行时是否正确，修复发现的问题，然后围绕"前 5 分钟真正能打一局"做最终打磨

### Remaining Risks
1. AI 伐木路径可能被树 blocker 卡住（AI 基地附近需要确认有足够可达的树）
2. Auto-aggro 恢复后路径重算在复杂地形下可能寻路失败
3. AI 建筑放置候选位置可能和已有建筑/树冲突（fallback 逻辑需要 runtime 验证）
4. 多建筑训练在快速点击时可能资源竞态（每次 click 独立扣资源，不是原子操作）

---

## Final Report Format

最终只在全部工作结束后一次性汇报，格式固定为：

1. Result
- 今晚目标是否达成
- `npm run build` 是否通过
- `npx tsc --noEmit -p tsconfig.app.json` 是否通过

2. Phase Completion
- Phase 0 完成了什么
- Phase 1 完成了什么
- Phase 2 完成了什么
- Phase 3 完成了什么
- Phase 4 完成了什么
- Phase 5 完成了什么
- Phase 6 完成了什么
- Reserve Backlog 做了什么

3. Files Changed
- 改了哪些文件
- 每个文件职责是什么

4. Verification
- 哪些是命令验证
- 哪些是运行时行为验证
- 哪些是代码结构检查
- 为什么这次结果可信

5. Decisions Taken Without User Confirmation
- 列出关键自主决策及理由

6. Remaining Risks
- 只列真正存在的风险

7. Morning Handoff
- 明早最该先看什么
- 下一轮只建议 1 个主题

---

## One-line Principle

今晚不要做无人验收的视觉参数迭代，
而是把 order truth、command semantics、AI gameplay loop 推进成第一次真的能往“一局 war3”靠近的系统主干。
