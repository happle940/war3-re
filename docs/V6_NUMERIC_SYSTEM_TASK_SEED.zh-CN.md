# V6-NUM1 数值系统任务种子包

> 生成时间：2026-04-14  
> 当前阶段：V6 War3 identity alpha 已激活，第一批工程推进应先进入数值底座。  
> 用途：把“完整人族必须有统一数值系统”拆成 V6 以后可以相邻派发、可验证、不会无限扩张的第一批任务种子。  
> 重要边界：本文件不是 V6 启动公告，不关闭 V5-HUMAN1，不派发 GLM 任务，不改运行时代码。

## 1. 输入依据

本种子包只从下面两份文档取范围：

- `docs/HUMAN_RACE_PARITY_AND_NUMERIC_SYSTEM.zh-CN.md`：完整人族终局、数值字段、攻击/护甲模型、研究效果和校准规则。
- `docs/V6_IDENTITY_SYSTEMS_REMAINING_GATES.zh-CN.md`：V6 只在切换后处理身份表达；其中 `V6-NUM1` 要求统一数据模型、attackType / armorType、research effect model、命令卡数值展示和 focused regression。

当前约束：

- V5 已把 `Blacksmith -> Rifleman -> Long Rifles -> AI composition` 跑通；这只作为 V6 数值系统样本输入。
- V6-NUM1 只准备“数值底座”任务，不提前实现完整人族。
- 任何仍未完成的 V5-HUMAN1 工作都留在 V5，不由本包接管。

## 2. 第一批任务总览

| 编号 | 任务名 | 适合泳道 | 覆盖任务族 | 派发条件 |
| --- | --- | --- | --- | --- |
| NUM-A | 人族数值字段盘点 | Codex | 数值 schema 盘点 | V5-HUMAN1 工程收口后，V6 准备进入数值底座时。 |
| NUM-B | 单位与建筑基础账本 | Codex | 单位/建筑基础账本 | NUM-A 完成后；不得等待完整人族名单全部实现。 |
| NUM-C | 攻击类型与护甲类型最小模型 | GLM | 攻击类型/护甲类型模型 | NUM-A 明确字段名和允许文件后。 |
| NUM-D | 研究效果数据模型 | GLM | 研究效果模型 | NUM-A / NUM-B 明确研究入口和效果字段后。 |
| NUM-E | 玩家可见数值提示 | GLM | 玩家可见数值提示 | NUM-C 或 NUM-D 至少一条完成后，确保 UI 文案来自真实数据。 |
| NUM-F | 数值底座证明计划 | Codex | focused proof 计划 | NUM-A 到 NUM-E 的边界确定后，进入实测前。 |

### 2.1 NUM-A 完成记录

2026-04-14，`NUM-A 人族数值字段盘点` 已完成，产物为 `docs/V6_NUMERIC_SCHEMA_INVENTORY.zh-CN.md`。

该盘点只确认字段合同，不实现运行时代码：

- 已覆盖 `unit`、`building`、`research`、`ability` 四类 schema。
- 已把 `attackType` / `armorType` 放到单位/建筑的 weapon / defense 数据入口。
- 已把 research effect 收进 `ResearchDef.effects[]` 合同，避免继续依赖单点 `LONG_RIFLES_RANGE_BONUS` 常量冒充研究模型。
- 已把命令卡数值展示放到 `ui.numericHints` 或可追溯派生字段。
- 已把 AI 生产、建造、研究和能力使用偏好放到 `ai.*Weight` 数据入口。
- 已明确完整英雄池、完整法术书、完整物品系统、真实素材和完整 War3 平衡表都不是 V6-NUM1 当前任务。

NUM-A 完成后，下一步安全任务是 `NUM-B 单位与建筑基础账本`；`NUM-C` / `NUM-D` 可以作为后续 GLM runtime proof 候选，但必须继续遵守字段合同和 allowed files。

### 2.2 NUM-B 完成记录

2026-04-14，`NUM-B 单位与建筑基础账本` 已完成，产物为 `docs/V6_HUMAN_NUMERIC_LEDGER.zh-CN.md`。

该账本把 Peasant、Footman、Rifleman、Town Hall、Farm、Barracks、Blacksmith、Scout Tower 和 Long Rifles 拆成可审查数值行，并逐项标明字段来源：

- `当前代码事实`：当前已有 cost、supply、hp、armor、attack、range、train/build/research time、prereq 等字段和值。
- `V6 目标`：attackType / armorType、building armor、research effects、command-card display fields 和 AI 权重字段。
- `后续占位` / `拒绝扩张`：Mortar、Caster、Knight、Hero、Item、Shop、官方素材等不进入当前 NUM-B 实现。

