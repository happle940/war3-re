# V9 HERO10-CLOSE1 XP / 升级可见链闭环清单

> 生成时间：2026-04-16
> 范围：HERO10 最小 XP/升级可见链闭环盘点。
> 本文档 **不** 声称"完整英雄系统"、"完整人族"或"V9 发布"。

---

## 1. 已接受的 HERO10 证据链

| 序号 | 任务 | 名称 | 状态 | 证据文件 |
|------|------|------|------|---------|
| 1 | Task 219 | HERO10-CONTRACT1 英雄 XP / 升级分支合同 | accepted | `tests/v9-hero10-xp-leveling-contract.spec.mjs` |
| 2 | Task 220 | HERO10-SRC1 XP / 等级 / 技能点来源边界 | accepted | `tests/v9-hero10-xp-leveling-source-boundary.spec.mjs` |
| 3 | Task 221 | HERO10-DATA1 XP / 升级数据种子 | accepted | `tests/v9-hero10-xp-leveling-data-seed.spec.mjs` |
| 4 | Task 222 | HERO10-IMPL1 最小单位击杀 XP 运行时 | accepted | `tests/v9-hero10-xp-leveling-runtime.spec.ts` |
| 5 | Task 223 | HERO10-UX1 Paladin XP 可见反馈切片 | accepted | `tests/v9-hero10-xp-visible-feedback.spec.ts` |

---

## 2. 已实现的玩家可见链

1. **英雄字段**：Paladin 拥有 `heroLevel`、`heroXP`、`heroSkillPoints` 运行时字段。
2. **XP 奖励**：敌方玩家队伍非建筑普通单位死亡时，存活的敌方队伍英雄获得最小 XP（25 点）。
3. **升级判定**：XP 达到累计阈值时 `heroLevel` 增加，同时授予一个技能点。
4. **等级上限**：最高等级 10，达到后不再获得 XP。
5. **选择 HUD 反馈**：选中英雄时显示等级（`等级 N`）、XP 进度（`XP current/nextThreshold` 或 `XP 最高等级`）和未花费技能点（`技能点 N`）。
6. **HERO9 兼容**：复活保留等级 / XP / 技能点，复活费用继续按等级缩放。

---

## 3. 仍然延后的项目

| 项目 | 延后原因 |
|------|---------|
| 技能学习 / 技能点消费 | 需要能力系统 UI |
| 英雄能力等级 | 需要能力等级系统 |
| 光环 / 终极技能 / 属性成长 | 需要能力系统和属性系统 |
| 敌方英雄 XP | 当前项目无敌方英雄玩法 |
| 野怪 XP / 中立营地 | 当前项目无野怪营地 |
| XP 分配 / 多英雄共享 | 当前项目仅一个英雄 |
| 完整英雄面板 / 头像 UI | 需要完整英雄 UI 设计 |
| AI 英雄策略 | 需要 AI 扩展 |
| 其他人族英雄 | 需要逐个英雄实现 |
| 物品 / 背包 | 不在范围内 |
| 酒馆 / 商店 | 不在范围内 |
| 空军单位 | 不在范围内 |
| 第二种族 | 不在范围内 |
| 多人联机 | 不在范围内 |
| 公开发布 | 不在范围内 |
| 新视觉素材 | 不在范围内 |

---

## 4. 闭环声明

本闭环 **仅** 覆盖 Paladin 最小 XP/升级可见链：
- 一个英雄类型（Paladin）的 XP 获取、升级、技能点数据
- 选择 HUD 中的等级/XP/技能点反馈
- 与 HERO9 复活系统的兼容

本闭环 **不** 声称：
- "完整英雄系统"
- "完整人族"
- "V9 发布"
- 任何上述延后列表中的项目
