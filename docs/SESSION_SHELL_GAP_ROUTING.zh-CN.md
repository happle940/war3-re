# Session Shell Gap Routing Pack

> 用途：把 pause / setup / results / return-to-menu / re-entry 这些 session-shell 缺口拆成明确 routing，避免 GLM、Codex 和用户判断混在一起。

## 1. 当前路由原则

当前真实里程碑仍是：

```text
V2 credible page-product vertical slice
```

所以 session shell 的目标不是完整系统菜单，而是让玩家在一局内有可信控制权：

- 能暂停。
- 能继续。
- 能重载当前地图。
- 能看到结果。
- 能从结果或暂停路径回到可理解状态。
- 不能把 dormant 容器写成已完成产品能力。

判断顺序：

1. 先确认 seam 是否真实存在。
2. 再看是否有 runtime regression。
3. 再决定是 GLM safe slice、Codex-only integration，还是 user judgment。

## 2. 已经真实 vs 仍 dormant

| Seam / surface | 当前状态 | 证据口径 | 路由 |
| --- | --- | --- | --- |
| `pause entry` | 已经真实 | live-play `Escape` 能进入 pause；gameplay input 被阻断。 | 保持 regression；只允许窄修。 |
| `pause resume` | 已经真实 | `继续` 走真实 resume path。 | 保持 regression；不再重做。 |
| `pause reload current map` | 已经真实 | pause shell 可走 current-map reload seam。 | 可作为后续 return/re-entry 的基础。 |
| `setup live entry` | 已经真实 | pause -> setup 已接入。 | 保持为 session settings/setup 最小入口。 |
| `setup return path` | 已经真实 | setup 可回到进入前 phase。 | 保持 regression；不要扩成完整 settings。 |
| `results shell entry` | 已经真实 | terminal state 进入 results，隐藏 pause/setup 残留。 | 保持 regression；摘要可继续补。 |
| `results reload current map` | 已经真实 | results shell 可重载当前地图。 | 可作为 rematch 前置，不等于 rematch 完成。 |
| `results summary` | 最小真实 | 已有真实摘要字段，但仍是 alpha 级。 | 可改文案/字段，但需保持不假统计。 |
| `front-door boot` | 最小真实 | 普通路径进入 menu shell；runtime-test bypass 保留。 | 属于 front-door family，不在本包扩张。 |
| `menu start current map` | 最小真实或正在收口 | 只证明一个真实 start seam。 | 属于 front-door family。 |
| `return-to-menu` | 尚未完整真实 | 需要 pause/results 返回 menu、gameplay inactive、stale shell 清理。 | Safe GLM slice，但必须配套 regression。 |
| `front-door re-entry` | 尚未完整真实 | return-to-menu 后再次从真实 source 开局。 | Safe GLM slice，依赖 return-to-menu。 |
| `mode select` | dormant | 无真实模式列表和 enabled/disabled 语义。 | V3+，先不实现完整体系。 |
| `loading / briefing` | dormant | 无真实地图名、目标、控制提示和进入状态。 | V3 product-shell work。 |
| `settings` | dormant / 极小 setup seam | setup 不是完整 settings。 | 用户判断前不扩成偏好系统。 |
| `help / controls` | dormant | 无完整已实现/未实现说明入口。 | Codex 文案/验收优先，GLM 后接 UI。 |

## 3. Safe GLM implementation slices

这些可以交给 GLM，但必须保持窄 scope、contract-first、不可改 gameplay 规则：

| Gap | GLM 可做什么 | 必须证明 |
| --- | --- | --- |
| `return-to-menu from pause` | 在 pause shell 加返回菜单动作，调用真实 session/menu seam。 | gameplay inactive；menu visible；pause/setup/results hidden；current source preserved。 |
| `return-to-menu from results` | 在 results shell 加返回菜单动作，清理 terminal/results state。 | results hidden；menu visible；旧 verdict/summary 不污染下一局。 |
| `front-door re-entry` | return-to-menu 后再次 start current map。 | menu source truth 保持；playing clean；无 stale pause/results/setup。 |
| `results summary tightening` | 增补真实可得字段或文案，不造假统计。 | 字段来自当前 session；reload 后清理；terminal regression 仍过。 |
| `help / controls minimal surface` | 增加当前实现/未实现边界的静态帮助入口。 | 不暗示未实现模式；可打开/关闭；不影响 pause/results。 |
| `loading / briefing minimal proxy` | 加一个极小过渡/说明层，只显示当前地图、目标、控制提示。 | 不阻塞进入；缺图 fallback；不假装战役剧情。 |

GLM slice 必须带 focused spec；如果 spec 不存在，当前 slice 创建它。

## 4. Codex-only integration / truth work

这些不应直接派给 GLM 做产品判断：

