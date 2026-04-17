# V9 HERO14-IMPL1B Resurrection 死亡单位记录底座

> 生成时间：2026-04-16
> 前置：HERO14-IMPL1A (Task 248) 已 accepted。Resurrection 学习入口已开放。
> 任务编号：Task 249
> 阶段更新：Task250 / HERO14-IMPL1C 已消费 `deadUnitRecords` 实现最小施放运行时；本文件记录死亡单位底座本身。
> 阶段更新：Task259 / HERO16-AI5 为 AI Resurrection 扩展了记录范围：team 0 和 team 1 的普通单位都会记录，施法时仍由 `castResurrection()` 按施法者阵营过滤。
> 本文档 **不** 声称"完整圣骑士"、"完整英雄系统"、"完整人族"或"V9 发布"。

---

## 1. 范围

本切片为 Resurrection 提供 **死亡单位记录底座**：

1. 当玩家方或 AI 方（team 0 / team 1）非建筑、非英雄地面单位死亡时，记录一个 `deadUnitRecords` 条目。
2. 条目包含 `team`、`type`、`x`、`z`、`diedAt` 字段。
3. 中立 / 非可控阵营不记录；复活施放仍只消费与 Paladin 同阵营的记录，不会复活敌方。
4. 建筑不记录。
5. 英雄不记录（HERO9 已有独立死亡/复活机制）。
6. 记录在 mesh dispose 之前保存位置。
7. 地图重开/重置路径清空记录，不跨对局泄漏。

## 2. 修改文件

| 文件 | 修改 |
|------|------|
| `src/game/Game.ts` | 新增 `deadUnitRecords` 数组、`handleDeadUnits()` 中记录逻辑、`dispose()` 清空 |

## 3. 记录结构

```typescript
deadUnitRecords: { team: number; type: string; x: number; z: number; diedAt: number }[]
```

| 字段 | 说明 |
|------|------|
| `team` | 死亡单位阵营（team 0 / team 1） |
| `type` | 单位类型（如 'footman'） |
| `x` | 死亡位置 X（记录时使用） |
| `z` | 死亡位置 Z（记录时使用） |
| `diedAt` | 死亡时的 gameTime |

## 4. 不修改

- `GameData.ts` — 数据已在 DATA1 确定
- `ABILITIES` — 无 resurrection 条目
- Resurrection 施放按钮 — 不在本切片；已由 Task250 单独实现
- 复活效果 — 不在本切片；已由 Task250 最小实现
- HUD/状态文案 — 不在本切片
- AI、物品、商店、Tavern、资产
- HERO9 Altar revive 机制不变

## 5. 运行时证明

文件：`tests/v9-hero14-resurrection-dead-record-runtime.spec.ts`

| ID | 证明 |
|----|------|
| DR-1 | 在同一局内证明 team-0 / team-1 普通单位会记录；中立阵营、建筑、英雄不记录；重复死亡处理不重复记录；地图重开/重置会清空记录 |
| DR-2 | HERO9 死亡圣骑士和祭坛复活仍走独立机制，不进入 `deadUnitRecords` |

## 6. 明确延后

- Resurrection 施放按钮（Task250 已实现）
- 复活效果 / HP 恢复（Task250 使用 `spawnUnit` 默认状态作为 source-unknown fallback）
- 目标选择 / "most powerful" 排序
- 法力/冷却消耗
- HUD/状态文案
- 视觉特效（粒子、图标、声音）
- AI 英雄策略
- 完整圣骑士、完整英雄系统、完整人族
- V9 发布

## 7. 合同声明

本切片 **仅** 实现 Resurrection 的死亡单位记录底座。

本切片 **不** 声称：
- "完整圣骑士"
- "完整英雄系统"
- "完整人族"
- "V9 发布"
- 已实现 Resurrection 施放或复活效果

Task250 之后，这条历史声明只约束 Task249 本身；当前最小施放能力见 `docs/V9_HERO14_RESURRECTION_CAST_RUNTIME_SLICE.zh-CN.md`。
