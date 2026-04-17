# 模式选择 Placeholder Review Checklist

> 用途：给 Codex 审查 mode-select placeholder slice 的固定口径，避免 disabled 分支、假 route、假模式文案被接受为“菜单进展”。
> 范围：本文只约束当前 `V2 credible page-product vertical slice` 的 review，不授权完整模式系统、War3 parity、战役、多人与完整 skirmish 分支。

## 0. 上游口径

本文对应 `C81`，审查时必须先对齐：

- `docs/MODE_SELECT_ACCEPTANCE_MATRIX.zh-CN.md`
- `docs/FRONT_DOOR_ACCEPTANCE_MATRIX.zh-CN.md`
- `docs/WAR3_PAGE_PRODUCT_MASTER_PLAN.zh-CN.md`

核心判断：

```text
mode-select placeholder 可以只有一个真实 enabled 分支；
但所有 visible 分支都必须被诚实分类为 enabled / disabled / absent；
任何假 route、假加载、假完整模式文案都不能算产品进展。
```

## 1. Review 输入必须齐

Codex 接受 GLM closeout 前，必须拿到或本地补齐这些信息：

- 改动文件列表，且全部在任务允许范围内。
- mode-select 上所有 visible branch 的列表。
- 每个 visible branch 的状态：`enabled`、`disabled`、`hidden`、`absent`。
- enabled branch 对应的真实 runtime path 和回归证据。
- disabled branch 的不可点击证据。
- 文案截图、DOM 文本或测试断言，证明没有完整模式支持的过度声明。
- 返回前门或留在同一 front-door surface 的真实路径证明。

缺任一项时，不接受为 mode-select placeholder 进展，只能退回补证据或拆下一片。

## 2. Disabled / unavailable 分支审查

| 检查项 | 接受标准 | 退回 / 拒绝标准 |
| --- | --- | --- |
| 视觉状态 | disabled branch 明显不可用，hover/focus 不暗示可进入。 | 仅灰色但仍像可点击主操作。 |
| 交互状态 | click、Enter、Space、route link 都不能进入 loading、空页或假成功 toast。 | disabled branch 会触发 route、loading、toast、dialog 或假错误页。 |
| 文案边界 | 只写“未开放”“V3+”“需要后续实现”等短说明。 | 写成“可选地图”“选择阵营”“AI 难度”“战役”“多人”等已支持口吻。 |
| 数据真实性 | 不展示假地图池、假 race、假 difficulty、假 campaign、假 online 状态。 | 为了填满菜单加入 mock 内容且没有明确 debug 标记。 |
| 缺席判断 | 战役、多人、天梯、完整 race/hero、replay/editor/store/social 默认 absent。 | 把远期战略能力作为 disabled tile 广告出来。 |
| 证据形态 | 有 DOM/text/route/test 证据证明不可进入。 | 只在 closeout 里口头说“disabled”。 |

Disabled 不等于 backlog 展示位。只有和当前 shell trunk 相邻、后续可能真实落地的模式，才允许 disabled 展示；远期产品承诺应 absent。

## 3. 一个 implemented branch 何时够用

一个 implemented branch 只能支撑 `accept-v2-placeholder`，不能支撑“完整 mode-select”。

可以接受的最低形态：

- 唯一 enabled branch 是 `Start current map`、`Quick start` 或等价的当前可玩路径。
- 该分支真的进入已验证 runtime path，不是 mock loading 或空页。
- UI 明确说明来源，例如 current map、quick start、dev/prototype source。
- 未实现的近邻 branch disabled 或 hidden，远期 branch absent。
- 可以返回前门，或明确属于同一个 front-door surface。
- focused regression 证明 enabled path 可进入，disabled path 不可进入。

不够用的情况：

- enabled branch 只是打开一个未接线页面。
- current-map path 没有 source truth，玩家无法知道启动的是什么。
- disabled branch 仍能触发 route、loading、toast 或空白页。
- closeout 把一个 enabled branch 写成“模式选择完成”。
- 文案暗示已有地图池、阵营、难度、战役或多人。

结论措辞必须写成：

```text
接受为 V2 mode-select placeholder；
不代表完整 mode-select、完整 skirmish、地图浏览器、战役、多人与 War3 parity。
```

## 4. Fake full-mode support 文案判定

以下口径一律视为 fake full-mode support，除非同时存在真实实现和回归证据：

- “模式选择已完成”
- “完整模式入口”
- “Skirmish ready / 遭遇战已支持”
- “Custom maps supported / 自定义地图已支持”
- “Campaign / Multiplayer / Ladder”
- “选择种族 / 选择英雄 / 选择难度 / 选择队伍”
- “地图池 / 地图库 / 多地图可选”
- “所有模式即将开放”这类远期广告式承诺
- “War3-like menu complete” 或等价完整产品口吻

安全口径：

- “最小 mode-select placeholder”
- “当前只有 current-map / quick-start path enabled”
- “manual/custom/skirmish 仍为 disabled 或 absent，需后续真实路径证明”
- “此 slice 只证明前门到当前对局路径的选择入口更诚实”

