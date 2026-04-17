# V9 HN2-IMPL1 — Keep Tier Seed Implementation Contract

> 用途：为下一张 Keep tier seed 实现任务写清楚"只做什么、不做什么、怎么验收"。
> 上游：`docs/V9_TIER_PREREQUISITE_SCHEMA_PACKET.zh-CN.md`（Task 118 schema boundary）。
> 约束：这个 contract 不改 gameplay，只规定下一张实现切片的边界。

## 1. 切片名称

`HN2-IMPL1 — Keep tier seed`

## 2. 只做什么

1. 在 `src/game/GameData.ts` 的 `BuildingDef` 接口新增 `techTier?: 1 | 2 | 3` 字段。
2. 在 `src/game/GameData.ts` 的 `BuildingDef` 接口新增 `upgradeTo?: string` 字段。
3. 在 `src/game/GameData.ts` 的 `BUILDINGS` 新增 `keep` 建筑定义：
   - `techTier: 2`
   - 不加 `upgradeTo`（Castle 未实现，keep 不指向不存在的建筑）。
   - 不加 `trains`、`researches`、`unitUnlock`、`buildingUnlock`。
4. 在 `src/game/GameData.ts` 的 `BUILDINGS.townhall` 增加 `upgradeTo: 'keep'`。
5. 在 `src/game/GameData.ts` 的 `BUILDINGS.townhall` 增加 `techTier: 1`（显式标记）。
6. 新增一个 focused node proof，验证：
   - `keep` 存在于 `BUILDINGS`
   - `keep.techTier === 2`
   - `keep` 没有 `upgradeTo` 字段（Castle 未实现）
   - `townhall.upgradeTo === 'keep'`
   - `townhall.techTier === 1`
   - 现有 V5–V7 前置事实不回退
   - 没有新增 `Castle`、`Knight`、`Sorceress`、`Spell Breaker` 或任何新单位/科技
7. 必要时同步 Human/V9 文档中与 Keep 相关的状态描述。

## 3. 允许的未来实现文件

| 文件 | 用途 | 备注 |
| --- | --- | --- |
| `src/game/GameData.ts` | 新增 `techTier`、`upgradeTo` 字段和 `keep` 定义 | 唯一改 gameplay data 的文件 |
| `tests/v9-keep-tier-seed-proof.spec.mjs` | focused node proof | 文本解析，不 import TS |
| `tests/v9-tier-prerequisite-schema.spec.mjs` | 同步 schema proof 到 Keep seed 后状态 | 允许 `keep`，仍禁止 `castle` 和新单位/科技 |
| `docs/HUMAN_RACE_CAPABILITY_BOARD.zh-CN.md` | 同步 Keep 状态 | 只更新 §4 Keep 行 |
| `docs/V9_TIER_PREREQUISITE_SCHEMA_PACKET.zh-CN.md` | 同步已实现字段 | 只标记 §4.1 和 §4.2 为已实现 |
| `docs/GLM_READY_TASK_QUEUE.md` | closeout 同步 | 仅 closeout |

默认不碰 `Game.ts`。如果 HN2-IMPL1 实现者认为需要改 `Game.ts` 来支持 upgrade 流程，必须先回 Codex 重新定义 scope。

## 4. 不做什么

以下内容在 HN2-IMPL1 中**明确禁止**：

- 不实现 Castle 建筑定义（`castle` 不出现在 `BUILDINGS` 中）。
- 不实现 Knight、Sorceress、Spell Breaker 或任何新单位（`UNITS` 不变）。
- 不实现 `researchLevel` 字段或任何 Adept/Master Training。
- 不实现 `unitUnlock` 字段。
- 不实现 `buildingUnlock` 字段。
- 不实现英雄、物品、商店系统。
- 不导入任何素材。
- 不改平衡数值（现有单位/建筑/科技的 cost、hp、damage 等不变）。
- 不改 `Game.ts` 的运行时逻辑。
- 不一次实现完整科技树。

## 5. 验收标准

1. `npm run build` 通过。
2. `npx tsc --noEmit -p tsconfig.app.json` 通过。
3. focused node proof 全部通过。
4. 现有 focused proof（`v9-tier-prerequisite-schema.spec.mjs`、`v9-human-completeness-ledger.spec.mjs`）继续通过；如果 Keep seed 改变对象清单，只能把 schema proof 同步成“允许 `keep`、仍禁止 `castle` 和新单位/科技”，不能删除 V5–V7 前置事实断言。
5. `BUILDINGS` 中有 `keep`，`techTier` 为 2，且没有 `upgradeTo` 字段。
6. `BUILDINGS.townhall` 有 `techTier: 1` 和 `upgradeTo: 'keep'`。
7. `UNITS` 不变（仍然是 worker、footman、rifleman、mortar_team、priest）。
8. `RESEARCHES` 不变（仍然是 long_rifles）。
9. 现有前置事实不回退（rifleman→blacksmith、priest→arcane_sanctum 等）。

## 6. 后续字段保留

`researchLevel`、`unitUnlock`、`buildingUnlock` 保留为后续字段，不在 HN2-IMPL1 接入。它们在 `docs/V9_TIER_PREREQUISITE_SCHEMA_PACKET.zh-CN.md` §4.3–4.5 中已有定义，留给 HN3 及后续切片。

## 7. 与 Task 118 schema packet 的关系

Task 118 的 schema packet（`docs/V9_TIER_PREREQUISITE_SCHEMA_PACKET.zh-CN.md`）§6 明确提出 `HN2-IMPL1 — Keep tier seed` 作为唯一后续切片。本 contract 是那个切片的实现边界，不是替代品。

schema packet §7 结论中写明：

```text
The next safe step is HN2-IMPL1: Keep tier seed.
```

本 contract 不改变这个结论。

## 8. 当前结论

```text
HN2-IMPL1 contract is defined.
Only techTier + upgradeTo (townhall→keep only) + keep definition are in scope.
Castle, Knight, Sorceress, Spell Breaker, heroes, items, assets, and full tech tree are explicitly out.
Game.ts is not touched.
Next implementer must follow this contract exactly.
```
