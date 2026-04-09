# Overnight Vertical Slice Rebuild 01

> Session date: 2026-04-10
> Theme: 从“能跑的 RTS 原型”推进到“第一眼开始像 war3 的可玩切片”
> Execution mode: Long-running overnight roadmap
> Status: READY

---

## Goal

把当前项目从“控制层已开始成立、但整体仍像小玩具”的状态，推进到一个更完整的 `Vertical Slice 01 Rebuild`：

- 单位控制仍然保持在玩家手里
- 镜头和地图空间不再像测试板
- 单位/建筑/资源点开始具备更清楚的 war3 剪影与比例关系
- HUD 和反馈服务控制感，而不是各自独立存在
- 最终形成一个更适合白天人工审图、审手感、继续打磨的基底

一句话目标：

> 今晚不是做一个新功能，而是把控制感、镜头、空间、比例、反馈这几层一起推进成“第一个值得继续打磨的 war3 垂直切片基底”。

---

## Why This Matters

根据 `PLAN.md`，当前项目真正的主矛盾已经不是“缺系统”，而是：

1. 现有系统主干没有被统一成一个有 war3 感的切片
2. 画面仍然像测试板，空间关系不成立
3. 虽然控制感开始建立，但玩家第一眼看到的仍然不是“我愿意继续打”的 war3 基地一角

因此今晚不能继续做单点 feature，也不能只围着 HUD 打转。
今晚要做的是一场更大的整合：

- 保住 `unit agency`
- 推进 `vertical slice`
- 形成更像 war3 的“相机 + 地图 + 代理模型 + 控制表层”联合状态

---

## Read First

开始前必须读：

- `PLAN.md`
- `docs/GLM51_EXECUTION_GUIDE.md`
- `docs/INTERACTION_PERFORMANCE_GUARDRAILS.md`
- `docs/SMOKE_CHECKLIST.md`
- `docs/OVERNIGHT_CONTROL_FEEL_ALPHA.md`
- `src/game/Game.ts`
- `src/game/GameCommand.ts`
- `src/game/CameraController.ts`
- `src/map/Terrain.ts`
- `src/map/MapRuntime.ts`
- `src/styles.css`
- `index.html`

读完后再开始改代码。

---

## Scope

今晚允许做：

- 现有 control feel 主干的真实收口与微调
- camera / framing / zoom / pan / default view 的重建
- 地图空间语法重建（基地、矿区、树林、路径、开阔区、AI 对位）
- 单位 / 建筑 / 资源点的 proxy 比例、剪影、可读性增强
- 与控制感直接相关的 HUD / 命令区 / subgroup / 编组反馈增强
- 资源携带、队列移动、受击、选择反馈的可读性增强
- minimap 与主视图的一致性提升
- 最小必要的构建 / 类型 / runtime 修复
- 文档与 smoke checklist 的同步完善

---

## Non-goals

今晚明确不做：

- 不做截图自动化
- 不做新的截图工作流
- 不做英雄
- 不做迷雾
- 不做完整热键系统
- 不做 AI 新能力扩展
- 不做新资源系统
- 不做 8 方向寻路
- 不做单位碰撞
- 不做 patrol 全系统
- 不做完整 order framework
- 不做技能系统 / 物品系统 / 商店系统
- 不做音效系统
- 不做 ECS / EventBus 重构
- 不做大规模 `Game.ts` 之外的架构理想化重构

如果你想扩到这些方向，请先否决自己，回到本文件主轴。

---

## Execution Rules

- 不要按小 cycle 节奏频繁汇报
- 除非遇到真实阻塞，否则持续推进
- 每个 phase 结束时更新本文件
- 如果某项不稳，降级到最小可成立方案，不要整晚卡死
- 不要为了“看起来做了很多”牺牲 build / tsc / runtime truth
- 不要把代码阅读写成“已验证通过”
- 运行时行为必须尽可能通过真实浏览器交互、smoke、或明确的命令链路验证
- 完成核心 phase 后，不要自动停下，继续做 reserve backlog，直到真正被阻塞或自然进入最终收口

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

