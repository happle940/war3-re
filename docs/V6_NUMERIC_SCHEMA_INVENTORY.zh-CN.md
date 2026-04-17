# V6-NUM1 人族数值字段盘点

> 生成时间：2026-04-14  
> 适用范围：V6 War3 identity alpha / V6-NUM1  
> 用途：给后续 NUM-B、NUM-C、NUM-D、NUM-E 提供字段合同。  
> 重要边界：本文件只做字段盘点，不改运行时代码，不声明完整人族、不实现完整英雄/法术/物品系统，也不导入真实素材。

## 1. 状态词

| 状态 | 含义 | 当前处理 |
| --- | --- | --- |
| `已有` | 当前 `GameData` 或现有运行时已经有对应数据字段或常量。 | 可以作为 V6 样本输入，但不等于数值系统已成立。 |
| `V6 必需` | 关闭 V6-NUM1 前必须有明确字段位置、运行时使用路径和 focused proof。 | 后续 NUM-B / NUM-C / NUM-D / NUM-E 需要按这些字段实现或证明。 |
| `后续版本` | 完整 War3-like 人族终局会需要，但不是 V6-NUM1 的最小底座。 | 只记录方向，不生成当前实现任务。 |
| `拒绝扩张` | 会把 V6-NUM1 扩成完整内容、素材、UI polish 或 V7/V8 范围。 | 当前阶段禁止写入实现任务。 |

## 2. 当前已有字段事实

当前 `src/game/GameData.ts` 已有三类主要数据：

- `UnitDef`：`key`、`name`、`cost`、`trainTime`、`hp`、`speed`、`supply`、`attackDamage`、`attackRange`、`attackCooldown`、`armor`、`sightRange`、`canGather`、`description`、`techPrereq`。
- `BuildingDef`：`key`、`name`、`cost`、`buildTime`、`hp`、`supply`、`size`、`description`、`trains`、`buildable`、`attackDamage`、`attackRange`、`attackCooldown`、`researches`。
- `ResearchDef`：`key`、`name`、`cost`、`researchTime`、`description`、`requiresBuilding`。

已有常量里还存在 `LONG_RIFLES_RANGE_BONUS`，但它不是通用 research effect schema；V6-NUM1 不能把这个单点常量当成研究效果模型通过。

当前没有独立的 ability schema，也没有 data-driven `attackType` / `armorType`、research `effects`、命令卡数值展示合同或 AI 数值权重字段。

## 3. Unit schema 盘点

| 字段 | 状态 | 位置 | 说明 |
| --- | --- | --- | --- |
| `key` / `name` / `description` | `已有` | `UnitDef` | 可继续作为命令卡、选择面板和日志的人类可读入口。 |
| `cost.gold` / `cost.lumber` | `已有` | `UnitDef.cost` | 后续 NUM-E 必须证明显示文字来自该数据，而不是手写 UI 文案。 |
| `trainTime` | `已有` | `UnitDef` | 后续账本保留；V6-NUM1 不要求完整训练节奏平衡。 |
| `hp` / `speed` / `sightRange` | `已有` | `UnitDef` | 属于基础账本字段；可作为身份读图和单位差异的输入。 |
| `supply` | `已有` | `UnitDef` | 必须继续与人口约束 proof 对齐；V6-NUM1 不重开 V5-ECO1。 |
| `attackDamage` / `attackRange` / `attackCooldown` | `已有` | `UnitDef` | NUM-C 只能在此基础上加类型模型，不能替换成单场胜负证明。 |
| `armor` | `已有` | `UnitDef` | 现有护甲数值应继续生效；NUM-C proof 必须证明它与 `armorType` 组合，而不是被新倍率表绕过。 |
| `canGather` | `已有` | `UnitDef` | 仍是 worker 身份字段；不是完整经济系统扩张入口。 |
| `techPrereq` | `已有` | `UnitDef` | Rifleman 样本可用于前置证明；后续不把它扩大成完整 tech tree。 |
| `attackType` | `V6 必需` | `UnitDef` 或 `UnitDef.weapon.attackType` | 表示普通、穿刺、攻城、魔法等最小攻击类别。V6 只需先支持 2-3 类可证明差异，不要求完整 War3 表。 |
| `armorType` | `V6 必需` | `UnitDef` 或 `UnitDef.defense.armorType` | 表示轻甲、中甲、重甲、建筑甲等最小防御类别。必须与现有 `armor` 数值同时生效。 |
| `numericHints` | `V6 必需` | `UnitDef.ui.numericHints` 或由 `UnitDef` 派生 | 命令卡/选择面板展示成本、人口、攻击、护甲、射程、前置或禁用原因时使用。 |
| `ai.productionWeight` | `V6 必需` | `UnitDef.ai` | AI 选择生产单位时的权重输入，必须来自数据；不能继续只在 AI 逻辑里散写 Rifleman 偏好。 |
| `ai.compositionTags` | `V6 必需` | `UnitDef.ai` | 例如 `melee`、`ranged`、`worker`、`antiLight`；后续 FA1 / counter 关系可以引用，但 V6-NUM1 不做完整 counter 平衡。 |
| `roleTags` | `后续版本` | `UnitDef.identity` | 可用于完整 roster 身份表达，但 V6-NUM1 只需要最小 AI 和显示字段。 |
| `abilityKeys` | `后续版本` | `UnitDef.abilities` | 只有 V6-ID1 选择单位技能路线时才启用；NUM1 不提前实现完整技能表。 |
| `inventory` / `heroLevel` / `xp` | `拒绝扩张` | 无 | 属于英雄/物品完整系统，不进入 V6-NUM1 字段盘点的实现范围。 |

