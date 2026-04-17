# Front-Door Session Summary Acceptance Matrix

> 用途：定义前门上的“上局摘要 / last-session summary”怎样才算真实产品进展，而不是装饰性 UI 或假历史系统。

## 0. 当前口径

本文对应 `C80`。

当前真实里程碑仍是：

```text
V2 credible page-product vertical slice
```

Front-door summary 不是 V2 必须项；它只能作为 front-door clarity 的辅助。如果出现，就必须满足：

```text
只展示当前 runtime / session 已经真实知道的事实；
无法证明的事实宁可隐藏或显示 unavailable；
不能把一块摘要面板包装成 match history、profile、campaign progress 或 replay system。
```

## 1. 可以真实展示的 session facts

| Fact | 可以显示吗 | 必须满足 | 不满足时 |
| --- | --- | --- | --- |
| `no previous session` | 可以 | 当前浏览器 runtime / local record 没有有效上一局记录。 | 显示“暂无上一局记录”，不要伪造摘要。 |
| `last verdict` | 可以 | 来自真实 results / terminal state，例如 victory、defeat、stall；不是硬编码。 | 隐藏 verdict 或显示“上一局结果不可用”。 |
| `last map/source` | 可以 | 与真实 current-map / procedural / manual source record 对齐；source id/name 不未知。 | 显示 generic “当前地图”或隐藏 source。 |
| `last ended reason` | 可以 | 来自终局状态或明确退出路径。 | 不显示 reason。 |
| `last summary fields` | 条件可以 | 字段已在 results summary 中真实产生，例如真实 verdict、真实 source、真实 elapsed / session counter。 | 只显示已知字段，不补假 kills、APM、score。 |
| `last return path` | 条件可以 | return-to-menu / reload / re-entry seam 已有事件或状态记录。 | 不显示“可继续”或“已返回”。 |
| `current playable path` | 可以 | 只是说明下一次 start 会进入哪个真实 source。 | 不能写成上一局记录。 |

当前 `PS6` 最低安全形态：

```text
results shell：Victory/Defeat/Stall + 时长 + 我方/敌方 live 单位/建筑数；
front-door summary：暂无上一局记录，或当前 runtime 内的“上次结果：胜利/失败/僵局”短标签。
```

它不证明完整历史、存档、继续游戏、地图来源摘要或完整战报系统。

## 1.1 当前 PS6 可见字段白名单

`PS6` 只覆盖当前已经可见的 results / summary surface。它不是 profile、match history、ladder、campaign progress 或完整 postgame report。

当前允许写入或保留的字段只有：

| Surface | 当前可显示字段 | 真实来源 | 需要的 proof | 不允许顺手扩展 |
| --- | --- | --- | --- | --- |
| `results-shell message` | `胜利` / `失败` / `僵局` | `Game.endGame(result)` 的 terminal verdict。 | `tests/results-shell-summary-contract.spec.ts`、`tests/terminal-shell-reset-contract.spec.ts`。 | 不写 rank、mission complete、campaign chapter、ladder result。 |
| `results-shell summary` | `时长 mm:ss` | terminal 时刻的 `gameTime`。 | `tests/results-shell-summary-contract.spec.ts`。 | 不写 APM、score、efficiency、build order。 |
| `results-shell summary` | 我方 / 敌方 live `单位` 数和 `建筑` 数 | terminal 时刻 `units` live state，按 team 与 building flag 统计。 | `tests/results-shell-summary-contract.spec.ts`。 | 不写 kills、losses、resources gathered、damage dealt，除非之后真实采集。 |
| `results reload cleanup` | reload 后 summary 为空，回到 playing。 | `reloadCurrentMap()` 与 terminal reset。 | `tests/results-shell-summary-contract.spec.ts`、`tests/results-shell-reload-button-contract.spec.ts`、`tests/terminal-shell-reset-contract.spec.ts`。 | 不写 rematch / next map / continue saved game。 |
| `front-door last-session summary` | 当前 runtime 内的上局结果短标签，例如 `上次结果：胜利`。 | `return-to-menu` 时读取当前 `getMatchResult()`。 | `tests/front-door-last-session-summary-contract.spec.ts`、`tests/front-door-last-session-summary-reset-contract.spec.ts`。 | 不写完整战报、历史列表、跨刷新记录、profile stats。 |

当前必须保守处理的点：

- front-door last-session summary 只能作为当前 runtime 的轻量结果提示，不得作为持久化历史。
- 若要显示 `stall / 僵局`，必须有明确 mapping 和 regression；不能把非 victory 一概写成失败。
- source、duration、unit/building counts 目前属于 results shell summary；不能自动搬到 front-door summary，除非另有 source binding 和清理 proof。
- 任何 PS6 closeout 必须说清字段来自 runtime state，而不是硬编码文案。

## 2. 不允许展示或必须后置的 facts

