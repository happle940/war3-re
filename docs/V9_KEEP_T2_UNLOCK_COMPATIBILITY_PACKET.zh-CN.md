# V9 Keep / T2 Unlock Compatibility Inventory Packet

> 用途：盘点当前 V7 已实现建筑、单位、研究和测试如何依赖现有前置规则，为后续 T2 解锁迁移提供安全顺序。
> 约束：只盘点和证明，不改运行时代码。

## 1. 当前 PEASANT_BUILD_MENU 状态

`PEASANT_BUILD_MENU` 当前包含以下建筑：

```
['farm', 'barracks', 'blacksmith', 'lumber_mill', 'tower', 'workshop', 'arcane_sanctum']
```

关键事实：
- `workshop` 已在 `PEASANT_BUILD_MENU` 中，农民无需任何前置即可建造。
- `arcane_sanctum` 已在 `PEASANT_BUILD_MENU` 中，农民无需 Keep 即可建造。
- 这两个建筑在 V7 已实现，且相关 runtime proof 依赖玩家可以直接建造。

## 2. 当前建筑前置规则

| 建筑 | techPrereq | 实际解锁路径 |
| --- | --- | --- |
| `barracks` | 无 | 直接可建 |
| `blacksmith` | 无 | 直接可建 |
| `lumber_mill` | 无 | 直接可建 |
| `tower` | `lumber_mill` | 需伐木场 |
| `workshop` | 无 | 直接可建 |
| `arcane_sanctum` | `barracks` | 需兵营 |

关键事实：
- `workshop` 没有 `techPrereq`，不需要任何前置建筑。
- `arcane_sanctum.techPrereq === 'barracks'`，不是 `keep`。
- 如果后续要把这两个建筑锁到 Keep 后面，必须同时更新 `techPrereq`、`PEASANT_BUILD_MENU` 的可用性判断、命令卡显示逻辑、AI 建造策略，以及所有依赖"玩家可以直接建造 Workshop/Arcane Sanctum"的测试。

## 3. 当前 Keep 状态

- `BUILDINGS.keep` 存在。
- `techTier: 2`。
- `trains: ['worker']`（Task 122 已实现）。
- 没有 `upgradeTo`（Castle 未实现）。
- Town Hall -> Keep 最小升级路径已存在（Task 121）。

## 4. 受影响的 V7/V9 测试和能力面

以下测试或能力面依赖当前前置规则，后续迁移时必须保护：

| 测试/能力面 | 依赖的现状 |
| --- | --- |
| `tests/v9-tier-prerequisite-schema.spec.mjs` proof-1 | `arcane_sanctum.techPrereq === 'barracks'` |
| `tests/v9-tier-prerequisite-schema.spec.mjs` proof-2 | `workshop.trains === ['mortar_team']`、`arcane_sanctum.trains === ['priest']` |
| `tests/v9-keep-tier-seed-proof.spec.mjs` proof-5 | `PEASANT_BUILD_MENU` 不含 `keep` |
| `tests/v9-keep-tier-seed-proof.spec.mjs` proof-6 | Rifleman→Blacksmith、Tower→Lumber Mill、Arcane Sanctum→Barracks 等 V5–V7 前置不回退 |
| `tests/v9-human-completeness-ledger.spec.mjs` proof-4 | `PEASANT_BUILD_MENU` 包含 workshop、arcane_sanctum |
| `tests/v9-baseline-replay-smoke.spec.ts` BL-3 | V7 数据表+训练连通性 |
| `tests/v9-baseline-replay-smoke.spec.ts` BL-4 | Heal filter + AOE filter |
| `tests/v9-keep-upgrade-flow-regression.spec.ts` UF-3 | BUILDINGS 无 castle、UNITS/RESEARCHES 未扩张 |
| AI `SimpleAI.ts` | AI 使用 Workshop/Mortar/Sanctum/Priest 的建造和训练逻辑依赖当前前置 |
| 命令卡 `Game.ts` | `getBuildAvailability` 读取 `techPrereq`，`getTrainAvailability` 读取单位前置 |

## 5. 后续安全迁移顺序

不能直接把现有 Workshop / Arcane Sanctum 锁到 Keep 后面，因为会破坏 V7 已有内容和测试。建议按以下顺序：

1. **定义 T2 解锁合同**：写一份专门的合同文档，明确哪些内容需要从"无前置/barracks 前置"迁移到"Keep 前置"，以及迁移后需要更新哪些测试。
2. **更新 proof 先行**：先更新 node proof 让它接受迁移后的状态，但不改运行时代码。
3. **改运行时 gating**：在 `GameData.ts` 更新 `techPrereq`，在 `Game.ts` 更新命令卡显示逻辑。
4. **更新 AI 策略**：让 AI 知道需要先升级 Keep 才能建造 Workshop / Arcane Sanctum。
5. **验证所有 runtime proof**：确保基线、训练、战斗、升级路径 proof 全部通过。

每一步都是一个独立任务，不能合并。

Task 124 已补充目标合同文档：`docs/V9_KEEP_T2_UNLOCK_CONTRACT.zh-CN.md`。

## 6. 当前结论

```text
Workshop 和 Arcane Sanctum 当前不依赖 Keep。
直接把它们锁到 Keep 后面会破坏 V7 内容。
必须先定义合同、更新 proof、再改运行时。
本任务只盘点，不改代码。
```
