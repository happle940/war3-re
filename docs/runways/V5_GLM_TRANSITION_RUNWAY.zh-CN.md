# V5 GLM Transition Runway

> 用途：定义 `V5 strategy backbone alpha` 正式切换后，GLM 可以持续领取的首批 bounded proof pack。  
> 状态：V4_TO_V5 preheat seed draft。V5 尚未 active，本文件不得直接派发 live queue。

## 0. 使用边界

GLM 在 V5 的职责不是决定产品方向，也不是大改战略系统。

GLM 只接这类任务：

- 一个明确 gate。
- 一个 focused proof pack。
- 一组受控 runtime fixture。
- 小范围 repair，仅在 proof 明确失败且 allowed files 已限定时允许。
- 结案必须给出原始验证命令和剩余未知。

GLM 不接：

- UI polish。
- 主菜单审美裁决。
- 真实素材 sourcing / 授权判断。
- V4 closeout 补救。
- V6 英雄、法术、物品、阵营身份系统。
- 完整长局、完整天梯、完整战役或公开 demo。

## 1. V5 Gate 对应 GLM 任务形状

| V5 gate | GLM 任务形状 | 可写范围原则 | 必须产出的证据 |
| --- | --- | --- | --- |
| `V5-ECO1` Economy and production backbone | 经济与产能主链 proof pack | 优先 tests；必要时小范围触碰 `src/game/Game.ts`、`src/game/SimpleAI.ts`、`src/game/GameData.ts` | worker / gather / supply / production queue / 补 worker / 补兵 state log，focused runtime spec |
| `V5-TECH1` Tech and build-order backbone | 科技与建造顺序 proof pack | 优先 tests 与数据表；只有前置关系缺失时才触碰核心实现 | build order timeline、前置条件、解锁或强化效果、失败回退，focused runtime spec |
| `V5-COUNTER1` Basic counter and army composition backbone | 基础 counter 与兵种组成 proof pack | 优先 tests；必要时小范围触碰 combat data、AI production choice 或 command fixture | counter relation、单位组成差异、生产选择变化、战斗结果 state log，focused runtime spec |

## 2. 首批 Seed Draft

这些不是 live queue。只有 V4_TO_V5 cutover 完成后，才能把它们转成 `docs/GLM_READY_TASK_QUEUE.md` 的 ready 任务。

| Seed | Gate | 标题 | 目标 | 停止条件 |
| --- | --- | --- | --- | --- |
| `V5-GLM-01` | `V5-ECO1` | 经济与产能主链证明包 | 证明资源、worker、supply、生产队列能支撑连续生产，而不是只消耗初始资源。 | focused spec 通过，并记录资源流、队列、supply、补 worker/补兵路径；若失败，点名断在哪个子链。 |
| `V5-GLM-02` | `V5-TECH1` | 建造顺序与科技前置证明包 | 证明至少一条 build order 会解锁或强化后续选择。 | focused spec 通过，并记录前置、建造顺序、解锁/强化结果和失败回退；不得只证明建筑能摆出来。 |
| `V5-GLM-03` | `V5-COUNTER1` | 基础 counter 与编队差异证明包 | 证明至少一个 counter 或兵种组成选择会改变生产、编队或战斗结果。 | focused spec 通过，并记录双方 composition、生产选择、战斗 state log 和结果差异；不得只跑单一单位互殴。 |

## 3. 派发规则

V5 active 后，GLM 派发顺序默认是：

```text
V5-GLM-01 -> V5-GLM-02 -> V5-GLM-03
```

允许调整顺序的情况：

- `V5-ECO1` proof 明确依赖已有 tech 前置，Codex 可以先拆一个更小的 `V5-TECH1` fixture。
- `V5-COUNTER1` proof 明确缺少生产选择输入，必须先补 `V5-ECO1` 或 `V5-TECH1`。
- runtime 资源异常时，GLM 只能继续文档/fixture 设计，不得强开多个 Playwright/Vite。

## Task 101 — ECO1 经济产能主链证明包

Goal:

证明资源、worker、supply、生产队列能支撑连续生产，而不是只消耗初始资源。

Write scope:

- tests/v5-economy-production-backbone.spec.ts
- src/game/Game.ts
- src/game/SimpleAI.ts
- src/game/GameData.ts

Must prove:

1. worker、gold/lumber、supply、Town Hall、Barracks、Farm 或等价 production chain 能支持连续生产。
2. 生产队列和 supply 约束来自真实 runtime state，不是测试里硬造结果。
3. 受损后能补 worker 或补兵，并记录资源流和队列状态；如果断链，点名最小失败面。

## Task 102 — TECH1 科技建造顺序证明包

Goal:

证明至少一条 build order 会解锁或强化后续选择，建筑和科技不是装饰。

Write scope:

- tests/v5-tech-build-order-backbone.spec.ts
- src/game/Game.ts
- src/game/GameData.ts

Must prove:

1. build order 有前置条件、建造顺序和可观察的解锁或强化结果。
2. 前置缺失时有明确失败或禁用状态，不能默默允许假科技。
3. proof 输出 timeline，说明玩家为什么能看懂这个建造/科技选择。

## Task 103 — COUNTER1 基础克制与兵种组成证明包

Goal:

证明至少一个 counter 或兵种组成选择会改变生产、编队或战斗结果。

Write scope:

- tests/v5-counter-composition-backbone.spec.ts
- src/game/Game.ts
- src/game/SimpleAI.ts
- src/game/GameData.ts

Must prove:

1. 至少一个 counter relation 或 army composition choice 影响战斗结果或生产选择。
2. state log 能记录双方 composition、关键战斗事件和结果差异。
3. 不能把单一单位互殴或纯数值胜负写成 counter backbone pass。

## 4. 验证底线

每个 GLM V5 proof pack 至少要给出：

```bash
npm run build
npx tsc --noEmit -p tsconfig.app.json
./scripts/run-runtime-tests.sh <focused-spec> --reporter=list
./scripts/cleanup-local-runtime.sh
```

如果只改文档或测试候选，不触碰 runtime 行为，可用：

```bash
git diff --check -- <changed-files>
node --test <affected-node-tests>
```

但不能把“只跑了文档检查”写成 gameplay proof。

## 5. Codex 复核要求

GLM closeout 后，Codex 必须复核：

- proof 是否覆盖 gate 原话。
- 是否读了旧 `g.units`、旧 DOM 或旧 state。
- 是否把受控 fixture 冒充真实平衡结论。
- 是否越界改了未授权文件。
- 是否留下 runtime 残留进程。

复核结果只能是：

| 结论 | 含义 |
| --- | --- |
| `accepted` | proof 与 gate 对齐，本地验证通过。 |
| `accepted-with-debt` | proof 成立，但留下明确 residual，不阻塞当前 gate。 |
| `send-back` | proof 缺覆盖或测试有假绿风险，退回 GLM 修。 |
| `codex-takeover` | GLM 卡在测试/实现盲点，Codex 接管小范围修复。 |
| `rejected` | 任务越界、证据不可用或方向错误。 |

## 6. 当前保守结论

```text
这是 V5 GLM runway 的预热草案。
它只定义 V5 active 后 GLM 可以领取的证明包形状。
它不激活 V5，不修改 live queue，不代表任何 V5 gate 已通过。
```