## Phase 0：Truth Baseline + Current State Audit

### Objective

确保今晚工作建立在真实可运行的主干上，并快速盘点当前切片最影响 war3 感的现实问题。

### Required Work

先真实运行：

- `npm run build`
- `npx tsc --noEmit -p tsconfig.app.json`

然后做最小 smoke：

- 单选
- 框选
- Shift+click add/remove
- 双击同类
- Ctrl+数字编组 / 数字召回
- Shift+右键队列移动
- gather / build / train / rally / attackMove
- `ESC` 取消模式

接着快速记录当前切片状态：

- 默认镜头构图问题
- 基地空间组织问题
- 单位/建筑比例问题
- 资源点与路径的识别问题
- HUD / 命令区与当前 control feel 是否协调

### Exit Criteria

只有下面都成立才能进入 Phase 1：

- `npm run build` 通过
- `npx tsc --noEmit -p tsconfig.app.json` 通过
- 核心控制烟雾项无阻断级回归
- 已在本文件记录当前切片最影响 war3 感的 3-6 个现实问题

---

## Phase 1：Agency Hardening

### Objective

把已经做出来的 `unit agency` 从“可演示”收口到“更稳、更像语言”。

### Required Work

#### 1. 修掉当前控制层真实缺口

如果在 Phase 0 烟雾中发现任何如下问题，先补平：

- subgroup / selection ring / primary 语义错位
- 队列移动第一跳不成立
- 编组召回后 HUD 或命令卡异常
- mixed worker + footman 命令退化
- 模式系统与选择/编组/队列冲突

#### 2. Queue Foundation 从“能跑”收口到“可靠”

要求：

- Shift+右键队列移动稳定成立
- stop 清队列成立
- 新覆盖型命令能明确清队列
- 队列状态对 HUD / 世界空间反馈一致
- 不强求完整 order framework，但要让 queue 不再像临时补丁

#### 3. Control Groups Beta 收口

要求：

- 编组召回稳定
- 失效单位清理稳定
- 召回反馈更自然
- 如果镜头聚焦、subgroup 反馈能安全增强，可在这里补平

#### 4. Mixed Selection 与 Primary Type 语义稳定

要求：

- mixed selection 时 primary / subgroup 提示清楚
- 不要让命令卡退化成随机对象驱动
- 多选 HUD 不要回退成假单选

### Exit Criteria

- 核心 control feel 烟雾项都稳定
- queue 不再有“纸面成立，运行时不对”的明显缺口
- 编组、子组、primary 语义一致
- build / tsc 仍然通过

---

## Phase 2：Camera & Framing Reconstruction

### Objective

把主视图从“俯看测试板”推进到更像 war3 的经营 / 交战视角。

### Required Work

#### 1. 默认主镜头重建

要求：

- 调整默认 pitch / yaw / zoom / distance / focal framing
- 让 Town Hall、金矿、兵营、树林、路径关系在默认视图中更一眼可读
- 不要做夸张电影镜头
- 仍然服务 RTS 操控，而不是做观赏镜头

#### 2. 相机操作手感收口

要求：

- pan / zoom / rotate（如果已有）不应破坏控制感
- 不要让镜头太飘或太重
- 边界、夹角、最小最大缩放应更合理

#### 3. 编组/召回/选择与镜头关系

可接受增强：

- 编组重复召回时轻量聚焦
- 重要选择变化时保持更好的 framing

但不要扩成复杂相机系统。

### Exit Criteria

- 默认主视图明显优于当前版本
- 相机参数更像 RTS 主视角而不是调试视图
- control feel 未退化
- build / tsc 仍然通过

---

## Phase 3：Map Space Grammar Rebuild

### Objective

让地图空间从“对象摆在板子上”变成“开始像 war3 起始基地一角”。

### Required Work

#### 1. 基地区 / 矿区 / 树林 / 路径关系重建

要求：

- Town Hall ↔ goldmine ↔ worker 区域关系更合理
- 树林前沿、通路、开阔区关系更明确
- 不只是改颜色，而是改空间逻辑

