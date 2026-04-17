# V9 Tier and Prerequisite Schema Boundary Packet

> 用途：为 Keep / Castle、Knight、Sorceress、Spell Breaker 和后续 caster training 固定最小数据模型。
> 约束：只做 schema 边界和 proof，不改 gameplay。

## 1. 当前前置事实（V5–V7 已证明）

| 对象 | 类型 | 前置字段 | 当前值 | 来源 |
| --- | --- | --- | --- | --- |
| `rifleman` | unit | `techPrereq` | `blacksmith` | `GameData.ts` UNITS.rifleman |
| `priest` | unit | `techPrereq` | `arcane_sanctum` | `GameData.ts` UNITS.priest |
| `long_rifles` | research | `requiresBuilding` | `blacksmith` | `GameData.ts` RESEARCHES.long_rifles |
| `tower` | building | `techPrereq` | `lumber_mill` | `GameData.ts` BUILDINGS.tower |
| `arcane_sanctum` | building | `techPrereq` | `barracks` | `GameData.ts` BUILDINGS.arcane_sanctum |

## 2. 当前生产事实（V5–V7 已证明）

| 建筑 | 训练 | 研究 |
| --- | --- | --- |
| `townhall` | `worker` | — |
| `barracks` | `footman`、`rifleman` | — |
| `workshop` | `mortar_team` | — |
| `arcane_sanctum` | `priest` | — |
| `blacksmith` | — | `long_rifles` |

农民建造菜单（`PEASANT_BUILD_MENU`）：`farm`、`barracks`、`blacksmith`、`lumber_mill`、`tower`、`workshop`、`arcane_sanctum`。

## 3. 当前 schema 字段清单

`BuildingDef` 现有前置相关字段：

- `techPrereq?: string` — 建筑完成后才可建造（如 `lumber_mill` 解锁 `tower`）
- `trains?: string[]` — 可训练单位类型
- `researches?: string[]` — 可研究科技

`UnitDef` 现有前置相关字段：

- `techPrereq?: string` — 建筑完成后才可训练（如 `blacksmith` 解锁 `rifleman`）

`ResearchDef` 现有前置相关字段：

- `requiresBuilding?: string` — 需要指定建筑存在

## 4. 后续最小新增字段

以下字段用于支持 Keep / Castle、Knight、Sorceress、Spell Breaker 等 T2/T3 内容。**当前不实现**，只定义 schema 边界。

### 4.1 `techTier` — 已实现（HN2-IMPL1）

```ts
techTier?: 1 | 2 | 3  // 建筑所属科技等级
```

- `townhall` → tier 1 ✅
- `keep` → tier 2 ✅（数据种子已存在）
- `castle` → tier 3（后续切片；当前 Keep seed 不实现 Castle）

### 4.2 `upgradeTo` — 部分实现（HN2-IMPL1）

```ts
upgradeTo?: string  // 当前建筑可升级为的目标建筑 key
```

- `townhall.upgradeTo = 'keep'` ✅
- `keep` 在当前 Keep seed 中不加 `upgradeTo`，因为 Castle 尚未实现。
- 从 `keep` 升到 `castle` 的 `upgradeTo` 只允许在 Castle 定义真实进入后续切片时再接。

### 4.3 `researchLevel`

```ts
researchLevel?: 1 | 2 | 3  // 研究所达等级（Adept / Master Training）
```

- 用于 Priest Adept/Master、Sorceress Adept/Master 等。
- 当前 `long_rifles` 不需要 level（单次研究）。

### 4.4 `unitUnlock`

```ts
unitUnlock?: string[]  // 建筑完成后解锁的单位（补充 trains 之外的全局解锁）
```

- 例：`keep` 解锁 `knight` 的训练前置，但 `knight` 仍在 `barracks.trains` 中。
- 不同于 `techPrereq`：`unitUnlock` 是建筑级别的全局解锁，不是单个单位的字段。

### 4.5 `buildingUnlock`

```ts
buildingUnlock?: string[]  // 建筑完成后解锁的可建造建筑
```

- 例：`keep` 解锁 `arcane_sanctum`、`workshop`（如果后续改用 tier 控制）。
- 当前这些前置用 `techPrereq` 字段在子建筑上表达，未来可选迁移。

## 5. 保持不变的约束

以下 V5–V7 事实不得回退：

- Rifleman 需要 Blacksmith（`UNITS.rifleman.techPrereq === 'blacksmith'`）
- Long Rifles 需要 Blacksmith（`RESEARCHES.long_rifles.requiresBuilding === 'blacksmith'`）
- Tower 需要 Lumber Mill（`BUILDINGS.tower.techPrereq === 'lumber_mill'`）
- Arcane Sanctum 需要 Barracks（`BUILDINGS.arcane_sanctum.techPrereq === 'barracks'`）
- Barracks 训练 Footman + Rifleman
- Workshop 训练 Mortar Team
- Arcane Sanctum 训练 Priest

## 6. HN2-IMPL1 状态

**HN2-IMPL1 — Keep tier seed** 已作为 Task120 数据种子落地，不能再作为新的未来任务重复派发。

当前已落地：

- `BuildingDef.techTier?: 1 | 2 | 3`
- `BuildingDef.upgradeTo?: string`
- `BUILDINGS.townhall.techTier === 1`
- `BUILDINGS.townhall.upgradeTo === 'keep'`
- `BUILDINGS.keep.techTier === 2`
- `BUILDINGS.keep` 不加 `upgradeTo`
- 现有 Barracks / Blacksmith / Long Rifles / Tower / Arcane Sanctum / Priest 前置事实不回退

仍不做：

- 不实现 Castle。
- 不实现 Knight、Sorceress、Spell Breaker。
- 不接入 `unitUnlock`、`buildingUnlock`、`researchLevel` 的真实运行时语义。
- 不改平衡。
- 不导入素材。

Task120 之后的相邻点不是完整 T2/T3 科技树，而是 Town Hall -> Keep 的最小升级路径合同；该预案记录在 `docs/V9_KEEP_UPGRADE_FLOW_CONTRACT_DRAFT.zh-CN.md`，且必须等 Task120 被 Codex accepted 后才能转入 live queue。

## 7. 当前结论

```text
Schema boundary is defined.
HN2-IMPL1 Keep tier seed is implemented: BuildingDef has techTier/upgradeTo, townhall is T1→keep, keep is T2 seed.
No new gameplay beyond the keep data seed.
Castle, Knight, Sorceress, Spell Breaker, heroes, items, assets remain out of scope.
Current V5–V7 facts are frozen and must not regress.
```
