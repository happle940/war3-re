# Product Shell State Map

> 用途：把“完整页面版产品壳层”拆成真实状态图，而不是把菜单、setup、pause、results、back flow 混成一句空话。  
> 这份文档只回答三件事：现在有哪些状态、这些状态是怎么进出的、当前代码到底做到哪一步。

## 1. 状态图总览

```text
S0 Front Door / Main Menu
  -> S1 Mode Select
    -> S2 Match Setup
      -> S3 Loading / Briefing
        -> S4 Playing
          -> S5 Paused
          -> S6 Results

S5 Paused
  -> S4 Playing
  -> S2 Match Setup
  -> S0 Front Door / Main Menu

S6 Results
  -> S4 Rematch / Restart Current Map
  -> S0 Front Door / Main Menu

Global product pages:
S7 Settings
S8 Help / Controls
```

上面是目标形态。  
当前代码真实成立的，只是其中一小段：

```text
S4 Playing
  <-> S5 Paused
  -> S2 Match Setup
  -> S6 Results

S2 Match Setup
  -> restart current map

S6 Results
  -> restart current map
```

也就是说：

- `pause`
- `setup`
- `results`

这三块已经开始进入真实 session lifecycle；  
但 `Front Door / Main Menu / Mode Select / Loading / Briefing / Back-to-Menu / Rematch` 还没有作为产品状态真正成立。

## 2. 当前代码里的真实状态

### `S4` Playing

真实状态：`已成立`

当前入口：

- 默认启动直接进入对局
- `reloadCurrentMap()`
- `loadMap(mapData)`
- `resumeGame()`

当前出口：

- `pauseGame()` -> `S5`
- `openSetupShell()` -> `S2`
- `endGame()` -> `S6`

当前问题：

- 这还是“自动开局”的产品入口，不是前门
- 没有 mode select / loading / briefing

### `S5` Paused

真实状态：`部分成立`

当前载体：

- `/Users/zhaocong/Documents/war3-re/index.html` 里的 `#pause-shell`
- `/Users/zhaocong/Documents/war3-re/src/game/Game.ts` 里的 `pauseGame()` / `resumeGame()`

当前已成立：

- shell 可见性真实同步
- gameplay input 被阻断
- `继续`
- `重新加载当前地图`
- `Escape` 已经成为真实 live-play 入口

当前未成立：

- 键盘退出语义还在补
- 进入 setup 的 live path 还没接
- 返回主菜单还没接
- settings 还没接

### `S2` Match Setup

真实状态：`极小成立`

当前载体：

- `/Users/zhaocong/Documents/war3-re/index.html` 里的 `#setup-shell`
- `/Users/zhaocong/Documents/war3-re/src/game/Game.ts` 里的 `openSetupShell()` / `closeSetupShell()`

当前已成立：

- 它是一个真实 session overlay，不只是空 div
- 有一个真实动作：`开始当前地图`
- 动作走的是真实 seam：`reloadCurrentMap()`

当前未成立：

- live 入口还没接到真实玩家路径
- 返回当前对局的路径还没接
- 参数设置还不存在
- 它现在更像“session reset shell”，还不是完整 match setup

### `S6` Results

真实状态：`部分成立`

当前载体：

- `/Users/zhaocong/Documents/war3-re/index.html` 里的 `#results-shell`
- `/Users/zhaocong/Documents/war3-re/src/game/Game.ts` 里的 `endGame()`

当前已成立：

- `victory / defeat / stall` 有真实结果态
- shell 可见性真实同步
- 结果文案会写进 shell
- `重新加载当前地图` 已经真实成立

当前未成立：

- summary 仍然太薄
- rematch 还没有
- back-to-menu 还没有
- 对局摘要和失败原因解释仍不完整

## 3. 目标状态但当前未成立的页态

### `S0` Front Door / Main Menu

当前状态：`未成立`

当前代码现实：

- `#menu-shell` 只是容器
- 没有真实入口
- 没有真实动作

进入条件还没定义：

- 页面首次打开时是否默认先到这里
- runtime-test fast path 如何绕过它