NUM-B 完成后，`NUM-C 攻击类型与护甲类型最小模型` 已可由 GLM 执行；`NUM-D 研究效果数据模型` 也具备后续派发前置。

### 2.3 NUM-F 完成记录

2026-04-15，`NUM-F 数值底座证明计划` 已完成，产物为 `docs/V6_NUMERIC_PROOF_PLAN.zh-CN.md`。

该计划不改运行时代码，只固定后续 proof 口径：

- NUM-C 必须证明 attackType / armorType 差异和 armor 公式组合。
- NUM-D 必须证明 research effect 来自数据模型，且不能重复叠加。
- NUM-E 必须证明玩家可见数值提示来自 unit / building / research 数据。
- 所有 runtime proof 在 mutation、reload、cleanup 后都必须重新读取 fresh state。
- V6-NUM1 只有在 NUM-A、NUM-B、NUM-C、NUM-D、NUM-E 和 evidence ledger 对齐后，才能从 `open` 改成 `engineering-pass`。

### 2.4 NUM-D 完成记录

2026-04-15，`NUM-D 研究效果数据模型` 已完成并经 Codex 本地复核。

本次运行时代码变化：

- `GameData.ts` 新增 `ResearchEffectType`、`ResearchEffect` 和 `ResearchDef.effects[]`。
- `long_rifles` 的射程变化进入 `effects[]`，不再依赖 `LONG_RIFLES_RANGE_BONUS` 单点常量。
- `Game.ts` 新增通用 research effect 应用路径：已存在单位和研究后新训练单位都从 completed research 数据读取效果。
- 重复研究完成时不会重复应用同一 research effect；新单位也不会因多个建筑记录同一研究而重复叠加。

Codex 复核时修正了 GLM 初版 proof-2：旧测试是在测试里手动加两次射程，不能证明游戏不会重复叠加；现已改成真实 `startResearch -> tick -> retry` 路径。

本地验证：

```bash
./scripts/cleanup-local-runtime.sh
npm run build
npx tsc --noEmit -p tsconfig.app.json
./scripts/run-runtime-tests.sh tests/v6-research-effect-model-proof.spec.ts tests/v6-attack-armor-type-proof.spec.ts tests/v5-human-long-rifles-tech.spec.ts --reporter=list
```

结果：build 通过，typecheck 通过，runtime `12/12` 通过，cleanup 已执行。

### 2.5 NUM-E 完成记录

2026-04-15，`NUM-E 玩家可见数值提示` 已完成并经 Codex 本地复核。

本次运行时代码变化：

- `GameData.ts` 新增攻击类型和护甲类型显示名。
- `Game.ts` 的选择面板从 `UNITS` / `BUILDINGS` 读取攻击、护甲、速度、攻击类型和护甲类型，不再按单位类型写死展示值。
- 训练按钮展示真实成本和人口。
- 研究按钮展示来自 `ResearchDef.effects[]` 的效果说明，完成态仍能看到效果摘要。
- 禁用原因继续来自现有 availability 判断，并写入按钮 `title` / `dataset.disabledReason`。

Codex 复核时修正了 GLM 初版测试：旧测试多处写死 `75`、`13`、`19` 这类数值，不能证明 DOM 文案来自数据；现已改为导入 `GameData` 期望值，再和 DOM / fresh runtime state 对照。

本地验证：

```bash
./scripts/cleanup-local-runtime.sh
npm run build
npx tsc --noEmit -p tsconfig.app.json
./scripts/run-runtime-tests.sh tests/v6-visible-numeric-hints-proof.spec.ts tests/v6-research-effect-model-proof.spec.ts tests/v6-attack-armor-type-proof.spec.ts --reporter=list
./scripts/cleanup-local-runtime.sh
```

结果：build 通过，typecheck 通过，runtime `15/15` 通过，cleanup 已执行。

## 3. Codex 任务种子

### NUM-A：人族数值字段盘点

| 项 | 内容 |
| --- | --- |
| 目的 | 把当前单位、建筑、科技和技能需要的数值字段整理成一张最小 schema 清单，明确哪些字段已经存在、哪些字段要新增、哪些字段只留到后续版本。 |
| 为什么现在做 | V5 的 Rifleman 分支完成后，如果没有字段清单，后续每加一个单位或科技都会继续散落硬编码，数值系统会失控。 |
| 允许文件 | `docs/V6_NUMERIC_SCHEMA_INVENTORY.zh-CN.md`、`docs/V6_NUMERIC_SYSTEM_TASK_SEED.zh-CN.md`、`docs/CODEX_ACTIVE_QUEUE.md` closeout sync。 |
| 禁止文件 | `src/game/Game.ts`、`src/game/GameData.ts`、`src/game/SimpleAI.ts`、任何 runtime spec、`docs/GLM_READY_TASK_QUEUE.md`。 |
| 验收证据 | 文档必须列出 unit / building / research / ability 四类 schema；每个字段标记为 `已有`、`V6 必需`、`后续版本` 或 `拒绝扩张`；必须解释 attackType、armorType、research effect、UI disabled reason 与 AI 权重的关系。 |
| 适合谁 | Codex。它是范围和治理任务，不做实现。 |
| 停止继续生成 | 如果字段清单开始要求一次性覆盖完整英雄池、完整法术书、完整物品系统或真实素材，立即停止并拆回后续版本；V6 只保留数值底座必需字段。 |