## 4. Building schema 盘点

| 字段 | 状态 | 位置 | 说明 |
| --- | --- | --- | --- |
| `key` / `name` / `description` | `已有` | `BuildingDef` | 作为命令卡、选择面板和 proof log 的基础文案。 |
| `cost.gold` / `cost.lumber` | `已有` | `BuildingDef.cost` | 后续 NUM-E 必须能从数据展示成本和资源不足原因。 |
| `buildTime` / `hp` / `size` | `已有` | `BuildingDef` | 基础账本字段，后续 NUM-B 需要记录。 |
| `supply` | `已有` | `BuildingDef` | Farm 提供人口的现有字段；不回滚 V5-ECO1。 |
| `trains` / `buildable` | `已有` | `BuildingDef` | 训练/建造菜单来源；后续可被命令卡数值提示复用。 |
| `attackDamage` / `attackRange` / `attackCooldown` | `已有` | `BuildingDef` | Tower 样本可进入 NUM-C；需要补 `attackType` 后才能成为类型模型 proof。 |
| `researches` | `已有` | `BuildingDef` | Blacksmith -> Long Rifles 样本入口；不等于研究效果模型已通用。 |
| `armor` | `V6 必需` | `BuildingDef` | 建筑也需要护甲数值，避免单位和建筑使用两套不可比较规则。 |
| `armorType` | `V6 必需` | `BuildingDef` 或 `BuildingDef.defense.armorType` | NUM-C 至少要证明建筑甲或等价类型参与伤害计算。 |
| `attackType` | `V6 必需` | `BuildingDef` 或 `BuildingDef.weapon.attackType` | 对 Tower 等战斗建筑生效；非战斗建筑可为空或 `none`。 |
| `numericHints` | `V6 必需` | `BuildingDef.ui.numericHints` 或由 `BuildingDef` 派生 | 展示成本、人口提供、训练内容、研究内容、攻击/护甲摘要。 |
| `ai.buildWeight` | `V6 必需` | `BuildingDef.ai` | AI 建造优先级的最小数据入口，先用于 Blacksmith / Barracks / Farm 这类已有样本。 |
| `ai.techProviderTags` | `V6 必需` | `BuildingDef.ai` | 表示建筑提供训练、研究、人口、防御等角色，让 AI 和 proof 可以引用同一数据。 |
| `upgradeInto` / `tier` | `后续版本` | `BuildingDef.progression` | 完整 Town Hall tier、tower upgrade、shop 等留到后续版本。 |
| 官方模型、贴图或图标来源字段 | `拒绝扩张` | 无 | 素材授权不是 V6-NUM1；不得把真实素材导入塞进字段合同。 |

## 5. Research schema 盘点