| Gap | 为什么 Codex owns |
| --- | --- |
| 是否把 setup 叫 settings、match setup 还是 session reset | 这是产品语义，不是接线问题。 |
| 哪些未实现能力要 hidden、disabled 或写明 not yet implemented | 这是承诺边界。 |
| front-door / return-to-menu / re-entry 的完成口径 | 需要和 `FRONT_DOOR_ACCEPTANCE_MATRIX`、README、release wording 对齐。 |
| shell slice cadence 和队列同步 | 防止 GLM 在未 review 状态上继续堆功能。 |
| approved asset batch 是否可进入 shell | 需要 legal / tone / fallback approval，不是 import 工作。 |
| public/private share 文案是否可以说“页面产品成立” | 需要用户 approval 前的安全措辞。 |

Codex-only 不等于 Codex 一定写代码；它表示 Codex 必须先定边界，再决定能否派 GLM。

## 5. 必须等待用户产品判断

下面这些不能靠 runtime green 自动通过：

- front door 第一眼是否清楚“这是什么、从哪里开始”。
- pause / results 是否让人理解当前会话状态。
- setup / settings / help 的命名是否符合玩家预期。
- results summary 是否足够说明胜负和下一步。
- 页面壳层视觉是否可信、不误导、不像素材拼贴。
- 是否可以对外说“适合公开分享”。

可以先准备 evidence，但不能写成 accepted。

## 6. 回归包要求

| Gap family | 最低 regression pack |
| --- | --- |
| `pause/session` | 新 focused spec + `tests/pause-session-overlay-contract.spec.ts` + `tests/session-shell-transition-matrix.spec.ts`。 |
| `setup/settings` | 新 focused spec + `tests/setup-shell-contract.spec.ts` + `tests/setup-shell-return-path-contract.spec.ts` + transition matrix。 |
| `results` | 新 focused spec + `tests/results-shell-reload-button-contract.spec.ts` + `tests/results-shell-summary-contract.spec.ts` + `tests/terminal-shell-reset-contract.spec.ts`。 |
| `return-to-menu` | `tests/session-return-to-menu-contract.spec.ts` + `tests/session-shell-transition-matrix.spec.ts`。 |
| `re-entry` | `tests/front-door-reentry-start-loop.spec.ts` + `tests/session-return-to-menu-contract.spec.ts` + current front-door start/source spec。 |
| `help/loading proxy` | 新 focused spec + no regression to transition matrix；不能 fake campaign/mode promise。 |

如果某个 listed spec 还不存在，任务必须创建它，或 Codex 将该 slice 记为延期。

## 7. 下一步排序

推荐顺序：

1. `return-to-menu from pause/results`
2. `front-door re-entry start loop`
3. `results summary tightening`
4. `help / controls minimal surface`
5. `loading / briefing minimal proxy`
6. settings / setup 命名与偏好系统，等待用户判断后再扩

不要先做：

- 完整 mode select。
- 完整 settings。
- 完整 loading cinematic。
- 完整 rematch / campaign / multiplayer promise。
- shell 视觉资产导入，除非已有 approved handoff packet。

## 8. 一句话结论

```text
Session shell 的下一步不是“继续堆壳”，而是把 return、re-entry、summary、help/loading 这些缺口按 GLM-safe、Codex-only、user-judgment 三类拆开。
```

## 9. V3-PS2 2026-04-14 收口复核

Gate: `V3-PS2`

当前 closeout verdict:

```text
blocked
```

### 已成立的基础

| 基础 seam | 结论 |
| --- | --- |
| pause entry / resume | 已经真实，可作为 return-to-menu 的入口基础。 |
| pause reload current map | 已经真实，但只证明 reload seam，不证明 return-to-menu。 |
| results shell entry | 已经真实，可作为 results return 的入口基础。 |
| results reload current map | 已经真实，但只证明 reload seam，不证明 re-entry from menu。 |
| terminal reset / results summary truth | 已有基础 proof，但不等于 V3-PS2 closeout。 |

### 仍 blocked 的四段

| Segment | 当前结论 | 必须补的 proof |
| --- | --- | --- |
| return-to-menu from pause | `blocked` | pause shell action 返回 menu；gameplay inactive；pause/setup/results hidden；menu visible。 |
| return-to-menu from results | `blocked` | results shell action 返回 menu；terminal/results state 不继续驱动 gameplay；summary 只保留真实轻量状态。 |
| front-door re-entry | `blocked` | return-to-menu 后再次 start current map；生成 clean playing session；不复用上一局 dead / victory / terminal state。 |
| source truth + stale cleanup | `blocked` | 返回 menu 后 current source / mode / map / start action 仍 truthful；selection、placement、command-card、pause/setup/results state 不污染下一局。 |

### 最小后续任务

下一步只需要一个 `V3-PS2 return/re-entry focused proof or repair`：

