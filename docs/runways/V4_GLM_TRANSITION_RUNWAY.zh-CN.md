# V4 GLM Transition Runway

> 用途：这是 `V4 short-match alpha` 的 GLM 预热跑道草案。  
> 当前文件只定义 cutover-ready 后可播种的 bounded proof pack，不表示 V4 已经 active，不修改 live queue。

## 0. Runway Intent

GLM 在 V4 的职责是做窄范围、可复跑的 runtime proof pack：

- 证明开局到中期存在 pressure path。
- 证明玩家受损后仍有 recovery / counter path。
- 证明 win / lose / stall / results loop 是 truthful 的。
- 把 V3 carryover 当作 proof 支撑面，而不是展开成 UI polish 或素材导入。

GLM 不负责：

- 设计版本边界。
- 做素材 sourcing、license、授权或 art direction 判断。
- 裁决主菜单最终质量。
- 做泛化 gameplay overhaul。
- 提前把 V4 seed 写入 live queue。

当前 transition state:

```text
cutover-blocked
```

本 runway 只有在 `cutover-ready` 后才能播种到 GLM live queue。

## 1. Seed Draft Order

| Order | Seed draft | Gate focus | Purpose |
| --- | --- | --- | --- |
| 1 | `V4 GLM Seed 01 — Opening Pressure Proof Pack` | `V4-P1` | 证明前 5 分钟存在可解释压力路径。 |
| 2 | `V4 GLM Seed 02 — Recovery / Counter Proof Pack` | `V4-R1` | 证明玩家受损后有恢复与反打窗口。 |
| 3 | `V4 GLM Seed 03 — Ending / Result Truth Pack` | `V4-E1` | 证明胜负、停滞、结果页和返回路径诚实。 |
| 4 | `V4 GLM Seed 04 — Short-Match Carryover Guard Pack` | `V4-RD0` / `V4-SH1` | 只验证 carryover 是否破坏短局 proof，不做 polish。 |

## 2. Seed Draft Details

### V4 GLM Seed 01 — Opening Pressure Proof Pack

Status: `seed-draft / not-dispatched`

Gate: `V4-P1`

Goal:

证明开局到约 5 分钟内，玩家会遇到可复现、可解释、可感知的压力路径。

Write scope:

- runtime tests for V4 pressure proof
- narrow game state fixtures or debug hooks required by the tests
- evidence notes only if Codex dispatch allows them

Must prove:

1. pressure timeline 有明确起点、压力升级点和玩家可见威胁。
2. 压力类型至少落到进攻、骚扰、资源威胁、生产压力或地图压力之一。
3. AI idle、单次偶然交火、只证明单位存在，都不能写成 pressure pass。

Forbidden:

- 不做完整 AI rewrite。
- 不调完整 balance。
- 不新增 UI polish 或素材导入。

Closeout shape:

```text
command:
result:
pressure type:
timeline:
player-visible threat:
state after:
remaining gap:
```

### V4 GLM Seed 02 — Recovery / Counter Proof Pack

Status: `seed-draft / not-dispatched`

Gate: `V4-R1`

Goal:

证明玩家受压或受损后仍有可执行的恢复、重建、守住或反打路径。

Write scope:

- runtime tests for recovery/counter proof
- narrow game state fixtures or debug hooks required by the tests
- evidence notes only if Codex dispatch allows them

Must prove:

1. 受损状态可复现：worker、经济、建筑、单位或防线至少有一个真实损失面。
2. 玩家可以执行恢复动作：补 worker、恢复采集、补生产、重新集结或守关键点。
3. 存在反打窗口或稳定窗口，不是纯失败螺旋。

Forbidden:

- 不做完整 tech tree。
- 不做最终战斗平衡。
- 不把重开局写成恢复路径。

Closeout shape:

```text
command:
result:
damage surface:
recovery action:
counter window:
state after:
remaining gap:
```

### V4 GLM Seed 03 — Ending / Result Truth Pack

Status: `seed-draft / not-dispatched`

Gate: `V4-E1`

Goal:

证明短局可以诚实结束，或者在未完整结束时诚实说明 stall / timeout，不制造假天梯、假战役或假完整战报。

Write scope:

- runtime tests for win/lose/stall/result proof
- result surface / summary truth fixtures if Codex dispatch allows them
- evidence notes only if Codex dispatch allows them

Must prove:

1. `win`、`lose`、`timeout/stall` 的触发条件来自真实 game state。
2. results surface 和 summary 字段只使用真实 session state。
3. return path 不继承 stale gameplay、selection、placement、command-card 或 shell state。

Forbidden:

- 不写 ladder、campaign、profile、MMR、完整战报。
- 不把 partial ending proof 写成完整 match loop。
- 不回滚 V3 PS2 return/re-entry 工程证明。

Closeout shape:

```text
command:
result:
ending type:
source state:
summary fields:
return cleanup:
remaining gap:
```

### V4 GLM Seed 04 — Short-Match Carryover Guard Pack

Status: `seed-draft / not-dispatched`

Gate: `V4-RD0` / `V4-SH1`

Goal:

验证 V3 carryover 是否破坏 V4 short-match proof；只处理 proof blocker，不做视觉或菜单 polish。

Write scope:

- focused tests or screenshots only if they are required to support `V4-P1`、`V4-R1`、`V4-E1`
- evidence notes only if Codex dispatch allows them

Must prove:

1. readability tuning debt 没有让 pressure / recovery / ending proof 读不出来。
2. shell polish debt 没有让 pause、results、return、rematch、briefing 误导短局状态。
3. 若失败，必须路由回具体 V4 gate，而不是泛化成 UI polish。

Forbidden:

- 不做主菜单质量裁决。
- 不导入真实素材。
- 不做产品视觉 polish。

Closeout shape:

```text
command:
result:
carryover checked:
affected V4 gate:
failure surface:
remaining gap:
```

## 3. GLM Handoff Rules

每条 GLM seed 被真正派发时，必须由 Codex 给出：

- allowed files。
- focused verification command。
- stop condition。
- forbidden files / forbidden claims。
- closeout wording boundary。

GLM closeout 必须说明：

1. 跑了什么命令。
2. 结果是 pass、blocked 还是 insufficient-evidence。
3. 证明了哪个 V4 gate。
4. 哪些内容仍属于 user gate 或 residual。

## 4. Cutover Guard

这些 seed draft 只有在下面条件满足后才能播种：

1. V4 transition pack 五件 artifact 全部存在并一致。
2. cutover executor 将 active milestone 切到 `V4 short-match alpha`。
3. Codex live queue 明确接收 V4 seed。
4. GLM ready queue 明确接收 bounded V4 proof pack。

当前结论：

```text
V4 GLM runway 已预热；
V4 仍未 active；
seed queue 未派发。
```