| Fact / claim | 为什么不能在当前 summary 里展示 |
| --- | --- |
| `continue saved game` | 当前没有完整存档/恢复对局状态；不能把 re-entry 或 start current map 写成 continue。 |
| `match history` | 需要持久化列表、版本迁移、清理规则和隐私边界。 |
| `win rate / streak / profile stats` | 需要多局记录和真实统计，不属于当前 V2/V3 shell。 |
| `score / rank / MMR / ladder` | 暗示 multiplayer / ranking 产品层，当前不存在。 |
| `campaign progress / chapter / mission rewards` | 暗示战役系统，后置到更晚阶段。 |
| `APM / kills / resource totals / build order` | 若 runtime 没有真实采集并对齐 results summary，就不能展示。 |
| `cloud sync / account / cross-device` | 当前没有账号或云存储。 |
| `replay available` | 当前没有 replay 记录与播放器。 |
| `full battle report` | 当前 results summary 仍是 alpha 级，不是完整战报。 |

PS6 hard reject：

- `ladder`、`rank`、`MMR`、`season`、`placement`。
- `campaign`、`chapter`、`mission reward`、`progress`。
- `full postgame report`、`battle report complete`、`match history`。
- fake `score`、`kills`、`APM`、`resource total`、`build order`。
- `continue saved game`、`resume`、`replay available`。

## 3. Stale / overclaimed 行为

下面行为必须打回，不能算 product progress。

| 行为 | 问题 |
| --- | --- |
| reload current map 后仍显示旧 terminal verdict 为“当前状态”。 | stale result 泄漏到新局。 |
| 手动或 future source 改变后，仍显示旧 map/source 的摘要。 | source truth 被污染。 |
| 浏览器刷新后没有持久化 record，却显示“上局继续”。 | 把内存状态伪装成存档。 |
| local record schema/version 不匹配还照常展示。 | 可能展示旧版本假数据。 |
| 没有 terminal state，却显示 victory/defeat。 | 硬编码或误读状态。 |
| summary panel 出现 fake kills、score、APM、win rate。 | 过度声明统计系统。 |
| “再来一局”按钮其实走新的默认局，但文案写“继续上一局”。 | action label 与 behavior 不一致。 |
| summary 被当成 mode-select、match history 或 profile 的完成证据。 | 超出当前 product-shell scope。 |

## 4. Acceptance Matrix

| 能力 | `accept` 条件 | `defer` 条件 | `reject` 条件 |
| --- | --- | --- | --- |
| `empty state` | 没有有效 session record 时显示清楚 empty state，不暗示隐藏历史。 | 文案不够清楚但不误导。 | 空状态写成“正在加载历史”或假 pending。 |
| `last verdict summary` | verdict 来自 terminal/results state；reload/source change 后清理。 | verdict 字段缺 proof，但 panel 可隐藏。 | 硬编码 victory/defeat 或旧结果残留。 |
| `last source summary` | source 与 start current map / manual source truth 一致。 | 只能显示 generic source，不显示 id/name。 | 旧 source、假 map name、fake map pool。 |
| `action link` | `start current map`、`restart current map` 或 `return to menu` 文案和真实行为一致。 | action 暂时隐藏。 | 写 continue/rematch 但没有真实 seam。 |
| `summary persistence` | 如果跨 refresh 保留，必须有 schema/version/expiry/clear path。 | 不跨 refresh，只在当前 runtime 显示。 | 没有持久化策略却暗示长期历史。 |
| `regression proof` | 有 focused spec 证明写入、读取、清理、source change、empty state。 | 只有人工检查，不能 close。 | 没有 proof 却写成 product accepted。 |

## 4.1 PS6 proof route

PS6 closeout 的最低工程证据必须按字段拆开：

| Claim | 必须跑的 proof |
| --- | --- |
| results verdict label 来自真实 terminal state | `tests/results-shell-summary-contract.spec.ts`、`tests/terminal-shell-reset-contract.spec.ts` |
| results summary 字段来自真实 match state | `tests/results-shell-summary-contract.spec.ts` |
| reload / terminal reset 不留下旧 summary | `tests/results-shell-summary-contract.spec.ts`、`tests/results-shell-reload-button-contract.spec.ts`、`tests/terminal-shell-reset-contract.spec.ts` |
| front-door last-session summary 只显示当前 runtime 的轻量结果 | `tests/front-door-last-session-summary-contract.spec.ts`、`tests/front-door-last-session-summary-reset-contract.spec.ts` |

最低命令证据：

```bash
./scripts/run-runtime-tests.sh tests/results-shell-summary-contract.spec.ts tests/results-shell-reload-button-contract.spec.ts tests/terminal-shell-reset-contract.spec.ts tests/front-door-last-session-summary-contract.spec.ts tests/front-door-last-session-summary-reset-contract.spec.ts --reporter=list
```

如果 closeout 只跑了其中一部分，只能关闭对应字段，不能把整个 PS6 写成 closed。

## 4.2 2026-04-14 PS6 evidence closeout

当前 PS6 工程证据已按最低命令完整复跑：

```bash
./scripts/run-runtime-tests.sh tests/results-shell-summary-contract.spec.ts tests/results-shell-reload-button-contract.spec.ts tests/terminal-shell-reset-contract.spec.ts tests/front-door-last-session-summary-contract.spec.ts tests/front-door-last-session-summary-reset-contract.spec.ts --reporter=list
```

