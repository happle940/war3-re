# V9 HERO18-DATA1 Water Elemental 接收清单

> 生成时间：2026-04-17
> 队列来源：后台 Codex 独立队列任务 `V9-CX163`
> 适用对象：GLM Task266 / `HERO18-DATA1 Water Elemental source data seed`
> 结论性质：这是接收清单，不代表 Task266 已经 Codex accepted。
> 范围限制：不实现 Water Elemental 数据、运行时、AI、素材或测试；不修改 GLM 当前 DATA1 产物。

---

## 1. 接收目标

Task266 的唯一目标应是把 Task262 / Task265 已确认的 Water Elemental 来源数据落成静态数据种子，并继续阻止缺源字段进入 runtime-facing 模型。

Codex 复核时要重点回答：

1. 是否只写入来源确认字段。
2. 三等级值是否与 Task262 / Task265 一致。
3. `sightRange`、`attackCooldown`、碰撞/footprint、活跃上限、死亡记录、人口规则等缺源项是否继续暂缓。
4. `Game.ts` 和 `SimpleAI.ts` 是否仍没有 Water Elemental runtime / AI。
5. 数据形态是否避免为了满足现有 `UnitDef` / `HeroAbilityLevelDef` 必填字段而造数。

---

## 2. 可以 accepted 的条件

### 2.1 前置和范围

Task266 可以 accepted 的前提：

- 明确引用 Task265 / HERO18-CONTRACT1 为已 accepted 合同前置。
- 明确引用 Task262 / HERO17-SRC1 为 Water Elemental 来源字段前置。
- 不把 Task266 写成 runtime、UX、AI 或 closure。
- 只修改 Task266 允许范围内的文件；`Game.ts`、`SimpleAI.ts` 不变。
- 不声明完整 Archmage、完整英雄系统、完整 Human 或 V9 发布。

### 2.2 三等级来源值

数据种子必须恰好包含 3 个等级，并匹配下表：

| 字段 | Lv1 | Lv2 | Lv3 |
|------|-----|-----|-----|
| `level` | 1 | 2 | 3 |
| `mana` | 125 | 125 | 125 |
| `cooldown` | 20 | 20 | 20 |
| `duration` | 60 | 60 | 60 |
| `requiredHeroLevel` | 1 | 3 | 5 |
| summoned HP | 525 | 675 | 900 |
| summoned attackDamage | 20 | 35 | 45 |
| summoned attackRange | 3.0 | 3.0 | 3.0 |
| summoned attackType | `AttackType.Piercing` | `AttackType.Piercing` | `AttackType.Piercing` |
| summoned armorType | `ArmorType.Heavy` | `ArmorType.Heavy` | `ArmorType.Heavy` |
| summoned armor | 0 | 0 | 1 |
| summoned speed | 2.2 | 2.2 | 2.2 |

这些值应被描述为 source data seed，不应被描述为已接入 runtime。

### 2.3 缺源字段继续暂缓

Task266 必须显式保留以下暂缓项：

- 水元素 `sightRange`。
- 水元素 `attackCooldown`。
- 碰撞体积、footprint、选择半径。
- 活跃召唤上限。
- 死亡后是否进入 `deadUnitRecords`。
- 是否可被 Paladin Resurrection 复活。
- 召唤单位是否占人口、如何计入人口、是否需要供给。
- 召唤物生命周期清理和 60 秒后消散 runtime。
- 召唤目标选择和无效目标反馈。

通过标准不是“这些问题已经解决”，而是“这些问题没有被 DATA1 偷偷解决或伪造”。

### 2.4 生产边界

Task266 accepted 时必须证明：

- `Game.ts` 没有 Archmage / Water Elemental 施法入口、命令卡按钮、扣 mana、cooldown、召唤函数、生命周期计时器、目标选择或清理逻辑。
- `SimpleAI.ts` 没有 Archmage 选择、技能学习、Water Elemental 施放或任何 Archmage AI 策略。
- 没有图标、模型、粒子、声音、素材、CSS 或 package script 改动。
- 没有 Brilliance Aura、Blizzard、Mass Teleport、Mountain King、Blood Mage、物品、商店、Tavern、空军、第二种族或多人内容。

---

## 3. 可接受的数据形态

### 3.1 首选：专用 source data object

可以 accepted 的默认形态是专用 source data object，例如：

- `WATER_ELEMENTAL_SUMMON_LEVELS`
- `WaterElementalSummonLevel`
- 其他同等语义的 source-only export

接受条件：

- 字段只覆盖 Task262 / Task265 已确认值。
- 文档或数据注释明确说明它不被 runtime 消费。
- 缺源字段不出现在对象中，或只出现在明确的 deferred-field 记录中。
- proof 检查该对象恰好 3 级，且未新增 `UNITS.water_elemental` / `ABILITIES.water_elemental` / `HERO_ABILITY_LEVELS.water_elemental` runtime-facing 入口。

### 3.2 有条件接受：runtime-facing data shape

如果 Task266 直接写入以下形态，不能自动 accepted：

- `UNITS.water_elemental`
- `UNITS.water_elemental_1` / `water_elemental_2` / `water_elemental_3`
- `ABILITIES.water_elemental`
- `HERO_ABILITY_LEVELS.water_elemental`

只有在额外满足以下条件时，才可考虑 accepted：