## 5. 何时拒绝并拆下一片

立即拒绝，不进入 queue done：

- 任务外文件被修改，或 GLM 自行扩大到 mode system/product judgment。
- disabled branch 可点击、可路由、可加载或可触发假成功。
- enabled branch 没有真实 runtime proof。
- 文案把 placeholder 包装成完整模式支持。
- 加入假的地图池、阵营、难度、战役、多人、在线状态。
- regression 只证明页面存在，不证明分支状态和 route 边界。

退回并拆下一片的方式：

| 问题 | 下一 GLM slice 应拆成 | Codex 保留判断 |
| --- | --- | --- |
| disabled 仍可进入 route | `disable-mode-branch-routing` | 哪些 branch 应 disabled vs absent。 |
| 文案过度承诺 | `mode-select-copy-truth-pass` | 哪些产品承诺可展示。 |
| enabled path 缺 source truth | `mode-select-source-label-proof` | source label 的验收口径。 |
| 缺不可点击回归 | `mode-select-disabled-branch-regression` | 是否需要升到更大回归包。 |
| fake map/race/difficulty 数据 | `remove-fake-mode-data` | 是否保留任何 placeholder 数据。 |
| return path 不稳 | `mode-select-return-path-regression` | 是否阻塞 V2 closeout。 |

拆片原则：一次只修一个可证明问题，不让 GLM 同时决定产品层级、改文案、改 route、补测试和调整视觉。

## 6. 最低回归证明

每个 mode-select placeholder closeout 至少要覆盖：

- enabled branch：能从 front door 或 mode-select 进入真实当前对局路径。
- disabled branch：click / keyboard activation 不进入 route、不 loading、不 toast 假成功。
- absent branch：不出现战役、多人、天梯、完整 race/hero、replay/editor/store/social 等远期入口。
- wording：没有完整模式、完整产品、War3 parity 的过度声明。
- return：进入前和返回后的 shell/source 状态不被污染。

可接受的证据形态：

- 现有 focused runtime spec 覆盖这些断言。
- 新增 focused runtime spec，且文件在对应任务允许范围内。
- 对 docs-only closeout，至少提供 DOM/text/route 审查记录和明确的后续 GLM regression 任务。

如果改动触及 front-door、session-shell、loading/briefing 或 return-to-menu 状态，Codex 必须升级到对应 shell family regression pack，而不是只看 mode-select 页面截图。

## 7. Codex 结论模板

每次审查必须写出：

```text
Conclusion: accept-v2-placeholder / defer / reject
Enabled branches:
Disabled branches:
Absent branches:
Proof run:
Fake-support wording found: yes/no
Remaining user judgment:
Next split if rejected/deferred:
```

只有 `accept-v2-placeholder` 且证据齐全时，才能把该 slice 写入队列 done。`defer` 只能记为 dormant infrastructure，`reject` 必须给出下一片拆分。

## 8. PS3 当前审查记录

审查时间：`2026-04-13`。

Conclusion: `accept-v2-placeholder / visible-pass`。

Enabled branches:

- `menu-mode-select-button`：打开 `mode-select-shell`，不进入 gameplay。
- `mode-select-skirmish-button`：当前唯一 enabled mode choice；点击后回到 menu，不自动开始对局。
- `menu-start-button` -> `briefing-start-button`：当前唯一 live-play route，进入当前地图 gameplay。

Disabled branches:

- `mode-select-campaign-button`：`战役（未实现）`；disabled；点击不进入 route、loading、toast 假成功或 gameplay。

Absent branches:

- multiplayer、ladder、online、replay、editor、store、social。
- fake map pool、custom map browser、race、hero、difficulty、team setup。
- campaign route、mission list、progress；当前只保留 disabled unimplemented marker。

Proof route:

- `tests/mode-select-placeholder-truth-contract.spec.ts`
- `tests/mode-select-disabled-branches-contract.spec.ts`
- `tests/menu-shell-mode-truth-contract.spec.ts`
- `tests/menu-shell-start-current-map-contract.spec.ts`
- `tests/menu-shell-map-source-truth.spec.ts`
- `tests/menu-primary-action-focus-contract.spec.ts`
- `tests/menu-action-availability-truth.spec.ts`
- `tests/secondary-shell-copy-truth-contract.spec.ts`
- `tests/shell-backstack-truth-contract.spec.ts`

Fake-support wording found: `no` for the current allowed V2 placeholder. The word `战役` appears only as disabled `未实现`; it must remain disabled or be removed if user/product review says far-future modes should be absent.

Remaining user judgment:

- Whether the disabled campaign tile is acceptable for private-playtest exposure or should become absent before broader sharing.
- Whether the label `遭遇战（已实现）` is clear enough when the actual live route remains `开始当前地图` from the menu.

Next split if rejected/deferred:

- `remove-far-mode-disabled-campaign-tile` if campaign must be absent.
- `mode-select-copy-truth-pass` if `遭遇战（已实现）` overstates the current single-path placeholder.
- `mode-select-disabled-branch-regression` only if focused tests fail or a disabled branch becomes actionable.
