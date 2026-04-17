# V6-NUM1 数值底座证明计划

> 生成时间：2026-04-15  
> 适用范围：V6 War3 identity alpha / V6-NUM1 / NUM-F  
> 上游输入：`docs/V6_NUMERIC_SCHEMA_INVENTORY.zh-CN.md`、`docs/V6_HUMAN_NUMERIC_LEDGER.zh-CN.md`  
> 重要边界：本文件只定义证明方式，不改运行时代码，不跑浏览器，不新增 GLM 任务，不实现完整人族、英雄、法术、物品或真实素材。

## 1. 目标

V6-NUM1 要证明的是“数值系统正在形成”，不是“某个单位变强了”。

因此证明必须同时回答四个问题：

1. 数值字段在统一数据入口里。
2. 运行时代码真的读取这些字段。
3. 玩家或测试能看到这些字段造成的结果。
4. cleanup、reload、mutation 后不会靠旧状态假绿。

## 2. 不能算通过的证据

下面这些证据不能关闭 V6-NUM1：

- 单场战斗赢了或输了。
- 单个 Rifleman、Footman 或 Tower 的数值被手动调过。
- 命令卡出现了按钮，但按钮文案不可追溯到数据。
- 只在测试里硬造结果，运行时代码没有读取 schema。
- 攻击/护甲类型只写在 if 分支里，没有集中表或数据字段。
- Long Rifles 仍只靠 `LONG_RIFLES_RANGE_BONUS` 单点常量表达，不进入 research effect model。
- 测试杀单位、重开局、训练单位后继续使用旧的 `const units = g.units` 快照。

## 3. Proof 总表

| Proof | 对应任务 | 主要读取数据 | 运行时读取点 | 必须证明 | 不通过条件 |
| --- | --- | --- | --- | --- | --- |
| 攻击/护甲类型差异 | NUM-C | `attackDamage`、`attackType`、`armor`、`armorType`、倍率表 | `dealDamage()` 或等价伤害结算入口 | 同一攻击值命中至少两种 `armorType` 时结果不同。 | 只改伤害数字；不同结果来自测试硬改 hp；倍率散落在 if。 |
| 护甲数值组合 | NUM-C | `armor`、`armorType`、倍率表 | 同一伤害结算入口 | `armor` 公式仍参与最终伤害，且和类型倍率组合。 | 新类型倍率绕过原护甲公式；armor 改变不影响结果。 |
| 建筑/单位同规则 | NUM-C | `UnitDef`、`BuildingDef` 的 weapon/defense 字段 | unit/building spawn 和伤害结算 | 单位和建筑使用同一套 attack/armor 字段合同。 | 建筑继续用单独硬编码 armor 或默认分支。 |
| 研究效果模型 | NUM-D | `ResearchDef.effects[]`、`stackPolicy`、`displayStats` | 研究完成应用入口 | 研究前后数值变化来自 effect 数据，不能重复叠加。 | 每个科技仍写专用 if；研究完成后 reload/cleanup 残留。 |
| 命令卡数值提示 | NUM-E | unit/building/research 的 cost、supply、attack、armor、range、prereq、effect summary | command-card / selection panel 渲染入口 | 玩家可见文案能追溯到真实数据，disabled reason 与资源或前置一致。 | 手写 tooltip；资源不足、前置不足、已完成状态显示不一致。 |
| AI 同规则使用 | NUM-D 或后续 | `ai.productionWeight`、`ai.buildWeight`、`ai.researchWeight` 或等价最小字段 | SimpleAI 决策读取点 | AI 至少一处生产、建造或研究偏好来自数据入口。 | AI 偏好继续只散落在策略分支，不能追溯到 schema。 |
| 清理与重开局 | NUM-C / NUM-D / NUM-E | 完成研究、单位 spawn、命令卡 cache、game state | reload / return / cleanup 路径 | 重开局或 cleanup 后没有旧研究、旧命令卡、旧 selection、旧单位快照。 | 测试未重新读取 fresh state；旧 DOM 或旧 unit 引用仍能影响断言。 |

## 4. Runtime proof 读取规则

所有 runtime spec 必须遵守下面规则：

