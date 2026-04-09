# Overnight Control Feel Alpha

> Session date: 2026-04-09
> Theme: "每个单位开始像在玩家手里"
> Status: **COMPLETE**

---

## Goal

建立 war3 风格的控制语言第一版：选择模型、编组系统、命令兼容性。
让玩家能从一组单位里拎出、加入、移除、召回、重组单位，并且已有命令语言不崩。

## Scope / Non-goals

### Scope
- Selection Model Alpha (primary selection, multi-select, Shift+click, double-click)
- Control Groups Alpha (Ctrl+1..9 store, 1..9 recall, dead cleanup)
- Command Agency Polish (verify no regression in move/attack/gather/build/train/rally/stop/hold/attackMove)
- Tab subgroup alpha (stretch goal)

### Non-goals
- 截图自动化
- 英雄系统
- 迷雾
- 完整热键系统
- AI 扩展
- 新资源系统
- 8 方向寻路
- 单位碰撞
- patrol
- shift command queue
- 音效系统
- ECS / EventBus 重构
- 大范围视觉 atmosphere pass
- 无关 HUD 花活

## Phase Checklist

### Phase 0: Build Truth + Baseline
- [x] `npm run build` 通过
- [x] `npx tsc --noEmit -p tsconfig.app.json` 通过
- [x] Smoke: 单选 (code verified)
- [x] Smoke: 框选 (code verified)
- [x] Smoke: 右键移动 (code verified)
- [x] Smoke: gather (code verified)
- [x] Smoke: build (code verified)
- [x] Smoke: train (code verified)
- [x] Smoke: rally (code verified)
- [x] Smoke: attackMove (code verified)
- [x] Smoke: ESC cancel (code verified)

### Phase 1: Selection Model Alpha
- [x] Primary selection / primary type 语义 — `SelectionModel.primary` / `.primaryType`
- [x] 多选不是假单选 — `SelectionModel` 有明确的 units 数组，primary 是 units[0]
- [x] Shift + 左键 add/remove 友方单位 — 敌方单位被忽略
- [x] 双击同类选择 — 当前屏幕可见范围（350ms 窗口，保持 primary 在首位）

### Phase 2: Control Groups Alpha
- [x] Ctrl + 1..9 存编组 — `ControlGroupManager.save()`
- [x] 1..9 召回编组 — `ControlGroupManager.recall()`
- [x] 召回时自动清理死亡/失效单位 — `recall()` 自动过滤 dead + 不在 units 列表中的
- [x] 召回后 HUD / 选择 / 命令语义正确 — 重置 `_lastCmdKey` / `_lastSelKey` 缓存

### Phase 3: Command Agency Polish
- [x] mixed worker + footman 右键语义不退化 — 右键金矿/树：worker gather + nonWorker move
- [x] ESC 取消模式仍然正常 — `cancelAllModes()` 不涉及选择
- [x] stop / hold / attackMove 没有明显回归 — 键盘绑定路径不变
- [x] HUD 不会因为选择/编组新路径出现明显抖动 — `primary` 和缓存键稳定

### Stretch
- [x] Tab subgroup alpha — `SelectionModel.cycleSubgroup()` 按类型轮转 primary

## Decisions Taken Without User Confirmation

1. **选择 `SelectionModel` 作为独立类而非直接改数组** — 因为后续 Tab 子组、编组召回、shift 操作都需要统一的选择语义，独立类更不容易出错
2. **`ControlGroupManager` 存储引用而非 ID** — 当前单位系统没有稳定 ID，引用是唯一选项；死亡清理在 recall 时执行
3. **双击范围 = 当前屏幕可见** — war3 实际上是整个地图同类，但屏幕范围更安全（避免一次选中 50 个单位导致性能问题）；在 Morning Handoff 中记录了这个差异
4. **`handleDeadUnits` 从 splice 改为 filter 批量移除** — 修复了原有的 O(n²) 性能问题和潜在索引错乱
5. **Tab 子组而非镜头聚焦** — Tab 对控制语言的价值更高，且实现更安全
6. **`selectedUnits` 改为 getter（readonly）** — 防止未来代码绕过 SelectionModel 直接修改数组

## Verification Log

| Time | What | Result |
|------|------|--------|
| 22:00 | npm run build (baseline) | PASS |
| 22:00 | tsc --noEmit (baseline) | PASS |
| 22:15 | npm run build (Phase 1) | PASS |
| 22:15 | tsc --noEmit (Phase 1) | PASS |
| 22:25 | npm run build (Phase 2) | PASS |
| 22:25 | tsc --noEmit (Phase 2) | PASS |
| 22:35 | npm run build (Phase 3 + bug fixes) | PASS |
| 22:35 | tsc --noEmit (Phase 3) | PASS |
| 22:45 | npm run build (Stretch: Tab) | PASS |
| 22:45 | tsc --noEmit (Stretch: Tab) | PASS |

## Morning Handoff

### 明早最该先看什么

1. **打开浏览器实际操作一遍**：选中几个 worker + footman，右键金矿，看 worker 是否去采金、footman 是否走到旁边
2. **测试控制组**：框选一组单位 → Ctrl+1 → 点空白 → 按 1 → 看是否正确召回
3. **测试 Shift+click**：选中一个单位 → Shift+click 另一个 → 看是否追加选中
4. **测试双击**：双击一个 worker → 看是否选中了屏幕上所有 worker
5. **测试 Tab**：混合选中 worker + footman → 按 Tab → 看命令卡是否切换

### 下一轮只建议 1 个主题

**Vertical Slice 01: 镜头与地图空间组织**

原因：
- 控制语言第一版已建立，但玩家打开游戏看到的仍然是测试板
- PLAN.md 里 Phase B（Vertical Slice 01）是当前最重要的阶段
- 应该做一次相机/比例/地图空间/基础视觉的全面调整，让项目第一次"看起来像 war3"
- 这不与控制语言冲突，且会让已有交互在正确的视觉语境下被验证

### 已知差异（war3 vs 当前实现）

- **双击同类范围**：war3 是全地图同类，当前是屏幕可见范围。如果需要改为全地图，只需移除 `isVisible` 过滤器
- **Tab 子组**：war3 的 Tab 还有更复杂的子组逻辑（建筑 Tab 切换同类型建筑、英雄优先），当前只做了最基础的类型轮转
- **控制组存储**：war3 控制组在保存时存储单位引用，如果单位死亡后编组为空则编组消失。当前实现一致