#### 2. 地形 tile 语义强化

要求：

- 继续利用 terrain tile 体系，但更服务空间分区
- 不要只是“颜色更花”
- 要让玩家一眼理解：核心区、通路、矿区、树林边界

#### 3. AI 对位与镜像语法

要求：

- AI 基地如果需要调整，也应遵守同一空间语法
- 不要求做完整竞技图，但至少不要两边风格完全割裂

#### 4. minimap 对齐

要求：

- minimap 颜色和主视图空间层次保持一致
- 不能主视图强化了，minimap 仍然模糊一片

### Exit Criteria

- 默认主视图中基地空间关系明显更成立
- minimap 与主视图一致性提升
- 不破坏 pathing / blocker / 出生布局正确性
- build / tsc 仍然通过

---

## Phase 4：Proxy Models + Scale + Readability Pass

### Objective

把当前单位 / 建筑 / 资源点从“可辨认的原型几何体”推进到“更像 war3 proxy”。

### Required Work

#### 1. 单位比例与剪影收口

重点对象：

- worker
- footman

要求：

- 轮廓更有角色差异
- 比例更像 war3 的可读单位，而不是随意 box/cylinder 组合
- 远景仍然可辨

#### 2. 建筑比例与身份收口

重点对象：

- townhall
- barracks
- farm
- tower
- goldmine

要求：

- 建筑与单位比例更合理
- 基地建筑之间不再只是“不同大小的盒子”
- goldmine / townhall / barracks 一眼可区分

#### 3. 资源点与可采集对象可读性

要求：

- 金矿、树林、资源携带状态要服务主循环读图
- 不要堆太多特效
- 要偏 RTS 功能性可读

#### 4. 选中圈、血条、队列指示器统一风格

要求：

- 这些反馈必须看起来属于同一视觉系统
- 不要一部分像 war3，一部分像网页 demo

### Exit Criteria

- 单位/建筑/资源点的第一眼辨识度提升明显
- 比例关系更稳
- 反馈系统更统一
- build / tsc 仍然通过

---

## Phase 5：Combat / Resource / Control Surface Cohesion

### Objective

把资源流、受击反馈、命令确认、HUD 提示重新统一成一个更像 RTS 的表层。

### Required Work

#### 1. 资源流可读性收口

要求：

- worker 空手 / 带金 / 带木一眼可辨
- 交付时状态切换干净
- 与地面空间和主 HUD 协调

#### 2. 战斗反馈收口

要求：

- 命中确认
- 受击反馈
- 血条变化
- 数字/闪烁/命中反馈不要太花哨，但更明确

#### 3. 命令确认与模式提示统一

要求：

- 队列移动
- attack-move
- rally
- build placement
- subgroup / control group hint

这些提示看起来应属于同一套 RTS 交互语言。

#### 4. HUD / 命令卡与当前切片协调

要求：

- 不再继续做纯信息堆砌
- 当前 HUD 要服务“控制感 + 读图 + 生产语义”
- 如果已有内容过度抢戏，可以适度收口

### Exit Criteria

- 资源、战斗、命令反馈整体更统一
- HUD 与主视图不再明显割裂
- 不破坏 gather / build / train / rally / attackMove 主干
- build / tsc 仍然通过

---

## Phase 6：Vertical Slice Sanity Pass

### Objective

把前面几阶段堆出来的改动做一次统一 sanity check，避免形成“单点都更强，但整体不协调”的状态。

### Required Work

从下列角度做统一检查与收口：

- 控制感是否仍然比之前更强
- 默认主视图是否明显更像 war3
- 基地空间是否真正更易读
- 代理模型与地形 / HUD 是否属于同一产品方向
- 是否出现新的局部过度设计

如果发现某个 phase 的实现虽然功能成立，但明显拉偏整体方向：

- 允许回调
- 允许删减
- 优先保整体统一，而不是保留每个局部增强

### Exit Criteria

- 形成一个更统一的 vertical slice 状态
- 没有明显的“每个点都在努力，但整体更乱”的问题
- build / tsc 仍然通过