### `S1` Mode Select

当前状态：`未成立`

还没有：

- quick start
- skirmish
- sandbox / test mode

### `S3` Loading / Briefing

当前状态：`未成立`

还没有：

- 进入对局前的理解层
- 地图/目标/控制提示
- 从前门世界切到对局世界的过渡

### `S7` Settings

当前状态：`未成立`

还没有：

- 音量
- 画面
- 控制说明
- 热键说明
- HUD / camera 选项

### `S8` Help / Controls

当前状态：`未成立`

还没有：

- 鼠标语义
- 常用命令
- 已实现 / 未实现边界说明

## 4. 当前最小真实闭环

如果只看当前真实成立的 product shell lifecycle，它不是完整产品，而是这条最小闭环：

```text
自动进局
  -> pause
    -> continue
    -> reload current map
  -> setup
    -> start current map
  -> results
    -> reload current map
```

这个闭环已经比“纯对局内核”更像产品了，但离完整页面版还差很远。

## 4.1 PS2 session-shell evidence route

`PS2` 的目标不是把 session shell 写成完整产品，而是证明已经可见的 `pause / setup / results / reload / terminal reset` seam 不互相污染、不留下 stale state。

PS2 只能按下面命名证据关闭；没有跑过对应 closeout 命令时，只能说“proof route 已定义”，不能说 stale-state 已被接受。

| 可见 seam | PS2 要证明什么 | 已有 focused regression route | 仍缺什么 / 不属于 PS2 的事 |
| --- | --- | --- | --- |
| `playing -> pause` | live play 能进入 pause；pause shell 可见；gameplay input 被阻断。 | `tests/pause-session-overlay-contract.spec.ts`、`tests/pause-shell-entry-hotkey-contract.spec.ts`、`tests/session-shell-transition-matrix.spec.ts` 的 `pause -> resume`。 | 用户是否觉得 pause 文案足够清楚，仍是 user judgment。 |
| `pause -> playing` | resume button / Escape 返回 playing；pause shell 隐藏；setup/results 不被打开；current map source 不被改。 | `tests/pause-session-overlay-contract.spec.ts`、`tests/pause-shell-exit-hotkey-contract.spec.ts`、`tests/session-shell-transition-matrix.spec.ts` 的 `pause -> resume`。 | 不证明 return-to-menu。 |
| `pause -> reload current map` | pause reload 走真实 current-map reload seam；回到 clean playing；pause/setup/results 都隐藏。 | `tests/pause-shell-reload-button-contract.spec.ts`、`tests/session-shell-transition-matrix.spec.ts` 的 `pause -> reload`。 | 不证明 rematch 或多地图 reload policy。 |
| `pause -> setup` | setup 能从已真实的 pause shell 进入；不是只靠 test hook。 | `tests/setup-shell-live-entry-contract.spec.ts`、`tests/session-shell-transition-matrix.spec.ts` 的 `pause -> setup`。 | setup 的产品定位仍是极小 session shell，不是完整 match setup。 |
| `setup -> start current map` | setup 的唯一真实动作是 start current map；动作清理 selection/result/shell residual 并回到 playing。 | `tests/setup-shell-contract.spec.ts`、`tests/session-shell-transition-matrix.spec.ts` 的 `setup -> start current map`。 | 不证明地图、难度、阵营、规则配置。 |
| `setup -> return prior session` | setup 可以不 reload 而返回来源 phase；从 pause 进入则回到 pause，从 playing 进入则回到 playing。 | `tests/setup-shell-return-path-contract.spec.ts`、`tests/session-shell-transition-matrix.spec.ts` 的 `pause -> setup -> return -> pause round-trip`。 | 用户是否理解“返回”语义仍需人眼判断。 |
| `playing -> results / terminal` | 终局进入时隐藏 pause/setup residue；results shell 与 terminal verdict 同步。 | `tests/terminal-shell-reset-contract.spec.ts`、`tests/session-shell-transition-matrix.spec.ts` 的 `terminal entry hides pause and setup residue`。 | results summary 文案真实性属于 `PS6`，不能并入 PS2。 |
| `results -> reload current map` | results action 走真实 reload seam；terminal surfaces 清理；回到 playing。 | `tests/results-shell-reload-button-contract.spec.ts`、`tests/session-shell-transition-matrix.spec.ts` 的 `results -> reload`。 | 不证明 rematch、return-to-menu 或完整战报。 |
| `results summary` | 只在 PS2 范围内检查它不会留下 stale terminal shell；内容真实性不在 PS2 关闭。 | stale/reset 侧由 `tests/terminal-shell-reset-contract.spec.ts`、`tests/session-shell-transition-matrix.spec.ts` 覆盖；内容侧路由到 `tests/results-shell-summary-contract.spec.ts`。 | `PS6` 负责 summary 是否来自真实 session、是否 overclaim。 |
| `return-to-menu / re-entry` | 不作为 PS2 blocker 关闭条件。 | 如果入口 visible，证据路由到 `tests/session-return-to-menu-contract.spec.ts`、`tests/front-door-reentry-start-loop.spec.ts`。 | 属于 `PS5` / V3 session-shell work，不能拿来关闭 PS2。 |