### NUM-B：单位与建筑基础账本

| 项 | 内容 |
| --- | --- |
| 目的 | 为 V6 第一批可见人族内容建立基础账本：Peasant、Footman、Rifleman、Town Hall、Farm、Barracks、Blacksmith、Scout Tower 等现有或相邻对象必须有统一数值行。 |
| 为什么现在做 | 完整人族不能靠“新增按钮”和“新增模型”推进；最小账本能保证后续 GLM 实现有可对照的数据合同。 |
| 允许文件 | `docs/V6_HUMAN_NUMERIC_LEDGER.zh-CN.md`、`docs/V6_NUMERIC_SCHEMA_INVENTORY.zh-CN.md`、`docs/CODEX_ACTIVE_QUEUE.md` closeout sync。 |
| 禁止文件 | `src/game/GameData.ts`、`src/game/Game.ts`、`tests/v5-human-ai-rifleman-composition.spec.ts`、`docs/GLM_READY_TASK_QUEUE.md`。 |
| 验收证据 | 账本必须按单位、建筑、科技分表；每行至少说明成本、人口、生命、护甲、攻击、射程、训练/建造时间、前置、命令卡展示字段和后续 proof 位置。 |
| 适合谁 | Codex。它负责把账本边界写清，避免 GLM 在无合同状态下随手改数值。 |
| 停止继续生成 | 如果账本开始新增未排期的人族全部单位、英雄、空军、商店或物品实现任务，停止；只记录“终局需要”，不把它们变成当前实现。 |

### NUM-F：数值底座证明计划

| 项 | 内容 |
| --- | --- |
| 目的 | 把数值系统的实测方式提前写清：哪些 focused spec 证明 schema 被使用，哪些 state log 证明伤害、护甲、研究效果和命令卡展示来自同一数据源。 |
| 为什么现在做 | 没有证明计划，后续很容易把单次战斗胜负、按钮存在或截图当成数值系统通过。 |
| 允许文件 | `docs/V6_NUMERIC_PROOF_PLAN.zh-CN.md`、`docs/V6_HUMAN_NUMERIC_LEDGER.zh-CN.md`、`docs/CODEX_ACTIVE_QUEUE.md` closeout sync。 |
| 禁止文件 | `src/game/Game.ts`、`src/game/GameData.ts`、`src/game/SimpleAI.ts`、所有 runtime spec、`docs/GLM_READY_TASK_QUEUE.md`。 |
| 验收证据 | 计划必须至少包含 attackType / armorType 差异 proof、armor formula 组合 proof、research effect proof、command-card numeric hint proof、AI 同规则使用 proof 和 cleanup proof；每个 proof 都写清要读取 fresh state，不能复用旧 `g.units` 快照。 |
| 适合谁 | Codex。它负责让 proof 不扩大成完整人族实现。 |
| 停止继续生成 | 如果 proof 计划要求启动浏览器实测或实现代码，停止；本任务只写计划，真正 runtime proof 由后续 GLM 小切片执行。 |

## 4. GLM 任务种子

### NUM-C：攻击类型与护甲类型最小模型

| 项 | 内容 |
| --- | --- |
| 目的 | 在现有护甲减伤公式之外，加入最小 attackType / armorType 字段和倍率表，让 Rifleman、Footman、Worker、Tower 至少能表现出不同伤害关系。 |
| 为什么现在做 | 人族后续会出现 Rifleman、Mortar、Tower、Caster、Hero；如果没有攻击/护甲类型，所有单位只是在同一伤害公式里换数字。 |
| 允许文件 | `src/game/GameData.ts`、`src/game/Game.ts` 中与伤害计算直接相关的最小区域、`tests/v6-attack-armor-type-proof.spec.ts`、必要的测试工具文件。 |
| 禁止文件 | `src/game/SimpleAI.ts`，真实素材文件，菜单/UI polish 文件，V5-HUMAN1 当前 spec，任何与英雄、法术、物品实现相关的文件。 |
| 验收证据 | focused proof 必须证明同一攻击值在不同 armorType 下造成不同结果；armor 数值减伤仍生效；倍率表来自数据而不是分散 if；测试 mutation 后必须重新读取 `window.__war3Game` / `g.units`。 |
| 适合谁 | GLM。它是小范围运行时代码和 focused proof。 |
| 停止继续生成 | 如果需要一次性加入所有 War3 攻击类型、完整平衡表、Mortar/Caster/Hero 内容或 AI counter 改造，停止并退回 Codex 拆分。 |

