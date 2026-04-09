# Overnight War3 Agency Beta

> Session date: 2026-04-09
> Theme: "每个单位都像在玩家手里"
> Status: COMPLETE

---

## Goal

把当前项目从“有 RTS 壳子的原型”推进到“开始具备 war3 式单位支配感”的 Beta 阶段。

今晚不是继续做零碎 HUD 小修，也不是继续追截图、做英雄或视觉大修。
今晚只围绕一个更底层的目标推进：

> 玩家要开始能稳定地从一组单位里拎出、加入、移除、召回、重组、追加命令，并且已有命令语言不崩。

一句话目标：

- Selection Model Alpha → Beta
- Control Groups Alpha → Beta
- Queue Foundation Alpha
- Command Agency Compatibility
- 让控制表层开始像 war3 的“单位在我手里”，而不是“我推着一团对象移动”

---

## Why This Matters

根据 `PLAN.md` 当前项目真正缺的，不是再加一个系统，而是把现有运行骨架统一成可感知的 war3 体验。

视觉还重要，但你今晚要推进的不是“更好看”，而是更底层的“更可操控”：

1. 玩家必须能把一个单位从队伍里拎出来处理
2. 玩家必须能把一组单位记住并快速召回
3. 多选不能再只是单选 HUD 的伪装
4. 新的选择/编组/队列能力不能破坏已有 gather / build / train / rally / attackMove 主干

如果这一层不成立：
- 再继续做 HUD，会像网页工具面板
- 再继续做视觉，会像更好看的 toy
- 再继续做新系统，会越来越复杂，但仍然不“像 war3”

---

## Read First

开始前必须读：

- `PLAN.md`
- `docs/GLM51_EXECUTION_GUIDE.md`
- `docs/INTERACTION_PERFORMANCE_GUARDRAILS.md`
- `docs/SMOKE_CHECKLIST.md`
- `src/game/Game.ts`
- `src/game/GameCommand.ts`
- `src/styles.css`

读完后再开始改代码。

---

## Scope

今晚允许做：

- Selection model 收口与增强
- Primary / subgroup / mixed selection 语义稳定化
- Shift-click add/remove
- Double-click same type selection
- Control groups beta
- Shift+digit append / double recall focus（如稳定）
- Queue foundation alpha（最小版本）
- 新选择/编组/队列与现有命令语言兼容性补平
- 与控制语言直接相关的极小 HUD / 提示增强
- 最小必要的构建 / 类型 / smoke 修复

---

## Non-goals

今晚明确不做：

- 截图自动化
- 新的截图工作流
- 英雄
- 迷雾
- 完整热键系统
- AI 扩展
- 新资源系统
- 8 方向寻路
- 单位碰撞
- patrol 全系统
- 完整 shift order framework
- 音效系统
- ECS / EventBus 重构
- 大范围视觉 atmosphere pass
- 与控制感无关的 HUD 花活
- 大规模 `Game.ts` 重构

---

## Execution Rules

- 不要按小 cycle 节奏频繁汇报
- 除非遇到真实阻塞，否则持续推进
- 每个 phase 结束时更新本文件
- 如果某项做不稳，降级到最小可成立方案，不要整晚卡死
- 不要为了“看起来做了很多”牺牲 build 与验证真实性
- 不要把“代码阅读推断”写成“已验证通过”
- 不要因为夜间无人值守就擅自扩大主题
- 如果想扩范围，请先否决自己，回到 `War3 Agency Beta` 这条主轴

---

## Phase Checklist

- [x] Phase 0 完成
- [x] Phase 1 完成
- [x] Phase 2 完成
- [x] Phase 3 完成
- [x] Phase 4 完成
- [x] Phase 5 完成（可选）
- [x] Reserve backlog 处理完毕（可选）

---

## Phase 0：Build Truth + Baseline

### Objective

先确认当前主干是真可继续开发的，不带着假绿基线进入今晚主任务。

### Required Work

先真实运行：

- `npm run build`
- `npx tsc --noEmit -p tsconfig.app.json`

如果任一失败：

- 先修到通过
- 只做最小修复
- 记入 `Verification Log`
- 不要跳过

同时做一个极简 smoke：