PS2 closeout 的最低命令证据应列出：

```bash
./scripts/run-runtime-tests.sh tests/pause-session-overlay-contract.spec.ts tests/pause-shell-entry-hotkey-contract.spec.ts tests/pause-shell-exit-hotkey-contract.spec.ts tests/pause-shell-reload-button-contract.spec.ts tests/setup-shell-contract.spec.ts tests/setup-shell-live-entry-contract.spec.ts tests/setup-shell-return-path-contract.spec.ts tests/results-shell-reload-button-contract.spec.ts tests/terminal-shell-reset-contract.spec.ts tests/session-shell-transition-matrix.spec.ts --reporter=list
```

如果 closeout 同时声明 results summary 内容真实，必须额外跑 `tests/results-shell-summary-contract.spec.ts`，并把结论记到 `PS6`，不是 `PS2`。

## 5. 下一阶段最合理的接线顺序

按当前代码边界，最稳的顺序不是先造完整菜单，而是继续把 session lifecycle 收真：

1. pause 退出热键闭环
2. setup live entry
3. setup return path
4. results summary truth
5. session shell transition matrix
6. 再定义 front door / main menu / mode select / loading

原因很直接：

- `pause / setup / results` 已经有真实 runtime seam
- `menu / mode select / loading` 目前还没有真实会话地基
- 先把闭环做实，后面的 front door 才不会变成空壳导航

## 6. 文档与任务对齐

这份状态图对应当前 live queue：

- 已完成的最小 session-shell 事实：pause、setup、results、reload、terminal reset、transition matrix 已经进入真实会话生命周期。
- 当前继续推进的 front-door/session-shell 线：menu start、source truth、manual map entry、return-to-menu、re-entry。
- Codex 当前的 routing 口径：`docs/SESSION_SHELL_GAP_ROUTING.zh-CN.md`

`SESSION_SHELL_GAP_ROUTING` 负责把后续缺口拆成四类：

- 已经真实、只需守住 regression 的 seam。
- 仍然 dormant，不能写成已完成能力的 surface。
- 可以作为 safe GLM implementation slice 的窄缺口。
- 必须由 Codex 或用户先判断的产品语义、承诺边界和分享口径。

配套文件：

- `/Users/zhaocong/Documents/war3-re/docs/SESSION_SHELL_GAP_ROUTING.zh-CN.md`
- `/Users/zhaocong/Documents/war3-re/docs/DUAL_LANE_STATUS.zh-CN.md`
- `/Users/zhaocong/Documents/war3-re/docs/CODEX_ACTIVE_QUEUE.md`
- `/Users/zhaocong/Documents/war3-re/docs/GLM_READY_TASK_QUEUE.md`
- `/Users/zhaocong/Documents/war3-re/docs/WAR3_PAGE_PRODUCT_MASTER_PLAN.zh-CN.md`