| 字段 | 状态 | 位置 | 说明 |
| --- | --- | --- | --- |
| `key` / `name` / `description` | `已有` | `ResearchDef` | Long Rifles 样本已存在。 |
| `cost.gold` / `cost.lumber` | `已有` | `ResearchDef.cost` | 后续 NUM-E 必须证明命令卡可见成本来自数据。 |
| `researchTime` | `已有` | `ResearchDef` | 继续作为研究队列时间字段。 |
| `requiresBuilding` | `已有` | `ResearchDef` | Blacksmith 前置样本可用。 |
| `effects[]` | `V6 必需` | `ResearchDef.effects` | 用数组描述一个或多个效果，替代 `LONG_RIFLES_RANGE_BONUS` 这种单点常量。 |
| `effects[].target` | `V6 必需` | `ResearchDef.effects` | 至少支持按单位 key 或 tag 选择目标，例如 Rifleman 或 ranged unit。 |
| `effects[].stat` | `V6 必需` | `ResearchDef.effects` | 至少支持 `attackRange` 这类数值字段；后续可扩展到 attackDamage、armor、ability unlock。 |
| `effects[].operation` | `V6 必需` | `ResearchDef.effects` | 最小支持 `flatDelta`；`percentDelta`、`setValue`、`unlockAbility` 可先记录但不要求全部实现。 |
| `stackPolicy` | `V6 必需` | `ResearchDef` 或 `effects[]` | 研究完成后不得重复叠加；NUM-D proof 必须覆盖。 |
| `displayStats` | `V6 必需` | `ResearchDef.ui` | 命令卡展示研究收益，例如“步枪兵射程 +1.5”。 |
| `ai.researchWeight` | `V6 必需` | `ResearchDef.ai` | AI 是否优先研究 Long Rifles 等科技必须有数据入口。 |
| 多级攻防升级、完整科技树 | `后续版本` | `ResearchDef.chain` | V6-NUM1 只建立模型，不一次性实现全部 Blacksmith 科技。 |
| 英雄技能树、物品合成、商店购买 | `拒绝扩张` | 无 | 属于 V6-ID1 或后续内容阶段，不进入 NUM-D 当前模型。 |

## 6. Ability schema 盘点

当前没有独立 ability schema。V6-NUM1 只需要把最小字段位置写清，真正实现要等 V6-ID1 选择具体身份系统切片后再派发。

| 字段 | 状态 | 位置 | 说明 |
| --- | --- | --- | --- |
| `key` / `name` / `description` | `V6 必需` | `AbilityDef` | 最小身份系统需要可读名称和说明。 |
| `sourceType` / `sourceKey` | `V6 必需` | `AbilityDef.source` | 表示来自单位、建筑、研究、物品或英雄；V6-ID1 可以只选其中一种。 |
| `trigger` | `V6 必需` | `AbilityDef.trigger` | 至少区分主动点击、被动、研究解锁或建造解锁。 |
| `cost` / `cooldown` / `range` | `V6 必需` | `AbilityDef` | 可为空或 0，但字段位置必须统一，避免每个能力单独写 UI/逻辑。 |
| `targeting` | `V6 必需` | `AbilityDef.targeting` | 描述 self、unit、area、point 等最小目标规则；首个切片只需一种。 |
| `effects[]` | `V6 必需` | `AbilityDef.effects` | 与 research effect 共享表达方式：数值变化、状态、伤害、治疗或解锁。 |
| `restrictions[]` | `V6 必需` | `AbilityDef.restrictions` | 显示限制条件和 disabled reason，例如缺资源、冷却中、目标非法。 |
| `ui.numericHints` | `V6 必需` | `AbilityDef.ui` | 玩家可见数值提示来源。 |
| `ai.useWeight` | `V6 必需` | `AbilityDef.ai` | AI 使用能力或优先级的最小数据入口。 |
| 英雄等级、技能点、完整物品栏 | `后续版本` | `HeroDef` / `ItemDef` | V6-ID1 若选英雄路线可再拆，不属于 NUM-A 当前实现。 |
| 完整法术书、完整物品系统、商店经济 | `拒绝扩张` | 无 | 会把 V6-NUM1 扩成内容阶段，当前禁止。 |

## 7. Cross-schema 字段位置

### 7.1 attackType / armorType

最小合同：

- `attackType` 放在单位或建筑的 weapon 数据上；非攻击对象可为空或 `none`。
- `armorType` 放在单位或建筑的 defense 数据上；同时保留现有 `armor` 数值。
- 伤害计算必须先能读取 `attackDamage`、`attackType`、`armor`、`armorType`，再由统一倍率表和护甲公式组合得出结果。
- NUM-C focused proof 必须证明：同一攻击值对不同 `armorType` 有差异，且现有 `armor` 数值没有被绕过。

V6 最小类型不要求完整 War3 表；推荐第一批只支持：

| 类型族 | 最小候选 | 用途 |
| --- | --- | --- |
| attackType | `normal`、`pierce`、`siege` 或等价 2-3 类 | 覆盖 Footman、Rifleman、Tower 样本即可。 |
| armorType | `unarmored`、`medium`、`heavy`、`fortified` 或等价 2-3 类 | 覆盖 worker/footman/rifleman/building 样本即可。 |

### 7.2 research effect

最小合同：

