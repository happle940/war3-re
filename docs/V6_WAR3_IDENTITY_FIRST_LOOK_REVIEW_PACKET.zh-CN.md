# V6 War3-like 第一眼审查包

> 创建时间：2026-04-15 09:50:44 CST  
> 当前版本：V6 War3 identity alpha  
> 当前分支：`codex/econ-contract-integration`  
> 当前基础提交：`5c21f10`  
> 对应 gate：`V6-W3L1` War3-like identity first-look  
> 当前状态：`engineering-pass`

## 0. 这份审查包解决什么

这份文件不是宣传稿，也不是完整 War3 复刻声明。它只回答一个工程收口问题：

```text
当前 V6 是否已经从通用 RTS 原型，进入了 War3-like identity alpha？
```

判断只看三件事：

1. 玩家能看见足够的单位、建筑、科技和战斗数值。
2. 玩家能触发一个有状态、有限制、有反馈的身份能力。
3. 玩家能看出至少一组兵种或阵营定位差异。

缺任何一项，`V6-W3L1` 都不能关闭。

## 1. 当前工程状态

| 输入 | 当前状态 | 是否可用于 W3L1 | 结论 |
| --- | --- | --- | --- |
| `V6-NUM1` 人族数值底座 | `engineering-pass` | 是 | 单位、建筑、科技、攻击/护甲、研究效果和玩家可见提示已有 focused proof。 |
| `V6-ID1` 身份能力 | `engineering-pass` | 是 | 人族集结号令已证明可见状态、真实触发、有限效果、冷却限制、反馈和 cleanup。 |
| `V6-FA1` 兵种/阵营差异 | `engineering-pass` | 是 | Footman / Rifleman 角色差异证明包已由 Codex 接管修正并本地复核通过；读图、生产选择、战斗角色和 Long Rifles 定位差异均有 focused proof。 |
| `V6-UA1` 人眼判断 | `user-open / async` | 不阻塞工程预热 | 用户或目标 tester 可异步给 `pass`、`pass-with-debt`、`reject` 或 `defer`。 |

当前保守结论：

```text
W3L1 的工程证据已经成立。
NUM1、ID1、FA1 三份证据已合并到本文件；V6-UA1 的人眼判断仍异步保留，不阻塞后续工程预热。
```

## 2. 第一眼审查路径

W3L1 只使用一条最短路径，不做长局、不做完整战役、不做完整人族证明。

| 步骤 | 玩家或 tester 要做什么 | 应该观察到什么 | 来源证据 |
| --- | --- | --- | --- |
| 1 | 开局进入战场，选择 Town Hall、Peasant、Barracks 或相关单位。 | 选择面板或命令卡能看到成本、人口、攻击、护甲、科技效果或禁用原因。 | `V6-NUM1` / `tests/v6-visible-numeric-hints-proof.spec.ts` |
| 2 | 触发人族集结号令。 | 能看到能力可用、触发、生效、冷却或限制状态；单位状态或战斗表现发生可测变化。 | `V6-ID1` / `tests/v6-human-rally-call-identity-proof.spec.ts` |
| 3 | 对比 Footman 和 Rifleman。 | Footman 更像近战前排，Rifleman 更像远程火力；Long Rifles 只强化 Rifleman 的远程定位。 | `V6-FA1` / `tests/v6-footman-rifleman-role-identity-proof.spec.ts` |
| 4 | 综合判断当前一眼观感。 | 它不再只是基地、农民、步兵的通用 RTS 原型，而是有数值、能力和兵种差异的 War3-like 身份 alpha。 | 本文件最终 closeout |

## 3. 已有证据

### 3.1 NUM1：数值底座

当前可用证据：

- `docs/V6_NUMERIC_SCHEMA_INVENTORY.zh-CN.md`
- `docs/V6_HUMAN_NUMERIC_LEDGER.zh-CN.md`
- `docs/V6_NUMERIC_PROOF_PLAN.zh-CN.md`
- `tests/v6-attack-armor-type-proof.spec.ts`
- `tests/v6-research-effect-model-proof.spec.ts`
- `tests/v6-visible-numeric-hints-proof.spec.ts`

它证明：

- 单位、建筑、科技和能力不再只是散落字段。
- 攻击类型、护甲类型、研究效果和可见数值提示进入了真实数据和 runtime proof。
- 玩家能在当前 UI 中看到支持选择的数值信息。

它不证明：

- 完整 War3 数值平衡。
- 完整 Blacksmith 多级升级树。
- 完整人族所有单位。

