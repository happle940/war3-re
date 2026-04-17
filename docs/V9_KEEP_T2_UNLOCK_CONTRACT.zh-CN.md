# V9 Keep / T2 Unlock Contract Packet

> 用途：定义未来 Keep / T2 解锁的目标态、迁移验收标准和分阶段顺序。
> 状态：**未执行的目标合同**。本任务不改 `GameData.ts` 或 `Game.ts`。
> 上游：`docs/V9_KEEP_T2_UNLOCK_COMPATIBILITY_PACKET.zh-CN.md`（Task 123 兼容盘点）。

## 1. 合同性质

本文件是**未执行的目标合同**，不是已落地运行时。它定义未来迁移的目标和边界，但当前运行时代码未发生任何改变。

## 2. 目标态 vs 当前态

| 维度 | 当前态（已证明） | 目标态（未来） |
| --- | --- | --- |
| `workshop.techPrereq` | 无 | `'keep'`（需先有 Keep） |
| `arcane_sanctum.techPrereq` | `'barracks'` | `'keep'`（需先有 Keep） |
| `PEASANT_BUILD_MENU` 可见性 | Workshop / Arcane Sanctum 无前置可见 | 没有 Keep 时这两个建筑应不可建 |
| 玩家可见行为 | 农民可直接造 Workshop / Arcane Sanctum | 农民需先升级 Town Hall → Keep 后才能造 |
| AI 行为 | AI 可在任何时候造 Workshop / Arcane Sanctum | AI 需先升级 Keep 再造这两个建筑 |

## 3. 不变项

以下内容不因 T2 解锁迁移而改变：

- Town Hall → Keep 升级路径（Task 121 已实现）。
- Keep 训练 worker（Task 122 已实现）。
- Keep 没有 `upgradeTo`，Castle 不存在。
- Knight、Sorceress、Spell Breaker 不实现。
- 无新素材。
- 无 AI 二本策略（AI 策略更新是迁移的最后一步，不是前置）。
- Rifleman → Blacksmith、Tower → Lumber Mill、Priest → Arcane Sanctum、Long Rifles → Blacksmith 前置事实不回退。

## 4. 受影响的 V7/V9 proof / runtime 包

迁移时必须保护的测试和 proof：

| 测试文件 | 依赖的现状 | 迁移后需要改什么 |
| --- | --- | --- |
| `tests/v9-tier-prerequisite-schema.spec.mjs` proof-1 | `arcane_sanctum.techPrereq === 'barracks'` | 更新断言为 `'keep'` |
| `tests/v9-tier-prerequisite-schema.spec.mjs` proof-2 | `arcane_sanctum.trains === ['priest']` | 不变（trains 不变） |
| `tests/v9-keep-tier-seed-proof.spec.mjs` proof-6 | Arcane Sanctum 前置是 barracks | 更新前置断言 |
| `tests/v9-keep-t2-unlock-compatibility-proof.spec.mjs` | workshop 无 techPrereq、sanctum 前置是 barracks | 整个 proof 需重写为目标态 |
| `tests/v9-human-completeness-ledger.spec.mjs` proof-4 | `PEASANT_BUILD_MENU` 包含 workshop、arcane_sanctum | 可能需要更新可用性逻辑 |
| `tests/v9-baseline-replay-smoke.spec.ts` BL-3 | V7 数据表+训练连通性 | 确保 Keep 前置不影响 baseline |
| `tests/v9-baseline-replay-smoke.spec.ts` BL-4 | Heal filter + AOE filter | 不变（战斗逻辑不变） |
| `tests/v9-keep-upgrade-flow-regression.spec.ts` | BUILDINGS 无 castle、UNITS/RESEARCHES 未扩张 | 不变 |
| `tests/v9-keep-post-upgrade-command-surface.spec.ts` | Keep 训练 worker、无升级按钮 | 不变 |
| `src/game/SimpleAI.ts` | AI 不需要 Keep 就能造 Workshop / Sanctum | 更新 AI 建造前置判断 |
| `src/game/Game.ts` `getBuildAvailability` | 读取 `techPrereq` | 不改函数逻辑，数据驱动 |

## 5. 分阶段迁移顺序

每个阶段是一个独立任务，不能合并：

1. **定义合同**（本任务）：明确目标态、受影响测试、迁移顺序。
2. **更新 proof 先行**：修改 node proof 让它接受迁移后的状态（`workshop.techPrereq === 'keep'`、`arcane_sanctum.techPrereq === 'keep'`），但此时运行时代码仍未变，所以旧的 proof 和新的 proof 都必须能通过当前数据。实现方式：先写好迁移后 proof 作为 pending/expected 状态。
3. **改 runtime gating**：在 `GameData.ts` 更新 `workshop.techPrereq = 'keep'` 和 `arcane_sanctum.techPrereq = 'keep'`。运行 proof 验证。
4. **更新命令卡**：确保没有 Keep 时，Workshop / Arcane Sanctum 在建造菜单中 disabled，理由明确。
5. **更新 AI 策略**：让 AI 知道需要先升级 Keep 才能建造 Workshop / Arcane Sanctum。
6. **Baseline rerun**：重跑所有 runtime proof 确保 V7 内容不回退。

## 6. 硬禁止

- 本任务不修改 `GameData.ts` 或 `Game.ts`。
- 本任务不修改 `PEASANT_BUILD_MENU`、`techPrereq`、训练队列、命令卡逻辑或 AI 策略。
- 本任务不实现 Castle、Knight、Sorceress、Spell Breaker 或任何新内容。
- 本任务不导入素材。

## 7. 当前结论

```text
本合同是未执行的目标定义。
运行时代码未变。
Workshop 和 Arcane Sanctum 仍然不需要 Keep。
下一步是按分阶段顺序逐步迁移，每步一个独立任务。
```

## 8. Runtime dry-run 证据

Task125 已补 `tests/v9-keep-t2-unlock-runtime-gating-proof.spec.ts`：

- RG-1 证明现有 `techPrereq` 机制会按建筑前置禁用/放开建造项。
- RG-2 / RG-3 在浏览器 runtime 中临时模拟 Workshop / Arcane Sanctum 需要 Keep，证明 availability 和农民命令卡能显示“需要主城”。
- RG-4 证明生产数据未变：Workshop 仍无 `techPrereq`，Arcane Sanctum 仍是 `barracks` 前置，Keep 仍无 `upgradeTo`。

这仍然不是 T2 解锁落地；下一步应先让 AI 具备 Town Hall -> Keep 升级能力，再改 Workshop / Arcane Sanctum 的生产数据。
