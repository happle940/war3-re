# V9 HERO14-IMPL1A Resurrection 学习入口切片

> 生成时间：2026-04-16
> 前置：Task247 / HERO14-DATA1 已 accepted。
> 范围：只开放 Paladin 学习 Resurrection 的命令卡入口和技能点消费。
> 阶段更新：Task250 / HERO14-IMPL1C 之后，学会 Resurrection 会出现 `复活` 施放按钮；本文件只保留学习入口切片的验收口径。
> 本文档 **不** 声称"完整圣骑士"、"完整英雄系统"、"完整人族"或"V9 发布"。

---

## 1. 玩家当前能做什么

当玩家选择 Paladin 时，命令卡会按 `HERO_ABILITY_LEVELS.resurrection` 显示：

- `学习复活 (Lv1)`
- 条件：Paladin 存活、英雄等级达到 6、至少有 1 个技能点。
- 点击后消耗 1 个技能点，并写入 `abilityLevels.resurrection = 1`。
- Resurrection 只有 1 级；学习后不再出现第二级学习入口。
- 学会后如果 Paladin 死亡并通过 HERO9 Altar revive 复活，`abilityLevels.resurrection` 保留。

---

## 2. 本切片明确不做

本切片在 IMPL1A 时点 **不** 实现：

- Resurrection 施放按钮
- `castResurrection`
- `ABILITIES.resurrection`
- 复活死亡单位
- 尸体记录系统
- 目标选择
- mana / cooldown 消耗
- HUD / 状态文案
- 粒子、声音、图标、素材
- AI 使用 Resurrection

---

## 3. 仍然延后

- Resurrection 最小施放 runtime（Task250 已完成最小版本）
- 复活单位 HP / mana 恢复量
- 尸体存在时间
- "most powerful" 精确排序
- 友方英雄尸体是否可被复活
- 完整 Paladin
- 完整英雄系统
- 完整人族
- V9 发布

---

## 4. 验收口径

本切片只证明学习入口成立：

- 等级 5 时显示但禁用，原因包含需要英雄等级 6。
- 等级 6 且有技能点时可学习。
- 无技能点时禁用。
- 死亡时禁用。
- 学习后消耗 1 个技能点并保留 `abilityLevels.resurrection = 1`。
- 学习后保留 `abilityLevels.resurrection = 1`；Task250 之后会出现 `复活` 施放按钮，复活效果由 `tests/v9-hero14-resurrection-cast-runtime.spec.ts` 单独证明。