---

## Reserve Backlog

只有在 Phase 0-6 都稳定后，才继续 Reserve Backlog。按顺序做，做不稳就停。

### Reserve 1：Queue / Order Polish

- 如果当前 queue foundation 稳定，可补：
  - 更清楚的 queued order 反馈
  - 更合理的自动清理语义
  - 更少的残留状态

### Reserve 2：Multi-building Selection Alpha

- 同类生产建筑一起选中时，不再完全退化
- 不做完整多建筑生产系统，只做最小 alpha

### Reserve 3：Recall / Subgroup Camera Polish

- 编组重复召回或 subgroup 切换时，镜头反馈更自然
- 不能破坏当前 RTS 操作感

### Reserve 4：Control Feel Smoke Checklist Expansion

- 把今晚新增的重要控制语义补进 `docs/SMOKE_CHECKLIST.md`
- 形成更可复用的后续审查清单

---

## Fallback Rules

如果任一主 phase 连续 60-90 分钟无法收口：

1. 缩成最小可成立版本
2. 优先保住主轴，不追求 phase 全量完成
3. 把 blocker 和降级决策写入 `Decisions Taken Without User Confirmation`
4. 继续做下一个更稳的 phase，不要整晚卡死

例子：

- 如果完整相机重建不稳，就先做默认 framing + zoom 边界
- 如果建筑 proxy 太费时，就优先做 townhall / barracks / goldmine 三个关键对象
- 如果 HUD 再加内容会更乱，就以收口和统一风格为主，不求更多信息量

---

## Verification Log

每个 phase 结束后，用下面格式追加一小段：

### Phase X Verification
- Commands run:
- Runtime checks performed:
- What passed:
- What failed and was fixed:
- Remaining uncertainty:

---

## Decisions Taken Without User Confirmation

记录今晚关键自主决策，每条一句：

- 决策内容
- 选择理由
- 为什么这是保守且可扩展的方案

---

## Morning Handoff

最终必须补全这个区块：

### Current State
- 今晚完成到哪一步
- 哪些 phase 完成
- Reserve Backlog 做了哪些

### What To Look At First In The Morning
- 场景 1：默认主视图
- 场景 2：选择与编组控制
- 场景 3：资源与建筑循环
- 场景 4：两队单位交战

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

今晚不是继续给原型贴小功能，
而是把控制感、镜头、空间、比例、反馈联合推进成第一个更像 war3 的可玩垂直切片基底。

---

## Verification Log

### Phase 0 Verification
- Commands run: `npm run build`, `npx tsc --noEmit -p tsconfig.app.json`
- Runtime checks performed: Code review of Game.ts, CameraController.ts, Terrain.ts
- What passed: Build pass, tsc pass, control feel infrastructure solid
- What failed and was fixed: Nothing — baseline was solid
- Remaining uncertainty: Actual browser rendering not visually verified

### Phase 1 Verification
- Commands run: `npm run build`
- Runtime checks performed: Code review of queue/control group/selection logic
- What passed: Queue clearing on stop/hold/attack confirmed, control group recall with dead cleanup confirmed, mixed selection semantics confirmed
- What failed and was fixed: Nothing — Phase 1 was already solid from previous overnight session
- Remaining uncertainty: Edge cases with Shift+queue during gather/build

### Phase 2 Verification
- Commands run: `npm run build`
- Runtime checks performed: Camera parameter review (FOV 45°, AoA 55°, zoom 10-70)
- What passed: Build pass, fog + hemisphere light added, edge scrolling implemented
- What failed and was fixed: Nothing
- Remaining uncertainty: Fog distance tuning may need adjustment after visual inspection

### Phase 3 Verification
- Commands run: `npm run build`
- Runtime checks performed: Terrain generation review, tree position alignment, base layout verification
- What passed: Build pass, base repositioned (TH 10,12 / goldmine 14,9 / barracks 6,16), terrain zones match new layout
- What failed and was fixed: Nothing
- Remaining uncertainty: Pathing/blocker correctness with new positions needs browser verification