- `ResearchDef.effects[]` 是唯一研究效果入口。
- 每个 effect 至少包含：`target`、`stat`、`operation`、`value`。
- `LONG_RIFLES_RANGE_BONUS` 可以作为迁移样本，但不能继续作为独立常量长期代表研究系统。
- NUM-D focused proof 必须证明研究完成前后使用同一份 `ResearchDef.effects[]`，且重复完成不会再次叠加。

### 7.3 命令卡数值展示

最小合同：

- 单位、建筑、研究、能力的命令卡展示必须从 schema 派生，而不是手写孤立文案。
- 第一批必须至少覆盖一组：成本、人口、前置、攻击/护甲、研究收益或 disabled reason。
- 展示字段可通过 `ui.numericHints` 显式定义，也可由 `cost`、`supply`、`attackDamage`、`armorType`、`effects[]` 派生；但 proof 必须能追溯来源。

### 7.4 AI 权重字段

最小合同：

- AI 的生产、建造、研究或能力使用优先级必须有数据入口，例如 `ai.productionWeight`、`ai.buildWeight`、`ai.researchWeight`、`ai.useWeight`。
- AI 可以继续有策略逻辑，但不能把所有数值偏好只写在 `SimpleAI` 分支里。
- 第一批只要求已有样本对象可用：worker、footman、rifleman、farm、barracks、blacksmith、long_rifles。

## 8. 后续任务接口

| 后续任务 | 依赖本文件的字段 | 不能做什么 |
| --- | --- | --- |
| NUM-B 单位与建筑基础账本 | `UnitDef`、`BuildingDef` 的已有字段和 V6 必需字段。 | 不补完整人族全名单，不做平衡大改。 |
| NUM-C 攻击类型与护甲类型最小模型 | `attackType`、`armorType`、`armor`、`attackDamage`、统一倍率表。 | 不一次性实现所有 War3 攻防类型，不改 AI composition 大策略。 |
| NUM-D 研究效果数据模型 | `ResearchDef.effects[]`、`stackPolicy`、`displayStats`、`ai.researchWeight`。 | 不实现完整 Blacksmith 科技树，不做英雄技能。 |
| NUM-E 玩家可见数值提示 | `ui.numericHints` 或可追溯派生字段、disabled reason。 | 不重做 HUD 美术，不导入官方图标，不做主菜单 polish。 |
| NUM-F 数值底座证明计划 | 以上所有字段的 proof 形状。 | 不跑浏览器，不实现代码，只定义 proof 边界。 |

### 8.1 NUM-B 完成记录

2026-04-14，`NUM-B 单位与建筑基础账本` 已完成，产物为 `docs/V6_HUMAN_NUMERIC_LEDGER.zh-CN.md`。

该账本把 Peasant、Footman、Rifleman、Town Hall、Farm、Barracks、Blacksmith、Scout Tower 和 Long Rifles 拆成可审查数值行，并逐项标明字段来源：

- `当前代码事实`：当前已有 cost、supply、hp、armor、attack、range、train/build/research time、prereq 等字段和值。
- `V6 目标`：attackType / armorType、building armor、research effects、command-card display fields 和 AI 权重字段。
- `后续占位` / `拒绝扩张`：Mortar、Caster、Knight、Hero、Item、Shop、官方素材等不进入当前 NUM-B 实现。

NUM-B 之后，GLM 可以按账本派 `NUM-C 攻击类型与护甲类型最小模型` 或 `NUM-D 研究效果数据模型`，但仍不得一次性扩成完整人族、完整法术书、完整物品系统或真实素材导入。

## 9. 拒绝扩张清单

下面内容不属于 NUM-A，也不能被本盘点转成当前实现任务：

- 完整人族全部单位、英雄、法术、物品、商店、空军、攻城体系。
- 完整 War3 攻防倍率表、完整平衡表或 ladder 级数值校准。
- 官方素材、来源不明素材、未批准第三方素材或真实素材导入。
- UI polish、主菜单审美、release copy、公开 demo 包装。
- 用单个 Rifleman 数值、单场战斗胜负、按钮存在或图标存在证明 V6-NUM1。

## 10. NUM-A 结论

```text
NUM-A 字段盘点完成。
V6-NUM1 的最小字段合同已经覆盖 unit、building、research、ability 四类 schema，并明确 attackType / armorType、research effect、命令卡数值展示和 AI 权重字段的位置。
下一步可以派 NUM-B 建基础账本；GLM 的 NUM-C / NUM-D 仍需等 NUM-B 或明确 allowed files 后再进入 runtime 实现。
```
