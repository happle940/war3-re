# V9 HERO14-IMPL1C Resurrection 最小施放运行时

> 生成时间：2026-04-17
> 前置：Task249 / HERO14-IMPL1B 已 accepted，`deadUnitRecords` 底座可用。
> 任务编号：Task 250
> 本文档 **不** 声称"完整圣骑士"、"完整英雄系统"、"完整人族"或"V9 发布"。

---

## 1. 玩家当前能做什么

当 Paladin 已学习 Resurrection，并且附近存在可复活的玩家方普通死亡单位记录时，命令卡会出现：

- `复活`
- 消耗 `HERO_ABILITY_LEVELS.resurrection.levels[0].mana`
- 成功后进入 `cooldown`
- 以 Paladin 为中心，不需要点选目标
- 最多复活 `maxTargets` 个记录

无技能、死亡、法力不足、冷却中、没有可复活单位时，按钮会禁用并给出中文原因。

---

## 2. 运行时规则

本切片只消费 `deadUnitRecords`：

1. 记录必须与 Paladin 同阵营。
2. 记录类型必须存在于 `UNITS`。
3. 英雄不复活。
4. 建筑不复活。
5. 记录必须在 `areaRadius` 内。
6. 选择顺序为 `diedAt` 最早优先；时间相同则按记录顺序。
7. 超过 `maxTargets` 的记录保留。
8. 已消费的记录删除，避免重复复活。

复活单位使用 `spawnUnit` 默认状态，并放回记录的死亡位置。这是当前项目对主源未明确 HP / mana 恢复量的 fallback。

---

## 3. 与 HERO9 的关系

HERO9 Altar revive 和 HERO14 Resurrection 不共享机制：

- Altar revive 复活死亡 Paladin 自身。
- Resurrection 不复活 Paladin 自身。
- Paladin 死亡后仍通过祭坛队列复活。
- Paladin 通过祭坛复活后保留已学习的 Resurrection 等级。

---

## 4. 修改文件

| 文件 | 修改 |
|------|------|
| `src/game/Game.ts` | 增加 `resurrectionCooldownUntil`、`castResurrection`、目标过滤、命令卡按钮 |
| `tests/v9-hero14-resurrection-cast-runtime.spec.ts` | 覆盖施放、过滤、冷却、最大目标数、HERO9 分离 |
| `docs/V9_HERO14_RESURRECTION_CAST_RUNTIME_SLICE.zh-CN.md` | 记录本切片能力和边界 |

---

## 5. 仍然延后

- HUD 状态文案
- 粒子、声音、图标、素材
- AI 使用 Resurrection
- "most powerful" 精确复刻
- 尸体存在时间
- 友方英雄尸体是否可复活
- 其他 Human 英雄
- 物品、商店、Tavern
- 空军、第二种族、多人联机
- 完整圣骑士、完整英雄系统、完整人族、V9 发布

---

## 6. 验收口径

运行时证明文件：`tests/v9-hero14-resurrection-cast-runtime.spec.ts`

| ID | 证明 |
|----|------|
| CAST-1 | 命令按钮随学习状态出现，并对死亡、法力不足、冷却、无可复活单位给出原因 |
| CAST-2 | 成功施放消耗法力、启动冷却、按最早死亡顺序复活最多 6 个记录，并保留剩余记录 |
| CAST-3 | 无记录、法力不足、冷却中时不会错误消费法力或启动新冷却 |
| CAST-4 | 真实死亡单位记录可被复活一次，记录消费后不能重复复活 |
| CAST-5 | HERO9 Altar revive 与 Resurrection 仍然分离 |