### NUM-D：研究效果数据模型

| 项 | 内容 |
| --- | --- |
| 目的 | 把 Long Rifles 这类研究效果从单点逻辑整理为数据驱动模型，至少支持 flatDelta、percentDelta 或 unlockAbility 中的一种真实 effect。 |
| 为什么现在做 | V5 的 Long Rifles 只是第一条研究；V6 必须防止每个科技都写成一次性特殊逻辑。 |
| 允许文件 | `src/game/GameData.ts`、研究应用所需的最小 runtime 文件、`tests/v6-research-effect-model-proof.spec.ts`。 |
| 禁止文件 | `src/game/SimpleAI.ts`，英雄/法术/物品实现，完整科技树，真实素材导入，`docs/GLM_READY_TASK_QUEUE.md`。 |
| 验收证据 | focused proof 必须证明研究前后数值变化来自 research effect 数据；已完成研究不能重复叠加；命令卡能区分 unavailable、available、researching、completed；cleanup / reload 后状态不 stale。 |
| 适合谁 | GLM。它需要小范围实现和 runtime proof。 |
| 停止继续生成 | 如果任务开始实现多级攻防升级、所有 Blacksmith 科技、caster training 或英雄技能，停止；本任务只建立研究效果模型。 |

### NUM-E：玩家可见数值提示

| 项 | 内容 |
| --- | --- |
| 目的 | 让玩家在命令卡或选择面板中看到关键数值提示：成本、人口、前置、攻击类型、护甲类型、研究效果或禁用原因至少有一组来自真实数据。 |
| 为什么现在做 | 数值系统如果只在代码里存在，玩家仍然看不懂选择；V6 的身份表达需要可见数值支撑。 |
| 允许文件 | `src/main.ts`、`src/styles.css`、与命令卡/选择面板展示相关的最小文件、`tests/v6-visible-numeric-hints-proof.spec.ts`。 |
| 禁止文件 | 主菜单审美、真实素材导入、完整 UI 重做、英雄/物品实现、`docs/GLM_READY_TASK_QUEUE.md`。 |
| 验收证据 | focused proof 必须证明可见文字来自 unit / building / research 数据；disabled reason 与前置或资源不足一致；研究完成后的提示更新；返回或重新开始后提示不残留旧状态。 |
| 适合谁 | GLM。它是 bounded UI-data binding 和 focused proof。 |
| 停止继续生成 | 如果需要重做主菜单、重做 HUD 美术、引入官方图标或做完整百科面板，停止；本任务只做最小可见数值提示。 |

## 5. 防断供规则

V6 已经激活，队列可以按下面顺序补货，不需要临时发散：

1. 先派 NUM-A，确定字段清单。
2. 再派 NUM-B，建立基础账本。
3. 然后从 NUM-C / NUM-D 中选一个最小 runtime 切片。
4. NUM-C 或 NUM-D 至少一个通过后，再派 NUM-E，让玩家看到真实数值。
5. NUM-F 在 runtime 切片前后都可以作为 Codex 复核任务，确保 proof 不扩大。

这能防止 V5 完成后出现两种断供：

- 只有“继续做人族”这种大方向，没有可派发小任务。
- 直接跳到 V7 内容扩张，绕过数值底座。

## 6. 防无限扩张规则

任何后续任务只要触发下面任一条，就必须停止继续生成或退回 Codex 重新拆分：

- 要求一次性实现完整人族全部单位、英雄、法术、商店、物品、空军或攻城体系。
- 要求导入官方素材、来源不明素材或未批准第三方素材。
- 用“模型/按钮/名字存在”替代数值字段、真实效果和 focused proof。
- 用单场胜负替代攻击类型、护甲类型、研究效果或可见提示的独立证明。
- 把 V5-HUMAN1 未完成的 Rifleman 分支转移到 V6-NUM1。
- 把 UI polish、主菜单审美、release 文案或完整 War3 复刻写成 V6 数值底座任务。

## 7. 当前保守结论

```text
V6-NUM1 的第一批相邻任务已经完成字段盘点、基础账本、攻击/护甲模型、研究效果模型、玩家可见数值提示和 proof 计划。
当前 NUM-A 到 NUM-F 都已有工程证据；下一步不继续扩张 NUM1，而是转向 V6-ID1 身份系统最小切片。
它们只准备 V6 数值底座，不关闭或回改 V5-HUMAN1，不把完整人族内容、真实素材或完整 War3 平衡表提前塞进当前阶段。
```