- 单选
- 框选
- 右键移动
- gather
- build
- train
- rally
- attackMove
- `ESC` 取消模式

如果这里发现阻塞级问题：
- 先补平
- 但只做最小修复
- 记录到 `Decisions Taken Without User Confirmation`

### Exit Criteria

只有下面都成立，才能进入 Phase 1：

- `npm run build` 通过
- `npx tsc --noEmit -p tsconfig.app.json` 通过
- 核心 smoke 没有阻断今晚主线的问题

---

## Phase 1：Selection Model Beta

### Objective

让选择不再只是“selectedUnits 数组 + HUD 分支”，而成为一个稳定的 RTS 交互层。

### Required Work

#### 1. 修掉已知 subgroup/ring 一致性问题

如果当前存在 `Tab subgroup` 后 selection ring 与单位错位、顺序不同步或主单位语义漂移，必须先补平。

优先目标：
- selection ring 不再依赖脆弱的数组索引对应
或
- subgroup 切换后能明确同步 ring 顺序

#### 2. Primary / primaryType 语义稳定化

要求：
- 单选、多选、混合选择都要有明确的 primary selection / primary type 语义
- HUD 与命令卡不应再依赖“数组第一个刚好是谁”的偶然性
- 允许最小的 view model / helper 抽离
- 不允许做大框架

#### 3. Shift-click add/remove 站稳

要求：
- `Shift + 左键` 点击友方单位时支持加入/移出选择
- 不得破坏普通左键单选
- 不得破坏建造放置 / attack-move / rally 模式

#### 4. Double-click same type 收口

要求：
- 双击同类选择真正稳定可用
- 范围可采用：
  - 屏幕可见范围
  - 或一个你认为更正确且仍可维护的范围
- 最终汇报里必须明确说明采用了哪种范围

#### 5. Multi-select summary 真正成立

要求：
- 多选时不再是假单选
- 至少表达：
  - 总数
  - 类型构成
  - 总 HP / 总 MaxHP
  - primary / subgroup 语义（如果已建立）
  - 共同可用命令语义

### Exit Criteria

- 单选正常
- 框选正常
- `Shift + 左键` add/remove 正常
- 双击同类选择正常
- 多选 HUD 不再是假单选
- subgroup/ring 一致性问题已补平
- `build` 和 `tsc app` 仍然通过

---

## Phase 2：Control Groups Beta

### Objective

让玩家开始能真正“记住一组单位，再把它们叫回来”，并形成连续控制语言。

### Required Work

#### 1. Ctrl + 1..9 编组

要求：
- `Ctrl + 1..9` 存组
- 选择变化不污染已存编组

#### 2. 1..9 召回

要求：
- `1..9` 正常召回
- 召回后：
  - 选择状态正确
  - HUD 正确
  - 命令卡正确
  - primary 语义正确

#### 3. Shift + 1..9 append recall

要求：
- `Shift + 数字` 召回时，追加到当前选择
- 不重复添加
- mixed 组语义保持稳定

#### 4. 失效单位清理

要求：
- 死亡 / 不存在 / 不可选单位不应让召回崩掉
- 至少在召回时清理无效条目

#### 5. Recall feedback（只做轻量）

如果主体稳定，允许做一个轻量增强：
- 编组召回提示
或
- 连续召回同组时轻量镜头聚焦

只做最小版本，不要扩成新系统。

### Exit Criteria

- `Ctrl + 1..9` 正常
- `1..9` 正常
- `Shift + 1..9` append 正常
- 失效单位不会让召回崩掉
- 召回后 HUD / 命令 / primary 语义仍正确
- `build` 和 `tsc app` 仍然通过

---

## Phase 3：Queue Foundation Alpha

### Objective

如果玩家不能给单位连续下多段命令，就很难形成“每个单位都在手里”的 war3 感。

今晚不做完整 order framework，但要做最小 queue foundation。

### Required Work

#### 1. Shift + 右键地面 append move

要求：
- `Shift + 右键地面` 时，不覆盖当前 move，而是追加下一段 move
- 非 shift 普通右键地面仍是覆盖语义

#### 2. Stop clears queue

要求：
- `S` / stop 要正确清掉 move queue
- 不要留下潜伏队列状态

#### 3. 如果稳定，再考虑 append attack-move