1. 每次调用会改变世界状态的方法后，重新读取 `window.__war3Game` 或重新从 `g.units` 查询对象。
2. 不把旧数组、旧 Unit 引用或旧 DOM 节点作为 mutation 后的最终证据。
3. 允许为了构造 fixture 修改资源、hp、armor 或研究状态，但最终断言必须读运行时结果。
4. 如果测试需要比较伤害，必须记录攻击前 hp、攻击后 fresh hp、计算差值和数据字段来源。
5. 如果测试需要比较命令卡文案，必须记录按钮 label、disabled reason 和对应 data key。

## 5. NUM-C 通过标准

`tests/v6-attack-armor-type-proof.spec.ts` 至少需要覆盖：

| 测试点 | 最低要求 |
| --- | --- |
| 类型差异 | 同一攻击者或同一攻击值打两个不同 `armorType` 目标，伤害不同。 |
| 护甲组合 | 同一 `armorType` 下改变 armor 数值，最终伤害随护甲公式变化。 |
| 集中表 | 测试能从 `GameData` 导入或间接证明存在集中倍率表，不接受散落 if。 |
| fresh state | 每次修改 hp、armor、type 或重新 spawn 后，都重新读取目标单位。 |

NUM-C 完成后，只能说明 attack/armor 最小模型通过，不能关闭完整数值系统。

## 6. NUM-D 通过标准

`tests/v6-research-effect-model-proof.spec.ts` 至少需要覆盖：

| 测试点 | 最低要求 |
| --- | --- |
| 数据来源 | Long Rifles 的射程变化来自 `ResearchDef.effects[]` 或等价 data-driven 字段。 |
| 一次性 | 研究完成后再次触发不会重复叠加。 |
| 现有 + 新单位 | 已存在 Rifleman 和研究后新训练 Rifleman 都得到同一效果。 |
| 状态展示 | command-card 能区分 unavailable、available、researching、completed。 |
| 清理 | reload / cleanup 后旧研究状态不残留到新局。 |

NUM-D 不能扩成完整 Blacksmith 科技树。

## 7. NUM-E 通过标准

`tests/v6-visible-numeric-hints-proof.spec.ts` 至少需要覆盖一组可见数值：

| 可见面 | 最低要求 |
| --- | --- |
| 单位训练 | cost、supply、hp、attack、armor、range 或 prereq 至少一组来自 `UnitDef`。 |
| 建筑建造 | cost、supply provided、hp、build time 或 trains/researches 来自 `BuildingDef`。 |
| 研究 | cost、research time、requiresBuilding、effect summary 来自 `ResearchDef`。 |
| 禁用原因 | 黄金不足、木材不足、人口不足、缺前置、已研究、研究中等原因来自真实状态。 |

NUM-E 不能重做 HUD 美术、主菜单审美或素材图标。

## 8. V6-NUM1 收口条件

V6-NUM1 只有在下面条件全部满足时，才可以从 `open` 改为 `engineering-pass`：

1. NUM-A 字段盘点完成。
2. NUM-B 基础账本完成。
3. NUM-C attack/armor runtime proof 通过。
4. NUM-D research effect model proof 通过。
5. NUM-E visible numeric hints proof 通过，或有明确文档说明为什么本轮只允许延后到后续 gate。
6. 至少一份 evidence ledger 写明：字段入口、运行时读取点、测试证据和剩余债务。
7. 所有涉及浏览器/runtime 的验证后执行 cleanup，并确认没有 Vite / Playwright / Chromium 残留。

## 9. 明确不进入 V6-NUM1 的内容

- 完整 War3 攻防倍率表。
- 完整 Human roster。
- 完整 Blacksmith 科技树。
- 英雄等级、技能树、物品栏和商店。
- 官方素材或第三方素材导入。
- 公开发布包、主菜单美术、landing page、宣传文案。

这些可以进入 V6-ID1、V6-FA1、V7 或素材治理阶段，但不能作为 NUM-F 派生任务。

## 10. 当前结论

```text
NUM-F 证明计划完成，NUM-C、NUM-D、NUM-E 已按该计划形成 runtime proof。
后续不继续在 NUM1 内扩张内容量；如果再补数值任务，必须绑定新的具体 gate，而不是重复生成 NUM-C/NUM-D/NUM-E。
V6-NUM1 不能再用单场胜负、按钮存在、截图观感或单个 Rifleman 数值作为通过证据。
```