结果：

```text
13 passed (2.8m)
```

本次只支持以下 alpha 级事实：

| Surface | 已有证据 | 当前允许结论 |
| --- | --- | --- |
| results verdict label | `tests/results-shell-summary-contract.spec.ts`、`tests/terminal-shell-reset-contract.spec.ts` passed。 | verdict 来自真实 terminal/result state，不是硬编码胜负文案。 |
| results summary | `tests/results-shell-summary-contract.spec.ts` passed。 | `时长 mm:ss`、我方/敌方 live 单位数与建筑数来自 terminal 时刻 match state。 |
| reload / terminal reset cleanup | `tests/results-shell-summary-contract.spec.ts`、`tests/results-shell-reload-button-contract.spec.ts`、`tests/terminal-shell-reset-contract.spec.ts` passed。 | reload 或 loadMap 后旧 terminal/result summary 会清理，不能残留到新局。 |
| front-door last-session summary | `tests/front-door-last-session-summary-contract.spec.ts`、`tests/front-door-last-session-summary-reset-contract.spec.ts` passed。 | front door 只可显示当前 runtime 内的轻量上局结果短标签，并能更新、清理、避免 shell navigation 泄漏。 |

仍缺或仍禁止的证据：

- 用户尚未确认 alpha 级结果摘要是否足够清楚、是否会被误解为完整战报或历史系统。
- front-door summary 没有证明跨刷新持久化历史、完整 match history、source/duration/unit/building counts 搬到前门、replay、continue saved game 或 rematch/next-map flow。
- 当前没有真实采集 `score`、`kills`、`APM`、resource totals、damage dealt、build order、rank、MMR、ladder、campaign chapter、mission reward。
- 任何后续新增字段必须先补 runtime source、清理规则和 focused regression，不能借本次 PS6 closeout 自动通过。

## 5. GLM-safe implementation work

在 Codex 已经给定字段和文案后，下面工作可以作为 GLM-safe slice：

| Slice | GLM 可以做什么 | 必须证明 |
| --- | --- | --- |
| `summary-empty-state` | 在 front door 放一个可隐藏的 empty state。 | 无 session record 时不显示假历史；不影响 start current map。 |
| `summary-runtime-record` | 从真实 terminal/results state 写入一个最小 runtime session summary。 | terminal 后可读；reload/source change 清理；无 terminal 不写 verdict。 |
| `summary-source-binding` | 把 summary 的 source id/type 与 menu source truth 对齐。 | source change 后 summary 不污染 start path。 |
| `summary-action-wiring` | 按指定文案接 `start current map` 或已存在 restart seam。 | action label 与实际 behavior 一致。 |
| `summary-regression-pack` | 新增 focused proof，例如 `tests/front-door-session-summary-contract.spec.ts`。 | 同时不回退 `tests/results-shell-summary-contract.spec.ts`、`tests/terminal-shell-reset-contract.spec.ts`、`tests/menu-shell-map-source-truth.spec.ts`。 |

GLM-safe 的前提：

- 字段列表由 Codex 给定。
- 文案不暗示 continue、match history、profile、campaign 或 replay。
- 不新增账号、云同步、持久化历史列表。
- 不改 gameplay、AI、经济、胜负规则。

## 6. Codex-only wording / judgment

下面事项不能交给 GLM 代判。

| 事项 | 原因 |
| --- | --- |
| 哪些事实值得展示 | 这是产品承诺，不是机械接线。 |
| “上一局”“当前地图”“再来一局”“继续”的中文语义 | 容易误导为存档/恢复/历史系统。 |
| 是否允许跨刷新保留 summary | 涉及隐私、持久化、版本迁移和产品预期。 |
| summary 是否算 V2 progress | 必须和 front-door acceptance、results summary、remaining gates 对齐。 |
| 是否向用户展示 win/loss 以外的细节 | 需要判断是否会制造假战报或正式产品感。 |
| 人眼是否觉得它有帮助 | 需要用户或 tester 判断。 |

## 7. 仍然 out of scope 的后期产品层

Front-door summary 不能提前承诺这些层：

- 完整 match history。
- profile / account / cloud sync。
- replay / timeline / detailed battle report。
- achievements、quests、campaign progress。
- multiplayer / ladder / rank / MMR。
- long-term analytics、win rate、streak。
- resume saved game / save slot。
- full rematch / next-map flow，除非对应 seam 已单独证明。

这些最多进入 V4/V5+ 或外部产品化阶段，不是当前 V2/V3 front-door summary 的范围。

## 8. Closeout 需要写什么

任何 front-door session summary slice 的 closeout 必须写：

1. 展示了哪些 session facts。
2. 每个 fact 来自哪个 runtime/session source。
3. 何时清理 summary：reload、source change、new terminal、hard refresh、schema mismatch。
4. 跑了哪些 focused regression。
5. 明确没证明什么：不是 continue、不是 match history、不是 profile、不是 replay、不是 public-ready feature。

一句话：

```text
truthful front-door summary = small factual recap；
不是存档、历史、战报、账号或进度系统。
```