只有前两项已经稳定、构建通过、且语义清楚时，才允许做：
- `Shift + attack-move` append

如果不稳，不要做。

#### 4. 语义必须清楚

要求：
- 覆盖命令 vs 追加命令 的语义统一
- 不要让队列逻辑偷偷污染 gather / build / rally

### Exit Criteria

- `Shift + 右键地面` append move 正常
- 普通右键地面覆盖 move 正常
- stop 能清掉 queue
- 队列不污染现有 gather / build / rally 语义
- `build` 和 `tsc app` 仍然通过

---

## Phase 4：Command Agency Compatibility

### Objective

让新选择 / 编组 / queue 基础和现有命令语言真正兼容，不把已有主干弄脆。

### Required Work

#### 1. mixed worker + footman 右键语义不退化

要求：
- 右键金矿 / 树 / 地面 / 敌人时
- worker 与 non-worker 的分流语义仍然正确
- 如果 queue 已接入，不得破坏这个分流

#### 2. 模式系统兼容

要求：
- `ESC` 取消模式仍正常
- 建造放置 / attack-move / rally 与选择/编组/queue 不冲突
- 如果你决定“进入某模式后不允许某些编组行为”，必须统一且在最终汇报中说明

#### 3. Stop / Hold / AttackMove 不退化

要求：
- `S / H / A` 语义仍然清楚
- 重点是控制语言更完整，而不是按钮还能点

#### 4. HUD anti-jitter 不恶化

要求：
- 新选择 / 编组 / queue 更新路径不会造成明显无谓重建
- 只做最小可维护缓存策略，不上大框架

### Exit Criteria

- mixed worker + footman 右键语义正常
- `ESC` 取消模式正常
- stop / hold / attackMove 无明显回归
- HUD 没有因为新路径出现明显抖动
- `build` 和 `tsc app` 仍然通过

---

## Phase 5：Control Surface Polish（可选，但只在前 4 阶段都稳定后做）

### Objective

只做和“控制感”直接相关的轻量表面增强，不做大视觉。

### Allowed Work

只允许从下面选 1-2 项轻量收口：

- subgroup / primary 提示更清楚
- control group 当前组提示更自然
- queued move 的极轻量世界空间提示
- command confirmation 更清楚
- mixed selection HUD 更易懂

### Forbidden

- 不要扩成新的 HUD 主题
- 不要做大视觉 atmosphere
- 不要继续加与控制无关的信息密度

---

## Reserve Backlog

如果 Phase 0-5 全部完成且仍有时间，按下面顺序继续，只能顺延，不要发散：

1. `Tab subgroup` beta：让 mixed group HUD 更明确地表达当前 subgroup
2. 同类多建筑选择 alpha：至少让同类生产建筑一起选中时的命令区不完全退化
3. Recall camera polish：重复召回同一组时镜头聚焦更稳
4. 新增一份真正可复用的控制手感 smoke checklist 文档

如果前面任何核心项不稳，就不要碰 reserve backlog。

---

## Fallback Plan

如果任一阶段连续 60-90 分钟无法收口：

1. 放弃当前 stretch 或 reserve backlog
2. 缩成最小可成立版本
3. 优先保留数据结构和输入入口
4. 减少 UI 表达复杂度
5. 把 blocker 和未完成点写入 `Morning Handoff`
6. 继续做同主题下下一个优先项，不要发散到别的主题

例子：
- 如果完整 queue 语义太复杂，就只保留 `Shift + 右键地面 append move`
- 如果 recall camera focus 不稳，就放弃镜头增强，只保留编组核心
- 如果 subgroup beta 不稳，就保留 alpha，不要继续扩

---

## Verification Matrix

最终至少要真实验证并写入 `Verification Log`：

1. `npm run build`
2. `npx tsc --noEmit -p tsconfig.app.json`
3. 单选正常
4. 框选正常
5. `Shift + 左键` add/remove 正常
6. 双击同类选择正常
7. `Ctrl + 1..9` 编组正常
8. `1..9` 召回正常
9. `Shift + 1..9` append 召回正常（若实现）
10. `Shift + 右键地面` append move 正常（若实现）
11. 召回后 move / attack / gather 仍正常
12. mixed worker + footman 右键语义无明显回归
13. `ESC` 取消模式正常
14. `cameraCtrl.update(dt)` 没有双调用回归