- 每个必填字段都有 Task262 / Task265 来源，或数据模型已支持显式 deferred / unknown / pending 字段。
- 没有为了满足 `UnitDef` 必填字段而发明 `sightRange`、`attackCooldown`、`supply`、碰撞、人口、活跃上限或死亡记录行为。
- proof 逐字段证明所有必填字段来源，不能只证明对象存在。
- 文档解释为什么 runtime-facing 形态仍不会被 `Game.ts` 当前路径消费。

若做不到这些，应判为 `split-fix` 或 `rejected`。

---

## 4. Rejected 条件

任一项出现，应拒绝 Task266：

1. 发明 `sightRange`，例如给水元素填 8、10、12 等项目常用值但没有来源。
2. 发明 `attackCooldown`，例如套用 Rifleman / Priest / Sorceress / Archmage 攻速。
3. 发明碰撞体积、footprint、选择半径或 pathing size。
4. 发明活跃召唤上限，例如写死“同一 Archmage 只能有 1 个 Water Elemental”。
5. 发明死亡记录或 Resurrection 行为，例如直接判定水元素进/不进 `deadUnitRecords`。
6. 发明人口规则，例如把召唤物 `supply` 填 0 或其他值并声称已确认。
7. 写入 `UNITS.water_elemental` 或 `HERO_ABILITY_LEVELS.water_elemental`，但没有证明缺源必填字段没有被伪造。
8. 改动 `Game.ts`、`SimpleAI.ts`、命令卡、AI、runtime proof、素材或其他英雄能力。
9. 把 DATA1 说成 Water Elemental 已可施放、Archmage 能力已实现、完整 Human 或 V9 已完成。

---

## 5. Split-Fix 条件

以下情况不一定需要整张拒绝，但必须拆出最小修复后再接受：

- 数据值基本正确，但文档没有列出缺源字段和 deferred 行为。
- proof 只检查 3 个等级存在，没有逐项检查数值。
- proof 未检查 `Game.ts` / `SimpleAI.ts` 仍无 runtime / AI。
- proof 未检查未新增 `UNITS.water_elemental` / `ABILITIES.water_elemental` / `HERO_ABILITY_LEVELS.water_elemental`，或未解释 runtime-facing 形态的字段来源。
- 文档把 source-known 字段和 future runtime 行为混在一起，容易让下一张任务直接跳 runtime。
- 队列 closeout 说“可以进入 IMPL1”，但当前数据模型仍只是 source object，缺 data-model bridge。

最小 split-fix 范围应优先限制在：

- `docs/V9_HERO18_WATER_ELEMENTAL_DATA_SEED.zh-CN.md`
- `tests/v9-hero18-water-elemental-data-seed.spec.mjs`
- 必要时 `src/game/GameData.ts` 的数据注释或 source-only shape

不得借 split-fix 打开 runtime 或 AI。

---

## 6. Task266 accepted 后的下一张任务规则

Task266 accepted 后不能自动进入 runtime。下一张任务取决于数据形态。

### 6.1 如果 Task266 只是 source data object

下一张最小任务应是：

`HERO18-MODEL1 / DATA2 — Water Elemental data-model bridge`

目标：

- 设计或扩展能表达召唤单位等级数据的 runtime-facing 模型。
- 明确如何处理 `UnitDef` 必填但缺源的字段。
- 明确 `sightRange`、`attackCooldown`、碰撞、人口、死亡记录和活跃上限继续 deferred，或新增显式 unknown/deferred 机制。
- 不实现施法按钮、召唤 runtime 或 AI。

### 6.2 如果 Task266 已能无造数表达 runtime-facing 模型

只有在 Codex 复核确认所有必填字段都有来源或 deferred 机制后，下一张才可以是：

- `HERO18-IMPL1-CONTRACT`：先写召唤 runtime 合同，定义目标选择、生命周期、cooldown/mana、death-record 边界。
- 或极窄 `HERO18-IMPL1`：仅当合同已足够明确，且不需要再拆 runtime 合同时。

### 6.3 禁止的下一步

- 不得从 source object 直接跳到 summon runtime。
- 不得直接做 Archmage command-card button。
- 不得做 Archmage AI。
- 不得顺手做 Brilliance Aura、Blizzard、Mass Teleport。
- 不得用 Task266 worker `completed` 代替 Codex `accepted` 后继续派发。

---

## 7. 复核建议命令

本清单任务本身不运行这些命令；它们是前台/集成 Codex 复核 Task266 时的建议。

```bash
npm run build
npx tsc --noEmit -p tsconfig.app.json
node --test tests/v9-hero18-water-elemental-data-seed.spec.mjs tests/v9-hero18-water-elemental-branch-contract.spec.mjs tests/v9-hero17-archmage-source-boundary.spec.mjs
./scripts/cleanup-local-runtime.sh
```

仍然禁止 runtime / Playwright / Vite / browser。

---

## 8. 本清单边界

- 本文档只是 Task266 的 Codex 接收清单。
- 本文档不验收 Task266。
- 本文档不读取或修正 Task266 的 DATA1 文档/proof 产物。
- 本文档不修改 `GameData.ts`、`Game.ts`、`SimpleAI.ts`。
- 本文档不允许后台 Codex 越过前台复核直接派发下一张任务。
