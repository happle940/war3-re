# V5 到 V6 当前交接总览

> 更新时间：2026-04-14  
> 用途：把当前真实结果、V5 剩余事项、V6 第一批任务和自动切换规则放在同一页，避免 V6 漏掉数值底座或把未完成的 V5 工作带过去。  
> 给项目管理者看的短结论：V5 工程项已经具备收口条件；V6 第一件事必须是数值系统，不是继续随机加单位。

## 1. 当前真实结果

| 项 | 当前状态 | 说明 |
| --- | --- | --- |
| 经济与产能 | 已通过 | worker、gold/lumber、supply、production cycle 和 recovery 已有 focused proof。 |
| 建造与科技顺序 | 已通过 | Farm、Barracks、Footman 的资源、建筑、人口前置和可观察 progression 已有 focused proof。 |
| 基础兵种组成差异 | 已通过 | Footman / Worker / Tower 组合差异、护甲减伤和基础 composition proof 已通过。 |
| 人族第一条单位/科技线 | 已通过 | Task 104 Blacksmith/Rifleman 已通过；Task 105 Long Rifles 已通过；Task 106 AI Rifleman composition 已通过。Codex 补测了 Blacksmith 丢失后 AI 不再排 Rifleman。 |
| 人眼判断 | 异步 | 用户可以随时补试玩反馈，但不要求同步确认才能从 V5 自动进入 V6。 |

## 2. V5 结束前只剩什么

V5 结束前原来只剩一个工程问题：

```text
AI 是否按和玩家相同的规则使用 Blacksmith -> Rifleman -> Long Rifles。
```

现在已经证明：

- AI 建 Blacksmith，而不是假装有前置。
- AI 训练 Rifleman，而不是直接生成单位。
- AI 不绕过资源、人口、建筑前置和研究状态。
- AI 的进攻队伍不再只是 footman-only。
- 测试、构建、类型检查和 cleanup 都通过。
- Codex 额外确认 Blacksmith 丢失后 AI 不会继续排 Rifleman。

V5 不再补这些内容：

- 完整人族科技树。
- 英雄、法术、物品、商店、车间、空军、攻城。
- 主菜单审美、UI polish、release 文案。
- 真实素材导入。
- 完整战斗平衡。

## 3. 自动进入 V6 的触发

V5 可以自动进入 V6 的条件，以及当前状态：

1. Task 106 完成，并给出可信 closeout。当前：已完成。
2. Codex 复核 Task 104、Task 105、Task 106 的证据没有互相断开。当前：已复核，并补了前置丢失测试。
3. `V5-HUMAN1` 从 open 改成工程通过。当前：文档已改为工程通过。
4. `node scripts/milestone-oracle.mjs --json` 不再显示 V5 工程项未完成。当前：已确认，当前阶段为 V6。

用户不需要在这里同步确认。用户后续反馈仍然重要，但会作为 V6 或后续版本任务插入。

## 4. V6 接收什么

V6 接收的是已经收口的战略骨架，不接收未完成工作。

| 来自 V5 的输入 | V6 如何使用 |
| --- | --- |
| ECO1 经济与产能 proof | 作为数值系统和 AI 策略的基础背景，不重新打开。 |
| TECH1 建造/科技顺序 proof | 作为 research / prerequisite 数据模型的背景，不冒充完整科技树。 |
| COUNTER1 组成差异 proof | 作为 attackType / armorType 和单位身份差异的背景，不冒充完整平衡。 |
| H1 Blacksmith/Rifleman/Long Rifles proof | 作为第一条人族分支样本，支撑数值 schema 和 research effect model。 |
| V5 人眼反馈 | 作为 V6 first-look 和可读性输入，不阻塞自动切换。 |

## 5. V6 第一批任务

V6 开始后默认按这个顺序补货：

| 顺序 | 任务 | 谁更适合 | 目的 |
| --- | --- | --- | --- |
| 1 | `NUM-A` 人族数值字段盘点 | Codex | 先确定单位、建筑、科技、技能需要哪些字段。 |
| 2 | `NUM-B` 单位与建筑基础账本 | Codex | 给现有和相邻人族对象建立统一数值行。 |
| 3 | `NUM-C` 攻击类型与护甲类型最小模型 | GLM | 让伤害关系不再只是一个攻击值减护甲。 |
| 4 | `NUM-D` 研究效果数据模型 | GLM | 让 Long Rifles 这类科技效果变成数据驱动。 |
| 5 | `NUM-E` 玩家可见数值提示 | GLM | 玩家能看到成本、人口、前置、攻击/护甲、研究效果或禁用原因。 |
| 6 | `NUM-F` 数值底座证明计划 | Codex | 固定测试边界，避免用单场胜负或按钮存在冒充数值系统。 |

这批任务的详细种子在 `docs/V6_NUMERIC_SYSTEM_TASK_SEED.zh-CN.md`。

## 6. 防漏项规则

V6 不能漏掉下面这些事：

- 新单位必须有数值行。
- 新建筑必须有功能入口。
- 新科技必须有真实效果。
- 攻击类型和护甲类型必须进入数据模型。
- 研究效果必须能复用，不能每个科技写一段特殊逻辑。
- 玩家必须能看到至少一部分真实数值或真实禁用原因。
- AI 必须使用同一套规则，不能直接 spawn 或绕过前置。

## 7. 防扩张规则

如果任务开始要求下面内容，必须停下重新拆：

- 一次性实现完整人族。
- 一次性实现所有英雄、法术、物品、商店、空军、攻城。
- 导入官方素材或未批准素材。
- 重做主菜单审美或 UI polish。
- 用模型、名字、按钮、截图或单场战斗胜负代替系统 proof。

## 8. 一句话标准

```text
V5 完成 = 玩家和 AI 都能真实使用第一条新人族单位/科技线。
V6 完成 = 后续人族内容进入统一数值系统，并出现至少一个能被玩家看懂的 War3-like 身份表达。
```
