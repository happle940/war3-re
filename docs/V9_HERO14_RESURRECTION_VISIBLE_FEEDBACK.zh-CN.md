# V9 HERO14-UX1 Resurrection 可见反馈最小切片

> 生成时间：2026-04-17
> 前置：Task250 / HERO14-IMPL1C 已 accepted，`castResurrection` 运行时可用。
> 任务编号：Task 251
> 本文档 **不** 声称"完整圣骑士"、"完整英雄系统"、"完整人族"或"V9 发布"。

---

## 1. 玩家现在能看到什么

当 Paladin 已学习 Resurrection 时，选中 Paladin 后：

1. **单位属性面板**显示 `复活术 Lv1`（与圣光术、神圣护盾、虔诚光环一致）。
2. 施放 Resurrection 后，**单位属性面板**短暂显示 `刚复活 N 个单位`，N 是实际复活数量。
3. Paladin 上方沿用现有浮动数字显示实际复活数量，作为附加反馈。
4. 施放后**单位属性面板**显示 `复活冷却 Ns`（N 为剩余秒数）。
5. 命令按钮在冷却中时显示 `冷却中 N.Ns`（包含秒数）。
6. 法力不足、已死亡、无可复活单位等禁用原因保持不变。

---

## 2. 反馈规则

1. 已学习 Resurrection → 单位属性面板显示 `复活术 Lv{level}`。
2. 施放成功 → Paladin 单位属性面板显示 `刚复活 {revivedCount} 个单位` 约 5 秒。
3. 施放成功 → `feedback.spawnDamageNumber(paladin, revivedCount)` 在 Paladin 上方显示浮动数字，沿用已有反馈通道，不新增素材。
4. 冷却中 → 单位属性面板显示 `复活冷却 {seconds}s`，命令按钮显示 `冷却中 {seconds}s`。
5. 未学习 → 不显示任何 Resurrection 相关文字。
6. 纯文字反馈，不添加粒子、声音、图标、CSS 或资产。

---

## 3. 修改文件

| 文件 | 修改 |
|------|------|
| `src/game/Game.ts` | 单位属性面板添加 `复活术 Lv`、`刚复活 N 个单位` 和 `复活冷却` 显示；`castResurrection` 写入最近复活数量并沿用浮动数字反馈；命令按钮冷却原因添加秒数 |
| `tests/v9-hero14-resurrection-visible-feedback.spec.ts` | 5 个反馈运行时证明 |
| `docs/V9_HERO14_RESURRECTION_VISIBLE_FEEDBACK.zh-CN.md` | 本文档 |

---

## 4. 仍然延后

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

## 5. 验收口径

运行时证明文件：`tests/v9-hero14-resurrection-visible-feedback.spec.ts`

| ID | 证明 |
|----|------|
| FB-1 | 单位属性面板显示已学习 Resurrection 等级 |
| FB-2 | 施放后单位属性面板显示 `刚复活 N 个单位`，并沿用浮动数字显示实际复活数量 |
| FB-3 | 单位属性面板显示冷却剩余秒数 |
| FB-4 | 命令按钮冷却原因包含秒数 |
| FB-5 | 法力不足、冷却、无可复活单位原因正确切换 |