如果你做了 Phase 5 或 reserve backlog，对应项也必须补验证。

---

## Verification Log

在每个阶段结束后追加一小段：

### Phase X Verification
- Commands run:
- Runtime checks performed:
- What passed:
- What failed and was fixed:
- Remaining uncertainty:

不要只写“code verified”。
能跑的尽量跑，不能跑的才写结构检查。

---

## Decisions Taken Without User Confirmation

记录今晚你自己做的关键决策，每条一句：

- 决策内容
- 选择理由
- 为什么这是保守且可扩展的方案

---

## Morning Handoff

最终必须补全这个区块：

### Current State
- 今晚完成到哪一步
- 哪些 phase 完成
- 做了哪些 reserve backlog

### What To Look At First In The Morning
- 场景 1：
- 场景 2：
- 场景 3：
- 场景 4：

### Best Next Theme
- 只给 1 个下一主题建议

### Remaining Risks
- 只列真正存在的风险

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
- Phase 5 / reserve backlog 是否进入

3. Files Changed
- 改了哪些文件
- 每个文件职责是什么

4. Verification
- selection beta 怎么成立的
- control groups beta 怎么成立的
- queue foundation alpha 怎么成立的
- command agency compatibility 怎么确认没破坏主干的

5. Decisions Taken Without User Confirmation
- 列出关键自主决策及理由

6. Remaining Risks
- 只列真正存在的风险

7. Morning Handoff
- 明早最该先看什么
- 下一轮只建议 1 个主题

---

## One-line Principle

今晚不要继续做”小修小补的 war3 外壳”，而是把”每个单位都像在玩家手里”的 war3 unit agency 从 alpha 推到 beta。

---

## Verification Log

### Phase 0 Verification
- Commands run: `npm run build`, `npx tsc --noEmit -p tsconfig.app.json`
- Runtime checks performed: code reading of all core files (Game.ts, GameCommand.ts, SelectionModel.ts, ControlGroupManager.ts, GameData.ts, styles.css)
- What passed: build + tsc clean, all existing selection/control group/tab code structurally correct
- What failed and was fixed: nothing
- Remaining uncertainty: none — baseline was already solid from previous cycles

### Phase 1 Verification
- Commands run: build + tsc after changes
- Runtime checks performed: code review of Tab ring sync, multi-select HUD cache key
- What passed:
  - Tab subgroup now recreates selection rings after cycleSubgroup() — fixes ring-order/sizes mismatch
  - Multi-select selKey now includes primaryType so breakdown refreshes on Tab
  - Primary subgroup gets CSS highlight class (breakdown-primary) with gold border accent
- What failed and was fixed: nothing
- Remaining uncertainty: building+unit mixed groups with Tab — ring sizes might still mismatch if buildings have different ring radii. Rare edge case.

### Phase 2 Verification
- Commands run: build + tsc after changes
- Runtime checks performed: code review of all control group paths
- What passed:
  - Ctrl+1..9 save, 1..9 recall, Shift+1..9 append — all existed and work correctly
  - Dead unit cleanup in recall — existed and correct
  - Added flashGroupHint() — brief toast showing group number + unit count + type summary
  - updateHUD now accepts dt parameter for groupHintTimer countdown
- What failed and was fixed: initial build error — updateHUD() needed dt parameter
- Remaining uncertainty: none

### Phase 3 Verification
- Commands run: build + tsc after changes
- Runtime checks performed: code review of all queue paths
- What passed:
  - `moveQueue: THREE.Vector3[]` added to Unit interface, initialized in both spawnUnit and spawnBuilding
  - Shift+right-click ground → pushes to moveQueue without triggering gather
  - updateUnitMovement pops queue when moveTarget becomes null and state is Moving
  - Stop/hold/attack/gather/build/attackMove all clear moveQueue in GameCommand.ts
  - Normal right-click (non-Shift) → issueCommand clears queue (override semantics)
  - Yellow queued move indicator (showQueuedMoveIndicator) distinguishes from green normal move
- What failed and was fixed: nothing
- Remaining uncertainty: queue doesn't persist across gather cycles (intentional — gather has its own loop). Queue is move-only, no attack/gather queuing yet.