- 实现或证明 pause -> menu。
- 实现或证明 results -> menu。
- 证明返回 menu 后 gameplay inactive。
- 证明 menu source truth preserved。
- 证明再次 start current map 是 clean new session。
- 证明 stale selection / placement / command-card / terminal / pause / setup / results state 被清理。

不属于该任务：

- results summary 字段扩展。
- main-menu quality。
- help/settings usefulness。
- briefing/loading explanation。

## 10. V3-PS2 2026-04-14 返回再开局证据复核

Gate: `V3-PS2`

Review task: `PS2 返回再开局证据复核`

当前 closeout verdict:

```text
blocked
```

### 当前 focused command 证据

GLM closeout 记录的 focused rerun：

```bash
./scripts/run-runtime-tests.sh tests/session-return-to-menu-contract.spec.ts tests/front-door-reentry-start-loop.spec.ts --reporter=list
```

Result: `6/6 pass`，同时记录 build clean 和 tsc clean。

覆盖的断言面：

| Segment | 结论 | 当前证据 |
| --- | --- | --- |
| return-to-menu from pause | `pass` | `session-return-to-menu-contract.spec.ts` 覆盖 pause -> menu、menu visible、pause/results hidden、gameplay inactive。 |
| return-to-menu from results | `pass` | `session-return-to-menu-contract.spec.ts` 覆盖 results -> menu、results hidden、matchResult cleared、gameplay inactive。 |
| front-door re-entry | `pass` | `front-door-reentry-start-loop.spec.ts` 覆盖 return 后再次 menu -> briefing -> play，playing active、menu hidden、units present。 |
| source truth preserved | `pass` | `front-door-reentry-start-loop.spec.ts` 覆盖 return 后 source label 与 derived source 一致，当前 source kind 为 `procedural`。 |
| stale shell / result cleanup | `pass` | focused specs 覆盖 pause/results shell hidden、isGameOver false、matchResult null、gameTime reset。 |
| stale interaction cleanup | `blocked` | 当前 focused specs 未显式断言 selection、placement、command-card 在 return/re-entry 后被清理。 |

### 最小后续任务

该轮之后的下一步曾是补一个很窄的 `V3-PS2 stale interaction cleanup proof extension`；最新状态见下一节 `V3-PS2 2026-04-14 残留清理证据收口复核`：

- return-to-menu 后 selection 不残留到 menu。
- re-entry 后 selection 不继承上一局。
- placement ghost / placement mode 不继承上一局。
- command-card state / disabled reasons 不继承上一局。

仍不属于该任务：

- results summary truth，继续归 summary / results gate。
- main-menu hierarchy 或 visual quality。
- help/settings/briefing usefulness。
- rematch、profile、history 或 account-level session restore。

## 11. V3-PS2 2026-04-14 残留清理证据收口复核

Gate: `V3-PS2`

Review task: `PS2 残留清理证据收口复核`

当前 closeout verdict:

```text
engineering-pass
```

### 已成立的产品路径基础

| Segment | 当前结论 | 已有证据 |
| --- | --- | --- |
| return-to-menu | `pass` | Codex 复跑 `./scripts/run-runtime-tests.sh tests/v3-product-shell-return-reentry-proof.spec.ts --reporter=list` 6/6 pass；覆盖 pause/results -> menu、menu visible、pause/results/briefing hidden、gameplay inactive、matchResult cleared。 |
| re-entry | `pass` | 6/6 pass；覆盖 return 后再次 menu -> briefing -> play，gameTime < 1s，worker / Town Hall / goldmine 重新生成。 |
| source truth | `pass` | 6/6 pass；覆盖 return 后 source label 为 `当前：程序化地图`，mode label 为 `模式：遭遇战`。 |
| shell/result cleanup | `pass` | 6/6 pass；覆盖 pause/results shell hidden、isGameOver false、matchResult null、gameTime reset。 |

### Stale cleanup surface 结论

| Surface | 当前结论 | 当前 proof |
| --- | --- | --- |
| selection | `pass` | 用例先制造 worker selection 和 selection ring；return 后 `selectionAfterReturn: 0`，re-entry 后 `selectionAfterReentry: 0`，full cycle 两轮 selection 都为 0。 |
| placement | `pass` | 用例先进入 placement mode 并确认 `hadPlacementMode: true`；return 后 `ghostAfterReturn: false`，re-entry 后 `ghostAfterReentry: false`。 |
| command-card | `pass` | 用例输出 `commandCardEmpty: true`；re-entry 后 selection 为 0，所以旧 worker build command context、buttons、disabled reasons 不继承到新局。 |

### Scope boundary

本段只关闭 `V3-PS2` 工程路径，不把“session shell 已真实”写成所有产品壳层通过。

不属于该任务：

- results summary truth。
- main-menu quality。
- secondary help/settings/briefing usefulness。
- PS1 入口焦点或 PS3 explanation layer。