### 3.2 ID1：身份能力

当前可用证据：

- `tests/v6-human-rally-call-identity-proof.spec.ts`
- Codex 本地复核：build 通过、typecheck 通过、ID1 focused 6/6 通过、相关 runtime 30/30 通过。

它证明：

- 至少一个等价法术或指挥能力已经存在。
- 该能力有玩家可见状态、真实触发、有限效果、冷却限制、反馈和 cleanup。
- 它不是按钮、图标或文案占位。

它不证明：

- 完整英雄系统。
- 完整法术书。
- 物品、背包、商店或掉落系统。

### 3.3 FA1：兵种/阵营差异

当前状态：

```text
engineering-pass
```

当前可用证据：

- `src/game/Game.ts`
- `src/game/GameData.ts`
- `tests/v6-footman-rifleman-role-identity-proof.spec.ts`
- Codex 接管复核：GLM job `glm-mnze1drz-a0hkcq` 首轮 runtime 失败后卡在 queued prompt；Codex 停止 GLM、取消 companion job、修正 proof-4 / proof-5，并完成本地验证。
- 验证结果：`npm run build` 通过；`npx tsc --noEmit -p tsconfig.app.json` 通过；FA1 focused runtime 5/5 通过；V6 identity 相关 runtime pack 22/22 通过；`node --test tests/lane-feed.spec.mjs` 36/36 通过；cleanup complete。

它证明：

- Footman / Rifleman 的成本、人口、攻击、护甲、射程、前置来自 `GameData` 和 runtime state。
- Barracks / Blacksmith / Long Rifles 形成不同生产或科技选择。
- Footman 以近战前排方式接敌，Rifleman 以远程方式输出。
- Long Rifles 只强化 Rifleman 的远程身份。
- 玩家能在选择面板或命令卡看到这些差异。

它不证明：

- 完整人族所有单位和完整科技树。
- 完整 War3 平衡。
- 完整 AI 兵种运营策略。
- 真实 Warcraft 素材或最终视觉风格。

## 4. 人眼判断问题

同一个 build 交给用户或 tester 时，只问这些问题：

| 问题 | 可接受回答 |
| --- | --- |
| 第一眼是否能看出这是有基地、采集、训练、科技和战斗的 RTS 对局？ | `pass` / `pass-with-debt` / `reject` / `defer` |
| Footman / Rifleman 的定位差异是否能被看懂？ | `pass` / `pass-with-debt` / `reject` / `defer` |
| 集结号令是否能被看懂：正在发生、何时不可用、带来什么影响？ | `pass` / `pass-with-debt` / `reject` / `defer` |
| 数值提示是否足够支撑当前选择？ | `pass` / `pass-with-debt` / `reject` / `defer` |
| 当前 slice 是否已经像 War3-like identity alpha，而不只是通用 RTS prototype？ | `pass` / `pass-with-debt` / `reject` / `defer` |

自动化只能准备证据，不能替用户做最终审美结论。

## 5. 明确不证明的内容

即使 W3L1 通过，也不代表下面这些已经完成：

- 完整英雄池、英雄等级、技能点、法术书。
- 完整物品、背包、商店、掉落。
- 完整人族所有单位、建筑和科技。
- 完整 War3 数值平衡。
- 真实 Warcraft 素材、音效或授权素材。
- 完整主菜单、战役、多人、ladder 或公开 demo。

这些只能进入后续版本，不得倒灌成 V6 的无限任务。

## 6. W3L1 关闭条件

`V6-W3L1` 已满足 `engineering-pass` 的最低条件：

1. `V6-NUM1` 保持 `engineering-pass`。
2. `V6-ID1` 保持 `engineering-pass`。
3. `V6-FA1` 已经 Codex 本地复核并改成 `engineering-pass`。
4. 本文件已补入 FA1 的真实文件、测试和复核结果。
5. 本文件最终结论明确写出“证明什么”和“不证明什么”。

达到这些条件后，V6 的工程 blocker 应只剩异步人眼 verdict，不应继续自动生成 V6 内容扩张任务。

## 7. 当前下一步

```text
更新 V6 ledger、remaining gates、live queue 和看板。
运行 milestone oracle，确认 V6 工程 blocker 是否清零。
若工程 blocker 清零：允许版本转换工具进入 V7 预热或切换；V6-UA1 保留为异步人眼 verdict。
若仍有 blocker：只修真实失败面，不继续扩张 V6 内容量。
```