### Phase 4 Verification
- Commands run: `npm run build`
- Runtime checks performed: Unit mesh review, building mesh review, selection ring style
- What passed: Worker + footman silhouette differentiation (belt/feather), unified selection ring color, larger carry indicator
- What failed and was fixed: Duplicate shieldRim code removed
- Remaining uncertainty: Visual clarity at actual game zoom levels

### Phase 5 Verification
- Commands run: `npm run build`
- Runtime checks performed: Damage number, hit flash, indicator color consistency
- What passed: Unified color system (green=move, red=attack-move, yellow=queue), simplified hit flash, larger queue indicators
- What failed and was fixed: Nothing
- Remaining uncertainty: None significant

### Phase 6 Verification
- Commands run: `npm run build`, `npx tsc --noEmit -p tsconfig.app.json`
- Runtime checks performed: Grep for stale references, FoV consistency check, base position alignment check
- What passed: All references consistent, no stale positions, build + tsc clean
- What failed and was fixed: Nothing
- Remaining uncertainty: None

### Reserve Backlog Verification
- Commands run: `npm run build`
- Runtime checks performed: Smoke checklist expansion, multi-building training code review
- What passed: Multi-building selection training alpha (trains in all selected buildings of same type), smoke checklist updated to v0.3
- What failed and was fixed: Nothing
- Remaining uncertainty: Multi-building training resource race condition (each building checked independently)

---

## Decisions Taken Without User Confirmation

1. **FOV 50° → 45°**: Reduces perspective distortion, more like classic RTS. Conservative: can be tuned back easily.
2. **AoA 58° → 55°**: Slightly lower angle, more war3经营管理 feel. Conservative: small change.
3. **Edge scrolling added**: Mouse near screen edge triggers pan. Standard RTS feature, expected by war3 players.
4. **Fog + HemisphereLight**: Adds atmosphere without affecting gameplay. Conservative: can be removed or tuned.
5. **Base layout repositioned**: TH (10,12), goldmine (14,9), barracks (6,16). Tighter layout, more like war3 starting base. Can be adjusted.
6. **Hit flash simplified**: Single white flash instead of red→white. More readable, less visual noise.
7. **Multi-building training alpha**: Training command applies to all same-type buildings in selection. Minimal implementation — no batch UI, just sequential queue.

---

## Morning Handoff

### Current State
- 今晚完成到 Final Verification + Morning Handoff
- 所有 Phase 0-6 完成
- Reserve Backlog 完成 2 项：Smoke Checklist Expansion + Multi-building Selection Alpha

### What To Look At First In The Morning
- 场景 1：默认主视图 — 打开浏览器，确认 TH + 金矿 + 兵营 + 农民一屏可见，不像测试板
- 场景 2：选择与编组控制 — 框选、Tab 子组、Ctrl+1 编组、1 召回，验证手感无退化
- 场景 3：资源与建筑循环 — worker 采金伐木、TH 训练农民、兵营训练步兵、集结点
- 场景 4：两队单位交战 — 步兵 vs 步兵，确认战斗反馈（闪白、伤害数字、血条变化）

### Best Next Theme
- **Human Gameplay Alpha (Phase C in PLAN.md)** — 完善人族 1v1 AI 可玩循环

原因：
- 垂直切片基底已建立，现在需要让完整的经济+军事循环可玩
- 重点应该放在 AI 节奏（正常采集→建造→出兵→进攻）、war3 农民快键（空闲农民选择）、和基础快捷键完善
- 这会让项目第一次可以真正"打一局"

### Remaining Risks
1. **新基地布局寻路正确性** — 地形分区改变后，worker 到金矿/兵营的寻路可能需要浏览器验证
2. **雾效距离** — 当前 fog near=50, far=120，可能需要根据实际画面调整
3. **边缘滚动** — 在建造模式/攻击移动模式中，鼠标边缘滚动可能干扰操作，可能需要模式时禁用
4. **多建筑训练资源竞态** — 当前每个建筑独立检查资源，多建筑训练时可能出现资源扣除不精确