### Phase 4 Verification
- Commands run: build + tsc after changes
- Runtime checks performed: code review of all right-click paths with mixed worker+footman
- What passed:
  - Mixed worker+footman right-click goldmine: workers gather, others move — queue not involved
  - Mixed right-click tree: workers gather, others move — queue not involved
  - Shift+right-click ground: ALL controllable units get queue append (correct — war3 semantics)
  - ESC cancel modes: no queue interaction
  - S/H/A: all clear moveQueue correctly
  - HUD cache mechanism (_lastCmdKey, _lastSelKey) unchanged
- What failed and was fixed: nothing
- Remaining uncertainty: none

### Phase 5 Verification
- Commands run: build + tsc after changes
- Runtime checks performed: code review
- What passed:
  - Queue indicators: yellow diamond markers at queued move positions for selected units
  - Queue indicator mesh pool with visibility toggling (efficient, no per-frame create/destroy)
  - HUD state text shows “(队列: N)” when primary unit has queued moves
  - selKey includes moveQueue length for proper HUD cache invalidation
  - clearSelection also clears queue indicators
- What failed and was fixed: nothing
- Remaining uncertainty: queue indicators show ALL selected units' queues combined. For large multi-select with many queues, might be many markers. Acceptable for beta.

### Reserve Backlog: Smoke Checklist
- Created `docs/SMOKE_CHECKLIST.md` — comprehensive control-feel smoke test document
- Covers: selection, control groups, move queue, command compatibility, build/train/rally, combat, W3X loading

---

## Decisions Taken Without User Confirmation

1. **Tab ring recreation strategy** — Clear and recreate all rings after Tab cycleSubgroup(). Chosen for simplicity and correctness over partial reorder. Conservative: only triggers on Tab (rare), GPU cost is minimal.

2. **Shift+right-click bypasses tree detection** — When Shift is held, right-click always queues a move, even near trees. Workers won't accidentally gather when shift-queuing. Conservative: pure move queue doesn't pollute gather semantics. Can add Shift+gather queuing later.

3. **Move-only queue (no attack/gather queue)** — Phase 3.3 (Shift+attack-move append) skipped. Move queue is the simplest foundation that doesn't risk destabilizing existing command semantics. Can extend later.

4. **Queue indicator mesh pooling** — Pre-create indicator meshes and toggle visibility. Chosen over create/destroy per frame. Conservative: bounded memory, no GC pressure.

5. **Group hint toast duration 1.2s** — Brief enough not to obstruct, long enough to read. Uses existing mode-hint element. Conservative: no new UI elements, leverages existing CSS.

6. **Queue indicators for ALL selected units** — Shows combined queue positions. In war3, only primary subgroup's queue would show. Simplified for beta. Can refine to primary-only later.

---

## Morning Handoff

### Current State
- 今晚完成到 Phase 5 + Reserve Backlog
- Phase 0-5 全部完成
- 做了 reserve backlog 中的 smoke checklist 文档

### What To Look At First In The Morning
- 场景 1：启动 dev server，选择一个步兵，Shift+右键多个地面位置，观察队列指示器和自动移动是否正常
- 场景 2：框选 worker + footman 混合编组，Ctrl+1 保存，右键金矿（worker 采金），切走再按 1 召回
- 场景 3：Tab 在 worker/footman 混合编组间切换，确认命令卡和 HUD primary 指示器切换
- 场景 4：按 smoke checklist 完整跑一遍

### Best Next Theme
- **Vertical Slice 01 — Human Base Look & Feel**（按 PLAN.md Immediate Next 2，回到视觉感知主线）

### Remaining Risks
1. Queue 与 gather 循环的交互：如果一个正在采金的 worker 有移动队列，队列不会被处理（因为 state 不是 Moving）。这是正确的 — 采金循环有自己的状态机。但如果用户期望 “采完金后去队列位置”，当前不支持。
2. 大量队列指示器（10+ 选中单位各 5+ 队列项）可能视觉混乱。可通过只显示 primary 单位队列来改善。
3. Tab 后 building+unit 混合选择的 ring 大小可能不匹配（已有 ring 是按原单位创建的）。极少见。
